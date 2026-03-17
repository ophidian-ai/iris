# Outreach Engine Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully automated outreach engine that manages the complete prospect lifecycle from lead generation to client onboarding, using Hormozi-inspired value-first email templates and full analytics tracking.

**Architecture:** Orchestrator + specialized skills pattern. A central `outreach-engine` skill manages the prospect state machine and dispatches to rewritten `cold-email-outreach`, `follow-up-email`, new `inbox-monitor`, and new `outreach-tracker` skills. A shared `outreach-sheets.js` Node.js module handles all Google Sheets I/O. A `send-scheduler.js` script handles automated daily sends.

**Tech Stack:** Node.js scripts for automation, Google Sheets via GWS CLI, Gmail via GWS CLI, Claude Code skills (markdown SKILL.md files), Windows Task Scheduler for cron triggers.

**Spec:** `docs/superpowers/specs/2026-03-17-outreach-engine-design.md`

**Note on ordering:** This plan builds outreach-tracker (Task 1.5) in Phase 1, before email skills (Phases 2-3) and the orchestrator (Phase 4). The spec's Section 10.3 rollout order lists outreach-tracker later, but the plan's order is intentional -- the tracker depends only on the sheets module, not on email skills. Phase 1 establishes the full data layer before any skills are rewritten.

---

## Phase 1: Foundation (Sheets + Shared Module)

Build the data layer first. Everything else depends on reliable sheet reads/writes.

### Task 1.1: Create Failed Outreach Google Sheet

**Files:**
- None (Google Sheets UI or GWS CLI)

- [ ] **Step 1: Create the sheet tab**

Add a "Failed Outreach" tab to the existing spreadsheet with all 18 headers per spec Section 6.2.

```bash
gws sheets spreadsheets batchUpdate --params '{"spreadsheetId":"1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0"}' --json '{"requests":[{"addSheet":{"properties":{"title":"Failed Outreach"}}}]}'
```

Then write headers A1:R1:
```
Business Name | Contact Name | Email | Industry | City | Prospect Score | First-Touch Template | Alternate Template | Touches Sent | Which Touch Got Reply | Reply Type | Failure Reason | First-Touch Date | Last Touch Date | Days in Sequence | Proposals Sent | Re-engagement Eligible | Notes
```

- [ ] **Step 2: Verify headers**

```bash
gws sheets +read --spreadsheet '1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0' --range 'Failed Outreach!A1:R1' --format table
```

Expected: All 18 headers displayed correctly.

- [ ] **Step 3: Commit tracking note**

```bash
git add -A && git commit -m "chore: create Failed Outreach sheet with full analytics headers"
```

### Task 1.2: Create Successful Outreach Google Sheet

**Files:**
- None (Google Sheets)

- [ ] **Step 1: Create the sheet tab**

Add "Successful Outreach" tab with all 23 headers per spec Section 6.3.

```bash
gws sheets spreadsheets batchUpdate --params '{"spreadsheetId":"1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0"}' --json '{"requests":[{"addSheet":{"properties":{"title":"Successful Outreach"}}}]}'
```

Write headers A1:W1:
```
Business Name | Contact Name | Email | Industry | City | Prospect Score | First-Touch Template | Which Touch Got Reply | Reply Type | Time to Reply (hours) | First-Touch Date | Reply Date | Meeting Date | Proposal Sent Date | Proposals Sent | Proposal Accepted Date | Days: First Touch -> Reply | Days: Reply -> Accepted | Days: First Touch -> Accepted | Deal Value | Service Type | Template That Converted | Notes
```

- [ ] **Step 2: Verify headers**

```bash
gws sheets +read --spreadsheet '1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0' --range 'Successful Outreach!A1:W1' --format table
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: create Successful Outreach sheet with full analytics headers"
```

### Task 1.3: Restructure Active Pipeline Sheet

**Files:**
- None (Google Sheets)

- [ ] **Step 1: Document existing column layout**

```bash
gws sheets +read --spreadsheet '1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0' --range 'Pipeline!1:1' --format table
```

