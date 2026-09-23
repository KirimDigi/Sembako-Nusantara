import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';
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
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();

  // Tab State
  const [activeTab, setActiveTab] = useState<'po' | 'suppliers'>('po');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'suppliers') {
      setActiveTab('suppliers');
    } else if (tab === 'po') {
      setActiveTab('po');
    }
  }, [searchParams]);

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

  const totalPOCost = poItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: '仕入れ・サプライヤー発注 (PO) 管理',
        subtitle: 'インドネシアから日本へのハラール食材輸入サプライチェーン、仕入れ発注書（PO）作成、および倉庫入庫検品管理。',
        tabPo: (cnt: number) => `📋 発注書 (PO) 一覧 (${cnt})`,
        tabSuppliers: (cnt: number) => `🏢 サプライヤー・仕入れ先 (${cnt})`,
        btnCreatePo: '新規発注書 (PO) 作成',
        btnAddSupplier: '新規仕入れ先登録',
        statusReceived: '倉庫入庫・検品完了',
        dateCreated: '発注日:',
        expectedDate: '納品予定日:',
        supplierLabel: 'サプライヤー / 輸入元:',
        destWhLabel: '納品先倉庫:',
        totalPoValLabel: '発注総額 (仕入れ原価):',
        itemsOrderedLabel: '発注商品明細:',
        btnReceive: '商品を入庫して在庫を自動更新',
        receivedSuccess: '在庫が商品カタログへ自動反映されました',
        leadTimeDays: (d: number) => `リードタイム: ${d} 日`,
        paymentTerms: '支払条件:',
        // New PO Modal
        modalPoTitle: '新規仕入れ発注書 (PO) 作成',
        supplierSelect: '仕入れ先サプライヤー選択:',
        destWhSelect: '納品先倉庫選択:',
        addItemBtn: '+ 商品を追加',
        qtyLabel: '数量:',
        unitCostLabel: '仕入単価 (¥):',
        subtotalLabel: '小計:',
        poNotesLabel: '発注備考・通関指定:',
        poNotesPh: 'コンテナ番号、賞味期限条件、検疫証明書番号など...',
        btnCancel: 'キャンセル',
        btnSubmitPo: '発注書を発行する (送信)',
        // New Supplier Modal
        modalSupTitle: '新規サプライヤー登録',
        supNameLabel: 'サプライヤー・企業名:',
        supContactLabel: '担当者名:',
        supEmailLabel: '連絡先メールアドレス:',
        supPhoneLabel: '電話番号:',
        supOriginLabel: '輸入元国:',
        supLeadLabel: '標準納期 (日数):',
        supTermsLabel: '支払サイト・条件:',
        btnSubmitSup: 'サプライヤーを登録する'
      };
    } else if (language === 'EN') {
      return {
        title: 'Purchasing & Supplier PO Management',
        subtitle: 'Import supply chain management from Indonesia to Japan, Purchase Order (PO) creation, and warehouse receiving.',
        tabPo: (cnt: number) => `📋 Purchase Orders (${cnt})`,
        tabSuppliers: (cnt: number) => `🏢 Suppliers & Vendors (${cnt})`,
        btnCreatePo: 'Create Purchase Order (PO)',
        btnAddSupplier: 'Add New Supplier',
        statusReceived: 'Goods Received into Warehouse',
        dateCreated: 'Date Created:',
        expectedDate: 'Expected Arrival:',
        supplierLabel: 'Supplier / Vendor:',
        destWhLabel: 'Destination Warehouse:',
        totalPoValLabel: 'Total PO Value:',
        itemsOrderedLabel: 'Ordered Item List:',
        btnReceive: 'Receive Goods & Auto-Update Stock',
        receivedSuccess: 'Stock synchronized to product catalog',
        leadTimeDays: (d: number) => `Lead Time: ${d} Days`,
        paymentTerms: 'Payment Terms:',
        // New PO Modal
        modalPoTitle: 'Create New Purchase Order (PO)',
        supplierSelect: 'Select Supplier:',
        destWhSelect: 'Destination Warehouse:',
        addItemBtn: '+ Add Product Item',
        qtyLabel: 'Qty:',
        unitCostLabel: 'Unit Cost (¥):',
        subtotalLabel: 'Subtotal:',
        poNotesLabel: 'PO Notes / Customs Instructions:',
        poNotesPh: 'Container No., Expiry criteria, Halal quarantine certs...',
        btnCancel: 'Cancel',
        btnSubmitPo: 'Issue & Send PO',
        // New Supplier Modal
        modalSupTitle: 'Register New Supplier',
        supNameLabel: 'Supplier / Company Name:',
        supContactLabel: 'Contact Person:',
        supEmailLabel: 'Email Address:',
        supPhoneLabel: 'Phone Number:',
        supOriginLabel: 'Country of Origin:',
        supLeadLabel: 'Standard Lead Time (Days):',
        supTermsLabel: 'Payment Terms:',
        btnSubmitSup: 'Save Supplier'
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'Purchasing & Supplier PO',
        subtitle: 'Manajemen rantai pasok impor Indonesia ke Jepang, pembuatan Purchase Order (PO), dan penerimaan stok gudang.',
        tabPo: (cnt: number) => `📋 Daftar Purchase Order (${cnt})`,
        tabSuppliers: (cnt: number) => `🏢 Database Supplier & Vendor (${cnt})`,
        btnCreatePo: 'Buat Purchase Order (PO)',
        btnAddSupplier: 'Tambah Supplier Baru',
        statusReceived: 'Barang Sudah Masuk Gudang',
        dateCreated: 'Tgl Dibuat:',
        expectedDate: 'Estimasi Tiba:',
        supplierLabel: 'Supplier / Vendor:',
        destWhLabel: 'Gudang Tujuan:',
        totalPoValLabel: 'Total Nilai PO:',
        itemsOrderedLabel: 'Item Barang yang Dipesan:',
        btnReceive: 'Terima Barang & Update Stok Otomatis',
        receivedSuccess: 'Stok telah disinkronkan ke katalog',
        leadTimeDays: (d: number) => `Lead Time: ${d} Hari`,
        paymentTerms: 'Syarat Bayar:',
        // New PO Modal
        modalPoTitle: 'Buat Purchase Order (PO) Baru',
        supplierSelect: 'Pilih Supplier:',
        destWhSelect: 'Gudang Tujuan Pengiriman:',
        addItemBtn: '+ Tambah Item Barang',
        qtyLabel: 'Jumlah:',
        unitCostLabel: 'Harga Satuan (¥):',
        subtotalLabel: 'Total:',
        poNotesLabel: 'Catatan PO / Instruksi Khusus:',
        poNotesPh: 'Nomor kontainer, ketentuan expired date, dokumen karantina pangan...',
        btnCancel: 'Batal',
        btnSubmitPo: 'Terbitkan PO (Kirim)',
        // New Supplier Modal
        modalSupTitle: 'Tambah Supplier / Vendor Baru',
        supNameLabel: 'Nama Supplier / Perusahaan:',
        supContactLabel: 'Nama Kontak Person (PIC):',
        supEmailLabel: 'Alamat Email:',
        supPhoneLabel: 'Nomor Telepon / WhatsApp:',
        supOriginLabel: 'Negara Asal Supplier:',
        supLeadLabel: 'Lead Time Pengiriman (Hari):',
        supTermsLabel: 'Syarat Pembayaran (Payment Terms):',
        btnSubmitSup: 'Simpan Supplier'
      };
    }
  }, [language]);

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
        productName: prod ? (language === 'JP' ? prod.nameJp || prod.name : language === 'EN' ? prod.nameEn || prod.name : prod.name) : 'Product',
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
      title={txt.title}
      subtitle={txt.subtitle}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation Tabs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 bg-stone-200/70 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('po')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'po' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {txt.tabPo(purchaseOrders.length)}
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'suppliers'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {txt.tabSuppliers(suppliers.length)}
            </button>
          </div>

          <div className="flex gap-2">
            {activeTab === 'po' ? (
              <button
                onClick={() => setIsNewPOOpen(true)}
                className="px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                <span>{txt.btnCreatePo}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsNewSupplierOpen(true)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>{txt.btnAddSupplier}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Purchase Orders List */}
        {activeTab === 'po' && (
          <div className="space-y-4">
            {purchaseOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">receipt_long</span>
                </div>
                <h4 className="font-bold text-stone-800 text-sm">
                  {language === 'JP' ? '発注書 (PO) はまだありません' : language === 'EN' ? 'No Purchase Orders (PO) Yet' : 'Belum Ada Purchase Order (PO)'}
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {language === 'JP'
                    ? '初期状態（0件）です。新規発注書を作成すると、ここに仕入れ明細が表示されます。'
                    : language === 'EN'
                    ? 'Clean 0 state. When you create a new PO, incoming shipments and stock items will appear here.'
                    : 'Kondisi 0 bersih. Ketika Anda membuat PO baru, rincian pengadaan dan status barang masuk akan tercatat di sini.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewPOOpen(true)}
                  className="mt-2 px-4 py-2 bg-[#c41230] hover:bg-[#a80f28] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  <span>{txt.btnCreatePo}</span>
                </button>
              </div>
            ) : (
              purchaseOrders.map((po) => (
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
                        {po.status === 'Received' ? txt.statusReceived : po.status}
                      </span>
                    </div>

                    <div className="text-stone-500">
                      {txt.dateCreated} <span className="font-bold text-stone-700">{po.dateCreated}</span> • {txt.expectedDate}{' '}
                      <span className="font-bold text-stone-700">{po.expectedDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase block">{txt.supplierLabel}</span>
                      <div className="font-bold text-stone-900">{po.supplierName}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase block">{txt.destWhLabel}</span>
                      <div className="font-bold text-stone-900">
                        {warehouses.find((w) => w.id === po.destinationWarehouseId)?.name || 'Tokyo Hub'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase block">{txt.totalPoValLabel}</span>
                      <div className="font-black text-sm text-[#c41230]">¥{po.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="text-[11px] font-bold text-stone-700 mb-2">{txt.itemsOrderedLabel}</div>
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
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">inventory</span>
                        <span>{txt.btnReceive}</span>
                      </button>
                    )}
                    {po.status === 'Received' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>{txt.receivedSuccess}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Suppliers List */}
        {activeTab === 'suppliers' && (
          <div>
            {suppliers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl">domain</span>
                </div>
                <h4 className="font-bold text-stone-800 text-sm">
                  {language === 'JP' ? '登録済みサプライヤーはまだありません' : language === 'EN' ? 'No Suppliers Registered Yet' : 'Belum Ada Supplier Terdaftar'}
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {language === 'JP'
                    ? '初期状態（0件）です。新規仕入れ先サプライヤーを登録すると、ここに一覧が表示されます。'
                    : language === 'EN'
                    ? 'Clean 0 state. Register your first supplier or importer to view the supplier directory here.'
                    : 'Kondisi 0 bersih. Tambahkan supplier atau importir mitra baru untuk melihat daftar vendor di sini.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewSupplierOpen(true)}
                  className="mt-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>{txt.btnAddSupplier}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map((sup) => (
                  <div
                    key={sup.id}
                    className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 font-bold rounded-md">
                          {sup.origin}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm mt-1.5">{sup.name}</h4>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span>{sup.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-stone-600">
                      <div>PIC: <span className="font-medium text-stone-900">{sup.contactPerson}</span></div>
                      <div>Email: <span className="font-mono">{sup.email}</span></div>
                      <div>Tel/WA: <span className="font-mono">{sup.phone}</span></div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>{txt.leadTimeDays(sup.leadTimeDays)}</span>
                      <span className="font-semibold text-stone-700">{txt.paymentTerms} {sup.paymentTerms}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal New PO */}
      {isNewPOOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">{txt.modalPoTitle}</h3>
              <button onClick={() => setIsNewPOOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.supplierSelect}</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.origin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.destWhSelect}</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items in PO */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-800">{txt.itemsOrderedLabel}</span>
                  <button
                    type="button"
                    onClick={handleAddPOItem}
                    className="text-[#c41230] font-bold hover:underline cursor-pointer"
                  >
                    {txt.addItemBtn}
                  </button>
                </div>

                {poItems.map((item, index) => (
                  <div key={index} className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) => handleUpdatePOItem(index, 'productId', e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {language === 'JP' ? p.nameJp || p.name : language === 'EN' ? p.nameEn || p.name : p.name}
                          </option>
                        ))}
                      </select>
                      {poItems.length > 1 && (
                        <button
                          onClick={() => handleRemovePOItem(index)}
                          className="text-stone-400 hover:text-red-500 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-stone-500">{txt.qtyLabel}</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdatePOItem(index, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500">{txt.unitCostLabel}</span>
                        <input
                          type="number"
                          min="1"
                          value={item.unitCost}
                          onChange={(e) => handleUpdatePOItem(index, 'unitCost', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.poNotesLabel}</label>
                <textarea
                  value={poNotes}
                  onChange={(e) => setPONotes(e.target.value)}
                  placeholder={txt.poNotesPh}
                  rows={2}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-red-50 rounded-xl flex justify-between items-center font-bold">
                <span className="text-[#c41230]">{txt.totalPoValLabel}</span>
                <span className="text-base text-[#c41230] font-mono">¥{totalPOCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsNewPOOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                {txt.btnCancel}
              </button>
              <button
                onClick={handleSavePO}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                {txt.btnSubmitPo}
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
              <h3 className="font-bold text-stone-900 text-sm">{txt.modalSupTitle}</h3>
              <button onClick={() => setIsNewSupplierOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.supNameLabel}</label>
                <input
                  type="text"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.supContactLabel}</label>
                <input
                  type="text"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.supEmailLabel}</label>
                  <input
                    type="email"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.supPhoneLabel}</label>
                  <input
                    type="text"
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.supOriginLabel}</label>
                  <select
                    value={newSupOrigin}
                    onChange={(e) => setNewSupOrigin(e.target.value as Supplier['origin'])}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Indonesia">Indonesia 🇮🇩</option>
                    <option value="Jepang">Jepang 🇯🇵</option>
                    <option value="Malaysia">Malaysia 🇲🇾</option>
                    <option value="Thailand">Thailand 🇹🇭</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{txt.supLeadLabel}</label>
                  <input
                    type="number"
                    value={newSupLeadTime}
                    onChange={(e) => setNewSupLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{txt.supTermsLabel}</label>
                <input
                  type="text"
                  value={newSupTerms}
                  onChange={(e) => setNewSupTerms(e.target.value)}
                  placeholder="Contoh: Net 30 Days / Cash on Delivery"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsNewSupplierOpen(false)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                {txt.btnCancel}
              </button>
              <button
                onClick={handleSaveSupplier}
                className="flex-1 py-2.5 bg-[#c41230] hover:bg-[#a80f28] text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                {txt.btnSubmitSup}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
