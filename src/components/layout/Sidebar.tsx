'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  FileText,
  TestTube2,
  BedDouble,
  Receipt,
  Package,
  DoorOpen,
  BarChart3,
  ShieldCheck,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'patients'
  | 'doctors'
  | 'appointments'
  | 'prescriptions'
  | 'lab'
  | 'nursing'
  | 'billing'
  | 'inventory'
  | 'reception'
  | 'reports'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  allowedRoles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patient Registry & EHR', icon: Users, badge: '5' },
  { id: 'doctors', label: 'Doctor Roster', icon: UserCheck },
  { id: 'appointments', label: 'Appointments & Queue', icon: CalendarCheck, badge: 'Live' },
  { id: 'prescriptions', label: 'E-Prescriptions & AI', icon: FileText },
  { id: 'lab', label: 'Lab Diagnostics Desk', icon: TestTube2, badge: '1 Alert' },
  { id: 'nursing', label: 'Nursing & IPD Wards', icon: BedDouble },
  { id: 'billing', label: 'Billing & Insurance', icon: Receipt },
  { id: 'inventory', label: 'Pharmacy & Supplies', icon: Package, badge: 'Low Stock' },
  { id: 'reception', label: 'Reception & Triage', icon: DoorOpen },
  { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'audit', label: 'Security & Audit Logs', icon: ShieldCheck },
  { id: 'settings', label: 'Hospital Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen = false,
  onClose,
}) => {
  const handleTabClick = (id: ActiveTab) => {
    onSelectTab(id);
    if (onClose) {
      onClose();
    }
  };

  const navContent = (
    <>
      <div className="py-4 px-3 space-y-1 overflow-y-auto flex-1">
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Hospital Modules
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400 scale-110' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.badge.includes('Alert') || item.badge.includes('Low')
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : item.badge === 'Live'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 text-slate-300 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">AI Diagnostic Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug mb-2">
          Real-time cross-drug allergy detection & symptom differential diagnosis enabled.
        </p>
        <div className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Active & Guarding
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Static Sidebar (Hidden on Mobile, Visible on Large Screens lg:flex) */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800 bg-slate-950/90 flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* 2. Mobile Drawer Overlay (Visible on small screens only when isOpen is true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={onClose}
          />
          {/* Sliding Sidebar Drawer */}
          <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
