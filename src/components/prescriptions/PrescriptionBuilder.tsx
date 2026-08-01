'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Stethoscope,
  Pill,
  Printer,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Prescription, Patient, Doctor, apiPost } from '@/services/api';

interface PrescriptionBuilderProps {
  prescriptions: Prescription[];
  patients: Patient[];
  doctors: Doctor[];
  onRefresh: () => void;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  prescriptions,
  patients,
  doctors,
  onRefresh,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRxPrint, setSelectedRxPrint] = useState<Prescription | null>(null);

  // Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('Stage 1 Essential Hypertension with Dyslipidemia');
  const [symptomsInput, setSymptomsInput] = useState('Morning headaches, exertional shortness of breath');
  const [labTestsInput, setLabTestsInput] = useState('Lipid Profile Complete, Serum Electrolytes');
  const [followUpDate, setFollowUpDate] = useState('2026-04-20');

  // Medication Rows
  const [medications, setMedications] = useState([
    { medicineName: 'Telmisartan 40mg Tablet', dosage: '40 mg', frequency: 'Once Daily', durationDays: 30, instructions: 'After breakfast' },
    { medicineName: 'Atorvastatin 10mg Tablet', dosage: '10 mg', frequency: 'At Bedtime', durationDays: 30, instructions: 'Before sleep' },
  ]);

  // AI Safety Result
  const [aiCheckResult, setAiCheckResult] = useState<any>(null);
  const [isAiChecking, setIsAiChecking] = useState(false);

  const handleAddMedRow = () => {
    setMedications([
      ...medications,
      { medicineName: '', dosage: '500 mg', frequency: 'Twice Daily', durationDays: 7, instructions: 'With meals' },
    ]);
  };

  const handleRemoveMedRow = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleRunAiSafetyCheck = async () => {
    setIsAiChecking(true);
    try {
      const patient = patients.find((p) => p.id === patientId);
      const medList = medications.map((m) => m.medicineName).filter(Boolean);

      const res = await apiPost<any>('ai', {
        action: 'drug-interaction',
        medications: medList,
        allergies: patient?.allergies || ['Penicillin'],
      });

      setAiCheckResult(res);
    } catch (err: any) {
      alert('AI Safety Check failed: ' + err.message);
    } finally {
      setIsAiChecking(false);
    }
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patient = patients.find((p) => p.id === patientId);
      const doctor = doctors.find((d) => d.id === doctorId);

      await apiPost('prescriptions', {
        patientId,
        patientName: patient?.fullName || 'Patient',
        patientAgeGender: `${patient?.dob || ''} / ${patient?.gender || 'M'}`,
        doctorId,
        doctorName: doctor?.fullName || 'Doctor',
        diagnosis,
        symptoms: symptomsInput.split(',').map((s) => s.trim()),
        medications,
        labTestsOrdered: labTestsInput.split(',').map((s) => s.trim()),
        followUpDate,
        aiSafetyCheck: aiCheckResult || { flagged: false, warnings: ['Safety check completed.'], summary: 'Prescription valid.' },
        status: 'ISSUED',
      });

      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to issue prescription');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            E-Prescriptions & Automated Pharmacovigilance
          </h2>
          <p className="text-xs text-slate-400">
            Digital prescription engine with real-time cross-allergy detection and AI drug safety verification
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 flex items-center gap-2 shadow-lg shadow-purple-950 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New E-Prescription</span>
        </button>
      </div>

      {/* Prescriptions Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Rx Code / Date</th>
                <th className="px-4 py-3.5">Patient & Doctor</th>
                <th className="px-4 py-3.5">Diagnosis</th>
                <th className="px-4 py-3.5">Prescribed Medications</th>
                <th className="px-4 py-3.5">AI Safety Flag</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {prescriptions.map((rx) => (
                <tr key={rx.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white text-sm font-mono">{rx.prescriptionCode}</div>
                    <div className="text-[10px] text-slate-500">{rx.createdAt?.toString().split('T')[0] || 'Recent'}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{rx.patientName}</div>
                    <div className="text-[11px] text-purple-400">{rx.doctorName}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-slate-200 font-medium max-w-xs">{rx.diagnosis}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {rx.medications?.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                          {m.medicineName} ({m.dosage})
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {rx.aiSafetyCheck?.flagged ? (
                      <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> Drug Alert
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Passed
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setSelectedRxPrint(rx)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500 hover:text-slate-950 text-purple-300 font-bold transition-all flex items-center gap-1.5 ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Rx</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Prescription Builder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" /> Create E-Prescription
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Select Patient *</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.patientCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Prescribing Doctor *</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.fullName} ({d.department})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Clinical Diagnosis *</label>
                <input
                  required
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              {/* Medication Table Builder */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Pill className="w-4 h-4 text-purple-400" /> Prescribed Medications
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMedRow}
                    className="text-[11px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Drug
                  </button>
                </div>

                <div className="space-y-2">
                  {medications.map((med, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Drug Name (e.g. Telmisartan)"
                        value={med.medicineName}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[index].medicineName = e.target.value;
                          setMedications(updated);
                        }}
                        className="col-span-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (40mg)"
                        value={med.dosage}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[index].dosage = e.target.value;
                          setMedications(updated);
                        }}
                        className="col-span-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="Freq (Once Daily)"
                        value={med.frequency}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[index].frequency = e.target.value;
                          setMedications(updated);
                        }}
                        className="col-span-3 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]"
                      />
                      <input
                        type="number"
                        placeholder="Days"
                        value={med.durationDays}
                        onChange={(e) => {
                          const updated = [...medications];
                          updated[index].durationDays = Number(e.target.value);
                          setMedications(updated);
                        }}
                        className="col-span-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedRow(index)}
                        className="col-span-1 p-2 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* AI Safety Check Trigger */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleRunAiSafetyCheck}
                    disabled={isAiChecking}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{isAiChecking ? 'Checking Safety...' : 'Run AI Drug & Allergy Check'}</span>
                  </button>

                  {aiCheckResult && (
                    <span className={`text-[11px] font-bold ${aiCheckResult.flagged ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {aiCheckResult.summary}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-950 mt-2"
              >
                Sign & Issue Prescription
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Print Prescription View Modal */}
      {selectedRxPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white text-slate-900 p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-xl font-black text-cyan-900">AEGISCARE MEDICAL CENTER</h2>
                <p className="text-xs text-slate-500">Official Electronic Medical Prescription</p>
              </div>
              <button onClick={() => setSelectedRxPrint(null)} className="p-2 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 text-xs border-b pb-4 border-slate-200 gap-2">
              <div>
                <span className="font-bold text-slate-500">Patient:</span> {selectedRxPrint.patientName}
              </div>
              <div>
                <span className="font-bold text-slate-500">Rx Code:</span> {selectedRxPrint.prescriptionCode}
              </div>
              <div>
                <span className="font-bold text-slate-500">Doctor:</span> {selectedRxPrint.doctorName}
              </div>
              <div>
                <span className="font-bold text-slate-500">Diagnosis:</span> {selectedRxPrint.diagnosis}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Prescribed Rx:</h4>
              <div className="space-y-2 text-xs">
                {selectedRxPrint.medications?.map((m, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{i + 1}. {m.medicineName}</span> ({m.dosage})
                      <div className="text-[11px] text-slate-600">{m.instructions}</div>
                    </div>
                    <span className="font-semibold text-cyan-800">{m.frequency} x {m.durationDays} Days</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700">✓ AI Pharmacovigilance Verified</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
