/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Award,
  DollarSign,
  Clock,
  X,
} from 'lucide-react';
import { Doctor, apiPost } from '@/services/api';

interface DoctorRosterProps {
  doctors: Doctor[];
  onRefresh: () => void;
}

export const DoctorRoster: React.FC<DoctorRosterProps> = ({ doctors, onRefresh }) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New doctor state
  const [newDoctor, setNewDoctor] = useState({
    fullName: '',
    specialty: '',
    department: 'Cardiology',
    qualification: 'MD',
    experienceYears: '10',
    consultationFee: '150',
    roomNumber: 'Suite 202',
    phone: '',
    email: '',
  });

  const departments = Array.from(new Set(doctors.map((d) => d.department)));

  const filteredDoctors = doctors.filter(
    (d) => selectedDept === 'ALL' || d.department === selectedDept
  );

  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('doctors', {
        ...newDoctor,
        experienceYears: Number(newDoctor.experienceYears),
        consultationFee: Number(newDoctor.consultationFee),
      });
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add doctor');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-cyan-400" />
            Medical Staff & Doctor Roster
          </h2>
          <p className="text-xs text-slate-400">
            Attending physicians, specialties, suite consultation rooms & weekly schedules
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Physician</span>
        </button>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedDept('ALL')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            selectedDept === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          All Departments ({doctors.length})
        </button>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              selectedDept === dept
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between shadow-lg shadow-black/40 group"
          >
            <div className="space-y-4">
              {/* Doctor Header */}
              <div className="flex items-start gap-3.5">
                <img
                  src={doc.avatar}
                  alt={doc.fullName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-800 group-hover:ring-cyan-500/50 transition-all"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{doc.doctorCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                  <h3 className="font-black text-white text-base leading-tight mt-0.5">{doc.fullName}</h3>
                  <div className="text-xs text-cyan-300 font-semibold">{doc.specialty}</div>
                </div>
              </div>

              {/* Badges & Details */}
              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> {doc.qualification}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {doc.roomNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Exp: {doc.experienceYears} Years
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5" /> ${doc.consultationFee} / OPD
                  </span>
                </div>

                {/* Schedule Days */}
                <div className="pt-2">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Available Days:</div>
                  <div className="flex flex-wrap gap-1">
                    {doc.schedule?.days?.map((day, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono font-medium text-slate-300">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" /> {doc.rating} / 5.0
              </div>
              <span className="text-[11px] text-slate-400">{doc.email}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Add Doctor to Roster
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Doctor Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Arthur Pendelton"
                  value={newDoctor.fullName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Specialty</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Interventional Cardiology"
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Department</label>
                  <select
                    value={newDoctor.department}
                    onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Surgery">General Surgery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Room Suite</label>
                  <input
                    type="text"
                    value={newDoctor.roomNumber}
                    onChange={(e) => setNewDoctor({ ...newDoctor, roomNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Fee ($)</label>
                  <input
                    type="number"
                    value={newDoctor.consultationFee}
                    onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Qualification</label>
                  <input
                    type="text"
                    value={newDoctor.qualification}
                    onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-950 mt-2"
              >
                Add Doctor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
