import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS_DATA } from '../data/products';
import { HalalBadge } from '../components/product/HalalBadge';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import { getEffectiveUnitPrice, parseMinQty } from '../utils/pricing';
import { resolveProductImage, getPlaceholderImage } from '../components/common/ProductImage';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'deskripsi' | 'komposisi' | 'pengiriman'>('deskripsi');
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { language, t } = useLanguage();
  const { itemDiscounts } = useAdmin();

  const product = PRODUCTS_DATA.find((p) => p.id === id) || PRODUCTS_DATA[0];
  const isWishlisted = isInWishlist(product.id);

  // Dynamic discount calculation strictly synchronized with Admin Dashboard
  const activeDisc = itemDiscounts.find(
    (d) => d.isActive && (d.productId === product.id || d.productSku === (product as any).sku || d.productName?.toLowerCase() === product.name.toLowerCase())
  );
  const discountPercent = activeDisc
    ? (activeDisc.discountType === 'PERCENTAGE'
        ? activeDisc.discountValue
        : Math.round(((product.price - activeDisc.discountedPriceJPY) / product.price) * 100))
    : (product.discountPercentage || 0);

  const bulkEffect = getEffectiveUnitPrice(product, quantity);
  const currentPrice = activeDisc?.discountedPriceJPY ?? (bulkEffect.isBulk ? bulkEffect.price : product.price);
  const currentPriceTax = activeDisc?.discountedPriceJPY
    ? Math.round(activeDisc.discountedPriceJPY * 1.08)
    : (bulkEffect.isBulk ? bulkEffect.priceTax : product.priceTax);

  const getProductName = () => {
    if (language === 'JP') return product.nameJp;
    if (language === 'EN') return product.nameEn;
    return product.name;
  };

  const getProductCategory = () => {
    if (language === 'JP') return product.categoryJp;
    if (language === 'EN') return product.categoryEn;
    return product.category;
  };

  const getProductUnit = () => {
    if (language === 'JP') return product.unitJp;
    if (language === 'EN') return product.unitEn;
    return product.unit;
  };

  const getProductDescription = () => {
    if (language === 'JP') return product.descriptionJp;
    if (language === 'EN') return product.descriptionEn;
    return product.description;
  };

  const getProductIngredients = () => {
    if (language === 'JP') return product.ingredientsJp || product.ingredients;
    if (language === 'EN') return product.ingredientsEn || product.ingredients;
    return product.ingredients;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-6">
        <Link to="/" className="hover:text-[#c41230] transition-colors">
          {language === 'JP' ? 'ホーム' : 'Beranda'}
        </Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-[#c41230] transition-colors">
          {getProductCategory()}
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-bold truncate max-w-[200px] sm:max-w-none">
          {getProductName()}
        </span>
      </nav>

      {/* Main Grid: Gallery & Details */}
      <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Image */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            <img
              src={resolveProductImage(product.image, language)}
              alt={getProductName()}
              onError={(e) => {
                (e.target as HTMLImageElement).src = getPlaceholderImage(language);
              }}
              className="w-full h-full object-contain p-4 bg-[#FAF8F5]"
            />
            <div className="absolute top-4 left-4">
              <HalalBadge isFrozen={product.isFrozen} />
            </div>
            {discountPercent > 0 && (
              <span className="absolute top-4 right-14 bg-[#E11D48] text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                -{discountPercent}%
              </span>
            )}

            {/* Wishlist Button on Image */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={isWishlisted ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md z-10 cursor-pointer ${
                isWishlisted
                  ? 'bg-red-50 text-[#c41230] scale-105 border border-red-200'
                  : 'bg-white/90 hover:bg-white text-stone-400 hover:text-[#c41230] hover:scale-110'
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl transition-transform ${
                  isWishlisted ? 'fill-current scale-110 text-[#c41230]' : ''
                }`}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

        {/* Right: Product Spec & Action */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c41230] bg-[#FFDAD9] px-2.5 py-1 rounded-md">
                {product.brand}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
                {getProductName()}
              </h1>
              <p className="text-xs text-stone-400 font-medium mt-1">
                {getProductUnit()}
              </p>
            </div>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <span className="material-symbols-outlined text-base fill-current">star</span>
                <span>{product.rating}</span>
                <span className="text-stone-400 font-normal">({product.reviewCount} {t('reviews')})</span>
              </div>
              <span className="text-stone-300">|</span>
              <span className="text-[#15803D] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                {t('stock_available')} ({product.stock} {getProductUnit()})
              </span>
            </div>

            {/* Price Card */}
            <div className="bg-[#FDF8F0] p-4 rounded-xl border border-[#EBE5DF] space-y-1">
              {currentPrice > 0 ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[#c41230]">
                      ¥{currentPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-600 font-medium">
                      ({t('tax_included')} ¥{currentPriceTax.toLocaleString()})
                    </span>
                  </div>
                  {discountPercent > 0 && activeDisc?.originalPriceJPY ? (
                    <div className="text-xs text-stone-400 line-through">
                      {t('original_price')}: ¥{activeDisc.originalPriceJPY.toLocaleString()}
                    </div>
                  ) : product.originalPrice ? (
                    <div className="text-xs text-stone-400 line-through">
                      {t('original_price')}: ¥{product.originalPrice.toLocaleString()}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="py-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>{language === 'JP' ? '価格設定中（近日公開）' : language === 'EN' ? 'Price Pending (Coming Soon)' : 'Harga Segera Dirilis (TBD)'}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {language === 'JP' ? 'この商品は現在マスター登録済みで、まもなく正式販売開始となります。' : 'Produk ini terdaftar resmi dalam master katalog dan sedang menunggu rilis harga final.'}
                  </p>
                </div>
              )}
            </div>

            {/* Wholesale Bulk Pricing Tiers (Sheet 03 Pricing) */}
            {product.bulkPrices && (
              (() => {
                const q1 = parseMinQty(product.bulkPrices.tier1_qty, 6);
                const q2 = parseMinQty(product.bulkPrices.tier2_qty, 12);
                const q3 = parseMinQty(product.bulkPrices.tier3_qty, 24);
                const p1 = product.bulkPrices.tier1_price || Math.round(product.price * 0.95);
                const p2 = product.bulkPrices.tier2_price || Math.round(product.price * 0.9);
                const p3 = product.bulkPrices.tier3_price || Math.round(product.price * 0.85);

                return (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                        <span className="material-symbols-outlined text-base text-blue-600">layers</span>
                        <span>
                          {language === 'JP'
                            ? '卸売・まとめ買い価格 (Bulk)'
                            : language === 'EN'
                            ? 'Wholesale Bulk Pricing'
                            : 'Harga Grosir (Wholesale Bulk)'}
                        </span>
                      </div>
                      {bulkEffect.isBulk && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                          ✓ {bulkEffect.tierLabel} Aktif (-{bulkEffect.savingsPercent}%)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Tier 1 */}
                      <div
                        onClick={() => setQuantity(q1)}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                          quantity >= q1 && quantity < q2
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102'
                            : 'bg-white hover:bg-blue-50 text-stone-700 border-blue-100'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-80">{q1}–{q2 - 1} Pcs</div>
                        <div className="text-sm font-black mt-0.5">¥{p1.toLocaleString()}</div>
                        <div className="text-[9px] opacity-75">/ pcs</div>
                      </div>

                      {/* Tier 2 */}
                      <div
                        onClick={() => setQuantity(q2)}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                          quantity >= q2 && quantity < q3
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102'
                            : 'bg-white hover:bg-blue-50 text-stone-700 border-blue-100'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-80">{q2}+ Pcs</div>
                        <div className="text-sm font-black mt-0.5">¥{p2.toLocaleString()}</div>
                        <div className="text-[9px] opacity-75">/ pcs</div>
                      </div>

                      {/* Tier 3 */}
                      <div
                        onClick={() => setQuantity(q3)}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                          quantity >= q3
                            ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm scale-102'
                            : 'bg-white hover:bg-blue-50 text-stone-700 border-blue-100'
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-80">1 Dus ({q3}+)</div>
                        <div className="text-sm font-black mt-0.5">¥{p3.toLocaleString()}</div>
                        <div className="text-[9px] opacity-75">Termurah</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Quantity Stepper, Add to Cart & Wishlist Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-stone-600 hover:bg-stone-100 font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="px-5 py-3 font-bold text-sm text-stone-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-stone-600 hover:bg-stone-100 font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              {currentPrice > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    const productToAdd = activeDisc ? { ...product, price: currentPrice, priceTax: currentPriceTax } : product;
                    addToCart(productToAdd, quantity);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold py-3.5 px-6 sm:px-8 rounded-xl shadow-md active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">shopping_cart</span>
                  <span>{t('add_to_cart_full')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-stone-100 text-stone-400 font-bold py-3.5 px-6 sm:px-8 rounded-xl border border-stone-200 cursor-not-allowed text-sm sm:text-base"
                >
                  <span className="material-symbols-outlined text-xl">hourglass_empty</span>
                  <span>{language === 'JP' ? '価格設定待ち（注文不可）' : 'Menunggu Penetapan Harga'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`py-3.5 px-4 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  isWishlisted
                    ? 'border-[#c41230] bg-red-50 text-[#c41230]'
                    : 'border-stone-200 hover:border-red-300 text-stone-700 bg-white hover:bg-red-50/50'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isWishlisted ? 'fill-current text-[#c41230]' : ''}`}>
                  favorite
                </span>
                <span className="hidden sm:inline">
                  {isWishlisted
                    ? (language === 'JP' ? 'お気に入り済み' : 'Tersimpan')
                    : (language === 'JP' ? 'お気に入り' : 'Wishlist')}
                </span>
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#15803D]">check_circle</span>
              <span>{t('pillar_halal_title')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c41230]">local_shipping</span>
              <span>{t('pillar_delivery_title')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Ingredients, Delivery */}
      <div className="mt-10 bg-white rounded-2xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-6 border-b border-stone-200 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('deskripsi')}
            className={`font-bold text-sm pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'deskripsi'
                ? 'border-[#c41230] text-[#c41230]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'JP' ? '商品説明' : language === 'EN' ? 'Product Description' : 'Deskripsi Produk'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('komposisi')}
            className={`font-bold text-sm pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'komposisi'
                ? 'border-[#c41230] text-[#c41230]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'JP' ? '原材料・成分' : language === 'EN' ? 'Ingredients' : 'Komposisi / Bahan'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pengiriman')}
            className={`font-bold text-sm pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'pengiriman'
                ? 'border-[#c41230] text-[#c41230]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {language === 'JP' ? '配送のご案内' : language === 'EN' ? 'Shipping Information' : 'Info Pengiriman'}
          </button>
        </div>

        <div className="pt-6 text-sm text-stone-700 leading-relaxed">
          {activeTab === 'deskripsi' && (
            <p>{getProductDescription()}</p>
          )}

          {activeTab === 'komposisi' && (
            <div>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                {getProductIngredients()?.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'pengiriman' && (
            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                {language === 'JP'
                  ? 'ヤマト運輸（宅急便）および佐川急便にてお届けします。本州・四国・九州は発送後1〜2日、北海道・沖縄は2〜3日で到着します。'
                  : language === 'EN'
                  ? 'Delivered via Yamato Transport Takkyubin and Sagawa Express. 1-2 business days for Honshu, Shikoku, Kyushu, and 2-3 days for Hokkaido & Okinawa.'
                  : 'Dikirim melalui kurir resmi Yamato Takkyubin & Sagawa Express. Estimasi sampai 1-2 hari kerja untuk pulau Honshu, Shikoku, Kyushu, dan 2-3 hari untuk Hokkaido & Okinawa.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
