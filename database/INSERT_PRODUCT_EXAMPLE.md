# How to Insert Products in Supabase

## ⚠️ IMPORTANT: Do NOT include `is_low_stock` in INSERT statements

The `is_low_stock` column is a **GENERATED COLUMN** that is automatically computed from:
```sql
is_low_stock = (stock_quantity <= low_stock_threshold)
```

## ✅ CORRECT: Insert Product Without `is_low_stock`

```sql
-- Insert a new product (is_low_stock will be computed automatically)
INSERT INTO products (
  name,
  description,
  price,
  notes,
  classification,
  category_id,
  stock_quantity,
  low_stock_threshold,
  quality_rating,
  product_images,
  background_image,
  is_active
) VALUES (
  'Azure Dreams',
  'A fresh aquatic fragrance with notes of sea salt and citrus.',
  139.99,
  ARRAY['Sea Salt', 'Bergamot', 'Driftwood'],
  'edt',
  'YOUR-CATEGORY-ID-HERE',  -- Get this from: SELECT id FROM categories WHERE slug = 'perfumes'
  25,                         -- stock_quantity
  20,                         -- low_stock_threshold (is_low_stock will be TRUE since 25 > 20? No, 25 > 20 is false, so is_low_stock = false)
  4.6,                        -- quality_rating
  ARRAY['/images/azure-dreams.png'],
  '/images/azure-dreams-bg.jpg',
  true                        -- is_active
);
```

## ❌ WRONG: Including `is_low_stock` will cause error

```sql
-- DON'T DO THIS - Will cause ERROR 428C9
INSERT INTO products (
  name,
  stock_quantity,
  low_stock_threshold,
  is_low_stock  -- ❌ ERROR: cannot insert into generated column
) VALUES (
  'Test Product',
  10,
  20,
  true  -- ❌ This will fail!
);
```

## 📝 Using Supabase Dashboard Table Editor

When using the Supabase Dashboard to manually insert a product:

1. **Do NOT check/fill the `is_low_stock` field** - leave it empty
2. Only fill these fields:
   - `name` (required)
   - `description`
   - `price` (required)
   - `notes` (array of strings)
   - `classification` ('edp', 'edt', 'edp', or 'extrait')
   - `category_id` (get from categories table)
   - `stock_quantity` (default: 0)
   - `low_stock_threshold` (default: 20)
   - `quality_rating` (0-5)
   - `product_images` (array of URLs)
   - `background_image` (URL)
   - `is_active` (default: true)

3. The `is_low_stock` column will **automatically** show `true` or `false` after the insert completes

## 🔍 How It Works

```
If stock_quantity = 15 and low_stock_threshold = 20
Then is_low_stock = TRUE (automatically)

If stock_quantity = 50 and low_stock_threshold = 20  
Then is_low_stock = FALSE (automatically)
```

## 🛠️ If You Need to Change `is_low_stock`

You cannot directly update `is_low_stock`. Instead, update the source values:

```sql
-- To make a product low stock:
UPDATE products 
SET stock_quantity = 10, low_stock_threshold = 20 
WHERE id = 'product-id';
-- Result: is_low_stock will become TRUE

-- To remove low stock status:
UPDATE products 
SET stock_quantity = 100 
WHERE id = 'product-id';
-- Result: is_low_stock will become FALSE
```

## 📊 Get Category ID for Products

```sql
-- Find the perfumes category ID first
SELECT id, name, slug FROM categories WHERE slug = 'perfumes';

-- Use that ID in your product insert
```
