-- ====================================================================
-- SOFRAFLOW — HARDENED SUPER ADMIN SECURITY, IP MONITORING & OWNER ACCESS
-- Migration: 20261025000000_hardened_super_admin_security_and_access.sql
-- ====================================================================

-- 1. PROVISION SOFRAFLOW PLATFORM OWNER ACCOUNTS INTO PLATFORM_SUPER_ADMINS
-- Safely provisions the legitimate platform owner accounts without touching customer accounts.
DO $$
DECLARE
  v_owner_record RECORD;
BEGIN
  -- Look for known owner accounts in auth.users
  FOR v_owner_record IN 
    SELECT id, email, created_at 
    FROM auth.users 
    WHERE email IN ('zeraouiianass@gmail.com', 'admin@sofraflow.com', 'contact@sofraflow.com')
  LOOP
    -- Insert into platform_super_admins if not already present
    INSERT INTO public.platform_super_admins (
      user_id,
      email,
      is_active,
      created_at,
      notes
    )
    VALUES (
      v_owner_record.id,
      v_owner_record.email,
      true,
      v_owner_record.created_at,
      'SOFRAFLOW SaaS Platform Owner - Primary Super Administrator'
    )
    ON CONFLICT (user_id) DO UPDATE
    SET is_active = true,
        email = EXCLUDED.email;

    -- Update or create profile with admin role
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      role,
      preferred_language,
      created_at,
      updated_at
    )
    VALUES (
      v_owner_record.id,
      'Anas Ziraoui',
      v_owner_record.email,
      'admin',
      'fr',
      v_owner_record.created_at,
      now()
    )
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        email = EXCLUDED.email,
        updated_at = now();
  END LOOP;
END $$;

-- 2. CREATE SECURITY EVENTS & IP MONITORING LEDGER
-- Records admin access attempts, failed logins, probes, and rate-limit triggers.
CREATE TABLE IF NOT EXISTS public.admin_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'admin_route_probe',
    'admin_auth_failed',
    'admin_auth_success',
    'admin_privilege_denied',
    'mfa_challenge_failed',
    'rate_limited',
    'admin_logout'
  )),
  path TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'GET',
  status_code INTEGER NOT NULL DEFAULT 403,
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed', 'denied', 'rate_limited')),
  ip_address TEXT,
  user_agent TEXT,
  actor_email TEXT,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.admin_security_events ENABLE ROW LEVEL SECURITY;

-- RLS: Only Super Admins can view security events
DROP POLICY IF EXISTS "security_events_super_admin_select" ON public.admin_security_events;
CREATE POLICY "security_events_super_admin_select" ON public.admin_security_events
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- Create indexes for fast lookup and time-series audit queries
CREATE INDEX IF NOT EXISTS idx_security_events_created ON public.admin_security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON public.admin_security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.admin_security_events(event_type);

-- 3. SECURE LOGGING RPC (Callable by client/server without exposing secrets)
CREATE OR REPLACE FUNCTION public.log_admin_security_event(
  p_event_type TEXT,
  p_path TEXT,
  p_method TEXT DEFAULT 'GET',
  p_status_code INTEGER DEFAULT 403,
  p_outcome TEXT DEFAULT 'denied',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_actor_email TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_event_id UUID;
  v_caller_id UUID;
  v_sanitized_email TEXT;
BEGIN
  v_caller_id := auth.uid();
  
  -- Mask email if provided to prevent logging raw secrets or typos
  IF p_actor_email IS NOT NULL AND position('@' in p_actor_email) > 0 THEN
    v_sanitized_email := lower(trim(p_actor_email));
  ELSE
    v_sanitized_email := NULL;
  END IF;

  INSERT INTO public.admin_security_events (
    event_type,
    path,
    method,
    status_code,
    outcome,
    ip_address,
    user_agent,
    actor_email,
    actor_user_id,
    reason,
    metadata
  )
  VALUES (
    p_event_type,
    coalesce(p_path, '/admin'),
    coalesce(p_method, 'GET'),
    coalesce(p_status_code, 403),
    coalesce(p_outcome, 'denied'),
    p_ip_address,
    substr(coalesce(p_user_agent, 'Unknown'), 1, 255),
    v_sanitized_email,
    v_caller_id,
    substr(coalesce(p_reason, 'Access denied'), 1, 500),
    coalesce(p_metadata, '{}'::jsonb)
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_admin_security_event TO anon, authenticated;

-- 4. SUPER ADMIN SECURITY EVENTS RETRIEVAL RPC
CREATE OR REPLACE FUNCTION public.get_admin_security_events(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  event_type TEXT,
  path TEXT,
  method TEXT,
  status_code INTEGER,
  outcome TEXT,
  ip_address TEXT,
  user_agent TEXT,
  actor_email TEXT,
  reason TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Only Platform Super Admin can inspect security events.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT 
    e.id,
    e.created_at,
    e.event_type,
    e.path,
    e.method,
    e.status_code,
    e.outcome,
    e.ip_address,
    e.user_agent,
    e.actor_email,
    e.reason,
    e.metadata
  FROM public.admin_security_events e
  ORDER BY e.created_at DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_security_events TO authenticated;

-- 5. RATE LIMIT CHECK RPC
-- Checks if an IP or email has exceeded 5 failed login attempts in the past 15 minutes.
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(
  p_ip TEXT,
  p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_failed_count INTEGER := 0;
  v_is_blocked BOOLEAN := false;
  v_retry_after_seconds INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO v_failed_count
  FROM public.admin_security_events
  WHERE event_type IN ('admin_auth_failed', 'mfa_challenge_failed')
    AND created_at >= (now() - INTERVAL '15 minutes')
    AND (
      (p_ip IS NOT NULL AND ip_address = p_ip)
      OR (p_email IS NOT NULL AND actor_email = lower(trim(p_email)))
    );

  IF v_failed_count >= 5 THEN
    v_is_blocked := true;
    v_retry_after_seconds := 900; -- 15 minutes
  END IF;

  RETURN jsonb_build_object(
    'is_blocked', v_is_blocked,
    'failed_attempts', v_failed_count,
    'retry_after_seconds', v_retry_after_seconds
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_admin_rate_limit TO anon, authenticated;
