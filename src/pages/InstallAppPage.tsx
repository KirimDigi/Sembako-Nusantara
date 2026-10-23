import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '../utils/pwa';
import { useLanguage } from '../context/LanguageContext';
import { assetUrl } from '../utils/assets';

type PlatformTab = 'android' | 'ios' | 'desktop';

export const InstallAppPage: React.FC = () => {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<PlatformTab>('android');
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      setInstallSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F0] via-[#FAF3E8] to-[#F5ECE0] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Link to="/" className="hover:text-[#c41230] transition-colors">
            {language === 'JP' ? 'ホーム' : language === 'EN' ? 'Home' : 'Beranda'}
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-800 font-bold">
            {language === 'JP' ? 'アプリアイコン・ショートカット' : language === 'EN' ? 'Install App' : 'Pintasan Aplikasi'}
          </span>
        </nav>

        {/* Hero Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200/80 mb-8 relative overflow-hidden">
          {/* Subtle Decorative Background Badges */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-red-100/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* App Icon Preview */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-br from-[#c41230] to-[#8B0014] p-1.5 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <img
                  src={assetUrl('pwa-icon.svg')}
                  alt="Sembako Nusantara Icon"
                  className="w-full h-full object-contain rounded-2xl drop-shadow-md"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md flex items-center justify-center">
                <span className="material-symbols-outlined text-sm sm:text-base">verified</span>
              </span>
            </div>

            {/* App Title & Status */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#c41230] border border-red-200 text-xs font-extrabold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>{language === 'JP' ? '公式Webアプリ (PWA)' : language === 'EN' ? 'Official PWA Web App' : 'Pintasan Resmi PWA'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight mb-2">
                {language === 'JP'
                  ? 'スマホ・パソコンにアプリを追加'
                  : language === 'EN'
                  ? 'Install Sembako Nusantara App'
                  : 'Pasang Pintasan Aplikasi di HP & Desktop'}
              </h1>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-4">
                {language === 'JP'
                  ? 'ホーム画面に直接追加して、アプリ感覚で高速注文。通信量ゼロのオフライン高速起動対応！'
                  : language === 'EN'
                  ? 'Add to home screen for instant shopping. Ultra-fast, zero extra data egress, works offline!'
                  : 'Tambahkan ke layar utama HP (Android/iOS) atau Desktop (Windows/Mac) Anda. Akses 1-klik secepat kilat, hemat kuota internet (0 KB egress), dan bebas lag!'}
              </p>

              {/* Status & Quick Action Button */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {isInstalled || installSuccess ? (
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-sm shadow-xs">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    <span>
                      {language === 'JP'
                        ? 'すでにインストール済みです'
                        : language === 'EN'
                        ? 'App is installed on this device'
                        : 'Aplikasi Sudah Terpasang di Perangkat Ini!'}
                    </span>
                  </div>
                ) : canInstall ? (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#c41230] to-[#a80f28] hover:from-[#a80f28] hover:to-[#8b0014] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-red-700/25 active:scale-98 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">download</span>
                    <span>
                      {language === 'JP'
                        ? '今すぐワンクリックで追加'
                        : language === 'EN'
                        ? '1-Click Install Now'
                        : 'Pasang Aplikasi Sekarang (1-Klik)'}
                    </span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm">
                    <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
                    <span>
                      {language === 'JP'
                        ? '下記のガイドに従ってホーム画面に追加できます'
                        : language === 'EN'
                        ? 'Follow the steps below to add to home screen'
                        : 'Ikuti panduan mudah di bawah sesuai jenis perangkat Anda'}
                    </span>
                  </div>
                )}

                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">storefront</span>
                  <span>{language === 'JP' ? '商品カタログを見る' : language === 'EN' ? 'Browse Catalog' : 'Mulai Belanja'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Super Advantages Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c41230] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">speed</span>
            </div>
            <h2 className="font-extrabold text-stone-900 text-sm mb-1">
              {language === 'JP' ? '超高速・ロード0秒' : language === 'EN' ? 'Instant 0s Load' : 'Akses Cepat 0 Detik'}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {language === 'JP'
                ? 'キャッシュ保存により瞬時に起動し、ストレスなくお買い物可能。'
                : language === 'EN'
                ? 'Cached assets open instantly without lag, even in subway tunnels.'
                : 'Pintasan langsung terbuka tanpa menunggu loading browser, cepat seperti aplikasi bawaan.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">data_saver_on</span>
            </div>
            <h2 className="font-extrabold text-stone-900 text-sm mb-1">
              {language === 'JP' ? '通信量ゼロ・省パケ' : language === 'EN' ? 'Zero Data Egress' : 'Hemat Kuota (0 KB)'}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {language === 'JP'
                ? 'スマートキャッシュ機構でサーバー通信を徹底的に削減。ギガを節約。'
                : language === 'EN'
                ? 'Smart service worker prevents repeated downloads, saving monthly bandwidth.'
                : 'Setelah terpasang, aset tidak perlu didownload ulang. Kuota hosting & HP tetap aman terkendali!'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">sync_saved_locally</span>
            </div>
            <h2 className="font-extrabold text-stone-900 text-sm mb-1">
              {language === 'JP' ? '自動アップデート' : language === 'EN' ? 'Auto Smart Update' : 'Update Otomatis'}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {language === 'JP'
                ? '新機能が追加されても自動で更新。在庫やカートデータはそのまま安全。'
                : language === 'EN'
                ? 'Updates seamlessly in the background without losing your cart or stock data.'
                : 'Saat ada pembaruan sistem, pintasan update otomatis tanpa mengganggu stok, harga, atau order.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">point_of_sale</span>
            </div>
            <h2 className="font-extrabold text-stone-900 text-sm mb-1">
              {language === 'JP' ? 'POSレジ・全画面表示' : language === 'EN' ? 'Full Screen POS' : 'Nyaman untuk Kasir POS'}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              {language === 'JP'
                ? 'アドレスバーのない全画面モードで、店舗POSやレジ操作が快適。'
                : language === 'EN'
                ? 'Standalone window without address bar, perfect for shop cashier & POS.'
                : 'Tampilan bersih tanpa terhalang address bar browser, sangat ideal untuk operasional Kasir POS Toko.'}
            </p>
          </div>
        </div>

        {/* Step-by-Step Installation Guides */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200/90 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                {language === 'JP' ? '端末別の追加手順' : language === 'EN' ? 'Installation Guide by Device' : 'Panduan Pasang Berdasarkan Perangkat'}
              </h2>
              <p className="text-xs text-stone-500">
                {language === 'JP' ? 'お使いのスマートフォンまたはPCを選んでください' : language === 'EN' ? 'Select your device below' : 'Pilih jenis perangkat yang sedang Anda gunakan saat ini'}
              </p>
            </div>

            {/* Platform Tab Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('android')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'android' ? 'bg-[#c41230] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">android</span>
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ios')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ios' ? 'bg-[#c41230] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">phone_iphone</span>
                <span>iPhone / iPad</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('desktop')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'desktop' ? 'bg-[#c41230] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-base">laptop</span>
                <span>PC / Laptop</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ANDROID GUIDE */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-2xl shrink-0 mt-0.5">touch_app</span>
                <div className="text-xs text-emerald-950 leading-relaxed">
                  <span className="font-extrabold block text-sm mb-0.5">
                    {language === 'JP' ? '方法 1: 上のボタンを押すだけ' : language === 'EN' ? 'Option 1: Click the Install button above' : 'Cara 1: Klik tombol "Pasang Aplikasi" di atas'}
                  </span>
                  {language === 'JP'
                    ? 'ブラウザがインストールの確認ダイアログを表示したら、「インストール」をタップします。'
                    : language === 'EN'
                    ? 'Tap the red button above and confirm when the prompt appears.'
                    : 'Jika tombol merah di atas muncul, cukup tekan tombol tersebut dan pilih "Install".'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      1
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1">
                      {language === 'JP' ? 'Chromeのメニューを開く' : language === 'EN' ? 'Open Chrome Menu' : 'Buka Menu Chrome (⋮)'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? '画面右上にある縦の3点リーダー「⋮」をタップします。'
                        : language === 'EN'
                        ? 'Tap the 3 vertical dots icon in the top right corner of Chrome.'
                        : 'Ketuk ikon titik tiga (⋮) di pojok kanan atas browser Google Chrome.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      2
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1">
                      {language === 'JP' ? '「アプリをインストール」' : language === 'EN' ? 'Tap "Install app"' : 'Pilih "Tambahkan ke Layar Utama"'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? 'メニューの中から「アプリをインストール」または「ホーム画面に追加」を選択。'
                        : language === 'EN'
                        ? 'Select "Install app" or "Add to Home screen" from the menu list.'
                        : 'Pilih opsi "Pasang aplikasi" atau "Tambahkan ke Layar Utama / Home Screen".'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      3
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1">
                      {language === 'JP' ? '完了！ホーム画面から起動' : language === 'EN' ? 'Ready on Home Screen' : 'Selesai & Siap Digunakan'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? 'アイコンがホーム画面に作成されます。次回から1タップで開けます。'
                        : language === 'EN'
                        ? 'Sembako Nusantara icon is now on your home screen ready to use anytime.'
                        : 'Ikon Sembako Nusantara langsung hadir di layar utama smartphone Android Anda!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IOS SAFARI GUIDE */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 text-2xl shrink-0 mt-0.5">ios_share</span>
                <div className="text-xs text-blue-950 leading-relaxed">
                  <span className="font-extrabold block text-sm mb-0.5">
                    {language === 'JP' ? 'iOS Safariでの追加方法' : language === 'EN' ? 'How to Add in iOS Safari' : 'Panduan Khusus Pengguna iPhone & iPad (Safari)'}
                  </span>
                  {language === 'JP'
                    ? 'Appleの仕様により、Safariブラウザの「共有」ボタンからワンタップで追加できます。'
                    : language === 'EN'
                    ? 'Apple requires using the Safari Share icon to add shortcuts directly to your home screen.'
                    : 'Di iPhone/iPad, Apple menyediakan tombol "Share" di bawah layar Safari untuk menambahkan pintasan.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      1
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
                      <span>{language === 'JP' ? '共有ボタンをタップ' : language === 'EN' ? 'Tap Share Button' : 'Tekan Tombol Share'}</span>
                      <span className="material-symbols-outlined text-blue-600 text-base">ios_share</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? 'Safari下部の中央にある「共有」アイコン（四角に上矢印）をタップします。'
                        : language === 'EN'
                        ? 'Tap the Share icon (a square with an upward arrow) at the bottom bar of Safari.'
                        : 'Buka di Safari, lalu ketuk ikon "Share" (kotak dengan panah ke atas) di bilah bawah layar iPhone Anda.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      2
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
                      <span>{language === 'JP' ? '「ホーム画面に追加」' : language === 'EN' ? 'Add to Home Screen' : 'Tambahkan ke Layar Utama'}</span>
                      <span className="material-symbols-outlined text-stone-700 text-base">add_box</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? '共有シートを少し下にスクロールし、「ホーム画面に追加」をタップします。'
                        : language === 'EN'
                        ? 'Scroll down the share sheet and select "Add to Home Screen".'
                        : 'Gulir sedikit ke bawah pada menu pop-up, lalu pilih opsi "Tambahkan ke Layar Utama" (Add to Home Screen).'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      3
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1">
                      {language === 'JP' ? '右上の「追加」をタップ' : language === 'EN' ? 'Tap "Add" in Top Right' : 'Tekan "Tambah" di Kanan Atas'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? '画面右上の「追加」を押せば完了です。アプリアイコンがホーム画面に配置されます。'
                        : language === 'EN'
                        ? 'Tap "Add" at the top right corner. The icon appears on your home screen immediately.'
                        : 'Tekan "Tambah" (Add) di pojok kanan atas. Ikon Sembako Nusantara resmi terpasang di iPhone Anda!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESKTOP GUIDE */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-3">
                <span className="material-symbols-outlined text-purple-600 text-2xl shrink-0 mt-0.5">desktop_windows</span>
                <div className="text-xs text-purple-950 leading-relaxed">
                  <span className="font-extrabold block text-sm mb-0.5">
                    {language === 'JP' ? 'Windows & Mac PC での追加' : language === 'EN' ? 'Install on Windows & Mac PC' : 'Pasang di Laptop / Komputer (Windows, Mac, Chromebook)'}
                  </span>
                  {language === 'JP'
                    ? 'ChromeまたはEdgeのURLバーにあるインストールアイコンをクリックすると、独立したデスクトップアプリとして利用できます。'
                    : language === 'EN'
                    ? 'Click the install icon in the URL bar of Chrome or Edge to run as a dedicated desktop app.'
                    : 'Sangat cocok untuk Toko Fisik / Kasir POS! Berjalan di jendela mandiri tanpa tab browser.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      1
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
                      <span>{language === 'JP' ? 'URLバーのアイコン' : language === 'EN' ? 'URL Bar Icon' : 'Lihat Bilah URL'}</span>
                      <span className="material-symbols-outlined text-stone-700 text-base">install_desktop</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? 'ブラウザのURL入力欄の右端にある「アプリをインストール」アイコンをクリックします。'
                        : language === 'EN'
                        ? 'Look for the monitor icon or install prompt in the right side of the URL bar.'
                        : 'Di Google Chrome / Microsoft Edge, perhatikan ikon monitor kecil bertanda panah ke bawah atau tombol pasang di ujung kanan address bar.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      2
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1">
                      {language === 'JP' ? '「インストール」をクリック' : language === 'EN' ? 'Click "Install"' : 'Klik "Install"'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? 'ポップアップが表示されたら「インストール」ボタンをクリックします。'
                        : language === 'EN'
                        ? 'Click the "Install" confirmation button in the browser dialog.'
                        : 'Klik tombol "Install" pada jendela pop-up konfirmasi yang muncul.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-full bg-[#c41230] text-white font-extrabold text-sm flex items-center justify-center mb-3">
                      3
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm mb-1">
                      {language === 'JP' ? 'デスクトップから直結起動' : language === 'EN' ? 'Launch from Desktop' : 'Pintasan Siap di Desktop'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {language === 'JP'
                        ? 'デスクトップやスタートメニューにアイコンが追加され、独立ウィンドウで高速動作します。'
                        : language === 'EN'
                        ? 'App is added to your desktop & taskbar, opening in its own clean window.'
                        : 'Pintasan otomatis tersedia di Desktop & Start Menu komputer Anda, siap dipakai transaksi kapan saja!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer & Merchant FAQ Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200/90">
          <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c41230]">help</span>
            <span>{language === 'JP' ? 'よくあるご質問 (FAQ)' : language === 'EN' ? 'Frequently Asked Questions' : 'Pertanyaan Umum (FAQ)'}</span>
          </h2>

          <div className="space-y-4 text-xs sm:text-sm divide-y divide-stone-100">
            <div className="pt-3 first:pt-0">
              <h3 className="font-bold text-stone-900 mb-1">
                {language === 'JP'
                  ? 'Q: アプリをインストールすると容量や通信量を圧迫しますか？'
                  : language === 'EN'
                  ? 'Q: Does installing this app consume device storage or bandwidth?'
                  : 'Q: Apakah pintasan ini memakan memori HP atau kuota internet?'}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {language === 'JP'
                  ? 'A: いいえ。サイズはわずか数MB程度で、最新のPWA技術により余計な通信は一切発生しません。キャッシュが働くため、むしろ通常のWeb閲覧よりも通信量を大幅に節約できます。'
                  : language === 'EN'
                  ? 'A: No. It uses negligible storage (<5MB) and smart caching drastically cuts down bandwidth usage compared to a normal browser.'
                  : 'A: Tidak sama sekali! Ukurannya sangat ringan (<3MB) dan tidak memerlukan download berat dari PlayStore. Berkat teknologi Service Worker, kuota internet Anda justru jauh lebih hemat karena data aset tidak perlu diunduh berulang kali.'}
              </p>
            </div>

            <div className="pt-3">
              <h3 className="font-bold text-stone-900 mb-1">
                {language === 'JP'
                  ? 'Q: Webサイトが更新された時、インストールしたアプリも更新されますか？'
                  : language === 'EN'
                  ? 'Q: When the website updates, does the installed shortcut update too?'
                  : 'Q: Jika ada pembaruan atau penambahan fitur di website, apakah pintasan ikut ter-update?'}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {language === 'JP'
                  ? 'A: はい！新しいビルドが公開されると、アプリ起動時に自動で最新機能を取得・更新します。手動で再インストールする必要はありません。'
                  : language === 'EN'
                  ? 'A: Yes! Whenever a new build is deployed, the app updates automatically in the background without needing a manual re-install.'
                  : 'A: Ya, 100% otomatis ter-update! Begitu website diperbarui (deploy baru), aplikasi pintasan Anda akan mendeteksi dan memperbarui fitur secara otomatis tanpa harus instal ulang.'}
              </p>
            </div>

            <div className="pt-3">
              <h3 className="font-bold text-stone-900 mb-1">
                {language === 'JP'
                  ? 'Q: 在庫や価格、過去の注文データが消える心配はありませんか？'
                  : language === 'EN'
                  ? 'Q: Will stock, price changes, or order history be lost during updates?'
                  : 'Q: Apakah update fitur akan merusak atau mereset stok barang dan transaksi kasir?'}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {language === 'JP'
                  ? 'A: ご安心ください。インテリジェントマージ機能により、在庫数、原価、価格設定、POS取引履歴、お客様の注文データは厳格に保護され、コード更新時もそのまま維持されます。'
                  : language === 'EN'
                  ? 'A: Rest assured! Our non-destructive data merge algorithm ensures all stocks, custom prices, POS records, and customer carts remain intact.'
                  : 'A: Dijamin aman! Sistem menggunakan algoritma Smart Non-Destructive Data Merge. Saat sistem diperbarui, hanya fitur baru atau perbaikan kode yang masuk. Seluruh stok barang, harga yang sudah diubah, data HPP, transaksi kasir POS, dan riwayat pesanan Anda tetap utuh 100% seperti sebelumnya.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InstallAppPage;
