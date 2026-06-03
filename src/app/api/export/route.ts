import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const zipPath = path.join(process.cwd(), 'public', 'downloads', 'sandak-store-v4.zip');
    try {
      await fs.access(zipPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'ملف التحميل غير متاح حالياً. حاول مرة أخرى لاحقاً.' },
        { status: 404 }
      );
    }

    const stat = await fs.stat(zipPath);
    const content = await fs.readFile(zipPath);

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="sandak-store-v4.zip"',
        'Content-Length': String(stat.size),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء التحميل' },
      { status: 500 }
    );
  }
}
