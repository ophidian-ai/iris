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
  - outreach engine
  - inbox monitor
  - send scheduler
created: 2026-03-10
updated: 2026-03-17
---

# Outreach System

**Overhauled 2026-03-17** -- Hormozi-inspired value-first engine replacing the old negative-first template system.

Spec: `docs/superpowers/specs/2026-03-17-outreach-engine-design.md`
Plan: `docs/superpowers/plans/2026-03-17-outreach-engine-implementation.md`
Full SOP: `operations/references/sops/weekly-outreach.md`
Email warmup SOP: `operations/references/sops/email-warmup.md`
Automation setup: `operations/automation/outreach-scheduler.md`

## Architecture

Orchestrator + specialized skills pattern:
- `outreach-engine` -- Central orchestrator, owns state machine
- `cold-email-outreach` -- CI1 (default) + ALT (A/B test) templates
- `follow-up-email` -- 5-touch + breakup (FU1-FU4 + Breakup)
- `inbox-monitor` -- 3x daily reply detection and classification
- `outreach-tracker` -- 3 Google Sheets management
- `send-scheduler.js` -- Automated daily sends at 10am ET
- `outreach-sheets.js` -- Shared module for all sheet I/O

## Weekly Cadence

| Day | Time | What Happens |
|---|---|---|
| Monday | 7:00 AM | Pipeline runs: research, score, draft all emails, stage with scheduledDate |
| Monday | 10:00 AM | Any follow-ups due Monday send automatically |
| Tue-Fri | 10:00 AM | Scheduled emails for that day send automatically |
| Wednesday | 10:00 AM | New first-touch batch sends (B2B optimal day) |
| Every day | 7 AM, 12 PM, 4 PM | Inbox monitor checks for replies |

## Email Templates

- **CI1 (3 Creative Ideas)** -- Default, 67% of sends. Value-first, industry insight opener, 3 actionable ideas, PS quick win.
- **ALT (One Sharp Insight)** -- A/B test, 33% of sends. One sharp observation, shorter format.
- **Old W/S/H/A templates retired** from first-touch. Angles preserved as follow-up material.

## Follow-Up Cadence

6-touch sequence over 25 days:
- Day 0: First-touch (CI1 or ALT)
- Day 3: FU1 (micro value drop)
- Day 7: FU2 (different angle entirely)
- Day 12: FU3 (social proof / pattern)
- Day 18: FU4 (last value drop, shortest)
- Day 25: Breakup (clean close, door open)

Follow-ups send on their exact due date at 10am ET. Weekend dates shift to Monday.

## Send Policy

**Auto-send at 10am ET** (policy change from manual-send as of 2026-03-17). Eric reviews/edits/deletes drafts before 10am. Anything still staged at 10am sends automatically via `send-scheduler.js`.

## 3 Google Sheets (Full Analytics)

Spreadsheet: `1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0`
- **Pipeline** -- Active prospects (27 columns A-AH)
- **Failed Outreach** -- Completed sequences / declined (18 columns)
- **Successful Outreach** -- Closed deals (23 columns)

All sheet I/O via `outreach-sheets.js` module. Never hardcode column letters.

## Interest Reply Flow

1. Inbox-monitor detects reply, classifies as Interest/Question/Negative
2. Interest -> auto-prep (proposal + demo in background), draft acknowledgment, notify Eric
3. Eric reviews package, sends proposal + demo
4. Meeting scheduled -> Eric presents
5. Proposal accepted -> client-onboarding fires -> Successful Outreach sheet
6. Proposal rejected -> clarifying questions -> revised proposal -> loop (Eric closes manually)

## Paths to Failed Outreach (3 only)

1. Full 6-touch sequence with no reply (automatic)
2. Prospect explicitly declines (after Eric confirms close)
3. Eric manually closes a negotiation

## Re-engagement

Failed prospects become re-engagement eligible 90 days after last touch. Monday pipeline checks for eligible prospects and surfaces to Eric.

## Target Geofence

- Columbus, IN (primary)
- Greensburg, IN
- North Vernon, IN
- Greenwood, IN
- Franklin, IN

## Lead Sources

- **Tier 1:** Yelp (via Firecrawl), Google Maps/Local Pack
- **Tier 2:** Chamber of Commerce, Visit Columbus Indiana, local directories
- **Good industries:** Auto services, fitness/gyms, food/restaurants, personal services, health/wellness, professional services
- **Bad industries:** HVAC/plumbing (franchises), lawn care/landscaping (merged businesses), retail (already on Shopify)

## Email Warmup

- Tool: Warmbox Solo ($19/mo)
- **Current status:** Active. Warmup complete. Sending live outreach.
- DNS: SPF, DKIM, DMARC verified

## Related

- `operations/prospect-management.md`
- `operations/email-rules.md`
- `tools/gws-cli.md`
- `preferences/eric-preferences.md`
