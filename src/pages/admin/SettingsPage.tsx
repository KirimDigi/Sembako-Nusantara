import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { CashierPermissionItem, CashierAccount } from '../../types';

const INITIAL_PERMISSIONS: CashierPermissionItem[] = [
  // 1. Operasional Kasir & Penjualan
  {
    id: 'pos_terminal_access',
    label: 'Akses Masuk Mesin Kasir POS (Live Terminal)',
    description: 'Mengizinkan staf kasir membuka halaman terminal POS, memindai barcode, dan memproses transaksi belanja langsung.',
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
    description: 'Mengizinkan kasir menginput diskon potongan manual (persentase % atau nominal ¥) pada total keranjang.',
    category: 'diskon_harga',
    enabled: false
  },
  {
    id: 'void_pending_transaction',
    label: 'Void / Hapus Transaksi Belum Dibayar',
    description: 'Mengizinkan kasir menghapus transaksi atau membatalkan seluruh item di keranjang yang belum lunas.',
    category: 'diskon_harga',
    enabled: true
  },
  {
    id: 'refund_return_goods',
    label: 'Proses Refund Dana & Retur Produk Pelanggan',
    description: 'Mengizinkan kasir melakukan retur produk rusak/salah beli dan mengembalikan uang tunai ke pelanggan.',
    category: 'diskon_harga',
    enabled: false
  },
  {
    id: 'override_product_price',
    label: 'Ubah / Override Harga Satuan Produk di Kasir',
    description: 'Mengizinkan kasir mengubah harga jual per item langsung saat transaksi jika terjadi selisih harga label rak.',
    category: 'diskon_harga',
    enabled: false
  },

  // 3. Keuangan, Laporan & Piutang
  {
    id: 'view_shift_sales_report',
    label: 'Lihat Rekap Omset & Kas Shift Sendiri',
    description: 'Mengizinkan kasir melihat total uang masuk (tunai, PayPay, kartu kredit) pada shift yang sedang berjalan.',
    category: 'keuangan',
    enabled: true
  },
  {
    id: 'close_shift_cash_reconciliation',
    label: 'Tutup Shift & Rekonsiliasi Kasir (Closing)',
    description: 'Mengizinkan kasir melakukan tutup buku harian, menghitung saldo kas akhir, dan serah terima shift.',
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
    id: 'c-1',
    name: 'Siti Rahmawati',
    role: 'Kasir Utama',
    pin: '1234',
    status: 'Aktif',
    lastActive: 'Hari ini, 15:30 JST',
    shift: 'Pagi (08:00 - 16:00)'
  },
  {
    id: 'c-2',
    name: 'Budi Santoso',
    role: 'Kasir Shift Sore',
    pin: '5678',
    status: 'Aktif',
    lastActive: 'Kemarin, 21:45 JST',
    shift: 'Sore (15:00 - 23:00)'
  },
  {
    id: 'c-3',
    name: 'Rina Marlina',
    role: 'Kasir Shift Weekend',
    pin: '9012',
    status: 'Aktif',
    lastActive: '04 Okt 2026',
    shift: 'Sabtu - Minggu'
  },
  {
    id: 'c-4',
    name: 'Kenjiro Tanaka',
    role: 'Part-time Support',
    pin: '3456',
    status: 'Nonaktif',
    lastActive: '28 Sep 2026',
    shift: 'On Call'
  }
];

