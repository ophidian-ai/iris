# Content Generation -- Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

AI-powered blog content generation for small business clients. Produces SEO-optimized blog posts using the shared keyword engine from SEO Automation, with tiered topic control, batch-and-stagger delivery, and dual delivery modes (copy/paste for external sites, git push for sites we build). Sold standalone or bundled with SEO Automation in the Search Visibility Bundle at a discount.

### Key Decisions

- **Topic sourcing:** Tiered -- Essentials: fully automated from keyword gaps. Growth: we suggest, client approves. Pro: client input + our research, editorial calendar.
- **Delivery model:** Batch generation at start of month, staggered publish throughout month (mirrors social content engine pattern).
- **Content delivery:** Copy/paste from dashboard for external client sites. Git commit to client repo for sites we build (auto-deploy on Vercel).
- **Infrastructure:** Shares keyword engine, GBP sync pipeline, and content freshness scanner with SEO Automation.

---

## Tier Structure

### A La Carte

- Setup: $300
- Monthly: $249/mo

### Within Platform Tiers / Search Visibility Bundle

| Feature | Essentials | Growth | Pro |
|---------|-----------|--------|-----|
| Blog posts per month | 4 | 8 | 12 |
| Topic sourcing | Fully automated | We suggest, client approves | Client input + our research |
| SEO optimization | Keyword targeting | + internal linking suggestions | + topical authority clusters |
| Blog + GBP loop | Manual (we provide GBP copy) | Auto-generate GBP update | Auto + ongoing optimization |
| Brand voice | Template tone | Brand voice profile tuning | Full custom voice with samples |
| Delivery method | Copy/paste from dashboard | Copy/paste or git push | Copy/paste or git push |
| Editorial calendar | No | No | Yes (monthly planning view) |
| Content freshness refresh | No | Flagged by SEO, manual rewrite | Auto-refresh recommendations + rewrites |
| Image suggestions | No | Stock photo suggestions (Pexels) | AI-generated images (Nano Banana 2) |

### Search Visibility Bundle

15-20% discount when Content Generation + SEO Automation purchased together. The blog + GBP loop is the key integration point -- blogs feed the SEO engine, GBP updates drive local visibility.

---

## Architecture

```
Monthly Cycle (cron: 2nd of month at 3am ET, after SEO audit runs on 1st)
  |-- Per-client content profile (Supabase: content_configs table)
  |-- Topic Generation
  |     |-- Essentials: keyword gaps from latest seo_audits + keyword discovery
  |     |-- Growth: AI suggests topics -> staged for client approval -> generate approved
  |     |-- Pro: client topics from editorial calendar + our keyword-aligned suggestions
  |-- Content Generation (per post)
  |     |-- Research: Firecrawl search for top-ranking content on the topic
  |     |-- Outline: AI generates SEO-optimized outline (H2/H3 structure, keyword placement)
  |     |-- Draft: AI writes full post (800-1500 words) with brand voice profile
  |     |-- SEO metadata: title tag, meta description, slug, focus keyword, alt text suggestions
  |     |-- Internal linking: suggest links to existing client pages (Growth/Pro)
  |     |-- GBP summary: 1500-char version for Google Business Profile update
  |-- Batch Creation
  |     |-- All posts generated as a batch (content_batches table)
  |     |-- Staggered publish schedule: posts evenly distributed across the month
  |     |-- Status: draft -> review -> approved -> scheduled -> published
  |-- Delivery
        |-- Dashboard: formatted HTML + markdown available for copy/paste
        |-- Git push (sites we build): MDX file committed to client repo via GitHub API
        |-- GBP sync: staged as draft via seo_gbp_drafts table (shared with SEO Automation)
```

### Shared Infrastructure (From SEO Automation)

- **Keyword engine:** `POST /api/seo/keywords/discover` for topic research
- **GBP sync pipeline:** Content -> GBP summary -> stage for approval
- **Content freshness scanner:** Identifies posts needing refresh

---

## Data Model

### New Supabase Tables

#### content_configs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| client_id | uuid, FK -> clients | |
| tier | enum: essentials, growth, pro | |
| website_url | text NOT NULL | |
| blog_path | text, default '/blog' | URL path for blog on client site |
| posts_per_month | int | 4/8/12 by tier |
| brand_voice | jsonb | `{ tone, style, samples, keywords_to_use, keywords_to_avoid }` |
| github_repo | text, nullable | For sites we build: owner/repo |
| github_branch | text, default 'main' | Branch to push to |
| blog_content_path | text, default 'src/content/blog' | File path in repo for MDX files |
| delivery_method | enum: dashboard, git_push | |
| delivery_email | text NOT NULL | Notification email |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### content_batches

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> content_configs | |
| month | date NOT NULL | First of the month this batch covers |
| status | enum: generating, review, approved, publishing, published | |
| post_count | int | Number of posts in batch |
| created_at | timestamptz | |
| updated_at | timestamptz | |

UNIQUE constraint on (config_id, month).

