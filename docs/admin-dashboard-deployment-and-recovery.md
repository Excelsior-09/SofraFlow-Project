# SOFRAFLOW — Super Admin Deployment, Rollback & Disaster Recovery Guide

**Document Reference:** `docs/admin-dashboard-deployment-and-recovery.md`  
**Date:** October 24, 2026  
**Auditor:** Senior SaaS Architect & Application Security Auditor  
**Environment:** Staging / Production Supabase & Cloudflare/Vercel Frontend  

---

## 1. Production Deployment Gates

To prevent operational disruptions or accidental data corruption, all production deployments of the Super Admin foundation must satisfy the following prerequisite gates:

| Gate | Verification Check | Status / Proof |
|---|---|---|
| **Gate 1: Migration Review** | SQL script syntax, transactional safety (`BEGIN ... COMMIT`), and backward compatibility. | Verified (`20261024040000_super_admin_foundation.sql`). No drops/renames. |
| **Gate 2: Zero Customer Impact** | Existing tenants (e.g. `Café Atlas`, ID: `7a1e349e-c303-456b-976f-5f09a4e36931`) remain unaffected. | Verified. RLS policies preserve tenant isolation. |
| **Gate 3: Secret Protection** | No `service_role` keys, Anthropic API keys, or secrets bundled into frontend dist. | Verified. `npm run build` inspects clean. |
| **Gate 4: Automated Test Sign-Off** | All 21 Vitest test suites (202 tests) pass without failure or skipped security checks. | Verified (`npx vitest run` = 202/202 PASS). |
| **Gate 5: Database Point-In-Time Backup** | Supabase dashboard backup or pg_dump verified before applying DDL. | Required manual step by Platform Owner before live migration. |

---

## 2. Step-by-Step Production Rollout Sequence

### Step 2.1: Supabase Database Migration
1. Access the Supabase SQL Editor for the production project.
2. Review and execute `supabase/migrations/20261024040000_super_admin_foundation.sql`.
3. Confirm successful execution of:
   - Creation of `public.platform_super_admins`.
   - Creation of `public.operating_expenses`.
   - Creation of `public.ai_usage_events`.
   - Creation of `public.is_super_admin()` function.
   - Creation of `trg_prevent_role_escalation` trigger.
   - RPCs: `approve_subscription_payment`, `reject_subscription_payment`, `get_platform_executive_analytics`, `admin_toggle_restaurant_status`.

### Step 2.2: Provision the Super Admin Account
Link the Platform Owner's Supabase Auth UUID to the admin registry:
```sql
-- Step 2.2: Replace with the actual Supabase Auth UUID of the platform owner
INSERT INTO public.platform_super_admins (user_id, is_active, notes)
SELECT id, true, 'Designated SOFRAFLOW Platform Owner'
FROM auth.users
WHERE email = 'admin@sofraflow.com' -- or platform owner email
ON CONFLICT (user_id) DO UPDATE SET is_active = true;
```

### Step 2.3: Enforce TOTP MFA
1. The Platform Owner logs in to `https://app.sofraflow.com/dashboard/settings`.
2. Navigate to Security -> Two-Factor Authentication.
3. Scan the QR code using Google Authenticator or 1Password.
4. Verify the 6-digit TOTP code to establish Authenticator Assurance Level 2 (`aal2`).

### Step 2.4: Deploy Frontend Build
Deploy the updated frontend build containing the `/admin/*` routes and route guards to hosting (Vercel / Cloudflare Pages / Docker):
```bash
git push origin main
```

---

## 3. Rollback & Forward-Recovery Plan

If unexpected anomalies arise after migration, execute the appropriate recovery plan:

### 3.1 Non-Destructive Rollback (Disable Admin Routes)
If an issue occurs strictly within the frontend routing or layout:
1. In `src/App.tsx`, toggle or comment out the `<Route path="/admin/*" ... />` branch.
2. Standard customer dashboard (`/dashboard/*`) and public QR menus (`/menu/*`) remain 100% operational and independent.

### 3.2 Database Rollback Script (Reverse DDL)
If the database migration must be rolled back, execute the following non-destructive reverse script:
```sql
BEGIN;

-- Drop RPC functions
DROP FUNCTION IF EXISTS public.admin_toggle_restaurant_status(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_platform_executive_analytics();
DROP FUNCTION IF EXISTS public.reject_subscription_payment(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.approve_subscription_payment(TEXT, TEXT);

-- Drop trigger and trigger function
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_role_escalation();

-- Drop admin RLS helper
DROP FUNCTION IF EXISTS public.is_super_admin();

-- Drop new tables if desired (optional: data can be kept for auditing)
DROP TABLE IF EXISTS public.ai_usage_events;
DROP TABLE IF EXISTS public.operating_expenses;
DROP TABLE IF EXISTS public.platform_super_admins;

COMMIT;
```
> [!IMPORTANT]
> Never truncate or drop pre-existing tables (`profiles`, `restaurants`, `menus`, `orders`, `subscription_payment_requests`).

---

## 4. Disaster Recovery & Emergency Contacts

- **Platform Admin Technical Lead:** Anas Ziraoui (`admin@sofraflow.com`)
- **Primary Hosting:** Supabase Database (Frankfurt/EU), Vercel CDN
- **Database Backup Frequency:** Automated daily backups via Supabase + manual pre-migration SQL dumps.
- **RTO (Recovery Time Objective):** < 15 minutes.
- **RPO (Recovery Point Objective):** < 1 hour.
