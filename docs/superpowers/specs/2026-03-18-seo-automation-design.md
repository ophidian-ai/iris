# SEO Automation -- Design Spec

**Date:** 2026-03-18
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

Automated SEO product that extends the existing seo-audit skill into a recurring client-deliverable reporting, optimization, and rank tracking platform. Part of the **Search Visibility** umbrella -- shared infrastructure with Content Generation (designed separately). Covers traditional SEO, AEO (AI Engine Optimization), and GEO (Generative Engine Optimization).

### Key Decisions

- **Product positioning:** Search Visibility Automation -- SEO + AEO + GEO, not just traditional SEO
- **Two standalone products, shared engine:** SEO Automation and Content Generation are separate products with own pricing. They share a keyword engine, content pipeline, and GBP sync. Bundle discount: 15% for Essentials, 20% for Growth/Pro.
- **Fixes at all tiers:** Every tier gets fixes implemented, not just reports. Full SEO management is the Pro differentiator.
- **AEO/GEO tiered by depth:** Essentials: structured data. Growth: monitoring + optimization. Pro: full strategy + content.
- **Rank tracking:** Firecrawl v1 (directional estimates: "top-3/10/20/not-found"), upgrade to SerpApi at 3+ clients for precise positions. Reports and dashboard frame rank data as visibility tiers, not exact positions.
- **Report delivery:** Email PDF + live dashboard for all tiers. AI-written insights for Pro only.
- **Blog + GBP loop:** Auto-generate GBP update copy from blog content with keyword alignment (Growth/Pro). Copy is staged for client to post manually. No GBP API integration (requires per-business OAuth -- deferred until scale justifies).
- **A la carte features:** Standalone $299/mo purchase gets Growth-tier features.
- **Clients table:** The existing `clients` table in Supabase (uuid PK, profile_id FK) is referenced by seo_configs.client_id. No new clients table needed.

---

## Tier Structure

### A La Carte

- Setup: $400
- Monthly: $299/mo
- Feature scope: Growth-tier features (15 keywords, 5 competitors, monitoring + optimization AEO/GEO, auto GBP drafts, content freshness alerts)

### Within Platform Tiers and Search Visibility Bundle

| Feature | Essentials | Growth | Pro |
|---------|-----------|--------|-----|
| Monthly audit + PDF report | Yes | Yes | Yes |
| Live dashboard | Yes | Yes | Yes |
| Keyword tracking | 5 keywords | 15 keywords | 30 keywords |
| Competitor tracking | 2 competitors | 5 competitors | 10 competitors |
| AEO/GEO | Structured data (schema) | Monitoring + optimization | Full strategy + content |
| GBP sync | Manual (we provide copy) | Auto-generate from blogs | Auto + ongoing optimization |
| Fixes implemented | Fixes | Fixes + optimization | Full SEO management |
| Content freshness alerts | No | Yes (flags stale pages) | Yes + auto-refresh recommendations |
| AI-written insights | No | No | Yes (monthly narrative summary) |

### Search Visibility Bundle

Discount when purchasing SEO Automation + Content Generation together: 15% for Essentials bundle, 20% for Growth/Pro bundles. AEO/GEO depth follows the tier level of the bundle.

---

## Architecture

```
Monthly Cycle (cron or manual trigger)
  |-- Per-client SEO profile (Supabase: seo_configs table)
  |-- Site Audit (existing seo-audit skill, extended)
  |     |-- Technical: page speed, mobile, crawl errors, HTTPS, sitemap
  |     |-- On-page: titles, meta, headings, content quality
  |     |-- Local: GBP presence, NAP consistency, reviews
  |     |-- AEO/GEO: schema markup, Q&A structure, AI Overview presence
  |-- Rank Tracking
  |     |-- Firecrawl search for each target keyword (v1)
  |     |-- Compare vs previous month (stored in Supabase: seo_rankings table)
  |     |-- Competitor rank check for same keywords
  |-- Content Freshness Scan (Growth/Pro)
  |     |-- Check publish dates on client blog posts
  |     |-- Flag pages older than 6 months for refresh
  |-- GBP Copy Generation (Growth/Pro)
  |     |-- Pull latest blog post from client site
  |     |-- AI summarize to 1500 chars with keyword alignment
  |     |-- Stage as GBP update draft for client to copy-paste into GBP
  |-- Report Generation
  |     |-- Score card (overall health + trend vs last month)
  |     |-- Ranking changes (up/down/new/lost)
  |     |-- Competitor comparison table
  |     |-- Top recommended actions (prioritized by impact)
  |     |-- AI insights narrative (Pro only)
  |     |-- Branded PDF via existing report generator
  |-- Delivery
        |-- Email PDF to client via Resend
        |-- Update dashboard data in Supabase
```

### Components

