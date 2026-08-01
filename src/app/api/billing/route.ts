import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, auditLogs } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq, desc } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDbSeeded();
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');

  let list = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  if (patientId) {
    list = list.filter((inv) => inv.patientId === patientId);
  }

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `inv_${Date.now()}`;
    const all = await db.select().from(invoices);
    const code = `INV-2026-${700 + all.length + 1}`;

    const items = body.items || [];
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.amount || (item.unitCost || 0) * (item.quantity || 1)), 0);
    const discount = body.discount || 0;
    const tax = body.tax !== undefined ? body.tax : Math.round((subtotal - discount) * 0.05 * 100) / 100;
    const insuranceCoverage = body.insuranceCoverage || 0;
    const total = Math.max(0, subtotal - discount + tax - insuranceCoverage);
    const paidAmount = body.paidAmount || 0;
    const balanceDue = Math.max(0, total - paidAmount);

    let status = 'UNPAID';
    if (balanceDue === 0 && total > 0) status = 'PAID';
    else if (paidAmount > 0 && balanceDue > 0) status = 'PARTIALLY_PAID';

    const newInvoice = {
      id,
      invoiceCode: code,
      patientId: body.patientId,
      patientName: body.patientName,
      patientCode: body.patientCode || '',
      patientPhone: body.patientPhone || '',
      items,
      subtotal,
      discount,
      tax,
      insuranceCoverage,
      paidAmount,
      balanceDue,
      status,
      paymentMethod: body.paymentMethod || null,
      transactionReference: body.transactionReference || null,
      dueDate: body.dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    await db.insert(invoices).values(newInvoice);

    await db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: 'Billing Desk',
      userRole: 'ADMIN',
      action: 'INVOICE_GENERATED',
      module: 'BILLING',
      details: `Generated invoice ${code} for ${newInvoice.patientName} total $${total.toFixed(2)}`,
      severity: 'INFO',
    });

    return NextResponse.json(newInvoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });

    const { id, paymentAmount, paymentMethod, transactionReference } = body;

    const existing = await db.select().from(invoices).where(eq(invoices.id, id));
    if (existing.length === 0) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const inv = existing[0];
    const newPaidAmount = (inv.paidAmount || 0) + (paymentAmount || 0);
    const subtotal = inv.subtotal || 0;
    const discount = inv.discount || 0;
    const tax = inv.tax || 0;
    const insuranceCoverage = inv.insuranceCoverage || 0;
    const total = Math.max(0, subtotal - discount + tax - insuranceCoverage);
    const newBalance = Math.max(0, total - newPaidAmount);

    let status = inv.status;
    if (newBalance === 0) status = 'PAID';
    else if (newPaidAmount > 0) status = 'PARTIALLY_PAID';

    const updates: any = {
      paidAmount: newPaidAmount,
      balanceDue: newBalance,
      status,
    };
    if (paymentMethod) updates.paymentMethod = paymentMethod;
    if (transactionReference) updates.transactionReference = transactionReference;

    await db.update(invoices).set(updates).where(eq(invoices.id, id));

    await db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: 'Billing Cashier',
      userRole: 'RECEPTIONIST',
      action: 'PAYMENT_RECEIVED',
      module: 'BILLING',
      details: `Received $${paymentAmount} for Invoice ${inv.invoiceCode} via ${paymentMethod || 'CASH'}`,
      severity: 'INFO',
    });

    const updated = await db.select().from(invoices).where(eq(invoices.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
