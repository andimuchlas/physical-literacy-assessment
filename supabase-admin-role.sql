-- ============================================
-- SET ADMIN ROLE FOR USER
-- ============================================
-- Jalankan ini SETELAH membuat user di Supabase Auth Dashboard
-- Ganti email dengan email admin yang sudah dibuat

-- Contoh: Set user dengan email tertentu sebagai admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';  -- 👈 GANTI INI dengan email admin Anda

-- Verifikasi: Cek apakah role sudah di-set
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'admin@example.com';  -- 👈 GANTI INI dengan email admin Anda

-- ============================================
-- CARA PAKAI:
-- ============================================
-- 1. Buka Supabase Dashboard → Authentication → Users
-- 2. Klik "Add User" (bukan "Invite")
-- 3. Masukkan email & password untuk admin
-- 4. Setelah user terbuat, jalankan SQL di atas di SQL Editor
-- 5. Ganti 'admin@example.com' dengan email yang baru dibuat
-- 6. Execute query
-- 7. Cek dengan query SELECT untuk verifikasi role = "admin"
-- ============================================

-- OPTIONAL: Buat function untuk mudah set admin role di masa depan
CREATE OR REPLACE FUNCTION set_admin_role(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  )
  WHERE email = user_email;
END;
$$;

-- Cara pakai function:
-- SELECT set_admin_role('newemail@example.com');
