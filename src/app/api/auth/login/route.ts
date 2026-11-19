import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken, getTokenCookie } from '@/lib/auth-server';

const EMAIL_REGEX = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'الرجاء ملء جميع الحقول' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'الحساب غير مفعل' }, { status: 403 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'هذا الحساب ليس حساب أدمن' }, { status: 403 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    response.headers.set('Set-Cookie', getTokenCookie(token));
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 });
  }
}
