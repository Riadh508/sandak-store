import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const tokenValue = params.token;

    if (!tokenValue || tokenValue.length < 10) {
      return NextResponse.json({ success: false, error: 'رابط التحميل غير صالح' }, { status: 400 });
    }

    const tokens = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT * FROM "DownloadToken" WHERE "token" = $1 LIMIT 1`, tokenValue
    );
    const token = Array.isArray(tokens) ? tokens[0] : null;
    if (!token) {
      return NextResponse.json({ success: false, error: 'رابط التحميل غير صالح أو منتهي الصلاحية' }, { status: 404 });
    }

    const fileUrl = token.fileUrl as string;
    if (!fileUrl) {
      return NextResponse.json({ success: false, error: 'لم يتم رفع الملف بعد. يرجى التواصل مع الدعم.' }, { status: 404 });
    }

    const publicPath = path.join(process.cwd(), 'public', fileUrl.replace(/^\//, ''));
    try {
      await fs.access(publicPath);
    } catch {
      logger.warn(`Download file missing: ${fileUrl} for token ${tokenValue}`);
      return NextResponse.json({
        success: false,
        error: 'الملف غير متوفر حالياً. يرجى التواصل مع الدعم الفني.',
        productName: token.productName,
      }, { status: 404 });
    }

    await db.$executeRawUnsafe(
      `UPDATE "DownloadToken" SET "downloaded" = true, "downloadedAt" = NOW() WHERE "id" = $1`,
      token.id as string,
    );

    return NextResponse.redirect(new URL(fileUrl, request.url).toString());
  } catch (error) {
    logger.error('Error processing download:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء التحميل' }, { status: 500 });
  }
}
