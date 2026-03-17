# Outreach Scheduler

Automated scheduling for the weekly outreach pipeline. All tasks run via Windows Task Scheduler for persistence across reboots and sessions.

## send-scheduler.js

**Location:** `operations/automation/scripts/send-scheduler.js`

Runs at 10:00 AM ET on weekdays. Handles the actual sending of staged emails.

**What it does:**

1. Reads `staged-emails.json` for queued emails
2. Filters by `scheduledDate == today`
3. Sends matching emails with 5-minute spacing between each
4. Updates the Google Sheet pipeline via `outreach-sheets.js` (status -> "Outreach Sent")
5. Updates template rotation tracker with send counts and dates
6. Logs results to `operations/automation/logs/`

**Flags:**

- `--dry-run` -- Preview what would send without actually sending. Use this to verify the day's queue.

**Example:**

```bash
# Preview today's sends
node operations/automation/scripts/send-scheduler.js --dry-run

# Send for real
node operations/automation/scripts/send-scheduler.js
```

## Windows Task Scheduler Tasks

Four scheduled tasks handle the full outreach automation:

| Task Name | Schedule | Time (ET) | Action |
| --- | --- | --- | --- |
| `OphidianAI-WeeklyPipeline` | Monday | 7:00 AM | Run full outreach pipeline (research, score, re-engagement, draft, schedule, stage) |
| `OphidianAI-SendScheduler` | Weekdays (Mon-Fri) | 10:00 AM | Run send-scheduler.js to send today's scheduled emails |
| `OphidianAI-InboxNoon` | Weekdays (Mon-Fri) | 12:00 PM | Run inbox monitor standalone (reply detection) |
| `OphidianAI-Inbox4PM` | Weekdays (Mon-Fri) | 4:00 PM | Run inbox monitor standalone (reply detection) |

The 7:00 AM inbox check is handled by morning-coffee and does not need a separate task.

**To view tasks:**
```powershell
Get-ScheduledTask | Where-Object {$_.TaskName -like "OphidianAI*"}
```

**To disable a task:**
```powershell
Disable-ScheduledTask -TaskName "OphidianAI-SendScheduler"
```

**To delete a task:**
```powershell
Unregister-ScheduledTask -TaskName "OphidianAI-SendScheduler" -Confirm:$false
```

**To manually trigger a task:**
```powershell
Start-ScheduledTask -TaskName "OphidianAI-SendScheduler"
```

## Setup

**Setup script:** `operations/automation/scripts/setup-outreach-scheduler.ps1`

Run in PowerShell (Admin):
```powershell
cd "c:\Claude Code\OphidianAI"
powershell -ExecutionPolicy Bypass -File operations/automation/scripts/setup-outreach-scheduler.ps1
```

The setup script:

1. Registers all four scheduled tasks with Windows Task Scheduler
2. Configures "Run whether user is logged on or not" + WakeToRun
3. Prompts for Windows password once (stored securely with the tasks)
4. Sets correct working directory and environment for each task

## Monitoring

**Log location:** `operations/automation/logs/`

Log files follow the naming pattern:

- `pipeline-YYYY-MM-DD.log` -- Monday pipeline run output
- `send-scheduler-YYYY-MM-DD.log` -- Daily send results
- `inbox-monitor-YYYY-MM-DD-HHMM.log` -- Inbox monitor results

**Check recent logs:**
```bash
ls operations/automation/logs/
```

**Check pipeline summary:**
```bash
cat operations/automation/logs/pipeline-latest.log
```

## Safety Rails

- **Auto-send policy.** send-scheduler.js sends automatically at 10:00 AM. Eric reviews staged emails before 10:00 AM to catch anything that needs editing or removal.
- **Pipeline never sends directly.** The Monday pipeline only stages drafts. Actual sending is handled exclusively by send-scheduler.js.
- **Failed sends retry next day.** If send-scheduler.js encounters a failure, those emails remain in staged-emails.json and are retried on the next business day.
- **Daily send limits enforced.** send-scheduler.js respects the daily cap from the volume targets. Excess emails roll to the next day.
- **Dry-run available.** Always run `--dry-run` first if verifying a new batch or debugging.
- **No weekend sends.** All tasks are scheduled for weekdays only.
- **Logging.** Every send attempt and result is logged for audit purposes.
