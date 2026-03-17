# Social Content Engine -- Design Spec

**Date:** 2026-03-16
**Status:** Draft
**Author:** Iris (brainstorming session with Eric)

## Overview

Overhaul the existing `social-content` skill into a modular, end-to-end social media content engine. The engine generates bi-weekly batches of posts across Facebook, Instagram, LinkedIn, and TikTok with AI-generated images, a human review gate, and automated scheduling via direct platform APIs.

This system serves OphidianAI first, then scales to client offerings through shared modules.

## Goals

- Post every 2 days across FB, IG, LinkedIn, TikTok (exactly 7 posts per bi-weekly batch -- days 1, 3, 5, 7, 9, 11, 13 of the 14-day window)
- Generate post copy adapted per platform from a single core message
- Route image generation to the right tool per content type (Playwright, Excalidraw, Nano Banana 2, Pexels)
- Automate scheduling via direct platform APIs (no third-party scheduler)
- Human review gate on Sundays before anything publishes
- Reusable modules that `client-social-content` can share

## Architecture

### Pipeline Flow

```text
TRIGGER (bi-weekly cron or manual /social-content)
    |
ORCHESTRATOR (.claude/skills/social-content/)
    - Determines date range (next 2 weeks, 7 posts)
    - Rotates across 6 content pillars
    - Generates copy per post, adapts per platform
    - Assigns image pipeline per post type
    - Outputs batch JSON + markdown
    |
IMAGE ROUTER (.claude/skills/social-image-gen/)
    - Reads batch JSON, routes each post to correct image source
    - Produces finished images sized per platform
    - Updates batch JSON with image paths
    |
REVIEW GATE (Sunday)
    - Eric reviews copy + images together
    - Approve / Edit / Regenerate
    |
PLATFORM SCHEDULER (.claude/skills/social-scheduler/)
    - Reads approved batch JSON
    - Uploads images and schedules posts via platform APIs
    - Writes deployment manifest with post IDs
```

### Module Breakdown

| Module | Location | Type | Reused by Client Skill |
| --- | --- | --- | --- |
| social-content (orchestrator) | `.claude/skills/social-content/` | Skill (SKILL.md) | No -- client version has its own |
| social-image-gen (image router) | `.claude/skills/social-image-gen/` | Skill + scripts | Yes |
| social-scheduler (platform APIs) | `.claude/skills/social-scheduler/` | Skill + scripts | Yes |
| Playwright compositor | `.claude/skills/social-image-gen/scripts/compositor.js` | Node script | Yes |
| Excalidraw generator | `.claude/skills/social-image-gen/scripts/excalidraw-gen.js` | Node script | Yes |
| Nano Banana 2 caller | `.claude/skills/social-image-gen/scripts/nano-banana.js` | Node script | Yes |
| Pexels fetcher | `.claude/skills/social-image-gen/scripts/pexels-fetch.js` | Node script | Yes |

## Module 1: Orchestrator (social-content)

Overhauled SKILL.md replacing the current social-content skill.

### Changes from Current

- **Cadence:** Bi-weekly batch (7 posts) instead of weekly (4-5 posts)
- **Platforms:** FB, IG, LinkedIn, TikTok (adds LinkedIn)
- **Pillars:** 6 instead of 4 (splits Education into AI Education + Website Tips)
- **Output format:** JSON batch file alongside markdown for human review
- **Platform adaptation:** Each post gets 4 variants with platform-specific copy, tone, and formatting
- **Image assignment:** Each post gets `imageSource` and `imagePrompt` fields

### Content Pillars (6)

