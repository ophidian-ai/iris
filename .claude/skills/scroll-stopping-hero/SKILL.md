---
name: scroll-stopping-hero
description: Build premium scroll-stopping hero sections with AI-generated video assets and scroll-scrub animation. Use when Eric says "add a scroll-stop hero", "make the hero scroll-driven", "create a video hero", "build a premium hero section", "add scroll-scrub video", "make the hero cinematic", or when building any client website that needs a premium, attention-grabbing hero section. This is OphidianAI's signature differentiator -- most competitors use static images.
---

# Scroll-Stopping Hero Builder

Build cinematic, scroll-driven hero sections that make visitors stop and engage. This is OphidianAI's premium differentiator -- the technique that justifies $8,000-$10,000 website pricing.

## Why This Matters

- Most small business websites use static hero images
- Scroll-stopping heroes create an immediate "wow" moment
- Visitors spend 3-5x longer on pages with scroll-driven animations
- This technique alone can justify premium pricing

## Hero Tier Options

| Tier | Technique | Complexity | Best For |
|------|-----------|------------|----------|
| Bronze | Parallax image layers | Low | Any business, fast delivery |
| Silver | Autoplay video background | Medium | Businesses with visual services |
| Gold | Scroll-scrubbed video | High | Premium builds, showpiece demos |
| Platinum | AI-generated 3D asset video + scroll-scrub | Highest | $10K+ builds, maximum impact |

## Implementation by Tier

### Bronze: Parallax Image Layers

Multi-layer depth scrolling with no JavaScript.

```css
.parallax-container {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  perspective: 1px;
}
.parallax-layer--back {
  transform: translateZ(-2px) scale(3);
}
.parallax-layer--front {
  transform: translateZ(0);
}
```

**Stock imagery:** Use Pexels API to find industry-relevant hero images. Layer a dark overlay + brand typography on top.

### Silver: Autoplay Video Background

Video loops behind hero content with overlay and CTA.

```html
<section class="relative min-h-screen overflow-hidden">
  <video autoplay muted loop playsinline poster="/images/hero.jpg"
    class="absolute inset-0 h-full w-full object-cover">
    <source src="/videos/hero-bg.webm" type="video/webm" />
    <source src="/videos/hero-bg.mp4" type="video/mp4" />
  </video>
  <div class="absolute inset-0 bg-black/60"></div>
  <div class="relative z-10 flex min-h-screen items-center justify-center text-center">
    <!-- Hero content -->
  </div>
</section>
```

**Video source:** Pexels API video search with industry-specific terms. Download HD (1920x1080). Keep videos under 10 seconds for performance.

### Gold: Scroll-Scrubbed Video

Video playback tied to scroll position -- frame-by-frame scrubbing.

#### HTML Structure

```html
<section class="scroll-scrub-container relative" id="hero-scrub">
  <div class="sticky top-0 h-screen w-full overflow-hidden">
    <video id="scrub-video" muted playsinline preload="auto"
      poster="/images/hero.jpg"
      class="absolute inset-0 h-full w-full object-cover">
      <source src="/videos/hero-scrub.mp4" type="video/mp4" />
    </video>
    <div id="hero-overlay" class="absolute inset-0 bg-black/70"></div>
    <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <!-- Title, tagline, CTA -->
    </div>
  </div>
</section>
```

#### CSS

```css
.scroll-scrub-container {
  height: 300vh; /* 3x viewport for scroll distance */
  position: relative;
}
```

#### JavaScript

```javascript
const video = document.getElementById('scrub-video');
const container = document.getElementById('hero-scrub');
const overlay = document.getElementById('hero-overlay');

if (video && container) {
  video.pause();

  // Reveal content after short delay
  setTimeout(() => {
    // Animate in tagline, CTA, divider
  }, 600);

  const updateVideo = () => {
    const rect = container.getBoundingClientRect();
    const scrollProgress = Math.max(0, Math.min(1,
      -rect.top / (rect.height - window.innerHeight)
    ));

    // Scrub video to match scroll
    if (video.duration) {
      video.currentTime = scrollProgress * video.duration;
    }

    // Fade overlay from 70% to 30%
    if (overlay) {
      const opacity = 0.7 - (scrollProgress * 0.4);
      overlay.style.opacity = String(Math.max(0.3, opacity));
    }
  };

  window.addEventListener('scroll', updateVideo, { passive: true });
  updateVideo();
}
```

**Video requirements:**
- 5-15 seconds duration (longer = smoother scrub)
- 1080p minimum, 4K preferred
- MP4 with H.264 codec (widest browser support)
- File size under 10MB for performance
- Content should have clear visual progression (movement, reveal, transformation)

### Platinum: AI-Generated 3D Asset Video

The full pipeline: AI image generation, video transition, scroll-scrub integration.

#### Asset Generation Steps

1. **Brand extraction** -- Scrape existing site for colors, typography, logo
2. **Assembled image** -- Generate clean product/scene image
   - Prompt: "A [product/scene] in clean studio setting, [brand colors], professional photography, 16:9, 2K, clean white background"
   - Tool: Nano Banana 2 (preferred) or Gemini image generation
   - Generate 4+ iterations, pick the best
3. **Exploded image** -- Generate deconstructed version
   - Prompt: "Same [product/scene] with elements dynamically exploding outward, deconstructed view, same [brand colors], 16:9, 2K"
   - Reference the assembled image for consistency
4. **Video transition** -- Generate smooth transition between states
   - Tool: Kling 3.0 or equivalent
   - 5-7 seconds duration, 1080p, 60fps
   - Start frame = assembled, end frame = exploded (or reverse)
5. **Compose clips** -- Edit in CapCut (free) if multiple clips needed
   - Export at 1080p, 60fps, MP4
6. **Integrate** -- Use Gold tier scroll-scrub implementation above

#### Quality Requirements

- Never go below 2K resolution for AI images (1K = "AI slop")
- 16:9 aspect ratio for web
- Clean backgrounds (nothing touching edges)
- Include brand logo as reference in prompts
- 4+ iterations minimum before selecting

## Accessibility & Performance

Every hero MUST include:

```css
@media (prefers-reduced-motion: reduce) {
  .scroll-scrub-container {
    height: auto;
  }
  .float-element,
  .gold-shimmer {
    animation: none !important;
  }
}
```

Always provide a `<noscript>` fallback with a static hero for users without JavaScript.

**Performance checklist:**
- [ ] Video compressed (under 10MB for scroll-scrub)
- [ ] Poster image set for instant visual
- [ ] `preload="auto"` for scrub video, `preload="metadata"` for autoplay
- [ ] WebM format offered alongside MP4 where possible
- [ ] Lazy-load any below-fold video elements
- [ ] `will-change: transform` used sparingly
- [ ] Lighthouse Performance score above 90

## Complementary Effects

Layer these on top of any hero tier for extra impact:

- **Gold shimmer text** -- Animated gradient on hero headline (see `ui-component-patterns.md` section 96)
- **3D floating elements** -- Bobbing service icons or product images (section 3 of `3d-website-techniques.md`)
- **Particle background** -- Lightweight canvas particles behind content (pattern 66)
- **Grainy noise overlay** -- SVG feTurbulence for premium texture (pattern 64)

## Reference Files

- `engineering/references/3d-website-techniques.md` -- Full 3D asset pipeline details
- `engineering/references/ui-component-patterns.md` -- 96 CSS/JS animation patterns
- `engineering/references/design-philosophy-2026.md` -- Design trend context
- Live example: `nanos-car-detailing.vercel.app` (Gold tier scroll-scrub hero)
