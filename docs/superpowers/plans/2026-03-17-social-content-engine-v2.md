# Social Content Engine v2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Social Content Engine with analytics tracking, bi-weekly cron automation, and client reuse -- the three items deferred from v1. Also document the Supabase migration prerequisite that gates all database features.

**Architecture:** v1 established the batch JSON contract, dashboard, API routes, and Supabase schema (migration not yet applied). v2 adds a `platform_metrics` column to `content_posts`, a cron script that checks batch age and auto-triggers generation, dashboard analytics display, and a `client-social-content` skill upgrade that mirrors the OphidianAI pipeline.

**Prerequisites:**
- Both Supabase migrations must be applied before any v2 database features will work (see Chunk 1)
- Platform API tokens must be configured in `.env` before the scheduler will succeed (v1 blocker, not addressed here)
- Vercel Blob storage must be configured before image URLs resolve in production (deferred to v3)

**Deferred to v3:**
- Post-to-platform automation (direct publish without human approval gate)
- Vercel Blob image serving (images currently served from local filesystem paths)
- Fully autonomous cron pipeline (generate + approve + schedule without manual review)

**Spec:** `docs/superpowers/specs/2026-03-16-social-content-engine-design.md`

---

## Chunk 1: Supabase Migrations

Apply the pending v1 migration and add the new v2 analytics migration. Nothing else in this plan will function correctly until both are applied.

### Task 1: Apply v1 Migration

**Files:**

- Reference: existing migration file in `engineering/projects/ophidian-ai/supabase/migrations/`

- [ ] **Step 1: Locate the v1 migration file**

Find the pending migration file (`20260316*_content_engine*.sql` or similar) in the Supabase migrations directory.

- [ ] **Step 2: Apply via Supabase dashboard or CLI**

Option A (CLI, if `supabase` is linked):
```bash
cd engineering/projects/ophidian-ai
supabase db push
```

Option B (Dashboard SQL editor):
- Open the Supabase project dashboard
- Navigate to SQL Editor
- Paste and run the migration file contents

- [ ] **Step 3: Verify tables exist**

Confirm `content_batches` and `content_posts` tables are present in the Supabase dashboard Table Editor.

### Task 2: Create v2 Analytics Migration

**Files:**

- Create: `engineering/projects/ophidian-ai/supabase/migrations/20260317000001_content_engine_analytics.sql`

- [ ] **Step 1: Write the migration file**

Create `20260317000001_content_engine_analytics.sql`:

```sql
-- Add platform_metrics column to content_posts for analytics tracking
ALTER TABLE content_posts
  ADD COLUMN IF NOT EXISTS platform_metrics jsonb DEFAULT NULL;

COMMENT ON COLUMN content_posts.platform_metrics IS
  'Per-platform engagement metrics. Structure: { facebook: PlatformMetrics, instagram: PlatformMetrics, ... }
   PlatformMetrics: { likes, comments, reach?, shares?, saves?, views? }';
```

- [ ] **Step 2: Apply the migration**

Same as Task 1, Step 2. Apply via CLI or Supabase dashboard SQL editor.

- [ ] **Step 3: Verify column exists**

In Supabase Table Editor, confirm `platform_metrics` column is present on `content_posts` with type `jsonb`.

- [ ] **Step 4: Commit**

```bash
git add engineering/projects/ophidian-ai/supabase/migrations/20260317000001_content_engine_analytics.sql
git commit -m "feat: add platform_metrics column migration for content engine analytics"
```

---

## Chunk 2: Analytics Tracking

TypeScript types, dashboard display, and manual metrics entry for tracking post performance per platform.

### Task 3: Update TypeScript Types

**Files:**

- Modify: the TypeScript types file that defines `ContentPost` and `ContentPlatform` (likely in `engineering/projects/ophidian-ai/src/types/` or similar -- locate it before editing)

- [ ] **Step 1: Locate the ContentPost type definition**

Search for `ContentPost` in the Next.js project source to find the correct file.

- [ ] **Step 2: Add PlatformMetrics type**

Add the following type alongside `ContentPost`:

