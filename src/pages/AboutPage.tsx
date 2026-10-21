import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Section3D, Card3D } from '../components/common/Motion3D';
import { assetUrl } from '../utils/assets';

export const AboutPage: React.FC = () => {
  const { language } = useLanguage();

  // Contact Form State (Integrated into About Us)
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

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const socialMediaList = [
    {
      name: 'WhatsApp Official',
      handle: '+62 857-7387-5762',
      url: 'https://wa.me/6285773875762',
      color: 'bg-[#25D366] text-white',
      desc: language === 'JP' ? 'お買い物相談＆即時配送確認' : language === 'EN' ? 'Fast shopping assistance & delivery check' : 'Konsultasi belanja kilat & info pengiriman',
      iconType: 'whatsapp'
    },
    {
      name: 'Instagram',
      handle: '@sembakonusantara.jp',
      url: 'https://www.instagram.com/sembakonusantara.jp/',
      color: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white',
      desc: language === 'JP' ? '最新商品・割引セール情報' : language === 'EN' ? 'Latest products, flash sales, & recipes' : 'Katalog terbaru, promo diskon, & resep nusantara',
      iconType: 'instagram'
    },
    {
      name: 'TikTok Official',
      handle: '@sembakonusantara.jp',
      url: 'https://www.tiktok.com/@sembakonusantara.jp',
      color: 'bg-black text-white',
      desc: language === 'JP' ? 'ハラール食品の開封・調理動画' : language === 'EN' ? 'Unboxing & cooking halal groceries' : 'Video unboxing frozen food & resep masak',
      iconType: 'tiktok'
    },
    {
      name: 'LINE Official',
      handle: '@sembakonusantara',
      url: 'https://line.me',
      color: 'bg-[#06C755] text-white',
      desc: language === 'JP' ? '初回¥500クーポン＆在庫速報' : language === 'EN' ? '¥500 welcome voucher & stock alerts' : 'Voucher belanja otomatis & pengumuman stok',
      iconType: 'line'
    },
    {
      name: 'Facebook Group',
      handle: 'Sahabat Sembako Nusantara Jepang',
      url: 'https://facebook.com',
      color: 'bg-[#1877F2] text-white',
      desc: language === 'JP' ? '在日インドネシア人コミュニティ' : language === 'EN' ? 'Indonesian diaspora community in Japan' : 'Komunitas diaspora, PPI, kenshusei, & tokutei ginou',
      iconType: 'facebook'
    },
    {
      name: 'YouTube Channel',
      handle: 'Sembako Nusantara TV',
      url: 'https://youtube.com',
      color: 'bg-[#FF0000] text-white',
      desc: language === 'JP' ? '決済ガイド・調理レシピ動画' : language === 'EN' ? 'Payment guides & cooking tutorials' : 'Tutorial bayar JPQR/Konbini & video masak',
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
            className="w-5 h-5 object-contain"
          />
        );
      case 'instagram':
        return (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        );
      case 'line':
        return (
          <span className="font-extrabold text-sm tracking-tighter">LINE</span>
        );
      case 'facebook':
        return (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      default:
        return <span className="material-symbols-outlined text-xl">share</span>;
    }
  };

  return (
    <div className="w-full space-y-12 sm:space-y-16 pb-20 overflow-hidden">
      {/* 1. HERO HEADER: TENTANG KAMI */}
      <section className="bg-gradient-to-b from-white to-[#FDF8F0] border-b border-[#EBE5DF] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-50 text-[#c41230] font-bold text-xs rounded-full border border-red-200 shadow-xs">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>
              {language === 'JP'
                ? '日本国内正規販売・ハラール専門店'
                : language === 'EN'
                ? 'Official Indonesian Halal Grocery in Japan'
                : 'Distributor Resmi Pangan Halal Indonesia di Jepang'}
            </span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-stone-900 tracking-tight">
            {language === 'JP'
              ? 'Sembako Nusantaraについて'
              : language === 'EN'
              ? 'About Sembako Nusantara'
              : 'Tentang Sembako Nusantara'}
          </h1>

          <p className="text-stone-600 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed">
            {language === 'JP'
              ? '日本全国47都道府県へ本場インドネシアの調味料、即席麺、冷凍食品をお届けする信頼のハラールストアです。'
              : language === 'EN'
              ? 'Connecting hearts across all 47 prefectures in Japan with authentic, certified halal Indonesian groceries.'
              : 'Jembatan cita rasa nusantara di negeri Sakura. Menyediakan sembako, bumbu asli, mie instan, dan frozen food halal berkualitas ke seluruh 47 prefektur Jepang.'}
          </p>
        </div>
      </section>

      {/* 2. SECTION: CERITA KAMI (OUR STORY & FOUNDER) */}
      <Section3D direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white via-[#FFFBF6] to-[#FFF3E3] rounded-3xl border border-[#EBE5DF] shadow-xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Story Text */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#c41230] bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                {language === 'JP' ? '私たちの物語' : language === 'EN' ? 'Our Story' : 'Cerita Kami'}
              </span>

              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-stone-900 tracking-tight leading-tight">
                {language === 'JP'
                  ? '故郷の味で結ぶ、日本とインドネシアの架け橋'
                  : language === 'EN'
                  ? 'Connecting Hearts through the Authentic Taste of Nusantara'
                  : 'Berawal Dari Rindu Cita Rasa Ibu, Menghubungkan Nusantara & Jepang'}
              </h2>

              <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
                <p>
                  {language === 'JP' ? (
                    <>
                      <strong>Sembako Nusantara</strong>は、在日インドネシア人コミュニティと<strong>代表創業者ジャンサン (Jangsan)</strong>の熱い想いから日本で創業されました。日本全国で頑張る技能実習生、特定技能外国人、留学生、そして在日ご家族が、本場インドネシアの温かい家庭の味を恋しく思う声に寄り添っています。
                    </>
                  ) : language === 'EN' ? (
                    <>
                      <strong>Sembako Nusantara</strong> was founded in Japan under the initiative and dedication of <strong>Founder & CEO Jangsan</strong> alongside the Indonesian diaspora team. We recognize that thousands of trainees, skilled workers, students, and families across Japan long for the warm taste of authentic home-cooked spices.
                    </>
                  ) : (
                    <>
                      <strong>Sembako Nusantara</strong> didirikan di Jepang atas inisiatif dan dedikasi mendalam dari <strong>Founder & CEO Jangsan</strong> bersama tim diaspora Indonesia. Kami melihat ribuan kenshusei (pemagang), pekerja terampil (tokutei ginou), mahasiswa, dan keluarga Indonesia di berbagai pelosok Jepang yang kerap merindukan kehangatan bumbu asli kampung halaman.
                    </>
                  )}
                </p>

                <p>
                  {language === 'JP' ? (
                    <>
                      手頃な価格と迅速な配送で本場のハラール食品、生鮮・冷凍品、伝統スパイスを手に入れることは、長年大きな課題でした。この課題を解決すべく、<strong>Sembako Nusantara</strong>は安心・安全で信頼できるワンストップのハラール食品流通サービスとして誕生しました。
                    </>
                  ) : language === 'EN' ? (
                    <>
                      Finding authentic halal groceries, rawon spices, rendang, sambal, and sweet soy sauce at fair prices with fast shipping has often been a challenge in Japan. From this concern, <strong>Sembako Nusantara</strong> was born as a modern, transparent, and trusted one-stop halal distribution solution.
                    </>
                  ) : (
                    <>
                      Menemukan bahan sembako halal, bumbu rawon, rendang, sambal uleg terasi, dan kecap manis otentik dengan harga wajar dan pengiriman cepat di Jepang seringkali menjadi tantangan tersendiri. Dari kepedulian inilah, <strong>Sembako Nusantara</strong> lahir sebagai solusi distributor pangan halal satu pintu yang modern, transparan, dan terpercaya.
                    </>
                  )}
                </p>

                <p>
                  {language === 'JP' ? (
                    <>
                      現在では、最新の物流体制とオンライン完結の注文システムにより、全国47都道府県のお客様へ故郷の味を食卓まで直接お届けしています。
                    </>
                  ) : language === 'EN' ? (
                    <>
                      Today, with modern warehousing and digital integration, we serve thousands of loyal customers across all 47 prefectures in Japan, bringing the taste of home straight to your dining table.
                    </>
                  ) : (
                    <>
                      Kini, dengan dukungan pergudangan modern dan integrasi digital, kami telah melayani ribuan pelanggan setia di seluruh 47 prefektur Jepang, menghadirkan rasa rumah langsung ke meja makan Anda.
                    </>
                  )}
                </p>
              </div>

              {/* Founder Quote Card */}
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mt-6 p-5 bg-white/95 backdrop-blur-sm rounded-2xl border border-amber-200/80 shadow-md flex items-center gap-4"
              >
                <img
                  src={assetUrl('avatar-jangsan.png')}
                  alt="Jangsan - Founder & CEO Sembako Nusantara"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#c41230] shadow-md shrink-0 transition-transform hover:scale-105"
                />
                <div>
                  <p className="text-xs sm:text-sm italic text-stone-800 font-medium leading-relaxed">
                    {language === 'JP'
                      ? '「異国の地で味わうインドネシアの伝統料理は、ただ空腹を満たすだけでなく、故郷への郷愁を癒やし、日本での夢に向かって前進する力となるのです。」'
                      : language === 'EN'
                      ? '"Every bite of authentic Indonesian food abroad does more than satisfy hunger; it comforts homesickness and fuels the spirit to achieve our dreams in the Land of the Rising Sun."'
                      : '"Setiap suapan makanan khas Indonesia di perantauan bukan sekadar mengenyangkan, melainkan obat rindu dan sumber semangat untuk meraih cita-cita di negeri Sakura."'}
                  </p>
                  <p className="text-xs font-bold text-[#c41230] mt-1.5 flex items-center gap-1">
                    <span>
                      {language === 'JP'
                        ? '— 代表創業者 ジャンサン (Jangsan)'
                        : language === 'EN'
                        ? '— Jangsan, Founder & CEO Sembako Nusantara'
                        : '— Jangsan, Founder & CEO Sembako Nusantara'}
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Graphic & Stat Badges */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <motion.div
                whileHover={{ rotateY: 5, rotateX: -3, scale: 1.02 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="bg-white p-6 rounded-3xl border border-[#EBE5DF] shadow-xl text-center space-y-4"
              >
                <div className="p-4 bg-[#FDF8F0] rounded-2xl border border-[#EBE5DF]">
                  <img
                    src={assetUrl('logo-transparent.png')}
                    alt="Sembako Nusantara"
                    className="w-48 h-auto object-contain mx-auto drop-shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-red-50 rounded-xl transition-transform">
                    <span className="block font-heading font-extrabold text-xl sm:text-2xl text-[#c41230]">47</span>
                    <span className="text-[11px] text-stone-600 font-bold">
                      {language === 'JP' ? '47都道府県対応' : language === 'EN' ? 'Prefectures Served' : 'Prefektur Terlayani'}
                    </span>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-emerald-50 rounded-xl transition-transform">
                    <span className="block font-heading font-extrabold text-xl sm:text-2xl text-emerald-700">100%</span>
                    <span className="text-[11px] text-stone-600 font-bold">
                      {language === 'JP' ? 'ハラール100%保証' : language === 'EN' ? 'Halal Certified' : 'Jaminan Halal'}
                    </span>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-amber-50 rounded-xl transition-transform">
                    <span className="block font-heading font-extrabold text-xl sm:text-2xl text-amber-700">100+</span>
                    <span className="text-[11px] text-stone-600 font-bold">
                      {language === 'JP' ? '100種以上の商品' : language === 'EN' ? 'Product Varieties' : 'Varian Produk SKU'}
                    </span>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-blue-50 rounded-xl transition-transform">
                    <span className="block font-heading font-extrabold text-xl sm:text-2xl text-blue-700">24 Jam</span>
                    <span className="text-[11px] text-stone-600 font-bold">
                      {language === 'JP' ? 'スピード即日発送' : language === 'EN' ? 'Fast Delivery' : 'Pengiriman Kilat'}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Section3D>

      {/* 3. SECTION: VISI & MISI KAMI (MOVED FROM HOMEPAGE) */}
      <Section3D direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c41230] bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
            {language === 'JP' ? '企業理念' : language === 'EN' ? 'Vision & Mission' : 'Visi & Misi'}
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-stone-900 mt-4 tracking-tight">
            {language === 'JP'
              ? 'Sembako Nusantaraのビジョンとミッション'
              : language === 'EN'
              ? 'Our Vision & Mission'
              : 'Komitmen & Arah Langkah Kami'}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed">
            {language === 'JP'
              ? '日本に暮らす全ての在日インドネシア人およびエスニック料理ファンの皆様へ、最高品質のハラール食品をお届けする信頼のパートナーを目指します。'
              : language === 'EN'
              ? 'To be a trusted partner in providing high-quality halal Indonesian food for the diaspora and culinary lovers across Japan.'
              : 'Menjadi sahabat terpercaya dalam memenuhi kebutuhan pangan halal berkualitas bagi seluruh masyarakat Indonesia dan pencinta kuliner Nusantara di Jepang.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision Card */}
          <Card3D delay={0.1}>
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EBE5DF] shadow-md hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-red-200/30 to-transparent rounded-bl-full pointer-events-none"></div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#c41230] flex items-center justify-center font-bold text-xl mb-6 shadow-xs">
                  <span className="material-symbols-outlined text-2xl">visibility</span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-stone-900 mb-4">
                  {language === 'JP' ? 'ビジョン' : language === 'EN' ? 'Vision' : 'Visi'}
                </h3>
                <p className="text-stone-800 text-base sm:text-lg font-medium leading-relaxed">
                  {language === 'JP'
                    ? '日本国内におけるインドネシア食品の最も信頼される第一選択ストアとなること。'
                    : language === 'EN'
                    ? 'To become the most trusted Indonesian grocery store and the primary choice in Japan.'
                    : 'Menjadi toko produk Indonesia terpercaya dan pilihan utama masyarakat Indonesia di Jepang.'}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-[#c41230]">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>
                  {language === 'JP'
                    ? '在日インドネシア人コミュニティの第一選択'
                    : language === 'EN'
                    ? 'First Choice for Indonesian Diaspora in Japan'
                    : 'Pilihan Utama Masyarakat Indonesia di Jepang'}
                </span>
              </div>
            </div>
          </Card3D>

          {/* Mission Card */}
          <Card3D delay={0.2}>
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EBE5DF] shadow-md hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-emerald-200/30 to-transparent rounded-bl-full pointer-events-none"></div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl mb-6 shadow-xs">
                  <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-stone-900 mb-4">
                  {language === 'JP' ? 'ミッション' : language === 'EN' ? 'Mission' : 'Misi'}
                </h3>
                <p className="text-stone-800 text-base sm:text-lg font-medium leading-relaxed">
                  {language === 'JP'
                    ? '簡単・迅速・安心のサービスで、高品質なインドネシア特産品をお届けすること。'
                    : language === 'EN'
                    ? 'Providing premium Indonesian products with seamless, fast, and trustworthy services.'
                    : 'Menyediakan produk Nusantara yang berkualitas dengan pelayanan yang mudah, cepat, dan terpercaya.'}
                </p>
                <div className="mt-6 space-y-2 text-stone-600 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    <span>
                      {language === 'JP'
                        ? '100%本物志向・高品質のハラール認定食品。'
                        : language === 'EN'
                        ? '100% authentic, high quality halal Indonesian food.'
                        : 'Produk halal Indonesia 100% otentik dan bermutu tinggi.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                    <span>
                      {language === 'JP'
                        ? '在日コミュニティの皆様へ簡単・スピーディで安心な配送サービス。'
                        : language === 'EN'
                        ? 'Convenient, fast, and reliable delivery for the diaspora.'
                        : 'Pelayanan mudah, cepat, dan terpercaya bagi diaspora.'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span className="material-symbols-outlined text-sm">favorite</span>
                <span>
                  {language === 'JP'
                    ? '簡単 • スピーディ • 安心信頼'
                    : language === 'EN'
                    ? 'Easy • Fast • Trusted'
                    : 'Mudah • Cepat • Terpercaya'}
                </span>
              </div>
            </div>
          </Card3D>
        </div>
      </Section3D>

      {/* 4. SECTION: KEUNGGULAN KAMI (6 PILARS OF TRUST) */}
      <Section3D direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c41230] bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
            {language === 'JP' ? '当店の強み' : language === 'EN' ? 'Why Sembako Nusantara' : 'Keunggulan Kami'}
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-stone-900 mt-4 tracking-tight">
            {language === 'JP'
              ? '安心してお買い物いただける6つの理由'
              : language === 'EN'
              ? '6 Reasons to Trust Sembako Nusantara'
              : 'Standar Mutu & Keunggulan Layanan Kami'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#EBE5DF] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
              {language === 'JP' ? '100% 公式ハラール認証' : language === 'EN' ? '100% Certified Halal' : '100% Bersertifikat Halal Resmi'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'JP'
                ? 'すべての食品・調味料は公式ハラール基準を遵守。ムスリムの皆様も安心してお選びいただけます。'
                : language === 'EN'
                ? 'All grocery items strictly comply with official halal standards for your peace of mind.'
                : 'Setiap produk makanan, bumbu, mie instan, dan frozen food terjamin kehalalannya.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBE5DF] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#c41230] mb-4">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
              {language === 'JP' ? '全国47都道府県へ即日発送' : language === 'EN' ? 'Fast Delivery across Japan' : 'Pengiriman Kilat 47 Prefektur'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'JP'
                ? 'ヤマト運輸・佐川急便と連携し、クール便＆常温便を北海道から沖縄まで迅速発送。'
                : language === 'EN'
                ? 'Partnered with Yamato & Sagawa Express for both normal and Cool Takkyubin delivery.'
                : 'Bekerja sama dengan ekspedisi resmi Yamato & Sagawa, mendukung Cool Takkyubin.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBE5DF] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
              <span className="material-symbols-outlined text-2xl">storefront</span>
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
              {language === 'JP' ? '本場インドネシア直輸入' : language === 'EN' ? 'Direct Authentic Import' : 'Produk Asli Langsung Produsen'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'JP'
                ? 'Indomie、ABC、Bamboe、Karaなど、インドネシアのトップブランド商品を網羅。'
                : language === 'EN'
                ? 'Directly imported genuine spices, sauces, snacks, and daily staples from Indonesia.'
                : 'Pilihan lengkap 100+ SKU bumbu otentik, rempah, kerupuk, hingga santan kental.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBE5DF] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
              {language === 'JP' ? '日本品質の丁寧な梱包' : language === 'EN' ? 'Japanese Quality Packaging' : 'Kemasan Rapi Standar Jepang'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'JP'
                ? '緩衝材や保冷剤を用いた徹底した梱包で、割れ物や冷凍品も安全にお手元へ届きます。'
                : language === 'EN'
                ? 'Double-layer bubble wrap, insulated thermal boxes, and dry ice ensure zero damage.'
                : 'Pengemasan khusus bubble wrap tebal dan insulation box menjaga keutuhan botol kaca.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBE5DF] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
              {language === 'JP' ? '3言語対応カスタマーサポート' : language === 'EN' ? 'Friendly 3-Language Support' : 'Layanan Ramah 3 Bahasa'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'JP'
                ? 'WhatsAppやLINEにてインドネシア語・日本語・英語で親切にご案内いたします。'
                : language === 'EN'
                ? 'Customer service assistance in Indonesian, Japanese, and English.'
                : 'Konsultasi pesanan dan bantuan pengiriman dilayani ramah oleh tim kami.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EBE5DF] shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
              <span className="material-symbols-outlined text-2xl">qr_code_2</span>
            </div>
            <h3 className="font-heading font-bold text-base text-stone-900 mb-2">
              {language === 'JP' ? '多彩なキャッシュレス決済' : language === 'EN' ? 'Flexible Digital Payments' : 'Metode Pembayaran Lengkap'}
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {language === 'JP'
                ? 'JPQR、PayPay、クレジットカード、ゆうちょ銀行振込、代金引換（COD）に対応。'
                : language === 'EN'
                ? 'Supporting JPQR / QRIS, PayPay, Credit Cards, Yucho Bank Transfer, and COD.'
                : 'Mendukung pembayaran JPQR, PayPay, Kartu Kredit, Bank Yucho, hingga COD.'}
            </p>
          </div>
        </div>
      </Section3D>

      {/* 5. SECTION: KONTAK KAMI, LOKASI & FORM PESAN (MOVED FROM CONTACT PAGE) */}
      <Section3D direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div id="contact" className="bg-white rounded-3xl border border-[#EBE5DF] shadow-xl p-8 sm:p-12 lg:p-14">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#c41230] bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
              {language === 'JP' ? 'お問い合わせ・店舗情報' : language === 'EN' ? 'Contact & Store Location' : 'Hubungi Kami & Info Toko'}
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-stone-900 mt-4 tracking-tight">
              {language === 'JP'
                ? 'ご質問やお困りごとはお気軽にどうぞ'
                : language === 'EN'
                ? 'Get in Touch with Sembako Nusantara'
                : 'Layanan Pelanggan & Alamat Resmi'}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              {language === 'JP'
                ? 'WhatsApp、LINE、または下記フォームよりお気軽にご連絡ください。専任スタッフが迅速に対応いたします。'
                : language === 'EN'
                ? 'Feel free to reach us via WhatsApp, LINE, or the direct form below. Our team is happy to help!'
                : 'Punya pertanyaan stok, request produk tertentu, atau kendala pesanan? Kami siap membantu dengan senang hati.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Contact Info & Address */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#FAF5EC] p-6 rounded-2xl border border-[#E8DFC9] space-y-4">
                <h3 className="font-heading font-bold text-lg text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c41230]">store</span>
                  <span>{language === 'JP' ? '店舗・配送センター所在地' : language === 'EN' ? 'Store & Fulfillment Center' : 'Alamat Toko & Gudang'}</span>
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-stone-700">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-base text-[#c41230] shrink-0 mt-0.5">location_on</span>
                    <div>
                      <p className="font-bold text-stone-900">〒144-0051 東京都大田区西蒲田5丁目9-16</p>
                      <p className="text-stone-500 text-xs">Tokyo, Ota-ku, Nishikamata 5-9-16, Japan</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-base text-[#c41230]">schedule</span>
                    <span>
                      {language === 'JP'
                        ? '営業時間: 年中無休・24時間受付'
                        : language === 'EN'
                        ? 'Hours: Open 24/7 Daily'
                        : 'Jam Operasional: Buka Setiap Hari (24 Jam)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-base text-emerald-600">chat</span>
                    <a
                      href="https://wa.me/6285773875762"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#c41230] hover:underline"
                    >
                      WhatsApp: +62 857-7387-5762
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-base text-[#c41230]">mail</span>
                    <span>support@sembako-nusantara.jp</span>
                  </div>
                </div>
              </div>

              {/* Social Channels Grid */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 mb-3">
                  {language === 'JP' ? '公式ソーシャルメディア' : language === 'EN' ? 'Official Social Media' : 'Media Sosial Resmi'}
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {socialMediaList.map((soc) => (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition-all flex items-center gap-2.5 group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${soc.color} group-hover:scale-110 transition-transform`}>
                        {renderSocialIcon(soc.iconType)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{soc.name}</p>
                        <p className="text-[10px] text-stone-500 truncate">{soc.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Direct Message Form (WhatsApp Auto-Send) */}
            <div className="lg:col-span-7 bg-[#FAF5EC]/50 p-6 sm:p-8 rounded-2xl border border-[#E8DFC9]">
              <h3 className="font-heading font-bold text-lg text-stone-900 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230]">send</span>
                <span>{language === 'JP' ? '直接お問い合わせフォーム' : language === 'EN' ? 'Send Direct Inquiry' : 'Form Kirim Pesan Cepat'}</span>
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                {language === 'JP'
                  ? '入力された内容は、自動的に公式WhatsAppのメッセージとして生成されスムーズに送信されます。'
                  : language === 'EN'
                  ? 'Your message will be formatted and opened directly in official WhatsApp for instant response.'
                  : 'Pesan otomatis diformat dan diteruskan langsung ke WhatsApp resmi CS Sembako Nusantara.'}
              </p>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span>
                    {language === 'JP'
                      ? 'WhatsAppが起動しました。メッセージを送信してください。'
                      : language === 'EN'
                      ? 'WhatsApp window opened. Please hit send to connect with us!'
                      : 'WhatsApp telah terbuka. Silakan tekan kirim untuk terhubung dengan CS!'}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'JP' ? 'お名前 *' : language === 'EN' ? 'Full Name *' : 'Nama Lengkap *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={language === 'JP' ? '例: 山田 太郎' : 'Contoh: Willy Aryana'}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#c41230] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'JP' ? '電話番号 / メール *' : language === 'EN' ? 'Phone / WhatsApp *' : 'No. WhatsApp / HP *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phoneOrEmail}
                      onChange={(e) => setFormData({ ...formData, phoneOrEmail: e.target.value })}
                      placeholder="08123456789 / 080..."
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#c41230] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'JP' ? 'お住まいの都道府県' : language === 'EN' ? 'Prefecture in Japan' : 'Tempat Tinggal (Prefektur)'}
                    </label>
                    <input
                      type="text"
                      value={formData.prefecture}
                      onChange={(e) => setFormData({ ...formData, prefecture: e.target.value })}
                      placeholder="Tokyo, Osaka, Aichi, Gunma..."
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#c41230] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {language === 'JP' ? 'お問い合わせ内容' : language === 'EN' ? 'Inquiry Subject' : 'Kategori Pertanyaan'}
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#c41230] outline-none cursor-pointer"
                    >
                      <option value="Stok makanan">{language === 'JP' ? '食品の在庫確認' : language === 'EN' ? 'Food Stock Availability' : 'Ketersediaan Stok Makanan'}</option>
                      <option value="Pengiriman & Ekspedisi">{language === 'JP' ? '配送・宅急便について' : language === 'EN' ? 'Shipping & Yamato Courier' : 'Pengiriman & Ekspedisi Yamato/Sagawa'}</option>
                      <option value="Metode Pembayaran">{language === 'JP' ? 'お支払い方法 (JPQR/COD)' : language === 'EN' ? 'Payment Methods (JPQR/COD)' : 'Metode Pembayaran (JPQR / COD / Yucho)'}</option>
                      <option value="Request Produk Khusus">{language === 'JP' ? '特別リクエスト商品' : language === 'EN' ? 'Special Product Request' : 'Request Produk Khusus'}</option>
                      <option value="Kemitraan & Reseller">{language === 'JP' ? '提携・大口注文' : language === 'EN' ? 'Partnership & Wholesale' : 'Kemitraan Diaspora & Grosir'}</option>
                      <option value="Lainnya">{language === 'JP' ? 'その他' : language === 'EN' ? 'Other Inquiry' : 'Pertanyaan Lainnya'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {language === 'JP' ? 'メッセージ内容 *' : language === 'EN' ? 'Message *' : 'Isi Pesan / Pertanyaan *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={language === 'JP' ? 'お問い合わせ内容をご記入ください...' : 'Tuliskan pertanyaan atau kebutuhan belanja Anda...'}
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#c41230] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <img src={assetUrl('whatsapp-icon.png')} alt="WhatsApp" className="w-5 h-5 object-contain" />
                  <span>
                    {language === 'JP'
                      ? 'WhatsAppで問い合わせを送信'
                      : language === 'EN'
                      ? 'Send via Official WhatsApp'
                      : 'Kirim Pesan ke WhatsApp Resmi'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </Section3D>
    </div>
  );
};
