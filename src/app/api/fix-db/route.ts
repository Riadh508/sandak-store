import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const steps: string[] = [];

  async function exec(sql: string) {
    try {
      await db.$executeRawUnsafe(sql);
      steps.push(`OK: ${sql.substring(0, 50)}`);
    } catch (e: any) {
      steps.push(`FAIL: ${sql.substring(0, 50)} => ${e.message}`);
    }
  }

  await exec(`SET ROLE neondb_owner`);
  await exec(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT NOT NULL DEFAULT ''`);

  // Check column now
  try {
    const rows: any = await db.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name='Product' AND column_name='downloadUrl'`
    );
    const hasColumn = rows && rows.length > 0;
    return NextResponse.json({ success: hasColumn, message: hasColumn ? 'Column exists now' : 'Column still missing', data: { steps, hasColumn } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, data: { steps } }, { status: 500 });
  }
}
