# Content Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build an AI-powered blog content generation product that produces SEO-optimized posts in batches with staggered publishing, dual delivery (dashboard copy/paste + git push), and tiered topic control -- sharing infrastructure with the existing SEO Automation product.

**Architecture:** Blog content tables (`blog_*`) in Supabase, library at `src/lib/blog/`, API routes at `/api/blog/` and `/api/admin/blog/`, client dashboard at `/dashboard/blog/`, admin pages at `/dashboard/admin/blog/`. Fan-out cron for batch generation. Uses shared keyword engine from `src/lib/seo/keyword-engine.ts` and GBP pipeline from `src/lib/seo/gbp-generator.ts`.

**Tech Stack:** Next.js 16, AI SDK v6, Supabase (Postgres + Auth + RLS), Resend, GitHub API, Firecrawl, TypeScript

**Spec:** docs/superpowers/specs/2026-03-19-content-generation-design.md

---

## File Structure

### New Files (Create)

**Database and Types:**
- supabase/migrations/20260319100000_blog_tables.sql -- SQL migration for blog_configs, blog_batches, blog_posts, blog_topics + RLS
- src/lib/supabase/blog-types.ts -- TypeScript types for blog tables

**Blog Core Library:**
- src/lib/blog/tier-defaults.ts -- Tier constants (posts/month, topic mode, voice, delivery, etc.)
- src/lib/blog/config.ts -- Load blog config by client ID
- src/lib/blog/topic-generator.ts -- AI topic suggestion from keyword gaps
- src/lib/blog/post-generator.ts -- Full post generation pipeline (research -> outline -> draft -> metadata -> GBP)
- src/lib/blog/publisher.ts -- Publish logic: dashboard status update OR git push via GitHub API
- src/lib/blog/brand-voice.ts -- Brand voice profile loader + prompt construction

**API Routes:**
- src/app/api/blog/batches/route.ts -- List batches (GET, client-facing)
- src/app/api/blog/batches/[id]/route.ts -- Get batch with posts (GET, client-facing)
- src/app/api/blog/posts/[id]/route.ts -- Get post content (GET, client-facing)
- src/app/api/blog/posts/[id]/approve/route.ts -- Approve post (POST, client-facing)
- src/app/api/blog/posts/[id]/reject/route.ts -- Reject post (POST, client-facing)
- src/app/api/blog/topics/route.ts -- List/submit topics (GET/POST, client-facing)
- src/app/api/blog/topics/[id]/approve/route.ts -- Approve topic (POST, client-facing)
- src/app/api/blog/topics/[id]/reject/route.ts -- Reject topic (POST, client-facing)
- src/app/api/admin/blog/configs/route.ts -- List/create configs (GET/POST)
- src/app/api/admin/blog/configs/[id]/route.ts -- Update/deactivate config (PATCH/DELETE)
- src/app/api/admin/blog/configs/[id]/generate/route.ts -- Trigger batch generation (POST)
- src/app/api/admin/blog/posts/[id]/publish/route.ts -- Manually publish post (POST)
- src/app/api/cron/blog-monthly-generate/route.ts -- Monthly batch dispatcher
- src/app/api/cron/blog-publish/route.ts -- Daily staggered publish
- src/app/api/cron/blog-topic-reminder/route.ts -- Topic approval reminder

**Dashboard Pages:**
- src/app/dashboard/admin/blog/page.tsx -- Admin blog overview
- src/app/dashboard/admin/blog/new/page.tsx -- New blog config form
- src/app/dashboard/admin/blog/[id]/page.tsx -- Config detail + batch management
- src/app/dashboard/blog/page.tsx -- Client blog dashboard (batches, posts, topics)

**API Documentation:**
- src/app/docs/blog-api/layout.tsx -- Docs layout
- src/app/docs/blog-api/page.mdx -- Getting started + batches
- src/app/docs/blog-api/posts/page.mdx -- Posts API
- src/app/docs/blog-api/topics/page.mdx -- Topics API (Growth/Pro)

**Product Page:**
- src/app/services/content-generation/page.tsx -- Product/marketing page

### Modified Files

- vercel.json -- Add cron schedules for blog-monthly-generate, blog-publish, blog-topic-reminder
- src/lib/supabase/types.ts -- Re-export blog types
- src/components/dashboard/sidebar.tsx -- Add "Content" menu item to admin + client sections
- src/lib/modules.ts -- Add blog module

