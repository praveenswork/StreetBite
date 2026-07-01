/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  TrendingDown, 
  CheckCircle,
  Clock,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { Order, MenuItem } from '../types';

interface ReportsTabProps {
  orders: Order[];
  menuItems: MenuItem[];
}

export function ReportsTab({ orders, menuItems }: ReportsTabProps) {
  const [timeframe, setTimeframe] = React.useState<'week' | 'month' | 'today'>('week');

  // Compute daily numbers for the last 7 days (from Thurs, June 04, 2026 backwards)
  const chartData = React.useMemo(() => {
    const today = new Date('2026-06-04T10:22:22Z');
    const dataList = [];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const dateStr = targetDate.toISOString().slice(0, 10); // YYYY-MM-DD
      const dateLabel = targetDate.toLocaleDateString([], { weekday: 'short', day: 'numeric' });

      // Calculate orders placed on this day
      const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr));
      const totalRevenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      dataList.push({
        date: dateStr,
        label: dateLabel,
        revenue: totalRevenue,
        ordersCount: dayOrders.length,
      });
    }

    return dataList;
  }, [orders]);

  // Compute Top 5 selling items across selected timeframe
  const topSellingItems = React.useMemo(() => {
    const itemData: Record<string, { quantity: number; revenue: number }> = {};
    
    orders.forEach((o) => {
      // Small date filter helper
      const dateStr = o.createdAt.slice(0, 10);
      if (timeframe === 'today' && dateStr !== '2026-06-04') return;
      
      o.items.forEach((oi) => {
        if (!itemData[oi.itemName]) {
          itemData[oi.itemName] = { quantity: 0, revenue: 0 };
        }
        itemData[oi.itemName].quantity += oi.quantity;
        itemData[oi.itemName].revenue += oi.itemPrice * oi.quantity;
      });
    });

    return Object.entries(itemData)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders, timeframe]);

  // Metrics aggregates
  const totalRevenueAll = React.useMemo(() => {
    return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const avgOrderValue = React.useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(totalRevenueAll / orders.length);
  }, [orders, totalRevenueAll]);

  return (
    <div className="space-y-6">
      
      {/* Title & select header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-heading">Performance Reports</h2>
          <p className="text-xs text-gray-500">Track financial volumes, menu popularity scales, and buyer metrics.</p>
        </div>

        {/* Dropdown filter */}
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e: any) => setTimeframe(e.target.value)}
            className="bg-white border border-slate-200 text-gray-700 font-semibold cursor-pointer outline-none rounded-xl py-2 px-4 text-xs transition shadow-sm"
          >
            <option value="today">Today (June 04)</option>
            <option value="week">Past 7 Days</option>
            <option value="month">All History</option>
          </select>
        </div>
      </div>

      {/* Mini bento cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Aggregate Gross volume</span>
          <span className="text-xl font-mono font-extrabold text-gray-900 block mt-1">₹{totalRevenueAll}</span>
          <span className="text-[10px] text-gray-400">Total lifetime sales</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Average Ticket size</span>
          <span className="text-xl font-mono font-extrabold text-gray-900 block mt-1">₹{avgOrderValue}</span>
          <span className="text-[10px] text-gray-400">Average bill value per customer</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Processed Tickets</span>
          <span className="text-xl font-mono font-extrabold text-gray-900 block mt-1">{orders.length} orders</span>
          <span className="text-[10px] text-gray-400">Total customer scans converted</span>
        </div>
      </div>

      {/* Double Column Chart Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Revenue volume (Bar chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-sm text-gray-800">Weekly Revenue Breakdown</h3>
            <p className="text-[10px] text-gray-400">Sales volume (INR) of the past 7 days</p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'sans-serif' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="revenue" fill="#FD7979" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Order trends (Line chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-sm text-gray-800">Order Placements Flow</h3>
            <p className="text-[10px] text-gray-400">Daily tickets processed over the past week</p>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'sans-serif' }}
                  formatter={(value) => [`${value} orders`, 'Tickets']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="ordersCount" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top 5 Items block */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <h3 className="font-heading font-extrabold text-sm text-gray-800">Top 5 Selling Food Dishes</h3>
          <p className="text-[10px] text-gray-400">Dishes sorted by physical plates ordered for selected timeframe ({timeframe})</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead>
              <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="py-2.5 px-4 font-heading">Dish Description</th>
                <th className="py-2.5 px-4 font-heading text-center">Plates sold</th>
                <th className="py-2.5 px-4 font-heading text-right">Gross Sales (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {topSellingItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400 italic">No sales recorded during this specific period.</td>
                </tr>
              ) : (
                topSellingItems.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 text-gray-800 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-red-50 text-[#FD7979] text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">{item.quantity} units</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-gray-900">₹{item.revenue}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
