import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, currentUser, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If user is logged in as Customer, strictly block access to Admin Dashboard/POS
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#EBE5DF] shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-[#c41230] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-3xl">block</span>
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-[11px] font-extrabold uppercase tracking-wider rounded-full border border-red-200">
              Akses Ditolak (403 Forbidden)
            </span>
            <h1 className="font-heading font-black text-2xl text-stone-900">
              Khusus Pengelola Toko
            </h1>
            <p className="text-xs text-stone-600 leading-relaxed">
              Halo <strong>{currentUser?.name || 'Pelanggan'}</strong>, akun Anda terdaftar sebagai <strong>Akun Pelanggan (Customer)</strong>. Anda hanya memiliki izin untuk berbelanja, mengecek katalog, dan melacak pesanan.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <span className="material-symbols-outlined text-base">info</span>
              <span>Ingin masuk sebagai Admin?</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Silakan keluar dari akun pelanggan dan masuk menggunakan kredensial Admin resmi (ID: <code>id0926</code>).
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              to="/catalog"
              className="w-full py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>Kembali Belanja Sembako</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Keluar & Masuk Sebagai Admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
