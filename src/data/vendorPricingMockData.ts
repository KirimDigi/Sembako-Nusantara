import { VendorProductPriceComparison } from '../types';

export const INITIAL_VENDOR_LIST = [
  { id: 'v-1', name: 'PT Nusantara Direct Tokyo', city: 'Tokyo', contact: '+81-3-5890-1234', paymentTerms: 'Net 30' },
  { id: 'v-2', name: 'Kobe Halal Mart Import Co.', city: 'Kobe', contact: '+81-78-341-9087', paymentTerms: 'Net 14' },
  { id: 'v-3', name: 'Sagawa Global Food JP', city: 'Chiba', contact: '+81-43-221-5544', paymentTerms: 'COD / Transfer' },
  { id: 'v-4', name: 'Yokohama Indo Spices Ltd', city: 'Yokohama', contact: '+81-45-662-8811', paymentTerms: 'Net 30' },
  { id: 'v-5', name: 'Osaka Halal Supply Hub', city: 'Osaka', contact: '+81-6-6543-7722', paymentTerms: 'Net 21' },
  { id: 'v-6', name: 'Fukuoka Asian Wholesaler', city: 'Fukuoka', contact: '+81-92-411-3399', paymentTerms: 'Transfer H+3' },
  { id: 'v-7', name: 'Nagoya Halal Express', city: 'Nagoya', contact: '+81-52-789-6633', paymentTerms: 'Net 14' },
  { id: 'v-8', name: 'Hokkaido Asia Direct', city: 'Sapporo', contact: '+81-11-233-8822', paymentTerms: 'Net 30' }
];

