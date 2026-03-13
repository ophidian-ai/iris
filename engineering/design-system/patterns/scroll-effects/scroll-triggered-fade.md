---
name: Scroll-Triggered Fade
category: scroll-effects
complexity: simple
dependencies: vanilla-js
best-for: any website, framework-agnostic scroll animations, progressive enhancement, lightweight sites
performance: "IntersectionObserver is highly efficient -- no scroll event listeners, no layout thrashing. Browser-native API with near-zero overhead."
source-project: general
last-validated: 2026-03-13
---

# Scroll-Triggered Fade

## What It Does
Elements fade in (and optionally slide up) when they scroll into the viewport. This is the foundational scroll animation pattern that most other scroll effects build on. Covers both vanilla JS (IntersectionObserver) and React (Framer Motion) approaches.

## When to Use
- Any website that needs scroll-triggered animations
- Static sites, WordPress, vanilla JS projects (use the IntersectionObserver approach)
- React/Next.js projects (use the Framer Motion approach -- see `framer-motion-scroll.md` for advanced patterns)
- When you want progressive enhancement -- content is visible without JS, animations are a bonus

## Visual Effect
Elements start invisible (or nearly invisible) and slightly below their final position. As the user scrolls them into view, they smoothly fade in and slide into place. The animation fires once and the element stays visible permanently.

## Code Reference
**Starter component:** None

## Key Implementation Details

### Vanilla JS -- IntersectionObserver (framework-agnostic)

**CSS setup:**

```css
/* Initial hidden state */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* Visible state -- applied by JS */
.fade-in.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Variant: fade from left */
.fade-in-left {
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in-left.is-visible {
  opacity: 1;
  transform: translateX(0);
}

/* Variant: fade from right */
.fade-in-right {
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in-right.is-visible {
  opacity: 1;
  transform: translateX(0);
}
```

**JavaScript:**

```js
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".fade-in, .fade-in-left, .fade-in-right");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Fire once only
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of element is visible
      rootMargin: "0px 0px -50px 0px", // Trigger slightly before full entry
    }
  );

  elements.forEach((el) => observer.observe(el));
});
```

**HTML usage:**

```html
<h2 class="fade-in">This heading fades in on scroll</h2>
<p class="fade-in" style="transition-delay: 0.1s">This paragraph fades in slightly after</p>
<div class="fade-in-left">This slides in from the left</div>
```

### Staggered children (vanilla JS)

```html
<div class="card-grid">
  <div class="fade-in" style="transition-delay: 0s">Card 1</div>
  <div class="fade-in" style="transition-delay: 0.1s">Card 2</div>
  <div class="fade-in" style="transition-delay: 0.2s">Card 3</div>
</div>
```

Or dynamically:

```js
document.querySelectorAll(".card-grid .fade-in").forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.1}s`;
});
```

### React -- Framer Motion (quick reference)

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  Content here
</motion.div>
```

See `scroll-effects/framer-motion-scroll.md` for the full Framer Motion pattern with stagger variants, container patterns, and transition tables.

### CSS-only approach (no JS at all)

Using `@starting-style` (modern browsers, 2024+):

```css
.fade-in-css {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;

  @starting-style {
    opacity: 0;
    transform: translateY(20px);
  }
}
```

Limitation: this triggers on element creation/display, not on scroll. Only useful for elements that are dynamically added to the DOM.

Using `animation-timeline: view()` (experimental, Chrome 115+):

```css
.scroll-fade {
  animation: fadeSlideUp linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

This is the future of scroll animations but browser support is limited as of early 2026. Use as progressive enhancement only.

### Observer configuration options

| Option | Value | Effect |
|--------|-------|--------|
| `threshold` | 0 | Trigger as soon as any pixel enters |
| `threshold` | 0.1 | Trigger when 10% visible (recommended) |
| `threshold` | 0.5 | Trigger when half visible |
| `rootMargin` | `"0px"` | Trigger at viewport edge |
| `rootMargin` | `"0px 0px -50px 0px"` | Trigger 50px before bottom edge |
| `rootMargin` | `"-20% 0px -60% 0px"` | Trigger in the middle 20% of viewport |

### Progressive enhancement

Always make content visible without JavaScript:

```html
<noscript>
  <style>
    .fade-in, .fade-in-left, .fade-in-right {
      opacity: 1 !important;
      transform: none !important;
    }
  </style>
</noscript>
```

Or use a JS-detected class:

```js
document.documentElement.classList.add("js-enabled");
```

```css
/* Only hide when JS is available */
.js-enabled .fade-in {
  opacity: 0;
  transform: translateY(20px);
}
```

## Customization
- **Distance:** 20px is subtle, 30-40px is noticeable, 60px+ is dramatic. Keep it under 40px for most use cases.
- **Duration:** 0.4-0.6s for standard elements, 0.8-1.0s for hero/featured elements.
- **Easing:** `ease` or `ease-out` for natural deceleration. `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for a custom soft ease.
- **Stagger delay:** 0.08-0.15s between items in a group.
- **Direction:** `translateY(20px)` for bottom-up, `translateX(-20px)` for left-in, `translateX(20px)` for right-in.
- **Threshold:** Lower values (0.05-0.1) trigger earlier (better for content below the fold). Higher values (0.3-0.5) wait until more of the element is visible (better for important elements).

## Dependencies
- **Vanilla JS:** None -- IntersectionObserver is a browser-native API (supported in all modern browsers)
- **React:** `framer-motion` for the declarative approach
- **CSS-only (experimental):** No dependencies, but limited browser support for `animation-timeline: view()`
