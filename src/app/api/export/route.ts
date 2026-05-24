import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.env',
  '.next',
  '.vercel',
  'dist',
  'out',
];

const EMPTY_SEED_CONTENT = `import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    await db.product.deleteMany({});

    const existingSettings = await db.storeSettings.findFirst();
    if (!existingSettings) {
      await db.storeSettings.create({
        data: {},
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء قاعدة بيانات فارغة',
    });
  } catch (error) {
    logger.error('Error seeding empty database:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed empty database' }, { status: 500 });
  }
}
`;

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    if ('status' in (user as object)) {
      return user as NextResponse;
    }

    if ((user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'غير مصرح - يتطلب صلاحية المدير' }, { status: 403 });
    }

    const projectRoot = path.resolve(process.cwd());
    const tempDir = path.resolve(process.cwd(), '.tmp-export');
    const archivePath = path.join(tempDir, 'sandak-store-v4.tar.gz');
    const seedFilePath = path.join(projectRoot, 'src', 'app', 'api', 'products', 'seed', 'route.ts');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const originalSeedContent = fs.readFileSync(seedFilePath, 'utf-8');

    fs.writeFileSync(seedFilePath, EMPTY_SEED_CONTENT, 'utf-8');

    try {
      const excludeArgs = EXCLUDE_PATTERNS.map((p) => `--exclude=${p}`).join(' ');
      const command = `tar -czf "${archivePath}" ${excludeArgs} -C "${projectRoot}" .`;

      await execAsync(command);

      const stats = fs.statSync(archivePath);
      const fileBuffer = fs.readFileSync(archivePath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/gzip',
          'Content-Disposition': 'attachment; filename="sandak-store-v4.zip"',
          'Content-Length': stats.size.toString(),
        },
      });
    } finally {
      fs.writeFileSync(seedFilePath, originalSeedContent, 'utf-8');

      if (fs.existsSync(archivePath)) {
        fs.unlinkSync(archivePath);
      }
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تصدير المتجر' },
      { status: 500 }
    );
  }
}
