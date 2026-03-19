# SEO Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build an automated SEO product with monthly audits, rank tracking, AEO/GEO optimization, GBP copy generation, branded PDF reports, and a client dashboard -- extending the existing seo-audit skill into a recurring client-deliverable platform.

**Architecture:** Fan-out cron dispatcher triggers per-client audit workers. Each worker runs site audit, rank tracking, content freshness scan, GBP copy generation, PDF report generation (stored in Vercel Blob), and email delivery. Dashboard reads from Supabase. Shared keyword engine serves both SEO Automation and future Content Generation product.

**Tech Stack:** Next.js 16, Supabase (Postgres + Auth + RLS), Firecrawl (scraping + rank checking), Vercel Blob (PDF storage), Resend (email), AI SDK v6 + AI Gateway (GBP drafts, AI insights), Recharts (dashboard charts), TypeScript

**Spec:** docs/superpowers/specs/2026-03-18-seo-automation-design.md

---

## File Structure

### New Files (Create)

**Database and Types:**
- supabase/migrations/20260318100000_seo_tables.sql -- SQL migration for SEO tables + RLS policies + enum
- src/lib/supabase/seo-types.ts -- TypeScript types for SEO tables

**SEO Core Library:**
- src/lib/seo/tier-defaults.ts -- Tier constants (keywords, competitors, features per tier)
- src/lib/seo/audit-engine.ts -- Site audit logic (extends seo-audit skill patterns, adds AEO/GEO scoring)
- src/lib/seo/rank-tracker.ts -- Keyword rank checking via Firecrawl search, position bucketing
- src/lib/seo/content-freshness.ts -- Blog page age scanner
- src/lib/seo/gbp-generator.ts -- GBP copy generation from blog content via AI
- src/lib/seo/keyword-engine.ts -- Longtail keyword discovery via Firecrawl (shared with Content Gen)
- src/lib/seo/report-generator.ts -- PDF report builder, stores in Vercel Blob

**API Routes:**
- src/app/api/admin/seo/configs/route.ts -- List/create SEO configs (GET/POST)
- src/app/api/admin/seo/configs/[id]/route.ts -- Update/deactivate config (PATCH/DELETE)
- src/app/api/admin/seo/configs/[id]/run/route.ts -- Per-client audit worker (POST)
- src/app/api/admin/seo/analytics/[id]/route.ts -- Audit history + rankings (GET)
- src/app/api/seo/dashboard/route.ts -- Client-facing dashboard data (GET)
- src/app/api/seo/reports/route.ts -- Client report archive (GET)
- src/app/api/seo/gbp-drafts/[id]/approve/route.ts -- Approve GBP draft (POST)
- src/app/api/seo/keywords/discover/route.ts -- Keyword discovery (POST)
- src/app/api/seo/keywords/check-rank/route.ts -- Rank check (POST)
- src/app/api/cron/seo-monthly-dispatch/route.ts -- Monthly audit dispatcher

**Dashboard Pages:**
- src/app/dashboard/admin/seo/page.tsx -- Admin SEO overview
- src/app/dashboard/admin/seo/new/page.tsx -- New SEO config form
- src/app/dashboard/admin/seo/[id]/page.tsx -- Per-client SEO detail

**API Documentation:**
- src/app/docs/seo-api/layout.tsx -- Docs layout
- src/app/docs/seo-api/page.mdx -- Getting started + dashboard guide
- src/app/docs/seo-api/rest-api/page.mdx -- REST API reference
- src/app/docs/seo-api/keywords/page.mdx -- Keyword discovery API
- src/app/docs/seo-api/faq/page.mdx -- FAQ (scores, ranking methodology, report frequency)

### Modified Files

- vercel.json -- Add seo-monthly-dispatch cron entry
- src/app/api/cron/chatbot-demo-expiry/route.ts -- Add GBP draft expiry query
- src/lib/supabase/types.ts -- Re-export SEO types
- src/components/dashboard/sidebar.tsx -- Add SEO admin menu item
- src/app/dashboard/seo/page.tsx -- Replace placeholder with real client SEO dashboard (create if not exists)
- package.json -- Add @vercel/blob and puppeteer dependencies

