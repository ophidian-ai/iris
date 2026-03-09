# Engineering Department Design

**Date:** 2026-03-09
**Status:** Approved

## Mission

Engineering is the build shop. It owns client delivery -- building, deploying, and maintaining websites and products for clients.

## Folder Structure

```
engineering/
  projects/        # Active client builds (submodules)
  tools/           # Build scripts, generators, automation
  references/      # Design patterns, code standards, tech stack docs
  templates/       # Project scaffolds, starter configs, boilerplate
  specs/           # Technical specs and architecture docs per project
```

## File Moves

| Item | From | To |
|---|---|---|
| Bloomin' Acres (submodule) | `revenue/projects/active/bloomin-acres/` | `engineering/projects/bloomin-acres/` |
| OphidianAI site (submodule) | `revenue/projects/active/ophidian-ai/` | `engineering/projects/ophidian-ai/` |
| `generate-report-pdf.mjs` | `operations/tools/` | `engineering/tools/` |
| `animation-patterns.md` | `operations/references/design/` | `engineering/references/` |
| `ecommerce-patterns.md` | `operations/references/design/` | `engineering/references/` |

## What Stays in Operations

All SOPs stay in `operations/references/sops/`. Engineering references them there -- shared ownership, no duplication.

## Reference Updates Required

- `.gitmodules` -- update submodule paths
- `.claude/agents/engineering/dev/AGENT.md` -- reference new engineering paths
- `CLAUDE.md` -- update project structure section and project paths
- Memory file (`MEMORY.md`) -- update submodule path references
- Any agent/skill referencing `revenue/projects/active/`

## Boundary Clarification

- **Engineering** owns: project builds, dev tools, technical references, design patterns, specs
- **Operations** owns: SOPs, invoicing, proposals, project tracking, decision logging, file maintenance
- **Revenue** owns: lead generation, prospect pipeline, outreach -- no longer holds projects
- **Skills** stay in `.claude/skills/` (cross-department, not Engineering-specific)
- **Agent definitions** stay in `.claude/agents/engineering/` (part of the agent hierarchy, not the department folder)

## Cleanup

- Remove `revenue/projects/` after moves (or archive if needed)
- Remove `operations/tools/` after move
- Remove `operations/references/design/` after move
