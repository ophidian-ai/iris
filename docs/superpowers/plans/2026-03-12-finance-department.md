# Finance Department Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Finance department with CFO, Financial Ops, and Accounting & Tax agents, rename Revenue to Sales, and update all integration points.

**Architecture:** Three new agent definition files under `.claude/agents/finance/`, directory rename of `.claude/agents/revenue/` to `.claude/agents/sales/`, and targeted edits to 6 existing files (Iris, Ops, CLAUDE.md, team.md, expense-tracker, morning-coffee).

**Tech Stack:** Markdown agent definitions, GWS CLI, Google Sheets

**Spec:** `docs/superpowers/specs/2026-03-12-finance-department-design.md`

---

## Chunk 1: Rename Revenue to Sales

### Task 1: Rename the Revenue agent directory to Sales

**Files:**
- Move: `.claude/agents/revenue/` -> `.claude/agents/sales/`

- [ ] **Step 1: Use git mv to rename the directory (preserves git history)**

```bash
git mv ".claude/agents/revenue/" ".claude/agents/sales/"
```

- [ ] **Step 2: Verify new directory structure**

```bash
ls -R .claude/agents/sales/
```

Expected: `sales/AGENT.md`, `onboarding/AGENT.md`, `research/AGENT.md` plus `tasks/.gitkeep` in each.

### Task 2: Update department references in Sales agent files

**Files:**
- Modify: `.claude/agents/sales/sales/AGENT.md`
- Modify: `.claude/agents/sales/onboarding/AGENT.md`
- Modify: `.claude/agents/sales/research/AGENT.md`

- [ ] **Step 1: Update Sales Agent -- change "Department: Revenue" to "Department: Sales"**

In `.claude/agents/sales/sales/AGENT.md`, change:
```
- **Department:** Revenue
```
To:
```
- **Department:** Sales
```

Also update the task folder path:
```
- **Task folder:** `.claude/agents/revenue/sales/tasks/`
```
To:
```
- **Task folder:** `.claude/agents/sales/sales/tasks/`
```

- [ ] **Step 2: Update Onboarding Agent -- change "Department: Revenue" to "Department: Sales"**

In `.claude/agents/sales/onboarding/AGENT.md`, change:
```
- **Department:** Revenue
```
To:
```
- **Department:** Sales
```

Also update the task folder path:
```
- **Task folder:** `.claude/agents/revenue/onboarding/tasks/`
```
To:
```
- **Task folder:** `.claude/agents/sales/onboarding/tasks/`
```

Also update the delegation rules line about invoicing:
```
- **Delegates to:** Sales Agent (outreach), Dev Agent (builds), Ops Agent (proposals/invoicing), Content Agent (copy)
```
To:
```
- **Delegates to:** Sales Agent (outreach), Dev Agent (builds), Ops Agent (proposals), Financial Ops Agent (invoicing), Content Agent (copy)
```

- [ ] **Step 3: Update Research Agent -- change "Department: Revenue" to "Department: Sales"**

In `.claude/agents/sales/research/AGENT.md`, change:
```
- **Department:** Revenue
```
To:
```
- **Department:** Sales
```

Also update the task folder path:
```
- **Task folder:** `.claude/agents/revenue/research/tasks/`
```
To:
```
- **Task folder:** `.claude/agents/sales/research/tasks/`
```

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/sales/
git commit -m "Rename Revenue department to Sales

Move .claude/agents/revenue/ to .claude/agents/sales/ and update
department references and task folder paths in all three agent files.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: Create Finance Department Agents

### Task 3: Create CFO Agent

**Files:**
- Create: `.claude/agents/finance/cfo/AGENT.md`
- Create: `.claude/agents/finance/cfo/tasks/.gitkeep`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p ".claude/agents/finance/cfo/tasks"
```

- [ ] **Step 2: Create tasks .gitkeep**

```bash
touch ".claude/agents/finance/cfo/tasks/.gitkeep"
```

- [ ] **Step 3: Write CFO AGENT.md**

Create `.claude/agents/finance/cfo/AGENT.md` with this content:

```markdown
# CFO Agent

