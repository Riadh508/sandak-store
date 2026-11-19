import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, getTokenCookie } from '@/lib/auth-server';

const EMAIL_REGEX = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'الرجاء ملء جميع الحقول' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني غير صالح' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'هذا الإيميل مسجل مسبقاً' }, { status: 409 });
    }

    const adminCount = await db.user.count({ where: { role: 'admin' } });
    const isFirstAdmin = adminCount === 0;
    const providedAdminKey = typeof body.adminKey === 'string' ? body.adminKey : '';
    const validAdminKey = process.env.ADMIN_API_KEY || '';

    let assignedRole: 'admin' | 'user' = 'user';
    if (isFirstAdmin) assignedRole = 'admin';
    else if (validAdminKey && providedAdminKey === validAdminKey) assignedRole = 'admin';

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: { name: name.slice(0, 200), email, password: hashedPassword, role: assignedRole },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    response.headers.set('Set-Cookie', getTokenCookie(token));
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'حدث خطأ' }, { status: 500 });
  }
}
