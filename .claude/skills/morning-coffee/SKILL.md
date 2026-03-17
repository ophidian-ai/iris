---
name: morning-coffee
description: Generate a daily briefing PDF with inbox, pipeline, calendar, projects, tasks, revenue, AI intel, and prioritized recommendations. Replaces session startup. Use when starting any new session or when Eric says "morning coffee", "daily briefing", or "what's on my plate".
---

# Morning Coffee

Generate a branded daily briefing PDF and print a terminal summary. This replaces the old session startup.

## Invocation

`/morning-coffee`

## Process

Execute these steps in order. Gather data in parallel where possible.

### Step 1: Gather Data (parallel)

Run all of these simultaneously:

**Gmail -- Unread inbox:**
```bash
gws gmail +triage --query "in:inbox is:unread" --format json
```

**Prospect Replies (via inbox-monitor):**

Delegate reply detection to the `inbox-monitor` skill in **orchestrated mode**. This replaces the old inline Gmail query approach.

```
Run inbox-monitor in orchestrated mode.
It returns: reply count, classifications (Interest/Question/Negative), action items.
```

The inbox-monitor handles: Gmail queries, dedup (skips already-processed replies), classification, sheet updates (Reply Date, Reply Touch, Reply Type, Time to Reply), drafting responses, and auto-prep for interest replies. See `.claude/skills/inbox-monitor/SKILL.md` for details.

Include inbox-monitor results in the briefing:
- `New replies: X (Interest: A, Question: B, Negative: C)`
- For each interest reply: `[Business Name] replied with interest -- proposal + demo prep started`
- For each question reply: `[Business Name] asked a question -- response drafted for review`

**Outreach Pipeline Status:**

Check outreach analytics from all 3 Google Sheets via outreach-sheets.js:

```bash
node -e "
const s = require('./operations/automation/scripts/outreach-sheets.js');
const pipeline = s.readAllRows('Pipeline');
const failed = s.readAllRows('Failed Outreach');
const successful = s.readAllRows('Successful Outreach');
const staged = require('fs').existsSync('sales/lead-generation/staged-emails.json') ? JSON.parse(require('fs').readFileSync('sales/lead-generation/staged-emails.json','utf8')).staged.length : 0;
const today = new Date().toISOString().split('T')[0];
const fuDue = pipeline.filter(r => [r['FU1 Date'],r['FU2 Date'],r['FU3 Date'],r['FU4 Date'],r['Breakup Date']].includes(today));
const reengagement = failed.filter(r => r['Re-engagement Eligible'] && r['Re-engagement Eligible'] <= today);
console.log(JSON.stringify({pipeline: pipeline.length, failed: failed.length, successful: successful.length, staged, fuDueToday: fuDue.length, reengagementEligible: reengagement.length}));
"
```

Include in the terminal summary and briefing:
- `Pipeline: X active | Failed: Y | Won: Z`
- `Staged emails: X waiting to send` (if any)
- `Follow-ups due today: [list of business names and which touch]`
- `Re-engagement eligible: X prospects` (if any -- list names)
- `Template performance: CI1 at X% reply rate, ALT at Y% reply rate` (from template-rotation.md)
- `Funnel: X sent -> Y replied -> Z meetings -> W proposals -> V won`

**Google Calendar -- Today + next 48 hours:**
```bash
gws calendar +agenda --days 2 --format json
```

**ClickUp -- Open tasks + cleanup:**

Scan ALL lists across both spaces. Known list IDs:

| Space | Folder | List | ID |
|-------|--------|------|----|
| Web Design & SEO | -- | Backlog | 901711710045 |
| Web Design & SEO | Bloomin Acres | Active Sprint | 901711866793 |
| Web Design & SEO | Bloomin Acres | Backlog | 901711866796 |
| Web Design & SEO | OphidianAI Website | Critical | 901711866798 |
| Web Design & SEO | OphidianAI Website | High Priority | 901711866799 |
| Web Design & SEO | OphidianAI Website | Medium Priority | 901711866800 |
| Web Design & SEO | OphidianAI Website | Low Priority | 901711866801 |
| Web Design & SEO | Sales & Outreach | Active Leads | 901711866803 |
| Web Design & SEO | Sales & Outreach | Weekly Pipeline | 901711866804 |

```bash
for list_id in 901711710045 901711866793 901711866796 901711866798 901711866799 901711866800 901711866801 901711866803 901711866804; do
  node .claude/skills/clickup/scripts/clickup.js tasks $list_id
done
```

