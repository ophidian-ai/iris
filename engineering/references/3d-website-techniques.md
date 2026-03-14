# 3D Website & Scroll-Stopping Animation Techniques

> Extracted from Nano Banana 2 workflow, Kling 3.0, and modern web animation research. Updated March 2026.
>
> **Purpose:** Reference for building premium, scroll-stopping websites with 3D assets, animated transitions, and cinematic effects.

---

## 1. 3D Asset Generation Pipeline

### Overview

Create assembled and exploded/deconstructed versions of product images, then generate video transitions between them for use as scroll-driven or autoplay hero animations.

### Steps

1. **Brand extraction** -- Use Firecrawl `scrape` with `branding` format to pull logos, colors, typography, brand assets from existing site
2. **Assembled image** -- Generate a clean, composed product/scene image using AI image generation (Nano Banana 2, Midjourney, etc.)
   - Use 16:9 aspect ratio for web
   - Minimum 2K resolution
   - Clean white or transparent background (nothing touching edges)
   - Include brand logo as reference image
3. **Exploded image** -- Generate a deconstructed version of the same scene
   - Reference the assembled image so elements match
   - Items flying apart, scattered, dynamic composition
   - Same color palette and brand elements
4. **Video transition** -- Generate a smooth transition video between assembled and exploded states
   - Tools: Kling 3.0, Hixelon, or equivalent video AI
   - 7 seconds typical duration
   - Start frame = assembled, end frame = exploded (or reverse)
5. **Integration** -- Embed video as scroll-driven or autoplay background in hero section

### Prompt Structure for Asset Generation

```
Assembled: "A [product/scene] in a clean studio setting, [brand colors],
featuring [key elements], professional product photography, 16:9, 2K,
clean white background, nothing touching edges"

Exploded: "The same [product/scene] with all elements dynamically
exploding outward, items flying in different directions, deconstructed
view, same [brand colors], energetic composition, 16:9, 2K"

Video transition: "Smooth cinematic transition from assembled to
exploded state, elements gracefully separating and floating outward,
professional motion design, 7 seconds"
```

### Quality Tips

- Generate 4 iterations minimum, pick the best
- Never go below 2K resolution
- Ensure logo placement is prominent but natural
- Reference the assembled image when generating the exploded version for consistency

---

## 2. Scroll-Stopping Hero Animations

### Video Background with Scroll Trigger

```html
<section class="hero-scroll-stop" data-scroll-stop>
  <video
    class="hero-video"
    muted
    playsinline
    preload="metadata"
    poster="/images/hero-poster.jpg"
  >
    <source src="/videos/hero-transition.webm" type="video/webm" />
    <source src="/videos/hero-transition.mp4" type="video/mp4" />
  </video>
  <div class="hero-content">
    <h1>Your Headline</h1>
  </div>
</section>
```

```css
.hero-scroll-stop {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
```

```javascript
// Scroll-driven video playback
const video = document.querySelector('[data-scroll-stop] video');
const section = document.querySelector('[data-scroll-stop]');

if (video && section) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play();
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(section);
}
```

### Scroll-Scrubbed Video (Frame-by-Frame)

More advanced -- scrubs video playback based on scroll position:

```javascript
const video = document.querySelector('.scrub-video');
const container = document.querySelector('.scrub-container');

if (video && container) {
  video.pause();

  const updateVideo = () => {
    const rect = container.getBoundingClientRect();
    const scrollProgress = Math.max(0, Math.min(1,
      -rect.top / (rect.height - window.innerHeight)
    ));

    if (video.duration) {
      video.currentTime = scrollProgress * video.duration;
    }
  };

  window.addEventListener('scroll', updateVideo, { passive: true });
}
```

```css
.scrub-container {
  height: 300vh; /* Scroll distance = 3x viewport */
  position: relative;
}

.scrub-video {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
}
```

---

## 3. 3D Floating/Bobbing Elements

### CSS-Only Floating Animation

```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(1deg); }
  50% { transform: translateY(-25px) rotate(-1deg); }
  75% { transform: translateY(-10px) rotate(0.5deg); }
}

.float-element {
  animation: float 6s ease-in-out infinite;
}

.float-element:nth-child(2) { animation-delay: -1.5s; }
.float-element:nth-child(3) { animation-delay: -3s; }
```

### 3D Perspective Product Card

```css
.product-3d {
  perspective: 1000px;
  cursor: pointer;
}

.product-3d-inner {
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
}

.product-3d:hover .product-3d-inner {
  transform: rotateY(15deg) rotateX(5deg) scale(1.05);
}

/* Reactive tilt following mouse */
```

```javascript
document.querySelectorAll('.product-3d').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const inner = card.querySelector('.product-3d-inner');
    inner.style.transform = `
      rotateY(${x * 20}deg)
      rotateX(${-y * 20}deg)
      scale(1.05)
    `;
  });

  card.addEventListener('mouseleave', () => {
    const inner = card.querySelector('.product-3d-inner');
    inner.style.transform = '';
  });
});
```

---

## 4. Parallax Depth Layers

### Multi-Layer Parallax

```html
<section class="parallax-depth">
  <div class="parallax-layer" data-speed="0.1">
    <img src="/images/bg-far.webp" alt="" />
  </div>
  <div class="parallax-layer" data-speed="0.3">
    <img src="/images/bg-mid.webp" alt="" />
  </div>
  <div class="parallax-layer" data-speed="0.6">
    <img src="/images/bg-near.webp" alt="" />
  </div>
  <div class="parallax-content" data-speed="1">
    <h2>Content Layer</h2>
  </div>
</section>
```

