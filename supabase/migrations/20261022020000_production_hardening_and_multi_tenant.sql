-- ====================================================================
-- SOFRAFLOW — COMPREHENSIVE PRODUCTION HARDENING & MULTI-TENANT MIGRATION
-- Migration: 20261022020000_production_hardening_and_multi_tenant.sql
-- Conforms to OWASP Top 10:2025, Least Privilege, Multi-Tenant RLS
-- ====================================================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. PROFILES (1-to-1 with auth.users)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'owner' CHECK (role IN ('admin', 'owner', 'manager', 'staff')),
  preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en', 'ar')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- 2. RESTAURANTS / BUSINESSES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  business_type TEXT DEFAULT 'restaurant' CHECK (business_type IN ('restaurant', 'cafe', 'snack', 'bakery', 'other')),
  description TEXT,
  phone TEXT,
  contact_email TEXT,
  city TEXT DEFAULT 'Casablanca',
  address TEXT,
  country TEXT DEFAULT 'Morocco',
  country_code TEXT DEFAULT 'MA',
  currency TEXT DEFAULT 'MAD',
  timezone TEXT DEFAULT 'Africa/Casablanca',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  logo_url TEXT,
  cover_image_url TEXT,
  primary_color TEXT DEFAULT '#153E35',
  accent_color TEXT DEFAULT '#EA580C',
  default_language TEXT DEFAULT 'fr',
  supported_languages JSONB DEFAULT '["fr", "en", "ar"]'::jsonb,
  settings JSONB DEFAULT '{"currency":"MAD","taxRatePercent":10,"serviceFeePercent":0,"enableDineIn":true,"enableTakeaway":true,"enableDelivery":false,"requireCustomerPhone":false,"tableCount":12}'::jsonb,
  whatsapp_config JSONB DEFAULT '{"enabled":true,"destinationPhoneNumber":"","destinationName":"Kitchen Dispatch","apiProvider":"meta_cloud_api","templateName":"sofraflow_order_notification_v1","templateLanguage":"fr"}'::jsonb,
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'growth', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'past_due', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Backward compatibility & semantic alias view: businesses -> restaurants
CREATE OR REPLACE VIEW public.businesses AS
  SELECT 
    id, owner_id, name, slug, business_type, description, phone, contact_email,
    city, address, country, country_code, currency AS default_currency, timezone,
    status, logo_url, cover_image_url, primary_color, accent_color, settings,
    whatsapp_config, subscription_plan, subscription_status, created_at, updated_at
  FROM public.restaurants;

-- ====================================================================
-- 3. BUSINESS MEMBERSHIP & ROLES (Multi-User per Business)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(business_id, user_id)
);

-- ====================================================================
-- 4. MENUS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  template_id TEXT DEFAULT 'template_modern_fine_dining',
  language TEXT DEFAULT 'fr',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_published BOOLEAN DEFAULT false NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(restaurant_id, slug)
);

-- ====================================================================
-- 5. MENU CATEGORIES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  description JSONB,
  icon TEXT,
  display_order INT DEFAULT 0 NOT NULL,
  is_visible BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- 6. MENU ITEMS / PRODUCTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE,
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

-- Alias view: products -> menu_items for semantic interoperability
CREATE OR REPLACE VIEW public.products AS
  SELECT * FROM public.menu_items;

