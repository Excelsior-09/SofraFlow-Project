-- ====================================================================
-- SOFRAFLOW — SUPER ADMIN FOUNDATION & ACCESS SECURITY MIGRATION
-- Migration: 20261024040000_super_admin_foundation.sql
-- Conforms to Least Privilege, Anti-Privilege Escalation, Real Financial Ledger
-- ====================================================================

-- 1. DEDICATED PLATFORM SUPER ADMIN TABLE
-- Server-controlled table. Normal authenticated users cannot write to this table.
CREATE TABLE IF NOT EXISTS public.platform_super_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT
);

ALTER TABLE public.platform_super_admins ENABLE ROW LEVEL SECURITY;

-- 2. TRUSTED SERVER FUNCTION TO VERIFY SUPER ADMIN STATUS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_super_admins
    WHERE user_id = auth.uid() AND is_active = true
  );
$$;

-- RLS: Platform super admins can view the super admin registry
DROP POLICY IF EXISTS "super_admins_select" ON public.platform_super_admins;
CREATE POLICY "super_admins_select" ON public.platform_super_admins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- 3. ANTI-PRIVILEGE ESCALATION TRIGGER ON PROFILES
-- Guarantees that ordinary users cannot update their own role to 'admin'
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' AND (OLD.role IS NULL OR OLD.role <> 'admin') THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'unauthorized_role_escalation: Only platform super administrators can grant the admin role.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 4. OPERATING EXPENSES LEDGER (MAD)
-- Real financial tracking for Claude API, Supabase, Hosting, Domain, Contractors
CREATE TABLE IF NOT EXISTS public.operating_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('claude_api', 'supabase', 'hosting', 'domain_email', 'software', 'advertising', 'contractor', 'payment_fees', 'office_legal', 'other')),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'MAD',
  vendor TEXT,
  receipt_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'scheduled')),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operating_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "operating_expenses_super_admin" ON public.operating_expenses;
CREATE POLICY "operating_expenses_super_admin" ON public.operating_expenses
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.operating_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.operating_expenses(category);

-- 5. AI USAGE EVENTS LOGGING (Zina AI / Claude API)
-- Real tracking of token consumption, latency, and estimated cost in USD and MAD
CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provider TEXT NOT NULL DEFAULT 'anthropic_claude',
  model TEXT NOT NULL DEFAULT 'claude-3-7-sonnet',
  feature TEXT NOT NULL CHECK (feature IN ('menu_scan', 'menu_generate', 'dish_description', 'menu_translation', 'chat_assistant', 'other')),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'rate_limited', 'quota_exceeded', 'timeout')),
  input_tokens INT DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INT DEFAULT 0 CHECK (output_tokens >= 0),
  estimated_cost_usd NUMERIC(10,5) DEFAULT 0.00000,
  estimated_cost_mad NUMERIC(10,4) DEFAULT 0.0000,
  latency_ms INT DEFAULT 0 CHECK (latency_ms >= 0),
  request_id TEXT,
  error_category TEXT,
  error_message TEXT
);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_usage_select" ON public.ai_usage_events;
CREATE POLICY "ai_usage_select" ON public.ai_usage_events
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR
    (restaurant_id IS NOT NULL AND public.check_user_business_access(restaurant_id))
  );

DROP POLICY IF EXISTS "ai_usage_insert" ON public.ai_usage_events;
CREATE POLICY "ai_usage_insert" ON public.ai_usage_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR
    auth.uid() = user_id
    OR
    (restaurant_id IS NOT NULL AND public.check_user_business_access(restaurant_id))
  );

CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON public.ai_usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_restaurant ON public.ai_usage_events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider ON public.ai_usage_events(provider);

