import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth';
import { generateSecureToken } from '@/lib/auth-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    if (showAll) {
      const auth = requireAdmin(request as import('next/server').NextRequest);
      if (auth) return auth;
    }

    const whereClause = showAll ? '' : 'WHERE "isActive" = true';
    const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT "id", "name", "description", "longDescription", "price", "category", "image", "features", "badge", "fileUrl", "fileSize", "isActive", "sortOrder", "createdAt", "updatedAt" FROM "Product" ${whereClause} ORDER BY "sortOrder" ASC`
    );

    const formatted = rows.map((product) => {
      let features: unknown = product.features;
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch {
          features = [];
        }
      }
      if (!Array.isArray(features)) features = [];
      return { ...product, features };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    logger.error('Error fetching products:', error);
    const msg = error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل المنتجات';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAdmin(request as import('next/server').NextRequest);
  if (auth) return auth;

  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const category = body.category === 'software' ? 'software' : 'ebook';
    const parsedPrice = parseFloat(body.price);

    if (!name || !description || !body.category || Number.isNaN(parsedPrice)) {
      return NextResponse.json({ success: false, error: 'الاسم والوصف والسعر والفئة مطلوبة' }, { status: 400 });
    }
    if (parsedPrice < 0 || parsedPrice > 999999) {
      return NextResponse.json({ success: false, error: 'السعر غير صالح' }, { status: 400 });
    }

    const sanitizedFeatures = Array.isArray(body.features)
      ? body.features.map((item: unknown) => String(item).slice(0, 200)).slice(0, 50)
      : [];
    const productId = `c${Date.now().toString(36)}${generateSecureToken(16).toLowerCase()}`.slice(0, 25);

    const product = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `INSERT INTO "Product" ("id", "name", "description", "longDescription", "price", "category", "image", "features", "badge", "fileUrl", "fileSize", "isActive", "sortOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING *`,
      productId,
      name.slice(0, 200),
      description.slice(0, 500),
      String(body.longDescription || '').slice(0, 2000),
      parsedPrice,
      category,
      String(body.image || '').slice(0, 500),
      JSON.stringify(sanitizedFeatures),
      String(body.badge || '').slice(0, 100),
      String(body.fileUrl || '').slice(0, 500),
      parseInt(body.fileSize) || 0,
      body.isActive !== undefined ? body.isActive === true : true,
      Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0
    );

    return NextResponse.json({ success: true, data: product[0] || product }, { status: 201 });
  } catch (error) {
    logger.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = requireAdmin(request as import('next/server').NextRequest);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    if (data.name !== undefined) { sets.push(`"name" = $${index++}`); values.push(String(data.name).trim().slice(0, 200)); }
    if (data.description !== undefined) { sets.push(`"description" = $${index++}`); values.push(String(data.description).trim().slice(0, 500)); }
    if (data.longDescription !== undefined) { sets.push(`"longDescription" = $${index++}`); values.push(String(data.longDescription).slice(0, 2000)); }
    if (data.price !== undefined) {
      const price = parseFloat(data.price);
      if (Number.isNaN(price) || price < 0 || price > 999999) {
        return NextResponse.json({ success: false, error: 'السعر غير صالح' }, { status: 400 });
      }
      sets.push(`"price" = $${index++}`); values.push(price);
    }
    if (data.category !== undefined) { sets.push(`"category" = $${index++}`); values.push(data.category === 'software' ? 'software' : 'ebook'); }
    if (data.image !== undefined) { sets.push(`"image" = $${index++}`); values.push(String(data.image).slice(0, 500)); }
    if (data.features !== undefined) { sets.push(`"features" = $${index++}`); values.push(JSON.stringify(Array.isArray(data.features) ? data.features.map((item: unknown) => String(item).slice(0, 200)).slice(0, 50) : [])); }
    if (data.badge !== undefined) { sets.push(`"badge" = $${index++}`); values.push(String(data.badge).slice(0, 100)); }
    if (data.isActive !== undefined) { sets.push(`"isActive" = $${index++}`); values.push(data.isActive === true); }
    if (data.sortOrder !== undefined) { sets.push(`"sortOrder" = $${index++}`); values.push(Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : 0); }
    if (data.fileUrl !== undefined) { sets.push(`"fileUrl" = $${index++}`); values.push(String(data.fileUrl).slice(0, 500)); }
    if (data.fileSize !== undefined) { const fileSize = parseInt(data.fileSize); if (!Number.isNaN(fileSize)) { sets.push(`"fileSize" = $${index++}`); values.push(fileSize); } }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    sets.push('"updatedAt" = NOW()');
    values.push(id);
    const result = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `UPDATE "Product" SET ${sets.join(', ')} WHERE "id" = $${index} RETURNING *`,
      ...values
    );

    if (!result.length) {
      return NextResponse.json({ success: false, error: 'المنتج غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    logger.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = requireAdmin(request as import('next/server').NextRequest);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const result = await db.$executeRawUnsafe(`DELETE FROM "Product" WHERE "id" = $1`, id);
    if (result === 0) {
      return NextResponse.json({ success: false, error: 'المنتج غير موجود' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