**ClickUp Cleanup:** After fetching tasks from all lists:
1. Identify tasks with status "complete" or "done" that are still open
2. Identify duplicate tasks across lists (same name in multiple lists)
3. Identify overdue tasks (due date in the past) -- flag for Eric's attention
4. Cross-reference with pipeline state, git history, or project state to confirm completion
5. Close confirmed completed/duplicate tasks:
   ```bash
   echo '{"status":"closed"}' | node .claude/skills/clickup/scripts/clickup.js update <taskId>
   ```
6. Report in the terminal summary: `ClickUp: Cleaned up X completed tasks, Y duplicates removed, Z overdue flagged`

Also flag tasks that have been in "in progress" for more than 7 days without updates -- these may be stale and need attention.

**File reads (parallel):**

- Read `sales/lead-generation/prospect-tracker.md`
- Read each prospect's `sales/lead-generation/prospects/[slug]/README.md` (needed for pipeline value breakdowns)
- Read `marketing/activity-log.md`
- Read `iris/saved-conversations/` directory (check if any files exist)

**Active Projects -- Supabase:**

Query the OphidianAI Supabase project (ID: `minlcytryamfmisftlqu`) for active projects with their client info and milestone progress:

```sql
SELECT p.name AS project_name, p.phase, p.estimated_completion,
       c.company_name AS client_name,
       COUNT(pm.id) AS total_milestones,
       COUNT(pm.completed_at) AS completed_milestones
FROM projects p
JOIN clients c ON c.id = p.client_id
LEFT JOIN project_milestones pm ON pm.project_id = p.id
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.phase, p.estimated_completion, c.company_name
ORDER BY p.created_at ASC;
```

Use this data to populate `{{PROJECTS_CONTENT}}`. For each project, generate:
```html
<div class="project-item">
  <div>
    <div class="project-name">[project_name]</div>
    <div class="project-detail">[client_name] -- [completed_milestones]/[total_milestones] milestones complete</div>
  </div>
  <div class="project-status">[phase]</div>
</div>
```

If the estimated_completion date is set, append it to project-detail: ` -- Est. [date]`

If no active projects exist, use: `<div class="empty">No active projects.</div>`

**Expense Receipts -- Quick Scan:**
Run a lightweight receipt check for new expenses since last scan:

```bash
gws gmail +triage --query '"receipt" OR "invoice" OR "payment confirmation" newer_than:1d' --format json
```

If new receipts are found, run the expense-tracker skill's extract and log steps (Steps 2-4 from `.claude/skills/expense-tracker/SKILL.md`). Include a one-liner in the briefing if expenses were logged. If none found, skip silently.

**Financial Pulse (CFO):**

Pull financial data from Google Sheets for the Financial Pulse section:

```bash
# Read Revenue tab for outstanding invoices
gws sheets +read --spreadsheet '1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo' --range 'Revenue!A:I' --format json

# Read Expenses tab for burn rate
gws sheets +read --spreadsheet '1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo' --range 'Expenses!A:J' --format json
```

From the data, compute:
- **Burn rate:** Sum of recurring monthly expenses from the Expenses tab
- **Outstanding invoices:** Count and total where Status != "Paid" in Revenue tab
- **Tax deadlines:** Check if any of these dates are within 30 days: April 15, June 15, September 15, January 15
- **Cash position:** Total revenue (Paid invoices) minus total expenses (only show if revenue exists)

If no revenue data exists yet, show burn rate and tax deadlines only. Skip the section entirely if no financial data has changed since last briefing.

**Knowledge Base -- Context Enrichment:**

Query Pinecone for context relevant to today's briefing. Run these in parallel with other Step 1 data gathering:

1. Recent decisions:
```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "decisions"
  query.inputs.text: "recent business decisions priorities"
  query.topK: 3
```

2. Hot prospects (if any prospects have status "Replied" or "Follow-Up Due"):
```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  query.inputs.text: "<prospect name> outreach history"
  query.topK: 3
```

3. Use retrieved context to enrich the Recommendations section (Step 4). For example:
   - If a decision about pricing was made recently, factor it into proposal recommendations
   - If outreach history shows a pattern (e.g., certain industries respond better), mention it
   - If a prospect's full history is available, provide richer follow-up recommendations

