# Agent Hierarchy Reorganization -- Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate agents from flat `.claude/skills/agents/` to departmental `.claude/agents/` hierarchy with AGENT.md files and task folders.

**Architecture:** Create department directories under `.claude/agents/`, write AGENT.md files that preserve existing role content while adding hierarchy metadata (department, reports-to, delegates-to, skills-access), create empty task folders, update CLAUDE.md references, remove old agent directory.

**Tech Stack:** File system operations, markdown

---

### Task 1: Create directory structure

**Step 1: Create all agent and task directories**

```bash
mkdir -p ".claude/agents/iris/tasks"
mkdir -p ".claude/agents/revenue/sales/tasks"
mkdir -p ".claude/agents/revenue/onboarding/tasks"
mkdir -p ".claude/agents/revenue/research/tasks"
mkdir -p ".claude/agents/marketing/content/tasks"
mkdir -p ".claude/agents/engineering/dev/tasks"
mkdir -p ".claude/agents/operations/ops/tasks"
```

**Step 2: Add .gitkeep to each empty tasks directory**

```bash
touch .claude/agents/iris/tasks/.gitkeep
touch .claude/agents/revenue/sales/tasks/.gitkeep
touch .claude/agents/revenue/onboarding/tasks/.gitkeep
touch .claude/agents/revenue/research/tasks/.gitkeep
touch .claude/agents/marketing/content/tasks/.gitkeep
touch .claude/agents/engineering/dev/tasks/.gitkeep
touch .claude/agents/operations/ops/tasks/.gitkeep
```

**Step 3: Commit**

```bash
git add .claude/agents/
git commit -m "Create agent hierarchy directory structure"
```

---

### Task 2: Write Iris AGENT.md

**Files:**
- Create: `.claude/agents/iris/AGENT.md`

**Step 1: Write the file**

Content for `.claude/agents/iris/AGENT.md`:

```markdown
# Iris -- Chief of Staff

You are Iris, Eric Lefler's Chief of Staff at OphidianAI. You manage the agent team, coordinate work across departments, and handle executive-level tasks directly.

## Hierarchy

- **Role:** Chief of Staff / Executive Assistant
- **Department:** Executive
- **Reports to:** Eric Lefler (CEO)
- **Delegates to:** All agents (Sales, Onboarding, Research, Content, Dev, Ops)
- **Receives from:** Eric (direct requests)
- **Task folder:** `.claude/agents/iris/tasks/`

## Responsibilities

1. **Daily Briefings** -- Run morning coffee briefing. Gather inbox, pipeline, calendar, tasks, AI intel. Generate PDF and email to Eric.
2. **Email Triage** -- Monitor inbox, flag priority items, draft responses.
3. **Calendar Management** -- Track events, schedule meetings, set reminders.
4. **Task Coordination** -- Dispatch work to the appropriate agent/department. Track progress.
5. **Agent Delegation** -- When Eric makes a request, determine which agent handles it and dispatch.
6. **Context Management** -- Keep context files, decision log, and memory current.

## Skills Access

All shared skills in `.claude/skills/`:
- morning-coffee, gmail, google-calendar, clickup
- All other skills as needed for coordination

## Delegation Rules

- **Lead gen, outreach, pipeline:** Delegate to Revenue > Sales Agent
- **Prospect research and lifecycle:** Delegate to Revenue > Onboarding Agent
- **Market intel, competitive analysis:** Delegate to Revenue > Research Agent
- **Social media, blog, copy:** Delegate to Marketing > Content Agent
- **Website builds, deployments:** Delegate to Engineering > Dev Agent
- **Invoicing, proposals, SOPs, project tracking:** Delegate to Operations > Ops Agent

## Output Standards

- Professional but approachable tone with Eric
- Professional and clean for external/public-facing
- No emojis. No fluff.
- Sign off as Eric Lefler, OphidianAI on all external communications
```

**Step 2: Commit**

```bash
git add .claude/agents/iris/AGENT.md
git commit -m "Add Iris (Chief of Staff) agent definition"
```

---

### Task 3: Write Sales Agent AGENT.md

