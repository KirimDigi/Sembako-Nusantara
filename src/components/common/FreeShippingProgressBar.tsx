import React from 'react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { convertJpyToIdr, formatIdr, formatJpy, useExchangeRate } from '../../utils/currency';

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
  const exchangeRate = useExchangeRate();

  const remainingIdr = convertJpyToIdr(remainingForFreeShipping, exchangeRate);
  const thresholdIdr = convertJpyToIdr(freeShippingThreshold, exchangeRate);

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isFreeShipping
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-[#FAF5EC] border-[#E8DFC9] text-stone-800'
      } p-3.5 sm:p-4 shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left Info: Icon & Main Message */}
        <div className="flex items-start sm:items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isFreeShipping ? 'bg-emerald-100 text-emerald-700' : 'bg-[#c41230]/10 text-[#c41230]'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {isFreeShipping ? 'verified' : 'local_shipping'}
            </span>
          </div>

          <div className="space-y-0.5">
            {isFreeShipping ? (
              <>
                <div className="text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>
                    {language === 'JP'
                      ? '送料無料が適用されました！'
                      : language === 'EN'
                      ? 'Free Shipping Unlocked!'
                      : 'Selamat! Pesanan Anda Mendapatkan Gratis Ongkir Se-Jepang'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-700 font-medium">
                  {language === 'JP'
                    ? '¥15,000以上のご注文のため、全国配送料無料（ヤマト運輸・佐川急便）でお届けします。'
                    : language === 'EN'
                    ? 'You have reached the free shipping threshold for nationwide delivery across Japan.'
                    : 'Belanja Anda telah mencapai minimal gratis ongkir. Hemat biaya kirim se-Jepang (Yamato & Sagawa)!'}
                </p>
              </>
            ) : (
              <>
                <div className="text-xs sm:text-sm font-bold text-stone-900 flex flex-wrap items-center gap-1">
                  <span>
                    {language === 'JP'
                      ? '送料無料まであと'
                      : language === 'EN'
                      ? 'Add'
                      : 'Belanja kurang'}
                  </span>
                  <span className="text-[#c41230] font-black font-mono underline decoration-[#c41230]/30 underline-offset-2">
                    {formatJpy(remainingForFreeShipping)}
                  </span>
                  <span className="text-stone-500 font-semibold font-mono text-[11px] sm:text-xs">
                    ({formatIdr(remainingIdr)})
                  </span>
                  <span>
                    {language === 'JP'
                      ? 'で無料になります！'
                      : language === 'EN'
                      ? 'more to get Free Shipping!'
                      : 'lagi untuk dapatkan Gratis Ongkir se-Jepang!'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500">
                  {language === 'JP'
                    ? `※ 合計 ¥${freeShippingThreshold.toLocaleString()} 以上のお買い物で全国送料無料`
                    : language === 'EN'
                    ? `* Free shipping applies automatically for orders of ${formatJpy(freeShippingThreshold)} (${formatIdr(thresholdIdr)}) or more.`
                    : `* Gratis ongkir otomatis berlaku untuk total belanja minimal ${formatJpy(freeShippingThreshold)} (${formatIdr(thresholdIdr)}).`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Badge / Status */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-tight ${
              isFreeShipping
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            {isFreeShipping
              ? language === 'JP'
                ? '✓ 送料無料'
                : '✓ GRATIS ONGKIR'
              : `${Math.min(100, Math.round((subtotalTax / freeShippingThreshold) * 100))}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
