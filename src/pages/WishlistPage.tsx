import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/product/ProductCard';
import { PRODUCTS_DATA } from '../data/products';
import { assetUrl } from '../utils/assets';

export const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const [allMovedToast, setAllMovedToast] = useState(false);

  const handleMoveAllToCart = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((p) => {
      addToCart(p, 1);
    });
    setAllMovedToast(true);
    setTimeout(() => {
      setAllMovedToast(false);
    }, 2500);
  };

  // Recommended products (top rated)
  const recommendedProducts = PRODUCTS_DATA.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#c41230] transition-colors">
          {language === 'JP' ? 'ホーム' : 'Beranda'}
        </Link>
        <span>/</span>
        <span className="text-stone-900 font-bold">
          {language === 'JP' ? 'お気に入り商品' : 'Wishlist Favorit'}
        </span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-50 via-white to-amber-50 p-6 sm:p-8 rounded-3xl border border-[#EBE5DF] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-100 text-[#c41230] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg fill-current">favorite</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-stone-900">
              {language === 'JP' ? 'お気に入りリスト' : 'Wishlist Produk Favorit'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600">
            {language === 'JP'
              ? `保存された商品: ${wishlist.length} 件`
              : `Daftar sembako & makanan halal favorit pilihan Anda (${wishlist.length} produk tersimpan)`}
          </p>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="px-4 py-2.5 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
              <span>{language === 'JP' ? 'すべてカートに入れる' : 'Pindahkan Semua ke Keranjang'}</span>
            </button>

            <button
              type="button"
              onClick={clearWishlist}
              className="px-3.5 py-2.5 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              <span>{language === 'JP' ? 'リストをクリア' : 'Kosongkan'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Toast when All Moved to Cart */}
      {allMovedToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-bold shadow-md animate-fade-in">
          <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
          <span>
            {language === 'JP'
              ? 'すべてのお気に入り商品がカートに追加されました！'
              : 'Semua produk favorit berhasil ditambahkan ke keranjang belanja Anda!'}
          </span>
          <Link
            to="/cart"
            className="ml-auto underline text-[#c41230] hover:text-[#9a0021] font-extrabold whitespace-nowrap"
          >
            {language === 'JP' ? 'カートを見る &rarr;' : 'Buka Keranjang &rarr;'}
          </Link>
        </div>
      )}

      {/* Wishlist Items Grid or Empty State */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#EBE5DF] p-8 sm:p-14 text-center space-y-5 shadow-xs max-w-2xl mx-auto">
          <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto relative flex items-center justify-center">
            <img
              src={assetUrl('mascot-love.png')}
              alt="Mascot Love Sembako Nusantara"
              className="w-full h-full object-contain drop-shadow-md animate-bounce-ball-slow"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-stone-900">
              {language === 'JP'
                ? 'お気に入りはまだありません'
                : 'Wishlist Anda Masih Kosong'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
              {language === 'JP'
                ? '気になる商品を見つけたら、ハートマークをクリックしてお気に入りリストに保存できます。'
                : 'Temukan bumbu khas nusantara, mie instan, atau frozen food halal favorit Anda dan klik tombol hati (❤️) untuk menyimpannya di sini.'}
            </p>
          </div>

          <div className="pt-3">
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>{language === 'JP' ? '商品カタログを見る' : 'Mulai Jelajahi Produk'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Recommended Products Carousel / Grid */}
      <div className="pt-8 border-t border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-heading font-black text-stone-900">
              {language === 'JP' ? 'おすすめのハラール食品' : 'Rekomendasi Produk Sembako Halal'}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'JP' ? '日本全国の留学生・在日インドネシア人に人気の商品' : 'Produk paling diminati diaspora Indonesia di seluruh 47 prefektur Jepang'}
            </p>
          </div>
          <Link
            to="/catalog"
            className="text-xs font-bold text-[#c41230] hover:underline flex items-center gap-1"
          >
            <span>{language === 'JP' ? 'すべて見る' : 'Lihat Semua'}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {recommendedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};
