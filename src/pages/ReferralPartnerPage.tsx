import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../utils/assets';

export const ReferralPartnerPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex flex-col items-center justify-center">
      {/* Top Tag */}
      <div className="text-center mb-6">
        <span className="px-3.5 py-1.5 bg-[#FFDAD9] text-[#9a0021] text-xs font-bold rounded-full uppercase tracking-wider shadow-xs">
          {language === 'JP'
            ? '公式アフィリエイト・紹介プログラム'
            : language === 'EN'
            ? 'Official Affiliate & Referral Program'
            : 'Program Afiliasi & Kemitraan Toko'}
        </span>
      </div>

      {/* Main Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl border border-[#EBE5DF] p-8 sm:p-14 shadow-lg text-center w-full relative overflow-hidden"
      >
        {/* Decorative Background Blob */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-50 rounded-full blur-3xl pointer-events-none" />

        {/* Mascot Love Illustration */}
        <motion.div
          whileHover={{ scale: 1.06, rotateZ: 2 }}
          transition={{ type: 'spring', stiffness: 260, damping: 15 }}
          className="w-44 h-44 sm:w-56 sm:h-56 mx-auto relative flex items-center justify-center cursor-pointer mb-6"
        >
          <img
            src={assetUrl('mascot-love.png')}
            alt="Mascot Sembako Nusantara"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[#c41230] font-black text-xs sm:text-sm tracking-widest uppercase shadow-xs mb-3">
          <span className="w-2 h-2 rounded-full bg-[#c41230] animate-ping" />
          <span>COMING SOON</span>
        </div>

        {/* Heading */}
        <h1 className="font-heading font-black text-2xl sm:text-4xl text-stone-900 tracking-tight mt-2">
          {language === 'JP'
            ? '近日公開予定'
            : language === 'EN'
            ? 'COMING SOON'
            : 'SEGERA HADIR'}
        </h1>

        <h2 className="text-sm sm:text-base font-bold text-stone-700 mt-2">
          {language === 'JP'
            ? 'ディアスポラ提携・お友達紹介プログラム'
            : language === 'EN'
            ? 'Diaspora Partner & Referral Program'
            : 'Program Kemitraan & Referral Diaspora'}
        </h2>

        {/* Subtitle */}
        <p className="text-stone-500 font-medium text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
          {language === 'JP'
            ? 'ディアスポラ提携・お友達紹介プログラムは現在準備中です。最高の還元システムをお届けできるよう開発を進めております。'
            : language === 'EN'
            ? 'Diaspora Partner & Referral Program is currently under development. We are preparing the best rewards system for you.'
            : 'Program Kemitraan & Referral Diaspora sedang dalam tahap persiapan dan pengembangan sistem reward komisi terbaik untuk Anda.'}
        </p>

        {/* What to Expect Box */}
        <div className="bg-stone-50/80 rounded-2xl border border-stone-200/80 p-5 sm:p-6 max-w-md mx-auto text-left space-y-3 mt-8">
          <div className="flex items-center gap-2 text-[#c41230] font-bold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">hourglass_top</span>
            <span>
              {language === 'JP'
                ? '準備中の機能ハイライト'
                : language === 'EN'
                ? 'What to Expect'
                : 'Yang Akan Hadir'}
            </span>
          </div>
          <ul className="text-xs sm:text-sm text-stone-600 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                {language === 'JP'
                  ? 'コミュニティ限定の特別紹介コード'
                  : language === 'EN'
                  ? 'Exclusive referral codes for diaspora communities'
                  : 'Kode referral eksklusif untuk komunitas diaspora'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                {language === 'JP'
                  ? 'お買い物ポイント＆自動コミッション還元'
                  : language === 'EN'
                  ? 'Automatic commission & shopping reward points'
                  : 'Komisi saldo belanja otomatis untuk setiap transaksi sukses'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                {language === 'JP'
                  ? 'お友達への初回注文限定 ¥500 OFF クーポン'
                  : language === 'EN'
                  ? 'Special ¥500 OFF first order discount for friends'
                  : 'Kupon diskon hemat belanja pertama untuk teman baru Anda'}
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">home</span>
            <span>
              {language === 'JP'
                ? 'ホームへ戻る'
                : language === 'EN'
                ? 'Back to Home'
                : 'Kembali ke Beranda'}
            </span>
          </Link>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm border border-stone-200 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            <span>
              {language === 'JP'
                ? '商品一覧を見る'
                : language === 'EN'
                ? 'Explore Products'
                : 'Belanja Sembako'}
            </span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
