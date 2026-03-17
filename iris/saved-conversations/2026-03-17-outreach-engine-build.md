# Outreach Engine Build -- Handoff Doc

**Date:** 2026-03-17
**Status:** Phases 1-3 complete, Phases 4-7 remaining

---

## What Was Done This Session

### Business Audit & Pulse Report
- Comprehensive business audit across all departments
- Created branded Pulse Report PDF (Health Score: 42/100) and emailed to Eric
- Created 5 implementation plans for identified threats (cold email, revenue, follow-ups, initiative sprawl, pricing)

### Outreach Engine Design
- Analyzed Alex Hormozi email marketing transcript for applicable principles
- Identified 7 key gaps in current cold email system (negative-first openings, no PS, CI1 underused, no phone calls, bad timing, wasted preview text, selling before earning the right)
- Brainstorming session: 5 clarifying questions answered, 3 approaches evaluated
- Full design spec written with spec review loop (8 issues found and fixed)
- Spec: `docs/superpowers/specs/2026-03-17-outreach-engine-design.md`

### Implementation (Phases 1-3 of 7)
- Full implementation plan written with plan review loop (8 issues found and fixed)
- Plan: `docs/superpowers/plans/2026-03-17-outreach-engine-implementation.md`

**Completed tasks:**

| Task | What Was Built |
|---|---|
| 1.1 | Failed Outreach Google Sheet tab (18 columns) |
| 1.2 | Successful Outreach Google Sheet tab (23 columns) |
| 1.3 | Pipeline sheet restructured (12 new analytics columns W-AH) |
| 1.4 | `operations/automation/scripts/outreach-sheets.js` -- shared sheets module (10 functions, tested) |
| 1.5 | `.claude/skills/outreach-tracker/SKILL.md` -- centralized sheet operations skill |
| 2.1 | `.claude/skills/cold-email-outreach/SKILL.md` -- full rewrite, Hormozi CI1 + ALT templates (795 lines) |
| 2.2 | `sales/lead-generation/template-rotation.md` -- restructured for A/B testing with legacy preservation |
| 2.1+ | `.claude/skills/gws-cli/scripts/stage_email.js` -- added scheduledDate, niche, city fields |
| 3.1 | `.claude/skills/follow-up-email/SKILL.md` -- full rewrite, 5-touch + breakup sequence (330 lines) |

### Commits (oldest to newest)

```
2194999 feat: add Outreach Engine system design spec
4d343f0 feat: add Outreach Engine implementation plan (7 phases, 19 tasks)
f64364e chore: create Failed/Successful Outreach sheets and add analytics columns to Pipeline
6f78a75 feat: add shared Google Sheets I/O module for outreach automation
5edf5c2 feat: add outreach-tracker skill for centralized sheet operations
19c1520 feat: rewrite cold-email-outreach skill with Hormozi value-first framework
608a5ac feat: rewrite cold-email-outreach with Hormozi value-first CI1 + ALT templates
e9df118 feat: restructure template rotation for CI1 + ALT A/B testing with legacy preservation
e3ec44f feat: add scheduledDate, niche, city fields to stage_email.js manifest
```

---

## What's Remaining

### Phase 4: Orchestrator
- **Task 4.1:** Build `outreach-engine` orchestrator skill (`.claude/skills/outreach-engine/SKILL.md`)
  - Full state machine from spec Section 4
  - All status values and transition rules
  - Cadence management (follow-up date computation, weekend shift, Question Pending pause/resume)
  - Dispatch table (which skill handles each action)
  - Re-engagement check from Failed Outreach sheet

### Phase 5: Automation
- **Task 5.1:** Build `send-scheduler.js` (`operations/automation/scripts/send-scheduler.js`)
  - Reads staged-emails.json, filters by scheduledDate == today, sends with 5-min spacing
  - Updates Pipeline sheet + template rotation after each send
  - Recalculates follow-up dates for first-touch sends
  - `--dry-run` flag for testing
- **Task 5.2:** Build `inbox-monitor` skill (`.claude/skills/inbox-monitor/SKILL.md`)
  - 3x daily reply detection (7am via morning-coffee, noon + 4pm standalone)
  - Two modes: orchestrated (returns data for briefing) and standalone (logs + notifies)
  - Dedup via Reply Date column
  - Classification: Interest, Question, Negative
  - Auto-prep for interest replies (proposal + demo in background)
  - Question Pending pause/resume cadence logic (14-day timeout)
- **Task 5.3:** Update `morning-coffee` skill
  - Replace inline reply check with inbox-monitor delegation
  - Add Failed/Successful sheet stats to briefing
  - Add follow-up due flagging
  - Add CI1 vs ALT performance comparison

### Phase 6: Interest Flow
- **Task 6.1:** Update `offer-delivery` -- no longer terminal, transitions to proposal flow, auto-prep, proposal follow-up reminder (3-5 day calendar event)
- **Task 6.2:** Update `proposal-generator` -- revision support (v1, v2, v3+), feedback input, clarifying questions
- **Task 6.3:** Update `client-onboarding` -- guard check (status must be "Proposal Accepted"), move to Successful Outreach sheet after onboarding

### Phase 7: Pipeline & Migration
- **Task 7.1:** Rewrite `outreach-pipeline` -- Monday orchestrator, calls outreach-engine, re-engagement check, schedule computation
- **Task 7.2:** Update SOPs (`weekly-outreach.md`, `outreach-scheduler.md`)
- **Task 7.3:** Migrate 31 existing prospects -- move 3 Inactive to Failed, populate new columns for active prospects, verify no hardcoded column refs remain
- **Task 7.4:** Update persistent memory + decision log
- **Task 7.5:** Create + register Windows Task Scheduler setup script (4 tasks: WeeklyPipeline Mon 7am, SendScheduler weekdays 10am, InboxNoon weekdays 12pm, Inbox4PM weekdays 4pm)

---

## Key Design Decisions (for reference)

- Follow-up cadence: Day 0, 3, 7, 12, 18, 25 (breakup)
- CI1 default (67%) + ALT alternate (33%) for A/B testing
- Full analytics tracking (copy-level) across 3 Google Sheets
- First-touch on Wednesday 10am, follow-ups on exact due date 10am
- Auto-send at 10am (policy change from manual-send). Eric reviews before 10am.
- 3x daily inbox monitoring (7am, noon, 4pm)
- Interest reply -> auto-prep proposal + demo, Eric reviews before sending
- Proposal rejection -> negotiation loop, only Eric closes
- Onboarding only after proposal accepted
- Breakup = clean close, door open. 3 sentences max.
- Post-breakup -> Failed Outreach sheet. Re-engagement eligible after 90 days.

---

## Key Files

| File | Purpose |
|---|---|
| `docs/superpowers/specs/2026-03-17-outreach-engine-design.md` | Full system spec |
| `docs/superpowers/plans/2026-03-17-outreach-engine-implementation.md` | Implementation plan (7 phases, 20 tasks) |
| `operations/automation/scripts/outreach-sheets.js` | Shared Google Sheets I/O module |
| `.claude/skills/outreach-tracker/SKILL.md` | Sheet operations skill |
| `.claude/skills/cold-email-outreach/SKILL.md` | Rewritten cold email skill (CI1 + ALT) |
| `.claude/skills/follow-up-email/SKILL.md` | Rewritten follow-up skill (5-touch + breakup) |
| `sales/lead-generation/template-rotation.md` | A/B testing tracker |
| `.claude/skills/gws-cli/scripts/stage_email.js` | Updated with scheduledDate field |
| Spreadsheet `1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0` | 3 tabs: Pipeline, Failed Outreach, Successful Outreach |
