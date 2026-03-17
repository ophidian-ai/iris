#Requires -RunAsAdministrator
# setup-outreach-scheduler.ps1
# Registers 4 Windows Scheduled Tasks for the OphidianAI outreach automation system.
# Run once in an elevated PowerShell session.
# Usage: .\setup-outreach-scheduler.ps1 [-WhatIf]

param(
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$workDir = "C:\Claude Code\OphidianAI"
$logDir = "$workDir\operations\automation\logs"

# Resolve tool paths
$nodePath = (Get-Command node).Source
$claudePath = (Get-Command claude -ErrorAction SilentlyContinue).Source

if (-not $claudePath) {
    Write-Host "ERROR: 'claude' not found in PATH. Install Claude Code CLI first." -ForegroundColor Red
    exit 1
}

Write-Host "OphidianAI Outreach Scheduler Setup" -ForegroundColor Cyan
Write-Host "------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Node:   $nodePath" -ForegroundColor Gray
Write-Host "  Claude: $claudePath" -ForegroundColor Gray
Write-Host "  WorkDir: $workDir" -ForegroundColor Gray
Write-Host ""

if ($WhatIf) {
    Write-Host "[WhatIf mode] No tasks will be registered." -ForegroundColor Yellow
    Write-Host ""
}

# Ensure log directory exists
if (-not (Test-Path $logDir)) {
    if (-not $WhatIf) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    Write-Host "  Created log directory: $logDir" -ForegroundColor Gray
}

# Prompt for credentials (skip in WhatIf mode)
$username = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
Write-Host "Tasks will run as: $username" -ForegroundColor White

if (-not $WhatIf) {
    Write-Host "Windows password is required so tasks run whether you're logged in or not." -ForegroundColor Gray
    $credential = Get-Credential -UserName $username -Message "Enter your Windows password for scheduled task authentication"
    $password = $credential.GetNetworkCredential().Password
}

Write-Host ""

# Define all tasks
$tasks = @(
    @{
        Name        = "OphidianAI-WeeklyPipeline"
        Description = "Run the weekly outreach pipeline via Claude Code. Mondays at 7:00 AM ET."
        Schedule    = "Monday 7:00 AM"
        Trigger     = { New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 7:00AM }
        Action      = {
            New-ScheduledTaskAction `
                -Execute $claudePath `
                -Argument "--dangerously-skip-permissions -p `"Run /run-outreach-pipeline`"" `
                -WorkingDirectory $workDir
        }
        TimeLimit   = (New-TimeSpan -Hours 1)
    },
    @{
        Name        = "OphidianAI-SendScheduler"
        Description = "Run send-scheduler.js to dispatch staged outreach emails. Weekdays at 10:00 AM ET."
        Schedule    = "Mon-Fri 10:00 AM"
        Trigger     = {
            New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At 10:00AM
        }
        Action      = {
            New-ScheduledTaskAction `
                -Execute $nodePath `
                -Argument "operations/automation/scripts/send-scheduler.js" `
                -WorkingDirectory $workDir
        }
        TimeLimit   = (New-TimeSpan -Minutes 30)
    },
    @{
        Name        = "OphidianAI-InboxNoon"
        Description = "Run inbox-monitor via Claude Code. Weekdays at 12:00 PM ET."
        Schedule    = "Mon-Fri 12:00 PM"
        Trigger     = {
            New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At 12:00PM
        }
        Action      = {
            New-ScheduledTaskAction `
                -Execute $claudePath `
                -Argument "--dangerously-skip-permissions -p `"Run inbox-monitor in standalone mode`"" `
                -WorkingDirectory $workDir
        }
        TimeLimit   = (New-TimeSpan -Minutes 30)
    },
    @{
        Name        = "OphidianAI-Inbox4PM"
        Description = "Run inbox-monitor via Claude Code. Weekdays at 4:00 PM ET."
        Schedule    = "Mon-Fri 4:00 PM"
        Trigger     = {
            New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At 4:00PM
        }
        Action      = {
            New-ScheduledTaskAction `
                -Execute $claudePath `
                -Argument "--dangerously-skip-permissions -p `"Run inbox-monitor in standalone mode`"" `
                -WorkingDirectory $workDir
        }
        TimeLimit   = (New-TimeSpan -Minutes 30)
    }
)

# Register each task
foreach ($task in $tasks) {
    $name = $task.Name

    if ($WhatIf) {
        Write-Host "  [WhatIf] Would register: $name ($($task.Schedule))" -ForegroundColor Yellow
        continue
    }

    # Remove existing task if present
    if (Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $name -Confirm:$false
        Write-Host "  Removed existing task: $name" -ForegroundColor Yellow
    }

    $trigger = & $task.Trigger
    $action = & $task.Action
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -WakeToRun `
        -ExecutionTimeLimit $task.TimeLimit

    Register-ScheduledTask `
        -TaskName $name `
        -Description $task.Description `
        -Trigger $trigger `
        -Action $action `
        -Settings $settings `
        -User $username `
        -Password $password `
        -RunLevel Highest | Out-Null

    Write-Host "  Registered: $name ($($task.Schedule))" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "------------------------------------" -ForegroundColor Cyan

if ($WhatIf) {
    Write-Host "WhatIf complete. Run without -WhatIf to register tasks." -ForegroundColor Yellow
} else {
    Write-Host "All 4 tasks registered." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Task Summary:" -ForegroundColor White
foreach ($task in $tasks) {
    Write-Host "  - $($task.Name) -- $($task.Schedule)"
}

Write-Host ""
Write-Host "All tasks run whether you're logged in or not." -ForegroundColor White
Write-Host "WakeToRun is enabled -- your PC will wake from sleep to execute." -ForegroundColor White
Write-Host ""
Write-Host "Manage tasks:" -ForegroundColor Gray
Write-Host "  View:    Get-ScheduledTask | Where-Object { `$_.TaskName -like 'OphidianAI*' }" -ForegroundColor Gray
Write-Host "  Disable: Disable-ScheduledTask -TaskName 'OphidianAI-WeeklyPipeline'" -ForegroundColor Gray
Write-Host "  Remove:  Get-ScheduledTask | Where-Object { `$_.TaskName -like 'OphidianAI*' } | Unregister-ScheduledTask -Confirm:`$false" -ForegroundColor Gray