---

## Phase 1: Foundation (Database + Dependencies + Types)

### Task 1: Install Dependencies

**Files:**
- Modify: package.json

- [ ] **Step 1: Install Vercel Blob and promote Puppeteer to production dependency**

Run in engineering/projects/ophidian-ai:
npm install @vercel/blob puppeteer

Note: Puppeteer may already be in devDependencies. This moves it to dependencies so it's available in Vercel production builds for PDF generation.

- [ ] **Step 2: Verify installation**

Run: npm ls @vercel/blob puppeteer
Expected: Both packages listed, no errors

- [ ] **Step 3: Commit**

git add package.json package-lock.json
git commit -m "chore: add @vercel/blob and puppeteer dependencies for SEO reports"

---

### Task 2: Database Migration -- SEO Tables

**Files:**
- Create: supabase/migrations/20260318100000_seo_tables.sql

- [ ] **Step 1: Write the migration SQL**

Create enum `seo_tier` (essentials, growth, pro) and enum `gbp_draft_status` (draft, approved, expired).

Create 4 tables: seo_configs, seo_audits, seo_rankings, seo_gbp_drafts.

seo_configs schema:
- id (uuid PK default gen_random_uuid())
- client_id (uuid FK -> clients(id) ON DELETE SET NULL, nullable)
- url (text NOT NULL)
- industry (text nullable)
- location (text nullable)
- tier (seo_tier NOT NULL DEFAULT 'essentials')
- target_keywords (text[] NOT NULL DEFAULT '{}')
- competitors (jsonb NOT NULL DEFAULT '[]') -- single jsonb column storing a JSON array of {name, url} objects (NOT jsonb[] postgres array type)
- gbp_url (text nullable)
- delivery_email (text NOT NULL)
- active (boolean NOT NULL DEFAULT true)
- created_at (timestamptz NOT NULL DEFAULT now())
- updated_at (timestamptz NOT NULL DEFAULT now())

seo_audits schema:
- id (uuid PK default gen_random_uuid())
- config_id (uuid NOT NULL FK -> seo_configs(id) ON DELETE CASCADE)
- date (date NOT NULL)
- score_onpage (int NOT NULL DEFAULT 0)
- score_technical (int NOT NULL DEFAULT 0)
- score_content (int NOT NULL DEFAULT 0)
- score_local (int NOT NULL DEFAULT 0)
- score_speed (int NOT NULL DEFAULT 0)
- score_ai_visibility (int NOT NULL DEFAULT 0)
- issues (jsonb NOT NULL DEFAULT '[]')
- recommendations (jsonb NOT NULL DEFAULT '[]')
- ai_insights (text nullable)
- report_url (text nullable)
- created_at (timestamptz NOT NULL DEFAULT now())
- UNIQUE (config_id, date)

seo_rankings schema:
- id (uuid PK default gen_random_uuid())
- config_id (uuid NOT NULL FK -> seo_configs(id) ON DELETE CASCADE)
- date (date NOT NULL)
- keyword (text NOT NULL)
- position (text NOT NULL DEFAULT 'not-found')
- ai_overview (boolean NOT NULL DEFAULT false)
- competitor_positions (jsonb nullable)
- created_at (timestamptz NOT NULL DEFAULT now())
- UNIQUE (config_id, date, keyword)

seo_gbp_drafts schema:
- id (uuid PK default gen_random_uuid())
- config_id (uuid NOT NULL FK -> seo_configs(id) ON DELETE CASCADE)
- source_url (text NOT NULL)
- content (text NOT NULL)
- keywords_used (text[] NOT NULL DEFAULT '{}')
- status (gbp_draft_status NOT NULL DEFAULT 'draft')
- expires_at (timestamptz NOT NULL)
- created_at (timestamptz NOT NULL DEFAULT now())

