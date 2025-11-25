-- =====================================================
-- SUPABASE STORAGE SETUP FOR IMAGES
-- Run this after admin_auth_setup.sql
-- =====================================================

-- Add image columns to expenses table
ALTER TABLE expenses 
    ADD COLUMN IF NOT EXISTS receipt_images TEXT[], -- Array of receipt image URLs
    ADD COLUMN IF NOT EXISTS product_images TEXT[]; -- Array of product image URLs

-- =====================================================
-- STORAGE BUCKETS SETUP
-- These need to be created in Supabase Dashboard > Storage
-- =====================================================

-- MANUAL STEPS:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "Create a new bucket"
-- 3. Create two buckets:
--
--    Bucket 1: expense_receipts (with underscore, not hyphen!)
--    - Name: expense_receipts
--    - Public: YES (so admins can view)
--    - File size limit: 5 MB
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
--
--    Bucket 2: expense_products (with underscore, not hyphen!)
--    - Name: expense_products
--    - Public: YES
--    - File size limit: 5 MB
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- =====================================================
-- STORAGE POLICIES (Run in SQL Editor)
-- =====================================================

-- NOTE: RLS is already enabled on storage.objects and storage.buckets by Supabase
-- We just need to create the policies

-- Drop existing policies if they exist (for idempotent execution)
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;

-- Policy for expense_receipts bucket
-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'expense_receipts' AND
    auth.role() = 'authenticated'
);

-- Authenticated users can view receipts
CREATE POLICY "Authenticated users can view receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'expense_receipts');

-- Users can update their own receipt uploads
CREATE POLICY "Users can update own receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'expense_receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own receipt uploads
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'expense_receipts' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for expense_products bucket
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'expense_products' AND
    auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can view product images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'expense_products');

CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'expense_products' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'expense_products' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get public URL for an image
CREATE OR REPLACE FUNCTION get_storage_url(bucket text, path text)
RETURNS text AS $$
BEGIN
    RETURN (
        SELECT 
            (current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/' || bucket || '/' || path)
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'expenses' 
    AND column_name IN ('receipt_images', 'product_images');

-- After creating buckets in Dashboard, verify storage policies:
-- SELECT * FROM storage.buckets WHERE name IN ('expense-receipts', 'expense-products');

-- Expected result: 2 buckets with public = true
