# Website Revenue Leak Tool -- Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Author:** Iris (Chief of Staff)
**Stakeholder:** Eric Lefler

---

## Overview

An automated website analysis tool that scans any URL and generates a branded "Website Revenue Leak Report" -- translating technical website issues into estimated dollar amounts lost per month. The tool serves two channels: an inbound lead capture tool on ophidianai.com and a backend enrichment engine for the cold email outreach pipeline.

### Strategic Framework

**Hormozi Lead Magnet Model:**
- Type: "Reveal a problem" -- shows prospects issues they didn't know existed
- Delivery: Software/tool (automated) + information (branded report)
- Positioning: Free, high-value, creates deprivation that the core offer (website services) solves

**P.C.P. Persuasion Model (Perception-Context-Permission):**
- Perception: Shift belief from "my site is fine" to "my site is costing me $X,XXX/month"
- Context: Industry benchmarks reshape what "normal" looks like -- prospect sees the gap between where they are and where competitors are
- Permission: After seeing the problem quantified in dollars, the CTA to book a free call is the natural next step

---

## Architecture: API-First with Dual Frontend

The system is built as a scan engine API consumed by two frontends (web tool + outreach pipeline). One engine, two channels.

```
                    ophidianai.com
                   /tools/website-checkup
                          |
                     [Scan API]  <--- Iris / Outreach Pipeline
                    /api/scan/
                     |      |
              [Web Report]  [PDF Report]
             /report/[id]   prospect folders
```

### Why API-First

- One scan engine powers both inbound (web tool) and outreach (prospect enrichment)
- Iris and outreach skills call the same API to generate reports programmatically
- Report template shared between web and PDF outputs
- Future: CLI access, batch scanning, additional channels

---

## Section 1: Scan Engine API

The core service that analyzes any website and returns structured findings.

### Endpoint

`POST /api/scan/`

**Input:** `{ url: string }`

**Output:** Structured JSON with scores, findings, and revenue impact estimates.

### Analysis Modules

| Module | Data Source | What It Checks |
|---|---|---|
| **Speed & Performance** | PageSpeed Insights API (free tier, API key recommended for volume -- 25k queries/day with key) | Load time, LCP, CLS, FCP, performance score, mobile vs desktop |
| **SEO Health** | Firecrawl scrape + HTML parsing | Title tag, meta description, H1 structure, image alt text, canonical URLs, sitemap, robots.txt |
| **Mobile Experience** | Lighthouse mobile audit (via PageSpeed Insights) + viewport checks | Mobile-friendly score, tap target sizing, font readability, responsive viewport |
| **Trust & Visibility** | Firecrawl scrape (including Google Maps listing) | SSL status, visible contact info, Google Business Profile presence, review count/rating |

**API keys:** PageSpeed Insights requires a Google Cloud API key for production volume (unauthenticated rate limit is ~2 req/s). Store as `GOOGLE_PSI_API_KEY` Vercel env var. Firecrawl uses existing `FIRECRAWL_API_KEY`. No Google Places API needed -- GBP data scraped via Firecrawl to avoid Places API data retention restrictions.

### Revenue Impact Calculation

Each finding gets a severity weight (critical/moderate/minor). Revenue estimates use industry conversion benchmarks:

- Every additional second of load time costs ~7% of conversions
- Missing mobile experience loses ~60% of mobile visitors
- No Google Business Profile means invisible in local search
- Missing SSL triggers browser warnings, killing trust instantly

**Visitor estimation:** Lookup table by city size tier and industry. Conservative -- better to understate and be credible than overstate and lose trust.

| City Size | Population | Base Monthly Visitors |
|---|---|---|
| Small | < 25,000 | 200 |
| Medium | 25,000 - 100,000 | 500 |
| Large | 100,000+ | 1,500 |

Industry multipliers: Restaurants 1.5x, Home Services 1.0x, Auto Services 0.8x, Professional Services 0.6x, Health/Wellness 1.2x.

