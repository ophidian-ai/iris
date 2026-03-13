---
name: Glow Border
category: hover-effects
complexity: simple
dependencies: css-only
best-for: tech, saas, agency, dark-themes, cards, buttons
performance: "Single pseudo-element with opacity transition. Extremely lightweight."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Glow Border

## What It Does
An animated gradient border that fades in around an element on hover, using a pseudo-element positioned behind the content.

## When to Use
- Cards, buttons, or containers that need a hover highlight
- Simpler alternative to the mouse-tracking glow when cursor tracking is overkill
- Any interactive element on a dark background
- Accent borders for selected/active states

## Visual Effect
On hover, a gradient border (primary green to accent teal at 135 degrees) fades in at 50% opacity around the element. The border sits behind the content via `z-index: -1` and matches the element's border-radius. The transition is smooth at 0.3 seconds.

## Code Reference
**Starter component:** None

## Key Implementation Details

- The `.glow-border` class and its pseudo-element in `globals.css`:

```css
.glow-border {
  position: relative;
}

.glow-border::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glow-border:hover::after {
  opacity: 0.5;
}
```

- `inset: -1px` extends the pseudo-element 1px beyond the parent on all sides, creating the border effect
- `border-radius: inherit` ensures the glow matches rounded corners
- `z-index: -1` keeps the glow behind the content

## Customization
- Change `opacity: 0.5` to a higher value (0.7-1.0) for a more intense glow
- Use a single color instead of a gradient for uniform borders
- Add `box-shadow` to the `::after` for a softer outer glow halo
- For always-visible borders (not just hover), set the default opacity to 0.2-0.3
- Animate to `opacity: 1` on focus-visible for keyboard navigation
- Increase `inset: -2px` or `-3px` for a thicker border effect

## Dependencies
- None -- CSS only
