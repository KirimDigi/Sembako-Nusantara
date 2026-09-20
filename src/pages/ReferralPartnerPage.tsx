import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ReferralPartnerPage: React.FC = () => {
  const { isAuthenticated, currentUser, loginAsCustomer } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = isAuthenticated
    ? `SN-${(currentUser?.id || 'WILLY').toUpperCase()}2026`
    : '';

  const handleCopy = () => {
    if (!isAuthenticated || !referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="text-center space-y-2 mb-10">
        <span className="px-3 py-1 bg-[#FFDAD9] text-[#9a0021] text-xs font-bold rounded-full uppercase tracking-wider">
          Program Afiliasi & Kemitraan Toko
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900">
          Program Kemitraan & Referral Diaspora (アフィリエイト) 🤝
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
          Bagikan kelezatan produk Nusantara kepada sesama teman diaspora atau komunitas di Jepang dan dapatkan komisi poin belanja!
        </p>
      </div>

      {/* Referral Card */}
      <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-10 shadow-sm text-center space-y-6 mb-10">
        <div className="w-16 h-16 bg-[#DCFCE7] text-[#15803D] rounded-2xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">card_giftcard</span>
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="font-heading font-bold text-xl text-stone-900">
            Kode Referral Unik Anda
          </h2>
          <p className="text-xs text-stone-600">
            Teman Anda mendapatkan kupon diskon <strong>¥500</strong>, dan Anda memperoleh <strong>5% Komisi</strong> dalam bentuk saldo belanja untuk setiap transaksi.
          </p>
        </div>

        {/* Code Box */}
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 max-w-sm mx-auto bg-[#FDF8F0] border-2 border-dashed border-[#c41230] p-3.5 rounded-2xl">
              <span className="font-mono font-black text-xl text-[#c41230] tracking-wider">
                {referralCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-4 py-2 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {copied ? 'Tersalin!' : 'Salin Kode'}
              </button>
            </div>
            <p className="text-xs text-emerald-700 font-medium">
              ✓ Kode aktif untuk akun <strong>{currentUser?.name}</strong>
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-4">
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold">
                Kode Belum Tersedia
              </span>
              <p className="text-xs text-amber-900 font-medium">
                Kode referral masih kosong karena Anda belum masuk ke akun. Silakan login untuk mendapatkan kode referral unik Anda.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Link
                to="/account"
                className="px-6 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Masuk ke Akun
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3 Step Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#EBE5DF] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFDAD9] text-[#9a0021] flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="font-bold text-base text-stone-900">Bagikan Kode / Link</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Kirimkan kode referral Anda melalui WhatsApp, Instagram, Facebook group komunitas PPI/Kenshusei/Tokutei Ginou.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EBE5DF] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFDEA4] text-[#5f4716] flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="font-bold text-base text-stone-900">Teman Belanja Hemat</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Teman baru Anda mendapatkan potongan langsung sebesar ¥500 pada transaksi pertama mereka di Sembako Nusantara.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#EBE5DF] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="font-bold text-base text-stone-900">Dapatkan Komisi</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Poin komisi otomatis masuk ke akun Anda dan dapat dicairkan atau dipakai belanja kebutuhan sembako gratis!
          </p>
        </div>
      </div>
    </div>
  );
};
