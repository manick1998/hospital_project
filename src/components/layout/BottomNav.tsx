'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  UserCheck,
  Grid,
  FileText,
  TestTube2,
  BedDouble,
  Receipt,
  Package,
  DoorOpen,
  BarChart3,
  ShieldCheck,
  Settings,
  X,
  Sparkles,
  HeartPulse,
  User,
  CheckCircle2,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

const MODULE_LIST = [
  { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients' as ActiveTab, label: 'Patient EHR', icon: Users, badge: '5' },
  { id: 'appointments' as ActiveTab, label: 'Appointments', icon: CalendarCheck, badge: 'Live' },
  { id: 'doctors' as ActiveTab, label: 'Doctors', icon: UserCheck },
  { id: 'prescriptions' as ActiveTab, label: 'E-Prescriptions', icon: FileText },
  { id: 'lab' as ActiveTab, label: 'Lab Diagnostics', icon: TestTube2, badge: 'Alert' },
  { id: 'nursing' as ActiveTab, label: 'Nursing Wards', icon: BedDouble },
  { id: 'billing' as ActiveTab, label: 'Billing & Claims', icon: Receipt },
  { id: 'inventory' as ActiveTab, label: 'Pharmacy & Stock', icon: Package, badge: 'Low' },
  { id: 'reception' as ActiveTab, label: 'Reception Triage', icon: DoorOpen },
  { id: 'reports' as ActiveTab, label: 'Analytics Reports', icon: BarChart3 },
  { id: 'audit' as ActiveTab, label: 'Audit Logs', icon: ShieldCheck },
  { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
];

const ROLES = [
  { id: 'ADMIN', label: 'Hospital Admin' },
  { id: 'DOCTOR', label: 'Doctor' },
  { id: 'NURSE', label: 'Nurse' },
  { id: 'RECEPTIONIST', label: 'Reception' },
  { id: 'PHARMACIST', label: 'Pharmacist' },
  { id: 'LAB_TECH', label: 'Lab Tech' },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  onRoleChange,
}) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const primaryTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients' as ActiveTab, label: 'Patients', icon: Users },
    { id: 'appointments' as ActiveTab, label: 'Queue', icon: CalendarCheck },
    { id: 'doctors' as ActiveTab, label: 'Doctors', icon: UserCheck },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    onSelectTab(tab);
    setIsMoreSheetOpen(false);
  };

  const isPrimaryTabActive = primaryTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* Material Design 3 Bottom Navigation Bar (Hidden on Desktop, Fixed on Mobile) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 lg:hidden flex items-center justify-around h-16 px-2 shadow-2xl safe-area-bottom"
      >
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1.5 rounded-2xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-all ${
                  isActive ? 'bg-cyan-500/20 ring-1 ring-cyan-500/40 shadow-sm shadow-cyan-500/20' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 scale-105' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* 5th Tab: "More / All Modules" Bottom Sheet Trigger */}
        <button
          onClick={() => setIsMoreSheetOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1.5 rounded-2xl transition-all duration-150 active:scale-90 ${
            !isPrimaryTabActive || isMoreSheetOpen
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`flex items-center justify-center w-12 h-7 rounded-full transition-all ${
              !isPrimaryTabActive || isMoreSheetOpen
                ? 'bg-cyan-500/20 ring-1 ring-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : ''
            }`}
          >
            <Grid
              className={`w-5 h-5 ${
                !isPrimaryTabActive || isMoreSheetOpen ? 'text-cyan-400 scale-105' : 'text-slate-400'
              }`}
            />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Modules</span>
        </button>
      </nav>

      {/* Material Design 3 Bottom Sheet Modal for All Modules */}
      {isMoreSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMoreSheetOpen(false)}
          />

          {/* Android Bottom Sheet Drawer */}
          <div className="relative w-full max-h-[85vh] bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

            {/* Bottom Sheet Header */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-cyan-400" />
                  AegisCare Hospital Modules
                </h3>
                <p className="text-xs text-slate-400">Select clinical department or switch role</p>
              </div>
              <button
                onClick={() => setIsMoreSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1">
              {/* Role Switcher Chips (Material 3 Filter Chips) */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  Active Clinical Role
                </span>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => {
                    const isRoleActive = currentRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => onRoleChange(r.id)}
                        className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 min-h-[38px] ${
                          isRoleActive
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {isRoleActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modules Grid (Material 3 Cards) */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  All Clinical Departments
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {MODULE_LIST.map((mod) => {
                    const Icon = mod.icon;
                    const isModActive = activeTab === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleSelectTab(mod.id)}
                        className={`p-3.5 rounded-2xl text-left border flex items-center justify-between transition-all active:scale-95 min-h-[54px] ${
                          isModActive
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/50'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              isModActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">{mod.label}</span>
                        </div>
                        {mod.badge && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {mod.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