Record current layout for migration mapping.

- [ ] **Step 2: Add new columns after existing data**

Non-destructive: add columns to the right. New columns per spec Section 6.1 (any not already present):
```
First-Touch Template | First-Touch Subject | First-Touch First Line | Word Count | Send Date | Send Day | Send Time | FU1 Date | FU2 Date | FU3 Date | FU4 Date | Breakup Date | Reply Date | Reply Touch | Reply Type | Time to Reply (hours) | Outcome | Est. Value | Notes
```

- [ ] **Step 3: Verify new columns**

```bash
gws sheets +read --spreadsheet '1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0' --range 'Pipeline!1:1' --format table
```

Expected: Existing columns intact + new columns appended.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: add full analytics columns to Active Pipeline sheet"
```

### Task 1.4: Build Shared Sheets Module

**Files:**
- Create: `operations/automation/scripts/outreach-sheets.js`

- [ ] **Step 1: Create the module**

Node.js module wrapping GWS CLI for all outreach sheet operations. Exports (reconciled with spec Section 7.5 -- uses spec names as primary, with aliases for convenience):

- `readSheet(sheetName, range)` -- read raw sheet data
- `readAllRows(sheetName)` -- returns array of objects (header-keyed)
- `findRowByBusiness(sheetName, businessName)` -- find a prospect row
- `updateCell(sheetName, rowIndex, columnName, value)` -- write a single cell by column name
- `addProspect(sheetName, rowData)` -- add a new row (spec name; aliased as `appendRow` for backward compat)
- `updateProspect(sheetName, businessName, columnUpdates)` -- update multiple columns for a prospect
- `moveProspect(fromSheet, toSheet, businessName, extraData)` -- move a row between sheets. `extraData` is optional, used to populate target-sheet-only fields during the move.
- `recalcFollowUpDates(businessName, sendDate)` -- compute FU1-Breakup dates from confirmed send
- `getProspectsWhere(sheetName, filterFn)` -- query rows matching a filter
- `updateTemplateRotation(template, prospect, niche, city, replied)` -- update template-rotation.md after a send or reply

Column name-to-letter mappings defined as constants (PIPELINE_COLS, FAILED_COLS, SUCCESSFUL_COLS). All callers use column names, never letters.

Uses `execSync` to call `gws sheets` commands. Note: these are internal automation scripts calling a trusted CLI tool with known-safe arguments, not processing user input.

Include weekend-shift logic in `recalcFollowUpDates`: Saturday -> Monday, Sunday -> Monday.

- [ ] **Step 2: Test the module**

```bash
cd "c:/Claude Code/OphidianAI"
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); console.log(s.readAllRows('Pipeline').length + ' prospects in pipeline');"
```

Expected: Number matching current prospect count (~31).

- [ ] **Step 3: Test findRowByBusiness**

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const r = s.findRowByBusiness('Pipeline', 'Carriage on the Square'); console.log(r ? 'Found at row ' + r.rowIndex : 'Not found');"
```

Expected: Found at row N.

- [ ] **Step 4: Test write functions (updateProspect)**

Pick a test prospect and update a non-critical field (Notes) to verify write path:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.updateProspect('Pipeline', 'Carriage on the Square', {'Notes': 'Test write from outreach-sheets.js'}); console.log('Write OK');"
```

Expected: "Write OK" and the Notes cell updated in the sheet. Verify in sheet, then revert the note.

- [ ] **Step 5: Test addProspect on Failed Outreach sheet**

Add and then remove a test row:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.addProspect('Failed Outreach', {'Business Name': 'TEST ROW', 'Failure Reason': 'Test'}); console.log('Append OK');"
```

Verify the row appears in the Failed Outreach sheet, then manually delete it.

- [ ] **Step 6: Commit**

```bash
git add operations/automation/scripts/outreach-sheets.js
git commit -m "feat: add shared outreach-sheets.js module for all Google Sheets I/O"
```

### Task 1.5: Build Outreach Tracker Skill

**Files:**
- Create: `.claude/skills/outreach-tracker/SKILL.md`

