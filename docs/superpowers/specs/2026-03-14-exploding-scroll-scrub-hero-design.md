# Exploding Scroll-Scrub Hero -- Design Spec

**Date:** 2026-03-14
**Status:** Approved
**Author:** Iris (brainstormed with Eric)

## Overview

Replace the OphidianAI homepage hero with a scroll-driven, frame-by-frame animation of a biomechanical serpent awakening -- organic scales cracking open to reveal venom-green digital internals. This is OphidianAI's flagship visual element and a proof-of-concept for AI-driven creative automation.

This spec covers three systems:
1. A reusable 3-prompt asset generation skill (Gemini + Nano Banana 2)
2. The scroll-scrub hero implementation (Canvas + GSAP ScrollTrigger)
3. A tech-forward design direction shift for the broader site

## Brand Thesis

OphidianAI's core philosophy: the symbiotic relationship between human creativity and AI capability. The serpent awakening is the visual metaphor -- organic life intertwined with digital intelligence, becoming something greater together. AI isn't replacing the human; it's evolution.

The hero must embody this. Not destruction. Emergence.

---

## System 1: 3-Prompt Asset Generation Skill

**Skill location:** `.claude/skills/exploding-scroll-hero/SKILL.md`

A reusable, templated workflow for generating scroll-scrub frame sequences for any subject. Built for OphidianAI's serpent first, designed to be reused for future client projects.

### Current approach: Hybrid (Approach C)

- Gemini API for image generation (automated, consistent)
- Google Flow web UI for video transition (manual, quality control)
- ffmpeg for frame extraction (local, reliable)

### Future goal: Full Automation (Approach B)

When revenue supports mid-to-top-tier API subscriptions, automate the entire pipeline including Veo API for video generation. No manual steps. Proving that AI can handle the full creative pipeline.

### Prompt 1: Start Frame (Dormant State)

**Tool:** Gemini API -> Nano Banana 2 (Imagen)

**Template variables:**
- `{{subject}}` -- Description of the subject (e.g., "a biomechanical serpent")
- `{{pose}}` -- Starting pose (e.g., "coiled and dormant, tightly wound")
- `{{style}}` -- Visual style (e.g., "organic scales with subtle metallic undertones")
- `{{background_color}}` -- Must match site background (e.g., "#0A0A0A")
- `{{mood}}` -- Mood keywords (e.g., "still, latent power, potential energy")

**Template structure:**
```
Create a photorealistic, 8K resolution image of {{subject}} in a {{pose}} position.
The subject should have {{style}}.
The background must be solid {{background_color}} -- no gradients, no environment, pure dark.
Studio lighting from above-left, creating dramatic shadows.
The mood is {{mood}}.
The image should feel cinematic, professional, and high-end.
Aspect ratio: 16:9.
```

**Output:** Single high-res image (start frame)
**Human touchpoint:** Review and approve, or adjust prompt and re-run.

### Prompt 2: End Frame (Awakened State)

**Tool:** Gemini API -> Nano Banana 2, with Prompt 1's output as reference image

**Template variables:**
- `{{subject}}` -- Same subject (carried from Prompt 1)
- `{{background_color}}` -- Same background color (carried from Prompt 1)
- `{{transformation}}` -- How the subject deconstructs (e.g., "scales separated and lifted, sections of the body split apart")
- `{{internals}}` -- What's revealed inside (e.g., "glowing circuits, neural pathways, data streams")
- `{{brand_color}}` -- Primary brand color for glow (e.g., "#39FF14")
- `{{atmosphere}}` -- Atmospheric elements (e.g., "faint particles, wisps of green-lit fog")

**Template structure:**
```
Using the attached reference image as the starting point, create the end state of this subject's transformation.

The subject has {{transformation}}.
The interior reveals {{internals}}, all glowing with {{brand_color}} light.
The environment has {{atmosphere}}, illuminated by the internal glow.
Background remains {{background_color}}.
Same studio lighting setup as the reference, but now the {{brand_color}} internal glow is the dominant light source.
8K resolution, cinematic, photorealistic. Aspect ratio: 16:9.
```

**Output:** Single high-res image (end frame)
**Human touchpoint:** This is the most critical image. Iterate until the awakening/deconstruction feels right.