```typescript
export type PlatformMetrics = {
  likes: number;
  comments: number;
  shares?: number;
  reach?: number;
  saves?: number;
  views?: number;
};
```

- [ ] **Step 3: Add platform_metrics field to ContentPost**

Add to the `ContentPost` type:

```typescript
platform_metrics: Record<ContentPlatform, PlatformMetrics> | null;
```

- [ ] **Step 4: Commit**

```bash
git add <types-file-path>
git commit -m "feat: add PlatformMetrics type and platform_metrics field to ContentPost"
```

### Task 4: Analytics Display on Post Cards

**Files:**

- Modify: the post card component in the dashboard content engine page (likely in `engineering/projects/ophidian-ai/src/app/dashboard/content-engine/` or a components folder)

- [ ] **Step 1: Locate the post card component**

Find the component that renders individual posts within a batch detail view.

- [ ] **Step 2: Add analytics metrics display**

When `post.platform_metrics` is non-null, render a per-platform metrics row below the post copy. Show whichever fields are present (likes, comments, reach, shares, saves, views). Use a compact table or grid layout -- one column per platform, one row per metric.

Acceptance criteria:
- Metrics only render when `platform_metrics` is non-null
- Missing optional fields (reach, shares, saves, views) are omitted rather than shown as 0
- Layout does not break the existing post card structure

- [ ] **Step 3: Add manual metrics entry form**

Add a collapsible "Log Analytics" section to each post card. The form should:
1. Show one input group per platform (only platforms present on the post)
2. Fields: likes (required), comments (required), reach, shares, saves, views (all optional)
3. Submit button calls `PATCH /api/content-engine/posts/[postId]` with the updated `platform_metrics` object
4. On success, update the local state so the display reflects the new values without a full page reload

Acceptance criteria:
- Form is hidden by default, revealed by a "Log Analytics" toggle
- Submitting the form updates `platform_metrics` in Supabase
- No page reload required after submit

- [ ] **Step 4: Add PATCH API route**

If a `PATCH /api/content-engine/posts/[postId]` route does not already exist, create it. It should:
1. Accept `{ platform_metrics: Record<ContentPlatform, PlatformMetrics> }` in the request body
2. Update the `platform_metrics` column on the matching `content_posts` row
3. Return the updated post

- [ ] **Step 5: Commit**

```bash
git add <component-files> <api-route-files>
git commit -m "feat: add analytics display and manual metrics entry to post cards"
```

### Task 5: Batch Analytics Summary Card

**Files:**

- Modify: the BatchDetail view component in the dashboard content engine page

- [ ] **Step 1: Locate the BatchDetail component**

Find where batch-level data is rendered (the page or component that shows a batch and its posts).

- [ ] **Step 2: Add analytics summary card**

Add a summary card at the top of the BatchDetail view that appears only when at least one post in the batch has `platform_metrics` data. The card should display:

- **Total reach** -- sum of `reach` across all posts and all platforms (where present)
- **Top post** -- the post with the highest combined likes + comments across all platforms
- **Engagement rate** -- `(total likes + total comments) / total reach * 100`, shown as a percentage. Display "N/A" if reach is 0 or unavailable.

Acceptance criteria:
- Card only renders when at least one post has metrics
- Handles missing optional fields gracefully (skip them in aggregation)
- Engagement rate shows "N/A" rather than divide-by-zero when reach is 0

- [ ] **Step 3: Commit**

```bash
git add <batch-detail-component-file>
git commit -m "feat: add batch analytics summary card (reach, top post, engagement rate)"
```

---

## Chunk 3: Bi-Weekly Cron Automation

A Node.js script that determines whether a new batch is needed and triggers generation, plus a Windows Task Scheduler registration script.

### Task 6: Cron Script

**Files:**

- Create: `operations/automation/social-content-cron.js`

- [ ] **Step 1: Write social-content-cron.js**

Create `operations/automation/social-content-cron.js`. The script should:

1. Scan `marketing/social-media/batches/` for JSON files (ignore `.gitkeep`)
2. Find the most recent batch JSON by filename date
3. Read its `period_start` and `status` fields
4. Determine if a new batch is needed using either condition:
   - Days since `period_start` >= 14, OR
   - Last batch `status` is `published`
