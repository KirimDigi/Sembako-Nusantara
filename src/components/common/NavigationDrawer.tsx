import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { assetUrl } from '../../utils/assets';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { t, language } = useLanguage();
  const { totalWishlistItems } = useWishlist();
  const { isAuthenticated, currentUser, isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: language === 'JP' ? 'ホーム' : language === 'EN' ? 'Home' : 'Beranda', icon: 'home' },
    { to: '/catalog', label: language === 'JP' ? 'カタログ' : language === 'EN' ? 'Catalog' : 'Katalog Produk', icon: 'storefront' },
    { to: '/wishlist', label: language === 'JP' ? 'お気に入り' : language === 'EN' ? 'Wishlist' : 'Wishlist Favorit', icon: 'favorite', badge: totalWishlistItems > 0 ? totalWishlistItems : null },
    { to: '/about', label: language === 'JP' ? '会社概要・ビジョン' : language === 'EN' ? 'About Us & Contact' : 'Tentang Kami & Kontak', icon: 'info' },
    { to: '/orders', label: language === 'JP' ? '注文履歴・配送状況 (Pesanan Saya)' : language === 'EN' ? 'My Orders & Tracking' : 'Pesanan Saya (Lacak Order)', icon: 'receipt_long' },
    { to: '/referral', label: language === 'JP' ? 'パートナー' : language === 'EN' ? 'Partner' : 'Mitra Diaspora', icon: 'handshake' },
    { to: '/profile', label: language === 'JP' ? 'マイページ' : language === 'EN' ? 'My Profile' : 'Profil & Member', icon: 'account_circle' }
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE5DF] bg-[#FCF9F8]">
          <div className="flex items-center gap-2.5">
            <img
              src={assetUrl('logo-transparent.png')}
              alt="Sembako Nusantara"
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-sm text-stone-900">
              Sembako Nusantara
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-600 hover:text-[#c41230] rounded-full hover:bg-stone-100 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* User Account Quick Card in Drawer */}
        <div className="px-5 pt-3 pb-2 border-b border-stone-100 bg-stone-50/60">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-[#c41230] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser?.name?.[0] || 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 group-hover:text-[#c41230] transition-colors truncate max-w-[170px]">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {language === 'JP' ? '会員マイページ' : language === 'EN' ? 'Member Profile' : 'Profil Member'}
                  </div>
                </div>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-extrabold rounded-lg shadow-xs flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <Link
              to="/profile"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-base text-[#c41230]">account_circle</span>
              <span>{language === 'JP' ? 'ログイン / 会員登録' : language === 'EN' ? 'Sign In / Register' : 'Masuk / Daftar Akun'}</span>
            </Link>
          )}
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto py-3 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-[#c41230] text-white shadow-sm font-semibold'
                    : 'text-stone-700 hover:bg-[#FDF8F0] hover:text-[#c41230]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isActive ? 'text-white' : 'text-[#c41230]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-[#c41230]' : 'bg-[#c41230] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Drawer Free Shipping Banner */}
        <div className="mx-4 mb-2 p-3 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/70 flex items-center gap-3">
          <img
            src={assetUrl('mascot-bendera.png')}
            alt="Mascot Gratis Ongkir"
            className="w-11 h-11 object-contain shrink-0 drop-shadow-xs"
          />
          <div className="text-[11px] leading-tight">
            <span className="font-extrabold text-[#c41230] block">
              {language === 'JP' ? '¥15,000以上で送料無料' : language === 'EN' ? 'Free Shipping ¥15,000+' : 'Gratis Ongkir ¥15,000+'}
            </span>
            <span className="text-stone-500 text-[10px]">
              {language === 'JP' ? 'ヤマト運輸＆佐川急便 全国47都道府県対応' : language === 'EN' ? 'Yamato & Sagawa to all 47 Japan prefectures' : 'Yamato & Sagawa ke 47 prefektur Jepang'}
            </span>
          </div>
        </div>

        {/* Drawer Footer Info */}
        <div className="p-5 border-t border-[#EBE5DF] bg-stone-50 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>{t('cs_support')}:</span>
            <a
              href="https://wa.me/6285773875762"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c41230] font-bold hover:underline flex items-center gap-1"
            >
              <img src={assetUrl('whatsapp-icon.png')} alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
              <span>+62 857-7387-5762</span>
            </a>
          </div>
          <div className="text-[11px] text-stone-400 text-center pt-2">
            © 2026 Sembako Nusantara Jepang.
          </div>
        </div>
      </div>
    </div>
  );
};
