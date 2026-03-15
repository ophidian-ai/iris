---
name: exploding-scroll-hero
description: Generate scroll-scrub hero frame sequences using a 3-prompt AI pipeline (Gemini + Nano Banana 2 + Google Flow). Creates start frame, exploded end frame, and transition video, then extracts numbered frame sequences for GSAP ScrollTrigger playback.
---

# Exploding Scroll-Scrub Hero -- Asset Generation Skill

A 3-prompt workflow that generates AI-powered frame sequences for scroll-driven hero animations. Built for any subject -- products, logos, brand elements, abstract concepts.

## Prerequisites

- **Gemini API key** -- stored in memory (`gemini_api_key.md`)
- **Google Flow account** -- https://labs.google.com/flow (free, requires Google account)
- **ffmpeg** -- installed locally for frame extraction
- **cwebp** -- installed locally for WebP conversion (optional: `avifenc` for AVIF)

## Pipeline Overview

```
Prompt 1 (Gemini API)     --> Start frame image (dormant/intact state)
Prompt 2 (Gemini API)     --> End frame image (exploded/awakened state, uses start as reference)
Prompt 3 (Google Flow UI) --> Transition video (start to end, 5-8 seconds)
ffmpeg                    --> Extract numbered frame sequence (JPG)
cwebp/avifenc             --> Convert to web format (WebP or AVIF)
```

## Prompt 1: Start Frame (Dormant State)

**Tool:** Gemini API with Nano Banana 2 / Imagen

**Template variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `{{subject}}` | What the hero depicts | "a biomechanical serpent" |
| `{{pose}}` | Starting pose/state | "coiled and dormant, tightly wound" |
| `{{style}}` | Visual style descriptors | "organic scales with subtle metallic undertones" |
| `{{background_color}}` | Must match site background | "#0A0A0A" |
| `{{mood}}` | Mood/atmosphere keywords | "still, latent power, potential energy" |

**Prompt template:**

```
Create a photorealistic, 8K resolution image of {{subject}} in a {{pose}} position.
The subject should have {{style}}.
The background must be solid {{background_color}} -- no gradients, no environment, pure dark.
Studio lighting from above-left, creating dramatic shadows.
The mood is {{mood}}.
The image should feel cinematic, professional, and high-end.
Aspect ratio: 16:9.
```

**Output:** Single high-res image
**Review:** Approve or adjust prompt variables and re-run. The start frame sets the foundation -- get it right before moving to Prompt 2.

## Prompt 2: End Frame (Awakened/Exploded State)

**Tool:** Gemini API with Nano Banana 2, attaching Prompt 1's output as reference image

**Template variables (inherits `{{subject}}` and `{{background_color}}` from Prompt 1):**

| Variable | Description | Example |
|----------|-------------|---------|
| `{{transformation}}` | How the subject deconstructs | "scales separated and lifted, body sections split apart" |
| `{{internals}}` | What's revealed inside | "glowing circuits, neural pathways, data streams" |
| `{{brand_color}}` | Brand color for glow effects | "#39FF14" |
| `{{atmosphere}}` | Environmental elements | "faint particles, wisps of green-lit fog" |

**Prompt template:**

```
Using the attached reference image as the starting point, create the end state of this subject's transformation.

The subject has {{transformation}}.
The interior reveals {{internals}}, all glowing with {{brand_color}} light.
The environment has {{atmosphere}}, illuminated by the internal glow.
Background remains {{background_color}}.
Same studio lighting setup as the reference, but now the {{brand_color}} internal glow is the dominant light source.
8K resolution, cinematic, photorealistic. Aspect ratio: 16:9.
```

**Output:** Single high-res image
**Review:** This is the most critical image. Iterate until the transformation feels right. The end frame is what visitors see at full scroll -- it must be stunning.

## Prompt 3: Transition Video

**Tool:** Google Flow (Veo 3.1) via web UI -- manual step for quality control

### Step 3a: Generate the Flow prompt via Gemini

Ask Gemini to write a Google Flow transition prompt:

