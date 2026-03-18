---
tags:
  - memory
  - operations
triggers:
  - new prospect
  - score lead
  - qualification
  - niche offer
  - prospect folder
  - disqualify
  - hot lead
  - warm lead
created: 2026-03-10
updated: 2026-03-13
---

# Prospect Management

Niche offers reference: `operations/references/niche-offer-templates.md`

## Prospect Folder Structure

**Rule: Prospect folders are only created when a prospect replies with interest.** Do NOT create folders for cold prospects. All pre-reply data (scores, emails, research notes) lives in the Pipeline Google Sheet and staged-emails.json only. Folders are created when the interest reply flow triggers demo/proposal prep.

Path: `sales/lead-generation/prospects/[business-slug]/`

Standard layout (created on interest reply):

- `README.md` -- Prospect brief (contact info, current site issues, scope, pricing tier, upsell opportunities, sales angle)
- `research/technical-audit.md` -- Website audit findings
- `research/score-card.md` -- Scoring results
- `mockup/index.html` -- Self-contained pitch mockup (no external deps)
- `demo/` -- Live demo site (Next.js project, deployed to Vercel)
- `proposal/` -- Generated proposal (HTML + PDF)

## Scoring Tiers (out of 25)

| Tier | Score | Action |
|---|---|---|
| Hot | 20-25 | Full research + mockup + outreach immediately |
| Warm | 14-19 | Research + outreach, mockup if time allows |
| Cool | 8-13 | Add to list, revisit later |
| Skip | <8 | Don't invest time |

## Disqualifiers (override score)

- Franchise/chain (corporate controls website)
- Already has an agency (found via footer credits)
- Site built recently (copyright within 1-2 years, modern framework)
- No contact info (can't reach decision-maker)
- Out of budget (business too small for Starter tier)

## Niche Offers (free, delivered within 24 hours)

| Niche | Offer | Time |
|---|---|---|
| Auto services | 1-page search plan vs competitors | 10-15 min |
| Health & wellness | 3 polished service descriptions | 10-15 min |
| Restaurants | Mobile menu page mockup | 10-15 min |
| Retail | Product grid mockup with their inventory | 10-15 min |
| Professional services | Homepage layout mockup | 10-15 min |
| General local service | 3-5 bullet search visibility plan | 10-15 min |
| SEO-specific | Full SEO audit PDF | ~1 hour |

- Key principle: Offer must be touchable/visual, specific to their business, small enough to deliver fast
- SEO offers require competitive search first (search "[service] in [city]" with Firecrawl, name actual competitors in email)
- Post-acceptance: Include "15-minute call offer" in delivery email -- the call closes the deal

## Pipeline Statuses

New Lead -> Researching -> Outreach Sent -> Follow-Up Sent -> Replied -> Offer Delivered -> SEO Audit Delivered -> Meeting Scheduled -> Proposal Sent -> Closed Won / Closed Lost / Inactive

## Related

- `operations/prospect-pipeline.md`
- `operations/outreach-system.md`
- `operations/pricing-and-services.md`
