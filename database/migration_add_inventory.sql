-- =====================================================
-- MIGRATION: Add Inventory & Image Features
-- This adds new columns to existing products table
-- =====================================================

-- Add inventory tracking columns to products table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
        ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
        ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER DEFAULT 20;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'quality_rating') THEN
        ALTER TABLE products ADD COLUMN quality_rating DECIMAL(3, 2) CHECK (quality_rating >= 0 AND quality_rating <= 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'product_images') THEN
        ALTER TABLE products ADD COLUMN product_images TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'background_image') THEN
        ALTER TABLE products ADD COLUMN background_image TEXT;
    END IF;
END $$;

-- Add computed column for low stock (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'is_low_stock') THEN
        ALTER TABLE products ADD COLUMN is_low_stock BOOLEAN 
            GENERATED ALWAYS AS (stock_quantity <= low_stock_threshold) STORED;
    END IF;
END $$;

-- Create index for low stock queries (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(is_low_stock) WHERE is_low_stock = true;

-- Update existing products with inventory data
-- Get the perfumes category ID
DO $$
DECLARE
    perfume_category_id UUID;
    product_count INTEGER;
BEGIN
    SELECT id INTO perfume_category_id FROM categories WHERE slug = 'perfumes';
    
    -- Check if products already exist
    SELECT COUNT(*) INTO product_count FROM products;
    
    IF product_count = 0 THEN
        -- Insert all 6 products if none exist
        INSERT INTO products (name, description, price, notes, classification, category_id, stock_quantity, low_stock_threshold, quality_rating, product_images, background_image) VALUES
        (
            'Golden Dawn',
            'A luminous fragrance that captures the essence of a Mediterranean sunrise. Bergamot and amber blend seamlessly with cedarwood, creating a warm and inviting aroma perfect for any occasion.',
            129.99,
            ARRAY['Bergamot', 'Amber', 'Cedarwood'],
            'edp',
            perfume_category_id,
            50,
            20,
            4.9,
            ARRAY['/images/golden-dawn.png'],
            '/images/golden-dawn-bg.jpg'
        ),
        (
            'Midnight Elegance',
            'Embrace the mystery of the night with this sophisticated blend. Black currant and vanilla create a rich base, while sandalwood adds depth and sensuality to this captivating evening fragrance.',
            149.99,
            ARRAY['Black Currant', 'Vanilla', 'Sandalwood'],
            'edp',
            perfume_category_id,
            15,
            20,
            4.8,
            ARRAY['/images/midnight-elegance.png'],
            '/images/midnight-elegance-bg.jpg'
        ),
        (
            'Rose Mystique',
            'An enchanting floral composition that celebrates the timeless elegance of rose. Enhanced with jasmine and white musk, this fragrance embodies romance and femininity in its purest form.',
            139.99,
            ARRAY['Rose', 'Jasmine', 'White Musk'],
            'edt',
            perfume_category_id,
            45,
            20,
            4.7,
            ARRAY['/images/rose-mystique.png'],
            '/images/rose-mystique-bg.jpg'
        ),
        (
            'GIT',
            'A bold and captivating Eau de Parfum that commands attention. Complex layers unfold with every wear, revealing a sophisticated blend of rare ingredients.',
            159.99,
            ARRAY['Bergamot', 'Leather', 'Oud'],
            'edp',
            perfume_category_id,
            30,
            20,
            4.8,
            ARRAY['/images/git.png'],
            '/images/git-bg.jpg'
        ),
        (
            'Ganamyde',
            'An extraordinary Parfum Extrait of unparalleled intensity. A masterful composition reserved for true connoisseurs who appreciate the finest raw materials.',
            249.99,
            ARRAY['Iris', 'Ambergris', 'Vetiver'],
            'extrait',
            perfume_category_id,
            12,
            15,
            4.9,
            ARRAY['/images/ganamyde.png'],
            '/images/ganamyde-bg.jpg'
        ),
        (
            'Guidance',
            'A luxurious Parfum Extrait that leads you through an olfactory journey. Rich, profound, and enduring with exceptional longevity and sillage.',
            269.99,
            ARRAY['Saffron', 'Patchouli', 'Musk'],
            'extrait',
            perfume_category_id,
            8,
            10,
            5.0,
            ARRAY['/images/guidance.png'],
            '/images/guidance-bg.jpg'
        );
    ELSE
        -- Update existing products with inventory data
        UPDATE products SET 
            stock_quantity = COALESCE(stock_quantity, 50),
            low_stock_threshold = COALESCE(low_stock_threshold, 20),
            quality_rating = COALESCE(quality_rating, 4.8),
            product_images = CASE 
                WHEN product_images IS NULL THEN ARRAY['/images/' || LOWER(REPLACE(name, ' ', '-')) || '.png']
                ELSE product_images
            END,
            background_image = CASE
                WHEN background_image IS NULL THEN '/images/' || LOWER(REPLACE(name, ' ', '-')) || '-bg.jpg'
                ELSE background_image
            END
        WHERE stock_quantity IS NULL OR quality_rating IS NULL OR product_images IS NULL OR background_image IS NULL;
    END IF;
END $$;

-- Insert testimonials if they don't exist
DO $$
BEGIN
    INSERT INTO testimonials (customer_name, customer_title, rating, testimonial, is_approved, is_featured)
    SELECT * FROM (VALUES
        ('Sophie Laurent', 'Perfume Enthusiast', 5, 'Golden Dawn has become my signature scent. The blend is absolutely divine and lasts throughout the day.', true, true),
        ('Marcus Chen', 'Fragrance Collector', 5, 'The quality and craftsmanship are unparalleled. Each bottle is a work of art.', true, true),
        ('Isabella Romano', 'Fashion Blogger', 5, 'Midnight Elegance is pure sophistication. I receive compliments every time I wear it.', true, false)
    ) AS new_testimonials(customer_name, customer_title, rating, testimonial, is_approved, is_featured)
    WHERE NOT EXISTS (
        SELECT 1 FROM testimonials WHERE customer_name = new_testimonials.customer_name
    );
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;
