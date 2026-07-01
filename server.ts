/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

app.use(express.json());

// File paths for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface structures
interface DbSchema {
  vendors: any[];
  menuItems: any[];
  orders: any[];
  inventory: any[];
}

// Global server memory state loaded from / written to DB
let db: DbSchema = {
  vendors: [],
  menuItems: [],
  orders: [],
  inventory: [],
};

// Ensure data directory and default state exist
function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
    } catch (e) {
      console.error('Error reading database file, resetting to empty schema', e);
    }
  } else {
    // Generate organic mock data for a vibrant initial experience
    const demoVendorId = 'demo-vendor';
    db.vendors = [
      {
        id: demoVendorId,
        name: 'Prakash Sharma',
        slug: 'sharma-chaat',
        email: 'praveens1306@gmail.com', // Prefilled to match user email context
        phone: '9876543210',
        stallName: 'Sharma Chaat & Fast Food',
        stallCategory: 'Chaat & Snacks',
        locationText: 'Sector 15, Huda Market, Gurugram, Haryana',
        upiId: 'prakash@paytm',
        logoUrl: '',
        isActive: true,
        isAcceptingOrders: true,
        createdAt: new Date('2026-05-01T10:00:00Z').toISOString(),
      }
    ];

    db.menuItems = [
      {
        id: 'menu-1',
        vendorId: demoVendorId,
        name: 'Special Pani Puri (6 Pcs)',
        price: 40,
        category: 'Puri Specials',
        imageUrl: '',
        isAvailable: true,
        sortOrder: 1,
        createdAt: new Date('2026-05-01T10:10:00Z').toISOString(),
      },
      {
        id: 'menu-2',
        vendorId: demoVendorId,
        name: 'Samosa Chaat Double',
        price: 65,
        category: 'Chaat Plates',
        imageUrl: '',
        isAvailable: true,
        sortOrder: 2,
        createdAt: new Date('2026-05-01T10:12:00Z').toISOString(),
      },
      {
        id: 'menu-3',
        vendorId: demoVendorId,
        name: 'Butter Pav Bhaji (Heavy)',
        price: 80,
        category: 'Main Grid',
        imageUrl: '',
        isAvailable: true,
        sortOrder: 3,
        createdAt: new Date('2026-05-01T10:15:00Z').toISOString(),
      },
      {
        id: 'menu-4',
        vendorId: demoVendorId,
        name: 'Hot Masala Cutting Chai',
        price: 15,
        category: 'Beverages',
        imageUrl: '',
        isAvailable: true,
        sortOrder: 4,
        createdAt: new Date('2026-05-01T10:18:00Z').toISOString(),
      },
      {
        id: 'menu-5',
        vendorId: demoVendorId,
        name: 'Grill Cheese Vada Pav',
        price: 35,
        category: 'Vada Pav Corners',
        imageUrl: '',
        isAvailable: false, // Out of stock to test UI toggle
        sortOrder: 5,
        createdAt: new Date('2026-05-01T10:20:00Z').toISOString(),
      }
    ];

    db.inventory = [
      {
        id: 'inv-1',
        vendorId: demoVendorId,
        itemName: 'Pav Soft Buns',
        unit: 'pieces',
        currentStock: 48,
        lowStockThreshold: 15,
        hasCountTracking: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inv-2',
        vendorId: demoVendorId,
        itemName: 'Amul Butter Blocks',
        unit: 'pieces',
        currentStock: 4,
        lowStockThreshold: 5, // Shows as low stock!
        hasCountTracking: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inv-3',
        vendorId: demoVendorId,
        itemName: 'Puri Stock Shelves',
        unit: 'pieces',
        currentStock: 350,
        lowStockThreshold: 100,
        hasCountTracking: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inv-4',
        vendorId: demoVendorId,
        itemName: 'Chutney Spices Premix',
        unit: 'kg',
        currentStock: 12,
        lowStockThreshold: 3,
        hasCountTracking: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'inv-5',
        vendorId: demoVendorId,
        itemName: 'Fresh Potatoes Bags',
        unit: 'other',
        currentStock: null,
        lowStockThreshold: null,
        hasCountTracking: false, // Name tracking only
        updatedAt: new Date().toISOString(),
      }
    ];

    // Seed past 7 days of order history dynamically based on current date
    const today = new Date('2026-06-04T10:22:22Z'); // Match user's local time context
    const orderItemsTemplates = [
      { menuItemId: 'menu-1', itemName: 'Special Pani Puri (6 Pcs)', itemPrice: 40 },
      { menuItemId: 'menu-2', itemName: 'Samosa Chaat Double', itemPrice: 65 },
      { menuItemId: 'menu-3', itemName: 'Butter Pav Bhaji (Heavy)', itemPrice: 80 },
      { menuItemId: 'menu-4', itemName: 'Hot Masala Cutting Chai', itemPrice: 15 },
    ];

    const customerNames = [
      'Amit Kumar', 'Riya Sen', 'Vijay Patel', 'Ankita Das', 'Rajesh Joshi',
      'Pooja Sharma', 'Vikram Negi', 'Nisha Gupta', 'Kabir Seth', 'Sneha Paul',
      'Arjun Roy', 'Simran Kaur', 'Deepak Verma', 'Sonia Mishra', 'Pranav Nair'
    ];

    // Create 18 historical orders
    let orderIndex = 1;
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const orderDate = new Date(today);
      orderDate.setDate(today.getDate() - dayOffset);
      
      // Randomize hours
      orderDate.setHours(11 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0);
      
      // Number of orders on this day (between 1 and 4)
      const dailyCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < dailyCount; i++) {
        const itemSeed1 = orderItemsTemplates[Math.floor(Math.random() * orderItemsTemplates.length)];
        const itemSeed2 = orderItemsTemplates[Math.floor(Math.random() * orderItemsTemplates.length)];
        const qty1 = Math.floor(Math.random() * 2) + 1;
        const qty2 = Math.floor(Math.random() * 2) + 1;

        const subtotal = (itemSeed1.itemPrice * qty1) + (itemSeed2.itemPrice * qty2);
        const orderId = `order-past-${orderIndex++}`;

        const isToday = dayOffset === 0;

        const record = {
          id: orderId,
          vendorId: demoVendorId,
          customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
          totalAmount: subtotal,
          status: isToday ? (Math.random() > 0.4 ? 'ready' : 'pending') : 'paid',
          createdAt: orderDate.toISOString(),
          updatedAt: orderDate.toISOString(),
        };

        const generatedItems = [
          {
            id: `oi-${orderId}-1`,
            orderId: orderId,
            menuItemId: itemSeed1.menuItemId,
            itemName: itemSeed1.itemName,
            itemPrice: itemSeed1.itemPrice,
            quantity: qty1,
          },
          {
            id: `oi-${orderId}-2`,
            orderId: orderId,
            menuItemId: itemSeed2.menuItemId,
            itemName: itemSeed2.itemName,
            itemPrice: itemSeed2.itemPrice,
            quantity: qty2,
          }
        ];

        db.orders.push({
          ...record,
          items: generatedItems
        });
      }
    }

    saveDb();
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing to database file', e);
  }
}

