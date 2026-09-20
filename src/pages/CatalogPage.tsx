import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS_DATA } from '../data/products';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';

export const CatalogPage: React.FC = () => {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('cat_all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'name'>('popular');
  const [filterFrozenOnly, setFilterFrozenOnly] = useState(false);
  const [filterHalalOnly, setFilterHalalOnly] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

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

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS_DATA.filter((p) => {
      // Category match
      if (!matchesCategory(p, selectedCategory)) {
        return false;
      }
      // Frozen filter
      if (filterFrozenOnly && !p.isFrozen) {
        return false;
      }
      // Halal filter
      if (filterHalalOnly && !p.isHalal) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchJp = p.nameJp?.toLowerCase().includes(query);
        const matchEn = p.nameEn?.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        const matchBrand = p.brand?.toLowerCase().includes(query);
        if (!matchName && !matchJp && !matchEn && !matchCat && !matchBrand) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.reviewCount || 0) - (a.reviewCount || 0); // popular default
    });
  }, [searchQuery, selectedCategory, sortBy, filterFrozenOnly, filterHalalOnly]);

  // Pagination calculations (16 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const getProductName = (p: Product) => {
    if (language === 'JP' && p.nameJp) return p.nameJp;
    if (language === 'EN' && p.nameEn) return p.nameEn;
    return p.name;
  };

  const getCategoryLabel = (cat: typeof categories[0]) => {
    if (language === 'JP') return cat.labelJp;
    if (language === 'EN') return cat.labelEn;
    return cat.labelId;
  };

  return (
    <div className="w-full pb-20">
      {/* Top Banner & Title Section */}
      <section className="bg-gradient-to-b from-white to-[#FDF8F0] border-b border-[#EBE5DF] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-red-100 text-[#c41230] font-bold text-xs rounded-full">
                  100+ SKU Ready Stock
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  100% Halal
                </span>
              </div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
                {language === 'JP' ? 'インドネシア食材・ハラールカタログ' : language === 'EN' ? 'Indonesian Halal Grocery Catalog' : 'Katalog Produk Sembako Nusantara'}
              </h1>
              <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl">
                {language === 'JP'
                  ? '本場のインドネシア調味料、インスタント麺、冷凍食品などを日本全国47都道府県へ即日発送いたします。'
                  : language === 'EN'
                  ? 'Authentic Indonesian spices, instant noodles, frozen food, and groceries delivered across all 47 prefectures in Japan.'
                  : 'Pilihan lengkap sembako, bumbu asli, mie instan, dan frozen food halal terbesar se-Jepang dengan pengiriman kilat Yamato & Sagawa.'}
              </p>
            </div>

            {/* Quick Search Box */}
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'JP' ? '商品を検索...' : language === 'EN' ? 'Search products...' : 'Cari bumbu, mie, kecap...'}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-stone-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c41230] shadow-sm"
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-stone-400 text-xl">
                  search
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="material-symbols-outlined absolute right-3 top-3 text-stone-400 hover:text-stone-700 text-xl"
                  >
                    close
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Horizontal Category Pill Bar */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
        </div>
      </section>

      {/* Main Content Area: Controls + Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter and Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-stone-600">
            <span>
              Menampilkan <strong className="text-stone-900 font-bold">{filteredProducts.length}</strong> produk
              {totalPages > 1 && (
                <span className="text-stone-400 font-normal ml-2">
                  (Halaman {currentPage} dari {totalPages})
                </span>
              )}
            </span>
            {/* Quick Toggle Filters */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 text-xs">
              <input
                type="checkbox"
                checked={filterFrozenOnly}
                onChange={(e) => {
                  setFilterFrozenOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-[#c41230] focus:ring-[#c41230]"
              />
              <span>❄️ Frozen Food</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 text-xs">
              <input
                type="checkbox"
                checked={filterHalalOnly}
                onChange={(e) => {
                  setFilterHalalOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-[#c41230] focus:ring-[#c41230]"
              />
              <span>✅ 100% Halal</span>
            </label>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#c41230] shadow-sm cursor-pointer"
            >
              <option value="popular">Paling Populer</option>
              <option value="price_asc">Harga: Rendah ke Tinggi</option>
              <option value="price_desc">Harga: Tinggi ke Rendah</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="name">Nama Produk (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 mt-8 p-8">
            <span className="material-symbols-outlined text-6xl text-stone-300 block mb-3">
              search_off
            </span>
            <h3 className="font-serif font-bold text-xl text-stone-800">
              Tidak ada produk yang cocok
            </h3>
            <p className="text-stone-500 text-sm mt-1 max-w-md mx-auto">
              Coba gunakan kata kunci pencarian lain atau ubah filter kategori Anda.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('cat_all');
                setFilterFrozenOnly(false);
                setFilterHalalOnly(false);
                setCurrentPage(1);
              }}
              className="mt-4 px-6 py-2.5 bg-[#c41230] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#9a0021] transition-all cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 mt-8">
              {paginatedProducts.map((product) => {
                const isAdded = addedProductId === product.id;
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                  >
                    {/* Image Container with Badges */}
                    <Link to={`/product/${product.id}`} className="block relative bg-stone-50 overflow-hidden pt-[100%]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Badges on Top of Image */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                        {product.isHalal && (
                          <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#15803D] font-bold text-[10px] rounded-md shadow-sm border border-emerald-200">
                            HALAL
                          </span>
                        )}
                        {product.isFrozen && (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-bold text-[10px] rounded-md shadow-sm border border-sky-200">
                            ❄️ FROZEN
                          </span>
                        )}
                      </div>

                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#c41230] text-white font-bold text-[10px] rounded-md shadow-sm">
                          -{product.discountPercentage}%
                        </span>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium mb-1">
                          <span className="text-[#c41230] font-semibold">{product.category}</span>
                          {product.unit && <span>{product.unit}</span>}
                        </div>

                        <Link to={`/product/${product.id}`} className="block group-hover:text-[#c41230] transition-colors">
                          <h3 className="font-bold text-stone-900 text-sm line-clamp-2 leading-snug">
                            {getProductName(product)}
                          </h3>
                        </Link>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-stone-500">
                          <div className="flex items-center text-amber-500">
                            <span className="material-symbols-outlined text-sm">star</span>
                            <span className="font-bold ml-0.5 text-stone-800">{product.rating}</span>
                          </div>
                          <span>•</span>
                          <span className="text-[11px]">({product.reviewCount} ulasan)</span>
                        </div>
                      </div>

                      {/* Pricing & Add to Cart */}
                      <div className="mt-4 pt-3 border-t border-stone-100">
                        <div className="flex items-baseline justify-between mb-2">
                          <div>
                            <span className="font-bold text-[#c41230] text-base sm:text-lg">
                              ¥{product.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-stone-400 ml-1">
                              (Pajak ¥{product.priceTax.toLocaleString()})
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                            isAdded
                              ? 'bg-red-700 text-white shadow-md'
                              : 'bg-[#c41230] hover:bg-[#9a0021] text-white hover:shadow-md'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isAdded ? 'check_circle' : 'add_shopping_cart'}
                          </span>
                          <span>{isAdded ? 'Berhasil Ditambahkan!' : 'Tambah ke Keranjang'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Bar */}
            {totalPages > 1 && (
              <div className="mt-12 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-stone-500">
                  Menampilkan <strong className="text-stone-900">{((currentPage - 1) * itemsPerPage) + 1}</strong> - <strong className="text-stone-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> dari <strong className="text-stone-900">{filteredProducts.length}</strong> produk
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition-all ${
                      currentPage === 1
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 shadow-sm cursor-pointer'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    <span>Sebelumnya</span>
                  </button>

                  {/* Numbered Page Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isActive = pageNum === currentPage;
                      // Show all if totalPages <= 7, otherwise condense
                      if (
                        totalPages > 7 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - currentPage) > 1
                      ) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return (
                            <span key={pageNum} className="px-1.5 text-stone-400 text-xs font-bold">
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
                          className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
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
                    className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition-all ${
                      currentPage === totalPages
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 shadow-sm cursor-pointer'
                    }`}
                  >
                    <span>Selanjutnya</span>
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
