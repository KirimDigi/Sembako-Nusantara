import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { assetUrl } from '../utils/assets';

export const AccountOrdersPage: React.FC = () => {
  const { isAuthenticated, currentUser, login, loginWithGoogle, logout, isAdmin } = useAuth();
  const { orders: adminOrders, cancelOrder } = useAdmin();
  const navigate = useNavigate();

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [copiedResiId, setCopiedResiId] = useState<string | null>(null);
  const [expandedTrackingId, setExpandedTrackingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [localCancelledIds, setLocalCancelledIds] = useState<string[]>([]);

  // Form login states for unauthenticated users
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setLoginError(res.error);
      }
    } catch (err: any) {
      setLoginError('Gagal menghubungkan ke akun Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Real-time synchronization between Admin Dashboard orders and Customer Pesanan Saya
  const orders = React.useMemo(() => {
    let localUserOrders: any[] = [];
    try {
      const saved = localStorage.getItem('sn_user_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) localUserOrders = parsed;
      }
    } catch (e) {}

    const storageOrderIds = new Set(localUserOrders.map((o: any) => o.id || o.orderId));

    // Deep merge: each order in storage gets updated in real-time from AdminContext
    const mergedList: any[] = localUserOrders.map((uo: any) => {
      const ordId = uo.id || uo.orderId;
      const matchAdmin = adminOrders.find((ao) => ao.id === ordId);
      const isLocallyCancelled = localCancelledIds.includes(ordId);
      if (matchAdmin) {
        return {
          ...uo,
          id: ordId,
          orderId: ordId,
          status: isLocallyCancelled ? 'Dibatalkan' : matchAdmin.status,
          courier: matchAdmin.courier || uo.courier || 'Yamato Transport',
          trackingNumber: matchAdmin.trackingNumber || uo.trackingNumber || '',
          total: matchAdmin.totalAmount ?? uo.total ?? uo.totalAmount,
          totalAmount: matchAdmin.totalAmount ?? uo.totalAmount ?? uo.total,
          taxAmount: matchAdmin.taxAmount ?? uo.taxAmount ?? 0,
          items: matchAdmin.items && matchAdmin.items.length > 0 ? matchAdmin.items : uo.items,
          shippingAddress: matchAdmin.shippingAddress || uo.shippingAddress || uo.address,
          customerName: matchAdmin.customerName || uo.customerName || 'Pelanggan',
          date: matchAdmin.date || uo.date
        };
      }
      return {
        ...uo,
        id: ordId,
        orderId: ordId,
        status: isLocallyCancelled ? 'Dibatalkan' : uo.status,
        courier: uo.courier || 'Yamato Transport',
        trackingNumber: uo.trackingNumber || ''
      };
    });

    // Also include any order directly from adminOrders that belongs to this user
    if (currentUser) {
      const curId = currentUser.id?.toLowerCase().trim();
      const curEmail = currentUser.email?.toLowerCase().trim();
      const curName = currentUser.name?.toLowerCase().trim();

      for (const ao of adminOrders) {
        if (!storageOrderIds.has(ao.id)) {
          const matchUser =
            ((ao as any).userId && String((ao as any).userId).toLowerCase().trim() === curId) ||
            ((ao as any).userEmail && String((ao as any).userEmail).toLowerCase().trim() === curEmail) ||
            (ao.customerName && curName && (ao.customerName.toLowerCase().includes(curName) || curName.includes(ao.customerName.toLowerCase())));

          if (matchUser) {
            mergedList.push({
              id: ao.id,
              orderId: ao.id,
              trackingNumber: ao.trackingNumber || '',
              courier: ao.courier || 'Yamato Transport',
              status: localCancelledIds.includes(ao.id) ? 'Dibatalkan' : ao.status,
              total: ao.totalAmount,
              totalAmount: ao.totalAmount,
              taxAmount: ao.taxAmount || 0,
              date: ao.date,
              customerName: ao.customerName,
              shippingAddress: ao.shippingAddress,
              items: (ao.items || []).map((it: any) => ({
                id: it.id || it.productId,
                name: it.productName || it.name,
                qty: it.quantity || it.qty || 1,
                price: it.price
              }))
            });
          }
        }
      }
    }

    return mergedList;
  }, [adminOrders, localCancelledIds, currentUser]);

  const copyToClipboard = (text: string, orderId: string) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text);
    setCopiedResiId(orderId);
    setTimeout(() => setCopiedResiId(null), 2500);
  };

  const getStepNumber = (status: string) => {
    if (status === 'Dikemas' || status === 'Diproses') return 1;
    if (status === 'Selesai Packing') return 2;
    if (status === 'Dikirim') return 3;
    if (status === 'Selesai') return 4;
    return 0; // Dibatalkan
  };

  const filteredOrders = React.useMemo(() => {
    if (filterStatus === 'all') return orders;
    if (filterStatus === 'Dikemas') return orders.filter((o) => o.status === 'Dikemas' || o.status === 'Diproses');
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await login(loginId, password);
      if (res.success) {
        if (loginId.trim() === 'id0926') {
          navigate('/admin');
        }
      } else {
        setLoginError(res.error || 'Gagal masuk akun.');
      }
    } catch (err) {
      setLoginError('Terjadi kesalahan saat masuk akun.');
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // 1. STATE: BELUM LOGIN (NOT AUTHENTICATED)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Not Logged In Banner Card */}
        <div className="bg-white rounded-3xl border border-[#EBE5DF] shadow-xl p-8 sm:p-12 text-center space-y-6">
          {/* Brand Logo Header (Replacing Lock Icon) */}
          <div className="flex items-center justify-center mx-auto">
            <img
              src={assetUrl('logo-transparent.png')}
              alt="Sembako Nusantara"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
            />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-wider">
              Status: Belum Masuk (Login Diperlukan)
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Silakan masuk untuk melihat riwayat pesanan, mengklaim poin reward diaspora, dan melanjutkan checkout belanja.
            </p>
          </div>

          {loginError && (
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-base shrink-0 text-red-500">error</span>
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleFormLogin} className="max-w-md mx-auto space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                ID / No. HP / Username:
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Masukkan ID / No. HP / Username"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Kata Sandi:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full pl-4 pr-11 py-3 rounded-xl border border-stone-300 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-200/50 flex items-center justify-center cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${showPassword ? 'text-[#c41230]' : 'text-stone-400'}`}>
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">login</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
                Belum Punya Akun?
              </span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {/* Buat Akun / Daftar Klik Disini Button */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-[#c41230] hover:text-[#9a0021] font-bold text-xs sm:text-sm rounded-xl border-2 border-[#c41230] hover:border-[#9a0021] shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              <span>Buat Akun / Daftar Klik Disini</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. STATE: SUDAH LOGIN (AUTHENTICATED)
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Profile Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 shadow-sm text-center space-y-4 relative overflow-hidden">
            {/* Online Status Dot */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-50 text-[#15803D] text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Terhubung</span>
            </div>

            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#FFDAD9] text-[#9a0021] font-black text-2xl mx-auto flex items-center justify-center border-2 border-[#c41230] shadow-sm">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)
                : 'WP'}
            </div>

            <div>
              <h2 className="font-heading font-bold text-lg text-stone-900">
                {currentUser?.name || 'Willy Pratama'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {currentUser?.tier || (isAdmin ? 'Pengelola Resmi (Super Admin)' : 'Anggota Diaspora VIP (Gold Member)')}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold rounded-full border border-emerald-200">
                Poin Reward: {currentUser?.loyaltyPoints ?? 0} JPY
              </span>
            </div>

            {/* Profile Info Details */}
            <div className="border-t border-stone-100 pt-4 text-left text-xs text-stone-600 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#c41230]">location_on</span>
                <span className="truncate">{currentUser?.address || 'Tokyo, Edogawa-ku, Nishi-Kasai 3-1-4'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#c41230]">call</span>
                <span>{currentUser?.phone || '+81 80-1122-3344'}</span>
              </div>
              {currentUser?.email && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#c41230]">mail</span>
                  <span className="truncate">{currentUser.email}</span>
                </div>
              )}
            </div>

            {/* Admin Shortcuts (If Admin is logged in) */}
            {isAdmin && (
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <Link
                  to="/admin"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm text-red-500">dashboard</span>
                  <span>Buka Dashboard Admin</span>
                </Link>
                <Link
                  to="/admin/pos"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">point_of_sale</span>
                  <span>Buka Mesin POS Kasir</span>
                </Link>
              </div>
            )}

            {/* Logout Action */}
            <div className="pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-[#c41230] text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Order History (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm">
            {/* Header with Title & Live Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-5 mb-5">
              <div>
                <h1 className="font-heading font-black text-xl sm:text-2xl text-stone-900 flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#c41230] text-2xl sm:text-3xl">receipt_long</span>
                  <span>Pesanan Saya (Tracking Order)</span>
                </h1>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Status pesanan & pelacakan ekspedisi real-time tersinkronisasi langsung dengan Dashboard Admin.</span>
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 bg-stone-100 text-stone-700 rounded-full border border-stone-200">
                {orders.length} Total Pesanan
              </span>
            </div>

            {/* Filter Tabs for 4-Step Order Statuses */}
            {orders.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-stone-100/80 rounded-2xl border border-stone-200/60 mb-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Semua ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('Dikemas')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'Dikemas'
                      ? 'bg-amber-100 text-amber-900 shadow-xs border border-amber-300'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  1. 📦 Dikemas ({orders.filter((o) => o.status === 'Dikemas' || o.status === 'Diproses').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('Selesai Packing')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'Selesai Packing'
                      ? 'bg-purple-100 text-purple-900 shadow-xs border border-purple-300'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  2. 📋 Selesai Packing ({orders.filter((o) => o.status === 'Selesai Packing').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('Dikirim')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'Dikirim'
                      ? 'bg-blue-100 text-blue-900 shadow-xs border border-blue-300'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  3. 🚚 Dikirim ({orders.filter((o) => o.status === 'Dikirim').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('Selesai')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-900 shadow-xs border border-emerald-300'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  4. ✅ Selesai ({orders.filter((o) => o.status === 'Selesai').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('Dibatalkan')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    filterStatus === 'Dibatalkan'
                      ? 'bg-rose-100 text-rose-900 shadow-xs border border-rose-300'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  ❌ Batal ({orders.filter((o) => o.status === 'Dibatalkan').length})
                </button>
              </div>
            )}

            {filteredOrders.length === 0 ? (
              /* CLEAN EMPTY TRANSACTION STATE */
              <div className="py-12 px-4 text-center space-y-5 bg-stone-50/70 rounded-2xl border border-dashed border-stone-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xs border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <span className="material-symbols-outlined text-3xl text-stone-400">
                    {orders.length === 0 ? 'shopping_bag' : 'filter_alt_off'}
                  </span>
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="font-bold text-base text-stone-800">
                    {orders.length === 0 ? 'Belum Ada Riwayat Pesanan' : 'Tidak Ada Pesanan dengan Filter Ini'}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {orders.length === 0
                      ? 'Akun Anda belum memiliki riwayat transaksi belanja. Jelajahi katalog sembako, mie instan, bumbu nusantara, dan frozen food halal kami sekarang!'
                      : 'Silakan pilih tab filter lainnya atau pilih "Semua" untuk melihat riwayat pesanan Anda.'}
                  </p>
                </div>
                {orders.length === 0 ? (
                  <div className="pt-2">
                    <Link
                      to="/catalog"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-98"
                    >
                      <span className="material-symbols-outlined text-sm">storefront</span>
                      <span>Mulai Belanja Sekarang (お買い物を始める)</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-all"
                  >
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const stepNum = getStepNumber(order.status);
                  const isCancelled = order.status === 'Dibatalkan';
                  const isExpanded = expandedTrackingId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="border border-[#EBE5DF] rounded-2xl p-5 hover:border-stone-300 transition-all bg-white shadow-xs space-y-4"
                    >
                      {/* Top Bar: Order ID, Date & Synchronized Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-stone-900 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
                            #{order.id}
                          </span>
                          <span className="text-xs text-stone-400">Tanggal: {order.date}</span>
                        </div>

                        {/* Status Badge with Step Number matching Admin */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            order.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : order.status === 'Dikirim'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : order.status === 'Selesai Packing'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : order.status === 'Dikemas' || order.status === 'Diproses'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {order.status === 'Dikemas' || order.status === 'Diproses'
                            ? '1. 📦 Sedang Dikemas'
                            : order.status === 'Selesai Packing'
                            ? '2. 📋 Selesai Packing'
                            : order.status === 'Dikirim'
                            ? '3. 🚚 Sedang Dikirim'
                            : order.status === 'Selesai'
                            ? '4. ✅ Selesai'
                            : '❌ Dibatalkan'}
                        </span>
                      </div>

                      {/* 4-Step Visual Flow Stepper (Fully Synchronized with Admin) */}
                      <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isCancelled ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                            <span>Tahapan Alur Pengiriman:</span>
                          </span>
                          <span className="text-[11px] font-bold text-stone-700">
                            {order.status === 'Dikemas' || order.status === 'Diproses'
                              ? 'Tahap 1 / 4: Sedang Dikemas di Gudang'
                              : order.status === 'Selesai Packing'
                              ? 'Tahap 2 / 4: Selesai Packing & Menunggu Kurir'
                              : order.status === 'Dikirim'
                              ? 'Tahap 3 / 4: Paket Diserahkan ke Ekspedisi'
                              : order.status === 'Selesai'
                              ? 'Tahap 4 / 4: Paket Berhasil Diterima'
                              : 'Pesanan Dibatalkan'}
                          </span>
                        </div>

                        {isCancelled ? (
                          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                            <span className="material-symbols-outlined text-rose-600 text-base shrink-0">cancel</span>
                            <span>Pesanan ini dibatalkan. Seluruh stok produk telah dikembalikan ke inventaris gudang.</span>
                          </div>
                        ) : (
                          /* Interactive 4-Node Stepper Progress Bar */
                          <div className="relative pt-2 pb-1">
                            {/* Connecting Line */}
                            <div className="absolute top-5 left-6 right-6 h-1 bg-stone-200 -z-0">
                              <div
                                className="h-full bg-[#c41230] transition-all duration-500"
                                style={{
                                  width:
                                    stepNum === 1
                                      ? '0%'
                                      : stepNum === 2
                                      ? '33.33%'
                                      : stepNum === 3
                                      ? '66.66%'
                                      : '100%'
                                }}
                              ></div>
                            </div>

                            {/* 4 Steps */}
                            <div className="grid grid-cols-4 relative z-10 text-center gap-1">
                              {/* Step 1: Dikemas */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                                    stepNum >= 1
                                      ? 'bg-[#c41230] text-white ring-4 ring-[#c41230]/20'
                                      : 'bg-white border-2 border-stone-300 text-stone-400'
                                  }`}
                                >
                                  {stepNum > 1 ? (
                                    <span className="material-symbols-outlined text-sm">check</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                                  )}
                                </div>
                                <span className={`text-[11px] font-bold mt-1.5 ${stepNum >= 1 ? 'text-stone-900' : 'text-stone-400'}`}>
                                  1. Dikemas
                                </span>
                                <span className="text-[9px] text-stone-400 hidden sm:block">Packing Gudang</span>
                              </div>

                              {/* Step 2: Selesai Packing */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                                    stepNum >= 2
                                      ? 'bg-[#c41230] text-white ring-4 ring-[#c41230]/20'
                                      : 'bg-white border-2 border-stone-300 text-stone-400'
                                  }`}
                                >
                                  {stepNum > 2 ? (
                                    <span className="material-symbols-outlined text-sm">check</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-sm">checklist</span>
                                  )}
                                </div>
                                <span className={`text-[11px] font-bold mt-1.5 ${stepNum >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>
                                  2. Siap Pickup
                                </span>
                                <span className="text-[9px] text-stone-400 hidden sm:block">Selesai Packing</span>
                              </div>

                              {/* Step 3: Dikirim */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                                    stepNum >= 3
                                      ? 'bg-[#c41230] text-white ring-4 ring-[#c41230]/20'
                                      : 'bg-white border-2 border-stone-300 text-stone-400'
                                  }`}
                                >
                                  {stepNum > 3 ? (
                                    <span className="material-symbols-outlined text-sm">check</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                                  )}
                                </div>
                                <span className={`text-[11px] font-bold mt-1.5 ${stepNum >= 3 ? 'text-stone-900' : 'text-stone-400'}`}>
                                  3. Dikirim
                                </span>
                                <span className="text-[9px] text-stone-400 hidden sm:block">Resi Terbit</span>
                              </div>

                              {/* Step 4: Selesai */}
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs transition-all ${
                                    stepNum === 4
                                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20'
                                      : 'bg-white border-2 border-stone-300 text-stone-400'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-sm">task_alt</span>
                                </div>
                                <span className={`text-[11px] font-bold mt-1.5 ${stepNum === 4 ? 'text-emerald-700' : 'text-stone-400'}`}>
                                  4. Selesai
                                </span>
                                <span className="text-[9px] text-stone-400 hidden sm:block">Tiba di Tujuan</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Courier & Tracking Resi Info Box */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-[#c41230]">local_shipping</span>
                          <div>
                            <span className="text-stone-500 font-medium">Ekspedisi Resmi: </span>
                            <strong className="text-stone-900 font-bold">{order.courier || 'Yamato Transport'}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-stone-500 font-medium">No. Resi:</span>
                          <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {order.trackingNumber || 'Menunggu Resi'}
                          </span>

                          {order.trackingNumber && order.trackingNumber !== '-' && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(order.trackingNumber, order.id)}
                              className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Salin Nomor Resi"
                            >
                              <span className="material-symbols-outlined text-xs">
                                {copiedResiId === order.id ? 'check' : 'content_copy'}
                              </span>
                              <span>{copiedResiId === order.id ? 'Tersalin!' : 'Salin'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedTrackingId(isExpanded ? null : order.id)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ml-1"
                          >
                            <span className="material-symbols-outlined text-xs">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                            <span>{isExpanded ? 'Tutup Detail' : 'Detail Tracking'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Tracking Timeline Details */}
                      {isExpanded && (
                        <div className="p-4 bg-stone-50/90 rounded-xl border border-stone-200 space-y-3 text-xs animate-fadeIn">
                          <h4 className="font-bold text-stone-800 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-[#c41230]">timeline</span>
                            <span>Rincian Pelacakan Tahapan Pesanan #{order.id}</span>
                          </h4>

                          <div className="space-y-3 pl-2 border-l-2 border-stone-200 ml-2">
                            {/* Step 1 Event */}
                            <div className="relative pl-4">
                              <span
                                className={`absolute -left-[9px] top-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  stepNum >= 1 ? 'bg-emerald-500' : 'bg-stone-300'
                                }`}
                              ></span>
                              <div className="font-bold text-stone-900">1. Pesanan Diterima & Sedang Dikemas di Packing Gudang</div>
                              <p className="text-stone-500 text-[11px] mt-0.5">
                                Pesanan diverifikasi admin. Tim gudang sedang mempersiapkan sembako, pengecekan sertifikasi halal, dan pengemasan thermo-box.
                              </p>
                              <span className="text-[10px] text-stone-400">{order.date}</span>
                            </div>

                            {/* Step 2 Event */}
                            <div className="relative pl-4">
                              <span
                                className={`absolute -left-[9px] top-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  stepNum >= 2 ? 'bg-emerald-500' : 'bg-stone-300'
                                }`}
                              ></span>
                              <div className="font-bold text-stone-900">2. Selesai Packing (Proses Penjadwalan Ekspedisi)</div>
                              <p className="text-stone-500 text-[11px] mt-0.5">
                                {stepNum >= 2
                                  ? 'Paket telah selesai dibungkus rapi & aman. Menunggu penjemputan (pickup) oleh armada ekspedisi.'
                                  : 'Menunggu proses pengemasan selesai di gudang.'}
                              </p>
                            </div>

                            {/* Step 3 Event */}
                            <div className="relative pl-4">
                              <span
                                className={`absolute -left-[9px] top-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  stepNum >= 3 ? 'bg-emerald-500' : 'bg-stone-300'
                                }`}
                              ></span>
                              <div className="font-bold text-stone-900">
                                3. Diserahkan ke Ekspedisi & Resi Terbit ({order.courier || 'Kurir'})
                              </div>
                              <p className="text-stone-500 text-[11px] mt-0.5">
                                {order.trackingNumber && order.trackingNumber !== '-'
                                  ? `Paket telah diserahkan ke ${order.courier || 'Kurir'}. No. Resi: ${order.trackingNumber}.`
                                  : 'Menunggu penyerahan paket ke kurir ekspedisi.'}
                              </p>
                            </div>

                            {/* Step 4 Event */}
                            <div className="relative pl-4">
                              <span
                                className={`absolute -left-[9px] top-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  stepNum === 4 ? 'bg-emerald-500' : 'bg-stone-300'
                                }`}
                              ></span>
                              <div className="font-bold text-stone-900">4. Paket Sampai di Alamat Tujuan (Selesai)</div>
                              <p className="text-stone-500 text-[11px] mt-0.5">
                                {stepNum === 4
                                  ? `Paket telah berhasil diterima di: ${order.shippingAddress || 'Alamat Penerima'}. Terima kasih telah berbelanja!`
                                  : `Paket akan dikirimkan ke: ${order.shippingAddress || 'Alamat Penerima'}.`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="space-y-2 text-xs pt-1">
                        <span className="font-bold text-stone-500 text-[11px] uppercase tracking-wider block">
                          Rincian Produk Belanja:
                        </span>
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-stone-700 bg-stone-50/50 p-2 rounded-xl">
                            <span className="font-medium">
                              {item.name || item.productName}{' '}
                              <span className="text-stone-400 font-bold">({item.qty || item.quantity}x)</span>
                            </span>
                            <span className="font-bold text-stone-900">
                              ¥{(Number(item.price) * (item.qty || item.quantity || 1)).toLocaleString('ja-JP')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer & Action Buttons */}
                      <div className="border-t border-stone-100 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-500 font-medium">Total Pembayaran:</span>
                          <span className="font-black text-base text-[#c41230]">
                            ¥{(order.total || order.totalAmount || 0).toLocaleString('ja-JP')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Invoice PDF Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(order)}
                            className="px-3 py-1.5 border border-stone-300 rounded-xl hover:bg-stone-50 font-bold text-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xs">receipt</span>
                            <span>領収書 (Invoice)</span>
                          </button>

                          {/* Cancel Order Button (Only while in Step 1) */}
                          {(order.status === 'Dikemas' || order.status === 'Diproses') && (
                            <button
                              type="button"
                              onClick={() => setCancellingOrderId(order.id || order.orderId)}
                              className="px-3 py-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 font-bold text-rose-700 rounded-xl flex items-center gap-1 transition-colors cursor-pointer text-xs"
                            >
                              <span className="material-symbols-outlined text-xs">cancel</span>
                              <span>Batalkan</span>
                            </button>
                          )}

                          {/* Lacak / Tracking Link */}
                          <Link
                            to={`/tracking?resi=${encodeURIComponent(order.trackingNumber || order.id)}`}
                            className="px-4 py-1.5 bg-[#c41230] text-white rounded-xl hover:bg-[#9a0021] font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">local_shipping</span>
                            <span>Lacak</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Cancel Order Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="font-bold text-stone-900 text-base">Batalkan Pesanan Ini?</h3>
            <p className="text-xs text-stone-500">
              Apakah Anda yakin ingin membatalkan pesanan #{cancellingOrderId}? Stok produk akan otomatis dikembalikan ke inventaris gudang dan status akan berubah menjadi Dibatalkan.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrderId(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelOrder(cancellingOrderId, 'Dibatalkan oleh Pelanggan');
                  setLocalCancelledIds((prev) => [...prev, cancellingOrderId]);
                  setCancellingOrderId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview (Japanese Qualified Tax Invoice System Compliant) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <img src={assetUrl('logo-transparent.png')} alt="Logo" className="h-8 w-auto object-contain" />
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">SEMBAKO NUSANTARA JEPANG</h3>
                  <p className="text-[10px] text-stone-500">
                    Kwitansi / Faktur Pajak Resmi (適格請求書・領収書) • T1010001099882
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-stone-500">No. Faktur (請求番号):</p>
                <p className="font-bold text-stone-900">{selectedInvoice.id}</p>
              </div>
              <div>
                <p className="text-stone-500">Tanggal Transaksi:</p>
                <p className="font-bold text-stone-900">{selectedInvoice.date}</p>
              </div>
              <div>
                <p className="text-stone-500">Penerima (宛名):</p>
                <p className="font-bold text-stone-900">{selectedInvoice.customerName}</p>
              </div>
              <div>
                <p className="text-stone-500">Status Pembayaran:</p>
                <p className="font-bold text-emerald-600">Lunas (Paid via JPQR / PayPay)</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-2.5">Rincian Barang Makanan (8% 対象)</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedInvoice.items.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2.5 text-stone-800">{it.name} ※8%</td>
                      <td className="p-2.5 text-center">{it.qty}</td>
                      <td className="p-2.5 text-right font-medium">¥{it.price.toLocaleString('ja-JP')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="space-y-1.5 text-xs text-right border-t border-stone-100 pt-3">
              <div className="text-stone-500">
                Pajak Konsumsi Jepang (消費税 8% 軽減税率):{' '}
                <span className="font-medium text-stone-800">
                  ¥{selectedInvoice.taxAmount.toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="text-sm font-bold text-stone-900">
                Total Pembayaran (税込):{' '}
                <span className="text-lg text-[#c41230] font-black">
                  ¥{selectedInvoice.total.toLocaleString('ja-JP')}
                </span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Cetak / Simpan PDF Invoice (領収書)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
