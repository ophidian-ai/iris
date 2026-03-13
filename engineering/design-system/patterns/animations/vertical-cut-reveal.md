---
name: Vertical Cut Reveal
category: animations
complexity: advanced
dependencies: framer-motion
best-for: tech, saas, agency, dark-themes, text-heavy-sections
performance: "Uses motion/react spring animations. Each character/word is a separate motion.span -- keep text length reasonable for DOM count."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Vertical Cut Reveal

## What It Does
Text elements reveal with a vertical clip/slide animation where each word or character slides up (or down) from behind an overflow-hidden container, creating a "cut" reveal effect.

## When to Use
- Section headings that need dramatic entrances
- Hero text alternatives to word-by-word fade
- Animated labels, taglines, or quotes
- Anywhere you want text to appear to "slide into place" from behind a mask

## Visual Effect
Each word (or character) starts translated 100% below its container (hidden by `overflow: hidden`). A spring animation slides it into place with stagger delays between elements. The `reverse` option slides from above instead. The clipping container creates the "cut" illusion -- text appears to slide out from behind an invisible edge.

## Code Reference
**Starter component:** None

## Key Implementation Details

- Built as a React component using `motion/react` (Framer Motion):

```tsx
import { motion } from "motion/react";
```

- The animation variants:

```tsx
const variants = {
  hidden: { y: reverse ? "-100%" : "100%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      ...transition,
      delay: ((transition?.delay as number) || 0) + getStaggerDelay(i),
    },
  }),
};
```

- Each word/character is wrapped in a `<span className="inline-flex overflow-hidden">` -- this is the clipping mask
- Inside, a `<motion.span>` animates from `y: "100%"` to `y: 0`
- Default spring config: `{ type: "spring", stiffness: 190, damping: 22 }`
- Supports `splitBy`: `"words"`, `"characters"`, `"lines"`, or any custom delimiter
- Stagger options: `"first"`, `"last"`, `"center"`, `"random"`, or a specific index number
- Default stagger duration: `0.2s` between elements
- Exposes imperative handle via `ref` for manual control:

```tsx
export interface VerticalCutRevealRef {
  startAnimation: () => void;
  reset: () => void;
}
```

- Uses `Intl.Segmenter` for proper grapheme splitting (emoji-safe character splitting)

## Customization
- `splitBy="characters"` for letter-by-letter reveals
- `staggerFrom="center"` for a center-out cascade effect
- `staggerDuration` controls delay between elements (default 0.2s)
- `reverse={true}` slides text down from above instead of up from below
- `transition` accepts any motion/react `AnimationOptions` to override the spring
- `autoStart={false}` with ref control for scroll-triggered or event-triggered reveals
- Apply `wordLevelClassName` and `elementLevelClassName` for per-element styling

## Dependencies
- `motion/react` (Framer Motion v11+)
- `@/lib/utils` for `cn` class merging (optional, replaceable with clsx or template literals)
