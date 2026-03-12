# Client Onboarding (Deferred Tasks)

Process pending Iris tasks queued by the server-side onboarding pipeline.

## When to Use

- During morning briefing when `pending_iris_tasks` has pending/failed items
- When Eric says "process onboarding tasks", "check for new clients", "run deferred tasks"

## How It Works

1. Query `pending_iris_tasks` via Supabase MCP for `status IN ('pending', 'failed') AND retry_count < 3`
2. For each task, execute the corresponding action
3. Mark completed tasks as `completed` with `completed_at` timestamp
4. Mark failed tasks as `failed` with `error_message` and increment `retry_count`

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
- Update Google Sheet via GWS CLI if applicable

### `decision_log`
- Append to `operations/decisions/log.md`:
  - Decision: "Signed {company_name} as client"
  - Service type, project ID, date

### `briefing_update`
- Add new project to `iris/context/current-priorities.md`

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
