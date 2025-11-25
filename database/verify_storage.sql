-- =====================================================
-- VERIFY STORAGE SETUP
-- Run this in Supabase SQL Editor to check storage status
-- =====================================================

-- 1. Check if buckets exist
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name IN ('expense-receipts', 'expense-products');

-- Expected: 2 rows with public = true, file_size_limit = 5242880

-- 2. Check if RLS is enabled on storage.objects
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Expected: rowsecurity = true

-- 3. Check existing storage policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 4. If buckets don't show up, try creating them via SQL:
-- (Only run if SELECT from storage.buckets returns no rows)

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES 
--   ('expense-receipts', 'expense-receipts', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
--   ('expense-products', 'expense-products', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
-- ON CONFLICT (id) DO UPDATE SET
--   public = EXCLUDED.public,
--   file_size_limit = EXCLUDED.file_size_limit,
--   allowed_mime_types = EXCLUDED.allowed_mime_types;
