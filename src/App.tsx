/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewTab } from './components/OverviewTab';
import { OrdersTab } from './components/OrdersTab';
import { MenuTab } from './components/MenuTab';
import { InventoryTab } from './components/InventoryTab';
import { ReportsTab } from './components/ReportsTab';
import { SettingsTab } from './components/SettingsTab';
import { CustomerOrderPage } from './components/CustomerOrderPage';
import { PublicVendorPage } from './components/PublicVendorPage';
import { Vendor, MenuItem, Order, InventoryItem } from './types';

export default function App() {
  // Navigation State parsed from hash routing fallback
  const [route, setRoute] = React.useState<any>(() => parseCurrentUrl());
  
  // Auth state
  const [vendor, setVendor] = React.useState<Vendor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loadingAuth, setLoadingAuth] = React.useState(true);

  // Vendor Data collections
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);

  // Sound Synth block
  const playNotificationBeep = React.useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Multi oscillator chime for high audibility at busy stalls
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime); // A5

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.55);
      osc2.stop(audioCtx.currentTime + 0.55);
    } catch (e) {
      console.warn('Audio context was prevented by browser window touch permissions. Click anywhere to activate audio.', e);
    }
  }, []);

  // Helper url parser
  function parseCurrentUrl() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // Hash router fallback priority for iframe stability
    if (hash.startsWith('#/order/')) {
      return { type: 'customer-order', slug: hash.replace('#/order/', '') };
    }
    if (hash.startsWith('#/vendor/')) {
      return { type: 'public-page', slug: hash.replace('#/vendor/', '') };
    }
    if (hash.startsWith('#/dashboard')) {
      const sub = hash.replace('#/dashboard', '').replace(/^\//, '') || 'home';
      return { type: 'dashboard', tab: sub };
    }
    if (hash === '#/login') return { type: 'login' };
    if (hash === '#/register') return { type: 'register' };

    // Standard routing shapes
    if (path.startsWith('/order/')) {
      return { type: 'customer-order', slug: path.replace('/order/', '') };
    }
    if (path === '/login') return { type: 'login' };
    if (path === '/register') return { type: 'register' };
    if (path.startsWith('/dashboard')) {
      const sub = path.replace('/dashboard', '').replace(/^\//, '') || 'home';
      return { type: 'dashboard', tab: sub };
    }
    if (path !== '/' && path.length > 1 && !path.includes('.') && !path.includes('/')) {
      return { type: 'public-page', slug: path.substring(1) };
    }

    return { type: 'landing' };
  }

  // Monitor path changes
  React.useEffect(() => {
    const handleUrlChange = () => {
      setRoute(parseCurrentUrl());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateTo = (navTarget: string) => {
    window.location.hash = navTarget.replace(/^#/, '');
  };

  // Auth fetch user me context
  React.useEffect(() => {
    const checkLogin = async () => {
      const savedToken = localStorage.getItem('streetbite_token');
      if (!savedToken) {
        setLoadingAuth(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'x-auth-token': savedToken }
        });
        if (response.ok) {
          const data = await response.json();
          setVendor(data.vendor);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('streetbite_token');
        }
      } catch (err) {
        console.error('Error verifying auth status with server', err);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkLogin();
  }, []);

  // Fetch Vendor Resources when authenticated
  React.useEffect(() => {
    if (!isAuthenticated || !vendor) return;

    const loadVendorResources = async () => {
      const token = localStorage.getItem('streetbite_token') || '';
      try {
        const [resMenu, resInv, resOrders] = await Promise.all([
          fetch('/api/vendor/menu', { headers: { 'x-auth-token': token } }),
          fetch('/api/vendor/inventory', { headers: { 'x-auth-token': token } }),
          fetch('/api/vendor/orders', { headers: { 'x-auth-token': token } }),
        ]);

        if (resMenu.ok) {
          const d = await resMenu.json();
          setMenuItems(d.menuItems);
        }
        if (resInv.ok) {
          const d = await resInv.json();
          setInventory(d.inventoryItems);
        }
        if (resOrders.ok) {
          const d = await resOrders.json();
          setOrders(d.orders);
        }
      } catch (err) {
        console.error('Could not fetch vendor collections', err);
      }
    };

    loadVendorResources();
  }, [isAuthenticated, vendor?.id]);

  // Real-time server-sent events connection setup
  React.useEffect(() => {
    if (!isAuthenticated || !vendor) return;

    const token = localStorage.getItem('streetbite_token') || '';
    const sseSource = new EventSource(`/api/vendor/realtime?token=${encodeURIComponent(token)}`);

    // Listen on Customer order placements
    sseSource.addEventListener('order:created', (event: any) => {
      try {
        const newOrderObj = JSON.parse(event.data);
        // Play live physical audio alert!
        playNotificationBeep();
        
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrderObj.id)) return prev;
          return [newOrderObj, ...prev];
        });

        // Trigger dynamic autodecrements in inventory on order placement
        // Since the server handles this, we refresh the inventory list concurrently!
        fetch('/api/vendor/inventory', { headers: { 'x-auth-token': token } })
          .then(res => { if (res.ok) return res.json(); })
          .then(d => { if (d) setInventory(d.inventoryItems); })
          .catch(e => console.error('Error refreshing inventory count state', e));

      } catch (e) {
        console.error('Error parsing sse order:created details', e);
      }
    });

    // Listen on Order Updates (e.g. status changes or archives)
    sseSource.addEventListener('order:updated', (event: any) => {
      try {
        const updatedOrder = JSON.parse(event.data);
        setOrders((prev) => {
          return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        });
      } catch (e) {
        console.error('Error reading live update event data', e);
      }
    });

    sseSource.onerror = (e) => {
      console.warn('Real-time connection interrupted. Retrying automatically...', e);
    };

    return () => {
      sseSource.close();
    };
  }, [isAuthenticated, vendor?.id, playNotificationBeep]);

  // Auth Action handlers
  const handleAuthSuccess = (token: string, loadedVendor: Vendor) => {
    localStorage.setItem('streetbite_token', token);
    setVendor(loadedVendor);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('streetbite_token');
    setVendor(null);
    setIsAuthenticated(false);
    setOrders([]);
    setMenuItems([]);
    setInventory([]);
    navigateTo('#/');
  };

  const handleDeleteStall = async () => {
    // Basic logout fallback since backend simulation deletes row
    localStorage.removeItem('streetbite_token');
    setVendor(null);
    setIsAuthenticated(false);
    navigateTo('#/');
  };

  /* ================== CRUD MUTATION CALLS ================== */

  // MENU OPERATION TRIGGERS
  const handleAddMenuItem = async (itemDetails: { name: string; price: number; category: string }) => {
    const token = localStorage.getItem('streetbite_token') || '';
    const res = await fetch('/api/vendor/menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(itemDetails),
    });

    if (res.ok) {
      const data = await res.json();
      setMenuItems((prev) => [...prev, data.menuItem]);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add item');
    }
  };

  const handleToggleMenuAvailability = async (itemId: string, currentAvailable: boolean) => {
    const token = localStorage.getItem('streetbite_token') || '';
    
    // Optimistic Update
    setMenuItems((prev) => 
      prev.map(item => item.id === itemId ? { ...item, isAvailable: !currentAvailable } : item)
    );

    try {
      const res = await fetch(`/api/vendor/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ isAvailable: !currentAvailable }),
      });

      if (!res.ok) {
        // Rollback state if network failed
        setMenuItems((prev) => 
          prev.map(item => item.id === itemId ? { ...item, isAvailable: currentAvailable } : item)
        );
      }
    } catch (e) {
      setMenuItems((prev) => 
        prev.map(item => item.id === itemId ? { ...item, isAvailable: currentAvailable } : item)
      );
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    const token = localStorage.getItem('streetbite_token') || '';
    const originalItems = [...menuItems];

    // Optimistic Update
    setMenuItems((prev) => prev.filter(item => item.id !== itemId));

    try {
      const res = await fetch(`/api/vendor/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        }
      });
      if (!res.ok) {
        setMenuItems(originalItems);
      }
    } catch (e) {
      setMenuItems(originalItems);
    }
  };

  // INVENTORY OPERATIONS
  const handleAddInventoryItem = async (fields: {
    itemName: string;
    unit: string;
    currentStock: number | null;
    lowStockThreshold: number | null;
    hasCountTracking: boolean;
  }) => {
    const token = localStorage.getItem('streetbite_token') || '';
    const res = await fetch('/api/vendor/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(fields),
    });

    if (res.ok) {
      const data = await res.json();
      setInventory((prev) => [...prev, data.inventoryItem]);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register ingredient');
    }
  };

  const handleUpdateStockCount = async (itemId: string, diff: number) => {
    const token = localStorage.getItem('streetbite_token') || '';
    
    // Find target
    const target = inventory.find(inv => inv.id === itemId);
    if (!target || target.currentStock === null) return;

    const nextStock = Math.max(0, target.currentStock + diff);

    // Optimistic Update
    setInventory((prev) => 
      prev.map(inv => inv.id === itemId ? { ...inv, currentStock: nextStock, updatedAt: new Date().toISOString() } : inv)
    );

    try {
      const res = await fetch(`/api/vendor/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ currentStock: nextStock, hasCountTracking: true }),
      });

      if (!res.ok) {
        setInventory((prev) => 
          prev.map(inv => inv.id === itemId ? { ...inv, currentStock: target.currentStock } : inv)
        );
      }
    } catch (e) {
      setInventory((prev) => 
        prev.map(inv => inv.id === itemId ? { ...inv, currentStock: target.currentStock } : inv)
      );
    }
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    const token = localStorage.getItem('streetbite_token') || '';
    const original = [...inventory];

    setInventory((prev) => prev.filter(inv => inv.id !== itemId));

    try {
      const res = await fetch(`/api/vendor/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        }
      });
      if (!res.ok) setInventory(original);
    } catch (e) {
      setInventory(original);
    }
  };

  const handleEditInventoryItem = async (itemId: string, updatedFields: Partial<InventoryItem>) => {
    const token = localStorage.getItem('streetbite_token') || '';
    const res = await fetch(`/api/vendor/inventory/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify(updatedFields),
    });
    if (res.ok) {
      const data = await res.json();
      setInventory((prev) => prev.map(inv => inv.id === itemId ? data.inventoryItem : inv));
    }
  };

  // ORDER OPERATIONS (OPTIMISTIC STATUS TRANSITIONS)
  const handleTransitionOrderStatus = async (orderId: string, targetStatus: 'ready' | 'paid') => {
    const token = localStorage.getItem('streetbite_token') || '';
    const originalOrders = [...orders];

    // Read the current state to rollback if needed
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    // Optimistically update locally
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus, updatedAt: new Date().toISOString() } : o))
    );

    try {
      const response = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!response.ok) {
        // Rollback on server refusal
        setOrders(originalOrders);
      }
    } catch (e) {
      // Rollback on network timeout
      setOrders(originalOrders);
    }
  };

  /* ======================================================== */

  // Auth Loading Interceptor
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-t-[#FD7979] border-red-100 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500">Connecting with StreetBite server...</p>
        </div>
      </div>
    );
  }

  // PUBLIC GUEST CART PATHWAY
  if (route.type === 'customer-order' && route.slug) {
    return <CustomerOrderPage slug={route.slug} onNavigateHome={() => navigateTo('#/')} />;
  }

  // PUBLIC LANDING PREVIEW
  if (route.type === 'public-page' && route.slug) {
    return (
      <PublicVendorPage 
        slug={route.slug} 
        onNavigateToOrder={(s) => navigateTo(`#/order/${s}`)} 
        onNavigateHome={() => navigateTo('#/')} 
      />
    );
  }

  // ROOT VISUAL ROUTER INTERCEPTOR
  if (route.type === 'landing') {
    return <LandingPage onNavigate={navigateTo} />;
  }

  if (route.type === 'login' || route.type === 'register') {
    if (isAuthenticated && vendor) {
      // Redirect authenticated lines straight to dashboard
      setTimeout(() => navigateTo('#/dashboard'), 50);
      return null;
    }
    return (
      <AuthPage 
        initialMode={route.type} 
        onAuthSuccess={handleAuthSuccess} 
        onNavigate={navigateTo} 
      />
    );
  }

  if (route.type === 'dashboard') {
    if (!isAuthenticated || !vendor) {
      // Access guard: if unauthenticated, redirect to auth form
      setTimeout(() => navigateTo('#/login'), 50);
      return null;
    }

    // Determine target sub-tab
    const currentTab = route.tab || 'home';

    return (
      <DashboardLayout
        vendor={vendor}
        activeTab={currentTab}
        onTabChange={(tabName) => navigateTo(`#/dashboard/${tabName}`)}
        onLogout={handleLogout}
        onUpdateVendor={(updatedVendor) => setVendor(updatedVendor)}
      >
        {currentTab === 'home' && (
          <OverviewTab
            orders={orders}
            menuItems={menuItems}
            inventory={inventory}
            onTabChange={(tabName) => navigateTo(`#/dashboard/${tabName}`)}
            onMarkReady={(oid) => handleTransitionOrderStatus(oid, 'ready')}
            onMarkPaid={(oid) => handleTransitionOrderStatus(oid, 'paid')}
          />
        )}

        {currentTab === 'orders' && (
          <OrdersTab
            orders={orders}
            onMarkReady={(oid) => handleTransitionOrderStatus(oid, 'ready')}
            onMarkPaid={(oid) => handleTransitionOrderStatus(oid, 'paid')}
            playBeep={playNotificationBeep}
          />
        )}

        {currentTab === 'menu' && (
          <MenuTab
            menuItems={menuItems}
            onAddItem={handleAddMenuItem}
            onToggleAvailable={handleToggleMenuAvailability}
            onDeleteItem={handleDeleteMenuItem}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryTab
            inventory={inventory}
            onAddInventory={handleAddInventoryItem}
            onUpdateStock={handleUpdateStockCount}
            onDeleteInventory={handleDeleteInventoryItem}
            onEditInventory={handleEditInventoryItem}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsTab
            orders={orders}
            menuItems={menuItems}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsTab
            vendor={vendor}
            onUpdateVendor={(updatedVendor) => setVendor(updatedVendor)}
            onDeleteAccount={handleDeleteStall}
          />
        )}
      </DashboardLayout>
    );
  }

  // Absolute fallback redirects to landing page
  return <LandingPage onNavigate={navigateTo} />;
}
