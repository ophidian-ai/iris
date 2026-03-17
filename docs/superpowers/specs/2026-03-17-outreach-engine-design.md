# Outreach Engine -- System Design Spec

**Date:** 2026-03-17
**Status:** Approved
**Approach:** Orchestrator + Specialized Skills (Approach B)

---

## 1. Problem Statement

23 cold emails sent across 4 template categories over 11 days with 0% reply rate. Root causes: negative-first email structure, incomplete follow-up execution (2/15), no send-time optimization, no analytics granularity, and manual processes that depend on Eric remembering to run skills.

This spec defines a fully automated outreach engine that manages the complete prospect lifecycle from lead generation to client onboarding, optimized using principles from Alex Hormozi's email marketing framework.

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Follow-up cadence | Moderate: Day 0, 3, 7, 12, 18, 25 (breakup) | Aggressive enough for top-of-mind, respectful for small-town businesses |
| Default first-touch format | CI1 (3 Creative Ideas) + 1 alternate | CI1 performs 2x better (85 contacts/opportunity). Alternate enables A/B testing. |
| Tracking depth | Full analytics (copy-level) | 0% reply rate demands molecular-level optimization |
| Send scheduling | Exact-day sends at 10am-12pm ET | B2B optimal per Hormozi/Neil Patel. First-touch on Wednesday, follow-ups on due date. |
| Monday automation | Pipeline runs Monday AM | Research, score, draft all emails for the week in one session |
| Inbox monitoring | 3x daily (7am, noon, 4pm) | Catch replies within hours, not days |
| Interest reply handling | Auto-prep, manual send | Speed of prep + quality control on delivery |
| Breakup tone | Clean close, door open | Professional exit, preserves relationship |
| Proposal rejection | Negotiation loop, Eric closes manually | Never auto-terminate an interested prospect |
| Onboarding gate | Only after proposal accepted | No engineering, no ClickUp board, no project folder until handshake |

---

## 3. Architecture

### 3.1 System Overview

```
outreach-engine (orchestrator)
  |
  +-- outreach-pipeline (Monday trigger)
  |     +-- business-research
  |     +-- prospect-scoring
  |     +-- cold-email-outreach (rewritten)
  |
  +-- outreach-tracker (3 Google Sheets)
  |
  +-- send-scheduler.js (daily 10am send window)
  |
  +-- inbox-monitor (3x daily reply detection)
  |     +-- offer-delivery (updated)
  |     +-- proposal-generator (updated)
  |     +-- prospect-mockup
  |
  +-- follow-up-email (rewritten, 5-touch + breakup)
  |
  +-- client-onboarding (updated, gated)
```

### 3.2 Skill Inventory

**Rewrite (3):**

| Skill | Current State | New State |
|---|---|---|
| `cold-email-outreach` | 4 template categories (W/S/H/A), negative-first, no PS | CI1 default + 1 alternate, Hormozi value-first structure, PS in every email, full analytics fields in JSON |
| `follow-up-email` | 3-touch (FU1-FU3), HTML format | 5-touch + breakup (FU1-FU4 + breakup), plain text, each touch adds new value, never repeats pitch |
| `outreach-pipeline` | Chains skills directly | Calls outreach-engine orchestrator. Monday-only trigger. Also drafts follow-ups due that week. |

**New (3):**

| Skill | Purpose |
|---|---|
| `outreach-engine` | Orchestrator. Manages prospect lifecycle state machine. Dispatches to specialized skills. Owns cadence calendar and status transitions. |
| `outreach-tracker` | Manages 3 Google Sheets: Active Pipeline, Failed Outreach, Successful Outreach. All reads/writes go through this skill. |
| `inbox-monitor` | Standalone 3x daily inbox check. Classifies replies (Interest, Question, Negative). Drafts responses. Triggers auto-prep for interest replies. |

**Update (4):**

