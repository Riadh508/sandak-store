import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  // Try owner role for DDL
  const ownerUrl = process.env.DATABASE_URL_UNPOOLED?.replace(
    'authenticator',
    'neondb_owner'
  ) || '';

  let prisma: PrismaClient | null = null;
  try {
    prisma = new PrismaClient({ datasourceUrl: ownerUrl });
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT NOT NULL DEFAULT ''`
    );
    await prisma.$disconnect();
    return NextResponse.json({ success: true, message: 'Column added via neondb_owner' });
  } catch (err) {
    if (prisma) await prisma.$disconnect();
    const msg = err instanceof Error ? err.message : String(err);
    // Fallback: try authenticator with direct connection
    try {
      const fallbackUrl = process.env.DATABASE_URL_UNPOOLED;
      prisma = new PrismaClient({ datasourceUrl: fallbackUrl });
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT NOT NULL DEFAULT ''`
      );
      await prisma.$disconnect();
      return NextResponse.json({ success: true, message: 'Column added via authenticator' });
    } catch (err2) {
      if (prisma) await prisma.$disconnect();
      const msg2 = err2 instanceof Error ? err2.message : String(err2);
      return NextResponse.json({ success: false, error: msg2 }, { status: 500 });
    }
  }
}
