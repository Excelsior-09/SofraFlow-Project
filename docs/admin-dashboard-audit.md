# SOFRAFLOW — Super Admin Dashboard Architecture & Security Audit
**Document Version:** 1.0.0  
**Audit Date:** October 24, 2026  
**Auditor:** Senior SaaS Architect & Security Engineer  
**Status:** Complete (Phase 0 Audit Deliverable)

---

## 1. Executive Summary

SOFRAFLOW is a multi-tenant SaaS platform built for the Moroccan restaurant and hospitality market, providing digital QR menus, table ordering, multilinguality (French, English, Arabic), WhatsApp order dispatch, and AI menu creation (Zina AI).

This audit evaluates the entire existing application stack—frontend architecture, routing, authentication, Supabase PostgreSQL schema, Row Level Security (RLS) policies, integrations, and operational workflows—to prepare the design and implementation of a **production-grade, single-owner Super Admin Dashboard**.

### Core Audit Findings
1. **Existing Stack & Quality**: Modern, robust frontend built with React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Supabase JS v2. Clean component boundaries, comprehensive theme support (Light, Dark, System), and full bilingual internationalization (French/English with Arabic menu support).
2. **Database Schema & RLS**: 14 well-defined tables exist in the live Supabase PostgreSQL database (`profiles`, `restaurants`, `business_members`, `menus`, `menu_categories`, `menu_items`, `qr_settings`, `orders`, `order_items`, `notification_events`, `audit_logs`, `subscription_plans`, `business_subscriptions`, `subscription_payment_requests`). Row Level Security is enabled across all tables.
3. **Critical Security Vulnerabilities Identified**:
   - **Privilege Escalation in `profiles_update_own` Policy**: Authenticated users can execute an UPDATE on their own row in `public.profiles` without column-level restrictions, allowing self-elevation to `role = 'admin'`.
   - **Frontend-Only Admin Verification in `BillingPage.tsx`**: Payment approval queue in the billing page relied on client-side check `isAdminUser = Boolean(user?.role === 'admin' || user?.email === 'admin@sofraflow.com')`.
   - **Ambiguous Super Admin Identity**: Super Admin authorization was not separated into a dedicated server-controlled access record, violating principle of least privilege and non-negotiable rule 7.
4. **Missing Capabilities for Platform Administration**:
   - No platform-wide financial expense ledger (`operating_expenses`) to calculate net operating margin or track Claude/hosting expenses.
   - No `ai_usage_events` logging table to track token consumption, latency, and estimated vs. invoiced costs for Claude API.
   - No platform executive analytics function to securely aggregate platform-wide KPIs (MRR, active tenants, conversion rates) without leaking tenant boundaries.
   - No dedicated Super Admin route guard (`AdminRoute.tsx`) enforcing both server-verified Super Admin role and AAL2 MFA assurance.

---

## 2. Frontend Inspection

### 2.1 Technology Stack & Build Architecture
- **Framework**: React 19.3.1 (with React DOM 19.3.1).
- **Build Tool**: Vite 8.3.4 with `@vitejs/plugin-react` 6.1.2.
- **Language**: TypeScript 7.0.2 with strict type checking (`tsc -b`).
- **Routing**: `react-router-dom` 7.18.4 (`BrowserRouter`, nested routes, `Navigate`).
- **Styling**: Tailwind CSS 3.4.19, `clsx` 2.1.1, `tailwind-merge` 3.7.0.
- **Charts**: `recharts` 3.10.1 (Area, Bar, Pie, ResponsiveContainer).
- **Icons**: `lucide-react` 1.59.0.
- **Testing**: `vitest` 5.0.5 (20 test suites, 189 tests, 100% passing).
- **Linter**: `oxlint` 1.88.0.

### 2.2 Layout, Design System & Theming
- **Visual Identity**: Tailored Moroccan hospitality aesthetic with rich palettes:
  - Deep Forest Green (`#153E35`)
  - Warm Moroccan Brand Orange (`#EA580C`)
  - Amber / Moroccan Gold (`#D97706`)
  - Ivory background (`#FDFBF7`)
  - Dark Mode: Dark Forest (`#0C1814`), Dark Surface (`#101E1A`), Dark Border (`#233831`).
