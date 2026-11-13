import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { assetUrl } from '../../utils/assets';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  const isCheckout = pathname === '/checkout';

  return (
    <footer className="w-full bg-white border-t border-[#EBE5DF] mt-16">
      {/* 4 Pillars of Trust (Hidden on checkout page) */}
      {!isCheckout && (
        <div className="border-b border-[#EBE5DF] bg-[#FDF8F0]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-[#EBE5DF]/80 shadow-xs">
              <span className="material-symbols-outlined text-[#c41230] text-3xl mb-1">
                verified
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                {t('pillar_halal_title')}
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                {t('pillar_halal_desc')}
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-[#EBE5DF]/80 shadow-xs">
              <span className="material-symbols-outlined text-[#c41230] text-3xl mb-1">
                payments
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                {t('pillar_pay_title')}
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                {t('pillar_pay_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Footer Links */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <img
              src={assetUrl('logo-transparent.png')}
              alt="Sembako Nusantara"
              className="h-10 w-auto object-contain"
            />
            <span className="font-serif font-bold text-xl text-stone-900">
              Sembako Nusantara
            </span>
          </div>
          <p className="text-sm text-stone-600 max-w-sm leading-relaxed">
            {language === 'JP'
              ? '日本最大級のインドネシア食材・スパイス・即席麺・ハラール冷凍食品専門店。安心のハラール品質と迅速な発送で本場の味をお届けします。'
              : language === 'EN'
              ? 'Japan’s premier Indonesian grocery and halal e-commerce. Providing authentic spices, instant noodles, crackers, and trusted halal frozen food.'
              : 'Supermarket & e-commerce kuliner Indonesia nomor satu di Jepang. Menyediakan sembako, bumbu autentik, mi instan, kerupuk, dan frozen food halal terpercaya.'}
          </p>
          <div className="space-y-2 text-xs text-stone-600 pt-2">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-base text-[#c41230] shrink-0 mt-0.5">location_on</span>
              <div className="leading-tight">
                <span className="font-bold text-stone-800">〒144-0051 東京都大田区西蒲田5丁目9-16</span>
                <span className="block text-stone-500 text-[11px]">Tokyo, Ota-ku, Nishikamata 5-9-16</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#c41230]">schedule</span>
              <span>
                {language === 'JP'
                  ? '営業時間: 年中無休・24時間営業'
                  : language === 'EN'
                  ? 'Operating Hours: Open 24/7 Daily'
                  : 'Operasional: Buka Setiap Hari 24 Jam'}
              </span>
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
              <span className="material-symbols-outlined text-base text-stone-900">smart_display</span>
              <a href="https://www.tiktok.com/@sembakonusantara.jp" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold text-stone-800">
                TikTok: @sembakonusantara.jp
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
            <li>
              <Link to="/catalog" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? 'インドミー 焼きそば・ラーメン' : language === 'EN' ? 'Indomie Fried & Soup Noodles' : 'Indomie Mi Goreng & Kuah'}
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? 'ルンダン＆ラウォン特製調味料' : language === 'EN' ? 'Rendang & Rawon Spices' : 'Bumbu Rendang & Rawon'}
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? 'ABC トラシ・特製サンバル' : language === 'EN' ? 'ABC Terasi & Chili Sambal' : 'Sambal Terasi ABC & Uleg'}
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? 'ハラール冷凍肉・肉団子バソ' : language === 'EN' ? 'Halal Frozen Meat & Meatballs' : 'Daging & Bakso Halal Frozen'}
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? 'えびせんべい・ウンピン' : language === 'EN' ? 'Prawn Crackers & Emping' : 'Kerupuk Udang & Emping'}
              </Link>
            </li>
            <li>
              <Link to="/catalog" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? 'カパルアピ珈琲・テボトル茶' : language === 'EN' ? 'Kapal Api Coffee & Bottled Tea' : 'Kopi Kapal Api & Teh Botol'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Guides */}
        <div>
          <h5 className="font-bold text-sm text-stone-900 mb-4">{t('guides_help')}</h5>
          <ul className="space-y-2 text-xs text-stone-600">
            <li>
              <Link to="/about" className="hover:text-[#c41230] transition-colors font-medium">
                {language === 'JP' ? '会社概要・ビジョン＆ミッション' : language === 'EN' ? 'About Us, Vision & Mission' : 'Tentang Kami, Visi & Misi'}
              </Link>
            </li>
            <li>
              <Link to="/about#contact" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? '店舗所在地・24時間CS窓口' : language === 'EN' ? 'Store Address & 24h CS Support' : 'Alamat Toko & Kontak CS 24 Jam'}
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? '注文履歴・配送状況 (Pesanan Saya)' : language === 'EN' ? 'My Orders & Tracking' : 'Pesanan Saya (Lacak Order)'}
              </Link>
            </li>
            <li>
              <Link to="/referral" className="hover:text-[#c41230] transition-colors">
                {language === 'JP' ? 'パートナー＆コミュニティ提携' : language === 'EN' ? 'Partner & Community Program' : 'Program Mitra & Komunitas'}
              </Link>
            </li>
            <li>
              <Link to="/pintasan" className="text-[#c41230] font-bold hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">install_mobile</span>
                <span>
                  {language === 'JP' ? 'アプリを追加 (ホーム画面・PC)' : language === 'EN' ? 'Install App Shortcut' : 'Pasang Pintasan Aplikasi (HP/PC)'}
                </span>
              </Link>
            </li>
            {isAdmin && (
              <li className="pt-2 border-t border-stone-200">
                <Link to="/admin" className="text-[#c41230] font-bold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">shield_person</span>
                  <span>
                    {language === 'JP' ? '店舗レジ (POS) ＆ 管理者ERP' : language === 'EN' ? 'Cashier POS & Admin ERP' : 'Portal Kasir (POS) & Admin ERP'}
                  </span>
                </Link>
              </li>
            )}
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
            <p className="text-[11px] text-stone-500">
              {language === 'JP' ? 'LINE公式ID: @sembakonusantara' : 'Official LINE ID: @sembakonusantara'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods Strip in Footer (Available for both mobile and desktop) */}
      <div className="border-t border-[#EBE5DF] py-4 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs">
          <span className="text-stone-500 font-bold mr-1 uppercase text-[11px] tracking-wider">
            {language === 'JP' ? '決済方法:' : language === 'EN' ? 'Payment Methods:' : 'Metode Pembayaran:'}
          </span>
          {/* VISA */}
          <div className="h-6 px-2 rounded border border-stone-200 bg-white flex items-center justify-center shadow-2xs" title="VISA">
            <span className="font-black italic text-[#1A1F71] text-xs tracking-tight leading-none">VISA</span>
          </div>
          {/* Mastercard */}
          <div className="h-6 px-1.5 rounded border border-stone-200 bg-white flex items-center justify-center shadow-2xs" title="Mastercard">
            <span className="relative flex items-center w-6 h-3.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]/90 -ml-1.5 inline-block" />
            </span>
          </div>
          {/* JCB */}
          <div className="h-6 px-1.5 rounded border border-stone-200 bg-white flex items-center justify-center gap-0.5 shadow-2xs" title="JCB">
            <span className="w-2 h-3.5 rounded-2xs bg-[#0066B2] text-white text-[7px] font-black flex items-center justify-center leading-none">J</span>
            <span className="w-2 h-3.5 rounded-2xs bg-[#E4002B] text-white text-[7px] font-black flex items-center justify-center leading-none">C</span>
            <span className="w-2 h-3.5 rounded-2xs bg-[#00A94F] text-white text-[7px] font-black flex items-center justify-center leading-none">B</span>
          </div>
          {/* AMEX */}
          <div className="h-6 px-1.5 rounded bg-[#016FD0] text-white flex flex-col items-center justify-center leading-[0.8] shadow-2xs" title="American Express">
            <span className="text-[6px] font-black tracking-tighter uppercase">AMEX</span>
          </div>
          {/* PayPay */}
          <div className="h-6 px-2 rounded border border-stone-200 bg-white flex items-center gap-1 shadow-2xs" title="PayPay">
            <span className="w-3.5 h-3.5 rounded-2xs bg-[#FF0033] text-white font-black text-[9px] italic flex items-center justify-center leading-none">P</span>
            <span className="font-extrabold text-stone-900 text-[10px] tracking-tight leading-none">PayPay</span>
          </div>
          {/* LINE Pay */}
          <div className="h-6 px-2 rounded border border-stone-200 bg-white flex items-center gap-0.5 shadow-2xs" title="LINE Pay">
            <span className="font-black text-stone-900 text-[9px] tracking-tight leading-none">LINE</span>
            <span className="px-1 py-0.2 rounded-2xs bg-[#06C755] text-white font-extrabold text-[8px] leading-none">Pay</span>
          </div>
          {/* Konbini */}
          <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 font-bold rounded text-[10px]">
            Konbini
          </span>
          {/* QRIS / JPQR */}
          <span className="px-2 py-0.5 bg-[#c41230] text-white font-black rounded text-[10px]">
            QRIS / JPQR
          </span>
          {/* Transfer */}
          <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px]">
            Transfer IDR / Yen
          </span>
          {/* Cash / COD */}
          <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[10px]">
            Cash / COD
          </span>
        </div>
      </div>

      {/* Logistics Badges */}
      <div className="border-t border-[#EBE5DF] py-5 px-4 sm:px-6 lg:px-8 bg-[#FDF8F0]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
          <span className="text-stone-500 font-bold mr-1">{t('logistics')}</span>
          <span className="px-2 py-0.5 bg-[#c41230]/10 text-[#c41230] border border-[#c41230]/30 font-bold rounded text-[11px]">
            🚀 Delivery Service (Max 3 Station)
          </span>
          <span className="px-2 py-0.5 bg-white rounded border border-[#EBE5DF] font-medium text-stone-700">
            📦 Ekspedisi (Yamato & Sagawa)
          </span>
          <span className="px-2 py-0.5 bg-stone-800 text-white font-bold rounded text-[11px]">
            🤝 COD
          </span>
        </div>
      </div>

      {/* Copyright with ample bottom padding so fixed bottom bar never covers footer text on mobile */}
      <div className="bg-[#EBE5DF]/60 pt-4 pb-24 md:pb-6 px-4 text-center text-xs text-stone-600">
        <p>© 2026 Sembako Nusantara Jepang (sembako-nusantara.jp). All Rights Reserved.</p>
      </div>
    </footer>
  );
};
