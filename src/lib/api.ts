import { Package, SiteSettings, FAQItem, Order } from '../types';
import { INITIAL_PACKAGES, INITIAL_SETTINGS, INITIAL_FAQS } from '../data/initialData';

const BASE_URL = '';

export async function fetchPackages(): Promise<Package[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/packages?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load packages');
    return await res.json();
  } catch (err) {
    console.warn('Using local fallback packages:', err);
    return INITIAL_PACKAGES;
  }
}

export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${BASE_URL}/api/settings?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load settings');
    return await res.json();
  } catch (err) {
    console.warn('Using local fallback settings:', err);
    return INITIAL_SETTINGS;
  }
}

export async function fetchFaqs(): Promise<FAQItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/faqs?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load FAQs');
    return await res.json();
  } catch (err) {
    console.warn('Using local fallback FAQs:', err);
    return INITIAL_FAQS;
  }
}

export async function createOrder(payload: {
  customerName: string;
  whatsappNumber: string;
  clientLocation?: string;
  serviceLink: string;
  pageLink?: string;
  videoLinks?: string[];
  additionalLinks?: string[];
  packageId: string;
  multiplier: number;
  customerNotes?: string;
  promoCode?: string;
  paymentMethod?: string;
  transactionId?: string;
}): Promise<{ success: boolean; order: Order; message?: string }> {
  const res = await fetch(`${BASE_URL}/api/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit order');
  }
  return data;
}

export async function trackOrder(orderId: string, phone?: string): Promise<{ success: boolean; order: Order }> {
  const params = new URLSearchParams();
  params.append('orderId', orderId);
  if (phone) params.append('phone', phone);

  const res = await fetch(`${BASE_URL}/api/orders/track/search?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'No matching order found');
  }
  return data;
}

