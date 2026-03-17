# Session 4 Handoff: Scroll-Scrub Hero + Pitch Black Theme

**Date:** 2026-03-14
**Branch:** main (ophidian-ai submodule)
**Last commit:** `cd26be0` -- vignette overlay for canvas edge blending

## What Was Completed This Session

### Pitch Black Theme
- Theme variables updated: navy (#0D1B2A) -> pitch black (#0A0A0A), surface colors adjusted
- GlobalBackground (WebGL MeshGradientBg shader) **REMOVED** from layout -- was causing massive GPU/memory usage and PC sluggishness
- Replaced MeshGradientBg on sign-in, sign-up, account-setup with lightweight CSS radial gradient
- All hardcoded navy hex references updated across dashboard, emails, buttons, pricing
- Body background changed from gradient to flat #0A0A0A
- Glass card backgrounds updated to neutral dark

### QA Fixes (Late Session)
- Background changed from #0A0A0A to pure #000000 to match frame backgrounds (was showing visible canvas rectangle)
- FloatingParticles: removed homepage exclusion, now shows on all pages
- FloatingParticles: opacity bumped from 0.08 to 0.18, count doubled from 6 to 12
- Veo watermark visible in bottom-right of frames -- needs to be addressed when regenerating with paid Flow tier

### AI-Generated Scale Particles
- Generated 8 serpent scale fragment textures via Gemini API (Nano Banana 2) using start + end frames as reference
- 4 dormant (dark metallic) + 4 awakened (venom-green glow cracking through)
- Split from sheet into individual transparent PNGs at `public/particles/scale-1.png` through `scale-8.png`
- FloatingParticles component updated to render real images instead of CSS boxes
- All API keys moved from hardcoded to `.env.local` (old key was revoked by Google for being in committed code)

### Serpent Scale Adjustment
- Changed canvas rendering from cover-fit (stretched to fill) to contain-fit at 65% scale
- Serpent now sits centered with breathing room instead of filling the entire viewport
- Reduces pixelation from stretching 720p frames
- `SERPENT_SCALE` constant in ScrollScrubHero.tsx line 94 -- easy to adjust (0.65 currently)

### Prior Sessions (1-3) Summary
- All hero components built: ScrollScrubHero, HeroTextOverlay, HeroAtmosphere, useFrameSequence, useScrollProgress
- Real serpent frames generated via Gemini API (start + end) and Google Flow (flow-iteration-3.mp4 transition)
- 121 WebP frames at 15fps desktop, wired into homepage
- Hero is LIVE on production (ophidianai.com)
- 3-prompt asset generation skill documented in `.claude/skills/exploding-scroll-hero/SKILL.md`
- GSAP 3.14.2 + @gsap/react installed

## What's Still Pending

### Priority 1 -- Unresolved from original request
1. **Testimonials section missing** -- Eric reported testimonials gone from the homepage at the START of this conversation. Never got addressed due to the hero work taking priority. Investigate git history, find when it was removed, and restore it.

### Priority 2 -- QA
2. **QA the live site** -- Verify pitch black theme + serpent scale look correct on production. Hard refresh (Ctrl+Shift+R) needed.
3. **Serpent scale check** -- Eric hasn't confirmed 65% feels right. May need adjustment.

### Priority 3 -- Checkpoint Decision
4. **Atmosphere variant** -- Eric needs to compare "hybrid" vs "full" atmosphere and decide. Currently set to `variant="hybrid"` in ScrollScrubHero.tsx line 154. Toggle to `variant="full"` for comparison. This was flagged as a "big moment" decision that needs special consideration.

### Priority 4 -- Storage
5. **Disk space critical** -- Eric's HD is nearly full. PC is sluggish. Investigate:
   - What's consuming space (node_modules, .next cache, frame assets, etc.)
   - Cloud storage options for frame assets (Vercel Blob, Cloudflare R2, S3)
   - General cleanup opportunities across the repo

### Priority 5 -- Future Enhancements
6. **Higher-res frames** -- Current frames are 720p from free Flow tier. When Eric gets a client and upgrades Flow subscription, regenerate at 1080p+ and adjust SERPENT_SCALE back up (0.8-0.85).
7. **Mobile frame set** -- MOBILE_FRAMES = 80 in ScrollScrubHero but no separate mobile directory exists. Needs lower-res mobile frames generated.
8. **Full automation (Approach B)** -- When revenue supports API costs, automate the Google Flow step via Veo API. This is the north star -- proving full creative automation end-to-end.

## Key Files

### Hero Components (engineering/projects/ophidian-ai/)
- `src/components/hero/ScrollScrubHero.tsx` -- Main component. Frame counts lines 10-11. SERPENT_SCALE line 94.
- `src/components/hero/HeroAtmosphere.tsx` -- Atmosphere variants (hybrid vs full). Variant prop on line 154 of ScrollScrubHero.
- `src/components/hero/HeroTextOverlay.tsx` -- "Intelligence. Engineered." + headline, scroll-synced opacity
- `src/components/hero/useFrameSequence.ts` -- Progressive frame preloader (chunks of 20, mobile path switching)
- `src/components/hero/useScrollProgress.ts` -- GSAP ScrollTrigger binding (ref-based, no re-renders)
- `src/app/page.tsx` -- Homepage. ScrollScrubHero wired in on line 128.

### Theme
- `src/app/globals.css` -- Theme variables lines 15-19. Background #0A0A0A. Glass cards updated.
- `src/app/layout.tsx` -- GlobalBackground removed. FloatingParticles active.
- `src/components/ui/FloatingParticles.tsx` -- CSS-based floating particles (lightweight)

### Assets
- `public/frames/serpent/` -- 121 WebP frames (tracked in git for Vercel deploy)
- `scripts/output/` -- Raw generation assets (gitignored)
- `scripts/generate-placeholder-frames.ts` -- Dev placeholder generator (canvas package)
- `scripts/generate-serpent-start.js` -- Gemini API start frame generator

### Skill
- `.claude/skills/exploding-scroll-hero/SKILL.md` -- Full 3-prompt pipeline docs with OphidianAI reference values

## Architecture Notes
- Frames are served from `public/frames/` via Next.js static file serving
- Canvas draws frames at 60fps via requestAnimationFrame, only redraws when frame index changes
- Scroll progress is a ref (not state) to avoid React re-renders on every scroll tick
- `@media (prefers-reduced-motion: reduce)` shows static poster image, no animation
- No-JS noscript fallback shows frame 1 with text overlay

## Brand Context
- **Serpent narrative:** Dormant-to-awakening. Organic scales crack with venom-green (#39FF14) light, revealing digital internals. Not destruction -- emergence.
- **Brand thesis:** Human-AI symbiosis. The organic and digital becoming something greater together. OphidianAI proves full creative automation is possible -- from creative to administrative.
- **Eric's words:** "At the very top, man, working hand-in-hand with the new age of intelligence. He needs them just as much as they need him to succeed."