| Pillar | What It Covers | Primary Image Source |
| --- | --- | --- |
| Proof of Work | Before/after website transformations, client wins, results | Playwright compositor |
| AI Education | "How AI workflows help your business", chatbot demos, automation explainers | Excalidraw diagrams |
| Website Tips | "3 reasons your website is losing customers", mobile-first, speed tips | Nano Banana or Pexels |
| Showcase | Completed projects, portfolio pieces, feature highlights | Project screenshots or Pexels |
| Local Relevance | Columbus/Southern Indiana angle, local business stats, community | Pexels or Nano Banana |
| Behind the Scenes | Build process, tools, day-in-the-life, lessons learned | Pexels or Nano Banana |

One post per batch must be an **engagement post** (poll, question, or local callout). Can overlap any pillar.

### Platform Adaptation Rules

Each post generates 4 variants from a single core message:

| Platform | Copy Length | Tone | Format Notes |
| --- | --- | --- | --- |
| Facebook | 50-150 words | Casual-professional | Short paragraphs, lead with most interesting line |
| Instagram | Visual-first | Approachable | Carousel (3-5 slides), Reel script, or Story (1-3 frames with interaction elements), 5-8 hashtags |
| LinkedIn | 100-300 words | Professional-first | Lead with insight, 3-5 hashtags at end only |
| TikTok | Script under 60s | Hook-first | Hook in first 2 seconds, note voiceover vs on-camera. Scheduler sends script to TikTok inbox for manual recording/publish (upgrade to direct video post when app approved). |

### Posting Schedule

Every 2 days. Best posting windows (ET):

- Weekdays: 7-9 AM, 12-1 PM, or 5-7 PM
- Varies by platform -- orchestrator assigns optimal time per platform per post

### Output

**Batch JSON** (`marketing/social-media/batches/YYYY-MM-DD-batch.json`):

```json
{
  "batchId": "2026-03-16",
  "dateRange": "2026-03-17 to 2026-03-30",
  "status": "draft",
  "posts": [
    {
      "postNumber": 1,
      "pillar": "Website Tips",
      "title": "3 Reasons Your Website Is Losing You Customers",
      "scheduledDate": "2026-03-17",
      "imageSource": "nanoBanana",
      "imagePrompt": "Frustrated small business owner looking at laptop showing outdated website, warm lighting, professional setting",
      "platforms": {
        "facebook": {
          "copy": "...",
          "hashtags": ["#ColumbusIndiana", "..."],
          "scheduledTime": "12:00 ET",
          "contentType": "text-post",
          "imagePath": null,
          "altText": "Description of image for accessibility"
        },
        "instagram": {
          "copy": "...",
          "hashtags": ["#ColumbusIndiana", "..."],
          "scheduledTime": "12:00 ET",
          "contentType": "carousel",
          "imagePath": null,
          "altText": "Description of image for accessibility",
          "slides": [
            { "text": "Slide 1 hook text", "imagePath": null },
            { "text": "Slide 2 content", "imagePath": null },
            { "text": "Slide 3 CTA", "imagePath": null }
          ]
        },
        "linkedin": {
          "copy": "...",
          "hashtags": ["#SmallBusiness", "..."],
          "scheduledTime": "10:00 ET",
          "contentType": "text-post",
          "imagePath": null,
          "altText": "Description of image for accessibility"
        },
        "tiktok": {
          "copy": "...",
          "scheduledTime": "17:00 ET",
          "contentType": "script",
          "hook": "...",
          "format": "voiceover",
          "imagePath": null
        }
      }
    }
  ]
}
```

**Batch Markdown** (`marketing/social-media/batches/YYYY-MM-DD-batch.md`):

Human-readable version with the same content, formatted for review.

### Batch Conflict Handling

If `/social-content` is run while a batch for an overlapping date range already exists:

- If existing batch is `draft` or `review`: overwrite it (replace with fresh generation)
- If existing batch is `approved` or `scheduled`: error -- do not overwrite. Prompt Eric to choose: cancel the existing batch first, or shift the new batch to the next available 2-week window.

## Module 2: Image Router (social-image-gen)

New skill at `.claude/skills/social-image-gen/`. Takes batch JSON, produces finished images.

