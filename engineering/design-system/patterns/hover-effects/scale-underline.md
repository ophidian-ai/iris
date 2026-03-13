---
name: Scale Underline
category: hover-effects
complexity: simple
dependencies: framer-motion
best-for: section headings, decorative dividers, scroll-triggered reveals, accent elements
performance: "Transform-based animation uses GPU compositing. No layout reflows. Very lightweight."
source-project: point-of-hope-church-mockup
last-validated: 2026-03-13
---

# Scale Underline

## What It Does
An accent-colored underline bar that animates from zero width to full width using `scaleX`, triggered on scroll-into-view. Creates a polished reveal effect under section headings.

## When to Use
- Section heading decorations that animate on scroll
- Divider lines that need to feel dynamic rather than static
- Any accent element where a directional "draw-in" effect adds polish
- Pairing with a fade-in heading for a coordinated entrance

## Visual Effect
A thin horizontal bar (typically 1px tall, ~80px wide) starts invisible and scaled to zero width. When the element scrolls into the viewport, it smoothly expands from left to right (or center, depending on `transform-origin`). The animation fires once and stays in its final state. Combined with a heading fade-in above it, the effect feels like the heading "writes" its own underline.

## Code Reference
**Starter component:** None

## Key Implementation Details

The POHC project uses Framer Motion's `whileInView` with `scaleX`:

```tsx
<motion.div
  initial={{ opacity: 0, scaleX: 0 }}
  whileInView={{ opacity: 1, scaleX: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: 0.1 }}
  className="mx-auto mt-4 h-1 w-20 bg-[#f0b012]"
/>
```

Key properties:
- `scaleX: 0` to `scaleX: 1` -- scales width without triggering layout reflow
- `opacity: 0` to `opacity: 1` -- prevents a thin sliver from showing at scaleX near-zero
- `viewport={{ once: true }}` -- animates only the first time it enters the viewport
- `delay: 0.1` -- slightly after the heading fade-in for a staggered feel

For a left-to-right directional animation (instead of center-out), add `transform-origin`:

```tsx
<motion.div
  initial={{ opacity: 0, scaleX: 0 }}
  whileInView={{ opacity: 1, scaleX: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: 0.1 }}
  className="mt-4 h-1 w-20 bg-[#f0b012]"
  style={{ transformOrigin: "left" }}
/>
```

CSS-only alternative using hover:

```css
.underline-hover {
  position: relative;
}

.underline-hover::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent-color, #f0b012);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.underline-hover:hover::after {
  transform: scaleX(1);
}
```

Standard section heading pattern from POHC (heading + underline + subtitle):

```tsx
<div className="mb-14 text-center">
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="text-3xl font-bold sm:text-4xl lg:text-5xl"
  >
    Section Title
  </motion.h2>
  <motion.div
    initial={{ opacity: 0, scaleX: 0 }}
    whileInView={{ opacity: 1, scaleX: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="mx-auto mt-4 h-1 w-20 bg-[#f0b012]"
  />
  <motion.p
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.15 }}
    className="mt-4 text-lg"
  >
    Subtitle text here
  </motion.p>
</div>
```

## Customization
- **Color:** Change `bg-[#f0b012]` to any brand accent color.
- **Width:** Adjust `w-20` (80px). Use `w-16` for subtler, `w-32` for bolder.
- **Height:** `h-1` (4px) is standard. Use `h-0.5` (2px) for refined, `h-1.5` (6px) for chunky.
- **Direction:** Default is center-out. Add `style={{ transformOrigin: "left" }}` for left-to-right, or `"right"` for right-to-left.
- **Timing:** Increase `delay` to stagger further behind the heading. Increase `duration` for a slower draw.
- **Centering:** `mx-auto` centers the bar under centered text. Remove for left-aligned headings.

## Dependencies
- `framer-motion` (for scroll-triggered variant)
- None for the CSS-only hover variant
