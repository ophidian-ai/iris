# OphidianAI Website Functionality Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the OphidianAI website from an AI-services showcase into a customer-ready web design and SEO agency platform with self-service checkout, client portal, and admin management.

**Architecture:** Supabase-native approach -- all data, auth, and scheduled functions run through the existing Supabase instance. Next.js 16 App Router with server components for data fetching, client components for interactivity. Stripe for payments (payment links for projects, subscriptions for retainers). GA4 and Search Console APIs cached daily via Supabase Edge Functions.

**Tech Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Supabase (Auth/DB/Edge Functions/Storage) + Stripe + Resend + GA4 Data API + Search Console API + Recharts + Motion (framer-motion)

**Spec:** `docs/superpowers/specs/2026-03-10-ophidianai-website-functionality-design.md`

**Codebase Root:** `engineering/projects/ophidian-ai/`

All file paths below are relative to the codebase root unless prefixed with `/`.

---

## File Map

### New Files

**Pages:**
- `src/app/services/ai/page.tsx` -- Preserved AI services page (hidden, route: /services/ai)
- `src/app/services/ai/layout.tsx` -- Layout for hidden AI services
- `src/app/dashboard/projects/page.tsx` -- Client project tracker
- `src/app/dashboard/analytics/page.tsx` -- Client GA4 analytics
- `src/app/dashboard/seo/page.tsx` -- Client SEO performance
- `src/app/dashboard/content-requests/page.tsx` -- Content request form + history
- `src/app/dashboard/content-requests/new/page.tsx` -- New content request form
- `src/app/dashboard/reports/page.tsx` -- Client reports viewer
- `src/app/dashboard/billing/page.tsx` -- Client billing/payment history
- `src/app/dashboard/proposals/page.tsx` -- Client proposal viewer
- `src/app/dashboard/admin/page.tsx` -- Admin dashboard home
- `src/app/dashboard/admin/clients/page.tsx` -- Admin client list
- `src/app/dashboard/admin/clients/[id]/page.tsx` -- Admin client detail
- `src/app/dashboard/admin/clients/new/page.tsx` -- Admin create client
- `src/app/dashboard/admin/proposals/page.tsx` -- Admin proposal manager
- `src/app/dashboard/admin/revenue/page.tsx` -- Admin revenue overview

**Components:**
- `src/components/ui/project-phase-tracker.tsx` -- Gradient phase tracker (adapted from gradient-selector-card)
- `src/components/dashboard/sidebar.tsx` -- Dashboard sidebar navigation (extracted from page.tsx)
- `src/components/dashboard/stat-card.tsx` -- Reusable stat card
- `src/components/dashboard/module-guard.tsx` -- Module visibility based on services

**API Routes:**
- `src/app/api/content-requests/route.ts` -- CRUD for content requests
- `src/app/api/proposals/[id]/approve/route.ts` -- Proposal approval endpoint
- `src/app/api/admin/clients/route.ts` -- Admin client CRUD
- `src/app/api/admin/projects/[id]/phase/route.ts` -- Admin update project phase
- `src/app/api/admin/analytics-refresh/route.ts` -- Manual analytics pull trigger

**Lib:**
- `src/lib/stripe-plans.ts` -- New plan definitions (web design tiers + retainers)
- `src/lib/modules.ts` -- Module access logic (which services unlock which modules)
- `src/lib/supabase/types.ts` -- TypeScript types for all Supabase tables

**Supabase Migrations:**
- `supabase/migrations/001_client_portal_schema.sql` -- All new tables + RLS

**Supabase Edge Functions:**
- `supabase/functions/sync-ga4-data/index.ts`
- `supabase/functions/sync-search-console/index.ts`
- `supabase/functions/check-overdue-payments/index.ts`

### Modified Files

- `src/app/services/page.tsx` -- Replace AI content with Web Design + SEO
- `src/app/services/layout.tsx` -- Update metadata
- `src/app/pricing/page.tsx` -- Replace AI plans with web design tiers
- `src/app/pricing/layout.tsx` -- Update metadata
- `src/components/ui/pricing-section.tsx` -- Adapt for range pricing + contact CTAs
- `src/lib/stripe.ts` -- Replace plan definitions (or deprecate in favor of stripe-plans.ts)
- `src/app/api/stripe-webhook/route.ts` -- Implement full webhook handling
- `src/app/api/create-payment-intent/route.ts` -- Adapt for new plan structure
- `src/app/dashboard/layout.tsx` -- Role-based routing (admin vs client)
- `src/app/dashboard/page.tsx` -- Refactor into role-based home (admin overview vs client overview)
- `src/app/dashboard/account/page.tsx` -- Use new sidebar component
- `src/app/contact/page.tsx` -- Add service pre-fill from query params
- `src/components/layout/NavMain.tsx` -- Update nav links (remove AI references)
- `src/app/checkout/page.tsx` -- Adapt for retainer subscriptions (SEO Growth, Maintenance)

---

## Chunk 1: Supabase Schema & Types

**Goal:** Set up all database tables, RLS policies, and TypeScript types. This is the foundation everything else builds on.

### Task 1.1: Create Supabase Migration

**Files:**
- Create: `supabase/migrations/001_client_portal_schema.sql`

- [ ] **Step 1: Create the migration file with all tables**

