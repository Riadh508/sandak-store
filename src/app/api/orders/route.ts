import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth';
import { verifyTokenSafe, generateSecureToken } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    // Public lookup by orderNumber (used by /order/[orderNumber] page)
    if (orderNumber) {
      const safeNumber = String(orderNumber).slice(0, 60);
      const orders = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT "id", "orderNumber", "customerName", "customerPhone", "customerEmail",
                "paymentMethod", "items", "subtotal", "tax", "total", "status",
                "paymentRef", "verifiedAt", "verifiedBy", "notes",
                "createdAt", "updatedAt"
         FROM "Order" WHERE "orderNumber" = $1 LIMIT 1`,
        safeNumber
      );
      const order = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;
      if (!order) {
        return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
      }

      let downloads: Array<Record<string, unknown>> = [];
      try {
        downloads = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
          `SELECT "id", "token", "productName", "fileUrl", "fileName", "downloaded", "downloadedAt", "createdAt"
           FROM "DownloadToken" WHERE "orderId" = $1 ORDER BY "createdAt" ASC`,
          order.id as string
        );
      } catch (dlErr) {
        logger.warn('Failed to fetch downloads for order ' + (order.id as string) + ': ' + (dlErr instanceof Error ? dlErr.message : String(dlErr)));
      }

      return NextResponse.json({
        success: true,
        data: {
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
          downloads,
        },
      });
    }

    // Admin only: list all orders
    const auth = requireAdmin(request);
    if (auth) return auth;

    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = await Promise.all(orders.map(async (o) => {
      let downloads: Array<Record<string, unknown>> = [];
      try {
        downloads = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
          `SELECT "id", "token", "productName", "fileUrl", "fileName", "downloaded", "downloadedAt", "createdAt" FROM "DownloadToken" WHERE "orderId" = $1 ORDER BY "createdAt" ASC`,
          o.id as string,
        );
      } catch (dlErr) {
        logger.warn('Failed to fetch downloads for order ' + (o.id as string) + ': ' + (dlErr instanceof Error ? dlErr.message : String(dlErr)));
      }
      return {
        ...o,
        items: JSON.parse(o.items as string || '[]'),
        downloads,
      };
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { customerName, customerPhone, customerEmail, paymentMethod, items, subtotal, tax, total, paymentRef } = await request.json();

    if (!customerName || !customerPhone || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'البيانات المطلوبة ناقصة' }, { status: 400 });
    }

    const orderNumber = `ORD-${Date.now()}-${generateSecureToken(6).toUpperCase().replace(/[^A-Z0-9]/g, 'X')}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName: String(customerName).slice(0, 100),
        customerPhone: String(customerPhone).slice(0, 30),
        customerEmail: customerEmail ? String(customerEmail).slice(0, 200) : '',
        paymentMethod: String(paymentMethod).slice(0, 50),
        items: JSON.stringify(items),
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total) || 0,
        paymentRef: paymentRef ? String(paymentRef).slice(0, 200) : '',
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...order, items: JSON.parse(order.items) },
      message: `تم استلام طلبك رقم ${orderNumber} - سيتم التواصل معك بعد التأكد من الدفع`,
    });
  } catch (error) {
    logger.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    const auth = requireAdmin(request);
    if (auth) return auth;

    const body = await request.json();
    const { status, paymentRef, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = String(status).slice(0, 30);
    if (paymentRef !== undefined) updateData.paymentRef = String(paymentRef).slice(0, 200);
    if (notes !== undefined) updateData.notes = String(notes || '').slice(0, 1000);
    if (status === 'paid') {
      updateData.verifiedAt = new Date();
      const cookieHeader = request.headers.get('cookie') || '';
      const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
      const payload = tokenMatch ? verifyTokenSafe(tokenMatch[1]) : null;
      updateData.verifiedBy = (payload?.email as string) || 'admin';
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    // Auto-generate download tokens when marking as paid
    let tokens: Array<Record<string, unknown>> = [];
    if (status === 'paid') {
      try {
        const items = JSON.parse(order.items || '[]');
        for (const item of items) {
          const productName = item.name || item.product?.name || '';
          const productId = item.product?.id || item.id || '';

          let product: Record<string, unknown> | null = null;
          if (productId) {
            const byId = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
              `SELECT "id", "name", "fileUrl" FROM "Product" WHERE "id" = $1 LIMIT 1`, productId
            );
            if (Array.isArray(byId) && byId.length > 0) product = byId[0];
          }
          if (!product) {
            const byName = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
              `SELECT "id", "name", "fileUrl" FROM "Product" WHERE "name" = $1 LIMIT 1`, productName
            );
            if (Array.isArray(byName) && byName.length > 0) product = byName[0];
          }
          if (!product) {
            logger.warn(`TokenGen: Product not found for "${productName}" (id=${productId})`);
            continue;
          }

          const fileUrl = (product.fileUrl as string) || '';
          if (!fileUrl) {
            logger.warn(`TokenGen: Product "${productName}" has no fileUrl`);
            continue;
          }
          const fileName = fileUrl.split('/').pop() || productName;
          const tokenValue = generateSecureToken(40);

          const token = await db.downloadToken.create({
            data: {
              token: tokenValue,
              orderId: id,
              productId: product.id as string,
              productName,
              fileUrl,
              fileName,
            },
          });
          tokens.push(token);
        }
      } catch (genErr) {
        logger.error('TokenGen error:', genErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...order, items: JSON.parse(order.items || '[]'), downloads: tokens },
      message: tokens.length > 0 ? `تم إنشاء ${tokens.length} رابط تحميل` : undefined,
    });
  } catch (error) {
    logger.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ' }, { status: 500 });
  }
}
