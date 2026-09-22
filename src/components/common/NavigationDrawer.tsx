import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useWishlist } from '../../context/WishlistContext';
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

  const navItems = [
    { to: '/', label: language === 'JP' ? 'ホーム' : 'Beranda', icon: 'home' },
    { to: '/catalog', label: language === 'JP' ? 'カタログ' : 'Katalog Produk', icon: 'storefront' },
    { to: '/wishlist', label: language === 'JP' ? 'お気に入り' : 'Wishlist Favorit', icon: 'favorite', badge: totalWishlistItems > 0 ? totalWishlistItems : null },
    { to: '/contact', label: language === 'JP' ? 'お問い合わせ' : 'Kontak CS', icon: 'support_agent' },
    { to: '/tracking', label: language === 'JP' ? '配送追跡' : 'Lacak Pengiriman', icon: 'local_shipping' },
    { to: '/referral', label: language === 'JP' ? 'パートナー' : 'Mitra Diaspora', icon: 'handshake' },
    { to: '/guide', label: language === 'JP' ? '支払方法' : 'Panduan Bayar', icon: 'payments' },
    { to: '/account', label: language === 'JP' ? '注文履歴' : 'Pesanan Saya', icon: 'person' }
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

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
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
