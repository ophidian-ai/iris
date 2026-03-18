# Setup Scheduled Tasks for OphidianAI Automation
# Run this script as Administrator to register the tasks
#
# Tasks created:
#   1. OphidianAI-MorningBriefing  -- Weekdays 7:57 AM
#   2. OphidianAI-InboxMonitor     -- Weekdays 9:57 AM and 4:53 PM
#   3. OphidianAI-PipelineCheck      -- Weekdays 10:03 AM
#   4. OphidianAI-SocialContentCron  -- Every other Monday 6:00 AM (bi-weekly)
#
# All tasks run whether user is logged on or not (prompts for password once).
# All tasks wake the PC from sleep.

$AutomationDir = "C:\Claude Code\OphidianAI\operations\automation"
$PowerShell = "powershell.exe"

# Prompt for credentials once -- used by all tasks to run without logon
$Username = "$env:USERDOMAIN\$env:USERNAME"
$Credential = Get-Credential -UserName $Username -Message "Enter your Windows password to allow scheduled tasks to run while locked/sleeping"
$Password = $Credential.GetNetworkCredential().Password

# -- 1. Morning Briefing: Weekdays at 7:57 AM --
$TaskName1 = "OphidianAI-MorningBriefing"
$Action1 = New-ScheduledTaskAction -Execute $PowerShell -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$AutomationDir\morning-briefing.ps1`""
$Trigger1 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 7:57AM
$Settings1 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

Register-ScheduledTask -TaskName $TaskName1 -Action $Action1 -Trigger $Trigger1 -Settings $Settings1 -User $Username -Password $Password -RunLevel Highest -Description "Generate daily morning briefing via Claude Code" -Force
Write-Host "Registered: $TaskName1 (Weekdays 7:57 AM)"

# -- 2. Inbox Monitor: Twice daily (10am and 5pm) --
$TaskName2 = "OphidianAI-InboxMonitor"
$Action2 = New-ScheduledTaskAction -Execute $PowerShell -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$AutomationDir\inbox-monitor.ps1`""
$Trigger2a = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 9:57AM
$Trigger2b = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 4:53PM
$Settings2 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName2 -Action $Action2 -Trigger @($Trigger2a, $Trigger2b) -Settings $Settings2 -User $Username -Password $Password -RunLevel Highest -Description "Monitor Gmail inbox for urgent emails via Claude Code" -Force
Write-Host "Registered: $TaskName2 (Weekdays ~10 AM and ~5 PM)"

# -- 3. Pipeline Check: Weekdays at 10:03 AM --
$TaskName3 = "OphidianAI-PipelineCheck"
$Action3 = New-ScheduledTaskAction -Execute $PowerShell -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$AutomationDir\pipeline-check.ps1`""
$Trigger3 = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 10:03AM
$Settings3 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Minutes 10)

Register-ScheduledTask -TaskName $TaskName3 -Action $Action3 -Trigger $Trigger3 -Settings $Settings3 -User $Username -Password $Password -RunLevel Highest -Description "Check prospect pipeline for follow-ups via Claude Code" -Force
Write-Host "Registered: $TaskName3 (Weekdays 10:03 AM)"

# -- 4. Social Content Cron: Every other Monday at 6:00 AM --
# Uses Weekly trigger on Monday -- runs every 2 weeks via WeeksInterval=2
$TaskName4 = "OphidianAI-SocialContentCron"
$Action4 = New-ScheduledTaskAction -Execute $PowerShell -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$AutomationDir\social-content-cron.ps1`""
$Trigger4 = New-ScheduledTaskTrigger -Weekly -WeeksInterval 2 -DaysOfWeek Monday -At 6:00AM
$Settings4 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -WakeToRun -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

Register-ScheduledTask -TaskName $TaskName4 -Action $Action4 -Trigger $Trigger4 -Settings $Settings4 -User $Username -Password $Password -RunLevel Highest -Description "Auto-generate bi-weekly social media content batch via Claude Code" -Force
Write-Host "Registered: $TaskName4 (Every other Monday 6:00 AM)"

Write-Host ""
Write-Host "All tasks registered with run-whether-logged-on-or-not and wake-from-sleep."
Write-Host "View in Task Scheduler or run: Get-ScheduledTask -TaskName 'OphidianAI*'"
Write-Host "To remove all: Get-ScheduledTask -TaskName 'OphidianAI*' | Unregister-ScheduledTask -Confirm"
