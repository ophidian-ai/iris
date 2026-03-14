# Exploding Scroll-Scrub Hero Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the OphidianAI homepage hero with a biomechanical serpent scroll-scrub animation powered by GSAP ScrollTrigger and AI-generated frame sequences.

**Architecture:** Three sequential phases -- (1) create the reusable 3-prompt asset generation skill, (2) build the scroll-scrub hero component with Canvas + GSAP, (3) swap the old hero for the new one and remove the animated background. Assets from Phase 1 are needed before Phase 2 can be visually tested, but the code scaffold can be built with placeholder frames.

**Tech Stack:** Next.js 16, React 19, TypeScript, GSAP + ScrollTrigger, Canvas API, Tailwind CSS 4, Gemini API (Nano Banana 2), Google Flow (Veo 3.1), ffmpeg

**Spec:** `docs/superpowers/specs/2026-03-14-exploding-scroll-scrub-hero-design.md`

---

## Chunk 1: Foundation -- Skill + Dependencies + Placeholder Frames

### Task 1: Create the Exploding Scroll-Hero Skill

**Files:**

- Create: `.claude/skills/exploding-scroll-hero/SKILL.md`

- [ ] **Step 1: Write the skill document**

Create `.claude/skills/exploding-scroll-hero/SKILL.md` with the 3-prompt template workflow, ffmpeg commands, and optimization steps. This is a documentation/template file, not code.

The skill must contain:

1. Overview and purpose
2. Prerequisites (Gemini API key, Google Flow account, ffmpeg installed)
3. Prompt 1 template with `{{subject}}`, `{{pose}}`, `{{style}}`, `{{background_color}}`, `{{mood}}` variables
4. Prompt 2 template with `{{subject}}`, `{{background_color}}`, `{{transformation}}`, `{{internals}}`, `{{brand_color}}`, `{{atmosphere}}` variables
5. Prompt 3 template (Gemini generates a Google Flow prompt from start/end frame descriptions)
6. Frame extraction commands (ffmpeg at 30fps desktop, 10fps mobile)
7. Format conversion commands (WebP via cwebp, AVIF via avifenc)
8. OphidianAI serpent-specific variable values as a reference example
9. Quality checklist (dark background match, brand color accuracy, frame count targets)

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/exploding-scroll-hero/SKILL.md
git commit -m "feat: add exploding scroll-hero 3-prompt asset generation skill"
```

---

### Task 2: Install GSAP + ScrollTrigger

**Files:**

- Modify: `engineering/projects/ophidian-ai/package.json`

- [ ] **Step 1: Install GSAP and ScrollTrigger**

Run from the ophidian-ai project root:

```bash
cd engineering/projects/ophidian-ai
npm install gsap @gsap/react
```

GSAP 3.x includes ScrollTrigger as a plugin. `@gsap/react` provides the `useGSAP` hook for proper cleanup.

- [ ] **Step 2: Verify installation**

```bash
node -e "const gsap = require('gsap'); console.log('GSAP version:', gsap.gsap.version)"
```

Expected: prints GSAP version (3.x)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install gsap and @gsap/react for scroll-scrub hero"
```

---

### Task 3: Create Placeholder Frame Sequence

We need frames to develop against before the real AI-generated assets exist. Generate a numbered sequence of simple gradient images that simulate the scroll-scrub behavior.

**Files:**

- Create: `engineering/projects/ophidian-ai/public/frames/serpent/` (directory with placeholder images)
- Create: `engineering/projects/ophidian-ai/scripts/generate-placeholder-frames.ts`

- [ ] **Step 1: Write the placeholder frame generator script**

Create `engineering/projects/ophidian-ai/scripts/generate-placeholder-frames.ts`:

This Node.js script generates 60 simple placeholder PNG frames (numbered `frame-0001.png` through `frame-0060.png`) using the Canvas API. Each frame shows a dark background with a venom-green circle that progressively "explodes" (scales up and fragments) across the sequence. These are development-only placeholders -- they get replaced by real AI-generated frames later.