| Skill | Changes |
|---|---|
| `morning-coffee` | Calls inbox-monitor instead of inline reply check. Reads Failed/Successful sheets for briefing stats. Flags follow-ups due today. |
| `offer-delivery` | Now transitions into proposal flow instead of being terminal. Triggers proposal-generator + prospect-mockup in parallel. |
| `proposal-generator` | Supports revision proposals (v1, v2, v3). Tracks version number. Accepts feedback input for revisions. |
| `client-onboarding` | Guard added: refuses to run unless status == "Proposal Accepted". Only fires after Eric confirms the deal. |

**New Automation (1):**

| Component | Purpose |
|---|---|
| `send-scheduler.js` | Node.js script in `operations/automation/scripts/`. Runs at 10:00 AM ET weekdays via Windows Task Scheduler. Reads staged-emails manifest, sends emails due today with 5-min spacing, updates Active Pipeline sheet and template rotation tracker. |

**Updated SOPs (2):**

| SOP | Changes |
|---|---|
| `weekly-outreach.md` | Rewritten to reflect new cadence: Monday prep, daily sends, 3x monitoring, Wednesday first-touch, exact-day follow-ups. |
| `outreach-scheduler.md` | Rewritten to document the new send-scheduler.js, Windows Task Scheduler setup, and the 3x inbox-monitor schedule. |

---

## 4. Prospect Lifecycle State Machine

```
New Lead
  -> Scored
  -> Email Drafted
  -> Email Sent (Day 0)
    -> FU1 Sent (Day 3)
    -> FU2 Sent (Day 7)
    -> FU3 Sent (Day 12)
    -> FU4 Sent (Day 18)
    -> Breakup Sent (Day 25)
    -> Cold (moved to Failed Outreach sheet)

At ANY point after Email Sent, if prospect replies:

  Interest Reply:
    -> Auto-Prep (proposal + demo built in background)
    -> Eric Reviews Package
    -> Proposal Sent
      -> Proposal Accepted -> Onboarding (moved to Successful Outreach sheet)
      -> Wants Changes -> Clarifying Questions (Iris drafts, Eric reviews)
        -> Revised Proposal (v2+) -> Eric Reviews -> Proposal Sent
          -> Loop continues. After 3 rejections, Iris flags to Eric with recommendation.
          -> Eric explicitly closes -> Failed Outreach sheet (reason: "Proposals Rejected")
      -> Needs Time -> Proposal Sent (Pending), reminder in 3-5 business days

  Question Reply:
    -> Iris drafts response, Eric reviews and sends
    -> Status unchanged, follow-up cadence pauses until resolved

  Negative Reply:
    -> Iris drafts graceful close, Eric reviews
    -> Moved to Failed Outreach sheet (reason: "Not Interested")
```

**Paths to Failed Outreach sheet (3 only):**
1. Full 6-touch sequence completed with no reply (automatic)
2. Prospect replies with explicit "not interested" (automatic after Eric confirms close response)
3. Eric manually decides to close a negotiation after proposal rejections

**Path to Successful Outreach sheet (1 only):**
1. Eric confirms proposal accepted. Client-onboarding fires.

---

## 5. Email Templates

### 5.1 Hormozi-Inspired Structure

Every email follows these principles:
- **Reward every action.** Opening the email should provide value before asking for anything.
- **Lead with insight, not criticism.** Industry stat or useful observation, not "your site is broken."
- **One concept per email.** Don't try to cover multiple angles.
- **Plain text only.** No HTML, no images, no links in first-touch. Looks like a real person typed it.
- **PS in first-touch and FU1.** Alternate angle or micro-value drop. Drop PS after FU1 (diminishing returns).
- **Progressively casual signature.** First-touch: "Eric Lefler, OphidianAI". FU2+: "Eric". Breakup: "Eric Lefler, OphidianAI" (formal close).

### 5.2 First-Touch: CI1 (Default)

Structure:
1. **First line (preview text)** -- Industry stat or insight. Rewards the open. Not about them, about their market.
2. **Bridge** -- 1 sentence connecting the insight to their specific business.
3. **3 ideas** -- Specific, actionable. They can use these regardless of whether they hire you.
4. **Soft CTA** -- "Let me know if any of these resonate."
5. **PS** -- Alternate angle or micro-value drop they can act on immediately.

