import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product, POSCartItem, POSTransaction, ThermalPrinterSettings } from '../../types';
import { CurrencyType, getActiveExchangeRate, convertJpyToIdr, formatIdr, formatJpy } from '../../utils/currency';
import { DEFAULT_PRINTER_SETTINGS, getCleanPrinterSettings } from './SettingsPage';
import { POSDisplayPayload } from './POSCustomerDisplayPage';
import { resolveProductImage, getPlaceholderImage } from '../../components/common/ProductImage';

export const POSKasirPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'history' || searchParams.get('tab') === 'sales' ? 'history' : 'pos';

  const { products, addPOSTransaction, posTransactions, customers, addCustomer } = useAdmin();
  const { language } = useLanguage();

  // POS Multi-Register State (Maksimal 3 Mesin Kasir Aktif)
  const [registers, setRegisters] = useState<Array<{
    id: number;
    name: string;
    cart: POSCartItem[];
    selectedCustomer: string;
    txNotes: string;
    payCurrency: CurrencyType;
    searchQuery: string;
  }>>([
    {
      id: 1,
      name: 'Mesin Kasir 1',
      cart: [],
      selectedCustomer: '',
      txNotes: '',
      payCurrency: 'JPY',
      searchQuery: ''
    }
  ]);
  const [activeRegisterId, setActiveRegisterId] = useState<number>(1);
  const activeRegister = registers.find((r) => r.id === activeRegisterId) || registers[0];

  const cart = activeRegister.cart;
  const selectedCustomer = activeRegister.selectedCustomer;
  const txNotes = activeRegister.txNotes;
  const payCurrency = activeRegister.payCurrency;
  const searchQuery = activeRegister.searchQuery;

  const setCart = (action: React.SetStateAction<POSCartItem[]>) => {
    setRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id === activeRegisterId) {
          const nextCart = typeof action === 'function' ? action(reg.cart) : action;
          return { ...reg, cart: nextCart };
        }
        return reg;
      })
    );
  };

  const setSelectedCustomer = (action: React.SetStateAction<string>) => {
    setRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id === activeRegisterId) {
          const nextVal = typeof action === 'function' ? action(reg.selectedCustomer) : action;
          return { ...reg, selectedCustomer: nextVal };
        }
        return reg;
      })
    );
  };

  const setTxNotes = (action: React.SetStateAction<string>) => {
    setRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id === activeRegisterId) {
          const nextVal = typeof action === 'function' ? action(reg.txNotes) : action;
          return { ...reg, txNotes: nextVal };
        }
        return reg;
      })
    );
  };

  const setPayCurrency = (curr: CurrencyType) => {
    setRegisters((prev) =>
      prev.map((reg) => (reg.id === activeRegisterId ? { ...reg, payCurrency: curr } : reg))
    );
  };

  const setSearchQuery = (action: React.SetStateAction<string>) => {
    setRegisters((prev) =>
      prev.map((reg) => {
        if (reg.id === activeRegisterId) {
          const nextVal = typeof action === 'function' ? action(reg.searchQuery) : action;
          return { ...reg, searchQuery: nextVal };
        }
        return reg;
      })
    );
  };

  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const exchangeRate = getActiveExchangeRate();

  const handleAddRegister = () => {
    if (registers.length >= 3) {
      alert(
        language === 'JP'
          ? '同時に開くことができるレジ端末は最大3台までです。'
          : language === 'EN'
          ? 'Maximum 3 active POS register terminals allowed.'
          : 'Maksimal 3 Mesin Kasir aktif yang dapat dibuka bersamaan.'
      );
      return;
    }
    const existingIds = registers.map((r) => r.id);
    const nextId = [1, 2, 3].find((id) => !existingIds.includes(id)) || registers.length + 1;
    const newRegister = {
      id: nextId,
      name:
        language === 'JP'
          ? `レジ端末 ${nextId}`
          : language === 'EN'
          ? `Register ${nextId}`
          : `Mesin Kasir ${nextId}`,
      cart: [],
      selectedCustomer: '',
      txNotes: '',
      payCurrency: 'JPY' as CurrencyType,
      searchQuery: ''
    };
    setRegisters((prev) => [...prev, newRegister].sort((a, b) => a.id - b.id));
    setActiveRegisterId(nextId);
  };

  const handleCloseRegister = (regId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (registers.length <= 1) return;
    const regToClose = registers.find((r) => r.id === regId);
    if (regToClose && regToClose.cart.length > 0) {
      const confirmClose = window.confirm(
        language === 'JP'
          ? `${regToClose.name} にはまだ ${regToClose.cart.length} 件の商品が入っています。このレジを閉じますか？`
          : language === 'EN'
          ? `${regToClose.name} has ${regToClose.cart.length} items in cart. Close this register?`
          : `${regToClose.name} masih memiliki ${regToClose.cart.length} item di keranjang. Yakin ingin menutup mesin kasir ini?`
      );
      if (!confirmClose) return;
    }
    const remaining = registers.filter((r) => r.id !== regId);
    setRegisters(remaining);
    if (activeRegisterId === regId) {
      setActiveRegisterId(remaining[0].id);
    }
  };

  // Quick Add Customer Modal State (from POS)
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustCity, setNewCustCity] = useState<string>('Tokyo (Ota-ku / Nishikamata)');

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<POSTransaction['paymentMethod']>('Cash');
  const [cashGiven, setCashGiven] = useState<number>(0);

  // Completed / Inspected Receipt Modal State
  const [completedTx, setCompletedTx] = useState<POSTransaction | null>(null);

  // Thermal Printer Settings State (Sinkron otomatis dengan menu Pengaturan)
  const [printerSettings, setPrinterSettings] = useState<ThermalPrinterSettings>(() => {
    return getCleanPrinterSettings(localStorage.getItem('sn_pos_printer_settings'));
  });

  // Sinkronkan ulang pengaturan printer setiap kali modal struk dibuka
  useEffect(() => {
    if (completedTx) {
      setPrinterSettings(getCleanPrinterSettings(localStorage.getItem('sn_pos_printer_settings')));
    }
  }, [completedTx]);

  // Fungsi Cetak Nota Thermal POS (menggunakan CSS @page dengan lebar kertas dinamis)
  const handlePrintReceipt = () => {
    const currentSettings = getCleanPrinterSettings(localStorage.getItem('sn_pos_printer_settings'));
    setPrinterSettings(currentSettings);

    const printWidth = currentSettings.paperWidth || 57;
    const existingStyle = document.getElementById('pos-thermal-print-override');
    if (existingStyle) existingStyle.remove();

    const fontSizePx =
      currentSettings.fontSize === 'small' ? '10px' : currentSettings.fontSize === 'large' ? '13px' : '11px';

    const styleEl = document.createElement('style');
    styleEl.id = 'pos-thermal-print-override';
    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${printWidth}mm auto;
          margin: 0mm;
        }
        body * {
          visibility: hidden !important;
        }
        #pos-thermal-receipt-print-area, #pos-thermal-receipt-print-area * {
          visibility: visible !important;
        }
        #pos-thermal-receipt-print-area {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: ${printWidth}mm !important;
          max-width: ${printWidth}mm !important;
          margin: 0 !important;
          padding: 2mm 3mm !important;
          background: white !important;
          color: black !important;
          font-family: 'Courier New', Courier, monospace !important;
          font-size: ${fontSizePx} !important;
          box-shadow: none !important;
          border: none !important;
        }
        #pos-thermal-receipt-print-area .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    window.print();
  };

  // History Filter State
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyMethodFilter, setHistoryMethodFilter] = useState<string>('all');
  const [historyDateFilter, setHistoryDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);

  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: 'POSレジシステム (実店舗)',
        subtitle: '東京実店舗・関西ハブの店頭販売に最適化された高速タッチPOSレジ会計。',
        tabLive: 'POSレジ端末 (Live)',
        tabHistory: 'レジ売上履歴・一覧',
        historyTitle: '実店舗レジ売上履歴・伝票一覧',
        historySubtitle: '東京店舗および関西拠点の店頭POSレジ決済取引の全履歴とレシート管理。',
        statTotalTx: '総取引件数',
        statTotalRevenue: 'POS総売上高',
        statAvgAOV: '客単価 (AOV)',
        statTotalItems: '販売総商品点数',
        searchPlaceholder: 'バーコード、商品名、ブランドを検索 (例: Indomie, Bango, Bakso)...',
        searchHistoryPlaceholder: '伝票番号、顧客名、レジ担当、商品名、メモを検索...',
        filterAllMethods: 'すべての決済手段',
        filterAllDates: '全期間',
        filterToday: '本日',
        filter7Days: '過去7日間',
        filterThisMonth: '今月',
        exportCSV: '売上CSV出力',
        colReceiptNo: '伝票番号',
        colDateTime: '取引日時',
        colCashier: '担当レジ',
        colCustomer: 'お客様名',
        colItems: '購入商品 & 数量',
        colPayment: '決済手段',
        colSubtotal: '小計',
        colDiscount: '値引き',
        colTax: '消費税 (8%)',
        colTotal: '合計 (税込)',
        colStatus: 'ステータス',
        colAction: '操作',
        btnViewReceipt: 'レシート確認',
        btnPrint: '印刷',
        statusPaid: '決済完了 (済)',
        emptyHistoryTitle: 'レジ売上履歴がありません',
        emptyHistoryDesc: '取引履歴はまだありません。POSレジ画面から初回のお会計を実施してください。',
        btnOpenPOS: 'POSレジを開く',
        cartTitle: 'レジカート',
        clearCart: 'カートをクリア',
        memberLabel: '顧客・会員名選択 (CRM):',
        memberPlaceholder: '顧客名を入力、または候補から選択...',
        memberWalkIn: '来店顧客 (非会員)',
        memberPoints: 'ポイント',
        btnQuickAddMember: '新規会員登録',
        notesLabel: '取引メモ・特記事項',
        notesPlaceholder: '例: 配達指定、領収証宛名、お預かり品、その他連絡事項...',
        clearNotes: 'クリア',
        cartEmpty: 'カートは空です。左側の商品をクリックして追加してください。',
        subtotal: '商品小計:',
        discount: 'レジ割引:',
        discountCut: (d: number) => `割引額 (${d}%):`,
        tax8: '消費税 (8% 軽減税率 飲食料品):',
        totalPay: 'お支払い合計:',
        btnPay: (amt: number) => `お会計 (¥${amt.toLocaleString()})`,
        stockLabel: '在庫:',
        frozenBadge: '❄️ 冷凍',
        // Payment Modal
        payModalTitle: 'お会計・決済処理',
        payTotalLabel: 'ご請求金額 (税込)',
        payMethodLabel: 'お支払い方法選択:',
        payCash: '💵 現金決済',
        payJpqr: '📱 JPQR / JAPAN QRIS',
        payPay: '🔴 PayPay QR',
        payCard: '💳 クレジットカード',
        payIc: '🚃 交通系ICカード',
        jpqrTitle: 'JPQR / JAPAN QRIS 専用端末',
        jpqrGuideTitle: 'QRコードをお客様へご案内:',
        jpqrGuideDesc: 'インドネシアQRIS (BCA, Mandiri, BRI等) & 日本国内JPQR / 各種QR決済に対応。',
        payPayGuide: '店舗PayPayバーコードをスキャン',
        cashGivenLabel: 'お預かり金額 (¥):',
        cashExact: 'ちょうど',
        changeLabel: 'お釣り:',
        changeShort: 'お預かり金額が不足しています！',
        btnCompletePay: '決済を確定してレシート発行',
        alertOutOfStock: (name: string) => `「${name}」は在庫切れです！`,
        alertExceedStock: (stk: number) => `在庫数 (${stk}) を超えています`,
        alertCashNotEnough: 'お預かり金額が請求額に満たないため会計できません。',
        // Receipt Modal
        receiptHeaderStore: 'SEMBAKO NUSANTARA TOKYO',
        receiptStoreDesc: '在日インドネシア食材・ハラール専門店',
        receiptStoreAddr: '〒144-0051 東京都大田区西蒲田5丁目9-16 • TEL: 03-5678-9012',
        receiptNo: '伝票番号',
        receiptDate: '取引日時',
        receiptCashier: '担当レジ',
        receiptCustomer: 'お客様名',
        receiptNotes: '特記事項・メモ',
        receiptSubtotal: '小計',
        receiptDiscount: '値引き',
        receiptTax: '消費税等 (8%)',
        receiptTotal: '合計 (税込)',
        receiptPaid: 'お預かり',
        receiptChange: 'お釣り',
        receiptThanks: '毎度ご来店ありがとうございます！ 🙏',
        itemCountLabel: '品目数 (商品の種類)',
        totalUnitsLabel: '合計点数 (総数量)',
        itemSuffix: '品目',
        unitsSuffix: '点 (pcs)',
        btnPrintReceipt: 'レシート印刷',
        btnNewTx: '新規取引',
        // Quick Add Modal
        quickAddTitle: 'POS店頭 会員クイック登録',
        custNameLabel: '顧客氏名 (必須):',
        custPhoneLabel: '電話番号 / WhatsApp:',
        custCityLabel: '地域・都道府県:',
        btnCancel: 'キャンセル',
        btnSaveCustomer: '登録して適用',
        categories: [
          { id: 'all', label: 'すべての商品' },
          { id: 'Mie Instan', label: '🍜 インスタント麺' },
          { id: 'Bumbu & Saus', label: '🌶️ 調味料・サンバル' },
          { id: 'Frozen Food', label: '🥩 冷凍ハラール食材' },
          { id: 'Minuman', label: '🧃 ドリンク・コーヒー' },
          { id: 'Snack & Kerupuk', label: '🍘 スナック・えびせん' },
          { id: 'Beras & Pokok', label: '🌾 お米・主食類' }
        ]
      };
    } else if (language === 'EN') {
      return {
        title: 'Point of Sale (POS) Cashier',
        subtitle: 'Fast touch POS cashier interface for walk-in transactions at Tokyo / Kansai Store Hub.',
        tabLive: 'POS Live Terminal',
        tabHistory: 'Cashier Sales Records',
        historyTitle: 'Cashier Sales History & Receipt Records',
        historySubtitle: 'Comprehensive archive of physical store walk-in transactions, receipts, and cashier audits.',
        statTotalTx: 'Total Transactions',
        statTotalRevenue: 'Total POS Revenue',
        statAvgAOV: 'Average Order Value (AOV)',
        statTotalItems: 'Total Sold Items',
        searchPlaceholder: 'Search barcode, product name, or brand (e.g. Indomie, Bango, Bakso)...',
        searchHistoryPlaceholder: 'Search Receipt #, Customer, Cashier, Item, or Notes...',
        filterAllMethods: 'All Payment Methods',
        filterAllDates: 'All Time',
        filterToday: 'Today',
        filter7Days: 'Last 7 Days',
        filterThisMonth: 'This Month',
        exportCSV: 'Export Sales CSV',
        colReceiptNo: 'Receipt #',
        colDateTime: 'Date & Time',
        colCashier: 'Cashier',
        colCustomer: 'Customer',
        colItems: 'Items & Qty',
        colPayment: 'Payment Method',
        colSubtotal: 'Subtotal',
        colDiscount: 'Discount',
        colTax: 'Tax (8%)',
        colTotal: 'Total (¥)',
        colStatus: 'Status',
        colAction: 'Actions',
        btnViewReceipt: 'View Receipt',
        btnPrint: 'Print',
        statusPaid: 'Paid (Completed)',
        emptyHistoryTitle: 'No Cashier Sales Recorded Yet',
        emptyHistoryDesc: 'No POS transactions found. Start your first transaction on the live POS terminal.',
        btnOpenPOS: 'Open POS Terminal',
        cartTitle: 'Cashier Cart',
        clearCart: 'Clear Cart',
        memberLabel: 'Customer / Member (CRM):',
        memberPlaceholder: 'Type customer name or select from list...',
        memberWalkIn: 'Walk-in Customer (Non-Member)',
        memberPoints: 'Points',
        btnQuickAddMember: 'New Member',
        notesLabel: 'Transaction Notes / Remarks',
        notesPlaceholder: 'e.g. Neighbor pickup, WhatsApp order, Packaging notes, etc...',
        clearNotes: 'Clear',
        cartEmpty: 'Cart is empty. Click products on the left to add items.',
        subtotal: 'Item Subtotal:',
        discount: 'Cashier Discount:',
        discountCut: (d: number) => `Discount (${d}%):`,
        tax8: 'Consumption Tax (8% Food JCT):',
        totalPay: 'Grand Total:',
        btnPay: (amt: number) => `Pay Transaction (¥${amt.toLocaleString()})`,
        stockLabel: 'Stock:',
        frozenBadge: '❄️ Frozen',
        // Payment Modal
        payModalTitle: 'Cashier Payment Processing',
        payTotalLabel: 'Total Due Amount',
        payMethodLabel: 'Select Payment Method:',
        payCash: '💵 Cash',
        payJpqr: '📱 JPQR / JAPAN QRIS',
        payPay: '🔴 PayPay QR',
        payCard: '💳 Credit Card',
        payIc: '🚃 IC Card',
        jpqrTitle: 'JPQR / JAPAN QRIS Terminal',
        jpqrGuideTitle: 'Prompt Customer Scan:',
        jpqrGuideDesc: 'Supports Indonesian Bank QRIS (BCA, Mandiri, BRI, etc.) & Japanese JPQR Wallets.',
        payPayGuide: 'Scan Cashier PayPay Barcode',
        cashGivenLabel: 'Cash Received (¥):',
        cashExact: 'Exact',
        changeLabel: 'Change:',
        changeShort: 'Insufficient Cash Tendered!',
        btnCompletePay: 'Complete & Print Receipt',
        alertOutOfStock: (name: string) => `Product "${name}" is out of stock!`,
        alertExceedStock: (stk: number) => `Quantity exceeds available stock (${stk})`,
        alertCashNotEnough: 'Cash given is less than the total purchase amount!',
        // Receipt Modal
        receiptHeaderStore: 'SEMBAKO NUSANTARA TOKYO',
        receiptStoreDesc: 'Indonesian Halal Specialty Store Japan',
        receiptStoreAddr: '〒144-0051 Tokyo, Ota-ku, Nishikamata 5-9-16 • Tel: 03-5678-9012',
        receiptNo: 'Receipt No.',
        receiptDate: 'Date',
        receiptCashier: 'Cashier',
        receiptCustomer: 'Customer',
        receiptNotes: 'Notes / Remarks',
        receiptSubtotal: 'Subtotal',
        receiptDiscount: 'Discount',
        receiptTax: 'Consumption Tax (8%)',
        receiptTotal: 'TOTAL (Tax Included)',
        receiptPaid: 'Paid',
        receiptChange: 'Change',
        receiptThanks: 'Thank you for shopping with us! 🙏',
        itemCountLabel: 'Item Count (Distinct)',
        totalUnitsLabel: 'Total Quantity (Units)',
        itemSuffix: 'Items',
        unitsSuffix: 'pcs',
        btnPrintReceipt: 'Print Receipt',
        btnNewTx: 'New Transaction',
        // Quick Add Modal
        quickAddTitle: 'Quick Register POS Customer',
        custNameLabel: 'Customer Name (Required):',
        custPhoneLabel: 'Phone / WhatsApp:',
        custCityLabel: 'City / Prefecture:',
        btnCancel: 'Cancel',
        btnSaveCustomer: 'Save & Select',
        categories: [
          { id: 'all', label: 'All Products' },
          { id: 'Mie Instan', label: '🍜 Instant Noodles' },
          { id: 'Bumbu & Saus', label: '🌶️ Seasonings & Sauces' },
          { id: 'Frozen Food', label: '🥩 Halal Frozen Food' },
          { id: 'Minuman', label: '🧃 Beverages' },
          { id: 'Snack & Kerupuk', label: '🍘 Snacks & Crackers' },
          { id: 'Beras & Pokok', label: '🌾 Rice & Staples' }
        ]
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'Point of Sale (POS) Kasir Toko',
        subtitle: 'Antarmuka kasir cepat untuk melayani transaksi langsung di toko fisik Tokyo / Kansai Hub.',
        tabLive: 'Mesin Kasir (POS Live)',
        tabHistory: 'Daftar Penjualan Kasir',
        historyTitle: 'Daftar & Riwayat Penjualan Kasir Toko',
        historySubtitle: 'Semua rekaman transaksi kasir langsung (POS) fisik di Tokyo Hub & Kansai Hub.',
        statTotalTx: 'Total Transaksi Kasir',
        statTotalRevenue: 'Total Omzet POS',
        statAvgAOV: 'Rata-rata Transaksi (AOV)',
        statTotalItems: 'Total Item Terjual',
        searchPlaceholder: 'Cari barcode, nama produk, atau brand (misal: Indomie, Bango, Bakso)...',
        searchHistoryPlaceholder: 'Cari No. Struk, Pelanggan, Kasir, Item, atau Catatan...',
        filterAllMethods: 'Semua Metode Bayar',
        filterAllDates: 'Semua Waktu',
        filterToday: 'Hari Ini',
        filter7Days: '7 Hari Terakhir',
        filterThisMonth: 'Bulan Ini',
        exportCSV: 'Export CSV Penjualan',
        colReceiptNo: 'No. Struk',
        colDateTime: 'Tanggal & Waktu',
        colCashier: 'Kasir',
        colCustomer: 'Pelanggan',
        colItems: 'Item & Qty',
        colPayment: 'Metode Bayar',
        colSubtotal: 'Subtotal',
        colDiscount: 'Diskon',
        colTax: 'Pajak (8%)',
        colTotal: 'Total (¥)',
        colStatus: 'Status',
        colAction: 'Aksi',
        btnViewReceipt: 'Lihat Struk',
        btnPrint: 'Cetak',
        statusPaid: 'Lunas (Sukses)',
        emptyHistoryTitle: 'Belum Ada Riwayat Penjualan Kasir',
        emptyHistoryDesc: 'Semua data kasir masih kosong / fresh 0. Lakukan penjualan pertama Anda di mesin kasir.',
        btnOpenPOS: 'Buka Mesin Kasir',
        cartTitle: 'Keranjang Kasir',
        clearCart: 'Kosongkan',
        memberLabel: 'Nama Pelanggan / Member (CRM):',
        memberPlaceholder: 'Ketik nama pelanggan atau pilih dari daftar...',
        memberWalkIn: 'Walk-in Customer (Non-Member)',
        memberPoints: 'Poin',
        btnQuickAddMember: 'Member Baru',
        notesLabel: 'Catatan / Keterangan Transaksi',
        notesPlaceholder: 'Contoh: Titip tetangga, Pesanan WA diambil di toko, Kembalian via PayPay, dll...',
        clearNotes: 'Hapus Catatan',
        cartEmpty: 'Keranjang masih kosong. Klik produk di sebelah kiri.',
        subtotal: 'Subtotal Item:',
        discount: 'Diskon Kasir:',
        discountCut: (d: number) => `Potongan Diskon (${d}%):`,
        tax8: 'Pajak Konsumsi (8% Makanan / Sembako):',
        totalPay: 'Total Pembayaran:',
        btnPay: (amt: number) => `Bayar Transaksi (¥${amt.toLocaleString()})`,
        stockLabel: 'Stok:',
        frozenBadge: '❄️ Frozen',
        // Payment Modal
        payModalTitle: 'Proses Pembayaran Kasir',
        payTotalLabel: 'Total Tagihan',
        payMethodLabel: 'Metode Pembayaran Kasir:',
        payCash: '💵 Tunai',
        payJpqr: '📱 JPQR / JAPAN QRIS',
        payPay: '🔴 PayPay QR',
        payCard: '💳 Kartu Kredit',
        payIc: '🚃 IC Card',
        jpqrTitle: 'JPQR / JAPAN QRIS Terminal',
        jpqrGuideTitle: 'Arahkan Scan Pelanggan:',
        jpqrGuideDesc: 'Mendukung QRIS Bank Indonesia (BCA, Mandiri, BRI, dll) & E-Wallet JPQR Jepang.',
        payPayGuide: 'Scan Kode Barcode PayPay Kasir',
        cashGivenLabel: 'Uang Tunai Diterima (¥):',
        cashExact: 'Uang Pas',
        changeLabel: 'Kembalian:',
        changeShort: 'Uang Kurang!',
        btnCompletePay: 'Selesaikan & Cetak Struk',
        alertOutOfStock: (name: string) => `Stok produk "${name}" habis!`,
        alertExceedStock: (stk: number) => `Jumlah melebihi stok yang tersedia (${stk})`,
        alertCashNotEnough: 'Jumlah uang tunai yang dimasukkan kurang dari total belanja!',
        // Receipt Modal
        receiptHeaderStore: 'SEMBAKO NUSANTARA JEPANG',
        receiptStoreDesc: 'Toko Produk Halal Indonesia di Jepang',
        receiptStoreAddr: '〒144-0051 東京都大田区西蒲田5丁目9-16 (Tokyo, Ota-ku, Nishikamata 5-9-16) • Tel: 03-5678-9012',
        receiptNo: 'No. Struk',
        receiptDate: 'Tanggal',
        receiptCashier: 'Kasir',
        receiptCustomer: 'Pelanggan',
        receiptNotes: 'Catatan / Keterangan',
        receiptSubtotal: 'Subtotal',
        receiptDiscount: 'Diskon',
        receiptTax: 'Pajak Konsumsi (8%)',
        receiptTotal: 'TOTAL (Termasuk Pajak)',
        receiptPaid: 'Bayar',
        receiptChange: 'Kembalian',
        receiptThanks: 'Terima kasih atas kunjungan Anda! 🙏',
        itemCountLabel: 'Jumlah Item (Item Berbeda)',
        totalUnitsLabel: 'Total Kuantitas Fisik',
        itemSuffix: 'Item',
        unitsSuffix: 'pcs',
        btnPrintReceipt: 'Cetak Nota',
        btnNewTx: 'Transaksi Baru',
        // Quick Add Modal
        quickAddTitle: 'Tambah Pelanggan Baru (Kasir)',
        custNameLabel: 'Nama Lengkap Pelanggan (Wajib):',
        custPhoneLabel: 'Nomor HP / WhatsApp:',
        custCityLabel: 'Wilayah / Kota:',
        btnCancel: 'Batal',
        btnSaveCustomer: 'Simpan & Pilih',
        categories: [
          { id: 'all', label: 'Semua Produk' },
          { id: 'Mie Instan', label: '🍜 Mie Instan' },
          { id: 'Bumbu & Saus', label: '🌶️ Bumbu & Saus' },
          { id: 'Frozen Food', label: '🥩 Makanan Beku Halal' },
          { id: 'Minuman', label: '🧃 Minuman & Kopi' },
          { id: 'Snack & Kerupuk', label: '🍘 Camilan & Kerupuk' },
          { id: 'Beras & Pokok', label: '🌾 Beras & Pokok' }
        ]
      };
    }
  }, [language]);

  // Find customer object if matches registered customer
  const selectedCustomerObj = useMemo(() => {
    if (!selectedCustomer) return null;
    return customers.find(
      (c) => c.name.toLowerCase().trim() === selectedCustomer.toLowerCase().trim()
    );
  }, [customers, selectedCustomer]);

  // Filter products for POS Grid - Default KOSONG kecuali ada pencarian/scan barang
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return []; // Sesuai permintaan: Default KOSONG tanpa katalog
    return products.filter((p) => {
      const pSku = ((p as any).sku || '').toLowerCase();
      const pBarcode = ((p as any).barcode || '').toLowerCase();
      return (
        p.id.toLowerCase() === q ||
        pSku.includes(q) ||
        pBarcode.includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.nameJp && p.nameJp.toLowerCase().includes(q)) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery]);

  // Dual-Tone Audio Feedback: Success Beep (1400Hz) & Double Error Buzzer (300Hz-220Hz)
  const playBarcodeBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  const playErrorBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Tone 1: Low frequency buzz (300Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(300, ctx.currentTime);
      gain1.gain.setValueAtTime(0.16, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.11);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.11);

      // Tone 2: Immediate follow-up drop buzz (220Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(220, ctx.currentTime + 0.13);
      gain2.gain.setValueAtTime(0.16, ctx.currentTime + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.26);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.13);
      osc2.stop(ctx.currentTime + 0.26);
    } catch (e) {}
  };

  // Cart operations (mendukung penambahan kuantitas banyak sekaligus, misal: 10*barcode)
  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    if (product.stock <= 0) {
      playErrorBeep();
      alert(txt.alertOutOfStock(product.name));
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const curQty = existing ? existing.quantity : 0;
      if (curQty + quantityToAdd > product.stock) {
        playErrorBeep();
        alert(txt.alertExceedStock(product.stock));
        return prev;
      }
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prev, { product, quantity: quantityToAdd }];
    });
  };

  // Update kuantitas langsung secara manual (bisa ketik angka langsung di keranjang kasir)
  const updateExactQuantity = (productId: string, exactQty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const targetProd = products.find((p) => p.id === productId);
          if (targetProd && exactQty > targetProd.stock) {
            playErrorBeep();
            alert(txt.alertExceedStock(targetProd.stock));
            return item;
          }
          return { ...item, quantity: Math.max(1, exactQty) };
        }
        return item;
      })
    );
  };

  // Barcode Scanner & Sound Feedback
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [scanFeedbackMsg, setScanFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Helper to reliably place cursor in the barcode scan box
  const focusBarcodeInput = () => {
    if (activeTab === 'pos' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
      // Ensure cursor is placed at the end of text
      const len = barcodeInputRef.current.value.length;
      try {
        barcodeInputRef.current.setSelectionRange(len, len);
      } catch (e) {}
    }
  };

  // Auto-focus barcode search bar whenever entering POS, switching register, or closing modals
  useEffect(() => {
    if (activeTab === 'pos') {
      // 1. Immediate microtask / animation frame
      requestAnimationFrame(() => focusBarcodeInput());

      // 2. Staggered timers to guarantee focus after DOM layout and route transitions
      const t1 = setTimeout(focusBarcodeInput, 30);
      const t2 = setTimeout(focusBarcodeInput, 100);
      const t3 = setTimeout(focusBarcodeInput, 250);
      const t4 = setTimeout(focusBarcodeInput, 500);
      const t5 = setTimeout(focusBarcodeInput, 900);

      // 3. Re-focus when window / tab regains focus
      const handleWindowFocus = () => focusBarcodeInput();
      window.addEventListener('focus', handleWindowFocus);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        window.removeEventListener('focus', handleWindowFocus);
      };
    }
  }, [activeTab, activeRegisterId, isPaymentOpen, isQuickAddCustomerOpen, completedTx]);

  // Global keydown listener for POS:
  // If the cashier scans with a barcode scanner gun anywhere on the POS page without having clicked the input,
  // automatically redirect focus to barcode input so the scan is captured 100% reliably!
  useEffect(() => {
    if (activeTab !== 'pos') return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if any modal is open
      if (isPaymentOpen || isQuickAddCustomerOpen || completedTx) return;

      // Ignore modifier combinations (Ctrl+C, Ctrl+V, Alt+Tab, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      // Ignore navigation / special function keys
      if (e.key === 'Tab' || e.key === 'Escape' || e.key.startsWith('F')) return;

      const activeTag = document.activeElement?.tagName?.toLowerCase();
      // If already focused in another input or textarea, don't steal focus
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // Automatically focus barcode scan box so the scanned data enters directly
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab, isPaymentOpen, isQuickAddCustomerOpen, completedTx]);

  const handleBarcodeScanOrSubmit = (inputCode: string) => {
    const rawInput = inputCode.trim();
    if (!rawInput) return;

    // 0. Dukungan Multi-Scan Cepat Kasir (Contoh: "10*8991234", "5*indomie", "24xSKU123")
    let multiplier = 1;
    let cleanCode = rawInput;
    const multiMatch = rawInput.match(/^(\d+)\s*[*xX]\s*(.+)$/);
    if (multiMatch) {
      const parsedQty = parseInt(multiMatch[1], 10);
      if (parsedQty > 0 && parsedQty <= 999) {
        multiplier = parsedQty;
        cleanCode = multiMatch[2].trim();
      }
    }

    // 1. Look for exact match by barcode, SKU, id, or name
    let matchedProduct = products.find((p) => {
      const pSku = ((p as any).sku || '').toLowerCase();
      const pBarcode = ((p as any).barcode || '').toLowerCase();
      const target = cleanCode.toLowerCase();
      return (
        p.id.toLowerCase() === target ||
        pSku === target ||
        pBarcode === target ||
        p.name.toLowerCase() === target
      );
    });

    // 2. Fallback to partial match in products
    if (!matchedProduct) {
      const matches = products.filter((p) => {
        const pSku = ((p as any).sku || '').toLowerCase();
        const target = cleanCode.toLowerCase();
        return (
          p.name.toLowerCase().includes(target) ||
          pSku.includes(target) ||
          p.brand.toLowerCase().includes(target)
        );
      });
      if (matches.length > 0) {
        matchedProduct = matches[0];
      }
    }

    if (matchedProduct) {
      if (matchedProduct.stock <= 0) {
        playErrorBeep();
        setScanFeedbackMsg({
          text: `Stok produk "${matchedProduct.name}" habis! (0 Pcs)`,
          isError: true
        });
        setTimeout(() => setScanFeedbackMsg(null), 3000);
        return;
      }

      const existingInCart = cart.find((i) => i.product.id === matchedProduct.id);
      const curQty = existingInCart ? existingInCart.quantity : 0;
      if (curQty + multiplier > matchedProduct.stock) {
        playErrorBeep();
        setScanFeedbackMsg({
          text: `Kuantitas (${curQty + multiplier}) melebihi sisa stok (${matchedProduct.stock} Pcs)!`,
          isError: true
        });
        setTimeout(() => setScanFeedbackMsg(null), 3000);
        return;
      }

      addToCart(matchedProduct, multiplier);
      playBarcodeBeep();
      setScanFeedbackMsg({
        text: `✔ [${multiplier > 1 ? `${multiplier}x ` : ''}${matchedProduct.name}] Berhasil discan & otomatis masuk keranjang kasir!`,
        isError: false
      });
      setSearchQuery('');
      barcodeInputRef.current?.focus();
      setTimeout(() => {
        setScanFeedbackMsg(null);
        barcodeInputRef.current?.focus();
      }, 1500);
    } else {
      playErrorBeep();
      setScanFeedbackMsg({
        text: `Barcode / Kode "${cleanCode}" tidak ditemukan di database produk.`,
        isError: true
      });
      setTimeout(() => setScanFeedbackMsg(null), 2500);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const targetProd = products.find((p) => p.id === productId);
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (targetProd && newQty > targetProd.stock) {
              playErrorBeep();
              alert(txt.alertExceedStock(targetProd.stock));
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setSelectedCustomer('');
    setTxNotes('');
  };

  // Quick Add Customer Handler (Directly from POS)
  const handleQuickAddCustomer = () => {
    if (!newCustName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }
    const created = addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '-',
      email: '-',
      city: newCustCity.trim() || 'Tokyo (Ota-ku / Nishikamata)',
      tier: 'Bronze',
      loyaltyPoints: 0,
      preferredLanguage: 'ID',
      totalOrders: 0,
      totalSpent: 0
    });
    setSelectedCustomer(created.name);
    setIsQuickAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  // Calculations for POS Live
  const totalItemCount = cart.length; // Jumlah Jenis Item Berbeda (misal scan 3 item berbeda -> Jumlah Item = 3)
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0); // Total Kuantitas / Pcs Fisik
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const subtotalIDR = convertJpyToIdr(subtotal, exchangeRate);
  const discountAmount = 0; // Diskon kasir dinonaktifkan/dihapus sesuai instruksi
  const taxableAmount = subtotal;
  const taxAmount = Math.round(taxableAmount * 0.08); // 8% food consumption tax (軽減税率 8%)
  const taxAmountIDR = convertJpyToIdr(taxAmount, exchangeRate);
  const totalAmount = taxableAmount + taxAmount;
  const totalAmountIDR = subtotalIDR + taxAmountIDR;

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashGiven(payCurrency === 'IDR' ? totalAmountIDR : totalAmount); // Default exact cash in chosen currency
    setIsPaymentOpen(true);
  };

  const handleProcessPayment = () => {
    const activeTotalDue = payCurrency === 'IDR' ? totalAmountIDR : totalAmount;
    if (paymentMethod === 'Cash' && cashGiven < activeTotalDue) {
      playErrorBeep();
      alert(txt.alertCashNotEnough);
      return;
    }

    const change = paymentMethod === 'Cash' ? cashGiven - activeTotalDue : 0;

    const txPayload = {
      cashierName:
        language === 'JP'
          ? '東京店舗レジ (Cashier 01)'
          : language === 'EN'
          ? 'Tokyo Cashier (POS 01)'
          : 'Kasir Budi (Tokyo Store)',
      items: cart.map((c) => ({
        productId: c.product.id,
        productName:
          language === 'JP'
            ? c.product.nameJp || c.product.name
            : language === 'EN'
            ? c.product.nameEn || c.product.name
            : c.product.name,
        price: c.product.price,
        quantity: c.quantity,
        subtotal: c.product.price * c.quantity
      })),
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      amountPaid: paymentMethod === 'Cash' ? cashGiven : activeTotalDue,
      changeAmount: change,
      currency: payCurrency,
      exchangeRate,
      amountPaidOriginal: paymentMethod === 'Cash' ? cashGiven : activeTotalDue,
      changeAmountOriginal: change,
      customerName:
        selectedCustomer.trim() ||
        (language === 'JP'
          ? '店頭来店客 (非会員)'
          : language === 'EN'
          ? 'Walk-in Customer'
          : 'Pelanggan Toko (Walk-in)'),
      notes: txNotes.trim() || undefined
    };

    const savedTx = addPOSTransaction(txPayload);
    setIsPaymentOpen(false);
    setCart([]);
    setDiscountPercent(0);
    setTxNotes('');
    setCompletedTx(savedTx);
  };

  // Broadcast POS Live State ke Customer Display (Layar Pelanggan / Dual Monitor)
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sn_pos_display_channel');
    } catch (e) {}

    const payload: POSDisplayPayload = {
      storeName: 'Sembako Nusantara Tokyo (東京店)',
      registerName: activeRegister.name,
      cart: cart.map((c) => ({
        id: c.product.id,
        name:
          language === 'JP'
            ? c.product.nameJp || c.product.name
            : language === 'EN'
            ? c.product.nameEn || c.product.name
            : c.product.name,
        nameJp: c.product.nameJp,
        nameEn: c.product.nameEn,
        price: c.product.price,
        quantity: c.quantity,
        image: c.product.image,
        category: c.product.category,
        isFrozen: c.product.isFrozen,
        subtotal: c.product.price * c.quantity
      })),
      totalItemCount,
      totalQuantity,
      subtotal,
      taxAmount,
      totalAmount,
      payCurrency,
      exchangeRate,
      subtotalIDR,
      taxAmountIDR,
      totalAmountIDR,
      customerName: selectedCustomer,
      isPaymentOpen,
      paymentMethod,
      cashGiven,
      changeAmount:
        paymentMethod === 'Cash' &&
        cashGiven >= (payCurrency === 'IDR' ? totalAmountIDR : totalAmount)
          ? cashGiven - (payCurrency === 'IDR' ? totalAmountIDR : totalAmount)
          : 0,
      completedTx: completedTx
        ? {
            receiptNumber: completedTx.receiptNumber,
            date: completedTx.date,
            totalAmount: completedTx.totalAmount,
            amountPaid: completedTx.amountPaid,
            changeAmount: completedTx.changeAmount,
            paymentMethod: completedTx.paymentMethod,
            currency: completedTx.currency,
            customerName: completedTx.customerName
          }
        : null,
      lastScannedItemId: cart.length > 0 ? cart[cart.length - 1].product.id : undefined,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('sn_pos_display_state', JSON.stringify(payload));
      if (channel) {
        channel.postMessage({ type: 'POS_STATE_UPDATE', payload });
      }
    } catch (e) {}

    const handleDisplayPing = (e: MessageEvent) => {
      if (e.data && e.data.type === 'REQUEST_POS_STATE') {
        try {
          channel?.postMessage({ type: 'POS_STATE_UPDATE', payload });
        } catch (err) {}
      }
    };

    if (channel) {
      channel.onmessage = handleDisplayPing;
    }

    return () => {
      if (channel) channel.close();
    };
  }, [
    cart,
    selectedCustomer,
    payCurrency,
    exchangeRate,
    subtotal,
    taxAmount,
    totalAmount,
    subtotalIDR,
    taxAmountIDR,
    totalAmountIDR,
    totalItemCount,
    totalQuantity,
    isPaymentOpen,
    paymentMethod,
    cashGiven,
    completedTx,
    activeRegister.name,
    language
  ]);

  // History Statistics & Calculations
  const historyStats = useMemo(() => {
    const totalTx = posTransactions.length;
    const totalRevenue = posTransactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
    const avgAOV = totalTx > 0 ? totalRevenue / totalTx : 0;
    const totalItems = posTransactions.reduce(
      (sum, tx) => sum + tx.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
    return {
      totalTx,
      totalRevenue,
      avgAOV,
      totalItems
    };
  }, [posTransactions]);

  // Filtered History Transactions
  const filteredHistory = useMemo(() => {
    const now = new Date();
    return posTransactions.filter((tx) => {
      // Search filter
      const q = historySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        tx.receiptNumber.toLowerCase().includes(q) ||
        (tx.customerName && tx.customerName.toLowerCase().includes(q)) ||
        (tx.cashierName && tx.cashierName.toLowerCase().includes(q)) ||
        (tx.notes && tx.notes.toLowerCase().includes(q)) ||
        tx.items.some((i) => i.productName.toLowerCase().includes(q));

      // Method filter
      const matchMethod = historyMethodFilter === 'all' || tx.paymentMethod === historyMethodFilter;

      // Date filter
      let matchDate = true;
      if (historyDateFilter !== 'all') {
        const txDate = new Date(tx.date);
        if (historyDateFilter === 'today') {
          matchDate = txDate.toDateString() === now.toDateString();
        } else if (historyDateFilter === '7days') {
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
          matchDate = diffDays <= 7;
        } else if (historyDateFilter === 'month') {
          matchDate =
            txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        }
      }

      return matchSearch && matchMethod && matchDate;
    });
  }, [posTransactions, historySearch, historyMethodFilter, historyDateFilter]);

  // Export CSV Function
  const exportPOSTransactionsToCSV = () => {
    if (posTransactions.length === 0) {
      alert('Tidak ada data transaksi POS untuk diexport.');
      return;
    }

    const headers = [
      'No. Struk',
      'Tanggal & Waktu',
      'Kasir',
      'Pelanggan',
      'Catatan / Keterangan',
      'Metode Bayar',
      'Total Item',
      'Daftar Item',
      'Subtotal (JPY)',
      'Diskon (JPY)',
      'Pajak 8% JCT (JPY)',
      'Total Akhir (JPY)',
      'Nominal Bayar (JPY)',
      'Kembalian (JPY)'
    ];

    const rows = filteredHistory.map((tx) => {
      const itemsDetail = tx.items.map((i) => `${i.productName} (${i.quantity}x)`).join('; ');
      const totalItemCount = tx.items.reduce((s, i) => s + i.quantity, 0);
      return [
        `"${tx.receiptNumber}"`,
        `"${new Date(tx.date).toLocaleString('id-ID')}"`,
        `"${tx.cashierName}"`,
        `"${tx.customerName || 'Walk-in'}"`,
        `"${tx.notes ? tx.notes.replace(/"/g, '""') : '-'}"`,
        `"${tx.paymentMethod}"`,
        totalItemCount,
        `"${itemsDetail}"`,
        tx.subtotal,
        tx.discountAmount,
        tx.taxAmount,
        tx.totalAmount,
        tx.amountPaid,
        tx.changeAmount
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Laporan_Penjualan_Kasir_POS_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyReceipt = (receiptNo: string) => {
    navigator.clipboard.writeText(receiptNo);
    setCopiedReceiptId(receiptNo);
    setTimeout(() => setCopiedReceiptId(null), 2000);
  };

  const getPaymentBadge = (method: POSTransaction['paymentMethod']) => {
    switch (method) {
      case 'Cash':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'JPQR / QRIS':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PayPay':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Credit Card':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IC Card':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <AdminLayout
      title={activeTab === 'history' ? txt.historyTitle : txt.title}
      subtitle={activeTab === 'history' ? txt.historySubtitle : txt.subtitle}
    >
      {/* Top Tab Switcher: Multi-Mesin Kasir (Max 3) & History */}
      <div className="max-w-7xl mx-auto mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dynamic Active Register Tabs (1, 2, 3) */}
            {registers.map((reg) => {
              const isActive = activeTab === 'pos' && activeRegisterId === reg.id;
              const regItemCount = reg.cart.length;
              return (
                <div key={reg.id} className="relative inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRegisterId(reg.id);
                      if (activeTab !== 'pos') setSearchParams({ tab: 'pos' });
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#c41230] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">point_of_sale</span>
                    <span>{reg.name}</span>
                    {regItemCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive ? 'bg-white text-[#c41230]' : 'bg-[#c41230] text-white'
                        }`}
                      >
                        {regItemCount}
                      </span>
                    )}
                  </button>
                  {registers.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleCloseRegister(reg.id, e)}
                      title="Tutup Mesin Kasir"
                      className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-red-800 text-white hover:bg-black'
                          : 'bg-stone-200 text-stone-600 hover:bg-rose-600 hover:text-white'
                      }`}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            {/* Button + Buka Mesin Kasir (Max 3) */}
            {registers.length < 3 ? (
              <button
                type="button"
                onClick={handleAddRegister}
                className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Buka Mesin Kasir Baru (Maksimal 3)"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span>
                <span>+ Buka Mesin Kasir ({registers.length}/3)</span>
              </button>
            ) : (
              <span
                className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2.5 py-2 rounded-xl border border-stone-200"
                title="Batas maksimal 3 mesin kasir aktif telah tercapai"
              >
                ✓ Maks. 3 Kasir
              </span>
            )}

            {/* History Tab */}
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'history' })}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#c41230] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              <span>{txt.tabHistory}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'history'
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200 text-stone-700'
                }`}
              >
                {posTransactions.length}
              </span>
            </button>
          </div>

          {activeTab === 'history' && (
            <div className="flex items-center gap-2">
              <button
                onClick={exportPOSTransactionsToCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>{txt.exportCSV}</span>
              </button>
              <button
                onClick={handleAddRegister}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>{txt.btnOpenPOS}</span>
              </button>
            </div>
          )}

          {activeTab === 'pos' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.open(
                    '#/admin/pos/display',
                    'SN_POS_Customer_Display',
                    'width=1200,height=800,menubar=no,toolbar=no,location=no,status=no'
                  );
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-black hover:to-stone-950 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Buka Layar Monitor Kedua / Tampilan Pelanggan (Customer-Facing Display)"
              >
                <span className="material-symbols-outlined text-base text-amber-400">desktop_windows</span>
                <span>🖥️ Layar Pelanggan (Dual Display)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR PENJUALAN KASIR (HISTORY) VIEW                              */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Transaksi */}
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {txt.statTotalTx}
                </p>
                <h3 className="text-2xl font-black text-stone-900 mt-1">
                  {historyStats.totalTx.toLocaleString()}{' '}
                  <span className="text-xs font-medium text-stone-500">Tx</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <span className="material-symbols-outlined text-2xl">receipt</span>
              </div>
            </div>

            {/* 2. Total Omzet POS */}
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {txt.statTotalRevenue}
                </p>
                <h3 className="text-2xl font-black text-[#c41230] mt-1">
                  ¥{historyStats.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#c41230] flex items-center justify-center border border-rose-100">
                <span className="material-symbols-outlined text-2xl">monetization_on</span>
              </div>
            </div>

            {/* 3. Average Order Value (AOV) */}
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {txt.statAvgAOV}
                </p>
                <h3 className="text-2xl font-black text-emerald-700 mt-1">
                  ¥{Math.round(historyStats.avgAOV).toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
            </div>

            {/* 4. Total Item Terjual */}
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {txt.statTotalItems}
                </p>
                <h3 className="text-2xl font-black text-indigo-900 mt-1">
                  {historyStats.totalItems.toLocaleString()}{' '}
                  <span className="text-xs font-medium text-stone-500">Pcs</span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <span className="material-symbols-outlined text-2xl">shopping_cart_checkout</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder={txt.searchHistoryPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230] focus:bg-white transition-all"
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                </button>
              )}
            </div>

            {/* Filter Pills / Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Filter Payment Method */}
              <select
                value={historyMethodFilter}
                onChange={(e) => setHistoryMethodFilter(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#c41230]"
              >
                <option value="all">{txt.filterAllMethods}</option>
                <option value="Cash">💵 Cash (Tunai)</option>
                <option value="JPQR / QRIS">📱 JPQR / QRIS</option>
                <option value="PayPay">🔴 PayPay QR</option>
                <option value="Credit Card">💳 Credit Card</option>
                <option value="IC Card">🚃 IC Card</option>
              </select>

              {/* Filter Date Range */}
              <select
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value as any)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#c41230]"
              >
                <option value="all">{txt.filterAllDates}</option>
                <option value="today">{txt.filterToday}</option>
                <option value="7days">{txt.filter7Days}</option>
                <option value="month">{txt.filterThisMonth}</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-3xl">receipt_long</span>
                </div>
                <h4 className="text-base font-bold text-stone-800">{txt.emptyHistoryTitle}</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  {txt.emptyHistoryDesc}
                </p>
                <button
                  onClick={() => setSearchParams({ tab: 'pos' })}
                  className="mt-4 px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">point_of_sale</span>
                  <span>{txt.btnOpenPOS}</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      <th className="py-3 px-4">{txt.colReceiptNo}</th>
                      <th className="py-3 px-4">{txt.colDateTime}</th>
                      <th className="py-3 px-4">{txt.colCashier}</th>
                      <th className="py-3 px-4">{txt.colCustomer}</th>
                      <th className="py-3 px-4">{txt.colItems}</th>
                      <th className="py-3 px-4">{txt.colPayment}</th>
                      <th className="py-3 px-4 text-right">{txt.colSubtotal}</th>
                      <th className="py-3 px-4 text-right">{txt.colDiscount}</th>
                      <th className="py-3 px-4 text-right">{txt.colTax}</th>
                      <th className="py-3 px-4 text-right">{txt.colTotal}</th>
                      <th className="py-3 px-4 text-center">{txt.colStatus}</th>
                      <th className="py-3 px-4 text-center">{txt.colAction}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                    {filteredHistory.map((tx) => {
                      const totalQty = tx.items.reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <tr key={tx.id} className="hover:bg-stone-50/80 transition-colors">
                          {/* Receipt Number */}
                          <td className="py-3 px-4 font-mono font-bold text-stone-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{tx.receiptNumber}</span>
                              <button
                                onClick={() => handleCopyReceipt(tx.receiptNumber)}
                                title="Copy No. Struk"
                                className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {copiedReceiptId === tx.receiptNumber ? 'check' : 'content_copy'}
                                </span>
                              </button>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                            <div>
                              {new Date(tx.date).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              {new Date(tx.date).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>

                          {/* Cashier */}
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-stone-800">
                            {tx.cashierName}
                          </td>

                          {/* Customer & Notes */}
                          <td className="py-3 px-4 whitespace-nowrap text-stone-600">
                            <span className="font-bold text-stone-900 block">
                              {tx.customerName || 'Walk-in'}
                            </span>
                            {tx.notes && (
                              <div
                                className="text-[10px] text-stone-500 italic max-w-[160px] truncate flex items-center gap-1 mt-0.5"
                                title={tx.notes}
                              >
                                <span className="material-symbols-outlined text-[11px] text-amber-600 shrink-0">
                                  sticky_note_2
                                </span>
                                <span>{tx.notes}</span>
                              </div>
                            )}
                          </td>

                          {/* Items Preview */}
                          <td className="py-3 px-4">
                            <div className="max-w-[180px]">
                              <span className="inline-block px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-bold mr-1">
                                {totalQty} pcs ({tx.items.length} sku)
                              </span>
                              <div
                                className="text-[10px] text-stone-500 truncate mt-0.5"
                                title={tx.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                              >
                                {tx.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                              </div>
                            </div>
                          </td>

                          {/* Payment Method */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getPaymentBadge(
                                tx.paymentMethod
                              )}`}
                            >
                              {tx.paymentMethod}
                            </span>
                          </td>

                          {/* Subtotal */}
                          <td className="py-3 px-4 text-right font-mono text-stone-600 whitespace-nowrap">
                            ¥{tx.subtotal.toLocaleString()}
                          </td>

                          {/* Discount */}
                          <td className="py-3 px-4 text-right font-mono text-rose-600 whitespace-nowrap">
                            {tx.discountAmount > 0 ? `-¥${tx.discountAmount.toLocaleString()}` : '-'}
                          </td>

                          {/* Tax JCT */}
                          <td className="py-3 px-4 text-right font-mono text-stone-600 whitespace-nowrap">
                            ¥{tx.taxAmount.toLocaleString()}
                          </td>

                          {/* Grand Total */}
                          <td className="py-3 px-4 text-right font-mono font-black text-stone-900 whitespace-nowrap text-sm">
                            {tx.currency === 'IDR' ? (
                              <div>
                                <span>{formatIdr(tx.amountPaidOriginal || convertJpyToIdr(tx.totalAmount, tx.exchangeRate))}</span>
                                <div className="text-[10px] text-stone-400 font-normal">¥{tx.totalAmount.toLocaleString()}</div>
                              </div>
                            ) : (
                              <span>¥{tx.totalAmount.toLocaleString()}</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {txt.statusPaid}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setCompletedTx(tx)}
                                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title={txt.btnViewReceipt}
                              >
                                <span className="material-symbols-outlined text-xs">receipt</span>
                                <span>{txt.btnViewReceipt}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MESIN KASIR LIVE (POS TERMINAL) VIEW                               */}
      {/* ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto animate-fadeIn">
          {/* Left Column: Product Selection Grid (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Search & Category Filter */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              {/* Scan Toast Feedback */}
              {scanFeedbackMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn transition-all shadow-xs ${
                    scanFeedbackMsg.isError
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {scanFeedbackMsg.isError ? 'error' : 'check_circle'}
                  </span>
                  <span>{scanFeedbackMsg.text}</span>
                </div>
              )}

              {/* Barcode Scanner & Search Input */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c41230]">
                  barcode_scanner
                </span>
                <input
                  ref={barcodeInputRef}
                  id="pos-barcode-scanner-input"
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    // Automatic detection when full barcode is scanned without pressing Enter
                    if (val.trim().length >= 4) {
                      const directMatch = products.find((p) => {
                        const pSku = ((p as any).sku || '').toLowerCase();
                        const pBarcode = ((p as any).barcode || '').toLowerCase();
                        const target = val.trim().toLowerCase();
                        return p.id.toLowerCase() === target || pSku === target || pBarcode === target;
                      });
                      if (directMatch) {
                        handleBarcodeScanOrSubmit(val);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBarcodeScanOrSubmit(searchQuery);
                    }
                  }}
                  placeholder={
                    language === 'JP'
                      ? 'バーコードスキャン / 例: 10*バーコードで10個一括スキャン / SKU・商品名検索...'
                      : language === 'EN'
                      ? 'Scan barcode (or type 10*barcode for 10 pcs multi-scan) / search SKU or name...'
                      : 'Scan barcode (atau ketik 10*Barcode untuk multi-scan 10 pcs) / ketik SKU & Nama...'
                  }
                  className="w-full pl-11 pr-24 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230] focus:bg-white transition-all shadow-2xs"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        barcodeInputRef.current?.focus();
                      }}
                      className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">cancel</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleBarcodeScanOrSubmit(searchQuery)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#c41230] hover:bg-[#a80f28] text-white text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                    title="Scan Barcode / Tambah ke Keranjang"
                  >
                    <span className="material-symbols-outlined text-xs">barcode_scanner</span>
                    <span>Scan</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Product Area: Default Kosong dengan Banner Panduan Scan / Pencarian */}
            {!searchQuery.trim() ? (
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[380px] animate-fadeIn">
                <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#c41230] flex items-center justify-center mb-4 shadow-xs border border-red-100">
                  <span className="material-symbols-outlined text-4xl">barcode_scanner</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 mb-1.5">
                  {language === 'JP'
                    ? 'バーコードをスキャンするか、商品名・SKUを入力してください'
                    : language === 'EN'
                    ? 'Please Scan Barcode or Type Product Name / SKU'
                    : 'Silakan Scan Barcode atau Ketik Nama / SKU Produk'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md leading-relaxed mb-6">
                  {language === 'JP'
                    ? 'バーコードリーダーで商品のバーコードをスキャンすると、自動的にレジカートに追加されます。「10*バーコード」で複数個一括スキャンも可能です。'
                    : language === 'EN'
                    ? 'Scan product barcode to automatically add to cart. Use "10*barcode" for fast multi-quantity scan.'
                    : 'Arahkan scanner ke barcode produk untuk otomatis masuk ke keranjang kasir. Gunakan format "10*Barcode" untuk scan 10 pcs sekaligus.'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl w-full text-left text-xs">
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-[#c41230] shrink-0">qr_code_scanner</span>
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">Scan Barcode</span>
                      <span className="text-[10px] text-stone-500">Auto-add ke kasir</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-purple-600 shrink-0">pin</span>
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">Multi-Scan Qty</span>
                      <span className="text-[10px] text-stone-500">Ketik 10*Barcode</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-amber-600 shrink-0">search</span>
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">Ketik Nama / SKU</span>
                      <span className="text-[10px] text-stone-500">Tampilkan katalog</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-emerald-600 shrink-0">desktop_windows</span>
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">Layar Pelanggan</span>
                      <span className="text-[10px] text-stone-500">Dual display siap</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <span className="material-symbols-outlined text-4xl text-stone-300 mb-2">search_off</span>
                <h4 className="text-sm font-bold text-stone-800 mb-1">
                  {language === 'JP' ? '商品が見つかりません' : language === 'EN' ? 'No products found' : 'Produk Tidak Ditemukan'}
                </h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  {language === 'JP'
                    ? `「${searchQuery}」に一致する商品は登録されていません。`
                    : language === 'EN'
                    ? `No product matches "${searchQuery}". Please check SKU or name.`
                    : `Tidak ada produk yang cocok dengan "${searchQuery}". Silakan periksa barcode atau ketik kata kunci lain.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const inCartItem = cart.find((item) => item.product.id === product.id);
                  const isOutOfStock = product.stock <= 0;
                  const displayName =
                    language === 'JP'
                      ? product.nameJp || product.name
                      : language === 'EN'
                      ? product.nameEn || product.name
                      : product.name;

                  return (
                    <button
                      key={product.id}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className={`bg-white p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 group relative cursor-pointer ${
                        isOutOfStock
                          ? 'border-stone-200 opacity-60 cursor-not-allowed'
                          : inCartItem
                          ? 'border-[#c41230] ring-2 ring-[#c41230]/20 shadow-sm'
                          : 'border-stone-200 hover:border-[#c41230] hover:shadow-md'
                      }`}
                    >
                      {inCartItem && (
                        <span className="absolute top-2 right-2 bg-[#c41230] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs z-10">
                          {inCartItem.quantity}
                        </span>
                      )}

                      <div>
                        <div className="aspect-square rounded-xl bg-stone-50 overflow-hidden mb-2 relative">
                          <img
                            src={resolveProductImage(product.image, language)}
                            alt={displayName}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getPlaceholderImage(language);
                            }}
                            className="w-full h-full object-contain p-1.5 bg-[#FAF8F5] group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.isFrozen && (
                            <span className="absolute bottom-1.5 left-1.5 bg-blue-600/90 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                              {txt.frozenBadge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 font-semibold uppercase truncate">
                          {product.brand}
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                          {displayName}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-[#c41230]">
                            {payCurrency === 'IDR'
                              ? formatIdr(convertJpyToIdr(product.price, exchangeRate))
                              : `¥${product.price.toLocaleString()}`}
                          </div>
                          <div className="text-[9px] text-stone-400">
                            {txt.stockLabel}{' '}
                            <span className={product.stock <= 5 ? 'text-amber-600 font-bold' : ''}>
                              {product.stock}
                            </span>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-stone-100 group-hover:bg-[#c41230] group-hover:text-white text-stone-600 flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Live Cart & Bill Summary (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between sticky top-24">
            <div>
              {/* Cart Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="material-symbols-outlined text-stone-700">shopping_cart</span>
                  <h3 className="font-bold text-stone-900 text-sm">{txt.cartTitle}</h3>
                  <span
                    className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-[#c41230] border border-red-200"
                    title="Jumlah item berbeda yang discan kasir"
                  >
                    Jumlah Item: {totalItemCount}
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200"
                    title="Total kuantitas fisik semua produk"
                  >
                    Total: {totalQuantity} pcs
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    {txt.clearCart}
                  </button>
                )}
              </div>

              {/* Customer Input & Selector (Integrated CRM + Walk-in Support) */}
              <div className="mb-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">person</span>
                    <span>{txt.memberLabel}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddCustomerOpen(true)}
                    className="text-[10px] font-bold text-[#c41230] hover:text-[#a80f28] flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">person_add</span>
                    <span>+ {txt.btnQuickAddMember}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    list="pos-customers-datalist"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    placeholder={txt.memberPlaceholder}
                    className="w-full bg-white border border-stone-200 rounded-lg text-xs pl-2.5 pr-8 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-[#c41230]"
                  />
                  <datalist id="pos-customers-datalist">
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>
                        ⭐ {c.name} ({c.tier}) • {c.phone}
                      </option>
                    ))}
                  </datalist>
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  )}
                </div>

                {/* Selected Customer Status Chip */}
                {selectedCustomerObj ? (
                  <div className="flex items-center justify-between px-2 py-1 bg-white rounded-lg border border-stone-200 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900">{selectedCustomerObj.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          selectedCustomerObj.tier === 'VIP'
                            ? 'bg-purple-100 text-purple-800'
                            : selectedCustomerObj.tier === 'Gold'
                            ? 'bg-amber-100 text-amber-800'
                            : selectedCustomerObj.tier === 'Silver'
                            ? 'bg-stone-200 text-stone-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {selectedCustomerObj.tier}
                      </span>
                    </div>
                    <span className="font-bold text-stone-400 font-mono">
                      -
                    </span>
                  </div>
                ) : selectedCustomer ? (
                  <div className="text-[10px] text-stone-500 italic px-1">
                    👤 Pelanggan umum/walk-in: <span className="font-bold text-stone-800">{selectedCustomer}</span>
                  </div>
                ) : null}
              </div>

              {/* Cart Item List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">
                      production_quantity_limits
                    </span>
                    <p className="text-xs">{txt.cartEmpty}</p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const prodName =
                      language === 'JP'
                        ? item.product.nameJp || item.product.name
                        : language === 'EN'
                        ? item.product.nameEn || item.product.name
                        : item.product.name;
                    return (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/60"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <h5 className="text-xs font-bold text-stone-900 truncate">{prodName}</h5>
                          <div className="text-[11px] text-stone-500">
                            {payCurrency === 'IDR' ? (
                              <>
                                {formatIdr(convertJpyToIdr(item.product.price, exchangeRate))} × {item.quantity} ={' '}
                                <span className="font-bold text-stone-800">
                                  {formatIdr(convertJpyToIdr(item.product.price * item.quantity, exchangeRate))}
                                </span>
                              </>
                            ) : (
                              <>
                                ¥{item.product.price.toLocaleString()} × {item.quantity} ={' '}
                                <span className="font-bold text-stone-800">
                                  ¥{(item.product.price * item.quantity).toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Qty Counter Buttons & Direct Number Input */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-md bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700 cursor-pointer"
                            title="Kurangi 1"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1) {
                                updateExactQuantity(item.product.id, val);
                              }
                            }}
                            className="w-10 h-6 text-center text-xs font-black text-stone-900 bg-white border border-stone-300 rounded px-1 py-0 focus:ring-1 focus:ring-[#c41230] focus:outline-none"
                            title="Ketik jumlah langsung (contoh: 12, 24, dll)"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-6 h-6 rounded-md bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700 cursor-pointer"
                            title="Tambah 1"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="w-6 h-6 rounded-md text-stone-400 hover:text-rose-600 flex items-center justify-center ml-1 cursor-pointer"
                            title="Hapus dari keranjang"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Calculations, Notes & Checkout Button */}
            <div className="mt-3 pt-3 border-t border-stone-200 space-y-2">
              {/* Rincian Jumlah Item & Total Kuantitas (Highlight Box) */}
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/90 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-stone-700">
                  <span className="font-semibold flex items-center gap-1.5 text-stone-800">
                    <span className="material-symbols-outlined text-sm text-[#c41230]">category</span>
                    <span>{txt.itemCountLabel}:</span>
                  </span>
                  <span className="font-black text-sm text-[#c41230] font-mono bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                    {totalItemCount} {txt.itemSuffix}
                  </span>
                </div>
                <div className="flex justify-between items-center text-stone-600 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-stone-400">inventory_2</span>
                    <span>{txt.totalUnitsLabel}:</span>
                  </span>
                  <span className="font-bold text-stone-800 font-mono">
                    {totalQuantity} {txt.unitsSuffix}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xs text-stone-600">
                <span>{txt.subtotal}</span>
                <span className="font-semibold text-stone-900">
                  {payCurrency === 'IDR' ? formatIdr(subtotalIDR) : formatJpy(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-stone-500">
                <span>{txt.tax8}</span>
                <span className="font-semibold">
                  {payCurrency === 'IDR' ? formatIdr(taxAmountIDR) : formatJpy(taxAmount)}
                </span>
              </div>

              {/* Text Area Kolom Catatan / Keterangan Transaksi */}
              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">edit_note</span>
                    <span>{txt.notesLabel}</span>
                  </label>
                  {txNotes && (
                    <button
                      type="button"
                      onClick={() => setTxNotes('')}
                      className="text-[10px] text-stone-400 hover:text-rose-600 cursor-pointer"
                    >
                      {txt.clearNotes}
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder={txt.notesPlaceholder}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl text-xs p-2 focus:outline-none focus:ring-1 focus:ring-[#c41230] focus:bg-white resize-none"
                />
              </div>

              {/* Currency Selector (Bayar Yen / Rupiah) */}
              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#c41230]">currency_exchange</span>
                    <span>Mata Uang Bayar:</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    1 JPY = Rp {exchangeRate}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setPayCurrency('JPY');
                      if (isPaymentOpen) setCashGiven(totalAmount);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      payCurrency === 'JPY'
                        ? 'bg-[#c41230] text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-200/60'
                    }`}
                  >
                    <span>🇯🇵</span>
                    <span>Yen (¥)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPayCurrency('IDR');
                      if (isPaymentOpen) setCashGiven(totalAmountIDR);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      payCurrency === 'IDR'
                        ? 'bg-[#c41230] text-white shadow-xs'
                        : 'text-stone-600 hover:bg-stone-200/60'
                    }`}
                  >
                    <span>🇮🇩</span>
                    <span>Rupiah (Rp)</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>{txt.totalPay}</span>
                <div className="text-right">
                  <span className="text-[#c41230] text-lg block">
                    {payCurrency === 'IDR' ? formatIdr(totalAmountIDR) : formatJpy(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                disabled={cart.length === 0}
                onClick={handleOpenPayment}
                className={`w-full mt-2 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  cart.length > 0
                    ? 'bg-[#c41230] hover:bg-[#a80f28] text-white shadow-md hover:shadow-lg'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-lg">payments</span>
                <span>
                  Bayar Transaksi ({payCurrency === 'IDR' ? formatIdr(totalAmountIDR) : formatJpy(totalAmount)})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK ADD CUSTOMER / MEMBER BARU (FROM POS)                       */}
      {/* ========================================================================= */}
      {isQuickAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">person_add</span>
                <span>{txt.quickAddTitle}</span>
              </h3>
              <button
                onClick={() => setIsQuickAddCustomerOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.custNameLabel}</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Nama Lengkap Pelanggan..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.custPhoneLabel}</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+81 80-xxxx-xxxx"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.custCityLabel}</label>
                <input
                  type="text"
                  value={newCustCity}
                  onChange={(e) => setNewCustCity(e.target.value)}
                  placeholder="Tokyo, Osaka, dll..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsQuickAddCustomerOpen(false)}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                {txt.btnCancel}
              </button>
              <button
                onClick={handleQuickAddCustomer}
                className="flex-1 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-colors"
              >
                {txt.btnSaveCustomer}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PROSES PEMBAYARAN KASIR (PAYMENT MODAL)                          */}
      {/* ========================================================================= */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">paid</span>
                <span>{txt.payModalTitle}</span>
              </h3>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Currency Switcher in Payment Modal */}
            <div className="p-1 bg-stone-100 rounded-xl grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => {
                  setPayCurrency('JPY');
                  setCashGiven(totalAmount);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  payCurrency === 'JPY'
                    ? 'bg-[#c41230] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                <span>🇯🇵</span>
                <span>Bayar Yen (¥)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayCurrency('IDR');
                  setCashGiven(totalAmountIDR);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  payCurrency === 'IDR'
                    ? 'bg-[#c41230] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                <span>🇮🇩</span>
                <span>Bayar Rupiah (Rp)</span>
              </button>
            </div>

            {/* Total Due Banner */}
            <div className="bg-stone-900 text-white p-4 rounded-2xl text-center">
              <div className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
                {txt.payTotalLabel} ({payCurrency === 'IDR' ? 'Rupiah Indonesia' : 'Yen Jepang'})
              </div>
              <div className="text-3xl font-black text-amber-400 mt-0.5">
                {payCurrency === 'IDR' ? formatIdr(totalAmountIDR) : formatJpy(totalAmount)}
              </div>
              {payCurrency === 'IDR' && (
                <div className="text-[10px] text-stone-400 mt-1">
                  Kurs: 1 JPY = Rp {exchangeRate}
                </div>
              )}
            </div>

            {/* Method Picker */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">
                {txt.payMethodLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'Cash', label: txt.payCash },
                    { id: 'JPQR / QRIS', label: txt.payJpqr },
                    { id: 'PayPay', label: txt.payPay },
                    { id: 'Credit Card', label: txt.payCard },
                    { id: 'IC Card', label: txt.payIc }
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                      paymentMethod === m.id
                        ? 'border-[#c41230] bg-[#c41230]/10 text-[#c41230] ring-1 ring-[#c41230]'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{m.label}</span>
                    {paymentMethod === m.id && (
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-view for Cash */}
            {paymentMethod === 'Cash' && (
              <div className="space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700">
                    Uang Diterima ({payCurrency === 'IDR' ? 'Rp' : '¥'}):
                  </label>
                  <button
                    onClick={() => setCashGiven(payCurrency === 'IDR' ? totalAmountIDR : totalAmount)}
                    className="text-[10px] font-bold text-[#c41230] hover:underline cursor-pointer"
                  >
                    {txt.cashExact} ({payCurrency === 'IDR' ? formatIdr(totalAmountIDR) : formatJpy(totalAmount)})
                  </button>
                </div>
                <input
                  type="number"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(Number(e.target.value))}
                  className="w-full text-xl font-bold font-mono px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#c41230] focus:outline-none"
                />

                {/* Quick denomination chips */}
                <div className="flex flex-wrap gap-1.5">
                  {(payCurrency === 'IDR'
                    ? [50000, 100000, 200000, 500000, 1000000]
                    : [1000, 2000, 5000, 10000]
                  ).map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCashGiven(amt)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                    >
                      {payCurrency === 'IDR' ? formatIdr(amt) : `¥${amt.toLocaleString()}`}
                    </button>
                  ))}
                </div>

                {/* Change Calculation */}
                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-600">{txt.changeLabel}</span>
                  {cashGiven >= (payCurrency === 'IDR' ? totalAmountIDR : totalAmount) ? (
                    <span className="text-base font-black text-emerald-600 font-mono">
                      {payCurrency === 'IDR'
                        ? formatIdr(cashGiven - totalAmountIDR)
                        : formatJpy(cashGiven - totalAmount)}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600">{txt.changeShort}</span>
                  )}
                </div>
              </div>
            )}

            {/* Sub-view for JPQR / QRIS */}
            {paymentMethod === 'JPQR / QRIS' && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-xl">qr_code_2</span>
                </div>
                <h4 className="text-xs font-bold text-purple-900">{txt.jpqrTitle}</h4>
                <div className="inline-block bg-white border border-purple-300 rounded-xl px-3 py-1 font-mono font-black text-sm text-purple-900 shadow-xs">
                  Nominal Scan: {payCurrency === 'IDR' ? formatIdr(totalAmountIDR) : formatJpy(totalAmount)}
                </div>
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  {payCurrency === 'IDR'
                    ? 'Pelanggan memindai QRIS dengan m-Banking / e-Wallet Indonesia (BCA, Mandiri, BRI, GoPay, OVO, ShopeePay).'
                    : txt.jpqrGuideDesc}
                </p>
              </div>
            )}

            {/* Sub-view for PayPay */}
            {paymentMethod === 'PayPay' && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                </div>
                <h4 className="text-xs font-bold text-rose-900">PayPay QR Stand Payment</h4>
                <p className="text-[11px] text-rose-700 leading-relaxed">{txt.payPayGuide}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleProcessPayment}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">receipt</span>
                <span>{txt.btnCompletePay}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAIL NOTA STRUK KASIR (RECEIPT VIEW / PRINT MODAL)             */}
      {/* ========================================================================= */}
      {completedTx && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-scaleUp space-y-3">
            {/* PRINTER STATUS & QUICK CONFIG BANNER */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-2.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#c41230]/10 text-[#c41230] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base">print</span>
                  </div>
                  <div>
                    <div className="font-bold text-stone-900 text-[11px] flex items-center gap-1.5 flex-wrap">
                      <span>{printerSettings.printerName}</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-md">
                        {printerSettings.paperWidth}×{printerSettings.rollDiameter} mm
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      {printerSettings.connectionType === 'browser_driver'
                        ? 'Universal Driver (USB / BT Windows & Mac)'
                        : printerSettings.connectionType === 'bluetooth'
                        ? 'Bluetooth Direct ESC/POS'
                        : printerSettings.connectionType === 'usb_direct'
                        ? 'USB Direct ESC/POS'
                        : 'Network IP ESC/POS'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/admin/settings?tab=printer')}
                  className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  title="Atur ukuran kertas & model printer thermal di menu Pengaturan"
                >
                  <span className="material-symbols-outlined text-xs">settings</span>
                  <span>Atur</span>
                </button>
              </div>

              {/* Quick switch between connected Windows / Mac printers */}
              {printerSettings.savedPrinters && printerSettings.savedPrinters.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-stone-200 text-xs">
                  <label className="text-stone-800 font-bold shrink-0 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#c41230]">print</span>
                    <span>Printer :</span>
                  </label>
                  <select
                    value={
                      printerSettings.savedPrinters.find((p) => p.name === printerSettings.printerName)?.id || ''
                    }
                    onChange={(e) => {
                      const sel = printerSettings.savedPrinters?.find((p) => p.id === e.target.value);
                      if (sel) {
                        const newSettings = {
                          ...printerSettings,
                          printerName: sel.name,
                          connectionType: sel.connectionType,
                          paperWidth: sel.paperWidth,
                          rollDiameter: sel.rollDiameter
                        };
                        setPrinterSettings(newSettings);
                        localStorage.setItem('sn_pos_printer_settings', JSON.stringify(newSettings));
                      }
                    }}
                    className="flex-1 bg-white border border-stone-300 rounded-lg text-xs font-bold px-2 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#c41230] shadow-xs cursor-pointer truncate"
                  >
                    {printerSettings.savedPrinters.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.paperWidth ? `(${p.paperWidth}x${p.rollDiameter || 47}mm)` : ''} {p.name === printerSettings.printerName ? '★ [AKTIF]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* RECEIPT PRINT CONTAINER */}
            <div
              id="pos-thermal-receipt-print-area"
              className="bg-white p-3 border border-dashed border-stone-300 rounded-2xl space-y-3 font-mono"
            >
              {/* Thermal Struk Header */}
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-stone-400">
                {printerSettings.showLogo && (
                  <div className="text-xs font-black tracking-wider text-[#c41230] mb-0.5 font-sans">
                    せんばこ ぬさんたら にほん
                  </div>
                )}
                <h3 className="font-black text-xs text-stone-900 tracking-wider uppercase">
                  {printerSettings.storeName || txt.receiptHeaderStore}
                </h3>
                <p className="text-[10px] text-stone-600 leading-tight">
                  {printerSettings.storeAddress || txt.receiptStoreAddr}
                </p>
                {printerSettings.storePhone && (
                  <p className="text-[9px] text-stone-500">Telp: {printerSettings.storePhone}</p>
                )}
              </div>

              {/* Struk Metadata */}
              <div className="text-[10px] space-y-0.5 text-stone-700 py-1 border-b border-dashed border-stone-400">
                <div className="flex justify-between">
                  <span>No:</span>
                  <span className="font-bold text-stone-900">{completedTx.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tgl:</span>
                  <span>{new Date(completedTx.date).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{completedTx.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold text-stone-800">{completedTx.customerName || 'Walk-in'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto text-[11px] py-1.5 border-b border-dashed border-stone-400">
                {completedTx.items.map((item, idx) => {
                  const isIdr = completedTx.currency === 'IDR';
                  const rate = completedTx.exchangeRate || exchangeRate;
                  const itemPriceStr = isIdr
                    ? formatIdr(convertJpyToIdr(item.price, rate))
                    : `¥${item.price.toLocaleString()}`;
                  const itemSubtotalStr = isIdr
                    ? formatIdr(convertJpyToIdr(item.subtotal, rate))
                    : `¥${item.subtotal.toLocaleString()}`;
                  return (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="pr-1 flex-1">
                        <div className="font-semibold text-stone-900 leading-tight">
                          {item.productName}
                        </div>
                        <div className="text-[9px] text-stone-500">
                          {itemPriceStr} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-stone-900 shrink-0 text-right">
                        {itemSubtotalStr}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan / Keterangan Transaksi pada Struk */}
              {completedTx.notes && (
                <div className="text-[9px] p-1.5 bg-stone-50 rounded border border-dashed border-stone-300 text-stone-700">
                  <span className="font-bold block uppercase mb-0.5">Catatan:</span>
                  <span>{completedTx.notes}</span>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-stone-600 text-[10px] pb-1 border-b border-dashed border-stone-300">
                  <span>Jumlah Item:</span>
                  <span className="font-bold text-stone-900">
                    {completedTx.items.length} Item ({completedTx.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>
                    {completedTx.currency === 'IDR'
                      ? formatIdr(convertJpyToIdr(completedTx.subtotal, completedTx.exchangeRate || exchangeRate))
                      : `¥${completedTx.subtotal.toLocaleString()}`}
                  </span>
                </div>
                {completedTx.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon:</span>
                    <span>-¥{completedTx.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Pajak (8%):</span>
                  <span>
                    {completedTx.currency === 'IDR'
                      ? formatIdr(convertJpyToIdr(completedTx.taxAmount, completedTx.exchangeRate || exchangeRate))
                      : `¥${completedTx.taxAmount.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xs text-stone-900 pt-1 border-t border-stone-400">
                  <span>TOTAL:</span>
                  <div className="text-right">
                    <span>
                      {completedTx.currency === 'IDR'
                        ? formatIdr(completedTx.amountPaidOriginal || convertJpyToIdr(completedTx.totalAmount, completedTx.exchangeRate))
                        : formatJpy(completedTx.totalAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-stone-700 pt-1 border-t border-dashed border-stone-300">
                  <span>
                    Bayar ({completedTx.paymentMethod} {completedTx.currency === 'IDR' ? 'Rp' : '¥'}):
                  </span>
                  <span>
                    {completedTx.currency === 'IDR'
                      ? formatIdr(completedTx.amountPaidOriginal || completedTx.amountPaid)
                      : formatJpy(completedTx.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Kembali:</span>
                  <span className="font-bold">
                    {completedTx.currency === 'IDR'
                      ? formatIdr(completedTx.changeAmountOriginal || completedTx.changeAmount)
                      : formatJpy(completedTx.changeAmount)}
                  </span>
                </div>
              </div>

              {/* Footer Note & Store Policy */}
              <div className="text-center pt-2 border-t border-dashed border-stone-400 space-y-1">
                <p className="text-[10px] text-stone-700 font-bold leading-tight">
                  {printerSettings.footerNote || txt.receiptThanks}
                </p>
                {printerSettings.storePolicyNote && (
                  <p className="text-[8.5px] text-stone-500 leading-tight">
                    {printerSettings.storePolicyNote}
                  </p>
                )}
                <div className="text-[8px] text-stone-400 pt-1 tracking-widest uppercase">
                  *** UKURAN NOTA: {printerSettings.paperWidth}×{printerSettings.rollDiameter} MM ***
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Cetak Nota ({printerSettings.paperWidth}mm)</span>
              </button>
              <button
                type="button"
                onClick={() => setCompletedTx(null)}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