### Prompt 3: Transition Video

**Tool:** Google Flow (Veo 3.1) via web UI

**Input:** Start frame + end frame uploaded to Flow

**Prompt generation:** Gemini generates a Flow-optimized transition prompt.

**Template for Gemini:**
```
I need a Google Flow (Veo 3.1) prompt to create a smooth transition video between two frames.

Start frame: [describe dormant state]
End frame: [describe awakened state]

The transition should show:
- Cracks of {{brand_color}} light slowly appearing through the surface
- Sections of the exterior beginning to lift and separate
- Internal glow intensifying as more is revealed
- Atmospheric particles beginning to drift and catch the light
- The transformation should feel like an awakening, not an explosion -- controlled, inevitable, alive

Duration: 5-8 seconds
Quality: Highest available (Veo 3.1)
Style: Cinematic, smooth, professional studio quality
```

**Output:** 5-8 second video
**Human touchpoint:** Most critical step. Run multiple iterations, pick the best result.

### Frame Extraction

**Tool:** ffmpeg (local)

**Commands:**
```bash
# Extract frames at 30fps
ffmpeg -i input.mp4 -vf "fps=30" frames/frame-%04d.jpg

# Convert to WebP for web delivery (quality 85, good balance)
for f in frames/*.jpg; do
  cwebp -q 85 "$f" -o "${f%.jpg}.webp"
done

# Or convert to AVIF for even smaller files
for f in frames/*.jpg; do
  avifenc --min 20 --max 35 "$f" "${f%.jpg}.avif"
done
```

**Target output:** ~150-240 frames in WebP/AVIF format
**Target total payload:** < 10MB (WebP) or < 7MB (AVIF)

### For OphidianAI (First Use)

