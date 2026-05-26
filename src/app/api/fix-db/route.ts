import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    await db.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT NOT NULL DEFAULT ''`);
    return NextResponse.json({ success: true, message: 'Column downloadUrl added successfully' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
