'use client';

import React, { useState } from 'react';
import {
  Activity,
  Bell,
  Sparkles,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  X,
  Stethoscope,
  HeartPulse,
  Menu,
} from 'lucide-react';
import { AppNotification } from '@/services/api';

interface HeaderProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  onOpenAiAssistant: () => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  hospitalName?: string;
  onOpenMobileMenu?: () => void;
}

const ROLES = [
  { id: 'ADMIN', label: 'Hospital Admin', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { id: 'DOCTOR', label: 'Attending Doctor', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { id: 'NURSE', label: 'Ward Nurse', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { id: 'RECEPTIONIST', label: 'Reception / Triage', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { id: 'PHARMACIST', label: 'Chief Pharmacist', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { id: 'LAB_TECH', label: 'Lab Technician', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenAiAssistant,
  notifications,
  onMarkNotificationsRead,
  hospitalName = 'AegisCare Medical Center',
  onOpenMobileMenu,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeRoleObj = ROLES.find((r) => r.id === currentRole) || ROLES[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      {/* Critical Alert Ticker */}
      <div className="bg-gradient-to-r from-rose-900/80 via-amber-900/60 to-rose-900/80 border-b border-rose-500/30 px-3 sm:px-4 py-1.5 text-xs text-rose-200 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
            EMERGENCY LIVE FEED
          </span>
          <span className="truncate text-[11px] sm:text-xs">
            Critical Alert: Patient Eleanor Vance (Bed ICU-02) - High Troponin-I Level (1.45 ng/mL). Trauma Bay-01 Occupied.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 font-mono text-emerald-400">
            <HeartPulse className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> System Online (99.99%)
          </span>
        </div>
      </div>

      <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Brand Logo & Hospital Name */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-lg text-white tracking-tight leading-none font-sans">
                {hospitalName}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full uppercase tracking-wider">
                Enterprise HMS v4.2
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-400 font-medium">
              Precision Healthcare & Clinical Intelligence System
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* AI Clinical Copilot Trigger */}
          <button
            onClick={onOpenAiAssistant}
            className="group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-md shadow-purple-500/20 ring-1 ring-purple-400/30 transition-all duration-200 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">AI Diagnostic Copilot</span>
            <span className="sm:hidden">AI Assistant</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
          </button>

          {/* Role Switching Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${activeRoleObj.color} hover:bg-slate-800/60`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="font-semibold">{activeRoleObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (Demo Mode)
                </div>
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      onRoleChange(role.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left hover:bg-slate-800/80 transition-colors ${
                      currentRole === role.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${role.color.split(' ')[0]}`}></span>
                      {role.label}
                    </span>
                    {currentRole === role.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 py-3 z-50">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-sm text-white">Notifications</span>
                  </div>
                  <button
                    onClick={() => {
                      onMarkNotificationsRead();
                      setShowNotifications(false);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 my-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-800/50 ${
                          !n.read ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'EMERGENCY' ? (
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : n.type === 'WARNING' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <Stethoscope className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-semibold text-slate-200">{n.title}</span>
                              <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                            </div>
                            <p className="text-slate-400 leading-snug">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800">
              SV
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white leading-tight">Dr. Sarah Connor</div>
              <div className="text-[10px] text-slate-400">Chief Medical Officer</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
