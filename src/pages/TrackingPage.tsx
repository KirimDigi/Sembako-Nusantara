import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

export const TrackingPage: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAuth();
  const { orders } = useAdmin();

  const [trackingNo, setTrackingNo] = useState('');
  const [isSearched, setIsSearched] = useState(false);

  // Read customer user orders from localStorage as well
  const [userOrders, setUserOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sn_user_orders');
      if (saved) {
        setUserOrders(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resiParam = params.get('resi');
    if (resiParam) {
      setTrackingNo(resiParam);
      setIsSearched(true);
    }
  }, [location.search]);

  // Find matching order from admin orders or user orders
  const foundOrder = orders.find(
    (o) =>
      o.id.toLowerCase() === trackingNo.trim().toLowerCase() ||
      o.trackingNumber.toLowerCase() === trackingNo.trim().toLowerCase() ||
      (o as any).orderId?.toLowerCase() === trackingNo.trim().toLowerCase()
  ) || userOrders.find(
    (o) =>
      o.id?.toLowerCase() === trackingNo.trim().toLowerCase() ||
      o.trackingNumber?.toLowerCase() === trackingNo.trim().toLowerCase() ||
      o.orderId?.toLowerCase() === trackingNo.trim().toLowerCase()
  );

  const orderStatus = foundOrder ? foundOrder.status : 'Dikemas';
  const courierName = foundOrder ? foundOrder.courier : 'Yamato Transport (宅急便)';
  const orderDate = foundOrder ? foundOrder.date : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const destinationAddress = foundOrder?.shippingAddress || foundOrder?.address || 'Tokyo-to, Jepang';

  // Build realistic 4-step timeline based on actual Admin status
  const getTimeline = () => {
    const isStep1Done = ['Dikemas', 'Diproses', 'Selesai Packing', 'Dikirim', 'Selesai'].includes(orderStatus);
    const isStep2Done = ['Selesai Packing', 'Dikirim', 'Selesai'].includes(orderStatus);
    const isStep3Done = ['Dikirim', 'Selesai'].includes(orderStatus);
    const isStep4Done = orderStatus === 'Selesai';

    return [
      {
        stepNum: 1,
        title: '1. Pesanan Diterima & Sedang Dikemas (Packing Gudang)',
        desc: 'Pesanan telah diverifikasi admin. Tim gudang sedang mempersiapkan sembako, pengecekan sertifikasi halal, dan pengemasan thermo-box.',
        time: isStep1Done ? `${orderDate} - Selesai Diproses` : 'Menunggu Konfirmasi',
        isDone: isStep1Done,
        isCurrent: orderStatus === 'Dikemas' || orderStatus === 'Diproses',
        statusColor: 'amber'
      },
      {
        stepNum: 2,
        title: '2. Selesai Packing (Proses Pencarian & Penjadwalan Ekspedisi)',
        desc: 'Paket telah selesai dibungkus rapi dan aman. Sedang dalam proses penjadwalan penjemputan (pickup) oleh pihak ekspedisi.',
        time: isStep2Done ? `${orderDate} - Selesai Packing` : 'Menunggu Packing Selesai',
        isDone: isStep2Done,
        isCurrent: orderStatus === 'Selesai Packing',
        statusColor: 'purple'
      },
      {
        stepNum: 3,
        title: `3. Diserahkan ke Ekspedisi & Resi Terbit (${courierName})`,
        desc: foundOrder?.trackingNumber && foundOrder.trackingNumber !== '-'
          ? `Paket telah diserahkan ke kurir ${courierName}. Nomor resi pengiriman resmi: ${foundOrder.trackingNumber}.`
          : `Menunggu serah terima ke kurir dan penerbitan nomor resi dari pihak ${courierName}.`,
        time: isStep3Done ? `${orderDate} - Sedang Dikirim` : 'Menunggu Pickup Kurir',
        isDone: isStep3Done,
        isCurrent: orderStatus === 'Dikirim',
        statusColor: 'blue'
      },
      {
        stepNum: 4,
        title: '4. Paket Sampai di Alamat Tujuan (Selesai)',
        desc: isStep4Done
          ? `Paket telah berhasil sampai dan diterima di alamat tujuan: ${destinationAddress}. Terima kasih telah berbelanja di Sembako Nusantara!`
          : `Paket akan diantar kurir ke alamat: ${destinationAddress}.`,
        time: isStep4Done ? `${orderDate} - Tiba di Tujuan` : 'Estimasi Pengantaran Kurir',
        isDone: isStep4Done,
        isCurrent: orderStatus === 'Selesai',
        statusColor: 'emerald'
      }
    ];
  };

  const timelineSteps = getTimeline();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
          Lacak Pengiriman Pesanan (配送追跡)
        </h1>
        <p className="text-xs text-stone-500">
          Pantau status paket sembako Anda secara real-time via Yamato Takkyubin & Sagawa Express.
        </p>
      </div>

      {/* Tracking Input Card */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsSearched(true);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-stone-400">
              local_shipping
            </span>
            <input
              type="text"
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              placeholder="Masukkan ID Pesanan / No. Resi (Contoh: SN-JP-123456 / 4829-1029-3841)"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 text-sm focus:border-[#c41230] outline-none font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">search</span>
            <span>Lacak Paket</span>
          </button>
        </form>
      </div>

      {/* Result Timeline or Empty State */}
      {isSearched && trackingNo.trim() ? (
        <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <span className="text-xs text-stone-500">ID Pesanan / Resi:</span>
              <h2 className="font-mono font-bold text-lg text-stone-900">{foundOrder?.id || trackingNo}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-[#c41230]">{courierName}</span>
                {foundOrder?.trackingNumber && (
                  <span className="text-xs font-mono text-stone-400">Resi: {foundOrder.trackingNumber}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                  orderStatus === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : orderStatus === 'Dikirim'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : orderStatus === 'Selesai Packing'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {orderStatus === 'Dikemas' || orderStatus === 'Diproses'
                  ? '1. 📦 Sedang Dikemas'
                  : orderStatus === 'Selesai Packing'
                  ? '2. 📋 Selesai Packing (Cari Ekspedisi)'
                  : orderStatus === 'Dikirim'
                  ? '3. 🚚 Sedang Dikirim (Resi Ada)'
                  : orderStatus === 'Selesai'
                  ? '4. ✅ Paket Sampai di Tujuan'
                  : orderStatus}
              </span>
              <p className="text-[11px] text-stone-500 mt-1">
                {orderStatus === 'Dikemas' || orderStatus === 'Diproses'
                  ? 'Status diperbarui oleh Admin Gudang'
                  : orderStatus === 'Selesai Packing'
                  ? 'Sedang proses pencarian & penjadwalan ekspedisi'
                  : orderStatus === 'Dikirim'
                  ? 'Silakan cek berkala di web ekspedisi'
                  : 'Pesanan telah selesai & sampai di tujuan'}
              </p>
            </div>
          </div>

          {/* Special Courier Web Link & Notice Box for Step 3 & 4 (Dikirim / Selesai) */}
          {(orderStatus === 'Dikirim' || (foundOrder?.trackingNumber && foundOrder.trackingNumber !== '-')) && (
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 text-xl shrink-0 mt-0.5">
                  info
                </span>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-blue-900">
                    Keterangan Pelacakan Resmi Ekspedisi:
                  </p>
                  <p className="text-blue-800 leading-relaxed">
                    Nomor resi Anda telah diterbitkan: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-300 text-blue-900">{foundOrder?.trackingNumber || trackingNo}</strong>. Silakan cek status perjalanan paket secara berkala di web resmi ekspedisi yang Anda pilih saat checkout atau hubungi WhatsApp Customer Service kami.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="https://toi.kuronekoyamato.co.jp/cgi-bin/tneko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-amber-600 text-sm">open_in_new</span>
                  <span>Cek di Web Yamato (クロネコヤマト)</span>
                </a>
                <a
                  href="https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-blue-600 text-sm">open_in_new</span>
                  <span>Cek di Web Sagawa (佐川急便)</span>
                </a>
                <a
                  href={`https://wa.me/6285773875762?text=${encodeURIComponent(
                    `Halo Admin Sembako Nusantara, saya ingin menanyakan info pengiriman pesanan saya ID ${foundOrder?.id || trackingNo} (No. Resi: ${foundOrder?.trackingNumber || trackingNo}). Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-white text-sm">chat</span>
                  <span>Chat CS WhatsApp (Bantuan Resi)</span>
                </a>
              </div>
            </div>
          )}

          {/* Delivery Address & Items Summary */}
          {foundOrder && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex flex-col sm:flex-row justify-between gap-4 text-xs">
              <div>
                <span className="text-stone-400 block mb-0.5">Tujuan Pengiriman:</span>
                <p className="font-bold text-stone-800">{destinationAddress}</p>
                <p className="text-stone-500 text-[11px] mt-0.5">Penerima: {foundOrder.customerName || 'Pelanggan Diaspora'}</p>
              </div>
              <div className="sm:text-right">
                <span className="text-stone-400 block mb-0.5">Total Belanja:</span>
                <p className="font-bold text-stone-900 text-sm">¥{(foundOrder.totalAmount || foundOrder.total || 0).toLocaleString()}</p>
                <p className="text-stone-500 text-[11px] mt-0.5">{foundOrder.items?.length || 0} macam barang</p>
              </div>
            </div>
          )}

          {/* Timeline Items */}
          <div className="relative border-l-2 border-stone-200 ml-4 space-y-8 pl-6 pt-2">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="relative">
                <div
                  className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                    step.isCurrent
                      ? step.statusColor === 'amber'
                        ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse'
                        : step.statusColor === 'blue'
                        ? 'bg-blue-600 ring-4 ring-blue-100 animate-pulse'
                        : 'bg-emerald-600 ring-4 ring-emerald-100 animate-pulse'
                      : step.isDone
                      ? 'bg-emerald-600'
                      : 'bg-stone-300'
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-400">{step.time}</span>
                    {step.isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-900 text-white">
                        Status Saat Ini
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">{step.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#EBE5DF] p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">local_shipping</span>
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-lg text-stone-900">
              Belum Ada Resi yang Dilacak
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Masukkan nomor ID pesanan (misal: SN-JP-123456) atau nomor resi ekspedisi Yamato Transport / Sagawa Express pada kolom di atas.
            </p>
          </div>

          {/* Quick Tracking from Real Customer Orders */}
          {(orders.length > 0 || userOrders.length > 0) && (
            <div className="pt-4 border-t border-stone-100 max-w-md mx-auto space-y-2 text-left">
              <p className="text-xs text-stone-600 font-bold">Pesanan Terbaru Anda:</p>
              {(userOrders.length > 0 ? userOrders : orders).slice(0, 3).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setTrackingNo(ord.id);
                    setIsSearched(true);
                  }}
                  className="w-full py-2.5 px-3 bg-stone-50 hover:bg-red-50 text-stone-800 hover:text-[#c41230] text-xs font-bold rounded-xl border border-stone-200 hover:border-red-200 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#c41230]">package_2</span>
                    <span>{ord.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                      {ord.status}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-stone-400">Lacak →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