-- 6. ATOMIC BANK TRANSFER APPROVAL (RPC)
-- Row locking with FOR UPDATE, prevents double-approval and race conditions
CREATE OR REPLACE FUNCTION public.approve_subscription_payment(
  p_request_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req RECORD;
  v_admin_id UUID;
  v_period_interval INTERVAL;
  v_new_sub_end TIMESTAMPTZ;
BEGIN
  -- 1. Ensure caller is server-verified Super Admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'unauthorized: Only verified platform super administrators can approve payments.'
      USING ERRCODE = '42501';
  END IF;

  v_admin_id := auth.uid();

  -- 2. Lock the target payment request row to prevent race conditions
  SELECT * INTO v_req
  FROM public.subscription_payment_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request % not found.', p_request_id;
  END IF;

  -- 3. Verify current status allows approval
  IF v_req.status = 'approved' THEN
    RAISE EXCEPTION 'Payment request % has already been approved.', p_request_id;
  END IF;

  IF v_req.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot approve a cancelled payment request.';
  END IF;

  -- 4. Calculate subscription extension
  IF v_req.billing_period = 'annual' THEN
    v_period_interval := INTERVAL '1 year';
  ELSE
    v_period_interval := INTERVAL '30 days';
  END IF;
  v_new_sub_end := now() + v_period_interval;

  -- 5. Update payment request status
  UPDATE public.subscription_payment_requests
  SET status = 'approved',
      verified_by = v_admin_id::text,
      verified_at = now(),
      notes = COALESCE(p_notes, notes),
      updated_at = now()
  WHERE id = p_request_id;

  -- 6. Update business subscriptions table atomically
  IF v_req.restaurant_id IS NOT NULL THEN
    INSERT INTO public.business_subscriptions (
      restaurant_id,
      plan_code,
      status,
      billing_interval,
      current_period_start,
      current_period_end,
      updated_at
    )
    VALUES (
      v_req.restaurant_id,
      v_req.plan,
      'active',
      COALESCE(v_req.billing_period, 'monthly'),
      now(),
      v_new_sub_end,
      now()
    )
    ON CONFLICT (restaurant_id) DO UPDATE
    SET plan_code = EXCLUDED.plan_code,
        status = 'active',
        billing_interval = EXCLUDED.billing_interval,
        current_period_start = now(),
        current_period_end = v_new_sub_end,
        updated_at = now();

    -- 7. Update restaurant entity subscription fields
    UPDATE public.restaurants
    SET subscription_plan = v_req.plan,
        subscription_status = 'active',
        updated_at = now()
    WHERE id = v_req.restaurant_id;
  END IF;

  -- 8. Write immutable audit log
  INSERT INTO public.audit_logs (
    restaurant_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    v_req.restaurant_id,
    v_admin_id,
    'payment.approved',
    'subscription_payment_request',
    p_request_id::text,
    jsonb_build_object(
      'amount', v_req.amount,
      'currency', v_req.currency,
      'plan', v_req.plan,
      'billing_period', v_req.billing_period,
      'payment_method', v_req.payment_method,
      'transaction_reference', v_req.transaction_reference,
      'new_period_end', v_new_sub_end
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'status', 'approved',
    'verified_at', now(),
    'new_period_end', v_new_sub_end
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_subscription_payment TO authenticated;

-- 7. ATOMIC BANK TRANSFER REJECTION (RPC)
CREATE OR REPLACE FUNCTION public.reject_subscription_payment(
  p_request_id UUID,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req RECORD;
  v_admin_id UUID;
BEGIN
  -- 1. Ensure caller is server-verified Super Admin
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'unauthorized: Only verified platform super administrators can reject payments.'
      USING ERRCODE = '42501';
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'A non-empty rejection reason is required.';
  END IF;

  v_admin_id := auth.uid();

  -- 2. Lock target payment request row
  SELECT * INTO v_req
  FROM public.subscription_payment_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request % not found.', p_request_id;
  END IF;

  IF v_req.status = 'approved' THEN
    RAISE EXCEPTION 'Cannot reject an already approved payment request.';
  END IF;

  -- 3. Update status
  UPDATE public.subscription_payment_requests
  SET status = 'rejected',
      rejection_reason = trim(p_reason),
      verified_by = v_admin_id::text,
      verified_at = now(),
      updated_at = now()
  WHERE id = p_request_id;

  -- 4. Record audit log
  INSERT INTO public.audit_logs (
    restaurant_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    v_req.restaurant_id,
    v_admin_id,
    'payment.rejected',
    'subscription_payment_request',
    p_request_id::text,
    jsonb_build_object(
      'amount', v_req.amount,
      'plan', v_req.plan,
      'reason', trim(p_reason)
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'status', 'rejected',
    'verified_at', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_subscription_payment TO authenticated;

-- 8. PLATFORM EXECUTIVE ANALYTICS AGGREGATOR (RPC)
-- Securely aggregates platform-wide metrics from real database records only
CREATE OR REPLACE FUNCTION public.get_platform_executive_analytics()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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
      (SELECT COUNT(*) FROM public.profiles) AS total_users,
      (SELECT COUNT(*) FROM public.profiles WHERE created_at >= (now() - INTERVAL '30 days')) AS new_users_30d,
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

-- 9. ADMIN TENANT STATUS TOGGLE (RPC)
CREATE OR REPLACE FUNCTION public.admin_toggle_restaurant_status(
  p_restaurant_id UUID,
  p_new_status TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status TEXT;
  v_admin_id UUID;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'unauthorized: Only verified platform super administrators can toggle restaurant status.'
      USING ERRCODE = '42501';
  END IF;

  IF p_new_status NOT IN ('active', 'inactive', 'suspended') THEN
    RAISE EXCEPTION 'Invalid restaurant status: %', p_new_status;
  END IF;

  v_admin_id := auth.uid();

  SELECT status INTO v_old_status FROM public.restaurants WHERE id = p_restaurant_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Restaurant % not found.', p_restaurant_id;
  END IF;

  UPDATE public.restaurants
  SET status = p_new_status,
      updated_at = now()
  WHERE id = p_restaurant_id;

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
    v_admin_id,
    'restaurant.status_changed',
    'restaurant',
    p_restaurant_id::text,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_new_status,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'restaurant_id', p_restaurant_id,
    'status', p_new_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_toggle_restaurant_status TO authenticated;

-- 10. UPDATE RLS ON CORE ENTITIES FOR SUPER ADMIN VISIBILITY
-- Allows verified Super Admin to query and manage platform-wide records safely

-- Profiles: Super Admin can view all user profiles
DROP POLICY IF EXISTS "profiles_select_super_admin" ON public.profiles;
CREATE POLICY "profiles_select_super_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_super_admin());

-- Restaurants: Super Admin can view all restaurants (including inactive/suspended)
DROP POLICY IF EXISTS "restaurants_select_super_admin" ON public.restaurants;
CREATE POLICY "restaurants_select_super_admin" ON public.restaurants
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- Subscription Payment Requests: Super Admin can view and manage all payment requests
DROP POLICY IF EXISTS "payments_select_super_admin" ON public.subscription_payment_requests;
CREATE POLICY "payments_select_super_admin" ON public.subscription_payment_requests
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- Business Subscriptions: Super Admin can view all active and past due subscriptions
DROP POLICY IF EXISTS "subs_select_super_admin" ON public.business_subscriptions;
CREATE POLICY "subs_select_super_admin" ON public.business_subscriptions
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- Audit Logs: Super Admin can view all audit logs
DROP POLICY IF EXISTS "audit_select_super_admin" ON public.audit_logs;
CREATE POLICY "audit_select_super_admin" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_super_admin());