The script should:
- Create the `public/frames/serpent/` directory if it doesn't exist
- Generate 60 frames at 1920x1080
- Frame 1-15: solid green circle centered on dark background (dormant)
- Frame 16-40: circle develops cracks (green lines radiating outward)
- Frame 41-60: circle fragments scatter outward, particles appear
- Use `canvas` npm package for server-side rendering (or raw file writes with simple shapes)

Keep it simple -- these are throwaway dev assets. Output files as `.webp` format (matching the production frame format so the `useFrameSequence` hook works without extension switching during development).

- [ ] **Step 2: Run the generator**

```bash
cd engineering/projects/ophidian-ai
npx tsx scripts/generate-placeholder-frames.ts
```

Verify: `ls public/frames/serpent/*.webp | wc -l` should output `60`

- [ ] **Step 3: Add frames directory to .gitignore**

Add to `engineering/projects/ophidian-ai/.gitignore`:

```
# Scroll-scrub frame sequences (too large for git, generated from AI pipeline)
public/frames/
```

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-placeholder-frames.ts .gitignore
git commit -m "feat: add placeholder frame generator for scroll-scrub development"
```

---

## Chunk 2: Core Scroll-Scrub Components

### Task 4: Build useFrameSequence Hook

**Files:**

- Create: `engineering/projects/ophidian-ai/src/components/hero/useFrameSequence.ts`

- [ ] **Step 1: Create the hero directory**

```bash
mkdir -p engineering/projects/ophidian-ai/src/components/hero
```

- [ ] **Step 2: Write the useFrameSequence hook**

Create `engineering/projects/ophidian-ai/src/components/hero/useFrameSequence.ts`:

This hook handles:
- Accepting a frame path pattern and total frame count
- Immediately loading frame 1 (poster)
- Progressively preloading remaining frames in chunks of 20
- Tracking load progress (0-1)
- Returning: `{ images: HTMLImageElement[], progress: number, isReady: boolean, posterSrc: string }`
- `isReady` becomes true when first 60 frames (or all frames if < 60) are loaded
- Mobile detection: if `window.innerWidth < 768`, load from `/frames/serpent/mobile/` with reduced count
- Low-RAM fallback: if `navigator.deviceMemory < 4`, return immediately with only the poster frame and `isReady: false`

Key implementation details:
- Use `new Image()` with `onload`/`onerror` handlers
- Store images in a `useRef<HTMLImageElement[]>` to avoid re-renders on each frame load
- Track `loadedCount` in state to trigger `isReady` and provide `progress`
- Frame path format: `/frames/serpent/frame-NNNN.webp` (zero-padded to 4 digits)

- [ ] **Step 3: Commit**

```bash
cd engineering/projects/ophidian-ai
git add src/components/hero/useFrameSequence.ts
git commit -m "feat: add useFrameSequence hook for progressive frame preloading"
```

---

### Task 5: Build useScrollProgress Hook

**Files:**

- Create: `engineering/projects/ophidian-ai/src/components/hero/useScrollProgress.ts`

- [ ] **Step 1: Write the useScrollProgress hook**

Create `engineering/projects/ophidian-ai/src/components/hero/useScrollProgress.ts`:

This hook handles:
- Accepting a `containerRef` (RefObject<HTMLDivElement>)
- Registering GSAP ScrollTrigger on mount
- Returning: `{ progress: number }` (0-1 value synced to scroll position)
- ScrollTrigger config:
  - `trigger`: the container element
  - `start`: `"top top"`
  - `end`: `"bottom bottom"`
  - `scrub`: `0.5` (slight smoothing)
- Cleanup on unmount (kill ScrollTrigger instance)
- Uses `useGSAP` from `@gsap/react` for automatic cleanup, or manual `useEffect` + `useRef` if `useGSAP` is unavailable

Key implementation:

```typescript
"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    triggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        setProgress(self.progress);
      },
    });

    return () => {
      triggerRef.current?.kill();
    };
  }, [containerRef]);

  return { progress };
}
```

Note: Using `useState` for progress will cause re-renders on every scroll tick. For performance, consider using a `useRef` for progress and a `requestAnimationFrame` callback pattern instead. The component that consumes this hook will use `useRef` + direct canvas drawing rather than React state for the actual frame rendering. The `progress` state is only needed for the text overlay opacity (which is CSS-driven via GSAP, not React state).

**Revised approach:** Export progress as a ref, not state:

```typescript
export function useScrollProgress(containerRef: React.RefObject<HTMLDivElement | null>) {
  const progressRef = useRef(0);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    triggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => {
      triggerRef.current?.kill();
    };
  }, [containerRef]);

  return { progressRef };
}
```

The canvas draw loop reads `progressRef.current` directly -- no React re-renders.

- [ ] **Step 2: Commit**

```bash
cd engineering/projects/ophidian-ai
git add src/components/hero/useScrollProgress.ts
git commit -m "feat: add useScrollProgress hook with GSAP ScrollTrigger binding"
```

---

### Task 6: Build HeroTextOverlay Component

**Files:**

- Create: `engineering/projects/ophidian-ai/src/components/hero/HeroTextOverlay.tsx`

- [ ] **Step 1: Write the HeroTextOverlay component**

Create `engineering/projects/ophidian-ai/src/components/hero/HeroTextOverlay.tsx`:

This component renders the headline and tagline over the canvas, with opacity driven by GSAP scroll progress.

Props:
- `containerRef`: RefObject<HTMLDivElement> -- the scroll container (for ScrollTrigger targeting)

Behavior:
- Tagline: "Intelligence. Engineered." -- small, uppercase, tracked wide
- Headline: "AI that works for your business" -- large, bold
- GSAP timeline tied to the same ScrollTrigger as the main hero:
  - 0-5% scroll: fade in (opacity 0 -> 1)
  - 5-35% scroll: hold (opacity 1)
  - 35-50% scroll: fade out (opacity 1 -> 0)
- Positioned absolutely, centered horizontally and vertically over the canvas
- Uses `useEffect` to create a GSAP timeline with ScrollTrigger
- `pointer-events: none` so it doesn't block scroll interaction

Styling (Tailwind):
- Container: `absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10`
- Tagline: `text-sm uppercase tracking-[0.3em] text-white/80 mb-4`
- Headline: `text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center max-w-4xl`

Reduced motion: If `prefers-reduced-motion`, show text at full opacity, no GSAP animation.

- [ ] **Step 2: Commit**

```bash
cd engineering/projects/ophidian-ai
git add src/components/hero/HeroTextOverlay.tsx
git commit -m "feat: add HeroTextOverlay with GSAP scroll-synced opacity"
```

---

### Task 7: Build ScrollScrubHero Main Component

**Files:**

- Create: `engineering/projects/ophidian-ai/src/components/hero/ScrollScrubHero.tsx`

- [ ] **Step 1: Write the ScrollScrubHero component**

Create `engineering/projects/ophidian-ai/src/components/hero/ScrollScrubHero.tsx`:

This is the main orchestrator component. It composes `useFrameSequence`, `useScrollProgress`, `HeroTextOverlay`, and the canvas.

Define constants at the top of the file:

```typescript
// Frame counts -- update after real asset generation (Task 12 Step 6)
const DESKTOP_FRAMES = 60;  // placeholder count; real count ~150-240
const MOBILE_FRAMES = 60;   // placeholder count; real count ~50-80
```

Structure (all code snippets below must be combined into a single file):

```tsx
"use client";

