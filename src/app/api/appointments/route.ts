import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, auditLogs } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq, desc } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDbSeeded();
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  const doctorId = searchParams.get('doctorId');

  let list = await db.select().from(appointments).orderBy(desc(appointments.createdAt));

  if (patientId) {
    list = list.filter((a) => a.patientId === patientId);
  }
  if (doctorId) {
    list = list.filter((a) => a.doctorId === doctorId);
  }

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `apt_${Date.now()}`;
    const all = await db.select().from(appointments);
    const code = `APT-2026-${100 + all.length + 1}`;
    const queueToken = all.filter((a) => a.date === (body.date || new Date().toISOString().split('T')[0])).length + 1;

    const newApt = {
      id,
      appointmentCode: code,
      patientId: body.patientId,
      patientName: body.patientName,
      patientPhone: body.patientPhone || '',
      doctorId: body.doctorId,
      doctorName: body.doctorName,
      department: body.department || 'General',
      date: body.date || new Date().toISOString().split('T')[0],
      timeSlot: body.timeSlot || '09:00 AM',
      type: body.type || 'OPD Consultation',
      status: body.status || 'SCHEDULED',
      queueToken,
      reason: body.reason || 'General Health Consultation',
      vitals: body.vitals || null,
      createdAt: new Date(),
    };

    await db.insert(appointments).values(newApt);

    await db.insert(auditLogs).values({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: 'System / Reception',
      userRole: 'RECEPTIONIST',
      action: 'APPOINTMENT_BOOKED',
      module: 'APPOINTMENTS',
      details: `Booked appointment ${code} for ${newApt.patientName} with ${newApt.doctorName} (Token #${queueToken})`,
      severity: 'INFO',
    });

    return NextResponse.json(newApt);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });

    const { id, ...updateFields } = body;
    await db.update(appointments).set(updateFields).where(eq(appointments.id, id));

    const updated = await db.select().from(appointments).where(eq(appointments.id, id));
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
    if (!id) return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });

    await db.delete(appointments).where(eq(appointments.id, id));
    return NextResponse.json({ success: true, message: 'Appointment cancelled' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
