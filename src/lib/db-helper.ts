import { seedDatabase } from '@/db/seed';

let isSeeded = false;

export async function ensureDbSeeded() {
  if (!isSeeded) {
    await seedDatabase();
    isSeeded = true;
  }
}
