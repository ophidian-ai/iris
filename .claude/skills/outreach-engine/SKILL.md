---
name: outreach-engine
description: Central orchestrator for the outreach lifecycle. Manages prospect state transitions, follow-up cadence, and dispatches to specialized skills (cold-email-outreach, follow-up-email, inbox-monitor, offer-delivery, proposal-generator, client-onboarding). Use when running the outreach pipeline, processing state changes, or coordinating multi-skill workflows.
---

# Outreach Engine

Central coordinator for the entire outreach system. Owns the prospect lifecycle state machine, dispatches to specialized skills for each action, and enforces transition rules.

Every prospect flows through this engine from discovery to close. No skill moves a prospect to a new status without the engine's transition rules being satisfied.

## State Machine

```
New Lead -> Scored -> Email Drafted -> Email Sent (Day 0)
  -> FU1 Sent (Day 3) -> FU2 Sent (Day 7) -> FU3 Sent (Day 12)
  -> FU4 Sent (Day 18) -> Breakup Sent (Day 25)
  -> Cold (moved to Failed Outreach sheet)

At ANY point after Email Sent, if prospect replies:
  Interest Reply -> Auto-Prep -> Eric Reviews -> Proposal Sent
    -> Accepted -> Onboarding (Successful Outreach)
    -> Wants Changes -> Clarifying Questions -> Revised Proposal -> loop
    -> Needs Time -> Proposal Sent (Pending), reminder 3-5 days
  Question Reply -> Question Pending (cadence paused)
  Negative Reply -> Cold (Failed Outreach)
```

## Status Values

Exhaustive list of every valid prospect status:

| Status | Sheet | Meaning |
|---|---|---|
| New Lead | Pipeline | Discovered, not yet scored |
| Scored | Pipeline | Scored and tiered, awaiting email draft |
| Email Drafted | Pipeline | Cold email written, not yet staged/sent |
| Email Sent | Pipeline | First-touch email confirmed sent (Day 0) |
| FU1 Sent | Pipeline | Follow-up 1 sent (Day 3) |
| FU2 Sent | Pipeline | Follow-up 2 sent (Day 7) |
| FU3 Sent | Pipeline | Follow-up 3 sent (Day 12) |
| FU4 Sent | Pipeline | Follow-up 4 sent (Day 18) |
| Breakup Sent | Pipeline | Breakup email sent (Day 25) |
| Cold | Failed Outreach | Sequence complete or explicitly closed |
| Interest Reply | Pipeline | Prospect replied with interest |
| Question Pending | Pipeline | Prospect asked a question; cadence paused |
| Proposal Sent | Pipeline | Proposal delivered, awaiting response |
| Proposal Sent (Pending) | Pipeline | Prospect said "needs time"; reminder scheduled |
| Proposal Accepted | Pipeline | Eric confirmed acceptance; ready for onboarding |

## Transition Rules

