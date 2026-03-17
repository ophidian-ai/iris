# Weekly Outreach SOP

Standard operating procedure for the weekly cold outreach cycle. Run every week to maintain consistent pipeline volume.

## Weekly Cadence

| Day | Time | What Happens |
| --- | --- | --- |
| Monday | 7:00 AM | Pipeline runs: research, score, re-engagement check, draft all emails (first-touch + follow-ups), compute send schedule, stage as drafts |
| Monday | 10:00 AM | Any follow-ups due Monday send via send-scheduler.js |
| Tue-Fri | 10:00 AM | Scheduled emails for that day send via send-scheduler.js |
| Wednesday | 10:00 AM | New first-touch batch sends (B2B optimal day) |
| Every day | 7:00 AM | Inbox monitor runs as part of morning-coffee |
| Every day | 12:00 PM | Inbox monitor runs standalone |
| Every day | 4:00 PM | Inbox monitor runs standalone |
| Friday | Afternoon | Review template performance (CI1 vs ALT reply rates), plan next week |

## What Changed

- **Old:** Manual send on Wednesday 8-10 AM. **Now:** Auto-send at 10 AM daily via send-scheduler.js.
- **Old:** 3-touch follow-up (FU1, FU2, final). **Now:** 6-touch sequence (FU1-FU4 + Breakup) over 25 days.
- **Old:** Follow-ups planned on Friday. **Now:** Follow-ups drafted Monday, sent on exact due dates automatically.
- **Old:** Reply check on Thursday morning. **Now:** 3x daily inbox monitoring (7 AM, 12 PM, 4 PM).
- **Old:** Manual template rotation. **Now:** CI1 default (67%) + ALT (33%) A/B testing with automatic tracking.
- **Policy change:** Auto-send replaces manual-send. Eric reviews staged emails before 10 AM.

## Volume Targets

| Metric | Starting | Ramp (Month 2+) | Max |
| --- | --- | --- | --- |
| Leads researched | 10/week | 20/week | 30/week |
| Emails staged | 10/week | 20/week | 30/week |
| Emails sent | 10/week | 20/week | 30/week |
| Daily send limit | 20/day | 35/day | 50/day |
| Send spacing | 5 min | 5 min | 3 min |

## Monday: Full Pipeline Run (7:00 AM)

The pipeline runs automatically at 7:00 AM via Windows Task Scheduler (`OphidianAI-WeeklyPipeline`). It executes these steps in order:

1. **Research** -- Pick a niche or location, find 10-20 potential leads
2. **Score** -- Score each lead using prospect-scoring (batch mode). Only advance Hot (20-25) and Warm (14-19) prospects
3. **Re-engagement check** -- Identify stale prospects eligible for re-engagement sequences
4. **Draft first-touch emails** -- Auto-select template using CI1 (67%) / ALT (33%) split. For SEO/hybrid prospects, run competitive search first
5. **Draft follow-up emails** -- Generate FU1-FU4 + Breakup for all prospects in active sequences
6. **Compute send schedule** -- Assign each email a `scheduledDate` based on sequence timing:
   - First-touch: next Wednesday
   - FU1: +3 days after first-touch
   - FU2: +5 days after FU1
   - FU3: +5 days after FU2
   - FU4: +5 days after FU3
   - Breakup: +7 days after FU4
7. **Stage as drafts** -- Write all emails to `staged-emails.json` and create Gmail drafts
8. **Update pipeline** -- Update Google Sheet via `outreach-sheets.js` module with new leads and statuses

Create prospect folders and save research for each qualifying lead. All emails saved to `sales/lead-generation/prospects/[slug]/outreach/`.

**Or run manually:**
```
/run-outreach-pipeline
```

## Monday 10:00 AM: First Scheduled Send

send-scheduler.js runs and sends any follow-ups with `scheduledDate` matching today. First-touch emails for new prospects are scheduled for Wednesday.

## Tuesday-Friday 10:00 AM: Daily Sends

send-scheduler.js runs daily at 10:00 AM via Windows Task Scheduler (`OphidianAI-SendScheduler`):

1. Reads `staged-emails.json`
2. Filters for emails where `scheduledDate` == today
3. Sends with 5-minute spacing between emails
4. Updates Google Sheet pipeline via `outreach-sheets.js` (status -> "Outreach Sent")
5. Updates template rotation tracker with send counts

Eric should review staged emails before 10:00 AM. Remove or edit any that need changes.

## Wednesday 10:00 AM: First-Touch Batch

Wednesday is the primary first-touch send day (B2B optimal). New prospect emails scheduled on Monday are dated for Wednesday. They send automatically with the rest of the day's batch.

## Daily: Inbox Monitoring (3x)

Inbox monitoring runs at 7 AM (via morning-coffee), 12 PM, and 4 PM:

1. Scan for prospect replies using thread matching
2. For each reply:
   - If positive ("yes", "sure", "send it"): Flag for `/offer-delivery`
   - If question: Flag for `/email-response`
   - If negative: Mark as "Closed Lost" in pipeline via `outreach-sheets.js`, note the reason
   - If out-of-office: Reschedule next follow-up
3. Template rotation tracker gets updated with reply counts automatically
4. Any active follow-up sequences for replying prospects are paused

## Friday: Review and Plan

1. Check template performance in `sales/lead-generation/template-rotation.md`
   - Compare CI1 vs ALT reply rates
   - Any template with 10+ sends and 0 replies needs replacement
   - Adjust the 67/33 split if ALT outperforms CI1
2. Review overall pipeline health in Google Sheet via `outreach-sheets.js`
3. Note patterns -- what niches, templates, or angles are working
4. Plan next week's target niche/location

## Pipeline Flow

```
Research (Mon 7am)
  -> Score (Mon 7am)
  -> Re-engagement Check (Mon 7am)
  -> Draft All Emails (Mon 7am)
  -> Compute Schedule (Mon 7am)
  -> Stage Drafts (Mon 7am)
  -> Eric Reviews (Mon-Wed before 10am)
  -> Auto-Send (10am daily, Mon-Fri)
  -> Inbox Monitor (7am, 12pm, 4pm daily)
  -> Reply Handling (as detected)
  -> Follow-ups (auto-sent on due dates)
```

Each stage updates the Google Sheet pipeline via `outreach-sheets.js`.

## Safety Rails

- **Daily send limit enforced.** Never exceed the daily cap. Ramp gradually.
- **Template uniqueness.** Never send the same template to two prospects in the same batch.
- **Review window.** Eric reviews staged emails before 10 AM. Auto-send fires at 10 AM sharp.
- **No direct pipeline sends.** The pipeline only stages. send-scheduler.js handles actual sends.
- **Reply rate monitoring.** If reply rate drops below 5% for two weeks straight, stop and audit: templates, targeting, or deliverability issue.
- **Failed sends retry next day.** If send-scheduler.js fails, those emails roll to the next business day.
- **Scoring gate.** Never skip the scoring step. Bad leads waste time and hurt sender reputation.
- **Consistency.** Keep the loop boring. Same process every week.

## Automation

The batch pipeline skill (`/run-outreach-pipeline`) automates the full Monday pipeline. Windows Task Scheduler handles all recurring triggers. See `operations/automation/outreach-scheduler.md` for scheduler details and `.claude/skills/outreach-pipeline/SKILL.md` for pipeline skill details.
