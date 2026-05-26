import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const steps: string[] = [];

  async function exec(label: string, sql: string) {
    try {
      await db.$executeRawUnsafe(sql);
      steps.push(`OK ${label}`);
    } catch (e: any) {
      steps.push(`FAIL ${label}: ${e.message}`);
    }
  }

  // Check what we can do
  await exec('create_table', `CREATE TABLE IF NOT EXISTS "_sandak_test" (id TEXT PRIMARY KEY, val TEXT NOT NULL DEFAULT '')`);
  await exec('drop_test', `DROP TABLE IF EXISTS "_sandak_test"`);
  await exec('alter_table', `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT NOT NULL DEFAULT ''`);

  return NextResponse.json({ success: false, data: { steps } });
}
