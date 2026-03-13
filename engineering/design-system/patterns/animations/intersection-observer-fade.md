---
name: Intersection Observer Fade
category: animations
complexity: simple
dependencies: vanilla-js
best-for: organic, farm, food, wellness, rustic, corporate, portfolio, landing-page
performance: "Single observer instance handles all animated elements. Each element is unobserved after triggering, so the observer does zero work after all elements have appeared."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Intersection Observer Fade

## What It Does
A reusable vanilla JS utility that watches elements with a specific class and adds a trigger class when they scroll into view. This is the engine behind all scroll-triggered animations in non-React projects.

## When to Use
- Any static HTML site that needs scroll-triggered animations
- When you want a single, lightweight observer instead of per-element scroll listeners
- As the foundation layer that pairs with CSS animation classes (fade-up-stagger, slide-in, etc.)
- When you need "animate once" behavior (element animates on first appearance, never resets)

## Visual Effect
No visual effect on its own. This is the trigger mechanism. It watches for elements entering the viewport and adds a `.visible` class, which CSS transitions then respond to. The observer fires once per element and then stops watching it.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Core pattern (from Bloomin' Acres `js/index.js`):**

```js
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.animate-fade-up').forEach(el => observer.observe(el));
});
```

**Extended version for multiple animation classes:**

```js
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );

  // Observe all elements with scroll-triggered animation classes
  const selectors = '.animate-fade-up, .animate-slide-in, .animate-scale-up';
  document.querySelectorAll(selectors).forEach(el => observer.observe(el));
});
```

**Key design decisions in Bloomin' Acres implementation:**

- `threshold: 0.1` -- triggers when 10% of the element is visible. Low enough that elements animate before users notice they were hidden, high enough to prevent premature triggers.
- `observer.unobserve(e.target)` -- critical for performance. Once an element has animated in, stop watching it. This means animations only fire once (no re-animation on scroll back up).
- `DOMContentLoaded` -- ensures all HTML is parsed before querying elements. The observer itself is lazy (only fires when elements enter viewport).
- Single observer instance -- all animated elements share one observer. IntersectionObserver is designed to handle many entries efficiently.

**CSS contract:**

The observer adds `.visible` to any element it triggers. CSS must define both the "hidden" state (on the base class) and the "visible" state:

```css
/* Hidden state */
.animate-fade-up {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.75s cubic-bezier(.22,1,.36,1),
              transform 0.75s cubic-bezier(.22,1,.36,1);
}

/* Revealed state */
.animate-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

## Customization
- Change `threshold` to control when animation fires (0.0 = any pixel visible, 1.0 = fully visible)
- Add `rootMargin: '0px 0px -50px 0px'` to trigger slightly before elements reach the viewport edge
- For re-animating on scroll (e.g., progress bars), remove the `observer.unobserve()` call and add logic to remove `.visible` when `!e.isIntersecting`
- For React projects, replace with `useIntersectionObserver` hook or Framer Motion's `whileInView`

## Dependencies
- None -- uses the native `IntersectionObserver` API (supported in all modern browsers)
