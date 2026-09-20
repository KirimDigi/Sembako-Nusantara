import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { PurchaseOrder, Supplier } from '../../types';

export const PurchasingPage: React.FC = () => {
  const {
    suppliers,
    purchaseOrders,
    products,
    warehouses,
    createPurchaseOrder,
    receivePurchaseOrder,
    addSupplier
  } = useAdmin();

  // Tab State
  const [activeTab, setActiveTab] = useState<'po' | 'suppliers'>('po');

  // Modal State for New PO
  const [isNewPOOpen, setIsNewPOOpen] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('wh-tokyo');
  const [poItems, setPOItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([
    { productId: products[0]?.id || '1', quantity: 50, unitCost: 3500 }
  ]);
  const [poNotes, setPONotes] = useState<string>('');

  // Modal State for New Supplier
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState<boolean>(false);
  const [newSupName, setNewSupName] = useState<string>('');
  const [newSupContact, setNewSupContact] = useState<string>('');
  const [newSupEmail, setNewSupEmail] = useState<string>('');
  const [newSupPhone, setNewSupPhone] = useState<string>('');
  const [newSupOrigin, setNewSupOrigin] = useState<Supplier['origin']>('Indonesia');
  const [newSupLeadTime, setNewSupLeadTime] = useState<number>(7);
  const [newSupTerms, setNewSupTerms] = useState<string>('Net 30 Days');

  // Calculations for New PO
  const totalPOCost = poItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleAddPOItem = () => {
    setPOItems((prev) => [...prev, { productId: products[0]?.id || '1', quantity: 20, unitCost: 1000 }]);
  };

  const handleRemovePOItem = (index: number) => {
    setPOItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePOItem = (index: number, field: string, value: any) => {
    setPOItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSavePO = () => {
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    if (!sup) return;

    const formattedItems = poItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Unknown Product',
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost
      };
    });

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      expectedDate: new Date(Date.now() + sup.leadTimeDays * 86400000).toISOString().substring(0, 10),
      destinationWarehouseId: selectedWarehouseId,
      items: formattedItems,
      totalAmount: totalPOCost,
      status: 'Sent',
      notes: poNotes
    });

    setIsNewPOOpen(false);
    setPONotes('');
  };

  const handleSaveSupplier = () => {
    if (!newSupName) return;
    addSupplier({
      name: newSupName,
      contactPerson: newSupContact,
      email: newSupEmail,
      phone: newSupPhone,
      address: 'Tokyo / Indonesia',
      origin: newSupOrigin,
      leadTimeDays: newSupLeadTime,
      paymentTerms: newSupTerms,
      rating: 5.0
    });
    setIsNewSupplierOpen(false);
    setNewSupName('');
    setNewSupContact('');
  };

  return (
    <AdminLayout
      title="Purchasing & Supplier PO"
      subtitle="Manajemen rantai pasok impor Indonesia ke Jepang, pembuatan Purchase Order (PO), dan penerimaan stok gudang."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 bg-stone-200/70 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('po')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'po' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              📋 Daftar Purchase Order ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'suppliers'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🏢 Database Supplier & Vendor ({suppliers.length})
            </button>
          </div>

          <div className="flex gap-2">
            {activeTab === 'po' ? (
              <button
                onClick={() => setIsNewPOOpen(true)}
                className="px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                <span>Buat Purchase Order (PO)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsNewSupplierOpen(true)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Tambah Supplier Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Purchase Orders List */}
        {activeTab === 'po' && (
          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-sm text-stone-900">{po.poNumber}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        po.status === 'Received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.status === 'Sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {po.status === 'Received' ? 'Barang Sudah Masuk Gudang' : po.status}
                    </span>
                  </div>

                  <div className="text-stone-500">
                    Tgl Dibuat: <span className="font-bold text-stone-700">{po.dateCreated}</span> • Estimasi Tiba:{' '}
                    <span className="font-bold text-stone-700">{po.expectedDate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block">Supplier / Vendor:</span>
                    <div className="font-bold text-stone-900">{po.supplierName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block">Gudang Tujuan:</span>
                    <div className="font-bold text-stone-900">
                      {warehouses.find((w) => w.id === po.destinationWarehouseId)?.name || 'Gudang Tokyo'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block">Total Nilai PO:</span>
                    <div className="font-black text-sm text-[#c41230]">¥{po.totalAmount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div className="text-[11px] font-bold text-stone-700 mb-2">Item Barang yang Dipesan:</div>
                  <div className="divide-y divide-stone-200 text-xs">
                    {po.items.map((it, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between items-center">
                        <span className="font-medium text-stone-800">{it.productName}</span>
                        <div className="font-mono text-stone-600">
                          {it.quantity} Pcs @ ¥{it.unitCost.toLocaleString()} ={' '}
                          <span className="font-bold text-stone-900">¥{it.totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-1">
                  {po.status === 'Sent' && (
                    <button
                      onClick={() => receivePurchaseOrder(po.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">inventory</span>
                      <span>Terima Barang & Update Stok Otomatis</span>
                    </button>
                  )}
                  {po.status === 'Received' && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Stok telah disinkronkan ke katalog</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Suppliers List */}
        {activeTab === 'suppliers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 font-bold rounded-md">
                      Asal: {sup.origin}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm mt-1">{sup.name}</h4>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span>{sup.rating}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-stone-600">
                  <div>
                    👤 Kontak: <span className="font-semibold text-stone-800">{sup.contactPerson}</span>
                  </div>
                  <div>
                    📧 Email: <span className="font-mono text-stone-800">{sup.email}</span>
                  </div>
                  <div>
                    📞 Telp: <span className="font-mono text-stone-800">{sup.phone}</span>
                  </div>
                  <div>
                    ⏱️ Lead Time: <span className="font-semibold text-stone-800">{sup.leadTimeDays} Hari Kerja</span>
                  </div>
                  <div>
                    💳 Ketentuan Bayar: <span className="font-semibold text-stone-800">{sup.paymentTerms}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal New PO */}
      {isNewPOOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base">Buat Purchase Order (PO) Baru</h3>
              <button onClick={() => setIsNewPOOpen(false)} className="text-stone-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Pilih Supplier:</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.origin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Gudang Tujuan Pengiriman:</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PO Items Editor */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-bold text-stone-800">Daftar Produk yang Diorder:</span>
                <button
                  type="button"
                  onClick={handleAddPOItem}
                  className="text-xs text-[#c41230] font-bold hover:underline"
                >
                  + Tambah Baris Item
                </button>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {poItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-100 grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-6">
                      <select
                        value={item.productId}
                        onChange={(e) => handleUpdatePOItem(idx, 'productId', e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleUpdatePOItem(idx, 'quantity', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg font-bold text-center"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="HPP (¥)"
                        value={item.unitCost}
                        onChange={(e) => handleUpdatePOItem(idx, 'unitCost', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg font-bold text-right"
                      />
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePOItem(idx)}
                        className="text-stone-400 hover:text-red-600"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 text-xs block mb-1">Catatan PO (Opsional):</label>
              <textarea
                value={poNotes}
                onChange={(e) => setPONotes(e.target.value)}
                placeholder="Contoh: Pengiriman via kontainer laut / Cool Yamato..."
                rows={2}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <div className="p-4 bg-red-50 rounded-2xl flex justify-between items-center">
              <span className="text-xs font-bold text-stone-700">Total Biaya PO (HPP):</span>
              <span className="text-xl font-black text-[#c41230]">¥{totalPOCost.toLocaleString()}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsNewPOOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSavePO}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs"
              >
                Kirim Purchase Order (PO)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal New Supplier */}
      {isNewSupplierOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">Tambah Supplier / Vendor Baru</h3>
              <button onClick={() => setIsNewSupplierOpen(false)} className="text-stone-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Perusahaan Supplier:</label>
                <input
                  type="text"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="Contoh: PT Sinar Jaya Halal"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contact Person:</label>
                  <input
                    type="text"
                    value={newSupContact}
                    onChange={(e) => setNewSupContact(e.target.value)}
                    placeholder="Nama PIC"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Asal Negara:</label>
                  <select
                    value={newSupOrigin}
                    onChange={(e) => setNewSupOrigin(e.target.value as Supplier['origin'])}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  >
                    <option value="Indonesia">Indonesia 🇮🇩</option>
                    <option value="Japan">Japan 🇯🇵</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    placeholder="sales@supplier.com"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Telepon / WA:</label>
                  <input
                    type="text"
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    placeholder="+81-80-xxx / +62-812-xxx"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsNewSupplierOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSupplier}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs"
              >
                Simpan Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
