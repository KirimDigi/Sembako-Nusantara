import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Voucher } from '../../types';

export const CRMPage: React.FC = () => {
  const { customers, vouchers, addVoucher, toggleVoucher } = useAdmin();
  const [activeTab, setActiveTab] = useState<'members' | 'vouchers'>('members');

  // Modal State for New Voucher
  const [isNewVoucherOpen, setIsNewVoucherOpen] = useState<boolean>(false);
  const [vCode, setVCode] = useState<string>('');
  const [vTitle, setVTitle] = useState<string>('');
  const [vDesc, setVDesc] = useState<string>('');
  const [vType, setVType] = useState<Voucher['discountType']>('FIXED');
  const [vValue, setVValue] = useState<number>(500);
  const [vMinSpend, setVMinSpend] = useState<number>(5000);
  const [vMaxDiscount, setVMaxDiscount] = useState<number>(1000);

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
      title="CRM, Member Loyalty & Voucher Promosi"
      subtitle="Pengelolaan basis data pelanggan diaspora Indonesia di Jepang, tier loyalitas, poin belanja, dan kode kupon promo."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Tab Selector & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 bg-stone-200/70 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'members'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              👥 Database Member & Poin ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'vouchers'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🎟️ Kupon & Voucher Promo ({vouchers.length})
            </button>
          </div>

          {activeTab === 'vouchers' && (
            <button
              onClick={() => setIsNewVoucherOpen(true)}
              className="px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Buat Voucher Baru</span>
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
                    <th className="px-5 py-3.5">Pelanggan</th>
                    <th className="px-4 py-3.5">Kontak & Wilayah</th>
                    <th className="px-4 py-3.5 text-center">Tier Member</th>
                    <th className="px-4 py-3.5 text-center">Poin Loyalitas</th>
                    <th className="px-4 py-3.5">Total Transaksi</th>
                    <th className="px-4 py-3.5">Order Terakhir</th>
                    <th className="px-5 py-3.5 text-right">Bahasa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-stone-900">{c.name}</div>
                        <div className="text-[10px] text-stone-400">ID: {c.id} • Sejak {c.registeredDate}</div>
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
                        <div className="text-[10px] text-stone-400">{c.totalOrders}x Belanja</div>
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
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {v.isActive ? 'Aktif' : 'Non-Aktif'}
                    </button>
                  </div>

                  <h4 className="font-bold text-stone-900 text-xs mt-2">{v.title}</h4>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{v.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 text-xs space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Nilai Potongan:</span>
                    <span className="font-bold text-stone-900">
                      {v.discountType === 'FIXED' ? `¥${v.discountValue.toLocaleString()}` : `${v.discountValue}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min. Belanja:</span>
                    <span className="font-bold text-stone-900">¥{v.minSpend.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400 pt-1">
                    <span>Sudah Digunakan: {v.usageCount}x</span>
                    <span>Hingga: {v.validUntil}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal New Voucher */}
      {isNewVoucherOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Buat Voucher Promosi Baru</h3>
              <button onClick={() => setIsNewVoucherOpen(false)} className="text-stone-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Kode Voucher (Kapital):</label>
                <input
                  type="text"
                  value={vCode}
                  onChange={(e) => setVCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: MERDEKA500"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Judul Promosi:</label>
                <input
                  type="text"
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  placeholder="Contoh: Diskon Kemerdekaan Indonesia"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Deskripsi Singkat:</label>
                <input
                  type="text"
                  value={vDesc}
                  onChange={(e) => setVDesc(e.target.value)}
                  placeholder="Potongan ¥500 untuk belanja min. ¥5.000"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tipe Diskon:</label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value as Voucher['discountType'])}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    <option value="FIXED">Nominal Tetap (¥)</option>
                    <option value="PERCENTAGE">Persentase (%)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Nilai Diskon ({vType === 'FIXED' ? '¥' : '%'}):
                  </label>
                  <input
                    type="number"
                    value={vValue}
                    onChange={(e) => setVValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Minimal Belanja (¥):</label>
                <input
                  type="number"
                  value={vMinSpend}
                  onChange={(e) => setVMinSpend(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsNewVoucherOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveVoucher}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs"
              >
                Simpan & Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
