import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';

export const CompetitorPricingPage: React.FC = () => {
  const { competitorPrices } = useAdmin();

  const cheaperCount = competitorPrices.filter((c) => c.recommendation === 'Cheaper').length;
  const adjustCount = competitorPrices.filter((c) => c.recommendation === 'Adjust Recommended').length;

  return (
    <AdminLayout
      title="Competitor Price Intelligence & Monitoring"
      subtitle="Pemantauan dan komparasi harga real-time vs kompetitor utama di Jepang (seperti Mogu Mogu Japan, Halal Corner Tokyo, dan Rakuten Asia Food)."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Status Daya Saing Harga</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {Math.round((cheaperCount / competitorPrices.length) * 100)}% Lebih Murah
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              {cheaperCount} dari {competitorPrices.length} produk unggul bersaing
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Kompetitor Terpantau</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              4 Platform
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Mogu Mogu, Okubo Halal, Rakuten, Amazon JP</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Rekomendasi Penyesuaian</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {adjustCount} Produk
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">Perlu review harga agar tetap kompetitif</div>
          </div>
        </div>

        {/* Competitor Price Comparison List */}
        <div className="space-y-4">
          {competitorPrices.map((cp) => (
            <div
              key={cp.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-sm text-stone-900">{cp.productName}</div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cp.recommendation === 'Cheaper'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cp.recommendation === 'Cheaper'
                      ? '✅ Lebih Hemat Dari Kompetitor'
                      : '⚠️ Rekomendasi Tinjau Harga'}
                  </span>
                </div>

                <div className="text-xs">
                  Selisih Harga:{' '}
                  <span
                    className={`font-black font-mono ${
                      cp.priceDifferencePercentage < 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {cp.priceDifferencePercentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Our Price */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#c41230]">
                    Harga Sembako Nusantara
                  </div>
                  <div className="text-2xl font-black text-[#c41230] mt-1">
                    ¥{cp.ourPrice.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Sudah Termasuk Pajak (8% 税込)</div>
                </div>

                {/* Competitors List */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cp.competitors.map((comp, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 space-y-1 text-xs"
                    >
                      <div className="font-bold text-stone-800 truncate">{comp.name}</div>
                      <div className="text-base font-black text-stone-900 font-mono">
                        ¥{comp.price.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-stone-400 flex justify-between">
                        <span>Dicek: {comp.lastChecked}</span>
                        {comp.price > cp.ourPrice ? (
                          <span className="text-emerald-600 font-bold">
                            +¥{(comp.price - cp.ourPrice).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold">
                            -¥{(cp.ourPrice - comp.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
