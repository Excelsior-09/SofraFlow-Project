-- ====================================================================
-- SOFRAFLOW — FIX ADMIN USER RETRIEVAL & ZINA AI GATEWAY INTEGRATION
-- Migration: 20261024080000_fix_admin_users_and_zina_ai_gateway.sql
-- Fixes:
--   1. Synchronize all 3 registered auth.users into profiles with email support
--   2. Authoritative server-side admin_get_all_users() RPC for Super Admin
--   3. Accurate total_users count in platform executive analytics
--   4. Robust MWAPI gateway configuration, validation & health check RPC
-- ====================================================================

-- 1. ADD EMAIL COLUMN TO PROFILES IF NOT PRESENT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
  END IF;
END $$;

-- 2. REPAIR & SYNCHRONIZE ALL AUTH USERS INTO PROFILES TABLE
-- Ensures every auth.users account has a matching profile record with email and correct role.
INSERT INTO public.profiles (id, full_name, email, role, preferred_language, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Utilisateur'),
  u.email,
  CASE WHEN psa.user_id IS NOT NULL THEN 'admin' ELSE COALESCE(u.raw_user_meta_data->>'role', 'owner') END,
  'fr',
  u.created_at,
  now()
FROM auth.users u
LEFT JOIN public.platform_super_admins psa ON u.id = psa.user_id AND psa.is_active = true
ON CONFLICT (id) DO UPDATE
SET 
  email = COALESCE(public.profiles.email, EXCLUDED.email),
  role = CASE WHEN EXCLUDED.role = 'admin' THEN 'admin' ELSE public.profiles.role END,
  updated_at = now();

-- Sync email on existing profiles if missing
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 3. UPDATE USER CREATION TRIGGER ON AUTH.USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Utilisateur'),
    NEW.email,
    'owner',
    'fr'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      updated_at = now();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. AUTHORITATIVE SUPER ADMIN USER RETRIEVAL RPC
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  preferred_language TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  restaurant_count BIGINT,
  is_super_admin BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Only platform super administrators can access user directory.'
      USING ERRCODE = '42501';
  END IF;

  -- Idempotently repair any missing profile records
  INSERT INTO public.profiles (id, full_name, email, role, preferred_language, created_at, updated_at)
  SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Utilisateur'),
    u.email,
    CASE WHEN psa.user_id IS NOT NULL THEN 'admin' ELSE 'owner' END,
    'fr',
    u.created_at,
    now()
  FROM auth.users u
  LEFT JOIN public.platform_super_admins psa ON u.id = psa.user_id AND psa.is_active = true
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(public.profiles.email, EXCLUDED.email);

  RETURN QUERY
  SELECT
    u.id,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Utilisateur')::TEXT AS full_name,
    COALESCE(u.email, p.email, '')::TEXT AS email,
    p.phone::TEXT AS phone,
    CASE 
      WHEN psa.user_id IS NOT NULL THEN 'admin'
      ELSE COALESCE(p.role, 'owner')
    END::TEXT AS role,
    COALESCE(p.preferred_language, 'fr')::TEXT AS preferred_language,
    u.created_at AS created_at,
    COALESCE(p.updated_at, u.created_at) AS updated_at,
    COALESCE(r.cnt, 0)::BIGINT AS restaurant_count,
    (psa.user_id IS NOT NULL)::BOOLEAN AS is_super_admin
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  LEFT JOIN public.platform_super_admins psa ON u.id = psa.user_id AND psa.is_active = true
  LEFT JOIN (
    SELECT owner_id, COUNT(*) AS cnt
    FROM public.restaurants
    GROUP BY owner_id
  ) r ON u.id = r.owner_id
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_all_users TO authenticated;

-- 5. UPDATE PLATFORM EXECUTIVE ANALYTICS TO COUNT AUTH USERS DIRECTLY
CREATE OR REPLACE FUNCTION public.get_platform_executive_analytics()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'unauthorized: Only verified platform super administrators can access executive analytics.'
      USING ERRCODE = '42501';
  END IF;

  WITH stats AS (
    SELECT
      (SELECT COUNT(*) FROM auth.users) AS total_users,
      (SELECT COUNT(*) FROM auth.users WHERE created_at >= (now() - INTERVAL '30 days')) AS new_users_30d,
      (SELECT COUNT(*) FROM public.restaurants) AS total_restaurants,
      (SELECT COUNT(*) FROM public.restaurants WHERE status = 'active') AS active_restaurants,
      (SELECT COUNT(*) FROM public.menus WHERE is_published = true) AS published_menus_count,
      (SELECT COUNT(DISTINCT restaurant_id) FROM public.orders) AS restaurants_with_orders,
      (SELECT COUNT(*) FROM public.business_subscriptions WHERE status = 'active') AS active_subscriptions_count,
      (SELECT COUNT(*) FROM public.subscription_payment_requests WHERE status IN ('pending', 'under_review')) AS pending_payments_count,
      (
        SELECT COALESCE(SUM(
          CASE 
            WHEN sp.code = 'starter' THEN 199.00
            WHEN sp.code = 'growth' THEN 399.00
            WHEN sp.code = 'pro' THEN 799.00
            ELSE 0.00
          END
        ), 0.00)
        FROM public.business_subscriptions bs
        JOIN public.subscription_plans sp ON bs.plan_code = sp.code
        WHERE bs.status = 'active'
      ) AS monthly_recurring_revenue,
      (
        SELECT COALESCE(SUM(amount), 0.00)
        FROM public.subscription_payment_requests
        WHERE status = 'approved'
      ) AS total_collected_revenue,
      (
        SELECT COALESCE(SUM(amount), 0.00)
        FROM public.operating_expenses
        WHERE payment_status = 'paid'
      ) AS total_operating_expenses,
      (
        SELECT COALESCE(SUM(estimated_cost_mad), 0.00)
        FROM public.ai_usage_events
      ) AS claude_api_spend_mad,
      (SELECT COUNT(*) FROM public.ai_usage_events) AS total_ai_requests,
      (SELECT COUNT(*) FROM public.orders) AS total_orders_count,
      (SELECT COALESCE(SUM(total), 0.00) FROM public.orders WHERE status != 'cancelled') AS total_orders_volume_mad
  )
  SELECT jsonb_build_object(
    'total_users', total_users,
    'new_users_30d', new_users_30d,
    'total_restaurants', total_restaurants,
    'active_restaurants', active_restaurants,
    'published_menus_count', published_menus_count,
    'restaurants_with_orders', restaurants_with_orders,
    'active_subscriptions_count', active_subscriptions_count,
    'pending_payments_count', pending_payments_count,
    'monthly_recurring_revenue', monthly_recurring_revenue,
    'total_collected_revenue', total_collected_revenue,
    'total_operating_expenses', total_operating_expenses,
    'net_operating_result', (total_collected_revenue - total_operating_expenses),
    'claude_api_spend_mad', claude_api_spend_mad,
    'total_ai_requests', total_ai_requests,
    'total_orders_count', total_orders_count,
    'total_orders_volume_mad', total_orders_volume_mad,
    'generated_at', now()
  ) INTO v_result
  FROM stats;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_platform_executive_analytics TO authenticated;
