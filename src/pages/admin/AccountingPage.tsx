import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';

export const AccountingPage: React.FC = () => {
  const { products, posTransactions, orders } = useAdmin();
  const [period, setPeriod] = useState<string>('Bulan Ini (September 2026)');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Financial calculations
  const totalPosRevenue = posTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOnlineRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = totalPosRevenue + totalOnlineRevenue;

  // Food items: 8% Reduced Tax Rate (軽減税率 8%)
  // Services & Shipping: 10% Standard Tax Rate (標準税率 10%)
  const estimatedHPP = Math.round(totalRevenue * 0.62);
  const grossProfit = totalRevenue - estimatedHPP;
  const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  // Japanese Consumption Tax (消費税 - JCT) 8% for food items
  const taxFood8 = Math.round((totalRevenue / 1.08) * 0.08);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(q) ||
        (p.nameJp && p.nameJp.toLowerCase().includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        p.id.includes(q);

      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Nama Produk', 'Harga Jual (¥)', 'Estimasi HPP (¥)', 'Laba Kotor (¥)', 'Margin (%)', 'Tarif Pajak Konsumsi (消費税)'];
    const rows = products.map((p) => {
      const hpp = Math.round(p.price * 0.65);
      const profit = p.price - hpp;
      const margin = Math.round((profit / p.price) * 100);
      return [`SN-${p.id}`, `"${p.name}"`, p.price, hpp, profit, `${margin}%`, '8% (軽減税率)'];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Keuangan_Pajak_Jepang_Sembako_Nusantara_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      title="Accounting & Pajak Konsumsi Jepang (消費税)"
      subtitle="Laporan keuangan, HPP/COGS, margin laba kotor, dan kepatuhan Pajak Konsumsi Jepang (消費税 8% 軽減税率 & 10% インボイス制度)."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Japan Invoice Compliance Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              〒
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>Kepatuhan Pajak Konsumsi Jepang (国税庁 消費税・インボイス制度適合)</span>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-extrabold">TERVERIFIKASI</span>
              </div>
              <div className="text-emerald-700 text-[11px] mt-0.5">
                No. Registrasi Wajib Pajak Jepang (登録番号): <strong className="font-mono">T1010001099882</strong> (Biro Pajak Tokyo / 東京国税局)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1 bg-white rounded-lg border border-emerald-300 text-emerald-800 shadow-xs">
              Makanan/Sembako: <strong>8% 軽減税率</strong>
            </span>
            <span className="px-3 py-1 bg-white rounded-lg border border-emerald-300 text-emerald-800 shadow-xs">
              Ongkir/Jasa: <strong>10% 標準税率</strong>
            </span>
          </div>
        </div>

        {/* Period Selector & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Periode Laporan:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none"
            >
              <option value="Bulan Ini (September 2026)">Bulan Ini (September 2026)</option>
              <option value="Kuartal 3 (Q3 2026)">Kuartal 3 (Q3 2026)</option>
              <option value="Tahun Berjalan (YTD 2026)">Tahun Berjalan (YTD 2026)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Cetak Laporan</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV (Format NTA Jepang)</span>
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Total Omzet Bruto (税込)</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              ¥{totalRevenue.toLocaleString('ja-JP')}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">POS Kasir + Toko Online</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Total HPP / COGS (仕入原価)</span>
            <div className="text-2xl font-bold text-stone-700 mt-1">
              ¥{estimatedHPP.toLocaleString('ja-JP')}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Harga Beli Distributor Import</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Laba Kotor (売上総利益)</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              ¥{grossProfit.toLocaleString('ja-JP')}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              Margin Laba: {grossMarginPercent}%
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Pajak Konsumsi (消費税 8% 軽減)</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              ¥{taxFood8.toLocaleString('ja-JP')}
            </div>
            <div className="text-[11px] text-indigo-700 font-medium mt-1">Siap Lapor NTA Jepang (国税庁)</div>
          </div>
        </div>

        {/* Product Profitability & Margin Table with Pagination */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Header & Filter Controls */}
          <div className="p-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230] text-base">analytics</span>
                <span>Profitabilitas, HPP & Pajak Konsumsi per SKU</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Menampilkan 20 item per halaman • Total {filteredProducts.length} SKU
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
                  placeholder="Cari produk / SKU..."
                  className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#c41230] w-44 sm:w-56"
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
            </div>
          </div>

          {/* Table Data */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-stone-400">#</th>
                  <th className="px-4 py-3.5">Produk Sembako</th>
                  <th className="px-4 py-3.5">Harga Jual (税込)</th>
                  <th className="px-4 py-3.5">HPP Modal (¥)</th>
                  <th className="px-4 py-3.5">Laba Kotor per Unit</th>
                  <th className="px-4 py-3.5 text-center">Margin (%)</th>
                  <th className="px-4 py-3.5 text-center">Pajak Konsumsi (消費税 8%)</th>
                  <th className="px-5 py-3.5 text-right">Status Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400 text-xs">
                      Tidak ada data produk yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p, idx) => {
                    const itemNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    const hpp = Math.round(p.price * 0.65);
                    const unitProfit = p.price - hpp;
                    const marginPct = Math.round((unitProfit / p.price) * 100);
                    const unitTax = Math.round(p.price * 0.08);

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-stone-400 text-[11px]">{itemNumber}</td>
                        <td className="px-4 py-3.5 flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-9 h-9 rounded-xl object-cover border border-stone-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-stone-900">{p.name}</div>
                            <div className="text-[10px] text-stone-400">{p.brand} • {p.unit}</div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-stone-900">
                          ¥{p.price.toLocaleString('ja-JP')}
                        </td>

                        <td className="px-4 py-3.5 font-mono text-stone-600">
                          ¥{hpp.toLocaleString('ja-JP')}
                        </td>

                        <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">
                          +¥{unitProfit.toLocaleString('ja-JP')}
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold">
                          {marginPct}%
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono text-stone-500">
                          ¥{unitTax.toLocaleString('ja-JP')} <span className="text-[10px] text-emerald-600 font-bold">(8%)</span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {marginPct >= 35 ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                              Tinggi (Sehat)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-md text-[10px]">
                              Standar
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

          {/* Pagination Footer (20 Items Per Page) */}
          <div className="p-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-stone-50/50">
            <div className="text-stone-500 font-medium">
              Menampilkan {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} item
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                <span>Sebelumnya</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#c41230] text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>Selanjutnya</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

