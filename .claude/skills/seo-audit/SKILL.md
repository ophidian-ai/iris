---
name: seo-audit
description: Automated SEO audit for prospect websites with branded PDF report. Use when evaluating a prospect's website for cold outreach, when a prospect requests a site review, when Eric says "audit their SEO", "check their site", "run an audit", or when preparing outreach materials that need a technical assessment of a business's web presence.
---

# SEO Audit

Automated SEO audit for prospect websites. Generates a branded PDF report.

## When to Use

When evaluating a prospect's SEO for cold outreach or when a prospect requests an audit.

## Inputs

- **Business name**
- **Website URL**
- **Industry/niche** (for keyword research context)
- **City/region** (for local SEO evaluation)

## Process

### Step 1: Site Scan

Use Firecrawl to crawl the prospect's website. Capture:
- All page URLs, titles, meta descriptions
- Heading structure (H1s, H2s)
- Image alt text presence
- Load speed indicators
- Mobile responsiveness
- Schema markup presence
- Sitemap and robots.txt status
- Internal link structure

### Step 2: Analysis

Evaluate the scan results against the SEO Basics checklist (`operations/references/sops/seo-basics.md`) and the SEO Full Setup checklist (`operations/references/sops/seo-full-setup.md`).

Score each area on a 1-5 scale:
- **On-Page SEO** -- Meta tags, headings, alt text, URL structure
- **Technical SEO** -- Schema, sitemap, robots.txt, canonical URLs, HTTPS
- **Content** -- Word count, keyword usage, content quality, duplicate content
- **Local/GBP** -- Google Business Profile presence, local keywords, NAP consistency
- **Mobile/Speed** -- Mobile responsiveness, Core Web Vitals, image optimization

Identify:
- Top 3-5 issues by severity (high/medium/low)
- Top 3-5 quick wins (highest impact, easiest to fix)
- Top 3-5 keyword gaps (search terms they should rank for but don't)

Use outcome language in all findings. No jargon.
- Instead of "Missing meta descriptions" -> "Search engines can't tell what your pages are about"
- Instead of "No schema markup" -> "Google can't show your business hours, reviews, or location in search results"
- Instead of "Poor Core Web Vitals" -> "Your site loads slowly, which pushes you down in search results"

### Step 3: Generate Report

1. Read the HTML template at `operations/templates/seo-audit.html`
2. Replace all `{{PLACEHOLDER}}` variables with audit data:
   - `{{CLIENT_NAME}}` -- business name
   - `{{WEBSITE_URL}}` -- their website URL
   - `{{DATE}}` -- current date
   - `{{LOGO_BASE64}}` -- base64-encode `shared/brand-assets/logo_icon_40.png`
   - `{{SCORE_ONPAGE}}`, `{{SCORE_TECHNICAL}}`, `{{SCORE_CONTENT}}`, `{{SCORE_LOCAL}}`, `{{SCORE_SPEED}}` -- 1-5 scores
   - `{{SCORE_ONPAGE_COLOR}}`, etc. -- "red" (1-2), "yellow" (3), or "green" (4-5)
   - `{{ISSUES_TABLE}}` -- HTML table rows with Area, Finding, Severity badge, Impact
   - `{{QUICK_WINS}}` -- HTML list items with highest-impact fixes
   - `{{KEYWORD_GAPS}}` -- HTML list items with search terms they're missing
3. Save the populated HTML to `revenue/lead-generation/prospects/[business-name]/outreach/seo-audit.html`

### Step 4: Convert to PDF

Use Playwright to convert the HTML to PDF:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///c:/Claude Code/OphidianAI/revenue/lead-generation/prospects/[business-name]/outreach/seo-audit.html', { waitUntil: 'networkidle' });
  await page.pdf({ path: 'c:/Claude Code/OphidianAI/revenue/lead-generation/prospects/[business-name]/outreach/seo-audit.pdf', format: 'Letter', printBackground: true });
  await browser.close();
  console.log('PDF generated');
})();
"
```

### Step 5: Summary

Output a brief summary for use in cold email or follow-up:
- One-sentence headline finding (for email subject line inspiration)
- 2-3 bullet points of the most compelling issues (for email body)
- Recommended service tier (Cleanup done-for-you, Cleanup advisory, or Growth retainer)

## Output Files

- `revenue/lead-generation/prospects/[business-name]/outreach/seo-audit.html`
- `revenue/lead-generation/prospects/[business-name]/outreach/seo-audit.pdf`

## Knowledge Base

After completing the SEO audit, index the findings summary:

1. Upsert the audit summary:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "research"
  records: [{
    "_id": "research/<prospect-slug>/seo-audit",
    "text": "<audit findings summary -- scores, key issues, recommendations>",
    "source_file": "<path to audit output file>",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "seo-audit", "<overall-score-tier>"]
  }]
```

2. Log: `Indexed to knowledge base: research/<prospect-slug>/seo-audit`

If indexing fails, log the error and continue.
