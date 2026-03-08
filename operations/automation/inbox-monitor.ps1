# Inbox Monitor -- checks Gmail for new/important emails
# Scheduled: twice daily, weekdays ~10 AM and ~5 PM ET

$ProjectDir = "C:\Claude Code\OphidianAI"
$LogDir = "$ProjectDir\operations\automation\logs"
$LogFile = "$LogDir\inbox-monitor-$(Get-Date -Format 'yyyy-MM-dd-HHmm').log"

if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$Prompt = @"
Check Eric's Gmail inbox for new emails received in the last 2 hours using the gmail skill.

Priority handling:
- Christina (Bloomin' Acres client): Flag immediately. If she's asking about something technical or project-related that I can help with, draft a response. If it requires Eric's personal input, summarize what she needs.
- Prospect responses (anyone replying to outreach emails): Flag as high priority. Summarize the response and recommend next steps.
- Other business emails: Note them briefly.

If there are no new emails, just log "No new emails" and exit quietly.

Write a brief summary to: operations/automation/logs/inbox-summary-$(Get-Date -Format 'yyyy-MM-dd-HHmm').md
Only create the summary file if there are actionable items.
"@

Set-Location $ProjectDir
& claude -p $Prompt --allowedTools "Skill,Read,Write,Glob,Grep,Bash,Agent,TodoWrite,Edit" 2>&1 | Tee-Object -FilePath $LogFile
