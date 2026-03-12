# Weekly Outreach SOP

Standard operating procedure for the weekly cold outreach cycle. Run every week to maintain consistent pipeline volume.

## Weekly Cadence

| Day       | Task                          | Time    | Command / Skill                          |
| --------- | ----------------------------- | ------- | ---------------------------------------- |
| Monday    | Research new leads            | Morning | `/business-research` or `/run-outreach-pipeline` |
| Monday    | Score and qualify leads       | Morning | `/prospect-scoring` (batch mode)         |
| Tuesday   | Draft and stage cold emails   | Morning | `/cold-email-outreach` (stages as drafts)|
| Tuesday   | Review staged emails in Gmail | Midday  | Check Gmail Drafts folder manually       |
| Wednesday | Send staged batch             | 8-10 AM | `node .claude/skills/gws-cli/scripts/send_staged.js` |
| Thursday  | Check for replies             | Morning | Morning coffee flags prospect replies    |
| Thursday  | Deliver offers to responders  | Morning | `/offer-delivery` for each reply         |
| Friday    | Review template performance   | Morning | Check `sales/lead-generation/template-rotation.md` |
| Friday    | Plan follow-ups for next week | Afternoon| `/follow-up-email` for non-responders    |

## Volume Targets

| Metric              | Starting | Ramp (Month 2+) | Max   |
| ------------------- | -------- | ---------------- | ----- |
| Leads researched    | 10/week  | 20/week          | 30/week |
| Emails staged       | 10/week  | 20/week          | 30/week |
| Emails sent         | 10/week  | 20/week          | 30/week |
| Daily send limit    | 20/day   | 35/day           | 50/day |
| Send spacing        | 5 min    | 5 min            | 3 min |

## Monday: Research and Score

1. Pick a niche or location to target this week (rotate across niches to avoid pattern)
2. Run business research to find 10-20 potential leads
3. Score each lead using prospect-scoring (batch mode)
4. Only advance Hot (20-25) and Warm (14-19) prospects to outreach
5. Create prospect folders and save research for each qualifying lead
6. Update the Google Sheet pipeline with new leads

**Or run the full pipeline in one shot:**
```
/run-outreach-pipeline
```
This chains research, scoring, drafting, and staging automatically.

## Tuesday: Draft and Stage

1. For each qualified prospect, run cold-email-outreach
2. The skill auto-selects the least-recently-used template from the correct category
3. For SEO/hybrid prospects, the skill runs a competitive search first
4. Each email is staged as a Gmail draft (not sent)
5. Review all drafts in Gmail -- edit anything that doesn't sound right
6. All emails saved to `sales/lead-generation/prospects/[slug]/outreach/`

## Wednesday: Send

1. Preview the batch:
   ```bash
   node .claude/skills/gws-cli/scripts/send_staged.js --dry-run
   ```
2. Send between 8-10 AM ET (best open rates for cold email):
   ```bash
   node .claude/skills/gws-cli/scripts/send_staged.js
   ```
3. After sending, the skill updates:
   - Template rotation tracker (date, count, prospect)
   - Google Sheet pipeline (status -> "Outreach Sent")
   - Prospect tracker backup

## Thursday: Reply Handling

1. Morning coffee flags any prospect replies automatically
2. For each reply:
   - If positive ("yes", "sure", "send it"): Run `/offer-delivery`
   - If question: Draft a response with `/email-response`
   - If negative: Mark as "Closed Lost" in pipeline, note the reason
3. Template rotation tracker gets updated with reply counts automatically

## Friday: Review and Plan

1. Check template performance in `sales/lead-generation/template-rotation.md`
   - Which templates are getting replies?
   - Any template with 10+ sends and 0 replies needs replacement
2. Check pipeline for prospects approaching follow-up windows:
   - Day 3-4: First follow-up
   - Day 7-8: Second follow-up
   - Day 14: Final follow-up (graceful close)
3. Queue follow-up emails for next week using `/follow-up-email`
4. Note any patterns -- what niches, templates, or angles are working

## Pipeline Flow

```
Research (Mon) -> Score (Mon) -> Draft (Tue) -> Review (Tue) -> Send (Wed) -> Reply Check (Thu) -> Deliver (Thu) -> Follow-up (Fri)
```

Each stage updates the Google Sheet pipeline and optionally posts a ClickUp status update.

## Rules

- Never skip the scoring step. Bad leads waste time and hurt sender reputation.
- Never send more than the daily limit. Ramp gradually.
- Never send the same template to two prospects in the same batch.
- Always review staged emails before sending. The system drafts, Eric approves.
- Keep the loop boring. Consistency beats creativity. Same process every week.
- If reply rate drops below 5% for two weeks straight, stop and audit: templates, targeting, or deliverability issue.

## Automation

The batch pipeline skill (`/run-outreach-pipeline`) can automate Monday + Tuesday in one run. The task scheduler can trigger it automatically on Monday mornings. See `.claude/skills/outreach-pipeline/SKILL.md` for details.
