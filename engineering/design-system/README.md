# Design System Pattern Library

A curated library of creative web design patterns and reusable starter components, extracted from OphidianAI client projects.

## How to Use

### During a Build (Automated)

The web-builder skill automatically consults this library during Phase 1.5 (Creative Research & Brief). The `_catalog.md` file is read to match patterns to the client's industry, mood, and complexity budget.

### Manual Browsing

1. Scan `_catalog.md` for a quick overview of all patterns with tags
2. Read individual pattern docs in `patterns/[category]/` for full details
3. Copy starter components from `starters/[category]/` into your project

## Structure

```
engineering/design-system/
  _catalog.md              # Flat index of all patterns (scan this first)
  patterns/                # Markdown reference docs by category
    animations/            # Entry animations, reveals, floating elements
    backgrounds/           # Gradients, video, shaders, textures
    hover-effects/         # Mouse-tracking, shimmer, glow, scale
    glass-effects/         # Backdrop blur, glass morphism
    layouts/               # Section layout patterns
    typography/            # Text treatments, font pairings
    dividers/              # Section separators, decorative elements
    scroll-effects/        # Scroll-triggered animations
    color-treatments/      # Color shifting, overlays, tinted shadows
  starters/                # Copy-paste ready .tsx/.css/.svg files
    animations/
    backgrounds/
    hover-effects/
    glass-effects/
```

## Pattern Doc Format

Each pattern doc in `patterns/` has YAML frontmatter with:

- `name` -- Pattern name
- `category` -- One of the 9 categories above
- `complexity` -- simple / moderate / advanced
- `dependencies` -- css-only, vanilla-js, framer-motion, custom-js, or package name
- `best-for` -- Industry and mood tags for matching
- `performance` -- Brief performance note
- `source-project` -- Which project it was extracted from (`ophidian-ai`, `bloomin-acres`, `point-of-hope-church-mockup`, or `general` for common patterns not tied to a specific project)
- `last-validated` -- Date the pattern was last verified working

## Starter Component Rules

- Brand-agnostic: colors, fonts, and tokens are passed as props or CSS custom properties
- Comment block at top: pattern name, what to customize, which reference doc to read
- Copied into projects, never imported from this directory
- Each starter maps to a pattern doc for full context

## Adding New Patterns

Use the post-build-harvest skill after completing a project, or manually:

1. Create a pattern doc in `patterns/[category]/[name].md` following the schema
2. If reusable code exists, extract a brand-agnostic starter to `starters/[category]/`
3. Add a row to `_catalog.md`
