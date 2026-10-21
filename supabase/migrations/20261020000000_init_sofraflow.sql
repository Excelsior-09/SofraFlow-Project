-- ====================================================================
-- SOFRAFLOW SAAS — COMPLETE RELATIONAL DATABASE SCHEMA & MIGRATIONS
-- Relational model with Multi-Tenant Row Level Security (RLS)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Restaurants Entity
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    address VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Casablanca',
    country VARCHAR(100) DEFAULT 'Morocco',
    phone VARCHAR(50),
    logo_url TEXT,
    cover_image_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'growth',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- 2. Restaurant Users & Membership
CREATE TABLE IF NOT EXISTS restaurant_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'owner', -- 'owner', 'manager', 'staff'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, restaurant_id)
);

CREATE INDEX idx_members_restaurant_id ON restaurant_members(restaurant_id);

-- 3. Restaurant Operational & Fulfillment Settings
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE,
    currency VARCHAR(10) DEFAULT 'MAD',
    tax_rate_percent NUMERIC(5,2) DEFAULT 10.00,
    service_fee_percent NUMERIC(5,2) DEFAULT 0.00,
    enable_dine_in BOOLEAN DEFAULT TRUE,
    enable_takeaway BOOLEAN DEFAULT TRUE,
    enable_delivery BOOLEAN DEFAULT FALSE,
    require_customer_phone BOOLEAN DEFAULT FALSE,
    table_count INT DEFAULT 20,
    opening_hours JSONB DEFAULT '{}'::jsonb,
    custom_brand_color VARCHAR(20) DEFAULT '#153E35',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WhatsApp Integration Configuration
CREATE TABLE IF NOT EXISTS whatsapp_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    destination_phone_number VARCHAR(50) NOT NULL,
    destination_name VARCHAR(100) DEFAULT 'Kitchen Pass',
    api_provider VARCHAR(50) DEFAULT 'meta_cloud_api',
    phone_number_id VARCHAR(100),
    waba_id VARCHAR(100),
    system_access_token TEXT, -- Stored encrypted in vault in production
    template_name VARCHAR(100) DEFAULT 'sofraflow_order_notification_v1',
    template_language VARCHAR(20) DEFAULT 'fr',
    last_test_status VARCHAR(20),
    last_test_timestamp TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255),
    name_ar VARCHAR(255),
    description_en TEXT,
    description_fr TEXT,
    description_ar TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_restaurant ON menu_categories(restaurant_id);

-- 6. Menus
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'published', -- 'draft', 'published', 'archived'
    is_default BOOLEAN DEFAULT FALSE,
    enabled_languages TEXT[] DEFAULT ARRAY['en', 'fr', 'ar'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(restaurant_id, slug)
);

CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);

-- 7. Products Catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255),
    name_ar VARCHAR(255),
    description_en TEXT,
    description_fr TEXT,
    description_ar TEXT,
    price NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MAD',
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    dietary_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    verified_ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
    verified_allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(category_id);

-- 8. Product Option Groups & Modifiers
CREATE TABLE IF NOT EXISTS product_option_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_fr VARCHAR(255),
    title_ar VARCHAR(255),
    required BOOLEAN DEFAULT FALSE,
    min_selections INT DEFAULT 0,
    max_selections INT DEFAULT 1,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_option_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_group_id UUID NOT NULL REFERENCES product_option_groups(id) ON DELETE CASCADE,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255),
    name_ar VARCHAR(255),
    price_modifier NUMERIC(10,2) DEFAULT 0.00,
    sort_order INT DEFAULT 0
);

-- 9. Orders (Source of Truth)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_order_reference VARCHAR(50) NOT NULL UNIQUE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    order_type VARCHAR(50) NOT NULL, -- 'dine_in', 'takeaway', 'delivery'
    table_number VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_notes TEXT,
    currency VARCHAR(10) DEFAULT 'MAD',
    subtotal NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0.00,
    service_fee_amount NUMERIC(10,2) DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
    notification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'accepted', 'delivered', 'failed'
    notification_event_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_reference ON orders(public_order_reference);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- 10. Order Items Snapshot (Immutable)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name_en VARCHAR(255) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL,
    selected_options JSONB DEFAULT '[]'::jsonb,
    special_instructions TEXT,
    subtotal NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 11. WhatsApp Notification Delivery Audit Events
CREATE TABLE IF NOT EXISTS notification_events (
    id VARCHAR(100) PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    destination_phone_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_message_id VARCHAR(255),
    attempt_count INT DEFAULT 1,
    payload_snapshot JSONB NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifs_restaurant ON notification_events(restaurant_id);
CREATE INDEX idx_notifs_order ON notification_events(order_id);

-- 12. Order Status Audit Logs
CREATE TABLE IF NOT EXISTS order_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR TENANT DATA ISOLATION
-- ====================================================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;

-- Public can view published restaurant details and published products
CREATE POLICY "Public can view published restaurants" ON restaurants
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view published products" ON products
    FOR SELECT USING (is_available = TRUE);

-- Public can insert new orders via customer digital menu
CREATE POLICY "Public can submit orders" ON orders
    FOR INSERT WITH CHECK (TRUE);

-- Authenticated restaurant members can only access their own restaurant's data
CREATE POLICY "Members view own restaurant orders" ON orders
    FOR ALL USING (
        restaurant_id IN (
            SELECT restaurant_id FROM restaurant_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Members manage own products" ON products
    FOR ALL USING (
        restaurant_id IN (
            SELECT restaurant_id FROM restaurant_members WHERE user_id = auth.uid()
        )
    );