Subject pattern: `some ideas for [business name]`

Word count: 100-160 words (slightly longer than old templates due to 3-idea format).

Template skeleton:
```
Subject: some ideas for [business name]

Hi [first name],

[Industry stat or insight -- 1 sentence, rewards the open].

I had some ideas about how [business name] could [specific outcome].

1. [Specific idea tied to their business -- problem they have + what to do about it]
2. [Different angle -- something they probably haven't considered]
3. [Third idea -- different use case or quick win]

Let me know if any of these resonate.

Eric Lefler
OphidianAI

P.S. [Quick win they can do today without hiring anyone -- demonstrates expertise and generosity]
```

### 5.3 First-Touch: Alternate (A/B Test)

Structure:
1. **First line (preview text)** -- One sharp, specific observation about their business.
2. **Body** -- 2-3 sentences expanding on the observation with outcome framing.
3. **CTA** -- "Want me to send it over?"
4. **PS** -- Different angle from the body.

Subject pattern: `[business name]'s [specific thing]`

Word count: 60-80 words.

Template skeleton:
```
Subject: [business name]'s [specific observation]

Hi [first name],

[Sharp observation about their business -- specific enough they know you looked]. [Why this matters in outcome language -- customers lost, money left on table, opportunity missed].

I put together a few ideas for how [business name] could [specific outcome]. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

P.S. [Different angle from the body -- bonus insight or quick win]
```

### 5.4 Follow-Up Sequence

**FU1 (Day 3) -- Micro value drop + reference original offer**

Structure: Lead with a useful fact or tip. Then mention the original ideas are still available. PS with a quick win.

```
Hi [first name],

[Timely industry insight or Google/platform change they can capitalize on -- 1-2 sentences].

I still have those ideas for [business name] if you're interested. Happy to send them over.

Eric

P.S. [Actionable quick win related to the insight above -- something they can do in 5 minutes]
```

Word count: 40-60 words.

**FU2 (Day 7) -- Different angle entirely**

Structure: Completely new insight. No reference to previous emails. Feels like a fresh conversation.

```
Hi [first name],

[Observation about their industry or competitors -- something they'd find genuinely interesting. Not about their problems, about an opportunity or pattern you've noticed. 2-3 sentences.]

If you ever want to talk about getting more of that working for [business name], I've got some ideas.

Eric
```

Word count: 40-70 words.

**FU3 (Day 12) -- Social proof or broader pattern**

Structure: Reference work you've done or patterns across local businesses. Position yourself as someone who understands their market.

```
Hi [first name],

[Social proof or pattern observation -- "I've been helping local businesses in the area..." or "The businesses that do best in [industry] all have one thing in common..." -- 2-3 sentences.]

Happy to show you what it would take to [specific outcome] for [business name].

Eric
```

Word count: 40-60 words.

**FU4 (Day 18) -- Last value drop. Shortest.**

Structure: One final useful idea. Offered freely. Soft door-open.

```
Hi [first name],

[One specific, actionable idea they can use for free -- "Your [specific thing] would make a great [specific use]" or "One thing that works well for [industry] is..." -- 1-2 sentences.]

If you ever want to chat about [business name]'s online presence, I'm here.

Eric
```

Word count: 30-50 words.

**Breakup (Day 25) -- Clean close, door open.**

Structure: 3 sentences maximum. Acknowledge you've been reaching out. Stop. Leave the door open.

```
Hi [first name],

I've reached out a few times about helping [business name] get more visible online. I'll stop filling your inbox.

If it ever becomes a priority, the offer stands. You know where to find me.

Eric Lefler
OphidianAI
```

Word count: 30-40 words. Formal signature returns for the close.

### 5.5 Template Rotation & A/B Testing

- CI1 is the default for all first-touch emails
- The alternate template is assigned to every 3rd prospect (roughly 33/67 split)
- Both templates track independently in the rotation tracker
- After 30 total sends (20 CI1 + 10 alternate), compare reply rates
- If one template significantly outperforms, promote it to 100% and create a new challenger
- Template rotation tracker updated to track: template name, variant (CI1 or ALT), niche, city, send date, reply Y/N, which touch got reply

