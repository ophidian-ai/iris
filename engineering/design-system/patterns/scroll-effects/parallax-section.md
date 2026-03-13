---
name: Parallax Section
category: scroll-effects
complexity: moderate
dependencies: css-only
best-for: hero backgrounds, section dividers, storytelling pages, immersive experiences, portfolio sites
performance: "CSS background-attachment: fixed is GPU-composited on desktop but disabled on most mobile browsers. JS-based parallax using transform is more consistent but requires requestAnimationFrame for smooth results."
source-project: general
last-validated: 2026-03-13
---

# Parallax Section

## What It Does
Background content moves at a different speed than foreground content as the user scrolls, creating a depth illusion. The background appears to drift slowly while the content scrolls at normal speed.

## When to Use
- Hero sections or banner images that should feel immersive
- Section dividers with background images between content blocks
- Storytelling or editorial pages where depth enhances the narrative
- Portfolio or agency sites where visual polish matters
- Full-width image breaks between text-heavy sections

## Visual Effect
As the user scrolls down, the background image appears to move slower than the page content, creating a 3D depth effect. The foreground content scrolls over the background at normal speed, while the background drifts at a fraction of the scroll rate. This makes the page feel layered and dimensional.

## Code Reference
**Starter component:** None

## Key Implementation Details

### CSS-only approach (simplest)

```html
<section class="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
  style="background-image: url('/parallax-bg.jpg');
         background-attachment: fixed;
         background-position: center;
         background-size: cover;">

  <!-- Optional overlay -->
  <div class="absolute inset-0 bg-black/40"></div>

  <!-- Content -->
  <div class="relative z-10 text-center text-white px-4">
    <h2 class="text-4xl font-bold">Section Title</h2>
    <p class="mt-4 text-lg">Supporting text</p>
  </div>
</section>
```

Key property: `background-attachment: fixed` -- the background stays fixed relative to the viewport while the section scrolls, creating the parallax illusion.

**Limitation:** `background-attachment: fixed` is ignored on iOS Safari and most mobile browsers. The background falls back to normal scrolling behavior. This is a known platform limitation, not a bug.

### CSS-only with mobile fallback

```css
.parallax-section {
  background-image: url('/parallax-bg.jpg');
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  min-height: 60vh;
}

/* Disable fixed attachment on touch devices */
@media (hover: none) {
  .parallax-section {
    background-attachment: scroll;
    /* Slightly zoom for visual interest without parallax */
    background-size: 110%;
  }
}
```

### JS-based parallax (cross-platform, smooth)

```html
<section class="parallax-container relative min-h-[60vh] overflow-hidden">
  <div class="parallax-bg absolute inset-0 -top-[20%] -bottom-[20%]">
    <img src="/parallax-bg.jpg" alt="" class="h-full w-full object-cover" />
  </div>
  <div class="relative z-10 flex min-h-[60vh] items-center justify-center">
    <h2 class="text-4xl font-bold text-white">Content</h2>
  </div>
</section>
```

```js
document.addEventListener("DOMContentLoaded", () => {
  const parallaxElements = document.querySelectorAll(".parallax-bg");

  function updateParallax() {
    const scrollY = window.scrollY;

    parallaxElements.forEach((el) => {
      const container = el.closest(".parallax-container");
      const rect = container.getBoundingClientRect();
      const speed = 0.3; // 0 = no movement, 1 = normal scroll speed

      // Only animate when section is in viewport
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = (rect.top * speed);
        el.style.transform = `translateY(${offset}px)`;
      }
    });

    requestAnimationFrame(updateParallax);
  }

  requestAnimationFrame(updateParallax);
});
```

Key points:
- The background element is taller than its container (`-top-[20%] -bottom-[20%]`) to prevent gaps during scroll
- `speed` controls parallax intensity: 0.3 means the background moves at 30% of scroll speed
- `requestAnimationFrame` ensures smooth 60fps animation
- Viewport check prevents unnecessary calculations for off-screen elements

### React + Framer Motion approach

```tsx
"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";

function ParallaxSection({ children, imageUrl }: {
  children: React.ReactNode;
  imageUrl: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Background moves 20% of scroll distance
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative min-h-[60vh] overflow-hidden">
      <motion.div
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
        style={{ y }}
      >
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
        {children}
      </div>
    </section>
  );
}
```

- `useScroll` with `target` tracks the section's position relative to the viewport
- `useTransform` maps scroll progress (0 to 1) to a Y translation range
- `offset: ["start end", "end start"]` means tracking starts when the section's top reaches the viewport bottom and ends when the section's bottom passes the viewport top

### Performance guidelines

| Approach | Desktop | Mobile | Smoothness | Complexity |
|----------|---------|--------|------------|------------|
| `background-attachment: fixed` | Good | Disabled | Excellent | None |
| JS + `transform` | Good | Good | Good (needs rAF) | Low |
| Framer Motion `useScroll` | Good | Good | Excellent | Low |
| Scroll-driven animations (CSS) | Excellent | Limited | Excellent | None |

**Performance rules:**
- Always use `transform: translateY()`, never `top` or `margin-top` (avoids layout thrashing)
- Use `will-change: transform` on the parallax element for GPU compositing
- Limit to 2-3 parallax sections per page
- Use `overflow: hidden` on the container to prevent background overflow
- Test on low-end mobile devices -- parallax can cause jank on weak GPUs

### Experimental: CSS Scroll-Driven Animations (Chrome 115+)

```css
.parallax-bg {
  animation: parallax-shift linear both;
  animation-timeline: view();
  animation-range: entry 0% exit 100%;
}

@keyframes parallax-shift {
  from { transform: translateY(-10%); }
  to { transform: translateY(10%); }
}
```

Best performance of all approaches but limited browser support.

## Customization
- **Speed:** Lower values (0.1-0.3) for subtle depth, higher (0.5-0.7) for dramatic effect. Never go above 0.8 -- it looks unnatural.
- **Direction:** Use `translateX` instead of `translateY` for horizontal parallax.
- **Overlay:** Adjust `bg-black/40` opacity. Darker overlays (50-60%) for text readability, lighter (20-30%) for showcase images.
- **Section height:** `min-h-[60vh]` is standard for divider sections, `min-h-screen` for full-page parallax.
- **Background overflow:** Increase the negative top/bottom margins on the background element if gaps appear during fast scrolling. 20% overflow is usually sufficient.
- **Disable on mobile:** Use `@media (hover: none)` or `@media (max-width: 768px)` to fall back to a static background on mobile.

## Dependencies
- **CSS-only:** None
- **JS approach:** None (vanilla IntersectionObserver + requestAnimationFrame)
- **React approach:** `framer-motion` (v10+)
