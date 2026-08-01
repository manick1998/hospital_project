'use client';

import React, { useState } from 'react';
import {
  TestTube2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  X,
  FileCheck2,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { LabReport, Patient, Doctor, apiPost, apiPut } from '@/services/api';

interface LabDeskProps {
  labs: LabReport[];
  patients: Patient[];
  doctors: Doctor[];
  onRefresh: () => void;
}

export const LabDesk: React.FC<LabDeskProps> = ({ labs, patients, doctors, onRefresh }) => {
  const [selectedReportPrint, setSelectedReportPrint] = useState<LabReport | null>(null);
  const [resultEntryReport, setResultEntryReport] = useState<LabReport | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // New Lab Order State
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [testName, setTestName] = useState('Cardiac Biomarkers Panel (Troponin-I & CK-MB)');
  const [testCategory, setTestCategory] = useState('Biochemistry');

  // Result Entry State
  const [resultParam, setResultParam] = useState('Troponin-I');
  const [resultVal, setResultVal] = useState('1.45');
  const [unit, setUnit] = useState('ng/mL');
  const [refRange, setRefRange] = useState('< 0.04');
  const [flagStatus, setFlagStatus] = useState<'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL'>('CRITICAL');

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patient = patients.find((p) => p.id === patientId);
      const doctor = doctors.find((d) => d.id === doctorId);

      await apiPost('lab', {
        patientId,
        patientName: patient?.fullName || 'Patient',
        doctorId,
        doctorName: doctor?.fullName || 'Doctor',
        testName,
        testCategory,
        specimenType: 'Venous Blood',
        collectedAt: new Date().toLocaleString(),
        status: 'ORDERED',
        results: [],
      });

      setShowOrderModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to order lab test');
    }
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      await apiPut('lab', { id: reportId, status });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update lab status');
    }
  };

  const handleSaveResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultEntryReport) return;

    try {
      const newResults = [
        ...(resultEntryReport.results || []),
        { parameter: resultParam, value: resultVal, unit, referenceRange: refRange, status: flagStatus },
      ];

      const reportStatus = flagStatus === 'CRITICAL' ? 'CRITICAL_ALERT' : 'COMPLETED';

      await apiPut('lab', {
        id: resultEntryReport.id,
        results: newResults,
        status: reportStatus,
        reportedAt: new Date().toLocaleString(),
        technicianName: 'Sophia Patel',
      });

      setResultEntryReport(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to enter results');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <TestTube2 className="w-6 h-6 text-indigo-400" />
            Pathology & Diagnostic Laboratory Desk
          </h2>
          <p className="text-xs text-slate-400">
            Specimen tracking, automated out-of-range critical value flags & result reporting
          </p>
        </div>

        <button
          onClick={() => setShowOrderModal(true)}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center gap-2 shadow-lg shadow-indigo-950 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Order Diagnostic Test</span>
        </button>
      </div>

      {/* Lab Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className={`p-5 rounded-3xl border flex flex-col justify-between shadow-xl space-y-4 ${
              lab.status === 'CRITICAL_ALERT'
                ? 'bg-rose-950/30 border-rose-500/50 text-rose-100 shadow-rose-950/20'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-[11px] font-mono font-bold text-cyan-400">{lab.reportCode}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    lab.status === 'CRITICAL_ALERT'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                      : lab.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {lab.status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{lab.testName}</h3>
                  <div className="text-[11px] text-indigo-400">{lab.testCategory} • {lab.specimenType || 'Blood'}</div>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <div className="text-slate-300 font-semibold">{lab.patientName}</div>
                  <div className="text-[11px] text-slate-400">Doctor: {lab.doctorName || 'Attending'}</div>
                </div>

                {/* Display test parameters if available */}
                {lab.results && lab.results.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 mt-2">
                    {lab.results.map((res, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">{res.parameter}</span>
                        <span
                          className={`font-bold font-mono ${
                            res.status === 'CRITICAL' || res.status === 'HIGH'
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {res.value} {res.unit} ({res.status})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              {lab.status === 'ORDERED' && (
                <button
                  onClick={() => handleUpdateStatus(lab.id, 'SAMPLE_COLLECTED')}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all text-center"
                >
                  Mark Sample Collected
                </button>
              )}
              {lab.status === 'SAMPLE_COLLECTED' && (
                <button
                  onClick={() => setResultEntryReport(lab)}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" /> Enter Test Results
                </button>
              )}
              {(lab.status === 'COMPLETED' || lab.status === 'CRITICAL_ALERT') && (
                <button
                  onClick={() => setSelectedReportPrint(lab)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> View Lab Certificate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Diagnostic Test Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> New Laboratory Requisition
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs">
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
                <label className="block text-slate-300 mb-1 font-semibold">Requesting Physician *</label>
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

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Test Name *</label>
                <input
                  required
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Pulmonary / Emergency">Pulmonary / Emergency</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-950 mt-2"
              >
                Submit Lab Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enter Result Modal */}
      {resultEntryReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" /> Record Lab Result Parameter
              </h3>
              <button onClick={() => setResultEntryReport(null)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResultSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Parameter Name</label>
                <input
                  required
                  type="text"
                  value={resultParam}
                  onChange={(e) => setResultParam(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Result Value</label>
                  <input
                    required
                    type="text"
                    value={resultVal}
                    onChange={(e) => setResultVal(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Reference Range</label>
                <input
                  type="text"
                  value={refRange}
                  onChange={(e) => setRefRange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Clinical Status Flag</label>
                <select
                  value={flagStatus}
                  onChange={(e) => setFlagStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="NORMAL">NORMAL (Within Range)</option>
                  <option value="HIGH">HIGH (Elevated)</option>
                  <option value="LOW">LOW (Below Range)</option>
                  <option value="CRITICAL">CRITICAL (Trigger Emergency Alert)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-950 mt-2"
              >
                Save & Post Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lab Report Print Preview Modal */}
      {selectedReportPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white text-slate-900 p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-xl font-black text-indigo-900">AEGISCARE DIAGNOSTIC PATHOLOGY LAB</h2>
                <p className="text-xs text-slate-500">Official Diagnostic Result Certificate</p>
              </div>
              <button onClick={() => setSelectedReportPrint(null)} className="p-2 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 text-xs border-b pb-4 border-slate-200 gap-2">
              <div><span className="font-bold text-slate-500">Patient:</span> {selectedReportPrint.patientName}</div>
              <div><span className="font-bold text-slate-500">Report Code:</span> {selectedReportPrint.reportCode}</div>
              <div><span className="font-bold text-slate-500">Test Name:</span> {selectedReportPrint.testName}</div>
              <div><span className="font-bold text-slate-500">Status:</span> {selectedReportPrint.status}</div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Test Findings:</h4>
              <div className="space-y-2 text-xs">
                {selectedReportPrint.results?.map((res, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{res.parameter}</span>
                      <div className="text-[11px] text-slate-500">Ref Range: {res.referenceRange}</div>
                    </div>
                    <span className="font-bold font-mono text-indigo-900">{res.value} {res.unit} ({res.status})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Technician: {selectedReportPrint.technicianName || 'Pathology Tech'}</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Lab Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
