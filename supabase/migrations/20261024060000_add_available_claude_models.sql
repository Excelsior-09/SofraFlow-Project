-- ====================================================================
-- SOFRAFLOW — ADD AVAILABLE CLAUDE MODELS & MODEL SWITCHER
-- Migration: 20261024060000_add_available_claude_models.sql
-- Supports:
--   - claude-haiku-4-5-20251001
--   - claude-opus-4-6
--   - claude-opus-4-7
--   - claude-opus-4-8
--   - claude-opus-5
--   - claude-opus-5-5
--   - claude-sonnet-4-6
--   - claude-sonnet-5
-- Allows updating active model & budget without re-typing secret key.
-- ====================================================================

-- 1. UPDATE DEFAULT MODEL IN SYSTEM SECRETS TABLE
ALTER TABLE public.platform_system_secrets 
  ALTER COLUMN model_name SET DEFAULT 'claude-sonnet-4-6';

-- 2. ENHANCE save_claude_api_key FUNCTION
-- Supports both key rotation and standalone model/budget switching.
CREATE OR REPLACE FUNCTION public.save_claude_api_key(
  p_api_key TEXT,
  p_model TEXT DEFAULT 'claude-sonnet-4-6',
  p_budget_usd NUMERIC DEFAULT 100.00,
  p_max_tokens INTEGER DEFAULT 4096
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_fingerprint TEXT;
  v_trimmed_key TEXT;
  v_admin_id UUID;
  v_chosen_model TEXT;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Only Platform Super Admin can configure Claude API credentials.';
  END IF;

  v_admin_id := auth.uid();
  v_chosen_model := COALESCE(NULLIF(trim(p_model), ''), 'claude-sonnet-4-6');
  v_trimmed_key := trim(COALESCE(p_api_key, ''));

  -- Case A: Updating model/budget when key is already configured
  IF v_trimmed_key = '' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.platform_system_secrets 
      WHERE key_name = 'claude_api' AND is_configured = true
    ) THEN
      RAISE EXCEPTION 'Aucune clé configurée. Veuillez fournir une clé Claude API valide commençant par "sk-ant-".';
    END IF;

    UPDATE public.platform_system_secrets
    SET
      model_name = v_chosen_model,
      monthly_budget_usd = COALESCE(p_budget_usd, monthly_budget_usd),
      max_tokens_per_request = COALESCE(p_max_tokens, max_tokens_per_request),
      updated_by = v_admin_id,
      updated_at = now()
    WHERE key_name = 'claude_api';

    INSERT INTO public.audit_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      details
    )
    VALUES (
      v_admin_id,
      'CLAUDE_MODEL_UPDATED',
      'platform_system_secrets',
      'claude_api',
      jsonb_build_object(
        'model_name', v_chosen_model,
        'monthly_budget_usd', p_budget_usd,
        'updated_at', now()
      )
    );

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Modèle Claude API mis à jour avec succès : ' || v_chosen_model,
      'config', public.get_claude_api_config()
    );
  END IF;

  -- Case B: Saving or rotating the secret key
  IF length(v_trimmed_key) < 25 OR NOT (v_trimmed_key LIKE 'sk-ant-%') THEN
    RAISE EXCEPTION 'Format de clé invalide. La clé Claude API doit débuter par "sk-ant-" et contenir au moins 25 caractères.';
  END IF;

  -- Generate non-sensitive masked fingerprint
  v_fingerprint := substr(v_trimmed_key, 1, 10) || '••••••••••••••••••••••••••••••••' || right(v_trimmed_key, 4);

  INSERT INTO public.platform_system_secrets (
    key_name,
    encrypted_value,
    key_fingerprint,
    is_configured,
    model_name,
    monthly_budget_usd,
    max_tokens_per_request,
    last_health_status,
    last_rotated_at,
    updated_by,
    updated_at
  )
  VALUES (
    'claude_api',
    v_trimmed_key,
    v_fingerprint,
    true,
    v_chosen_model,
    COALESCE(p_budget_usd, 100.00),
    COALESCE(p_max_tokens, 4096),
    'untested',
    now(),
    v_admin_id,
    now()
  )
  ON CONFLICT (key_name) DO UPDATE
  SET
    encrypted_value = EXCLUDED.encrypted_value,
    key_fingerprint = EXCLUDED.key_fingerprint,
    is_configured = true,
    model_name = EXCLUDED.model_name,
    monthly_budget_usd = EXCLUDED.monthly_budget_usd,
    max_tokens_per_request = EXCLUDED.max_tokens_per_request,
    last_health_status = 'untested',
    last_rotated_at = now(),
    updated_by = v_admin_id,
    updated_at = now();

  INSERT INTO public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    details
  )
  VALUES (
    v_admin_id,
    'CLAUDE_API_KEY_ROTATED',
    'platform_system_secrets',
    'claude_api',
    jsonb_build_object(
      'key_fingerprint', v_fingerprint,
      'model_name', v_chosen_model,
      'monthly_budget_usd', p_budget_usd,
      'rotated_at', now()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Clé Claude API et modèle ' || v_chosen_model || ' enregistrés avec succès.',
    'config', public.get_claude_api_config()
  );
END;
$$;
