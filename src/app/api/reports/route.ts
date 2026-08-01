import { NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, appointments, invoices, beds, doctors, inventory, labReports } from '@/db/schema';
import { ensureDbSeeded } from '@/lib/db-helper';

export async function GET() {
  await ensureDbSeeded();

  const allPatients = await db.select().from(patients);
  const allAppointments = await db.select().from(appointments);
  const allInvoices = await db.select().from(invoices);
  const allBeds = await db.select().from(beds);
  const allDoctors = await db.select().from(doctors);
  const allInventory = await db.select().from(inventory);
  const allLabs = await db.select().from(labReports);

  const totalPatients = allPatients.length;
  const opdPatients = allPatients.filter((p) => p.type === 'OPD').length;
  const ipdPatients = allPatients.filter((p) => p.type === 'IPD').length;
  const emergencyPatients = allPatients.filter((p) => p.type === 'EMERGENCY').length;

  const totalAppointments = allAppointments.length;
  const inProgressApts = allAppointments.filter((a) => a.status === 'IN_PROGRESS').length;

  const totalRevenue = allInvoices.reduce((acc, inv) => acc + (inv.subtotal || 0) - (inv.discount || 0) + (inv.tax || 0), 0);
  const paidRevenue = allInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const pendingRevenue = allInvoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

  const occupiedBeds = allBeds.filter((b) => b.status === 'OCCUPIED').length;
  const totalBeds = allBeds.length;
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const lowStockItems = allInventory.filter((i) => i.stockQuantity <= i.reorderLevel).length;

  const criticalLabs = allLabs.filter((l) => l.status === 'CRITICAL_ALERT').length;

  // Department breakdown
  const deptCount: Record<string, number> = {};
  allDoctors.forEach((doc) => {
    deptCount[doc.department] = (deptCount[doc.department] || 0) + 1;
  });

  return NextResponse.json({
    kpis: {
      totalPatients,
      opdPatients,
      ipdPatients,
      emergencyPatients,
      totalAppointments,
      inProgressApts,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      occupiedBeds,
      totalBeds,
      bedOccupancyRate,
      lowStockItems,
      criticalLabs,
    },
    departmentBreakdown: deptCount,
  });
}