export function ScrollScrubHero() {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mobile + reduced motion detection (defined first, used in hooks and JSX)
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const totalFrames = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;

  // Hooks
  const { images, isReady, posterSrc } = useFrameSequence("/frames/serpent/frame-", totalFrames);
  const { progressRef } = useScrollProgress(containerRef);

  // Canvas draw loop
  useEffect(() => {
    // Set up requestAnimationFrame loop that reads progressRef.current
    // and draws the corresponding frame to the canvas
    // Only active when isReady is true
  }, [isReady, images]);

  // Canvas resize handler
  useEffect(() => {
    // Set canvas dimensions to viewport * devicePixelRatio (capped at 2x)
    // Re-run on window resize
  }, []);

  return (
    <div ref={containerRef} className="scroll-scrub-container relative" style={{ height: isMobile ? '200vh' : '300vh' }}>
      {/* Poster image (visible until canvas is ready) */}
      {!isReady && (
        <div className="sticky top-0 h-screen w-full">
          <img src={posterSrc} alt="OphidianAI" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Canvas (visible when frames are loaded) */}
      <canvas
        ref={canvasRef}
        className={`sticky top-0 h-screen w-full ${isReady ? '' : 'hidden'}`}
      />

      {/* Text overlay */}
      <HeroTextOverlay containerRef={containerRef} />

      {/* No-JS fallback */}
      <noscript>
        <div className="h-screen w-full relative">
          <img src="/frames/serpent/frame-0001.webp" alt="OphidianAI -- Intelligence. Engineered." className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80 mb-4">Intelligence. Engineered.</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white text-center">AI that works for your business</h1>
          </div>
        </div>
      </noscript>
    </div>
  );
}
```

Key implementation details:

**Canvas draw loop** -- Use `requestAnimationFrame` to continuously check `progressRef.current` and draw the correct frame. This avoids React state updates on scroll:

```typescript
useEffect(() => {
  if (!isReady || !canvasRef.current) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let rafId: number;
  let lastFrame = -1;

  function render() {
    const frameIndex = Math.min(
      Math.floor(progressRef.current * (images.length - 1)),
      images.length - 1
    );
    // Only redraw if frame changed
    if (frameIndex !== lastFrame && images[frameIndex]) {
      // Cover-fit logic: scale to fill, crop edges
      const img = images[frameIndex];
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, w, h);
      lastFrame = frameIndex;
    }
    rafId = requestAnimationFrame(render);
  }

  render();
  return () => cancelAnimationFrame(rafId);
}, [isReady, images, progressRef]);
```

**Canvas resize** -- Listen for window resize, update canvas dimensions:

```typescript
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas!.width = window.innerWidth * dpr;
    canvas!.height = window.innerHeight * dpr;
    canvas!.style.width = window.innerWidth + "px";
    canvas!.style.height = window.innerHeight + "px";
  }

  resize();
  window.addEventListener("resize", resize);
  return () => window.removeEventListener("resize", resize);
}, []);
```

**Reduced motion handling** (mobile detection and `prefersReducedMotion` are already defined at the top of the component -- see above):

If `prefersReducedMotion` is true, render a static `<img>` of the final frame with text overlay at full opacity. No scroll-scrub, no GSAP, container height is `auto`.

- [ ] **Step 2: Verify the component builds**

```bash
cd engineering/projects/ophidian-ai
npx next build 2>&1 | tail -5
```

Expected: Build succeeds (the component isn't wired to the page yet, but it should compile)

- [ ] **Step 3: Commit**

```bash
cd engineering/projects/ophidian-ai
git add src/components/hero/ScrollScrubHero.tsx
git commit -m "feat: add ScrollScrubHero main component with canvas render loop"
```

---

## Chunk 3: Post-Scrub Atmosphere + Integration

### Task 8: Build HeroAtmosphere Component (Both Variants)

**Files:**

- Create: `engineering/projects/ophidian-ai/src/components/hero/HeroAtmosphere.tsx`

- [ ] **Step 1: Write the HeroAtmosphere component**

Create `engineering/projects/ophidian-ai/src/components/hero/HeroAtmosphere.tsx`:

This component renders the post-scrub floating fragments. It supports two modes controlled by a prop:

Props:
- `variant`: `"hybrid" | "full"` -- which transition style to render
- `active`: `boolean` -- whether fragments are visible (tied to scroll progress > 95%)

**Hybrid variant (A+C):**
- 3-5 small fragment divs
- Each is a small rectangle (20-40px) with a venom-green glow/border
- CSS `@keyframes float` animation with random delays and durations (8-15s)
- Positioned in page margins (left/right edges)
- Opacity: 10-15%
- No scroll interaction

**Full C variant:**
- 8-12 fragment divs, slightly larger (30-60px)
- Same green glow styling but at 20-25% opacity
- GSAP-driven parallax: each fragment has a `data-speed` attribute, moves at different rates on scroll
- More dramatic presence

Both variants:
- Disabled on mobile (`hidden md:block`)
- Disabled when `prefers-reduced-motion` is active
- Fragments use `position: fixed` so they persist as page scrolls
- Fragment shapes: small rounded rectangles with `border: 1px solid rgba(57, 255, 20, 0.3)` and `box-shadow: 0 0 8px rgba(57, 255, 20, 0.15)`

The component should define fragment data (positions, sizes, animation delays) as a static array, then map over it to render.

- [ ] **Step 2: Commit**

```bash
cd engineering/projects/ophidian-ai
git add src/components/hero/HeroAtmosphere.tsx
git commit -m "feat: add HeroAtmosphere with hybrid and full-c variants"
```

---

### Task 9: Wire ScrollScrubHero to Homepage

**Files:**

- Modify: `engineering/projects/ophidian-ai/src/app/page.tsx`

- [ ] **Step 1: Import and add ScrollScrubHero to page.tsx**

In `engineering/projects/ophidian-ai/src/app/page.tsx`:

1. Add import: `import { ScrollScrubHero } from "@/components/hero/ScrollScrubHero";`
2. Replace the hero section. The current hero is the `isEditMode ? <section>... : <HeroAnimated>` block (approximately lines 57-71). Replace both branches:
   - Non-edit-mode: render `<ScrollScrubHero />`
   - Edit-mode: keep the existing editable text section (it still works as a static fallback for content editing)
3. Remove the `HeroAnimated` import since it's no longer used in the non-edit path

The edit stays like this:

```tsx
// Remove this import:
// import { HeroAnimated } from "@/components/ui/hero-animated";

