/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Settings, 
  QrCode, 
  Copy, 
  Check, 
  MapPin, 
  Clock, 
  CreditCard,
  Trash2,
  AlertCircle,
  Download
} from 'lucide-react';
import { Vendor } from '../types';

interface SettingsTabProps {
  vendor: Vendor;
  onUpdateVendor: (v: Vendor) => void;
  onDeleteAccount: () => void;
}

export function SettingsTab({ vendor, onUpdateVendor, onDeleteAccount }: SettingsTabProps) {
  const [stallName, setStallName] = React.useState(vendor.stallName);
  const [stallCategory, setStallCategory] = React.useState(vendor.stallCategory);
  const [locationText, setLocationText] = React.useState(vendor.locationText);
  const [upiId, setUpiId] = React.useState(vendor.upiId);
  const [name, setName] = React.useState(vendor.name);
  const [phone, setPhone] = React.useState(vendor.phone);
  
  const [isCopied, setIsCopied] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  // Derive Customer Order URL path
  const customerOrderUrl = React.useMemo(() => {
    // Generate beautiful pretty Link fallback
    return `${window.location.origin}/#/order/${vendor.slug}`;
  }, [vendor.slug]);

  const qrImageUrl = React.useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(customerOrderUrl)}`;
  }, [customerOrderUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customerOrderUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSaveSuccess(false);

    if (!stallName.trim() || !upiId.trim() || !name.trim()) {
      setErrorText('Stall name, Owner name, and UPI payment ID are required');
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('streetbite_token');
      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          stallName: stallName.trim(),
          stallCategory,
          locationText: locationText.trim(),
          upiId: upiId.trim(),
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdateVendor(data.vendor);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await response.json();
        setErrorText(errData.error || 'Failed to update stall details');
      }
    } catch (err) {
      setErrorText('Network failure. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadFlyer = () => {
    // Elegant approach is to trigger printable window styling focused purely on the QR code card
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Stall Flyer - ${vendor.stallName}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              text-align: center;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 90vh;
              color: #1a1a1a;
            }
            .card {
              border: 3px solid #FD7979;
              border-radius: 24px;
              padding: 40px;
              max-width: 480px;
              box-shadow: 0 10px 30px rgba(253, 121, 121, 0.1);
            }
            .header-label {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #FD7979;
              font-weight: 800;
              margin-bottom: 8px;
            }
            .stall-title {
              font-size: 28px;
              font-weight: 800;
              margin: 0;
            }
            .stall-category {
              font-size: 14px;
              color: #777;
              margin-top: 4px;
              margin-bottom: 24px;
            }
            .qr-wrapper {
              background: #fff;
              border: 1px solid #eee;
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 24px;
            }
            .qr-image {
              width: 260px;
              height: 260px;
            }
            .slogan {
              font-size: 16px;
              font-weight: 700;
              color: #111;
              margin-bottom: 4px;
            }
            .instruct {
              font-size: 12px;
              color: #888;
            }
            .footer-claim {
              margin-top: 32px;
              font-size: 11px;
              color: #999;
              letter-spacing: 1px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header-label">STREETBITE STALL</div>
            <h1 class="stall-title">${vendor.stallName}</h1>
            <div class="stall-category">${vendor.stallCategory}</div>
            
            <div class="qr-wrapper">
              <img src="${qrImageUrl}" class="qr-image" />
            </div>

            <div class="slogan">SCAN TO ORDER</div>
            <div class="instruct">Browse live menu, enter your table/name and order instantly!</div>
            <div class="footer-claim">POWERED BY STREETBITE.IN</div>
          </div>
          <br/>
          <button class="no-print" onclick="window.print()" style="padding:10px 20px; border-radius:8px; border:none; background:#FD7979; color:#fff; font-weight:bold; font-size:14px; cursor:pointer; margin-top:20px;">Print / Save Flyer</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-heading">Stall Settings</h2>
        <p className="text-xs text-gray-500">Alter vendor parameters, UPI receiving details, and retrieve your Table QR signages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: QR Flyer setup (col-span-1) */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4 flex flex-col items-center justify-between text-center">
          <div className="space-y-1.5 w-full">
            <h3 className="font-heading font-extrabold text-sm text-gray-800 text-left">Your Order Link & QR</h3>
            <p className="text-[10px] text-gray-400 text-left">Customers scan this code directly at your stall to browse menu items.</p>
          </div>

          {/* Framed QR Code Representation */}
          <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 flex flex-col items-center max-w-[200px] w-full mt-3 shadow-inner">
            <span className="text-[8px] font-bold text-[#FD7979] tracking-wider uppercase mb-1">STREETBITE SMART QR</span>
            <div className="bg-white p-2 rounded-lg border border-slate-100 mb-2">
              <img 
                src={qrImageUrl} 
                alt="Table order QR Code" 
                className="w-36 h-36"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-extrabold text-slate-800">SCAN TO CHOW</span>
          </div>

          <div className="w-full space-y-2 pt-4">
            <button
              onClick={handleCopyLink}
              className="w-full cursor-pointer bg-slate-100 hover:bg-slate-200 text-gray-700 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Web Link</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleDownloadFlyer}
              className="w-full cursor-pointer bg-slate-900 text-white hover:bg-slate-800 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#FD7979]" />
              <span>Download Poster PDF</span>
            </button>
          </div>
        </div>

        {/* Right Side: Profile Details form & Danger Zone (col-span-2) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-sm text-gray-800 border-b border-slate-50 pb-2">Stall profile details</h3>

            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs py-2.5 px-3 rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 shrink-0" />
                <span>Profile updated successfully! Slug changed in real-time.</span>
              </div>
            )}

            {errorText && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs py-2.5 px-3 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stall name */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Stall Name *</span>
                  <input
                    type="text"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-gray-800 font-bold focus:bg-white"
                  />
                </div>

                {/* Stall Category select */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Food Category</span>
                  <select
                    value={stallCategory}
                    onChange={(e) => setStallCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-gray-800 font-bold focus:bg-white"
                  >
                    <option value="Chaat & Snacks">Chaat & Snacks</option>
                    <option value="Mouthwatering Vada Pavs">Vada Pav Corner</option>
                    <option value="South Indian Delis">South Indian</option>
                    <option value="Vibrant Beverages">Teas & Shakes</option>
                    <option value="Desserts Stalls">Sweets & Jalebi Stalls</option>
                  </select>
                </div>
              </div>

              {/* Location textual description */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Stall Landmark / Location Details</span>
                <input
                  type="text"
                  value={locationText}
                  placeholder="e.g. Opposite Metro Gate 1, Mall Road"
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-gray-800 font-bold focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                {/* Owner name */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Owner / Merchant Name *</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-gray-800 font-bold focus:bg-white"
                  />
                </div>

                {/* Merchant phone */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Stall Mobile Number</span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none text-gray-800 font-bold focus:bg-white"
                  />
                </div>
              </div>

              {/* UPI Identification */}
              <div className="space-y-1.5 bg-red-50/20 border border-dashed border-red-200/50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#FD7979] tracking-wider block flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Settlement UPI Payment ID *
                </span>
                <input
                  type="text"
                  value={upiId}
                  placeholder="e.g. owner@upi / pavbhaji@paytm"
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 outline-none text-gray-800 font-mono font-bold focus:border-[#FD7979]"
                />
                <p className="text-[9px] text-gray-400 leading-tight block pt-1">Customers will pay directly to this ID using GooglePay, PhonePe or Paytm so you get instant cash settlement.</p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#FD7979] hover:bg-[#eb6767] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-100"
                id="btn-settings-save"
              >
                {isSaving ? 'Saving parameters...' : 'Save Stall Parameters'}
              </button>
            </form>
          </div>

          {/* Danger zone panel */}
          <div className="bg-red-50/40 p-5 rounded-xl border border-red-100/50 space-y-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h4 className="font-heading font-extrabold text-sm">Danger Zone</h4>
            </div>
            <p className="text-xs text-slate-500 leading-normal">Deleting your merchant account will permanently erase your menu items, daily inventory counts, and historical transaction reports from the local database. This cannot be reversed.</p>
            <button
              onClick={() => {
                if (confirm('CRITICAL: Are you absolutely sure you want to delete your stall from StreetBite permanently? This action is irreversible.')) {
                  onDeleteAccount();
                }
              }}
              className="text-white bg-red-500 hover:bg-red-600 transition font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-delete-stall"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Delete My Stall</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