```sql
-- 001_client_portal_schema.sql
-- OphidianAI Client Portal Schema

-- ============================================================
-- MODIFY EXISTING: profiles table (add missing columns)
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url text;

-- ============================================================
-- NEW TABLE: clients
-- ============================================================
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_email text NOT NULL,
  website_url text,
  ga4_property_id text,
  search_console_url text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_clients_profile_id ON clients(profile_id);
CREATE INDEX idx_clients_stripe_customer_id ON clients(stripe_customer_id);

-- ============================================================
-- NEW TABLE: client_services
-- ============================================================
CREATE TYPE service_type AS ENUM (
  'web_starter', 'web_professional', 'web_ecommerce',
  'seo_cleanup', 'seo_growth', 'maintenance'
);

CREATE TYPE service_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE client_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  status service_status NOT NULL DEFAULT 'active',
  monthly_amount integer, -- cents, nullable (only for retainer services)
  stripe_subscription_id text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_client_services_client_id ON client_services(client_id);

-- ============================================================
-- NEW TABLE: projects
-- ============================================================
CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'cancelled', 'completed');
CREATE TYPE project_phase AS ENUM ('discovery', 'design', 'development', 'review', 'live');

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_service_id uuid NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
  status project_status NOT NULL DEFAULT 'active',
  phase project_phase NOT NULL DEFAULT 'discovery',
  phase_updated_at timestamptz DEFAULT now(),
  estimated_completion date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_projects_client_id ON projects(client_id);

-- ============================================================
-- NEW TABLE: project_milestones
-- ============================================================
CREATE TABLE project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase project_phase NOT NULL,
  title text NOT NULL,
  description text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);

-- ============================================================
-- NEW TABLE: proposals
-- ============================================================
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'approved', 'declined');

CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  content jsonb NOT NULL DEFAULT '{}',
  payment_schedule jsonb NOT NULL DEFAULT '[]',
  status proposal_status NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  approved_at timestamptz,
  approved_by_ip text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_proposals_client_id ON proposals(client_id);

-- ============================================================
-- NEW TABLE: payments
-- ============================================================
CREATE TYPE payment_milestone AS ENUM ('deposit', 'midpoint', 'final', 'monthly');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue');

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_service_id uuid NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  stripe_payment_intent_id text,
  amount integer NOT NULL, -- cents
  milestone_label payment_milestone NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- NEW TABLE: content_requests
-- ============================================================
CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE content_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  attachments text[] DEFAULT '{}',
  status request_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_content_requests_client_id ON content_requests(client_id);

-- ============================================================
-- NEW TABLE: client_analytics (GA4 cached data)
-- ============================================================
CREATE TABLE client_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  bounce_rate numeric(5,2),
  avg_session_duration numeric(10,2),
  top_pages jsonb DEFAULT '[]',
  referral_sources jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, date)
);

CREATE INDEX idx_client_analytics_client_date ON client_analytics(client_id, date);

-- ============================================================
-- NEW TABLE: client_seo_metrics (Search Console cached data)
-- ============================================================
CREATE TABLE client_seo_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  avg_position numeric(6,2),
  ctr numeric(5,4),
  top_queries jsonb DEFAULT '[]',
  indexed_pages integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, date)
);

CREATE INDEX idx_client_seo_metrics_client_date ON client_seo_metrics(client_id, date);

-- ============================================================
-- NEW TABLE: reports
-- ============================================================
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reports_client_id ON reports(client_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_seo_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get client IDs for current user
CREATE OR REPLACE FUNCTION my_client_ids()
RETURNS SETOF uuid AS $$
  SELECT id FROM clients WHERE profile_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- CLIENTS: read own, admin full access
CREATE POLICY "clients_select_own" ON clients FOR SELECT USING (profile_id = auth.uid() OR is_admin());
CREATE POLICY "clients_insert_admin" ON clients FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "clients_update_admin" ON clients FOR UPDATE USING (is_admin());
CREATE POLICY "clients_delete_admin" ON clients FOR DELETE USING (is_admin());

-- DOWNSTREAM TABLES: client reads own (via client_id), admin full access
-- Pattern: SELECT where client_id in my_client_ids() OR is_admin()
-- INSERT/UPDATE/DELETE admin only

-- client_services
CREATE POLICY "client_services_select" ON client_services FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "client_services_insert" ON client_services FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "client_services_update" ON client_services FOR UPDATE USING (is_admin());
CREATE POLICY "client_services_delete" ON client_services FOR DELETE USING (is_admin());

-- projects
CREATE POLICY "projects_select" ON projects FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (is_admin());
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (is_admin());

-- project_milestones
CREATE POLICY "milestones_select" ON project_milestones FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT my_client_ids())) OR is_admin()
);
CREATE POLICY "milestones_insert" ON project_milestones FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "milestones_update" ON project_milestones FOR UPDATE USING (is_admin());
CREATE POLICY "milestones_delete" ON project_milestones FOR DELETE USING (is_admin());

-- proposals (clients can update status to approve/decline)
CREATE POLICY "proposals_select" ON proposals FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "proposals_insert" ON proposals FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "proposals_update_admin" ON proposals FOR UPDATE USING (is_admin());
CREATE POLICY "proposals_update_client" ON proposals FOR UPDATE USING (
  client_id IN (SELECT my_client_ids()) AND status = 'sent'
) WITH CHECK (status IN ('approved', 'declined'));
CREATE POLICY "proposals_delete" ON proposals FOR DELETE USING (is_admin());

-- payments
CREATE POLICY "payments_select" ON payments FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (is_admin());
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (is_admin());

-- content_requests (clients can insert and read own)
CREATE POLICY "content_requests_select" ON content_requests FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "content_requests_insert" ON content_requests FOR INSERT WITH CHECK (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "content_requests_update" ON content_requests FOR UPDATE USING (is_admin());
CREATE POLICY "content_requests_delete" ON content_requests FOR DELETE USING (is_admin());

-- client_analytics
CREATE POLICY "analytics_select" ON client_analytics FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "analytics_insert" ON client_analytics FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "analytics_update" ON client_analytics FOR UPDATE USING (is_admin());

-- client_seo_metrics
CREATE POLICY "seo_metrics_select" ON client_seo_metrics FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "seo_metrics_insert" ON client_seo_metrics FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "seo_metrics_update" ON client_seo_metrics FOR UPDATE USING (is_admin());

-- reports
CREATE POLICY "reports_select" ON reports FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "reports_delete" ON reports FOR DELETE USING (is_admin());

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2: Apply the migration**

Run from the project root:
```bash
npx supabase db push
```

If not using Supabase CLI locally, apply via the Supabase dashboard SQL editor by pasting the migration contents.

Expected: All tables created, RLS enabled, policies applied.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_client_portal_schema.sql
git commit -m "feat: add client portal database schema with RLS policies"
```

### Task 1.2: Create TypeScript Types

**Files:**
- Create: `src/lib/supabase/types.ts`

- [ ] **Step 1: Create the types file**

```typescript
// src/lib/supabase/types.ts
// TypeScript types matching the Supabase schema

export type UserRole = "admin" | "client";

export type ServiceType =
  | "web_starter"
  | "web_professional"
  | "web_ecommerce"
  | "seo_cleanup"
  | "seo_growth"
  | "maintenance";

export type ServiceStatus = "active" | "completed" | "cancelled";
export type ProjectStatus = "active" | "on_hold" | "cancelled" | "completed";
export type ProjectPhase = "discovery" | "design" | "development" | "review" | "live";
export type ProposalStatus = "draft" | "sent" | "approved" | "declined";
export type PaymentMilestone = "deposit" | "midpoint" | "final" | "monthly";
export type PaymentStatus = "pending" | "paid" | "overdue";
export type RequestStatus = "pending" | "in_progress" | "completed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  company: string | null;
  website_url: string | null;
}

export interface Client {
  id: string;
  profile_id: string;
  company_name: string;
  contact_email: string;
  website_url: string | null;
  ga4_property_id: string | null;
  search_console_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientService {
  id: string;
  client_id: string;
  service_type: ServiceType;
  status: ServiceStatus;
  monthly_amount: number | null;
  stripe_subscription_id: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  client_service_id: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  phase_updated_at: string;
  estimated_completion: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  phase: ProjectPhase;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  client_id: string;
  project_id: string | null;
  content: Record<string, unknown>;
  payment_schedule: Array<{
    milestone: PaymentMilestone;
    amount: number;
    percentage: number;
  }>;
  status: ProposalStatus;
  sent_at: string | null;
  approved_at: string | null;
  approved_by_ip: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  client_id: string;
  client_service_id: string;
  project_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  milestone_label: PaymentMilestone;
  status: PaymentStatus;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface ContentRequest {
  id: string;
  client_id: string;
  subject: string;
  description: string;
  attachments: string[];
  status: RequestStatus;
  created_at: string;
  completed_at: string | null;
}

export interface ClientAnalytics {
  id: string;
  client_id: string;
  date: string;
  page_views: number;
  unique_visitors: number;
  bounce_rate: number | null;
  avg_session_duration: number | null;
  top_pages: Array<{ path: string; views: number }>;
  referral_sources: Array<{ source: string; visits: number }>;
}

export interface ClientSeoMetrics {
  id: string;
  client_id: string;
  date: string;
  impressions: number;
  clicks: number;
  avg_position: number | null;
  ctr: number | null;
  top_queries: Array<{ query: string; impressions: number; clicks: number; position: number }>;
  indexed_pages: number | null;
}

export interface Report {
  id: string;
  client_id: string;
  title: string;
  file_url: string;
  period_start: string;
  period_end: string;
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase/types.ts
git commit -m "feat: add TypeScript types for client portal schema"
```

### Task 1.3: Create Module Access Logic

**Files:**
- Create: `src/lib/modules.ts`

- [ ] **Step 1: Create the module access file**

```typescript
// src/lib/modules.ts
// Determines which dashboard modules a client can access based on their services

import type { ClientService, ServiceType, ProjectPhase } from "@/lib/supabase/types";

export type DashboardModule =
  | "project_tracker"
  | "content_requests"
  | "analytics"
  | "seo_performance"
  | "reports"
  | "billing"
  | "proposals";

const SERVICE_MODULE_MAP: Record<ServiceType, DashboardModule[]> = {
  web_starter: ["project_tracker", "proposals", "billing", "reports"],
  web_professional: ["project_tracker", "proposals", "billing", "reports"],
  web_ecommerce: ["project_tracker", "proposals", "billing", "reports"],
  seo_cleanup: ["seo_performance", "proposals", "billing", "reports"],
  seo_growth: ["seo_performance", "content_requests", "billing", "reports"],
  maintenance: ["content_requests", "analytics", "billing", "reports"],
};

// Modules that activate only when a project reaches "live" phase
const LIVE_SITE_MODULES: DashboardModule[] = ["analytics", "seo_performance", "content_requests"];

export function getClientModules(
  services: ClientService[],
  projectPhase?: ProjectPhase | null
): Set<DashboardModule> {
  const modules = new Set<DashboardModule>();

  for (const service of services) {
    if (service.status === "cancelled") continue;
    const serviceModules = SERVICE_MODULE_MAP[service.service_type] ?? [];
    for (const mod of serviceModules) {
      modules.add(mod);
    }
  }

  // Web design clients get analytics and content_requests only after site is live
  const hasWebService = services.some(
    (s) =>
      s.status !== "cancelled" &&
      ["web_starter", "web_professional", "web_ecommerce"].includes(s.service_type)
  );

  if (hasWebService && projectPhase === "live") {
    modules.add("analytics");
    modules.add("content_requests");
  }

  // SEO performance for cleanup clients only if they have a done-for-you engagement
  // (Advisory clients don't get Search Console access -- handled at service creation time
  // by not adding seo_cleanup to their services if advisory-only)

  return modules;
}

export function hasModule(
  modules: Set<DashboardModule>,
  module: DashboardModule
): boolean {
  return modules.has(module);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/modules.ts
git commit -m "feat: add module access logic for client dashboard"
```

