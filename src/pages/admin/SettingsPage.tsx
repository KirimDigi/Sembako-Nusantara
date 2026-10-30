import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { CashierPermissionItem, CashierAccount, ThermalPrinterSettings, ConnectedPrinterProfile } from '../../types';
import { supabase } from '../../lib/supabase';
import { 
  sendWhatsAppMessage, 
  getWAGatewayConfig, 
  WAGatewayConfig, 
  DEFAULT_WA_CONFIG,
  ADMIN_WA_PHONE,
  getAdminWAPhone,
  setAdminWAPhone
} from '../../services/whatsappGateway';

export const INITIAL_PERMISSIONS: CashierPermissionItem[] = [
  // 1. Operasional Kasir & Penjualan
  {
    id: 'pos_terminal_access',
    label: 'Akses Masuk Mesin Kasir POS (Live Terminal)',
    description: 'Mengizinkan staf membuka halaman terminal POS, memindai barcode, dan memproses transaksi belanja langsung.',
    category: 'operasional',
    enabled: true
  },
  {
    id: 'reprint_receipt',
    label: 'Cetak Ulang Struk / Nota Pembelian',
    description: 'Mengizinkan kasir mencetak ulang struk thermal untuk pelanggan dari tab riwayat transaksi.',
    category: 'operasional',
    enabled: true
  },
  {
    id: 'open_cash_drawer_manual',
    label: 'Buka Laci Kasir (Cash Drawer) Manual',
    description: 'Mengizinkan kasir membuka laci uang tunai tanpa harus ada transaksi penjualan baru.',
    category: 'operasional',
    enabled: true
  },
  {
    id: 'park_resume_order',
    label: 'Tahan & Lanjutkan Antrean Belanja (Park Order)',
    description: 'Mengizinkan kasir menahan keranjang sementara jika pembeli mengambil barang tambahan, lalu melanjutkannya nanti.',
    category: 'operasional',
    enabled: true
  },

  // 2. Diskon, Harga & Pembatalan (Sensitif)
  {
    id: 'manual_discount',
    label: 'Berikan Diskon Manual / Potongan Khusus',
    description: 'Mengizinkan staf menginput diskon potongan manual (persentase % atau nominal ¥) pada total keranjang.',
    category: 'diskon_harga',
    enabled: false
  },
  {
    id: 'void_pending_transaction',
    label: 'Void / Hapus Transaksi Belum Dibayar',
    description: 'Mengizinkan staf menghapus transaksi atau membatalkan seluruh item di keranjang yang belum lunas.',
    category: 'diskon_harga',
    enabled: true
  },
  {
    id: 'refund_return_goods',
    label: 'Proses Refund Dana & Retur Produk Pelanggan',
    description: 'Mengizinkan staf melakukan retur produk rusak/salah beli dan mengembalikan uang tunai ke pelanggan.',
    category: 'diskon_harga',
    enabled: false
  },
  {
    id: 'override_product_price',
    label: 'Ubah / Override Harga Satuan Produk di Kasir',
    description: 'Mengizinkan staf mengubah harga jual per item langsung saat transaksi jika terjadi selisih harga label rak.',
    category: 'diskon_harga',
    enabled: false
  },

  // 3. Keuangan, Laporan & Piutang
  {
    id: 'view_shift_sales_report',
    label: 'Lihat Rekap Omset & Kas Shift Sendiri',
    description: 'Mengizinkan staf melihat total uang masuk (tunai, PayPay, kartu kredit) pada shift yang sedang berjalan.',
    category: 'keuangan',
    enabled: true
  },
  {
    id: 'close_shift_cash_reconciliation',
    label: 'Tutup Shift & Rekonsiliasi Kasir (Closing)',
    description: 'Mengizinkan staf melakukan tutup buku harian, menghitung saldo kas akhir, dan serah terima shift.',
    category: 'keuangan',
    enabled: true
  },
  {
    id: 'customer_bon_credit',
    label: 'Catat Penjualan Piutang / Pelanggan Bon',
    description: 'Mengizinkan metode pembayaran piutang (Bayar Nanti) khusus pelanggan langganan yang disetujui.',
    category: 'keuangan',
    enabled: false
  },
  {
    id: 'view_product_cost_price',
    label: 'Lihat Harga Modal / HPP Produk di Layar Kasir',
    description: 'Menampilkan margin profit dan harga modal beli produk dari supplier pada tampilan kasir.',
    category: 'keuangan',
    enabled: false
  }
];

const INITIAL_CASHIERS: CashierAccount[] = [
  {
    id: 'pos-1',
    name: 'Ahmad Hidayat',
    role: 'Store Manager',
    pin: '9988',
    status: 'Aktif',
    lastActive: 'Hari ini, 16:15 JST',
    shift: 'Full Time',
    allowedPermissions: INITIAL_PERMISSIONS.map((p) => p.id)
  },
  {
    id: 'pos-2',
    name: 'Siti Rahmawati',
    role: 'Supervisor (SPV)',
    pin: '1234',
    status: 'Aktif',
    lastActive: 'Hari ini, 15:30 JST',
    shift: 'Pagi (08:00 - 16:00)',
    allowedPermissions: [
      'pos_terminal_access',
      'reprint_receipt',
      'open_cash_drawer_manual',
      'park_resume_order',
      'manual_discount',
      'void_pending_transaction',
      'refund_return_goods',
      'view_shift_sales_report',
      'close_shift_cash_reconciliation',
      'customer_bon_credit'
    ]
  },
  {
    id: 'pos-3',
    name: 'Budi Santoso',
    role: 'Kasir POS',
    pin: '5678',
    status: 'Aktif',
    lastActive: 'Kemarin, 21:45 JST',
    shift: 'Sore (15:00 - 23:00)',
    allowedPermissions: [
      'pos_terminal_access',
      'reprint_receipt',
      'open_cash_drawer_manual',
      'park_resume_order',
      'void_pending_transaction',
      'view_shift_sales_report',
      'close_shift_cash_reconciliation'
    ]
  },
  {
    id: 'pos-4',
    name: 'Rina Marlina',
    role: 'Kasir POS',
    pin: '9012',
    status: 'Aktif',
    lastActive: '04 Okt 2026',
    shift: 'Weekend (Sabtu - Minggu)',
    allowedPermissions: [
      'pos_terminal_access',
      'reprint_receipt',
      'open_cash_drawer_manual',
      'park_resume_order',
      'void_pending_transaction',
      'view_shift_sales_report',
      'close_shift_cash_reconciliation'
    ]
  },
  {
    id: 'pos-5',
    name: 'Kenjiro Tanaka',
    role: 'Karyawan / Part-time Support',
    pin: '3456',
    status: 'Nonaktif',
    lastActive: '28 Sep 2026',
    shift: 'On Call',
    allowedPermissions: ['pos_terminal_access', 'reprint_receipt', 'park_resume_order']
  }
];

export const INITIAL_CONNECTED_PRINTERS: ConnectedPrinterProfile[] = [
  {
    id: 'printer-dp7645',
    name: 'DP7645III',
    connectionType: 'browser_driver',
    paperWidth: 57,
    rollDiameter: 47,
    osTarget: 'Windows',
    isDefault: true
  },
  {
    id: 'printer-onenote',
    name: 'OneNote for Windows 10',
    connectionType: 'browser_driver',
    paperWidth: 57,
    rollDiameter: 47,
    osTarget: 'Windows',
    isDefault: false
  },
  {
    id: 'printer-xps',
    name: 'Microsoft XPS Document Writer',
    connectionType: 'browser_driver',
    paperWidth: 57,
    rollDiameter: 47,
    osTarget: 'Windows',
    isDefault: false
  },
  {
    id: 'printer-pdf',
    name: 'Microsoft Print to PDF',
    connectionType: 'browser_driver',
    paperWidth: 57,
    rollDiameter: 47,
    osTarget: 'Windows',
    isDefault: false
  },
  {
    id: 'printer-canon-g2030',
    name: '\\\\SERVER\\Canon G2030 series',
    connectionType: 'browser_driver',
    paperWidth: 80,
    rollDiameter: 80,
    osTarget: 'Windows',
    isDefault: false
  },
  {
    id: 'printer-pos58-gen',
    name: 'POS-58 Series Thermal (Generic 57x47mm)',
    connectionType: 'browser_driver',
    paperWidth: 57,
    rollDiameter: 47,
    osTarget: 'Semua Perangkat',
    isDefault: false
  },
  {
    id: 'printer-mac-epson',
    name: 'Epson TM-T82 / TM-m30 (MacBook / macOS)',
    connectionType: 'browser_driver',
    paperWidth: 80,
    rollDiameter: 80,
    osTarget: 'Mac',
    isDefault: false
  }
];

