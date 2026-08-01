import { NextResponse } from 'next/server';
import { db } from '@/db';
import { doctors } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDbSeeded();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const list = await db.select().from(doctors).where(eq(doctors.id, id));
    if (list.length === 0) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json(list[0]);
  }

  const list = await db.select().from(doctors);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `doc_${Date.now()}`;
    const count = (await db.select().from(doctors)).length + 1;
    const doctorCode = body.doctorCode || `DOC-10${count}`;

    const newDoctor = {
      id,
      doctorCode,
      fullName: body.fullName,
      specialty: body.specialty || 'General Medicine',
      department: body.department || 'Internal Medicine',
      qualification: body.qualification || 'MD',
      experienceYears: Number(body.experienceYears) || 5,
      consultationFee: Number(body.consultationFee) || 100,
      roomNumber: body.roomNumber || 'Suite 101',
      phone: body.phone || '+1 (555) 000-0000',
      email: body.email || `doc${count}@aegiscare.org`,
      schedule: body.schedule || { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
      status: body.status || 'AVAILABLE',
      rating: body.rating || 5.0,
      avatar: body.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    };

    await db.insert(doctors).values(newDoctor);
    return NextResponse.json(newDoctor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Doctor ID required' }, { status: 400 });

    const { id, ...updateFields } = body;
    await db.update(doctors).set(updateFields).where(eq(doctors.id, id));

    const updated = await db.select().from(doctors).where(eq(doctors.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
