# Nature Inspiration Gallery

Reference images for Nano Banana 2 generation. Drop images into the category folders below.
These feed directly into `scripts/generate-site-assets.cjs` as style references.

---

## Folders

### `/textures`
Close-up surface textures — bark, stone, moss, soil, mineral, scale patterns.
Used for: section backgrounds, subtle overlays, card surfaces.

### `/landscapes`
Mountains, forests, valleys, dark skies, mist.
Used for: full-bleed section dividers, about page, atmospheric backgrounds.

### `/macro`
Extreme close-up nature — water drops on leaves, mycelium, spores, crystal formations, root systems.
Used for: hero sculptural object reference, organic form generation.

### `/organic-forms`
Fluid organic shapes — liquid, flowing material, sculptural abstract natural forms.
Think: Brant Paints hero (fluid amber splash), Integrated Bio's curved surfaces.
Used for: **hero main sculptural object** — the centerpiece of the site.

### `/light-atmosphere`
Low light, dusk, bioluminescence, forest light shafts, moonlight, dark atmospheric shots.
Used for: background mood, video poster frames, hero lighting reference.

---

## What Gets Generated

Once this gallery is populated, `generate-site-assets.cjs --nature` produces:

| Asset | Source Category | Output |
|-------|----------------|--------|
| Hero sculptural object | organic-forms + macro | `public/images/hero-object.png` |
| Hero background | landscapes + light-atmosphere | `public/images/hero-bg.png` |
| Services section bg | textures | `public/images/services-bg.png` |
| Organic break section | landscapes + light-atmosphere | `public/images/break-bg.png` |
| About page visual | landscapes + light-atmosphere | `public/images/about-visual.png` |
| Testimonials bg | textures | `public/images/testimonials-bg.png` |
| OG images (6 pages) | hero-object + brand | `public/og/og-*.png` |

---

## Generation Philosophy

The hero object follows the Brant Paints model:
- A single sculptural organic form floating on pure black
- Material: dark biomechanical serpent skin — scales, organic curves, deep forest green/black
- Lit from within by venom green (#39FF14) as if bioluminescent
- High-end 3D render quality, macro photography realism
- NOT a background — a foreground object on black

This is the "machine revealing itself through nature" moment on the page.
