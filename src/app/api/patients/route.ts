import { NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, auditLogs } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq, desc } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDbSeeded();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const list = await db.select().from(patients).where(eq(patients.id, id));
    if (list.length === 0) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json(list[0]);
  }

  const list = await db.select().from(patients).orderBy(desc(patients.createdAt));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `pat_${Date.now()}`;
    const count = (await db.select().from(patients)).length + 1;
    const patientCode = body.patientCode || `PAT-${8000 + count}`;

    const newPatient = {
      id,
      patientCode,
      fullName: body.fullName || 'New Patient',
      dob: body.dob || '1990-01-01',
      gender: body.gender || 'Male',
      bloodGroup: body.bloodGroup || 'O+',
      phone: body.phone || '+1 (555) 000-0000',
      email: body.email || 'patient@example.com',
      address: body.address || 'Medical District',
      emergencyContact: body.emergencyContact || { name: 'Emergency Contact', relation: 'Family', phone: '+1 (555) 000-0000' },
      insurance: body.insurance || { provider: 'Self Pay', policyNumber: 'N/A', coverageLimit: 0, status: 'ACTIVE' },
      medicalHistory: body.medicalHistory || [],
      allergies: body.allergies || [],
      type: body.type || 'OPD',
      bedNumber: body.bedNumber || null,
      admittedAt: body.admittedAt || (body.type !== 'OPD' ? new Date().toLocaleString() : null),
      createdAt: new Date(),
    };

    await db.insert(patients).values(newPatient);

    // Audit log entry
    await db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: 'Reception Staff',
      userRole: 'RECEPTIONIST',
      action: 'PATIENT_REGISTERED',
      module: 'PATIENTS',
      details: `Registered new patient ${newPatient.fullName} (${newPatient.patientCode}) [${newPatient.type}]`,
      severity: 'INFO',
    });

    return NextResponse.json(newPatient);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });

    const { id, ...updateFields } = body;
    await db.update(patients).set(updateFields).where(eq(patients.id, id));

    const updated = await db.select().from(patients).where(eq(patients.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await ensureDbSeeded();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });

    await db.delete(patients).where(eq(patients.id, id));
    return NextResponse.json({ success: true, message: 'Patient removed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