initDb();

// Active server-sent connections indexed by vendorId
const clientsMap = new Map<string, express.Response[]>();

// Utility to dispatch real-time events to all tabs of a specific vendor
function broadcastToVendor(vendorId: string, eventType: string, payload: any) {
  const clients = clientsMap.get(vendorId);
  if (clients && clients.length > 0) {
    const rawData = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
    clients.forEach((res) => {
      res.write(rawData);
    });
  }
}

// REST Middlewares
function getVendorIdFromToken(token: string): string | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    return parsed.vendorId || null;
  } catch (e) {
    return null;
  }
}

const reqAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['x-auth-token'] as string;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }
  const vendorId = getVendorIdFromToken(authHeader);
  if (!vendorId) {
    return res.status(401).json({ error: 'Invalid or expired authorization token' });
  }
  const vendor = db.vendors.find((v) => v.id === vendorId);
  if (!vendor) {
    return res.status(401).json({ error: 'Vendor profile not found' });
  }
  (req as any).vendor = vendor;
  next();
};

/* ================== API ENDPOINTS ================== */

// Realtime Event Stream Endpoint (SSE)
app.get('/api/vendor/realtime', (req, res) => {
  const token = req.query.token as string;
  const vendorId = getVendorIdFromToken(token);
  
  if (!vendorId) {
    return res.status(401).send('Unauthorized real-time link');
  }

  // Setup response for standard Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable buffering for Nginx proxy compatibility
  });
  
  res.write(':ok\n\n');

  if (!clientsMap.has(vendorId)) {
    clientsMap.set(vendorId, []);
  }
  clientsMap.get(vendorId)!.push(res);

  // Keep-alive heartbeat interval to avoid connection dropout
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 35000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const clients = clientsMap.get(vendorId);
    if (clients) {
      const idx = clients.indexOf(res);
      if (idx !== -1) {
        clients.splice(idx, 1);
      }
    }
  });
});

