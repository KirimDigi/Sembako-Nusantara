import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { HalalBadge } from './HalalBadge';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const [justAdded, setJustAdded] = useState(false);

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

  const handleAddToCart = () => {
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl border border-[#EBE5DF] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group hover:-translate-y-1">
      {/* Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={getProductName()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-2.5 left-2.5">
          <HalalBadge isFrozen={product.isFrozen} />
        </div>
        {product.discountPercentage && (
          <span className="absolute top-2.5 right-2.5 bg-[#E11D48] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            -{product.discountPercentage}%
          </span>
        )}
      </div>

      {/* Info Block */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
            {getProductCategory()}
          </span>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-stone-900 text-sm line-clamp-2 mt-1 group-hover:text-[#c41230] transition-colors">
              {getProductName()}
            </h3>
          </Link>
          <p className="text-[11px] text-stone-400 mt-1">
            {getProductUnit()}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-500">
            <span className="material-symbols-outlined text-sm fill-current">star</span>
            <span className="font-bold text-stone-800">{product.rating}</span>
            <span className="text-stone-400">({product.reviewCount} {t('reviews')})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg text-[#c41230] leading-none">
              ¥{product.price.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              ({t('tax_included')} ¥{product.priceTax.toLocaleString()})
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer ${
              justAdded
                ? 'bg-[#15803D] text-white scale-105'
                : 'bg-[#c41230] hover:bg-[#9a0021] text-white active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {justAdded ? 'check' : 'add_shopping_cart'}
            </span>
            <span>{justAdded ? 'Ditambahkan!' : t('add_to_cart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

