import {
  Warehouse,
  Supplier,
  PurchaseOrder,
  CompetitorPrice,
  CustomerCRM,
  Voucher,
  StockMovement,
  POSTransaction
} from '../types';

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-tokyo',
    name: 'Gudang Utama Tokyo (Kanto Hub)',
    nameJp: '東京中央倉庫（関東拠点）',
    code: 'TYO-01',
    location: 'Edogawa-ku, Tokyo, Japan',
    isMain: true,
    contactPerson: 'Kenji / Budi (+81-3-5678-9012)'
  },
  {
    id: 'wh-osaka',
    name: 'Gudang Hub Osaka (Kansai Hub)',
    nameJp: '大阪配送センター（関西拠点）',
    code: 'OSA-02',
    location: 'Naniwa-ku, Osaka, Japan',
    isMain: false,
    contactPerson: 'Siti Rahma (+81-6-1234-5678)'
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
    email: 'willy.tokyo@gmail.com',
    phone: '+81-80-1122-3344',
    city: 'Tokyo (Edogawa)',
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    tier: 'Bronze',
    registeredDate: '2026-09-20',
    preferredLanguage: 'ID'
  }
];

export const INITIAL_VOUCHERS: Voucher[] = [];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

export const INITIAL_POS_TRANSACTIONS: POSTransaction[] = [];