5. If a new batch IS needed:
   - Write a log entry to `operations/automation/logs/social-content-cron-YYYY-MM-DD.log`: `[timestamp] Triggering new batch generation. Last batch: [filename], status: [status], period_start: [date]`
   - Spawn the Claude Code CLI using `child_process.execFile('claude', ['--headless', '/social-content'])` with a 10-minute timeout
   - Log completion or error
6. If a new batch is NOT needed:
   - Compute next due date as `period_start + 14 days`
   - Log: `[timestamp] No new batch needed. Next batch due: [YYYY-MM-DD]`

Edge cases to handle:
- No batch files exist: treat as "new batch needed"
- Batch JSON is malformed: log the error and exit with code 1
- Log directory does not exist: create it before writing

Acceptance criteria:
- Script runs without error when no batches exist
- Script correctly identifies a batch as "due" when `period_start` is 14+ days ago
- Script correctly identifies a batch as "due" when `status` is `published`
- Script logs to the correct daily log file
- Script exits with code 0 on success, code 1 on error

- [ ] **Step 2: Manual dry-run test**

```bash
node operations/automation/social-content-cron.js
```

Expected: either triggers batch generation or logs "Next batch due: [date]" depending on current batch state. Verify the log file was created in `operations/automation/logs/`.

- [ ] **Step 3: Commit**

```bash
git add operations/automation/social-content-cron.js
git commit -m "feat: add bi-weekly social content cron script"
```

### Task 7: Windows Task Scheduler Setup Script

**Files:**

- Create: `operations/automation/setup-social-content-cron.bat`

- [ ] **Step 1: Write setup-social-content-cron.bat**

Create `operations/automation/setup-social-content-cron.bat`. The script should:

1. Set the task name: `OphidianAI-SocialContentCron`
2. Resolve the absolute path to `operations/automation/social-content-cron.js`
3. Use `schtasks /create` to register a task with:
   - Schedule: Weekly on Monday at 6:00 AM
   - Program: `node`
   - Arguments: `<absolute-path-to-social-content-cron.js>`
   - Working directory: the repo root
   - Run whether user is logged on or not: `/RL HIGHEST`
4. Print success or failure message

Note on bi-weekly scheduling: Windows Task Scheduler does not natively support bi-weekly triggers. The cron script itself handles the "every other week" logic by checking the date gap from the last batch's `period_start`. The Task Scheduler task fires every Monday at 6 AM; the script exits early if a new batch is not due yet. Document this in a comment at the top of the bat file.

- [ ] **Step 2: Document manual registration fallback**

Add a comment block at the top of the bat file with the manual `schtasks` command so the task can be re-registered without re-running the script.

- [ ] **Step 3: Commit**

```bash
git add operations/automation/setup-social-content-cron.bat
git commit -m "feat: add Windows Task Scheduler setup script for social content cron"
```

---

## Chunk 4: client-social-content Skill Updates

Upgrade the client-facing social content skill to match the OphidianAI pipeline: image generation, Supabase sync with client ID, and batch JSON output.

### Task 8: Read and Audit Current Skill

**Files:**

- Reference: `.claude/skills/client-social-content/SKILL.md`

- [ ] **Step 1: Read the current client-social-content SKILL.md**

Read the file to understand the current process and identify exactly where Steps 5 and 6 will be inserted.

- [ ] **Step 2: Note current limitations**

Current skill gaps to address:
- No image generation step
- No batch JSON output (markdown only)
- No Supabase sync
- No `--client-id` parameter passed to sync script
- No reference to social-scheduler for delivery

### Task 9: Add Image Generation Step (Step 5)

**Files:**

- Modify: `.claude/skills/client-social-content/SKILL.md`

- [ ] **Step 1: Add Step 5 -- Generate images**

After the existing content generation steps, insert:

