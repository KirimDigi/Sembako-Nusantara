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
  UserRole,
  DirectPurchaseEntry,
  ItemDiscount,
  ProductPromo,
  WholesalePriceTier,
  StockOpnameSession,
  StockOpnameSessionItem
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
  INITIAL_COMPETITOR_PRICES,
  INITIAL_ITEM_DISCOUNTS,
  INITIAL_PRODUCT_PROMOS,
  INITIAL_WHOLESALE_PRICES
} from '../data/adminMockData';
import { supabase } from '../lib/supabase';

interface AdminContextType {
  products: Product[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  directPurchases: DirectPurchaseEntry[];
  addDirectPurchase: (purchaseData: Omit<DirectPurchaseEntry, 'id'>) => DirectPurchaseEntry;
  updateDirectPurchase: (id: string, updatedData: Partial<DirectPurchaseEntry>) => void;
  deleteDirectPurchase: (id: string) => void;
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
  updatePurchaseOrder: (id: string, updatedData: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    trackingNumber?: string,
    courier?: Order['courier']
  ) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  addSupplier: (supplierData: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updatedData: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addCustomer: (customerData: Omit<CustomerCRM, 'id' | 'registeredDate'>) => CustomerCRM;
  addVoucher: (voucher: Voucher) => void;
  toggleVoucher: (code: string) => void;
  deleteVoucher: (code: string) => void;
  applyVoucher: (
    code: string,
    subtotal: number
  ) => { valid: boolean; discount: number; message: string; voucher?: Voucher };
  itemDiscounts: ItemDiscount[];
  addItemDiscount: (discount: ItemDiscount) => void;
  toggleItemDiscount: (id: string) => void;
  deleteItemDiscount: (id: string) => void;
  productPromos: ProductPromo[];
  addProductPromo: (promo: ProductPromo) => void;
  toggleProductPromo: (id: string) => void;
  deleteProductPromo: (id: string) => void;
  wholesalePrices: WholesalePriceTier[];
  addWholesalePrice: (tier: WholesalePriceTier) => void;
  toggleWholesalePrice: (id: string) => void;
  deleteWholesalePrice: (id: string) => void;
  addNewProduct: (product: Product) => void;
  updateProduct: (id: string, updatedData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  clearAllTransactions: () => void;
  batchApplyStockOpname: (
    adjustments: {
      productId: string;
      physicalStock: number;
      notes?: string;
    }[],
    officerName?: string,
    sessionNotes?: string
  ) => StockOpnameSession;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const INITIAL_ORDERS: Order[] = [];

// Intelligent Non-Destructive Product Merging
// Ensures builds, updates, and deploys NEVER reset user stock, prices, HPP, or transactions
function loadAndMergeProducts(): Product[] {
  try {
    const saved = localStorage.getItem('sn_products_v7');
    if (!saved) {
      localStorage.setItem('sn_products_v7', JSON.stringify(PRODUCTS_DATA));
      return PRODUCTS_DATA;
    }

    const parsed: Product[] = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('sn_products_v7', JSON.stringify(PRODUCTS_DATA));
      return PRODUCTS_DATA;
    }

    // Index saved products by both SKU and ID
    const savedMap = new Map<string, Product>();
    parsed.forEach((item) => {
      if (item.sku) savedMap.set(item.sku, item);
      if (item.id) savedMap.set(String(item.id), item);
    });

    // Merge PRODUCTS_DATA with saved edits (strictly preserving user-edited stock, prices, HPP, bulkPrices)
    const mergedList: Product[] = PRODUCTS_DATA.map((codeItem) => {
      const existing = (codeItem.sku && savedMap.get(codeItem.sku)) || savedMap.get(String(codeItem.id));
      if (!existing) {
        return codeItem;
      }

      // Preserve user modifications while updating any new code translations or attributes
      return {
        ...codeItem,
        stock: typeof existing.stock === 'number' ? existing.stock : codeItem.stock,
        costPrice: typeof existing.costPrice === 'number' ? existing.costPrice : codeItem.costPrice,
        price: typeof existing.price === 'number' ? existing.price : codeItem.price,
        originalPrice: existing.originalPrice !== undefined ? existing.originalPrice : codeItem.originalPrice,
        bulkPrices: existing.bulkPrices || codeItem.bulkPrices,
        rating: existing.rating || codeItem.rating,
        reviewCount: existing.reviewCount || codeItem.reviewCount,
        // Preserve custom uploaded photo if set
        image: (existing.image && !existing.image.includes('placeholder-upload')) ? existing.image : codeItem.image,
      };
    });

    // Retain any custom products created by the user in Admin that were not in default code
    const codeSkus = new Set(PRODUCTS_DATA.map((p) => p.sku).filter(Boolean));
    const codeIds = new Set(PRODUCTS_DATA.map((p) => String(p.id)));

    parsed.forEach((savedItem) => {
      const matchesSku = savedItem.sku && codeSkus.has(savedItem.sku);
      const matchesId = savedItem.id && codeIds.has(String(savedItem.id));
      if (!matchesSku && !matchesId) {
        mergedList.push(savedItem);
      }
    });

    return mergedList;
  } catch (err) {
    console.warn('[AdminContext] Error merging products data:', err);
    return PRODUCTS_DATA;
  }
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => loadAndMergeProducts());

  const [warehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('sn_suppliers_v3');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });
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
  const [customers, setCustomers] = useState<CustomerCRM[]>(() => {
    const saved = localStorage.getItem('sn_customers_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((c: any) => ({ ...c, loyaltyPoints: 0 }));
        }
      } catch (e) {}
    }
    return INITIAL_CUSTOMERS.map((c) => ({ ...c, loyaltyPoints: 0 }));
  });
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('sn_vouchers_v3');
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });
  const [itemDiscounts, setItemDiscounts] = useState<ItemDiscount[]>(() => {
    const saved = localStorage.getItem('sn_item_discounts_v1');
    return saved ? JSON.parse(saved) : INITIAL_ITEM_DISCOUNTS;
  });
  const [productPromos, setProductPromos] = useState<ProductPromo[]>(() => {
    const saved = localStorage.getItem('sn_product_promos_v1');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_PROMOS;
  });
  const [wholesalePrices, setWholesalePrices] = useState<WholesalePriceTier[]>(() => {
    const saved = localStorage.getItem('sn_wholesale_prices_v1');
    return saved ? JSON.parse(saved) : INITIAL_WHOLESALE_PRICES;
  });
  const [competitorPrices] = useState<CompetitorPrice[]>(INITIAL_COMPETITOR_PRICES);
  const [activeRole, setActiveRole] = useState<UserRole>('Super Admin (Owner)');

  useEffect(() => {
    localStorage.setItem('sn_products_v7', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sn_customers_v1', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('sn_suppliers_v3', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('sn_vouchers_v3', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('sn_item_discounts_v1', JSON.stringify(itemDiscounts));
  }, [itemDiscounts]);

  useEffect(() => {
    localStorage.setItem('sn_product_promos_v1', JSON.stringify(productPromos));
  }, [productPromos]);

  useEffect(() => {
    localStorage.setItem('sn_wholesale_prices_v1', JSON.stringify(wholesalePrices));
  }, [wholesalePrices]);

  useEffect(() => {
    localStorage.setItem('sn_po_v2', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('sn_stock_movements_v2', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem('sn_pos_tx_v2', JSON.stringify(posTransactions));
  }, [posTransactions]);

  const [directPurchases, setDirectPurchases] = useState<DirectPurchaseEntry[]>(() => {
    const saved = localStorage.getItem('sn_direct_purchases_v1');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'dp-1',
            invoiceNumber: 'INV/NDT/2610-001',
            supplierName: 'PT Nusantara Direct Tokyo',
            date: '2026-10-05',
            warehouseId: 'wh-tokyo',
            warehouseName: 'Gudang Utama Tokyo (Kanto Hub)',
            totalAmount: 147500,
            status: 'Diterima',
            paymentStatus: 'LUNAS',
            paymentMethod: 'CASH',
            paidAt: '2026-10-05',
            notes: 'Restock mingguan mie instan dan kecap',
            items: [
              { productId: '1', productName: 'Indomie Mi Goreng Spesial (Dus / 40 Pcs)', quantity: 25, costPrice: 2950, subtotal: 73750 },
              { productId: '2', productName: 'Kecap Manis Bango 550ml', quantity: 15, costPrice: 4950, subtotal: 74250 }
            ]
          }
        ];
  });

  useEffect(() => {
    localStorage.setItem('sn_direct_purchases_v1', JSON.stringify(directPurchases));
  }, [directPurchases]);

  useEffect(() => {
    localStorage.setItem('sn_admin_orders_v2', JSON.stringify(orders));
  }, [orders]);

  // Fetch live orders from Supabase if connected
  useEffect(() => {
    const fetchCloudOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data && Array.isArray(data) && data.length > 0) {
          const cloudOrders: Order[] = data.map((d: any) => ({
            id: d.id,
            trackingNumber: d.tracking_number || '',
            courier: d.courier || 'Yamato Transport',
            status: d.status || 'Dikemas',
            totalAmount: Number(d.total_amount) || 0,
            taxAmount: Number(d.tax_amount) || 0,
            paymentMethod: d.payment_method || 'jpqr',
            customerName: d.customer_name || 'Willy Pratama',
            shippingAddress: d.shipping_address || '',
            date: d.order_date || new Date(d.created_at).toLocaleDateString('id-ID'),
            items: (d.order_items || []).map((it: any) => ({
              id: it.product_id,
              productName: it.product_name,
              productImage: it.product_image,
              price: Number(it.price),
              quantity: it.quantity
            }))
          }));

          setOrders((prev) => {
            const merged = [...cloudOrders];
            prev.forEach((localOrd) => {
              if (!merged.some((m) => m.id === localOrd.id)) {
                merged.push(localOrd);
              }
            });
            return merged;
          });
        }
      } catch (e) {}
    };

    fetchCloudOrders();
  }, []);

  // Fetch live POS transactions from Supabase if connected
  useEffect(() => {
    const fetchCloudPOSTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('pos_transactions')
          .select('*, pos_transaction_items(*)')
          .order('transaction_date', { ascending: false });

        if (!error && data && Array.isArray(data) && data.length > 0) {
          const cloudTx: POSTransaction[] = data.map((d: any) => ({
            id: d.id,
            receiptNumber: d.receipt_number,
            date: d.transaction_date || d.created_at,
            cashierName: d.cashier_name || 'Kasir',
            customerName: d.customer_name || 'Walk-in Customer',
            paymentMethod: d.payment_method || 'Cash',
            subtotal: Number(d.subtotal) || 0,
            discountAmount: Number(d.discount_amount) || 0,
            taxAmount: Number(d.tax_amount) || 0,
            totalAmount: Number(d.total_amount) || 0,
            amountPaid: Number(d.amount_paid) || 0,
            changeAmount: Number(d.change_amount) || 0,
            notes: d.notes || '',
            items: (d.pos_transaction_items || []).map((it: any) => ({
              productId: it.product_id,
              productName: it.product_name,
              price: Number(it.unit_price) || 0,
              quantity: Number(it.quantity) || 1,
              subtotal: Number(it.subtotal) || 0
            }))
          }));

          setPosTransactions((prev) => {
            const merged = [...cloudTx];
            prev.forEach((localTx) => {
              if (!merged.some((m) => m.id === localTx.id || m.receiptNumber === localTx.receiptNumber)) {
                merged.push(localTx);
              }
            });
            return merged;
          });
        }
      } catch (e) {}
    };

    fetchCloudPOSTransactions();

    // Fetch live customers from Supabase
    const fetchCloudCustomers = async () => {
      try {
        const { data, error } = await supabase.from('customers').select('*');
        if (!error && data && Array.isArray(data) && data.length > 0) {
          const cloudCust: CustomerCRM[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            email: d.email || '',
            phone: d.phone || '',
            city: d.city || 'Tokyo',
            totalOrders: Number(d.total_orders) || 0,
            totalSpent: Number(d.total_spent) || 0,
            loyaltyPoints: Number(d.loyalty_points) || 0,
            tier: d.tier || 'Bronze',
            registeredDate: d.registered_date || '',
            preferredLanguage: d.preferred_language || 'ID'
          }));
          setCustomers((prev) => {
            const merged = [...cloudCust];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) merged.push(p);
            });
            return merged;
          });
        }
      } catch (e) {}
    };
    fetchCloudCustomers();

    // Fetch live suppliers from Supabase
    const fetchCloudSuppliers = async () => {
      try {
        const { data, error } = await supabase.from('suppliers').select('*');
        if (!error && data && Array.isArray(data) && data.length > 0) {
          const cloudSup: Supplier[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            contactPerson: d.contact_person || '',
            phone: d.phone || '',
            email: d.email || '',
            address: d.address || '',
            origin: (d.origin || 'Indonesia') as 'Indonesia' | 'Japan' | 'Other',
            rating: Number(d.rating) || 5,
            paymentTerms: d.payment_terms || 'TOP 30 Hari',
            leadTimeDays: Number(d.lead_time_days) || 3,
            isActive: d.is_active ?? true,
            notes: d.notes || ''
          }));
          setSuppliers((prev) => {
            const merged = [...cloudSup];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) merged.push(p);
            });
            return merged;
          });
        }
      } catch (e) {}
    };
    fetchCloudSuppliers();

    // Fetch live products from Supabase to keep storefront & admin synchronized
    const fetchCloudProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && Array.isArray(data) && data.length > 0) {
          setProducts((prev) => {
            const cloudMap = new Map<string, any>();
            data.forEach((d: any) => {
              if (d.id) cloudMap.set(String(d.id), d);
              if (d.sku) cloudMap.set(d.sku, d);
            });

            return prev.map((p) => {
              const cloudItem = cloudMap.get(String(p.id)) || (p.sku ? cloudMap.get(p.sku) : undefined);
              if (!cloudItem) return p;

              return {
                ...p,
                price: typeof cloudItem.price === 'number' ? cloudItem.price : p.price,
                costPrice: typeof cloudItem.cost_price === 'number' ? cloudItem.cost_price : p.costPrice,
                stock: typeof cloudItem.stock === 'number' ? cloudItem.stock : p.stock,
                originalPrice: cloudItem.original_price !== undefined && cloudItem.original_price !== null ? cloudItem.original_price : p.originalPrice,
                barcode: cloudItem.barcode || p.barcode,
                image: (cloudItem.image && !cloudItem.image.includes('placeholder-upload')) ? cloudItem.image : p.image
              };
            });
          });
        }
      } catch (e) {
        console.warn('Cloud products sync notice:', e);
      }
    };
    fetchCloudProducts();

    // Fetch live vouchers from Supabase
    const fetchCloudVouchers = async () => {
      try {
        const { data, error } = await supabase.from('vouchers').select('*');
        if (!error && data && Array.isArray(data) && data.length > 0) {
          const cloudVou: Voucher[] = data.map((d: any) => ({
            code: d.code,
            title: d.title,
            description: d.description || '',
            discountType: d.discount_type || 'PERCENTAGE',
            discountValue: Number(d.discount_value) || 0,
            minSpend: Number(d.min_spend) || 0,
            maxDiscount: d.max_discount ? Number(d.max_discount) : undefined,
            validUntil: d.valid_until || '2026-12-31',
            usageCount: Number(d.usage_count) || 0,
            isActive: d.is_active ?? true
          }));
          setVouchers((prev) => {
            const merged = [...cloudVou];
            prev.forEach((p) => {
              if (!merged.some((m) => m.code === p.code)) merged.push(p);
            });
            return merged;
          });
        }
      } catch (e) {}
    };
    fetchCloudVouchers();
  }, []);

  const updateProductStock = (
    productId: string,
    deltaQuantity: number,
    reason: string,
    type: StockMovement['type'],
    fromWarehouse?: string,
    toWarehouse?: string
  ) => {
    let resolvedNewStock: number | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + deltaQuantity);
          resolvedNewStock = newStock;
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    // Sync stock level to Supabase cloud database
    if (resolvedNewStock !== null) {
      try {
        supabase.from('products').update({
          stock: resolvedNewStock,
          updated_at: new Date().toISOString()
        }).eq('id', productId).then(() => {}, () => {});
      } catch (e) {}
    }

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

    // Sync stock movement record to Supabase
    try {
      supabase.from('stock_movements').insert({
        id: newMovement.id,
        product_id: newMovement.productId,
        product_name: newMovement.productName,
        delta_quantity: deltaQuantity,
        type: newMovement.type,
        reason: newMovement.notes || reason,
        from_warehouse: newMovement.fromWarehouse || 'wh-tokyo',
        to_warehouse: newMovement.toWarehouse || null,
        operator_name: 'Willy Pratama (Admin)'
      }).then(() => {}, () => {});
    } catch (e) {}
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

    // Cloud Database Synchronization (Supabase pos_transactions & pos_transaction_items)
    try {
      supabase.from('pos_transactions').upsert({
        id: newTx.id,
        receipt_number: newTx.receiptNumber,
        transaction_date: new Date().toISOString(),
        cashier_name: newTx.cashierName,
        customer_name: newTx.customerName || 'Walk-in Customer',
        payment_method: newTx.paymentMethod,
        subtotal: newTx.subtotal,
        discount_amount: newTx.discountAmount,
        tax_amount: newTx.taxAmount,
        total_amount: newTx.totalAmount,
        amount_paid: newTx.amountPaid,
        change_amount: newTx.changeAmount,
        status: 'Lunas',
        notes: newTx.notes || null
      }).then(() => {
        if (newTx.items && Array.isArray(newTx.items) && newTx.items.length > 0) {
          const itemsPayload = newTx.items.map((it) => ({
            transaction_id: newTx.id,
            product_id: it.productId,
            product_name: it.productName,
            unit_price: it.price,
            quantity: it.quantity,
            subtotal: it.subtotal
          }));
          supabase.from('pos_transaction_items').insert(itemsPayload).then(() => {}, () => {});
        }
      }, () => {});
    } catch (e) {}

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

  const updatePurchaseOrder = (id: string, updatedData: Partial<PurchaseOrder>) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, ...updatedData } : po))
    );
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));
  };

  const addDirectPurchase = (
    purchaseData: Omit<DirectPurchaseEntry, 'id'>
  ): DirectPurchaseEntry => {
    const newEntry: DirectPurchaseEntry = {
      ...purchaseData,
      id: 'dp-' + Date.now()
    };

    // If status is 'Diterima', immediately update stocks in admin & customer catalog
    if (newEntry.status === 'Diterima' && newEntry.items && newEntry.items.length > 0) {
      newEntry.items.forEach((item) => {
        updateProductStock(
          item.productId,
          item.quantity,
          `Pembelian Masuk #${newEntry.invoiceNumber} (${newEntry.supplierName})`,
          'IN_PO',
          undefined,
          newEntry.warehouseId || 'wh-tokyo'
        );
      });
    }

    setDirectPurchases((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const updateDirectPurchase = (id: string, updatedData: Partial<DirectPurchaseEntry>) => {
    setDirectPurchases((prev) =>
      prev.map((dp) => (dp.id === id ? { ...dp, ...updatedData } : dp))
    );
  };

  const deleteDirectPurchase = (id: string) => {
    setDirectPurchases((prev) => prev.filter((dp) => dp.id !== id));
  };

  const addOrder = (newOrder: Order) => {
    // Deduct stocks for items in online order
    if (newOrder.items && Array.isArray(newOrder.items)) {
      newOrder.items.forEach((item: any) => {
        const prodId = item.id || item.productId;
        const qty = item.quantity || item.qty || 1;
        if (prodId) {
          updateProductStock(
            prodId,
            -qty,
            `Penjualan Online #${newOrder.id}`,
            'OUT_ECOMMERCE',
            'wh-tokyo'
          );
        }
      });
    }

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
        userId: newOrder.userId || (newOrder as any).userId,
        userEmail: newOrder.userEmail || (newOrder as any).userEmail,
        trackingNumber: newOrder.trackingNumber,
        courier: newOrder.courier,
        status: newOrder.status,
        total: newOrder.totalAmount,
        totalAmount: newOrder.totalAmount,
        taxAmount: newOrder.taxAmount || 0,
        date: newOrder.date,
        customerName: newOrder.customerName || 'Pelanggan',
        phone: newOrder.phone || (newOrder as any).phone,
        paymentMethod: newOrder.paymentMethod || 'jpqr',
        shippingAddress: newOrder.shippingAddress,
        address: newOrder.shippingAddress,
        items: (newOrder.items || []).map((it: any) => ({
          id: it.id || it.productId,
          productId: it.id || it.productId,
          name: it.name || it.productName,
          productName: it.name || it.productName,
          productImage: it.productImage || it.image,
          qty: it.qty || it.quantity || 1,
          quantity: it.qty || it.quantity || 1,
          price: it.price
        }))
      };
      const filteredUserOrders = existingUserOrders.filter((o: any) => o.id !== newOrder.id && o.orderId !== newOrder.id);
      filteredUserOrders.unshift(userOrderSummary);
      localStorage.setItem('sn_user_orders', JSON.stringify(filteredUserOrders));
    } catch (e) {}

    // Cloud Database Synchronization (Supabase)
    try {
      supabase.from('orders').upsert({
        id: newOrder.id,
        tracking_number: newOrder.trackingNumber || '',
        courier: newOrder.courier || 'Yamato Transport',
        status: newOrder.status || 'Dikemas',
        total_amount: newOrder.totalAmount || 0,
        tax_amount: newOrder.taxAmount || 0,
        payment_method: newOrder.paymentMethod || 'jpqr',
        customer_name: newOrder.customerName || 'Willy Pratama',
        shipping_address: newOrder.shippingAddress || '',
        order_date: newOrder.date
      }).then(() => {
        if (newOrder.items && Array.isArray(newOrder.items) && newOrder.items.length > 0) {
          const itemsPayload = newOrder.items.map((it: any) => ({
            order_id: newOrder.id,
            product_id: it.id || it.productId || '1',
            product_name: it.productName || it.name || 'Produk Sembako',
            product_image: it.productImage || it.image || '',
            price: Number(it.price) || 0,
            quantity: Number(it.quantity || it.qty) || 1,
            subtotal: (Number(it.price) || 0) * (Number(it.quantity || it.qty) || 1)
          }));
          supabase.from('order_items').insert(itemsPayload).then(() => {}, () => {});
        }
      }, () => {});
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

    // Cloud Database Status Update (Supabase)
    try {
      supabase.from('orders').update({
        status,
        tracking_number: trackingNumber || undefined,
        courier: courier || undefined,
        updated_at: new Date().toISOString()
      }).eq('id', orderId).then(() => {}, () => {});
    } catch (e) {}
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Restore stock if not already cancelled
    if (targetOrder.status !== 'Dibatalkan' && targetOrder.items && Array.isArray(targetOrder.items)) {
      targetOrder.items.forEach((item: any) => {
        const prodId = item.id || item.productId;
        const qty = item.quantity || item.qty || 1;
        if (prodId) {
          updateProductStock(
            prodId,
            qty,
            `Pengembalian Stok / Pembatalan Pesanan #${orderId}${reason ? ` (${reason})` : ''}`,
            'IN_PO',
            undefined,
            'wh-tokyo'
          );
        }
      });
    }

    updateOrderStatus(orderId, 'Dibatalkan');
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...supplierData,
      id: 'sup-' + (suppliers.length + 1)
    };
    setSuppliers((prev) => [...prev, newSup]);

    try {
      supabase.from('suppliers').upsert({
        id: newSup.id,
        name: newSup.name,
        contact_person: newSup.contactPerson || null,
        phone: newSup.phone || null,
        email: newSup.email || null,
        address: newSup.address || null,
        payment_terms: newSup.paymentTerms || 'TOP 30 Hari',
        lead_time_days: newSup.leadTimeDays || 3,
        is_active: newSup.isActive,
        notes: newSup.notes || null
      }).then(() => {}, () => {});
    } catch (e) {}

    return newSup;
  };

  const updateSupplier = (id: string, updatedData: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((sup) => (sup.id === id ? { ...sup, ...updatedData } : sup))
    );
    try {
      supabase.from('suppliers').update(updatedData).eq('id', id).then(() => {}, () => {});
    } catch (e) {}
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((sup) => sup.id !== id));
    try {
      supabase.from('suppliers').delete().eq('id', id).then(() => {}, () => {});
    } catch (e) {}
  };

  const addCustomer = (customerData: Omit<CustomerCRM, 'id' | 'registeredDate'>): CustomerCRM => {
    const newCust: CustomerCRM = {
      ...customerData,
      id: 'cust-' + (customers.length + 1),
      registeredDate: new Date().toISOString().substring(0, 10),
      totalOrders: customerData.totalOrders ?? 0,
      totalSpent: customerData.totalSpent ?? 0,
      loyaltyPoints: customerData.loyaltyPoints ?? 0,
      tier: customerData.tier ?? 'Bronze',
      preferredLanguage: customerData.preferredLanguage ?? 'ID'
    };
    setCustomers((prev) => [newCust, ...prev]);

    try {
      supabase.from('customers').upsert({
        id: newCust.id,
        name: newCust.name,
        email: newCust.email || null,
        phone: newCust.phone || null,
        city: newCust.city || 'Tokyo',
        total_orders: newCust.totalOrders,
        total_spent: newCust.totalSpent,
        loyalty_points: newCust.loyaltyPoints,
        tier: newCust.tier,
        registered_date: newCust.registeredDate,
        preferred_language: newCust.preferredLanguage
      }).then(() => {}, () => {});
    } catch (e) {}

    return newCust;
  };

  const addVoucher = (voucher: Voucher) => {
    setVouchers((prev) => [...prev, voucher]);

    try {
      supabase.from('vouchers').upsert({
        code: voucher.code,
        title: voucher.title,
        description: voucher.description || null,
        discount_type: voucher.discountType,
        discount_value: voucher.discountValue,
        min_spend: voucher.minSpend,
        max_discount: voucher.maxDiscount || null,
        valid_until: voucher.validUntil,
        usage_count: voucher.usageCount || 0,
        is_active: voucher.isActive
      }).then(() => {}, () => {});
    } catch (e) {}
  };

  const toggleVoucher = (code: string) => {
    let nextStatus = false;
    setVouchers((prev) =>
      prev.map((v) => {
        if (v.code === code) {
          nextStatus = !v.isActive;
          return { ...v, isActive: nextStatus };
        }
        return v;
      })
    );

    try {
      supabase.from('vouchers').update({ is_active: nextStatus }).eq('code', code).then(() => {}, () => {});
    } catch (e) {}
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
    if (found.discountType === 'FIXED' || found.discountType === 'NOMINAL_JPY') {
      calculatedDiscount = found.discountValue;
    } else if (found.discountType === 'NOMINAL_IDR') {
      calculatedDiscount = Math.round(found.discountValue / 105);
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

  const deleteVoucher = (code: string) => {
    setVouchers((prev) => prev.filter((v) => v.code !== code));
    try {
      supabase.from('vouchers').delete().eq('code', code).then(() => {}, () => {});
    } catch (e) {}
  };

  const addItemDiscount = (discount: ItemDiscount) => {
    setItemDiscounts((prev) => [discount, ...prev.filter((d) => d.productId !== discount.productId)]);
  };

  const toggleItemDiscount = (id: string) => {
    setItemDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const deleteItemDiscount = (id: string) => {
    setItemDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  const addProductPromo = (promo: ProductPromo) => {
    setProductPromos((prev) => [promo, ...prev]);
  };

  const toggleProductPromo = (id: string) => {
    setProductPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const deleteProductPromo = (id: string) => {
    setProductPromos((prev) => prev.filter((p) => p.id !== id));
  };

  const addWholesalePrice = (tier: WholesalePriceTier) => {
    setWholesalePrices((prev) => [tier, ...prev]);
  };

  const toggleWholesalePrice = (id: string) => {
    setWholesalePrices((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !w.isActive } : w))
    );
  };

  const deleteWholesalePrice = (id: string) => {
    setWholesalePrices((prev) => prev.filter((w) => w.id !== id));
  };

  const addNewProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);

    try {
      supabase.from('products').upsert({
        id: product.id,
        sku: product.sku || product.id,
        name: product.name,
        name_jp: product.nameJp || product.name,
        name_en: product.nameEn || product.name,
        category: product.category,
        price: product.price,
        original_price: product.originalPrice || null,
        cost_price: product.costPrice || 0,
        stock: product.stock,
        min_stock: 5,
        unit: product.unit,
        image: product.image || '/placeholder-upload.svg',
        is_halal: product.isHalal ?? true,
        is_frozen: product.isFrozen ?? false,
        barcode: product.barcode || null,
        description: product.description || ''
      }).then(() => {}, () => {});
    } catch (e) {}
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );

    try {
      const mapped: any = { updated_at: new Date().toISOString() };
      if (updatedData.name !== undefined) mapped.name = updatedData.name;
      if (updatedData.nameJp !== undefined) mapped.name_jp = updatedData.nameJp;
      if (updatedData.nameEn !== undefined) mapped.name_en = updatedData.nameEn;
      if (updatedData.category !== undefined) mapped.category = updatedData.category;
      if (updatedData.price !== undefined) mapped.price = updatedData.price;
      if (updatedData.costPrice !== undefined) mapped.cost_price = updatedData.costPrice;
      if (updatedData.originalPrice !== undefined) mapped.original_price = updatedData.originalPrice;
      if (updatedData.stock !== undefined) mapped.stock = updatedData.stock;
      if (updatedData.unit !== undefined) mapped.unit = updatedData.unit;
      if (updatedData.image !== undefined) mapped.image = updatedData.image;
      if (updatedData.isHalal !== undefined) mapped.is_halal = updatedData.isHalal;
      if (updatedData.isFrozen !== undefined) mapped.is_frozen = updatedData.isFrozen;
      if (updatedData.barcode !== undefined) mapped.barcode = updatedData.barcode;
      if (updatedData.description !== undefined) mapped.description = updatedData.description;

      supabase.from('products').update(mapped).eq('id', id).then(() => {}, () => {});
    } catch (e) {}
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      supabase.from('products').delete().eq('id', id).then(() => {}, () => {});
    } catch (e) {}
  };

  const clearAllTransactions = () => {
    setPosTransactions([]);
    setOrders([]);
    localStorage.removeItem('sn_pos_tx_v2');
    localStorage.removeItem('sn_admin_orders_v2');
    localStorage.removeItem('sn_user_orders');
  };

  const batchApplyStockOpname = (
    adjustments: {
      productId: string;
      physicalStock: number;
      notes?: string;
    }[],
    officerName: string = 'Willy Pratama (Admin)',
    sessionNotes: string = 'Stok Opname Fisik Inventori'
  ): StockOpnameSession => {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const sessionCode = `SO-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const adjustmentMap = new Map<string, { physicalStock: number; notes?: string }>();
    adjustments.forEach((adj) => {
      adjustmentMap.set(adj.productId, {
        physicalStock: Math.max(0, Math.round(Number(adj.physicalStock) || 0)),
        notes: adj.notes
      });
    });

    const sessionItems: StockOpnameSessionItem[] = [];
    const newMovements: StockMovement[] = [];
    let itemsWithDiscrepancy = 0;
    let totalDiscrepancyQty = 0;
    let totalDiscrepancyValue = 0;

    const updatedProducts = products.map((prod) => {
      if (!adjustmentMap.has(prod.id)) {
        return prod;
      }
      const adj = adjustmentMap.get(prod.id)!;
      const physicalStock = adj.physicalStock;
      const systemStock = prod.stock;
      const diffQty = physicalStock - systemStock;
      const costPrice = prod.costPrice || Math.round(prod.price * 0.65);
      const diffVal = diffQty * costPrice;

      if (diffQty !== 0) {
        itemsWithDiscrepancy += 1;
        totalDiscrepancyQty += diffQty;
        totalDiscrepancyValue += diffVal;

        newMovements.push({
          id: `sm-so-${timestamp}-${prod.id}`,
          date: dateStr,
          productId: prod.id,
          productName: prod.name,
          type: 'ADJUSTMENT',
          quantity: Math.abs(diffQty),
          fromWarehouse: 'wh-tokyo',
          referenceNumber: sessionCode,
          notes: `Stok Opname #${sessionCode}: Sistem ${systemStock} -> Fisik ${physicalStock} (${diffQty > 0 ? '+' : ''}${diffQty}) [${adj.notes || 'Penyesuaian Fisik'}]`
        });
      }

      sessionItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.id,
        category: prod.category,
        systemStock,
        physicalStock,
        differenceQty: diffQty,
        costPrice,
        differenceValue: diffVal,
        notes: adj.notes || (diffQty === 0 ? 'Sesuai Fisik' : 'Penyesuaian Fisik')
      });

      return {
        ...prod,
        stock: physicalStock
      };
    });

    // Update product list state (which also auto-saves to sn_products_v3 via existing useEffect)
    setProducts(updatedProducts);

    // Append new audit movements
    if (newMovements.length > 0) {
      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    const session: StockOpnameSession = {
      id: `so-sess-${timestamp}`,
      sessionCode,
      date: dateStr,
      officerName,
      totalItemsChecked: sessionItems.length,
      itemsWithDiscrepancy,
      totalDiscrepancyQty,
      totalDiscrepancyValue,
      status: 'Selesai',
      notes: sessionNotes,
      items: sessionItems
    };

    // Save session to audit history
    try {
      const savedHistory = JSON.parse(localStorage.getItem('sn_stock_opname_history_v1') || '[]');
      const updatedHistory = [session, ...savedHistory];
      localStorage.setItem('sn_stock_opname_history_v1', JSON.stringify(updatedHistory));
    } catch (e) {}

    // Sync batch physical stock adjustments and movements to Supabase cloud database
    try {
      adjustments.forEach((adj) => {
        const physicalStock = Math.max(0, Math.round(Number(adj.physicalStock) || 0));
        supabase.from('products').update({
          stock: physicalStock,
          updated_at: new Date().toISOString()
        }).eq('id', adj.productId).then(() => {}, () => {});
      });

      if (newMovements.length > 0) {
        const movementsPayload = newMovements.map((m) => ({
          id: m.id,
          product_id: m.productId,
          product_name: m.productName,
          delta_quantity: m.quantity,
          type: m.type,
          reason: m.notes || 'Stok Opname Fisik',
          from_warehouse: m.fromWarehouse || 'wh-tokyo',
          operator_name: officerName
        }));
        supabase.from('stock_movements').insert(movementsPayload).then(() => {}, () => {});
      }
    } catch (e) {}

    return session;
  };

  return (
    <AdminContext.Provider
      value={{
        products,
        warehouses,
        suppliers,
        purchaseOrders,
        directPurchases,
        addDirectPurchase,
        updateDirectPurchase,
        deleteDirectPurchase,
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
        updatePurchaseOrder,
        deletePurchaseOrder,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addCustomer,
        addVoucher,
        toggleVoucher,
        deleteVoucher,
        applyVoucher,
        itemDiscounts,
        addItemDiscount,
        toggleItemDiscount,
        deleteItemDiscount,
        productPromos,
        addProductPromo,
        toggleProductPromo,
        deleteProductPromo,
        wholesalePrices,
        addWholesalePrice,
        toggleWholesalePrice,
        deleteWholesalePrice,
        addNewProduct,
        updateProduct,
        deleteProduct,
        clearAllTransactions,
        batchApplyStockOpname
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
