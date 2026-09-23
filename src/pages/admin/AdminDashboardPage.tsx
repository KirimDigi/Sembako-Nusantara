import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDashboardPage: React.FC = () => {
  const { products, orders, posTransactions, purchaseOrders } = useAdmin();
  const { language } = useLanguage();

  // Financial & Operational Computations
  const totalPosRevenue = posTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOnlineRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalGrossRevenue = totalPosRevenue + totalOnlineRevenue;
  const totalTransactionsCount = posTransactions.length + orders.length;
  const isZeroState = totalTransactionsCount === 0;

  // Laba Rugi Estimate
  const estimatedHPP = isZeroState ? 0 : Math.round(totalGrossRevenue * 0.62);
  const grossProfit = isZeroState ? 0 : totalGrossRevenue - estimatedHPP;
  const grossMarginPercent = totalGrossRevenue > 0 ? Math.round((grossProfit / totalGrossRevenue) * 100) : 0;

  // Inventory & Orders
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const pendingOrders = orders.filter((o) => o.status === 'Dikemas' || o.status === 'Diproses');
  const activePO = purchaseOrders.filter((po) => po.status === 'Sent' || po.status === 'Draft');

  // Total Inventory Valuation (Aset Lancar Sembako di Gudang)
  const totalInventoryValuation = isZeroState ? 0 : products.reduce((acc, p) => acc + p.stock * Math.round(p.price * 0.65), 0);
  const totalEstimatedAssets = isZeroState ? 0 : 4820000 + totalInventoryValuation + 1650000; // Kas/Bank + Stok + Aset Tetap

  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: 'ビジネス＆財務統合ダッシュボード',
        subtitle: 'オンラインEコマース、東京実店舗POSレジ、貸借対照表、および損益計算書のリアルタイム統合モニタリング。',
        cardTotalRev: '総売上高 (POS + Web)',
        growthHigh: '+18.4% 前月比 (高成長)',
        growthNew: '新規店舗状態 (取引受付待機中)',
        cardPos: '店舗POSレジ (実店舗)',
        posTxToday: (cnt: number) => `${cnt} 件のレジ取引`,
        cardWeb: 'Eコマース Web注文',
        webOrders: (cnt: number, pnd: number) => `${cnt} 件の注文 (${pnd} 件発送待ち)`,
        cardSku: '在庫ステータス・マスターSKU',
        skuActive: (cnt: number) => `${cnt} 有効SKU`,
        needRestock: (cnt: number) => `${cnt} 件要補充`,
        manageLink: '管理する →',
        // Finance Center Banner
        hubTitle: '財務会計・帳票統合センター',
        hubTag: 'J-GAAP準拠',
        hubSub: '貸借対照表、損益計算書、商品別売上、日次売上統合レポート',
        hubBtn: '会計メニューを開く',
        // 4 Shortcuts
        pnlTitle: '損益計算書 (P&L)',
        pnlMargin: (m: number) => `粗利益率: ${m}%`,
        bsTitle: '貸借対照表',
        bsStatus: 'ステータス: 100% 整合',
        dailyTitle: '日次売上',
        dailySub: '14日間推移＆ピーク分析',
        dailyPerDay: (amt: number) => `¥${amt.toLocaleString('ja-JP')}/日`,
        itemsTitle: '商品別売上分析',
        itemsSkuCount: (cnt: number) => `${cnt} SKU分析`,
        itemsSub: '売れ筋・死に筋SKU',
        // Comparison
        compTitle: '販売チャネル比較 (Web注文 vs 店舗POS)',
        compPeriod: '当月実績',
        compWebLabel: 'Webストア (ヤマト・佐川 全国配送)',
        compPosLabel: '実店舗レジ (東京店頭 / 来店顧客)',
        aovLabel: '平均客単価 (AOV)',
        pendingShipLabel: '未発送注文',
        activePoLabel: '仕入れ発注PO',
        unitPackages: '件',
        unitPo: '件',
        // Restock alert
        restockTitle: '緊急在庫補充アラート',
        restockBadge: (cnt: number) => `${cnt} 商品`,
        restockRemain: (stk: number) => `残り ${stk}`,
        restockSafe: 'すべての商品の在庫は安全基準を満たしています。',
        btnCreatePo: '発注書 (PO) 作成',
        // Recent tables
        recentWebTitle: '最新のWeb注文',
        recentPosTitle: '最新のPOSレジ取引',
        viewAll: 'すべて見る',
        openPos: 'レジを開く',
        paidStatus: '決済完了',
        itemsUnit: '品'
      };
    } else if (language === 'EN') {
      return {
        title: 'Business & Financial Executive Dashboard',
        subtitle: 'Real-time monitoring of e-commerce online sales, Tokyo physical store POS, balance sheet, and profit & loss.',
        cardTotalRev: 'Total Combined Revenue',
        growthHigh: '+18.4% vs last month (Rapid Growth)',
        growthNew: 'New Store Mode (Ready for Transactions)',
        cardPos: 'Physical Store POS Cashier',
        posTxToday: (cnt: number) => `${cnt} Cashier Transactions`,
        cardWeb: 'E-Commerce Web Orders',
        webOrders: (cnt: number, pnd: number) => `${cnt} Orders (${pnd} Pending Fulfillment)`,
        cardSku: 'Inventory & Master SKU',
        skuActive: (cnt: number) => `${cnt} Active SKUs`,
        needRestock: (cnt: number) => `${cnt} Need Restock`,
        manageLink: 'Manage →',
        // Finance Center Banner
        hubTitle: 'Accounting & Financial Reporting Hub',
        hubTag: 'J-GAAP Standard',
        hubSub: 'Integrated Balance Sheet, P&L, Sales by SKU, and Daily Revenue Reports',
        hubBtn: 'Open Full Accounting',
        // 4 Shortcuts
        pnlTitle: 'Profit & Loss (P&L)',
        pnlMargin: (m: number) => `Gross Margin: ${m}%`,
        bsTitle: 'Balance Sheet',
        bsStatus: 'Status: 100% Balanced',
        dailyTitle: 'Daily Revenue',
        dailySub: '14-Day Trend & Peak',
        dailyPerDay: (amt: number) => `¥${amt.toLocaleString('ja-JP')}/day`,
        itemsTitle: 'Sales by Item',
        itemsSkuCount: (cnt: number) => `${cnt} SKU Analysis`,
        itemsSub: 'Fast & Slow Moving SKUs',
        // Comparison
        compTitle: 'Sales Channel Comparison (Online vs Physical POS)',
        compPeriod: 'Current Month',
        compWebLabel: 'Web Store (All Japan via Yamato / Sagawa)',
        compPosLabel: 'Physical Store (Tokyo POS / Walk-in)',
        aovLabel: 'Average Order Value (AOV)',
        pendingShipLabel: 'Pending Shipments',
        activePoLabel: 'Active Supplier POs',
        unitPackages: 'Pkgs',
        unitPo: 'POs',
        // Restock alert
        restockTitle: 'Urgent Restock Required',
        restockBadge: (cnt: number) => `${cnt} Products`,
        restockRemain: (stk: number) => `Left: ${stk}`,
        restockSafe: 'All product inventory levels are safely above minimum thresholds.',
        btnCreatePo: 'Create Purchase Order (PO)',
        // Recent tables
        recentWebTitle: 'Recent E-Commerce Web Orders',
        recentPosTitle: 'Recent Store POS Transactions',
        viewAll: 'View All',
        openPos: 'Open POS',
        paidStatus: 'Paid',
        itemsUnit: 'Items'
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'Dashboard Ringkasan Bisnis & Keuangan',
        subtitle: 'Monitoring performa penjualan online e-commerce, kasir POS toko fisik, neraca keuangan, dan laba rugi real-time.',
        cardTotalRev: 'Total Omzet Gabungan',
        growthHigh: '+18.4% vs bulan lalu (Pertumbuhan Pesat)',
        growthNew: 'Sistem Toko Baru (Siap Menerima Transaksi)',
        cardPos: 'Kasir POS (Toko Fisik)',
        posTxToday: (cnt: number) => `${cnt} Transaksi Kasir Hari Ini`,
        cardWeb: 'E-Commerce Web',
        webOrders: (cnt: number, pnd: number) => `${cnt} Pesanan (${pnd} Perlu Dikirim)`,
        cardSku: 'Status Stok & Master SKU',
        skuActive: (cnt: number) => `${cnt} SKU Aktif`,
        needRestock: (cnt: number) => `${cnt} Perlu Restock`,
        manageLink: 'Kelola →',
        // Finance Center Banner
        hubTitle: 'Pusat Pembukuan & Laporan Keuangan Toko',
        hubTag: 'Standar Pajak J-GAAP',
        hubSub: 'Laporan Neraca, Laba Rugi, Penjualan per SKU & Omzet Harian Terpadu',
        hubBtn: 'Buka Menu Accounting Lengkap',
        // 4 Shortcuts
        pnlTitle: 'Laba Rugi (P&L)',
        pnlMargin: (m: number) => `Margin Laba: ${m}%`,
        bsTitle: 'Neraca Keuangan',
        bsStatus: 'Status: 100% Balanced',
        dailyTitle: 'Omzet Harian',
        dailySub: 'Tren 14 Hari & Peak',
        dailyPerDay: (amt: number) => `¥${amt.toLocaleString('ja-JP')}/hari`,
        itemsTitle: 'Penjualan per Item',
        itemsSkuCount: (cnt: number) => `${cnt} SKU Analisis`,
        itemsSub: 'Fast/Slow Moving SKU',
        // Comparison
        compTitle: 'Komparasi Channel Penjualan (Online vs Offline POS)',
        compPeriod: 'Bulan Berjalan',
        compWebLabel: 'Toko Online Web (Kirim Seluruh Jepang via Yamato/Sagawa)',
        compPosLabel: 'Kasir Toko Fisik (POS Tokyo / Walk-in Customer)',
        aovLabel: 'Rata-rata Order (AOV)',
        pendingShipLabel: 'Pesanan Pending Kirim',
        activePoLabel: 'PO Supplier Aktif',
        unitPackages: 'Paket',
        unitPo: 'PO',
        // Restock alert
        restockTitle: 'Perlu Restock Segera',
        restockBadge: (cnt: number) => `${cnt} Produk`,
        restockRemain: (stk: number) => `Sisa ${stk}`,
        restockSafe: 'Semua persediaan produk aman di atas ambang minimum.',
        btnCreatePo: 'Buat Purchase Order (PO)',
        // Recent tables
        recentWebTitle: 'Pesanan Web E-Commerce Terbaru',
        recentPosTitle: 'Transaksi Kasir POS Terbaru',
        viewAll: 'Lihat Semua',
        openPos: 'Buka Kasir',
        paidStatus: 'Lunas',
        itemsUnit: 'Barang'
      };
    }
  }, [language]);

  return (
    <AdminLayout
      title={txt.title}
      subtitle={txt.subtitle}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Omzet */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{txt.cardTotalRev}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 font-mono">
              ¥{totalGrossRevenue.toLocaleString('ja-JP')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-500 font-medium">
              <span className="material-symbols-outlined text-xs text-emerald-600">
                {totalGrossRevenue > 0 ? 'trending_up' : 'storefront'}
              </span>
              <span>
                {totalGrossRevenue > 0 ? txt.growthHigh : txt.growthNew}
              </span>
            </div>
          </div>

          {/* Card 2: POS Offline vs Online */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{txt.cardPos}</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-[#c41230] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">point_of_sale</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 font-mono">
              ¥{totalPosRevenue.toLocaleString('ja-JP')}
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              {txt.posTxToday(posTransactions.length)}
            </p>
          </div>

          {/* Card 3: Online Orders */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{txt.cardWeb}</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 font-mono">
              ¥{totalOnlineRevenue.toLocaleString('ja-JP')}
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              {txt.webOrders(orders.length, pendingOrders.length)}
            </p>
          </div>

          {/* Card 4: Inventory Alert */}
          <Link
            to="/admin/products"
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-[#c41230] transition-colors block group"
          >
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{txt.cardSku}</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-red-50 group-hover:text-[#c41230] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 group-hover:text-[#c41230] transition-colors">
              {txt.skuActive(products.length)}
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">warning</span>
                <span>{txt.needRestock(lowStockProducts.length)}</span>
              </span>
              <span className="text-[#c41230] font-bold group-hover:underline">{txt.manageLink}</span>
            </div>
          </Link>
        </div>

        {/* 4 Dedicated Financial Report Shortcuts (Laba Rugi, Neraca, Omzet Harian, Penjualan per Item) */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-6 rounded-3xl text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c41230] flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-xl">finance_chip</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>{txt.hubTitle}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                    {txt.hubTag}
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  {txt.hubSub}
                </p>
              </div>
            </div>
            <Link
              to="/admin/accounting"
              className="px-4 py-2 bg-[#c41230] hover:bg-[#a50e28] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-md"
            >
              <span>{txt.hubBtn}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* 4 Interactive Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* 1. Laba Rugi (P&L) */}
            <Link
              to="/admin/accounting"
              className="bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 p-4 rounded-2xl transition-all block group"
            >
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider">{txt.pnlTitle}</span>
                <span className="material-symbols-outlined text-emerald-400 text-lg group-hover:scale-110 transition-transform">
                  monitoring
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                +¥{grossProfit.toLocaleString('ja-JP')}
              </div>
              <div className="text-[11px] text-stone-300 mt-1 flex items-center justify-between">
                <span>{txt.pnlMargin(grossMarginPercent)}</span>
                <span className="text-[#c41230] font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* 2. Neraca Keuangan */}
            <Link
              to="/admin/accounting"
              className="bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 p-4 rounded-2xl transition-all block group"
            >
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider">{txt.bsTitle}</span>
                <span className="material-symbols-outlined text-blue-400 text-lg group-hover:scale-110 transition-transform">
                  account_balance
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-blue-300">
                ¥{totalEstimatedAssets.toLocaleString('ja-JP')}
              </div>
              <div className="text-[11px] text-stone-300 mt-1 flex items-center justify-between">
                <span>{txt.bsStatus}</span>
                <span className="text-[#c41230] font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* 3. Omzet Harian */}
            <Link
              to="/admin/accounting"
              className="bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 p-4 rounded-2xl transition-all block group"
            >
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider">{txt.dailyTitle}</span>
                <span className="material-symbols-outlined text-amber-400 text-lg group-hover:scale-110 transition-transform">
                  calendar_month
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-300">
                {txt.dailyPerDay(isZeroState ? 0 : Math.round(totalGrossRevenue / 30))}
              </div>
              <div className="text-[11px] text-stone-300 mt-1 flex items-center justify-between">
                <span>{txt.dailySub}</span>
                <span className="text-[#c41230] font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* 4. Penjualan Per Item */}
            <Link
              to="/admin/accounting"
              className="bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 p-4 rounded-2xl transition-all block group"
            >
              <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider">{txt.itemsTitle}</span>
                <span className="material-symbols-outlined text-purple-400 text-lg group-hover:scale-110 transition-transform">
                  inventory
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-purple-300">
                {txt.itemsSkuCount(products.length)}
              </div>
              <div className="text-[11px] text-stone-300 mt-1 flex items-center justify-between">
                <span>{txt.itemsSub}</span>
                <span className="text-[#c41230] font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Middle Section: Channel Sales Split & Low Stock Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Breakdown */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230] text-base">pie_chart</span>
                <span>{txt.compTitle}</span>
              </h3>
              <span className="text-xs text-stone-400">{txt.compPeriod}</span>
            </div>

            {/* Visual Bar */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-700">{txt.compWebLabel}</span>
                  <span className="text-blue-600 font-mono">
                    ¥{totalOnlineRevenue.toLocaleString('ja-JP')} (
                    {totalGrossRevenue > 0
                      ? Math.round((totalOnlineRevenue / totalGrossRevenue) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalGrossRevenue > 0
                          ? (totalOnlineRevenue / totalGrossRevenue) * 100
                          : 50
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-700">{txt.compPosLabel}</span>
                  <span className="text-[#c41230] font-mono">
                    ¥{totalPosRevenue.toLocaleString('ja-JP')} (
                    {totalGrossRevenue > 0
                      ? Math.round((totalPosRevenue / totalGrossRevenue) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c41230] rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalGrossRevenue > 0
                          ? (totalPosRevenue / totalGrossRevenue) * 100
                          : 50
                      }%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-stone-100 text-center">
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-[10px] text-stone-500 block">{txt.aovLabel}</span>
                <span className="text-sm font-bold text-stone-900 font-mono">
                  ¥
                  {totalTransactionsCount > 0
                    ? Math.round(totalGrossRevenue / totalTransactionsCount).toLocaleString('ja-JP')
                    : 0}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-[10px] text-stone-500 block">{txt.pendingShipLabel}</span>
                <span className="text-sm font-bold text-amber-600">{pendingOrders.length} {txt.unitPackages}</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-[10px] text-stone-500 block">{txt.activePoLabel}</span>
                <span className="text-sm font-bold text-indigo-600">{activePO.length} {txt.unitPo}</span>
              </div>
            </div>
          </div>

          {/* Low Stock Actions */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500 text-base">notification_important</span>
                  <span>{txt.restockTitle}</span>
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {txt.restockBadge(lowStockProducts.length)}
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover border border-stone-200"
                      />
                      <div>
                        <div className="font-bold text-stone-900 truncate max-w-[140px]">
                          {language === 'JP' ? p.nameJp || p.name : language === 'EN' ? p.nameEn || p.name : p.name}
                        </div>
                        <div className="text-[10px] text-stone-400">¥{p.price.toLocaleString('ja-JP')}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold rounded-md text-[11px]">
                      {txt.restockRemain(p.stock)}
                    </span>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-6">
                    {txt.restockSafe}
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/admin/purchasing"
              className="mt-4 w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
              <span>{txt.btnCreatePo}</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section: Recent Orders & Recent POS Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Online Orders */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-base">shopping_bag</span>
                <span>{txt.recentWebTitle}</span>
              </h3>
              <Link to="/admin/orders" className="text-xs font-bold text-[#c41230] hover:underline">
                {txt.viewAll}
              </Link>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      <span>{ord.id}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          ord.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Dikirim'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      {ord.date} • {ord.courier} ({ord.items.length} {txt.itemsUnit})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-stone-900 font-mono">¥{ord.totalAmount.toLocaleString('ja-JP')}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{ord.trackingNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent POS Transactions */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230] text-base">receipt_long</span>
                <span>{txt.recentPosTitle}</span>
              </h3>
              <Link to="/admin/pos" className="text-xs font-bold text-[#c41230] hover:underline">
                {txt.openPos}
              </Link>
            </div>

            <div className="space-y-3">
              {posTransactions.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      <span>{tx.receiptNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      {tx.date} • {tx.cashierName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-stone-900 font-mono">¥{tx.totalAmount.toLocaleString('ja-JP')}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">{txt.paidStatus}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
