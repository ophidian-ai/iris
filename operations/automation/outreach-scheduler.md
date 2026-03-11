# Outreach Pipeline Scheduler

Automate the weekly outreach pipeline so it runs without manual intervention.

## Two Scheduling Approaches

### 1. Session Cron (Within Claude Code)

Use when Claude Code is already running. Jobs live only in the current session and auto-expire after 3 days.

**Setup:** Ask Iris to set up the Monday schedule:
```
Set up the weekly outreach schedule
```

Iris will create:
- **Monday 7:00 AM ET** -- Run `/run-outreach-pipeline` (research, score, draft, stage)
- **Thursday 7:00 AM ET** -- Run `/morning-coffee` with reply tracking emphasis
- **Friday 3:00 PM ET** -- Run template performance review

These fire while the REPL is idle. If you're mid-conversation, they queue.

**Limitation:** Session-only. Gone when Claude exits. Must be re-created each session.

### 2. Windows Task Scheduler (Persistent)

Use for true unattended automation. Survives reboots, runs whether Claude is open or not.

**How it works:**
1. Tasks are registered with "Run whether user is logged on or not" + WakeToRun
2. Your Windows password is stored securely with the task (prompted once during setup)
3. At the scheduled time, a task launches Claude Code in non-interactive mode
4. Claude executes the pipeline skill, creates ClickUp tasks, and stages emails
5. Eric reviews Gmail drafts at his convenience
6. Works whether you're logged in, logged out, or the PC is asleep

**Setup script:** `operations/automation/scripts/setup-scheduler.ps1`

Run in PowerShell (Admin):
```powershell
cd "c:\Claude Code\OphidianAI"
powershell -ExecutionPolicy Bypass -File operations/automation/scripts/setup-scheduler.ps1
```

**What it creates:**

| Task Name                    | Schedule              | Action                           |
| ---------------------------- | --------------------- | -------------------------------- |
| OphidianAI-OutreachPipeline  | Monday 7:00 AM        | Run outreach pipeline            |
| OphidianAI-ReplyCheck        | Thu-Fri 7:00 AM       | Check replies, update trackers   |

**To view/edit scheduled tasks:**
```powershell
# List OphidianAI tasks
Get-ScheduledTask | Where-Object {$_.TaskName -like "OphidianAI*"}

# Disable a task
Disable-ScheduledTask -TaskName "OphidianAI-OutreachPipeline"

# Delete a task
Unregister-ScheduledTask -TaskName "OphidianAI-OutreachPipeline" -Confirm:$false
```

## Pipeline Notifications

After each scheduled run, Eric gets notified via:

1. **ClickUp tasks** -- Created at each pipeline stage (Research Complete, Scoring Complete, Drafts Ready, Staged for Review)
2. **Morning coffee** -- Next morning briefing includes staged email count and template performance
3. **Gmail drafts** -- Emails sitting in Drafts folder ready for review

## Safety Rails

- The pipeline **never sends emails automatically**. It only stages drafts. Eric always sends.
- If the pipeline fails, it creates a ClickUp task with the error details.
- Daily send limits are enforced at the send step (not the staging step).
- If no qualifying leads are found, the pipeline reports that honestly instead of lowering standards.

## Monitoring

Check pipeline run history:
```bash
# View automation logs
ls operations/automation/logs/

# Check ClickUp for pipeline tasks
node .claude/skills/clickup/scripts/clickup.js tasks 901711710045
```

Pipeline run logs are saved to `operations/automation/logs/YYYY-MM-DD-pipeline.log`.
