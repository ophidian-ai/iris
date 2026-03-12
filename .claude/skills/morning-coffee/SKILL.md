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

**Gmail -- Prospect replies:**
```bash
# Read pipeline from Google Sheet (primary source):
gws sheets +read --spreadsheet '1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0' --range 'Pipeline' --format json
# For each prospect email from the sheet:
gws gmail users messages list --params '{"userId":"me","q":"from:<prospect-email> newer_than:7d","maxResults":5}'
```
Build the prospect email JSON array by reading the **Google Sheet pipeline** (Sheet ID: `1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0`, column C) and extracting all email addresses. Fall back to `sales/lead-generation/prospect-tracker.md` if the sheet is unavailable.

**Cold Email Reply Tracking:**

Cross-reference prospect replies with the template rotation tracker to update performance data:

1. Read `sales/lead-generation/template-rotation.md`
2. For each prospect reply detected above, check if the prospect name matches a "Last Prospect" entry in the rotation tracker
3. If a match is found and the template's Replies count hasn't already been incremented for this prospect:
   - Increment the Replies column for that template
   - Recalculate Reply Rate (Replies / Times Used as %)
   - Update the Performance Summary table
   - Save the updated `template-rotation.md`
4. Include a **Template Performance** line in the terminal summary if any replies were attributed:
   `Template wins: [template] got a reply from [prospect]`

**Outreach Pipeline Status:**

Check for recent pipeline activity to include in the briefing:

1. Read `sales/lead-generation/staged-emails.json` (if it exists) -- note how many emails are staged and waiting
2. Read `sales/lead-generation/template-rotation.md` -- pull the Performance Summary for the briefing
3. Include in the terminal summary:
   - `Staged emails: X waiting to send` (if any)
   - `Template performance: [best template] at [X]% reply rate` (if any data)

**Google Calendar -- Today + next 48 hours:**
```bash
gws calendar +agenda --days 2 --format json
```

**ClickUp -- Open tasks:**
```bash
node .claude/skills/clickup/scripts/clickup.js tasks 901711710045
```
Check all known list IDs: Backlog (901711710045), Project 1 (901711707665), Project 2 (901711707666).

**File reads (parallel):**

- Read `sales/lead-generation/prospect-tracker.md`
- Read each prospect's `sales/lead-generation/prospects/[slug]/README.md` (needed for pipeline value breakdowns)
- Read `marketing/activity-log.md`
- Read `engineering/projects/bloomin-acres/README.md` (and any other project READMEs)
- Read `iris/saved-conversations/` directory (check if any files exist)

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
   - `{{PROJECTS_CONTENT}}` -- `.project-item` divs for each active project.
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
Outreach: {{STAGED_COUNT}} staged | {{TEMPLATE_PERFORMANCE}}
Finance: ${{BURN_RATE}}/mo burn | {{OUTSTANDING_INVOICES}} outstanding{{TAX_DEADLINE_ALERT}}

PDF saved to iris/reports/briefings/{{YYYY-MM-DD}}.pdf
Email sent to eric.lefler@ophidianai.com
```

If any prospect replied, add to `{{REPLY_ALERT}}`: ` | PROSPECT REPLY from [name]`
- `{{STAGED_COUNT}}`: Number of emails in `staged-emails.json`, or "0 staged" if none/file missing
- `{{TEMPLATE_PERFORMANCE}}`: Best performing template and rate (e.g., "best: W2 at 33%"), or "no data yet" if no sends

If the email failed, replace the "Email sent" line with: `Email failed: [error reason]`

### Step 9: Pending Onboarding Tasks

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

### Step 10: Saved Conversations Check

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
