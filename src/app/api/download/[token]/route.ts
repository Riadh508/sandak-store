import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const tokenValue = params.token;

    const tokens = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT * FROM "DownloadToken" WHERE "token" = $1 LIMIT 1`, tokenValue
    );
    const token = Array.isArray(tokens) ? tokens[0] : null;
    if (!token) {
      return NextResponse.json({ success: false, error: 'رابط التحميل غير صالح' }, { status: 404 });
    }

    const fileUrl = token.fileUrl as string;
    if (!fileUrl) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع الملف بعد' }, { status: 404 });
    }

    await db.$executeRawUnsafe(
      `UPDATE "DownloadToken" SET "downloaded" = true, "downloadedAt" = NOW() WHERE "id" = $1`,
      token.id as string,
    );

    return NextResponse.redirect(fileUrl);
  } catch (error) {
    logger.error('Error processing download:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ' }, { status: 500 });
  }
}