export const SettingsPage: React.FC = () => {
  const { language } = useLanguage();

  // Active Permissions State
  const [permissions, setPermissions] = useState<CashierPermissionItem[]>(() => {
    const saved = localStorage.getItem('sn_cashier_permissions');
    return saved ? JSON.parse(saved) : INITIAL_PERMISSIONS;
  });

  // Cashier Accounts State
  const [cashiers, setCashiers] = useState<CashierAccount[]>(() => {
    const saved = localStorage.getItem('sn_cashier_accounts');
    return saved ? JSON.parse(saved) : INITIAL_CASHIERS;
  });

  const [activeTab, setActiveTab] = useState<'cashier' | 'general'>('cashier');
  const [notification, setNotification] = useState<string | null>(null);
  const [showAddCashierModal, setShowAddCashierModal] = useState(false);

  // New Cashier Form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Kasir POS');
  const [newShift, setNewShift] = useState('Pagi (08:00 - 16:00)');
  const [newPin, setNewPin] = useState('1122');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle Single Permission Checkbox
  const handleTogglePermission = (id: string) => {
    const updated = permissions.map((item) => {
      if (item.id === id) {
        const nextState = !item.enabled;
        return { ...item, enabled: nextState };
      }
      return item;
    });

    setPermissions(updated);
    localStorage.setItem('sn_cashier_permissions', JSON.stringify(updated));

    const toggled = updated.find((p) => p.id === id);
    showToast(
      toggled?.enabled
        ? `Izin "${toggled.label}" berhasil DIAKTIFKAN ✅`
        : `Izin "${toggled.label}" berhasil DINONAKTIFKAN ❌`
    );
  };

  // Enable / Disable All in a category or global
  const handleToggleAll = (enable: boolean) => {
    const updated = permissions.map((p) => ({ ...p, enabled: enable }));
    setPermissions(updated);
    localStorage.setItem('sn_cashier_permissions', JSON.stringify(updated));
    showToast(enable ? 'Semua hak akses kasir berhasil DIAKTIFKAN!' : 'Semua hak akses kasir DINONAKTIFKAN!');
  };

  // Reset to Default
  const handleResetDefault = () => {
    setPermissions(INITIAL_PERMISSIONS);
    localStorage.setItem('sn_cashier_permissions', JSON.stringify(INITIAL_PERMISSIONS));
    showToast('Hak akses kasir dikembalikan ke pengaturan rekomendasi default');
  };

  // Toggle Cashier Status (Aktif / Nonaktif)
  const handleToggleCashierStatus = (id: string) => {
    const updated = cashiers.map((c) => {
      if (c.id === id) {
        const nextStatus: 'Aktif' | 'Nonaktif' = c.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        return { ...c, status: nextStatus };
      }
      return c;
    });
    setCashiers(updated);
    localStorage.setItem('sn_cashier_accounts', JSON.stringify(updated));
    showToast('Status akun staf kasir berhasil diperbarui');
  };

  // Add Cashier Account
  const handleAddCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newAcc: CashierAccount = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      pin: newPin || '1234',
      status: 'Aktif',
      lastActive: 'Baru Dibuat',
      shift: newShift
    };

    const updated = [...cashiers, newAcc];
    setCashiers(updated);
    localStorage.setItem('sn_cashier_accounts', JSON.stringify(updated));
    setShowAddCashierModal(false);
    setNewName('');
    showToast(`Staf kasir "${newAcc.name}" berhasil ditambahkan!`);
  };

  const activeCount = permissions.filter((p) => p.enabled).length;

  return (
    <AdminLayout
      title={language === 'JP' ? '設定・権限管理' : language === 'EN' ? 'System Settings & Access' : 'Pengaturan Sistem & Hak Akses'}
      subtitle={
        language === 'JP'
          ? 'POSレジ担当スタッフのアクセス権限、割引・返金許可、およびレジ担当アカウントの管理。'
          : language === 'EN'
          ? 'Manage store cashier access permissions, discount/refund approvals, and cashier staff accounts.'
          : 'Kelola hak akses kasir POS, otorisasi diskon, void transaksi, dan manajemen akun staf kasir Sembako Nusantara.'
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Floating Notification Toast */}
        {notification && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined text-emerald-400">check_circle</span>
            <span className="text-xs sm:text-sm font-semibold">{notification}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-stone-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#c41230]/20 border border-[#c41230]/40 flex items-center justify-center text-[#ff4d6d] text-2xl shrink-0">
              <span className="material-symbols-outlined text-3xl">settings_suggest</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                  Sub-Menu: Kelola Kasir
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                  {activeCount} dari {permissions.length} Izin Aktif
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Kelola Kasir & Hak Akses Fitur
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Cukup centang checkbox di bawah untuk mengaktifkan akses, atau hilangkan centang untuk membatasi fitur kasir.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => handleToggleAll(true)}
              className="flex-1 md:flex-initial px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Aktifkan Semua
            </button>
            <button
              onClick={handleResetDefault}
              className="flex-1 md:flex-initial px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Reset Default
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab('cashier')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cashier'
                ? 'bg-[#c41230] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">checklist</span>
            <span>Hak Akses Kasir (Checkbox Matrix)</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-[#c41230] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">badge</span>
            <span>Daftar Akun Kasir ({cashiers.length})</span>
          </button>
        </div>

        {/* CONTENT TAB 1: CHECKBOX MATRIX HAK AKSES */}
        {activeTab === 'cashier' && (
          <div className="space-y-6">
            {/* Category 1: Operasional Kasir & Penjualan */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="bg-stone-50 px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-blue-600">point_of_sale</span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Operasional Kasir & Penjualan Harian</h3>
                    <p className="text-[11px] text-stone-500">Izin standar untuk kelancaran transaksi checkout belanja</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Kategori: Operasional
                </span>
              </div>

              <div className="divide-y divide-stone-100 p-2 sm:p-4">
                {permissions
                  .filter((p) => p.category === 'operasional')
                  .map((perm) => (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className="p-3 sm:p-4 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer flex items-start justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={perm.enabled}
                          onChange={() => {}} // handled by parent onClick
                          className="mt-1 h-5 w-5 rounded-md text-[#c41230] focus:ring-[#c41230] border-stone-300 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-[#c41230] transition-colors">
                            {perm.label}
                          </div>
                          <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
                            {perm.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 ${
                          perm.enabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 text-stone-400 border border-stone-200'
                        }`}
                      >
                        {perm.enabled ? '✓ AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Category 2: Diskon, Harga & Pembatalan (Sensitif) */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="bg-stone-50 px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-600">percent</span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Diskon, Harga & Pembatalan (Sensitif)</h3>
                    <p className="text-[11px] text-stone-500">Izin berisiko finansial, memerlukan kepercayaan tinggi</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Kategori: Otorisasi Khusus
                </span>
              </div>

              <div className="divide-y divide-stone-100 p-2 sm:p-4">
                {permissions
                  .filter((p) => p.category === 'diskon_harga')
                  .map((perm) => (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className="p-3 sm:p-4 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer flex items-start justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={perm.enabled}
                          onChange={() => {}}
                          className="mt-1 h-5 w-5 rounded-md text-[#c41230] focus:ring-[#c41230] border-stone-300 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-[#c41230] transition-colors">
                            {perm.label}
                          </div>
                          <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
                            {perm.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 ${
                          perm.enabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 text-stone-400 border border-stone-200'
                        }`}
                      >
                        {perm.enabled ? '✓ AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Category 3: Keuangan, Laporan & Piutang */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="bg-stone-50 px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-purple-600">account_balance_wallet</span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Keuangan, Laporan Kas & Bon Piutang</h3>
                    <p className="text-[11px] text-stone-500">Hak melihat rekap kas harian dan pencatatan hutang pelanggan</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Kategori: Keuangan Kasir
                </span>
              </div>

              <div className="divide-y divide-stone-100 p-2 sm:p-4">
                {permissions
                  .filter((p) => p.category === 'keuangan')
                  .map((perm) => (
                    <div
                      key={perm.id}
                      onClick={() => handleTogglePermission(perm.id)}
                      className="p-3 sm:p-4 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer flex items-start justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={perm.enabled}
                          onChange={() => {}}
                          className="mt-1 h-5 w-5 rounded-md text-[#c41230] focus:ring-[#c41230] border-stone-300 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-xs sm:text-sm group-hover:text-[#c41230] transition-colors">
                            {perm.label}
                          </div>
                          <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-relaxed">
                            {perm.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 ${
                          perm.enabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 text-stone-400 border border-stone-200'
                        }`}
                      >
                        {perm.enabled ? '✓ AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT TAB 2: DAFTAR AKUN KASIR */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-base">Staf & Kasir Terdaftar</h3>
                <p className="text-xs text-stone-500">Daftar staf yang memiliki akses login ke mesin kasir toko</p>
              </div>
              <button
                onClick={() => setShowAddCashierModal(true)}
                className="px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>+ Tambah Kasir Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cashiers.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-sm shrink-0">
                      {c.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{c.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{c.role} • Shift: {c.shift}</p>
                      <div className="mt-2 text-[11px] text-stone-400 space-x-3">
                        <span>PIN Login: <strong className="text-stone-700 font-mono">••••</strong></span>
                        <span>Aktif: <strong className="text-stone-600">{c.lastActive}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleCashierStatus(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        c.status === 'Aktif'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {c.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: TAMBAH KASIR BARU */}
        {showAddCashierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-stone-900 relative">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <h3 className="font-heading font-bold text-lg text-stone-900">
                    Tambah Staf Kasir Baru
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddCashierModal(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleAddCashier} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nama Lengkap Staf:</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Dewi Lestari"
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Peran / Jabatan:</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Contoh: Kasir Shift Pagi / Kasir Magang"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Shift Kerja:</label>
                    <select
                      value={newShift}
                      onChange={(e) => setNewShift(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    >
                      <option value="Pagi (08:00 - 16:00)">Pagi (08:00 - 16:00)</option>
                      <option value="Sore (15:00 - 23:00)">Sore (15:00 - 23:00)</option>
                      <option value="Weekend (Sabtu-Minggu)">Weekend</option>
                      <option value="Full Time">Full Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">PIN Akses (4 Angka):</label>
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

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCashierModal(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Simpan Kasir
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
