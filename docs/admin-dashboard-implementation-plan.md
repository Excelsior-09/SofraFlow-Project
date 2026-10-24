# SOFRAFLOW — Super Admin Dashboard Implementation Plan
**Document Version:** 1.0.0  
**Date:** October 24, 2026  
**Status:** Approved for Execution

---

## 1. Implementation Phases & Checklist

### Phase 1: Database & Access Security Foundation
- [ ] **1.1 Migration `20261024040000_super_admin_foundation.sql`**:
  - [ ] Create `public.platform_super_admins` table (server-controlled, no client writes).
  - [ ] Create `public.is_super_admin()` security definer function.
  - [ ] Attach `trg_prevent_role_escalation` on `public.profiles` to disallow non-super-admins from setting `role = 'admin'`.
  - [ ] Create `public.operating_expenses` table for platform expense tracking (MAD).
  - [ ] Create `public.ai_usage_events` table for Claude API tracking (tokens, latency, cost in USD/MAD).
  - [ ] Create atomic RPC `public.approve_subscription_payment` (locks row with `FOR UPDATE`, checks for double-approval, updates subscription in single transaction).
  - [ ] Create atomic RPC `public.reject_subscription_payment` (requires non-empty reason, updates status, writes audit log).
  - [ ] Create RPC `public.get_platform_executive_analytics` aggregating real platform KPIs.
  - [ ] Update RLS policies on `restaurants`, `profiles`, `audit_logs`, and `subscription_payment_requests` to recognize `is_super_admin()`.

### Phase 2: Frontend Super Admin Security & Layout
- [ ] **2.1 Super Admin Route Guard (`src/components/admin/AdminRoute.tsx`)**:
  - [ ] Check authentication status.
  - [ ] Query `is_super_admin()` via server check.
  - [ ] Check MFA assurance level (`aal2` required).
  - [ ] If authenticated but MFA is not completed, display dedicated admin TOTP challenge screen before granting access.
  - [ ] Render 403 Forbidden / Not Authorized screen for non-admin users with return to dashboard link.
- [ ] **2.2 Super Admin Layout (`src/components/admin/AdminLayout.tsx`)**:
  - [ ] Persistent administrator sidebar with badge "SUPER ADMIN".
  - [ ] Responsive navigation for all 12 admin sections.
  - [ ] Live security indicator (MFA Active, Session time, Quick Sign-out).
  - [ ] Theme switcher (Light/Dark/System) and Language switcher (FR/EN).
  - [ ] Breadcrumb navigation and back link to `/app/overview`.
- [ ] **2.3 Admin Service (`src/services/adminService.ts`)**:
  - [ ] Typed methods for fetching platform analytics, users, restaurants, subscriptions, payments, expenses, AI usage, audit logs, and system health.
  - [ ] All methods verify active Super Admin session.

### Phase 3: Route Integration in `src/App.tsx`
- [ ] Register `/admin` and all sub-routes under `<AdminRoute />`:
  - `/admin/overview`
  - `/admin/users`
  - `/admin/restaurants`
  - `/admin/subscriptions`
  - `/admin/payments`
  - `/admin/finance`
  - `/admin/ai-operations`
  - `/admin/analytics`
  - `/admin/security`
  - `/admin/system-health`
  - `/admin/audit-logs`
  - `/admin/settings`

### Phase 4: Core Admin Pages Implementation
- [ ] **4.1 Executive Overview (`AdminOverviewPage.tsx`)**:
  - [ ] Real KPI cards (Registered Users, Total Restaurants, Active Subscriptions, Pending Verifications, MRR, Operating Result, AI Cost).
  - [ ] Date filters (Today, 7 days, 30 days, Month, Custom).
  - [ ] Growth trends via Recharts based on real database records.
- [ ] **4.2 User Management (`AdminUsersPage.tsx`)**:
  - [ ] Searchable user directory with account status, email, phone, role, and restaurant count.
  - [ ] User details modal with linked restaurants and subscription status.
  - [ ] Suspension / activation action with reason and audit logging.
