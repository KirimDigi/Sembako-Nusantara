import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-white border-t border-[#EBE5DF] mt-16">
      {/* 4 Pillars of Trust */}
      <div className="bg-[#F6F3F2] border-b border-[#EBE5DF] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900">{t('pillar_halal_title')}</h4>
              <p className="text-xs text-stone-600 mt-1">
                {t('pillar_halal_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFDAD9] text-[#9a0021] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900">{t('pillar_delivery_title')}</h4>
              <p className="text-xs text-stone-600 mt-1">
                {t('pillar_delivery_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFDEA4] text-[#5f4716] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900">{t('pillar_cs_title')}</h4>
              <p className="text-xs text-stone-600 mt-1">
                {t('pillar_cs_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E5E2E1] text-stone-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-900">{t('pillar_pay_title')}</h4>
              <p className="text-xs text-stone-600 mt-1">
                {t('pillar_pay_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-transparent.png"
              alt="Sembako Nusantara"
              className="h-10 w-auto object-contain"
            />
            <span className="font-serif font-bold text-xl text-stone-900">
              Sembako Nusantara
            </span>
          </div>
          <p className="text-sm text-stone-600 max-w-sm leading-relaxed">
            Supermarket & e-commerce kuliner Indonesia nomor satu di Jepang. Menyediakan sembako, bumbu autentik, mi instan, kerupuk, dan frozen food halal terpercaya.
          </p>
          <div className="space-y-2 text-xs text-stone-600 pt-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#c41230]">location_on</span>
              <span>〒110-0015 Tokyo, Taito City, Higashiueno 1-chome</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#c41230]">schedule</span>
              <span>Operasional: Buka Setiap Hari 24 Jam</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#15803D]">chat</span>
              <a href="https://wa.me/6285773875762" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold text-stone-800">
                WhatsApp: +62 857-7387-5762
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#E1306C]">photo_camera</span>
              <a href="https://www.instagram.com/sembakonusantara.jp/" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold text-stone-800">
                Instagram: @sembakonusantara.jp
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#c41230]">mail</span>
              <span>support@sembako-nusantara.jp</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h5 className="font-bold text-sm text-stone-900 mb-4">{t('popular_categories')}</h5>
          <ul className="space-y-2 text-xs text-stone-600">
            <li><Link to="/catalog" className="hover:text-[#c41230] transition-colors">Indomie Mi Goreng & Kuah</Link></li>
            <li><Link to="/catalog" className="hover:text-[#c41230] transition-colors">Bumbu Rendang & Rawon</Link></li>
            <li><Link to="/catalog" className="hover:text-[#c41230] transition-colors">Sambal Terasi ABC & Uleg</Link></li>
            <li><Link to="/catalog" className="hover:text-[#c41230] transition-colors">Daging & Bakso Halal Frozen</Link></li>
            <li><Link to="/catalog" className="hover:text-[#c41230] transition-colors">Kerupuk Udang & Emping</Link></li>
            <li><Link to="/catalog" className="hover:text-[#c41230] transition-colors">Kopi Kapal Api & Teh Botol</Link></li>
          </ul>
        </div>

        {/* Guides */}
        <div>
          <h5 className="font-bold text-sm text-stone-900 mb-4">{t('guides_help')}</h5>
          <ul className="space-y-2 text-xs text-stone-600">
            <li><Link to="/guide" className="hover:text-[#c41230] transition-colors">Cara Bayar via JPQR / PayPay / Konbini</Link></li>
            <li><Link to="/tracking" className="hover:text-[#c41230] transition-colors">Lacak Kiriman Yamato/Sagawa</Link></li>
            <li><Link to="/contact" className="hover:text-[#c41230] transition-colors">Kontak & Layanan CS 24 Jam</Link></li>
            <li><Link to="/referral" className="hover:text-[#c41230] transition-colors">Program Mitra & Komunitas</Link></li>
            <li><Link to="/account" className="hover:text-[#c41230] transition-colors">Riwayat Pesanan Pelanggan</Link></li>
            <li className="pt-2 border-t border-stone-200">
              <Link to="/admin" className="text-[#c41230] font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">shield_person</span>
                <span>Portal Kasir (POS) & Admin ERP</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Official LINE Info */}
        <div>
          <h5 className="font-bold text-sm text-stone-900 mb-4">{t('line_voucher_badge')}</h5>
          <p className="text-xs text-stone-600 mb-3">
            {t('line_voucher_desc')}
          </p>
          <div className="bg-[#F6F3F2] p-4 rounded-xl border border-[#EBE5DF] text-center space-y-2">
            <div className="bg-[#06C755] text-white font-bold py-2 px-4 rounded-full text-xs flex items-center justify-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-base">chat</span>
              <span>LINE @sembakonusantara</span>
            </div>
            <p className="text-[11px] text-stone-500">Official LINE ID: @sembakonusantara</p>
          </div>
        </div>
      </div>

      {/* Payment & Logistics Badges */}
      <div className="border-t border-[#EBE5DF] py-6 px-4 sm:px-6 lg:px-8 bg-[#FDF8F0]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-stone-500 font-semibold">{t('payment_methods')}</span>
            <span className="px-2 py-1 bg-[#c41230] text-white font-black rounded text-[11px]">JPQR</span>
            <span className="px-2 py-1 bg-red-100 text-[#c41230] font-bold rounded text-[11px]">JAPAN QRIS</span>
            <span className="px-2 py-1 bg-white rounded border border-[#EBE5DF] font-bold text-stone-700">VISA</span>
            <span className="px-2 py-1 bg-white rounded border border-[#EBE5DF] font-bold text-stone-700">MasterCard</span>
            <span className="px-2 py-1 bg-white rounded border border-[#EBE5DF] font-bold text-stone-700">JCB</span>
            <span className="px-2 py-1 bg-[#FF0033] text-white font-bold rounded">PayPay</span>
            <span className="px-2 py-1 bg-[#06C755] text-white font-bold rounded">LINE Pay</span>
            <span className="px-2 py-1 bg-white rounded border border-[#EBE5DF] font-bold text-stone-700">Konbini Pay</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-semibold">{t('logistics')}</span>
            <span className="px-2 py-1 bg-white rounded border border-[#EBE5DF] font-medium text-stone-700">Yamato Transport (宅急便)</span>
            <span className="px-2 py-1 bg-white rounded border border-[#EBE5DF] font-medium text-stone-700">Sagawa Express (佐川急便)</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#EBE5DF]/60 py-4 px-4 text-center text-xs text-stone-600">
        <p>© 2026 Sembako Nusantara Jepang (sembako-nusantara.jp). All Rights Reserved.</p>
      </div>
    </footer>
  );
};
