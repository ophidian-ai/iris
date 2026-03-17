---
name: outreach-pipeline
description: Monday morning orchestrator that prepares ALL outreach for the entire week. Runs once per week (Monday 7am). Researches new leads, scores them, checks re-engagement eligibility, drafts first-touch and follow-up emails, computes a send schedule with specific dates, stages everything as Gmail drafts, updates the Pipeline sheet, and notifies Eric via ClickUp. Use when Eric says "run outreach", "run the pipeline", "weekly outreach", "Monday pipeline", or on the automated Monday 7am schedule.
---

# Outreach Pipeline -- Monday Morning Orchestrator

Prepares all outreach for the entire week in one run. Researches new leads, scores them, checks re-engagement, drafts first-touch and follow-up emails, assigns send dates, and stages everything as Gmail drafts. Eric reviews before anything goes out.

## When to Use

- Monday 7am automated trigger via task scheduler
- Eric says "run outreach", "run the pipeline", "weekly outreach", "Monday pipeline"
- Any time a full week of outreach needs to be prepared from scratch

## Inputs

All optional. Defaults cover the standard weekly run.

- **Location** -- Target area (default: rotate across target cities)
- **Niche** -- Industry to target (default: rotate across niches)
- **Count** -- Number of leads to research (default: 10)
- **Min score** -- Minimum prospect score to advance (default: 14 = Warm tier)
- **Skip stages** -- Skip specific stages if already done (e.g., "skip research" if leads already exist)

## Pipeline Steps

```
Step 1: Research
Step 2: Score
Step 3: Re-engagement Check
Step 4: Draft First-Touch Emails
Step 5: Draft Follow-Ups
Step 6: Compute Send Schedule
Step 7: Stage Gmail Drafts
Step 8: Update Pipeline Sheet
Step 9: Notify Eric
```

Each step updates ClickUp and reports progress. If the pipeline fails for a specific prospect, that prospect is skipped and the pipeline continues.

---

### Step 1: Research

**What it does:** Find 10-20 new leads matching the target niche and location.

**Skill used:** `business-research`

**Process:**
1. Use Firecrawl to search for businesses matching criteria
2. Quick-evaluate each business's web presence
3. Create prospect folders in `sales/lead-generation/prospects/`
4. Save research summaries to each prospect's `research/initial-research.md`

**ClickUp update:**
```bash
echo '{"name":"Weekly Pipeline: Research Complete","description":"Found [X] leads in [niche] / [location]. Advancing to scoring.","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711866804
```

**Output:** List of businesses with names, URLs, issues found, and contact info.

---

### Step 2: Score

**What it does:** Qualify each lead from Step 1. Minimum score: 14.

**Skill used:** `prospect-scoring`

**Process:**
1. Run 5-criteria scoring for each lead (Decision-Maker Access, Business Maturity, Website Gap, Revenue Signals, Service Fit)
2. Assign tier: Hot (20-25), Warm (14-19), Cool (8-13), Skip (<8)
3. Save score cards to each prospect's `research/score-card.md`

**ClickUp update:**
```bash
echo '{"name":"Weekly Pipeline: Scoring Complete","description":"Scored [X] leads. Hot: [Y], Warm: [Z], Advancing: [Y+Z]. Skipped: [N].","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711866804
```

**Output:** Comparison table sorted by score. Only Hot and Warm prospects (score >= 14) advance.

---

### Step 3: Re-engagement Check

**What it does:** Query Failed Outreach sheet for prospects eligible for re-engagement.

**Process:**
1. Query Failed Outreach sheet via `outreach-sheets.js` for prospects where Re-engagement Eligible date <= today
2. Surface the list to Eric: "X prospects eligible for re-engagement: [names]"
3. Eric decides per-prospect whether to re-engage
4. Approved re-engagement prospects join the first-touch queue

**ClickUp update:**
```bash
echo '{"name":"Weekly Pipeline: Re-engagement Check","description":"[X] prospects eligible for re-engagement. Awaiting Eric decision.","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711866804
```

**Output:** List of re-engagement-eligible prospects with original outreach dates and failure reasons.

---

### Step 4: Draft First-Touch Emails

**What it does:** Write cold emails for all qualifying new leads and approved re-engagement prospects.

**Skill used:** `cold-email-outreach`

**Process:**
1. Read `sales/lead-generation/template-rotation.md` to determine which templates are due
2. Identify each prospect's type: Website, SEO, or Hybrid
3. For SEO/Hybrid prospects: run competitive search first (Firecrawl search for "[service] in [city]")
4. Assign template: CI1 by default, every 3rd prospect gets ALT for A/B testing
5. Draft the email following all cold email rules (plain text, under 80 words, 7th-grade level, no links)
6. Save to `sales/lead-generation/prospects/[slug]/outreach/cold-email.txt` and `cold-email.json`
7. Update template rotation tracker

**ClickUp update:**
```bash
echo '{"name":"Weekly Pipeline: First-Touch Drafts Ready","description":"Drafted [X] first-touch emails. CI1: [Y], ALT: [Z]. Templates: [list].","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711866804
```

**Output:** List of drafted emails with prospect, template, and subject line.

---

### Step 5: Draft Follow-Ups

**What it does:** Draft follow-up emails for ALL prospects with follow-ups due this week (Mon-Sun).

**Skill used:** `follow-up-email`