| From Status | Trigger | To Status | Skill | Sheet Updates |
|---|---|---|---|---|
| New Lead | Scored above 14 | Scored | prospect-scoring | Pipeline: Score, Tier |
| Scored | Email drafted | Email Drafted | cold-email-outreach | Pipeline: Template, Subject, First Line, Word Count |
| Email Drafted | Email staged and sent | Email Sent | send-scheduler.js | Pipeline: Status, Send Date, Send Day, Send Time; recalc FU dates |
| Email Sent | Day 3 reached | FU1 Sent | follow-up-email | Pipeline: Status, FU1 Date |
| FU1 Sent | Day 7 reached | FU2 Sent | follow-up-email | Pipeline: Status, FU2 Date |
| FU2 Sent | Day 12 reached | FU3 Sent | follow-up-email | Pipeline: Status, FU3 Date |
| FU3 Sent | Day 18 reached | FU4 Sent | follow-up-email | Pipeline: Status, FU4 Date |
| FU4 Sent | Day 25 reached | Breakup Sent | follow-up-email | Pipeline: Status, Breakup Date |
| Breakup Sent | 3 days, no reply | Cold | outreach-tracker | Move to Failed Outreach: Failure Reason, Touches Sent, Last Touch Date |
| Any (post-send) | Positive reply detected | Interest Reply | inbox-monitor | Pipeline: Status, Reply Date, Reply Touch, Reply Type |
| Interest Reply | Offer prepared and delivered | Proposal Sent | offer-delivery + proposal-generator | Pipeline: Status, Proposal Sent Date |
| Any (post-send) | Question reply detected | Question Pending | inbox-monitor | Pipeline: Status, Reply Date, Reply Touch, Reply Type |
| Question Pending | Answer sent, second reply or Eric resumes | Previous cadence position | email-response | Pipeline: Status reverts; cadence clock resets |
| Any (post-send) | Negative reply detected | Cold | inbox-monitor | Move to Failed Outreach: Failure Reason, Reply Date |
| Proposal Sent | Prospect accepts | Proposal Accepted | (Eric confirms) | Pipeline: Status, Proposal Accepted Date |
| Proposal Sent | Prospect wants changes | Proposal Sent | proposal-generator | Pipeline: Notes updated, proposal version incremented |
| Proposal Sent | Prospect needs time | Proposal Sent (Pending) | (manual) | Pipeline: Status, Reminder Date (3-5 days) |
| Proposal Accepted | Eric confirms onboarding | Onboarding | client-onboarding | Move to Successful Outreach |

## Cadence Management

Follow-up dates are computed from the **confirmed send timestamp**, not the draft date.

| Touch | Day Offset | Template |
|---|---|---|
| First Contact | 0 | CI1 (67%) / ALT (33%) |
| FU1 | 3 | Micro value drop |
| FU2 | 7 | Different angle |
| FU3 | 12 | Social proof |
| FU4 | 18 | Last value drop |
| Breakup | 25 | Clean close |

**Weekend shift rules:**
- Saturday follow-up date -> shifts to Monday (+2 days)
- Sunday follow-up date -> shifts to Monday (+1 day)

**Date computation:**

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const dates = s.recalcFollowUpDates('Business Name', '2026-03-17'); console.log(JSON.stringify(dates, null, 2));"
```

All date math goes through `outreach-sheets.js recalcFollowUpDates()`. Never compute follow-up dates manually.

## Question Pending Pause/Resume

When a prospect replies with a question (not expressing clear interest or disinterest):

1. **Pause:** Status set to "Question Pending". Follow-up cadence stops -- no scheduled follow-ups send while in this state.
2. **Response:** Iris drafts a response to the question. Eric reviews and sends.
3. **Resume triggers:**
   - Second reply detected by inbox-monitor (prospect responds to the answer)
   - Eric manually changes the status back to a cadence position
4. **On resume:** Cadence clock resets from the date of the last interaction. Follow-up dates recalculated from that date.
5. **Timeout:** If unresolved after 14 days, flag to Eric with three options:
   - Resume cadence from current position
   - Send a manual follow-up
   - Close and move to Failed Outreach

## Proposal Negotiation Loop

When a prospect expresses interest and receives a proposal:

```
Interest Reply -> Offer Delivery -> Proposal v1 -> Eric Reviews -> Proposal Sent
  -> Accepted -> Proposal Accepted
  -> Wants Changes -> Iris drafts clarifying questions -> Eric sends questions
    -> Prospect answers -> Iris revises proposal (v2) -> Eric reviews -> Proposal Sent
    -> (loop continues for v3+)
  -> Needs Time -> Proposal Sent (Pending) -> Reminder in 3-5 days
