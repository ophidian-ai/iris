# Pipeline Follow-Up Check -- reviews prospect tracker for overdue follow-ups
# Scheduled: weekdays at 10:03 AM ET

$ProjectDir = "C:\Claude Code\OphidianAI"
$LogDir = "$ProjectDir\operations\automation\logs"
$LogFile = "$LogDir\pipeline-check-$(Get-Date -Format 'yyyy-MM-dd').log"

if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$Prompt = @"
Review the prospect pipeline for follow-up actions needed today.

1. Read revenue/lead-generation/prospect-tracker.md
2. Check each prospect's last contact date and follow-up schedule
3. Identify any prospects that are overdue for follow-up or have follow-ups due today
4. Check if any outreach emails were sent that haven't received responses (check the prospect folders in revenue/lead-generation/prospects/ for sent emails)
5. For Bloomin' Acres specifically, check the project status and flag anything that needs Eric's attention

Write a brief action summary to: operations/automation/logs/pipeline-summary-$(Get-Date -Format 'yyyy-MM-dd').md
Include:
- Overdue follow-ups with recommended actions
- Prospects that need re-engagement
- Any pipeline items that need Eric's decision

Today's date is $(Get-Date -Format 'yyyy-MM-dd').
"@

Set-Location $ProjectDir
& claude -p $Prompt --allowedTools "Skill,Read,Write,Glob,Grep,Bash,Agent,TodoWrite,Edit" 2>&1 | Tee-Object -FilePath $LogFile