export const DEFAULT_PRINTER_SETTINGS: ThermalPrinterSettings = {
  printerName: 'DP7645III',
  connectionType: 'browser_driver',
  paperWidth: 57, // Lebar Kertas mm (Default: 57)
  rollDiameter: 47, // Diameter Lingkaran mm (Default: 47)
  charPerLine: 32,
  fontSize: 'normal',
  autoCut: true,
  openCashDrawer: true,
  showLogo: true,
  storeName: 'SEMBAKO NUSANTARA JEPANG',
  storeAddress: '〒144-0051 Tokyo, Ota-ku, Nishikamata 5-9-16',
  storePhone: '+81 80-1122-3344',
  footerNote: 'Terima kasih telah berbelanja di Sembako Nusantara!',
  storePolicyNote: 'Komplain max 24 jam dengan video unboxing. Makanan dibuka tidak dapat diretur.',
  printCopies: 1,
  autoPrintOnCheckout: true,
  savedPrinters: INITIAL_CONNECTED_PRINTERS
};

export const getCleanPrinterSettings = (savedRaw: string | null): ThermalPrinterSettings => {
  if (!savedRaw) return DEFAULT_PRINTER_SETTINGS;
  try {
    const parsed = JSON.parse(savedRaw);
    if (parsed.footerNote) {
      parsed.footerNote = parsed.footerNote.replace(/🇮🇩🇯🇵|IDJP/g, '').trim();
    }

    let savedList: ConnectedPrinterProfile[] = Array.isArray(parsed.savedPrinters) ? [...parsed.savedPrinters] : [];

    // Merge default Windows printers from user's system if not present
    INITIAL_CONNECTED_PRINTERS.forEach((initP) => {
      const exists = savedList.some((p) => p.name.toLowerCase() === initP.name.toLowerCase());
      if (!exists) {
        savedList.push(initP);
      }
    });

    let activeName = parsed.printerName;
    if (!activeName || activeName === 'Thermal Receipt Printer (57x47mm)') {
      activeName = 'DP7645III';
    }

    const activeProfile = savedList.find((p) => p.name === activeName);

    return {
      ...DEFAULT_PRINTER_SETTINGS,
      ...parsed,
      printerName: activeName,
      paperWidth: activeProfile?.paperWidth || parsed.paperWidth || 57,
      rollDiameter: activeProfile?.rollDiameter || parsed.rollDiameter || 47,
      savedPrinters: savedList
    };
  } catch (e) {
    return DEFAULT_PRINTER_SETTINGS;
  }
};

