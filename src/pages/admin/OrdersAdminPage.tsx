import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Order } from '../../types';

export const OrdersAdminPage: React.FC = () => {
  const { orders, updateOrderStatus, cancelOrder } = useAdmin();
  const { language } = useLanguage();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Fulfilling / Tracking Assignment
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');
  const [courierInput, setCourierInput] = useState<Order['courier']>('Yamato Transport');
  const [statusInput, setStatusInput] = useState<Order['status']>('Dikirim');

  // Modal State for Cancelling Order
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Permintaan Pembeli / Customer Request');
  const [cancelSuccessToast, setCancelSuccessToast] = useState<string | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchStatus = filterStatus === 'all' || ord.status === filterStatus;
    const matchQuery =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.shippingAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const handleOpenFulfillment = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumberInput(order.trackingNumber || '');
    setCourierInput(order.courier);
    setStatusInput(order.status);
  };

  const handleSaveFulfillment = () => {
    if (!selectedOrder) return;
    if (statusInput === 'Dibatalkan') {
      cancelOrder(selectedOrder.id, 'Dibatalkan via update tahapan');
      setCancelSuccessToast(`Pesanan #${selectedOrder.id} berhasil dibatalkan dan stok dikembalikan!`);
      setTimeout(() => setCancelSuccessToast(null), 3000);
    } else {
      updateOrderStatus(selectedOrder.id, statusInput, trackingNumberInput, courierInput);
    }
    setSelectedOrder(null);
  };

  const handleConfirmCancelOrder = () => {
    if (!orderToCancel) return;
    cancelOrder(orderToCancel.id, cancelReason);
    setCancelSuccessToast(`Pesanan #${orderToCancel.id} berhasil dibatalkan.`);
    setTimeout(() => setCancelSuccessToast(null), 3500);
    setOrderToCancel(null);
  };

  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: '注文・配送ステータス管理',
        subtitle: 'Eコマース注文の出荷処理、ヤマト運輸・佐川急便の追跡番号入力、ステータス更新。',
        searchPlaceholder: '注文番号、追跡番号、住所を検索...',
        statusAll: 'すべてのステータス',
        status1: '1. 📦 梱包準備中',
        status2: '2. 📋 梱包完了',
        status3: '3. 🚚 発送済み',
        status4: '4. ✅ 配達完了',
        statusCancelled: 'キャンセル',
        showingOrders: (cnt: number) => `表示中: ${cnt} 件の注文`,
        thOrderIdDate: '注文ID & 日時',
        thCustomerItems: '顧客名 & 購入商品',
        thAddress: '配送先住所 (日本国内)',
        thCourierTracking: '配送業者 & 追跡番号',
        thTotal: '支払合計 (税込)',
        thStatus: '配送ステータス',
        thAction: '操作',
        btnUpdateStatus: 'ステータス更新',
        modalTitle: '配送ステータス更新 (管理者)',
        modalReceiver: '受取人:',
        modalDest: '配送先:',
        labelStep: '配送フェーズ選択 (Step):',
        optStep1: 'ステップ 1: 📦 倉庫にて梱包・ピッキング中',
        optStep2: 'ステップ 2: 📋 梱包完了 (集荷手配中)',
        optStep3: 'ステップ 3: 🚚 発送完了 (追跡番号発行・配送会社引渡)',
        optStep4: 'ステップ 4: ✅ 配達完了 (お届け先到着)',
        optCancel: '❌ 注文をキャンセル',
        labelCourier: '配送業者選択:',
        labelTracking: '送り状追跡番号 (Tracking):',
        trackingPlaceholder: '例: 4829-1029-3841',
        btnCancel: 'キャンセル',
        btnSave: 'ステータス保存'
      };
    } else if (language === 'EN') {
      return {
        title: 'Order Fulfillment & Courier Management',
        subtitle: 'E-commerce fulfillment, tracking number input for Yamato & Sagawa, and delivery status updates.',
        searchPlaceholder: 'Search Order ID, Tracking, or Address...',
        statusAll: 'All Statuses',
        status1: '1. 📦 Packing',
        status2: '2. 📋 Packed',
        status3: '3. 🚚 Shipped',
        status4: '4. ✅ Delivered',
        statusCancelled: 'Cancelled',
        showingOrders: (cnt: number) => `Showing ${cnt} orders`,
        thOrderIdDate: 'Order ID & Date',
        thCustomerItems: 'Customer & Items',
        thAddress: 'Shipping Address (Japan)',
        thCourierTracking: 'Courier & Tracking',
        thTotal: 'Total Paid',
        thStatus: 'Status Stage',
        thAction: 'Admin Action',
        btnUpdateStatus: 'Update Status',
        modalTitle: 'Order Fulfillment Update (Admin)',
        modalReceiver: 'Recipient:',
        modalDest: 'Destination:',
        labelStep: 'Select Fulfillment Stage:',
        optStep1: 'Stage 1: 📦 Processing & Packing in Warehouse',
        optStep2: 'Stage 2: 📋 Packed & Awaiting Courier Pickup',
        optStep3: 'Stage 3: 🚚 Shipped (Tracking Assigned & Handed to Courier)',
        optStep4: 'Stage 4: ✅ Delivered (Arrived at Destination)',
        optCancel: '❌ Cancel Order',
        labelCourier: 'Courier Provider:',
        labelTracking: 'Tracking Number:',
        trackingPlaceholder: 'e.g. 4829-1029-3841',
        btnCancel: 'Cancel',
        btnSave: 'Save Status'
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'Manajemen Pesanan & Kurir Ekspedisi',
        subtitle: 'Fulfillment order e-commerce, input resi Kuroneko Yamato / Sagawa, dan pembaruan status pengiriman.',
        searchPlaceholder: 'Cari No. Order, Resi, atau Alamat...',
        statusAll: 'Semua Status',
        status1: '1. 📦 Dikemas',
        status2: '2. 📋 Selesai Packing',
        status3: '3. 🚚 Dikirim',
        status4: '4. ✅ Selesai',
        statusCancelled: 'Dibatalkan',
        showingOrders: (cnt: number) => `Menampilkan ${cnt} pesanan`,
        thOrderIdDate: 'ID & Tgl Pesanan',
        thCustomerItems: 'Pelanggan & Item',
        thAddress: 'Alamat Pengiriman (Jepang)',
        thCourierTracking: 'Kurir & Resi',
        thTotal: 'Total Bayar',
        thStatus: 'Tahap Status',
        thAction: 'Aksi Admin',
        btnUpdateStatus: 'Update Tahap Status',
        modalTitle: 'Update Tahapan Pesanan (Admin)',
        modalReceiver: 'Penerima:',
        modalDest: 'Tujuan:',
        labelStep: 'Pilih Tahapan Pesanan (Step):',
        optStep1: 'Tahap 1: 📦 Sedang Diproses / Dikemas di Gudang',
        optStep2: 'Tahap 2: 📋 Selesai Packing (Proses Penjadwalan Ekspedisi)',
        optStep3: 'Tahap 3: 🚚 Dikirim (Input Resi & Serah Terima Kurir)',
        optStep4: 'Tahap 4: ✅ Selesai (Paket Sampai di Alamat Tujuan)',
        optCancel: '❌ Batalkan Pesanan',
        labelCourier: 'Pilihan Kurir Ekspedisi:',
        labelTracking: 'Nomor Resi Pelacakan (Tracking):',
        trackingPlaceholder: 'Contoh: 4829-1029-3841',
        btnCancel: 'Batal',
        btnSave: 'Simpan Status'
      };
    }
  }, [language]);

  return (
    <AdminLayout
      title={txt.title}
      subtitle={txt.subtitle}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={txt.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
              />
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-xl">
              {['all', 'Dikemas', 'Selesai Packing', 'Dikirim', 'Selesai', 'Dibatalkan'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === st
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {st === 'all'
                    ? txt.statusAll
                    : st === 'Dikemas'
                    ? txt.status1
                    : st === 'Selesai Packing'
                    ? txt.status2
                    : st === 'Dikirim'
                    ? txt.status3
                    : st === 'Selesai'
                    ? txt.status4
                    : txt.statusCancelled}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-stone-500 font-semibold">
            {txt.showingOrders(filteredOrders.length)}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">{txt.thOrderIdDate}</th>
                  <th className="px-4 py-3.5">{txt.thCustomerItems}</th>
                  <th className="px-4 py-3.5">{txt.thAddress}</th>
                  <th className="px-4 py-3.5">{txt.thCourierTracking}</th>
                  <th className="px-4 py-3.5">{txt.thTotal}</th>
                  <th className="px-4 py-3.5 text-center">{txt.thStatus}</th>
                  <th className="px-5 py-3.5 text-right">{txt.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-stone-900 text-xs">{ord.id}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{ord.date}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-stone-900 text-xs mb-1">
                        {ord.customerName || (language === 'JP' ? 'ディアスポラ顧客' : language === 'EN' ? 'Diaspora Customer' : 'Pelanggan Diaspora')}
                      </div>
                      <div className="space-y-0.5 max-w-[200px]">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="truncate text-stone-600 text-[11px]">
                            • {it.productName} <span className="text-stone-400 font-bold">x{it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="text-[11px] text-stone-600 line-clamp-2">{ord.shippingAddress}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-stone-800">{ord.courier}</div>
                      <div className="font-mono text-[10px] text-stone-500 font-bold">{ord.trackingNumber || '-'}</div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-stone-900">
                      ¥{ord.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          ord.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : ord.status === 'Dikirim'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : ord.status === 'Selesai Packing'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : ord.status === 'Dikemas' || ord.status === 'Diproses'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {ord.status === 'Dikemas'
                          ? txt.status1
                          : ord.status === 'Selesai Packing'
                          ? txt.status2
                          : ord.status === 'Dikirim'
                          ? txt.status3
                          : ord.status === 'Selesai'
                          ? txt.status4
                          : ord.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleOpenFulfillment(ord)}
                          className="px-3 py-1.5 bg-[#c41230] hover:bg-[#9a0021] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          {txt.btnUpdateStatus}
                        </button>

                        {ord.status !== 'Dibatalkan' ? (
                          <button
                            onClick={() => {
                              setOrderToCancel(ord);
                              setCancelReason('Permintaan Pembeli / Customer Request');
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 hover:text-rose-800 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-2xs"
                            title="Batalkan Pesanan Ini"
                          >
                            <span className="material-symbols-outlined text-xs">cancel</span>
                            <span>Batalkan</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              updateOrderStatus(ord.id, 'Dikemas');
                              setCancelSuccessToast(`Pesanan #${ord.id} diaktifkan kembali.`);
                              setTimeout(() => setCancelSuccessToast(null), 3000);
                            }}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
                            title="Aktifkan Kembali Pesanan"
                          >
                            <span className="material-symbols-outlined text-xs">restart_alt</span>
                            <span>Buka Lagi</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {cancelSuccessToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-xs sm:text-sm font-semibold">{cancelSuccessToast}</span>
        </div>
      )}

      {/* MODAL: BATALKAN PESANAN ORDER */}
      {orderToCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-stone-900 relative">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-rose-600">
                <span className="material-symbols-outlined text-2xl">error</span>
                <h3 className="font-heading font-bold text-base text-stone-900">
                  Batalkan Pesanan #{orderToCancel.id}
                </h3>
              </div>
              <button
                onClick={() => setOrderToCancel(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1 rounded-full hover:bg-stone-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs space-y-1.5 text-stone-700">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Penerima:</span>
                <span className="font-bold text-stone-900">{orderToCancel.customerName || 'Pelanggan'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Total Belanja:</span>
                <span className="font-bold text-rose-700 text-sm">¥{orderToCancel.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Jumlah Produk:</span>
                <span className="font-bold text-stone-900">{orderToCancel.items.length} item</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Alasan Pembatalan Pesanan:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Permintaan Pembeli / Customer Request">Permintaan Pembeli / Customer Request</option>
                <option value="Stok Produk di Gudang Kosong / Habis">Stok Produk di Gudang Kosong / Habis</option>
                <option value="Alamat Pengiriman Salah / Tidak Lengkap">Alamat Pengiriman Salah / Tidak Lengkap</option>
                <option value="Pembayaran Gagal / Dibatalkan">Pembayaran Gagal / Dibatalkan</option>
                <option value="Pesanan Duplikat">Pesanan Duplikat</option>
                <option value="Lainnya">Alasan Lainnya</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-900 leading-tight">
              <span className="material-symbols-outlined text-sm text-amber-700 shrink-0 mt-0.5">info</span>
              <span>
                <strong>Catatan Stok:</strong> Seluruh stok produk pada pesanan ini akan otomatis dikembalikan ke gudang penyimpanan toko.
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup / Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">cancel</span>
                <span>Ya, Batalkan Pesanan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment & Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">{txt.modalTitle}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 border border-stone-100">
              <div className="font-mono font-bold text-stone-900">{selectedOrder.id}</div>
              <div className="text-stone-500">{txt.modalReceiver} {selectedOrder.customerName || 'Customer'}</div>
              <div className="text-stone-500">{txt.modalDest} {selectedOrder.shippingAddress}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.labelStep}</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as Order['status'])}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                >
                  <option value="Dikemas">{txt.optStep1}</option>
                  <option value="Selesai Packing">{txt.optStep2}</option>
                  <option value="Dikirim">{txt.optStep3}</option>
                  <option value="Selesai">{txt.optStep4}</option>
                  <option value="Dibatalkan">{txt.optCancel}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.labelCourier}</label>
                <select
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value as Order['courier'])}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                >
                  <option value="Yamato Transport">Kuroneko Yamato Transport</option>
                  <option value="Sagawa Express">Sagawa Express</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.labelTracking}</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder={txt.trackingPlaceholder}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
              >
                {txt.btnCancel}
              </button>
              <button
                onClick={handleSaveFulfillment}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs"
              >
                {txt.btnSave}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