**Step 5: Generate images**
- Invoke the `social-image-gen` skill, passing the client's batch JSON path
- The image router reads `imageSource` and `imagePrompt` from each post and runs the same pipeline as OphidianAI batches
- Images save to `marketing/social-media/clients/<client-id>/images/<batch-date>/`
- Batch JSON is updated with `imagePath` fields per platform per post
- Status updates from `draft` to `review`

Acceptance criteria: adding this step to the skill file causes the image gen pipeline to run when the client skill is invoked.

### Task 10: Add Supabase Sync Step (Step 6)

**Files:**

- Modify: `.claude/skills/client-social-content/SKILL.md`
- Modify: `.claude/skills/social-content/sync-to-supabase.js` (if `--client-id` flag is missing)

- [ ] **Step 1: Check whether sync-to-supabase.js supports --client-id**

Read `sync-to-supabase.js`. If it does not accept a `--client-id` argument, add support:
- Parse `--client-id <slug>` from `process.argv`
- Set `client_id` on all inserted `content_batches` and `content_posts` rows

- [ ] **Step 2: Add Step 6 -- Sync to Supabase**

After Step 5 in the client skill, insert:

**Step 6: Sync to Supabase**
- Run: `node .claude/skills/social-content/sync-to-supabase.js <batch-json-path> --client-id <client-id>`
- The `client-id` is the client's slug (e.g., `bloomin-acres`)
- On success, log the batch ID and post count synced
- If Supabase is not configured, log a warning and skip (do not fail the skill)

Acceptance criteria: synced records have `client_id` set, so client content is filterable separately from OphidianAI's own content in the dashboard.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/social-content/sync-to-supabase.js
git commit -m "feat: add --client-id flag to sync-to-supabase.js"
```

### Task 11: Add Batch JSON Output and Scheduler Reference

**Files:**

- Modify: `.claude/skills/client-social-content/SKILL.md`

- [ ] **Step 1: Add batch JSON output to the existing content generation step**

Update the content generation step to write two output files alongside the existing markdown:

- `marketing/social-media/clients/<client-id>/batches/<batch-date>-batch.json` -- same schema as OphidianAI's batch JSON, with `client_id` field set to the client slug
- `marketing/social-media/clients/<client-id>/batches/<batch-date>-batch.md` -- existing markdown output moved to client subfolder

- [ ] **Step 2: Add Delivery section**

At the end of the skill file, add a Delivery section:

**Delivery:**
- After approval, invoke `social-scheduler` to push to the client's platform accounts
- Client platform credentials must be stored in `.env` with a client-specific prefix (e.g., `BLOOMIN_ACRES_META_PAGE_ACCESS_TOKEN=`)
- The social-scheduler skill will need to be updated to support prefixed credentials per client (note as a follow-up task)

- [ ] **Step 3: Commit all client skill updates**

```bash
git add .claude/skills/client-social-content/SKILL.md
git commit -m "feat: update client-social-content skill with image gen, Supabase sync, batch JSON, and scheduler reference"
```

---

## Chunk 5: Integration Verification

### Task 12: End-to-End Checklist

- [ ] **Step 1: Verify both Supabase migrations are applied**

In Supabase Table Editor, confirm:
- `content_batches` table exists
- `content_posts` table exists with `platform_metrics jsonb` column

- [ ] **Step 2: Verify TypeScript types compile**

```bash
cd engineering/projects/ophidian-ai
npx tsc --noEmit
```

Expected: no type errors related to `ContentPost` or `PlatformMetrics`.

- [ ] **Step 3: Verify analytics display renders**

Open the dashboard content engine page in development. Navigate to a batch. Confirm the "Log Analytics" toggle is present on post cards. Submit test metrics for one post and verify they save and display without a page reload.

- [ ] **Step 4: Verify cron script dry-run**

```bash
node operations/automation/social-content-cron.js
```

Verify the log file is created in `operations/automation/logs/` with the correct filename and a valid log entry.

- [ ] **Step 5: Verify Task Scheduler registration (optional)**

Run `setup-social-content-cron.bat` and verify the task appears in Windows Task Scheduler. Run it manually to confirm it executes without errors.

- [ ] **Step 6: Commit any fixes and close out**

```bash
git add -p
git commit -m "fix: v2 social content engine integration fixes"
```
