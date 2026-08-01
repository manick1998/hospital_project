import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';
import { eq } from 'drizzle-orm';

export async function GET() {
  await ensureDbSeeded();
  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}

export async function POST(req: Request) {
  await ensureDbSeeded();
  try {
    const body = await req.json();
    const { email, role } = body;

    let user;
    if (email) {
      const found = await db.select().from(users).where(eq(users.email, email));
      if (found.length > 0) user = found[0];
    }

    if (!user && role) {
      const foundRole = await db.select().from(users).where(eq(users.role, role));
      if (foundRole.length > 0) user = foundRole[0];
    }

    if (!user) {
      const allUsers = await db.select().from(users);
      user = allUsers[0];
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
