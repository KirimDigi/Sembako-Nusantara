import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const FloatingCartToast: React.FC = () => {
  const { toastItem, hideToast, totalItems, subtotalTax } = useCart();
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toastItem) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(hideToast, 300);
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [toastItem, hideToast]);

  if (!toastItem && !isVisible) return null;
  if (!toastItem) return null;

  const { product, quantity } = toastItem;

  const getProductName = () => {
    if (language === 'JP' && product.nameJp) return product.nameJp;
    if (language === 'EN' && product.nameEn) return product.nameEn;
    return product.name;
  };

  return (
    <div
      className={`fixed top-24 right-4 sm:right-8 z-[9999] max-w-sm sm:max-w-md w-[calc(100vw-2rem)] transition-all duration-300 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-red-100 border-l-4 border-l-[#c41230] p-4 flex flex-col gap-3 backdrop-blur-md">
        {/* Header with Red Checkmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Ceklis Merah Mengambang (Red Checkmark Badge) */}
            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 text-[#c41230] flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <span className="material-symbols-outlined text-xl font-bold">check_circle</span>
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm leading-tight flex items-center gap-1.5">
                <span>
                  {language === 'JP'
                    ? 'カートに追加しました！'
                    : language === 'EN'
                    ? 'Added to Cart!'
                    : 'Berhasil Ditambahkan ke Keranjang!'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-[#c41230] text-[10px] font-bold">
                  +{quantity}
                </span>
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {totalItems} {language === 'JP' ? '点の商品' : language === 'EN' ? 'items in cart' : 'produk di keranjang'} • Total ¥{subtotalTax.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(hideToast, 250);
            }}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Product Item Preview */}
        <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-contain bg-white border border-stone-200 shrink-0 p-1"
          />
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-stone-800 text-xs truncate">
              {getProductName()}
            </h5>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-[#c41230] text-xs">
                ¥{product.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-stone-400">
                (Pajak ¥{product.priceTax.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: View Cart */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            to="/cart"
            onClick={() => {
              setIsVisible(false);
              hideToast();
            }}
            className="flex-1 py-2 px-4 bg-[#c41230] hover:bg-[#9a0021] text-white text-xs font-bold rounded-xl text-center shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">shopping_cart</span>
            <span>{language === 'JP' ? 'カートを見る' : language === 'EN' ? 'View Cart' : 'Lihat Keranjang'}</span>
          </Link>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(hideToast, 250);
            }}
            className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all"
          >
            {language === 'JP' ? '続ける' : language === 'EN' ? 'Continue' : 'Lanjut Belanja'}
          </button>
        </div>
      </div>
    </div>
  );
};
