import React, { useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';

export const CompetitorPricingPage: React.FC = () => {
  const { competitorPrices } = useAdmin();
  const { language } = useLanguage();

  const cheaperCount = competitorPrices.filter((c) => c.recommendation === 'Cheaper').length;
  const adjustCount = competitorPrices.filter((c) => c.recommendation === 'Adjust Recommended').length;

  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: '競合価格インテリジェンス・市場調査',
        subtitle: '日本国内の主要競合他社（モグモグジャパン、大久保ハラール、楽天アジアフード等）とのリアルタイム価格比較・モニタリング。',
        cardCompPower: '価格競争力ステータス',
        cheaperPercent: (p: number) => `${p}% 競合より安価`,
        cheaperSub: (ch: number, tot: number) => `${tot}品中 ${ch}品で圧倒的価格優位性`,
        cardCompMonitored: '監視中プラットフォーム',
        monitoredPlatformsCount: '4 プラットフォーム',
        monitoredPlatformsSub: 'Mogu Mogu, 大久保Halal, 楽天, Amazon JP',
        cardAdjustRec: '価格調整推奨アラート',
        adjustCountStr: (cnt: number) => `${cnt} 商品`,
        adjustSub: '価格見直し推奨（競争力維持）',
        badgeCheaper: '✅ 競合よりお買い得',
        badgeReview: '⚠️ 価格見直し推奨',
        priceDiffLabel: '価格差:',
        ourPriceHeader: 'SEMBAKO NUSANTARA 価格',
        taxInc8: '消費税込 (軽減税率 8%)',
        checkedDate: (dt: string) => `確認日: ${dt}`
      };
    } else if (language === 'EN') {
      return {
        title: 'Competitor Price Intelligence & Monitoring',
        subtitle: 'Real-time price comparison vs major Japanese market competitors (Mogu Mogu Japan, Okubo Halal, Rakuten Asia Food).',
        cardCompPower: 'Price Competitiveness',
        cheaperPercent: (p: number) => `${p}% Cheaper than Market`,
        cheaperSub: (ch: number, tot: number) => `${ch} of ${tot} products have price advantage`,
        cardCompMonitored: 'Monitored Platforms',
        monitoredPlatformsCount: '4 Platforms',
        monitoredPlatformsSub: 'Mogu Mogu, Okubo Halal, Rakuten, Amazon JP',
        cardAdjustRec: 'Adjustment Recommended',
        adjustCountStr: (cnt: number) => `${cnt} Products`,
        adjustSub: 'Review needed to stay competitive',
        badgeCheaper: '✅ Cheaper Than Competitor',
        badgeReview: '⚠️ Review Recommended',
        priceDiffLabel: 'Price Gap:',
        ourPriceHeader: 'Sembako Nusantara Price',
        taxInc8: 'Tax Included (8% JCT)',
        checkedDate: (dt: string) => `Checked: ${dt}`
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'Competitor Price Intelligence & Monitoring',
        subtitle: 'Pemantauan dan komparasi harga real-time vs kompetitor utama di Jepang (seperti Mogu Mogu Japan, Halal Corner Tokyo, dan Rakuten Asia Food).',
        cardCompPower: 'Status Daya Saing Harga',
        cheaperPercent: (p: number) => `${p}% Lebih Murah`,
        cheaperSub: (ch: number, tot: number) => `${ch} dari ${tot} produk unggul bersaing`,
        cardCompMonitored: 'Kompetitor Terpantau',
        monitoredPlatformsCount: '4 Platform',
        monitoredPlatformsSub: 'Mogu Mogu, Okubo Halal, Rakuten, Amazon JP',
        cardAdjustRec: 'Rekomendasi Penyesuaian',
        adjustCountStr: (cnt: number) => `${cnt} Produk`,
        adjustSub: 'Perlu review harga agar tetap kompetitif',
        badgeCheaper: '✅ Lebih Hemat Dari Kompetitor',
        badgeReview: '⚠️ Rekomendasi Tinjau Harga',
        priceDiffLabel: 'Selisih Harga:',
        ourPriceHeader: 'Harga Sembako Nusantara',
        taxInc8: 'Sudah Termasuk Pajak (8%)',
        checkedDate: (dt: string) => `Dicek: ${dt}`
      };
    }
  }, [language]);

  return (
    <AdminLayout
      title={txt.title}
      subtitle={txt.subtitle}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">{txt.cardCompPower}</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {txt.cheaperPercent(competitorPrices.length > 0 ? Math.round((cheaperCount / competitorPrices.length) * 100) : 0)}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              {txt.cheaperSub(cheaperCount, competitorPrices.length)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">{txt.cardCompMonitored}</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {txt.monitoredPlatformsCount}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">{txt.monitoredPlatformsSub}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">{txt.cardAdjustRec}</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {txt.adjustCountStr(adjustCount)}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">{txt.adjustSub}</div>
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
                    {cp.recommendation === 'Cheaper' ? txt.badgeCheaper : txt.badgeReview}
                  </span>
                </div>

                <div className="text-xs">
                  {txt.priceDiffLabel}{' '}
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
                    {txt.ourPriceHeader}
                  </div>
                  <div className="text-2xl font-black text-[#c41230] mt-1">
                    ¥{cp.ourPrice.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{txt.taxInc8}</div>
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
                        <span>{txt.checkedDate(comp.lastChecked)}</span>
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
