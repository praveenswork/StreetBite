/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Store, 
  MapPin, 
  QrCode, 
  Share2, 
  Coins, 
  ArrowRight,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';

interface PublicVendorPageProps {
  slug: string;
  onNavigateToOrder: (slug: string) => void;
  onNavigateHome: () => void;
}

export function PublicVendorPage({ slug, onNavigateToOrder, onNavigateHome }: PublicVendorPageProps) {
  const [vendor, setVendor] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorWord, setErrorWord] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const loadStall = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/vendor/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setVendor(data);
        } else {
          setErrorWord('Stall details could not be found. Check if the URL is spelt correctly.');
        }
      } catch (err) {
        setErrorWord('Failed to establish contact with the server. Please check your network.');
      } finally {
        setLoading(false);
      }
    };
    loadStall();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-t-[#FD7979] border-red-100 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500 font-heading">Loading Public Stall Page...</p>
        </div>
      </div>
    );
  }

  if (errorWord) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-6 text-center shadow-lg rounded-2xl border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 mx-auto rounded-full flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-base text-gray-800">Stall Not Found</h3>
            <p className="text-xs text-gray-500 mt-1">{errorWord}</p>
          </div>
          <button 
            onClick={onNavigateHome}
            className="w-full bg-gray-900 text-white font-bold py-2 px-4 rounded-xl text-xs"
          >
            Back to StreetBite Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-8 h-8 bg-[#FD7979] text-white flex items-center justify-center rounded-lg shadow-sm">
              <Store className="w-4 h-4" />
            </div>
            <span className="font-heading font-extrabold text-[15px] tracking-tight text-gray-900">Street<span className="text-[#FD7979]">Bite</span></span>
          </div>

          <button
            onClick={handleShare}
            className="border cursor-pointer border-slate-200 bg-white hover:bg-slate-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>{copied ? 'Link Copied!' : 'Share Stall Link'}</span>
            <Share2 className="w-3.5 h-3.5 text-[#FD7979]" />
          </button>
        </div>
      </header>

      {/* Main Column */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stall Info Panel (Col-span-2) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] bg-red-50 text-[#FD7979] border border-red-100 rounded-full py-0.5 px-2.5 font-extrabold inline-block tracking-wider uppercase font-mono">
                {vendor.stallCategory}
              </span>
              <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight font-heading leading-tight">{vendor.stallName}</h2>
              {vendor.locationText && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FD7979]" />
                  <span>{vendor.locationText}</span>
                </p>
              )}
            </div>

            {/* Quick Action placing order */}
            <div>
              <button
                onClick={() => onNavigateToOrder(slug)}
                className="w-full sm:w-auto bg-[#FD7979] hover:bg-[#eb6767] text-white font-extrabold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-150 shadow-md shadow-red-100 cursor-pointer"
              >
                <span>Browse Live Menu & Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Menu Preview Group */}
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-gray-400">Our Menu preview</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vendor.menuItems.length === 0 ? (
                <div className="col-span-2 text-center p-8 bg-white border border-slate-100 rounded-xl text-xs text-gray-400">
                  No menu items listed yet on this stall.
                </div>
              ) : (
                vendor.menuItems.map((item: any) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="space-y-1 min-w-0">
                      <span className="font-heading font-bold text-sm text-gray-800 truncate block">{item.name}</span>
                      <span className="font-mono font-bold text-xs text-gray-500">₹{item.price}</span>
                    </div>

                    {!item.isAvailable && (
                      <span className="text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200/50 px-2 py-0.5 rounded-full uppercase font-mono tracking-wider shrink-0">
                        Sold Out
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar QR Scanner info card (col-span-1) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-between text-center max-w-sm w-full mx-auto self-start h-auto">
          <div className="space-y-1.5 w-full">
            <h3 className="font-heading font-extrabold text-sm text-gray-800">Scan QR at Stall</h3>
            <p className="text-[10px] text-gray-400">Are you sitting at a table? Scan this QR directly with your phone to order.</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl max-w-[180px] w-full my-4 shadow-inner flex flex-col items-center">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/#/order/' + slug)}`}
              alt="Public Stall QR link"
              className="w-32 h-32"
            />
          </div>

          <button
            onClick={() => onNavigateToOrder(slug)}
            className="w-full bg-slate-900 text-white hover:bg-slate-800 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <span>Launch Web Menu</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#FD7979]" />
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-gray-400 font-mono mt-8">
        <p>© 2026 StreetBite.in. Order Street Food securely from nearby vendors.</p>
      </footer>
    </div>
  );
}