---

## 6. Google Sheets Data Model

### 6.1 Active Pipeline (Restructured)

Sheet ID: `1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0` (existing, restructured)

| Col | Field | Type | Example |
|---|---|---|---|
| A | Business Name | text | Carriage on the Square |
| B | Contact Name | text | Hans Schreiber |
| C | Email | text | carriageonthesquare@hotmail.com |
| D | Industry | text | Restaurant |
| E | City | text | Greensburg, IN |
| F | Prospect Score | number | 22 |
| G | Lead Source | text | Firecrawl |
| H | Status | text | FU1 Sent |
| I | First-Touch Template | text | CI1 |
| J | First-Touch Subject | text | some ideas for carriage on the square |
| K | First-Touch First Line | text | 85% of restaurant customers check... |
| L | Word Count | number | 142 |
| M | Send Date | date | 2026-03-19 |
| N | Send Day | text | Wednesday |
| O | Send Time | text | 10:23 AM ET |
| P | FU1 Date | date | 2026-03-22 |
| Q | FU2 Date | date | 2026-03-26 |
| R | FU3 Date | date | 2026-03-31 |
| S | FU4 Date | date | 2026-04-06 |
| T | Breakup Date | date | 2026-04-13 |
| U | Reply Date | date | -- |
| V | Reply Touch | text | -- |
| W | Reply Type | text | -- |
| X | Time to Reply (hours) | number | -- |
| Y | Outcome | text | In Sequence |
| Z | Est. Value | currency | $3,500 |
| AA | Notes | text | Hot (22/25). No real website. |

### 6.2 Failed Outreach (New Sheet)

| Col | Field | Type |
|---|---|---|
| A | Business Name | text |
| B | Contact Name | text |
| C | Email | text |
| D | Industry | text |
| E | City | text |
| F | Prospect Score | number |
| G | First-Touch Template | text |
| H | Alternate Template | text |
| I | Touches Sent | number (1-6) |
| J | Which Touch Got Reply | text |
| K | Reply Type | text (None, Negative, Proposal Rejected) |
| L | Failure Reason | text (No Reply, Not Interested, Budget, Timing, Proposals Rejected) |
| M | First-Touch Date | date |
| N | Last Touch Date | date |
| O | Days in Sequence | number |
| P | Proposals Sent | number (0-3+) |
| Q | Re-engagement Eligible | date (90 days after last touch) |
| R | Notes | text |

### 6.3 Successful Outreach (New Sheet)

| Col | Field | Type |
|---|---|---|
| A | Business Name | text |
| B | Contact Name | text |
| C | Email | text |
| D | Industry | text |
| E | City | text |
| F | Prospect Score | number |
| G | First-Touch Template | text |
| H | Which Touch Got Reply | text |
| I | Reply Type | text |
| J | Time to Reply (hours) | number |
| K | First-Touch Date | date |
| L | Reply Date | date |
| M | Meeting Date | date |
| N | Proposal Sent Date | date |
| O | Proposals Sent (count) | number |
| P | Proposal Accepted Date | date |
| Q | Days: First Touch -> Reply | number |
| R | Days: Reply -> Accepted | number |
| S | Days: First Touch -> Accepted | number |
| T | Deal Value | currency |
| U | Service Type | text |
| V | Template That Converted | text |
| W | Notes | text |

---

## 7. Scheduling & Automation

### 7.1 Monday Morning Pipeline (7:00 AM ET)

Trigger: Windows Task Scheduler or manual `/run-outreach-pipeline`

Steps:
1. Research 10-20 new leads (business-research)
2. Score each lead (prospect-scoring)
3. Draft first-touch emails for qualifying leads (cold-email-outreach, CI1 default with 33% alternate)
4. Check Active Pipeline for follow-ups due this week. Draft FU1-FU4 or breakup for each.
5. Calculate send schedule: first-touch on Wednesday 10am, follow-ups on exact due date 10am. Weekend follow-ups shift to Monday.
6. Stage all as Gmail drafts
7. Update Active Pipeline sheet with new prospects and follow-up dates
8. Notify Eric via ClickUp task

