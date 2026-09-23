import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Voucher, LoyaltyTier, Language } from '../../types';

export const CRMPage: React.FC = () => {
  const { customers, vouchers, addVoucher, toggleVoucher, addCustomer } = useAdmin();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'members' | 'vouchers'>('members');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'vouchers') {
      setActiveTab('vouchers');
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
  const [cEmail, setCEmail] = useState<string>('');
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
      email: cEmail.trim() || '-',
      city: cCity.trim() || 'Tokyo (Edogawa)',
      tier: cTier,
      loyaltyPoints: Number(cPoints) || 0,
      preferredLanguage: cLang,
      totalOrders: 0,
      totalSpent: 0
    });

    setIsNewCustomerOpen(false);
    setCName('');
    setCPhone('');
    setCEmail('');
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
          <div className="flex gap-2 bg-stone-200/70 p-1 rounded-2xl w-fit">
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
                            <div className="text-stone-800 font-medium">{c.city}</div>
                            <div className="text-[10px] text-stone-400 flex items-center gap-1">
                              <span>{c.phone}</span>
                              {c.email && c.email !== '-' && (
                                <>
                                  <span>•</span>
                                  <span>{c.email}</span>
                                </>
                              )}
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

                          <td className="px-4 py-3.5 text-center font-bold text-emerald-600 font-mono">
                            {c.loyaltyPoints} Pts
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
                  <button
                    onClick={() => toggleVoucher(v.code)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                      v.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {v.isActive ? txt.badgeActive : txt.badgeInactive}
                  </button>
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
                  <label className="font-bold text-stone-700 block mb-1">{txt.custEmailLabel}</label>
                  <input
                    type="email"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    placeholder={txt.custEmailPlaceholder}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.custCityLabel}</label>
                <input
                  type="text"
                  value={cCity}
                  onChange={(e) => setCCity(e.target.value)}
                  placeholder={txt.custCityPlaceholder}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
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
                  <label className="font-bold text-stone-700 block mb-1">{txt.custPointsLabel}</label>
                  <input
                    type="number"
                    value={cPoints}
                    onChange={(e) => setCPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
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