// AUTH REGISTRATION
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, stallName, stallCategory, locationText, upiId } = req.body;
  if (!name || !email || !stallName) {
    return res.status(400).json({ error: 'Name, email, and stall name are required' });
  }

  // Check email conflict
  const emailExists = db.vendors.find((v) => v.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    return res.status(400).json({ error: 'A vendor account with this email already exists' });
  }

  // Generate Unique Slug
  let slug = stallName.trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  
  let appendNum = 1;
  const originalSlug = slug;
  while (db.vendors.some((v) => v.slug === slug)) {
    slug = `${originalSlug}-${appendNum++}`;
  }

  const newVendor = {
    id: 'vendor-' + Date.now(),
    name,
    email,
    phone: phone || '',
    slug,
    stallName,
    stallCategory: stallCategory || 'Street Food',
    locationText: locationText || '',
    upiId: upiId || '',
    logoUrl: '',
    isActive: true,
    isAcceptingOrders: true,
    createdAt: new Date().toISOString(),
  };

  db.vendors.push(newVendor);

  // Generate core default items to save vendor time
  const categories = ['Main Plates', 'Beverages', 'Sides'];
  categories.forEach((cat, idx) => {
    db.menuItems.push({
      id: `m-init-${Date.now()}-${idx}`,
      vendorId: newVendor.id,
      name: idx === 0 ? 'Classic Fast Dish' : idx === 1 ? 'Refreshing Drink' : 'Bite Snack',
      price: idx === 0 ? 99 : idx === 1 ? 25 : 45,
      category: cat,
      imageUrl: '',
      isAvailable: true,
      sortOrder: idx + 1,
      createdAt: new Date().toISOString(),
    });
  });

  saveDb();

  const token = Buffer.from(JSON.stringify({ vendorId: newVendor.id })).toString('base64');
  res.status(201).json({ token, vendor: newVendor });
});

// AUTH LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required for passwordless entry' });
  }

  const vendor = db.vendors.find((v) => v.email.toLowerCase() === email.toLowerCase());
  if (!vendor) {
    return res.status(404).json({ error: 'Vendor account not found. Please register your stall first.' });
  }

  const token = Buffer.from(JSON.stringify({ vendorId: vendor.id })).toString('base64');
  res.json({ token, vendor });
});

app.get('/api/auth/me', reqAuth, (req: any, res) => {
  res.json({ vendor: req.vendor });
});

