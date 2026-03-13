---
name: Timeline Scroll Reveal
category: animations
complexity: moderate
dependencies: framer-motion
best-for: tech, saas, agency, portfolios, case-studies
performance: "Single useInView observer per timeline item. Blur filter transitions are GPU-composited. Lightweight."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Timeline Scroll Reveal

## What It Does
Timeline content items reveal with a blur-to-clear transition as they scroll into view, with staggered delays between sibling items.

## When to Use
- Process/timeline sections (e.g., "How It Works" steps)
- Feature lists that should reveal progressively
- Any vertically stacked content that benefits from scroll-triggered entrance
- Case study milestones or project phases

## Visual Effect
Each timeline item starts blurred (10px), shifted 20px upward, and fully transparent. When the element scrolls into the viewport (with a -100px margin trigger), it transitions to clear, aligned, and fully opaque over 0.5 seconds. Sibling items stagger with 0.4-second delays based on their `animationNum` index.

## Code Reference
**Starter component:** None

## Key Implementation Details

- Uses `useInView` from `motion/react` with a ref and margin offset:

```tsx
const isInView = useInView(timelineRef, { once: true, margin: "-100px" });
```

- Default animation variants:

```tsx
const defaultVariants: Variants = {
  hidden: {
    filter: "blur(10px)",
    y: -20,
    opacity: 0,
  },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.4,
      duration: 0.5,
    },
  }),
};
```

- The component accepts `animationNum` to control stagger position:

```tsx
<motion.div
  custom={animationNum}
  initial="hidden"
  animate={isInView ? "visible" : "hidden"}
  variants={variants}
/>
```

- The `timelineRef` is passed from the parent to share a single intersection observer reference point
- `once: true` ensures animation only plays on first scroll-in (no re-triggering)
- Supports `customVariants` override for different animation styles per section

## Customization
- Adjust `margin: "-100px"` to trigger earlier or later (more negative = triggers later)
- Change `delay: i * 0.4` to speed up or slow down stagger timing
- Replace blur transition with scale, rotate, or slide variants via `customVariants`
- Remove `once: true` for re-triggering animations on scroll up/down
- Pair with a vertical connector line (see ProcessSteps pattern) for timeline visuals:

```tsx
<div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
```

## Dependencies
- `motion/react` (Framer Motion v11+)