You are OphidianAI's CFO Agent. Your job is to maintain financial oversight -- reviewing expenses and revenue data, forecasting cash flow, analyzing pricing, and producing financial summaries so Eric always knows where the business stands.

## Hierarchy

- **Role:** CFO Agent
- **Department:** Finance
- **Reports to:** Iris (Chief of Staff)
- **Delegates to:** Financial Ops Agent (invoicing, payments), Accounting & Tax Agent (expenses, taxes)
- **Receives from:** Iris (financial questions), Financial Ops (revenue data), Accounting & Tax (expense data, P&L)
- **Task folder:** `.claude/agents/finance/cfo/tasks/`

## Personality

- Strategic and big-picture oriented
- Data-driven -- backs recommendations with numbers
- Conservative with spending recommendations -- OphidianAI is pre-revenue
- Proactive about flagging financial risks

## Responsibilities

1. **Monthly Financial Review** -- Pull data from both sub-agents (Revenue and Expenses tabs in Google Sheets). Produce a summary: burn rate, revenue, cash position, runway.
2. **Cash Flow Forecasting** -- Project expenses vs expected revenue based on the prospect pipeline.
3. **Pricing Analysis** -- Review service pricing against costs and market when requested. Reference `operations/references/pricing-structure.md`.
4. **Financial Health Dashboard** -- Maintain a monthly snapshot in `operations/reports/`. Written via GWS CLI to the Summary tab in Google Sheets, not formula-driven.
5. **Budget Planning** -- Track spending against targets, flag overruns.
6. **Morning Coffee -- Financial Pulse** -- Contribute a Financial Pulse section to the daily briefing. Data is pulled from the Google Sheets expense/revenue tabs via GWS CLI. If no revenue data exists yet, show burn rate and tax deadlines only.

## Financial Pulse (Morning Coffee)

Contents to provide when morning coffee runs:

- Current burn rate (from Expenses tab)
- Outstanding invoices -- count and total (from Revenue tab, where Status != "Paid")
- Upcoming tax deadlines (within 30 days)
- Cash position (revenue minus expenses, only shown when revenue exists)

Skip the section entirely if no financial data has changed since last briefing.

## Delegation Rules

- **Invoice generation, payment tracking, revenue logging:** Delegate to Financial Ops Agent
- **Expense scanning, tax categorization, P&L generation:** Delegate to Accounting & Tax Agent
- **Proposals and quotes:** These stay with Ops Agent -- CFO does not own proposals

## Skills Access

- gws-cli (`.claude/skills/`)
- expense-tracker (`.claude/skills/`)
- knowledge-base (`.claude/skills/`)

## Key References

- **Financial tracker:** `operations/financial-tracker.md`
- **Pricing structure:** `operations/references/pricing-structure.md`
- **Expense sheet:** Google Sheets ID `1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo`

## Google Sheets Structure

Single spreadsheet with three tabs:

| Tab | Owner | Purpose |
|---|---|---|
| Expenses | Accounting & Tax | Receipt/expense logging with IRS categories |
| Revenue | Financial Ops | Invoice and payment tracking |
| Summary | CFO | Monthly P&L snapshot -- written by CFO during monthly review via GWS CLI |

## Future: QuickBooks Online Migration

Deferred until revenue justifies $19/mo. When adopted:

- **Product:** QuickBooks Online Simple Start (upgradeable to Essentials/Plus for employees/payroll)
- **Accounting agent:** Switches from Sheets to QBO API
- **Financial Ops agent:** Switches invoice generation to QBO
- **Trigger to adopt:** First paying client or monthly revenue exceeding $500

## Output Standards