- [ ] **Step 1: Write the skill**

Wraps the shared `outreach-sheets.js` module for Claude skill use. Provides commands for:
- Reading pipeline status
- Updating prospect fields
- Moving prospects between sheets
- Querying for follow-ups due today/this week
- Querying for re-engagement eligible prospects
- Running optimization queries (best template, best touch, best niche, funnel conversion rates)

All examples show bash calls to the outreach-sheets.js module. Never hardcodes column letters.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/outreach-tracker/SKILL.md
git commit -m "feat: add outreach-tracker skill wrapping shared sheets module"
```

---

## Phase 2: Email Templates (Cold Email Rewrite)

### Task 2.1: Rewrite Cold Email Outreach Skill

**Files:**
- Modify: `.claude/skills/cold-email-outreach/SKILL.md` (full rewrite)

- [ ] **Step 1: Read existing skill for reference**

Read `.claude/skills/cold-email-outreach/SKILL.md`. Note what to preserve (spam avoidance, staging flow, knowledge base indexing) and what to replace (templates, structure, rotation).

- [ ] **Step 2: Rewrite the skill**

Key changes:
- **CI1 (3 Creative Ideas) as default template.** Every prospect gets 3 specific, actionable ideas.
- **Alternate (One Sharp Insight) for A/B testing.** Assigned to every 3rd prospect (33% split).
- **Hormozi value-first structure.** First line = industry insight (preview text reward). Bridge to their business. 3 ideas. Soft CTA. PS with quick win.
- **Industry-specific first lines:**
  - Restaurant: "85% of restaurant customers check the menu online before deciding where to eat."
  - Auto: "73% of car owners search online before choosing a repair shop."
  - Salon/spa: "60% of new salon clients find their stylist through Google, not word of mouth."
  - Fitness: "January gym sign-ups that start online convert 2x better than walk-ins."
  - Retail: "Local shops with a Google Business Profile get 70% more foot traffic than those without."
- **PS in every first-touch email.** Quick win the prospect can act on today without hiring anyone.
- **JSON output includes `scheduledDate`** for send-scheduler.js.
- **Old W/S/H/A templates retired.** Angles preserved as follow-up material reference at bottom of skill.
- **Sheet updates use outreach-sheets.js** via bash. Never hardcoded column letters.
- **Full template skeletons** from spec Sections 5.2 and 5.3 included in the skill.

Preserve: plain text rules, spam avoidance checklist, staging flow via stage_email.js, knowledge base indexing.

- [ ] **Step 3: Update stage_email.js to accept scheduledDate**

Read `.claude/skills/gws-cli/scripts/stage_email.js`. Add `scheduledDate` to the manifest entry. The field is read from stdin JSON and persisted to `staged-emails.json`.

- [ ] **Step 4: Verify scheduledDate flows through**

Test by staging a dummy email (or checking the code path manually) to confirm the `scheduledDate` field appears in the manifest entry.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/cold-email-outreach/SKILL.md .claude/skills/gws-cli/scripts/stage_email.js
git commit -m "feat: rewrite cold-email-outreach with Hormozi value-first CI1 templates"
```

### Task 2.2: Update Template Rotation Tracker

**Files:**
- Modify: `sales/lead-generation/template-rotation.md`

- [ ] **Step 1: Restructure the tracker**

- Move old W/S/H/CI tables to a "Legacy" section at the bottom
- Create "Active Templates" section:
  - CI1 table: Template | Variant | Last Used | Times Used | Replies | Reply Rate | Last Prospect | Niche | City
  - ALT table: Same columns
- Both start at 0 sends
- Update rules: 67/33 split, A/B comparison at 30 total sends, kill the loser and create new challenger

- [ ] **Step 2: Commit**

```bash
git add sales/lead-generation/template-rotation.md
git commit -m "feat: restructure template rotation for CI1 + alternate A/B testing"
```

---

## Phase 3: Follow-Up Sequence

### Task 3.1: Rewrite Follow-Up Email Skill

**Files:**
- Modify: `.claude/skills/follow-up-email/SKILL.md` (full rewrite)

