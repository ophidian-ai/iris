#!/bin/bash
# Iris Follow-Up Check -- Flag overdue prospect follow-ups
cd /home/eric/OphidianAI
LOG_DIR=/var/log/iris
mkdir -p "$LOG_DIR"

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

claude -p "Check for overdue follow-ups in the prospect pipeline. If any are overdue, email me a summary at eric.lefler@ophidianai.com with the prospect name, last contact date, and recommended action." \
  --allowedTools '*' \
  2>&1 | tee "$LOG_DIR/follow-up-check-$(date +%Y-%m-%d).log"