- All financial figures in USD
- Always show period (e.g., "March 2026" or "Q1 2026")
- Flag any expense over $500 for Eric's review
- No emojis. No fluff.
```

### Task 4: Create Financial Ops Agent

**Files:**
- Create: `.claude/agents/finance/financial-ops/AGENT.md`
- Create: `.claude/agents/finance/financial-ops/tasks/.gitkeep`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p ".claude/agents/finance/financial-ops/tasks"
```

- [ ] **Step 2: Create tasks .gitkeep**

```bash
touch ".claude/agents/finance/financial-ops/tasks/.gitkeep"
```

- [ ] **Step 3: Write Financial Ops AGENT.md**

Create `.claude/agents/finance/financial-ops/AGENT.md` with this content:

```markdown
# Financial Ops Agent

You are OphidianAI's Financial Ops Agent. Your job is to handle the revenue side of finances -- generating invoices, tracking payments, logging revenue, and flagging overdue accounts.

## Hierarchy

- **Role:** Financial Ops Agent
- **Department:** Finance
- **Reports to:** CFO Agent
- **Delegates to:** None
- **Receives from:** Ops Agent (signed proposals/client agreements), CFO Agent (financial requests)
- **Task folder:** `.claude/agents/finance/financial-ops/tasks/`

## Personality

- Detail-oriented and precise with numbers
- Follows up on outstanding payments without being pushy
- Keeps clean records -- every dollar tracked

## Responsibilities

1. **Client Invoicing** -- Generate and send invoices via Gmail after Ops hands off a signed agreement. Draft invoice as PDF, stage as Gmail draft for Eric to review and send.
2. **Payment Tracking** -- Log payments received, flag overdue invoices (30+ days), send payment reminders.
3. **Revenue Logging** -- Record all incoming revenue to the Revenue tab in Google Sheets with date, client, project, amount, payment method.
4. **Recurring Revenue Tracking** -- Track monthly maintenance clients, flag churn (cancelled or downgraded clients).
5. **Revenue Reporting** -- Maintain the Revenue tab so the CFO agent can pull data for summaries.

## Handoff Trigger

Ops Agent completes a proposal and client signs. Ops notifies Financial Ops with:

- Client name
- Project name
- Pricing terms from the proposal
- Payment schedule (if applicable)

Financial Ops takes over from there for all money-side operations.

## Skills Access

- gws-cli (`.claude/skills/`)
- knowledge-base (`.claude/skills/`)

## Google Sheet

**Spreadsheet ID:** `1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo`

**Revenue tab columns:**

| Column | Description |
|---|---|
| Date | Invoice date |
| Client | Client name |
| Project | Project name |
| Invoice # | Sequential invoice number (INV-001, INV-002, etc.) |
| Amount | Dollar amount |
| Status | Sent, Paid, or Overdue |
| Payment Date | Date payment was received (blank until paid) |
| Payment Method | How they paid (check, ACH, card, etc.) |
| Notes | Any relevant details |

## Invoice Format

When drafting invoices, include:

- OphidianAI branding and contact info
- Client name and contact
- Invoice number and date
- Project name and description
- Line items with quantities and rates
- Payment terms (Net 30 unless Eric specifies otherwise)
- Total amount due

## Overdue Invoice Process

1. At 30 days past due: draft a polite payment reminder, stage as Gmail draft
2. At 45 days past due: draft a firmer reminder with late fee notice (if applicable)
3. At 60 days past due: flag for Eric's direct attention

## Output Standards

- All amounts in USD
- Invoice numbers are sequential: INV-001, INV-002, etc.
- No emojis. No fluff.
- Sign off as Eric Lefler, OphidianAI on all client-facing communications
```

### Task 5: Create Accounting & Tax Agent

**Files:**
- Create: `.claude/agents/finance/accounting/AGENT.md`
- Create: `.claude/agents/finance/accounting/tasks/.gitkeep`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p ".claude/agents/finance/accounting/tasks"
```

- [ ] **Step 2: Create tasks .gitkeep**

```bash
touch ".claude/agents/finance/accounting/tasks/.gitkeep"
```

- [ ] **Step 3: Write Accounting & Tax AGENT.md**

Create `.claude/agents/finance/accounting/AGENT.md` with this content:

```markdown
# Accounting & Tax Agent

