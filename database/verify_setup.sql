-- =====================================================
-- VERIFY DATABASE SETUP
-- Run these queries to check your data
-- =====================================================

-- 1. Check all products with inventory data
SELECT 
    name,
    price,
    classification,
    stock_quantity,
    low_stock_threshold,
    is_low_stock,
    quality_rating
FROM products
ORDER BY name;

-- 2. Check LOW STOCK products (should show 3 items)
SELECT 
    name,
    stock_quantity,
    low_stock_threshold,
    is_low_stock
FROM products
WHERE is_low_stock = true
ORDER BY stock_quantity;

-- 3. Check product images
SELECT 
    name,
    product_images,
    background_image
FROM products
ORDER BY name;

-- 4. Check testimonials
SELECT 
    customer_name,
    rating,
    is_approved,
    is_featured
FROM testimonials
ORDER BY created_at;

-- 5. Get product count by classification
SELECT 
    classification,
    COUNT(*) as count,
    AVG(price) as avg_price
FROM products
GROUP BY classification
ORDER BY classification;
