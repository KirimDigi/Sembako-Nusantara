import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';
import { Section3D } from '../components/common/Motion3D';
import { PromoBannerSlider } from '../components/home/PromoBannerSlider';
import { ProductCatalogSection } from '../components/catalog/ProductCatalogSection';
import { ProductCard } from '../components/product/ProductCard';
import { PRODUCTS_DATA } from '../data/products';
import { assetUrl } from '../utils/assets';

export const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const { itemDiscounts } = useAdmin();

  // Find products that currently have active discounts set by Admin
  const discountedProducts = PRODUCTS_DATA.filter((p) =>
    itemDiscounts.some(
      (d) => d.isActive && (d.productId === p.id || d.productSku === (p as any).sku || d.productName?.toLowerCase() === p.name.toLowerCase())
    )
  );

  return (
    <div className="w-full space-y-10 sm:space-y-16 pb-20 overflow-hidden">
      {/* 1. HERO PROMO BANNER COVER PHOTO SLIDER */}
      <section className="w-full pt-2">
        <PromoBannerSlider />
      </section>

      {/* 2. KATALOG PRODUK LANGSUNG DI BAWAH FOTO SAMPUL HERO SECTION */}
      <section className="w-full">
        <ProductCatalogSection showTitleHeader={false} showCategoryBar={false} />
      </section>

      {/* 2.1 SECTION: KATALOG PRODUK YANG SERING DIBELI (Dikosongkan dahulu karena data belum ada) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pb-4 border-b border-stone-200 gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">local_fire_department</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {language === 'JP' ? '人気商品' : language === 'EN' ? 'Bestsellers' : 'Paling Sering Dibeli'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {language === 'JP'
                ? 'よく買われている商品'
                : language === 'EN'
                ? 'Frequently Bought Products'
                : 'Produk yang Sering Dibeli'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {language === 'JP'
                ? '在日インドネシア人の皆様に最も多くリピート注文されている定番商品'
                : language === 'EN'
                ? 'The most frequently reordered grocery essentials by diaspora customers in Japan'
                : 'Daftar produk sembako dan kebutuhan nusantara yang paling sering diorder oleh sahabat diaspora.'}
            </p>
          </div>
        </div>

        {/* Karena data barang yang sering dibeli belum ada, kosongkan saja dahulu dengan tampilan clean */}
        <div className="bg-stone-50/70 rounded-3xl border-2 border-dashed border-stone-200/80 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100/60 text-amber-600 flex items-center justify-center mb-3 shadow-xs">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <h3 className="font-heading font-bold text-base sm:text-lg text-stone-800">
            {language === 'JP'
              ? '現在、よく買われている商品のデータはありません'
              : language === 'EN'
              ? 'No frequently bought product data yet'
              : 'Belum Ada Data Produk yang Sering Dibeli'}
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
            {language === 'JP'
              ? '注文履歴データの集計が開始されると、自動的にこちらにおすすめ人気商品が表示されます。'
              : language === 'EN'
              ? 'Bestselling products will automatically appear here once real order records are accumulated.'
              : 'Daftar produk favorit terlaris akan otomatis terisi dan tampil di sini setelah transaksi pesanan pelanggan mulai berjalan.'}
          </p>
        </div>
      </section>

      {/* 2.2 SECTION: KATALOG PRODUK PROMO (Dikosongkan dahulu karena promo belum ada) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pb-4 border-b border-stone-200 gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-lg bg-rose-50 text-[#c41230] border border-rose-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">loyalty</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                {language === 'JP' ? '特別割引' : language === 'EN' ? 'Special Offers' : 'Promo Spesial'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {language === 'JP'
                ? 'プロモーション商品'
                : language === 'EN'
                ? 'Special Promo Products'
                : 'Produk Promo Spesial'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {language === 'JP'
                ? '期間限定の特別価格・お得なまとめ買いセール商品'
                : language === 'EN'
                ? 'Limited time discount deals and special bundle offers for smart savings'
                : 'Penawaran diskon spesial dan potongan harga terbaik untuk belanja hemat sembako nusantara.'}
            </p>
          </div>
        </div>

        {discountedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {discountedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          /* Karena promo belum ada, kosongkan saja dahulu dengan tampilan clean */
          <div className="bg-stone-50/70 rounded-3xl border-2 border-dashed border-stone-200/80 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100/60 text-[#c41230] flex items-center justify-center mb-3 shadow-xs">
              <span className="material-symbols-outlined text-3xl">percent</span>
            </div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-stone-800">
              {language === 'JP'
                ? '現在開催中のプロモーションはありません'
                : language === 'EN'
                ? 'No active promotional products at this time'
                : 'Belum Ada Produk Promo Aktif Saat Ini'}
            </h3>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
              {language === 'JP'
                ? '新しいセールやプロモーションが開始されると、こちらにお買い得商品が掲載されます。'
                : language === 'EN'
                ? 'Discounted items will be showcased here once new promotional campaigns are activated.'
                : 'Nantikan kejutan promo kilat, diskon bundle, dan penawaran hemat menarik berikutnya dari Sembako Nusantara.'}
            </p>
          </div>
        )}
      </section>

      {/* 3. SECTION AKHIR SEBELUM FOOTER: SIAP PESAN? */}
      <Section3D direction="up" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-[#EBE5DF] shadow-xl p-8 sm:p-14 text-center relative overflow-hidden"
        >
          {/* Promo Mascot Illustration */}
          <div className="flex justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.08, rotateZ: 3, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-32 h-32 sm:w-40 sm:h-40 relative flex items-center justify-center cursor-pointer"
            >
              <img
                src={assetUrl('mascot-promo.png')}
                alt="Promo Mascot Sembako Nusantara"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </motion.div>
          </div>

          {/* Subheader */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-[2px] w-6 bg-[#c41230]"></span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#c41230]">
              {language === 'JP' ? 'ご注文の準備はできましたか？' : language === 'EN' ? 'READY TO ORDER?' : 'SIAP PESAN?'}
            </span>
            <span className="h-[2px] w-6 bg-[#c41230]"></span>
          </div>

          {/* Main Title */}
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-stone-900 tracking-tight leading-tight">
            {language === 'JP'
              ? '本場の味を、ワンクリックで。'
              : language === 'EN'
              ? 'Taste of Nusantara, Just a Click Away.'
              : 'Rasa nusantara, tinggal satu klik.'}
          </h2>

          {/* Description */}
          <p className="text-stone-600 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            {language === 'JP'
              ? '今すぐお買い物してお気に入りの懐かしい味を楽しもう！ご不明な点はご希望の言語でお気軽にお問い合わせください。'
              : language === 'EN'
              ? 'Shop now to rediscover your favorite food — or contact us with any questions in your preferred language.'
              : 'Belanja sekarang dan rasakan kembali makanan favoritmu — atau hubungi kami untuk pertanyaan apa pun, dalam bahasa yang kamu mau.'}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-row items-center justify-center gap-2.5 sm:gap-4 max-w-md mx-auto">
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial">
              <Link
                to="/about"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#c41230] hover:bg-[#9a0021] text-white px-4 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-base shadow-md hover:shadow-xl transition-all cursor-pointer text-center whitespace-nowrap"
              >
                <span>{language === 'JP' ? '会社概要・私たちについて' : language === 'EN' ? 'About Our Store' : 'Tentang Kami'}</span>
                <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial">
              <a
                href="https://wa.me/6285773875762?text=Halo%20Sembako%20Nusantara,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20pemesanan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-4 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-base shadow-xs hover:shadow transition-all text-center whitespace-nowrap"
              >
                <img src={assetUrl('whatsapp-icon.png')} alt="WhatsApp" className="w-5 h-5 object-contain" />
                <span>{language === 'JP' ? 'WhatsAppでお問い合わせ' : language === 'EN' ? 'Chat WhatsApp' : 'Chat WhatsApp'}</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </Section3D>
    </div>
  );
};
