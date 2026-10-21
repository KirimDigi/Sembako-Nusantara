import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { ItemDiscount, ProductPromo, WholesalePriceTier, Voucher, Product } from '../../types';
import { getActiveExchangeRate, convertJpyToIdr, formatJpy, formatIdr } from '../../utils/currency';

type PromoTab = 'diskon' | 'promo' | 'voucher' | 'grosir';

export const MasterPromotionsPage: React.FC = () => {
  const {
    products,
    itemDiscounts,
    addItemDiscount,
    toggleItemDiscount,
    deleteItemDiscount,
    productPromos,
    addProductPromo,
    toggleProductPromo,
    deleteProductPromo,
    wholesalePrices,
    addWholesalePrice,
    toggleWholesalePrice,
    deleteWholesalePrice,
    vouchers,
    addVoucher,
    toggleVoucher,
    deleteVoucher
  } = useAdmin();

  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRate = getActiveExchangeRate();

  const [activeTab, setActiveTab] = useState<PromoTab>('diskon');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as PromoTab;
    if (tabParam && ['diskon', 'promo', 'voucher', 'grosir'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tab: PromoTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ==========================================
  // 1. STATE & MODAL: DISKON (ITEM DISCOUNT)
  // ==========================================
  const [isNewDiscountOpen, setIsNewDiscountOpen] = useState(false);
  const [discProductId, setDiscProductId] = useState<string>(products[0]?.id || '1');
  const [discType, setDiscType] = useState<ItemDiscount['discountType']>('PERCENTAGE');
  const [discValue, setDiscValue] = useState<number>(15);
  const [discStartDate, setDiscStartDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [discEndDate, setDiscEndDate] = useState<string>('2026-12-31');
  const [discNotes, setDiscNotes] = useState<string>('');
  const [discSearchQuery, setDiscSearchQuery] = useState<string>('');

  const selectedDiscProduct = useMemo(() => {
    return products.find((p) => p.id === discProductId) || products[0];
  }, [products, discProductId]);

  // Realtime calculated preview for discount
  const discCalculation = useMemo(() => {
    if (!selectedDiscProduct) return { discountedJPY: 0, discountedIDR: 0, cutJPY: 0, cutIDR: 0, pct: 0 };
    const originalJPY = selectedDiscProduct.price;
    const originalIDR = convertJpyToIdr(originalJPY, activeRate);

    let cutJPY = 0;
    let cutIDR = 0;
    let pct = 0;

    if (discType === 'PERCENTAGE') {
      pct = Math.min(100, Math.max(0, discValue));
      cutJPY = Math.round((originalJPY * pct) / 100);
      cutIDR = convertJpyToIdr(cutJPY, activeRate);
    } else if (discType === 'NOMINAL_JPY') {
      cutJPY = Math.min(originalJPY, Math.max(0, discValue));
      pct = originalJPY > 0 ? Math.round((cutJPY / originalJPY) * 100) : 0;
      cutIDR = convertJpyToIdr(cutJPY, activeRate);
    } else if (discType === 'NOMINAL_IDR') {
      cutIDR = Math.min(originalIDR, Math.max(0, discValue));
      cutJPY = Math.round(cutIDR / activeRate);
      pct = originalIDR > 0 ? Math.round((cutIDR / originalIDR) * 100) : 0;
    }

    const discountedJPY = Math.max(0, originalJPY - cutJPY);
    const discountedIDR = Math.max(0, originalIDR - cutIDR);

    return { discountedJPY, discountedIDR, cutJPY, cutIDR, pct };
  }, [selectedDiscProduct, discType, discValue, activeRate]);

  const handleSaveDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscProduct) return;

    const newDisc: ItemDiscount = {
      id: 'disc-' + Date.now(),
      productId: selectedDiscProduct.id,
      productName: selectedDiscProduct.name,
      productSku: (selectedDiscProduct as any).sku || `SKU-${selectedDiscProduct.id}`,
      productImage: selectedDiscProduct.image,
      originalPriceJPY: selectedDiscProduct.price,
      discountType: discType,
      discountValue: Number(discValue) || 0,
      discountedPriceJPY: discCalculation.discountedJPY,
      discountedPriceIDR: discCalculation.discountedIDR,
      startDate: discStartDate,
      endDate: discEndDate,
      isActive: true,
      notes: discNotes.trim() || undefined
    };

    addItemDiscount(newDisc);
    setIsNewDiscountOpen(false);
    setDiscNotes('');
  };

  // ==========================================
  // 2. STATE & MODAL: PROMO (BUY X GET Y / BUNDLE / FLASH)
  // ==========================================
  const [isNewPromoOpen, setIsNewPromoOpen] = useState(false);
  const [promoProductId, setPromoProductId] = useState<string>(products[0]?.id || '1');
  const [promoTitle, setPromoTitle] = useState<string>('');
  const [promoType, setPromoType] = useState<ProductPromo['promoType']>('BUY_X_GET_Y');
  const [promoCurrency, setPromoCurrency] = useState<'JPY' | 'IDR'>('JPY');
  const [promoPrice, setPromoPrice] = useState<number>(1000);
  const [promoBuyQty, setPromoBuyQty] = useState<number>(5);
  const [promoGetQty, setPromoGetQty] = useState<number>(1);
  const [promoFreeItemName, setPromoFreeItemName] = useState<string>('');
  const [promoMinSpend, setPromoMinSpend] = useState<number>(0);
  const [promoStartDate, setPromoStartDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [promoEndDate, setPromoEndDate] = useState<string>('2026-12-31');
  const [promoNotes, setPromoNotes] = useState<string>('');
  const [promoSearchQuery, setPromoSearchQuery] = useState<string>('');

  const selectedPromoProduct = useMemo(() => {
    return products.find((p) => p.id === promoProductId) || products[0];
  }, [products, promoProductId]);

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromoProduct) return;

    const newPromo: ProductPromo = {
      id: 'promo-' + Date.now(),
      productId: selectedPromoProduct.id,
      productName: selectedPromoProduct.name,
      productSku: (selectedPromoProduct as any).sku || `SKU-${selectedPromoProduct.id}`,
      productImage: selectedPromoProduct.image,
      promoTitle: promoTitle.trim() || `Promo Spesial ${selectedPromoProduct.name}`,
      promoType,
      currency: promoCurrency,
      promoPrice: promoType !== 'BUY_X_GET_Y' ? Number(promoPrice) : undefined,
      buyQty: promoType === 'BUY_X_GET_Y' ? Number(promoBuyQty) : undefined,
      getQty: promoType === 'BUY_X_GET_Y' ? Number(promoGetQty) : undefined,
      freeItemName: promoType === 'BUY_X_GET_Y' ? (promoFreeItemName.trim() || `1 pcs ${selectedPromoProduct.name}`) : undefined,
      minPurchaseAmount: promoMinSpend > 0 ? Number(promoMinSpend) : undefined,
      startDate: promoStartDate,
      endDate: promoEndDate,
      isActive: true,
      notes: promoNotes.trim() || undefined
    };

    addProductPromo(newPromo);
    setIsNewPromoOpen(false);
    setPromoTitle('');
    setPromoNotes('');
  };

  // ==========================================
  // 3. STATE & MODAL: VOUCHER (KUPON BELANJA)
  // ==========================================
  const [isNewVoucherOpen, setIsNewVoucherOpen] = useState(false);
  const [vCode, setVCode] = useState<string>('');
  const [vTitle, setVTitle] = useState<string>('');
  const [vDesc, setVDesc] = useState<string>('');
  const [vType, setVType] = useState<Voucher['discountType']>('PERCENTAGE');
  const [vCurrency, setVCurrency] = useState<'JPY' | 'IDR'>('JPY');
  const [vValue, setVValue] = useState<number>(10);
  const [vMinSpend, setVMinSpend] = useState<number>(3000);
  const [vMaxDiscount, setVMaxDiscount] = useState<number>(1000);
  const [vValidUntil, setVValidUntil] = useState<string>('2026-12-31');
  const [voucherSearchQuery, setVoucherSearchQuery] = useState<string>('');

  const generateRandomVoucherCode = () => {
    const prefixes = ['SEMBAKO', 'HEMAT', 'DIASPORA', 'NUSANTARA', 'BERKAH', 'JEPANG'];
    const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setVCode(`${pfx}${num}`);
  };

  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode.trim()) return;

    const newV: Voucher = {
      code: vCode.trim().toUpperCase(),
      title: vTitle.trim() || `Voucher ${vCode.trim().toUpperCase()}`,
      description: vDesc.trim() || (vCurrency === 'IDR' ? 'Kupon diskon nominal Rupiah (IDR)' : 'Kupon diskon resmi Sembako Nusantara Jepang'),
      discountType: vType,
      discountValue: Number(vValue) || 0,
      currency: vCurrency,
      minSpend: Number(vMinSpend) || 0,
      maxDiscount: vType === 'PERCENTAGE' && vMaxDiscount > 0 ? Number(vMaxDiscount) : undefined,
      validUntil: vValidUntil,
      usageCount: 0,
      isActive: true
    };

    addVoucher(newV);
    setIsNewVoucherOpen(false);
    setVCode('');
    setVTitle('');
    setVDesc('');
  };

  // ==========================================
  // 4. STATE & MODAL: HARGA GROSIR (WHOLESALE TIER)
  // ==========================================
  const [isNewGrosirOpen, setIsNewGrosirOpen] = useState(false);
  const [grosirProductId, setGrosirProductId] = useState<string>(products[0]?.id || '1');
  const [grosirMinQty, setGrosirMinQty] = useState<number>(24);
  const [grosirUnit, setGrosirUnit] = useState<string>('Dus (Karton)');
  const [grosirCurrency, setGrosirCurrency] = useState<'JPY' | 'IDR'>('JPY');
  const [grosirPriceInput, setGrosirPriceInput] = useState<number>(90);
  const [grosirNotes, setGrosirNotes] = useState<string>('');
  const [grosirSearchQuery, setGrosirSearchQuery] = useState<string>('');

  const selectedGrosirProduct = useMemo(() => {
    return products.find((p) => p.id === grosirProductId) || products[0];
  }, [products, grosirProductId]);

  const grosirSavingsCalc = useMemo(() => {
    if (!selectedGrosirProduct) return { wholesaleJPY: 0, wholesaleIDR: 0, savingsJPY: 0, savingsPct: 0 };
    const regularJPY = selectedGrosirProduct.price;

    let wholesaleJPY = 0;
    let wholesaleIDR = 0;

    if (grosirCurrency === 'JPY') {
      wholesaleJPY = Math.max(1, grosirPriceInput);
      wholesaleIDR = convertJpyToIdr(wholesaleJPY, activeRate);
    } else {
      wholesaleIDR = Math.max(100, grosirPriceInput);
      wholesaleJPY = Math.round(wholesaleIDR / activeRate);
    }

    const savingsJPY = Math.max(0, regularJPY - wholesaleJPY);
    const savingsPct = regularJPY > 0 ? Math.round((savingsJPY / regularJPY) * 1000) / 10 : 0;

    return { wholesaleJPY, wholesaleIDR, savingsJPY, savingsPct };
  }, [selectedGrosirProduct, grosirCurrency, grosirPriceInput, activeRate]);

  const handleSaveGrosir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrosirProduct) return;

    const newTier: WholesalePriceTier = {
      id: 'grosir-' + Date.now(),
      productId: selectedGrosirProduct.id,
      productName: selectedGrosirProduct.name,
      productSku: (selectedGrosirProduct as any).sku || `SKU-${selectedGrosirProduct.id}`,
      productImage: selectedGrosirProduct.image,
      regularPriceJPY: selectedGrosirProduct.price,
      minQuantity: Number(grosirMinQty) || 1,
      unit: grosirUnit,
      wholesalePriceJPY: grosirSavingsCalc.wholesaleJPY,
      wholesalePriceIDR: grosirSavingsCalc.wholesaleIDR,
      savingsPercentage: grosirSavingsCalc.savingsPct,
      isActive: true,
      notes: grosirNotes.trim() || undefined
    };

    addWholesalePrice(newTier);
    setIsNewGrosirOpen(false);
    setGrosirNotes('');
  };

  // Helper text translations
  const tTab = (tab: PromoTab) => {
    switch (tab) {
      case 'diskon':
        return language === 'JP' ? '商品割引 (Diskon)' : language === 'EN' ? 'Item Discounts' : 'Diskon Produk';
      case 'promo':
        return language === 'JP' ? 'プロモーション (Promo)' : language === 'EN' ? 'Promotions & Bundles' : 'Promo & Bundle';
      case 'voucher':
        return language === 'JP' ? 'クーポン券 (Voucher)' : language === 'EN' ? 'Vouchers' : 'Kupon Voucher';
      case 'grosir':
        return language === 'JP' ? '卸売・まとめ価格 (Grosir)' : language === 'EN' ? 'Wholesale Pricing' : 'Harga Grosir';
    }
  };

  return (
    <AdminLayout
      title={
        language === 'JP'
          ? 'マスターデータ：割引・プロモ・クーポン・卸売価格'
          : language === 'EN'
          ? 'Master Promotions, Discounts & Wholesale'
          : 'Master Data: Diskon, Promo, Voucher & Harga Grosir'
      }
      subtitle={
        language === 'JP'
          ? '特定商品の割引設定、まとめ買いプロモ、多通貨(Yen/IDR)クーポン券、卸売価格階層の一元管理。'
          : language === 'EN'
          ? 'Unified management of item-specific discounts, promo bundles, dual-currency vouchers (Yen/IDR), and wholesale pricing.'
          : 'Pusat pengaturan diskon item produk, promo beli X gratis Y / bundle, kupon voucher Yen/IDR, serta tingkatan harga grosir reseller.'
      }
    >
      <div className="space-y-6">
        {/* Top Currency Status Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">loyalty</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-base sm:text-lg text-white">
                {language === 'JP' ? 'マルチ通貨プロモーション管理 (Yen ＆ IDR)' : language === 'EN' ? 'Multi-Currency Promotion Engine' : 'Manajemen Promosi Multi-Mata Uang (Yen & IDR)'}
              </h2>
              <p className="text-xs text-stone-300">
                {language === 'JP'
                  ? `本日のリアルタイム基準レート: 1 JPY = Rp ${activeRate.toLocaleString()} (自動換算対応)`
                  : language === 'EN'
                  ? `Active Exchange Rate Today: 1 JPY = Rp ${activeRate.toLocaleString()} (Automatic live conversion)`
                  : `Kurs Realtime Aktif Hari Ini: 1 JPY = Rp ${activeRate.toLocaleString('id-ID')} (Kalkulasi otomatis Yen / IDR)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{language === 'JP' ? 'Yen / IDR サポート' : 'Yen / IDR Active'}</span>
            </span>
          </div>
        </div>

        {/* 4 Main Submenu Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#EBE5DF] shadow-xs">
          <button
            type="button"
            onClick={() => switchTab('diskon')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'diskon'
                ? 'bg-amber-500 text-stone-900 shadow-md font-extrabold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">percent</span>
            <span>{tTab('diskon')}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'diskon' ? 'bg-stone-900 text-amber-300' : 'bg-stone-200 text-stone-700'
            }`}>
              {itemDiscounts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('promo')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'promo'
                ? 'bg-purple-600 text-white shadow-md font-extrabold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">campaign</span>
            <span>{tTab('promo')}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'promo' ? 'bg-white text-purple-700' : 'bg-stone-200 text-stone-700'
            }`}>
              {productPromos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('voucher')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'voucher'
                ? 'bg-[#c41230] text-white shadow-md font-extrabold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">confirmation_number</span>
            <span>{tTab('voucher')}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'voucher' ? 'bg-white text-[#c41230]' : 'bg-stone-200 text-stone-700'
            }`}>
              {vouchers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('grosir')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'grosir'
                ? 'bg-teal-700 text-white shadow-md font-extrabold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">inventory</span>
            <span>{tTab('grosir')}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'grosir' ? 'bg-white text-teal-800' : 'bg-stone-200 text-stone-700'
            }`}>
              {wholesalePrices.length}
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DISKON (ITEM DISCOUNT WITH PRODUCT DROPDOWN)       */}
        {/* ========================================================= */}
        {activeTab === 'diskon' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EBE5DF]">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
                <input
                  type="text"
                  value={discSearchQuery}
                  onChange={(e) => setDiscSearchQuery(e.target.value)}
                  placeholder={language === 'JP' ? '割引商品を検索...' : 'Cari nama produk / SKU diskon...'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsNewDiscountOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>{language === 'JP' ? '新規商品割引を設定 (+)' : '+ Tambah Diskon Produk'}</span>
              </button>
            </div>

            {/* List / Table */}
            <div className="bg-white rounded-2xl border border-[#EBE5DF] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-stone-600 font-bold uppercase tracking-wider border-b border-[#EBE5DF]">
                    <tr>
                      <th className="py-3 px-4">Produk Item</th>
                      <th className="py-3 px-4">Harga Normal (¥ & Rp)</th>
                      <th className="py-3 px-4">Tipe Diskon</th>
                      <th className="py-3 px-4">Harga Diskon (Yen / IDR)</th>
                      <th className="py-3 px-4">Periode</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE5DF]">
                    {itemDiscounts
                      .filter((d) => d.productName.toLowerCase().includes(discSearchQuery.toLowerCase()) || (d.productSku || '').toLowerCase().includes(discSearchQuery.toLowerCase()))
                      .map((d) => (
                        <tr key={d.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={d.productImage || 'https://via.placeholder.com/80'}
                                alt={d.productName}
                                className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50"
                              />
                              <div>
                                <span className="font-bold text-stone-900 text-xs block leading-tight">{d.productName}</span>
                                <span className="text-[11px] text-stone-500 font-mono">SKU: {d.productSku || `SKU-${d.productId}`}</span>
                                {d.notes && <span className="text-[10px] text-amber-700 block italic">{d.notes}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-stone-800">{formatJpy(d.originalPriceJPY)}</div>
                            <div className="text-[11px] text-stone-500">{formatIdr(convertJpyToIdr(d.originalPriceJPY, activeRate))}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              {d.discountType === 'PERCENTAGE' && `${d.discountValue}% OFF`}
                              {d.discountType === 'NOMINAL_JPY' && `Potongan ¥${d.discountValue.toLocaleString()}`}
                              {d.discountType === 'NOMINAL_IDR' && `Potongan Rp ${d.discountValue.toLocaleString('id-ID')}`}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-emerald-700 text-sm">
                              {formatJpy(d.discountedPriceJPY)}
                            </div>
                            <div className="text-[11px] font-semibold text-stone-600">
                              {formatIdr(d.discountedPriceIDR || convertJpyToIdr(d.discountedPriceJPY, activeRate))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-stone-600 text-[11px]">
                            <div>{d.startDate}</div>
                            <div className="text-stone-400">s/d {d.endDate}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => toggleItemDiscount(d.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                d.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {d.isActive ? '● Aktif' : 'Non-Aktif'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => deleteItemDiscount(d.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Hapus Diskon"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    {itemDiscounts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-stone-500">
                          Belum ada diskon produk. Klik "+ Tambah Diskon Produk" di atas untuk menambahkan item yang ingin didiskon.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROMO (PROMOTIONS & BUNDLES WITH ITEM DROPDOWN)    */}
        {/* ========================================================= */}
        {activeTab === 'promo' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EBE5DF]">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
                <input
                  type="text"
                  value={promoSearchQuery}
                  onChange={(e) => setPromoSearchQuery(e.target.value)}
                  placeholder={language === 'JP' ? 'プロモーションを検索...' : 'Cari judul promo atau produk...'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-purple-500 bg-stone-50"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsNewPromoOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>{language === 'JP' ? '新規プロモを作成 (+)' : '+ Buat Promo Baru'}</span>
              </button>
            </div>

            {/* Promo Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {productPromos
                .filter((p) => p.promoTitle.toLowerCase().includes(promoSearchQuery.toLowerCase()) || p.productName.toLowerCase().includes(promoSearchQuery.toLowerCase()))
                .map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wide border border-purple-200">
                          {promo.promoType === 'BUY_X_GET_Y' && '🎁 Beli X Gratis Y'}
                          {promo.promoType === 'FLASH_SALE' && '⚡ Flash Sale Kilat'}
                          {promo.promoType === 'SPECIAL_BUNDLE' && '📦 Paket Hemat Bundle'}
                          {promo.promoType === 'CASHBACK_POINTS' && '🪙 Cashback Koin'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleProductPromo(promo.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            promo.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {promo.isActive ? 'Aktif' : 'Non-Aktif'}
                        </button>
                      </div>

                      <h3 className="font-heading font-bold text-stone-900 text-sm mb-1.5 leading-snug">
                        {promo.promoTitle}
                      </h3>

                      <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 mb-3">
                        <img
                          src={promo.productImage || 'https://via.placeholder.com/80'}
                          alt={promo.productName}
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0 bg-white"
                        />
                        <div className="overflow-hidden">
                          <span className="font-bold text-xs text-stone-800 block truncate">{promo.productName}</span>
                          <span className="text-[10px] text-stone-500 font-mono block">SKU: {promo.productSku || promo.productId}</span>
                        </div>
                      </div>

                      {/* Promo Detail */}
                      <div className="space-y-1.5 text-xs text-stone-700 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                        {promo.promoType === 'BUY_X_GET_Y' && (
                          <div className="font-semibold text-purple-900">
                            Beli <strong className="text-purple-700">{promo.buyQty} pcs</strong> Gratis <strong className="text-emerald-700">{promo.getQty} pcs</strong> ({promo.freeItemName || 'Item Gratis'})
                          </div>
                        )}
                        {promo.promoType !== 'BUY_X_GET_Y' && promo.promoPrice && (
                          <div className="font-semibold text-stone-900 flex items-center justify-between">
                            <span>Harga Promo ({promo.currency}):</span>
                            <span className="font-extrabold text-sm text-purple-700 font-mono">
                              {promo.currency === 'IDR' ? formatIdr(promo.promoPrice) : formatJpy(promo.promoPrice)}
                            </span>
                          </div>
                        )}
                        <div className="text-[11px] text-stone-500 flex items-center gap-1 pt-1 border-t border-purple-100">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          <span>Berlaku: {promo.startDate} s/d {promo.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-400 text-[11px] italic">{promo.notes || 'Promo Nusantara'}</span>
                      <button
                        type="button"
                        onClick={() => deleteProductPromo(promo.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1"
                        title="Hapus Promo"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              {productPromos.length === 0 && (
                <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-2xl border border-[#EBE5DF]">
                  Belum ada promo produk aktif. Klik "+ Buat Promo Baru" untuk menambahkan promo Beli X Gratis Y, Flash Sale, atau Paket Hemat.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: VOUCHER (KUPON BELANJA YEN / IDR - NO ITEM REQ)   */}
        {/* ========================================================= */}
        {activeTab === 'voucher' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EBE5DF]">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
                <input
                  type="text"
                  value={voucherSearchQuery}
                  onChange={(e) => setVoucherSearchQuery(e.target.value)}
                  placeholder={language === 'JP' ? 'クーポンコードを検索...' : 'Cari kode kupon voucher...'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-[#c41230] bg-stone-50"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsNewVoucherOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">confirmation_number</span>
                <span>{language === 'JP' ? '新規クーポン発行 (+)' : '+ Buat Kupon Voucher Baru'}</span>
              </button>
            </div>

            {/* Voucher Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vouchers
                .filter((v) => v.code.toLowerCase().includes(voucherSearchQuery.toLowerCase()) || v.title.toLowerCase().includes(voucherSearchQuery.toLowerCase()))
                .map((v) => (
                  <div
                    key={v.code}
                    className="bg-white rounded-2xl border-2 border-dashed border-red-200 p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono font-extrabold text-sm sm:text-base text-[#c41230] tracking-wider bg-red-50 px-3 py-1 rounded-lg border border-red-200 flex items-center gap-1.5">
                          <span>{v.code}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleVoucher(v.code)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                              v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {v.isActive ? 'Aktif' : 'Non-Aktif'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus voucher promo "${v.code}"?`)) {
                                deleteVoucher(v.code);
                              }
                            }}
                            className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Hapus Voucher"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>

                      <h4 className="font-heading font-bold text-stone-900 text-sm mt-2">{v.title}</h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">{v.description}</p>

                      {/* Value Specs */}
                      <div className="mt-4 p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE5DF] space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">Nilai Potongan:</span>
                          <span className="font-bold text-[#c41230]">
                            {v.discountType === 'PERCENTAGE' && `${v.discountValue}%`}
                            {(v.discountType === 'FIXED' || v.discountType === 'NOMINAL_JPY') && `¥${v.discountValue.toLocaleString()} (Yen)`}
                            {v.discountType === 'NOMINAL_IDR' && `Rp ${v.discountValue.toLocaleString('id-ID')} (Rupiah)`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">Min. Belanja:</span>
                          <span className="font-semibold text-stone-800">
                            {v.currency === 'IDR' || v.discountType === 'NOMINAL_IDR'
                              ? `Rp ${v.minSpend.toLocaleString('id-ID')}`
                              : `¥${v.minSpend.toLocaleString()}`}
                          </span>
                        </div>
                        {v.maxDiscount && (
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">Maks. Potongan:</span>
                            <span className="font-semibold text-stone-800">¥{v.maxDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-[11px] text-stone-500">
                          <span>Masa Berlaku:</span>
                          <span className="font-mono">{v.validUntil}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <span className="text-stone-500 text-[11px]">Terpakai: {v.usageCount || 0}x</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(v.code);
                            alert(`Kode voucher ${v.code} berhasil disalin!`);
                          }}
                          className="p-1 text-stone-500 hover:text-[#c41230] rounded hover:bg-stone-100"
                          title="Salin Kode Voucher"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteVoucher(v.code)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                          title="Hapus Voucher"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: HARGA GROSIR (WHOLESALE PRICING WITH ITEM DROPDOWN) */}
        {/* ========================================================= */}
        {activeTab === 'grosir' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EBE5DF]">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
                <input
                  type="text"
                  value={grosirSearchQuery}
                  onChange={(e) => setGrosirSearchQuery(e.target.value)}
                  placeholder={language === 'JP' ? '卸売商品を検索...' : 'Cari produk / SKU harga grosir...'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-teal-600 bg-stone-50"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsNewGrosirOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_box</span>
                <span>{language === 'JP' ? '新規卸売価格を設定 (+)' : '+ Atur Harga Grosir Produk'}</span>
              </button>
            </div>

            {/* Wholesale Table */}
            <div className="bg-white rounded-2xl border border-[#EBE5DF] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-stone-600 font-bold uppercase tracking-wider border-b border-[#EBE5DF]">
                    <tr>
                      <th className="py-3 px-4">Produk Item</th>
                      <th className="py-3 px-4">Harga Eceran Normal</th>
                      <th className="py-3 px-4">Minimal Order (Tier)</th>
                      <th className="py-3 px-4">Harga Grosir (Yen / IDR)</th>
                      <th className="py-3 px-4">Margin Hemat Reseller</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE5DF]">
                    {wholesalePrices
                      .filter((w) => w.productName.toLowerCase().includes(grosirSearchQuery.toLowerCase()) || (w.productSku || '').toLowerCase().includes(grosirSearchQuery.toLowerCase()))
                      .map((w) => (
                        <tr key={w.id} className="hover:bg-teal-50/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={w.productImage || 'https://via.placeholder.com/80'}
                                alt={w.productName}
                                className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50"
                              />
                              <div>
                                <span className="font-bold text-stone-900 text-xs block leading-tight">{w.productName}</span>
                                <span className="text-[11px] text-stone-500 font-mono">SKU: {w.productSku || w.productId}</span>
                                {w.notes && <span className="text-[10px] text-teal-700 block italic">{w.notes}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-stone-800">{formatJpy(w.regularPriceJPY)}</div>
                            <div className="text-[11px] text-stone-400">{formatIdr(convertJpyToIdr(w.regularPriceJPY, activeRate))}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200">
                              <span className="material-symbols-outlined text-sm text-teal-700">package_2</span>
                              <span>Min {w.minQuantity} {w.unit}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-teal-700 text-sm">
                              {formatJpy(w.wholesalePriceJPY)}
                            </div>
                            <div className="text-[11px] font-semibold text-stone-600">
                              {formatIdr(w.wholesalePriceIDR || convertJpyToIdr(w.wholesalePriceJPY, activeRate))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              Hemat {w.savingsPercentage}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => toggleWholesalePrice(w.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                w.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {w.isActive ? '● Aktif' : 'Non-Aktif'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => deleteWholesalePrice(w.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Hapus Harga Grosir"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    {wholesalePrices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-stone-500">
                          Belum ada data harga grosir. Klik "+ Atur Harga Grosir Produk" untuk menambahkan tingkat harga grosir bagi warung/reseller.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: TAMBAH DISKON PRODUK (DROPDOWN ITEM SELECTION)   */}
        {/* ========================================================= */}
        {isNewDiscountOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">percent</span>
                  <h3 className="font-heading font-bold text-base text-stone-900">Atur Diskon Produk Khusus</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewDiscountOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveDiscount} className="space-y-4 text-xs">
                {/* 1. Dropdown Pilihan Item Produk */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">
                    1. Pilih Produk Item yang Mau Didiskon:
                  </label>
                  <select
                    value={discProductId}
                    onChange={(e) => setDiscProductId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-amber-500 font-medium text-xs bg-stone-50"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Normal: {formatJpy(p.price)} / {formatIdr(convertJpyToIdr(p.price, activeRate))}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Product Preview Card */}
                {selectedDiscProduct && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                    <img
                      src={selectedDiscProduct.image || '/placeholder-upload.svg'}
                      alt={selectedDiscProduct.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-upload.svg';
                      }}
                      className="w-12 h-12 rounded-lg object-contain p-0.5 border border-amber-200 shrink-0 bg-white"
                    />
                    <div>
                      <span className="font-bold text-stone-900 block text-xs">{selectedDiscProduct.name}</span>
                      <span className="text-[11px] text-stone-600">
                        Harga Normal: <strong>{formatJpy(selectedDiscProduct.price)}</strong> ({formatIdr(convertJpyToIdr(selectedDiscProduct.price, activeRate))})
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Jenis Diskon (Persentase / Yen / IDR) */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">2. Tipe Potongan Diskon:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setDiscType('PERCENTAGE'); setDiscValue(15); }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                        discType === 'PERCENTAGE'
                          ? 'bg-amber-500 text-stone-900 border-amber-500 shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      Persentase (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDiscType('NOMINAL_JPY'); setDiscValue(100); }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                        discType === 'NOMINAL_JPY'
                          ? 'bg-amber-500 text-stone-900 border-amber-500 shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      Nominal Yen (¥)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDiscType('NOMINAL_IDR'); setDiscValue(10000); }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                        discType === 'NOMINAL_IDR'
                          ? 'bg-amber-500 text-stone-900 border-amber-500 shadow-xs'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      Nominal Rupiah (Rp)
                    </button>
                  </div>
                </div>

                {/* 3. Nilai Diskon Input */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {discType === 'PERCENTAGE' && 'Besar Diskon (%):'}
                    {discType === 'NOMINAL_JPY' && 'Potongan Harga (Yen ¥):'}
                    {discType === 'NOMINAL_IDR' && 'Potongan Harga (Rupiah Rp):'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={discValue}
                    onChange={(e) => setDiscValue(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-amber-500 font-mono font-bold text-sm bg-white"
                  />
                </div>

                {/* 4. Realtime Calculation Preview */}
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-900 block mb-1">⚡ Hasil Perhitungan Realtime:</span>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>Harga Setelah Diskon (Yen):</span>
                    <strong className="text-emerald-800 text-sm font-mono">{formatJpy(discCalculation.discountedJPY)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>Harga Setelah Diskon (Rupiah):</span>
                    <strong className="text-emerald-800 text-sm font-mono">{formatIdr(discCalculation.discountedIDR)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-emerald-200/60">
                    <span>Hemat Pembeli:</span>
                    <span className="text-emerald-700 font-bold">{discCalculation.pct}% ({formatJpy(discCalculation.cutJPY)})</span>
                  </div>
                </div>

                {/* 5. Periode & Catatan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tanggal Mulai:</label>
                    <input
                      type="date"
                      value={discStartDate}
                      onChange={(e) => setDiscStartDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tanggal Berakhir:</label>
                    <input
                      type="date"
                      value={discEndDate}
                      onChange={(e) => setDiscEndDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Catatan Promo (Opsional):</label>
                  <input
                    type="text"
                    value={discNotes}
                    onChange={(e) => setDiscNotes(e.target.value)}
                    placeholder="Contoh: Diskon Gajian Diaspora / Flash Sale Mingguan"
                    className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsNewDiscountOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold shadow-md cursor-pointer"
                  >
                    Simpan Diskon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: TAMBAH PROMO (DROPDOWN ITEM SELECTION)           */}
        {/* ========================================================= */}
        {isNewPromoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">campaign</span>
                  <h3 className="font-heading font-bold text-base text-stone-900">Buat Program Promo Baru</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewPromoOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
                {/* 1. Item Dropdown */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">
                    1. Pilih Produk Item yang Dipromosikan:
                  </label>
                  <select
                    value={promoProductId}
                    onChange={(e) => setPromoProductId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-purple-500 font-medium text-xs bg-stone-50"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatJpy(p.price)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Judul Promo */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Judul / Nama Promo:</label>
                  <input
                    type="text"
                    required
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    placeholder="Contoh: Beli 5 Gratis 1 Indomie Ayam Bawang"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-purple-500 text-xs"
                  />
                </div>

                {/* 3. Tipe Promo */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">Tipe Skema Promo:</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50"
                  >
                    <option value="BUY_X_GET_Y">🎁 Beli X Gratis Y (Buy X Get Y Free)</option>
                    <option value="FLASH_SALE">⚡ Flash Sale Kilat</option>
                    <option value="SPECIAL_BUNDLE">📦 Paket Hemat / Bundle Khusus</option>
                    <option value="CASHBACK_POINTS">🪙 Cashback Poin Member</option>
                  </select>
                </div>

                {/* 4. Mata Uang (Yen vs IDR) */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mata Uang Acuan Promo:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPromoCurrency('JPY')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                        promoCurrency === 'JPY' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      ¥ Yen (JPY)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoCurrency('IDR')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                        promoCurrency === 'IDR' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      Rp Rupiah (IDR)
                    </button>
                  </div>
                </div>

                {/* Conditional Inputs */}
                {promoType === 'BUY_X_GET_Y' ? (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Beli Qty (pcs):</label>
                      <input
                        type="number"
                        min={1}
                        value={promoBuyQty}
                        onChange={(e) => setPromoBuyQty(Number(e.target.value) || 1)}
                        className="w-full p-2 rounded-xl border border-stone-300 text-xs bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Gratis Qty (pcs):</label>
                      <input
                        type="number"
                        min={1}
                        value={promoGetQty}
                        onChange={(e) => setPromoGetQty(Number(e.target.value) || 1)}
                        className="w-full p-2 rounded-xl border border-stone-300 text-xs bg-white font-mono font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">Nama Item Bonus Gratis:</label>
                      <input
                        type="text"
                        value={promoFreeItemName}
                        onChange={(e) => setPromoFreeItemName(e.target.value)}
                        placeholder={`Contoh: 1 pcs ${selectedPromoProduct?.name || 'Item'}`}
                        className="w-full p-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Harga Promo ({promoCurrency}):
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={promoPrice}
                      onChange={(e) => setPromoPrice(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-mono font-bold"
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Setara:{' '}
                      {promoCurrency === 'JPY'
                        ? formatIdr(convertJpyToIdr(promoPrice, activeRate))
                        : formatJpy(Math.round(promoPrice / activeRate))}
                    </span>
                  </div>
                )}

                {/* Tanggal & Keterangan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tanggal Mulai:</label>
                    <input
                      type="date"
                      value={promoStartDate}
                      onChange={(e) => setPromoStartDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tanggal Berakhir:</label>
                    <input
                      type="date"
                      value={promoEndDate}
                      onChange={(e) => setPromoEndDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Catatan Tambahan:</label>
                  <input
                    type="text"
                    value={promoNotes}
                    onChange={(e) => setPromoNotes(e.target.value)}
                    placeholder="Contoh: Khusus pembelian online web & POS kasir"
                    className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsNewPromoOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    Simpan Promo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: TAMBAH VOUCHER (NO ITEM DROPDOWN REQ)             */}
        {/* ========================================================= */}
        {isNewVoucherOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c41230]">confirmation_number</span>
                  <h3 className="font-heading font-bold text-base text-stone-900">Buat Kupon Voucher Baru</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewVoucherOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveVoucher} className="space-y-4 text-xs">
                {/* Kode Voucher */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">Kode Kupon Voucher (Unik):</label>
                    <button
                      type="button"
                      onClick={generateRandomVoucherCode}
                      className="text-[#c41230] hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">shuffle</span>
                      <span>Acak Kode</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={vCode}
                    onChange={(e) => setVCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: SEMBAKO500 / DISKONIDR50K"
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-[#c41230] font-mono font-bold text-sm tracking-wider uppercase"
                  />
                </div>

                {/* Judul & Deskripsi */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Judul Kupon Voucher:</label>
                  <input
                    type="text"
                    required
                    value={vTitle}
                    onChange={(e) => setVTitle(e.target.value)}
                    placeholder="Contoh: Diskon Gajian Diaspora 10%"
                    className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                {/* Jenis Voucher & Mata Uang */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">Jenis Potongan Voucher:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setVType('PERCENTAGE'); setVCurrency('JPY'); setVValue(10); }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                        vType === 'PERCENTAGE' ? 'bg-[#c41230] text-white border-[#c41230]' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      Persentase (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVType('NOMINAL_JPY'); setVCurrency('JPY'); setVValue(500); setVMinSpend(5000); }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                        vType === 'NOMINAL_JPY' || (vType === 'FIXED' && vCurrency === 'JPY')
                          ? 'bg-[#c41230] text-white border-[#c41230]'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      Nominal Yen (¥)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVType('NOMINAL_IDR'); setVCurrency('IDR'); setVValue(50000); setVMinSpend(300000); }}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                        vType === 'NOMINAL_IDR' || (vType === 'FIXED' && vCurrency === 'IDR')
                          ? 'bg-[#c41230] text-white border-[#c41230]'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      Nominal Rupiah (Rp)
                    </button>
                  </div>
                </div>

                {/* Nilai Diskon Input */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {vType === 'PERCENTAGE' ? 'Besar Persen (%):' : `Nilai Potongan (${vCurrency}):`}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={vValue}
                      onChange={(e) => setVValue(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Min. Belanja ({vCurrency}):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={vMinSpend}
                      onChange={(e) => setVMinSpend(Number(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm"
                    />
                  </div>
                </div>

                {vType === 'PERCENTAGE' && (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Maksimal Potongan (Yen ¥ opsional):</label>
                    <input
                      type="number"
                      value={vMaxDiscount}
                      onChange={(e) => setVMaxDiscount(Number(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl border border-stone-300 font-mono text-xs"
                      placeholder="Contoh: 1500"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Masa Berlaku Kupon:</label>
                  <input
                    type="date"
                    value={vValidUntil}
                    onChange={(e) => setVValidUntil(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsNewVoucherOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#c41230] hover:bg-[#a80f28] text-white font-bold shadow-md cursor-pointer"
                  >
                    Terbitkan Kupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 4: TAMBAH HARGA GROSIR (DROPDOWN ITEM SELECTION)    */}
        {/* ========================================================= */}
        {isNewGrosirOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3 border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-700">inventory</span>
                  <h3 className="font-heading font-bold text-base text-stone-900">Atur Tingkat Harga Grosir (Wholesale)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewGrosirOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveGrosir} className="space-y-4 text-xs">
                {/* 1. Item Selection Dropdown */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">
                    1. Pilih Produk Item untuk Harga Grosir:
                  </label>
                  <select
                    value={grosirProductId}
                    onChange={(e) => setGrosirProductId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:border-teal-700 font-medium text-xs bg-stone-50"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Normal: {formatJpy(p.price)} / {formatIdr(convertJpyToIdr(p.price, activeRate))}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Tier Kuantitas & Satuan */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Minimal Kuantitas (Qty):</label>
                    <input
                      type="number"
                      min={2}
                      value={grosirMinQty}
                      onChange={(e) => setGrosirMinQty(Number(e.target.value) || 2)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Satuan Produk:</label>
                    <select
                      value={grosirUnit}
                      onChange={(e) => setGrosirUnit(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium"
                    >
                      <option value="Dus (Karton)">Dus (Karton)</option>
                      <option value="Bal / Renteng">Bal / Renteng</option>
                      <option value="Pack">Pack</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Lusin (12 pcs)">Lusin (12 pcs)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Mata Uang & Harga Grosir */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mata Uang Harga Grosir:</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setGrosirCurrency('JPY')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                        grosirCurrency === 'JPY' ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      ¥ Yen (JPY)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrosirCurrency('IDR')}
                      className={`py-2 px-3 rounded-xl font-bold text-xs border ${
                        grosirCurrency === 'IDR' ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      Rp Rupiah (IDR)
                    </button>
                  </div>

                  <label className="block font-bold text-stone-700 mb-1">
                    Harga Grosir per Satuan ({grosirCurrency}):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={grosirPriceInput}
                    onChange={(e) => setGrosirPriceInput(Number(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm"
                  />
                </div>

                {/* Savings Calculation Box */}
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-1">
                  <span className="text-[11px] font-bold text-teal-900 block mb-1">📊 Analisis Penghematan Grosir:</span>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>Harga Eceran Normal:</span>
                    <strong className="text-stone-800">{formatJpy(selectedGrosirProduct?.price || 0)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span>Harga Grosir Khusus:</span>
                    <strong className="text-teal-800 text-sm font-mono font-bold">
                      {formatJpy(grosirSavingsCalc.wholesaleJPY)} ({formatIdr(grosirSavingsCalc.wholesaleIDR)})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-700 pt-1 border-t border-teal-200">
                    <span>Margin Hemat Reseller:</span>
                    <span className="font-extrabold text-emerald-700">
                      Hemat {grosirSavingsCalc.savingsPct}% ({formatJpy(grosirSavingsCalc.savingsJPY)} / pcs)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Catatan Keterangan:</label>
                  <input
                    type="text"
                    value={grosirNotes}
                    onChange={(e) => setGrosirNotes(e.target.value)}
                    placeholder="Contoh: Khusus pembelian dus untuk toko/warung diaspora"
                    className="w-full p-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsNewGrosirOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-md cursor-pointer"
                  >
                    Simpan Harga Grosir
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
