/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Store, 
  ShoppingBag, 
  UtensilsCrossed, 
  MapPin, 
  Share2, 
  Clock, 
  CheckCircle,
  Plus,
  Minus,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  X
} from 'lucide-react';

interface CustomerOrderPageProps {
  slug: string;
  onNavigateHome: () => void;
}

export function CustomerOrderPage({ slug, onNavigateHome }: CustomerOrderPageProps) {
  const [vendorData, setVendorData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorText, setErrorText] = React.useState('');
  
  // Shopping Cart State
  const [cartQuantities, setCartQuantities] = React.useState<Record<string, number>>({});
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [customerName, setCustomerName] = React.useState('');
  const [checkoutError, setCheckoutError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Successful Placement State
  const [placedOrder, setPlacedOrder] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchVendorMenu = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/vendor/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setVendorData(data);
        } else {
          setErrorText('Stall details could not be found. Check if the URL is spelt correctly.');
        }
      } catch (err) {
        setErrorText('Failed to establish contact with the server. Please check your network.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendorMenu();
  }, [slug]);

  const handleUpdateQty = (itemId: string, diff: number) => {
    setCartQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + diff);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = next;
      }
      return updated;
    });
  };

  // Aggregates for Cart
  const cartSummary = React.useMemo(() => {
    if (!vendorData) return { totalItems: 0, totalCost: 0, itemsList: [] };
    let totalItems = 0;
    let totalCost = 0;
    const itemsList: any[] = [];

    Object.entries(cartQuantities).forEach(([itemId, qtyVal]) => {
      const qty = qtyVal as number;
      const item = vendorData.menuItems.find((m: any) => m.id === itemId) as any;
      if (item && item.isAvailable) {
        totalItems += qty;
        totalCost += (Number(item.price) * qty);
        itemsList.push({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: qty
        });
      }
    });

    return { totalItems, totalCost, itemsList };
  }, [cartQuantities, vendorData]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!customerName.trim()) {
      setCheckoutError('Please tell us your name so the vendor can call you!');
      return;
    }

    try {
      setIsSubmitting(true);
      const postPayload = {
        customerName: customerName.trim(),
        items: cartSummary.itemsList.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`/api/public/vendor/${slug}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postPayload)
      });

      if (response.ok) {
        const data = await response.json();
        setPlacedOrder(data);
        setCartQuantities({});
        setShowCheckoutModal(false);
      } else {
        const errData = await response.json();
        setCheckoutError(errData.error || 'Failed to place order');
      }
    } catch (err) {
      setCheckoutError('Network timeout. Please tap Place Order again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group items by menu category on the customer card
  const groupedMenu = React.useMemo<Record<string, any[]>>(() => {
    if (!vendorData) return {};
    const groups: Record<string, any[]> = {};
    vendorData.menuItems.forEach((item: any) => {
      const cat = item.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });
    return groups;
  }, [vendorData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-t-[#FD7979] border-red-100 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500">Retrieving stall menu & info...</p>
        </div>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-6 text-center shadow-lg rounded-2xl border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 mx-auto rounded-full flex items-center justify-center">
            <X className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-gray-800">Stall Not Accessible</h3>
            <p className="text-xs text-gray-500 mt-1">{errorText}</p>
          </div>
          <button 
            onClick={onNavigateHome}
            className="w-full bg-gray-900 text-white font-bold py-2 px-4 rounded-xl text-xs"
          >
            Go to StreetBite Home
          </button>
        </div>
      </div>
    );
  }

  // Render order placement confirmation banner screen
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white max-w-md w-full p-6 rounded-2xl shadow-xl border border-slate-100 text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider">Kitchen ticket created</span>
            <h2 className="text-2xl font-extrabold text-gray-950 font-heading">Sizzling Order Confirmed!</h2>
            <p className="text-xs text-gray-500">Your delicious meal has been added to {vendorData.stallName}'s board.</p>
          </div>

          {/* Ticket coordinates card info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3.5 text-left font-semibold">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-gray-400 text-xs">Customer Name:</span>
              <span className="text-gray-800 text-sm font-bold">{placedOrder.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-gray-400 text-xs">Cooking Prep time:</span>
              <span className="text-[#FD7979] text-sm font-bold flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ~{placedOrder.prepTimeMinutes} mins
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-xs">Total Bill Sum:</span>
              <span className="text-gray-900 text-sm font-extrabold font-mono">₹{placedOrder.totalAmount}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-center">
            <p className="font-bold text-slate-800">What to do next?</p>
            <p>Wait near the stall counter or take a seat. The vendor will call your name **"{placedOrder.customerName}"** as soon as the plates are piping hot!</p>
          </div>

          <div className="space-y-2">
            {/* Settle with UPI ID banner */}
            {vendorData.upiId && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100/50 justify-between items-center text-xs flex">
                <span className="text-gray-400 font-mono">Pay via UPI QR / Phone:</span>
                <span className="font-mono font-bold text-slate-800 select-all">{vendorData.upiId}</span>
              </div>
            )}

            <button 
              onClick={() => setPlacedOrder(null)}
              className="w-full bg-[#FD7979] hover:bg-[#eb6767] transition text-white font-extrabold py-3 px-4 rounded-xl text-xs cursor-pointer shadow-md shadow-red-100"
            >
              Order Something Else
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto border-x border-slate-100 relative pb-24">
      {/* Visual Stall banner info */}
      <div className="bg-[#FD7979] text-white p-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8"></div>
        
        {/* Breadcrumb row */}
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider opacity-90 uppercase mb-4 font-bold">
          <span>STREETBITE GUEST SCAN</span>
          <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Stall open
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold font-heading tracking-tight leading-tight">{vendorData.stallName}</h1>
          
          <div className="space-y-1">
            <span className="text-xs bg-white/25 rounded-full py-0.5 px-2.5 font-bold inline-block border border-white/10">
              {vendorData.stallCategory}
            </span>
            {vendorData.locationText && (
              <p className="text-[11px] opacity-90 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FFCDC9] shrink-0" />
                <span className="truncate">{vendorData.locationText}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Paused accepting orders banner check */}
      {!vendorData.isAcceptingOrders && (
        <div className="bg-amber-50 border-b border-amber-200/50 p-4 text-center text-xs space-y-1">
          <p className="font-bold text-amber-800">Orders paused right now</p>
          <p className="text-amber-600">You can browse the dish catalog below, but food checkout is locked until the vendor resumes cooking.</p>
        </div>
      )}

      {/* Menu grid listings categorized */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {vendorData.menuItems.length === 0 ? (
          <div className="text-center p-12 text-gray-400 text-xs">
            No dishes listed on the board yet! Refresh later.
          </div>
        ) : (
          Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-gray-400 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                <span>{category}</span>
                <span className="text-[10px] font-normal lowercase">({(items as any[]).length} dishes)</span>
              </h3>

              <div className="space-y-3">
                {(items as any[]).map((item: any) => {
                  const qty = cartQuantities[item.id] || 0;
                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white rounded-xl p-4 border border-slate-100/75 flex items-center justify-between gap-4 transition duration-150 ${
                        !item.isAvailable ? 'opacity-65' : 'hover:border-red-100 shadow-sm'
                      }`}
                    >
                      <div className="min-w-0 space-y-1 flex-1">
                        <span className="font-heading font-bold text-sm text-gray-950 block">{item.name}</span>
                        <span className="font-mono text-sm font-extrabold text-gray-900 block mt-0.5">₹{item.price}</span>
                      </div>

                      {/* Tactile qty picker / Counter */}
                      <div className="shrink-0 flex items-center gap-2">
                        {!item.isAvailable ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase border border-amber-200/30">
                            Sold Out
                          </span>
                        ) : vendorData.isAcceptingOrders ? (
                          qty === 0 ? (
                            <button
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="cursor-pointer border border-[#FD7979] text-[#FD7979] hover:bg-red-50 bg-white font-extrabold text-xs py-1.5 px-4 rounded-xl flex items-center justify-center transition"
                            >
                              Add +
                            </button>
                          ) : (
                            <div className="flex items-center gap-2.5 bg-[#FD7979]/5 border border-[#FD7979]/40 p-1 rounded-xl">
                              <button
                                onClick={() => handleUpdateQty(item.id, -1)}
                                className="w-6 h-6 rounded-lg bg-white shrink-0 shadow-sm text-gray-700 flex items-center justify-center font-bold hover:bg-slate-100 transition cursor-pointer"
                              >
                                <Minus className="w-3 h-3 text-[#FD7979]" />
                              </button>
                              <span className="font-mono font-bold text-xs text-gray-900 min-w-[14px] text-center">{qty}</span>
                              <button
                                onClick={() => handleUpdateQty(item.id, 1)}
                                className="w-6 h-6 rounded-lg bg-white shrink-0 shadow-sm text-gray-700 flex items-center justify-center font-bold hover:bg-slate-100 transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3 text-[#FD7979]" />
                              </button>
                            </div>
                          )
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sticky Bottom Cart Bar */}
      {cartSummary.totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-between z-40 shadow-xl rounded-t-2xl animate-slide-up">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">My Basket</span>
            <span className="text-xs font-bold text-gray-700">{cartSummary.totalItems} plate{cartSummary.totalItems > 1 ? 's' : ''} • <span className="font-mono text-[#FD7979] text-sm font-extrabold">₹{cartSummary.totalCost}</span></span>
          </div>

          <button
            onClick={() => {
              setCheckoutError('');
              setShowCheckoutModal(true);
            }}
            className="bg-[#FD7979] hover:bg-[#eb6767] text-white font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow-sm"
          >
            <span>Review Order</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Checkout Name Modal Prompt sheet overlay */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-xl animate-scale-up border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-heading font-extrabold text-base text-gray-900">Finish Placing Order</h3>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              
              {/* Items Summary lists */}
              <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                <div className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Dish Selection Summary</div>
                <div className="space-y-1.5">
                  {cartSummary.itemsList.map((item) => (
                    <div key={item.id} className="text-xs text-gray-700 flex items-center justify-between">
                      <span>{item.name} <span className="text-gray-400 font-bold font-mono">×{item.quantity}</span></span>
                      <span className="font-mono text-gray-500">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200/50 pt-1.5 flex items-center justify-between font-bold text-xs text-gray-900">
                    <span>Total Amount:</span>
                    <span className="font-mono text-[#FD7979]">₹{cartSummary.totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Enter Customer Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Your Name / Token Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma, Table 3, Amit K"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#FDACAC] focus:border-transparent outline-none rounded-xl py-2.5 px-3 text-sm transition text-gray-800 font-bold"
                  disabled={isSubmitting}
                  id="checkout-customer-name-input"
                />
                <p className="text-[9px] text-gray-400">The vendor will call this name out when your order plates are ready!</p>
              </div>

              {/* CTA switches */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer"
                  disabled={isSubmitting}
                >
                  Edit Basket
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-950 text-white hover:bg-gray-800 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  disabled={isSubmitting}
                  id="btn-customer-order-submit"
                >
                  {isSubmitting ? 'Sending Ticket...' : 'Confirm & Place order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
