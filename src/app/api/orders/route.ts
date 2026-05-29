import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAdmin(request);
    if (auth) return auth;

    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = await Promise.all(orders.map(async (o) => {
      const downloads = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT "id", "token", "productName", "fileUrl", "fileName", "downloaded", "downloadedAt", "createdAt" FROM "DownloadToken" WHERE "orderId" = $1 ORDER BY "createdAt" ASC`,
        o.id as string,
      );
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

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        paymentMethod,
        items: JSON.stringify(items),
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total) || 0,
        paymentRef: paymentRef || '',
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

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    const token = request.headers.get('cookie')?.split('auth_token=')?.[1];
    const payload = token ? verifyToken(token.split(';')[0]) : null;

    if (!payload) {
      const apiKey = request.headers.get('x-api-key');
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { status, paymentRef } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentRef !== undefined) updateData.paymentRef = paymentRef;
    if (status === 'paid') {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = payload?.email || 'api';
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: { ...order, items: JSON.parse(order.items || '[]') },
    });
  } catch (error) {
    logger.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ' }, { status: 500 });
  }
}