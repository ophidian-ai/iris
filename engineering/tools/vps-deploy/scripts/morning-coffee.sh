#!/bin/bash
# Iris Morning Coffee -- Daily briefing generation
cd /home/eric/OphidianAI
LOG_DIR=/var/log/iris
mkdir -p "$LOG_DIR"

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

claude -p "/morning-coffee" \
  --allowedTools '*' \
  2>&1 | tee "$LOG_DIR/morning-coffee-$(date +%Y-%m-%d).log"
