# SOFRAFLOW — Restaurant Digital Menu & WhatsApp Ordering SaaS
> **"From Menu to Momentum."**

SOFRAFLOW is a modern, production-oriented digital menu, online ordering, and official WhatsApp order-notification SaaS designed for restaurants, cafés, casual bistros, riads, and dining groups in Morocco and international hospitality markets.

---

## 1. Core Workflow

1. **Restaurant Setup**: The restaurant owner configures their profile, currencies (defaulting to Moroccan Dirham, `MAD`), opening hours, and kitchen WhatsApp phone number.
2. **Digital Menu Publishing**: The owner builds trilingual categories and dishes (English, French, and Arabic with Right-to-Left RTL support), verified allergens, and customizable options.
3. **Smart QR & Table Routing**: SofraFlow generates permanent, high-resolution QR codes for each table (e.g. `Table 4`) or venue entrance, exportable as printable SVG/PDF stands.
4. **Frictionless Mobile Ordering**: Diners scan the QR code to open the web menu on their smartphone. **No app installation or account creation required.**
5. **Server-Authoritative Validation**: On checkout, the backend recalculates all item prices, option modifiers, and taxes, protecting the restaurant against client-side tampering.
6. **WhatsApp Kitchen Dispatch**: When the order is saved as the source-of-truth in the database, our transactional dispatcher sends a structured alert via the official Meta WhatsApp Cloud API to the kitchen pass or manager phone.
7. **Order Lifecycle Management**: Kitchen staff track and update orders in real-time (`New` → `Confirmed` → `Preparing` → `Ready` → `Completed`) with printable 80mm thermal receipts.

---

## 2. Application Architecture & Routes

The application consists of three connected experiences:

### A. Marketing Website (Public)
| Route | Description |
|---|---|
| `/` | Commercial homepage: Hero, value proposition, workflow, interactive live demo preview, pricing, and FAQ |
| `/features` | Deep dive into digital menus, WhatsApp dispatch, table routing, and analytics |
| `/pricing` | Transparent pricing hypotheses in MAD (Starter 99 MAD, Growth 199 MAD, Pro 349 MAD) |
| `/about` | Hospitality origin, mission, and Moroccan dining focus |
| `/contact` | Onboarding support and demo booking inquiry form |
| `/login` | Accessible sign-in with 1-click fast demo profiles |
| `/signup` | Instant restaurant registration and slug reservation |

### B. Restaurant Owner Application (Authenticated `/app/...`)
| Route | Description |
|---|---|
| `/app/overview` | Core dashboard: Today's orders, revenue, average order value (AOV), best-sellers, and recent orders |
| `/app/orders` | Live order stream & kanban status controls with sound alert toggle |
| `/app/orders/:orderId` | Order details: Item options, customer notes, status progression, WhatsApp audit, and thermal ticket printing |
| `/app/menus` | Menu management: Draft, Published, Archived, duplication, and custom slugs |
| `/app/menus/:menuId` | Menu builder: Category organizer and dish assignment |
| `/app/products` | Dish catalog: Trilingual names, prices in MAD, availability toggle (86/Sold out), allergens, and option groups |
| `/app/qr-nfc` | QR & NFC studio: Table-specific routing, brand color switcher, PNG/SVG export, and printable acrylic stand layout |
| `/app/languages` | Multilingual content studio: Completion statistics and Arabic RTL review |
| `/app/whatsapp` | Official Meta WhatsApp Cloud API settings, test ping sender, and live delivery audit events log |
| `/app/analytics` | Sales intelligence: Revenue over time, status breakdown, and WhatsApp success rate |
| `/app/settings` | Restaurant profile, currency, tax rate (10%), service fees, and fulfillment toggles (Dine-in / Takeaway) |
| `/app/billing` | Subscription tier overview and simulated plan switcher |
| `/app/help` | Step-by-step Meta Cloud API setup checklist, QR printing guidelines, and sample database reset |

### C. Customer-Facing Digital Menu (Public)
| Route | Description |
|---|---|
| `/m/:restaurantSlug` | Public mobile menu with search, category tabs, and dietary filters |
| `/m/:restaurantSlug?table=:tableNumber` | Table-specific menu link that automatically links the order to the table |
| `/order/:publicOrderReference` | Order confirmation and live tracking receipt with WhatsApp delivery status indicator |