City population sourced from a static lookup table of US cities (bundled, no API call). Business industry inferred from Firecrawl scrape content or manually specified.

**Formula per finding:**
```
(base_visitors * industry_multiplier) * severity_conversion_impact * avg_local_order_value = monthly_revenue_leak
```

### Output Schema

```json
{
  "scan_id": "string (unique ID for report URL)",
  "url": "string",
  "scanned_at": "ISO timestamp",
  "overall_score": "0-100",
  "overall_grade": "A|B|C|D|F (derived: 90+=A, 80+=B, 70+=C, 60+=D, <60=F)",
  "estimated_monthly_leak": "dollar amount",
  "modules": {
    "speed": { "score": "0-100", "findings": [...] },
    "seo": { "score": "0-100", "findings": [...] },
    "mobile": { "score": "0-100", "findings": [...] },
    "trust": { "score": "0-100", "findings": [...] }
  },
  "findings": [
    {
      "id": "string",
      "module": "speed|seo|mobile|trust",
      "severity": "critical|moderate|minor",
      "title": "Plain-English title",
      "description": "What this means for their customers",
      "revenue_impact": "dollar amount per month",
      "benchmark": "Industry average comparison",
      "quick_win": "boolean"
    }
  ],
  "top_quick_wins": ["finding IDs, top 3 by impact-to-fix ratio"],
  "industry_benchmarks": {
    "avg_load_time": "seconds",
    "mobile_friendly_pct": "percentage",
    "gbp_presence_pct": "percentage"
  }
}
```

### Location in Codebase

- `src/app/api/scan/route.ts` -- API endpoint
- `src/lib/scan/` -- Scan engine modules (speed, seo, mobile, trust)
- `src/lib/scan/revenue.ts` -- Revenue impact calculation logic
- `src/lib/scan/benchmarks.ts` -- Industry benchmark data

All within the ophidianai.com Next.js project (`ophidian-ai` submodule).

### Rate Limiting & Abuse Prevention

**Public (inbound web tool):**
- IP-based throttle: 3 scans per IP per hour, 10 per day
- Honeypot field on the web form to block bots
- URL validation: must be a valid HTTP/HTTPS URL before scanning
- Duplicate URL debounce: if the same URL was scanned in the last 60 minutes, return cached results

**Internal (Iris / outreach pipeline):**
- Internal API key (`SCAN_API_KEY` env var) bypasses public rate limits
- Passed via `Authorization: Bearer <key>` header
- No per-IP throttle for internal calls

### Timeout & Failure Handling

**Vercel function config:** `maxDuration: 60` (requires Pro plan -- ophidianai.com is already on Pro)

**Per-module timeouts:**
- Each module gets 15 seconds max
- Total scan timeout: 45 seconds
- If a module times out or errors, the scan returns partial results with that module marked `"status": "unavailable"` rather than failing entirely

**Module status field** (added to output schema):
```json
"modules": {
  "speed": { "score": 72, "status": "ok", "findings": [...] },
  "seo": { "score": null, "status": "unavailable", "error": "Timeout", "findings": [] }
}
```

**Client-side handling:**
- Loading UI shows per-module progress
- If a module fails, the report renders available modules and shows "We couldn't check [module] for this site -- try again later" for unavailable ones
- Overall score calculated from available modules only (weighted average of what succeeded)

### Edge Cases

| Scenario | Handling |
| --- | --- |
| URL behind login/paywall | Firecrawl returns limited content; report notes "restricted access" and scores only publicly visible elements |
| Single-page app (JS-heavy) | Firecrawl renders JS by default; PageSpeed Insights handles SPAs natively |
| Redirect chain | Follow up to 3 redirects; report shows final resolved URL |
| Site is down (DNS resolves, HTTP fails) | Return immediately with "Site Unreachable" status, no scores, CTA: "Your site appears to be down -- that's the biggest revenue leak possible" |
| Non-URL input (business name, gibberish) | Client-side URL validation before API call; API returns 400 if invalid |
| Parked/placeholder domain | Firecrawl scrape detects minimal content; report flags "This appears to be a placeholder site" |

