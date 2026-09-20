import React from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';

export const AdminDashboardPage: React.FC = () => {
  const { products, orders, posTransactions, purchaseOrders } = useAdmin();

  // Calculations
  const totalPosRevenue = posTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOnlineRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalGrossRevenue = totalPosRevenue + totalOnlineRevenue;
  const totalTransactionsCount = posTransactions.length + orders.length;

  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const pendingOrders = orders.filter((o) => o.status === 'Dikemas' || o.status === 'Diproses');
  const activePO = purchaseOrders.filter((po) => po.status === 'Sent' || po.status === 'Draft');

  return (
    <AdminLayout
      title="Dashboard Ringkasan Bisnis"
      subtitle="Monitoring performa penjualan online e-commerce, kasir POS toko, dan inventaris real-time."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Omzet */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Omzet Gabungan</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900">
              ¥{totalGrossRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-500 font-medium">
              <span className="material-symbols-outlined text-xs text-emerald-600">
                {totalGrossRevenue > 0 ? 'trending_up' : 'storefront'}
              </span>
              <span>
                {totalGrossRevenue > 0
                  ? '+18.4% vs bulan lalu (Pertumbuhan Pesat)'
                  : 'Sistem Toko Baru (Siap Menerima Transaksi)'}
              </span>
            </div>
          </div>

          {/* Card 2: POS Offline vs Online */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Kasir POS (Toko Fisik)</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-[#c41230] flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">point_of_sale</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900">
              ¥{totalPosRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              {posTransactions.length} Transaksi Kasir Hari Ini
            </p>
          </div>

          {/* Card 3: Online Orders */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">E-Commerce Web</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">shopping_cart</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900">
              ¥{totalOnlineRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              {orders.length} Pesanan (
              <span className="text-amber-600 font-bold">{pendingOrders.length} Perlu Dikirim</span>)
            </p>
          </div>

          {/* Card 4: Inventory Alert */}
          <Link
            to="/admin/products"
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-[#c41230] transition-colors block group"
          >
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Status Stok & Master SKU</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-red-50 group-hover:text-[#c41230] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-stone-900 group-hover:text-[#c41230] transition-colors">
              {products.length} SKU Aktif
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">warning</span>
                <span>{lowStockProducts.length} Perlu Restock</span>
              </span>
              <span className="text-[#c41230] font-bold group-hover:underline">Kelola &rarr;</span>
            </div>
          </Link>
        </div>

        {/* Middle Section: Channel Sales Split & Low Stock Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Breakdown */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230] text-base">pie_chart</span>
                <span>Komparasi Channel Penjualan (Online vs Offline POS)</span>
              </h3>
              <span className="text-xs text-stone-400">Bulan Berjalan</span>
            </div>

            {/* Visual Bar */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-700">Toko Online Web (Kirim Seluruh Jepang via Yamato/Sagawa)</span>
                  <span className="text-blue-600">
                    ¥{totalOnlineRevenue.toLocaleString()} (
                    {totalGrossRevenue > 0
                      ? Math.round((totalOnlineRevenue / totalGrossRevenue) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalGrossRevenue > 0
                          ? (totalOnlineRevenue / totalGrossRevenue) * 100
                          : 50
                      }%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-700">Kasir Toko Fisik (POS Tokyo / Walk-in Customer)</span>
                  <span className="text-[#c41230]">
                    ¥{totalPosRevenue.toLocaleString()} (
                    {totalGrossRevenue > 0
                      ? Math.round((totalPosRevenue / totalGrossRevenue) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c41230] rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalGrossRevenue > 0
                          ? (totalPosRevenue / totalGrossRevenue) * 100
                          : 50
                      }%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-stone-100 text-center">
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-[10px] text-stone-500 block">Rata-rata Order (AOV)</span>
                <span className="text-sm font-bold text-stone-900">
                  ¥
                  {totalTransactionsCount > 0
                    ? Math.round(totalGrossRevenue / totalTransactionsCount).toLocaleString()
                    : 0}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-[10px] text-stone-500 block">Pesanan Pending Kirim</span>
                <span className="text-sm font-bold text-amber-600">{pendingOrders.length} Paket</span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl">
                <span className="text-[10px] text-stone-500 block">PO Supplier Aktif</span>
                <span className="text-sm font-bold text-indigo-600">{activePO.length} PO</span>
              </div>
            </div>
          </div>

          {/* Low Stock Actions */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500 text-base">notification_important</span>
                  <span>Perlu Restock Segera</span>
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {lowStockProducts.length} Produk
                </span>
              </div>

              <div className="space-y-2.5 mt-3">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover border border-stone-200"
                      />
                      <div>
                        <div className="font-bold text-stone-900 truncate max-w-[140px]">{p.name}</div>
                        <div className="text-[10px] text-stone-400">¥{p.price.toLocaleString()}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold rounded-md text-[11px]">
                      Sisa {p.stock}
                    </span>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-6">
                    Semua persediaan produk aman di atas ambang minimum.
                  </p>
                )}
              </div>
            </div>

            <Link
              to="/admin/purchasing"
              className="mt-4 w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
              <span>Buat Purchase Order (PO)</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section: Recent Orders & Recent POS Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Online Orders */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-base">shopping_bag</span>
                <span>Pesanan Web E-Commerce Terbaru</span>
              </h3>
              <Link to="/admin/orders" className="text-xs font-bold text-[#c41230] hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      <span>{ord.id}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          ord.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Dikirim'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      {ord.date} • {ord.courier} ({ord.items.length} Barang)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-stone-900">¥{ord.totalAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{ord.trackingNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent POS Transactions */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c41230] text-base">receipt_long</span>
                <span>Transaksi Kasir POS Terbaru</span>
              </h3>
              <Link to="/admin/pos" className="text-xs font-bold text-[#c41230] hover:underline">
                Buka Kasir
              </Link>
            </div>

            <div className="space-y-3">
              {posTransactions.slice(0, 3).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      <span>{tx.receiptNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      {tx.date} • {tx.cashierName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-stone-900">¥{tx.totalAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Lunas</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
