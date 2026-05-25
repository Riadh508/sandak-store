import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'التصدير متاح فقط في بيئة التطوير المحلية' },
    { status: 400 }
  );
}