### Routing Logic

| imageSource | Script | Input | Output |
| --- | --- | --- | --- |
| `playwright` | `scripts/compositor.js` | Old site URL + new site URL | Branded side-by-side PNG with "Before"/"After" labels and OphidianAI watermark |
| `excalidraw` | `scripts/excalidraw-gen.js` | Workflow/diagram description from `imagePrompt` | PNG export of programmatically generated .excalidraw diagram |
| `nanoBanana` | `scripts/nano-banana.js` | Text prompt from `imagePrompt` | AI-generated image via Gemini API |
| `pexels` | `scripts/pexels-fetch.js` | Search query from `imagePrompt` | Downloaded stock photo from Pexels API |

### Platform Sizing

Each image gets resized/cropped for each platform's specs:

| Platform | Size | Aspect Ratio |
| --- | --- | --- |
| Facebook | 1200x630 | Landscape |
| LinkedIn | 1200x630 | Landscape |
| Instagram Feed | 1080x1080 or 1080x1350 | Square or Portrait |
| Instagram/TikTok Reel | 1080x1920 | Vertical (9:16) |

### Image Output

Images saved to `marketing/social-media/images/YYYY-MM-DD/`:

- `post-01-facebook.png`
- `post-01-instagram.png`
- `post-01-linkedin.png`
- `post-01-tiktok.png`
- (repeat per post)

After generation, the batch JSON is updated with `imagePath` fields inside each platform variant pointing to the platform-sized files.

### Carousel Image Generation

For Instagram carousel posts, the image router generates a separate image per slide:

1. Each slide gets its own image with text overlay composited via Sharp/Canvas
2. Slide images are saved as `post-01-instagram-slide-01.png`, `post-01-instagram-slide-02.png`, etc.
3. The batch JSON `slides` array is updated with individual `imagePath` entries per slide
4. The base image (from Nano Banana, Pexels, etc.) is used as the background, with slide text overlaid

### Resize Pipeline

All image source scripts output a single master image at the highest needed resolution. The shared `resize.js` script then:

1. Reads the master image
2. Produces platform-sized variants (crop + resize via Sharp)
3. Saves each variant with the platform suffix
4. Updates the batch JSON with per-platform paths

This runs as a post-processing step after each image source script completes.

### Playwright Compositor Details

For before/after posts:

1. Navigate to old site URL via Playwright, take full-page screenshot (viewport: 1280x800)
2. Navigate to new site URL, take full-page screenshot (same viewport)
3. Composite into a side-by-side graphic:
   - "BEFORE" label (left, red accent) + "AFTER" label (right, green accent)
   - OphidianAI logo watermark in bottom-right corner
   - Clean border and drop shadow
4. Source URLs: Old site from prospect research archives (`sales/lead-generation/prospects/*/`) or Wayback Machine. New site from live deployment.

**Prerequisite:** Before/after posts require at least one completed project. If no completed projects exist, the orchestrator skips the Proof of Work pillar and backfills when portfolio grows.

### Excalidraw Generator Details

For AI Education posts with workflow/integration diagrams:

1. Takes a description like "How an AI chatbot handles customer inquiries: Customer visits site -> Chatbot greets -> Answers FAQ -> Escalates to human if needed -> Logs interaction"
2. Generates an `.excalidraw` JSON file programmatically with:
   - Simple flowchart/process nodes (3-5 steps max)
   - OphidianAI brand colors (#39ff14 accents on dark background)
   - Clean, readable layout
3. Exports to PNG via Playwright headless rendering of the `@excalidraw/excalidraw` React component (no standalone Excalidraw CLI exists -- use the same Playwright-based approach as the compositor)

## Module 3: Platform Scheduler (social-scheduler)

New skill at `.claude/skills/social-scheduler/`. Takes approved batch JSON with image paths and pushes to platform APIs.

### API Integrations

| Platform | API | Auth Method | Key Capabilities |
| --- | --- | --- | --- |
| Facebook | Meta Graph API v21 | OAuth 2.0 (Page Access Token) | Schedule posts with images, carousels |
| Instagram | Meta Graph API v21 | Same token as FB (linked accounts) | Content Publishing API -- schedule media + captions |
| LinkedIn | LinkedIn Marketing API | OAuth 2.0 (3-legged) | Share API -- schedule posts with images |
| TikTok | TikTok Content Posting API | OAuth 2.0 | Direct post or inbox notification |

### Auth

- Access tokens and refresh tokens stored in `.env` (gitignored)
- Each platform script checks token validity before use and auto-refreshes if expired
- **Meta (FB + IG):** Use System User long-lived Page Access Token (never expires). Obtained once via Business Manager. No refresh cycle needed.
- **LinkedIn:** Access token expires in 60 days, refresh token in 365 days. Script auto-refreshes access token using refresh token. If refresh token expires (60+ days of inactivity), the skill prompts for re-auth via browser OAuth flow.
- **TikTok:** Access token expires in 24 hours, refresh token in 365 days. Script auto-refreshes on every run.
- **Initial setup:** Each platform has a setup script (`scripts/auth/<platform>-setup.js`) that opens a browser for OAuth consent, captures the callback, and writes tokens to `.env`. Run once per platform.
- **Token health check:** The scheduler runs a pre-flight check on all tokens before attempting to schedule. Reports any expired or invalid tokens before processing the batch.

### Blocker: Meta Business Verification

Meta Business Verification is currently **pending approval**. FB and IG scheduling cannot go live until verification is complete. In the meantime:

- Build and test all Meta API scripts against the Meta Graph API sandbox/test pages
- The orchestrator and image router can run fully without Meta verification
- Once verified, flip the scheduler to production endpoints

### Workflow

1. Read approved batch JSON (status: `approved`)
2. Run token health check -- abort early if any platform tokens are invalid
3. For each post, for each platform variant:
   - Upload the platform-sized image to the platform's media endpoint
   - Schedule the post at the assigned date/time with the platform-adapted copy and hashtags
   - Record the platform post ID back into the batch JSON
4. Write deployment manifest to `marketing/social-media/scheduled/YYYY-MM-DD-manifest.json`
5. Update batch status to `scheduled`
6. Output summary of what was scheduled

### TikTok Caveat

TikTok's Content Posting API has two modes:

- **Direct post:** Limited access, requires app review and approval. Posts publish automatically.
- **Inbox notification:** Available immediately. Sends content to TikTok app inbox for manual publish.

Start with inbox notification. Upgrade to direct post once the TikTok developer app is approved.

### Error Handling

- If a platform API fails, the post is flagged in the manifest as `failed` with the error message
- Other platforms still get scheduled (no all-or-nothing)
- Summary shows what succeeded and what needs manual attention
- Failed posts can be retried with `/social-retry 3 tiktok`

### Post Verification

To move posts from `scheduled` to `published`:

- `/social-check` command queries each platform API for post status after the scheduled publish time
- Updates the deployment manifest with confirmed `published` status and live post URLs
- Reports any posts that failed to publish (e.g., rejected by platform review)
- Morning coffee briefing runs `/social-check` automatically for any batch in `scheduled` status

### Deployment Manifest

```json
{
  "batchId": "2026-03-16",
  "scheduledAt": "2026-03-16T18:00:00-04:00",
  "posts": [
    {
      "postNumber": 1,
      "platforms": {
        "facebook": { "status": "scheduled", "postId": "fb_123", "scheduledTime": "2026-03-17T12:00:00-04:00" },
        "instagram": { "status": "scheduled", "postId": "ig_456", "scheduledTime": "2026-03-17T12:00:00-04:00" },
        "linkedin": { "status": "scheduled", "postId": "li_789", "scheduledTime": "2026-03-17T10:00:00-04:00" },
        "tiktok": { "status": "inbox", "scheduledTime": "2026-03-17T17:00:00-04:00" }
      }
    }
  ]
}
```

## Module 4: Review & Approval Workflow

### Sunday Review Flow

1. Batch generation runs (cron every other Sunday AM, or manual `/social-content`)
2. Skill produces:
   - `marketing/social-media/batches/YYYY-MM-DD-batch.md` -- Human-readable markdown
   - `marketing/social-media/batches/YYYY-MM-DD-batch.json` -- Machine-readable JSON
   - `marketing/social-media/images/YYYY-MM-DD/` -- All generated images by post number and platform
3. Eric reviews the batch. Three actions:
   - **`/social-approve`** -- Approves full batch, triggers scheduler
   - **`/social-edit 3`** -- Opens post #3 for edits. Provide new copy or instructions, skill regenerates that post only.
   - **`/social-regen 5 image`** -- Regenerates just the image for post #5 with new prompt or different source.
4. After edits/regens, approve and the scheduler runs

### Batch Status Lifecycle

```text
draft -> review -> approved -> scheduled -> published
```

- `draft` -- Batch generated, images being produced
- `review` -- Images complete, ready for Eric's review
- `approved` -- Eric approved, scheduler can run
- `scheduled` -- Posts pushed to platform APIs
- `published` -- Posts have gone live (confirmed via `/social-check`)

### Morning Coffee Integration

The morning briefing pulls current batch status:

- "Social batch for Mar 17-30: **review** -- 7 posts ready for approval"
- "Social batch for Mar 3-16: **scheduled** -- 3 posts remaining this week"

## Module 5: Content Rules & Templates

### Rules (Carried Over)

1. **No emojis.** None in post copy, hashtags, or visual direction.
2. **Professional but approachable tone.** Informative, not salesy. "Knowledgeable neighbor" voice.
3. **No jargon.** Never use: SEO, conversion rate, responsive design, CTA, UX, UI, bounce rate, optimization, analytics, ROI. Use outcome language:
   - "SEO" -> "showing up when people search for you"
   - "responsive design" -> "looks great on any phone or computer"
   - "conversion rate" -> "turning visitors into customers"
4. **No hard selling.** Posts demonstrate expertise through value. Soft CTAs only.
5. **Self-contained value.** Every post teaches, shows, or sparks something on its own. No multi-part series.
6. **Hashtag rules.** 5-8 per post, at least 2 local. No hashtags with spaces or special characters.
7. **Industry rotation.** When no specific focus given, rotate through: auto services, health/wellness, restaurants, retail, professional services, general local service.
8. **Anchor content integration.** If Eric provides video descriptions, reference or repurpose them. Do not generate anchor content.

### Rules (New)

1. **LinkedIn tone shift.** Professional-first. Lead with insight, not promotion. No hashtags in body text -- 3-5 at end only.
2. **TikTok adaptation.** Hook in first 2 seconds. Script under 60 seconds. Note if voiceover or on-camera needed.
3. **One engagement post per batch.** Must include a direct question, poll, or callout that invites a response. Flag in batch summary.
4. **Before/after prerequisites.** Requires old site URL (from prospect archives or Wayback Machine) + new live site URL. Skip Proof of Work pillar if no completed projects exist; backfill when portfolio grows.
5. **AI Education simplicity.** Use outcome language, not tech language. "Your website answers customer questions at 2 AM" not "AI-powered chatbot integration." Excalidraw diagrams: 3-5 steps max, simple flowcharts.
6. **CTA rotation.** Rotate through: "Drop your URL in the comments", "Save this for later", "DM me AUDIT", "Follow for more", "Book a free consultation". Never repeat same CTA within one batch.

### Post Template Library

Recurring formats the orchestrator draws from:

| # | Template | Pillar | Image Source |
| --- | --- | --- | --- |
| 1 | "X reasons your website is losing you customers" | Website Tips | Nano Banana or Pexels |
| 2 | "How [AI tool] can save your [industry] business X hours/week" | AI Education | Excalidraw diagram |
| 3 | "What we found when we audited [type of] businesses in Columbus" | Local Relevance | Pexels or Nano Banana |
| 4 | Before/after transformation reveal | Proof of Work | Playwright compositor |
| 5 | "Here's what we built this week" | Behind the Scenes | Project screenshots or Pexels |
| 6 | "Did you know?" local business stat | Local Relevance | Pexels or Nano Banana |
| 7 | Quick tip with visual | Website Tips or AI Education | Nano Banana or Excalidraw |

## File Structure

```text
marketing/social-media/
  batches/
    YYYY-MM-DD-batch.md        # Human-readable batch
    YYYY-MM-DD-batch.json      # Machine-readable batch
  images/
    YYYY-MM-DD/
      post-01-facebook.png
      post-01-instagram.png
      post-01-linkedin.png
      post-01-tiktok.png
  scheduled/
    YYYY-MM-DD-manifest.json   # Deployment manifest with post IDs

.claude/skills/
  social-content/
    SKILL.md                   # Orchestrator (overhauled)
  social-image-gen/
    SKILL.md                   # Image router skill
    scripts/
      compositor.js            # Playwright before/after compositor
      excalidraw-gen.js        # Excalidraw diagram generator
      nano-banana.js           # Nano Banana 2 image generation
      pexels-fetch.js          # Pexels stock photo fetcher
      resize.js                # Platform-specific image resizing
  social-scheduler/
    SKILL.md                   # Platform scheduling skill
    scripts/
      facebook.js              # Meta Graph API (FB)
      instagram.js             # Meta Graph API (IG)
      linkedin.js              # LinkedIn Marketing API
      tiktok.js                # TikTok Content Posting API
      auth/
        meta-setup.js          # Meta OAuth setup (run once)
        linkedin-setup.js      # LinkedIn OAuth setup (run once)
        tiktok-setup.js        # TikTok OAuth setup (run once)
        meta-auth.js           # Shared Meta token handler
        linkedin-auth.js       # LinkedIn token handler
        tiktok-auth.js         # TikTok token handler
```

## Dependencies

- **Node.js** -- Runtime for all scripts
- **Playwright** -- Browser automation for screenshots and Excalidraw rendering (already installed)
- **Gemini API** -- Nano Banana 2 image generation (key stored, already used for scroll-scrub hero)
- **Pexels API** -- Stock photos (key stored, already used for prospect mockups)
- **Meta Graph API** -- FB + IG posting (requires OAuth setup; blocked by pending Meta Business Verification)
- **LinkedIn Marketing API** -- LinkedIn posting (requires OAuth setup)
- **TikTok Content Posting API** -- TikTok posting (requires OAuth setup)
- **Sharp** -- Image resizing/compositing (npm package)
- **@excalidraw/excalidraw** -- React component for diagram rendering (rendered headlessly via Playwright)

## Future: Analytics & Performance Tracking (v2)

Not in scope for v1, but the data model should accommodate:

- Engagement metrics per post pulled from platform APIs (likes, comments, shares, reach)
- Pillar performance tracking (which pillar drives the most engagement)
- Template performance tracking (similar to email template rotation tracker in `sales/lead-generation/template-rotation.md`)
- Engagement fields added to the deployment manifest post-publish

## Client Reuse Path

When offering social media management to clients, the `client-social-content` skill gets updated to:

1. Keep its own orchestrator (client-specific pillars, brand voice, tier-based volume)
2. Call the shared `social-image-gen` skill for image generation
3. Call the shared `social-scheduler` skill for platform scheduling
4. Use client-specific API tokens (stored per-client in `.env`)

The image router and scheduler are platform-agnostic -- they don't care if the content is for OphidianAI or a client. They just process the batch JSON.
