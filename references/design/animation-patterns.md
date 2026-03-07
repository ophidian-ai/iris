# Animation Patterns

Reusable animation patterns for Professional tier client websites. Use these for scroll effects, page transitions, and interactive elements. Keep animations subtle and purposeful -- they should enhance the experience, not distract from content.

## CSS-Only Patterns

### Fade In on Scroll

Using Intersection Observer + CSS transitions. Lightweight, no library needed.

```css
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
```

### Staggered Children

Children elements appear one after another. Each child gets a progressively longer delay.

```css
.stagger-container .stagger-item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.stagger-container .stagger-item.visible {
  opacity: 1;
  transform: translateY(0);
}

.stagger-container .stagger-item:nth-child(1) { transition-delay: 0ms; }
.stagger-container .stagger-item:nth-child(2) { transition-delay: 100ms; }
.stagger-container .stagger-item:nth-child(3) { transition-delay: 200ms; }
.stagger-container .stagger-item:nth-child(4) { transition-delay: 300ms; }
.stagger-container .stagger-item:nth-child(5) { transition-delay: 400ms; }
.stagger-container .stagger-item:nth-child(6) { transition-delay: 500ms; }
```

```js
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const children = entry.target.querySelectorAll('.stagger-item');
      children.forEach(child => child.classList.add('visible'));
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stagger-container').forEach(el => staggerObserver.observe(el));
```

For more than 6 children, use JS to set delays dynamically:

```js
const container = document.querySelector('.stagger-container');
const items = container.querySelectorAll('.stagger-item');
items.forEach((item, index) => {
  item.style.transitionDelay = `${index * 100}ms`;
});
```

### Smooth Hover Effects

Button and card hover states with scale, shadow, and color transitions.

**Button hover:**

