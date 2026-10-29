/**
 * WhatsApp Gateway Service for Sembako Nusantara Jepang
 * Integrates with AQSHAMART WA Gateway (KirimDigi session)
 * 
 * Default Configuration:
 * - Base URL: http://localhost:2026
 * - API Key: AQSHAMART2025
 * - Session ID: KirimDigi (fallback f1)
 */

export interface WAGatewayConfig {
  baseUrl: string;
  apiKey: string;
  sessionId: string;
}

export const DEFAULT_WA_CONFIG: WAGatewayConfig = {
  baseUrl: 'http://localhost:2026',
  apiKey: 'AQSHAMART2025',
  sessionId: 'KirimDigi'
};

/**
 * Get current WA gateway configuration with localStorage override capability
 */
export function getWAGatewayConfig(): WAGatewayConfig {
  try {
    const saved = localStorage.getItem('sn_wa_gateway_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        baseUrl: parsed.baseUrl || DEFAULT_WA_CONFIG.baseUrl,
        apiKey: parsed.apiKey || DEFAULT_WA_CONFIG.apiKey,
        sessionId: parsed.sessionId || DEFAULT_WA_CONFIG.sessionId
      };
    }
  } catch (e) {}
  return DEFAULT_WA_CONFIG;
}

/**
 * Normalize and clean phone numbers into international digits format
 * E.g.:
 *  +62 813-8098-9932 -> 6281380989932
 *  081234567890      -> 6281234567890
 *  +81 80-1122-3344  -> 818011223344
 *  08011223344       -> 818011223344
 */
export function formatPhoneNumberForWA(phone: string): string {
  if (!phone) return '';
  // Strip all non-digit characters
  let clean = phone.replace(/\D/g, '');

  // Indonesian local format: 08xx -> 628xx
  if (clean.startsWith('08')) {
    clean = '628' + clean.slice(2);
  }
  // Japanese local mobile formats: 080xx, 090xx, 070xx -> 8180xx, 8190xx, 8170xx
  else if (clean.startsWith('080') || clean.startsWith('090') || clean.startsWith('070')) {
    clean = '81' + clean.slice(1);
  }
  // Other local numbers starting with 0
  else if (clean.startsWith('0') && clean.length >= 10) {
    clean = '62' + clean.slice(1);
  }

  return clean;
}

/**
 * Core function to send WhatsApp message via local gateway
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageText: string,
  customSessionId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const config = getWAGatewayConfig();
  const cleanNumber = formatPhoneNumberForWA(recipientPhone);

  if (!cleanNumber || cleanNumber.length < 8) {
    console.warn('[WA Gateway] Nomor telepon tidak valid:', recipientPhone);
    return { success: false, error: 'Nomor telepon tidak valid' };
  }

  const primarySession = customSessionId || config.sessionId || 'KirimDigi';

  const payload = {
    sessionId: primarySession,
    number: cleanNumber,
    message: messageText
  };

  console.log(`[WA Gateway] Mengirim pesan ke ${cleanNumber} menggunakan session: ${primarySession}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(`${config.baseUrl}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // If primary session failed, attempt fallback session if KirimDigi / f1
      if (primarySession === 'KirimDigi') {
        try {
          const fallbackRes = await fetch(`${config.baseUrl}/api/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': config.apiKey
            },
            body: JSON.stringify({ ...payload, sessionId: 'f1' })
          });
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            console.log('[WA Gateway] Berhasil terkirim via fallback session f1:', fallbackData);
            return { success: true, data: fallbackData };
          }
        } catch (fbErr) {}
      }

      const errText = await res.text();
      console.warn(`[WA Gateway] Server response error (${res.status}):`, errText);
      return { success: false, error: `Server error ${res.status}: ${errText}` };
    }

    const data = await res.json();
    console.log('[WA Gateway] Berhasil terkirim:', data);
    return { success: true, data };
  } catch (err: any) {
    console.warn('[WA Gateway] Gagal menghubungi gateway lokal (mungkin offline):', err?.message || err);
    return { success: false, error: err?.message || 'Gateway offline / network error' };
  }
}

/**
 * Trigger 1: Send WhatsApp notification when customer checkouts
 */
