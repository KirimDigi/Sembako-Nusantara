import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PRODUCTS_DATA } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAdmin } from '../../context/AdminContext';
import { Product } from '../../types';
import { FreeShippingProgressBar } from '../common/FreeShippingProgressBar';
import { smartSearchProducts } from '../../utils/smartSearch';
import { resolveProductImage, getPlaceholderImage } from '../common/ProductImage';
import { useExchangeRate, convertJpyToIdr, formatIdr } from '../../utils/currency';

interface ProductCatalogSectionProps {
  showTitleHeader?: boolean;
  showCategoryBar?: boolean;
  className?: string;
}

export const ProductCatalogSection: React.FC<ProductCatalogSectionProps> = ({
  showTitleHeader = false,
  showCategoryBar = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const exchangeRate = useExchangeRate();
  const { itemDiscounts, products: adminProducts } = useAdmin();
  const products = adminProducts && adminProducts.length > 0 ? adminProducts : PRODUCTS_DATA;
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>('cat_all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'name'>('popular');
  const [filterFrozenOnly, setFilterFrozenOnly] = useState(false);
  const [filterHalalOnly, setFilterHalalOnly] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  // Search Bar Dropdown state and click outside handler
  const catalogSearchRef = useRef<HTMLDivElement>(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogSearchRef.current && !catalogSearchRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [urlQuery]);

  // Category filter items
  const categories = [
    { key: 'cat_all', labelId: 'Semua Produk', labelJp: 'すべての商品', labelEn: 'All Products', icon: 'apps' },
    { key: 'bumbu', labelId: 'Bumbu & Sambal', labelJp: '調味料・サンバル', labelEn: 'Spices & Sambal', icon: 'soup_kitchen' },
    { key: 'mie', labelId: 'Mie Instan', labelJp: 'インスタント麺', labelEn: 'Instant Noodles', icon: 'ramen_dining' },
    { key: 'frozen', labelId: 'Frozen Food', labelJp: '冷凍食品', labelEn: 'Frozen Food', icon: 'ac_unit' },
    { key: 'snack', labelId: 'Minuman & Snack', labelJp: '飲料・スナック', labelEn: 'Drinks & Snacks', icon: 'local_cafe' },
    { key: 'pokok', labelId: 'Bahan Pokok & Beras', labelJp: '主食・米', labelEn: 'Staple Food & Rice', icon: 'grain' },
    { key: 'herbal', labelId: 'Herbal & Perawatan', labelJp: 'ハーブ・ケア', labelEn: 'Herbal & Care', icon: 'spa' },
  ];

  // Helper matcher precisely synchronized with database SKU categories
  const matchesCategory = (p: Product, key: string) => {
    if (key === 'cat_all') return true;
    const cat = p.category || '';

    if (key === 'mie') {
      return cat === 'Makanan Instan & Mie';
    }
    if (key === 'frozen') {
      return p.isFrozen === true || cat === 'Frozen Food Halal' || cat === 'Daging Halal';
    }
    if (key === 'bumbu') {
      return cat === 'Bumbu & Rempah' || cat === 'Saus & Sambal';
    }
    if (key === 'snack') {
      return cat === 'Camilan & Kerupuk' || cat === 'Minuman Segar & Kopi';
    }
    if (key === 'pokok') {
      return cat === 'Beras & Biji-bijian';
    }
    if (key === 'herbal') {
      return cat === 'Kebutuhan Harian & Herbal';
    }
    return p.category === key;
  };

  // Smart search calculation for suggestions and typo correction
  const catalogSearchMeta = useMemo(() => {
    if (!urlQuery.trim()) return null;
    return smartSearchProducts(urlQuery, products, { maxResults: 100 });
  }, [urlQuery, products]);

  // Filter and Sort Logic with Smart Search (Prefix Priority & Typo Tolerance)
  const filteredProducts = useMemo(() => {
    // 1. Filter candidates by category and toggles
    let candidates = products.filter((p) => {
      if (!matchesCategory(p, selectedCategory)) return false;
      if (filterFrozenOnly && !p.isFrozen) return false;
      if (filterHalalOnly && !p.isHalal) return false;
      return true;
    });

    // 2. If search query exists, apply Smart Search ranking
    if (urlQuery.trim() !== '') {
      const searchRes = smartSearchProducts(urlQuery, candidates, { maxResults: 200 });
      let list = searchRes.allRankedProducts;

      // Apply explicit sort override if user selected non-default sort
      if (sortBy !== 'popular') {
        return list.slice().sort((a, b) => {
          if (sortBy === 'price_asc') return a.price - b.price;
          if (sortBy === 'price_desc') return b.price - a.price;
          if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });
      }
      return list;
    }

    // Default sorting when no search query
    return candidates.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });
  }, [products, urlQuery, selectedCategory, sortBy, filterFrozenOnly, filterHalalOnly]);

  // Pagination calculations (16 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const targetEl = document.getElementById('catalog-products-top');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const activeDisc = itemDiscounts.find(
      (d) => d.isActive && (d.productId === product.id || d.productSku === (product as any).sku || d.productName?.toLowerCase() === product.name.toLowerCase())
    );
    const displayPrice = activeDisc?.discountedPriceJPY ? activeDisc.discountedPriceJPY : product.price;
    const displayPriceTax = activeDisc?.discountedPriceJPY ? Math.round(activeDisc.discountedPriceJPY * 1.08) : product.priceTax;
    const productToAdd = activeDisc ? { ...product, price: displayPrice, priceTax: displayPriceTax } : product;
    addToCart(productToAdd, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const getProductName = (p: Product) => {
    if (language === 'JP' && p.nameJp) return p.nameJp;
    if (language === 'EN' && p.nameEn) return p.nameEn;
    return p.name;
  };

  const getProductCategory = (p: Product) => {
    if (language === 'JP' && p.categoryJp) return p.categoryJp;
    if (language === 'EN' && p.categoryEn) return p.categoryEn;
    return p.category;
  };

  const getProductUnit = (p: Product) => {
    if (language === 'JP' && p.unitJp) return p.unitJp;
    if (language === 'EN' && p.unitEn) return p.unitEn;
    return p.unit;
  };

  const getCategoryLabel = (cat: typeof categories[0]) => {
    if (language === 'JP') return cat.labelJp;
    if (language === 'EN') return cat.labelEn;
    return cat.labelId;
  };

  return (
    <div id="catalog-products-top" className={`w-full max-w-full overflow-x-hidden ${className}`}>
      {/* Optional Title & Category Section (Shown only if explicitly enabled) */}
      {(showTitleHeader || showCategoryBar) && (
        <section className="bg-gradient-to-b from-white to-[#FDF8F0] border-y border-[#EBE5DF] py-5 sm:py-8 px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-4">
            {showTitleHeader && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-red-100 text-[#c41230] font-bold text-xs rounded-full">
                    {language === 'JP' ? '100+ 点 即納可能' : language === 'EN' ? '100+ SKUs Ready Stock' : '100+ SKU Ready Stock'}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    {language === 'JP' ? '100% ハラール認証' : language === 'EN' ? '100% Halal Certified' : '100% Halal'}
                  </span>
                </div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-stone-900 tracking-tight">
                  {language === 'JP'
                    ? 'インドネシア食材・ハラールカタログ'
                    : language === 'EN'
                    ? 'Indonesian Halal Grocery Catalog'
                    : 'Katalog Produk Sembako Nusantara'}
                </h2>
                <p className="text-stone-600 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                  {language === 'JP'
                    ? '本場のインドネシア調味料、即席麺、冷凍食品などを日本全国47都道府県へ即日発送いたします。'
                    : language === 'EN'
                    ? 'Authentic Indonesian spices, instant noodles, frozen food, and groceries delivered across all 47 prefectures in Japan.'
                    : 'Pilihan lengkap sembako, bumbu asli, mie instan, dan frozen food halal terbesar se-Jepang dengan pengiriman kilat Yamato & Sagawa.'}
                </p>
              </div>
            )}

            {/* Horizontal Category Pill Bar */}
            {showCategoryBar && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full max-w-full min-w-0 pt-1">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#c41230] text-white shadow-md scale-105'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{cat.icon}</span>
                      <span>{getCategoryLabel(cat)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Content Area: Free Shipping Bar + Toolbar + Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 w-full min-w-0">
        {/* Free Shipping Tracker Bar */}
        <FreeShippingProgressBar className="mb-6" />

        {/* Smart Search Typo Suggestion Banner ("Maksud Anda: ...?") */}
        {catalogSearchMeta?.didYouMean && (
          <div className="mb-4 p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
              <span className="material-symbols-outlined text-amber-600 text-lg shrink-0">lightbulb</span>
              <div>
                <span>
                  {language === 'JP' ? 'もしかして:' : language === 'EN' ? 'Did you mean:' : 'Maksud Anda:'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('q', catalogSearchMeta.didYouMean!);
                      setSearchParams(next, { replace: true });
                    }}
                    className="font-bold underline text-[#c41230] hover:text-[#a80f28] text-sm cursor-pointer"
                  >
                    "{catalogSearchMeta.didYouMean}"
                  </button>
                  ?
                </span>
                <span className="text-stone-500 font-normal block sm:inline sm:ml-1 text-[11px]">
                  ({language === 'JP' ? '入力' : language === 'EN' ? 'searched for' : 'mencari dari kata'} "{urlQuery}")
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('q', catalogSearchMeta.didYouMean!);
                setSearchParams(next, { replace: true });
              }}
              className="self-end sm:self-auto px-4 py-1.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              <span>{language === 'JP' ? '候補で検索する' : language === 'EN' ? 'Search with suggestion' : 'Terapkan Saran'}</span>
            </button>
          </div>
        )}

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-6 border-b border-stone-200 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs sm:text-sm font-semibold text-stone-600 min-w-0">
            <span className="w-full sm:w-auto text-stone-700">
              {language === 'JP' ? (
                <>
                  <strong className="text-stone-900 font-bold">{filteredProducts.length}</strong> 件の商品を表示中
                  {totalPages > 1 && (
                    <span className="text-stone-400 font-normal ml-1 sm:ml-2">
                      (ページ {currentPage} / {totalPages})
                    </span>
                  )}
                </>
              ) : language === 'EN' ? (
                <>
                  Showing <strong className="text-stone-900 font-bold">{filteredProducts.length}</strong> products
                  {totalPages > 1 && (
                    <span className="text-stone-400 font-normal ml-1 sm:ml-2">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </>
              ) : (
                <>
                  Menampilkan <strong className="text-stone-900 font-bold">{filteredProducts.length}</strong> produk
                  {totalPages > 1 && (
                    <span className="text-stone-400 font-normal ml-1 sm:ml-2">
                      (Hal. {currentPage} dari {totalPages})
                    </span>
                  )}
                </>
              )}
            </span>

            {/* Active Search Term Badge with 1-click Clear */}
            {urlQuery && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#c41230] rounded-full text-xs font-bold border border-red-200">
                <span className="material-symbols-outlined text-sm">search</span>
                <span>"{urlQuery}"</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('q');
                    setSearchParams(next, { replace: true });
                  }}
                  className="ml-1 hover:text-stone-900 cursor-pointer"
                  title="Hapus filter pencarian"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Active Filter Badges */}
            {filterHalalOnly && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 shadow-2xs">
                <span>✅ Halal</span>
                <button
                  type="button"
                  onClick={() => setFilterHalalOnly(false)}
                  className="ml-1 hover:text-stone-900 cursor-pointer text-xs"
                  title="Hapus filter halal"
                >
                  ✕
                </button>
              </div>
            )}
            {filterFrozenOnly && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded-full text-xs font-bold border border-blue-200 shadow-2xs">
                <span>❄️ Frozen</span>
                <button
                  type="button"
                  onClick={() => setFilterFrozenOnly(false)}
                  className="ml-1 hover:text-stone-900 cursor-pointer text-xs"
                  title="Hapus filter frozen"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Quick Toggle Controls: Smart Search Bar & Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* In-Catalog Search Bar with Smart Autocomplete Dropdown */}
              <div ref={catalogSearchRef} className="relative">
                <div className="flex items-center bg-white border-2 border-stone-300 hover:border-stone-400 focus-within:border-[#c41230] focus-within:ring-2 focus-within:ring-[#c41230]/20 rounded-xl px-2.5 py-1 text-xs shadow-xs transition-all">
                  <span className="material-symbols-outlined text-[#c41230] text-base mr-1.5 font-bold">search</span>
                  <input
                    type="text"
                    value={urlQuery}
                    onFocus={() => {
                      if (urlQuery.trim().length > 0) setIsSearchDropdownOpen(true);
                    }}
                    onChange={(e) => {
                      const next = new URLSearchParams(searchParams);
                      const val = e.target.value;
                      if (val.trim()) {
                        next.set('q', val);
                        setIsSearchDropdownOpen(true);
                      } else {
                        next.delete('q');
                        setIsSearchDropdownOpen(false);
                      }
                      setSearchParams(next, { replace: true });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsSearchDropdownOpen(false);
                    }}
                    placeholder={
                      language === 'JP'
                        ? '商品名・調味料を絞り込み...'
                        : language === 'EN'
                        ? 'Filter products...'
                        : 'Ketik nama bumbu/produk...'
                    }
                    className="bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none w-36 sm:w-52 font-medium text-xs"
                  />
                  {urlQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('q');
                        setSearchParams(next, { replace: true });
                        setIsSearchDropdownOpen(false);
                      }}
                      className="text-stone-400 hover:text-stone-700 ml-1 p-0.5 rounded-full hover:bg-stone-100 cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <span className="material-symbols-outlined text-sm block">close</span>
                    </button>
                  )}
                </div>

                {/* Floating Smart Search Dropdown (Typo, Prefix A/B, Matching Items) */}
                {isSearchDropdownOpen && urlQuery.trim().length > 0 && catalogSearchMeta && (
                  <div className="absolute left-0 top-full mt-2 w-72 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-fadeIn">
                    {/* Typo Correction Banner ("Maksud Anda: ...?") */}
                    {catalogSearchMeta.didYouMean && (
                      <div className="bg-amber-50 border-b border-amber-200/80 px-3.5 py-2 flex items-center justify-between text-xs text-amber-900">
                        <div className="flex items-center gap-1.5 font-medium truncate">
                          <span className="material-symbols-outlined text-sm text-amber-600 shrink-0">lightbulb</span>
                          <span className="truncate">
                            {language === 'JP' ? 'もしかして:' : language === 'EN' ? 'Did you mean:' : 'Maksud Anda:'}{' '}
                            <button
                              type="button"
                              onClick={() => {
                                const next = new URLSearchParams(searchParams);
                                next.set('q', catalogSearchMeta.didYouMean!);
                                setSearchParams(next, { replace: true });
                                setIsSearchDropdownOpen(false);
                              }}
                              className="font-bold underline text-[#c41230] hover:text-[#a80f28] cursor-pointer"
                            >
                              {catalogSearchMeta.didYouMean}
                            </button>
                            ?
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            next.set('q', catalogSearchMeta.didYouMean!);
                            setSearchParams(next, { replace: true });
                            setIsSearchDropdownOpen(false);
                          }}
                          className="text-[11px] font-bold bg-[#c41230] hover:bg-[#a80f28] text-white px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs cursor-pointer ml-2"
                        >
                          {language === 'JP' ? '適用' : language === 'EN' ? 'Use' : 'Terapkan'}
                        </button>
                      </div>
                    )}

                    {/* Suggested Keywords / Prefix A/B Pills */}
                    {catalogSearchMeta.suggestedKeywords.length > 0 && (
                      <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-[#c41230]">auto_awesome</span>
                          {language === 'JP' ? '候補:' : language === 'EN' ? 'Suggest:' : 'Saran:'}
                        </span>
                        {catalogSearchMeta.suggestedKeywords.slice(0, 5).map((kw) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => {
                              const next = new URLSearchParams(searchParams);
                              next.set('q', kw);
                              setSearchParams(next, { replace: true });
                              setIsSearchDropdownOpen(false);
                            }}
                            className="px-2.5 py-0.5 bg-white hover:bg-[#c41230] hover:text-white rounded-full text-xs font-semibold text-stone-700 transition-colors border border-stone-200 shadow-2xs shrink-0 cursor-pointer"
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Matching Products Preview List */}
                    {catalogSearchMeta.allRankedProducts.length > 0 ? (
                      <div className="divide-y divide-stone-100 max-h-64 sm:max-h-72 overflow-y-auto">
                        {catalogSearchMeta.allRankedProducts.slice(0, 6).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setIsSearchDropdownOpen(false);
                              navigate(`/product/${p.id}`);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-stone-50 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-9 h-9 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-200"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-stone-900 group-hover:text-[#c41230] transition-colors truncate">
                                  {p.name}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-0.5">
                                  <span className="truncate">{p.category}</span>
                                  {p.isHalal && (
                                    <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded text-[9px] border border-emerald-200 shrink-0">
                                      Halal
                                    </span>
                                  )}
                                  {p.isFrozen && (
                                    <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 font-bold rounded text-[9px] border border-blue-200 shrink-0">
                                      Frozen
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs font-extrabold text-[#c41230] shrink-0">
                              ¥{p.price.toLocaleString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-stone-500">
                        {language === 'JP'
                          ? '一致する商品が見つかりませんでした'
                          : language === 'EN'
                          ? 'No matching products found'
                          : 'Tidak ada produk yang cocok'}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="bg-stone-50 border-t border-stone-100 px-3.5 py-2 flex items-center justify-between text-xs">
                      <span className="text-stone-500 text-[11px]">
                        {catalogSearchMeta.allRankedProducts.length}{' '}
                        {language === 'JP' ? '件一致' : language === 'EN' ? 'matches' : 'produk cocok'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSearchDropdownOpen(false)}
                        className="text-[#c41230] font-bold text-[11px] hover:underline cursor-pointer"
                      >
                        {language === 'JP' ? '閉じる' : language === 'EN' ? 'Close' : 'Tutup'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Halal & Frozen Category Dropdown */}
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={
                    filterFrozenOnly && filterHalalOnly
                      ? 'both'
                      : filterFrozenOnly
                      ? 'frozen'
                      : filterHalalOnly
                      ? 'halal'
                      : 'all'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'frozen') {
                      setFilterFrozenOnly(true);
                      setFilterHalalOnly(false);
                    } else if (val === 'halal') {
                      setFilterFrozenOnly(false);
                      setFilterHalalOnly(true);
                    } else if (val === 'both') {
                      setFilterFrozenOnly(true);
                      setFilterHalalOnly(true);
                    } else {
                      setFilterFrozenOnly(false);
                      setFilterHalalOnly(false);
                    }
                    setCurrentPage(1);
                  }}
                  className={`border-2 rounded-xl px-2.5 sm:px-3 py-1 text-xs text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#c41230]/20 shadow-xs cursor-pointer transition-all ${
                    filterFrozenOnly || filterHalalOnly
                      ? 'bg-red-50/80 border-[#c41230] text-[#c41230] font-bold'
                      : 'bg-white border-stone-300 hover:border-stone-400'
                  }`}
                  title="Filter Kategori Halal & Frozen"
                >
                  <option value="all">
                    {language === 'JP' ? '🏷️ 全区分 (ハラール & 冷凍)' : language === 'EN' ? '🏷️ All Types' : '🏷️ Kategori: Semua Jenis'}
                  </option>
                  <option value="halal">
                    {language === 'JP' ? '✅ 100% ハラール認証' : language === 'EN' ? '✅ 100% Halal Only' : '✅ 100% Halal Saja'}
                  </option>
                  <option value="frozen">
                    {language === 'JP' ? '❄️ 冷凍食品 (Frozen)' : language === 'EN' ? '❄️ Frozen Food Only' : '❄️ Frozen Food Saja'}
                  </option>
                  <option value="both">
                    {language === 'JP' ? '❄️✅ 冷凍 ＆ ハラール' : language === 'EN' ? '❄️✅ Frozen & Halal' : '❄️✅ Frozen & Halal'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-xs text-stone-500 font-medium">
              {language === 'JP' ? '並び替え:' : language === 'EN' ? 'Sort by:' : 'Urutkan:'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-white border border-stone-300 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#c41230] shadow-sm cursor-pointer"
            >
              <option value="popular">{language === 'JP' ? '人気順 / おすすめ' : language === 'EN' ? 'Most Popular' : 'Paling Populer'}</option>
              <option value="price_asc">{language === 'JP' ? '価格が安い順' : language === 'EN' ? 'Price: Low to High' : 'Harga: Rendah ke Tinggi'}</option>
              <option value="price_desc">{language === 'JP' ? '価格が高い順' : language === 'EN' ? 'Price: High to Low' : 'Harga: Tinggi ke Rendah'}</option>
              <option value="rating">{language === 'JP' ? '評価が高い順' : language === 'EN' ? 'Highest Rating' : 'Rating Tertinggi'}</option>
              <option value="name">{language === 'JP' ? '商品名 (A-Z)' : language === 'EN' ? 'Product Name (A-Z)' : 'Nama Produk (A-Z)'}</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 mt-8 p-8">
            <span className="material-symbols-outlined text-6xl text-stone-300 block mb-3">
              search_off
            </span>
            <h3 className="font-heading font-bold text-xl text-stone-800">
              {language === 'JP' ? '該当する商品が見つかりませんでした' : language === 'EN' ? 'No matching products found' : 'Tidak ada produk yang cocok'}
            </h3>
            <p className="text-stone-500 text-sm mt-1 max-w-md mx-auto">
              {language === 'JP'
                ? '別の検索キーワードをお試しいただくか、カテゴリフィルターを変更してください。'
                : language === 'EN'
                ? 'Try using different keywords or change your category filter.'
                : 'Coba gunakan kata kunci pencarian lain atau ubah filter kategori Anda.'}
            </p>
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('q');
                setSearchParams(next, { replace: true });
                setSelectedCategory('cat_all');
                setFilterFrozenOnly(false);
                setFilterHalalOnly(false);
                setCurrentPage(1);
              }}
              className="mt-4 px-6 py-2.5 bg-[#c41230] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#9a0021] transition-all cursor-pointer"
            >
              {language === 'JP' ? 'フィルターをリセット' : language === 'EN' ? 'Reset Filters' : 'Reset Filter'}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-8 w-full min-w-0">
              {paginatedProducts.map((product) => {
                const isAdded = addedProductId === product.id;
                const activeDisc = itemDiscounts.find(
                  (d) => d.isActive && (d.productId === product.id || d.productSku === (product as any).sku || d.productName?.toLowerCase() === product.name.toLowerCase())
                );
                const discountPercent = activeDisc
                  ? (activeDisc.discountType === 'PERCENTAGE'
                      ? activeDisc.discountValue
                      : Math.round(((product.price - activeDisc.discountedPriceJPY) / product.price) * 100))
                  : (product.discountPercentage || 0);
                const displayPrice = activeDisc?.discountedPriceJPY ? activeDisc.discountedPriceJPY : product.price;
                const displayPriceTax = activeDisc?.discountedPriceJPY ? Math.round(activeDisc.discountedPriceJPY * 1.08) : product.priceTax;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                  >
                    {/* Image Container with Badges */}
                    <Link to={`/product/${product.id}`} className="block relative bg-stone-50 overflow-hidden pt-[100%]">
                      <img
                        src={resolveProductImage(product.image, language)}
                        alt={getProductName(product)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getPlaceholderImage(language);
                        }}
                        className="absolute inset-0 w-full h-full object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Badges on Top of Image */}
                      <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 sm:gap-1.5 z-10">
                        {product.isHalal && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-[#DCFCE7] text-[#15803D] font-bold text-[9px] sm:text-[10px] rounded-md shadow-xs border border-emerald-200">
                            HALAL
                          </span>
                        )}
                        {product.isFrozen && (
                          <span className="px-1.5 sm:px-2 py-0.5 bg-sky-100 text-sky-800 font-bold text-[9px] sm:text-[10px] rounded-md shadow-xs border border-sky-200">
                            ❄️ FROZEN
                          </span>
                        )}
                      </div>

                      {discountPercent > 0 && (
                        <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 px-1.5 sm:px-2 py-0.5 bg-[#c41230] text-white font-bold text-[9px] sm:text-[10px] rounded-md shadow-xs">
                          -{discountPercent}%
                        </span>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-400 font-medium mb-1">
                          <span className="text-[#c41230] font-semibold">{getProductCategory(product)}</span>
                          {getProductUnit(product) && <span>{getProductUnit(product)}</span>}
                        </div>

                        <Link to={`/product/${product.id}`} className="block group-hover:text-[#c41230] transition-colors">
                          <h3 className="font-bold text-stone-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                            {getProductName(product)}
                          </h3>
                        </Link>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 text-xs text-stone-500">
                          <div className="flex items-center text-amber-500">
                            <span className="material-symbols-outlined text-xs sm:text-sm">star</span>
                            <span className="font-bold ml-0.5 text-stone-800 text-[11px] sm:text-xs">{product.rating}</span>
                          </div>
                          <span>•</span>
                          <span className="text-[10px] sm:text-[11px]">
                            ({product.reviewCount} {language === 'JP' ? '件のレビュー' : language === 'EN' ? 'reviews' : 'ulasan'})
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Add to Cart */}
                      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-stone-100">
                        <div className="flex items-baseline justify-between mb-2">
                          {displayPrice > 0 ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#c41230] text-sm sm:text-lg">
                                  ¥{displayPrice.toLocaleString()}
                                </span>
                                {discountPercent > 0 && activeDisc?.originalPriceJPY ? (
                                  <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                                    ¥{activeDisc.originalPriceJPY.toLocaleString()}
                                  </span>
                                ) : null}
                              </div>
                              {language === 'ID' && (
                                <div className="text-[11px] sm:text-xs font-bold text-emerald-700 leading-tight mt-0.5">
                                  ≈ {formatIdr(convertJpyToIdr(displayPrice, exchangeRate))}
                                </div>
                              )}
                              <span className="text-[9px] sm:text-[10px] text-stone-400 block mt-0.5">
                                ({language === 'JP' ? '税込' : language === 'EN' ? 'Tax incl.' : 'Pajak'} ¥{displayPriceTax.toLocaleString()})
                              </span>
                            </div>
                          ) : (
                            <div className="py-0.5">
                              <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-[10px]">
                                {language === 'JP' ? '近日発売 (価格未定)' : language === 'EN' ? 'Coming Soon (TBD)' : 'Segera Rilis (TBD)'}
                              </span>
                            </div>
                          )}
                        </div>

                        {displayPrice > 0 ? (
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`w-full py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                              isAdded
                                ? 'bg-red-700 text-white shadow-md'
                                : 'bg-[#c41230] hover:bg-[#9a0021] text-white hover:shadow-md'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs sm:text-sm">
                              {isAdded ? 'check_circle' : 'add_shopping_cart'}
                            </span>
                            <span>
                              {isAdded
                                ? (language === 'JP' ? '追加しました!' : language === 'EN' ? 'Added!' : 'Ditambahkan!')
                                : (language === 'JP' ? 'カートへ' : language === 'EN' ? 'Add to Cart' : 'Tambah')}
                            </span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                            <span>{language === 'JP' ? '価格設定待ち' : language === 'EN' ? 'Pending Price' : 'Menunggu Harga'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="mt-8 sm:mt-12 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 w-full min-w-0">
                <div className="text-xs sm:text-sm text-stone-500 text-center sm:text-left">
                  {language === 'JP'
                    ? `全 ${filteredProducts.length} 件中 ${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, filteredProducts.length)} 件を表示`
                    : language === 'EN'
                    ? `Showing ${((currentPage - 1) * itemsPerPage) + 1} - ${Math.min(currentPage * itemsPerPage, filteredProducts.length)} of ${filteredProducts.length} products`
                    : <>Menampilkan <strong className="text-stone-900">{((currentPage - 1) * itemsPerPage) + 1}</strong> - <strong className="text-stone-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> dari <strong className="text-stone-900">{filteredProducts.length}</strong> produk</>}
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center max-w-full">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition-all ${
                      currentPage === 1
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 shadow-xs cursor-pointer'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    <span className="hidden xs:inline">{language === 'JP' ? '前へ' : language === 'EN' ? 'Prev' : 'Sebelumnya'}</span>
                  </button>

                  {/* Numbered Page Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage;
                      if (
                        totalPages > 7 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - currentPage) > 1
                      ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return (
                            <span key={pageNum} className="px-1 text-stone-400 text-xs font-bold">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#c41230] text-white shadow-md scale-105'
                              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition-all ${
                      currentPage === totalPages
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 shadow-xs cursor-pointer'
                    }`}
                  >
                    <span className="hidden xs:inline">{language === 'JP' ? '次へ' : language === 'EN' ? 'Next' : 'Selanjutnya'}</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
