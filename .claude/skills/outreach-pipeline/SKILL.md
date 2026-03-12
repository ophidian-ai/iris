---
name: outreach-pipeline
description: Run the full weekly outreach pipeline in one shot -- research leads, score them, draft cold emails, and stage as Gmail drafts. Use when Eric says "run outreach", "run the pipeline", "find and email prospects", "weekly outreach", "run this week's batch", or on the automated Monday schedule. Chains business-research, prospect-scoring, cold-email-outreach, and staging into a single pipeline with ClickUp updates at each stage.
---

# Outreach Pipeline

Run the full weekly outreach pipeline: research leads, score them, draft cold emails, and stage everything as Gmail drafts. One command replaces four separate skills.

## When to Use

- Eric says "run outreach", "run the pipeline", "weekly outreach", "find and email prospects"
- Monday morning automated trigger via task scheduler
- Any time a fresh batch of outreach needs to go from zero to staged

## Inputs

All optional. Defaults cover the standard weekly run.

- **Location** -- Target area (default: Columbus, Indiana)
- **Niche** -- Industry to target (default: rotate across niches)
- **Count** -- Number of leads to research (default: 10)
- **Min score** -- Minimum prospect score to advance (default: 14 = Warm tier)
- **Skip stages** -- Skip specific stages if you've already done them (e.g., "skip research" if you already have leads)

## Pipeline Stages

```
Stage 1: Research -> Stage 2: Score -> Stage 3: Draft -> Stage 4: Stage -> Done
```

Each stage updates ClickUp and reports progress. If a stage fails for a specific prospect, that prospect is skipped and the pipeline continues with the rest.

---

### Stage 1: Research

**What it does:** Find new leads matching the target niche and location.

**Skill used:** `business-research`

**Process:**
1. Use Firecrawl to search for businesses matching criteria
2. For each business found, quick-evaluate their web presence
3. Create prospect folders in `sales/lead-generation/prospects/`
4. Save research summaries to each prospect's `research/initial-research.md`

**ClickUp update:**
```bash
echo '{"name":"Outreach Pipeline: Research Complete","description":"Found [X] leads in [niche] / [location]. [Y] advancing to scoring.","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711710045
```

**Output:** List of businesses with names, URLs, issues found, and contact info.

**Advance criteria:** Any business with a clear website gap or SEO opportunity advances to Stage 2.

---

### Stage 2: Score

**What it does:** Quick-qualify each lead from Stage 1 to avoid wasting time on bad fits.

**Skill used:** `prospect-scoring`

**Process:**
1. For each lead from Stage 1, run the 5-criteria scoring (Decision-Maker Access, Business Maturity, Website Gap, Revenue Signals, Service Fit)
2. Assign tier: Hot (20-25), Warm (14-19), Cool (8-13), Skip (<8)
3. Save score cards to each prospect's `research/score-card.md`
4. Update the Google Sheet pipeline with scores and tiers

**ClickUp update:**
```bash
echo '{"name":"Outreach Pipeline: Scoring Complete","description":"Scored [X] leads. Hot: [Y], Warm: [Z], Advancing: [Y+Z]. Skipped: [N].","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711710045
```

**Output:** Comparison table sorted by score.

**Advance criteria:** Only Hot and Warm prospects (score >= min score, default 14) advance to Stage 3.

---

### Stage 3: Draft

**What it does:** Write cold emails for each qualifying prospect using template rotation.

**Skill used:** `cold-email-outreach`

**Process:**
1. Read `sales/lead-generation/template-rotation.md` to determine which templates are due
2. Identify each prospect's type: Website, SEO, or Hybrid
3. For SEO/Hybrid prospects: run competitive search first (Firecrawl search for "[service] in [city]")
4. Pick the least-recently-used template within that category
5. Draft the email following all cold email rules (plain text, under 80 words, 7th-grade level, no links)
6. Save to `sales/lead-generation/prospects/[slug]/outreach/cold-email.txt` and `cold-email.json`
7. Update template rotation tracker with the template used

