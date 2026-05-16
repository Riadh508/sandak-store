import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;
  return NextResponse.json({ success: true });
}
