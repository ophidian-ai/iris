---
name: Float Particles
category: animations
complexity: simple
dependencies: css-only
best-for: tech, saas, agency, dark-themes, hero-sections
performance: "Pure CSS animation on tiny 3px elements. Near-zero GPU cost. Uses animation-play-state for lazy activation."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Float Particles

## What It Does
Small circular dots float gently in a looping path, fading in and out of visibility, creating an ambient particle effect in the background.

## When to Use
- Hero section atmospheric decoration
- Dark-themed backgrounds that need subtle movement
- Behind glass cards or transparent overlays
- Any section that feels too static and needs organic motion

## Visual Effect
Tiny 3px dots (brand-colored) drift in a figure-eight-like path: up/right, then up/left, then further up/right, cycling over 8 seconds. Their opacity pulses between 0.2 and 0.8, making them appear to glow and fade as they float. Multiple particles at different positions with staggered delays create an organic, non-uniform field.

## Code Reference
**Starter component:** None

## Key Implementation Details

- The `@keyframes float` animation in `globals.css`:

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.2;
  }
  25% {
    transform: translateY(-10px) translateX(5px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-5px) translateX(-3px);
    opacity: 0.4;
  }
  75% {
    transform: translateY(-15px) translateX(7px);
    opacity: 0.8;
  }
}
```

- The `.floating-element` class:

```css
.floating-element {
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
  animation-play-state: paused;
}
```

- Particles are placed with inline styles and activated by setting `animationPlayState: "running"`:

```tsx
<div
  className="floating-element"
  style={{ top: "25%", left: "15%", animationDelay: "1.5s", animationPlayState: "running" }}
/>
```

- In the OphidianAI hero, 4 particles are placed at corners with delays of 1.5s, 2s, 2.5s, and 3s

## Customization
- Increase particle size for a bokeh effect (6-10px with added blur filter)
- Use `var(--color-accent)` for secondary color particles
- Add more particles for denser fields (8-12 is a good upper limit for performance)
- Adjust animation duration (8s default) -- shorter for energetic, longer for calm
- Change translateY range for more or less vertical travel
- Start paused and toggle `animationPlayState` via JS for scroll-activated particles

## Dependencies
- None -- CSS only
