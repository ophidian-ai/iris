---
name: prospect-scoring
description: Score and qualify prospects before investing time in full research, mockups, and outreach. Use when Eric mentions a new potential lead, says "score this business", "is this worth pursuing", "qualify this prospect", or before running business-research or cold-email-outreach on a new prospect. This is the gate -- score first, then decide whether to pursue.
---

# Prospect Scoring

Score and qualify prospects before investing time in full research, mockups, and outreach. This is the gate -- score first, then decide whether to pursue.

## When to Use

Before running the business-research skill or cold-email-outreach skill on a new prospect. Use this to quickly determine if a business is worth the investment of a full research cycle.

## Inputs

- **Business name** (required)
- **Business URL** (optional -- if they have a website)
- **Location** (optional -- defaults to Columbus, Indiana area)
- **Industry** (optional -- e.g., auto services, fitness, restaurant, salon, trades)
- **Lead source** (optional -- Yelp, Google Maps, referral, etc.)

## Tools

Use the **Firecrawl** plugin (`/firecrawl`) for quick reconnaissance:

- `firecrawl scrape` -- Quick scan of business website (if URL provided)
- `firecrawl search` -- Find Yelp listing, Google presence, social media

Keep it fast. One scrape of the site, one search for reviews/presence. No deep dives.

## Scoring Criteria

Each criterion scored 1-5. Total out of 25.

### 1. Decision-Maker Access

| Score | Criteria |
|-------|----------|
| 5 | Owner name + direct email found |
| 4 | Owner name found + general business email |
| 3 | General business email or contact form only |
| 2 | Phone number only, no email |
| 1 | No contact info found, or corporate chain/franchise |

### 2. Business Maturity

| Score | Criteria |
|-------|----------|
| 5 | 10+ years operating, 50+ reviews, well-established |
| 4 | 5-10 years, 20-50 reviews, solid presence |
| 3 | 3-5 years, 10-20 reviews, growing |
| 2 | 1-3 years, under 10 reviews, still establishing |
| 1 | Brand new, no reviews, unclear if operational |

### 3. Website Gap

| Score | Criteria |
|-------|----------|
| 5 | No website at all, or site is completely broken/down |
| 4 | Template site (Wix/Squarespace/Hibu) with lorem ipsum, broken links, or severely outdated |
| 3 | Functional but clearly outdated design (5+ years old), not mobile-friendly |
| 2 | Decent site with some issues (slow, minor design problems, weak SEO) |
| 1 | Already has a modern, well-built website |

### 4. Revenue Signals

| Score | Criteria |
|-------|----------|
| 5 | High review count, multiple locations, active social media, clear revenue indicators |
| 4 | Steady reviews, active business, one strong location |
| 3 | Some reviews, appears operational, moderate activity |
| 2 | Few reviews, unclear revenue, limited online footprint |
| 1 | No reviews, no social presence, may not be operational |

### 5. Service Fit

| Score | Criteria |
|-------|----------|
| 5 | Perfect match -- needs website + SEO, local service business, in our sweet spot |
| 4 | Strong match -- needs one of our core services, straightforward project |
| 3 | Moderate match -- could use our services but may need things outside our scope |
| 2 | Weak match -- primarily needs services we don't offer (custom software, app dev) |
| 1 | Poor match -- enterprise, franchise with corporate site control, or needs we can't fill |

## Disqualifiers

Flag any of these -- they may override the score:

- **Franchise/chain** -- Corporate controls the website. Owner can't make decisions.
- **Already has an agency** -- Footer credits or "built by" tags from another web agency.
- **Site built recently** -- Copyright date within last 1-2 years, modern framework.
- **No contact info** -- No way to reach the decision-maker.
- **Out of budget** -- Business too small to afford even Starter tier.

If a disqualifier is present, note it clearly in the score card regardless of total score.

## Tier Assignment

| Score | Tier | Action |
|-------|------|--------|
| 20-25 | **Hot** | Prioritize immediately. Full research + mockup + outreach. |
| 14-19 | **Warm** | Worth pursuing. Research + outreach, mockup if time allows. |
| 8-13 | **Cool** | Low priority. Add to list, revisit later. |
| Below 8 | **Skip** | Not a fit. Don't invest time. |

## Service & Pricing Recommendation

Based on scoring, recommend one or more:

**Service type:**
- Website (new build or redesign)
- SEO (cleanup or ongoing)
- Both

