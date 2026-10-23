import React from 'react';
import { usePWAInstall } from '../../utils/pwa';
import { useLanguage } from '../../context/LanguageContext';

export const PWAUpdateToast: React.FC = () => {
  const { isUpdateAvailable, applyUpdate } = usePWAInstall();
  const { language } = useLanguage();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <aside
      aria-label="Pembaruan Aplikasi"
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] sm:w-auto max-w-md animate-bounce"
    >
      <div className="bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center gap-3 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c41230] to-amber-500 flex items-center justify-center shrink-0 shadow-xs">
          <span className="material-symbols-outlined text-white text-xl">
            published_with_changes
          </span>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
            <span>
              {language === 'JP' ? '新バージョン利用可能' : language === 'EN' ? 'New Update Available' : 'Update Aplikasi Tersedia'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-[11px] text-stone-300 truncate">
            {language === 'JP'
              ? '最新機能が追加されました。在庫や注文データは維持されます。'
              : language === 'EN'
              ? 'New features ready. Your stock and order data are safe.'
              : 'Fitur baru siap. Data stok, harga, & transaksi tetap aman.'}
          </div>
        </div>

        <button
          type="button"
          onClick={applyUpdate}
          className="px-3.5 py-1.5 bg-[#c41230] hover:bg-[#a80f28] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          {language === 'JP' ? '今すぐ更新' : language === 'EN' ? 'Update Now' : 'Perbarui'}
        </button>
      </div>
    </aside>
  );
};
