# Website Revenue Leak Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated website analysis tool that scans any URL, translates technical issues into estimated revenue loss, and serves as both an inbound lead magnet on ophidianai.com and a backend enrichment engine for the cold email outreach pipeline.

**Architecture:** API-first scan engine (`/api/scan`) with four analysis modules (speed, SEO, mobile, trust). Results stored in Supabase for the inbound web tool and as local files for the outreach pipeline. Two frontends consume the same API: a public tool page at `/tools/website-checkup` with email-gated reports, and Iris/outreach skills that call the API programmatically.

**Tech Stack:** Next.js 16 (App Router), Supabase (data persistence), Resend (transactional email), PageSpeed Insights API (speed/mobile), Firecrawl (scraping), Upstash Redis (rate limiting), Puppeteer (PDF generation via HTML template), Tailwind CSS 4.

**Prerequisites:** Task 14 (env vars) MUST be completed before Tasks 4-9. The scan modules require `GOOGLE_PSI_API_KEY` and `FIRECRAWL_API_KEY` at runtime.

**Spec:** `docs/superpowers/specs/2026-03-19-website-revenue-leak-tool-design.md`

**Codebase:** All work happens in the `engineering/projects/ophidian-ai/` submodule (the ophidianai.com Next.js project). Paths below are relative to that submodule root.

**Testing note:** No test framework is currently configured in the project. Each task includes manual verification steps. A future task can add Vitest if automated testing becomes a priority.

---

## File Map

### New Files

```
src/lib/scan/
  types.ts              -- TypeScript types for scan results, findings, modules
  benchmarks.ts         -- Industry benchmarks, city populations, order values
  revenue.ts            -- Revenue impact calculation from findings
  modules/
    speed.ts            -- PageSpeed Insights API integration
    seo.ts              -- Firecrawl scrape + HTML parsing for SEO signals
    mobile.ts           -- Mobile experience checks (PSI mobile + viewport)
    trust.ts            -- SSL, contact info, GBP presence via Firecrawl
  engine.ts             -- Orchestrator: runs all modules, handles timeouts, scores
  cache.ts              -- URL-hash caching layer (Supabase lookup)

src/app/api/scan/
  route.ts              -- POST endpoint with rate limiting and auth

src/app/tools/website-checkup/
  page.tsx              -- Public tool page (URL input, scan flow, email gate)

src/app/report/[id]/
  page.tsx              -- Interactive report page (reads from Supabase)

src/components/scan/
  ScanForm.tsx          -- URL input form with honeypot and validation
  ScanProgress.tsx      -- Loading state with per-module progress
  ScoreReveal.tsx       -- Animated headline score + revenue leak number
  EmailGate.tsx         -- Email capture form (shown after score reveal)
  ReportView.tsx        -- Full report renderer (module cards, findings, benchmarks)
  ModuleCard.tsx        -- Individual module score card (grade, findings list)
  FindingRow.tsx        -- Single finding with severity, description, revenue impact
  QuickWins.tsx         -- Top 3 quick wins section
  CTASection.tsx        -- "Book a free call" CTA block

src/lib/scan/
  report-pdf.ts         -- HTML template rendering + Puppeteer PDF generation
  report-template.html  -- Branded HTML template for PDF output

src/lib/supabase/
  admin.ts              -- Service-role Supabase client for API route writes

src/emails/
  scan-report.tsx       -- React Email template for confirmation email

src/app/api/scan/[id]/
  pdf/route.ts          -- GET endpoint returning PDF report
  email/route.ts        -- POST endpoint triggering confirmation email

supabase/migrations/
  XXXXXX_create_scans_table.sql  -- Supabase migration for scans table
```

### Modified Files

```
.env.local              -- Add GOOGLE_PSI_API_KEY, SCAN_API_KEY
```

### Outreach Skill Updates (Iris repo, not submodule)

```
.claude/skills/outreach-pipeline/SKILL.md   -- Add scan step to pipeline
.claude/skills/offer-delivery/SKILL.md      -- Reference scan PDF as deliverable
.claude/skills/prospect-scoring/SKILL.md    -- Add scan score as scoring input
.claude/skills/follow-up-email/SKILL.md     -- Add scan findings as FU angle
.claude/skills/cold-email-outreach/SKILL.md -- Reference report as the offer
```

---

## Task 1: Supabase Migration -- Scans Table

**Files:**
- Create: `supabase/migrations/XXXXXX_create_scans_table.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Create scans table for storing website analysis results
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  scan_id text unique not null,
  url text not null,
  url_hash text not null,
  email text,
  score integer,
  grade text,
  results_json jsonb not null default '{}'::jsonb,
  status text not null default 'completed',
  scanned_at timestamptz default now() not null,
  viewed_at timestamptz,
  created_at timestamptz default now() not null
);

-- Index for cache lookups by URL hash
create index idx_scans_url_hash on public.scans (url_hash);

-- Index for report page lookups
create index idx_scans_scan_id on public.scans (scan_id);

-- Index for finding recent scans (cache TTL check)
create index idx_scans_url_hash_created on public.scans (url_hash, created_at desc);

-- RLS: public read for report pages, service role for writes
alter table public.scans enable row level security;

create policy "Public can read scans by scan_id"
  on public.scans for select
  using (true);

create policy "Service role can insert scans"
  on public.scans for insert
  with check (true);

create policy "Service role can update scans"
  on public.scans for update
  using (true);
```

