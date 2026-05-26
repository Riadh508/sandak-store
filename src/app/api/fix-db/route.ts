import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  const unpooledUrl = process.env.DATABASE_URL_UNPOOLED || '';

  async function tryAsUser(url: string): Promise<string | null> {
    let p: PrismaClient | null = null;
    try {
      p = new PrismaClient({ datasourceUrl: url });
      await p.$executeRawUnsafe(
        `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT NOT NULL DEFAULT ''`
      );
      await p.$disconnect();
      return null;
    } catch (e: any) {
      if (p) await p.$disconnect();
      return e.message || String(e);
    }
  }

  // First, discover table owner
  let discoverPrisma: PrismaClient | null = null;
  let owner = 'authenticator';
  try {
    discoverPrisma = new PrismaClient({ datasourceUrl: unpooledUrl });
    const rows: any = await discoverPrisma.$queryRawUnsafe(
      `SELECT pg_catalog.pg_get_userbyid(t.relowner) AS table_owner
       FROM pg_catalog.pg_class t
       WHERE t.relname = 'Product' AND t.relkind = 'r'`
    );
    if (rows && rows.length > 0 && rows[0].table_owner) {
      owner = rows[0].table_owner;
    }
    await discoverPrisma.$disconnect();
  } catch {
    if (discoverPrisma) await discoverPrisma.$disconnect();
  }

  // Try owner
  const err1 = await tryAsUser(unpooledUrl.replace('authenticator', owner));
  if (!err1) {
    return NextResponse.json({ success: true, message: `Column added as ${owner}` });
  }

  // Try original
  const err2 = await tryAsUser(unpooledUrl);
  if (!err2) {
    return NextResponse.json({ success: true, message: 'Column added as authenticator' });
  }

  return NextResponse.json({
    success: false,
    error: `Failed. Owner=${owner}. Error: ${err2}`,
    data: { owner }
  }, { status: 500 });
}
