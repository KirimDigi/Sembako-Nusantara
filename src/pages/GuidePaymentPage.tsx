import React, { useState } from 'react';

export const GuidePaymentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jpqr' | 'paypay' | 'lawson' | 'seven' | 'famima'>('jpqr');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="text-center space-y-2 mb-10">
        <span className="px-3 py-1 bg-[#FFDAD9] text-[#9a0021] text-xs font-bold rounded-full uppercase tracking-wider">
          Bantuan & Tutorial Transaksi
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900">
          Panduan Belanja & Pembayaran di Jepang 📖
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
          Tutorial langkah demi langkah membayar pesanan belanja Anda dengan mudah via JPQR / JAPAN QRIS, PayPay, dan kasir minimarket Konbini (Lawson, 7-Eleven, FamilyMart).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('jpqr')}
          className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 ${
            activeTab === 'jpqr'
              ? 'bg-[#c41230] text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF]'
          }`}
        >
          <span>📱 JPQR / JAPAN QRIS</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">Unified</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('paypay')}
          className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'paypay'
              ? 'bg-[#FF0033] text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF]'
          }`}
        >
          📱 PayPay
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lawson')}
          className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'lawson'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF]'
          }`}
        >
          🏪 Lawson (Loppi)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seven')}
          className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'seven'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF]'
          }`}
        >
          🏪 7-Eleven (Kasir)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('famima')}
          className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
            activeTab === 'famima'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-stone-700 border border-[#EBE5DF]'
          }`}
        >
          🏪 FamilyMart (FamiPort)
        </button>
      </div>

      {/* Guide Content Card */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 sm:p-10 shadow-sm space-y-6">
        {activeTab === 'jpqr' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[#c41230] text-white font-black rounded text-xs">JPQR</span>
              <span className="px-3 py-1 bg-red-100 text-[#c41230] font-bold rounded text-xs">JAPAN QRIS</span>
              <h2 className="font-bold text-lg text-stone-900">Cara Bayar via JPQR & QRIS Antarnegara:</h2>
            </div>
            <p className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-200 leading-relaxed">
              Standard QR terpadu yang memfasilitasi pembayaran instan menggunakan <strong>Rekening Bank / E-Wallet Indonesia</strong> (BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, DANA) dan <strong>Aplikasi Pembayaran Jepang</strong> (PayPay, d払い, au PAY, Merpay, Bank Pay).
            </p>
            <ol className="list-decimal list-inside space-y-3 text-sm text-stone-700 leading-relaxed pl-2">
              <li>Pilih opsi pembayaran <strong>JPQR / JAPAN QRIS</strong> saat checkout pesanan.</li>
              <li>Buka aplikasi Mobile Banking Indonesia Anda (BCA Mobile, Livin by Mandiri, BRImo) atau E-Wallet Jepang.</li>
              <li>Arahkan kamera ke <strong>Barcode / QR Code JPQR</strong> yang ditampilkan di layar.</li>
              <li>Konfirmasi nama penerima <strong>SEMBAKO NUSANTARA JEPANG</strong> dan nominal Yen (JPY) / Rupiah (IDR).</li>
              <li>Masukkan PIN transaksi Anda. Pembayaran terverifikasi seketika dan pesanan segera dikirim!</li>
            </ol>
          </div>
        )}

        {activeTab === 'paypay' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#FF0033] text-white font-bold rounded text-xs">PayPay</span>
              <h2 className="font-bold text-lg text-stone-900">Cara Bayar Cepat via Aplikasi PayPay:</h2>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-sm text-stone-700 leading-relaxed pl-2">
              <li>Pilih opsi pembayaran <strong>PayPay</strong> di halaman checkout.</li>
              <li>Buka aplikasi PayPay di smartphone Anda atau scan QR Code yang muncul di layar.</li>
              <li>Periksa nominal tagihan dalam Yen (JPY) yang sesuai dengan total belanja.</li>
              <li>Tekan tombol <strong>"Pay / 支払う"</strong> di aplikasi PayPay Anda.</li>
              <li>Status pesanan di Sembako Nusantara akan otomatis terverifikasi lunas dalam 5 detik!</li>
            </ol>
          </div>
        )}

        {activeTab === 'lawson' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded text-xs">Lawson</span>
              <h2 className="font-bold text-lg text-stone-900">Cara Bayar di Mesin Loppi Lawson:</h2>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-sm text-stone-700 leading-relaxed pl-2">
              <li>Kunjungi minimarket Lawson terdekat dan hampiri mesin <strong>Loppi</strong> (berwarna merah).</li>
              <li>Pilih menu <strong>"各種番号をお持ちの方" (Punya Nomor Pembayaran)</strong> di layar sentuh.</li>
              <li>Masukkan <strong>Nomor Penerimaan / Payment Code (6 digit)</strong> pesanan Anda.</li>
              <li>Masukkan nomor telepon yang Anda daftarkan saat checkout.</li>
              <li>Ambil struk kertas Loppi yang keluar, lalu bawa ke kasir Lawson untuk pembayaran tunai dalam waktu 30 menit.</li>
            </ol>
          </div>
        )}

        {activeTab === 'seven' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-orange-600 text-white font-bold rounded text-xs">7-Eleven</span>
              <h2 className="font-bold text-lg text-stone-900">Cara Bayar Langsung di Kasir 7-Eleven:</h2>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-sm text-stone-700 leading-relaxed pl-2">
              <li>Simpan atau screenshot <strong>Barcode Pembayaran 7-Eleven (払込票)</strong> dari email konfirmasi pesanan Anda.</li>
              <li>Datangi kasir 7-Eleven dan tunjukkan barcode tersebut ke staf kasir.</li>
              <li>Staf akan memindai barcode Anda dan nominal pembayaran akan tampil di layar kasir.</li>
              <li>Lakukan pembayaran dengan uang tunai (Cash / 現金) atau kartu nanaco.</li>
              <li>Simpan struk bukti pembayaran dari kasir. Pesanan Anda segera diproses!</li>
            </ol>
          </div>
        )}

        {activeTab === 'famima' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-600 text-white font-bold rounded text-xs">FamilyMart</span>
              <h2 className="font-bold text-lg text-stone-900">Cara Bayar di Mesin FamiPort FamilyMart:</h2>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-sm text-stone-700 leading-relaxed pl-2">
              <li>Kunjungi FamilyMart dan pilih menu <strong>"代金支払い" (Pembayaran Tagihan)</strong> di mesin FamiPort / Multi-Copy.</li>
              <li>Pilih <strong>"各種代金お支払い"</strong> lalu masukkan kode perusahaan & nomor pemesanan.</li>
              <li>Periksa detail nama pesanan di layar konfirmasi dan tekan <strong>OK</strong>.</li>
              <li>Bawa tiket struk ke meja kasir FamilyMart untuk melunasi tagihan secara tunai.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
