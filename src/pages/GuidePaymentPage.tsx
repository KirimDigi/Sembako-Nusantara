import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const GuidePaymentPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'transfer' | 'jpqr' | 'paypay' | 'cash_cod' | 'card_ewallet' | 'delivery' | 'policy'>('all');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 bg-[#FFDAD9] text-[#9a0021] text-xs font-bold rounded-full uppercase tracking-wider inline-block">
          {language === 'JP' ? '公式取引＆配送ガイド' : language === 'EN' ? 'Official Transaction & Shipping Guide' : 'Panduan Resmi Transaksi & Pengiriman'}
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900">
          {language === 'JP'
            ? 'お支払い方法・配送案内・店舗ポリシー 📖'
            : language === 'EN'
            ? 'Payment Methods, Shipping & Store Policy 📖'
            : 'Metode Pembayaran, Pengiriman & Kebijakan Toko 📖'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mx-auto leading-relaxed">
          {language === 'JP'
            ? '現金、IDR/円銀行振込、QRIS、JPQR、PayPay、クレジットカード、デビット、着払い(COD)、クール宅急便・近隣3駅デリバリーまで、すべての決済・配送に対応しております。'
            : language === 'EN'
            ? 'All payment conveniences at Sembako Nusantara Japan: Cash, Bank Transfer (IDR/Yen), QRIS, JPQR, PayPay, Credit Cards, COD, and express nationwide delivery.'
            : 'Semua kemudahan bertransaksi di Sembako Nusantara Jepang: Cash, Transfer IDR/Yen, QRIS, Debit/CC, E-wallet, PayPay, COD, hingga Delivery Service 3 stasiun & Ekspedisi.'}
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF] hover:bg-stone-50'
          }`}
        >
          {language === 'JP' ? '🌟 すべてのガイド' : language === 'EN' ? '🌟 All Guides' : '🌟 Semua Panduan'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'transfer'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF] hover:bg-stone-50'
          }`}
        >
          {language === 'JP' ? '🏦 銀行振込 (IDR/円)' : language === 'EN' ? '🏦 Bank Transfer (IDR/Yen)' : '🏦 Transfer IDR / Yen'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jpqr')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'jpqr'
              ? 'bg-[#c41230] text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF] hover:bg-stone-50'
          }`}
        >
          {language === 'JP' ? '📱 QRIS ＆ JPQR' : language === 'EN' ? '📱 QRIS & JPQR' : '📱 QRIS & JPQR'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paypay')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'paypay'
              ? 'bg-[#FF0033] text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF] hover:bg-stone-50'
          }`}
        >
          ⚡ PayPay
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cash_cod')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'cash_cod'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF] hover:bg-stone-50'
          }`}
        >
          {language === 'JP' ? '💵 現金・代金引換 (COD)' : language === 'EN' ? '💵 Cash & COD' : '💵 Cash & COD'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('card_ewallet')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'card_ewallet'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF] hover:bg-stone-50'
          }`}
        >
          {language === 'JP' ? '💳 クレジットカード・電子マネー' : language === 'EN' ? '💳 Cards & E-Wallet' : '💳 Debit, CC & E-Wallet'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'delivery'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF] hover:bg-stone-50'
          }`}
        >
          {language === 'JP' ? '🚀 配送便・ヤマト・佐川' : language === 'EN' ? '🚀 Delivery & Couriers' : '🚀 Delivery & Ekspedisi'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('policy')}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'policy'
              ? 'bg-red-700 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF] hover:bg-stone-50'
          }`}
        >
          {language === 'JP' ? '⚖️ 店舗ポリシー・返品規定' : language === 'EN' ? '⚖️ Store Policies' : '⚖️ Kebijakan Toko'}
        </button>
      </div>

      {/* Guide Content Cards */}
      <div className="space-y-8">
        {/* 1. Cash, COD, Transfer Bank IDR & Yen */}
        {(activeTab === 'all' || activeTab === 'cash_cod' || activeTab === 'transfer') && (
          <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-stone-900">
                  {language === 'JP'
                    ? '現金決済 (店頭・COD) ＆ 銀行振込 (日本円・IDR)'
                    : language === 'EN'
                    ? 'Cash, COD & Bank Transfers (IDR / JPY)'
                    : 'Pembayaran Tunai (Cash), COD & Transfer Bank (IDR / Yen)'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'JP'
                    ? '日本円（JPY）およびインドネシアルピア（IDR）での直接決済に対応。'
                    : language === 'EN'
                    ? 'Supporting payments in both Japanese Yen and Indonesian Rupiah.'
                    : 'Mendukung mata uang Rupiah maupun Yen Jepang sesuai kenyamanan Anda.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-emerald-600">payments</span>
                  <span>{language === 'JP' ? '1. 現金払い ＆ 代金引換 (COD)' : language === 'EN' ? '1. Cash & COD' : '1. Cash & COD (Bayar di Tempat)'}</span>
                </div>
                <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                  <li>
                    • <strong>{language === 'JP' ? '店頭で現金決済:' : 'Cash di Toko:'}</strong>{' '}
                    {language === 'JP'
                      ? '店舗にて直接お支払い（〒144-0051 東京都大田区西蒲田5丁目9-16）。'
                      : language === 'EN'
                      ? 'Pay directly in cash at our Tokyo physical shop (Nishikamata 5-9-16).'
                      : 'Bayar langsung secara tunai saat belanja di toko kami (〒144-0051 Tokyo, Ota-ku, Nishikamata 5-9-16).'}
                  </li>
                  <li>
                    • <strong>{language === 'JP' ? 'デリバリー・宅配代金引換:' : 'COD Delivery Service:'}</strong>{' '}
                    {language === 'JP'
                      ? '荷物を受け取る際に配達員へ現金をお支払いいただけます。'
                      : language === 'EN'
                      ? 'Pay cash upon delivery directly to the courier.'
                      : 'Bayar tunai kepada kurir saat pesanan sampai di tempat Anda.'}
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-blue-600">account_balance</span>
                  <span>{language === 'JP' ? '2. 銀行振込 (IDR・日本円)' : language === 'EN' ? '2. Bank Transfer (IDR & Yen)' : '2. Transfer Bank IDR & Yen (銀行振込)'}</span>
                </div>
                <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                  <li>
                    • <strong>{language === 'JP' ? 'インドネシア銀行振込 (IDR):' : 'Transfer Rupiah (IDR):'}</strong>{' '}
                    BCA, Mandiri, BRI, BNI.
                  </li>
                  <li>
                    • <strong>{language === 'JP' ? '日本国内銀行振込 (JPY):' : 'Transfer Yen (JPY):'}</strong>{' '}
                    {language === 'JP' ? 'ゆうちょ銀行、三井住友銀行 (SMBC)、三菱UFJ銀行 (MUFG)。' : 'Yucho Bank (ゆうちょ銀行), SMBC, MUFG.'}
                  </li>
                  <li>
                    • {language === 'JP'
                      ? '振込明細の写真をWhatsApp公式サポートまでお送りいただくだけで確認完了！'
                      : language === 'EN'
                      ? 'Confirm by sending your receipt to our WhatsApp support.'
                      : 'Konfirmasi bukti transfer cukup kirim foto resi ke WhatsApp Customer Service 24 Jam (+62 857-7387-5762).'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. QRIS, JPQR & PayPay */}
        {(activeTab === 'all' || activeTab === 'jpqr' || activeTab === 'paypay') && (
          <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c41230] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-stone-900">
                  {language === 'JP' ? 'QRIS ＆ PayPay 決済 (QRスキャン)' : language === 'EN' ? 'QRIS & PayPay Payments (Instant Scan)' : 'Pembayaran QRIS & PayPay (Scan QR Instan)'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'JP'
                    ? 'スマートフォンのカメラでQRコードを読み取るだけで瞬時に決済完了。'
                    : language === 'EN'
                    ? 'Scan a single QR code directly from your smartphone without manual account typing.'
                    : 'Scan 1 barcode langsung dari ponsel Anda tanpa perlu input manual nomor rekening.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="px-2 py-0.5 bg-[#c41230] text-white rounded text-[10px] font-black">QRIS</span>
                  <span className="px-2 py-0.5 bg-red-100 text-[#c41230] rounded text-[10px] font-bold">JPQR</span>
                  <span>{language === 'JP' ? '国境レス決済 QRIS / JPQR' : 'QRIS & JPQR Cross-Border'}</span>
                </div>
                <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>{language === 'JP' ? 'インドネシアのモバイルバンキング (BCA, Livin, BRImo) を開きます。' : 'Buka aplikasi m-Banking Indonesia (BCA, Livin Mandiri, BRImo).'}</li>
                  <li>{language === 'JP' ? '画面に表示される QRIS / JPQR を読み取ります。' : 'Pindai Barcode QRIS / JPQR yang tertera di invoice checkout.'}</li>
                  <li>{language === 'JP' ? '店舗名「SEMBAKO NUSANTARA JEPANG」を確認します。' : 'Konfirmasi nama merchant SEMBAKO NUSANTARA JEPANG.'}</li>
                  <li>{language === 'JP' ? 'お支払いを完了すると、注文が即時処理されます！' : 'Selesaikan pembayaran dan pesanan Anda langsung diproses kilat!'}</li>
                </ol>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="px-2 py-0.5 bg-[#FF0033] text-white rounded text-[10px] font-bold">PayPay</span>
                  <span>{language === 'JP' ? 'PayPay決済 (アプリ＆QR)' : 'PayPay (Aplikasi & Barcode)'}</span>
                </div>
                <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>{language === 'JP' ? 'ご注文時にPayPay支払いを選択します。' : 'Pilih opsi PayPay saat checkout pesanan.'}</li>
                  <li>{language === 'JP' ? '店舗のPayPay QRコードを読み取るかPayPay IDへ送金します。' : 'Scan QR code PayPay toko atau transfer ke ID PayPay resmi toko.'}</li>
                  <li>{language === 'JP' ? '請求金額（日本円）を入力して決済します。' : 'Masukkan nominal tagihan dalam Yen (JPY).'}</li>
                  <li>{language === 'JP' ? '支払い完了画面を送信または共有して確認完了。' : 'Tunjukkan bukti screenshot sukses bayar ke CS atau upload di sistem.'}</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* 3. Debit/CC & E-wallet */}
        {(activeTab === 'all' || activeTab === 'card_ewallet') && (
          <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">credit_card</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-stone-900">
                  {language === 'JP' ? 'クレジットカード ＆ 各種電子マネー' : language === 'EN' ? 'Credit / Debit Cards & E-Wallets' : 'Kartu Debit / Kartu Kredit & E-Wallet'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'JP' ? '国際主要クレジットカードブランドおよび各種電子マネーに対応。' : 'Mendukung kartu internasional dan dompet digital terpopuler.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">credit_card</span>
                  <span>{language === 'JP' ? 'クレジットカード (Visa / JCB / Master)' : 'Debit & Credit Card (Kartu Debit / Kredit)'}</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'JP'
                    ? 'Visa、MasterCard、JCB、American Express に対応。国際セキュリティ規格 3Dセキュアによる安全な決済です。'
                    : 'Menerima Visa, MasterCard, JCB, American Express dengan standar keamanan 3D Secure internasional.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">smartphone</span>
                  <span>{language === 'JP' ? '電子ウォレット (LINE Pay / GoPay)' : 'E-Wallet Terpadu'}</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'JP'
                    ? 'LINE Pay、GoPay、OVO、DANA、ShopeePay などに対応。在日インドネシア人コミュニティにも大変便利です。'
                    : 'Mendukung GoPay, OVO, ShopeePay, DANA, LINE Pay.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Layanan Pengiriman (Delivery Service, Ekspedisi, COD) */}
        {(activeTab === 'all' || activeTab === 'delivery') && (
          <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-stone-900">
                  {language === 'JP'
                    ? '公式配送便 (ヤマト運輸・佐川急便・近隣デリバリー)'
                    : language === 'EN'
                    ? 'Official Delivery Services (Yamato, Sagawa & Local Delivery)'
                    : 'Layanan Pengiriman Resmi (Delivery Service, Ekspedisi & COD)'}
                </h3>
                <p className="text-xs text-stone-500">
                  {language === 'JP'
                    ? '迅速かつ安全にお客様のご自宅までお届けいたします。'
                    : 'Pilihan pengantaran fleksibel yang cepat dan aman sampai ke pintu Anda.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-2 text-[#c41230] font-bold text-sm">
                  <span className="material-symbols-outlined">moped</span>
                  <span>{language === 'JP' ? '1. 近隣デリバリー (最大3駅)' : '1. Delivery Service (Max 3 Station)'}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'JP'
                    ? '西蒲田の店舗から電車で3駅以内のエリアには、スタッフが当日即配いたします！'
                    : 'Layanan antar kilat oleh staf toko khusus untuk lokasi tempat tinggal dengan jarak maksimal 3 stasiun kereta dari Nishikamata.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-blue-600">local_shipping</span>
                  <span>{language === 'JP' ? '2. 宅配便 (ヤマト・佐川)' : '2. Ekspedisi (Yamato & Sagawa)'}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'JP'
                    ? '全国47都道府県へ通常便および冷凍クール宅急便で迅速発送。伝票番号でリアルタイム追跡可能。'
                    : 'Pengiriman reguler dan Cool Takkyubin ke seluruh 47 prefektur Jepang bersama Kuroneko Yamato dan Sagawa Express.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <span className="material-symbols-outlined">handshake</span>
                  <span>{language === 'JP' ? '3. 代金引換 (COD)' : '3. COD (Cash On Delivery)'}</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'JP'
                    ? 'お荷物到着時に配達ドライバーへ直接現金でお支払いいただけます。'
                    : 'Bayar tunai di tempat saat barang diterima. Sangat praktis dan aman.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Kebijakan Toko (Store Policy) */}
        {(activeTab === 'all' || activeTab === 'policy') && (
          <div className="bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#c41230] text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">gavel</span>
                <span>{language === 'JP' ? '公式店舗規約' : language === 'EN' ? 'Official Store Policy' : 'Kebijakan Resmi Toko'}</span>
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900">
                {language === 'JP' ? 'Sembako Nusantara 日本 店舗利用規定' : 'Kebijakan Toko Sembako Nusantara Jepang'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 font-medium bg-[#FDF8F0] p-4 rounded-xl border border-amber-200/70 leading-relaxed">
                {language === 'JP'
                  ? '「本場インドネシアの本格的な味わいと安心のハラール品質を、誠実なサービスでお届けいたします。」'
                  : '"Kami berkomitmen menyediakan produk Indonesia berkualitas dengan pelayanan yang aman dan terpercaya."'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c41230]">assignment_return</span>
                  <span>{language === 'JP' ? '商品の返品・交換について' : 'Pengembalian Produk'}</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'JP'
                    ? '食品・飲料品は衛生上の理由から、開封後の返品・交換は承りかねます。万一破損・誤送がある場合は即座に対応いたします。'
                    : 'Produk makanan dan minuman yang telah dibeli tidak dapat dikembalikan setelah kemasan dibuka, kecuali terdapat kesalahan pesanan, kerusakan, atau kondisi produk yang tidak sesuai.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700">timer</span>
                  <span>{language === 'JP' ? 'お問い合わせ期限 (24時間以内)' : 'Komplain (Batas Waktu Maksimal 24 Jam)'}</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {language === 'JP'
                    ? '破損や不備がございましたら、お受け取り後24時間以内に写真や動画を添付の上、公式カスタマーサポートまでご連絡ください。'
                    : 'Keluhan terkait pesanan wajib disampaikan kepada Customer Service maksimal 24 jam setelah barang diterima dengan bukti foto/video.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="p-6 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">
            {language === 'JP' ? 'カスタマーサポートへ直接相談しますか？' : language === 'EN' ? 'Need Direct Customer Support?' : 'Butuh Bantuan Langsung dari Customer Service?'}
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'JP' ? 'ご質問やご注文の確認など、24時間年中無休でサポートいたします。' : 'Kami siap menjawab pertanyaan Anda 24 jam nonstop setiap hari.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold transition-all"
          >
            {language === 'JP' ? 'お問い合わせ・店舗所在地' : language === 'EN' ? 'Contact & Location' : 'Halaman Kontak & Lokasi'}
          </Link>
          <a
            href="https://wa.me/6285773875762"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-[#25D366] text-white hover:bg-[#1faa4b] text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>{language === 'JP' ? 'WhatsAppで相談' : 'Chat WhatsApp'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