**Process:**
1. Query Active Pipeline sheet via `outreach-sheets.js` for all prospects with follow-up dates falling within this week (Monday through Sunday)
2. Determine each prospect's cadence position (FU1, FU2, FU3, FU4, or Breakup)
3. Draft the appropriate follow-up for each prospect using the follow-up-email skill
4. Save to `sales/lead-generation/prospects/[slug]/outreach/follow-up-[N].txt` and `.json`

**ClickUp update:**
```bash
echo '{"name":"Weekly Pipeline: Follow-Up Drafts Ready","description":"Drafted [X] follow-ups. FU1: [a], FU2: [b], FU3: [c], FU4: [d], Breakup: [e].","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711866804
```

**Output:** List of follow-ups with prospect, cadence position, and due date.

---

### Step 6: Compute Send Schedule

**What it does:** Assign a specific `scheduledDate` to every drafted email.

**Rules:**
- New first-touch emails: `scheduledDate` = next Wednesday
- Follow-ups: `scheduledDate` = their exact due date from the Pipeline sheet FU columns
- If a due date falls on Saturday: shift to Monday
- If a due date falls on Sunday: shift to Monday

**Process:**
1. For each first-touch email JSON, set `scheduledDate` to Wednesday of this week
2. For each follow-up email JSON, set `scheduledDate` to the due date from the Pipeline sheet
3. Apply weekend shift rules (Sat/Sun -> Monday)
4. Write updated JSON files with `scheduledDate` field

**Output:** Send schedule breakdown by day of week.

---

### Step 7: Stage Gmail Drafts

**What it does:** Create Gmail drafts for every email with `scheduledDate` in the manifest.

**Script used:** `stage_email.js`

**Process:**
1. For each email JSON file (first-touch and follow-up):
   ```bash
   cat sales/lead-generation/prospects/[slug]/outreach/[email].json | node .claude/skills/gws-cli/scripts/stage_email.js
   ```
2. Each call creates a Gmail draft and adds to the staging manifest at `sales/lead-generation/staged-emails.json`
3. The `scheduledDate` field is included in the manifest for the send scheduler

**ClickUp update:**
```bash
echo '{"name":"Weekly Pipeline: All Emails Staged","description":"[X] emails staged as Gmail drafts. [Y] first-touch, [Z] follow-ups. Review in Gmail Drafts.","priority":2,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711866804
```

---

### Step 8: Update Pipeline Sheet

**What it does:** Add new prospects and update existing prospect records in the Pipeline sheet.

**Script used:** `outreach-sheets.js`

**Process:**
1. New prospects: add row with all analytics fields populated (name, email, niche, location, score, tier, template, scheduledDate, cadence position)
2. Existing prospects: update follow-up status, next follow-up date, cadence position
3. Re-engagement prospects: move from Failed Outreach back to Active Pipeline with fresh cadence

**ClickUp update:**
```bash
echo '{"name":"Weekly Pipeline: Sheet Updated","description":"[X] new prospects added, [Y] existing updated, [Z] re-engaged.","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711866804
```

---

### Step 9: Notify Eric

**What it does:** Create a ClickUp task with the full pipeline summary so Eric can review.

**Process:**
1. Compile the pipeline summary (see Summary Output below)
2. Create a ClickUp task with the summary as a to-do for Eric to review drafts

```bash
echo '{"name":"Weekly Outreach Ready for Review","description":"[full summary]","priority":2,"status":"to do"}' | node .claude/skills/clickup/scripts/clickup.js create 901711866804
```

---

## Summary Output

After completion, output:

```
Pipeline complete.
  New leads researched: X
  Qualified (score 14+): Y
  Re-engagement eligible: Z
  First-touch emails drafted: A
  Follow-ups drafted: B (FU1: _, FU2: _, FU3: _, FU4: _, Breakup: _)
  Total staged for this week: C
  Send schedule:
    Monday: D emails
    Tuesday: E emails
    Wednesday: F emails (includes G new first-touch)
    Thursday: H emails
    Friday: I emails
```

## Niche Rotation

Rotate targets to avoid sending to the same niche every week:

| Week | Niche Focus                |
| ---- | -------------------------- |
| 1    | Auto services / trades     |
| 2    | Health / wellness / fitness|
| 3    | Food / restaurants         |
| 4    | Professional services      |
| 5    | Retail / e-commerce        |

Track which niche was last targeted in the pipeline summary. Iris suggests the next niche based on rotation.

## Safety Rails

- Never sends emails automatically -- only stages drafts
- Eric reviews all drafts before the 10am send window
- If the pipeline fails for a specific prospect, skip that prospect and continue
- Daily send limits enforced at the send-scheduler level, not here
- If no qualifying leads found, report honestly -- don't lower standards
- Always run scoring before drafting -- no bypassing the quality gate

## Error Handling

- If Firecrawl fails during research: report error, skip that search, continue with results found
- If a prospect can't be scored (no data): skip, note in summary
- If email drafting fails for a prospect: skip, note in summary, continue with others
- If Gmail staging fails: keep the JSON file, note in summary, can retry manually
- If outreach-sheets.js fails: log the error, continue pipeline, flag in summary for manual sheet update
- Never let one failed prospect stop the entire pipeline

## Automation

**Manual:**
```
/outreach-pipeline
```

**Scheduled (Windows Task Scheduler):**
Runs every Monday at 7:00 AM ET. See `operations/automation/outreach-scheduler.md` for setup details.

After the scheduled run completes:
1. ClickUp tasks are created at each step (so Eric sees progress in his task list)
2. Morning coffee includes the pipeline status in the daily briefing
3. Eric reviews Gmail drafts before the 10am send window
