import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Voucher } from '../../types';

export const CRMPage: React.FC = () => {
  const { customers, vouchers, addVoucher, toggleVoucher } = useAdmin();
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
        btnCreateVoucher: '新規クーポン作成',
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
        // Modal
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
        btnSave: 'クーポンを発行する'
      };
    } else if (language === 'EN') {
      return {
        title: 'CRM, Member Loyalty & Promotional Vouchers',
        subtitle: 'Indonesian diaspora customer database management in Japan, loyalty tiers, shopping points, and promo coupons.',
        tabMembers: (cnt: number) => `👥 Member Database & Points (${cnt})`,
        tabVouchers: (cnt: number) => `🎟️ Coupons & Promo Vouchers (${cnt})`,
        btnCreateVoucher: 'Create New Voucher',
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
        // Modal
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
        btnSave: 'Issue Voucher'
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'CRM, Member Loyalty & Voucher Promosi',
        subtitle: 'Pengelolaan basis data pelanggan diaspora Indonesia di Jepang, tier loyalitas, poin belanja, dan kode kupon promo.',
        tabMembers: (cnt: number) => `👥 Database Member & Poin (${cnt})`,
        tabVouchers: (cnt: number) => `🎟️ Kupon & Voucher Promo (${cnt})`,
        btnCreateVoucher: 'Buat Voucher Baru',
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
        // Modal
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
        btnSave: 'Simpan Voucher'
      };
    }
  }, [language]);

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

  return (
    <AdminLayout
      title={txt.title}
      subtitle={txt.subtitle}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Tab Selector & Action */}
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
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-stone-900">{c.name}</div>
                        <div className="text-[10px] text-stone-400">ID: {c.id} • {txt.sinceLabel(c.registeredDate)}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-stone-800">{c.city}</div>
                        <div className="text-[10px] text-stone-400">{c.email}</div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.tier === 'VIP'
                              ? 'bg-purple-100 text-purple-800'
                              : c.tier === 'Gold'
                              ? 'bg-amber-100 text-amber-800'
                              : c.tier === 'Silver'
                              ? 'bg-stone-200 text-stone-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {c.tier} Tier
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600 font-mono">
                        {c.loyaltyPoints} Pts
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-stone-900">¥{c.totalSpent.toLocaleString()}</div>
                        <div className="text-[10px] text-stone-400">{txt.ordersCount(c.totalOrders)}</div>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Vouchers List */}
        {activeTab === 'vouchers' && (
          <div>
            {vouchers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                </div>
                <h4 className="font-bold text-stone-800 text-sm">
                  {language === 'JP' ? '登録済みクーポン・プロモはまだありません' : language === 'EN' ? 'No Promo Vouchers Registered Yet' : 'Belum Ada Kupon & Voucher Promo'}
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {language === 'JP'
                    ? '初期状態（0件）です。新規プロモーション割引クーポンを作成すると、ここに一覧が表示されます。'
                    : language === 'EN'
                    ? 'Clean 0 state. Create a new promo discount code to view active promotions here.'
                    : 'Kondisi 0 bersih. Buat kode kupon diskon promosi baru untuk melihat daftar voucher aktif di sini.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewVoucherOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>{txt.btnCreateVoucher}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vouchers.map((v) => (
                  <div
                    key={v.code}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-sm px-2.5 py-1 bg-red-50 text-[#c41230] rounded-lg border border-red-100">
                          {v.code}
                        </span>
                        <button
                          onClick={() => toggleVoucher(v.code)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                            v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          {v.isActive ? txt.badgeActive : txt.badgeInactive}
                        </button>
                      </div>

                      <h4 className="font-bold text-stone-900 text-xs mt-2">{v.title}</h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{v.description}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 text-xs space-y-1 text-stone-600">
                      <div className="flex justify-between">
                        <span>{txt.discountValLabel}</span>
                        <span className="font-bold text-stone-900">
                          {v.discountType === 'FIXED' ? `¥${v.discountValue.toLocaleString()}` : `${v.discountValue}%`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.minSpendLabel}</span>
                        <span className="font-bold text-stone-900">¥{v.minSpend.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-400 pt-1">
                        <span>{txt.usageCountLabel(v.usageCount)}</span>
                        <span>{txt.validUntilLabel(v.validUntil)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal New Voucher */}
      {isNewVoucherOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">{txt.modalTitle}</h3>
              <button onClick={() => setIsNewVoucherOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
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
