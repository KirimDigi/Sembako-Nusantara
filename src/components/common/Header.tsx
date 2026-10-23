import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { TopBar } from './TopBar';
import { NavigationDrawer } from './NavigationDrawer';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { smartSearchProducts, SmartSearchResult } from '../../utils/smartSearch';
import { Product } from '../../types';
import { assetUrl } from '../../utils/assets';

export const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();
  const { t, language } = useLanguage();
  const { isAuthenticated, currentUser, isAdmin } = useAuth();
  const { products } = useAdmin();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize input value with URL query parameter
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Compute smart search results with prefix priority and typo tolerance
  const searchResult: SmartSearchResult = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        allRankedProducts: [],
        didYouMean: null,
        suggestedKeywords: [],
        totalMatches: 0
      };
    }
    return smartSearchProducts(searchQuery, products, { maxResults: 6 });
  }, [searchQuery, products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsDropdownOpen(true);

    // If on homepage or catalog page, update search query in real-time
    if (location.pathname === '/' || location.pathname === '/catalog') {
      const nextParams = new URLSearchParams(searchParams);
      if (val.trim()) {
        nextParams.set('q', val);
      } else {
        nextParams.delete('q');
      }
      setSearchParams(nextParams, { replace: true });
    }
  };

  const executeSearch = (queryText: string) => {
    const trimmed = queryText.trim();
    setIsDropdownOpen(false);
    if (location.pathname !== '/' && location.pathname !== '/catalog') {
      navigate(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : '/catalog');
    } else {
      const nextParams = new URLSearchParams(searchParams);
      if (trimmed) {
        nextParams.set('q', trimmed);
      } else {
        nextParams.delete('q');
      }
      setSearchParams(nextParams, { replace: true });
      const targetEl = document.getElementById('catalog-products-top');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSelectSuggestion = (keyword: string) => {
    setSearchQuery(keyword);
    executeSearch(keyword);
  };

  const handleSelectProduct = (product: Product) => {
    setIsDropdownOpen(false);
    navigate(`/product/${product.id}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    if (location.pathname === '/' || location.pathname === '/catalog') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('q');
      setSearchParams(nextParams, { replace: true });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-40 shadow-sm bg-white">
        {/* Top Utility Bar */}
        <TopBar />

        {/* Main Navigation Bar - Frozen & Sticky */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* 1. Brand Logo Link */}
            <Link
              to="/"
              className="flex items-center gap-2 group shrink-0"
              aria-label="Sembako Nusantara Home"
            >
              <img
                src={assetUrl('logo-transparent.png')}
                alt="Sembako Nusantara"
                className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* 2. Smart Search Bar Container with Live Autocomplete & Typo Correction */}
            <div
              ref={searchContainerRef}
              className="flex-1 min-w-0 max-w-2xl mx-1 sm:mx-3 relative"
            >
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative flex items-center w-full bg-white border-2 border-stone-300 hover:border-stone-400 focus-within:border-[#c41230] focus-within:ring-4 focus-within:ring-[#c41230]/15 rounded-full shadow-xs hover:shadow-sm transition-all pl-2.5 sm:pl-3.5 pr-1 py-0.5 sm:py-1">
                  <span className="material-symbols-outlined text-[#c41230] text-lg sm:text-xl font-bold shrink-0 pointer-events-none mr-1.5 sm:mr-2">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                    }}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsDropdownOpen(false);
                    }}
                    placeholder={
                      language === 'JP'
                        ? '商品名・調味料・麺類を検索...'
                        : language === 'EN'
                        ? 'Search spices, noodles, halal items...'
                        : 'Cari bumbu, mie, kecap, beras...'
                    }
                    className="w-full py-1 sm:py-1.5 text-xs sm:text-sm bg-transparent text-stone-900 font-medium placeholder:text-stone-500 focus:outline-none min-w-0"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="text-stone-400 hover:text-stone-700 p-1 mr-1 rounded-full hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                      title="Hapus pencarian"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg block">close</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-full shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 hover:shadow-sm"
                    title={language === 'JP' ? '検索' : language === 'EN' ? 'Search' : 'Cari'}
                  >
                    <span className="material-symbols-outlined text-sm sm:text-base">search</span>
                    <span className="hidden sm:inline">
                      {language === 'JP' ? '検索' : language === 'EN' ? 'Search' : 'Cari'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Live Smart Search Autocomplete & Typo Suggestion Floating Dropdown */}
              {isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-fadeIn">
                  {/* Typo Correction Banner ("Maksud Anda: ...?") */}
                  {searchResult.didYouMean && (
                    <div className="bg-amber-50 border-b border-amber-200/80 px-3.5 py-2 flex items-center justify-between text-xs text-amber-900">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <span className="material-symbols-outlined text-sm text-amber-600 shrink-0">lightbulb</span>
                        <span className="truncate">
                          {language === 'JP' ? 'もしかして:' : language === 'EN' ? 'Did you mean:' : 'Maksud Anda:'}{' '}
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(searchResult.didYouMean!)}
                            className="font-bold underline text-[#c41230] hover:text-[#a80f28] cursor-pointer"
                          >
                            {searchResult.didYouMean}
                          </button>
                          ?
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(searchResult.didYouMean!)}
                        className="text-[11px] font-bold bg-[#c41230] hover:bg-[#a80f28] text-white px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs cursor-pointer ml-2"
                      >
                        {language === 'JP' ? '適用' : language === 'EN' ? 'Use' : 'Terapkan'}
                      </button>
                    </div>
                  )}

                  {/* Alphabetical / Keyword Suggestions Pills */}
                  {searchResult.suggestedKeywords.length > 0 && (
                    <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-[#c41230]">auto_awesome</span>
                        {language === 'JP' ? '関連候補:' : language === 'EN' ? 'Suggestions:' : 'Saran Kata:'}
                      </span>
                      {searchResult.suggestedKeywords.slice(0, 6).map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleSelectSuggestion(kw)}
                          className="px-2.5 py-1 bg-white hover:bg-[#c41230] hover:text-white rounded-full text-xs font-semibold text-stone-700 transition-colors border border-stone-200 shadow-2xs shrink-0 cursor-pointer"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Top Matching Products Preview List */}
                  {searchResult.allRankedProducts.length > 0 ? (
                    <div className="divide-y divide-stone-100 max-h-72 sm:max-h-80 overflow-y-auto">
                      {searchResult.allRankedProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-stone-50 transition-colors flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = assetUrl('indomie-goreng.png');
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#c41230] transition-colors line-clamp-1">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                              <span className="truncate max-w-[140px]">{p.category}</span>
                              {p.isHalal && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                                  Halal
                                </span>
                              )}
                              {p.isFrozen && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-cyan-50 text-cyan-700 font-bold rounded border border-cyan-200">
                                  Frozen
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-extrabold text-[#c41230] font-mono">
                              ¥{p.price.toLocaleString('ja-JP')}
                            </span>
                            <span className="text-[10px] text-stone-400 block font-normal">
                              (税込 ¥{p.priceTax.toLocaleString('ja-JP')})
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 px-4 text-center text-xs text-stone-500 space-y-1">
                      <span className="material-symbols-outlined text-2xl text-stone-400 block mb-1">sentiment_dissatisfied</span>
                      <p className="font-semibold text-stone-700">
                        {language === 'JP' ? '該当する商品が見つかりませんでした' : language === 'EN' ? 'No products found' : 'Tidak menemukan produk'} "{searchQuery}"
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {language === 'JP' ? '別のキーワードやひらがな・アルファベットでお試しください' : language === 'EN' ? 'Try checking for typos or searching by brand' : 'Coba periksa ejaan kata kunci atau cari berdasarkan nama merek'}
                      </p>
                    </div>
                  )}

                  {/* Dropdown Footer: See all results in Catalog */}
                  <div className="bg-stone-50 px-3.5 py-2.5 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-stone-500 text-[11px]">
                      {searchResult.totalMatches} {language === 'JP' ? '件の一致' : language === 'EN' ? 'matching products' : 'produk ditemukan'}
                    </span>
                    <button
                      type="button"
                      onClick={() => executeSearch(searchQuery)}
                      className="font-bold text-[#c41230] hover:text-[#a80f28] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{language === 'JP' ? 'カタログで全て見る' : language === 'EN' ? 'View all in Catalog' : 'Lihat Semua di Katalog'}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Right Action Controls: Desktop Masuk/Daftar -> Wishlist -> Cart -> Hamburger Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Masuk / Daftar Akun Button - DESKTOP ONLY (hidden on mobile, wrapped inside Hamburger Drawer) */}
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 rounded-full text-xs font-bold text-stone-800 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  title="Profil Saya"
                >
                  <div className="w-6 h-6 rounded-full bg-[#c41230] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                    {currentUser?.name?.[0] || 'U'}
                  </div>
                  <span className="max-w-[100px] lg:max-w-[130px] truncate group-hover:text-[#c41230] transition-colors">
                    {currentUser?.name}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-extrabold rounded-md shadow-2xs">
                      Admin
                    </span>
                  )}
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 hover:border-[#c41230] rounded-full text-xs font-bold text-stone-800 hover:text-[#c41230] transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  title={language === 'JP' ? 'ログイン / 会員登録' : language === 'EN' ? 'Sign In / Register' : 'Masuk / Daftar Akun'}
                >
                  <span className="material-symbols-outlined text-lg text-[#c41230] group-hover:scale-110 transition-transform">
                    account_circle
                  </span>
                  <span className="whitespace-nowrap">
                    {language === 'JP' ? 'ログイン / 会員登録' : language === 'EN' ? 'Sign In / Register' : 'Masuk / Daftar Akun'}
                  </span>
                </Link>
              )}

              {/* Install PWA Shortcut Button */}
              <Link
                to="/pintasan"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 text-[#c41230] border border-red-200/90 rounded-full text-xs font-extrabold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                title={language === 'JP' ? 'アプリをホーム画面・デスクトップに追加' : language === 'EN' ? 'Install App Shortcut' : 'Pasang Pintasan Aplikasi di HP/PC'}
              >
                <span className="material-symbols-outlined text-[17px] text-[#c41230] group-hover:scale-110 transition-transform">
                  install_mobile
                </span>
                <span className="hidden xl:inline">
                  {language === 'JP' ? 'アプリ追加' : language === 'EN' ? 'Install App' : 'Pasang Pintasan'}
                </span>
              </Link>

              {/* Wishlist Heart Icon Link */}
              <Link
                to="/wishlist"
                className="relative p-1.5 sm:p-2 text-stone-700 hover:text-[#c41230] transition-colors rounded-full hover:bg-stone-50"
                title="Wishlist / Favorit Saya"
              >
                <span className="material-symbols-outlined text-2xl sm:text-[26px] block">
                  favorite
                </span>
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#c41230] text-white text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs">
                    {totalWishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart Icon Link */}
              <Link
                to="/cart"
                className="relative p-1.5 sm:p-2 text-stone-700 hover:text-[#c41230] transition-colors rounded-full hover:bg-stone-50 shrink-0"
                title={t('cart')}
              >
                <span className="material-symbols-outlined text-2xl sm:text-[26px] block">
                  shopping_cart
                </span>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#c41230] text-white text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Button - Wrapped Desktop & Mobile Nav Menu */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 sm:p-2 text-stone-800 hover:text-[#c41230] bg-stone-100 hover:bg-stone-200 active:bg-stone-300 transition-colors rounded-xl flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
                aria-label={t('menu')}
                title="Menu Navigasi"
              >
                <span className="material-symbols-outlined text-2xl sm:text-[26px] block">
                  menu
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-Over Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
