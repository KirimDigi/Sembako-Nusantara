-- ====================================================================
-- SEMBAKO NUSANTARA JEPANG - SUPABASE SCHEMA: ORDERS & ORDER ITEMS
-- Jalankan script SQL ini di Supabase SQL Editor untuk mengaktifkan
-- sinkronisasi pesanan pelanggan (Willy Pratama) dengan Admin & Kurir.
-- ====================================================================

-- 1. Table: orders
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

-- 2. Table: order_items
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

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 4. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
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

-- 6. Sample Data (Customer: Willy Pratama)
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
