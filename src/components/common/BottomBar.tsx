import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const BottomBar: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { language } = useLanguage();

  // Hide bottom bar on admin pages
  if (location.pathname.startsWith('/admin') || location.pathname === '/pos-display') {
    return null;
  }

  const currentPath = location.pathname;

  const isHomeActive = currentPath === '/';
  const isCatalogActive =
    currentPath === '/catalog' ||
    currentPath === '/katalog' ||
    currentPath === '/products' ||
    currentPath.startsWith('/product/');
  const isCartActive = currentPath === '/cart';
  const isProfileActive =
    currentPath === '/profile' ||
    currentPath === '/account' ||
    currentPath === '/orders' ||
    currentPath === '/pesanan-saya' ||
    currentPath === '/favorit' ||
    currentPath === '/wishlist';

  const handleChatCS = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(
      'https://wa.me/6285773875762?text=Halo%20Sembako%20Nusantara,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20pemesanan',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const navItems = [
    {
      id: 'home',
      label: language === 'JP' ? 'ホーム' : language === 'EN' ? 'Home' : 'Home',
      icon: 'home',
      to: '/',
      isActive: isHomeActive,
      isAction: false
    },
    {
      id: 'catalog',
      label: language === 'JP' ? 'カタログ' : language === 'EN' ? 'Catalog' : 'Katalog',
      icon: 'grid_view',
      to: '/catalog',
      isActive: isCatalogActive,
      isAction: false
    },
    {
      id: 'chat-cs',
      label: language === 'JP' ? 'CSチャット' : language === 'EN' ? 'Chat CS' : 'Chat CS',
      icon: 'headset_mic',
      to: '#chat-cs',
      isActive: false,
      isAction: true,
      onClick: handleChatCS
    },
    {
      id: 'cart',
      label: language === 'JP' ? 'カート' : language === 'EN' ? 'Cart' : 'Keranjang',
      icon: 'shopping_cart',
      to: '/cart',
      isActive: isCartActive,
      isAction: false,
      badge: totalItems > 0 ? (totalItems > 99 ? '99+' : totalItems) : null
    },
    {
      id: 'profile',
      label: language === 'JP' ? 'マイページ' : language === 'EN' ? 'Account' : 'Akun',
      icon: 'person',
      to: '/profile',
      isActive: isProfileActive,
      isAction: false
    }
  ];

  return (
    <nav
      aria-label="Bottom Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-xl mx-auto h-16 grid grid-cols-5 items-center px-1">
        {navItems.map((item) => {
          const content = (
            <div className="flex flex-col items-center justify-center w-full h-full py-1.5 transition-all select-none">
              {/* Icon Container with optional Badge */}
              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-[23px] transition-transform duration-150 ${
                    item.isActive
                      ? 'text-[#2E7D32] scale-110 font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  style={{
                    fontVariationSettings: item.isActive
                      ? "'FILL' 1, 'wght' 600"
                      : "'FILL' 0, 'wght' 400"
                  }}
                >
                  {item.icon}
                </span>

                {/* Cart Badge */}
                {item.badge !== undefined && item.badge !== null && (
                  <span className="absolute -top-1 -right-2 min-w-[17px] h-[17px] bg-[#c41230] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-xs animate-in zoom-in duration-150">
                    {item.badge}
                  </span>
                )}

                {/* Chat CS Online Pulse Dot */}
                {item.id === 'chat-cs' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white animate-pulse" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                  item.isActive
                    ? 'font-bold text-[#2E7D32]'
                    : 'font-medium text-stone-500 hover:text-stone-800'
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform focus:outline-none"
                title={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform focus:outline-none"
              title={item.label}
            >
              {content}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
