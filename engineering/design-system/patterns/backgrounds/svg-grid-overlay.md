---
name: SVG Grid Overlay
category: backgrounds
complexity: moderate
dependencies: css-only
best-for: tech, saas, agency, dark-themes, hero-sections
performance: "SVG pattern + 4 animated lines + 4 dots. Minimal DOM. stroke-dashoffset animation is GPU-friendly."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# SVG Grid Overlay

## What It Does
An SVG grid pattern fills the background with subtle lines, while accent grid lines animate in by "drawing" themselves using stroke-dashoffset, followed by intersection dots that fade in at grid crossings.

## When to Use
- Hero section backgrounds on tech/engineering sites
- Behind transparent card layouts
- Any section that needs a technical, blueprint-like aesthetic
- Pairs well with dark backgrounds and glowing accent colors

## Visual Effect
A fine 60x60px repeating grid pattern provides the base texture at very low opacity. Four accent lines (two horizontal at 20%/80%, two vertical at 20%/80%) animate from invisible to drawn over 3 seconds -- the stroke appears to extend from one end to the other. Four small dots appear at the grid intersections with staggered fade-ins, marking the crosspoints.

## Code Reference
**Starter component:** None

## Key Implementation Details

- The `@keyframes grid-draw` animation in `globals.css`:

```css
@keyframes grid-draw {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0.15;
  }
}
```

- The `.grid-line` and `.detail-dot` classes:

```css
.grid-line {
  stroke: rgba(57, 255, 20, 0.15);
  stroke-width: 0.5;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: grid-draw 3s ease-out forwards;
}

.detail-dot {
  fill: var(--color-primary);
  opacity: 0;
  animation: fade-in 0.5s ease-out forwards;
}
```

- SVG structure with pattern and animated elements:

```tsx
<svg className="absolute inset-0 w-full h-full">
  <defs>
    <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(57,255,20,0.08)" strokeWidth="0.5" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#hero-grid)" />
  <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: "0.2s" }} />
  <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: "0.4s" }} />
  <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: "0.6s" }} />
  <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: "0.8s" }} />
  <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "1s" }} />
  <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "1.1s" }} />
  <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "1.2s" }} />
  <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "1.3s" }} />
</svg>
```

- Animation delays stagger: lines at 0.2s intervals, dots at 0.1s intervals after lines finish

## Customization
- Change grid cell size by adjusting `width="60" height="60"` in the pattern
- Use `stroke: rgba(your-color, 0.08)` for the base grid and `rgba(your-color, 0.15)` for accent lines
- Add more grid lines at different percentages (e.g., 33%, 50%, 66%) for a denser layout
- Increase `stroke-dasharray` and `stroke-dashoffset` for longer draw animation on wider screens
- Replace dots with small crosses or diamonds via different SVG shapes
- Add a 3rd set of diagonal lines for an isometric grid variant

## Dependencies
- None -- CSS + inline SVG only
