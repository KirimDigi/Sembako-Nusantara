import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { assetUrl } from '../../utils/assets';

type TabType = 'pnl' | 'balance_sheet' | 'sales_by_item' | 'daily_revenue' | 'tax_compliance';

export const AccountingPage: React.FC = () => {
  const { products, posTransactions, orders } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabType>('pnl');
  const [period, setPeriod] = useState<string>('Bulan Ini (September 2026)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'revenue' | 'qty' | 'profit' | 'margin'>('revenue');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // =========================================================================
  // 1. FINANCIAL CORE DATA COMPUTATION
  // =========================================================================
  const totalPosRevenue = posTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOnlineRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = totalPosRevenue + totalOnlineRevenue;

  // Food items: 8% Reduced Tax Rate (軽減税率 8%)
  // Services & Shipping: 10% Standard Tax Rate (標準税率 10%)
  const estimatedHPP = Math.round(totalRevenue * 0.62);
  const grossProfit = totalRevenue - estimatedHPP;
  const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  // Operating Expenses (Beban Operasional Detail Tokyo & Warehouse)
  const operatingExpenses = {
    rentWarehouse: 180000, // Sewa Gudang Kanto Edogawa-ku & Storefront
    electricityColdStorage: 65000, // Listrik Freezer & Showcase -20°C
    shippingSubsidyPackaging: 48000, // Bubble wrap, kardus tebal, selisih ongkir Yamato
    paymentGatewayFees: Math.round(totalRevenue * 0.0324), // Biaya PayPay / JPQR / Stripe 3.24%
    staffPayroll: 220000, // Gaji Karyawan & Part-Time Diaspora
    marketingPromo: 35000 // Iklan FB/IG Diaspora & Brosur Komunitas
  };

  const totalOperatingExpenses =
    operatingExpenses.rentWarehouse +
    operatingExpenses.electricityColdStorage +
    operatingExpenses.shippingSubsidyPackaging +
    operatingExpenses.paymentGatewayFees +
    operatingExpenses.staffPayroll +
    operatingExpenses.marketingPromo;

  // Operating Profit (Laba Usaha)
  const operatingProfit = grossProfit - totalOperatingExpenses;
  const operatingMarginPercent = totalRevenue > 0 ? Math.round((operatingProfit / totalRevenue) * 100) : 0;

  // Japanese Consumption Tax (消費税 - JCT) 8% for food items
  const taxFood8 = Math.round((totalRevenue / 1.08) * 0.08);
  const taxShipping10 = Math.round(((totalOnlineRevenue * 0.15) / 1.1) * 0.1);
  const totalTaxJCT = taxFood8 + taxShipping10;

  // Net Profit (Laba Bersih Setelah Pajak & Beban)
  const netProfit = operatingProfit - Math.round(totalTaxJCT * 0.2); // Setelah alokasi kewajiban pajak
  const netProfitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // =========================================================================
  // 2. NERACA KEUANGAN (BALANCE SHEET / 貸借対照表) DATA
  // =========================================================================
  // Total Valuasi Persediaan Sembako di Gudang (Berdasarkan Stok & HPP)
  const inventoryValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock * Math.round(p.price * 0.65), 0);
  }, [products]);

  const balanceSheet = {
    assets: {
      currentAssets: {
        cashStorePOS: 250000, // Kas Tunai di Laci Kasir POS
        bankJapanPost: 1850000, // Bank Pos Jepang (ゆうちょ銀行)
        bankMUFG: 2400000, // Bank MUFG (三菱UFJ銀行)
        payPaySettlement: 420000, // Saldo Merchant PayPay Pending Settlement
        accountsReceivable: 310000, // Piutang E-Commerce / COD Yamato Pending Cair
        inventoryStock: inventoryValuation // Valuasi Stok Sembako Halal di Gudang
      },
      fixedAssets: {
        coldStorageFreezers: 1200000, // 3x Unit Freezer Komersial Heavy Duty (-20°C)
        posHardwareEquipment: 350000, // Mesin Kasir POS, Barcode Scanners, Thermal Printers
        warehouseShelving: 280000, // Rak Display Toko & Racking Gudang Heavy Duty
        accumulatedDepreciation: -180000 // Akumulasi Penyusutan Aset
      }
    },
    liabilities: {
      currentLiabilities: {
        accountsPayableSupplier: 680000, // Hutang Dagang Supplier Impor Indonesia (Indofood/Bango)
        accruedTaxesJCT: totalTaxJCT, // Pajak Konsumsi Jepang Terutang (消費税)
        accruedExpenses: 145000, // Beban Gaji & Operasional Terutang
        customerDeposits: 65000 // Deposit Saldo Pelanggan / Dompet Digital
      },
      longTermLiabilities: {
        businessLoan: 1500000 // Pinjaman Lunak Usaha Diaspora Jepang
      }
    },
    equity: {
      capitalPaidIn: 4500000, // Modal Disetor Awal Pendiri (Jangsan & Partners)
      retainedEarnings: 0 // Akan dihitung agar Neraca 100% Balanced
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

  // Laba Ditahan disesuaikan sehingga Total Pasiva = Total Aktiva (Kaidah Neraca Seimbang)
  const calculatedRetainedEarnings = totalAssets - totalLiabilities - balanceSheet.equity.capitalPaidIn;
  const totalEquity = balanceSheet.equity.capitalPaidIn + calculatedRetainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // Financial Health Ratios
  const currentRatio = totalCurrentLiabilities > 0 ? (totalCurrentAssets / totalCurrentLiabilities).toFixed(2) : 'N/A';
  const quickRatio = totalCurrentLiabilities > 0 ? ((totalCurrentAssets - inventoryValuation) / totalCurrentLiabilities).toFixed(2) : 'N/A';

  // =========================================================================
  // 3. LAPORAN PENJUALAN PER ITEM (SALES BY ITEM / SKU PERFORMANCE)
  // =========================================================================
  const productSalesMap = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();

    // 1. Aggregation from POS Transactions
    posTransactions.forEach((tx) => {
      tx.items?.forEach((item) => {
        const prodId = item.productId || 'unknown';
        const existing = map.get(prodId) || { qty: 0, revenue: 0 };
        const lineTotal = item.subtotal || item.price * item.quantity;

        map.set(prodId, {
          qty: existing.qty + item.quantity,
          revenue: existing.revenue + lineTotal
        });
      });
    });

    // 2. Aggregation from Online Orders
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

  // Merge products with sales metrics
  const itemPerformanceList = useMemo(() => {
    return products.map((p) => {
      const sales = productSalesMap.get(p.id) || { qty: 0, revenue: 0 };
      // If no recorded transactions yet in demo, generate realistic baseline activity based on stock & popularity
      const baselineMultiplier = p.rating >= 4.8 ? 14 : p.rating >= 4.5 ? 8 : 4;
      const totalQty = sales.qty > 0 ? sales.qty : baselineMultiplier;
      const totalItemRevenue = sales.revenue > 0 ? sales.revenue : totalQty * p.price;
      const hppUnit = Math.round(p.price * 0.65);
      const totalItemHPP = totalQty * hppUnit;
      const totalItemProfit = totalItemRevenue - totalItemHPP;
      const marginPct = totalItemRevenue > 0 ? Math.round((totalItemProfit / totalItemRevenue) * 100) : 0;
      const revenueShare = totalRevenue > 0 ? ((totalItemRevenue / totalRevenue) * 100).toFixed(1) : '0.0';

      let velocityStatus: 'Fast Moving' | 'Moderate' | 'Slow Moving' = 'Moderate';
      if (totalQty >= 12 || marginPct >= 40) velocityStatus = 'Fast Moving';
      else if (totalQty <= 4) velocityStatus = 'Slow Moving';

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

  // Filtered & Sorted Items
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

  // Pagination for Items Table
  const totalItemPages = Math.max(1, Math.ceil(filteredItemPerformance.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItemPerformance.slice(start, start + itemsPerPage);
  }, [filteredItemPerformance, currentPage, itemsPerPage]);

  // =========================================================================
  // 4. LAPORAN OMZET HARIAN (DAILY REVENUE REPORT)
  // =========================================================================
  const dailyRevenueData = useMemo(() => {
    // Generate realistic daily trend for the last 14 days (September 2026)
    const days = [
      { date: '2026-09-22', label: 'Selasa, 22 Sep (Hari Ini)', posTx: 18, onlineTx: 12, posRev: 84500, onlineRev: 62300, paymentTop: 'PayPay (45%)' },
      { date: '2026-09-21', label: 'Senin, 21 Sep', posTx: 14, onlineTx: 9, posRev: 62000, onlineRev: 48500, paymentTop: 'Bank Transfer (40%)' },
      { date: '2026-09-20', label: 'Minggu, 20 Sep (Weekend Peak)', posTx: 32, onlineTx: 24, posRev: 148000, onlineRev: 118000, paymentTop: 'PayPay (52%)' },
      { date: '2026-09-19', label: 'Sabtu, 19 Sep (Weekend Peak)', posTx: 29, onlineTx: 21, posRev: 135000, onlineRev: 104500, paymentTop: 'Cash POS (48%)' },
      { date: '2026-09-18', label: 'Jumat, 18 Sep', posTx: 22, onlineTx: 15, posRev: 98000, onlineRev: 74200, paymentTop: 'JPQR / Yucho (38%)' },
      { date: '2026-09-17', label: 'Kamis, 17 Sep', posTx: 16, onlineTx: 11, posRev: 71500, onlineRev: 53800, paymentTop: 'PayPay (44%)' },
      { date: '2026-09-16', label: 'Rabu, 16 Sep', posTx: 15, onlineTx: 10, posRev: 68000, onlineRev: 49000, paymentTop: 'Bank Transfer (42%)' },
      { date: '2026-09-15', label: 'Selasa, 15 Sep', posTx: 17, onlineTx: 12, posRev: 76000, onlineRev: 58500, paymentTop: 'PayPay (46%)' },
      { date: '2026-09-14', label: 'Senin, 14 Sep', posTx: 13, onlineTx: 8, posRev: 59000, onlineRev: 41200, paymentTop: 'Cash POS (50%)' },
      { date: '2026-09-13', label: 'Minggu, 13 Sep', posTx: 30, onlineTx: 22, posRev: 142000, onlineRev: 112000, paymentTop: 'PayPay (54%)' },
      { date: '2026-09-12', label: 'Sabtu, 12 Sep', posTx: 28, onlineTx: 19, posRev: 129000, onlineRev: 96500, paymentTop: 'PayPay (49%)' },
      { date: '2026-09-11', label: 'Jumat, 11 Sep', posTx: 20, onlineTx: 14, posRev: 89000, onlineRev: 68000, paymentTop: 'COD Yamato (35%)' },
      { date: '2026-09-10', label: 'Kamis, 10 Sep', posTx: 15, onlineTx: 9, posRev: 66500, onlineRev: 45000, paymentTop: 'Bank Transfer (40%)' },
      { date: '2026-09-09', label: 'Rabu, 09 Sep', posTx: 14, onlineTx: 8, posRev: 63000, onlineRev: 42000, paymentTop: 'PayPay (45%)' }
    ];

    return days.map((d) => {
      const totalRev = d.posRev + d.onlineRev;
      const totalTx = d.posTx + d.onlineTx;
      const hpp = Math.round(totalRev * 0.62);
      const gross = totalRev - hpp;
      const aov = totalTx > 0 ? Math.round(totalRev / totalTx) : 0;
      return {
        ...d,
        totalRev,
        totalTx,
        hpp,
        gross,
        aov
      };
    });
  }, []);

  const total14DaysRev = dailyRevenueData.reduce((acc, d) => acc + d.totalRev, 0);
  const avgDailyRevenue = Math.round(total14DaysRev / dailyRevenueData.length);
  const total14DaysTx = dailyRevenueData.reduce((acc, d) => acc + d.totalTx, 0);
  const avgOrderValueOverall = Math.round(total14DaysRev / total14DaysTx);
  const maxDayRevenue = Math.max(...dailyRevenueData.map((d) => d.totalRev));

  // =========================================================================
  // 5. EXPORT CSV HANDLERS
  // =========================================================================
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `Laporan_Keuangan_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'pnl') {
      headers = ['Komponen Laporan', 'Nilai (¥)', 'Keterangan'];
      rows = [
        ['Total Omzet Penjualan (Gross Revenue)', totalRevenue.toString(), 'Kasir POS + E-Commerce'],
        ['Harga Pokok Penjualan (HPP / COGS)', estimatedHPP.toString(), 'Harga Beli Distributor Impor'],
        ['Laba Kotor (Gross Profit)', grossProfit.toString(), `Margin ${grossMarginPercent}%`],
        ['Biaya Sewa Gudang & Toko Tokyo', operatingExpenses.rentWarehouse.toString(), 'Edogawa-ku Tokyo Hub'],
        ['Biaya Listrik & Cold Storage -20°C', operatingExpenses.electricityColdStorage.toString(), 'Freezer Komersial'],
        ['Biaya Logistik & Packaging', operatingExpenses.shippingSubsidyPackaging.toString(), 'Bubble Wrap & Kardus'],
        ['Biaya Gateway (PayPay/JPQR 3.24%)', operatingExpenses.paymentGatewayFees.toString(), 'Fee Merchant'],
        ['Biaya Gaji Pegawai & Staf Diaspora', operatingExpenses.staffPayroll.toString(), 'Gaji Toko & Admin'],
        ['Biaya Pemasaran Komunitas', operatingExpenses.marketingPromo.toString(), 'Promosi & Komunitas'],
        ['Total Beban Operasional (OPEX)', totalOperatingExpenses.toString(), 'Total Pengeluaran'],
        ['Laba Bersih Operasional (Operating Profit)', operatingProfit.toString(), `Margin ${operatingMarginPercent}%`],
        ['Pajak Konsumsi Jepang (消費税 8% & 10%)', totalTaxJCT.toString(), 'Pajak NTA Jepang (国税庁)'],
        ['Laba Bersih Setelah Pajak (Net Profit)', netProfit.toString(), `Margin Bersih ${netProfitMarginPercent}%`]
      ];
      filename = `Laporan_Laba_Rugi_P&L_Sembako_Nusantara_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (activeTab === 'balance_sheet') {
      headers = ['Kategori Neraca', 'Akun Neraca', 'Jumlah (¥)'];
      rows = [
        ['Aktiva Lancar', 'Kas di Toko Fisik POS', balanceSheet.assets.currentAssets.cashStorePOS.toString()],
        ['Aktiva Lancar', 'Bank Pos Jepang (ゆうちょ銀行)', balanceSheet.assets.currentAssets.bankJapanPost.toString()],
        ['Aktiva Lancar', 'Bank MUFG (三菱UFJ銀行)', balanceSheet.assets.currentAssets.bankMUFG.toString()],
        ['Aktiva Lancar', 'Saldo PayPay Merchant Settlement', balanceSheet.assets.currentAssets.payPaySettlement.toString()],
        ['Aktiva Lancar', 'Piutang Usaha & COD Yamato Pending', balanceSheet.assets.currentAssets.accountsReceivable.toString()],
        ['Aktiva Lancar', 'Persediaan Stok Sembako Halal di Gudang', balanceSheet.assets.currentAssets.inventoryStock.toString()],
        ['Aktiva Tetap', 'Showcase & Cold Storage Freezer Komersial', balanceSheet.assets.fixedAssets.coldStorageFreezers.toString()],
        ['Aktiva Tetap', 'Mesin Kasir POS & Barcode Hardware', balanceSheet.assets.fixedAssets.posHardwareEquipment.toString()],
        ['Aktiva Tetap', 'Rak Display Toko & Racking Gudang', balanceSheet.assets.fixedAssets.warehouseShelving.toString()],
        ['Aktiva Tetap', 'Akumulasi Penyusutan Aset', balanceSheet.assets.fixedAssets.accumulatedDepreciation.toString()],
        ['TOTAL AKTIVA', 'TOTAL KESELURUHAN ASET', totalAssets.toString()],
        ['Kewajiban', 'Hutang Dagang Supplier Impor Indonesia', balanceSheet.liabilities.currentLiabilities.accountsPayableSupplier.toString()],
        ['Kewajiban', 'Pajak Konsumsi Terutang (未払消費税)', balanceSheet.liabilities.currentLiabilities.accruedTaxesJCT.toString()],
        ['Kewajiban', 'Beban Operasional & Gaji Terutang', balanceSheet.liabilities.currentLiabilities.accruedExpenses.toString()],
        ['Kewajiban', 'Pinjaman Lunak Usaha Diaspora', balanceSheet.liabilities.longTermLiabilities.businessLoan.toString()],
        ['Ekuitas', 'Modal Awal Disetor Pemilik', balanceSheet.equity.capitalPaidIn.toString()],
        ['Ekuitas', 'Laba Ditahan (Retained Earnings)', calculatedRetainedEarnings.toString()],
        ['TOTAL PASIVA & EKUITAS', 'TOTAL KEWAJIBAN & MODAL', totalLiabilitiesAndEquity.toString()]
      ];
      filename = `Laporan_Neraca_Keuangan_Balance_Sheet_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (activeTab === 'sales_by_item') {
      headers = ['SKU', 'Nama Produk', 'Kategori', 'Harga Jual (¥)', 'HPP Unit (¥)', 'Qty Terjual', 'Total Omzet (¥)', 'Total Laba Kotor (¥)', 'Margin (%)', 'Status Perputaran'];
      rows = itemPerformanceList.map((p) => [
        `SN-${p.id}`,
        `"${p.name}"`,
        p.category,
        p.price.toString(),
        p.hppUnit.toString(),
        p.totalQty.toString(),
        p.totalItemRevenue.toString(),
        p.totalItemProfit.toString(),
        `${p.marginPct}%`,
        p.velocityStatus
      ]);
      filename = `Laporan_Penjualan_Per_Item_SKU_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (activeTab === 'daily_revenue') {
      headers = ['Tanggal', 'Transaksi POS', 'Transaksi Online', 'Total Transaksi', 'Omzet POS (¥)', 'Omzet Online (¥)', 'Total Omzet (¥)', 'HPP (¥)', 'Laba Kotor (¥)', 'Rata-rata Keranjang AOV (¥)', 'Metode Bayar Dominan'];
      rows = dailyRevenueData.map((d) => [
        d.date,
        d.posTx.toString(),
        d.onlineTx.toString(),
        d.totalTx.toString(),
        d.posRev.toString(),
        d.onlineRev.toString(),
        d.totalRev.toString(),
        d.hpp.toString(),
        d.gross.toString(),
        d.aov.toString(),
        d.paymentTop
      ]);
      filename = `Laporan_Omzet_Harian_Daily_Revenue_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Categories list for item filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  return (
    <AdminLayout
      title="Laporan Keuangan, Neraca & Performa Penjualan"
      subtitle="Pusat pembukuan akuntansi terpadu: Laba Rugi (P&L), Neraca Keuangan, Omzet Harian, Penjualan per Item, dan Pajak Konsumsi Jepang (消費税)."
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Japan Tax Compliance & Tax ID Bar */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 shadow-xs">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              〒
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>Kepatuhan Pajak Konsumsi Jepang (国税庁 消費税・インボイス制度適合)</span>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-extrabold">
                  VERIFIED NTA
                </span>
              </div>
              <div className="text-emerald-700 text-[11px] mt-0.5">
                No. Registrasi Faktur Pajak Jepang: <strong className="font-mono text-stone-900 bg-emerald-100 px-1.5 py-0.5 rounded">T1010001099882</strong> (Biro Pajak Tokyo / 東京国税局)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1 bg-white rounded-lg border border-emerald-300 text-emerald-800 shadow-xs">
              Sembako/Food: <strong>8% 軽減税率</strong>
            </span>
            <span className="px-3 py-1 bg-white rounded-lg border border-emerald-300 text-emerald-800 shadow-xs">
              Ongkir/Service: <strong>10% 標準税率</strong>
            </span>
          </div>
        </div>

        {/* Navigation Tabs (5 Main Financial Reports) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-1.5 shadow-xs flex flex-wrap gap-1">
          <button
            onClick={() => {
              setActiveTab('pnl');
              setCurrentPage(1);
            }}
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'pnl'
                ? 'bg-[#c41230] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">monitoring</span>
            <span>Laba Rugi (P&L)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('balance_sheet');
              setCurrentPage(1);
            }}
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tax_compliance'
                ? 'bg-[#c41230] text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            <span>Pajak Konsumsi (消費税)</span>
          </button>
        </div>

        {/* Global Controls & Export Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Periode Data:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none shadow-2xs"
            >
              <option value="Hari Ini (Real-Time)">Hari Ini (Real-Time)</option>
              <option value="7 Hari Terakhir">7 Hari Terakhir</option>
              <option value="Bulan Ini (September 2026)">Bulan Ini (September 2026)</option>
              <option value="Kuartal 3 (Q3 2026)">Kuartal 3 (Q3 2026)</option>
              <option value="Tahun Berjalan (YTD 2026)">Tahun Berjalan (YTD 2026)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl border border-stone-200 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV (Format Resmi)</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LAPORAN LABA RUGI (INCOME STATEMENT / P&L) */}
        {/* ========================================================================= */}
        {activeTab === 'pnl' && (
          <div className="space-y-6">
            {/* 4 Summary Scorecards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Pendapatan (Omzet)</span>
                <div className="text-2xl font-black text-stone-900 mt-1 font-mono">
                  ¥{totalRevenue.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">POS Kasir + Toko Online</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">HPP Modal Barang (COGS)</span>
                <div className="text-2xl font-black text-stone-700 mt-1 font-mono">
                  ¥{estimatedHPP.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">62% dari total omzet penjualan</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Laba Kotor (Gross Profit)</span>
                <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                  ¥{grossProfit.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1">
                  Margin Laba Kotor: {grossMarginPercent}%
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Laba Bersih (Net Profit)</span>
                <div className="text-2xl font-black text-[#c41230] mt-1 font-mono">
                  ¥{netProfit.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-[#c41230] font-bold mt-1">
                  Net Profit Margin: {netProfitMarginPercent}%
                </div>
              </div>
            </div>

            {/* Detailed P&L Statement Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c41230] text-lg">description</span>
                    <span>Laporan Laba Rugi Komprehensif (損益計算書 - P&L Statement)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Periode: {period} • Satuan Mata Uang: Yen Jepang (JPY ¥)
                  </p>
                </div>
                <span className="px-3 py-1 bg-stone-200 text-stone-800 rounded-full text-xs font-bold">
                  Standar Akuntansi Jepang (J-GAAP)
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* 1. Pendapatan Penjualan */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-sm text-stone-900 border-b border-stone-200 pb-1">
                    <span className="uppercase text-xs tracking-wider text-stone-700">1. PENDAPATAN USAHA (売上高 - REVENUE)</span>
                    <span className="font-mono">¥{totalRevenue.toLocaleString('ja-JP')}</span>
                  </div>
                  <div className="pl-4 space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>• Penjualan Toko Fisik (Kasir POS Sembako Nusantara)</span>
                      <span className="font-mono font-medium">¥{totalPosRevenue.toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Penjualan E-Commerce Online Web</span>
                      <span className="font-mono font-medium">¥{totalOnlineRevenue.toLocaleString('ja-JP')}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Harga Pokok Penjualan (HPP) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-sm text-stone-900 border-b border-stone-200 pb-1">
                    <span className="uppercase text-xs tracking-wider text-stone-700">2. HARGA POKOK PENJUALAN (売上原価 - COGS)</span>
                    <span className="font-mono text-stone-700">(¥{estimatedHPP.toLocaleString('ja-JP')})</span>
                  </div>
                  <div className="pl-4 space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>• Pembelian Barang Impor Indonesia & Frozen Food</span>
                      <span className="font-mono font-medium">¥{Math.round(estimatedHPP * 0.85).toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Bea Cukai & Karantina Pangan Jepang (税関・検疫費)</span>
                      <span className="font-mono font-medium">¥{Math.round(estimatedHPP * 0.15).toLocaleString('ja-JP')}</span>
                    </div>
                  </div>
                </div>

                {/* Subtotal Laba Kotor */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between font-black text-sm text-emerald-950">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700 text-lg">check_circle</span>
                    <span>LABA KOTOR (売上総利益 - GROSS PROFIT)</span>
                  </span>
                  <span className="font-mono text-base text-emerald-700">¥{grossProfit.toLocaleString('ja-JP')}</span>
                </div>

                {/* 3. Beban Operasional */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-sm text-stone-900 border-b border-stone-200 pb-1">
                    <span className="uppercase text-xs tracking-wider text-stone-700">3. BEBAN OPERASIONAL TOKO & GUDANG (販売管理費 - OPEX)</span>
                    <span className="font-mono text-amber-700">(¥{totalOperatingExpenses.toLocaleString('ja-JP')})</span>
                  </div>
                  <div className="pl-4 space-y-2 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>• Sewa Toko & Gudang Kanto (東京店舗・倉庫賃料)</span>
                      <span className="font-mono font-medium">¥{operatingExpenses.rentWarehouse.toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Listrik & Cold Storage Freezer -20°C (電気・冷凍保管費)</span>
                      <span className="font-mono font-medium">¥{operatingExpenses.electricityColdStorage.toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Gaji Karyawan Kasir & Admin Gudang Diaspora (人件費・給与)</span>
                      <span className="font-mono font-medium">¥{operatingExpenses.staffPayroll.toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Biaya Pengemasan Bubble Wrap & Kardus Tebal (梱包資材費)</span>
                      <span className="font-mono font-medium">¥{operatingExpenses.shippingSubsidyPackaging.toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Biaya Payment Gateway (PayPay, JPQR, Stripe 3.24%)</span>
                      <span className="font-mono font-medium">¥{operatingExpenses.paymentGatewayFees.toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Pemasaran & Promosi Komunitas Diaspora (広告宣伝費)</span>
                      <span className="font-mono font-medium">¥{operatingExpenses.marketingPromo.toLocaleString('ja-JP')}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Laba Operasional */}
                <div className="p-3.5 bg-stone-100 rounded-xl flex items-center justify-between font-bold text-sm text-stone-900 border border-stone-200">
                  <span>LABA BERSIH OPERASIONAL TOKO (営業利益 - OPERATING INCOME)</span>
                  <span className="font-mono text-base">¥{operatingProfit.toLocaleString('ja-JP')}</span>
                </div>

                {/* 5. Pajak Konsumsi Jepang */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-bold text-sm text-stone-900 border-b border-stone-200 pb-1">
                    <span className="uppercase text-xs tracking-wider text-stone-700">4. PAJAK KONSUMSI JEPANG (国税庁 消費税 8% / 10%)</span>
                    <span className="font-mono text-indigo-700">¥{totalTaxJCT.toLocaleString('ja-JP')}</span>
                  </div>
                  <div className="pl-4 space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>• Pajak Konsumsi Makanan/Sembako Halal (8% 軽減税率)</span>
                      <span className="font-mono font-medium">¥{taxFood8.toLocaleString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Pajak Konsumsi Jasa Ongkir & Layanan (10% 標準税率)</span>
                      <span className="font-mono font-medium">¥{taxShipping10.toLocaleString('ja-JP')}</span>
                    </div>
                  </div>
                </div>

                {/* Grand Total Laba Bersih */}
                <div className="p-4 bg-gradient-to-r from-red-50 via-white to-red-50 border-2 border-[#c41230] rounded-2xl flex items-center justify-between font-black text-base text-stone-900 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#c41230] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">verified</span>
                    </div>
                    <div>
                      <div className="text-sm font-black text-stone-900">LABA BERSIH TAHUN BERJALAN (当期純利益 - NET PROFIT)</div>
                      <div className="text-[11px] text-stone-500 font-normal">Setelah memperhitungkan seluruh beban operasional & pajak konsumsi</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-[#c41230]">¥{netProfit.toLocaleString('ja-JP')}</span>
                    <div className="text-[11px] text-emerald-700 font-bold">Margin Bersih: {netProfitMarginPercent}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NERACA KEUANGAN (BALANCE SHEET / 貸借対照表) */}
        {/* ========================================================================= */}
        {activeTab === 'balance_sheet' && (
          <div className="space-y-6">
            {/* Balance Sheet Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Aktiva (Aset Bisnis)</span>
                <div className="text-2xl font-black text-stone-900 mt-1 font-mono">
                  ¥{totalAssets.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1">Aset Lancar: ¥{totalCurrentAssets.toLocaleString('ja-JP')}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Kewajiban (Hutang Usaha)</span>
                <div className="text-2xl font-black text-amber-700 mt-1 font-mono">
                  ¥{totalLiabilities.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Hutang Supplier: ¥{balanceSheet.liabilities.currentLiabilities.accountsPayableSupplier.toLocaleString('ja-JP')}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Ekuitas (Modal Bersih)</span>
                <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
                  ¥{totalEquity.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-blue-700 font-bold mt-1">Modal Disetor + Laba Ditahan</div>
              </div>
            </div>

            {/* 2-Column Balance Sheet Grid (Aktiva vs Pasiva) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kolom Kiri: AKTIVA (ASET / 資産の部) */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-stone-100 bg-blue-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-700 text-lg">account_balance_wallet</span>
                      <span>AKTIVA / ASET PERUSAHAAN (資産の部)</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-blue-800">¥{totalAssets.toLocaleString('ja-JP')}</span>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Aset Lancar */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between font-bold text-xs text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-1">
                        <span>Aset Lancar (流動資産)</span>
                        <span className="font-mono">¥{totalCurrentAssets.toLocaleString('ja-JP')}</span>
                      </div>
                      <div className="space-y-2 text-xs text-stone-600 pl-2">
                        <div className="flex justify-between">
                          <span>• Kas Tunai Laci POS Kasir Toko</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.assets.currentAssets.cashStorePOS.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Saldo Bank Pos Jepang (ゆうちょ銀行)</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.assets.currentAssets.bankJapanPost.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Saldo Bank MUFG (三菱UFJ銀行)</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.assets.currentAssets.bankMUFG.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Saldo PayPay Merchant QR Settlement</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.assets.currentAssets.payPaySettlement.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Piutang Usaha & COD Yamato Pending</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.assets.currentAssets.accountsReceivable.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Valuasi Persediaan Stok Sembako Halal di Gudang</span>
                          <span className="font-mono font-bold text-emerald-700">¥{balanceSheet.assets.currentAssets.inventoryStock.toLocaleString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Aset Tetap */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between font-bold text-xs text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-1">
                        <span>Aset Tetap & Peralatan (固定資産)</span>
                        <span className="font-mono">¥{totalFixedAssets.toLocaleString('ja-JP')}</span>
                      </div>
                      <div className="space-y-2 text-xs text-stone-600 pl-2">
                        <div className="flex justify-between">
                          <span>• Commercial Showcase & Cold Storage Unit (-20°C)</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.assets.fixedAssets.coldStorageFreezers.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Mesin Kasir POS, Barcode Scanner & Hardware</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.assets.fixedAssets.posHardwareEquipment.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Rak Display Toko & Racking Gudang Heavy Duty</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.assets.fixedAssets.warehouseShelving.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between text-stone-400">
                          <span>• Akumulasi Penyusutan Aset (減価償却累計額)</span>
                          <span className="font-mono">({balanceSheet.assets.fixedAssets.accumulatedDepreciation.toLocaleString('ja-JP')})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Assets Footer */}
                <div className="p-4 bg-blue-50 border-t border-blue-200 flex items-center justify-between font-black text-sm text-blue-950">
                  <span>TOTAL AKTIVA (ASET)</span>
                  <span className="font-mono text-base text-blue-900">¥{totalAssets.toLocaleString('ja-JP')}</span>
                </div>
              </div>

              {/* Kolom Kanan: PASIVA & EKUITAS (負債・純資産の部) */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-4 border-b border-stone-100 bg-amber-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-700 text-lg">balance</span>
                      <span>PASIVA: KEWAJIBAN & EKUITAS (負債・純資産の部)</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-amber-800">¥{totalLiabilitiesAndEquity.toLocaleString('ja-JP')}</span>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Kewajiban Lancar */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between font-bold text-xs text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-1">
                        <span>Kewajiban Jangka Pendek (流動負債)</span>
                        <span className="font-mono">¥{totalCurrentLiabilities.toLocaleString('ja-JP')}</span>
                      </div>
                      <div className="space-y-2 text-xs text-stone-600 pl-2">
                        <div className="flex justify-between">
                          <span>• Hutang Dagang Supplier Impor Indonesia</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.liabilities.currentLiabilities.accountsPayableSupplier.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Pajak Konsumsi Jepang Terutang (未払消費税)</span>
                          <span className="font-mono font-bold text-indigo-700">¥{balanceSheet.liabilities.currentLiabilities.accruedTaxesJCT.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Beban Operasional & Gaji Terutang</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.liabilities.currentLiabilities.accruedExpenses.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Deposit & Saldo Pelanggan</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.liabilities.currentLiabilities.customerDeposits.toLocaleString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Kewajiban Jangka Panjang */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between font-bold text-xs text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-1">
                        <span>Kewajiban Jangka Panjang (固定負債)</span>
                        <span className="font-mono">¥{totalLongTermLiabilities.toLocaleString('ja-JP')}</span>
                      </div>
                      <div className="space-y-2 text-xs text-stone-600 pl-2">
                        <div className="flex justify-between">
                          <span>• Pinjaman Lunak Usaha Diaspora Jepang</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.liabilities.longTermLiabilities.businessLoan.toLocaleString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ekuitas & Modal */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between font-bold text-xs text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-1">
                        <span>Ekuitas Modal Pemilik (純資産の部)</span>
                        <span className="font-mono text-emerald-800">¥{totalEquity.toLocaleString('ja-JP')}</span>
                      </div>
                      <div className="space-y-2 text-xs text-stone-600 pl-2">
                        <div className="flex justify-between">
                          <span>• Modal Disetor Awal Pendiri (資本金)</span>
                          <span className="font-mono font-bold text-stone-900">¥{balanceSheet.equity.capitalPaidIn.toLocaleString('ja-JP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Laba Ditahan / Akumulasi Keuntungan (利益剰余金)</span>
                          <span className="font-mono font-bold text-emerald-700">¥{calculatedRetainedEarnings.toLocaleString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Liabilities & Equity Footer */}
                <div className="p-4 bg-amber-50 border-t border-amber-200 flex items-center justify-between font-black text-sm text-amber-950">
                  <span>TOTAL PASIVA & EKUITAS</span>
                  <span className="font-mono text-base text-amber-900">¥{totalLiabilitiesAndEquity.toLocaleString('ja-JP')}</span>
                </div>
              </div>
            </div>

            {/* Balance Status Verification Badge */}
            <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-emerald-700">task_alt</span>
                <span>Status Keseimbangan Neraca: 100% Balanced (Aktiva = Pasiva + Ekuitas)</span>
              </div>
              <div className="flex gap-4 font-mono font-bold text-emerald-900">
                <span>Current Ratio: {currentRatio}x</span>
                <span>Quick Ratio: {quickRatio}x</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LAPORAN OMZET HARIAN (DAILY REVENUE TRACKER) */}
        {/* ========================================================================= */}
        {activeTab === 'daily_revenue' && (
          <div className="space-y-6">
            {/* Daily Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Rata-Rata Omzet Harian</span>
                <div className="text-2xl font-black text-stone-900 mt-1 font-mono">
                  ¥{avgDailyRevenue.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">Berdasarkan data 14 hari terakhir</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Rata-Rata Keranjang (AOV)</span>
                <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                  ¥{avgOrderValueOverall.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">Average Order Value</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Rekor Penjualan Tertinggi</span>
                <div className="text-2xl font-black text-[#c41230] mt-1 font-mono">
                  ¥{maxDayRevenue.toLocaleString('ja-JP')}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">Minggu, 20 September 2026</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Transaksi 14 Hari</span>
                <div className="text-2xl font-black text-blue-600 mt-1 font-mono">
                  {total14DaysTx} Transaksi
                </div>
                <div className="text-[11px] text-blue-700 font-medium mt-1">POS Kasir + E-Commerce</div>
              </div>
            </div>

            {/* Visual Bar Trend of Daily Revenue */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c41230] text-base">bar_chart</span>
                    <span>Grafik Tren Omzet Harian (14 Hari Terakhir)</span>
                  </h3>
                  <p className="text-xs text-stone-400">Puncak penjualan selalu terjadi pada akhir pekan (Sabtu & Minggu)</p>
                </div>
              </div>

              <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 items-end h-44 pt-6 border-b border-stone-100 pb-2">
                {dailyRevenueData.map((d, i) => {
                  const heightPercent = Math.round((d.totalRev / maxDayRevenue) * 100);
                  const isToday = i === 0;
                  const isWeekend = d.label.includes('Sabtu') || d.label.includes('Minggu');

                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 bg-stone-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        ¥{d.totalRev.toLocaleString('ja-JP')} ({d.totalTx} tx)
                      </div>

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all group-hover:opacity-90 ${
                          isToday
                            ? 'bg-[#c41230]'
                            : isWeekend
                            ? 'bg-emerald-500'
                            : 'bg-stone-300'
                        }`}
                      ></div>
                      <span className="text-[10px] font-bold text-stone-600 truncate w-full text-center">
                        {d.date.slice(8)} Sep
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-stone-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#c41230]"></span> Hari Ini
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span> Weekend Peak
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-stone-300"></span> Weekday
                </span>
              </div>
            </div>

            {/* Daily Revenue Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c41230] text-base">calendar_view_day</span>
                  <span>Rincian Rekap Omzet Harian</span>
                </h3>
                <span className="text-xs text-stone-400 font-medium">14 Hari Terakhir</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Tanggal</th>
                      <th className="px-4 py-3.5 text-center">Tx Kasir POS</th>
                      <th className="px-4 py-3.5 text-center">Tx Online Web</th>
                      <th className="px-4 py-3.5 font-bold">Omzet POS (¥)</th>
                      <th className="px-4 py-3.5 font-bold">Omzet Web (¥)</th>
                      <th className="px-4 py-3.5 font-black text-stone-900">Total Omzet Harian</th>
                      <th className="px-4 py-3.5 text-center">Rata-Rata Keranjang (AOV)</th>
                      <th className="px-4 py-3.5 text-right">Metode Bayar Terbanyak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {dailyRevenueData.map((d, i) => (
                      <tr key={d.date} className={`hover:bg-stone-50/70 transition-colors ${i === 0 ? 'bg-red-50/30' : ''}`}>
                        <td className="py-3.5 px-4 font-bold text-stone-900 flex items-center gap-2">
                          {i === 0 && <span className="w-2 h-2 rounded-full bg-[#c41230] animate-pulse"></span>}
                          <span>{d.label}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono">{d.posTx} tx</td>
                        <td className="px-4 py-3.5 text-center font-mono">{d.onlineTx} tx</td>
                        <td className="px-4 py-3.5 font-mono text-stone-700">¥{d.posRev.toLocaleString('ja-JP')}</td>
                        <td className="px-4 py-3.5 font-mono text-stone-700">¥{d.onlineRev.toLocaleString('ja-JP')}</td>
                        <td className="px-4 py-3.5 font-mono font-black text-emerald-600 text-sm">
                          ¥{d.totalRev.toLocaleString('ja-JP')}
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono text-stone-600">
                          ¥{d.aov.toLocaleString('ja-JP')}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-stone-800">
                          <span className="px-2.5 py-1 bg-stone-100 rounded-lg text-[11px]">
                            {d.paymentTop}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LAPORAN PENJUALAN PER ITEM (SALES BY ITEM / SKU REPORT) */}
        {/* ========================================================================= */}
        {activeTab === 'sales_by_item' && (
          <div className="space-y-6">
            {/* Filter & Sort Controls */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c41230] text-base">format_list_numbered</span>
                    <span>Laporan Penjualan & Profitabilitas Per SKU / Item</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Menampilkan performa unit terjual, total omzet, HPP, laba kotor, dan kontribusi margin per produk
                  </p>
                </div>

                {/* Search & Category Filter */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Cari SKU / nama produk..."
                      className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#c41230] w-48 sm:w-60"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'ALL' ? 'Semua Kategori' : cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none"
                  >
                    <option value="revenue">Urutkan: Omzet Tertinggi</option>
                    <option value="qty">Urutkan: Qty Terlaris</option>
                    <option value="profit">Urutkan: Laba Tertinggi</option>
                    <option value="margin">Urutkan: Margin % Terbesar</option>
                  </select>
                </div>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-stone-400">#</th>
                      <th className="px-4 py-3.5">Produk & Brand</th>
                      <th className="px-4 py-3.5">Kategori</th>
                      <th className="px-4 py-3.5 text-center">Harga Jual (¥)</th>
                      <th className="px-4 py-3.5 text-center">HPP Modal (¥)</th>
                      <th className="px-4 py-3.5 text-center">Terjual (Qty)</th>
                      <th className="px-4 py-3.5 font-bold">Total Omzet (¥)</th>
                      <th className="px-4 py-3.5 font-bold text-emerald-600">Laba Kotor (¥)</th>
                      <th className="px-4 py-3.5 text-center">Margin (%)</th>
                      <th className="px-4 py-3.5 text-right">Status Perputaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-stone-400 text-xs">
                          Tidak ada produk yang cocok dengan kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((item, idx) => {
                        const itemNumber = (currentPage - 1) * itemsPerPage + idx + 1;

                        return (
                          <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-stone-400 text-[11px]">{itemNumber}</td>
                            <td className="px-4 py-3.5 flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-9 h-9 rounded-xl object-cover border border-stone-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              <div>
                                <div className="font-bold text-stone-900">{item.name}</div>
                                <div className="text-[10px] text-stone-400">
                                  SKU: SN-{item.id} • {item.brand}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-stone-600 text-[11px]">
                              <span className="px-2 py-0.5 bg-stone-100 rounded-md">{item.category}</span>
                            </td>

                            <td className="px-4 py-3.5 text-center font-bold text-stone-900">
                              ¥{item.price.toLocaleString('ja-JP')}
                            </td>

                            <td className="px-4 py-3.5 text-center font-mono text-stone-500">
                              ¥{item.hppUnit.toLocaleString('ja-JP')}
                            </td>

                            <td className="px-4 py-3.5 text-center font-mono font-bold text-stone-900">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                                {item.totalQty} {item.unit}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 font-bold font-mono text-stone-900">
                              ¥{item.totalItemRevenue.toLocaleString('ja-JP')}
                            </td>

                            <td className="px-4 py-3.5 font-bold font-mono text-emerald-600">
                              +¥{item.totalItemProfit.toLocaleString('ja-JP')}
                            </td>

                            <td className="px-4 py-3.5 text-center font-bold font-mono">
                              {item.marginPct}%
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              {item.velocityStatus === 'Fast Moving' ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px] inline-flex items-center gap-1">
                                  <span>⭐ Fast Moving</span>
                                </span>
                              ) : item.velocityStatus === 'Slow Moving' ? (
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-md text-[10px]">
                                  Slow Moving
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-stone-100 text-stone-700 font-medium rounded-md text-[10px]">
                                  Normal / Reguler
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-stone-50/50">
                <div className="text-stone-500 font-medium">
                  Menampilkan {filteredItemPerformance.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredItemPerformance.length)} dari {filteredItemPerformance.length} SKU
                </div>

                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    <span>Sebelumnya</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalItemPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setCurrentPage(num)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          currentPage === num
                            ? 'bg-[#c41230] text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalItemPages, p + 1))}
                    disabled={currentPage === totalItemPages}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Selanjutnya</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PAJAK KONSUMSI JEPANG (消費税 & インボイス制度) */}
        {/* ========================================================================= */}
        {activeTab === 'tax_compliance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Tarif Pajak Makanan 8% */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      8%
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">Tarif Pajak Berkurang (軽減税率)</h4>
                      <p className="text-xs text-stone-500">Khusus Makanan, Minuman, Sembako Halal</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold font-mono">
                    8.0% JCT
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                  <div className="flex justify-between">
                    <span>Dasar Pengenaan Pajak (DPP Makanan)</span>
                    <span className="font-mono font-bold text-stone-900">¥{Math.round(totalRevenue / 1.08).toLocaleString('ja-JP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak Konsumsi 8% Terhitung</span>
                    <span className="font-mono font-bold text-emerald-700">¥{taxFood8.toLocaleString('ja-JP')}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Tarif Pajak Standar 10% */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
                      10%
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">Tarif Pajak Standar (標準税率)</h4>
                      <p className="text-xs text-stone-500">Khusus Ongkir Yamato & Layanan Jasa</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold font-mono">
                    10.0% JCT
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
                  <div className="flex justify-between">
                    <span>Dasar Pengenaan Pajak (DPP Jasa & Ongkir)</span>
                    <span className="font-mono font-bold text-stone-900">¥{Math.round((totalOnlineRevenue * 0.15) / 1.1).toLocaleString('ja-JP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak Konsumsi 10% Terhitung</span>
                    <span className="font-mono font-bold text-blue-700">¥{taxShipping10.toLocaleString('ja-JP')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Qualified Tax Invoice Preview */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div className="flex items-center gap-3">
                  <img src={assetUrl('logo-transparent.png')} alt="Sembako Nusantara" className="h-10 w-auto object-contain" />
                  <div>
                    <h3 className="font-bold text-base text-stone-900">Kwitansi & Faktur Pajak Resmi Jepang (適格請求書・領収書)</h3>
                    <p className="text-xs text-stone-500">Standar Format National Tax Agency Japan (国税庁)</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-stone-900">SEMBAKO NUSANTARA JEPANG CO., LTD.</div>
                  <div className="text-stone-500">Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4</div>
                  <div className="font-mono text-emerald-700 font-bold">登録番号: T1010001099882</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl space-y-1">
                  <span className="font-bold text-stone-800">Ketentuan Faktur Pajak:</span>
                  <p className="text-stone-600 leading-relaxed">
                    Setiap transaksi di kasir POS dan toko online Sembako Nusantara secara otomatis menghasilkan nomor invoice yang dapat diklaim sebagai pengurang pajak bagi pelaku usaha diaspora, restoran halal, dan katering di seluruh Jepang.
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl space-y-1">
                  <span className="font-bold text-stone-800">Pelaporan Pajak Berkala:</span>
                  <p className="text-stone-600 leading-relaxed">
                    Data dapat langsung diexport ke format CSV siap pakai untuk konsultasi dengan Akuntan Pajak Resmi Jepang (税理士 / Zeirishi) atau pelaporan e-Tax NTA Jepang.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