### Caching

- Scan results cached by URL hash for 24 hours
- Inbound web tool: always returns cached result if available within 24h (user can force re-scan)
- Outreach pipeline: uses cached result if available within 7 days
- Cache storage: same as scan persistence (see Section 5: Data Storage)

---

## Section 2: Report Generation & P.C.P. Integration

Raw scan data becomes a persuasion tool. The same JSON powers two output formats, both structured around the P.C.P. sequence.

### P.C.P. Report Structure

| Report Section | P.C.P. Stage | Purpose |
|---|---|---|
| **Headline score** | Perception | "Your website is leaking an estimated $2,400/month." Big number, impossible to ignore. Shifts belief from "my site is fine" to "my site is costing me." |
| **Module breakdown** | Perception (deepening) | Speed: D, SEO: C, Mobile: F, Trust: B. Visual scores with red/yellow/green. Each failing module includes plain-English explanation of customer impact. |
| **Industry benchmarks** | Context | "Restaurants in your area average a 3.2s load time. Yours is 9.1s." "87% of your competitors have mobile-friendly sites. Yours isn't." Reshapes what "normal" looks like. |
| **Revenue impact detail** | Context (intensifying) | Per-finding dollar estimates. "Slow load time: ~$1,100/mo lost. Missing mobile experience: ~$800/mo lost." Makes the abstract concrete. |
| **Top 3 quick wins** | Context -> Permission bridge | "Here's what to fix first, in order of impact." Shows expertise, builds credibility. |
| **CTA** | Permission | "Want us to fix these for you? Free 15-minute call -- no pressure." The "yes" feels natural after seeing the gap. |

### Output Format: Interactive Web Report

- Route: `src/app/report/[id]/page.tsx`
- Branded page with OphidianAI design system (dark gradient, teal accent, venom green)
- Animated score reveal (number counting up creates tension)
- Expandable sections per module
- Shareable URL (prospect can forward to business partner/decision maker)
- CTA buttons embedded throughout report sections
- Responsive -- must work on mobile (prospects will check on their phone)

### Output Format: Branded PDF Report