// PROFILE UPDATE
app.put('/api/vendor/profile', reqAuth, (req: any, res) => {
  const { name, phone, stallName, stallCategory, locationText, upiId, logoUrl, isAcceptingOrders } = req.body;
  const vendorId = req.vendor.id;

  const vIdx = db.vendors.findIndex((v) => v.id === vendorId);
  if (vIdx === -1) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Update slug if stallName undergoes changes and doesn't conflict
  let finalSlug = db.vendors[vIdx].slug;
  if (stallName && stallName !== db.vendors[vIdx].stallName) {
    let slug = stallName.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    
    let appendNum = 1;
    const originalSlug = slug;
    while (db.vendors.some((v) => v.slug === slug && v.id !== vendorId)) {
      slug = `${originalSlug}-${appendNum++}`;
    }
    finalSlug = slug;
  }

  db.vendors[vIdx] = {
    ...db.vendors[vIdx],
    name: name !== undefined ? name : db.vendors[vIdx].name,
    phone: phone !== undefined ? phone : db.vendors[vIdx].phone,
    stallName: stallName !== undefined ? stallName : db.vendors[vIdx].stallName,
    stallCategory: stallCategory !== undefined ? stallCategory : db.vendors[vIdx].stallCategory,
    locationText: locationText !== undefined ? locationText : db.vendors[vIdx].locationText,
    upiId: upiId !== undefined ? upiId : db.vendors[vIdx].upiId,
    logoUrl: logoUrl !== undefined ? logoUrl : db.vendors[vIdx].logoUrl,
    slug: finalSlug,
    isAcceptingOrders: isAcceptingOrders !== undefined ? isAcceptingOrders : db.vendors[vIdx].isAcceptingOrders,
  };

  saveDb();
  res.json({ vendor: db.vendors[vIdx] });
});

// MENU ENDPOINTS
app.get('/api/vendor/menu', reqAuth, (req: any, res) => {
  const items = db.menuItems.filter((m) => m.vendorId === req.vendor.id);
  res.json({ menuItems: items });
});

app.post('/api/vendor/menu', reqAuth, (req: any, res) => {
  const { name, price, category, imageUrl } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Item name and price are required' });
  }

  const newItem = {
    id: 'menu-' + Date.now(),
    vendorId: req.vendor.id,
    name,
    price: Number(price),
    category: category || 'General',
    imageUrl: imageUrl || '',
    isAvailable: true,
    sortOrder: db.menuItems.filter((m) => m.vendorId === req.vendor.id).length + 1,
    createdAt: new Date().toISOString(),
  };

  db.menuItems.push(newItem);
  saveDb();
  res.status(201).json({ menuItem: newItem });
});

