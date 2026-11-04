/**
 * WhatsApp Gateway Service for Sembako Nusantara Jepang
 * Integrates with AQSHAMART WA Gateway (KirimDigi session)
 * 
 * Default Configuration:
 * - Base URL: http://localhost:2026
 * - API Key: AQSHAMART2025
 * - Session ID: KirimDigi
 */

export interface WAGatewayConfig {
  baseUrl: string;
  apiKey: string;
  sessionId: string;
}

export const DEFAULT_WA_CONFIG: WAGatewayConfig = {
  baseUrl: 'https://nonleaking-cameron-eagerly.ngrok-free.dev',
  apiKey: 'AQSHAMART2025',
  sessionId: 'KirimDigi'
};

export const LOCAL_FALLBACK_URL = 'http://localhost:2026';

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
 * Core function to send WhatsApp message via live / local gateway
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
    to: cleanNumber,
    phone: cleanNumber,
    receiver: cleanNumber,
    message: messageText
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': config.apiKey,
    'session-id': primarySession,
    'ngrok-skip-browser-warning': 'true'
  };

  console.log(`[WA Gateway] Mengirim pesan ke ${cleanNumber} via ${config.baseUrl} (session: ${primarySession})`);

  // Helper untuk melakukan request HTTP
  const doFetch = async (targetUrl: string, sessionName: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout
    try {
      const res = await fetch(`${targetUrl}/api/send`, {
        method: 'POST',
        headers: {
          ...headers,
          'session-id': sessionName
        },
        body: JSON.stringify({ ...payload, sessionId: sessionName }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    // 1. Percobaan pertama: Target URL utama (Live ngrok / config.baseUrl)
    let res: Response | null = null;
    let usedUrl = config.baseUrl;
    try {
      res = await doFetch(usedUrl, primarySession);
    } catch (err) {
      // Jika config.baseUrl gagal (misal jika pakai localhost tapi offline, coba ngrok atau sebaliknya)
      const altUrl = usedUrl.includes('localhost')
        ? 'https://nonleaking-cameron-eagerly.ngrok-free.dev'
        : 'http://localhost:2026';
      try {
        console.log(`[WA Gateway] Mencoba fallback endpoint: ${altUrl}`);
        res = await doFetch(altUrl, primarySession);
        usedUrl = altUrl;
      } catch (altErr) {
        throw err;
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[WA Gateway] Server response error (${res.status}):`, errText);
      return { success: false, error: `Server error ${res.status}: ${errText}` };
    }

    const data = await res.json();
    console.log('[WA Gateway] Berhasil terkirim:', data);
    return { success: true, data };
  } catch (err: any) {
    console.warn('[WA Gateway] Gagal menghubungi gateway WhatsApp:', err?.message || err);
    return { success: false, error: err?.message || 'Gateway offline / network error' };
  }
}

/**
 * Send WhatsApp media / document (such as PDF receipt) via WA gateway
 * Supports multiple payload keys (file, document, media, filename, caption, mimetype)
 * and endpoint fallbacks (/api/send-file, /api/send-document, /api/send).
 */
export async function sendWhatsAppDocument(
  recipientPhone: string,
  fileBase64OrUrl: string,
  filename: string,
  caption: string = 'Nota struk kasir pdf',
  customSessionId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const config = getWAGatewayConfig();
  const cleanNumber = formatPhoneNumberForWA(recipientPhone);

  if (!cleanNumber || cleanNumber.length < 8) {
    console.warn('[WA Gateway] Nomor telepon penerima dokumen tidak valid:', recipientPhone);
    return { success: false, error: 'Nomor telepon tidak valid' };
  }

  const primarySession = customSessionId || config.sessionId || 'KirimDigi';

  // Format compact payload without any duplicated fields (only 1 file field to stay well under 100KB)
  const payload = {
    sessionId: primarySession,
    number: cleanNumber,
    message: caption || 'Nota struk kasir pdf',
    caption: caption || 'Nota struk kasir pdf',
    filename: filename,
    mimetype: 'application/pdf',
    file: fileBase64OrUrl
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': config.apiKey,
    'session-id': primarySession,
    'ngrok-skip-browser-warning': 'true'
  };

  console.log(`[WA Gateway] Mengirim file PDF "${filename}" ke ${cleanNumber} (Caption: "${caption}")`);

  const tryEndpoints = async (targetUrl: string, sessionName: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for document upload
    try {
      const res = await fetch(`${targetUrl}/api/send`, {
        method: 'POST',
        headers: {
          ...headers,
          'session-id': sessionName
        },
        body: JSON.stringify({ ...payload, sessionId: sessionName }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({ success: true }));
        return { ok: true, data };
      } else {
        const errText = await res.text();
        throw new Error(`Server status ${res.status}: ${errText}`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    let result: { ok: boolean; data: any };
    try {
      result = await tryEndpoints(config.baseUrl, primarySession);
    } catch (err: any) {
      // Fallback only if baseUrl was localhost
      if (config.baseUrl.includes('localhost')) {
        const altUrl = 'https://nonleaking-cameron-eagerly.ngrok-free.dev';
        console.log(`[WA Gateway] Mencoba fallback endpoint dokumen: ${altUrl}`);
        result = await tryEndpoints(altUrl, primarySession);
      } else {
        throw err;
      }
    }

    console.log('[WA Gateway] File dokumen PDF berhasil terkirim:', result.data);
    return { success: true, data: result.data };
  } catch (err: any) {
    console.warn('[WA Gateway] Gagal mengirim dokumen PDF ke WhatsApp:', err?.message || err);
    return { success: false, error: err?.message || 'Gateway dokumen offline' };
  }
}

export function formatPOSTransactionTextReceipt(tx: any, language: 'JP' | 'ID'): string {
  const isJp = language === 'JP';
  const currencySymbol = isJp ? '¥' : 'Rp ';
  const dateStr = tx.date ? new Date(tx.date).toLocaleString(isJp ? 'ja-JP' : 'id-ID') : new Date().toLocaleString();
  const receiptNo = tx.receiptNumber || tx.id || 'SN-POS';

  if (isJp) {
    let msg = `*【センバコ・ヌサンタラ日本 (東京本店) 領収証】*\n`;
    msg += `〒144-0051 東京都大田区西蒲田5丁目9-16\n`;
    msg += `TEL: 03-5678-9012\n`;
    msg += `登録番号: T1234567890123 (適格簡易請求書)\n`;
    msg += `--------------------------------\n`;
    msg += `伝票番号: #${receiptNo}\n`;
    msg += `日時: ${dateStr}\n`;
    msg += `レジ担当: ${tx.cashierName || '東京店舗レジ'}\n`;
    msg += `お客様名: ${tx.customerName || '店頭来店客'} 様\n`;
    msg += `--------------------------------\n`;
    if (Array.isArray(tx.items)) {
      tx.items.forEach((it: any) => {
        msg += `• *${it.productName || '商品'}*\n  ${it.quantity}点 x ¥${(it.price || 0).toLocaleString()} = ¥${(it.subtotal || 0).toLocaleString()}\n`;
      });
    }
    msg += `--------------------------------\n`;
    msg += `小計: ¥${(tx.subtotal || 0).toLocaleString()}\n`;
    if (tx.discountAmount > 0) msg += `割引: -¥${(tx.discountAmount || 0).toLocaleString()}\n`;
    msg += `*合計金額 (税込): ¥${(tx.totalAmount || 0).toLocaleString()}*\n`;
    msg += `お預かり: ¥${(tx.amountPaid || 0).toLocaleString()}\n`;
    msg += `お釣り: ¥${(tx.changeAmount || 0).toLocaleString()}\n`;
    msg += `決済方法: ${tx.paymentMethod || 'Cash'}\n`;
    msg += `--------------------------------\n`;
    msg += `毎度ご来店いただき誠にありがとうございます。`;
    return msg;
  }

  let msg = `*🧾 NOTA STRUK PEMBAYARAN KASIR*\n`;
  msg += `*SEMBAKO NUSANTARA JEPANG (TOKYO)*\n`;
  msg += `〒144-0051 Tokyo, Ota-ku, Nishikamata 5-9-16\n`;
  msg += `--------------------------------\n`;
  msg += `No. Nota: #${receiptNo}\n`;
  msg += `Waktu: ${dateStr}\n`;
  msg += `Kasir: ${tx.cashierName || 'Kasir Toko'}\n`;
  msg += `Pelanggan: ${tx.customerName || 'Pelanggan Toko'}\n`;
  msg += `--------------------------------\n`;
  if (Array.isArray(tx.items)) {
    tx.items.forEach((it: any) => {
      msg += `• *${it.productName || 'Produk'}*\n  ${it.quantity}x @ ${currencySymbol}${(it.price || 0).toLocaleString()} = ${currencySymbol}${(it.subtotal || 0).toLocaleString()}\n`;
    });
  }
  msg += `--------------------------------\n`;
  msg += `Subtotal: ${currencySymbol}${(tx.subtotal || 0).toLocaleString()}\n`;
  if (tx.discountAmount > 0) msg += `Diskon: -${currencySymbol}${(tx.discountAmount || 0).toLocaleString()}\n`;
  msg += `*TOTAL BAYAR: ${currencySymbol}${(tx.totalAmount || 0).toLocaleString()}*\n`;
  msg += `Bayar: ${currencySymbol}${(tx.amountPaid || 0).toLocaleString()}\n`;
  msg += `Kembalian: ${currencySymbol}${(tx.changeAmount || 0).toLocaleString()}\n`;
  msg += `Metode: ${tx.paymentMethod || 'Tunai'}\n`;
  msg += `--------------------------------\n`;
  msg += `Terima kasih banyak telah berbelanja di Sembako Nusantara! 🙏`;
  return msg;
}

/**
 * High-level helper: Automatically generates receipt PDF in matching language
 * (Japanese for Yen / JPY, Indonesian for Rupiah / IDR) and dispatches via WA Gateway.
 */
export async function sendPOSTransactionReceiptWhatsApp(
  tx: any,
  customerPhone: string
): Promise<{ success: boolean; filename?: string; error?: string; dataUrl?: string }> {
  try {
    const { generateReceiptPdf } = await import('../utils/receiptPdfGenerator');

    // Language adaptation rule: JPY -> Japanese, IDR -> Indonesian
    const language = tx.currency === 'JPY' ? 'JP' : 'ID';

    console.log(`[WA Gateway] Menyiapkan Struk PDF kasir (${language}) untuk transaksi #${tx.receiptNumber || tx.id}`);

    const { pdfBase64, filename, dataUrl } = await generateReceiptPdf(tx, language);

    // User requirement: "JADI CAPTIONYA TIDAK ADA HANYA Nota struk kasir pdf"
    const caption = 'Nota struk kasir pdf';

    const sendRes = await sendWhatsAppDocument(customerPhone, pdfBase64, filename, caption);

    if (sendRes.success) {
      return {
        success: true,
        filename,
        dataUrl
      };
    }

    // Fallback cerdas: Jika pengiriman dokumen PDF ditolak batas ukuran oleh gateway, kirimkan struk teks berformat lengkap
    console.warn('[WA Gateway] Dokumen PDF ditolak server, mengaktifkan pengiriman struk teks rapi:', sendRes.error);
    const textReceipt = formatPOSTransactionTextReceipt(tx, language);
    const textRes = await sendWhatsAppMessage(customerPhone, textReceipt);

    if (textRes.success) {
      return {
        success: true,
        filename,
        dataUrl
      };
    }

    return {
      success: false,
      filename,
      dataUrl,
      error: sendRes.error || textRes.error
    };
  } catch (err: any) {
    console.error('[WA Gateway] Error generate & send POS receipt PDF:', err);
    return {
      success: false,
      error: err?.message || 'Gagal memproses struk PDF'
    };
  }
}


/**
 * Official Admin WhatsApp recipient for incoming orders, registrations, and completed orders
 */
export const ADMIN_WA_PHONE = '0895329332135';

/**
 * Get configured Admin WhatsApp phone (supports localStorage override)
 */
export function getAdminWAPhone(): string {
  try {
    const saved = localStorage.getItem('sn_wa_admin_phone');
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {}
  return ADMIN_WA_PHONE;
}

/**
 * Save custom Admin WhatsApp phone
 */
export function setAdminWAPhone(phone: string): void {
  try {
    if (phone && phone.trim()) {
      localStorage.setItem('sn_wa_admin_phone', phone.trim());
    } else {
      localStorage.removeItem('sn_wa_admin_phone');
    }
  } catch (e) {}
}

/**
 * Trigger 1: Send WhatsApp notification when customer checkouts
 * Sends confirmation to CUSTOMER and order alert to ADMIN (0895329332135)
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
  [key: string]: any;
}): Promise<boolean> {
  const phone = order.phone;

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

  // Deteksi bahasa pengguna (dari order.language atau localStorage 'sn_lang')
  const currentLang = (order.language || (typeof window !== 'undefined' ? localStorage.getItem('sn_lang') : null) || 'ID').toUpperCase();
  const isJp = currentLang === 'JP';

  // 1. Pesan Konfirmasi untuk Customer (Bilingual: Jepang atau Indonesia)
  let customerSuccess = false;
  if (phone) {
    const customerMessage = isJp
      ? `🛍️ *ご注文確認 - センバコ・ヌサンタラ日本* 🇯🇵🇮🇩
--------------------------------------------------
*${order.customerName}* 様、この度は「センバコ・ヌサンタラ」をご利用いただき誠にありがとうございます！
ご注文を正常に受け付けました。東京配送センターにて直ちに梱包・発送準備に入ります。

📋 *ご注文内容:*
• 注文番号: *#${order.id}*
• お問い合わせ送り状番号: *${order.trackingNumber}*
• 配送業者: *${order.courier}*
• お支払い方法: *${order.paymentMethod ? order.paymentMethod.toUpperCase() : '銀行振込 / QRIS'}*
• 配送ステータス: *📦 東京倉庫にて梱包中・発送準備中*

🛒 *ご注文商品一覧:*
${itemsList}

💰 *お支払い合計金額:*
*${totalYen}*${totalRupiah}

📍 *お届け先住所:*
${order.shippingAddress}

🚚 *リアルタイム配送追跡:*
https://kirimdigi.github.io/Sembako-Nusantara/#/tracking?q=${order.trackingNumber}

安心・安全なハラール食品と本場インドネシアの食材・調味料を丁寧に梱包してお届けいたします。商品の到着をどうぞ楽しみにお待ちください！🙏✨
_センバコ・ヌサンタラ日本 - 日本全国へお届けする故郷の味_`
      : `🛍️ *KONFIRMASI PESANAN - SEMBAKO NUSANTARA JEPANG* 🇯🇵🇮🇩
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

    const res = await sendWhatsAppMessage(phone, customerMessage);
    customerSuccess = res.success;
  } else {
    console.warn('[WA Gateway] Checkout: nomor telepon customer kosong');
  }

  // 2. Pesan Notifikasi Pesanan Masuk untuk ADMIN (0895329332135)
  const adminPhone = getAdminWAPhone();
  if (adminPhone) {
    const adminMessage =
`🚨 *PESANAN BARU MASUK (NOTIFIKASI ADMIN)* 🛍️📦
--------------------------------------------------
Halo Admin Sembako Nusantara, ada pesanan online baru yang baru saja di-checkout dan perlu diproses!

📋 *Detail Pesanan:*
• No. Pesanan: *#${order.id}*
• No. Resi: *${order.trackingNumber}*
• Nama Customer: *${order.customerName}*
• No. HP / WhatsApp: *${order.phone || '-'}*
• Kurir Pilihan: *${order.courier}*
• Metode Pembayaran: *${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'TRANSFER / QRIS'}*
• Total Tagihan: *${totalYen}*${totalRupiah}

🛒 *Rincian Barang yang Dipesan:*
${itemsList}

📍 *Alamat Pengiriman di Jepang:*
${order.shippingAddress}

Silakan segera periksa dan siapkan packing di Gudang Tokyo via Dashboard Admin:
https://kirimdigi.github.io/Sembako-Nusantara/#/admin/orders
_Sistem Otomatis Sembako Nusantara Jepang_`;

    sendWhatsAppMessage(adminPhone, adminMessage).catch((e) => {
      console.warn('[WA Gateway] Gagal kirim notifikasi pesanan masuk ke admin:', e);
    });
  }

  return customerSuccess;
}

/**
 * Trigger 2: Send WhatsApp notification when order is delivered / finished (Sampai di Lokasi / Selesai)
 * Sends notification to CUSTOMER and confirmation to ADMIN (0895329332135)
 */
export async function sendOrderDeliveredWhatsApp(order: {
  id: string;
  trackingNumber?: string;
  customerName?: string;
  phone?: string;
  shippingAddress?: string;
  address?: string;
  courier?: string;
  status?: string;
  items?: Array<{ name?: string; productName?: string; quantity?: number; qty?: number }>;
  [key: string]: any;
}): Promise<boolean> {
  const phone = order.phone;

  const itemsList = order.items && order.items.length > 0
    ? order.items
        .map((it, idx) => {
          const name = it.name || it.productName || 'Produk';
          const qty = it.quantity || it.qty || 1;
          return `${idx + 1}. *${name}* x${qty}`;
        })
        .join('\n')
    : '-';

  // Deteksi bahasa pengguna (dari order.language atau localStorage 'sn_lang')
  const currentLang = (order.language || (typeof window !== 'undefined' ? localStorage.getItem('sn_lang') : null) || 'ID').toUpperCase();
  const isJp = currentLang === 'JP';

  // 1. Pesan untuk Customer (Bilingual: Jepang / Indonesia)
  let customerSuccess = false;
  if (phone) {
    const customerMessage = isJp
      ? `✅ *配達完了のお知らせ - センバコ・ヌサンタラ日本* 📦🎉
--------------------------------------------------
*${order.customerName || 'お客様'}* 様

いつも「センバコ・ヌサンタラ」をご利用いただきありがとうございます！
ご注文のお荷物が無事に *お届け先住所に到着（配達完了）* いたしました。

📋 *配送情報:*
• 注文番号: *#${order.id}*
• お問い合わせ送り状番号: *${order.trackingNumber || '-'}*
• 配送業者: *${order.courier || 'ヤマト運輸（クロネコヤマト）'}*
• お受取人様: *${order.customerName || 'お客様'}*
• お届け先: *${order.shippingAddress || order.address || '-'}*

📦 *お届けした商品一覧:*
${itemsList}

本場インドネシアの食材・ハラール調味料・スパイスをご堪能ください。故郷の豊かな味わいがお手元に届き、素敵な食卓となりますように！🇮🇩🇯🇵

何かご不明な点や再注文のご希望がございましたら、いつでも公式LINE/WhatsAppよりお気軽にお問い合わせください。
_センバコ・ヌサンタラ日本をご利用いただき心より感謝申し上げます。_ 🙏❤️`
      : `✅ *PESANAN SELESAI / TELAH SAMPAI DI LOKASI* 📦🎉
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

    const res = await sendWhatsAppMessage(phone, customerMessage);
    customerSuccess = res.success;
  } else {
    console.warn('[WA Gateway] Order Delivered: nomor telepon customer kosong');
  }

  // 2. Pesan Konfirmasi Pesanan Selesai untuk ADMIN (0895329332135)
  const adminPhone = getAdminWAPhone();
  if (adminPhone) {
    const adminMessage =
`✅ *PESANAN SELESAI / SAMPAI (NOTIFIKASI ADMIN)* 📦🎉
--------------------------------------------------
Halo Admin Sembako Nusantara, pesanan berikut telah berhasil diantar & berstatus *SELESAI (DELIVERED)*:

📋 *Detail Pesanan:*
• No. Pesanan: *#${order.id}*
• No. Resi: *${order.trackingNumber || '-'}*
• Kurir: *${order.courier || 'Yamato Transport'}*
• Customer: *${order.customerName || 'Pelanggan'}*
• No. HP / WA: *${order.phone || '-'}*
• Alamat Tujuan: *${order.shippingAddress || order.address || '-'}*

📦 *Barang yang Telah Diterima:*
${itemsList}

Status pesanan saat ini: *SELESAI (DELIVERED)* ✅
_Sistem Otomatis Sembako Nusantara Jepang_`;

    sendWhatsAppMessage(adminPhone, adminMessage).catch((e) => {
      console.warn('[WA Gateway] Gagal kirim notifikasi pesanan selesai ke admin:', e);
    });
  }

  return customerSuccess;
}

/**
 * Trigger 3: Send WhatsApp welcome & verification notification on account registration
 * Sends welcome to MEMBER and new registration alert to ADMIN (0895329332135)
 */
export async function sendRegistrationWhatsApp(customer: {
  name: string;
  phone: string;
  address: string;
  custId: string;
  loyaltyPoints?: number;
  language?: string;
  [key: string]: any;
}): Promise<boolean> {
  const currentLang = (customer.language || (typeof window !== 'undefined' ? localStorage.getItem('sn_lang') : null) || 'ID').toUpperCase();
  const isJp = currentLang === 'JP';

  // 1. Pesan Selamat Datang untuk Member Baru (Bilingual: Jepang / Indonesia)
  let memberSuccess = false;
  if (customer.phone) {
    const memberMessage = isJp
      ? `🎉 *会員登録完了 - センバコ・ヌサンタラ日本へようこそ* 🇯🇵🇮🇩
--------------------------------------------------
*${customer.name}* 様

「センバコ・ヌサンタラ日本」の会員登録が無事に *完了いたしました*。ご登録誠にありがとうございます！

👤 *会員情報:*
• 会員ID: *${customer.custId}*
• お名前: *${customer.name}*
• ご登録電話番号: *${customer.phone}*
• ご登録住所: *${customer.address}*

✨ *会員様限定特典:*
1. 日本全国の皆様へ本場インドネシアの食材・ハラルフードをお届け
2. ヤマト運輸＆佐川急便による日本全国47都道府県への迅速・安全配送
3. 一定金額以上のお買い上げで送料無料特典
4. 日本在住者・インドネシアコミュニティ向け毎週の限定セール・特売情報

🌐 *オンラインショップはこちら:*
https://kirimdigi.github.io/Sembako-Nusantara/

今後のお問い合わせやお買い物のサポートのため、本アカウントのご登録をお願い申し上げます。どうぞお買い物をお楽しみください！🙏🛒`
      : `🎉 *SELAMAT DATANG DI SEMBAKO NUSANTARA JEPANG* 🇯🇵🇮🇩
--------------------------------------------------
Halo *${customer.name}*,

Selamat! Akun keanggotaan Anda di *Sembako Nusantara Jepang* telah *BERHASIL DIBUAT*.

👤 *Data Akun Anda:*
• ID Member: *${customer.custId}*
• Nama: *${customer.name}*
• No. WhatsApp: *${customer.phone}*
• Alamat Terdaftar: *${customer.address}*

✨ *Keuntungan Member Sembako Nusantara:*
1. Belanja kebutuhan sembako & halal food Indonesia terlengkap di Jepang
2. Pengiriman kilat Yamato & Sagawa ke seluruh 47 prefektur Jepang
3. Bebas Ongkir dengan pembelian tertentu
4. Update promo mingguan & diskon khusus diaspora Indonesia

🌐 *Mulai Belanja Sekarang:*
https://kirimdigi.github.io/Sembako-Nusantara/

Simpan nomor ini sebagai kontak resmi Sembako Nusantara Jepang untuk kemudahan komunikasi dan pemesanan. Selamat berbelanja! 🙏🛒`;

    const res = await sendWhatsAppMessage(customer.phone, memberMessage);
    memberSuccess = res.success;
  } else {
    console.warn('[WA Gateway] Registration: nomor telepon member kosong');
  }

  // 2. Pesan Notifikasi Pendaftaran Akun untuk ADMIN (0895329332135)
  const adminPhone = getAdminWAPhone();
  if (adminPhone) {
    const adminMessage =
`🔔 *MEMBER BARU TERDAFTAR (NOTIFIKASI ADMIN)* 👤🎉
--------------------------------------------------
Halo Admin Sembako Nusantara, ada pelanggan baru saja mendaftar akun keanggotaan:

📋 *Data Member Baru:*
• ID Member: *${customer.custId}*
• Nama Lengkap: *${customer.name}*
• No. WhatsApp: *${customer.phone}*
• Alamat di Jepang: *${customer.address}*
• Waktu Pendaftaran: *${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Tokyo' })} JST*

Data telah otomatis tersimpan di CRM Pelanggan Admin.
_Sistem Otomatis Sembako Nusantara Jepang_`;

    sendWhatsAppMessage(adminPhone, adminMessage).catch((e) => {
      console.warn('[WA Gateway] Gagal kirim notifikasi registrasi ke admin:', e);
    });
  }

  return memberSuccess;
}