### 7.2 Daily Send Window (10:00 AM ET, Weekdays)

Trigger: `send-scheduler.js` via Windows Task Scheduler

**Policy change:** This replaces the previous manual-send safety rail ("emails staged as drafts, never auto-sent"). Auto-send is intentional. The review window (before 10am) is the new gate. Eric can review, edit, or delete any draft before the send window opens. Anything still in the manifest at 10am sends automatically.

**Staged email manifest schema update:** Each entry in `staged-emails.json` now includes a `scheduledDate` field (ISO date string, e.g. `"2026-03-19"`). The `stage_email.js` script accepts this field and persists it. `send-scheduler.js` filters on `scheduledDate == today`.

Manifest entry schema:
```json
{
  "draftId": "r123456",
  "to": "prospect@example.com",
  "subject": "some ideas for business name",
  "prospect": "business-name",
  "template": "CI1",
  "scheduledDate": "2026-03-19",
  "stagedAt": "2026-03-17T07:15:00Z"
}
```

Steps:
1. Read staged-emails manifest
2. Filter for entries where `scheduledDate == today`
3. Send with 5-minute spacing (10:00 AM - 12:00 PM window)
4. After each send: write confirmed send timestamp to Active Pipeline (col M Send Date, col N Send Day, col O Send Time). Recalculate follow-up dates (cols P-T) based on confirmed send date. Update template rotation tracker.
5. Sheet writes use the shared `outreach-sheets.js` module (see Section 7.5)
6. Failed sends stay in manifest for next-day retry
7. Log to `operations/automation/logs/send-scheduler-YYYY-MM-DD.log`

Eric override: review/edit/delete drafts before 10am to prevent any email from sending.

### 7.3 Inbox Monitor (3x Daily)

| Time | Trigger | Scope |
|---|---|---|
| ~7 AM | Part of morning-coffee | Full briefing + reply check |
| ~12 PM | Standalone inbox-monitor | Reply check only |
| ~4 PM | Standalone inbox-monitor | Reply check only |

Steps per run:
1. Query Gmail for replies from any prospect email in Active Pipeline sheet
2. **Dedup check:** Skip any prospect where `Reply Date` (col U) is already populated in the Active Pipeline sheet. This prevents double-processing the same reply across the 3 daily runs.
3. Classify: Interest, Question, Negative
4. Interest -> write Reply Date to col U immediately, auto-prep (proposal + demo), draft acknowledgment, notify Eric
5. Question -> write Reply Date to col U, draft response, notify Eric. Set status to "Question Pending" (see Section 7.6).
6. Negative -> write Reply Date to col U, draft graceful close, move to Failed Outreach, notify Eric
7. Log to `operations/automation/logs/inbox-monitor-YYYY-MM-DD-HHMM.log`

### 7.4 Follow-Up Date Computation

**Follow-up dates are computed from the confirmed send timestamp**, not from draft or staging date. When `send-scheduler.js` confirms a send, it writes the actual send date to column M and recalculates cols P-T at that moment using the `outreach-sheets.js` module. If Eric deletes a draft and it doesn't send on its scheduled day, the follow-up dates shift accordingly when the email eventually sends.

Example: First-touch staged Monday, scheduled for Wednesday. Eric deletes the draft Wednesday morning. Re-staged Thursday, sends Friday at 10am. FU1 date = Friday + 3 days = Monday. All downstream dates cascade from the actual send.

### 7.5 Shared Sheets Module (`outreach-sheets.js`)

All Google Sheets reads/writes for the outreach system go through a single Node.js module: `operations/automation/scripts/outreach-sheets.js`. This module is used by:
- `send-scheduler.js` (writes send confirmations, recalculates follow-up dates)
- `outreach-tracker` skill (all skill-invoked reads/writes)
- `inbox-monitor` skill (writes reply data, moves rows between sheets)

