import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';

export function requireAdmin(request: Request) {
  const envKey = process.env.ADMIN_API_KEY;

  // Method 1: Check x-api-key header (legacy)
  const apiKey = request.headers.get('x-api-key');
  if (envKey && apiKey && apiKey === envKey) {
    return null;
  }

  // Method 2: Check JWT cookie (new auth system)
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  if (tokenMatch) {
    const token = tokenMatch[1];
    const payload = verifyToken(token);
    if (payload && payload.role === 'admin') {
      return null;
    }
  }

  // If no ADMIN_API_KEY set (dev mode), allow
  if (!envKey) {
    return null;
  }

  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}
