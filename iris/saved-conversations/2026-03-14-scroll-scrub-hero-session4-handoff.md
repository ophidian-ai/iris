# Session 4 Handoff: Scroll-Scrub Hero + Design Extension

**Date:** 2026-03-14
**Session:** 4 of 4 (implementation complete, QA + storage remaining)

## What Was Done This Session

### Design Extension: Pitch Black Theme
- Updated all background colors from navy (#0D1B2A) to pitch black (#0A0A0A)
- Updated surface/surface-hover colors to neutral grays (#161616, #1E1E1E)
- Updated glass card background to neutral
- Replaced gradient body background with flat dark
- Updated hardcoded navy references across: dashboard pages, auth pages, email templates, chart tooltips, mesh gradient defaults
- Button text-on-green references (#0D1B2A) intentionally preserved for contrast

### FloatingParticles Component
- Created `src/components/ui/FloatingParticles.tsx`
- 6 subtle serpent-skin fragment particles with CSS float animation
- 8% opacity, venom-green border/glow, varied sizes and positions
- Automatically hidden on homepage (where HeroAtmosphere handles the effect)
- Hidden on mobile and when prefers-reduced-motion is active
- Wired into root layout (`src/app/layout.tsx`)

### ScrollScrubHero Status
- Component is active on homepage (page.tsx line 128)
- 121 real frames from flow-iteration-3.mp4 in public/frames/serpent/
- HeroAtmosphere set to "hybrid" variant (checkpoint decision still open)
- Frame counts updated to match real assets (121 desktop, 80 mobile)

## What's Left

### Open Checkpoint: Atmosphere Variant
- Currently set to `variant="hybrid"` in ScrollScrubHero.tsx line 154
- Both hybrid and full-c variants are built in HeroAtmosphere.tsx
- Eric needs to see both in browser and decide
- To switch: change `variant="hybrid"` to `variant="full"` in ScrollScrubHero.tsx

### QA Tasks
- Visual QA of pitch black theme across all pages (homepage, about, services, pricing, dashboard, auth)
- Test FloatingParticles on non-homepage routes
- Test scroll-scrub hero performance (target: 60fps, Lighthouse > 85)
- Verify testimonials section renders correctly
- Mobile testing (FloatingParticles hidden, reduced frame count)

### Storage Cleanup
- Eric is nearly maxed on HD space
- Frame assets (121 WebP files in public/frames/serpent/) are the largest local-only files
- Options discussed but not implemented:
  1. Vercel Blob Storage (serves frames from CDN, removes from local/git)
  2. Cloudflare R2 (free tier, S3-compatible)
  3. Move node_modules to external drive (temporary)
  4. Clean .next build cache
- Recommendation: Vercel Blob is the cleanest fit since we already deploy there

### Uncommitted Files
- `package.json` / `package-lock.json` -- canvas dev dependency (used for placeholder generation, can be removed)
- `scripts/output/` -- raw generation assets (start/end frames, mp4 files) -- should be gitignored or archived

## Key Files

| File | Purpose |
|------|---------|
| `src/components/hero/ScrollScrubHero.tsx` | Main scroll-scrub component |
| `src/components/hero/HeroAtmosphere.tsx` | Post-scrub floating fragments (hybrid + full-c) |
| `src/components/hero/HeroTextOverlay.tsx` | Scroll-synced headline overlay |
| `src/components/hero/useFrameSequence.ts` | Progressive frame preloader |
| `src/components/hero/useScrollProgress.ts` | GSAP ScrollTrigger binding |
| `src/components/ui/FloatingParticles.tsx` | Non-homepage floating particles |
| `src/app/globals.css` | Theme variables (now pitch black) |
| `src/app/layout.tsx` | Root layout with FloatingParticles |
| `src/app/page.tsx` | Homepage with ScrollScrubHero |
| `public/frames/serpent/` | 121 WebP frames (gitignored) |
| `.claude/skills/exploding-scroll-hero/SKILL.md` | 3-prompt asset generation skill |

## Git State
- Branch: main
- Last commit: `56cb49a` -- pitch black design extension
- Pushed to remote: yes
- Submodule in parent repo: needs `git add engineering/projects/ophidian-ai` from parent