---

## Phase 1: Foundation (Database + Types + Constants)

### Task 1: Database Migration -- Blog Tables

**Files:**
- Create: supabase/migrations/20260319100000_blog_tables.sql

- [ ] **Step 1: Write the migration SQL**

Create 4 tables: blog_configs, blog_batches, blog_posts, blog_topics.

blog_configs:
- id uuid PK default gen_random_uuid()
- client_id uuid FK -> clients(id) ON DELETE SET NULL, nullable
- tier blog_tier enum (essentials, growth, pro) NOT NULL DEFAULT 'essentials'
- website_url text NOT NULL
- blog_path text NOT NULL DEFAULT '/blog'
- posts_per_month int NOT NULL DEFAULT 4
- brand_voice jsonb NOT NULL DEFAULT '{"tone": "professional", "style": "informative", "samples": [], "keywords_to_use": [], "keywords_to_avoid": []}'
- github_repo text nullable
- github_branch text NOT NULL DEFAULT 'main'
- blog_content_path text NOT NULL DEFAULT 'src/content/blog'
- delivery_method blog_delivery_method enum (dashboard, git_push) NOT NULL DEFAULT 'dashboard'
- delivery_email text NOT NULL
- active boolean NOT NULL DEFAULT true
- created_at timestamptz NOT NULL DEFAULT now()
- updated_at timestamptz NOT NULL DEFAULT now()

blog_batches:
- id uuid PK default gen_random_uuid()
- config_id uuid NOT NULL FK -> blog_configs(id) ON DELETE CASCADE
- month date NOT NULL
- status blog_batch_status enum (generating, review, approved, scheduled, publishing, published) NOT NULL DEFAULT 'generating'
- post_count int NOT NULL DEFAULT 0
- created_at timestamptz NOT NULL DEFAULT now()
- updated_at timestamptz NOT NULL DEFAULT now()
- UNIQUE(config_id, month)

blog_posts:
- id uuid PK default gen_random_uuid()
- batch_id uuid NOT NULL FK -> blog_batches(id) ON DELETE CASCADE
- config_id uuid NOT NULL FK -> blog_configs(id) ON DELETE CASCADE
- title text NOT NULL
- slug text NOT NULL
- content_markdown text nullable
- content_html text nullable
- seo_metadata jsonb nullable
- gbp_summary text nullable
- internal_links jsonb nullable
- image_suggestions jsonb nullable
- scheduled_date date NOT NULL
- status blog_post_status enum (draft, review, approved, scheduled, published, rejected) NOT NULL DEFAULT 'draft'
- published_url text nullable
- github_commit_sha text nullable
- created_at timestamptz NOT NULL DEFAULT now()
- updated_at timestamptz NOT NULL DEFAULT now()

blog_topics:
- id uuid PK default gen_random_uuid()
- config_id uuid NOT NULL FK -> blog_configs(id) ON DELETE CASCADE
- month date NOT NULL
- title text NOT NULL
- keyword text NOT NULL
- rationale text nullable
- source blog_topic_source enum (ai_suggested, client_requested) NOT NULL DEFAULT 'ai_suggested'
- status blog_topic_status enum (pending, approved, rejected) NOT NULL DEFAULT 'pending'
- target_week int nullable CHECK (target_week BETWEEN 1 AND 4)
- created_at timestamptz NOT NULL DEFAULT now()

Include: enums, indexes (config_id on all tables, batch_id+scheduled_date on blog_posts, config_id+month on blog_topics), updated_at triggers, RLS policies (admin full access, client read own via blog_configs.client_id -> clients.profile_id, client update status on blog_posts and blog_topics, client insert on blog_topics).

- [ ] **Step 2: Run migration**

Run: `cd engineering/projects/ophidian-ai && supabase db push`

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260319100000_blog_tables.sql
git commit -m "feat: add blog content generation tables with RLS"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: src/lib/supabase/blog-types.ts
- Modify: src/lib/supabase/types.ts

- [ ] **Step 1: Create blog types**

Export: BlogTier, BlogDeliveryMethod, BlogBatchStatus, BlogPostStatus, BlogTopicSource, BlogTopicStatus, BlogConfig, BlogBatch, BlogPost, BlogTopic. Match the database schema.

