/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Store, 
  ShoppingBag, 
  UtensilsCrossed, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Play,
  Pause,
  MapPin,
  Compass
} from 'lucide-react';
import { Vendor } from '../types';

interface DashboardLayoutProps {
  vendor: Vendor;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onUpdateVendor: (v: Vendor) => void;
  children: React.ReactNode;
}

export function DashboardLayout({ 
  vendor, 
  activeTab, 
  onTabChange, 
  onLogout,
  onUpdateVendor,
  children 
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'home', label: 'Overview', icon: Compass },
    { id: 'orders', label: 'Active Orders', icon: ShoppingBag, badge: true },
    { id: 'menu', label: 'Menu Manager', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Inventory list', icon: ClipboardList },
    { id: 'reports', label: 'Sales Reports', icon: BarChart3 },
    { id: 'settings', label: 'My Stall Settings', icon: Settings },
  ];

  // Async toggle accepting orders
  const handleToggleAccepting = async () => {
    try {
      const token = localStorage.getItem('streetbite_token');
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
        body: JSON.stringify({
          isAcceptingOrders: !vendor.isAcceptingOrders
        })
      });
      if (response.ok) {
        const data = await response.json();
        onUpdateVendor(data.vendor);
      }
    } catch (e) {
      console.error('Error toggling accepting orders', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FD7979] text-white flex items-center justify-center rounded-lg shadow-sm">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[15px] tracking-tight text-gray-900 leading-none">{vendor.stallName}</h1>
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5 mt-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {vendor.stallCategory}
            </span>
          </div>
        </div>

        {/* Master Pause switch for Mobile in Top navbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAccepting}
            className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
              vendor.isAcceptingOrders 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {vendor.isAcceptingOrders ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live</span>
              </>
            ) : (
              <>
                <Pause className="w-3 h-3" />
                <span>Paused</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0 sticky top-0 h-screen p-5">
        {/* Brand Banner */}
        <div className="flex items-center gap-2 px-1 pb-6 mb-2 border-b border-slate-50">
          <div className="w-9 h-9 bg-[#FD7979] text-white flex items-center justify-center rounded-xl shadow-md">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-lg text-gray-900 leading-none block">Street<span className="text-[#FD7979]">Bite</span></span>
            <span className="text-[10px] block font-mono text-gray-400">VENDOR DESK</span>
          </div>
        </div>

        {/* Vendor Quick Card */}
        <div className="bg-slate-50 p-3 rounded-lg space-y-1 mb-6">
          <div className="font-heading font-bold text-xs text-gray-400 uppercase tracking-wider">Active Stall</div>
          <p className="font-bold text-sm text-gray-800 line-clamp-1">{vendor.stallName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${vendor.isAcceptingOrders ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {vendor.isAcceptingOrders ? 'Accepting Orders' : 'Orders Paused'}
          </p>

          <button
            onClick={handleToggleAccepting}
            className={`w-full mt-2 cursor-pointer py-1 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition ${
              vendor.isAcceptingOrders
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            {vendor.isAcceptingOrders ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pause New Orders</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Resume Orders</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left py-2.5 px-3 rounded-lg flex items-center justify-between transition font-medium text-sm ${
                  isActive 
                    ? 'bg-red-50 text-[#FD7979]' 
                    : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
                }`}
                id={`nav-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FD7979]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Action Bottom */}
        <div className="border-t border-slate-100 pt-4 mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold font-mono">
              {vendor.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{vendor.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{vendor.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-left py-2 px-3 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2.5 text-xs font-medium"
            id="btn-logout-sidebar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Stall</span>
          </button>
        </div>
      </aside>

      {/* Core Tab Body view wrapper */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:p-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar Navigation */}
      <nav className="md:hidden bg-white border-t border-slate-100 grid grid-cols-6 fixed bottom-0 left-0 right-0 h-16 z-40 px-1 py-1 text-center shadow-lg">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center rounded-lg py-1 transition ${
                isActive ? 'text-[#FD7979]' : 'text-gray-400 hover:text-gray-600'
              }`}
              id={`m-nav-${item.id}`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              {/* Abbreviated label */}
              <span className="text-[9px] font-medium tracking-tight">
                {item.id === 'home' ? 'Home' : item.id === 'orders' ? 'Orders' : item.id === 'menu' ? 'Menu' : item.id === 'inventory' ? 'Stock' : item.id === 'reports' ? 'Charts' : 'Profile'}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
