-- ====================================================================
-- SEMBAKO NUSANTARA JEPANG - SUPABASE SCHEMA: COMPLETE DATABASE
-- (ADMIN ACCOUNTS, ORDERS, ORDER ITEMS & REALTIME POLICIES)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABLE: admin_accounts
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id VARCHAR(50) PRIMARY KEY,              -- 'id0926'
    password VARCHAR(255) NOT NULL,          -- 'admin123'
    name VARCHAR(100) NOT NULL,              -- 'Jangsan'
    role VARCHAR(50) NOT NULL DEFAULT 'Super Admin (Owner)',
    email VARCHAR(100) DEFAULT 'admin@sembako-nusantara.jp',
    phone VARCHAR(50) DEFAULT '+81 80-1234-5678',
    avatar_url VARCHAR(255) DEFAULT '/avatar-jangsan.png',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read for admin authentication" ON public.admin_accounts;
CREATE POLICY "Allow anon read for admin authentication"
    ON public.admin_accounts
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Allow anon update last_login" ON public.admin_accounts;
CREATE POLICY "Allow anon update last_login"
    ON public.admin_accounts
    FOR UPDATE
    TO anon, authenticated
    USING (true);

-- Seed Default Admin
INSERT INTO public.admin_accounts (id, password, name, role, email, phone, avatar_url, is_active)
VALUES (
    'id0926',
    'admin123',
    'Jangsan (Super Admin)',
    'Super Admin (Owner)',
    'admin@sembako-nusantara.jp',
    '+81 80-1234-5678',
    '/avatar-jangsan.png',
    true
)
ON CONFLICT (id) DO UPDATE SET
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url,
    is_active = true;

-- --------------------------------------------------------------------
-- 2. TABLE: orders (Integrated Customer Orders & Admin Courier Dispatch)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY,                         -- 'SN-JP-849201'
    tracking_number VARCHAR(100) DEFAULT '',            -- '4829-3849-2938'
    courier VARCHAR(50) NOT NULL DEFAULT 'Yamato Transport', -- 'Yamato Transport' | 'Sagawa Express'
    status VARCHAR(50) NOT NULL DEFAULT 'Dikemas',      -- 'Dikemas' | 'Diproses' | 'Selesai Packing' | 'Dikirim' | 'Selesai' | 'Dibatalkan'
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,     -- e.g. 5400
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,       -- e.g. 400 (JCT 8%)
    payment_method VARCHAR(50) DEFAULT 'jpqr',          -- 'jpqr' | 'paypay' | 'konbini' | 'card' | 'bank' | 'cod'
    customer_name VARCHAR(150) NOT NULL DEFAULT 'Willy Pratama',
    customer_email VARCHAR(150) DEFAULT 'willy.tokyo@gmail.com',
    customer_phone VARCHAR(50) DEFAULT '+81 80-1122-3344',
    shipping_address TEXT NOT NULL,                     -- '134-0088 Tokyo-to Edogawa-ku Nishi-Kasai 3-1-4 #302'
    postal_code VARCHAR(20) DEFAULT '134-0088',
    prefecture VARCHAR(50) DEFAULT 'Tokyo-to (東京都)',
    city VARCHAR(100) DEFAULT 'Edogawa-ku (江戸川区)',
    notes TEXT DEFAULT '-',
    order_date VARCHAR(50) NOT NULL,                    -- '23 Sep 2026'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. TABLE: order_items (Item Line Details)
-- --------------------------------------------------------------------
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

-- Indexes for Speed
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
CREATE POLICY "Allow public read orders"
    ON public.orders FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders"
    ON public.orders FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public update orders"
    ON public.orders FOR UPDATE
    TO anon, authenticated
    USING (true);

-- RLS Policies for order_items
DROP POLICY IF EXISTS "Allow public read order_items" ON public.order_items;
CREATE POLICY "Allow public read order_items"
    ON public.order_items FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert order_items" ON public.order_items;
