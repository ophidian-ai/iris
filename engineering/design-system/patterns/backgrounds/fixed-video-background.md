---
name: Fixed Video Background
category: backgrounds
complexity: moderate
dependencies: css-only
best-for: hero sections, immersive landing pages, church sites, event pages, luxury brands
performance: "Video files should be compressed (< 5MB). Use poster attribute for initial frame. Mobile may pause autoplay on cellular data."
source-project: point-of-hope-church-mockup
last-validated: 2026-03-13
---

# Fixed Video Background

## What It Does
Renders a full-screen looping video behind all page content with a semi-transparent color overlay for text readability. The video stays fixed in the viewport while content scrolls over it.

## When to Use
- Immersive hero sections or full-page landing experiences
- Sites where atmosphere and mood matter (churches, events, luxury brands)
- When a static image feels too flat but full motion video conveys the brand

## Visual Effect
A looping, muted video fills the entire viewport and stays pinned in place as the user scrolls. A dark-tinted overlay sits between the video and the content, ensuring text remains legible. Content sections scroll over the video, creating a layered depth effect. Sections with semi-transparent backgrounds (e.g., `bg-white/25 backdrop-blur-sm`) let the video subtly show through.

## Code Reference
**Starter component:** None

## Key Implementation Details

Three-layer z-index stack:

```tsx
// Layer 0: Fixed video background
<video
  autoPlay
  loop
  muted
  playsInline
  className="fixed inset-0 h-full w-full object-cover"
  style={{ zIndex: 0 }}
  aria-hidden="true"
>
  <source src="/forest-sunlight.mp4" type="video/mp4" />
</video>

// Layer 1: Color overlay for readability
<div
  className="fixed inset-0 pointer-events-none"
  style={{ zIndex: 1, backgroundColor: "rgba(26, 58, 18, 0.3)" }}
  aria-hidden="true"
/>

// Layer 2: All scrollable page content
<div className="relative" style={{ zIndex: 2 }}>
  {children}
</div>
```

- The wrapper element needs `position: relative` and a fallback `backgroundColor` matching the overlay tone so the page is not blank while the video loads.
- `playsInline` is required for iOS autoplay.
- `muted` is required for browser autoplay policies -- browsers block autoplay with audio.
- `aria-hidden="true"` on decorative layers keeps screen readers focused on content.
- `pointer-events-none` on the overlay prevents it from blocking clicks.
- `object-cover` ensures the video fills the viewport without letterboxing.

Content sections should use semi-transparent backgrounds to let the video peek through:

```tsx
<section className="bg-white/25 backdrop-blur-sm py-20">
  {/* Section content */}
</section>
```

Alternating between `bg-white/25` and `bg-[#f5f3ee]/20` creates subtle visual separation between sections while maintaining the video backdrop effect.

## Customization
- **Overlay color:** Change the `rgba()` value to match brand. Dark overlays work best for light text; tinted overlays add mood.
- **Overlay opacity:** 0.3 is a good starting point. Increase for more readability, decrease for more video visibility.
- **Section transparency:** Adjust the `/25` or `/20` alpha values on section backgrounds to control how much video shows through.
- **Backdrop blur:** Add `backdrop-blur-sm` to sections for a frosted-glass effect over the video.
- **Fallback:** Set `backgroundColor` on the wrapper to the dominant video color so the page looks intentional before the video loads.
- **Mobile:** Consider replacing the video with a static image on mobile via a `<picture>` element or media query to save bandwidth.

## Dependencies
- None -- CSS only (video element is native HTML)
- Video file must be self-hosted or served from a CDN that supports range requests