```javascript
const layers = document.querySelectorAll('.parallax-layer, .parallax-content');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  layers.forEach(layer => {
    const speed = parseFloat(layer.dataset.speed) || 0.5;
    layer.style.transform = `translateY(${scrollY * speed * -0.5}px)`;
  });
}, { passive: true });
```

```css
.parallax-depth {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.parallax-layer {
  position: absolute;
  inset: -20% 0;
  will-change: transform;
}

.parallax-layer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## 5. Website Scaffolding from Existing Sites

### HTML Extraction Technique

Extract the structure of an existing website and rebuild with new branding:

1. Use an HTML extractor tool (or Firecrawl scrape) to get the page structure
2. Feed the HTML to Claude Code as a scaffold reference
3. Prompt: "Recreate this structure with new branding, scroll-stopping animation, and the assets we generated"
4. The AI preserves layout logic while replacing content, colors, typography, and adding animations

### Key Prompt Pattern

```
I've downloaded the HTML from [original website]. I would like to use
that HTML to recreate it with:
- New copy and branding for [client name]
- The scroll-stopping animation included in the hero
- Same structural layout but fresh visual identity
- Full mobile responsiveness
- SEO optimization
```

---

## 6. Animated Gradient Mesh Backgrounds

### CSS Animated Mesh

```css
.mesh-bg {
  background:
    radial-gradient(ellipse at 20% 80%, var(--primary) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, var(--accent) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, var(--secondary) 0%, transparent 60%);
  background-size: 200% 200%;
  animation: mesh-shift 15s ease-in-out infinite alternate;
}

@keyframes mesh-shift {
  0% { background-position: 0% 0%, 100% 100%, 50% 50%; }
  33% { background-position: 100% 0%, 0% 100%, 80% 20%; }
  66% { background-position: 50% 100%, 50% 0%, 20% 80%; }
  100% { background-position: 0% 50%, 100% 50%, 50% 50%; }
}
```

---

## 7. Exploding/Assembling Grid Animation

### Scroll-Driven Grid Assembly

Elements fly in from scattered positions and assemble into a grid as user scrolls:

```css
.assembly-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  perspective: 1200px;
}

.assembly-item {
  opacity: 0;
  transform: translate3d(var(--scatter-x), var(--scatter-y), var(--scatter-z))
             rotate(var(--scatter-rotate));
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.assembly-item.assembled {
  opacity: 1;
  transform: translate3d(0, 0, 0) rotate(0deg);
}
```

```javascript
document.querySelectorAll('.assembly-item').forEach((item, i) => {
  // Random scatter positions
  item.style.setProperty('--scatter-x', `${(Math.random() - 0.5) * 400}px`);
  item.style.setProperty('--scatter-y', `${(Math.random() - 0.5) * 400}px`);
  item.style.setProperty('--scatter-z', `${Math.random() * 200 - 100}px`);
  item.style.setProperty('--scatter-rotate', `${(Math.random() - 0.5) * 30}deg`);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('assembled');
        }, i * 100); // Stagger
      }
    });
  }, { threshold: 0.2 });

  observer.observe(item);
});
```

---

## 8. SEO Optimization for 3D/Animated Sites

### Performance Considerations

- **Video:** Use WebM with H.264 fallback, compress aggressively, lazy-load below-fold videos
- **Images:** WebP/AVIF format, responsive srcset, blur-up placeholders
- **Animations:** Use `will-change` sparingly, prefer `transform` and `opacity`, avoid layout triggers
- **Loading:** Defer non-critical JS, preload hero video poster image
- **Accessibility:** Provide `prefers-reduced-motion` alternatives for all animations

```css
@media (prefers-reduced-motion: reduce) {
  .float-element,
  .mesh-bg,
  .assembly-item {
    animation: none !important;
    transition: none !important;
  }

  .assembly-item {
    opacity: 1;
    transform: none;
  }
}
```

### Structured Data

Always include JSON-LD structured data for business sites:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "url": "https://example.com",
  "telephone": "+1-555-000-0000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "ST",
    "postalCode": "12345"
  }
}
</script>
```

---

## 9. Deployment Pipeline

### Vercel Workflow

1. Build site locally, verify scroll animations and video playback
2. Push to GitHub repo
3. Deploy via `npx vercel deploy --prod`
4. Enable Vercel Analytics for visitor tracking
5. Add Speed Insights for performance monitoring
6. Assign custom domain if client-ready

### Analytics Integration

```html
<!-- Vercel Analytics (add to layout) -->
<script defer src="/_vercel/insights/script.js"></script>
```

---

## 10. Money Framework (Sales Application)

For selling premium websites with these techniques:

- **M -- Map:** Find niches with boring, outdated websites (use Firecrawl research)
- **O -- Obtain:** Scrape leads, enrich with names/emails, qualify
- **N -- Nail:** Build beautiful scroll-stopping demos using these techniques
- **E -- Execute:** Deliver free demos at scale (automated pipeline)
- **Y -- Yield:** Sell recurring services (hosting, SEO, maintenance)

### Key Differentiators for Client Pitches

- 3D animated hero sections (competitors use static images)
- Scroll-driven video transitions (cinematic feel)
- Mobile-responsive 3D effects (not just desktop)
- SEO-optimized despite heavy visuals
- Professional product photography via AI generation