Include: indexes (config_id on all tables, unique composites), updated_at trigger on seo_configs, RLS policies matching chatbot pattern (admin full access, client select own via client_id -> profiles.id chain).

- [ ] **Step 2: Run migration against Supabase**

Run: npx supabase db push
Verify: All 4 tables created, RLS policies active.

- [ ] **Step 3: Commit**

git add supabase/migrations/20260318100000_seo_tables.sql
git commit -m "feat: add SEO database tables, RLS policies, and indexes"

---

### Task 3: TypeScript Types

**Files:**
- Create: src/lib/supabase/seo-types.ts
- Modify: src/lib/supabase/types.ts

- [ ] **Step 1: Create SEO types**

Export types: SeoTier, GbpDraftStatus, SeoConfig, SeoAudit, SeoRanking, SeoGbpDraft. Match the database schema exactly. Use the chatbot-types.ts pattern as reference.

- [ ] **Step 2: Re-export from main types file**

Add to bottom of src/lib/supabase/types.ts:
export type { SeoTier, GbpDraftStatus, SeoConfig, SeoAudit, SeoRanking, SeoGbpDraft } from "./seo-types";

- [ ] **Step 3: Commit**

git add src/lib/supabase/seo-types.ts src/lib/supabase/types.ts
git commit -m "feat: add TypeScript types for SEO tables"

---

### Task 4: Tier Defaults Constants

**Files:**
- Create: src/lib/seo/tier-defaults.ts

- [ ] **Step 1: Create tier defaults**

Export SEO_TIER_DEFAULTS record keyed by SeoTier with: maxKeywords, maxCompetitors, aeoGeoLevel ('structured_data' | 'monitoring' | 'full_strategy'), gbpSync ('manual' | 'auto' | 'auto_ongoing'), contentFreshnessAlerts (boolean), aiInsights (boolean).

Tier values:
- essentials: 5 keywords, 2 competitors, structured_data, manual, false, false
- growth: 15 keywords, 5 competitors, monitoring, auto, true, false
- pro: 30 keywords, 10 competitors, full_strategy, auto_ongoing, true, true

Export constants: AUDIT_RATE_LIMIT_PER_DAY (1), KEYWORD_DISCOVERY_MAX_QUERIES (20), CONTENT_FRESHNESS_THRESHOLD_DAYS (180), GBP_DRAFT_EXPIRY_DAYS (14).

- [ ] **Step 2: Commit**

git add src/lib/seo/tier-defaults.ts
git commit -m "feat: add SEO tier defaults and constants"

---

## Phase 2: Core SEO Engine

### Task 5: Rank Tracker

**Files:**
- Create: src/lib/seo/rank-tracker.ts

- [ ] **Step 1: Create rank tracking functions**

Export interface RankResult { keyword: string; position: "top-3" | "top-10" | "top-20" | "not-found"; aiOverview: boolean; competitorPositions: Record<string, string> }

Export function checkKeywordRanks(clientUrl: string, keywords: string[], competitors: Array<{ name: string; url: string }>): Promise<RankResult[]>

Implementation per keyword:
1. Run firecrawl search for the keyword (shell command: `firecrawl search "{keyword}" --format json`)
2. Parse JSON results array
3. Check if clientUrl appears in results -- bucket into top-3/10/20/not-found based on index
4. Check if any result has an AI overview indicator
5. For each competitor, check if their URL appears and bucket position
6. Return RankResult

Export function storeRankings(supabase: any, configId: string, date: string, results: RankResult[]): Promise<void>
- Upsert each result into seo_rankings table with onConflict: "config_id,date,keyword"

- [ ] **Step 2: Commit**

git add src/lib/seo/rank-tracker.ts
git commit -m "feat: add keyword rank tracker with Firecrawl search"

---

### Task 6: Audit Engine

**Files:**
- Create: src/lib/seo/audit-engine.ts

- [ ] **Step 1: Create audit engine**

