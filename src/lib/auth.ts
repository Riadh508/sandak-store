import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import type { NextRequest } from 'next/server';

export function requireAdmin(request: Request | NextRequest) {
  const envKey = process.env.ADMIN_API_KEY;

  const apiKey = request.headers.get('x-api-key');
  if (envKey && apiKey && apiKey === envKey) {
    return null;
  }

  // try NextRequest cookies API first (works in app router)
  let token: string | null = null;

  try {
    // If request is a NextRequest it will have cookies.get
    // We use a safe access pattern to avoid runtime errors in plain Request
    if (typeof (request as any).cookies === 'object' && typeof (request as any).cookies.get === 'function') {
      const c = (request as any).cookies.get('auth_token');
      token = c?.value || null;
    } else {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/auth_token=([^;]+)/);
      token = match ? match[1] : null;
    }
  } catch (err) {
    token = null;
  }

  if (!token) {
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
