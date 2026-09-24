import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';

export function requireAdmin(request: Request) {
  const envKey = process.env.ADMIN_API_KEY;

  const apiKey = request.headers.get('x-api-key');
  if (envKey && apiKey && apiKey === envKey) {
    return null;
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);

  if (!tokenMatch) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        reason: 'no_cookie',
        message: 'Auth cookie not found. Please login as admin or provide x-api-key header.',
      },
      { status: 401 }
    );
  }

  const token = tokenMatch[1];
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        reason: 'invalid_token',
        message: 'Auth token invalid or expired. Please login again.',
      },
      { status: 401 }
    );
  }

  if (payload.role !== 'admin') {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        reason: 'insufficient_role',
        message: 'Admin role required.',
      },
      { status: 403 }
    );
  }

  return null;
}
