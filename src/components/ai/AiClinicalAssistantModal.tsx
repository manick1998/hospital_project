'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Stethoscope,
  Pill,
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { apiPost } from '@/services/api';

interface AiClinicalAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiClinicalAssistantModal: React.FC<AiClinicalAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<'symptoms' | 'interactions' | 'soap' | 'discharge'>('symptoms');
  const [loading, setLoading] = useState(false);

  // Form states
  const [symptomsInput, setSymptomsInput] = useState('Acute chest tightness with dyspnea on exertion, mild radiation to left jaw.');
  const [vitalsInput, setVitalsInput] = useState('BP 142/90, HR 88 bpm, SpO2 96%, Temp 98.6 F');
  const [medsInput, setMedsInput] = useState('Amoxicillin 500mg, Telmisartan 40mg, Aspirin 81mg');
  const [allergiesInput, setAllergiesInput] = useState('Penicillin');
  const [notesInput, setDoctorNotesInput] = useState('Patient presented with 3-day history of productive cough and fatigue.');

  // AI Response state
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRunAi = async () => {
    setLoading(true);
    setResult(null);

    try {
      if (activeMode === 'symptoms') {
        const res = await apiPost<any>('ai', {
          action: 'symptom-checker',
          symptoms: symptomsInput,
          vitals: vitalsInput,
        });
        setResult(res);
      } else if (activeMode === 'interactions') {
        const medsArray = medsInput.split(',').map((s) => s.trim());
        const allergiesArray = allergiesInput.split(',').map((s) => s.trim());
        const res = await apiPost<any>('ai', {
          action: 'drug-interaction',
          medications: medsArray,
          allergies: allergiesArray,
        });
        setResult(res);
      } else if (activeMode === 'soap') {
        const res = await apiPost<any>('ai', {
          action: 'clinical-summary',
          symptoms: notesInput,
        });
        setResult(res);
      } else if (activeMode === 'discharge') {
        const res = await apiPost<any>('ai', {
          action: 'discharge-summary',
          patientName: 'Jonathan Reed',
          diagnosis: 'Cardiovascular Evaluation',
        });
        setResult(res);
      }
    } catch (err: any) {
      setResult({ error: err.message || 'AI Copilot query failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AegisCare Clinical Diagnostic Copilot
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                  AI v4.5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated Clinical Decision Support & Pharmacovigilance Guard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-4 p-2 bg-slate-950/60 border-b border-slate-800 gap-1 text-xs">
          <button
            onClick={() => { setActiveMode('symptoms'); setResult(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
              activeMode === 'symptoms'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Symptom Checker</span>
          </button>
          <button
            onClick={() => { setActiveMode('interactions'); setResult(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
              activeMode === 'interactions'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Drug Interactions</span>
          </button>
          <button
            onClick={() => { setActiveMode('soap'); setResult(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
              activeMode === 'soap'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SOAP Generator</span>
          </button>
          <button
            onClick={() => { setActiveMode('discharge'); setResult(null); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
              activeMode === 'discharge'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Discharge Summary</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeMode === 'symptoms' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Presented Symptoms & Complaints
                </label>
                <textarea
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Chest pain radiating to shoulder..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Patient Vitals & History (Optional)
                </label>
                <input
                  type="text"
                  value={vitalsInput}
                  onChange={(e) => setVitalsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="BP, HR, SpO2..."
                />
              </div>
            </div>
          )}

          {activeMode === 'interactions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  List of Prescribed Medications (comma separated)
                </label>
                <input
                  type="text"
                  value={medsInput}
                  onChange={(e) => setMedsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Documented Patient Allergies
                </label>
                <input
                  type="text"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {activeMode === 'soap' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Raw Consultation & Clinical Notes
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setDoctorNotesInput(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {activeMode === 'discharge' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              Generate standardized patient discharge summary report with hospital treatment course, medication instructions, and follow-up advice.
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleRunAi}
            disabled={loading}
            className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Processing Clinical AI Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Run AI Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Results Display */}
          {result && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> AI Diagnostics Output
                </span>
                {result.urgency && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      result.urgency.includes('EMERGENCY')
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    Triage Urgency: {result.urgency}
                  </span>
                )}
              </div>

              {/* Differential Diagnoses */}
              {result.differentialDiagnoses && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300">Differential Diagnoses:</h4>
                  {result.differentialDiagnoses.map((dd: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs flex items-start justify-between"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{dd.condition}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{dd.rationale}</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 font-mono font-bold text-[11px]">
                        {dd.probability}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Tests */}
              {result.recommendedTests && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-slate-300">Recommended Lab & Imaging Tests:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.recommendedTests.map((t: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium"
                      >
                        • {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Drug Warnings */}
              {result.warnings && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300">Drug Interaction & Allergy Alerts:</h4>
                  {result.warnings.map((w: string, i: number) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                        result.flagged
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {result.flagged ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* SOAP Note */}
              {result.soapNote && (
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-cyan-400">[S] Subjective:</span> {result.soapNote.subjective}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-cyan-400">[O] Objective:</span> {result.soapNote.objective}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-cyan-400">[A] Assessment:</span> {result.soapNote.assessment}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-cyan-400">[P] Plan:</span> {result.soapNote.plan}
                  </div>
                </div>
              )}

              {/* Discharge Summary */}
              {result.summaryText && (
                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap">
                  {result.summaryText}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
