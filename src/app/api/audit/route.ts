import { NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { desc } from 'drizzle-orm';

export async function GET() {
  await ensureDbSeeded();
  const list = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: body.userId || null,
      userName: body.userName || 'System User',
      userRole: body.userRole || 'ADMIN',
      action: body.action || 'SYSTEM_ACTION',
      module: body.module || 'SYSTEM',
      details: body.details || '',
      ipAddress: body.ipAddress || '10.0.0.1',
      severity: body.severity || 'INFO',
      createdAt: new Date(),
    };

    await db.insert(auditLogs).values(newLog);
    return NextResponse.json(newLog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
