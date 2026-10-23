-- ====================================================================
-- SEMBAKO NUSANTARA JEPANG - COMPREHENSIVE SUPABASE SCHEMA & SEED DATA
-- Toko Sembako & Makanan Halal Indonesia di Jepang (47 Prefektur)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABLE: admin_accounts
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Super Admin (Owner)',
    email VARCHAR(100) DEFAULT 'admin@sembako-nusantara.jp',
    phone VARCHAR(50) DEFAULT '+81 80-1234-5678',
    avatar_url VARCHAR(255) DEFAULT '/avatar-jangsan.png',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read admin_accounts" ON public.admin_accounts;
CREATE POLICY "Allow anon read admin_accounts" ON public.admin_accounts FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Allow anon update last_login" ON public.admin_accounts;
CREATE POLICY "Allow anon update last_login" ON public.admin_accounts FOR UPDATE TO anon, authenticated USING (true);

INSERT INTO public.admin_accounts (id, password, name, role, email, phone, avatar_url, is_active)
VALUES
    ('id0926', 'admin123', 'Jangsan (Super Admin)', 'Super Admin (Owner)', 'admin@sembako-nusantara.jp', '+81 80-1234-5678', '/avatar-jangsan.png', true),
    ('willy', '112233', 'Willy Pratama', 'Super Admin (Owner)', 'willy@sembakonusantara.jp', '+81 80-1122-3344', '/avatar-jangsan.png', true)
ON CONFLICT (id) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url,
    is_active = true;

-- --------------------------------------------------------------------
-- 2. TABLE: products (179 SKUs dari SEMBAKO NUSANTARA LIST BARANG.xlsx)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_jp VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    original_price NUMERIC(10, 2),
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 50,
    min_stock INT NOT NULL DEFAULT 5,
    weight NUMERIC(10, 2),
    unit VARCHAR(100) NOT NULL DEFAULT 'pcs',
    image TEXT NOT NULL DEFAULT '/placeholder-upload.svg',
    is_halal BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    is_best_seller BOOLEAN NOT NULL DEFAULT FALSE,
    barcode VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated upsert products" ON public.products;
