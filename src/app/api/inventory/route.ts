import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventory, auditLogs } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbSeeded();
  const list = await db.select().from(inventory);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `inv_item_${Date.now()}`;
    const all = await db.select().from(inventory);
    const code = body.itemCode || `MED-ITEM-${100 + all.length + 1}`;

    const qty = Number(body.stockQuantity) || 0;
    const reorder = Number(body.reorderLevel) || 50;
    let status = 'IN_STOCK';
    if (qty <= 0) status = 'OUT_OF_STOCK';
    else if (qty <= reorder) status = 'LOW_STOCK';

    const newItem = {
      id,
      itemCode: code,
      itemName: body.itemName,
      category: body.category || 'General Supplies',
      stockQuantity: qty,
      unit: body.unit || 'Units',
      reorderLevel: reorder,
      unitPrice: Number(body.unitPrice) || 1.0,
      supplier: body.supplier || 'Medical Global Supplier',
      batchNumber: body.batchNumber || `B2026-${Math.floor(Math.random() * 899 + 100)}`,
      expiryDate: body.expiryDate || '2027-12-31',
      location: body.location || 'Central Pharmacy Store',
      status,
      createdAt: new Date(),
    };

    await db.insert(inventory).values(newItem);
    return NextResponse.json(newItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });

    const { id, restockQty, ...fields } = body;

    const existing = await db.select().from(inventory).where(eq(inventory.id, id));
    if (existing.length === 0) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const item = existing[0];
    let newQty = item.stockQuantity;
    if (restockQty !== undefined) {
      newQty += Number(restockQty);
    } else if (fields.stockQuantity !== undefined) {
      newQty = Number(fields.stockQuantity);
    }

    let status = fields.status || item.status;
    if (newQty <= 0) status = 'OUT_OF_STOCK';
    else if (newQty <= item.reorderLevel) status = 'LOW_STOCK';
    else status = 'IN_STOCK';

    const updates = {
      ...fields,
      stockQuantity: newQty,
      status,
    };

    await db.update(inventory).set(updates).where(eq(inventory.id, id));

    if (restockQty) {
      await db.insert(auditLogs).values({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userName: 'Pharmacist Desk',
        userRole: 'PHARMACIST',
        action: 'INVENTORY_RESTOCKED',
        module: 'INVENTORY',
        details: `Restocked ${item.itemName} (+${restockQty} ${item.unit}). New total: ${newQty}`,
        severity: 'INFO',
      });
    }

    const updated = await db.select().from(inventory).where(eq(inventory.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
