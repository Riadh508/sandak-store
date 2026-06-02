import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_API_KEY;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET or ADMIN_API_KEY must be set in production environment');
  }
  console.warn('⚠️  JWT_SECRET and ADMIN_API_KEY are not set. Auth will fail closed.');
}
const JWT_SECRET_FINAL = JWT_SECRET || crypto.randomBytes(32).toString('hex');
const TOKEN_EXPIRY = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; role: string }): string {
  if (!process.env.JWT_SECRET && !process.env.ADMIN_API_KEY) {
    throw new Error('Cannot sign tokens: JWT_SECRET/ADMIN_API_KEY not configured');
  }
  return jwt.sign(payload, JWT_SECRET_FINAL, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    if (!process.env.JWT_SECRET && !process.env.ADMIN_API_KEY) {
      return null;
    }
    return jwt.verify(token, JWT_SECRET_FINAL) as { userId: string; email: string; role: string };
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
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd ? ' Secure;' : '';
  return `auth_token=${token}; HttpOnly;${secure} Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function clearTokenCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const secure = isProd ? ' Secure;' : '';
  return `auth_token=; HttpOnly;${secure} Path=/; Max-Age=0; SameSite=Lax`;
}

export function generateSecureToken(length: number = 40): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

export function verifyTokenSafe(token: string): { email?: string; role?: string; userId?: string } | null {
  return verifyToken(token);
}