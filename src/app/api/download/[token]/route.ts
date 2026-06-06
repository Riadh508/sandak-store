import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

async function findTokenInOrders(tokenValue: string): Promise<{
  orderId: string;
  item: Record<string, unknown>;
} | null> {
  try {
    const orders = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT "id", "items" FROM "Order" WHERE "items" LIKE $1 ORDER BY "createdAt" DESC`,
      `%${tokenValue}%`
    );
    for (const order of orders) {
      const items = JSON.parse((order.items as string) || '[]');
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (item.token === tokenValue) {
          return { orderId: order.id as string, item };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token: tokenValue } = await params;

    if (!tokenValue || tokenValue.length < 10) {
      return NextResponse.json({ success: false, error: 'رابط التحميل غير صالح' }, { status: 400 });
    }

    const found = await findTokenInOrders(tokenValue);
    if (!found) {
      return NextResponse.json({ success: false, error: 'رابط التحميل غير صالح أو منتهي الصلاحية' }, { status: 404 });
    }

    const { orderId, item } = found;
    const fileUrl = item.fileUrl as string;
    if (!fileUrl) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع الملف بعد. يرجى التواصل مع الدعم.' }, { status: 404 });
    }

    // Mark token as downloaded in the order items
    if (!item.downloaded) {
      try {
        const order = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
          `SELECT "items" FROM "Order" WHERE "id" = $1 LIMIT 1`, orderId
        );
        if (Array.isArray(order) && order.length > 0) {
          const allItems = JSON.parse((order[0].items as string) || '[]');
          if (Array.isArray(allItems)) {
            for (const it of allItems) {
              if (it.token === tokenValue) {
                it.downloaded = true;
                it.downloadedAt = new Date().toISOString();
                break;
              }
            }
            await db.$executeRawUnsafe(
              `UPDATE "Order" SET "items" = $1::text WHERE "id" = $2`,
              JSON.stringify(allItems), orderId
            );
          }
        }
      } catch (markErr) {
        logger.warn('Failed to mark download token as used: ' + (markErr instanceof Error ? markErr.message : String(markErr)));
      }
    }

    return NextResponse.redirect(new URL(fileUrl, request.url).toString());
  } catch (error) {
    logger.error('Error processing download:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء التحميل' }, { status: 500 });
  }
}
