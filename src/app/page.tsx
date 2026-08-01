'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar, ActiveTab } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AiClinicalAssistantModal } from '@/components/ai/AiClinicalAssistantModal';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { PatientRegistry } from '@/components/patients/PatientRegistry';
import { DoctorRoster } from '@/components/doctors/DoctorRoster';
import { AppointmentManager } from '@/components/appointments/AppointmentManager';
import { PrescriptionBuilder } from '@/components/prescriptions/PrescriptionBuilder';
import { LabDesk } from '@/components/laboratory/LabDesk';
import { NursingStation } from '@/components/nursing/NursingStation';
import { BillingEngine } from '@/components/billing/BillingEngine';
import { InventoryManager } from '@/components/inventory/InventoryManager';
import { ReceptionDesk } from '@/components/reception/ReceptionDesk';
import { AnalyticsReports } from '@/components/reports/AnalyticsReports';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';
import { HospitalSettingsView } from '@/components/settings/HospitalSettingsView';
import {
  Patient,
  Doctor,
  Appointment,
  Prescription,
  LabReport,
  Invoice,
  InventoryItem,
  Bed,
  AuditLog,
  AppNotification,
  HospitalSettings,
  apiGet,
  apiPut,
} from '@/services/api';

const defaultSettings: HospitalSettings = {
  hospitalName: 'AegisCare Medical Center',
  phone: '+1 (800) 555-0199',
  address: '750 Healthcare Blvd, NY',
  currencySymbol: '$',
  taxRatePercentage: 5,
  opdConsultationValidityDays: 14,
  enableAiAssistant: true,
  enableNotifications: true,
  themeMode: 'dark',
};

export default function HospitalApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<string>('ADMIN');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labs, setLabs] = useState<LabReport[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>(defaultSettings);

  const [loading, setLoading] = useState(true);

  // Load all initial data from PostgreSQL REST API
  const loadAllData = useCallback(async () => {
    try {
      const [
        pData,
        dData,
        aData,
        rxData,
        lData,
        invData,
        invenData,
        bData,
        logData,
        notifData,
        setData,
      ] = await Promise.all([
        apiGet<Patient[]>('patients').catch(() => []),
        apiGet<Doctor[]>('doctors').catch(() => []),
        apiGet<Appointment[]>('appointments').catch(() => []),
        apiGet<Prescription[]>('prescriptions').catch(() => []),
        apiGet<LabReport[]>('lab').catch(() => []),
        apiGet<Invoice[]>('billing').catch(() => []),
        apiGet<InventoryItem[]>('inventory').catch(() => []),
        apiGet<Bed[]>('beds').catch(() => []),
        apiGet<AuditLog[]>('audit').catch(() => []),
        apiGet<AppNotification[]>('notifications').catch(() => []),
        apiGet<HospitalSettings>('settings').catch(() => defaultSettings),
      ]);

      setPatients(pData);
      setDoctors(dData);
      setAppointments(aData);
      setPrescriptions(rxData);
      setLabs(lData);
      setInvoices(invData);
      setInventory(invenData);
      setBeds(bData);
      setAuditLogs(logData);
      setNotifications(notifData);
      if (setData && setData.hospitalName) {
        setHospitalSettings({
          ...setData,
          themeMode: (setData.themeMode as 'light' | 'dark' | 'system') || 'dark',
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadAllData();
    };
    init();
  }, [loadAllData]);

  const handleMarkNotificationsRead = async () => {
    try {
      await apiPut('notifications', { markAllRead: true });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        hospitalName={hospitalSettings.hospitalName}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          currentRole={currentRole}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Work View */}
        <main className="flex-1 overflow-y-auto bg-slate-950 w-full min-w-0 pb-20 lg:pb-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-mono">
              Bootstrapping AegisCare Hospital Intelligence System & PostgreSQL Database...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  patients={patients}
                  doctors={doctors}
                  appointments={appointments}
                  beds={beds}
                  inventory={inventory}
                  labs={labs}
                  onNavigate={setActiveTab}
                  onOpenAi={() => setIsAiModalOpen(true)}
                />
              )}

              {activeTab === 'patients' && (
                <PatientRegistry
                  patients={patients}
                  prescriptions={prescriptions}
                  labs={labs}
                  invoices={invoices}
                  beds={beds}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'doctors' && (
                <DoctorRoster doctors={doctors} onRefresh={loadAllData} />
              )}

              {activeTab === 'appointments' && (
                <AppointmentManager
                  appointments={appointments}
                  doctors={doctors}
                  patients={patients}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'prescriptions' && (
                <PrescriptionBuilder
                  prescriptions={prescriptions}
                  patients={patients}
                  doctors={doctors}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'lab' && (
                <LabDesk
                  labs={labs}
                  patients={patients}
                  doctors={doctors}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'nursing' && (
                <NursingStation
                  beds={beds}
                  patients={patients}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'billing' && (
                <BillingEngine
                  invoices={invoices}
                  patients={patients}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryManager
                  inventory={inventory}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'reception' && (
                <ReceptionDesk
                  patients={patients}
                  appointments={appointments}
                  doctors={doctors}
                  beds={beds}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'reports' && <AnalyticsReports />}

              {activeTab === 'audit' && <AuditLogViewer logs={auditLogs} />}

              {activeTab === 'settings' && (
                <HospitalSettingsView
                  settings={hospitalSettings}
                  onRefresh={loadAllData}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* AI Diagnostic Assistant Modal */}
      <AiClinicalAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Material Design 3 Bottom Navigation Bar for Mobile */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />
    </div>
  );
}
