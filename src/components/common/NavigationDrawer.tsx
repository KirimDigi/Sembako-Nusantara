import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { assetUrl } from '../../utils/assets';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', labelKey: 'home', icon: 'home' },
    { to: '/catalog', labelKey: 'catalog', icon: 'storefront' },
    { to: '/contact', labelKey: 'contact', icon: 'support_agent' },
    { to: '/tracking', labelKey: 'tracking', icon: 'local_shipping' },
    { to: '/referral', labelKey: 'referral', icon: 'handshake' },
    { to: '/guide', labelKey: 'payment_guide', icon: 'payments' },
    { to: '/account', labelKey: 'my_account', icon: 'person' }
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
                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? 'bg-[#c41230] text-white shadow-sm font-semibold'
                    : 'text-stone-700 hover:bg-[#FDF8F0] hover:text-[#c41230]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-xl ${
                      isActive ? 'text-white' : 'text-[#c41230]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{t(item.labelKey)}</span>
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
              className="text-[#15803D] font-bold hover:underline"
            >
              +62 857-7387-5762
            </a>
          </div>
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>{t('official_delivery')}:</span>
            <span className="font-medium text-stone-900">
              Yamato & Sagawa Express
            </span>
          </div>

          <div className="pt-2">
            <Link
              to="/admin"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-[#c41230]">shield_person</span>
              <span>Portal Admin & POS Kasir</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
