-- ====================================================================
-- SOFRAFLOW — SUBSCRIPTION PAYMENT REQUESTS & VERIFICATION MIGRATION
-- Migration: 20261022010000_subscription_payment_requests.sql
-- ====================================================================

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
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscription_payment_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view their own payment requests
CREATE POLICY "Users can view their own subscription payment requests"
  ON public.subscription_payment_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = subscription_payment_requests.restaurant_id
      AND r.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner', 'manager')
    )
  );

-- Policy 2: Authenticated users can submit a payment request for their restaurant
CREATE POLICY "Users can create subscription payment requests"
  ON public.subscription_payment_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = subscription_payment_requests.restaurant_id
      AND r.owner_id = auth.uid()
    )
  );

-- Policy 3: Authorized administrators or owners can update payment request status
CREATE POLICY "Administrators and owners can update payment requests"
  ON public.subscription_payment_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_restaurant ON public.subscription_payment_requests(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.subscription_payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created ON public.subscription_payment_requests(created_at DESC);
