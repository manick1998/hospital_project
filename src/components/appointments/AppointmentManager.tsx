'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  User,
  Stethoscope,
  Activity,
  CheckCircle2,
  XCircle,
  Play,
  HeartPulse,
  Thermometer,
  FileText,
  X,
} from 'lucide-react';
import { Appointment, Doctor, Patient, apiPost, apiPut } from '@/services/api';

interface AppointmentManagerProps {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  onRefresh: () => void;
}

export const AppointmentManager: React.FC<AppointmentManagerProps> = ({
  appointments,
  doctors,
  patients,
  onRefresh,
}) => {
  const [showBookModal, setShowShowBookModal] = useState(false);
  const [vitalsModalApt, setVitalsModalApt] = useState<Appointment | null>(null);

  // New Appointment Form
  const [bookData, setBookData] = useState({
    patientId: patients[0]?.id || '',
    doctorId: doctors[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:30 AM',
    type: 'OPD Consultation',
    reason: 'Follow-up consultation',
  });

  // Vitals Form
  const [vitalsData, setVitalsData] = useState({
    bpSystolic: 120,
    bpDiastolic: 80,
    heartRate: 75,
    temperature: 98.6,
    spO2: 98,
    respiratoryRate: 16,
    weightKg: 70,
    heightCm: 172,
  });

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patient = patients.find((p) => p.id === bookData.patientId);
      const doctor = doctors.find((d) => d.id === bookData.doctorId);

      await apiPost('appointments', {
        patientId: bookData.patientId,
        patientName: patient?.fullName || 'Patient',
        patientPhone: patient?.phone || '',
        doctorId: bookData.doctorId,
        doctorName: doctor?.fullName || 'Doctor',
        department: doctor?.department || 'General',
        date: bookData.date,
        timeSlot: bookData.timeSlot,
        type: bookData.type,
        reason: bookData.reason,
      });

      setShowShowBookModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to book appointment');
    }
  };

  const handleStatusChange = async (aptId: string, newStatus: string) => {
    try {
      await apiPut('appointments', { id: aptId, status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update appointment status');
    }
  };

  const handleSaveVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vitalsModalApt) return;
    try {
      await apiPut('appointments', {
        id: vitalsModalApt.id,
        vitals: {
          ...vitalsData,
          recordedBy: 'Triage Nurse',
          recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      });

      setVitalsModalApt(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save vitals');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-400" />
            Appointments & Smart Triage Queue
          </h2>
          <p className="text-xs text-slate-400">
            Real-time consultation queue tokens, patient check-ins, and triage vitals entry
          </p>
        </div>

        <button
          onClick={() => setShowShowBookModal(true)}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Appointment Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl space-y-4"
          >
            <div>
              {/* Token Ticket Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-black flex items-center justify-center text-sm shadow-inner">
                    #{apt.queueToken}
                  </span>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-slate-400">{apt.appointmentCode}</div>
                    <div className="text-xs font-semibold text-white">{apt.timeSlot}</div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    apt.status === 'IN_PROGRESS'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : apt.status === 'CHECKED_IN'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : apt.status === 'COMPLETED'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {apt.status}
                </span>
              </div>

              {/* Patient & Doctor Body */}
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Patient:</span>
                  <div className="font-bold text-white text-sm">{apt.patientName}</div>
                  <div className="text-slate-400 text-[11px]">{apt.patientPhone}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Attending Doctor:</span>
                  <div className="font-semibold text-cyan-300">{apt.doctorName}</div>
                  <div className="text-[11px] text-slate-400">{apt.department}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                  <span className="font-semibold text-slate-400">Chief Reason:</span> {apt.reason}
                </div>

                {/* Vitals Badge if recorded */}
                {apt.vitals ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> BP: {apt.vitals.bpSystolic}/{apt.vitals.bpDiastolic}
                    </span>
                    <span>HR: {apt.vitals.heartRate} bpm</span>
                    <span>SpO2: {apt.vitals.spO2}%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setVitalsModalApt(apt)}
                    className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> Record Triage Vitals
                  </button>
                )}
              </div>
            </div>

            {/* Queue Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              {apt.status === 'SCHEDULED' && (
                <button
                  onClick={() => handleStatusChange(apt.id, 'CHECKED_IN')}
                  className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all text-center"
                >
                  Check In Patient
                </button>
              )}
              {apt.status === 'CHECKED_IN' && (
                <button
                  onClick={() => handleStatusChange(apt.id, 'IN_PROGRESS')}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Start Consultation
                </button>
              )}
              {apt.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusChange(apt.id, 'COMPLETED')}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete Visit
                </button>
              )}
              {apt.status === 'COMPLETED' && (
                <div className="text-[11px] text-slate-500 text-center w-full font-semibold">
                  ✓ Visit Completed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Android Material Design 3 Floating Action Button (FAB) for Booking Appointment on Mobile */}
      <button
        onClick={() => setShowShowBookModal(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/40 flex items-center justify-center hover:scale-105 active:scale-90 transition-all md:hidden"
        aria-label="Book new appointment"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Book Consultation Ticket
              </h3>
              <button onClick={() => setShowShowBookModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Patient *</label>
                <select
                  value={bookData.patientId}
                  onChange={(e) => setBookData({ ...bookData, patientId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.patientCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Physician *</label>
                <select
                  value={bookData.doctorId}
                  onChange={(e) => setBookData({ ...bookData, doctorId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.fullName} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={bookData.date}
                    onChange={(e) => setBookData({ ...bookData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Time Slot</label>
                  <input
                    type="text"
                    value={bookData.timeSlot}
                    onChange={(e) => setBookData({ ...bookData, timeSlot: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Reason for Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Chest pain follow-up, ECG review"
                  value={bookData.reason}
                  onChange={(e) => setBookData({ ...bookData, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-950 mt-2"
              >
                Generate Queue Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Vitals Modal */}
      {vitalsModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" /> Record Triage Vitals
              </h3>
              <button onClick={() => setVitalsModalApt(null)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVitalsSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">BP Systolic (mmHg)</label>
                  <input
                    type="number"
                    value={vitalsData.bpSystolic}
                    onChange={(e) => setVitalsData({ ...vitalsData, bpSystolic: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">BP Diastolic (mmHg)</label>
                  <input
                    type="number"
                    value={vitalsData.bpDiastolic}
                    onChange={(e) => setVitalsData({ ...vitalsData, bpDiastolic: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={vitalsData.heartRate}
                    onChange={(e) => setVitalsData({ ...vitalsData, heartRate: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    value={vitalsData.spO2}
                    onChange={(e) => setVitalsData({ ...vitalsData, spO2: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Body Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.temperature}
                    onChange={(e) => setVitalsData({ ...vitalsData, temperature: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Weight (kg)</label>
                  <input
                    type="number"
                    value={vitalsData.weightKg}
                    onChange={(e) => setVitalsData({ ...vitalsData, weightKg: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-950 mt-2"
              >
                Save Patient Vitals
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