- Same content, static format
- Generated via Playwright PDF from HTML template (existing report generation pipeline)
- OphidianAI branding: dark gradient (#0D1B2A), teal accent (#0DB1B2), venom green (#39FF14)
- Used for: cold email offer delivery, follow-up attachments, direct sharing
- Template location: `operations/templates/revenue-leak-report.html`

### Email Gate Strategy (Inbound Only)

1. Prospect enters URL on the tool page
2. Scan runs (15-30 seconds with progress UI)
3. Headline score appears immediately -- **no gate** ("Your site scores 34/100 -- estimated $2,400/mo in lost revenue")
4. Full breakdown requires email entry
5. Perception shift happens before the gate -- they already know their site is broken. The email is the price for the details.

---

## Section 3: Inbound Web Tool (ophidianai.com)

### Page: `/tools/website-checkup`

**Above the fold:**
- Headline: "Is Your Website Costing You Customers?" (A/B testable)
- Subhead: "Enter your URL. Get a free report showing exactly where you're losing revenue -- and how to fix it."
- Single input: URL field + "Scan My Site" button
- No nav distractions, no services pitch, no about us. Just the tool.
- Social proof one-liner below input

**Headline A/B test candidates:**
1. "Website Revenue Leak Report" -- direct, money-focused
2. "Is Your Website Costing You Customers?" -- question format, curiosity-driven
3. "Free Business Website Checkup" -- approachable, less aggressive

**Scan flow (user experience):**

```
Enter URL -> Loading state (15-30s) -> Headline score revealed (no gate)
   -> "Enter your email for the full report" -> Full interactive report
   -> CTA: Book a free 15-min call
```

**Loading state design:**
- Progress indicators per module ("Checking speed... Analyzing SEO... Testing mobile... Evaluating trust signals...")
- Micro-stats while they wait ("Did you know? 53% of visitors leave if a site takes over 3 seconds to load")
- These prime the Perception shift before results appear

**Post email capture:**
- Full report renders at `/report/[scan-id]`
- Confirmation email sent with PDF attached + link to web report
- Prospect auto-added to Pipeline sheet as "Inbound Lead"
- If score below 50/100, auto-triggers inbound follow-up sequence

**SEO targeting for the page:**
- "free website checker", "website speed test for small business", "is my website losing customers"
- Report page SEO indexing deferred to future phase (see Out of Scope)

**Codebase location:**
- `src/app/tools/website-checkup/page.tsx` -- tool page
- `src/app/report/[id]/page.tsx` -- report view
- `src/app/api/scan/route.ts` -- scan API endpoint

---

## Section 4: Cold Email Integration

The scan engine enriches the outreach pipeline without changing cold email templates.

### Role in Outreach

The scan engine serves as **backend enrichment and instant delivery** -- not a template change. Existing CI1/ALT templates stay as-is per the Hormozi value-first model.

### Pre-Outreach Scan Workflow

```
New prospect identified -> Prospect scored -> Scan API runs automatically
   -> Results stored in prospect folder -> Cold email sent (CI1/ALT, unchanged)
   -> Full PDF report pre-generated and ready for instant delivery on reply
```

### How the Free Audit Functions as a Hormozi Lead Magnet

The cold email offers value first (CI1: 3 creative ideas, ALT: sharp insight). The **free revenue leak report** is the reward -- the thing they get when they raise their hand and reply "yes."

```
CI1/ALT email (Hormozi value-first opening)
   -> "I put together a free revenue leak report for your site -- want me to send it?"
   -> Prospect replies "yes"
   -> Offer delivery: instant PDF report (pre-generated from scan)
   -> Report does the P.C.P. heavy lifting (Perception -> Context -> Permission)
   -> CTA at bottom of report: book a 15-min call
```

The report is the Costco sample. It reveals a problem (Perception), shows what normal looks like (Context), and makes the "yes" feel inevitable (Permission).

### Skill Integration

| Skill | Change |
|---|---|
| **outreach-pipeline** | Monday pipeline adds scan step: research -> score -> **scan** -> draft -> stage |
| **cold-email-outreach** | No template changes. CI1/ALT reference the report as the offer ("I put together a report for your site"). |
| **follow-up-email** | FU1/FU2 can reference scan findings as value drops ("Your site loads in 8.7s -- that's 3x slower than average in your industry") |
| **offer-delivery** | When prospect replies "yes," PDF report delivered instantly -- already generated |
| **prospect-scoring** | Scan score becomes a scoring input. Lower site score = hotter lead (more pain, more urgency) |

### Future: Scan-Powered Email Template

Once CI1/ALT have enough sends to evaluate performance (target: 30+ sends per template), introduce CI-SCAN as a new challenger template that leads with actual scan findings. Not now -- collect baseline data first.

### Storage

- Scan results: `sales/lead-generation/prospects/[slug]/scan/results.json`
- PDF report: `sales/lead-generation/prospects/[slug]/scan/revenue-leak-report.pdf`
- Scan metadata indexed to Pinecone for cross-prospect analysis

---

## Section 5: Lead Capture & Pipeline

### Two Entry Points, One Pipeline

| Entry | Trigger | Flow |
|---|---|---|
| **Inbound** (web tool) | Prospect enters URL on ophidianai.com | Scan -> headline score (no gate) -> email captured -> full report -> Pipeline sheet: "Inbound Lead" |
| **Outreach** (cold email) | Prospect added to Monday pipeline batch | Scan runs in background -> results stored -> cold email sent -> report ready for delivery on reply |

### New Pipeline Statuses

| Status | Meaning |
|---|---|
| `Inbound Lead` | Came through web tool. Has email + scan data. Not yet contacted by Eric. |
| `Inbound - Report Viewed` | Opened the full report (tracked via report page visit). Higher intent signal. |
| `Inbound - Call Booked` | Clicked CTA and booked a call. Highest intent. |
| `Scanned` | Outreach prospect -- scan complete, cold email not yet sent. |

### Data Storage

**Inbound scans (web tool):**

- Stored in Supabase `scans` table: `scan_id`, `url`, `url_hash`, `email`, `results_json`, `score`, `created_at`
- Report page (`/report/[id]`) reads from Supabase by `scan_id`
- Retention: indefinite (scan results are lightweight JSON, useful for re-engagement)
- Cache lookups use `url_hash` to find recent scans of the same URL

**Outreach scans (pipeline):**

- Stored as files: `sales/lead-generation/prospects/[slug]/scan/results.json`
- PDF pre-generated: `sales/lead-generation/prospects/[slug]/scan/revenue-leak-report.pdf`
- Also indexed to Pinecone for cross-prospect queries ("show me all prospects with speed scores under 30")

**Both channels:** Pipeline sheet (Google Sheets) updated via GWS CLI with scan score column.

### Email Delivery

**Inbound confirmation email (transactional):**

- Sent via Resend (already available as a Vercel Marketplace integration)
- Triggered server-side after email capture on the web tool
- Contains: PDF report attached + link to web report + OphidianAI branding
- Template: React Email component in `src/emails/scan-report.tsx`
- Env var: `RESEND_API_KEY` (provisioned via `vercel integration add resend`)
- Sending domain: ophidianai.com (requires DNS verification)

**Outreach emails (offer delivery, follow-ups):**

- Continue using GWS CLI to stage Gmail drafts (no change to existing workflow)
- PDF report attached to offer delivery email when prospect replies "yes"

### Inbound Follow-Up Sequence

Executed by a new `inbound-follow-up` skill (extension of the follow-up-email pattern, but for inbound leads rather than cold outreach).

- **Immediate:** Resend transactional email with PDF report + link to web report
- **Day 2:** "Did you get a chance to review your report? Here's the #1 thing I'd fix first." (Context reinforcement)
- **Day 5:** "Quick question -- are you handling your website yourself or working with someone?" (Permission probe)
- **Day 10:** Breakup if no engagement

Day 2/5/10 emails triggered by Iris during morning coffee (checks Pipeline sheet for inbound leads with pending follow-ups). Drafted via Resend, not Gmail -- these are transactional follow-ups from the tool, not personal outreach.

### Data Flow

- Inbound scans stored in Supabase + Pipeline sheet updated via GWS CLI
- Outreach scans stored in prospect folders + indexed to Pinecone
- Inbound leads auto-create a prospect folder on email capture
- Weekly pipeline summary includes inbound vs outreach breakdown

### Metrics

| Channel | Funnel Steps |
|---|---|
| **Inbound** | Scans started -> emails captured -> reports viewed -> calls booked |
| **Outreach** | Scans run -> emails sent -> replies -> reports delivered -> calls booked |

Conversion rate at each step reveals where P.C.P. is breaking down:
- Low scan-to-email conversion = Perception shift not strong enough (headline score not compelling)
- Low report-viewed-to-call = Context not convincing enough (benchmarks or revenue estimates not credible)
- Low call-booked rate = Permission CTA not clear enough

---

## Out of Scope (Future Phases)

- Competitor deep-dive analysis (hard to automate, slow)
- Social media presence scoring (different service, muddies the message)
- Full content quality assessment (subjective, hard to automate)
- CI-SCAN cold email template (wait for CI1/ALT baseline data)
- Batch scanning CLI tool
- Report page indexing for SEO (decide after measuring scan volume)