**Subject:** Biomechanical serpent
- Start: Coiled and dormant, organic scales with subtle metallic undertones, dark atmospheric background
- End: Scales cracked and lifted, venom-green (#39FF14) circuits and neural pathways glowing from within, particles catching the green light
- Transition: Dormant-to-awakening -- cracks of green light appear, sections lift to reveal internals, controlled emergence (not chaotic explosion)

---

## System 2: Scroll-Scrub Hero Implementation

**Component:** `ScrollScrubHero` -- replaces `HeroAnimated` on the homepage

### Architecture

```
<ScrollScrubHero>
  Container (height: 300vh)
  ├── <canvas> (position: sticky, top: 0, renders frame sequence)
  ├── <HeroTextOverlay> (headline + tagline, scroll-synced opacity)
  └── <HeroAtmosphere> (post-scrub particle/fragment layer)
</ScrollScrubHero>
```

### Scroll Behavior

| Scroll % | Visual | Text |
|-----------|--------|------|
| 0-5% | Static dormant serpent | Tagline + headline fade in |
| 5-40% | Green light cracks appear through scales | Text holds |
| 40-60% | Scales begin lifting, separating | Text fades out |
| 60-85% | Full deconstruction, internals exposed, atmosphere lit | No text |
| 85-95% | Final awakened state holds | No text |
| 95-100% | Pin releases, transition to page content | No text |

### Text Overlay

- **Tagline** (small, uppercase, tracked): "Intelligence. Engineered."
- **Headline** (large, bold): "AI that works for your business"
- Positioned center-screen over the canvas
- Fade in: scroll 0-5% (opacity 0 -> 1)
- Hold: scroll 5-35%
- Fade out: scroll 35-50% (opacity 1 -> 0)
- No text visible after 50% -- the deconstruction has full visual focus

Note: The scroll behavior table above uses 40-60% for "text fades out" as a simplified description. The precise implementation values are here: fade begins at 35%, completes at 50%.

### Post-Scrub Transition (Checkpoint -- Build Both)

**Option 1: Hybrid A+C (recommended default)**
- Canvas unpins at 95-100%
- 3-5 small circuit fragments + green particles drift from final frame into page margins
- Fragments: absolutely positioned divs, slow CSS `@keyframes float` animation
- Opacity: 10-15%
- Easy to strip if it doesn't work

**Option 2: Full C**
- Canvas unpins at 95-100%
- 8-12 fragments, slightly larger, 20-25% opacity
- Fragments respond to scroll position (parallax via GSAP)
- More immersive, heavier

**Decision:** Eric reviews both in browser, picks one.

### File Structure

```
src/
  components/
    hero/
      ScrollScrubHero.tsx          -- Main component: canvas, container, orchestration
      HeroTextOverlay.tsx          -- Headline/tagline with scroll-synced opacity
      HeroAtmosphere.tsx           -- Post-scrub fragment/particle layer
      useFrameSequence.ts          -- Hook: preloads frame images, returns array
      useScrollProgress.ts         -- Hook: GSAP ScrollTrigger binding, returns 0-1
  public/
    frames/
      serpent/
        frame-0001.webp            -- First frame (also used as poster/fallback)
        frame-0002.webp
        ...
        frame-0240.webp
```

### Dependencies

**New (must install):**
- `gsap` -- Animation engine
- `@gsap/react` -- React integration (if available) or manual `useEffect` registration

**Existing (already in project):**
- `react`, `typescript`, `tailwindcss`, `motion` (Framer Motion -- kept for non-hero animations)

### Preloading Strategy

1. **Immediate:** Load `frame-0001.webp` as a standard `<img>` element (visible within 500ms)
2. **Progressive:** On component mount, begin preloading all frames in chunks of 20
3. **Swap:** Once enough frames are loaded (first 60 frames minimum), swap from static `<img>` to `<canvas>` rendering and enable scroll-scrub
4. **Continue:** Remaining frames load in background while user scrolls through early frames

### Canvas Rendering

```typescript
// Core render function (simplified)
function drawFrame(canvas: HTMLCanvasElement, images: HTMLImageElement[], progress: number) {
  const ctx = canvas.getContext('2d');
  const frameIndex = Math.min(
    Math.floor(progress * (images.length - 1)),
    images.length - 1
  );
  const img = images[frameIndex];
  if (ctx && img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
}
```

### GSAP ScrollTrigger Setup

```typescript
// Core scroll binding (simplified)
gsap.registerPlugin(ScrollTrigger);

gsap.to(frameRef, {
  frame: totalFrames - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: containerRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5,  // slight smoothing for buttery feel
    pin: false,  // using CSS sticky instead
  },
  onUpdate: () => drawFrame(canvasRef.current, images, frameRef.frame / totalFrames),
});
```

### Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .scroll-scrub-container {
    height: auto; /* collapse the scroll runway */
  }
  .scroll-scrub-canvas {
    position: relative; /* no sticky/pin */
  }
}
```

When `prefers-reduced-motion` is active:
- Show the final awakened frame as a static image
- No scroll-scrub, no animation
- Text overlay displays normally without fade effects
- Page scrolls normally

### Canvas Sizing

- Canvas dimensions match the viewport: `width = window.innerWidth`, `height = window.innerHeight`
- Source frames are 16:9. On viewports that aren't 16:9, use `object-fit: cover` logic: scale the frame to fill the canvas (crop edges rather than letterbox)
- Resize handler updates canvas dimensions on window resize, redraws current frame
- For high-DPI displays: set canvas internal resolution to `devicePixelRatio * viewport` but cap at 2x to avoid memory issues

### Mobile Strategy

- **Breakpoint:** `768px` (matches existing Tailwind `md:` breakpoint)
- **Below 768px:** Load every 3rd frame (~50-80 frames instead of 150-240). The scroll-scrub still works but with fewer steps. This cuts payload to ~2-3MB.
- **Frame selection:** Extract the reduced set during the build step: `ffmpeg -i input.mp4 -vf "fps=10" mobile/frame-%04d.webp` (10fps instead of 30fps)
- **Scroll runway:** Reduce container height to `200vh` on mobile (less scrolling needed with fewer frames)
- **Post-scrub fragments:** Disabled on mobile (neither Hybrid nor Full C). Clean transition to content.
- **Fallback:** If the device has `< 4GB RAM` (detectable via `navigator.deviceMemory`), skip scroll-scrub entirely and show static awakened frame

### Unloaded Frame Handling

When the user scrolls past the last loaded frame:
- Hold the last loaded frame on canvas (no blank/flash)
- Continue preloading in the background
- As new frames load, the canvas updates to the correct frame for the current scroll position
- The user may see a brief "pause" in the animation if they scroll fast, but never a blank canvas

### No-JavaScript Fallback

```html
<noscript>
  <div class="scroll-scrub-fallback">
    <img src="/frames/serpent/frame-0001.webp" alt="OphidianAI -- Intelligence. Engineered." />
    <div class="hero-text-static">
      <p>Intelligence. Engineered.</p>
      <h1>AI that works for your business</h1>
    </div>
  </div>
