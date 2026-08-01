'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Printer,
  X,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Invoice, Patient, apiPost, apiPut } from '@/services/api';

interface BillingEngineProps {
  invoices: Invoice[];
  patients: Patient[];
  onRefresh: () => void;
}

export const BillingEngine: React.FC<BillingEngineProps> = ({ invoices, patients, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [printReceiptModal, setPrintReceiptModal] = useState<Invoice | null>(null);

  // New Invoice State
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [discount, setDiscount] = useState('20');
  const [items, setItems] = useState([
    { description: 'Cardiology Consultation Fee', category: 'Consultation', unitCost: 150, quantity: 1, amount: 150 },
    { description: '12-Lead Electrocardiogram (ECG)', category: 'Diagnostics', unitCost: 85, quantity: 1, amount: 85 },
  ]);

  // Payment Form State
  const [payAmount, setPayAmount] = useState('100');
  const [payMethod, setPayMethod] = useState('CREDIT_CARD');
  const [txnRef, setTxnRef] = useState('TXN-881923');

  const handleAddItem = () => {
    setItems([...items, { description: '', category: 'General', unitCost: 50, quantity: 1, amount: 50 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patient = patients.find((p) => p.id === patientId);

      await apiPost('billing', {
        patientId,
        patientName: patient?.fullName || 'Patient',
        patientCode: patient?.patientCode || '',
        patientPhone: patient?.phone || '',
        items,
        discount: Number(discount) || 0,
        insuranceCoverage: patient?.insurance?.status === 'ACTIVE' ? 100 : 0,
      });

      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    }
  };

  const handleProcessPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    try {
      await apiPut('billing', {
        id: paymentModalInvoice.id,
        paymentAmount: Number(payAmount),
        paymentMethod: payMethod,
        transactionReference: txnRef,
      });

      setPaymentModalInvoice(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Payment failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            Billing Engine & Insurance Claim Cashier
          </h2>
          <p className="text-xs text-slate-400">
            Itemized hospital invoices, insurance claim adjustments & payment receipts
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 flex items-center gap-2 shadow-lg shadow-amber-950 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Invoice Code</th>
                <th className="px-4 py-3.5">Patient Details</th>
                <th className="px-4 py-3.5">Subtotal / Tax</th>
                <th className="px-4 py-3.5">Insurance Claim</th>
                <th className="px-4 py-3.5">Total & Balance Due</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-amber-400 text-sm">
                    {inv.invoiceCode}
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-bold text-white">{inv.patientName}</div>
                    <div className="text-[10px] text-slate-500">{inv.patientCode}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div>Subtotal: <span className="font-bold text-white">${inv.subtotal}</span></div>
                    <div className="text-[10px] text-slate-400">Tax: ${inv.tax} • Disc: ${inv.discount}</div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> ${inv.insuranceCoverage}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-bold text-white text-sm">
                      ${Math.max(0, (inv.subtotal || 0) - (inv.discount || 0) + (inv.tax || 0) - (inv.insuranceCoverage || 0)).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-rose-400 font-bold">Due: ${inv.balanceDue}</div>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : inv.status === 'PARTIALLY_PAID'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => {
                            setPaymentModalInvoice(inv);
                            setPayAmount(inv.balanceDue.toString());
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold transition-all flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Receive Payment
                        </button>
                      )}
                      <button
                        onClick={() => setPrintReceiptModal(inv)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Itemized Invoice Generator
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
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

              {/* Items builder */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Line Items</span>
                  <button type="button" onClick={handleAddItem} className="text-[11px] text-amber-400 font-bold hover:underline">
                    + Add Charge Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[index].description = e.target.value;
                        setItems(updated);
                      }}
                      className="col-span-6 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]"
                    />
                    <input
                      type="number"
                      placeholder="Cost"
                      value={item.unitCost}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[index].unitCost = Number(e.target.value);
                        updated[index].amount = updated[index].unitCost * updated[index].quantity;
                        setItems(updated);
                      }}
                      className="col-span-3 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="col-span-3 p-2 text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Special Discount ($)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-950 mt-2"
              >
                Generate Invoice Document
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" /> Process Cashier Payment
              </h3>
              <button onClick={() => setPaymentModalInvoice(null)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Amount ($)</label>
                <input
                  required
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                >
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / Digital Transfer</option>
                  <option value="INSURANCE">Insurance Claim Direct</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-950 mt-2"
              >
                Confirm Payment Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {printReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-xl font-black text-amber-900">AEGISCARE MEDICAL CENTER</h2>
                <p className="text-xs text-slate-500">Official Cashier Payment Receipt</p>
              </div>
              <button onClick={() => setPrintReceiptModal(null)} className="p-2 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-2 border-b pb-4 border-slate-200">
              <div><span className="font-bold text-slate-500">Invoice Ref:</span> {printReceiptModal.invoiceCode}</div>
              <div><span className="font-bold text-slate-500">Patient:</span> {printReceiptModal.patientName}</div>
              <div><span className="font-bold text-slate-500">Paid Amount:</span> ${printReceiptModal.paidAmount}</div>
              <div><span className="font-bold text-slate-500">Balance Due:</span> ${printReceiptModal.balanceDue}</div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700">✓ Verified Receipt</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