CREATE POLICY "Allow authenticated upsert products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- 3. SEED PRODUCTS (All 179 Products)
-- --------------------------------------------------------------------
INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0001',
    'SN-0001',
    'ABC Sambal Asli',
    'ABC サンバル・アスリ (チリソース)',
    'ABC Original Sambal Sauce',
    'Saus & Sambal',
    570,
    0,
    50,
    '295 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia ABC Sambal Asli (ABC). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0002',
    'SN-0002',
    'ABC Sambal Extra Pedas',
    'ABC サンバル・エクストラペダス (激辛チリソース)',
    'ABC Extra Hot Sambal Sauce',
    'Saus & Sambal',
    620,
    0,
    50,
    '395 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia ABC Sambal Extra Pedas (ABC). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0003',
    'SN-0003',
    'Sambel ABC Sachet',
    'ABC サンバル 小袋パック',
    'Sambal ABC Sachet',
    'Saus & Sambal',
    800,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambel ABC Sachet (ABC). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0004',
    'SN-0004',
    'Dua Belibis Sauce',
    'デュア・ブリビス サンバルチリソース',
    'Dua Belibis Sauce',
    'Saus & Sambal',
    670,
    0,
    50,
    '23 ml Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Dua Belibis Sauce (Dua Belibis). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0005',
    'SN-0005',
    'Saori saus Tiram',
    'サオリ オイスターソース',
    'Saori Oyster Sauce',
    'Saus & Sambal',
    140,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Saori saus Tiram (Ajinomoto). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0006',
    'SN-0006',
    'Saori Saus Tiram',
    'サオリ オイスターソース',
    'Saori Oyster Sauce',
    'Saus & Sambal',
    650,
    0,
    50,
    '133 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Saori Saus Tiram (Ajinomoto). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0007',
    'SN-0007',
    'Saori Teriyaki',
    'サオリ テリヤキソース',
    'Saori Teriyaki Sauce',
    'Saus & Sambal',
    650,
    0,
    50,
    '133 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Saori Teriyaki (Ajinomoto). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0008',
    'SN-0008',
    'Sambal Uleg Bawang',
    'サンバル・ウレッグ 赤わけぎチリ',
    'Sambal Uleg Shallot Chili Paste',
    'Saus & Sambal',
    950,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambal Uleg Bawang (Finna). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0009',
    'SN-0009',
    'Sambal Uleg Rawit',
    'サンバル・ウレッグ 激辛生唐辛子',
    'Sambal Uleg Bird Eye Chili Paste',
    'Saus & Sambal',
    950,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambal Uleg Rawit (Finna). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0010',
    'SN-0010',
    'Sambel Uleg Teri',
    'サンバル・ウレッグ 小魚(テリ)入り',
    'Sambal Uleg Anchovy Chili Paste',
    'Saus & Sambal',
    950,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambel Uleg Teri (Finna). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0011',
    'SN-0011',
    'Sambel Uleg Udang',
    'サンバル・ウレッグ エビ入り',
    'Sambal Uleg Shrimp Chili Paste',
    'Saus & Sambal',
    950,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambel Uleg Udang (Finna). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0012',
    'SN-0012',
    'Sambel Uleg Terasi',
    'サンバル・ウレッグ エビ発酵ペースト',
    'Sambal Uleg Shrimp Paste Chili',
    'Saus & Sambal',
    950,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambel Uleg Terasi (Finna). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0013',
    'SN-0013',
    'Sambel Uleg Rendang',
    'サンバル・ウレッグ ルンダン味',
    'Sambal Uleg Rendang Chili Paste',
    'Saus & Sambal',
    950,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambel Uleg Rendang (Finna). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0014',
    'SN-0014',
    'Sambel Uleg Ijo',
    'サンバル・ウレッグ 青唐辛子',
    'Sambal Uleg Green Chili Paste',
    'Saus & Sambal',
    950,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambel Uleg Ijo (Finna). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0015',
    'SN-0015',
    'Sambel Uleg Serbaguna',
    'サンバル・ウレッグ 万能チリソース',
    'Sambal Uleg All-Purpose Chili Paste',
    'Saus & Sambal',
    950,
    0,
    50,
    '10 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sambel Uleg Serbaguna (Finna). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0016',
    'SN-0016',
    'Indomie Goreng',
    'インドミー ミーゴレン (インドネシア風焼きそば)',
    'Indomie Fried Noodles',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Indomie Goreng (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0017',
    'SN-0017',
    'Indomie Aceh',
    'Indofood Indomie Aceh',
    'Indomie Aceh',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Indomie Aceh (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0018',
    'SN-0018',
    'Indomie Cabe Ijo',
    'インドミー 青唐辛子風味焼きそば',
    'Indomie Green Chili',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Indomie Cabe Ijo (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0019',
    'SN-0019',
    'Indomie Rendang',
    'インドミー ルンダン味 (牛煮込み風味)',
    'Indomie Rendang',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Indomie Rendang (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0020',
    'SN-0020',
    'Indomie Soto',
    'Indofood Indomie Soto',
    'Indomie Soto Soup',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Indomie Soto (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0021',
    'SN-0021',
    'Indomie Ayam Bawang',
    'インドミー アヤムバワン (チキンオニオン麺)',
    'Indomie Onion Chicken',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Indomie Ayam Bawang (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0022',
    'SN-0022',
    'Indomie Goreng Pedas',
    'インドミー ミーゴレン (インドネシア風焼きそば) Pedas',
    'Indomie Fried Noodles Pedas',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Indomie Goreng Pedas (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0023',
    'SN-0023',
    'Indomie Kari Ayam',
    'インドミー カリアヤム (チキンカレーラーメン)',
    'Indomie Chicken Curry',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Indomie Kari Ayam (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0024',
    'SN-0024',
    'Indomie Ayam Special',
    'Indofood Indomie Ayam Special',
    'Indomie Ayam Special',
    'Mie & Bihun',
    140,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Indomie Ayam Special (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0025',
    'SN-0025',
    'Sedaap Goreng',
    'ミースダップ ミーゴレン (カリカリ揚げ玉付)',
    'Sedaap Fried Noodles',
    'Mie & Bihun',
    180,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sedaap Goreng (Wings Food). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0026',
    'SN-0026',
    'Sedaap Soto',
    'ミースダップ ソトスープラーメン',
    'Sedaap Soto Soup',
    'Mie & Bihun',
    160,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sedaap Soto (Wings Food). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0027',
    'SN-0027',
    'Sedaap Korean Spicy Chicken',
    'Wings Food Sedaap Korean Spicy Chicken',
    'Sedaap Korean Spicy Chicken',
    'Mie & Bihun',
    160,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sedaap Korean Spicy Chicken (Wings Food). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0028',
    'SN-0028',
    'Sedaap Bakso',
    'Wings Food Sedaap Bakso',
    'Sedaap Bakso',
    'Mie & Bihun',
    160,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Sedaap Bakso (Wings Food). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0029',
    'SN-0029',
    'Indomie Ayam Geprek',
    'Indofood Indomie Ayam Geprek',
    'Indomie Ayam Geprek',
    'Mie & Bihun',
    0,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Indomie Ayam Geprek (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0030',
    'SN-0030',
    'Gaga Goreng Extra Pedas',
    'Jakarana Tama Gaga Goreng Extra Pedas',
    'Gaga Fried Noodles Extra Pedas',
    'Mie & Bihun',
    170,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Gaga Goreng Extra Pedas (Jakarana Tama). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0031',
    'SN-0031',
    'Gaga Jalapeno',
    'Jakarana Tama Gaga Jalapeno',
    'Gaga Jalapeno',
    'Mie & Bihun',
    170,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Gaga Jalapeno (Jakarana Tama). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0032',
    'SN-0032',
    'Gaga Blackpapper',
    'Jakarana Tama Gaga Blackpapper',
    'Gaga Blackpapper',
    'Mie & Bihun',
    170,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Gaga Blackpapper (Jakarana Tama). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0033',
    'SN-0033',
    'Indomie Sambal Rica',
    'Indofood サンバルチリソース (Indomie Sambal Rica)',
    'Indomie Sambal Rica',
    'Mie & Bihun',
    0,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Indomie Sambal Rica (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0034',
    'SN-0034',
    'ABC Selera Pedas',
    'ABC ABC Selera Pedas',
    'ABC Selera Pedas',
    'Mie & Bihun',
    220,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia ABC Selera Pedas (ABC). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0035',
    'SN-0035',
    'Sedaap Goreng Cup',
    'ミースダップ ミーゴレン (カリカリ揚げ玉付) Cup',
    'Sedaap Fried Noodles Cup',
    'Mie & Bihun',
    230,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sedaap Goreng Cup (Wings Food). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0036',
    'SN-0036',
    'Bamboe Gule',
    'バンブー インドネシア料理の素 Gule',
    'Bamboe Gule',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Gule (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0037',
    'SN-0037',
    'Bamboe Kare',
    'バンブー インドネシア料理の素 Kare',
    'Bamboe Kare',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Kare (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0038',
    'SN-0038',
    'Bamboe Kuah Bakso',
    'バンブー インドネシア料理の素 Kuah Bakso',
    'Bamboe Kuah Bakso',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Bamboe Kuah Bakso (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0039',
    'SN-0039',
    'Bamboe Nasi Goreng',
    'バンブー インドネシア料理の素 Nasi Goreng',
    'Bamboe Nasi Fried',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Nasi Goreng (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0040',
    'SN-0040',
    'Bamboe Nasi Goreng Pedas',
    'バンブー インドネシア料理の素 Nasi Goreng Pedas',
    'Bamboe Nasi Fried Pedas',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Nasi Goreng Pedas (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0041',
    'SN-0041',
    'Bamboe Opor',
    'バンブー インドネシア料理の素 Opor',
    'Bamboe Opor',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Opor (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0042',
    'SN-0042',
    'Bamboe Rendang',
    'バンブー インドネシア料理の素 Rendang',
    'Bamboe Rendang',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Rendang (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0043',
    'SN-0043',
    'Bamboe Sambal Goreng Ati',
    'バンブー インドネシア料理の素 Sambal Goreng Ati',
    'Bamboe Sambal Fried Ati',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Sambal Goreng Ati (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0044',
    'SN-0044',
    'Bamboe Sop',
    'バンブー インドネシア料理の素 Sop',
    'Bamboe Sop',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Sop (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0045',
    'SN-0045',
    'Bamboe Soto Ayam',
    'バンブー インドネシア料理の素 Soto Ayam',
    'Bamboe Soto Soup Ayam',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Bamboe Soto Ayam (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0046',
    'SN-0046',
    'Bamboe Soto Betawi',
    'バンブー インドネシア料理の素 Soto Betawi',
    'Bamboe Soto Soup Betawi',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Soto Betawi (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0047',
    'SN-0047',
    'Bamboe Soto daging',
    'バンブー インドネシア料理の素 Soto daging',
    'Bamboe Soto Soup daging',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Bamboe Soto daging (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0048',
    'SN-0048',
    'Bamboe Tongseng',
    'バンブー インドネシア料理の素 Tongseng',
    'Bamboe Tongseng',
    'Bumbu Instan',
    200,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Tongseng (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0049',
    'SN-0049',
    'Racik Ayam Goreng',
    'Indofood Racik Ayam Goreng',
    'Racik Ayam Fried',
    'Bumbu Instan',
    120,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Racik Ayam Goreng (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0050',
    'SN-0050',
    'Racik Ikan Goreng',
    'Indofood Racik Ikan Goreng',
    'Racik Ikan Fried',
    'Bumbu Instan',
    120,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Racik Ikan Goreng (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0051',
    'SN-0051',
    'Racik Lodeh',
    'Indofood Racik Lodeh',
    'Racik Lodeh',
    'Bumbu Instan',
    120,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Racik Lodeh (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0052',
    'SN-0052',
    'Racik Nasi Goreng',
    'Indofood Racik Nasi Goreng',
    'Racik Nasi Fried',
    'Bumbu Instan',
    120,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Racik Nasi Goreng (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0053',
    'SN-0053',
    'Racik Sayur Asem',
    'Indofood Racik Sayur Asem',
    'Racik Sayur Asem',
    'Bumbu Instan',
    120,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Racik Sayur Asem (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0054',
    'SN-0054',
    'Racik Tahu Tempe',
    'Indofood Racik Tahu Tempe',
    'Racik Tahu Tempe',
    'Bumbu Instan',
    120,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Racik Tahu Tempe (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0055',
    'SN-0055',
    'Kobe Nasi Kuning 1 Pack 3pcs',
    'Kobe Kobe Nasi Kuning 1 Pack 3pcs',
    'Kobe Nasi Kuning 1 Pack 3pcs',
    'Bumbu Instan',
    470,
    0,
    50,
    '3 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kobe Nasi Kuning 1 Pack 3pcs (Kobe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0056',
    'SN-0056',
    'Kobe Nasi Kuning',
    'Kobe Kobe Nasi Kuning',
    'Kobe Nasi Kuning',
    'Bumbu Instan',
    470,
    0,
    50,
    '3 Pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kobe Nasi Kuning (Kobe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0057',
    'SN-0057',
    'KOKITA Bumbu Inti A',
    'Kokita 料理用スパイス調味料 (KOKITA Bumbu Inti A)',
    'KOKITA Seasoning Paste Inti A',
    'Bumbu Instan',
    820,
    0,
    50,
    '350 gr Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia KOKITA Bumbu Inti A (Kokita). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0058',
    'SN-0058',
    'KOKITA Bumbu Inti B',
    'Kokita 料理用スパイス調味料 (KOKITA Bumbu Inti B)',
    'KOKITA Seasoning Paste Inti B',
    'Bumbu Instan',
    820,
    0,
    50,
    '351 gr Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia KOKITA Bumbu Inti B (Kokita). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0059',
    'SN-0059',
    'KOKITA Bumbu Inti C',
    'Kokita 料理用スパイス調味料 (KOKITA Bumbu Inti C)',
    'KOKITA Seasoning Paste Inti C',
    'Bumbu Instan',
    820,
    0,
    50,
    '352 gr Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia KOKITA Bumbu Inti C (Kokita). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0060',
    'SN-0060',
    'KOKITA Bumbu Inti D',
    'Kokita 料理用スパイス調味料 (KOKITA Bumbu Inti D)',
    'KOKITA Seasoning Paste Inti D',
    'Bumbu Instan',
    820,
    0,
    50,
    '353 gr Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia KOKITA Bumbu Inti D (Kokita). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0061',
    'SN-0061',
    'Antaka Balado',
    'Antaka Antaka Balado',
    'Antaka Balado',
    'Bumbu Instan',
    480,
    0,
    50,
    '1 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Antaka Balado (Antaka). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0062',
    'SN-0062',
    'Bamboe Ayam Goreng',
    'バンブー インドネシア料理の素 Ayam Goreng',
    'Bamboe Ayam Fried',
    'Bumbu Instan',
    170,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Bamboe Ayam Goreng (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0063',
    'SN-0063',
    'Bamboe Ayam Bakar Rujak',
    'バンブー インドネシア料理の素 Ayam Bakar Rujak',
    'Bamboe Grilled Chicken Rujak',
    'Bumbu Instan',
    170,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Bamboe Ayam Bakar Rujak (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0064',
    'SN-0064',
    'Racik Rendang',
    'Indofood Racik Rendang',
    'Racik Rendang',
    'Bumbu Instan',
    0,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Racik Rendang (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0065',
    'SN-0065',
    'Racik Ayam Goreng Rempah',
    'Indofood Racik Ayam Goreng Rempah',
    'Racik Ayam Fried Rempah',
    'Bumbu Instan',
    0,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Racik Ayam Goreng Rempah (Indofood). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0066',
    'SN-0066',
    'Bamboe Ayam Kecap',
    'バンブー インドネシア料理の素 Ayam Kecap',
    'Bamboe Ayam Sweet Soy Sauce',
    'Bumbu Instan',
    170,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Bamboe Ayam Kecap (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0067',
    'SN-0067',
    'Bamboe Rica-Rica',
    'バンブー インドネシア料理の素 Rica-Rica',
    'Bamboe Rica-Rica',
    'Bumbu Instan',
    170,
    0,
    50,
    '1 pcs Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bamboe Rica-Rica (Bamboe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0068',
    'SN-0068',
    'Kobe Nasi Uduk',
    'Kobe Kobe Nasi Uduk',
    'Kobe Nasi Uduk',
    'Bumbu Instan',
    470,
    0,
    50,
    '3 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kobe Nasi Uduk (Kobe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0069',
    'SN-0069',
    'Kobe Rendang',
    'Kobe Kobe Rendang',
    'Kobe Rendang',
    'Bumbu Instan',
    470,
    0,
    50,
    '3 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kobe Rendang (Kobe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0070',
    'SN-0070',
    'Kobe Nasi Kuning',
    'Kobe Kobe Nasi Kuning',
    'Kobe Nasi Kuning',
    'Bumbu Instan',
    440,
    0,
    50,
    '3 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kobe Nasi Kuning (Kobe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0071',
    'SN-0071',
    'Totole Kaldu Jamur',
    'Totole Totole Kaldu Jamur',
    'Totole Kaldu Jamur',
    'Bumbu Instan',
    400,
    0,
    50,
    '40 gr Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Totole Kaldu Jamur (Totole). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0072',
    'SN-0072',
    'Desaku Bawang Putih Renceng',
    'Desaku Desaku Bawang Putih Renceng',
    'Desaku Bawang Putih Renceng',
    'Bumbu Instan',
    980,
    0,
    50,
    '12 sachet Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Desaku Bawang Putih Renceng (Desaku). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0073',
    'SN-0073',
    'Desaku Ketumbar Renceng',
    'Desaku Desaku Ketumbar Renceng',
    'Desaku Ketumbar Renceng',
    'Bumbu Instan',
    980,
    0,
    50,
    '13 sachet Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Desaku Ketumbar Renceng (Desaku). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0074',
    'SN-0074',
    'Desaku Marinasi Renceng',
    'Desaku Desaku Marinasi Renceng',
    'Desaku Marinasi Renceng',
    'Bumbu Instan',
    980,
    0,
    50,
    '14 sachet Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Desaku Marinasi Renceng (Desaku). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0075',
    'SN-0075',
    'Desaku Merica Bubuk Renceng',
    'Desaku Desaku Merica Bubuk Renceng',
    'Desaku Merica Bubuk Renceng',
    'Bumbu Instan',
    980,
    0,
    50,
    '15 sachet Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Desaku Merica Bubuk Renceng (Desaku). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0076',
    'SN-0076',
    'Desaku Kunyit Bubuk Renceng',
    'Desaku Desaku Kunyit Bubuk Renceng',
    'Desaku Kunyit Bubuk Renceng',
    'Bumbu Instan',
    980,
    0,
    50,
    '16 sachet Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Desaku Kunyit Bubuk Renceng (Desaku). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0077',
    'SN-0077',
    'Royco Kuah Bakso',
    'Royco Royco Kuah Bakso',
    'Royco Kuah Bakso',
    'MSG & Kaldu Bubuk',
    480,
    0,
    50,
    '100 gr Pack',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Royco Kuah Bakso (Royco). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0078',
    'SN-0078',
    'Royco Sapi Besar',
    'Royco Royco Sapi Besar',
    'Royco Sapi Besar',
    'MSG & Kaldu Bubuk',
    480,
    0,
    50,
    '94 gr Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Royco Sapi Besar (Royco). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0079',
    'SN-0079',
    'Royco Ayam Besar',
    'Royco Royco Ayam Besar',
    'Royco Ayam Besar',
    'MSG & Kaldu Bubuk',
    480,
    0,
    50,
    '95 gr Pack',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Royco Ayam Besar (Royco). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0080',
    'SN-0080',
    'Masako Ayam Besar',
    'Masako Masako Ayam Besar',
    'Masako Ayam Besar',
    'MSG & Kaldu Bubuk',
    470,
    0,
    50,
    '100 gr Pack',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Masako Ayam Besar (Masako). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0081',
    'SN-0081',
    'Masako Sapi Besar',
    'Masako Masako Sapi Besar',
    'Masako Sapi Besar',
    'MSG & Kaldu Bubuk',
    470,
    0,
    50,
    '101 gr Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Masako Sapi Besar (Masako). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0082',
    'SN-0082',
    'Sasa Tepung Serbaguna Original',
    'Sasa Sasa Tepung Serbaguna Original',
    'Sasa Tepung Serbaguna Original',
    'MSG & Kaldu Bubuk',
    410,
    0,
    50,
    '210 gr Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sasa Tepung Serbaguna Original (Sasa). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0083',
    'SN-0083',
    'Sasa Tepung Serbaguna Hot & Spicy',
    'Sasa Sasa Tepung Serbaguna Hot & Spicy',
    'Sasa Tepung Serbaguna Hot & Spicy',
    'MSG & Kaldu Bubuk',
    410,
    0,
    50,
    '210 gr Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sasa Tepung Serbaguna Hot & Spicy (Sasa). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0084',
    'SN-0084',
    'Royco Ayam Besar',
    '- Royco Ayam Besar',
    'Royco Ayam Besar',
    'MSG & Kaldu Bubuk',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    true,
    NULL,
    'Produk asli Indonesia Royco Ayam Besar (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0085',
    'SN-0085',
    'Sasa MSG',
    '- Sasa MSG',
    'Sasa MSG',
    'MSG & Kaldu Bubuk',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sasa MSG (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0086',
    'SN-0086',
    'Garam',
    '- Garam',
    'Garam',
    'MSG & Kaldu Bubuk',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Garam (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0087',
    'SN-0087',
    'Baking Powder',
    'Koepoe-koepoe Baking Powder',
    'Baking Powder',
    'Bahan Baking',
    420,
    0,
    50,
    '45 gr Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Baking Powder (Koepoe-koepoe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0088',
    'SN-0088',
    'Koepoe Vanila',
    'Koepoe-koepoe Koepoe Vanila',
    'Koepoe Vanila',
    'Bahan Baking',
    380,
    0,
    50,
    '20 gr Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Koepoe Vanila (Koepoe-koepoe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0089',
    'SN-0089',
    'Ragi',
    '- Ragi',
    'Ragi',
    'Bahan Baking',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Ragi (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0090',
    'SN-0090',
    'TBM',
    'Koepoe-koepoe TBM',
    'TBM',
    'Bahan Baking',
    400,
    0,
    50,
    '35 gr Cup',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia TBM (Koepoe-koepoe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0091',
    'SN-0091',
    'Pewarna Pandan',
    'Koepoe-koepoe Pewarna Pandan',
    'Pewarna Pandan',
    'Bahan Baking',
    380,
    0,
    50,
    '25 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Pewarna Pandan (Koepoe-koepoe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0092',
    'SN-0092',
    'Soda Kue',
    'Koepoe-koepoe Soda Kue',
    'Soda Kue',
    'Bahan Baking',
    430,
    0,
    50,
    '81 gr Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Soda Kue (Koepoe-koepoe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0093',
    'SN-0093',
    'SP',
    'Koepoe-koepoe SP',
    'SP',
    'Bahan Baking',
    400,
    0,
    50,
    '30 gr Cup',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia SP (Koepoe-koepoe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0094',
    'SN-0094',
    'Ovalett',
    'Koepoe-koepoe Ovalett',
    'Ovalett',
    'Bahan Baking',
    420,
    0,
    50,
    '30 gr Cup',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Ovalett (Koepoe-koepoe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0095',
    'SN-0095',
    'Ragi Tempe',
    'Raprima Ragi Tempe',
    'Ragi Tempe',
    'Bumbu Masak',
    0,
    0,
    50,
    '500gr Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Ragi Tempe (Raprima). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0096',
    'SN-0096',
    'Bawang Merah',
    '- Bawang Merah',
    'Bawang Merah',
    'Bumbu Masak',
    0,
    0,
    50,
    '250 gr Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bawang Merah (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0097',
    'SN-0097',
    'Bawang Putih',
    '- Bawang Putih',
    'Bawang Putih',
    'Bumbu Masak',
    0,
    0,
    50,
    '100 g Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bawang Putih (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0098',
    'SN-0098',
    'Asem Jawa',
    '- Asem Jawa',
    'Asem Jawa',
    'Snack',
    0,
    0,
    50,
    '100 g Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Asem Jawa (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0099',
    'SN-0099',
    'Biji Pala',
    '- Biji Pala',
    'Biji Pala',
    'Snack',
    0,
    0,
    50,
    '100 g Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Biji Pala (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0100',
    'SN-0100',
    'Cabe Merah Kering',
    '- Cabe Merah Kering',
    'Cabe Merah Kering',
    'Snack',
    0,
    0,
    50,
    '200 g Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Cabe Merah Kering (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0101',
    'SN-0101',
    'Cabe Merah Keriting',
    '- Cabe Merah Keriting',
    'Cabe Merah Keriting',
    'Minuman',
    0,
    0,
    50,
    '10 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Cabe Merah Keriting (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0102',
    'SN-0102',
    'Cabe Rawit Hijau',
    '- Cabe Rawit Hijau',
    'Cabe Rawit Hijau',
    'Minuman',
    0,
    0,
    50,
    '10 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Cabe Rawit Hijau (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0103',
    'SN-0103',
    'Cengkeh',
    '- Cengkeh',
    'Cengkeh',
    'Minuman',
    0,
    0,
    50,
    '10 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Cengkeh (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0104',
    'SN-0104',
    'Daun Jeruk',
    '- Daun Jeruk',
    'Daun Jeruk',
    'Minuman',
    0,
    0,
    50,
    '10 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Daun Jeruk (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0105',
    'SN-0105',
    'Daun Salam',
    '- Daun Salam',
    'Daun Salam',
    'Minuman',
    0,
    0,
    50,
    '165 g Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Daun Salam (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0106',
    'SN-0106',
    'Kemiri',
    '- Kemiri',
    'Kemiri',
    'Minuman',
    0,
    0,
    50,
    '10 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kemiri (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0107',
    'SN-0107',
    'Kayu Manis',
    '- Kayu Manis',
    'Kayu Manis',
    'Minuman',
    0,
    0,
    50,
    '10 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kayu Manis (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0108',
    'SN-0108',
    'Ketumbar Butir',
    '- Ketumbar Butir',
    'Ketumbar Butir',
    'Minuman',
    0,
    0,
    50,
    '10 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Ketumbar Butir (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0109',
    'SN-0109',
    'Kunyit',
    '- Kunyit',
    'Kunyit',
    'Minuman',
    0,
    0,
    50,
    '10 pcs Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kunyit (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0110',
    'SN-0110',
    'Lada Hitam Butir',
    '- Lada Hitam Butir',
    'Lada Hitam Butir',
    'Minuman',
    0,
    0,
    50,
    '330 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Lada Hitam Butir (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0111',
    'SN-0111',
    'Lada/Merica Biji',
    '- Lada/Merica Biji',
    'Lada/Merica Biji',
    'Minuman',
    0,
    0,
    50,
    '620 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Lada/Merica Biji (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0112',
    'SN-0112',
    'Lengkoas',
    '- Lengkoas',
    'Lengkoas',
    'Obat/OTC',
    0,
    0,
    50,
    '60 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Lengkoas (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0113',
    'SN-0113',
    'Sereh',
    '- Sereh',
    'Sereh',
    'Obat/OTC',
    0,
    0,
    50,
    '20 g Jar',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sereh (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0114',
    'SN-0114',
    'Bunga Lawang',
    '- Bunga Lawang',
    'Bunga Lawang',
    'Obat/OTC',
    0,
    0,
    50,
    'Pack Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bunga Lawang (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0115',
    'SN-0115',
    'Kencur',
    '- Kencur',
    'Kencur',
    'Obat/OTC',
    0,
    0,
    50,
    '12 sachet Box',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kencur (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0116',
    'SN-0116',
    'Jahe',
    '- Jahe',
    'Jahe',
    'Obat/OTC',
    0,
    0,
    50,
    '15 sachet Box',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Jahe (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0117',
    'SN-0117',
    'Gula Merah',
    '- Gula Merah',
    'Gula Merah',
    'Obat/OTC',
    0,
    0,
    50,
    '7 ml Sachet',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Gula Merah (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0118',
    'SN-0118',
    'Gula Aren',
    'Kara Gula Aren',
    'Gula Aren',
    'Lain-lain',
    0,
    0,
    50,
    '65 ml Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Gula Aren (Kara). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0119',
    'SN-0119',
    'Santan Kara',
    'カラ ココナッツミルク (サンタン)',
    'Coconut Milk Kara',
    'Lain-lain',
    0,
    0,
    50,
    '200 ml Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Santan Kara (Kara). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0120',
    'SN-0120',
    'Tepung Tapioka',
    '- Tepung Tapioka',
    'Tepung Tapioka',
    'Lain-lain',
    0,
    0,
    50,
    '500 g Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Tepung Tapioka (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0121',
    'SN-0121',
    'Tepung Beras',
    '- Tepung Beras',
    'Tepung Beras',
    'Lain-lain',
    0,
    0,
    50,
    '500 g Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Tepung Beras (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0122',
    'SN-0122',
    'Tepung Terigu',
    '- Tepung Terigu',
    'Tepung Terigu',
    'Lain-lain',
    0,
    0,
    50,
    '1 kg Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Tepung Terigu (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0123',
    'SN-0123',
    'Terasi',
    '- Terasi',
    'Terasi',
    'Lain-lain',
    0,
    0,
    50,
    '250 g Pack',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Terasi (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0124',
    'SN-0124',
    'Kecap Asin',
    '- インドネシア甘口醤油 (Kecap Asin)',
    'Sweet Soy Sauce Asin',
    'Lain-lain',
    0,
    0,
    50,
    '150 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kecap Asin (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0125',
    'SN-0125',
    'Cuka Masak',
    '- Cuka Masak',
    'Cuka Masak',
    'Lain-lain',
    0,
    0,
    50,
    '150 ml Botol',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Cuka Masak (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0126',
    'SN-0126',
    'Kacang Tanah',
    '- Kacang Tanah',
    'Peanuts Tanah',
    'Lain-lain',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kacang Tanah (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0127',
    'SN-0127',
    'Kacang Ijo',
    '- Kacang Ijo',
    'Peanuts Ijo',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kacang Ijo (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0128',
    'SN-0128',
    'Kacang Kedelai',
    '- Kacang Kedelai',
    'Peanuts Kedelai',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kacang Kedelai (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0129',
    'SN-0129',
    'Good Day Cappucino',
    '- Good Day Cappucino',
    'Good Day Cappucino',
    'Sembako & Bumbu',
    960,
    0,
    50,
    '10 pcs Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Good Day Cappucino (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0130',
    'SN-0130',
    'Max Tea',
    '- Max Tea',
    'Max Tea',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Max Tea (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0131',
    'SN-0131',
    'Chocolatos Matcha sachet',
    '- Chocolatos Matcha sachet',
    'Chocolatos Matcha Sachet',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Chocolatos Matcha sachet (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0132',
    'SN-0132',
    'Chocolatos Cokelat Sachet',
    '- Chocolatos Cokelat Sachet',
    'Chocolatos Cokelat Sachet',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Chocolatos Cokelat Sachet (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0133',
    'SN-0133',
    'Kukubima Royal Jelly',
    '- Kukubima Royal Jelly',
    'Kukubima Royal Jelly',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kukubima Royal Jelly (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0134',
    'SN-0134',
    'Energen Vanilla',
    '- Energen Vanilla',
    'Energen Vanilla',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Energen Vanilla (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0135',
    'SN-0135',
    'Energen Jahe',
    '- Energen Jahe',
    'Energen Jahe',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Energen Jahe (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0136',
    'SN-0136',
    'Energen Kacang Hijau',
    '- Energen Kacang Hijau',
    'Energen Peanuts Hijau',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Energen Kacang Hijau (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0137',
    'SN-0137',
    'Energen Cokelat',
    'エネルゲン 栄養シリアルドリンク (チョコ)',
    'Energen Cokelat',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Energen Cokelat (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0138',
    'SN-0138',
    'Nutrijell all varian',
    '- Nutrijell all varian',
    'Nutrijell all varian',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Nutrijell all varian (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0139',
    'SN-0139',
    'Dancow Sachet',
    '- Dancow Sachet',
    'Dancow Sachet',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Dancow Sachet (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0140',
    'SN-0140',
    'Milo Sachet',
    '- Milo Sachet',
    'Milo Sachet',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Milo Sachet (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0141',
    'SN-0141',
    'Nutrisari Jeruk',
    '- Nutrisari Jeruk',
    'Nutrisari Jeruk',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Nutrisari Jeruk (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0142',
    'SN-0142',
    'Nutrisari Jeruk Peras',
    '- Nutrisari Jeruk Peras',
    'Nutrisari Jeruk Peras',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Nutrisari Jeruk Peras (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0143',
    'SN-0143',
    'Caffee Mix',
    'Indocafe Caffee Mix',
    'Caffee Mix',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Caffee Mix (Indocafe). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0144',
    'SN-0144',
    'Indomilk Sachet full cream',
    '- Indomilk Sachet full cream',
    'Indomilk Sachet full cream',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Indomilk Sachet full cream (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0145',
    'SN-0145',
    'Jahe Merah AMH',
    '- Jahe Merah AMH',
    'Jahe Merah AMH',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Jahe Merah AMH (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0146',
    'SN-0146',
    'Wedang Bajigur',
    '- Wedang Bajigur',
    'Wedang Bajigur',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Wedang Bajigur (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0147',
    'SN-0147',
    'Kapal Api Sachet',
    '- Kapal Api Sachet',
    'Kapal Api Sachet',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Kapal Api Sachet (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0148',
    'SN-0148',
    'Extra Joss',
    '- Extra Joss',
    'Extra Joss',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Extra Joss (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0149',
    'SN-0149',
    'Sari Wangi The',
    '- Sari Wangi The',
    'Sari Wangi The',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Sari Wangi The (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0150',
    'SN-0150',
    'Tong Jie',
    '- Tong Jie',
    'Tong Jie',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Tong Jie (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0151',
    'SN-0151',
    'Good Day Carrebian nuts',
    '- Good Day Carrebian nuts',
    'Good Day Carrebian nuts',
    'Sembako & Bumbu',
    940,
    0,
    50,
    '10 pcs Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Good Day Carrebian nuts (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0152',
    'SN-0152',
    'Bear Brand Milk',
    '- Bear Brand Milk',
    'Bear Brand Milk',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Bear Brand Milk (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0153',
    'SN-0153',
    'Teh Pucuk',
    '- Teh Pucuk',
    'Teh Pucuk',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Teh Pucuk (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0154',
    'SN-0154',
    'Teh Kotak',
    '- Teh Kotak',
    'Teh Kotak',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Teh Kotak (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0155',
    'SN-0155',
    'Teh Botol Sosro',
    'テ・ボトル・ソスロ ジャスミンティー',
    'Teh Bottle Sosro',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Teh Botol Sosro (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0156',
    'SN-0156',
    'Marjan Cocopandan',
    '- Marjan Cocopandan',
    'Marjan Cocopandan',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Marjan Cocopandan (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0157',
    'SN-0157',
    'Marjan Melon',
    '- Marjan Melon',
    'Marjan Melon',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Marjan Melon (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0158',
    'SN-0158',
    'Luwak White Coffee',
    '- Luwak White Coffee',
    'Luwak White Coffee',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Luwak White Coffee (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0159',
    'SN-0159',
    'Good Day Original',
    '- Good Day Original',
    'Good Day Original',
    'Sembako & Bumbu',
    940,
    0,
    50,
    '10 pcs Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Good Day Original (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0160',
    'SN-0160',
    'Good Day Vanilla',
    '- Good Day Vanilla',
    'Good Day Vanilla',
    'Sembako & Bumbu',
    880,
    0,
    50,
    '10 pcs Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Good Day Vanilla (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0161',
    'SN-0161',
    'Good Day Chocochino',
    '- Good Day Chocochino',
    'Good Day Chocochino',
    'Sembako & Bumbu',
    940,
    0,
    50,
    '10 pcs Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Good Day Chocochino (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0162',
    'SN-0162',
    'Good Day Mochachino',
    '- Good Day Mochachino',
    'Good Day Mochachino',
    'Sembako & Bumbu',
    940,
    0,
    50,
    '10 pcs Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Good Day Mochachino (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0163',
    'SN-0163',
    'Good Day Freez',
    '- Good Day Freez',
    'Good Day Freez',
    'Sembako & Bumbu',
    940,
    0,
    50,
    '10 pcs Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Good Day Freez (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0164',
    'SN-0164',
    'Good Day Cool in',
    '- Good Day Cool in',
    'Good Day Cool in',
    'Sembako & Bumbu',
    940,
    0,
    50,
    '10 pcs Renceng',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Good Day Cool in (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0165',
    'SN-0165',
    'Basreng Ori Daun Jeruk',
    '- Basreng Ori Daun Jeruk',
    'Basreng Ori Daun Jeruk',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Basreng Ori Daun Jeruk (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0166',
    'SN-0166',
    'Basreng Pedas Daun Jeruk',
    '- Basreng Pedas Daun Jeruk',
    'Basreng Pedas Daun Jeruk',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Basreng Pedas Daun Jeruk (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0167',
    'SN-0167',
    'Basreng Ekstra Pedas Daun Jeruk',
    '- Basreng Ekstra Pedas Daun Jeruk',
    'Basreng Ekstra Pedas Daun Jeruk',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Basreng Ekstra Pedas Daun Jeruk (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0168',
    'SN-0168',
    'Malkist Abon',
    '- Malkist Abon',
    'Malkist Abon',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Malkist Abon (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0169',
    'SN-0169',
    'Malkist Roma',
    '- Malkist Roma',
    'Malkist Roma',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Malkist Roma (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0170',
    'SN-0170',
    'Beng-beng',
    '- Beng-beng',
    'Beng-beng',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Beng-beng (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0171',
    'SN-0171',
    'TicTac Sapi',
    '- TicTac Sapi',
    'TicTac Sapi',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia TicTac Sapi (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0172',
    'SN-0172',
    'TicTac Rumput Laut',
    '- TicTac Rumput Laut',
    'TicTac Rumput Laut',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia TicTac Rumput Laut (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0173',
    'SN-0173',
    'TicTac Pedas',
    '- TicTac Pedas',
    'TicTac Pedas',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia TicTac Pedas (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0174',
    'SN-0174',
    'TicTac Original',
    '- TicTac Original',
    'TicTac Original',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia TicTac Original (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0175',
    'SN-0175',
    'Garuda Atom Original',
    '- Garuda Atom Original',
    'Garuda Atom Original',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Garuda Atom Original (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0176',
    'SN-0176',
    'Garuda Atom Pedas',
    '- Garuda Atom Pedas',
    'Garuda Atom Pedas',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Garuda Atom Pedas (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0177',
    'SN-0177',
    'Richeese Nabati',
    '- Richeese Nabati',
    'Richeese Nabati',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Richeese Nabati (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0178',
    'SN-0178',
    'Richeese Nabati Cokelat',
    '- Richeese Nabati Cokelat',
    'Richeese Nabati Cokelat',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Richeese Nabati Cokelat (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.products (id, sku, name, name_jp, name_en, category, price, cost_price, stock, unit, image, is_halal, is_frozen, barcode, description)
VALUES (
    'SN-0179',
    'SN-0179',
    'Coki-Coki',
    '- Coki-Coki',
    'Coki-Coki',
    'Sembako & Bumbu',
    0,
    0,
    50,
    '1 Pcs',
    '/placeholder-upload.svg',
    true,
    false,
    NULL,
    'Produk asli Indonesia Coki-Coki (-). Standar kualitas terpercaya Sembako Nusantara.'
)
ON CONFLICT (id) DO UPDATE SET
    sku = EXCLUDED.sku,
    name = EXCLUDED.name,
    name_jp = EXCLUDED.name_jp,
    name_en = EXCLUDED.name_en,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    cost_price = EXCLUDED.cost_price,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    is_halal = EXCLUDED.is_halal,
    is_frozen = EXCLUDED.is_frozen,
    barcode = EXCLUDED.barcode,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

-- --------------------------------------------------------------------
-- 4. TABLE: orders (Customer Orders & Dispatch)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY,
    tracking_number VARCHAR(100) DEFAULT '',
    courier VARCHAR(50) NOT NULL DEFAULT 'Yamato Transport',
    status VARCHAR(50) NOT NULL DEFAULT 'Dikemas',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'jpqr',
    customer_name VARCHAR(150) NOT NULL DEFAULT 'Willy Pratama',
    customer_email VARCHAR(150) DEFAULT 'willy.tokyo@gmail.com',
    customer_phone VARCHAR(50) DEFAULT '+81 80-1122-3344',
    shipping_address TEXT NOT NULL,
    postal_code VARCHAR(20) DEFAULT '134-0088',
    prefecture VARCHAR(50) DEFAULT 'Tokyo-to (東京都)',
    city VARCHAR(100) DEFAULT 'Edogawa-ku (江戸川区)',
    notes TEXT DEFAULT '-',
    order_date VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read order_items" ON public.order_items;
CREATE POLICY "Allow public read order_items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public insert order_items" ON public.order_items;
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

-- --------------------------------------------------------------------
-- 5. TABLE: pos_transactions & pos_transaction_items
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_transactions (
    id VARCHAR(100) PRIMARY KEY,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cashier_name VARCHAR(150) NOT NULL,
    customer_name VARCHAR(200) DEFAULT 'Walk-in Customer',
    payment_method VARCHAR(50) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    change_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Lunas',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pos_transaction_items (
    id BIGSERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL REFERENCES public.pos_transactions(id) ON DELETE CASCADE,
    product_id VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pos_transactions_date ON public.pos_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_receipt ON public.pos_transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_tx_id ON public.pos_transaction_items(transaction_id);

ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read pos_transactions" ON public.pos_transactions;
CREATE POLICY "Allow public read pos_transactions" ON public.pos_transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public insert pos_transactions" ON public.pos_transactions;
CREATE POLICY "Allow public insert pos_transactions" ON public.pos_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update pos_transactions" ON public.pos_transactions;
CREATE POLICY "Allow public update pos_transactions" ON public.pos_transactions FOR UPDATE TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public delete pos_transactions" ON public.pos_transactions;
CREATE POLICY "Allow public delete pos_transactions" ON public.pos_transactions FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "Allow public read pos_transaction_items" ON public.pos_transaction_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public insert pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "Allow public insert pos_transaction_items" ON public.pos_transaction_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public delete pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "Allow public delete pos_transaction_items" ON public.pos_transaction_items FOR DELETE TO anon, authenticated USING (true);

-- --------------------------------------------------------------------
-- 6. TABLE: vouchers
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vouchers (
    code VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE',
    discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_spend NUMERIC(12,2) NOT NULL DEFAULT 0,
    max_discount NUMERIC(12,2),
    valid_until VARCHAR(50) NOT NULL,
    usage_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read vouchers" ON public.vouchers;
CREATE POLICY "Allow public read vouchers" ON public.vouchers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public upsert vouchers" ON public.vouchers;
CREATE POLICY "Allow public upsert vouchers" ON public.vouchers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.vouchers (code, title, description, discount_type, discount_value, min_spend, max_discount, valid_until, usage_count, is_active)
VALUES
    ('NUSANTARA10', 'Diskon 10% Sahabat Diaspora', 'Diskon 10% untuk seluruh produk sembako halal (Min Belanja ¥3,000 / Rp 315.000)', 'PERCENTAGE', 10, 3000, 1000, '2026-12-31', 14, true),
    ('POTONGANYEN500', 'Potongan Langsung ¥500 (Yen)', 'Potongan langsung ¥500 untuk belanja apa saja di Sembako Nusantara Jepang', 'NOMINAL_JPY', 500, 4500, NULL, '2026-11-30', 28, true),
    ('DISKONIDR50K', 'Potongan Rp 50.000 (Rupiah IDR)', 'Kupon potongan nominal Rupiah IDR Rp 50.000 untuk pembayaran transfer QRIS/BCA', 'NOMINAL_IDR', 50000, 300000, NULL, '2026-12-31', 19, true),
    ('SUPERDIASPORA', 'Voucher Gajian Hemat 15%', 'Spesial tanggal gajian para kenshusei & pekerja migran di seluruh Jepang', 'PERCENTAGE', 15, 6000, 1500, '2026-12-31', 42, true),
    ('ONGKIRHEMAT', 'Voucher Subsidi Ongkir ¥500', 'Subsidi ongkos kirim Yamato / Sagawa untuk pengiriman luar Kanto', 'NOMINAL_JPY', 500, 5000, NULL, '2026-12-31', 65, true),
    ('WELCOME2026', 'Voucher Selamat Datang Member Baru', 'Potongan spesial belanja perdana pelanggan baru Sembako Nusantara Jepang', 'PERCENTAGE', 5, 2000, 500, '2026-12-31', 88, true)
ON CONFLICT (code) DO NOTHING;

-- --------------------------------------------------------------------
-- 7. TABLE: warehouses
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.warehouses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location TEXT NOT NULL,
    prefecture VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    capacity_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read warehouses" ON public.warehouses;
CREATE POLICY "Allow public read warehouses" ON public.warehouses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public upsert warehouses" ON public.warehouses;
CREATE POLICY "Allow public upsert warehouses" ON public.warehouses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.warehouses (id, name, location, prefecture, is_active, capacity_description)
VALUES
    ('wh-tokyo', 'Toko & Gudang Utama Tokyo (Nishikamata)', '〒144-0051 東京都大田区西蒲田5丁目9-16 (Tokyo, Ota-ku, Nishikamata 5-9-16)', 'Tokyo-to', true, 'Cold Storage & Dry Food Hub 120 CBM'),
    ('wh-osaka', 'Hub Logistik Kansai (Osaka)', 'Osaka-shi, Naniwa-ku, Nipponbashi', 'Osaka-fu', true, 'Transit Hub Pengiriman Kansai, Chugoku & Kyushu')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    prefecture = EXCLUDED.prefecture,
    capacity_description = EXCLUDED.capacity_description;

-- --------------------------------------------------------------------
-- 8. TABLE: suppliers
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(100),
    address TEXT,
    payment_terms VARCHAR(50) DEFAULT 'TOP 30 Hari',
    lead_time_days INT DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read suppliers" ON public.suppliers;
CREATE POLICY "Allow public read suppliers" ON public.suppliers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public upsert suppliers" ON public.suppliers;
CREATE POLICY "Allow public upsert suppliers" ON public.suppliers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.suppliers (id, name, contact_person, phone, email, address, payment_terms, lead_time_days, is_active, notes)
VALUES
    ('sup-1', 'PT Indofood CBP Sukses Makmur (Ekspor Jepang)', 'Bapak Hendra (+62-811-2345-6789)', '+81-3-3456-7890', 'export.jp@indofood.co.id', 'Sudirman Plaza, Jakarta / Tokyo Branch', 'TOP 30 Hari', 7, true, 'Distributor resmi mi instan Indomie, bumbu racik, dan kecap Indofood.'),
    ('sup-2', 'PT Mayora Indah Tbk (Japan Hub)', 'Ibu Cynthia (+62-812-9876-5432)', '+81-6-6234-5678', 'mayora.jp@mayora.co.id', 'Daan Mogot, Tangerang / Osaka Warehouse Hub', 'TOP 14 Hari', 4, true, 'Penyedia biskuit Danisa, Kopiko candy & kopi instan Torabika.'),
    ('sup-3', 'PT Kobe Boga Utama Indonesia', 'Bapak Reza (+62-813-1122-3344)', '+81-3-4567-8901', 'japan.sales@dapurkobe.co.id', 'Tangerang, Banten', 'Tunai / COD (Transfer)', 3, true, 'Produsen BonCabe sambal tabur lv 10-50 & tepung bumbu Kobe.')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    contact_person = EXCLUDED.contact_person,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

-- --------------------------------------------------------------------
-- 9. TABLE: store_settings
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main_store',
    store_name VARCHAR(150) NOT NULL,
    store_address TEXT NOT NULL,
    store_phone VARCHAR(50),
    store_email VARCHAR(100),
    exchange_rate_jpy_idr NUMERIC(10,2) DEFAULT 105.5,
    tax_percentage NUMERIC(5,2) DEFAULT 8,
    opening_hours VARCHAR(100) DEFAULT 'Buka 24 Jam Setiap Hari (24/7)',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read store_settings" ON public.store_settings;
CREATE POLICY "Allow public read store_settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public upsert store_settings" ON public.store_settings;
CREATE POLICY "Allow public upsert store_settings" ON public.store_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.store_settings (id, store_name, store_address, store_phone, store_email, exchange_rate_jpy_idr, tax_percentage, opening_hours)
VALUES (
    'main_store',
    'Sembako Nusantara Jepang',
    '〒144-0051 東京都大田区西蒲田5丁目9-16 (Tokyo, Ota-ku, Nishikamata 5-9-16)',
    '+62 857-7387-5762',
    'admin@sembako-nusantara.jp',
    105.50,
    8.00,
    'Buka 24 Jam Setiap Hari (24/7)'
)
ON CONFLICT (id) DO UPDATE SET
    store_address = EXCLUDED.store_address,
    store_phone = EXCLUDED.store_phone,
    store_email = EXCLUDED.store_email,
    opening_hours = EXCLUDED.opening_hours;

-- --------------------------------------------------------------------
-- 10. TABLE: stock_movements
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    delta_quantity INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reason TEXT,
    from_warehouse VARCHAR(50),
    to_warehouse VARCHAR(50),
    operator_name VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read stock_movements" ON public.stock_movements;
CREATE POLICY "Allow public read stock_movements" ON public.stock_movements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public insert stock_movements" ON public.stock_movements;
CREATE POLICY "Allow public insert stock_movements" ON public.stock_movements FOR INSERT TO anon, authenticated WITH CHECK (true);

-- --------------------------------------------------------------------
-- 11. TABLE: promo_banners
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promo_banners (
    id INT PRIMARY KEY,
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    subtitle TEXT,
    link_url VARCHAR(255) DEFAULT '/catalog',
    badge VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read promo_banners" ON public.promo_banners;
CREATE POLICY "Allow public read promo_banners" ON public.promo_banners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow public upsert promo_banners" ON public.promo_banners;
CREATE POLICY "Allow public upsert promo_banners" ON public.promo_banners FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.promo_banners (id, image_url, title, subtitle, link_url, badge)
VALUES
    (1, '/banner-promo-1.jpg', 'Sembako Nusantara Jepang', 'Belanja Produk Indonesia Otentik di Seluruh 47 Prefektur Jepang!', '/catalog', 'PROMO SPESIAL'),
    (2, '/banner-promo-2.jpg', 'Gratis Ongkir Se-Jepang!', 'Gratis Ongkir Otomatis untuk Belanja Minimal ¥15,000 via Yamato & Sagawa', '/catalog', 'GRATIS ONGKIR ¥15,000+'),
    (3, '/banner-promo-3.jpg', 'Halal Frozen Food & Bumbu Nusantara', 'Bakso Sapi, Rendang, Bebek Ungkep, Aneka Sambal & Bumbu Masakan Lengkap', '/catalog?category=Frozen+Food', '100% HALAL & PRAKTIS')
ON CONFLICT (id) DO UPDATE SET
    image_url = EXCLUDED.image_url,
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    link_url = EXCLUDED.link_url,
    badge = EXCLUDED.badge;