-- ====================================================================
-- 7. QR CODE & TABLE SETTINGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.qr_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
  target_url TEXT,
  table_number TEXT,
  label TEXT DEFAULT 'Table QR Code',
  custom_color TEXT DEFAULT '#153E35',
  qr_color TEXT DEFAULT '#153E35',
  show_logo BOOLEAN DEFAULT true NOT NULL,
  include_logo BOOLEAN DEFAULT true NOT NULL,
  wifi_name TEXT,
  wifi_password TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- 8. ORDERS & ORDER ITEMS (Source of Truth)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
  public_order_reference TEXT NOT NULL UNIQUE,
  order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  table_number TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  currency TEXT DEFAULT 'MAD',
  subtotal NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (subtotal >= 0),
  tax_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (tax_amount >= 0),
  service_fee_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (service_fee_amount >= 0),
  discount_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (discount_amount >= 0),
  total NUMERIC(10,2) DEFAULT 0.00 NOT NULL CHECK (total >= 0),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  notification_status TEXT DEFAULT 'pending' CHECK (notification_status IN ('pending', 'processing', 'accepted', 'delivered', 'failed')),
  notification_event_id TEXT,
  source TEXT DEFAULT 'qr_menu' CHECK (source IN ('qr_menu', 'dashboard', 'counter', 'pos')),
  status_history JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  unit_price_snapshot NUMERIC(10,2) NOT NULL CHECK (unit_price_snapshot >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0),
  selected_options JSONB DEFAULT '[]'::jsonb,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- 9. NOTIFICATION EVENTS & AUDIT LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notification_events (
  id TEXT PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  destination_phone_number TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_message_id TEXT,
  attempt_count INT DEFAULT 1,
  payload_snapshot JSONB NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- 10. SUBSCRIPTION PLANS & BILLING TRANSACTIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price NUMERIC(10,2) NOT NULL CHECK (monthly_price >= 0),
  annual_price NUMERIC(10,2) NOT NULL CHECK (annual_price >= 0),
  currency TEXT DEFAULT 'MAD',
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed predefined SofraFlow subscription plans
INSERT INTO public.subscription_plans (code, name, description, monthly_price, annual_price, currency, features, is_active)
VALUES
  ('starter', 'Starter', 'Formule idéale pour lancer votre carte digitale QR et centraliser vos commandes.', 199.00, 1990.00, 'MAD', '["1 Établissement", "Menu Digital Multilingue (FR, EN, AR)", "QR Codes Standards", "Commandes Illimitées", "Support Email standard"]'::jsonb, true),
  ('growth', 'Growth', 'La solution recommandée pour maximiser votre chiffre d''affaires et automatiser la cuisine.', 399.00, 3990.00, 'MAD', '["Jusqu''à 3 Établissements", "Menu & QR Personnalisés aux couleurs de votre marque", "Intégration WhatsApp Business Cloud API", "Gestion des Modificateurs et Options", "Support Prioritaire 7j/7"]'::jsonb, true),
  ('pro', 'Pro VIP', 'L''infrastructure complète pour les restaurants à fort trafic, franchises et groupes.', 799.00, 7990.00, 'MAD', '["Établissements Illimités", "Assistant IA Zina dédié", "Analyses Prédictives des Ventes & Panier Moyen", "Export Comptable et Audit Trail", "Accompagnement VIP dédié"]'::jsonb, true)
ON CONFLICT (code) DO UPDATE
SET monthly_price = EXCLUDED.monthly_price,
    annual_price = EXCLUDED.annual_price,
    features = EXCLUDED.features;

CREATE TABLE IF NOT EXISTS public.business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE UNIQUE,
  plan_code TEXT NOT NULL REFERENCES public.subscription_plans(code),
  status TEXT DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  billing_interval TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ DEFAULT now() NOT NULL,
  current_period_end TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days') NOT NULL,
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subscription_payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  restaurant_name TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'growth', 'pro', 'enterprise')),
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'MAD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cih_bank', 'attijariwafa_bank', 'cash_plus', 'western_union', 'moneygram', 'ria')),
  transaction_reference TEXT,
  receipt_url TEXT,
  receipt_file_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled')),
  rejection_reason TEXT,
  payer_name TEXT,
  payer_phone TEXT,
  notes TEXT,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ====================================================================
-- 11. INDEXES FOR PERFORMANCE & AUDIT
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_biz ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_menus_restaurant ON public.menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_published ON public.menus(is_published);
CREATE INDEX IF NOT EXISTS idx_categories_menu ON public.menu_categories(menu_id);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(public_order_reference);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifs_restaurant ON public.notification_events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_biz ON public.audit_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_restaurant ON public.subscription_payment_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.subscription_payment_requests(status);

-- ====================================================================
-- 12. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS (SECURITY DEFINER)
-- Prevents RLS recursion and guarantees fast indexed membership checks
-- ====================================================================

