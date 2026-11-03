import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PromoBanner, getStoredPromoBanners, fetchRemotePromoBanners, isVideoBanner, getBannerMediaUrl } from '../../utils/banners';
import { assetUrl } from '../../utils/assets';
import { useLanguage } from '../../context/LanguageContext';

export const PromoBannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<PromoBanner[]>(() => getStoredPromoBanners());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  // Dynamic slider duration: 10s for video banner, 5s for photo banner
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    const currentBanner = banners[currentIndex] || banners[0];
    const isVideo = isVideoBanner(currentBanner);
    // Khusus video stay 10 detik (10000ms), foto 4 detik (4000ms)
    const duration = currentBanner?.duration || (isVideo ? 10000 : 4000);

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [currentIndex, isPaused, banners]);

  // Restart video playback whenever slide switches to video
  useEffect(() => {
    const currentBanner = banners[currentIndex];
    if (isVideoBanner(currentBanner) && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback: ensure muted if rejected
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [currentIndex, banners]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];
  const isCurrentVideo = isVideoBanner(currentBanner);
  const currentDuration = currentBanner?.duration || (isCurrentVideo ? 10000 : 4000);

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
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <Link to={currentBanner.linkUrl || '/catalog'} className="block w-full h-full relative cursor-pointer">
              {isCurrentVideo ? (
                /* Video Banner Slide (Cat Groceries 1080p / MP4) */
                <video
                  ref={videoRef}
                  src={getBannerMediaUrl(currentBanner)}
                  poster={currentBanner.imageUrl ? assetUrl(currentBanner.imageUrl) : undefined}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover object-center select-none"
                  onError={(e) => {
                    console.warn('Video failed to load, falling back to image:', e);
                  }}
                />
              ) : (
                /* Pure Cover Photo */
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
              )}
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

        {/* Audio Toggle for Video Banner */}
        {isCurrentVideo && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMuted((prev) => !prev);
            }}
            aria-label={isMuted ? 'Aktifkan Suara' : 'Matikan Suara'}
            className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-xs px-2.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-base">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
            <span className="text-[11px] font-bold">
              {isMuted ? 'Suara Off' : 'Suara On'}
            </span>
          </button>
        )}

        {/* 3 Indicators Dots Bottom Center */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/40 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          {banners.map((b, idx) => {
            const isVid = isVideoBanner(b);
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`relative h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden flex items-center ${
                  isActive ? 'w-8 sm:w-10 bg-[#c41230]' : 'w-2 sm:w-2.5 bg-white/60 hover:bg-white'
                }`}
                title={isVid ? `Slide ${idx + 1}: Video (10 Detik)` : `Slide ${idx + 1}: Foto (4 Detik)`}
              >
                {isActive && (
                  <span
                    className="absolute inset-0 bg-white/30 origin-left animate-pulse"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Slide Counter Badge Top Right */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-md">
          {isCurrentVideo && (
            <span className="flex items-center gap-1 text-emerald-400 font-sans font-extrabold text-[10px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              VIDEO 10s
            </span>
          )}
          <span>{currentIndex + 1} / {banners.length}</span>
        </div>
      </div>
    </div>
  );
};

