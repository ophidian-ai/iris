# Client Onboarding (Deferred Tasks)

Process pending Iris tasks queued by the server-side onboarding pipeline.

## When to Use

- During morning briefing when `pending_iris_tasks` has pending/failed items
- When Eric says "process onboarding tasks", "check for new clients", "run deferred tasks"

## Process

### Guard Check

Before executing ANY onboarding task, verify:
1. Read the prospect's status from Active Pipeline sheet via outreach-sheets.js
2. Status MUST be "Proposal Accepted"
3. If status is NOT "Proposal Accepted", REFUSE to run and notify Eric:
   "Cannot onboard [Business Name] -- proposal has not been accepted. Current status: [current status]."
4. Only proceed if Eric has explicitly confirmed the deal

Implementation:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const r = s.findRowByBusiness('Pipeline', 'BUSINESS_NAME'); if (!r || r.row['Status'] !== 'Proposal Accepted') { console.error('GUARD FAIL: Status is ' + (r ? r.row['Status'] : 'NOT FOUND')); process.exit(1); } else { console.log('Guard passed. Proceeding with onboarding.'); }"
```

### How It Works

1. Run the Guard Check above for the prospect being onboarded
2. Query `pending_iris_tasks` via Supabase MCP for `status IN ('pending', 'failed') AND retry_count < 3`
3. For each task, execute the corresponding action
4. Mark completed tasks as `completed` with `completed_at` timestamp
5. Mark failed tasks as `failed` with `error_message` and increment `retry_count`
6. After ALL tasks complete successfully, run the Successful Outreach Migration (see below)

## Task Handlers

### `clickup_board`
- Create a new folder in ClickUp under "Sales & Outreach" (folder ID: 90177398671)
- Name: `{company_name}`
- Create lists: "Discovery", "Design", "Development", "Review", "Launch"
- Use: `node .claude/skills/clickup/scripts/clickup.js`

### `engineering_scaffold`
- Create folder: `engineering/projects/{company_name_slug}/`
- Copy template from `operations/templates/client-project/`
- Update README.md with client details from payload
- Create `point-of-contact/contact.md` from template

### `tracker_update`
- Update `sales/lead-generation/prospect-tracker.md` -- set status to "Closed Won"
- Update Google Sheet via `outreach-sheets.js`:

```javascript
const sheets = require('./operations/automation/scripts/outreach-sheets.js');
sheets.updateProspect('Pipeline', 'BUSINESS_NAME', { Status: 'Closed Won' });
```

### `decision_log`
- Append to `operations/decisions/log.md`:
  - Decision: "Signed {company_name} as client"
  - Service type, project ID, date

### `briefing_update`
- Add new project to `iris/context/current-priorities.md`

## Successful Outreach Migration

After ALL onboarding tasks complete successfully, move the prospect from Active Pipeline to Successful Outreach:

```javascript
const sheets = require('./operations/automation/scripts/outreach-sheets.js');

// Read the prospect's Pipeline row to extract needed data
const prospect = sheets.findRowByBusiness('Pipeline', 'BUSINESS_NAME');
const pipelineRow = prospect.row;

// Calculate days from first touch to accepted
const firstTouchDate = pipelineRow['Outreach Date'];
const today = sheets.formatDate(new Date());
const daysFirstTouchToAccepted = Math.round(
  (new Date(today) - new Date(firstTouchDate)) / (1000 * 60 * 60 * 24)
);

// Move with extra data for Successful Outreach columns
sheets.moveProspect('Pipeline', 'Successful Outreach', 'BUSINESS_NAME', {
  'Deal Value': pipelineRow['Est. Value'],
  'Service Type': pipelineRow['Service'],
  'Template That Converted': pipelineRow['First-Touch Template'],
  'Proposal Accepted Date': today,
  'Days: First Touch to Accepted': String(daysFirstTouchToAccepted),
  'First-Touch Date': firstTouchDate,
});
```

## Query

```sql
SELECT id, task_type, payload, status, retry_count
FROM pending_iris_tasks
WHERE status IN ('pending', 'failed') AND retry_count < 3
ORDER BY created_at ASC;
```

## Completion

After processing all tasks, update each record:

```sql
-- Success:
UPDATE pending_iris_tasks
SET status = 'completed', completed_at = now()
WHERE id = '{task_id}';

-- Failure:
UPDATE pending_iris_tasks
SET status = 'failed', error_message = '{error}', retry_count = retry_count + 1
WHERE id = '{task_id}';
```
