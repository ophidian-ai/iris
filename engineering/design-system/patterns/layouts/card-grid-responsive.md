---
name: Responsive Card Grid
category: layouts
complexity: simple
dependencies: css-only
best-for: feature grids, service listings, team members, pricing tables, blog posts, portfolios
performance: "CSS Grid handles layout natively with no JS. auto-fill/auto-fit avoids media query overhead. Lazy-load card images."
source-project: general
last-validated: 2026-03-13
---

# Responsive Card Grid

## What It Does
A responsive card grid that adapts from 3 columns on desktop to 2 on tablet to 1 on mobile. Uses CSS Grid with `auto-fill`/`auto-fit` and `minmax()` for fluid responsiveness, or explicit breakpoints for precise control.

## When to Use
- Service or feature cards (3-4 items)
- Team member grids
- Blog post listings
- Pricing tables
- Portfolio or project showcases
- Any repeating content blocks that need to reflow across screen sizes

## Visual Effect
Cards are evenly distributed across available space. On wide screens, 3-4 cards sit side by side. As the viewport narrows, cards reflow to 2 per row, then 1 per row on mobile. Cards maintain consistent spacing and alignment throughout all breakpoints.

## Code Reference
**Starter component:** None

## Key Implementation Details

### Breakpoint-based approach (Tailwind -- most common)

```html
<!-- 3-column grid -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  <div class="rounded-xl border bg-white p-6 shadow-sm">Card 1</div>
  <div class="rounded-xl border bg-white p-6 shadow-sm">Card 2</div>
  <div class="rounded-xl border bg-white p-6 shadow-sm">Card 3</div>
</div>

<!-- 4-column grid -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  <!-- Cards -->
</div>
```

### Auto-fill approach (fluid, no breakpoints)

```html
<div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
  <!-- Cards automatically reflow based on container width -->
</div>
```

Tailwind equivalent:

```html
<div class="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
  <!-- Cards -->
</div>
```

- `auto-fill` -- creates as many columns as fit, leaving empty tracks if items run out
- `auto-fit` -- same as auto-fill but collapses empty tracks so items stretch to fill
- `minmax(280px, 1fr)` -- each column is at least 280px, expands equally to fill space

**When to use which:**
- `auto-fill` when you want consistent column widths even with few items
- `auto-fit` when you want items to stretch and fill the full row

### POHC patterns

4-column card grid (AboutSection, WhatToExpectSection):

```tsx
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {beliefs.map((belief, i) => (
    <motion.div
      key={belief.title}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      className="rounded-xl border border-[#3f831c]/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8f5e3]">
        <belief.icon className="h-6 w-6 text-[#3f831c]" />
      </div>
      <h4 className="mb-2 text-lg font-semibold">{belief.title}</h4>
      <p className="text-sm leading-relaxed">{belief.description}</p>
    </motion.div>
  ))}
</div>
```

3-column card grid (ServicesSection):

```tsx
<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
  {services.map((service, i) => (
    <motion.div
      key={service.name}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.12 }}
      className="group rounded-xl border bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg"
    >
      {/* Card content */}
    </motion.div>
  ))}
</div>
```

### Standard card anatomy

```html
<div class="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
  <!-- Icon or image -->
  <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
    <Icon class="h-6 w-6 text-accent" />
  </div>

  <!-- Title -->
  <h3 class="mb-2 text-lg font-semibold">Card Title</h3>

  <!-- Description -->
  <p class="text-sm leading-relaxed text-muted">Card description text.</p>
</div>
```

### Common column counts

| Items | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| 3 | 3-col (`md:grid-cols-3`) | 1-col | 1-col |
| 4 | 4-col (`lg:grid-cols-4`) | 2-col (`sm:grid-cols-2`) | 1-col |
| 6 | 3-col (`lg:grid-cols-3`) | 2-col (`sm:grid-cols-2`) | 1-col |
| 8+ | 4-col (`lg:grid-cols-4`) | 2-col (`sm:grid-cols-2`) | 1-col |

### Equal-height cards

CSS Grid columns are equal height by default (items stretch). For flexbox, use:

```html
<div class="flex flex-wrap gap-6">
  <div class="flex w-full flex-col sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
    <div class="flex flex-1 flex-col rounded-xl border bg-white p-6">
      <!-- Content grows to fill -->
    </div>
  </div>
</div>
```

Grid is strongly preferred over flexbox for card layouts because it handles equal heights and alignment automatically.

## Customization
- **Gap:** `gap-6` (24px) is standard. Use `gap-4` for compact, `gap-8` for spacious.
- **Min card width:** In `minmax()`, 240px for compact cards, 280px for standard, 320px for wide cards.
- **Card padding:** `p-6` for standard, `p-8` for spacious, `p-4` for compact.
- **Borders:** `border border-gray-200` for subtle, `border-2 border-accent` for highlighted cards.
- **Hover effects:** `hover:shadow-md` for subtle, `hover:shadow-lg hover:-translate-y-1` for lift effect.
- **Animation:** Combine with Framer Motion Scroll pattern using `delay: i * 0.1` for staggered entrance.

## Dependencies
- None -- CSS only
