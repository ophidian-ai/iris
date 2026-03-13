---
name: Gradient Line
category: dividers
complexity: simple
dependencies: css-only
best-for: tech, saas, agency, dark-themes, section-separators
performance: "Zero runtime cost. Single CSS gradient on a 1px element."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Gradient Line

## What It Does
A thin horizontal line that fades from transparent on both ends to a brand color in the center, used as a section divider or decorative separator.

## When to Use
- Between hero tagline and headline
- Section separators
- Above or below headings
- Decorative breaks between content blocks

## Visual Effect
A 1px-tall, 64px-wide (w-16) horizontal line with the brand green color in the center fading to transparent on both edges. At 30% opacity, it provides a subtle visual break without being heavy. Centers itself with `mx-auto`.

## Code Reference
**Starter component:** None

## Key Implementation Details

- Inline style usage in the hero component:

```tsx
<div
  className="mt-4 w-16 h-px opacity-30 mx-auto"
  style={{
    background: "linear-gradient(to right, transparent, #39FF14, transparent)",
  }}
/>
```

- Also used with spacing above content:

```tsx
<div
  className="mb-4 w-16 h-px opacity-30 mx-auto"
  style={{
    background: "linear-gradient(to right, transparent, #39FF14, transparent)",
  }}
/>
```

- The ProcessSteps component uses a vertical variant as a connector line:

```tsx
<div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
```

## Customization
- Increase `w-16` to `w-32` or `w-48` for wider lines
- Use `h-0.5` (2px) for a slightly thicker line
- Change `opacity-30` to `opacity-50` or `opacity-60` for more visibility
- Replace `#39FF14` with `var(--color-accent)` for teal variant
- Use Tailwind's gradient classes instead of inline styles:

```html
<div class="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
```

- For vertical dividers, swap to `w-px h-16` with `bg-gradient-to-b`
- Animate opacity on scroll-in for a reveal effect

## Dependencies
- None -- CSS only