- [ ] **Step 1: Read existing skill for reference**

Read `.claude/skills/follow-up-email/SKILL.md`.

- [ ] **Step 2: Rewrite the skill**

Key changes:
- **5-touch + breakup** (was 3-touch): FU1 (Day 3), FU2 (Day 7), FU3 (Day 12), FU4 (Day 18), Breakup (Day 25)
- **Plain text only** (was HTML). Same rules as cold email.
- **Each touch adds new value.** Never "just checking in."
- **Progressive signature:** First-touch "Eric Lefler, OphidianAI" -> FU1-FU4 "Eric" -> Breakup "Eric Lefler, OphidianAI"
- **PS in FU1 only.** Dropped after.
- **Different angle per touch:**
  - FU1: Micro value drop (Google change, platform update, seasonal tip)
  - FU2: Different angle entirely (competitor observation, industry pattern)
  - FU3: Social proof or broader pattern
  - FU4: Last value drop, shortest
  - Breakup: Clean close, 3 sentences max
- **JSON output includes scheduledDate**
- **Sheet updates via outreach-sheets.js**
- **Full template skeletons** from spec Section 5.4

Include industry-specific angle suggestions for each touch level.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/follow-up-email/SKILL.md
git commit -m "feat: rewrite follow-up-email with 5-touch + breakup Hormozi sequence"
```

---

## Phase 4: Orchestrator

### Task 4.1: Build Outreach Engine Skill

**Files:**
- Create: `.claude/skills/outreach-engine/SKILL.md`

- [ ] **Step 1: Write the orchestrator skill**

Central coordinator owning:
1. **State Machine** -- Full diagram from spec Section 4. All statuses and transitions.
2. **Status Values** -- Exhaustive list: New Lead, Scored, Email Drafted, Email Sent, FU1-FU4 Sent, Breakup Sent, Cold, Interest Reply, Question Pending, Proposal Sent, Proposal Sent (Pending), Proposal Accepted
3. **Transition Rules** -- Conditions and dispatch target for each transition
4. **Cadence Management** -- Follow-up date computation from confirmed send timestamp, weekend shift, Question Pending pause/resume with 14-day timeout (spec Section 7.6)
5. **Sheet Operations** -- Which fields updated at each transition, all via outreach-sheets.js
6. **Dispatch Table** -- Skill responsible for each action
7. **Monday Pipeline Integration** -- Coordination with outreach-pipeline
8. **Re-engagement Check** -- Query Failed Outreach for eligible prospects (spec Section 7.7)
9. **Proposal Negotiation Loop** -- Revision flow, 3-rejection flag, only Eric closes

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/outreach-engine/SKILL.md
git commit -m "feat: add outreach-engine orchestrator skill with full state machine"
```

---

## Phase 5: Automation

### Task 5.1: Build Send Scheduler Script

**Files:**
- Create: `operations/automation/scripts/send-scheduler.js`

- [ ] **Step 1: Write the send scheduler**

Node.js script that:
1. Reads `staged-emails.json` manifest
2. Filters entries where `scheduledDate == today`
3. Sends each Gmail draft with 5-minute spacing
4. After each send: updates Active Pipeline (Status, Send Date, Send Day, Send Time) via outreach-sheets.js
5. After each send: updates template rotation tracker via `updateTemplateRotation()` with template name, prospect, niche, city
6. For first-touch sends: recalculates follow-up dates via `recalcFollowUpDates()`
7. Removes sent entries from manifest. Keeps failed + future.
7. Logs to `operations/automation/logs/send-scheduler-YYYY-MM-DD.log`
8. Supports `--dry-run` flag for testing

Note: uses `execSync` to call `gws gmail users drafts send`. Internal automation script, not user-facing.

Policy note in header comment: "Auto-send is intentional. Replaces manual-send safety rail. Eric reviews/edits/deletes drafts before 10am."

- [ ] **Step 2: Test with dry run**

```bash
node operations/automation/scripts/send-scheduler.js --dry-run
```

Expected: Logs "No emails due today" or lists what would send.

