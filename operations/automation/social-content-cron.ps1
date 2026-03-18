# Social Content Cron -- bi-weekly batch generation trigger
# Scheduled: every other Monday at 6:00 AM ET
#
# Checks whether a new social media batch is needed, then generates one
# automatically via the social-content skill.
#
# Logic:
#   1. Look for the most recent batch JSON in marketing/social-media/batches/
#   2. If no batch exists, or last batch is "published", or period_start is 14+ days ago -> generate
#   3. If a batch is in draft/review/approved/scheduled -> log status and skip
#
# Logs to: operations/automation/logs/social-content-cron-YYYY-MM-DD-HHMM.log

$ProjectDir = "C:\Claude Code\OphidianAI"
$LogDir = "$ProjectDir\operations\automation\logs"
$LogFile = "$LogDir\social-content-cron-$(Get-Date -Format 'yyyy-MM-dd-HHmm').log"

if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$Prompt = @"
Check whether a new social media content batch needs to be generated for OphidianAI.

Steps:
1. Look in marketing/social-media/batches/ for all batch JSON files (pattern: *-batch.json).
2. Find the most recent one (by filename date, newest first).
3. Check its status field:
   - If no batch files exist: generate a new batch now.
   - If status is "published": check if period_start is at least 14 days ago. If yes, generate a new batch. If no, log "Next batch not due yet" with the period_end date and stop.
   - If status is "draft", "review", "approved", or "scheduled": log "Batch in progress: [status] -- skipping auto-generation" and stop. Do NOT overwrite.
4. If generating: run the /social-content skill for the upcoming 2-week window starting from the next Monday.
5. After generating, log a summary of the batch created (post count, date range, status).
6. Write a brief summary to: operations/automation/logs/social-content-cron-$(Get-Date -Format 'yyyy-MM-dd-HHmm').md

Today is $(Get-Date -Format 'yyyy-MM-dd').
"@

Set-Location $ProjectDir
& claude -p $Prompt --allowedTools "Skill,Read,Write,Glob,Grep,Bash,Agent,TodoWrite,Edit" 2>&1 | Tee-Object -FilePath $LogFile
