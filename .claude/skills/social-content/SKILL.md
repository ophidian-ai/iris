---
name: social-content
description: Generate a bi-weekly batch of 7 social media posts across Facebook, Instagram, LinkedIn, and TikTok with AI-generated images. Use when Eric says "create social posts", "plan this week's content", "social media batch", "what should I post", "run social content", or when it's time for bi-weekly content generation. Produces batch JSON + markdown + platform-sized images for review.
---

# Social Content Engine -- Orchestrator

Generate a bi-weekly batch of 7 posts across Facebook, Instagram, LinkedIn, and TikTok. Each post gets platform-adapted copy, AI-generated images, and scheduled posting times. Outputs a batch JSON for the dashboard content engine and a markdown file for human review.

## When to Use

Bi-weekly content generation. Triggered by `/social-content` or manually when Eric asks for social content. Generates 7 posts covering the next 14 days (every 2 days).

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| Date range | No | Defaults to next 2 weeks from the upcoming Monday. Override with "Week of 2026-03-17" or specific date range. |
| Recent wins/projects | No | Client results, completed projects, before/afters to highlight |
| Industry focus | No | Which niche to emphasize. If omitted, rotate through: auto services, health/wellness, restaurants, retail, professional services, general local service |
| Anchor content | No | Descriptions of any on-camera video Eric recorded, to reference or repurpose |

## Process

### 1. Check for Batch Conflicts

Look in `marketing/social-media/batches/` for existing batches with overlapping date ranges.

- If existing batch is `draft` or `review`: overwrite it
- If existing batch is `approved` or `scheduled`: stop and ask Eric whether to cancel the existing batch or shift the new one to the next available window

### 2. Select 7 Posts Across 6 Pillars

Rotate across the 6 content pillars, ensuring variety:

| Pillar | What It Covers | Primary Image Source | Frequency |
| --- | --- | --- | --- |
| Proof of Work | Before/after website transformations, client wins, results | Playwright compositor | 1x/batch |
| AI Education | "How AI workflows help your business", chatbot demos, automation explainers | Excalidraw diagrams | 1x/batch |
| Website Tips | "3 reasons your website is losing customers", mobile-first, speed tips | Nano Banana or Pexels | 1-2x/batch |
| Showcase | Completed projects, portfolio pieces, feature highlights | Project screenshots or Pexels | 1x/batch |
| Local Relevance | Columbus/Southern Indiana angle, local business stats, community | Pexels or Nano Banana | 1x/batch |
| Behind the Scenes | Build process, tools, day-in-the-life, lessons learned | Pexels or Nano Banana | 1x/batch |

**One post per batch must be an engagement post** (poll, question, or local callout). Can overlap any pillar. Flag it in the batch summary.

**Before/after prerequisite:** Proof of Work posts require at least one completed project with an old site URL (from prospect archives or Wayback Machine) + new live site URL. Skip this pillar and substitute another if no completed projects exist yet.

### 3. Generate Each Post

For every post, produce:

#### Core Message
- A single core idea/message that will be adapted per platform
- Title for reference (e.g., "3 Reasons Your Website Is Losing You Customers")

#### 4 Platform Variants

| Platform | Copy Length | Tone | Format Notes |
| --- | --- | --- | --- |
| Facebook | 50-150 words | Casual-professional | Short paragraphs, lead with most interesting line |
| Instagram | Visual-first | Approachable | Carousel (3-5 slides), Reel script, or Story (1-3 frames with interaction), 5-8 hashtags |
| LinkedIn | 100-300 words | Professional-first | Lead with insight, 3-5 hashtags at end only |
| TikTok | Script under 60s | Hook-first | Hook in first 2 seconds, note voiceover vs on-camera |

Each platform variant includes:
- `copy` -- Full post text, ready to publish. No placeholders.
- `hashtags` -- 5-8 per post, at least 2 local. No hashtags on LinkedIn body text (end only).
- `scheduledTime` -- Optimal time for that platform (ET)
- `contentType` -- text-post, carousel, reel, story, or script
- `altText` -- Image description for accessibility