**Pricing tier** (reference `operations/references/pricing-structure.md`):

| Tier | Price Range | When to Recommend |
|------|-------------|-------------------|
| Starter | $2,200-$2,500 | Simple local business, under 5 pages needed |
| Professional | $3,500-$4,000 | Established business, needs full SEO + content |
| E-Commerce | $4,500-$6,000 | Sells products, needs online store |
| SEO Cleanup | $400-$1,200 | Has a decent site but invisible on search |
| SEO Growth | $200-$350/mo | Ongoing SEO retainer after cleanup or site launch |

## Process

1. **Scrape** -- If URL provided, quick Firecrawl scrape of the business site. Note: template platform, last update signs, mobile issues, broken elements.
2. **Search** -- Firecrawl search for the business on Yelp/Google. Note: review count, years in business, contact info.
3. **Score** -- Rate each of the 5 criteria (1-5).
4. **Calculate** -- Sum scores, assign tier.
5. **Recommend** -- Service type and pricing tier.
6. **Flag** -- Note any disqualifiers.
7. **Save** -- Write score card to prospect folder.
8. **Update tracker** -- Write Score and Tier to the **Google Sheet pipeline** (Sheet ID: `1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0`). Also update `revenue/lead-generation/prospect-tracker.md` as backup.

Total time target: **under 2 minutes per prospect.**

## Output

### Score Card

Save to: `revenue/lead-generation/prospects/[business-name]/research/score-card.md`

Create the prospect folder if it doesn't exist.

Format:

```markdown
# Score Card: [Business Name]

**Date:** YYYY-MM-DD
**Location:** [City, State]
**Industry:** [Industry]
**Lead Source:** [How found]
**URL:** [Website or "None"]

## Scores

| Criterion | Score | Notes |
|-----------|-------|-------|
| Decision-Maker Access | X/5 | [Brief note] |
| Business Maturity | X/5 | [Brief note] |
| Website Gap | X/5 | [Brief note] |
| Revenue Signals | X/5 | [Brief note] |
| Service Fit | X/5 | [Brief note] |
| **Total** | **X/25** | |

## Result

- **Tier:** [Hot / Warm / Cool / Skip]
- **Recommended Service:** [Website / SEO / Both]
- **Recommended Pricing:** [Tier name] ($X,XXX-$X,XXX)
- **Disqualifiers:** [None / List any]

## Next Action

[What to do next based on the tier -- e.g., "Run full business research" or "Skip, not a fit"]
```

### Quick Summary (console output)

After saving the score card, print a quick summary:

```
[Business Name] -- Score: X/25 (Tier) -- Service: [Type] -- Price: [Range] -- Next: [Action]
```

### Batch Mode

When scoring multiple prospects in one session, output a comparison table at the end:

```markdown
| Business | Score | Tier | Service | Price Range | Next Action |
|----------|-------|------|---------|-------------|-------------|
| [Name]   | X/25  | Hot  | Both    | $3,500-$4,000 | Full research |
| [Name]   | X/25  | Cool | Website | $2,200-$2,500 | Revisit later |
```

Sorted by score, highest first.

## Rules

- **Fast and lightweight.** This is a quick screen, not deep research. That's what the business-research skill is for.
- **Honest scoring.** Better to skip a bad fit than waste hours on research and mockups.
- **No deep research here.** One scrape, one search, score, done.
- **Always save the score card.** Even for Skips -- it prevents re-evaluating the same business later.
- **Update the tracker.** If the prospect is already in the pipeline, update their tier.
- **Batch when possible.** If Eric provides a list, score them all and output the comparison table.

## Knowledge Base

After generating the score card, index it (and the README if it exists):

1. Upsert the score card:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "prospects"
  records: [{
    "_id": "prospects/<prospect-slug>/research/score-card",
    "text": "<score card content>",
    "source_file": "revenue/lead-generation/prospects/<slug>/research/score-card.md",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "<tier>", "score-card"]
  }]
```

2. If `revenue/lead-generation/prospects/<slug>/README.md` exists, also upsert it:

```
  records: [{
    "_id": "prospects/<prospect-slug>/README",
    "text": "<README content>",
    "source_file": "revenue/lead-generation/prospects/<slug>/README.md",
    ...same metadata pattern...
  }]
```

3. Log: `Indexed to knowledge base: prospects/<prospect-slug>/research/score-card`

If indexing fails, log the error and continue.
