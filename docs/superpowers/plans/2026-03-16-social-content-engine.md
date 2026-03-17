# Social Content Engine Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modular social media content engine that generates bi-weekly batches of 7 posts across FB, IG, LinkedIn, and TikTok with AI-generated images, human review gate, and automated scheduling via direct platform APIs.

**Architecture:** Three independent skills (orchestrator, image router, scheduler) connected by a shared batch JSON contract. Image generation is handled by 4 pluggable source scripts (Playwright compositor, Excalidraw generator, Nano Banana 2, Pexels). Review workflow is a set of slash commands that gate the pipeline between generation and scheduling.

**Tech Stack:** Node.js, Sharp (image processing), Playwright (screenshots + diagram rendering), Gemini API (Nano Banana 2), Pexels API, Meta Graph API v21, LinkedIn Marketing API, TikTok Content Posting API, dotenv (env loading).

**Deferred to v2:** Analytics/performance tracking, bi-weekly cron automation (v1 uses manual `/social-content` trigger), client reuse path updates to `client-social-content` skill.

**Spec:** `docs/superpowers/specs/2026-03-16-social-content-engine-design.md`

---

## Chunk 1: Foundation & Image Utilities

Sets up the directory structure, installs dependencies, and builds the shared `resize.js` utility that all image source scripts depend on.

### Task 1: Directory Structure & Dependencies

**Files:**

- Create: `marketing/social-media/batches/.gitkeep`
- Create: `marketing/social-media/images/.gitkeep`
- Create: `marketing/social-media/scheduled/.gitkeep`
- Create: `.claude/skills/social-image-gen/scripts/package.json`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p marketing/social-media/batches
mkdir -p marketing/social-media/images
mkdir -p marketing/social-media/scheduled
mkdir -p .claude/skills/social-image-gen/scripts
mkdir -p .claude/skills/social-scheduler/scripts/auth
touch marketing/social-media/batches/.gitkeep
touch marketing/social-media/images/.gitkeep
touch marketing/social-media/scheduled/.gitkeep
```

- [ ] **Step 2: Initialize package.json for image scripts**

```bash
cd .claude/skills/social-image-gen/scripts
npm init -y
```

- [ ] **Step 3: Install Sharp**

```bash
cd .claude/skills/social-image-gen/scripts
npm install sharp
```

- [ ] **Step 4: Verify Sharp loads**

```bash
cd .claude/skills/social-image-gen/scripts
node -e "const sharp = require('sharp'); console.log('Sharp version:', sharp.versions.sharp);"
```

Expected: prints Sharp version number without errors.

- [ ] **Step 5: Commit**

```bash
git add marketing/social-media/ .claude/skills/social-image-gen/scripts/package.json .claude/skills/social-image-gen/scripts/package-lock.json
git commit -m "chore: scaffold social content engine directories and dependencies"
```

### Task 2: Resize Utility (resize.js)

**Files:**

- Create: `.claude/skills/social-image-gen/scripts/resize.js`
- Create: `.claude/skills/social-image-gen/scripts/resize.test.js`

- [ ] **Step 1: Write the test file**

Create `.claude/skills/social-image-gen/scripts/resize.test.js`:

```javascript
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { resizeForPlatforms } = require('./resize');

const TEST_DIR = path.join(__dirname, '__test_output__');
const TEST_IMAGE = path.join(TEST_DIR, 'test-master.png');

async function setup() {
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
  // Create a 2400x1600 solid color test image
  await sharp({ create: { width: 2400, height: 1600, channels: 3, background: { r: 57, g: 255, b: 20 } } })
    .png()
    .toFile(TEST_IMAGE);
}

async function cleanup() {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
}

