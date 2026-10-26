import React, { useState } from 'react';
import { Product, CartItem } from '../../types';
import { getCrossSellRecommendations, CrossSellItem } from '../../utils/crossSell';
import { useLanguage } from '../../context/LanguageContext';
import { convertJpyToIdr, formatIdr, formatJpy, getActiveExchangeRate } from '../../utils/currency';
import { resolveProductImage, getPlaceholderImage } from '../common/ProductImage';

interface CheckoutCrossSellProps {
  cart: CartItem[];
  allProducts: Product[];
  onAddToCart: (product: Product) => void;
}

export const CheckoutCrossSell: React.FC<CheckoutCrossSellProps> = ({
  cart,
  allProducts,
  onAddToCart
}) => {
  const { language } = useLanguage();
  const exchangeRate = getActiveExchangeRate();
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const recommendations = getCrossSellRecommendations(cart, allProducts);

  if (recommendations.length === 0) {
    return null;
  }

  // Detect whether customer is buying noodles to customize the header prompt
  const hasNoodles = cart.some(
    (item) =>
      item.product.category === 'Mie & Bihun' ||
      /mie|indomie|sedaap|bihun|gaga|ramen|noodle/i.test(item.product.name)
  );

  const handleAdd = (product: Product) => {
    onAddToCart(product);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const getLocalizedName = (product: Product) => {
    if (language === 'JP' && product.nameJp) return product.nameJp;
    if (language === 'EN' && product.nameEn) return product.nameEn;
    return product.name;
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/70 via-white to-red-50/40 rounded-2xl border-2 border-amber-200/80 p-4 shadow-sm space-y-3.5 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#c41230]">
            <span className="material-symbols-outlined text-base animate-pulse text-amber-500">
              shopping_bag
            </span>
            <span>
              {language === 'JP'
                ? 'あわせて購入されているおすすめ'
                : language === 'EN'
                ? 'Frequently Bought Together'
                : 'Lengkapi Pesanan Anda'}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300/60">
              {language === 'JP' ? 'おすすめ' : language === 'EN' ? 'Match' : 'Pas Banget'}
            </span>
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5 font-medium leading-tight">
            {hasNoodles
              ? language === 'JP'
                ? 'ラーメンのお供に！新鮮生卵やピリ辛チリソース、他のお気に入り麺もいかがですか？'
                : language === 'EN'
                ? 'Buying noodles? Pair with fresh eggs, hot chili sauce, or other flavors!'
                : 'Beli mie? Tambahkan telur segar, sambal ekstra pedas, atau varian mie lainnya!'
              : language === 'JP'
              ? 'ご注文の品と相性抜群の定番食材をワンクリックで追加できます'
              : language === 'EN'
              ? 'Complete your cart with these complementary best-sellers'
              : 'Produk pendamping yang paling sering dibeli bersamaan oleh pelanggan'}
          </p>
        </div>
      </div>

      {/* Cards List / Grid */}
      <div className="space-y-2.5">
        {recommendations.map(({ product, badge, reason }) => {
          const isJustAdded = addedItemIds[product.id];
          const priceTax = product.priceTax || Math.round((product.price || 0) * 1.08);
          const priceTaxIdr = convertJpyToIdr(priceTax, exchangeRate);
          const badgeText = badge[language] || badge.ID;
          const reasonText = reason[language] || reason.ID;

          return (
            <div
              key={product.id}
              className="group bg-white rounded-xl border border-stone-200/80 hover:border-amber-400 p-2.5 transition-all shadow-xs hover:shadow-md flex items-center justify-between gap-2.5"
            >
              {/* Product Image & Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img
                    src={resolveProductImage(product.image, language)}
                    alt={getLocalizedName(product)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceholderImage(language);
                    }}
                    className="w-12 h-12 rounded-lg object-contain p-0.5 bg-[#FAF8F5] border border-stone-200 group-hover:scale-105 transition-transform"
                  />
                  {product.isHalal && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-[8px] text-white font-black px-1 rounded-full shadow-xs">
                      HALAL
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Badge rationale */}
                  <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 mb-0.5 max-w-full truncate">
                    {badgeText}
                  </span>

                  {/* Name */}
                  <p className="font-bold text-xs text-stone-900 truncate group-hover:text-[#c41230] transition-colors">
                    {getLocalizedName(product)}
                  </p>

                  {/* Short Reason */}
                  <p className="text-[10px] text-stone-500 truncate leading-tight">
                    {reasonText}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-extrabold text-xs text-stone-900">
                      {formatJpy(priceTax)}
                    </span>
                    {language === 'ID' && (
                      <span className="text-[10px] text-stone-500 font-medium">
                        ≈ {formatIdr(priceTaxIdr)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <button
                type="button"
                onClick={() => handleAdd(product)}
                disabled={isJustAdded}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 ${
                  isJustAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-200'
                    : 'bg-stone-900 hover:bg-[#c41230] text-white hover:shadow-red-100'
                }`}
                title={language === 'JP' ? 'カートに追加' : language === 'EN' ? 'Add to cart' : 'Tambah ke pesanan'}
              >
                {isJustAdded ? (
                  <>
                    <span className="material-symbols-outlined text-xs">check</span>
                    <span>
                      {language === 'JP' ? '追加済' : language === 'EN' ? 'Added' : 'Ditambah'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xs">add_shopping_cart</span>
                    <span>
                      {language === 'JP' ? '追加' : language === 'EN' ? 'Add' : 'Tambah'}
                    </span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Free Shipping Hint */}
      <div className="pt-1 flex items-center justify-between text-[10px] text-stone-500">
        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
          <span className="material-symbols-outlined text-xs">local_shipping</span>
          <span>
            {language === 'JP'
              ? '合計金額がアップして送料無料に近づきます'
              : language === 'EN'
              ? 'Brings you closer to Free Shipping (¥10,000)'
              : 'Makin dekat ke Gratis Ongkir (min. ¥10.000)'}
          </span>
        </span>
      </div>
    </div>
  );
};
