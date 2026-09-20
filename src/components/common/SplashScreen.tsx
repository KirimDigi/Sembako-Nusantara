import React, { useState, useEffect } from 'react';

export const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [animState, setAnimState] = useState<'initial' | 'growing' | 'fading'>('initial');

  useEffect(() => {
    // 1. Start growth animation immediately on mount
    const growTimer = setTimeout(() => {
      setAnimState('growing');
    }, 50);

    // 2. Start fading out after 4.0 seconds (minimal 4 detik)
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
      className={`fixed inset-0 z-[999999] bg-[#FDF8F0] flex flex-col items-center justify-center transition-opacity duration-500 select-none ${
        animState === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Rings */}
      <div className="absolute w-[450px] h-[450px] rounded-full border border-red-100/70 animate-ping opacity-30 pointer-events-none"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-red-100/40 via-amber-100/30 to-transparent blur-2xl pointer-events-none"></div>

      {/* Center Container */}
      <div className="flex flex-col items-center justify-center text-center relative z-10 px-6">
        {/* Logo with Growth Animation from Small to Large */}
        <div
          className={`transform transition-all duration-1000 ease-out flex items-center justify-center ${
            animState === 'initial'
              ? 'scale-25 opacity-0 rotate-[-6deg]'
              : 'scale-100 opacity-100 rotate-0'
          }`}
        >
          <div className="p-4 bg-white rounded-3xl shadow-2xl border border-[#EBE5DF]/80 mb-6 group">
            <img
              src="/LOGO PUTIH SN.jpeg"
              alt="Logo Sembako Nusantara Jepang"
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-2xl drop-shadow-md"
            />
          </div>
        </div>

        {/* Brand Text Fade In */}
        <div
          className={`transition-all duration-700 delay-300 transform ${
            animState === 'initial'
              ? 'translate-y-4 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            SEMBAKO NUSANTARA
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#c41230] mt-1 tracking-wider uppercase">
            🇯🇵 日本全国配送 • 100% HALAL NUSANTARA 🇮🇩
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            Cita Rasa Otentik Indonesia di Meja Makan Anda
          </p>
        </div>

        {/* Elegant Animated Progress Line */}
        <div className="w-48 h-1.5 bg-stone-200 rounded-full mt-7 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-[#c41230] via-amber-500 to-[#c41230] rounded-full transition-all duration-[3800ms] ease-out ${
              animState === 'initial' ? 'w-0' : 'w-full'
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};
