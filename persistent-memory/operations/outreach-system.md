---
tags:
  - memory
  - operations
triggers:
  - outreach
  - cold email
  - follow up
  - send batch
  - template rotation
  - warmup
  - lead source
  - find prospects
  - weekly cadence
created: 2026-03-10
updated: 2026-03-10
---

# Outreach System

Full SOP: `operations/references/sops/weekly-outreach.md`
Email warmup SOP: `operations/references/sops/email-warmup.md`
Automation setup: `operations/automation/outreach-scheduler.md`

## Weekly Cadence

| Day | Task | Skill/Command |
|---|---|---|
| Mon | Research 10-20 leads + score | `/run-outreach-pipeline` |
| Tue | Draft cold emails + stage as drafts | Auto-selects least-recently-used template |
| Wed | Send batch 8-10 AM ET | `node .claude/skills/gws-cli/scripts/send_staged.js` |
| Thu | Check replies + deliver offers | `/offer-delivery` for "yes" responses |
| Fri | Review template performance + plan follow-ups | Check `template-rotation.md` |

## Volume Targets

| Phase | Leads/week | Daily send limit | Send spacing |
|---|---|---|---|
| Start | 10 | 20/day | 5 min |
| Ramp (month 2) | 20 | 35/day | 3 min |
| Max | 30 | 50/day | 3 min |

## Follow-Up Schedule

- Day 3-4: First follow-up
- Day 7-8: Second follow-up
- Day 14: Final graceful close

## Template Rotation

- Tracker: `sales/lead-generation/template-rotation.md`
- Three categories: Website (W1-W4), SEO (S1-S4), Hybrid (H1-H4)
- Always pick least-recently-used within category
- Never send same template to two prospects in same batch
- Flag templates with 10+ sends and 0 replies for replacement
- Alert: If reply rate drops below 5% for two consecutive weeks, stop and audit

## Email Warmup

- Tool: Warmbox Solo ($19/mo)
- Ramp: 5-10 warmup emails/day initially, ramp to 30-40/day over 2-3 weeks
- Minimum 14 days before any cold outreach
- Keep warmup running during active campaigns
- DNS required: SPF, DKIM, DMARC records
- Target: 95%+ inbox placement before cold outreach
- **Current status:** Warming up. No follow-ups or new cold outreach until after 2026-03-19.

## Lead Sources

- **Tier 1 (proven):** Yelp (via Firecrawl), Google Maps/Local Pack
- **Tier 2:** Chamber of Commerce, Visit Columbus Indiana
- **Good industries:** Auto services, fitness/gyms, food/restaurants, personal services
- **Bad industries:** HVAC/plumbing (franchises), lawn care/landscaping (merged businesses), retail (already on Shopify)
- **Filtering:** 50+ reviews + bad website, established 5+ years, active socials, service business without online booking

## Safety Rails

- Emails staged as drafts -- never auto-sent
- Eric always reviews before sending
- Staged manifest: `sales/lead-generation/staged-emails.json`
- Pipeline fails gracefully with ClickUp notification

## Related

- `operations/prospect-management.md`
- `operations/email-rules.md`
- `tools/gws-cli.md`
- `preferences/eric-preferences.md`
