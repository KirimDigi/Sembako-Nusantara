export type Language = 'ID' | 'JP' | 'EN';

export interface Product {
  id: string;
  name: string;
  nameJp: string;
  nameEn: string;
  category: string;
  categoryJp: string;
  categoryEn: string;
  price: number;
  costPrice?: number;
  priceTax: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  isHalal: boolean;
  isFrozen?: boolean;
  stock: number;
  unit: string;
  unitJp: string;
  unitEn: string;
  discountPercentage?: number;
  description: string;
  descriptionJp: string;
  descriptionEn: string;
  ingredients?: string[];
  ingredientsJp?: string[];
  ingredientsEn?: string[];
  brand: string;
  sku?: string;
  barcode?: string;
  bulkPrices?: {
    tier1_qty?: number | string;
    tier1_price?: number;
    tier2_qty?: number | string;
    tier2_price?: number;
    tier3_qty?: number | string;
    tier3_price?: number;
  };
  status?: 'ACTIVE' | 'TBD';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  trackingNumber: string;
  courier: 'Yamato Transport' | 'Sagawa Express';
  date: string;
  status: 'Dikemas' | 'Diproses' | 'Selesai Packing' | 'Dikirim' | 'Selesai' | 'Dibatalkan';
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: string;
  customerName?: string;
  userId?: string;
  userEmail?: string;
  phone?: string;
  paymentMethod?: string;
  taxAmount?: number;
  currency?: 'JPY' | 'IDR';
  totalAmountIDR?: number;
}

export interface Recipe {
  id: string;
  title: string;
  titleJp: string;
  titleEn: string;
  cookingTime: string;
  servings: string;
  difficulty: 'Mudah' | 'Sedang' | 'Ahli';
  difficultyJp: string;
  difficultyEn: string;
  image: string;
  description: string;
  descriptionJp: string;
  descriptionEn: string;
  ingredients: string[];
  ingredientsJp: string[];
  ingredientsEn: string[];
  steps: string[];
  stepsJp: string[];
  stepsEn: string[];
  author: string;
  date: string;
}

// === PHASE 1 & 2: POS (Point of Sale) Types ===
export interface POSCartItem {
  product: Product;
  quantity: number;
  customDiscountPercent?: number;
}

export interface POSTransaction {
  id: string;
  receiptNumber: string;
  date: string;
  cashierName: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  subtotal: number;
  taxAmount: number; // 10% or 8%
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'PayPay' | 'JPQR / QRIS' | 'LINE Pay' | 'IC Card';
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  notes?: string;
  currency?: 'JPY' | 'IDR';
  exchangeRate?: number;
  amountPaidOriginal?: number;
  changeAmountOriginal?: number;
}

// === PHASE 1 & 3: Multi-Warehouse & Inventory Types ===
export interface Warehouse {
  id: string;
  name: string;
  nameJp: string;
  code: string;
  location: string;
  isMain: boolean;
  contactPerson: string;
}

export interface ProductStockPerWarehouse {
  productId: string;
  warehouseId: string;
  stock: number;
  minStockThreshold: number;
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'IN_PO' | 'OUT_POS' | 'OUT_ECOMMERCE' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  referenceNumber: string;
  notes: string;
}

// === PHASE 1 & 2: Supplier & Purchasing Types ===
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  origin: 'Indonesia' | 'Japan' | 'Other';
  leadTimeDays: number;
  paymentTerms: string;
  rating: number;
  isActive?: boolean;
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitCost: number; // in JPY
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  dateCreated: string;
  expectedDate: string;
  destinationWarehouseId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Partial' | 'Received' | 'Cancelled';
  notes?: string;
}

// === PHASE 2: Accounting, HPP & Tax Types ===
export interface ProductHPP {
  productId: string;
  productName: string;
  sellingPrice: number;
  costPrice: number; // HPP
  grossProfit: number;
  marginPercentage: number;
  taxRate: number; // 10% or 8%
}

export interface FinancialSummary {
  period: string;
  totalRevenue: number;
  totalHPP: number;
  grossProfit: number;
  grossProfitMargin: number;
  totalTaxCollected: number;
  totalOrdersCount: number;
  averageOrderValue: number;
}

// === PHASE 2: Competitor Pricing Types ===
export interface CompetitorPrice {
  id: string;
  productId: string;
  productName: string;
  ourPrice: number;
  competitors: {
    name: string; // e.g. 'Mogu Mogu Japan', 'Tokyo Halal Mart', 'Asia Market'
    price: number;
    url?: string;
    lastChecked: string;
  }[];
  priceDifferencePercentage: number; // negative means we are cheaper
  recommendation: 'Cheaper' | 'Competitive' | 'Higher' | 'Adjust Recommended';
}

// === PHASE 1 & 2: CRM, Customers & Vouchers ===
export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'VIP';

export interface CustomerCRM {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: LoyaltyTier;
  registeredDate: string;
  lastOrderDate?: string;
  preferredLanguage: Language;
}

export interface Voucher {
  code: string;
  title: string;
  description: string;
  discountType: 'FIXED' | 'PERCENTAGE' | 'NOMINAL_JPY' | 'NOMINAL_IDR';
  discountValue: number; // e.g. 500 for ¥500 or 10 for 10% or 50000 for Rp 50.000
  currency?: 'JPY' | 'IDR';
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  usageCount: number;
  isActive: boolean;
}

