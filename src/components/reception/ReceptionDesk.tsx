'use client';

import React, { useState } from 'react';
import { DoorOpen, Search, UserCheck, ShieldAlert, Clock, BedDouble, CheckCircle2 } from 'lucide-react';
import { Patient, Appointment, Doctor, Bed } from '@/services/api';

interface ReceptionDeskProps {
  patients: Patient[];
  appointments: Appointment[];
  doctors: Doctor[];
  beds: Bed[];
  onNavigate: (tab: any) => void;
}

export const ReceptionDesk: React.FC<ReceptionDeskProps> = ({
  patients,
  appointments,
  doctors,
  beds,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <DoorOpen className="w-6 h-6 text-amber-400" />
          Reception & Walk-In Triage Kiosk
        </h2>
        <p className="text-xs text-slate-400">
          Fast patient lookup, check-in queue management & emergency triage intake
        </p>
      </div>

      {/* KPI Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">Scheduled Today</div>
            <div className="text-2xl font-black text-white">{appointments.length}</div>
          </div>
          <Clock className="w-8 h-8 text-cyan-400 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">Available Beds</div>
            <div className="text-2xl font-black text-emerald-400">{availableBeds} Beds Free</div>
          </div>
          <BedDouble className="w-8 h-8 text-emerald-400 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400">Doctors On Duty</div>
            <div className="text-2xl font-black text-indigo-400">
              {doctors.filter((d) => d.status !== 'ON_LEAVE').length} Active
            </div>
          </div>
          <UserCheck className="w-8 h-8 text-indigo-400 opacity-80" />
        </div>
      </div>

      {/* Search and Check-In Tool */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm">Quick Patient Check-In Lookup</h3>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Type patient name, phone, or PAT-xxxx code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
          {filteredPatients.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">{p.fullName} ({p.patientCode})</div>
                <div className="text-[11px] text-slate-400">{p.phone} • Blood: {p.bloodGroup} • Care: {p.type}</div>
              </div>
              <button
                onClick={() => onNavigate('appointments')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold transition-all"
              >
                Send to Queue
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
