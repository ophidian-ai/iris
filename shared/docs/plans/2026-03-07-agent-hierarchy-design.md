# Agent Hierarchy Reorganization -- Design

**Date:** 2026-03-07
**Status:** Approved

## Overview

Reorganize OphidianAI's agent and skill structure from a flat folder layout into an industry-standard employee hierarchy. Each agent gets dedicated workspace folders for tasks and work products. Skills remain in a shared library accessible to all agents.

## Org Chart

```
Eric Lefler -- CEO / Founder
└── Iris -- Chief of Staff
    │
    ├── Revenue Department
    │   ├── Sales Agent ........... lead gen, cold outreach, pipeline, follow-ups
    │   ├── Onboarding Agent ..... prospect lifecycle (research through handoff)
    │   └── Research Agent ....... market intel, competitive analysis, tool scouting
    │
    ├── Marketing Department
    │   └── Content Agent ........ social media, blog, website copy, case studies
    │
    ├── Engineering Department
    │   └── Dev Agent ............ client builds, deployments, architecture, code quality
    │
    └── Operations Department
        └── Ops Agent ............ project tracking, invoicing, proposals, SOPs, scheduling
```

## Iris (Chief of Staff)

Owns: daily briefings (morning coffee), email triage, calendar management, task coordination, agent delegation. Has access to all skills and all agents. Dispatches work to the appropriate department.

## File Structure

### Before (current)

```
.claude/skills/
  agents/
    agent-sales/SKILL.md
    agent-dev/SKILL.md
    agent-ops/SKILL.md
    agent-content/SKILL.md
    agent-research/SKILL.md
    agent-onboarding/SKILL.md
  business-research/
  clickup/
  cold-email-outreach/
  email-response/
  follow-up-email/
  gmail/
  google-calendar/
  morning-coffee/
  proposal-generator/
  website-copywriting/
```

### After (proposed)

```
.claude/
  skills/                          -- SHARED SKILL LIBRARY (all agents access)
    business-research/SKILL.md
    clickup/SKILL.md
    cold-email-outreach/SKILL.md
    email-response/SKILL.md
    follow-up-email/SKILL.md
    gmail/SKILL.md
    google-calendar/SKILL.md
    morning-coffee/SKILL.md
    proposal-generator/SKILL.md
    website-copywriting/SKILL.md

  agents/                          -- AGENT HIERARCHY
    iris/                          -- Chief of Staff
      AGENT.md                     -- Role definition, permissions, owned skills
      tasks/                       -- Iris-specific work (briefings, email triage, scheduling)

    revenue/                       -- Revenue Department
      sales/
        AGENT.md                   -- Role definition, skills access, delegation rules
        tasks/                     -- Active sales tasks, outreach drafts, pipeline work
      onboarding/
        AGENT.md
        tasks/                     -- Prospect lifecycle tracking, phase checklists
      research/
        AGENT.md
        tasks/                     -- Research assignments, intel reports

    marketing/                     -- Marketing Department
      content/
        AGENT.md
        tasks/                     -- Content calendar, drafts, published pieces

    engineering/                   -- Engineering Department
      dev/
        AGENT.md
        tasks/                     -- Build tasks, technical specs, deployment notes

    operations/                    -- Operations Department
      ops/
        AGENT.md
        tasks/                     -- Project status, invoices, proposals, SOP drafts
```

## AGENT.md Structure

Each agent file includes:

- **Role** -- What this agent does
- **Department** -- Where it sits in the hierarchy
- **Reports to** -- Who manages this agent (Iris for all, currently)
- **Skills access** -- Which shared skills this agent can use
- **Delegates to** -- Which other agents it can hand off work to
- **Receives from** -- Which agents send it work
- **Task folder** -- Path to its active task directory
- **Output standards** -- Quality and format requirements

## Cross-Agent Communication

Any agent can delegate to any other agent. Key delegation patterns:

- **Onboarding > Sales:** Cold outreach, follow-ups
- **Onboarding > Dev:** Website builds
- **Onboarding > Ops:** Proposals, invoicing
- **Onboarding > Content:** Website copy
- **Sales > Research:** Market intel, lead source analysis
- **Iris > Any:** Task assignment, coordination

## Migration Notes

- Skills stay in `.claude/skills/` (no move needed)
- Agent SKILL.md files become AGENT.md files in new locations
- Existing agent content is preserved, just restructured with new metadata
- CLAUDE.md updated to reference new paths
- Old `.claude/skills/agents/` directory removed after migration

## What Does NOT Change

- Shared skills library location (`.claude/skills/`)
- Lead generation data (`lead-generation/`)
- Project files (`projects/`)
- References, templates, reports, archives
- Morning coffee skill stays in shared skills (Iris uses it, but it's a skill not a task)