Export interface AuditResult { scores: { onpage: number; technical: number; content: number; local: number; speed: number; aiVisibility: number }; issues: Array<{ area: string; finding: string; severity: "high" | "medium" | "low"; impact: string; status: "open" }>; recommendations: Array<{ priority: number; action: string; impact: string }> }

Export async function runSiteAudit(url: string, tier: SeoTier): Promise<AuditResult>

Implementation:
1. Scrape site with firecrawl (`firecrawl scrape {url} --format markdown`)
2. Map the site with firecrawl (`firecrawl map {url}`)
3. Analyze scraped content for:
   - On-page: meta titles, descriptions, heading structure, alt text, URL structure
   - Technical: HTTPS, sitemap.xml presence, robots.txt, canonical URLs
   - Content: word count, keyword density, duplicate content indicators
   - Local: NAP mentions, local keywords, GBP reference
   - Speed: basic load indicators from scrape response
   - AI Visibility (AEO/GEO): schema markup presence, Q&A formatting, FAQ structure. Rubric: 1=none, 2=basic schema, 3=schema+Q&A, 4=schema+Q&A+some AI citations, 5=full structured data+multi-engine citations
4. Score each area 1-5
5. Identify issues sorted by severity
6. Generate prioritized recommendations

Export async function storeAudit(supabase: any, configId: string, date: string, result: AuditResult, reportUrl: string | null, aiInsights: string | null): Promise<void>
- Insert into seo_audits table

- [ ] **Step 2: Commit**

git add src/lib/seo/audit-engine.ts
git commit -m "feat: add SEO audit engine with AEO/GEO scoring"

---

### Task 7: Content Freshness Scanner

**Files:**
- Create: src/lib/seo/content-freshness.ts

- [ ] **Step 1: Create freshness scanner**

Export interface StalePageResult { url: string; title: string; publishDate: string | null; ageInDays: number }

Export async function scanContentFreshness(siteUrl: string): Promise<StalePageResult[]>

Implementation:
1. Map site with firecrawl (`firecrawl map {siteUrl}`) to get all page URLs
2. Filter for blog/article pages (URLs containing /blog/, /article/, /news/, /post/)
3. For each blog page: scrape with firecrawl, extract publish date from meta tags (article:published_time, datePublished schema, time element)
4. Calculate age in days
5. Return pages older than CONTENT_FRESHNESS_THRESHOLD_DAYS (180)

- [ ] **Step 2: Commit**

git add src/lib/seo/content-freshness.ts
git commit -m "feat: add content freshness scanner for stale blog detection"

---

### Task 8: GBP Copy Generator

**Files:**
- Create: src/lib/seo/gbp-generator.ts

- [ ] **Step 1: Create GBP copy generator**

Export async function generateGbpDraft(blogUrl: string, keywords: string[], config: SeoConfig): Promise<{ content: string; keywordsUsed: string[] }>

Implementation:
1. Scrape blog post with firecrawl (`firecrawl scrape {blogUrl} --format markdown`)
2. Use AI SDK streamText (model from AI Gateway, e.g. "google/gemini-2.5-flash") with prompt:
   - System: "You are a GBP update writer. Convert the blog post into a Google Business Profile update. Max 1500 characters. Naturally incorporate these keywords: {keywords}. Keep it informative and actionable. Include a call-to-action linking to the blog post."
   - User: the scraped blog content
3. Extract text from result
4. Identify which keywords were used in the output
5. Return { content, keywordsUsed }

Export async function storeGbpDraft(supabase: any, configId: string, blogUrl: string, content: string, keywordsUsed: string[]): Promise<void>
- Insert into seo_gbp_drafts with expires_at = NOW + GBP_DRAFT_EXPIRY_DAYS

- [ ] **Step 2: Commit**

git add src/lib/seo/gbp-generator.ts
git commit -m "feat: add GBP copy generator from blog content"

---

### Task 9: Keyword Discovery Engine

**Files:**
- Create: src/lib/seo/keyword-engine.ts

- [ ] **Step 1: Create keyword engine**

Export interface KeywordSuggestion { keyword: string; source: string }

