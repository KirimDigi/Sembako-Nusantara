import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product, POSCartItem, POSTransaction } from '../../types';

export const POSKasirPage: React.FC = () => {
  const { products, addPOSTransaction, customers } = useAdmin();
  const { language } = useLanguage();

  // POS State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<POSTransaction['paymentMethod']>('Cash');
  const [cashGiven, setCashGiven] = useState<number>(0);

  // Completed Receipt Modal State
  const [completedTx, setCompletedTx] = useState<POSTransaction | null>(null);

  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: 'POSレジシステム (実店舗)',
        subtitle: '東京実店舗・関西ハブの店頭販売に最適化された高速タッチPOSレジ会計。',
        searchPlaceholder: 'バーコード、商品名、ブランドを検索 (例: Indomie, Bango, Bakso)...',
        cartTitle: 'レジカート',
        clearCart: 'カートをクリア',
        memberLabel: '会員顧客 (ポイント付与):',
        memberWalkIn: '来店顧客 (非会員)',
        memberPoints: 'ポイント',
        cartEmpty: 'カートは空です。左側の商品をクリックして追加してください。',
        subtotal: '商品小計:',
        discount: 'レジ割引:',
        discountCut: (d: number) => `割引額 (${d}%):`,
        tax8: '消費税 (8% 軽減税率 飲食料品):',
        totalPay: 'お支払い合計:',
        btnPay: (amt: number) => `お会計 (¥${amt.toLocaleString()})`,
        stockLabel: '在庫:',
        frozenBadge: '❄️ 冷凍',
        // Payment Modal
        payModalTitle: 'お会計・決済処理',
        payTotalLabel: 'ご請求金額 (税込)',
        payMethodLabel: 'お支払い方法選択:',
        payCash: '💵 現金決済',
        payJpqr: '📱 JPQR / JAPAN QRIS',
        payPay: '🔴 PayPay QR',
        payCard: '💳 クレジットカード',
        payIc: '🚃 交通系ICカード',
        jpqrTitle: 'JPQR / JAPAN QRIS 専用端末',
        jpqrGuideTitle: 'QRコードをお客様へご案内:',
        jpqrGuideDesc: 'インドネシアQRIS (BCA, Mandiri, BRI等) & 日本国内JPQR / 各種QR決済に対応。',
        payPayGuide: '店舗PayPayバーコードをスキャン',
        cashGivenLabel: 'お預かり金額 (¥):',
        cashExact: 'ちょうど',
        changeLabel: 'お釣り:',
        changeShort: 'お預かり金額が不足しています！',
        btnCompletePay: '決済を確定してレシート発行',
        alertOutOfStock: (name: string) => `「${name}」は在庫切れです！`,
        alertExceedStock: (stk: number) => `在庫数 (${stk}) を超えています`,
        alertCashNotEnough: 'お預かり金額が請求額に満たないため会計できません。',
        // Receipt Modal
        receiptHeaderStore: 'SEMBAKO NUSANTARA TOKYO',
        receiptStoreDesc: '在日インドネシア食材・ハラール専門店',
        receiptStoreAddr: '東京都江戸川区 • TEL: 03-5678-9012',
        receiptNo: '伝票番号',
        receiptDate: '取引日時',
        receiptCashier: '担当レジ',
        receiptCustomer: 'お客様名',
        receiptSubtotal: '小計',
        receiptDiscount: '値引き',
        receiptTax: '消費税等 (8%)',
        receiptTotal: '合計 (税込)',
        receiptPaid: 'お預かり',
        receiptChange: 'お釣り',
        receiptThanks: '毎度ご来店ありがとうございます！ 🙏',
        btnPrintReceipt: 'レシート印刷',
        btnNewTx: '新規取引',
        categories: [
          { id: 'all', label: 'すべての商品' },
          { id: 'Mie Instan', label: '🍜 インスタント麺' },
          { id: 'Bumbu & Saus', label: '🌶️ 調味料・サンバル' },
          { id: 'Frozen Food', label: '🥩 冷凍ハラール食材' },
          { id: 'Minuman', label: '🧃 ドリンク・コーヒー' },
          { id: 'Snack & Kerupuk', label: '🍘 スナック・えびせん' },
          { id: 'Beras & Pokok', label: '🌾 お米・主食類' }
        ]
      };
    } else if (language === 'EN') {
      return {
        title: 'Point of Sale (POS) Cashier',
        subtitle: 'Fast touch POS cashier interface for walk-in transactions at Tokyo / Kansai Store Hub.',
        searchPlaceholder: 'Search barcode, product name, or brand (e.g. Indomie, Bango, Bakso)...',
        cartTitle: 'Cashier Cart',
        clearCart: 'Clear Cart',
        memberLabel: 'Member Customer (Points):',
        memberWalkIn: 'Walk-in Customer (Non-Member)',
        memberPoints: 'Points',
        cartEmpty: 'Cart is empty. Click products on the left to add items.',
        subtotal: 'Item Subtotal:',
        discount: 'Cashier Discount:',
        discountCut: (d: number) => `Discount (${d}%):`,
        tax8: 'Consumption Tax (8% Food JCT):',
        totalPay: 'Grand Total:',
        btnPay: (amt: number) => `Pay Transaction (¥${amt.toLocaleString()})`,
        stockLabel: 'Stock:',
        frozenBadge: '❄️ Frozen',
        // Payment Modal
        payModalTitle: 'Cashier Payment Processing',
        payTotalLabel: 'Total Due Amount',
        payMethodLabel: 'Select Payment Method:',
        payCash: '💵 Cash',
        payJpqr: '📱 JPQR / JAPAN QRIS',
        payPay: '🔴 PayPay QR',
        payCard: '💳 Credit Card',
        payIc: '🚃 IC Card',
        jpqrTitle: 'JPQR / JAPAN QRIS Terminal',
        jpqrGuideTitle: 'Prompt Customer Scan:',
        jpqrGuideDesc: 'Supports Indonesian Bank QRIS (BCA, Mandiri, BRI, etc.) & Japanese JPQR Wallets.',
        payPayGuide: 'Scan Cashier PayPay Barcode',
        cashGivenLabel: 'Cash Received (¥):',
        cashExact: 'Exact',
        changeLabel: 'Change:',
        changeShort: 'Insufficient Cash Tendered!',
        btnCompletePay: 'Complete & Print Receipt',
        alertOutOfStock: (name: string) => `Product "${name}" is out of stock!`,
        alertExceedStock: (stk: number) => `Quantity exceeds available stock (${stk})`,
        alertCashNotEnough: 'Cash given is less than the total purchase amount!',
        // Receipt Modal
        receiptHeaderStore: 'SEMBAKO NUSANTARA TOKYO',
        receiptStoreDesc: 'Indonesian Halal Specialty Store Japan',
        receiptStoreAddr: 'Edogawa-ku, Tokyo • Tel: 03-5678-9012',
        receiptNo: 'Receipt No.',
        receiptDate: 'Date',
        receiptCashier: 'Cashier',
        receiptCustomer: 'Customer',
        receiptSubtotal: 'Subtotal',
        receiptDiscount: 'Discount',
        receiptTax: 'Consumption Tax (8%)',
        receiptTotal: 'TOTAL (Tax Included)',
        receiptPaid: 'Paid',
        receiptChange: 'Change',
        receiptThanks: 'Thank you for shopping with us! 🙏',
        btnPrintReceipt: 'Print Receipt',
        btnNewTx: 'New Transaction',
        categories: [
          { id: 'all', label: 'All Products' },
          { id: 'Mie Instan', label: '🍜 Instant Noodles' },
          { id: 'Bumbu & Saus', label: '🌶️ Seasonings & Sauces' },
          { id: 'Frozen Food', label: '🥩 Halal Frozen Food' },
          { id: 'Minuman', label: '🧃 Beverages' },
          { id: 'Snack & Kerupuk', label: '🍘 Snacks & Crackers' },
          { id: 'Beras & Pokok', label: '🌾 Rice & Staples' }
        ]
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'Point of Sale (POS) Kasir Toko',
        subtitle: 'Antarmuka kasir cepat untuk melayani transaksi langsung di toko fisik Tokyo / Kansai Hub.',
        searchPlaceholder: 'Cari barcode, nama produk, atau brand (misal: Indomie, Bango, Bakso)...',
        cartTitle: 'Keranjang Kasir',
        clearCart: 'Kosongkan',
        memberLabel: 'Pelanggan Member (Poin):',
        memberWalkIn: 'Walk-in Customer (Non-Member)',
        memberPoints: 'Poin',
        cartEmpty: 'Keranjang masih kosong. Klik produk di sebelah kiri.',
        subtotal: 'Subtotal Item:',
        discount: 'Diskon Kasir:',
        discountCut: (d: number) => `Potongan Diskon (${d}%):`,
        tax8: 'Pajak Konsumsi (8% Makanan / Sembako):',
        totalPay: 'Total Pembayaran:',
        btnPay: (amt: number) => `Bayar Transaksi (¥${amt.toLocaleString()})`,
        stockLabel: 'Stok:',
        frozenBadge: '❄️ Frozen',
        // Payment Modal
        payModalTitle: 'Proses Pembayaran Kasir',
        payTotalLabel: 'Total Tagihan',
        payMethodLabel: 'Metode Pembayaran Kasir:',
        payCash: '💵 Tunai',
        payJpqr: '📱 JPQR / JAPAN QRIS',
        payPay: '🔴 PayPay QR',
        payCard: '💳 Kartu Kredit',
        payIc: '🚃 IC Card',
        jpqrTitle: 'JPQR / JAPAN QRIS Terminal',
        jpqrGuideTitle: 'Arahkan Scan Pelanggan:',
        jpqrGuideDesc: 'Mendukung QRIS Bank Indonesia (BCA, Mandiri, BRI, dll) & E-Wallet JPQR Jepang.',
        payPayGuide: 'Scan Kode Barcode PayPay Kasir',
        cashGivenLabel: 'Uang Tunai Diterima (¥):',
        cashExact: 'Uang Pas',
        changeLabel: 'Kembalian:',
        changeShort: 'Uang Kurang!',
        btnCompletePay: 'Selesaikan & Cetak Struk',
        alertOutOfStock: (name: string) => `Stok produk "${name}" habis!`,
        alertExceedStock: (stk: number) => `Jumlah melebihi stok yang tersedia (${stk})`,
        alertCashNotEnough: 'Jumlah uang tunai yang dimasukkan kurang dari total belanja!',
        // Receipt Modal
        receiptHeaderStore: 'SEMBAKO NUSANTARA JEPANG',
        receiptStoreDesc: 'Toko Produk Halal Indonesia di Jepang',
        receiptStoreAddr: 'Edogawa-ku, Tokyo • Tel: 03-5678-9012',
        receiptNo: 'No. Struk',
        receiptDate: 'Tanggal',
        receiptCashier: 'Kasir',
        receiptCustomer: 'Pelanggan',
        receiptSubtotal: 'Subtotal',
        receiptDiscount: 'Diskon',
        receiptTax: 'Pajak Konsumsi (8%)',
        receiptTotal: 'TOTAL (Termasuk Pajak)',
        receiptPaid: 'Bayar',
        receiptChange: 'Kembalian',
        receiptThanks: 'Terima kasih atas kunjungan Anda! 🙏',
        btnPrintReceipt: 'Cetak Nota',
        btnNewTx: 'Transaksi Baru',
        categories: [
          { id: 'all', label: 'Semua Produk' },
          { id: 'Mie Instan', label: '🍜 Mie Instan' },
          { id: 'Bumbu & Saus', label: '🌶️ Bumbu & Saus' },
          { id: 'Frozen Food', label: '🥩 Frozen Food' },
          { id: 'Minuman', label: '🧃 Minuman' },
          { id: 'Snack & Kerupuk', label: '🍘 Snack & Kerupuk' },
          { id: 'Beras & Pokok', label: '🌾 Beras & Pokok' }
        ]
      };
    }
  }, [language]);

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameJp && p.nameJp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert(txt.alertOutOfStock(product.name));
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(txt.alertExceedStock(product.stock));
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const targetProd = products.find((p) => p.id === productId);
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (targetProd && newQty > targetProd.stock) {
              alert(txt.alertExceedStock(targetProd.stock));
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setSelectedCustomer('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Math.round(taxableAmount * 0.08); // 8% food consumption tax (軽減税率 8%)
  const totalAmount = taxableAmount + taxAmount;

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashGiven(totalAmount); // Default exact cash
    setIsPaymentOpen(true);
  };

  const handleProcessPayment = () => {
    if (paymentMethod === 'Cash' && cashGiven < totalAmount) {
      alert(txt.alertCashNotEnough);
      return;
    }

    const change = paymentMethod === 'Cash' ? cashGiven - totalAmount : 0;

    const txPayload = {
      cashierName: language === 'JP' ? '東京店舗レジ (Cashier 01)' : language === 'EN' ? 'Tokyo Cashier (POS 01)' : 'Kasir Budi (Tokyo Store)',
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: language === 'JP' ? c.product.nameJp || c.product.name : language === 'EN' ? c.product.nameEn || c.product.name : c.product.name,
        price: c.product.price,
        quantity: c.quantity,
        subtotal: c.product.price * c.quantity
      })),
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod,
      amountPaid: paymentMethod === 'Cash' ? cashGiven : totalAmount,
      changeAmount: change,
      customerName: selectedCustomer || (language === 'JP' ? '店頭来店客 (非会員)' : language === 'EN' ? 'Walk-in Customer' : 'Pelanggan Toko (Walk-in)')
    };

    const savedTx = addPOSTransaction(txPayload);
    setIsPaymentOpen(false);
    setCart([]);
    setDiscountPercent(0);
    setCompletedTx(savedTx);
  };

  return (
    <AdminLayout
      title={txt.title}
      subtitle={txt.subtitle}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">
        {/* Left Column: Product Selection Grid (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={txt.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                </button>
              )}
            </div>

            {/* Categories Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {txt.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#c41230] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((item) => item.product.id === product.id);
              const isOutOfStock = product.stock <= 0;
              const displayName = language === 'JP' ? product.nameJp || product.name : language === 'EN' ? product.nameEn || product.name : product.name;

              return (
                <button
                  key={product.id}
                  disabled={isOutOfStock}
                  onClick={() => addToCart(product)}
                  className={`bg-white p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 group relative ${
                    isOutOfStock
                      ? 'border-stone-200 opacity-60 cursor-not-allowed'
                      : inCartItem
                      ? 'border-[#c41230] ring-2 ring-[#c41230]/20 shadow-sm'
                      : 'border-stone-200 hover:border-[#c41230] hover:shadow-md'
                  }`}
                >
                  {inCartItem && (
                    <span className="absolute top-2 right-2 bg-[#c41230] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs z-10">
                      {inCartItem.quantity}
                    </span>
                  )}

                  <div>
                    <div className="aspect-square rounded-xl bg-stone-50 overflow-hidden mb-2 relative">
                      <img
                        src={product.image}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.isFrozen && (
                        <span className="absolute bottom-1.5 left-1.5 bg-blue-600/90 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                          {txt.frozenBadge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 font-semibold uppercase truncate">
                      {product.brand}
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                      {displayName}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#c41230]">
                        ¥{product.price.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-stone-400">
                        {txt.stockLabel} <span className={product.stock <= 5 ? 'text-amber-600 font-bold' : ''}>{product.stock}</span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-stone-100 group-hover:bg-[#c41230] group-hover:text-white text-stone-600 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-sm">add</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: POS Cart & Order Summary (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 sticky top-20 flex flex-col justify-between min-h-[580px]">
          <div>
            {/* Header POS Cart */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">shopping_cart_checkout</span>
                <h3 className="font-bold text-sm text-stone-900">{txt.cartTitle}</h3>
              </div>
              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="text-xs text-stone-400 hover:text-[#c41230] font-semibold disabled:opacity-30 cursor-pointer"
              >
                {txt.clearCart}
              </button>
            </div>

            {/* Customer Selector */}
            <div className="mt-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                {txt.memberLabel}
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#c41230]"
              >
                <option value="">{txt.memberWalkIn}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.tier} - {c.loyaltyPoints} {txt.memberPoints})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="mt-4 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {cart.map((item) => {
                const displayName = language === 'JP' ? item.product.nameJp || item.product.name : language === 'EN' ? item.product.nameEn || item.product.name : item.product.name;
                return (
                  <div
                    key={item.product.id}
                    className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-stone-900 truncate">{displayName}</div>
                      <div className="text-[11px] text-stone-500">
                        ¥{item.product.price.toLocaleString()} x {item.quantity} ={' '}
                        <span className="font-bold text-stone-900">
                          ¥{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-stone-200 text-stone-600 flex items-center justify-center font-bold hover:bg-stone-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-stone-900 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-md bg-white border border-stone-200 text-stone-600 flex items-center justify-center font-bold hover:bg-stone-100 cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-300 hover:text-red-500 ml-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {cart.length === 0 && (
                <div className="text-center py-10 text-stone-400 space-y-1">
                  <span className="material-symbols-outlined text-3xl">shopping_basket</span>
                  <p className="text-xs">{txt.cartEmpty}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Pricing Breakdown */}
          <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
            <div className="flex justify-between text-xs text-stone-500">
              <span>{txt.subtotal}</span>
              <span className="font-semibold text-stone-900">¥{subtotal.toLocaleString()}</span>
            </div>

            {/* Discount Quick Picker */}
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>{txt.discount}</span>
              <div className="flex gap-1">
                {[0, 5, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDiscountPercent(d)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      discountPercent === d
                        ? 'bg-[#c41230] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {d}%
                  </button>
                ))}
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>{txt.discountCut(discountPercent)}</span>
                <span>-¥{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-stone-500">
              <span>{txt.tax8}</span>
              <span className="font-semibold text-stone-900">¥{taxAmount.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-900">{txt.totalPay}</span>
              <span className="text-2xl font-black text-[#c41230]">
                ¥{totalAmount.toLocaleString()}
              </span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={handleOpenPayment}
              className="w-full mt-3 py-3.5 bg-[#c41230] hover:bg-[#a80f28] disabled:bg-stone-300 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">payment</span>
              <span>{txt.btnPay(totalAmount)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">receipt</span>
                <span>{txt.payModalTitle}</span>
              </h3>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="text-center bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div className="text-xs text-stone-500 font-semibold uppercase">{txt.payTotalLabel}</div>
              <div className="text-3xl font-black text-[#c41230]">
                ¥{totalAmount.toLocaleString()}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">
                {txt.payMethodLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Cash', 'JPQR / QRIS', 'PayPay', 'Credit Card', 'IC Card'] as POSTransaction['paymentMethod'][]).map(
                  (pm) => (
                    <button
                      key={pm}
                      onClick={() => {
                        setPaymentMethod(pm);
                        if (pm !== 'Cash') {
                          setCashGiven(totalAmount);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === pm
                          ? 'border-[#c41230] bg-red-50 text-[#c41230] shadow-xs ring-1 ring-[#c41230]'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      } ${pm === 'JPQR / QRIS' ? 'col-span-2 sm:col-span-1 border-red-300' : ''}`}
                    >
                      <span>
                        {pm === 'Cash'
                          ? txt.payCash
                          : pm === 'JPQR / QRIS'
                          ? txt.payJpqr
                          : pm === 'PayPay'
                          ? txt.payPay
                          : pm === 'Credit Card'
                          ? txt.payCard
                          : txt.payIc}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* JPQR / QRIS Standby Screen in POS */}
            {paymentMethod === 'JPQR / QRIS' && (
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-[#c41230]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                    <span>{txt.jpqrTitle}</span>
                  </div>
                  <span className="text-[10px] bg-[#c41230] text-white px-2 py-0.5 rounded-full font-mono">
                    ¥{totalAmount.toLocaleString()}
                  </span>
                </div>
                
                {/* Barcode Frame Placeholder */}
                <div className="bg-white p-3 rounded-lg border border-dashed border-[#c41230] flex items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-stone-100 rounded-md flex flex-col items-center justify-center text-[#c41230] border border-stone-200">
                    <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                    <span className="text-[7px] font-bold">JPQR / QRIS</span>
                  </div>
                  <div className="text-[11px] text-stone-600 flex-1">
                    <p className="font-bold text-stone-800">{txt.jpqrGuideTitle}</p>
                    <p className="text-[10px] text-stone-500">{txt.jpqrGuideDesc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PayPay Standby */}
            {paymentMethod === 'PayPay' && (
              <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-[#FF0033] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-[#FF0033] text-white text-[10px] rounded font-bold">PayPay</span>
                  <span>{txt.payPayGuide}</span>
                </div>
                <span>¥{totalAmount.toLocaleString()}</span>
              </div>
            )}

            {/* Cash Input & Fast Buttons if Cash */}
            {paymentMethod === 'Cash' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-700 block">
                  {txt.cashGivenLabel}
                </label>
                <input
                  type="number"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(Number(e.target.value))}
                  className="w-full text-lg font-bold px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                />

                {/* Quick Cash Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCashGiven(totalAmount)}
                    className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {txt.cashExact}
                  </button>
                  {[1000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCashGiven(amt)}
                      className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      ¥{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Change Calculation */}
                <div className="p-3 bg-stone-100 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-600">{txt.changeLabel}</span>
                  <span
                    className={`text-base font-black ${
                      cashGiven >= totalAmount ? 'text-emerald-700' : 'text-red-500'
                    }`}
                  >
                    {cashGiven >= totalAmount
                      ? `¥${(cashGiven - totalAmount).toLocaleString()}`
                      : txt.changeShort}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              className="w-full py-3 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">done_all</span>
              <span>{txt.btnCompletePay}</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {completedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            {/* Receipt Thermal Paper Simulation */}
            <div className="bg-amber-50/40 p-4 rounded-xl border border-stone-200 font-mono text-xs space-y-3">
              <div className="text-center space-y-0.5 border-b border-dashed border-stone-300 pb-3">
                <div className="font-bold text-sm text-stone-900">{txt.receiptHeaderStore}</div>
                <div className="text-[10px] text-stone-500">{txt.receiptStoreDesc}</div>
                <div className="text-[9px] text-stone-400">{txt.receiptStoreAddr}</div>
              </div>

              <div className="text-[10px] text-stone-500 space-y-0.5">
                <div>{txt.receiptNo} : {completedTx.receiptNumber}</div>
                <div>{txt.receiptDate}   : {completedTx.date}</div>
                <div>{txt.receiptCashier}     : {completedTx.cashierName}</div>
                <div>{txt.receiptCustomer} : {completedTx.customerName}</div>
              </div>

              <div className="border-t border-b border-dashed border-stone-300 py-2 space-y-1.5">
                {completedTx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">
                      {item.productName} x{item.quantity}
                    </span>
                    <span>¥{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-stone-600">
                  <span>{txt.receiptSubtotal}</span>
                  <span>¥{completedTx.subtotal.toLocaleString()}</span>
                </div>
                {completedTx.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{txt.receiptDiscount}</span>
                    <span>-¥{completedTx.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>{txt.receiptTax}</span>
                  <span>¥{completedTx.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-200">
                  <span>{txt.receiptTotal}</span>
                  <span>¥{completedTx.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600 pt-1">
                  <span>{txt.receiptPaid} ({completedTx.paymentMethod})</span>
                  <span>¥{completedTx.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{txt.receiptChange}</span>
                  <span>¥{completedTx.changeAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-stone-400 pt-2 border-t border-dashed border-stone-300">
                {txt.receiptThanks}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>{txt.btnPrintReceipt}</span>
              </button>
              <button
                onClick={() => setCompletedTx(null)}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                <span>{txt.btnNewTx}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
