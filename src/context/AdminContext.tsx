import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Warehouse,
  Supplier,
  PurchaseOrder,
  StockMovement,
  POSTransaction,
  Order,
  CustomerCRM,
  Voucher,
  CompetitorPrice,
  UserRole
} from '../types';
import { PRODUCTS_DATA } from '../data/products';
import {
  INITIAL_WAREHOUSES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_POS_TRANSACTIONS,
  INITIAL_CUSTOMERS,
  INITIAL_VOUCHERS,
  INITIAL_COMPETITOR_PRICES
} from '../data/adminMockData';

interface AdminContextType {
  products: Product[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockMovements: StockMovement[];
  posTransactions: POSTransaction[];
  orders: Order[];
  customers: CustomerCRM[];
  vouchers: Voucher[];
  competitorPrices: CompetitorPrice[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  updateProductStock: (
    productId: string,
    deltaQuantity: number,
    reason: string,
    type: StockMovement['type'],
    fromWarehouse?: string,
    toWarehouse?: string
  ) => void;
  addPOSTransaction: (
    txData: Omit<POSTransaction, 'id' | 'receiptNumber' | 'date'>
  ) => POSTransaction;
  createPurchaseOrder: (
    poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'dateCreated'>
  ) => PurchaseOrder;
  receivePurchaseOrder: (poId: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    trackingNumber?: string,
    courier?: Order['courier']
  ) => void;
  addSupplier: (supplierData: Omit<Supplier, 'id'>) => Supplier;
  addVoucher: (voucher: Voucher) => void;
  toggleVoucher: (code: string) => void;
  applyVoucher: (
    code: string,
    subtotal: number
  ) => { valid: boolean; discount: number; message: string; voucher?: Voucher };
  addNewProduct: (product: Product) => void;
  updateProduct: (id: string, updatedData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  clearAllTransactions: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const INITIAL_ORDERS: Order[] = [];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sn_products_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 50) return parsed;
      } catch (e) {}
    }
    return PRODUCTS_DATA;
  });

  const [warehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('sn_po_v2');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('sn_stock_movements_v2');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });
  const [posTransactions, setPosTransactions] = useState<POSTransaction[]>(() => {
    const saved = localStorage.getItem('sn_pos_tx_v2');
    return saved ? JSON.parse(saved) : INITIAL_POS_TRANSACTIONS;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sn_admin_orders_v2');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [customers, setCustomers] = useState<CustomerCRM[]>(INITIAL_CUSTOMERS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [competitorPrices] = useState<CompetitorPrice[]>(INITIAL_COMPETITOR_PRICES);
  const [activeRole, setActiveRole] = useState<UserRole>('Super Admin (Owner)');

  useEffect(() => {
    localStorage.setItem('sn_products_v3', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sn_po_v2', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('sn_stock_movements_v2', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem('sn_pos_tx_v2', JSON.stringify(posTransactions));
  }, [posTransactions]);

  useEffect(() => {
    localStorage.setItem('sn_admin_orders_v2', JSON.stringify(orders));
  }, [orders]);

  const updateProductStock = (
    productId: string,
    deltaQuantity: number,
    reason: string,
    type: StockMovement['type'],
    fromWarehouse?: string,
    toWarehouse?: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + deltaQuantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    const targetProd = products.find((p) => p.id === productId);
    const newMovement: StockMovement = {
      id: 'sm-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      productId,
      productName: targetProd ? targetProd.name : 'Unknown Product',
      type,
      quantity: Math.abs(deltaQuantity),
      fromWarehouse,
      toWarehouse,
      referenceNumber: 'REF-' + Math.floor(100000 + Math.random() * 900000),
      notes: reason
    };

    setStockMovements((prev) => [newMovement, ...prev]);
  };

  const addPOSTransaction = (
    txData: Omit<POSTransaction, 'id' | 'receiptNumber' | 'date'>
  ): POSTransaction => {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const receiptNum = 'SN-POS-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const newTx: POSTransaction = {
      ...txData,
      id: 'pos-' + timestamp,
      receiptNumber: receiptNum,
      date: dateStr
    };

    // Deduct stocks for items sold in POS
    txData.items.forEach((item) => {
      updateProductStock(
        item.productId,
        -item.quantity,
        `Penjualan POS #${receiptNum}`,
        'OUT_POS',
        'wh-tokyo'
      );
    });

    setPosTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const createPurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'dateCreated'>
  ): PurchaseOrder => {
    const dateStr = new Date().toISOString().substring(0, 10);
    const poNum = 'PO-' + new Date().toISOString().slice(0, 7).replace('-', '') + '-' + Math.floor(100 + Math.random() * 900);

    const newPO: PurchaseOrder = {
      ...poData,
      id: 'po-' + Date.now(),
      poNumber: poNum,
      dateCreated: dateStr
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    return newPO;
  };

  const receivePurchaseOrder = (poId: string) => {
    const targetPO = purchaseOrders.find((po) => po.id === poId);
    if (!targetPO || targetPO.status === 'Received') return;

    // Add stocks to warehouse
    targetPO.items.forEach((item) => {
      updateProductStock(
        item.productId,
        item.quantity,
        `Penerimaan Purchase Order #${targetPO.poNumber}`,
        'IN_PO',
        undefined,
        targetPO.destinationWarehouseId
      );
    });

    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'Received' } : po))
    );
  };

  const addOrder = (newOrder: Order) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('sn_admin_orders_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Also sync to customer user orders history
    try {
      const existingUserOrders = JSON.parse(localStorage.getItem('sn_user_orders') || '[]');
      const userOrderSummary = {
        id: newOrder.id,
        orderId: newOrder.id,
        trackingNumber: newOrder.trackingNumber,
        courier: newOrder.courier,
        status: newOrder.status,
        total: newOrder.totalAmount,
        totalAmount: newOrder.totalAmount,
        taxAmount: newOrder.taxAmount || 0,
        date: newOrder.date,
        customerName: newOrder.customerName || 'Pelanggan',
        paymentMethod: newOrder.paymentMethod || 'jpqr',
        shippingAddress: newOrder.shippingAddress,
        address: newOrder.shippingAddress,
        items: newOrder.items.map((it) => ({
          name: it.productName,
          productName: it.productName,
          productImage: it.productImage,
          qty: it.quantity,
          quantity: it.quantity,
          price: it.price
        }))
      };
      const filteredUserOrders = existingUserOrders.filter((o: any) => o.id !== newOrder.id);
      filteredUserOrders.unshift(userOrderSummary);
      localStorage.setItem('sn_user_orders', JSON.stringify(filteredUserOrders));
    } catch (e) {}
  };

  const updateOrderStatus = (
    orderId: string,
    status: Order['status'],
    trackingNumber?: string,
    courier?: Order['courier']
  ) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            trackingNumber: trackingNumber !== undefined && trackingNumber !== '' ? trackingNumber : ord.trackingNumber,
            courier: courier ?? ord.courier
          };
        }
        return ord;
      });
      try {
        localStorage.setItem('sn_admin_orders_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Synchronize to customer user orders history so customer tracking page & account page immediately gets the updated status
    try {
      const existingUserOrders = JSON.parse(localStorage.getItem('sn_user_orders') || '[]');
      const updatedUserOrders = existingUserOrders.map((ord: any) => {
        if (ord.id === orderId || ord.orderId === orderId) {
          return {
            ...ord,
            status,
            trackingNumber: trackingNumber !== undefined && trackingNumber !== '' ? trackingNumber : ord.trackingNumber,
            courier: courier ?? ord.courier
          };
        }
        return ord;
      });
      localStorage.setItem('sn_user_orders', JSON.stringify(updatedUserOrders));
    } catch (e) {}
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...supplierData,
      id: 'sup-' + (suppliers.length + 1)
    };
    setSuppliers((prev) => [...prev, newSup]);
    return newSup;
  };

  const addVoucher = (voucher: Voucher) => {
    setVouchers((prev) => [...prev, voucher]);
  };

  const toggleVoucher = (code: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.code === code ? { ...v, isActive: !v.isActive } : v))
    );
  };

  const applyVoucher = (
    code: string,
    subtotal: number
  ): { valid: boolean; discount: number; message: string; voucher?: Voucher } => {
    const found = vouchers.find(
      (v) => v.code.toUpperCase() === code.trim().toUpperCase() && v.isActive
    );

    if (!found) {
      return { valid: false, discount: 0, message: 'Kode voucher tidak valid atau sudah kedaluwarsa.' };
    }

    if (subtotal < found.minSpend) {
      return {
        valid: false,
        discount: 0,
        message: `Minimal belanja untuk voucher ini adalah ¥${found.minSpend.toLocaleString()}.`
      };
    }

    let calculatedDiscount = 0;
    if (found.discountType === 'FIXED') {
      calculatedDiscount = found.discountValue;
    } else {
      calculatedDiscount = Math.round((subtotal * found.discountValue) / 100);
      if (found.maxDiscount && calculatedDiscount > found.maxDiscount) {
        calculatedDiscount = found.maxDiscount;
      }
    }

    return {
      valid: true,
      discount: calculatedDiscount,
      message: `Voucher ${found.code} berhasil diterapkan! Hemat ¥${calculatedDiscount.toLocaleString()}`,
      voucher: found
    };
  };

  const addNewProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAllTransactions = () => {
    setPosTransactions([]);
    setOrders([]);
    localStorage.removeItem('sn_pos_tx_v2');
    localStorage.removeItem('sn_admin_orders_v2');
    localStorage.removeItem('sn_user_orders');
  };

  return (
    <AdminContext.Provider
      value={{
        products,
        warehouses,
        suppliers,
        purchaseOrders,
        stockMovements,
        posTransactions,
        orders,
        customers,
        vouchers,
        competitorPrices,
        activeRole,
        setActiveRole,
        updateProductStock,
        addPOSTransaction,
        createPurchaseOrder,
        receivePurchaseOrder,
        addOrder,
        updateOrderStatus,
        addSupplier,
        addVoucher,
        toggleVoucher,
        applyVoucher,
        addNewProduct,
        updateProduct,
        deleteProduct,
        clearAllTransactions
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
