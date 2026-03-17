---
tags:
  - memory
  - operations
triggers:
  - decision
  - why did we
  - department
  - who owns
  - boundary
created: 2026-03-10
updated: 2026-03-10
---

# Key Decisions

Full decision log: `operations/decisions/log.md` (append-only, format: `[YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...`)

## Recent Decisions (2026-03-17)

- **Outreach engine overhaul** -- Replaced 0%-reply-rate system with Hormozi-inspired automated engine. CI1 (3 Creative Ideas) default + ALT (One Sharp Insight) for A/B testing. 6-touch cadence (Day 0/3/7/12/18/25). Auto-send at 10am ET. 3x daily inbox monitoring. Full analytics across 3 Google Sheets. Proposal negotiation loop. Onboarding gated on acceptance.
- **Auto-send policy change** -- Emails now send automatically at 10am ET. Eric reviews/edits/deletes before 10am. Replaces manual-send safety rail.
- **3 Google Sheets** -- Active Pipeline (restructured with full analytics), Failed Outreach (new), Successful Outreach (new). All I/O via shared outreach-sheets.js module.

## Earlier Decisions (2026-03-07)

- **Warmbox Solo ($19/mo)** for email warmup -- 14+ day ramp required before cold outreach
- **SEO service launch:** Free audit (lead magnet) + one-time cleanup ($400-$1,200) + monthly retainer ($200-$350)
- **Social media:** Facebook, Instagram, TikTok using hybrid content (AI templates + on-camera anchor), 1-2 hrs/week sustainable
- **Client agreements:** Split IP ownership, $500 opt-out for "Built by OphidianAI" attribution, 50/50 payment split (Starter/Pro), 33/33/33 (E-Commerce), use Dropbox Sign ($15/mo)

## Department Boundaries

- **Engineering** owns: project builds, dev tools, technical references, design patterns, specs
- **Operations** owns: SOPs, invoicing, proposals, project tracking, decisions, file maintenance
- **Revenue** owns: lead gen, prospect pipeline, outreach (not project delivery)
- **Skills** stay in `.claude/skills/` (cross-department)
- **Agent definitions** stay in `.claude/agents/<department>/`

## Related

- `operations/pricing-and-services.md`
- `operations/client-agreements.md`
- `operations/outreach-system.md`
