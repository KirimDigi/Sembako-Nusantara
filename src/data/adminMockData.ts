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

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'PT Indofood CBP Sukses Makmur (Importir Jepang)',
    contactPerson: 'Hendra Tan',
    email: 'japan-dist@indofood.co.jp',
    phone: '+81-3-3344-5566',
    address: 'Minato-ku, Tokyo',
    origin: 'Indonesia',
    leadTimeDays: 7,
    paymentTerms: 'Net 30 Days',
    rating: 4.9
  },
  {
    id: 'sup-2',
    name: 'CV Sumber Rempah Nusantara',
    contactPerson: 'Bambang Irawan',
    email: 'export@sumberrempah.id',
    phone: '+62-21-555-1234',
    address: 'Surabaya, Jawa Timur, Indonesia',
    origin: 'Indonesia',
    leadTimeDays: 14,
    paymentTerms: '50% DP / 50% On Arrival',
    rating: 4.7
  },
  {
    id: 'sup-3',
    name: 'Japan Halal Meat & Frozen Foods Co., Ltd.',
    contactPerson: 'Tariq Al-Yamani',
    email: 'order@japanhalalmeat.jp',
    phone: '+81-45-7788-9900',
    address: 'Yokohama, Kanagawa',
    origin: 'Japan',
    leadTimeDays: 2,
    paymentTerms: 'Net 14 Days',
    rating: 4.8
  },
  {
    id: 'sup-4',
    name: 'Kara Coconut Products Distributor JP',
    contactPerson: 'Yuki Takahashi',
    email: 'sales@karajapan.jp',
    phone: '+81-3-9988-7766',
    address: 'Koto-ku, Tokyo',
    origin: 'Other',
    leadTimeDays: 3,
    paymentTerms: 'COD / Bank Transfer',
    rating: 4.9
  }
];

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

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    code: 'INDONESIA500',
    title: 'Diskon Sambutan WNI di Jepang',
    description: 'Potongan langsung ¥500 untuk transaksi minimal ¥5.000',
    discountType: 'FIXED',
    discountValue: 500,
    minSpend: 5000,
    validUntil: '2026-12-31',
    usageCount: 0,
    isActive: true
  },
  {
    code: 'NUSANTARA10',
    title: 'Diskon Spesial Nusantara 10%',
    description: 'Diskon 10% maksimal ¥1.000 untuk belanja minimal ¥8.000',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minSpend: 8000,
    maxDiscount: 1000,
    validUntil: '2026-11-30',
    usageCount: 0,
    isActive: true
  },
  {
    code: 'FREESHIP7K',
    title: 'Voucher Subsidi Ekstra Ongkir',
    description: 'Potongan ongkir ¥300 untuk pembelian di atas ¥6.000',
    discountType: 'FIXED',
    discountValue: 300,
    minSpend: 6000,
    validUntil: '2026-12-31',
    usageCount: 0,
    isActive: true
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

export const INITIAL_POS_TRANSACTIONS: POSTransaction[] = [];