async function test_produces_all_platform_variants() {
  const results = await resizeForPlatforms(TEST_IMAGE, TEST_DIR, 'test-01');

  // Should produce 4 files
  const expected = ['test-01-facebook.png', 'test-01-instagram.png', 'test-01-linkedin.png', 'test-01-tiktok.png'];
  for (const file of expected) {
    const filePath = path.join(TEST_DIR, file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing: ${file}`);
  }

  // Check Facebook dimensions (1200x630)
  const fbMeta = await sharp(path.join(TEST_DIR, 'test-01-facebook.png')).metadata();
  if (fbMeta.width !== 1200 || fbMeta.height !== 630) {
    throw new Error(`Facebook size wrong: ${fbMeta.width}x${fbMeta.height}, expected 1200x630`);
  }

  // Check Instagram dimensions (1080x1080)
  const igMeta = await sharp(path.join(TEST_DIR, 'test-01-instagram.png')).metadata();
  if (igMeta.width !== 1080 || igMeta.height !== 1080) {
    throw new Error(`Instagram size wrong: ${igMeta.width}x${igMeta.height}, expected 1080x1080`);
  }

  // Check LinkedIn dimensions (1200x630)
  const liMeta = await sharp(path.join(TEST_DIR, 'test-01-linkedin.png')).metadata();
  if (liMeta.width !== 1200 || liMeta.height !== 630) {
    throw new Error(`LinkedIn size wrong: ${liMeta.width}x${liMeta.height}, expected 1200x630`);
  }

  // Check TikTok dimensions (1080x1920)
  const ttMeta = await sharp(path.join(TEST_DIR, 'test-01-tiktok.png')).metadata();
  if (ttMeta.width !== 1080 || ttMeta.height !== 1920) {
    throw new Error(`TikTok size wrong: ${ttMeta.width}x${ttMeta.height}, expected 1080x1920`);
  }

  // Check return value has paths
  if (!results.facebook || !results.instagram || !results.linkedin || !results.tiktok) {
    throw new Error('Missing platform paths in return value');
  }

  console.log('PASS: test_produces_all_platform_variants');
}

async function test_returns_relative_paths() {
  const results = await resizeForPlatforms(TEST_IMAGE, TEST_DIR, 'test-01');

  for (const [platform, filePath] of Object.entries(results)) {
    if (!filePath.endsWith('.png')) throw new Error(`${platform} path should end with .png: ${filePath}`);
    if (!fs.existsSync(filePath)) throw new Error(`${platform} file does not exist: ${filePath}`);
  }

  console.log('PASS: test_returns_relative_paths');
}

(async () => {
  try {
    await setup();
    await test_produces_all_platform_variants();
    await test_returns_relative_paths();
    console.log('\nAll resize tests passed.');
  } catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
  } finally {
    await cleanup();
  }
})();
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd .claude/skills/social-image-gen/scripts
node resize.test.js
```

Expected: FAIL with "Cannot find module './resize'"

- [ ] **Step 3: Write resize.js**

Create `.claude/skills/social-image-gen/scripts/resize.js`:

```javascript
const sharp = require('sharp');
const path = require('path');

const PLATFORM_SPECS = {
  facebook:  { width: 1200, height: 630, fit: 'cover' },
  instagram: { width: 1080, height: 1080, fit: 'cover' },        // Feed (square)
  instagram_portrait: { width: 1080, height: 1350, fit: 'cover' }, // Feed (portrait)
  instagram_reel: { width: 1080, height: 1920, fit: 'cover' },    // Reel/Story
  linkedin:  { width: 1200, height: 630, fit: 'cover' },
  tiktok:    { width: 1080, height: 1920, fit: 'cover' },
};

// Map contentType to the correct Instagram spec key
const IG_CONTENT_TYPE_MAP = {
  'carousel': 'instagram',          // square for carousels
  'text-post': 'instagram',         // square for feed posts
  'reel': 'instagram_reel',         // vertical for reels
  'story': 'instagram_reel',        // vertical for stories
};

/**
 * Resize a master image into platform-specific variants.
 * @param {string} masterPath - Path to the master image file
 * @param {string} outputDir - Directory to save resized images
 * @param {string} prefix - Filename prefix (e.g., 'post-01')
 * @param {string} igContentType - Instagram content type ('carousel', 'text-post', 'reel', 'story')
 * @returns {Object} Map of platform -> absolute file path
 */
async function resizeForPlatforms(masterPath, outputDir, prefix, igContentType = 'text-post') {
  const results = {};
  const igSpecKey = IG_CONTENT_TYPE_MAP[igContentType] || 'instagram';

  const platformsToGenerate = {
    facebook: PLATFORM_SPECS.facebook,
    instagram: PLATFORM_SPECS[igSpecKey],
    linkedin: PLATFORM_SPECS.linkedin,
    tiktok: PLATFORM_SPECS.tiktok,
  };

  for (const [platform, spec] of Object.entries(platformsToGenerate)) {
    const outputPath = path.join(outputDir, `${prefix}-${platform}.png`);

    await sharp(masterPath)
      .resize(spec.width, spec.height, { fit: spec.fit, position: 'centre' })
      .png()
      .toFile(outputPath);

    results[platform] = outputPath;
  }

  return results;
}

module.exports = { resizeForPlatforms, PLATFORM_SPECS, IG_CONTENT_TYPE_MAP };
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd .claude/skills/social-image-gen/scripts
node resize.test.js
```

Expected: "All resize tests passed."

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/social-image-gen/scripts/resize.js .claude/skills/social-image-gen/scripts/resize.test.js
git commit -m "feat: add platform image resize utility with tests"
```

---

## Chunk 2: Image Source Scripts

Four independent scripts that each take an input and produce a master image. These can be built in parallel.

### Task 3: Pexels Fetcher (pexels-fetch.js)

**Files:**

- Create: `.claude/skills/social-image-gen/scripts/pexels-fetch.js`
- Reference: `C:\Users\Eric\.claude\projects\c--Claude-Code-OphidianAI\memory\pexels_api.md` for API key

- [ ] **Step 1: Read the existing Pexels API memory note**

Read `pexels_api.md` from memory to get the API key pattern and usage conventions.

- [ ] **Step 2: Write pexels-fetch.js**

Create `.claude/skills/social-image-gen/scripts/pexels-fetch.js`:

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

/**
 * Search Pexels and download the best matching photo.
 * @param {string} query - Search query (from imagePrompt)
 * @param {string} outputPath - Where to save the downloaded image
 * @returns {string} The output path
 */
async function fetchPexelsPhoto(query, outputPath) {
  if (!PEXELS_API_KEY) throw new Error('PEXELS_API_KEY not set in environment');

  const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

  const data = await httpGet(searchUrl, { Authorization: PEXELS_API_KEY });
  const json = JSON.parse(data);

  if (!json.photos || json.photos.length === 0) {
    throw new Error(`No Pexels results for query: "${query}"`);
  }

  const photoUrl = json.photos[0].src.original;
  await downloadFile(photoUrl, outputPath);

  return outputPath;
}

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : require('http');
    const req = mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} downloading ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    });
    req.on('error', reject);
  });
}

// CLI usage: node pexels-fetch.js "search query" output.png
if (require.main === module) {
  const [,, query, outputPath] = process.argv;
  if (!query || !outputPath) {
    console.error('Usage: node pexels-fetch.js "search query" output.png');
    process.exit(1);
  }
  fetchPexelsPhoto(query, outputPath)
    .then((p) => console.log(`Downloaded to: ${p}`))
    .catch((e) => { console.error(e.message); process.exit(1); });
}

module.exports = { fetchPexelsPhoto };
```

- [ ] **Step 3: Manual smoke test**

```bash
cd .claude/skills/social-image-gen/scripts
node pexels-fetch.js "small business owner laptop" __test_pexels.png
```

Expected: Downloads an image. Verify `__test_pexels.png` exists and is a valid image.

- [ ] **Step 4: Clean up test file and commit**

```bash
rm -f .claude/skills/social-image-gen/scripts/__test_pexels.png
git add .claude/skills/social-image-gen/scripts/pexels-fetch.js
git commit -m "feat: add Pexels stock photo fetcher script"
```

### Task 4: Nano Banana 2 Caller (nano-banana.js)

**Files:**

- Create: `.claude/skills/social-image-gen/scripts/nano-banana.js`
- Reference: `C:\Users\Eric\.claude\projects\c--Claude-Code-OphidianAI\memory\gemini_api_key.md` for API key

- [ ] **Step 1: Read the Gemini API memory note**

Read `gemini_api_key.md` from memory to get the API key and understand the Nano Banana 2 pipeline.

- [ ] **Step 2: Research Gemini image generation API**

Check current Gemini API docs for the image generation endpoint. The scroll-scrub hero skill (`exploding-scroll-hero`) already uses this pipeline -- read `.claude/skills/exploding-scroll-hero/SKILL.md` for the existing pattern.

- [ ] **Step 3: Write nano-banana.js**

Create `.claude/skills/social-image-gen/scripts/nano-banana.js`. The script should:

1. Accept a text prompt and output path
2. Call the Gemini API image generation endpoint
3. Save the generated image to the output path
4. Return the output path

Follow the same API pattern used in the exploding-scroll-hero skill. Use the `gemini-2.0-flash-exp` model (or whatever the current image generation model is -- verify from the existing skill).

The script must be usable both as a CLI tool (`node nano-banana.js "prompt" output.png`) and as a module (`const { generateImage } = require('./nano-banana')`).

- [ ] **Step 4: Manual smoke test**

```bash
cd .claude/skills/social-image-gen/scripts
node nano-banana.js "Professional small business storefront with modern signage, warm lighting, photorealistic" __test_nb.png
```

Expected: Generates an image. Verify `__test_nb.png` exists and is a valid image.

- [ ] **Step 5: Clean up test file and commit**

```bash
rm -f .claude/skills/social-image-gen/scripts/__test_nb.png
git add .claude/skills/social-image-gen/scripts/nano-banana.js
git commit -m "feat: add Nano Banana 2 image generation script"
```

### Task 5: Playwright Before/After Compositor (compositor.js)

**Files:**

- Create: `.claude/skills/social-image-gen/scripts/compositor.js`

- [ ] **Step 1: Write compositor.js**

Create `.claude/skills/social-image-gen/scripts/compositor.js`. The script should:

1. Accept old site URL + new site URL + output path
2. Launch Playwright, navigate to old URL, screenshot at 1280x800 viewport
3. Navigate to new URL, screenshot at same viewport
4. Use Sharp to composite into side-by-side graphic:
   - Left half: old site screenshot with "BEFORE" label (red `#ff4444` accent bar at top)
   - Right half: new site screenshot with "AFTER" label (green `#39ff14` accent bar at top)
   - OphidianAI logo watermark in bottom-right corner (check `shared/ophidianai-brand-assets/` for logo file; fall back to text "OphidianAI" rendered via Sharp if no logo asset exists)
   - 2px gap between the two halves
   - Clean 4px border around the entire composite
   - Subtle drop shadow (8px blur, 50% opacity black)
   - Output master image at 2400x1260 (will be resized by resize.js)
5. Return the output path

Use `@playwright/test` (already installed globally) for the browser. Use Sharp for the compositing.

CLI: `node compositor.js "https://old-site.com" "https://new-site.com" output.png`
Module: `const { compositeBeforeAfter } = require('./compositor')`

- [ ] **Step 2: Manual smoke test with two real URLs**

```bash
cd .claude/skills/social-image-gen/scripts
node compositor.js "https://example.com" "https://ophidianai.com" __test_composite.png
```

Expected: Produces a side-by-side image with BEFORE/AFTER labels.

- [ ] **Step 3: Clean up test file and commit**

```bash
rm -f .claude/skills/social-image-gen/scripts/__test_composite.png
git add .claude/skills/social-image-gen/scripts/compositor.js
git commit -m "feat: add Playwright before/after screenshot compositor"
```

### Task 6: Excalidraw Diagram Generator (excalidraw-gen.js)

**Files:**

- Create: `.claude/skills/social-image-gen/scripts/excalidraw-gen.js`

Generates workflow diagrams using Sharp directly (no Excalidraw React dependency needed -- avoids heavy npm installs for `@excalidraw/excalidraw`, `react`, `react-dom`).

- [ ] **Step 1: Write excalidraw-gen.js**

Create `.claude/skills/social-image-gen/scripts/excalidraw-gen.js`. The script should:

1. Accept a workflow description string (e.g., "Customer visits site -> Chatbot greets -> Answers FAQ -> Escalates if needed") and output path
2. Parse the description into steps (split on "->", trim whitespace)
3. Generate the diagram using Sharp + SVG overlay:
   - Create an SVG string with rounded rectangles for each step node
   - Connect nodes with arrow lines
   - Use OphidianAI brand colors: `#39ff14` stroke, `#1a1a2e` background, white text
   - Layout: horizontal for 3 or fewer steps, vertical for 4+ steps
   - Clean spacing (200px between nodes, 60px node height, 280px node width)
4. Render the SVG to PNG via Sharp's `composite` with SVG overlay on a `#1a1a2e` background
5. Output master image at 2400x1260 (resized by resize.js downstream)
6. Save as PNG to the output path

CLI: `node excalidraw-gen.js "Step 1 -> Step 2 -> Step 3" output.png`
Module: `const { generateDiagram } = require('./excalidraw-gen')`

- [ ] **Step 3: Manual smoke test**

```bash
cd .claude/skills/social-image-gen/scripts
node excalidraw-gen.js "Customer visits website -> AI chatbot greets them -> Answers common questions -> Escalates to owner if needed" __test_diagram.png
```

Expected: Produces a flowchart diagram PNG with 4 connected nodes.

- [ ] **Step 4: Clean up test file and commit**

```bash
rm -f .claude/skills/social-image-gen/scripts/__test_diagram.png
git add .claude/skills/social-image-gen/scripts/excalidraw-gen.js
git commit -m "feat: add Excalidraw workflow diagram generator"
```

---

## Chunk 3: Image Router Skill

The skill file that orchestrates image generation by routing each post to the correct source script and running the resize pipeline.

### Task 7: Image Router SKILL.md

**Files:**

- Create: `.claude/skills/social-image-gen/SKILL.md`

- [ ] **Step 1: Write the image router skill**

Create `.claude/skills/social-image-gen/SKILL.md` with:

- `name: social-image-gen`
- `description:` targeting invocation when the orchestrator needs images generated, or when Eric says "generate images for the batch", "regen image for post 3", etc.
- Process:
  1. Read the batch JSON from `marketing/social-media/batches/YYYY-MM-DD-batch.json`
  2. Create the image output directory `marketing/social-media/images/YYYY-MM-DD/`
  3. For each post, read `imageSource` and `imagePrompt`
  4. Route to the correct script:
     - `pexels` -> `node scripts/pexels-fetch.js "<imagePrompt>" <master-output-path>`
     - `nanoBanana` -> `node scripts/nano-banana.js "<imagePrompt>" <master-output-path>`
     - `playwright` -> `node scripts/compositor.js "<oldUrl>" "<newUrl>" <master-output-path>` (imagePrompt contains both URLs separated by ` | `)
     - `excalidraw` -> `node scripts/excalidraw-gen.js "<imagePrompt>" <master-output-path>`
  5. Run `resize.js` on the master image to produce platform variants
  6. For carousel posts (Instagram `contentType: "carousel"`):
     - Read the `slides` array from the Instagram platform variant
     - For each slide, composite the slide `text` onto the base image using Sharp's `composite` with SVG text overlay
     - Save each slide as `post-NN-instagram-slide-NN.png` (per spec naming convention)
     - Update each slide's `imagePath` in the batch JSON
  7. Update the batch JSON with `imagePath` fields per platform
  8. Update batch status from `draft` to `review`
- Single-post regeneration: accept a post number and regenerate only that post's images
- All scripts are at `.claude/skills/social-image-gen/scripts/`

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/social-image-gen/SKILL.md
git commit -m "feat: add social-image-gen skill (image router)"
```

---

## Chunk 4: Orchestrator Skill

Overhaul the existing `social-content` SKILL.md.

### Task 8: Overhaul social-content SKILL.md

**Files:**

- Modify: `.claude/skills/social-content/SKILL.md` (full rewrite)

- [ ] **Step 1: Write the overhauled SKILL.md**

Git tracks the previous version, so no backup needed.

Rewrite `.claude/skills/social-content/SKILL.md` with the full spec from the design doc. Key sections:

- **When to Use:** Bi-weekly content generation. Triggered by `/social-content` or cron.
- **Inputs:** Date range (optional, defaults to next 2 weeks), recent wins/projects, industry focus, anchor content.
- **Process:**
  1. Determine date range (next 14 days from the upcoming Monday)
  2. Check for batch conflicts (see spec: Batch Conflict Handling)
  3. Select 7 posts across the 6 pillars, ensuring rotation and variety
  4. For each post, generate:
     - Core message
     - 4 platform variants (FB, IG, LinkedIn, TikTok) with adapted copy, hashtags, content type, scheduled time
     - Image source assignment (`imageSource`) and prompt (`imagePrompt`)
     - Alt text for accessibility
  5. Select one post as the engagement post (flag in summary)
  6. Rotate CTA across posts (never repeat within batch)
  7. Write batch JSON to `marketing/social-media/batches/YYYY-MM-DD-batch.json`
  8. Write batch markdown to `marketing/social-media/batches/YYYY-MM-DD-batch.md`
  9. Set batch status to `draft`
  10. Invoke `social-image-gen` skill to generate all images
- **Output:** Batch JSON + markdown + images (via image router)
- **Rules:** All 14 content rules from the spec (8 carried over + 6 new)
- **Post Template Library:** All 7 templates from the spec
- **Platform Adaptation Rules:** Full table from the spec
- **Reference:** Link to design spec

Include the full batch JSON schema from the spec as an example in the skill file.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/social-content/SKILL.md
git commit -m "feat: overhaul social-content skill for bi-weekly pipeline"
```

---

## Chunk 5: Platform Scheduler

Auth handlers and platform-specific posting scripts, plus the scheduler skill.

**Blocker note:** Meta Business Verification is pending. FB and IG scripts should be built and tested against the Meta Graph API sandbox/test pages. Once verification is approved, switch to production endpoints. LinkedIn and TikTok are not blocked.

### Task 9: Auth Token Utilities

**Files:**

- Create: `.claude/skills/social-scheduler/scripts/auth/meta-auth.js`
- Create: `.claude/skills/social-scheduler/scripts/auth/linkedin-auth.js`
- Create: `.claude/skills/social-scheduler/scripts/auth/tiktok-auth.js`
- Create: `.claude/skills/social-scheduler/scripts/auth/meta-setup.js`
- Create: `.claude/skills/social-scheduler/scripts/auth/linkedin-setup.js`
- Create: `.claude/skills/social-scheduler/scripts/auth/tiktok-setup.js`
- Create: `.claude/skills/social-scheduler/scripts/package.json`

- [ ] **Step 1: Verify .env is gitignored and create .env.example**

Check that `.env` is in `.gitignore`. If not, add it. Then create `.env.example` with all required token placeholders:

```bash
# Social Content Engine - Platform API Tokens
META_PAGE_ACCESS_TOKEN=
META_PAGE_ID=
META_IG_USER_ID=
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_REFRESH_TOKEN=
LINKEDIN_TOKEN_EXPIRES=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TIKTOK_ACCESS_TOKEN=
TIKTOK_REFRESH_TOKEN=
TIKTOK_TOKEN_EXPIRES=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
PEXELS_API_KEY=
GEMINI_API_KEY=
```

- [ ] **Step 2: Initialize package.json and install dotenv**

```bash
cd .claude/skills/social-scheduler/scripts
npm init -y
npm install dotenv
```

- [ ] **Step 3: Write meta-auth.js**

Token handler for Meta (FB + IG). Load `.env` via `require('dotenv').config()` at the top. Reads `META_PAGE_ACCESS_TOKEN` from `process.env`. Since we use a System User long-lived token, this is a simple read + validate. Exports `getMetaToken()` that returns the token or throws if not set.

Include a `checkMetaToken()` function that makes a test API call (`GET /me?access_token=...`) and returns `{ valid: true/false, error: string }`.

- [ ] **Step 4: Write linkedin-auth.js**

Token handler for LinkedIn. Load `.env` via `require('dotenv').config()`. Reads `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_REFRESH_TOKEN` from `process.env`. Exports `getLinkedInToken()` that:

1. Checks if access token is expired (stored as `LINKEDIN_TOKEN_EXPIRES` timestamp)
2. If expired, refreshes using the refresh token via LinkedIn's OAuth2 token endpoint
3. Writes new access token + expiry back to `.env`
4. Returns the valid access token

Include `checkLinkedInToken()` health check that calls the LinkedIn profile endpoint.

- [ ] **Step 5: Write tiktok-auth.js**

Token handler for TikTok. Same pattern as LinkedIn but with 24-hour access token expiry. Load `.env` via `require('dotenv').config()`. Reads `TIKTOK_ACCESS_TOKEN`, `TIKTOK_REFRESH_TOKEN`, `TIKTOK_TOKEN_EXPIRES` from `process.env`. Always refreshes on every run since tokens expire in 24h.

Include `checkTikTokToken()` health check.

- [ ] **Step 6: Write setup scripts**

Each setup script (`meta-setup.js`, `linkedin-setup.js`, `tiktok-setup.js`) should:

1. Print instructions for the OAuth flow
2. Start a local HTTP server on port 3456 to capture the OAuth callback
3. Open the browser to the platform's OAuth authorization URL (using `start` command on Windows)
4. Capture the authorization code from the callback
5. Exchange the code for access + refresh tokens
6. Write tokens to `.env`
7. Print success message

These are one-time setup scripts. Keep them simple.

- [ ] **Step 7: Commit**

```bash
git add .env.example .claude/skills/social-scheduler/scripts/
git commit -m "feat: add platform auth handlers and OAuth setup scripts"
```

### Task 10: Platform Posting Scripts

**Files:**

- Create: `.claude/skills/social-scheduler/scripts/facebook.js`
- Create: `.claude/skills/social-scheduler/scripts/instagram.js`
- Create: `.claude/skills/social-scheduler/scripts/linkedin.js`
- Create: `.claude/skills/social-scheduler/scripts/tiktok.js`

- [ ] **Step 1: Research Meta Graph API v21 publishing endpoints**

Read the current Meta Graph API documentation for:

- Photo publishing: `POST /{page-id}/photos` with `url` or `source` parameter
- Scheduled posts: `POST /{page-id}/feed` with `scheduled_publish_time` parameter
- Carousel publishing: Multiple photo uploads + `POST /{page-id}/feed` with `attached_media`
- Instagram Content Publishing: `POST /{ig-user-id}/media` -> `POST /{ig-user-id}/media_publish`

Use the context7 or firecrawl tools to get up-to-date API docs.

- [ ] **Step 2: Write facebook.js**

Create `.claude/skills/social-scheduler/scripts/facebook.js`. Exports `schedulePost(postData, imagePath)` that:

1. Gets token via `meta-auth.js`
2. Uploads image to Facebook (`POST /{page-id}/photos` with `published=false`)
3. Creates scheduled post (`POST /{page-id}/feed` with `message`, `attached_media`, `scheduled_publish_time`)
4. Returns `{ postId, status: 'scheduled' }`

Handle carousel posts: upload multiple images, attach all to one post.

CLI: `node facebook.js <batch-json-path> <post-number>`

- [ ] **Step 3: Write instagram.js**

Create `.claude/skills/social-scheduler/scripts/instagram.js`. Exports `schedulePost(postData, imagePath)` that:

1. Gets token via `meta-auth.js`
2. Creates media container (`POST /{ig-user-id}/media` with `image_url`, `caption`)
3. Publishes (`POST /{ig-user-id}/media_publish`)
4. For carousels: create individual media containers, then carousel container
5. Returns `{ postId, status: 'scheduled' }`

Note: Instagram API may not support scheduled publishing for all account types. If not available, publish immediately and document the limitation.

- [ ] **Step 4: Write linkedin.js**

Create `.claude/skills/social-scheduler/scripts/linkedin.js`. Exports `schedulePost(postData, imagePath)` that:

1. Gets token via `linkedin-auth.js`
2. Registers image upload (`POST /rest/images?action=initializeUpload`)
3. Uploads image binary to the provided upload URL
4. Creates post (`POST /rest/posts` with `commentary`, `content.media`, `distribution`, `lifecycleState: PUBLISHED`)
5. Returns `{ postId, status: 'scheduled' }`

Note: LinkedIn API does not natively support scheduled posts. Two options:

- Post immediately when the scheduler runs, OR
- The scheduler runs at the scheduled time (via cron per-post)

Document which approach is used. Recommend: post immediately at the batch-level scheduled time.

- [ ] **Step 5: Write tiktok.js**

Create `.claude/skills/social-scheduler/scripts/tiktok.js`. Exports `schedulePost(postData, imagePath)` that:

1. Gets token via `tiktok-auth.js`
2. Calls TikTok Content Posting API inbox endpoint (`POST /v2/post/publish/inbox/video/init/`) to push content to the TikTok app inbox
3. The API call sends the script text and thumbnail image to TikTok's servers, which delivers a notification to Eric's TikTok app
4. Eric opens the notification in TikTok, records/uploads the video using the provided script as guidance, and publishes manually
5. Returns `{ status: 'inbox' }` (since we start with inbox notification mode)

Note: This is a real API call to TikTok's servers, not just saving a local file. The script requires valid TikTok OAuth tokens.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/social-scheduler/scripts/facebook.js .claude/skills/social-scheduler/scripts/instagram.js .claude/skills/social-scheduler/scripts/linkedin.js .claude/skills/social-scheduler/scripts/tiktok.js
git commit -m "feat: add platform posting scripts (FB, IG, LinkedIn, TikTok)"
```

### Task 11: Scheduler SKILL.md

**Files:**

- Create: `.claude/skills/social-scheduler/SKILL.md`

- [ ] **Step 1: Write the scheduler skill**

Create `.claude/skills/social-scheduler/SKILL.md` with:

- `name: social-scheduler`
- `description:` targeting invocation when approved batches need scheduling, or when Eric says "schedule the batch", "push to social", etc.
- Process:
  1. Read the approved batch JSON (status must be `approved`)
  2. Run token health check on all platforms -- abort if any are invalid
  3. For each post, for each platform:
     - Read the platform-sized image from the batch JSON `imagePath`
     - Call the platform script to upload + schedule
     - Record the platform post ID
  4. Write deployment manifest to `marketing/social-media/scheduled/YYYY-MM-DD-manifest.json`
  5. Update batch status to `scheduled`
  6. Output summary table: post # | platform | status | scheduled time
- Error handling: per-platform failure, retry command
- Token health check details
- Reference to auth setup scripts for initial configuration

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/social-scheduler/SKILL.md
git commit -m "feat: add social-scheduler skill"
```

---

## Chunk 6: Review Workflow & Integration

Slash commands for the review gate, plus morning coffee integration.

### Task 12: Review Workflow Skills

**Files:**

- Create: `.claude/skills/social-approve/SKILL.md`
- Create: `.claude/skills/social-edit/SKILL.md`
- Create: `.claude/skills/social-regen/SKILL.md`
- Create: `.claude/skills/social-check/SKILL.md`
- Create: `.claude/skills/social-retry/SKILL.md`

- [ ] **Step 1: Write social-approve skill**

Create `.claude/skills/social-approve/SKILL.md`:

- Triggered by `/social-approve`
- Reads the most recent batch JSON in `review` status
- Updates status to `approved`
- Invokes the `social-scheduler` skill to push to platform APIs

- [ ] **Step 2: Write social-edit skill**

Create `.claude/skills/social-edit/SKILL.md`:

- Triggered by `/social-edit <post-number>`
- Reads the batch JSON, extracts the specified post
- Presents the current copy for all platforms
- Accepts new copy or editing instructions from Eric
- Regenerates that post's platform variants
- Updates the batch JSON and markdown
- Does NOT regenerate images (use `/social-regen` for that)

- [ ] **Step 3: Write social-regen skill**

Create `.claude/skills/social-regen/SKILL.md`:

- Triggered by `/social-regen <post-number> [image|copy|all]`
- Defaults to `image` if not specified
- For `image`: re-runs the image pipeline for that post only (new prompt or different source)
- For `copy`: regenerates the copy for that post
- For `all`: regenerates both copy and image
- Updates the batch JSON and saves new images

- [ ] **Step 4: Write social-check skill**

Create `.claude/skills/social-check/SKILL.md`:

- Triggered by `/social-check`
- Reads the most recent deployment manifest in `scheduled` status
- For each post, queries each platform API for post status
- Updates manifest with `published` status and live post URLs
- Reports any failures
- Updates batch status to `published` if all posts confirmed

- [ ] **Step 5: Write social-retry skill**

Create `.claude/skills/social-retry/SKILL.md`:

- Triggered by `/social-retry <post-number> <platform>`
- Reads the deployment manifest
- Retries the failed post on the specified platform
- Updates the manifest with new status

- [ ] **Step 6: Commit all review workflow skills**

```bash
git add .claude/skills/social-approve/ .claude/skills/social-edit/ .claude/skills/social-regen/ .claude/skills/social-check/ .claude/skills/social-retry/
git commit -m "feat: add review workflow skills (approve, edit, regen, check, retry)"
```

### Task 13: Update Content Agent

**Files:**

- Modify: `.claude/agents/marketing/content/AGENT.md`

- [ ] **Step 1: Update the Content Agent**

Add the new skills to the agent's Skills Access section:

- `social-image-gen` (`.claude/skills/social-image-gen/`)
- `social-scheduler` (`.claude/skills/social-scheduler/`)
- `social-approve` (`.claude/skills/social-approve/`)
- `social-edit` (`.claude/skills/social-edit/`)
- `social-regen` (`.claude/skills/social-regen/`)
- `social-check` (`.claude/skills/social-check/`)
- `social-retry` (`.claude/skills/social-retry/`)

Update the Platform-Specific Notes to add LinkedIn (already partially there but needs the scheduling details).

Update the Content Pillars section to reflect the 6 pillars (was 4).

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/marketing/content/AGENT.md
git commit -m "feat: update Content Agent with new social content engine skills"
```

### Task 14: Morning Coffee Integration

**Files:**

- Modify: `.claude/skills/morning-coffee/SKILL.md`

- [ ] **Step 1: Read the current morning coffee skill**

Read `.claude/skills/morning-coffee/SKILL.md` to understand how to add a new section.

- [ ] **Step 2: Add social media batch status section**

Add a "Social Media" section to the morning coffee briefing that:

1. Checks `marketing/social-media/batches/` for the most recent batch JSON
2. Reports batch status (draft, review, approved, scheduled, published)
3. If status is `review`: "7 posts ready for approval -- run `/social-approve` when ready"
4. If status is `scheduled`: runs `/social-check` to verify published posts, reports how many remain
5. If no batch exists or last batch is `published`: "Next batch due [date] -- run `/social-content` to generate"

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/morning-coffee/SKILL.md
git commit -m "feat: add social media batch status to morning coffee briefing"
```

### Task 15: Update CLAUDE.md Skills List

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 1: Add new skills to the CLAUDE.md skills section**

Under the `## Skills` section, add entries for:

- `social-image-gen` -- Image generation router for social media posts
- `social-scheduler` -- Schedule posts to FB, IG, LinkedIn, TikTok via platform APIs
- `social-approve` -- Approve a reviewed social media batch for scheduling
- `social-edit` -- Edit copy for a specific post in a batch
- `social-regen` -- Regenerate image or copy for a specific post
- `social-check` -- Verify scheduled posts have published
- `social-retry` -- Retry a failed post on a specific platform

Update the `social-content` description to reflect the overhaul (bi-weekly batches, 4 platforms, image generation pipeline).

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with social content engine skills"
```

---

## Chunk 7: End-to-End Smoke Test

### Task 16: Full Pipeline Test

- [ ] **Step 1: Generate a test batch**

Run `/social-content` for the week of 2026-03-17. Verify:

- Batch JSON created at `marketing/social-media/batches/2026-03-17-batch.json`
- Batch markdown created at `marketing/social-media/batches/2026-03-17-batch.md`
- 7 posts with all 4 platform variants each
- Image source assigned per post
- Batch status is `draft`

- [ ] **Step 2: Generate images**

Verify the image router runs and produces:

- Master images for each post
- Platform-resized variants in `marketing/social-media/images/2026-03-17/`
- Batch JSON updated with `imagePath` fields
- Batch status updated to `review`

- [ ] **Step 3: Review the batch**

Open the batch markdown and images. Check:

- Copy quality and platform adaptation
- Image quality and relevance
- Hashtags (5-8 per post, at least 2 local)
- No emojis, no jargon
- One engagement post flagged
- CTA rotation (no repeats)

- [ ] **Step 4: Test edit and regen**

Run `/social-edit 1` to edit post 1's copy. Verify only post 1 changes.
Run `/social-regen 2 image` to regenerate post 2's image. Verify only post 2's image changes.

- [ ] **Step 5: Approve (dry run)**

Run `/social-approve`. Since platform OAuth is not set up yet, this will fail at the scheduler step. Verify:

- Batch status changes to `approved`
- Scheduler attempts to run and reports token errors (expected)
- No data corruption

- [ ] **Step 6: Document any issues**

Create a note in `iris/saved-conversations/` with the test results and any issues found.
