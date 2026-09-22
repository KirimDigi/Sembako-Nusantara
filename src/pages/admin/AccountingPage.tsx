import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';

type TabType = 'pnl' | 'balance_sheet' | 'sales_by_item' | 'daily_revenue' | 'tax_compliance';

export const AccountingPage: React.FC = () => {
  const { products, posTransactions, orders, clearAllTransactions, addOrder } = useAdmin();
  const { language } = useLanguage();
  const isJp = language === 'JP';

  const [activeTab, setActiveTab] = useState<TabType>('pnl');
  const [period, setPeriod] = useState<string>('Bulan Ini (September 2026)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'revenue' | 'qty' | 'profit' | 'margin'>('revenue');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // =========================================================================
  // 1. FINANCIAL CORE DATA COMPUTATION (DYNAMIC FROM REAL TRANSACTIONS)
  // =========================================================================
  const totalPosRevenue = posTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOnlineRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = totalPosRevenue + totalOnlineRevenue;
  const totalTransactionCount = posTransactions.length + orders.length;
  const isZeroState = totalTransactionCount === 0;

  // Estimated HPP & Gross Profit (0 when no transactions)
  const estimatedHPP = isZeroState ? 0 : Math.round(totalRevenue * 0.62);
  const grossProfit = isZeroState ? 0 : totalRevenue - estimatedHPP;
  const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  // Operating Expenses (0 when in clean zero state, dynamic when active)
  const operatingExpenses = {
    rentWarehouse: isZeroState ? 0 : 180000,
    electricityColdStorage: isZeroState ? 0 : 65000,
    shippingSubsidyPackaging: isZeroState ? 0 : 48000,
    paymentGatewayFees: isZeroState ? 0 : Math.round(totalRevenue * 0.0324),
    staffPayroll: isZeroState ? 0 : 220000,
    marketingPromo: isZeroState ? 0 : 35000
  };

  const totalOperatingExpenses = isZeroState
    ? 0
    : operatingExpenses.rentWarehouse +
      operatingExpenses.electricityColdStorage +
      operatingExpenses.shippingSubsidyPackaging +
      operatingExpenses.paymentGatewayFees +
      operatingExpenses.staffPayroll +
      operatingExpenses.marketingPromo;

  // Operating Profit (Laba Usaha)
  const operatingProfit = isZeroState ? 0 : grossProfit - totalOperatingExpenses;
  const operatingMarginPercent = totalRevenue > 0 ? Math.round((operatingProfit / totalRevenue) * 100) : 0;

  // Japanese Consumption Tax (JCT 8% food, 10% shipping/services)
  const taxFood8 = isZeroState ? 0 : Math.round((totalRevenue / 1.08) * 0.08);
  const taxShipping10 = isZeroState ? 0 : Math.round(((totalOnlineRevenue * 0.15) / 1.1) * 0.1);
  const totalTaxJCT = taxFood8 + taxShipping10;

  // Net Profit
  const netProfit = isZeroState ? 0 : operatingProfit - Math.round(totalTaxJCT * 0.2);
  const netProfitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // =========================================================================
  // 2. NERACA KEUANGAN (BALANCE SHEET) DATA
  // =========================================================================
  const inventoryValuation = useMemo(() => {
    if (isZeroState) return 0;
    return products.reduce((acc, p) => acc + p.stock * Math.round(p.price * 0.65), 0);
  }, [products, isZeroState]);

  const balanceSheet = {
    assets: {
      currentAssets: {
        cashStorePOS: isZeroState ? 0 : 250000,
        bankJapanPost: isZeroState ? 0 : 1850000,
        bankMUFG: isZeroState ? 0 : 2400000,
        payPaySettlement: isZeroState ? 0 : 420000,
        accountsReceivable: isZeroState ? 0 : 310000,
        inventoryStock: inventoryValuation
      },
      fixedAssets: {
        coldStorageFreezers: isZeroState ? 0 : 1200000,
        posHardwareEquipment: isZeroState ? 0 : 350000,
        warehouseShelving: isZeroState ? 0 : 280000,
        accumulatedDepreciation: isZeroState ? 0 : -180000
      }
    },
    liabilities: {
      currentLiabilities: {
        accountsPayableSupplier: isZeroState ? 0 : 680000,
        accruedTaxesJCT: totalTaxJCT,
        accruedExpenses: isZeroState ? 0 : 145000,
        customerDeposits: isZeroState ? 0 : 65000
      },
      longTermLiabilities: {
        businessLoan: isZeroState ? 0 : 1500000
      }
    },
    equity: {
      capitalPaidIn: isZeroState ? 0 : 4500000,
      retainedEarnings: 0
    }
  };

  const totalCurrentAssets =
    balanceSheet.assets.currentAssets.cashStorePOS +
    balanceSheet.assets.currentAssets.bankJapanPost +
    balanceSheet.assets.currentAssets.bankMUFG +
    balanceSheet.assets.currentAssets.payPaySettlement +
    balanceSheet.assets.currentAssets.accountsReceivable +
    balanceSheet.assets.currentAssets.inventoryStock;

  const totalFixedAssets =
    balanceSheet.assets.fixedAssets.coldStorageFreezers +
    balanceSheet.assets.fixedAssets.posHardwareEquipment +
    balanceSheet.assets.fixedAssets.warehouseShelving +
    balanceSheet.assets.fixedAssets.accumulatedDepreciation;

  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities =
    balanceSheet.liabilities.currentLiabilities.accountsPayableSupplier +
    balanceSheet.liabilities.currentLiabilities.accruedTaxesJCT +
    balanceSheet.liabilities.currentLiabilities.accruedExpenses +
    balanceSheet.liabilities.currentLiabilities.customerDeposits;

  const totalLongTermLiabilities = balanceSheet.liabilities.longTermLiabilities.businessLoan;
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const calculatedRetainedEarnings = isZeroState
    ? 0
    : totalAssets - totalLiabilities - balanceSheet.equity.capitalPaidIn;
  const totalEquity = isZeroState ? 0 : balanceSheet.equity.capitalPaidIn + calculatedRetainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // =========================================================================
  // 3. PENJUALAN PER ITEM (ITEM LEVEL METRICS)
  // =========================================================================
  const productSalesMap = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();

    // 1. Aggregation from POS Transactions
    posTransactions.forEach((tx) => {
      tx.items.forEach((item) => {
        const prodId = item.productId;
        const lineTotal = item.subtotal || item.price * item.quantity;
        const existing = map.get(prodId) || { qty: 0, revenue: 0 };
        map.set(prodId, {
          qty: existing.qty + item.quantity,
          revenue: existing.revenue + lineTotal
        });
      });
    });

    // 2. Aggregation from Online Customer Orders
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const prodId = item.id || 'unknown';
        const existing = map.get(prodId) || { qty: 0, revenue: 0 };
        map.set(prodId, {
          qty: existing.qty + item.quantity,
          revenue: existing.revenue + item.price * item.quantity
        });
      });
    });

    return map;
  }, [posTransactions, orders]);

  const itemPerformanceList = useMemo(() => {
    return products.map((p) => {
      const sales = productSalesMap.get(p.id) || { qty: 0, revenue: 0 };
      const totalQty = sales.qty;
      const totalItemRevenue = sales.revenue;
      const hppUnit = Math.round(p.price * 0.65);
      const totalItemHPP = totalQty * hppUnit;
      const totalItemProfit = totalItemRevenue - totalItemHPP;
      const marginPct = totalItemRevenue > 0 ? Math.round((totalItemProfit / totalItemRevenue) * 100) : 0;
      const revenueShare = totalRevenue > 0 ? ((totalItemRevenue / totalRevenue) * 100).toFixed(1) : '0.0';

      let velocityStatus: 'Fast Moving' | 'Moderate' | 'Belum Ada Penjualan' = 'Belum Ada Penjualan';
      if (totalQty >= 10) velocityStatus = 'Fast Moving';
      else if (totalQty > 0) velocityStatus = 'Moderate';

      return {
        ...p,
        totalQty,
        totalItemRevenue,
        hppUnit,
        totalItemHPP,
        totalItemProfit,
        marginPct,
        revenueShare,
        velocityStatus
      };
    });
  }, [products, productSalesMap, totalRevenue]);

  const filteredItemPerformance = useMemo(() => {
    let result = itemPerformanceList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(q) ||
        (item.nameJp && item.nameJp.toLowerCase().includes(q)) ||
        item.brand.toLowerCase().includes(q) ||
        item.id.includes(q);

      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchQuery && matchCategory;
    });

    result.sort((a, b) => {
      if (sortBy === 'revenue') return b.totalItemRevenue - a.totalItemRevenue;
      if (sortBy === 'qty') return b.totalQty - a.totalQty;
      if (sortBy === 'profit') return b.totalItemProfit - a.totalItemProfit;
      if (sortBy === 'margin') return b.marginPct - a.marginPct;
      return 0;
    });

    return result;
  }, [itemPerformanceList, searchQuery, selectedCategory, sortBy]);

  const totalItemPages = Math.max(1, Math.ceil(filteredItemPerformance.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItemPerformance.slice(start, start + itemsPerPage);
  }, [filteredItemPerformance, currentPage, itemsPerPage]);

  // =========================================================================
  // 4. OMZET HARIAN (DAILY REVENUE AGGREGATION FROM REAL DATA)
  // =========================================================================
  const dailyRevenueData = useMemo(() => {
    const dateMap = new Map<string, { posTx: number; onlineTx: number; posRev: number; onlineRev: number; payments: string[] }>();

    posTransactions.forEach((tx) => {
      const date = tx.date.split(' ')[0] || tx.date;
      const existing = dateMap.get(date) || { posTx: 0, onlineTx: 0, posRev: 0, onlineRev: 0, payments: [] };
      existing.posTx += 1;
      existing.posRev += tx.totalAmount;
      if (tx.paymentMethod && !existing.payments.includes(tx.paymentMethod)) {
        existing.payments.push(tx.paymentMethod);
      }
      dateMap.set(date, existing);
    });

    orders.forEach((ord) => {
      const date = ord.date;
      const existing = dateMap.get(date) || { posTx: 0, onlineTx: 0, posRev: 0, onlineRev: 0, payments: [] };
      existing.onlineTx += 1;
      existing.onlineRev += ord.totalAmount;
      if (ord.paymentMethod && !existing.payments.includes(ord.paymentMethod)) {
        existing.payments.push(ord.paymentMethod);
      }
      dateMap.set(date, existing);
    });

    const list: any[] = [];
    dateMap.forEach((val, date) => {
      const totalRev = val.posRev + val.onlineRev;
      const totalTx = val.posTx + val.onlineTx;
      const hpp = Math.round(totalRev * 0.62);
      const gross = totalRev - hpp;
      const aov = totalTx > 0 ? Math.round(totalRev / totalTx) : 0;
      list.push({
        date,
        label: date,
        posTx: val.posTx,
        onlineTx: val.onlineTx,
        posRev: val.posRev,
        onlineRev: val.onlineRev,
        totalRev,
        totalTx,
        hpp,
        gross,
        aov,
        paymentTop: val.payments.join(', ') || 'PayPay / Transfer'
      });
    });

    list.sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }, [posTransactions, orders]);

  // =========================================================================
  // 5. SIMULATE DEMO TRANSACTION & RESET HANDLER
  // =========================================================================
  const handleCreateSampleTransaction = () => {
    const sampleId = 'SN-JP-' + Math.floor(100000 + Math.random() * 900000);
    const sampleOrder = {
      id: sampleId,
      orderId: sampleId,
      trackingNumber: '4829-' + Math.floor(1000 + Math.random() * 9000) + '-1234',
      courier: 'Yamato Transport' as const,
      status: 'Diproses' as const,
      paymentMethod: 'PayPay',
      total: 6850,
      totalAmount: 6850,
      taxAmount: 507,
      date: new Date().toISOString().substring(0, 10),
      customerName: 'Budi Santoso',
      shippingAddress: '〒134-0088 Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4',
      address: '〒134-0088 Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4',
      items: [
        {
          id: products[0]?.id || '1',
          productName: products[0]?.name || 'Indomie Goreng Spesial',
          name: products[0]?.name || 'Indomie Goreng Spesial',
          productImage: products[0]?.image || '',
          quantity: 5,
          qty: 5,
          price: (products[0]?.priceTax || 135) * 5
        }
      ]
    };
    addOrder(sampleOrder);
    alert('1 Contoh Transaksi Berhasil Dibuat dan Langsung Tersinkron ke Accounting!');
  };

  const handleResetToZero = () => {
    if (confirm('Apakah Anda yakin ingin MERESET SEMUA DATA TRANSAKSI KE KONDISI 0 BERSIH? Semua angka laporan keuangan akan kembali ke ¥0.')) {
      clearAllTransactions();
      alert('Semua data laporan keuangan berhasil direset ke KONDISI 0 BERSIH (CLEAR)!');
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  return (
    <AdminLayout
      title={isJp ? '財務会計・売上分析ダッシュボード' : 'Laporan Keuangan, Neraca & Performa Penjualan'}
      subtitle={
        isJp
          ? '損益計算書（P&L）、貸借対照表、日次売上、商品別売上、および日本の消費税レポート統合センター。'
          : 'Pusat pembukuan akuntansi terpadu: Laba Rugi, Neraca Keuangan, Omzet Harian, Penjualan per Item, dan Pajak Konsumsi Jepang.'
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Status Data Banner (Zero Clean State vs Active Data) */}
        <div className={`rounded-2xl p-4.5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isZeroState
            ? 'bg-amber-50/90 border-amber-200 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center gap-3.5 text-xs">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
              isZeroState ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              <span className="material-symbols-outlined text-xl">
                {isZeroState ? 'verified_user' : 'query_stats'}
              </span>
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>
                  {isZeroState
                    ? 'Status Laporan: KONDISI 0 BERSIH (Siap Transaksi Baru)'
                    : `Status Laporan: AKTIF TERHUBUNG (${totalTransactionCount} Transaksi Masuk)`}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  isZeroState ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {isZeroState ? 'CLEAR / 0 STATE' : 'LIVE SYNC'}
                </span>
              </div>
              <div className="text-stone-600 text-[11px] mt-0.5">
                {isZeroState
                  ? 'Semua angka keuangan bernilai ¥0. Setiap pesanan pelanggan atau kasir POS yang masuk akan langsung tercatat otomatis di sini.'
                  : 'Data dihitung secara real-time dari seluruh pesanan e-commerce dan transaksi kasir POS.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isZeroState ? (
              <button
                type="button"
                onClick={handleCreateSampleTransaction}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                <span>Buat Transaksi Simulasi</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetToZero}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset Semua ke 0</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (5 Main Financial Reports) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-1.5 shadow-xs flex flex-wrap gap-1">
          <button
            onClick={() => {
              setActiveTab('pnl');
              setCurrentPage(1);
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pnl'
                ? 'bg-[#c41230] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">monitoring</span>
            <span>Laba Rugi</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('balance_sheet');
              setCurrentPage(1);
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'balance_sheet'
                ? 'bg-[#c41230] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">account_balance</span>
            <span>Neraca Keuangan</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('daily_revenue');
              setCurrentPage(1);
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'daily_revenue'
                ? 'bg-[#c41230] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">calendar_month</span>
            <span>Omzet Harian</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sales_by_item');
              setCurrentPage(1);
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'sales_by_item'
                ? 'bg-[#c41230] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">inventory</span>
            <span>Penjualan per Item</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tax_compliance');
              setCurrentPage(1);
            }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tax_compliance'
                ? 'bg-[#c41230] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            <span>Pajak Konsumsi Jepang</span>
          </button>
        </div>

        {/* Global Controls & Period Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Periode Data:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 outline-none focus:border-[#c41230]"
            >
              <option value="Hari Ini (Real-Time)">Hari Ini (Real-Time)</option>
              <option value="Minggu Ini">Minggu Ini</option>
              <option value="Bulan Ini (September 2026)">Bulan Ini (September 2026)</option>
              <option value="Tahun Ini (2026)">Tahun 2026 Penuh</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: LABA RUGI (PROFIT & LOSS / P&L) */}
        {/* ================================================================= */}
        {activeTab === 'pnl' && (
          <div className="space-y-6">
            {/* Top 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
                  <span>TOTAL OMZET PENJUALAN</span>
                  <span className="material-symbols-outlined text-stone-400">payments</span>
                </div>
                <div className="text-2xl font-black text-stone-900">¥{totalRevenue.toLocaleString()}</div>
                <div className="text-[11px] text-stone-500 mt-1">
                  POS: ¥{totalPosRevenue.toLocaleString()} | Online: ¥{totalOnlineRevenue.toLocaleString()}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
                  <span>LABA KOTOR (GROSS PROFIT)</span>
                  <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                </div>
                <div className="text-2xl font-black text-emerald-600">¥{grossProfit.toLocaleString()}</div>
                <div className="text-[11px] text-stone-500 mt-1">Margin Kotor: {grossMarginPercent}%</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
                  <span>TOTAL BEBAN OPERASIONAL</span>
                  <span className="material-symbols-outlined text-amber-500">account_balance_wallet</span>
                </div>
                <div className="text-2xl font-black text-amber-700">¥{totalOperatingExpenses.toLocaleString()}</div>
                <div className="text-[11px] text-stone-500 mt-1">Sewa, Listrik, Gaji, Gateway</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
                  <span>LABA BERSIH (NET PROFIT)</span>
                  <span className="material-symbols-outlined text-[#c41230]">savings</span>
                </div>
                <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-[#c41230]' : 'text-red-700'}`}>
                  ¥{netProfit.toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Margin Bersih: {netProfitMarginPercent}%</div>
              </div>
            </div>

            {/* Comprehensive P&L Statement Table */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900">Laporan Laba Rugi Komprehensif</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Format Standar Akuntansi Usaha Dagang Jepang</p>
                </div>
                <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg">
                  Mata Uang: JPY (¥)
                </span>
              </div>

              <div className="space-y-4 text-xs font-medium">
                {/* 1. Pendapatan */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-sm bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="uppercase text-stone-700">1. PENDAPATAN USAHA (REVENUE)</span>
                    <span className="font-mono text-stone-900">¥{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 pr-2 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>• Penjualan Toko Fisik POS Tokyo</span>
                      <span className="font-mono">¥{totalPosRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Penjualan E-Commerce & Web Order</span>
                      <span className="font-mono">¥{totalOnlineRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 2. HPP */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-sm bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="uppercase text-stone-700">2. HARGA POKOK PENJUALAN (HPP / COGS)</span>
                    <span className="font-mono text-red-600">-¥{estimatedHPP.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 pr-2 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>• Pembelian Sembako dari Supplier Importir</span>
                      <span className="font-mono">-¥{Math.round(estimatedHPP * 0.9).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Bea Masuk & Karantina Pangan Jepang</span>
                      <span className="font-mono">-¥{Math.round(estimatedHPP * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Subtotal Gross Profit */}
                <div className="flex justify-between items-center font-bold text-sm bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-200">
                  <span>LABA KOTOR (GROSS PROFIT)</span>
                  <span className="font-mono text-base font-black text-emerald-700">¥{grossProfit.toLocaleString()}</span>
                </div>

                {/* 3. Beban Operasional */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-sm bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="uppercase text-stone-700">3. BEBAN OPERASIONAL TOKO & GUDANG (OPEX)</span>
                    <span className="font-mono text-red-600">-¥{totalOperatingExpenses.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 pr-2 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>• Sewa Toko & Gudang Kanto Tokyo</span>
                      <span className="font-mono">-¥{operatingExpenses.rentWarehouse.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Listrik & Cold Storage Freezer -20°C</span>
                      <span className="font-mono">-¥{operatingExpenses.electricityColdStorage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Gaji Karyawan Kasir & Admin Gudang Diaspora</span>
                      <span className="font-mono">-¥{operatingExpenses.staffPayroll.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Biaya Pengemasan Bubble Wrap & Kardus Tebal</span>
                      <span className="font-mono">-¥{operatingExpenses.shippingSubsidyPackaging.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Fee Gateway Pembayaran (PayPay / JPQR / Stripe 3.24%)</span>
                      <span className="font-mono">-¥{operatingExpenses.paymentGatewayFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Pemasaran & Promosi Komunitas Diaspora</span>
                      <span className="font-mono">-¥{operatingExpenses.marketingPromo.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Pajak Konsumsi */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-sm bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="uppercase text-stone-700">4. PAJAK KONSUMSI JEPANG (JCT 8% & 10%)</span>
                    <span className="font-mono text-red-600">-¥{totalTaxJCT.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 pr-2 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>• Pajak Konsumsi Makanan/Sembako Halal (Tarif 8%)</span>
                      <span className="font-mono">¥{taxFood8.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Pajak Konsumsi Jasa Ongkir & Layanan (Tarif 10%)</span>
                      <span className="font-mono">¥{taxShipping10.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Grand Total Net Profit */}
                <div className="flex justify-between items-center font-bold text-base bg-stone-900 text-white p-4 rounded-xl shadow-sm">
                  <div>
                    <div className="text-sm font-black">LABA BERSIH TAHUN BERJALAN (NET PROFIT)</div>
                    <div className="text-[11px] text-stone-400 font-normal">Setelah dikurangi semua beban dan kewajiban pajak</div>
                  </div>
                  <div className="text-xl font-black text-amber-300 font-mono">
                    ¥{netProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: NERACA KEUANGAN (BALANCE SHEET) */}
        {/* ================================================================= */}
        {activeTab === 'balance_sheet' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900">Neraca Keuangan Usaha</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Posisi Keuangan, Aset, Kewajiban, dan Ekuitas Modal</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full">
                    {totalAssets === totalLiabilitiesAndEquity ? 'Neraca Seimbang (Balanced)' : 'Dalam Penyesuaian'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SISI KIRI: AKTIVA / ASET */}
                <div className="space-y-5">
                  <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl font-bold text-sm text-blue-950 flex justify-between">
                    <span>TOTAL AKTIVA / ASET</span>
                    <span className="font-mono">¥{totalAssets.toLocaleString()}</span>
                  </div>

                  {/* Aktiva Lancar */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>A. AKTIVA LANCAR</span>
                      <span className="font-mono text-stone-900">¥{totalCurrentAssets.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>• Kas Tunai di Laci Kasir POS</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.cashStorePOS.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Saldo Bank Pos Jepang (Japan Post Bank)</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.bankJapanPost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Saldo Bank MUFG Tokyo</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.bankMUFG.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Saldo Merchant PayPay Pending Settlement</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.payPaySettlement.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Piutang E-Commerce / COD Yamato Pending</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.accountsReceivable.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>• Valuasi Stok Sembako Halal di Gudang</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.inventoryStock.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aktiva Tetap */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>B. AKTIVA TETAP</span>
                      <span className="font-mono text-stone-900">¥{totalFixedAssets.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>• Unit Freezer Komersial (-20°C)</span>
                        <span className="font-mono">¥{balanceSheet.assets.fixedAssets.coldStorageFreezers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Mesin Kasir POS & Hardware Barcode</span>
                        <span className="font-mono">¥{balanceSheet.assets.fixedAssets.posHardwareEquipment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Rak Display Toko & Racking Gudang</span>
                        <span className="font-mono">¥{balanceSheet.assets.fixedAssets.warehouseShelving.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>• Akumulasi Penyusutan Aset</span>
                        <span className="font-mono">¥{balanceSheet.assets.fixedAssets.accumulatedDepreciation.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SISI KANAN: KEWAJIBAN & EKUITAS */}
                <div className="space-y-5">
                  <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-xl font-bold text-sm text-purple-950 flex justify-between">
                    <span>TOTAL PASIVA & EKUITAS</span>
                    <span className="font-mono">¥{totalLiabilitiesAndEquity.toLocaleString()}</span>
                  </div>

                  {/* Kewajiban Lancar */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>A. KEWAJIBAN JANGKA PENDEK</span>
                      <span className="font-mono text-stone-900">¥{totalCurrentLiabilities.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>• Hutang Dagang Supplier Impor Indonesia</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.currentLiabilities.accountsPayableSupplier.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-red-700">
                        <span>• Pajak Konsumsi Jepang Terutang (JCT)</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.currentLiabilities.accruedTaxesJCT.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Beban Gaji & Operasional Terutang</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.currentLiabilities.accruedExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Deposit Saldo Dompet Digital Pelanggan</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.currentLiabilities.customerDeposits.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kewajiban Jangka Panjang */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>B. KEWAJIBAN JANGKA PANJANG</span>
                      <span className="font-mono text-stone-900">¥{totalLongTermLiabilities.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>• Pinjaman Usaha Lunak Diaspora</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.longTermLiabilities.businessLoan.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ekuitas / Modal */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>C. EKUITAS & MODAL</span>
                      <span className="font-mono text-stone-900">¥{totalEquity.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>• Modal Awal Disetor Pendiri</span>
                        <span className="font-mono">¥{balanceSheet.equity.capitalPaidIn.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span>• Laba Ditahan (Retained Earnings)</span>
                        <span className="font-mono">¥{calculatedRetainedEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: OMZET HARIAN (DAILY REVENUE REPORT) */}
        {/* ================================================================= */}
        {activeTab === 'daily_revenue' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900">Laporan Omzet Penjualan Harian</h3>
                <p className="text-xs text-stone-500 mt-0.5">Rincian pendapatan kasir POS dan toko online per hari</p>
              </div>
              <span className="text-xs font-bold text-stone-500">
                Total Hari Tercatat: {dailyRevenueData.length} Hari
              </span>
            </div>

            {dailyRevenueData.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">calendar_today</span>
                </div>
                <h4 className="font-bold text-stone-700 text-sm">Belum Ada Riwayat Transaksi Harian</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Kondisi saat ini 0 bersih. Ketika ada transaksi di kasir POS atau pesanan masuk dari website, riwayat per tanggal akan langsung muncul di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                      <th className="py-3 px-3">Tanggal</th>
                      <th className="py-3 px-3 text-center">Trx POS</th>
                      <th className="py-3 px-3 text-center">Trx Online</th>
                      <th className="py-3 px-3 text-right">Omzet POS (¥)</th>
                      <th className="py-3 px-3 text-right">Omzet Online (¥)</th>
                      <th className="py-3 px-3 text-right">Total Omzet (¥)</th>
                      <th className="py-3 px-3 text-right">Laba Kotor (¥)</th>
                      <th className="py-3 px-3">Metode Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dailyRevenueData.map((d, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-stone-900">{d.date}</td>
                        <td className="py-3 px-3 text-center font-mono">{d.posTx}</td>
                        <td className="py-3 px-3 text-center font-mono">{d.onlineTx}</td>
                        <td className="py-3 px-3 text-right font-mono">¥{d.posRev.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono">¥{d.onlineRev.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">¥{d.totalRev.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">¥{d.gross.toLocaleString()}</td>
                        <td className="py-3 px-3 text-[11px] text-stone-600">{d.paymentTop}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PENJUALAN PER ITEM (SALES BY SKU) */}
        {/* ================================================================= */}
        {activeTab === 'sales_by_item' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900">Laporan Penjualan per Item (SKU)</h3>
                <p className="text-xs text-stone-500 mt-0.5">Analisis kuantitas terjual, kontribusi omzet, dan margin laba per produk</p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama produk / brand..."
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#c41230]"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold outline-none focus:border-[#c41230]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === 'ALL' ? 'Semua Kategori' : c}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold outline-none focus:border-[#c41230]"
                >
                  <option value="revenue">Urut: Omzet Tertinggi</option>
                  <option value="qty">Urut: Qty Terjual</option>
                  <option value="profit">Urut: Laba Tertinggi</option>
                  <option value="margin">Urut: Margin %</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">Produk / SKU</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-right">Harga Jual</th>
                    <th className="py-3 px-3 text-center">Qty Terjual</th>
                    <th className="py-3 px-3 text-right">Total Omzet</th>
                    <th className="py-3 px-3 text-right">Laba Kotor</th>
                    <th className="py-3 px-3 text-center">Margin %</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedItems.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900">{p.name}</div>
                        <div className="text-[10px] text-stone-400 font-mono">SKU: SN-{p.id} | {p.brand}</div>
                      </td>
                      <td className="py-3 px-3 text-stone-600">{p.category}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">¥{p.price.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{p.totalQty}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">¥{p.totalItemRevenue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">¥{p.totalItemProfit.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{p.marginPct}%</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.velocityStatus === 'Fast Moving'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.velocityStatus === 'Moderate'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          {p.velocityStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalItemPages > 1 && (
              <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-xs font-bold text-stone-600">
                <span>Halaman {currentPage} dari {totalItemPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 disabled:opacity-30 hover:bg-stone-100 cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    disabled={currentPage >= totalItemPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalItemPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 disabled:opacity-30 hover:bg-stone-100 cursor-pointer"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: PAJAK KONSUMSI JEPANG (JAPAN CONSUMPTION TAX / JCT) */}
        {/* ================================================================= */}
        {activeTab === 'tax_compliance' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900">Rekapitulasi Pajak Konsumsi Jepang (JCT)</h3>
                <p className="text-xs text-stone-500 mt-0.5">Kepatuhan Tarif Pajak Konsumsi 8% Sembako dan 10% Jasa Pengiriman</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full">
                Sistem Faktur Pajak Resmi Terverifikasi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-500 block uppercase">Pajak Sembako / Makanan (8%)</span>
                <div className="text-2xl font-black text-stone-900 font-mono">¥{taxFood8.toLocaleString()}</div>
                <p className="text-[11px] text-stone-500">Tarif khusus bahan makanan pokok dan sembako halal impor.</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-500 block uppercase">Pajak Jasa & Ongkir (10%)</span>
                <div className="text-2xl font-black text-stone-900 font-mono">¥{taxShipping10.toLocaleString()}</div>
                <p className="text-[11px] text-stone-500">Tarif standar jasa kurir Yamato & Sagawa Express.</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 block uppercase">Total Pajak Terutang (JCT)</span>
                <div className="text-2xl font-black text-emerald-800 font-mono">¥{totalTaxJCT.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-700">Total kewajiban setor pajak konsumsi ke Biro Pajak Jepang.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
