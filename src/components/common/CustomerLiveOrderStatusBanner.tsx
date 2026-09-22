import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';

export const CustomerLiveOrderStatusBanner: React.FC = () => {
  const { orders } = useAdmin();
  const { language } = useLanguage();
  const isJp = language === 'JP';

  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // Get the most recent active order or latest order
  const activeOrder = orders && orders.length > 0 ? orders[0] : null;

  if (!activeOrder || isClosed) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dikirim':
        return {
          bg: 'bg-blue-50 border-blue-200 text-blue-900',
          badgeBg: 'bg-blue-600 text-white',
          dot: 'bg-blue-500',
          icon: 'local_shipping',
          labelId: 'Paket Sedang Dikirim',
          labelJp: '配達中（配送中）',
          descId: `Dalam perjalanan kurir ${activeOrder.courier || 'Yamato Transport'}`
        };
      case 'Selesai Packing':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-950',
          badgeBg: 'bg-amber-500 text-white',
          dot: 'bg-amber-500',
          icon: 'inventory',
          labelId: 'Selesai Dikemas & Siap Kirim',
          labelJp: '梱包完了・発送準備中',
          descId: 'Paket telah rapi dan siap diserahkan ke kurir'
        };
      case 'Dikemas':
      case 'Diproses':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-950',
          badgeBg: 'bg-orange-500 text-white',
          dot: 'bg-orange-500',
          icon: 'package_2',
          labelId: 'Sedang Diproses & Dikemas',
          labelJp: '注文処理中・梱包中',
          descId: 'Gudang Tokyo sedang menyiapkan produk Anda'
        };
      case 'Selesai':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          dot: 'bg-emerald-500',
          icon: 'check_circle',
          labelId: 'Pesanan Telah Diterima',
          labelJp: '配達完了',
          descId: 'Paket telah sampai di alamat tujuan di Jepang'
        };
      default:
        return {
          bg: 'bg-stone-50 border-stone-200 text-stone-900',
          badgeBg: 'bg-stone-700 text-white',
          dot: 'bg-stone-400',
          icon: 'receipt_long',
          labelId: activeOrder.status,
          labelJp: activeOrder.status,
          descId: 'Status pesanan aktif'
        };
    }
  };

  const statusConfig = getStatusColor(activeOrder.status);

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 left-4 sm:left-6 z-40 animate-bounce-slow">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-stone-900/95 hover:bg-black text-white rounded-full shadow-2xl border-2 border-amber-400 backdrop-blur-md transition-all active:scale-95 cursor-pointer text-xs font-bold group"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.dot} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.dot}`}></span>
          </span>
          <span className="material-symbols-outlined text-amber-400 text-base">
            {statusConfig.icon}
          </span>
          <span>
            {isJp ? '配送ステータス' : 'Status Pesanan Live'}: <strong>#{activeOrder.id}</strong> ({isJp ? statusConfig.labelJp : statusConfig.labelId})
          </span>
          <span className="material-symbols-outlined text-sm text-stone-400 group-hover:text-white transition-colors">
            expand_less
          </span>
        </button>
      </div>
    );
  }

  // Expanded Full Live Banner Mode
  return (
    <div className="fixed bottom-5 left-4 right-4 sm:right-auto sm:left-6 z-40 max-w-md w-[calc(100vw-2rem)] sm:w-[420px] transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200 border-l-4 border-l-[#c41230] p-4 text-stone-800 space-y-3 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.dot} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${statusConfig.dot}`}></span>
            </span>
            <span className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1">
              <span>{isJp ? 'ご注文の配送状況' : 'Status Pesanan Anda'}</span>
              <span className="px-2 py-0.5 bg-red-100 text-[#c41230] rounded-full text-[10px] font-black">
                LIVE
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Kecilkan Banner"
            >
              <span className="material-symbols-outlined text-base">expand_more</span>
            </button>
            <button
              type="button"
              onClick={() => setIsClosed(true)}
              className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              title="Tutup Banner"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Order Info Body */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c41230] flex items-center justify-center shrink-0 border border-red-100 shadow-xs">
            <span className="material-symbols-outlined text-2xl">
              {statusConfig.icon}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-xs font-black text-stone-900 truncate">
                #{activeOrder.id}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.badgeBg}`}>
                {isJp ? statusConfig.labelJp : statusConfig.labelId}
              </span>
            </div>

            <p className="text-[11px] text-stone-600 line-clamp-1">
              {isJp ? '配送業者' : 'Kurir'}: <strong>{activeOrder.courier || 'Yamato Transport'}</strong>
              {activeOrder.trackingNumber && ` (Resi: ${activeOrder.trackingNumber})`}
            </p>

            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
              <span>{activeOrder.items?.length || 1} Item Sembako</span>
              <span className="font-black text-stone-900 text-xs">¥{activeOrder.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
          <Link
            to={`/tracking?no=${encodeURIComponent(activeOrder.trackingNumber || activeOrder.id)}`}
            className="flex-1 py-2 px-3 bg-[#c41230] hover:bg-[#9a0021] text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">local_shipping</span>
            <span>{isJp ? '配送追跡' : 'Lacak Pengiriman'}</span>
          </Link>

          <Link
            to="/profile"
            className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">person</span>
            <span>{isJp ? '詳細' : 'Detail'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
