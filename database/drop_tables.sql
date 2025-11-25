-- =====================================================
-- DROP ALL TABLES - USE WITH CAUTION
-- This will delete all existing data
-- =====================================================

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS contact_inquiries CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS classification_type CASCADE;
DROP TYPE IF EXISTS expense_category_type CASCADE;

-- Drop the update function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Note: UUID extension will remain enabled
