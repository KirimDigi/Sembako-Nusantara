import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../utils/assets';
import { getMemberId, getCode39BarcodeBars, downloadMemberCardPng } from '../utils/memberCard';
import { sendRegistrationWhatsApp } from '../services/whatsappGateway';

type ActiveTab = 'overview' | 'barcode' | 'orders' | 'wishlist' | 'cart' | 'security' | 'edit_profile';

const JAPAN_PREFECTURES = [
  'Tokyo-to (東京都)',
  'Kanagawa (神奈川県)',
  'Osaka-fu (大阪府)',
  'Aichi (愛知県)',
  'Saitama (埼玉県)',
  'Chiba (千葉県)',
  'Hyogo (兵庫県)',
  'Hokkaido (北海道)',
  'Fukuoka (福岡県)',
  'Shizuoka (静岡県)',
  'Ibaraki (茨城県)',
  'Hiroshima (広島県)',
  'Kyoto-fu (京都府)',
  'Miyagi (宮城県)',
  'Niigata (新潟県)',
  'Nagano (長野県)',
  'Gifu (岐阜県)',
  'Gunma (群馬県)',
  'Tochigi (栃木県)',
  'Okayama (岡山県)',
  'Mie (三重県)',
  'Kumamoto (熊本県)',
  'Kagoshima (鹿児島県)',
  'Okinawa (沖縄県)',
  'Shiga (滋賀県)',
  'Nara (奈良県)',
  'Wakayama (和歌山県)',
  'Yamaguchi (山口県)',
  'Ehime (愛媛県)',
  'Nagasaki (長崎県)',
  'Oita (大分県)',
  'Ishikawa (石川県)',
  'Fukushima (福島県)',
  'Aomori (青森県)',
  'Iwate (岩手県)',
  'Akita (秋田県)',
  'Yamagata (山形県)',
  'Toyama (富山県)',
  'Fukui (福井県)',
  'Yamanashi (山梨県)',
  'Tottori (鳥取県)',
  'Shimane (島根県)',
  'Tokushima (徳島県)',
  'Kagawa (香川県)',
  'Kochi (高知県)',
  'Saga (佐賀県)',
  'Miyazaki (宮崎県)'
];