export const INITIAL_VENDOR_COMPARISONS: VendorProductPriceComparison[] = [
  {
    id: 'vpc-1',
    productId: '1',
    productName: 'Indomie Mi Goreng Spesial',
    category: 'Mie Instan',
    unit: 'Dus (40 Pcs)',
    sellingPrice: 4800,
    trend: 'down',
    trendPercentage: -4.8,
    cheapestVendorId: 'v-1',
    potentialSavings: 300,
    vendors: [
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 2950,
        previousPrice: 3100,
        lastPurchasedDate: '2026-10-02',
        minOrderQty: '10 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2610-089',
        notes: 'Diskon volume pembelian di atas 20 dus'
      },
      {
        vendorId: 'v-2',
        vendorName: 'Kobe Halal Mart Import Co.',
        price: 3100,
        previousPrice: 3100,
        lastPurchasedDate: '2026-09-22',
        minOrderQty: '5 Dus',
        leadTimeDays: 2,
        invoiceNo: 'INV/KHM/2609-142',
        notes: 'Harga stabil'
      },
      {
        vendorId: 'v-3',
        vendorName: 'Sagawa Global Food JP',
        price: 3250,
        previousPrice: 3200,
        lastPurchasedDate: '2026-09-15',
        minOrderQty: '1 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/SGF/2609-005',
        notes: 'Minimal order rendah tapi harga lebih tinggi'
      }
    ]
  },
  {
    id: 'vpc-2',
    productId: '2',
    productName: 'Kecap Manis Bango 550ml',
    category: 'Bumbu & Sambal',
    unit: 'Dus (12 Botol)',
    sellingPrice: 7800,
    trend: 'up',
    trendPercentage: 5.2,
    cheapestVendorId: 'v-4',
    potentialSavings: 450,
    vendors: [
      {
        vendorId: 'v-4',
        vendorName: 'Yokohama Indo Spices Ltd',
        price: 4950,
        previousPrice: 4800,
        lastPurchasedDate: '2026-09-30',
        minOrderQty: '5 Dus',
        leadTimeDays: 2,
        invoiceNo: 'INV/YIS/2609-331',
        notes: 'Vendor dengan harga termurah saat ini'
      },
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 5200,
        previousPrice: 4900,
        lastPurchasedDate: '2026-09-28',
        minOrderQty: '10 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2609-844',
        notes: 'Kenaikan impor kedelai dari produsen Unilever'
      },
      {
        vendorId: 'v-5',
        vendorName: 'Osaka Halal Supply Hub',
        price: 5400,
        previousPrice: 5200,
        lastPurchasedDate: '2026-09-10',
        minOrderQty: '5 Dus',
        leadTimeDays: 3,
        invoiceNo: 'INV/OSH/2609-119',
        notes: 'Termasuk biaya packing bubble wrap tebal'
      }
    ]
  },
  {
    id: 'vpc-3',
    productId: '3',
    productName: 'Sambal Asli ABC 335ml',
    category: 'Bumbu & Sambal',
    unit: 'Dus (24 Botol)',
    sellingPrice: 9600,
    trend: 'down',
    trendPercentage: -6.5,
    cheapestVendorId: 'v-6',
    potentialSavings: 500,
    vendors: [
      {
        vendorId: 'v-6',
        vendorName: 'Fukuoka Asian Wholesaler',
        price: 5600,
        previousPrice: 6000,
        lastPurchasedDate: '2026-10-01',
        minOrderQty: '8 Dus',
        leadTimeDays: 3,
        invoiceNo: 'INV/FAW/2610-012',
        notes: 'Promo kontainer baru masuk pelabuhan Hakata'
      },
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 5900,
        previousPrice: 6000,
        lastPurchasedDate: '2026-09-25',
        minOrderQty: '5 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2609-771',
        notes: 'Stok ready di gudang Kanto'
      },
      {
        vendorId: 'v-3',
        vendorName: 'Sagawa Global Food JP',
        price: 6100,
        previousPrice: 6100,
        lastPurchasedDate: '2026-09-12',
        minOrderQty: '2 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/SGF/2609-328',
        notes: 'Paling fleksibel untuk order mendadak'
      }
    ]
  },
  {
    id: 'vpc-4',
    productId: '4',
    productName: 'Bakso Sapi Halal Frozen',
    category: 'Frozen Food',
    unit: 'Karton (20 Pack x 500g)',
    sellingPrice: 25000,
    trend: 'stable',
    trendPercentage: 0,
    cheapestVendorId: 'v-2',
    potentialSavings: 700,
    vendors: [
      {
        vendorId: 'v-2',
        vendorName: 'Kobe Halal Mart Import Co.',
        price: 18500,
        previousPrice: 18500,
        lastPurchasedDate: '2026-09-29',
        minOrderQty: '3 Karton',
        leadTimeDays: 2,
        invoiceNo: 'INV/KHM/2609-411',
        notes: 'Kualitas sertifikasi Halal MUI & Japan Halal Foundation'
      },
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 18900,
        previousPrice: 18900,
        lastPurchasedDate: '2026-09-20',
        minOrderQty: '5 Karton',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2609-652',
        notes: 'Pengiriman cold storage Sagawa Cool Express'
      },
      {
        vendorId: 'v-7',
        vendorName: 'Nagoya Halal Express',
        price: 19200,
        previousPrice: 19200,
        lastPurchasedDate: '2026-09-08',
        minOrderQty: '2 Karton',
        leadTimeDays: 2,
        invoiceNo: 'INV/NHE/2609-082',
        notes: 'Harga stabil selama 3 bulan terakhir'
      }
    ]
  },
  {
    id: 'vpc-5',
    productId: '5',
    productName: 'Teh Botol Sosro Kotak 250ml',
    category: 'Minuman',
    unit: 'Dus (24 Kotak)',
    sellingPrice: 3600,
    trend: 'stable',
    trendPercentage: 0,
    cheapestVendorId: 'v-1',
    potentialSavings: 200,
    vendors: [
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 2400,
        previousPrice: 2400,
        lastPurchasedDate: '2026-10-03',
        minOrderQty: '10 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2610-101',
        notes: 'Vendor distributor resmi Sosro di Kanto'
      },
      {
        vendorId: 'v-4',
        vendorName: 'Yokohama Indo Spices Ltd',
        price: 2480,
        previousPrice: 2480,
        lastPurchasedDate: '2026-09-19',
        minOrderQty: '5 Dus',
        leadTimeDays: 2,
        invoiceNo: 'INV/YIS/2609-188',
        notes: 'Harga konsisten'
      },
      {
        vendorId: 'v-5',
        vendorName: 'Osaka Halal Supply Hub',
        price: 2600,
        previousPrice: 2600,
        lastPurchasedDate: '2026-09-14',
        minOrderQty: '5 Dus',
        leadTimeDays: 3,
        invoiceNo: 'INV/OSH/2609-204',
        notes: 'Free ongkir Kansai jika gabung order lain'
      }
    ]
  },
  {
    id: 'vpc-6',
    productId: '6',
    productName: 'Santan Kelapa Kara 200ml',
    category: 'Sembako',
    unit: 'Dus (36 Pcs)',
    sellingPrice: 6200,
    trend: 'up',
    trendPercentage: 7.0,
    cheapestVendorId: 'v-1',
    potentialSavings: 450,
    vendors: [
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 3850,
        previousPrice: 3600,
        lastPurchasedDate: '2026-09-27',
        minOrderQty: '10 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2609-798',
        notes: 'Kenaikan ongkir freight kapal global'
      },
      {
        vendorId: 'v-2',
        vendorName: 'Kobe Halal Mart Import Co.',
        price: 4100,
        previousPrice: 3800,
        lastPurchasedDate: '2026-09-18',
        minOrderQty: '5 Dus',
        leadTimeDays: 2,
        invoiceNo: 'INV/KHM/2609-302',
        notes: 'Kenaikan dari pabrik Sambu Group'
      },
      {
        vendorId: 'v-3',
        vendorName: 'Sagawa Global Food JP',
        price: 4300,
        previousPrice: 4050,
        lastPurchasedDate: '2026-09-05',
        minOrderQty: '2 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/SGF/2609-112',
        notes: 'Stok terbatas'
      }
    ]
  },
  {
    id: 'vpc-7',
    productId: '7',
    productName: 'Beras Pandan Wangi Rojolele 5kg',
    category: 'Sembako',
    unit: 'Karton (4 Sak x 5kg = 20kg)',
    sellingPrice: 12500,
    trend: 'up',
    trendPercentage: 6.3,
    cheapestVendorId: 'v-5',
    potentialSavings: 800,
    vendors: [
      {
        vendorId: 'v-5',
        vendorName: 'Osaka Halal Supply Hub',
        price: 8400,
        previousPrice: 7900,
        lastPurchasedDate: '2026-09-26',
        minOrderQty: '5 Karton',
        leadTimeDays: 3,
        invoiceNo: 'INV/OSH/2609-399',
        notes: 'Beras impor regulasi MAFF Jepang'
      },
      {
        vendorId: 'v-2',
        vendorName: 'Kobe Halal Mart Import Co.',
        price: 8900,
        previousPrice: 8300,
        lastPurchasedDate: '2026-09-16',
        minOrderQty: '3 Karton',
        leadTimeDays: 2,
        invoiceNo: 'INV/KHM/2609-255',
        notes: 'Kualitas beras pulen wangi super'
      },
      {
        vendorId: 'v-7',
        vendorName: 'Nagoya Halal Express',
        price: 9200,
        previousPrice: 8700,
        lastPurchasedDate: '2026-09-02',
        minOrderQty: '2 Karton',
        leadTimeDays: 2,
        invoiceNo: 'INV/NHE/2609-014',
        notes: 'Biaya kirim logistik sedikit lebih tinggi'
      }
    ]
  },
  {
    id: 'vpc-8',
    productId: '8',
    productName: 'Bumbu Racik Indofood Ayam Goreng',
    category: 'Bumbu & Sambal',
    unit: 'Box (120 Sachet)',
    sellingPrice: 7200,
    trend: 'stable',
    trendPercentage: 0,
    cheapestVendorId: 'v-4',
    potentialSavings: 350,
    vendors: [
      {
        vendorId: 'v-4',
        vendorName: 'Yokohama Indo Spices Ltd',
        price: 4600,
        previousPrice: 4600,
        lastPurchasedDate: '2026-10-01',
        minOrderQty: '3 Box',
        leadTimeDays: 2,
        invoiceNo: 'INV/YIS/2610-004',
        notes: 'Expired date panjang (18 bulan)'
      },
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 4800,
        previousPrice: 4800,
        lastPurchasedDate: '2026-09-24',
        minOrderQty: '5 Box',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2609-712',
        notes: 'Selalu ready stock'
      },
      {
        vendorId: 'v-6',
        vendorName: 'Fukuoka Asian Wholesaler',
        price: 4950,
        previousPrice: 4950,
        lastPurchasedDate: '2026-09-11',
        minOrderQty: '2 Box',
        leadTimeDays: 3,
        invoiceNo: 'INV/FAW/2609-178',
        notes: 'Harga stabil'
      }
    ]
  },
  {
    id: 'vpc-9',
    productId: '9',
    productName: 'Kopi Kapal Api Spesial Mix',
    category: 'Minuman',
    unit: 'Dus (100 Sachet)',
    sellingPrice: 3800,
    trend: 'down',
    trendPercentage: -4.0,
    cheapestVendorId: 'v-3',
    potentialSavings: 150,
    vendors: [
      {
        vendorId: 'v-3',
        vendorName: 'Sagawa Global Food JP',
        price: 2400,
        previousPrice: 2500,
        lastPurchasedDate: '2026-09-29',
        minOrderQty: '5 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/SGF/2609-441',
        notes: 'Diskon promo akhir bulan'
      },
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 2500,
        previousPrice: 2500,
        lastPurchasedDate: '2026-09-21',
        minOrderQty: '10 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2609-688',
        notes: 'Harga distributor'
      },
      {
        vendorId: 'v-4',
        vendorName: 'Yokohama Indo Spices Ltd',
        price: 2550,
        previousPrice: 2600,
        lastPurchasedDate: '2026-09-13',
        minOrderQty: '3 Dus',
        leadTimeDays: 2,
        invoiceNo: 'INV/YIS/2609-142',
        notes: 'Kondisi barang mulus'
      }
    ]
  },
  {
    id: 'vpc-10',
    productId: '10',
    productName: 'Kerupuk Udang Finna Mentah 500g',
    category: 'Snack & Kerupuk',
    unit: 'Dus (20 Pack = 10kg)',
    sellingPrice: 11000,
    trend: 'down',
    trendPercentage: -5.6,
    cheapestVendorId: 'v-1',
    potentialSavings: 600,
    vendors: [
      {
        vendorId: 'v-1',
        vendorName: 'PT Nusantara Direct Tokyo',
        price: 6800,
        previousPrice: 7200,
        lastPurchasedDate: '2026-10-02',
        minOrderQty: '5 Dus',
        leadTimeDays: 1,
        invoiceNo: 'INV/NDT/2610-044',
        notes: 'Diskon langsung dari importir Jawa Timur'
      },
      {
        vendorId: 'v-2',
        vendorName: 'Kobe Halal Mart Import Co.',
        price: 7100,
        previousPrice: 7100,
        lastPurchasedDate: '2026-09-23',
        minOrderQty: '3 Dus',
        leadTimeDays: 2,
        invoiceNo: 'INV/KHM/2609-389',
        notes: 'Stok aman'
      },
      {
        vendorId: 'v-8',
        vendorName: 'Hokkaido Asia Direct',
        price: 7400,
        previousPrice: 7500,
        lastPurchasedDate: '2026-09-15',
        minOrderQty: '2 Dus',
        leadTimeDays: 4,
        invoiceNo: 'INV/HAD/2609-021',
        notes: 'Ongkir Hokkaido sedikit lebih lama'
      }
    ]
  }
];
