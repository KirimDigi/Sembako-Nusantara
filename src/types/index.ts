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
  paymentMethod?: string;
  taxAmount?: number;
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
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number; // e.g. 500 for ¥500 or 10 for 10%
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  usageCount: number;
  isActive: boolean;
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