Export async function discoverKeywords(topic: string, location: string, limit: number): Promise<KeywordSuggestion[]>

Implementation:
1. Search firecrawl for "{topic} {location}" (`firecrawl search "{topic} {location}" --format json`)
2. Parse results for "People also search for" or related queries
3. Search firecrawl for longtail variations: "{topic} near me {location}", "best {topic} {location}", "{topic} for {location} businesses"
4. Deduplicate and return up to `limit` suggestions
5. Cap at KEYWORD_DISCOVERY_MAX_QUERIES (20) firecrawl calls

- [ ] **Step 2: Commit**

git add src/lib/seo/keyword-engine.ts
git commit -m "feat: add keyword discovery engine with Firecrawl"

---

### Task 10: Report Generator

**Depends on:** Task 5 (RankResult type), Task 6 (AuditResult type). Complete those first.

**Files:**
- Create: src/lib/seo/report-generator.ts

- [ ] **Step 1: Create report generator**

Export async function generateSeoReport(config: SeoConfig, audit: AuditResult, rankings: RankResult[], previousAudit: SeoAudit | null, aiInsights: string | null): Promise<string>

Implementation:
1. Build HTML report using template string with:
   - OphidianAI branding (logo base64 from shared/ophidianai-brand-assets/logo_icon_circle_navy.png)
   - Client name and URL header
   - Date
   - Score card: 6 scores with color coding (1-2 red, 3 yellow, 4-5 green), trend arrows vs previous audit
   - Rankings table: keyword, position tier, change indicator, AI Overview badge, competitor positions
   - Issues table: area, finding, severity badge, impact
   - Recommendations: prioritized numbered list
   - AI Insights section (Pro tier only, if provided)
2. Convert HTML to PDF using Puppeteer:
   ```
   const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
   const page = await browser.newPage();
   await page.setContent(html, { waitUntil: 'networkidle0' });
   const pdfBuffer = await page.pdf({ format: 'Letter', printBackground: true });
   await browser.close();
   ```
3. Upload PDF to Vercel Blob:
   ```
   const { url } = await put(`seo-reports/${config.id}/${date}.pdf`, pdfBuffer, { access: 'public', contentType: 'application/pdf' });
   ```
4. Return the Blob URL

- [ ] **Step 2: Commit**

git add src/lib/seo/report-generator.ts
git commit -m "feat: add SEO report PDF generator with Vercel Blob storage"

---

## Phase 3: API Routes

### Task 11: Admin SEO Config CRUD

**Files:**
- Create: src/app/api/admin/seo/configs/route.ts
- Create: src/app/api/admin/seo/configs/[id]/route.ts

- [ ] **Step 1: Create list/create endpoint**

GET: requireAdmin, list all seo_configs with client company_name join, order by created_at desc.
POST: requireAdmin, validate url + delivery_email required, validate target_keywords.length <= SEO_TIER_DEFAULTS[tier].maxKeywords, validate competitors.length <= SEO_TIER_DEFAULTS[tier].maxCompetitors, insert config, return 201.

Follow existing pattern from src/app/api/admin/chatbot/configs/route.ts.

- [ ] **Step 2: Create update/deactivate endpoint**

PATCH: requireAdmin, validate keyword/competitor counts against tier limits if changed, update config fields.
DELETE: requireAdmin, soft delete (set active=false).

- [ ] **Step 3: Commit**

git add src/app/api/admin/seo/
git commit -m "feat: add admin SEO config CRUD API endpoints"

---

### Task 12: Per-Client Audit Worker

**Files:**
- Create: src/app/api/admin/seo/configs/[id]/run/route.ts

- [ ] **Step 1: Create audit worker endpoint**