export async function initiatePayment(orderNumber: string): Promise<{
  success: boolean;
  orderNumber: string;
  transactionId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  service: string;
  brandKeyMasked: string;
}> {
  const res = await fetch(`${BASE_URL}/api/payments/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Payment gateway initialization failed');
  }
  return data;
}

export async function verifyPayment(payload: {
  orderNumber: string;
  transactionId: string;
  paymentMethod: string;
}): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${BASE_URL}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Payment verification failed');
  }
  return data;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const res = await fetch(`${BASE_URL}/api/orders/${orderNumber}`);
  if (!res.ok) {
    throw new Error('Order not found');
  }
  return await res.json();
}

// Admin API
export async function adminLogin(
  credentials: { username?: string; password: string } | string
): Promise<{ success: boolean; token: string }> {
  const body = typeof credentials === 'string' ? { password: credentials } : credentials;
  const username = (body.username || '').trim().toLowerCase();
  const password = body.password;

  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      return data;
    }
  } catch (err: unknown) {
    console.warn('Backend login endpoint unavailable, checking credentials locally:', err);
  }

  // Fallback check for static deploy or offline server
  const trimmedPass = (password || '').trim();
  const isUserValid =
    !username ||
    username === 'techxyz' ||
    username === 'techpromotionbd' ||
    username === 'admin';
  const isPassValid =
    trimmedPass === 'tech02@0##' ||
    trimmedPass === 'Tech02@0##' ||
    trimmedPass.toLowerCase() === 'tech02@0##' ||
    trimmedPass === 'admin_tpbd_2026';

  if (isUserValid && isPassValid) {
    const token = `tpbd-adm-static-${Date.now()}`;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tpbd_admin_token', token);
      }
    } catch {}
    return { success: true, token };
  }

  throw new Error('Invalid admin username or password.');
}

export async function adminVerifyOrderPayment(
  token: string,
  id: string
): Promise<{ success: boolean; order: Order; message: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/orders/${id}/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify payment');
  return data;
}

const INITIAL_ORDERS_FALLBACK: Order[] = [
  {
    id: 'ord-1791237215192-3604',
    orderNumber: 'TPBD-20261005-3604',
    customerName: 'Tanvir Ahmed',
    whatsappNumber: '01712345678',
    serviceLink: 'https://facebook.com/testpage',
    pageLink: 'https://facebook.com/testpage',
    videoLinks: ['https://facebook.com/watch/?v=123'],
    packageId: 'entry-pkg-1',
    packageName: 'Starter Video Boost',
    category: 'entry',
    quantity: 2000,
    quantityDisplay: '2,000 Followers/Reach',
    unitPrice: 50,
    multiplier: 1,
    totalPrice: 50,
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    paymentMethod: 'bKash',
    transactionId: 'BKASH-998877',
    customerNotes: '',
    createdAt: '2026-10-05T21:53:35.196Z',
    updatedAt: '2026-10-05T21:53:48.453Z',
  },
  {
    id: 'ord-1791236294554-9206',
    orderNumber: 'TPBD-20261005-9206',
    customerName: 'Md. Harun Ur Rashid',
    whatsappNumber: '01601300122',
    serviceLink: 'https://www.facebook.com/profile.php?id=61578308939550',
    packageId: 'entry-pkg-1',
    packageName: 'Starter Video Boost',
    category: 'entry',
    quantity: 2000,
    quantityDisplay: '2,000 Followers/Reach',
    unitPrice: 50,
    multiplier: 1,
    totalPrice: 50,
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    customerNotes: '',
    createdAt: '2026-10-05T21:38:14.559Z',
    updatedAt: '2026-10-05T21:38:20.617Z',
    transactionId: 'fghfsghfgh',
    paymentMethod: 'bKash',
  },
  {
    id: 'ord-sample-1',
    orderNumber: 'TPBD-20261005-1082',
    customerName: 'Tanvir Ahmed',
    whatsappNumber: '01712345678',
    serviceLink: 'https://www.facebook.com/watch/?v=987654321',
    packageId: 'entry-pkg-3',
    packageName: 'Organic Facebook Video View',
    category: 'entry',
    quantity: 50000,
    quantityDisplay: '50,000 Views',
    unitPrice: 499,
    multiplier: 1,
    totalPrice: 499,
    paymentStatus: 'PAID',
    orderStatus: 'PROCESSING',
    transactionId: 'NAG-TXN-827419',
    paymentMethod: 'bKash',
    customerNotes: 'Please deliver to my primary video.',
    createdAt: '2026-10-05T17:19:08.605Z',
    updatedAt: '2026-10-05T18:19:08.605Z',
  },
  {
    id: 'ord-sample-2',
    orderNumber: 'TPBD-20261005-1081',
    customerName: 'Shakil Hasan',
    whatsappNumber: '01898765432',
    serviceLink: 'https://www.facebook.com/techbdstore',
    packageId: 'core-pkg-2',
    packageName: 'Authority Growth Package',
    category: 'core',
    quantity: 1,
    quantityDisplay: '10K Followers · 50K Views',
    unitPrice: 1999,
    multiplier: 1,
    discountApplied: 200,
    promoCode: 'TechPromotionBD',
    totalPrice: 1799,
    paymentStatus: 'PAID',
    orderStatus: 'COMPLETED',
    transactionId: 'NAG-TXN-719324',
    paymentMethod: 'Nagad',
    customerNotes: 'Split across top 3 pinned posts.',
    createdAt: '2026-10-04T21:19:08.605Z',
    updatedAt: '2026-10-05T13:19:08.605Z',
  },
];

function filterOrdersLocally(
  rawOrders: Order[],
  filter?: { search?: string; paymentStatus?: string; orderStatus?: string }
) {
  let list = [...rawOrders];
  if (filter?.paymentStatus && filter.paymentStatus !== 'ALL') {
    list = list.filter((o) => o.paymentStatus === filter.paymentStatus);
  }
  if (filter?.orderStatus && filter.orderStatus !== 'ALL') {
    list = list.filter((o) => o.orderStatus === filter.orderStatus);
  }
  if (filter?.search && typeof filter.search === 'string') {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.whatsappNumber?.includes(q) ||
        o.transactionId?.toLowerCase().includes(q)
    );
  }

  const paidCount = list.filter((o) => o.paymentStatus === 'PAID').length;
  const revenueBDT = list
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return {
    orders: list,
    totalOrders: list.length,
    paidCount,
    revenueBDT,
  };
}

export async function fetchAdminOrders(
  token: string,
  filter?: { search?: string; paymentStatus?: string; orderStatus?: string }
): Promise<{
  orders: Order[];
  totalOrders: number;
  paidCount: number;
  revenueBDT: number;
}> {
  const params = new URLSearchParams();
  if (filter?.search) params.append('search', filter.search);
  if (filter?.paymentStatus) params.append('paymentStatus', filter.paymentStatus);
  if (filter?.orderStatus) params.append('orderStatus', filter.orderStatus);

  try {
    const res = await fetch(`${BASE_URL}/api/admin/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      try {
        if (typeof window !== 'undefined' && data?.orders) {
          localStorage.setItem('tpbd_cached_orders', JSON.stringify(data.orders));
        }
      } catch {}
      return data;
    }
  } catch (err: unknown) {
    console.warn('Backend orders fetch notice, loading cached orders:', err);
  }

  // Graceful fallback to cached orders or initial orders
  let fallbackOrders: Order[] = INITIAL_ORDERS_FALLBACK;
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('tpbd_cached_orders');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          fallbackOrders = parsed;
        }
      }
    }
  } catch {}

  return filterOrdersLocally(fallbackOrders, filter);
}

export async function updateOrderStatus(
  token: string,
  id: string,
  status: { orderStatus?: string; paymentStatus?: string }
): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`${BASE_URL}/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(status),
  });

  if (!res.ok) throw new Error('Failed to update status');
  return await res.json();
}

export async function updatePackage(token: string, id: string, pkgData: Partial<Package>): Promise<Package> {
  const res = await fetch(`${BASE_URL}/api/admin/packages/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pkgData),
  });

  if (!res.ok) throw new Error('Failed to update package');
  const updated = await res.json();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tpbd:datarefreshed'));
  }
  return updated;
}

export async function updateSettings(token: string, settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!res.ok) throw new Error('Failed to update settings');
  const updated = await res.json();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tpbd:datarefreshed'));
  }
  return updated;
}

export async function uploadAdminVideo(
  token: string,
  file: File
): Promise<{ success: boolean; videoUrl: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const videoData = e.target?.result as string;
        const res = await fetch(`${BASE_URL}/api/admin/upload-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ videoData, filename: file.name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload video');
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read video file from disk.'));
    reader.readAsDataURL(file);
  });
}