This prevents duplicate write logic across the automated scripts and Claude skills. The module wraps `gws sheets` commands and exposes functions for:
- `addProspect(sheetName, rowData)` -- add a new row
- `updateProspect(sheetName, businessName, columnUpdates)` -- update specific columns by business name
- `moveProspect(fromSheet, toSheet, businessName)` -- move a row between sheets
- `getProspectsWhere(sheetName, filterFn)` -- query rows matching a filter
- `recalcFollowUpDates(businessName, sendDate)` -- recompute cols P-T from confirmed send date

### 7.6 Question Reply -- Cadence Pause/Resume

When a prospect replies with a question:
1. Status set to `Question Pending` in Active Pipeline
2. Follow-up cadence **pauses** -- no scheduled follow-ups send while in this status
3. Iris drafts a response. Eric reviews and sends.
4. **Resume trigger:** When inbox-monitor detects a second reply from the same prospect, or Eric manually changes the status back to the previous cadence position
5. **On resume:** The cadence clock resets from the date of the last interaction (not the original send). Example: first-touch Day 0, prospect questions on Day 5, conversation resolves Day 8 -- FU sequence restarts from Day 8 as if it were a new Day 0.
6. **Timeout:** If status remains `Question Pending` for 14 days with no further reply, Iris flags to Eric: "Question from [Business] unresolved for 14 days. Resume cadence, follow up manually, or close?"

### 7.7 Re-Engagement Check

Added to the Monday morning pipeline (Section 7.1) as a new step between research and drafting:

- Query Failed Outreach sheet for rows where `Re-engagement Eligible` (col Q) <= today
- Surface to Eric in the Monday pipeline summary: "X prospects eligible for re-engagement: [names]"
- Eric decides per-prospect: re-enter the pipeline (move back to Active Pipeline with fresh cadence) or skip
- Re-engaged prospects get a completely new template and angle -- never reuse the original approach

### 7.8 Windows Task Scheduler Tasks

| Task Name | Schedule | Script |
|---|---|---|
| OphidianAI-WeeklyPipeline | Monday 7:00 AM ET | Pipeline research + draft |
| OphidianAI-SendScheduler | Weekdays 10:00 AM ET | Send today's scheduled emails |
| OphidianAI-InboxNoon | Weekdays 12:00 PM ET | Inbox monitor (reply check) |
| OphidianAI-Inbox4PM | Weekdays 4:00 PM ET | Inbox monitor (reply check) |

Morning 7 AM check handled by morning-coffee (already scheduled or run manually at session start).

---

## 8. Interest Reply -> Onboarding Flow

### 8.1 Auto-Prep

When inbox-monitor detects an interest reply:
1. Draft acknowledgment email (Eric reviews before sending)
2. Fire in parallel: proposal-generator + prospect-mockup
3. Save to `sales/lead-generation/prospects/[slug]/proposal/` and `[slug]/demo/`
4. Notify Eric: "Proposal and demo ready for [Business]. Review at [paths]."
5. Update Active Pipeline: Status -> "Interest Reply", Reply Date, Reply Touch, Time to Reply

### 8.2 Proposal Delivery

After Eric reviews and approves:
1. Send delivery email with proposal PDF + demo URL
2. Update Active Pipeline: Status -> "Proposal Sent"
3. Schedule follow-up reminder: 3-5 business days

### 8.3 Post-Meeting Outcomes

| Outcome | Action |
|---|---|
| Accepted | Status -> "Proposal Accepted". Client-onboarding fires. Move to Successful Outreach sheet. |
| Wants Changes | Iris drafts clarifying questions. Eric reviews/sends. Iris revises proposal (v2+). Eric reviews. Send updated proposal. |
| Needs Time | Status -> "Proposal Sent (Pending)". Reminder in 3-5 days. |
| Eric closes | Move to Failed Outreach sheet. Reason: "Proposals Rejected". Count of proposals tracked. |

### 8.4 Proposal Negotiation Loop

