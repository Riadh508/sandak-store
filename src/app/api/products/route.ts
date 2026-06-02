import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth';
import { generateSecureToken } from '@/lib/auth-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const whereClause = showAll ? '' : 'WHERE "isActive" = true';
    const rows = await db.$queryRawUnsafe<
      Array<Record<string, unknown>>
    >(`SELECT "id", "name", "description", "longDescription", "price", "category", "image", "features", "badge", "fileUrl", "fileSize", "isActive", "sortOrder", "createdAt", "updatedAt" FROM "Product" ${whereClause} ORDER BY "sortOrder" ASC`);

    const formatted = rows.map((p) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features as string) : p.features,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    logger.error('Error fetching products:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { name, description, longDescription, price, category, image, features, badge, fileUrl, fileSize, isActive, sortOrder } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json({ success: false, error: 'الاسم والوصف والسعر والفئة مطلوبة' }, { status: 400 });
    }

    const validCategories = ['ebook', 'software'];
    const sanitizedCategory = validCategories.includes(category) ? category : 'ebook';
    const sanitizedFeatures = Array.isArray(features) ? features.map((f: unknown) => String(f).slice(0, 200)).slice(0, 50) : [];
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 999999) {
      return NextResponse.json({ success: false, error: 'السعر غير صالح' }, { status: 400 });
    }

    const productId = `c${Date.now().toString(36)}${generateSecureToken(16).toLowerCase()}`.slice(0, 25);
    const product = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `INSERT INTO "Product" ("id", "name", "description", "longDescription", "price", "category", "image", "features", "badge", "fileUrl", "fileSize", "isActive", "sortOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING *`,
      productId,
      String(name).slice(0, 200),
      String(description).slice(0, 500),
      String(longDescription || '').slice(0, 2000),
      parsedPrice,
      sanitizedCategory,
      String(image || '').slice(0, 500),
      JSON.stringify(sanitizedFeatures),
      String(badge || '').slice(0, 100),
      String(fileUrl || '').slice(0, 500),
      parseInt(fileSize) || 0,
      isActive !== undefined ? isActive : true,
      sortOrder || 0,
    );

    const created = product[0] || product;
    return NextResponse.json({ success: true, data: { ...created } }, { status: 201 });
  } catch (error) {
    logger.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) { sets.push(`"name" = $${idx++}`); values.push(String(data.name).slice(0, 200)); }
    if (data.description !== undefined) { sets.push(`"description" = $${idx++}`); values.push(String(data.description).slice(0, 500)); }
    if (data.longDescription !== undefined) { sets.push(`"longDescription" = $${idx++}`); values.push(String(data.longDescription).slice(0, 2000)); }
    if (data.price !== undefined) { const p = parseFloat(data.price); if (!isNaN(p) && p >= 0 && p <= 999999) { sets.push(`"price" = $${idx++}`); values.push(p); } }
    if (data.category !== undefined) { const cat = ['ebook', 'software'].includes(data.category) ? data.category : 'ebook'; sets.push(`"category" = $${idx++}`); values.push(cat); }
    if (data.image !== undefined) { sets.push(`"image" = $${idx++}`); values.push(String(data.image).slice(0, 500)); }
    if (data.features !== undefined) { sets.push(`"features" = $${idx++}`); values.push(JSON.stringify(Array.isArray(data.features) ? data.features : [])); }
    if (data.badge !== undefined) { sets.push(`"badge" = $${idx++}`); values.push(String(data.badge).slice(0, 100)); }
    if (data.isActive !== undefined) { sets.push(`"isActive" = $${idx++}`); values.push(data.isActive); }
    if (data.sortOrder !== undefined) { sets.push(`"sortOrder" = $${idx++}`); values.push(data.sortOrder); }
    if (data.fileUrl !== undefined) { sets.push(`"fileUrl" = $${idx++}`); values.push(String(data.fileUrl).slice(0, 500)); }
    if (data.fileSize !== undefined) { const fs = parseInt(data.fileSize); if (!isNaN(fs)) { sets.push(`"fileSize" = $${idx++}`); values.push(fs); } }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    sets.push(`"updatedAt" = NOW()`);
    values.push(id);

    const result = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `UPDATE "Product" SET ${sets.join(', ')} WHERE "id" = $${idx} RETURNING *`,
      ...values,
    );

    const updated = result[0] || result;
    return NextResponse.json({ success: true, data: { ...updated } });
  } catch (error) {
    logger.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    await db.$executeRawUnsafe(`DELETE FROM "Product" WHERE "id" = $1`, id);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
