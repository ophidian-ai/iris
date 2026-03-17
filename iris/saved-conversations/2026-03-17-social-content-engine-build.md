# Social Content Engine Build Session

**Date:** 2026-03-17
**Status:** Dashboard integration complete

## What Was Done

### Design Phase
- Comprehensive SM marketing research for AI agencies
- Brainstorming session with visual companion (architecture diagrams)
- Design spec written: `docs/superpowers/specs/2026-03-16-social-content-engine-design.md`
- Spec reviewed and all issues fixed
- Implementation plan written: `docs/superpowers/plans/2026-03-16-social-content-engine.md`
- Plan reviewed and all issues fixed

### Implementation Phase

**Completed:**
1. Directory structure + Sharp dependency
2. `resize.js` -- Platform image resize utility with tests (Instagram content-type-aware)
3. `pexels-fetch.js` -- Pexels stock photo fetcher (smoke tested)
4. `excalidraw-gen.js` -- Workflow diagram generator via Sharp+SVG (smoke tested)
5. `social-image-gen/SKILL.md` -- Image router skill
6. `social-content/SKILL.md` -- Orchestrator skill (full overhaul)
7. `social-approve/SKILL.md` -- Batch approval workflow
8. `social-edit/SKILL.md` -- Post copy editing
9. `social-regen/SKILL.md` -- Post regeneration (image/copy/all)
10. `social-check/SKILL.md` -- Post verification

**Agents dispatched (check if completed):**
- `nano-banana.js` -- Nano Banana 2 image gen via Gemini API
- `compositor.js` -- Playwright before/after screenshot compositor

### Scope Changes During Build
- **Dashboard integration:** Instead of standalone Node.js scheduler scripts, the content engine integrates into the OphidianAI dashboard (Next.js 16.1.6 + Supabase + Tailwind CSS 4)
- **Product vision:** This is a SaaS product for recurring client revenue, not just internal tooling. Architecture must be multi-tenant ready.
- **Do NOT touch:** The existing socials demo page at `src/app/dashboard/social/page.tsx` or its Meta API routes -- needed for Meta Business Verification

### Session 2: Dashboard Integration

**Completed:**
1. Verified nano-banana.js and compositor.js from agent work
2. Module system -- added `content_engine` to DashboardModule type, service map (social_media clients get it), sidebar (both client and admin nav)
3. Supabase types -- ContentBatch, ContentPost, and related enums in types.ts
4. Supabase migration -- `20260317000000_content_engine_tables.sql` with RLS policies
5. API routes:
   - `GET/POST /api/content-engine/batches` -- list/create batches
   - `GET/PATCH /api/content-engine/batches/[id]` -- get batch with posts, update status
   - `PATCH /api/content-engine/posts/[id]` -- update post copy/images
6. Dashboard page at `/dashboard/content-engine/` -- batch list, batch detail with post grid, inline edit, status workflow actions
7. Content Agent -- added all 6 new skills to skills access list
8. Morning Coffee -- added social content batch status check + terminal summary line
9. CLAUDE.md -- added all 6 social content skills to workflow skills list

## What Remains

1. **Run Supabase migration** -- `supabase db push` or apply via dashboard
2. **CLI-to-Supabase bridge** -- Update social-content orchestrator to also write batches to Supabase (currently writes to disk only)
3. **Post-to-platform integration** -- Wire the Content Engine's "Mark Published" action to actually post via Meta/LinkedIn/TikTok APIs
4. **Image serving** -- Connect image_urls in posts to actual hosted images (Vercel Blob or Supabase Storage)
5. **Smoke test** -- Start dev server, navigate to /dashboard/content-engine, verify empty state renders

## Key Architecture Decisions
- 6 content pillars (was 4): Proof of Work, AI Education, Website Tips, Showcase, Local Relevance, Behind the Scenes
- 4 platforms: FB, IG, LinkedIn, TikTok (added LinkedIn)
- 4 image sources: Playwright compositor, Excalidraw diagrams, Nano Banana 2, Pexels
- Bi-weekly batches of 7 posts, posting every 2 days
- Batch JSON as the contract between all modules
- Sunday review gate with approve/edit/regen workflow

## Site Architecture Notes (from exploration)
- Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS 4
- Supabase for auth + DB, module-based feature gating
- Dashboard uses: GlowCard, DashboardProvider (role/modules/clientId), ModuleGuard, Sidebar
- Existing social page makes direct Meta Graph API calls from client-side
- Key patterns: `useDashboard()` hook, server-side auth check in layout, recharts for data viz
