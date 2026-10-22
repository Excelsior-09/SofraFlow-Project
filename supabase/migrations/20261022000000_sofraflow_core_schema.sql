-- ====================================================================
-- SOFRAFLOW — CORE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Migration: 20261022000000_sofraflow_core_schema.sql
-- ====================================================================

-- 1. PROFILES (Linked 1-to-1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  preferred_language TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. RESTAURANTS / BUSINESSES
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  business_type TEXT DEFAULT 'restaurant' CHECK (business_type IN ('restaurant', 'cafe', 'snack', 'bakery', 'other')),
  description TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Casablanca',
  address TEXT,
  country TEXT DEFAULT 'Morocco',
  logo_url TEXT,
  cover_image_url TEXT,
  primary_color TEXT DEFAULT '#153E35',
  accent_color TEXT DEFAULT '#EA580C',
  currency TEXT DEFAULT 'MAD',
  default_language TEXT DEFAULT 'fr',
  supported_languages JSONB DEFAULT '["fr", "en", "ar"]'::jsonb,
  settings JSONB DEFAULT '{"currency":"MAD","taxRatePercent":10,"serviceFeePercent":0,"enableDineIn":true,"enableTakeaway":true,"enableDelivery":false,"requireCustomerPhone":false,"tableCount":12}'::jsonb,
  whatsapp_config JSONB DEFAULT '{"enabled":true,"destinationPhoneNumber":"","destinationName":"Kitchen Dispatch","apiProvider":"meta_cloud_api","templateName":"sofraflow_order_notification_v1","templateLanguage":"fr"}'::jsonb,
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'growth', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'past_due')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. MENUS
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  template_id TEXT DEFAULT 'template_modern_fine_dining',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_published BOOLEAN DEFAULT false NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. MENU CATEGORIES (Multilingual name & description via JSONB)
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  description JSONB,
  icon TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  is_visible BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. MENU ITEMS / PRODUCTS (Multilingual name & description, numeric MAD price)
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  description JSONB,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  currency TEXT DEFAULT 'MAD',
  image_url TEXT,
  is_popular BOOLEAN DEFAULT false NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  dietary TEXT CHECK (dietary IS NULL OR dietary IN ('halal', 'vegetarian', 'chef_special', 'spicy', 'vegan', 'gluten_free')),
  dietary_tags JSONB DEFAULT '[]'::jsonb,
  verified_ingredients JSONB DEFAULT '[]'::jsonb,
  verified_allergens JSONB DEFAULT '[]'::jsonb,
  option_groups JSONB DEFAULT '[]'::jsonb,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. SMART QR & NFC SETTINGS
CREATE TABLE IF NOT EXISTS public.qr_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
  target_url TEXT,
  table_number TEXT,
  label TEXT DEFAULT 'Table QR Code',
  custom_color TEXT DEFAULT '#153E35',
  show_logo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. ORDERS & DISPATCH
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  public_order_reference TEXT NOT NULL,
  order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  table_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  currency TEXT DEFAULT 'MAD',
  subtotal NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  service_fee_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  total NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  notification_status TEXT DEFAULT 'pending' CHECK (notification_status IN ('pending', 'processing', 'accepted', 'delivered', 'failed')),
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_menus_restaurant ON public.menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_published ON public.menus(is_published);
CREATE INDEX IF NOT EXISTS idx_categories_menu ON public.menu_categories(menu_id);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_menu ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(public_order_reference);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. RESTAURANTS POLICIES
DROP POLICY IF EXISTS "Owners can view own restaurants" ON public.restaurants;
CREATE POLICY "Owners can view own restaurants"
  ON public.restaurants FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert own restaurants" ON public.restaurants;
CREATE POLICY "Owners can insert own restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own restaurants" ON public.restaurants;
CREATE POLICY "Owners can update own restaurants"
  ON public.restaurants FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete own restaurants" ON public.restaurants;
CREATE POLICY "Owners can delete own restaurants"
  ON public.restaurants FOR DELETE
  USING (auth.uid() = owner_id);

-- Public can read basic published restaurant data for customer menus
DROP POLICY IF EXISTS "Public can view restaurant branding" ON public.restaurants;
CREATE POLICY "Public can view restaurant branding"
  ON public.restaurants FOR SELECT
  USING (true);

-- 3. MENUS POLICIES
DROP POLICY IF EXISTS "Owners can manage own menus" ON public.menus;
CREATE POLICY "Owners can manage own menus"
  ON public.menus FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view published menus" ON public.menus;
CREATE POLICY "Public can view published menus"
  ON public.menus FOR SELECT
  USING (is_published = true);

-- 4. MENU CATEGORIES POLICIES
DROP POLICY IF EXISTS "Owners can manage own categories" ON public.menu_categories;
CREATE POLICY "Owners can manage own categories"
  ON public.menu_categories FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view categories of published menus" ON public.menu_categories;
CREATE POLICY "Public can view categories of published menus"
  ON public.menu_categories FOR SELECT
  USING (
    menu_id IN (
      SELECT id FROM public.menus WHERE is_published = true
    )
    AND is_visible = true
  );

-- 5. MENU ITEMS POLICIES
DROP POLICY IF EXISTS "Owners can manage own items" ON public.menu_items;
CREATE POLICY "Owners can manage own items"
  ON public.menu_items FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view items of published menus" ON public.menu_items;
CREATE POLICY "Public can view items of published menus"
  ON public.menu_items FOR SELECT
  USING (
    menu_id IN (
      SELECT id FROM public.menus WHERE is_published = true
    )
    AND is_available = true
  );

-- 6. QR SETTINGS POLICIES
DROP POLICY IF EXISTS "Owners can manage qr settings" ON public.qr_settings;
CREATE POLICY "Owners can manage qr settings"
  ON public.qr_settings FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public can view qr settings" ON public.qr_settings;
CREATE POLICY "Public can view qr settings"
  ON public.qr_settings FOR SELECT
  USING (true);

-- 7. ORDERS POLICIES
DROP POLICY IF EXISTS "Owners can view and manage orders" ON public.orders;
CREATE POLICY "Owners can view and manage orders"
  ON public.orders FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Public customers can create orders" ON public.orders;
CREATE POLICY "Public customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public customers can view their order by reference" ON public.orders;
CREATE POLICY "Public customers can view their order by reference"
  ON public.orders FOR SELECT
  USING (true);

-- ====================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'owner'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- AUTO-UPDATE TIMESTAMPS
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_restaurants_modtime ON public.restaurants;
CREATE TRIGGER update_restaurants_modtime BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_menus_modtime ON public.menus;
CREATE TRIGGER update_menus_modtime BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_categories_modtime ON public.menu_categories;
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_items_modtime ON public.menu_items;
CREATE TRIGGER update_items_modtime BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
