-- ====================================================================
-- SEMBAKO NUSANTARA JEPANG - SUPABASE SCHEMA: ADMIN ACCOUNTS
-- ====================================================================

-- 1. Create Table admin_accounts
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Anon & Authenticated access
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

-- 4. Seed Akun Admin Resmi
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
