# Scroll-Scrub Hero Implementation -- Session Handoff

**Date:** 2026-03-14
**Status:** Chunks 1-3 complete. Ready for Chunk 4 (asset generation).

## What Was Done (Tasks 1-11b)

### Chunk 1: Foundation
- **Task 1:** Created 3-prompt asset generation skill at `.claude/skills/exploding-scroll-hero/SKILL.md`
- **Task 2:** Installed GSAP 3.14.2 + @gsap/react in ophidian-ai project
- **Task 3:** Built placeholder frame generator (`scripts/generate-placeholder-frames.ts`) -- 60 dev frames in `public/frames/serpent/`

### Chunk 2: Core Components
- **Task 4:** `useFrameSequence.ts` -- Progressive preloading hook (chunks of 20, mobile path switching, low-RAM fallback)
- **Task 5:** `useScrollProgress.ts` -- GSAP ScrollTrigger binding, ref-based (no re-renders)
- **Task 6:** `HeroTextOverlay.tsx` -- Tagline + headline with scroll-synced opacity (fade in 0-5%, hold 5-35%, fade out 35-50%)
- **Task 7:** `ScrollScrubHero.tsx` -- Main orchestrator: canvas render loop, cover-fit, poster fallback, reduced-motion, no-JS noscript

### Chunk 3: Atmosphere + Integration
- **Task 8:** `HeroAtmosphere.tsx` -- Both variants built (hybrid: 4 fragments, CSS float, 10-15% opacity; full-c: 10 fragments, GSAP parallax, 20-25% opacity)
- **Task 9:** Wired ScrollScrubHero into `page.tsx`, replacing HeroAnimated in non-edit mode
- **Task 10:** Added scroll-scrub CSS: fragment-float keyframes, container styles, reduced-motion overrides
- **Task 11:** Removed old hero-only animations from globals.css (word-appear, grid-draw, float, .word, .grid-line, .detail-dot, .floating-element, .corner-element)
- **Task 11b:** Confirmed SVG grid/particle code is isolated to hero-animated.tsx -- no global usage found

## What's Next (Chunk 4: Task 12 -- Asset Generation)

This is the human-in-the-loop step. Requires Eric's involvement.

### Steps:
1. **Generate start frame** -- Use Gemini API with Prompt 1 template from the skill. Variables are pre-filled in the skill doc under "OphidianAI Reference."
2. **Generate end frame** -- Use Gemini API with Prompt 2, attaching start frame as reference image.
3. **Generate transition video** -- Upload both frames to Google Flow (Veo 3.1), use Prompt 3 template. Generate 6-8 iterations, pick the best.
4. **Extract frames** -- `ffmpeg -i transition.mp4 -vf "fps=30,scale=1920:1080" frames/desktop/frame-%04d.jpg`
5. **Convert to WebP** -- `for f in *.jpg; do cwebp -q 85 "$f" -o "${f%.jpg}.webp"; done`
6. **Update frame counts** -- Change `DESKTOP_FRAMES` and `MOBILE_FRAMES` constants in `ScrollScrubHero.tsx`

### After Task 12 (Chunk 5: QA):
- Task 13: Dev server visual QA (desktop, mobile, reduced-motion, cross-browser)
- Task 14: Post-scrub checkpoint -- show Eric both atmosphere variants (hybrid vs full-c), he picks
- Task 15: Production build + Lighthouse audit (target > 85)
- Task 16: Final sign-off

## Key Files

All in `engineering/projects/ophidian-ai/`:

```
src/components/hero/
  ScrollScrubHero.tsx          -- Main component
  HeroTextOverlay.tsx          -- Text overlay
  HeroAtmosphere.tsx           -- Post-scrub fragments (both variants)
  useFrameSequence.ts          -- Frame preloading hook
  useScrollProgress.ts         -- GSAP scroll binding hook

public/frames/serpent/         -- Frame sequence (gitignored, 60 placeholders currently)
scripts/generate-placeholder-frames.ts  -- Dev frame generator
src/app/page.tsx               -- Homepage (ScrollScrubHero wired in)
src/app/globals.css            -- Scroll-scrub CSS added, old hero CSS removed
```

## Design Decisions (Locked In)

- **Subject:** Biomechanical serpent -- organic exterior, digital internals
- **Narrative:** Dormant-to-awakening (not destruction -- emergence)
- **Background:** Deep dark with subtle atmosphere (#0A0A0A base)
- **Brand thesis:** Human-AI symbiosis, organic becoming digital
- **Post-scrub:** Checkpoint -- build both hybrid A+C and full C, Eric decides after seeing both

## Testimonials

Eric mentioned testimonials being gone from the site. They're still in the code at `page.tsx` lines 216-246. The data and component (`TestimonialsColumn`) are intact. If they're not showing on the deployed site, it's likely a deployment/build issue rather than a code removal.

## Notes

- `hero-animated.tsx` still exists but is no longer imported in the non-edit path. Can be deleted in a future cleanup pass.
- The `HeroAnimated` import is still in `page.tsx` but unused in the non-edit branch. Left for now since edit mode still references the old static text fields.
- Placeholder frames are PNG bytes with .webp extensions -- works fine in dev. Real frames will be actual WebP.
- `smooth-scrolling` is enabled in globals.css (`scroll-behavior: smooth`). This may conflict with GSAP ScrollTrigger. If scroll feels off during QA, remove `scroll-behavior: smooth` from globals.
