# AI Products Go-to-Market Plan

**Created:** 2026-03-16
**Status:** Approved
**Source:** iris/plans/ai_implementation_plan.docx + iris/plans/saas_platform_plan.docx

---

## Strategic Decisions

- **Delivery model:** Templated (B) -- reusable scaffolds customized per client
- **Website approach:** Tiers + individual product pages (C) -- tiers sell, product pages attract via SEO, a la carte handles objections
- **Pricing:** Flat-rate, market-adjusted for local SMBs
- **Infrastructure:** GoHighLevel white-label for CRM/email/reviews
- **Analytics:** Bundled into tiers only, never standalone
- **Phase 2 products (differentiators):** Deferred until recurring revenue funds them

---

## Phase 1: Table-Stakes Products

### Product Lineup

| # | Product | Delivery Method |
|---|---|---|
| 1 | AI Chatbot | Claude API + Pinecone RAG, embedded widget |
| 2 | Content Generation | Claude API + templated workflow |
| 3 | SEO Automation | Existing SEO skill + automated reporting |
| 4 | Email Marketing | GoHighLevel white-label |
| 5 | Review Management | GoHighLevel white-label |
| 6 | Analytics Dashboard | Looker Studio or AgencyAnalytics (bundled only) |
| 7 | Ad Optimization | AI tools + manual oversight |
| 8 | CRM Workflows | GoHighLevel white-label |

### Build Order

1. AI Chatbot -- highest perceived value, easiest to demo
2. Content Generation -- already doing internally, productize
3. SEO Automation -- extend existing skill
4. CRM Workflows + Email Marketing + Review Management -- deploy together via GoHighLevel
5. Ad Optimization -- requires more hands-on, add last
6. Analytics Dashboard -- builds as other products come online

---

## Pricing Structure

### Tiers

| | Essentials ($297/mo) | Growth ($497/mo) | Pro ($797/mo) |
|---|---|---|---|
| AI Chatbot | Standard (website only) | Advanced (website + 1 channel) | Advanced + multi-channel |
| Content Generation | 4 blogs + 12 social posts | 8 blogs + 20 social posts | 12 blogs + 30 social + video scripts |
| SEO | Monthly audit + report | Managed SEO (fixes + optimization) | Full SEO + content strategy |
| Email Marketing | -- | 2 campaigns/mo | 4 campaigns/mo + automated sequences |
| Review Management | -- | Monitoring + AI responses | Full management + review gen campaigns |
| Ad Management | -- | -- | Google + Meta (up to $3K spend) |
| CRM Workflows | -- | -- | Full pipeline + lead scoring |
| Analytics | Monthly PDF report | Live dashboard | Dashboard + AI-written insights |
| **Setup Fee** | **$500** | **$1,000** | **$1,500** |

### A La Carte

| Product | Setup | Monthly |
|---|---|---|
| AI Chatbot | $500 | $149/mo |
| Content (4 blogs + 12 social) | -- | $149/mo |
| Content (8 blogs + 20 social) | -- | $349/mo |
| SEO Management | $400 | $299/mo |
| Email Marketing | $500 | $249/mo |
| Review Management | -- | $249/mo |
| Ad Management | $500 | $399/mo |
| CRM Workflows | $750 | $297/mo |

### Revenue Projections

| Scenario | Clients | MRR |
|---|---|---|
| 5 Essentials | 5 | $1,485/mo |
| 3 Essentials + 2 Growth | 5 | $1,885/mo |
| 3 Essentials + 2 Growth + 1 Pro | 6 | $2,682/mo |
| 5 Essentials + 3 Growth + 2 Pro | 10 | $4,470/mo |

---

## Website Pages

```
ophidianai.com/
  /services                    -- Overview + tier comparison + CTA
  /services/pricing            -- Full pricing (tiers + a la carte + FAQ)
  /services/ai-chatbot         -- Product page (SEO target)
  /services/content-generation
  /services/seo
  /services/email-marketing
  /services/review-management
  /services/ad-management
  /services/crm-automation
```

Each product page follows a template:
- What it does (2-3 sentences)
- Key features (4-5 bullets)
- How it works (3-step visual)
- Standalone pricing with tier upsell nudge
- CTA: "Get started" or "See it in action"
- SEO-optimized for "[product] for [industry]"

---

## Go-to-Market Timeline

### Week 1: Website Pages
- Build /services, /services/pricing, and 7 individual product pages
- Deploy on ophidianai.com (Next.js + Vercel)

### Week 1-2: Update Outreach
- Revise cold email templates to pitch AI services (not just websites)
- Adjust prospect scoring for multi-service potential (higher LTV)
- Add lead magnets: free chatbot demo, free SEO audit

### Weeks 2-4: Build Product Templates
- AI Chatbot: reusable widget + RAG pipeline template
- Content Generation: brand voice profile + content calendar scaffold
- SEO Automation: client-deliverable reporting flow
- CRM/Email/Reviews: GoHighLevel setup + white-label config

### Week 2+: Sell to Existing Pipeline
- Revisit all prospects in sales/lead-generation/prospects/ for AI upsells
- Offer Bloomin' Acres Essentials tier as website add-on
- Expand targeting to businesses with existing websites that need AI/automation

### Ongoing: Content + SEO Flywheel
- Product pages target local + industry keywords
- Blog posts demonstrating AI product value
- Social content showing before/after results

### Sales Motion
- **Old:** "Your website is outdated, let us rebuild it" (one-time)
- **New:** "Your website is outdated, let us rebuild it and keep growing your business with AI" (project + recurring)
- Every website project becomes a gateway to a monthly tier

### Lead Magnets (pick 1-2)
- Free AI chatbot demo (trained on prospect's existing site content)
- Free SEO audit (already built)
- Free website + AI assessment (broader scoring)

---

## What's NOT in Scope Yet

- Phase 2 differentiator products (8 products from Part Two of the implementation plan)
- SaaS platform / self-serve dashboard
- Case studies (build after delivering to first 2-3 clients)
