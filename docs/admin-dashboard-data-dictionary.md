# SOFRAFLOW — Super Admin Data Dictionary & Metric Definitions

**Document Reference:** `docs/admin-dashboard-data-dictionary.md`  
**Date:** October 24, 2026  
**Auditor:** Senior SaaS Architect & Financial Systems Specialist  
**Database Engine:** PostgreSQL 15 / Supabase  

---

## 1. Verified Schema Inventory (14 Existing + 3 Extended Tables)

### 1.1 Existing Tables Verified in Production

| Table Name | Primary Key | Foreign Keys / Relationships | Purpose & Ownership | RLS Status |
|---|---|---|---|---|
| `public.profiles` | `id` (UUID) | References `auth.users(id)` | User accounts, names, phone numbers, and profile roles. | Enabled (`profiles_read_own`, `profiles_update_own`) |
| `public.restaurants` | `id` (UUID) | `owner_id -> auth.users(id)` | Multi-tenant restaurant entities. Verified live data: `Café Atlas` (Elhajeb). | Enabled (`restaurants_owner_all`, `restaurants_public_read`) |
| `public.categories` | `id` (UUID) | `restaurant_id -> restaurants(id)` | Menu item groupings (Drinks, Platters, Desserts, etc.). | Enabled (tenant isolated) |
| `public.products` | `id` (UUID) | `restaurant_id -> restaurants(id)`, `category_id -> categories(id)` | Menu items with pricing in MAD, descriptions, allergens. | Enabled (tenant isolated) |
| `public.menus` | `id` (UUID) | `restaurant_id -> restaurants(id)` | Structured digital menus with draft/published state. | Enabled (tenant isolated, public read when published) |
| `public.orders` | `id` (UUID) | `restaurant_id -> restaurants(id)` | Dine-in and takeaway orders placed via QR codes. | Enabled (tenant isolated) |
| `public.order_items` | `id` (UUID) | `order_id -> orders(id)`, `product_id -> products(id)` | Order line items with quantity, options, and unit prices. | Enabled (tenant isolated) |
| `public.qr_codes` | `id` (UUID) | `restaurant_id -> restaurants(id)` | Table-specific and counter QR codes with customization settings. | Enabled (tenant isolated) |
| `public.business_subscriptions` | `id` (UUID) | `restaurant_id -> restaurants(id)` | Active subscription entitlements, plan tiers, and billing cycles. | Enabled (tenant isolated) |
| `public.subscription_payment_requests` | `id` (UUID) | `restaurant_id -> restaurants(id)`, `user_id -> auth.users(id)` | Manual Moroccan bank transfer submissions and verification records. | Enabled (tenant isolated + super admin access) |
| `public.audit_logs` | `id` (UUID) | `actor_id -> auth.users(id)` | Immutable operational event trail. | Enabled (admin-only view) |
| `public.zina_generations` | `id` (UUID) | `restaurant_id -> restaurants(id)` | Menu scan and AI generation task history. | Enabled (tenant isolated) |
| `public.restaurant_staff` | `id` (UUID) | `restaurant_id -> restaurants(id)`, `user_id -> auth.users(id)` | Staff role memberships (waiter, kitchen, manager). | Enabled (tenant isolated) |
| `public.restaurant_tables` | `id` (UUID) | `restaurant_id -> restaurants(id)` | Physical table numbers and seating capacities. | Enabled (tenant isolated) |

---

### 1.2 Extended Super Admin Tables (Migration `20261024040000_super_admin_foundation.sql`)

#### 1.2.1 `public.platform_super_admins`
Server-controlled registry of authorized platform administrators.
- `user_id` (UUID, PK, References `auth.users(id) ON DELETE CASCADE`): Platform owner user UUID.
- `is_active` (BOOLEAN, DEFAULT true): Whether admin privileges are currently active.
- `granted_at` (TIMESTAMPTZ, DEFAULT now()): Timestamp when privileges were granted.
- `notes` (TEXT): Administrative notes or designation.
- **RLS Policy:** Only Super Admin can read/manage (`is_super_admin()`).

#### 1.2.2 `public.operating_expenses`
Platform operating cost ledger for financial reporting and net margin calculations.
- `id` (UUID, PK, DEFAULT gen_random_uuid()): Unique expense transaction ID.
- `category` (TEXT, NOT NULL): Expense category (`claude_api`, `supabase`, `hosting`, `domain_email`, `advertising`, `contractors`, `payment_fees`, `other`).
- `description` (TEXT, NOT NULL): Description of service or invoice.
- `amount` (NUMERIC(12,2), NOT NULL, CHECK `amount >= 0`): Expense amount.
- `currency` (VARCHAR(3), NOT NULL, DEFAULT `'MAD'`): Financial currency (MAD default).
- `vendor` (TEXT): Payee or provider name (e.g. Anthropic, Vercel, Cloudflare).
- `invoice_reference` (TEXT): External receipt or billing reference.
- `expense_date` (DATE, NOT NULL, DEFAULT CURRENT_DATE): Date cost was incurred.
- `is_recurring` (BOOLEAN, DEFAULT false): Whether cost is monthly recurring.
- `payment_status` (TEXT, DEFAULT `'paid'`, CHECK `payment_status IN ('paid', 'pending', 'cancelled')`): Status.
- `recorded_by` (UUID, References `auth.users(id)`): Admin user who entered the record.
- `created_at` / `updated_at` (TIMESTAMPTZ, DEFAULT now()): Timestamps.
- **RLS Policy:** Accessible exclusively to Super Admins via `is_super_admin()`.