- No automatic termination of interested prospects
- After 3 rejected proposals, Iris flags to Eric with recommendation (continue, pause, different package)
- Only Eric can move an interested prospect to Failed Outreach
- Revised proposals track version number (v1, v2, v3...)
- Each revision adjusts based on specific feedback (price, scope, timeline, payment terms)

### 8.5 Onboarding Gate

Client-onboarding skill ONLY fires when:
- Active Pipeline status == "Proposal Accepted"
- Eric has explicitly confirmed

What onboarding does:
- Create ClickUp board with project lists
- Scaffold engineering project folder
- Update tracker to "Closed Won"
- Log decision in decision log
- Update current-priorities.md

What onboarding does NOT do before acceptance:
- No engineering scaffold
- No ClickUp project board
- No project folder
- No resource allocation

---

## 9. Optimization Queries

The 3-sheet data model enables these analyses:

| Question | Query |
|---|---|
| Best-performing template | Successful sheet col G (count by template) vs total sends in Active + Failed |
| Which follow-up touch converts | Successful sheet col H (distribution of reply touches) |
| Which industries close fastest | Successful sheet col D vs col S (industry vs days to close) |
| Average time-to-reply | Successful sheet col J (mean hours) |
| Which cities respond best | Cross-reference all 3 sheets by col E |
| Are we pricing right | Successful sheet col T vs Failed sheet col L where reason = "Budget" |
| When to re-engage failed prospects | Failed sheet col Q (re-engagement date = 90 days after last touch) |
| Template A/B winner | Active + Failed + Successful filtered by col G/I, compare reply rates |
| Which day/time gets best opens | Successful sheet col N (send day) -- do Wednesday first-touches outperform shifted follow-ups? |
| Funnel conversion rates | Count by status across all 3 sheets: Sent -> Reply -> Meeting -> Proposal -> Accepted |

---

## 10. Migration Plan

### 10.1 Existing Prospects

The 31 prospects currently in the pipeline need migration:

- Prospects with "Outreach Sent" or "Follow-Up Sent" status: enter the new cadence at their current position
- Prospects with "New Lead" or "Researching" status: enter normally through the new pipeline
- Prospects with "Inactive" status: move to Failed Outreach sheet immediately
- The existing Google Sheet gets restructured with new columns (non-destructive -- add columns, don't remove old ones until migration complete)

**Hardcoded column references that must be updated during migration:**

The following skills currently hardcode Google Sheet column letters that will change in the new layout:

- `follow-up-email` (SKILL.md line 79): writes FU dates to cols O, P, Q -- must update to new positions P, Q, R
- `morning-coffee` (SKILL.md): reads prospect emails from col C -- unchanged in new layout, but verify
- `outreach-pipeline`: reads/writes status and dates -- must route through `outreach-sheets.js` module instead of direct writes

All sheet writes must migrate to use the shared `outreach-sheets.js` module (Section 7.5) to eliminate hardcoded column references entirely. The module uses column names, not letters.

### 10.2 Template Transition

- Old W/S/H/A templates retired from first-touch use
- Old template angles repurposed as follow-up material (FU2-FU4 can use competitor observations, SEO insights, etc.)
- Template rotation tracker reset for the new CI1 + alternate system
- Historical template performance data preserved in a "Legacy" section of the tracker

### 10.3 Rollout Order

1. Create new Google Sheets (Failed Outreach, Successful Outreach)
2. Restructure Active Pipeline sheet (add new columns)
3. Rewrite cold-email-outreach skill (CI1 + alternate templates)
4. Rewrite follow-up-email skill (5-touch + breakup)
5. Build outreach-engine orchestrator
6. Build outreach-tracker skill
7. Build inbox-monitor skill
8. Build send-scheduler.js
9. Update morning-coffee, offer-delivery, proposal-generator, client-onboarding
10. Update SOPs (weekly-outreach.md, outreach-scheduler.md)
11. Register Windows Task Scheduler tasks
12. Migrate existing 31 prospects into new system
13. First full Monday pipeline run
