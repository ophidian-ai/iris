---
tags:
  - memory
  - tool
triggers:
  - build website
  - new site
  - client site
  - web builder
  - section library
  - scaffold
created: 2026-03-10
updated: 2026-03-13
---

# Web Builder Skill

- Lives at `.claude/skills/web-builder/SKILL.md`
- 8-phase pipeline: Discovery, Creative Research & Brief (1.5), Scaffold, Design System, Page Building, Integration, QA & Deploy, Post-Build Harvest (6.5)
- Includes sub-agent dispatch annotations for parallel builds
- Section library approach: pages composed from reusable section components

## Design Intelligence Layer (added 2026-03-13)

- Pattern library at `engineering/design-system/` with ~30 reference docs and ~10 starter components
- 9 categories: animations, backgrounds, hover-effects, glass-effects, layouts, typography, dividers, scroll-effects, color-treatments
- `_catalog.md` is the flat index for fast AI pattern matching
- Phase 1.5 (Creative Research) runs after Discovery: Firecrawl trend research + pattern library matching
- Creative brief generated per project at `docs/creative-brief.md` -- guides all visual decisions
- Tiered autonomy: auto-approve for familiar industries, require Eric's approval for new territory
- Post-build harvest extracts new patterns after each project
- Two new skills: `.claude/skills/creative-research/SKILL.md`, `.claude/skills/post-build-harvest/SKILL.md`
- Spec: `docs/superpowers/specs/2026-03-13-design-intelligence-layer-design.md`

## Related

- `projects/ophidianai-website.md`
- `projects/bloomin-acres.md`
- `operations/launch-and-maintenance.md`