- [ ] **Step 3: Commit**

```bash
git add operations/automation/scripts/send-scheduler.js
git commit -m "feat: add send-scheduler.js for automated daily email sends at 10am ET"
```

### Task 5.2: Build Inbox Monitor Skill

**Files:**
- Create: `.claude/skills/inbox-monitor/SKILL.md`

- [ ] **Step 1: Write the skill**

Handles 3x daily reply detection:
- Queries Gmail for replies from any prospect email in Active Pipeline
- **Dedup:** Skips prospects where Reply Date (col U) is already populated
- **Classification:** Interest (wants to proceed), Question (needs info), Negative (not interested)
- **Interest:** Write Reply Date immediately, auto-prep (proposal + demo in background), draft acknowledgment, notify Eric
- **Question:** Write Reply Date, draft response, set status "Question Pending", notify Eric. Document pause/resume cadence logic per spec Section 7.6.
- **Negative:** Write Reply Date, draft graceful close, move to Failed Outreach, notify Eric
- **Logging:** `operations/automation/logs/inbox-monitor-YYYY-MM-DD-HHMM.log`

The skill operates in **two modes:**
- **Orchestrated mode** (called by morning-coffee at 7am): Returns structured data that morning-coffee incorporates into the daily briefing. Outputs reply count, classifications, and action items.
- **Standalone mode** (called by Task Scheduler at noon/4pm): Runs independently, logs results, sends Eric a notification only if actionable replies were found (Interest or Question). Does not generate a full briefing.

Both modes use the same detection/classification/sheet-update logic. The difference is output format and notification behavior.

Include: Gmail query patterns, classification keyword heuristics, notification format for each mode, integration with outreach-sheets.js.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/inbox-monitor/SKILL.md
git commit -m "feat: add inbox-monitor skill for 3x daily reply detection and classification"
```

### Task 5.3: Update Morning Coffee Skill

**Files:**
- Modify: `.claude/skills/morning-coffee/SKILL.md`

- [ ] **Step 1: Read current skill**

Read `.claude/skills/morning-coffee/SKILL.md`.

- [ ] **Step 2: Apply updates**

Changes:
- Replace inline prospect reply check with call to `inbox-monitor` skill
- Add Failed/Successful sheet reads for briefing stats (counts, win rate)
- Add re-engagement eligible prospects from Failed sheet (col Q <= today)
- Add follow-up due flagging: "Follow-ups due today: FU1 for [X], FU2 for [Y]..."
- Add CI1 vs ALT template performance comparison
- Preserve all existing functionality

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/morning-coffee/SKILL.md
git commit -m "feat: update morning-coffee with inbox-monitor delegation and new analytics"
```

---

## Phase 6: Interest Flow

### Task 6.1: Update Offer Delivery Skill

**Files:**
- Modify: `.claude/skills/offer-delivery/SKILL.md`

- [ ] **Step 1: Read and update**

Changes:
- No longer terminal -- transitions into proposal flow
- Auto-prep mode: fires proposal-generator + prospect-mockup in parallel
- Notifies Eric when package is ready
- Delivery email includes proposal PDF + demo URL
- Sheet updates via outreach-sheets.js: Status -> "Proposal Sent"
- Meeting scheduling email draft
- **Proposal follow-up reminder:** After proposal is sent, create a Google Calendar event 3-5 business days out titled "Follow up with [Business] on proposal." If no response by that date, Iris drafts a gentle nudge email for Eric to review. Per spec Section 8.2.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/offer-delivery/SKILL.md
git commit -m "feat: update offer-delivery with auto-prep proposal flow"
```

### Task 6.2: Update Proposal Generator Skill

**Files:**
- Modify: `.claude/skills/proposal-generator/SKILL.md`

- [ ] **Step 1: Read and update**

Changes:
- Revision support (v1, v2, v3+)
- Version tracking in filenames: `proposal-v[N].pdf`
- Feedback input for revisions (price, scope, timeline, payment terms)
- Clarifying questions drafting before revising
- Save to `sales/lead-generation/prospects/[slug]/proposal/`

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/proposal-generator/SKILL.md
git commit -m "feat: add proposal revision support with version tracking"
```