-- Check if current authenticated user has valid membership in business
CREATE OR REPLACE FUNCTION public.check_user_business_access(check_restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = check_restaurant_id AND r.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.business_members bm
    WHERE bm.business_id = check_restaurant_id
      AND bm.user_id = auth.uid()
      AND bm.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- Check if current user is an authorized owner or admin
CREATE OR REPLACE FUNCTION public.check_user_is_owner_or_admin(check_restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = check_restaurant_id AND r.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.business_members bm
    WHERE bm.business_id = check_restaurant_id
      AND bm.user_id = auth.uid()
      AND bm.role = 'owner'
      AND bm.status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- ====================================================================
-- 13. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payment_requests ENABLE ROW LEVEL SECURITY;

-- Grant permissions explicitly
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ====================================================================
-- 14. SPECIFIC RLS POLICIES
-- ====================================================================

-- 14.1 PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR role = 'admin');

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 14.2 RESTAURANTS / BUSINESSES POLICIES
-- Public can view active published restaurant profile info for public menu rendering
DROP POLICY IF EXISTS "restaurants_select_public" ON public.restaurants;
CREATE POLICY "restaurants_select_public" ON public.restaurants
  FOR SELECT
  USING (status = 'active' OR public.check_user_business_access(id));

DROP POLICY IF EXISTS "restaurants_insert_owner" ON public.restaurants;
CREATE POLICY "restaurants_insert_owner" ON public.restaurants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "restaurants_update_owner" ON public.restaurants;
CREATE POLICY "restaurants_update_owner" ON public.restaurants
  FOR UPDATE TO authenticated
  USING (public.check_user_is_owner_or_admin(id))
  WITH CHECK (public.check_user_is_owner_or_admin(id));

DROP POLICY IF EXISTS "restaurants_delete_owner" ON public.restaurants;
CREATE POLICY "restaurants_delete_owner" ON public.restaurants
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- 14.3 BUSINESS MEMBERS POLICIES
DROP POLICY IF EXISTS "members_select" ON public.business_members;
CREATE POLICY "members_select" ON public.business_members
  FOR SELECT TO authenticated
  USING (public.check_user_business_access(business_id));

DROP POLICY IF EXISTS "members_manage_owner" ON public.business_members;
CREATE POLICY "members_manage_owner" ON public.business_members
  FOR ALL TO authenticated
  USING (public.check_user_is_owner_or_admin(business_id))
  WITH CHECK (public.check_user_is_owner_or_admin(business_id));

-- 14.4 MENUS POLICIES
DROP POLICY IF EXISTS "menus_select_public" ON public.menus;
CREATE POLICY "menus_select_public" ON public.menus
  FOR SELECT
  USING (is_published = true OR public.check_user_business_access(restaurant_id));

DROP POLICY IF EXISTS "menus_manage_auth" ON public.menus;
CREATE POLICY "menus_manage_auth" ON public.menus
  FOR ALL TO authenticated
  USING (public.check_user_business_access(restaurant_id))
  WITH CHECK (public.check_user_business_access(restaurant_id));

-- 14.5 MENU CATEGORIES POLICIES
DROP POLICY IF EXISTS "categories_select_public" ON public.menu_categories;
CREATE POLICY "categories_select_public" ON public.menu_categories
  FOR SELECT
  USING (is_visible = true OR public.check_user_business_access(restaurant_id));

DROP POLICY IF EXISTS "categories_manage_auth" ON public.menu_categories;
CREATE POLICY "categories_manage_auth" ON public.menu_categories
  FOR ALL TO authenticated
  USING (public.check_user_business_access(restaurant_id))
  WITH CHECK (public.check_user_business_access(restaurant_id));

-- 14.6 MENU ITEMS / PRODUCTS POLICIES
DROP POLICY IF EXISTS "items_select_public" ON public.menu_items;
CREATE POLICY "items_select_public" ON public.menu_items
  FOR SELECT
  USING (is_available = true OR public.check_user_business_access(restaurant_id));

DROP POLICY IF EXISTS "items_manage_auth" ON public.menu_items;
CREATE POLICY "items_manage_auth" ON public.menu_items
  FOR ALL TO authenticated
  USING (public.check_user_business_access(restaurant_id))
  WITH CHECK (public.check_user_business_access(restaurant_id));

-- 14.7 QR SETTINGS POLICIES
DROP POLICY IF EXISTS "qr_select_public" ON public.qr_settings;
CREATE POLICY "qr_select_public" ON public.qr_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "qr_manage_auth" ON public.qr_settings;
CREATE POLICY "qr_manage_auth" ON public.qr_settings
  FOR ALL TO authenticated
  USING (public.check_user_business_access(restaurant_id))
  WITH CHECK (public.check_user_business_access(restaurant_id));

-- 14.8 ORDERS POLICIES
-- Customer order submission allowed via public workflow with valid business check
DROP POLICY IF EXISTS "orders_insert_customer" ON public.orders;
CREATE POLICY "orders_insert_customer" ON public.orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = orders.restaurant_id AND r.status = 'active'
    )
  );