---

## 3. Technology Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom Moroccan-inspired palette (`#153E35` Forest Green, `#D9A441` Gold Accent, `#F7F7F2` Warm Ivory, `#202923` Ink)
- **Typography**: Plus Jakarta Sans, Inter, and Noto Sans Arabic (with native `dir="rtl"` support)
- **Icons**: Lucide React
- **QR Codes**: `qrcode` library for high-res PNG and vector SVG generation
- **Charts**: Recharts for business intelligence and revenue metrics
- **State & Storage**: Modular database service (`src/services/db.ts`) with tenant-isolated persistence and memory fallback
- **Testing**: Vitest with unit & integration tests

---

## 4. Local Installation & Development

### Prerequisites
- Node.js (v18 or higher recommended; built & tested with v22.15.0)
- npm (v10 or higher)

### Setup Steps
```bash
# 1. Clone repository or open project folder
cd "path/to/sofraflow"

# 2. Install dependencies
npm install

# 3. Run automated test suite
npm run test

# 4. Build for production (verifies TypeScript & bundle)
npm run build

# 5. Launch local development server
npm run dev
```

The application will be live at: **`http://localhost:5173/`**

---

## 5. Automated Test Suite

SofraFlow includes automated test coverage for critical business paths:
- **`src/__tests__/orderCalculation.test.ts`**: Verifies server-authoritative calculations, client price tampering protection, tax calculation (10%), option modifiers, and rejection of sold-out items or missing table numbers.
- **`src/__tests__/whatsappService.test.ts`**: Verifies Meta Cloud API template payload construction, sandbox dispatching, simulated transient failures, and order persistence.
- **`src/__tests__/dbTenantIsolation.test.ts`**: Verifies that Restaurant A cannot access or mutate Restaurant B's products, menus, or orders.
- **`src/__tests__/qrService.test.ts`**: Verifies generation of valid PNG base64 data URLs and SVG vectors for table QR codes.

To execute tests at any time:
```bash
npm run test
```

---

## 6. Official Meta WhatsApp Business Platform Setup Guide

SOFRAFLOW connects directly to the official Meta WhatsApp Cloud API. Unofficial WhatsApp Web automations are strictly avoided for reliability and Meta policy compliance.

### Setup Checklist:
1. **Meta Developer Account**: Go to [developers.facebook.com](https://developers.facebook.com/) and register.
2. **Create Meta App**: Create a business app and add the **WhatsApp** product.
3. **Register Phone Number**: Attach your kitchen phone number to your WhatsApp Business Account (WABA).
4. **Create Message Template**: In Meta Business Manager under *WhatsApp Manager -> Message Templates*, submit the transactional template:
   - **Template Name**: `sofraflow_order_notification_v1`
   - **Category**: Utility / Transactional
   - **Languages**: English, French, Arabic
   - **Sample Structure**:
     > 🛎️ *New Order: {{1}}*\
     > Restaurant: {{2}}\
     > Type: {{3}}\
     > Items: {{4}}\
     > Total: {{5}}\
     > Customer Note: {{6}}
5. **Generate System User Token**: Under *Business Settings -> System Users*, create a permanent token with `whatsapp_business_messaging` and `whatsapp_business_management` permissions.
6. **Configure in SofraFlow**:
   - Go to `/app/whatsapp` in the dashboard.
   - Enter your **Phone Number ID**, **WABA ID**, and **System Token**.
   - Click **Send Test Ping** to confirm live Meta delivery.

*(Note: When credentials are not provided, SofraFlow automatically operates in its managed test sandbox dispatcher with full error inspection and retry capability).*

---

## 7. Database & PostgreSQL Deployment

A production-ready relational schema with Row Level Security (RLS) is provided in:
`supabase/migrations/20261020000000_init_sofraflow.sql`

To deploy with Supabase / PostgreSQL:
```bash
# If using Supabase CLI
npx supabase db push
```

Tables included:
- `restaurants`, `restaurant_members`, `restaurant_settings`
- `whatsapp_settings`, `notification_events`
- `menu_categories`, `menus`, `products`, `product_option_groups`, `product_option_choices`
- `orders`, `order_items`, `order_audit_logs`

---

## 8. License

Proprietary SaaS Architecture. Designed for SOFRAFLOW.
