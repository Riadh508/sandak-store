import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, signToken, getTokenCookie } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'الرجاء ملء جميع الحقول' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'الإيميل أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'الحساب غير مفعل' }, { status: 403 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'الإيميل أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

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