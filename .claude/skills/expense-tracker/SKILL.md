# Expense Tracker

Scan Gmail for receipts, invoices, and subscription confirmations. Extract expense data and log it to the financial tracker for tax deduction tracking and year-end optimization.

## When to Use

- During morning coffee / daily briefing (scan for new receipts since last check)
- When Eric asks to review expenses, find deductions, or update financial records
- Monthly: comprehensive scan for any missed receipts
- Year-end: full audit for tax preparation

## Process

### Step 1: Scan Inbox for Receipts

Search Gmail for recent receipts using the gmail skill:

```
Search queries (run each):
- "receipt" newer_than:7d
- "invoice" newer_than:7d
- "payment confirmation" newer_than:7d
- "subscription" newer_than:7d
- "order confirmation" newer_than:7d
- "billing statement" newer_than:7d
- from:noreply OR from:billing OR from:receipts newer_than:7d
```

For monthly/year-end scans, adjust the date range accordingly.

### Step 2: Extract Expense Data

For each receipt found, extract:

| Field | Description |
|---|---|
| Date | Transaction date |
| Vendor | Who was paid |
| Amount | Dollar amount |
| Category | Match to existing categories (see below) |
| Recurring? | Yes/No -- is this a subscription or one-time purchase? |
| Tax Deductible? | Yes/No/Partial -- based on business use |
| Deduction Category | IRS category (see Tax Categories below) |
| Notes | What it's for, business justification |

### Step 3: Log to Financial Tracker

Update `operations/financial-tracker.md`:

- **New recurring expense:** Add to the Recurring Expenses table
- **New one-time expense:** Add to the One-Time Expenses table
- **Existing subscription renewal:** Verify amount hasn't changed, update date if needed
- **Update Monthly Summary:** Recalculate totals after adding new expenses

### Step 4: Save Receipt Archive

For each new receipt, save a summary to `operations/expenses/YYYY/MM/`:

```
operations/expenses/2026/03/2026-03-07-vendor-name.md
```

Each file contains:
- Vendor, amount, date
- Category and tax deduction status
- Gmail message ID (for retrieving the original receipt)
- Business justification

### Step 5: Report

Output a summary of what was found:
- New expenses logged (table)
- Updated monthly burn rate
- Any flagged items (price increases, unexpected charges, duplicate charges)
- Running YTD total by category

## Expense Categories

| Category | Description | Tax Deductible |
|---|---|---|
| Infrastructure | Hosting, domains, email, core tools | Yes -- Business expense |
| Sales | Lead gen, outreach, CRM, warmup | Yes -- Advertising/Marketing |
| Marketing | Social media, content, advertising | Yes -- Advertising/Marketing |
| Dev Tools | AI assistants, APIs, development tools | Yes -- Software/Tech |
| Operations | Project management, accounting, legal | Yes -- Business expense |
| Equipment | Computer, peripherals, office supplies | Yes -- Section 179 / Depreciation |
| Education | Courses, books, subscriptions for learning | Yes -- Education/Training |
| Travel | Business travel, mileage, meals | Yes -- Travel (50% for meals) |
| Professional Services | Legal, accounting, consulting fees | Yes -- Professional services |

## IRS Tax Deduction Categories (Schedule C)

Map each expense to the appropriate Schedule C line for year-end:

| Line | Category | Examples |
|---|---|---|
| 8 | Advertising | Marketing tools, ad spend, social media tools |
| 10 | Commissions and fees | Stripe fees, platform fees |
| 17 | Legal and professional | Accounting, legal, consulting |
| 18 | Office expense | Software subscriptions, office supplies |
| 22 | Supplies | Equipment under $2,500 |
| 25 | Utilities | Internet, phone (business portion) |
| 27a | Other expenses | Education, training, domain registrations |
| 13 | Depreciation | Equipment over $2,500 (or Section 179 election) |

## Rules

- Never delete or modify receipt emails
- Flag any expense over $500 for Eric's review
- Flag any new recurring subscription not already in the tracker
- Track price increases on existing subscriptions
- For mixed personal/business expenses (phone, internet), note the business-use percentage
- Keep a running YTD total for quarterly estimated tax planning
- All amounts in USD

## Year-End Tax Report

When requested, generate a comprehensive report:

1. Total expenses by IRS category
2. Total deductible amount
3. List of all recurring subscriptions (active and cancelled)
4. Flagged items needing accountant review
5. Mileage log summary (if tracked)
6. Home office deduction calculation (if applicable)

Save to `operations/reports/YYYY-tax-summary.md`

## Integration with Morning Coffee

During daily briefing, include a one-liner if new receipts were found:
- "Found 2 new receipts since last check: Cloudflare ($10.46), CapCut Pro ($0.00). Logged to financial tracker."
- If nothing new: skip the section entirely.
