'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  X,
  Heart,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  TestTube2,
  Receipt,
  BedDouble,
  CheckCircle2,
  Stethoscope,
  UserPlus,
} from 'lucide-react';
import { Patient, Prescription, LabReport, Invoice, Bed, apiPost } from '@/services/api';

interface PatientRegistryProps {
  patients: Patient[];
  prescriptions: Prescription[];
  labs: LabReport[];
  invoices: Invoice[];
  beds: Bed[];
  onRefresh: () => void;
}

export const PatientRegistry: React.FC<PatientRegistryProps> = ({
  patients,
  prescriptions,
  labs,
  invoices,
  beds,
  onRefresh,
}) => {
  const [searchTerm, setSearchType] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'OPD' | 'IPD' | 'EMERGENCY'>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Registration Form
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '1992-05-14',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    address: '',
    type: 'OPD',
    emergencyContactName: '',
    emergencyContactPhone: '',
    insuranceProvider: 'Blue Cross',
    policyNumber: 'BCBS-10029',
    coverageLimit: '50000',
    allergies: 'Penicillin',
    medicalHistory: 'Hypertension',
  });

  const filteredPatients = patients.filter((p) => {
    const matchesType = filterType === 'ALL' || p.type === filterType;
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    return matchesType && matchesSearch;
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('patients', {
        fullName: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        type: formData.type,
        emergencyContact: {
          name: formData.emergencyContactName || 'Emergency Contact',
          relation: 'Family',
          phone: formData.emergencyContactPhone || formData.phone,
        },
        insurance: {
          provider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          coverageLimit: Number(formData.coverageLimit) || 0,
          status: 'ACTIVE',
        },
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map((s) => s.trim()) : [],
      });

      setShowRegisterModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to register patient');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Patient Registry & Electronic Health Records (EHR)
          </h2>
          <p className="text-xs text-slate-400">
            Comprehensive patient demographic, insurance, vitals & clinical diagnostic history
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, ID code, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
          <span className="text-slate-400 font-semibold mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {(['ALL', 'OPD', 'IPD', 'EMERGENCY'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterType === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Mobile Android Card List (Material Design 3 - md:hidden) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredPatients.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedPatient(p)}
            className="p-4 rounded-3xl bg-slate-900 border border-slate-800 active:scale-[0.98] transition-all duration-150 shadow-lg relative overflow-hidden flex flex-col gap-3 group cursor-pointer"
          >
            {/* Top Row: Avatar + Name + Type Chip */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-base shrink-0 shadow-md">
                  {p.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm leading-tight">{p.fullName}</h4>
                  <span className="text-[11px] font-mono font-bold text-cyan-400">{p.patientCode}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                  p.type === 'EMERGENCY'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : p.type === 'IPD'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {p.type}
              </span>
            </div>

            {/* Middle Row: Blood + Gender + Phone + Bed */}
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold font-mono text-[11px]">
                  {p.bloodGroup}
                </span>
                <span>{p.gender}</span>
                <span className="text-slate-600">•</span>
                <span>DOB: {p.dob}</span>
              </div>
              {p.bedNumber && (
                <span className="flex items-center gap-1 text-indigo-300 font-bold text-[11px]">
                  <BedDouble className="w-3.5 h-3.5" /> {p.bedNumber}
                </span>
              )}
            </div>

            {/* Bottom Row: Allergies + Quick Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1">
                {p.allergies && p.allergies.length > 0 ? (
                  p.allergies.slice(0, 2).map((alg, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium"
                    >
                      ⚠️ {alg}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">No allergies</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${p.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 hover:bg-slate-700 active:scale-90 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center"
                  aria-label="Call Patient"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPatient(p);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 active:scale-95 transition-all min-h-[38px] shadow-md shadow-cyan-500/20"
                >
                  Open EHR →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Desktop Patients Table (hidden on mobile md:hidden, visible on desktop md:block) */}
      <div className="hidden md:block rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Patient ID / Name</th>
                <th className="px-4 py-3.5">Type & Bed</th>
                <th className="px-4 py-3.5">Blood & DOB</th>
                <th className="px-4 py-3.5">Contact & Insurance</th>
                <th className="px-4 py-3.5">Allergies</th>
                <th className="px-4 py-3.5 text-right">EHR Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No patients matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-sm">{p.fullName}</div>
                      <div className="text-[11px] font-mono text-cyan-400">{p.patientCode}</div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.type === 'EMERGENCY'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : p.type === 'IPD'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {p.type}
                      </span>
                      {p.bedNumber && (
                        <div className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                          <BedDouble className="w-3 h-3 text-indigo-400" /> {p.bedNumber}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] flex items-center justify-center font-mono">
                          {p.bloodGroup}
                        </span>
                        <span>{p.gender}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{p.dob}</div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-slate-300">{p.phone}</div>
                      <div className="text-[10px] text-cyan-400 font-medium">
                        {p.insurance?.provider || 'Self Pay'}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {p.allergies && p.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.allergies.map((alg, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium"
                            >
                              {alg}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">None</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelectedPatient(p)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View EHR</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Android Material Design 3 Floating Action Button (FAB) - Fixed at Bottom Right on Mobile */}
      <button
        onClick={() => setShowRegisterModal(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/40 flex items-center justify-center hover:scale-105 active:scale-90 transition-all md:hidden"
        aria-label="Register New Patient"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* EHR Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-lg">
                  {selectedPatient.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedPatient.fullName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {selectedPatient.patientCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedPatient.gender} • DOB: {selectedPatient.dob} • Blood: <span className="text-rose-400 font-bold">{selectedPatient.bloodGroup}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* EHR Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Demographics & Insurance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1 text-cyan-400">
                    <Phone className="w-3.5 h-3.5" /> Contact Details
                  </span>
                  <div>Phone: <span className="text-white font-semibold">{selectedPatient.phone}</span></div>
                  <div>Email: <span className="text-white font-semibold">{selectedPatient.email}</span></div>
                  <div>Address: <span className="text-slate-300">{selectedPatient.address}</span></div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Insurance Coverage
                  </span>
                  <div>Provider: <span className="text-white font-semibold">{selectedPatient.insurance?.provider}</span></div>
                  <div>Policy No: <span className="text-white font-mono">{selectedPatient.insurance?.policyNumber}</span></div>
                  <div>Limit: <span className="text-emerald-400 font-bold">${selectedPatient.insurance?.coverageLimit?.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Medical History & Allergies */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1 text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Documented Clinical Alerts & Allergies
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies?.map((alg, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                      ⚠️ Allergy: {alg}
                    </span>
                  ))}
                  {selectedPatient.medicalHistory?.map((h, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                      • {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prescriptions History */}
              <div className="space-y-2">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" /> Issued Prescriptions
                </span>
                <div className="space-y-2">
                  {prescriptions.filter((p) => p.patientId === selectedPatient.id).length === 0 ? (
                    <div className="p-4 text-slate-500 bg-slate-950 rounded-2xl text-center">No prescription records found.</div>
                  ) : (
                    prescriptions
                      .filter((p) => p.patientId === selectedPatient.id)
                      .map((rx) => (
                        <div key={rx.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{rx.prescriptionCode} - {rx.diagnosis}</div>
                            <div className="text-[11px] text-slate-400">Doctor: {rx.doctorName}</div>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-[10px] uppercase">
                            {rx.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Lab Reports */}
              <div className="space-y-2">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <TestTube2 className="w-4 h-4 text-emerald-400" /> Lab & Diagnostic Reports
                </span>
                <div className="space-y-2">
                  {labs.filter((l) => l.patientId === selectedPatient.id).length === 0 ? (
                    <div className="p-4 text-slate-500 bg-slate-950 rounded-2xl text-center">No lab report records found.</div>
                  ) : (
                    labs
                      .filter((l) => l.patientId === selectedPatient.id)
                      .map((lab) => (
                        <div key={lab.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{lab.testName}</div>
                            <div className="text-[11px] text-slate-400">{lab.testCategory} • Reported: {lab.reportedAt || 'Pending'}</div>
                          </div>
                          <span className={`px-2 py-1 rounded-lg font-bold text-[10px] ${lab.status === 'CRITICAL_ALERT' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {lab.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Register Patient Entry
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Phone Number *</label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Care Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="OPD">OPD (Outpatient)</option>
                    <option value="IPD">IPD (Inpatient)</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Documented Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Insurance Provider</label>
                  <input
                    type="text"
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-950"
              >
                Register Patient Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
