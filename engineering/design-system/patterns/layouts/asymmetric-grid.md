---
name: Asymmetric Grid
category: layouts
complexity: simple
dependencies: css-only
best-for: hero sections, feature highlights, team bios, testimonials, content with visual hierarchy
performance: "Standard CSS grid/flexbox. No layout thrashing. Responsive breakpoints are the only consideration."
source-project: general
last-validated: 2026-03-13
---

# Asymmetric Grid

## What It Does
A grid layout where columns have unequal widths (e.g., 60/40 or 70/30 split). Creates visual hierarchy by giving the primary content more space while keeping secondary content compact.

## When to Use
- When one column is more important than the other (e.g., main content vs. sidebar)
- Hero sections with large text area + smaller image (or vice versa)
- Team/bio sections with photo + description
- Contact sections with info + map
- Feature highlights where the image deserves more space than the text
- Any two-column layout where a 50/50 split feels too balanced or boring

## Visual Effect
Instead of equal columns, one column visually dominates the other. A 60/40 split is subtle but adds interest. A 70/30 split creates clear primary/secondary hierarchy. The asymmetry draws the eye to the larger column first, then to the smaller one -- useful for directing attention.

## Code Reference
**Starter component:** None

## Key Implementation Details

### CSS Grid approach

```html
<!-- 60/40 split -->
<div class="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
  <div class="md:col-span-3">
    <!-- Primary content (60%) -->
  </div>
  <div class="md:col-span-2">
    <!-- Secondary content (40%) -->
  </div>
</div>

<!-- 70/30 split -->
<div class="grid grid-cols-1 md:grid-cols-10 gap-8 items-center">
  <div class="md:col-span-7">
    <!-- Primary content (70%) -->
  </div>
  <div class="md:col-span-3">
    <!-- Secondary content (30%) -->
  </div>
</div>
```

### Flexbox approach

```html
<!-- 60/40 split -->
<div class="flex flex-col md:flex-row gap-8 items-center">
  <div class="w-full md:w-3/5">
    <!-- Primary content -->
  </div>
  <div class="w-full md:w-2/5">
    <!-- Secondary content -->
  </div>
</div>

<!-- 70/30 split -->
<div class="flex flex-col md:flex-row gap-8 items-center">
  <div class="w-full md:w-[70%]">
    <!-- Primary content -->
  </div>
  <div class="w-full md:w-[30%]">
    <!-- Secondary content -->
  </div>
</div>
```

### Tailwind fractional widths for common splits

| Split | Primary | Secondary |
|-------|---------|-----------|
| 60/40 | `md:w-3/5` | `md:w-2/5` |
| 66/33 | `md:w-2/3` | `md:w-1/3` |
| 70/30 | `md:w-[70%]` | `md:w-[30%]` |
| 75/25 | `md:w-3/4` | `md:w-1/4` |

### POHC split hero example (60/40)

```tsx
<section className="relative flex min-h-screen w-full flex-col md:flex-row">
  {/* Left: 60% content */}
  <div className="flex w-full flex-col justify-between p-8 md:w-1/2 lg:w-3/5 lg:p-16">
    <h1>Point of Hope Apostolic Church</h1>
    <p>Description</p>
  </div>

  {/* Right: 40% image */}
  <div className="relative w-full min-h-[350px] md:w-1/2 lg:w-2/5">
    <div className="absolute inset-0 bg-cover bg-center" />
  </div>
</section>
```

Note the responsive adjustment: `md:w-1/2 lg:w-3/5` -- at medium screens it is 50/50, then shifts to 60/40 at large screens.

### POHC team section (50/50 with asymmetric content weight)

```tsx
<div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
  <div className="relative h-80 w-full">
    {/* Image fills its column */}
  </div>
  <div className="flex flex-col justify-between py-4">
    {/* Text content with vertical spacing */}
  </div>
</div>
```

Even a 50/50 grid can feel asymmetric when the content within each column has different visual weight (e.g., a large image vs. sparse text).

### Nested asymmetric grid

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="md:col-span-2">
    <!-- Large featured card -->
  </div>
  <div class="space-y-6">
    <!-- Two stacked smaller cards -->
    <div>Card 2</div>
    <div>Card 3</div>
  </div>
</div>
```

## Customization
- **Direction flip:** Swap column order with `md:flex-row-reverse` or CSS Grid `order` for variety.
- **Gap size:** `gap-8` is standard. Use `gap-12` to `gap-20` for breathing room between columns.
- **Vertical alignment:** `items-center` for middle-aligned, `items-start` for top-aligned, `items-stretch` for equal-height columns.
- **Mobile stacking:** All variants use `flex-col` or single-column grid on mobile. The primary column should come first in the HTML for mobile reading order.
- **Responsive shifts:** Use `md:w-1/2 lg:w-3/5` to start equal and shift asymmetric at larger breakpoints.
- **Background treatment:** Give columns different backgrounds (e.g., one white, one with a brand color) for stronger visual separation.

## Dependencies
- None -- CSS only