- [ ] **Step 2: Re-export from types.ts**

Add to bottom of src/lib/supabase/types.ts:
```typescript
export type { BlogTier, BlogDeliveryMethod, BlogBatchStatus, BlogPostStatus, BlogTopicSource, BlogTopicStatus, BlogConfig, BlogBatch, BlogPost, BlogTopic } from "./blog-types";
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/blog-types.ts src/lib/supabase/types.ts
git commit -m "feat: add TypeScript types for blog content tables"
```

---

### Task 3: Tier Defaults

**Files:**
- Create: src/lib/blog/tier-defaults.ts

- [ ] **Step 1: Create tier defaults**

Export BLOG_TIER_DEFAULTS record keyed by BlogTier:
- essentials: 4 posts/mo, automated topics, template voice, dashboard only, no editorial calendar, no images, no freshness
- growth: 8 posts/mo, suggest+approve topics, voice tuning, dashboard or git_push, freshness alerts, Pexels images
- pro: 12 posts/mo, client+research topics, custom voice, dashboard or git_push, editorial calendar, auto-refresh, Nano Banana images

Export constants: MAX_TOPIC_SUBMISSIONS_PER_MONTH (20), POST_WORD_COUNT_MIN (800), POST_WORD_COUNT_MAX (1500), KEYWORD_DENSITY_TARGET (0.015), GBP_SUMMARY_MAX_LENGTH (1500), TOPIC_AUTO_APPROVE_DAY (7).

- [ ] **Step 2: Commit**

```bash
git add src/lib/blog/tier-defaults.ts
git commit -m "feat: add blog content tier defaults and constants"
```

---

## Phase 2: Core Content Pipeline

### Task 4: Blog Config Loader

**Files:**
- Create: src/lib/blog/config.ts

- [ ] **Step 1: Create config loader**

loadBlogConfig(clientId: string): Query blog_configs where client_id=clientId AND active=true. Return BlogConfig or null.
loadBlogConfigById(id: string): Query blog_configs by id. Return BlogConfig or null.

- [ ] **Step 2: Commit**

```bash
git add src/lib/blog/config.ts
git commit -m "feat: add blog config loader"
```

---

### Task 5: Brand Voice Builder

**Files:**
- Create: src/lib/blog/brand-voice.ts

- [ ] **Step 1: Create brand voice prompt builder**

buildBrandVoicePrompt(config: BlogConfig): string
- Extract tone, style, samples, keywords_to_use, keywords_to_avoid from config.brand_voice
- Return a system prompt section: "Write in a {tone} tone with a {style} approach. Use words like: {keywords_to_use}. Avoid: {keywords_to_avoid}. Match this writing style: {samples[0]}"

- [ ] **Step 2: Commit**

```bash
git add src/lib/blog/brand-voice.ts
git commit -m "feat: add brand voice prompt builder"
```

---

### Task 6: Topic Generator

**Files:**
- Create: src/lib/blog/topic-generator.ts

- [ ] **Step 1: Create topic generation function**

generateTopics(config: BlogConfig, count: number): Promise<BlogTopic[]>

Flow:
1. If config has a linked seo_config (same client_id): fetch latest seo_audits issues and seo_rankings for keyword gaps
2. Call keyword discovery endpoint (or directly use keyword-engine.ts): find longtail opportunities in the client's industry/location
3. Use AI SDK streamText to generate topic suggestions: title, keyword, rationale for each
4. Insert into blog_topics with status='pending' (Growth/Pro) or status='approved' (Essentials)
5. Return inserted topics

Import shared keyword engine: import { discoverKeywords } from "@/lib/seo/keyword-engine"

- [ ] **Step 2: Commit**

```bash
git add src/lib/blog/topic-generator.ts
git commit -m "feat: add AI topic generator using keyword engine"
```

---

### Task 7: Post Generator

**Files:**
- Create: src/lib/blog/post-generator.ts

- [ ] **Step 1: Create post generation pipeline**

generatePost(topic: BlogTopic, config: BlogConfig): Promise<Partial<BlogPost>>

