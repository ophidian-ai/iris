# Design Intelligence Layer — Specification

## Context

OphidianAI's web-builder skill handles the mechanical build pipeline (scaffold, components, deploy) but produces generic visual output without manual creative guidance. Eric currently hand-writes `build-plan.md` files with specific code snippets for custom animations, backgrounds, layouts, and interactions. Three completed projects (Bloomin' Acres, Point of Hope Church, OphidianAI website) contain reusable creative techniques that are not cataloged or accessible to the build pipeline.

**Problem:** The AI lacks creative design intelligence — both technique knowledge and creative initiative.

**Solution:** A "Design Intelligence Layer" with 4 components that bolt onto the existing web-builder pipeline: a Pattern Library, a Creative Research Phase, a Creative Brief Generator, and a Post-Build Harvest workflow.

**Source projects:** Bloomin' Acres (shipped client project), OphidianAI website (shipped internal project), Point of Hope Church (prospect mockup — not a shipped project, but techniques are valid for the library).

---

## 1. Pattern Library

**Location:** `engineering/design-system/`

### Folder Structure

```
engineering/design-system/
  README.md                          # How to use the library, index of categories
  _catalog.md                        # Flat index: one-line per pattern with tags

  patterns/
    animations/
      word-by-word-reveal.md         # OphidianAI hero
      fade-up-stagger.md             # All 3 projects
      vertical-cut-reveal.md         # OphidianAI (motion/react)
      timeline-scroll-reveal.md      # OphidianAI (useInView + blur)
      intersection-observer-fade.md  # Bloomin' Acres
      float-particles.md             # OphidianAI hero
      card-float.md                  # OphidianAI dashboard

    backgrounds/
      mesh-gradient-shader.md        # OphidianAI (@paper-design/shaders-react)
      layered-radial-gradients.md    # Bloomin' Acres
      fixed-video-background.md      # Point of Hope Church
      svg-grid-overlay.md            # OphidianAI hero
      grain-texture-svg.md           # Bloomin' Acres
      dot-pattern.md                 # Bloomin' Acres

    hover-effects/
      mouse-tracking-glow.md         # OphidianAI (spotlight-card / glow-card)
      glass-button-shimmer.md        # OphidianAI
      glow-border.md                 # OphidianAI
      scale-underline.md             # Point of Hope Church
      text-shadow-hover.md           # OphidianAI

    glass-effects/
      glass-card.md                  # Bloomin' Acres + OphidianAI
      glass-button.md                # OphidianAI
      glass-nav.md                   # Bloomin' Acres

    layouts/
      full-bleed-hero.md
      alternating-image-text.md
      asymmetric-grid.md
      card-grid-responsive.md
      circular-gallery.md            # OphidianAI

    typography/
      gradient-text.md               # OphidianAI
      tight-tracking-display.md
      serif-sans-pairing.md          # Bloomin' Acres (Playfair + DM Sans)
      mono-accent-labels.md          # OphidianAI (Space Mono overlines)

    dividers/
      svg-botanical.md               # Bloomin' Acres
      gradient-line.md               # OphidianAI
      decorative-dot-trio.md         # OphidianAI

    scroll-effects/
      scroll-triggered-fade.md       # IntersectionObserver pattern
      framer-motion-scroll.md        # useInView + motion variants
      parallax-section.md

    color-treatments/
      brand-color-shifting.md        # OphidianAI glow-card hue shift
      overlay-blend-modes.md         # Bloomin' Acres image overlays
      selection-color.md             # OphidianAI ::selection
      tinted-shadows.md              # Both projects

  starters/
    animations/
      vertical-cut-reveal.tsx
      timeline-content.tsx
      intersection-observer.ts       # Vanilla JS utility

    backgrounds/
      mesh-gradient-bg.tsx
      svg-grid-hero.tsx

    hover-effects/
      glow-card.tsx
      glow-card.css
      glass-button.tsx
      glass-button.css

    glass-effects/
      glass-card.css

    dividers/
      botanical-wheat.svg
      botanical-sprig.svg
```

### Pattern Reference Doc Format

Each `.md` in `patterns/` uses this schema:

```markdown
---
name: [Pattern Name]
category: [animations|backgrounds|hover-effects|glass-effects|layouts|typography|dividers|scroll-effects|color-treatments]
complexity: [simple|moderate|advanced]
dependencies: [css-only|vanilla-js|framer-motion|custom-js|css-custom-properties|external-package-name]
best-for: [industry/mood tags: tech, saas, agency, dark-themes, organic, farm, food, wellness, church, etc.]
performance: "[Brief performance note]"
source-project: [ophidian-ai|bloomin-acres|point-of-hope-church-mockup]
last-validated: YYYY-MM-DD
---

# [Pattern Name]

## What It Does
[1-2 sentences describing the visual effect]

## When to Use
- [Bullet list of ideal use cases]

## Visual Effect
[Detailed description of what the user sees]

## Code Reference
**Starter component:** `starters/[category]/[file]` (if available)

## Key Implementation Details
- [Technical bullet points]

## Customization
- [How to adapt for different brands/contexts]

## Dependencies
- [What to install, or "None — CSS only"]
```

### Catalog File (`_catalog.md`)

Flat, scannable index for fast AI pattern matching:

```markdown
# Pattern Catalog

| Pattern | Category | Complexity | Dependencies | Best For | Source |
|---------|----------|------------|-------------|----------|--------|
| Word-by-Word Reveal | animations | moderate | vanilla-js | hero-sections, landing-pages | ophidian-ai |
| Mesh Gradient Shader | backgrounds | advanced | @paper-design/shaders-react | dark-themes, tech, agency | ophidian-ai |
| SVG Botanical Divider | dividers | simple | css-only | organic, farm, food, wellness | bloomin-acres |
| Mouse-Tracking Glow | hover-effects | advanced | custom-js | tech, saas, dark-themes | ophidian-ai |
| Fixed Video Background | backgrounds | moderate | vanilla-js | church, nonprofit, nature | point-of-hope-church-mockup |
...
```

### Starter Component Rules

- Brand-agnostic: colors, fonts, and tokens passed as props or CSS custom properties
- Comment block at top: pattern name, what to customize, which reference doc to read
- Copied into projects, never imported from design-system directory

---

## 2. Creative Research Phase (Phase 1.5)

**New skill:** `.claude/skills/creative-research/SKILL.md`

**Trigger:** Automatically after Discovery (Phase 1) produces `docs/site-brief.md`. Also invocable standalone: "research design trends for [industry]".

### Process (5-7 minute target)

1. **Read inputs:** `docs/site-brief.md` + `engineering/design-system/_catalog.md`
2. **Firecrawl research (3-5 searches):**
   - `"best [industry] website designs [year]"` — award-winning sites in the niche
   - `"web design trends [year] animation interaction"` — current trend pulse
   - Scrape 2-3 top results for specific technique descriptions
   - `"[industry] color palette typography"` — industry design language
3. **Match against pattern catalog:** Score each library pattern for relevance (industry match, mood match, complexity budget). Select 5-8 recommended patterns.
4. **Output:** `docs/creative-research.md`

### Research Output Format

```markdown
# Creative Research — [Client Name]

**Date:** YYYY-MM-DD
**Industry:** [industry]
**Mood:** [3-5 mood keywords from Discovery]

## Trend Pulse
- [2-3 sentence summary of current relevant trends]

## Industry Benchmarks
- [Site 1 URL] — [what makes it good, specific techniques]
- [Site 2 URL] — [what makes it good]
- [Site 3 URL] — [what makes it good]

## Recommended Patterns from Library
| Pattern | Why | Reference |
|---------|-----|-----------|
| [name] | [matches because...] | `patterns/[category]/[file].md` |

## New Techniques Discovered
| Technique | Description | Implementation Notes |
|-----------|-------------|---------------------|
| [name] | [visual effect] | [how to build, estimated complexity] |

## Typography Recommendations
- Display: [font + rationale]
- Body: [font + rationale]

## Color Treatment Notes
- [Beyond brand palette: overlays, gradients, accents, dark/light approach]
```

### Time Budget

Target 7-12 minutes total. 3-4 Firecrawl searches plus 2-3 scrapes account for most of the time. Pattern matching and output generation add 1-2 minutes. Adaptive — skip scrapes if searches return rich results.

### Failure Modes

