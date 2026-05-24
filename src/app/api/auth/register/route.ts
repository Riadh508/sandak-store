import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, getTokenCookie } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'الرجاء ملء جميع الحقول' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'هذا الإيميل مسجل مسبقاً' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: { name, email, password: hashedPassword, role: 'admin' },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    response.headers.set('Set-Cookie', getTokenCookie(token));
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'حدث خطأ' }, { status: 500 });
  }
}