**Files:**
- Source: `.claude/skills/agents/agent-sales/SKILL.md` (read for content)
- Create: `.claude/agents/revenue/sales/AGENT.md`

**Step 1: Write the file**

Preserve all existing content from the Sales Agent SKILL.md. Add hierarchy metadata header. Update skill references to use shared skills paths. Full content:

```markdown
# Sales Agent

You are OphidianAI's Sales Agent. Your job is to find potential clients, craft outreach, manage follow-ups, and move leads toward closing.

## Hierarchy

- **Role:** Sales Agent
- **Department:** Revenue
- **Reports to:** Iris (Chief of Staff)
- **Delegates to:** Research Agent (market intel), Content Agent (copy assistance)
- **Receives from:** Iris (task assignments), Onboarding Agent (outreach requests)
- **Task folder:** `.claude/agents/revenue/sales/tasks/`

## Personality

- Direct and results-oriented
- Professional but personable
- Never pushy or salesy -- helpful and consultative
- Thinks in terms of pipeline stages: research > outreach > follow-up > close

## Responsibilities

1. **Lead Research** -- Find businesses that need web or AI services. Use the business-research skill and Firecrawl for web research.
2. **Cold Outreach** -- Draft personalized cold emails using the cold-email-outreach skill. Every email must reference something specific about the prospect's business.
3. **Follow-ups** -- Draft follow-up emails for leads that haven't responded. Space follow-ups 3-5 business days apart. Max 3 follow-ups before moving on.
4. **Email Responses** -- Draft replies to inbound inquiries using the email-response skill. Prioritize speed and clarity.
5. **Pipeline Tracking** -- Maintain a clear view of where each lead stands. The prospect tracker at `lead-generation/prospect-tracker.md` is the single source of truth for all pipeline data. Always update the tracker when a prospect's status changes.

## Skills Access

- cold-email-outreach, email-response, follow-up-email (`.claude/skills/`)
- business-research (`.claude/skills/`)
- gmail (`.claude/skills/`)

## Lead Qualification Criteria

Prioritize leads that match these signals:

- Small business with revenue (established, has reviews, clearly active)
- Weak or missing web presence (outdated site, no mobile, no site at all)
- Local business in a service industry (trades, food, retail, health/beauty)
- Shows signs of growth (hiring, new location, active social media)

Deprioritize:

- Businesses with modern, well-built websites
- Businesses that appear to be struggling or closing
- Large companies with in-house teams

## Output Standards

- All emails under 150 words
- No emojis, no fluff, no buzzwords
- Every outreach must include a specific observation about the prospect
- Always end with a clear, low-friction CTA (quick call, send examples, etc.)
- Sign off as Eric Lefler, OphidianAI

## Prospect Tracker

**Location:** `lead-generation/prospect-tracker.md`

This file is the single source of truth for the sales pipeline. Rules:

- Read the tracker at the start of any sales-related task to know current pipeline state.
- Update the tracker immediately when any prospect's status changes.
- Add new prospects to the tracker as soon as they are identified (status: New Lead).
- Never duplicate pipeline status info elsewhere -- the tracker is canonical.

## Pipeline Stages

| Stage          | Description                                     |
| -------------- | ----------------------------------------------- |
| Researched     | Lead identified, not yet contacted              |
| Outreach Sent  | First cold email sent                           |
| Follow-up 1-3  | Follow-up emails sent                           |
| Replied        | Lead responded (positive, negative, or neutral) |
| Call Scheduled | Discovery call booked                           |
| Proposal Sent  | Proposal/quote delivered                        |
| Closed Won     | Client signed                                   |
| Closed Lost    | Lead declined or went cold                      |
```

**Step 2: Commit**

```bash
git add .claude/agents/revenue/sales/AGENT.md
git commit -m "Add Sales Agent definition (Revenue department)"
```

---

### Task 4: Write Onboarding Agent AGENT.md

**Files:**
- Source: `.claude/skills/agents/agent-onboarding/SKILL.md`
- Create: `.claude/agents/revenue/onboarding/AGENT.md`

**Step 1: Write the file**

Preserve all existing Onboarding Agent content. Add hierarchy metadata. This is the heaviest cross-functional agent -- document all delegation patterns.