export const ProfilePage: React.FC = () => {
  const { isAuthenticated, currentUser, login, loginWithGoogle, logout, updateProfile, changePassword, deleteAccount, isAdmin } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist, totalWishlistItems } = useWishlist();
  const { cart, totalItems, subtotalTax: totalPrice, removeFromCart, updateQuantity } = useCart();
  const { orders, addCustomer } = useAdmin();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Active Profile Tab State (Defaults to 'overview')
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Form states for login when not authenticated
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Auth Mode State: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPostalCode, setRegPostalCode] = useState('');
  const [regPrefecture, setRegPrefecture] = useState('Tokyo-to (東京都)');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditPhone(currentUser.phone || '');
      setEditAddress(currentUser.address || '');
    }
  }, [currentUser]);

  // Change Password Form State
  const [currentPass, setCurrentPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');
  const [isPassLoading, setIsPassLoading] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [orderFilter, setOrderFilter] = useState<'ALL' | 'DIPROSES' | 'DIKIRIM' | 'SELESAI'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Card Download State
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);

  // Computed Unique Member ID & 100% Scannable Code 39 Barcode Bars
  const memberId = useMemo(() => getMemberId(currentUser), [currentUser]);
  const barcodeBars = useMemo(() => getCode39BarcodeBars(memberId, 2, 4.8, 2), [memberId]);

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setLoginError(res.error);
      } else if (res.success) {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setLoginError(
        language === 'JP'
          ? 'Googleアカウントの連携に失敗しました。'
          : language === 'EN'
          ? 'Failed to connect to Google account.'
          : 'Gagal menghubungkan ke akun Google.'
      );
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
        const isPosKasir =
          res.user?.role === 'Kasir (POS)' ||
          res.user?.role?.toLowerCase().includes('kasir') ||
          res.user?.role?.toLowerCase().includes('pos');
        const isAdminAccount =
          res.isAdmin ||
          loginId.trim().toLowerCase() === 'id0926' ||
          res.user?.role === 'Super Admin (Owner)';

        if (isPosKasir) {
          navigate('/admin/pos', { replace: true });
        } else if (isAdminAccount) {
          navigate('/admin/pos', { replace: true });
        } else {
          // Semua akun selain akun POS kasir wajib langsung ke beranda
          navigate('/', { replace: true });
        }
      } else {
        setLoginError(
          res.error ||
            (language === 'JP'
              ? 'ログインに失敗しました。'
              : language === 'EN'
              ? 'Failed to log in.'
              : 'Gagal masuk akun.')
        );
      }
    } catch (err) {
      setLoginError(
        language === 'JP'
          ? 'ログイン中にエラーが発生しました。'
          : language === 'EN'
          ? 'An error occurred during login.'
          : 'Terjadi kesalahan saat masuk akun.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError(
        language === 'JP'
          ? 'お名前を入力してください。'
          : language === 'EN'
          ? 'Please enter your full name.'
          : 'Silakan masukkan nama lengkap Anda.'
      );
      return;
    }

    if (!regPhone.trim()) {
      setRegError(
        language === 'JP'
          ? '電話番号を入力してください。'
          : language === 'EN'
          ? 'Please enter your phone number.'
          : 'Silakan masukkan nomor telepon / WhatsApp Anda.'
      );
      return;
    }

    if (!regPostalCode.trim()) {
      setRegError(
        language === 'JP'
          ? '郵便番号を入力してください。'
          : language === 'EN'
          ? 'Please enter your postal code.'
          : 'Silakan masukkan kode pos di Jepang (misal: 134-0088).'
      );
      return;
    }

    if (!regPrefecture.trim()) {
      setRegError(
        language === 'JP'
          ? '都道府県を選択してください。'
          : language === 'EN'
          ? 'Please select your prefecture.'
          : 'Silakan pilih prefektur tempat tinggal di Jepang.'
      );
      return;
    }

    if (!regCity.trim()) {
      setRegError(
        language === 'JP'
          ? '市区町村を入力してください。'
          : language === 'EN'
          ? 'Please enter your city/district.'
          : 'Silakan masukkan kota / distrik tempat tinggal Anda.'
      );
      return;
    }

    if (!regAddress.trim()) {
      setRegError(
        language === 'JP'
          ? '番地・建物名を入力してください。'
          : language === 'EN'
          ? 'Please enter your street address / apartment.'
          : 'Silakan masukkan alamat lengkap (nomor rumah, gedung, apartemen).'
      );
      return;
    }

    if (regPassword.length < 4) {
      setRegError(
        language === 'JP'
          ? 'パスワードは4文字以上で設定してください。'
          : language === 'EN'
          ? 'Password must be at least 4 characters.'
          : 'Kata sandi minimal 4 karakter.'
      );
      return;
    }

    setIsRegLoading(true);
    try {
      const cleanPhoneDigits = regPhone.trim().replace(/\D/g, '');
      const newCustId = 'cust-' + (cleanPhoneDigits.length >= 6 ? cleanPhoneDigits.slice(-6) : Math.floor(100000 + Math.random() * 900000));
      const fullAddress = `〒${regPostalCode.trim()} ${regPrefecture.trim()} ${regCity.trim()} ${regAddress.trim()}`;

      // Simpan langsung ke database table customers di CRM Admin
      addCustomer({
        id: newCustId,
        name: regName.trim(),
        phone: regPhone.trim(),
        postalCode: regPostalCode.trim(),
        prefecture: regPrefecture.trim(),
        city: regCity.trim(),
        address: regAddress.trim(),
        password: regPassword,
        totalOrders: 0,
        totalSpent: 0,
        loyaltyPoints: 100,
        tier: 'Bronze',
        preferredLanguage: language === 'JP' ? 'JP' : language === 'EN' ? 'EN' : 'ID'
      });

      // Login instan menggunakan ID Member baru atau Nomor HP
      const res = await login(newCustId, regPassword);
      if (res.success && res.user) {
        await updateProfile({
          id: newCustId,
          name: regName.trim(),
          phone: regPhone.trim(),
          address: fullAddress,
          postalCode: regPostalCode.trim(),
          prefecture: regPrefecture.trim(),
          city: regCity.trim()
        });

        try {
          localStorage.setItem(
            'sn_registered_customer_address',
            JSON.stringify({
              name: regName.trim(),
              phone: regPhone.trim(),
              postalCode: regPostalCode.trim(),
              prefecture: regPrefecture.trim(),
              city: regCity.trim(),
              address: regAddress.trim()
            })
          );
        } catch (err) {}

        // Kirim Notifikasi WhatsApp Gateway Selamat Datang & Verifikasi ke Nomor Terdaftar
        sendRegistrationWhatsApp({
          name: regName.trim(),
          phone: regPhone.trim(),
          address: fullAddress,
          custId: newCustId,
          loyaltyPoints: 100,
          language: language
        }).catch((err) => {
          console.warn('[WA Gateway] Gagal kirim WA registrasi akun:', err);
        });

        // Semua akun pelanggan baru setelah login langsung href ke beranda
        navigate('/', { replace: true });
      } else {
        setRegError(res.error || 'Gagal mendaftar akun baru.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Terjadi kesalahan saat mendaftar akun.');
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    if (!editName.trim()) {
      setProfileErrorMsg(
        language === 'JP'
          ? '氏名を入力してください。'
          : language === 'EN'
          ? 'Full name cannot be empty.'
          : 'Nama lengkap tidak boleh kosong.'
      );
      return;
    }

    const res = await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim()
    });

    if (res.success) {
      setProfileSuccessMsg(
        language === 'JP'
          ? 'プロフィールが正常に更新されました！'
          : language === 'EN'
          ? 'Profile updated successfully!'
          : 'Profil berhasil diperbarui dengan aman!'
      );
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } else {
      setProfileErrorMsg(
        res.error ||
          (language === 'JP'
            ? 'プロフィールの保存に失敗しました。'
            : language === 'EN'
            ? 'Failed to save profile.'
            : 'Gagal menyimpan profil.')
      );
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg('');
    setPassErrorMsg('');

    if (!currentPass || !newPass || !confirmPass) {
      setPassErrorMsg(
        language === 'JP'
          ? 'すべてのパスワード項目を入力してください。'
          : language === 'EN'
          ? 'All password fields are required.'
          : 'Semua kolom password wajib diisi.'
      );
      return;
    }

    if (newPass !== confirmPass) {
      setPassErrorMsg(
        language === 'JP'
          ? '確認用パスワードが一致しません。'
          : language === 'EN'
          ? 'New password confirmation does not match.'
          : 'Konfirmasi password baru tidak cocok.'
      );
      return;
    }

    if (newPass.length < 6) {
      setPassErrorMsg(
        language === 'JP'
          ? '新しいパスワードは6文字以上で設定してください。'
          : language === 'EN'
          ? 'New password must be at least 6 characters.'
          : 'Password baru minimal harus 6 karakter.'
      );
      return;
    }

    setIsPassLoading(true);
    try {
      const res = await changePassword(currentPass, newPass);
      if (res.success) {
        setPassSuccessMsg(
          language === 'JP'
            ? 'パスワードが正常に変更されました！次回ログイン時から新しいパスワードをご使用ください。'
            : language === 'EN'
            ? 'Password changed successfully! Please use your new password next time.'
            : 'Password Anda berhasil diubah! Gunakan password baru untuk login berikutnya.'
        );
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        setTimeout(() => setPassSuccessMsg(''), 5000);
      } else {
        setPassErrorMsg(
          res.error ||
            (language === 'JP'
              ? 'パスワードの変更に失敗しました。'
              : language === 'EN'
              ? 'Failed to change password.'
              : 'Gagal mengubah password.')
        );
      }
    } catch (e) {
      setPassErrorMsg(
        language === 'JP'
          ? '技術的な問題が発生しました。'
          : language === 'EN'
          ? 'A technical error occurred.'
          : 'Terjadi kesalahan teknis.'
      );
    } finally {
      setIsPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        setShowDeleteModal(false);
        alert(
          language === 'JP'
            ? 'アカウントが正常に完全削除されました。'
            : language === 'EN'
            ? 'Your account has been deleted permanently.'
            : 'Akun Anda telah berhasil dihapus secara permanen. Semua data akun dan sesi telah dibersihkan.'
        );
        navigate('/');
      } else {
        alert(
          res.error ||
            (language === 'JP'
              ? 'アカウントの削除に失敗しました。'
              : language === 'EN'
              ? 'Failed to delete account.'
              : 'Gagal menghapus akun.')
        );
      }
    } catch (e) {
      alert(
        language === 'JP'
          ? 'アカウント削除中にエラーが発生しました。'
          : language === 'EN'
          ? 'An error occurred while deleting account.'
          : 'Terjadi kesalahan saat menghapus akun.'
      );
    } finally {
      setIsDeletingAccount(false);
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
          {/* Logo & Animated Mascot Stepping into Door (Login Gateway Visual) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mx-auto pb-1">
            {/* Brand Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex items-center justify-center shrink-0"
            >
              <img
                src={assetUrl('logo-transparent.png')}
                alt="Sembako Nusantara"
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm"
              />
            </motion.div>

            {/* Mascot Cat Stepping into the Door (Animated GIF) */}
            <div
              className="relative flex items-center justify-center group shrink-0 hover:scale-105 transition-transform duration-300"
              title={
                language === 'JP'
                  ? 'いらっしゃいませ！ログインしてね'
                  : language === 'EN'
                  ? 'Welcome! Step inside and sign in'
                  : 'Selamat Datang! Masuk ke akun Anda'
              }
            >
              <div className="relative">
                <img
                  src={assetUrl('mascot-login-door.gif')}
                  alt="Mascot Kucing Masuk ke Pintu Toko (Login)"
                  className="h-24 sm:h-32 w-auto object-contain drop-shadow-md"
                />
              </div>

              {/* Cute speech bubble above mascot */}
              <div
                className="absolute -top-3 -right-2 bg-gradient-to-r from-[#c41230] to-rose-600 text-white text-[10px] sm:text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md whitespace-nowrap border-2 border-white flex items-center gap-1 pointer-events-none"
              >
                <span>🚪</span>
                <span>
                  {language === 'JP'
                    ? 'ログインへ！'
                    : language === 'EN'
                    ? 'Step Inside!'
                    : 'Yuk Masuk!'}
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-wider">
              {authMode === 'register'
                ? language === 'JP'
                  ? 'ステータス: 新規会員登録'
                  : language === 'EN'
                  ? 'Status: New Member Registration'
                  : 'Status: Pendaftaran Member Baru'
                : language === 'JP'
                ? 'ステータス: 未ログイン (ログインがひつよう です)'
                : language === 'EN'
                ? 'Status: Not Logged In (Login Required)'
                : 'Status: Belum Masuk (Login Diperlukan)'}
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
              {authMode === 'register'
                ? language === 'JP'
                  ? '新規会員登録'
                  : language === 'EN'
                  ? 'Register New Member'
                  : 'Daftar Akun Member Baru'
                : language === 'JP'
                ? 'ユーザー プロフィール & アカウント'
                : language === 'EN'
                ? 'User Profile & Account'
                : 'Profil & Akun Pengguna'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {authMode === 'register'
                ? language === 'JP'
                  ? '無料会員登録でデジタルVIP会員カード、特別割引、注文履歴管理をご利用いただけます。'
                  : language === 'EN'
                  ? 'Create a free account to unlock your digital VIP member card, member perks, and easy order tracking.'
                  : 'Daftar gratis untuk mendapatkan Kartu Member Digital VIP, promo belanja, dan kemudahan lacak pesanan.'
                : language === 'JP'
                ? 'デジタル会員バーコード、お気に入り、買い物かご、注文履歴、セキュリティ設定をご利用いただくにはログインしてください。'
                : language === 'EN'
                ? 'Please sign in to access your digital member barcode, wishlist, cart, order history, and security settings.'
                : 'Silakan masuk untuk mengakses Kartu Member Barcode, Wishlist Favorit, Keranjang Belanja, Riwayat Pesanan, dan Pengaturan Password.'}
            </p>
          </div>

          {/* Form Error Alerts */}
          {loginError && authMode === 'login' && (
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-base shrink-0 text-red-500">error</span>
              <span>{loginError}</span>
            </div>
          )}

          {regError && authMode === 'register' && (
            <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-base shrink-0 text-red-500">error</span>
              <span>{regError}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleFormLogin} className="max-w-md mx-auto space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {language === 'JP'
                    ? '会員ID / 電話番号 / メールアドレス'
                    : language === 'EN'
                    ? 'Member ID or Phone Number'
                    : 'ID Pelanggan (contoh: cust-1) atau Nomor HP di Jepang'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                    badge
                  </span>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={
                      language === 'JP'
                        ? '例: cust-1 または 08011223344'
                        : language === 'EN'
                        ? 'e.g. cust-1 or 080-1122-3344'
                        : 'Contoh: cust-1 atau 080-1122-3344'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {language === 'JP'
                    ? 'パスワード'
                    : language === 'EN'
                    ? 'Password'
                    : 'Kata Sandi / Password'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
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
                className="w-full py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-base">login</span>
                )}
                <span>
                  {language === 'JP'
                    ? 'アカウントにログイン'
                    : language === 'EN'
                    ? 'Sign In to Account'
                    : 'Masuk ke Akun Profil'}
                </span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="shrink mx-3 text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
                  {language === 'JP'
                    ? 'まだアカウントをお持ちでない方'
                    : language === 'EN'
                    ? "Don't have an account?"
                    : 'Belum Punya Akun?'}
                </span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              {/* Ganti Masuk dengan Google menjadi Daftar Klik Disini */}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setLoginError('');
                  setRegError('');
                }}
                className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-[#c41230] hover:text-[#9a0021] font-bold text-xs sm:text-sm rounded-xl border-2 border-[#c41230] hover:border-[#9a0021] shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-lg">person_add</span>
                <span>
                  {language === 'JP'
                    ? '新規会員登録・アカウント作成はこちら'
                    : language === 'EN'
                    ? 'Create Account / Register Click Here'
                    : 'Buat Akun / Daftar Klik Disini'}
                </span>
              </button>
            </form>
          )}

          {/* MODE 2: REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleFormRegister} className="max-w-md mx-auto space-y-3.5 text-left animate-in fade-in duration-200">
              {/* 1. Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  1. {language === 'JP' ? 'お名前 (氏名)' : language === 'EN' ? 'Full Name' : 'Nama Lengkap'} <span className="text-[#c41230]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                    badge
                  </span>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={language === 'JP' ? '例: Willy Pratama' : 'Contoh: Willy Pratama'}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* 2. No Telfon */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  2. {language === 'JP' ? '電話番号 / WhatsApp' : language === 'EN' ? 'Phone / WhatsApp in Japan' : 'No Telepon / WhatsApp di Jepang'} <span className="text-[#c41230]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                    call
                  </span>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Contoh: 080-1122-3344 atau +81 80-1122-3344"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Grid 2 Kolom: 4. Kode Pos & 5. Prefektur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 4. Kode Pos */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    4. {language === 'JP' ? '郵便番号 (〒)' : 'Kode Pos (〒 郵便番号)'} <span className="text-[#c41230]">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                      pin_drop
                    </span>
                    <input
                      type="text"
                      value={regPostalCode}
                      onChange={(e) => setRegPostalCode(e.target.value)}
                      placeholder="134-0088"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all font-mono font-medium"
                      required
                    />
                  </div>
                </div>

                {/* 5. Prefektur */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    5. {language === 'JP' ? '都道府県' : 'Prefektur (都道府県)'} <span className="text-[#c41230]">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg pointer-events-none">
                      map
                    </span>
                    <select
                      value={regPrefecture}
                      onChange={(e) => setRegPrefecture(e.target.value)}
                      className="w-full pl-10 pr-7 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all font-medium appearance-none cursor-pointer"
                      required
                    >
                      {JAPAN_PREFECTURES.map((pref) => (
                        <option key={pref} value={pref}>
                          {pref}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. Kota / Distrik */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  6. {language === 'JP' ? '市区町村' : 'Kota / Distrik (市区町村)'} <span className="text-[#c41230]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                    location_city
                  </span>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Contoh: Edogawa-ku, Shinjuku-ku, Osaka-shi"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* 3. Alamat Lengkap */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  3. {language === 'JP' ? '番地・建物名・部屋番号' : 'Alamat Lengkap (Nomor Rumah, Gedung, No Kamar)'} <span className="text-[#c41230]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                    home
                  </span>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Contoh: Nishi-Kasai 3-1-4, Mansion Sakura #302"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Kata Sandi / Password Baru */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'JP' ? 'パスワード' : language === 'EN' ? 'Create Password' : 'Kata Sandi / Password Akun'} <span className="text-[#c41230]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter untuk login"
                    className="w-full pl-10 pr-11 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] focus:ring-1 focus:ring-[#c41230] outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-200/50 flex items-center justify-center cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${showRegPassword ? 'text-[#c41230]' : 'text-stone-400'}`}>
                      {showRegPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegLoading}
                className="w-full py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
              >
                {isRegLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                )}
                <span>
                  {language === 'JP'
                    ? '会員登録してアカウントを作成'
                    : language === 'EN'
                    ? 'Create Account Now'
                    : 'Daftar & Buat Akun Sekarang'}
                </span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="shrink mx-3 text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
                  {language === 'JP'
                    ? 'すでにアカウントをお持ちの方'
                    : language === 'EN'
                    ? 'Already have an account?'
                    : 'Sudah Punya Akun?'}
                </span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setRegError('');
                  setLoginError('');
                }}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>
                  {language === 'JP'
                    ? 'ログイン画面に戻る'
                    : language === 'EN'
                    ? 'Back to Sign In'
                    : 'Sudah Punya Akun? Masuk Disini'}
                </span>
              </button>
            </form>
          )}
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
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-amber-300 overflow-hidden shadow-lg flex items-center justify-center">
                <img
                  src={currentUser?.avatar || assetUrl('avatar-jangsan.png')}
                  alt={currentUser?.name || 'Avatar Profile'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = assetUrl('avatar-jangsan.png');
                  }}
                />
              </div>
              <span className="absolute -bottom-2 -right-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-stone-900 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                VIP
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  {currentUser?.name || (language === 'JP' ? 'ヌサンタラ 会員様' : language === 'EN' ? 'Nusantara Customer' : 'Pelanggan Nusantara')}
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-400 text-stone-950 text-[11px] font-black rounded-full uppercase tracking-wider">
                  {currentUser?.tier || (isAdmin ? (language === 'JP' ? 'スーパー管理者' : 'Super Admin') : (language === 'JP' ? 'ゴールド会員' : 'Gold Member'))}
                </span>
              </div>
              <p className="text-xs text-stone-300 flex items-center justify-center sm:justify-start gap-2">
                <span className="material-symbols-outlined text-sm text-amber-300">qr_code_2</span>
                <span>
                  {language === 'JP' ? '会員番号:' : language === 'EN' ? 'Member ID:' : 'ID Member:'}{' '}
                  <strong>{memberId}</strong>
                </span>
              </p>
              <p className="text-xs text-stone-300 flex items-center justify-center sm:justify-start gap-2">
                <span className="material-symbols-outlined text-sm text-amber-300">location_on</span>
                <span>{currentUser?.address || (language === 'JP' ? '東京都 (日本全国配送対応)' : 'Tokyo-to, Jepang')}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2.5 bg-white/15 hover:bg-red-600/80 border border-white/20 text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>{language === 'JP' ? 'ログアウト' : language === 'EN' ? 'Logout' : 'Keluar'}</span>
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
              <div className="text-[10px] opacity-80 uppercase">
                {language === 'JP' ? '会員バーコード' : language === 'EN' ? 'Member Barcode' : 'Barcode Member'}
              </div>
              <div className="text-xs sm:text-sm font-black">
                {language === 'JP' ? 'バーコード表示' : language === 'EN' ? 'View Barcode' : 'Lihat Barcode'}
              </div>
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
              <div className="text-[10px] opacity-80 uppercase">
                {language === 'JP' ? 'お気に入り' : language === 'EN' ? 'Wishlist' : 'Wishlist Favorit'}
              </div>
              <div className="text-xs sm:text-sm font-black">
                {language === 'JP' ? `${totalWishlistItems} 点の品物` : language === 'EN' ? `${totalWishlistItems} Items` : `${totalWishlistItems} Produk`}
              </div>
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
              <div className="text-[10px] opacity-80 uppercase">
                {language === 'JP' ? 'ご注文履歴' : language === 'EN' ? 'My Orders' : 'Pesanan Saya'}
              </div>
              <div className="text-xs sm:text-sm font-black">
                {language === 'JP' ? `${orders.length} 件のお取引` : language === 'EN' ? `${orders.length} Orders` : `${orders.length} Transaksi`}
              </div>
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
              <div className="text-[10px] opacity-80 uppercase">
                {language === 'JP' ? '買い物かご' : language === 'EN' ? 'Shopping Cart' : 'Keranjang'}
              </div>
              <div className="text-xs sm:text-sm font-black">
                {language === 'JP' ? `${totalItems} 点` : language === 'EN' ? `${totalItems} Items` : `${totalItems} Item`}
              </div>
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
              {language === 'JP' ? '専用プロフィール メニュー' : language === 'EN' ? 'Profile Menu' : 'Menu Profil Khusus'}
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
                <span>
                  {language === 'JP'
                    ? 'アカウント概要 (マイページ)'
                    : language === 'EN'
                    ? 'Account Overview'
                    : 'Ringkasan Akun (Overview)'}
                </span>
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
                <span>
                  {language === 'JP'
                    ? 'デジタル会員バーコード'
                    : language === 'EN'
                    ? 'Digital Member Barcode'
                    : 'Barcode Member Digital'}
                </span>
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
                <span>
                  {language === 'JP'
                    ? 'お気に入り / ウィッシュリスト'
                    : language === 'EN'
                    ? 'My Wishlist / Favorites'
                    : 'Wishlist / Favorit Saya'}
                </span>
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
                <span>
                  {language === 'JP'
                    ? '注文履歴 (配送状況)'
                    : language === 'EN'
                    ? 'My Orders (History)'
                    : 'Pesanan Saya (Order History)'}
                </span>
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
                <span>
                  {language === 'JP'
                    ? '買い物かご'
                    : language === 'EN'
                    ? 'Shopping Cart'
                    : 'Keranjang Belanja'}
                </span>
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
                <span>
                  {language === 'JP'
                    ? 'パスワード変更 & セキュリティ'
                    : language === 'EN'
                    ? 'Change Password & Security'
                    : 'Ganti Password & Keamanan'}
                </span>
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
                <span>
                  {language === 'JP'
                    ? 'お届け先住所 & 電話番号の変更'
                    : language === 'EN'
                    ? 'Edit Address & Contact Info'
                    : 'Ubah Data Alamat & HP'}
                </span>
              </div>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          {/* Admin shortcuts if user is admin */}
          {isAdmin && (
            <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>
                  {language === 'JP' ? 'スーパー管理者アクセス' : language === 'EN' ? 'Super Admin Access' : 'Akses Pengelola Super Admin'}
                </span>
              </div>
              <div className="space-y-2">
                <Link
                  to="/admin"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  <span>{language === 'JP' ? '管理ダッシュボード' : language === 'EN' ? 'Management Dashboard' : 'Dashboard Manajemen'}</span>
                </Link>
                <Link
                  to="/admin/pos"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-sm">point_of_sale</span>
                  <span>{language === 'JP' ? 'POSレジシステム' : language === 'EN' ? 'POS Cashier Register' : 'Mesin POS Kasir'}</span>
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
                      {language === 'JP'
                        ? `ようこそ、${currentUser?.name || '会員'} 様！👋`
                        : language === 'EN'
                        ? `Welcome, ${currentUser?.name || 'Customer'}! 👋`
                        : `Selamat Datang, ${currentUser?.name}! 👋`}
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      {language === 'JP'
                        ? 'ご注文状況の確認、ヤマト・佐川の追跡、デジタル会員証バーコードのご利用がいつでも可能です。'
                        : language === 'EN'
                        ? 'Manage your diaspora shopping, track Yamato/Sagawa shipments, and utilize your member barcode.'
                        : 'Kelola semua aktivitas belanja diaspora, pantau pengiriman Yamato/Sagawa, dan manfaatkan barcode member Anda.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('barcode')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">qr_code_2</span>
                    <span>{language === 'JP' ? 'バーコードを表示' : language === 'EN' ? 'View Barcode' : 'Tampilkan Barcode'}</span>
                  </button>
                </div>

                {/* Profile Data Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-stone-400 font-bold block uppercase text-[10px]">
                      {language === 'JP' ? 'WhatsApp / 日本の電話番号' : language === 'EN' ? 'WhatsApp / Phone Number' : 'Nomor WhatsApp / HP'}
                    </span>
                    <span className="font-bold text-stone-800 text-sm">{currentUser?.phone || '+81 80-1122-3344'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-stone-400 font-bold block uppercase text-[10px]">
                      {language === 'JP' ? '会員ID (ID番号)' : language === 'EN' ? 'Member ID' : 'ID Pelanggan (Member ID)'}
                    </span>
                    <span className="font-bold text-stone-800 text-sm font-mono truncate block">{currentUser?.id || 'cust-1'}</span>
                  </div>
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="text-stone-400 font-bold block uppercase text-[10px]">
                      {language === 'JP' ? '日本国内の主なお届け先住所' : language === 'EN' ? 'Primary Shipping Address in Japan' : 'Alamat Pengiriman Utama di Jepang'}
                    </span>
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
                    <span>{language === 'JP' ? 'プロフィールと住所を変更' : language === 'EN' ? 'Edit Profile & Address' : 'Edit Profil & Alamat'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">lock_reset</span>
                    <span>{language === 'JP' ? 'パスワードを変更' : language === 'EN' ? 'Change Password' : 'Ganti Password'}</span>
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
                      <span>
                        {language === 'JP'
                          ? `お気に入り (${totalWishlistItems})`
                          : language === 'EN'
                          ? `Wishlist (${totalWishlistItems})`
                          : `Wishlist (${totalWishlistItems})`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('wishlist')}
                      className="text-xs text-[#c41230] font-bold hover:underline"
                    >
                      {language === 'JP' ? 'すべて見る →' : language === 'EN' ? 'View All →' : 'Buka Semua →'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">
                    {language === 'JP'
                      ? '後で購入するために保存したインドネシアの食材、調味料、お菓子です。'
                      : language === 'EN'
                      ? 'Favorite food, seasonings & snacks saved for later purchase.'
                      : 'Produk-produk makanan, bumbu, & camilan favorit yang Anda simpan untuk dibeli nanti.'}
                  </p>
                </div>

                {/* Orders Box */}
                <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                      <span className="material-symbols-outlined">receipt_long</span>
                      <span>
                        {language === 'JP'
                          ? `ご注文 (${orders.length})`
                          : language === 'EN'
                          ? `Orders (${orders.length})`
                          : `Pesanan (${orders.length})`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      {language === 'JP' ? '履歴を見る →' : language === 'EN' ? 'History →' : 'Riwayat →'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">
                    {language === 'JP'
                      ? 'ヤマト運輸および佐川急便の配送追跡とお買い物の領収書をご確認いただけます。'
                      : language === 'EN'
                      ? 'Track Yamato & Sagawa parcel shipments and download shopping invoices.'
                      : 'Lacak status paket pengiriman Kurir Yamato & Sagawa serta download bukti invoice belanja.'}
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
                  {language === 'JP' ? '在日VIPデジタル会員証' : language === 'EN' ? 'VIP Digital Diaspora Card' : 'Kartu Digital Diaspora VIP'}
                </span>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 mt-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">qr_code_2</span>
                  <span>
                    {language === 'JP' ? '公式会員バーコード & QRコード' : language === 'EN' ? 'Official Member Barcode & QR Code' : 'Barcode & QR Member Resmi'}
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {language === 'JP'
                    ? '実店舗（東京・大阪）のレジにてこのバーコードをご提示いただくと、会員特別割引やポイントが自動適用されます。'
                    : language === 'EN'
                    ? 'Show this barcode or QR code at our physical store cashiers (Tokyo & Osaka) to receive exclusive member discounts.'
                    : 'Tunjukkan barcode atau QR code ini kepada kasir di Toko Fisik Sembako Nusantara (Tokyo & Osaka) untuk mendapatkan diskon member dan poin loyalty otomatis.'}
                </p>
              </div>

              {/* High Quality Digital Member Card UI */}
              <div className="max-w-md mx-auto bg-gradient-to-br from-[#c41230] via-[#8B0000] to-stone-900 rounded-3xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden border-2 border-amber-300">
                {/* Background Pattern & Subtle Watermark Logo (Pure White in Exact Center) */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                <img
                  src={assetUrl('LOGO PUTIH SN TRANSPARANT.png')}
                  alt=""
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-72 sm:h-72 object-contain filter brightness-0 invert opacity-40 pointer-events-none select-none z-0"
                />

                <div className="flex items-center justify-between relative z-10 mb-6">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={assetUrl('LOGO PUTIH SN TRANSPARANT.png')}
                      alt="Sembako Nusantara"
                      className="h-9 w-auto object-contain filter brightness-0 invert drop-shadow-sm"
                    />
                    <div>
                      <div className="font-heading font-black text-sm tracking-wide text-white">SEMBAKO NUSANTARA</div>
                      <div className="text-[9px] text-amber-300 font-bold uppercase tracking-widest">JAPAN DIASPORA CARD</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-400 text-stone-950 font-black text-[10px] rounded-full shadow-sm">
                    {currentUser?.tier || (isAdmin ? 'SUPER ADMIN' : 'GOLD MEMBER')}
                  </span>
                </div>

                {/* Member Info */}
                <div className="relative z-10 space-y-1 mb-6">
                  <div className="text-[10px] text-stone-300 uppercase tracking-wider">
                    {language === 'JP' ? '会員様氏名:' : language === 'EN' ? 'Member Name:' : 'Nama Anggota Member:'}
                  </div>
                  <div className="font-heading font-black text-xl text-white tracking-wide">{currentUser?.name || 'Willy Pratama'}</div>
                  <div className="text-xs text-amber-300 font-mono font-bold tracking-widest mt-1">{memberId}</div>
                </div>

                {/* Barcode Strip Graphic (100% Scannable Code 39 Barcode) */}
                <div className="bg-white rounded-2xl p-4 text-stone-900 text-center shadow-inner relative z-10">
                  <div className="flex justify-center items-center h-14 py-1 overflow-x-auto select-none">
                    {barcodeBars.map((bar, idx) => (
                      <div
                        key={idx}
                        className={bar.isBar ? 'bg-black h-full' : 'bg-transparent h-full'}
                        style={{ width: `${bar.width}px` }}
                      />
                    ))}
                  </div>
                  <div className="font-mono text-xs font-black tracking-widest text-stone-800 mt-1">
                    *{memberId}*
                  </div>
                </div>

                {/* Card Footer (Masa Berlaku - Poin Reward Removed) */}
                <div className="flex items-center justify-end text-[10px] text-stone-300 mt-4 relative z-10">
                  <span>
                    {language === 'JP' ? (
                      <>有効期限: <strong className="text-white">無期限 (永久有効)</strong></>
                    ) : language === 'EN' ? (
                      <>Validity: <strong className="text-white">Lifetime</strong></>
                    ) : (
                      <>Masa Berlaku: <strong className="text-white">Seumur Hidup</strong></>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Salin, Download (PNG persis desain), Cetak */}
              <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(memberId);
                    alert(
                      language === 'JP'
                        ? `会員ID「${memberId}」をクリップボードにコピーしました！`
                        : language === 'EN'
                        ? `Member ID "${memberId}" copied to clipboard!`
                        : `ID Member "${memberId}" berhasil disalin ke clipboard!`
                    );
                  }}
                  className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  <span>{language === 'JP' ? '会員番号をコピー' : language === 'EN' ? 'Copy Member ID' : 'Salin ID Member'}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsDownloadingCard(true);
                    try {
                      await downloadMemberCardPng({
                        memberId,
                        memberName: currentUser?.name || 'Willy Pratama',
                        tier: currentUser?.tier || (isAdmin ? 'SUPER ADMIN' : 'GOLD MEMBER')
                      });
                    } finally {
                      setIsDownloadingCard(false);
                    }
                  }}
                  disabled={isDownloadingCard}
                  className="flex-1 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-75"
                >
                  <span className="material-symbols-outlined text-base">
                    {isDownloadingCard ? 'hourglass_top' : 'download'}
                  </span>
                  <span>
                    {isDownloadingCard
                      ? language === 'JP'
                        ? 'ダウンロード中...'
                        : language === 'EN'
                        ? 'Downloading...'
                        : 'Mengunduh...'
                      : language === 'JP'
                      ? '会員証画像を保存'
                      : language === 'EN'
                      ? 'Download Member Card'
                      : 'Download Kartu Member'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-3 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title={language === 'JP' ? '会員証を印刷' : language === 'EN' ? 'Print Member Card' : 'Cetak Kartu Member'}
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span className="hidden sm:inline">{language === 'JP' ? '印刷' : language === 'EN' ? 'Print' : 'Cetak'}</span>
                </button>
              </div>

              {/* Benefits */}
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2 text-stone-800">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-amber-600">verified</span>
                  <span>
                    {language === 'JP'
                      ? 'センバコ・ヌサンタラ会員限定の特典:'
                      : language === 'EN'
                      ? 'Exclusive Sembako Nusantara Member Benefits:'
                      : 'Keuntungan Khusus Anggota Sembako Nusantara Jepang:'}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-700 pl-1">
                  {language === 'JP' ? (
                    <>
                      <li>毎月25日（給料日セール）の特別会員割引。</li>
                      <li>実店舗およびオンライン限定の会員プロモーションへの優先アクセス。</li>
                      <li>一定金額以上のご注文でヤマト運輸・佐川急便の送料無料。</li>
                    </>
                  ) : language === 'EN' ? (
                    <>
                      <li>Special discounts every 25th of the month (Payday shopping promo).</li>
                      <li>Access to exclusive member deals in physical stores & online shop.</li>
                      <li>Free Yamato / Sagawa courier delivery on eligible orders.</li>
                    </>
                  ) : (
                    <>
                      <li>Diskon spesial setiap tanggal 25 (Hari Belanja Gajian Diaspora).</li>
                      <li>Akses promo eksklusif dan diskon member di toko fisik & online.</li>
                      <li>Gratis ongkir kurir Yamato / Sagawa untuk transaksi tertentu.</li>
                    </>
                  )}
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
                    <span>
                      {language === 'JP'
                        ? `お気に入り商品リスト (${totalWishlistItems})`
                        : language === 'EN'
                        ? `Favorite Products Wishlist (${totalWishlistItems})`
                        : `Wishlist Produk Favorit (${totalWishlistItems})`}
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {language === 'JP'
                      ? 'ハートマークで保存したお気に入りの商品一覧です。'
                      : language === 'EN'
                      ? 'List of products you have liked and saved for later.'
                      : 'Daftar produk yang pernah Anda klik simpan atau sukai.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/wishlist"
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    <span>{language === 'JP' ? 'ウィッシュリスト全体' : language === 'EN' ? 'Full Wishlist' : 'Halaman Wishlist Penuh'}</span>
                  </Link>
                  {wishlist.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            language === 'JP'
                              ? 'お気に入りリストをすべて空にしますか？'
                              : language === 'EN'
                              ? 'Clear all wishlist items?'
                              : 'Kosongkan semua daftar wishlist?'
                          )
                        )
                          clearWishlist();
                      }}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#c41230] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      {language === 'JP' ? 'すべて削除' : language === 'EN' ? 'Clear All' : 'Kosongkan'}
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
                    <h3 className="font-bold text-stone-800 text-base">
                      {language === 'JP' ? 'お気に入りはまだ登録されていません' : language === 'EN' ? 'Your Wishlist is Empty' : 'Wishlist Anda Masih Kosong'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {language === 'JP'
                        ? 'ハラール食材カタログをご覧になり、気に入った商品にハートマーク ❤️ を付けて保存してください。'
                        : language === 'EN'
                        ? 'Explore our halal grocery catalog and click the heart icon ❤️ to save your favorite products here.'
                        : 'Jelajahi katalog sembako halal kami dan klik ikon hati ❤️ pada produk yang Anda sukai untuk menyimpannya di sini.'}
                    </p>
                  </div>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-full shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    <span>{language === 'JP' ? 'カタログを見る' : language === 'EN' ? 'Explore Catalog' : 'Mulai Jelajah Katalog'}</span>
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
                            src={product.image || '/placeholder-upload.svg'}
                            alt={product.name}
                            className="w-full h-full object-contain p-2 hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-upload.svg';
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
                            {language === 'JP' && product.nameJp ? product.nameJp : language === 'EN' && product.nameEn ? product.nameEn : product.name}
                          </h4>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            {language === 'JP' && product.categoryJp ? product.categoryJp : language === 'EN' && product.categoryEn ? product.categoryEn : product.category}
                          </span>
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
                            <span>{language === 'JP' ? '購入' : language === 'EN' ? 'Buy' : 'Beli'}</span>
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
                    <span>
                      {language === 'JP' ? 'ご注文履歴' : language === 'EN' ? 'My Order History' : 'Riwayat Pesanan Saya'}
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {language === 'JP'
                      ? '配送状況の追跡およびお買い物の領収書をご確認いただけます。'
                      : language === 'EN'
                      ? 'Track your parcel shipping status and download transaction receipts.'
                      : 'Pantau status pengiriman paket dan unduh bukti transaksi.'}
                  </p>
                </div>

                {/* Status Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'DIPROSES', 'DIKIRIM', 'SELESAI'] as const).map((filter) => {
                    const label =
                      language === 'JP'
                        ? filter === 'ALL'
                          ? 'すべて'
                          : filter === 'DIPROSES'
                          ? '準備中'
                          : filter === 'DIKIRIM'
                          ? '発送済み'
                          : '配達完了'
                        : language === 'EN'
                        ? filter === 'ALL'
                          ? 'All'
                          : filter === 'DIPROSES'
                          ? 'Processing'
                          : filter === 'DIKIRIM'
                          ? 'Shipped'
                          : 'Completed'
                        : filter === 'ALL'
                        ? 'Semua'
                        : filter;
                    return (
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
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">inbox</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-800 text-base">
                      {language === 'JP' ? 'お取引履歴がありません' : language === 'EN' ? 'No Order Transactions' : 'Belum Ada Transaksi'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {language === 'JP'
                        ? '有効なご注文はまだありません。インドネシアの食材を今すぐお買い物しましょう！'
                        : language === 'EN'
                        ? 'You do not have any active orders. Start shopping for authentic Indonesian groceries now!'
                        : 'Anda belum memiliki pesanan aktif. Mulai belanja produk makanan Indonesia sekarang!'}
                    </p>
                  </div>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-full shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    <span>{language === 'JP' ? '今すぐ買い物する' : language === 'EN' ? 'Shop Now' : 'Belanja Sekarang'}</span>
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
                          <span className="text-xs font-black text-stone-900">
                            {language === 'JP' ? `注文番号 #${order.id}` : language === 'EN' ? `Order #${order.id}` : `Pesanan #${order.id}`}
                          </span>
                          <span className="text-[11px] text-stone-400 block">{order.date}</span>
                        </div>
                        <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-full">
                          {language === 'JP'
                            ? order.status === 'Selesai'
                              ? '配達完了'
                              : order.status === 'Dikirim'
                              ? '発送済み'
                              : '準備中'
                            : order.status}
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
                        <span className="text-stone-500">
                          {language === 'JP' ? '合計お支払い金額:' : language === 'EN' ? 'Total Payment:' : 'Total Pembayaran:'}
                        </span>
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
                    <span>
                      {language === 'JP'
                        ? `現在の買い物かご (${totalItems} 点)`
                        : language === 'EN'
                        ? `Active Shopping Cart (${totalItems} Items)`
                        : `Keranjang Belanja Aktif (${totalItems} Item)`}
                    </span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    {language === 'JP'
                      ? '日本全国47都道府県へ即日発送可能な商品です。'
                      : language === 'EN'
                      ? 'Items ready for checkout to all 47 prefectures in Japan.'
                      : 'Item yang siap Anda checkout untuk pengiriman ke seluruh prefektur Jepang.'}
                  </p>
                </div>
                <Link
                  to="/cart"
                  className="px-4 py-2 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  <span>{language === 'JP' ? 'お会計画面へ進む' : language === 'EN' ? 'Go to Checkout' : 'Buka Halaman Checkout'}</span>
                </Link>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-800 text-base">
                      {language === 'JP' ? '買い物かごは空です' : language === 'EN' ? 'Your Cart is Empty' : 'Keranjang Anda Masih Kosong'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {language === 'JP'
                        ? 'お好みのインドネシア食材や調味料、お菓子をカートに追加してください。'
                        : language === 'EN'
                        ? 'Add groceries, instant seasonings, or snacks to your cart.'
                        : 'Tambahkan produk sembako, bumbu instan, atau camilan favorit Anda ke keranjang.'}
                    </p>
                  </div>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-full shadow-md transition-all"
                  >
                    <span>{language === 'JP' ? 'お買い物を始める' : language === 'EN' ? 'Start Shopping' : 'Mulai Belanja'}</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-stone-100">
                    {cart.map(({ product, quantity }) => (
                      <div key={product.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || '/placeholder-upload.svg'}
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-upload.svg';
                            }}
                            className="w-12 h-12 object-contain rounded-xl bg-stone-50 p-1 border border-stone-200"
                          />
                          <div>
                            <h4 className="font-bold text-xs text-stone-900 line-clamp-1">
                              {language === 'JP' && product.nameJp ? product.nameJp : language === 'EN' && product.nameEn ? product.nameEn : product.name}
                            </h4>
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
                      <span className="text-xs text-stone-500 block">
                        {language === 'JP' ? '合計お見積もり金額:' : language === 'EN' ? 'Estimated Total:' : 'Total Estimasi Belanja:'}
                      </span>
                      <span className="text-xl font-black text-[#c41230]">¥{totalPrice.toLocaleString()}</span>
                    </div>
                    <Link
                      to="/checkout"
                      className="px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                    >
                      {language === 'JP' ? 'お会計へ進む →' : language === 'EN' ? 'Proceed to Checkout →' : 'Lanjut ke Pembayaran →'}
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
                  <span>
                    {language === 'JP' ? 'パスワード変更 & アカウント保護' : language === 'EN' ? 'Change Password & Account Security' : 'Ganti Password & Keamanan Akun'}
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {language === 'JP'
                    ? '定期的にパスワードを更新して、アカウントの安全性を確保してください。'
                    : language === 'EN'
                    ? 'Secure your account by periodically updating your password.'
                    : 'Amankan akun Anda dengan memperbarui password secara berkala.'}
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
                    {language === 'JP' ? '現在のパスワード' : language === 'EN' ? 'Current / Old Password' : 'Password Saat Ini / Lama'}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder={
                        language === 'JP'
                          ? 'げんざい の パスワード を にゅうりょく'
                          : language === 'EN'
                          ? 'Enter current password'
                          : 'Masukkan password saat ini'
                      }
                      className="w-full pl-4 pr-11 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      aria-label={showCurrentPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                      title={showCurrentPass ? (language === 'JP' ? 'パスワードを隠す' : language === 'EN' ? 'Hide' : 'Sembunyikan') : (language === 'JP' ? 'パスワードを表示' : language === 'EN' ? 'Show' : 'Lihat')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-200/50 flex items-center justify-center cursor-pointer"
                    >
                      <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${showCurrentPass ? 'text-[#c41230]' : 'text-stone-400'}`}>
                        {showCurrentPass ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    {language === 'JP' ? (
                      <>(初期パスワードの目安: <strong>customer123</strong> または <strong>123456</strong>)</>
                    ) : (
                      <>(Default akun customer: <strong>customer123</strong> atau <strong>123456</strong>)</>
                    )}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'JP' ? '新しいパスワード' : language === 'EN' ? 'New Password' : 'Password Baru'}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder={
                        language === 'JP'
                          ? '6もじ いじょう の パスワード'
                          : language === 'EN'
                          ? 'Minimum 6 characters'
                          : 'Minimal 6 karakter'
                      }
                      className="w-full pl-4 pr-11 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      aria-label={showNewPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                      title={showNewPass ? (language === 'JP' ? 'パスワードを隠す' : language === 'EN' ? 'Hide' : 'Sembunyikan') : (language === 'JP' ? 'パスワードを表示' : language === 'EN' ? 'Show' : 'Lihat')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-200/50 flex items-center justify-center cursor-pointer"
                    >
                      <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${showNewPass ? 'text-[#c41230]' : 'text-stone-400'}`}>
                        {showNewPass ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'JP' ? '新しいパスワード（確認用）' : language === 'EN' ? 'Confirm New Password' : 'Konfirmasi Password Baru'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder={
                        language === 'JP'
                          ? 'あたらしい パスワード を もういちど にゅうりょく'
                          : language === 'EN'
                          ? 'Repeat new password'
                          : 'Ulangi password baru'
                      }
                      className="w-full pl-4 pr-11 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      aria-label={showConfirmPass ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                      title={showConfirmPass ? (language === 'JP' ? 'パスワードを隠す' : language === 'EN' ? 'Hide' : 'Sembunyikan') : (language === 'JP' ? 'パスワードを表示' : language === 'EN' ? 'Show' : 'Lihat')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-stone-200/50 flex items-center justify-center cursor-pointer"
                    >
                      <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${showConfirmPass ? 'text-[#c41230]' : 'text-stone-400'}`}>
                        {showConfirmPass ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
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
                  <span>
                    {language === 'JP' ? 'パスワードの変更を保存' : language === 'EN' ? 'Save Password Changes' : 'Simpan Perubahan Password'}
                  </span>
                </button>
              </form>

              {/* Danger Zone: Hapus Akun Pengguna */}
              <div className="pt-8 border-t border-stone-200 mt-6">
                <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-red-600 text-xl">warning</span>
                    <span>
                      {language === 'JP' ? '危険な設定: アカウントの削除' : language === 'EN' ? 'Danger Zone: Delete Account' : 'Zona Bahaya: Hapus Akun Pengguna'}
                    </span>
                  </div>
                  <p className="text-xs text-red-600/90 leading-relaxed">
                    {language === 'JP'
                      ? 'アカウントを削除すると、プロフィール情報、デジタルVIP会員証、カート、すべてのログインセッションが永久に消去されます。この操作は取り消せません。'
                      : language === 'EN'
                      ? 'Deleting your account will permanently wipe your profile data, VIP member barcode, shopping cart, and saved sessions. This action cannot be undone.'
                      : 'Menghapus akun Anda akan menghapus data profil, barcode keanggotaan VIP, keranjang, dan seluruh sesi tersimpan secara permanen. Tindakan ini tidak dapat dibatalkan.'}
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">delete_forever</span>
                      <span>
                        {language === 'JP' ? 'アカウントを完全に削除する' : language === 'EN' ? 'Permanently Delete Account' : 'Hapus Akun Pengguna Secara Permanen'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
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
                  <span>
                    {language === 'JP'
                      ? 'プロフィールとお届け先住所の変更'
                      : language === 'EN'
                      ? 'Edit Profile & Japan Shipping Address'
                      : 'Ubah Informasi Profil & Alamat Jepang'}
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {language === 'JP'
                    ? 'ヤマト運輸や佐川急便の配送がスムーズに行われるよう、正確なご住所を登録してください。'
                    : language === 'EN'
                    ? 'Update your residence address for smooth courier delivery via Yamato & Sagawa Express.'
                    : 'Perbarui alamat tempat tinggal Anda untuk kelancaran pengiriman paket kurir Yamato & Sagawa.'}
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
                    {language === 'JP' ? '氏名（フルネーム）' : language === 'EN' ? 'Full Name' : 'Nama Lengkap'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder={
                      language === 'JP'
                        ? 'れい: やまだ たろう'
                        : language === 'EN'
                        ? 'e.g. John Doe'
                        : 'Contoh: Willy Pratama'
                    }
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'JP' ? 'WhatsApp番号 / 日本の電話番号' : language === 'EN' ? 'WhatsApp / Phone Number' : 'Nomor WhatsApp / Telepon Jepang'}
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder={
                      language === 'JP'
                        ? 'れい: 080-1234-5678'
                        : '+81 80-XXXX-XXXX'
                    }
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all"
                  />
                </div>



                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'JP'
                      ? '日本国内の詳細な住所（郵便番号・都道府県・市区町村・マンション名・部屋番号）'
                      : language === 'EN'
                      ? 'Complete Address in Japan (Postal code, Prefecture, District & Apartment)'
                      : 'Alamat Lengkap di Jepang (Termasuk Nama Prefektur, Distrik & Apartemen)'}
                  </label>
                  <textarea
                    rows={3}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder={
                      language === 'JP'
                        ? 'れい: 〒134-0088 とうきょうと えどがわく にしかさい 3-1-4 マンション 201ごうしつ'
                        : language === 'EN'
                        ? 'e.g. 〒134-0088 Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4 Mansion 201'
                        : 'Contoh: 〒134-0088 Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4 Mansion Nusantara 201'
                    }
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#c41230] outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>{language === 'JP' ? '登録内容を保存する' : language === 'EN' ? 'Save Changes' : 'Simpan Perubahan Data'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS AKUN */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 text-stone-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-stone-900">
                  {language === 'JP' ? 'アカウントを完全に削除しますか？' : language === 'EN' ? 'Permanently Delete Account?' : 'Hapus Akun Secara Permanen?'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'JP' ? 'この操作は取り消せません' : language === 'EN' ? 'This action is permanent and cannot be undone' : 'Tindakan ini permanen dan tidak dapat dipulihkan'}
                </p>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-xs text-stone-700 space-y-2">
              <p className="font-bold text-red-800">
                {language === 'JP'
                  ? `「${currentUser?.name}」のアカウントを削除してもよろしいですか？`
                  : language === 'EN'
                  ? `Are you sure you want to delete account "${currentUser?.name}"?`
                  : `Apakah Anda yakin ingin menghapus akun "${currentUser?.name}"?`}
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-600">
                {language === 'JP' ? (
                  <>
                    <li>ログインセッションは即時ログアウトされます。</li>
                    <li>デジタル会員証や特典は利用できなくなります。</li>
                    <li>この端末に保存されたデータは消去されます。</li>
                  </>
                ) : language === 'EN' ? (
                  <>
                    <li>Your login session will be logged out immediately.</li>
                    <li>Digital member card & loyalty perks can no longer be used.</li>
                    <li>Locally saved data on this device will be cleared.</li>
                  </>
                ) : (
                  <>
                    <li>Sesi login Anda akan langsung dikeluarkan.</li>
                    <li>Kartu member digital & poin belanja tidak dapat digunakan lagi.</li>
                    <li>Data tersimpan di perangkat ini akan dibersihkan.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs cursor-pointer"
              >
                {language === 'JP' ? 'キャンセル' : language === 'EN' ? 'Cancel' : 'Batal'}
              </button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingAccount ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-base">delete_forever</span>
                )}
                <span>
                  {language === 'JP' ? 'はい、アカウントを削除します' : language === 'EN' ? 'Yes, Delete My Account' : 'Ya, Hapus Akun Saya'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