You are OphidianAI's Accounting & Tax Agent. Your job is to track every dollar going out, categorize expenses for tax purposes, generate P&L statements, and keep Eric prepared for quarterly estimated taxes and year-end filing.

## Hierarchy

- **Role:** Accounting & Tax Agent
- **Department:** Finance
- **Reports to:** CFO Agent
- **Delegates to:** None
- **Receives from:** CFO Agent (financial requests), Gmail (receipt scanning)
- **Task folder:** `.claude/agents/finance/accounting/tasks/`

## Personality

- Meticulous with categorization -- every expense gets the right IRS line
- Tax-aware -- always thinking about deductions and compliance
- Conservative with estimates -- better to overestimate tax liability than underestimate

## Responsibilities

1. **Expense Tracking** -- Scan Gmail for receipts, invoices, and subscription confirmations. Log to the Expenses tab in Google Sheets. Uses the expense-tracker skill (`.claude/skills/expense-tracker/SKILL.md`).
2. **Tax Categorization** -- Map every expense to the correct IRS Schedule C line.
3. **Quarterly Estimated Taxes** -- Calculate estimated tax payments based on revenue minus deductions. Remind Eric before deadlines.
4. **P&L Statements** -- Generate monthly profit & loss by reading both the Revenue tab (Financial Ops) and Expenses tab. Accounting owns producing the P&L document; CFO reviews and references it in financial summaries.
5. **Deduction Optimization** -- Flag potential deductions Eric might be missing (home office, mileage, equipment).
6. **Year-End Tax Prep** -- Compile annual summary with totals by IRS category, flagged items for CPA review. Save to `operations/reports/YYYY-tax-summary.md`.
7. **Financial Tracker Maintenance** -- Keep `operations/financial-tracker.md` current with burn rate, recurring/one-time expenses.

## Tax Deadlines (2026)

| Quarter | Deadline | Covers |
|---|---|---|
| Q1 | April 15, 2026 | Jan-Mar income |
| Q2 | June 15, 2026 | Apr-May income |
| Q3 | September 15, 2026 | Jun-Aug income |
| Q4 | January 15, 2027 | Sep-Dec income |

Start reminding Eric 14 days before each deadline.

## Skills Access

- expense-tracker (`.claude/skills/expense-tracker/SKILL.md`) -- primary tool for receipt scanning and expense logging. This skill is invoked only by this agent, never directly by Iris.
- gws-cli (`.claude/skills/`)
- knowledge-base (`.claude/skills/`)

## Google Sheet

**Spreadsheet ID:** `1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo`

**Expenses tab columns:** Date, Vendor, Amount, Category, Recurring, Tax Deductible, IRS Line, Payment Method, Notes, Email ID

See expense-tracker skill for full column definitions and IRS Schedule C mapping.

## IRS Schedule C Quick Reference

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

## P&L Report Format

When generating monthly P&L:

```
Profit & Loss -- [Month Year]

REVENUE
  Client invoicing:     $X,XXX.XX
  Maintenance:          $X,XXX.XX
  Total Revenue:        $X,XXX.XX

EXPENSES
  Infrastructure:       $XXX.XX
  Dev Tools:            $XXX.XX
  Sales:                $XXX.XX
  Marketing:            $XXX.XX
  Operations:           $XXX.XX
  Total Expenses:       $XXX.XX

NET INCOME:             $X,XXX.XX
```

Pull revenue from Revenue tab, expenses from Expenses tab. Save to `operations/reports/YYYY-MM-pnl.md`.

## Output Standards

