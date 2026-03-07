# SEO Service Pipeline -- Design Document

**Date:** 2026-03-07
**Status:** Approved
**Author:** Eric Lefler + Iris

## Overview

Standalone SEO optimization service for OphidianAI. Targets businesses that don't need a new website but have poor search visibility. Complements the existing website build offering and doubles the addressable market from the same lead generation effort.

## Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Target market | Both existing clients and new prospects | Widens market, SEO-only prospects are a new segment |
| Client access model | Flexible (done-for-you + advisory) | Accommodates different client comfort levels and budgets |
| SEO scope (v1) | Traditional SEO only | Start focused, expand to Search Everywhere later |
| Pricing model | One-time cleanup + monthly retainer | Entry point for quick wins, retainer for recurring revenue |
| Approach | Free audit lead magnet, tiered paid services | Aligns with existing cold email offer-first strategy |
| Email framing | Revenue-impact language | Lead with cost of inaction, not features |

## Service Tiers

### Tier 1: SEO Audit (Free -- Lead Magnet)

- **Purpose:** Lead generation, not revenue
- **Delivery:** AI-automated via Firecrawl scan + Claude analysis
- **Deliverable:** 1-2 page branded PDF covering on-page issues, keyword gaps, technical problems, GBP status
- **Target turnaround:** Under 1 hour of actual work
- **Used as:** Cold email offer or follow-up deliverable

### Tier 2: SEO Cleanup (One-Time)

- **Done-for-you:** $800-$1,200 -- we get CMS access and implement all fixes
- **Advisory:** $400-$600 -- prioritized action plan with step-by-step instructions
- **Scope:** On-page SEO, meta tags, schema markup, GSC setup, sitemap, internal linking fixes, GBP optimization, image optimization
- **Turnaround:** 1-2 weeks

### Tier 3: SEO Growth (Monthly Retainer)

- **Price:** $200-$350/mo depending on scope
- **Minimum commitment:** 3 months
- **Includes:**
  - Monthly keyword tracking + reporting
  - Content optimization (1-2 blog posts or page updates/mo)
  - Internal linking maintenance
  - GBP post management
  - Quarterly strategy review
- **Upsell path:** Expand into Search Everywhere (YouTube, social, AEO/GEO) as capability grows

## Delivery Workflows

### SEO Audit Pipeline (Lead Magnet)

1. Prospect identified (cold outreach, inbound, or referral)
2. Automated scan -- Firecrawl crawls the site, pulls page structure, meta tags, load speed, mobile status
3. AI analysis -- Claude processes scan against SEO checklist, identifies issues, scores severity
4. Report generation -- auto-generate branded 1-2 page PDF
5. Delivery -- send as cold email offer or follow-up deliverable

### SEO Cleanup Pipeline (One-Time)

1. Discovery call -- confirm scope, determine done-for-you vs. advisory
2. Deep audit -- expand free audit into full technical + content analysis (keyword research, competitor gaps, schema opportunities, GBP review)
3. Implementation plan -- prioritized task list with expected impact
4. Execute or deliver -- done-for-you: implement over 1-2 weeks. Advisory: deliver the plan document.
5. Verification -- Lighthouse audit, GSC confirmation, before/after comparison
6. Handoff -- summary report of changes + recommendations for ongoing optimization (seeds retainer upsell)

### SEO Growth Pipeline (Retainer)

1. Onboarding -- GSC access, keyword baseline, define KPIs (rankings, organic traffic, GBP visibility)
2. Monthly cycle:
   - Week 1: Review analytics, identify opportunities
   - Week 2-3: Content updates, new blog posts, internal linking
   - Week 4: Monthly report to client (rankings, traffic, actions taken, next month plan)
3. Quarterly review -- strategy call, adjust keyword targets, evaluate channel expansion

## Sales Integration

### Cold Email Strategy

- SEO-only prospects get different offers than website rebuild prospects
- **Revenue-impact framing:** Lead with what they're losing by being invisible, not what we're selling
- Example angles:
  - "Every month your site doesn't show up for [search term], that's customers going to [competitor] instead."
  - "Businesses like yours in [city] are getting 20-30 calls a month from Google alone. Your site isn't showing up for any of those searches."
- Same rules apply: 80-word limit, outcome language, 7th-grade reading level, low-friction CTA
- The "plan" offered in the cold email is the free SEO audit

### Prospect Qualification

| Website Quality | SEO Quality | Service Offered |
|---|---|---|
| Bad | Bad | Website rebuild (SEO bundled in) |
| Decent | Bad | SEO service (standalone) |
| Decent | Decent | Not a prospect |

### Conversion Flow

1. Cold email with SEO-specific offer (revenue-impact framing)
2. Reply -> deliver free SEO audit PDF (within 24h)
3. Discovery call -> scope cleanup vs. retainer
4. Proposal -> close

### Upsell Paths

- SEO Cleanup client -> SEO Growth retainer
- SEO Growth client -> website rebuild when the time is right
- Website client -> SEO Growth retainer post-launch (seeded in handoff)

### Pipeline Tracking Updates

- Add "SEO Audit Delivered" as a new pipeline stage in prospect-tracker.md
- Tag prospects with service type (Website, SEO, or Both)

## Tooling

### Existing (no new tools needed)

- **Firecrawl** -- site crawling, page extraction, technical scan
- **Claude** -- analysis, report writing, content generation, keyword research
- **Playwright** -- HTML-to-PDF for branded reports
- **Gmail** -- delivery and client communication
- **Existing SOPs** -- seo-basics.md and seo-full-setup.md cover 90% of the cleanup checklist

### Assets to Build

- SEO audit PDF template (branded, similar to website assessment)
- SEO audit skill (automates scan-analyze-report pipeline)
- SEO cleanup SOP (adapts seo-full-setup.md for standalone delivery)
- SEO growth SOP (monthly retainer workflow + reporting template)
- Keyword research workflow (Claude-powered longtail keyword generation)
- 2-3 SEO-specific cold email templates (revenue-impact framing)

### Not Needed Yet

- No paid SEO tools (Ahrefs, SEMrush) -- Claude + Firecrawl + GSC covers v1
- No content management platform -- manual until 3+ retainer clients
- No YouTube/social optimization tooling -- future expansion, not v1

## Future Expansion

- **Content management automation** -- when retainer client base justifies it
- **Search Everywhere Optimization** -- YouTube, social platforms, AI visibility (AEO/GEO) as a premium tier
- **Paid SEO tools** -- evaluate Ahrefs/SEMrush when client volume warrants it

## References

- AI SEO 2026 transcript: `learning-hub/transcripts/NoteGPT_TRANSCRIPT_A Complete Guide to AI SEO in 2026 (AEO, GEO, LLMO).txt`
- Existing SEO SOPs: `operations/references/sops/seo-basics.md`, `operations/references/sops/seo-full-setup.md`
- Pricing structure: `operations/references/pricing-structure.md`
- Niche offer templates: `operations/references/niche-offer-templates.md`
- Cold email skill: `.claude/skills/cold-email-outreach/SKILL.md`
