import React, { useState, useEffect } from 'react';
import { assetUrl } from '../../utils/assets';

export const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [animState, setAnimState] = useState<'initial' | 'growing' | 'fading'>('initial');
  const logoUrl = assetUrl('logo-transparent.png');

  useEffect(() => {
    // 1. Start growth animation immediately on mount
    const growTimer = setTimeout(() => {
      setAnimState('growing');
    }, 50);

    // 2. Start fading out after 4.0 seconds
    const fadeTimer = setTimeout(() => {
      setAnimState('fading');
    }, 4000);

    // 3. Remove completely from DOM after 4.5 seconds
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 4500);

    return () => {
      clearTimeout(growTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-[#FDF8F0] flex flex-col items-center justify-center transition-opacity duration-500 select-none overflow-hidden ${
        animState === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Inline styles for the moving glossy shine & sparkling glints */}
      <style>{`
        @keyframes snShimmerSweep {
          0% {
            transform: translateX(-140%) skewX(-25deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateX(140%) skewX(-25deg);
            opacity: 0;
          }
        }
        @keyframes snShimmerSweepDelayed {
          0% {
            transform: translateX(-140%) skewX(-25deg);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(140%) skewX(-25deg);
            opacity: 0;
          }
        }
        @keyframes snSparkleTwinkle {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          30%, 70% {
            transform: scale(1.3) rotate(90deg);
            opacity: 1;
          }
        }
        @keyframes snLogoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-shimmer-sweep {
          animation: snShimmerSweep 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-shimmer-sweep-delayed {
          animation: snShimmerSweepDelayed 2.4s cubic-bezier(0.4, 0, 0.2, 1) 1.2s infinite;
        }
        .animate-sparkle-1 {
          animation: snSparkleTwinkle 2.2s ease-in-out 0.4s infinite;
        }
        .animate-sparkle-2 {
          animation: snSparkleTwinkle 2.2s ease-in-out 1.5s infinite;
        }
        .animate-sparkle-3 {
          animation: snSparkleTwinkle 2.2s ease-in-out 0.9s infinite;
        }
        .animate-logo-float {
          animation: snLogoFloat 3s ease-in-out infinite;
        }
      `}</style>

      {/* Center Container */}
      <div className="flex flex-col items-center justify-center text-center relative z-10 px-6">
        {/* Pure Logo Without Any Background Box */}
        <div
          className={`transform transition-all duration-1000 ease-out flex items-center justify-center ${
            animState === 'initial'
              ? 'scale-25 opacity-0 rotate-[-6deg]'
              : 'scale-100 opacity-100 rotate-0'
          }`}
        >
          {/* Logo Wrapper with Floating Motion & Glossy Moving Shine Inside */}
          <div className="relative w-60 h-60 sm:w-80 sm:h-80 mb-6 flex items-center justify-center animate-logo-float">
            {/* The Pure Transparent Logo Image */}
            <img
              src={logoUrl}
              alt="Logo Sembako Nusantara Jepang"
              className="w-full h-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.12)] select-none pointer-events-none"
            />

            {/* Glossy Moving Shine Strictly Inside the Logo Contours via CSS Mask */}
            <div
              className="absolute inset-0 pointer-events-none overflow-hidden select-none"
              style={{
                WebkitMaskImage: `url("${logoUrl}")`,
                maskImage: `url("${logoUrl}")`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
            >
              {/* Primary Metallic Beam */}
              <div
                className="absolute inset-0 w-[200%] h-full animate-shimmer-sweep pointer-events-none"
                style={{
                  background:
                    'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.3) 35%, rgba(255,255,255,0.98) 48%, rgba(254,240,138,0.95) 52%, rgba(255,255,255,0.4) 62%, transparent 78%)',
                  mixBlendMode: 'screen',
                }}
              />
              {/* Secondary Warm Golden Glint Beam */}
              <div
                className="absolute inset-0 w-[200%] h-full animate-shimmer-sweep-delayed pointer-events-none"
                style={{
                  background:
                    'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.85) 50%, rgba(251,191,36,0.65) 55%, transparent 70%)',
                  mixBlendMode: 'screen',
                }}
              />
            </div>

            {/* Dynamic Sparkling Glints (Bintang Mengkilat) */}
            {/* Sparkle 1: Top-Right of the logo badge */}
            <div className="absolute top-4 right-10 pointer-events-none animate-sparkle-1">
              <svg className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            </div>

            {/* Sparkle 2: Center-Left */}
            <div className="absolute top-1/2 left-6 -translate-y-1/2 pointer-events-none animate-sparkle-2">
              <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            </div>

            {/* Sparkle 3: Bottom-Right */}
            <div className="absolute bottom-8 right-12 pointer-events-none animate-sparkle-3">
              <svg className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(253,230,138,0.9)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Elegant Animated Progress Line */}
        <div className="w-52 sm:w-64 h-1.5 bg-stone-200/90 rounded-full mt-2 overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r from-[#c41230] via-amber-400 to-[#c41230] rounded-full transition-all duration-[3800ms] ease-out ${
              animState === 'initial' ? 'w-0' : 'w-full'
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

