/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  stallName: string;
  stallCategory: string;
  locationText: string;
  upiId: string;
  logoUrl: string;
  isActive: boolean;
  isAcceptingOrders: boolean;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'ready' | 'paid';

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  vendorId: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  vendorId: string;
  itemName: string;
  unit: string;
  currentStock: number | null;
  lowStockThreshold: number | null;
  hasCountTracking: boolean;
  updatedAt: string;
}

export interface DashboardStats {
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  topItem: { name: string; quantity: number } | null;
}
