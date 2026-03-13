---
name: Glass Button
category: glass-effects
complexity: moderate
dependencies: css-only
best-for: tech, saas, agency, dark-themes, cta-buttons
performance: "backdrop-filter blur + 2 pseudo-elements. Keep to 2-4 glass buttons per viewport for best performance."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Glass Button

## What It Does
A pill-shaped button with frosted glass styling, inner highlight gradient, hover shimmer sweep, and a floating shadow element that appears on hover.

## When to Use
- Primary and secondary CTAs
- Hero section action buttons
- Anywhere a prominent, interactive glass-styled button is needed
- Dark backgrounds where the translucent effect is most visible

## Visual Effect
Resting state: translucent green-tinted pill button with 12px backdrop blur, subtle border, and inner diagonal highlight. Hover: border brightens, background intensifies, a green shimmer band sweeps left-to-right, and a blurred shadow glows beneath. Active: button scales down to 0.97 for press feedback. Text has a persistent soft green glow.

## Code Reference
**Starter component:** `starters/hover-effects/glass-button.tsx`

## Key Implementation Details

- Layered construction (4 visual layers):
  1. `.glass-button` -- the main element with background gradient and backdrop blur
  2. `.glass-button::before` -- inner highlight (white diagonal gradient)
  3. `.glass-button::after` -- shimmer sweep band (hidden left, slides right on hover)
  4. `.glass-button-shadow` -- floating blur shadow beneath (fades in on hover)

- The full-pill radius: `border-radius: 9999px`
- Shimmer sweep mechanism:

```css
.glass-button::after {
  left: -100%;          /* hidden off-screen left */
  transition: left 0.5s ease;
}
.glass-button:hover::after {
  left: 100%;           /* sweeps across and exits right */
}
```

- Shadow element (sibling, not pseudo-element):

```css
.glass-button-shadow {
  opacity: 0;
  background: radial-gradient(ellipse at center, var(--glass-shadow) 0%, transparent 70%);
  filter: blur(16px);
  transform: translateY(6px);
}
.glass-button-wrap:hover .glass-button-shadow {
  opacity: 0.6;
}
```

- The React component supports size variants (`default`, `sm`, `lg`, `icon`) and an optional `href` prop that wraps in an `<a>` tag

## Customization
- Swap all `rgba(57, 255, 20, ...)` references to your brand color
- Remove `::after` for no shimmer effect
- Set `backdrop-filter: blur(0)` for a non-frosted transparent button
- Change `border-radius: 9999px` to `0.75rem` for a rounded-rectangle variant
- Add `animation: pulse-glow 3s ease-in-out infinite` for a breathing glow effect on the button
- The `--glass-*` custom properties make re-theming straightforward

## Dependencies
- `class-variance-authority` (optional, for size variants in the React component)
- CSS is fully self-contained
