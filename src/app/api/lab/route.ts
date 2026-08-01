import { NextResponse } from 'next/server';
import { db } from '@/db';
import { labReports, auditLogs } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq, desc } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDbSeeded();
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');

  let list = await db.select().from(labReports).orderBy(desc(labReports.createdAt));
  if (patientId) {
    list = list.filter((l) => l.patientId === patientId);
  }

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `lab_${Date.now()}`;
    const all = await db.select().from(labReports);
    const code = `LAB-2026-${300 + all.length + 1}`;

    const newReport = {
      id,
      reportCode: code,
      patientId: body.patientId,
      patientName: body.patientName,
      doctorId: body.doctorId || null,
      doctorName: body.doctorName || null,
      testName: body.testName || 'Diagnostic Panel',
      testCategory: body.testCategory || 'General Laboratory',
      specimenType: body.specimenType || 'Blood',
      collectedAt: body.collectedAt || new Date().toLocaleString(),
      reportedAt: body.reportedAt || null,
      status: body.status || 'ORDERED',
      results: body.results || [],
      technicianNotes: body.technicianNotes || '',
      technicianName: body.technicianName || 'Laboratory Staff',
      createdAt: new Date(),
    };

    await db.insert(labReports).values(newReport);
    return NextResponse.json(newReport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Lab Report ID required' }, { status: 400 });

    const { id, ...updateFields } = body;

    // Check if critical alert status
    if (updateFields.status === 'CRITICAL_ALERT') {
      await db.insert(auditLogs).values({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userName: updateFields.technicianName || 'Lab Technician',
        userRole: 'LAB_TECH',
        action: 'CRITICAL_LAB_FLAG',
        module: 'LABORATORY',
        details: `Critical result flagged for report ${id}`,
        severity: 'CRITICAL',
      });
    }

    await db.update(labReports).set(updateFields).where(eq(labReports.id, id));
    const updated = await db.select().from(labReports).where(eq(labReports.id, id));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
