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
2. Interest -> **create prospect folder** (`sales/lead-generation/prospects/[slug]/`) with README, research, mockup, demo, proposal dirs -> auto-prep (proposal + demo in background), draft acknowledgment, notify Eric
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

**Statewide Indiana** (expanded 2026-03-17 from 5-city local radius)

- **Tier 1 (metro, priority):** Indianapolis / Carmel / Fishers / Noblesville, Fort Wayne, Evansville
- **Tier 2 (mid-size):** South Bend / Mishawaka, Bloomington, Lafayette / West Lafayette, Terre Haute
- **Tier 3 (original local):** Columbus, Greensburg, North Vernon, Greenwood, Franklin

## Lead Sources

- **Tier 1:** Yelp (via Firecrawl), Google Maps/Local Pack
- **Tier 2:** Chamber of Commerce, local directories
- **Tier 3 (April 2026):** Indiana Secretary of State new business registrations database (monthly purchase, covers entire state). Highest-intent source -- new businesses need websites from day one.
- **Good industries:** Auto services, fitness/gyms, food/restaurants, personal services, health/wellness, professional services
- **Bad industries:** HVAC/plumbing (franchises), lawn care/landscaping (merged businesses), retail (already on Shopify)

## Email Infrastructure

**Current (pre-April 2026):**
- Sending from: `eric.lefler@ophidianai.com` (temporary -- personal email used for outreach)
- Warmbox Solo ($19/mo): Active, warmup complete, sending live outreach
- DNS: SPF (`-all`), DKIM, DMARC (`p=quarantine`) verified
- Deliverability: 10/10 (mail-tester.com, verified 2026-03-17)

**Planned (April 2026):**
- `value@ophidianai.com` -- Dedicated outreach inbox on primary domain. Display name: "Eric Lefler". Created when GWS downgrades to Starter on Jun 2, 2026, or sooner if a seat is available.
- `value@getophidianai.com` -- Second outreach domain for 2x capacity and reputation isolation. Display name: "Eric Lefler".
- `eric.lefler@ophidianai.com` -- Reserved for replies, proposals, client communication only. No cold outreach.
- Second domain (`getophidianai.com`) needs: registration (~$12/yr), GWS Starter ($7/mo), SPF/DKIM/DMARC, 14-day Warmbox warmup
- Both outreach inboxes need: List-Unsubscribe header (URL + One-Click, not mailto) built into the email pipeline. Build a proper `/unsubscribe` endpoint on ophidianai.com. Do NOT add List-Unsubscribe to eric.lefler@ophidianai.com -- personal email stays clean.
- Total added cost: ~$14/mo for 2x sending capacity with domain isolation

## Related

- `operations/prospect-management.md`
- `operations/email-rules.md`
- `tools/gws-cli.md`
- `preferences/eric-preferences.md`
