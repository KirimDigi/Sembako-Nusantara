import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Voucher, LoyaltyTier, Language } from '../../types';
import { PromoBanner, getStoredPromoBanners, savePromoBanners, resetPromoBanners, fetchRemotePromoBanners } from '../../utils/banners';

export const CRMPage: React.FC = () => {
  const { customers, vouchers, addVoucher, toggleVoucher, deleteVoucher, addCustomer } = useAdmin();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'members' | 'vouchers' | 'banners'>('members');

  // Promo Banners State (3 Slides)
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>(() => getStoredPromoBanners());
  const [bannerSaveMsg, setBannerSaveMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSavingBanners, setIsSavingBanners] = useState<boolean>(false);

  // Sync latest promo banners from Supabase cloud on load
  useEffect(() => {
    fetchRemotePromoBanners().then((remote) => {
      if (remote && remote.length >= 3) {
        setPromoBanners(remote);
      }
    });
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'vouchers') {
      setActiveTab('vouchers');
    } else if (tab === 'banners') {
      setActiveTab('banners');
    } else if (tab === 'members' || tab === 'customers') {
      setActiveTab('members');
    }
  }, [searchParams]);

  // Search filter for Member CRM
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');

  // Modal State for New Customer
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState<boolean>(false);
  const [cName, setCName] = useState<string>('');
  const [cPhone, setCPhone] = useState<string>('');
  const [cPassword, setCPassword] = useState<string>('');
  const [cPostalCode, setCPostalCode] = useState<string>('');
  const [cAddress, setCAddress] = useState<string>('');
  const [cCity, setCCity] = useState<string>('Tokyo (Edogawa)');
  const [cTier, setCTier] = useState<LoyaltyTier>('Bronze');
  const [cPoints, setCPoints] = useState<number>(0);
  const [cLang, setCLang] = useState<Language>('ID');

  // Modal State for New Voucher
  const [isNewVoucherOpen, setIsNewVoucherOpen] = useState<boolean>(false);
  const [vCode, setVCode] = useState<string>('');
  const [vTitle, setVTitle] = useState<string>('');
  const [vDesc, setVDesc] = useState<string>('');
  const [vType, setVType] = useState<Voucher['discountType']>('FIXED');
  const [vValue, setVValue] = useState<number>(500);
  const [vMinSpend, setVMinSpend] = useState<number>(5000);
  const [vMaxDiscount, setVMaxDiscount] = useState<number>(1000);

  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: '顧客CRM・会員ロイヤルティ＆販促クーポン',
        subtitle: '在日インドネシア人・ディアスポラ顧客データベース管理、会員ランク・ポイント、販促割引クーポン発行。',
        tabMembers: (cnt: number) => `👥 会員データベース＆ポイント (${cnt})`,
        tabVouchers: (cnt: number) => `🎟️ 割引クーポン＆プロモ (${cnt})`,
        btnCreateCustomer: '新規会員登録 (+)',
        btnCreateVoucher: '新規クーポン作成',
        searchCustomerPlaceholder: '顧客名、電話番号、メール、市区町村を検索...',
        thCustomer: '顧客情報',
        thContactArea: '連絡先 & エリア',
        thTier: '会員ランク',
        thPoints: 'ロイヤルティポイント',
        thTotalTx: '累計購入額',
        thLastOrder: '最終注文日',
        thLang: '使用言語',
        sinceLabel: (dt: string) => `登録: ${dt}`,
        ordersCount: (cnt: number) => `${cnt}回 購入`,
        badgeActive: '有効',
        badgeInactive: '無効',
        discountValLabel: '割引内容:',
        minSpendLabel: '最低購入金額:',
        usageCountLabel: (cnt: number) => `使用回数: ${cnt}回`,
        validUntilLabel: (dt: string) => `有効期限: ${dt}`,
        // Modal Customer
        custModalTitle: '新規顧客・会員登録',
        custNameLabel: '氏名・お名前 (必須):',
        custNamePlaceholder: '例: Willy Pratama / 田中 太郎',
        custPhoneLabel: '電話番号 / WhatsApp:',
        custPhonePlaceholder: '例: +81 80-1234-5678',
        custEmailLabel: 'メールアドレス:',
        custEmailPlaceholder: '例: customer@gmail.com',
        custCityLabel: '居住地・都道府県:',
        custCityPlaceholder: '例: Tokyo (Edogawa) / 大阪市',
        custTierLabel: '初期会員ランク:',
        custPointsLabel: '初期ポイント:',
        custLangLabel: '使用言語:',
        // Modal Voucher
        modalTitle: '新規プロモーションクーポン作成',
        codeLabel: 'クーポンコード (大文字英数):',
        codePlaceholder: '例: MERDEKA500',
        titleLabel: 'プロモーション名:',
        titlePlaceholder: '例: 独立記念日スペシャル割引',
        descLabel: '概要説明:',
        descPlaceholder: '¥5,000以上のご注文で¥500割引',
        typeLabel: '割引タイプ:',
        typeFixed: '定額値引き (¥)',
        typePercent: '定率割引 (%)',
        valLabel: '割引額 / 率:',
        maxDiscLabel: '最大割引上限 (¥):',
        btnCancel: 'キャンセル',
        btnSave: '保存して登録',
        emptyCustomer: '該当する顧客が見つかりません。'
      };
    } else if (language === 'EN') {
      return {
        title: 'CRM, Member Loyalty & Promotional Vouchers',
        subtitle: 'Indonesian diaspora customer database management in Japan, loyalty tiers, shopping points, and promo coupons.',
        tabMembers: (cnt: number) => `👥 Member Database & Points (${cnt})`,
        tabVouchers: (cnt: number) => `🎟️ Coupons & Promo Vouchers (${cnt})`,
        btnCreateCustomer: 'Add New Customer (+)',
        btnCreateVoucher: 'Create New Voucher',
        searchCustomerPlaceholder: 'Search customer name, phone, email, or city...',
        thCustomer: 'Customer',
        thContactArea: 'Contact & Prefecture',
        thTier: 'Member Tier',
        thPoints: 'Loyalty Points',
        thTotalTx: 'Total Spent',
        thLastOrder: 'Last Order Date',
        thLang: 'Language',
        sinceLabel: (dt: string) => `Since ${dt}`,
        ordersCount: (cnt: number) => `${cnt} Orders`,
        badgeActive: 'Active',
        badgeInactive: 'Inactive',
        discountValLabel: 'Discount Value:',
        minSpendLabel: 'Min. Spend:',
        usageCountLabel: (cnt: number) => `Used: ${cnt} times`,
        validUntilLabel: (dt: string) => `Valid until: ${dt}`,
        // Modal Customer
        custModalTitle: 'Register New Customer / Member',
        custNameLabel: 'Full Name (Required):',
        custNamePlaceholder: 'e.g. Willy Pratama',
        custPhoneLabel: 'Phone / WhatsApp:',
        custPhonePlaceholder: 'e.g. +81 80-1234-5678',
        custEmailLabel: 'Email Address:',
        custEmailPlaceholder: 'e.g. customer@gmail.com',
        custCityLabel: 'City / Prefecture:',
        custCityPlaceholder: 'e.g. Tokyo (Edogawa), Osaka, etc.',
        custTierLabel: 'Initial Tier:',
        custPointsLabel: 'Initial Points:',
        custLangLabel: 'Preferred Language:',
        // Modal Voucher
        modalTitle: 'Create New Promo Voucher',
        codeLabel: 'Voucher Code (Uppercase):',
        codePlaceholder: 'e.g. MERDEKA500',
        titleLabel: 'Promotion Title:',
        titlePlaceholder: 'e.g. Indonesian Independence Special Discount',
        descLabel: 'Short Description:',
        descPlaceholder: '¥500 OFF for orders over ¥5,000',
        typeLabel: 'Discount Type:',
        typeFixed: 'Fixed Amount (¥)',
        typePercent: 'Percentage (%)',
        valLabel: 'Discount Value:',
        maxDiscLabel: 'Max Discount Cap (¥):',
        btnCancel: 'Cancel',
        btnSave: 'Save Customer',
        emptyCustomer: 'No matching customers found.'
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'CRM, Member Loyalty & Voucher Promosi',
        subtitle: 'Pengelolaan basis data pelanggan diaspora Indonesia di Jepang, tier loyalitas, poin belanja, dan kode kupon promo.',
        tabMembers: (cnt: number) => `👥 Database Member & Poin (${cnt})`,
        tabVouchers: (cnt: number) => `🎟️ Kupon & Voucher Promo (${cnt})`,
        btnCreateCustomer: 'Tambah Pelanggan Baru (+)',
        btnCreateVoucher: 'Buat Voucher Baru',
        searchCustomerPlaceholder: 'Cari nama pelanggan, nomor HP, email, atau kota...',
        thCustomer: 'Pelanggan',
        thContactArea: 'Kontak & Wilayah',
        thTier: 'Tier Member',
        thPoints: 'Poin Loyalitas',
        thTotalTx: 'Total Transaksi',
        thLastOrder: 'Order Terakhir',
        thLang: 'Bahasa',
        sinceLabel: (dt: string) => `Sejak ${dt}`,
        ordersCount: (cnt: number) => `${cnt}x Belanja`,
        badgeActive: 'Aktif',
        badgeInactive: 'Non-Aktif',
        discountValLabel: 'Nilai Potongan:',
        minSpendLabel: 'Min. Belanja:',
        usageCountLabel: (cnt: number) => `Sudah Digunakan: ${cnt}x`,
        validUntilLabel: (dt: string) => `Hingga: ${dt}`,
        // Modal Customer
        custModalTitle: 'Tambah Pelanggan / Member Baru',
        custNameLabel: 'Nama Lengkap Pelanggan (Wajib):',
        custNamePlaceholder: 'Contoh: Willy Pratama / Budi Santoso',
        custPhoneLabel: 'Nomor HP / WhatsApp (Jepang/Indo):',
        custPhonePlaceholder: 'Contoh: +81 80-1234-5678',
        custEmailLabel: 'Alamat Email:',
        custEmailPlaceholder: 'Contoh: pelanggan@gmail.com',
        custCityLabel: 'Wilayah / Prefektur / Kota di Jepang:',
        custCityPlaceholder: 'Contoh: Tokyo (Edogawa), Osaka, Saitama, dll.',
        custTierLabel: 'Tier Loyalitas:',
        custPointsLabel: 'Poin Loyalitas Awal:',
        custLangLabel: 'Bahasa Pilihan Komunikasi:',
        // Modal Voucher
        modalTitle: 'Buat Voucher Promosi Baru',
        codeLabel: 'Kode Voucher (Kapital):',
        codePlaceholder: 'Contoh: MERDEKA500',
        titleLabel: 'Judul Promosi:',
        titlePlaceholder: 'Contoh: Diskon Kemerdekaan Indonesia',
        descLabel: 'Deskripsi Singkat:',
        descPlaceholder: 'Potongan ¥500 untuk belanja min. ¥5.000',
        typeLabel: 'Tipe Diskon:',
        typeFixed: 'Nominal Tetap (¥)',
        typePercent: 'Persentase (%)',
        valLabel: 'Nilai Diskon:',
        maxDiscLabel: 'Maksimal Diskon (¥):',
        btnCancel: 'Batal',
        btnSave: 'Simpan Pelanggan',
        emptyCustomer: 'Tidak ada data pelanggan yang sesuai.'
      };
    }
  }, [language]);

  const handleSaveCustomer = () => {
    if (!cName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }

    addCustomer({
      name: cName.trim(),
      phone: cPhone.trim() || '-',
      city: cCity.trim() || 'Tokyo (Edogawa)',
      postalCode: cPostalCode.trim(),
      address: cAddress.trim(),
      password: cPassword.trim() || '123456',
      tier: cTier,
      loyaltyPoints: 0,
      preferredLanguage: cLang,
      totalOrders: 0,
      totalSpent: 0
    });

    setIsNewCustomerOpen(false);
    setCName('');
    setCPhone('');
    setCPassword('');
    setCPostalCode('');
    setCAddress('');
    setCCity('Tokyo (Edogawa)');
    setCTier('Bronze');
    setCPoints(0);
    setCLang('ID');
  };

  const handleSaveVoucher = () => {
    if (!vCode || !vTitle) return;
    addVoucher({
      code: vCode.toUpperCase().trim(),
      title: vTitle,
      description: vDesc,
      discountType: vType,
      discountValue: vValue,
      minSpend: vMinSpend,
      maxDiscount: vType === 'PERCENTAGE' ? vMaxDiscount : undefined,
      validUntil: '2026-12-31',
      usageCount: 0,
      isActive: true
    });

    setIsNewVoucherOpen(false);
    setVCode('');
    setVTitle('');
    setVDesc('');
  };

  // Promo Banner Handlers
  const handleBannerImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar terlalu besar! Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPromoBanners((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], imageUrl: dataUrl };
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBannerTextChange = (index: number, field: keyof PromoBanner, val: string) => {
    setPromoBanners((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSaveBanners = async () => {
    setIsSavingBanners(true);
    setBannerSaveMsg(null);
    const res = await savePromoBanners(promoBanners);
    setIsSavingBanners(false);
    setBannerSaveMsg({ text: res.message, isError: !res.success });
    setTimeout(() => {
      setBannerSaveMsg(null);
    }, 4500);
  };

  const handleResetBanners = () => {
    if (window.confirm('Kembalikan semua 3 banner promo ke gambar default?')) {
      const def = resetPromoBanners();
      setPromoBanners(def);
      setBannerSaveMsg({ text: 'Banner berhasil dikembalikan ke default!', isError: false });
      setTimeout(() => setBannerSaveMsg(null), 3000);
    }
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, customerSearchQuery]);

  return (
    <AdminLayout title={txt.title} subtitle={txt.subtitle}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Tab Selector & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 bg-stone-200/70 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {txt.tabMembers(customers.length)}
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vouchers'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {txt.tabVouchers(vouchers.length)}
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'banners'
                  ? 'bg-[#c41230] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">view_carousel</span>
              <span>Banner Promo Beranda (3 Slide)</span>
            </button>
          </div>

          {/* Action button based on active tab */}
          {activeTab === 'members' && (
            <button
              onClick={() => setIsNewCustomerOpen(true)}
              className="px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>{txt.btnCreateCustomer}</span>
            </button>
          )}

          {activeTab === 'vouchers' && (
            <button
              onClick={() => setIsNewVoucherOpen(true)}
              className="px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>{txt.btnCreateVoucher}</span>
            </button>
          )}

          {activeTab === 'banners' && (
            <button
              onClick={handleSaveBanners}
              disabled={isSavingBanners}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>{isSavingBanners ? 'Menyimpan...' : 'Simpan Banner Promo (Save)'}</span>
            </button>
          )}
        </div>

        {/* Tab 1: Member CRM List */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {/* Search Toolbar */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder={txt.searchCustomerPlaceholder}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230] focus:bg-white transition-all"
                />
                {customerSearchQuery && (
                  <button
                    onClick={() => setCustomerSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">{txt.thCustomer}</th>
                      <th className="px-4 py-3.5">{txt.thContactArea}</th>
                      <th className="px-4 py-3.5 text-center">{txt.thTier}</th>
                      <th className="px-4 py-3.5 text-center">{txt.thPoints}</th>
                      <th className="px-4 py-3.5">{txt.thTotalTx}</th>
                      <th className="px-4 py-3.5">{txt.thLastOrder}</th>
                      <th className="px-5 py-3.5 text-right">{txt.thLang}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-stone-400">
                          {txt.emptyCustomer}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c) => (
                        <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-stone-900 text-sm">{c.name}</div>
                            <div className="text-[10px] text-stone-400">
                              ID: {c.id} • {txt.sinceLabel(c.registeredDate)}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-stone-800 font-medium">
                              {c.prefecture ? `${c.prefecture}, ` : ''}{c.city}
                            </div>
                            {c.address && (
                              <div className="text-[10px] text-stone-500 font-mono line-clamp-1">
                                {c.postalCode ? `〒${c.postalCode} ` : ''}{c.address}
                              </div>
                            )}
                            <div className="text-[10px] text-stone-600 font-bold flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[12px] text-emerald-600">call</span>
                              <span>{c.phone}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                c.tier === 'VIP'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : c.tier === 'Gold'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : c.tier === 'Silver'
                                  ? 'bg-stone-200 text-stone-800 border border-stone-300'
                                  : 'bg-orange-100 text-orange-800 border border-orange-200'
                              }`}
                            >
                              {c.tier} Tier
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-center text-stone-400 font-mono text-sm">
                            -
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-stone-900">
                              ¥{c.totalSpent.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {txt.ordersCount(c.totalOrders)}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-stone-600 text-[11px]">
                            {c.lastOrderDate || '-'}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-700 font-bold rounded-md text-[10px]">
                              {c.preferredLanguage}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vouchers List */}
        {activeTab === 'vouchers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vouchers.map((v) => (
              <div
                key={v.code}
                className={`bg-white p-4.5 rounded-2xl border transition-all ${
                  v.isActive ? 'border-stone-200 shadow-xs' : 'border-stone-200 opacity-60 bg-stone-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">confirmation_number</span>
                    <span className="font-mono font-bold text-sm bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md">
                      {v.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleVoucher(v.code)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        v.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {v.isActive ? txt.badgeActive : txt.badgeInactive}
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

                <div className="mt-3">
                  <h4 className="font-bold text-stone-900 text-sm">{v.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{v.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                      {txt.discountValLabel}
                    </span>
                    <span className="font-black text-rose-600 text-sm">
                      {v.discountType === 'FIXED' ? `¥${v.discountValue.toLocaleString()}` : `${v.discountValue}%`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                      {txt.minSpendLabel}
                    </span>
                    <span className="font-semibold text-stone-700">
                      ¥{v.minSpend.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-dashed border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                  <span>{txt.usageCountLabel(v.usageCount)}</span>
                  <span>{txt.validUntilLabel(v.validUntil)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BANNER PROMO BERANDA (3 SLIDE) */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Header Info & Action Controls */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-[#c41230]">view_carousel</span>
                  <h3 className="text-base font-bold text-stone-900">
                    Pengaturan Foto Sampul & Banner Promo Beranda (3 Slide)
                  </h3>
                </div>
                <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
                  Ganti 3 foto sampul promosi di bagian atas halaman Beranda. Tampilan beranda kini berupa <strong>foto murni secara penuh</strong> (tanpa teks overlay bawaan) agar gambar promo buatan Anda tampil bersih dan maksimal. Unggah foto langsung dari HP/Laptop atau masukkan URL gambar, lalu klik <strong>"Simpan Banner Promo"</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetBanners}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                  <span>Reset Default</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveBanners}
                  disabled={isSavingBanners}
                  className="px-5 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{isSavingBanners ? 'Menyimpan...' : 'Simpan Banner Promo (Save)'}</span>
                </button>
              </div>
            </div>

            {/* Notification message if saved */}
            {bannerSaveMsg && (
              <div
                className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  bannerSaveMsg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {bannerSaveMsg.isError ? 'error' : 'check_circle'}
                </span>
                <span>{bannerSaveMsg.text}</span>
              </div>
            )}

            {/* Grid of 3 Slide Editors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {promoBanners.map((banner, index) => (
                <div
                  key={banner.id || index}
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#c41230] text-white text-[11px] font-black flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>Slide {index + 1}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                      Rasio 16:9 / 21:9
                    </span>
                  </div>

                  {/* Image Preview Box */}
                  <div className="p-4 space-y-4">
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-200 group">
                      <img
                        src={banner.imageUrl}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white text-xs font-semibold">
                        Preview Slide {index + 1}
                      </div>
                    </div>

                    {/* Change Photo Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          Unggah Foto dari HP / Komputer:
                        </label>
                        <label className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 border border-dashed border-stone-300 hover:border-[#c41230] rounded-xl text-xs font-medium text-stone-700 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                          <span className="material-symbols-outlined text-base text-[#c41230]">add_photo_alternate</span>
                          <span>Pilih File Foto Baru...</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBannerImageUpload(index, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          Atau Tautan URL Gambar:
                        </label>
                        <input
                          type="text"
                          value={banner.imageUrl}
                          onChange={(e) => handleBannerTextChange(index, 'imageUrl', e.target.value)}
                          placeholder="https://example.com/promo-banner.jpg"
                          className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#c41230]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                          <span>Judul Slide / Catatan Admin:</span>
                          <span className="text-[10px] text-stone-400 font-normal">Opsional</span>
                        </label>
                        <input
                          type="text"
                          value={banner.title}
                          onChange={(e) => handleBannerTextChange(index, 'title', e.target.value)}
                          placeholder="Contoh: Promo Spesial Sembako"
                          className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#c41230]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                          <span>Link Tujuan Saat Foto Diklik:</span>
                          <span className="text-[10px] text-emerald-600 font-bold">Aktif</span>
                        </label>
                        <input
                          type="text"
                          value={banner.linkUrl}
                          onChange={(e) => handleBannerTextChange(index, 'linkUrl', e.target.value)}
                          placeholder="/catalog"
                          className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#c41230]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Status: <strong>Aktif di Beranda</strong></span>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#c41230] font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Lihat Live</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Save Action Bar */}
            <div className="bg-stone-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold">Simpan & Publikasikan Perubahan Banner Promo</h4>
                <p className="text-xs text-stone-400">
                  Perubahan akan langsung terlihat oleh pengunjung website di halaman Beranda.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveBanners}
                disabled={isSavingBanners}
                className="w-full sm:w-auto px-6 py-3 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>{isSavingBanners ? 'Menyimpan...' : 'Simpan Banner Promo (Save)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: TAMBAH PELANGGAN / MEMBER BARU */}
      {isNewCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">person_add</span>
                <span>{txt.custModalTitle}</span>
              </h3>
              <button
                onClick={() => setIsNewCustomerOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.custNameLabel}</label>
                <input
                  type="text"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder={txt.custNamePlaceholder}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.custPhoneLabel}</label>
                  <input
                    type="text"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    placeholder={txt.custPhonePlaceholder}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Password Akun (Login):</label>
                  <input
                    type="password"
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    placeholder="Min 4 karakter (default: 123456)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Kode Pos (〒):</label>
                  <input
                    type="text"
                    value={cPostalCode}
                    onChange={(e) => setCPostalCode(e.target.value)}
                    placeholder="134-0088"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">{txt.custCityLabel}</label>
                  <input
                    type="text"
                    value={cCity}
                    onChange={(e) => setCCity(e.target.value)}
                    placeholder={txt.custCityPlaceholder}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Alamat Lengkap (Chome/Banchi/Apartemen):</label>
                <input
                  type="text"
                  value={cAddress}
                  onChange={(e) => setCAddress(e.target.value)}
                  placeholder="Contoh: Nishikasai 3-1-2, Mansion Sakura 201"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.custTierLabel}</label>
                  <select
                    value={cTier}
                    onChange={(e) => setCTier(e.target.value as LoyaltyTier)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.custLangLabel}</label>
                  <select
                    value={cLang}
                    onChange={(e) => setCLang(e.target.value as Language)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  >
                    <option value="ID">🇮🇩 ID</option>
                    <option value="JP">🇯🇵 JP</option>
                    <option value="EN">🇬🇧 EN</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsNewCustomerOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                {txt.btnCancel}
              </button>
              <button
                onClick={handleSaveCustomer}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-colors"
              >
                {txt.btnSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BUAT VOUCHER BARU */}
      {isNewVoucherOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">confirmation_number</span>
                <span>{txt.modalTitle}</span>
              </h3>
              <button
                onClick={() => setIsNewVoucherOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.codeLabel}</label>
                <input
                  type="text"
                  value={vCode}
                  onChange={(e) => setVCode(e.target.value.toUpperCase())}
                  placeholder={txt.codePlaceholder}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.titleLabel}</label>
                <input
                  type="text"
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  placeholder={txt.titlePlaceholder}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.descLabel}</label>
                <input
                  type="text"
                  value={vDesc}
                  onChange={(e) => setVDesc(e.target.value)}
                  placeholder={txt.descPlaceholder}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.typeLabel}</label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value as Voucher['discountType'])}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    <option value="FIXED">{txt.typeFixed}</option>
                    <option value="PERCENTAGE">{txt.typePercent}</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.valLabel}</label>
                  <input
                    type="number"
                    value={vValue}
                    onChange={(e) => setVValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.minSpendLabel}</label>
                  <input
                    type="number"
                    value={vMinSpend}
                    onChange={(e) => setVMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
                {vType === 'PERCENTAGE' && (
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">{txt.maxDiscLabel}</label>
                    <input
                      type="number"
                      value={vMaxDiscount}
                      onChange={(e) => setVMaxDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsNewVoucherOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                {txt.btnCancel}
              </button>
              <button
                onClick={handleSaveVoucher}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                {txt.btnSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
