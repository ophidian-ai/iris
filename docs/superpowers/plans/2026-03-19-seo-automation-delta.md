# SEO Automation Delta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Reconcile the existing SEO Automation implementation with the updated design spec by applying a delta migration for column name alignment and adding the missing `posted` GBP draft status.

**Architecture:** The SEO Automation product is already built (library, API routes, dashboard, cron, docs). This plan covers only the database schema delta and any code that references the old column names.

**Tech Stack:** Supabase (Postgres), TypeScript

**Spec:** docs/superpowers/specs/2026-03-19-seo-automation-design.md

---

## File Structure

### New Files (Create)

- supabase/migrations/20260319000000_seo_schema_delta.sql -- Delta migration for column renames, new columns, enum update

### Modified Files

- src/lib/supabase/seo-types.ts -- Update type interfaces to match new column names
- src/lib/seo/audit-engine.ts -- Update references from `url` to `website_url`, `target_keywords` to `keywords`
- src/lib/seo/rank-tracker.ts -- Same column name updates
- src/lib/seo/keyword-engine.ts -- Same column name updates
- src/lib/seo/report-generator.ts -- Update score field references
- src/lib/seo/content-freshness.ts -- Update column references if any
- src/lib/seo/gbp-generator.ts -- Update column references if any
- src/app/api/admin/seo/configs/route.ts -- Update column references
- src/app/api/admin/seo/configs/[id]/route.ts -- Update column references
- src/app/api/admin/seo/configs/[id]/run/route.ts -- Update column references
- src/app/api/seo/dashboard/route.ts -- Update column references
- src/app/dashboard/admin/seo/page.tsx -- Update column references
- src/app/dashboard/admin/seo/new/page.tsx -- Update column references
- src/app/dashboard/admin/seo/[id]/page.tsx -- Update column references
- src/app/dashboard/seo/page.tsx -- Update column references

---

## Task 1: Delta Migration SQL

**Files:**
- Create: supabase/migrations/20260319000000_seo_schema_delta.sql

- [ ] **Step 1: Write the delta migration**

```sql
-- Rename columns for spec alignment
ALTER TABLE seo_configs RENAME COLUMN url TO website_url;
ALTER TABLE seo_configs RENAME COLUMN target_keywords TO keywords;

-- Add overall_score and scores jsonb to seo_audits
ALTER TABLE seo_audits ADD COLUMN overall_score int NOT NULL DEFAULT 0;
ALTER TABLE seo_audits ADD COLUMN scores jsonb NOT NULL DEFAULT '{}';

-- Add updated_at to seo_gbp_drafts
ALTER TABLE seo_gbp_drafts ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

-- Add 'posted' to gbp_draft_status enum
ALTER TYPE gbp_draft_status ADD VALUE IF NOT EXISTS 'posted';

-- Add service_type enum values for new products
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'seo_automation';
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'content_generation';

-- Add updated_at trigger for seo_gbp_drafts
CREATE TRIGGER seo_gbp_drafts_updated_at
  BEFORE UPDATE ON seo_gbp_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_updated_at();
```

- [ ] **Step 2: Run migration against Supabase**

Run: `cd engineering/projects/ophidian-ai && supabase db push`
Verify: Column renames applied, new columns exist, enum updated.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260319000000_seo_schema_delta.sql
git commit -m "feat: delta migration to align SEO schema with updated spec"
```

---

## Task 2: Update TypeScript Types

**Files:**
- Modify: src/lib/supabase/seo-types.ts

- [ ] **Step 1: Update SeoConfig interface**

Rename `url` -> `website_url`, `target_keywords` -> `keywords` in the interface.

- [ ] **Step 2: Update SeoAudit interface**

Add `overall_score: number` and `scores: { technical: number; onPage: number; content: number; local: number; speed: number; aiVisibility: number }`.

- [ ] **Step 3: Update SeoGbpDraft interface**

Add `updated_at: string` field. Update status type to include `"posted"`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/seo-types.ts
git commit -m "feat: update SEO types to match delta migration"
```

---

## Task 3: Update Library Files

**Files:**
- Modify: src/lib/seo/audit-engine.ts
- Modify: src/lib/seo/rank-tracker.ts
- Modify: src/lib/seo/keyword-engine.ts
- Modify: src/lib/seo/report-generator.ts
- Modify: src/lib/seo/content-freshness.ts
- Modify: src/lib/seo/gbp-generator.ts

- [ ] **Step 1: Find and replace column references**

In all 6 library files, replace:
- `config.url` -> `config.website_url`
- `config.target_keywords` -> `config.keywords`
- `.url` (in Supabase queries) -> `.website_url`
- `.target_keywords` (in Supabase queries) -> `.keywords`

Also update report-generator.ts to populate `overall_score` (average of 6 scores) and `scores` jsonb when writing audit results.

- [ ] **Step 2: Commit**

```bash
git add src/lib/seo/
git commit -m "refactor: update SEO library files for column renames"
```

---

## Task 4: Update API Routes and Dashboard Pages

**Files:**
- Modify: src/app/api/admin/seo/configs/route.ts
- Modify: src/app/api/admin/seo/configs/[id]/route.ts
- Modify: src/app/api/admin/seo/configs/[id]/run/route.ts
- Modify: src/app/api/seo/dashboard/route.ts
- Modify: src/app/dashboard/admin/seo/page.tsx
- Modify: src/app/dashboard/admin/seo/new/page.tsx
- Modify: src/app/dashboard/admin/seo/[id]/page.tsx
- Modify: src/app/dashboard/seo/page.tsx

- [ ] **Step 1: Find and replace column references in all API routes and pages**

Same replacements as Task 3 for `url` -> `website_url` and `target_keywords` -> `keywords`.

- [ ] **Step 2: Run build**

Run: `cd engineering/projects/ophidian-ai && npm run build`
Verify: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/
git commit -m "refactor: update API routes and dashboard for column renames"
```

---

## Task 5: Verify and Deploy

- [ ] **Step 1: Run full build**

Run: `cd engineering/projects/ophidian-ai && npm run build`
Fix any remaining TypeScript errors.

- [ ] **Step 2: Push and deploy**

```bash
cd engineering/projects/ophidian-ai && git push
```

Vercel auto-deploys on push.

- [ ] **Step 3: Update submodule in Iris repo**

```bash
cd /c/Claude\ Code/OphidianAI
git add engineering/projects/ophidian-ai
git commit -m "feat: update ophidian-ai submodule with SEO schema delta"
```
