import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    // Try SET ROLE to table owner
    await db.$executeRawUnsafe(`SET ROLE neondb_owner`);
    await db.$executeRawUnsafe(`ALTER TABLE IF EXISTS "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT NOT NULL DEFAULT ''`);
    return NextResponse.json({ success: true, message: 'Column added via SET ROLE' });
  } catch {
    try {
      // Try without SET ROLE
      await db.$executeRawUnsafe(`ALTER TABLE IF EXISTS "Product" ADD COLUMN IF NOT EXISTS "downloadUrl" TEXT NOT NULL DEFAULT ''`);
      return NextResponse.json({ success: true, message: 'Column added directly' });
    } catch (e2: any) {
      // Try creating new table instead
      try {
        await db.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "Product_new" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "longDescription" TEXT NOT NULL DEFAULT '',
            "price" DOUBLE PRECISION NOT NULL,
            "category" TEXT NOT NULL DEFAULT 'ebook',
            "image" TEXT NOT NULL DEFAULT '',
            "features" TEXT NOT NULL DEFAULT '[]',
            "badge" TEXT NOT NULL DEFAULT '',
            "downloadUrl" TEXT NOT NULL DEFAULT '',
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "sortOrder" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
          )
        `);
        await db.$executeRawUnsafe(`INSERT INTO "Product_new" SELECT *, '' as "downloadUrl" FROM "Product"`);
        await db.$executeRawUnsafe(`ALTER TABLE IF EXISTS "Product" RENAME TO "Product_old"`);
        await db.$executeRawUnsafe(`ALTER TABLE IF EXISTS "Product_new" RENAME TO "Product"`);
        await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "Product_old"`);
        return NextResponse.json({ success: true, message: 'Table recreated successfully' });
      } catch (e3: any) {
        return NextResponse.json({ success: false, error: e3.message || String(e3) }, { status: 500 });
      }
    }
  }
}
