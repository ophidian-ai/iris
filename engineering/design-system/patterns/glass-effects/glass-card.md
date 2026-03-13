---
name: Glass Card
category: glass-effects
complexity: simple
dependencies: css-only
best-for: tech, saas, agency, dark-themes, cards, modals, panels
performance: "backdrop-filter: blur(12px) is the main cost. Fine for 10-20 cards. Avoid layering multiple glass elements on top of each other."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Glass Card

## What It Does
A translucent card with a frosted glass effect using rgba background and backdrop-filter blur, with a subtle light border.

## When to Use
- Feature cards, service cards, pricing cards
- Content panels over gradient or image backgrounds
- Modal/dialog backdrops
- Any container that needs depth without solid backgrounds
- Used across both OphidianAI and Bloomin' Acres projects

## Visual Effect
The card has a dark translucent background (60% opacity) with a 12px backdrop blur that frosts whatever is behind it. A very subtle white border (6% opacity) provides edge definition. The combined effect creates depth and layering without completely hiding the background content.

## Code Reference
**Starter component:** `starters/glass-effects/glass-card.css`

## Key Implementation Details

- The `.glass` utility class in `globals.css`:

```css
.glass {
  background: rgba(22, 32, 50, 0.6);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

- When combined with glow cards, the border is made transparent so the glow border shows through:

```css
.glow-card.glass {
  border-color: transparent;
}
```

- The base surface color is `#162032` (--color-surface) at 60% opacity
- Border uses white at 6% opacity for a barely-visible edge

## Customization
- Increase background opacity (0.6 to 0.8) for less transparency / more readability
- Decrease to 0.3-0.4 for more transparency (works best over colorful backgrounds)
- Increase blur value for a heavier frost effect (16px-24px)
- Change border opacity to 0.1-0.15 for more visible edges
- Add `border-radius` (the class doesn't set one -- apply via Tailwind like `rounded-xl`)
- For light themes, use `rgba(255, 255, 255, 0.6)` background with dark border
- Layer with shadow classes for elevation:

```css
.glass {
  box-shadow: var(--shadow-card);
}
.glass:hover {
  box-shadow: var(--shadow-card-hover);
}
```

## Dependencies
- None -- CSS only
