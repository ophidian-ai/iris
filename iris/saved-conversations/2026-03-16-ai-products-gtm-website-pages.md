# Session Handoff: AI Products GTM -- Website Pages

**Date:** 2026-03-16
**Status:** Website pages complete. Ready for next steps.

---

## What Was Done

### Strategic Planning (approved by Eric)

Read two .docx files (`iris/plans/ai_implementation_plan.docx` and `iris/plans/saas_platform_plan.docx`) and designed a go-to-market plan for 8 AI products. Key decisions:

- **Delivery model:** Templated (reusable scaffolds customized per client)
- **Pricing:** 3 tiers (Essentials $297/mo, Growth $497/mo, Pro $797/mo) + a la carte
- **Website approach:** Tier pages for selling + individual product pages for SEO + a la carte for objection handling
- **Infrastructure:** GoHighLevel white-label for CRM/email/reviews
- **Analytics:** Bundled into tiers only, never standalone
- **Phase 2 products:** Deferred until recurring revenue funds them

Full plan saved at `docs/superpowers/plans/2026-03-16-ai-products-go-to-market.md`.

### Website Pages Built

All changes are in the `engineering/projects/ophidian-ai` submodule. Build passes clean.

**New files (15):**

| File | Purpose |
|---|---|
| `src/components/sections/AIProductHero.tsx` | Reusable product page template (hero, features grid, how-it-works steps, standalone pricing with tier nudge CTA) |
| `src/app/services/ai-chatbot/layout.tsx` + `page.tsx` | Product page with SEO metadata |
| `src/app/services/content-generation/layout.tsx` + `page.tsx` | Product page with SEO metadata |
| `src/app/services/seo-automation/layout.tsx` + `page.tsx` | Product page with SEO metadata |
| `src/app/services/email-marketing/layout.tsx` + `page.tsx` | Product page with SEO metadata |
| `src/app/services/review-management/layout.tsx` + `page.tsx` | Product page with SEO metadata |
| `src/app/services/ad-management/layout.tsx` + `page.tsx` | Product page with SEO metadata |
| `src/app/services/crm-automation/layout.tsx` + `page.tsx` | Product page with SEO metadata |

**Modified files (4):**

| File | Change |
|---|---|
| `src/components/sections/PricingCards.tsx` | Replaced old one-time "AI Services" tab (AI Starter $3k / AI Growth $6k / AI Enterprise $12k) with new recurring "AI Growth" tab (Essentials $297/mo / Growth $497/mo / Pro $797/mo). Monthly/yearly toggle works. |
| `src/app/services/page.tsx` | Added `aiProducts` array + "AI Growth Products" grid section with 7 cards linking to individual product pages. Added `Link` import and Schema.org entries for AI services. |
| `src/app/services/layout.tsx` | Updated metadata title/description to include AI services. |
| `src/app/pricing/page.tsx` | Added full "AI Growth Plans" section (3 GlowCard tiers with features, setup fees, CTAs) between SEO and Add-ons sections. Added `Link` import. Added 2 new FAQ items about AI setup fees and a la carte purchasing. Updated FAQ subtitle. |

**Not modified:**
- Nav (`NavLava.tsx`) -- existing Services/Pricing links already route to updated pages. No dropdown needed yet.
- `/services/ai/` route -- pre-existing AI services page left as-is (different content: Assistants, Workflow Automation, Custom Integrations). Could be consolidated later.

---

## What Needs to Happen Next

Per the go-to-market plan (`docs/superpowers/plans/2026-03-16-ai-products-go-to-market.md`):

### Step 2: Update Outreach Pipeline (Week 1-2)
- Update cold email templates to pitch AI services, not just websites
- Adjust prospect scoring to weight businesses needing multiple services (higher LTV)
- Add lead magnets: free chatbot demo, free SEO audit, free website + AI assessment
- Files to update: `.claude/skills/cold-email-outreach/SKILL.md`, `persistent-memory/operations/outreach-system.md`, prospect scoring criteria

### Step 3: Build Product Templates (Weeks 2-4)
- AI Chatbot: reusable widget + RAG pipeline template (Claude API + Pinecone)
- Content Generation: brand voice profile template + content calendar scaffold
- SEO Automation: extend existing `seo-audit` skill into client-deliverable reporting flow
- CRM/Email/Reviews: GoHighLevel account setup + white-label config

### Step 4: Sell to Existing Pipeline (Week 2+)
- Revisit all prospects in `sales/lead-generation/prospects/` for AI service upsells
- Offer Bloomin' Acres Essentials tier as website add-on

---

## Open Questions

1. **`/services/ai/` vs new product pages** -- The old `/services/ai/` page (Assistants, Workflow Automation, Custom Integrations) overlaps with the new product pages. Should it be consolidated or redirected?
2. **GoHighLevel account** -- Not set up yet. Needed for CRM, email marketing, and review management delivery.
3. **Deploy** -- Changes are local only. Submodule needs commit + push + Vercel deploy when Eric is ready.

---

## Files Reference

- Plan: `docs/superpowers/plans/2026-03-16-ai-products-go-to-market.md`
- Decision log entry: `operations/decisions/log.md` (2026-03-16)
- Updated priorities: `iris/context/current-priorities.md`
- Source docs: `iris/plans/ai_implementation_plan.docx`, `iris/plans/saas_platform_plan.docx`
