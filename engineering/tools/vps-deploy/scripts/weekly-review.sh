#!/bin/bash
# Iris Weekly Review -- Friday summary of the week's activity
cd /home/eric/OphidianAI
LOG_DIR=/var/log/iris
mkdir -p "$LOG_DIR"

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

claude -p "Generate a weekly review covering: pipeline changes, tasks completed, revenue activity, key decisions made, and recommendations for next week. Email the summary to eric.lefler@ophidianai.com." \
  --allowedTools '*' \
  2>&1 | tee "$LOG_DIR/weekly-review-$(date +%Y-%m-%d).log"
