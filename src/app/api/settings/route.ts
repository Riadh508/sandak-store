import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    let settings = await db.storeSettings.findFirst();
    if (!settings) {
      settings = await db.storeSettings.create({
        data: {},
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    logger.error('Error fetching store settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    let settings = await db.storeSettings.findFirst();

    const data = {
      storeName: String(body.storeName || '').slice(0, 100),
      storeEmail: String(body.storeEmail || '').slice(0, 100),
      storePhone: String(body.storePhone || '').slice(0, 50),
      storeAddress: String(body.storeAddress || '').slice(0, 300),
      jeibPhone: String(body.jeibPhone || '').slice(0, 50),
      wuName: String(body.wuName || '').slice(0, 100),
      wuCity: String(body.wuCity || '').slice(0, 100),
      wuCountry: String(body.wuCountry || '').slice(0, 100),
      siteUrl: String(body.siteUrl || '').slice(0, 300),
      currency: String(body.currency || '').slice(0, 10),
      taxRate: body.taxRate !== undefined ? parseFloat(body.taxRate) : 15,
    };

    if (isNaN(data.taxRate) || data.taxRate < 0 || data.taxRate > 100) {
      data.taxRate = 15;
    }

    if (!settings) {
      settings = await db.storeSettings.create({ data });
    } else {
      settings = await db.storeSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    logger.error('Error updating store settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
