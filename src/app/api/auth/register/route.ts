import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, getTokenCookie } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const { name, email, password, adminKey } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'الرجاء ملء جميع الحقول' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'هذا الإيميل مسجل مسبقاً' }, { status: 409 });
    }

    const adminCount = await db.user.count({ where: { role: 'admin' } });
    const isFirstAdmin = adminCount === 0;
    const providedAdminKey = adminKey || '';
    const validAdminKey = process.env.ADMIN_API_KEY || '';

    let assignedRole: 'admin' | 'user' = 'user';
    if (isFirstAdmin) {
      assignedRole = 'admin';
    } else if (validAdminKey && providedAdminKey === validAdminKey) {
      assignedRole = 'admin';
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: { name, email, password: hashedPassword, role: assignedRole },
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