```css
.btn-hover {
  display: inline-block;
  padding: 12px 28px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
}

.btn-hover:hover {
  background: #16213e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-hover:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**Card hover:**

```css
.card-hover {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### Hero Text Reveal

Text slides up and fades in on page load. Apply to the hero heading and subtext.

```css
.hero-reveal {
  opacity: 0;
  transform: translateY(30px);
  animation: heroReveal 0.8s ease forwards;
}

.hero-reveal:nth-child(2) {
  animation-delay: 0.2s;
}

.hero-reveal:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes heroReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

```html
<section class="hero">
  <h1 class="hero-reveal">Your Headline Here</h1>
  <p class="hero-reveal">Supporting subtext goes here.</p>
  <a href="#" class="hero-reveal btn-hover">Get Started</a>
</section>
```

### Image Reveal

Image slides into view with a colored overlay that wipes away.

```css
.image-reveal {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.image-reveal img {
  display: block;
  width: 100%;
  opacity: 0;
  transition: opacity 0.01s ease 0.6s;
}

.image-reveal::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1a1a2e;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
}

.image-reveal.visible img {
  opacity: 1;
}

.image-reveal.visible::after {
  animation: imageWipe 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

@keyframes imageWipe {
  0% {
    transform: scaleX(0);
    transform-origin: left;
  }
  50% {
    transform: scaleX(1);
    transform-origin: left;
  }
  50.01% {
    transform-origin: right;
  }
  100% {
    transform: scaleX(0);
    transform-origin: right;
  }
}
```

```js
const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      imgObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.image-reveal').forEach(el => imgObserver.observe(el));
```

```html
<div class="image-reveal">
  <img src="photo.jpg" alt="Description" />
</div>
```

## Tailwind CSS Patterns

Achieving the same effects using Tailwind's built-in utilities and the `tailwindcss-animate` plugin.

### Setup

Install the plugin:

```bash
npm install tailwindcss-animate
```

Add to `tailwind.config.js`:

```js
module.exports = {
  plugins: [require('tailwindcss-animate')],
};
```

### Scroll-Triggered with Tailwind

Using Intersection Observer to toggle Tailwind animation classes.

```html
<div class="opacity-0 translate-y-5 transition-all duration-500 ease-out"
     data-animate>
  Content fades in on scroll.
</div>
```

```js
const animateObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('opacity-0', 'translate-y-5');
      entry.target.classList.add('opacity-100', 'translate-y-0');
      animateObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-animate]').forEach(el => animateObserver.observe(el));
```

Staggered version using `data-delay`:

```html
<div class="grid grid-cols-3 gap-6">
  <div class="opacity-0 translate-y-5 transition-all duration-500 ease-out" data-animate data-delay="0">Card 1</div>
  <div class="opacity-0 translate-y-5 transition-all duration-500 ease-out" data-animate data-delay="100">Card 2</div>
  <div class="opacity-0 translate-y-5 transition-all duration-500 ease-out" data-animate data-delay="200">Card 3</div>
</div>
```

```js
document.querySelectorAll('[data-animate]').forEach(el => {
  const delay = el.dataset.delay || 0;
  el.style.transitionDelay = `${delay}ms`;
});
```

### Card Hover with Tailwind

```html
<div class="bg-white rounded-lg p-6 shadow-sm
            hover:scale-105 hover:shadow-lg
            transition-all duration-300 ease-out cursor-pointer">
  <h3 class="text-lg font-semibold">Card Title</h3>
  <p class="text-gray-600 mt-2">Card description text.</p>
</div>
```

Subtler version (recommended for most sites):

```html
<div class="bg-white rounded-lg p-6 shadow-sm
            hover:-translate-y-1 hover:shadow-md
            transition-all duration-300 ease-out">
  <h3 class="text-lg font-semibold">Card Title</h3>
  <p class="text-gray-600 mt-2">Card description text.</p>
</div>
```

### Button Hover with Tailwind

```html
<button class="px-6 py-3 bg-slate-900 text-white rounded-md
               hover:-translate-y-0.5 hover:shadow-md
               active:translate-y-0 active:shadow-sm
               transition-all duration-200 ease-out">
  Get Started
</button>
```

## Framer Motion Patterns (React/Next.js)

### Setup

```bash
npm install framer-motion
```

### Fade In on Scroll

Using `motion.div` with `whileInView`.

```jsx
import { motion } from 'framer-motion';

function FadeInSection({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

Usage:

```jsx
<FadeInSection>
  <h2>Section Title</h2>
  <p>Section content here.</p>
</FadeInSection>
```

### Page Transitions

Using `AnimatePresence` for route changes in Next.js App Router.

```jsx
// components/PageTransition.jsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

Wrap your page content in `layout.jsx`:

```jsx
import PageTransition from '@/components/PageTransition';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
```

### Staggered List

Using `staggerChildren` in variants.

```jsx
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function StaggeredList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {items.map((item, i) => (
        <motion.li key={i} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### Parallax Scroll

Subtle background movement on scroll. Good for hero sections.

```jsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

function ParallaxHero({ imageSrc, children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div
        style={{ y }}
        className="absolute inset-0 -z-10"
      >
        <img
          src={imageSrc}
          alt=""
          className="w-full h-[130%] object-cover"
        />
      </motion.div>
      <div className="relative z-10 flex items-center justify-center h-full">
        {children}
      </div>
    </section>
  );
}
```

Usage:

```jsx
<ParallaxHero imageSrc="/hero-bg.jpg">
  <h1 className="text-5xl font-bold text-white">Welcome</h1>
</ParallaxHero>
```

## Reduced Motion

Every animation pattern must respect the user's motion preferences. Wrap all animation logic with this check.

**CSS approach (add to global stylesheet):**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**JS approach (for Intersection Observer patterns):**

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Initialize observers and animations
} else {
  // Make everything visible immediately
  document.querySelectorAll('.fade-in, .stagger-item, .image-reveal').forEach(el => {
    el.classList.add('visible');
  });
}
```

**Framer Motion approach:**

Framer Motion respects `prefers-reduced-motion` automatically as of v10+. No extra code needed. To verify or override:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  // Framer Motion will skip animation if reduced motion is preferred
>
```

## When to Use What

| Pattern                        | Best For                         | Complexity |
| ------------------------------ | -------------------------------- | ---------- |
| CSS-only fade-in               | Static HTML sites, minimal JS    | Low        |
| CSS staggered children         | Feature grids, team sections     | Low        |
| CSS image reveal               | Portfolio pages, case studies    | Low        |
| Tailwind animate               | Tailwind projects, quick effects | Low        |
| Framer Motion fade-in          | React/Next.js projects           | Medium     |
| Framer Motion staggered        | Dynamic lists, React apps        | Medium     |
| Framer Motion parallax         | Hero sections, visual depth      | Medium     |
| Framer Motion page transitions | Multi-page React/Next.js apps    | Medium     |

## Guidelines

- Max 3 different animation types per page -- more than that feels chaotic.
- All animations must respect `prefers-reduced-motion` media query. See the Reduced Motion section above.
- Animations should be under 600ms (except page transitions, which can go to 800ms).
- Never animate content the user needs to read immediately. Hero H1 is fine, but not body text or navigation.
- Test on mobile -- some animations that look good on desktop feel laggy on phones.
- Use `once: true` (Framer Motion) or `unobserve` (Intersection Observer) so elements only animate the first time they enter view.
- Avoid animating `width`, `height`, or `top/left` -- these trigger layout reflows. Stick to `transform` and `opacity`.
- For scroll-triggered animations, set a reasonable `threshold` (0.1 to 0.2) so the animation fires when the element is partially visible, not when a single pixel enters the viewport.
