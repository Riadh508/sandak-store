import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth';

// GET all products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const products = await db.product.findMany({
      where: showAll ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const formatted = products.map((p) => ({
      ...p,
      features: JSON.parse(p.features),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    logger.error('Error fetching products:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const {
      name,
      description,
      longDescription,
      price,
      category,
      image,
      features,
      badge,
      downloadUrl,
      isActive,
      sortOrder,
    } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'الاسم والوصف والسعر والفئة مطلوبة' },
        { status: 400 }
      );
    }

    const validCategories = ['ebook', 'software'];
    const sanitizedCategory = validCategories.includes(category) ? category : 'ebook';
    const sanitizedName = String(name).slice(0, 200);
    const sanitizedDesc = String(description).slice(0, 500);
    const sanitizedLongDesc = String(longDescription || '').slice(0, 2000);
    const sanitizedImage = String(image || '').slice(0, 500);
    const sanitizedBadge = String(badge || '').slice(0, 100);
    const sanitizedDownloadUrl = String(downloadUrl || '').slice(0, 500);
    const sanitizedFeatures = Array.isArray(features)
      ? features.map((f: unknown) => String(f).slice(0, 200)).slice(0, 50)
      : [];
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 999999) {
      return NextResponse.json({ success: false, error: 'السعر غير صالح' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name: sanitizedName,
        description: sanitizedDesc,
        longDescription: sanitizedLongDesc || '',
        price: parsedPrice,
        category: sanitizedCategory,
        image: sanitizedImage || '',
        features: JSON.stringify(sanitizedFeatures || []),
        badge: sanitizedBadge || '',
        downloadUrl: sanitizedDownloadUrl,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    logger.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const validCategories = ['ebook', 'software'];
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = String(data.name).slice(0, 200);
    if (data.description !== undefined) updateData.description = String(data.description).slice(0, 500);
    if (data.longDescription !== undefined) updateData.longDescription = String(data.longDescription).slice(0, 2000);
    if (data.price !== undefined) {
      const p = parseFloat(data.price);
      if (!isNaN(p) && p >= 0 && p <= 999999) updateData.price = p;
    }
    if (data.category !== undefined) updateData.category = validCategories.includes(data.category) ? data.category : 'ebook';
    if (data.image !== undefined) updateData.image = String(data.image).slice(0, 500);
    if (data.features !== undefined) updateData.features = JSON.stringify(
      (Array.isArray(data.features) ? data.features : []).map((f: unknown) => String(f).slice(0, 200)).slice(0, 50)
    );
    if (data.badge !== undefined) updateData.badge = String(data.badge).slice(0, 100);
    if (data.downloadUrl !== undefined) updateData.downloadUrl = String(data.downloadUrl).slice(0, 500);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const product = await db.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    logger.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}
