import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { assetUrl } from '../../utils/assets';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Determine redirect URL from query param
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/admin';

  // If already authenticated as Admin, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await login(userId, password);
      if (result.success) {
        if (!result.isAdmin) {
          setErrorMsg('❌ Akses Ditolak: Akun ini terdaftar sebagai Akun Pelanggan (Customer). Halaman Dashboard Admin & POS hanya boleh diakses oleh Admin / Pengelola Resmi Toko.');
          setIsLoading(false);
          return;
        }
        navigate(redirectPath, { replace: true });
      } else {
        setErrorMsg(result.error || 'Autentikasi gagal.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat memproses login.');
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setUserId('id0926');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      {/* Main Login Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EBE5DF] p-7 sm:p-9 relative z-10">
        {/* Header with Logo */}
        <div className="text-center space-y-3 mb-8">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src={assetUrl('logo-transparent.png')}
              alt="Sembako Nusantara"
              className="h-16 w-auto mx-auto object-contain drop-shadow-sm"
            />
          </Link>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#c41230] text-[11px] font-extrabold uppercase tracking-wider border border-red-100 mb-2">
              <span className="material-symbols-outlined text-xs">shield_person</span>
              Autentikasi Pegawai & Kasir
            </span>
            <h1 className="font-heading font-black text-2xl text-stone-900 tracking-tight">
              Login Admin & POS
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Sistem Manajemen Terpadu & Mesin Kasir Sembako Nusantara Jepang
            </p>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-shake">
            <span className="material-symbols-outlined text-base shrink-0 text-red-500">error</span>
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID Field */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
              ID Pegawai / Username:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <span className="material-symbols-outlined text-lg">badge</span>
              </div>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Masukkan ID Pegawai / Username"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Kata Sandi (Password):
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <span className="material-symbols-outlined text-lg">lock</span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Memverifikasi Akses...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">login</span>
                <span>Masuk ke Dashboard & POS</span>
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 pt-5 border-t border-stone-200 text-center">
          <Link
            to="/"
            className="text-xs text-stone-500 hover:text-stone-900 font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Kembali ke Toko Sembako Nusantara</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
