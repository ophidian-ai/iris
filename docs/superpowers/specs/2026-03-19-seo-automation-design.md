# SEO Automation -- Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

Monthly automated SEO auditing, rank tracking, competitor analysis, AEO/GEO optimization, and GBP syncing sold as a standalone product or as part of the Search Visibility Bundle (discounted when paired with Content Generation). Extends the existing seo-audit skill into a recurring, per-client automated service with dashboard reporting.

### Key Decisions

- **Product structure:** Standalone or bundled with Content Generation at discount. Shared keyword engine and GBP sync pipeline between products.
- **Rank tracking:** Firecrawl search for v1. Upgrade to SerpApi when 3+ SEO clients justify the cost.
- **AEO/GEO:** Tiered depth -- structured data (Essentials), monitoring + optimization (Growth), full strategy (Pro).
- **Report delivery:** Email PDF + live dashboard for all tiers. AI-written insights for Pro only.
- **Fixes:** All tiers get fixes implemented. Pro gets full SEO management.

---

## Tier Structure

### A La Carte

- Setup: $400
- Monthly: $299/mo

### Within Platform Tiers / Search Visibility Bundle

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

15-20% discount when SEO Automation + Content Generation purchased together. AEO/GEO depth follows the tier level.

---

## Architecture

```
Monthly Cycle (cron: 1st of month at 3am ET, or manual trigger)
  |-- Per-client SEO profile (Supabase: seo_configs table)
  |-- Site Audit (existing seo-audit skill, extended)
  |     |-- Technical: page speed, mobile, crawl errors, HTTPS, sitemap
  |     |-- On-page: titles, meta, headings, content quality
  |     |-- Local: GBP presence, NAP consistency, reviews
  |     |-- AEO/GEO: schema markup, Q&A structure, AI Overview presence
  |-- Rank Tracking
  |     |-- Firecrawl search for each target keyword (v1)
  |     |-- Compare vs previous month (stored in Supabase: seo_rankings)
  |     |-- Competitor rank check for same keywords
  |-- Content Freshness Scan (Growth/Pro)
  |     |-- Check publish dates on client blog posts
  |     |-- Flag pages older than 6 months with declining traffic
  |-- GBP Sync (Growth/Pro)
  |     |-- Pull latest blog post from client site
  |     |-- AI summarize to 1500 chars with keyword alignment
  |     |-- Stage as GBP update draft for approval
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
        |-- Notification to Eric: summary of all audits, declining scores flagged
```

### Shared Infrastructure (Used by Content Generation)

- **Keyword engine:** Longtail keyword discovery, "People also search" mining via Firecrawl
- **GBP sync pipeline:** Summarize content -> format for GBP -> stage for approval
- **Content freshness scanner:** Check publish dates, flag stale pages

---

## Data Model

### New Supabase Tables

#### seo_configs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| client_id | uuid, FK -> clients | |
| tier | enum: essentials, growth, pro | |
| website_url | text NOT NULL | Client's website URL |
| keywords | text[] | Target keywords to track |
| competitors | jsonb[] | Array of { name, url } |
| gbp_url | text, nullable | Google Business Profile URL |
| delivery_email | text NOT NULL | Where to send monthly reports |
| keyword_limit | int | 5/15/30 by tier |
| competitor_limit | int | 2/5/10 by tier |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### seo_audits

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> seo_configs | |
| date | date NOT NULL | |
| overall_score | int | 0-100 |
| scores | jsonb | `{ technical, onPage, content, local, speed, aiVisibility }` each 0-100 |
| issues | jsonb[] | Array of `{ category, severity, title, description, recommendation, status }` |
| report_pdf_url | text, nullable | Vercel Blob URL for PDF |
| ai_insights | text, nullable | Pro tier AI narrative |
| created_at | timestamptz | |

#### seo_rankings

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> seo_configs | |
| date | date NOT NULL | |
| keyword | text NOT NULL | |
| position | text | "top-5", "top-10", "top-20", "top-50", "not-found" (v1 granularity) |
| ai_overview_present | boolean, default false | Whether client appears in AI Overview for this keyword |
| competitor_positions | jsonb | `{ "competitor-name": "top-10", ... }` |
| created_at | timestamptz | |

UNIQUE constraint on (config_id, date, keyword).

#### seo_gbp_drafts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> seo_configs | |
| content | text NOT NULL | GBP update text (max 1500 chars) |
| source_url | text, nullable | Blog post URL it was generated from |
| status | enum: draft, approved, posted, expired | |
| expires_at | timestamptz | 14 days after creation |
| created_at | timestamptz | |
| updated_at | timestamptz | |

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

- `POST /api/seo/keywords/discover` -- Longtail keyword discovery for a topic + location
- `POST /api/seo/keywords/check-rank` -- Check ranking for a keyword + URL via Firecrawl