#### content_posts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| batch_id | uuid, FK -> content_batches | |
| config_id | uuid, FK -> content_configs | |
| title | text NOT NULL | |
| slug | text NOT NULL | URL slug |
| content_markdown | text NOT NULL | Full blog post in markdown |
| content_html | text NOT NULL | Rendered HTML for copy/paste |
| seo_metadata | jsonb | `{ title_tag, meta_description, focus_keyword, alt_texts }` |
| gbp_summary | text, nullable | 1500-char GBP version |
| internal_links | jsonb, nullable | Suggested internal links `[{ text, url }]` |
| image_suggestions | jsonb, nullable | Stock or AI image recommendations |
| scheduled_date | date NOT NULL | When to publish |
| status | enum: draft, review, approved, scheduled, published, rejected | |
| published_url | text, nullable | Final URL after publishing |
| github_commit_sha | text, nullable | Git commit SHA for git_push delivery |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### content_topics (Growth/Pro -- topic approval flow)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> content_configs | |
| month | date NOT NULL | |
| title | text NOT NULL | Suggested topic |
| keyword | text NOT NULL | Target keyword |
| rationale | text | Why this topic (keyword gap, trend, client request) |
| source | enum: ai_suggested, client_requested | |
| status | enum: pending, approved, rejected | |
| created_at | timestamptz | |

---

## API Design

### Client-Facing (Auth-Protected)

- `GET /api/content/batches` -- List batches for the logged-in client
- `GET /api/content/batches/[id]` -- Get batch with all posts
- `GET /api/content/posts/[id]` -- Get single post with full content (markdown + HTML)
- `POST /api/content/posts/[id]/approve` -- Approve a post for publishing
- `POST /api/content/posts/[id]/reject` -- Reject a post with feedback
- `GET /api/content/topics` -- List suggested topics pending approval (Growth/Pro)
- `POST /api/content/topics/[id]/approve` -- Approve a topic
- `POST /api/content/topics/[id]/reject` -- Reject a topic
- `POST /api/content/topics` -- Submit a topic idea (Pro)

### Admin Endpoints

- `GET /api/admin/content/configs` -- List all content client configs
- `POST /api/admin/content/configs` -- Create new content config
- `PATCH /api/admin/content/configs/[id]` -- Update config
- `DELETE /api/admin/content/configs/[id]` -- Deactivate
- `POST /api/admin/content/configs/[id]/generate` -- Trigger batch generation manually
- `POST /api/admin/content/posts/[id]/publish` -- Manually publish a post

---

## Dashboard UI

### Admin View (`/dashboard/admin/content`)

- All content clients: table with client name, tier, posts this month, batch status, last generated
- "New Content Config" button
- Config form: URL, blog path, tier, brand voice, delivery method, GitHub repo (if git_push)
- Batch detail view: all posts with status, preview, approve/reject buttons

### Client View (`/dashboard/content`)

- **Current batch:** Card grid of this month's posts with title, scheduled date, status
- **Post detail:** Full preview with markdown/HTML toggle, copy-to-clipboard button, SEO metadata display
- **Topics** (Growth/Pro): Pending topics to approve/reject, submit new topic form
- **Editorial calendar** (Pro): Monthly calendar view showing scheduled publish dates
- **Archive:** Past months' batches with links to published posts

---

## Content Generation Pipeline

### Per-Post Flow

1. **Research** (5-10 seconds): Firecrawl search for the target keyword. Pull top 3 results, extract structure (headings, word count, topics covered).
2. **Outline** (2-3 seconds): AI generates H2/H3 outline optimized for the keyword. Includes intro hook, body sections, CTA conclusion.
3. **Draft** (10-15 seconds): AI writes full post using outline + brand voice profile + competitor research. Target 800-1500 words. Includes natural keyword usage (2-3% density), longtail variations, and FAQ section for AEO.
4. **SEO metadata** (2-3 seconds): Generate title tag (60 chars), meta description (155 chars), focus keyword, image alt text suggestions.
5. **GBP summary** (2-3 seconds): Condense key points to 1500 chars with keyword alignment and CTA.
6. **Internal links** (Growth/Pro): Cross-reference with existing pages on client site to suggest contextual internal links.
7. **Render**: Convert markdown to HTML for the copy/paste dashboard view.

### Brand Voice Profiles

Stored in `content_configs.brand_voice`:

```json
{
  "tone": "professional but approachable",
  "style": "informative, action-oriented",
  "samples": ["Example paragraph 1...", "Example paragraph 2..."],
  "keywords_to_use": ["artisan", "handcrafted", "local"],
  "keywords_to_avoid": ["cheap", "discount", "basic"],
  "audience": "homeowners aged 30-55 in Columbus IN area"
}
```

Essentials: generic professional tone. Growth: tuned from client website copy analysis. Pro: custom-built from provided samples and feedback.

---

## Delivery Mechanisms

### Dashboard Copy/Paste (All Tiers)

- Post detail page shows: rendered HTML preview + raw markdown + SEO metadata
- One-click copy buttons for each format
- Download as .md file option
- Includes formatting instructions for common CMS platforms (WordPress, Squarespace, Wix)

### Git Push (Sites We Build)

