import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const orderId = params.id;

    const orders = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT * FROM "Order" WHERE "id" = $1`, orderId
    );
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    const items = JSON.parse(order.items as string || '[]');
    const tokens: Array<Record<string, unknown>> = [];

    for (const item of items) {
      const productName = item.name || 'منتج';
      const products = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT "id", "fileUrl" FROM "Product" WHERE "name" = $1 LIMIT 1`, productName
      );
      const product = Array.isArray(products) ? products[0] : null;
      if (!product) continue;

      const fileUrl = (product.fileUrl as string) || '';
      const fileName = fileUrl.split('/').pop() || productName;

      const result = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `INSERT INTO "DownloadToken" ("id", "token", "orderId", "productId", "productName", "fileUrl", "fileName", "createdAt")
         VALUES (gen_random_uuid()::text, gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        orderId,
        product.id as string,
        productName,
        fileUrl,
        fileName,
      );
      const token = Array.isArray(result) ? result[0] : null;
      if (token) tokens.push(token);
    }

    return NextResponse.json({ success: true, data: tokens, message: `تم إنشاء ${tokens.length} رابط تحميل` });
  } catch (error) {
    logger.error('Error generating download tokens:', error);
    return NextResponse.json({ success: false, error: 'فشل في إنشاء روابط التحميل' }, { status: 500 });
  }
}
