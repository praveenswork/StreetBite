/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  UtensilsCrossed, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { Order, MenuItem, InventoryItem, DashboardStats } from '../types';

interface OverviewTabProps {
  orders: Order[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  onTabChange: (tab: string) => void;
  onMarkReady: (orderId: string) => void;
  onMarkPaid: (orderId: string) => void;
}

export function OverviewTab({ 
  orders, 
  menuItems, 
  inventory, 
  onTabChange,
  onMarkReady,
  onMarkPaid
}: OverviewTabProps) {
  
  // Calculate today stats
  const stats = React.useMemo<DashboardStats>(() => {
    const todayStr = '2026-06-04'; // Fixed context date
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));   
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;

    // Calculate top item across all loaded orders
    const itemCounts: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((oi) => {
        itemCounts[oi.itemName] = (itemCounts[oi.itemName] || 0) + oi.quantity;
      });
    });

    let topItem = null;
    let maxQty = 0;
    Object.entries(itemCounts).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topItem = { name, quantity: qty };
      }
    });

    return {
      todayRevenue,
      totalOrders: todayOrders.length,
      pendingOrders,
      topItem,
    };
  }, [orders]);

  // Last 5 orders
  const recentOrders = React.useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  // Check low stock count count
  const lowStockCount = React.useMemo(() => {
    return inventory.filter((inv) => inv.hasCountTracking && inv.currentStock !== null && inv.lowStockThreshold !== null && inv.currentStock <= inv.lowStockThreshold).length;
  }, [inventory]);

  return (
    <div className="space-y-6">
      
      {/* Intro Greetings banner */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-heading">Stall Overview</h2>
        <p className="text-xs text-gray-500">Live operational monitor for Thursday, June 04, 2026.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Today's revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-mono font-extrabold text-gray-900">₹{stats.todayRevenue}</span>
            <p className="text-[9px] text-gray-400 mt-0.5">Live gross sales today</p>
          </div>
        </div>

        {/* Card 2: Today's Orders count */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-7 h-7 bg-red-50 text-[#FD7979] rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-mono font-extrabold text-gray-900">{stats.totalOrders}</span>
            <p className="text-[9px] text-gray-400 mt-0.5">Placements processed</p>
          </div>
        </div>

        {/* Card 3: Active pending queues */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-28 cursor-pointer hover:bg-slate-50/55 transition" onClick={() => onTabChange('orders')}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending queue</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stats.pendingOrders > 0 ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-mono font-extrabold ${stats.pendingOrders > 0 ? 'text-amber-500' : 'text-gray-900'}`}>{stats.pendingOrders}</span>
            <p className="text-[9px] text-gray-400 mt-0.5">Awaiting preparation</p>
          </div>
        </div>

        {/* Card 4: Top item and quantity */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Top Selling Food</span>
            <div className="w-7 h-7 bg-red-50 text-[#FD7979] rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 min-w-0">
            {stats.topItem ? (
              <>
                <p className="text-sm font-bold text-gray-800 line-clamp-1 leading-tight">{stats.topItem.name}</p>
                <p className="text-[10px] text-[#FD7979] font-mono mt-0.5">{stats.topItem.quantity} plates ordered</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-mono font-extrabold text-gray-300">N/A</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Awaiting active data</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Critical Alert bars */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>Operational Alert: {lowStockCount} raw ingredient items running thin!</span>
          </div>
          <button 
            onClick={() => onTabChange('inventory')}
            className="text-[10px] uppercase font-mono font-bold text-amber-700 hover:underline flex items-center gap-1"
          >
            <span>Update stock</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Quick launch shortcuts */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Actions Dispatcher</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => onTabChange('orders')}
            className="flex items-center gap-2 p-3 bg-[#FD7979]/5 hover:bg-[#FD7979]/10 transition rounded-lg text-left text-xs font-bold text-[#FD7979]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Live Order Screen</span>
          </button>
          
          <button 
            onClick={() => onTabChange('menu')}
            className="flex items-center gap-2 p-3 bg-red-50 hover:bg-red-100/60 transition rounded-lg text-left text-xs font-bold text-gray-800"
          >
            <UtensilsCrossed className="w-4 h-4 shrink-0 text-red-400" />
            <span>Manage Food Menu</span>
          </button>
          
          <button 
            onClick={() => onTabChange('inventory')}
            className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 transition rounded-lg text-left text-xs font-bold text-gray-800"
          >
            <Layers className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Inventory Sheet</span>
          </button>

          <button 
            onClick={() => onTabChange('reports')}
            className="flex items-center gap-2 p-3 bg-[#22C55E]/5 hover:bg-[#22C55E]/10 transition rounded-lg text-left text-xs font-bold text-[#22C55E]"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Weekly Sales</span>
          </button>
        </div>
      </div>

      {/* Recent Live Orders lists */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-sm text-gray-800">Recent Customer Tickets</h3>
            <p className="text-[10px] text-gray-400">Showing last 5 active placements</p>
          </div>
          <button 
            onClick={() => onTabChange('orders')}
            className="text-xs font-semibold text-[#FD7979] hover:underline flex items-center gap-1"
          >
            <span>Full order queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Waiting for active customers... QR code is ready to scan in settings page!
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/30 transition">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-gray-800">{order.customerName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      order.status === 'ready' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Itemized breakdown with prices */}
                  <div className="bg-slate-50 p-2.5 rounded-lg space-y-1 border border-slate-100/50">
                    {order.items.map((oi) => (
                      <div key={oi.id} className="flex items-center justify-between text-[11px] text-gray-700">
                        <span className="font-semibold">{oi.itemName} <span className="text-gray-400">×{oi.quantity}</span></span>
                        <span className="font-mono text-gray-600">₹{oi.itemPrice * oi.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between font-bold text-xs text-gray-900">
                      <span>Total:</span>
                      <span className="font-mono text-[#FD7979]">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 block font-mono">
                    Ordered: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-start justify-end sm:items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-dashed border-slate-100">
                  
                  <div className="flex items-center gap-1.5">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => onMarkReady(order.id)}
                        className="bg-[#FD7979] text-white hover:bg-[#eb6767] py-1 px-2.5 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-sm"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => onMarkPaid(order.id)}
                        className="bg-emerald-500 text-white hover:bg-emerald-600 py-1 px-2.5 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-sm"
                      >
                        Mark Paid
                      </button>
                    )}
                    {order.status === 'paid' && (
                      <div className="flex items-center text-emerald-600 gap-0.5 text-xs font-semibold px-2 py-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
