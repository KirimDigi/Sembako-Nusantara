import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phoneOrEmail: '',
    prefecture: 'Tokyo',
    subject: 'Pertanyaan Produk / Stok',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: '',
        phoneOrEmail: '',
        prefecture: 'Tokyo',
        subject: 'Pertanyaan Produk / Stok',
        message: ''
      });
    }, 2500);
  };

  const contactChannels = [
    {
      title: 'Customer Service WhatsApp',
      desc: 'Layanan konsultasi pesanan, request produk bumbu, & konfirmasi transfer JPQR/PayPay.',
      contact: '+62 857-7387-5762',
      actionUrl: 'https://wa.me/6285773875762?text=Halo%20Sembako%20Nusantara,%20saya%20ingin%20bertanya',
      actionText: 'Chat WhatsApp (24 Jam)',
      icon: 'chat',
      badge: '24 Jam Nonstop',
      badgeColor: 'bg-emerald-100 text-[#15803D]'
    },
    {
      title: 'LINE Official Account',
      desc: 'Tambahkan teman di LINE untuk klaim voucher diskon ¥500 & notifikasi stok baru.',
      contact: '@sembakonusantara',
      actionUrl: 'https://line.me',
      actionText: 'Buka LINE Official',
      icon: 'mark_chat_unread',
      badge: 'Voucher ¥500',
      badgeColor: 'bg-green-100 text-green-800'
    },
    {
      title: 'Email Resmi Support',
      desc: 'Bantuan invoice, faktur pajak konsumsi Jepang (領収書), dan pertanyaan kemitraan diaspora.',
      contact: 'support@sembako-nusantara.jp',
      actionUrl: 'mailto:support@sembako-nusantara.jp',
      actionText: 'Kirim Email',
      icon: 'mail',
      badge: 'Resmi',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Hub & Gudang Logistik Kanto',
      desc: 'Fulfillment center pengiriman kilat Cool Takkyubin ke seluruh 47 prefektur Jepang.',
      contact: 'Tokyo & Okayama Hub',
      actionUrl: 'https://maps.google.com',
      actionText: 'Lihat di Google Maps',
      icon: 'location_on',
      badge: 'Fulfillment Center',
      badgeColor: 'bg-red-100 text-[#c41230]'
    }
  ];

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
      handle: '@sembakonusantara',
      url: 'https://tiktok.com',
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
            src="/whatsapp-icon.png"
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
              src="/mascot-love.png"
              alt="Mascot Sembako Nusantara Love"
              className="w-full h-auto object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Main Contact Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactChannels.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-6 border border-[#EBE5DF] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-[#c41230] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.badgeColor}`}>
                  {c.badge}
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-stone-900">{c.title}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">{c.desc}</p>
              <div className="font-mono font-bold text-xs text-stone-900 pt-1">{c.contact}</div>
            </div>

            <div className="pt-5 border-t border-stone-100 mt-5">
              <a
                href={c.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-[#c41230] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{c.actionText}</span>
                <span className="material-symbols-outlined text-xs">arrow_outward</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Social Media Channels Section */}
      <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c41230]">
            Official Social Media
          </span>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-stone-900">
            Terhubung Bersama Komunitas Kami di Media Sosial
          </h2>
          <p className="text-xs text-stone-500">
            Ikuti media sosial resmi Sembako Nusantara Jepang untuk video resep kuliner, unboxing paket sembako, info restok sambal & frozen food, serta giveaway berkala!
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
              <span>Kirim Pesan Langsung ke Manajemen</span>
            </h3>
            <p className="text-xs text-stone-500">
              Isi formulir berikut dan tim kami akan merespons dalam waktu maksimal 15-30 menit.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fade-in">
              <span className="material-symbols-outlined text-4xl text-[#15803D]">check_circle</span>
              <h4 className="font-bold text-stone-900 text-base">Pesan Anda Berhasil Terkirim!</h4>
              <p className="text-xs text-stone-600">
                Terima kasih. Tim Customer Support Sembako Nusantara Jepang akan segera menghubungi Anda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                    Nama Anda / お名前:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Willy Pratama"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                    No. WhatsApp / Email / LINE:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneOrEmail}
                    onChange={(e) => setFormData({ ...formData, phoneOrEmail: e.target.value })}
                    placeholder="+81 80-XXXX-XXXX atau email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                    Prefektur Tempat Tinggal di Jepang:
                  </label>
                  <input
                    type="text"
                    value={formData.prefecture}
                    onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                    placeholder="Contoh: Tokyo, Okayama, Osaka, dll."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                    Kategori Pertanyaan:
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                  >
                    <option value="Pertanyaan Produk / Stok">Pertanyaan Produk / Stok Makanan</option>
                    <option value="Pelacakan Pengiriman Yamato/Sagawa">Pelacakan Pengiriman Paket</option>
                    <option value="Bantuan Pembayaran JPQR / PayPay">Bantuan Pembayaran JPQR / Konbini</option>
                    <option value="Pendaftaran Mitra Afiliasi Diaspora">Pendaftaran Mitra Komunitas</option>
                    <option value="Kritik, Saran & Request Barang">Request Barang / Komentar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1.5 uppercase text-[11px]">
                  Isi Pesan Anda:
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tuliskan pertanyaan atau kebutuhan sembako halal Anda di sini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                <span>Kirimkan Pesan Sekarang</span>
              </button>
            </form>
          )}
        </div>

        {/* Operating Hours & Address Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#141414] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-stone-800">
            <div>
              <span className="text-[10px] font-bold text-[#c41230] uppercase tracking-widest bg-red-950/60 px-2.5 py-1 rounded-full border border-red-900/50">
                Informasi Kantor & Logistik
              </span>
              <h3 className="font-heading font-bold text-lg text-white mt-2">
                Sembako Nusantara Jepang
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Penyedia sembako & frozen food halal terlengkap se-Jepang.
              </p>
            </div>

            <div className="space-y-4 text-xs border-t border-stone-800 pt-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c41230] text-lg shrink-0">
                  schedule
                </span>
                <div>
                  <p className="font-bold text-stone-200">Jam Operasional & Pelayanan:</p>
                  <p className="text-emerald-400 font-semibold mt-0.5">Buka Setiap Hari 24 Jam</p>
                  <p className="text-stone-400 text-[11px]">Pengiriman ekspedisi dilakukan setiap hari pukul 09.00 - 18.00 JST.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c41230] text-lg shrink-0">
                  location_on
                </span>
                <div>
                  <p className="font-bold text-stone-200">Hub Tokyo (Kanto):</p>
                  <p className="text-stone-400 text-[11px]">〒110-0015 Tokyo, Taito City, Higashiueno 1-chome</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c41230] text-lg shrink-0">
                  warehouse
                </span>
                <div>
                  <p className="font-bold text-stone-200">Hub Okayama (Chugoku/Kansai):</p>
                  <p className="text-stone-400 text-[11px]">〒700-0821 Okayama-shi, Kita-ku Fulfillment Center</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#c41230] text-lg shrink-0">
                  verified_user
                </span>
                <div>
                  <p className="font-bold text-stone-200">Jaminan Mutu & Halal:</p>
                  <p className="text-stone-400 text-[11px]">Semua produk 100% halal resmi & berizin edar di Jepang.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