- **SEO audit engine** -- Extended from existing `seo-audit` skill. Adds AEO/GEO checks (schema presence, Q&A structure, AI Overview detection) to the existing technical/on-page/local/content/speed scoring.
- **Rank tracker** -- Firecrawl search per keyword, parse results for client URL position. Stores monthly snapshots. Upgrade path to SerpApi for precision.
- **Content freshness scanner** -- Crawls client blog pages, checks publish dates and last-modified headers. Flags pages older than 6 months for refresh. Traffic-based signals deferred until Google Search Console integration.
- **GBP copy generator** -- Pulls latest blog content from client site, AI summarizes to 1500 chars with target keyword alignment, stages as draft. Client copies the text into their own GBP. No GBP API posting (requires per-business OAuth -- deferred). Shared with Content Generation product.
- **Keyword engine** -- Longtail keyword discovery using Firecrawl search ("People also search for" mining). Shared with Content Generation product.
- **Report generator** -- Generates branded PDF reports server-side. PDFs stored in Vercel Blob, URL written to `seo_audits.report_url`. Uses `@react-pdf/renderer` or Puppeteer (already in devDependencies) for server-safe PDF generation. Adds ranking charts, competitor tables, trend arrows to existing report template structure.
- **Dashboard** -- Client-facing view in ophidianai.com with scores, rankings, issues, reports, GBP drafts.

---

## Data Model

### New Supabase Tables

#### seo_configs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| client_id | uuid, FK -> clients | |
| url | text NOT NULL | Client website URL |
| industry | text | For keyword context |
| location | text | City/region for local SEO |
| tier | enum: essentials, growth, pro | |
| target_keywords | text[] | Array of keywords to track |
| competitors | jsonb[] | Array of `{ name, url }` |
| gbp_url | text, nullable | Google Business Profile URL |
| delivery_email | text NOT NULL | Where to send monthly reports |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### seo_audits

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> seo_configs | |
| date | date NOT NULL | Audit date |
| score_onpage | int | 1-5 |
| score_technical | int | 1-5 |
| score_content | int | 1-5 |
| score_local | int | 1-5 |
| score_speed | int | 1-5 |
| score_ai_visibility | int | 1-5 (AEO/GEO). Rubric: 1=no schema, no Q&A structure, not cited in AI Overviews. 2=basic schema only. 3=schema + some Q&A formatting, not cited. 4=schema + Q&A + cited in some AI Overviews. 5=full structured data + cited across multiple AI search engines. |
| issues | jsonb | Array of `{ area, finding, severity, impact, status }` |
| recommendations | jsonb | Prioritized action items |
| ai_insights | text, nullable | Pro tier narrative summary |
| report_url | text, nullable | URL to stored PDF |
| created_at | timestamptz | |

#### seo_rankings

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> seo_configs | |
| date | date NOT NULL | Snapshot date |
| keyword | text NOT NULL | |
| position | text | "top-3", "top-10", "top-20", "not-found" (Firecrawl v1) |
| ai_overview | boolean, default false | Whether client appears in AI Overview for this keyword |
| competitor_positions | jsonb, nullable | `{ "Competitor Name": "top-10", ... }` |
| created_at | timestamptz | |
| UNIQUE | (config_id, date, keyword) | One snapshot per keyword per month |

#### seo_gbp_drafts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> seo_configs | |
| source_url | text | Blog post URL the draft was generated from |
| content | text NOT NULL | 1500 char GBP update text |
| keywords_used | text[] | Keywords aligned in the draft |
| status | enum: draft, approved, expired | |
| expires_at | timestamptz | 14 days after creation |
| created_at | timestamptz | |

---

## API Design

### Client-Facing (Auth-Protected, Scoped to Own Data)

- `GET /api/seo/dashboard` -- Current scores, rankings, issues for the logged-in client
- `GET /api/seo/reports` -- List of monthly report PDFs with download URLs
- `POST /api/seo/gbp-drafts/[id]/approve` -- Approve a staged GBP update

### Admin Endpoints

- `GET /api/admin/seo/configs` -- List all SEO client configs
- `POST /api/admin/seo/configs` -- Create new SEO config
- `PATCH /api/admin/seo/configs/[id]` -- Update config (keywords, competitors, tier)
- `DELETE /api/admin/seo/configs/[id]` -- Deactivate
- `POST /api/admin/seo/configs/[id]/run` -- Trigger manual audit for a specific client
- `GET /api/admin/seo/analytics/[id]` -- Audit history, ranking trends, report archive

### Shared Infrastructure Endpoints (Used by Content Generation)

- `POST /api/seo/keywords/discover` -- Longtail keyword discovery for a topic + location. Uses Firecrawl search to mine "People also search for" results. Returns array of keyword suggestions with estimated competition level.
- `POST /api/seo/keywords/check-rank` -- Check ranking for a keyword + URL via Firecrawl search. Returns position tier and whether AI Overview includes the URL.

---

## Dashboard UI

### Admin View (`/dashboard/admin/seo`)

- All SEO clients at a glance: table with client name, overall score, trend arrow, keywords tracked, last audit date
- "New SEO Config" button
- Config form: URL, target keywords, competitors, tier, GBP URL, delivery email

### Client View (`/dashboard/seo`)

Replaces existing placeholder page:

