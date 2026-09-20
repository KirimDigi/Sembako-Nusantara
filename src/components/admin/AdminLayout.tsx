import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { checkSupabaseConnection } from '../../lib/supabase';
import { Language, UserRole } from '../../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products, orders, activeRole, setActiveRole } = useAdmin();
  const { currentUser, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; latencyMs?: number }>({
    connected: true,
    latencyMs: 45
  });

  React.useEffect(() => {
    checkSupabaseConnection().then((res) => {
      setSupabaseStatus({ connected: res.connected, latencyMs: res.latencyMs });
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Diproses').length;

  const navItems = [
    {
      label: t('admin_nav_dashboard'),
      path: '/admin',
      icon: 'dashboard',
      badge: null,
      allowedRoles: ['Super Admin (Owner)', 'Finance / Akuntan', 'Admin Gudang']
    },
    {
      label: t('admin_nav_products'),
      path: '/admin/products',
      icon: 'format_list_bulleted',
      badge: `${products.length} SKU`,
      badgeColor: 'bg-blue-600 text-white',
      allowedRoles: ['Super Admin (Owner)', 'Admin Gudang']
    },
    {
      label: t('admin_nav_pos'),
      path: '/admin/pos',
      icon: 'point_of_sale',
      badge: 'Live',
      allowedRoles: ['Super Admin (Owner)', 'Kasir (POS)']
    },
    {
      label: t('admin_nav_inventory'),
      path: '/admin/inventory',
      icon: 'inventory_2',
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-amber-500 text-white',
      allowedRoles: ['Super Admin (Owner)', 'Admin Gudang']
    },
    {
      label: t('admin_nav_purchasing'),
      path: '/admin/purchasing',
      icon: 'shopping_bag',
      badge: null,
      allowedRoles: ['Super Admin (Owner)', 'Admin Gudang', 'Finance / Akuntan']
    },
    {
      label: t('admin_nav_orders'),
      path: '/admin/orders',
      icon: 'local_shipping',
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Baru` : null,
      badgeColor: 'bg-[#c41230] text-white',
      allowedRoles: ['Super Admin (Owner)', 'Kasir (POS)', 'Admin Gudang']
    },
    {
      label: t('admin_nav_accounting'),
      path: '/admin/accounting',
      icon: 'account_balance',
      badge: '消費税 8%/10%',
      badgeColor: 'bg-emerald-600 text-white',
      allowedRoles: ['Super Admin (Owner)', 'Finance / Akuntan']
    },
    {
      label: t('admin_nav_competitor'),
      path: '/admin/competitors',
      icon: 'price_check',
      badge: 'AI Price',
      badgeColor: 'bg-indigo-600 text-white',
      allowedRoles: ['Super Admin (Owner)', 'Finance / Akuntan']
    },
    {
      label: t('admin_nav_crm'),
      path: '/admin/crm',
      icon: 'group',
      badge: null,
      allowedRoles: ['Super Admin (Owner)', 'Kasir (POS)']
    }
  ];

  const rolesList: UserRole[] = [
    'Super Admin (Owner)',
    'Kasir (POS)',
    'Admin Gudang',
    'Finance / Akuntan'
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ID', label: 'ID', flag: '🇮🇩' },
    { code: 'JP', label: '日本語', flag: '🇯🇵' },
    { code: 'EN', label: 'EN', flag: '🇬🇧' }
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-900 font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#1a1a1a] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-200"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>
          <div className="flex items-center gap-2 font-bold text-sm">
            <img src="/LOGO PUTIH SN.jpeg" alt="Logo" className="h-6 w-auto object-contain rounded" />
            <span>Sembako Admin</span>
          </div>
        </div>
        <Link
          to="/"
          className="text-xs bg-[#c41230] text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">storefront</span>
          <span>Ke Toko</span>
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#141414] text-stone-200 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5">
          {/* Logo & Header */}
          <div className="flex items-center justify-between pb-5 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <img
                src="/LOGO MERAH SN.jpeg"
                alt="Logo Sembako Nusantara"
                className="w-9 h-9 rounded-xl object-contain shadow-md shrink-0"
              />
              <div>
                <h1 className="font-bold text-white text-sm tracking-wide">SEMBAKO NUSANTARA</h1>
                <p className="text-[10px] text-stone-400">Integrated ERP & POS Hub</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-stone-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Role Indicator / Switcher */}
          <div className="mt-4 p-3 rounded-xl bg-stone-900 border border-stone-800">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
              Role Aktif (Simulasi):
            </label>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="w-full bg-stone-800 text-xs text-stone-100 rounded-lg px-2.5 py-1.5 border border-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#c41230]"
            >
              {rolesList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isAllowed = item.allowedRoles.includes(activeRole);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#c41230] text-white shadow-md'
                      : isAllowed
                      ? 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                      : 'text-stone-600 hover:bg-stone-900 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor || 'bg-stone-700 text-stone-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Action */}
        <div className="p-5 border-t border-stone-800 space-y-3">
          {/* Sidebar Language Switcher */}
          <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800">
            <span className="text-[10px] font-bold text-stone-400 block mb-1.5 uppercase">Bahasa / 言語 / Language:</span>
            <div className="grid grid-cols-3 gap-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                    language === l.code
                      ? 'bg-[#c41230] text-white shadow-xs'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Authenticated User Status Card */}
          <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 text-[11px] text-stone-400">
            <div className="flex items-center gap-2.5 mb-2">
              <img
                src={currentUser?.avatar || '/avatar-jangsan.png'}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-stone-700 bg-stone-800 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="text-white font-bold truncate text-xs">
                  {currentUser?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ID: {currentUser?.id || 'id0926'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-[10px]">
              <span className="text-stone-400">Gudang:</span>
              <span className="text-stone-200 font-semibold">Tokyo Hub</span>
            </div>
          </div>

          {/* Navigation Store & Logout Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-[11px] font-bold transition-all border border-stone-700"
            >
              <span className="material-symbols-outlined text-xs">storefront</span>
              <span>Ke Toko</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white text-[11px] font-bold transition-all border border-red-900/50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">logout</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h2>
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* Topbar Language Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    language === l.code
                      ? 'bg-white text-[#c41230] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Stats Badges & Supabase Live Monitor */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium" title={`Supabase Project: kfpwhdewopvnowxylcor (${supabaseStatus.latencyMs || 45}ms)`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Live ({supabaseStatus.latencyMs || 45}ms)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 text-stone-700 rounded-lg border border-stone-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span>{t('admin_pos_online_connected')}</span>
              </div>
              {lowStockCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 font-medium">
                  <span className="material-symbols-outlined text-sm text-amber-600">warning</span>
                  <span>{lowStockCount} {t('prod_low_stock')}</span>
                </div>
              )}
            </div>

            <Link
              to="/admin/pos"
              className="px-3.5 py-1.5 bg-[#c41230] text-white rounded-lg text-xs font-bold hover:bg-[#a80f28] flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-sm">point_of_sale</span>
              <span>{t('admin_open_pos')}</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-[#c41230] rounded-lg text-xs font-bold border border-stone-200 hover:border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Keluar / Logout"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
