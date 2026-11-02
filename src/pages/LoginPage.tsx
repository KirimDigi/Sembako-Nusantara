import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../utils/assets';
import { sendRegistrationWhatsApp } from '../services/whatsappGateway';
import { supabase } from '../lib/supabase';

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

interface LoginPageProps {
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'login' }) => {
  const { login, isAuthenticated, isAdmin, updateProfile } = useAuth();
  const { addCustomer, customers } = useAdmin();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'register'
  const queryParams = new URLSearchParams(location.search);
  const modeParam = queryParams.get('mode');
  const redirectParam = queryParams.get('redirect') || '';

  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    modeParam === 'register' || initialMode === 'register' ? 'register' : 'login'
  );

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register form state
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
  const [alreadyRegisteredNotice, setAlreadyRegisteredNotice] = useState('');

  // If already authenticated, redirect smoothly
  useEffect(() => {
    if (isAuthenticated) {
      const isPosKasir =
        currentUser?.role === 'Kasir (POS)' ||
        currentUser?.role?.toLowerCase().includes('kasir') ||
        currentUser?.role?.toLowerCase().includes('pos') ||
        currentUser?.role?.toLowerCase().includes('supervisor') ||
        currentUser?.role?.toLowerCase().includes('spv') ||
        currentUser?.id?.toLowerCase().startsWith('pos-');

      if (isPosKasir) {
        navigate('/admin/pos', { replace: true });
      } else if (redirectParam) {
        navigate(redirectParam, { replace: true });
      } else if (isAdmin) {
        navigate('/admin/pos', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, currentUser, redirectParam, navigate]);

  // Handle Login Submit
  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setAlreadyRegisteredNotice('');
    setIsLoading(true);

    try {
      const res = await login(loginId, password);
      if (res.success) {
        const isPosKasir =
          res.user?.role === 'Kasir (POS)' ||
          res.user?.role?.toLowerCase().includes('kasir') ||
          res.user?.role?.toLowerCase().includes('pos') ||
          res.user?.role?.toLowerCase().includes('supervisor') ||
          res.user?.role?.toLowerCase().includes('spv') ||
          res.user?.id?.toLowerCase().startsWith('pos-');
        const isAdminAccount =
          res.isAdmin ||
          loginId.trim().toLowerCase() === 'id0926' ||
          res.user?.role === 'Super Admin (Owner)';

        // Akun POS dilarang masuk ke halaman customer - wajib langsung ke Kasir Scan Barcode
        if (isPosKasir) {
          navigate('/admin/pos', { replace: true });
        } else if (redirectParam) {
          navigate(redirectParam, { replace: true });
        } else if (isAdminAccount) {
          navigate('/admin/pos', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        let msg = res.error;
        if (
          res.error?.includes('tidak terdaftar') ||
          res.error?.includes('belum terdaftar') ||
          res.error?.includes('not registered') ||
          res.error?.includes('not found')
        ) {
          msg =
            language === 'JP'
              ? 'このアカウント（ID/電話番号）は登録されていません。新規会員登録を行ってください。'
              : language === 'EN'
              ? 'Account not found. This ID or phone number is not registered yet. Please sign up first.'
              : 'Akun tidak terdaftar. ID atau Nomor HP ini belum memiliki akun di database. Silakan daftar akun baru terlebih dahulu.';
        } else if (res.error?.includes('Kata sandi salah') || res.error?.includes('password')) {
          msg =
            language === 'JP'
              ? 'パスワードが正しくありません。再度ご確認ください。'
              : language === 'EN'
              ? 'Incorrect password. Please verify your password.'
              : 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.';
        }
        setLoginError(
          msg ||
            (language === 'JP'
              ? 'ログインに失敗しました。IDまたはパスワードを確認してください。'
              : language === 'EN'
              ? 'Login failed. Please check your ID and password.'
              : 'Gagal masuk akun. Periksa kembali ID dan kata sandi Anda.')
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

  // Handle Register Submit
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
    setRegError('');
    setAlreadyRegisteredNotice('');

    try {
      const cleanPhoneDigits = regPhone.trim().replace(/\D/g, '');

      // =========================================================================
      // CHECK DATABASE: Apakah Nomor Telepon Sudah Terdaftar Sebelumnya?
      // =========================================================================
      let isAlreadyRegistered = false;

      // 1. Check di Database Pelanggan CRM (localStorage & AdminContext)
      try {
        const savedCusts = localStorage.getItem('sn_customers_v1');
        const custList = savedCusts ? JSON.parse(savedCusts) : customers;
        if (Array.isArray(custList)) {
          const match = custList.find((c: any) => {
            const cPhone = (c.phone || '').replace(/\D/g, '');
            return (
              cPhone.length >= 7 &&
              (cPhone === cleanPhoneDigits ||
                cPhone.endsWith(cleanPhoneDigits) ||
                cleanPhoneDigits.endsWith(cPhone))
            );
          });
          if (match) {
            isAlreadyRegistered = true;
          }
        }
      } catch (e) {
        console.warn('Local CRM customer check error:', e);
      }

      // 2. Check di Akun Pelanggan Bawaan / Demo
      if (!isAlreadyRegistered) {
        if (
          cleanPhoneDigits === '08011223344' ||
          cleanPhoneDigits.endsWith('8011223344') ||
          cleanPhoneDigits === '08123456789' ||
          cleanPhoneDigits.endsWith('123456789')
        ) {
          isAlreadyRegistered = true;
        }
      }

      // 3. Check di Database Cloud Supabase (tabel customers)
      if (!isAlreadyRegistered) {
        try {
          const { data: supaMatch, error } = await supabase
            .from('customers')
            .select('id, name, phone')
            .ilike('phone', `%${cleanPhoneDigits.slice(-7)}%`)
            .maybeSingle();

          if (supaMatch && !error) {
            isAlreadyRegistered = true;
          }
        } catch (e) {
          console.warn('Supabase customer phone check error:', e);
        }
      }

      // JIKA SUDAH TERDAFTAR: Tampilkan notifikasi di tengah halaman & langsung arahkan ke login
      if (isAlreadyRegistered) {
        setIsRegLoading(false);
        const noticeMsg =
          language === 'JP'
            ? `この電話番号（${regPhone.trim()}）のアカウントは既に登録されています。そのままパスワードを入力してログインしてください。`
            : language === 'EN'
            ? `Your account is already registered! The phone number (${regPhone.trim()}) already has an account. Please log in directly with your password.`
            : `Akun Anda sudah terdaftar! Nomor HP (${regPhone.trim()}) telah terdaftar di database kami. Silakan langsung login dengan kata sandi Anda.`;

        setAlreadyRegisteredNotice(noticeMsg);
        setLoginId(regPhone.trim());
        setAuthMode('login');
        setLoginError('');
        setRegError('');
        return;
      }

      // JIKA BELUM TERDAFTAR: Lanjutkan pembuatan akun baru
      const newCustId =
        'cust-' +
        (cleanPhoneDigits.length >= 6
          ? cleanPhoneDigits.slice(-6)
          : Math.floor(100000 + Math.random() * 900000));
      const fullAddress = `〒${regPostalCode.trim()} ${regPrefecture.trim()} ${regCity.trim()} ${regAddress.trim()}`;

      // Simpan langsung ke database CRM Admin
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
        loyaltyPoints: 0,
        tier: 'Bronze',
        preferredLanguage: language === 'JP' ? 'JP' : language === 'EN' ? 'EN' : 'ID'
      });

      // Login instan menggunakan ID Member baru
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

        // Kirim WhatsApp sambutan pendaftaran otomatis
        sendRegistrationWhatsApp({
          name: regName.trim(),
          phone: regPhone.trim(),
          address: fullAddress,
          custId: newCustId,
          loyaltyPoints: 0,
          language: language
        }).catch((err) => {
          console.warn('[WA Gateway] Registrasi notification failed:', err);
        });

        if (redirectParam) {
          navigate(redirectParam, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setRegError(res.error || 'Pendaftaran berhasil, silakan login dengan akun Anda.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setRegError('Terjadi kesalahan saat pendaftaran akun. Silakan coba lagi.');
    } finally {
      setIsRegLoading(false);
    }
  };

  // WhatsApp Forgot Password Link with custom caption requested by user
  const forgotPasswordWhatsAppUrl = `https://wa.me/6285773875762?text=${encodeURIComponent(
    'halo ka saya ada lupa password login sembako nusantara bisa dibantu ka?'
  )}`;

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-4 sm:py-8 px-3 sm:px-4 bg-[#230207] select-none font-sans relative overflow-x-hidden">
      {/* Background Ambience Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-red-600/30 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] bg-amber-500/20 rounded-full blur-[140px]" />
      </div>

      {/* Main Mobile App Card Container */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] overflow-hidden border border-stone-200/80 flex flex-col">
        {/* =========================================================================
            TOP SECTION: VIDEO BACKGROUND (Cartoon_cat_carrying_groceries_full_landscape.mp4)
        ========================================================================= */}
        <div className="relative w-full h-[220px] sm:h-[250px] bg-stone-900 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center select-none pointer-events-none"
            poster={assetUrl('logo-transparent.png')}
          >
            <source
              src={assetUrl('Cartoon_cat_carrying_groceries_full_landscape.mp4')}
              type="video/mp4"
            />
            {/* Fallback video url if any */}
            <source
              src={assetUrl('Cartoon_cat_carrying_groceries_1080p_20261009100736.mp4')}
              type="video/mp4"
            />
          </video>

          {/* Video Subtle Gradient Overlays for smooth blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

          {/* Floating Navigation Controls on Top of Video */}
          <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between">
            {/* Back Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 hover:bg-black/70 text-white/95 hover:text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all shadow-md group cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span>
                {language === 'JP' ? '店舗へ戻る' : language === 'EN' ? 'Back' : 'Kembali'}
              </span>
            </Link>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-black/45 p-1 rounded-full border border-white/20 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setLanguage('ID')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'ID'
                    ? 'bg-[#C41230] text-white shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('JP')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'JP'
                    ? 'bg-[#C41230] text-white shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                JP
              </button>
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'EN'
                    ? 'bg-[#C41230] text-white shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Floating Brand Badge (Small Cute Logo) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md p-1.5 border border-white shadow-lg flex items-center justify-center">
              <img
                src={assetUrl('logo-transparent.png')}
                alt="Sembako Nusantara"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM SHEET / CARD SECTION (OVERLAPPING VIDEO)
        ========================================================================= */}
        <div className="relative -mt-4 bg-white rounded-t-[32px] pt-3 px-6 pb-7 shadow-2xl flex-1 flex flex-col">
          {/* Subtle Pull Indicator Bar */}
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-4" />

          {/* Title Area (Clean & Minimalist) */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {authMode === 'login'
                ? 'Welcome back'
                : language === 'JP'
                ? '新規会員登録'
                : language === 'EN'
                ? 'Create an account'
                : 'Buat Akun Member'}
            </h1>
            {redirectParam && (
              <p className="text-xs font-semibold text-[#C41230] mt-1">
                {language === 'JP'
                  ? 'チェックアウトを完了するにはログインしてください'
                  : language === 'EN'
                  ? 'Please sign in to complete your checkout'
                  : 'Silakan masuk akun untuk menyelesaikan checkout pesanan'}
              </p>
            )}
          </div>

          {/* =========================================================================
              STATUS INFORMASI DI TENGAH HALAMAN: AKUN SUDAH TERDAFTAR
          ========================================================================= */}
          {alreadyRegisteredNotice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs shadow-md space-y-2 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
                  <span className="material-symbols-outlined text-amber-600 text-xl shrink-0">
                    check_circle
                  </span>
                  <span>
                    {language === 'JP'
                      ? 'アカウント登録済み'
                      : language === 'EN'
                      ? 'Account Already Registered'
                      : 'Akun Anda Sudah Terdaftar!'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAlreadyRegisteredNotice('')}
                  className="text-stone-400 hover:text-stone-700 p-0.5 rounded-full cursor-pointer"
                  title="Tutup"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <p className="leading-relaxed font-medium text-amber-800">
                {alreadyRegisteredNotice}
              </p>
              <div className="pt-1 border-t border-amber-200/70 flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span>
                  {language === 'JP'
                    ? '↓ パスワードを入力してログインしてください'
                    : language === 'EN'
                    ? '↓ Please enter your password below to log in'
                    : '↓ Masukkan kata sandi Anda di bawah untuk masuk'}
                </span>
                <span className="material-symbols-outlined text-sm text-amber-600 animate-bounce">
                  arrow_downward
                </span>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              LOGIN FORM (NO GOOGLE/APPLE BUTTONS, ONLY MASUK & DAFTAR)
          ========================================================================= */}
          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                {loginError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-base shrink-0 text-red-500 mt-0.5">
                        error
                      </span>
                      <span className="leading-tight font-medium">{loginError}</span>
                    </div>
                    {(loginError.includes('daftar') || loginError.includes('登録') || loginError.includes('sign up')) && (
                      <button
                        type="button"
                        onClick={() => {
                          setRegPhone(loginId);
                          setAuthMode('register');
                          setLoginError('');
                          setAlreadyRegisteredNotice('');
                        }}
                        className="self-start text-[11px] font-bold text-[#C41230] hover:underline flex items-center gap-1 cursor-pointer ml-6"
                      >
                        <span>
                          {language === 'JP'
                            ? '今すぐ新規会員登録する →'
                            : language === 'EN'
                            ? 'Create a new account now →'
                            : 'Daftar Akun Baru Sekarang →'}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleFormLogin} autoComplete="off" className="space-y-3.5">
                  {/* Hidden decoy fields to divert Chrome/Edge browser autofill */}
                  <input type="text" name="fake_lp_username_remember" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" readOnly />
                  <input type="password" name="fake_lp_password_remember" style={{ display: 'none' }} tabIndex={-1} autoComplete="new-password" readOnly />

                  {/* Input 1: ID / Phone / Email */}
                  <div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-stone-400 text-lg pointer-events-none">
                        mail
                      </span>
                      <input
                        type="text"
                        name="sn_login_phone_or_id"
                        id="sn_login_phone_or_id"
                        autoComplete="off"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder={
                          language === 'JP'
                            ? '例: 08011223344 / 会員番号'
                            : language === 'EN'
                            ? 'e.g. 080-1122-3344 / Member ID'
                            : 'Contoh: 0812-3456-7890 / ID Pelanggan'
                        }
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/70 focus:bg-white text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Input 2: Password */}
                  <div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-stone-400 text-lg pointer-events-none">
                        lock
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="sn_login_customer_key"
                        id="sn_login_customer_key"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          language === 'JP'
                            ? '•••••••• (パスワード)'
                            : language === 'EN'
                            ? '•••••••• (Account password)'
                            : '•••••••• (Kata sandi akun Anda)'
                        }
                        required
                        className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-200 bg-stone-50/70 focus:bg-white text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C41230] focus:border-transparent transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="material-symbols-outlined absolute right-3.5 text-stone-400 hover:text-stone-700 text-lg cursor-pointer"
                        title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </button>
                    </div>
                  </div>

                  {/* Row: Remember Me & Lupa Password */}
                  <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-300 text-[#C41230] focus:ring-[#C41230]"
                      />
                      <span className="text-stone-700 font-medium">
                        {language === 'JP'
                          ? 'ログイン状態を保持'
                          : language === 'EN'
                          ? 'Remember me'
                          : 'Remember me'}
                      </span>
                    </label>

                    {/* Lupa Password WA Link with required caption */}
                    <a
                      href={forgotPasswordWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#C41230] hover:underline"
                    >
                      {language === 'JP'
                        ? 'パスワードをお忘れですか？'
                        : language === 'EN'
                        ? 'Forgot password?'
                        : 'Forgot password?'}
                    </a>
                  </div>

                  {/* Theme Button: Masuk Akun / Login */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 px-4 rounded-2xl bg-[#C41230] hover:bg-[#A30F27] active:bg-[#8A0C20] text-white font-bold text-sm shadow-md shadow-red-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isLoading ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">
                          progress_activity
                        </span>
                        <span>
                          {language === 'JP'
                            ? 'ログイン中...'
                            : language === 'EN'
                            ? 'Logging in...'
                            : 'Memproses Masuk...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {language === 'JP' ? 'ログイン' : language === 'EN' ? 'Login' : 'Masuk Akun'}
                        </span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Bottom Prompt: Create Account / Daftar Klik Disini */}
                <div className="text-center pt-4 border-t border-stone-100 mt-2">
                  <p className="text-xs text-stone-600">
                    {language === 'JP'
                      ? 'アカウントをお持ちでないですか？'
                      : language === 'EN'
                      ? "Don't have an account?"
                      : 'Belum punya akun?'}
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setRegError('');
                      }}
                      className="font-bold text-[#C41230] hover:underline cursor-pointer"
                    >
                      {language === 'JP'
                        ? '新規会員登録はこちら'
                        : language === 'EN'
                        ? 'Create an account'
                        : 'Buat akun / daftar klik disini'}
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* =========================================================================
                  REGISTER FORM (SAME FORM FIELDS AS BEFORE)
              ========================================================================= */
              <motion.div
                key="register-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5 flex-1 flex flex-col justify-between"
              >

                {regError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-base shrink-0 text-red-500">
                      error
                    </span>
                    <span className="leading-tight">{regError}</span>
                  </div>
                )}

                <form onSubmit={handleFormRegister} className="space-y-2.5">
                  {/* Field 1: Nama Lengkap */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {language === 'JP' ? '氏名（フルネーム）:' : 'Nama Lengkap:'}
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Willy Pratama"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                    />
                  </div>

                  {/* Field 2: No HP / WA */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {language === 'JP' ? '電話番号 (日本 / WA):' : 'Nomor WhatsApp / HP Jepang:'}
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="080-1234-5678 / +81 80..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230] font-mono"
                    />
                  </div>

                  {/* Field 3 & 4: Kode Pos & Prefektur */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {language === 'JP' ? '郵便番号 (〒):' : 'Kode Pos (〒):'}
                      </label>
                      <input
                        type="text"
                        value={regPostalCode}
                        onChange={(e) => setRegPostalCode(e.target.value)}
                        placeholder="134-0088"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {language === 'JP' ? '都道府県:' : 'Prefektur (47):'}
                      </label>
                      <select
                        value={regPrefecture}
                        onChange={(e) => setRegPrefecture(e.target.value)}
                        className="w-full px-2.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                      >
                        {JAPAN_PREFECTURES.map((pref) => (
                          <option key={pref} value={pref}>
                            {pref}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Field 5 & 6: Kota & Alamat */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {language === 'JP' ? '市区町村:' : 'Kota / Distrik:'}
                      </label>
                      <input
                        type="text"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        placeholder="Edogawa-ku"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {language === 'JP' ? '番地・建物名:' : 'Alamat / Apartemen:'}
                      </label>
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Nishi-Kasai 3-1-4 #302"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230]"
                      />
                    </div>
                  </div>

                  {/* Field 7: Password */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      {language === 'JP' ? 'パスワード（4文字以上）:' : 'Kata Sandi (min 4 karakter):'}
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C41230] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-lg cursor-pointer"
                      >
                        {showRegPassword ? 'visibility_off' : 'visibility'}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isRegLoading}
                    className={`w-full py-3.5 px-4 rounded-2xl bg-[#C41230] hover:bg-[#A30F27] active:bg-[#8A0C20] text-white font-bold text-sm shadow-md shadow-red-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isRegLoading ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  >
                    {isRegLoading ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">
                          progress_activity
                        </span>
                        <span>Memproses Pendaftaran...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">how_to_reg</span>
                        <span>
                          {language === 'JP'
                            ? '登録してアカウントを作成'
                            : language === 'EN'
                            ? 'Register & Create Account'
                            : 'Daftar & Buat Akun'}
                        </span>
                      </>
                    )}
                  </button>
                </form>

                {/* Switch back to Login */}
                <div className="text-center pt-2 border-t border-stone-100">
                  <p className="text-xs text-stone-600">
                    {language === 'JP' ? 'すでにアカウントをお持ちですか？' : 'Sudah memiliki akun?'}
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setLoginError('');
                      }}
                      className="font-bold text-[#C41230] hover:underline cursor-pointer"
                    >
                      {language === 'JP' ? 'ログインはこちら' : 'Masuk di sini'}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="relative z-10 text-center mt-3 text-[11px] text-white/50">
        © 2026 Sembako Nusantara Jepang • PT Sembako Nusantara Group
      </footer>
    </div>
  );
};
