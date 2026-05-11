import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const invoices = await db.invoice.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { clientName, clientPhone, clientEmail, clientAddress, dueDate, taxRate, discount, discountType, notes, items } = body;

    if (!clientName) {
      return NextResponse.json({ success: false, error: 'اسم العميل مطلوب' }, { status: 400 });
    }

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().substring(0, 4).toUpperCase()}`;
    const itemsData = (items || []).map((item: { description: string; quantity: number; unitPrice: number }, idx: number) => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0),
      sortOrder: idx,
    }));

    const subtotal = itemsData.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
    const rate = taxRate ?? 15;
    const disc = discount ?? 0;
    const discType = discountType || 'fixed';
    const discountAmount = discType === 'percentage' ? subtotal * (disc / 100) : disc;
    const taxAmount = (subtotal - discountAmount) * (rate / 100);
    const total = subtotal - discountAmount + taxAmount;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        clientAddress: clientAddress || null,
        date: new Date(),
        dueDate: new Date(dueDate || Date.now() + 30 * 86400000),
        status: 'pending',
        taxRate: rate,
        discount: disc,
        discountType: discType,
        notes: notes || null,
        subtotal,
        taxAmount,
        total,
        items: { create: itemsData },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    logger.error('Error creating invoice:', error);
    return NextResponse.json({ success: false, error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Invoice ID is required' }, { status: 400 });
    }
    const invoice = await db.invoice.update({
      where: { id },
      data: { status: status || 'paid' },
    });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    logger.error('Error updating invoice:', error);
    return NextResponse.json({ success: false, error: 'Failed to update invoice' }, { status: 500 });
  }
}