CREATE POLICY "Allow public insert order_items"
    ON public.order_items FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- --------------------------------------------------------------------
-- 4. SEED SAMPLE ORDER (Customer: Willy Pratama)
-- --------------------------------------------------------------------
INSERT INTO public.orders (
    id, tracking_number, courier, status, total_amount, tax_amount, payment_method,
    customer_name, customer_email, customer_phone, shipping_address, postal_code,
    prefecture, city, notes, order_date
) VALUES (
    'SN-JP-849201',
    '4829-3849-2938',
    'Yamato Transport',
    'Dikemas',
    5400,
    400,
    'jpqr',
    'Willy Pratama',
    'willy.tokyo@gmail.com',
    '+81 80-1122-3344',
    '134-0088 Tokyo-to Edogawa-ku Nishi-Kasai 3-1-4, Mansion Sakura #302',
    '134-0088',
    'Tokyo-to (東京都)',
    'Edogawa-ku (江戸川区)',
    'Mohon kirim setelah jam 18:00 (Malam)',
    '23 Sep 2026'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    total_amount = EXCLUDED.total_amount;

INSERT INTO public.order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
VALUES 
    ('SN-JP-849201', '1', 'Indomie Mi Goreng Spesial (Dus / 40 Pcs)', 'https://bfvdvwkyivrikjbefwnm.supabase.co/storage/v1/object/public/product-images/product-1789735975845-nuwx4c.jpg', 4800, 1, 4800),
    ('SN-JP-849201', '2', 'Kecap Manis Bango 550ml', 'https://bfvdvwkyivrikjbefwnm.supabase.co/storage/v1/object/public/product-images/product-1789453624834-rbs12l.jpeg', 600, 1, 600)
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------------------
-- 5. TABLE: pos_transactions (Daftar Penjualan Kasir Toko Fisik)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_transactions (
    id VARCHAR(100) PRIMARY KEY,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cashier_name VARCHAR(150) NOT NULL,
    customer_name VARCHAR(200) DEFAULT 'Walk-in Customer',
    payment_method VARCHAR(50) NOT NULL, -- 'Cash', 'JPQR / QRIS', 'PayPay', 'Credit Card', 'IC Card'
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0, -- 8% JCT Reduced Tax Rate
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    change_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Lunas',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. TABLE: pos_transaction_items (Rincian Item Penjualan Kasir)
-- --------------------------------------------------------------------
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

-- Indexes for POS Performance
CREATE INDEX IF NOT EXISTS idx_pos_transactions_date ON public.pos_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_receipt ON public.pos_transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_payment ON public.pos_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_tx_id ON public.pos_transaction_items(transaction_id);

-- Enable RLS for POS Tables
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pos_transactions
DROP POLICY IF EXISTS "Allow public read pos_transactions" ON public.pos_transactions;
CREATE POLICY "Allow public read pos_transactions"
    ON public.pos_transactions FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert pos_transactions" ON public.pos_transactions;
CREATE POLICY "Allow public insert pos_transactions"
    ON public.pos_transactions FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update pos_transactions" ON public.pos_transactions;
CREATE POLICY "Allow public update pos_transactions"
    ON public.pos_transactions FOR UPDATE
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public delete pos_transactions" ON public.pos_transactions;
CREATE POLICY "Allow public delete pos_transactions"
    ON public.pos_transactions FOR DELETE
    TO anon, authenticated
    USING (true);

-- RLS Policies for pos_transaction_items
DROP POLICY IF EXISTS "Allow public read pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "Allow public read pos_transaction_items"
    ON public.pos_transaction_items FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "Allow public insert pos_transaction_items"
    ON public.pos_transaction_items FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete pos_transaction_items" ON public.pos_transaction_items;
CREATE POLICY "Allow public delete pos_transaction_items"
    ON public.pos_transaction_items FOR DELETE
    TO anon, authenticated
    USING (true);

