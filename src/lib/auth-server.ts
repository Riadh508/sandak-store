import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_API_KEY || 'sandak-secret-key-2026';
const TOKEN_EXPIRY = '999y';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const cookie = request.cookies.get('auth_token');
  return cookie?.value || null;
}

export function requireAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
  }
  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
  }
  return user;
}

export function getTokenCookie(token: string): string {
  return `auth_token=${token}; HttpOnly; Path=/; Max-Age=${999 * 365 * 24 * 60 * 60}; SameSite=Lax`;
}

export function clearTokenCookie(): string {
  return 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax';
}