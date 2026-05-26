import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    await db.$executeRawUnsafe(`DELETE FROM "Product"`);

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