### Task 6.3: Update Client Onboarding Skill

**Files:**
- Modify: `.claude/skills/client-onboarding/SKILL.md`

- [ ] **Step 1: Read and update**

Changes:
- Guard check: verify status == "Proposal Accepted" before any onboarding action
- If guard fails: refuse and notify Eric with current status
- After onboarding complete: move prospect from Pipeline to Successful Outreach via outreach-sheets.js
- Preserve existing: ClickUp board, engineering scaffold, tracker update, decision log, priorities

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/client-onboarding/SKILL.md
git commit -m "feat: add proposal-accepted guard to client-onboarding"
```

---

## Phase 7: Pipeline & Migration

### Task 7.1: Rewrite Outreach Pipeline Skill

**Files:**
- Modify: `.claude/skills/outreach-pipeline/SKILL.md`

- [ ] **Step 1: Read and rewrite**

Changes:
- Calls outreach-engine orchestrator instead of chaining skills
- Monday morning focus: research, score, draft first-touch + follow-ups due this week, stage with scheduledDate
- Re-engagement check: query Failed Outreach for eligible prospects
- Schedule computation: first-touch on Wednesday, follow-ups on due date, weekend shift to Monday
- Summary output with counts

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/outreach-pipeline/SKILL.md
git commit -m "feat: rewrite outreach-pipeline as Monday orchestrator with weekly prep"
```

### Task 7.2: Update SOPs

**Files:**
- Modify: `operations/references/sops/weekly-outreach.md`
- Modify: `operations/automation/outreach-scheduler.md`

- [ ] **Step 1: Rewrite weekly-outreach.md**

New cadence: Monday pipeline, daily 10am sends, Wednesday first-touch, 3x inbox monitoring, Friday review.

- [ ] **Step 2: Rewrite outreach-scheduler.md**

Document send-scheduler.js, 4 Windows Task Scheduler tasks, setup instructions, monitoring, logs, policy change.

- [ ] **Step 3: Commit**

```bash
git add operations/references/sops/weekly-outreach.md operations/automation/outreach-scheduler.md
git commit -m "docs: update weekly outreach SOP and scheduler docs for new engine"
```

### Task 7.3: Migrate Existing 31 Prospects

**Files:**
- Uses: `operations/automation/scripts/outreach-sheets.js`

- [ ] **Step 1: Read current pipeline state**

```bash
gws sheets +read --spreadsheet '1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0' --range 'Pipeline' --format json
```

- [ ] **Step 2: Move Inactive prospects to Failed Outreach**

Move Storie's Restaurant, Paswater Automotive, Andis Plumbing via `moveProspect()`. Set Failure Reason = "Dead Email", Re-engagement Eligible = 90 days from today.

- [ ] **Step 3: Populate new columns for active prospects**

For each prospect with Outreach Sent/Follow-Up Sent: set First-Touch Template (from rotation tracker), Outcome = "In Sequence", compute follow-up dates from original send date.

- [ ] **Step 4: Verify migration**

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const p = s.readAllRows('Pipeline'); const f = s.readAllRows('Failed Outreach'); console.log('Pipeline: ' + p.length + ', Failed: ' + f.length);"
```

- [ ] **Step 5: Verify hardcoded column references are eliminated**

Per spec Section 10.1, these skills had hardcoded column letters:
- `follow-up-email` SKILL.md (line 79): wrote FU dates to cols O, P, Q. Verify the Phase 3 rewrite removed these and routes through outreach-sheets.js.
- `morning-coffee` SKILL.md: reads prospect emails from col C. Verify col C is still "Email" in the new layout. If layout shifted, update morning-coffee to use outreach-sheets.js.
- `outreach-pipeline` SKILL.md: verify the Phase 7 rewrite routes all sheet writes through outreach-sheets.js.

Grep for hardcoded column letter patterns across all outreach-related skills:

```bash
grep -rn "range.*Pipeline\!" .claude/skills/ operations/automation/ --include="*.md" --include="*.js" | grep -v outreach-sheets
```

Expected: No results (all sheet access goes through the shared module).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: migrate existing prospects to new outreach engine schema"
```

