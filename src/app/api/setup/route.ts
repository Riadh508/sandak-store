import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = requireAdmin(request);
    const isAdmin = !authResult;
    return NextResponse.json({
      success: true,
      message: 'System is running',
      data: { isAdmin },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Database not initialized',
      data: { isAdmin: false },
    });
  }
}