app.put('/api/vendor/menu/:id', reqAuth, (req: any, res) => {
  const { name, price, category, imageUrl, isAvailable, sortOrder } = req.body;
  const mId = req.params.id;

  const itemIdx = db.menuItems.findIndex((m) => m.id === mId && m.vendorId === req.vendor.id);
  if (itemIdx === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  db.menuItems[itemIdx] = {
    ...db.menuItems[itemIdx],
    name: name !== undefined ? name : db.menuItems[itemIdx].name,
    price: price !== undefined ? Number(price) : db.menuItems[itemIdx].price,
    category: category !== undefined ? category : db.menuItems[itemIdx].category,
    imageUrl: imageUrl !== undefined ? imageUrl : db.menuItems[itemIdx].imageUrl,
    isAvailable: isAvailable !== undefined ? isAvailable : db.menuItems[itemIdx].isAvailable,
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : db.menuItems[itemIdx].sortOrder,
  };

  saveDb();
  res.json({ menuItem: db.menuItems[itemIdx] });
});

app.delete('/api/vendor/menu/:id', reqAuth, (req: any, res) => {
  const mId = req.params.id;
  const itemIdx = db.menuItems.findIndex((m) => m.id === mId && m.vendorId === req.vendor.id);
  if (itemIdx === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  db.menuItems.splice(itemIdx, 1);
  saveDb();
  res.json({ success: true, message: 'Item deleted safely' });
});

// INVENTORY ENDPOINTS
app.get('/api/vendor/inventory', reqAuth, (req: any, res) => {
  const items = db.inventory.filter((inv) => inv.vendorId === req.vendor.id);
  res.json({ inventoryItems: items });
});

app.post('/api/vendor/inventory', reqAuth, (req: any, res) => {
  const { itemName, unit, currentStock, lowStockThreshold, hasCountTracking } = req.body;
  if (!itemName || !unit) {
    return res.status(400).json({ error: 'Item name and unit notation are required' });
  }

  const newInv = {
    id: 'inv-' + Date.now(),
    vendorId: req.vendor.id,
    itemName,
    unit,
    currentStock: hasCountTracking ? Number(currentStock || 0) : null,
    lowStockThreshold: hasCountTracking ? Number(lowStockThreshold || 0) : null,
    hasCountTracking: !!hasCountTracking,
    updatedAt: new Date().toISOString(),
  };

  db.inventory.push(newInv);
  saveDb();
  res.status(201).json({ inventoryItem: newInv });
});

app.put('/api/vendor/inventory/:id', reqAuth, (req: any, res) => {
  const { itemName, unit, currentStock, lowStockThreshold, hasCountTracking } = req.body;
  const invId = req.params.id;

  const invIdx = db.inventory.findIndex((inv) => inv.id === invId && inv.vendorId === req.vendor.id);
  if (invIdx === -1) {
    return res.status(404).json({ error: 'Inventory stock line not found' });
  }

  db.inventory[invIdx] = {
    ...db.inventory[invIdx],
    itemName: itemName !== undefined ? itemName : db.inventory[invIdx].itemName,
    unit: unit !== undefined ? unit : db.inventory[invIdx].unit,
    currentStock: hasCountTracking ? (currentStock !== undefined ? Number(currentStock) : db.inventory[invIdx].currentStock) : null,
    lowStockThreshold: hasCountTracking ? (lowStockThreshold !== undefined ? Number(lowStockThreshold) : db.inventory[invIdx].lowStockThreshold) : null,
    hasCountTracking: hasCountTracking !== undefined ? !!hasCountTracking : db.inventory[invIdx].hasCountTracking,
    updatedAt: new Date().toISOString(),
  };

  saveDb();
  res.json({ inventoryItem: db.inventory[invIdx] });
});

app.delete('/api/vendor/inventory/:id', reqAuth, (req: any, res) => {
  const invId = req.params.id;
  const idx = db.inventory.findIndex((inv) => inv.id === invId && inv.vendorId === req.vendor.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Inventory line item not found' });
  }

  db.inventory.splice(idx, 1);
  saveDb();
  res.json({ success: true });
});

// ORDERS CONTROL
app.get('/api/vendor/orders', reqAuth, (req: any, res) => {
  const list = db.orders.filter((o) => o.vendorId === req.vendor.id);
  res.json({ orders: list });
});

app.put('/api/vendor/orders/:id/status', reqAuth, (req: any, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  if (!['pending', 'ready', 'paid'].includes(status)) {
    return res.status(400).json({ error: 'Invalid order status transition target' });
  }

  const oIdx = db.orders.findIndex((o) => o.id === orderId && o.vendorId === req.vendor.id);
  if (oIdx === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.orders[oIdx].status = status;
  db.orders[oIdx].updatedAt = new Date().toISOString();

  saveDb();

  // Broadcast update live to all registered vendor screen SSE tabs
  broadcastToVendor(req.vendor.id, 'order:updated', db.orders[oIdx]);

  res.json({ order: db.orders[oIdx] });
});

// PUBLIC CUSTOMER ACCESS BY SLUG
app.get('/api/public/vendor/:slug', (req, res) => {
  const slug = req.params.slug;
  const vendor = db.vendors.find((v) => v.slug === slug);
  if (!vendor) {
    return res.status(404).json({ error: 'Street stall not found on StreetBite' });
  }

  const menuItems = db.menuItems.filter((m) => m.vendorId === vendor.id);
  res.json({
    vendorName: vendor.name,
    stallName: vendor.stallName,
    stallCategory: vendor.stallCategory,
    locationText: vendor.locationText,
    upiId: vendor.upiId,
    logoUrl: vendor.logoUrl,
    isAcceptingOrders: vendor.isAcceptingOrders,
    menuItems: menuItems,
  });
});

// PUBLIC CUSTOMER PLACE ORDER
app.post('/api/public/vendor/:slug/orders', (req, res) => {
  const slug = req.params.slug;
  const { customerName, items } = req.body; // items as Array of { id: string, quantity: number }

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: 'Customer name is required before placing order' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty. Please select food items.' });
  }

  const vendor = db.vendors.find((v) => v.slug === slug);
  if (!vendor) {
    return res.status(404).json({ error: 'Stall not found' });
  }

  if (!vendor.isAcceptingOrders) {
    return res.status(400).json({ error: 'We apologize! This vendor has paused taking orders right now.' });
  }

  const vendorMenuItems = db.menuItems.filter((m) => m.vendorId === vendor.id);
  
  let totalAmount = 0;
  const orderItemsList: any[] = [];
  const orderId = 'ord-' + Date.now();

  for (const itemInput of items) {
    const matchedMenu = vendorMenuItems.find((m) => m.id === itemInput.id);
    if (!matchedMenu) {
      return res.status(400).json({ error: `Selected item with ID ${itemInput.id} could not be found.` });
    }
    if (!matchedMenu.isAvailable) {
      return res.status(400).json({ error: `Oh no! ${matchedMenu.name} just sold out.` });
    }

    const price = matchedMenu.price;
    const quantity = Number(itemInput.quantity);
    if (quantity <= 0) continue;

    totalAmount += (price * quantity);
    orderItemsList.push({
      id: `oi-${orderId}-${matchedMenu.id}`,
      orderId: orderId,
      menuItemId: matchedMenu.id,
      itemName: matchedMenu.name,
      itemPrice: price,
      quantity: quantity,
    });
  }

  if (orderItemsList.length === 0) {
    return res.status(400).json({ error: 'Order must contain valid quantities' });
  }

  const newOrder = {
    id: orderId,
    vendorId: vendor.id,
    customerName: customerName.trim(),
    totalAmount: totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: orderItemsList
  };

  db.orders.push(newOrder);

  // Auto-deduct tracked inventory line items based on names!
  // E.g., if a menu item is 'Pav Bhaji', we could decrement 'Pav Soft Buns' by 2, etc. Realistically:
  db.inventory.forEach((inv) => {
    if (inv.vendorId === vendor.id && inv.hasCountTracking && inv.currentStock !== null) {
      // Small deduction logic mapping dish name search
      orderItemsList.forEach((oi) => {
        if (
          (inv.itemName.toLowerCase().includes('pav') && oi.itemName.toLowerCase().includes('pav')) ||
          (inv.itemName.toLowerCase().includes('butter') && oi.itemName.toLowerCase().includes('bhaji'))
        ) {
          inv.currentStock = Math.max(0, inv.currentStock - (oi.quantity * (inv.unit === 'pieces' ? 2 : 1)));
          inv.updatedAt = new Date().toISOString();
        }
      });
    }
  });

  saveDb();

  // Broadcast live order placement notification via SSE to active vendor sessions
  broadcastToVendor(vendor.id, 'order:created', newOrder);

  res.status(201).json({
    success: true,
    orderId: newOrder.id,
    customerName: newOrder.customerName,
    totalAmount: newOrder.totalAmount,
    prepTimeMinutes: 10,
  });
});

/* =================================================== */

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StreetBite Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
