import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token: tokenValue } = await params;

    if (!tokenValue || tokenValue.length < 10) {
      return NextResponse.json({ success: false, error: 'رابط التحميل غير صالح' }, { status: 400 });
    }

    const orders = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT "id", "items", "status" FROM "Order" WHERE "items" LIKE $1 ORDER BY "createdAt" DESC`,
      `%${tokenValue}%`
    );

    let found: { orderId: string; item: Record<string, unknown> } | null = null;
    for (const order of orders) {
      if (order.status !== 'paid') continue;
      const rawItems = order.items;
      let items: Array<Record<string, unknown>> = [];
      try {
        items = typeof rawItems === 'string' ? JSON.parse(rawItems) : (rawItems as Array<Record<string, unknown>>) || [];
      } catch {
        items = [];
      }
      const item = items.find((entry) => entry.token === tokenValue);
      if (item) {
        found = { orderId: order.id as string, item };
        break;
      }
    }

    if (!found) {
      return NextResponse.json({ success: false, error: 'رابط التحميل غير صالح أو الطلب غير مؤكد' }, { status: 404 });
    }

    const fileUrl = found.item.fileUrl as string;
    if (!fileUrl) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع الملف بعد. يرجى التواصل مع الدعم.' }, { status: 404 });
    }

    if (!found.item.downloaded) {
      const order = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT "items" FROM "Order" WHERE "id" = $1 LIMIT 1`, found.orderId
      );
      if (Array.isArray(order) && order.length > 0) {
        let allItems: Array<Record<string, unknown>> = [];
        try {
          allItems = typeof order[0].items === 'string' ? JSON.parse(order[0].items as string) : [];
        } catch {
          allItems = [];
        }
        let changed = false;
        for (const item of allItems) {
          if (item.token === tokenValue) {
            item.downloaded = true;
            item.downloadedAt = new Date().toISOString();
            changed = true;
            break;
          }
        }
        if (changed) {
          await db.$executeRawUnsafe(
            `UPDATE "Order" SET "items" = $1::text, "updatedAt" = NOW() WHERE "id" = $2`,
            JSON.stringify(allItems), found.orderId
          );
        }
      }
    }

    return NextResponse.redirect(new URL(fileUrl, request.url).toString());
  } catch (error) {
    logger.error('Error processing download:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء التحميل' }, { status: 500 });
  }
}