POST handler (called by cron dispatcher or manual trigger):
1. Auth: requireAdmin OR verify CRON_SECRET Bearer token (supports both manual and cron invocation)
2. Load seo_config by id
3. Rate limit: check if seo_audits has an entry for this config_id with today's date. If yes, return 429 with message.
4. Run audit: await runSiteAudit(config.url, config.tier)
5. Check rankings: await checkKeywordRanks(config.url, config.target_keywords, config.competitors)
6. Store rankings: await storeRankings(supabase, config.id, todayStr, rankings)
7. Content freshness (Growth/Pro): await scanContentFreshness(config.url) if tier permits
8. GBP draft (Growth/Pro): pick most recent blog post from freshness scan, await generateGbpDraft + storeGbpDraft
9. AI insights (Pro): use streamText to generate narrative summary of audit + rankings
10. Generate report: await generateSeoReport(config, audit, rankings, previousAudit, aiInsights)
11. Store audit: await storeAudit(supabase, config.id, todayStr, audit, reportUrl, aiInsights)
12. Email report: send via Resend to config.delivery_email with PDF attachment URL
13. Return { success: true, auditId }

Set Vercel function config: maxDuration = 300 (Fluid Compute).

- [ ] **Step 2: Commit**

git add src/app/api/admin/seo/configs/[id]/run/
git commit -m "feat: add per-client SEO audit worker endpoint"

---

### Task 13: Admin Analytics API

**Files:**
- Create: src/app/api/admin/seo/analytics/[id]/route.ts

- [ ] **Step 1: Create analytics endpoint**

GET: requireAdmin, accept ?days=30 query param. Return JSON with:
- audits: from seo_audits for config within date range, order by date asc
- rankings: latest month from seo_rankings for config
- gbpDrafts: from seo_gbp_drafts for config, order by created_at desc, limit 10

Follow pattern from src/app/api/admin/chatbot/analytics/[id]/route.ts (created by the AI Chatbot Widget plan -- if implementing SEO first, follow the general admin analytics pattern: requireAdmin, date range query param, parallel Supabase queries, return JSON).

- [ ] **Step 2: Commit**

git add src/app/api/admin/seo/analytics/
git commit -m "feat: add admin SEO analytics API endpoint"

---

### Task 14: Client-Facing API Routes

**Files:**
- Create: src/app/api/seo/dashboard/route.ts
- Create: src/app/api/seo/reports/route.ts
- Create: src/app/api/seo/gbp-drafts/[id]/approve/route.ts

- [ ] **Step 1: Create client dashboard endpoint**

GET: Auth required (Supabase auth). Get client_id from profile. Query seo_configs where client_id matches. Get latest audit, latest rankings, active GBP drafts. Return aggregated dashboard data.

- [ ] **Step 2: Create reports archive endpoint**

GET: Auth required. Get client's seo_config. Query seo_audits for config, select date + report_url only, order by date desc. Return array.

- [ ] **Step 3: Create GBP draft approval endpoint**

POST: Auth required. Verify the draft belongs to the client's config. Update seo_gbp_drafts set status='approved' where id=param AND status='draft' AND expires_at > NOW(). If no rows updated, return 410 (Gone) with message "Draft has expired or was already processed." Return success on update.

- [ ] **Step 4: Commit**

git add src/app/api/seo/
git commit -m "feat: add client-facing SEO dashboard, reports, and GBP approval APIs"

---

### Task 15: Shared Keyword Endpoints

**Files:**
- Create: src/app/api/seo/keywords/discover/route.ts
- Create: src/app/api/seo/keywords/check-rank/route.ts

- [ ] **Step 1: Create keyword discovery endpoint**

POST: Auth required. Accept { topic, location, limit }. Validate limit <= KEYWORD_DISCOVERY_MAX_QUERIES. Call discoverKeywords. Return suggestions array.

- [ ] **Step 2: Create rank check endpoint**

POST: Auth required. Accept { keyword, url }. Call Firecrawl search for keyword, parse for url position. Return { position, aiOverview }.

- [ ] **Step 3: Commit**

git add src/app/api/seo/keywords/
git commit -m "feat: add shared keyword discovery and rank check API endpoints"

---

## Phase 4: Cron Jobs

### Task 16: Monthly Dispatch Cron + GBP Expiry