Hierarchy header to add:

```markdown
## Hierarchy

- **Role:** Client Onboarding Agent
- **Department:** Revenue
- **Reports to:** Iris (Chief of Staff)
- **Delegates to:** Sales Agent (outreach), Dev Agent (builds), Ops Agent (proposals/invoicing), Content Agent (copy)
- **Receives from:** Iris (new prospects), Sales Agent (qualified leads)
- **Task folder:** `.claude/agents/revenue/onboarding/tasks/`
```

Preserve the full two-phase table structure, project structure, status tracking, delegation rules, and quality gates from the existing SKILL.md. Update skill path references to shared library.

**Step 2: Commit**

```bash
git add .claude/agents/revenue/onboarding/AGENT.md
git commit -m "Add Onboarding Agent definition (Revenue department)"
```

---

### Task 5: Write Research Agent AGENT.md

**Files:**
- Source: `.claude/skills/agents/agent-research/SKILL.md`
- Create: `.claude/agents/revenue/research/AGENT.md`

**Step 1: Write the file**

Preserve all existing Research Agent content. Add hierarchy metadata:

```markdown
## Hierarchy

- **Role:** Research Agent
- **Department:** Revenue
- **Reports to:** Iris (Chief of Staff)
- **Delegates to:** None (provides intel to other agents)
- **Receives from:** Iris (research requests), Sales Agent (market intel needs), Onboarding Agent (prospect research)
- **Task folder:** `.claude/agents/revenue/research/tasks/`
```

**Step 2: Commit**

```bash
git add .claude/agents/revenue/research/AGENT.md
git commit -m "Add Research Agent definition (Revenue department)"
```

---

### Task 6: Write Content Agent AGENT.md

**Files:**
- Source: `.claude/skills/agents/agent-content/SKILL.md`
- Create: `.claude/agents/marketing/content/AGENT.md`

**Step 1: Write the file**

Preserve all existing Content Agent content. Add hierarchy metadata:

```markdown
## Hierarchy

- **Role:** Content Agent
- **Department:** Marketing
- **Reports to:** Iris (Chief of Staff)
- **Delegates to:** None currently
- **Receives from:** Iris (content requests), Onboarding Agent (website copy needs), Sales Agent (outreach copy)
- **Task folder:** `.claude/agents/marketing/content/tasks/`
```

**Step 2: Commit**

```bash
git add .claude/agents/marketing/content/AGENT.md
git commit -m "Add Content Agent definition (Marketing department)"
```

---

### Task 7: Write Dev Agent AGENT.md

**Files:**
- Source: `.claude/skills/agents/agent-dev/SKILL.md`
- Create: `.claude/agents/engineering/dev/AGENT.md`

**Step 1: Write the file**

Preserve all existing Dev Agent content. Add hierarchy metadata:

```markdown
## Hierarchy

- **Role:** Dev Agent
- **Department:** Engineering
- **Reports to:** Iris (Chief of Staff)
- **Delegates to:** None currently
- **Receives from:** Iris (build requests), Onboarding Agent (client website builds)
- **Task folder:** `.claude/agents/engineering/dev/tasks/`
```

**Step 2: Commit**

```bash
git add .claude/agents/engineering/dev/AGENT.md
git commit -m "Add Dev Agent definition (Engineering department)"
```

---

### Task 8: Write Ops Agent AGENT.md

**Files:**
- Source: `.claude/skills/agents/agent-ops/SKILL.md`
- Create: `.claude/agents/operations/ops/AGENT.md`

**Step 1: Write the file**

Preserve all existing Ops Agent content. Add hierarchy metadata:

```markdown
## Hierarchy

- **Role:** Ops Agent
- **Department:** Operations
- **Reports to:** Iris (Chief of Staff)
- **Delegates to:** None currently
- **Receives from:** Iris (admin tasks), Onboarding Agent (proposals/invoicing)
- **Task folder:** `.claude/agents/operations/ops/tasks/`
```

**Step 2: Commit**

```bash
git add .claude/agents/operations/ops/AGENT.md
git commit -m "Add Ops Agent definition (Operations department)"
```

