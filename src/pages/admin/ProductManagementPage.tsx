import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import { parseMinQty } from '../../utils/pricing';
import { resolveProductImage, getPlaceholderImage } from '../../components/common/ProductImage';

export const ProductManagementPage: React.FC = () => {
  const { products, addNewProduct, updateProduct, deleteProduct, updateProductStock } = useAdmin();
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'NAME_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'STOCK_ASC' | 'STOCK_DESC'>('NAME_ASC');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickStockTarget, setQuickStockTarget] = useState<{ id: string; name: string; current: number } | null>(null);
  const [quickStockDelta, setQuickStockDelta] = useState<number>(10);
  const [quickImageTarget, setQuickImageTarget] = useState<{ id: string; name: string; currentUrl: string } | null>(null);
  const [quickImageUrlInput, setQuickImageUrlInput] = useState<string>('');
  const [inlineEditingImageId, setInlineEditingImageId] = useState<string | null>(null);
  const [inlineImageUrl, setInlineImageUrl] = useState<string>('');
  
  // Direct Inline Photo URL Editing states (Tanpa klik, langsung ketik/paste & tombol simpan)
  const [imageDrafts, setImageDrafts] = useState<Record<string, string>>({});
  const [savingImageIds, setSavingImageIds] = useState<Record<string, boolean>>({});
  const [savedImageSuccessIds, setSavedImageSuccessIds] = useState<Record<string, { success: boolean; message: string }>>({});

  // Inline Price & HPP Editing states
  const [inlineEditingHpp, setInlineEditingHpp] = useState<{ id: string; value: string } | null>(null);
  const [inlineEditingPrice, setInlineEditingPrice] = useState<{ id: string; value: string } | null>(null);

  // Bulk Wholesale Modal state
  const [bulkPriceTarget, setBulkPriceTarget] = useState<Product | null>(null);
  const [bulkFormData, setBulkFormData] = useState({
    tier1_qty: 6,
    tier1_price: 0,
    tier2_qty: 12,
    tier2_price: 0,
    tier3_qty: 24,
    tier3_price: 0
  });

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    nameJp: '',
    nameEn: '',
    category: 'Camilan & Kerupuk',
    categoryJp: 'スナック・お菓子',
    categoryEn: 'Snacks & Crackers',
    costPrice: 0,
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
    isFrozen: false,
    hasBulk: true,
    bulk_tier1_qty: 6,
    bulk_tier1_price: 0,
    bulk_tier2_qty: 12,
    bulk_tier2_price: 0,
    bulk_tier3_qty: 24,
    bulk_tier3_price: 0
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
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.id.includes(q);

      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;

      let matchStock = true;
      if (stockFilter === 'IN_STOCK') matchStock = p.stock > 0;
      if (stockFilter === 'LOW_STOCK') matchStock = p.stock > 0 && p.stock < 10;
      if (stockFilter === 'OUT_OF_STOCK') matchStock = p.stock <= 0;

      return matchQuery && matchCat && matchStock;
    }).sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
      if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name, 'id', { sensitivity: 'base' });
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      if (sortBy === 'STOCK_ASC') return a.stock - b.stock;
      if (sortBy === 'STOCK_DESC') return b.stock - a.stock;
      return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
    });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy]);

  // Paginated Products
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  // KPIs
  const totalSku = products.length;
  const pricedSkuCount = products.filter((p) => p.price > 0).length;
  const tbdSkuCount = products.filter((p) => p.price <= 0).length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryVal = products.reduce((sum, p) => sum + (p.price > 0 ? p.price * p.stock : 0), 0);
  const lowStockCount = products.filter((p) => p.price > 0 && p.stock < 10).length;

  // Handlers for Add / Edit
  const handleOpenAddModal = () => {
    const nextSkuNum = products.length + 1;
    const nextSku = `SN-${String(nextSkuNum).padStart(4, '0')}`;
    setFormData({
      sku: nextSku,
      name: '',
      nameJp: '',
      nameEn: '',
      category: 'Camilan & Kerupuk',
      categoryJp: 'スナック・お菓子',
      categoryEn: 'Snacks & Crackers',
      costPrice: 350,
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
      isFrozen: false,
      hasBulk: true,
      bulk_tier1_qty: 6,
      bulk_tier1_price: 470,
      bulk_tier2_qty: 12,
      bulk_tier2_price: 450,
      bulk_tier3_qty: 24,
      bulk_tier3_price: 420
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku || product.id,
      name: product.name,
      nameJp: product.nameJp || '',
      nameEn: product.nameEn || '',
      category: product.category,
      categoryJp: product.categoryJp || '',
      categoryEn: product.categoryEn || '',
      costPrice: product.costPrice || 0,
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
      isFrozen: product.isFrozen || false,
      hasBulk: Boolean(product.bulkPrices),
      bulk_tier1_qty: parseMinQty(product.bulkPrices?.tier1_qty, 6),
      bulk_tier1_price: product.bulkPrices?.tier1_price || Math.round(product.price * 0.95),
      bulk_tier2_qty: parseMinQty(product.bulkPrices?.tier2_qty, 12),
      bulk_tier2_price: product.bulkPrices?.tier2_price || Math.round(product.price * 0.9),
      bulk_tier3_qty: parseMinQty(product.bulkPrices?.tier3_qty, 24),
      bulk_tier3_price: product.bulkPrices?.tier3_price || Math.round(product.price * 0.85)
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newProd: Product = {
      id: formData.sku || String(Date.now()),
      sku: formData.sku,
      name: formData.name,
      nameJp: formData.nameJp || formData.name,
      nameEn: formData.nameEn || formData.name,
      category: formData.category,
      categoryJp: formData.categoryJp || formData.category,
      categoryEn: formData.categoryEn || formData.category,
      costPrice: Number(formData.costPrice) || undefined,
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
      isFrozen: formData.isFrozen,
      bulkPrices: formData.hasBulk
        ? {
            tier1_qty: Number(formData.bulk_tier1_qty) || 6,
            tier1_price: Number(formData.bulk_tier1_price) || Math.round(Number(formData.price) * 0.95),
            tier2_qty: Number(formData.bulk_tier2_qty) || 12,
            tier2_price: Number(formData.bulk_tier2_price) || Math.round(Number(formData.price) * 0.9),
            tier3_qty: Number(formData.bulk_tier3_qty) || 24,
            tier3_price: Number(formData.bulk_tier3_price) || Math.round(Number(formData.price) * 0.85)
          }
        : undefined
    };

    addNewProduct(newProd);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      sku: formData.sku,
      name: formData.name,
      nameJp: formData.nameJp,
      nameEn: formData.nameEn,
      category: formData.category,
      costPrice: Number(formData.costPrice),
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
      isFrozen: formData.isFrozen,
      bulkPrices: formData.hasBulk
        ? {
            tier1_qty: Number(formData.bulk_tier1_qty) || 6,
            tier1_price: Number(formData.bulk_tier1_price) || Math.round(Number(formData.price) * 0.95),
            tier2_qty: Number(formData.bulk_tier2_qty) || 12,
            tier2_price: Number(formData.bulk_tier2_price) || Math.round(Number(formData.price) * 0.9),
            tier3_qty: Number(formData.bulk_tier3_qty) || 24,
            tier3_price: Number(formData.bulk_tier3_price) || Math.round(Number(formData.price) * 0.85)
          }
        : undefined
    });

    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus produk "${name}" dari sistem?`)) {
      deleteProduct(id);
    }
  };

  // Inline HPP (Harga Pokok) Save
  const handleSaveInlineHpp = (productId: string) => {
    if (!inlineEditingHpp) return;
    const val = Number(inlineEditingHpp.value);
    if (!isNaN(val) && val >= 0) {
      updateProduct(productId, { costPrice: val });
    }
    setInlineEditingHpp(null);
  };

  // Inline Harga Jual (Retail) Save
  const handleSaveInlinePrice = (productId: string) => {
    if (!inlineEditingPrice) return;
    const val = Number(inlineEditingPrice.value);
    if (!isNaN(val) && val >= 0) {
      updateProduct(productId, {
        price: val,
        priceTax: Math.round(val * 1.08)
      });
    }
    setInlineEditingPrice(null);
  };

  // Quick Wholesale / Bulk Modal Open & Save
  const handleOpenBulkModal = (product: Product) => {
    setBulkPriceTarget(product);
    setBulkFormData({
      tier1_qty: parseMinQty(product.bulkPrices?.tier1_qty, 6),
      tier1_price: product.bulkPrices?.tier1_price || Math.round(product.price * 0.95),
      tier2_qty: parseMinQty(product.bulkPrices?.tier2_qty, 12),
      tier2_price: product.bulkPrices?.tier2_price || Math.round(product.price * 0.9),
      tier3_qty: parseMinQty(product.bulkPrices?.tier3_qty, 24),
      tier3_price: product.bulkPrices?.tier3_price || Math.round(product.price * 0.85)
    });
  };

  const handleSaveBulkModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkPriceTarget) return;

    updateProduct(bulkPriceTarget.id, {
      bulkPrices: {
        tier1_qty: Number(bulkFormData.tier1_qty),
        tier1_price: Number(bulkFormData.tier1_price),
        tier2_qty: Number(bulkFormData.tier2_qty),
        tier2_price: Number(bulkFormData.tier2_price),
        tier3_qty: Number(bulkFormData.tier3_qty),
        tier3_price: Number(bulkFormData.tier3_price)
      }
    });

    setBulkPriceTarget(null);
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

  // Direct Inline Photo URL Save & Reset (Tersinkronisasi otomatis ke Supabase Cloud & LocalStorage)
  const handleSaveDirectImage = async (productId: string, newUrl: string) => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    
    setSavingImageIds((prev) => ({ ...prev, [productId]: true }));

    const res = await updateProduct(productId, { image: trimmed });

    setSavingImageIds((prev) => ({ ...prev, [productId]: false }));
    
    // Clear draft for this product
    setImageDrafts((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });

    // Show temporary feedback indicator for 3.5 seconds
    const isCloudSuccess = res && typeof res === 'object' && res.success;
    const msg = isCloudSuccess
      ? 'URL Foto berhasil disimpan & sinkron ke Supabase Cloud!'
      : 'URL Foto tersimpan di Local Storage (Cloud Supabase offline)';

    setSavedImageSuccessIds((prev) => ({
      ...prev,
      [productId]: { success: true, message: msg }
    }));

    setTimeout(() => {
      setSavedImageSuccessIds((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }, 3500);
  };

  const handleResetDirectImage = (productId: string) => {
    setImageDrafts((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Name',
      'Brand',
      'Category',
      'Cost Price (HPP)',
      'Price Excl Tax',
      'Price Incl Tax',
      'Bulk 6-11',
      'Bulk 12-23',
      'Bulk 1 Dus',
      'Stock',
      'Unit',
      'Is Halal',
      'Is Frozen'
    ];
    const rows = products.map((p) => [
      p.sku || p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      p.costPrice || 0,
      p.price,
      p.priceTax,
      p.bulkPrices?.tier1_price || '',
      p.bulkPrices?.tier2_price || '',
      p.bulkPrices?.tier3_price || '',
      p.stock,
      `"${p.unit}"`,
      p.isHalal ? 'YES' : 'NO',
      p.isFrozen ? 'YES' : 'NO'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sembako_Nusantara_Master_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span>
              {language === 'JP'
                ? `商品マスター＆価格・在庫管理 (${products.length} SKU 有効)`
                : language === 'EN'
                ? `Product Master, Pricing & Inventory (${products.length} Active SKUs)`
                : `Master Produk, Harga & Stok (${products.length} SKU Aktif)`}
            </span>
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
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined text-base">
                format_list_bulleted
              </span>
            </div>
            <div className="text-2xl font-black text-stone-900">
              {totalSku} <span className="text-xs font-bold text-stone-400">SKU</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              ✓ {pricedSkuCount} Berharga Rilis • {tbdSkuCount} Draft/TBD
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
            <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
              <span>{t('prod_total_stock')}</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg material-symbols-outlined text-base">
                warehouse
              </span>
            </div>
            <div className="text-2xl font-black text-stone-900">
              {totalStockUnits.toLocaleString()} <span className="text-xs font-bold text-stone-400">Unit</span>
            </div>
            <p className="text-[11px] text-stone-500">
              {language === 'JP' ? '東京・大阪拠点倉庫' : language === 'EN' ? 'Tokyo & Osaka Hubs' : 'Gudang Tokyo & Osaka'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
            <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
              <span>{t('prod_inventory_value')}</span>
              <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg material-symbols-outlined text-base">
                payments
              </span>
            </div>
            <div className="text-2xl font-black text-stone-900">
              ¥{(totalInventoryVal / 10000).toFixed(1)} <span className="text-xs font-bold text-stone-400">万</span>
            </div>
            <p className="text-[11px] text-stone-400">¥{totalInventoryVal.toLocaleString()}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
            <div className="flex justify-between items-center text-xs text-stone-500 font-semibold">
              <span>{t('prod_low_stock')}</span>
              <span className="p-1.5 bg-red-50 text-[#c41230] rounded-lg material-symbols-outlined text-base">
                warning
              </span>
            </div>
            <div className="text-2xl font-black text-[#c41230]">
              {lowStockCount} <span className="text-xs font-bold text-stone-400">SKU</span>
            </div>
            <p className="text-[11px] text-stone-400">
              {language === 'JP' ? '10個未満の在庫' : language === 'EN' ? 'Stock < 10 units' : 'Stok di bawah 10'}
            </p>
          </div>
        </div>

        {/* Filters & Search Toolbar (Freeze / Sticky saat di-scroll) */}
        <div className="sticky top-[var(--admin-header-height,78px)] z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200/90 shadow-md space-y-3 transition-all">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  language === 'JP'
                    ? 'SKU (SN-0001)、商品名、ブランドで検索...'
                    : language === 'EN'
                    ? 'Search by SKU (SN-0001), product name, brand...'
                    : 'Cari berdasarkan SKU (SN-0001), nama item, merek...'
                }
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 focus:outline-none"
            >
              <option value="ALL">
                {language === 'JP' ? '全カテゴリー' : language === 'EN' ? 'All Categories' : 'Semua Kategori'}
              </option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="NAME_ASC">
                {language === 'JP' ? '🔤 商品名 (A-Z 昇順)' : language === 'EN' ? '🔤 Name (A-Z)' : '🔤 Nama (A-Z Abjad)'}
              </option>
              <option value="NAME_DESC">
                {language === 'JP' ? '🔤 商品名 (Z-A 降順)' : language === 'EN' ? '🔤 Name (Z-A)' : '🔤 Nama (Z-A)'}
              </option>
              <option value="PRICE_ASC">
                {language === 'JP' ? '💰 価格 (安い順)' : language === 'EN' ? '💰 Price (Low to High)' : '💰 Harga (Termurah)'}
              </option>
              <option value="PRICE_DESC">
                {language === 'JP' ? '💰 価格 (高い順)' : language === 'EN' ? '💰 Price (High to Low)' : '💰 Harga (Termahal)'}
              </option>
              <option value="STOCK_DESC">
                {language === 'JP' ? '📦 在庫 (多い順)' : language === 'EN' ? '📦 Stock (High to Low)' : '📦 Stok (Terbanyak)'}
              </option>
              <option value="STOCK_ASC">
                {language === 'JP' ? '📦 在庫 (少ない順)' : language === 'EN' ? '📦 Stock (Low to High)' : '📦 Stok (Tersedikit)'}
              </option>
            </select>

            {/* Stock Filter */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setStockFilter(filter);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    stockFilter === filter ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {filter === 'ALL'
                    ? language === 'JP'
                      ? 'すべて'
                      : language === 'EN'
                      ? 'All'
                      : 'Semua'
                    : filter === 'IN_STOCK'
                    ? language === 'JP'
                      ? '在庫あり'
                      : language === 'EN'
                      ? 'In Stock'
                      : 'Ada Stok'
                    : filter === 'LOW_STOCK'
                    ? language === 'JP'
                      ? '僅少'
                      : language === 'EN'
                      ? 'Low'
                      : 'Kritis'
                    : language === 'JP'
                    ? '品切'
                    : language === 'EN'
                    ? 'Out'
                    : 'Habis'}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0">
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
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-4 min-w-[220px]">Item / SKU / Merek</th>
                    <th className="py-3 px-3 min-w-[280px]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">image</span>
                        <span>Foto & URL</span>
                      </div>
                      <span className="text-[9px] text-stone-400 font-normal lowercase">input URL langsung & simpan</span>
                    </th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-4 text-right min-w-[150px] bg-amber-50/40 border-x border-amber-100">
                      <div className="flex items-center justify-end gap-1 text-amber-900">
                        <span className="material-symbols-outlined text-[13px]">payments</span>
                        <span>Harga Pokok (HPP)</span>
                      </div>
                      <span className="text-[9px] text-amber-700/80 font-normal lowercase">klik utk edit langsung</span>
                    </th>
                    <th className="py-3 px-4 text-right min-w-[170px] bg-emerald-50/40 border-r border-emerald-100">
                      <div className="flex items-center justify-end gap-1 text-emerald-900">
                        <span className="material-symbols-outlined text-[13px]">sell</span>
                        <span>Harga Jual (Retail)</span>
                      </div>
                      <span className="text-[9px] text-emerald-700/80 font-normal lowercase">kolom K + Margin</span>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[160px] bg-blue-50/30 border-r border-blue-100">
                      <div className="flex items-center justify-center gap-1 text-blue-900">
                        <span className="material-symbols-outlined text-[13px]">layers</span>
                        <span>Grosir (Bulk)</span>
                      </div>
                      <span className="text-[9px] text-blue-700/80 font-normal lowercase">tier 6+, 12+, 1 Dus</span>
                    </th>
                    <th className="py-3 px-3 text-center">Stok</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {paginatedProducts.map((p, idx) => {
                    const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                    const isLow = p.stock > 0 && p.stock < 10;
                    const isOut = p.stock <= 0;
                    const isEditingHpp = inlineEditingHpp?.id === p.id;
                    const isEditingPrice = inlineEditingPrice?.id === p.id;

                    // Direct Image URL values & states (Tanpa klik sebelumnya)
                    const draftUrl = imageDrafts[p.id];
                    const currentImageUrl = draftUrl !== undefined ? draftUrl : p.image;
                    const isImageChanged = draftUrl !== undefined && draftUrl.trim() !== p.image.trim();
                    const savedImageInfo = savedImageSuccessIds[p.id];

                    // Margin calculation
                    const hpp = p.costPrice || 0;
                    const marginYen = p.price - hpp;
                    const marginPercent = p.price > 0 && hpp > 0 ? Math.round((marginYen / p.price) * 100) : 0;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3 text-stone-400 font-mono text-[11px] text-center">{itemIndex}</td>

                        {/* Item & Brand & SKU */}
                        <td className="py-3 px-4">
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <div className="font-bold text-stone-900 text-xs">
                              {language === 'JP' ? p.nameJp || p.name : language === 'EN' ? p.nameEn || p.name : p.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="font-mono bg-stone-900 text-white font-bold px-1.5 py-0.5 rounded text-[10px] shadow-2xs">
                                {p.sku || p.id}
                              </span>
                              <span className="bg-[#c41230]/10 text-[#c41230] font-bold px-1.5 py-0.5 rounded text-[10px]">
                                {p.brand}
                              </span>
                              <span className="text-stone-400 text-[10px]">• {p.unit}</span>
                            </div>
                          </div>
                        </td>

                        {/* Foto & Direct URL Input (Tanpa klik, langsung isi & tombol simpan) */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {/* Live Thumbnail Preview */}
                            <div
                              onClick={() => handleOpenQuickImageModal(p)}
                              className="relative group cursor-pointer shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
                              title="Klik untuk Pratinjau Gambar Besar"
                            >
                              <img
                                src={resolveProductImage(currentImageUrl, language)}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getPlaceholderImage(language);
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <span className="material-symbols-outlined text-[13px]">zoom_in</span>
                              </div>
                            </div>

                            {/* Direct URL Input Field & Save Button */}
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={currentImageUrl}
                                  onChange={(e) =>
                                    setImageDrafts((prev) => ({
                                      ...prev,
                                      [p.id]: e.target.value
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveDirectImage(p.id, currentImageUrl);
                                    } else if (e.key === 'Escape') {
                                      handleResetDirectImage(p.id);
                                    }
                                  }}
                                  placeholder="Ketik / paste URL foto..."
                                  className={`w-full min-w-[150px] max-w-[220px] text-xs font-mono px-2 py-1.5 rounded-lg border transition-all ${
                                    isImageChanged
                                      ? 'bg-amber-50/70 border-amber-400 text-stone-900 ring-2 ring-amber-300/50 focus:outline-none'
                                      : 'bg-stone-50 hover:bg-white focus:bg-white border-stone-200 focus:border-[#c41230] text-stone-700 focus:outline-none'
                                  }`}
                                  title={currentImageUrl}
                                />

                                {isImageChanged && (
                                  <div className="flex items-center gap-1 shrink-0 animate-fadeIn">
                                    <button
                                      type="button"
                                      disabled={savingImageIds[p.id]}
                                      onClick={() => handleSaveDirectImage(p.id, currentImageUrl)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                      title="Simpan perubahan URL foto produk ini ke Supabase"
                                    >
                                      {savingImageIds[p.id] ? (
                                        <>
                                          <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                                          <span>Menyimpan...</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="material-symbols-outlined text-xs">cloud_upload</span>
                                          <span>Simpan</span>
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleResetDirectImage(p.id)}
                                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
                                      title="Batalkan perubahan"
                                    >
                                      <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {savedImageInfo && (
                                <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                                  <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                                  <span>{savedImageInfo.message}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 font-medium rounded-md text-[11px] whitespace-nowrap">
                            {p.category}
                          </span>
                        </td>

                        {/* HARGA POKOK (HPP) - DIRECT INLINE EDITABLE */}
                        <td className="py-3 px-4 text-right whitespace-nowrap bg-amber-50/20 border-x border-amber-100/60">
                          {isEditingHpp ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-xs text-amber-700 font-bold">¥</span>
                              <input
                                type="number"
                                value={inlineEditingHpp.value}
                                onChange={(e) =>
                                  setInlineEditingHpp({ id: p.id, value: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlineHpp(p.id);
                                  if (e.key === 'Escape') setInlineEditingHpp(null);
                                }}
                                autoFocus
                                className="w-20 px-2 py-1 bg-white border-2 border-amber-500 rounded-lg text-xs font-black text-right text-stone-900 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveInlineHpp(p.id)}
                                className="p-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md cursor-pointer"
                                title="Simpan HPP"
                              >
                                <span className="material-symbols-outlined text-xs">check</span>
                              </button>
                              <button
                                onClick={() => setInlineEditingHpp(null)}
                                className="p-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md cursor-pointer"
                                title="Batal"
                              >
                                <span className="material-symbols-outlined text-xs">close</span>
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                setInlineEditingHpp({ id: p.id, value: String(p.costPrice || 0) })
                              }
                              className="group cursor-pointer flex flex-col items-end hover:bg-amber-100/40 p-1 rounded-lg transition-colors"
                              title="Klik untuk ubah Harga Pokok (HPP) langsung"
                            >
                              <div className="flex items-center gap-1">
                                {p.costPrice && p.costPrice > 0 ? (
                                  <span className="font-bold text-stone-800 text-xs">
                                    ¥{p.costPrice.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-stone-400 font-medium text-[11px] italic">
                                    {language === 'JP' ? '未設定 (¥0)' : language === 'EN' ? 'Not set (¥0)' : 'Belum diisi (¥0)'}
                                  </span>
                                )}
                                <span className="material-symbols-outlined text-amber-600 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                                  edit
                                </span>
                              </div>
                              <span className="text-[9px] text-stone-400">HPP Landed</span>
                            </div>
                          )}
                        </td>

                        {/* HARGA JUAL (RETAIL) - DIRECT INLINE EDITABLE */}
                        <td className="py-3 px-4 text-right whitespace-nowrap bg-emerald-50/20 border-r border-emerald-100/60">
                          {isEditingPrice ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-xs text-emerald-700 font-bold">¥</span>
                              <input
                                type="number"
                                value={inlineEditingPrice.value}
                                onChange={(e) =>
                                  setInlineEditingPrice({ id: p.id, value: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveInlinePrice(p.id);
                                  if (e.key === 'Escape') setInlineEditingPrice(null);
                                }}
                                autoFocus
                                className="w-20 px-2 py-1 bg-white border-2 border-emerald-600 rounded-lg text-xs font-black text-right text-stone-900 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveInlinePrice(p.id)}
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer"
                                title="Simpan Harga Jual"
                              >
                                <span className="material-symbols-outlined text-xs">check</span>
                              </button>
                              <button
                                onClick={() => setInlineEditingPrice(null)}
                                className="p-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md cursor-pointer"
                                title="Batal"
                              >
                                <span className="material-symbols-outlined text-xs">close</span>
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() =>
                                setInlineEditingPrice({ id: p.id, value: String(p.price) })
                              }
                              className="group cursor-pointer flex flex-col items-end hover:bg-emerald-100/40 p-1 rounded-lg transition-colors"
                              title="Klik untuk ubah Harga Jual langsung"
                            >
                              {p.price > 0 ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <span className="font-black text-stone-900 text-sm">
                                      ¥{p.price.toLocaleString()}
                                    </span>
                                    <span className="material-symbols-outlined text-emerald-600 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                                      edit
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-stone-500 font-medium">
                                    {language === 'JP'
                                      ? `(税込: ¥${p.priceTax.toLocaleString()})`
                                      : language === 'EN'
                                      ? `(Tax: ¥${p.priceTax.toLocaleString()})`
                                      : `(Pajak: ¥${p.priceTax.toLocaleString()})`}
                                  </div>
                                  {hpp > 0 && (
                                    <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1 rounded mt-0.5">
                                      +{marginPercent}% (+¥{marginYen})
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                      {language === 'JP' ? '未設定 (TBD)' : language === 'EN' ? 'Not set (TBD)' : 'Belum di-set (TBD)'}
                                    </span>
                                    <span className="material-symbols-outlined text-amber-600 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                                      edit
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-stone-400 mt-0.5 block">
                                    {language === 'JP' ? 'クリックして価格設定' : language === 'EN' ? 'Click to set price' : 'Klik untuk set harga'}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </td>

                        {/* GROSIR (BULK TIERS) */}
                        <td className="py-3 px-3 text-center bg-blue-50/15 border-r border-blue-100/50">
                          {p.price > 0 && p.bulkPrices ? (
                            <div
                              onClick={() => handleOpenBulkModal(p)}
                              className="cursor-pointer group flex flex-col items-center gap-0.5 hover:bg-blue-100/40 p-1 rounded-lg transition-colors"
                              title="Klik untuk ubah tier harga grosir bulk"
                            >
                              <div className="flex items-center gap-1">
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  6+: ¥{p.bulkPrices.tier1_price}
                                </span>
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  12+: ¥{p.bulkPrices.tier2_price}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black px-1.5 py-0.5 rounded">
                                  1 Dus: ¥{p.bulkPrices.tier3_price}
                                </span>
                                <span className="material-symbols-outlined text-[12px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  edit
                                </span>
                              </div>
                            </div>
                            ) : p.price > 0 ? (
                              <button
                                onClick={() => handleOpenBulkModal(p)}
                                className="px-2 py-1 bg-stone-100 hover:bg-blue-100 text-stone-600 hover:text-blue-700 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                              >
                                {language === 'JP' ? '+ 卸価格設定' : language === 'EN' ? '+ Set Bulk' : '+ Set Grosir'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-400 italic">
                                {language === 'JP' ? '価格設定待ち' : language === 'EN' ? 'Pending Price' : 'Menunggu Harga'}
                              </span>
                            )}
                        </td>

                        {/* Stok */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setQuickStockTarget({ id: p.id, name: p.name, current: p.stock });
                              setQuickStockDelta(10);
                            }}
                            className={`px-2 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 hover:opacity-85 transition-opacity cursor-pointer ${
                              isOut
                                ? 'bg-red-100 text-[#c41230]'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span>{p.stock}</span>
                            <span className="material-symbols-outlined text-[11px]">edit</span>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
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

                        {/* Aksi */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
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
                {language === 'JP'
                  ? `表示中: ${Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} - ${Math.min(
                      currentPage * itemsPerPage,
                      filteredProducts.length
                    )} / ${filteredProducts.length} 商品`
                  : language === 'EN'
                  ? `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} - ${Math.min(
                      currentPage * itemsPerPage,
                      filteredProducts.length
                    )} of ${filteredProducts.length} products`
                  : `Menampilkan ${Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} - ${Math.min(
                      currentPage * itemsPerPage,
                      filteredProducts.length
                    )} dari ${filteredProducts.length} produk`}
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-bold cursor-pointer"
                >
                  &larr; Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                      currentPage === i + 1
                        ? 'bg-[#c41230] text-white'
                        : 'bg-white border border-stone-200 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-bold cursor-pointer"
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
                        {language === 'JP' ? `在庫: ${p.stock}` : language === 'EN' ? `Stock: ${p.stock}` : `Stok: ${p.stock}`}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-stone-400">
                        <span className="font-mono bg-stone-100 text-stone-700 px-1 py-0.5 rounded">{p.sku || p.id}</span>
                        <span className="text-[#c41230]">{p.brand}</span>
                      </div>
                      <h3 className="font-bold text-xs text-stone-900 line-clamp-2 mt-1">
                        {language === 'JP' ? p.nameJp || p.name : language === 'EN' ? p.nameEn || p.name : p.name}
                      </h3>
                      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-100">
                        <div>
                          <span className="text-[10px] text-stone-400 block">Harga Jual</span>
                          <span className="text-base font-black text-stone-900">¥{p.price.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block">HPP Pokok</span>
                          <span className="text-xs font-bold text-amber-800">¥{(p.costPrice || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="flex-1 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleOpenBulkModal(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs cursor-pointer"
                      title="Set Grosir"
                    >
                      Bulk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: Tambah Produk Baru */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c41230]">add_box</span>
                  <span>{t('prod_add_new')}</span>
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
                {/* SKU, Name & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Kode SKU *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="SN-0180"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
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
                    <label className="font-bold text-stone-700">Merek / Brand *</label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Indofood / Finna"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* Multilingual names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">{t('prod_name_jp')}</label>
                    <input
                      type="text"
                      value={formData.nameJp}
                      onChange={(e) => setFormData({ ...formData, nameJp: e.target.value })}
                      placeholder="Nama Produk (Bahasa Jepang)"
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
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <div className="space-y-1">
                    <label className="font-bold text-amber-900">Harga Pokok (HPP) ¥ *</label>
                    <input
                      type="number"
                      required
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      placeholder="350"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-900">Harga Jual (Retail) ¥ *</label>
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
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Harga + Pajak 8% (¥)</label>
                    <input
                      type="number"
                      value={formData.priceTax}
                      onChange={(e) => setFormData({ ...formData, priceTax: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl font-bold text-stone-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Stok Awal *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Wholesale Bulk Pricing Tiers */}
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">layers</span>
                      <span>Harga Grosir / Bulk (Sheet 03 Pricing)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={formData.hasBulk}
                        onChange={(e) => setFormData({ ...formData, hasBulk: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Aktifkan Grosir</span>
                    </label>
                  </div>

                  {formData.hasBulk && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">Tier 1 (Bulk 6–11)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-stone-400">Min:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier1_qty}
                            onChange={(e) => setFormData({ ...formData, bulk_tier1_qty: Number(e.target.value) })}
                            className="w-12 px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-center"
                          />
                          <span className="text-xs text-stone-400">¥:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier1_price}
                            onChange={(e) => setFormData({ ...formData, bulk_tier1_price: Number(e.target.value) })}
                            className="w-full px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-right"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">Tier 2 (Bulk 12–23)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-stone-400">Min:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier2_qty}
                            onChange={(e) => setFormData({ ...formData, bulk_tier2_qty: Number(e.target.value) })}
                            className="w-12 px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-center"
                          />
                          <span className="text-xs text-stone-400">¥:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier2_price}
                            onChange={(e) => setFormData({ ...formData, bulk_tier2_price: Number(e.target.value) })}
                            className="w-full px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-right"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-indigo-900 uppercase">Tier 3 (1 Dus)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-stone-400">Min:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier3_qty}
                            onChange={(e) => setFormData({ ...formData, bulk_tier3_qty: Number(e.target.value) })}
                            className="w-12 px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-center"
                          />
                          <span className="text-xs text-stone-400">¥:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier3_price}
                            onChange={(e) => setFormData({ ...formData, bulk_tier3_price: Number(e.target.value) })}
                            className="w-full px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-right"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category, Unit & Image URL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <label className="font-bold text-stone-700">Satuan / Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="1 Pcs / 500g"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">URL Gambar Produk</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
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
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                  >
                    {t('prod_cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold shadow-sm cursor-pointer"
                  >
                    {t('prod_save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Edit Produk Lengkap */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">edit_note</span>
                  <span>
                    {language === 'JP'
                      ? `商品編集: ${editingProduct.nameJp || editingProduct.name}`
                      : language === 'EN'
                      ? `Edit Product: ${editingProduct.nameEn || editingProduct.name}`
                      : `Edit Produk: ${editingProduct.name}`}
                  </span>
                </h2>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                {/* SKU, Name & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Kode SKU *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
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
                    <label className="font-bold text-stone-700">Merek / Brand *</label>
                    <input
                      type="text"
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* Multilingual names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <div className="space-y-1">
                    <label className="font-bold text-amber-900">Harga Pokok (HPP) ¥ *</label>
                    <input
                      type="number"
                      required
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-900">Harga Jual (Retail) ¥ *</label>
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
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Harga + Pajak 8% (¥)</label>
                    <input
                      type="number"
                      value={formData.priceTax}
                      onChange={(e) => setFormData({ ...formData, priceTax: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Stok *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Wholesale Bulk Pricing Tiers */}
                <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">layers</span>
                      <span>Harga Grosir / Bulk (Sheet 03 Pricing)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={formData.hasBulk}
                        onChange={(e) => setFormData({ ...formData, hasBulk: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Aktifkan Grosir</span>
                    </label>
                  </div>

                  {formData.hasBulk && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">Tier 1 (Bulk 6–11)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-stone-400">Min:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier1_qty}
                            onChange={(e) => setFormData({ ...formData, bulk_tier1_qty: Number(e.target.value) })}
                            className="w-12 px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-center"
                          />
                          <span className="text-xs text-stone-400">¥:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier1_price}
                            onChange={(e) => setFormData({ ...formData, bulk_tier1_price: Number(e.target.value) })}
                            className="w-full px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-right"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">Tier 2 (Bulk 12–23)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-stone-400">Min:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier2_qty}
                            onChange={(e) => setFormData({ ...formData, bulk_tier2_qty: Number(e.target.value) })}
                            className="w-12 px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-center"
                          />
                          <span className="text-xs text-stone-400">¥:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier2_price}
                            onChange={(e) => setFormData({ ...formData, bulk_tier2_price: Number(e.target.value) })}
                            className="w-full px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-right"
                          />
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-indigo-900 uppercase">Tier 3 (1 Dus)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-stone-400">Min:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier3_qty}
                            onChange={(e) => setFormData({ ...formData, bulk_tier3_qty: Number(e.target.value) })}
                            className="w-12 px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-center"
                          />
                          <span className="text-xs text-stone-400">¥:</span>
                          <input
                            type="number"
                            value={formData.bulk_tier3_price}
                            onChange={(e) => setFormData({ ...formData, bulk_tier3_price: Number(e.target.value) })}
                            className="w-full px-1.5 py-0.5 bg-stone-50 border rounded text-xs font-bold text-right"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category, Unit & Image URL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <label className="font-bold text-stone-700">Satuan / Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">URL Gambar Produk</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
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
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                  >
                    {t('prod_cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer"
                  >
                    {t('prod_save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Edit Wholesale / Bulk Pricing Cepat */}
        {bulkPriceTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-xl">layers</span>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Setting Harga Grosir (Bulk)</h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{bulkPriceTarget.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setBulkPriceTarget(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>

              <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl flex justify-between items-center">
                <span>Harga Retail Saat Ini:</span>
                <span className="font-black text-stone-900 text-sm">¥{bulkPriceTarget.price.toLocaleString()}</span>
              </div>

              <form onSubmit={handleSaveBulkModal} className="space-y-3 text-xs">
                {/* Tier 1 */}
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 space-y-1.5">
                  <div className="font-bold text-blue-900 flex justify-between">
                    <span>Tier 1 (Sedang 6–11 Pcs)</span>
                    <span className="text-[10px] text-blue-600">Diskon Bulk</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-500 block">Min Qty</label>
                      <input
                        type="number"
                        value={bulkFormData.tier1_qty}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, tier1_qty: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 block">Harga Satuan (¥)</label>
                      <input
                        type="number"
                        value={bulkFormData.tier1_price}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, tier1_price: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Tier 2 */}
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 space-y-1.5">
                  <div className="font-bold text-blue-900 flex justify-between">
                    <span>Tier 2 (Banyak 12–23 Pcs)</span>
                    <span className="text-[10px] text-blue-600">Diskon Grosir</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-500 block">Min Qty</label>
                      <input
                        type="number"
                        value={bulkFormData.tier2_qty}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, tier2_qty: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 block">Harga Satuan (¥)</label>
                      <input
                        type="number"
                        value={bulkFormData.tier2_price}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, tier2_price: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Tier 3 */}
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-200 space-y-1.5">
                  <div className="font-bold text-indigo-900 flex justify-between">
                    <span>Tier 3 (1 Dus / Karton 24+)</span>
                    <span className="text-[10px] text-indigo-700 font-bold">Harga Termurah</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-stone-500 block">Min Qty</label>
                      <input
                        type="number"
                        value={bulkFormData.tier3_qty}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, tier3_qty: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-stone-500 block">Harga Satuan (¥)</label>
                      <input
                        type="number"
                        value={bulkFormData.tier3_price}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, tier3_price: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold text-right"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBulkPriceTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer"
                  >
                    Simpan Grosir
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
                <h3 className="text-base font-bold text-stone-900">
                  {language === 'JP' ? 'クイック在庫数更新' : language === 'EN' ? 'Quick Stock Update' : 'Update Stok Cepat'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{quickStockTarget.name}</p>
                <p className="text-xs font-bold text-stone-700 mt-1">
                  {language === 'JP'
                    ? `現在庫: ${quickStockTarget.current} 個`
                    : language === 'EN'
                    ? `Current Stock: ${quickStockTarget.current} Units`
                    : `Stok Saat Ini: ${quickStockTarget.current} Unit`}
                </p>
              </div>

              <form onSubmit={handleQuickStockSubmit} className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  {[-10, -5, +5, +10, +20].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => setQuickStockDelta(delta)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  <span>{language === 'JP' ? '変動数:' : language === 'EN' ? 'Change Delta:' : 'Jumlah Perubahan:'}</span>
                  <input
                    type="number"
                    value={quickStockDelta}
                    onChange={(e) => setQuickStockDelta(Number(e.target.value))}
                    className="w-20 px-2 py-1 text-center font-bold bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl text-xs font-bold text-stone-700">
                  {language === 'JP' ? '変更後在庫:' : language === 'EN' ? 'New Stock Level:' : 'Stok Baru:'}{' '}
                  <span className="text-emerald-600 font-black">
                    {Math.max(0, quickStockTarget.current + quickStockDelta)}{' '}
                    {language === 'JP' ? '個' : language === 'EN' ? 'Units' : 'Unit'}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickStockTarget(null)}
                    className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                  >
                    {t('prod_cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {language === 'JP' ? '在庫を保存' : language === 'EN' ? 'Save Stock' : 'Simpan Stok'}
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
                  <h3 className="text-sm font-bold text-stone-900">
                    {language === 'JP' ? '商品画像URL変更' : language === 'EN' ? 'Change Product Image URL' : 'Ganti URL Gambar Produk'}
                  </h3>
                </div>
                <button
                  onClick={() => setQuickImageTarget(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
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
                  {language === 'JP' ? '画像プレビュー:' : language === 'EN' ? 'Live Image Preview:' : 'Live Preview Gambar:'}
                </span>
                <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden border border-stone-300 bg-white flex items-center justify-center shadow-xs">
                  <img
                    src={quickImageUrlInput || '/placeholder-upload.svg'}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-upload.svg';
                    }}
                  />
                </div>
              </div>

              <form onSubmit={handleQuickImageSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    {language === 'JP' ? '画像URL:' : language === 'EN' ? 'Image URL:' : 'URL Image Address:'}
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
                    {language === 'JP'
                      ? 'インターネット上の画像URL、CDN、Googleフォト等のリンクを利用できます。'
                      : language === 'EN'
                      ? 'You can use image URLs from the web, CDN, Google Photos, etc.'
                      : 'Bisa menggunakan link gambar dari internet, hosting CDN, Supabase, Google Photos, dsb.'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickImageTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                  >
                    {t('prod_cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    {language === 'JP' ? '画像URLを保存' : language === 'EN' ? 'Save Image URL' : 'Simpan URL Gambar'}
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