#### Image Assignment
- `imageSource` -- One of: `pexels`, `nanoBanana`, `playwright`, `excalidraw`
- `imagePrompt` -- Specific prompt for the image source:
  - Pexels: search query (e.g., "small business owner laptop modern office")
  - Nano Banana: detailed image generation prompt
  - Playwright: two URLs separated by ` | ` (e.g., "https://old-site.com | https://new-site.com")
  - Excalidraw: workflow steps separated by `->` (e.g., "Customer visits -> Chatbot greets -> Answers FAQ")

#### CTA Rotation
Rotate through these CTAs across the batch. Never repeat the same CTA within one batch:
- "Drop your URL in the comments"
- "Save this for later"
- "DM me AUDIT"
- "Follow for more"
- "Book a free consultation"

### 4. Assign Posting Schedule

Every 2 days across the 14-day window (days 1, 3, 5, 7, 9, 11, 13). Best posting windows (ET):

- Weekdays: 7-9 AM, 12-1 PM, or 5-7 PM
- Assign optimal times per platform per post (LinkedIn peaks at 10 AM-12 PM Tue-Thu, IG peaks at lunch/evening, etc.)

### 5. Write Output Files

#### Batch JSON

Save to: `marketing/social-media/batches/YYYY-MM-DD-batch.json`

Use the Monday date of the first week for the filename.

```json
{
  "batchId": "2026-03-17",
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
          "copy": "Full post text here...",
          "hashtags": ["#ColumbusIndiana", "#SmallBusiness", "#WebDesign", "#SouthernIndiana"],
          "scheduledTime": "12:00 ET",
          "contentType": "text-post",
          "imagePath": null,
          "altText": "Small business owner looking at laptop with outdated website"
        },
        "instagram": {
          "copy": "Full caption here...",
          "hashtags": ["#ColumbusIndiana", "#SmallBusiness", "#WebDesignTips", "#SouthernIndiana", "#SmallBizTips"],
          "scheduledTime": "12:00 ET",
          "contentType": "carousel",
          "imagePath": null,
          "altText": "Carousel: 3 reasons your website is losing customers",
          "slides": [
            { "text": "3 Reasons Your Website Is Losing You Customers", "imagePath": null },
            { "text": "Reason 1: It takes more than 3 seconds to load", "imagePath": null },
            { "text": "Reason 2: It doesn't work on phones", "imagePath": null },
            { "text": "Save this for later -- follow for more tips", "imagePath": null }
          ]
        },
        "linkedin": {
          "copy": "Full LinkedIn post here...",
          "hashtags": ["#SmallBusiness", "#WebDesign", "#DigitalPresence"],
          "scheduledTime": "10:00 ET",
          "contentType": "text-post",
          "imagePath": null,
          "altText": "Small business owner reviewing website performance"
        },
        "tiktok": {
          "copy": "Full script here...",
          "scheduledTime": "17:00 ET",
          "contentType": "script",
          "hook": "Your website might be turning away customers right now -- here's how to tell",
          "format": "voiceover",
          "imagePath": null
        }
      }
    }
  ]
}
```

#### Batch Markdown

Save to: `marketing/social-media/batches/YYYY-MM-DD-batch.md`

Human-readable version with the same content, formatted for review with a summary table at the top.

### 6. Generate Images

After writing both output files, invoke the `social-image-gen` skill to generate all images for the batch. The image router reads the batch JSON, generates master images, resizes for each platform, and updates the batch JSON with `imagePath` fields.

### 7. Sync to Dashboard

After writing the batch JSON and generating images, sync the batch to the Supabase database so it appears in the dashboard content engine:

```bash
cd "c:/Claude Code/OphidianAI" && node .claude/skills/social-content/scripts/sync-to-supabase.js "marketing/social-media/batches/YYYY-MM-DD-batch.json"
```

Replace `YYYY-MM-DD` with the actual batch date. This creates or updates the batch and all posts in the `content_batches` and `content_posts` tables. If the batch already exists (same label), it updates in place.

If the sync fails, note the error but don't block the workflow -- the batch JSON on disk is the source of truth.

### 8. Set Status

Batch starts as `draft`. After images are generated, the image router updates it to `review`.