---

## Chunk 2: Services & Pricing Pages

**Goal:** Replace AI-focused services and pricing with web design + SEO content. Preserve AI page code.

### Task 2.1: Preserve AI Services Page

**Files:**
- Create: `src/app/services/ai/page.tsx` (copy of current services/page.tsx)
- Create: `src/app/services/ai/layout.tsx` (copy of current services/layout.tsx)

- [ ] **Step 1: Copy current services page to services-ai**

Copy `src/app/services/page.tsx` to `src/app/services/ai/page.tsx` (no changes needed -- this is the archive).

Copy `src/app/services/layout.tsx` to `src/app/services/ai/layout.tsx`. Update the metadata title to "AI Services (Coming Soon)".

- [ ] **Step 2: Commit**

```bash
git add src/app/services/ai/
git commit -m "feat: archive AI services page at /services-ai"
```

### Task 2.2: Rebuild Services Page for Web Design + SEO

**Files:**
- Modify: `src/app/services/page.tsx`
- Modify: `src/app/services/layout.tsx`

- [ ] **Step 1: Update services layout metadata**

In `src/app/services/layout.tsx`, update:
- `title`: "Web Design & SEO Services"
- `description`: "Professional web design and SEO services for small businesses. Custom websites starting at $2,200. Free SEO audits available."

- [ ] **Step 2: Rewrite services page content**

Replace the content in `src/app/services/page.tsx`. Keep the same component structure (PageWrapper, Container, HeroSimple, GlowCard grid, CTABanner) but change the content:

**Hero:** "Web Design & SEO Services" / "Custom websites and search optimization for small businesses"

**Service Cards (same alternating layout as current):**

Card 1 -- Web Design:
- Icon: `Monitor` from lucide-react
- Title: "Custom Web Design"
- Description: "Modern, mobile-first websites built to convert visitors into customers. Every site is custom-designed -- no templates, no drag-and-drop builders."
- Bullets: "Up to 10 pages", "Mobile-first responsive design", "On-page SEO included", "Deployed on fast, secure hosting"

Card 2 -- E-Commerce:
- Icon: `ShoppingCart` from lucide-react
- Title: "E-Commerce Solutions"
- Description: "Full online stores with product catalogs, shopping carts, and secure checkout. Everything you need to sell products online."
- Bullets: "Product catalog with categories", "Secure Stripe checkout", "Order notifications", "Inventory management"

Card 3 -- SEO Services:
- Icon: `Search` from lucide-react
- Title: "Search Engine Optimization"
- Description: "Get found on Google. From one-time cleanups to ongoing growth retainers, we make sure your business shows up when customers search."
- Bullets: "Free SEO audit", "Google Business Profile optimization", "Keyword research and tracking", "Monthly performance reports"

**Capabilities Grid (FeaturesGrid):**
- "AI-Assisted Copywriting" -- We write all your website content
- "Performance Optimized" -- Fast load times and Core Web Vitals
- "Analytics Dashboard" -- Track your traffic and SEO performance
- "Ongoing Support" -- Monthly maintenance plans available

**CTA:** "See Our Pricing" -> /pricing

**Schema.org:** Update Service items to match new services.

- [ ] **Step 3: Verify build**

```bash
cd engineering/projects/ophidian-ai && npm run build
```

Expected: Clean build, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/services/
git commit -m "feat: replace AI services with web design and SEO offerings"
```

### Task 2.3: Rebuild Pricing Page

**Files:**
- Modify: `src/app/pricing/page.tsx`
- Modify: `src/app/pricing/layout.tsx`
- Modify: `src/components/ui/pricing-section.tsx`

- [ ] **Step 1: Update pricing layout metadata**

In `src/app/pricing/layout.tsx`, update:
- `title`: "Pricing"
- `description`: "Transparent pricing for web design and SEO services. Starter sites from $2,200, professional sites from $3,500, e-commerce from $4,500."

- [ ] **Step 2: Update the PricingSection component**

The current `pricing-section.tsx` renders monthly/yearly toggle cards with "Subscribe" CTAs. Adapt it:

- Remove the monthly/yearly toggle (web design is one-time pricing)
- Change card layout to show price ranges instead of exact monthly prices
- Change CTAs:
  - Starter: "Get Started" -> links to `/contact?service=web_starter`
  - Professional: "Get Started" -> links to `/contact?service=web_professional`
  - E-Commerce: "Get a Quote" -> links to `/contact?service=web_ecommerce`

Plan data to render:

```typescript
const webDesignPlans = [
  {
    id: "starter",
    name: "Starter",
    priceRange: "$2,200 - $2,500",
    description: "Clean, modern web presence for small businesses",
    features: [
      "Up to 5 pages",
      "Custom, mobile-first design",
      "Basic on-page SEO",
      "2 rounds of revisions",
      "1-2 week delivery",
      "Hosted on Vercel with SSL",
    ],
    cta: "Get Started",
    href: "/contact?service=web_starter",
    highlight: false,
  },
  {
    id: "professional",
    name: "Professional",
    priceRange: "$3,500 - $4,000",
    description: "Growth-ready site with full SEO and copywriting",
    features: [
      "Up to 10 pages",
      "Advanced animations and interactions",
      "Full SEO setup (keyword research, schema, GSC)",
      "Google Business Profile optimization",
      "AI-assisted copywriting included",
      "Unlimited revisions",
      "2-3 week delivery",
    ],
    cta: "Get Started",
    href: "/contact?service=web_professional",
    highlight: true, // most popular
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    priceRange: "$4,500 - $6,000",
    description: "Full online store with everything in Professional",
    features: [
      "Everything in Professional",
      "Product catalog with categories",
      "Shopping cart and checkout",
      "Stripe payment processing",
      "Order notifications",
      "Product management dashboard",
    ],
    cta: "Get a Quote",
    href: "/contact?service=web_ecommerce",
    highlight: false,
  },
];
```

- [ ] **Step 3: Add SEO services section and maintenance note to pricing page**

Below the web design cards, add a section for SEO services:

**SEO Services heading**

Three cards in a row (same GlowCard style):

1. **SEO Audit** -- Free
   - "Comprehensive site scan"
   - "On-page issue identification"
   - "Keyword gap analysis"
   - "Branded PDF report"
   - CTA: "Request Free Audit" -> `/contact?service=seo_audit`

2. **SEO Cleanup** -- $400 - $1,200
   - "One-time optimization"
   - "Meta tags, headings, alt text"
   - "Schema markup implementation"
   - "Google Search Console setup"
   - "Google Business Profile optimization"
   - CTA: "Get a Quote" -> `/contact?service=seo_cleanup`

3. **SEO Growth** -- $200 - $350/mo
   - "Ongoing optimization"
   - "Keyword tracking"
   - "1-2 blog posts/updates per month"
   - "GBP management"
   - "Monthly performance report"
   - "3-month minimum"
   - CTA: "Subscribe" -> `/checkout?plan=seo_growth`

**Maintenance note** below all cards:
"All websites include optional monthly maintenance ($100/mo for Starter/Professional, $150/mo for E-Commerce). Includes hosting, SSL, security checks, minor content updates, and uptime monitoring."

**Add-ons section** (simple list or table):
- Additional pages: $200-$400/page
- Blog setup: $300-$500
- Booking integration: $300-$500
- Logo design: $300-$500

- [ ] **Step 4: Update FAQ section**

Replace current AI-focused FAQ questions with:

1. "How long does it take to build a website?" -> "Starter sites take 1-2 weeks, Professional sites 2-3 weeks. E-commerce timelines depend on product count and complexity."
2. "What's included in the price?" -> "Everything: design, development, content writing (Professional+), SEO setup, hosting configuration, and deployment. No hidden fees."
3. "Do I need to provide content?" -> "For Starter sites, yes -- you provide text and images. Professional and E-Commerce tiers include AI-assisted copywriting, so we write everything for you."
4. "What about hosting?" -> "We deploy all sites on Vercel, which provides fast, secure, auto-scaling hosting. Hosting is included in the monthly maintenance plan."
5. "Can I make changes after the site is live?" -> "Yes. Monthly maintenance plans include minor content updates. Larger changes like new pages are quoted separately."
6. "What if I just need SEO, not a new website?" -> "We offer standalone SEO services. Start with a free SEO audit, then choose a one-time cleanup or ongoing growth retainer."

- [ ] **Step 5: Verify build**

```bash
cd engineering/projects/ophidian-ai && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/app/pricing/ src/components/ui/pricing-section.tsx
git commit -m "feat: replace AI pricing with web design and SEO tiers"
```

### Task 2.4: Update Stripe Plans

**Files:**
- Create: `src/lib/stripe-plans.ts`
- Modify: `src/lib/stripe.ts`

- [ ] **Step 1: Create new stripe plans file**

```typescript
// src/lib/stripe-plans.ts
// Plan definitions for self-service checkout (retainer services only)
// Web design projects use Stripe Payment Links (generated manually per client)

