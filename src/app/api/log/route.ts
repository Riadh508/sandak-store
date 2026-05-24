import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { level, message, data } = await request.json();
    if (process.env.NODE_ENV === 'development') {
      console[level]?.(`[LOG] ${message}`, data || '');
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
