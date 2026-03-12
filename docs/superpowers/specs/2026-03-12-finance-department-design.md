# Finance Department Design

**Date:** 2026-03-12
**Status:** Approved
**Scope:** New Finance department with CFO, Financial Ops, and Accounting & Tax agents. Includes renaming Revenue department to Sales.

## Overview

Create a dedicated Finance department to handle all financial operations for OphidianAI. Currently, financial responsibilities are scattered: Ops Agent owns invoicing, the expense-tracker skill runs independently, and the financial-tracker markdown is manually maintained. This design consolidates everything under a Finance department with clear ownership.

## Department Structure

```
.claude/agents/finance/
  cfo/
    AGENT.md
    tasks/.gitkeep
  financial-ops/
    AGENT.md
    tasks/.gitkeep
  accounting/
    AGENT.md
    tasks/.gitkeep
```

### Hierarchy

- **CFO Agent** -- department head, reports to Iris
- **Financial Ops Agent** -- reports to CFO
- **Accounting & Tax Agent** -- reports to CFO

### Parallel Change: Rename Revenue to Sales

The existing `.claude/agents/revenue/` department is renamed to `.claude/agents/sales/`. Contents unchanged:

- Sales Agent (was under Revenue)
- Onboarding Agent (was under Revenue)
- Research Agent (was under Revenue)

All references to "Revenue" as a department name updated across: CLAUDE.md, Iris AGENT.md, and any agent files.

**Important:** Only `.claude/agents/revenue/` is renamed to `.claude/agents/sales/`. The `revenue/` data directory (lead generation, prospect tracker) is unchanged.

## Agent Specifications

### CFO Agent

- **Role:** Financial strategist and coordinator
- **Reports to:** Iris
- **Delegates to:** Financial Ops, Accounting & Tax
- **Responsibilities:**
  1. Monthly financial review -- pull data from both sub-agents, produce a summary (burn rate, revenue, cash position, runway)
  2. Cash flow forecasting -- project expenses vs expected revenue based on pipeline
  3. Pricing analysis -- review service pricing against costs and market when requested
  4. Financial health dashboard -- maintain a monthly snapshot in `operations/reports/`
  5. Budget planning -- track spending against targets, flag overruns
  6. QuickBooks migration -- when the time comes, coordinate the transition from Sheets
- **Skills access:** GWS CLI, expense-tracker, knowledge-base
- **Key references:** `operations/financial-tracker.md`, `operations/references/pricing-structure.md`
- **Triggers:** "financial review", "how's the money", "cash flow", "burn rate", "can we afford", "budget"

### Financial Ops Agent

- **Role:** Revenue-side financial operations
- **Reports to:** CFO
- **Receives from:** Ops Agent (signed proposals/client agreements)
- **Responsibilities:**
  1. Client invoicing -- generate and send invoices via Gmail after Ops hands off a signed agreement
  2. Payment tracking -- log payments received, flag overdue invoices, send payment reminders
  3. Revenue logging -- record all incoming revenue to Google Sheets with date, client, project, amount, payment method
  4. Recurring revenue tracking -- track monthly maintenance clients, flag churn
  5. Revenue reporting -- maintain a revenue log that the CFO agent pulls from
- **Skills access:** GWS CLI, knowledge-base
- **Google Sheet:** New "Revenue" tab in existing expense tracker spreadsheet (`1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo`)
- **Revenue tab columns:** Date | Client | Project | Invoice # | Amount | Status (Sent/Paid/Overdue) | Payment Date | Payment Method | Notes
- **Invoice delivery:** Draft invoice as PDF, stage as Gmail draft for Eric to review and send
- **Handoff trigger:** Ops Agent completes a proposal and client signs -- Financial Ops picks up from there
- **Triggers:** "send invoice", "did they pay", "payment status", "revenue this month", "outstanding invoices"

### Accounting & Tax Agent

- **Role:** Expense-side financial operations and tax compliance
- **Reports to:** CFO
- **Responsibilities:**
  1. Expense tracking -- absorbs the existing expense-tracker skill. Scan Gmail for receipts, log to Google Sheets
  2. Tax categorization -- map every expense to the correct IRS Schedule C line
  3. Quarterly estimated taxes -- calculate estimated tax payments based on revenue minus deductions, remind Eric before deadlines (April 15, June 15, Sept 15, Jan 15)
  4. P&L statements -- generate monthly profit & loss by reading both the Revenue tab (Financial Ops) and Expenses tab. Accounting owns producing the P&L document; CFO reviews and references it in financial summaries
  5. Deduction optimization -- flag potential deductions Eric might be missing (home office, mileage, equipment)
  6. Year-end tax prep -- compile annual summary with totals by IRS category, flagged items for CPA review
  7. Financial tracker maintenance -- keep `operations/financial-tracker.md` current with burn rate, recurring/one-time expenses
- **Skills access:** GWS CLI, expense-tracker, knowledge-base
- **Google Sheet:** Existing expense tracker spreadsheet, Expenses tab
- **Tax deadlines (2026):** Q1 April 15, Q2 June 15, Q3 Sept 15, Q4 Jan 15 2027
- **Triggers:** "check for receipts", "log expenses", "tax prep", "what am I paying for", "P&L", "deductions", "estimated taxes"

