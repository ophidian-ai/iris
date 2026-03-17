---
name: social-image-gen
description: Generate images for social media post batches. Routes each post to the correct image source (Playwright screenshots, Excalidraw diagrams, Nano Banana 2 AI generation, Pexels stock photos) and resizes for all platforms. Use when the orchestrator needs images generated, or when Eric says "generate images for the batch", "regen image for post 3", etc.
---

# Social Image Generator

Generate images for social media content batches by routing each post to the correct image source and producing platform-sized variants.

## When to Use

- Called automatically by the `social-content` orchestrator after generating a batch
- Called by `/social-regen` to regenerate a specific post's image
- Called manually when Eric says "generate images", "create the visuals", etc.

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| Batch date | Yes | The batch date (YYYY-MM-DD) to find the batch JSON |
| Post number | No | If regenerating a single post, the post number (1-7) |
| New prompt | No | Override the `imagePrompt` for regeneration |

## Process

### 1. Load Batch JSON

Read `marketing/social-media/batches/YYYY-MM-DD-batch.json`. Verify status is `draft` (or `review` if regenerating a single post).

### 2. Create Image Output Directory

```bash
mkdir -p marketing/social-media/images/YYYY-MM-DD/
```

### 3. Route Each Post to Image Source

For each post (or the single post being regenerated), read `imageSource` and `imagePrompt`:

| imageSource | Script | Input | Output |
| --- | --- | --- | --- |
| `pexels` | `scripts/pexels-fetch.js` | Search query from `imagePrompt` | Stock photo PNG |
| `nanoBanana` | `scripts/nano-banana.js` | Text prompt from `imagePrompt` | AI-generated PNG |
| `playwright` | `scripts/compositor.js` | Two URLs from `imagePrompt` (separated by ` \| `) | Before/after composite PNG |
| `excalidraw` | `scripts/excalidraw-gen.js` | Workflow description from `imagePrompt` (steps separated by `->`) | Diagram PNG |

Run the appropriate script:

```bash
cd .claude/skills/social-image-gen/scripts

# Pexels
PEXELS_API_KEY=$PEXELS_API_KEY node pexels-fetch.js "<imagePrompt>" <master-output-path>

# Nano Banana
GEMINI_API_KEY=$GEMINI_API_KEY node nano-banana.js "<imagePrompt>" <master-output-path>

# Playwright compositor (imagePrompt format: "https://old-site.com | https://new-site.com")
node compositor.js "<oldUrl>" "<newUrl>" <master-output-path>

# Excalidraw (imagePrompt format: "Step 1 -> Step 2 -> Step 3")
node excalidraw-gen.js "<imagePrompt>" <master-output-path>
```

Master images are saved to `marketing/social-media/images/YYYY-MM-DD/post-NN-master.png`.

### 4. Resize for Platforms

For each master image, run the resize utility:

```bash
node .claude/skills/social-image-gen/scripts/resize.js
```

The resize utility is called programmatically. It reads the Instagram `contentType` from the batch JSON to determine the correct Instagram sizing:

- `carousel` or `text-post` -> 1080x1080 (square)
- `reel` or `story` -> 1080x1920 (vertical)

Output files per post:
- `post-NN-facebook.png` (1200x630)
- `post-NN-instagram.png` (1080x1080 or 1080x1920)
- `post-NN-linkedin.png` (1200x630)
- `post-NN-tiktok.png` (1080x1920)

### 5. Handle Carousel Slides

For Instagram carousel posts (`contentType: "carousel"`):

1. Read the `slides` array from the Instagram platform variant
2. For each slide, composite the slide `text` onto the base image using Sharp's SVG text overlay
3. Save each slide as `post-NN-instagram-slide-01.png`, `post-NN-instagram-slide-02.png`, etc.
4. Update each slide's `imagePath` in the batch JSON

### 6. Update Batch JSON

For each post, update the `imagePath` field inside each platform variant:

```json
{
  "facebook": { "imagePath": "marketing/social-media/images/2026-03-17/post-01-facebook.png" },
  "instagram": { "imagePath": "marketing/social-media/images/2026-03-17/post-01-instagram.png" },
  "linkedin": { "imagePath": "marketing/social-media/images/2026-03-17/post-01-linkedin.png" },
  "tiktok": { "imagePath": "marketing/social-media/images/2026-03-17/post-01-tiktok.png" }
}
```

### 7. Update Batch Status

If processing the full batch (not a single regen): update batch status from `draft` to `review`.

## Single Post Regeneration

When called with a specific post number:

1. Only process that one post
2. Accept an optional new `imagePrompt` or `imageSource` override
3. Delete the old images for that post
4. Generate new master + platform variants
5. Update the batch JSON for that post only
6. Do NOT change batch status (stays at `review`)

## Scripts

All scripts live at `.claude/skills/social-image-gen/scripts/`:

- `resize.js` -- Platform-specific image resizing (Sharp)
- `pexels-fetch.js` -- Pexels stock photo search and download
- `nano-banana.js` -- Nano Banana 2 AI image generation (Gemini API)
- `compositor.js` -- Playwright before/after screenshot compositor
- `excalidraw-gen.js` -- Workflow diagram generator (Sharp + SVG)

## Reference

- Design spec: `docs/superpowers/specs/2026-03-16-social-content-engine-design.md`
- Resize utility test: `.claude/skills/social-image-gen/scripts/resize.test.js`
