import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { assetUrl } from '../../utils/assets';

export interface POSCollapsedSidebarProps {
  activeRole: UserRole;
  posTransactionsCount: number;
  lowStockCount: number;
  pendingOrdersCount: number;
  onExpandSidebar: () => void;
  onLogout: () => void;
}

interface NavItemDef {
  id: string;
  label: string;
  desc: string;
  path: string;
  icon: string;
  badge?: string | number | null;
  badgeColor?: string;
  allowedRoles: UserRole[];
  isActive?: boolean;
  subLinks?: Array<{ label: string; path: string; icon?: string }>;
}

export const POSCollapsedSidebar: React.FC<POSCollapsedSidebarProps> = ({
  activeRole,
  posTransactionsCount,
  lowStockCount,
  pendingOrdersCount,
  onExpandSidebar,
  onLogout
}) => {
  const location = useLocation();
  const { language, t } = useLanguage();

  const navItems: NavItemDef[] = [
    {
      id: 'dashboard',
      label: t('admin_nav_dashboard'),
      desc: language === 'JP' ? '総合概要・ダッシュボード' : language === 'EN' ? 'Overview & key metrics' : 'Ringkasan performa toko',
      path: '/admin',
      icon: 'dashboard',
      allowedRoles: ['Super Admin (Owner)', 'Finance / Akuntan', 'Admin Gudang'],
      isActive: location.pathname === '/admin'
    },
    {
      id: 'pos',
      label: t('admin_nav_pos'),
      desc: language === 'JP' ? '店舗レジ端末 (Live)' : language === 'EN' ? 'Store POS Terminal' : 'Mesin Kasir Transaksi Langsung',
      path: '/admin/pos',
      icon: 'point_of_sale',
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      allowedRoles: ['Super Admin (Owner)', 'Kasir (POS)', 'Finance / Akuntan'],
      isActive: location.pathname === '/admin/pos',
      subLinks: [
        {
          label: language === 'JP' ? 'POSレジ端末 (Live)' : language === 'EN' ? 'Cashier Terminal' : 'Terminal Kasir Live',
          path: '/admin/pos',
          icon: 'point_of_sale'
        },
        {
          label: language === 'JP' ? `売上履歴 (${posTransactionsCount})` : language === 'EN' ? `Sales History (${posTransactionsCount})` : `Riwayat Penjualan (${posTransactionsCount})`,
          path: '/admin/pos?tab=history',
          icon: 'receipt_long'
        }
      ]
    },
    {
      id: 'inventory',
      label: t('admin_nav_inventory'),
      desc: lowStockCount > 0 
        ? (language === 'JP' ? `${lowStockCount}件 在庫注意` : language === 'EN' ? `${lowStockCount} items low stock` : `${lowStockCount} produk stok menipis`)
        : (language === 'JP' ? '全在庫正常' : language === 'EN' ? 'All stock optimal' : 'Katalog stok gudang'),
      path: '/admin/inventory',
      icon: 'inventory_2',
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-stone-950 font-black',
      allowedRoles: ['Super Admin (Owner)', 'Admin Gudang'],
      isActive: location.pathname === '/admin/inventory'
    },
    {
      id: 'purchasing',
      label: t('admin_nav_pembelian'),
      desc: language === 'JP' ? '仕入・発注書PO・ベンダー比較' : language === 'EN' ? 'Purchasing & Vendor PO' : 'Input pembelian & supplier PO',
      path: '/admin/purchasing',
      icon: 'shopping_bag',
      allowedRoles: ['Super Admin (Owner)', 'Admin Gudang', 'Finance / Akuntan'],
      isActive: location.pathname === '/admin/purchasing' || location.pathname === '/admin/competitors'
    },
    {
      id: 'orders',
      label: t('admin_nav_orders'),
      desc: pendingOrdersCount > 0
        ? (language === 'JP' ? `${pendingOrdersCount}件 出荷準備中` : language === 'EN' ? `${pendingOrdersCount} orders waiting` : `${pendingOrdersCount} pesanan siap diproses`)
        : (language === 'JP' ? 'オンライン注文一覧' : language === 'EN' ? 'Customer online orders' : 'Kelola pesanan online web'),
      path: '/admin/orders',
      icon: 'local_shipping',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-[#c41230] text-white',
      allowedRoles: ['Super Admin (Owner)', 'Kasir (POS)', 'Admin Gudang'],
      isActive: location.pathname === '/admin/orders'
    },
    {
      id: 'accounting',
      label: t('admin_nav_accounting'),
      desc: language === 'JP' ? '消費税8%/10%・経費出納帳' : language === 'EN' ? 'Accounting & JCT Tax' : 'Pembukuan kas, aset & pajak JCT',
      path: '/admin/accounting',
      icon: 'account_balance',
      badge: 'JCT',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      allowedRoles: ['Super Admin (Owner)', 'Finance / Akuntan'],
      isActive: location.pathname === '/admin/accounting'
    },
    {
      id: 'crm',
      label: t('admin_nav_crm'),
      desc: language === 'JP' ? '顧客・会員・ポイント管理' : language === 'EN' ? 'Customer directory & CRM' : 'Pelanggan & poin reward',
      path: '/admin/crm',
      icon: 'group',
      allowedRoles: ['Super Admin (Owner)', 'Kasir (POS)'],
      isActive: location.pathname === '/admin/crm'
    },
    {
      id: 'reports',
      label: t('admin_nav_laporan'),
      desc: language === 'JP' ? '日次・月次・損益計算書' : language === 'EN' ? 'Revenue & P&L Reports' : 'Laporan omzet & laba rugi',
      path: '/admin/reports',
      icon: 'analytics',
      allowedRoles: ['Super Admin (Owner)', 'Finance / Akuntan'],
      isActive: location.pathname === '/admin/reports'
    },
    {
      id: 'settings',
      label: t('admin_nav_settings'),
      desc: language === 'JP' ? '設定・サーマルプリンター' : language === 'EN' ? 'Store & Printer Setup' : 'Atur kasir, akun & thermal printer',
      path: '/admin/settings',
      icon: 'settings',
      allowedRoles: ['Super Admin (Owner)'],
      isActive: location.pathname === '/admin/settings'
    }
  ];

  return (
    <aside
      className="hidden md:flex flex-col items-center justify-between w-16 lg:w-[68px] bg-[#121212] border-r border-stone-800/90 text-stone-200 py-3.5 h-screen shrink-0 sticky top-0 z-[100] shadow-2xl select-none"
      aria-label="POS Mini Sidebar Navigation"
    >
      {/* 1. Header / Top Brand Icon */}
      <div className="flex flex-col items-center gap-2">
        <div className="group relative flex items-center justify-center">
          <Link
            to="/admin"
            className="w-10 h-10 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 p-1 flex items-center justify-center transition-all duration-200 shadow-md group-hover:scale-105 group-hover:border-rose-500/50"
            aria-label="Kembali ke Dashboard Utama"
          >
            <img
              src={assetUrl('logo-admin.jpeg')}
              alt="Logo Sembako Nusantara"
              className="w-full h-full rounded-lg object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = assetUrl('LOGO PUTIH SN.jpeg');
              }}
            />
          </Link>

          {/* Tooltip on Hover */}
          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[160] pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-[#18181b]" />
            <div className="bg-[#18181b]/95 backdrop-blur-md text-white border border-stone-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.7)] rounded-xl px-3.5 py-2.5 min-w-[200px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-white tracking-wide">SEMBAKO NUSANTARA</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-rose-600/30 text-rose-300 border border-rose-500/40">
                  POS HUB
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5 font-normal">Integrated Retail POS & ERP</p>
              <div className="mt-2 pt-1.5 border-t border-stone-800 flex items-center justify-between text-[9px] text-stone-400">
                <span>Role: <strong className="text-stone-200">{activeRole}</strong></span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Small Horizontal Divider */}
        <div className="w-7 h-px bg-stone-800/80 my-1" />
      </div>

      {/* 2. Middle Navigation Items */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-2 my-auto py-2 overflow-y-auto no-scrollbar w-full px-2">
        {navItems.map((item) => {
          const isAllowed = item.allowedRoles.includes(activeRole);
          const active = item.isActive;

          return (
            <div key={item.id} className="group relative flex items-center justify-center w-full">
              {/* Active Indicator Bar on Left Edge */}
              {active && (
                <span
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-[#c41230] rounded-r-full shadow-[0_0_10px_rgba(196,18,48,0.8)]"
                  aria-hidden="true"
                />
              )}

              {/* Main Nav Link / Button */}
              <Link
                to={isAllowed ? item.path : '#'}
                onClick={(e) => {
                  if (!isAllowed) e.preventDefault();
                }}
                className={`relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-gradient-to-tr from-[#c41230] to-rose-600 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-500/40 scale-105'
                    : isAllowed
                    ? 'text-stone-400 hover:text-white hover:bg-stone-800/90 hover:scale-105'
                    : 'text-stone-700 hover:bg-stone-900/40 cursor-not-allowed opacity-40'
                }`}
                aria-label={item.label}
              >
                <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">
                  {item.icon}
                </span>

                {/* Badge Overlay (for counts or notifications) */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center shadow-md ${
                      typeof item.badge === 'number'
                        ? item.badgeColor || 'bg-[#c41230] text-white'
                        : 'bg-emerald-500 text-stone-950 text-[8px] font-black uppercase'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>

              {/* Elegant Hover Tooltip on Right */}
              <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[160] pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
                {/* Arrow Pointer */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-[#18181b]" />

                {/* Tooltip Content Card */}
                <div className="bg-[#18181b]/95 backdrop-blur-md text-white border border-stone-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.7)] rounded-xl px-3.5 py-2.5 min-w-[210px] max-w-[280px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-stone-100 tracking-wide flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                          item.badgeColor || 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-stone-400 mt-0.5 font-normal leading-snug">
                    {item.desc}
                  </p>

                  {/* Sub-links if available (e.g. POS quick toggle between Terminal & Sales History) */}
                  {item.subLinks && item.subLinks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-stone-500">
                        {language === 'JP' ? 'クイック切替:' : language === 'EN' ? 'Quick Switch:' : 'Pintasan Halaman:'}
                      </span>
                      {item.subLinks.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          className="text-[11px] font-medium text-stone-300 hover:text-white hover:bg-stone-800/80 rounded-lg px-2 py-1 flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            {sub.icon && (
                              <span className="material-symbols-outlined text-xs text-rose-400">
                                {sub.icon}
                              </span>
                            )}
                            <span>{sub.label}</span>
                          </span>
                          <span className="material-symbols-outlined text-xs text-stone-500">
                            arrow_forward
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!isAllowed && (
                    <div className="mt-2 pt-1.5 border-t border-red-950/60 text-[9px] text-red-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">lock</span>
                      <span>Hanya untuk {item.allowedRoles.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* 3. Bottom Utility & Action Buttons */}
      <div className="flex flex-col items-center gap-2 pt-1 border-t border-stone-800/80 w-full px-2">
        {/* Customer Display TV Screen (Dual Monitor) */}
        <div className="group relative flex items-center justify-center w-full">
          <Link
            to="/pos-display"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center text-stone-400 hover:text-emerald-400 hover:bg-stone-800/90 transition-all duration-200 group-hover:scale-105"
            aria-label="Buka Layar Pelanggan"
          >
            <span className="material-symbols-outlined text-[20px]">tv</span>
          </Link>

          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[160] pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-[#18181b]" />
            <div className="bg-[#18181b]/95 backdrop-blur-md text-white border border-stone-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.7)] rounded-xl px-3.5 py-2 min-w-[210px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-white">Layar Pelanggan (Dual Display)</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  2nd Screen
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">Buka tampilan kasir di layar TV / monitor customer</p>
            </div>
          </div>
        </div>

        {/* Ke Toko / Online Web */}
        <div className="group relative flex items-center justify-center w-full">
          <Link
            to="/"
            className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800/90 transition-all duration-200 group-hover:scale-105"
            aria-label="Kunjungi Website Toko"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </Link>

          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[160] pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-[#18181b]" />
            <div className="bg-[#18181b]/95 backdrop-blur-md text-white border border-stone-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.7)] rounded-xl px-3.5 py-2 min-w-[190px]">
              <span className="font-bold text-xs text-white block">Website Sembako</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Kunjungi beranda belanja online</p>
            </div>
          </div>
        </div>

        {/* Expand Sidebar Button (Tampilkan Teks Menu Lengkap) */}
        <div className="group relative flex items-center justify-center w-full">
          <button
            type="button"
            onClick={onExpandSidebar}
            className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800/90 transition-all duration-200 group-hover:scale-105 cursor-pointer"
            aria-label="Tampilkan Sidebar Penuh"
          >
            <span className="material-symbols-outlined text-[20px]">dock_to_right</span>
          </button>

          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[160] pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-[#18181b]" />
            <div className="bg-[#18181b]/95 backdrop-blur-md text-white border border-stone-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.7)] rounded-xl px-3.5 py-2 min-w-[180px]">
              <span className="font-bold text-xs text-white block">Buka Menu Penuh</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Perluas sidebar ke tampilan teks lengkap</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="group relative flex items-center justify-center w-full">
          <button
            type="button"
            onClick={onLogout}
            className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center text-red-400 hover:text-white hover:bg-red-950/60 border border-transparent hover:border-red-900/50 transition-all duration-200 group-hover:scale-105 cursor-pointer"
            aria-label="Logout Akun Kasir"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>

          <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-[160] pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-[#18181b]" />
            <div className="bg-[#18181b]/95 backdrop-blur-md text-white border border-stone-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.7)] rounded-xl px-3.5 py-2 min-w-[160px]">
              <span className="font-bold text-xs text-rose-300 block">Keluar / Logout</span>
              <p className="text-[10px] text-stone-400 mt-0.5">Akhiri sesi kasir saat ini</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