### Task 7.4: Update Persistent Memory & Decision Log

**Files:**
- Modify: `persistent-memory/operations/outreach-system.md`
- Modify: `persistent-memory/operations/key-decisions.md`
- Modify: `operations/decisions/log.md`

- [ ] **Step 1: Update outreach-system.md**

Reflect: Hormozi value-first templates, 6-touch cadence, CI1 + alternate A/B, auto-send 10am, 3x inbox monitoring, 3 sheets, outreach-engine orchestrator.

- [ ] **Step 2: Update key-decisions.md**

Add outreach engine overhaul decision.

- [ ] **Step 3: Append to decision log**

```
[2026-03-17] DECISION: Overhaul outreach system with Hormozi-inspired automated engine | REASONING: 0% reply rate across 23 sends over 11 days. New system: value-first CI1 templates, 6-touch cadence (Day 0/3/7/12/18/25), auto-send at 10am ET, 3x daily inbox monitoring, full analytics across 3 Google Sheets, proposal negotiation loop. | CONTEXT: Spec at docs/superpowers/specs/2026-03-17-outreach-engine-design.md. Plan at docs/superpowers/plans/2026-03-17-outreach-engine-implementation.md.
```

- [ ] **Step 4: Commit**

```bash
git add persistent-memory/ operations/decisions/log.md
git commit -m "docs: update memory and decision log for outreach engine overhaul"
```

### Task 7.5: Register Windows Task Scheduler Tasks

**Files:**
- Create: `operations/automation/scripts/setup-outreach-scheduler.ps1`

- [ ] **Step 1: Write setup script**

PowerShell script registering 4 tasks:
1. `OphidianAI-WeeklyPipeline` -- Monday 7:00 AM ET
2. `OphidianAI-SendScheduler` -- Weekdays 10:00 AM ET
3. `OphidianAI-InboxNoon` -- Weekdays 12:00 PM ET
4. `OphidianAI-Inbox4PM` -- Weekdays 4:00 PM ET

- [ ] **Step 2: Validate script syntax**

```powershell
powershell -NoProfile -Command "& { $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content 'operations/automation/scripts/setup-outreach-scheduler.ps1' -Raw), [ref]$null); Write-Host 'Syntax OK' }"
```

Expected: "Syntax OK" with no parse errors.

- [ ] **Step 3: Commit**

```bash
git add operations/automation/scripts/setup-outreach-scheduler.ps1
git commit -m "feat: add Windows Task Scheduler setup for outreach automation"
```

- [ ] **Step 4: Register tasks (manual -- Eric runs in PowerShell Admin)**

```powershell
cd "c:\Claude Code\OphidianAI"
powershell -ExecutionPolicy Bypass -File operations/automation/scripts/setup-outreach-scheduler.ps1
```

---

## Execution Order

| Phase | Tasks | Dependencies | Deliverable |
|---|---|---|---|
| 1. Foundation | 1.1-1.5 | None | 3 sheets + shared module + tracker skill |
| 2. Templates | 2.1-2.2 | Phase 1 | Rewritten cold-email-outreach + rotation tracker |
| 3. Follow-Up | 3.1 | Phase 1 | Rewritten follow-up-email (5-touch + breakup) |
| 4. Orchestrator | 4.1 | Phases 1-3 | outreach-engine skill |
| 5. Automation | 5.1-5.3 | Phases 1-4 | send-scheduler + inbox-monitor + updated morning-coffee |
| 6. Interest Flow | 6.1-6.3 | Phases 1, 4, 5 | Updated offer-delivery, proposal-generator, client-onboarding |
| 7. Migration | 7.1-7.5 | All previous | Rewritten pipeline, migrated data, registered schedulers |

**Parallelizable:** Phases 2 and 3 (both depend only on Phase 1). Phase 6 can partially overlap with Phase 5.
