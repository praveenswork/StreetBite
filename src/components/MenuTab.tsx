/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Trash2, 
  CheckCircle, 
  X, 
  FolderPlus,
  Coins,
  AlertCircle
} from 'lucide-react';
import { MenuItem } from '../types';

interface MenuTabProps {
  menuItems: MenuItem[];
  onAddItem: (itemDetails: { name: string; price: number; category: string }) => Promise<void>;
  onToggleAvailable: (itemId: string, currentAvailable: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

export function MenuTab({ 
  menuItems, 
  onAddItem, 
  onToggleAvailable, 
  onDeleteItem 
}: MenuTabProps) {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState('');
  const [newItemPrice, setNewItemPrice] = React.useState('');
  const [newItemCategory, setNewItemCategory] = React.useState('Chaat Specials');
  const [formError, setFormError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Group menu by categories
  const groupedMenu = React.useMemo<Record<string, MenuItem[]>>(() => {
    const groups: Record<string, MenuItem[]> = {};
    menuItems.forEach((item) => {
      const cat = item.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });
    return groups;
  }, [menuItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newItemName.trim()) {
      setFormError('Item name is required');
      return;
    }
    const priceNum = Number(newItemPrice);
    if (!newItemPrice || isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price (greater than ₹0)');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddItem({
        name: newItemName.trim(),
        price: priceNum,
        category: newItemCategory.trim() || 'General',
      });
      
      // Cleanup inputs
      setNewItemName('');
      setNewItemPrice('');
      setNewItemCategory('Chaat Specials');
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add item. Check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-heading">Menu Manager</h2>
          <p className="text-xs text-gray-500">Edit, add, and toggle item availabilities for street customers.</p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="bg-[#FD7979] text-white hover:bg-[#eb6767] transition py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-red-100 cursor-pointer"
          id="btn-add-item-modal-open"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Show grid list */}
      {menuItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-gray-800">Your Menu is Empty</h3>
            <p className="text-xs text-gray-400 mt-0.5">Stalls need menu items so customers can select and place orders!</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-[#FD7979] hover:underline"
          >
            Create your first dish now &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="space-y-3">
              {/* Category section head */}
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-4 bg-red-400 rounded-full"></span>
                <h3 className="font-heading font-extrabold text-[#FD7979] text-sm uppercase tracking-wider">{category}</h3>
                <span className="text-xs font-mono text-gray-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {(items as MenuItem[]).length} items
                </span>
              </div>

              {/* Items Card List Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(items as MenuItem[]).map((item) => (
                  <div 
                    key={item.id}
                    className={`bg-white rounded-xl border border-slate-100/80 p-4 shadow-sm flex items-center justify-between gap-4 transition duration-150 group hover:border-[#FD7979]/30 relative overflow-hidden ${
                      !item.isAvailable ? 'opacity-70 bg-slate-50/70 border-dashed' : ''
                    }`}
                  >
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-[15px] text-gray-800 truncate block">{item.name}</span>
                        {!item.isAvailable && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase scale-90 shrink-0 font-mono">
                            Sold Out
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-sm font-extrabold text-gray-900 block">₹{item.price}</span>
                    </div>

                    {/* Stock available switch & deletion */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Live Toggle button */}
                      <button
                        onClick={() => onToggleAvailable(item.id, item.isAvailable)}
                        className={`text-[10px] font-semibold py-1.5 px-3 rounded-full border transition cursor-pointer ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200'
                        }`}
                        id={`toggle-avail-${item.id}`}
                      >
                        {item.isAvailable ? 'Available' : 'Sold Out'}
                      </button>

                      {/* Delete trashcan button */}
                      <button
                        onClick={() => {
                          if (confirm(`Do you really want to delete ${item.name}?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer transition"
                        title="Delete Dish"
                        id={`delete-dish-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add dish Modal Form dialog overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-up border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-base text-gray-900">Add New Food Dish</h3>
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
              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Dish Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samosa Chaat Double"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#FDACAC] focus:border-transparent outline-none rounded-xl py-2.5 px-3 text-sm transition text-gray-800 font-semibold"
                  disabled={isSubmitting}
                  id="input-dish-name"
                />
              </div>

              {/* Price & Category grouped */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Price (₹ INR) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#FDACAC] focus:border-transparent outline-none rounded-xl py-2.5 px-3 text-sm transition text-gray-800 font-semibold font-mono"
                    disabled={isSubmitting}
                    id="input-dish-price"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Stall Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#FDACAC]/30 focus:border-transparent outline-none rounded-xl py-2.5 px-3 text-sm transition text-gray-800 font-semibold cursor-pointer"
                    disabled={isSubmitting}
                    id="input-dish-category"
                  >
                    <option value="Chaat Specials">Chaat Plates</option>
                    <option value="Sweets & Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Vada Pav Corner">Vada Pav Corner</option>
                    <option value="Main Plates">Main Dishes</option>
                    <option value="General">General Bite</option>
                  </select>
                </div>
              </div>

              {/* Button panels */}
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
                  id="btn-add-item-submit"
                >
                  {isSubmitting ? 'Creating...' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
