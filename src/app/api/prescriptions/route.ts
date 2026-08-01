import { NextResponse } from 'next/server';
import { db } from '@/db';
import { prescriptions, auditLogs } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: Request) {
  await ensureDbSeeded();
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');

  let list = await db.select().from(prescriptions).orderBy(desc(prescriptions.createdAt));
  if (patientId) {
    list = list.filter((p) => p.patientId === patientId);
  }

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `rx_${Date.now()}`;
    const all = await db.select().from(prescriptions);
    const code = `RX-2026-${900 + all.length + 1}`;

    const newRx = {
      id,
      prescriptionCode: code,
      appointmentId: body.appointmentId || null,
      patientId: body.patientId,
      patientName: body.patientName,
      patientAgeGender: body.patientAgeGender || '',
      doctorId: body.doctorId,
      doctorName: body.doctorName,
      diagnosis: body.diagnosis || 'Clinical Diagnosis',
      symptoms: body.symptoms || [],
      vitals: body.vitals || null,
      medications: body.medications || [],
      labTestsOrdered: body.labTestsOrdered || [],
      followUpDate: body.followUpDate || null,
      aiSafetyCheck: body.aiSafetyCheck || { flagged: false, warnings: [], summary: 'No critical drug alerts found.' },
      status: body.status || 'ISSUED',
      createdAt: new Date(),
    };

    await db.insert(prescriptions).values(newRx);

    await db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: body.doctorName || 'Attending Physician',
      userRole: 'DOCTOR',
      action: 'PRESCRIPTION_ISSUED',
      module: 'E-PRESCRIPTION',
      details: `Issued prescription ${code} for ${newRx.patientName}`,
      severity: 'INFO',
    });

    return NextResponse.json(newRx);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Prescription ID required' }, { status: 400 });

    const { id, ...updateFields } = body;
    await db.update(prescriptions).set(updateFields).where(eq(prescriptions.id, id));

    const updated = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
