-- =====================================================
-- PERFUME E-COMMERCE DATABASE SCHEMA
-- Supabase PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default category
INSERT INTO categories (name, slug, description) VALUES
('Perfumes', 'perfumes', 'Luxury fragrances and perfumes');

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TYPE classification_type AS ENUM ('edp', 'edt', 'extrait');

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    notes TEXT[], -- Array of fragrance notes
    product_images TEXT[], -- Array of image URLs
    background_image TEXT, -- Hero/backdrop image
    classification classification_type NOT NULL DEFAULT 'edp',
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 20, -- Alert when stock falls below this
    is_low_stock BOOLEAN GENERATED ALWAYS AS (stock_quantity <= low_stock_threshold) STORED,
    quality_rating DECIMAL(3, 2) CHECK (quality_rating >= 0 AND quality_rating <= 5), -- 0-5 stars
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_classification ON products(classification);
CREATE INDEX idx_products_low_stock ON products(is_low_stock) WHERE is_low_stock = true;

-- =====================================================
-- CONTACT INQUIRIES TABLE
-- =====================================================
CREATE TABLE contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, replied, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contact_status ON contact_inquiries(status);
CREATE INDEX idx_contact_created ON contact_inquiries(created_at DESC);

-- =====================================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_newsletter_active ON newsletter_subscriptions(is_active);

-- =====================================================
-- TESTIMONIALS TABLE
-- =====================================================
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_title VARCHAR(255), -- e.g., "Perfume Enthusiast"
    customer_image TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    testimonial TEXT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);

-- =====================================================
-- EXPENSES TRACKER (ADMIN ONLY)
-- =====================================================
CREATE TYPE expense_category_type AS ENUM (
    'materials',
    'marketing',
    'operations',
    'shipping',
    'packaging',
    'rent',
    'utilities',
    'salaries',
    'other'
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount DECIMAL(10, 2) NOT NULL,
    category expense_category_type NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    created_by VARCHAR(255), -- Will link to auth users later
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);

-- =====================================================
-- ORDERS TABLE (Future - for full e-commerce)
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    shipping_address JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL, -- Store name in case product is deleted
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on sensitive tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Public read access for products (anyone can view)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = true);

-- Public read access for testimonials (only approved ones)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved testimonials are viewable by everyone"
    ON testimonials FOR SELECT
    USING (is_approved = true);

-- Newsletter subscriptions - insert only for public
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to newsletter"
    ON newsletter_subscriptions FOR INSERT
    WITH CHECK (true);

-- Contact inquiries - insert only for public
CREATE POLICY "Anyone can submit contact inquiries"
    ON contact_inquiries FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Get the perfumes category ID
DO $$
DECLARE
    perfume_category_id UUID;
BEGIN
    SELECT id INTO perfume_category_id FROM categories WHERE slug = 'perfumes';
    
    -- Insert sample products
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
END $$;

-- Sample testimonials
INSERT INTO testimonials (customer_name, customer_title, rating, testimonial, is_approved, is_featured) VALUES
(
    'Sophie Laurent',
    'Perfume Enthusiast',
    5,
    'Golden Dawn has become my signature scent. The blend is absolutely divine and lasts throughout the day.',
    true,
    true
),
(
    'Marcus Chen',
    'Fragrance Collector',
    5,
    'The quality and craftsmanship are unparalleled. Each bottle is a work of art.',
    true,
    true
),
(
    'Isabella Romano',
    'Fashion Blogger',
    5,
    'Midnight Elegance is pure sophistication. I receive compliments every time I wear it.',
    true,
    false
);
