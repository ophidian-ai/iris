---
name: Selection Color
category: color-treatments
complexity: simple
dependencies: css-only
best-for: tech, saas, agency, dark-themes, light-themes, all-sites
performance: "Zero runtime cost. Single CSS rule applied globally."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Selection Color

## What It Does
Custom `::selection` pseudo-element styling that applies brand colors to text when a user highlights/selects content on the page.

## When to Use
- Every site. This is a global polish detail that should be applied universally.
- Reinforces brand identity in a subtle, discoverable way
- Particularly impactful on dark-themed sites where the default blue selection feels jarring

## Visual Effect
When a user selects text by clicking and dragging, the highlight background appears in the primary brand color (venom green) at 30% opacity, with foreground text in the standard light color. This replaces the browser's default blue highlight with a branded one.

## Code Reference
**Starter component:** None

## Key Implementation Details

- The `::selection` rule in `globals.css`:

```css
::selection {
  background: rgba(57, 255, 20, 0.3);
  color: var(--color-foreground);
}
```

- Place this in global/base styles so it applies to all text on the page
- `rgba(57, 255, 20, 0.3)` = venom green at 30% opacity
- `var(--color-foreground)` = `#F1F5F9` (light gray text)

## Customization
- Adjust opacity (0.3) -- higher for more vivid selection, lower for subtler
- Use any brand color: `rgba(your-r, your-g, your-b, 0.3)`
- For light themes, use a darker selection background and ensure `color` has enough contrast
- Add `::selection` to specific elements for per-section selection colors:

```css
.hero-section ::selection {
  background: rgba(57, 255, 20, 0.4);
}
.content-section ::selection {
  background: rgba(13, 177, 178, 0.3);
}
```

- Firefox also supports `::-moz-selection` (though modern Firefox supports `::selection`)

## Dependencies
- None -- CSS only
