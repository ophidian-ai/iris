---
name: Fade Up Stagger
category: animations
complexity: simple
dependencies: vanilla-js, css-custom-properties
best-for: organic, farm, food, wellness, rustic, corporate, portfolio, landing-page
performance: "Animates only opacity and transform. Intersection Observer fires once per element then unobserves. Minimal repaints."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Fade Up Stagger

## What It Does
Elements fade in from below (28px offset) with staggered timing as they scroll into view. Each sibling delays slightly longer than the previous, creating a cascading reveal.

## When to Use
- Section headings and body text that should animate on first scroll
- Card grids where each card appears sequentially
- Any group of 2-4 sibling elements that benefit from a cascading entrance
- Landing pages, feature sections, testimonial rows

## Visual Effect
Elements start invisible and shifted 28px down. As the viewport scrolls to them (10% visible), they glide upward to their natural position while fading to full opacity. The spring-style easing (cubic-bezier(.22,1,.36,1)) gives a smooth deceleration. Stagger classes add 0.1s, 0.2s, 0.3s delays between siblings, so the first element arrives, then the second, then the third.

## Code Reference
**Starter component:** None

## Key Implementation Details

**CSS (animation classes):**

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-up {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.75s cubic-bezier(.22,1,.36,1),
              transform 0.75s cubic-bezier(.22,1,.36,1);
}
.animate-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

.stagger-1 { transition-delay: .1s; }
.stagger-2 { transition-delay: .2s; }
.stagger-3 { transition-delay: .3s; }
```

**JS (Intersection Observer trigger):**

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

**HTML usage:**

```html
<h2 class="animate-fade-up stagger-1">Heading</h2>
<p class="animate-fade-up stagger-2">Body text here.</p>
<a class="animate-fade-up stagger-3" href="#">CTA Button</a>
```

- The `@keyframes fadeUp` definition is available for hero elements that animate immediately on page load (no scroll trigger needed), using `animation: fadeUp 1.1s cubic-bezier(.22,1,.36,1) both`.
- The `.animate-fade-up` class uses CSS transitions triggered by the `.visible` class, which is better for scroll-triggered animations because the observer controls the timing.
- The easing `cubic-bezier(.22,1,.36,1)` is a spring-style curve -- fast start, smooth deceleration. Used consistently across all Bloomin' Acres animations.

## Customization
- Adjust the `translateY` value (28px) for more or less dramatic entrance. 20px for subtle, 40px for dramatic.
- Change the transition duration (0.75s) to speed up or slow down. 0.5s feels snappy, 1.0s feels luxurious.
- Add more stagger classes (.stagger-4, .stagger-5) at 0.1s increments for longer sequences.
- The 10% threshold works well for most layouts. Increase to 0.2 or 0.3 if elements should be more visible before animating.

## Dependencies
- None -- CSS only for styles, vanilla JS for scroll detection
