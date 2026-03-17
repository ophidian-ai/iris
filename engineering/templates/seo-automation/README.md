# SEO Automation Product Template

Extends the existing `seo-audit` skill into a recurring client-deliverable reporting and optimization flow.

## Architecture

```
Monthly Cycle
  └── Automated SEO Audit (existing skill)
        ├── Technical audit (page speed, mobile, crawl errors)
        ├── On-page analysis (titles, meta, headings, content)
        ├── Local SEO check (GBP, NAP consistency, reviews)
        └── Competitor tracking (rank changes vs named competitors)
              └── Branded PDF Report (existing report generator)
                    └── Client Delivery (email or dashboard)
                          └── Recommended Actions (prioritized)
```

## Per-Client Setup

### 1. Client SEO Profile

```json
{
  "client": "business-name",
  "url": "https://example.com",
  "industry": "auto repair",
  "location": "Columbus, IN",
  "targetKeywords": [
    "auto repair columbus in",
    "brake repair near me",
    "oil change columbus indiana"
  ],
  "competitors": [
    { "name": "Midas", "url": "https://midas.com/store/columbus-in" },
    { "name": "Firestone", "url": "https://firestone.com/stores/columbus-in" }
  ],
  "gbpUrl": "https://maps.google.com/?cid=...",
  "reportFrequency": "monthly",
  "deliveryEmail": "owner@example.com"
}
```

### 2. Monthly Audit Flow

1. Run `seo-audit` skill against client URL
2. Track keyword rankings (Firecrawl search for each target keyword)
3. Compare rankings vs previous month
4. Check competitor rankings for same keywords
5. Generate branded PDF report with:
   - Score card (overall health)
   - Ranking changes (up/down/new)
   - Competitor comparison
   - Top 3 recommended actions (prioritized by impact)
   - Technical issues found
6. Email report to client via GWS CLI

### 3. Managed SEO (Growth/Pro tiers)

For Growth and Pro clients, implement the recommended fixes:

- Fix technical issues (page speed, mobile, broken links)
- Optimize on-page elements (titles, meta descriptions, headings)
- Create/optimize Google Business Profile
- Build local citations (NAP consistency)
- Content optimization recommendations

## Tier Differences

| Feature | Essentials (in $297 tier) | Growth (in $497 tier) | Pro (in $797 tier) |
|---------|--------------------------|----------------------|-------------------|
| Monthly audit | Yes | Yes | Yes |
| PDF report | Yes | Yes | Yes |
| Keyword tracking | 5 keywords | 15 keywords | 30 keywords |
| Competitor tracking | None | 2 competitors | 5 competitors |
| Fixes implemented | Report only | Fixes + optimization | Full SEO + content strategy |
| GBP optimization | No | Yes | Yes + ongoing |
| Content recommendations | No | Monthly | Weekly |

## A La Carte

| Service | Setup | Monthly |
|---------|-------|---------|
| SEO Cleanup (one-time) | -- | $400-$1,200 |
| SEO Management | $400 | $299/mo |

## Build Status

- [x] SEO audit skill (technical + on-page + local)
- [x] Branded PDF report generator
- [ ] Keyword rank tracking (month-over-month)
- [ ] Competitor comparison tracking
- [ ] Automated monthly report delivery
- [ ] Client SEO profile config system
- [ ] Cron job for monthly audits

## Dependencies

- Firecrawl (page scraping + search ranking checks)
- GWS CLI (report delivery via email)
- Existing seo-audit skill
- Existing report generation templates