// Add this import:
import { ScrollScrubHero } from "@/components/hero/ScrollScrubHero";

// In the JSX, replace the hero conditional:
{isEditMode ? (
  <section className="pt-32 pb-24 md:pb-32 text-center px-4">
    {/* ... existing editable text fields stay ... */}
  </section>
) : (
  <ScrollScrubHero />
)}
```

- [ ] **Step 2: Build and verify**

```bash
cd engineering/projects/ophidian-ai
npx next build 2>&1 | tail -5
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire ScrollScrubHero to homepage, replacing HeroAnimated"
```

---

### Task 10: Add Scroll-Scrub CSS to Globals

**Files:**

- Modify: `engineering/projects/ophidian-ai/src/app/globals.css`

- [ ] **Step 1: Add scroll-scrub specific styles**

Add to the end of `engineering/projects/ophidian-ai/src/app/globals.css`:

```css
/* Scroll-scrub hero */
.scroll-scrub-container {
  position: relative;
  width: 100%;
}

.scroll-scrub-container canvas {
  display: block;
}

/* Atmosphere fragment float animation */
@keyframes fragment-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(2deg); }
  50% { transform: translateY(-5px) rotate(-1deg); }
  75% { transform: translateY(-20px) rotate(1.5deg); }
}

/* Reduced motion: collapse scroll runway, disable animations */
@media (prefers-reduced-motion: reduce) {
  .scroll-scrub-container {
    height: auto !important;
  }

  .scroll-scrub-container canvas {
    position: relative !important;
  }

  .hero-atmosphere {
    display: none !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add scroll-scrub CSS and reduced-motion overrides"
```

---

### Task 11: Remove Old Animated Background

**Files:**

- Modify: `engineering/projects/ophidian-ai/src/app/globals.css` (remove grid/particle keyframes if exclusively used by old hero)
- Note: Do NOT delete `src/components/ui/hero-animated.tsx` yet -- it's still referenced by the edit-mode path and can be cleaned up in a future session

- [ ] **Step 1: Audit which animations are hero-only**

Check `engineering/projects/ophidian-ai/src/app/globals.css` for these keyframes and check if they're used anywhere other than `hero-animated.tsx`:

- `@keyframes word-appear` -- used in hero only? If yes, mark for removal
- `@keyframes grid-draw` -- used in hero only? If yes, mark for removal
- `@keyframes float` -- could be used elsewhere (check all components)

Search across the codebase:

```bash
cd engineering/projects/ophidian-ai
grep -r "word-appear\|grid-draw" src/ --include="*.tsx" --include="*.css" -l
```

Only remove keyframes and utility classes that are exclusively used by `hero-animated.tsx`. If anything is shared, leave it.

- [ ] **Step 2: Remove hero-only animations from globals.css**

Based on the audit, remove the keyframes and associated classes that are only used by the old hero. Do NOT remove shared animations.

- [ ] **Step 3: Build and verify**

```bash
npx next build 2>&1 | tail -5
```

Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
cd engineering/projects/ophidian-ai
git add src/app/globals.css
git commit -m "refactor: remove old hero-only animation keyframes from globals"
```

---

### Task 11b: Remove Global SVG Grid and Particle Background

The spec requires removing the animated SVG grid lines and floating particle system from the site background. These live in `hero-animated.tsx` and are rendered on the homepage. Since the new `ScrollScrubHero` replaces the old hero entirely (in non-edit mode), the grid and particles are already gone from the main view. However, verify that no other page or layout uses these elements globally.

**Files:**

- Audit: `engineering/projects/ophidian-ai/src/components/ui/hero-animated.tsx`
- Audit: `engineering/projects/ophidian-ai/src/app/layout.tsx`
- Potentially modify: any layout or shared component that renders grid/particle backgrounds

- [ ] **Step 1: Search for global grid/particle usage**

```bash
cd engineering/projects/ophidian-ai
grep -r "grid-draw\|float.*particle\|svg.*grid\|animat.*grid\|particle" src/ --include="*.tsx" -l
```

If results show only `hero-animated.tsx` -- the old hero already contains all grid/particle code and it's isolated. No further action needed beyond Task 9 which already replaced it.

If results show other files (layout, shared components, other pages) -- those files need to be modified to remove the animated background elements.

- [ ] **Step 2: Remove any global animated background elements found**

For each file identified in Step 1 (other than `hero-animated.tsx`):
- Remove SVG grid rendering code
- Remove floating particle/dot elements
- Keep the clean dark background (#0D1B2A)

- [ ] **Step 3: Build and verify**

```bash
cd engineering/projects/ophidian-ai
npx next build 2>&1 | tail -5
```

- [ ] **Step 4: Commit if changes were made**

```bash
cd engineering/projects/ophidian-ai
git add -u src/
git commit -m "refactor: remove global animated grid/particle background"
```

---

## Chunk 4: Asset Generation (Human-in-the-Loop)

### Task 12: Generate Serpent Frame Sequence

This task requires human interaction with AI image generation tools. It cannot be fully automated yet (Approach C from the spec).

**Files:**

- Output: `engineering/projects/ophidian-ai/public/frames/serpent/frame-0001.webp` through `frame-NNNN.webp`
- Output: `engineering/projects/ophidian-ai/public/frames/serpent/mobile/frame-0001.webp` through `frame-NNNN.webp`

- [ ] **Step 1: Generate start frame using the exploding-scroll-hero skill**

Invoke the skill at `.claude/skills/exploding-scroll-hero/SKILL.md`.

Use the OphidianAI serpent variables:
- `{{subject}}`: "a biomechanical serpent with organic scales and subtle metallic undertones"
- `{{pose}}`: "coiled and dormant, tightly wound, head resting on its body"
- `{{style}}`: "photorealistic organic reptilian scales transitioning to brushed dark metal at the edges, hints of circuitry visible at scale seams"
- `{{background_color}}`: "#0A0A0A"
- `{{mood}}`: "still, latent power, potential energy, dormant intelligence"

Call the Gemini API with the assembled prompt. Review the output. Iterate until satisfied.

Save the approved image as `start-frame.png` in a working directory.

- [ ] **Step 2: Generate end frame**

Use the start frame as the reference image with Prompt 2 variables:
- `{{transformation}}`: "scales cracked and lifted away from the body, sections of the serpent split apart revealing the interior"
- `{{internals}}`: "glowing venom-green (#39FF14) circuits, pulsing neural pathways, streams of data flowing through translucent conduits"
- `{{brand_color}}`: "#39FF14"
- `{{atmosphere}}`: "faint green-lit particles floating around the deconstructed form, wisps of luminous fog"

Call the Gemini API with the assembled prompt and attached start frame. Iterate until the awakening feels right.

Save as `end-frame.png`.

- [ ] **Step 3: Generate transition video via Google Flow**

1. Go to labs.google.com/flow
2. Select "Frames to Video"
3. Upload start-frame.png as first frame, end-frame.png as second frame
4. Use the Prompt 3 template to generate a Flow-optimized transition prompt via Gemini
5. Set quality to Veo 3.1 (highest)
6. Generate multiple iterations (6-8 recommended)
7. Pick the best result
8. Download at original/upscaled size

Save as `transition.mp4`.

- [ ] **Step 4: Extract frames with ffmpeg**

```bash
# Create output directories
mkdir -p engineering/projects/ophidian-ai/public/frames/serpent
mkdir -p engineering/projects/ophidian-ai/public/frames/serpent/mobile

# Desktop: 30fps full sequence
ffmpeg -i transition.mp4 -vf "fps=30,scale=1920:1080" engineering/projects/ophidian-ai/public/frames/serpent/frame-%04d.jpg

# Mobile: 10fps reduced sequence
ffmpeg -i transition.mp4 -vf "fps=10,scale=1280:720" engineering/projects/ophidian-ai/public/frames/serpent/mobile/frame-%04d.jpg
```

- [ ] **Step 5: Convert to WebP and AVIF (compare both)**

The spec lists frame format (WebP vs AVIF) as an open decision. Generate both, compare size and quality, then pick one.

```bash
cd engineering/projects/ophidian-ai/public/frames/serpent

# WebP conversion
mkdir -p webp
for f in *.jpg; do
  cwebp -q 85 "$f" -o "webp/${f%.jpg}.webp"
done

# AVIF conversion
mkdir -p avif
for f in *.jpg; do
  avifenc --min 20 --max 35 "$f" "avif/${f%.jpg}.avif"
done

# Compare sizes
echo "WebP total:" && du -sh webp/
echo "AVIF total:" && du -sh avif/
```

Compare:
- **Size:** AVIF is typically 20-30% smaller than WebP at equivalent quality
- **Quality:** Open a few frames from each in a browser side by side -- check for artifacts
- **Browser support:** WebP has universal support. AVIF is supported in Chrome 85+, Firefox 93+, Safari 16+. Edge cases: older Safari on iOS may not support AVIF.

Pick the winner. Move the chosen format's files to the main directory, delete the other:

```bash
# Example if WebP wins:
mv webp/*.webp .
rm -rf webp avif *.jpg

# Do the same for mobile/
cd mobile
# (repeat WebP/AVIF comparison and selection)
```

Desktop target: < 10MB. Mobile target: < 3MB.

- [ ] **Step 6: Update frame count constant in ScrollScrubHero**

After extracting, count the frames:

```bash
ls engineering/projects/ophidian-ai/public/frames/serpent/*.webp | wc -l
```

Update the `TOTAL_FRAMES` constant in `ScrollScrubHero.tsx` to match the actual count. Also update the mobile frame count.

- [ ] **Step 7: Commit (script and config only -- frames are gitignored)**

```bash
git add src/components/hero/ScrollScrubHero.tsx
git commit -m "feat: update frame counts for real serpent sequence"
```

---

## Chunk 5: Visual QA + Post-Scrub Checkpoint

### Task 13: Dev Server Test + Visual QA

- [ ] **Step 1: Start the dev server**

```bash
cd engineering/projects/ophidian-ai
npm run dev
```

Open `http://localhost:3000` in Chrome.

- [ ] **Step 2: Test scroll-scrub behavior**

Verify:
- First frame appears within 500ms of page load
- Scrolling through the hero section plays the frame sequence smoothly
- Text overlay fades in at the start, holds, then fades out before the dramatic deconstruction
- The animation completes and content scrolls in after the hero
- No blank frames, no flashing, no jank

- [ ] **Step 3: Test mobile**

Open Chrome DevTools, toggle device toolbar (Ctrl+Shift+M), select a mobile viewport (e.g., iPhone 14).

Verify:
- Reduced frame set loads (mobile directory)
- Container height is 200vh (shorter scroll)
- No post-scrub fragments visible
- Smooth playback with fewer frames

- [ ] **Step 4: Test reduced motion**

In Chrome DevTools: Rendering tab > Emulate CSS media feature `prefers-reduced-motion: reduce`

Verify:
- Static final frame image displayed
- No scroll-scrub, no animation
- Text visible at full opacity
- Page scrolls normally

- [ ] **Step 5: Test cross-browser**

Test in Firefox and Edge (at minimum). Verify scroll-scrub works in both.

Note: Safari testing is required by the spec (success criterion #1) but is not available on Windows. If a Mac is accessible, test there. Otherwise, acknowledge the gap and plan to test Safari before any production deploy. Safari-specific risks: Canvas performance differences, ScrollTrigger behavior with Safari's elastic scrolling.

---

### Task 14: Post-Scrub Checkpoint -- Compare Both Variants

This is the decision checkpoint from the spec. Eric needs to see both variants and pick one.

- [ ] **Step 1: Test Hybrid A+C variant**

In `ScrollScrubHero.tsx`, set the `HeroAtmosphere` variant to `"hybrid"`. Run dev server. Scroll through the full hero and observe the post-scrub transition.

Note: subtle fragments drifting in margins at 10-15% opacity.

- [ ] **Step 2: Test Full C variant**

Change variant to `"full"`. Reload. Scroll through again.

Note: more fragments, higher opacity, parallax scroll response.

- [ ] **Step 3: Eric decides**

Present both to Eric. He picks one. Update the default variant in `ScrollScrubHero.tsx` accordingly. Remove the unused variant code if desired (or keep both for future A/B testing).

- [ ] **Step 4: Commit final variant choice**

```bash
git add src/components/hero/ScrollScrubHero.tsx src/components/hero/HeroAtmosphere.tsx
git commit -m "feat: finalize post-scrub transition variant (Eric's pick)"
```

---

### Task 15: Production Build + Performance Check

- [ ] **Step 1: Run production build**

```bash
cd engineering/projects/ophidian-ai
npx next build 2>&1 | tail -20
```

Expected: Build succeeds

- [ ] **Step 2: Run Lighthouse audit**

Start production server:

```bash
npx next start &
```

Run Lighthouse (Chrome DevTools > Lighthouse tab, or CLI):

```bash
npx lighthouse http://localhost:3000 --output json --output-path lighthouse-report.json
```

Check Performance score. Target: > 85.

If under 85, investigate:
- Frame payload too large? Increase WebP compression or reduce frame count
- LCP too slow? Ensure poster image loads immediately via priority `<img>`
- CLS issues? Ensure canvas/container have explicit dimensions

- [ ] **Step 3: Commit any performance fixes**

```bash
cd engineering/projects/ophidian-ai
git add -u src/
git commit -m "perf: optimize scroll-scrub hero for Lighthouse targets"
```

---

### Task 16: Final Commit + Eric Sign-Off

- [ ] **Step 1: Verify all success criteria**

| Criterion | How to Verify |
|-----------|---------------|
| 60fps scroll-scrub on desktop | Chrome DevTools Performance tab -- no dropped frames |
| Eric approves the visual | Subjective -- show him |
| First frame < 500ms | Network tab, check frame-0001.webp load time |
| Mobile graceful | DevTools mobile viewport test |
| Skill is reusable | Read `.claude/skills/exploding-scroll-hero/SKILL.md` -- has all templates |
| Hero-to-content transition | Visual inspection -- no jarring cut |
| Lighthouse > 85 | Lighthouse report |

- [ ] **Step 2: Eric signs off**

Show Eric the live site (dev or production). Get approval on the serpent awakening visual.

- [ ] **Step 3: Final commit if any last tweaks**

```bash
cd engineering/projects/ophidian-ai
git add -u src/ public/
git commit -m "feat: complete exploding scroll-scrub hero implementation"
```
