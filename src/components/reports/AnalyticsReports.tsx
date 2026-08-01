'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Activity, ShieldCheck } from 'lucide-react';
import { apiGet } from '@/services/api';

export const AnalyticsReports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>('reports')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading hospital financial & clinical report metrics...
      </div>
    );
  }

  const { kpis, departmentBreakdown } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Analytics & Executive Clinical Reports
        </h2>
        <p className="text-xs text-slate-400">
          Financial revenue trends, patient OPD/IPD ratios, and department performance indicators
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Total Gross Revenue</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">${kpis.totalRevenue?.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">Paid Collections: ${kpis.paidRevenue?.toLocaleString()}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Outstanding Balance</span>
          <div className="text-2xl font-black text-amber-400 mt-1">${kpis.pendingRevenue?.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">Pending insurance & cash claims</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">IPD Bed Occupancy</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{kpis.bedOccupancyRate}%</div>
          <div className="text-[10px] text-slate-500 mt-1">{kpis.occupiedBeds} / {kpis.totalBeds} Occupied</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Total Registered Patients</span>
          <div className="text-2xl font-black text-white mt-1">{kpis.totalPatients}</div>
          <div className="text-[10px] text-slate-500 mt-1">{kpis.opdPatients} OPD • {kpis.ipdPatients} IPD</div>
        </div>
      </div>

      {/* Department breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" /> Department Physician Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(departmentBreakdown || {}).map(([dept, count]: any) => (
            <div key={dept} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
              <div className="font-bold text-white text-sm">{dept}</div>
              <div className="text-cyan-400 font-mono font-bold mt-1">{count} Physicians</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
