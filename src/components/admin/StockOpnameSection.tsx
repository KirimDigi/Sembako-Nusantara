import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { StockOpnameSession, StockOpnameSessionItem } from '../../types';

export const StockOpnameSection: React.FC = () => {
  const { products, batchApplyStockOpname, updateProductStock } = useAdmin();
  const { language } = useLanguage();

  // Sub-tabs: 'manual' | 'bulk_import' | 'history'
  const [subTab, setSubTab] = useState<'manual' | 'bulk_import' | 'history'>('manual');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // =========================================================================
  // 1. STATS / KPI PERSEDIAAN
  // =========================================================================
  const totalSKUs = products.length;
  const totalSystemUnits = useMemo(() => products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0), [products]);
  const totalInventoryValuation = useMemo(() => {
    return products.reduce((acc, p) => {
      const cost = p.costPrice || Math.round(p.price * 0.65);
      return acc + (Number(p.stock) || 0) * cost;
    }, 0);
  }, [products]);

  // Saved audit history
  const [historyList, setHistoryList] = useState<StockOpnameSession[]>(() => {
    try {
      const saved = localStorage.getItem('sn_stock_opname_history_v1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const refreshHistory = () => {
    try {
      const saved = localStorage.getItem('sn_stock_opname_history_v1');
      if (saved) setHistoryList(JSON.parse(saved));
    } catch (e) {}
  };

  // =========================================================================
  // 2. MODE MANUAL: STATE & HANDLERS
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterDiscrepancyOnly, setFilterDiscrepancyOnly] = useState(false);

  // Draft inputs for physical stock { [productId]: { physicalStock: number, notes: string, touched: boolean } }
  const [manualDrafts, setManualDrafts] = useState<{ [id: string]: { physicalStock: number; notes: string; touched: boolean } }>(() => {
    const init: { [id: string]: { physicalStock: number; notes: string; touched: boolean } } = {};
    products.forEach((p) => {
      init[p.id] = { physicalStock: p.stock, notes: 'Audit Rutin Berkala', touched: false };
    });
    return init;
  });

  const handleStockInputChange = (productId: string, valStr: string) => {
    const parsed = valStr === '' ? 0 : Math.max(0, parseInt(valStr, 10) || 0);
    setManualDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { notes: 'Audit Rutin Berkala' }),
        physicalStock: parsed,
        touched: true
      }
    }));
  };

  const handleNotesChange = (productId: string, notes: string) => {
    setManualDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { physicalStock: 0 }),
        notes,
        touched: true
      }
    }));
  };

  const handleQuickStep = (productId: string, delta: number) => {
    setManualDrafts((prev) => {
      const curr = prev[productId]?.physicalStock ?? (products.find((p) => p.id === productId)?.stock || 0);
      const next = Math.max(0, curr + delta);
      return {
        ...prev,
        [productId]: {
          ...(prev[productId] || { notes: 'Audit Rutin Berkala' }),
          physicalStock: next,
          touched: true
        }
      };
    });
  };

  // Save single product adjustment
  const handleSaveSingleAdjustment = (product: (typeof products)[0]) => {
    const draft = manualDrafts[product.id];
    const physical = draft ? draft.physicalStock : product.stock;
    const delta = physical - product.stock;
    const notes = draft?.notes || 'Penyesuaian Fisik Manual';

    batchApplyStockOpname(
      [
        {
          productId: product.id,
          physicalStock: physical,
          notes
        }
      ],
      'Willy Pratama (Admin Toko)',
      `Stok Opname Tunggal: ${product.name}`
    );

    setManualDrafts((prev) => ({
      ...prev,
      [product.id]: { physicalStock: physical, notes, touched: false }
    }));

    refreshHistory();
    showToast(`Stok "${product.name}" berhasil disesuaikan menjadi ${physical} ${product.unit || 'Pcs'}. (Selisih: ${delta > 0 ? '+' : ''}${delta})`);
  };

  // Reset all drafts to match current system stock
  const handleResetDrafts = () => {
    const reset: { [id: string]: { physicalStock: number; notes: string; touched: boolean } } = {};
    products.forEach((p) => {
      reset[p.id] = { physicalStock: p.stock, notes: 'Audit Rutin Berkala', touched: false };
    });
    setManualDrafts(reset);
    showToast('Seluruh input fisik dikembalikan sama dengan stok sistem.');
  };

  // Save all modified drafts in bulk
  const modifiedProductsList = useMemo(() => {
    return products.filter((p) => {
      const draft = manualDrafts[p.id];
      if (!draft) return false;
      return draft.physicalStock !== p.stock;
    });
  }, [products, manualDrafts]);

  const handleSaveAllModified = () => {
    if (modifiedProductsList.length === 0) {
      showToast('Tidak ada produk yang memiliki perubahan selisih stok.');
      return;
    }

    const payload = modifiedProductsList.map((p) => {
      const draft = manualDrafts[p.id];
      return {
        productId: p.id,
        physicalStock: draft ? draft.physicalStock : p.stock,
        notes: draft?.notes || 'Penyesuaian Fisik Sesi Manual'
      };
    });

    const session = batchApplyStockOpname(
      payload,
      'Willy Pratama (Admin Toko)',
      `Sesi Stok Opname Manual (${payload.length} Item Berubah)`
    );

    refreshHistory();
    showToast(
      `Berhasil memperbarui ${session.totalItemsChecked} produk! (${session.itemsWithDiscrepancy} ada selisih, total ${session.totalDiscrepancyQty > 0 ? '+' : ''}${session.totalDiscrepancyQty} unit)`
    );
  };

  // Categories list for filter
  const categoriesList = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  // Filtered manual table items
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      const draft = manualDrafts[p.id];
      const hasDiscrepancy = draft ? draft.physicalStock !== p.stock : false;
      const matchDiscrepancy = !filterDiscrepancyOnly || hasDiscrepancy;

      return matchSearch && matchCategory && matchDiscrepancy;
    });
  }, [products, searchQuery, selectedCategory, filterDiscrepancyOnly, manualDrafts]);

  // =========================================================================
  // 3. MODE MASSAL (BULK IMPORT CSV): STATE & HANDLERS
  // =========================================================================
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<
    {
      productId: string;
      productName: string;
      category: string;
      systemStock: number;
      physicalStock: number;
      difference: number;
      costPrice: number;
      differenceValue: number;
      notes: string;
      matchStatus: 'MATCHED' | 'NOT_FOUND';
    }[]
  >([]);
  const [isParsing, setIsParsing] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    totalRows: number;
    matched: number;
    discrepant: number;
    netQtyDiff: number;
    netValDiff: number;
  } | null>(null);

  // Generate and download real CSV template with all current products
  const handleDownloadCsvTemplate = () => {
    const headers = ['id', 'sku', 'product_name', 'category', 'system_stock', 'physical_stock', 'notes'];
    const rows = products.map((p) => {
      const cleanName = `"${p.name.replace(/"/g, '""')}"`;
      return [
        p.id,
        p.id,
        cleanName,
        `"${p.category}"`,
        p.stock,
        p.stock, // Pre-filled so user can easily adjust discrepancies
        '"Audit Opname Rutin"'
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `template_stok_opname_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('File contoh format Stok Opname (.CSV) berhasil di-download.');
  };

  // Robust CSV parser function
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Detect delimiter (, or ;)
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') ? ';' : ',';

    // Parse header tokens
    const headers = headerLine.split(delimiter).map((h) => h.replace(/["'\r\n]/g, '').trim().toLowerCase());
    const idIdx = headers.findIndex((h) => h === 'id' || h === 'sku' || h === 'kode');
    const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('nama') || h.includes('produk'));
    const physIdx = headers.findIndex((h) => h.includes('physical') || h.includes('fisik') || h.includes('aktual') || h.includes('stok_fisik') || h === 'stock');
    const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('catatan') || h.includes('alasan') || h.includes('keterangan'));

    const prodIdMap = new Map<string, (typeof products)[0]>();
    const prodNameMap = new Map<string, (typeof products)[0]>();
    products.forEach((p) => {
      prodIdMap.set(p.id.toLowerCase(), p);
      prodNameMap.set(p.name.toLowerCase().trim(), p);
    });

    const results: typeof parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Tokenize respecting quotes
      const tokens: string[] = [];
      let inQuotes = false;
      let currToken = '';
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          tokens.push(currToken.trim());
          currToken = '';
        } else {
          currToken += char;
        }
      }
      tokens.push(currToken.trim());

      const rawId = idIdx >= 0 ? tokens[idIdx]?.replace(/["']/g, '').trim() : '';
      const rawName = nameIdx >= 0 ? tokens[nameIdx]?.replace(/["']/g, '').trim() : '';
      const rawPhys = physIdx >= 0 ? tokens[physIdx]?.replace(/["']/g, '').trim() : '';
      const rawNotes = notesIdx >= 0 ? tokens[notesIdx]?.replace(/["']/g, '').trim() : 'Audit Massal CSV';

      // Match product
      let matchedProd: (typeof products)[0] | undefined;
      if (rawId && prodIdMap.has(rawId.toLowerCase())) {
        matchedProd = prodIdMap.get(rawId.toLowerCase());
      } else if (rawName && prodNameMap.has(rawName.toLowerCase())) {
        matchedProd = prodNameMap.get(rawName.toLowerCase());
      }

      if (matchedProd) {
        const physicalStock = Math.max(0, parseInt(rawPhys, 10) || 0);
        const systemStock = matchedProd.stock;
        const difference = physicalStock - systemStock;
        const costPrice = matchedProd.costPrice || Math.round(matchedProd.price * 0.65);
        const differenceValue = difference * costPrice;

        results.push({
          productId: matchedProd.id,
          productName: matchedProd.name,
          category: matchedProd.category,
          systemStock,
          physicalStock,
          difference,
          costPrice,
          differenceValue,
          notes: rawNotes || (difference === 0 ? 'Sesuai' : 'Penyesuaian CSV'),
          matchStatus: 'MATCHED'
        });
      } else if (rawName || rawId) {
        results.push({
          productId: rawId || 'UNKNOWN',
          productName: rawName || 'Produk Tidak Ditemukan',
          category: '-',
          systemStock: 0,
          physicalStock: parseInt(rawPhys, 10) || 0,
          difference: 0,
          costPrice: 0,
          differenceValue: 0,
          notes: 'Item ini tidak terdaftar di sistem',
          matchStatus: 'NOT_FOUND'
        });
      }
    }

    return results;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvFileName(file.name);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSVText(text);
      setParsedRows(parsed);

      const matchedItems = parsed.filter((r) => r.matchStatus === 'MATCHED');
      const discrepantItems = matchedItems.filter((r) => r.difference !== 0);
      const netQty = discrepantItems.reduce((sum, r) => sum + r.difference, 0);
      const netVal = discrepantItems.reduce((sum, r) => sum + r.differenceValue, 0);

      setImportSummary({
        totalRows: parsed.length,
        matched: matchedItems.length,
        discrepant: discrepantItems.length,
        netQtyDiff: netQty,
        netValDiff: netVal
      });

      setIsParsing(false);
      showToast(`File "${file.name}" berhasil diproses! Ditemukan ${matchedItems.length} produk cocok.`);
    };

    reader.readAsText(file, 'UTF-8');
  };

  // Execute bulk import
  const handleApplyBulkImport = () => {
    const validRows = parsedRows.filter((r) => r.matchStatus === 'MATCHED');
    if (validRows.length === 0) {
      showToast('Tidak ada data produk yang cocok untuk diterapkan.');
      return;
    }

    const payload = validRows.map((r) => ({
      productId: r.productId,
      physicalStock: r.physicalStock,
      notes: r.notes || `Import File CSV: ${csvFileName}`
    }));

    const session = batchApplyStockOpname(
      payload,
      'Willy Pratama (Admin Toko)',
      `Stok Opname Massal CSV (${csvFileName})`
    );

    refreshHistory();
    setCsvFile(null);
    setCsvFileName('');
    setParsedRows([]);
    setImportSummary(null);

    showToast(
      `SUKSES 100%! Stok Opname Massal diterapkan untuk ${session.totalItemsChecked} produk (${session.itemsWithDiscrepancy} selisih disesuaikan)!`
    );
  };

  // =========================================================================
  // 4. MODAL DETAIL SESI AUDIT (HISTORY)
  // =========================================================================
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<StockOpnameSession | null>(null);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-stone-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-2xl shrink-0">
            <span className="material-symbols-outlined text-3xl">fact_check</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
                Menu Pengaturan: Modul Stok Opname
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Tersinkron 100% Real
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black mt-1">Stok Opname & Audit Fisik Persediaan</h2>
            <p className="text-xs text-stone-300 mt-0.5">
              Penyesuaian fisik inventori toko langsung terhubung ke stok POS Kasir, E-Commerce Pelanggan, dan Valuasi Neraca Keuangan.
            </p>
          </div>
        </div>

        {/* Quick Summary KPIs */}
        <div className="flex items-center gap-4 bg-stone-800/90 p-3 rounded-2xl border border-stone-700 w-full md:w-auto justify-between sm:justify-start">
          <div className="text-left">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Total SKU Aktif:</span>
            <span className="text-sm font-extrabold text-white">{totalSKUs} SKU</span>
          </div>
          <div className="h-7 w-px bg-stone-700"></div>
          <div className="text-left">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Stok Sistem:</span>
            <span className="text-sm font-extrabold text-emerald-400">{totalSystemUnits.toLocaleString()} Unit</span>
          </div>
          <div className="h-7 w-px bg-stone-700"></div>
          <div className="text-left">
            <span className="text-[10px] text-stone-400 block uppercase font-bold">Nilai Inventori:</span>
            <span className="text-sm font-extrabold text-amber-400">¥{totalInventoryValuation.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('manual')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'manual'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>1. Input Fisik Manual (Per Produk)</span>
            {modifiedProductsList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-black animate-pulse">
                {modifiedProductsList.length} diubah
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('bulk_import')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'bulk_import'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>2. Import Massal CSV (Bulk Excel)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
              100% Cepat
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              subTab === 'history'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">history</span>
            <span>3. Riwayat Sesi Audit</span>
            <span className="px-1.5 py-0.2 rounded-md bg-stone-200 text-stone-800 text-[10px] font-bold">
              {historyList.length}
            </span>
          </button>
        </div>

        {/* Action Button: Download Template CSV */}
        <button
          type="button"
          onClick={handleDownloadCsvTemplate}
          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ml-auto"
        >
          <span className="material-symbols-outlined text-base text-emerald-600">download</span>
          <span>Download Format Contoh File CSV (.csv)</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: MODE MANUAL (INPUT / KLIK PER PRODUK)                      */}
      {/* ===================================================================== */}
      {subTab === 'manual' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-stone-400 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Cari Nama Produk / SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-stone-900 outline-none focus:border-[#c41230]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 outline-none focus:border-[#c41230]"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'Semua Kategori' : cat}
                  </option>
                ))}
              </select>

              {/* Discrepancy Toggle */}
              <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                <input
                  type="checkbox"
                  checked={filterDiscrepancyOnly}
                  onChange={(e) => setFilterDiscrepancyOnly(e.target.checked)}
                  className="accent-[#c41230]"
                />
                <span>Hanya yang Ada Selisih Fisik</span>
              </label>
            </div>

            {/* Quick Batch Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={handleResetDrafts}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reset Semua ke Stok Sistem
              </button>

              <button
                type="button"
                disabled={modifiedProductsList.length === 0}
                onClick={handleSaveAllModified}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  modifiedProductsList.length > 0
                    ? 'bg-[#c41230] hover:bg-[#a00f27] text-white animate-pulse'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Terapkan Semua Perubahan ({modifiedProductsList.length} Item)</span>
              </button>
            </div>
          </div>

          {/* Manual Products Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/80 text-stone-700 font-extrabold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Info Produk (SKU / Nama)</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3 text-right">Harga Modal (HPP)</th>
                    <th className="py-3 px-3 text-center">Stok Sistem (Buku)</th>
                    <th className="py-3 px-3 text-center min-w-[150px]">Input Fisik (Aktual)</th>
                    <th className="py-3 px-3 text-center">Selisih</th>
                    <th className="py-3 px-3">Alasan / Catatan Selisih</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-400">
                        <span className="material-symbols-outlined text-3xl mb-1 block">search_off</span>
                        Tidak ada produk yang cocok dengan pencarian / filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const draft = manualDrafts[p.id] || { physicalStock: p.stock, notes: 'Audit Rutin Berkala', touched: false };
                      const diff = draft.physicalStock - p.stock;
                      const costPrice = p.costPrice || Math.round(p.price * 0.65);
                      const diffValue = diff * costPrice;
                      const isModified = draft.physicalStock !== p.stock;

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-stone-50/80 transition-colors ${
                            isModified ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          {/* Product Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-9 h-9 object-cover rounded-xl border border-stone-200 bg-stone-100 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/f5f5f5/999999?text=Item';
                                }}
                              />
                              <div>
                                <span className="font-extrabold text-stone-900 block line-clamp-1">{p.name}</span>
                                <span className="text-[10px] text-stone-400 font-mono">ID: {p.id} • {p.unit || 'Pcs'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-semibold">
                              {p.category}
                            </span>
                          </td>

                          {/* Cost Price */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-stone-600">
                            ¥{costPrice.toLocaleString()}
                          </td>

                          {/* System Stock */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-extrabold text-stone-900 px-2.5 py-1 bg-stone-100 rounded-lg text-sm">
                              {p.stock}
                            </span>
                          </td>

                          {/* Physical Stock Input with Quick Stepper */}
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuickStep(p.id, -1)}
                                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                value={draft.physicalStock}
                                onChange={(e) => handleStockInputChange(p.id, e.target.value)}
                                className={`w-18 text-center font-mono font-black text-sm py-1 rounded-xl border outline-none ${
                                  isModified
                                    ? 'border-amber-400 bg-amber-50 text-amber-900'
                                    : 'border-stone-300 bg-white text-stone-900 focus:border-[#c41230]'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleQuickStep(p.id, 1)}
                                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Difference Badge */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {diff === 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Cocok (0)
                              </span>
                            ) : diff > 0 ? (
                              <div className="text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 block">
                                  +{diff} Surplus
                                </span>
                                <span className="text-[10px] text-blue-600 font-mono block mt-0.5">
                                  +¥{diffValue.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <div className="text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 block">
                                  {diff} Selisih
                                </span>
                                <span className="text-[10px] text-rose-600 font-mono block mt-0.5">
                                  -¥{Math.abs(diffValue).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Notes / Reason Dropdown */}
                          <td className="py-3 px-3">
                            <select
                              value={draft.notes}
                              onChange={(e) => handleNotesChange(p.id, e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-[11px] font-medium text-stone-700 outline-none focus:border-[#c41230]"
                            >
                              <option value="Audit Rutin Berkala">Audit Rutin Berkala</option>
                              <option value="Barang Rusak / Kadaluarsa">Barang Rusak / Kadaluarsa</option>
                              <option value="Hilang / Selisih Kasir">Hilang / Selisih Kasir</option>
                              <option value="Kemasan Bocor / Tercecer">Kemasan Bocor / Tercecer</option>
                              <option value="Surplus Bonus Supplier">Surplus Bonus Supplier</option>
                              <option value="Penyesuaian Fisik Manual">Penyesuaian Fisik Lainnya</option>
                            </select>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleSaveSingleAdjustment(p)}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                                isModified
                                  ? 'bg-[#c41230] hover:bg-[#a00f27] text-white animate-pulse'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                              }`}
                            >
                              {isModified ? 'Terapkan' : 'Sesuai'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: MODE MASSAL / BULK IMPORT CSV                              */}
      {/* ===================================================================== */}
      {subTab === 'bulk_import' && (
        <div className="space-y-6">
          {/* Instructions & Template Card */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-sm border border-blue-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold border border-blue-400/30 uppercase">
                  Panduan Stok Opname Massal
                </span>
                <h3 className="text-lg font-black mt-1">Langkah Mudah Stok Opname via File CSV</h3>
                <p className="text-xs text-blue-100/90 mt-0.5 max-w-2xl">
                  Download format contoh file CSV yang sudah otomatis terisi seluruh data produk toko Anda. Buka di Excel atau Google Sheets, isi kolom <b>physical_stock</b> sesuai hasil hitungan di gudang, lalu upload kembali file tersebut ke sini.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="px-4 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-lg text-emerald-600">download</span>
                <span>Download Template CSV Resmi</span>
              </button>
            </div>

            {/* Checklist Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-800/80 text-xs">
              <div className="bg-blue-800/40 p-3 rounded-2xl border border-blue-700/50">
                <span className="font-extrabold text-blue-300 block mb-1">1. Download Template</span>
                File .CSV sudah berisi ID, Nama Produk, dan Stok Sistem saat ini.
              </div>
              <div className="bg-blue-800/40 p-3 rounded-2xl border border-blue-700/50">
                <span className="font-extrabold text-blue-300 block mb-1">2. Isi Kolom Fisik</span>
                Ketik angka stok fisik di kolom <b>physical_stock</b>. Kolom lain tidak perlu diubah.
              </div>
              <div className="bg-blue-800/40 p-3 rounded-2xl border border-blue-700/50">
                <span className="font-extrabold text-blue-300 block mb-1">3. Upload & Konfirmasi</span>
                Sistem akan memverifikasi selisih dan mengupdate stok 100% instan.
              </div>
            </div>
          </div>

          {/* File Upload Drag & Drop Zone */}
          <div className="bg-white rounded-3xl border-2 border-dashed border-stone-300 hover:border-blue-500 p-8 text-center transition-all bg-stone-50/50">
            <input
              type="file"
              id="so-csv-upload-input"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="so-csv-upload-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <div>
                <span className="text-sm font-extrabold text-stone-900 block">
                  {csvFileName ? `File Terpilih: ${csvFileName}` : 'Klik untuk Pilih File CSV Hasil Hitungan Stok'}
                </span>
                <span className="text-xs text-stone-400 mt-1 block">
                  Format file: .CSV (Mendukung pemisah koma atau titik koma dari Excel)
                </span>
              </div>
              <span className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs">
                {csvFileName ? 'Ganti File CSV' : 'Pilih File dari Komputer'}
              </span>
            </label>
          </div>

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-blue-600 animate-spin">refresh</span>
              <p className="text-xs font-bold text-stone-700">Sedang membaca dan memvalidasi data CSV...</p>
            </div>
          )}

          {/* Preview & Summary after Upload */}
          {importSummary && parsedRows.length > 0 && (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-6">
              {/* Summary Metrics */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                <div>
                  <h4 className="text-base font-black text-stone-900">Hasil Analisis File CSV</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Verifikasi selisih sebelum menekan tombol terapkan di bawah.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplyBulkImport}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer animate-pulse"
                >
                  <span className="material-symbols-outlined text-lg">done_all</span>
                  <span>Konfirmasi & Terapkan Hasil Stok Opname (100% Sukses)</span>
                </button>
              </div>

              {/* 4 Cards Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Baris di File:</span>
                  <span className="text-base font-extrabold text-stone-900">{importSummary.totalRows} Baris</span>
                </div>
                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Cocok di Sistem:</span>
                  <span className="text-base font-extrabold text-emerald-800">{importSummary.matched} SKU</span>
                </div>
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                  <span className="text-[10px] text-amber-700 uppercase font-bold block">Ada Selisih Fisik:</span>
                  <span className="text-base font-extrabold text-amber-900">{importSummary.discrepant} Produk</span>
                </div>
                <div className="bg-stone-900 text-white p-3.5 rounded-2xl shadow-xs">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Dampak Nilai Persediaan:</span>
                  <span className={`text-base font-extrabold ${importSummary.netValDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {importSummary.netValDiff >= 0 ? '+' : ''}¥{importSummary.netValDiff.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-extrabold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Nama Produk (File CSV)</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-center">Stok Sistem</th>
                      <th className="py-2.5 px-3 text-center">Stok Fisik Baru</th>
                      <th className="py-2.5 px-3 text-center">Selisih</th>
                      <th className="py-2.5 px-3 text-right">Selisih Nilai (¥)</th>
                      <th className="py-2.5 px-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {parsedRows.slice(0, 100).map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.matchStatus === 'NOT_FOUND'
                            ? 'bg-rose-50/50'
                            : row.difference !== 0
                            ? 'bg-amber-50/40'
                            : ''
                        }
                      >
                        <td className="py-2.5 px-3">
                          {row.matchStatus === 'MATCHED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              Cocok
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800">
                              Tidak Dikenal
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-stone-900">{row.productName}</td>
                        <td className="py-2.5 px-3 text-stone-500">{row.category}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{row.systemStock}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-extrabold text-blue-700">
                          {row.physicalStock}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          {row.difference === 0 ? (
                            <span className="text-emerald-600">0</span>
                          ) : row.difference > 0 ? (
                            <span className="text-blue-600">+{row.difference}</span>
                          ) : (
                            <span className="text-rose-600">{row.difference}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {row.differenceValue === 0 ? (
                            '¥0'
                          ) : (
                            <span className={row.differenceValue > 0 ? 'text-blue-600' : 'text-rose-600'}>
                              {row.differenceValue > 0 ? '+' : ''}¥{row.differenceValue.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-stone-500 text-[11px]">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: RIWAYAT SESI AUDIT STOK OPNAME                             */}
      {/* ===================================================================== */}
      {subTab === 'history' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-base font-black text-stone-900">Buku Riwayat Sesi Stok Opname</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Catatan historis seluruh audit fisik yang pernah dilakukan beserta PIC dan nominal selisihnya.
              </p>
            </div>
            <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-bold font-mono">
              Total {historyList.length} Sesi Audit
            </span>
          </div>

          {historyList.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <span className="material-symbols-outlined text-4xl mb-2 text-stone-300 block">inventory</span>
              <p className="text-xs font-bold text-stone-500">Belum ada riwayat sesi stok opname yang tercatat.</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Gunakan tab <b>Input Fisik Manual</b> atau <b>Import Massal CSV</b> untuk menjalankan sesi audit pertama Anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-extrabold text-[10px] uppercase border-b border-stone-200">
                    <th className="py-3 px-3">Kode Sesi Audit</th>
                    <th className="py-3 px-3">Tanggal & Waktu</th>
                    <th className="py-3 px-3">Petugas (PIC)</th>
                    <th className="py-3 px-3 text-center">Total SKU Dicek</th>
                    <th className="py-3 px-3 text-center">Item Selisih</th>
                    <th className="py-3 px-3 text-center">Selisih Fisik (Qty)</th>
                    <th className="py-3 px-3 text-right">Selisih Nilai (¥ JPY)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {historyList.map((sess) => (
                    <tr key={sess.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-stone-900">{sess.sessionCode}</td>
                      <td className="py-3 px-3 text-stone-600">{sess.date}</td>
                      <td className="py-3 px-3 font-medium text-stone-800">{sess.officerName}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{sess.totalItemsChecked}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {sess.itemsWithDiscrepancy}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {sess.totalDiscrepancyQty > 0 ? (
                          <span className="text-blue-600">+{sess.totalDiscrepancyQty}</span>
                        ) : sess.totalDiscrepancyQty < 0 ? (
                          <span className="text-rose-600">{sess.totalDiscrepancyQty}</span>
                        ) : (
                          <span className="text-stone-500">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-extrabold">
                        {sess.totalDiscrepancyValue > 0 ? (
                          <span className="text-blue-600">+¥{sess.totalDiscrepancyValue.toLocaleString()}</span>
                        ) : sess.totalDiscrepancyValue < 0 ? (
                          <span className="text-rose-600">-¥{Math.abs(sess.totalDiscrepancyValue).toLocaleString()}</span>
                        ) : (
                          <span className="text-stone-500">¥0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Selesai & Sinkron
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedSessionDetail(sess)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL RINCIAN SESI AUDIT                                              */}
      {/* ===================================================================== */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] text-blue-600 font-extrabold uppercase">Rincian Sesi Audit Fisik</span>
                <h3 className="text-lg font-black text-stone-900">{selectedSessionDetail.sessionCode}</h3>
                <span className="text-xs text-stone-500">
                  {selectedSessionDetail.date} • Petugas: {selectedSessionDetail.officerName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 border border-stone-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-extrabold text-[10px] uppercase">
                    <th className="py-2.5 px-3">Nama Produk</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-center">Stok Sistem</th>
                    <th className="py-2.5 px-3 text-center">Stok Fisik</th>
                    <th className="py-2.5 px-3 text-center">Selisih</th>
                    <th className="py-2.5 px-3 text-right">Selisih Nilai (¥)</th>
                    <th className="py-2.5 px-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedSessionDetail.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className={item.differenceQty !== 0 ? 'bg-amber-50/50' : ''}
                    >
                      <td className="py-2 px-3 font-bold text-stone-900">{item.productName}</td>
                      <td className="py-2 px-3 text-stone-500">{item.category}</td>
                      <td className="py-2 px-3 text-center font-mono">{item.systemStock}</td>
                      <td className="py-2 px-3 text-center font-mono font-extrabold">{item.physicalStock}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">
                        {item.differenceQty === 0 ? (
                          <span className="text-emerald-600">0</span>
                        ) : item.differenceQty > 0 ? (
                          <span className="text-blue-600">+{item.differenceQty}</span>
                        ) : (
                          <span className="text-rose-600">{item.differenceQty}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {item.differenceValue === 0 ? (
                          '¥0'
                        ) : (
                          <span className={item.differenceValue > 0 ? 'text-blue-600' : 'text-rose-600'}>
                            {item.differenceValue > 0 ? '+' : ''}¥{item.differenceValue.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-stone-500 text-[11px]">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
