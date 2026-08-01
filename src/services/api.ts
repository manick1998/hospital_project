export interface Patient {
  id: string;
  patientCode: string;
  fullName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    coverageLimit: number;
    status: string;
  };
  medicalHistory: string[];
  allergies: string[];
  type: 'OPD' | 'IPD' | 'EMERGENCY';
  bedNumber?: string | null;
  admittedAt?: string | null;
  createdAt?: string;
}

export interface Doctor {
  id: string;
  doctorCode: string;
  fullName: string;
  specialty: string;
  department: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  roomNumber: string;
  phone: string;
  email: string;
  schedule: {
    days: string[];
    timeSlots: string[];
  };
  status: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE';
  rating: number;
  avatar?: string;
}

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  temperature: number;
  spO2: number;
  respiratoryRate: number;
  weightKg: number;
  heightCm: number;
  recordedBy?: string;
  recordedAt?: string;
}

export interface Appointment {
  id: string;
  appointmentCode: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  type: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  queueToken: number;
  reason: string;
  vitals?: Vitals | null;
  createdAt?: string;
}

export interface PrescriptionMedication {
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
  dispensed?: boolean;
}

export interface Prescription {
  id: string;
  prescriptionCode: string;
  appointmentId?: string | null;
  patientId: string;
  patientName: string;
  patientAgeGender?: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  symptoms: string[];
  vitals?: Vitals | null;
  medications: PrescriptionMedication[];
  labTestsOrdered?: string[];
  followUpDate?: string | null;
  aiSafetyCheck?: {
    flagged: boolean;
    warnings: string[];
    summary: string;
  };
  status: 'ISSUED' | 'DISPENSED' | 'PARTIALLY_DISPENSED' | 'PENDING';
  createdAt?: string;
}

export interface LabResultItem {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' | string;
}

export interface LabReport {
  id: string;
  reportCode: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  testName: string;
  testCategory: string;
  specimenType?: string;
  collectedAt?: string;
  reportedAt?: string;
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CRITICAL_ALERT';
  results?: LabResultItem[];
  technicianNotes?: string;
  technicianName?: string;
  createdAt?: string;
}

export interface InvoiceItem {
  description: string;
  category: string;
  unitCost: number;
  quantity: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  patientId: string;
  patientName: string;
  patientCode?: string;
  patientPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  insuranceCoverage: number;
  paidAmount: number;
  balanceDue: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
  paymentMethod?: string;
  transactionReference?: string;
  dueDate?: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  stockQuantity: number;
  unit: string;
  reorderLevel: number;
  unitPrice: number;
  supplier: string;
  batchNumber: string;
  expiryDate: string;
  location: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
}

export interface Bed {
  id: string;
  bedNumber: string;
  ward: string;
  floorNumber: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  patientId?: string | null;
  patientName?: string | null;
  admittedAt?: string | null;
  dailyRate: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'EMERGENCY' | 'SUCCESS';
  read: boolean;
  link?: string;
  targetRole?: string;
}

export interface HospitalSettings {
  id?: string;
  hospitalName: string;
  registrationNumber?: string;
  tagline?: string;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  currencySymbol: string;
  taxRatePercentage: number;
  opdConsultationValidityDays: number;
  emergencyContactNumber?: string;
  enableAiAssistant: boolean;
  enableNotifications: boolean;
  themeMode: 'light' | 'dark' | 'system';
}

// API Fetchers
export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`/api/${endpoint}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
}

export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to post ${endpoint}`);
  }
  return res.json();
}

export async function apiPut<T>(endpoint: string, body: any): Promise<T> {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update ${endpoint}`);
  }
  return res.json();
}

export async function apiDelete(endpoint: string, id: string): Promise<any> {
  const res = await fetch(`/api/${endpoint}?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete ${endpoint}`);
  return res.json();
}