export const SettingsPage: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'accounts' | 'printer' | 'stock_opname' | 'wa_gateway'
  const activeTab = searchParams.get('tab') === 'printer'
    ? 'printer'
    : searchParams.get('tab') === 'stock_opname'
    ? 'stock_opname'
    : searchParams.get('tab') === 'wa_gateway'
    ? 'wa_gateway'
    : 'accounts';

  // WhatsApp Gateway State
  const [waConfig, setWaConfig] = useState<WAGatewayConfig>(getWAGatewayConfig);
  const [waAdminPhone, setWaAdminPhone] = useState<string>(getAdminWAPhone);
  const [waTestPhone, setWaTestPhone] = useState('0895329332135');
  const [waTestMsg, setWaTestMsg] = useState('Halo Admin! Ini adalah tes koneksi notifikasi otomatis WhatsApp Gateway Sembako Nusantara Jepang.');
  const [isSendingWa, setIsSendingWa] = useState(false);
  const [waResultToast, setWaResultToast] = useState<{ success: boolean; text: string } | null>(null);

  // All system permissions master list
  const [permissions] = useState<CashierPermissionItem[]>(INITIAL_PERMISSIONS);

  // POS Accounts State (Kasir, SPV, Manager, Karyawan)
  const [cashiers, setCashiers] = useState<CashierAccount[]>(() => {
    const saved = localStorage.getItem('sn_cashier_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_CASHIERS;
  });

  // Thermal Printer Settings State
  const [printerSettings, setPrinterSettings] = useState<ThermalPrinterSettings>(() => {
    return getCleanPrinterSettings(localStorage.getItem('sn_pos_printer_settings'));
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MANAGER' | 'SPV' | 'KASIR' | 'KARYAWAN'>('ALL');

  // Add POS Account Modal State
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Kasir POS');
  const [customRole, setCustomRole] = useState('');
  const [newShift, setNewShift] = useState('Pagi (08:00 - 16:00)');
  const [newPin, setNewPin] = useState('1122');
  const [newPermissions, setNewPermissions] = useState<string[]>([
    'pos_terminal_access',
    'reprint_receipt',
    'open_cash_drawer_manual',
    'park_resume_order',
    'void_pending_transaction',
    'view_shift_sales_report',
    'close_shift_cash_reconciliation'
  ]);

  // Edit Account Details State
  const [editingAccountData, setEditingAccountData] = useState<CashierAccount | null>(null);

  // Edit Account Permissions Modal State
  const [editingPermissionsAccount, setEditingPermissionsAccount] = useState<CashierAccount | null>(null);
  const [currentEditingPerms, setCurrentEditingPerms] = useState<string[]>([]);

  const [accountToDelete, setAccountToDelete] = useState<CashierAccount | null>(null);

  // Sync with Supabase on mount
  useEffect(() => {
    const syncFromSupabase = async () => {
      try {
        // Sync POS Accounts
        const { data: accountsData } = await supabase.from('pos_accounts').select('*');
        if (accountsData && Array.isArray(accountsData) && accountsData.length > 0) {
          const mappedAccounts: CashierAccount[] = accountsData.map((d: any) => ({
            id: d.id,
            name: d.name,
            role: d.role,
            pin: d.pin,
            status: d.status,
            lastActive: d.last_active,
            shift: d.shift,
            allowedPermissions: d.allowed_permissions || []
          }));
          setCashiers(mappedAccounts);
          localStorage.setItem('sn_cashier_accounts', JSON.stringify(mappedAccounts));
        }

        // Sync Printer Settings
        const { data: printerData } = await supabase.from('printer_settings').select('*').limit(1).maybeSingle();
        if (printerData) {
          setPrinterSettings((prev) => {
            const updated: ThermalPrinterSettings = {
              ...prev,
              printerName: printerData.printer_name || prev.printerName,
              connectionType: printerData.connection_type || prev.connectionType,
              paperWidth: printerData.paper_width || prev.paperWidth,
              rollDiameter: printerData.roll_diameter || prev.rollDiameter,
              charPerLine: printerData.char_per_line || prev.charPerLine,
              fontSize: printerData.font_size || prev.fontSize,
              autoCut: printerData.auto_cut ?? prev.autoCut,
              openCashDrawer: printerData.open_cash_drawer ?? prev.openCashDrawer,
              showLogo: printerData.show_logo ?? prev.showLogo,
              storeName: printerData.store_name || prev.storeName,
              storeAddress: printerData.store_address || prev.storeAddress,
              storePhone: printerData.store_phone || prev.storePhone,
              footerNote: (printerData.footer_note || prev.footerNote).replace(/🇮🇩🇯🇵|IDJP/g, '').trim(),
              storePolicyNote: printerData.store_policy_note || prev.storePolicyNote,
              printCopies: printerData.print_copies || prev.printCopies,
              autoPrintOnCheckout: printerData.auto_print_on_checkout ?? prev.autoPrintOnCheckout
            };
            localStorage.setItem('sn_pos_printer_settings', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (e) {}
    };

    syncFromSupabase();
  }, []);

  // Modal Tambah Printer Kustom (Windows / Mac)
  const [showAddPrinterModal, setShowAddPrinterModal] = useState(false);
  const [newPrinterName, setNewPrinterName] = useState('');
  const [newPrinterConn, setNewPrinterConn] = useState<'browser_driver' | 'bluetooth' | 'usb_direct' | 'network_ip'>('browser_driver');
  const [newPrinterWidth, setNewPrinterWidth] = useState(57);
  const [newPrinterDiameter, setNewPrinterDiameter] = useState(47);
  const [newPrinterOs, setNewPrinterOs] = useState<'Windows' | 'Mac' | 'Semua Perangkat'>('Windows');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Pilih Printer Aktif
  const handleSelectActivePrinter = (printer: ConnectedPrinterProfile) => {
    const currentList = printerSettings.savedPrinters && printerSettings.savedPrinters.length > 0
      ? printerSettings.savedPrinters
      : INITIAL_CONNECTED_PRINTERS;

    const updatedPrinters = currentList.map((p) => ({
      ...p,
      isDefault: p.id === printer.id
    }));

    const newSettings: ThermalPrinterSettings = {
      ...printerSettings,
      printerName: printer.name,
      connectionType: printer.connectionType,
      paperWidth: printer.paperWidth,
      rollDiameter: printer.rollDiameter,
      savedPrinters: updatedPrinters
    };

    setPrinterSettings(newSettings);
    localStorage.setItem('sn_pos_printer_settings', JSON.stringify(newSettings));
    showToast(`Printer aktif diubah ke: "${printer.name}" (${printer.paperWidth}x${printer.rollDiameter} mm)`);
  };

  // Tambah Printer Baru ke Daftar
  const handleAddCustomPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterName.trim()) return;

    const newPrinter: ConnectedPrinterProfile = {
      id: `printer-${Date.now()}`,
      name: newPrinterName.trim(),
      connectionType: newPrinterConn,
      paperWidth: newPrinterWidth,
      rollDiameter: newPrinterDiameter,
      osTarget: newPrinterOs,
      isDefault: true
    };

    const currentList = printerSettings.savedPrinters && printerSettings.savedPrinters.length > 0
      ? printerSettings.savedPrinters
      : INITIAL_CONNECTED_PRINTERS;

    const updatedPrinters = [
      ...currentList.map((p) => ({ ...p, isDefault: false })),
      newPrinter
    ];

    const newSettings: ThermalPrinterSettings = {
      ...printerSettings,
      printerName: newPrinter.name,
      connectionType: newPrinter.connectionType,
      paperWidth: newPrinter.paperWidth,
      rollDiameter: newPrinter.rollDiameter,
      savedPrinters: updatedPrinters
    };

    setPrinterSettings(newSettings);
    localStorage.setItem('sn_pos_printer_settings', JSON.stringify(newSettings));
    showToast(`Printer "${newPrinter.name}" berhasil didaftarkan dan diaktifkan untuk kasir!`);
    setShowAddPrinterModal(false);
    setNewPrinterName('');
  };

  // Hapus Printer dari Daftar
  const handleDeletePrinter = (printerId: string, printerName: string) => {
    const currentList = printerSettings.savedPrinters && printerSettings.savedPrinters.length > 0
      ? printerSettings.savedPrinters
      : INITIAL_CONNECTED_PRINTERS;

    if (currentList.length <= 1) {
      alert('Minimal harus ada 1 printer terdaftar di sistem!');
      return;
    }

    const updatedPrinters = currentList.filter((p) => p.id !== printerId);
    let nextActive = printerSettings;
    if (printerSettings.printerName === printerName) {
      const fallback = updatedPrinters[0];
      nextActive = {
        ...printerSettings,
        printerName: fallback.name,
        connectionType: fallback.connectionType,
        paperWidth: fallback.paperWidth,
        rollDiameter: fallback.rollDiameter,
        savedPrinters: updatedPrinters.map((p, idx) => ({ ...p, isDefault: idx === 0 }))
      };
    } else {
      nextActive = {
        ...printerSettings,
        savedPrinters: updatedPrinters
      };
    }

    setPrinterSettings(nextActive);
    localStorage.setItem('sn_pos_printer_settings', JSON.stringify(nextActive));
    showToast(`Printer "${printerName}" berhasil dihapus dari daftar.`);
  };

  // Pindai Bluetooth Browser
  const handleScanBluetooth = async () => {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
        });
        if (device && device.name) {
          const newPrinter: ConnectedPrinterProfile = {
            id: `bt-${Date.now()}`,
            name: `${device.name} (Bluetooth)`,
            connectionType: 'bluetooth',
            paperWidth: 58,
            rollDiameter: 50,
            osTarget: 'Semua Perangkat',
            isDefault: true
          };
          const currentList = printerSettings.savedPrinters || INITIAL_CONNECTED_PRINTERS;
          const updatedPrinters = [
            ...currentList.map((p) => ({ ...p, isDefault: false })),
            newPrinter
          ];
          const newSettings: ThermalPrinterSettings = {
            ...printerSettings,
            printerName: newPrinter.name,
            connectionType: 'bluetooth',
            paperWidth: 58,
            rollDiameter: 50,
            savedPrinters: updatedPrinters
          };
          setPrinterSettings(newSettings);
          localStorage.setItem('sn_pos_printer_settings', JSON.stringify(newSettings));
          showToast(`Printer Bluetooth "${device.name}" terdeteksi dan diaktifkan!`);
        }
      } catch (err: any) {
        if (err.name !== 'NotFoundError') {
          showToast(`Pencarian Bluetooth dibatalkan.`);
        }
      }
    } else {
      showToast('Browser belum mengaktifkan Web Bluetooth. Gunakan Universal Driver Sistem Windows / Mac.');
    }
  };

  // Toggle Account Active / Inactive
  const handleToggleAccountStatus = (id: string) => {
    let nextStatus: 'Aktif' | 'Nonaktif' = 'Aktif';
    const updated = cashiers.map((c) => {
      if (c.id === id) {
        nextStatus = c.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    setCashiers(updated);
    localStorage.setItem('sn_cashier_accounts', JSON.stringify(updated));
    showToast('Status aktif akun POS berhasil diperbarui');

    // Sync to Supabase
    try {
      supabase.from('pos_accounts').update({ status: nextStatus }).eq('id', id).then(() => {}, () => {});
    } catch (e) {}
  };

  // Delete POS Account
  const handleDeleteAccount = () => {
    if (!accountToDelete) return;
    const deletedId = accountToDelete.id;
    const updated = cashiers.filter((c) => c.id !== deletedId);
    setCashiers(updated);
    localStorage.setItem('sn_cashier_accounts', JSON.stringify(updated));
    showToast(`Akun POS "${accountToDelete.name}" (${accountToDelete.role}) berhasil dihapus.`);
    setAccountToDelete(null);

    // Sync to Supabase
    try {
      supabase.from('pos_accounts').delete().eq('id', deletedId).then(() => {}, () => {});
    } catch (e) {}
  };

  // Preset Handlers for New POS Account
  const handleApplyPreset = (preset: 'spv' | 'kasir' | 'all' | 'clear') => {
    if (preset === 'all' || preset === 'spv') {
      setNewPermissions(permissions.map((p) => p.id));
    } else if (preset === 'kasir') {
      setNewPermissions([
        'pos_terminal_access',
        'reprint_receipt',
        'open_cash_drawer_manual',
        'park_resume_order',
        'void_pending_transaction',
        'view_shift_sales_report',
        'close_shift_cash_reconciliation'
      ]);
    } else if (preset === 'clear') {
      setNewPermissions([]);
    }
  };

  // Add POS Account Submit
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const assignedRole = newRole === 'CUSTOM' ? (customRole.trim() || 'Staf POS') : newRole;

    const newAcc: CashierAccount = {
      id: `pos-${Date.now()}`,
      name: newName.trim(),
      role: assignedRole,
      pin: newPin || '1234',
      status: 'Aktif',
      lastActive: 'Baru Dibuat',
      shift: newShift,
      allowedPermissions: newPermissions
    };

    const updated = [...cashiers, newAcc];
    setCashiers(updated);
    localStorage.setItem('sn_cashier_accounts', JSON.stringify(updated));

    setShowAddAccountModal(false);
    setNewName('');
    setNewRole('Kasir POS');
    setCustomRole('');
    setNewPin('1122');
    showToast(`Akun POS "${newAcc.name}" (${newAcc.role}) berhasil disimpan dengan ${newPermissions.length} hak akses!`);

    // Sync to Supabase
    try {
      supabase.from('pos_accounts').upsert({
        id: newAcc.id,
        name: newAcc.name,
        role: newAcc.role,
        pin: newAcc.pin,
        status: newAcc.status,
        last_active: newAcc.lastActive,
        shift: newAcc.shift,
        allowed_permissions: newAcc.allowedPermissions
      }).then(() => {}, () => {});
    } catch (e) {}
  };

  // Save Edit Account Info (Name, Role, Shift, PIN)
  const handleSaveEditAccountData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccountData) return;

    const updated = cashiers.map((c) => {
      if (c.id === editingAccountData.id) {
        return editingAccountData;
      }
      return c;
    });

    setCashiers(updated);
    localStorage.setItem('sn_cashier_accounts', JSON.stringify(updated));
    showToast(`Data akun "${editingAccountData.name}" berhasil diperbarui!`);

    // Sync to Supabase
    try {
      supabase.from('pos_accounts').update({
        name: editingAccountData.name,
        role: editingAccountData.role,
        shift: editingAccountData.shift,
        pin: editingAccountData.pin
      }).eq('id', editingAccountData.id).then(() => {}, () => {});
    } catch (e) {}

    setEditingAccountData(null);
  };

  // Save Edit Permissions
  const handleSaveEditedPermissions = () => {
    if (!editingPermissionsAccount) return;
    const targetId = editingPermissionsAccount.id;
    const updated = cashiers.map((c) => {
      if (c.id === targetId) {
        return { ...c, allowedPermissions: currentEditingPerms };
      }
      return c;
    });
    setCashiers(updated);
    localStorage.setItem('sn_cashier_accounts', JSON.stringify(updated));
    showToast(`Hak akses untuk "${editingPermissionsAccount.name}" berhasil disimpan (${currentEditingPerms.length} izin)!`);

    // Sync to Supabase
    try {
      supabase.from('pos_accounts').update({
        allowed_permissions: currentEditingPerms
      }).eq('id', targetId).then(() => {}, () => {});
    } catch (e) {}

    setEditingPermissionsAccount(null);
  };

  // Save Printer Settings
  const handleSavePrinterSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('sn_pos_printer_settings', JSON.stringify(printerSettings));
    showToast(`Pengaturan printer thermal (${printerSettings.paperWidth}x${printerSettings.rollDiameter} mm) berhasil disimpan!`);

    // Sync to Supabase
    try {
      supabase.from('printer_settings').upsert({
        id: 'default',
        printer_name: printerSettings.printerName,
        connection_type: printerSettings.connectionType,
        ip_address: printerSettings.ipAddress || null,
        paper_width: printerSettings.paperWidth,
        roll_diameter: printerSettings.rollDiameter,
        char_per_line: printerSettings.charPerLine,
        font_size: printerSettings.fontSize,
        auto_cut: printerSettings.autoCut,
        open_cash_drawer: printerSettings.openCashDrawer,
        show_logo: printerSettings.showLogo,
        store_name: printerSettings.storeName,
        store_address: printerSettings.storeAddress,
        store_phone: printerSettings.storePhone,
        footer_note: printerSettings.footerNote,
        store_policy_note: printerSettings.storePolicyNote,
        print_copies: printerSettings.printCopies,
        auto_print_on_checkout: printerSettings.autoPrintOnCheckout
      }).then(() => {}, () => {});
    } catch (e) {}
  };

  // Test Print Thermal Receipt
  const handleTestPrint = () => {
    // Inject dynamic print styling for the exact paper width
    const existingStyle = document.getElementById('thermal-print-override');
    if (existingStyle) existingStyle.remove();

    const styleEl = document.createElement('style');
    styleEl.id = 'thermal-print-override';
    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${printerSettings.paperWidth}mm auto;
          margin: 0mm;
        }
        body * {
          visibility: hidden !important;
        }
        #thermal-receipt-preview-area, #thermal-receipt-preview-area * {
          visibility: visible !important;
        }
        #thermal-receipt-preview-area {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: ${printerSettings.paperWidth}mm !important;
          max-width: ${printerSettings.paperWidth}mm !important;
          margin: 0 !important;
          padding: 2mm 3mm !important;
          background: white !important;
          color: black !important;
          font-family: 'Courier New', Courier, monospace !important;
          font-size: ${printerSettings.fontSize === 'small' ? '10px' : printerSettings.fontSize === 'large' ? '13px' : '11px'} !important;
          box-shadow: none !important;
          border: none !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    handleSavePrinterSettings();
    window.print();
  };

  // Filter accounts
  const filteredCashiers = cashiers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shift.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'MANAGER') {
      return c.role.toLowerCase().includes('manager');
    }
    if (roleFilter === 'SPV') {
      return c.role.toLowerCase().includes('spv') || c.role.toLowerCase().includes('supervisor');
    }
    if (roleFilter === 'KASIR') {
      return c.role.toLowerCase().includes('kasir');
    }
    if (roleFilter === 'KARYAWAN') {
      return (
        !c.role.toLowerCase().includes('manager') &&
        !c.role.toLowerCase().includes('spv') &&
        !c.role.toLowerCase().includes('supervisor') &&
        !c.role.toLowerCase().includes('kasir')
      );
    }
    return true;
  });

  const getRoleBadgeStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('manager')) {
      return 'bg-purple-100 text-purple-900 border-purple-300 font-black';
    }
    if (r.includes('spv') || r.includes('supervisor')) {
      return 'bg-blue-100 text-blue-900 border-blue-300 font-black';
    }
    if (r.includes('kasir')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
    }
    return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
  };

  return (
    <AdminLayout
      title={
        language === 'JP'
          ? '設定・システム管理'
          : language === 'EN'
          ? 'System Settings'
          : 'Pengaturan Sistem & POS'
      }
      subtitle={
        activeTab === 'stock_opname'
          ? 'Audit fisik dan penyesuaian persediaan barang toko (Stok Opname). Mendukung input manual per produk dan upload massal file CSV.'
          : activeTab === 'printer'
          ? 'Konfigurasi printer thermal nota kasir, ukuran kertas (default 57x47 mm), dan integrasi cetak POS.'
          : 'Kelola akun login mesin POS untuk Store Manager, Supervisor (SPV), Kasir, dan Karyawan Toko beserta hak akses fiturnya.'
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Floating Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined text-emerald-400">check_circle</span>
            <span className="text-xs sm:text-sm font-semibold">{notification}</span>
          </div>
        )}

        {/* Tab Navigation Switcher: Akun POS vs Atur Printer Thermal vs Stok Opname */}
        <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 pb-3">
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'accounts' })}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-[#c41230] text-white shadow-md'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            <span>Kelola Akun POS (Kasir, SPV, Manager)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
              {cashiers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'printer' })}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'printer'
                ? 'bg-[#c41230] text-white shadow-md'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-lg">print</span>
            <span>Atur Printer Thermal (Nota Kasir)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              {printerSettings.paperWidth}x{printerSettings.rollDiameter} mm
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'stock_opname' })}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stock_opname'
                ? 'bg-[#c41230] text-white shadow-md'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-lg">fact_check</span>
            <span>Stok Opname (Audit Fisik Inventori)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
              Massal & Manual
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'wa_gateway' })}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'wa_gateway'
                ? 'bg-[#c41230] text-white shadow-md'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-emerald-600">chat</span>
            <span>WhatsApp Gateway</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {waConfig.sessionId}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: KELOLA AKUN POS (KASIR, SPV, MANAGER, KARYAWAN)                     */}
        {/* ========================================================================= */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {/* Top Header Card */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-stone-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#c41230]/20 border border-[#c41230]/40 flex items-center justify-center text-[#ff4d6d] text-2xl shrink-0">
                  <span className="material-symbols-outlined text-3xl">badge</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                      Sub-Menu: Akun POS & Hak Akses
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      {cashiers.length} Akun Terdaftar
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                    Kelola Akun POS (Kasir, SPV, Manager, Karyawan)
                  </h2>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Hak akses fitur sensitif (diskon manual, void transaksi, buka laci, refund, closing) ditentukan langsung per akun saat dibuat dan bisa diedit kapan saja.
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <button
                  onClick={() => {
                    setNewName('');
                    setNewRole('Kasir POS');
                    setNewPin('1122');
                    setNewPermissions([
                      'pos_terminal_access',
                      'reprint_receipt',
                      'open_cash_drawer_manual',
                      'park_resume_order',
                      'void_pending_transaction',
                      'view_shift_sales_report',
                      'close_shift_cash_reconciliation'
                    ]);
                    setShowAddAccountModal(true);
                  }}
                  className="w-full md:w-auto px-5 py-3 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  <span>+ Tambah Akun POS</span>
                </button>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama staf, jabatan, shift..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230] focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    roleFilter === 'ALL'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  Semua Akun ({cashiers.length})
                </button>
                <button
                  onClick={() => setRoleFilter('MANAGER')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    roleFilter === 'MANAGER'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-800'
                  }`}
                >
                  Store Manager
                </button>
                <button
                  onClick={() => setRoleFilter('SPV')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    roleFilter === 'SPV'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                  }`}
                >
                  Supervisor (SPV)
                </button>
                <button
                  onClick={() => setRoleFilter('KASIR')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    roleFilter === 'KASIR'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Kasir POS
                </button>
                <button
                  onClick={() => setRoleFilter('KARYAWAN')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    roleFilter === 'KARYAWAN'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                  }`}
                >
                  Karyawan / Staf
                </button>
              </div>
            </div>

            {/* List of POS Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCashiers.map((c) => {
                const assignedCount = c.allowedPermissions ? c.allowedPermissions.length : 7;
                const isManagerOrSpv =
                  c.role.toLowerCase().includes('manager') ||
                  c.role.toLowerCase().includes('spv') ||
                  c.role.toLowerCase().includes('supervisor');

                return (
                  <div
                    key={c.id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                            isManagerOrSpv
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {c.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-stone-900 text-base">{c.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getRoleBadgeStyle(c.role)}`}>
                              {c.role}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.status === 'Aktif'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>

                          <p className="text-xs text-stone-500">Shift: {c.shift}</p>

                          <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-0.5">
                            <span>PIN Login: <strong className="text-stone-700 font-mono tracking-widest">••••</strong></span>
                            <span>Aktif: <strong className="text-stone-600">{c.lastActive}</strong></span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        {assignedCount} dari {permissions.length} Hak Akses
                      </span>
                    </div>

                    {/* Account Action Buttons */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPermissionsAccount(c);
                            setCurrentEditingPerms(c.allowedPermissions || permissions.map((p) => p.id));
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all flex items-center gap-1 cursor-pointer"
                          title="Ubah checklist hak akses khusus untuk akun ini"
                        >
                          <span className="material-symbols-outlined text-sm text-amber-700">tune</span>
                          <span>Hak Akses ({assignedCount})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingAccountData({ ...c })}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all flex items-center gap-1 cursor-pointer"
                          title="Edit Nama, Jabatan, Shift, atau PIN"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>Edit Data</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleAccountStatus(c.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            c.status === 'Aktif'
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {c.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setAccountToDelete(c)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                          title="Hapus akun POS ini secara permanen"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ATUR PRINTER THERMAL NOTA KASIR (ESC/POS)                           */}
        {/* ========================================================================= */}
        {activeTab === 'printer' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-stone-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl shrink-0">
                  <span className="material-symbols-outlined text-3xl">print</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      Sub-Menu: Atur Printer Thermal POS
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-xs">
                      Default: {printerSettings.paperWidth} x {printerSettings.rollDiameter} mm
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                    Pengaturan Printer Thermal Nota Kasir POS
                  </h2>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Mendukung semua jenis printer thermal (Bluetooth, USB, WiFi/LAN, Driver Sistem). Pengaturan ini otomatis tersambung ke menu Kasir POS saat mencetak nota.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleTestPrint}
                  className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span>Tes Cetak Nota ({printerSettings.paperWidth}mm)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePrinterSettings()}
                  className="flex-1 md:flex-initial px-4 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Simpan Pengaturan</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Settings (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Ukuran Kertas & Diameter Gulungan (Sesuai Permintaan User) */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-emerald-600">receipt_long</span>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Ukuran Kertas & Diameter Roll Thermal
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Rekomendasi: 57x47 mm
                    </span>
                  </div>

                  {/* Preset Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2">
                      Pilihan Preset Ukuran Kertas Cepat:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPrinterSettings({
                            ...printerSettings,
                            paperWidth: 57,
                            rollDiameter: 47,
                            charPerLine: 32
                          })
                        }
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          printerSettings.paperWidth === 57 && printerSettings.rollDiameter === 47
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="text-xs font-black">⭐ 57 x 47 mm</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">Default Kasir</div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPrinterSettings({
                            ...printerSettings,
                            paperWidth: 58,
                            rollDiameter: 50,
                            charPerLine: 32
                          })
                        }
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          printerSettings.paperWidth === 58
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="text-xs font-black">58 x 50 mm</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">Mini Bluetooth</div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPrinterSettings({
                            ...printerSettings,
                            paperWidth: 80,
                            rollDiameter: 80,
                            charPerLine: 48
                          })
                        }
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          printerSettings.paperWidth === 80
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className="text-xs font-black">80 x 80 mm</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">Standard POS Besar</div>
                      </button>
                    </div>
                  </div>

                  {/* Manual / Custom Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Lebar Kertas (mm):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={40}
                          max={120}
                          value={printerSettings.paperWidth}
                          onChange={(e) =>
                            setPrinterSettings({
                              ...printerSettings,
                              paperWidth: Math.max(40, parseInt(e.target.value) || 57)
                            })
                          }
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-bold">
                          mm
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        Default: <strong>57 mm</strong>
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Diameter Roll (mm):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={20}
                          max={100}
                          value={printerSettings.rollDiameter}
                          onChange={(e) =>
                            setPrinterSettings({
                              ...printerSettings,
                              rollDiameter: Math.max(20, parseInt(e.target.value) || 47)
                            })
                          }
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-bold">
                          mm
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        Default: <strong>47 mm</strong>
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Karakter / Baris:
                      </label>
                      <input
                        type="number"
                        min={24}
                        max={64}
                        value={printerSettings.charPerLine}
                        onChange={(e) =>
                          setPrinterSettings({
                            ...printerSettings,
                            charPerLine: parseInt(e.target.value) || 32
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                      />
                      <span className="text-[10px] text-stone-500 mt-0.5 block">
                        57mm = 32 CPL
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Koneksi & Pilihan Printer Terhubung di Windows / MacBook */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-blue-600">settings_input_hdmi</span>
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm">
                          Pilihan Printer Terhubung (Windows & MacBook)
                        </h3>
                        <p className="text-[11px] text-stone-500">
                          Pilih printer mana saja yang tersambung ke komputer Windows atau laptop MacBook Anda
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handleScanBluetooth}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Pindai printer bluetooth di dekat komputer"
                      >
                        <span className="material-symbols-outlined text-sm">bluetooth_searching</span>
                        <span>Pindai BT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPrinterModal(true)}
                        className="px-3 py-1.5 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>Tambah Printer Lain</span>
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Pemilihan Cepat */}
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-[#c41230]">print</span>
                        <span>Printer :</span>
                      </label>
                      <span className="text-[11px] text-stone-500 font-medium">
                        Pilih printer yang terhubung di Windows / macOS Anda
                      </span>
                    </div>
                    <select
                      value={
                        (printerSettings.savedPrinters || INITIAL_CONNECTED_PRINTERS).find(
                          (p) => p.name === printerSettings.printerName
                        )?.id || ''
                      }
                      onChange={(e) => {
                        const sel = (printerSettings.savedPrinters || INITIAL_CONNECTED_PRINTERS).find(
                          (p) => p.id === e.target.value
                        );
                        if (sel) handleSelectActivePrinter(sel);
                      }}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c41230] shadow-xs cursor-pointer"
                    >
                      {(printerSettings.savedPrinters || INITIAL_CONNECTED_PRINTERS).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.paperWidth ? `(${p.paperWidth}x${p.rollDiameter || 47} mm)` : ''} {p.name === printerSettings.printerName ? '★ [AKTIF DI KASIR]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* List Daftar Printer Terdaftar */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-stone-700">
                      Daftar Profil Printer Tersimpan di Komputer Kasir:
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                      {(printerSettings.savedPrinters || INITIAL_CONNECTED_PRINTERS).map((p) => {
                        const isCurrentActive = printerSettings.printerName === p.name;
                        return (
                          <div
                            key={p.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              isCurrentActive
                                ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/50'
                                : 'bg-stone-50/70 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl shrink-0">
                                {p.osTarget === 'Windows' ? '🪟' : p.osTarget === 'Mac' ? '🍏' : '🖨️'}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs text-stone-900 truncate">
                                    {p.name}
                                  </span>
                                  <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded text-[9px] font-bold">
                                    {p.paperWidth}x{p.rollDiameter} mm
                                  </span>
                                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[9px] font-semibold">
                                    {p.osTarget || 'Universal'}
                                  </span>
                                  {isCurrentActive && (
                                    <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-black">
                                      ★ AKTIF DI KASIR
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-stone-500 mt-0.5">
                                  Koneksi: {p.connectionType === 'browser_driver' ? 'Driver Sistem OS' : p.connectionType === 'bluetooth' ? 'Bluetooth Direct' : p.connectionType === 'usb_direct' ? 'USB Raw' : 'Network LAN'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!isCurrentActive ? (
                                <button
                                  type="button"
                                  onClick={() => handleSelectActivePrinter(p)}
                                  className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  Gunakan
                                </button>
                              ) : (
                                <span className="text-emerald-700 text-xs font-bold flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                  <span>Dipakai</span>
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeletePrinter(p.id, p.name)}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus printer ini"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Petunjuk Praktis Koneksi Windows & Mac */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-amber-950">
                      <span className="material-symbols-outlined text-sm text-amber-700">info</span>
                      <span>Daftar Printer Perangkat Windows Anda (Tersinkronisasi Otomatis):</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-stone-700">
                      <li>
                        <strong>DP7645III (Printer Kasir Default)</strong>: Sudah aktif dengan ukuran nota <strong>57x47 mm</strong>. Anda dapat langsung mencetak struk kasir tanpa perlu konfigurasi tambahan.
                      </li>
                      <li>
                        <strong>Printer Lain Terhubung</strong>: Printer seperti <em>\\SERVER\Canon G2030 series</em>, <em>Microsoft Print to PDF</em>, <em>Microsoft XPS Document Writer</em>, dan <em>OneNote for Windows 10</em> dapat dipilih langsung melalui menu dropdown <strong>Printer :</strong> di atas maupun langsung di modal struk POS Kasir.
                      </li>
                      <li>
                        Saat kasir menekan tombol <strong>Cetak Nota</strong>, sistem akan langsung menyesuaikan ukuran kertas dan format cetak ke printer yang aktif.
                      </li>
                    </ul>
                  </div>

                  {/* Konfigurasi Detail Printer Aktif */}
                  <div className="pt-2 border-t border-stone-200 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Edit Nama Label Printer Aktif:
                      </label>
                      <input
                        type="text"
                        value={printerSettings.printerName}
                        onChange={(e) => setPrinterSettings({ ...printerSettings, printerName: e.target.value })}
                        placeholder="Contoh: POS-58 Series Thermal / Epson TM-T82"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Metode Koneksi Printer:
                      </label>
                      <select
                        value={printerSettings.connectionType}
                        onChange={(e) =>
                          setPrinterSettings({
                            ...printerSettings,
                            connectionType: e.target.value as any
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                      >
                        <option value="browser_driver">
                          Universal Driver Sistem (USB / Bluetooth / Virtual Windows & Mac) - Direkomendasikan
                        </option>
                        <option value="bluetooth">
                          Bluetooth Direct Mobile (Printer Thermal Bluetooth 58mm Portable)
                        </option>
                        <option value="network_ip">
                          Network LAN / WiFi ESC/POS (IP Printer Kasir Toko)
                        </option>
                        <option value="usb_direct">
                          USB Direct WebSerial / WebUSB (ESC/POS Raw)
                        </option>
                      </select>
                    </div>

                    {printerSettings.connectionType === 'network_ip' && (
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Alamat IP Printer LAN / WiFi (ESC/POS Port 9100):
                        </label>
                        <input
                          type="text"
                          value={printerSettings.ipAddress || '192.168.1.200'}
                          onChange={(e) => setPrinterSettings({ ...printerSettings, ipAddress: e.target.value })}
                          placeholder="192.168.1.200"
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Kontrol Perilaku Kasir & Laci Uang */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-purple-600">tune</span>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Opsi Cetak & Integrasi Mesin POS
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={printerSettings.autoPrintOnCheckout}
                        onChange={(e) =>
                          setPrinterSettings({ ...printerSettings, autoPrintOnCheckout: e.target.checked })
                        }
                        className="h-4 w-4 rounded text-[#c41230] focus:ring-[#c41230]"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900">Auto-Print Transaksi</div>
                        <div className="text-[10px] text-stone-500">Cetak otomatis saat bayar lunas</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={printerSettings.openCashDrawer}
                        onChange={(e) =>
                          setPrinterSettings({ ...printerSettings, openCashDrawer: e.target.checked })
                        }
                        className="h-4 w-4 rounded text-[#c41230] focus:ring-[#c41230]"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900">Buka Laci Uang (Kick)</div>
                        <div className="text-[10px] text-stone-500">Sinyal buka laci kasir otomatis</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={printerSettings.autoCut}
                        onChange={(e) =>
                          setPrinterSettings({ ...printerSettings, autoCut: e.target.checked })
                        }
                        className="h-4 w-4 rounded text-[#c41230] focus:ring-[#c41230]"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900">Auto-Cut Kertas</div>
                        <div className="text-[10px] text-stone-500">Perintah potong kertas otomatis</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={printerSettings.showLogo}
                        onChange={(e) =>
                          setPrinterSettings({ ...printerSettings, showLogo: e.target.checked })
                        }
                        className="h-4 w-4 rounded text-[#c41230] focus:ring-[#c41230]"
                      />
                      <div>
                        <div className="font-bold text-xs text-stone-900">Tampilkan Logo Toko</div>
                        <div className="text-[10px] text-stone-500">Logo Sembako Nusantara</div>
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Ukuran Font Nota:</label>
                      <select
                        value={printerSettings.fontSize}
                        onChange={(e) =>
                          setPrinterSettings({ ...printerSettings, fontSize: e.target.value as any })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="small">Kecil (Hemat Kertas)</option>
                        <option value="normal">Normal (Standar Jelas)</option>
                        <option value="large">Besar (Mudah Dibaca)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Jumlah Salinan Struk:</label>
                      <select
                        value={printerSettings.printCopies}
                        onChange={(e) =>
                          setPrinterSettings({ ...printerSettings, printCopies: parseInt(e.target.value) || 1 })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="1">1 Rangkap (Untuk Pelanggan)</option>
                        <option value="2">2 Rangkap (Pelanggan + Arsip Toko)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Teks Header & Footer Struk */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-amber-600">notes</span>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Informasi Toko pada Struk / Nota
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Nama Usaha / Toko:</label>
                      <input
                        type="text"
                        value={printerSettings.storeName}
                        onChange={(e) => setPrinterSettings({ ...printerSettings, storeName: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Alamat Toko di Jepang:</label>
                      <input
                        type="text"
                        value={printerSettings.storeAddress}
                        onChange={(e) => setPrinterSettings({ ...printerSettings, storeAddress: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">No. Telp / WhatsApp CS:</label>
                      <input
                        type="text"
                        value={printerSettings.storePhone}
                        onChange={(e) => setPrinterSettings({ ...printerSettings, storePhone: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Pesan Ucapan Terima Kasih (Footer):</label>
                      <input
                        type="text"
                        value={printerSettings.footerNote}
                        onChange={(e) => setPrinterSettings({ ...printerSettings, footerNote: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Catatan Kebijakan Retur / Komplain:</label>
                      <textarea
                        rows={2}
                        value={printerSettings.storePolicyNote}
                        onChange={(e) => setPrinterSettings({ ...printerSettings, storePolicyNote: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Thermal Receipt Preview & Action Buttons (5 cols) */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-emerald-600">visibility</span>
                      <h4 className="font-bold text-stone-900 text-sm">
                        Live Preview Nota Thermal
                      </h4>
                    </div>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {printerSettings.paperWidth} mm
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    Berikut adalah simulasi visual nota kasir yang akan keluar dari printer thermal <strong>{printerSettings.paperWidth}x{printerSettings.rollDiameter} mm</strong>:
                  </p>

                  {/* Printable Thermal Receipt Box */}
                  <div className="flex justify-center p-3 bg-stone-100 rounded-2xl overflow-hidden">
                    <div
                      id="thermal-receipt-preview-area"
                      style={{
                        width: `${Math.min(320, printerSettings.paperWidth * 4.5)}px`
                      }}
                      className="bg-white p-4 shadow-md rounded-md text-stone-900 font-mono text-[11px] leading-tight space-y-2 border-t-4 border-stone-900 transition-all select-none"
                    >
                      {/* Header */}
                      <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-stone-400">
                        {printerSettings.showLogo && (
                          <div className="text-xs font-black tracking-wider text-[#c41230] mb-0.5 font-sans">
                            せんばこ ぬさんたら にほん
                          </div>
                        )}
                        <div className="font-bold text-xs uppercase">{printerSettings.storeName}</div>
                        <div className="text-[9px] text-stone-600 leading-tight">{printerSettings.storeAddress}</div>
                        <div className="text-[9px] text-stone-600">Telp: {printerSettings.storePhone}</div>
                      </div>

                      {/* Metadata */}
                      <div className="text-[10px] space-y-0.5 py-1 border-b border-dashed border-stone-400">
                        <div className="flex justify-between">
                          <span>No: SN-POS-88910</span>
                          <span>{new Date().toLocaleDateString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kasir: Siti Rahmawati</span>
                          <span>Shift: Pagi</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pelanggan: Walk-in (Umum)</span>
                          <span>14:30 JST</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="py-1 space-y-1.5 border-b border-dashed border-stone-400 text-[10px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">Indomie Goreng (DUS)</div>
                            <div className="text-[9px] text-stone-500">¥4,500 × 1</div>
                          </div>
                          <div className="font-bold">¥4,500</div>
                        </div>

                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">Kecap Bango 550ml</div>
                            <div className="text-[9px] text-stone-500">¥450 × 2</div>
                          </div>
                          <div className="font-bold">¥900</div>
                        </div>

                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">Teh Botol Kotak 250ml</div>
                            <div className="text-[9px] text-stone-500">¥120 × 3</div>
                          </div>
                          <div className="font-bold">¥360</div>
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="text-[10px] space-y-0.5 py-1 border-b border-dashed border-stone-400">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>¥5,760</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pajak Konsumsi (8%):</span>
                          <span>¥460</span>
                        </div>
                        <div className="flex justify-between font-bold text-xs pt-1 border-t border-stone-300">
                          <span>TOTAL BAYAR:</span>
                          <span>¥6,220</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span>Metode Bayar (Tunai JPY):</span>
                          <span>¥10,000</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>KEMBALIAN:</span>
                          <span>¥3,780</span>
                        </div>
                      </div>

                      {/* Footer Notes */}
                      <div className="text-center text-[9px] text-stone-600 pt-2 space-y-1">
                        <div className="font-bold">{printerSettings.footerNote}</div>
                        <div className="text-[8px] text-stone-500 leading-tight">
                          {printerSettings.storePolicyNote}
                        </div>
                        <div className="font-mono text-[9px] pt-1 tracking-widest text-stone-400">
                          *SN-TEST-RECEIPT-57MM*
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Test & Save Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleTestPrint}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span className="material-symbols-outlined text-base">print</span>
                      <span>Tes Cetak Nota Thermal ({printerSettings.paperWidth} mm)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSavePrinterSettings()}
                      className="w-full py-3 bg-[#c41230] hover:bg-[#a80f28] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span className="material-symbols-outlined text-base">save</span>
                      <span>Simpan Pengaturan Printer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL AREA (TAMBAH AKUN, EDIT DATA, ATUR HAK AKSES, HAPUS AKUN)           */}
        {/* ========================================================================= */}

        {/* MODAL 1: TAMBAH AKUN POS BARU */}
        {showAddAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-stone-200 text-stone-900 relative">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">👤</span>
                  <div>
                    <h3 className="font-heading font-black text-lg text-stone-900">
                      Tambah Akun POS Baru
                    </h3>
                    <p className="text-xs text-stone-500">
                      Buat akun untuk Kasir, Supervisor (SPV), Manager, atau Karyawan Toko & tentukan hak aksesnya
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddAccountModal(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nama Lengkap Staf / Karyawan:
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Contoh: Willy Pratama"
                      required
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Peran / Jabatan (Role):
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewRole(val);
                        if (val.includes('Manager') || val.includes('Supervisor') || val.includes('SPV')) {
                          handleApplyPreset('spv');
                        } else if (val.includes('Kasir')) {
                          handleApplyPreset('kasir');
                        }
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    >
                      <option value="Kasir POS">Kasir POS (Staf Kasir Reguler)</option>
                      <option value="Supervisor (SPV)">Supervisor (SPV) Toko</option>
                      <option value="Store Manager">Store Manager (Kepala Toko)</option>
                      <option value="Karyawan / Staf Toko">Karyawan / Staf Toko / Gudang</option>
                      <option value="Admin Kasir">Admin Kasir & Backoffice</option>
                      <option value="CUSTOM">Lainnya (Tulis Manual...)</option>
                    </select>

                    {newRole === 'CUSTOM' && (
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="Ketik jabatan kustom..."
                        className="mt-2 w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Shift Kerja:</label>
                    <select
                      value={newShift}
                      onChange={(e) => setNewShift(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    >
                      <option value="Pagi (08:00 - 16:00)">Pagi (08:00 - 16:00)</option>
                      <option value="Sore (15:00 - 23:00)">Sore (15:00 - 23:00)</option>
                      <option value="Weekend (Sabtu-Minggu)">Weekend (Sabtu-Minggu)</option>
                      <option value="Full Time">Full Time (Fleksibel)</option>
                      <option value="On Call">On Call / Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">PIN Login (4 Angka):</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="1234"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="p-3 bg-stone-100/80 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[11px] text-stone-600 font-bold">
                    Preset Rekomendasi Hak Akses:
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('spv')}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold rounded-lg border border-purple-200 transition-colors cursor-pointer"
                    >
                      👑 Preset SPV/Manager (Semua)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('kasir')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                    >
                      ⭐ Preset Kasir Standar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('clear')}
                      className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      ✕ Kosongkan
                    </button>
                  </div>
                </div>

                {/* Checklist Hak Akses Langsung */}
                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-[#c41230]">checklist</span>
                      <label className="font-bold text-xs text-stone-900">
                        Checklist Hak Akses Fitur POS:
                      </label>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
                        {newPermissions.length} dari {permissions.length} Dipilih
                      </span>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 p-2.5 bg-stone-50 rounded-2xl border border-stone-200">
                    {permissions.map((perm) => {
                      const isChecked = newPermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-white border-[#c41230]/40 shadow-xs'
                              : 'bg-white/60 border-stone-200 opacity-60 hover:opacity-90'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewPermissions([...newPermissions, perm.id]);
                              } else {
                                setNewPermissions(newPermissions.filter((id) => id !== perm.id));
                              }
                            }}
                            className="mt-0.5 h-4 w-4 rounded text-[#c41230] focus:ring-[#c41230] border-stone-300 cursor-pointer"
                          />
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-stone-900">{perm.label}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  perm.category === 'operasional'
                                    ? 'bg-blue-100 text-blue-800'
                                    : perm.category === 'diskon_harga'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {perm.category === 'operasional'
                                  ? 'Operasional'
                                  : perm.category === 'diskon_harga'
                                  ? 'Diskon & Void'
                                  : 'Keuangan'}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                              {perm.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddAccountModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Simpan Akun POS</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT DATA AKUN POS */}
        {editingAccountData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-stone-900 relative">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-stone-700">edit</span>
                  <h3 className="font-heading font-black text-lg text-stone-900">
                    Edit Data Akun POS
                  </h3>
                </div>
                <button
                  onClick={() => setEditingAccountData(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveEditAccountData} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nama Staf / Karyawan:</label>
                  <input
                    type="text"
                    value={editingAccountData.name}
                    onChange={(e) => setEditingAccountData({ ...editingAccountData, name: e.target.value })}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Peran / Jabatan:</label>
                  <input
                    type="text"
                    value={editingAccountData.role}
                    onChange={(e) => setEditingAccountData({ ...editingAccountData, role: e.target.value })}
                    placeholder="Contoh: Store Manager / Supervisor / Kasir POS"
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Shift Kerja:</label>
                    <input
                      type="text"
                      value={editingAccountData.shift}
                      onChange={(e) => setEditingAccountData({ ...editingAccountData, shift: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">PIN Login (4 Angka):</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={editingAccountData.pin}
                      onChange={(e) => setEditingAccountData({ ...editingAccountData, pin: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAccountData(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ATUR HAK AKSES PADA AKUN POS */}
        {editingPermissionsAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-stone-200 text-stone-900 relative">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-amber-600">tune</span>
                  <div>
                    <h3 className="font-heading font-black text-lg text-stone-900">
                      Atur Hak Akses: {editingPermissionsAccount.name}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Jabatan: <strong className="text-stone-700">{editingPermissionsAccount.role}</strong> • Shift: {editingPermissionsAccount.shift}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingPermissionsAccount(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto pr-1 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-stone-700">
                    {currentEditingPerms.length} dari {permissions.length} Hak Akses Diizinkan
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentEditingPerms(permissions.map((p) => p.id))}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200 cursor-pointer"
                    >
                      ✓ Centang Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentEditingPerms([])}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-bold rounded-lg border border-stone-200 cursor-pointer"
                    >
                      ✕ Kosongkan Semua
                    </button>
                  </div>
                </div>

                <div className="space-y-2 p-2.5 bg-stone-50 rounded-2xl border border-stone-200">
                  {permissions.map((perm) => {
                    const isChecked = currentEditingPerms.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-white border-[#c41230]/40 shadow-xs'
                            : 'bg-white/60 border-stone-200 opacity-60 hover:opacity-90'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCurrentEditingPerms([...currentEditingPerms, perm.id]);
                            } else {
                              setCurrentEditingPerms(currentEditingPerms.filter((id) => id !== perm.id));
                            }
                          }}
                          className="mt-0.5 h-4 w-4 rounded text-[#c41230] focus:ring-[#c41230] border-stone-300 cursor-pointer"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-stone-900">{perm.label}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                perm.category === 'operasional'
                                  ? 'bg-blue-100 text-blue-800'
                                  : perm.category === 'diskon_harga'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {perm.category === 'operasional'
                                ? 'Operasional'
                                : perm.category === 'diskon_harga'
                                ? 'Diskon & Void'
                                : 'Keuangan'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                            {perm.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingPermissionsAccount(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedPermissions}
                  className="px-5 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Simpan Perubahan Hak Akses</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: KONFIRMASI HAPUS AKUN POS */}
        {accountToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 text-stone-900 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <span className="material-symbols-outlined text-2xl">person_remove</span>
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-stone-900">Hapus Akun POS?</h3>
                  <p className="text-xs text-stone-500">Tindakan ini permanen dan tidak dapat dibatalkan</p>
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-xs text-stone-700 space-y-2">
                <p className="font-bold text-rose-900">
                  Apakah Anda yakin ingin menghapus akun "{accountToDelete.name}"?
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-600">
                  <li>Jabatan: <strong>{accountToDelete.role}</strong></li>
                  <li>Shift: {accountToDelete.shift}</li>
                  <li>Akun ini tidak akan dapat login lagi ke terminal kasir POS toko.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  <span>Ya, Hapus Akun POS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: TAMBAH PRINTER LAIN (WINDOWS & MACBOOK) */}
        {showAddPrinterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 text-stone-900 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#c41230]/10 text-[#c41230] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">print</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-stone-900">
                      Tambah Printer Terhubung
                    </h3>
                    <p className="text-xs text-stone-500">
                      Daftarkan printer yang sudah tersambung di Windows atau MacBook Anda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddPrinterModal(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleAddCustomPrinter} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nama / Model Printer:
                  </label>
                  <input
                    type="text"
                    required
                    value={newPrinterName}
                    onChange={(e) => setNewPrinterName(e.target.value)}
                    placeholder="Contoh: Panda POS-58 USB, Epson TM-T82, Xprinter XP-58..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Gunakan nama yang sama dengan nama printer di menu <em>Printers & Scanners</em> Windows atau MacBook Anda.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Perangkat / Sistem:
                    </label>
                    <select
                      value={newPrinterOs}
                      onChange={(e) => setNewPrinterOs(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="Windows">🪟 Windows (11 / 10)</option>
                      <option value="Mac">🍏 MacBook (macOS)</option>
                      <option value="Semua Perangkat">🖨️ Semua Perangkat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Metode Koneksi:
                    </label>
                    <select
                      value={newPrinterConn}
                      onChange={(e) => setNewPrinterConn(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="browser_driver">Driver Sistem (Universal)</option>
                      <option value="bluetooth">Bluetooth Direct</option>
                      <option value="usb_direct">USB WebSerial</option>
                      <option value="network_ip">Network LAN/IP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Lebar Kertas (mm):
                    </label>
                    <div className="flex gap-1.5 mb-1.5">
                      {[57, 58, 80].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            setNewPrinterWidth(w);
                            if (w === 57) setNewPrinterDiameter(47);
                            else if (w === 58) setNewPrinterDiameter(50);
                            else if (w === 80) setNewPrinterDiameter(80);
                          }}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            newPrinterWidth === w
                              ? 'bg-[#c41230] text-white border-[#c41230]'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {w} mm
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={40}
                      max={120}
                      required
                      value={newPrinterWidth}
                      onChange={(e) => setNewPrinterWidth(parseInt(e.target.value) || 57)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Diameter Roll (mm):
                    </label>
                    <div className="h-6"></div>
                    <input
                      type="number"
                      min={30}
                      max={100}
                      required
                      value={newPrinterDiameter}
                      onChange={(e) => setNewPrinterDiameter(parseInt(e.target.value) || 47)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPrinterModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>Simpan & Aktifkan Printer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STOK OPNAME (AUDIT FISIK & PENYESUAIAN STOK MASSAL/MANUAL)          */}
        {/* ========================================================================= */}
        {activeTab === 'stock_opname' && (
          <StockOpnameSection />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: WHATSAPP GATEWAY (AQSHAMART / KirimDigi)                           */}
        {/* ========================================================================= */}
        {activeTab === 'wa_gateway' && (
          <div className="space-y-6">
            {/* Top Header Card */}
            <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-emerald-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl shrink-0">
                  <span className="material-symbols-outlined text-3xl">chat</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Sub-Menu: WhatsApp Gateway Real-Time
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    Integrasi WhatsApp Gateway (KirimDigi)
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
                    Kirim notifikasi otomatis ke nomor WhatsApp customer saat checkout, pembaruan status pesanan selesai/sampai tujuan, dan pendaftaran akun baru.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Port 2026: Terkoneksi</span>
                </span>
              </div>
            </div>

            {/* Notification Toast */}
            {waResultToast && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-sm ${
                  waResultToast.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span>{waResultToast.text}</span>
                <button
                  type="button"
                  onClick={() => setWaResultToast(null)}
                  className="text-stone-400 hover:text-stone-700 ml-3"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Connected Device Card & Triggers */}
              <div className="lg:col-span-5 space-y-5">
                {/* Connected Session Card (styled like WhatsApp Gateway UI) */}
                <div className="bg-emerald-50/80 rounded-3xl border border-emerald-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-base flex items-center gap-1.5">
                        <span className="text-emerald-700 font-black">{waConfig.sessionId}</span>
                        <span className="text-stone-500 font-normal text-xs">(ID: {waConfig.sessionId})</span>
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mt-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Status: Connected</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono mt-1">
                        <span className="material-symbols-outlined text-sm text-stone-400">phone</span>
                        <span>Phone: +6281380989932</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Aktif
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/70 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const testInput = document.getElementById('wa-test-phone-input');
                        testInput?.focus();
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">send</span>
                      <span>Test Message</span>
                    </button>
                  </div>
                </div>

                {/* Admin WhatsApp Recipient Card */}
                <div className="bg-white rounded-3xl border border-emerald-200 p-5 shadow-xs space-y-3 bg-gradient-to-br from-white to-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600">admin_panel_settings</span>
                      <span>WhatsApp Admin Penerima Notifikasi</span>
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Aktif Otomatis</span>
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Setiap ada <strong>Pesanan Baru Masuk</strong>, <strong>Registrasi Akun Baru</strong>, dan <strong>Pesanan Selesai</strong>, sistem otomatis mengirimkan tembusan rincian lengkap ke nomor Admin:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-stone-400 material-symbols-outlined text-base">phone_iphone</span>
                      <input
                        type="text"
                        value={waAdminPhone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWaAdminPhone(val);
                          setAdminWAPhone(val);
                        }}
                        placeholder="0895329332135"
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setWaTestPhone(waAdminPhone);
                        const testInput = document.getElementById('wa-test-phone-input');
                        testInput?.focus();
                        showToast(`Nomor Admin ${waAdminPhone} dipilih untuk uji coba kirim!`);
                      }}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      <span className="material-symbols-outlined text-xs">send</span>
                      <span>Uji Kirim ke Admin</span>
                    </button>
                  </div>
                </div>

                {/* 3 Automated Triggers List */}
                <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c41230]">bolt</span>
                    <span>3 Alur Otomatisasi (Customer & Admin 0895329332135)</span>
                  </h4>

                  <div className="space-y-3">
                    {/* Trigger 1 */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5">
                          <span>🛍️</span>
                          <span>1. Customer Checkout Toko</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[10px] font-bold">
                          Spinner 3-5s
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Saat tombol pesanan ditekan, tombol menampilkan loading spinner 3-5 detik. Setelah selesai, rincian pesanan & resi dikirimkan ke <strong>WhatsApp Pembeli</strong> dan sekaligus notifikasi order baru dikirimkan ke <strong>WhatsApp Admin ({waAdminPhone})</strong>.
                      </p>
                    </div>

                    {/* Trigger 2 */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <span>✅</span>
                          <span>2. Pesanan Sampai / Selesai</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 text-[10px] font-bold">
                          Otomatis
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Ketika admin memperbarui status pesanan menjadi <strong>Selesai (Tahap 4: Paket Sampai)</strong>, pesan konfirmasi paket tiba otomatis dikirimkan ke <strong>WhatsApp customer</strong> dan laporan pesanan selesai dikirimkan ke <strong>WhatsApp Admin ({waAdminPhone})</strong>.
                      </p>
                    </div>

                    {/* Trigger 3 */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-950 flex items-center gap-1.5">
                          <span>🎉</span>
                          <span>3. Pendaftaran Akun Baru</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-900 text-[10px] font-bold">
                          Instan
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Saat customer menekan tombol <strong>Daftar & Buat Akun Sekarang</strong>, pesan sambutan, ID Member baru, dan bonus 100 poin reward langsung dikirim ke <strong>nomor HP member</strong>, serta data pendaftaran baru otomatis diteruskan ke <strong>WhatsApp Admin ({waAdminPhone})</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): API Documentation & Interactive Test Console */}
              <div className="lg:col-span-7 space-y-5">
                {/* API Documentation Box (Matching UI screenshot) */}
                <div className="bg-[#1e293b] text-stone-200 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <span className="text-emerald-400 font-mono">&lt;/&gt;</span>
                      <span>API Documentation</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      AQSHAMART Gateway
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-2">
                      <span className="text-emerald-400">🔑</span>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">API Key:</div>
                        <div className="font-mono font-bold text-white text-xs">{waConfig.apiKey}</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-2">
                      <span className="text-cyan-400">🌐</span>
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Base URL:</div>
                        <div className="font-mono font-bold text-white text-xs">{waConfig.baseUrl}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                      <span className="text-emerald-400">&gt;_</span>
                      <span>Send Message (cURL Blueprint):</span>
                    </div>
                    <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                      <code>
                        curl -X POST "{waConfig.baseUrl}/api/send" \<br />
                        &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                        &nbsp;&nbsp;-H "x-api-key: {waConfig.apiKey}" \<br />
                        &nbsp;&nbsp;-d '&#123; "sessionId": "{waConfig.sessionId}", "number": "628xxxxxxxxxx", "message": "Pesan dari Sembako Nusantara" &#125;'
                      </code>
                    </div>
                  </div>
                </div>

                {/* Interactive Test Console Card */}
                <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">send_and_archive</span>
                    <span>Uji Coba Kirim Pesan WhatsApp Gateway Langsung</span>
                  </h4>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSendingWa(true);
                      setWaResultToast(null);
                      try {
                        const res = await sendWhatsAppMessage(waTestPhone, waTestMsg, waConfig.sessionId);
                        if (res.success) {
                          setWaResultToast({
                            success: true,
                            text: `✅ Berhasil! Pesan WhatsApp terkirim ke ${waTestPhone} via sesi ${waConfig.sessionId}.`
                          });
                        } else {
                          setWaResultToast({
                            success: false,
                            text: `⚠️ Pengiriman ke gateway gagal: ${res.error || 'Pastikan service http://localhost:2026 aktif'}`
                          });
                        }
                      } catch (err: any) {
                        setWaResultToast({ success: false, text: `❌ Error: ${err?.message || err}` });
                      } finally {
                        setIsSendingWa(false);
                      }
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Nomor WhatsApp Tujuan:
                      </label>
                      <input
                        id="wa-test-phone-input"
                        type="text"
                        value={waTestPhone}
                        onChange={(e) => setWaTestPhone(e.target.value)}
                        placeholder="Contoh: 6281380989932 atau 08123456789"
                        required
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Mendukung format Indonesia (+62 / 08xx) dan Jepang (+81 / 080 / 090xx).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Isi Pesan WhatsApp Uji Coba:
                      </label>
                      <textarea
                        rows={3}
                        value={waTestMsg}
                        onChange={(e) => setWaTestMsg(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Ketik pesan tes di sini..."
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setWaConfig(DEFAULT_WA_CONFIG);
                          localStorage.removeItem('sn_wa_gateway_config');
                          setWaResultToast({ success: true, text: 'Konfigurasi dikembalikan ke default KirimDigi & Gateway Aktif' });
                        }}
                        className="text-xs text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer"
                      >
                        Reset ke Default
                      </button>

                      <button
                        type="submit"
                        disabled={isSendingWa}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
                      >
                        {isSendingWa ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Menghubungi Gateway...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">send</span>
                            <span>Kirim Pesan Uji Coba Sekarang</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