Flow:
1. Research: Use Firecrawl search to find top 3 results for the topic keyword. Extract structure (headings, word count).
2. Outline: AI generates SEO-optimized H2/H3 outline using topic + research + brand voice.
3. Draft: AI writes full post (800-1500 words) from outline. Include natural keyword usage (1-2% density), longtail variations, FAQ section for AEO.
4. SEO metadata: AI generates title_tag (60 chars), meta_description (155 chars), focus_keyword, alt_text suggestions.
5. GBP summary: AI condenses to 1500 chars with keyword alignment and CTA.
6. Internal links (Growth/Pro): Fetch existing pages from client site via Firecrawl map, suggest contextual links.
7. Render HTML from markdown (use a simple markdown-to-html lib or regex conversion).
8. Return partial BlogPost with all fields populated.

Use AI SDK streamText for steps 2-5. Temperature 0.3 for metadata, 0.7 for creative content.

- [ ] **Step 2: Commit**

```bash
git add src/lib/blog/post-generator.ts
git commit -m "feat: add blog post generation pipeline"
```

---

### Task 8: Publisher (Dashboard + Git Push)

**Files:**
- Create: src/lib/blog/publisher.ts

- [ ] **Step 1: Create publish functions**

publishPost(post: BlogPost, config: BlogConfig): Promise<{ success: boolean; url?: string; sha?: string; error?: string }>

If config.delivery_method === 'dashboard':
- Update post status to 'published'
- Set published_url to config.website_url + config.blog_path + '/' + post.slug
- Return success

If config.delivery_method === 'git_push':
- Build MDX content: frontmatter (title, date, description, keywords, image) + markdown body
- Call GitHub API: PUT /repos/{config.github_repo}/contents/{config.blog_content_path}/{post.slug}.mdx
  - Headers: Authorization: Bearer {GITHUB_TOKEN}, Content-Type: application/json
  - Body: { message: "blog: {post.title}", content: base64(mdxContent), branch: config.github_branch }
- If success: update post status, store sha, set published_url
- If fail: retry once. If still fails: return error.

Also: createGbpDraft(post: BlogPost, config: BlogConfig): Create seo_gbp_drafts record if post has gbp_summary. Requires an seo_config for the same client (create stub if not exists per spec).

- [ ] **Step 2: Commit**

```bash
git add src/lib/blog/publisher.ts
git commit -m "feat: add blog publisher with dashboard and git push delivery"
```

---

## Phase 3: API Routes

### Task 9: Client-Facing Blog API

**Files:**
- Create: src/app/api/blog/batches/route.ts
- Create: src/app/api/blog/batches/[id]/route.ts
- Create: src/app/api/blog/posts/[id]/route.ts
- Create: src/app/api/blog/posts/[id]/approve/route.ts
- Create: src/app/api/blog/posts/[id]/reject/route.ts

- [ ] **Step 1: Create batches list endpoint**

GET /api/blog/batches: Auth required. Get client from auth -> clients table -> blog_configs. List blog_batches for client's config, ordered by month desc.

- [ ] **Step 2: Create batch detail endpoint**

GET /api/blog/batches/[id]: Auth required. Get batch by id with all blog_posts joined. Verify client owns this batch via config chain.

- [ ] **Step 3: Create post detail endpoint**

GET /api/blog/posts/[id]: Return full post with content_markdown, content_html, seo_metadata. Client auth scoped.

- [ ] **Step 4: Create approve/reject endpoints**

POST /api/blog/posts/[id]/approve: Set status='approved'. Check if all posts in batch are approved -> update batch status to 'scheduled'.
POST /api/blog/posts/[id]/reject: Set status='rejected'. Accept feedback in body. Batch stays in current state.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/blog/
git commit -m "feat: add client-facing blog API (batches, posts, approve/reject)"
```

---

### Task 10: Topics API

**Files:**
- Create: src/app/api/blog/topics/route.ts
- Create: src/app/api/blog/topics/[id]/approve/route.ts
- Create: src/app/api/blog/topics/[id]/reject/route.ts

- [ ] **Step 1: Create topics list/submit endpoints**

GET /api/blog/topics: List pending topics for client's config, filtered by month. Client auth.
POST /api/blog/topics: Submit a new topic (Pro only). Validate tier. Insert with source='client_requested', status='approved'.

- [ ] **Step 2: Create topic approve/reject endpoints**

POST /api/blog/topics/[id]/approve: Set status='approved'. Check if all topics for this month are resolved. If so, trigger generation by calling /api/admin/blog/configs/[configId]/generate with topics_only=true.
POST /api/blog/topics/[id]/reject: Set status='rejected'.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/blog/topics/
git commit -m "feat: add topics API with approval trigger"
```

