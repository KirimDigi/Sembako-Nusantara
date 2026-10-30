import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CurrencyType, getActiveExchangeRate, convertJpyToIdr, formatIdr, formatJpy } from '../utils/currency';
import { FreeShippingProgressBar } from '../components/common/FreeShippingProgressBar';
import { assetUrl } from '../utils/assets';
import { resolveProductImage, getPlaceholderImage } from '../components/common/ProductImage';
import { CheckoutCrossSell } from '../components/checkout/CheckoutCrossSell';
import { sendCheckoutWhatsApp } from '../services/whatsappGateway';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotalTax, isFreeShipping, clearCart, addToCart } = useCart();
  const { applyVoucher, addOrder, products } = useAdmin();
  const { isAuthenticated, currentUser, loginAsCustomer } = useAuth();
  const { language } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<'jpqr' | 'paypay' | 'konbini' | 'card' | 'bank' | 'cod'>('jpqr');
  const [courier, setCourier] = useState<'Yamato Transport' | 'Sagawa Express'>('Yamato Transport');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('JPY');
  const exchangeRate = getActiveExchangeRate();
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || 'Willy Pratama',
    phone: currentUser?.phone || '+81 80-1122-3344',
    postalCode: currentUser?.postalCode || '134-0088',
    prefecture: currentUser?.prefecture || 'Tokyo-to (東京都)',
    city: currentUser?.city || 'Edogawa-ku (江戸川区)',
    address: currentUser?.address || 'Nishi-Kasai 3-1-4, Mansion Sakura #302',
    deliveryTime: 'bebas'
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        phone: currentUser.phone || prev.phone,
        postalCode: currentUser.postalCode || prev.postalCode,
        prefecture: currentUser.prefecture || prev.prefecture,
        city: currentUser.city || prev.city,
        address: currentUser.address || prev.address
      }));
    }
  }, [currentUser]);

  // Voucher in checkout
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherMsg, setVoucherMsg] = useState<string>('');

  // 5-second Fullscreen Spinner & Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingSecondsLeft, setLoadingSecondsLeft] = useState(5);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Order Success Modal State
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const handleApplyVoucher = () => {
    if (!voucherInput) return;
    const res = applyVoucher(voucherInput, subtotalTax);
    setVoucherMsg(res.message);
    if (res.valid) {
      setAppliedVoucher({ code: voucherInput.toUpperCase(), discount: res.discount });
    } else {
      setAppliedVoucher(null);
    }
  };

  const discountVal = appliedVoucher ? appliedVoucher.discount : 0;
  const shippingFee = isFreeShipping ? 0 : 850;
  const grandTotal = Math.max(0, subtotalTax - discountVal + shippingFee);

  // Dual Currency Calculations
  const grandTotalIdr = convertJpyToIdr(grandTotal, exchangeRate);
  const subtotalTaxIdr = convertJpyToIdr(subtotalTax, exchangeRate);
  const discountValIdr = convertJpyToIdr(discountVal, exchangeRate);
  const shippingFeeIdr = convertJpyToIdr(shippingFee, exchangeRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent double submission
    if (cart.length === 0) {
      alert('Keranjang belanja Anda kosong!');
      navigate('/');
      return;
    }

    const newOrderId = 'SN-JP-' + Math.floor(100000 + Math.random() * 900000);
    const trackingNum = '4829-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
    const foodTaxAmount = Math.round((subtotalTax / 1.08) * 0.08);

    const newOrder = {
      id: newOrderId,
      orderId: newOrderId,
      trackingNumber: trackingNum,
      courier: courier,
      status: 'Dikemas' as const,
      paymentMethod,
      currency: selectedCurrency,
      language: language,
      total: grandTotal,
      totalAmount: grandTotal,
      totalAmountIDR: grandTotalIdr,
      taxAmount: foodTaxAmount,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      customerName: formData.fullName ? `${formData.fullName}` : currentUser?.name || 'Pelanggan Diaspora',
      phone: formData.phone || currentUser?.phone,
      shippingAddress: `${formData.postalCode} ${formData.prefecture} ${formData.city} ${formData.address}`,
      address: `${formData.postalCode} ${formData.prefecture} ${formData.city} ${formData.address}`,
      items: cart.map(item => ({
        id: item.product.id,
        productId: item.product.id,
        productName: item.product.name,
        name: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        qty: item.quantity,
        price: item.product.priceTax,
        subtotal: item.product.priceTax * item.quantity
      }))
    };

    // Activate 3-5 second loading spinner on button and overlay
    setIsProcessing(true);
    setLoadingSecondsLeft(4);
    setLoadingProgress(0);

    const startTime = Date.now();
    const duration = 4000; // 4 seconds loading spinner (sesuai arahan 3-5 detik)

    // Clear previous timers if any
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (processingTimerRef.current) clearTimeout(processingTimerRef.current);

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      const remainingSeconds = Math.max(1, Math.ceil((duration - elapsed) / 1000));
      setLoadingProgress(progress);
      setLoadingSecondsLeft(remainingSeconds);
    }, 100);

    processingTimerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setLoadingProgress(100);
      setLoadingSecondsLeft(0);

      // Save directly to admin state, persistence, and inventory after 4 seconds
      addOrder(newOrder);
      setCompletedOrder(newOrder);
      clearCart();
      setIsProcessing(false);

      // Kirim Notifikasi WhatsApp Gateway ke Nomor HP Pembeli
      sendCheckoutWhatsApp(newOrder).catch((err) => {
        console.warn('[WA Gateway] Gagal kirim notifikasi checkout:', err);
      });
    }, duration);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Stepper Banner */}
      <div className="bg-white rounded-2xl p-4 border border-[#EBE5DF] shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link to="/cart" className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-[#c41230]">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Kembali ke Keranjang</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
          <span className="text-[#c41230]">1. Keranjang</span>
          <span>→</span>
          <span className="bg-[#c41230] text-white px-3 py-1 rounded-full shadow-xs">2. Kasir Checkout</span>
          <span>→</span>
          <span className="text-stone-400">3. Selesai</span>
        </div>
      </div>

      {/* User Login Notification Banner */}
      {!isAuthenticated ? (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-900">
            <span className="material-symbols-outlined text-amber-700 text-lg">info</span>
            <div>
              <p className="font-bold">Status: Belum Masuk Akun</p>
              <p className="text-amber-700">Masuk untuk menyimpan riwayat pesanan & mendapatkan poin reward belanja.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/account"
              className="px-4 py-2 bg-[#c41230] hover:bg-[#9a0021] text-white rounded-xl text-xs font-bold transition-all shadow-xs text-center"
            >
              Masuk / Login
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
            <span>Masuk sebagai: <strong>{currentUser?.name}</strong> ({currentUser?.phone})</span>
          </div>
          <span className="bg-emerald-100 text-[#15803D] font-bold px-2.5 py-0.5 rounded-full text-[11px]">
            Poin: {currentUser?.loyaltyPoints || 1245} JPY
          </span>
        </div>
      )}

      {/* Free Shipping Progress Indicator (Mascot walking towards gift) */}
      <div className="mb-6">
        <FreeShippingProgressBar />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Info Card */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">local_shipping</span>
                <span>1. Alamat Pengiriman di Jepang</span>
              </h2>
              <span className="text-xs text-[#15803D] font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                ✓ 47 Prefektur Terlayani
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'JP' ? '氏名（受取人様のお名前）' : language === 'EN' ? 'Recipient Full Name' : 'Nama Lengkap Penerima'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={
                    language === 'JP'
                      ? 'れい: やまだ たろう'
                      : language === 'EN'
                      ? 'e.g. John Doe'
                      : 'Contoh: Willy Pratama'
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'JP' ? '電話番号（日本 / WhatsApp）' : language === 'EN' ? 'Phone Number (Japan / WA)' : 'Nomor Telepon (Jepang / WA)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={
                    language === 'JP'
                      ? 'れい: 080-1234-5678'
                      : '+81 80-XXXX-XXXX'
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'JP' ? '郵便番号 (〒)' : 'Kode Pos (〒 郵便番号)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder={
                    language === 'JP'
                      ? 'れい: 134-0088'
                      : '134-0088'
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'JP' ? '都道府県' : 'Prefektur (都道府県)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.prefecture}
                  onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                  placeholder={
                    language === 'JP'
                      ? 'れい: とうきょうと (東京都)'
                      : 'Tokyo-to (東京都)'
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'JP' ? '市区町村' : 'Kota / Distrik (市区町村)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={
                    language === 'JP'
                      ? 'れい: えどがわく (江戸川区)'
                      : 'Edogawa-ku (江戸川区)'
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'JP' ? '配送サービス選択' : language === 'EN' ? 'Shipping Courier Option' : 'Pilihan Layanan Pengiriman'}
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-bold focus:border-[#c41230] outline-none"
                >
                  <option value="Yamato Transport">🐱 {language === 'JP' ? 'ヤマト運輸（クール便・通常便）' : 'Ekspedisi Kuroneko Yamato (ヤマト運輸 - Reguler & Cool)'}</option>
                  <option value="Sagawa Express">🚚 {language === 'JP' ? '佐川急便（通常便）' : 'Ekspedisi Sagawa Express (佐川急便 - Reguler)'}</option>
                  <option value="Delivery Service (Max 3 Station)">🛵 {language === 'JP' ? '店舗自社配達 (西蒲田から3駅以内)' : 'Delivery Service Toko (Max Jarak 3 Stasiun Nishikamata)'}</option>
                  <option value="COD (Cash on Delivery)">🤝 {language === 'JP' ? '代金引換 (着払い)' : 'COD - Cash on Delivery (Bayar di Tempat)'}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {language === 'JP' ? '番地・建物名・部屋番号' : 'Alamat Lengkap & Nomor Apartemen / Mansion (番地・建物名・部屋番号)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={
                    language === 'JP'
                      ? 'れい: にしかさい 3-1-4 マンション さくら #302'
                      : 'Contoh: Nishi-Kasai 3-1-4, Mansion Sakura #302'
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c41230]">payments</span>
              <span>2. Pilih Metode Pembayaran (お支払い方法)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* JPQR / JAPAN QRIS */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 sm:col-span-2 ${
                  paymentMethod === 'jpqr' ? 'border-[#c41230] bg-red-50/50 ring-2 ring-[#c41230]/20' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'jpqr'}
                  onChange={() => setPaymentMethod('jpqr')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-bold text-xs text-stone-900 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#c41230] text-white text-[10px] font-black tracking-wider rounded">QRIS</span>
                      <span className="px-2 py-0.5 bg-red-100 text-[#c41230] text-[10px] font-bold rounded">JPQR</span>
                      <span className="text-stone-900 font-bold">QRIS & JPQR (Scan QR Antarnegara)</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">⚡ Rekomendasi Bebas Biaya</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                    Bayar praktis 1 Barcode QR: Mendukung <strong>Aplikasi QRIS Indonesia</strong> (BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA) & <strong>E-Wallet Jepang</strong> (PayPay, d-Harai, au PAY, Merpay, Bank Pay).
                  </p>

                  {paymentMethod === 'jpqr' && (
                    <div className="mt-3 p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                      <div className="w-32 h-32 bg-stone-50 rounded-xl border-2 border-dashed border-[#c41230] p-2 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-2 shadow-inner">
                          <span className="material-symbols-outlined text-3xl text-[#c41230] animate-pulse">qr_code_scanner</span>
                          <span className="text-[9px] font-black text-stone-800 uppercase mt-1 tracking-tighter">JPQR • QRIS</span>
                          <span className="text-[8px] text-stone-400 font-medium">Barcode Scan</span>
                        </div>
                        <div className="absolute inset-0 bg-[#c41230]/5 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-[#c41230] bg-white/90 px-1.5 py-0.5 rounded shadow-xs border border-red-200">
                            Menunggu Barcode
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 text-left space-y-1">
                        <div className="text-xs font-bold text-stone-800 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                          <span>Instruksi Scan Pembayaran:</span>
                        </div>
                        <ol className="text-[11px] text-stone-500 space-y-1 list-decimal list-inside">
                          <li>Klik tombol <strong>"Konfirmasi & Buat Pesanan"</strong>.</li>
                          <li>Scan Barcode JPQR / QRIS dengan aplikasi Bank/E-Wallet Anda.</li>
                          <li>
                            Masukkan nominal pembayaran pas{' '}
                            <strong className="text-[#c41230]">
                              {selectedCurrency === 'IDR' ? formatIdr(grandTotalIdr) : formatJpy(grandTotal)}
                            </strong>
                            {selectedCurrency === 'IDR' && (
                              <span className="text-[10px] text-stone-400 block sm:inline sm:ml-1">
                                (Ekuivalen: {formatJpy(grandTotal)})
                              </span>
                            )}
                          </li>
                          <li>Pesanan akan diverifikasi secara otomatis & langsung diproses.</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* PayPay */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'paypay' ? 'border-[#FF0033] bg-red-50/40 ring-1 ring-[#FF0033]' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'paypay'}
                  onChange={() => setPaymentMethod('paypay')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-[#FF0033] text-white text-[10px] font-bold rounded">PayPay</span>
                    <span>QR & Aplikasi Pay-pay</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Scan kode QR PayPay instan tanpa biaya transfer.</p>
                </div>
              </label>

              {/* Bank Transfer IDR / Yen */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank'}
                  onChange={() => setPaymentMethod('bank')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">Transfer</span>
                    <span>Transfer Bank (IDR / Yen)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">BCA, Mandiri, BRI, BNI serta Yucho Bank (ゆうちょ銀行).</p>
                </div>
              </label>

              {/* Cash & COD */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">Cash / COD</span>
                    <span>Tunai & COD (Bayar di Tempat)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Bayar tunai kepada staf saat delivery atau kurir ekspedisi.</p>
                </div>
              </label>

              {/* Debit / Credit Card */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'card' ? 'border-[#c41230] bg-red-50/40 ring-1 ring-[#c41230]' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-stone-800 text-white text-[10px] font-bold rounded">Debit / CC</span>
                    <span>Kartu Debit & Kredit</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Visa, Mastercard, JCB, American Express.</p>
                </div>
              </label>

              {/* Konbini Pay */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 sm:col-span-2 ${
                  paymentMethod === 'konbini' ? 'border-[#c41230] bg-red-50/40 ring-1 ring-[#c41230]' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'konbini'}
                  onChange={() => setPaymentMethod('konbini')}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-xs text-stone-900">
                    🏪 Konbini Pay / E-Wallet Minimarket (コンビニ決済)
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Lawson (Loppi), FamilyMart (FamiPort), 7-Eleven.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4 sticky top-28">
            <h3 className="font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
              Ringkasan Pesanan ({cart.length} Produk)
            </h3>

            {/* Cart preview */}
            <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={resolveProductImage(item.product.image, language)}
                      alt={language === 'JP' ? item.product.nameJp || item.product.name : language === 'EN' ? item.product.nameEn || item.product.name : item.product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getPlaceholderImage(language);
                      }}
                      className="w-9 h-9 rounded-lg object-contain p-0.5 bg-[#FAF8F5] border border-stone-200"
                    />
                    <div>
                      <p className="font-semibold text-stone-900 line-clamp-1 max-w-[130px]">
                        {language === 'JP' ? item.product.nameJp || item.product.name : language === 'EN' ? item.product.nameEn || item.product.name : item.product.name}
                      </p>
                      <p className="text-stone-400">x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-800">
                    ¥{(item.product.priceTax * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Smart Cross-Selling (Lengkapi Pesanan Anda / Sering Dibeli Bersama) */}
            <CheckoutCrossSell
              cart={cart}
              allProducts={products}
              onAddToCart={(product) => addToCart(product, 1)}
            />

            {/* Voucher Box */}
            <div className="pt-2 border-t border-stone-100">
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {language === 'JP' ? '割引クーポンコード:' : language === 'EN' ? 'Discount Voucher Code:' : 'Kode Voucher Diskon:'}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder={
                    language === 'JP'
                      ? 'れい: INDONESIA500'
                      : 'INDONESIA500'
                  }
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  {language === 'JP' ? '適用' : language === 'EN' ? 'Apply' : 'Terapkan'}
                </button>
              </div>
              {voucherMsg && (
                <p className={`text-[11px] mt-1 ${appliedVoucher ? 'text-emerald-700 font-bold' : 'text-red-500'}`}>
                  {voucherMsg}
                </p>
              )}
            </div>

            {/* Currency Selector (Bayar Yen / Rupiah) */}
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#c41230]">currency_exchange</span>
                  <span>Mata Uang Pembayaran:</span>
                </span>
                <span className="text-[10px] text-stone-400 font-normal">
                  Kurs: 1 JPY = Rp {exchangeRate}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-50 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('JPY')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedCurrency === 'JPY'
                      ? 'bg-[#c41230] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  <span>🇯🇵</span>
                  <span>Bayar Yen (¥)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('IDR')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedCurrency === 'IDR'
                      ? 'bg-[#c41230] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/70'
                  }`}
                >
                  <span>🇮🇩</span>
                  <span>Bayar Rupiah (Rp)</span>
                </button>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal Produk:</span>
                <span>
                  {selectedCurrency === 'IDR' ? (
                    <>
                      <strong className="text-stone-900">{formatIdr(subtotalTaxIdr)}</strong>{' '}
                      <span className="text-[10px] text-stone-400">({formatJpy(subtotalTax)})</span>
                    </>
                  ) : (
                    <>
                      <strong className="text-stone-900">{formatJpy(subtotalTax)}</strong>{' '}
                      <span className="text-[10px] text-stone-500 font-medium">({formatIdr(subtotalTaxIdr)})</span>
                    </>
                  )}
                </span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Potongan Voucher:</span>
                  <span>
                    {selectedCurrency === 'IDR'
                      ? `-${formatIdr(discountValIdr)}`
                      : `-${formatJpy(discountVal)} (${formatIdr(discountValIdr)})`}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ongkir ({courier}):</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-emerald-600 font-bold">GRATIS</span>
                  ) : selectedCurrency === 'IDR' ? (
                    <>
                      <strong className="text-stone-900">{formatIdr(shippingFeeIdr)}</strong>{' '}
                      <span className="text-[10px] text-stone-400">({formatJpy(shippingFee)})</span>
                    </>
                  ) : (
                    <>
                      <strong className="text-stone-900">{formatJpy(shippingFee)}</strong>{' '}
                      <span className="text-[10px] text-stone-500 font-medium">({formatIdr(shippingFeeIdr)})</span>
                    </>
                  )}
                </span>
              </div>

              {/* Total Bayar Section */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex justify-between items-baseline text-base font-bold text-[#c41230]">
                  <span>Total Bayar:</span>
                  <span className="text-2xl font-black">
                    {selectedCurrency === 'IDR' ? formatIdr(grandTotalIdr) : formatJpy(grandTotal)}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 text-right mt-0.5">
                  {selectedCurrency === 'IDR' ? (
                    <span>Ekuivalen: {formatJpy(grandTotal)} • Kurs 1 JPY = Rp {exchangeRate}</span>
                  ) : (
                    <span className="font-bold text-emerald-700">≈ {formatIdr(grandTotalIdr)} • Kurs 1 JPY = Rp {exchangeRate}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Kebijakan Toko Alert */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <div className="flex items-center gap-1 font-bold text-amber-950">
                <span className="material-symbols-outlined text-xs text-[#c41230]">policy</span>
                <span>
                  {language === 'JP' ? 'センバコ・ヌサンタラ店舗ポリシー:' : language === 'EN' ? 'Store Policies:' : 'Kebijakan Toko Sembako Nusantara:'}
                </span>
              </div>
              <p className="leading-relaxed text-amber-900">
                {language === 'JP' ? (
                  <>
                    • クレーム受付は商品到着後<strong>24時間以内</strong>（写真・動画の添付が必須）<br />
                    • 開封済みの食品・飲料は衛生管理上返品できません。<br />
                    • お支払い前に受取人氏名とお届け先住所をご確認ください。
                  </>
                ) : language === 'EN' ? (
                  <>
                    • Complaints must be reported within <strong>24 hours</strong> of receipt with photo/video proof.<br />
                    • Opened food and drink items cannot be returned.<br />
                    • Please verify your address and recipient details before payment.
                  </>
                ) : (
                  <>
                    • Komplain wajib dilaporkan max <strong>24 jam</strong> setelah barang diterima dengan bukti foto/video.<br />
                    • Produk makanan & minuman tidak dapat dikembalikan setelah kemasan dibuka.<br />
                    • Pastikan alamat & penerima sudah benar sebelum pembayaran.
                  </>
                )}
              </p>
              <Link to="/guide" target="_blank" className="text-[#c41230] font-bold hover:underline inline-block pt-0.5">
                {language === 'JP'
                  ? '利用規約と返品ポリシーの詳細を見る →'
                  : language === 'EN'
                  ? 'View Full Terms & Policies →'
                  : 'Lihat Ketentuan & Kebijakan Toko Selengkapnya →'}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full inline-flex items-center justify-center gap-2 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold py-3.5 px-6 rounded-xl shadow-md active:scale-95 transition-all text-sm cursor-pointer ${
                isProcessing ? 'opacity-80 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>
                    {language === 'JP'
                      ? `注文処理中... (${loadingSecondsLeft}秒)`
                      : language === 'EN'
                      ? `Processing Order & WA... (${loadingSecondsLeft}s)`
                      : `Memproses Pesanan & Notifikasi WA... (${loadingSecondsLeft}s)`}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {language === 'JP' ? '注文を確定して申し込む' : language === 'EN' ? 'Confirm & Place Order' : 'Konfirmasi & Buat Pesanan'}
                  </span>
                  <span className="material-symbols-outlined text-sm">lock</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 5-Second Centered Loading Spinner Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-5 border border-stone-100 animate-in zoom-in-95 duration-200">
            {/* Dual Ring Animated Spinner with Center Countdown */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-red-100 animate-ping opacity-25" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#c41230] border-r-[#c41230] animate-spin" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-amber-50 flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black text-[#c41230] font-mono leading-none">
                  {loadingSecondsLeft}s
                </span>
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">
                  Tunggu
                </span>
              </div>
            </div>

            {/* Title & Dynamic Status Message */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-stone-900">
                {language === 'JP' ? '注文と決済を処理中...' : language === 'EN' ? 'Processing Order & Payment...' : 'Sedang Memproses Pesanan & Pembayaran...'}
              </h3>
              <p className="text-xs text-stone-600 min-h-[32px] flex items-center justify-center font-medium px-2">
                {loadingProgress < 35
                  ? (language === 'JP' ? '決済ゲートウェイと安全に通信中...' : language === 'EN' ? 'Connecting to payment gateway...' : 'Menghubungkan ke gateway pembayaran & verifikasi...')
                  : loadingProgress < 75
                  ? (language === 'JP' ? '在庫を引き当て・配送枠を確保中...' : language === 'EN' ? 'Allocating inventory & courier slot...' : 'Menyinkronkan stok barang & alokasi kurir...')
                  : (language === 'JP' ? '注文書と追跡番号を発行中...' : language === 'EN' ? 'Generating invoice & tracking number...' : 'Menerbitkan nomor resi & menyelesaikan pesanan...')}
              </p>
            </div>

            {/* Smooth 5-Second Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-[#c41230] via-rose-500 to-amber-500 h-full rounded-full transition-all duration-100 ease-linear shadow-xs"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>0s</span>
                <span className="font-bold text-stone-600">{loadingProgress}%</span>
                <span>5s</span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-[11px] text-stone-500 flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-[#c41230] text-base shrink-0">verified_user</span>
              <span>
                {language === 'JP'
                  ? '安全な処理を行っています。ページを閉じたり再読み込みしないでください。'
                  : language === 'EN'
                  ? 'Securing backend transaction. Please do not close or refresh this page.'
                  : 'Sistem sedang menata sinkronisasi backend agar rapi. Mohon jangan menutup atau me-refresh halaman.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Order Completed Modal */}
      {completedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto relative flex items-center justify-center">
              <img
                src={assetUrl('mascot-oke.png')}
                alt="Pesanan Berhasil"
                className="w-full h-full object-contain drop-shadow-md animate-bounce-ball-slow"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Pesanan Berhasil Dibuat!</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900">Terima Kasih Banyak!</h3>
              <p className="text-xs text-stone-500 mt-1">
                Pesanan Anda telah diterima oleh Sembako Nusantara Jepang. Kami akan segera mengemas dan mengirimkan pesanan ke alamat Anda.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">No. Pesanan:</span>
                <span className="font-mono font-bold text-stone-900">{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ekspedisi Kurir:</span>
                <span className="font-bold text-stone-800">{completedOrder.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">No. Resi Pelacakan:</span>
                <span className="font-mono font-bold text-indigo-600">{completedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Metode Bayar:</span>
                <span className="font-bold text-stone-800 uppercase">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 font-bold">
                <span className="text-stone-900">Total Pembayaran:</span>
                <div className="text-right">
                  <span className="text-[#c41230] text-sm font-black block">
                    {completedOrder.currency === 'IDR'
                      ? formatIdr(completedOrder.totalAmountIDR || convertJpyToIdr(completedOrder.totalAmount))
                      : formatJpy(completedOrder.totalAmount)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    {completedOrder.currency === 'IDR'
                      ? `(${formatJpy(completedOrder.totalAmount)})`
                      : `(${formatIdr(completedOrder.totalAmountIDR || convertJpyToIdr(completedOrder.totalAmount))})`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                to="/tracking"
                className="flex-1 py-3 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">local_shipping</span>
                <span>Lacak Status Paket</span>
              </Link>
              <Link
                to="/account"
                className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">receipt</span>
                <span>Lihat Akun & Invoice</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
