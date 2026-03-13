---
name: Full-Bleed Hero
category: layouts
complexity: moderate
dependencies: css-only
best-for: landing pages, homepages, campaign pages, portfolio sites, church sites
performance: "Minimal layout cost. Background images/videos are the main performance factor -- optimize media separately."
source-project: general
last-validated: 2026-03-13
---

# Full-Bleed Hero

## What It Does
A full-viewport hero section with vertically and horizontally centered content, optional background media (video, image, or gradient), and z-index layering for overlays.

## When to Use
- First section of any landing page or homepage
- When you need a strong visual first impression
- Campaign or event pages with a single call-to-action
- Any page where the "above the fold" content needs to dominate the viewport

## Visual Effect
The hero fills the entire browser viewport on load. Background media (image, video, or gradient) spans edge to edge with no margins or padding visible. Content sits centered over the background with an optional dark or tinted overlay ensuring text readability. On scroll, the hero disappears and the next section takes over.

## Code Reference
**Starter component:** None

## Key Implementation Details

### Basic structure (CSS/Tailwind)

```html
<section class="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
  <!-- Background layer -->
  <div class="absolute inset-0 z-0">
    <img src="/hero-bg.jpg" alt="" class="h-full w-full object-cover" />
  </div>

  <!-- Overlay -->
  <div class="absolute inset-0 z-[1] bg-black/40"></div>

  <!-- Content -->
  <div class="relative z-[2] mx-auto max-w-4xl px-4 text-center text-white">
    <h1 class="text-4xl font-bold md:text-6xl">Hero Headline</h1>
    <p class="mt-4 text-lg md:text-xl">Supporting text goes here</p>
    <a href="#next" class="mt-8 inline-block rounded-full bg-white px-8 py-3 text-black">
      Call to Action
    </a>
  </div>
</section>
```

### Z-index layer system

| Layer | Z-index | Content |
|-------|---------|---------|
| Background | 0 | Image, video, or gradient |
| Overlay | 1 | Semi-transparent color filter |
| Content | 2 | Text, buttons, logos |
| Navigation | 50 | Fixed nav (if present) |

### Split hero variant (POHC pattern)

Instead of centered content, split the hero into content left + image right:

```tsx
<section className="relative flex min-h-screen w-full flex-col md:flex-row">
  {/* Left: Content */}
  <div className="flex w-full flex-col justify-between p-8 md:w-1/2 lg:w-3/5 lg:p-16">
    <header>{/* Logo */}</header>
    <main>
      <h1>Headline</h1>
      <p>Description</p>
      <a href="#cta">CTA Button</a>
    </main>
    <footer>{/* Contact info */}</footer>
  </div>

  {/* Right: Image with clip-path */}
  <div className="relative w-full min-h-[350px] md:w-1/2 lg:w-2/5">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url('/hero-image.jpg')" }}
    />
  </div>
</section>
```

### Video background variant

```html
<section class="relative flex min-h-screen items-center justify-center">
  <video
    autoplay loop muted playsinline
    class="absolute inset-0 z-0 h-full w-full object-cover"
  >
    <source src="/hero.mp4" type="video/mp4" />
  </video>
  <div class="absolute inset-0 z-[1] bg-black/50"></div>
  <div class="relative z-[2]">
    <!-- Content -->
  </div>
</section>
```

### Gradient background variant

```html
<section class="relative flex min-h-screen items-center justify-center"
  style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)">
  <div class="relative mx-auto max-w-4xl px-4 text-center text-white">
    <!-- Content -->
  </div>
</section>
```

### Key CSS properties

- `min-h-screen` -- fills viewport height but allows content to push taller if needed
- `overflow-hidden` -- prevents background media from causing horizontal scroll
- `object-cover` -- scales background media to cover container without distortion
- `flex items-center justify-center` -- dead-center the content block
- `inset-0` -- shorthand for `top:0; right:0; bottom:0; left:0` (full coverage)

## Customization
- **Height:** Use `min-h-screen` for full viewport, `min-h-[80vh]` for shorter, `h-screen` for exact viewport (no overflow).
- **Alignment:** Replace `items-center justify-center text-center` with `items-end justify-start text-left` for bottom-left positioning.
- **Overlay color:** `bg-black/40` for neutral dark. Use brand colors with alpha: `bg-[#1a3a12]/30` for tinted.
- **Content width:** `max-w-4xl` for standard, `max-w-6xl` for wide, `max-w-2xl` for narrow/focused.
- **Responsive split:** The split variant uses `flex-col md:flex-row` to stack on mobile, split on desktop.
- **Scroll indicator:** Add an animated chevron at the bottom with `absolute bottom-8 left-1/2 -translate-x-1/2`.

## Dependencies
- None -- CSS only
- For animated variants, combine with the Framer Motion Scroll pattern
