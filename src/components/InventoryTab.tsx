/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  X,
  AlertCircle,
  Minus,
  Settings
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryTabProps {
  inventory: InventoryItem[];
  onAddInventory: (itemDetails: {
    itemName: string;
    unit: string;
    currentStock: number | null;
    lowStockThreshold: number | null;
    hasCountTracking: boolean;
  }) => Promise<void>;
  onUpdateStock: (itemId: string, incrementValue: number) => Promise<void>;
  onDeleteInventory: (itemId: string) => Promise<void>;
  onEditInventory: (itemId: string, updatedFields: Partial<InventoryItem>) => Promise<void>;
}

export function InventoryTab({
  inventory,
  onAddInventory,
  onUpdateStock,
  onDeleteInventory,
  onEditInventory,
}: InventoryTabProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [itemName, setItemName] = React.useState('');
  const [unit, setUnit] = React.useState('kg');
  const [hasCountTracking, setHasCountTracking] = React.useState(false);
  const [currentStock, setCurrentStock] = React.useState('');
  const [lowStockThreshold, setLowStockThreshold] = React.useState('');
  const [formError, setFormError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!itemName.trim()) {
      setFormError('Item name is required');
      return;
    }

    let stockVal: number | null = null;
    let thresholdVal: number | null = null;

    if (hasCountTracking) {
      const stockNum = Number(currentStock);
      const thresholdNum = Number(lowStockThreshold);
      if (!currentStock || isNaN(stockNum) || stockNum < 0) {
        setFormError('Please enter a valid starting count (≥ 0)');
        return;
      }
      if (!lowStockThreshold || isNaN(thresholdNum) || thresholdNum < 0) {
        setFormError('Please enter a valid alarm threshold limit (≥ 0)');
        return;
      }
      stockVal = stockNum;
      thresholdVal = thresholdNum;
    }

    try {
      setIsSubmitting(true);
      await onAddInventory({
        itemName: itemName.trim(),
        unit,
        currentStock: stockVal,
        lowStockThreshold: thresholdVal,
        hasCountTracking,
      });

      setItemName('');
      setUnit('kg');
      setHasCountTracking(false);
      setCurrentStock('');
      setLowStockThreshold('');
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Error configuring inventory stock row.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-heading">Inventory Sheets</h2>
          <p className="text-xs text-gray-500">Track raw stall ingredients. Keep count trackers live to autodeduct on order placement.</p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="bg-gray-900 text-white hover:bg-gray-800 transition py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          id="btn-add-inv-modal-open"
        >
          <Plus className="w-4 h-4 text-[#FD7979]" />
          <span>Add Raw Item</span>
        </button>
      </div>

      {inventory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-gray-800">Your Inventory Sheet is Empty</h3>
            <p className="text-xs text-gray-400 mt-0.5">Start tracking staples like Potatoes, Pav buns, spices, oil, or Milk.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-[#FD7979] hover:underline"
          >
            Create first ingredient &rarr;
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table view */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Ingredient Name</th>
                  <th className="py-3 px-4">Tracking Style</th>
                  <th className="py-3 px-4 text-center">Remaining Stock</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventory.map((row) => {
                  const isLowStock = 
                    row.hasCountTracking && 
                    row.currentStock !== null && 
                    row.lowStockThreshold !== null &&
                    row.currentStock <= row.lowStockThreshold;

                  return (
                    <tr 
                      key={row.id} 
                      className={`transition ${isLowStock ? 'bg-amber-50/50 hover:bg-amber-100/50' : 'hover:bg-slate-50/40'}`}
                    >
                      {/* Name & unit */}
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        <div className="flex flex-col">
                          <span>{row.itemName}</span>
                          <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Unit: {row.unit}</span>
                        </div>
                      </td>

                      {/* Tracking method status */}
                      <td className="py-3.5 px-4">
                        {row.hasCountTracking ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-blue-100/50">
                            Quantities
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-gray-500 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-slate-200">
                            Prevalent presence
                          </span>
                        )}
                      </td>

                      {/* Remaining Count with +/- buttons */}
                      <td className="py-3.5 px-4">
                        {row.hasCountTracking && row.currentStock !== null ? (
                          <div className="flex items-center justify-center gap-2.5">
                            <button
                              onClick={() => onUpdateStock(row.id, -1)}
                              className="w-6 h-6 cursor-pointer hover:bg-slate-200 bg-slate-100 rounded-full flex items-center justify-center text-xs text-gray-600 transition"
                              title="Decrement"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            
                            <span className={`font-mono font-bold text-sm min-w-[30px] text-center ${isLowStock ? 'text-amber-600 text-base font-extrabold flex items-center justify-center gap-1' : 'text-gray-900'}`}>
                              {row.currentStock}
                              {isLowStock && (
                                <span title="Low Stock alarm!">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                              )}
                            </span>

                            <button
                              onClick={() => onUpdateStock(row.id, 1)}
                              className="w-6 h-6 cursor-pointer hover:bg-slate-200 bg-slate-100 rounded-full flex items-center justify-center text-xs text-gray-600 transition"
                              title="Increment"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 italic">In Stock</div>
                        )}
                      </td>

                      {/* Action trigger delete */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Do you want to delete ${row.itemName} from tracking?`)) {
                              onDeleteInventory(row.id);
                            }
                          }}
                          className="text-gray-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition"
                          title="Delete Ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add raw item Modal wrapper screen */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-up border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-gray-900">Add Raw Ingredient</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Ingredient Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Potatoes, Butter blocks, Pav buns"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#FDACAC] focus:border-transparent outline-none rounded-xl py-2.5 px-3 text-sm transition text-gray-800 font-semibold"
                  disabled={isSubmitting}
                  id="input-inv-name"
                />
              </div>

              {/* Unit selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Unit notation</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#FDACAC] focus:border-transparent outline-none rounded-xl py-2.5 px-3 text-sm transition text-gray-800 font-semibold cursor-pointer"
                  disabled={isSubmitting}
                  id="input-inv-unit"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="litre">Litres (L)</option>
                  <option value="pieces">Pieces (pcs)</option>
                  <option value="other">Other package</option>
                </select>
              </div>

              {/* Optional has Count tracking box toggle */}
              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-700 block">Enable Quantity Tracking</span>
                    <span className="text-[10px] text-gray-400 block leading-tight">Tracks numbers and sets low-stock sensor alerts.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasCountTracking}
                    onChange={(e) => setHasCountTracking(e.target.checked)}
                    className="w-4.5 h-4.5 text-[#FD7979] focus:ring-0 rounded cursor-pointer"
                    id="checkbox-has-tracking"
                  />
                </div>

                {hasCountTracking && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/50 animate-fade-in">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Initial Stock</span>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        value={currentStock}
                        onChange={(e) => setCurrentStock(e.target.value)}
                        className="w-full bg-white border border-slate-200 outline-none rounded-lg p-2 text-xs font-semibold font-mono"
                        id="input-inv-stock"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Alarm Threshold</span>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
                        className="w-full bg-white border border-slate-200 outline-none rounded-lg p-2 text-xs font-semibold font-mono"
                        id="input-inv-threshold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation button panels */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FD7979] text-white hover:bg-[#eb6767] py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  disabled={isSubmitting}
                  id="btn-add-inv-submit"
                >
                  {isSubmitting ? 'Adding...' : 'Add Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