## Format-Specific Rules

**Carousel posts (IG, FB):**
- Provide slide-by-slide copy (3-5 slides)
- Slide 1 is always the hook -- a bold statement or question
- Final slide is a soft CTA
- Each slide should stand alone if someone stops scrolling

**Reel / TikTok scripts:**
- Structure: Hook (first 2 seconds) > Body (15-45 seconds) > CTA
- Write the hook as a spoken line, not a caption
- Keep total script under 60 seconds
- Note whether it needs on-camera (anchor) or can be voiceover + B-roll

**Text posts (FB, LinkedIn):**
- FB: 50-150 words. Lead with the most interesting line. Short paragraphs.
- LinkedIn: 100-300 words. Lead with insight, not promotion. Professional tone.

**Stories (IG, FB):**
- 1-3 frames
- Brief copy per frame (under 20 words)
- Include interaction element where possible (poll, question box, slider)

## Content Rules

### Carried Over

1. **No emojis.** None in post copy, hashtags, or visual direction.
2. **Professional but approachable tone.** Informative, not salesy. "Knowledgeable neighbor" voice.
3. **No jargon.** Never use: SEO, conversion rate, responsive design, CTA, UX, UI, bounce rate, optimization, analytics, ROI. Use outcome language:
   - "SEO" -> "showing up when people search for you"
   - "responsive design" -> "looks great on any phone or computer"
   - "conversion rate" -> "turning visitors into customers"
4. **No hard selling.** Posts demonstrate expertise through value. Soft CTAs only.
5. **Self-contained value.** Every post teaches, shows, or sparks something on its own. No multi-part series.
6. **Hashtag rules.** 5-8 per post, at least 2 local (#ColumbusIndiana, #SouthernIndiana, #ColumbusIN, #SmallTownBusiness). Never exceed 8 total.
7. **Industry rotation.** When no specific focus given, rotate through: auto services, health/wellness, restaurants, retail, professional services, general local service.
8. **Anchor content integration.** If Eric provides video descriptions, reference or repurpose them. Do not generate anchor content.

### New

1. **LinkedIn tone shift.** Professional-first. Lead with insight, not promotion. No hashtags in body text -- 3-5 at end only.
2. **TikTok adaptation.** Hook in first 2 seconds. Script under 60 seconds. Note if voiceover or on-camera needed.
3. **One engagement post per batch.** Must include a direct question, poll, or callout that invites a response. Flag in batch summary.
4. **Before/after prerequisites.** Requires old site URL + new live site URL. Skip Proof of Work pillar if no completed projects exist; backfill when portfolio grows.
5. **AI Education simplicity.** Use outcome language, not tech language. "Your website answers customer questions at 2 AM" not "AI-powered chatbot integration." Excalidraw diagrams: 3-5 steps max.
6. **CTA rotation.** Never repeat same CTA within one batch.

## Post Template Library

Recurring formats to draw from:

| # | Template | Pillar | Image Source |
| --- | --- | --- | --- |
| 1 | "X reasons your website is losing you customers" | Website Tips | Nano Banana or Pexels |
| 2 | "How [AI tool] can save your [industry] business X hours/week" | AI Education | Excalidraw diagram |
| 3 | "What we found when we audited [type of] businesses in Columbus" | Local Relevance | Pexels or Nano Banana |
| 4 | Before/after transformation reveal | Proof of Work | Playwright compositor |
| 5 | "Here's what we built this week" | Behind the Scenes | Project screenshots or Pexels |
| 6 | "Did you know?" local business stat | Local Relevance | Pexels or Nano Banana |
| 7 | Quick tip with visual | Website Tips or AI Education | Nano Banana or Excalidraw |

## Reference

- Design spec: `docs/superpowers/specs/2026-03-16-social-content-engine-design.md`
- Image router: `.claude/skills/social-image-gen/SKILL.md`
- Brand voice: `CLAUDE.md` (Communication Style section)
- OphidianAI context: AI agency in Columbus, Indiana. Builds websites, handles online presence, and builds AI tools for small businesses. Founded by Eric Lefler, solo operator.
