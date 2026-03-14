#!/bin/bash
# Iris Expense Scan -- Scan inbox for receipts and log to Sheets
cd /home/eric/OphidianAI
LOG_DIR=/var/log/iris
mkdir -p "$LOG_DIR"

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

claude -p "Scan my inbox for any new receipts, invoices, or subscription confirmations from the last 24 hours. Log any new expenses to the expense tracking sheet." \
  --allowedTools '*' \
  2>&1 | tee "$LOG_DIR/expense-scan-$(date +%Y-%m-%d).log"
