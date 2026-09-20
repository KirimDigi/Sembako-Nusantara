import { Recipe } from '../types';

export const RECIPES_DATA: Recipe[] = [
  {
    id: '1',
    title: 'Resep Rendang Sapi Empuk dengan Bumbu Asli di Jepang',
    titleJp: '日本で作る本格やわらか牛ルンダンのレシピ',
    titleEn: 'Tender Beef Rendang Recipe with Authentic Spices in Japan',
    cookingTime: '90 Menit',
    servings: '4-6 Porsi',
    difficulty: 'Sedang',
    difficultyJp: '中級',
    difficultyEn: 'Medium',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    description: 'Tips memasak rendang daging sapi lembut dengan bahan-bahan yang mudah didapatkan dari Sembako Nusantara dan supermarket lokal Jepang.',
    descriptionJp: 'Sembako Nusantaraや日本のスーパーで手に入る食材を使った、柔らかく美味しい本場ビーフルンダンの作り方。',
    descriptionEn: 'Tips for cooking tender beef rendang using ingredients easily available from Sembako Nusantara and local supermarkets in Japan.',
    ingredients: [
      '500g Daging Sapi Halal',
      '1 Sachet Bumbu Rendang Indofood',
      '2 Pack Santan Kara UHT 200ml',
      '3 Lembar Daun Jeruk & 1 Batang Serai',
      '300ml Air Bersih'
    ],
    ingredientsJp: [
      'ハラール牛肉 500g',
      'Indofood ルンダンの素 1袋',
      'Kara ココナッツミルクパック 200ml x 2個',
      'こぶみかんの葉 3枚 & レモングラス 1本',
      '水 300ml'
    ],
    ingredientsEn: [
      '500g Halal Beef',
      '1 Sachet Indofood Rendang Seasoning',
      '2 Packs Kara Coconut Milk 200ml',
      '3 Kaffir Lime Leaves & 1 Lemongrass Stalk',
      '300ml Clean Water'
    ],
    steps: [
      'Potong daging sapi sesuai selera searah serat.',
      'Tumis bumbu rendang bersama serai dan daun jeruk hingga harum semerbak.',
      'Masukkan potongan daging sapi, aduk hingga berubah warna.',
      'Tuangkan santan Kara dan air, masak dengan api sedang hingga mendidih.',
      'Kecilkan api, ungkep selama 1-1.5 jam sambil sesekali diaduk hingga kuah menyusut dan berminyak kecokelatan.'
    ],
    stepsJp: [
      '牛肉を繊維に沿って食べやすい大きさに切ります。',
      'フライパンでルンダンの素、レモングラス、こぶみかんの葉を香りが立つまで炒めます。',
      '牛肉を加え、表面の色が変わるまで炒め合わせます。',
      'ココナッツミルクと水を注ぎ、中火で沸騰させます。',
      '弱火にし、時々かき混ぜながら1〜1.5時間煮込み、汁気がなくなって油が浮き茶色くなるまで仕上げます。'
    ],
    stepsEn: [
      'Cut the beef along the grain into bite-sized chunks.',
      'Sauté rendang paste with lemongrass and kaffir lime leaves until fragrant.',
      'Add the beef chunks and stir until browned.',
      'Pour in coconut milk and water, bringing it to a boil over medium heat.',
      'Reduce heat to low and simmer for 1-1.5 hours, stirring occasionally until sauce reduces and darkens with aromatic oil.'
    ],
    author: 'Chef Willy (Diaspora Tokyo)',
    date: '10 Sep 2026'
  },
  {
    id: '2',
    title: 'Bakso Kuah Gurih Komplit Spesial Musim Dingin Jepang',
    titleJp: '日本の冬にぴったり！熱々ハラール特製バッソスープ',
    titleEn: 'Savory Indonesian Meatball Soup (Bakso) for Japan Winter',
    cookingTime: '30 Menit',
    servings: '3-4 Porsi',
    difficulty: 'Mudah',
    difficultyJp: '簡単',
    difficultyEn: 'Easy',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    description: 'Sajian hangat bakso sapi kuah kaldu gurih dengan pelengkap bihun, sawi hijau, dan sambal rawit pedas uleg.',
    descriptionJp: '春雨、青菜、特製サンバルを添えた、冬の体を芯から温める熱々ハラール牛バッソ（肉団子）スープ。',
    descriptionEn: 'A comforting warm bowl of savory beef meatball soup with rice vermicelli, greens, and spicy bird-eye chili sambal.',
    ingredients: [
      '1 Bungkus Bakso Sapi Super Halal Frozen (500g)',
      '1 Bungkus Bihun Jagung',
      '5 Siung Bawang Putih cincang goreng',
      '1 Ikat Daun Bawang & Seledri cincang',
      'Sambal Rawit ABC & Kecap Manis Bango'
    ],
    ingredientsJp: [
      '冷凍ハラール特製牛バッソ 1袋 (500g)',
      'ビーフン 1袋',
      '刻み揚げニンニク 5片分',
      '刻み青ネギ＆セロリ 1束',
      'ABCサンバル＆Bango甘口醤油'
    ],
    ingredientsEn: [
      '1 Pack Frozen Halal Beef Meatballs (500g)',
      '1 Pack Corn Vermicelli',
      '5 Cloves Fried Minced Garlic',
      '1 Bunch Chopped Scallion & Celery',
      'ABC Chili Sambal & Bango Sweet Soy Sauce'
    ],
    steps: [
      'Rebus 1.5 liter air kaldu tulang sapi atau ayam hingga mendidih.',
      'Masukkan bawang putih goreng yang telah dihaluskan, garam, dan merica secukupnya.',
      'Masukkan butiran bakso frozen langsung ke dalam kuah mendidih hingga mengapung sempurna.',
      'Tata bihun rebus dan sawi di mangkuk, siram dengan kuah panas dan bakso.',
      'Sajikan bersama taburan daun bawang, bawang goreng, dan sambal pedas.'
    ],
    stepsJp: [
      '牛骨または鶏ガラスープ1.5リットルを鍋に入れて沸騰させます。',
      'つぶした揚げニンニク、塩、胡椒を適量加えて味を調えます。',
      '冷凍バッソを凍ったまま熱湯に入れ、完全に浮き上がるまで茹でます。',
      '器に茹でたビーフンと青菜を盛り、熱々のスープとバッソを注ぎます。',
      '刻みネギ、フライドエシャロット、お好みのサンバルを添えて完成です。'
    ],
    stepsEn: [
      'Boil 1.5 liters of beef or chicken broth.',
      'Add crushed fried garlic, salt, and white pepper to taste.',
      'Drop frozen meatballs directly into the boiling soup until they float to the surface.',
      'Arrange cooked vermicelli and greens in a bowl, ladle hot broth and meatballs on top.',
      'Garnish with chopped scallions, crispy shallots, and spicy sambal.'
    ],
    author: 'Siti Rahma (Kansai Diaspora)',
    date: '8 Sep 2026'
  }
];
