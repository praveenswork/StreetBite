import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { InventoryItem, MenuItem, Order, Vendor } from './types';

function toVendor(document: DocumentData, id: string): Vendor {
  return {
    id,
    name: document.name ?? '',
    slug: document.slug ?? '',
    email: document.email ?? '',
    phone: document.phone ?? '',
    stallName: document.stallName ?? '',
    stallCategory: document.stallCategory ?? '',
    locationText: document.locationText ?? '',
    upiId: document.upiId ?? '',
    logoUrl: document.logoUrl ?? '',
    isActive: document.isActive ?? true,
    isAcceptingOrders: document.isAcceptingOrders ?? true,
    createdAt: document.createdAt ?? new Date().toISOString(),
  };
}

function toMenuItem(document: DocumentData, id: string): MenuItem {
  return {
    id,
    vendorId: document.vendorId ?? '',
    name: document.name ?? '',
    price: Number(document.price ?? 0),
    category: document.category ?? 'General',
    imageUrl: document.imageUrl ?? '',
    isAvailable: document.isAvailable ?? true,
    sortOrder: Number(document.sortOrder ?? 0),
    createdAt: document.createdAt ?? new Date().toISOString(),
  };
}

function toInventoryItem(document: DocumentData, id: string): InventoryItem {
  return {
    id,
    vendorId: document.vendorId ?? '',
    itemName: document.itemName ?? '',
    unit: document.unit ?? 'other',
    currentStock: document.currentStock ?? null,
    lowStockThreshold: document.lowStockThreshold ?? null,
    hasCountTracking: document.hasCountTracking ?? false,
    updatedAt: document.updatedAt ?? new Date().toISOString(),
  };
}

function toOrder(document: DocumentData, id: string): Order {
  const rawItems = Array.isArray(document.items) ? document.items : [];
  const normalizedItems = rawItems.map((item: any, index: number) => ({
    id: item?.id ?? `${id}-${index}`,
    orderId: id,
    menuItemId: item?.menuItemId ?? item?.id ?? '',
    itemName: item?.itemName ?? item?.name ?? 'Unknown item',
    itemPrice: Number(item?.itemPrice ?? item?.price ?? 0),
    quantity: Number(item?.quantity ?? 0),
  }));
  const derivedTotal = normalizedItems.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);

  return {
    id,
    vendorId: document.vendorId ?? '',
    customerName: document.customerName ?? '',
    totalAmount: Number(document.totalAmount ?? (derivedTotal > 0 ? derivedTotal : 0)),
    status: document.status ?? 'pending',
    items: normalizedItems,
    createdAt: document.createdAt ?? new Date().toISOString(),
    updatedAt: document.updatedAt ?? new Date().toISOString(),
  };
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInVendor(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const vendorDoc = await getDoc(doc(db, 'vendors', credential.user.uid));
  if (!vendorDoc.exists()) {
    throw new Error('Your merchant profile was not found in Firebase.');
  }
  return {
    user: credential.user,
    vendor: toVendor(vendorDoc.data(), vendorDoc.id),
  };
}

export async function registerVendor(payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  stallName: string;
  stallCategory: string;
  locationText: string;
  upiId: string;
}) {
  const credential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
  const slug = payload.stallName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const vendorData: Vendor = {
    id: credential.user.uid,
    name: payload.name,
    slug,
    email: payload.email,
    phone: payload.phone,
    stallName: payload.stallName,
    stallCategory: payload.stallCategory,
    locationText: payload.locationText,
    upiId: payload.upiId,
    logoUrl: '',
    isActive: true,
    isAcceptingOrders: true,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'vendors', credential.user.uid), vendorData);
  return { user: credential.user, vendor: vendorData };
}

export async function getVendorProfile(vendorId: string) {
  const vendorDoc = await getDoc(doc(db, 'vendors', vendorId));
  if (!vendorDoc.exists()) {
    throw new Error('Merchant profile not found.');
  }
  return toVendor(vendorDoc.data(), vendorDoc.id);
}

export async function updateVendorProfile(vendorId: string, updates: Partial<Vendor>) {
  await updateDoc(doc(db, 'vendors', vendorId), updates as DocumentData);
  return getVendorProfile(vendorId);
}

export async function deleteVendorProfile(vendorId: string) {
  await deleteDoc(doc(db, 'vendors', vendorId));
}

export async function signOutVendor() {
  await signOut(auth);
}

export function subscribeToVendorResources(
  vendorId: string,
  callbacks: {
    onMenuItems: (items: MenuItem[]) => void;
    onInventory: (items: InventoryItem[]) => void;
    onOrders: (orders: Order[]) => void;
  },
) {
  const menuCollection = collection(db, 'vendors', vendorId, 'menuItems');
  const inventoryCollection = collection(db, 'vendors', vendorId, 'inventory');
  const ordersCollection = query(collection(db, 'vendors', vendorId, 'orders'), orderBy('createdAt', 'desc'));

  const unsubscribeMenu = onSnapshot(menuCollection, (snapshot) => {
    const nextItems = snapshot.docs.map((docItem) => toMenuItem(docItem.data(), docItem.id));
    callbacks.onMenuItems(nextItems);
  });

  const unsubscribeInventory = onSnapshot(inventoryCollection, (snapshot) => {
    const nextItems = snapshot.docs.map((docItem) => toInventoryItem(docItem.data(), docItem.id));
    callbacks.onInventory(nextItems);
  });

  const unsubscribeOrders = onSnapshot(ordersCollection, (snapshot) => {
    const nextOrders = snapshot.docs.map((docItem) => toOrder(docItem.data(), docItem.id));
    callbacks.onOrders(nextOrders);
  });

  return () => {
    unsubscribeMenu();
    unsubscribeInventory();
    unsubscribeOrders();
  };
}