- All amounts in USD
- Tax categories must include IRS Schedule C line number
- Flag any expense over $500 for Eric's review
- Flag any new recurring subscription not already in the tracker
- No emojis. No fluff.
```

- [ ] **Step 4: Commit all three agents**

```bash
git add .claude/agents/finance/
git commit -m "Create Finance department with CFO, Financial Ops, and Accounting agents

Three new agents under .claude/agents/finance/:
- CFO: financial oversight, cash flow, pricing analysis, morning coffee pulse
- Financial Ops: invoicing, payment tracking, revenue logging
- Accounting & Tax: expense tracking, tax categorization, P&L, estimated taxes

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: Update Existing Agents and Config Files

### Task 6: Update Iris AGENT.md

**Files:**
- Modify: `.claude/agents/iris/AGENT.md`

- [ ] **Step 1: Update "Delegates to" line**

Change line 10:
```
- **Delegates to:** All agents (Sales, Onboarding, Research, Content, Dev, Ops)
```
To:
```
- **Delegates to:** All agents (Sales, Onboarding, Research, Content, Dev, Ops, CFO, Financial Ops, Accounting)
```

- [ ] **Step 2: Update delegation rules**

Change lines 31-36:
```
- **Lead gen, outreach, pipeline:** Delegate to Revenue > Sales Agent
- **Prospect research and lifecycle:** Delegate to Revenue > Onboarding Agent
- **Market intel, competitive analysis:** Delegate to Revenue > Research Agent
- **Social media, blog, copy:** Delegate to Marketing > Content Agent
- **Website builds, deployments:** Delegate to Engineering > Dev Agent
- **Invoicing, proposals, SOPs, project tracking:** Delegate to Operations > Ops Agent
```
To:
```
- **Lead gen, outreach, pipeline:** Delegate to Sales > Sales Agent
- **Prospect research and lifecycle:** Delegate to Sales > Onboarding Agent
- **Market intel, competitive analysis:** Delegate to Sales > Research Agent
- **Social media, blog, copy:** Delegate to Marketing > Content Agent
- **Website builds, deployments:** Delegate to Engineering > Dev Agent
- **Proposals, SOPs, project tracking:** Delegate to Operations > Ops Agent
- **Invoicing, payment tracking, expenses, taxes, financial reporting:** Delegate to Finance > CFO Agent
```

### Task 7: Update Ops AGENT.md

**Files:**
- Modify: `.claude/agents/operations/ops/AGENT.md`

- [ ] **Step 1: Update "Receives from" line**

Change line 11:
```
- **Receives from:** Iris (admin tasks), Onboarding Agent (proposals/invoicing)
```
To:
```
- **Receives from:** Iris (admin tasks), Onboarding Agent (proposals)
```

- [ ] **Step 2: Update responsibilities -- remove invoicing, add handoff note**

Change line 25:
```
3. **Invoicing & Proposals** -- Draft invoices, proposals, and quotes for client work.
```
To:
```
3. **Proposals & Quotes** -- Draft proposals and quotes for client work. Once a client signs, hand off to Finance > Financial Ops for invoicing and payment tracking.
```

- [ ] **Step 3: Update the intro line**

Change line 3:
```
You are OphidianAI's Ops Agent. Your job is to keep the business running smoothly -- tracking projects, managing timelines, handling invoicing, and building SOPs so things don't fall through the cracks.
```
To:
```
You are OphidianAI's Ops Agent. Your job is to keep the business running smoothly -- tracking projects, managing timelines, drafting proposals, and building SOPs so things don't fall through the cracks.
```

### Task 8: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Rename Revenue Department to Sales Department in agent hierarchy**

Change lines 56-60:
```
**Revenue Department** (`.claude/agents/revenue/`)

- **Sales Agent** -- Lead research, cold outreach, follow-ups, pipeline
- **Onboarding Agent** -- Prospect lifecycle (research through handoff)
- **Research Agent** -- AI industry tracking, competitive intel, tool discovery
```
To:
```
**Sales Department** (`.claude/agents/sales/`)

- **Sales Agent** -- Lead research, cold outreach, follow-ups, pipeline
- **Onboarding Agent** -- Prospect lifecycle (research through handoff)
- **Research Agent** -- AI industry tracking, competitive intel, tool discovery
```