- **Theming**: `ThemeContext.tsx` supports `light`, `dark`, and `system` modes with CSS variables defined in `src/index.css`.
- **Localization**: `LanguageContext.tsx` with dictionaries in `src/locales/` (`en.ts`, `fr.ts`). The Super Admin dashboard must implement complete French and English localization with proper MAD currency formatting.

### 2.3 Route & Navigation Structure
- **Public & Marketing**: `/`, `/features`, `/pricing`, `/about`, `/contact`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`, `/solutions/*`, `/blog/*`.
- **Customer Digital Menus**: `/m/:restaurantSlug`, `/m/:restaurantSlug/:menuSlug`, `/order/:publicOrderReference`.
- **Tenant Dashboard** (`/app/*`, wrapped in `ProtectedRoute` and `ErrorBoundary`):
  - `/app/overview`, `/app/menus`, `/app/products`, `/app/orders`, `/app/qr-nfc`, `/app/languages`, `/app/whatsapp`, `/app/analytics`, `/app/settings`, `/app/profile`, `/app/billing`, `/app/help`.
- **Proposed Admin Navigation** (`/admin/*`, wrapped in dedicated `AdminRoute` and `AdminLayout`):
  - `/admin/overview` (Executive KPIs & Trends)
  - `/admin/users` (Account directory & status)
  - `/admin/restaurants` (Tenant establishment directory & activation)
  - `/admin/subscriptions` (Plans & subscriptions management)
  - `/admin/payments` (Bank transfer verification queue with bank statement reconciliation)
  - `/admin/finance` (Revenue, expense ledger & profitability)
  - `/admin/ai-operations` (Claude API configuration, latency, token usage & cost control)
  - `/admin/analytics` (Funnel conversion, churn & adoption)
  - `/admin/security` (MFA status, RLS audit & security events)
  - `/admin/system-health` (Supabase connectivity, endpoint latencies & incident logs)
  - `/admin/audit-logs` (Immutable admin audit trail)
  - `/admin/settings` (Platform settings, limits & integration status)

---

## 3. Database & Supabase Inspection

### 3.1 Live Database Connectivity & Inventory
A live inspection of the connected Supabase instance (`https://msttrsfmqfvtlkvikhvu.supabase.co`) was conducted via `@supabase/supabase-js`. All 14 existing tables were verified:

| Table Name | Live Row Count (Anon Query) | Data Sensitivity | Ownership / Tenant Model | Purpose |
|---|---|---|---|---|
| `public.profiles` | 0 (RLS protected) | High (PII) | 1-to-1 with `auth.users` | User name, phone, role, language |
| `public.restaurants` | 1 (Active, public view) | High (Business) | Owned by `owner_id` (auth.users) | Core restaurant entity & config |
| `public.business_members` | 0 (RLS protected) | High | Multi-user per restaurant | Roles (owner, manager, staff) |
| `public.menus` | 0 (RLS protected) | Medium | Belongs to `restaurant_id` | Menus (draft, published, archived) |
| `public.menu_categories` | 0 (RLS protected) | Medium | Belongs to `restaurant_id` | Multilingual dish categories |
| `public.menu_items` | 0 (RLS protected) | Medium | Belongs to `restaurant_id` | Multilingual dishes & MAD pricing |
| `public.qr_settings` | 1 (Active, public view) | Low | Belongs to `restaurant_id` | QR styling, table assignment, colors |
| `public.orders` | 0 (RLS protected) | High (Financial) | Belongs to `restaurant_id` | Customer orders source of truth |
| `public.order_items` | 0 (RLS protected) | High | Belongs to `order_id` | Immutable order line snapshots |
| `public.notification_events` | 0 (RLS protected) | Medium | Belongs to `restaurant_id` | WhatsApp dispatch audit events |
| `public.audit_logs` | 0 (RLS protected) | High (Security) | Belongs to `restaurant_id` | Operational change logs |
| `public.subscription_plans` | 3 (Publicly readable) | Low | Platform-level catalog | Starter (199 MAD), Growth (399 MAD), Pro (799 MAD) |
| `public.business_subscriptions` | 0 (RLS protected) | High (Billing) | Belongs to `restaurant_id` | Active plan status & renewal dates |
| `public.subscription_payment_requests` | 0 (RLS protected) | High (Financial) | Belongs to `restaurant_id` & `user_id` | Bank transfer verification requests |

### 3.2 Real Production Data Integrity
The live database contains 1 verified genuine restaurant:
- **ID**: `7a1e349e-c303-456b-976f-5f09a4e36931`
- **Name**: `Café Atlas`
- **Slug**: `cafe-atlas-8845`
- **City**: `Elhajeb`
- **Owner ID**: `4f12fdc4-9c1b-4413-815a-cb51a9149f3b`
- **Status**: `active`

**Constraint Check**: All migrations and operations must strictly preserve this record and its owner relationships without modification or reset.

---

## 4. Gap Analysis & Architecture Mapping

| Functional Area | Existing Schema / Function | Missing Capability (Evidence-based Gap) | Proposed Safe Change |
|---|---|---|---|
| **Super Admin Identity & Access** | `profiles.role` column with `CHECK (role IN ('admin', 'owner', 'manager', 'staff'))`. Insecure policy `profiles_update_own` allows user to update own role. | No dedicated, server-controlled Super Admin table. No check against self-role elevation. | Create `platform_super_admins` table (server-controlled). Create `is_super_admin()` security definer function. Add trigger on `profiles` preventing non-super-admins from setting `role = 'admin'`. |
| **MFA Enforcement for Admin** | Supabase Auth MFA / TOTP (`auth.mfa.enroll`, `challengeAndVerify`) implemented for users in `ProfilePage.tsx`. | No server-side gate checking that the Super Admin session actually holds Assurance Level 2 (`aal2`) before allowing access to `/admin` or executing privileged actions. | Create `AdminRoute.tsx` requiring `isSuperAdmin === true` AND `mfaAssuranceLevel === 'aal2'`. Validate assurance level in backend procedures. |
| **Manual Bank Transfer Workflow** | `subscription_payment_requests` table with statuses `pending`, `under_review`, `approved`, `rejected`, `cancelled`. Approval was partially implemented on customer billing page. | Approval lacked double-approval protection, bank transaction reference uniqueness check, and atomic subscription update transaction. | Move approval queue to `/admin/payments`. Add unique partial index on `transaction_reference` for approved payments. Implement atomic database function `approve_subscription_payment` (locks row, updates subscription, records audit log in 1 transaction). |
| **Expenses & Operating Ledger** | None. | No way to record Claude API bills, Supabase hosting costs, domain renewals, or contractor fees to compute genuine net profitability. | Create `public.operating_expenses` table with category, amount, currency (MAD), vendor, and payment status. Accessible only to verified Super Admin. |
| **Claude AI Operations (Zina)** | `ZinaMenuCreatorModal.tsx` currently simulates generation using pre-built keyword templates. | No database tracking of token usage, input/output token counts, estimated vs invoiced API cost, provider latency, or errors. | Create `public.ai_usage_events` table (append-only log). Create AI Operations page showing configuration status, latency, request volume, token usage, and cost estimation (USD and MAD). |
| **Platform Executive KPIs** | `get_business_sales_analytics(restaurant_id)` exists but only calculates metrics for a single restaurant. | No server function to compute platform-wide MRR, active restaurants, customer churn, pending payments, or total revenue across all tenants safely. | Create `public.get_platform_executive_analytics()` (SECURITY DEFINER, restricted strictly to `is_super_admin()`). |
| **Tenant Isolation & RLS** | RLS functions `check_user_business_access` and `check_user_is_owner_or_admin` check `profiles.role = 'admin'`. | If `profiles.role` was compromised, tenant boundaries could leak. Admin bypass was ad-hoc across tables. | Update RLS helper functions to use `public.is_super_admin()` instead of trusting `profiles.role`. Guarantee that customer-facing queries continue to strictly isolate tenants. |
| **Audit Logging** | `audit_logs` table has basic schema (`restaurant_id`, `actor_user_id`, `event_type`, `entity_type`, `entity_id`, `metadata`). | No dedicated action tracking for administrative actions (e.g. payment approved, user suspended, expense recorded). | Extend audit log usage to record administrative events with actor ID, action type, target entity, justification, and before/after state snapshots. |

---

## 5. Security & Risk Analysis

### 5.1 Security Vulnerabilities Discovered
1. **OWASP A01: Broken Access Control (Privilege Escalation)**:
   In `supabase/migrations/20261022020000_production_hardening_and_multi_tenant.sql`:
   ```sql
   CREATE POLICY "profiles_update_own" ON public.profiles
     FOR UPDATE TO authenticated
     USING (auth.uid() = id)
     WITH CHECK (auth.uid() = id);
   ```
   *Impact*: An ordinary authenticated user could send an HTTP PATCH/UPDATE with `{ "role": "admin" }` to `/rest/v1/profiles?id=eq.<user_id>`, becoming an admin.
   *Remediation*:
   - Separate platform super-admin access into `public.platform_super_admins`.
   - Add a database trigger `prevent_unauthorized_role_escalation` on `public.profiles` that raises an exception if a non-super-admin modifies `role`.
2. **OWASP A07: Identification and Authentication Failures (Missing Server-Side MFA Check)**:
   A valid JWT alone does not prove that MFA TOTP challenge was completed for administrative actions.
   *Remediation*: Server-side validation via `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` ensuring `currentLevel === 'aal2'` before granting access to `/admin` routes and sensitive mutations.
3. **Double-Approval & Race Condition in Payments**:
   If an administrator clicks "Approve" twice simultaneously, or two browser tabs process the same request, duplicate subscription periods could be awarded.
   *Remediation*: Row-level lock (`SELECT ... FOR UPDATE`) in `approve_subscription_payment` function, checking `status = 'under_review'` before updating.

---

## 6. Implementation Sequence & Rollback Plan

### Sequence
- **Phase 1**: Database Migration (`20261024040000_super_admin_foundation.sql`)
  - Create `platform_super_admins` table.
  - Create `is_super_admin()` security definer function.
  - Create trigger preventing role escalation in `profiles`.
  - Create `operating_expenses` table.
  - Create `ai_usage_events` table.
  - Create `approve_subscription_payment` and `get_platform_executive_analytics` RPCs.
  - Grant Super Admin role to designated platform owner.
- **Phase 2**: Frontend Security & Administration Layer
  - Create `src/components/admin/AdminRoute.tsx` with MFA AAL2 verification.
  - Create `src/components/admin/AdminLayout.tsx` matching SOFRAFLOW visual identity.
  - Create `src/services/adminService.ts` for all server-verified administrative calls.
- **Phase 3**: Core Super Admin Dashboard Views
  - Executive Overview (`/admin/overview`) with real KPI cards and date filters.
  - User Directory (`/admin/users`) with account details, owned restaurants, and safe status toggles.
  - Restaurant Directory (`/admin/restaurants`) with tenant health, menu status, and subscription details.
  - Subscriptions & Payments (`/admin/subscriptions`, `/admin/payments`) with bank transfer verification workflow and bank statement matching.
  - Financial Ledger (`/admin/finance`) with revenue, operating expenses, and net profit calculations in MAD.
  - Zina AI Operations (`/admin/ai-operations`) with Claude model status, latency, token usage, cost analysis, and threshold alerts.
  - Analytics (`/admin/analytics`), Security Center (`/admin/security`), System Health (`/admin/system-health`), Audit Trail (`/admin/audit-logs`), and Settings (`/admin/settings`).
- **Phase 4**: Verification & Testing
  - Automated Vitest test suite (`src/__tests__/superAdminDashboardSecurity.test.ts`).
  - Tenant isolation regression tests.
  - Production build verification (`npm run build`).

### Rollback Strategy
All database modifications are forward-additive. No existing columns or tables are deleted or renamed. If rollback is necessary:
1. Revoke `is_super_admin()` permissions.
2. Drop new views/functions (`get_platform_executive_analytics`, `approve_subscription_payment`).
3. Frontend routes under `/admin` will fail closed without altering any customer-facing `/app/*` routes.

---

## 7. Audit Sign-Off
- **Destructive Operations Excluded**: Confirmed. No `DROP TABLE`, `TRUNCATE`, or bulk modification commands will be run.
- **Tenant Isolation Preserved**: Confirmed. Customer RLS policies remain intact.
- **Exit Condition Met**: Audit complete. Ready to proceed to implementation plan.
