import { NextResponse } from 'next/server';
import { db } from '@/db';
import { beds, patients, auditLogs } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbSeeded();
  const list = await db.select().from(beds);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `bed_${Date.now()}`;

    const newBed = {
      id,
      bedNumber: body.bedNumber,
      ward: body.ward || 'General Ward',
      floorNumber: Number(body.floorNumber) || 1,
      status: body.status || 'AVAILABLE',
      dailyRate: Number(body.dailyRate) || 300,
      createdAt: new Date(),
    };

    await db.insert(beds).values(newBed);
    return NextResponse.json(newBed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const { id, action, patientId, patientName } = body;

    if (!id) return NextResponse.json({ error: 'Bed ID required' }, { status: 400 });

    const existing = await db.select().from(beds).where(eq(beds.id, id));
    if (existing.length === 0) return NextResponse.json({ error: 'Bed not found' }, { status: 404 });
    const currentBed = existing[0];

    if (action === 'ADMIT') {
      const updates = {
        status: 'OCCUPIED',
        patientId: patientId || null,
        patientName: patientName || 'Admitted Patient',
        admittedAt: new Date().toLocaleString(),
      };
      await db.update(beds).set(updates).where(eq(beds.id, id));

      if (patientId) {
        await db.update(patients).set({
          type: 'IPD',
          bedNumber: currentBed.bedNumber,
          admittedAt: new Date().toLocaleString(),
        }).where(eq(patients.id, patientId));
      }

      await db.insert(auditLogs).values({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userName: 'Nursing Station',
        userRole: 'NURSE',
        action: 'PATIENT_ADMITTED',
        module: 'NURSING',
        details: `Admitted patient ${patientName || patientId} to ${currentBed.bedNumber} (${currentBed.ward})`,
        severity: 'INFO',
      });
    } else if (action === 'DISCHARGE') {
      const updates = {
        status: 'AVAILABLE',
        patientId: null,
        patientName: null,
        admittedAt: null,
      };
      await db.update(beds).set(updates).where(eq(beds.id, id));

      if (currentBed.patientId) {
        await db.update(patients).set({
          type: 'OPD',
          bedNumber: null,
          admittedAt: null,
        }).where(eq(patients.id, currentBed.patientId));
      }

      await db.insert(auditLogs).values({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userName: 'Nursing Station',
        userRole: 'NURSE',
        action: 'PATIENT_DISCHARGED',
        module: 'NURSING',
        details: `Discharged patient from ${currentBed.bedNumber} (${currentBed.ward})`,
        severity: 'INFO',
      });
    } else {
      const { action: _, ...fields } = body;
      await db.update(beds).set(fields).where(eq(beds.id, id));
    }

    const updated = await db.select().from(beds).where(eq(beds.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