**Files:**
- Create: src/app/api/cron/seo-monthly-dispatch/route.ts
- Modify: src/app/api/cron/chatbot-demo-expiry/route.ts
- Modify: vercel.json

- [ ] **Step 1: Create monthly dispatch cron**

GET handler: Verify CRON_SECRET. Query all active seo_configs (select id, url, client join for company_name). Construct base URL from process.env.NEXT_PUBLIC_SITE_URL (e.g. "https://ophidianai.com"). For each config: fetch(`${baseUrl}/api/admin/seo/configs/${id}/run`, { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.CRON_SECRET } }). Don't await responses (fire-and-forget fan-out). After dispatching: send Eric a summary email via Resend listing client names and dispatch count ("SEO Monthly Audit: Dispatched audits for N clients: ClientA, ClientB, ..."). Return { dispatched: count }.

- [ ] **Step 2: Add GBP draft expiry to chatbot cron**

In the existing chatbot-demo-expiry cron handler, add after the demo expiry logic:
```
await supabase.from("seo_gbp_drafts").update({ status: "expired" }).eq("status", "draft").lt("expires_at", new Date().toISOString());
```

- [ ] **Step 3: Add cron schedule to vercel.json**

Add to the "crons" array:
{ "path": "/api/cron/seo-monthly-dispatch", "schedule": "0 3 1 * *" }

- [ ] **Step 4: Commit**

git add src/app/api/cron/seo-monthly-dispatch/ src/app/api/cron/chatbot-demo-expiry/ vercel.json
git commit -m "feat: add monthly SEO audit dispatcher cron and GBP draft expiry"

---

## Phase 5: Dashboard Pages

### Task 17: Admin SEO Dashboard

**Files:**
- Create: src/app/dashboard/admin/seo/page.tsx
- Create: src/app/dashboard/admin/seo/new/page.tsx
- Create: src/app/dashboard/admin/seo/[id]/page.tsx
- Modify: src/components/dashboard/sidebar.tsx

- [ ] **Step 1: Add SEO to admin sidebar**

Add "SEO Automation" with Search icon (from lucide-react) to admin section of sidebar.tsx. Link to /dashboard/admin/seo. Follow the chatbot sidebar pattern.

- [ ] **Step 2: Create admin overview page**

Server component with client-side data fetching. Fetch all configs from /api/admin/seo/configs. Render table: Client, URL, Tier badge, Keywords count, Last Audit date, Overall Score, "Run Now" button, View link. "New Config" button linking to /dashboard/admin/seo/new. Follow pattern from src/app/dashboard/admin/chatbot/page.tsx.

- [ ] **Step 3: Create new config form page**

Form fields: url, client_id (dropdown from clients), tier (select), target_keywords (comma-separated text input), competitors (repeatable name+url fields), industry, location, gbp_url, delivery_email. On submit: POST to /api/admin/seo/configs. Follow pattern from src/app/dashboard/admin/chatbot/new/page.tsx.

- [ ] **Step 4: Create per-client detail page**

Fetch config + analytics (last 90 days). Display: config summary card, score trend chart (Recharts line chart, 6 score dimensions over time), latest rankings table, issues list, GBP drafts list, reports archive with download links. "Run Now" button with rate limit UX (disabled + toast). Follow pattern from src/app/dashboard/admin/chatbot/[id]/page.tsx.

- [ ] **Step 5: Commit**

git add src/app/dashboard/admin/seo/ src/components/dashboard/sidebar.tsx
git commit -m "feat: add admin SEO dashboard pages"

---

### Task 18: Client SEO Dashboard

**Files:**
- Create or modify: src/app/dashboard/seo/page.tsx (may exist as placeholder or may need to be created)