---

### Task 11: Admin Blog Config CRUD

**Files:**
- Create: src/app/api/admin/blog/configs/route.ts
- Create: src/app/api/admin/blog/configs/[id]/route.ts

- [ ] **Step 1: Create list/create endpoints**

GET: requireAdmin, list all blog_configs with client company_name join.
POST: requireAdmin, validate required fields (website_url, delivery_email), apply tier defaults, insert. If delivery_method=git_push, validate github_repo is set.

- [ ] **Step 2: Create update/deactivate endpoints**

PATCH: requireAdmin, update fields, validate github_repo if delivery_method changes.
DELETE: requireAdmin, soft delete (active=false).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/blog/
git commit -m "feat: add admin blog config CRUD API"
```

---

### Task 12: Batch Generation Endpoint

**Files:**
- Create: src/app/api/admin/blog/configs/[id]/generate/route.ts

- [ ] **Step 1: Create generation worker**

POST handler (triggered by cron dispatcher or manual):
1. requireAdmin or verify CRON_SECRET
2. Load config by id
3. Check rate limit: max 1 batch per config per month
4. If topics_only=true (from topic approval trigger): only generate posts for approved topics this month
5. Otherwise full flow:
   - Essentials: generate topics (auto-approved) + generate posts
   - Growth: generate topic suggestions only (pending approval). Return early.
   - Pro: generate posts for pre-approved topics, suggest remaining
6. For each approved topic: call generatePost(topic, config)
7. Create blog_batch with status='review', create blog_posts with status='draft'
8. Calculate staggered schedule dates (evenly distribute across month)
9. Send notification email to admin (Eric) for review

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/blog/configs/[id]/generate/
git commit -m "feat: add batch generation worker endpoint"
```

---

### Task 13: Manual Publish Endpoint

**Files:**
- Create: src/app/api/admin/blog/posts/[id]/publish/route.ts

- [ ] **Step 1: Create manual publish endpoint**

POST: requireAdmin. Load post + config. Call publishPost(post, config). Call createGbpDraft if applicable. Update post status. Return result.

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/blog/posts/
git commit -m "feat: add manual post publish endpoint"
```

---

## Phase 4: Cron Jobs

### Task 14: Cron Jobs + Vercel Config

**Files:**
- Create: src/app/api/cron/blog-monthly-generate/route.ts
- Create: src/app/api/cron/blog-publish/route.ts
- Create: src/app/api/cron/blog-topic-reminder/route.ts
- Modify: vercel.json

- [ ] **Step 1: Create monthly batch dispatcher**

GET handler: Verify CRON_SECRET. Query all active blog_configs. For each: POST to /api/admin/blog/configs/[id]/generate (fan-out pattern). Send summary email to Eric.

- [ ] **Step 2: Create staggered publish cron**

GET handler: Verify CRON_SECRET. Query blog_posts where status='scheduled' AND scheduled_date <= today. For each: call publishPost + createGbpDraft. Send notification to client via Resend.

- [ ] **Step 3: Create topic approval reminder**

GET handler: Verify CRON_SECRET. Query blog_topics where status='pending' and month = current month. Group by config. For configs with pending topics: if day >= 7, auto-approve and trigger generation. If day >= 5, send reminder email.

- [ ] **Step 4: Add cron schedules to vercel.json**

Add to existing crons array:
```json
{ "path": "/api/cron/blog-monthly-generate", "schedule": "0 3 2 * *" },
{ "path": "/api/cron/blog-publish", "schedule": "0 9 * * 1-5" },
{ "path": "/api/cron/blog-topic-reminder", "schedule": "0 9 5 * *" }
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/cron/blog-* vercel.json
git commit -m "feat: add blog cron jobs (generate, publish, topic reminder)"
```

---

## Phase 5: Dashboard

### Task 15: Admin Dashboard Pages

**Files:**
- Create: src/app/dashboard/admin/blog/page.tsx
- Create: src/app/dashboard/admin/blog/new/page.tsx
- Create: src/app/dashboard/admin/blog/[id]/page.tsx
- Modify: src/components/dashboard/sidebar.tsx
- Modify: src/lib/modules.ts

- [ ] **Step 1: Add blog to modules and sidebar**

Add to modules.ts: blog entry with adminOnly path.
Add to sidebar.tsx: "Blog Content" with FileText icon from lucide-react in admin section.

- [ ] **Step 2: Create admin overview page**

Table: Client, Tier, Posts/Month, Current Batch Status, Last Generated. "New Config" button.

- [ ] **Step 3: Create new config form**

Fields: client dropdown, website_url, blog_path, tier, delivery_method, delivery_email, github_repo (shown if git_push), brand_voice textarea, posts_per_month.

- [ ] **Step 4: Create config detail page**

Show config info, current batch with post list (title, status, scheduled date, preview link), "Generate Batch" button, "Approve Batch" button.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/admin/blog/ src/components/dashboard/sidebar.tsx src/lib/modules.ts
git commit -m "feat: add admin blog content dashboard pages"
```

