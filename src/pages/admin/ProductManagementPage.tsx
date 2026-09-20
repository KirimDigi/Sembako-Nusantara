import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';

export const ProductManagementPage: React.FC = () => {
  const { products, addNewProduct, updateProduct, deleteProduct, updateProductStock } = useAdmin();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickStockTarget, setQuickStockTarget] = useState<{ id: string; name: string; current: number } | null>(null);
  const [quickStockDelta, setQuickStockDelta] = useState<number>(10);
  const [quickImageTarget, setQuickImageTarget] = useState<{ id: string; name: string; currentUrl: string } | null>(null);
  const [quickImageUrlInput, setQuickImageUrlInput] = useState<string>('');
  const [inlineEditingImageId, setInlineEditingImageId] = useState<string | null>(null);
  const [inlineImageUrl, setInlineImageUrl] = useState<string>('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    nameJp: '',
    nameEn: '',
    category: 'Camilan & Kerupuk',
    categoryJp: 'スナック・お菓子',
    categoryEn: 'Snacks & Crackers',
    price: 499,
    priceTax: 539,
    originalPrice: 0,
    stock: 50,
    unit: '1 Pcs',
    unitJp: '1個',
    unitEn: '1 Pc',
    brand: 'Nusantara',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    description: '',
    descriptionJp: '',
    descriptionEn: '',
    isHalal: true,
    isFrozen: false
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(q) ||
        (p.nameJp && p.nameJp.toLowerCase().includes(q)) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        p.id.includes(q);

      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;

      let matchStock = true;
      if (stockFilter === 'IN_STOCK') matchStock = p.stock > 0;
      if (stockFilter === 'LOW_STOCK') matchStock = p.stock > 0 && p.stock < 10;
      if (stockFilter === 'OUT_OF_STOCK') matchStock = p.stock <= 0;

      return matchQuery && matchCat && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Paginated Products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // KPIs
  const totalSku = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryVal = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  // Handlers
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      nameJp: '',
      nameEn: '',
      category: 'Camilan & Kerupuk',
      categoryJp: 'スナック・お菓子',
      categoryEn: 'Snacks & Crackers',
      price: 499,
      priceTax: 539,
      originalPrice: 0,
      stock: 50,
      unit: '1 Pcs',
      unitJp: '1個',
      unitEn: '1 Pc',
      brand: 'Nusantara',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
      description: 'Produk asli Indonesia berkualitas tinggi, 100% Halal.',
      descriptionJp: '本場インドネシア直輸入のハラール認定商品です。',
      descriptionEn: 'Authentic imported Indonesian product. 100% Halal certified.',
      isHalal: true,
      isFrozen: false
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameJp: product.nameJp || '',
      nameEn: product.nameEn || '',
      category: product.category,
      categoryJp: product.categoryJp || '',
      categoryEn: product.categoryEn || '',
      price: product.price,
      priceTax: product.priceTax,
      originalPrice: product.originalPrice || 0,
      stock: product.stock,
      unit: product.unit,
      unitJp: product.unitJp,
      unitEn: product.unitEn,
      brand: product.brand,
      image: product.image,
      description: product.description,
      descriptionJp: product.descriptionJp,
      descriptionEn: product.descriptionEn,
      isHalal: product.isHalal,
      isFrozen: product.isFrozen || false
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newProd: Product = {
      id: String(Date.now()),
      name: formData.name,
      nameJp: formData.nameJp || formData.name,
      nameEn: formData.nameEn || formData.name,
      category: formData.category,
      categoryJp: formData.categoryJp || formData.category,
      categoryEn: formData.categoryEn || formData.category,
      price: Number(formData.price),
      priceTax: Number(formData.priceTax),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      rating: 5.0,
      reviewCount: 0,
      stock: Number(formData.stock),
      unit: formData.unit,
      unitJp: formData.unitJp || formData.unit,
      unitEn: formData.unitEn || formData.unit,
      brand: formData.brand || 'Nusantara',
      image: formData.image,
      description: formData.description,
      descriptionJp: formData.descriptionJp,
      descriptionEn: formData.descriptionEn,
      isHalal: formData.isHalal,
      isFrozen: formData.isFrozen
    };

    addNewProduct(newProd);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: formData.name,
      nameJp: formData.nameJp,
      nameEn: formData.nameEn,
      category: formData.category,
      price: Number(formData.price),
      priceTax: Number(formData.priceTax),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: Number(formData.stock),
      unit: formData.unit,
      brand: formData.brand,
      image: formData.image,
      description: formData.description,
      descriptionJp: formData.descriptionJp,
      descriptionEn: formData.descriptionEn,
      isHalal: formData.isHalal,
      isFrozen: formData.isFrozen
    });

    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus produk "${name}" dari sistem?`)) {
      deleteProduct(id);
    }
  };

  const handleQuickStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStockTarget) return;

    updateProductStock(
      quickStockTarget.id,
      quickStockDelta,
      'Penyesuaian Cepat Admin Master Produk',
      'ADJUSTMENT'
    );
    setQuickStockTarget(null);
  };

  const handleOpenQuickImageModal = (product: Product) => {
    setQuickImageTarget({
      id: product.id,
      name: product.name,
      currentUrl: product.image
    });
    setQuickImageUrlInput(product.image);
  };

  const handleQuickImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickImageTarget || !quickImageUrlInput.trim()) return;

    updateProduct(quickImageTarget.id, {
      image: quickImageUrlInput.trim()
    });

    setQuickImageTarget(null);
    setQuickImageUrlInput('');
  };

  const handleSaveInlineImage = (productId: string) => {
    if (!inlineImageUrl.trim()) {
      setInlineEditingImageId(null);
      return;
    }
    updateProduct(productId, {
      image: inlineImageUrl.trim()
    });
    setInlineEditingImageId(null);
    setInlineImageUrl('');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Name JP', 'Name EN', 'Category', 'Price Excl Tax', 'Price Incl Tax', 'Stock', 'Brand', 'Unit', 'Is Frozen'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.nameJp || '').replace(/"/g, '""')}"`,
      `"${(p.nameEn || '').replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price,
      p.priceTax,
      p.stock,
      `"${p.brand}"`,
      `"${p.unit}"`,
      p.isFrozen ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sembako_Nusantara_Products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title={t('prod_mgmt_title')} subtitle={t('prod_mgmt_desc')}>
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-700 text-xs font-bold">
            <span className="material-symbols-outlined text-lg text-[#c41230]">inventory_2</span>
            <span>Master Katalog & Stok ({products.length} SKU Aktif)</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>{t('admin_export_csv')}</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>{t('prod_add_new')}</span>
            </button>
          </div>
        </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
            <span>{t('prod_total_sku')}</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined text-base">format_list_bulleted</span>
          </div>
          <div className="text-2xl font-black text-stone-900">{totalSku} <span className="text-xs font-bold text-stone-400">SKU</span></div>
          <p className="text-[11px] text-emerald-600 font-medium">✓ 100% Siap Jual Online & POS</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
            <span>{t('prod_total_stock')}</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg material-symbols-outlined text-base">warehouse</span>
          </div>
          <div className="text-2xl font-black text-stone-900">{totalStockUnits.toLocaleString()} <span className="text-xs font-bold text-stone-400">Unit</span></div>
          <p className="text-[11px] text-stone-500">Tersedia di Gudang Tokyo & Osaka</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
            <span>{t('prod_total_value')}</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg material-symbols-outlined text-base">payments</span>
          </div>
          <div className="text-2xl font-black text-stone-900">¥{totalInventoryVal.toLocaleString()}</div>
          <p className="text-[11px] text-stone-500">Estimasi Nilai Ritel Gabungan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
            <span>{t('prod_low_stock')}</span>
            <span className="p-1.5 bg-red-50 text-[#c41230] rounded-lg material-symbols-outlined text-base">warning</span>
          </div>
          <div className={`text-2xl font-black ${lowStockCount > 0 ? 'text-[#c41230]' : 'text-stone-900'}`}>
            {lowStockCount} <span className="text-xs font-bold text-stone-400">Item</span>
          </div>
          <p className="text-[11px] text-stone-500">Perlu Buat PO Supplier</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-stone-400 text-lg">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('prod_search_ph')}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#c41230]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 text-xs">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
          >
            <option value="ALL">Semua Kategori ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({products.filter((p) => p.category === cat).length})
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
          >
            <option value="ALL">Semua Status Stok</option>
            <option value="IN_STOCK">Stok Tersedia (&gt; 0)</option>
            <option value="LOW_STOCK">Stok Kritis (&lt; 10)</option>
            <option value="OUT_OF_STOCK">Habis (0)</option>
          </select>

          {/* View Toggle */}
          <div className="flex border border-stone-200 rounded-xl p-0.5 bg-stone-50">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg text-xs flex items-center justify-center transition-all ${
                viewMode === 'TABLE' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-600'
              }`}
              title="Table View"
            >
              <span className="material-symbols-outlined text-base">table_rows</span>
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg text-xs flex items-center justify-center transition-all ${
                viewMode === 'GRID' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-600'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === 'TABLE' ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">{t('prod_col_item')}</th>
                  <th className="py-3 px-4 min-w-[220px]">URL Image Address (Ganti Gambar)</th>
                  <th className="py-3 px-4">{t('prod_col_cat')}</th>
                  <th className="py-3 px-4 text-right">{t('prod_col_price')}</th>
                  <th className="py-3 px-4 text-center">{t('prod_col_stock')}</th>
                  <th className="py-3 px-4 text-center">{t('prod_col_status')}</th>
                  <th className="py-3 px-4 text-center">{t('prod_col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {paginatedProducts.map((p, idx) => {
                  const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isLow = p.stock > 0 && p.stock < 10;
                  const isOut = p.stock <= 0;
                  const isEditingInline = inlineEditingImageId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">{itemIndex}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => handleOpenQuickImageModal(p)}
                            className="relative group cursor-pointer shrink-0"
                            title="Klik untuk Ganti URL Gambar Cepat"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-100 group-hover:opacity-75 transition-opacity"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </div>
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <div className="font-bold text-stone-900 truncate">
                              {language === 'JP' ? p.nameJp || p.name : language === 'EN' ? p.nameEn || p.name : p.name}
                            </div>
                            <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                              <span className="font-mono">ID: {p.id}</span>
                              <span>•</span>
                              <span className="font-semibold text-stone-600">{p.brand}</span>
                              <span>•</span>
                              <span>{p.unit}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* URL Image Address Column */}
                      <td className="py-3 px-4">
                        {isEditingInline ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="url"
                              value={inlineImageUrl}
                              onChange={(e) => setInlineImageUrl(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveInlineImage(p.id);
                                }
                                if (e.key === 'Escape') {
                                  setInlineEditingImageId(null);
                                }
                              }}
                              placeholder="Paste URL gambar baru..."
                              autoFocus
                              className="w-full px-2.5 py-1 text-xs bg-white border-2 border-[#c41230] rounded-lg font-mono focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveInlineImage(p.id)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                              title="Simpan Gambar"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                            <button
                              onClick={() => setInlineEditingImageId(null)}
                              className="p-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg cursor-pointer"
                              title="Batal"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 max-w-[260px] bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1">
                            <span
                              className="text-[11px] font-mono text-stone-600 truncate cursor-pointer hover:text-[#c41230]"
                              onClick={() => {
                                setInlineEditingImageId(p.id);
                                setInlineImageUrl(p.image);
                              }}
                              title={p.image}
                            >
                              {p.image}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setInlineEditingImageId(p.id);
                                  setInlineImageUrl(p.image);
                                }}
                                className="p-1 text-stone-400 hover:text-[#c41230] hover:bg-stone-100 rounded transition-colors cursor-pointer"
                                title="Edit URL Gambar Langsung"
                              >
                                <span className="material-symbols-outlined text-[13px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleOpenQuickImageModal(p)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                title="Buka Pop-up Live Preview & Ganti Gambar"
                              >
                                <span className="material-symbols-outlined text-[13px]">image</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-700 font-medium rounded-lg text-[11px] whitespace-nowrap">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-black text-stone-900 text-sm">¥{p.priceTax.toLocaleString()}</div>
                        <div className="text-[10px] text-stone-400">¥{p.price.toLocaleString()} + Pajak</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setQuickStockTarget({ id: p.id, name: p.name, current: p.stock });
                              setQuickStockDelta(10);
                            }}
                            className={`px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-1 hover:opacity-80 transition-opacity ${
                              isOut
                                ? 'bg-red-100 text-[#c41230]'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span>{p.stock}</span>
                            <span className="material-symbols-outlined text-[12px]">edit</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {p.isHalal && (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                              HALAL
                            </span>
                          )}
                          {p.isFrozen && (
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                              FROZEN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg transition-colors cursor-pointer"
                            title={t('prod_edit')}
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                            title={t('prod_delete')}
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
            <div>
              Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-bold"
              >
                &larr; Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg font-bold transition-all ${
                    currentPage === i + 1 ? 'bg-[#c41230] text-white' : 'bg-white border border-stone-200 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-bold"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-100">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      {p.isFrozen && (
                        <span className="px-2 py-0.5 bg-blue-600/90 text-white font-bold text-[10px] rounded-md shadow-xs">
                          ❄️ FROZEN
                        </span>
                      )}
                      {p.isHalal && (
                        <span className="px-2 py-0.5 bg-emerald-600/90 text-white font-bold text-[10px] rounded-md shadow-xs">
                          HALAL
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white font-bold text-[10px] rounded-md">
                      Stok: {p.stock}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase">{p.category}</span>
                    <h3 className="font-bold text-xs text-stone-900 line-clamp-2 mt-0.5">
                      {language === 'JP' ? p.nameJp || p.name : language === 'EN' ? p.nameEn || p.name : p.name}
                    </h3>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-stone-900">¥{p.priceTax.toLocaleString()}</div>
                    <div className="text-[10px] text-stone-400">{p.unit}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-2 hover:bg-stone-100 text-stone-700 rounded-lg text-xs"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg text-xs"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grid Pagination */}
          <div className="mt-6 flex justify-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                  currentPage === i + 1 ? 'bg-[#c41230] text-white' : 'bg-white border border-stone-200 hover:bg-stone-100 text-stone-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Tambah Produk Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">add_box</span>
                <span>{t('prod_add_new')}</span>
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_name_id')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="mis. Kerupuk Udang Finna 500g"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_name_jp')}</label>
                  <input
                    type="text"
                    value={formData.nameJp}
                    onChange={(e) => setFormData({ ...formData, nameJp: e.target.value })}
                    placeholder="商品名 (日本語)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_name_en')}</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Product Name (English)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_brand_label')}</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="mis. Indofood / ABC / Nusantara"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_col_cat')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_price_raw')} *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setFormData({
                        ...formData,
                        price: p,
                        priceTax: Math.round(p * 1.08)
                      });
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Harga Jual + Pajak (税込)</label>
                  <input
                    type="number"
                    value={formData.priceTax}
                    onChange={(e) => setFormData({ ...formData, priceTax: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl font-bold text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_stock_count')} *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_unit_label')}</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="1 Pcs / 500g / 1 Box"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_image_url')}</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHalal}
                    onChange={(e) => setFormData({ ...formData, isHalal: e.target.checked })}
                    className="rounded text-[#c41230]"
                  />
                  <span className="font-bold text-stone-800">{t('prod_is_halal')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFrozen}
                    onChange={(e) => setFormData({ ...formData, isFrozen: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-bold text-stone-800">{t('prod_is_frozen')}</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
                >
                  {t('prod_cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold shadow-sm"
                >
                  {t('prod_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Produk */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">edit_note</span>
                <span>Edit Produk: {editingProduct.name}</span>
              </h2>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3 space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_name_id')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_name_jp')}</label>
                  <input
                    type="text"
                    value={formData.nameJp}
                    onChange={(e) => setFormData({ ...formData, nameJp: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_name_en')}</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_brand_label')}</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_col_cat')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_price_raw')} *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setFormData({
                        ...formData,
                        price: p,
                        priceTax: Math.round(p * 1.08)
                      });
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Harga Jual + Pajak (税込)</label>
                  <input
                    type="number"
                    value={formData.priceTax}
                    onChange={(e) => setFormData({ ...formData, priceTax: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_stock_count')} *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_unit_label')}</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">{t('prod_image_url')}</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHalal}
                    onChange={(e) => setFormData({ ...formData, isHalal: e.target.checked })}
                    className="rounded text-[#c41230]"
                  />
                  <span className="font-bold text-stone-800">{t('prod_is_halal')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFrozen}
                    onChange={(e) => setFormData({ ...formData, isFrozen: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span className="font-bold text-stone-800">{t('prod_is_frozen')}</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
                >
                  {t('prod_cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  {t('prod_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Stock Adjustment */}
      {quickStockTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              📦
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Update Stok Cepat</h3>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{quickStockTarget.name}</p>
              <p className="text-xs font-bold text-stone-700 mt-1">Stok Saat Ini: {quickStockTarget.current} Unit</p>
            </div>

            <form onSubmit={handleQuickStockSubmit} className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                {[-10, -5, +5, +10, +20].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setQuickStockDelta(delta)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      quickStockDelta === delta
                        ? 'bg-[#c41230] text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs">
                <span>Jumlah Perubahan:</span>
                <input
                  type="number"
                  value={quickStockDelta}
                  onChange={(e) => setQuickStockDelta(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-center font-bold bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl text-xs font-bold text-stone-700">
                Stok Baru: <span className="text-emerald-600 font-black">{Math.max(0, quickStockTarget.current + quickStockDelta)} Unit</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickStockTarget(null)}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold shadow-xs"
                >
                  Simpan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK IMAGE URL EDIT MODAL */}
      {quickImageTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230] text-xl">image</span>
                <h3 className="text-sm font-bold text-stone-900">Ganti URL Gambar Produk</h3>
              </div>
              <button
                onClick={() => setQuickImageTarget(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-stone-800 line-clamp-1">{quickImageTarget.name}</p>
              <p className="text-[11px] text-stone-400 font-mono">ID: {quickImageTarget.id}</p>
            </div>

            {/* Live Image Preview */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Live Preview Gambar:
              </span>
              <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden border border-stone-300 bg-white flex items-center justify-center shadow-xs">
                <img
                  src={quickImageUrlInput || 'https://via.placeholder.com/150'}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
            </div>

            <form onSubmit={handleQuickImageSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  URL Image Address:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={quickImageUrlInput}
                    onChange={(e) => setQuickImageUrlInput(e.target.value)}
                    placeholder="https://example.com/gambar-produk.jpg"
                    required
                    autoFocus
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) setQuickImageUrlInput(text);
                      } catch (e) {}
                    }}
                    className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                    title="Paste dari Clipboard"
                  >
                    Paste
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Bisa menggunakan link gambar dari internet, hosting CDN, Supabase, Google Photos, dsb.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickImageTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Simpan URL Gambar
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
