'use client';

import React, { useState } from 'react';
import {
  BedDouble,
  UserPlus,
  UserMinus,
  Activity,
  HeartPulse,
  Thermometer,
  ShieldAlert,
  X,
} from 'lucide-react';
import { Bed, Patient, apiPut } from '@/services/api';

interface NursingStationProps {
  beds: Bed[];
  patients: Patient[];
  onRefresh: () => void;
}

export const NursingStation: React.FC<NursingStationProps> = ({ beds, patients, onRefresh }) => {
  const [admitBedModal, setAdmitBedModal] = useState<Bed | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');

  const wards = Array.from(new Set(beds.map((b) => b.ward)));

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitBedModal) return;

    try {
      const patient = patients.find((p) => p.id === selectedPatientId);
      await apiPut('beds', {
        id: admitBedModal.id,
        action: 'ADMIT',
        patientId: selectedPatientId,
        patientName: patient?.fullName || 'Patient',
      });

      setAdmitBedModal(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to admit patient to bed');
    }
  };

  const handleDischarge = async (bedId: string) => {
    if (!confirm('Are you sure you want to discharge patient from this bed?')) return;
    try {
      await apiPut('beds', {
        id: bedId,
        action: 'DISCHARGE',
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to discharge patient');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <BedDouble className="w-6 h-6 text-indigo-400" />
          Nursing Station & IPD Ward Bed Allocation
        </h2>
        <p className="text-xs text-slate-400">
          Inpatient ward monitoring, bed assignment, patient admission & real-time telemetry card
        </p>
      </div>

      {/* Ward Cards */}
      {wards.map((wardName) => {
        const wardBeds = beds.filter((b) => b.ward === wardName);
        return (
          <div key={wardName} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                {wardName}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {wardBeds.filter((b) => b.status === 'OCCUPIED').length} / {wardBeds.length} Occupied
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {wardBeds.map((bed) => (
                <div
                  key={bed.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    bed.status === 'OCCUPIED'
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-100'
                      : bed.status === 'AVAILABLE'
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-base text-white font-mono">{bed.bedNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
                        ${bed.dailyRate}/day
                      </span>
                    </div>

                    <div className="mt-2 text-xs">
                      {bed.status === 'OCCUPIED' ? (
                        <div>
                          <div className="font-bold text-rose-300 text-sm">{bed.patientName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Admitted: {bed.admittedAt || 'Recent'}</div>

                          {/* Telemetry card summary */}
                          <div className="mt-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] space-y-0.5 font-mono text-cyan-300">
                            <div className="flex items-center justify-between">
                              <span>HR: 76 bpm</span>
                              <span>SpO2: 98%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>BP: 124/82</span>
                              <span>Temp: 98.4°F</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-400 font-semibold py-2">
                          Ready for Patient Admission
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80">
                    {bed.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => setAdmitBedModal(bed)}
                        className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Admit Patient
                      </button>
                    ) : bed.status === 'OCCUPIED' ? (
                      <button
                        onClick={() => handleDischarge(bed.id)}
                        className="w-full py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <UserMinus className="w-3.5 h-3.5" /> Discharge
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Under Maintenance</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Admit Patient Modal */}
      {admitBedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" /> Admit Patient to {admitBedModal.bedNumber}
              </h3>
              <button onClick={() => setAdmitBedModal(null)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdmitSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Patient for Bed Allocation *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.patientCode} - {p.type})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300">
                <div className="font-bold text-white">Bed Info:</div>
                <div>Ward: {admitBedModal.ward}</div>
                <div>Daily Rate: ${admitBedModal.dailyRate}</div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-950 mt-2"
              >
                Confirm Bed Admission
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