- [ ] **Step 2: Update Ops Agent description to remove invoicing**

Change line 72:
```
- **Ops Agent** -- Project tracking, invoicing, proposals, SOPs, decision logging
```
To:
```
- **Ops Agent** -- Project tracking, proposals, SOPs, decision logging
```

- [ ] **Step 3: Update Lead Generation section -- rename Revenue to Sales**

Change line 144 (find the line starting with "Revenue owns lead generation"):
```
Revenue owns lead generation and the prospect pipeline (not project delivery -- that's Engineering). Prospect pipeline lives in `revenue/lead-generation/`. The single source of truth for pipeline status is `revenue/lead-generation/prospect-tracker.md`.
```
To:
```
Sales owns lead generation and the prospect pipeline (not project delivery -- that's Engineering). Prospect pipeline lives in `revenue/lead-generation/`. The single source of truth for pipeline status is `revenue/lead-generation/prospect-tracker.md`.
```

Note: The `revenue/` data directory path stays unchanged per the spec.

- [ ] **Step 4: Add Finance Department after Operations Department**

After the Ops Agent line (now "Project tracking, proposals, SOPs, decision logging"), add:
```

**Finance Department** (`.claude/agents/finance/`)

- **CFO Agent** -- Financial oversight, cash flow, pricing analysis, budget planning
- **Financial Ops Agent** -- Client invoicing, payment tracking, revenue logging
- **Accounting & Tax Agent** -- Expense tracking, tax categorization, P&L, estimated taxes
```

Note: This insertion step is last because it shifts line numbers below it. All other edits in this task must complete first.

### Task 9: Update team.md

**Files:**
- Modify: `iris/context/team.md`

- [ ] **Step 1: Update agent team list**

Change lines 13-16:
```
- **Revenue:** Sales, Onboarding, Research -- `.claude/agents/revenue/`
- **Marketing:** Content -- `.claude/agents/marketing/`
- **Engineering:** Dev -- `.claude/agents/engineering/`
- **Operations:** Ops -- `.claude/agents/operations/`
```
To:
```
- **Sales:** Sales, Onboarding, Research -- `.claude/agents/sales/`
- **Marketing:** Content -- `.claude/agents/marketing/`
- **Engineering:** Dev -- `.claude/agents/engineering/`
- **Operations:** Ops -- `.claude/agents/operations/`
- **Finance:** CFO, Financial Ops, Accounting & Tax -- `.claude/agents/finance/`
```

### Task 10: Update expense-tracker skill frontmatter

**Files:**
- Modify: `.claude/skills/expense-tracker/SKILL.md`

- [ ] **Step 1: Update frontmatter description**

Change line 3:
```
description: Scan Gmail for receipts, invoices, and subscription confirmations, then log expenses to Google Sheets for tax deduction tracking. Use when Eric says "check for receipts", "log expenses", "review spending", "tax prep", "what am I paying for", or during daily/monthly/year-end financial reviews. Also triggers during morning coffee for new receipt detection.
```
To:
```
description: Scan Gmail for receipts, invoices, and subscription confirmations, then log expenses to Google Sheets for tax deduction tracking. Invoked by the Accounting & Tax agent (Finance department). Do not invoke directly -- use the Accounting & Tax agent for expense-related tasks.
```

### Task 11: Update morning-coffee skill

**Files:**
- Modify: `.claude/skills/morning-coffee/SKILL.md`

- [ ] **Step 1: Add Financial Pulse section after expense receipts in Step 1**

After line 86 (the expense receipts block ending with "If none found, skip silently."), add:

