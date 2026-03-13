---
name: post-build-harvest
description: Extract reusable design patterns and techniques from a completed website project back into the pattern library. Use after finishing a website build or when Eric says "harvest patterns from [project]".
---

# Post-Build Harvest

Extract new creative techniques from a completed project and add them to the design system pattern library at `engineering/design-system/`.

## Trigger

- Suggested automatically after web-builder Phase 6 (QA & Deploy) -- invoked as Phase 6.5
- Manual: "harvest patterns from [project]"

## Inputs

- The completed project's source files (CSS, TSX, JS)
- `docs/creative-brief.md` (if it exists) -- to compare planned vs built
- `engineering/design-system/_catalog.md` -- current pattern inventory

## Process

### 1. Scan the Project

Search the project's source files for creative techniques:

**CSS patterns to look for:**
- `@keyframes` definitions (custom animations)
- `backdrop-filter` usage (glass effects)
- Complex `background` or `background-image` (gradients, textures)
- `mix-blend-mode` usage (color treatments)
- CSS custom properties with design tokens
- `::before` / `::after` pseudo-elements for decorative effects
- `mask` or `clip-path` usage
- Complex `box-shadow` (tinted, layered, glow)
- `transform` animations and transitions

**JS/TSX patterns to look for:**
- Animation library imports (motion, gsap, etc.)
- `IntersectionObserver` usage
- Mouse/pointer event listeners for interactive effects
- Custom hooks for scroll or viewport tracking
- Canvas or WebGL usage
- Dynamic style manipulation

### 2. Compare Planned vs Built

If `docs/creative-brief.md` exists:
- Check which planned techniques were actually implemented
- Note any techniques that were added during the build but not in the brief
- Note any planned techniques that were dropped (and why, if apparent)

### 3. Diff Against Catalog

Read `engineering/design-system/_catalog.md` and identify:
- **New techniques:** In the project but NOT in the catalog
- **Existing techniques with new variants:** In the catalog but implemented differently here

### 4. Evaluate for Library Inclusion

For each new technique, check against minimum criteria:

- **Shipped project?** Used in at least one shipped project (not just a prototype)
- **Brand-agnostic?** Can be decoupled from this client's specific design
- **Reuse potential?** Applies to more than one industry or mood

Techniques that fail these criteria go in the "Not Extracted" section of the report.

### 5. Create Pattern Docs

For each new technique that passes the quality gate:

1. Create a pattern reference doc at `engineering/design-system/patterns/[category]/[name].md`
   - Follow the schema in `engineering/design-system/README.md`
   - Include actual code snippets from the project
   - Make descriptions brand-agnostic

2. If the code is reusable, extract a brand-agnostic starter:
   - Copy to `engineering/design-system/starters/[category]/[name].[ext]`
   - Replace brand colors/fonts with CSS custom properties or props
   - Add comment block: pattern name, what to customize, reference doc path

3. Add a row to `engineering/design-system/_catalog.md`

### 6. Update Existing Patterns

For techniques already in the catalog but with new variants:
- Update the pattern doc's "Customization" section with the new variant
- Add the project name to the `source-project` field (comma-separated)

### 7. Quality Gate -- Eric Confirms

**Do NOT commit new patterns without Eric's approval.**

Present the harvest report and ask: "Add these to the library?"

Eric reviews and either approves all, selects specific patterns, or rejects.

## Output

Write `docs/harvest-report.md` in the project root:

```markdown
# Harvest Report -- [Client Name]

**Date:** [today's date]
**Project:** [project path]

## New Patterns Added
| Pattern | Category | File Created |
| --- | --- | --- |
| [name] | [category] | `patterns/[cat]/[file].md` |

## Existing Patterns Updated
| Pattern | What Changed |
| --- | --- |
| [name] | Added [project] variant to customization notes |

## Starters Created
| Starter | File |
| --- | --- |
| [name] | `starters/[cat]/[file].ext` |

## Techniques Not Extracted (and why)
| Technique | Reason |
| --- | --- |
| [name] | Too project-specific / one-off / not reusable |

## Brief Comparison (if creative-brief.md existed)
- **Planned and built:** [list]
- **Added during build:** [list]
- **Planned but dropped:** [list]
```

## Notes

- The pattern library grows with every project. This is the mechanism.
- Be conservative. A smaller library of high-quality, truly reusable patterns is better than a bloated collection.
- Update `last-validated` dates on any existing patterns that were used in this build (confirms they still work).