```
I need a Google Flow (Veo 3.1) prompt to create a smooth transition video between two frames.

Start frame: [describe the dormant/intact state from Prompt 1]
End frame: [describe the exploded/awakened state from Prompt 2]

The transition should show:
- Cracks of {{brand_color}} light slowly appearing through the surface
- Sections of the exterior beginning to lift and separate
- Internal glow intensifying as more is revealed
- Atmospheric particles beginning to drift and catch the light
- The transformation should feel like an awakening, not an explosion -- controlled, inevitable, alive

Duration: 5-8 seconds
Quality: Highest available (Veo 3.1)
Style: Cinematic, smooth, professional studio quality
```

### Step 3b: Generate the video in Google Flow

1. Go to https://labs.google.com/flow
2. Click "Generate with Flow" -> "Frames to Video"
3. Upload start frame as first image, end frame as second image
4. Paste the prompt from Step 3a
5. Set quality to Veo 3.1 (highest)
6. Generate 6-8 iterations
7. Review all results, pick the best one
8. Download at original or upscaled size

**Output:** 5-8 second MP4 video

## Frame Extraction

**Tool:** ffmpeg (local)

### Desktop frames (30fps)

```bash
mkdir -p frames/desktop
ffmpeg -i transition.mp4 -vf "fps=30,scale=1920:1080" frames/desktop/frame-%04d.jpg
```

### Mobile frames (10fps, lower resolution)

```bash
mkdir -p frames/mobile
ffmpeg -i transition.mp4 -vf "fps=10,scale=1280:720" frames/mobile/frame-%04d.jpg
```

## Format Conversion

### WebP (recommended -- universal browser support)

```bash
# Desktop
cd frames/desktop
for f in *.jpg; do cwebp -q 85 "$f" -o "${f%.jpg}.webp"; done
rm *.jpg

# Mobile
cd ../mobile
for f in *.jpg; do cwebp -q 80 "$f" -o "${f%.jpg}.webp"; done
rm *.jpg
```

### AVIF (smaller files, good browser support except older Safari)

```bash
# Desktop
cd frames/desktop
for f in *.jpg; do avifenc --min 20 --max 35 "$f" "${f%.jpg}.avif"; done
rm *.jpg

# Mobile
cd ../mobile
for f in *.jpg; do avifenc --min 20 --max 35 "$f" "${f%.jpg}.avif"; done
rm *.jpg
```

### Compare and choose

```bash
echo "WebP:" && du -sh frames/desktop/ && echo "AVIF:" && du -sh frames/desktop-avif/
```

Target sizes: Desktop < 10MB, Mobile < 3MB.

## Quality Checklist

Before deploying frames to a project:

- [ ] Background color matches the site exactly (no visible seam)
- [ ] Brand color glow is accurate (compare hex values)
- [ ] Frame 1 works as a standalone poster image
- [ ] Final frame works as a standalone static hero
- [ ] No visual artifacts or flickering between consecutive frames
- [ ] Total desktop payload < 10MB
- [ ] Total mobile payload < 3MB
- [ ] Frame numbering is sequential with no gaps (frame-0001 through frame-NNNN)

## OphidianAI Reference (First Use)

| Variable | Value |
|----------|-------|
| `{{subject}}` | "a biomechanical serpent with organic scales and subtle metallic undertones" |
| `{{pose}}` | "coiled and dormant, tightly wound, head resting on its body" |
| `{{style}}` | "photorealistic organic reptilian scales transitioning to brushed dark metal at the edges, hints of circuitry visible at scale seams" |
| `{{background_color}}` | "#0A0A0A" |
| `{{mood}}` | "still, latent power, potential energy, dormant intelligence" |
| `{{transformation}}` | "scales cracked and lifted away from the body, sections of the serpent split apart revealing the interior" |
| `{{internals}}` | "glowing venom-green (#39FF14) circuits, pulsing neural pathways, streams of data flowing through translucent conduits" |
| `{{brand_color}}` | "#39FF14" |
| `{{atmosphere}}` | "faint green-lit particles floating around the deconstructed form, wisps of luminous fog" |

**Narrative:** Dormant-to-awakening. Not destruction -- emergence. The organic and digital becoming something greater together.