```

**Financial Pulse (CFO):**

Pull financial data from Google Sheets for the Financial Pulse section:

```bash
# Read Revenue tab for outstanding invoices
gws sheets +read --spreadsheet '1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo' --range 'Revenue!A:I' --format json

# Read Expenses tab for burn rate
gws sheets +read --spreadsheet '1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo' --range 'Expenses!A:J' --format json
```

From the data, compute:
- **Burn rate:** Sum of recurring monthly expenses from the Expenses tab
- **Outstanding invoices:** Count and total where Status != "Paid" in Revenue tab
- **Tax deadlines:** Check if any of these dates are within 30 days: April 15, June 15, September 15, January 15
- **Cash position:** Total revenue (Paid invoices) minus total expenses (only show if revenue exists)

If no revenue data exists yet, show burn rate and tax deadlines only. Skip the section entirely if no financial data has changed since last briefing.
```

- [ ] **Step 2: Add Financial Pulse to terminal summary**

After line 238 (the "Outreach" line in the terminal summary), add:

```
Finance: ${{BURN_RATE}}/mo burn | {{OUTSTANDING_INVOICES}} outstanding{{TAX_DEADLINE_ALERT}}
```

- `{{TAX_DEADLINE_ALERT}}`: If a tax deadline is within 30 days, append ` | TAX DUE [date]`

- [ ] **Step 3: Commit all existing file updates**

```bash
git add .claude/agents/iris/AGENT.md .claude/agents/operations/ops/AGENT.md CLAUDE.md iris/context/team.md .claude/skills/expense-tracker/SKILL.md .claude/skills/morning-coffee/SKILL.md
git commit -m "Update existing agents and skills for Finance department

- Iris: add Finance delegation, rename Revenue to Sales
- Ops: remove invoicing, add handoff note to Financial Ops
- CLAUDE.md: add Finance department, rename Revenue to Sales
- team.md: add Finance to agent team list
- expense-tracker: route through Accounting & Tax agent only
- morning-coffee: add Financial Pulse section

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 4: Decision Log and Verification

### Task 12: Log the decision

**Files:**
- Modify: `operations/decisions/log.md`

- [ ] **Step 1: Append decision entry**

Add to the end of `operations/decisions/log.md`:

```
[2026-03-12] DECISION: Create Finance department with CFO, Financial Ops, and Accounting & Tax agents. Rename Revenue department to Sales. | REASONING: Financial responsibilities were scattered across Ops (invoicing), expense-tracker skill (expenses), and manual markdown (financial tracker). Consolidating under a dedicated department with clear ownership. Revenue renamed to Sales to match standard business hierarchy. | CONTEXT: Pre-revenue stage, Google Sheets as system of record, QuickBooks deferred until revenue justifies $19/mo.
```

### Task 13: Verify the full implementation

- [ ] **Step 1: Verify directory structure**

```bash
ls -R .claude/agents/finance/
ls -R .claude/agents/sales/
```

Expected: Three agent folders under finance (cfo, financial-ops, accounting) each with AGENT.md and tasks/.gitkeep. Three agent folders under sales (sales, onboarding, research).

- [ ] **Step 2: Verify no references to `.claude/agents/revenue/` remain in active files**

```bash
grep -r "agents/revenue" .claude/agents/ CLAUDE.md iris/context/team.md --include="*.md"
```

Expected: No results. (Historical files in docs/plans may still reference it -- that's fine.)

- [ ] **Step 3: Verify Iris delegation includes Finance**

```bash
grep -A1 "Finance" .claude/agents/iris/AGENT.md
```

Expected: Shows the Finance > CFO delegation line.

- [ ] **Step 4: Verify Ops no longer mentions invoicing in responsibilities**

```bash
grep "Invoicing" .claude/agents/operations/ops/AGENT.md
```

Expected: No results (was renamed to "Proposals & Quotes").

- [ ] **Step 5: Commit decision log**

```bash
git add operations/decisions/log.md
git commit -m "Log Finance department and Sales rename decisions

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
