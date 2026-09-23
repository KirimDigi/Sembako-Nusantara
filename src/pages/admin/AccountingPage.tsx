import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { useLanguage } from '../../context/LanguageContext';

export type TabType =
  | 'pnl'
  | 'balance_sheet'
  | 'sales_by_item'
  | 'daily_revenue'
  | 'tax_compliance'
  | 'cash_out'
  | 'cash_in'
  | 'cash_transfer'
  | 'assets_journal'
  | 'bank_accounts';

export const AccountingPage: React.FC = () => {
  const { products, posTransactions, orders, clearAllTransactions, addOrder } = useAdmin();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>('pnl');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (
      tab === 'pnl' ||
      tab === 'balance_sheet' ||
      tab === 'sales_by_item' ||
      tab === 'daily_revenue' ||
      tab === 'tax_compliance' ||
      tab === 'cash_out' ||
      tab === 'cash_in' ||
      tab === 'cash_transfer' ||
      tab === 'assets_journal' ||
      tab === 'bank_accounts'
    ) {
      setActiveTab(tab as TabType);
    }
  }, [searchParams]);
  const [period, setPeriod] = useState<string>('month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'revenue' | 'qty' | 'profit' | 'margin'>('revenue');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // =========================================================================
  // SUB-MODULE 1: KAS KELUAR (CASH OUTFLOW) STATE & HANDLERS
  // =========================================================================
  const [isCashOutModalOpen, setIsCashOutModalOpen] = useState(false);
  const [cashOutList, setCashOutList] = useState<any[]>(() => {
    const saved = localStorage.getItem('sn_cash_out_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [newCashOut, setNewCashOut] = useState({
    category: 'Sewa Gudang & Toko',
    sourceAccount: 'Kas POS Kasir Tokyo',
    amount: 15000,
    recipient: '',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('sn_cash_out_v3', JSON.stringify(cashOutList));
  }, [cashOutList]);

  const handleAddCashOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashOut.amount || newCashOut.amount <= 0) return;
    const item = {
      id: `EXP-2026-${String(cashOutList.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().substring(0, 10),
      refNumber: `VCH-OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newCashOut.category,
      categoryJp: newCashOut.category === 'Sewa Gudang & Toko' ? '店舗・倉庫賃料' : newCashOut.category === 'Gaji Karyawan' ? 'スタッフ人件費' : '経費支出',
      categoryEn: newCashOut.category === 'Sewa Gudang & Toko' ? 'Rent & Warehouse' : newCashOut.category === 'Gaji Karyawan' ? 'Staff Payroll' : 'Operating Expense',
      sourceAccount: newCashOut.sourceAccount,
      amount: Number(newCashOut.amount),
      recipient: newCashOut.recipient || 'Vendor Partner',
      notes: newCashOut.notes || '-',
      status: 'Lunas'
    };
    setCashOutList([item, ...cashOutList]);
    setIsCashOutModalOpen(false);
    setNewCashOut({ category: 'Sewa Gudang & Toko', sourceAccount: 'Kas POS Kasir Tokyo', amount: 15000, recipient: '', notes: '' });
  };

  // =========================================================================
  // SUB-MODULE 2: KAS MASUK (CASH INFLOW) STATE & HANDLERS
  // =========================================================================
  const [isCashInModalOpen, setIsCashInModalOpen] = useState(false);
  const [cashInList, setCashInList] = useState<any[]>(() => {
    const saved = localStorage.getItem('sn_cash_in_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [newCashIn, setNewCashIn] = useState({
    category: 'Setoran Modal Pemilik',
    targetAccount: 'Bank MUFG Tokyo',
    amount: 50000,
    source: '',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('sn_cash_in_v3', JSON.stringify(cashInList));
  }, [cashInList]);

  const handleAddCashIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCashIn.amount || newCashIn.amount <= 0) return;
    const item = {
      id: `INC-2026-${String(cashInList.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().substring(0, 10),
      refNumber: `VCH-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newCashIn.category,
      categoryJp: newCashIn.category === 'Setoran Modal Pemilik' ? 'オーナー追加資本金出資' : 'その他収入',
      categoryEn: newCashIn.category === 'Setoran Modal Pemilik' ? 'Owner Capital Deposit' : 'Other Income',
      targetAccount: newCashIn.targetAccount,
      amount: Number(newCashIn.amount),
      source: newCashIn.source || 'Penyetor',
      notes: newCashIn.notes || '-',
      status: 'Diterima'
    };
    setCashInList([item, ...cashInList]);
    setIsCashInModalOpen(false);
    setNewCashIn({ category: 'Setoran Modal Pemilik', targetAccount: 'Bank MUFG Tokyo', amount: 50000, source: '', notes: '' });
  };

  // =========================================================================
  // SUB-MODULE 3: KAS TRANSFER (CASH TRANSFER) STATE & HANDLERS
  // =========================================================================
  const [isCashTransferModalOpen, setIsCashTransferModalOpen] = useState(false);
  const [cashTransferList, setCashTransferList] = useState<any[]>(() => {
    const saved = localStorage.getItem('sn_cash_transfer_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTransfer, setNewTransfer] = useState({
    fromAccount: 'Kas POS Kasir Tokyo',
    toAccount: 'Bank Japan Post (Yucho)',
    amount: 50000,
    fee: 0,
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('sn_cash_transfer_v3', JSON.stringify(cashTransferList));
  }, [cashTransferList]);

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransfer.amount || newTransfer.amount <= 0) return;
    const item = {
      id: `TRF-2026-${String(cashTransferList.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().substring(0, 10),
      refNumber: `TRF-BK-${Math.floor(1000 + Math.random() * 9000)}`,
      fromAccount: newTransfer.fromAccount,
      toAccount: newTransfer.toAccount,
      amount: Number(newTransfer.amount),
      fee: Number(newTransfer.fee || 0),
      notes: newTransfer.notes || '-',
      status: 'Selesai'
    };
    setCashTransferList([item, ...cashTransferList]);
    setIsCashTransferModalOpen(false);
    setNewTransfer({ fromAccount: 'Kas POS Kasir Tokyo', toAccount: 'Bank Japan Post (Yucho)', amount: 50000, fee: 0, notes: '' });
  };

  // =========================================================================
  // SUB-MODULE 4: JURNAL ASET (ASSET JOURNAL & DEPRECIATION) STATE & HANDLERS
  // =========================================================================
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetList, setAssetList] = useState<any[]>(() => {
    const saved = localStorage.getItem('sn_assets_journal_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [newAsset, setNewAsset] = useState({
    code: '',
    name: '',
    category: 'Peralatan Toko & IT',
    cost: 100000,
    usefulYears: 5,
    location: 'Gudang Tokyo'
  });

  useEffect(() => {
    localStorage.setItem('sn_assets_journal_v3', JSON.stringify(assetList));
  }, [assetList]);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.cost) return;
    const costNum = Number(newAsset.cost);
    const yearsNum = Number(newAsset.usefulYears || 5);
    const monthly = Math.round(costNum / (yearsNum * 12));
    const item = {
      id: `AST-${String(assetList.length + 1).padStart(3, '0')}`,
      code: newAsset.code || `EQP-${Math.floor(100 + Math.random() * 900)}`,
      name: newAsset.name,
      nameJp: newAsset.name,
      nameEn: newAsset.name,
      category: newAsset.category,
      acquisitionDate: new Date().toISOString().substring(0, 10),
      cost: costNum,
      usefulYears: yearsNum,
      salvageValue: 0,
      monthlyDepreciation: monthly,
      accumulatedDepreciation: 0,
      bookValue: costNum,
      location: newAsset.location || 'Gudang Tokyo'
    };
    setAssetList([...assetList, item]);
    setIsAssetModalOpen(false);
    setNewAsset({ code: '', name: '', category: 'Peralatan Toko & IT', cost: 100000, usefulYears: 5, location: 'Gudang Tokyo' });
  };

  // =========================================================================
  // SUB-MODULE 5: AKUN KAS & REKENING BANK (CASH & BANK ACCOUNTS)
  // =========================================================================
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
  const [bankAccountsList, setBankAccountsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('sn_bank_accounts_v3');
    return saved ? JSON.parse(saved) : [];
  });
  const [newBankAccount, setNewBankAccount] = useState({
    accountName: '',
    accountNumber: '',
    accountType: 'BANK_JP',
    bankName: 'Japan Post Bank (ゆうちょ銀行)',
    branchName: '',
    holderName: 'KABUSHIKI GAISHA SEMBAKO NUSANTARA',
    currency: 'JPY',
    initialBalance: 0,
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('sn_bank_accounts_v3', JSON.stringify(bankAccountsList));
  }, [bankAccountsList]);

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankAccount.accountName || !newBankAccount.bankName) return;
    const item = {
      id: `ACC-${String(bankAccountsList.length + 1).padStart(3, '0')}`,
      accountName: newBankAccount.accountName,
      accountNumber: newBankAccount.accountNumber || '-',
      accountType: newBankAccount.accountType,
      bankName: newBankAccount.bankName,
      branchName: newBankAccount.branchName || 'Tokyo Main Branch',
      holderName: newBankAccount.holderName || 'K.K. Sembako Nusantara',
      currency: newBankAccount.currency,
      balance: Number(newBankAccount.initialBalance || 0),
      isActive: true,
      notes: newBankAccount.notes || '-',
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setBankAccountsList([...bankAccountsList, item]);
    setIsBankAccountModalOpen(false);
    setNewBankAccount({
      accountName: '',
      accountNumber: '',
      accountType: 'BANK_JP',
      bankName: 'Japan Post Bank (ゆうちょ銀行)',
      branchName: '',
      holderName: 'KABUSHIKI GAISHA SEMBAKO NUSANTARA',
      currency: 'JPY',
      initialBalance: 0,
      notes: ''
    });
  };

  const handleToggleAccountStatus = (id: string) => {
    setBankAccountsList(bankAccountsList.map((acc) => acc.id === id ? { ...acc, isActive: !acc.isActive } : acc));
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm(language === 'JP' ? 'この口座を削除しますか？' : language === 'EN' ? 'Delete this bank account?' : 'Hapus akun/rekening ini?')) {
      setBankAccountsList(bankAccountsList.filter((acc) => acc.id !== id));
    }
  };

  // =========================================================================
  // 1. FINANCIAL CORE DATA COMPUTATION (DYNAMIC FROM REAL TRANSACTIONS)
  // =========================================================================
  const totalPosRevenue = posTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOnlineRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = totalPosRevenue + totalOnlineRevenue;
  const totalTransactionCount = posTransactions.length + orders.length;
  const isZeroState = totalTransactionCount === 0;

  // Estimated HPP & Gross Profit (0 when no transactions)
  const estimatedHPP = isZeroState ? 0 : Math.round(totalRevenue * 0.62);
  const grossProfit = isZeroState ? 0 : totalRevenue - estimatedHPP;
  const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  // Operating Expenses (0 when in clean zero state, dynamic when active)
  const operatingExpenses = {
    rentWarehouse: isZeroState ? 0 : 180000,
    electricityColdStorage: isZeroState ? 0 : 65000,
    shippingSubsidyPackaging: isZeroState ? 0 : 48000,
    paymentGatewayFees: isZeroState ? 0 : Math.round(totalRevenue * 0.0324),
    staffPayroll: isZeroState ? 0 : 220000,
    marketingPromo: isZeroState ? 0 : 35000
  };

  const totalOperatingExpenses = isZeroState
    ? 0
    : operatingExpenses.rentWarehouse +
      operatingExpenses.electricityColdStorage +
      operatingExpenses.shippingSubsidyPackaging +
      operatingExpenses.paymentGatewayFees +
      operatingExpenses.staffPayroll +
      operatingExpenses.marketingPromo;

  // Operating Profit
  const operatingProfit = isZeroState ? 0 : grossProfit - totalOperatingExpenses;
  const operatingMarginPercent = totalRevenue > 0 ? Math.round((operatingProfit / totalRevenue) * 100) : 0;

  // Japanese Consumption Tax (JCT 8% food, 10% shipping/services)
  const taxFood8 = isZeroState ? 0 : Math.round((totalRevenue / 1.08) * 0.08);
  const taxShipping10 = isZeroState ? 0 : Math.round(((totalOnlineRevenue * 0.15) / 1.1) * 0.1);
  const totalTaxJCT = taxFood8 + taxShipping10;

  // Net Profit
  const netProfit = isZeroState ? 0 : operatingProfit - Math.round(totalTaxJCT * 0.2);
  const netProfitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // =========================================================================
  // 2. NERACA KEUANGAN (BALANCE SHEET) DATA
  // =========================================================================
  const inventoryValuation = useMemo(() => {
    if (isZeroState) return 0;
    return products.reduce((acc, p) => acc + p.stock * Math.round(p.price * 0.65), 0);
  }, [products, isZeroState]);

  const balanceSheet = {
    assets: {
      currentAssets: {
        cashStorePOS: isZeroState ? 0 : totalPosRevenue,
        bankJapanPost: isZeroState ? 0 : totalOnlineRevenue,
        bankMUFG: 0,
        payPaySettlement: 0,
        accountsReceivable: 0,
        inventoryStock: 0
      },
      fixedAssets: {
        coldStorageFreezers: 0,
        posHardwareEquipment: 0,
        warehouseShelving: 0,
        accumulatedDepreciation: 0
      }
    },
    liabilities: {
      currentLiabilities: {
        accountsPayableSupplier: 0,
        accruedTaxesJCT: totalTaxJCT,
        accruedExpenses: 0,
        customerDeposits: 0
      },
      longTermLiabilities: {
        businessLoan: 0
      }
    },
    equity: {
      capitalPaidIn: 0,
      retainedEarnings: 0
    }
  };

  const totalCurrentAssets =
    balanceSheet.assets.currentAssets.cashStorePOS +
    balanceSheet.assets.currentAssets.bankJapanPost +
    balanceSheet.assets.currentAssets.bankMUFG +
    balanceSheet.assets.currentAssets.payPaySettlement +
    balanceSheet.assets.currentAssets.accountsReceivable +
    balanceSheet.assets.currentAssets.inventoryStock;

  const totalFixedAssets =
    balanceSheet.assets.fixedAssets.coldStorageFreezers +
    balanceSheet.assets.fixedAssets.posHardwareEquipment +
    balanceSheet.assets.fixedAssets.warehouseShelving +
    balanceSheet.assets.fixedAssets.accumulatedDepreciation;

  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities =
    balanceSheet.liabilities.currentLiabilities.accountsPayableSupplier +
    balanceSheet.liabilities.currentLiabilities.accruedTaxesJCT +
    balanceSheet.liabilities.currentLiabilities.accruedExpenses +
    balanceSheet.liabilities.currentLiabilities.customerDeposits;

  const totalLongTermLiabilities = balanceSheet.liabilities.longTermLiabilities.businessLoan;
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const calculatedRetainedEarnings = isZeroState
    ? 0
    : totalAssets - totalLiabilities - balanceSheet.equity.capitalPaidIn;
  const totalEquity = isZeroState ? 0 : balanceSheet.equity.capitalPaidIn + calculatedRetainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // =========================================================================
  // 3. PENJUALAN PER ITEM (ITEM LEVEL METRICS)
  // =========================================================================
  const productSalesMap = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();

    // 1. Aggregation from POS Transactions
    posTransactions.forEach((tx) => {
      tx.items.forEach((item) => {
        const prodId = item.productId || (item as any).id;
        const qty = item.quantity || (item as any).qty || 1;
        const lineTotal = item.subtotal !== undefined ? item.subtotal : item.price * qty;
        const existing = map.get(prodId) || { qty: 0, revenue: 0 };
        map.set(prodId, {
          qty: existing.qty + qty,
          revenue: existing.revenue + lineTotal
        });
      });
    });

    // 2. Aggregation from Online Customer Orders
    orders.forEach((order) => {
      order.items?.forEach((item: any) => {
        const prodId = item.id || item.productId || 'unknown';
        const qty = item.quantity || item.qty || 1;
        const lineTotal = item.subtotal !== undefined ? item.subtotal : item.price * qty;
        const existing = map.get(prodId) || { qty: 0, revenue: 0 };
        map.set(prodId, {
          qty: existing.qty + qty,
          revenue: existing.revenue + lineTotal
        });
      });
    });

    return map;
  }, [posTransactions, orders]);

  const itemPerformanceList = useMemo(() => {
    return products.map((p) => {
      const sales = productSalesMap.get(p.id) || { qty: 0, revenue: 0 };
      const totalQty = sales.qty;
      const totalItemRevenue = sales.revenue;
      const hppUnit = Math.round(p.price * 0.65);
      const totalItemHPP = totalQty * hppUnit;
      const totalItemProfit = totalItemRevenue - totalItemHPP;
      const marginPct = totalItemRevenue > 0 ? Math.round((totalItemProfit / totalItemRevenue) * 100) : 0;
      const revenueShare = totalRevenue > 0 ? ((totalItemRevenue / totalRevenue) * 100).toFixed(1) : '0.0';

      let velocityStatus: 'Fast Moving' | 'Moderate' | 'None' = 'None';
      if (totalQty >= 10) velocityStatus = 'Fast Moving';
      else if (totalQty > 0) velocityStatus = 'Moderate';

      return {
        ...p,
        totalQty,
        totalItemRevenue,
        hppUnit,
        totalItemHPP,
        totalItemProfit,
        marginPct,
        revenueShare,
        velocityStatus
      };
    });
  }, [products, productSalesMap, totalRevenue]);

  const filteredItemPerformance = useMemo(() => {
    let result = itemPerformanceList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(q) ||
        (item.nameJp && item.nameJp.toLowerCase().includes(q)) ||
        item.brand.toLowerCase().includes(q) ||
        item.id.includes(q);

      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchQuery && matchCategory;
    });

    result.sort((a, b) => {
      if (sortBy === 'revenue') return b.totalItemRevenue - a.totalItemRevenue;
      if (sortBy === 'qty') return b.totalQty - a.totalQty;
      if (sortBy === 'profit') return b.totalItemProfit - a.totalItemProfit;
      if (sortBy === 'margin') return b.marginPct - a.marginPct;
      return 0;
    });

    return result;
  }, [itemPerformanceList, searchQuery, selectedCategory, sortBy]);

  const totalItemPages = Math.max(1, Math.ceil(filteredItemPerformance.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItemPerformance.slice(start, start + itemsPerPage);
  }, [filteredItemPerformance, currentPage, itemsPerPage]);

  // =========================================================================
  // 4. OMZET HARIAN (DAILY REVENUE AGGREGATION FROM REAL DATA)
  // =========================================================================
  const dailyRevenueData = useMemo(() => {
    const dateMap = new Map<string, { posTx: number; onlineTx: number; posRev: number; onlineRev: number; payments: string[] }>();

    posTransactions.forEach((tx) => {
      const date = tx.date.split(' ')[0] || tx.date;
      const existing = dateMap.get(date) || { posTx: 0, onlineTx: 0, posRev: 0, onlineRev: 0, payments: [] };
      existing.posTx += 1;
      existing.posRev += tx.totalAmount;
      if (tx.paymentMethod && !existing.payments.includes(tx.paymentMethod)) {
        existing.payments.push(tx.paymentMethod);
      }
      dateMap.set(date, existing);
    });

    orders.forEach((ord) => {
      const date = ord.date;
      const existing = dateMap.get(date) || { posTx: 0, onlineTx: 0, posRev: 0, onlineRev: 0, payments: [] };
      existing.onlineTx += 1;
      existing.onlineRev += ord.totalAmount;
      if (ord.paymentMethod && !existing.payments.includes(ord.paymentMethod)) {
        existing.payments.push(ord.paymentMethod);
      }
      dateMap.set(date, existing);
    });

    const list: any[] = [];
    dateMap.forEach((val, date) => {
      const totalRev = val.posRev + val.onlineRev;
      const totalTx = val.posTx + val.onlineTx;
      const hpp = Math.round(totalRev * 0.62);
      const gross = totalRev - hpp;
      const aov = totalTx > 0 ? Math.round(totalRev / totalTx) : 0;
      list.push({
        date,
        label: date,
        posTx: val.posTx,
        onlineTx: val.onlineTx,
        posRev: val.posRev,
        onlineRev: val.onlineRev,
        totalRev,
        totalTx,
        hpp,
        gross,
        aov,
        paymentTop: val.payments.join(', ') || 'PayPay / Transfer'
      });
    });

    list.sort((a, b) => b.date.localeCompare(a.date));
    return list;
  }, [posTransactions, orders]);

  // =========================================================================
  // 5. TRANSLATION STRINGS (DYNAMIC ID / JP / EN)
  // =========================================================================
  const txt = useMemo(() => {
    if (language === 'JP') {
      return {
        title: '財務会計・売上分析ダッシュボード',
        subtitle: '損益計算書（P&L）、貸借対照表、日次売上、商品別売上、および日本の消費税レポート統合センター。',
        statusZeroTitle: 'ステータス: 0リセット状態 (新規取引待機中)',
        statusActiveTitle: `ステータス: リアルタイム連携中 (${totalTransactionCount}件の取引)`,
        statusZeroBadge: '0リセット / 初期状態',
        statusActiveBadge: 'リアルタイム同期',
        statusZeroDesc: 'すべての財務数値は ¥0 です。顧客のオンライン注文またはPOSレジ取引が入ると自動的に反映されます。',
        statusActiveDesc: '全取引データおよびPOSレジ取引からリアルタイムに集計しています。',
        btnSimulate: 'シミュレーション取引作成',
        btnReset: 'すべて0にリセット',
        tabPnl: '損益計算書 (P&L)',
        tabBalance: '貸借対照表',
        tabDaily: '日次売上',
        tabItems: '商品別売上',
        tabTax: '日本の消費税 (JCT)',
        tabCashOut: '出金・経費支出',
        tabCashIn: '入金・その他収入',
        tabCashTransfer: '口座間振替',
        tabAssetsJournal: '固定資産仕訳',
        tabBankAccounts: '銀行口座・決済アカウント',
        // Bank Accounts
        bankAccTitle: '銀行口座・決済アカウント台帳 (Cash & Bank Accounts)',
        bankAccSub: 'ゆうちょ銀行、三菱UFJ、三井住友、みずほ、および店舗レジ金庫口座の残高とステータス管理',
        btnAddAccount: '+ 新規口座・アカウントを追加',
        kpiTotalBankBalance: '口座・手元流動性合計',
        kpiActiveAccounts: '有効口座数',
        kpiJapanBankCount: '日本の銀行口座',
        kpiIndonesiaBankCount: 'インドネシア送金・他口座',
        thAccountName: '口座名・用途',
        thAccountType: '種別',
        thBankName: '金融機関名',
        thBranch: '支店名',
        thAccountNumber: '口座番号',
        thHolder: '名義人',
        thBalance: '残高 (¥ JPY)',
        thStatus: '状態',
        thAction: '操作',
        // Cash Out
        cashOutTitle: '出金管理・経費支出台帳 (Cash Outflow)',
        cashOutSub: '店舗・倉庫家賃、光熱費、給与、梱包配送料等の出金記録',
        btnAddCashOut: '+ 新規出金を記録',
        kpiTotalCashOut: '今月の出金合計額',
        kpiCashOutCount: '出金取引件数',
        kpiTopExpense: '最大支出カテゴリー',
        thCashOutDate: '出金日',
        thCashOutRef: '伝票番号',
        thCashOutCat: '支出カテゴリー',
        thCashOutSource: '出金元口座',
        thCashOutAmount: '出金額 (¥)',
        thCashOutRecipient: '支払先・担当者',
        thCashOutNotes: '備考・用途',
        thCashOutStatus: 'ステータス',
        // Cash In
        cashInTitle: '入金管理・その他収入台帳 (Cash Inflow)',
        cashInSub: '資本金追加出資、代行手数料、過払い返金、受取利息等の入金記録',
        btnAddCashIn: '+ 新規入金を記録',
        kpiTotalCashIn: '今月の入金合計額',
        kpiCashInCount: '入金取引件数',
        kpiTopIncome: '最大入金項目',
        thCashInDate: '入金日',
        thCashInRef: '伝票番号',
        thCashInCat: '入金カテゴリー',
        thCashInTarget: '入金先口座',
        thCashInAmount: '入金額 (¥)',
        thCashInSource: '入金元・支払人',
        thCashInNotes: '備考・用途',
        thCashInStatus: 'ステータス',
        // Cash Transfer
        cashTransferTitle: '資金移動・口座間振替 (Cash Transfer)',
        cashTransferSub: 'POSレジ現金からゆうちょ銀行への売上預入れ、口座間資金移動',
        btnAddTransfer: '+ 口座間振替を実行',
        kpiTotalTransfer: '振替完了総額',
        kpiTransferCount: '振替回数',
        kpiPosDeposit: 'POSレジ預入れ累計',
        thTransferDate: '振替日',
        thTransferRef: '振替番号',
        thTransferFrom: '振替元口座',
        thTransferTo: '振替先口座',
        thTransferAmount: '振替金額 (¥)',
        thTransferFee: '振込手数料 (¥)',
        thTransferNotes: '備考・目的',
        thTransferStatus: 'ステータス',
        // Asset Journal
        assetTitle: '固定資産台帳・減価償却仕訳 (Asset Journal)',
        assetSub: '冷凍ストッカー、POSレジ端末、倉庫ラック等の耐用年数と毎月の定額減価償却',
        btnAddAsset: '+ 新規資産を登録',
        kpiTotalAssetCost: '固定資産取得原価合計',
        kpiAccumDepreciation: '減価償却累計額',
        kpiNetBookValue: '固定資産帳簿価額 (純額)',
        thAssetCode: '資産コード',
        thAssetName: '固定資産名称',
        thAssetCategory: '資産区分',
        thAssetDate: '取得年月日',
        thAssetCost: '取得原価 (¥)',
        thAssetYears: '耐用年数',
        thAssetMonthlyDep: '月次減価償却 (¥)',
        thAssetAccumDep: '償却累計額 (¥)',
        thAssetBookVal: '現在簿価 (¥)',
        thAssetLoc: '設置場所',
        periodLabel: '対象期間:',
        periodOptions: [
          { val: 'today', label: '本日 (リアルタイム)' },
          { val: 'week', label: '今週' },
          { val: 'month', label: '今月 (2026年9月)' },
          { val: 'year', label: '2026年通期' }
        ],
        btnPrint: '帳票を印刷',
        // Top Cards
        kpiTotalRev: '総売上高 (REVENUE)',
        kpiGrossProfit: '売上総利益 (GROSS PROFIT)',
        kpiOpex: '販売管理費 (OPEX)',
        kpiNetProfit: '当期純利益 (NET PROFIT)',
        kpiPosOnline: (pos: number, onl: number) => `POS: ¥${pos.toLocaleString()} | Web: ¥${onl.toLocaleString()}`,
        kpiGrossMargin: (m: number) => `粗利率: ${m}%`,
        kpiOpexSub: '家賃・光熱費・人件費・決済手数料',
        kpiNetMargin: (m: number) => `純利益率: ${m}%`,
        // P&L Statement
        pnlTitle: '包括損益計算書',
        pnlSub: '日本の中小企業会計基準・確定申告準拠',
        pnlCurrency: '通貨: 日本円 (JPY ¥)',
        pnlRevHeader: '1. 売上高 (REVENUE)',
        pnlRevPos: '• 東京実店舗POSレジ売上',
        pnlRevOnline: '• EコマースWeb注文売上',
        pnlCogsHeader: '2. 売上原価 (HPP / COGS)',
        pnlCogsItems: '• インドネシア食材・ハラール商品仕入れ原価',
        pnlCogsCustoms: '• 関税及び食品検疫・通関費用',
        pnlGrossProfitHeader: '売上総利益 (粗利益)',
        pnlOpexHeader: '3. 販売費及び一般管理費 (OPEX)',
        pnlOpexRent: '• 関東・東京店舗及び倉庫賃料',
        pnlOpexElec: '• 冷凍ストッカー電気代 (-20℃)',
        pnlOpexPayroll: '• 店舗レジスタッフ及び倉庫管理給与',
        pnlOpexPack: '• 緩衝材・段ボール等梱包費用',
        pnlOpexGateway: '• 決済代行手数料 (PayPay / JPQR / Stripe 3.24%)',
        pnlOpexPromo: '• 在日コミュニティ向け広告宣伝費',
        pnlTaxHeader: '4. 日本の消費税 (JCT 8% & 10%)',
        pnlTax8: '• 飲食料品・ハラール食材消費税 (軽減税率 8%)',
        pnlTax10: '• 配送料・サービス消費税 (標準税率 10%)',
        pnlNetProfitHeader: '当期純利益 (NET PROFIT)',
        pnlNetProfitSub: 'すべての費用および税負担控除後の最終利益',
        // Balance Sheet
        bsTitle: '貸借対照表 (バランスシート)',
        bsSub: '資産・負債・純資産の財務状態',
        bsBalanced: 'バランス良好 (Balanced)',
        bsAdjust: '調整中',
        bsTotalAssets: '総資産合計 (TOTAL ASSETS)',
        bsCurrentAssets: 'A. 流動資産',
        bsCashPos: '• POSレジ内現金',
        bsBankJapanPost: '• ゆうちょ銀行口座残高',
        bsBankMufg: '• 三菱UFJ銀行口座残高',
        bsPayPay: '• PayPay売上未収金 (売掛金)',
        bsReceivable: '• Eコマース売掛金 / ヤマト代引き未収金',
        bsInventory: '• 倉庫ハラール食材在庫評価額',
        bsFixedAssets: 'B. 固定資産',
        bsFreezers: '• 業務用大型冷凍ストッカー (-20℃)',
        bsPosHardware: '• POSレジ端末及びバーコード機器',
        bsShelving: '• 店舗ディスプレイ棚・倉庫ラック',
        bsDepreciation: '• 減価償却累計額',
        bsTotalLiabEquity: '負債及び純資産合計 (TOTAL LIABILITIES & EQUITY)',
        bsCurrentLiab: 'A. 流動負債',
        bsAccountsPayable: '• インドネシア現地仕入先買掛金',
        bsAccruedTax: '• 未払消費税 (JCT 8%/10%)',
        bsAccruedExpenses: '• 未払給与及び営業未払金',
        bsCustomerDeposits: '• 顧客ポイント・預り金',
        bsLongTermLiab: 'B. 固定負債',
        bsBusinessLoan: '• 日本公庫等事業融資借入金',
        bsEquity: 'C. 純資産 (株主資本)',
        bsCapital: '• 資本金',
        bsRetainedEarnings: '• 利益剰余金',
        // Daily Revenue
        dailyTitle: '日次売上・決済方法別集計',
        dailySub: '実店舗POSレジおよびオンライン注文の日次推移',
        dailyTotalDays: (cnt: number) => `集計日数: ${cnt} 日間`,
        dailyEmptyTitle: '日次取引履歴がありません',
        dailyEmptyDesc: '現在は0リセット状態です。POSレジまたはWeb注文が入ると日付ごとに自動記録されます。',
        dailyThDate: '日付',
        dailyThPosTx: 'POS件数',
        dailyThOnlineTx: 'Web件数',
        dailyThPosRev: 'POS売上 (¥)',
        dailyThOnlineRev: 'Web売上 (¥)',
        dailyThTotalRev: '合計売上 (¥)',
        dailyThGross: '粗利益 (¥)',
        dailyThPayment: '主な決済方法',
        // Sales By Item
        itemsTitle: '商品別売上・利益分析 (SKU)',
        itemsSub: '販売数量、売上貢献度、および商品別粗利益率の分析',
        itemsSearchPh: '商品名・ブランドで検索...',
        itemsAllCat: '全カテゴリー',
        itemsSortRev: '並び替え: 売上高順',
        itemsSortQty: '並び替え: 販売数量順',
        itemsSortProfit: '並び替え: 利益額順',
        itemsSortMargin: '並び替え: 粗利率順',
        itemsThItem: '商品情報 / SKU',
        itemsThCat: 'カテゴリー',
        itemsThPrice: '販売価格',
        itemsThQty: '販売数量',
        itemsThRev: '総売上高',
        itemsThProfit: '粗利益額',
        itemsThMargin: '粗利率',
        itemsThStatus: 'ステータス',
        itemsFastMoving: '売れ筋 (Fast Moving)',
        itemsModerate: '標準 (Moderate)',
        itemsNoSales: '販売実績なし',
        itemsPagination: (cur: number, tot: number) => `${cur} / ${tot} ページ`,
        itemsPrev: '前へ',
        itemsNext: '次へ',
        // Tax Report
        taxTitle: '日本の消費税・インボイス制度対応レポート',
        taxSub: '軽減税率8% (飲食料品) および標準税率10% (配送料・資材) の集計',
        taxBadgeVerified: '適格請求書発行事業者対応済',
        taxCardFood: '飲食料品・ハラール食材 (軽減税率 8%)',
        taxCardFoodDesc: '輸入ハラール基礎食品・インスタント麺・調味料対象。',
        taxCardShipping: '配送・資材・サービス (標準税率 10%)',
        taxCardShippingDesc: 'ヤマト運輸・佐川急便クール便送料等。',
        taxCardTotal: '消費税納税見込額合計 (JCT)',
        taxCardTotalDesc: '国税庁・税務署への消費税納付予定額。'
      };
    } else if (language === 'EN') {
      return {
        title: 'Financial Accounting & Sales Analytics Dashboard',
        subtitle: 'Integrated Profit & Loss (P&L), Balance Sheet, Daily Revenue, Item Performance, and Japan Tax Report.',
        statusZeroTitle: 'Report Status: ZERO CLEAN STATE (Ready for New Transactions)',
        statusActiveTitle: `Report Status: LIVE SYNC (${totalTransactionCount} Transactions Recorded)`,
        statusZeroBadge: 'CLEAR / 0 STATE',
        statusActiveBadge: 'LIVE SYNC',
        statusZeroDesc: 'All financial figures are currently ¥0. Customer web orders or POS cashier transactions will sync automatically here.',
        statusActiveDesc: 'Data is dynamically calculated in real time from all web orders and POS transactions.',
        btnSimulate: 'Create Sample Transaction',
        btnReset: 'Reset All to 0',
        tabPnl: 'Profit & Loss (P&L)',
        tabBalance: 'Balance Sheet',
        tabDaily: 'Daily Omzet',
        tabItems: 'Sales by Item',
        tabTax: 'Japan Tax (JCT)',
        tabCashOut: 'Cash Outflow',
        tabCashIn: 'Cash Inflow',
        tabCashTransfer: 'Cash Transfer',
        tabAssetsJournal: 'Asset Journal',
        tabBankAccounts: 'Cash & Bank Accounts',
        // Bank Accounts
        bankAccTitle: 'Cash & Bank Accounts Register',
        bankAccSub: 'Management of Japan Post Bank, MUFG, SMBC, Mizuho, and POS cash drawers',
        btnAddAccount: '+ Add New Bank / Cash Account',
        kpiTotalBankBalance: 'Total Liquid Balance',
        kpiActiveAccounts: 'Active Accounts',
        kpiJapanBankCount: 'Japan Bank Accounts',
        kpiIndonesiaBankCount: 'IDN Remittance & Others',
        thAccountName: 'Account Name',
        thAccountType: 'Type',
        thBankName: 'Financial Institution',
        thBranch: 'Branch',
        thAccountNumber: 'Account No.',
        thHolder: 'Holder Name',
        thBalance: 'Balance (¥ JPY)',
        thStatus: 'Status',
        thAction: 'Action',
        // Cash Out
        cashOutTitle: 'Cash Outflow & Expense Ledger',
        cashOutSub: 'Rent, utility bills, employee payroll, shipping & operational expense records',
        btnAddCashOut: '+ Record New Cash Outflow',
        kpiTotalCashOut: 'Total Outflows (This Month)',
        kpiCashOutCount: 'Outflow Transactions',
        kpiTopExpense: 'Largest Expense Category',
        thCashOutDate: 'Date',
        thCashOutRef: 'Ref #',
        thCashOutCat: 'Expense Category',
        thCashOutSource: 'Source Account',
        thCashOutAmount: 'Amount (¥)',
        thCashOutRecipient: 'Recipient / Vendor',
        thCashOutNotes: 'Notes / Purpose',
        thCashOutStatus: 'Status',
        // Cash In
        cashInTitle: 'Cash Inflow & Other Income Ledger',
        cashInSub: 'Capital deposits, service commissions, freight refunds, and bank interest',
        btnAddCashIn: '+ Record New Cash Inflow',
        kpiTotalCashIn: 'Total Inflows (This Month)',
        kpiCashInCount: 'Inflow Transactions',
        kpiTopIncome: 'Largest Inflow Category',
        thCashInDate: 'Date',
        thCashInRef: 'Ref #',
        thCashInCat: 'Income Category',
        thCashInTarget: 'Target Account',
        thCashInAmount: 'Amount (¥)',
        thCashInSource: 'Source / Payer',
        thCashInNotes: 'Notes / Purpose',
        thCashInStatus: 'Status',
        // Cash Transfer
        cashTransferTitle: 'Fund Movement & Cash Transfer',
        cashTransferSub: 'POS drawer deposit to Japan Post Bank, and inter-bank transfers',
        btnAddTransfer: '+ Execute Fund Transfer',
        kpiTotalTransfer: 'Total Transfers Completed',
        kpiTransferCount: 'Transfer Frequency',
        kpiPosDeposit: 'POS Cash Deposited',
        thTransferDate: 'Date',
        thTransferRef: 'Transfer #',
        thTransferFrom: 'From Account',
        thTransferTo: 'To Account',
        thTransferAmount: 'Amount (¥)',
        thTransferFee: 'Transfer Fee (¥)',
        thTransferNotes: 'Notes / Purpose',
        thTransferStatus: 'Status',
        // Asset Journal
        assetTitle: 'Fixed Asset Register & Depreciation Journal',
        assetSub: 'Commercial freezers, POS terminals, and warehouse racks with monthly straight-line depreciation',
        btnAddAsset: '+ Register New Fixed Asset',
        kpiTotalAssetCost: 'Total Asset Acquisition Cost',
        kpiAccumDepreciation: 'Accumulated Depreciation',
        kpiNetBookValue: 'Net Book Value',
        thAssetCode: 'Asset Code',
        thAssetName: 'Asset Description',
        thAssetCategory: 'Category',
        thAssetDate: 'Acquisition Date',
        thAssetCost: 'Cost (¥)',
        thAssetYears: 'Useful Life',
        thAssetMonthlyDep: 'Monthly Dep (¥)',
        thAssetAccumDep: 'Accum Dep (¥)',
        thAssetBookVal: 'Book Value (¥)',
        thAssetLoc: 'Location',
        periodLabel: 'Data Period:',
        periodOptions: [
          { val: 'today', label: 'Today (Real-Time)' },
          { val: 'week', label: 'This Week' },
          { val: 'month', label: 'This Month (September 2026)' },
          { val: 'year', label: 'Full Year 2026' }
        ],
        btnPrint: 'Print Report',
        // Top Cards
        kpiTotalRev: 'TOTAL GROSS REVENUE',
        kpiGrossProfit: 'GROSS PROFIT',
        kpiOpex: 'OPERATING EXPENSES (OPEX)',
        kpiNetProfit: 'NET PROFIT',
        kpiPosOnline: (pos: number, onl: number) => `POS: ¥${pos.toLocaleString()} | Web: ¥${onl.toLocaleString()}`,
        kpiGrossMargin: (m: number) => `Gross Margin: ${m}%`,
        kpiOpexSub: 'Rent, Utilities, Payroll, Payment Fees',
        kpiNetMargin: (m: number) => `Net Margin: ${m}%`,
        // P&L Statement
        pnlTitle: 'Comprehensive Profit & Loss Statement',
        pnlSub: 'Standard Japanese Commercial Trade Accounting Format',
        pnlCurrency: 'Currency: Japanese Yen (JPY ¥)',
        pnlRevHeader: '1. BUSINESS REVENUE',
        pnlRevPos: '• Tokyo Physical Store POS Sales',
        pnlRevOnline: '• E-Commerce Web Orders',
        pnlCogsHeader: '2. COST OF GOODS SOLD (HPP / COGS)',
        pnlCogsItems: '• Halal Food Purchase from Importers',
        pnlCogsCustoms: '• Japan Food Quarantine & Customs Duties',
        pnlGrossProfitHeader: 'GROSS PROFIT',
        pnlOpexHeader: '3. STORE & WAREHOUSE OPEX',
        pnlOpexRent: '• Tokyo Store & Warehouse Lease',
        pnlOpexElec: '• Commercial Freezer Electricity (-20°C)',
        pnlOpexPayroll: '• Cashier & Warehouse Staff Payroll',
        pnlOpexPack: '• Bubble Wrap & Heavy-Duty Carton Packaging',
        pnlOpexGateway: '• Payment Gateway Fees (PayPay/JPQR/Stripe 3.24%)',
        pnlOpexPromo: '• Community Marketing & Promotions',
        pnlTaxHeader: '4. JAPAN CONSUMPTION TAX (JCT 8% & 10%)',
        pnlTax8: '• Halal Food Consumption Tax (Reduced 8% Rate)',
        pnlTax10: '• Shipping & Service Consumption Tax (Standard 10% Rate)',
        pnlNetProfitHeader: 'NET PROFIT FOR THE PERIOD',
        pnlNetProfitSub: 'Net earnings after all operating costs and tax obligations',
        // Balance Sheet
        bsTitle: 'Business Balance Sheet',
        bsSub: 'Financial Position, Assets, Liabilities, and Equity',
        bsBalanced: 'Balanced',
        bsAdjust: 'In Adjustment',
        bsTotalAssets: 'TOTAL ASSETS',
        bsCurrentAssets: 'A. CURRENT ASSETS',
        bsCashPos: '• Cash in POS Register Drawer',
        bsBankJapanPost: '• Japan Post Bank Balance',
        bsBankMufg: '• MUFG Bank Tokyo Balance',
        bsPayPay: '• PayPay Merchant Settlement Pending',
        bsReceivable: '• E-Commerce & Yamato COD Accounts Receivable',
        bsInventory: '• Halal Food Inventory Warehouse Valuation',
        bsFixedAssets: 'B. FIXED ASSETS',
        bsFreezers: '• Commercial Deep Freezer Units (-20°C)',
        bsPosHardware: '• POS Hardware Terminal & Barcode Scanners',
        bsShelving: '• Store Displays & Warehouse Racking',
        bsDepreciation: '• Accumulated Depreciation',
        bsTotalLiabEquity: 'TOTAL LIABILITIES & EQUITY',
        bsCurrentLiab: 'A. CURRENT LIABILITIES',
        bsAccountsPayable: '• Indonesian Supplier Accounts Payable',
        bsAccruedTax: '• Japan Consumption Tax Payable (JCT)',
        bsAccruedExpenses: '• Accrued Payroll & Operating Expenses',
        bsCustomerDeposits: '• Customer Digital Wallet Deposits',
        bsLongTermLiab: 'B. LONG-TERM LIABILITIES',
        bsBusinessLoan: '• Diaspora Small Business Loan',
        bsEquity: 'C. EQUITY & CAPITAL',
        bsCapital: '• Paid-in Founder Capital',
        bsRetainedEarnings: '• Retained Earnings',
        // Daily Revenue
        dailyTitle: 'Daily Sales & Payment Methods Breakdown',
        dailySub: 'Daily revenue breakdown from POS and online store',
        dailyTotalDays: (cnt: number) => `Recorded Days: ${cnt} Days`,
        dailyEmptyTitle: 'No Daily Transaction History Yet',
        dailyEmptyDesc: 'Currently in clean zero state. Transactions from POS or website will appear here automatically.',
        dailyThDate: 'Date',
        dailyThPosTx: 'POS Trx',
        dailyThOnlineTx: 'Web Trx',
        dailyThPosRev: 'POS Omzet (¥)',
        dailyThOnlineRev: 'Web Omzet (¥)',
        dailyThTotalRev: 'Total Omzet (¥)',
        dailyThGross: 'Gross Profit (¥)',
        dailyThPayment: 'Payment Methods',
        // Sales By Item
        itemsTitle: 'Sales by Item (SKU Performance)',
        itemsSub: 'Units sold, revenue share, and gross profit analysis per SKU',
        itemsSearchPh: 'Search product name / brand...',
        itemsAllCat: 'All Categories',
        itemsSortRev: 'Sort: Highest Revenue',
        itemsSortQty: 'Sort: Units Sold',
        itemsSortProfit: 'Sort: Highest Profit',
        itemsSortMargin: 'Sort: Margin %',
        itemsThItem: 'Product / SKU',
        itemsThCat: 'Category',
        itemsThPrice: 'Selling Price',
        itemsThQty: 'Units Sold',
        itemsThRev: 'Total Revenue',
        itemsThProfit: 'Gross Profit',
        itemsThMargin: 'Margin %',
        itemsThStatus: 'Status',
        itemsFastMoving: 'Fast Moving',
        itemsModerate: 'Moderate',
        itemsNoSales: 'No Sales Yet',
        itemsPagination: (cur: number, tot: number) => `Page ${cur} of ${tot}`,
        itemsPrev: 'Previous',
        itemsNext: 'Next',
        // Tax Report
        taxTitle: 'Japan Consumption Tax (JCT) Summary',
        taxSub: 'Compliance report for 8% Foodstuffs and 10% Delivery Services',
        taxBadgeVerified: 'Official Qualified Invoice Issuer Verified',
        taxCardFood: 'Halal Food Tax (8% Reduced Rate)',
        taxCardFoodDesc: 'Applies to all imported halal groceries and instant foods.',
        taxCardShipping: 'Service & Delivery Tax (10% Standard Rate)',
        taxCardShippingDesc: 'Applies to Yamato and Sagawa shipping fees.',
        taxCardTotal: 'Total JCT Tax Payable',
        taxCardTotalDesc: 'Total tax liability payable to the National Tax Agency.'
      };
    } else {
      // Indonesian (ID)
      return {
        title: 'Laporan Keuangan, Neraca & Performa Penjualan',
        subtitle: 'Pusat pembukuan akuntansi terpadu: Laba Rugi, Neraca Keuangan, Omzet Harian, Penjualan per Item, dan Pajak Konsumsi Jepang.',
        statusZeroTitle: 'Status Laporan: KONDISI 0 BERSIH (Siap Transaksi Baru)',
        statusActiveTitle: `Status Laporan: AKTIF TERHUBUNG (${totalTransactionCount} Transaksi Masuk)`,
        statusZeroBadge: 'CLEAR / 0 STATE',
        statusActiveBadge: 'LIVE SYNC',
        statusZeroDesc: 'Semua angka keuangan bernilai ¥0. Setiap pesanan pelanggan atau kasir POS yang masuk akan langsung tercatat otomatis di sini.',
        statusActiveDesc: 'Data dihitung secara real-time dari seluruh pesanan e-commerce dan transaksi kasir POS.',
        btnSimulate: 'Buat Transaksi Simulasi',
        btnReset: 'Reset Semua ke 0',
        tabPnl: 'Laba Rugi',
        tabBalance: 'Neraca Keuangan',
        tabDaily: 'Omzet Harian',
        tabItems: 'Penjualan per Item',
        tabTax: 'Pajak Konsumsi Jepang',
        tabCashOut: 'Kas Keluar',
        tabCashIn: 'Kas Masuk',
        tabCashTransfer: 'Kas Transfer',
        tabAssetsJournal: 'Jurnal Aset',
        tabBankAccounts: 'Akun Kas & Bank',
        // Bank Accounts
        bankAccTitle: 'Buku Rekening Bank & Kas Operasional',
        bankAccSub: 'Pengelolaan rekening Bank Pos Jepang (Yucho), MUFG, SMBC, Mizuho, serta brankas kasir POS',
        btnAddAccount: '+ Tambah Rekening / Akun Baru',
        kpiTotalBankBalance: 'Total Saldo Likuiditas',
        kpiActiveAccounts: 'Akun Aktif',
        kpiJapanBankCount: 'Rekening Bank Jepang',
        kpiIndonesiaBankCount: 'Bank Remitansi & Lainnya',
        thAccountName: 'Nama Akun / Buku',
        thAccountType: 'Tipe',
        thBankName: 'Nama Bank / Institusi',
        thBranch: 'Cabang',
        thAccountNumber: 'No. Rekening',
        thHolder: 'Atas Nama (Holder)',
        thBalance: 'Saldo (¥ JPY)',
        thStatus: 'Status',
        thAction: 'Aksi',
        // Cash Out
        cashOutTitle: 'Buku Kas Keluar & Beban Operasional (Cash Out)',
        cashOutSub: 'Pencatatan pengeluaran sewa toko, listrik, gaji karyawan, dan operasional',
        btnAddCashOut: '+ Catat Kas Keluar Baru',
        kpiTotalCashOut: 'Total Pengeluaran Kas (Bulan Ini)',
        kpiCashOutCount: 'Jumlah Transaksi Keluar',
        kpiTopExpense: 'Kategori Pengeluaran Terbesar',
        thCashOutDate: 'Tanggal',
        thCashOutRef: 'No. Voucher',
        thCashOutCat: 'Kategori Biaya',
        thCashOutSource: 'Akun Sumber',
        thCashOutAmount: 'Nominal (¥)',
        thCashOutRecipient: 'Penerima / Vendor',
        thCashOutNotes: 'Keterangan',
        thCashOutStatus: 'Status',
        // Cash In
        cashInTitle: 'Buku Kas Masuk & Penerimaan Lain (Cash In)',
        cashInSub: 'Pencatatan setoran modal pemilik, jasa titip/komisi, klaim pengembalian, dan bunga bank',
        btnAddCashIn: '+ Catat Kas Masuk Baru',
        kpiTotalCashIn: 'Total Kas Masuk (Bulan Ini)',
        kpiCashInCount: 'Jumlah Transaksi Masuk',
        kpiTopIncome: 'Kategori Masuk Terbesar',
        thCashInDate: 'Tanggal',
        thCashInRef: 'No. Voucher',
        thCashInCat: 'Kategori Penerimaan',
        thCashInTarget: 'Akun Tujuan',
        thCashInAmount: 'Nominal (¥)',
        thCashInSource: 'Sumber Dana / Penyetor',
        thCashInNotes: 'Keterangan',
        thCashInStatus: 'Status',
        // Cash Transfer
        cashTransferTitle: 'Transfer Saldo Kas & Rekening Bank',
        cashTransferSub: 'Mutasi setoran uang kasir POS ke rekening bank dan transfer antar rekening',
        btnAddTransfer: '+ Transfer Kas / Antar Bank',
        kpiTotalTransfer: 'Total Transfer Selesai',
        kpiTransferCount: 'Frekuensi Mutasi',
        kpiPosDeposit: 'Setoran Kasir POS',
        thTransferDate: 'Tanggal',
        thTransferRef: 'No. Bukti',
        thTransferFrom: 'Dari Akun',
        thTransferTo: 'Ke Akun',
        thTransferAmount: 'Nominal (¥)',
        thTransferFee: 'Biaya Admin (¥)',
        thTransferNotes: 'Keterangan',
        thTransferStatus: 'Status',
        // Asset Journal
        assetTitle: 'Buku Jurnal Aset Tetap & Penyusutan',
        assetSub: 'Daftar inventaris freezer komersial, mesin POS, dan rak gudang dengan penyusutan garis lurus',
        btnAddAsset: '+ Tambah Aset Tetap Baru',
        kpiTotalAssetCost: 'Total Nilai Perolehan Aset',
        kpiAccumDepreciation: 'Akumulasi Penyusutan',
        kpiNetBookValue: 'Nilai Buku Bersih (Net Book Value)',
        thAssetCode: 'Kode Aset',
        thAssetName: 'Nama Aset & Spesifikasi',
        thAssetCategory: 'Kategori Aset',
        thAssetDate: 'Tgl Beli',
        thAssetCost: 'Harga Beli (¥)',
        thAssetYears: 'Masa Manfaat',
        thAssetMonthlyDep: 'Penyusutan/Bln (¥)',
        thAssetAccumDep: 'Akum. Susut (¥)',
        thAssetBookVal: 'Nilai Buku (¥)',
        thAssetLoc: 'Lokasi Penempatan',
        periodLabel: 'Periode Data:',
        periodOptions: [
          { val: 'today', label: 'Hari Ini (Real-Time)' },
          { val: 'week', label: 'Minggu Ini' },
          { val: 'month', label: 'Bulan Ini (September 2026)' },
          { val: 'year', label: 'Tahun 2026 Penuh' }
        ],
        btnPrint: 'Cetak Laporan',
        // Top Cards
        kpiTotalRev: 'TOTAL OMZET PENJUALAN',
        kpiGrossProfit: 'LABA KOTOR (GROSS PROFIT)',
        kpiOpex: 'TOTAL BEBAN OPERASIONAL',
        kpiNetProfit: 'LABA BERSIH (NET PROFIT)',
        kpiPosOnline: (pos: number, onl: number) => `POS: ¥${pos.toLocaleString()} | Online: ¥${onl.toLocaleString()}`,
        kpiGrossMargin: (m: number) => `Margin Kotor: ${m}%`,
        kpiOpexSub: 'Sewa, Listrik, Gaji, Gateway',
        kpiNetMargin: (m: number) => `Margin Bersih: ${m}%`,
        // P&L Statement
        pnlTitle: 'Laporan Laba Rugi Komprehensif',
        pnlSub: 'Format Standar Akuntansi Usaha Dagang Jepang',
        pnlCurrency: 'Mata Uang: JPY (¥)',
        pnlRevHeader: '1. PENDAPATAN USAHA (REVENUE)',
        pnlRevPos: '• Penjualan Toko Fisik POS Tokyo',
        pnlRevOnline: '• Penjualan E-Commerce & Web Order',
        pnlCogsHeader: '2. HARGA POKOK PENJUALAN (HPP / COGS)',
        pnlCogsItems: '• Pembelian Sembako dari Supplier Importir',
        pnlCogsCustoms: '• Bea Masuk & Karantina Pangan Jepang',
        pnlGrossProfitHeader: 'LABA KOTOR (GROSS PROFIT)',
        pnlOpexHeader: '3. BEBAN OPERASIONAL TOKO & GUDANG (OPEX)',
        pnlOpexRent: '• Sewa Toko & Gudang Kanto Tokyo',
        pnlOpexElec: '• Listrik & Cold Storage Freezer -20°C',
        pnlOpexPayroll: '• Gaji Karyawan Kasir & Admin Gudang Diaspora',
        pnlOpexPack: '• Biaya Pengemasan Bubble Wrap & Kardus Tebal',
        pnlOpexGateway: '• Fee Gateway Pembayaran (PayPay / JPQR / Stripe 3.24%)',
        pnlOpexPromo: '• Pemasaran & Promosi Komunitas Diaspora',
        pnlTaxHeader: '4. PAJAK KONSUMSI JEPANG (JCT 8% & 10%)',
        pnlTax8: '• Pajak Konsumsi Makanan/Sembako Halal (Tarif 8%)',
        pnlTax10: '• Pajak Konsumsi Jasa Ongkir & Layanan (Tarif 10%)',
        pnlNetProfitHeader: 'LABA BERSIH TAHUN BERJALAN (NET PROFIT)',
        pnlNetProfitSub: 'Setelah dikurangi semua beban dan kewajiban pajak',
        // Balance Sheet
        bsTitle: 'Neraca Keuangan Usaha',
        bsSub: 'Posisi Keuangan, Aset, Kewajiban, dan Ekuitas Modal',
        bsBalanced: 'Neraca Seimbang (Balanced)',
        bsAdjust: 'Dalam Penyesuaian',
        bsTotalAssets: 'TOTAL AKTIVA / ASET',
        bsCurrentAssets: 'A. AKTIVA LANCAR',
        bsCashPos: '• Kas Tunai di Laci Kasir POS',
        bsBankJapanPost: '• Saldo Bank Pos Jepang (Japan Post Bank)',
        bsBankMufg: '• Saldo Bank MUFG Tokyo',
        bsPayPay: '• Saldo Merchant PayPay Pending Settlement',
        bsReceivable: '• Piutang E-Commerce / COD Yamato Pending',
        bsInventory: '• Valuasi Stok Sembako Halal di Gudang',
        bsFixedAssets: 'B. AKTIVA TETAP',
        bsFreezers: '• Unit Freezer Komersial (-20°C)',
        bsPosHardware: '• Mesin Kasir POS & Hardware Barcode',
        bsShelving: '• Rak Display Toko & Racking Gudang',
        bsDepreciation: '• Akumulasi Penyusutan Aset',
        bsTotalLiabEquity: 'TOTAL PASIVA & EKUITAS',
        bsCurrentLiab: 'A. KEWAJIBAN JANGKA PENDEK',
        bsAccountsPayable: '• Hutang Dagang Supplier Impor Indonesia',
        bsAccruedTax: '• Pajak Konsumsi Jepang Terutang (JCT)',
        bsAccruedExpenses: '• Beban Gaji & Operasional Terutang',
        bsCustomerDeposits: '• Deposit Saldo Dompet Digital Pelanggan',
        bsLongTermLiab: 'B. KEWAJIBAN JANGKA PANJANG',
        bsBusinessLoan: '• Pinjaman Usaha Lunak Diaspora',
        bsEquity: 'C. EKUITAS & MODAL',
        bsCapital: '• Modal Awal Disetor Pendiri',
        bsRetainedEarnings: '• Laba Ditahan (Retained Earnings)',
        // Daily Revenue
        dailyTitle: 'Laporan Omzet Penjualan Harian',
        dailySub: 'Rincian pendapatan kasir POS dan toko online per hari',
        dailyTotalDays: (cnt: number) => `Total Hari Tercatat: ${cnt} Hari`,
        dailyEmptyTitle: 'Belum Ada Riwayat Transaksi Harian',
        dailyEmptyDesc: 'Kondisi saat ini 0 bersih. Ketika ada transaksi di kasir POS atau pesanan masuk dari website, riwayat per tanggal akan langsung muncul di sini.',
        dailyThDate: 'Tanggal',
        dailyThPosTx: 'Trx POS',
        dailyThOnlineTx: 'Trx Online',
        dailyThPosRev: 'Omzet POS (¥)',
        dailyThOnlineRev: 'Omzet Online (¥)',
        dailyThTotalRev: 'Total Omzet (¥)',
        dailyThGross: 'Laba Kotor (¥)',
        dailyThPayment: 'Metode Bayar',
        // Sales By Item
        itemsTitle: 'Laporan Penjualan per Item (SKU)',
        itemsSub: 'Analisis kuantitas terjual, kontribusi omzet, dan margin laba per produk',
        itemsSearchPh: 'Cari nama produk / brand...',
        itemsAllCat: 'Semua Kategori',
        itemsSortRev: 'Urut: Omzet Tertinggi',
        itemsSortQty: 'Urut: Qty Terjual',
        itemsSortProfit: 'Urut: Laba Tertinggi',
        itemsSortMargin: 'Urut: Margin %',
        itemsThItem: 'Produk / SKU',
        itemsThCat: 'Kategori',
        itemsThPrice: 'Harga Jual',
        itemsThQty: 'Qty Terjual',
        itemsThRev: 'Total Omzet',
        itemsThProfit: 'Laba Kotor',
        itemsThMargin: 'Margin %',
        itemsThStatus: 'Status',
        itemsFastMoving: 'Fast Moving',
        itemsModerate: 'Moderate',
        itemsNoSales: 'Belum Ada Penjualan',
        itemsPagination: (cur: number, tot: number) => `Halaman ${cur} dari ${tot}`,
        itemsPrev: 'Sebelumnya',
        itemsNext: 'Selanjutnya',
        // Tax Report
        taxTitle: 'Rekapitulasi Pajak Konsumsi Jepang (JCT)',
        taxSub: 'Kepatuhan Tarif Pajak Konsumsi 8% Sembako dan 10% Jasa Pengiriman',
        taxBadgeVerified: 'Sistem Faktur Pajak Resmi Terverifikasi',
        taxCardFood: 'Pajak Sembako / Makanan (8%)',
        taxCardFoodDesc: 'Tarif khusus bahan makanan pokok dan sembako halal impor.',
        taxCardShipping: 'Pajak Jasa & Ongkir (10%)',
        taxCardShippingDesc: 'Tarif standar jasa kurir Yamato & Sagawa Express.',
        taxCardTotal: 'Total Pajak Terutang (JCT)',
        taxCardTotalDesc: 'Total kewajiban setor pajak konsumsi ke Biro Pajak Jepang.'
      };
    }
  }, [language, totalTransactionCount]);

  // =========================================================================
  // 6. SIMULATE DEMO TRANSACTION & RESET HANDLER
  // =========================================================================
  const handleCreateSampleTransaction = () => {
    const sampleId = 'SN-JP-' + Math.floor(100000 + Math.random() * 900000);
    const sampleOrder = {
      id: sampleId,
      orderId: sampleId,
      trackingNumber: '4829-' + Math.floor(1000 + Math.random() * 9000) + '-1234',
      courier: 'Yamato Transport' as const,
      status: 'Diproses' as const,
      paymentMethod: 'PayPay',
      total: 6850,
      totalAmount: 6850,
      taxAmount: 507,
      date: new Date().toISOString().substring(0, 10),
      customerName: 'Budi Santoso',
      shippingAddress: '〒134-0088 Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4',
      address: '〒134-0088 Tokyo-to, Edogawa-ku, Nishi-Kasai 3-1-4',
      items: [
        {
          id: products[0]?.id || '1',
          productId: products[0]?.id || '1',
          productName: products[0]?.name || 'Indomie Goreng Spesial',
          name: products[0]?.name || 'Indomie Goreng Spesial',
          productImage: products[0]?.image || '',
          quantity: 5,
          qty: 5,
          price: products[0]?.priceTax || 135,
          subtotal: (products[0]?.priceTax || 135) * 5
        }
      ]
    };
    addOrder(sampleOrder);
    alert(language === 'JP' ? 'シミュレーション取引を1件作成しました。財務レポートに反映されました！' : language === 'EN' ? '1 Sample Transaction Created and Synced to Accounting!' : '1 Contoh Transaksi Berhasil Dibuat dan Langsung Tersinkron ke Accounting!');
  };

  const handleResetToZero = () => {
    const confirmMsg = language === 'JP' ? 'すべての取引データを0にリセットしますか？財務レポートはすべて¥0に戻ります。' : language === 'EN' ? 'Are you sure you want to RESET ALL TRANSACTIONS TO 0? All financial figures will revert to ¥0.' : 'Apakah Anda yakin ingin MERESET SEMUA DATA TRANSAKSI KE KONDISI 0 BERSIH? Semua angka laporan keuangan akan kembali ke ¥0.';
    if (confirm(confirmMsg)) {
      clearAllTransactions();
      setCashOutList([]);
      setCashInList([]);
      setCashTransferList([]);
      setAssetList([]);
      setBankAccountsList([]);
      localStorage.removeItem('sn_cash_out_v3');
      localStorage.removeItem('sn_cash_in_v3');
      localStorage.removeItem('sn_cash_transfer_v3');
      localStorage.removeItem('sn_assets_journal_v3');
      localStorage.removeItem('sn_bank_accounts_v3');
      alert(language === 'JP' ? 'すべての財務データが0（初期状態）にリセットされました。' : language === 'EN' ? 'All financial report data successfully reset to 0 CLEAR state!' : 'Semua data laporan keuangan berhasil direset ke KONDISI 0 BERSIH (CLEAR)!');
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  return (
    <AdminLayout
      title={txt.title}
      subtitle={txt.subtitle}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Navigation Tabs (Financial Reports & Cash Journal Modules) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-xs space-y-2">
          {/* Group 1: 5 Laporan Utama */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => {
                setActiveTab('pnl');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pnl'
                  ? 'bg-[#c41230] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">monitoring</span>
              <span>{txt.tabPnl}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('balance_sheet');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'balance_sheet'
                  ? 'bg-[#c41230] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">account_balance</span>
              <span>{txt.tabBalance}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('daily_revenue');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'daily_revenue'
                  ? 'bg-[#c41230] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">calendar_month</span>
              <span>{txt.tabDaily}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('sales_by_item');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'sales_by_item'
                  ? 'bg-[#c41230] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">inventory</span>
              <span>{txt.tabItems}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('tax_compliance');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'tax_compliance'
                  ? 'bg-[#c41230] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>{txt.tabTax}</span>
            </button>
          </div>

          {/* Group 2: 4 Sub-Menu Buku Kas & Jurnal */}
          <div className="flex flex-wrap gap-1 pt-1 border-t border-stone-100">
            <button
              onClick={() => {
                setActiveTab('cash_out');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'cash_out'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">arrow_outward</span>
              <span>{txt.tabCashOut}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-200/60 text-rose-900 ml-0.5">{cashOutList.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('cash_in');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'cash_in'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">call_received</span>
              <span>{txt.tabCashIn}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-200/60 text-emerald-900 ml-0.5">{cashInList.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('cash_transfer');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'cash_transfer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-800 bg-blue-50/70 hover:bg-blue-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">sync_alt</span>
              <span>{txt.tabCashTransfer}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-200/60 text-blue-900 ml-0.5">{cashTransferList.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('assets_journal');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'assets_journal'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-800 bg-purple-50/70 hover:bg-purple-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">account_balance</span>
              <span>{txt.tabAssetsJournal}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-200/60 text-purple-900 ml-0.5">{assetList.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('bank_accounts');
                setCurrentPage(1);
              }}
              className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'bank_accounts'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-teal-800 bg-teal-50/70 hover:bg-teal-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
              <span>{txt.tabBankAccounts}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-teal-200/60 text-teal-900 ml-0.5">{bankAccountsList.length}</span>
            </button>
          </div>
        </div>

        {/* Global Controls & Period Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">{txt.periodLabel}</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 outline-none focus:border-[#c41230]"
            >
              {txt.periodOptions.map((opt) => (
                <option key={opt.val} value={opt.val}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>{txt.btnPrint}</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: LABA RUGI (PROFIT & LOSS / P&L) */}
        {/* ================================================================= */}
        {activeTab === 'pnl' && (
          <div className="space-y-6">
            {/* Top 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
                  <span>{txt.kpiTotalRev}</span>
                  <span className="material-symbols-outlined text-stone-400">payments</span>
                </div>
                <div className="text-2xl font-black text-stone-900">¥{totalRevenue.toLocaleString()}</div>
                <div className="text-[11px] text-stone-500 mt-1">
                  {txt.kpiPosOnline(totalPosRevenue, totalOnlineRevenue)}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
                  <span>{txt.kpiGrossProfit}</span>
                  <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                </div>
                <div className="text-2xl font-black text-emerald-600">¥{grossProfit.toLocaleString()}</div>
                <div className="text-[11px] text-stone-500 mt-1">{txt.kpiGrossMargin(grossMarginPercent)}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
                  <span>{txt.kpiOpex}</span>
                  <span className="material-symbols-outlined text-amber-500">account_balance_wallet</span>
                </div>
                <div className="text-2xl font-black text-amber-700">¥{totalOperatingExpenses.toLocaleString()}</div>
                <div className="text-[11px] text-stone-500 mt-1">{txt.kpiOpexSub}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold mb-1">
                  <span>{txt.kpiNetProfit}</span>
                  <span className="material-symbols-outlined text-[#c41230]">savings</span>
                </div>
                <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-[#c41230]' : 'text-red-700'}`}>
                  ¥{netProfit.toLocaleString()}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">{txt.kpiNetMargin(netProfitMarginPercent)}</div>
              </div>
            </div>

            {/* Comprehensive P&L Statement Table */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900">{txt.pnlTitle}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{txt.pnlSub}</p>
                </div>
                <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg">
                  {txt.pnlCurrency}
                </span>
              </div>

              <div className="space-y-4 text-xs font-medium">
                {/* 1. Pendapatan */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-sm bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="uppercase text-stone-700">{txt.pnlRevHeader}</span>
                    <span className="font-mono text-stone-900">¥{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 pr-2 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>{txt.pnlRevPos}</span>
                      <span className="font-mono">¥{totalPosRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{txt.pnlRevOnline}</span>
                      <span className="font-mono">¥{totalOnlineRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 2. HPP */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-sm bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="uppercase text-stone-700">{txt.pnlCogsHeader}</span>
                    <span className="font-mono text-red-600">-¥{estimatedHPP.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 pr-2 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>{txt.pnlCogsItems}</span>
                      <span className="font-mono">-¥{Math.round(estimatedHPP * 0.9).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{txt.pnlCogsCustoms}</span>
                      <span className="font-mono">-¥{Math.round(estimatedHPP * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Subtotal Gross Profit */}
                <div className="flex justify-between items-center font-bold text-sm bg-emerald-50 text-emerald-950 p-3 rounded-xl border border-emerald-200">
                  <span>{txt.pnlGrossProfitHeader}</span>
                  <span className="font-mono text-base font-black text-emerald-700">¥{grossProfit.toLocaleString()}</span>
                </div>

                {/* 3. Beban Operasional */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-sm bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="uppercase text-stone-700">{txt.pnlOpexHeader}</span>
                    <span className="font-mono text-red-600">-¥{totalOperatingExpenses.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 pr-2 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>{txt.pnlOpexRent}</span>
                      <span className="font-mono">-¥{operatingExpenses.rentWarehouse.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{txt.pnlOpexElec}</span>
                      <span className="font-mono">-¥{operatingExpenses.electricityColdStorage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{txt.pnlOpexPayroll}</span>
                      <span className="font-mono">-¥{operatingExpenses.staffPayroll.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{txt.pnlOpexPack}</span>
                      <span className="font-mono">-¥{operatingExpenses.shippingSubsidyPackaging.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{txt.pnlOpexGateway}</span>
                      <span className="font-mono">-¥{operatingExpenses.paymentGatewayFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{txt.pnlOpexPromo}</span>
                      <span className="font-mono">-¥{operatingExpenses.marketingPromo.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Pajak Konsumsi */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-sm bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    <span className="uppercase text-stone-700">{txt.pnlTaxHeader}</span>
                    <span className="font-mono text-red-600">-¥{totalTaxJCT.toLocaleString()}</span>
                  </div>
                  <div className="pl-4 pr-2 space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>{txt.pnlTax8}</span>
                      <span className="font-mono">¥{taxFood8.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{txt.pnlTax10}</span>
                      <span className="font-mono">¥{taxShipping10.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Grand Total Net Profit */}
                <div className="flex justify-between items-center font-bold text-base bg-stone-900 text-white p-4 rounded-xl shadow-sm">
                  <div>
                    <div className="text-sm font-black">{txt.pnlNetProfitHeader}</div>
                    <div className="text-[11px] text-stone-400 font-normal">{txt.pnlNetProfitSub}</div>
                  </div>
                  <div className="text-xl font-black text-amber-300 font-mono">
                    ¥{netProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: NERACA KEUANGAN (BALANCE SHEET) */}
        {/* ================================================================= */}
        {activeTab === 'balance_sheet' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900">{txt.bsTitle}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{txt.bsSub}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full">
                    {totalAssets === totalLiabilitiesAndEquity ? txt.bsBalanced : txt.bsAdjust}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SISI KIRI: AKTIVA / ASET */}
                <div className="space-y-5">
                  <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl font-bold text-sm text-blue-950 flex justify-between">
                    <span>{txt.bsTotalAssets}</span>
                    <span className="font-mono">¥{totalAssets.toLocaleString()}</span>
                  </div>

                  {/* Aktiva Lancar */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>{txt.bsCurrentAssets}</span>
                      <span className="font-mono text-stone-900">¥{totalCurrentAssets.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>{txt.bsCashPos}</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.cashStorePOS.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.bsBankJapanPost}</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.bankJapanPost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.bsBankMufg}</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.bankMUFG.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.bsPayPay}</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.payPaySettlement.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.bsReceivable}</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.accountsReceivable.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>{txt.bsInventory}</span>
                        <span className="font-mono">¥{balanceSheet.assets.currentAssets.inventoryStock.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aktiva Tetap */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>{txt.bsFixedAssets}</span>
                      <span className="font-mono text-stone-900">¥{totalFixedAssets.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>{txt.bsFreezers}</span>
                        <span className="font-mono">¥{balanceSheet.assets.fixedAssets.coldStorageFreezers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.bsPosHardware}</span>
                        <span className="font-mono">¥{balanceSheet.assets.fixedAssets.posHardwareEquipment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.bsShelving}</span>
                        <span className="font-mono">¥{balanceSheet.assets.fixedAssets.warehouseShelving.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>{txt.bsDepreciation}</span>
                        <span className="font-mono">¥{balanceSheet.assets.fixedAssets.accumulatedDepreciation.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SISI KANAN: KEWAJIBAN & EKUITAS */}
                <div className="space-y-5">
                  <div className="bg-purple-50/70 border border-purple-200 p-3 rounded-xl font-bold text-sm text-purple-950 flex justify-between">
                    <span>{txt.bsTotalLiabEquity}</span>
                    <span className="font-mono">¥{totalLiabilitiesAndEquity.toLocaleString()}</span>
                  </div>

                  {/* Kewajiban Lancar */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>{txt.bsCurrentLiab}</span>
                      <span className="font-mono text-stone-900">¥{totalCurrentLiabilities.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>{txt.bsAccountsPayable}</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.currentLiabilities.accountsPayableSupplier.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-red-700">
                        <span>{txt.bsAccruedTax}</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.currentLiabilities.accruedTaxesJCT.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.bsAccruedExpenses}</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.currentLiabilities.accruedExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{txt.bsCustomerDeposits}</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.currentLiabilities.customerDeposits.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kewajiban Jangka Panjang */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>{txt.bsLongTermLiab}</span>
                      <span className="font-mono text-stone-900">¥{totalLongTermLiabilities.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>{txt.bsBusinessLoan}</span>
                        <span className="font-mono">¥{balanceSheet.liabilities.longTermLiabilities.businessLoan.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ekuitas / Modal */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-stone-800 border-b border-stone-100 pb-1 flex justify-between">
                      <span>{txt.bsEquity}</span>
                      <span className="font-mono text-stone-900">¥{totalEquity.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1.5 pl-2 text-stone-600">
                      <div className="flex justify-between">
                        <span>{txt.bsCapital}</span>
                        <span className="font-mono">¥{balanceSheet.equity.capitalPaidIn.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span>{txt.bsRetainedEarnings}</span>
                        <span className="font-mono">¥{calculatedRetainedEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: OMZET HARIAN (DAILY REVENUE REPORT) */}
        {/* ================================================================= */}
        {activeTab === 'daily_revenue' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900">{txt.dailyTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{txt.dailySub}</p>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {txt.dailyTotalDays(dailyRevenueData.length)}
              </span>
            </div>

            {dailyRevenueData.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-2xl">calendar_today</span>
                </div>
                <h4 className="font-bold text-stone-700 text-sm">{txt.dailyEmptyTitle}</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  {txt.dailyEmptyDesc}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                      <th className="py-3 px-3">{txt.dailyThDate}</th>
                      <th className="py-3 px-3 text-center">{txt.dailyThPosTx}</th>
                      <th className="py-3 px-3 text-center">{txt.dailyThOnlineTx}</th>
                      <th className="py-3 px-3 text-right">{txt.dailyThPosRev}</th>
                      <th className="py-3 px-3 text-right">{txt.dailyThOnlineRev}</th>
                      <th className="py-3 px-3 text-right">{txt.dailyThTotalRev}</th>
                      <th className="py-3 px-3 text-right">{txt.dailyThGross}</th>
                      <th className="py-3 px-3">{txt.dailyThPayment}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {dailyRevenueData.map((d, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-stone-900">{d.date}</td>
                        <td className="py-3 px-3 text-center font-mono">{d.posTx}</td>
                        <td className="py-3 px-3 text-center font-mono">{d.onlineTx}</td>
                        <td className="py-3 px-3 text-right font-mono">¥{d.posRev.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono">¥{d.onlineRev.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">¥{d.totalRev.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">¥{d.gross.toLocaleString()}</td>
                        <td className="py-3 px-3 text-[11px] text-stone-600">{d.paymentTop}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PENJUALAN PER ITEM (SALES BY SKU) */}
        {/* ================================================================= */}
        {activeTab === 'sales_by_item' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900">{txt.itemsTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{txt.itemsSub}</p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={txt.itemsSearchPh}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:border-[#c41230]"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold outline-none focus:border-[#c41230]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === 'ALL' ? txt.itemsAllCat : c}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold outline-none focus:border-[#c41230]"
                >
                  <option value="revenue">{txt.itemsSortRev}</option>
                  <option value="qty">{txt.itemsSortQty}</option>
                  <option value="profit">{txt.itemsSortProfit}</option>
                  <option value="margin">{txt.itemsSortMargin}</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">{txt.itemsThItem}</th>
                    <th className="py-3 px-3">{txt.itemsThCat}</th>
                    <th className="py-3 px-3 text-right">{txt.itemsThPrice}</th>
                    <th className="py-3 px-3 text-center">{txt.itemsThQty}</th>
                    <th className="py-3 px-3 text-right">{txt.itemsThRev}</th>
                    <th className="py-3 px-3 text-right">{txt.itemsThProfit}</th>
                    <th className="py-3 px-3 text-center">{txt.itemsThMargin}</th>
                    <th className="py-3 px-3 text-center">{txt.itemsThStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedItems.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-900">
                          {language === 'JP' && p.nameJp ? p.nameJp : p.name}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">SKU: SN-{p.id} | {p.brand}</div>
                      </td>
                      <td className="py-3 px-3 text-stone-600">{p.category}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">¥{p.price.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{p.totalQty}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">¥{p.totalItemRevenue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">¥{p.totalItemProfit.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold">{p.marginPct}%</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.velocityStatus === 'Fast Moving'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.velocityStatus === 'Moderate'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          {p.velocityStatus === 'Fast Moving'
                            ? txt.itemsFastMoving
                            : p.velocityStatus === 'Moderate'
                            ? txt.itemsModerate
                            : txt.itemsNoSales}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalItemPages > 1 && (
              <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-xs font-bold text-stone-600">
                <span>{txt.itemsPagination(currentPage, totalItemPages)}</span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 disabled:opacity-30 hover:bg-stone-100 cursor-pointer"
                  >
                    {txt.itemsPrev}
                  </button>
                  <button
                    disabled={currentPage >= totalItemPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalItemPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 disabled:opacity-30 hover:bg-stone-100 cursor-pointer"
                  >
                    {txt.itemsNext}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: PAJAK KONSUMSI JEPANG (JAPAN CONSUMPTION TAX / JCT) */}
        {/* ================================================================= */}
        {activeTab === 'tax_compliance' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-base font-black text-stone-900">{txt.taxTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{txt.taxSub}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full">
                {txt.taxBadgeVerified}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-500 block uppercase">{txt.taxCardFood}</span>
                <div className="text-2xl font-black text-stone-900 font-mono">¥{taxFood8.toLocaleString()}</div>
                <p className="text-[11px] text-stone-500">{txt.taxCardFoodDesc}</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-500 block uppercase">{txt.taxCardShipping}</span>
                <div className="text-2xl font-black text-stone-900 font-mono">¥{taxShipping10.toLocaleString()}</div>
                <p className="text-[11px] text-stone-500">{txt.taxCardShippingDesc}</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 block uppercase">{txt.taxCardTotal}</span>
                <div className="text-2xl font-black text-emerald-800 font-mono">¥{totalTaxJCT.toLocaleString()}</div>
                <p className="text-[11px] text-emerald-700">{txt.taxCardTotalDesc}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: KAS KELUAR (CASH OUTFLOW) */}
        {/* ================================================================= */}
        {activeTab === 'cash_out' && (
          <div className="space-y-6">
            {/* Top Header & Metrics */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                    {txt.cashOutTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{txt.cashOutSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCashOutModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>{txt.btnAddCashOut}</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 uppercase block">{txt.kpiTotalCashOut}</span>
                  <div className="text-2xl font-black text-rose-700 font-mono">
                    ¥{cashOutList.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-rose-600">{cashOutList.length} Transaksi Terverifikasi</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase block">{txt.kpiCashOutCount}</span>
                  <div className="text-2xl font-black text-stone-900 font-mono">{cashOutList.length} Voucher</div>
                  <span className="text-[11px] text-stone-500">Bulan September 2026</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase block">{txt.kpiTopExpense}</span>
                  <div className="text-base font-black text-stone-900 truncate">Sewa Gudang & Toko</div>
                  <span className="text-[11px] text-stone-500 font-mono">¥180,000 / bln</span>
                </div>
              </div>

              {/* Table of Cash Out */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                      <th className="py-3 px-3">{txt.thCashOutDate}</th>
                      <th className="py-3 px-3">{txt.thCashOutRef}</th>
                      <th className="py-3 px-3">{txt.thCashOutCat}</th>
                      <th className="py-3 px-3">{txt.thCashOutSource}</th>
                      <th className="py-3 px-3 text-right">{txt.thCashOutAmount}</th>
                      <th className="py-3 px-3">{txt.thCashOutRecipient}</th>
                      <th className="py-3 px-3">{txt.thCashOutNotes}</th>
                      <th className="py-3 px-3 text-center">{txt.thCashOutStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cashOutList.map((item) => (
                      <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-stone-600">{item.date}</td>
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">{item.refNumber}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {language === 'JP' ? item.categoryJp : language === 'EN' ? item.categoryEn : item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-600">{item.sourceAccount}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-rose-600">-¥{item.amount.toLocaleString()}</td>
                        <td className="py-3 px-3 font-medium text-stone-800">{item.recipient}</td>
                        <td className="py-3 px-3 text-stone-500 max-w-xs truncate">{item.notes}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: KAS MASUK (CASH INFLOW) */}
        {/* ================================================================= */}
        {activeTab === 'cash_in' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    {txt.cashInTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{txt.cashInSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCashInModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>{txt.btnAddCashIn}</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">{txt.kpiTotalCashIn}</span>
                  <div className="text-2xl font-black text-emerald-700 font-mono">
                    ¥{cashInList.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600">{cashInList.length} Transaksi Terverifikasi</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase block">{txt.kpiCashInCount}</span>
                  <div className="text-2xl font-black text-stone-900 font-mono">{cashInList.length} Voucher</div>
                  <span className="text-[11px] text-stone-500">Non-Sales Operational Inflows</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase block">{txt.kpiTopIncome}</span>
                  <div className="text-base font-black text-stone-900 truncate">Setoran Tambahan Modal</div>
                  <span className="text-[11px] text-stone-500 font-mono">¥500,000</span>
                </div>
              </div>

              {/* Table of Cash In */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                      <th className="py-3 px-3">{txt.thCashInDate}</th>
                      <th className="py-3 px-3">{txt.thCashInRef}</th>
                      <th className="py-3 px-3">{txt.thCashInCat}</th>
                      <th className="py-3 px-3">{txt.thCashInTarget}</th>
                      <th className="py-3 px-3 text-right">{txt.thCashInAmount}</th>
                      <th className="py-3 px-3">{txt.thCashInSource}</th>
                      <th className="py-3 px-3">{txt.thCashInNotes}</th>
                      <th className="py-3 px-3 text-center">{txt.thCashInStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cashInList.map((item) => (
                      <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-stone-600">{item.date}</td>
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">{item.refNumber}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {language === 'JP' ? item.categoryJp : language === 'EN' ? item.categoryEn : item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-stone-600">{item.targetAccount}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">+¥{item.amount.toLocaleString()}</td>
                        <td className="py-3 px-3 font-medium text-stone-800">{item.source}</td>
                        <td className="py-3 px-3 text-stone-500 max-w-xs truncate">{item.notes}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8: KAS TRANSFER (CASH & BANK TRANSFER) */}
        {/* ================================================================= */}
        {activeTab === 'cash_transfer' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    {txt.cashTransferTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{txt.cashTransferSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCashTransferModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <span className="material-symbols-outlined text-base">swap_horiz</span>
                  <span>{txt.btnAddTransfer}</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">{txt.kpiTotalTransfer}</span>
                  <div className="text-2xl font-black text-blue-700 font-mono">
                    ¥{cashTransferList.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-blue-600">Total Mutasi Antar Rekening</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase block">{txt.kpiTransferCount}</span>
                  <div className="text-2xl font-black text-stone-900 font-mono">{cashTransferList.length} Kali</div>
                  <span className="text-[11px] text-stone-500">Biaya Admin: ¥110 Total</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase block">{txt.kpiPosDeposit}</span>
                  <div className="text-base font-black text-stone-900 truncate">Kasir POS ➔ Bank Japan Post</div>
                  <span className="text-[11px] text-stone-500 font-mono">¥150,000 (Weekend Closes)</span>
                </div>
              </div>

              {/* Table of Transfers */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                      <th className="py-3 px-3">{txt.thTransferDate}</th>
                      <th className="py-3 px-3">{txt.thTransferRef}</th>
                      <th className="py-3 px-3">{txt.thTransferFrom}</th>
                      <th className="py-3 px-3 text-center">➔</th>
                      <th className="py-3 px-3">{txt.thTransferTo}</th>
                      <th className="py-3 px-3 text-right">{txt.thTransferAmount}</th>
                      <th className="py-3 px-3 text-right">{txt.thTransferFee}</th>
                      <th className="py-3 px-3">{txt.thTransferNotes}</th>
                      <th className="py-3 px-3 text-center">{txt.thTransferStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cashTransferList.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-stone-600">{item.date}</td>
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">{item.refNumber}</td>
                        <td className="py-3 px-3 font-medium text-stone-800">{item.fromAccount}</td>
                        <td className="py-3 px-3 text-center text-blue-600 font-bold">➔</td>
                        <td className="py-3 px-3 font-medium text-stone-800">{item.toAccount}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-blue-600">¥{item.amount.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-stone-500">¥{item.fee}</td>
                        <td className="py-3 px-3 text-stone-500 max-w-xs truncate">{item.notes}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 9: JURNAL ASET & DEPRESIASI (ASSET JOURNAL) */}
        {/* ================================================================= */}
        {activeTab === 'assets_journal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    {txt.assetTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{txt.assetSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>{txt.btnAddAsset}</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                  <span className="text-[11px] font-bold text-purple-800 uppercase block">{txt.kpiTotalAssetCost}</span>
                  <div className="text-2xl font-black text-purple-700 font-mono">
                    ¥{assetList.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-purple-600">{assetList.length} Item Peralatan & Fasilitas</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase block">{txt.kpiAccumDepreciation}</span>
                  <div className="text-2xl font-black text-red-600 font-mono">
                    -¥{assetList.reduce((sum, item) => sum + item.accumulatedDepreciation, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-stone-500">Metode Garis Lurus (Straight-line)</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">{txt.kpiNetBookValue}</span>
                  <div className="text-2xl font-black text-emerald-700 font-mono">
                    ¥{assetList.reduce((sum, item) => sum + item.bookValue, 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-600">Nilai Tercatat di Neraca</span>
                </div>
              </div>

              {/* Table of Assets */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                      <th className="py-3 px-3">{txt.thAssetCode}</th>
                      <th className="py-3 px-3">{txt.thAssetName}</th>
                      <th className="py-3 px-3">{txt.thAssetCategory}</th>
                      <th className="py-3 px-3">{txt.thAssetDate}</th>
                      <th className="py-3 px-3 text-right">{txt.thAssetCost}</th>
                      <th className="py-3 px-3 text-center">{txt.thAssetYears}</th>
                      <th className="py-3 px-3 text-right">{txt.thAssetMonthlyDep}</th>
                      <th className="py-3 px-3 text-right">{txt.thAssetAccumDep}</th>
                      <th className="py-3 px-3 text-right">{txt.thAssetBookVal}</th>
                      <th className="py-3 px-3">{txt.thAssetLoc}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {assetList.map((item) => (
                      <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">{item.code}</td>
                        <td className="py-3 px-3 font-bold text-stone-800">
                          {language === 'JP' ? item.nameJp : language === 'EN' ? item.nameEn : item.name}
                        </td>
                        <td className="py-3 px-3 text-stone-600">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-stone-600">{item.acquisitionDate}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold">¥{item.cost.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-mono">{item.usefulYears} Thn</td>
                        <td className="py-3 px-3 text-right font-mono text-stone-600">¥{item.monthlyDepreciation.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-red-600">-¥{item.accumulatedDepreciation.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">¥{item.bookValue.toLocaleString()}</td>
                        <td className="py-3 px-3 text-stone-500">{item.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 10: AKUN KAS & REKENING BANK (BANK & CASH ACCOUNTS) */}
        {/* ================================================================= */}
        {activeTab === 'bank_accounts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                    {txt.bankAccTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{txt.bankAccSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBankAccountModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <span className="material-symbols-outlined text-base">add_card</span>
                  <span>{txt.btnAddAccount}</span>
                </button>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1">
                  <span className="text-[11px] font-bold text-teal-800 uppercase block">{txt.kpiTotalBankBalance}</span>
                  <div className="text-2xl font-black text-teal-700 font-mono">
                    ¥{bankAccountsList.reduce((sum, item) => sum + (item.balance || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-teal-600">Total Likuiditas Seluruh Rekening</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[11px] font-bold text-stone-600 uppercase block">{txt.kpiActiveAccounts}</span>
                  <div className="text-2xl font-black text-stone-800 font-mono">
                    {bankAccountsList.filter((a) => a.isActive).length} <span className="text-sm font-normal text-stone-500">/ {bankAccountsList.length}</span>
                  </div>
                  <span className="text-[11px] text-stone-500">Rekening Status Aktif</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[11px] font-bold text-blue-800 uppercase block">{txt.kpiJapanBankCount}</span>
                  <div className="text-2xl font-black text-blue-700 font-mono">
                    {bankAccountsList.filter((a) => a.accountType === 'BANK_JP').length}
                  </div>
                  <span className="text-[11px] text-blue-600">Yucho, MUFG, SMBC, Mizuho</span>
                </div>

                <div className="p-4.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">{txt.kpiIndonesiaBankCount}</span>
                  <div className="text-2xl font-black text-emerald-700 font-mono">
                    {bankAccountsList.filter((a) => a.accountType !== 'BANK_JP').length}
                  </div>
                  <span className="text-[11px] text-emerald-600">Bank IDN, Kas POS, & Gateway</span>
                </div>
              </div>

              {/* Zero State or Accounts Table */}
              {bankAccountsList.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-stone-800">
                      {language === 'JP' ? '登録された銀行口座・金庫アカウントがありません' : language === 'EN' ? 'No Bank or Cash Accounts Registered' : 'Belum Ada Rekening Bank / Akun Kas Terdaftar'}
                    </h4>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      {language === 'JP'
                        ? '「+ 新規口座・アカウントを追加」をクリックして、ゆうちょ銀行、三菱UFJ、店舗レジ金庫口座を登録してください。'
                        : language === 'EN'
                        ? 'Click "+ Add New Bank / Cash Account" to register Japan Post Bank, MUFG, or POS cash drawers.'
                        : 'Klik "+ Tambah Rekening / Akun Baru" untuk mendaftarkan rekening bank Jepang (Yucho, MUFG), bank Indonesia, atau laci kasir POS.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBankAccountModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>{txt.btnAddAccount}</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 text-stone-700 font-bold uppercase text-[11px]">
                        <th className="py-3 px-3">{txt.thAccountName}</th>
                        <th className="py-3 px-3">{txt.thAccountType}</th>
                        <th className="py-3 px-3">{txt.thBankName}</th>
                        <th className="py-3 px-3">{txt.thBranch}</th>
                        <th className="py-3 px-3">{txt.thAccountNumber}</th>
                        <th className="py-3 px-3">{txt.thHolder}</th>
                        <th className="py-3 px-3 text-right">{txt.thBalance}</th>
                        <th className="py-3 px-3 text-center">{txt.thStatus}</th>
                        <th className="py-3 px-3 text-center">{txt.thAction}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {bankAccountsList.map((acc) => (
                        <tr key={acc.id} className="hover:bg-teal-50/30 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-stone-900">{acc.accountName}</div>
                            <div className="text-[10px] text-stone-400 font-mono">{acc.id} • {acc.notes}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                acc.accountType === 'BANK_JP'
                                  ? 'bg-blue-100 text-blue-800'
                                  : acc.accountType === 'BANK_ID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : acc.accountType === 'CASH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {acc.accountType === 'BANK_JP'
                                ? 'Bank Jepang'
                                : acc.accountType === 'BANK_ID'
                                ? 'Bank Indonesia'
                                : acc.accountType === 'CASH'
                                ? 'Kas Tunai'
                                : 'E-Wallet / Gateway'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-stone-800">{acc.bankName}</td>
                          <td className="py-3 px-3 text-stone-600">{acc.branchName}</td>
                          <td className="py-3 px-3 font-mono text-stone-700 font-semibold">{acc.accountNumber}</td>
                          <td className="py-3 px-3 text-stone-600">{acc.holderName}</td>
                          <td className="py-3 px-3 text-right font-mono font-black text-teal-700 text-sm">
                            ¥{(acc.balance || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAccountStatus(acc.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                acc.isActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                              }`}
                            >
                              {acc.isActive ? '● Aktif' : '○ Non-Aktif'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc.id)}
                              className="p-1 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus Rekening"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL 1: CATAT KAS KELUAR (CASH OUTFLOW) */}
        {/* ================================================================= */}
        {isCashOutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 font-black text-base text-rose-700">
                  <span className="material-symbols-outlined text-xl">arrow_outward</span>
                  <span>{language === 'JP' ? '新規出金の記録 (経費支出)' : language === 'EN' ? 'Record Cash Outflow' : 'Catat Pengeluaran Kas Keluar'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCashOutModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleAddCashOut} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '支出カテゴリー:' : language === 'EN' ? 'Expense Category:' : 'Kategori Pengeluaran:'}
                  </label>
                  <select
                    value={newCashOut.category}
                    onChange={(e) => setNewCashOut({ ...newCashOut, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-rose-600"
                  >
                    <option value="Sewa Gudang & Toko">Sewa Gudang & Toko (Rent)</option>
                    <option value="Listrik & Cold Storage">Listrik & Cold Storage (Utilities)</option>
                    <option value="Gaji Karyawan">Gaji Karyawan & Staff (Payroll)</option>
                    <option value="Logistik & Packing">Logistik & Packing (Shipping)</option>
                    <option value="Perlengkapan Toko">Perlengkapan Toko (Supplies)</option>
                    <option value="Iklan & Marketing">Iklan & Marketing Diaspora (Promo)</option>
                    <option value="Lain-lain">Lain-lain (Miscellaneous)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '出金元口座 / 金庫:' : language === 'EN' ? 'Source Account:' : 'Akun Sumber Dana:'}
                  </label>
                  <select
                    value={newCashOut.sourceAccount}
                    onChange={(e) => setNewCashOut({ ...newCashOut, sourceAccount: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-rose-600"
                  >
                    <option value="Kas POS Kasir Tokyo">Kas POS Kasir Tokyo (Laci Tunai)</option>
                    <option value="Bank Japan Post (Yucho)">Bank Japan Post (Yucho Bank)</option>
                    <option value="Bank MUFG Tokyo">Bank MUFG Tokyo (Rekening Utama)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '出金額 (¥ JPY):' : language === 'EN' ? 'Amount (¥ JPY):' : 'Nominal Pengeluaran (¥):'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCashOut.amount}
                    onChange={(e) => setNewCashOut({ ...newCashOut, amount: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-rose-600 font-mono font-black text-sm outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '支払先 / 担当者:' : language === 'EN' ? 'Recipient / Vendor:' : 'Penerima / Vendor:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tokyo Realty Corp / TEPCO"
                    value={newCashOut.recipient}
                    onChange={(e) => setNewCashOut({ ...newCashOut, recipient: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '備考 / 伝票メモ:' : language === 'EN' ? 'Notes / Description:' : 'Keterangan & Catatan:'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Keperluan pembayaran..."
                    value={newCashOut.notes}
                    onChange={(e) => setNewCashOut({ ...newCashOut, notes: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-rose-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCashOutModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Simpan Kas Keluar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL 2: CATAT KAS MASUK (CASH INFLOW) */}
        {/* ================================================================= */}
        {isCashInModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 font-black text-base text-emerald-700">
                  <span className="material-symbols-outlined text-xl">call_received</span>
                  <span>{language === 'JP' ? '新規入金の記録 (その他収入)' : language === 'EN' ? 'Record Cash Inflow' : 'Catat Penerimaan Kas Masuk'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCashInModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleAddCashIn} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '入金カテゴリー:' : language === 'EN' ? 'Income Category:' : 'Kategori Penerimaan:'}
                  </label>
                  <select
                    value={newCashIn.category}
                    onChange={(e) => setNewCashIn({ ...newCashIn, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-emerald-600"
                  >
                    <option value="Setoran Modal Pemilik">Setoran Modal Pemilik (Owner Capital)</option>
                    <option value="Pendapatan Titip Beli / Jasa">Pendapatan Jasa Titip / Komisi (Commission)</option>
                    <option value="Refund Cargo Impor">Refund Cargo Impor (Freight Refund)</option>
                    <option value="Bunga Bank Tabungan">Bunga Bank Tabungan (Interest)</option>
                    <option value="Lain-lain">Lain-lain (Other Income)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '入金先口座 / 金庫:' : language === 'EN' ? 'Target Account:' : 'Akun Tujuan Penerimaan:'}
                  </label>
                  <select
                    value={newCashIn.targetAccount}
                    onChange={(e) => setNewCashIn({ ...newCashIn, targetAccount: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-emerald-600"
                  >
                    <option value="Bank MUFG Tokyo">Bank MUFG Tokyo (Rekening Utama)</option>
                    <option value="Bank Japan Post (Yucho)">Bank Japan Post (Yucho Bank)</option>
                    <option value="Kas POS Kasir Tokyo">Kas POS Kasir Tokyo (Laci Tunai)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '入金額 (¥ JPY):' : language === 'EN' ? 'Amount (¥ JPY):' : 'Nominal Masuk (¥):'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCashIn.amount}
                    onChange={(e) => setNewCashIn({ ...newCashIn, amount: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-emerald-600 font-mono font-black text-sm outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '入金元 / 支払人:' : language === 'EN' ? 'Source / Payer:' : 'Sumber Dana / Penyetor:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Owner Willy / Komunitas WNI"
                    value={newCashIn.source}
                    onChange={(e) => setNewCashIn({ ...newCashIn, source: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '備考 / 伝票メモ:' : language === 'EN' ? 'Notes / Description:' : 'Keterangan:'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Keterangan setoran/dana masuk..."
                    value={newCashIn.notes}
                    onChange={(e) => setNewCashIn({ ...newCashIn, notes: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCashInModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Simpan Kas Masuk
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL 3: TRANSFER KAS & REKENING (CASH TRANSFER) */}
        {/* ================================================================= */}
        {isCashTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 font-black text-base text-blue-700">
                  <span className="material-symbols-outlined text-xl">sync_alt</span>
                  <span>{language === 'JP' ? '資金移動・口座間振替' : language === 'EN' ? 'Execute Cash Transfer' : 'Transfer Kas / Antar Bank'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCashTransferModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleAddTransfer} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '振替元 (From):' : language === 'EN' ? 'From Account:' : 'Dari Akun (Sumber):'}
                  </label>
                  <select
                    value={newTransfer.fromAccount}
                    onChange={(e) => setNewTransfer({ ...newTransfer, fromAccount: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-blue-600"
                  >
                    <option value="Kas POS Kasir Tokyo">Kas POS Kasir Tokyo (Laci Tunai)</option>
                    <option value="Bank MUFG Tokyo">Bank MUFG Tokyo (Rekening Utama)</option>
                    <option value="Bank Japan Post (Yucho)">Bank Japan Post (Yucho Bank)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '振替先 (To):' : language === 'EN' ? 'To Account:' : 'Ke Akun (Tujuan):'}
                  </label>
                  <select
                    value={newTransfer.toAccount}
                    onChange={(e) => setNewTransfer({ ...newTransfer, toAccount: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-blue-600"
                  >
                    <option value="Bank Japan Post (Yucho)">Bank Japan Post (Yucho Bank)</option>
                    <option value="Bank MUFG Tokyo">Bank MUFG Tokyo (Rekening Utama)</option>
                    <option value="Kas POS Kasir Tokyo">Kas POS Kasir Tokyo (Laci Tunai)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '振替金額 (¥):' : language === 'EN' ? 'Amount (¥):' : 'Nominal (¥):'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newTransfer.amount}
                      onChange={(e) => setNewTransfer({ ...newTransfer, amount: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-blue-600 font-mono font-black text-sm outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '振込手数料 (¥):' : language === 'EN' ? 'Transfer Fee (¥):' : 'Biaya Admin (¥):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newTransfer.fee}
                      onChange={(e) => setNewTransfer({ ...newTransfer, fee: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-mono font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '備考 / 目的:' : language === 'EN' ? 'Notes / Purpose:' : 'Keterangan Mutasi:'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Setoran uang kasir POS harian ke bank..."
                    value={newTransfer.notes}
                    onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCashTransferModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Proses Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL 4: TAMBAH ASET TETAP (ASSET REGISTER) */}
        {/* ================================================================= */}
        {isAssetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 font-black text-base text-purple-700">
                  <span className="material-symbols-outlined text-xl">account_balance</span>
                  <span>{language === 'JP' ? '新規固定資産の登録' : language === 'EN' ? 'Register Fixed Asset' : 'Tambah Aset Tetap Baru'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '資産名称:' : language === 'EN' ? 'Asset Name:' : 'Nama Aset & Spesifikasi:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chiller Showcase Sanden 4 Pcs"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '資産コード:' : language === 'EN' ? 'Asset Code:' : 'Kode Aset:'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AST-CHL-05"
                      value={newAsset.code}
                      onChange={(e) => setNewAsset({ ...newAsset, code: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-mono outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '区分:' : language === 'EN' ? 'Category:' : 'Kategori:'}
                    </label>
                    <select
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-purple-600"
                    >
                      <option value="Peralatan Pendingin">Peralatan Pendingin (Cooling)</option>
                      <option value="Peralatan POS & IT">Peralatan POS & IT (Hardware)</option>
                      <option value="Infrastruktur Gudang">Infrastruktur Gudang (Racking)</option>
                      <option value="Kendaraan Operasional">Kendaraan Operasional (Vehicle)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '取得原価 (¥):' : language === 'EN' ? 'Cost (¥):' : 'Harga Perolehan (¥):'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={newAsset.cost}
                      onChange={(e) => setNewAsset({ ...newAsset, cost: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-purple-600 font-mono font-black text-sm outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '耐用年数 (年):' : language === 'EN' ? 'Useful Life (Yrs):' : 'Masa Manfaat (Tahun):'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={30}
                      value={newAsset.usefulYears}
                      onChange={(e) => setNewAsset({ ...newAsset, usefulYears: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-mono font-bold outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '設置場所:' : language === 'EN' ? 'Location:' : 'Lokasi Penempatan:'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gudang Tokyo Edogawa / Toko Kasir"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-purple-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAssetModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Simpan Aset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL 5: TAMBAH AKUN / REKENING BANK (BANK & CASH ACCOUNT) */}
        {/* ================================================================= */}
        {isBankAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-stone-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2 font-black text-base text-teal-700">
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                  <span>{language === 'JP' ? '新規口座・アカウントの登録' : language === 'EN' ? 'Add New Bank / Cash Account' : 'Tambah Akun / Rekening Bank Baru'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBankAccountModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleAddBankAccount} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '口座名称 / アカウント名:' : language === 'EN' ? 'Account Label / Name:' : 'Nama Akun / Buku Kas:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rekening Operasional Tokyo / Kasir POS"
                    value={newBankAccount.accountName}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, accountName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '種別:' : language === 'EN' ? 'Account Type:' : 'Tipe Akun:'}
                    </label>
                    <select
                      value={newBankAccount.accountType}
                      onChange={(e) => {
                        const type = e.target.value;
                        let defaultBank = 'Japan Post Bank (ゆうちょ銀行)';
                        if (type === 'BANK_ID') defaultBank = 'Bank Central Asia (BCA)';
                        if (type === 'CASH') defaultBank = 'Kas Tunai Toko (POS Drawer)';
                        if (type === 'E_WALLET') defaultBank = 'PayPay Merchant';
                        setNewBankAccount({
                          ...newBankAccount,
                          accountType: type,
                          bankName: defaultBank
                        });
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-teal-600"
                    >
                      <option value="BANK_JP">Bank Jepang (Japan Bank)</option>
                      <option value="BANK_ID">Bank Indonesia (IDN Bank)</option>
                      <option value="CASH">Kas Fisik / Laci POS (Cash)</option>
                      <option value="E_WALLET">E-Wallet / Gateway (PayPay)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '金融機関 / サービス名:' : language === 'EN' ? 'Bank / Institution:' : 'Nama Bank / Institusi:'}
                    </label>
                    {newBankAccount.accountType === 'BANK_JP' ? (
                      <select
                        value={newBankAccount.bankName}
                        onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-teal-600"
                      >
                        <option value="Japan Post Bank (ゆうちょ銀行)">Japan Post Bank (ゆうちょ銀行)</option>
                        <option value="MUFG Bank (三菱UFJ銀行)">MUFG Bank (三菱UFJ銀行)</option>
                        <option value="SMBC (三井住友銀行)">SMBC (三井住友銀行)</option>
                        <option value="Mizuho Bank (みずほ銀行)">Mizuho Bank (みずほ銀行)</option>
                        <option value="Rakuten Bank (楽天銀行)">Rakuten Bank (楽天銀行)</option>
                        <option value="PayPay Bank (PayPay銀行)">PayPay Bank (PayPay銀行)</option>
                      </select>
                    ) : newBankAccount.accountType === 'BANK_ID' ? (
                      <select
                        value={newBankAccount.bankName}
                        onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-teal-600"
                      >
                        <option value="Bank Central Asia (BCA)">Bank BCA (BCA)</option>
                        <option value="Bank Mandiri">Bank Mandiri</option>
                        <option value="Bank Rakyat Indonesia (BRI)">Bank BRI (BRI)</option>
                        <option value="Bank Negara Indonesia (BNI)">Bank BNI (BNI)</option>
                        <option value="Bank Syariah Indonesia (BSI)">Bank BSI</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={newBankAccount.bankName}
                        onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-bold outline-none focus:border-teal-600"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '支店名:' : language === 'EN' ? 'Branch Name:' : 'Nama Cabang:'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tokyo Honten / 本店"
                      value={newBankAccount.branchName}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, branchName: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '口座番号 (記号・番号):' : language === 'EN' ? 'Account Number:' : 'Nomor Rekening:'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10120-12345671"
                      value={newBankAccount.accountNumber}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 font-mono font-bold outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '名義人 (カタカナ・アルファベット):' : language === 'EN' ? 'Account Holder:' : 'Atas Nama (Holder Name):'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KABUSHIKI GAISHA SEMBAKO NUSANTARA"
                    value={newBankAccount.holderName}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, holderName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-teal-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '初期残高 (¥ JPY):' : language === 'EN' ? 'Initial Balance (¥):' : 'Saldo Awal (¥):'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newBankAccount.initialBalance}
                      onChange={(e) => setNewBankAccount({ ...newBankAccount, initialBalance: Number(e.target.value) })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-teal-700 font-mono font-black text-sm outline-none focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">
                      {language === 'JP' ? '通貨:' : language === 'EN' ? 'Currency:' : 'Mata Uang:'}
                    </label>
                    <input
                      type="text"
                      disabled
                      value={newBankAccount.currency}
                      className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-stone-600 font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">
                    {language === 'JP' ? '備考 / 目的:' : language === 'EN' ? 'Notes / Purpose:' : 'Keterangan & Catatan:'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rekening utama penerimaan transfer pelanggan"
                    value={newBankAccount.notes}
                    onChange={(e) => setNewBankAccount({ ...newBankAccount, notes: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-800 outline-none focus:border-teal-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBankAccountModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Simpan Akun Bank
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