If Pinecone is unavailable, skip silently. The briefing must never fail because of a knowledge base query.

**Social Content Batches:**

Check for active content batches that need attention:

1. Read `marketing/social-media/batches/` directory for any JSON batch files
2. For each batch, check the `status` field:
   - `draft` -- Batch generated but not yet reviewed
   - `review` -- Batch is in the review queue
   - `approved` -- Approved and waiting to schedule
   - `scheduled` -- Scheduled for posting
3. Include in terminal summary: `Content: X batches (Y in review, Z approved)`
4. If any batch has status `review`, flag it in recommendations as a MARKETING action: "Review pending social content batch -- [batch label]"
5. If no batches exist or directory is empty, skip silently

**AI News -- Firecrawl:**
Use the Firecrawl skill to search for 2-3 of these topics (rotate daily):

- "Claude Code latest updates"
- "AI web design tools trends"
- "MCP server new integrations"
- "AI agency business model"
- "Anthropic Claude new features"

For each article found, write a brief analysis: what it's about and how it relates to OphidianAI's work (could improve our process, worth watching, potential service opportunity, etc.). No raw URLs in the output -- just the headline, source name, and analysis.

### Step 2: Compute Metrics

From the gathered data, calculate:

| Metric                         | How to Calculate                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pipeline Value (Potential)** | Sum the "Est. Value" column from prospect-tracker.md for all prospects NOT in Closed Lost/Inactive status                                    |
| **Revenue (Actualized)**       | Sum the "Est. Value" for prospects in "Closed Won" status. If none, show $0.                                                                 |
| **Active Prospects**           | Count of prospects not in Closed Lost/Inactive status                                                                                        |
| **Days Since Last Outreach**   | Days between today and the most recent "Outreach Date" or "Follow-Up Date" in the tracker                                                    |
| **Outreach This Week**         | Count prospects with Outreach Date in the current Monday-Sunday week                                                                         |
| **Outreach This Month**        | Count prospects with Outreach Date in the current calendar month                                                                             |
| **Response Rate**              | (Prospects with status Replied or later) / (Total prospects with Outreach Sent or later). Show as percentage. If zero contacted, show "N/A". |
| **Last Social Post**           | Most recent "social-post" date from marketing/activity-log.md. If none, show "N/A".                                                          |
| **Last Blog Post**             | Most recent "blog-article" date from marketing/activity-log.md. If none, show "N/A".                                                         |
| **MRR**                        | Count of Closed Won prospects * their maintenance tier rate ($100/mo for Starter/Professional, $150/mo for E-Commerce). If none, show $0.    |

### Step 3: Determine CSS Classes

Apply these classes to template tokens for visual styling:

- `{{PIPELINE_VALUE_CLASS}}`: "zero" if $0, otherwise empty
- `{{REVENUE_CLASS}}`: "zero" if $0, otherwise empty
- `{{OUTREACH_DAYS_CLASS}}`: "warning" if > 5 days, otherwise empty
- `{{ACTUALIZED_CLASS}}`: "zero" if $0, otherwise empty
- `{{SOCIAL_CLASS}}`: "stale" if > 7 days or N/A, otherwise empty
- `{{BLOG_CLASS}}`: "stale" if > 14 days or N/A, otherwise empty
- `{{TASKS_DOT_CLASS}}`: "orange" if any overdue tasks, otherwise empty

### Step 4: Generate Recommendations

Based on ALL gathered data, generate 3-5 prioritized action items. Consider:

1. **Overdue follow-ups** (highest priority) -- If any prospect follow-up dates have passed, recommend following up immediately.
2. **Prospect replies** -- If any prospects replied, recommend reading and responding.
3. **Stale outreach** -- If Days Since Last Outreach > 5, recommend finding new prospects.
4. **Calendar conflicts** -- Flag any scheduling issues.
5. **Overdue tasks** -- If ClickUp has overdue items, recommend addressing them.
6. **Zero revenue** -- If actualized revenue is $0, recommend actions to close deals.
7. **Marketing gaps** -- If no social/blog activity in 7+ days, recommend creating content.
8. **AI Intel opportunity** -- If a news item suggests an actionable improvement, recommend it.

Format each recommendation as: `<li><span class="rec-tag">[CATEGORY]</span> Specific action to take.</li>`

Categories: PIPELINE, FOLLOW-UP, OUTREACH, TASKS, MARKETING, REVENUE, AI-INTEL