#### 1.2.3 `public.ai_usage_events`
Detailed telemetry for Claude API operations and Zina AI features.
- `id` (UUID, PK, DEFAULT gen_random_uuid()): Unique event ID.
- `restaurant_id` (UUID, References `restaurants(id) ON DELETE SET NULL`): Associated restaurant.
- `user_id` (UUID, References `auth.users(id) ON DELETE SET NULL`): Requesting user.
- `feature` (VARCHAR(64), NOT NULL): Operation name (`menu_generation`, `dish_description`, `price_suggestion`, `menu_scan`).
- `provider` (VARCHAR(32), NOT NULL, DEFAULT `'claude'`): Primary AI provider.
- `model` (VARCHAR(64), NOT NULL, DEFAULT `'claude-3-5-sonnet'`): Claude model identifier.
- `input_tokens` (INTEGER, NOT NULL, DEFAULT 0): Billable input tokens.
- `output_tokens` (INTEGER, NOT NULL, DEFAULT 0): Billable output tokens.
- `estimated_cost_usd` (NUMERIC(10,6), DEFAULT 0): Estimated cost in US Dollars.
- `estimated_cost_mad` (NUMERIC(10,4), DEFAULT 0): Estimated cost in Moroccan Dirhams (1 USD ≈ 10.15 MAD).
- `latency_ms` (INTEGER, DEFAULT 0): Roundtrip latency in milliseconds.
- `status` (VARCHAR(16), NOT NULL, CHECK `status IN ('success', 'failed', 'rate_limited')`): Execution status.
- `error_message` (TEXT): Sanitized error category if failed (no raw secrets).
- `created_at` (TIMESTAMPTZ, DEFAULT now()): Timestamp.
- **RLS Policy:** Append-only for application roles; full access for Super Admins.

---

## 2. Metric Definitions & Financial Calculations

All metrics displayed on the Super Admin Dashboard are derived from real database records and adhere to explicit financial definitions:

### 2.1 Customer & Tenant Metrics
- **Total Registered Users:**  
  $$\text{Count}(u \in \text{public.profiles})$$
- **Total Restaurants:**  
  $$\text{Count}(r \in \text{public.restaurants})$$
- **Active Restaurants:**  
  $$\text{Count}(r \in \text{public.restaurants} \mid r.\text{status} = 'active' \land \exists m \in \text{public.menus} : m.\text{status} = 'published')$$  
  *Definition:* A restaurant is only counted as active if its status is active AND it has at least one published digital menu.
- **Published Menus:**  
  $$\text{Count}(m \in \text{public.menus} \mid m.\text{status} = 'published')$$

### 2.2 Subscription & Revenue Metrics
- **Pending Bank Transfers:**  
  $$\text{Count}(p \in \text{public.subscription_payment_requests} \mid p.\text{status} = 'under\_review')$$
- **Active Subscriptions:**  
  $$\text{Count}(s \in \text{public.business_subscriptions} \mid s.\text{status} = 'active' \land s.\text{current\_period\_end} \ge \text{now}())$$
- **Net Collected Cash (MAD):**  
  $$\sum (p.\text{amount} \mid p \in \text{public.subscription_payment_requests} \land p.\text{status} = 'approved') - \text{Refunds}$$  
  *Accounting Rule:* Unverified or pending bank transfer submissions are claims and are strictly excluded from collected revenue.
- **Monthly Recurring Revenue (MRR in MAD):**  
  $$\sum \text{PlanPrice}_{\text{MAD}}(s) \quad \forall s \in \text{Qualifying Active Recurring Subscriptions}$$  
  *Tier Pricing:* Starter: 290 MAD/mo; Pro: 590 MAD/mo; Business: 990 MAD/mo. Annual terms normalized to monthly equivalent.

### 2.3 Financial Result & Operating Profitability
- **Total Operating Expenses (MAD):**  
  $$\sum e.\text{amount} \quad \forall e \in \text{public.operating\_expenses} \mid e.\text{payment\_status} = 'paid'$$
- **Net Operating Result (MAD):**  
  $$\text{Net Collected Cash} - \text{Total Operating Expenses}$$  
  *Disclosure:* Operating result is calculated on a cash reconciliation basis using verified Moroccan bank receipts and recorded vendor expenses. It does not constitute audited GAAP/IFRS tax net profit.

### 2.4 Zina AI & Claude Operations
- **Total AI Token Consumption:**  
  $$\sum (\text{input\_tokens} + \text{output\_tokens}) \quad \forall \text{events} \in \text{public.ai\_usage\_events}$$
- **Claude API Spend (USD / MAD):**  
  $$\sum \text{estimated\_cost\_usd} \quad \text{and} \quad \sum \text{estimated\_cost\_mad}$$  
  *Pricing Formula:* Claude 3.5 Sonnet: \$3.00 / 1M input tokens; \$15.00 / 1M output tokens; USD/MAD FX rate fixed at 10.15 MAD/USD.
- **Average Model Latency:**  
  $$\text{Avg}(\text{latency\_ms}) \quad \forall \text{successful AI events}$$
- **AI Error Rate (%):**  
  $$\frac{\text{Count}(\text{failed events})}{\text{Total events}} \times 100$$
