import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotalTax, isFreeShipping, clearCart } = useCart();
  const { applyVoucher, addOrder } = useAdmin();
  const { isAuthenticated, currentUser, loginAsCustomer } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'jpqr' | 'paypay' | 'konbini' | 'card' | 'bank' | 'cod'>('jpqr');
  const [courier, setCourier] = useState<'Yamato Transport' | 'Sagawa Express'>('Yamato Transport');
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || 'Willy Pratama',
    phone: currentUser?.phone || '+81 80-1122-3344',
    postalCode: '134-0088',
    prefecture: 'Tokyo-to (東京都)',
    city: 'Edogawa-ku (江戸川区)',
    address: currentUser?.address || 'Nishi-Kasai 3-1-4, Mansion Sakura #302',
    deliveryTime: 'bebas'
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        phone: currentUser.phone || prev.phone,
        address: currentUser.address || prev.address
      }));
    }
  }, [currentUser]);

  // Voucher in checkout
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherMsg, setVoucherMsg] = useState<string>('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      total: grandTotal,
      totalAmount: grandTotal,
      taxAmount: foodTaxAmount,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      customerName: formData.fullName ? `${formData.fullName}` : 'Pelanggan Diaspora',
      shippingAddress: `${formData.postalCode} ${formData.prefecture} ${formData.city} ${formData.address}`,
      address: `${formData.postalCode} ${formData.prefecture} ${formData.city} ${formData.address}`,
      items: cart.map(item => ({
        id: item.product.id,
        productName: item.product.name,
        name: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        qty: item.quantity,
        price: item.product.priceTax * item.quantity
      }))
    };

    // Save directly to admin state and storage
    addOrder(newOrder);

    setCompletedOrder(newOrder);
    clearCart();
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Info Card */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">local_shipping</span>
                <span>1. Alamat Pengiriman di Jepang (お届け先)</span>
              </h2>
              <span className="text-xs text-[#15803D] font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                ✓ 47 Prefektur Terlayani
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Lengkap Penerima</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nomor Telepon (Jepang / WA)</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Kode Pos (〒 郵便番号)</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Prefektur (都道府県)</label>
                <input
                  type="text"
                  required
                  value={formData.prefecture}
                  onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Kota / Distrik (市区町村)</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:border-[#c41230] focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Pilihan Kurir Ekspedisi</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm font-bold focus:border-[#c41230] outline-none"
                >
                  <option value="Yamato Transport">🐱 Kuroneko Yamato Transport (ヤマト運輸)</option>
                  <option value="Sagawa Express">🚚 Sagawa Express (佐川急便)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Alamat Lengkap & Nomor Apartemen / Mansion (番地・建物名・部屋番号)
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                      <span className="px-2 py-0.5 bg-[#c41230] text-white text-[10px] font-black tracking-wider rounded">JPQR</span>
                      <span className="px-2 py-0.5 bg-red-100 text-[#c41230] text-[10px] font-bold rounded">JAPAN QRIS</span>
                      <span className="text-stone-900 font-bold">Standard Unified QR (JPQR 統一QR)</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">⚡ Rekomendasi Bebas Biaya</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                    Bayar praktis 1 Barcode QR: Mendukung <strong>Aplikasi QRIS Indonesia</strong> (BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA) & <strong>E-Wallet Jepang</strong> (PayPay, d-Harai, au PAY, Merpay, Bank Pay).
                  </p>

                  {paymentMethod === 'jpqr' && (
                    <div className="mt-3 p-4 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                      {/* Barcode / QR Frame Box Placeholder */}
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
                          <li>Masukkan nominal pembayaran pas <strong>¥{grandTotal.toLocaleString()}</strong>.</li>
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
                    <span>QR & Aplikasi</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Scan kode QR PayPay instan tanpa biaya transfer.</p>
                </div>
              </label>

              {/* Konbini Pay */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
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
                    🏪 Konbini Pay (コンビニ決済)
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Lawson (Loppi), FamilyMart (FamiPort), 7-Eleven.</p>
                </div>
              </label>

              {/* Credit Card */}
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
                  <div className="font-bold text-xs text-stone-900">
                    💳 Kartu Kredit (クレジットカード)
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Visa, Mastercard, JCB, American Express.</p>
                </div>
              </label>

              {/* Bank Transfer */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'bank' ? 'border-[#c41230] bg-red-50/40 ring-1 ring-[#c41230]' : 'border-stone-200 hover:border-stone-300'
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
                  <div className="font-bold text-xs text-stone-900">
                    🏦 Transfer Bank Jepang (銀行振込)
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Yucho Bank (ゆうちょ銀行) & SMBC.</p>
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
                    <img src={item.product.image} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-stone-900 line-clamp-1 max-w-[130px]">{item.product.name}</p>
                      <p className="text-stone-400">x{item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-800">
                    ¥{(item.product.priceTax * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Voucher Box */}
            <div className="pt-2 border-t border-stone-100">
              <label className="text-[11px] font-bold text-stone-700 block mb-1">Kode Voucher Diskon:</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder="INDONESIA500"
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold"
                >
                  Terapkan
                </button>
              </div>
              {voucherMsg && (
                <p className={`text-[11px] mt-1 ${appliedVoucher ? 'text-emerald-700 font-bold' : 'text-red-500'}`}>
                  {voucherMsg}
                </p>
              )}
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal Produk:</span>
                <span>¥{subtotalTax.toLocaleString()}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Potongan Voucher:</span>
                  <span>-¥{discountVal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Ongkir ({courier}):</span>
                <span>{isFreeShipping ? <span className="text-emerald-600 font-bold">GRATIS</span> : `¥${shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 text-base font-bold text-[#c41230] border-t border-stone-100">
                <span>Total Bayar:</span>
                <span className="text-2xl font-black">¥{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold py-3.5 px-6 rounded-xl shadow-md active:scale-95 transition-all text-sm cursor-pointer"
            >
              <span>Konfirmasi & Buat Pesanan</span>
              <span className="material-symbols-outlined text-sm">lock</span>
            </button>
          </div>
        </div>
      </form>

      {/* Order Completed Modal */}
      {completedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>

            <div>
              <h3 className="text-xl font-bold text-stone-900">Pesanan Berhasil Dibuat!</h3>
              <p className="text-xs text-stone-500 mt-1">
                Terima kasih atas pesanan Anda di Sembako Nusantara Jepang. Kami akan segera mengemas dan mengirimkan pesanan Anda.
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
              <div className="flex justify-between pt-2 border-t border-stone-200 font-bold">
                <span className="text-stone-900">Total Pembayaran:</span>
                <span className="text-[#c41230] text-sm font-black">¥{completedOrder.totalAmount.toLocaleString()}</span>
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