## Data Flow

```
Ops Agent (proposal signed)
    |
    v
Financial Ops (invoicing, payment tracking, revenue log)
    |
    v
CFO (reads revenue + expenses, produces financial summaries)
    ^
    |
Accounting & Tax (expense scanning, tax categorization, P&L)
    ^
    |
Gmail receipts (automatic scanning)
```

### Key Handoffs

- **Ops -> Financial Ops:** Client signs agreement. Ops notifies Financial Ops with client name, project, pricing terms from the proposal.
- **Financial Ops -> CFO:** Revenue data lives in the Revenue tab. CFO reads it directly.
- **Accounting -> CFO:** Expense data lives in the Expenses tab. CFO reads it directly.
- **Accounting + Financial Ops -> CFO:** CFO combines both for P&L, burn rate, cash flow.

## Integration with Existing Systems

### Morning Coffee

CFO contributes a "Financial Pulse" section to the daily briefing. Data is pulled from the Google Sheets expense/revenue tabs via GWS CLI during the morning coffee run. If no revenue data exists yet, show burn rate and tax deadlines only. Skip the section entirely if no financial data has changed since last briefing.

Contents:

- Current burn rate (from Expenses tab)
- Outstanding invoices -- count and total (from Revenue tab, where Status != "Paid")
- Upcoming tax deadlines (within 30 days)
- Cash position (revenue minus expenses, only shown when revenue exists)

### Expense Tracker Skill

No changes to the skill itself. The Accounting & Tax agent becomes its primary user. The skill remains in `.claude/skills/expense-tracker/`.

### Financial Tracker Markdown

`operations/financial-tracker.md` continues to exist. Accounting & Tax agent keeps it updated. CFO reads it for summaries.

### Expense Tracker Skill Trigger Routing

The expense-tracker skill's frontmatter triggers ("check for receipts", "log expenses", etc.) overlap with the Accounting & Tax agent's triggers. To resolve: the skill is only invoked by the Accounting & Tax agent, never directly by Iris. Update the skill's frontmatter description to note: "Invoked by the Accounting & Tax agent. Do not invoke directly."

### Changes to Existing Agents

- **Iris AGENT.md:** Update delegation rules:
  - Change: "Invoicing, proposals, SOPs, project tracking: Delegate to Operations > Ops Agent"
  - To: "Proposals, SOPs, project tracking: Delegate to Operations > Ops Agent"
  - Add: "Invoicing, payment tracking, expenses, taxes, financial reporting: Delegate to Finance > CFO Agent"
  - Rename all "Revenue" department references to "Sales"
- **Ops AGENT.md:** Remove invoicing from responsibilities (line 23). Keep proposals. Add handoff note: "Once a client signs, hand off to Finance > Financial Ops for invoicing and payment tracking." Update "Receives from" (line 13) to: "Iris (admin tasks), Onboarding Agent (proposals)" -- remove "/invoicing".
- **CLAUDE.md:** Update agent hierarchy section to reflect Sales rename and new Finance department.

## Google Sheets Structure

Single spreadsheet (`1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo`) with tabs:

| Tab | Owner | Purpose |
|---|---|---|
| Expenses | Accounting & Tax | Receipt/expense logging with IRS categories |
| Revenue | Financial Ops | Invoice and payment tracking |
| Summary | CFO | Monthly P&L snapshot -- written by CFO agent during monthly review via GWS CLI, not formula-driven |

## Future: QuickBooks Online Migration

Deferred until revenue justifies $19/mo. When adopted:

- **Product:** QuickBooks Online Simple Start (upgradeable to Essentials/Plus for employees)
- **Accounting agent:** Switches from Sheets to QBO API for expense logging
- **Financial Ops agent:** Switches invoice generation to QBO
- **Google Sheets:** Becomes read-only mirror or retired
- **Trigger to adopt:** First paying client or monthly revenue exceeding $500

Documented in CFO AGENT.md as a deferred initiative.

## Files to Create

1. `.claude/agents/finance/cfo/AGENT.md`
2. `.claude/agents/finance/cfo/tasks/.gitkeep`
3. `.claude/agents/finance/financial-ops/AGENT.md`
4. `.claude/agents/finance/financial-ops/tasks/.gitkeep`
5. `.claude/agents/finance/accounting/AGENT.md`
6. `.claude/agents/finance/accounting/tasks/.gitkeep`

## Files to Modify

1. `.claude/agents/iris/AGENT.md` -- add Finance delegation, rename Revenue to Sales, update delegation rules per spec
2. `.claude/agents/operations/ops/AGENT.md` -- remove invoicing from responsibilities, update "Receives from" line, add handoff note
3. `CLAUDE.md` -- update agent hierarchy, rename Revenue to Sales, add Finance department
4. `iris/context/team.md` -- update agent team list
5. `.claude/skills/expense-tracker/SKILL.md` -- update frontmatter to note skill is invoked by Accounting & Tax agent only
6. `.claude/skills/morning-coffee/SKILL.md` -- add Financial Pulse section sourced from CFO agent

## Files to Move

1. `.claude/agents/revenue/` -> `.claude/agents/sales/` (rename directory, contents unchanged)
