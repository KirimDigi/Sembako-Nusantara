import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../context/LanguageContext';

export const TrackingPage: React.FC = () => {
  const { language } = useLanguage();
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

  // Filter riwayat resi/pesanan HANYA untuk akun yang sedang login
  const myAccountOrders = React.useMemo(() => {
    if (!isAuthenticated || !currentUser) {
      return [];
    }

    const allSourceOrders = [...userOrders];
    orders.forEach((admOrd) => {
      if (!allSourceOrders.some((so) => so.id === admOrd.id || so.orderId === admOrd.id)) {
        allSourceOrders.push(admOrd);
      }
    });

    const currentId = currentUser.id?.toLowerCase().trim();
    const currentEmail = currentUser.email?.toLowerCase().trim();
    const currentName = currentUser.name?.toLowerCase().trim();
    const currentPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';

    return allSourceOrders.filter((ord: any) => {
      // 1. Cocokkan ID akun
      if (ord.userId && String(ord.userId).toLowerCase().trim() === currentId) {
        return true;
      }
      // 2. Cocokkan Email
      const ordEmail = (ord.userEmail || ord.email || '')?.toLowerCase().trim();
      if (ordEmail && currentEmail && ordEmail === currentEmail) {
        return true;
      }
      // 3. Cocokkan Nama Pelanggan
      const ordName = (ord.customerName || '')?.toLowerCase().trim();
      if (ordName && currentName && (ordName === currentName || ordName.includes(currentName) || currentName.includes(ordName))) {
        return true;
      }
      // 4. Cocokkan Nomor HP
      if (ord.phone && currentPhone) {
        const ordPhoneClean = String(ord.phone).replace(/[^0-9]/g, '');
        if (ordPhoneClean && ordPhoneClean.length >= 8 && (ordPhoneClean.includes(currentPhone) || currentPhone.includes(ordPhoneClean))) {
          return true;
        }
      }
      return false;
    });
  }, [isAuthenticated, currentUser, userOrders, orders]);

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
        title:
          language === 'JP'
            ? '1. ご注文受付・倉庫での梱包作業中'
            : language === 'EN'
            ? '1. Order Received & Packing in Warehouse'
            : '1. Pesanan Diterima & Sedang Dikemas (Packing Gudang)',
        desc:
          language === 'JP'
            ? '管理者がご注文を確認しました。倉庫スタッフが商品のハラール確認、冷蔵・冷凍梱包を実施しています。'
            : language === 'EN'
            ? 'Order verified by admin. Warehouse team is preparing groceries, checking halal labels, and thermo-box packing.'
            : 'Pesanan telah diverifikasi admin. Tim gudang sedang mempersiapkan sembako, pengecekan sertifikasi halal, dan pengemasan thermo-box.',
        time: isStep1Done
          ? `${orderDate} - ${language === 'JP' ? '処理完了' : language === 'EN' ? 'Processed' : 'Selesai Diproses'}`
          : language === 'JP' ? '確認待ち' : language === 'EN' ? 'Awaiting Confirmation' : 'Menunggu Konfirmasi',
        isDone: isStep1Done,
        isCurrent: orderStatus === 'Dikemas' || orderStatus === 'Diproses',
        statusColor: 'amber'
      },
      {
        stepNum: 2,
        title:
          language === 'JP'
            ? '2. 梱包完了・集荷手配中 (配送会社引き渡し前)'
            : language === 'EN'
            ? '2. Packed & Awaiting Courier Pickup'
            : '2. Selesai Packing (Proses Pencarian & Penjadwalan Ekspedisi)',
        desc:
          language === 'JP'
            ? 'お荷物の梱包が完了しました。ヤマト運輸または佐川急便の集荷スケジュールを手配中です。'
            : language === 'EN'
            ? 'Package safely boxed. Courier pickup is currently being scheduled.'
            : 'Paket telah selesai dibungkus rapi dan aman. Sedang dalam proses penjadwalan penjemputan (pickup) oleh pihak ekspedisi.',
        time: isStep2Done
          ? `${orderDate} - ${language === 'JP' ? '梱包完了' : language === 'EN' ? 'Packed' : 'Selesai Packing'}`
          : language === 'JP' ? '梱包完了待ち' : language === 'EN' ? 'Awaiting Packing' : 'Menunggu Packing Selesai',
        isDone: isStep2Done,
        isCurrent: orderStatus === 'Selesai Packing',
        statusColor: 'purple'
      },
      {
        stepNum: 3,
        title:
          language === 'JP'
            ? `3. 配送会社へ引き渡し・追跡番号発行 (${courierName})`
            : language === 'EN'
            ? `3. Dispatched to Courier & Tracking Active (${courierName})`
            : `3. Diserahkan ke Ekspedisi & Resi Terbit (${courierName})`,
        desc: foundOrder?.trackingNumber && foundOrder.trackingNumber !== '-'
          ? language === 'JP'
            ? `お荷物は${courierName}へ引き渡されました。公式お問い合わせ伝票番号: ${foundOrder.trackingNumber}`
            : language === 'EN'
            ? `Handed over to ${courierName}. Official tracking number: ${foundOrder.trackingNumber}.`
            : `Paket telah diserahkan ke kurir ${courierName}. Nomor resi pengiriman resmi: ${foundOrder.trackingNumber}.`
          : language === 'JP'
          ? `配送業者への引き渡しおよび追跡番号の発行をお待ちください。`
          : language === 'EN'
          ? `Awaiting courier handover and tracking number generation.`
          : `Menunggu serah terima ke kurir dan penerbitan nomor resi dari pihak ${courierName}.`,
        time: isStep3Done
          ? `${orderDate} - ${language === 'JP' ? '輸送中' : language === 'EN' ? 'In Transit' : 'Sedang Dikirim'}`
          : language === 'JP' ? '集荷待ち' : language === 'EN' ? 'Awaiting Pickup' : 'Menunggu Pickup Kurir',
        isDone: isStep3Done,
        isCurrent: orderStatus === 'Dikirim',
        statusColor: 'blue'
      },
      {
        stepNum: 4,
        title:
          language === 'JP'
            ? '4. お届け先に配達完了 (完了)'
            : language === 'EN'
            ? '4. Delivered to Destination (Completed)'
            : '4. Paket Sampai di Alamat Tujuan (Selesai)',
        desc: isStep4Done
          ? language === 'JP'
            ? `お届け先へ無事に配達完了いたしました: ${destinationAddress}。ご利用ありがとうございました！`
            : language === 'EN'
            ? `Package successfully delivered to destination: ${destinationAddress}. Thank you for shopping with us!`
            : `Paket telah berhasil sampai dan diterima di alamat tujuan: ${destinationAddress}. Terima kasih telah berbelanja di Sembako Nusantara!`
          : language === 'JP'
          ? `お届け先へ配送予定です: ${destinationAddress}`
          : language === 'EN'
          ? `Package will be delivered to: ${destinationAddress}.`
          : `Paket akan diantar kurir ke alamat: ${destinationAddress}.`,
        time: isStep4Done
          ? `${orderDate} - ${language === 'JP' ? '配達完了' : language === 'EN' ? 'Delivered' : 'Tiba di Tujuan'}`
          : language === 'JP' ? '配達予定' : language === 'EN' ? 'Estimated Delivery' : 'Estimasi Pengantaran Kurir',
        isDone: isStep4Done,
        isCurrent: orderStatus === 'Selesai',
        statusColor: 'emerald'
      }
    ];
  };

  const timelineSteps = getTimeline();

  const getOrderStatusLabel = (status: string) => {
    if (language === 'JP') {
      if (status === 'Dikemas' || status === 'Diproses') return '1. 📦 梱包作業中';
      if (status === 'Selesai Packing') return '2. 📋 梱包完了・集荷待ち';
      if (status === 'Dikirim') return '3. 🚚 配送中 (伝票番号あり)';
      if (status === 'Selesai') return '4. ✅ 配達完了';
      if (status === 'Dibatalkan') return 'キャンセル済み';
      return status;
    }
    if (language === 'EN') {
      if (status === 'Dikemas' || status === 'Diproses') return '1. 📦 Packing';
      if (status === 'Selesai Packing') return '2. 📋 Packed (Awaiting Pickup)';
      if (status === 'Dikirim') return '3. 🚚 Shipped (In Transit)';
      if (status === 'Selesai') return '4. ✅ Delivered';
      if (status === 'Dibatalkan') return 'Cancelled';
      return status;
    }
    if (status === 'Dikemas' || status === 'Diproses') return '1. 📦 Sedang Dikemas';
    if (status === 'Selesai Packing') return '2. 📋 Selesai Packing (Cari Ekspedisi)';
    if (status === 'Dikirim') return '3. 🚚 Sedang Dikirim (Resi Ada)';
    if (status === 'Selesai') return '4. ✅ Paket Sampai di Tujuan';
    return status;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
          {language === 'JP' ? '注文履歴・配送状況の追跡 (Pesanan Saya)' : language === 'EN' ? 'My Orders & Tracking (Pesanan Saya)' : 'Pesanan Saya (Lacak Status Pengiriman Order)'}
        </h1>
        <p className="text-xs text-stone-500">
          {language === 'JP'
            ? 'ヤマト運輸（宅急便）および佐川急便のリアルタイム配送状況をご確認いただけます。'
            : language === 'EN'
            ? 'Monitor your grocery package in real-time via Yamato Takkyubin & Sagawa Express.'
            : 'Pantau status paket sembako Anda secara real-time via Yamato Takkyubin & Sagawa Express.'}
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
              placeholder={
                language === 'JP'
                  ? 'ごちゅうもん ばんごう / おといあわせ ばんごう を にゅうりょく (れい: SN-JP-123456)'
                  : language === 'EN'
                  ? 'Enter Order ID / Tracking Number (e.g. SN-JP-123456)'
                  : 'Masukkan ID Pesanan / No. Resi (Contoh: SN-JP-123456 / 4829-1029-3841)'
              }
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 text-sm focus:border-[#c41230] outline-none font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">search</span>
            <span>{language === 'JP' ? 'お荷物を追跡' : language === 'EN' ? 'Track Package' : 'Lacak Paket'}</span>
          </button>
        </form>
      </div>

      {/* Result Timeline or Empty State */}
      {isSearched && trackingNo.trim() ? (
        <div className="bg-white rounded-3xl border border-[#EBE5DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <span className="text-xs text-stone-500">
                {language === 'JP' ? 'ご注文ID / 伝票番号:' : language === 'EN' ? 'Order ID / Tracking:' : 'ID Pesanan / Resi:'}
              </span>
              <h2 className="font-mono font-bold text-lg text-stone-900">{foundOrder?.id || trackingNo}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-[#c41230]">{courierName}</span>
                {foundOrder?.trackingNumber && (
                  <span className="text-xs font-mono text-stone-400">
                    {language === 'JP' ? '伝票番号: ' : language === 'EN' ? 'Tracking: ' : 'Resi: '}
                    {foundOrder.trackingNumber}
                  </span>
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
                    : orderStatus === 'Dibatalkan'
                    ? 'bg-red-100 text-[#c41230] border border-red-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {getOrderStatusLabel(orderStatus)}
              </span>
              <p className="text-[11px] text-stone-500 mt-1">
                {language === 'JP'
                  ? (orderStatus === 'Dikemas' || orderStatus === 'Diproses'
                    ? '倉庫管理者によってステータスが更新されました'
                    : orderStatus === 'Selesai Packing'
                    ? '配送会社の集荷手配中です'
                    : orderStatus === 'Dikirim'
                    ? '配送会社の公式Webサイトで定期的にご確認ください'
                    : orderStatus === 'Dibatalkan'
                    ? 'ご注文はキャンセルされました'
                    : 'ご注文は無事に完了いたしました')
                  : language === 'EN'
                  ? (orderStatus === 'Dikemas' || orderStatus === 'Diproses'
                    ? 'Status updated by warehouse admin'
                    : orderStatus === 'Selesai Packing'
                    ? 'Courier pickup scheduling in progress'
                    : orderStatus === 'Dikirim'
                    ? 'Please check regularly on courier website'
                    : orderStatus === 'Dibatalkan'
                    ? 'This order has been cancelled'
                    : 'Order completed & safely delivered')
                  : (orderStatus === 'Dikemas' || orderStatus === 'Diproses'
                    ? 'Status diperbarui oleh Admin Gudang'
                    : orderStatus === 'Selesai Packing'
                    ? 'Sedang proses pencarian & penjadwalan ekspedisi'
                    : orderStatus === 'Dikirim'
                    ? 'Silakan cek berkala di web ekspedisi'
                    : orderStatus === 'Dibatalkan'
                    ? 'Pesanan ini telah dibatalkan'
                    : 'Pesanan telah selesai & sampai di tujuan')}
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
                    {language === 'JP' ? '配送会社の公式追跡案内:' : language === 'EN' ? 'Official Courier Tracking Note:' : 'Keterangan Pelacakan Resmi Ekspedisi:'}
                  </p>
                  <p className="text-blue-800 leading-relaxed">
                    {language === 'JP' ? (
                      <>
                        お問い合わせ伝票番号が発行されました: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-300 text-blue-900">{foundOrder?.trackingNumber || trackingNo}</strong>。各配送会社の公式サイトで配送状況をご確認いただくか、公式LINE/WhatsAppまでお問い合わせください。
                      </>
                    ) : language === 'EN' ? (
                      <>
                        Your tracking number is active: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-300 text-blue-900">{foundOrder?.trackingNumber || trackingNo}</strong>. Please check delivery progress on the courier official website or contact our support.
                      </>
                    ) : (
                      <>
                        Nomor resi Anda telah diterbitkan: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-300 text-blue-900">{foundOrder?.trackingNumber || trackingNo}</strong>. Silakan cek status perjalanan paket secara berkala di web resmi ekspedisi atau hubungi WhatsApp Customer Service kami.
                      </>
                    )}
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
                  <span>{language === 'JP' ? 'ヤマト運輸Webで確認' : language === 'EN' ? 'Check on Yamato Transport' : 'Cek di Web Yamato Transport'}</span>
                </a>
                <a
                  href="https://k2k.sagawa-exp.co.jp/p/sagawa/web/okurijoinput.do"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-blue-600 text-sm">open_in_new</span>
                  <span>{language === 'JP' ? '佐川急便Webで確認' : language === 'EN' ? 'Check on Sagawa Express' : 'Cek di Web Sagawa Express'}</span>
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
                  <span>{language === 'JP' ? 'WhatsAppサポート (追跡ヘルプ)' : language === 'EN' ? 'WhatsApp Support (Tracking Help)' : 'Chat CS WhatsApp (Bantuan Resi)'}</span>
                </a>
              </div>
            </div>
          )}

          {/* Delivery Address & Items Summary */}
          {foundOrder && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex flex-col sm:flex-row justify-between gap-4 text-xs">
              <div>
                <span className="text-stone-400 block mb-0.5">
                  {language === 'JP' ? 'お届け先住所:' : language === 'EN' ? 'Shipping Destination:' : 'Tujuan Pengiriman:'}
                </span>
                <p className="font-bold text-stone-800">{destinationAddress}</p>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  {language === 'JP' ? '受取人: ' : language === 'EN' ? 'Recipient: ' : 'Penerima: '}
                  {foundOrder.customerName || (language === 'JP' ? 'ご注文者様' : language === 'EN' ? 'Customer' : 'Pelanggan Diaspora')}
                </p>
              </div>
              <div className="sm:text-right">
                <span className="text-stone-400 block mb-0.5">
                  {language === 'JP' ? 'お支払い合計:' : language === 'EN' ? 'Total Amount:' : 'Total Belanja:'}
                </span>
                <p className="font-bold text-stone-900 text-sm">¥{(foundOrder.totalAmount || foundOrder.total || 0).toLocaleString()}</p>
                <p className="text-stone-500 text-[11px] mt-0.5">
                  {foundOrder.items?.length || 0} {language === 'JP' ? '点の商品' : language === 'EN' ? 'items' : 'macam barang'}
                </p>
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
                        {language === 'JP' ? '現在の状況' : language === 'EN' ? 'Current Status' : 'Status Saat Ini'}
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
              {language === 'JP' ? '追跡中の荷物はありません' : language === 'EN' ? 'No Package Tracked Yet' : 'Belum Ada Resi yang Dilacak'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {language === 'JP'
                ? '上の検索欄にご注文番号（例: SN-JP-123456）またはヤマト運輸・佐川急便の伝票番号を入力してください。'
                : language === 'EN'
                ? 'Enter your Order ID (e.g. SN-JP-123456) or Yamato Transport / Sagawa Express tracking number above.'
                : 'Masukkan nomor ID pesanan (misal: SN-JP-123456) atau nomor resi ekspedisi Yamato Transport / Sagawa Express pada kolom di atas.'}
            </p>
          </div>

          {/* Quick Tracking - Restricted strictly to the user's logged-in account */}
          {isAuthenticated && currentUser ? (
            myAccountOrders.length > 0 ? (
              <div className="pt-4 border-t border-stone-100 max-w-md mx-auto space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-700 font-bold">
                    {language === 'JP'
                      ? `最近のご注文 (${currentUser.name}):`
                      : language === 'EN'
                      ? `Recent Orders (${currentUser.name}):`
                      : `Pesanan Terbaru Akun Anda (${currentUser.name}):`}
                  </p>
                  <Link to="/orders" className="text-[11px] text-[#c41230] hover:underline font-bold">
                    {language === 'JP' ? 'すべての注文 →' : language === 'EN' ? 'All Orders →' : 'Semua Pesanan →'}
                  </Link>
                </div>
                {myAccountOrders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setTrackingNo(ord.id);
                      setIsSearched(true);
                    }}
                    className="w-full py-2.5 px-3 bg-stone-50 hover:bg-red-50 text-stone-800 hover:text-[#c41230] text-xs font-bold rounded-xl border border-stone-200 hover:border-red-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-sm text-[#c41230] shrink-0">package_2</span>
                      <span className="truncate">{ord.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        ord.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Dibatalkan'
                          ? 'bg-red-100 text-[#c41230]'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {language === 'JP'
                          ? (ord.status === 'Dibatalkan' ? 'キャンセル' : ord.status === 'Selesai' ? '完了' : ord.status === 'Dikirim' ? '発送済' : '梱包中')
                          : language === 'EN'
                          ? (ord.status === 'Dibatalkan' ? 'Cancelled' : ord.status === 'Selesai' ? 'Completed' : ord.status === 'Dikirim' ? 'Shipped' : 'Packing')
                          : ord.status}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-stone-400 shrink-0">
                      {language === 'JP' ? '追跡 →' : language === 'EN' ? 'Track →' : 'Lacak →'}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="pt-4 border-t border-stone-100 max-w-md mx-auto space-y-2 text-left">
                <p className="text-xs text-stone-700 font-bold">
                  {language === 'JP' ? '最近のご注文:' : language === 'EN' ? 'Recent Orders:' : 'Pesanan Terbaru Akun Anda:'}
                </p>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 text-center">
                  {language === 'JP'
                    ? `アカウント (${currentUser.name}) にご注文履歴はありません。`
                    : language === 'EN'
                    ? `No order history found for your account (${currentUser.name}).`
                    : `Belum ada riwayat pesanan pada akun Anda (${currentUser.name}).`}
                </div>
              </div>
            )
          ) : (
            <div className="pt-4 border-t border-stone-100 max-w-md mx-auto space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-xs text-stone-700 font-bold">
                <span className="material-symbols-outlined text-sm text-[#c41230]">lock</span>
                <span>
                  {language === 'JP' ? 'アカウントの配送追跡履歴:' : language === 'EN' ? 'Account Tracking History:' : 'Riwayat Resi Akun:'}
                </span>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-[11px] leading-relaxed">
                  {language === 'JP'
                    ? 'ご注文の伝票番号履歴はログイン中の会員様のみ閲覧可能です。'
                    : language === 'EN'
                    ? 'Tracking history is accessible only by logged in order owners.'
                    : 'Riwayat nomor resi hanya dapat diakses oleh akun pemilik pesanan. Silakan masuk ke akun Anda.'}
                </p>
                <Link
                  to="/account"
                  className="shrink-0 px-3.5 py-1.5 bg-[#c41230] hover:bg-[#9a0021] text-white rounded-xl font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">login</span>
                  <span>{language === 'JP' ? 'ログイン' : language === 'EN' ? 'Sign In' : 'Masuk Akun'}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
