/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Store, ArrowRight, ShieldCheck, QrCode, TrendingUp, Zap } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('#/')}>
            <div className="w-10 h-10 bg-[#FD7979] text-white flex items-center justify-center rounded-xl shadow-md shadow-red-200">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-xl text-gray-900 tracking-tight">Street<span className="text-[#FD7979]">Bite</span></span>
              <span className="text-[10px] block font-mono text-gray-400 tracking-wider -mt-1">QR SAAS FOR VENDORS</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('#/login')} 
              className="text-sm font-medium text-gray-600 hover:text-[#FD7979] transition px-3 py-2 rounded-lg"
              id="btn-login-nav"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('#/register')} 
              className="bg-[#FD7979] text-white hover:bg-[#eb6767] transition text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
              id="btn-register-nav"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 sm:py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-[#FD7979] font-medium text-xs px-3 py-1.5 rounded-full border border-red-100">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Made for Indian Street Food Stalls
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 tracking-tight leading-tight">
            Digitize your food stall with a <span className="text-[#FD7979] relative inline-block">Single QR Code<span className="absolute left-0 bottom-1 w-full h-2 bg-red-100 -z-10 rounded"></span></span>
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto lg:mx-0">
            Let customers scan your QR code, view your live menu, and order instantly. No app downloads required. Manage food orders in real-time, update inventory, and watch your daily sales climb.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button 
              onClick={() => {
                // Pre-login using the demo credentials instantly!
                onNavigate('#/login');
              }}
              className="w-full sm:w-auto bg-gray-900 text-white hover:bg-gray-800 transition font-medium px-6 py-3 rounded-lg shadow-sm flex items-center justify-center gap-2"
              id="btn-try-demo"
            >
              <span>Explore Demo Vendor Stalls</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate('#/register')}
              className="w-full sm:w-auto text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2"
              id="btn-register-action"
            >
              Register My Own Stall
            </button>
          </div>

          <div className="pt-8 border-t border-gray-100 flex justify-center lg:justify-start gap-6 text-xs text-gray-400 font-mono">
            <div>⚡ ZERO SETUP FEES</div>
            <div>⚡ 7-DAY PAST ANALYTICS</div>
            <div>⚡ INSTANT QR GENERATION</div>
          </div>
        </div>

        {/* Feature Visual */}
        <div className="flex-1 w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-2xl -z-10 translate-x-12 -translate-y-12"></div>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE CUSTOMER SCAN EXPERIENCE
              </div>
              <span className="text-xs text-[#FD7979] font-medium hover:underline cursor-pointer" onClick={() => onNavigate('#/vendor/sharma-chaat')}>
                View Menu Preview &rarr;
              </span>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-[#FD7979] flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Customer Scans QR</h4>
                  <p className="text-xs text-gray-500">Stuck on their table or stall pillar, the unique QR page loads instantly on their phone.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-[#FD7979] flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Places Order (No Login)</h4>
                  <p className="text-xs text-gray-500">Inputs their name, selects Butter Pav Bhaji or Samosa Chaat, and taps "Place Order".</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-100 text-[#FD7979] flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Vendor Receives Real-time Alert</h4>
                  <p className="text-xs text-gray-500">Vendor is alerted with a dynamic audio sound. Marks the order "Ready" as soon as it's sizzling!</p>
                </div>
              </div>
            </div>

            {/* Test QR Order Button Quick Access */}
            <div className="pt-2">
              <button 
                onClick={() => onNavigate('#/order/sharma-chaat')}
                className="w-full bg-[#FDACAC]/20 border border-[#FD7979]/30 hover:bg-[#FDACAC]/30 text-gray-800 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                id="btn-customer-order-preview"
              >
                <QrCode className="w-4 h-4 text-[#FD7979]" />
                <span>Try Placing as Customer</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Grid Highlights */}
      <section className="bg-white border-t border-gray-100 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <TrendingUp className="w-6 h-6 text-[#FD7979]" />
            <h3 className="font-bold text-gray-900 text-base">7-Day Sales Charts</h3>
            <p className="text-xs text-gray-500">Track and optimize your daily sales volumes with simple bar and order charts.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <QrCode className="w-6 h-6 text-[#FD7979]" />
            <h3 className="font-bold text-gray-900 text-base">QR Download</h3>
            <p className="text-xs text-gray-500">Download high-quality table QR PDFs to hook on your stall poles immediately.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#FD7979]" />
            <h3 className="font-bold text-gray-900 text-base">Instant Availability</h3>
            <p className="text-xs text-gray-500">Quickly toggle dishes as "Sold Out" or "Available" to save refund hassles.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <Zap className="w-6 h-6 text-[#FD7979]" />
            <h3 className="font-bold text-gray-900 text-base">Pure Live Updates</h3>
            <p className="text-xs text-gray-500">Leverages fast SSE technology to stream new customer order tickets instantly.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-xs border-t border-slate-800 font-mono">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2026 StreetBite India - Digitizing Roadside Stalls.</p>
          <p className="mt-1 text-slate-600">Built with React, Vite & Server-Sent Events Core.</p>
        </div>
      </footer>
    </div>
  );
}
