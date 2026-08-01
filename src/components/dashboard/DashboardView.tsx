'use client';

import React from 'react';
import {
  Users,
  BedDouble,
  CalendarCheck,
  DollarSign,
  AlertOctagon,
  AlertTriangle,
  Plus,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { Patient, Doctor, Appointment, Bed, InventoryItem, LabReport } from '@/services/api';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardViewProps {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  beds: Bed[];
  inventory: InventoryItem[];
  labs: LabReport[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAi: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  doctors,
  appointments,
  beds,
  inventory,
  labs,
  onNavigate,
  onOpenAi,
}) => {
  const totalPatients = patients.length;
  const ipdPatients = patients.filter((p) => p.type === 'IPD').length;
  const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
  const totalBeds = beds.length;
  const bedOccupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const todayApts = appointments.length;
  const inProgressApts = appointments.filter((a) => a.status === 'IN_PROGRESS').length;

  const lowStockCount = inventory.filter((i) => i.stockQuantity <= i.reorderLevel).length;
  const criticalLabsCount = labs.filter((l) => l.status === 'CRITICAL_ALERT').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Banner / Hero */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/20 p-6 overflow-hidden shadow-xl shadow-cyan-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                Hospital Command Center
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Welcome to AegisCare Health Dashboard
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1">
              Real-time clinical queue tracking, IPD bed occupancy telemetry, pharmacy supply reorder alerts, and automated AI diagnostic support.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onOpenAi}
              className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 flex items-center gap-2 shadow-lg shadow-purple-950 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>AI Diagnostic Assistant</span>
            </button>
            <button
              onClick={() => onNavigate('appointments')}
              className="px-4 py-2.5 rounded-2xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patients KPI */}
        <div
          onClick={() => onNavigate('patients')}
          className="cursor-pointer group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all hover:bg-slate-900 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Registered Patients</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalPatients}</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +12% this week
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="text-cyan-300 font-semibold">{ipdPatients} Admitted IPD</span> • <span>{totalPatients - ipdPatients} OPD</span>
          </div>
        </div>

        {/* IPD Beds KPI */}
        <div
          onClick={() => onNavigate('nursing')}
          className="cursor-pointer group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all hover:bg-slate-900 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">IPD Ward Bed Occupancy</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-colors">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{bedOccupancyPct}%</span>
            <span className="text-[11px] text-indigo-300 font-semibold">
              {occupiedBeds}/{totalBeds} Occupied
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                bedOccupancyPct > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: `${bedOccupancyPct}%` }}
            ></div>
          </div>
        </div>

        {/* Today's Consultations KPI */}
        <div
          onClick={() => onNavigate('appointments')}
          className="cursor-pointer group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all hover:bg-slate-900 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Consultation Queue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{todayApts}</span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> {inProgressApts} Active Now
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Average Wait Time: <span className="text-white font-semibold">14 mins</span>
          </div>
        </div>

        {/* Low Stock & Critical Alerts KPI */}
        <div
          onClick={() => onNavigate('inventory')}
          className="cursor-pointer group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all hover:bg-slate-900 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Stock & Lab Alerts</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-slate-950 transition-colors">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{lowStockCount + criticalLabsCount}</span>
            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
              Needs Action
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{lowStockCount} Low Pharmacy Supplies</span>
            <span className="text-rose-400 font-semibold">{criticalLabsCount} Critical Lab</span>
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Doctor Availability & Consultations) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Doctor Roster */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  On-Duty Physician Roster
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time consultation status and room assignments
                </p>
              </div>
              <button
                onClick={() => onNavigate('doctors')}
                className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1"
              >
                View Roster <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.fullName}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{doc.fullName}</div>
                      <div className="text-[11px] text-cyan-400">{doc.department}</div>
                      <div className="text-[10px] text-slate-500">{doc.roomNumber}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      doc.status === 'AVAILABLE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : doc.status === 'IN_CONSULTATION'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {doc.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Consultation Queue */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Live Triage & Consultation Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Patient queue status across departments
                </p>
              </div>
              <button
                onClick={() => onNavigate('appointments')}
                className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1"
              >
                Manage Queue <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {appointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-cyan-400 flex items-center justify-center text-xs">
                      #{apt.queueToken}
                    </span>
                    <div>
                      <div className="font-bold text-white">{apt.patientName}</div>
                      <div className="text-slate-400 text-[11px]">{apt.doctorName} ({apt.department})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono">{apt.timeSlot}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        apt.status === 'IN_PROGRESS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                          : apt.status === 'CHECKED_IN'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (IPD Bed Map & Quick Actions) */}
        <div className="space-y-6">
          {/* IPD Ward Bed Map Overview */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-indigo-400" />
                  Ward Bed Allocation Map
                </h3>
                <p className="text-xs text-slate-400">Live ward occupancy status</p>
              </div>
              <button
                onClick={() => onNavigate('nursing')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                Ward Desk
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {beds.slice(0, 6).map((bed) => (
                <div
                  key={bed.id}
                  className={`p-3 rounded-2xl border text-xs flex flex-col justify-between ${
                    bed.status === 'OCCUPIED'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : bed.status === 'AVAILABLE'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{bed.bedNumber}</span>
                    <span className="text-[10px] uppercase font-mono">{bed.status}</span>
                  </div>
                  <div className="text-[10px] opacity-80 mt-1 truncate">{bed.ward}</div>
                  {bed.patientName && (
                    <div className="text-[11px] font-semibold text-white mt-1 truncate">
                      {bed.patientName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3">Quick Workflows</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('patients')}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
              >
                <Users className="w-4 h-4 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Register Patient</div>
                <div className="text-[10px] text-slate-400">OPD / IPD entry</div>
              </button>

              <button
                onClick={() => onNavigate('prescriptions')}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
              >
                <Stethoscope className="w-4 h-4 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">E-Prescription</div>
                <div className="text-[10px] text-slate-400">With AI Drug Check</div>
              </button>

              <button
                onClick={() => onNavigate('lab')}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
              >
                <Activity className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Lab Order</div>
                <div className="text-[10px] text-slate-400">Results & Alerts</div>
              </button>

              <button
                onClick={() => onNavigate('billing')}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
              >
                <DollarSign className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Create Invoice</div>
                <div className="text-[10px] text-slate-400">Claims & Cashier</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
