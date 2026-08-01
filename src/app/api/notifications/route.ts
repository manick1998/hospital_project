import { NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq, desc } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbSeeded();
  const list = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const id = body.id || `notif_${Date.now()}`;

    const newNotif = {
      id,
      timestamp: body.timestamp || 'Just now',
      title: body.title,
      message: body.message,
      type: body.type || 'INFO',
      read: false,
      link: body.link || null,
      targetRole: body.targetRole || 'ALL',
      createdAt: new Date(),
    };

    await db.insert(notifications).values(newNotif);
    return NextResponse.json(newNotif);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await db.update(notifications).set({ read: true });
      return NextResponse.json({ success: true });
    }

    if (id) {
      await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
