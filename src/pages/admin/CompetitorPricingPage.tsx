import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { VendorProductPriceComparison, VendorPurchaseQuote } from '../../types';
import { INITIAL_VENDOR_LIST, INITIAL_VENDOR_COMPARISONS } from '../../data/vendorPricingMockData';

export const CompetitorPricingPage: React.FC = () => {
  const { language } = useLanguage();

  // Load from localStorage or mock data
  const [comparisons, setComparisons] = useState<VendorProductPriceComparison[]>(() => {
    const saved = localStorage.getItem('sn_vendor_comparisons_v1');
    return saved ? JSON.parse(saved) : INITIAL_VENDOR_COMPARISONS;
  });

  const [vendorsList] = useState(INITIAL_VENDOR_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrend, setFilterTrend] = useState<'all' | 'up' | 'down' | 'stable' | 'high_savings'>('all');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedVendorId, setCopiedVendorId] = useState<string | null>(null);

  // Form State for Adding/Updating Vendor Price Record
  const [formProductId, setFormProductId] = useState(comparisons[0]?.productId || '1');
  const [formVendorName, setFormVendorName] = useState(vendorsList[0]?.name || '');
  const [formPrice, setFormPrice] = useState<number>(3000);
  const [formPrevPrice, setFormPrevPrice] = useState<number>(3000);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formInvoice, setFormInvoice] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Persist comparisons
  const updateComparisons = (newList: VendorProductPriceComparison[]) => {
    setComparisons(newList);
    localStorage.setItem('sn_vendor_comparisons_v1', JSON.stringify(newList));
  };

  // Dashboard Aggregates
  const totalVendorsCount = vendorsList.length;
  const priceUpCount = useMemo(() => comparisons.filter((c) => c.trend === 'up').length, [comparisons]);
  const priceDownCount = useMemo(() => comparisons.filter((c) => c.trend === 'down').length, [comparisons]);
  const priceStableCount = useMemo(() => comparisons.filter((c) => c.trend === 'stable').length, [comparisons]);

  // Total potential savings calculation
  const totalPotentialSavings = useMemo(() => {
    return comparisons.reduce((acc, curr) => acc + (curr.potentialSavings || 0), 0);
  }, [comparisons]);

  // Vendor with most lowest prices
  const bestVendorWinner = useMemo(() => {
    const scoreMap: Record<string, { count: number; name: string }> = {};
    comparisons.forEach((item) => {
      if (item.vendors.length > 0) {
        const sorted = [...item.vendors].sort((a, b) => a.price - b.price);
        const cheapest = sorted[0];
        if (!scoreMap[cheapest.vendorId]) {
          scoreMap[cheapest.vendorId] = { count: 0, name: cheapest.vendorName };
        }
        scoreMap[cheapest.vendorId].count += 1;
      }
    });

    let best = { name: 'PT Nusantara Direct Tokyo', count: 0 };
    Object.values(scoreMap).forEach((v) => {
      if (v.count > best.count) {
        best = v;
      }
    });
    return best;
  }, [comparisons]);

  // Filtered List
  const filteredList = useMemo(() => {
    return comparisons.filter((item) => {
      // Search
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendors.some((v) => v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter Trend
      if (filterTrend === 'up' && item.trend !== 'up') return false;
      if (filterTrend === 'down' && item.trend !== 'down') return false;
      if (filterTrend === 'stable' && item.trend !== 'stable') return false;
      if (filterTrend === 'high_savings' && item.potentialSavings < 400) return false;

      // Filter Specific Vendor
      if (selectedVendorFilter !== 'all') {
        const hasVendor = item.vendors.some((v) => v.vendorName === selectedVendorFilter);
        if (!hasVendor) return false;
      }

      return true;
    });
  }, [comparisons, searchQuery, filterTrend, selectedVendorFilter]);

  // Handle Add / Update Vendor Price
  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrice || formPrice <= 0) return;

    const prod = comparisons.find((c) => c.productId === formProductId);
    if (!prod) return;

    const existingVendorIndex = prod.vendors.findIndex((v) => v.vendorName === formVendorName);
    let updatedVendors: VendorPurchaseQuote[];

    const newQuote: VendorPurchaseQuote = {
      vendorId: `v-custom-${Date.now()}`,
      vendorName: formVendorName,
      price: Number(formPrice),
      previousPrice: Number(formPrevPrice || formPrice),
      lastPurchasedDate: formDate,
      invoiceNo: formInvoice || `INV/REC/${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      notes: formNotes || 'Dicatat via admin pembanding harga vendor'
    };

    if (existingVendorIndex >= 0) {
      updatedVendors = [...prod.vendors];
      updatedVendors[existingVendorIndex] = newQuote;
    } else {
      updatedVendors = [...prod.vendors, newQuote];
    }

    // Recalculate trend and savings
    const prices = updatedVendors.map((v) => v.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const cheapest = updatedVendors.find((v) => v.price === minP);

    // Determine trend
    let newTrend: 'up' | 'down' | 'stable' = 'stable';
    if (formPrice > formPrevPrice) newTrend = 'up';
    else if (formPrice < formPrevPrice) newTrend = 'down';

    const updatedComparison: VendorProductPriceComparison = {
      ...prod,
      vendors: updatedVendors,
      cheapestVendorId: cheapest?.vendorId || prod.cheapestVendorId,
      potentialSavings: maxP - minP,
      trend: newTrend,
      trendPercentage: formPrevPrice ? Number((((formPrice - formPrevPrice) / formPrevPrice) * 100).toFixed(1)) : 0
    };

    const nextComparisons = comparisons.map((c) => (c.productId === formProductId ? updatedComparison : c));
    updateComparisons(nextComparisons);
    setShowAddModal(false);
  };

  const handleCopyVendorInfo = (vendor: VendorPurchaseQuote, product: VendorProductPriceComparison) => {
    const text = `Halo ${vendor.vendorName}, Sembako Nusantara ingin membuat Purchase Order untuk produk: ${product.productName} (${product.unit}) dengan harga terakhir ¥${vendor.price.toLocaleString()} (Invoice: ${vendor.invoiceNo || '-'}). Mohon konfirmasi ketersediaan stok & jadwal pengiriman. Terima kasih!`;
    navigator.clipboard.writeText(text);
    setCopiedVendorId(`${product.id}-${vendor.vendorName}`);
    setTimeout(() => setCopiedVendorId(null), 3000);
  };

  return (
    <AdminLayout
      title={language === 'JP' ? '仕入先ベンダー価格比較' : language === 'EN' ? 'Vendor Price Comparison' : 'Pembanding Harga Vendor'}
      subtitle={
        language === 'JP'
          ? '日本国内の各仕入れ先・サプライヤーからの過去購入価格と見積もりを製品ごとに比較。最安値の仕入先を特定し利益率を最大化。'
          : language === 'EN'
          ? 'Compare historical purchase prices and supplier quotes per product in Japan to secure the best cost and maximize margins.'
          : 'Pantau & bandingkan riwayat harga beli produk dari berbagai vendor (Vendor X, Y, Z) di Jepang untuk mendapatkan modal termurah & margin terbaik.'
      }
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-stone-700/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-red-600/30 text-red-400 font-bold text-xs rounded-full border border-red-500/40 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">storefront</span>
                Sembako Nusantara Procurement
              </span>
              <span className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/30">
                Live Data
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-2 text-white">
              Kompilasi Harga Beli Antar-Vendor
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              Satu produk dapat pernah dibeli dari beberapa vendor berbeda. Tabel di bawah memetakan harga masing-masing vendor agar owner & tim purchasing selalu memilih penawaran paling hemat.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>+ Catat Harga Vendor Baru</span>
            </button>
          </div>
        </div>

        {/* 1. TOP DASHBOARD METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Metric 1: Total Vendor */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                Total Vendor
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg material-symbols-outlined">
                domain
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                {totalVendorsCount} <span className="text-sm font-semibold text-stone-500">Vendor</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Terdaftar aktif di Sembako Nusantara</p>
            </div>
          </div>

          {/* Metric 2: Produk Harga Naik */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-rose-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                Harga Naik ⚠️
              </span>
              <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg material-symbols-outlined">
                trending_up
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                {priceUpCount} <span className="text-sm font-semibold text-stone-500">Produk</span>
              </div>
              <p className="text-[11px] text-rose-600/80 mt-1">Perlu renegosiasi / cari vendor lain</p>
            </div>
          </div>

          {/* Metric 3: Produk Harga Turun */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                Harga Turun 📉
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg material-symbols-outlined">
                trending_down
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {priceDownCount} <span className="text-sm font-semibold text-stone-500">Produk</span>
              </div>
              <p className="text-[11px] text-emerald-600/80 mt-1">Modal lebih murah, margin naik</p>
            </div>
          </div>

          {/* Metric 4: Produk Harga Stabil */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                Harga Stabil ⚖️
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg material-symbols-outlined">
                balance
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-800">
                {priceStableCount} <span className="text-sm font-semibold text-stone-500">Produk</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">Biaya modal konsisten aman</p>
            </div>
          </div>

          {/* Metric 5: Potensi Penghematan */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-4 sm:p-5 rounded-2xl shadow-sm col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-amber-100 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                Potensi Hemat
              </span>
              <span className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center text-lg material-symbols-outlined">
                savings
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                ¥{totalPotentialSavings.toLocaleString()}
              </div>
              <p className="text-[11px] text-amber-100 mt-1">
                Hemat jika selalu pilih vendor termurah
              </p>
            </div>
          </div>
        </div>

        {/* Insight Highlight Bar: Vendor Paling Kompetitif */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-emerald-600 shrink-0">verified</span>
            <div>
              <span className="font-bold text-emerald-950">Vendor Paling Murah Terbanyak: </span>
              <span className="font-extrabold text-[#c41230]">{bestVendorWinner.name}</span>
              <span className="text-emerald-800"> (Memenangkan harga terendah pada {bestVendorWinner.count} produk SKU)</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-full text-[11px] shrink-0">
            Rekomendasi Utama PO
          </span>
        </div>

        {/* 2. FILTER & TOOLBAR */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-stone-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk (Indomie, Kecap Bango, Sambal...), kategori, atau vendor..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230] focus:bg-white"
              />
            </div>

            {/* Filter by Specific Vendor */}
            <div className="flex items-center gap-2">
              <select
                value={selectedVendorFilter}
                onChange={(e) => setSelectedVendorFilter(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-stone-700 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c41230]"
              >
                <option value="all">Semua Vendor ({vendorsList.length})</option>
                {vendorsList.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.city})
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  title="Tampilan Kartu Lengkap"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'card' ? 'bg-white shadow-xs text-[#c41230] font-bold' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg block">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Tampilan Tabel Komparasi"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white shadow-xs text-[#c41230] font-bold' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg block">table_rows</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            <button
              onClick={() => setFilterTrend('all')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                filterTrend === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Semua Produk ({comparisons.length})
            </button>
            <button
              onClick={() => setFilterTrend('up')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterTrend === 'up'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <span>Harga Naik</span>
              <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] leading-4 font-bold">{priceUpCount}</span>
            </button>
            <button
              onClick={() => setFilterTrend('down')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterTrend === 'down'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span>Harga Turun</span>
              <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] leading-4 font-bold">{priceDownCount}</span>
            </button>
            <button
              onClick={() => setFilterTrend('stable')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterTrend === 'stable'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <span>Harga Stabil</span>
              <span className="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] leading-4 font-bold">{priceStableCount}</span>
            </button>
            <button
              onClick={() => setFilterTrend('high_savings')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filterTrend === 'high_savings'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span>⭐ Selisih Tertinggi (&ge; ¥400)</span>
            </button>
          </div>
        </div>

        {/* 3. PRODUCT COMPARISON CONTENT */}
        {filteredList.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-200">
            <span className="material-symbols-outlined text-5xl text-stone-300 block mb-2">find_in_page</span>
            <h4 className="font-bold text-stone-800 text-base">Tidak ada data produk yang cocok</h4>
            <p className="text-stone-500 text-xs mt-1">Coba sesuaikan kata kunci pencarian atau ganti filter status di atas.</p>
          </div>
        ) : viewMode === 'card' ? (
          /* CARD VIEW (Friendly visual cards) */
          <div className="space-y-4">
            {filteredList.map((item) => {
              const sortedVendors = [...item.vendors].sort((a, b) => a.price - b.price);
              const cheapestVendor = sortedVendors[0];
              const highestVendor = sortedVendors[sortedVendors.length - 1];
              const priceGap = highestVendor.price - cheapestVendor.price;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Product Header Row */}
                  <div className="p-4 sm:p-5 bg-stone-50/80 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-[#c41230] font-bold text-lg shadow-2xs shrink-0">
                        📦
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-bold">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">Satuan: {item.unit}</span>
                          {item.trend === 'up' && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-1">
                              <span>⚠️ Rata-rata Naik +{item.trendPercentage}%</span>
                            </span>
                          )}
                          {item.trend === 'down' && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                              <span>📉 Rata-rata Turun {item.trendPercentage}%</span>
                            </span>
                          )}
                          {item.trend === 'stable' && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1">
                              <span>⚖️ Harga Relatif Stabil</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-stone-900 text-base sm:text-lg mt-0.5">
                          {item.productName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0 bg-white px-3.5 py-2 rounded-xl border border-stone-200">
                      <div>
                        <div className="text-[10px] text-stone-400 font-semibold uppercase">Harga Jual Web/POS</div>
                        <div className="font-extrabold text-stone-800 text-sm">¥{item.sellingPrice.toLocaleString()}</div>
                      </div>
                      <div className="h-6 w-px bg-stone-200"></div>
                      <div>
                        <div className="text-[10px] text-emerald-600 font-semibold uppercase">Modal Termurah</div>
                        <div className="font-extrabold text-[#c41230] text-sm">¥{cheapestVendor.price.toLocaleString()}</div>
                      </div>
                      <div className="h-6 w-px bg-stone-200"></div>
                      <div>
                        <div className="text-[10px] text-amber-600 font-semibold uppercase">Potensi Hemat</div>
                        <div className="font-extrabold text-amber-600 text-sm">¥{priceGap.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Comparison Grid (Side by Side) */}
                  <div className="p-4 sm:p-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center justify-between">
                      <span>Riwayat Pembelian di {item.vendors.length} Vendor:</span>
                      <span className="text-emerald-700 font-bold lowercase">
                        *hijau menandakan vendor termurah yang direkomendasikan
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {sortedVendors.map((v, idx) => {
                        const isCheapest = idx === 0;
                        const diffVsCheapest = v.price - cheapestVendor.price;
                        const marginPercent = Math.round(((item.sellingPrice - v.price) / item.sellingPrice) * 100);
                        const isCopied = copiedVendorId === `${item.id}-${v.vendorName}`;

                        return (
                          <div
                            key={v.vendorId}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                              isCheapest
                                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div>
                              {/* Vendor Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                                    <span>{v.vendorName}</span>
                                  </div>
                                  <div className="text-[11px] text-stone-500 mt-0.5">
                                    Terakhir beli: <strong>{v.lastPurchasedDate}</strong>
                                  </div>
                                </div>

                                {isCheapest ? (
                                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded-full shadow-2xs shrink-0 flex items-center gap-0.5">
                                    <span>🏆 Termurah</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-stone-200 text-stone-600 font-bold text-[10px] rounded-full shrink-0">
                                    +¥{diffVsCheapest.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {/* Price Display */}
                              <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-baseline justify-between">
                                <div>
                                  <span className="text-[10px] text-stone-500 block font-semibold uppercase">Harga Beli / Unit:</span>
                                  <span className={`text-xl font-extrabold ${isCheapest ? 'text-emerald-700' : 'text-stone-800'}`}>
                                    ¥{v.price.toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-stone-500 block font-semibold uppercase">Est. Margin:</span>
                                  <span className={`text-xs font-bold ${marginPercent >= 35 ? 'text-emerald-600' : 'text-stone-700'}`}>
                                    +{marginPercent}% untung
                                  </span>
                                </div>
                              </div>

                              {/* Details: Invoices, MOQ, Notes */}
                              <div className="mt-2.5 text-[11px] text-stone-600 space-y-1 bg-white/70 p-2 rounded-lg border border-stone-200/60">
                                {v.invoiceNo && (
                                  <div className="flex justify-between">
                                    <span className="text-stone-400">No. Ref Invoice:</span>
                                    <span className="font-mono font-medium text-stone-700">{v.invoiceNo}</span>
                                  </div>
                                )}
                                {v.minOrderQty && (
                                  <div className="flex justify-between">
                                    <span className="text-stone-400">Min. Order:</span>
                                    <span className="font-semibold text-stone-700">{v.minOrderQty}</span>
                                  </div>
                                )}
                                {v.notes && (
                                  <div className="text-[10px] text-stone-500 italic pt-0.5 line-clamp-1" title={v.notes}>
                                    📝 {v.notes}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-3 pt-2">
                              <button
                                type="button"
                                onClick={() => handleCopyVendorInfo(v, item)}
                                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                  isCheapest
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {isCopied ? 'check' : 'content_copy'}
                                </span>
                                <span>{isCopied ? 'Info PO Disalin!' : 'Salin Data PO'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW (Compact layout) */
          <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100/80 text-stone-600 border-b border-stone-200 uppercase font-bold text-[11px]">
                  <th className="py-3 px-4">Produk & Satuan</th>
                  <th className="py-3 px-4">Harga Jual</th>
                  <th className="py-3 px-4">Vendor Termurah 🏆</th>
                  <th className="py-3 px-4">Vendor Lainnya (Perbandingan)</th>
                  <th className="py-3 px-4">Selisih Modal</th>
                  <th className="py-3 px-4">Trend</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredList.map((item) => {
                  const sorted = [...item.vendors].sort((a, b) => a.price - b.price);
                  const cheapest = sorted[0];
                  const highest = sorted[sorted.length - 1];
                  const gap = highest.price - cheapest.price;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        <div>{item.productName}</div>
                        <div className="text-[11px] text-stone-400 font-normal">
                          {item.category} • {item.unit}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-800">
                        ¥{item.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-emerald-700 text-sm">
                          ¥{cheapest.price.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-stone-600">{cheapest.vendorName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {sorted.slice(1).map((v) => (
                            <div key={v.vendorId} className="flex items-center gap-2 text-[11px]">
                              <span className="font-mono text-stone-700">¥{v.price.toLocaleString()}</span>
                              <span className="text-stone-400">({v.vendorName})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">
                        ¥{gap.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.trend === 'up' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                            ▲ Naik
                          </span>
                        )}
                        {item.trend === 'down' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            ▼ Turun
                          </span>
                        )}
                        {item.trend === 'stable' && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                            ● Stabil
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopyVendorInfo(cheapest, item)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-[#c41230] hover:text-white rounded-lg text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Salin PO
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. MODAL: CATAT / TAMBAH HARGA VENDOR BARU */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 text-stone-900 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-stone-900">
                      Catat Riwayat Harga Vendor
                    </h3>
                    <p className="text-xs text-stone-500">Perbarui atau tambahkan perbandingan harga beli produk</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSavePrice} className="mt-4 space-y-4">
                {/* 1. Pilih Produk */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Pilih Produk:</label>
                  <select
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  >
                    {comparisons.map((c) => (
                      <option key={c.productId} value={c.productId}>
                        {c.productName} ({c.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Nama Vendor */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nama Vendor / Supplier:</label>
                  <input
                    type="text"
                    value={formVendorName}
                    onChange={(e) => setFormVendorName(e.target.value)}
                    list="vendors-datalist"
                    placeholder="Contoh: PT Nusantara Direct Tokyo atau vendor baru"
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                  <datalist id="vendors-datalist">
                    {vendorsList.map((v) => (
                      <option key={v.id} value={v.name} />
                    ))}
                  </datalist>
                </div>

                {/* 3. Harga Beli Terakhir & Harga Beli Sebelumnya */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Harga Beli Terbaru (¥):</label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      required
                      min={1}
                      placeholder="e.g. 2950"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#c41230] focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Harga Sebelumnya (¥):</label>
                    <input
                      type="number"
                      value={formPrevPrice}
                      onChange={(e) => setFormPrevPrice(Number(e.target.value))}
                      placeholder="e.g. 3100"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>
                </div>

                {/* 4. Tanggal & No Invoice */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Tanggal Pembelian:</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">No. Invoice / PO Ref:</label>
                    <input
                      type="text"
                      value={formInvoice}
                      onChange={(e) => setFormInvoice(e.target.value)}
                      placeholder="e.g. INV/2610-099"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>
                </div>

                {/* 5. Catatan Pembelian */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Catatan / Minimal Order:</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Contoh: Diskon bila beli min 10 dus, pengiriman 1 hari..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Simpan Perbandingan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