---

### Task 16: Client Dashboard

**Files:**
- Create: src/app/dashboard/blog/page.tsx

- [ ] **Step 1: Create client blog dashboard**

Sections:
- Current batch: card grid of posts with title, scheduled date, status badge, click to expand
- Post detail modal/section: full preview with markdown/HTML toggle, copy-to-clipboard buttons, SEO metadata display, approve/reject buttons
- Topics (Growth/Pro): pending topics list with approve/reject, submit new topic form (Pro only)
- Archive: past months' batches

Add "Blog" to client sidebar section.

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/blog/
git commit -m "feat: add client blog content dashboard"
```

---

## Phase 6: API Documentation

### Task 17: API Documentation Pages

**Files:**
- Create: src/app/docs/blog-api/layout.tsx
- Create: src/app/docs/blog-api/page.mdx
- Create: src/app/docs/blog-api/posts/page.mdx
- Create: src/app/docs/blog-api/topics/page.mdx

- [ ] **Step 1: Create docs layout**

Minimal layout with sidebar nav: Getting Started, Posts API, Topics API.

- [ ] **Step 2: Create Getting Started page**

Overview, tier differences, batch lifecycle, delivery methods.

- [ ] **Step 3: Create Posts API page**

GET /api/blog/batches, GET /api/blog/posts/[id], POST approve/reject. Response formats, auth.

- [ ] **Step 4: Create Topics API page**

GET /api/blog/topics, POST submit topic (Pro), POST approve/reject. Auth, tier restrictions.

- [ ] **Step 5: Commit**

```bash
git add src/app/docs/blog-api/
git commit -m "feat: add blog API documentation pages"
```

---

## Phase 7: Product Page

### Task 18: Product/Marketing Page

**Files:**
- Create: src/app/services/content-generation/page.tsx

- [ ] **Step 1: Create product page**

Follow existing product page pattern from src/app/services/seo-automation/page.tsx. Include:
- Hero section with value prop
- Features grid (topic sourcing, SEO optimization, GBP loop, brand voice, delivery)
- Tier comparison table
- Search Visibility Bundle callout (15-20% discount with SEO)
- CTA to contact/sign up

- [ ] **Step 2: Commit**

```bash
git add src/app/services/content-generation/
git commit -m "feat: add content generation product page"
```

---

## Phase 8: Integration + Deploy

### Task 19: Build + Deploy

- [ ] **Step 1: Run build**

Run: `cd engineering/projects/ophidian-ai && npm run build`
Fix any TypeScript or build errors.

- [ ] **Step 2: Push and deploy**

```bash
cd engineering/projects/ophidian-ai && git push
```

- [ ] **Step 3: Update submodule**

```bash
cd /c/Claude\ Code/OphidianAI
git add engineering/projects/ophidian-ai
git commit -m "feat: update ophidian-ai submodule with Content Generation product"
```

---

## Post-Launch Tasks (Future)

- [ ] GitHub App installation for git push (currently uses personal access token)
- [ ] Nano Banana 2 integration for Pro tier AI-generated blog images
- [ ] Content freshness auto-rewrite for Pro tier
- [ ] Bundle pricing in Stripe product catalog
- [ ] Client-facing editorial calendar view (Pro tier monthly planner)
