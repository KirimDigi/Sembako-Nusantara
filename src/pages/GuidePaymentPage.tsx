import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const GuidePaymentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'transfer' | 'jpqr' | 'paypay' | 'cash_cod' | 'card_ewallet' | 'konbini' | 'delivery' | 'policy'>('all');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 bg-[#FFDAD9] text-[#9a0021] text-xs font-bold rounded-full uppercase tracking-wider inline-block">
          Panduan Resmi Transaksi & Pengiriman
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900">
          Metode Pembayaran, Pengiriman & Kebijakan Toko 📖
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mx-auto leading-relaxed">
          Semua kemudahan bertransaksi di Sembako Nusantara Jepang: Cash, Transfer IDR/Yen, QRIS, Debit/CC, E-wallet, PayPay, COD, hingga Delivery Service 3 stasiun & Ekspedisi.
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
          🌟 Semua Panduan
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
          🏦 Transfer IDR / Yen
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
          📱 QRIS & JPQR
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
          💵 Cash & COD
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
          💳 Debit, CC & E-Wallet
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
          🚀 Delivery & Ekspedisi
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
          ⚖️ Kebijakan Toko
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
                  Pembayaran Tunai (Cash), COD & Transfer Bank (IDR / Yen)
                </h3>
                <p className="text-xs text-stone-500">Mendukung mata uang Rupiah maupun Yen Jepang sesuai kenyamanan Anda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-emerald-600">payments</span>
                  <span>1. Cash & COD (Bayar di Tempat)</span>
                </div>
                <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                  <li>• <strong>Cash di Toko:</strong> Bayar langsung secara tunai saat belanja di toko kami (〒144-0051 Tokyo, Ota-ku, Nishikamata 5-9-16).</li>
                  <li>• <strong>COD Delivery Service:</strong> Bayar tunai kepada kurir saat pesanan sampai di tempat Anda (khusus pengiriman jarak maksimal 3 stasiun atau layanan COD kurir ekspedisi).</li>
                  <li>• Harap siapkan uang pas untuk mempercepat proses serah terima barang.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-blue-600">account_balance</span>
                  <span>2. Transfer Bank IDR & Yen (銀行振込)</span>
                </div>
                <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                  <li>• <strong>Transfer Rupiah (IDR):</strong> BCA, Mandiri, BRI, BNI (kurs real-time kompetitif bebas biaya konversi mahal).</li>
                  <li>• <strong>Transfer Yen (JPY):</strong> Yucho Bank (ゆうちょ銀行), SMBC, MUFG.</li>
                  <li>• Konfirmasi bukti transfer cukup kirim foto resi ke WhatsApp Customer Service 24 Jam (+62 857-7387-5762).</li>
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
                  Pembayaran QRIS & PayPay (Scan QR Instan)
                </h3>
                <p className="text-xs text-stone-500">Scan 1 barcode langsung dari ponsel Anda tanpa perlu input manual nomor rekening.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="px-2 py-0.5 bg-[#c41230] text-white rounded text-[10px] font-black">QRIS</span>
                  <span className="px-2 py-0.5 bg-red-100 text-[#c41230] rounded text-[10px] font-bold">JPQR</span>
                  <span>QRIS & JPQR Antarnegara</span>
                </div>
                <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Buka aplikasi m-Banking Indonesia (BCA, Livin Mandiri, BRImo) atau aplikasi e-wallet Jepang.</li>
                  <li>Pindai Barcode QRIS / JPQR yang tertera di invoice checkout.</li>
                  <li>Konfirmasi nama merchant <strong>SEMBAKO NUSANTARA JEPANG</strong>.</li>
                  <li>Selesaikan pembayaran dan pesanan Anda langsung diproses kilat!</li>
                </ol>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="px-2 py-0.5 bg-[#FF0033] text-white rounded text-[10px] font-bold">PayPay</span>
                  <span>PayPay (Aplikasi & Barcode)</span>
                </div>
                <ol className="text-xs text-stone-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Pilih opsi PayPay saat checkout pesanan.</li>
                  <li>Scan QR code PayPay toko atau transfer ke ID PayPay resmi toko.</li>
                  <li>Masukkan nominal tagihan dalam Yen (JPY).</li>
                  <li>Tunjukkan bukti screenshot sukses bayar ke CS atau upload di sistem.</li>
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
                  Kartu Debit / Kartu Kredit & E-Wallet
                </h3>
                <p className="text-xs text-stone-500">Mendukung kartu internasional dan dompet digital terpopuler.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">credit_card</span>
                  <span>Debit & Credit Card (Kartu Debit / Kredit)</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Menerima <strong>Visa, MasterCard, JCB, American Express</strong>. Pembayaran dienkripsi dengan standar keamanan 3D Secure bank internasional.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">smartphone</span>
                  <span>E-Wallet Terpadu</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Mendukung <strong>GoPay, OVO, ShopeePay, DANA, LINE Pay</strong>. Sangat praktis untuk kawan-kawan diaspora yang masih aktif menggunakan saldo dompet digital Indonesia.
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
                  Layanan Pengiriman Resmi (Delivery Service, Ekspedisi & COD)
                </h3>
                <p className="text-xs text-stone-500">Pilihan pengantaran fleksibel yang cepat dan aman sampai ke pintu Anda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-2 text-[#c41230] font-bold text-sm">
                  <span className="material-symbols-outlined">moped</span>
                  <span>1. Delivery Service (Max 3 Station)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Layanan antar kilat oleh staf toko khusus untuk lokasi tempat tinggal dengan <strong>jarak maksimal 3 stasiun kereta</strong> dari stasiun Nishikamata (Tokyo, Ota-ku). Pesanan langsung diantar di hari yang sama!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <span className="material-symbols-outlined text-blue-600">local_shipping</span>
                  <span>2. Ekspedisi (Yamato & Sagawa)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Pengiriman reguler dan <strong>Cool Takkyubin (bersuhu dingin/beku)</strong> ke seluruh 47 prefektur Jepang bekerjasama dengan <strong>Kuroneko Yamato</strong> dan <strong>Sagawa Express</strong>. Dilengkapi nomor resi pelacakan online.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <span className="material-symbols-outlined">handshake</span>
                  <span>3. COD (Cash On Delivery)</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Bayar tunai di tempat saat barang diterima. Sangat cocok bagi Anda yang belum memiliki rekening bank Jepang atau ingin memastikan paket tiba terlebih dahulu.
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
                <span>Kebijakan Resmi Toko</span>
              </div>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-stone-900">
                Kebijakan Toko Sembako Nusantara Jepang
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 font-medium bg-[#FDF8F0] p-4 rounded-xl border border-amber-200/70 leading-relaxed">
                "Kami berkomitmen menyediakan produk Indonesia berkualitas dengan pelayanan yang aman dan terpercaya."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#c41230]">assignment_return</span>
                  <span>Pengembalian Produk</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Produk makanan dan minuman yang telah dibeli tidak dapat dikembalikan setelah kemasan dibuka, kecuali terdapat kesalahan pesanan, kerusakan, atau kondisi produk yang tidak sesuai saat diterima.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-700">timer</span>
                  <span>Komplain (Batas Waktu Maksimal 24 Jam)</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Keluhan terkait pesanan wajib disampaikan kepada Customer Service maksimal 24 jam setelah barang diterima dengan menyertakan bukti foto/video.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700">edit_note</span>
                  <span>Ketentuan Pesanan</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Pastikan data penerima dan alamat pengiriman sudah benar sebelum melakukan pembayaran. Pesanan yang telah diproses atau dikirim mengikuti ketentuan pembatalan yang berlaku.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700">verified</span>
                  <span>Kompensasi / Retur</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Setiap pengajuan akan diperiksa berdasarkan kondisi produk dan bukti transaksi sebelum keputusan retur, penggantian produk, atau kompensasi diberikan.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="p-6 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base">Butuh Bantuan Langsung dari Customer Service?</h4>
          <p className="text-xs text-stone-400 mt-1">Kami siap menjawab pertanyaan Anda 24 jam nonstop setiap hari.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold transition-all"
          >
            Halaman Kontak & Lokasi
          </Link>
          <a
            href="https://wa.me/6285773875762"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-[#25D366] text-white hover:bg-[#1faa4b] text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>Chat WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
