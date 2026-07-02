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
import {
  createInventoryItem,
  createMenuItem,
  deleteMenuItem,
  deleteInventoryItem,
  deleteVendorProfile,
  getVendorProfile,
  signOutVendor,
  subscribeToAuthChanges,
  subscribeToVendorResources,
  updateInventoryItem,
  updateMenuItemAvailability,
  updateOrderStatus,
  updateVendorProfile,
} from './firebaseService';
import { analyticsPromise } from './firebase';

export default function App() {
  const [route, setRoute] = React.useState<any>(() => parseCurrentUrl());
  const [vendor, setVendor] = React.useState<Vendor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loadingAuth, setLoadingAuth] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const previousOrdersRef = React.useRef<Order[]>([]);

  const playNotificationBeep = React.useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime);

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

  function parseCurrentUrl() {
    const path = window.location.pathname;
    const hash = window.location.hash;

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

  React.useEffect(() => {
    void analyticsPromise;
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      if (user) {
        try {
          const profile = await getVendorProfile(user.uid);
          setVendor(profile);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Could not load merchant profile', err);
          setVendor(null);
          setIsAuthenticated(false);
        }
      } else {
        setVendor(null);
        setIsAuthenticated(false);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

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

  React.useEffect(() => {
    if (!isAuthenticated || !vendor?.id) {
      setOrders([]);
      setMenuItems([]);
      setInventory([]);
      previousOrdersRef.current = [];
      return;
    }

    const unsubscribe = subscribeToVendorResources(vendor.id, {
      onMenuItems: setMenuItems,
      onInventory: setInventory,
      onOrders: setOrders,
    });

    return () => unsubscribe();
  }, [isAuthenticated, vendor?.id]);

  React.useEffect(() => {
    if (!isAuthenticated || !vendor?.id) return;

    const newOrders = orders.filter((order) => !previousOrdersRef.current.some((prev) => prev.id === order.id));
    if (newOrders.length > 0) {
      playNotificationBeep();
    }
    previousOrdersRef.current = orders;
  }, [orders, isAuthenticated, vendor?.id, playNotificationBeep]);

  const navigateTo = (navTarget: string) => {
    window.location.hash = navTarget.replace(/^#/, '');
  };

  const handleAuthSuccess = (_token: string, loadedVendor: Vendor) => {
    setVendor(loadedVendor);
    setIsAuthenticated(true);
    setLoadingAuth(false);
  };

  const handleLogout = async () => {
    try {
      await signOutVendor();
    } catch (err) {
      console.error('Logout failed', err);
    }

    setVendor(null);
    setIsAuthenticated(false);
    setOrders([]);
    setMenuItems([]);
    setInventory([]);
    navigateTo('#/');
  };

  const handleDeleteStall = async () => {
    if (vendor?.id) {
      try {
        await deleteVendorProfile(vendor.id);
      } catch (err) {
        console.error('Could not remove stall profile', err);
      }
    }

    await handleLogout();
  };

  const handleAddMenuItem = async (itemDetails: { name: string; price: number; category: string }) => {
    if (!vendor?.id) throw new Error('Merchant profile is not ready.');
    await createMenuItem(vendor.id, itemDetails);
  };

  const handleToggleMenuAvailability = async (itemId: string, currentAvailable: boolean) => {
    if (!vendor?.id) return;
    await updateMenuItemAvailability(vendor.id, itemId, !currentAvailable);
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!vendor?.id) return;
    await deleteMenuItem(vendor.id, itemId);
  };

  const handleAddInventoryItem = async (fields: {
    itemName: string;
    unit: string;
    currentStock: number | null;
    lowStockThreshold: number | null;
    hasCountTracking: boolean;
  }) => {
    if (!vendor?.id) throw new Error('Merchant profile is not ready.');
    await createInventoryItem(vendor.id, fields);
  };

  const handleUpdateStockCount = async (itemId: string, diff: number) => {
    if (!vendor?.id) return;
    const target = inventory.find((inv) => inv.id === itemId);
    if (!target || target.currentStock === null) return;
    const nextStock = Math.max(0, target.currentStock + diff);
    await updateInventoryItem(vendor.id, itemId, { currentStock: nextStock, updatedAt: new Date().toISOString(), hasCountTracking: true });
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    if (!vendor?.id) return;
    await deleteInventoryItem(vendor.id, itemId);
  };

  const handleEditInventoryItem = async (itemId: string, updatedFields: Partial<InventoryItem>) => {
    if (!vendor?.id) return;
    await updateInventoryItem(vendor.id, itemId, updatedFields);
  };

  const handleTransitionOrderStatus = async (orderId: string, targetStatus: 'ready' | 'paid') => {
    if (!vendor?.id) return;
    await updateOrderStatus(vendor.id, orderId, targetStatus);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-t-[#FD7979] border-red-100 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500">Connecting with Firebase...</p>
        </div>
      </div>
    );
  }

  if (route.type === 'customer-order' && route.slug) {
    return <CustomerOrderPage slug={route.slug} onNavigateHome={() => navigateTo('#/')} />;
  }

  if (route.type === 'public-page' && route.slug) {
    return (
      <PublicVendorPage
        slug={route.slug}
        onNavigateToOrder={(s) => navigateTo(`#/order/${s}`)}
        onNavigateHome={() => navigateTo('#/')}
      />
    );
  }

  if (route.type === 'landing') {
    return <LandingPage onNavigate={navigateTo} />;
  }

  if (route.type === 'login' || route.type === 'register') {
    if (isAuthenticated && vendor) {
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
      setTimeout(() => navigateTo('#/login'), 50);
      return null;
    }

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
          <ReportsTab orders={orders} menuItems={menuItems} />
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

  return <LandingPage onNavigate={navigateTo} />;
}
