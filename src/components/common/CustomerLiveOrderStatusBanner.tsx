import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const CustomerLiveOrderStatusBanner: React.FC = () => {
  const { orders } = useAdmin();
  const { isAuthenticated, currentUser } = useAuth();
  const { language } = useLanguage();
  const isJp = language === 'JP';

  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [countdown, setCountdown] = useState<number>(10);

  // Check if this cancelled order was already auto-dismissed in this session
  const [dismissedCancelledId, setDismissedCancelledId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('sn_cancelled_banner_dismissed_id');
    } catch (e) {
      return null;
    }
  });

  // Filter orders khusus untuk akun yang bersangkutan
  const relevantOrders = useMemo(() => {
    let localUserOrders: any[] = [];
    try {
      const saved = localStorage.getItem('sn_user_orders');
      if (saved) localUserOrders = JSON.parse(saved);
    } catch (e) {}

    const pool = [...localUserOrders];
    orders.forEach((admOrd) => {
      if (!pool.some((po) => po.id === admOrd.id || po.orderId === admOrd.id)) {
        pool.push(admOrd);
      }
    });

    if (isAuthenticated && currentUser) {
      const cId = currentUser.id?.toLowerCase().trim();
      const cEmail = currentUser.email?.toLowerCase().trim();
      const cName = currentUser.name?.toLowerCase().trim();
      const cPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';

      const matched = pool.filter((ord: any) => {
        if (ord.userId && String(ord.userId).toLowerCase().trim() === cId) return true;
        const ordEmail = (ord.userEmail || ord.email || '')?.toLowerCase().trim();
        if (ordEmail && cEmail && ordEmail === cEmail) return true;
        const ordName = (ord.customerName || '')?.toLowerCase().trim();
        if (ordName && cName && (ordName === cName || ordName.includes(cName) || cName.includes(ordName))) return true;
        if (ord.phone && cPhone) {
          const ordPhoneClean = String(ord.phone).replace(/[^0-9]/g, '');
          if (ordPhoneClean && ordPhoneClean.length >= 8 && (ordPhoneClean.includes(cPhone) || cPhone.includes(ordPhoneClean))) return true;
        }
        return false;
      });

      if (matched.length > 0) return matched;
      return pool;
    }

    // Jika belum login / di perangkat baru: tampilkan pesanan lokal jika ada, atau pesanan aktif sistem agar live banner selalu tampil
    if (localUserOrders.length > 0) return localUserOrders;
    return pool;
  }, [isAuthenticated, currentUser, orders]);

  // Check latest order from relevantOrders
  const latestOrder = relevantOrders && relevantOrders.length > 0 ? relevantOrders[0] : null;
  const isLatestCancelled = Boolean(
    latestOrder && (
      latestOrder.status === 'Dibatalkan' ||
      latestOrder.status?.toLowerCase().includes('batal') ||
      latestOrder.status?.toLowerCase().includes('cancel')
    )
  );

  const isLatestCancelledDismissed = Boolean(
    latestOrder && isLatestCancelled && dismissedCancelledId === latestOrder.id
  );

  // Determine active order to display:
  // If the latest order is cancelled and hasn't finished its 10-second display, show it.
  // Once finished or dismissed, show other ongoing active orders (e.g. 'Dikemas', 'Dikirim')
  const activeOrder = (isLatestCancelled && !isLatestCancelledDismissed)
    ? latestOrder
    : relevantOrders.find(
        (o) =>
          o.status !== 'Dibatalkan' &&
          !o.status?.toLowerCase().includes('batal') &&
          !o.status?.toLowerCase().includes('cancel')
      ) || (latestOrder?.status !== 'Dibatalkan' ? latestOrder : null);

  const isCurrentOrderCancelled = Boolean(
    activeOrder && (
      activeOrder.status === 'Dibatalkan' ||
      activeOrder.status?.toLowerCase().includes('batal') ||
      activeOrder.status?.toLowerCase().includes('cancel')
    )
  );

  // Auto-hide cancelled order banner after exactly 10 seconds
  useEffect(() => {
    if (!activeOrder || !isCurrentOrderCancelled) return;

    setCountdown(10);

    const intervalTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const closeTimer = setTimeout(() => {
      setIsClosed(true);
      try {
        sessionStorage.setItem('sn_cancelled_banner_dismissed_id', activeOrder.id);
        setDismissedCancelledId(activeOrder.id);
      } catch (e) {}
    }, 10000);

    return () => {
      clearTimeout(closeTimer);
      clearInterval(intervalTimer);
    };
  }, [activeOrder?.id, isCurrentOrderCancelled]);

  const handleManualClose = () => {
    setIsClosed(true);
    if (activeOrder && isCurrentOrderCancelled) {
      try {
        sessionStorage.setItem('sn_cancelled_banner_dismissed_id', activeOrder.id);
        setDismissedCancelledId(activeOrder.id);
      } catch (e) {}
    }
  };

  if (!activeOrder || isClosed) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dibatalkan':
      case 'Batal':
        return {
          bg: 'bg-stone-50 border-stone-300 text-stone-900',
          badgeBg: 'bg-stone-800 text-white',
          dot: 'bg-stone-400',
          icon: 'cancel',
          labelId: 'Dibatalkan',
          labelJp: 'キャンセル済み',
          descId: 'Pesanan telah dibatalkan'
        };
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
      <div className="fixed bottom-[74px] sm:bottom-20 md:bottom-6 left-3 sm:left-6 right-3 sm:right-auto z-50 animate-bounce-slow max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-stone-900/95 hover:bg-black text-white rounded-full shadow-2xl border-2 border-amber-400 backdrop-blur-md transition-all active:scale-95 cursor-pointer text-xs font-bold group max-w-full"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.dot} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.dot}`}></span>
          </span>
          <span className="material-symbols-outlined text-amber-400 text-base shrink-0">
            {statusConfig.icon}
          </span>
          <span className="truncate text-[11px] sm:text-xs">
            {isJp ? '配送ステータス' : 'Status Pesanan Live'}: <strong>#{activeOrder.id}</strong> ({isJp ? statusConfig.labelJp : statusConfig.labelId})
            {isCurrentOrderCancelled && ` (${countdown}s)`}
          </span>
          <span className="material-symbols-outlined text-sm text-stone-400 group-hover:text-white transition-colors shrink-0">
            expand_less
          </span>
        </button>
      </div>
    );
  }

  // Expanded Full Live Banner Mode
  return (
    <div className="fixed bottom-[74px] sm:bottom-20 md:bottom-6 left-3 right-3 sm:right-auto sm:left-6 z-50 max-w-md w-[calc(100vw-1.5rem)] sm:w-[420px] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200 border-l-4 border-l-[#c41230] p-4 text-stone-800 space-y-3 relative overflow-hidden">
        {/* Progress Bar Timer (Hanya tampil 10 detik jika status dibatalkan) */}
        {isCurrentOrderCancelled && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-stone-600 transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.dot} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${statusConfig.dot}`}></span>
            </span>
            <span className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>{isJp ? 'ご注文の配送状況' : 'STATUS PESANAN ANDA'}</span>
              <span className="px-2 py-0.5 bg-red-100 text-[#c41230] rounded-full text-[10px] font-black">
                LIVE
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isCurrentOrderCancelled && (
              <span className="text-[10px] font-mono text-stone-400 mr-1" title="Hilang otomatis dalam 10 detik">
                {countdown}s
              </span>
            )}
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
              onClick={handleManualClose}
              className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              title="Tutup Banner"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Order Info Body */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
            isCurrentOrderCancelled
              ? 'bg-stone-100 text-stone-600 border-stone-200'
              : 'bg-red-50 text-[#c41230] border-red-100'
          }`}>
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

        {/* Keterangan Pesanan Dibatalkan Otomatis Hilang */}
        {isCurrentOrderCancelled && (
          <div className="text-[10px] text-stone-500 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200 flex items-center justify-between">
            <span className="flex items-center gap-1 text-stone-600 font-medium">
              <span className="material-symbols-outlined text-xs text-stone-400">timer</span>
              <span>{isJp ? '10秒後に自動的に閉じます' : 'Pesanan dibatalkan (notifikasi hilang otomatis)'}</span>
            </span>
            <span className="font-bold text-stone-700 font-mono">{countdown}s</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
          <Link
            to="/orders"
            className="flex-1 py-2 px-3 bg-[#c41230] hover:bg-[#9a0021] text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            <span>{isJp ? '注文履歴・追跡' : 'Pesanan Saya (Lacak)'}</span>
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
