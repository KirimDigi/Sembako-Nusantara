import { Product, CartItem } from '../types';

export interface CrossSellItem {
  product: Product;
  badge: {
    ID: string;
    JP: string;
    EN: string;
  };
  reason: {
    ID: string;
    JP: string;
    EN: string;
  };
}

/**
 * Intelligent Cross-Selling recommendation engine for online checkout.
 * Analyzes items currently in customer's cart and recommends the most relevant
 * complementary products (e.g. Eggs & Sambal & alternate flavors when buying noodles,
 * Santan & Bawang when buying bumbu, Snacks & Milk when buying beverages, etc.)
 */
export function getCrossSellRecommendations(
  cart: CartItem[],
  allProducts: Product[]
): CrossSellItem[] {
  if (!cart || cart.length === 0 || !allProducts || allProducts.length === 0) {
    return [];
  }

  const cartProductIds = new Set(cart.map((item) => item.product.id));
  const cartNames = cart.map((item) => item.product.name.toLowerCase());
  const cartCategories = cart.map((item) => (item.product.category || '').toLowerCase());

  // Detect contents in cart
  const hasNoodles = cart.some(
    (item) =>
      item.product.category === 'Mie & Bihun' ||
      /mie|indomie|sedaap|bihun|gaga|ramen|noodle/i.test(item.product.name)
  );

  const hasSauces = cart.some(
    (item) =>
      item.product.category === 'Saus & Sambal' ||
      /sambal|saus|sauce|kecap/i.test(item.product.name)
  );

  const hasBumbu = cart.some(
    (item) =>
      item.product.category === 'Bumbu Instan' ||
      item.product.category === 'Bumbu Masak' ||
      item.product.category === 'MSG & Kaldu Bubuk' ||
      /bamboe|racik|royco|masako|bumbu/i.test(item.product.name)
  );

  const hasBeverages = cart.some(
    (item) =>
      item.product.category === 'Minuman' ||
      /kopi|teh|coffee|tea|energen|good day|kapal api|sari wangi|marjan|milo/i.test(
        item.product.name
      )
  );

  const hasSnacks = cart.some(
    (item) =>
      item.product.category === 'Snack' ||
      /basreng|tictac|garuda|malkist|beng-beng|chocolatos/i.test(item.product.name)
  );

  // Available candidate pool (exclude items already in cart, must have price > 0 and active status)
  const available = allProducts.filter(
    (p) => !cartProductIds.has(p.id) && (p.priceTax > 0 || p.price > 0) && (p.status as string) !== 'INACTIVE'
  );

  const recommendations: CrossSellItem[] = [];
  const addedIds = new Set<string>();

  const pushRecommendation = (
    predicate: (p: Product) => boolean,
    badge: CrossSellItem['badge'],
    reason: CrossSellItem['reason']
  ) => {
    const found = available.find((p) => !addedIds.has(p.id) && predicate(p));
    if (found) {
      addedIds.add(found.id);
      recommendations.push({
        product: found,
        badge,
        reason
      });
    }
  };

  // ==========================================
  // SCENARIO 1: CUSTOMER BUYS NOODLES (MIE)
  // Cross-sell: Eggs, Hot Sambal, Other Noodle Variants, Crunchy Topping, Iced Tea
  // ==========================================
  if (hasNoodles) {
    // 1. Telur (Eggs - Fresh or Salted)
    pushRecommendation(
      (p) => /telur|egg/i.test(p.name) || /telur/i.test(p.description || ''),
      {
        ID: '🥚 Pasangan Pas Bikin Mie',
        JP: '🥚 ラーメンに最適な卵',
        EN: '🥚 Perfect Egg for Noodles'
      },
      {
        ID: 'Bikin mie kuah / goreng makin gurih dan bergizi',
        JP: '卵を落として濃厚で栄養満点の一杯に',
        EN: 'Add fresh egg for richer, delicious noodles'
      }
    );

    // 2. Sambal / Saus Pedas (Chili sauce)
    if (!hasSauces) {
      pushRecommendation(
        (p) =>
          p.category === 'Saus & Sambal' ||
          /sambal extra pedas|sambal asli|dua belibis|sambal uleg/i.test(p.name),
        {
          ID: '🌶️ Tambah Pedas Mantap',
          JP: '🌶️ ピリ辛アクセント',
          EN: '🌶️ Extra Spicy Kick'
        },
        {
          ID: 'Sensasi pedas nendang pelengkap makan mie',
          JP: '本場のチリソースでさらに刺激的な味わいへ',
          EN: 'Authentic Indonesian chili kick to elevate your meal'
        }
      );
    }

    // 3. Varian Mie Favorit Lain (Another popular noodle flavor)
    pushRecommendation(
      (p) =>
        (p.category === 'Mie & Bihun' || /indomie|sedaap|gaga/i.test(p.name)) &&
        !cartNames.some((c) => p.name.toLowerCase().includes(c) || c.includes(p.name.toLowerCase())),
      {
        ID: '🍜 Varian Mie Favorit Lain',
        JP: '🍜 他の人気ラーメン',
        EN: '🍜 Popular Noodle Variant'
      },
      {
        ID: 'Sering dibeli bersamaan untuk stok varian mie di rumah',
        JP: 'あわせて購入されている大人気フレーバー',
        EN: 'Frequently bought together to stock your pantry'
      }
    );

    // 4. Kriuk Renyah / Kerupuk / Basreng Topping
    pushRecommendation(
      (p) => /basreng|tictac|garuda atom/i.test(p.name),
      {
        ID: '🥢 Kriuk Renyah Pelengkap',
        JP: '🥢 サクサクトッピング',
        EN: '🥢 Crunchy Topping'
      },
      {
        ID: 'Makan mie makin asyik dengan topping renyah',
        JP: 'ラーメンと一緒に楽しむサクサク食感',
        EN: 'Crunchy snack pairing to accompany your bowl'
      }
    );

    // 5. Minuman Segar Pelepas Dahaga (Teh Botol Sosro, Teh Pucuk)
    if (!hasBeverages) {
      pushRecommendation(
        (p) => /teh botol|teh pucuk|nutrisari/i.test(p.name),
        {
          ID: '🥤 Minuman Segar Pendamping',
          JP: '🥤 食後の爽快ドリンク',
          EN: '🥤 Refreshing Drink'
        },
        {
          ID: 'Pelepas dahaga nikmat sehabis santap mie pedas',
          JP: '熱いラーメンの後にすっきり爽やかな一杯',
          EN: 'Cool down with a chilled authentic Indonesian drink'
        }
      );
    }
  }

  // ==========================================
  // SCENARIO 2: CUSTOMER BUYS BUMBU / COOKING SPICES
  // Cross-sell: Santan Kara, Aromatics (Bawang), Saus Tiram, Kecap, Kaldu
  // ==========================================
  if (hasBumbu && recommendations.length < 4) {
    // Santan Kara
    pushRecommendation(
      (p) => /santan/i.test(p.name),
      {
        ID: '🥥 Santan Gurih Masakan',
        JP: '🥥 ココナッツミルク',
        EN: '🥥 Rich Coconut Milk'
      },
      {
        ID: 'Kunci kuah gulai, opor & soto lebih medok dan gurih',
        JP: 'カレーや煮込み料理のコク出しに必須',
        EN: 'Essential for rich rendang, opor & curries'
      }
    );

    // Bawang Merah / Bawang Putih
    pushRecommendation(
      (p) => /bawang/i.test(p.name),
      {
        ID: '🧄 Bumbu Dapur Dasar',
        JP: '🧄 基本の香辛料',
        EN: '🧄 Cooking Aromatics'
      },
      {
        ID: 'Aroma sedap tak tergantikan untuk segala masakan',
        JP: 'どんな料理にも欠かせない基本の香味野菜',
        EN: 'Fresh aromatic foundation for everyday cooking'
      }
    );

    // Saus Tiram / Kecap Asin
    pushRecommendation(
      (p) => /saori|kecap/i.test(p.name),
      {
        ID: '🍳 Penyedap Serbaguna',
        JP: '🍳 万能調味料',
        EN: '🍳 Flavor Enhancer'
      },
      {
        ID: 'Bikin tumisan sayur dan daging seenak restoran',
        JP: '炒め物が本格的なプロの味に',
        EN: 'Restaurant-quality stir-fries in minutes'
      }
    );
  }

  // ==========================================
  // SCENARIO 3: CUSTOMER BUYS BEVERAGES (KOPI / TEH)
  // Cross-sell: Susu Kental Manis, Biskuit Malkist, Camilan Manis
  // ==========================================
  if (hasBeverages && recommendations.length < 4) {
    // Susu kental manis / creamer
    pushRecommendation(
      (p) => /dancow|indomilk|bear brand/i.test(p.name),
      {
        ID: '🥛 Campuran Kopi Creamy',
        JP: '🥛 ミルクトッピング',
        EN: '🥛 Creamy Milk Topping'
      },
      {
        ID: 'Racik kopi susu hangat khas warung kopi nusantara',
        JP: 'ミルクコーヒーやお茶にコクをプラス',
        EN: 'Create rich Indonesian cafe-style milk coffee'
      }
    );

    // Biskuit teman minum kopi
    pushRecommendation(
      (p) => /malkist|beng-beng|chocolatos/i.test(p.name),
      {
        ID: '🍪 Teman Santai Ngopi',
        JP: '🍪 ティータイムのおやつ',
        EN: '🍪 Snack for Tea/Coffee'
      },
      {
        ID: 'Camilan renyah teman celup kopi & teh hangat',
        JP: '温かいお茶やコーヒーと相性抜群のスイーツ',
        EN: 'Crunchy biscuit to dip in warm coffee or tea'
      }
    );
  }

  // ==========================================
  // SCENARIO 4: CUSTOMER BUYS SNACKS
  // Cross-sell: Teh Botol Sosro, Mie Goreng, Other Snacks
  // ==========================================
  if (hasSnacks && recommendations.length < 4) {
    pushRecommendation(
      (p) => /teh botol|teh kotak|teh pucuk/i.test(p.name),
      {
        ID: '🧃 Minuman Pendamping Ngemil',
        JP: '🧃 お供のさっぱりドリンク',
        EN: '🧃 Drink for Snacking'
      },
      {
        ID: 'Paling pas diteguk saat santai makan camilan',
        JP: 'おやつタイムにぴったりの清涼飲料',
        EN: 'Refreshing beverage to enjoy while snacking'
      }
    );
  }

  // ==========================================
  // SCENARIO 5: POPULAR FALLBACKS
  // Always ensure 3-4 attractive, popular cross-sell items are returned
  // ==========================================
  const fallbackKeywords = [
    {
      kw: /telur/i,
      badge: { ID: '🥚 Pilihan Sehat Bergizi', JP: '🥚 新鮮生卵', EN: '🥚 Fresh Eggs' },
      reason: {
        ID: 'Telur segar kualitas Jepang untuk sehari-hari',
        JP: '毎日の食卓に欠かせない新鮮卵',
        EN: 'Fresh Grade-A eggs for daily cooking'
      }
    },
    {
      kw: /indomie goreng/i,
      badge: { ID: '⭐ Produk Paling Laris', JP: '⭐ 当店ベストセラー', EN: '⭐ #1 Best Seller' },
      reason: {
        ID: 'Favorit sepanjang masa diaspora Indonesia di Jepang',
        JP: '在日インドネシア人コミュニティで圧倒的人気',
        EN: 'All-time favorite authentic instant noodles'
      }
    },
    {
      kw: /abc sambal extra pedas|dua belibis/i,
      badge: { ID: '🌶️ Sambal Meja Wajib', JP: '🌶️ 定番チリソース', EN: '🌶️ Must-Have Chili' },
      reason: {
        ID: 'Cocolan sedap untuk semua jenis gorengan & makanan',
        JP: '揚げ物や料理全般に使える本場の調味料',
        EN: 'Authentic hot dip for any Indonesian dish'
      }
    },
    {
      kw: /teh botol|teh pucuk/i,
      badge: { ID: '🥤 Minuman Nusantara', JP: '🥤 定番ジャスミン茶', EN: '🥤 Authentic Iced Tea' },
      reason: {
        ID: 'Rasa manis teh melati nostalgia tanah air',
        JP: 'インドネシアの定番ジャスミンティー',
        EN: 'Iconic Indonesian sweet jasmine tea'
      }
    },
    {
      kw: /santan kara/i,
      badge: { ID: '🥥 Santan Siap Pakai', JP: '🥥 定番ココナッツミルク', EN: '🥥 Instant Coconut Milk' },
      reason: {
        ID: 'Praktis untuk aneka masakan bersantan khas nusantara',
        JP: '本格的なインドネシア料理作りに欠かせない定番',
        EN: 'Ready-to-use coconut cream for curries and desserts'
      }
    },
    {
      kw: /basreng|tictac/i,
      badge: { ID: '✨ Camilan Gurih Favorit', JP: '✨ 定番サクサクスナック', EN: '✨ Popular Savory Snack' },
      reason: {
        ID: 'Camilan gurih teman nonton dan santai',
        JP: '一度食べたら止まらない香ばしいスナック',
        EN: 'Crunchy savory snack for leisure and breaks'
      }
    }
  ];

  for (const fb of fallbackKeywords) {
    if (recommendations.length >= 4) break;
    pushRecommendation((p) => fb.kw.test(p.name), fb.badge, fb.reason);
  }

  // If still fewer than 4 items, take remaining active candidates
  let idx = 0;
  while (recommendations.length < 4 && idx < available.length) {
    const candidate = available[idx];
    if (!addedIds.has(candidate.id)) {
      addedIds.add(candidate.id);
      recommendations.push({
        product: candidate,
        badge: {
          ID: '⭐ Rekomendasi Pilihan',
          JP: '⭐ おすすめ商品',
          EN: '⭐ Recommended For You'
        },
        reason: {
          ID: 'Sering dipesan bersamaan oleh pelanggan',
          JP: 'お客様にあわせて選ばれている人気アイテム',
          EN: 'Frequently chosen by customers like you'
        }
      });
    }
    idx++;
  }

  return recommendations.slice(0, 4);
}