### Step 5: Build HTML

1. Read the template from `.claude/skills/morning-coffee/templates/briefing-template.html`
2. Replace all `{{TOKEN}}` placeholders with computed values
3. For `{{LOGO_PATH}}`, use the absolute path: `file:///c:/Claude Code/OphidianAI/shared/brand-assets/logo_icon.png`
4. For `{{DATE}}`, use format: `MARCH 6, 2026` (uppercase month, day, year)
5. Build HTML fragments for:
   - `{{INBOX_CONTENT}}` -- List of `.inbox-item` divs for each unread email (max 5). If prospect reply detected, add `.inbox-tag` with "PROSPECT REPLY". If no unread, show `.empty` with "No unread emails."
   - `{{PIPELINE_ROWS}}` -- For each prospect, generate TWO rows:
     1. **Main row:** Business name, status badge, days in stage, follow-up date (add `.overdue` class if past due), and est. value in a `.price-cell`.
     2. **Breakdown row:** A `<tr class="value-breakdown-row">` with a single `<td colspan="5">` containing a `.value-breakdown` div. Inside it:
        - A `.value-breakdown-label` reading "VALUE BASIS"
        - A `.value-breakdown-items` div with `.value-breakdown-item` entries explaining the estimate: pricing tier (e.g., "Professional tier"), page count, key features driving the price (e.g., booking integration, SEO, e-commerce). Pull this from the prospect's README.md in `sales/lead-generation/prospects/[slug]/README.md` -- look at Project Scope and any pricing notes.
   - `{{CALENDAR_CONTENT}}` -- `.cal-day-label` for "TODAY" and "TOMORROW", with `.cal-item` entries. If no events for a given day, show `.empty` with "No events scheduled." under that day label. If no events at all, show a single `.empty` with "No events scheduled for today."
   - `{{PROJECTS_CONTENT}}` -- Built from the Supabase active projects query (see Step 1). Each project gets a `.project-item` div showing name, client, milestone progress, and current phase.
   - `{{TASKS_CONTENT}}` -- Table with task name, status, due date. Or `.empty` if none.
   - `{{AI_INTEL_CONTENT}}` -- `.intel-item` divs with headline, source, and analysis.
   - `{{RECOMMENDATIONS}}` -- `<li>` items with rec-tag spans.
6. Write the completed HTML to `.claude/skills/morning-coffee/templates/briefing.html`

### Step 6: Generate PDF

```bash
cd "c:/Claude Code/OphidianAI" && node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///c:/Claude Code/OphidianAI/.claude/skills/morning-coffee/templates/briefing.html', { waitUntil: 'networkidle' });
  await page.pdf({ path: 'c:/Claude Code/OphidianAI/iris/reports/briefings/{{YYYY-MM-DD}}.pdf', format: 'A4', printBackground: true });
  await browser.close();
  console.log('PDF generated');
})();
"
```

Replace `{{YYYY-MM-DD}}` with today's date.

### Step 7: Email Briefing

Send the briefing PDF to Eric via Gmail so he can read it on the go.

```bash
echo '{"to":"eric.lefler@ophidianai.com","subject":"Morning Coffee -- {{DATE}}","html":"<p>Your daily briefing is attached.</p>","attachments":[{"path":"c:/Claude Code/OphidianAI/iris/reports/briefings/{{YYYY-MM-DD}}.pdf","filename":"morning-coffee-{{YYYY-MM-DD}}.pdf","mimeType":"application/pdf"}]}' | node .claude/skills/gws-cli/scripts/build_raw_email.js | gws gmail users messages send --params '{"userId":"me"}' --json @-
```

Replace `{{DATE}}` and `{{YYYY-MM-DD}}` with the same values used in previous steps.

If the email fails, note it in the terminal summary but don't block the rest of the briefing.

### Step 8: Terminal Summary

After the PDF is generated, print a brief summary to the terminal:

```
Morning Coffee -- {{DATE}}

Pipeline: {{PIPELINE_VALUE}} potential | {{REVENUE}} actualized
Prospects: {{ACTIVE_PROSPECTS}} active | {{OUTREACH_DAYS}} days since last outreach
Inbox: {{UNREAD_COUNT}} unread{{REPLY_ALERT}}
Calendar: {{EVENT_COUNT}} events today
Tasks: {{TASKS_DUE}} due today, {{TASKS_OVERDUE}} overdue
Projects: {{ACTIVE_PROJECT_COUNT}} active -- {{ACTIVE_PROJECT_SUMMARY}}
Content: {{BATCH_SUMMARY}}
Outreach: {{STAGED_COUNT}} staged | {{TEMPLATE_PERFORMANCE}}
Finance: ${{BURN_RATE}}/mo burn | {{OUTSTANDING_INVOICES}} outstanding{{TAX_DEADLINE_ALERT}}

PDF saved to iris/reports/briefings/{{YYYY-MM-DD}}.pdf
Email sent to eric.lefler@ophidianai.com
```

If any prospect replied, add to `{{REPLY_ALERT}}`: ` | PROSPECT REPLY from [name]`
- `{{ACTIVE_PROJECT_COUNT}}`: Number of active projects from the Supabase query
- `{{ACTIVE_PROJECT_SUMMARY}}`: Comma-separated list of "[project name] ([phase])" for each active project
- `{{STAGED_COUNT}}`: Number of emails in `staged-emails.json`, or "0 staged" if none/file missing
- `{{TEMPLATE_PERFORMANCE}}`: Best performing template and rate (e.g., "best: W2 at 33%"), or "no data yet" if no sends

If the email failed, replace the "Email sent" line with: `Email failed: [error reason]`

### Step 9: Calendar Sync

Run the calendar sync skill (`.claude/skills/calendar-sync/SKILL.md`). Reuse the Supabase milestone data and prospect pipeline data already gathered in Step 1 -- no duplicate queries.

- Create/update `[OAI]` events for upcoming milestones, follow-ups, and deadlines
- Remove events for completed milestones or closed prospects
- On Sundays: run the weekly review (suggest missing items to Eric for approval)

Add to the terminal summary line:
```
Calendar: {{SYNC_CREATED}} synced | {{UPCOMING_WEEK}} upcoming this week
```

### Step 10: Pending Onboarding Tasks

Query `pending_iris_tasks` via Supabase MCP:

```sql
SELECT task_type, payload->>'company_name' as company, retry_count, created_at
FROM pending_iris_tasks
WHERE status IN ('pending', 'failed')
ORDER BY created_at ASC;
```

If results exist, include in briefing under "Action Required":
- "N pending onboarding tasks for [company names]"
- List each task type and retry count
- Invoke client-onboarding skill to process them

### Step 11: Saved Conversations Check

Check `iris/saved-conversations/` for any `.md` files.

- If files exist: Read them, ask Eric if he wants to pick up where he left off. If yes, continue from that context. After loading, delete the file.
- If empty: Continue normally.

## Important Notes

- The prospect email list for reply checking must be built dynamically from prospect-tracker.md each time -- don't hardcode email addresses.
- AI Intel uses Firecrawl credits. Keep searches to 2-3 per briefing to conserve credits.
- If `iris/reports/briefings/{{YYYY-MM-DD}}.pdf` already exists (re-running same day), overwrite it.

### API Status: Empty Data vs. Failure

**This is critical.** Every API call must be checked for success vs. failure. Empty results are NOT failures.

| Source              | Success (empty)                                                              | Failure                                                                           |
| ------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Gmail (inbox)**   | Command exits 0, returns `[]` or empty results. Show: "No unread emails."     | Command exits non-zero or throws error. Show: "Inbox unavailable -- API error."    |
| **Gmail (replies)** | Command exits 0, no replies found. Show nothing special.                      | Command exits non-zero. Note in terminal summary: "Reply check failed."            |
| **Google Calendar** | Command exits 0, returns `[]`. Show: "No events scheduled for today."         | Command exits non-zero or throws error. Show: "Calendar unavailable -- API error." |
| **ClickUp**         | Command exits 0, returns empty task list. Show: "No open tasks."              | Command exits non-zero or throws error. Show: "Tasks unavailable -- API error."    |
| **Firecrawl**       | Returns results with no relevant articles. Show: "No notable updates today." | Request fails or returns error. Show: "AI Intel unavailable -- API error."        |

**How to check:** If the command exits with code 0 and returns valid JSON (even `[]`), it succeeded. If it exits non-zero, prints to stderr, or throws an exception, it failed.

**In the PDF:** Use the `.empty` class for empty-but-working states. For failures, use `.empty` but with the "API error" message so it's visually distinct from "nothing to show."

**In the terminal summary:** Append a line for each failure: `[SOURCE] API error: [brief reason]`
