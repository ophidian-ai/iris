#!/bin/bash
# Iris Outreach Pipeline -- Weekly prospect research and email drafting
cd /home/eric/OphidianAI
LOG_DIR=/var/log/iris
mkdir -p "$LOG_DIR"

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

claude -p "/outreach-pipeline" \
  --allowedTools '*' \
  2>&1 | tee "$LOG_DIR/outreach-pipeline-$(date +%Y-%m-%d).log"
