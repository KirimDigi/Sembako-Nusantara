import React from 'react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { assetUrl } from '../../utils/assets';

interface FreeShippingProgressBarProps {
  compact?: boolean;
  className?: string;
}

export const FreeShippingProgressBar: React.FC<FreeShippingProgressBarProps> = ({
  compact = false,
  className = ''
}) => {
  const { subtotalTax, freeShippingThreshold, isFreeShipping, remainingForFreeShipping } = useCart();
  const { language } = useLanguage();

  const progressPercent = Math.min(100, Math.round((subtotalTax / freeShippingThreshold) * 100));

  const getTitle = () => {
    if (language === 'JP') return '¥15,000以上のご注文で送料無料';
    if (language === 'EN') return 'Free Shipping on orders ¥15,000+';
    return 'Gratis ongkir untuk belanja ¥15,000+';
  };

  const getStatusText = () => {
    if (isFreeShipping) {
      if (language === 'JP') return '🎉 おめでとうございます！送料無料が適用されました (¥850お得)';
      if (language === 'EN') return '🎉 Congratulations! You unlocked FREE SHIPPING (Save ¥850)';
      return '🎉 Selamat! Anda mendapatkan GRATIS ONGKIR Se-Jepang (Hemat ¥850)!';
    } else {
      if (language === 'JP') return `あと ¥${remainingForFreeShipping.toLocaleString()} のお買い物で送料無料`;
      if (language === 'EN') return `Add ¥${remainingForFreeShipping.toLocaleString()} more to qualify for Free Shipping`;
      return `Belanja ¥${remainingForFreeShipping.toLocaleString()} lagi untuk dapatkan Gratis Ongkir!`;
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[#E8DFC9] bg-[#FAF5EC] p-3.5 sm:p-4 shadow-xs transition-all ${className}`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
        <h4 className="text-xs sm:text-sm font-bold text-[#8B2E15] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-[#c41230]">local_shipping</span>
          <span>{getTitle()}</span>
        </h4>
        <div
          className={`text-[11px] sm:text-xs font-semibold ${
            isFreeShipping ? 'text-emerald-700 font-bold' : 'text-[#8B2E15]/80'
          }`}
        >
          {getStatusText()}
        </div>
      </div>

      {/* Progress Track with Walking Mascot & Gift Box */}
      <div className="relative pt-6 pb-1">
        {/* Track Bar */}
        <div className="w-full bg-[#EFE7D7] h-2.5 sm:h-3 rounded-full overflow-hidden border border-[#E3D9C3]/70">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              isFreeShipping
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-[#e11d48] to-[#c41230]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Walking Mascot Sitting on Track */}
        <div
          className="absolute top-0 transition-all duration-700 ease-out pointer-events-none select-none z-10 flex flex-col items-center"
          style={{
            left: `calc(${Math.min(92, Math.max(0, progressPercent))}% - 14px)`
          }}
        >
          <img
            src={assetUrl('mascot-bendera.png')}
            alt="Mascot Sembako Nusantara"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md animate-bounce-ball-slow"
          />
        </div>

        {/* Gift Box Icon at 100% Target */}
        <div
          className={`absolute right-0 top-0.5 text-base sm:text-lg transition-transform ${
            isFreeShipping ? 'scale-125 animate-pulse' : 'opacity-85 hover:scale-110'
          }`}
          title="Hadiah Gratis Ongkir ¥15,000"
        >
          🎁
        </div>
      </div>

      {!compact && (
        <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2 pt-2 border-t border-[#E8DFC9]/60">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Kurir Yamato & Sagawa Express se-Jepang</span>
          </span>
          <span className="font-mono font-bold text-stone-700">
            ¥{subtotalTax.toLocaleString()} / ¥{freeShippingThreshold.toLocaleString()} ({progressPercent}%)
          </span>
        </div>
      )}
    </div>
  );
};