**ClickUp update:**
```bash
echo '{"name":"Outreach Pipeline: Drafts Ready","description":"Drafted [X] cold emails. Templates used: [list]. Ready for staging.","priority":3,"status":"complete"}' | node .claude/skills/clickup/scripts/clickup.js create 901711710045
```

**Output:** List of drafted emails with prospect, template, and subject line.

**Advance criteria:** All drafted emails advance to Stage 4.

---

### Stage 4: Stage

**What it does:** Create Gmail drafts for each email so Eric can review before sending.

**Scripts used:** `stage_email.js`

**Process:**
1. For each drafted email JSON file:
   ```bash
   cat sales/lead-generation/prospects/[slug]/outreach/cold-email.json | node .claude/skills/gws-cli/scripts/stage_email.js
   ```
2. Each call creates a Gmail draft and adds to the staging manifest at `sales/lead-generation/staged-emails.json`
3. Update Google Sheet pipeline: set status to "Outreach Staged" for each prospect

**ClickUp update:**
```bash
echo '{"name":"Outreach Pipeline: Staged for Review","description":"[X] emails staged as Gmail drafts. Review in Gmail Drafts folder. Send with: node .claude/skills/gws-cli/scripts/send_staged.js","priority":2,"status":"to do"}' | node .claude/skills/clickup/scripts/clickup.js create 901711710045
```

**Output:** Confirmation with count of staged emails and instructions for sending.

---

## Pipeline Summary

After all stages complete, print a summary:

```
Outreach Pipeline Complete
==========================

Research:  [X] leads found
Scoring:   [Y] qualified ([hot] hot, [warm] warm) / [Z] skipped
Drafts:    [Y] emails written
Staged:    [Y] Gmail drafts ready for review

Templates used: [W1, S2, H3, ...]

Next steps:
1. Review drafts in Gmail Drafts folder
2. Edit anything that doesn't sound right
3. Send batch: node .claude/skills/gws-cli/scripts/send_staged.js
   (Best time: Tue-Thu, 8-10 AM ET)
```

Also update the morning coffee briefing data:
- Staged email count goes into the `{{STAGED_COUNT}}` token
- Template performance stays current in the rotation tracker

## Error Handling

- If Firecrawl fails during research: report error, skip that search, continue with results found
- If a prospect can't be scored (no data): skip, note in summary
- If email drafting fails for a prospect: skip, note in summary, continue with others
- If Gmail staging fails: keep the JSON file, note in summary, can retry manually
- Never let one failed prospect stop the entire pipeline

## Niche Rotation

To avoid sending to the same niche every week, rotate targets:

| Week | Niche Focus                |
| ---- | -------------------------- |
| 1    | Auto services / trades     |
| 2    | Health / wellness / fitness|
| 3    | Food / restaurants         |
| 4    | Professional services      |
| 5    | Retail / e-commerce        |

Track which niche was last targeted in the pipeline summary. Iris will suggest the next niche based on rotation.

## Automation

This skill can be triggered manually or by the task scheduler.

**Manual:**
```
/run-outreach-pipeline
```

**Scheduled (Windows Task Scheduler):**
The task scheduler runs this pipeline every Monday at 7:00 AM ET. See `operations/automation/outreach-scheduler.md` for setup details.

After the scheduled run completes:
1. ClickUp tasks are created at each stage (so Eric sees progress in his task list)
2. Morning coffee includes the pipeline status in the daily briefing
3. Eric reviews Gmail drafts at his convenience and sends when ready

## Rules

- Never send emails automatically. The pipeline ends at staging. Eric sends.
- Always respect daily send limits (20/day starting, 50/day max)
- Always run scoring before drafting. No bypassing the quality gate.
- Keep the pipeline boring and repeatable. Same process every week.
- If the pipeline finds zero qualifying leads, report that honestly. Don't lower standards.