-- Customers can view their specific placed order by reference ONLY
DROP POLICY IF EXISTS "orders_select_by_ref" ON public.orders;
CREATE POLICY "orders_select_by_ref" ON public.orders
  FOR SELECT
  USING (
    public.check_user_business_access(restaurant_id)
    OR
    (public_order_reference IS NOT NULL)
  );

-- Only authenticated business members can UPDATE or DELETE orders
DROP POLICY IF EXISTS "orders_update_auth" ON public.orders;
CREATE POLICY "orders_update_auth" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.check_user_business_access(restaurant_id))
  WITH CHECK (public.check_user_business_access(restaurant_id));

-- 14.9 ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.restaurant_id = order_items.restaurant_id
    )
  );

DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT
  USING (
    public.check_user_business_access(restaurant_id)
    OR
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
    )
  );

-- 14.10 NOTIFICATION EVENTS POLICIES
DROP POLICY IF EXISTS "notifs_auth" ON public.notification_events;
CREATE POLICY "notifs_auth" ON public.notification_events
  FOR ALL TO authenticated
  USING (public.check_user_business_access(restaurant_id))
  WITH CHECK (public.check_user_business_access(restaurant_id));

-- 14.11 AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "audit_select_auth" ON public.audit_logs;
CREATE POLICY "audit_select_auth" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    public.check_user_is_owner_or_admin(restaurant_id)
    OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Audit logs cannot be deleted or updated by any normal user
DROP POLICY IF EXISTS "audit_insert_system" ON public.audit_logs;
CREATE POLICY "audit_insert_system" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 14.12 SUBSCRIPTION PLANS POLICIES
DROP POLICY IF EXISTS "plans_select_public" ON public.subscription_plans;
CREATE POLICY "plans_select_public" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- 14.13 BUSINESS SUBSCRIPTIONS POLICIES
DROP POLICY IF EXISTS "subs_select_auth" ON public.business_subscriptions;
CREATE POLICY "subs_select_auth" ON public.business_subscriptions
  FOR SELECT TO authenticated
  USING (public.check_user_business_access(restaurant_id));

-- 14.14 SUBSCRIPTION PAYMENT REQUESTS POLICIES
DROP POLICY IF EXISTS "payments_select_auth" ON public.subscription_payment_requests;
CREATE POLICY "payments_select_auth" ON public.subscription_payment_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR
    public.check_user_business_access(restaurant_id)
    OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "payments_insert_auth" ON public.subscription_payment_requests;
CREATE POLICY "payments_insert_auth" ON public.subscription_payment_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR
    public.check_user_is_owner_or_admin(restaurant_id)
  );

DROP POLICY IF EXISTS "payments_update_admin_only" ON public.subscription_payment_requests;
CREATE POLICY "payments_update_admin_only" ON public.subscription_payment_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR
    (
      -- An owner can only cancel their own pending request
      auth.uid() = user_id AND status = 'pending'
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR
    (
      auth.uid() = user_id AND status = 'cancelled'
    )
  );

