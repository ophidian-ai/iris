---
name: Grain Texture SVG
category: backgrounds
complexity: simple
dependencies: css-only
best-for: organic, farm, food, wellness, rustic, luxury, editorial, vintage
performance: "SVG filter is rendered once and tiled. Fixed positioning means no repaints on scroll. pointer-events:none ensures no interaction cost. The 300x300 tile size is small enough for fast rendering."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Grain Texture SVG

## What It Does
Applies a subtle film-grain/paper texture across the entire page using an SVG fractal noise filter as a tiled background on a pseudo-element. Adds tactile depth without any image assets.

## When to Use
- Organic or artisan brands where a "too clean" digital look feels wrong
- Over layered gradient backgrounds to add texture and break up smoothness
- Editorial or luxury designs that benefit from a paper-like quality
- Any design where you want subtle visual noise without loading an image file

## Visual Effect
A barely-visible (4% opacity) noise pattern covers the entire viewport. It looks like very fine paper grain or analog film noise. The effect is subliminal -- users won't consciously notice it, but the page feels warmer and more tactile compared to perfectly smooth digital gradients. The texture is desaturated (grayscale) so it works on any color background.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Body pseudo-element approach (from `css/index.css`):**

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 300px 300px;
}
```

**Reusable class variant (from `css/global.css`):**

```css
.grain-overlay::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
}
```

**SVG filter breakdown:**

- `feTurbulence type='fractalNoise'` -- generates Perlin noise
- `baseFrequency='0.85'` -- controls grain size. Higher = finer grain (0.85 is quite fine). The global variant uses 0.75 for slightly coarser grain.
- `numOctaves='4'` -- layers of detail. 4 gives good complexity without performance cost.
- `stitchTiles='stitch'` -- ensures the noise tiles seamlessly when repeated
- `feColorMatrix type='saturate' values='0'` -- desaturates to grayscale (only in the index variant)
- The 300x300 tile size balances detail and rendering cost

**Critical CSS properties:**

- `position: fixed` -- stays in place during scroll, no repaints
- `inset: 0` -- covers entire viewport
- `z-index: 9999` -- sits above all content
- `pointer-events: none` -- does not interfere with clicks or hover states
- `opacity: 0.04` -- barely visible. This is the sweet spot; 0.02 is invisible, 0.08 is distracting

## Customization
- Adjust `opacity` between 0.02 (barely there) and 0.08 (noticeable texture). 0.04 is the default for a reason.
- Change `baseFrequency` to control grain size: 0.5 for coarse, 0.85 for fine, 1.2+ for very fine dust.
- Remove the `feColorMatrix` line to get color noise (subtle rainbow grain) for more playful brands.
- Use `position: absolute` instead of `fixed` to limit the grain to a specific container instead of the whole page.
- Lower the `z-index` if you need elements to render above the grain (modals, tooltips).

## Dependencies
- None -- CSS only, inline SVG data URI
