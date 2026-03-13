---
name: Decorative Dot Trio
category: dividers
complexity: simple
dependencies: css-only
best-for: tech, saas, agency, dark-themes, section-separators, minimal-designs
performance: "Three tiny DOM elements. Virtually zero cost."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Decorative Dot Trio

## What It Does
Three small circular dots arranged horizontally as a minimal decorative separator element, using alternating brand colors and opacity levels.

## When to Use
- Below hero sections as a visual endpoint
- Between content sections as a subtle break
- As a decorative flourish below headings or quotes
- Anywhere a gradient line feels too heavy

## Visual Effect
Three 1x1 pixel dots (4px with Tailwind's w-1 h-1) arranged in a horizontal row with spacing. The outer dots use the primary color (green) at 40% opacity, and the center dot uses the accent color (teal) at 60% opacity. The alternating colors and opacities create a subtle, balanced ornament.

## Code Reference
**Starter component:** None

## Key Implementation Details

- Implementation from the hero component (appears after the bottom tagline, animated in with word-appear):

```tsx
<div
  className="mt-6 flex justify-center space-x-4 opacity-0"
  style={{
    animation: "word-appear 1s ease-out forwards",
    animationDelay: "2.5s",
  }}
>
  <div className="w-1 h-1 rounded-full opacity-40 bg-primary" />
  <div className="w-1 h-1 rounded-full opacity-60 bg-accent" />
  <div className="w-1 h-1 rounded-full opacity-40 bg-primary" />
</div>
```

- The trio uses the word-appear animation with a 2.5s delay to fade in after the hero text
- `space-x-4` provides 16px gaps between dots
- `rounded-full` makes them circular

## Customization
- Increase to `w-1.5 h-1.5` or `w-2 h-2` for larger dots
- Add a 4th or 5th dot for a wider separator
- Use all one color at varying opacities (0.3, 0.6, 0.3) for a simpler look
- Add `animate-pulse` to the center dot for a breathing effect
- Replace with small dashes (`w-4 h-px`) for a line variant
- Adjust `space-x-4` to `space-x-2` for tighter grouping or `space-x-6` for more spread
- Remove the animation wrapper for an always-visible separator

## Dependencies
- None -- CSS/HTML only