</noscript>
```

When JS is disabled or canvas is unsupported, the component renders the first frame as a static `<img>` with the text overlay as standard HTML. No animation, no scroll-scrub. The page scrolls normally.

### GSAP Licensing

GSAP core and ScrollTrigger are free for standard use under the [GSAP Standard License](https://gsap.com/community/standard-license/). This covers:
- Websites where the end user does not pay to access the GSAP-powered content
- OphidianAI's marketing site qualifies for the free tier

No paid GSAP license (Club/Business) is needed. If OphidianAI later sells scroll-scrub as a product feature to clients, reassess at that point.

### Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 85 |
| First frame visible | < 500ms |
| Full sequence preloaded | < 3s on broadband, < 6s on 4G |
| Scroll-scrub framerate | 60fps on mid-tier devices |
| Total frame payload | < 10MB desktop (WebP) / < 3MB mobile (reduced set) |

---

## System 3: Tech-Forward Design Direction

### Changes

| Element | Current | New |
|---------|---------|-----|
| Hero | Word-reveal text + SVG grid + floating particles | Scroll-scrub serpent awakening |
| Page background | Animated SVG grid lines + particle system | Clean dark (#0D1B2A), no global animation |
| Typography | Standard weights, gradient text on all headings | Bolder headlines, tighter tracking, selective gradient use |
| Section transitions | Basic fade-up on scroll | GSAP-powered scroll reveals (subtle, purposeful) |
| Animation philosophy | Decoration everywhere | Restraint -- hero owns the drama, rest supports |

### Stays Unchanged

- Brand colors: Venom green (#39FF14), teal (#0DB1B2), dark navy (#0D1B2A)
- Glass/blur card effects (`.glass` utility)
- GlowCard spotlight hover component
- Page content structure (stats, features, process, testimonials, CTA)
- Framer Motion for non-hero section animations

### Scope Boundary

This spec covers:
- Hero replacement (old `HeroAnimated` -> new `ScrollScrubHero`)
- Removal of global SVG grid and particle background
- Addition of GSAP + ScrollTrigger to the project

This spec does NOT cover:
- Redesign of individual content sections (stats, features, etc.)
- New typography choices (future session)
- Additional GSAP scroll effects on non-hero sections (future session)

---

## Open Decisions

| Decision | Options | When to Decide |
|----------|---------|----------------|
| Post-scrub transition style | Hybrid A+C vs Full C | After seeing both implemented |
| Frame format | WebP vs AVIF | During implementation (test browser support + quality) |
| Frame count | ~150 vs ~240 | After generating the transition video (depends on video length) |
| Headline copy | Current vs revised | Can be changed independently at any time |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Nano Banana 2 can't nail the serpent anatomy | Medium | Iterate prompts; use Midjourney references for style direction |
| Frame payload too large for mobile | Low | WebP/AVIF compression; lazy chunk loading; reduced frame count on mobile |
| Scroll-scrub feels janky on low-end devices | Low | `scrub: 0.5` smoothing; frame skip on slow devices; static fallback |
| Google Flow produces inconsistent transitions | Medium | Run 6-8 iterations per attempt; this is the manual quality-control step |
| Old hero removal breaks edit mode | Low | Edit mode can show static text fallback (already has non-animated path) |

---

## Success Criteria

1. The scroll-scrub plays smoothly at 60fps on desktop Chrome, Firefox, Safari, and Edge
2. Eric signs off on the serpent awakening as the flagship visual -- subjective approval gate
3. The hero loads and displays the first frame within 500ms
4. Mobile users get a graceful experience (reduced frames or static fallback)
5. The 3-prompt skill is documented and reusable for any future subject
6. The transition from hero to page content feels intentional, not jarring
7. Lighthouse Performance score remains > 85
