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
import { sendOrderDeliveredWhatsApp } from '../services/whatsappGateway';
import {
  extractOrderOwnerNotes,
  formatOrderOwnerNotes,
  USER_ORDERS_STORAGE_KEY,
  LEGACY_USER_ORDERS_STORAGE_KEY
} from '../utils/orderOwnership';

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
  deletePOSTransaction: (id: string) => Promise<{ success: boolean; error?: string }> | void;
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
  deleteOrder: (orderId: string) => Promise<{ success: boolean; error?: string }> | void;
  addSupplier: (supplierData: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, updatedData: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addCustomer: (customerData: Omit<CustomerCRM, 'id' | 'registeredDate'> & { id?: string }) => CustomerCRM;
  deleteCustomer: (customerId: string) => Promise<{ success: boolean; error?: string }> | void;
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
  updateProduct: (
    id: string,
    updatedData: Partial<Product>
  ) => Promise<{ success: boolean; error?: string }> | void;
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

function createCompleteProduct(d: any): Product {
  const price = typeof d.price === 'number' ? d.price : 0;
  return {
    id: String(d.id),
    sku: d.sku || String(d.id),
    name: d.name || '',
    nameJp: d.name_jp || d.name || '',
    nameEn: d.name_en || d.name || '',
    category: d.category || 'Sembako',
    categoryJp: d.category_jp || d.category || '食材・調味料',
    categoryEn: d.category_en || d.category || 'Groceries',
    price: price,
    costPrice: typeof d.cost_price === 'number' ? d.cost_price : (typeof d.costPrice === 'number' ? d.costPrice : 0),
    priceTax: Math.round(price * 1.08),
    originalPrice: d.original_price !== null && d.original_price !== undefined ? Number(d.original_price) : (d.originalPrice || undefined),
    stock: typeof d.stock === 'number' ? d.stock : 0,
    unit: d.unit || 'pcs',
    unitJp: d.unit_jp || d.unit || '個',
    unitEn: d.unit_en || d.unit || 'pcs',
    image: d.image && !String(d.image).includes('placeholder-upload') ? d.image : '/placeholder-upload.svg',
    isHalal: d.is_halal ?? d.isHalal ?? true,
    isFrozen: d.is_frozen ?? d.isFrozen ?? false,
    barcode: d.barcode || undefined,
    description: d.description || '',
    descriptionJp: d.description_jp || d.description || '',
    descriptionEn: d.description_en || d.description || '',
    rating: 5,
    reviewCount: 0,
    brand: d.brand || 'Sembako Nusantara',
    status: 'ACTIVE'
  };
}

// Intelligent Non-Destructive Product Merging
// Ensures builds, updates, and deploys NEVER reset user stock, prices, HPP, or transactions
function loadAndMergeProducts(): Product[] {
  try {
    const saved = localStorage.getItem('sn_products_v8') || localStorage.getItem('sn_products_v7');
    if (!saved) {
      localStorage.setItem('sn_products_v8', JSON.stringify(PRODUCTS_DATA));
      return PRODUCTS_DATA;
    }

    const parsed: Product[] = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('sn_products_v8', JSON.stringify(PRODUCTS_DATA));
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
        name: existing.name || codeItem.name,
        nameJp: existing.nameJp || codeItem.nameJp,
        nameEn: existing.nameEn || codeItem.nameEn,
        category: existing.category || codeItem.category,
        stock: typeof existing.stock === 'number' ? existing.stock : codeItem.stock,
        costPrice: typeof existing.costPrice === 'number' ? existing.costPrice : codeItem.costPrice,
        price: typeof existing.price === 'number' ? existing.price : codeItem.price,
        originalPrice: existing.originalPrice !== undefined ? existing.originalPrice : codeItem.originalPrice,
        bulkPrices: existing.bulkPrices || codeItem.bulkPrices,
        rating: existing.rating || codeItem.rating,
        reviewCount: existing.reviewCount || codeItem.reviewCount,
        // Preserve custom uploaded photo if set
        image: (existing.image && !existing.image.includes('placeholder-upload')) ? existing.image : codeItem.image,
        barcode: existing.barcode || codeItem.barcode,
        description: existing.description || codeItem.description,
      };
    });

    // Retain any custom products created by the user in Admin that were not in default code
    const codeSkus = new Set(PRODUCTS_DATA.map((p) => p.sku).filter(Boolean));
    const codeIds = new Set(PRODUCTS_DATA.map((p) => String(p.id)));

    parsed.forEach((savedItem) => {
      const matchesSku = savedItem.sku && codeSkus.has(savedItem.sku);
      const matchesId = savedItem.id && codeIds.has(String(savedItem.id));
      if (!matchesSku && !matchesId) {
        const u = (savedItem.unit || '').trim();
        const customName = u && !savedItem.name.toLowerCase().includes(u.toLowerCase())
          ? `${savedItem.name} ${u}`
          : savedItem.name;
        mergedList.push({
          ...savedItem,
          name: customName
        });
      }
    });

    try {
      localStorage.setItem('sn_products_v8', JSON.stringify(mergedList));
    } catch (e) {}

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
    const deletedOrderIds = new Set<string>(
      JSON.parse(localStorage.getItem('sn_deleted_order_ids') || '[]')
    );
    const saved = localStorage.getItem('sn_admin_orders_v2');
    const list: Order[] = saved ? JSON.parse(saved) : INITIAL_ORDERS;
    return Array.isArray(list) ? list.filter((o) => !deletedOrderIds.has(o.id)) : [];
  });
  const [customers, setCustomers] = useState<CustomerCRM[]>(() => {
    const deletedCustomerIds = new Set<string>(
      JSON.parse(localStorage.getItem('sn_deleted_customer_ids') || '[]')
    );
    const saved = localStorage.getItem('sn_customers_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((c: any) => c && c.id && !deletedCustomerIds.has(c.id))
            .map((c: any) => {
              const clean = { ...c, loyaltyPoints: 0 };
              delete clean.email;
              if (!clean.lastOrderDate && (clean.totalOrders > 0 || clean.totalSpent > 0)) {
                clean.lastOrderDate = clean.id === 'cust-2' ? '2026-10-24 16:45' : '2026-10-26 13:20';
              }
              return clean;
            });
        }
      } catch (e) {}
    }
    return INITIAL_CUSTOMERS
      .filter((c) => !deletedCustomerIds.has(c.id))
      .map((c) => ({ ...c, loyaltyPoints: 0 }));
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
    try {
      localStorage.setItem('sn_products_v8', JSON.stringify(products));
    } catch (e) {}
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
    localStorage.setItem('sn_product_promos_v1', JSON.stringify(productPromos));
    localStorage.setItem('sn_wholesale_prices_v1', JSON.stringify(wholesalePrices));

    // Debounced sync to Supabase store_settings.promotions_data
    const timer = setTimeout(() => {
      try {
        supabase
          .from('store_settings')
          .update({
            promotions_data: { itemDiscounts, productPromos, wholesalePrices },
            updated_at: new Date().toISOString()
          })
          .eq('id', 'main_store')
          .then(() => {}, () => {});
      } catch (e) {}
    }, 800);
    return () => clearTimeout(timer);
  }, [itemDiscounts, productPromos, wholesalePrices]);

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

  // Egress-Optimized Cloud Synchronization (Supabase Free Tier < 5GB/month Protection)
  useEffect(() => {
    const PRODUCTS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
    const VOUCHERS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
    const ORDERS_CACHE_TTL = 5 * 60 * 1000;    // 5 minutes
    const ADMIN_CACHE_TTL = 5 * 60 * 1000;     // 5 minutes

    // 1. Real-time Live Products Sync & Cloud Persistence (Always fresh on deploy/load)
    const fetchCloudProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id,sku,name,name_jp,name_en,category,price,cost_price,stock,original_price,barcode,image,unit,is_halal,is_frozen,description');

        if (!error && data && Array.isArray(data) && data.length > 0) {
          sessionStorage.setItem('sn_cloud_products_sync_ts', String(Date.now()));
          setProducts((prev) => {
            const cloudMap = new Map<string, any>();
            data.forEach((d: any) => {
              if (d.id) cloudMap.set(String(d.id), d);
              if (d.sku) cloudMap.set(d.sku, d);
            });

            const updatedList = prev.map((p) => {
              const cloudItem = cloudMap.get(String(p.id)) || (p.sku ? cloudMap.get(p.sku) : undefined);
              if (!cloudItem) return p;

              const safeCloudImg =
                cloudItem.image &&
                !String(cloudItem.image).includes('placeholder-upload') &&
                !String(cloudItem.image).startsWith('data:')
                  ? cloudItem.image
                  : p.image;

              return {
                ...p,
                name: cloudItem.name || p.name,
                nameJp: cloudItem.name_jp || p.nameJp,
                nameEn: cloudItem.name_en || p.nameEn,
                category: cloudItem.category || p.category,
                price: typeof cloudItem.price === 'number' ? cloudItem.price : p.price,
                costPrice: typeof cloudItem.cost_price === 'number' ? cloudItem.cost_price : p.costPrice,
                stock: typeof cloudItem.stock === 'number' ? cloudItem.stock : p.stock,
                originalPrice: cloudItem.original_price !== undefined && cloudItem.original_price !== null ? cloudItem.original_price : p.originalPrice,
                unit: cloudItem.unit || p.unit,
                barcode: cloudItem.barcode || p.barcode,
                isHalal: cloudItem.is_halal ?? p.isHalal,
                isFrozen: cloudItem.is_frozen ?? p.isFrozen,
                description: cloudItem.description || p.description,
                image: safeCloudImg
              };
            });

            // Retain any new products present in Supabase that are not in current state
            const prevIds = new Set(prev.map((p) => String(p.id)));
            const prevSkus = new Set(prev.map((p) => p.sku).filter(Boolean));
            data.forEach((d: any) => {
              const hasId = d.id && prevIds.has(String(d.id));
              const hasSku = d.sku && prevSkus.has(d.sku);
              if (!hasId && !hasSku) {
                updatedList.push(createCompleteProduct(d));
              }
            });

            try {
              localStorage.setItem('sn_products_v8', JSON.stringify(updatedList));
            } catch (e) {}

            return updatedList;
          });
        }
      } catch (e) {
        console.warn('Cloud products sync notice:', e);
      }
    };

    // 2. Vouchers Sync (Cached 15 minutes)
    const fetchCloudVouchers = async () => {
      try {
        const lastSync = Number(sessionStorage.getItem('sn_cloud_vouchers_sync_ts') || 0);
        if (Date.now() - lastSync < VOUCHERS_CACHE_TTL) return;

        const { data, error } = await supabase
          .from('vouchers')
          .select('code,title,description,discount_type,discount_value,min_spend,max_discount,valid_until,usage_count,is_active');

        if (!error && data) {
          sessionStorage.setItem('sn_cloud_vouchers_sync_ts', String(Date.now()));
          if (Array.isArray(data) && data.length > 0) {
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
        }
      } catch (e) {}
    };

    // 3. Orders Sync (Only fetched when user is logged in, tracking an order, or in Admin, capped at 100 recent rows)
    const fetchCloudOrders = async () => {
      try {
        const hash = window.location.hash.toLowerCase();
        const isOrderRelatedRoute =
          hash.startsWith('#/admin') ||
          hash.startsWith('#/orders') ||
          hash.startsWith('#/pesanan-saya') ||
          hash.startsWith('#/profile') ||
          hash.startsWith('#/account') ||
          hash.startsWith('#/tracking');
        const hasAuthSession =
          Boolean(localStorage.getItem('sn_permanent_customer_auth')) ||
          Boolean(localStorage.getItem('sn_user_auth_v2'));

        if (!isOrderRelatedRoute && !hasAuthSession) return;

        const lastSync = Number(sessionStorage.getItem('sn_cloud_orders_sync_ts') || 0);
        if (Date.now() - lastSync < ORDERS_CACHE_TTL) return;

        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data) {
          sessionStorage.setItem('sn_cloud_orders_sync_ts', String(Date.now()));
          if (Array.isArray(data) && data.length > 0) {
            const cloudOrders: Order[] = data.map((d: any) => {
              const ownerMeta = extractOrderOwnerNotes(d.notes);
              return {
                id: d.id,
                trackingNumber: d.tracking_number || '',
                courier: d.courier || 'Yamato Transport',
                status: d.status || 'Dikemas',
                totalAmount: Number(d.total_amount) || 0,
                taxAmount: Number(d.tax_amount) || 0,
                paymentMethod: d.payment_method || 'jpqr',
                customerName: d.customer_name || 'Pelanggan',
                userId: ownerMeta.userId,
                accountName: ownerMeta.accountName,
                userEmail: d.customer_email || '',
                phone: d.customer_phone || '',
                notes: d.notes || '',
                shippingAddress: d.shipping_address || '',
                date: d.order_date || new Date(d.created_at).toLocaleDateString('id-ID'),
                items: (d.order_items || []).map((it: any) => ({
                  id: it.product_id,
                  productName: it.product_name,
                  productImage: it.product_image,
                  price: Number(it.price),
                  quantity: it.quantity
                }))
              };
            });

            setOrders((prev) => {
              const deletedOrderIds = new Set<string>(
                JSON.parse(localStorage.getItem('sn_deleted_order_ids') || '[]')
              );
              const localMap = new Map<string, Order>();
              prev.forEach((lo) => localMap.set(lo.id, lo));

              const merged = cloudOrders
                .filter((co) => !deletedOrderIds.has(co.id))
                .map((co) => {
                  const localMatch = localMap.get(co.id);
                  if (!localMatch) return co;
                  return {
                    ...co,
                    userId: co.userId || localMatch.userId,
                    accountName: co.accountName || localMatch.accountName,
                    accountPhone: co.accountPhone || localMatch.accountPhone,
                    phone: co.phone || localMatch.phone,
                    userEmail: co.userEmail || localMatch.userEmail
                  };
                });

              prev.forEach((localOrd) => {
                if (!deletedOrderIds.has(localOrd.id) && !merged.some((m) => m.id === localOrd.id)) {
                  merged.push(localOrd);
                }
              });
              return merged;
            });
          }
        }
      } catch (e) {}
    };

    // 4. Admin-Only Data Sync (POS Transactions, CRM Customers, Suppliers - skipped for public storefront visitors!)
    const fetchAdminOnlyCloudData = async () => {
      const hash = window.location.hash.toLowerCase();
      const isAdminRoute = hash.startsWith('#/admin') || hash.startsWith('#/pos-display');
      if (!isAdminRoute) return;

      const lastAdminSync = Number(sessionStorage.getItem('sn_cloud_admin_sync_ts') || 0);
      if (Date.now() - lastAdminSync < ADMIN_CACHE_TTL) return;
      sessionStorage.setItem('sn_cloud_admin_sync_ts', String(Date.now()));

      // 4a. POS Transactions (capped at 100 latest receipts)
      try {
        const { data, error } = await supabase
          .from('pos_transactions')
          .select('*, pos_transaction_items(*)')
          .order('transaction_date', { ascending: false })
          .limit(100);

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

      // 4b. Customers CRM (capped at 300 rows)
      try {
        const { data, error } = await supabase.from('customers').select('*').limit(300);
        if (!error && data && Array.isArray(data) && data.length > 0) {
          const cloudCust: CustomerCRM[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            phone: d.phone || '',
            postalCode: d.postal_code || d.postalCode || '',
            prefecture: d.prefecture || '',
            city: d.city || 'Tokyo',
            address: d.address || '',
            totalOrders: Number(d.total_orders) || 0,
            totalSpent: Number(d.total_spent) || 0,
            loyaltyPoints: 0,
            tier: d.tier || 'Bronze',
            registeredDate: d.registered_date || '',
            lastOrderDate: d.last_order_date || (Number(d.total_orders) > 0 ? (d.id === 'cust-2' ? '2026-10-24 16:45' : '2026-10-26 13:20') : undefined),
            preferredLanguage: d.preferred_language || 'ID'
          }));
          setCustomers((prev) => {
            const deletedCustomerIds = new Set<string>(
              JSON.parse(localStorage.getItem('sn_deleted_customer_ids') || '[]')
            );
            const merged = cloudCust.filter((cc) => !deletedCustomerIds.has(cc.id));
            prev.forEach((p) => {
              if (!deletedCustomerIds.has(p.id) && !merged.some((m) => m.id === p.id)) {
                const cleanP = { ...p, loyaltyPoints: 0 };
                delete cleanP.email;
                merged.push(cleanP);
              }
            });
            return merged;
          });
        }
      } catch (e) {}

      // 4c. Suppliers
      try {
        const { data, error } = await supabase.from('suppliers').select('*').limit(100);
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

      // 4d. Direct Purchases (Pembelian Langsung)
      try {
        const { data, error } = await supabase.from('direct_purchases').select('*').limit(200);
        if (!error && data && Array.isArray(data) && data.length > 0) {
          const cloudDP: DirectPurchaseEntry[] = data.map((d: any) => ({
            id: d.id,
            invoiceNumber: d.invoice_number || d.id,
            supplierName: d.supplier_name || d.seller || 'Supplier',
            date: d.date,
            warehouseId: d.warehouse_id || 'wh-tokyo',
            warehouseName: d.warehouse_name || 'Gudang Utama Tokyo',
            totalAmount: Number(d.total_amount || d.total_cost) || 0,
            status: (d.status || 'Diterima') as any,
            paymentStatus: (d.payment_status || 'LUNAS') as any,
            paymentMethod: (d.payment_method || 'CASH') as any,
            notes: d.notes || '',
            items: Array.isArray(d.raw_items) && d.raw_items.length > 0
              ? d.raw_items
              : [
                  {
                    productId: '1',
                    productName: d.item_name || 'Produk Sembako',
                    quantity: d.qty || 1,
                    costPrice: Number(d.unit_cost) || 0,
                    subtotal: Number(d.total_cost) || 0
                  }
                ]
          }));
          setDirectPurchases((prev) => {
            const merged = [...cloudDP];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) merged.push(p);
            });
            return merged;
          });
        }
      } catch (e) {}

      // 4e. Purchase Orders (Supplier PO)
      try {
        const { data, error } = await supabase.from('purchase_orders').select('*').limit(200);
        if (!error && data && Array.isArray(data) && data.length > 0) {
          const cloudPO: PurchaseOrder[] = data.map((d: any) => ({
            id: d.id,
            poNumber: d.invoice_number || d.id,
            supplierId: d.supplier_id || 'sup-1',
            supplierName: d.supplier_name || 'Vendor',
            dateCreated: d.date,
            expectedDate: d.expected_date || d.date,
            destinationWarehouseId: d.warehouse_id || 'wh-tokyo',
            totalAmount: Number(d.total_amount) || 0,
            status: d.status || 'Draft',
            notes: d.notes || '',
            items: Array.isArray(d.raw_items) ? d.raw_items : []
          }));
          setPurchaseOrders((prev) => {
            const merged = [...cloudPO];
            prev.forEach((p) => {
              if (!merged.some((m) => m.id === p.id)) merged.push(p);
            });
            return merged;
          });
        }
      } catch (e) {}

      // 4f. Promotions (Diskon per Item, Promo Produk, Harga Grosir) from store_settings
      try {
        const { data, error } = await supabase.from('store_settings').select('promotions_data').eq('id', 'main_store').maybeSingle();
        if (!error && data && data.promotions_data) {
          const pd = data.promotions_data;
          if (Array.isArray(pd.itemDiscounts) && pd.itemDiscounts.length > 0) {
            setItemDiscounts(pd.itemDiscounts);
          }
          if (Array.isArray(pd.productPromos) && pd.productPromos.length > 0) {
            setProductPromos(pd.productPromos);
          }
          if (Array.isArray(pd.wholesalePrices) && pd.wholesalePrices.length > 0) {
            setWholesalePrices(pd.wholesalePrices);
          }
        }
      } catch (e) {}
    };

    // Initial sync on load
    fetchCloudProducts();
    fetchCloudVouchers();
    fetchCloudOrders();
    fetchAdminOnlyCloudData();

    // Realtime Supabase Database Listener on 'products' table
    const productChannel = supabase
      .channel('realtime:products_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (!updated) return;
            setProducts((prev) => {
              const updatedList = prev.map((p) => {
                if (p.id === updated.id || (p.sku && p.sku === updated.sku)) {
                  const safeImg =
                    updated.image && !String(updated.image).includes('placeholder-upload')
                      ? updated.image
                      : p.image;
                  return {
                    ...p,
                    name: updated.name || p.name,
                    nameJp: updated.name_jp || p.nameJp,
                    nameEn: updated.name_en || p.nameEn,
                    category: updated.category || p.category,
                    price: typeof updated.price === 'number' ? updated.price : p.price,
                    costPrice: typeof updated.cost_price === 'number' ? updated.cost_price : p.costPrice,
                    stock: typeof updated.stock === 'number' ? updated.stock : p.stock,
                    originalPrice:
                      updated.original_price !== null && updated.original_price !== undefined
                        ? Number(updated.original_price)
                        : p.originalPrice,
                    unit: updated.unit || p.unit,
                    image: safeImg,
                    barcode: updated.barcode || p.barcode,
                    isHalal: updated.is_halal ?? p.isHalal,
                    isFrozen: updated.is_frozen ?? p.isFrozen,
                    description: updated.description || p.description,
                  };
                }
                return p;
              });
              try {
                localStorage.setItem('sn_products_v8', JSON.stringify(updatedList));
              } catch (e) {}
              return updatedList;
            });
          } else if (payload.eventType === 'INSERT') {
            const inserted = payload.new as any;
            if (!inserted) return;
            setProducts((prev) => {
              if (prev.some((p) => p.id === inserted.id || (p.sku && p.sku === inserted.sku))) return prev;
              const newProd: Product = createCompleteProduct(inserted);
              const updatedList = [newProd, ...prev];
              try {
                localStorage.setItem('sn_products_v8', JSON.stringify(updatedList));
              } catch (e) {}
              return updatedList;
            });
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as any;
            if (deleted?.id) {
              setProducts((prev) => {
                const updatedList = prev.filter((p) => p.id !== deleted.id && p.sku !== deleted.id);
                try {
                  localStorage.setItem('sn_products_v8', JSON.stringify(updatedList));
                } catch (e) {}
                return updatedList;
              });
            }
          }
        }
      )
      .subscribe();

    // Sync on-demand if user navigates into #/admin or #/orders or #/tracking
    const handleHashChange = () => {
      fetchCloudOrders();
      fetchAdminOnlyCloudData();
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      supabase.removeChannel(productChannel);
    };
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

  const deletePOSTransaction = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setPosTransactions((prev) => {
      const updated = prev.filter((tx) => tx.id !== id);
      try {
        localStorage.setItem('sn_pos_tx_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const { error } = await supabase.from('pos_transactions').delete().eq('id', id);
      if (error) {
        console.warn('[AdminContext] Supabase delete pos_transaction notice:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.warn('[AdminContext] Exception deleting pos_transaction:', e);
      return { success: false, error: e?.message || 'Gagal menghapus transaksi dari cloud' };
    }
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

    // Supabase Cloud Synchronization
    try {
      supabase.from('purchase_orders').upsert({
        id: newPO.id,
        invoice_number: newPO.poNumber,
        supplier_id: newPO.supplierId,
        supplier_name: newPO.supplierName,
        date: newPO.dateCreated,
        expected_date: newPO.expectedDate,
        warehouse_id: newPO.destinationWarehouseId,
        total_amount: newPO.totalAmount,
        status: newPO.status,
        notes: newPO.notes || '',
        raw_items: newPO.items
      }).then(() => {
        if (Array.isArray(newPO.items) && newPO.items.length > 0) {
          const itemsPayload = newPO.items.map((it: any) => ({
            purchase_id: newPO.id,
            product_id: it.productId,
            product_name: it.productName,
            quantity: it.quantity,
            cost_price: it.unitCost,
            subtotal: it.totalCost
          }));
          supabase.from('purchase_order_items').insert(itemsPayload).then(() => {}, () => {});
        }
      }, () => {});
    } catch (e) {}

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

    try {
      supabase.from('purchase_orders').update({
        status: 'Received'
      }).eq('id', poId).then(() => {}, () => {});
    } catch (e) {}
  };

  const updatePurchaseOrder = (id: string, updatedData: Partial<PurchaseOrder>) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, ...updatedData } : po))
    );

    try {
      const mapped: any = {};
      if (updatedData.status !== undefined) mapped.status = updatedData.status;
      if (updatedData.notes !== undefined) mapped.notes = updatedData.notes;
      if (updatedData.totalAmount !== undefined) mapped.total_amount = updatedData.totalAmount;
      if (updatedData.items !== undefined) mapped.raw_items = updatedData.items;

      supabase.from('purchase_orders').update(mapped).eq('id', id).then(() => {}, () => {});
    } catch (e) {}
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));

    try {
      supabase.from('purchase_order_items').delete().eq('purchase_id', id).then(() => {}, () => {});
      supabase.from('purchase_orders').delete().eq('id', id).then(() => {}, () => {});
    } catch (e) {}
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

    // Supabase Cloud Synchronization
    try {
      supabase.from('direct_purchases').upsert({
        id: newEntry.id,
        invoice_number: newEntry.invoiceNumber,
        supplier_name: newEntry.supplierName,
        seller: newEntry.supplierName,
        date: newEntry.date,
        warehouse_id: newEntry.warehouseId,
        warehouse_name: newEntry.warehouseName || 'Gudang Utama Tokyo',
        total_amount: newEntry.totalAmount,
        total_cost: newEntry.totalAmount,
        status: newEntry.status,
        payment_status: newEntry.paymentStatus || 'LUNAS',
        payment_method: newEntry.paymentMethod || 'CASH',
        notes: newEntry.notes || '',
        raw_items: newEntry.items
      }).then(() => {}, () => {});
    } catch (e) {}

    return newEntry;
  };

  const updateDirectPurchase = (id: string, updatedData: Partial<DirectPurchaseEntry>) => {
    setDirectPurchases((prev) =>
      prev.map((dp) => (dp.id === id ? { ...dp, ...updatedData } : dp))
    );

    try {
      const mapped: any = {};
      if (updatedData.status !== undefined) mapped.status = updatedData.status;
      if (updatedData.paymentStatus !== undefined) mapped.payment_status = updatedData.paymentStatus;
      if (updatedData.notes !== undefined) mapped.notes = updatedData.notes;
      if (updatedData.items !== undefined) mapped.raw_items = updatedData.items;

      supabase.from('direct_purchases').update(mapped).eq('id', id).then(() => {}, () => {});
    } catch (e) {}
  };

  const deleteDirectPurchase = (id: string) => {
    setDirectPurchases((prev) => prev.filter((dp) => dp.id !== id));

    try {
      supabase.from('direct_purchases').delete().eq('id', id).then(() => {}, () => {});
    } catch (e) {}
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

    // Also sync to customer user orders history (strictly tagged with userId & accountName)
    try {
      localStorage.removeItem(LEGACY_USER_ORDERS_STORAGE_KEY);
      const existingUserOrders = JSON.parse(localStorage.getItem(USER_ORDERS_STORAGE_KEY) || '[]');
      const userOrderSummary = {
        id: newOrder.id,
        orderId: newOrder.id,
        userId: newOrder.userId || (newOrder as any).userId,
        accountName: newOrder.accountName || (newOrder as any).accountName || newOrder.customerName,
        accountPhone: newOrder.accountPhone || (newOrder as any).accountPhone || newOrder.phone,
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
      localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(filteredUserOrders));
    } catch (e) {}

    // Update customer CRM stats (totalOrders, totalSpent, lastOrderDate)
    setCustomers((prev) => {
      const custPhone = (newOrder as any).phone || (newOrder as any).customerPhone;
      const custName = newOrder.customerName;
      let matched = false;
      const updated = prev.map((c) => {
        const isPhoneMatch = custPhone && c.phone && (c.phone.replace(/\D/g, '').includes(custPhone.replace(/\D/g, '')) || custPhone.replace(/\D/g, '').includes(c.phone.replace(/\D/g, '')));
        const isNameMatch = custName && c.name && c.name.trim().toLowerCase() === custName.trim().toLowerCase();
        if (isPhoneMatch || isNameMatch) {
          matched = true;
          return {
            ...c,
            totalOrders: (c.totalOrders || 0) + 1,
            totalSpent: (c.totalSpent || 0) + (newOrder.totalAmount || 0),
            lastOrderDate: newOrder.date
          };
        }
        return c;
      });
      return updated;
    });

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
        customer_name: newOrder.customerName || 'Pelanggan',
        customer_phone: newOrder.phone || '',
        customer_email: newOrder.userEmail || '',
        notes: formatOrderOwnerNotes(newOrder.userId, newOrder.accountName || newOrder.customerName),
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
    const targetOrder = orders.find((o) => o.id === orderId);

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
      const existingUserOrders = JSON.parse(localStorage.getItem(USER_ORDERS_STORAGE_KEY) || '[]');
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
      localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(updatedUserOrders));
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

    // Kirim Notifikasi WhatsApp Gateway jika pesanan Sampai di Lokasi / Selesai
    if (status === 'Selesai' && targetOrder) {
      sendOrderDeliveredWhatsApp({
        ...targetOrder,
        status: 'Selesai',
        trackingNumber: trackingNumber || targetOrder.trackingNumber,
        courier: courier || targetOrder.courier
      }).catch((err) => {
        console.warn('[WA Gateway] Gagal kirim WA pesanan selesai:', err);
      });
    }
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Restore stock & decrement customer CRM stats if not already cancelled
    if (targetOrder.status !== 'Dibatalkan') {
      if (targetOrder.items && Array.isArray(targetOrder.items)) {
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

      setCustomers((prev) => {
        const custPhone = (targetOrder as any).phone || (targetOrder as any).customerPhone;
        const custName = targetOrder.customerName;
        return prev.map((c) => {
          const isPhoneMatch =
            custPhone &&
            c.phone &&
            (c.phone.replace(/\D/g, '').includes(custPhone.replace(/\D/g, '')) ||
              custPhone.replace(/\D/g, '').includes(c.phone.replace(/\D/g, '')));
          const isNameMatch = custName && c.name && c.name.trim().toLowerCase() === custName.trim().toLowerCase();
          if (isPhoneMatch || isNameMatch) {
            return {
              ...c,
              totalOrders: Math.max(0, (c.totalOrders || 0) - 1),
              totalSpent: Math.max(0, (c.totalSpent || 0) - (targetOrder.totalAmount || 0))
            };
          }
          return c;
        });
      });
    }

    updateOrderStatus(orderId, 'Dibatalkan');
  };

  const deleteOrder = async (orderId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const deletedOrderIds: string[] = JSON.parse(localStorage.getItem('sn_deleted_order_ids') || '[]');
      if (!deletedOrderIds.includes(orderId)) {
        deletedOrderIds.push(orderId);
        localStorage.setItem('sn_deleted_order_ids', JSON.stringify(deletedOrderIds));
      }
      sessionStorage.removeItem('sn_cloud_orders_sync_ts');
    } catch (e) {}

    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try {
        localStorage.setItem('sn_admin_orders_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const existingUserOrders = JSON.parse(localStorage.getItem(USER_ORDERS_STORAGE_KEY) || '[]');
      const filteredUserOrders = existingUserOrders.filter(
        (ord: any) => ord.id !== orderId && ord.orderId !== orderId
      );
      localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(filteredUserOrders));
      localStorage.removeItem(LEGACY_USER_ORDERS_STORAGE_KEY);
    } catch (e) {}

    try {
      await supabase.from('order_items').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gagal menghapus pesanan dari database cloud.' };
    }

    return { success: true };
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

  const addCustomer = (customerData: Omit<CustomerCRM, 'id' | 'registeredDate'> & { id?: string }): CustomerCRM => {
    const custId = customerData.id || ('SN-' + Math.floor(100000 + Math.random() * 900000));
    const newCust: CustomerCRM = {
      ...customerData,
      id: custId,
      registeredDate: new Date().toISOString().substring(0, 10),
      totalOrders: customerData.totalOrders ?? 0,
      totalSpent: customerData.totalSpent ?? 0,
      loyaltyPoints: 0,
      tier: customerData.tier ?? 'Bronze',
      preferredLanguage: customerData.preferredLanguage ?? 'ID'
    };
    delete (newCust as any).email;

    setCustomers((prev) => {
      const cleanPhone = (newCust.phone || '').replace(/\D/g, '');
      const existingIdx = prev.findIndex((c) => 
        c.id.toLowerCase() === newCust.id.toLowerCase() || 
        (cleanPhone.length >= 7 && (c.phone || '').replace(/\D/g, '') === cleanPhone)
      );

      let updatedList: CustomerCRM[];
      if (existingIdx >= 0) {
        updatedList = [...prev];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          ...newCust,
          id: updatedList[existingIdx].id // Keep original ID
        };
      } else {
        updatedList = [newCust, ...prev];
      }

      try {
        localStorage.setItem('sn_customers_v1', JSON.stringify(updatedList));
      } catch (e) {}

      return updatedList;
    });

    try {
      const deletedCustomerIds: string[] = JSON.parse(localStorage.getItem('sn_deleted_customer_ids') || '[]');
      if (deletedCustomerIds.includes(newCust.id)) {
        localStorage.setItem(
          'sn_deleted_customer_ids',
          JSON.stringify(deletedCustomerIds.filter((id) => id !== newCust.id))
        );
      }
      sessionStorage.removeItem('sn_cloud_admin_sync_ts');
    } catch (e) {}

    try {
      supabase.from('customers').upsert({
        id: newCust.id,
        name: newCust.name,
        phone: newCust.phone || null,
        city: newCust.city || 'Tokyo',
        address: newCust.address || null,
        postal_code: newCust.postalCode || null,
        prefecture: newCust.prefecture || null,
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

  const deleteCustomer = async (customerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const deletedCustomerIds: string[] = JSON.parse(localStorage.getItem('sn_deleted_customer_ids') || '[]');
      if (!deletedCustomerIds.includes(customerId)) {
        deletedCustomerIds.push(customerId);
        localStorage.setItem('sn_deleted_customer_ids', JSON.stringify(deletedCustomerIds));
      }
      localStorage.removeItem(`sn_user_custom_pass_${customerId}`);
      sessionStorage.removeItem('sn_cloud_admin_sync_ts');
    } catch (e) {}

    setCustomers((prev) => {
      const updated = prev.filter((c) => c.id !== customerId);
      try {
        localStorage.setItem('sn_customers_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) {
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gagal menghapus pelanggan dari database cloud.' };
    }

    return { success: true };
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
      const safeImage = product.image && !product.image.startsWith('data:') ? product.image : '/placeholder-upload.svg';
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
        image: safeImage,
        is_halal: product.isHalal ?? true,
        is_frozen: product.isFrozen ?? false,
        barcode: product.barcode || null,
        description: product.description || ''
      }).then(() => {}, () => {});
    } catch (e) {}
  };

  const updateProduct = async (
    id: string,
    updatedData: Partial<Product>
  ): Promise<{ success: boolean; error?: string }> => {
    let targetProduct: Product | undefined;
    setProducts((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === id || (p.sku && p.sku === id)) {
          targetProduct = { ...p, ...updatedData };
          return targetProduct;
        }
        return p;
      });

      // Synchronize immediately to persistent LocalStorage
      try {
        localStorage.setItem('sn_products_v8', JSON.stringify(updatedList));
        sessionStorage.setItem('sn_cloud_products_sync_ts', String(Date.now()));
      } catch (err) {}

      return updatedList;
    });

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
      if (updatedData.image !== undefined && !updatedData.image.startsWith('data:')) mapped.image = updatedData.image;
      if (updatedData.isHalal !== undefined) mapped.is_halal = updatedData.isHalal;
      if (updatedData.isFrozen !== undefined) mapped.is_frozen = updatedData.isFrozen;
      if (updatedData.barcode !== undefined) mapped.barcode = updatedData.barcode;
      if (updatedData.description !== undefined) mapped.description = updatedData.description;

      // 1. Try update by id or sku in Supabase (only select('id') to minimize egress response size)
      const targetId = targetProduct?.id || id;
      const targetSku = targetProduct?.sku || id;
      const { data, error } = await supabase
        .from('products')
        .update(mapped)
        .or(`id.eq.${targetId},sku.eq.${targetSku}`)
        .select('id');

      // 2. If row did not exist yet in Supabase products table, upsert full product record
      if ((error || !data || data.length === 0) && targetProduct) {
        const prod = targetProduct as Product;
        const safeImg = prod.image && !prod.image.startsWith('data:') ? prod.image : '/placeholder-upload.svg';
        const { error: upsertErr } = await supabase.from('products').upsert({
          id: prod.id,
          sku: prod.sku || prod.id,
          name: prod.name,
          name_jp: prod.nameJp || prod.name,
          name_en: prod.nameEn || prod.name,
          category: prod.category,
          price: prod.price || 0,
          cost_price: prod.costPrice || 0,
          stock: prod.stock || 0,
          unit: prod.unit || 'pcs',
          image: safeImg,
          is_halal: prod.isHalal ?? true,
          is_frozen: prod.isFrozen ?? false,
          barcode: prod.barcode || null,
          description: prod.description || '',
          ...mapped
        });

        if (upsertErr) {
          console.warn('[AdminContext] Supabase upsert notice:', upsertErr.message);
          return { success: false, error: upsertErr.message };
        }
      }

      if (error) {
        console.warn('[AdminContext] Supabase update notice:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      console.warn('[AdminContext] Network/Supabase update exception:', e);
      return { success: false, error: e?.message || 'Gagal sinkron ke Supabase' };
    }
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
    localStorage.removeItem(LEGACY_USER_ORDERS_STORAGE_KEY);
    localStorage.removeItem(USER_ORDERS_STORAGE_KEY);
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
        deletePOSTransaction,
        createPurchaseOrder,
        receivePurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        deleteOrder,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addCustomer,
        deleteCustomer,
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