- [ ] **Step 2: Generate migration file with timestamp**

Run: `cd engineering/projects/ophidian-ai && npx supabase migration new create_scans_table`

Copy the SQL into the generated file.

- [ ] **Step 3: Apply migration locally**

Run: `npx supabase db push`

Verify: Check Supabase dashboard -- `scans` table should exist with all columns and indexes.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat(scan): add scans table migration"
```

---

## Task 2: Scan Types

**Files:**
- Create: `src/lib/scan/types.ts`

- [ ] **Step 1: Write the type definitions**

Define all TypeScript types matching the spec output schema:
- `ScanResult` -- top-level result with `scan_id`, `url`, `scanned_at`, `overall_score`, `overall_grade`, `estimated_monthly_leak`, `modules`, `findings`, `top_quick_wins`, `industry_benchmarks`
- `ModuleResult` -- per-module with `score`, `grade`, `status` (`ok` | `unavailable`), `error`, `findings`
- `Finding` -- individual finding with `id`, `module`, `severity` (`critical` | `moderate` | `minor`), `title`, `description`, `revenue_impact`, `benchmark`, `quick_win`
- `ModuleName` -- union type: `speed` | `seo` | `mobile` | `trust`
- `ScanInput` -- `{ url: string; city_population?: number; industry?: string }`
- `IndustryBenchmarks` -- `{ avg_load_time: number; mobile_friendly_pct: number; gbp_presence_pct: number }`

Also export a `scoreToGrade` helper function:
```typescript
export function scoreToGrade(score: number | null): string {
  if (score === null) return '-';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd engineering/projects/ophidian-ai && npx tsc --noEmit src/lib/scan/types.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/scan/types.ts
git commit -m "feat(scan): add TypeScript types for scan engine"
```

---

## Task 3: Benchmarks & Revenue Calculation

**Files:**
- Create: `src/lib/scan/benchmarks.ts`
- Create: `src/lib/scan/revenue.ts`

- [ ] **Step 1: Write benchmarks data**

`benchmarks.ts` exports:
- `CITY_TIERS` -- array of `{ label, maxPopulation, baseVisitors }` matching spec (Small < 25k = 200, Medium < 100k = 500, Large = 1500)
- `INDUSTRY_MULTIPLIERS` -- map of industry name to multiplier (Restaurants 1.5, Home Services 1.0, Auto Services 0.8, Professional Services 0.6, Health/Wellness 1.2, default 1.0)
- `AVG_ORDER_VALUES` -- map of industry to average order value in dollars (Restaurants $35, Home Services $250, Auto Services $150, Professional Services $200, Health/Wellness $100, default $150)
- `INDUSTRY_BENCHMARKS` -- the `IndustryBenchmarks` object with `avg_load_time: 3.2`, `mobile_friendly_pct: 87`, `gbp_presence_pct: 72`
- `SEVERITY_WEIGHTS` -- map of severity to conversion impact multiplier (critical: 0.15, moderate: 0.07, minor: 0.03)
- `CITY_POPULATIONS` -- static lookup of ~500 US cities (name -> population). Include all Indiana cities + top 200 US cities. Source: US Census Bureau 2020 data, hardcoded as a `Record<string, number>`.
- `estimateMonthlyVisitors(cityPopulation: number, industry: string): number` -- looks up city tier, applies industry multiplier

- [ ] **Step 2: Write revenue calculation**

`revenue.ts` exports:
- `calculateFindingRevenue(finding: { severity: string }, monthlyVisitors: number, industry: string): number` -- calculates dollar impact for one finding using: `monthlyVisitors * SEVERITY_WEIGHTS[severity] * AVG_ORDER_VALUES[industry]`
- `calculateTotalLeak(findings: Finding[], monthlyVisitors: number, industry: string): number` -- sums all finding revenue impacts
- `pickQuickWins(findings: Finding[], topN: number): string[]` -- returns finding IDs sorted by revenue_impact descending, limited to `topN`, filtering for `quick_win === true` first

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit src/lib/scan/benchmarks.ts src/lib/scan/revenue.ts`

- [ ] **Step 4: Commit**

```bash
git add src/lib/scan/benchmarks.ts src/lib/scan/revenue.ts
git commit -m "feat(scan): add industry benchmarks and revenue calculation"
```

---

## Task 4: Speed Module

**Files:**
- Create: `src/lib/scan/modules/speed.ts`

- [ ] **Step 1: Write the speed module**

Exports `async function analyzeSpeed(url: string): Promise<ModuleResult>`

Implementation:
1. Call PageSpeed Insights API: `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&key=${GOOGLE_PSI_API_KEY}&category=performance&strategy=mobile`
2. Extract from response: `lighthouseResult.categories.performance.score` (0-1, multiply by 100), `lighthouseResult.audits` for LCP, CLS, FCP, speed-index, total-blocking-time
3. Generate findings:
   - If performance score < 50: critical finding "Slow Page Speed" with description + benchmark comparison
   - If LCP > 4s: critical "Slow Content Load"
   - If CLS > 0.25: moderate "Layout Shifts"
   - If FCP > 3s: moderate "Slow First Paint"
   - If TBT > 600ms: moderate "Blocked Interactivity"
4. Each finding gets `quick_win: true` if it can be fixed with image optimization or caching (LCP, speed-index)
5. Wrap in a 15-second `AbortController` timeout. On timeout, return `{ score: null, status: 'unavailable', error: 'Timeout', findings: [] }`

Env var: `GOOGLE_PSI_API_KEY` (read from `process.env`)

- [ ] **Step 2: Manual verification**

Temporarily add a test script or use the Next.js API route (Task 8) to call `analyzeSpeed('https://example.com')` and inspect the output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/scan/modules/speed.ts
git commit -m "feat(scan): add speed analysis module (PageSpeed Insights)"
```

---

## Task 5: SEO Module

**Files:**
- Create: `src/lib/scan/modules/seo.ts`

- [ ] **Step 1: Write the SEO module**

Exports `async function analyzeSEO(url: string, html: string): Promise<ModuleResult>`

The `html` parameter is the page content from a shared Firecrawl scrape (fetched once by the orchestrator and passed to all modules that need it). This avoids duplicate scrapes.

Implementation -- parse HTML and check:
1. **Title tag:** Present? Length 30-60 chars? Contains keywords?
   - Missing: critical finding. Too short/long: minor finding.
2. **Meta description:** Present? Length 120-160 chars?
   - Missing: critical. Too short/long: minor.
3. **H1 tag:** Exactly one H1? Contains meaningful text?
   - Missing or multiple: moderate finding.
4. **Image alt text:** Count images without alt attributes.
   - >50% missing: critical. >25% missing: moderate.
5. **Canonical URL:** Present in `<link rel="canonical">`?
   - Missing: minor finding.
6. **Sitemap:** Check if `${origin}/sitemap.xml` returns 200 (quick HEAD request with 3s timeout).
   - Missing: moderate finding, quick_win: true.
7. **Robots.txt:** Check if `${origin}/robots.txt` returns 200.
   - Missing: minor finding.

Score: Start at 100, deduct points per finding (critical: -25, moderate: -15, minor: -5). Floor at 0.

Use a lightweight HTML parser -- `cheerio` or regex for the simple tag checks. Check if cheerio is already in dependencies; if not, use regex (YAGNI -- these are simple tag extractions).

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit src/lib/scan/modules/seo.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/scan/modules/seo.ts
git commit -m "feat(scan): add SEO analysis module (HTML parsing)"
```

---

## Task 6: Mobile Module

**Files:**
- Create: `src/lib/scan/modules/mobile.ts`

- [ ] **Step 1: Write the mobile module**

Exports `async function analyzeMobile(url: string, html: string): Promise<ModuleResult>`

Implementation:
1. Call PageSpeed Insights API with `strategy=mobile` (may reuse data from speed module -- accept optional PSI response as parameter to avoid duplicate API call)
   - Alternative: accept pre-fetched PSI data from orchestrator
2. Check HTML for viewport meta tag: `<meta name="viewport" content="width=device-width">`
   - Missing: critical finding
3. From PSI mobile audits, extract:
   - `viewport`: Is viewport configured?
   - `font-size`: Text too small to read?
   - `tap-targets`: Tap targets sized appropriately?
4. Score: PSI mobile performance score if available, otherwise derive from HTML checks

Since speed module already calls PSI with `strategy=mobile`, the orchestrator should pass the PSI response to both speed and mobile modules to avoid a duplicate API call. Add an optional `psiResponse` parameter.

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit src/lib/scan/modules/mobile.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/scan/modules/mobile.ts
git commit -m "feat(scan): add mobile experience analysis module"
```

---

## Task 7: Trust Module

**Files:**
- Create: `src/lib/scan/modules/trust.ts`

- [ ] **Step 1: Write the trust module**

Exports `async function analyzeTrust(url: string, html: string): Promise<ModuleResult>`

Implementation -- checks from HTML content + URL:
1. **SSL:** Check if `url` starts with `https://`. If not, critical finding.
2. **Contact info visibility:** Search HTML for phone patterns (`\d{3}[-.]?\d{3}[-.]?\d{4}`), email patterns, physical address indicators. Missing all: moderate finding.
3. **Google Business Profile:** Use Firecrawl to search `site:google.com/maps "${businessName}"` (extract business name from page title or H1). If found, check for review count and rating. No GBP: moderate finding.
4. **Social proof indicators:** Check for review/testimonial sections in HTML, trust badges, certifications.
   - No social proof on page: minor finding.

Score: Start at 100, deduct per finding.

GBP search: Wrap in a 5-second timeout. If it fails, skip (don't penalize for our failure to check).

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit src/lib/scan/modules/trust.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/scan/modules/trust.ts
git commit -m "feat(scan): add trust & visibility analysis module"
```

---

## Task 8: Scan Engine Orchestrator

**Files:**
- Create: `src/lib/scan/engine.ts`
- Create: `src/lib/scan/cache.ts`

- [ ] **Step 1: Write the cache layer**

`cache.ts` exports:
- `async function getCachedScan(urlHash: string, maxAgeHours: number): Promise<ScanResult | null>` -- queries Supabase `scans` table for matching `url_hash` where `created_at` is within `maxAgeHours`
- `async function cacheScan(scanResult: ScanResult): Promise<void>` -- inserts into Supabase `scans` table
- `function hashUrl(url: string): string` -- SHA-256 hash of normalized URL (lowercase, strip trailing slash, strip www.)

**Important:** The existing `src/lib/supabase/server.ts` client uses `cookies()` which works in Server Components but may not work in API route handlers. Create a `src/lib/supabase/admin.ts` that uses `SUPABASE_SERVICE_ROLE_KEY` for direct database access in API routes and the cache layer. This bypasses RLS (service role has full access).

- [ ] **Step 2: Write the orchestrator**

`engine.ts` exports `async function runScan(input: ScanInput): Promise<ScanResult>`

Implementation:

Wrap entire function in a 45-second total timeout (`AbortController`). If total timeout fires, return whatever partial results are available.

1. Validate and normalize URL
2. Check cache (24h for default, accept `maxCacheAge` param for outreach's 7-day window)
3. If cache hit, return cached result
4. Generate `scan_id` (nanoid or `crypto.randomUUID()`)
5. Fetch page HTML once via Firecrawl scrape (use `fetch` to call the Firecrawl REST API directly -- no Firecrawl JS SDK in dependencies)
   - **Edge case: site down** -- if Firecrawl returns an error or empty response, return immediately with "Site Unreachable" status, no module scores, and CTA: "Your site appears to be down -- that's the biggest revenue leak possible"
   - **Edge case: parked/placeholder** -- if HTML content is < 500 chars or matches known parking page patterns, flag as "This appears to be a placeholder site"
   - **Edge case: redirect chain** -- Firecrawl follows redirects by default; capture and report the final resolved URL
6. Call PageSpeed Insights API once (mobile strategy) -- pass response to speed + mobile modules
7. Run all 4 modules concurrently with `Promise.allSettled()` + per-module 15s `AbortController`:

   ```typescript
   const [speedResult, seoResult, mobileResult, trustResult] = await Promise.allSettled([
     withTimeout(analyzeSpeed(url, psiData), 15000),
     withTimeout(analyzeSEO(url, html), 15000),
     withTimeout(analyzeMobile(url, html, psiData), 15000),
     withTimeout(analyzeTrust(url, html), 15000),
   ]);
   ```

8. Collect all findings from successful modules
9. Calculate revenue impact per finding using `revenue.ts`
10. Calculate overall score (weighted average of available module scores: speed 30%, seo 25%, mobile 25%, trust 20%)
11. Pick top 3 quick wins
12. Assemble `ScanResult` object (include `scanned_at: new Date().toISOString()`)
13. Cache result in Supabase (use admin client from `src/lib/supabase/admin.ts`)
14. Return result

Helpers:
- `async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>` -- races against a timeout, returns unavailable module result on timeout
- `function detectSiteDown(error: unknown): boolean` -- checks for network errors, 5xx responses
- `function detectParkedDomain(html: string): boolean` -- checks for minimal content or known parking page patterns

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit src/lib/scan/engine.ts`

- [ ] **Step 4: Commit**

```bash
git add src/lib/scan/engine.ts src/lib/scan/cache.ts
git commit -m "feat(scan): add scan orchestrator with caching and timeout handling"
```

---

## Task 9: Scan API Route

**Files:**
- Create: `src/app/api/scan/route.ts`

- [ ] **Step 1: Write the API route**

`POST /api/scan` handler:

1. **Auth check:** If `Authorization: Bearer <key>` header matches `SCAN_API_KEY` env var, skip rate limiting (internal caller). Otherwise, apply public rate limiting.
2. **Rate limiting (public):** Use raw `@upstash/redis` with INCR/EXPIRE commands (follow the existing pattern in `src/lib/chatbot/rate-limit.ts` -- it uses `@upstash/redis` directly, NOT the `@upstash/ratelimit` library). Key: IP address. Limit: 3/hour, 10/day. Use env vars `KV_REST_API_URL` and `KV_REST_API_TOKEN` (already configured).
3. **Input validation:** Parse body as `{ url: string; city_population?: number; industry?: string }`. Validate URL format (must start with `http://` or `https://`). Return 400 if invalid.
4. **Run scan:** Call `runScan(input)` from `engine.ts`
5. **Return:** JSON response with `ScanResult` + appropriate status code.
6. **Error handling:** Catch and return 500 with `{ error: 'Scan failed' }` for unexpected errors. Don't leak internal details.

Config: Export `maxDuration = 60` for Vercel function timeout.

```typescript
export const maxDuration = 60;
```

- [ ] **Step 2: Manual verification**

Start dev server: `npm run dev`
Test with curl:
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Expected: JSON response with scan results (score, findings, modules).

Test rate limiting: Send 4 requests quickly -- 4th should return 429.

Test invalid URL:
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "not-a-url"}'
```

Expected: 400 response.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/scan/route.ts
git commit -m "feat(scan): add POST /api/scan route with rate limiting"
```

---

## Task 10: Report Page (Interactive Web Report)

**Files:**
- Create: `src/app/report/[id]/page.tsx`
- Create: `src/components/scan/ReportView.tsx`
- Create: `src/components/scan/ModuleCard.tsx`
- Create: `src/components/scan/FindingRow.tsx`
- Create: `src/components/scan/QuickWins.tsx`
- Create: `src/components/scan/CTASection.tsx`

- [ ] **Step 1: Write the report page (server component)**

`src/app/report/[id]/page.tsx`:
- Server component that reads `scan_id` from params
- Fetches scan result from Supabase by `scan_id`
- If not found, return 404 (use `notFound()` from next/navigation)
- Generates metadata: `title: "Website Revenue Leak Report | OphidianAI"`, `description` with the score
- Renders `<ReportView result={scanResult} />`
- Track page visit: update `viewed_at` column in Supabase (uses admin client). This drives the "Inbound - Report Viewed" pipeline status.

- [ ] **Step 2: Write ReportView component**

Client component (`'use client'`) that renders the full P.C.P. report structure:
1. **Headline section:** Score number (large), grade badge, estimated monthly leak in dollars, animated count-up on mount
2. **Module breakdown:** 4 `ModuleCard` components in a 2x2 grid
3. **Industry benchmarks:** Comparison table (their value vs industry average)
4. **Revenue impact detail:** List of findings sorted by `revenue_impact` descending
5. **Quick wins:** `QuickWins` component highlighting top 3
6. **CTA:** `CTASection` with "Book a Free 15-Minute Call" button

Design: OphidianAI dark theme (`#0D1B2A` background), module cards with colored grade badges (A/B green, C yellow, D/F red), revenue numbers in venom green (`#39FF14`).

- [ ] **Step 3: Write ModuleCard component**

Renders one module: name, grade badge (colored circle), score bar, list of findings (expandable). Uses `FindingRow` for each finding. Shows "unavailable" state if `status === 'unavailable'`.

- [ ] **Step 4: Write FindingRow component**

Renders one finding: severity badge (red/yellow/gray), title, description, revenue impact in dollars, benchmark comparison. Expandable detail view.

- [ ] **Step 5: Write QuickWins component**

Numbered list of top 3 findings marked as quick wins. Each shows: title, revenue impact, one-line fix suggestion. Designed as a standalone "action items" card.

- [ ] **Step 6: Write CTASection component**

"Want us to fix these for you?" heading + "Book a Free 15-Minute Call" button. Link to Calendly or contact page. Secondary CTA: "Or email us at eric@ophidianai.com". Appears after quick wins section and optionally as a sticky footer on mobile.

- [ ] **Step 7: Verify report renders**

1. Manually insert a test scan result into Supabase `scans` table
2. Navigate to `http://localhost:3000/report/<scan_id>`
3. Verify: all sections render, scores display correctly, mobile responsive, dark theme consistent

- [ ] **Step 8: Commit**

```bash
git add src/app/report/ src/components/scan/
git commit -m "feat(scan): add interactive report page with P.C.P. structure"
```

---

## Task 11: Tool Page (Website Checkup)

**Files:**
- Create: `src/app/tools/website-checkup/page.tsx`
- Create: `src/components/scan/ScanForm.tsx`
- Create: `src/components/scan/ScanProgress.tsx`
- Create: `src/components/scan/ScoreReveal.tsx`
- Create: `src/components/scan/EmailGate.tsx`

- [ ] **Step 1: Write the tool page**

`src/app/tools/website-checkup/page.tsx`:
- Metadata: title "Is Your Website Costing You Customers? | Free Website Checkup | OphidianAI", description targeting SEO keywords
- Minimal layout: no nav distractions (or simplified nav). Centered content.
- Renders `ScanForm` initially. On submission, shows `ScanProgress` -> `ScoreReveal` -> `EmailGate`.
- State machine: `idle` -> `scanning` -> `score_revealed` -> `email_captured` -> `report_ready`

- [ ] **Step 2: Write ScanForm component**

Client component:
- Headline: "Is Your Website Costing You Customers?"
- Subhead: "Enter your URL. Get a free report showing exactly where you're losing revenue -- and how to fix it."
- URL input with validation (must start with http:// or https://, auto-prepend https:// if missing)
- Honeypot field (hidden, named `website` -- if filled, reject silently)
- "Scan My Site" submit button
- Social proof one-liner below: "Trusted analysis built on industry-standard tools"
- On submit: POST to `/api/scan`, transition to `scanning` state

- [ ] **Step 3: Write ScanProgress component**

Client component shown during scan (15-30s):
- Progress indicators per module with animated checkmarks as each completes
- Micro-stats cycling on a timer: "53% of visitors leave if a page takes over 3 seconds to load", "Mobile users are 5x more likely to leave a non-responsive site", "88% of consumers trust online reviews as much as personal recommendations"
- Uses SSE or polling to track progress. Simplest approach: poll the API every 2 seconds, or just show a timed animation since we can't stream individual module completions from a single POST request. Use timed animation (simpler, avoids complexity).

- [ ] **Step 4: Write ScoreReveal component**

Client component shown after scan completes (before email gate):
- Large animated number counting up to the score (use `requestAnimationFrame` or a small counter lib)
- Grade badge (A-F with color)
- Headline: "Your website is leaking an estimated $X,XXX/month"
- Revenue number in venom green, large font
- Subtext: "Enter your email to see the full breakdown and find out how to fix it."
- This is the Perception shift -- shown WITHOUT the email gate

- [ ] **Step 5: Write EmailGate component**

Client component:
- Email input field + "Get My Full Report" button
- On submit via server action: save email to Supabase (update the scan record with email), trigger confirmation email via `/api/scan/[id]/email`, redirect to `/report/[scan_id]`
- Server action also adds the prospect to the Pipeline Google Sheet as "Inbound Lead" status via GWS CLI (call `gws sheets append` with business URL, email, scan score, date, status="Inbound Lead")
- "We'll send a PDF copy to your inbox too."
- Privacy note: "No spam. Just your report."

- [ ] **Step 6: Verify full scan flow**

1. Start dev server
2. Navigate to `/tools/website-checkup`
3. Enter a real URL (e.g., a local business website)
4. Verify: form submits -> progress animation plays -> score reveals with count-up -> email gate appears -> enter email -> redirects to full report page
5. Check Supabase: scan record exists with email

- [ ] **Step 7: Commit**

```bash
git add src/app/tools/ src/components/scan/
git commit -m "feat(scan): add /tools/website-checkup page with scan flow and email gate"
```

---

## Task 12: PDF Report Generation

**Files:**
- Create: `src/lib/scan/report-pdf.ts`
- Create: `src/lib/scan/report-template.html`

- [ ] **Step 1: Write the HTML report template**

`src/lib/scan/report-template.html` -- a standalone HTML file with inline CSS, designed to render as a print-ready PDF via Puppeteer. Uses template placeholders (`{{score}}`, `{{grade}}`, `{{monthlyLeak}}`, etc.) that get replaced at generation time.

Layout:
1. Page 1: Header with OphidianAI logo + "Website Revenue Leak Report" title, URL, date, overall score/grade, estimated monthly leak
2. Page 2: Module breakdown -- 4 cards with scores, grades, key findings per module
3. Page 3: Revenue impact details -- all findings with dollar amounts, sorted by impact
4. Page 4: Quick wins -- top 3 actionable items
5. Page 5: CTA -- "Ready to stop the leak?" + contact info + link to ophidianai.com
6. Footer on every page: "Generated by OphidianAI | ophidianai.com"

Colors: Dark background (#0D1B2A), teal headings (#0DB1B2), venom green for revenue numbers (#39FF14), white text (#F1F5F9).

- [ ] **Step 2: Write PDF generation function**

`src/lib/scan/report-pdf.ts` exports `async function generateReportPDF(result: ScanResult): Promise<Buffer>`

Implementation using Puppeteer (already in devDependencies):
1. Read the HTML template file
2. Replace all template placeholders with actual scan data
3. Launch Puppeteer, load the HTML, render to PDF
4. Return the PDF buffer

Follow the same Puppeteer-based approach used in the existing report generation pipeline. This produces better visual results than hand-drawing with pdf-lib.

- [ ] **Step 3: Add PDF endpoint**

Add a `GET /api/scan/[id]/pdf` route that:
1. Fetches scan result from Supabase by `scan_id`
2. Calls `generateReportPDF(result)`
3. Returns PDF with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="revenue-leak-report.pdf"`

Create: `src/app/api/scan/[id]/pdf/route.ts`

- [ ] **Step 4: Verify PDF generation**

1. Call: `curl http://localhost:3000/api/scan/<scan_id>/pdf -o test-report.pdf`
2. Open `test-report.pdf` -- verify branding, scores, findings render correctly
3. Check: all 5 pages present, colors correct, text readable

- [ ] **Step 5: Commit**

```bash
git add src/lib/scan/report-pdf.ts src/lib/scan/report-template.html src/app/api/scan/
git commit -m "feat(scan): add PDF report generation with OphidianAI branding"
```

---

## Task 13: Confirmation Email (Resend)

**Files:**
- Create: `src/emails/scan-report.tsx`
- Create: `src/app/api/scan/[id]/email/route.ts`

- [ ] **Step 1: Write the React Email template**

`src/emails/scan-report.tsx` using React Email components:
- Subject: "Your Website Revenue Leak Report is Ready"
- Body: OphidianAI branded header, score summary ("Your site scored X/100 -- estimated $X,XXX/mo in lost revenue"), link to full report, quick wins preview (top 3 bullet points), CTA button "View Full Report", footer with OphidianAI contact
- Attach PDF (passed as prop or handled by the sending function)

**Note:** `src/emails/` is a new directory. The `resend` package (v6.9.3) is already installed. Import `Resend` from `resend` and use the `RESEND_API_KEY` env var. No separate `@react-email/*` packages are needed -- use standard React components for the email template (Resend renders them server-side).

- [ ] **Step 2: Write the email trigger endpoint**

`src/app/api/scan/[id]/email/route.ts`:
- POST handler that sends the confirmation email
- Reads scan result from Supabase
- Generates PDF via `generateReportPDF()`
- Sends via Resend with PDF attachment
- Called by the EmailGate component after email capture

Or: implement as a server action called directly from EmailGate (simpler, avoids an extra API route). Decide based on existing patterns in the codebase.

- [ ] **Step 3: Verify email sends**

1. Trigger a scan, enter email at the gate
2. Check inbox: confirmation email arrives with correct branding, score, link to report
3. Verify PDF attachment opens and displays correctly

- [ ] **Step 4: Commit**

```bash
git add src/emails/ src/app/api/scan/
git commit -m "feat(scan): add Resend confirmation email with PDF attachment"
```

---

## Task 14: Environment Variables

**Files:**
- Modify: `.env.local` (local dev)
- Modify: Vercel dashboard (production)

- [ ] **Step 1: Add local env vars**

Add to `.env.local`:
```
GOOGLE_PSI_API_KEY=<get from Google Cloud Console>
SCAN_API_KEY=<generate a random 32-char key for internal API access>
FIRECRAWL_API_KEY=<already exists if Firecrawl is configured>
```

Note: `RESEND_API_KEY` should already be present.

- [ ] **Step 2: Add Vercel env vars**

Run:
```bash
cd engineering/projects/ophidian-ai
vercel env add GOOGLE_PSI_API_KEY
vercel env add SCAN_API_KEY
```

Or add via Vercel dashboard if CLI is not available.

- [ ] **Step 3: Verify Resend DNS**

Check if ophidianai.com is verified as a sending domain in Resend:
1. Log into Resend dashboard
2. Check Domains section
3. If not verified, add the domain and configure DNS records (DKIM, SPF, DMARC)

This is a prerequisite for sending emails from `noreply@ophidianai.com`.

- [ ] **Step 4: Commit .env.example updates if applicable**

If there's a `.env.example` or `.env.local.example`, add the new keys (without values) for documentation.

```bash
git add .env.example
git commit -m "docs: add scan engine env vars to .env.example"
```

---

## Task 15: Outreach Skill Updates

**Files:**
- Modify: `.claude/skills/outreach-pipeline/SKILL.md`
- Modify: `.claude/skills/offer-delivery/SKILL.md`
- Modify: `.claude/skills/prospect-scoring/SKILL.md`
- Modify: `.claude/skills/follow-up-email/SKILL.md`
- Modify: `.claude/skills/cold-email-outreach/SKILL.md`

These are in the Iris repo root (not the ophidian-ai submodule).

- [ ] **Step 1: Update outreach-pipeline**

Add a "Scan" step to the Monday pipeline workflow:
- After "Score" step, before "Draft" step
- Scan runs: call `POST /api/scan` with `Authorization: Bearer ${SCAN_API_KEY}` header
- Store results in `sales/lead-generation/prospects/[slug]/scan/results.json`
- Generate PDF and store at `sales/lead-generation/prospects/[slug]/scan/revenue-leak-report.pdf`
- Log scan score in pipeline tracker (update Pipeline Google Sheet with scan score column and status "Scanned")
- Index scan metadata to Pinecone `ophidianai-kb` index (namespace: `scans`) with fields: `business_name`, `url`, `score`, `grade`, `top_findings`, `industry`, `scanned_at`. This enables cross-prospect queries like "show me all prospects with speed scores under 30"

- [ ] **Step 2: Update offer-delivery**

Add the revenue leak report as a deliverable option:
- When prospect replies "yes," check for pre-generated report at `scan/revenue-leak-report.pdf`
- If exists, deliver it immediately (fastest turnaround)
- If not, fall back to existing deliverable routing (mockup, SEO plan, etc.)

- [ ] **Step 3: Update prospect-scoring**

Add scan score as a scoring factor:
- Site score < 30: +2 points (high pain, hot lead)
- Site score 30-50: +1 point
- Site score > 50: +0 (site is decent, less urgency)
- No scan data: +0 (neutral)

- [ ] **Step 4: Update follow-up-email**

Add scan findings as available FU angles:
- FU1/FU2 can reference specific findings: "Your site loads in X seconds (industry average is Y)"
- Only use if scan data exists for the prospect
- Document as a new angle type alongside existing seasonal/competitor/social proof angles

- [ ] **Step 5: Update cold-email-outreach**

Update the CI1/ALT template guidance to reference the revenue leak report as the offer:
- In the P.S. or closing CTA: "I put together a free revenue leak report for your site -- want me to send it over?"
- This replaces the generic "want me to send some ideas?" CTA
- Templates stay value-first (Hormozi model unchanged)

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/
git commit -m "feat(scan): update outreach skills to integrate scan engine"
```

---

## Task 16: Deploy & Smoke Test

- [ ] **Step 1: Build locally**

Run: `cd engineering/projects/ophidian-ai && npm run build`

Fix any TypeScript or build errors.

- [ ] **Step 2: Commit any build fixes**

```bash
git add -A
git commit -m "fix: resolve build errors for scan engine"
```

- [ ] **Step 3: Deploy**

Push the ophidian-ai submodule to trigger Vercel deployment:
```bash
cd engineering/projects/ophidian-ai
git push
```

Wait for deployment to complete. Check Vercel dashboard for build success.

- [ ] **Step 4: Smoke test production**

1. Visit `https://ophidianai.com/tools/website-checkup`
2. Enter a real local business URL
3. Verify: scan completes, score reveals, email gate works, report page renders
4. Enter a test email -- verify confirmation email arrives with PDF
5. Test the API directly: `curl -X POST https://ophidianai.com/api/scan -H "Content-Type: application/json" -d '{"url": "https://example.com"}'`
6. Test rate limiting: send 4 rapid requests -- 4th should return 429
7. Test internal auth: `curl -X POST https://ophidianai.com/api/scan -H "Authorization: Bearer $SCAN_API_KEY" -H "Content-Type: application/json" -d '{"url": "https://example.com"}'` -- should bypass rate limit

- [ ] **Step 5: Update submodule reference in Iris repo**

```bash
cd /c/Claude\ Code/OphidianAI
git add engineering/projects/ophidian-ai
git commit -m "feat: update ophidian-ai submodule with scan engine"
```

---

## Deferred to Separate Plan

The following spec requirements are intentionally deferred from this plan to keep scope manageable. Each will be implemented as a follow-on task:

- **Inbound follow-up skill** (`inbound-follow-up`) -- Day 2/5/10 email sequence for inbound leads triggered during morning coffee. Spec Section 5, lines 396-404.
- **"Inbound - Call Booked" status** -- Requires Calendly webhook integration or contact form tracking. Will be set when a CTA click results in a booking.
- **City population JSON data file** -- Task 3 hardcodes `CITY_POPULATIONS` in `benchmarks.ts`. If the dataset grows unwieldy, extract to `src/lib/scan/data/city-populations.json`.
- **Cache deduplication vs. TTL clarification** -- The 24h cache serves as both debounce and performance cache. If the "force re-scan" UX is implemented, add a separate bypass flag.

---

## Execution Order Summary

| Task | Component | Dependencies | Est. Complexity |
|------|-----------|-------------|-----------------|
| 1 | Supabase migration | None | Low |
| 2 | Types | None | Low |
| 3 | Benchmarks + revenue calc | Task 2 | Medium |
| 4 | Speed module | Task 2 | Medium |
| 5 | SEO module | Task 2 | Medium |
| 6 | Mobile module | Task 2, 4 (shares PSI data) | Medium |
| 7 | Trust module | Task 2 | Medium |
| 8 | Orchestrator + cache | Tasks 1-7 | High |
| 9 | API route | Task 8 | Medium |
| 10 | Report page | Task 9 (needs data) | High |
| 11 | Tool page | Task 9, 10 | High |
| 12 | PDF generation | Task 2 | Medium |
| 13 | Email (Resend) | Task 12 | Medium |
| 14 | Env vars | Before Tasks 4, 9 | Low |
| 15 | Skill updates | Task 9, 12 | Low |
| 16 | Deploy + smoke test | All | Low |

**Parallelizable:** Tasks 4, 5, 6, 7 (all scan modules) can run in parallel. Tasks 10, 11, 12 can partially overlap.

**Critical path:** 1 -> 2 -> 14 -> 4+5+6+7 (parallel) -> 8 -> 9 -> 10+11+12 (parallel) -> 13 -> 15 -> 16
