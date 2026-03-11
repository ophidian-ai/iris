# OphidianAI Website Functionality -- Design Spec

**Date:** 2026-03-10
**Status:** Approved
**Goal:** Make the OphidianAI website customer-ready before cold email outreach begins. Customers should be able to browse services, understand pricing, request proposals, and once onboarded, manage their project through a client portal.

---

## Decisions

| Area | Decision |
|------|----------|
| Services | Hide AI services page, build new Web Design + SEO page (same layout) |
| Pricing | Reflect web design tiers + SEO services from `operations/references/pricing-structure.md` |
| Checkout | Hybrid -- all web design goes through proposal first; SEO Growth and maintenance are self-service Stripe subscriptions |
| Client portal | Modular dashboard -- modules unlock based on purchased services |
| Analytics | GA4 via Google Analytics Data API, cached daily in Supabase |
| SEO data | Self-managed via Search Console API, cached daily in Supabase |
| Architecture | Supabase-native (DB + Auth + Edge Functions + Storage) |
| Progress tracker | Gradient selector component adapted for project phases (Venom Green #39FF14 to teal #0DB1B2) |
| Timeline | Everything built before cold emails go out |

---

## Section 1: Services & Pricing Pages

### Services Page (`/services`)

- Hide current AI services page (move to `/services/ai`, no nav link, code preserved)
- New page uses the same layout/component structure with two service categories:
  - **Web Design** -- Starter, Professional, E-Commerce tiers with scope bullets from pricing guide
  - **SEO Services** -- SEO Audit (free), SEO Cleanup (one-time), SEO Growth (monthly retainer)
- Add-ons section at the bottom (extra pages, blog setup, booking integration, etc.)

### Pricing Page (`/pricing`)

Replace current AI subscription tiers with actual web design pricing:

| Tier | Price | Key Details |
|------|-------|-------------|
| Starter | $2,200 - $2,500 | Up to 5 pages, basic SEO, 2 revisions, 1-2 weeks |
| Professional | $3,500 - $4,000 | Up to 10 pages, full SEO, copywriting included, unlimited revisions, 2-3 weeks |
| E-Commerce | $4,500 - $6,000 | Everything in Professional + product catalog, cart, Stripe checkout |

SEO services section below the web design tiers.

Monthly maintenance pricing shown as a note under each tier ($100/mo or $150/mo).

CTAs: All web design tiers go to contact/consultation. SEO Growth and maintenance go to self-service checkout.

---

## Section 2: Checkout & Onboarding Flow

### Payment Structure

| Service | Payment Split | Method |
|---------|--------------|--------|
| Starter (1-2 pages) | 100% upfront | Stripe payment link after proposal approval |
| Starter (3-5 pages) | 50% upfront / 50% at handoff | Stripe payment link (2 invoices) |
| Professional | 50% upfront / 50% at handoff | Stripe payment link (2 invoices) |
| E-Commerce | 33% upfront / 33% mid-project / 33% at handoff | Stripe payment link (3 invoices) |
| SEO Cleanup | 100% upfront | Stripe payment link after proposal approval |
| SEO Growth | Monthly retainer | Stripe subscription |
| Maintenance | Monthly retainer | Stripe subscription |

### Flow -- Web Design (All Tiers)

Every web design project goes through a proposal first:

1. Customer clicks "Get Started" or "Get a Quote" on any tier
2. Lands on `/contact` with service pre-filled
3. Eric scopes the project, generates a proposal (proposal-generator skill)
4. Client receives proposal with scope, timeline, deliverables, payment schedule, and terms
5. Client approves proposal via a signed approval action in the portal (button click that records `approved_at` timestamp and sends confirmation email to both parties)
6. First Stripe payment link sent (amount based on split above)
7. Payment received -- account created in Supabase via Stripe webhook, magic link welcome email sent via Resend (client sets their own password on first login)
8. At handoff: final payment collected, any legal docs signed, site goes live

### Flow -- SEO Cleanup

SEO Cleanup follows the proposal flow (same as web design):

1. Customer clicks "Get a Quote" on SEO Cleanup
2. Lands on `/contact` with SEO Cleanup pre-filled
3. Eric scopes the work (Done-for-you vs Advisory), generates a proposal
4. Client approves proposal, Stripe payment link sent (100% upfront)
5. Payment received -- account created, project kicks off
6. Done-for-you clients: Search Console verified under OphidianAI service account, SEO Performance module enabled
7. Advisory clients: No Search Console access -- SEO Performance module not available (they receive a PDF action plan instead)

### Flow -- Self-Service (SEO Growth, Maintenance)

1. Customer clicks "Subscribe" on SEO Growth or Maintenance
2. Lands on `/checkout` with plan pre-selected
3. Collects: name, email, company name, business URL
4. Stripe subscription payment
5. Account auto-created in Supabase via Stripe `customer.subscription.created` webhook, magic link welcome email sent
6. Redirected to `/dashboard`

**Maintenance note:** Maintenance is only available to clients who have a completed web build with OphidianAI. It is not a standalone purchase. The self-service checkout for maintenance is offered to existing clients when their site goes live.

### Post-Purchase Onboarding

- Magic link welcome email via Resend (client clicks to set password and access dashboard)
- Web design clients: Dashboard shows onboarding checklist ("Share your brand assets," "Review your project brief," "Approve your design mockup")
- SEO Growth clients: Dashboard shows SEO onboarding ("Verify Search Console access," "Review target keywords")
- Project automatically created in Supabase with phase "Discovery" (web design) or status "Active" (SEO)

### Stripe Webhook Handling

Webhook endpoint: `/api/stripe-webhook`

| Event | Action |
| ------- | -------- |
| `payment_intent.succeeded` | Update `payments` row to `paid`, send receipt email via Resend. If first payment for a new client, create `profiles` + `clients` + `client_services` + `projects` records (idempotent -- check if records exist before creating). |
| `invoice.paid` | Update `payments` row for recurring subscription payment to `paid`. |
| `customer.subscription.created` | Create `client_services` record with status `active`. Send welcome email with magic link. |
| `customer.subscription.deleted` | Update `client_services.status` to `cancelled`. Update `client_services.completed_at`. |
| `payment_intent.payment_failed` | Log failure. Do NOT create account. Send Eric an admin alert email. |

All webhook handlers must be idempotent (safe to process the same event twice). Stripe webhook signature verification required on all incoming requests.

---

## Section 3: Client Portal Dashboard

### Module Architecture

The dashboard shell (sidebar, header, account settings) is shared. Modules render based on the client's `client_services` record.

| Module | Available To | What It Shows |
|--------|-------------|---------------|
| **Project Tracker** | Web Design, E-Commerce | Current phase, milestone timeline, next steps, deliverable approvals. Uses gradient selector component (Venom Green to teal) for phase visualization. |
| **Content Requests** | All maintenance clients | Form to submit text/image updates, request history with status |
| **Analytics** | All clients with a live site | GA4 data -- traffic, page views, top pages, referral sources, visitor trends |
| **SEO Performance** | SEO Cleanup, SEO Growth | Search Console data -- impressions, clicks, avg position, top queries, keyword rankings |
| **Reports** | All clients | Monthly PDF reports, downloadable and viewable in-portal |
| **Billing** | All clients | Payment history, upcoming invoices, current plan, payment schedule for active projects |
| **Proposals** | All clients | View and approve/decline proposals, signed documents |

### Dashboard States (Project Lifecycle)

- **Pre-build (proposal approved, first payment received):** Project Tracker shows "Discovery" phase, onboarding checklist visible
- **In-progress:** Project Tracker shows current phase with progress, Content Requests disabled (site not live yet)
- **Live site:** Analytics and SEO modules activate, Content Requests enabled, Maintenance billing visible
- **SEO-only client (no web build):** Only SEO Performance, Reports, Billing, Content Requests

### Sidebar Navigation

- Dashboard (overview/home)
- Projects (if they have active projects)
- Analytics (if they have a live site)
- SEO (if they have SEO services)
- Content Requests (if on maintenance)
- Reports
- Billing
- Account Settings

### Progress Tracker Component

Adapted from gradient-selector-card component:

- 5 nodes: Discovery, Design, Development, Review, Live
- Color progression: Venom Green (`#39FF14`) to teal (`#0DB1B2`)
- Read-only for clients (admin updates the phase)
- Labels show phase name + estimated date below each node
- Detail panel below shows current phase info: next steps, deliverables due
- Uses framer-motion (already installed as `motion` in the project)

---

## Section 4: Analytics & SEO Modules

### Analytics Module (GA4)

| Data Point | Source | Update Frequency |
|------------|--------|-----------------|
| Page views | GA4 Data API | Daily |
| Unique visitors | GA4 Data API | Daily |
| Top pages | GA4 Data API | Daily |
| Referral sources | GA4 Data API | Daily |
| Visitor trends (7d/30d/90d) | GA4 Data API | Daily |
| Bounce rate | GA4 Data API | Daily |
| Avg session duration | GA4 Data API | Daily |

**How it works:**
- Each client site gets a GA4 property (set up during the build -- added to web-builder skill checklist)
- Supabase Edge Function runs daily, pulls GA4 data for all active clients, writes to `client_analytics` table
- Dashboard reads from that table -- no live API calls on page load

**Auth:** Single Google service account with read access to all client GA4 properties and Search Console sites. Credentials stored as Supabase secrets.

### SEO Performance Module (Search Console)

| Data Point | Source | Update Frequency |
|------------|--------|-----------------|
| Search impressions | Search Console API | Daily |
| Search clicks | Search Console API | Daily |
| Average position | Search Console API | Daily |
| Top search queries | Search Console API | Daily |
| Click-through rate | Search Console API | Daily |
| Indexed pages | Search Console API | Weekly |
| Keyword rankings | Search Console API + custom tracking | Daily |

**How it works:**
- Site ownership verified in Search Console during build (already in SEO SOP)
- Same Edge Function pattern -- daily pull, cached in `client_seo_metrics` table
- SEO Growth clients get additional: monthly comparison, keyword movement alerts

---

## Section 5: Admin View

Same dashboard shell, admin-specific capabilities based on `profiles.role = 'admin'`.

### Admin Dashboard Home

- All clients at a glance -- name, active services, project phase, last activity
- Alerts: overdue milestones, pending content requests, unpaid invoices
- Quick actions: create client, send payment link, update project phase

### Client Management Actions

| Action | How |
|--------|-----|
| Create client | Form: name, email, company, URL, services purchased |
| Update project phase | Click the phase tracker, select new phase -- client sees it update |
| Upload reports | Drag-and-drop PDF to a client's reports section |
| Send payment link | Generate Stripe payment link tied to the client's payment schedule |
| Manage proposals | Create, edit, send, track approval status |
| Push analytics refresh | Manual trigger to re-pull GA4/Search Console data for a client |
| View content requests | See all pending requests, mark as completed |

### Admin-Only Modules

| Module | Purpose |
|--------|---------|
| **Client List** | Table of all clients with filters (active, completed, all) |
| **Revenue Overview** | Total revenue, outstanding invoices, MRR from retainers |
| **Service Setup** | Assign GA4 property ID, Search Console URL, Stripe customer ID to a client |
| **Proposal Manager** | Draft, send, track proposals across all clients |

---

## Section 6: Supabase Schema

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User accounts (existing) | id, email, full_name, avatar_url, role (`admin`/`client`), company, website_url |
| `clients` | Client records | id, profile_id (FK), company_name, contact_email, website_url, ga4_property_id, search_console_url, stripe_customer_id, created_at |
| `client_services` | What each client purchased | id, client_id (FK), service_type (`web_starter`/`web_professional`/`web_ecommerce`/`seo_cleanup`/`seo_growth`/`maintenance`), status (`active`/`completed`/`cancelled`), monthly_amount (nullable -- for retainer services, used to compute MRR), stripe_subscription_id (nullable), started_at, completed_at |
| `projects` | Web design project tracking | id, client_id (FK), client_service_id (FK), status (`active`/`on_hold`/`cancelled`/`completed`), phase (`discovery`/`design`/`development`/`review`/`live`), phase_updated_at, estimated_completion, notes |
| `project_milestones` | Phase detail within a project | id, project_id (FK), phase, title, description, due_date, completed_at |
| `proposals` | Proposals sent to clients | id, client_id (FK), project_id (FK, nullable -- required for web design, null for SEO-only), content (JSON), payment_schedule (JSON), status (`draft`/`sent`/`approved`/`declined`), sent_at, approved_at, approved_by_ip (audit trail) |
| `payments` | Payment schedule tracking | id, client_id (FK), client_service_id (FK), project_id (FK, nullable), stripe_payment_intent_id, amount, milestone_label (`deposit`/`midpoint`/`final`/`monthly`), status (`pending`/`paid`/`overdue`), due_date, paid_at |
| `content_requests` | Client content update requests | id, client_id (FK), subject, description, attachments (array of storage URLs), status (`pending`/`in_progress`/`completed`), created_at, completed_at |
| `client_analytics` | Cached GA4 data | id, client_id (FK), date, page_views, unique_visitors, bounce_rate, avg_session_duration, top_pages (JSON), referral_sources (JSON). **Unique constraint on (client_id, date).** Edge function uses upsert semantics. |
| `client_seo_metrics` | Cached Search Console data | id, client_id (FK), date, impressions, clicks, avg_position, ctr, top_queries (JSON), indexed_pages (updated weekly, carries forward last known value on daily runs). **Unique constraint on (client_id, date).** Edge function uses upsert semantics. |
| `reports` | Monthly reports | id, client_id (FK), title, file_url (Supabase Storage), period_start, period_end, created_at |

### Row Level Security (RLS)

- `clients` table: client can read where `profile_id = auth.uid()`
- All downstream tables (`projects`, `payments`, `content_requests`, `client_analytics`, `client_seo_metrics`, `reports`, `proposals`, `project_milestones`, `client_services`): client can read where `client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())`
- Admin (`profiles.role = 'admin'`): full read/write on all tables
- No client can see another client's records

### Data Privacy

- GA4 and Search Console access requires adding OphidianAI's service account as a viewer on each client's properties. This must be disclosed during onboarding and included as a clause in the proposal/contract terms.

### Edge Functions (Scheduled)

| Function | Schedule | Purpose |
|----------|----------|---------|
| `sync-ga4-data` | Daily at 6am ET | Pull GA4 metrics for all active clients, write to `client_analytics` |
| `sync-search-console` | Daily at 6am ET | Pull Search Console data for all active clients, write to `client_seo_metrics` |
| `check-overdue-payments` | Daily at 9am ET | Flag payments past due_date, optionally send reminder email via Resend |

### Data Flow

```
Client signs up
  -> profiles + clients + client_services created
  -> project created (if web design)
  -> proposal created and sent

Eric updates project phase
  -> projects.phase updated
  -> client sees progress tracker move

Daily Edge Functions
  -> GA4 API -> client_analytics
  -> Search Console API -> client_seo_metrics
  -> Client sees fresh data on dashboard

Client submits content request
  -> content_requests row created
  -> Admin sees it, marks completed when done

Stripe webhook fires
  -> payments row updated to "paid"
  -> Client sees updated billing history
```

---

## Deliverables Beyond the Website

- **Update web-builder skill** (`/.claude/skills/web-builder/SKILL.md`) -- Add required steps for portal integration: GA4 property setup, Search Console verification, client record creation, service assignment, Stripe customer creation
- **Update proposal-generator skill** -- Ensure proposals include payment schedule based on tier/page count rules

---

## What Gets Preserved

- Current AI services page code (moved to `/services/ai`, hidden from nav)
- Current dashboard analytics components (refactored into the admin view)
- Current auth system (extended with role-based module rendering)
- Current Stripe integration (extended with payment schedule support)
