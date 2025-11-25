-- =====================================================
-- VERIFY ADMIN SYSTEM SETUP
-- Run these queries to check everything is configured
-- =====================================================

-- 1. Check if user_profiles table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Check if auth users exist
SELECT 
    id,
    email,
    created_at,
    confirmed_at
FROM auth.users
ORDER BY email;

-- 3. Check user profiles (should have 3 admins)
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM user_profiles
ORDER BY full_name;

-- 4. Check expenses table structure (should have created_by column)
SELECT 
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_name = 'expenses'
    AND column_name IN ('created_by', 'amount', 'category', 'expense_date')
ORDER BY ordinal_position;

-- 5. Check RLS policies on user_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 6. Check RLS policies on expenses
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'expenses';

-- 7. Sample expense data (optional - adds test expenses for each user)
-- Uncomment to insert test data:

/*
-- Get user IDs
WITH user_ids AS (
    SELECT id, full_name FROM user_profiles WHERE full_name IN ('Vinod', 'Neelam', 'Goutham')
)
INSERT INTO expenses (amount, category, description, expense_date, created_by, notes)
VALUES
    (150.00, 'materials', 'Essential oils purchase', '2025-11-20', (SELECT id FROM user_ids WHERE full_name = 'Vinod'), 'Lavender and rose oils'),
    (300.00, 'marketing', 'Social media ads', '2025-11-21', (SELECT id FROM user_ids WHERE full_name = 'Neelam'), 'Instagram campaign'),
    (200.00, 'packaging', 'Glass bottles order', '2025-11-22', (SELECT id FROM user_ids WHERE full_name = 'Goutham'), '100 units 50ml bottles'),
    (450.00, 'rent', 'Workshop rent - November', '2025-11-01', (SELECT id FROM user_ids WHERE full_name = 'Vinod'), 'Monthly rent payment'),
    (120.00, 'utilities', 'Electricity bill', '2025-11-15', (SELECT id FROM user_ids WHERE full_name = 'Neelam'), 'October usage'),
    (180.00, 'shipping', 'Courier service', '2025-11-23', (SELECT id FROM user_ids WHERE full_name = 'Goutham'), 'Customer deliveries');
*/

-- 8. Check total expenses by user
SELECT 
    up.full_name,
    COUNT(e.id) as expense_count,
    SUM(e.amount) as total_amount
FROM user_profiles up
LEFT JOIN expenses e ON e.created_by = up.id
GROUP BY up.id, up.full_name
ORDER BY up.full_name;

-- 9. Check expenses by category
SELECT 
    category,
    COUNT(*) as count,
    SUM(amount) as total
FROM expenses
GROUP BY category
ORDER BY total DESC;

-- Expected Results:
-- - 3 users in auth.users (vinod, neelam, goutham)
-- - 3 profiles in user_profiles
-- - RLS policies active on both tables
-- - expenses table has created_by column
