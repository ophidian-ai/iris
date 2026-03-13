---
name: Alternating Image-Text Rows
category: layouts
complexity: simple
dependencies: css-only
best-for: about pages, feature showcases, service descriptions, team bios, case studies
performance: "Standard CSS layout. No JS required. Lazy-load images for best performance."
source-project: general
last-validated: 2026-03-13
---

# Alternating Image-Text Rows

## What It Does
Rows that alternate between image-left/text-right and text-left/image-right. Creates visual rhythm and keeps long content pages from feeling monotonous.

## When to Use
- About pages or "how it works" sections with multiple content blocks
- Feature showcases where each feature has an image and description
- Service pages with alternating service details
- Case studies or portfolio pieces with project descriptions alongside screenshots
- Any content page with 3+ blocks that would feel repetitive in the same layout

## Visual Effect
Each row spans the full content width with two columns: one for an image and one for text. Odd rows show image on the left, text on the right. Even rows flip: text on the left, image on the right. This alternating pattern creates a zig-zag visual flow that naturally guides the eye down the page.

## Code Reference
**Starter component:** None

## Key Implementation Details

### Flexbox approach (simplest)

```html
<!-- Row 1: Image left, text right -->
<div class="flex flex-col md:flex-row items-center gap-8 py-16">
  <div class="w-full md:w-1/2">
    <img src="/feature-1.jpg" alt="" class="rounded-xl object-cover w-full" />
  </div>
  <div class="w-full md:w-1/2">
    <h3 class="text-2xl font-bold">Feature Title</h3>
    <p class="mt-4 text-lg leading-relaxed">Description text.</p>
  </div>
</div>

<!-- Row 2: Text left, image right (flex-row-reverse) -->
<div class="flex flex-col md:flex-row-reverse items-center gap-8 py-16">
  <div class="w-full md:w-1/2">
    <img src="/feature-2.jpg" alt="" class="rounded-xl object-cover w-full" />
  </div>
  <div class="w-full md:w-1/2">
    <h3 class="text-2xl font-bold">Feature Title</h3>
    <p class="mt-4 text-lg leading-relaxed">Description text.</p>
  </div>
</div>
```

The key is `md:flex-row-reverse` on even rows. The HTML structure stays identical -- only the flex direction changes.

### Dynamic alternation with map

```tsx
{features.map((feature, i) => (
  <div
    key={feature.title}
    className={cn(
      "flex flex-col items-center gap-8 py-16 md:gap-12",
      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
    )}
  >
    <div className="w-full md:w-1/2">
      <img
        src={feature.image}
        alt={feature.imageAlt}
        className="rounded-xl object-cover w-full"
        loading="lazy"
      />
    </div>
    <div className="w-full md:w-1/2">
      <h3 className="text-2xl font-bold">{feature.title}</h3>
      <p className="mt-4 text-lg leading-relaxed">{feature.description}</p>
    </div>
  </div>
))}
```

### CSS Grid approach (more control over column sizing)

```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
  <!-- Image column -->
  <div class="md:order-1">
    <img src="/feature.jpg" alt="" class="rounded-xl w-full" />
  </div>
  <!-- Text column -->
  <div class="md:order-2">
    <h3>Title</h3>
    <p>Description</p>
  </div>
</div>

<!-- Reversed row: swap order values -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
  <div class="md:order-2">
    <img src="/feature.jpg" alt="" class="rounded-xl w-full" />
  </div>
  <div class="md:order-1">
    <h3>Title</h3>
    <p>Description</p>
  </div>
</div>
```

### With divider between rows

```html
<div class="divide-y divide-gray-200">
  {/* Each row gets a top border except the first */}
</div>
```

Or use a decorative accent bar:

```html
<div class="mx-auto my-8 h-1 w-20 bg-accent"></div>
```

### Mobile behavior

On mobile (`flex-col`), the image always appears first regardless of the desktop order. This is intentional -- the image provides visual context before the user reads the text. If you need text-first on mobile for certain rows, use `order-first` / `order-last` utilities.

## Customization
- **Column split:** Replace `w-1/2` with asymmetric splits like `w-3/5` / `w-2/5` for larger images.
- **Vertical alignment:** `items-center` centers vertically. Use `items-start` to top-align, `items-end` to bottom-align.
- **Gap:** `gap-8` (32px) is standard. Use `gap-12` or `gap-16` for more breathing room.
- **Image treatment:** Add `shadow-lg`, `rounded-2xl`, or a border to the image for polish.
- **Text side padding:** Add `md:pl-8` or `md:pr-8` to the text column for extra inset.
- **Background alternation:** Alternate row backgrounds (`bg-white` / `bg-gray-50`) for additional visual separation.
- **Animation:** Combine with the Framer Motion Scroll pattern for fade-in on each row.

## Dependencies
- None -- CSS only
