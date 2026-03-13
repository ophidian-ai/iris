---
name: Framer Motion Scroll Animations
category: scroll-effects
complexity: moderate
dependencies: framer-motion
best-for: React/Next.js projects, card grids, section reveals, staggered content entrances
performance: "Uses IntersectionObserver internally. once:true prevents re-triggering. Stagger delays add minimal overhead. Keep animated elements under 20 per viewport."
source-project: point-of-hope-church-mockup
last-validated: 2026-03-13
---

# Framer Motion Scroll Animations

## What It Does
Uses Framer Motion's `whileInView` prop to trigger fade/slide animations when elements scroll into the viewport. Elements animate once and stay in their final position. Card grids use staggered delays for a cascading entrance effect.

## When to Use
- Any React/Next.js project where content should animate on scroll
- Section headings, paragraphs, and decorative elements entering the viewport
- Card grids where items should appear one after another
- When you need a consistent, reusable scroll animation pattern across a site

## Visual Effect
Elements start invisible and slightly below their final position. As the user scrolls them into view, they fade in and slide up smoothly. In card grids, each card animates in sequence with a short delay between them, creating a cascading "waterfall" effect from left to right (or top to bottom on mobile).

## Code Reference
**Starter component:** None

## Key Implementation Details

### Basic element fade-in (heading, paragraph, image)

```tsx
<motion.h2
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  Section Title
</motion.h2>
```

- `initial` -- starting state (invisible, 20px below final position)
- `whileInView` -- target state when element enters the viewport
- `viewport={{ once: true }}` -- animate only on first scroll-in, never re-animate
- `transition={{ duration: 0.5 }}` -- half-second ease (Framer Motion defaults to spring, but duration forces a tween)

### Staggered card grid

Map over an array with index-based delay:

```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {items.map((item, i) => (
    <motion.div
      key={item.title}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      className="rounded-xl border bg-white p-6 shadow-sm"
    >
      {/* Card content */}
    </motion.div>
  ))}
</div>
```

- `delay: i * 0.1` -- each card waits 100ms longer than the previous one
- POHC uses `0.1` for 4-column grids and `0.12` for 3-column grids
- Keep delay multiplier between 0.08 and 0.15 for natural feel

### Container + children stagger variant (Hero pattern)

For more complex stagger choreography, use Framer Motion variants:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

<motion.section
  initial="hidden"
  animate="visible"
  variants={containerVariants}
>
  <motion.h1 variants={itemVariants}>Title</motion.h1>
  <motion.p variants={itemVariants}>Description</motion.p>
  <motion.a variants={itemVariants}>CTA Button</motion.a>
</motion.section>
```

- `staggerChildren: 0.15` -- 150ms between each child animation start
- `delayChildren: 0.2` -- wait 200ms before the first child starts
- Children only need `variants={itemVariants}` -- they inherit `initial` and `animate` from the parent

### Custom variant with index (Social cards pattern)

```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

<motion.div
  custom={i}
  variants={cardVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-40px" }}
/>
```

- `custom={i}` passes the index to the variant function
- `viewport={{ margin: "-40px" }}` triggers slightly before the element fully enters the viewport

### Common transition values from POHC

| Element | y offset | duration | delay pattern |
|---------|----------|----------|---------------|
| Headings | 20px | 0.5s | 0 |
| Underline bars | scaleX: 0 | 0.5s | 0.1s |
| Subtitles | 16px | 0.5s | 0.15s |
| Cards (3-col) | 24px | 0.5s | i * 0.12 |
| Cards (4-col) | 24px | 0.5s | i * 0.1 |
| Full sections | 24px | 0.6s | 0 |
| Follow-up elements | 16px | 0.5s | 0.3s |

## Customization
- **Y offset:** 16-30px is the sweet spot. Larger values feel more dramatic, smaller feel subtle.
- **Duration:** 0.4-0.6s for most elements. Go longer (0.8s) for hero elements.
- **Stagger delay:** 0.08-0.15 per item. Faster for many items, slower for few items.
- **Easing:** Framer Motion defaults to spring. Use `ease: "easeOut"` for predictable timing, or let spring handle it for bouncy feel.
- **Direction:** Replace `y: 20` with `x: -20` for slide-from-left, `x: 20` for slide-from-right.
- **Scale:** Add `scale: 0.95` to `initial` for a zoom-in effect alongside the fade.
- **Viewport margin:** Use `margin: "-80px"` to trigger earlier (before element fully enters viewport).

## Dependencies
- `framer-motion` (v10+ recommended)
- Must be used in client components (`"use client"` directive in Next.js App Router)
