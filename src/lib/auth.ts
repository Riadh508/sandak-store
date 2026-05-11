import { NextResponse } from 'next/server';

export function requireAdmin(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  const envKey = process.env.ADMIN_API_KEY;

  if (!envKey) {
    // If no key configured, allow (dev mode)
    return null;
  }

  if (!apiKey || apiKey !== envKey) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