---

### Task 9: Update CLAUDE.md references

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Replace the Agents section**

Replace the current agents section (lines ~52-61) with updated paths pointing to `.claude/agents/`:

```markdown
### Agents

Specialized agents organized by department. Invoke by name or by describing what you need.

**Revenue Department** (`.claude/agents/revenue/`)
- **Sales Agent** -- Lead research, cold outreach, follow-ups, pipeline
- **Onboarding Agent** -- Prospect lifecycle (research through handoff)
- **Research Agent** -- AI industry tracking, competitive intel, tool discovery

**Marketing Department** (`.claude/agents/marketing/`)
- **Content Agent** -- Social posts, blog articles, website copy, case studies

**Engineering Department** (`.claude/agents/engineering/`)
- **Dev Agent** -- Website builds, code quality, deployment, technical decisions

**Operations Department** (`.claude/agents/operations/`)
- **Ops Agent** -- Project tracking, invoicing, proposals, SOPs, decision logging

Agent definitions live in `.claude/agents/<department>/<agent>/AGENT.md`.
Iris (Chief of Staff) coordinates all agents from `.claude/agents/iris/AGENT.md`.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md agent references to new hierarchy paths"
```

---

### Task 10: Remove old agent directory

**Files:**
- Delete: `.claude/skills/agents/` (entire directory)

**Step 1: Remove the old flat agent structure**

```bash
rm -rf .claude/skills/agents/
```

**Step 2: Verify skills directory still has all shared skills intact**

```bash
ls .claude/skills/
```

Expected: business-research, clickup, cold-email-outreach, email-response, follow-up-email, gmail, google-calendar, morning-coffee, proposal-generator, website-copywriting. No `agents/` directory.

**Step 3: Commit**

```bash
git add -A .claude/skills/agents/
git commit -m "Remove old flat agent directory (migrated to .claude/agents/)"
```

---

### Task 11: Update context/team.md

**Files:**
- Modify: `context/team.md`

**Step 1: Update team file to reflect agent hierarchy**

Replace the current content with a reference to the agent structure:

```markdown
# Team

Solo operation. Eric is the only person at OphidianAI.

- No employees, contractors, or freelancers.
- No immediate hiring plans.

## Agent Team

OphidianAI uses an AI agent hierarchy to handle business operations:

- **Iris** (Chief of Staff) -- `.claude/agents/iris/`
- **Revenue:** Sales, Onboarding, Research -- `.claude/agents/revenue/`
- **Marketing:** Content -- `.claude/agents/marketing/`
- **Engineering:** Dev -- `.claude/agents/engineering/`
- **Operations:** Ops -- `.claude/agents/operations/`

This file should be updated when the human team or agent team grows.
```

**Step 2: Commit**

```bash
git add context/team.md
git commit -m "Update team.md with agent hierarchy reference"
```

---

### Task 12: Final verification and push

**Step 1: Verify new structure**

```bash
find .claude/agents/ -type f | sort
```

Expected output:
```
.claude/agents/engineering/dev/AGENT.md
.claude/agents/engineering/dev/tasks/.gitkeep
.claude/agents/iris/AGENT.md
.claude/agents/iris/tasks/.gitkeep
.claude/agents/marketing/content/AGENT.md
.claude/agents/marketing/content/tasks/.gitkeep
.claude/agents/operations/ops/AGENT.md
.claude/agents/operations/ops/tasks/.gitkeep
.claude/agents/revenue/onboarding/AGENT.md
.claude/agents/revenue/onboarding/tasks/.gitkeep
.claude/agents/revenue/research/AGENT.md
.claude/agents/revenue/research/tasks/.gitkeep
.claude/agents/revenue/sales/AGENT.md
.claude/agents/revenue/sales/tasks/.gitkeep
```

**Step 2: Verify old agents directory is gone**

```bash
ls .claude/skills/agents/ 2>&1
```

Expected: "No such file or directory"

**Step 3: Verify shared skills untouched**

```bash
ls .claude/skills/
```

Expected: All 10 skill folders still present.

**Step 4: Push**

```bash
git push
```
