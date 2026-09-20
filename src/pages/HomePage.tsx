import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Section3D, Card3D, StaggerContainer3D, StaggerItem3D } from '../components/common/Motion3D';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO HEADER SECTION with 3D Motion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 70, rotateX: 18, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
          className="relative min-h-[300px] lg:min-h-[360px] flex flex-col justify-center p-2 sm:p-6 bg-transparent"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Tags, Title, Subtitle, CTAs with 3D Stagger */}
            <motion.div
              initial={{ opacity: 0, x: -50, rotateY: 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7 lg:col-span-8 space-y-4"
            >
              {/* Tags */}
              <div className="flex items-center gap-2 mb-2">
                <motion.span
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#c41230] text-white text-xs uppercase tracking-wider font-bold shadow-sm"
                >
                  <span className="material-symbols-outlined text-xs">storefront</span>
                  {t('hero_badge_agent')}
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-emerald-200"
                >
                  <span className="material-symbols-outlined text-xs">verified</span>
                  {t('hero_badge_halal')}
                </motion.span>
              </div>

              {/* Hero Title */}
              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-[50px] xl:text-[56px] text-stone-900 leading-[1.3] sm:leading-[1.35] tracking-tight max-w-3xl">
                {language === 'ID' ? (
                  <>
                    Cita Rasa Otentik Nusantara Langsung di Meja Makan Anda di{' '}
                    <span className="inline-block whitespace-nowrap">
                      <span
                        className="font-black text-white"
                        style={{
                          WebkitTextStroke: '2.5px #1c1917',
                          paintOrder: 'stroke fill',
                          textShadow: '0 2px 4px rgba(0,0,0,0.08)'
                        }}
                      >
                        Jep
                      </span>
                      <span className="font-black text-[#c41230]">ang</span>
                    </span>
                    ! 🏮
                  </>
                ) : (
                  t('hero_title')
                )}
              </h1>

              <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
                {t('hero_subtitle')}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-row items-center gap-3 max-w-md">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} className="flex-1 sm:flex-initial">
                  <Link
                    to="/catalog"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#c41230] hover:bg-[#9a0021] text-white px-6 sm:px-8 py-3 rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all cursor-pointer text-center whitespace-nowrap"
                  >
                    <span>{t('hero_cta_shop')}</span>
                    <span className="material-symbols-outlined text-xs sm:text-sm">arrow_forward</span>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} className="flex-1 sm:flex-initial">
                  <Link
                    to="/contact"
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-5 sm:px-7 py-3 rounded-full font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all text-center whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-xs sm:text-sm text-[#c41230]">support_agent</span>
                    <span>{t('hero_cta_contact')}</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column: Slow Bouncing Ball Mascot */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center justify-center py-6 relative">
              {/* Mascot Image with Slow Smooth Ball Bounce */}
              <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 relative flex items-center justify-center animate-bounce-ball-slow z-10 cursor-pointer hover:scale-105 transition-transform">
                <img
                  src="/mascot.png"
                  alt="Mascot Sembako Nusantara"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>

              {/* Synchronized Ground Shadow */}
              <div className="w-36 sm:w-44 h-5 bg-stone-900/20 rounded-[100%] blur-[5px] animate-bounce-shadow-slow -mt-2"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. SECTION: KENAPA HARUS BELANJA DI SEMBAKO NUSANTARA with 3D Tilt Cards */}
      <Section3D direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#c41230] bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
            {language === 'JP' ? '当店のこだわり' : language === 'EN' ? 'Why Choose Us' : 'Keunggulan Kami'}
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-stone-900 mt-4 tracking-tight">
            {language === 'JP'
              ? 'Sembako Nusantaraが選ばれる理由'
              : language === 'EN'
              ? 'Why Shop at Sembako Nusantara?'
              : 'Kenapa Harus Belanja di Sembako Nusantara?'}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed">
            {language === 'JP'
              ? '安心のハラール認証、迅速な日本全国配送、そして本場インドネシアの味をそのままお届けします。'
              : language === 'EN'
              ? 'Official Halal certification, express delivery across Japan, and authentic taste direct to your table.'
              : 'Kami hadir memberikan kemudahan, kepastian mutu halal, dan layanan terpercaya bagi seluruh sahabat Nusantara di Jepang.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card3D delay={0.05}>
            <div className="bg-white p-7 rounded-3xl border border-[#EBE5DF] shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-3xl">verified</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">
                  {language === 'JP' ? '100% 公式ハラール認証' : language === 'EN' ? '100% Certified Halal' : '100% Bersertifikat Halal Resmi'}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {language === 'JP'
                    ? 'すべての食品・調味料は厳格なハラール基準をクリア。ムスリムの皆様も安心してお買い物いただけます。'
                    : language === 'EN'
                    ? 'All grocery items strictly comply with official halal standards for your total peace of mind.'
                    : 'Setiap produk makanan, bumbu, mie instan, dan frozen food terjamin kehalalannya sesuai syariat.'}
                </p>
              </div>
            </div>
          </Card3D>

          {/* Card 2 */}
          <Card3D delay={0.1}>
            <div className="bg-white p-7 rounded-3xl border border-[#EBE5DF] shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#c41230] mb-5 group-hover:scale-110 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-3xl">local_shipping</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">
                  {language === 'JP' ? '日本全国47都道府県へ即日発送' : language === 'EN' ? 'Fast Delivery to 47 Prefectures' : 'Pengiriman Kilat 47 Prefektur'}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {language === 'JP'
                    ? 'ヤマト運輸＆佐川急便と提携し、北海道から沖縄までクール宅急便＆通常便を最短即日発送。'
                    : language === 'EN'
                    ? 'Partnered with Yamato & Sagawa Express with Cool Takkyubin support across all prefectures.'
                    : 'Bekerja sama dengan ekspedisi resmi Yamato & Sagawa. Mendukung Cool Takkyubin untuk frozen food beku.'}
                </p>
              </div>
            </div>
          </Card3D>

          {/* Card 3 */}
          <Card3D delay={0.15}>
            <div className="bg-white p-7 rounded-3xl border border-[#EBE5DF] shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-3xl">storefront</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">
                  {language === 'JP' ? '本場インドネシア直輸入' : language === 'EN' ? 'Direct Authentic Import' : 'Produk Asli Langsung dari Produsen'}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {language === 'JP'
                    ? 'Indomie、ABC、Bamboe、Karaなど、インドネシアのトップブランド商品を豊富に取り揃えております。'
                    : language === 'EN'
                    ? 'Directly imported genuine spices, sauces, snacks, and daily necessities from Indonesia.'
                    : 'Pilihan lengkap lebih dari 100+ SKU bumbu otentik, rempah khas nusantara, kerupuk, hingga santan kental.'}
                </p>
              </div>
            </div>
          </Card3D>

          {/* Card 4 */}
          <Card3D delay={0.2}>
            <div className="bg-white p-7 rounded-3xl border border-[#EBE5DF] shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-3xl">inventory_2</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">
                  {language === 'JP' ? '日本品質の丁寧な梱包' : language === 'EN' ? 'Japanese Quality Packaging' : 'Kemasan Aman & Rapi Standar Jepang'}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {language === 'JP'
                    ? '衝撃吸収材や保冷剤を用いた徹底した梱包技術で、割れ物や冷凍品も安全にお手元へお届けします。'
                    : language === 'EN'
                    ? 'Double-layer bubble wrap, insulated boxes, and dry ice ensure zero damage during transit.'
                    : 'Pengemasan khusus bubble wrap tebal dan insulation box menjaga keutuhan botol kaca dan kesegaran makanan.'}
                </p>
              </div>
            </div>
          </Card3D>

          {/* Card 5 */}
          <Card3D delay={0.25}>
            <div className="bg-white p-7 rounded-3xl border border-[#EBE5DF] shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">
                  {language === 'JP' ? '3言語対応カスタマーサポート' : language === 'EN' ? 'Friendly 3-Language Support' : 'Layanan Ramah 3 Bahasa (ID/JP/EN)'}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {language === 'JP'
                    ? 'LINEやWhatsApp、お電話にてインドネシア語・日本語・英語で親切にご案内いたします。'
                    : language === 'EN'
                    ? 'Our customer service team is ready to assist via WhatsApp & LINE in Indonesian, Japanese, and English.'
                    : 'Konsultasi pesanan, request item khusus, dan kendala pengiriman dilayani ramah oleh tim kami.'}
                </p>
              </div>
            </div>
          </Card3D>

          {/* Card 6 */}
          <Card3D delay={0.3}>
            <div className="bg-white p-7 rounded-3xl border border-[#EBE5DF] shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-5 group-hover:scale-110 transition-transform shadow-xs">
                  <span className="material-symbols-outlined text-3xl">qr_code_2</span>
                </div>
                <h3 className="font-heading font-bold text-lg text-stone-900 mb-2">
                  {language === 'JP' ? '多彩なキャッシュレス決済' : language === 'EN' ? 'Flexible Digital Payments' : 'Metode Pembayaran Digital Lengkap'}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {language === 'JP'
                    ? 'JPQR、PayPay、クレジットカード、ゆうちょ銀行振込、代金引換（COD）に対応。'
                    : language === 'EN'
                    ? 'Supporting JPQR / JAPAN QRIS, PayPay, Credit Cards, Yucho Bank Transfer, and COD.'
                    : 'Mendukung pembayaran JPQR, PayPay, Kartu Kredit, Bank Transfer Yucho Post, hingga COD.'}
                </p>
              </div>
            </div>
          </Card3D>
        </div>
      </Section3D>

      {/* 3. SECTION: CERITA KAMI (OUR STORY) with 3D Depth Card */}
      <Section3D direction="left" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-white via-[#FFFBF6] to-[#FFF3E3] rounded-3xl border border-[#EBE5DF] shadow-xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          {/* Subtle Ambient 3D Glow */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Story Text */}
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
                  <strong>Sembako Nusantara</strong> didirikan di Jepang atas inisiatif dan dedikasi mendalam dari <strong>Founder & CEO Jangsan</strong> bersama tim diaspora Indonesia. Kami melihat ribuan kenshusei (pemagang), pekerja terampil (tokutei ginou), mahasiswa, dan keluarga Indonesia di berbagai pelosok Jepang yang kerap merindukan kehangatan bumbu asli kampung halaman.
                </p>
                <p>
                  Menemukan bahan sembako halal, bumbu rawon, rendang, sambal uleg terasi, dan kecap manis otentik dengan harga wajar dan pengiriman cepat di Jepang seringkali menjadi tantangan tersendiri. Dari kepedulian inilah, <strong>Sembako Nusantara</strong> lahir sebagai solusi distributor pangan halal satu pintu yang modern, transparan, dan terpercaya.
                </p>
                <p>
                  Kini, dengan dukungan pergudangan modern dan integrasi digital, kami telah melayani ribuan pelanggan setia di seluruh 47 prefektur Jepang, menghadirkan rasa rumah langsung ke meja makan Anda.
                </p>
              </div>

              {/* Founder Quote Card with 3D Hover */}
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mt-6 p-5 bg-white/95 backdrop-blur-sm rounded-2xl border border-amber-200/80 shadow-md flex items-center gap-4"
              >
                <img
                  src="/avatar-jangsan.png"
                  alt="Jangsan - Founder & CEO Sembako Nusantara"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#c41230] shadow-md shrink-0 transition-transform hover:scale-105"
                />
                <div>
                  <p className="text-xs sm:text-sm italic text-stone-800 font-medium leading-relaxed">
                    "Setiap suapan makanan khas Indonesia di perantauan bukan sekadar mengenyangkan, melainkan obat rindu dan sumber semangat untuk meraih cita-cita di negeri Sakura."
                  </p>
                  <p className="text-xs font-bold text-[#c41230] mt-1.5 flex items-center gap-1">
                    <span>— Jangsan, Founder & CEO Sembako Nusantara</span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Story Graphic / 3D Stat Tiles */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <motion.div
                whileHover={{ rotateY: 5, rotateX: -3, scale: 1.02 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="bg-white p-6 rounded-3xl border border-[#EBE5DF] shadow-xl text-center space-y-4"
              >
                <div className="p-4 bg-[#FDF8F0] rounded-2xl border border-[#EBE5DF]">
                  <img
                    src="/logo-transparent.png"
                    alt="Sembako Nusantara"
                    className="w-48 h-auto object-contain mx-auto drop-shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-red-50 rounded-xl transition-transform">
                    <span className="block font-heading font-extrabold text-xl sm:text-2xl text-[#c41230]">47</span>
                    <span className="text-[11px] text-stone-600 font-bold">Prefektur Terlayani</span>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-emerald-50 rounded-xl transition-transform">
                    <span className="block font-heading font-extrabold text-xl sm:text-2xl text-emerald-700">100%</span>
                    <span className="text-[11px] text-stone-600 font-bold">Jaminan Halal</span>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-amber-50 rounded-xl transition-transform">
                    <span className="block font-heading font-extrabold text-xl sm:text-2xl text-amber-700">100+</span>
                    <span className="text-[11px] text-stone-600 font-bold">Varian Produk SKU</span>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-blue-50 rounded-xl transition-transform">
                    <span className="block font-heading font-extrabold text-xl sm:text-2xl text-blue-700">24 Jam</span>
                    <span className="text-[11px] text-stone-600 font-bold">Pengiriman Kilat</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Section3D>

      {/* 4. SECTION: VISI & MISI KAMI with 3D Depth Reveals */}
      <Section3D direction="up" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
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
            Menjadi sahabat terpercaya dalam memenuhi kebutuhan pangan halal berkualitas bagi seluruh masyarakat Indonesia dan pencinta kuliner Nusantara di Jepang.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision Card */}
          <Card3D delay={0.1}>
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EBE5DF] shadow-md hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-bl-full pointer-events-none"></div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl mb-6 shadow-xs">
                  <span className="material-symbols-outlined text-2xl">visibility</span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-stone-900 mb-4">
                  Visi Kami
                </h3>
                <p className="text-stone-700 text-base leading-relaxed">
                  Menjadi <strong>platform distribusi dan ritel sembako halal Nusantara nomor 1 di Jepang</strong> yang dikenal atas integritas, kecepatan layanan, keaslian rasa, serta menjadi jembatan persahabatan budaya kuliner Indonesia–Jepang.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-amber-700">
                <span className="material-symbols-outlined text-sm">flag</span>
                <span>Terdepan & Terpercaya Se-Jepang</span>
              </div>
            </div>
          </Card3D>

          {/* Mission Card */}
          <Card3D delay={0.2}>
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EBE5DF] shadow-md hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-red-200/30 to-transparent rounded-bl-full pointer-events-none"></div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#c41230] flex items-center justify-center font-bold text-xl mb-6 shadow-xs">
                  <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                </div>
                <h3 className="font-heading font-extrabold text-2xl text-stone-900 mb-4">
                  Misi Kami
                </h3>
                <ul className="space-y-3.5 text-stone-700 text-sm sm:text-base">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Jaminan Halal Mutlak:</strong> Menyediakan produk bahan pokok pangan dan rempah yang 100% tersertifikasi halal.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Logistik Cepat & Terjangkau:</strong> Menghadirkan ongkos kirim transparan dan pengiriman kilat ke seluruh 47 prefektur.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Pelayanan Penuh Kehangatan:</strong> Mendampingi pelanggan dengan respon cepat, ramah, dan solutif dalam 3 bahasa.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0 mt-0.5">check_circle</span>
                    <span><strong>Pemberdayaan UMKM:</strong> Menjadi saluran resmi ekspor produk-produk unggulan produsen lokal Nusantara ke pasar Jepang.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-[#c41230]">
                <span className="material-symbols-outlined text-sm">favorite</span>
                <span>Melayani Sepenuh Hati</span>
              </div>
            </div>
          </Card3D>
        </div>
      </Section3D>

      {/* 5. SECTION AKHIR SEBELUM FOOTER with 3D Elevation */}
      <Section3D direction="up" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-[#EBE5DF] shadow-xl p-8 sm:p-14 text-center relative overflow-hidden"
        >
          {/* Promo Mascot Illustration (Transparent without background) */}
          <div className="flex justify-center mb-6">
            <motion.div
              whileHover={{ scale: 1.08, rotateZ: 3, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-32 h-32 sm:w-40 sm:h-40 relative flex items-center justify-center cursor-pointer"
            >
              <img
                src="/mascot-promo.png"
                alt="Promo Mascot Sembako Nusantara"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </motion.div>
          </div>

          {/* Subheader: — SIAP PESAN? — */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-[2px] w-6 bg-[#c41230]"></span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#c41230]">
              SIAP PESAN?
            </span>
            <span className="h-[2px] w-6 bg-[#c41230]"></span>
          </div>

          {/* Main Title */}
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-stone-900 tracking-tight leading-tight">
            Rasa nusantara, tinggal satu klik.
          </h2>

          {/* Description */}
          <p className="text-stone-600 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Belanja sekarang dan rasakan kembali makanan favoritmu — atau hubungi kami untuk pertanyaan apa pun, dalam bahasa yang kamu mau.
          </p>

          {/* Action Buttons with 3D Hover & Tap */}
          <div className="mt-8 flex flex-row items-center justify-center gap-2.5 sm:gap-4 max-w-md mx-auto">
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial">
              <Link
                to="/catalog"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#c41230] hover:bg-[#9a0021] text-white px-4 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-base shadow-md hover:shadow-xl transition-all cursor-pointer text-center whitespace-nowrap"
              >
                <span>Mulai Belanja</span>
                <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial">
              <a
                href="https://wa.me/6285773875762?text=Halo%20Sembako%20Nusantara,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20pemesanan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-4 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-base shadow-sm hover:shadow transition-all text-center whitespace-nowrap"
              >
                <img src="/whatsapp-icon.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                <span>Chat WhatsApp</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </Section3D>
    </div>
  );
};

