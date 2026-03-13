---
name: Mouse-Tracking Glow
category: hover-effects
complexity: advanced
dependencies: css-custom-properties, vanilla-js
best-for: tech, saas, agency, dark-themes, card-grids
performance: "Uses pointermove on document level (single listener). CSS custom properties drive radial gradients. mask-composite for border glow. GPU-composited."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Mouse-Tracking Glow

## What It Does
Cards display a glowing border and background spotlight that follows the user's cursor position. The glow color shifts across the viewport using HSL hue rotation.

## When to Use
- Feature cards, pricing cards, service cards
- Interactive grid layouts
- Any card that needs a premium, interactive feel
- Dark-themed UIs where glow effects are visible

## Visual Effect
As the cursor moves over a card, a radial gradient spotlight follows the pointer position on both the card background (subtle) and the card border (bright). The border glow uses mask-composite to only show the gradient within the border region. The hue shifts based on horizontal cursor position across the viewport -- cards on the left glow green, cards on the right shift toward teal/blue.

## Code Reference
**Starter component:** `starters/hover-effects/glow-card.tsx`

## Key Implementation Details

- CSS custom properties drive everything. The JS only sets `--x`, `--y`, `--xp`, `--yp`:

```tsx
const syncPointer = (e: PointerEvent) => {
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--x", (e.clientX - rect.left).toFixed(2));
  el.style.setProperty("--xp", (e.clientX / window.innerWidth).toFixed(2));
  el.style.setProperty("--y", (e.clientY - rect.top).toFixed(2));
  el.style.setProperty("--yp", (e.clientY / window.innerHeight).toFixed(2));
};
document.addEventListener("pointermove", syncPointer);
```

- The `.glow-card` class defines the HSL hue calculation and background spotlight:

```css
.glow-card {
  --border-size: 2px;
  --spotlight-size: 250px;
  --base: 110;        /* starting hue (green) */
  --spread: 80;       /* hue range to shift across viewport */
  --hue: calc(var(--base) + (var(--xp, 0) * var(--spread, 0)));
  --saturation: 100;
  --lightness: 55;
  --bg-spot-opacity: 0.08;
  --border-spot-opacity: 0.8;
  background-image: radial-gradient(
    var(--spotlight-size) var(--spotlight-size) at
    calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
    hsl(var(--hue) calc(var(--saturation) * 1%) calc(var(--lightness) * 1%) / var(--bg-spot-opacity)),
    transparent
  );
}
```

- Border glow uses `::before` and `::after` pseudo-elements with `mask-composite: intersect`:

```css
[data-glow]::before,
[data-glow]::after {
  content: "";
  position: absolute;
  inset: calc(var(--border-size, 2px) * -1);
  border: var(--border-size, 2px) solid transparent;
  border-radius: calc(var(--radius, 12) * 1px);
  mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
}
```

- `::before` renders the colored border glow (with `filter: brightness(2)`)
- `::after` renders a white highlight for extra definition
- A nested `[data-glow] > [data-glow]` element provides the outer soft blur halo

- The React component structure:

```tsx
<div ref={cardRef} data-glow className={`glow-card ${className}`}>
  <div data-glow aria-hidden="true" />  {/* outer blur halo */}
  {children}
</div>
```

## Customization
- `--base`: Starting hue. 110 = green. Set to 200 for blue, 0 for red.
- `--spread`: How many degrees the hue shifts across the viewport. 0 = no shift (static color).
- `--spotlight-size`: Radius of the glow spotlight. Larger = softer, wider glow.
- `--bg-spot-opacity`: Background spotlight intensity (0.08 is subtle).
- `--border-spot-opacity`: Border glow brightness (0.8 is prominent).
- `--border-size`: Border thickness. Thicker = more visible glow border.
- When using with `.glass`, set `border-color: transparent` so the glow border shows through.

## Dependencies
- None -- CSS custom properties + vanilla JS pointermove listener