- [ ] **4.3 Restaurant Management (`AdminRestaurantsPage.tsx`)**:
  - [ ] Searchable tenant directory with city, owner, status, menu publication state, and order counts.
  - [ ] Status toggle (active / suspended) with confirmation and audit logging.
- [ ] **4.4 Subscriptions & Bank Transfer Payments (`AdminPaymentsPage.tsx`, `AdminSubscriptionsPage.tsx`)**:
  - [ ] Dedicated manual bank transfer verification queue.
  - [ ] Bank statement reconciliation fields (Reference, Bank name, Amount, Payer, Date, Receipt preview).
  - [ ] Double-approval prevention with atomic database function.
  - [ ] Rejection workflow requiring explicit reason.
- [ ] **4.5 Finance & Operating Expenses (`AdminFinancePage.tsx`)**:
  - [ ] Revenue collected vs. Pending transfers.
  - [ ] Operating expense ledger (Claude API, Supabase, Hosting, Domain, Advertising, Contractors).
  - [ ] Add expense modal with receipt upload or reference, category, and amount in MAD.
  - [ ] True operating margin calculation based on real recorded ledger.
- [ ] **4.6 Claude AI Operations (`AdminAiOperationsPage.tsx`)**:
  - [ ] Provider status (Claude 3.7 Sonnet / Claude 3.5 Haiku).
  - [ ] Latency, token usage, estimated cost (USD / MAD), and error tracking.
  - [ ] Per-restaurant AI usage breakdown and quota alert thresholds.
- [ ] **4.7 Analytics, Security, System Health, Audit Logs, Settings**:
  - [ ] `/admin/analytics`: Real funnel conversion and menu publication metrics.
  - [ ] `/admin/security`: Super Admin MFA status, failed attempts, and RLS integrity status.
  - [ ] `/admin/system-health`: Real Supabase ping latency, database response times, and API health.
  - [ ] `/admin/audit-logs`: Immutable table of administrative actions with filter by entity and actor.
  - [ ] `/admin/settings`: Platform configurations, plan pricing, and bank account transfer details.

### Phase 5: Automated Testing & Verification
- [ ] **5.1 Test Suite `src/__tests__/superAdminDashboardSecurity.test.ts`**:
  - [ ] Test 1: Unauthenticated visitors rejected from `/admin/*`.
  - [ ] Test 2: Ordinary restaurant owners rejected from `/admin/*` (403 Forbidden).
  - [ ] Test 3: Non-super-admins cannot elevate own role to `admin` in `profiles`.
  - [ ] Test 4: Super Admin without MFA (AAL1) blocked until TOTP verification completes.
  - [ ] Test 5: Bank transfer approval is atomic and rejects duplicate references.
  - [ ] Test 6: Rejection requires non-empty reason and preserves decision audit log.
  - [ ] Test 7: Operating expenses correctly aggregate with subscription revenue for operating result.
  - [ ] Test 8: Tenant isolation remains strictly enforced for customers.
- [ ] **5.2 Full Vitest Suite Run (`npx vitest run`)**: Verify 100% pass across all test files.
- [ ] **5.3 Production Build (`npm run build`)**: Verify clean TypeScript compilation and bundling.

---

## 2. Technical Details & SQL Migration Blueprint

```sql
-- Migration: 20261024040000_super_admin_foundation.sql

-- 1. Dedicated Super Admin Table
CREATE TABLE IF NOT EXISTS public.platform_super_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT
);

ALTER TABLE public.platform_super_admins ENABLE ROW LEVEL SECURITY;

-- 2. Trusted Server Function to Verify Super Admin Status
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

-- 3. Trigger to Prevent Self-Role Escalation in public.profiles
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Operating Expenses Ledger
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

-- 5. AI Usage Events Log
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
```
