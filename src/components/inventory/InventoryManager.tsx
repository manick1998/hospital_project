'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  AlertOctagon,
  RefreshCw,
  X,
  Search,
} from 'lucide-react';
import { InventoryItem, apiPost, apiPut } from '@/services/api';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onRefresh: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, onRefresh }) => {
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [restockQty, setRestockQty] = useState('100');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Item State
  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'Antihypertensives',
    stockQuantity: '200',
    unit: 'Tablets',
    reorderLevel: '50',
    unitPrice: '1.25',
    supplier: 'Novartis Global',
    batchNumber: 'B2026-800',
    expiryDate: '2028-12-31',
    location: 'Rack A-01',
  });

  const filteredInventory = inventory.filter(
    (i) =>
      i.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;

    try {
      await apiPut('inventory', {
        id: restockModalItem.id,
        restockQty: Number(restockQty),
      });

      setRestockModalItem(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Restock failed');
    }
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('inventory', newItem);
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to add inventory item');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            Pharmacy & Medical Supplies Inventory
          </h2>
          <p className="text-xs text-slate-400">
            Real-time drug stock level tracking, batch numbers, expiry dates & reorder thresholds
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 flex items-center gap-2 shadow-lg shadow-purple-950 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supply Item</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by drug name, batch code, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-white focus:outline-none"
        />
      </div>

      {/* 1. Mobile Android Card List (Material Design 3 - md:hidden) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredInventory.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col gap-3"
          >
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-purple-400">{item.itemCode}</span>
                <div className="font-bold text-white text-sm mt-0.5">{item.itemName}</div>
                <div className="text-[11px] text-slate-400">{item.category} • {item.location}</div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                  item.status === 'LOW_STOCK'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : item.status === 'OUT_OF_STOCK'
                    ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
              <div>
                <span className="text-slate-400 text-[11px]">In Stock:</span>
                <div className="font-mono font-bold text-white text-base">
                  {item.stockQuantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Expiry:</span>
                <div className="font-mono font-bold text-amber-300 text-xs">{item.expiryDate}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px]">Price:</span>
                <div className="font-mono font-bold text-cyan-400 text-base">${item.unitPrice}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setRestockModalItem(item);
                  setRestockQty('50');
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs active:scale-95 transition-all min-h-[44px] flex items-center justify-center gap-1.5 shadow-md shadow-purple-950"
              >
                <RefreshCw className="w-4 h-4" /> Restock Supply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Desktop Inventory Table (hidden on mobile md:hidden, visible on desktop md:block) */}
      <div className="hidden md:block rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Item Code / Drug Name</th>
                <th className="px-4 py-3.5">Category & Location</th>
                <th className="px-4 py-3.5">Stock Quantity</th>
                <th className="px-4 py-3.5">Batch / Expiry</th>
                <th className="px-4 py-3.5">Unit Price</th>
                <th className="px-4 py-3.5">Stock Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-white text-sm">{item.itemName}</div>
                    <div className="text-[10px] font-mono text-purple-400">{item.itemCode}</div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-slate-300">{item.category}</div>
                    <div className="text-[10px] text-slate-500">{item.location}</div>
                  </td>

                  <td className="px-4 py-4 font-mono font-bold text-white text-sm">
                    {item.stockQuantity} <span className="text-[10px] font-sans text-slate-400">{item.unit}</span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-slate-300 font-mono">{item.batchNumber}</div>
                    <div className="text-[10px] text-slate-500">Exp: {item.expiryDate}</div>
                  </td>

                  <td className="px-4 py-4 font-bold text-emerald-400 font-mono">
                    ${item.unitPrice}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'LOW_STOCK' || item.stockQuantity <= item.reorderLevel
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.stockQuantity <= item.reorderLevel ? 'LOW STOCK' : item.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setRestockModalItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500 hover:text-slate-950 text-purple-300 font-bold transition-all flex items-center gap-1 ml-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Android Material Design 3 Floating Action Button (FAB) for Adding Supply Item on Mobile */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/40 flex items-center justify-center hover:scale-105 active:scale-90 transition-all md:hidden"
        aria-label="Add new supply item"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" /> Restock {restockModalItem.itemName}
              </h3>
              <button onClick={() => setRestockModalItem(null)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Quantity to Add ({restockModalItem.unit})</label>
                <input
                  required
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold text-purple-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-950 mt-2"
              >
                Confirm Restock Quantity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Supply Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" /> Add New Inventory Entry
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Item / Medicine Name *</label>
                <input
                  required
                  type="text"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    value={newItem.stockQuantity}
                    onChange={(e) => setNewItem({ ...newItem, stockQuantity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-950 mt-2"
              >
                Add Inventory Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
