import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { assetUrl } from '../utils/assets';

type ActiveTab = 'overview' | 'barcode' | 'orders' | 'wishlist' | 'cart' | 'security' | 'edit_profile';

export const ProfilePage: React.FC = () => {
  const { isAuthenticated, currentUser, login, loginWithGoogle, logout, updateProfile, changePassword, isAdmin } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist, totalWishlistItems } = useWishlist();
  const { cart, totalItems, subtotalTax: totalPrice, removeFromCart, updateQuantity } = useCart();
  const { orders } = useAdmin();
  const navigate = useNavigate();

  // Active Profile Tab State (Defaults to 'overview')
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Form states for login when not authenticated
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Change Password Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');
  const [isPassLoading, setIsPassLoading] = useState(false);

  const [orderFilter, setOrderFilter] = useState<'ALL' | 'DIPROSES' | 'DIKIRIM' | 'SELESAI'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Computed Member ID
  const memberId = currentUser?.id
    ? `SN-JP-${currentUser.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}-2026`
    : 'SN-JP-MEMBER-2026';

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    if (!editName.trim()) {
      setProfileErrorMsg('Nama lengkap tidak boleh kosong.');
      return;
    }

    const res = await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      address: editAddress.trim()
    });

    if (res.success) {
      setProfileSuccessMsg('Profil berhasil diperbarui dengan aman!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } else {
      setProfileErrorMsg(res.error || 'Gagal menyimpan profil.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg('');
    setPassErrorMsg('');

    if (!currentPass || !newPass || !confirmPass) {
      setPassErrorMsg('Semua kolom password wajib diisi.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    if (newPass.length < 6) {
      setPassErrorMsg('Password baru minimal harus 6 karakter.');
      return;
    }

    setIsPassLoading(true);
    try {
      const res = await changePassword(currentPass, newPass);
      if (res.success) {
        setPassSuccessMsg('Password Anda berhasil diubah! Gunakan password baru untuk login berikutnya.');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        setTimeout(() => setPassSuccessMsg(''), 5000);
      } else {
        setPassErrorMsg(res.error || 'Gagal mengubah password.');
      }
    } catch (e) {
      setPassErrorMsg('Terjadi kesalahan teknis.');
    } finally {
      setIsPassLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'DIPROSES') return o.status === 'Diproses' || o.status === 'Dikemas' || o.status === 'Selesai Packing';
    if (orderFilter === 'DIKIRIM') return o.status === 'Dikirim';
    if (orderFilter === 'SELESAI') return o.status === 'Selesai';
    return true;
  });

  // =========================================================================
  // 1. STATE: BELUM LOGIN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-3xl border border-[#EBE5DF] shadow-xl p-8 sm:p-12 text-center space-y-6">
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
              Profil & Akun Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Silakan masuk untuk mengakses Kartu Member Barcode, Wishlist Favorit, Keranjang Belanja, Riwayat Pesanan, dan Pengaturan Password.
            </p>
          </div>

          {loginError && (
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-base shrink-0 text-red-500">error</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleFormLogin} className="max-w-md mx-auto space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                ID Pelanggan / Nomor HP / Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                  account_circle
                </span>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="Contoh: budi / customer01 / willy"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Kata Sandi / Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span className="material-symbols-outlined text-base">login</span>
              )}
              <span>Masuk ke Akun Profil</span>
            </button>

            {/* Quick Fill Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginId('budi');
                  setPassword('customer123');
                }}
                className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-xs">person</span>
                <span>Akun Budi (customer01)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginId('willy');
                  setPassword('123456');
                }}
                className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-xs">stars</span>
                <span>Akun Willy (VIP Gold)</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-[11px] text-stone-400 font-medium uppercase tracking-wider">
                atau masuk dengan
              </span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

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
  // 2. STATE: SUDAH LOGIN (AUTHENTICATED PROFILE HUB)
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Banner & Quick Profile Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-[#9a0021] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <img src={assetUrl('logo-transparent.png')} alt="" className="w-64 h-64 object-contain filter invert" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-amber-300 text-amber-300 font-black text-3xl flex items-center justify-center shadow-lg">
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)
                  : 'WP'}
              </div>
              <span className="absolute -bottom-2 -right-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-stone-900 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                VIP
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  {currentUser?.name || 'Pelanggan Nusantara'}
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-400 text-stone-950 text-[11px] font-black rounded-full uppercase tracking-wider">
                  {currentUser?.tier || (isAdmin ? 'Super Admin' : 'Gold Member')}
                </span>
              </div>
              <p className="text-xs text-stone-300 flex items-center justify-center sm:justify-start gap-2">
                <span className="material-symbols-outlined text-sm text-amber-300">qr_code_2</span>
                <span>ID Member: <strong>{memberId}</strong></span>
              </p>
              <p className="text-xs text-stone-300 flex items-center justify-center sm:justify-start gap-2">
                <span className="material-symbols-outlined text-sm text-amber-300">location_on</span>
                <span>{currentUser?.address || 'Tokyo-to, Jepang'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-[10px] text-stone-300 uppercase tracking-wider font-bold">Poin Reward Diaspora</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300">{currentUser?.loyaltyPoints ?? 500} <span className="text-xs font-bold text-white">JPY</span></span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 bg-white/15 hover:bg-red-600/80 border border-white/20 text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
          <button
            type="button"
            onClick={() => setActiveTab('barcode')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
              activeTab === 'barcode' ? 'bg-amber-400 text-stone-900 shadow-md font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">barcode_scanner</span>
            <div>
              <div className="text-[10px] opacity-80 uppercase">Barcode Member</div>
              <div className="text-xs sm:text-sm font-black">Lihat Barcode</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
              activeTab === 'wishlist' ? 'bg-amber-400 text-stone-900 shadow-md font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-2xl text-red-400">favorite</span>
            <div>
              <div className="text-[10px] opacity-80 uppercase">Wishlist Favorit</div>
              <div className="text-xs sm:text-sm font-black">{totalWishlistItems} Produk</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
              activeTab === 'orders' ? 'bg-amber-400 text-stone-900 shadow-md font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
            <div>
              <div className="text-[10px] opacity-80 uppercase">Pesanan Saya</div>
              <div className="text-xs sm:text-sm font-black">{orders.length} Transaksi</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 ${
              activeTab === 'cart' ? 'bg-amber-400 text-stone-900 shadow-md font-bold' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            <div>
              <div className="text-[10px] opacity-80 uppercase">Keranjang</div>
              <div className="text-xs sm:text-sm font-black">{totalItems} Item</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Profile Grid: Left Menu & Right Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Navigation Menu (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-[#EBE5DF] p-4 shadow-sm space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider">
              Menu Profil Khusus
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#c41230] text-white shadow-md'
                  : 'text-stone-700 hover:bg-stone-50 hover:text-[#c41230]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Ringkasan Akun (Overview)</span>
              </div>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('barcode')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'barcode'
                  ? 'bg-[#c41230] text-white shadow-md'
                  : 'text-stone-700 hover:bg-stone-50 hover:text-[#c41230]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-amber-500">qr_code_2</span>
                <span>Barcode Member Digital</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-full">VIP</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'wishlist'
                  ? 'bg-[#c41230] text-white shadow-md'
                  : 'text-stone-700 hover:bg-stone-50 hover:text-[#c41230]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-red-500">favorite</span>
                <span>Wishlist / Favorit Saya</span>
              </div>
              {totalWishlistItems > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-[#c41230] text-[10px] font-black rounded-full">
                  {totalWishlistItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#c41230] text-white shadow-md'
                  : 'text-stone-700 hover:bg-stone-50 hover:text-[#c41230]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-blue-500">receipt_long</span>
                <span>Pesanan Saya (Order History)</span>
              </div>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-black rounded-full">
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'cart'
                  ? 'bg-[#c41230] text-white shadow-md'
                  : 'text-stone-700 hover:bg-stone-50 hover:text-[#c41230]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-emerald-600">shopping_cart</span>
                <span>Keranjang Belanja</span>
              </div>
              {totalItems > 0 && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-[#c41230] text-white shadow-md'
                  : 'text-stone-700 hover:bg-stone-50 hover:text-[#c41230]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-purple-500">lock_reset</span>
                <span>Ganti Password & Keamanan</span>
              </div>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('edit_profile')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'edit_profile'
                  ? 'bg-[#c41230] text-white shadow-md'
                  : 'text-stone-700 hover:bg-stone-50 hover:text-[#c41230]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-amber-600">edit</span>
                <span>Ubah Data Alamat & HP</span>
              </div>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* Admin shortcuts if user is admin */}
          {isAdmin && (
            <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Akses Pengelola Super Admin</span>
              </div>
              <div className="space-y-2">
                <Link
                  to="/admin"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  <span>Dashboard Manajemen</span>
                </Link>
                <Link
                  to="/admin/pos"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-sm">point_of_sale</span>
                  <span>Mesin POS Kasir</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Dynamic Tab Content Area (8 cols) */}
        <div className="lg:col-span-8">
          {/* ================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="font-heading font-black text-xl text-stone-900">
                      Selamat Datang, {currentUser?.name}! 👋
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Kelola semua aktivitas belanja diaspora, pantau pengiriman Yamato/Sagawa, dan manfaatkan barcode member Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('barcode')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">qr_code_2</span>
                    <span>Tampilkan Barcode</span>
                  </button>
                </div>

                {/* Profile Data Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-stone-400 font-bold block uppercase text-[10px]">Nomor WhatsApp / HP</span>
                    <span className="font-bold text-stone-800 text-sm">{currentUser?.phone || '+81 80-1122-3344'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-stone-400 font-bold block uppercase text-[10px]">Email Terdaftar</span>
                    <span className="font-bold text-stone-800 text-sm truncate block">{currentUser?.email || `${currentUser?.id}@diaspora.jp`}</span>
                  </div>
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-stone-400 font-bold block uppercase text-[10px]">Alamat Pengiriman Utama di Jepang</span>
                    <span className="font-bold text-stone-800 text-sm">{currentUser?.address || 'Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4'}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit_profile')}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Edit Profil & Alamat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">lock_reset</span>
                    <span>Ganti Password</span>
                  </button>
                </div>
              </div>

              {/* Quick Jump Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Wishlist Box */}
                <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#c41230] font-bold text-sm">
                      <span className="material-symbols-outlined">favorite</span>
                      <span>Wishlist ({totalWishlistItems})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('wishlist')}
                      className="text-xs text-[#c41230] font-bold hover:underline"
                    >
                      Buka Semua →
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">
                    Produk-produk makanan, bumbu, & camilan favorit yang Anda simpan untuk dibeli nanti.
                  </p>
                </div>

                {/* Orders Box */}
                <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                      <span className="material-symbols-outlined">receipt_long</span>
                      <span>Pesanan ({orders.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Riwayat →
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">
                    Lacak status paket pengiriman Kurir Yamato & Sagawa serta download bukti invoice belanja.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: BARCODE MEMBER DIGITAL */}
          {/* ================================================================= */}
          {activeTab === 'barcode' && (
            <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-full uppercase tracking-wider">
                  Kartu Digital Diaspora VIP
                </span>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 mt-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">qr_code_2</span>
                  <span>Barcode & QR Member Resmi</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Tunjukkan barcode atau QR code ini kepada kasir di Toko Fisik Sembako Nusantara (Tokyo & Osaka) untuk mendapatkan diskon member dan poin loyalty otomatis.
                </p>
              </div>

              {/* High Quality Digital Member Card UI */}
              <div className="max-w-md mx-auto bg-gradient-to-br from-[#c41230] via-[#8B0000] to-stone-900 rounded-3xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden border-2 border-amber-300">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between relative z-10 mb-6">
                  <div className="flex items-center gap-2.5">
                    <img src={assetUrl('logo-transparent.png')} alt="Sembako Nusantara" className="h-8 w-auto filter invert brightness-200" />
                    <div>
                      <div className="font-heading font-black text-sm tracking-wide">SEMBAKO NUSANTARA</div>
                      <div className="text-[9px] text-amber-300 font-bold uppercase tracking-widest">JAPAN DIASPORA CARD</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-400 text-stone-950 font-black text-[10px] rounded-full shadow-sm">
                    {currentUser?.tier || 'GOLD MEMBER'}
                  </span>
                </div>

                {/* Member Info */}
                <div className="relative z-10 space-y-1 mb-6">
                  <div className="text-[10px] text-stone-300 uppercase tracking-wider">Nama Anggota Member:</div>
                  <div className="font-heading font-black text-xl text-white tracking-wide">{currentUser?.name || 'Willy Pratama'}</div>
                  <div className="text-xs text-amber-300 font-mono font-bold tracking-widest mt-1">{memberId}</div>
                </div>

                {/* Barcode Strip Graphic (Crisp SVG Representation) */}
                <div className="bg-white rounded-2xl p-4 text-stone-900 text-center shadow-inner relative z-10">
                  <div className="flex justify-center items-center gap-[3px] h-14 py-1 overflow-hidden">
                    {/* Stylized Code 128 Barcode lines */}
                    {[
                      4, 2, 6, 1, 3, 5, 2, 4, 1, 7, 3, 2, 5, 1, 4, 6, 2, 3, 1, 5, 4, 2, 6, 1, 3, 7, 2, 4, 1, 5, 3, 6, 2, 4, 1, 5
                    ].map((w, idx) => (
                      <div
                        key={idx}
                        className="bg-black h-full rounded-xs"
                        style={{ width: `${w * 1.5}px` }}
                      ></div>
                    ))}
                  </div>
                  <div className="font-mono text-xs font-black tracking-widest text-stone-800 mt-1">
                    *{memberId}*
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-300 mt-4 relative z-10">
                  <span>Poin Reward: <strong className="text-amber-300">{currentUser?.loyaltyPoints ?? 500} JPY</strong></span>
                  <span>Masa Berlaku: <strong>Seumur Hidup</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(memberId);
                    alert(`ID Member "${memberId}" berhasil disalin ke clipboard!`);
                  }}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  <span>Salin ID Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span>Cetak Kartu Member</span>
                </button>
              </div>

              {/* Benefits */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2 text-stone-800">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-amber-600">verified</span>
                  <span>Keuntungan Khusus Anggota Sembako Nusantara Jepang:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1">
                  <li>Diskon spesial setiap tanggal 25 (Hari Belanja Gajian Diaspora).</li>
                  <li>Kumpulkan 1 Poin untuk setiap 100 JPY pembelanjaan di website maupun toko fisik.</li>
                  <li>Gratis ongkir kurir Yamato / Sagawa untuk transaksi tertentu.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: WISHLIST (FAVORIT SAYA) */}
          {/* ================================================================= */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-2xl">favorite</span>
                    <span>Wishlist Produk Favorit ({totalWishlistItems})</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Daftar produk yang pernah Anda klik simpan atau sukai.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/wishlist"
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    <span>Halaman Wishlist Penuh</span>
                  </Link>
                  {wishlist.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Kosongkan semua daftar wishlist?')) clearWishlist();
                      }}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#c41230] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Kosongkan
                    </button>
                  )}
                </div>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">favorite_border</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-800 text-base">Wishlist Anda Masih Kosong</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Jelajahi katalog sembako halal kami dan klik ikon hati ❤️ pada produk yang Anda sukai untuk menyimpannya di sini.
                    </p>
                  </div>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-full shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    <span>Mulai Jelajah Katalog</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-stone-200 hover:border-red-300 p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative">
                        <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-xl bg-stone-50 aspect-square">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-contain p-2 hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(product.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-red-50 text-stone-400 hover:text-red-500 flex items-center justify-center shadow-xs transition-colors"
                          title="Hapus dari Wishlist"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>

                      <div className="mt-3 space-y-2">
                        <Link to={`/product/${product.id}`} className="block">
                          <h4 className="font-bold text-xs text-stone-900 line-clamp-2 hover:text-[#c41230] transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-stone-400 block mt-0.5">{product.category}</span>
                        </Link>

                        <div className="flex items-center justify-between pt-1">
                          <div className="text-sm font-black text-[#c41230]">
                            ¥{product.price.toLocaleString()}
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            className="px-3 py-1 bg-[#c41230] hover:bg-[#9a0021] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">shopping_cart</span>
                            <span>Beli</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: PESANAN SAYA (ORDERS) */}
          {/* ================================================================= */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-2xl">receipt_long</span>
                    <span>Riwayat Pesanan Saya</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Pantau status pengiriman paket dan unduh bukti transaksi.
                  </p>
                </div>

                {/* Status Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'DIPROSES', 'DIKIRIM', 'SELESAI'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderFilter === filter
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                      }`}
                    >
                      {filter === 'ALL' ? 'Semua' : filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">inbox</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-800 text-base">Belum Ada Transaksi</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Anda belum memiliki pesanan aktif. Mulai belanja produk makanan Indonesia sekarang!
                    </p>
                  </div>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-full shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    <span>Belanja Sekarang</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-stone-900">Pesanan #{order.id}</span>
                          <span className="text-[11px] text-stone-400 block">{order.date}</span>
                        </div>
                        <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-full">
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-stone-700">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-stone-900">{item.productName || item.name}</span>
                              <span className="text-stone-400">x{item.quantity}</span>
                            </div>
                            <span className="font-bold">¥{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                        <span className="text-stone-500">Total Pembayaran:</span>
                        <span className="text-base font-black text-[#c41230]">¥{order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: KERANJANG SAYA (CART PREVIEW) */}
          {/* ================================================================= */}
          {activeTab === 'cart' && (
            <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-2xl">shopping_cart</span>
                    <span>Keranjang Belanja Aktif ({totalItems} Item)</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Item yang siap Anda checkout untuk pengiriman ke seluruh prefektur Jepang.
                  </p>
                </div>
                <Link
                  to="/cart"
                  className="px-4 py-2 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  <span>Buka Halaman Checkout</span>
                </Link>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-800 text-base">Keranjang Anda Masih Kosong</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Tambahkan produk sembako, bumbu instan, atau camilan favorit Anda ke keranjang.
                    </p>
                  </div>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-full shadow-md transition-all"
                  >
                    <span>Mulai Belanja</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-stone-100">
                    {cart.map(({ product, quantity }) => (
                      <div key={product.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-contain rounded-xl bg-stone-50 p-1 border border-stone-200"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{product.name}</h4>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              ¥{product.price.toLocaleString()} × {quantity}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-1 text-xs font-bold text-stone-900">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-black text-xs text-[#c41230] w-16 text-right">
                            ¥{(product.price * quantity).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id)}
                            className="text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-stone-500 block">Total Estimasi Belanja:</span>
                      <span className="text-xl font-black text-[#c41230]">¥{totalPrice.toLocaleString()}</span>
                    </div>
                    <Link
                      to="/checkout"
                      className="px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                    >
                      Lanjut ke Pembayaran →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: GANTI PASSWORD & KEAMANAN */}
          {/* ================================================================= */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-2xl">lock_reset</span>
                  <span>Ganti Password & Keamanan Akun</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Amankan akun Anda dengan memperbarui password secara berkala.
                </p>
              </div>

              {passSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
                  <span className="font-bold">{passSuccessMsg}</span>
                </div>
              )}

              {passErrorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-red-500">error</span>
                  <span>{passErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="max-w-lg space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Password Saat Ini / Lama
                  </label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                    required
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    (Default akun customer: <strong>customer123</strong> atau <strong>123456</strong>)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPassLoading}
                  className="px-6 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPassLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-base">save</span>
                  )}
                  <span>Simpan Perubahan Password</span>
                </button>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: EDIT PROFILE & ALAMAT */}
          {/* ================================================================= */}
          {activeTab === 'edit_profile' && (
            <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-2xl">edit</span>
                  <span>Ubah Informasi Profil & Alamat Jepang</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Perbarui alamat tempat tinggal Anda untuk kelancaran pengiriman paket kurir Yamato & Sagawa.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
                  <span className="font-bold">{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-red-500">error</span>
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Nomor WhatsApp / Telepon Jepang
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+81 80-XXXX-XXXX"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Alamat Lengkap di Jepang (Termasuk Nama Prefektur, Distrik & Apartemen)
                  </label>
                  <textarea
                    rows={3}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Contoh: 〒134-0088 Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4 Mansion Nusantara 201"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Simpan Perubahan Data</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
