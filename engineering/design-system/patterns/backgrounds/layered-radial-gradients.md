---
name: Layered Radial Gradients
category: backgrounds
complexity: moderate
dependencies: css-only
best-for: organic, farm, food, wellness, rustic, luxury, hero-sections
performance: "GPU-composited. No repaints on scroll. Multiple gradients are rendered as a single composited layer by the browser."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Layered Radial Gradients

## What It Does
Stacks multiple radial-gradient layers at different positions and sizes to create a rich, organic background with depth and color variation. Replaces flat solid backgrounds with something that feels hand-painted.

## When to Use
- Hero sections that need visual depth without an image
- Dark sections where you want subtle color variation
- Behind overlaid text where a flat color feels too sterile
- Any full-bleed section that benefits from a warm, organic atmosphere

## Visual Effect
The eye perceives a deep base color (dark green in Bloomin' Acres) with warm pools of light bleeding in from the edges and corners. A large green glow anchors the top-left, a warm orange glow pulls from the bottom-right, a faint cream haze softens the center, and a brown accent adds depth in the upper-right. The result feels atmospheric and dimensional, like light filtering through a canopy.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Hero section gradient stack (from `css/index.css`):**

```css
.hero-section {
  background-color: #263B28;
  background-image:
    radial-gradient(ellipse 90% 70% at 5% 10%,
      rgba(60,95,75,.95) 0%, transparent 60%),
    radial-gradient(ellipse 75% 60% at 95% 90%,
      rgba(237,163,57,.4) 0%, transparent 55%),
    radial-gradient(ellipse 55% 45% at 50% 55%,
      rgba(250,240,230,.08) 0%, transparent 50%),
    radial-gradient(ellipse 40% 30% at 80% 15%,
      rgba(74,51,34,.5) 0%, transparent 45%);
}
```

**Visit section variant (subtler, on a different base):**

```css
.visit-section {
  background-color: var(--sage-dark);
  background-image:
    radial-gradient(ellipse 65% 55% at 15% 85%,
      rgba(74,51,34,.42) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 88% 18%,
      rgba(237,163,57,.14) 0%, transparent 55%);
}
```

**Key techniques:**

- **Ellipse sizing** (`ellipse 90% 70%`) -- using wide ellipses instead of circles creates more natural, organic light pools
- **Off-center positioning** (`at 5% 10%`) -- placing gradients near edges/corners prevents a bullseye effect
- **Low opacity colors** (`rgba(237,163,57,.4)`) -- gradients layer on top of each other, so low opacity is critical to avoid muddy results
- **Transparent fade** (`transparent 55%`) -- each gradient fades to transparent well before its edge, creating soft transitions
- **Solid base color** (`background-color: #263B28`) -- the base color shows through where all gradients are transparent, tying everything together

**Layer composition strategy:**

1. **Dominant glow** (largest, highest opacity) -- sets the mood, usually matches the section's primary tone
2. **Accent glow** (medium, moderate opacity) -- adds warmth or coolness from an opposite direction
3. **Haze layer** (medium, very low opacity) -- softens the transition between dominant and accent
4. **Depth accent** (small, moderate opacity) -- adds a third color to prevent the background from feeling two-tone

## Customization
- Swap the color values to match any brand palette. The structure (4 overlapping ellipses at different positions) works with any color scheme.
- For lighter sections, use a light `background-color` and darker gradient colors at very low opacity (0.05-0.15).
- Reduce to 2 gradient layers for simpler sections (visit section pattern above).
- Add a 5th layer with a very large, very faint gradient for additional atmosphere.
- Combine with the grain-texture-svg pattern for added depth.

## Dependencies
- None -- CSS only
