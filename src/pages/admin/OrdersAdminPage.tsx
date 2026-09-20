import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Order } from '../../types';

export const OrdersAdminPage: React.FC = () => {
  const { orders, updateOrderStatus } = useAdmin();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Fulfilling / Tracking Assignment
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');
  const [courierInput, setCourierInput] = useState<Order['courier']>('Yamato Transport');
  const [statusInput, setStatusInput] = useState<Order['status']>('Dikirim');

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
    updateOrderStatus(selectedOrder.id, statusInput, trackingNumberInput, courierInput);
    setSelectedOrder(null);
  };

  return (
    <AdminLayout
      title="Manajemen Pesanan & Kurir Ekspedisi"
      subtitle="Fulfillment order e-commerce, input resi Kuroneko Yamato / Sagawa, dan pembaruan status pengiriman."
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
                placeholder="Cari No. Order, Resi, atau Alamat..."
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
                    ? 'Semua Status'
                    : st === 'Dikemas'
                    ? '1. 📦 Dikemas'
                    : st === 'Selesai Packing'
                    ? '2. 📋 Selesai Packing'
                    : st === 'Dikirim'
                    ? '3. 🚚 Dikirim'
                    : st === 'Selesai'
                    ? '4. ✅ Selesai'
                    : st}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-stone-500 font-semibold">
            Menampilkan <span className="font-bold text-stone-900">{filteredOrders.length}</span> pesanan
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">ID & Tgl Pesanan</th>
                  <th className="px-4 py-3.5">Pelanggan & Item</th>
                  <th className="px-4 py-3.5">Alamat Pengiriman (Jepang)</th>
                  <th className="px-4 py-3.5">Kurir & Resi</th>
                  <th className="px-4 py-3.5">Total Bayar</th>
                  <th className="px-4 py-3.5 text-center">Tahap Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi Admin</th>
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
                        {ord.customerName || 'Pelanggan Diaspora'}
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
                          ? '1. 📦 Sedang Dikemas'
                          : ord.status === 'Selesai Packing'
                          ? '2. 📋 Selesai Packing'
                          : ord.status === 'Dikirim'
                          ? '3. 🚚 Dikirim (Resi Ada)'
                          : ord.status === 'Selesai'
                          ? '4. ✅ Sampai Tujuan'
                          : ord.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenFulfillment(ord)}
                        className="px-3 py-1.5 bg-[#c41230] hover:bg-[#9a0021] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Update Tahap Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fulfillment & Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Update Tahapan Pesanan (Admin)</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 border border-stone-100">
              <div className="font-mono font-bold text-stone-900">{selectedOrder.id}</div>
              <div className="text-stone-500">Penerima: {selectedOrder.customerName || 'Pelanggan'}</div>
              <div className="text-stone-500">Tujuan: {selectedOrder.shippingAddress}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Pilih Tahapan Pesanan (Step):</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as Order['status'])}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                >
                  <option value="Dikemas">Tahap 1: 📦 Sedang Diproses / Dikemas di Gudang</option>
                  <option value="Selesai Packing">Tahap 2: 📋 Selesai Packing (Proses Penjadwalan Ekspedisi)</option>
                  <option value="Dikirim">Tahap 3: 🚚 Dikirim (Input Resi & Serah Terima Kurir)</option>
                  <option value="Selesai">Tahap 4: ✅ Selesai (Paket Sampai di Alamat Tujuan)</option>
                  <option value="Dibatalkan">❌ Batalkan Pesanan</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Pilihan Kurir Ekspedisi:</label>
                <select
                  value={courierInput}
                  onChange={(e) => setCourierInput(e.target.value as Order['courier'])}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
                >
                  <option value="Yamato Transport">Kuroneko Yamato Transport (ヤマト運輸)</option>
                  <option value="Sagawa Express">Sagawa Express (佐川急便)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Nomor Resi Pelacakan (Tracking):</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="Contoh: 4829-1029-3841"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-stone-900"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveFulfillment}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs"
              >
                Simpan Status
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
