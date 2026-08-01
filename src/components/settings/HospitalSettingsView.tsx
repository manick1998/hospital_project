'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import { HospitalSettings, apiPut } from '@/services/api';

interface HospitalSettingsViewProps {
  settings: HospitalSettings;
  onRefresh: () => void;
}

export const HospitalSettingsView: React.FC<HospitalSettingsViewProps> = ({
  settings,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<HospitalSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPut('settings', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-in fade-in">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          Hospital System Configuration
        </h2>
        <p className="text-xs text-slate-400">
          Global hospital parameters, registration numbers, tax percentages & AI features
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Settings updated successfully!
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Hospital Name *</label>
            <input
              required
              type="text"
              value={formData.hospitalName || ''}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Registration Number</label>
            <input
              type="text"
              value={formData.registrationNumber || ''}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Tagline / Mission</label>
          <input
            type="text"
            value={formData.tagline || ''}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Emergency Hotline</label>
            <input
              type="text"
              value={formData.emergencyContactNumber || ''}
              onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-rose-400 font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Currency Symbol</label>
            <input
              type="text"
              value={formData.currencySymbol || '$'}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={formData.taxRatePercentage || 5}
              onChange={(e) => setFormData({ ...formData, taxRatePercentage: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">OPD Validity (Days)</label>
            <input
              type="number"
              value={formData.opdConsultationValidityDays || 14}
              onChange={(e) => setFormData({ ...formData, opdConsultationValidityDays: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 mt-4"
        >
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </form>
    </div>
  );
};
