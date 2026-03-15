# Scroll-Scrub Hero -- Session Handoff

**Date:** 2026-03-14
**Status:** Asset pipeline complete. Ready for QA + deploy.

## What Was Done (Sessions 1-3)

### Session 1 (Tasks 1-7): Foundation
- Created the 3-prompt exploding-scroll-hero skill doc (`.claude/skills/exploding-scroll-hero/SKILL.md`)
- Installed GSAP 3.14.2 + @gsap/react
- Generated 60 placeholder frames with canvas-based script
- Built `useFrameSequence` hook (progressive chunk loading, mobile path switching, low-RAM fallback)
- Built `useScrollProgress` hook (GSAP ScrollTrigger, ref-based to avoid re-renders)
- Built `HeroTextOverlay` component (scroll-synced fade in/hold/fade out)
- Built `ScrollScrubHero` main component (canvas render loop, poster fallback, reduced-motion, noscript)

### Session 2 (Tasks 8-11b): Wiring + Cleanup
- Built `HeroAtmosphere` component with both "hybrid" and "full-c" variants (checkpoint decision pending)
- Wired `ScrollScrubHero` into homepage `page.tsx`, replacing `HeroAnimated`
- Added scroll-scrub CSS and reduced-motion overrides to `globals.css`
- Removed old hero animation keyframes (spin, wave, fadeIn, etc.)
- `HeroAnimated` component preserved but no longer imported on homepage

### Session 3 (Tasks 9-10 + frame extraction): Asset Generation
- Generated start frame via Gemini API (Nano Banana 2) -- `scripts/generate-serpent-start.cjs`
- Generated end frame via Gemini API with start as reference -- `scripts/generate-serpent-end.cjs`
- Generated transition video via Veo 3.1 API -- `scripts/generate-transition-video.js`
- Also generated 4 iterations via Google Flow UI (Eric picked `flow-iteration-3.mp4`)
- Extracted frames with ffmpeg:
  - Desktop: 120 frames, 15fps, 1920x1080, WebP q75, ~12MB total
  - Mobile: 80 frames, 10fps, 1280x720, WebP q70, ~5MB total
- Updated `ScrollScrubHero` with real frame counts (120 desktop, 80 mobile)

## What's Left (Session 4)

### Immediate Next Steps
1. **Local QA** -- Run `npm run dev` in `engineering/projects/ophidian-ai` and test the scroll-scrub in browser:
   - Verify frames load and canvas renders
   - Test scroll-scrub smoothness (should be ~60fps)
   - Test text overlay fade in/hold/fade out timing
   - Test poster fallback (visible before frames load)
   - Test reduced-motion (shows static final frame)
   - Test mobile viewport (should use 80 mobile frames)

2. **Testimonials section** -- Eric noticed testimonials were removed from the live site. Check if it was removed intentionally or by accident. The `TestimonialsColumn` component exists and is imported in `page.tsx` -- verify it's actually rendered in the JSX.

3. **Checkpoint decision** -- `HeroAtmosphere` has two variants wired up:
   - `"hybrid"` (default): 5 subtle fragments + particles at 10-15% opacity
   - `"full"` : 10 fragments, slightly larger/more opaque, with parallax
   - Eric needs to see both in browser and pick. Change the `variant` prop in `ScrollScrubHero.tsx` line 154.

4. **Deploy** -- After QA passes, deploy to Vercel. Frames are in `public/frames/` (gitignored) so they need to be present in the build environment. Options:
   - Add frames to git LFS
   - Upload to CDN and update frame paths
   - Or just temporarily un-gitignore for deploy

5. **Lighthouse check** -- Target Performance > 85. The ~12MB desktop payload may impact this. Consider lazy-loading frames only when hero is in viewport (already implemented via IntersectionObserver pattern in useFrameSequence).

## Key Files

| File | Purpose |
|------|---------|
| `src/components/hero/ScrollScrubHero.tsx` | Main component |
| `src/components/hero/useFrameSequence.ts` | Frame preloader hook |
| `src/components/hero/useScrollProgress.ts` | GSAP ScrollTrigger hook |
| `src/components/hero/HeroTextOverlay.tsx` | Text overlay with scroll-fade |
| `src/components/hero/HeroAtmosphere.tsx` | Post-scrub atmosphere (checkpoint) |
| `src/app/page.tsx` | Homepage (ScrollScrubHero wired in) |
| `public/frames/serpent/` | Desktop frames (120 WebP, gitignored) |
| `public/frames/serpent/mobile/` | Mobile frames (80 WebP, gitignored) |
| `scripts/output/` | Source images + videos (gitignored) |
| `.claude/skills/exploding-scroll-hero/SKILL.md` | Asset generation skill doc |

## Brand Context

The serpent hero is OphidianAI's flagship visual -- a biomechanical serpent that starts coiled and dormant, then awakens as the user scrolls. Cracks of venom-green (#39FF14) light appear through organic scales, sections lift and separate to reveal glowing circuits and neural pathways. The narrative is dormant-to-awakening: not destruction, but emergence. The organic and digital becoming something greater together.

This is Eric's brand thesis: proving that AI and humans work best in symbiosis. The serpent IS that metaphor.

## Design Direction

Eric is shifting the site from animated grid backgrounds to a clean, dark, tech-forward aesthetic. The scroll-scrub hero IS the spectacle -- everything else should support it with restraint. The old `HeroAnimated` with SVG grid and floating particles has been replaced.
