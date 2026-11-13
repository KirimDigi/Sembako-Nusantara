import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { assetUrl } from '../../utils/assets';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useExchangeRate, convertJpyToIdr, formatIdr } from '../../utils/currency';

export const DraggableWhatsAppButton: React.FC = () => {
  const { language } = useLanguage();
  const { subtotalTax, freeShippingThreshold, isFreeShipping, remainingForFreeShipping } = useCart();
  const exchangeRate = useExchangeRate();
  const remainingIdr = convertJpyToIdr(remainingForFreeShipping, exchangeRate);
  const thresholdIdr = convertJpyToIdr(freeShippingThreshold, exchangeRate);
  const progressPercent = Math.min(100, Math.round((subtotalTax / freeShippingThreshold) * 100));

  const isDraggingRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [showShippingPopover, setShowShippingPopover] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowShippingPopover(false);
      }
    };
    if (showShippingPopover) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showShippingPopover]);

  // Monitor scroll position to show/hide the Scroll-To-Top arrow
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
  };

  const handleDrag = (_: any, info: { delta: { x: number; y: number } }) => {
    dragDistanceRef.current += Math.abs(info.delta.x) + Math.abs(info.delta.y);
  };

  const handleDragEnd = () => {
    // Keep isDraggingRef true for a short moment so click event is ignored
    setTimeout(() => {
      isDraggingRef.current = false;
      dragDistanceRef.current = 0;
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    // If dragged even slightly (> 6px), treat as drag instead of click
    if (isDraggingRef.current || dragDistanceRef.current > 6) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Direct tap/click without drag opens WhatsApp chat
    window.open(
      'https://wa.me/6285773875762?text=Halo%20Sembako%20Nusantara,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20pemesanan',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 select-none cursor-grab touch-none flex flex-col items-center gap-2.5"
      style={{ touchAction: 'none' }}
    >
      {/* 1. Scroll to Top Hook Arrow Button (Directly ABOVE Free Shipping Icon) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top-btn"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={handleScrollToTop}
            aria-label="Kembali ke atas"
            title={
              language === 'JP'
                ? 'トップへ戻る'
                : language === 'EN'
                ? 'Back to Top'
                : 'Kembali ke Atas'
            }
            className="flex items-center justify-center w-10 h-10 bg-white hover:bg-stone-50 text-stone-700 hover:text-[#c41230] rounded-full shadow-xl border-2 border-stone-200/90 cursor-pointer pointer-events-auto backdrop-blur-sm group transition-colors"
          >
            <span className="material-symbols-outlined text-xl font-black group-hover:-translate-y-0.5 transition-transform text-[#c41230]">
              arrow_upward
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. Small Free Shipping Info Icon (Directly ABOVE WhatsApp Button) */}
      <div ref={popoverRef} className="relative group flex items-center">
        {/* Interactive Floating Popover with Full Free Shipping Info */}
        <AnimatePresence>
          {showShippingPopover && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-full mr-3 bottom-0 w-72 sm:w-80 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-stone-200 p-4 text-stone-900 pointer-events-auto z-50 text-left"
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
                      isFreeShipping ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-[#c41230]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isFreeShipping ? 'verified' : 'local_shipping'}
                    </span>
                  </span>
                  <div>
                    <h4 className="text-xs font-black tracking-tight text-stone-900">
                      {isFreeShipping
                        ? (language === 'JP' ? '送料無料 達成！' : language === 'EN' ? 'Free Shipping Unlocked!' : 'Gratis Ongkir Aktif!')
                        : (language === 'JP' ? '送料無料まであと少し！' : language === 'EN' ? 'Free Shipping Tracker' : 'Info Gratis Ongkir')}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-medium block">
                      {language === 'JP' ? 'ヤマト運輸・佐川急便' : 'Ekspedisi Yamato & Sagawa'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShippingPopover(false);
                  }}
                  className="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Tutup"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Popover Content */}
              {isFreeShipping ? (
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                    <p className="font-bold flex items-center gap-1 text-emerald-800">
                      <span>🎉</span>
                      <span>
                        {language === 'JP'
                          ? '日本全国、送料無料でお届けします！'
                          : language === 'EN'
                          ? 'Your order qualifies for Free Shipping nationwide!'
                          : 'Selamat! Pesanan Anda berhak mendapatkan Gratis Ongkir Se-Jepang.'}
                      </span>
                    </p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      {language === 'JP'
                        ? '合計 ¥15,000 以上のお買い物が適用されています。'
                        : `Total belanja saat ini: ¥${subtotalTax.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-xs text-stone-700 leading-snug">
                    <span>
                      {language === 'JP' ? '送料無料まであと ' : language === 'EN' ? 'Add ' : 'Belanja kurang '}
                    </span>
                    <strong className="text-[#c41230] font-black font-mono text-sm underline decoration-[#c41230]/30">
                      ¥{remainingForFreeShipping.toLocaleString()}
                    </strong>
                    <span className="text-stone-400 text-[11px] ml-1 font-semibold">
                      ({formatIdr(remainingIdr)})
                    </span>
                    <span>
                      {language === 'JP'
                        ? ' で全国送料無料になります！'
                        : language === 'EN'
                        ? ' more to get Free Shipping!'
                        : ' lagi untuk dapatkan Gratis Ongkir se-Jepang!'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-stone-500">
                      <span>¥{subtotalTax.toLocaleString()}</span>
                      <span className="text-[#c41230] font-black">{progressPercent}%</span>
                      <span>Min. ¥15,000</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200/80">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-[#c41230] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-400 leading-tight">
                    * {language === 'JP'
                        ? '合計 ¥15,000 以上のお買い物で全国送料無料'
                        : `Gratis ongkir otomatis berlaku untuk total belanja minimal ¥15,000 (${formatIdr(thresholdIdr)}).`}
                  </p>
                </div>
              )}

              {/* Quick Action Button to Cart */}
              <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                <Link
                  to="/cart"
                  onClick={() => setShowShippingPopover(false)}
                  className="w-full py-1.5 px-3 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">shopping_cart</span>
                  <span>{language === 'JP' ? 'カートを見る' : language === 'EN' ? 'View Cart' : 'Lihat Keranjang'}</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small Desktop Preview Tag (Hover Tooltip di Samping Kiri Icon) */}
        {!showShippingPopover && (
          <div className="hidden lg:flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-stone-200 text-[11px] font-bold text-stone-800 pointer-events-none transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 mr-2 whitespace-nowrap">
            <span
              className={`w-2 h-2 rounded-full ${
                isFreeShipping ? 'bg-emerald-500 animate-pulse' : 'bg-[#c41230] animate-ping'
              }`}
            />
            <span>
              {isFreeShipping
                ? 'Gratis Ongkir Aktif!'
                : `Kurang ¥${remainingForFreeShipping.toLocaleString()} lagi Gratis Ongkir`}
            </span>
          </div>
        )}

        {/* The Small Icon Button Above WhatsApp */}
        <button
          type="button"
          onClick={(e) => {
            if (isDraggingRef.current || dragDistanceRef.current > 6) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            setShowShippingPopover((prev) => !prev);
          }}
          aria-label="Info Gratis Ongkir"
          title={
            isFreeShipping
              ? 'Selamat! Gratis Ongkir Aktif'
              : `Belanja kurang ¥${remainingForFreeShipping.toLocaleString()} lagi untuk Gratis Ongkir`
          }
          className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-xl transition-all border-2 cursor-pointer pointer-events-auto active:scale-95 ${
            isFreeShipping
              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-500 text-emerald-700'
              : 'bg-white hover:bg-red-50 border-[#c41230] text-[#c41230]'
          }`}
        >
          {/* Progress % or Free Badge */}
          <span
            className={`absolute -top-1 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs border ${
              isFreeShipping
                ? 'bg-emerald-600 text-white border-white'
                : 'bg-[#c41230] text-white border-white animate-pulse'
            }`}
          >
            {isFreeShipping ? 'FREE' : `${progressPercent}%`}
          </span>

          {/* Delivery Truck Icon */}
          <span className="material-symbols-outlined text-2xl">
            {isFreeShipping ? 'verified' : 'local_shipping'}
          </span>
        </button>
      </div>

      {/* 3. WhatsApp Floating Button Container */}
      <div className="relative group flex items-center gap-2">
        {/* Subtle desktop hover tooltip */}
        <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-emerald-100 text-[11px] font-bold text-stone-800 pointer-events-none transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {language === 'JP'
              ? 'WhatsAppでお問い合わせ'
              : language === 'EN'
              ? 'Chat WhatsApp CS'
              : 'Chat WhatsApp CS'}
          </span>
        </div>

        {/* Directly Draggable WhatsApp Floating Button */}
        <button
          type="button"
          onClick={handleClick}
          aria-label="Chat WhatsApp CS"
          className="relative flex items-center justify-center w-14 h-14 bg-white hover:bg-stone-50 rounded-full shadow-2xl transition-all border-2 border-emerald-400 focus:outline-none cursor-grab active:cursor-grabbing pointer-events-auto"
        >
          {/* Radar Wave Rings (Green Pulse Effect) */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none"></span>
          <span className="absolute -inset-1.5 rounded-full bg-emerald-400 opacity-20 animate-pulse pointer-events-none"></span>

          {/* Official WhatsApp Icon Image */}
          <img
            src={assetUrl('whatsapp-icon.png')}
            alt="WhatsApp CS"
            className="w-9 h-9 object-contain relative z-10 drop-shadow-xs pointer-events-none"
            draggable={false}
          />

          {/* Active Online Green Dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-20 animate-pulse"></span>

          {/* Drag Grip Indicator */}
          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs text-[9px] pointer-events-none">
            <span className="material-symbols-outlined text-[10px]">drag_indicator</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
};