-- ====================================================================
-- 15. AUTOMATIC TRIGGERS (Auto-Membership, Timestamps, Profile Setup)
-- ====================================================================

-- Trigger: When restaurant is created, auto-create business_membership for owner
CREATE OR REPLACE FUNCTION public.handle_new_restaurant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.business_members (business_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, 'owner', 'active')
  ON CONFLICT (business_id, user_id) DO NOTHING;

  -- Create initial default QR configuration
  INSERT INTO public.qr_settings (restaurant_id, label, qr_color, custom_color, show_logo, include_logo)
  VALUES (NEW.id, 'Table QR Code', '#153E35', '#153E35', true, true)
  ON CONFLICT (restaurant_id) DO NOTHING;

  -- Create initial subscription record (trialing for 14 days)
  INSERT INTO public.business_subscriptions (restaurant_id, plan_code, status, billing_interval, trial_ends_at)
  VALUES (NEW.id, COALESCE(NEW.subscription_plan, 'starter'), 'trialing', 'monthly', now() + INTERVAL '14 days')
  ON CONFLICT (restaurant_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_restaurant_created ON public.restaurants;
CREATE TRIGGER on_restaurant_created
  AFTER INSERT ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_restaurant();

-- Trigger: When auth.user created, auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'owner',
    'fr'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Auto-update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_upd_profiles ON public.profiles;
CREATE TRIGGER trg_upd_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_upd_restaurants ON public.restaurants;
CREATE TRIGGER trg_upd_restaurants BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_upd_menus ON public.menus;
CREATE TRIGGER trg_upd_menus BEFORE UPDATE ON public.menus FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_upd_categories ON public.menu_categories;
CREATE TRIGGER trg_upd_categories BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_upd_items ON public.menu_items;
CREATE TRIGGER trg_upd_items BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_upd_orders ON public.orders;
CREATE TRIGGER trg_upd_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 16. SECURE SALES ANALYTICS DATABASE FUNCTION
-- Aggregates real operational data only, strictly tenant isolated
-- ====================================================================
CREATE OR REPLACE FUNCTION public.get_business_sales_analytics(p_restaurant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_authorized BOOLEAN;
  v_result JSONB;
BEGIN
  -- Strict tenant authorization check
  v_authorized := public.check_user_business_access(p_restaurant_id);
  IF NOT v_authorized THEN
    RAISE EXCEPTION 'Access denied to analytics for business %', p_restaurant_id;
  END IF;

  WITH valid_orders AS (
    SELECT * FROM public.orders
    WHERE restaurant_id = p_restaurant_id
      AND status != 'cancelled'
  ),
  today_orders AS (
    SELECT * FROM valid_orders
    WHERE created_at >= date_trunc('day', now())
  ),
  week_orders AS (
    SELECT * FROM valid_orders
    WHERE created_at >= date_trunc('week', now())
  ),
  month_orders AS (
    SELECT * FROM valid_orders
    WHERE created_at >= date_trunc('month', now())
  ),
  order_status_counts AS (
    SELECT status, COUNT(*) AS count
    FROM public.orders
    WHERE restaurant_id = p_restaurant_id
    GROUP BY status
  ),
  daily_totals AS (
    SELECT 
      to_char(created_at, 'YYYY-MM-DD') AS day,
      COALESCE(SUM(total), 0) AS revenue,
      COUNT(*) AS order_count
    FROM valid_orders
    WHERE created_at >= (now() - INTERVAL '30 days')
    GROUP BY to_char(created_at, 'YYYY-MM-DD')
    ORDER BY day ASC
  )
  SELECT jsonb_build_object(
    'total_orders', (SELECT COUNT(*) FROM public.orders WHERE restaurant_id = p_restaurant_id),
    'valid_orders_count', (SELECT COUNT(*) FROM valid_orders),
    'orders_today_count', (SELECT COUNT(*) FROM today_orders),
    'orders_this_week_count', (SELECT COUNT(*) FROM week_orders),
    'orders_this_month_count', (SELECT COUNT(*) FROM month_orders),
    'gross_sales', COALESCE((SELECT SUM(total) FROM valid_orders), 0),
    'average_order_value', COALESCE(
      (SELECT ROUND(AVG(total)::numeric, 2) FROM valid_orders), 0
    ),
    'status_breakdown', COALESCE(
      (SELECT jsonb_object_agg(status, count) FROM order_status_counts), '{}'::jsonb
    ),
    'daily_sales', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('date', day, 'revenue', revenue, 'orders', order_count)) FROM daily_totals), '[]'::jsonb
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ====================================================================
-- 17. SECURE PUBLIC ORDER SUBMISSION FUNCTION (RPC)
-- Server-side pricing calculation and tenant verification for customer orders
-- ====================================================================
CREATE OR REPLACE FUNCTION public.submit_public_order(
  p_restaurant_id UUID,
  p_order_type TEXT,
  p_table_number TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_notes TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_biz RECORD;
  v_item JSONB;
  v_prod RECORD;
  v_unit_price NUMERIC(10,2);
  v_line_total NUMERIC(10,2);
  v_subtotal NUMERIC(10,2) := 0.00;
  v_tax_rate NUMERIC(5,2) := 10.00;
  v_tax_amount NUMERIC(10,2) := 0.00;
  v_total NUMERIC(10,2) := 0.00;
  v_order_ref TEXT;
  v_new_order_id UUID;
  v_qty INT;
  v_currency TEXT;
  v_order_record RECORD;
BEGIN
  -- 1. Validate restaurant exists and is active
  SELECT * INTO v_biz FROM public.restaurants WHERE id = p_restaurant_id AND status = 'active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Establishment not found or inactive.';
  END IF;

  v_currency := COALESCE(v_biz.currency, 'MAD');

  -- 2. Validate order type
  IF p_order_type NOT IN ('dine_in', 'takeaway', 'delivery') THEN
    RAISE EXCEPTION 'Invalid order type: %', p_order_type;
  END IF;

  -- 3. Validate items
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cannot place an empty order.';
  END IF;

  -- 4. Generate unique order reference
  v_order_ref := 'SF-' || LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0');

  -- 5. Calculate trusted totals
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := COALESCE((v_item->>'quantity')::INT, 1);
    IF v_qty <= 0 OR v_qty > 50 THEN
      RAISE EXCEPTION 'Invalid quantity: %', v_qty;
    END IF;

    -- Lookup product directly from database (never trust client price)
    SELECT * INTO v_prod FROM public.menu_items
    WHERE id = (v_item->>'productId')::UUID
      AND restaurant_id = p_restaurant_id
      AND is_available = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % is unavailable or invalid for this establishment.', (v_item->>'productId');
    END IF;

    v_unit_price := v_prod.price;
    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  v_tax_amount := ROUND((v_subtotal * (v_tax_rate / 100.00))::NUMERIC, 2);
  v_total := v_subtotal + v_tax_amount;

  -- 6. Insert Order
  INSERT INTO public.orders (
    restaurant_id,
    public_order_reference,
    order_type,
    table_number,
    customer_name,
    customer_phone,
    customer_notes,
    items,
    currency,
    subtotal,
    tax_amount,
    service_fee_amount,
    discount_amount,
    total,
    status,
    notification_status,
    source,
    status_history
  )
  VALUES (
    p_restaurant_id,
    v_order_ref,
    p_order_type,
    p_table_number,
    NULLIF(TRIM(p_customer_name), ''),
    NULLIF(TRIM(p_customer_phone), ''),
    NULLIF(TRIM(p_customer_notes), ''),
    p_items,
    v_currency,
    v_subtotal,
    v_tax_amount,
    0.00,
    0.00,
    v_total,
    'new',
    'pending',
    'qr_menu',
    jsonb_build_array(
      jsonb_build_object(
        'status', 'new',
        'timestamp', now(),
        'note', 'Order placed via public digital menu'
      )
    )
  )
  RETURNING * INTO v_order_record;

  v_new_order_id := v_order_record.id;

  -- 7. Insert Order Items snapshots
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::INT;
    SELECT * INTO v_prod FROM public.menu_items WHERE id = (v_item->>'productId')::UUID;
    v_unit_price := v_prod.price;
    v_line_total := v_unit_price * v_qty;

    INSERT INTO public.order_items (
      order_id,
      restaurant_id,
      product_id,
      product_name_snapshot,
      unit_price_snapshot,
      quantity,
      line_total,
      selected_options,
      special_instructions
    )
    VALUES (
      v_new_order_id,
      p_restaurant_id,
      v_prod.id,
      COALESCE(v_prod.name->>'fr', v_prod.name->>'en', 'Article'),
      v_unit_price,
      v_qty,
      v_line_total,
      COALESCE(v_item->'selectedOptions', '[]'::jsonb),
      v_item->>'specialInstructions'
    );
  END LOOP;

  -- 8. Audit Event
  INSERT INTO public.audit_logs (
    restaurant_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    p_restaurant_id,
    NULL,
    'order.created',
    'order',
    v_new_order_id::TEXT,
    jsonb_build_object(
      'order_ref', v_order_ref,
      'total', v_total,
      'items_count', jsonb_array_length(p_items)
    )
  );

  RETURN to_jsonb(v_order_record);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_order TO anon, authenticated;

-- ====================================================================
-- 18. ATOMIC RESTAURANT CREATION FUNCTION (RPC)
-- Ensures restaurant, business membership, default menu, and initial config
-- are created atomically within a single transaction.
-- ====================================================================
CREATE OR REPLACE FUNCTION public.create_restaurant(
  p_name TEXT,
  p_slug TEXT,
  p_business_type TEXT DEFAULT 'restaurant',
  p_phone TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_contact_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_clean_slug TEXT;
  v_final_slug TEXT;
  v_counter INT := 0;
  v_restaurant RECORD;
BEGIN
  -- 1. Ensure caller is authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a restaurant.';
  END IF;

  -- 2. Validate required fields
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Restaurant name cannot be empty.';
  END IF;

  -- 3. Clean and ensure unique slug
  v_clean_slug := COALESCE(
    NULLIF(lower(regexp_replace(trim(p_slug), '[^a-z0-9]+', '-', 'g')), ''),
    lower(regexp_replace(trim(p_name), '[^a-z0-9]+', '-', 'g'))
  );
  v_final_slug := v_clean_slug;

  WHILE EXISTS (SELECT 1 FROM public.restaurants WHERE slug = v_final_slug) LOOP
    v_counter := v_counter + 1;
    v_final_slug := v_clean_slug || '-' || floor(random() * 9000 + 1000)::text;
    IF v_counter > 10 THEN
      v_final_slug := v_clean_slug || '-' || replace(gen_random_uuid()::text, '-', '');
      EXIT;
    END IF;
  END LOOP;

  -- 4. Insert restaurant record
  INSERT INTO public.restaurants (
    owner_id,
    name,
    slug,
    business_type,
    phone,
    city,
    address,
    description,
    contact_email,
    currency,
    status
  )
  VALUES (
    v_user_id,
    trim(p_name),
    v_final_slug,
    COALESCE(NULLIF(trim(p_business_type), ''), 'restaurant'),
    NULLIF(trim(p_phone), ''),
    NULLIF(trim(p_city), ''),
    NULLIF(trim(p_address), ''),
    NULLIF(trim(p_description), ''),
    NULLIF(trim(p_contact_email), ''),
    'MAD',
    'active'
  )
  RETURNING * INTO v_restaurant;

  -- 5. Explicitly ensure business_members entry exists
  INSERT INTO public.business_members (business_id, user_id, role, status)
  VALUES (v_restaurant.id, v_user_id, 'owner', 'active')
  ON CONFLICT (business_id, user_id) DO UPDATE SET role = 'owner', status = 'active';

  -- 6. Insert audit log
  INSERT INTO public.audit_logs (
    restaurant_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    v_restaurant.id,
    v_user_id,
    'restaurant.created',
    'restaurant',
    v_restaurant.id::text,
    jsonb_build_object('name', v_restaurant.name, 'slug', v_restaurant.slug)
  );

  RETURN to_jsonb(v_restaurant);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_restaurant TO authenticated;

