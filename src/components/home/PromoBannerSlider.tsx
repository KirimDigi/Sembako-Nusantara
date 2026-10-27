import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PromoBanner, getStoredPromoBanners, fetchRemotePromoBanners } from '../../utils/banners';
import { assetUrl } from '../../utils/assets';
import { useLanguage } from '../../context/LanguageContext';

export const PromoBannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<PromoBanner[]>(() => getStoredPromoBanners());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const { language } = useLanguage();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync banners from Supabase cloud on initial load
  useEffect(() => {
    fetchRemotePromoBanners().then((remote) => {
      if (remote && remote.length >= 3) {
        setBanners(remote);
      }
    });
  }, []);

  // Listen to banner updates from Admin dashboard
  useEffect(() => {
    const handleUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<PromoBanner[]>;
      if (customEvent.detail) {
        setBanners(customEvent.detail);
      } else {
        setBanners(getStoredPromoBanners());
      }
    };

    window.addEventListener('sn_banners_updated', handleUpdated);
    return () => {
      window.removeEventListener('sn_banners_updated', handleUpdated);
    };
  }, []);

  // Auto-play slider every 5 seconds
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Container with 3D shadow & rounded border */}
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-stone-200/80 bg-stone-900 aspect-[16/9] sm:aspect-[21/9] max-h-[460px] group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <Link to={currentBanner.linkUrl || '/catalog'} className="block w-full h-full relative cursor-pointer">
              {/* Cover Photo */}
              {/* Pure Cover Photo (No Text Overlay) */}
              <img
                src={assetUrl(currentBanner.imageUrl)}
                alt={currentBanner.title || 'Banner Promo Sembako Nusantara'}
                className="w-full h-full object-cover object-center select-none"
                loading="eager"
                onError={(e) => {
                  const fallback = assetUrl(`banner-promo-${(currentIndex % 3) + 1}.jpg`);
                  if ((e.target as HTMLImageElement).src !== fallback) {
                    (e.target as HTMLImageElement).src = fallback;
                  }
                }}
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Previous Button (<) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-20 shadow-md"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
        </button>

        {/* Next Button (>) */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-20 shadow-md"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
        </button>

        {/* 3 Indicators Dots Bottom Center */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx ? 'w-6 sm:w-8 bg-[#c41230]' : 'w-2 sm:w-2.5 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>

        {/* Slide Counter Badge Top Right */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 bg-black/50 backdrop-blur-xs text-white text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-white/20">
          {currentIndex + 1} / {banners.length}
        </div>
      </div>
    </div>
  );
};
