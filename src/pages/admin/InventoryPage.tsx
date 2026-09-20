import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Product } from '../../types';

export const InventoryPage: React.FC = () => {
  const { products, warehouses, stockMovements, updateProductStock } = useAdmin();

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  // Modal State for Stock Adjustment
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Stock Opname Rutin');

  // Modal State for Warehouse Transfer
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);
  const [transferQty, setTransferQty] = useState<number>(1);
  const [fromWarehouse, setFromWarehouse] = useState<string>('wh-tokyo');
  const [toWarehouse, setToWarehouse] = useState<string>('wh-osaka');

  // Calculations
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchQuery) return false;

    if (filterStatus === 'low') return p.stock > 0 && p.stock <= 5;
    if (filterStatus === 'out') return p.stock === 0;
    return true;
  });

  const handleSaveAdjustment = () => {
    if (!adjustingProduct || adjustQuantity === 0) return;
    updateProductStock(
      adjustingProduct.id,
      adjustQuantity,
      adjustReason,
      'ADJUSTMENT',
      selectedWarehouse === 'all' ? 'wh-tokyo' : selectedWarehouse
    );
    setAdjustingProduct(null);
    setAdjustQuantity(0);
  };

  const handleSaveTransfer = () => {
    if (!transferProduct || transferQty <= 0) return;
    if (fromWarehouse === toWarehouse) {
      alert('Gudang asal dan tujuan tidak boleh sama!');
      return;
    }
    updateProductStock(
      transferProduct.id,
      0, // Total overall doesn't change, but logged in movement
      `Mutasi ${transferQty} pcs dari ${fromWarehouse} ke ${toWarehouse}`,
      'TRANSFER',
      fromWarehouse,
      toWarehouse
    );
    setTransferProduct(null);
    setTransferQty(1);
  };

  return (
    <AdminLayout
      title="Manajemen Inventaris & Multi-Gudang"
      subtitle="Monitoring stok terpadu, peringatan stok kritis, dan mutasi barang antar gudang (Tokyo & Osaka Hub)."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Total Unit Persediaan</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {totalStockCount.toLocaleString()} <span className="text-xs font-normal text-stone-500">Pcs</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">{products.length} SKU terdaftar</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Nilai Aset Stok (Retail)</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              ¥{totalStockValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">Termasuk Pajak Konsumsi</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Stok Kritis (&le; 5)</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount} SKU</div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">Perlu Restock Segera</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">Stok Habis (0)</span>
            <div className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount} SKU</div>
            <div className="text-[11px] text-red-700 font-medium mt-1">Status Kosong di Web</div>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari SKU atau nama produk..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
              />
            </div>

            {/* Warehouse Filter */}
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none"
            >
              <option value="all">Semua Gudang (Konsolidasi)</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  filterStatus === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('low')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  filterStatus === 'low' ? 'bg-white text-amber-700 shadow-xs' : 'text-stone-500'
                }`}
              >
                Menipis
              </button>
              <button
                onClick={() => setFilterStatus('out')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  filterStatus === 'out' ? 'bg-white text-red-600 shadow-xs' : 'text-stone-500'
                }`}
              >
                Habis
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Produk</th>
                  <th className="px-4 py-3.5">Kategori & Brand</th>
                  <th className="px-4 py-3.5">Harga Jual</th>
                  <th className="px-4 py-3.5 text-center">Gudang Tokyo</th>
                  <th className="px-4 py-3.5 text-center">Gudang Osaka</th>
                  <th className="px-4 py-3.5 text-center">Total Stok</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {filteredProducts.map((p) => {
                  const tokyoStock = Math.ceil(p.stock * 0.7);
                  const osakaStock = Math.floor(p.stock * 0.3);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{p.name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">SKU: SN-{p.id.padStart(4, '0')}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-stone-800">{p.category}</div>
                        <div className="text-[10px] text-stone-400">{p.brand}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-stone-900">
                        ¥{p.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">{tokyoStock}</td>
                      <td className="px-4 py-3.5 text-center font-mono">{osakaStock}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold font-mono text-stone-900 text-sm">{p.stock}</span> {p.unit}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {p.stock === 0 ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-full text-[10px]">
                            Habis
                          </span>
                        ) : p.stock <= 5 ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">
                            Kritis ({p.stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustQuantity(0);
                          }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-all"
                        >
                          Sesuaikan
                        </button>
                        <button
                          onClick={() => {
                            setTransferProduct(p);
                            setTransferQty(1);
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all"
                        >
                          Mutasi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Movement History Log */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-stone-600 text-base">history</span>
              <span>Log Riwayat Mutasi & Pergerakan Stok</span>
            </h3>
            <span className="text-xs text-stone-400">Pencatatan Audit Otomatis</span>
          </div>

          <div className="divide-y divide-stone-100">
            {stockMovements.slice(0, 6).map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      m.type === 'IN_PO'
                        ? 'bg-emerald-100 text-emerald-700'
                        : m.type === 'OUT_POS' || m.type === 'OUT_ECOMMERCE'
                        ? 'bg-red-100 text-[#c41230]'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {m.type === 'IN_PO' ? '+IN' : m.type.startsWith('OUT') ? '-OUT' : 'TRF'}
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">{m.productName}</div>
                    <div className="text-[11px] text-stone-400">
                      {m.date} • Ref: {m.referenceNumber} • {m.notes}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-stone-900">
                  {m.type === 'IN_PO' ? '+' : m.type.startsWith('OUT') ? '-' : ''}
                  {m.quantity} Pcs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Stock Adjustment */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Sesuaikan Stok Produk</h3>
              <button onClick={() => setAdjustingProduct(null)} className="text-stone-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
              <img
                src={adjustingProduct.image}
                alt={adjustingProduct.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <div className="font-bold text-xs text-stone-900">{adjustingProduct.name}</div>
                <div className="text-[11px] text-stone-500">Stok Saat Ini: {adjustingProduct.stock} Pcs</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Jumlah Perubahan Stok (+ untuk tambah, - untuk kurangi):
                </label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Alasan Penyesuaian:</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900"
                >
                  <option value="Stock Opname Rutin">Stock Opname Rutin</option>
                  <option value="Barang Rusak / Kadaluwarsa">Barang Rusak / Kadaluwarsa</option>
                  <option value="Koreksi Salah Input">Koreksi Salah Input</option>
                  <option value="Bonus / Sampel Supplier">Bonus / Sampel Supplier</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAdjustment}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs"
              >
                Simpan Penyesuaian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Warehouse Transfer */}
      {transferProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Mutasi Antar Gudang</h3>
              <button onClick={() => setTransferProduct(null)} className="text-stone-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
              <div className="font-bold text-stone-900">{transferProduct.name}</div>
              <div className="text-stone-500">Total Stok Keseluruhan: {transferProduct.stock} Pcs</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dari Gudang Asal:</label>
                  <select
                    value={fromWarehouse}
                    onChange={(e) => setFromWarehouse(e.target.value)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Ke Gudang Tujuan:</label>
                  <select
                    value={toWarehouse}
                    onChange={(e) => setToWarehouse(e.target.value)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Jumlah Unit yang Dimutasi:</label>
                <input
                  type="number"
                  min="1"
                  max={transferProduct.stock}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTransferProduct(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveTransfer}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
              >
                Proses Mutasi
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
