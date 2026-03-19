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
| **Speed & Performance** | PageSpeed Insights API (free, no key needed) | Load time, LCP, CLS, FCP, performance score, mobile vs desktop |
| **SEO Health** | Firecrawl scrape + HTML parsing | Title tag, meta description, H1 structure, image alt text, canonical URLs, sitemap, robots.txt |
| **Mobile Experience** | Lighthouse mobile audit + viewport checks | Mobile-friendly score, tap target sizing, font readability, responsive viewport |
| **Trust & Visibility** | Firecrawl scrape + Google Places API (free tier) | SSL status, visible contact info, Google Business Profile presence, review count/rating |

### Revenue Impact Calculation

Each finding gets a severity weight (critical/moderate/minor). Revenue estimates use industry conversion benchmarks:

- Every additional second of load time costs ~7% of conversions
- Missing mobile experience loses ~60% of mobile visitors
- No Google Business Profile means invisible in local search
- Missing SSL triggers browser warnings, killing trust instantly

**Visitor estimation:** Simple heuristic based on business type + location population size. Conservative -- better to understate and be credible than overstate and lose trust.

**Formula per finding:**
```
estimated_monthly_visitors * severity_conversion_impact * avg_local_business_order_value = monthly_revenue_leak
```

### Output Schema

```json
{
  "scan_id": "string (unique ID for report URL)",
  "url": "string",
  "scanned_at": "ISO timestamp",
  "overall_score": "0-100",
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

- `app/api/scan/route.ts` -- API endpoint
- `lib/scan/` -- Scan engine modules (speed, seo, mobile, trust)
- `lib/scan/revenue.ts` -- Revenue impact calculation logic
- `lib/scan/benchmarks.ts` -- Industry benchmark data

All within the ophidianai.com Next.js project (`ophidian-ai` submodule).

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

- Route: `app/report/[id]/page.tsx`
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
- Unique report pages per scan add indexable content over time

**Codebase location:**
- `app/tools/website-checkup/page.tsx` -- tool page
- `app/report/[id]/page.tsx` -- report view
- `app/api/scan/route.ts` -- scan API endpoint

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

### Inbound Follow-Up Sequence

- **Immediate:** Confirmation email with PDF report + link to web report
- **Day 2:** "Did you get a chance to review your report? Here's the #1 thing I'd fix first." (Context reinforcement)
- **Day 5:** "Quick question -- are you handling your website yourself or working with someone?" (Permission probe)
- **Day 10:** Breakup if no engagement

### Data Flow

- All scan results stored in prospect folder + indexed to Pinecone
- Pipeline sheet (Google Sheets) updated via GWS CLI
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
