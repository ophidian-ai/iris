---
name: Dot Pattern
category: backgrounds
complexity: simple
dependencies: css-only
best-for: organic, farm, food, wellness, rustic, craft, artisan, process-sections
performance: "Pure CSS radial-gradient tiled via background-size. No images loaded. Renders instantly."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Dot Pattern

## What It Does
Creates a repeating grid of small dots using a CSS radial-gradient, producing a subtle polka-dot or graph-paper texture. Adds visual interest to otherwise flat background sections.

## When to Use
- Process/steps sections where you want subtle texture without competing with content
- Sections with a warm or craft aesthetic where a clean flat color feels too sterile
- Backgrounds behind card grids or icon rows
- Any section that needs low-key visual texture without loading an image

## Visual Effect
Tiny dots (1px radius) repeat in a regular grid pattern (24px spacing). At the low opacity used in Bloomin' Acres (6.5%), the dots are barely visible -- they create a subliminal texture that makes the section feel hand-crafted rather than digitally flat. The effect is similar to a linen or craft-paper quality.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Process section implementation (from `css/index.css`):**

```css
.process-section {
  background-color: var(--cream-warm);
  background-image: radial-gradient(
    circle,
    rgba(74,51,34,.065) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}
```

**How it works:**

- `radial-gradient(circle, color 1px, transparent 1px)` -- creates a single dot. The dot is 1px radius, everything beyond is transparent.
- `background-size: 24px 24px` -- the gradient tiles at 24px intervals, creating the grid pattern.
- `rgba(74,51,34,.065)` -- the dot color is the earth-brown brand color at 6.5% opacity. Using a brand color (even at low opacity) keeps the texture feeling intentional rather than generic.

**Layering with other backgrounds:**

The dot pattern can be combined with a solid background-color. The `background-color` fills the transparent areas of the gradient:

```css
.section {
  background-color: #EDD9B8;              /* warm cream base */
  background-image: radial-gradient(
    circle,
    rgba(74,51,34,.065) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}
```

## Customization
- **Dot size:** Change the `1px` value. 0.5px for finer, 2px for more visible dots.
- **Grid spacing:** Change `background-size`. 16px for tighter grid, 32px for more spread out.
- **Dot color:** Use any brand color at low opacity (0.04-0.10). Dark dots on light backgrounds, light dots on dark backgrounds.
- **Diagonal grid:** Add `background-position: 12px 12px` to a second dot gradient layer to create a diagonal/diamond pattern.
- **Offset rows:** Layer two gradients with offset positions for a honeycomb-like arrangement:

```css
background-image:
  radial-gradient(circle, rgba(74,51,34,.065) 1px, transparent 1px),
  radial-gradient(circle, rgba(74,51,34,.065) 1px, transparent 1px);
background-size: 24px 24px;
background-position: 0 0, 12px 12px;
```

## Dependencies
- None -- CSS only