- Configured per client: `github_repo`, `github_branch`, `blog_content_path`
- On publish: create MDX file at `{blog_content_path}/{slug}.mdx` with frontmatter (title, date, description, keywords, image)
- Push via GitHub API: `PUT /repos/{owner}/{repo}/contents/{path}`
- Vercel auto-deploys on push
- Store `github_commit_sha` on the post record for tracking
- If push fails: retry once, then mark as failed and notify admin

### GBP Sync

- For each published post: create `seo_gbp_drafts` record with the GBP summary
- Growth/Pro: auto-staged for client approval
- Essentials: copy provided in dashboard, client posts manually

---

## Cron Jobs

### Monthly Batch Generation (`/api/cron/content-monthly-generate`)

- Schedule: `0 3 2 * *` (2nd of month, 3am ET -- runs after SEO audit on 1st)
- Iterates all active `content_configs`
- Per client:
  - Essentials: generate topics from keyword gaps, generate all posts, create batch
  - Growth: generate topic suggestions, stage for approval (generation happens after approval)
  - Pro: check editorial calendar for pre-approved topics, generate posts, stage remaining suggestions

### Staggered Publish (`/api/cron/content-publish`)

- Schedule: `0 9 * * 1-5` (9am ET, weekdays)
- Check `content_posts` with `status = scheduled` and `scheduled_date <= today`
- Per post: execute delivery (dashboard update or git push), update status to published
- Send notification to client

### Topic Approval Reminder (`/api/cron/content-topic-reminder`)

- Schedule: `0 9 5 * *` (5th of month, 9am ET)
- For Growth/Pro clients with unapproved topics: send reminder email
- If topics not approved by 7th: auto-approve and generate (configurable)

---

## API Documentation

**Location:** `ophidianai.com/docs/content-api` (MDX pages)

### Sections

1. **Getting Started** -- What Content Generation does, tier differences
2. **Batches API** -- List batches, get batch details, post statuses
3. **Posts API** -- Get post content (markdown/HTML), approve/reject, copy-paste instructions
4. **Topics API** (Growth/Pro) -- View suggestions, approve/reject, submit topics
5. **Delivery** -- How git push works for hosted sites, CMS-specific paste guides

### Access

- Authenticated clients only (Supabase auth)
- Scoped to own data via RLS

---

## Security & Constraints

### Auth

- Admin endpoints: Supabase auth, `profile.role = 'admin'`
- Client endpoints: Supabase auth, RLS scoped to client's `content_configs`

### Rate Limits

- Manual batch trigger: max 1 per client per month
- Topic submission (Pro): max 20 topics per month

### Content Quality Controls

- AI-generated content reviewed by OphidianAI before client sees it (admin approval step)
- Plagiarism: use low temperature (0.3) + unique angle per post to minimize duplicate content risk
- Brand voice: validated against profile on generation, flagged if drift detected
- SEO: keyword density checked (target 2-3%), meta descriptions validated for length

### GitHub API Usage

- One API call per post published (PUT file contents)
- Rate limit: 5,000 requests/hour (GitHub API limit, not a concern at our volume)
- Auth: GitHub App installation token per client repo (or personal access token)

### Firecrawl Usage per Client per Month

| Tier | Research searches | Total calls |
|------|------------------|-------------|
| Essentials | 4 posts x 3 searches | ~12 |
| Growth | 8 posts x 3 searches | ~24 |
| Pro | 12 posts x 3 searches | ~36 |

---

## Integration with SEO Automation

### Data Flow

```
SEO Automation (1st of month)
  |-- Monthly audit identifies keyword gaps
  |-- Keyword discovery finds longtail opportunities
  |-- Content freshness flags stale pages
  v
Content Generation (2nd of month)
  |-- Uses keyword gaps as topic seeds (Essentials)
  |-- Includes keyword targets in post optimization
  |-- Generates GBP summaries for each post
  v
SEO Automation (next month)
  |-- Tracks ranking changes for keywords targeted in blog posts
  |-- Measures impact of content on overall SEO score
  |-- Feedback loop: what worked informs next month's topics
```

### Shared Tables

- `seo_gbp_drafts` -- Content Generation creates drafts, SEO Automation surfaces them
- `seo_rankings` -- Content Generation reads keyword performance to inform topics
- `seo_configs` -- Content Generation reads keyword targets and competitor data

### Shared Endpoints

- `POST /api/seo/keywords/discover` -- Used by both for keyword research
- `POST /api/seo/keywords/check-rank` -- Used to validate topic opportunity

---

## Dependencies

- **AI SDK** (existing from chatbot) -- Content generation, outline creation, SEO metadata
- **Firecrawl** (existing) -- Competitor content research
- **Supabase** (existing) -- Configs, batches, posts, topics, auth, RLS
- **Resend** (existing) -- Batch notifications, topic reminders
- **GitHub API** -- Git push delivery for hosted sites
- **Pexels API** (existing) -- Stock image suggestions for Growth tier
- **Nano Banana 2** (existing) -- AI image generation for Pro tier
- **PDF report generator** (existing) -- Not used directly, but shared brand template
- **Next.js 16** (existing) -- App router, API routes, MDX for docs
- **SEO Automation** (sibling product) -- Shared keyword engine, GBP sync, content freshness