- **Score card row:** 6 category scores (on-page, technical, content, local, speed, AI visibility) with color indicators + trend vs last month
- **Rankings table:** Keyword, current position, change since last month, AI Overview presence, best competitor position
- **Issues list:** Prioritized by severity, with status (open/fixed/in-progress)
- **Reports archive:** List of monthly PDFs with download links
- **GBP drafts** (Growth/Pro): Staged updates ready for approval
- **AI insights** (Pro): Narrative summary of what changed and what to do next

---

## Cron Jobs

### Monthly Audit Dispatcher (`/api/cron/seo-monthly-dispatch`)

- Schedule: 1st of each month at 3am ET (`0 3 1 * *`)
- Queries all active `seo_configs`
- For each config: sends a POST request to `/api/admin/seo/configs/[id]/run` (fan-out pattern)
- Each client audit runs as its own function invocation with its own timeout budget
- Dispatcher function is lightweight (~5 seconds), no timeout risk regardless of client count
- After dispatching: sends Eric a summary notification listing which clients were queued

### Per-Client Audit Worker (`/api/admin/seo/configs/[id]/run`)

- Handles a single client audit end-to-end
- Run audit, check rankings, scan freshness, generate GBP draft, build report, store PDF in Vercel Blob, email PDF, update dashboard
- Estimated runtime: 2-5 minutes per client
- Vercel function timeout: 300s (Fluid Compute)
- Called by: monthly dispatcher cron OR manual "Run Now" button on admin dashboard

### Manual Trigger

- "Run Now" button on admin dashboard calls `POST /api/admin/seo/configs/[id]/run`
- Same logic as cron worker, single client
- Button disabled after trigger with toast: "Audit running. Results will appear in ~5 minutes."
- Rate limited: max 1 per client per day. On 429: toast "Audit already ran today. Next available tomorrow."

### GBP Draft Expiry

- Added to the existing daily chatbot demo expiry cron (`/api/cron/chatbot-demo-expiry`, runs daily at 6am ET)
- Query: `UPDATE seo_gbp_drafts SET status = 'expired' WHERE status = 'draft' AND expires_at < NOW()`
- No separate cron needed

---

## API Documentation

**Location:** `ophidianai.com/docs/seo-api` (MDX pages in Next.js app)

### Sections

1. **Getting Started** -- What the SEO product does, how to read your dashboard, what the scores mean
2. **Dashboard Guide** -- Walkthrough of each dashboard section, what the metrics mean, how to interpret trends
3. **REST API Reference** -- For clients who want programmatic access:
   - `GET /api/seo/dashboard` -- Current scores and rankings
   - `GET /api/seo/reports` -- Report archive
   - `POST /api/seo/gbp-drafts/[id]/approve` -- Approve GBP draft
   - Authentication: same Supabase auth as dashboard
   - Request/response examples (cURL + JavaScript)
4. **Keyword Discovery API** -- For clients and internal use:
   - `POST /api/seo/keywords/discover` -- Find longtail keywords
   - `POST /api/seo/keywords/check-rank` -- Check keyword ranking
5. **FAQ** -- Common questions about scores, ranking methodology, report frequency

### Access

- Dashboard guide: public
- API reference: authenticated clients only
- Keyword endpoints: authenticated (rate limited)

---

## Security + Constraints

### Auth

- Admin endpoints: Supabase auth, `profile.role = 'admin'`
- Client endpoints: Supabase auth, RLS scoped to client's own `seo_configs`
- GBP draft approval: client auth only (no anon access)

### Rate Limits

- Manual audit trigger: max 1 per client per day
- Keyword discovery: max 20 queries per call

### Data Constraints

- Rankings stored monthly (one snapshot per keyword per month)
- Audit history retained indefinitely
- GBP drafts expire after 14 days if not approved

### Firecrawl Usage

Per client per month (one search call per keyword returns both client and competitor positions from the same results):

- Essentials: ~1 scrape + 5 keyword searches = ~6 Firecrawl calls
- Growth: ~1 scrape + 15 keyword searches = ~16 Firecrawl calls
- Pro: ~1 scrape + 30 keyword searches = ~31 Firecrawl calls
- At 10 Pro clients: ~310 Firecrawl calls/month. Monitor against plan limits.

### Upgrade Path

- Firecrawl -> SerpApi when 3+ SEO clients (precise rank positions, SERP feature tracking)
- Add Google Search Console API when clients grant access (free, more accurate data)

---

## Dependencies

- **Firecrawl** (existing) -- Site scraping, keyword rank checking, longtail discovery
- **Existing seo-audit skill** -- Core audit logic, extended with AEO/GEO checks
- **Vercel Blob** (`@vercel/blob`) -- PDF report storage. Reports generated server-side, stored in Blob, URL saved to `seo_audits.report_url`.
- **Resend** (existing) -- Monthly report email delivery
- **Supabase** (existing) -- Config storage, audit results, rankings, GBP drafts, auth
- **AI SDK + AI Gateway** (existing) -- GBP draft generation, AI insights (Pro tier)
- **Next.js 16** (existing) -- App router, API routes, MDX for docs