```

**Rules:**
- Iris drafts clarifying questions based on the prospect's feedback. Eric reviews and sends.
- Iris revises the proposal incorporating the prospect's answers. Eric reviews before sending.
- Proposal versions tracked as `proposal-v1.pdf`, `proposal-v2.pdf`, etc. in the prospect's folder.
- After 3 rejections/revision requests: Iris flags to Eric with a recommendation (continue, adjust scope, or walk away).
- Only Eric can close a negotiation and move the prospect to Failed Outreach.

## Dispatch Table

| Action | Skill / Script |
|---|---|
| Research new leads | business-research |
| Score prospects | prospect-scoring |
| Draft first-touch email | cold-email-outreach |
| Draft follow-up email | follow-up-email |
| Send scheduled emails | send-scheduler.js |
| Check for replies | inbox-monitor |
| Deliver offer on interest | offer-delivery |
| Generate proposal | proposal-generator |
| Build demo mockup | prospect-mockup |
| Onboard client | client-onboarding |
| All sheet operations | outreach-tracker / outreach-sheets.js |

## Monday Pipeline Coordination

When `/run-outreach-pipeline` runs on Monday:

1. **Research:** Find 10-20 new leads via business-research.
2. **Score:** Run prospect-scoring on each lead. Only Hot (20-25) and Warm (14-19) advance.
3. **Re-engagement check:** Query Failed Outreach for rows where Re-engagement Eligible date <= today. Surface eligible prospects to Eric.
4. **Draft first-touch emails:** Use cold-email-outreach for qualifying leads. CI1 default with 33% ALT split.
5. **Draft follow-ups:** Check Active Pipeline for follow-ups due this week. Draft each using follow-up-email.
6. **Compute send schedule:**
   - First-touch emails: Wednesday 10:00 AM ET
   - Follow-ups: exact due date, 10:00 AM ET
   - Weekend dates shift to Monday
7. **Stage all as Gmail drafts** with `scheduledDate` in the manifest.
8. **Update Pipeline sheet** with new prospects and follow-up dates.
9. **Notify Eric** via ClickUp task with batch summary.

## Re-engagement Check

Prospects in Failed Outreach become eligible for re-engagement after a cooling period (set per-prospect in the Re-engagement Eligible column).

**Query:**

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const today = new Date().toISOString().split('T')[0]; const eligible = s.getProspectsWhere('Failed Outreach', r => r['Re-engagement Eligible'] && r['Re-engagement Eligible'] <= today); console.log(JSON.stringify(eligible, null, 2)); console.log(eligible.length + ' prospects eligible for re-engagement');"
```

**Process:**
- Surface to Eric: "X prospects eligible for re-engagement: [names]"
- Eric decides per-prospect: re-enter pipeline (fresh cadence, new template/angle) or skip
- Re-engaged prospects get a completely new template -- never reuse the original approach
- On re-entry: status resets to "New Lead" with a note indicating re-engagement

## Paths to Failed Outreach

There are exactly 3 ways a prospect reaches Failed Outreach:

1. **Full sequence completed with no reply.** All 6 touches sent (First Contact + FU1-FU4 + Breakup), 3 days pass after Breakup with no reply. Automatic move.
2. **Prospect replies with explicit "not interested."** Detected by inbox-monitor. Eric confirms the close response before the move happens.
3. **Eric manually decides to close a negotiation.** At any point during the proposal loop or Question Pending state, Eric can decide to stop pursuing.

No other path leads to Failed Outreach. A prospect cannot be moved there by automation alone (except path 1).

## Path to Successful Outreach

There is exactly 1 way a prospect reaches Successful Outreach:

1. Eric confirms that the prospect has accepted a proposal.
2. Pipeline status is set to "Proposal Accepted".
3. client-onboarding fires.
4. Prospect is moved to the Successful Outreach sheet with deal metadata.

## Onboarding Gate

client-onboarding ONLY fires when both conditions are met:

1. Pipeline status == "Proposal Accepted"
2. Eric has explicitly confirmed the acceptance

Until both conditions are true:
- No engineering scaffold is created
- No ClickUp board is set up
- No project folder is created in `engineering/projects/`
- No welcome email is sent

This gate prevents premature resource allocation on deals that haven't closed.
