# Client Agreement Template Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a standard client agreement template for OphidianAI web development projects.

**Architecture:** Markdown template with placeholder variables, matching existing template patterns in `operations/templates/`. No code or tests -- this is a documentation/template task.

**Tech Stack:** Markdown, Dropbox Sign (for delivery)

---

### Task 1: Write the Client Agreement Template

**Files:**
- Create: `operations/templates/client-agreement.md`

**Step 1: Write the complete agreement template**

Create `operations/templates/client-agreement.md` with all 10 sections from the design doc:

1. Scope of Work -- project description, deliverables, revision rounds, exclusions
2. Timeline -- estimated delivery, 5 business day client feedback window
3. Payment Terms -- 50/50 or 33/33/33 options, Net 15, 1.5%/mo late fee, work pause at 15 days overdue
4. Intellectual Property -- split ownership model (client owns content + assembled site, developer owns code/components, mutual licensing)
5. Attribution -- "Built by OphidianAI" default, $500 removal fee, portfolio rights
6. Monthly Maintenance -- services included, 30-day cancellation notice
7. Termination -- 14 days notice, proportional billing, non-refundable deposit
8. Liability & Warranty -- 30-day warranty, third-party exclusion, liability cap
9. Confidentiality -- mutual NDA, portfolio exception
10. Governing Law -- Indiana, mediation before litigation

Use `{{PLACEHOLDER}}` variables matching the design doc:
- `{{CLIENT_NAME}}`, `{{CLIENT_BUSINESS}}`, `{{CLIENT_EMAIL}}`
- `{{PROJECT_DESCRIPTION}}`, `{{DELIVERABLES}}`
- `{{TOTAL_FEE}}`, `{{PAYMENT_SCHEDULE}}`
- `{{ESTIMATED_DELIVERY}}`, `{{MAINTENANCE_FEE}}`
- `{{EFFECTIVE_DATE}}`

**Step 2: Verify template**

Read the file back and confirm all 10 sections are present, all placeholders are consistent, and the language is professional but accessible for small business clients.

**Step 3: Commit**

```bash
git add operations/templates/client-agreement.md
git commit -m "Add standard client agreement template with IP, attribution, and payment terms"
```

---

### Task 2: Update Pricing Structure with Attribution Fee

**Files:**
- Modify: `operations/references/pricing-structure.md` (Add-Ons table, around line 109-118)

**Step 1: Add attribution removal to the Add-Ons table**

Add this row to the existing Add-Ons table in `operations/references/pricing-structure.md`:

```
| Attribution removal ("Built by OphidianAI")   | $500 (one-time) |
```

**Step 2: Commit**

```bash
git add operations/references/pricing-structure.md
git commit -m "Add attribution removal fee to pricing add-ons"
```

---

### Task 3: Update Client Handoff Template

**Files:**
- Modify: `operations/templates/client-handoff.md`

**Step 1: Add agreement reference**

Add a section near the top of `client-handoff.md` (after "Your Website") referencing the signed agreement:

```markdown
## Agreement

Your signed service agreement is on file and covers project scope, intellectual property, attribution, and maintenance terms. Contact eric.lefler@ophidianai.com for a copy.
```

**Step 2: Commit**

```bash
git add operations/templates/client-handoff.md
git commit -m "Add agreement reference to client handoff template"
```

---

### Task 4: Log Decision

**Files:**
- Modify: `operations/decisions/log.md`

**Step 1: Append decision entry**

Add to the end of `operations/decisions/log.md`:

```
[2026-03-07] DECISION: Adopt standard client agreement with split IP ownership, default OphidianAI attribution ($500 opt-out), 50/50 payment for Starter/Professional and 33/33/33 for E-Commerce, delivered via Dropbox Sign ($15/mo) | REASONING: Protects IP, establishes attribution rights contractually, aligns payment terms with industry standards, professional e-signature at lowest viable cost. | CONTEXT: Design doc at docs/plans/2026-03-07-client-agreement-design.md
```

**Step 2: Commit**

```bash
git add operations/decisions/log.md
git commit -m "Log client agreement and attribution policy decision"
```