export async function createMenuItem(vendorId: string, itemDetails: { name: string; price: number; category: string }) {
  const created = await addDoc(collection(db, 'vendors', vendorId, 'menuItems'), {
    vendorId,
    name: itemDetails.name,
    price: itemDetails.price,
    category: itemDetails.category,
    imageUrl: '',
    isAvailable: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  });
  const snapshot = await getDoc(created);
  return toMenuItem(snapshot.data() ?? {}, snapshot.id);
}

export async function updateMenuItemAvailability(vendorId: string, itemId: string, isAvailable: boolean) {
  await updateDoc(doc(db, 'vendors', vendorId, 'menuItems', itemId), { isAvailable });
}

export async function deleteMenuItem(vendorId: string, itemId: string) {
  await deleteDoc(doc(db, 'vendors', vendorId, 'menuItems', itemId));
}

export async function createInventoryItem(vendorId: string, fields: {
  itemName: string;
  unit: string;
  currentStock: number | null;
  lowStockThreshold: number | null;
  hasCountTracking: boolean;
}) {
  const created = await addDoc(collection(db, 'vendors', vendorId, 'inventory'), {
    vendorId,
    itemName: fields.itemName,
    unit: fields.unit,
    currentStock: fields.currentStock,
    lowStockThreshold: fields.lowStockThreshold,
    hasCountTracking: fields.hasCountTracking,
    updatedAt: new Date().toISOString(),
  });
  const snapshot = await getDoc(created);
  return toInventoryItem(snapshot.data() ?? {}, snapshot.id);
}

export async function updateInventoryItem(vendorId: string, itemId: string, updates: Partial<InventoryItem>) {
  await updateDoc(doc(db, 'vendors', vendorId, 'inventory', itemId), updates as DocumentData);
  const snapshot = await getDoc(doc(db, 'vendors', vendorId, 'inventory', itemId));
  return toInventoryItem(snapshot.data() ?? {}, snapshot.id);
}

export async function deleteInventoryItem(vendorId: string, itemId: string) {
  await deleteDoc(doc(db, 'vendors', vendorId, 'inventory', itemId));
}

export async function updateOrderStatus(vendorId: string, orderId: string, status: 'ready' | 'paid') {
  await updateDoc(doc(db, 'vendors', vendorId, 'orders', orderId), {
    status,
    updatedAt: new Date().toISOString(),
  });
  const snapshot = await getDoc(doc(db, 'vendors', vendorId, 'orders', orderId));
  return toOrder(snapshot.data() ?? {}, snapshot.id);
}

export async function getPublicVendorBySlug(slug: string) {
  const vendorQuery = query(collection(db, 'vendors'), where('slug', '==', slug), limit(1));
  const vendorSnapshot = await getDocs(vendorQuery);
  if (vendorSnapshot.empty) {
    return null;
  }

  const vendorDoc = vendorSnapshot.docs[0];
  const vendor = toVendor(vendorDoc.data(), vendorDoc.id);
  const menuSnapshot = await getDocs(collection(db, 'vendors', vendorDoc.id, 'menuItems'));
  const menuItems = menuSnapshot.docs.map((itemDoc) => toMenuItem(itemDoc.data(), itemDoc.id));
  return { vendor, menuItems };
}

export async function placeOrderForVendor(vendorId: string, payload: { customerName: string; items: Array<{ id: string; quantity: number; price?: number; name?: string }> }) {
  const menuSnapshot = await getDocs(collection(db, 'vendors', vendorId, 'menuItems'));
  const menuItemsById = new Map(menuSnapshot.docs.map((itemDoc) => [itemDoc.id, toMenuItem(itemDoc.data(), itemDoc.id)]));

  const orderItems = payload.items.map((item) => {
    const menuItem = menuItemsById.get(item.id);
    const itemPrice = Number(menuItem?.price ?? item.price ?? 0);
    return {
      id: item.id,
      menuItemId: item.id,
      itemName: menuItem?.name ?? item.name ?? 'Unknown item',
      itemPrice,
      quantity: item.quantity,
    };
  });

  const totalAmount = orderItems.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);
  const orderRef = await addDoc(collection(db, 'vendors', vendorId, 'orders'), {
    vendorId,
    customerName: payload.customerName,
    totalAmount,
    status: 'pending',
    items: orderItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const snapshot = await getDoc(orderRef);
  return {
    id: orderRef.id,
    customerName: payload.customerName,
    totalAmount,
    prepTimeMinutes: Math.max(8, payload.items.length * 4 + 6),
    ...snapshot.data(),
  };
}