export interface ItemDiscount {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  originalPriceJPY: number;
  discountType: 'PERCENTAGE' | 'NOMINAL_JPY' | 'NOMINAL_IDR';
  discountValue: number; // e.g. 15 for 15%, 150 for ¥150, 15000 for Rp 15.000
  discountedPriceJPY: number;
  discountedPriceIDR: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes?: string;
}

export interface ProductPromo {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  promoTitle: string;
  promoType: 'BUY_X_GET_Y' | 'FLASH_SALE' | 'SPECIAL_BUNDLE' | 'CASHBACK_POINTS';
  currency: 'JPY' | 'IDR';
  promoPrice?: number; // e.g. special bundle or flash sale price
  buyQty?: number;     // e.g. Beli 5
  getQty?: number;     // e.g. Gratis 1
  freeItemName?: string;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes?: string;
}

export interface WholesalePriceTier {
  id: string;
  productId: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  regularPriceJPY: number;
  minQuantity: number; // e.g. 5, 10, 24, 40
  unit: string; // 'Pcs' | 'Pack' | 'Dus (Karton)' | 'Bal'
  wholesalePriceJPY: number;
  wholesalePriceIDR: number;
  savingsPercentage: number;
  isActive: boolean;
  notes?: string;
}

// === Roles & Access Control ===
export type UserRole = 'Super Admin (Owner)' | 'Kasir (POS)' | 'Admin Gudang' | 'Finance / Akuntan' | 'Customer';

export interface AuthUser {
  id: string; // 'id0926' or 'willy'
  name: string;
  role: UserRole;
  avatar?: string;
  loginAt: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
  tier?: string;
}

// === Vendor Price Comparison Types ===
export interface VendorPurchaseQuote {
  vendorId: string;
  vendorName: string;
  price: number; // e.g. ¥3200
  previousPrice?: number; // e.g. ¥3100
  lastPurchasedDate: string; // e.g. '2026-10-02'
  minOrderQty?: string; // e.g. '10 Dus'
  leadTimeDays?: number; // e.g. 2
  notes?: string;
  invoiceNo?: string;
}

export interface VendorProductPriceComparison {
  id: string;
  productId: string;
  productName: string;
  category: string;
  unit: string;
  sellingPrice: number; // our retail price on web/POS
  vendors: VendorPurchaseQuote[];
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number; // % change vs previous average purchase price
  cheapestVendorId: string;
  potentialSavings: number; // difference between highest and lowest vendor price
}

// === Cashier Management & Access Permissions ===
export interface CashierPermissionItem {
  id: string;
  label: string;
  description: string;
  category: 'operasional' | 'diskon_harga' | 'keuangan';
  enabled: boolean;
}

export interface CashierAccount {
  id: string;
  name: string;
  role: string;
  pin: string;
  status: 'Aktif' | 'Nonaktif';
  lastActive: string;
  shift: string;
  allowedPermissions?: string[];
}

// === Direct Purchase Transaction (Pembelian Masuk & Stok Terintegrasi) ===
export interface DirectPurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface DirectPurchaseEntry {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  warehouseId: string;
  warehouseName?: string;
  totalAmount: number;
  status: 'Diterima' | 'Draft';
  paymentStatus?: 'LUNAS' | 'TEMPO' | 'BELUM_BAYAR';
  paymentMethod?: 'TRANSFER_BANK' | 'CASH' | 'TEMPO';
  bankAccountId?: string;
  bankAccountName?: string;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
  items: DirectPurchaseItem[];
}

export interface ConnectedPrinterProfile {
  id: string;
  name: string;
  connectionType: 'browser_driver' | 'bluetooth' | 'usb_direct' | 'network_ip';
  paperWidth: number;
  rollDiameter: number;
  osTarget?: 'Windows' | 'Mac' | 'Semua Perangkat';
  isDefault?: boolean;
}

export interface ThermalPrinterSettings {
  printerName: string;
  connectionType: 'browser_driver' | 'bluetooth' | 'usb_direct' | 'network_ip';
  ipAddress?: string;
  paperWidth: number; // Lebar Kertas mm (Default: 57)
  rollDiameter: number; // Diameter Lingkaran mm (Default: 47)
  charPerLine: number; // default: 32
  fontSize: 'small' | 'normal' | 'large';
  autoCut: boolean;
  openCashDrawer: boolean;
  showLogo: boolean;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  footerNote: string;
  storePolicyNote: string;
  printCopies: number;
  autoPrintOnCheckout: boolean;
  savedPrinters?: ConnectedPrinterProfile[];
}

// === Stock Opname (Audit Fisik Inventori) Types ===
export interface StockOpnameSessionItem {
  productId: string;
  productName: string;
  sku?: string;
  category: string;
  systemStock: number;
  physicalStock: number;
  differenceQty: number; // physical - system
  costPrice: number;
  differenceValue: number; // differenceQty * costPrice
  notes: string;
}

export interface StockOpnameSession {
  id: string;
  sessionCode: string;
  date: string;
  officerName: string;
  totalItemsChecked: number;
  itemsWithDiscrepancy: number;
  totalDiscrepancyQty: number;
  totalDiscrepancyValue: number;
  status: 'Selesai' | 'Draft';
  notes?: string;
  items: StockOpnameSessionItem[];
}

