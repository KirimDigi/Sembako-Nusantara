import {
  Warehouse,
  Supplier,
  PurchaseOrder,
  CompetitorPrice,
  CustomerCRM,
  Voucher,
  StockMovement,
  POSTransaction,
  ItemDiscount,
  ProductPromo,
  WholesalePriceTier
} from '../types';

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-tokyo',
    name: 'Toko & Gudang Utama Tokyo (Nishikamata)',
    nameJp: '東京本店・中央倉庫 (西蒲田)',
    code: 'TYO-01',
    location: '〒144-0051 東京都大田区西蒲田5丁目9-16 (Tokyo, Ota-ku, Nishikamata 5-9-16)',
    isMain: true,
    contactPerson: 'Willy Pratama (+81-80-1122-3344)'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [];

export const INITIAL_COMPETITOR_PRICES: CompetitorPrice[] = [
  {
    id: 'comp-1',
    productId: '1',
    productName: 'Indomie Mi Goreng Spesial (Dus / 40 Pcs)',
    ourPrice: 4800,
    competitors: [
      {
        name: 'Mogu Mogu Japan (Okayama)',
        price: 5200,
        url: 'https://mogumogujapan.com',
        lastChecked: '2026-09-19'
      },
      {
        name: 'Tokyo Halal Corner (Okubo)',
        price: 5000,
        lastChecked: '2026-09-18'
      },
      {
        name: 'Asia Supermarket Shin-Okubo',
        price: 5300,
        lastChecked: '2026-09-17'
      }
    ],
    priceDifferencePercentage: -7.7,
    recommendation: 'Cheaper'
  },
  {
    id: 'comp-2',
    productId: '2',
    productName: 'Kecap Manis Bango 550ml',
    ourPrice: 650,
    competitors: [
      {
        name: 'Mogu Mogu Japan (Okayama)',
        price: 720,
        url: 'https://mogumogujapan.com',
        lastChecked: '2026-09-19'
      },
      {
        name: 'Rakuten Asia Food Shop',
        price: 750,
        lastChecked: '2026-09-15'
      }
    ],
    priceDifferencePercentage: -9.7,
    recommendation: 'Cheaper'
  },
  {
    id: 'comp-3',
    productId: '5',
    productName: 'Bakso Sapi Halal Frozen (500g)',
    ourPrice: 1250,
    competitors: [
      {
        name: 'Mogu Mogu Japan (Okayama)',
        price: 1200,
        url: 'https://mogumogujapan.com',
        lastChecked: '2026-09-19'
      },
      {
        name: 'Shin-Okubo Halal Food',
        price: 1300,
        lastChecked: '2026-09-16'
      }
    ],
    priceDifferencePercentage: 4.1,
    recommendation: 'Adjust Recommended'
  },
  {
    id: 'comp-4',
    productId: '7',
    productName: 'Teh Botol Sosro Kotak (250ml x 6 Pcs)',
    ourPrice: 900,
    competitors: [
      {
        name: 'Mogu Mogu Japan (Okayama)',
        price: 980,
        url: 'https://mogumogujapan.com',
        lastChecked: '2026-09-19'
      },
      {
        name: 'Amazon JP (Third Party)',
        price: 1100,
        lastChecked: '2026-09-18'
      }
    ],
    priceDifferencePercentage: -8.1,
    recommendation: 'Cheaper'
  }
];

export const INITIAL_CUSTOMERS: CustomerCRM[] = [
  {
    id: 'cust-1',
    name: 'Willy Pratama',
    phone: '+81 80-1122-3344',
    postalCode: '134-0088',
    prefecture: 'Tokyo-to (東京都)',
    city: 'Edogawa-ku',
    address: 'Nishi-Kasai 3-1-4, Mansion Sakura #302',
    password: '123456',
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    tier: 'Bronze',
    registeredDate: '2026-09-20',
    preferredLanguage: 'ID'
  },
  {
    id: 'cust-2',
    name: 'Siti Rahmawati',
    phone: '+81 80-2233-4455',
    postalCode: '542-0076',
    prefecture: 'Osaka-fu (大阪府)',
    city: 'Osaka (Namba)',
    address: 'Namba 1-2-3, Green Heights #401',
    password: '123456',
    totalOrders: 3,
    totalSpent: 18500,
    loyaltyPoints: 0,
    tier: 'Silver',
    registeredDate: '2026-09-22',
    lastOrderDate: '2026-10-24 16:45',
    preferredLanguage: 'ID'
  },
  {
    id: 'cust-3',
    name: 'Budi Santoso',
    phone: '+81 90-5566-7788',
    postalCode: '460-0008',
    prefecture: 'Aichi-ken (愛知県)',
    city: 'Nagoya (Sakae)',
    address: 'Sakae 2-4-5, Sakae Tower #1202',
    password: '123456',
    totalOrders: 5,
    totalSpent: 42000,
    loyaltyPoints: 0,
    tier: 'Gold',
    registeredDate: '2026-09-25',
    lastOrderDate: '2026-10-26 13:20',
    preferredLanguage: 'ID'
  }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    code: 'NUSANTARA10',
    title: 'Diskon 10% Sahabat Diaspora',
    description: 'Diskon 10% untuk seluruh produk sembako halal (Min Belanja ¥3,000 / Rp 315.000)',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    currency: 'JPY',
    minSpend: 3000,
    maxDiscount: 1000,
    validUntil: '2026-12-31',
    usageCount: 14,
    isActive: true
  },
  {
    code: 'POTONGANYEN500',
    title: 'Potongan Langsung ¥500 (Yen)',
    description: 'Potongan langsung ¥500 untuk belanja apa saja di Sembako Nusantara Jepang',
    discountType: 'NOMINAL_JPY',
    discountValue: 500,
    currency: 'JPY',
    minSpend: 4500,
    validUntil: '2026-11-30',
    usageCount: 28,
    isActive: true
  },
  {
    code: 'DISKONIDR50K',
    title: 'Potongan Rp 50.000 (Rupiah IDR)',
    description: 'Kupon potongan nominal Rupiah IDR Rp 50.000 untuk pembayaran transfer QRIS/BCA',
    discountType: 'NOMINAL_IDR',
    discountValue: 50000,
    currency: 'IDR',
    minSpend: 300000,
    validUntil: '2026-12-31',
    usageCount: 19,
    isActive: true
  },
  {
    code: 'SUPERDIASPORA',
    title: 'Voucher Gajian Hemat 15%',
    description: 'Spesial tanggal gajian para kenshusei & pekerja migran di seluruh Jepang',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    currency: 'JPY',
    minSpend: 6000,
    maxDiscount: 1500,
    validUntil: '2026-12-31',
    usageCount: 42,
    isActive: true
  }
];

export const INITIAL_ITEM_DISCOUNTS: ItemDiscount[] = [];

export const INITIAL_PRODUCT_PROMOS: ProductPromo[] = [];

export const INITIAL_WHOLESALE_PRICES: WholesalePriceTier[] = [];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

export const INITIAL_POS_TRANSACTIONS: POSTransaction[] = [];


