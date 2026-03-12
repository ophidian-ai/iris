# SEO Service Pipeline -- Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build all assets needed to offer standalone SEO services -- audit template, audit skill, SOPs, pricing update, cold email templates, and pipeline tracking updates.

**Architecture:** Six deliverables built sequentially. Each builds on the previous. No code -- all markdown templates, SOPs, and skill definitions. The SEO audit skill ties together Firecrawl scanning + Claude analysis + Playwright PDF generation into an automated pipeline.

**Tech Stack:** Markdown, HTML (email templates + audit PDF template), Firecrawl, Playwright (PDF generation), Gmail send script.

---

## Task 1: Update Pricing Structure with SEO Tiers

**Files:**
- Modify: `operations/references/pricing-structure.md`

**Step 1: Add SEO Services section to pricing-structure.md**

Add a new `## SEO Services` section after the existing `## Add-Ons` section with these tiers:

```markdown
## SEO Services

### SEO Audit -- Free (Lead Magnet)

**Purpose:** Lead generation. Not a revenue line.

**Scope:**
- AI-automated site scan (Firecrawl + Claude analysis)
- 1-2 page branded PDF: on-page issues, keyword gaps, technical problems, GBP status
- Turnaround: under 1 hour of actual work

**When to offer:** Prospect has a decent website but poor search visibility. Use as cold email offer or follow-up deliverable.

---

### SEO Cleanup -- One-Time

| Delivery Mode | Price | Description |
|---|---|---|
| Done-for-you | $800-$1,200 | We get CMS access and implement all fixes |
| Advisory | $400-$600 | Prioritized action plan with step-by-step instructions |

**Scope:**
- On-page SEO fixes (meta tags, headings, alt text, URL structure)
- Schema markup (LocalBusiness, Organization, BreadcrumbList, FAQ)
- Google Search Console setup and sitemap submission
- Internal linking fixes
- Google Business Profile optimization
- Image optimization
- Keyword-to-page matrix
- Turnaround: 1-2 weeks

**When to recommend:** Business has a decent site but poor SEO. They don't need a redesign -- they need optimization.

---

### SEO Growth -- Monthly Retainer

| Scope Level | Monthly Fee | Includes |
|---|---|---|
| Standard | $200-$250/mo | Keyword tracking, 1 blog post/page update per month, GBP management, monthly report |
| Premium | $300-$350/mo | Everything in Standard + 2 posts/updates per month, quarterly strategy call, internal linking maintenance |

**Minimum commitment:** 3 months

**When to recommend:** After SEO Cleanup is complete, or for clients who want ongoing optimization without a cleanup project.
```

Also add to the `## Pricing Decision Criteria` table:

```markdown
| Has decent site but invisible on Google     | SEO Cleanup                       |
| Wants ongoing search visibility improvement | SEO Growth retainer               |
| Bad site AND bad SEO                        | Website rebuild (SEO bundled)     |
```

Also add to the `## Add-Ons` table:

```markdown
| SEO Cleanup (for existing website clients)  | $400-$800   |
```

Also add to the `## Cost to Deliver (Internal)` section:

```markdown
| Eric's time per SEO Cleanup client  | ~3-5 hrs    |
| Eric's time per SEO Growth client   | ~3-4 hrs/mo |
```

**Step 2: Commit**

```bash
git add operations/references/pricing-structure.md
git commit -m "Add SEO service tiers to pricing structure"
```

---

## Task 2: Create SEO Audit PDF Template

**Files:**
- Create: `operations/templates/seo-audit.html`

**Step 1: Create the branded HTML template**

Build an HTML file that mirrors the website assessment PDF style (dark gradient header, teal accent, OphidianAI branding). Template variables use `{{PLACEHOLDER}}` syntax.

The template should include these sections:

1. **Header** -- OphidianAI branding, "SEO Audit" title, client name, date
2. **Score Summary** -- Visual severity indicators for: On-Page SEO, Technical SEO, Content, Local/GBP, Mobile/Speed
3. **Issues Found** -- Table with columns: Area, Finding, Severity (High/Medium/Low), Impact
4. **Quick Wins** -- 3-5 highest-impact fixes with plain-language descriptions (outcome language, not jargon)
5. **Keyword Gaps** -- 3-5 search terms they should be showing up for but aren't
6. **Footer** -- OphidianAI contact info, "Prepared by OphidianAI" tagline

Template variables needed:
- `{{CLIENT_NAME}}`, `{{WEBSITE_URL}}`, `{{DATE}}`
- `{{SCORE_ONPAGE}}`, `{{SCORE_TECHNICAL}}`, `{{SCORE_CONTENT}}`, `{{SCORE_LOCAL}}`, `{{SCORE_SPEED}}`
- `{{ISSUES_TABLE}}` -- populated by the audit skill
- `{{QUICK_WINS}}` -- populated by the audit skill
- `{{KEYWORD_GAPS}}` -- populated by the audit skill

Keep it to 1-2 pages when rendered as PDF. Use the same color palette as cold emails: dark gradient (#0D1B2A), teal (#0DB1B2), lime green (#39FF14).

**Step 2: Commit**

```bash
git add operations/templates/seo-audit.html
git commit -m "Add SEO audit PDF template"
```

---

## Task 3: Create SEO Audit Skill

**Files:**
- Create: `.claude/skills/seo-audit/SKILL.md`

**Step 1: Write the skill definition**

The skill automates the full audit pipeline: scan -> analyze -> generate report -> convert to PDF.

```markdown
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
2. Replace all `{{PLACEHOLDER}}` variables with audit data
3. Save the populated HTML to `sales/lead-generation/prospects/[business-name]/outreach/seo-audit.html`

### Step 4: Convert to PDF

```bash
npx playwright chromium sales/lead-generation/prospects/[business-name]/outreach/seo-audit.html --pdf sales/lead-generation/prospects/[business-name]/outreach/seo-audit.pdf
```

### Step 5: Summary

Output a brief summary of findings for use in the cold email or follow-up:
- One-sentence headline finding (for email subject line inspiration)
- 2-3 bullet points of the most compelling issues (for email body)
- Recommended service tier (Cleanup done-for-you, Cleanup advisory, or Growth retainer)

## Output Files

- `sales/lead-generation/prospects/[business-name]/outreach/seo-audit.html`
- `sales/lead-generation/prospects/[business-name]/outreach/seo-audit.pdf`
```

**Step 2: Commit**

```bash
git add .claude/skills/seo-audit/SKILL.md
git commit -m "Add SEO audit skill for automated prospect analysis"
```

---

## Task 4: Create SEO Cleanup SOP

**Files:**
- Create: `operations/references/sops/seo-cleanup.md`

**Step 1: Write the SOP**

Adapts the existing `seo-full-setup.md` for standalone SEO delivery (not bundled with a website build). Structure:

```markdown
# SEO Cleanup SOP (Standalone Service)

For clients who have an existing website but need SEO optimization. This SOP covers both done-for-you and advisory delivery modes.

**Prerequisites:**
- SEO audit completed (see `.claude/skills/seo-audit/SKILL.md`)
- Client has agreed to SEO Cleanup engagement
- For done-for-you: CMS/hosting credentials received
- For advisory: client or their developer available to implement

---

## Phase 1: Deep Audit (Day 1-2)

Expand the free audit into a comprehensive analysis:

1. [ ] Run full Firecrawl crawl (all pages, not just top-level)
2. [ ] Complete keyword research (see seo-full-setup.md > Keyword Research)
3. [ ] Build keyword-to-page matrix
4. [ ] Analyze 3-5 competitor sites for keyword gaps
5. [ ] Review Google Business Profile (if exists)
6. [ ] Check Google Search Console (if exists) for crawl errors, indexing issues
7. [ ] Run Lighthouse audit on 3-5 key pages (mobile + desktop)
8. [ ] Document all findings in a prioritized task list

### Prioritization Framework

| Priority | Criteria | Examples |
|---|---|---|
| P0 - Critical | Blocking indexing or causing major visibility loss | noindex tags, broken sitemap, site not on HTTPS |
| P1 - High | Directly impacts rankings for target keywords | Missing meta tags, no schema, keyword cannibalization |
| P2 - Medium | Improves rankings and user experience | Image optimization, internal linking, content gaps |
| P3 - Low | Nice to have, minor impact | Open Graph tags, minor HTML validation issues |

---

## Phase 2: Implementation (Day 3-10)

### Done-for-You Mode

Work through the prioritized task list. For each item:

1. [ ] Document current state (screenshot or code snippet)
2. [ ] Implement the fix
3. [ ] Verify the fix (test in browser, re-run Lighthouse if applicable)
4. [ ] Log what was changed

Use these checklists as the implementation guide:
- On-page fixes: `operations/references/sops/seo-basics.md`
- Advanced SEO: `operations/references/sops/seo-full-setup.md`

### Advisory Mode

For each item in the prioritized task list, write:

1. **What's wrong** -- plain-language description of the issue
2. **Why it matters** -- impact on search visibility (outcome language)
3. **How to fix it** -- step-by-step instructions with screenshots where helpful
4. **Expected result** -- what they should see after fixing it

Compile into a branded PDF document using the advisory template.

---

## Phase 3: Verification (Day 10-12)

1. [ ] Re-run Lighthouse audit -- compare scores to pre-cleanup baseline
2. [ ] Verify all schema passes Google Rich Results Test
3. [ ] Confirm sitemap.xml is submitted and pages are being indexed
4. [ ] Spot-check 5 key pages for meta tags, headings, content optimization
5. [ ] Test site on mobile device
6. [ ] Run internal link check -- no broken links

---

## Phase 4: Handoff (Day 12-14)

1. [ ] Generate before/after comparison report
2. [ ] Include keyword-to-page matrix
3. [ ] Include Google Search Console access instructions
4. [ ] Include recommendations for ongoing optimization (seeds retainer upsell)
5. [ ] Send handoff email to client with all deliverables
6. [ ] Update prospect-tracker.md status

### Handoff Email Template

Subject: Your SEO cleanup is complete -- here's what changed

Body should include:
- Summary of what was done (3-5 bullet points, outcome language)
- Before/after scores
- "To keep this momentum going, here's what I'd recommend for ongoing optimization..." (retainer pitch)
- Offer a 15-minute call to walk through the results
```

**Step 2: Commit**

```bash
git add operations/references/sops/seo-cleanup.md
git commit -m "Add SEO cleanup SOP for standalone service delivery"
```

---

## Task 5: Create SEO Growth SOP

**Files:**
- Create: `operations/references/sops/seo-growth.md`

**Step 1: Write the SOP**

```markdown
# SEO Growth SOP (Monthly Retainer)

Ongoing SEO optimization for retainer clients. Covers the monthly workflow, reporting, and quarterly reviews.

**Prerequisites:**
- SEO Cleanup completed (or client's site is already well-optimized)
- Client has provided Google Search Console access
- Keyword baseline established
- KPIs agreed upon (rankings, organic traffic, GBP visibility)

---

## Onboarding (First Week)

1. [ ] Confirm Google Search Console access
2. [ ] Export baseline data: current rankings, organic traffic, top pages, top queries
3. [ ] Document target keywords and their current positions
4. [ ] Set up keyword tracking (manual spreadsheet for now -- upgrade to tool when client base justifies it)
5. [ ] Agree on KPIs with client: which metrics define success
6. [ ] Set up monthly reporting cadence (which day of month, delivery format)
7. [ ] Save onboarding data to `revenue/projects/active/[client-name]/seo/baseline.md`

---

## Monthly Cycle

### Week 1: Review & Plan

1. [ ] Pull current month's data from Google Search Console
2. [ ] Compare to previous month and baseline
3. [ ] Identify keyword movements (up, down, new, lost)
4. [ ] Identify top opportunities: keywords close to page 1, growing impressions
5. [ ] Plan this month's content and optimization work

### Week 2-3: Execute

Content and optimization work. Pick from this menu based on client scope:

- [ ] Write/optimize 1-2 blog posts targeting longtail keywords
- [ ] Update existing pages with better keyword targeting
- [ ] Add or improve internal links
- [ ] Create/update GBP posts (1-2 per month)
- [ ] Fix any new technical issues found in GSC
- [ ] Update schema markup if needed
- [ ] Optimize images (new or existing)

### Week 4: Report & Deliver

1. [ ] Generate monthly report (see Monthly Report Template below)
2. [ ] Send to client via email
3. [ ] Note any items that need client input for next month

---

## Monthly Report Template

```
# SEO Monthly Report -- {{CLIENT_NAME}}
## {{MONTH}} {{YEAR}}

### Summary
- [One-sentence summary of the month's performance]

### Key Metrics
| Metric | Last Month | This Month | Change |
|---|---|---|---|
| Organic Clicks | X | Y | +/-Z% |
| Impressions | X | Y | +/-Z% |
| Average Position | X | Y | +/-Z |
| Top Keywords on Page 1 | X | Y | +/-Z |

### What We Did
- [Bullet list of actions taken this month]

### What's Working
- [Keyword/page wins, traffic growth areas]

### Next Month Plan
- [Planned actions for next month]

### Recommendations
- [Any strategic recommendations or upsell opportunities]
```

---

## Quarterly Review

Every 3 months:

1. [ ] Compile quarterly trends (3 months of data)
2. [ ] Evaluate progress against original KPIs
3. [ ] Assess keyword strategy -- add new targets, retire underperformers
4. [ ] Discuss expansion opportunities (new content areas, Search Everywhere channels)
5. [ ] Schedule a 30-minute strategy call with client
6. [ ] Update keyword tracking document
7. [ ] Adjust pricing if scope has changed significantly
```

**Step 2: Commit**

```bash
git add operations/references/sops/seo-growth.md
git commit -m "Add SEO growth retainer SOP with monthly workflow and reporting"
```

---

## Task 6: Create SEO Cold Email Templates

**Files:**
- Modify: `operations/references/niche-offer-templates.md` (add SEO-specific section)
- Create: `.claude/skills/cold-email-outreach/templates/seo-cold-email-examples.md`

**Step 1: Add SEO section to niche-offer-templates.md**

Add a new section after "General Local Service" called "## SEO-Specific (Any Industry)":

```markdown
## SEO-Specific (Any Industry)

**Use when:** Prospect has a decent website but poor search visibility. We're selling SEO, not a website rebuild.

**Framing principle:** Revenue-impact language. Lead with what they're losing by being invisible, not what we're selling. Make the cost of inaction concrete.

**Offer:** "I ran a quick check on your site -- right now you're not showing up when people in [city] search for [their service]. I put together a short report showing exactly what's keeping you buried and what it would take to fix it. Want me to send it over?"

**Why it works:** Tells them they're losing money to competitors without using any technical language. The "report" is the free SEO audit.

**Delivery:** The SEO audit PDF generated by the SEO audit skill.
```

**Step 2: Create example templates file**

Create 3 SEO-specific cold email examples using revenue-impact framing:

```markdown
# SEO Cold Email Templates

Revenue-impact framing. Lead with what they're losing. Outcome language. Under 80 words.

---

## Template 1: Competitor Comparison

**Best for:** Markets where a clear competitor is visible on Google.

**Subject:** [Competitor] is getting your customers

Hi {{FIRST_NAME}},

I was looking for {{SERVICE}} in {{CITY}} and {{COMPETITOR}} came up first. {{BUSINESS_NAME}} didn't show up at all.

That means every person searching for what you do is finding them instead of you. I put together a quick report showing exactly why and what it would take to fix it.

Want me to send it over?

Eric Lefler
OphidianAI

---

## Template 2: Missing Calls

**Best for:** Service businesses that rely on phone calls and walk-ins.

**Subject:** Calls you're not getting from Google

Hi {{FIRST_NAME}},

Businesses like {{BUSINESS_NAME}} in {{CITY}} should be getting 20-30 calls a month just from people searching online. Right now your site isn't showing up for any of those searches.

I took a quick look and found a few specific things keeping you buried. I put together a short report -- yours to keep either way.

Want me to send it over?

Eric Lefler
OphidianAI

---

## Template 3: Invisible Reviews

**Best for:** Businesses with good reviews that aren't translating to web traffic.

**Subject:** 118 reviews but no one can find you

Hi {{FIRST_NAME}},

{{BUSINESS_NAME}} has {{REVIEW_COUNT}} reviews and a {{RATING}}-star rating -- that's the kind of reputation that sells itself. But when someone searches for {{SERVICE}} in {{CITY}}, your site doesn't come up.

All those happy customers aren't helping you reach new ones. I looked into why and put together a quick breakdown showing what's holding you back.

Want me to send it over?

Eric Lefler
OphidianAI
```

**Step 3: Commit**

```bash
git add operations/references/niche-offer-templates.md .claude/skills/cold-email-outreach/templates/seo-cold-email-examples.md
git commit -m "Add SEO-specific cold email templates with revenue-impact framing"
```

---

## Task 7: Update Pipeline Tracking

**Files:**
- Modify: `sales/lead-generation/prospect-tracker.md`

**Step 1: Add new pipeline stages and service type column**

Add "SEO Audit Delivered" and "Offer Delivered" to the Status Legend table:

```markdown
| SEO Audit Delivered | Free SEO audit PDF sent to prospect              |
| Offer Delivered     | Niche-specific free offer delivered after reply   |
```

Add a "Service" column to the Pipeline table after "Industry" with values: Website, SEO, or Both.

**Step 2: Commit**

```bash
git add sales/lead-generation/prospect-tracker.md
git commit -m "Add SEO pipeline stages and service type column to prospect tracker"
```

---

## Task 8: Update CLAUDE.md with SEO Service

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update the Services/Skills sections**

Add the SEO audit skill to the Skills section. Update the Services context to reflect that OphidianAI now offers standalone SEO services in addition to website builds.

In the `## Skills` section under `### Workflow Skills`, add:

```markdown
- **SEO audit** -- `.claude/skills/seo-audit/` -- Automated SEO audit with branded PDF report
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Add SEO audit skill and service references to CLAUDE.md"
```

---

## Execution Order

| Task | Depends On | Estimated Time |
|---|---|---|
| Task 1: Update pricing structure | None | 5-10 min |
| Task 2: Create SEO audit PDF template | None | 15-20 min |
| Task 3: Create SEO audit skill | Task 2 (needs template path) | 10-15 min |
| Task 4: Create SEO cleanup SOP | None | 10-15 min |
| Task 5: Create SEO growth SOP | None | 10-15 min |
| Task 6: Create SEO cold email templates | None | 10-15 min |
| Task 7: Update pipeline tracking | None | 5 min |
| Task 8: Update CLAUDE.md | Task 3 (needs skill path) | 5 min |

**Parallelizable:** Tasks 1, 2, 4, 5, 6, 7 are all independent and can run in parallel. Task 3 depends on Task 2. Task 8 depends on Task 3.

**Total estimated time:** 45-60 minutes if run with parallel subagents.
