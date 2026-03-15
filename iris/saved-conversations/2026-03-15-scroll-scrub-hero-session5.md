# Session 5 Handoff: Pitch Black Theme + Video Background

**Date:** 2026-03-15
**Branch:** main (ophidian-ai submodule)
**Last submodule commit:** `3dda373` -- add particle background video from Google Flow

## What Was Completed This Session

### Pitch Black Theme (continued from Session 4)
- Background confirmed at pure `#000000` to match frame background (was #0A0A0A -- visible canvas rectangle)
- All navy (#0D1B2A) hardcoded references removed across site
- WebGL GlobalBackground (MeshGradientBg shader) fully removed -- was killing GPU performance
- Sign-up and account-setup pages use lightweight CSS radial gradient fallback

### Video Background System
- `VideoBackground` component built: fixed fullscreen looping video behind all content
- Poster image shows while video loads (AI-generated reference frame)
- Hidden on mobile, static fallback for prefers-reduced-motion
- Layout wired: VideoBackground replaces FloatingParticles in `src/app/layout.tsx`
- `scripts/generate-particle-video.cjs` -- Gemini/Flow API script for future regeneration

### Background Video -- UNRESOLVED
- Generated two Flow videos -- both rejected by Eric:
  - Attempt 1: Large rainbow colored scale masses floating toward screen (prompt too vague)
  - Attempt 2: `A_fixed_camera_looking_at_pure_black_empty_space_s_c7cc5f9f89.mp4` -- spinning space rocks
- Video file at `public/video/particle-bg.mp4` is committed but is the rejected space rocks video
- **Eric will source a replacement video himself**
- File at `shared/ophidianai-brand-assets/A_fixed_camera_looking_at_pure_black_empty_space_s_c7cc5f9f89.mp4`

### Serpent Scale + Canvas
- Contain-fit at 65% viewport (SERPENT_SCALE = 0.65 in ScrollScrubHero.tsx line 94)
- Vignette overlay masks canvas edges + Veo watermark (radial + linear gradient)
- Hero live on production: ophidianai.com

### Atmosphere Checkpoint
- Currently set to `variant="full"` in ScrollScrubHero.tsx line 178
- "Full" = 8-12 larger circuit fragments with parallax at 95% scroll completion
- "Hybrid" = 3-5 subtle fragments (more restrained)
- Eric has not made final decision on which variant to keep -- treat as open checkpoint

## What's Still Pending

### Priority 1 -- Original Unresolved Request
1. **Testimonials section missing** -- Eric reported this at the very START of the original session. Was never investigated due to hero work taking priority.
   - Check git log for when it was removed
   - Restore to homepage or wherever it belongs
   - Command: `cd engineering/projects/ophidian-ai && git log --all --oneline -- src/components/sections/Testimonials*`

### Priority 2 -- Video Background Asset
2. **Replace particle-bg.mp4** -- Current file (spinning space rocks) rejected by Eric. He will provide a new video.
   - When Eric provides a video, replace `public/video/particle-bg.mp4`
   - Ideal: dark scene with floating serpent skin fragments, scales, or particles on pure black
   - Looping, 5-15 seconds, low file size (<5MB)
   - Should work as fullscreen fixed background behind text content

### Priority 3 -- QA
3. **Live site QA** -- Verify layout looks correct on production with the VideoBackground visible (or not, since the rejected video is committed)
4. **Remaining hardcoded navy** -- These files still reference #0D1B2A:
   - `src/app/dashboard/analytics/page.tsx`
   - `src/app/dashboard/seo/page.tsx`
   - `src/app/dashboard/page.tsx`
   - `src/app/dashboard/admin/revenue/page.tsx`
   - Email templates in `onboarding.ts` and `proposals/[id]/send/route.ts`

### Priority 4 -- Storage
5. **Disk space** -- Eric's HD nearly full, PC sluggish. Quick wins:
   - `rm -rf node_modules && npm install` (re-installs clean)
   - Delete `.next/` cache
   - Check if `public/frames/serpent/` can move to Vercel Blob storage
   - Candidate services: Vercel Blob (already using Vercel), Cloudflare R2 (free tier)

### Priority 5 -- Future
6. **Higher-res frames** -- Current frames are 720p from free Flow tier. Regenerate at 1080p+ when revenue supports Flow subscription upgrade.
7. **Mobile frame set** -- `MOBILE_FRAMES = 80` in ScrollScrubHero but no separate mobile path exists in `public/frames/`. Need separate mobile frame extraction at 10fps.

## Key Files

### Hero Components (engineering/projects/ophidian-ai/src/components/hero/)
- `ScrollScrubHero.tsx` -- Main component. Frame counts lines 10-11. SERPENT_SCALE line 94. Atmosphere variant line 178.
- `HeroAtmosphere.tsx` -- Atmosphere variants (hybrid vs full)
- `HeroTextOverlay.tsx` -- "Intelligence. Engineered." + headline
- `useFrameSequence.ts` -- Progressive frame preloader (chunks of 20, isReady at 60 frames)
- `useScrollProgress.ts` -- GSAP ScrollTrigger (ref-based, no re-renders)

### Layout + Theme
- `src/app/layout.tsx` -- VideoBackground active, GlobalBackground removed
- `src/app/globals.css` -- Theme variables. Background pure #000000.
- `src/components/ui/VideoBackground.tsx` -- Fixed fullscreen video background component

### Assets
- `public/frames/serpent/` -- 121 WebP frames (git-tracked for Vercel deploy)
- `public/video/particle-bg.mp4` -- REJECTED video. Replace with new asset.
- `public/video/particle-bg-poster.png` -- Poster frame shown while video loads

### Skill
- `.claude/skills/exploding-scroll-hero/SKILL.md` -- Full 3-prompt pipeline with OphidianAI reference values

## Architecture Notes
- Frames served from `public/frames/` via Next.js static serving
- Canvas draws at 60fps via rAF, skips redraw if frame index unchanged
- Scroll progress is a `ref` (not state) -- zero React re-renders on scroll
- `prefers-reduced-motion` shows static poster, no canvas animation
- noscript fallback shows frame-0001.webp with text overlay
- VideoBackground: `position: fixed, z-index: 0` -- behind everything; content at `z-index: 10`

## Brand Context
- **Serpent narrative:** Dormant-to-awakening. Organic exterior cracks open, venom-green (#39FF14) light reveals digital internals. Not destruction -- emergence.
- **Brand thesis:** Human-AI symbiosis. "At the very top, man, working hand-in-hand with the new age of intelligence."
- **Hero as proof:** The entire scroll-scrub sequence was built with AI-generated assets -- proving OphidianAI's own capabilities.
