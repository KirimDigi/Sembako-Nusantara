import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';

export const InventoryPage: React.FC = () => {
  const { products, warehouses, stockMovements, updateProductStock } = useAdmin();
  const { language } = useLanguage();

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

  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: '在庫・マルチ倉庫統合管理',
        subtitle: '在庫のリアルタイム監視、品薄アラート、および拠点倉庫間（東京・大阪ハブ）の在庫移動管理。',
        cardTotalUnits: '総在庫ユニット数',
        registeredSkus: (cnt: number) => `${cnt} SKU 登録済み`,
        cardValuation: '在庫資産評価額 (小売価格)',
        incTax: '消費税込',
        cardLowStock: '品薄・要補充 (≤ 5)',
        needRestock: '緊急補充推奨',
        cardOutOfStock: '在庫切れ (0)',
        outOfStockSub: 'Webストア品切れ表示中',
        searchPlaceholder: 'SKUまたは商品名を検索...',
        whAll: 'すべての倉庫 (合算)',
        statusAll: 'すべて',
        statusLow: '品薄',
        statusOut: '品切れ',
        thProduct: '商品',
        thCategoryBrand: 'カテゴリー & ブランド',
        thPrice: '販売価格',
        thTokyoWh: '東京倉庫',
        thOsakaWh: '大阪倉庫',
        thTotalStock: '総在庫数',
        thStatus: 'ステータス',
        thAction: '操作',
        statusSafe: '適正',
        statusCritical: (stk: number) => `品薄 (${stk})`,
        statusEmpty: '品切れ',
        btnAdjust: '在庫調整',
        btnTransfer: '在庫移動',
        // Movement Log
        logTitle: '在庫入出荷・移動履歴ログ',
        logSub: '自動監査トレーサビリティ',
        // Adjustment Modal
        adjModalTitle: '商品在庫の調整 (棚卸)',
        adjCurrentStock: (stk: number) => `現在庫: ${stk} 個`,
        adjQtyLabel: '在庫変動数 (+で増加、-で減少):',
        adjReasonLabel: '調整理由:',
        adjOpt1: '定期棚卸実数確認 (Stock Opname)',
        adjOpt2: '破損・賞味期限切れ廃棄',
        adjOpt3: '誤入力・システム差異修正',
        adjOpt4: 'サプライヤーサンプル・特典入庫',
        btnCancel: 'キャンセル',
        btnSaveAdj: '調整を保存する',
        // Transfer Modal
        trfModalTitle: '拠点倉庫間 在庫移動 (振替)',
        trfTotalStock: (stk: number) => `全拠点総在庫: ${stk} 個`,
        trfFromLabel: '移動元倉庫:',
        trfToLabel: '移動先倉庫:',
        trfQtyLabel: '移動数量 (個):',
        btnSaveTrf: '移動を実行する',
        alertSameWh: '移動元と移動先の倉庫を同一にすることはできません！'
      };
    } else if (language === 'EN') {
      return {
        title: 'Inventory & Multi-Warehouse Management',
        subtitle: 'Real-time inventory tracking, low-stock alerts, and stock transfers across Tokyo and Osaka Hubs.',
        cardTotalUnits: 'Total Stock Units',
        registeredSkus: (cnt: number) => `${cnt} SKUs registered`,
        cardValuation: 'Stock Asset Value (Retail)',
        incTax: 'Consumption Tax Included',
        cardLowStock: 'Critical Low Stock (≤ 5)',
        needRestock: 'Restock Recommended',
        cardOutOfStock: 'Out of Stock (0)',
        outOfStockSub: 'Sold Out Status on Web',
        searchPlaceholder: 'Search SKU or product name...',
        whAll: 'All Warehouses (Consolidated)',
        statusAll: 'All',
        statusLow: 'Low Stock',
        statusOut: 'Out of Stock',
        thProduct: 'Product',
        thCategoryBrand: 'Category & Brand',
        thPrice: 'Price',
        thTokyoWh: 'Tokyo Hub',
        thOsakaWh: 'Osaka Hub',
        thTotalStock: 'Total Stock',
        thStatus: 'Status',
        thAction: 'Action',
        statusSafe: 'In Stock',
        statusCritical: (stk: number) => `Low (${stk})`,
        statusEmpty: 'Out of Stock',
        btnAdjust: 'Adjust',
        btnTransfer: 'Transfer',
        // Movement Log
        logTitle: 'Stock Movement & Audit History Log',
        logSub: 'Automated Audit Trail',
        // Adjustment Modal
        adjModalTitle: 'Product Stock Adjustment',
        adjCurrentStock: (stk: number) => `Current Stock: ${stk} Pcs`,
        adjQtyLabel: 'Quantity Delta (+ to add, - to deduct):',
        adjReasonLabel: 'Adjustment Reason:',
        adjOpt1: 'Routine Physical Stock Count',
        adjOpt2: 'Damaged / Expired Goods',
        adjOpt3: 'Input Correction',
        adjOpt4: 'Supplier Bonus / Samples',
        btnCancel: 'Cancel',
        btnSaveAdj: 'Save Adjustment',
        // Transfer Modal
        trfModalTitle: 'Inter-Warehouse Stock Transfer',
        trfTotalStock: (stk: number) => `Total Consolidated Stock: ${stk} Pcs`,
        trfFromLabel: 'From Warehouse:',
        trfToLabel: 'To Warehouse:',
        trfQtyLabel: 'Quantity to Transfer:',
        btnSaveTrf: 'Process Transfer',
        alertSameWh: 'Origin and destination warehouses cannot be the same!'
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'Manajemen Inventaris & Multi-Gudang',
        subtitle: 'Monitoring stok terpadu, peringatan stok kritis, dan mutasi barang antar gudang (Tokyo & Osaka Hub).',
        cardTotalUnits: 'Total Unit Persediaan',
        registeredSkus: (cnt: number) => `${cnt} SKU terdaftar`,
        cardValuation: 'Nilai Aset Stok (Retail)',
        incTax: 'Termasuk Pajak Konsumsi',
        cardLowStock: 'Stok Kritis (≤ 5)',
        needRestock: 'Perlu Restock Segera',
        cardOutOfStock: 'Stok Habis (0)',
        outOfStockSub: 'Status Kosong di Web',
        searchPlaceholder: 'Cari SKU atau nama produk...',
        whAll: 'Semua Gudang (Konsolidasi)',
        statusAll: 'Semua',
        statusLow: 'Menipis',
        statusOut: 'Habis',
        thProduct: 'Produk',
        thCategoryBrand: 'Kategori & Brand',
        thPrice: 'Harga Jual',
        thTokyoWh: 'Gudang Tokyo',
        thOsakaWh: 'Gudang Osaka',
        thTotalStock: 'Total Stok',
        thStatus: 'Status',
        thAction: 'Aksi',
        statusSafe: 'Aman',
        statusCritical: (stk: number) => `Kritis (${stk})`,
        statusEmpty: 'Habis',
        btnAdjust: 'Sesuaikan',
        btnTransfer: 'Mutasi',
        // Movement Log
        logTitle: 'Log Riwayat Mutasi & Pergerakan Stok',
        logSub: 'Pencatatan Audit Otomatis',
        // Adjustment Modal
        adjModalTitle: 'Sesuaikan Stok Produk',
        adjCurrentStock: (stk: number) => `Stok Saat Ini: ${stk} Pcs`,
        adjQtyLabel: 'Jumlah Perubahan Stok (+ untuk tambah, - untuk kurangi):',
        adjReasonLabel: 'Alasan Penyesuaian:',
        adjOpt1: 'Stock Opname Rutin',
        adjOpt2: 'Barang Rusak / Kadaluwarsa',
        adjOpt3: 'Koreksi Salah Input',
        adjOpt4: 'Bonus / Sampel Supplier',
        btnCancel: 'Batal',
        btnSaveAdj: 'Simpan Penyesuaian',
        // Transfer Modal
        trfModalTitle: 'Mutasi Antar Gudang',
        trfTotalStock: (stk: number) => `Total Stok Keseluruhan: ${stk} Pcs`,
        trfFromLabel: 'Dari Gudang Asal:',
        trfToLabel: 'Ke Gudang Tujuan:',
        trfQtyLabel: 'Jumlah Unit yang Dimutasi:',
        btnSaveTrf: 'Proses Mutasi',
        alertSameWh: 'Gudang asal dan tujuan tidak boleh sama!'
      };
    }
  }, [language]);

  const filteredProducts = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameJp && p.nameJp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
      alert(txt.alertSameWh);
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
      title={txt.title}
      subtitle={txt.subtitle}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">{txt.cardTotalUnits}</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {totalStockCount.toLocaleString()} <span className="text-xs font-normal text-stone-500">Pcs</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">{txt.registeredSkus(products.length)}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">{txt.cardValuation}</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              ¥{totalStockValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">{txt.incTax}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">{txt.cardLowStock}</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount} SKU</div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">{txt.needRestock}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-xs font-semibold text-stone-500 uppercase">{txt.cardOutOfStock}</span>
            <div className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount} SKU</div>
            <div className="text-[11px] text-red-700 font-medium mt-1">{txt.outOfStockSub}</div>
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
                placeholder={txt.searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#c41230]"
              />
            </div>

            {/* Warehouse Filter */}
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none"
            >
              <option value="all">{txt.whAll}</option>
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
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  filterStatus === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                {txt.statusAll}
              </button>
              <button
                onClick={() => setFilterStatus('low')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  filterStatus === 'low' ? 'bg-white text-amber-700 shadow-xs' : 'text-stone-500'
                }`}
              >
                {txt.statusLow}
              </button>
              <button
                onClick={() => setFilterStatus('out')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  filterStatus === 'out' ? 'bg-white text-red-600 shadow-xs' : 'text-stone-500'
                }`}
              >
                {txt.statusOut}
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
                  <th className="px-5 py-3.5">{txt.thProduct}</th>
                  <th className="px-4 py-3.5">{txt.thCategoryBrand}</th>
                  <th className="px-4 py-3.5">{txt.thPrice}</th>
                  <th className="px-4 py-3.5 text-center">{txt.thTokyoWh}</th>
                  <th className="px-4 py-3.5 text-center">{txt.thOsakaWh}</th>
                  <th className="px-4 py-3.5 text-center">{txt.thTotalStock}</th>
                  <th className="px-4 py-3.5 text-center">{txt.thStatus}</th>
                  <th className="px-5 py-3.5 text-right">{txt.thAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {filteredProducts.map((p) => {
                  const tokyoStock = Math.ceil(p.stock * 0.7);
                  const osakaStock = Math.floor(p.stock * 0.3);
                  const displayName = language === 'JP' ? p.nameJp || p.name : language === 'EN' ? p.nameEn || p.name : p.name;
                  const displayCat = language === 'JP' ? p.categoryJp || p.category : language === 'EN' ? p.categoryEn || p.category : p.category;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={displayName}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{displayName}</div>
                          <div className="text-[10px] text-stone-400 font-mono">SKU: SN-{p.id.padStart(4, '0')}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-stone-800">{displayCat}</div>
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
                            {txt.statusEmpty}
                          </span>
                        ) : p.stock <= 5 ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">
                            {txt.statusCritical(p.stock)}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                            {txt.statusSafe}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setAdjustQuantity(0);
                          }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {txt.btnAdjust}
                        </button>
                        <button
                          onClick={() => {
                            setTransferProduct(p);
                            setTransferQty(1);
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {txt.btnTransfer}
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
              <span>{txt.logTitle}</span>
            </h3>
            <span className="text-xs text-stone-400">{txt.logSub}</span>
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
              <h3 className="font-bold text-stone-900 text-sm">{txt.adjModalTitle}</h3>
              <button onClick={() => setAdjustingProduct(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
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
                <div className="font-bold text-xs text-stone-900">
                  {language === 'JP' ? adjustingProduct.nameJp || adjustingProduct.name : language === 'EN' ? adjustingProduct.nameEn || adjustingProduct.name : adjustingProduct.name}
                </div>
                <div className="text-[11px] text-stone-500">{txt.adjCurrentStock(adjustingProduct.stock)}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  {txt.adjQtyLabel}
                </label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.adjReasonLabel}</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900"
                >
                  <option value="Stock Opname Rutin">{txt.adjOpt1}</option>
                  <option value="Barang Rusak / Kadaluwarsa">{txt.adjOpt2}</option>
                  <option value="Koreksi Salah Input">{txt.adjOpt3}</option>
                  <option value="Bonus / Sampel Supplier">{txt.adjOpt4}</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
              >
                {txt.btnCancel}
              </button>
              <button
                onClick={handleSaveAdjustment}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs"
              >
                {txt.btnSaveAdj}
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
              <h3 className="font-bold text-stone-900 text-sm">{txt.trfModalTitle}</h3>
              <button onClick={() => setTransferProduct(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
              <div className="font-bold text-stone-900">
                {language === 'JP' ? transferProduct.nameJp || transferProduct.name : language === 'EN' ? transferProduct.nameEn || transferProduct.name : transferProduct.name}
              </div>
              <div className="text-stone-500">{txt.trfTotalStock(transferProduct.stock)}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.trfFromLabel}</label>
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
                  <label className="font-bold text-stone-700 block mb-1">{txt.trfToLabel}</label>
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
                <label className="font-bold text-stone-700 block mb-1">{txt.trfQtyLabel}</label>
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
                {txt.btnCancel}
              </button>
              <button
                onClick={handleSaveTransfer}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs"
              >
                {txt.btnSaveTrf}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
