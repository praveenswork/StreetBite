/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Coins, 
  ChefHat, 
  Volume2, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrdersTabProps {
  orders: Order[];
  onMarkReady: (orderId: string) => void;
  onMarkPaid: (orderId: string) => void;
  playBeep: () => void;
}

export function OrdersTab({ orders, onMarkReady, onMarkPaid, playBeep }: OrdersTabProps) {
  const [filter, setFilter] = React.useState<'all' | OrderStatus>('all');

  // Filter computation
  const filteredOrders = React.useMemo(() => {
    let list = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filter !== 'all') {
      list = list.filter((o) => o.status === filter);
    }
    return list;
  }, [orders, filter]);

  // Totals for headers
  const countPending = orders.filter((o) => o.status === 'pending').length;
  const countReady = orders.filter((o) => o.status === 'ready').length;
  const countPaid = orders.filter((o) => o.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Header controls layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-heading flex items-center gap-2">
            <span>Live Order Board</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </h2>
          <p className="text-xs text-gray-500">Orders placed by table scans update here in pure real-time.</p>
        </div>

        {/* Manual Test Sound triggers */}
        <button
          onClick={playBeep}
          className="self-start sm:self-center cursor-pointer border border-slate-200 bg-white hover:bg-slate-50 text-gray-600 font-medium py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Volume2 className="w-3.5 h-3.5 text-[#FD7979]" />
          <span>Test Notification Sound</span>
        </button>
      </div>

      {/* Navigation Filter segments */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 min-w-[70px] text-xs font-bold py-2 rounded-lg cursor-pointer transition ${
            filter === 'all' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 min-w-[90px] text-xs font-bold py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 ${
            filter === 'pending' 
              ? 'bg-amber-100 text-amber-700 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${countPending > 0 ? 'animate-bounce' : ''}`}></span>
          <span>Preparing ({countPending})</span>
        </button>
        <button
          onClick={() => setFilter('ready')}
          className={`flex-1 min-w-[80px] text-xs font-bold py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 ${
            filter === 'ready' 
              ? 'bg-blue-100 text-blue-700 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Ready ({countReady})</span>
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`flex-1 min-w-[80px] text-xs font-bold py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 ${
            filter === 'paid' 
              ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Paid ({countPaid})</span>
        </button>
      </div>

      {/* Orders Grid/List panels */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-gray-800">No Orders in this Queue</h3>
              <p className="text-xs text-gray-400 mt-0.5">All clear right now! Print and stick your QR code so visitors can scan.</p>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const timeDiffMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3 hover:border-red-100 transition duration-200 relative overflow-hidden ${
                  order.status === 'pending' ? 'border-l-4 border-l-amber-400' :
                  order.status === 'ready' ? 'border-l-4 border-l-blue-400' :
                  'border-l-4 border-l-emerald-400'
                }`}
                id={`order-card-${order.id}`}
              >
                {/* Header with Total Amount prominently displayed */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-50 pb-3">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-heading font-bold text-base text-gray-800">{order.customerName}</h4>
                      <span className="text-[10px] bg-slate-100 border border-slate-200 font-mono text-gray-400 px-1.5 py-0.5 rounded">
                        #{order.id.split('-').pop()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                      <span>Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {order.status === 'pending' && (
                        <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {timeDiffMinutes <= 0 ? 'Just now' : `${timeDiffMinutes} min ago`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total Amount badge - PROMINENT */}
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 font-mono mb-0.5">Bill Total</div>
                    <div className="text-lg font-extrabold font-mono text-[#FD7979] bg-red-50 px-3 py-1.5 rounded-lg border border-red-100/50">₹{order.totalAmount}</div>
                  </div>
                </div>

                {/* High contrast Status indicator */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold font-mono px-2.5 py-1 rounded-full uppercase ${
                    order.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' :
                    order.status === 'ready' ? 'bg-blue-50 text-blue-600 border border-blue-200/50' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                  }`}>
                    {order.status === 'pending' ? 'Preparing 🍳' : order.status === 'ready' ? 'Ready 🥡' : 'Received 💰'}
                  </span>
                </div>

                {/* Listing order contents */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ordered Plates</div>
                  <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-lg divide-y divide-slate-100/40">
                    {order.items.map((oi) => (
                      <div key={oi.id} className="text-xs text-gray-800 flex items-center justify-between py-1 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-[#FD7979]/10 text-[#FD7979] rounded font-bold font-mono flex items-center justify-center text-[10px] shrink-0">
                            {oi.quantity}x
                          </span>
                          <span className="font-semibold text-gray-700">{oi.itemName}</span>
                        </div>
                        <span className="font-mono text-gray-400">₹{oi.itemPrice * oi.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cashier sum & actions panel */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-50">

                  {/* Transition actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => onMarkReady(order.id)}
                        className="flex-1 sm:flex-none cursor-pointer bg-[#FD7979] hover:bg-[#eb6767] text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-150 shadow-sm"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => onMarkPaid(order.id)}
                        className="flex-1 sm:flex-none cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-150 shadow-sm"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Mark Paid</span>
                      </button>
                    )}

                    {order.status === 'paid' && (
                      <div className="flex-1 sm:flex-none text-emerald-600 font-semibold text-xs flex items-center justify-center gap-1 bg-emerald-50 px-3 py-2 rounded-xl">
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolved</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