export async function sendCheckoutWhatsApp(order: {
  id: string;
  trackingNumber: string;
  customerName: string;
  phone?: string;
  shippingAddress: string;
  courier: string;
  paymentMethod: string;
  currency?: string;
  total: number;
  totalAmountIDR?: number;
  items: Array<{ name?: string; productName?: string; quantity?: number; qty?: number; price?: number }>;
}): Promise<boolean> {
  const phone = order.phone;
  if (!phone) {
    console.warn('[WA Gateway] Checkout: nomor telepon customer kosong');
    return false;
  }

  const itemsList = order.items && order.items.length > 0
    ? order.items
        .map((it, idx) => {
          const name = it.name || it.productName || 'Produk';
          const qty = it.quantity || it.qty || 1;
          const price = it.price ? `(¥${it.price.toLocaleString()})` : '';
          return `${idx + 1}. *${name}* x${qty} ${price}`;
        })
        .join('\n')
    : '-';

  const totalYen = `¥${(order.total || 0).toLocaleString()}`;
  const totalRupiah = order.totalAmountIDR ? ` / Rp ${(order.totalAmountIDR).toLocaleString()}` : '';

  const message = 
`🛍️ *KONFIRMASI PESANAN - SEMBAKO NUSANTARA JEPANG* 🇯🇵🇮🇩
--------------------------------------------------
Halo *${order.customerName}*, terima kasih telah berbelanja di Sembako Nusantara! Pesanan Anda telah kami terima dan segera diproses.

📋 *Detail Pesanan:*
• No. Pesanan: *#${order.id}*
• No. Resi: *${order.trackingNumber}*
• Kurir Pengiriman: *${order.courier}*
• Metode Bayar: *${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'TRANSFER / QRIS'}*
• Status: *📦 Sedang Dikemas di Gudang Tokyo*

🛒 *Daftar Produk yang Dipesan:*
${itemsList}

💰 *Total Pembayaran:*
*${totalYen}*${totalRupiah}

📍 *Alamat Pengiriman:*
${order.shippingAddress}

🚚 *Lacak Perjalanan Pesanan Anda:*
https://kirimdigi.github.io/Sembako-Nusantara/#/tracking?q=${order.trackingNumber}

Terima kasih atas kepercayaan Anda. Kami pastikan produk halal dan bumbu nusantara dikemas dengan aman dan higienis! 🙏✨
_Sembako Nusantara Jepang - Cita Rasa Kampung Halaman di Negeri Sakura_`;

  const res = await sendWhatsAppMessage(phone, message);
  return res.success;
}

/**
 * Trigger 2: Send WhatsApp notification when order is delivered / finished (Sampai di Lokasi / Selesai)
 */
export async function sendOrderDeliveredWhatsApp(order: {
  id: string;
  trackingNumber?: string;
  customerName?: string;
  phone?: string;
  shippingAddress?: string;
  address?: string;
  courier?: string;
  items?: Array<{ name?: string; productName?: string; quantity?: number; qty?: number }>;
}): Promise<boolean> {
  const phone = order.phone;
  if (!phone) {
    console.warn('[WA Gateway] Order Delivered: nomor telepon customer kosong');
    return false;
  }

  const itemsList = order.items && order.items.length > 0
    ? order.items
        .map((it, idx) => {
          const name = it.name || it.productName || 'Produk';
          const qty = it.quantity || it.qty || 1;
          return `${idx + 1}. *${name}* x${qty}`;
        })
        .join('\n')
    : '-';

  const message =
`✅ *PESANAN SELESAI / TELAH SAMPAI DI LOKASI* 📦🎉
--------------------------------------------------
Halo *${order.customerName || 'Pelanggan Setia'}*,

Kabar gembira! Paket pesanan Anda di *Sembako Nusantara Jepang* telah *SAMPAI DI ALAMAT TUJUAN* dan status pesanan telah *SELESAI*.

📋 *Detail Pengiriman:*
• No. Pesanan: *#${order.id}*
• No. Resi: *${order.trackingNumber || '-'}*
• Kurir: *${order.courier || 'Yamato Transport'}*
• Penerima: *${order.customerName || 'Pelanggan'}*
• Alamat: *${order.shippingAddress || order.address || '-'}*

📦 *Barang yang Diterima:*
${itemsList}

Semoga paket sembako, bumbu asli nusantara, dan makanan halal Anda tiba dalam kondisi sempurna dan memuaskan. Selamat menikmati cita rasa nusantara di Jepang! 🇮🇩🇯🇵

Jika Anda membutuhkan bantuan atau ingin memesan kembali, silakan hubungi kami via WhatsApp ini.
_Terima kasih telah berbelanja di Sembako Nusantara Jepang!_ 🙏❤️`;

  const res = await sendWhatsAppMessage(phone, message);
  return res.success;
}

/**
 * Trigger 3: Send WhatsApp welcome & verification notification on account registration
 */
export async function sendRegistrationWhatsApp(customer: {
  name: string;
  phone: string;
  address: string;
  custId: string;
  loyaltyPoints?: number;
}): Promise<boolean> {
  if (!customer.phone) {
    console.warn('[WA Gateway] Registration: nomor telepon kosong');
    return false;
  }

  const message =
`🎉 *SELAMAT DATANG DI SEMBAKO NUSANTARA JEPANG* 🇯🇵🇮🇩
--------------------------------------------------
Halo *${customer.name}*,

Selamat! Akun keanggotaan Anda di *Sembako Nusantara Jepang* telah *BERHASIL DIBUAT*.

👤 *Data Akun Anda:*
• ID Member: *${customer.custId}*
• Nama: *${customer.name}*
• No. WhatsApp: *${customer.phone}*
• Alamat Terdaftar: *${customer.address}*
• Bonus Poin Selamat Datang: *🎁 ${customer.loyaltyPoints || 100} Poin Belanja*

✨ *Keuntungan Member Sembako Nusantara:*
1. Dapatkan Cashback Poin Reward di setiap transaksi
2. Pengiriman kilat Yamato & Sagawa ke seluruh 47 prefektur Jepang
3. Bebas Ongkir dengan pembelian tertentu
4. Update promo mingguan & diskon khusus diaspora Indonesia

🌐 *Mulai Belanja Sekarang:*
https://kirimdigi.github.io/Sembako-Nusantara/

Simpan nomor ini sebagai kontak resmi Sembako Nusantara Jepang untuk kemudahan komunikasi dan pemesanan. Selamat berbelanja! 🙏🛒`;

  const res = await sendWhatsAppMessage(customer.phone, message);
  return res.success;
}
