import { AuthUser } from '../types';

export const USER_ORDERS_STORAGE_KEY = 'sn_user_orders_v2';
export const LEGACY_USER_ORDERS_STORAGE_KEY = 'sn_user_orders';

const GENERIC_CUSTOMER_NAMES = new Set([
  '',
  '-',
  'pelanggan',
  'pelanggan diaspora',
  'pelanggan nusantara',
  'nusantara customer',
  'customer'
]);

export function normalizePhoneDigits(phone?: string | null): string {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

export function phonesStrictlyMatch(phoneA?: string | null, phoneB?: string | null): boolean {
  const digitsA = normalizePhoneDigits(phoneA);
  const digitsB = normalizePhoneDigits(phoneB);
  if (digitsA.length < 8 || digitsB.length < 8) return false;
  if (digitsA === digitsB) return true;
  const tailA = digitsA.slice(-9);
  const tailB = digitsB.slice(-9);
  return tailA.length >= 8 && tailA === tailB;
}

export function extractOrderOwnerNotes(notes?: string | null): { userId?: string; accountName?: string } {
  if (!notes || typeof notes !== 'string') return {};
  const result: { userId?: string; accountName?: string } = {};
  const parts = notes.split('|');
  for (const part of parts) {
    if (part.startsWith('UID:')) {
      const uid = part.slice(4).trim();
      if (uid) result.userId = uid;
    } else if (part.startsWith('ACC:')) {
      const acc = part.slice(4).trim();
      if (acc) result.accountName = acc;
    }
  }
  return result;
}

export function formatOrderOwnerNotes(userId?: string | null, accountName?: string | null): string {
  const parts: string[] = [];
  if (userId && String(userId).trim()) parts.push(`UID:${String(userId).trim()}`);
  if (accountName && String(accountName).trim()) parts.push(`ACC:${String(accountName).trim()}`);
  return parts.length > 0 ? parts.join('|') : '-';
}

/**
 * Menentukan secara ketat apakah suatu pesanan (Order) merupakan milik akun `currentUser` yang sedang login.
 * Pesanan akun lain TIDAK AKAN PERNAH bocor atau tergabung ke akun yang sedang login.
 */
export function isOrderOwnedByUser(order: any, currentUser?: AuthUser | null): boolean {
  if (!order || !currentUser) return false;

  const currentId = String(currentUser.id || '').trim().toLowerCase();
  const currentName = String(currentUser.name || '').trim().toLowerCase();
  const currentPhone = String(currentUser.phone || '').trim();
  const currentEmail = String(currentUser.email || '').trim().toLowerCase();

  if (!currentId && !currentName) return false;

  const ordId = String(order.id || order.orderId || '').trim();
  const parsedNotes = extractOrderOwnerNotes(order.notes);
  const orderUserId = String(order.userId || parsedNotes.userId || '').trim().toLowerCase();
  const orderAccountName = String(order.accountName || parsedNotes.accountName || '').trim().toLowerCase();
  const orderCustomerName = String(order.customerName || '').trim().toLowerCase();
  const orderPhone = String(order.accountPhone || order.phone || order.customer_phone || '').trim();
  const orderEmail = String(order.userEmail || order.customer_email || order.email || '').trim().toLowerCase();

  // 1. Isolasi pesanan DUMMY test agar hanya muncul untuk akun dummy resmi
  if (ordId.toUpperCase().includes('DUMMY') || orderCustomerName.includes('akun dummy')) {
    return currentId === 'cust-dummy' || currentName.includes('akun dummy');
  }

  // 2. Jika pesanan memiliki userId eksplisit, wajib cocok 100% dengan ID akun yang login
  if (orderUserId) {
    return Boolean(currentId && orderUserId === currentId);
  }

  // 3. Jika pesanan memiliki nama akun pemesan eksplisit (accountName), wajib cocok 100%
  if (orderAccountName) {
    return Boolean(currentName && orderAccountName === currentName);
  }

  // 4. Untuk pesanan dari tabel cloud / lama yang belum menyimpan userId:
  // Jika customerName spesifik (bukan placeholder generik), wajib sama persis dengan nama akun yang login
  if (orderCustomerName && !GENERIC_CUSTOMER_NAMES.has(orderCustomerName)) {
    return Boolean(currentName && orderCustomerName === currentName);
  }

  // 5. Fallback terakhir jika nama bersifat generik: cocokkan nomor HP atau email secara ketat
  if (orderPhone && currentPhone && phonesStrictlyMatch(orderPhone, currentPhone)) {
    return true;
  }

  if (orderEmail && currentEmail && orderEmail === currentEmail) {
    return true;
  }

  return false;
}

export function filterOrdersForUser<T>(orders: T[], currentUser?: AuthUser | null): T[] {
  if (!currentUser || !Array.isArray(orders) || orders.length === 0) return [];
  return orders.filter((ord) => isOrderOwnedByUser(ord, currentUser));
}

