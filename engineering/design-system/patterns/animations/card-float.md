---
name: Card Float
category: animations
complexity: simple
dependencies: css-only
best-for: tech, saas, dashboards, dark-themes, feature-showcases
performance: "Pure CSS translateY on will-change: transform. Extremely lightweight. Safe for 8+ simultaneous cards."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Card Float

## What It Does
Dashboard or feature cards gently bob up and down on an infinite loop, with staggered timing so adjacent cards move at different phases, creating a layered floating effect.

## When to Use
- Dashboard preview sections
- Feature card grids
- Pricing cards or comparison tables
- Any card layout that benefits from ambient motion

## Visual Effect
Each card rises 6px from its resting position and returns, over a 6-second cycle. Because each card has a different negative animation-delay offset, they float out of phase with each other -- some rising while others fall -- creating an organic, breathing rhythm across the grid.

## Code Reference
**Starter component:** None

## Key Implementation Details

- The `@keyframes card-float` animation in `globals.css`:

```css
@keyframes card-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
```

- The `.dashboard-card` class and stagger offsets:

```css
.dashboard-card {
  animation: card-float 6s ease-in-out infinite;
  animation-play-state: running;
}

.dashboard-card:nth-child(2) { animation-delay: -1s; }
.dashboard-card:nth-child(3) { animation-delay: -2s; }
.dashboard-card:nth-child(4) { animation-delay: -3s; }
.dashboard-card:nth-child(5) { animation-delay: -1.5s; }
.dashboard-card:nth-child(6) { animation-delay: -2.5s; }
.dashboard-card:nth-child(7) { animation-delay: -3.5s; }
.dashboard-card:nth-child(8) { animation-delay: -0.5s; }
```

- Negative delays start the animation partway through, so cards are already mid-float on load (no synchronized start)
- The pattern supports up to 8 cards with pre-defined offsets

## Customization
- Increase `translateY(-6px)` for more dramatic floating (try -10px to -15px)
- Shorten duration to 4s for more energetic movement, lengthen to 10s for subtlety
- Add `translateX` to the keyframes for lateral drift
- For more than 8 cards, extend the nth-child rules with additional offsets spaced 0.5-1s apart
- Combine with `hover:scale-105` for interactive lift on hover
- Add `animation-play-state: paused` and toggle via IntersectionObserver for scroll-activated floating

## Dependencies
- None -- CSS only
