# Morning Briefing -- runs /morning-coffee via Claude Code CLI
# Scheduled: weekdays at 7:57 AM ET

$ProjectDir = "C:\Claude Code\OphidianAI"
$LogDir = "$ProjectDir\operations\automation\logs"
$LogFile = "$LogDir\morning-briefing-$(Get-Date -Format 'yyyy-MM-dd').log"

if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$Prompt = @"
Run /morning-coffee to generate today's daily briefing. Follow the skill exactly.
After generating the briefing, save the output and let Eric know what needs his attention today.
Today's date is $(Get-Date -Format 'yyyy-MM-dd').
"@

Set-Location $ProjectDir
& claude -p $Prompt --allowedTools "Skill,Read,Write,Glob,Grep,Bash,Agent,TodoWrite,Edit,WebFetch,WebSearch,mcp__plugin_context7_context7__resolve-library-id,mcp__plugin_context7_context7__query-docs" 2>&1 | Tee-Object -FilePath $LogFile