- [ ] **Step 1: Replace placeholder with real dashboard (or create if it doesn't exist)**

Fetch data from /api/seo/dashboard. Render:
- Score card row: 6 category scores with color indicators (1-2 red, 3 yellow, 4-5 green) + trend arrows vs previous month
- Rankings table: keyword, position tier badge, change arrow, AI Overview badge, best competitor position
- Issues list: prioritized by severity, clickable status tags
- Reports archive: monthly PDF links
- GBP drafts (if Growth/Pro): draft content preview + "Approve" button that calls /api/seo/gbp-drafts/[id]/approve
- AI insights (if Pro): rendered narrative text

Use existing page structure (ModuleGuard, useDashboard, Recharts) from the current placeholder.

- [ ] **Step 2: Commit**

git add src/app/dashboard/seo/page.tsx
git commit -m "feat: replace SEO dashboard placeholder with live data"

---

## Phase 6: API Documentation

### Task 19: SEO API Docs

**Files:**
- Create: src/app/docs/seo-api/layout.tsx
- Create: src/app/docs/seo-api/page.mdx
- Create: src/app/docs/seo-api/rest-api/page.mdx
- Create: src/app/docs/seo-api/keywords/page.mdx

- [ ] **Step 1: Create docs layout**

Sidebar nav: Getting Started, REST API, Keyword Discovery API. Follow pattern from src/app/docs/chatbot-api/layout.tsx. Label: "SEO API".

- [ ] **Step 2: Create Getting Started page (MDX)**

What the SEO product does. How to read your dashboard. What the 6 scores mean (on-page, technical, content, local, speed, AI visibility). How to interpret rank tiers. Report frequency. GBP draft workflow.

- [ ] **Step 3: Create REST API reference (MDX)**

Authentication: Supabase auth (same as dashboard login). Endpoints:
- GET /api/seo/dashboard -- current scores and rankings
- GET /api/seo/reports -- report archive with download URLs
- POST /api/seo/gbp-drafts/[id]/approve -- approve a GBP draft
Request/response examples in cURL and JavaScript.

- [ ] **Step 4: Create Keyword Discovery API page (MDX)**

POST /api/seo/keywords/discover -- find longtail keywords for a topic + location
POST /api/seo/keywords/check-rank -- check keyword ranking for a URL
Rate limits. Request/response examples.

- [ ] **Step 5: Create FAQ page (MDX)**

Common questions: What do the scores mean? How are rankings tracked (directional visibility tiers, not exact positions)? How often are reports generated? Can I run an audit on demand? How does GBP draft approval work? What is AI Visibility?

- [ ] **Step 6: Commit**

git add src/app/docs/seo-api/
git commit -m "feat: add SEO API documentation pages"

---

## Phase 7: Integration + Deploy

### Task 20: Build + Smoke Test + Deploy

- [ ] **Step 1: Run npm run build**

Run in engineering/projects/ophidian-ai. Fix any TypeScript or build errors.

- [ ] **Step 2: Verify database tables exist**

SEO tables should already exist from Task 2. Verify with:
npx supabase db query --linked "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'seo_%';"
Expected: seo_configs, seo_audits, seo_rankings, seo_gbp_drafts. If missing, run: npx supabase db push

- [ ] **Step 3: Commit all changes and push**

git add -A
git commit -m "feat: SEO Automation product - complete implementation"
git push

Wait ~95 seconds for Vercel deployment. Verify with: vercel ls (check for new Ready deployment on ophidianai/ophidianai project).

- [ ] **Step 4: Verify key pages return 200**

Check: /dashboard/admin/seo, /docs/seo-api, /api/seo/keywords/discover (POST with auth)

- [ ] **Step 5: Update Iris repo submodule**

In Iris repo root:
git add engineering/projects/ophidian-ai
git commit -m "feat: update ophidian-ai submodule with SEO Automation product"

---

## Post-Launch Tasks (Future)

Deferred and not part of the initial implementation:

- [ ] SerpApi integration for precise rank positions (at 3+ SEO clients)
- [ ] Google Search Console API integration (when clients grant access)
- [ ] Content freshness with traffic-based signals (requires GSC)
- [ ] GBP API posting (requires per-business OAuth)
- [ ] AI-powered content refresh recommendations (Pro tier enhancement)
