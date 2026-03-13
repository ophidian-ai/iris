---
name: Overlay Blend Modes
category: color-treatments
complexity: moderate
dependencies: css-only
best-for: organic, farm, food, wellness, rustic, editorial, portfolio, card-grids
performance: "mix-blend-mode is GPU-composited. Minimal performance impact for static elements. Avoid animating blend-mode layers."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Overlay Blend Modes

## What It Does
Applies a color-tinted overlay to images using `mix-blend-mode: multiply`, giving each image a unique but cohesive color treatment. Different cards get different tint colors (rust, sage, berry), creating visual variety while maintaining a unified palette.

## When to Use
- Card grids where each card has a photo but you want a cohesive color story
- Portfolio or gallery layouts where photos from different sources need visual unity
- Image-heavy sections where raw photos feel too varied or chaotic
- Any design where you want images to feel "on brand" rather than stock-photo generic

## Visual Effect
Each image gets a transparent color wash that multiplies with the underlying photo. Multiply blend mode darkens the image through the tint color -- light areas pick up the tint strongly, dark areas stay dark. A rust tint warms the image, sage gives a cool/green cast, berry adds a reddish moodiness. Combined with a gradient overlay (dark-to-transparent from the bottom), the result is images that feel curated and intentional, like they were shot through a color filter.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Per-card tint classes (from `css/index.css`):**

```css
.card-img-tint-rust {
  background: rgba(200,90,58,.1);
  mix-blend-mode: multiply;
}
.card-img-tint-sage {
  background: rgba(122,155,142,.18);
  mix-blend-mode: multiply;
}
.card-img-tint-berry {
  background: rgba(139,58,58,.15);
  mix-blend-mode: multiply;
}
```

**Gradient overlay (bottom-to-top dark fade, from `css/index.css`):**

```css
.card-img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(74,51,34,.65) 0%, transparent 52%);
}
```

**Welcome section image tint (from `css/index.css`):**

```css
.welcome-image-tint {
  position: absolute;
  inset: 0;
  background: rgba(122,155,142,.16);
  mix-blend-mode: multiply;
}
.welcome-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(74,51,34,.55) 0%, transparent 50%);
}
```

**HTML structure for a treated image:**

```html
<div class="card-img-wrap">
  <img class="card-img" src="photo.jpg" alt="Description">
  <div class="card-img-overlay"></div>
  <div class="card-img-tint card-img-tint-rust"></div>
</div>
```

**Layer order (bottom to top):**

1. `<img>` -- the actual photograph
2. `.card-img-overlay` -- gradient overlay (dark at bottom for text legibility)
3. `.card-img-tint-*` -- color tint with mix-blend-mode: multiply

**Tint color assignments by purpose:**

| Tint | Color (RGBA) | Opacity | Feel | Best For |
|------|-------------|---------|------|----------|
| Rust | rgba(200,90,58,.10) | 10% | Warm, earthy | Bread, baked goods, warm subjects |
| Sage | rgba(122,155,142,.18) | 18% | Cool, fresh | Produce, greens, garden scenes |
| Berry | rgba(139,58,58,.15) | 15% | Rich, moody | Preserves, dark subjects, dramatic |

**Why multiply blend mode:**

- `multiply` darkens: white areas become the tint color, black stays black, mid-tones shift toward the tint
- This is more natural than `overlay` or `color` which can wash out or over-saturate
- At low opacity (0.10-0.18), the effect is subtle -- photos still look like photos, just with a color cast
- Works best on well-lit photos. Very dark photos won't show much effect.

## Customization
- Add more tint colors from any brand palette. Keep opacity between 0.08 (barely tinted) and 0.25 (strongly tinted).
- Replace `multiply` with `overlay` for a lighter, more vibrant effect (good for light-colored images).
- Remove the gradient overlay for images that don't have text over them.
- Increase gradient overlay opacity for better text readability over images.
- For a duotone effect, increase tint opacity to 0.6+ and use `color` blend mode instead of `multiply`.

## Dependencies
- None -- CSS only
