import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../utils/assets';

export const AccountOrdersPage: React.FC = () => {
  const { isAuthenticated, currentUser, login, loginWithGoogle, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Form login states for unauthenticated users
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
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

  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem('sn_user_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return []; // Awalnya KOSONG murni (NON TRANSAKSI)
  });

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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            </button>

            {/* Quick Fill Demo Buttons for testing */}
            <div className="pt-1 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginId('customer01');
                  setPassword('customer123');
                }}
                className="text-[11px] font-bold text-[#c41230] hover:underline bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">person</span>
                <span>Contoh Akun Pelanggan (customer01)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-[11px] text-stone-400 font-medium uppercase tracking-wider">
                atau masuk dengan
              </span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {/* Google / Gmail OAuth Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm rounded-xl border border-stone-300 hover:border-stone-400 shadow-xs hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-98"
            >
              {isGoogleLoading ? (
                <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Google (Gmail)'}</span>
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
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
              <h1 className="font-heading font-black text-xl text-stone-900 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#c41230] text-2xl">receipt_long</span>
                <span>Riwayat Pesanan Saya (ご注文履歴)</span>
              </h1>
              <span className="text-xs font-bold px-3 py-1 bg-stone-100 text-stone-600 rounded-full">
                {orders.length} Transaksi
              </span>
            </div>

            {orders.length === 0 ? (
              /* CLEAN EMPTY TRANSACTION STATE */
              <div className="py-12 px-4 text-center space-y-5 bg-stone-50/70 rounded-2xl border border-dashed border-stone-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-xs border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <span className="material-symbols-outlined text-3xl text-stone-400">shopping_bag</span>
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="font-bold text-base text-stone-800">
                    Belum Ada Riwayat Pesanan
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Akun Anda belum memiliki riwayat transaksi belanja. Jelajahi katalog sembako, mie instan, bumbu nusantara, dan frozen food halal kami sekarang!
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-98"
                  >
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    <span>Mulai Belanja Sekarang (お買い物を始める)</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-[#EBE5DF] rounded-2xl p-5 hover:border-stone-300 transition-colors space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <span className="font-bold text-sm text-stone-900">{order.id}</span>
                        <span className="text-xs text-stone-400 ml-2">Tanggal: {order.date}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          order.status === 'Selesai'
                            ? 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
                            : order.status === 'Dikirim'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : order.status === 'Selesai Packing'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
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
                          : order.status}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 text-xs">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-stone-700">
                          <span>
                            {item.name} <span className="text-stone-400">({item.qty}x)</span>
                          </span>
                          <span className="font-semibold">¥{item.price.toLocaleString('ja-JP')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer & Action Buttons */}
                    <div className="border-t border-stone-100 pt-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="text-stone-600">
                        <span className="font-medium">Kurir:</span> <strong>{order.courier}</strong>
                        <span className="text-stone-400 ml-2">Resi: {order.trackingNumber}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-stone-500 mr-2 font-medium">Total:</span>
                          <span className="font-black text-sm text-[#c41230]">
                            ¥{order.total.toLocaleString('ja-JP')}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedInvoice(order)}
                          className="px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-50 font-bold text-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">receipt</span>
                          <span>領収書 (Invoice)</span>
                        </button>

                        <Link
                          to={`/tracking?resi=${order.trackingNumber}`}
                          className="px-4 py-1.5 bg-[#c41230] text-white rounded-lg hover:bg-[#9a0021] font-bold transition-all shadow-xs"
                        >
                          Lacak
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
