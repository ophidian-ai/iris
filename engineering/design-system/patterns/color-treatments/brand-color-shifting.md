---
name: Brand Color Shifting
category: color-treatments
complexity: moderate
dependencies: css-custom-properties, vanilla-js
best-for: tech, saas, agency, dark-themes, interactive-elements
performance: "HSL calculation happens in CSS via calc(). JS only sets a single --xp value. No repaints from color changes -- it's all in the gradient."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Brand Color Shifting

## What It Does
HSL hue rotation based on horizontal mouse position across the viewport, creating dynamic color variation in glow effects. Elements on the left side of the screen glow one hue while elements on the right shift to a different hue.

## When to Use
- Glow card grids where each card should feel slightly different
- Interactive backgrounds that respond to cursor position
- Any effect where static colors feel too uniform
- Creates visual variety without managing multiple color variables

## Visual Effect
As the cursor moves from left to right across the viewport, the glow hue shifts from green (hue 110) through the spectrum by up to 80 degrees (reaching teal/cyan at the right edge). Cards at different horizontal positions show different hue values, creating a natural color gradient across the layout. The shift is continuous and smooth since it's driven by CSS calc().

## Code Reference
**Starter component:** None

## Key Implementation Details

- JavaScript sets the normalized X position (0 to 1) as a CSS custom property:

```js
el.style.setProperty("--xp", (e.clientX / window.innerWidth).toFixed(2));
```

- CSS calculates the hue from the base + (position * spread):

```css
.glow-card {
  --base: 110;      /* green in HSL */
  --spread: 80;     /* degrees of hue shift across viewport */
  --hue: calc(var(--base) + (var(--xp, 0) * var(--spread, 0)));
  --saturation: 100;
  --lightness: 55;
}
```

- The computed hue is used in HSL color values within radial gradients:

```css
background-image: radial-gradient(
  var(--spotlight-size) var(--spotlight-size) at
  calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
  hsl(var(--hue) calc(var(--saturation) * 1%) calc(var(--lightness) * 1%) / var(--bg-spot-opacity)),
  transparent
);
```

- The OphidianAI brand cycle is: Venom Green (hue ~110) through Teal (hue ~190)
- With `--base: 110` and `--spread: 80`, the range is hue 110-190

## Customization
- `--base`: Set the starting hue. 0 = red, 60 = yellow, 110 = green, 200 = blue, 270 = purple.
- `--spread`: How many degrees to shift. 0 = no shift (static). 360 = full rainbow across viewport.
- `--saturation`: 100 = vivid, 50 = muted, 0 = grayscale.
- `--lightness`: 55 = balanced, higher = pastel, lower = deep.
- Use `--yp` instead of `--xp` for vertical color shifting.
- Combine both `--xp` and `--yp` for 2D color mapping:

```css
--hue: calc(var(--base) + (var(--xp, 0) * var(--spread-x, 0)) + (var(--yp, 0) * var(--spread-y, 0)));
```

- For a static (non-mouse-tracking) version, set `--xp` per card based on its grid position

## Dependencies
- Vanilla JS for the pointermove listener (sets `--xp`)
- CSS custom properties for the hue calculation