| Scenario | Handling |
|----------|----------|
| Firecrawl fully unavailable | Skip research, generate brief from pattern library only. Note "research unavailable" in creative-research.md. |
| `docs/site-brief.md` missing | Abort Phase 1.5, prompt to run Discovery first. |
| Empty catalog (first-ever build) | Skip pattern matching, rely entirely on Firecrawl research. Note "library empty — seeding recommended after this build." |
| Zero industry matches in catalog | Use mood/energy matches instead. Flag in research output. |
| Firecrawl returns poor/irrelevant results | Use whatever is usable, fall back to catalog. Note "research limited" in output. |

---

## 3. Creative Brief Generator

**Not a separate skill.** A documented step within web-builder SKILL.md, runs immediately after Creative Research.

**Inputs:** `docs/site-brief.md` + `docs/creative-research.md` + catalog + relevant pattern docs
**Output:** `docs/creative-brief.md`

### Creative Brief Template

```markdown
# Creative Brief — [Client Name]

**Date:** YYYY-MM-DD
**Approved:** [ ] Pending Eric's review / [x] Auto-approved (familiar pattern)

## Creative Direction
- **Mood:** [3-5 words]
- **Energy:** [calm / moderate / dynamic / high-energy]
- **Personality:** [e.g., "rustic artisan" or "sleek professional"]

## Animation Strategy
- **Framework:** [CSS-only / Framer Motion / GSAP / vanilla JS]
- **Primary triggers:** [on-load / scroll-into-view / hover / click]
- **Performance budget:** [max simultaneous animations, transform+opacity preference]
- **Specific animations:**
  | Element | Animation | Pattern Reference | Notes |
  |---------|-----------|------------------|-------|
  | Hero headline | Word-by-word reveal | `patterns/animations/word-by-word-reveal.md` | Stagger 80ms |
  | Section content | Fade-up on scroll | `patterns/animations/fade-up-stagger.md` | IO |
  | Cards | Float on idle | `patterns/animations/card-float.md` | 6s loop |

## Background Treatment
- **Primary approach:** [solid / gradient / mesh shader / video / texture]
- **Technique details:** [specifics]
- **Pattern reference:** `patterns/backgrounds/[file].md`
- **Fallback:** [reduced-motion / low-power fallback]

## Typography
- **Display font:** [name] — [rationale]
- **Body font:** [name] — [rationale]
- **Mono/accent font:** [name, if any]
- **Scale approach:** [tracking, line-height notes]

## Color Treatment
- **Brand colors:** [from Discovery]
- **Extended palette:**
  | Role | Color | Usage |
  |------|-------|-------|
  | Overlay gradient | [colors] | [where] |
  | Accent glow | [color + opacity] | [shadows, borders] |
  | Selection | [color] | ::selection |
  | Tinted shadows | [formula] | [cards, buttons] |

## Section Layout Approach
- **Style:** [symmetric / asymmetric / full-bleed / card-based / magazine]
- **Per section:**
  | Section | Layout | Notes |
  |---------|--------|-------|
  | Hero | Full-bleed centered | Pattern: layouts/full-bleed-hero.md |
  | Features | 3-col card grid | Glow cards on hover |
  | About | Alternating image + text | Left/right flip |

## Hover & Interaction Micro-Patterns
| Element | Effect | Pattern Reference |
|---------|--------|------------------|
| Buttons | Glass shimmer | hover-effects/glass-button-shimmer.md |
| Cards | Mouse-tracking glow | hover-effects/mouse-tracking-glow.md |
| Links | Underline scale | hover-effects/scale-underline.md |

## Divider & Separator Strategy
- [description]
- Pattern reference: `dividers/[file].md`

## Dependencies to Install
- [npm packages needed]

## Glass/Depth Effects
- [Which elements, what treatment]
```

### Tiered Autonomy Logic

**Auto-approve** (Eric reviews at screenshot checkpoints) when:
- Client's industry has been built before (check `_catalog.md` source-project entries)
- Mood/energy matches a previous project closely
- All recommended patterns are from the existing library

**Require Eric's approval** before Scaffold when:
- New industry with no prior projects
- 2+ new untested techniques from research
- Advanced dependencies not used before (GSAP, Three.js, etc.)
- Tight budget/timeline with complex techniques

### Approval Workflow (when approval required)