export interface RetainerPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number; // cents
  features: string[];
}

export const RETAINER_PLANS: Record<string, RetainerPlan> = {
  seo_growth_standard: {
    id: "seo_growth_standard",
    name: "SEO Growth - Standard",
    description: "Ongoing SEO optimization with monthly reporting",
    priceMonthly: 25000, // $250
    features: [
      "Keyword tracking",
      "1 blog post/page update per month",
      "Google Business Profile management",
      "Monthly performance report",
    ],
  },
  seo_growth_premium: {
    id: "seo_growth_premium",
    name: "SEO Growth - Premium",
    description: "Comprehensive SEO with strategy calls",
    priceMonthly: 35000, // $350
    features: [
      "Everything in Standard",
      "2 posts/updates per month",
      "Quarterly strategy call",
      "Internal linking maintenance",
    ],
  },
  maintenance_standard: {
    id: "maintenance_standard",
    name: "Website Maintenance",
    description: "Hosting, security, and minor content updates",
    priceMonthly: 10000, // $100
    features: [
      "Vercel hosting",
      "SSL certificate",
      "Monthly security checks",
      "Minor content updates",
      "Uptime monitoring",
    ],
  },
  maintenance_ecommerce: {
    id: "maintenance_ecommerce",
    name: "E-Commerce Maintenance",
    description: "Enhanced maintenance for online stores",
    priceMonthly: 15000, // $150
    features: [
      "Everything in Standard Maintenance",
      "Product catalog updates",
      "Payment system monitoring",
    ],
  },
};

export type RetainerPlanId = keyof typeof RETAINER_PLANS;
```

- [ ] **Step 2: Deprecate old plans in stripe.ts**

Add a comment at the top of `src/lib/stripe.ts`:

```typescript
// DEPRECATED: These AI subscription plans are no longer active.
// See src/lib/stripe-plans.ts for current retainer plans.
// Keeping this file for reference until AI services launch.
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/stripe-plans.ts src/lib/stripe.ts
git commit -m "feat: add retainer plan definitions, deprecate AI subscription plans"
```

### Task 2.5: Update Contact Form with Service Pre-fill

**Files:**
- Modify: `src/app/contact/page.tsx`

- [ ] **Step 1: Add service query param handling**

Update the contact page to read a `service` query parameter from the URL and pre-select it in the form. Add a service dropdown/select field to the form if one doesn't exist.

The `service` param values: `web_starter`, `web_professional`, `web_ecommerce`, `seo_audit`, `seo_cleanup`.

Display-friendly labels:
```typescript
const SERVICE_LABELS: Record<string, string> = {
  web_starter: "Web Design - Starter",
  web_professional: "Web Design - Professional",
  web_ecommerce: "Web Design - E-Commerce",
  seo_audit: "Free SEO Audit",
  seo_cleanup: "SEO Cleanup",
};
```

Read the param using `useSearchParams()` and set the initial form value.

**Note:** `useSearchParams()` in Next.js 15 App Router requires the calling component to be wrapped in `<Suspense>`. Extract the search params logic into a sub-component (e.g., `ContactFormContent`) and wrap it with `<Suspense>` in the page. Follow the same pattern used in the existing `checkout/page.tsx` with `CheckoutContent`.

- [ ] **Step 2: Verify build**

```bash
cd engineering/projects/ophidian-ai && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/contact/
git commit -m "feat: add service pre-fill to contact form from URL params"
```

### Task 2.6: Update Navigation

**Files:**
- Modify: `src/components/layout/NavMain.tsx`

- [ ] **Step 1: Remove AI-specific references from nav**

Ensure the main navigation links are: Home, Services, Pricing, About, Blog, Contact. Remove any references to AI integrations or dashboard links from the public nav. The dashboard is accessed via sign-in only.

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/NavMain.tsx
git commit -m "feat: update navigation for web design and SEO focus"
```

---

## Chunk 3: Stripe Webhook & Checkout

**Goal:** Implement full Stripe webhook handling for account creation and payment tracking. Adapt checkout for retainer subscriptions.

### Task 3.1: Implement Stripe Webhook Handler

**Files:**
- Modify: `src/app/api/stripe-webhook/route.ts`

- [ ] **Step 1: Implement the full webhook handler**