---

## Dashboard UI

### Admin View (`/dashboard/admin/seo`)

- All SEO clients at a glance: table with client name, overall score, trend arrow, keywords tracked, last audit date
- "New SEO Config" button
- Config form: URL, target keywords, competitors, tier, GBP URL, delivery email

### Client View (`/dashboard/seo`)

- **Score card row:** 6 category scores (technical, on-page, content, local, speed, AI visibility) with color indicators + trend vs last month
- **Rankings table:** Keyword, current position, change since last month, AI Overview column, best competitor position
- **Issues list:** Prioritized by severity, with status (open/fixed/in-progress)
- **Reports archive:** List of monthly PDFs with download links
- **GBP drafts** (Growth/Pro): Staged updates ready for approval
- **AI insights** (Pro): Narrative summary of what changed and what to do next

---

## Report PDF Structure

Extends existing branded PDF report generator:

1. **Header:** OphidianAI branding, client name, report period
2. **Executive summary:** Overall score with trend, top 3 wins, top 3 actions needed
3. **Score card:** 6 categories with gauges/bars, month-over-month arrows
4. **Ranking report:** Table of all tracked keywords with position, change, AI Overview status
5. **Competitor comparison:** Side-by-side ranking table for shared keywords
6. **Issues & recommendations:** Prioritized list with severity, category, and specific fix instructions
7. **Content freshness** (Growth/Pro): Stale pages flagged with refresh recommendations
8. **AI insights** (Pro): Narrative analysis of trends and strategic recommendations
9. **Footer:** Next audit date, contact info, OphidianAI branding

---

## Cron Jobs

### Monthly Audit (`/api/cron/seo-monthly-audit`)

- Schedule: `0 3 1 * *` (1st of month, 3am ET)
- Iterates all active `seo_configs`
- Per client: audit, rank check, freshness scan, GBP draft, report, email, dashboard update
- Estimated runtime: 2-5 minutes per client
- Vercel function timeout: 300s (Fluid Compute)

**No additional crons.** Manual audits triggered via admin dashboard "Run Now" button using the same logic.

### Notifications

- Client: emailed PDF + GBP draft approval notice (Growth/Pro)
- Eric: summary of all audits completed, clients with declining scores flagged

---

## API Documentation

**Location:** `ophidianai.com/docs/seo-api` (MDX pages)

### Sections

1. **Getting Started** -- What SEO Automation does, what's included per tier
2. **Dashboard API** -- `GET /api/seo/dashboard`, `GET /api/seo/reports` with auth, response formats
3. **GBP Drafts** -- How to approve drafts, auto-expiry after 14 days
4. **Keyword Tools** -- `POST /api/seo/keywords/discover`, `POST /api/seo/keywords/check-rank` for clients with API access
5. **Webhooks** (future) -- Notification hooks for audit completion, ranking changes

### Access

- Authenticated clients only (Supabase auth)
- Scoped to own data via RLS

---

## Security & Constraints

### Auth

- Admin endpoints: Supabase auth, `profile.role = 'admin'`
- Client endpoints: Supabase auth, RLS scoped to client's `seo_configs`
- GBP draft approval: client auth only

### Rate Limits

- Manual audit trigger: max 1 per client per day
- Keyword discovery: max 20 queries per call

### Firecrawl Usage per Client per Month

| Tier | Site scrape | Keyword searches | Competitor searches | Total calls |
|------|------------|-----------------|-------------------|-------------|
| Essentials | 1 | 5 | 10 (5 kw x 2 comp) | ~16 |
| Growth | 1 | 15 | 75 (15 kw x 5 comp) | ~91 |
| Pro | 1 | 30 | 300 (30 kw x 10 comp) | ~331 |

At 10 clients: monitor Firecrawl usage against plan limits.

### Upgrade Path

- Firecrawl -> SerpApi when rank precision needed (3+ SEO clients)
- Google Search Console API integration when clients grant access (free, more accurate)

### Data Constraints

- Rankings stored monthly (one snapshot per keyword per month)
- Audit history retained indefinitely
- GBP drafts expire after 14 days if not approved

---

## Dependencies

- **Firecrawl** (existing) -- Site scraping, keyword rank checking
- **Supabase** (existing) -- Config, audits, rankings, GBP drafts, auth, RLS
- **Resend** (existing) -- Report email delivery
- **PDF report generator** (existing) -- Branded PDF generation
- **seo-audit skill** (existing) -- Extended for recurring monthly use
- **AI SDK** (existing from chatbot) -- AI insights generation for Pro tier
- **Vercel Blob** -- PDF report storage
- **Next.js 16** (existing) -- App router, API routes, MDX for docs
