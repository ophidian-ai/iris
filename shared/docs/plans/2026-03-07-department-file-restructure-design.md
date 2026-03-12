# Department File Restructure -- Design

**Date:** 2026-03-07
**Status:** Approved

## Overview

Reorganize the Iris project's root-level folders into a department-based structure that mirrors the agent hierarchy. Business data moves under department folders at the project root. Agent definitions and skills stay in `.claude/`.

## Motivation

Root-level folders are scattered with no clear ownership. `lead-generation/`, `projects/`, `templates/`, `references/`, `decisions/`, `context/`, `reports/` all sit at the same level with no organizational principle. Now that agents are organized by department, the data they work with should follow the same structure.

## Design Principles

- **Department folders at root** -- not inside `.claude/` (which is framework config, not business data)
- **Shared resources get a `shared/` folder** -- cross-department assets, archives, and docs
- **Agent definitions stay in `.claude/agents/`** -- separation of config from data
- **Tool/config dotfolders stay put** -- `.firecrawl/`, `.playwright-mcp/`, `.vscode/`, etc.

## Target Structure

```
iris/                           -- Chief of Staff (Iris)
  context/                      -- me.md, work.md, team.md, goals.md, current-priorities.md
  saved-conversations/          -- session summaries
  reports/                      -- briefings/

revenue/                        -- Revenue Department
  lead-generation/              -- prospect-tracker.md, lead-sources.md
    prospects/                  -- individual prospect folders
  projects/                     -- client project folders
    active/                     -- bloomin-acres, etc.
    completed/

marketing/                      -- Marketing Department
  content/                      -- social posts, blog drafts, newsletters, case studies

engineering/                    -- Engineering Department
  (empty for now)

operations/                     -- Operations Department
  decisions/                    -- log.md
  references/                   -- sops/, examples/, design/
  templates/                    -- client-project/, session-summary, point-of-contact, etc.
  reports/                      -- sales-analytics-proposal, etc.

shared/                         -- Cross-department resources
  brand-assets/                 -- logos, colors, brand guidelines
  archives/                     -- completed/outdated material from any department
  docs/                         -- plans/, design docs

.claude/                        -- Framework config (unchanged)
  agents/                       -- AGENT.md + tasks/ only
  skills/                       -- shared skill library
  rules/                        -- business context, communication style
```

## File Moves

| Current Location | New Location |
|---|---|
| `context/` | `iris/context/` |
| `saved-conversations/` | `iris/saved-conversations/` |
| `reports/briefings/` | `iris/reports/briefings/` |
| `lead-generation/` | `sales/lead-generation/` |
| `projects/active-projects/` | `revenue/projects/active/` |
| `marketing/` | `marketing/content/` |
| `decisions/` | `operations/decisions/` |
| `references/sops/` | `operations/references/sops/` |
| `references/examples/` | `operations/references/examples/` |
| `references/design/` | `operations/references/design/` |
| `references/reports/` | `operations/reports/` |
| `templates/` | `operations/templates/` |
| `references/brand-assets/` | `shared/brand-assets/` |
| `archives/` | `shared/archives/` |
| `docs/` | `shared/docs/` |
| `screenshots/` | `shared/archives/screenshots/` |

## What Does NOT Move

- `.claude/` (agents, skills, rules)
- `.firecrawl/`, `.playwright-mcp/`, `.vscode/`
- Root config files (CLAUDE.md, CLAUDE.local.md, .env, .gitignore, etc.)

## Post-Move Updates Required

- CLAUDE.md -- all path references
- All AGENT.md files -- path references to data folders
- Memory file -- path references
- Any skill files that reference moved paths
- Context file references in CLAUDE.md (@context/me.md, etc.)
