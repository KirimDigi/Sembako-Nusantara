import React, { useState, useEffect, useRef } from 'react';
import { formatIdr, formatJpy, getActiveExchangeRate } from '../../utils/currency';
import { assetUrl } from '../../utils/assets';

export interface POSDisplayPayload {
  storeName: string;
  registerName: string;
  cart: Array<{
    id: string;
    name: string;
    nameJp?: string;
    nameEn?: string;
    price: number;
    quantity: number;
    image?: string;
    category?: string;
    isFrozen?: boolean;
    subtotal: number;
  }>;
  totalItemCount: number;
  totalQuantity: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  payCurrency: 'JPY' | 'IDR';
  exchangeRate: number;
  subtotalIDR: number;
  taxAmountIDR: number;
  totalAmountIDR: number;
  customerName: string;
  isPaymentOpen: boolean;
  paymentMethod: string;
  cashGiven: number;
  changeAmount: number;
  completedTx: {
    receiptNumber: string;
    date: string;
    totalAmount: number;
    amountPaid: number;
    changeAmount: number;
    paymentMethod: string;
    currency?: string;
    customerName?: string;
  } | null;
  lastScannedItemId?: string;
  timestamp: number;
}

export const POSCustomerDisplayPage: React.FC = () => {
  const [exchangeRate] = useState<number>(() => getActiveExchangeRate());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const cartEndRef = useRef<HTMLDivElement>(null);

  // Default initial state
  const [displayState, setDisplayState] = useState<POSDisplayPayload>(() => {
    try {
      const saved = localStorage.getItem('sn_pos_display_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      storeName: 'Sembako Nusantara Tokyo (東京店)',
      registerName: 'Mesin Kasir 1',
      cart: [],
      totalItemCount: 0,
      totalQuantity: 0,
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      payCurrency: 'JPY',
      exchangeRate: 105,
      subtotalIDR: 0,
      taxAmountIDR: 0,
      totalAmountIDR: 0,
      customerName: '',
      isPaymentOpen: false,
      paymentMethod: 'Cash',
      cashGiven: 0,
      changeAmount: 0,
      completedTx: null,
      timestamp: Date.now()
    };
  });

  // Tokyo Clock Live Updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for real-time updates via BroadcastChannel and Storage Events
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sn_pos_display_channel');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'POS_STATE_UPDATE') {
          setDisplayState(event.data.payload);
        }
      };
      // Request initial state from active cashier tab
      channel.postMessage({ type: 'REQUEST_POS_STATE' });
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sn_pos_display_state' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setDisplayState(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auto-scroll cart list when new items are added
  useEffect(() => {
    if (displayState.cart.length > 0 && cartEndRef.current) {
      cartEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayState.cart.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const isCartEmpty = displayState.cart.length === 0;
  const isCompleted = !!displayState.completedTx;
  const isPaying = displayState.isPaymentOpen && !isCompleted;

  return (
    <div className="min-h-screen bg-[#0e0e10] text-stone-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-18 px-6 bg-[#16161a] border-b border-stone-800 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-4">
          <img
            src={assetUrl('LOGO PUTIH SN.png')}
            alt="Sembako Nusantara"
            className="h-10 w-auto object-contain filter drop-shadow"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-wide uppercase">
                Sembako Nusantara Tokyo
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#c41230] text-white tracking-wider">
                TOKYO HUB
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Indonesian Halal Grocery & Specialty Store • 東京大田区 西蒲田
            </p>
          </div>
        </div>

        {/* Center: Live Exchange Rate & Customer Banner */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
            <span className="text-amber-400 font-bold">1 JPY =</span>
            <span className="font-mono font-black text-white">
              Rp {displayState.exchangeRate || exchangeRate}
            </span>
          </div>

          {displayState.customerName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs">
              <span className="material-symbols-outlined text-sm text-red-400">person</span>
              <span className="text-stone-300 text-[11px]">Pelanggan:</span>
              <span className="font-bold text-white">{displayState.customerName}</span>
            </div>
          )}
        </div>

        {/* Right: Clock & Fullscreen Toggle */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
              Tokyo Time (JST)
            </div>
            <div className="font-mono text-base font-black text-emerald-400 tracking-wider">
              {currentTime || '--:--:--'}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Fullscreen)'}
          >
            <span className="material-symbols-outlined text-xl">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex overflow-hidden">
        {/* ========================================================================= */}
        {/* CASE 1: TRANSACTION COMPLETED (CELEBRATION / THANK YOU SCREEN)            */}
        {/* ========================================================================= */}
        {isCompleted && displayState.completedTx && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#141416] via-[#101012] to-[#0a0a0c] text-center animate-fadeIn">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 flex items-center justify-center mb-6 shadow-2xl animate-bounce">
              <span className="material-symbols-outlined text-6xl">check_circle</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide mb-2">
              Terima Kasih Telah Berbelanja! 🙏
            </h1>
            <p className="text-lg text-emerald-400 font-bold mb-6">
              ご来店・お買い上げ誠にありがとうございました。
            </p>

            <div className="bg-[#18181c] border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-left space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <span className="text-xs text-stone-400">Nomor Struk</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {displayState.completedTx.receiptNumber}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-300">Metode Pembayaran</span>
                <span className="font-bold text-white px-3 py-1 rounded-lg bg-stone-800 text-xs">
                  {displayState.completedTx.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-base text-stone-300 font-bold">Total Pembayaran</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    ¥{displayState.completedTx.totalAmount.toLocaleString()}
                  </span>
                  <div className="text-xs text-stone-400 font-mono mt-0.5">
                    ≈ {formatIdr(displayState.completedTx.totalAmount * (displayState.exchangeRate || 105))}
                  </div>
                </div>
              </div>

              {displayState.completedTx.changeAmount > 0 && (
                <div className="flex justify-between items-center pt-3 border-t border-stone-800 text-emerald-400">
                  <span className="text-sm font-bold">Uang Kembalian (お釣り)</span>
                  <span className="text-2xl font-black font-mono">
                    ¥{displayState.completedTx.changeAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-stone-500 mt-8">
              Semoga hari Anda menyenangkan • Sembako Nusantara Tokyo Hub
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2: IDLE / WELCOME SCREEN (CART IS EMPTY)                             */}
        {/* ========================================================================= */}
        {!isCompleted && isCartEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#141418] via-[#101013] to-[#0b0b0d] text-center animate-fadeIn">
            {/* Store Banner & Welcome Message */}
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-700/60 text-[#ff4d6d] text-xs font-black tracking-widest uppercase shadow-md">
                <span>🇯🇵 TOKYO STORE • INDONESIAN HALAL MARKET 🇮🇩</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Selamat Datang di <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
                  Sembako Nusantara
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto leading-relaxed">
                Toko Produk Halal Nusantara Terlengkap di Jepang. Silakan serahkan barang belanjaan Anda kepada kasir untuk diproses.
              </p>

              <div className="text-xs text-amber-400/90 font-medium">
                いらっしゃいませ。商品をレジにお持ちください。
              </div>

              {/* Supported Payment Badges */}
              <div className="pt-8">
                <div className="text-[11px] uppercase tracking-wider text-stone-400 font-bold mb-3">
                  Metode Pembayaran Yang Diterima:
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">💵</span>
                    <span>Tunai (Yen / Rupiah)</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">📱</span>
                    <span>JPQR / QRIS Indonesia</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">🔴</span>
                    <span>PayPay QR</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">💳</span>
                    <span>Kartu Kredit & Debit</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-bold flex items-center gap-2">
                    <span className="text-base">🚃</span>
                    <span>IC Card (Suica / Pasmo)</span>
                  </div>
                </div>
              </div>

              {/* Halal Trust Badges */}
              <div className="pt-6 flex items-center justify-center gap-8 text-stone-400 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
                  <span>100% Halal Certified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-400 text-base">local_shipping</span>
                  <span>Fresh & Direct Import</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sky-400 text-base">ac_unit</span>
                  <span>Frozen Halal Meat</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 3: LIVE SCANNING & CART DISPLAY                                      */}
        {/* ========================================================================= */}
        {!isCompleted && !isCartEmpty && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Scanned Items List (60%) */}
            <div className="flex-1 flex flex-col bg-[#111114] border-r border-stone-800 overflow-hidden">
              {/* Header List */}
              <div className="p-4 px-6 bg-[#16161b] border-b border-stone-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c41230]">shopping_cart</span>
                  <span className="font-bold text-white text-sm">
                    Daftar Belanja Anda ({displayState.totalItemCount} Item / {displayState.totalQuantity} Pcs)
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  お買い物商品一覧
                </span>
              </div>

              {/* Scanned Items Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {displayState.cart.map((item, index) => {
                  const isLatest = index === displayState.cart.length - 1;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                        isLatest
                          ? 'bg-red-950/40 border-2 border-[#c41230] shadow-lg animate-pulse'
                          : 'bg-[#18181d] border border-stone-800/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-700/60 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-stone-500">inventory_2</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                            {isLatest && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#c41230] text-white shrink-0">
                                BARU DISCAND
                              </span>
                            )}
                            {item.isFrozen && (
                              <span className="text-[10px] text-cyan-400 font-bold shrink-0">❄️ Beku</span>
                            )}
                          </div>
                          {item.nameJp && (
                            <p className="text-[11px] text-stone-400 truncate">{item.nameJp}</p>
                          )}
                          <div className="text-xs text-stone-400 mt-0.5">
                            ¥{item.price.toLocaleString()} ×{' '}
                            <span className="font-bold text-amber-300 font-mono">{item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Subtotal Item */}
                      <div className="text-right pl-4 shrink-0">
                        <div className="text-base font-black text-white font-mono">
                          ¥{item.subtotal.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          ≈ {formatIdr(item.subtotal * (displayState.exchangeRate || 105))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={cartEndRef} />
              </div>

              {/* Bottom Scanned Info */}
              <div className="p-3 px-6 bg-[#16161b] border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span>Pajak Konsumsi Makanan Jepang (8% JCT) sudah dihitung otomatis.</span>
                <span className="text-emerald-400 font-bold">Harga Pas & Transparan</span>
              </div>
            </div>

            {/* Right Column: Total Due & Payment Instructions (40%) */}
            <div className="w-full lg:w-[460px] xl:w-[500px] flex flex-col bg-[#141418] shrink-0 justify-between p-6">
              <div className="space-y-6">
                {/* Status Box */}
                <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full animate-ping ${
                        isPaying ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-stone-200">
                      {isPaying ? 'Menunggu Pembayaran' : 'Kasir Sedang Men-scan'}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {displayState.registerName || 'Mesin Kasir'}
                  </span>
                </div>

                {/* Subtotal Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal Barang ({displayState.totalQuantity} Pcs)</span>
                    <span className="font-mono text-white font-bold">
                      ¥{displayState.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Pajak Konsumsi (8% 軽減税率)</span>
                    <span className="font-mono text-white font-bold">
                      ¥{displayState.taxAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Grand Total Highlight */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1a1a20] to-[#121216] border-2 border-[#c41230] shadow-2xl space-y-2">
                  <div className="text-xs uppercase tracking-widest text-stone-400 font-bold flex justify-between items-center">
                    <span>TOTAL PEMBAYARAN</span>
                    <span className="text-[10px] text-red-400 font-mono">お会計合計 (税込)</span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
                    ¥{displayState.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm font-bold text-stone-300 font-mono pt-1 border-t border-stone-800 flex justify-between items-center">
                    <span className="text-stone-400 text-xs">Setara Rupiah:</span>
                    <span className="text-emerald-400">
                      {formatIdr(displayState.totalAmount * (displayState.exchangeRate || 105))}
                    </span>
                  </div>
                </div>

                {/* Live Payment Guidance Area (When cashier opens payment dialog) */}
                {isPaying && (
                  <div className="p-5 rounded-2xl bg-[#1c1c24] border border-amber-500/40 shadow-xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                        Metode: {displayState.paymentMethod}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        SEDANG MEMBAYAR
                      </span>
                    </div>

                    {/* Method 1: Cash */}
                    {displayState.paymentMethod === 'Cash' && (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-stone-300">
                          <span>Uang Diterima (お預かり):</span>
                          <span className="font-mono font-bold text-white text-base">
                            ¥{displayState.cashGiven.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400 pt-2 border-t border-stone-700/80">
                          <span className="font-bold">Kembalian (お釣り):</span>
                          <span className="font-mono font-black text-xl">
                            ¥{Math.max(0, displayState.changeAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Method 2: JPQR / QRIS */}
                    {displayState.paymentMethod === 'JPQR / QRIS' && (
                      <div className="text-center space-y-2 py-1">
                        <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=00020101021226580016ID.CO.QRIS.WWW01189360099900000000005204541153033605802ID5917SEMBAKO+NUSANTARA6005TOKYO6304ABCD"
                            alt="QRIS JPQR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[11px] text-stone-300 font-bold">
                          Silakan Scan dengan Aplikasi Bank / E-Wallet Anda
                        </p>
                        <p className="text-[10px] text-stone-400">
                          Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO & JPQR
                        </p>
                      </div>
                    )}

                    {/* Method 3: PayPay */}
                    {displayState.paymentMethod === 'PayPay' && (
                      <div className="text-center space-y-2 py-1">
                        <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://paypay.ne.jp/sembako-nusantara-tokyo"
                            alt="PayPay QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[11px] text-red-400 font-bold">
                          PayPay バーコードを読み取ってください
                        </p>
                        <p className="text-[10px] text-stone-400">
                          Scan barcode PayPay untuk menyelesaikan pembayaran
                        </p>
                      </div>
                    )}

                    {/* Method 4: Card / IC Card */}
                    {(displayState.paymentMethod === 'Credit Card' ||
                      displayState.paymentMethod === 'IC Card') && (
                      <div className="text-center py-3 space-y-2">
                        <span className="material-symbols-outlined text-4xl text-amber-400 animate-pulse">
                          contactless
                        </span>
                        <p className="text-xs font-bold text-stone-200">
                          Silakan tempelkan kartu pada mesin EDC kasir
                        </p>
                        <p className="text-[10px] text-stone-400">
                          タッチ決済 / ICカードを端末にかざしてください
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="pt-6 border-t border-stone-800/80 text-center text-xs text-stone-500">
                Sembako Nusantara Tokyo • Toko Halal Indonesia Terlengkap di Jepang
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
