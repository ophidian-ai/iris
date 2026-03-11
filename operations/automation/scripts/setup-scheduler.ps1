# setup-scheduler.ps1
# Creates Windows Task Scheduler entries for OphidianAI outreach automation.
# Tasks run whether the user is logged in or not.
# Run as Administrator: powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1

$ErrorActionPreference = "Stop"
$ProjectDir = "c:\Claude Code\OphidianAI"
$LogDir = "$ProjectDir\operations\automation\logs"

# Ensure log directory exists
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

Write-Host "Setting up OphidianAI outreach automation..." -ForegroundColor Cyan
Write-Host ""

# Prompt for Windows password (required to run tasks when logged out)
$username = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
Write-Host "Tasks will run as: $username" -ForegroundColor White
Write-Host "Windows password is required so tasks run whether you're logged in or not." -ForegroundColor Gray
$credential = Get-Credential -UserName $username -Message "Enter your Windows password for scheduled task authentication"
$password = $credential.GetNetworkCredential().Password

# --- Task 1: Monday Outreach Pipeline ---
$taskName1 = "OphidianAI-OutreachPipeline"
$description1 = "Run the weekly outreach pipeline: research, score, draft, and stage cold emails as Gmail drafts. Runs whether user is logged in or not."

$trigger1 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 7:00AM

$action1 = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument "/c cd /d `"$ProjectDir`" && claude --print `"Run /run-outreach-pipeline with default settings. Log output to operations/automation/logs/%date:~-4%-%date:~4,2%-%date:~7,2%-pipeline.log`" > `"$LogDir\pipeline-latest.log`" 2>&1" `
    -WorkingDirectory $ProjectDir

$settings1 = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -WakeToRun `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

# Remove existing task if present
if (Get-ScheduledTask -TaskName $taskName1 -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName1 -Confirm:$false
    Write-Host "  Removed existing task: $taskName1" -ForegroundColor Yellow
}

Register-ScheduledTask `
    -TaskName $taskName1 `
    -Description $description1 `
    -Trigger $trigger1 `
    -Action $action1 `
    -Settings $settings1 `
    -User $username `
    -Password $password `
    -RunLevel Highest | Out-Null

Write-Host "  Created: $taskName1 (Mondays at 7:00 AM)" -ForegroundColor Green

# --- Task 2: Thursday/Friday Reply Check ---
$taskName2 = "OphidianAI-ReplyCheck"
$description2 = "Check for prospect replies to cold outreach and update template performance trackers. Runs whether user is logged in or not."

$trigger2a = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Thursday -At 7:00AM
$trigger2b = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Friday -At 7:00AM

$action2 = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument "/c cd /d `"$ProjectDir`" && claude --print `"Check for prospect replies to cold outreach emails. Cross-reference with template-rotation.md and update reply counts. Save results to operations/automation/logs/reply-check-latest.log`" > `"$LogDir\reply-check-latest.log`" 2>&1" `
    -WorkingDirectory $ProjectDir

$settings2 = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -WakeToRun `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

if (Get-ScheduledTask -TaskName $taskName2 -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName2 -Confirm:$false
    Write-Host "  Removed existing task: $taskName2" -ForegroundColor Yellow
}

Register-ScheduledTask `
    -TaskName $taskName2 `
    -Description $description2 `
    -Trigger $trigger2a,$trigger2b `
    -Action $action2 `
    -Settings $settings2 `
    -User $username `
    -Password $password `
    -RunLevel Highest | Out-Null

Write-Host "  Created: $taskName2 (Thu/Fri at 7:00 AM)" -ForegroundColor Green

# --- Summary ---
Write-Host ""
Write-Host "Automation setup complete." -ForegroundColor Cyan
Write-Host ""
Write-Host "Both tasks run whether you're logged in or not." -ForegroundColor White
Write-Host "WakeToRun is enabled -- your PC will wake from sleep to run these." -ForegroundColor White
Write-Host ""
Write-Host "Scheduled tasks:" -ForegroundColor White
Write-Host "  1. $taskName1 -- Mondays at 7:00 AM (pipeline: research -> score -> draft -> stage)"
Write-Host "  2. $taskName2 -- Thu/Fri at 7:00 AM (reply tracking and template performance)"
Write-Host ""
Write-Host "To view tasks: Get-ScheduledTask | Where-Object { `$_.TaskName -like 'OphidianAI*' }" -ForegroundColor Gray
Write-Host "To disable:    Disable-ScheduledTask -TaskName '$taskName1'" -ForegroundColor Gray
Write-Host "To remove all: Get-ScheduledTask | Where-Object { `$_.TaskName -like 'OphidianAI*' } | Unregister-ScheduledTask -Confirm:`$false" -ForegroundColor Gray
