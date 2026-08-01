import { NextResponse } from 'next/server';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq } from 'drizzle-orm';

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbSeeded();
  const list = await db.select().from(settings).where(eq(settings.id, 'default_setting'));
  if (list.length === 0) {
    return NextResponse.json({});
  }
  return NextResponse.json(list[0]);
}

export async function PUT(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    await db.update(settings).set({
      ...fields,
      updatedAt: new Date(),
    }).where(eq(settings.id, 'default_setting'));

    const updated = await db.select().from(settings).where(eq(settings.id, 'default_setting'));
    return NextResponse.json(updated[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
