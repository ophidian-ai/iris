# SEO Cleanup SOP (Standalone Service)

For clients who have an existing website but need SEO optimization. Covers both done-for-you and advisory delivery modes.

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

Compile into a branded PDF document.

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

### Handoff Email Structure

Subject: Your SEO cleanup is complete -- here's what changed

Body:
- Summary of what was done (3-5 bullet points, outcome language)
- Before/after scores
- "To keep this momentum going, here's what I'd recommend for ongoing optimization..." (retainer pitch)
- Offer a 15-minute call to walk through the results
