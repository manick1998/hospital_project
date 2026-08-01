import { pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(), // 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'NURSE' | 'RECEPTIONIST' | 'PHARMACIST' | 'LAB_TECH'
  avatar: text('avatar'),
  department: text('department'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const patients = pgTable('patients', {
  id: text('id').primaryKey(),
  patientCode: text('patient_code').notNull().unique(),
  fullName: text('full_name').notNull(),
  dob: text('dob').notNull(),
  gender: text('gender').notNull(), // 'Male' | 'Female' | 'Other'
  bloodGroup: text('blood_group').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  emergencyContact: jsonb('emergency_contact').notNull(), // { name, relation, phone }
  insurance: jsonb('insurance').notNull(), // { provider, policyNumber, coverageLimit, status }
  medicalHistory: jsonb('medical_history').notNull(), // string[]
  allergies: jsonb('allergies').notNull(), // string[]
  type: text('type').notNull(), // 'OPD' | 'IPD' | 'EMERGENCY'
  bedNumber: text('bed_number'),
  admittedAt: text('admitted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const doctors = pgTable('doctors', {
  id: text('id').primaryKey(),
  doctorCode: text('doctor_code').notNull().unique(),
  fullName: text('full_name').notNull(),
  specialty: text('specialty').notNull(),
  department: text('department').notNull(),
  qualification: text('qualification').notNull(),
  experienceYears: integer('experience_years').notNull(),
  consultationFee: doublePrecision('consultation_fee').notNull(),
  roomNumber: text('room_number').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  schedule: jsonb('schedule').notNull(), // { days: string[], timeSlots: string[] }
  status: text('status').notNull(), // 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE'
  rating: doublePrecision('rating').default(5.0).notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  appointmentCode: text('appointment_code').notNull().unique(),
  patientId: text('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  patientPhone: text('patient_phone').notNull(),
  doctorId: text('doctor_id').notNull(),
  doctorName: text('doctor_name').notNull(),
  department: text('department').notNull(),
  date: text('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(), // 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  queueToken: integer('queue_token').notNull(),
  reason: text('reason').notNull(),
  vitals: jsonb('vitals'), // { bpSystolic, bpDiastolic, heartRate, temperature, spO2, respiratoryRate, weightKg, heightCm }
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const prescriptions = pgTable('prescriptions', {
  id: text('id').primaryKey(),
  prescriptionCode: text('prescription_code').notNull().unique(),
  appointmentId: text('appointment_id'),
  patientId: text('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  patientAgeGender: text('patient_age_gender'),
  doctorId: text('doctor_id').notNull(),
  doctorName: text('doctor_name').notNull(),
  diagnosis: text('diagnosis').notNull(),
  symptoms: jsonb('symptoms').notNull(), // string[]
  vitals: jsonb('vitals'),
  medications: jsonb('medications').notNull(), // Array<{ medicineName, dosage, frequency, durationDays, instructions, dispensed }>
  labTestsOrdered: jsonb('lab_tests_ordered'), // string[]
  followUpDate: text('follow_up_date'),
  aiSafetyCheck: jsonb('ai_safety_check'), // { flagged: boolean, warnings: string[], summary: string }
  status: text('status').notNull(), // 'ISSUED' | 'DISPENSED' | 'PARTIALLY_DISPENSED' | 'PENDING'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const labReports = pgTable('lab_reports', {
  id: text('id').primaryKey(),
  reportCode: text('report_code').notNull().unique(),
  patientId: text('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  doctorId: text('doctor_id'),
  doctorName: text('doctor_name'),
  testName: text('test_name').notNull(),
  testCategory: text('test_category').notNull(),
  specimenType: text('specimen_type'),
  collectedAt: text('collected_at'),
  reportedAt: text('reported_at'),
  status: text('status').notNull(), // 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CRITICAL_ALERT'
  results: jsonb('results'), // Array<{ parameter, value, unit, referenceRange, status }>
  technicianNotes: text('technician_notes'),
  technicianName: text('technician_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  invoiceCode: text('invoice_code').notNull().unique(),
  patientId: text('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  patientCode: text('patient_code'),
  patientPhone: text('patient_phone'),
  items: jsonb('items').notNull(), // Array<{ description, category, unitCost, quantity, amount }>
  subtotal: doublePrecision('subtotal').notNull(),
  discount: doublePrecision('discount').default(0).notNull(),
  tax: doublePrecision('tax').default(0).notNull(),
  insuranceCoverage: doublePrecision('insurance_coverage').default(0).notNull(),
  paidAmount: doublePrecision('paid_amount').default(0).notNull(),
  balanceDue: doublePrecision('balance_due').default(0).notNull(),
  status: text('status').notNull(), // 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED'
  paymentMethod: text('payment_method'), // 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'INSURANCE' | 'UPI'
  transactionReference: text('transaction_reference'),
  dueDate: text('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  itemCode: text('item_code').notNull().unique(),
  itemName: text('item_name').notNull(),
  category: text('category').notNull(),
  stockQuantity: integer('stock_quantity').notNull(),
  unit: text('unit').notNull(),
  reorderLevel: integer('reorder_level').notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  supplier: text('supplier').notNull(),
  batchNumber: text('batch_number').notNull(),
  expiryDate: text('expiry_date').notNull(),
  location: text('location').notNull(),
  status: text('status').notNull(), // 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const beds = pgTable('beds', {
  id: text('id').primaryKey(),
  bedNumber: text('bed_number').notNull().unique(),
  ward: text('ward').notNull(),
  floorNumber: integer('floor_number').notNull(),
  status: text('status').notNull(), // 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
  patientId: text('patient_id'),
  patientName: text('patient_name'),
  admittedAt: text('admitted_at'),
  dailyRate: doublePrecision('daily_rate').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  userId: text('user_id'),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(),
  module: text('module').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  severity: text('severity').notNull(), // 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'INFO' | 'WARNING' | 'EMERGENCY' | 'SUCCESS'
  read: boolean('read').default(false).notNull(),
  link: text('link'),
  targetRole: text('target_role').default('ALL').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const settings = pgTable('settings', {
  id: text('id').primaryKey(),
  hospitalName: text('hospital_name').notNull(),
  registrationNumber: text('registration_number'),
  tagline: text('tagline'),
  phone: text('phone').notNull(),
  email: text('email'),
  website: text('website'),
  address: text('address').notNull(),
  currencySymbol: text('currency_symbol').default('$').notNull(),
  taxRatePercentage: doublePrecision('tax_rate_percentage').default(5.0).notNull(),
  opdConsultationValidityDays: integer('opd_consultation_validity_days').default(15).notNull(),
  emergencyContactNumber: text('emergency_contact_number'),
  enableAiAssistant: boolean('enable_ai_assistant').default(true).notNull(),
  enableNotifications: boolean('enable_notifications').default(true).notNull(),
  themeMode: text('theme_mode').default('dark').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
