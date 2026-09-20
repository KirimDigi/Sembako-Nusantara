import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { TopBar } from './TopBar';
import { NavigationDrawer } from './NavigationDrawer';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { totalItems } = useCart();
  const { t, language } = useLanguage();
  const { isAuthenticated, currentUser, isAdmin } = useAuth();

  const navLinks = [
    { to: '/', labelId: 'Beranda', labelJp: 'ホーム', labelEn: 'Home', icon: 'home' },
    { to: '/catalog', labelId: 'Katalog', labelJp: 'カタログ', labelEn: 'Catalog', icon: 'storefront' },
    { to: '/contact', labelId: 'Kontak', labelJp: 'お問い合わせ', labelEn: 'Contact', icon: 'support_agent' },
    { to: '/tracking', labelId: 'Lacak', labelJp: '追跡', labelEn: 'Tracking', icon: 'local_shipping' },
    { to: '/referral', labelId: 'Mitra Diaspora', labelJp: 'パートナー', labelEn: 'Partner', icon: 'handshake' },
    { to: '/guide', labelId: 'Panduan Bayar', labelJp: '支払方法', labelEn: 'Guide', icon: 'payments' },
    { to: '/account', labelId: 'Pesanan Saya', labelJp: '注文履歴', labelEn: 'Orders', icon: 'person' },
  ];

  const getNavLabel = (link: typeof navLinks[0]) => {
    if (language === 'JP') return link.labelJp;
    if (language === 'EN') return link.labelEn;
    return link.labelId;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-40 shadow-sm bg-white">
        {/* Top Utility Bar */}
        <TopBar />

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Logo Link with Sembako Nusantara Transparent Branding */}
            <Link
              to="/"
              className="flex items-center gap-2 group shrink-0"
              aria-label="Sembako Nusantara Home"
            >
              <img
                src="/logo-transparent.png"
                alt="Sembako Nusantara"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Horizontal Navigation Menu (Hidden on mobile, Visible on lg+) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-red-50 text-[#c41230] font-bold shadow-xs'
                        : 'text-stone-700 hover:text-[#c41230] hover:bg-stone-50'
                    }`
                  }
                >
                  <span>{getNavLabel(link)}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              {/* User Account / Login Button */}
              <Link
                to={isAuthenticated ? (isAdmin ? '/admin' : '/account') : '/account'}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 hover:border-[#c41230] bg-stone-50/80 hover:bg-white text-xs font-bold text-stone-700 hover:text-[#c41230] transition-colors"
                title={isAuthenticated ? `Akun: ${currentUser?.name}` : 'Masuk / Login Akun'}
              >
                {isAuthenticated ? (
                  <>
                    <span className="w-5 h-5 rounded-full bg-[#c41230] text-white text-[10px] flex items-center justify-center font-bold">
                      {currentUser?.name?.[0] || 'U'}
                    </span>
                    <span className="max-w-[85px] truncate">{currentUser?.name?.split(' ')[0] || 'Akun'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base text-[#c41230]">account_circle</span>
                    <span>Masuk</span>
                  </>
                )}
              </Link>

              {/* Belanja Button */}
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {t('shop_now')}
              </Link>

              {/* Cart Icon Link */}
              <Link
                to="/cart"
                className="relative p-1.5 text-stone-700 hover:text-[#c41230] transition-colors"
                title={t('cart')}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl block">
                  shopping_cart
                </span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c41230] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Button (ONLY VISIBLE ON MOBILE < lg) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden p-1.5 text-stone-800 hover:text-[#c41230] focus:outline-none transition-colors rounded-lg hover:bg-stone-100"
                aria-label={t('menu')}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl block">
                  menu
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-Over Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
