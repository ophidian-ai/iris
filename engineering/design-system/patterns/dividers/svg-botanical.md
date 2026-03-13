---
name: SVG Botanical
category: dividers
complexity: moderate
dependencies: css-only
best-for: organic, farm, food, wellness, rustic, artisan, garden, natural
performance: "SVG images are lightweight (typically 1-5KB each). Positioned absolutely so they don't affect layout reflow. pointer-events:none prevents interaction cost."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# SVG Botanical

## What It Does
Uses hand-drawn SVG botanical elements (wheat stalks, plant sprigs, leaf motifs) as section dividers and decorative accents. Each element is positioned with unique opacity and rotation values, creating an organic, hand-placed feel.

## When to Use
- Farm, garden, food, or wellness brands
- Section transitions where a horizontal rule or simple line feels too generic
- Corner decorations on hero sections or feature areas
- Watermark-style background accents in content sections
- Any design where botanical/nature imagery reinforces the brand

## Visual Effect
Delicate botanical line art (wheat stalks, sprigs, seedlings) appears between sections or in corners. Each instance has its own opacity level (0.06-0.20) and rotation, so no two placements look identical. The low opacity keeps them decorative without competing with content. When used as corner sprigs in the hero section, they frame the content like a natural border. When used between sections (like the welcome wheat divider), they provide a graceful visual break.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Hero corner sprigs (from `css/index.css`):**

```css
.hero-sprig {
  position: absolute;
  pointer-events: none;
}
.hero-sprig-tl {
  top: 2.5rem;
  left: 2.5rem;
  opacity: .2;
  transform: rotate(-12deg);
}
.hero-sprig-tr {
  top: 2rem;
  right: 2.5rem;
  opacity: .16;
  transform: rotate(18deg) scaleX(-1);
}
.hero-sprig-br {
  bottom: 5rem;
  right: 3rem;
  opacity: .14;
  transform: rotate(155deg);
}
.hero-sprig-bl {
  bottom: 4rem;
  left: 3rem;
  opacity: .11;
  transform: rotate(195deg) scaleX(-1);
}
```

**Section wheat divider (from `css/index.css`):**

```css
.welcome-wheat-divider {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}
```

**Watermark sprout (from `css/index.css`):**

```css
.welcome-sprout-watermark {
  position: absolute;
  right: -2rem;
  bottom: -3rem;
  width: 290px;
  opacity: .06;
  transform: rotate(8deg);
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
}
```

**HTML structure for corner sprigs:**

```html
<section class="hero-section">
  <!-- Corner botanicals -->
  <img class="hero-sprig hero-sprig-tl" src="brand-assets/sprig.svg" alt="" width="120">
  <img class="hero-sprig hero-sprig-tr" src="brand-assets/sprig.svg" alt="" width="100">
  <img class="hero-sprig hero-sprig-br" src="brand-assets/sprig.svg" alt="" width="90">
  <img class="hero-sprig hero-sprig-bl" src="brand-assets/sprig.svg" alt="" width="80">

  <!-- Main content -->
  <div class="hero-content">...</div>
</section>
```

**HTML structure for section dividers:**

```html
<div class="welcome-wheat-divider">
  <img src="brand-assets/wheat-divider.svg" alt="" width="180">
</div>
```

**Placement strategy:**

| Position | Opacity | Rotation | Size | Purpose |
|----------|---------|----------|------|---------|
| Top-left corner | 0.20 | -12deg | 120px | Strongest, anchors the eye |
| Top-right corner | 0.16 | 18deg, scaleX(-1) | 100px | Mirror of TL, slightly softer |
| Bottom-right corner | 0.14 | 155deg | 90px | Fading, smaller |
| Bottom-left corner | 0.11 | 195deg, scaleX(-1) | 80px | Softest, smallest |
| Section divider (centered) | 1.0 (SVG controls tone) | 0deg | 180px | Full opacity but subtle SVG |
| Watermark (background) | 0.06 | 8deg | 290px | Barely visible, large |

**Key techniques:**

- `scaleX(-1)` mirrors the same SVG asset horizontally, so you only need one sprout/sprig file
- Varying opacity per corner prevents the decoration from feeling mechanical or stamped
- `pointer-events: none` and `user-select: none` ensure decorative elements never interfere with interaction
- `alt=""` on decorative images keeps screen readers from announcing them

## Customization
- Replace wheat/sprout SVGs with any botanical: olive branches, lavender, ferns, flowers, vines
- For non-organic brands, the same technique works with geometric or abstract SVGs (dots, lines, shapes)
- Adjust opacity range: 0.03-0.10 for very subtle, 0.15-0.30 for more visible
- For dark backgrounds, use light-colored SVGs (white/cream strokes). For light backgrounds, use dark SVGs (earth tones).
- Add CSS transitions to opacity for a fade-in effect when the section scrolls into view

## Dependencies
- SVG image files (project-specific botanical illustrations)
- No JavaScript required -- pure CSS positioning
