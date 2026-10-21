import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../utils/assets';

export const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phoneOrEmail: '',
    prefecture: 'Tokyo',
    subject: 'Stok makanan',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waLink, setWaLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-caption format sesuai permintaan:
    // - Nama : Willy Aryana
    // - No hp : 0812345678910
    // - Tempat Tinggal : Tokyo
    // - Kategori Pertanyaan : Stok makanan
    // - Isi Pesan : Bismillah
    const caption = [
      `- Nama : ${formData.name.trim()}`,
      `- No hp : ${formData.phoneOrEmail.trim()}`,
      `- Tempat Tinggal : ${formData.prefecture.trim() || 'Tokyo'}`,
      `- Kategori Pertanyaan : ${formData.subject.trim()}`,
      `- Isi Pesan : ${formData.message.trim()}`
    ].join('\n');

    const waUrl = `https://wa.me/6285773875762?text=${encodeURIComponent(caption)}`;
    setWaLink(waUrl);
    setIsSubmitted(true);

    // Redirect / open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };


  const socialMediaList = [
    {
      name: 'WhatsApp Official',
      handle: '+62 857-7387-5762',
      url: 'https://wa.me/6285773875762',
      color: 'bg-[#25D366] text-white',
      desc: 'Konsultasi belanja kilat & info pengiriman',
      iconType: 'whatsapp'
    },
    {
      name: 'Instagram',
      handle: '@sembakonusantara.jp',
      url: 'https://www.instagram.com/sembakonusantara.jp/',
      color: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white',
      desc: 'Katalog terbaru, promo diskon, & resep nusantara',
      iconType: 'instagram'
    },
    {
      name: 'TikTok Official',
      handle: '@sembakonusantara.jp',
      url: 'https://www.tiktok.com/@sembakonusantara.jp',
      color: 'bg-black text-white',
      desc: 'Video unboxing frozen food, sambal, & mie instan',
      iconType: 'tiktok'
    },
    {
      name: 'LINE Official',
      handle: '@sembakonusantara',
      url: 'https://line.me',
      color: 'bg-[#06C755] text-white',
      desc: 'Voucher belanja otomatis & pengumuman stok',
      iconType: 'line'
    },
    {
      name: 'Facebook Group',
      handle: 'Sahabat Sembako Nusantara Jepang',
      url: 'https://facebook.com',
      color: 'bg-[#1877F2] text-white',
      desc: 'Komunitas diaspora, PPI, kenshusei, & tokutei ginou',
      iconType: 'facebook'
    },
    {
      name: 'YouTube Channel',
      handle: 'Sembako Nusantara TV',
      url: 'https://youtube.com',
      color: 'bg-[#FF0000] text-white',
      desc: 'Tutorial bayar JPQR/Konbini & video masak',
      iconType: 'youtube'
    }
  ];

  const renderSocialIcon = (iconType: string) => {
    switch (iconType) {
      case 'whatsapp':
        return (
          <img
            src={assetUrl('whatsapp-icon.png')}
            alt="WhatsApp"
            className="w-7 h-7 object-contain drop-shadow-xs"
          />
        );
      case 'instagram':
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.05 3.26-1.48 3.36-3.29.02-3.67.01-7.34.01-11.01 0-.74-.01-1.48-.01-2.22z"/>
          </svg>
        );
      case 'line':
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      default:
        return <span className="material-symbols-outlined text-xl">share</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
      {/* Header Banner with Mascot Love on the Right */}
      <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-red-50/50 via-white to-amber-50/40 p-6 sm:p-8 rounded-3xl border border-[#EBE5DF]/80 shadow-xs">
        <div className="text-center md:text-left space-y-3 flex-1">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-100/70 text-[#c41230] text-xs font-extrabold uppercase tracking-wider border border-red-200">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            {language === 'JP' ? '公式お問い合わせ窓口' : 'Layanan Pelanggan & Kontak Resmi'}
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-stone-900 tracking-tight">
            {language === 'JP'
              ? 'お問い合わせ・サポート'
              : 'Hubungi Sembako Nusantara Jepang'}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-xl">
            {language === 'JP'
              ? '商品のお問い合わせ、配送状況の確認、大口注文、アフィリエイト提携など、24時間年中無休でお気軽にお問い合わせください。'
              : 'Ada pertanyaan mengenai produk halal, pengiriman paket Cool Takkyubin, konfirmasi pembayaran, atau program kemitraan diaspora? Kami siap membantu 24 jam nonstop.'}
          </p>
        </div>

        {/* Mascot Love on the Right (Transparent Background, Static) */}
        <div className="shrink-0 flex items-center justify-center relative">
          <div className="w-28 sm:w-36 md:w-40 h-auto relative flex items-center justify-center hover:scale-105 transition-transform">
            <img
              src={assetUrl('mascot-love.png')}
              alt="Mascot Sembako Nusantara Love"
              className="w-full h-auto object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>


      {/* Social Media Channels Section */}
      <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c41230]">
            {language === 'JP' ? '公式ソーシャルメディア' : language === 'EN' ? 'Official Social Media' : 'Official Social Media'}
          </span>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-stone-900">
            {language === 'JP'
              ? '公式SNSでコミュニティとつながる'
              : language === 'EN'
              ? 'Connect with Our Community on Social Media'
              : 'Terhubung Bersama Komunitas Kami di Media Sosial'}
          </h2>
          <p className="text-xs text-stone-500">
            {language === 'JP'
              ? '公式SNSをフォローして、レシピ動画、開封レビュー、最新の入荷情報や限定クーポンをチェックしてください！'
              : language === 'EN'
              ? 'Follow our official social media channels for recipes, product unboxing, restock announcements, and giveaways!'
              : 'Ikuti media sosial resmi Sembako Nusantara Jepang untuk video resep kuliner, unboxing paket sembako, info restok sambal & frozen food, serta giveaway berkala!'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {socialMediaList.map((soc, idx) => (
            <a
              key={idx}
              href={soc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl border border-stone-200 hover:border-[#c41230] bg-stone-50/50 hover:bg-white transition-all group flex items-center justify-between gap-3 shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl ${soc.color} flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform p-2.5`}
                >
                  {renderSocialIcon(soc.iconType)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-stone-900 truncate">{soc.name}</h4>
                  <p className="text-xs text-[#c41230] font-semibold truncate">{soc.handle}</p>
                  <p className="text-[11px] text-stone-500 truncate">{soc.desc}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-stone-400 group-hover:text-[#c41230] transition-colors shrink-0">
                chevron_right
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Contact Form & Office Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Message Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-xl text-stone-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c41230]">send</span>
              <span>
                {language === 'JP'
                  ? '運営窓口へメッセージを送信'
                  : language === 'EN'
                  ? 'Send Direct Message to Management'
                  : 'Kirim Pesan Langsung ke Manajemen'}
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'JP'
                ? '以下のフォームにご記入ください。15〜30分以内に担当者よりご返信いたします。'
                : language === 'EN'
                ? 'Fill out the form below and our team will respond within 15–30 minutes.'
                : 'Isi formulir berikut dan tim kami akan merespons dalam waktu maksimal 15–30 menit.'}
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
              <span className="material-symbols-outlined text-4xl text-[#15803D]">check_circle</span>
              <h4 className="font-bold text-stone-900 text-base">
                {language === 'JP'
                  ? 'WhatsAppサポート窓口を開いています...'
                  : language === 'EN'
                  ? 'Opening Customer Service WhatsApp...'
                  : 'Membuka WhatsApp Customer Service...'}
              </h4>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                {language === 'JP'
                  ? 'メッセージ内容が自動生成されました。アプリが開かない場合は以下のボタンを押してください。'
                  : language === 'EN'
                  ? 'Your message has been formatted. If WhatsApp does not open automatically, please click below:'
                  : 'Pesan Anda telah disiapkan otomatis dengan format auto-caption. Jika aplikasi atau web WhatsApp tidak terbuka otomatis, silakan klik tombol di bawah:'}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebc57] text-white rounded-xl font-bold text-xs shadow-md transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span>
                    {language === 'JP' ? '今すぐWhatsAppを開く' : language === 'EN' ? 'Open WhatsApp Now' : 'Buka WhatsApp Sekarang'}
                  </span>
                  <span className="material-symbols-outlined text-xs">arrow_outward</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'JP' ? '別のメッセージを書く' : language === 'EN' ? 'Write New Message' : 'Tulis Pesan Baru'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                    {language === 'JP' ? 'お名前 / Nama Anda:' : language === 'EN' ? 'Full Name:' : 'Nama Anda / お名前:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'JP' ? 'れい: やまだ たろう' : language === 'EN' ? 'e.g. Willy Aryana' : 'Contoh: Willy Aryana'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                    {language === 'JP' ? '電話番号 / WhatsApp:' : language === 'EN' ? 'WhatsApp / Phone:' : 'No. WhatsApp / HP:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneOrEmail}
                    onChange={(e) => setFormData({ ...formData, phoneOrEmail: e.target.value })}
                    placeholder={language === 'JP' ? 'れい: 080-1234-5678' : language === 'EN' ? 'e.g. +81 80-1234-5678' : 'Contoh: 0812345678910'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                    {language === 'JP' ? '日本国内の居住都道府県:' : language === 'EN' ? 'Prefecture of Residence:' : 'Prefektur Tempat Tinggal di Jepang:'}
                  </label>
                  <input
                    type="text"
                    value={formData.prefecture}
                    onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                    placeholder={language === 'JP' ? 'れい: とうきょうと (東京)' : language === 'EN' ? 'e.g. Tokyo' : 'Contoh: Tokyo'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                    {language === 'JP' ? 'お問い合わせカテゴリー:' : language === 'EN' ? 'Question Category:' : 'Kategori Pertanyaan:'}
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  >
                    <option value="Stok makanan">
                      {language === 'JP' ? '食品・スパイスの在庫状況' : language === 'EN' ? 'Food & Spices Stock' : 'Stok makanan'}
                    </option>
                    <option value="Pertanyaan Produk Halal">
                      {language === 'JP' ? 'ハラール認証・原材料のお問い合わせ' : language === 'EN' ? 'Halal Certification Inquiry' : 'Pertanyaan Produk Halal'}
                    </option>
                    <option value="Pelacakan Pengiriman Paket">
                      {language === 'JP' ? 'クール宅急便・配送状況の確認' : language === 'EN' ? 'Package Delivery Tracking' : 'Pelacakan Pengiriman Paket'}
                    </option>
                    <option value="Bantuan Pembayaran JPQR / PayPay">
                      {language === 'JP' ? 'JPQR / PayPay / コンビニ決済の質問' : language === 'EN' ? 'Payment Assistance' : 'Bantuan Pembayaran JPQR / PayPay'}
                    </option>
                    <option value="Pendaftaran Mitra Komunitas">
                      {language === 'JP' ? 'パートナー提携・コミュニティ参加' : language === 'EN' ? 'Community Partner Program' : 'Pendaftaran Mitra Komunitas'}
                    </option>
                    <option value="Request Barang / Komentar">
                      {language === 'JP' ? '商品リクエスト・ご意見' : language === 'EN' ? 'Item Request & Feedback' : 'Request Barang / Komentar'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                  {language === 'JP' ? 'メッセージ内容:' : language === 'EN' ? 'Your Message:' : 'Isi Pesan Anda:'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={
                    language === 'JP'
                      ? 'ごしつもん や メッセージ を にゅうりょく してください (れい: おねがいします)...'
                      : language === 'EN'
                      ? 'Type your message here...'
                      : 'Tuliskan pesan Anda (Contoh: Bismillah)...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                <span>
                  {language === 'JP'
                    ? 'メッセージを送信する'
                    : language === 'EN'
                    ? 'Send Message Now'
                    : 'Kirimkan Pesan Sekarang'}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Operating Hours & Address Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#141414] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-stone-800">
            <div>
              <span className="text-[10px] font-bold text-[#c41230] uppercase tracking-widest bg-red-950/60 px-2.5 py-1 rounded-full border border-red-900/50">
                {language === 'JP' ? 'オフィス・物流拠点情報' : language === 'EN' ? 'Office & Logistics Info' : 'Informasi Kantor & Logistik'}
              </span>
              <h3 className="font-heading font-bold text-lg text-white mt-2">
                Sembako Nusantara Jepang
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {language === 'JP'
                  ? '日本最大級のハラール食品・インドネシア食材専門店。'
                  : language === 'EN'
                  ? 'Japan’s most complete halal food & Indonesian grocery provider.'
                  : 'Penyedia sembako & frozen food halal terlengkap se-Jepang.'}
              </p>
            </div>

            <div className="space-y-4 text-xs border-t border-stone-800 pt-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c41230] text-lg shrink-0">
                  schedule
                </span>
                <div>
                  <p className="font-bold text-stone-200">
                    {language === 'JP' ? '営業時間・受付時間:' : language === 'EN' ? 'Operating Hours:' : 'Jam Operasional & Pelayanan:'}
                  </p>
                  <p className="text-emerald-400 font-semibold mt-0.5">
                    {language === 'JP' ? '年中無休・24時間営業' : language === 'EN' ? 'Open 24/7 Daily' : 'Buka Setiap Hari 24 Jam'}
                  </p>
                  <p className="text-stone-400 text-[11px]">
                    {language === 'JP'
                      ? '宅配便の発送業務は毎日 09:00 - 18:00 (JST) に実施。'
                      : language === 'EN'
                      ? 'Courier shipping is dispatched daily from 09:00 - 18:00 JST.'
                      : 'Pengiriman ekspedisi dilakukan setiap hari pukul 09.00 - 18.00 JST.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c41230] text-lg shrink-0">
                  storefront
                </span>
                <div>
                  <p className="font-bold text-stone-200">
                    {language === 'JP' ? '店舗所在地 (東京):' : language === 'EN' ? 'Store Address (Tokyo):' : 'Alamat Lengkap Toko (Tokyo):'}
                  </p>
                  <p className="text-stone-200 text-xs font-semibold mt-0.5">〒144-0051 東京都大田区西蒲田5丁目9-16</p>
                  <p className="text-stone-400 text-[11px]">Tokyo, Ota-ku, Nishikamata 5-9-16</p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=〒144-0051+東京都大田区西蒲田5丁目9-16"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#ff8093] hover:underline text-[11px] font-bold mt-1"
                  >
                    <span>
                      {language === 'JP' ? 'Googleマップでルートを見る' : language === 'EN' ? 'Open in Google Maps' : 'Buka Petunjuk Arah Google Maps'}
                    </span>
                    <span className="material-symbols-outlined text-[12px]">arrow_outward</span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c41230] text-lg shrink-0">
                  local_shipping
                </span>
                <div>
                  <p className="font-bold text-stone-200">
                    {language === 'JP' ? '配送サービス:' : language === 'EN' ? 'Delivery Services:' : 'Layanan Pengiriman:'}
                  </p>
                  <p className="text-stone-300 text-[11px] mt-0.5">
                    • <strong>{language === 'JP' ? 'デリバリー便:' : 'Delivery Service:'}</strong> {language === 'JP' ? '店舗から最大3駅以内' : language === 'EN' ? 'Max 3 stations from store' : 'Max jarak 3 station dari toko'}
                  </p>
                  <p className="text-stone-300 text-[11px]">
                    • <strong>{language === 'JP' ? '宅急便・宅配:' : language === 'EN' ? 'Express Courier:' : 'Ekspedisi:'}</strong> {language === 'JP' ? '全国47都道府県 (ヤマト運輸・佐川急便)' : language === 'EN' ? 'All 47 Prefectures (Yamato & Sagawa)' : 'Seluruh 47 Prefektur Jepang (Yamato & Sagawa)'}
                  </p>
                  <p className="text-stone-300 text-[11px]">
                    • <strong>COD:</strong> {language === 'JP' ? '代金引換 (着払い対応)' : language === 'EN' ? 'Cash on Delivery' : 'Cash on Delivery (Bayar di Tempat)'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c41230] text-lg shrink-0">
                  verified_user
                </span>
                <div>
                  <p className="font-bold text-stone-200">
                    {language === 'JP' ? 'ハラール＆品質保証:' : language === 'EN' ? 'Halal Quality Guarantee:' : 'Jaminan Mutu & Halal:'}
                  </p>
                  <p className="text-stone-400 text-[11px]">
                    {language === 'JP'
                      ? '全商品100%公式ハラール認証取得済・安心の日本国内正規流通。'
                      : language === 'EN'
                      ? 'All products are 100% officially Halal certified and licensed for distribution in Japan.'
                      : 'Semua produk 100% halal resmi & berizin edar di Jepang.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visi & Misi Perusahaan Section */}
      <div id="visi-misi" className="bg-gradient-to-br from-[#FDF8F0] via-white to-red-50/40 rounded-3xl border border-[#EBE5DF] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c41230]">
            {language === 'JP' ? '企業理念・ビジョン' : language === 'EN' ? 'Vision & Mission / About Us' : 'Visi & Misi / Tentang Perusahaan'}
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
            {language === 'JP'
              ? '在日コミュニティに向けた私たちの誓い'
              : language === 'EN'
              ? 'Our Commitment to the Community in Japan'
              : 'Komitmen Kami untuk Masyarakat Nusantara di Jepang'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            {language === 'JP'
              ? 'センバコ・ヌサンタラは、日本に暮らすインドネシアの皆様と故郷の味を繋ぐ架け橋です。'
              : language === 'EN'
              ? 'Sembako Nusantara bridges the taste of home and daily needs for Indonesians across Japan.'
              : 'Sembako Nusantara hadir sebagai jembatan cita rasa dan kebutuhan sehari-hari warga Indonesia di perantauan Jepang.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Card Visi */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-red-100 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#c41230] flex items-center justify-center font-bold text-xl mb-2">
              <span className="material-symbols-outlined text-2xl">visibility</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#c41230]">
              {language === 'JP' ? '私たちのビジョン' : language === 'EN' ? 'Our Vision' : 'Visi Kami'}
            </span>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-stone-900">
              {language === 'JP' ? 'ビジョン' : language === 'EN' ? 'Vision' : 'Visi'}
            </h3>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-medium">
              {language === 'JP'
                ? '日本国内におけるインドネシア食品の最も信頼される第一選択ストアとなること。'
                : language === 'EN'
                ? 'To become the most trusted Indonesian grocery store and the primary choice in Japan.'
                : 'Menjadi toko produk Indonesia terpercaya dan pilihan utama masyarakat Indonesia di Jepang.'}
            </p>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-red-50 rounded-full opacity-50 group-hover:scale-125 transition-transform -z-0 pointer-events-none" />
          </div>

          {/* Card Misi */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl mb-2">
              <span className="material-symbols-outlined text-2xl">flag</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
              {language === 'JP' ? '私たちのミッション' : language === 'EN' ? 'Our Mission' : 'Misi Kami'}
            </span>
            <h3 className="font-heading font-bold text-lg sm:text-xl text-stone-900">
              {language === 'JP' ? 'ミッション' : language === 'EN' ? 'Mission' : 'Misi'}
            </h3>
            <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-medium">
              {language === 'JP'
                ? '簡単・迅速・安心のサービスで、高品質なインドネシア特産品をお届けすること。'
                : language === 'EN'
                ? 'Providing premium Indonesian products with seamless, fast, and trustworthy services.'
                : 'Menyediakan produk Nusantara yang berkualitas dengan pelayanan yang mudah, cepat, dan terpercaya.'}
            </p>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-125 transition-transform -z-0 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Kebijakan Toko Section */}
      <div id="kebijakan-toko" className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#c41230] text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">policy</span>
            <span>
              {language === 'JP' ? 'サービス規定・透明性の保証' : language === 'EN' ? 'Service Terms & Transparency' : 'Ketentuan & Transparansi Layanan'}
            </span>
          </div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-stone-900">
            {language === 'JP'
              ? 'センバコ・ヌサンタラ日本 店舗利用規約'
              : language === 'EN'
              ? 'Sembako Nusantara Store Policies (Japan)'
              : 'Kebijakan Toko Sembako Nusantara Jepang'}
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm font-medium leading-relaxed bg-[#FDF8F0] p-4 rounded-xl border border-amber-200/70">
            {language === 'JP'
              ? '「安心・安全で信頼できるサービスとともに、高品質なインドネシア食品をお届けすることをお約束します。」'
              : language === 'EN'
              ? '"We are committed to delivering premium quality Indonesian products with secure and reliable service."'
              : '"Kami berkomitmen menyediakan produk Indonesia berkualitas dengan pelayanan yang aman dan terpercaya."'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Pengembalian Produk */}
          <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2 hover:bg-white hover:border-red-200 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-100 text-[#c41230] flex items-center justify-center font-bold text-sm shrink-0">
                <span className="material-symbols-outlined text-base">assignment_return</span>
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                {language === 'JP' ? '商品の返品について' : language === 'EN' ? 'Product Returns' : 'Pengembalian Produk'}
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-10">
              {language === 'JP'
                ? '開封後の食品および飲料は衛生管理上返品できません。ただし、誤配送、破損、または到着時の品質不良があった場合は速やかに代替対応いたします。'
                : language === 'EN'
                ? 'Food and beverage items cannot be returned once opened, except in cases of shipping error, damage, or defective condition upon arrival.'
                : 'Produk makanan dan minuman yang telah dibeli tidak dapat dikembalikan setelah kemasan dibuka, kecuali terdapat kesalahan pesanan, kerusakan, atau kondisi produk yang tidak sesuai saat diterima.'}
            </p>
          </div>

          {/* Komplain */}
          <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2 hover:bg-white hover:border-amber-200 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                <span className="material-symbols-outlined text-base">timer</span>
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                {language === 'JP' ? 'クレーム受付 (到着後24時間以内)' : language === 'EN' ? 'Complaints (Max 24 Hours)' : 'Komplain (Maksimal 24 Jam)'}
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-10">
              {language === 'JP'
                ? 'ご注文に関する問題は、商品到着後24時間以内に写真または動画の証拠を添えてカスタマーサポートへご連絡ください。'
                : language === 'EN'
                ? 'Order complaints must be submitted to Customer Service within 24 hours of receipt with photo/video evidence.'
                : 'Keluhan terkait pesanan wajib disampaikan kepada Customer Service maksimal 24 jam setelah barang diterima dengan menyertakan bukti foto/video.'}
            </p>
          </div>

          {/* Pesanan */}
          <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2 hover:bg-white hover:border-blue-200 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                <span className="material-symbols-outlined text-base">edit_note</span>
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                {language === 'JP' ? 'ご注文に関する注意事項' : language === 'EN' ? 'Order Terms' : 'Ketentuan Pesanan'}
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-10">
              {language === 'JP'
                ? '決済前にお届け先住所とお受取人情報を必ずご確認ください。出荷準備中または発送完了後のキャンセルは所定の規定に従います。'
                : language === 'EN'
                ? 'Please ensure recipient details and shipping address are correct before payment. Processed orders follow applicable cancellation rules.'
                : 'Pastikan data penerima dan alamat pengiriman sudah benar sebelum melakukan pembayaran. Pesanan yang telah diproses atau dikirim mengikuti ketentuan pembatalan yang berlaku.'}
            </p>
          </div>

          {/* Kompensasi / Retur */}
          <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-2 hover:bg-white hover:border-emerald-200 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                <span className="material-symbols-outlined text-base">verified</span>
              </span>
              <h4 className="font-bold text-sm text-stone-900">
                {language === 'JP' ? '補償・代替品の再発送' : language === 'EN' ? 'Compensation / Replacement' : 'Kompensasi / Retur'}
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-10">
              {language === 'JP'
                ? 'ご申請いただいた内容は商品状態および取引記録を確認の上、返品・交換または補償の可否を迅速に判断いたします。'
                : language === 'EN'
                ? 'Every claim will be verified based on product condition and transaction records before refund, replacement, or compensation is approved.'
                : 'Setiap pengajuan akan diperiksa berdasarkan kondisi produk dan bukti transaksi sebelum keputusan retur, penggantian produk, atau kompensasi diberikan.'}
            </p>
          </div>
        </div>
      </div>

      {/* Metode Pembayaran & Pengiriman Highlights */}
      <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 border border-white/10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#ff8093]">
            {language === 'JP' ? '公式 決済＆配送方法' : language === 'EN' ? 'Official Payment & Delivery Methods' : 'Metode Pembayaran & Pengiriman Resmi'}
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white">
            {language === 'JP' ? '柔軟・便利・安心のサービス' : language === 'EN' ? 'Flexible, Convenient, and Trusted' : 'Fleksibel, Nyaman, dan Terpercaya'}
          </h2>
          <p className="text-xs text-stone-400">
            {language === 'JP'
              ? '在日技能実習生、特定技能外国人、留学生、そして在日ご家族の皆様が日本全国どこからでも快適にご利用いただけるよう設計されています。'
              : language === 'EN'
              ? 'Specially tailored to assist Indonesian trainees, skilled workers, students, and families across Japan.'
              : 'Disesuaikan khusus untuk memudahkan kawan-kawan PMI, Kenshusei, Pelajar, dan Keluarga Indonesia di seluruh wilayah Jepang.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Payment Methods */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="material-symbols-outlined text-xl">payments</span>
              <h4 className="font-bold text-sm text-white">
                {language === 'JP' ? '多彩な決済方法に対応' : language === 'EN' ? 'Comprehensive Payment Methods' : 'Metode Pembayaran Lengkap'}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-700/80 text-white font-bold">
                {language === 'JP' ? '💵 現金払い (店頭/COD)' : language === 'EN' ? '💵 Cash (In-Store/COD)' : '💵 Cash (Tunai)'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-600/80 text-white font-bold">
                {language === 'JP' ? '🏦 ルピア/日本円振込' : language === 'EN' ? '🏦 IDR / JPY Transfer' : '🏦 Transfer IDR / Yen'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#c41230] text-white font-black">
                📱 QRIS / JPQR
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-700 text-white font-bold">
                {language === 'JP' ? '💳 デビット / クレジットカード' : language === 'EN' ? '💳 Debit / CC' : '💳 Debit / CC'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-700/80 text-white font-bold">
                {language === 'JP' ? '📲 電子マネー' : language === 'EN' ? '📲 E-wallet' : '📲 E-wallet'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FF0033] text-white font-bold">
                ⚡ PayPay
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold">
                {language === 'JP' ? '🤝 代金引換 (着払い)' : language === 'EN' ? '🤝 Cash on Delivery' : '🤝 COD (Bayar di Tempat)'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              {language === 'JP'
                ? 'インドネシアのルピア銀行口座振込、または日本円決済（PayPay、ゆうちょ銀行、コンビニ払い、現金）がご利用いただけます。'
                : language === 'EN'
                ? 'Pay with Indonesian Rupiah (Indonesian bank accounts) or Japanese Yen (PayPay, Yucho Bank, Konbini, Cash).'
                : 'Dapat bayar dengan Rupiah (rekening bank Indonesia) atau Yen Jepang (PayPay, Yucho Bank, Konbini, Cash).'}
            </p>
          </div>

          {/* Delivery Services */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
              <h4 className="font-bold text-sm text-white">
                {language === 'JP' ? 'スピーディな日本全国配送' : language === 'EN' ? 'Fast Delivery Services' : 'Layanan Pengiriman Cepat'}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-[#c41230]/40 border border-[#c41230] text-white font-bold">
                {language === 'JP' ? '🛵 デリバリー便 (最寄3駅以内)' : language === 'EN' ? '🛵 Delivery Service (Max 3 Stations)' : '🛵 Delivery Service (Max Jarak 3 Station)'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-700 text-white font-bold">
                {language === 'JP' ? '📦 宅急便 (ヤマト運輸・佐川急便)' : language === 'EN' ? '📦 Express (Yamato & Sagawa)' : '📦 Ekspedisi (Yamato & Sagawa)'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold">
                {language === 'JP' ? '🤝 代金引換 (COD)' : language === 'EN' ? '🤝 Cash on Delivery' : '🤝 COD (Cash on Delivery)'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              {language === 'JP'
                ? '店舗近隣エリア（最寄3駅以内）への即時デリバリー便や、全国47都道府県へのクール宅急便（冷凍・冷蔵便）に対応しています。'
                : language === 'EN'
                ? 'Instant local delivery for nearby areas (up to 3 stations), plus nationwide Cool Takkyubin minus-temperature courier across Japan.'
                : 'Pengiriman instan untuk area dekat toko (max 3 stasiun), serta pengiriman ekspedisi Cool Takkyubin bersuhu minus ke seluruh Jepang.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
