/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Store, ArrowRight, ClipboardPlus, AlertCircle, Sparkles, User, Mail, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  initialMode: 'login' | 'register';
  onAuthSuccess: (token: string, vendor: any) => void;
  onNavigate: (route: string) => void;
}

export function AuthPage({ initialMode, onAuthSuccess, onNavigate }: AuthPageProps) {
  const [mode, setMode] = React.useState<'login' | 'register'>(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = React.useState('');
  
  // Register States
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [stallName, setStallName] = React.useState('');
  const [stallCategory, setStallCategory] = React.useState('Chaat & Snacks');
  const [locationText, setLocationText] = React.useState('');
  const [upiId, setUpiId] = React.useState('');

  const [errorText, setErrorText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!loginEmail.trim()) {
      setErrorText('Email address is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        onAuthSuccess(data.token, data.vendor);
        onNavigate('#/dashboard');
      } else {
        const errData = await response.json();
        setErrorText(errData.error || 'Failed to authenticate');
      }
    } catch (err) {
      setErrorText('Could not connect to full-stack server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!name.trim() || !email.trim() || !stallName.trim() || !upiId.trim()) {
      setErrorText('Merchant Name, Email, Stall Name, and UPI ID are strictly required to proceed.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          stallName: stallName.trim(),
          stallCategory,
          locationText: locationText.trim(),
          upiId: upiId.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onAuthSuccess(data.token, data.vendor);
        onNavigate('#/dashboard');
      } else {
        const errData = await response.json();
        setErrorText(errData.error || 'Could not register brand');
      }
    } catch (err) {
      setErrorText('Connection fault with Express backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoFillDemoCreds = () => {
    setLoginEmail('praveens1306@gmail.com');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Dynamic ambient color background circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#FDACAC]/15 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FFCDC9]/15 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="max-w-md w-full space-y-6">
        
        {/* Top brand header */}
        <div className="flex flex-col items-center text-center space-y-2 cursor-pointer" onClick={() => onNavigate('#/')}>
          <div className="w-12 h-12 bg-[#FD7979] text-white flex items-center justify-center rounded-2xl shadow-lg shadow-red-200">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight leading-none mt-1">Street<span className="text-[#FD7979]">Bite</span></h1>
            <span className="text-xs text-gray-400 font-mono tracking-wider">SECURE DIGITAL QR STALL COORDS</span>
          </div>
        </div>

        {/* Form Card wrap */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8 space-y-6 animate-scale-up">
          
          {/* Tabs switch */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setErrorText('');
                setMode('login');
              }}
              className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
                mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign In Stall
            </button>
            <button
              onClick={() => {
                setErrorText('');
                setMode('register');
              }}
              className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
                mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Register Stall
            </button>
          </div>

          {errorText && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
              <span>{errorText}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN MODULE */
            <form onSubmit={handleLogin} className="space-y-4 font-semibold text-xs text-gray-700">
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Merchant Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. praveens1306@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#FDACAC] focus:border-transparent outline-none rounded-xl py-2.5 px-3 text-sm transition"
                  disabled={isSubmitting}
                  id="input-auth-login-email"
                />
              </div>

              {/* Demo prefilled trigger */}
              <div className="p-3 bg-red-50/40 rounded-xl border border-red-100/50 space-y-2">
                <div className="flex items-center gap-1.5 text-gray-800 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#FD7979] fill-current" />
                  <span>Instant Demo prefill!</span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  We pre-seeded Sharma Chaat with historical sales and live products under our custom test credentials. Click below to load!
                </p>
                <button
                  type="button"
                  onClick={autoFillDemoCreds}
                  className="text-[10px] text-[#FD7979] hover:underline block font-bold"
                  id="btn-autofill-demo"
                >
                  Prefill praveens1306@gmail.com &rarr;
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FD7979] hover:bg-[#eb6767] text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-100"
                id="btn-login-submit"
              >
                {isSubmitting ? 'Verifying Link...' : 'Launch Merchant Dashboard'}
              </button>
            </form>
          ) : (
            /* REGISTRATION MODULE */
            <form onSubmit={handleRegister} className="space-y-4 font-semibold text-xs text-gray-700">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">your name *</span>
                  <input
                    type="text"
                    required
                    placeholder="Prakash S"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-2 text-xs"
                    disabled={isSubmitting}
                    id="input-auth-reg-name"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Owner Email *</span>
                  <input
                    type="email"
                    required
                    placeholder="prakash@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-2 text-xs"
                    disabled={isSubmitting}
                    id="input-auth-reg-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Stall Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sizzling Pav Bhaji"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-2 text-xs"
                    disabled={isSubmitting}
                    id="input-auth-reg-stall"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Stall Food Category</span>
                  <select
                    value={stallCategory}
                    onChange={(e) => setStallCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-2 text-xs text-gray-800 font-bold"
                    disabled={isSubmitting}
                  >
                    <option value="Chaat & Snacks">Chaat Plates</option>
                    <option value="Mouthwatering Vada Pavs">Vada Pav Corner</option>
                    <option value="Vibrant Beverages">Beverages & Teas</option>
                    <option value="South Indian Delis">Main Dishes</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Stall location landmark description</span>
                <input
                  type="text"
                  placeholder="e.g. Sector 15 HUDA Market, Opp Gate 2"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg p-2 text-xs"
                  disabled={isSubmitting}
                />
              </div>

              {/* Settlement UPI Id registration */}
              <div className="space-y-1 bg-red-50/20 border border-dashed border-red-200/50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#FD7979] tracking-wider block">settlement Payee UPI ID *</span>
                <input
                  type="text"
                  required
                  placeholder="prakash@paytm or parkash@ybl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-white border border-slate-200 outline-none rounded-lg p-2 text-xs font-mono font-bold focus:border-[#FD7979]"
                  disabled={isSubmitting}
                  id="input-auth-reg-upi"
                />
                <p className="text-[9px] text-gray-400 pt-1 leading-tight">Customers settle bills straight to this address. StreetBite levies 0% operational fees.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FD7979] hover:bg-[#eb6767] text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-100"
                id="btn-register-submit"
              >
                {isSubmitting ? 'Provisioning Stall...' : 'Provision My Stall QR'}
              </button>
            </form>
          )}

        </div>

        {/* Helper footer switch */}
        <p className="text-center text-xs text-gray-400">
          Want to explore first without registering?{' '}
          <span 
            onClick={() => {
              setErrorText('');
              setMode(mode === 'login' ? 'register' : 'login');
            }} 
            className="text-[#FD7979] hover:underline font-bold cursor-pointer"
          >
            {mode === 'login' ? 'Create a Stall' : 'Sign into existing Stall'}
          </span>
        </p>

      </div>
    </div>
  );
}