Replace the TODO handlers in `src/app/api/stripe-webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role client for webhook operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const now = new Date().toISOString();

      // Update payment record if it exists (for existing clients with payment schedules)
      const { data: payment } = await supabase
        .from("payments")
        .update({ status: "paid", paid_at: now })
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .select()
        .maybeSingle();

      // If this is a first payment for a new client (proposal-flow),
      // create their account. Check metadata for new_client flag.
      if (!payment && paymentIntent.metadata?.new_client === "true") {
        const email = paymentIntent.metadata.client_email;
        const companyName = paymentIntent.metadata.company_name;
        const serviceType = paymentIntent.metadata.service_type;

        if (email && companyName && serviceType) {
          // Idempotency: check if client already exists
          const { data: existing } = await supabase
            .from("clients")
            .select("id")
            .eq("contact_email", email)
            .maybeSingle();

          if (!existing) {
            // Create auth user via Supabase Admin API (sends magic link)
            const { data: authUser } = await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: { full_name: companyName },
            });

            if (authUser?.user) {
              // Create client record
              const { data: newClient } = await supabase
                .from("clients")
                .insert({
                  profile_id: authUser.user.id,
                  company_name: companyName,
                  contact_email: email,
                  stripe_customer_id: paymentIntent.customer as string | null,
                })
                .select()
                .single();

              if (newClient) {
                // Create service record
                const { data: newService } = await supabase
                  .from("client_services")
                  .insert({
                    client_id: newClient.id,
                    service_type: serviceType,
                    status: "active",
                  })
                  .select()
                  .single();

                // Create project if web design
                if (serviceType.startsWith("web_") && newService) {
                  await supabase.from("projects").insert({
                    client_id: newClient.id,
                    client_service_id: newService.id,
                    status: "active",
                    phase: "discovery",
                  });
                }

                // Create payment record
                await supabase.from("payments").insert({
                  client_id: newClient.id,
                  client_service_id: newService!.id,
                  stripe_payment_intent_id: paymentIntent.id,
                  amount: paymentIntent.amount,
                  milestone_label: "deposit",
                  status: "paid",
                  paid_at: now,
                });
              }

              // Send magic link welcome email
              await supabase.auth.admin.generateLink({
                type: "magiclink",
                email,
                options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
              });
            }
          }
        }
      }

      // Send receipt email
      const recipientEmail = paymentIntent.receipt_email || paymentIntent.metadata?.client_email;
      if (recipientEmail) {
        await resend.emails.send({
          from: "OphidianAI <billing@ophidianai.com>",
          to: recipientEmail,
          subject: "Payment Received - OphidianAI",
          html: `<p>Thank you for your payment of $${(paymentIntent.amount / 100).toFixed(2)}.</p>`,
        });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        // Find the client_service by subscription ID and log the payment
        const { data: service } = await supabase
          .from("client_services")
          .select("id, client_id")
          .eq("stripe_subscription_id", invoice.subscription)
          .maybeSingle();

        if (service) {
          await supabase.from("payments").insert({
            client_id: service.client_id,
            client_service_id: service.id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            milestone_label: "monthly",
            status: "paid",
            paid_at: new Date().toISOString(),
          });
        }
      }
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const serviceType = subscription.metadata?.service_type || "seo_growth";
      const monthlyAmount = subscription.items.data[0]?.price?.unit_amount || 0;

      // Check if client already exists
      let { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      // If no client record, this is a new self-service customer.
      // The Stripe Customer object must contain metadata set at checkout:
      // { email, company_name, website_url }
      if (!client) {
        const stripeCustomer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const email = stripeCustomer.email;
        const companyName = stripeCustomer.metadata?.company_name || stripeCustomer.name || "Unknown";
        const websiteUrl = stripeCustomer.metadata?.website_url || null;

        if (email) {
          // Idempotency: check by email
          const { data: existingByEmail } = await supabase
            .from("clients")
            .select("id")
            .eq("contact_email", email)
            .maybeSingle();

          if (existingByEmail) {
            client = existingByEmail;
            // Link Stripe customer ID if missing
            await supabase
              .from("clients")
              .update({ stripe_customer_id: customerId })
              .eq("id", client.id);
          } else {
            // Create auth user (sends magic link)
            const { data: authUser } = await supabase.auth.admin.createUser({
              email,
              email_confirm: true,
              user_metadata: { full_name: companyName },
            });

            if (authUser?.user) {
              const { data: newClient } = await supabase
                .from("clients")
                .insert({
                  profile_id: authUser.user.id,
                  company_name: companyName,
                  contact_email: email,
                  website_url: websiteUrl,
                  stripe_customer_id: customerId,
                })
                .select()
                .single();

              client = newClient;

              // Send magic link welcome email
              await supabase.auth.admin.generateLink({
                type: "magiclink",
                email,
                options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` },
              });
            }
          }
        }
      }

      if (client) {
        await supabase.from("client_services").insert({
          client_id: client.id,
          service_type: serviceType,
          status: "active",
          monthly_amount: monthlyAmount,
          stripe_subscription_id: subscription.id,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("client_services")
        .update({
          status: "cancelled",
          completed_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "checkout.session.completed": {
      // Store custom field data (company_name, website_url) on the Stripe Customer
      // so the subscription.created handler can use it for account creation.
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer && session.custom_fields?.length) {
        const companyField = session.custom_fields.find((f) => f.key === "company_name");
        const websiteField = session.custom_fields.find((f) => f.key === "website_url");
        await stripe.customers.update(session.customer as string, {
          metadata: {
            company_name: companyField?.text?.value || "",
            website_url: websiteField?.text?.value || "",
          },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", paymentIntent.id);

      // Alert admin
      await resend.emails.send({
        from: "OphidianAI System <billing@ophidianai.com>",
        to: "eric.lefler@ophidianai.com",
        subject: "Payment Failed Alert",
        html: `<p>Payment failed for PaymentIntent ${paymentIntent.id}. Customer: ${paymentIntent.customer || "unknown"}. Amount: $${(paymentIntent.amount / 100).toFixed(2)}.</p>`,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

Note: This requires a new env var `SUPABASE_SERVICE_ROLE_KEY` for the webhook handler to bypass RLS. Add this to Vercel env vars. Find the key in the Supabase dashboard under Settings > API.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/stripe-webhook/route.ts
git commit -m "feat: implement Stripe webhook handlers for payments and subscriptions"
```

### Task 3.2: Adapt Checkout for Retainer Subscriptions

**Files:**
- Modify: `src/app/api/create-payment-intent/route.ts`
- Modify: `src/app/checkout/page.tsx`

- [ ] **Step 1: Update the payment intent API to handle retainer plans**

Replace the logic in `src/app/api/create-payment-intent/route.ts` to use the new `RETAINER_PLANS` from `stripe-plans.ts`. For retainer plans, create a Stripe Checkout Session (subscription mode) instead of a PaymentIntent.

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { RETAINER_PLANS, type RetainerPlanId } from "@/lib/stripe-plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const { planId } = (await request.json()) as { planId: RetainerPlanId };

  const plan = RETAINER_PLANS[planId];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Create a Stripe Checkout Session for subscriptions
  // Collect customer details (name, email, company, website) for account creation
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.priceMonthly,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    // Collect company_name and website_url via custom fields
    custom_fields: [
      { key: "company_name", label: { type: "custom", custom: "Company Name" }, type: "text" },
      { key: "website_url", label: { type: "custom", custom: "Business Website URL" }, type: "text", optional: true },
    ],
    subscription_data: {
      metadata: { service_type: planId.startsWith("seo_") ? "seo_growth" : "maintenance" },
    },
    // After checkout, a webhook handler creates the Stripe Customer with metadata
    // from the custom fields (company_name, website_url) via checkout.session.completed event.
    // The customer.subscription.created handler then uses this metadata for account creation.
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ophidianai.com"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://ophidianai.com"}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2: Fully replace the checkout page**

**CRITICAL:** The existing `src/app/checkout/page.tsx` uses Stripe Elements (`<Elements>`, `<PaymentElement>`, `useStripe`, `useElements`) with a `clientSecret` from a PaymentIntent. The new API returns a `{ url }` for a Stripe Checkout Session, NOT a `clientSecret`. You MUST remove the entire `CheckoutContent` and `CheckoutForm` components and the `<Elements>` wrapper. If you only swap the API without replacing the page, the Stripe SDK will crash when initialized with a URL string instead of a client secret.

Replace the page with a simple redirect flow:
1. Read `plan` from query params (wrap in `<Suspense>` per Next.js 15 requirement for `useSearchParams()`)
2. Show the plan name, price, and a loading spinner
3. On mount, call `/api/create-payment-intent` with the planId
4. Redirect to the Stripe Checkout URL (`window.location.href = data.url`)
5. If the API returns an error, show an error message with a link back to `/pricing`

Remove all Stripe Elements imports (`@stripe/react-stripe-js`, `@stripe/stripe-js`) from this page.

- [ ] **Step 3: Verify build**

```bash
cd engineering/projects/ophidian-ai && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/create-payment-intent/route.ts src/app/checkout/page.tsx
git commit -m "feat: adapt checkout for retainer subscription plans via Stripe Checkout"
```

---

## Chunk 4: Dashboard Shell & Sidebar

**Goal:** Extract the shared dashboard shell (sidebar + header), implement role-based routing, and create the module guard component.

### Task 4.1: Extract Dashboard Sidebar Component

**Files:**
- Create: `src/components/dashboard/sidebar.tsx`

- [ ] **Step 1: Create the sidebar component**

Extract sidebar from `src/app/dashboard/page.tsx` into a reusable component. The sidebar should:

- Accept a `role` prop (`"admin"` | `"client"`)
- Accept a `modules` prop (Set of DashboardModule) for client users
- Render different nav items based on role
- Highlight the active page using `usePathname()`
- Use the existing glass card styling from the current dashboard

**Client sidebar items** (shown conditionally based on modules):
- Dashboard (always) -> `/dashboard`
- Projects (if `project_tracker` in modules) -> `/dashboard/projects`
- Analytics (if `analytics` in modules) -> `/dashboard/analytics`
- SEO (if `seo_performance` in modules) -> `/dashboard/seo`
- Content Requests (if `content_requests` in modules) -> `/dashboard/content-requests`
- Reports (always) -> `/dashboard/reports`
- Billing (always) -> `/dashboard/billing`
- Account Settings (always) -> `/dashboard/account`

**Admin sidebar items:**
- Dashboard -> `/dashboard`
- Clients -> `/dashboard/admin/clients`
- Proposals -> `/dashboard/admin/proposals`
- Revenue -> `/dashboard/admin/revenue`
- Account Settings -> `/dashboard/account`

Icons: Use lucide-react (LayoutDashboard, FolderKanban, BarChart3, Search, FileText, Receipt, CreditCard, Settings, Users, FileSignature, DollarSign).

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/sidebar.tsx
git commit -m "feat: create reusable dashboard sidebar with role-based navigation"
```

### Task 4.2: Create Module Guard Component

**Files:**
- Create: `src/components/dashboard/module-guard.tsx`

- [ ] **Step 1: Create the module guard**

```typescript
// src/components/dashboard/module-guard.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { type DashboardModule } from "@/lib/modules";

interface ModuleGuardProps {
  modules: Set<DashboardModule>;
  required: DashboardModule;
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function ModuleGuard({
  modules,
  required,
  children,
  fallbackUrl = "/dashboard",
}: ModuleGuardProps) {
  const router = useRouter();

  useEffect(() => {
    if (!modules.has(required)) {
      router.replace(fallbackUrl);
    }
  }, [modules, required, fallbackUrl, router]);

  if (!modules.has(required)) {
    return null;
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/module-guard.tsx
git commit -m "feat: add module guard component for conditional dashboard access"
```

### Task 4.3: Update Dashboard Layout for Role-Based Routing

**Files:**
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Update dashboard layout**

The current layout only allows admin users. Update it to:

1. Allow both admin and client roles (remove the admin-only redirect)
2. Fetch the user's profile to determine role
3. If client: fetch their client record and services, compute available modules
4. Pass role and modules to the sidebar via React context or props
5. Render the sidebar + main content area

Create a dashboard context provider:

```typescript
// src/lib/dashboard-context.tsx
"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/supabase/types";
import type { DashboardModule } from "@/lib/modules";

interface DashboardContextValue {
  role: UserRole;
  modules: Set<DashboardModule>;
  clientId: string | null;
}

const DashboardContext = createContext<DashboardContextValue>({
  role: "client",
  modules: new Set(),
  clientId: null,
});

export function DashboardProvider({
  role,
  modules,
  clientId,
  children,
}: DashboardContextValue & { children: React.ReactNode }) {
  return (
    <DashboardContext.Provider value={{ role, modules, clientId }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
```

**CRITICAL:** The existing `layout.tsx` has an admin-only guard that redirects non-admin users to `/`. This MUST be removed or the entire client portal will be inaccessible. Replace the existing layout with:

- Remove `if (profile?.role !== "admin") { redirect("/") }` guard
- Keep the auth guard (redirect to `/sign-in` if no user session)
- Fetch user profile (role) from `profiles` table
- If client role: fetch their client record + services -> compute modules via `getClientModules()`
- If client role: also fetch their active project to determine phase (for module gating)
- Wrap children in `DashboardProvider` with role, modules, clientId
- Render `Sidebar` component alongside children in a flex layout
- Admin users: pass empty modules set (admin sidebar uses its own nav items)

- [ ] **Step 2: Create the dashboard context file**

Create `src/lib/dashboard-context.tsx` with the code above.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/layout.tsx src/lib/dashboard-context.tsx
git commit -m "feat: implement role-based dashboard layout with context provider"
```

### Task 4.4: Refactor Dashboard Home Page

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Split dashboard home into admin vs client view**

The current `src/app/dashboard/page.tsx` is a monolithic admin dashboard. Refactor it:

**If admin:** Show the current admin overview (clients table, stats, charts) -- but move the sidebar rendering out (handled by layout now).

**If client:** Show a client home page with:
- Welcome message with company name
- Active project status card (if they have a project) with the phase tracker component
- Quick stats: next payment due, pending content requests, latest report
- Quick links to their available modules

Use `useDashboard()` hook to determine role and render accordingly.

Remove the inline sidebar from this page (it's now in the layout).

- [ ] **Step 2: Verify build**

```bash
cd engineering/projects/ophidian-ai && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: refactor dashboard home with role-based views"
```

---

## Chunk 5: Project Phase Tracker Component

**Goal:** Build the gradient phase tracker adapted from the gradient-selector-card component.

### Task 5.1: Create Project Phase Tracker

**Files:**
- Create: `src/components/ui/project-phase-tracker.tsx`

- [ ] **Step 1: Create the component**

Adapt the gradient-selector-card component for project phases:

Key changes from the original:
- 5 nodes instead of 4: Discovery, Design, Development, Review, Live
- Colors: Venom Green (`#39FF14`) progressing to teal (`#0DB1B2`)
- Read-only mode (no click handler) for client view
- Clickable for admin view (to update phase)
- Labels show phase name + optional date below each node
- Uses `motion` (the project's framer-motion import) instead of `framer-motion`

```typescript
// src/components/ui/project-phase-tracker.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ProjectPhase } from "@/lib/supabase/types";

interface PhaseNode {
  id: ProjectPhase;
  label: string;
  date?: string | null;
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

const PHASE_NODES: PhaseNode[] = [
  {
    id: "discovery",
    label: "Discovery",
    color: "#39FF14",
    gradientFrom: "#39FF14",
    gradientTo: "#2BCC10",
  },
  {
    id: "design",
    label: "Design",
    color: "#2BCC10",
    gradientFrom: "#2BCC10",
    gradientTo: "#1FA88E",
  },
  {
    id: "development",
    label: "Development",
    color: "#1FA88E",
    gradientFrom: "#1FA88E",
    gradientTo: "#15B0A0",
  },
  {
    id: "review",
    label: "Review",
    color: "#15B0A0",
    gradientFrom: "#15B0A0",
    gradientTo: "#0DB1B2",
  },
  {
    id: "live",
    label: "Live",
    color: "#0DB1B2",
    gradientFrom: "#0DB1B2",
    gradientTo: "#0DB1B2",
  },
];

const PHASE_ORDER: ProjectPhase[] = ["discovery", "design", "development", "review", "live"];

interface ProjectPhaseTrackerProps {
  currentPhase: ProjectPhase;
  milestoneDates?: Partial<Record<ProjectPhase, string | null>>;
  editable?: boolean;
  onPhaseChange?: (phase: ProjectPhase) => void;
  className?: string;
}

export function ProjectPhaseTracker({
  currentPhase,
  milestoneDates,
  editable = false,
  onPhaseChange,
  className,
}: ProjectPhaseTrackerProps) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [gradientPosition, setGradientPosition] = useState<{ x: number; y: number } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (currentIndex >= 0 && circleRefs.current[currentIndex] && containerRef.current) {
      const circleRect = circleRefs.current[currentIndex]!.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setGradientPosition({
        x: circleRect.left + circleRect.width / 2 - containerRect.left,
        y: circleRect.top + circleRect.height / 2 - containerRect.top,
      });
    }
  }, [currentIndex]);

  const handleClick = (phase: ProjectPhase) => {
    if (editable && onPhaseChange) {
      onPhaseChange(phase);
    }
  };

  const createOrbitalDots = (count: number, radius: number, color: string) => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const x = Math.cos(angle) * radius - 2;
      const y = Math.sin(angle) * radius - 2;
      return (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.6,
            delay: shouldReduceMotion ? 0 : i * 0.03,
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          style={{ backgroundColor: color, left: "50%", top: "50%", x, y }}
        />
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center gap-8 p-8 border border-white/10 rounded-xl overflow-hidden bg-surface/50 backdrop-blur",
        className
      )}
    >
      {/* Radial glow */}
      {gradientPosition && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle at ${gradientPosition.x}px ${gradientPosition.y + 200}px, ${PHASE_NODES[currentIndex].color}18 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Phase nodes */}
      <div className="relative z-10 flex items-center gap-4 sm:gap-6 border border-white/10 bg-background/80 rounded-full p-4 sm:p-6">
        {PHASE_NODES.map((node, index) => (
          <div key={node.id} className="flex items-center gap-4 sm:gap-6">
            <div
              ref={(el) => { circleRefs.current[index] = el; }}
              className={cn(
                "relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-transparent transition-all duration-200",
                editable && "cursor-pointer hover:scale-110"
              )}
              onClick={() => handleClick(node.id)}
              style={{
                backgroundColor: currentIndex >= index ? node.color : "#4B5563",
                boxShadow: currentIndex >= index
                  ? `0 0 20px ${node.color}40, 0 0 40px ${node.color}20`
                  : "none",
              }}
            >
              {currentIndex === index && createOrbitalDots(12, 16, node.color)}
            </div>

            {index < PHASE_NODES.length - 1 && (
              <div
                className="w-12 sm:w-20 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: currentIndex > index
                    ? `linear-gradient(to right, ${node.gradientFrom}, ${PHASE_NODES[index + 1].gradientTo})`
                    : "#4B5563",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="relative z-10 flex items-start gap-2 sm:gap-4">
        {PHASE_NODES.map((node, index) => (
          <div key={`label-${node.id}`} className="flex flex-col items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium transition-colors duration-200",
                  editable && "cursor-pointer"
                )}
                onClick={() => handleClick(node.id)}
                style={{ color: currentIndex >= index ? node.color : "#6B7280" }}
              >
                {node.label}
              </span>
              {index < PHASE_NODES.length - 1 && <div className="w-12 sm:w-20" />}
            </div>
            {milestoneDates?.[node.id] && (
              <span className="text-[10px] sm:text-xs text-foreground-dim mt-1">
                {milestoneDates[node.id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd engineering/projects/ophidian-ai && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/project-phase-tracker.tsx
git commit -m "feat: create project phase tracker component with gradient animation"
```

---

## Chunk 6: Client Dashboard Pages

**Goal:** Build all client-facing dashboard pages: Projects, Analytics, SEO, Content Requests, Reports, Billing, Proposals.

### Task 6.1: Projects Page

**Files:**
- Create: `src/app/dashboard/projects/page.tsx`

- [ ] **Step 1: Create the projects page**

Client view showing their active project(s):
- Project phase tracker component (read-only)
- Milestone timeline below the tracker (list of milestones with status)
- Project details card: estimated completion, current phase description, notes
- If no active projects: empty state with message

Fetch data from `projects` and `project_milestones` tables using the client's `clientId` from dashboard context.

Use the `ModuleGuard` component to require `project_tracker` module.

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/projects/page.tsx
git commit -m "feat: add client projects page with phase tracker"
```

### Task 6.2: Analytics Page

**Files:**
- Create: `src/app/dashboard/analytics/page.tsx`

- [ ] **Step 1: Create the analytics page**

Client view showing their GA4 data:
- Date range selector (7d, 30d, 90d)
- Stat cards: Page Views, Unique Visitors, Bounce Rate, Avg Session Duration
- Traffic trend line chart (Recharts)
- Top pages bar chart
- Referral sources pie chart

Fetch data from `client_analytics` table. Use `ModuleGuard` to require `analytics` module.

If no data yet: show empty state "Analytics data will appear once your site is live and receiving traffic."

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/analytics/page.tsx
git commit -m "feat: add client analytics dashboard page"
```

### Task 6.3: SEO Performance Page

**Files:**
- Create: `src/app/dashboard/seo/page.tsx`

- [ ] **Step 1: Create the SEO page**

Client view showing Search Console data:
- Stat cards: Impressions, Clicks, Avg Position, CTR
- Search performance line chart (impressions + clicks over time)
- Top search queries table (query, impressions, clicks, position, CTR)
- Indexed pages count
- Date range selector (7d, 30d, 90d)

Fetch from `client_seo_metrics`. Use `ModuleGuard` for `seo_performance`.

Empty state: "SEO data will appear after your site is indexed and Search Console is configured."

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/seo/page.tsx
git commit -m "feat: add client SEO performance dashboard page"
```

### Task 6.4: Content Requests Page

**Files:**
- Create: `src/app/dashboard/content-requests/page.tsx`
- Create: `src/app/dashboard/content-requests/new/page.tsx`
- Create: `src/app/api/content-requests/route.ts`

- [ ] **Step 1: Create the API route**

`src/app/api/content-requests/route.ts`:

GET: Fetch all content requests for the current user's client ID. Return sorted by created_at desc.

POST: Create a new content request. Accept `{ subject, description, attachments }`. Validate required fields. Insert into `content_requests` with the user's client_id.

Both use server-side Supabase client with the user's session (RLS handles access control).

- [ ] **Step 2: Create the content requests list page**

Show a list of all content requests with status badges (pending = yellow, in_progress = blue, completed = green). "New Request" button links to `/dashboard/content-requests/new`.

Use `ModuleGuard` for `content_requests`.

- [ ] **Step 3: Create the new request form page**

Simple form: Subject (text input), Description (textarea), Attachments (file upload to Supabase Storage). Submit button calls the API.

On success, redirect to `/dashboard/content-requests`.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/content-requests/ src/app/api/content-requests/
git commit -m "feat: add content requests pages and API"
```

### Task 6.5: Reports Page

**Files:**
- Create: `src/app/dashboard/reports/page.tsx`

- [ ] **Step 1: Create the reports page**

Simple list of reports for the client:
- Each report shows: title, period (start - end), date uploaded
- Download button (links to `file_url` from Supabase Storage)
- Empty state: "No reports yet. Monthly reports will appear here once your services are active."

Fetch from `reports` table.

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/reports/page.tsx
git commit -m "feat: add client reports page"
```

### Task 6.6: Billing Page

**Files:**
- Create: `src/app/dashboard/billing/page.tsx`

- [ ] **Step 1: Create the billing page**

Show:
- Active subscriptions (from `client_services` where `monthly_amount` is not null and status = active)
- Payment history table (from `payments` table): date, amount, milestone, status
- For active projects: payment schedule showing which milestones are paid vs pending
- Next payment due (earliest pending payment)

Fetch from `payments` and `client_services` tables.

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/billing/page.tsx
git commit -m "feat: add client billing page"
```

### Task 6.7: Proposals Page

**Files:**
- Create: `src/app/dashboard/proposals/page.tsx`
- Create: `src/app/api/proposals/[id]/approve/route.ts`

- [ ] **Step 1: Create the proposal approval API**

`src/app/api/proposals/[id]/approve/route.ts`:

POST: Accept `{ action: "approved" | "declined" }`. Update the proposal status. If approved, record `approved_at` and `approved_by_ip` (from request headers). Send confirmation email to both client and Eric via Resend.

Validate that the proposal belongs to the current user's client and has status `sent`.

- [ ] **Step 2: Create the proposals page**

List of proposals for the client:
- Each shows: title (from content JSON), status badge, sent date
- Click to expand: full proposal content, payment schedule
- If status is `sent`: Show "Approve" and "Decline" buttons
- If approved/declined: Show the recorded date

Fetch from `proposals` table.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/proposals/ src/app/api/proposals/
git commit -m "feat: add client proposals page with approval flow"
```

---

## Chunk 7: Admin Dashboard Pages

**Goal:** Build admin-specific dashboard pages for client management, proposals, and revenue.

### Task 7.1: Admin Dashboard Home

**Files:**
- Create: `src/app/dashboard/admin/page.tsx`

- [ ] **Step 1: Create admin dashboard home**

Overview page showing:
- Stat cards: Total Clients, Active Projects, Pending Proposals, Outstanding Invoices
- Alerts section: overdue payments, pending content requests, proposals awaiting response
- Quick actions: "Add Client" button, "View All Clients" link
- Recent activity feed (latest payments, content requests, proposal updates)

Fetch from multiple tables. Admin role required (check in layout or use server component with role check).

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/admin/page.tsx
git commit -m "feat: add admin dashboard home with overview stats"
```

### Task 7.2: Admin Client Management

**Files:**
- Create: `src/app/dashboard/admin/clients/page.tsx`
- Create: `src/app/dashboard/admin/clients/[id]/page.tsx`
- Create: `src/app/dashboard/admin/clients/new/page.tsx`
- Create: `src/app/api/admin/clients/route.ts`
- Create: `src/app/api/admin/projects/[id]/phase/route.ts`

- [ ] **Step 1: Create admin clients API**

`src/app/api/admin/clients/route.ts`:

GET: List all clients with their services and active projects. Admin only.

POST: Create a new client. Accept `{ company_name, contact_email, website_url, services }`. Create the client record. If a profile doesn't exist for the contact_email, create one via Supabase Auth admin API (invite user). Create client_services records for each service. If web design service, create a project record.

All endpoints verify admin role.

- [ ] **Step 2: Create admin project phase update API**

`src/app/api/admin/projects/[id]/phase/route.ts`:

PATCH: Accept `{ phase }`. Update the project's phase and `phase_updated_at`. Admin only.

- [ ] **Step 3: Create client list page**

Table of all clients: Company Name, Contact Email, Services (badges), Project Phase, Last Activity. Filters: All, Active Projects, Completed. Search by company name.

"Add Client" button links to `/dashboard/admin/clients/new`.

Click a row to go to `/dashboard/admin/clients/[id]`.

- [ ] **Step 4: Create client detail page**

Full client view:
- Client info card (company, email, website, Stripe customer ID, GA4 property, Search Console URL)
- Edit button for service setup fields (GA4, Search Console, Stripe)
- Active services list with status
- Project phase tracker (editable -- admin can click to update phase)
- Payment schedule with status
- Content requests list
- Reports list with upload button (file upload to Supabase Storage)
- Proposals list with "Create Proposal" button

- [ ] **Step 5: Create new client form page**

Form: Company Name, Contact Email, Website URL, Services (checkboxes for each service type).

On submit, calls the admin clients API.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/admin/clients/ src/app/api/admin/
git commit -m "feat: add admin client management pages and APIs"
```

### Task 7.3: Admin Proposal Manager

**Files:**
- Create: `src/app/dashboard/admin/proposals/page.tsx`

- [ ] **Step 1: Create admin proposal manager page**

Table of all proposals across all clients:
- Client name, proposal title, status, sent date, amount
- Filters: All, Draft, Sent, Approved, Declined
- Click to expand: full proposal content
- "Create Proposal" button (opens a form to draft a new proposal for a selected client)
- "Send" action on draft proposals (updates status to `sent`, sends email to client via Resend with link to `/dashboard/proposals`)

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/admin/proposals/
git commit -m "feat: add admin proposal manager"
```

### Task 7.4: Admin Revenue Overview

**Files:**
- Create: `src/app/dashboard/admin/revenue/page.tsx`

- [ ] **Step 1: Create revenue overview page**

Dashboard showing:
- Total Revenue (sum of all paid payments)
- Outstanding Invoices (sum of pending payments)
- MRR (sum of `monthly_amount` from active retainer services: seo_growth + maintenance)
- Revenue by month (bar chart from `payments` table, grouped by paid_at month)
- Breakdown by service type (pie chart)

Fetch from `payments` and `client_services` tables. Admin only.

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/admin/revenue/
git commit -m "feat: add admin revenue overview dashboard"
```

---

## Chunk 8: Supabase Edge Functions (Analytics Pipeline)

**Goal:** Create scheduled Edge Functions to pull GA4 and Search Console data daily.

### Task 8.1: GA4 Sync Edge Function

**Files:**
- Create: `supabase/functions/sync-ga4-data/index.ts`

- [ ] **Step 1: Create the Edge Function**

This function:
1. Queries `clients` table for all clients with a non-null `ga4_property_id`
2. For each client, calls the GA4 Data API (Analytics Data API v1beta) to pull yesterday's metrics
3. Upserts into `client_analytics` table with `ON CONFLICT (client_id, date) DO UPDATE`

GA4 Data API endpoint: `https://analyticsdata.googleapis.com/v1beta/{propertyId}:runReport`

Auth: Service account JSON stored as Supabase secret `GOOGLE_SERVICE_ACCOUNT_KEY`. Generate a JWT from the service account credentials to get an access token.

Metrics to request: `screenPageViews`, `activeUsers`, `bounceRate`, `averageSessionDuration`
Dimensions: `pagePath` (for top pages), `sessionSource` (for referral sources)

- [ ] **Step 2: Deploy the function**

```bash
npx supabase functions deploy sync-ga4-data
```

- [ ] **Step 3: Set up the cron schedule in Supabase dashboard**

Schedule: `0 11 * * *` (6am ET = 11:00 UTC)

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/sync-ga4-data/
git commit -m "feat: add GA4 data sync edge function"
```

### Task 8.2: Search Console Sync Edge Function

**Files:**
- Create: `supabase/functions/sync-search-console/index.ts`

- [ ] **Step 1: Create the Edge Function**

This function:
1. Queries `clients` table for all clients with a non-null `search_console_url`
2. For each client, calls the Search Console API to pull yesterday's data
3. Upserts into `client_seo_metrics` table
4. On Sundays (or weekly), also pull `indexed_pages` count via the URL Inspection API

Search Console API endpoint: `https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query`

Same service account auth as GA4.

Request body for daily data:
```json
{
  "startDate": "yesterday",
  "endDate": "yesterday",
  "dimensions": ["query"],
  "rowLimit": 25
}
```

For `indexed_pages`: carry forward last known value on non-weekly runs.

- [ ] **Step 2: Deploy and schedule**

```bash
npx supabase functions deploy sync-search-console
```

Schedule: `0 11 * * *` (same as GA4)

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/sync-search-console/
git commit -m "feat: add Search Console data sync edge function"
```

### Task 8.3: Overdue Payments Check Edge Function

**Files:**
- Create: `supabase/functions/check-overdue-payments/index.ts`

- [ ] **Step 1: Create the Edge Function**

This function:
1. Queries `payments` table for rows where `status = 'pending'` and `due_date < today`
2. Updates those rows to `status = 'overdue'`
3. Sends a summary email to Eric via Resend listing all newly overdue payments

- [ ] **Step 2: Deploy and schedule**

```bash
npx supabase functions deploy check-overdue-payments
```

Schedule: `0 14 * * *` (9am ET = 14:00 UTC)

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/check-overdue-payments/
git commit -m "feat: add overdue payments check edge function"
```

### Task 8.4: Admin Analytics Refresh Endpoint

**Files:**
- Create: `src/app/api/admin/analytics-refresh/route.ts`

- [ ] **Step 1: Create the manual refresh endpoint**

POST endpoint that invokes the GA4 and Search Console Edge Functions on demand. Admin only. Accepts optional `{ clientId }` to refresh a single client.

Calls the Supabase Edge Function invoke API:
```typescript
const { data, error } = await supabase.functions.invoke("sync-ga4-data", {
  body: { clientId },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/analytics-refresh/
git commit -m "feat: add manual analytics refresh endpoint for admin"
```

---

## Chunk 9: Skill Updates & Final Integration

**Goal:** Update the web-builder and proposal-generator skills with portal integration steps. Final build verification.

### Task 9.1: Update Web Builder Skill

**Files:**
- Modify: `.claude/skills/web-builder/SKILL.md`

- [ ] **Step 1: Add portal integration checklist to the build process**

Add a new section to the web-builder skill after "Phase 5: Integration" (or at the appropriate point):

```markdown
## Portal Integration Checklist

Every client website build must include these steps for the client portal:

- [ ] Create GA4 property for the client site
- [ ] Add GA4 tracking snippet to the client's site
- [ ] Verify site ownership in Google Search Console
- [ ] Add OphidianAI service account as viewer on GA4 property
- [ ] Add OphidianAI service account as owner on Search Console property
- [ ] Create client record in Supabase (via admin dashboard)
- [ ] Assign GA4 property ID to client record
- [ ] Assign Search Console URL to client record
- [ ] Create Stripe customer for the client
- [ ] Assign Stripe customer ID to client record
- [ ] Set up maintenance subscription if applicable
- [ ] Generate and send welcome email with portal login
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/web-builder/SKILL.md
git commit -m "docs: add portal integration checklist to web-builder skill"
```

### Task 9.2: Update Proposal Generator Skill

**Files:**
- Modify: `.claude/skills/proposal-generator/SKILL.md`

- [ ] **Step 1: Add payment schedule rules to proposal generation**

Add a section to the proposal-generator skill:

```markdown
## Payment Schedule Rules

Include the correct payment schedule based on service and page count:

| Service | Pages | Payment Schedule |
|---------|-------|-----------------|
| Starter | 1-2 | 100% upfront |
| Starter | 3-5 | 50% deposit / 50% at handoff |
| Professional | Any | 50% deposit / 50% at handoff |
| E-Commerce | Any | 33% deposit / 33% mid-project / 33% at handoff |
| SEO Cleanup | N/A | 100% upfront |

Every proposal must include:
- Scope and deliverables
- Timeline with milestones
- Payment schedule with exact amounts
- Terms and conditions
- Data access disclosure (GA4/Search Console viewer access for OphidianAI)
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/proposal-generator/SKILL.md
git commit -m "docs: add payment schedule rules and data disclosure to proposal-generator skill"
```

### Task 9.3: Final Build Verification

- [ ] **Step 1: Run full build**

```bash
cd engineering/projects/ophidian-ai && npm run build
```

Expected: Clean build, all routes compile.

- [ ] **Step 2: Verify all new routes exist**

Check that the following routes are in the build output:
- `/services` (updated)
- `/services-ai` (archived)
- `/pricing` (updated)
- `/dashboard` (refactored)
- `/dashboard/projects`
- `/dashboard/analytics`
- `/dashboard/seo`
- `/dashboard/content-requests`
- `/dashboard/content-requests/new`
- `/dashboard/reports`
- `/dashboard/billing`
- `/dashboard/proposals`
- `/dashboard/admin`
- `/dashboard/admin/clients`
- `/dashboard/admin/clients/new`
- `/dashboard/admin/proposals`
- `/dashboard/admin/revenue`

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "feat: complete OphidianAI website functionality - client portal ready"
```

---

## Environment Variables Required

Before deploying, ensure these are set in Vercel:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (already set) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (already set) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for webhook handler) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `RESEND_API_KEY` | Resend email API key |
| `NEXT_PUBLIC_SITE_URL` | Production site URL for Stripe redirects |

For Supabase Edge Functions (set as Supabase secrets):

| Secret | Purpose |
|--------|---------|
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google service account JSON for GA4 + Search Console APIs |

---

## Deployment Order

1. Apply Supabase migration (schema + RLS)
2. Set all environment variables in Vercel
3. Set Supabase secrets for Edge Functions
4. Deploy Edge Functions to Supabase
5. Configure Stripe webhook endpoint in Stripe dashboard (point to `/api/stripe-webhook`)
6. Deploy to Vercel
7. Verify all routes load
8. Test checkout flow with Stripe test mode
9. Test admin client creation flow