1. Present a one-paragraph summary of the creative direction + the full `creative-brief.md`
2. Eric responds with one of:
   - **"Approved"** — proceed to Scaffold
   - **Specific feedback** (e.g., "drop the video background, use gradients instead") — revise the brief, re-present the changed sections only
   - **"Start over"** — re-run Creative Research with adjusted parameters
3. Loop until approved. Max 3 revision rounds before escalating to a call/discussion.

---

## 4. Post-Build Harvest

**New skill:** `.claude/skills/post-build-harvest/SKILL.md`

**Trigger:** Suggested at end of Phase 6 QA. Manual: "harvest patterns from [project]".

### Process

1. **Scan project** CSS/TSX for: `@keyframes`, custom properties, gradients, `backdrop-filter`, animation libraries, custom hooks, event listeners
2. **Read `docs/creative-brief.md`** to compare planned vs built
3. **Diff against `_catalog.md`** — find techniques not already cataloged
4. **For each new technique:** create pattern doc in `patterns/[category]/`, extract brand-agnostic starter if reusable, add row to `_catalog.md`
5. **For existing techniques with new variants:** update customization section, add project to source list
6. **Quality gate — Eric confirms** before committing new patterns. Present the harvest report and ask: "Add these to the library?" Minimum criteria for a library-worthy pattern:
   - Used in at least one shipped project (not just a prototype)
   - Can be made brand-agnostic (not deeply coupled to one client's design)
   - Has clear reuse potential (applies to more than one industry/mood)
7. **Output:** `docs/harvest-report.md`

### Harvest Report Format

```markdown
# Harvest Report — [Client Name]

**Date:** YYYY-MM-DD

## New Patterns Added
| Pattern | Category | File Created |
|---------|----------|-------------|
| [name] | [category] | `patterns/[cat]/[file].md` |

## Existing Patterns Updated
| Pattern | What Changed |
|---------|-------------|
| [name] | Added [project] variant |

## Starters Created
| Starter | File |
|---------|------|
| [name] | `starters/[cat]/[file].tsx` |

## Techniques Not Extracted (and why)
| Technique | Reason |
|-----------|--------|
| [name] | Too project-specific / one-off |
```

---

## 5. Web-Builder SKILL.md Modifications

**File:** `.claude/skills/web-builder/SKILL.md`

**Important:** Do NOT renumber existing phases. Use 1.5 and 6.5 to preserve all existing phase references. Update the dispatch table and audit checkpoint table to include the new phases in chronological order.

### A. Insert Phase 1.5 between Discovery and Scaffold

```
## Phase 1.5: Creative Research & Brief

**Goal:** Research design trends, match patterns from library, produce actionable creative brief.
**Sub-agents:** None. Sequential — depends on Discovery output.

### Steps
1. Invoke creative research skill (`.claude/skills/creative-research/SKILL.md`)
   - Input: docs/site-brief.md
   - Output: docs/creative-research.md
2. Generate creative brief:
   - Read: site-brief + creative-research + _catalog.md + relevant pattern docs
   - Output: docs/creative-brief.md
3. Approval gate:
   - Auto-approve conditions met → proceed to Phase 2
   - Otherwise → present brief to Eric for review

**Output:** docs/creative-brief.md (approved)

**Checkpoint — Creative Brief Audit:**
- [ ] creative-research.md exists and has content (or "research unavailable" note)
- [ ] creative-brief.md exists and follows the template schema
- [ ] Every animation/background/hover entry references a pattern doc or documents a new technique
- [ ] Dependencies list is complete (no unlisted packages)
- [ ] Approval status is set (auto-approved or Eric-approved)
```

### B. Modify Phase 2 (Scaffold)

Add steps:
- Install creative dependencies from `docs/creative-brief.md` Dependencies section
- Copy starter components from `engineering/design-system/starters/` listed in the brief

### C. Modify Phase 3 (Design System)

Update Agent 3 (Global Styles): use `docs/creative-brief.md` as the design specification. Implement CSS custom properties, keyframes, animation utilities, glass/grain/texture overlays, hover patterns, color treatments per the brief.

### D. Modify Phase 4 (Page Building)

Before selecting sections for each page, read Section Layout Approach and Animation Strategy from the creative brief. Apply specified layout pattern, animation, and hover effects per section.

### E. Add Phase 6.5 (Post-Build Harvest)

Optional but recommended after QA. Invoke post-build-harvest skill. Review harvest report. Confirm new patterns to add.

### F. Update tables

- Sub-agent dispatch table: add Phase 1.5 row (sequential)
- Related skills table: add creative-research, post-build-harvest, design system library

---

## 6. Implementation Sequence

### Step 1: Create pattern library structure
- Create `engineering/design-system/` folder structure
- Write `README.md` and empty `_catalog.md`

### Step 2: Seed pattern docs from OphidianAI
- Source: `engineering/projects/ophidian-ai/src/app/globals.css`, `src/components/ui/`
- Patterns: mesh gradient, glow cards, glass buttons, word reveal, vertical cut reveal, timeline animation, SVG grid, gradient text, glass effects, glow borders, float particles
- ~12 pattern docs

### Step 3: Seed pattern docs from Bloomin' Acres
- Source: `engineering/projects/bloomin-acres/css/`, `js/`
- Patterns: SVG botanical dividers, radial gradient layering, grain texture, glass nav, IO fade, tinted card shadows, serif+sans pairing
- ~8 pattern docs

### Step 4: Seed pattern docs from Point of Hope Church
- Source: `sales/lead-generation/prospects/point-of-hope-church/initial-design/src/`
- Patterns: fixed video background, Framer Motion scroll, scale underline
- ~4 pattern docs

### Step 5: Remaining pattern docs
- Layout patterns, scroll effects, and general patterns (~6 docs)

### Step 6: Extract starter components
- Make brand-agnostic copies from OphidianAI: mesh-gradient-bg.tsx, glow-card.tsx + CSS (renamed from spotlight-card.tsx), glass-button.tsx + CSS, vertical-cut-reveal.tsx, timeline-content.tsx
- Extract botanical SVGs from Bloomin' Acres
- Extract intersection-observer.ts utility
- ~10 starter files

### Step 7: Write creative-research skill
- `.claude/skills/creative-research/SKILL.md`

### Step 8: Write post-build-harvest skill
- `.claude/skills/post-build-harvest/SKILL.md`

### Step 9: Modify web-builder SKILL.md
- Add Phase 1.5, modify Phases 2/3/4, add Phase 6.5, update tables

### Step 10: Update persistent memory
- Update `persistent-memory/tools/web-builder-skill.md`

---

## 7. Critical Files

| File | Action |
|------|--------|
| `.claude/skills/web-builder/SKILL.md` | Modify — add Phase 1.5, modify 2/3/4, add 6.5 |
| `engineering/design-system/README.md` | Create — library docs |
| `engineering/design-system/_catalog.md` | Create — pattern index |
| `engineering/design-system/patterns/**/*.md` | Create — ~30 pattern docs |
| `engineering/design-system/starters/**/*` | Create — ~10 starter files |
| `.claude/skills/creative-research/SKILL.md` | Create — new skill |
| `.claude/skills/post-build-harvest/SKILL.md` | Create — new skill |
| `persistent-memory/tools/web-builder-skill.md` | Modify — add DIL section |
| `engineering/projects/ophidian-ai/src/app/globals.css` | Read — extract patterns |
| `engineering/projects/ophidian-ai/src/components/ui/spotlight-card.tsx` | Read — extract starter |
| `engineering/projects/bloomin-acres/css/index.css` | Read — extract patterns |
| `engineering/projects/bloomin-acres/css/global.css` | Read — extract patterns |

---

## 8. Verification

1. **Pattern library completeness:** All 9 categories populated. `_catalog.md` has entries for every pattern doc. Each doc follows the schema. Each starter has the comment block header.
2. **Creative research skill:** Invoke standalone with "research design trends for sourdough bakery" — confirm it reads _catalog.md, runs Firecrawl searches, and outputs a well-formed creative-research.md.
3. **Web-builder integration:** Read the modified SKILL.md and trace the Phase 1 → 1.5 → 2 flow. Confirm the brief is consumed in Phases 2, 3, and 4.
4. **Post-build harvest:** Run against an existing project (e.g., OphidianAI) — should find 0 new patterns (since we just seeded from it) and confirm the library is complete.
5. **End-to-end:** Next real client build should flow through Discovery → Creative Research → Creative Brief → Scaffold (with starters) → Design System (from brief) → Pages (from brief) → QA → Harvest.
