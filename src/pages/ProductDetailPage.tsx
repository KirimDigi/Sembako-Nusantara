import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PRODUCTS_DATA } from '../data/products';
import { HalalBadge } from '../components/product/HalalBadge';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'deskripsi' | 'komposisi' | 'pengiriman'>('deskripsi');
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  const product = PRODUCTS_DATA.find((p) => p.id === id) || PRODUCTS_DATA[0];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <Link to="/" className="hover:text-[#c41230] transition-colors">{t('home')}</Link>
        <span>/</span>
        <span className="text-stone-700">{getProductCategory()}</span>
        <span>/</span>
        <span className="text-[#c41230] font-bold truncate max-w-xs">{getProductName()}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-2xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm">
        {/* Left: Product Image */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            <img
              src={product.image}
              alt={getProductName()}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <HalalBadge isFrozen={product.isFrozen} />
            </div>
            {product.discountPercentage && (
              <span className="absolute top-4 right-4 bg-[#E11D48] text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                -{product.discountPercentage}%
              </span>
            )}
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
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#c41230]">
                  ¥{product.price.toLocaleString()}
                </span>
                <span className="text-xs text-stone-600 font-medium">
                  ({t('tax_included')} ¥{product.priceTax.toLocaleString()})
                </span>
              </div>
              {product.originalPrice && (
                <div className="text-xs text-stone-400 line-through">
                  {t('original_price')}: ¥{product.originalPrice.toLocaleString()}
                </div>
              )}
            </div>

            {/* Quantity Stepper & Add to Cart */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
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

              <button
                type="button"
                onClick={() => addToCart(product, quantity)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold py-3.5 px-8 rounded-xl shadow-md active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">shopping_cart</span>
                <span>{t('add_to_cart_full')}</span>
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
