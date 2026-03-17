# OphidianAI Website Rebuild -- Design Spec

**Date:** 2026-03-15
**Status:** Approved
**Approach:** Full teardown & rebuild of ophidianai.com

## Overview

Rebuild the OphidianAI marketing website inspired by lavadental.lv/en, rebranded with an organic nature-AI theme. Single-page layout, scroll-driven animations, deep forest green palette. Built in the existing Next.js 16 + Tailwind 4 + TypeScript project at `engineering/projects/ophidian-ai/`.

**Scope:** Public-facing marketing pages only. Client and admin dashboards are NOT touched.

## Color Palette -- "Organic Intelligence"

| Role | Name | Hex |
|---|---|---|
| Background Dark | Deep Forest Green | `#1B2E21` |
| Background Alt | Dark Moss | `#0F1F14` |
| Surface Light | Sage Mist | `#D4DFD0` |
| Surface Lighter | Pale Sage | `#E8EDE5` |
| Accent Primary | Venom Green | `#39FF14` |
| Accent Secondary | Teal | `#0DB1B2` |
| Accent Warm | Antique Gold | `#C4A265` |
| Text Light | Off-White | `#F1F5F9` |
| Text Muted | Sage Gray | `#94A3B8` |
| Text Dark | Forest Black | `#1B2E21` |
| Border Dark | Subtle Green | `rgba(255,255,255,0.08)` |

## Typography

| Role | Font | Weights |
|---|---|---|
| Display/H1 | Playfair Display | 400, 700 |
| Headings H2-H4 | Inter | 500, 600, 700 |
| Body | Inter | 400, 500 |
| Mono/Accent | Space Mono | 400 |

## Nav

Sticky top nav with transparent bg, section highlighting on scroll.
Links: About | Portfolio | Services | Pricing | FAQ | Contact | [Get Started CTA]

## Sections

### 1. Hero (Scroll-Shrink Video)

- **State 1 (no scroll):** `hero-card-video.mp4` fills 100vw x 100vh. Autoplay, muted, loop. OphidianAI logo centered, "Where the natural world meets innovation." below, "Get Started" CTA. Subtle dark gradient overlay at bottom.
- **State 2 (scroll):** Video scales from 100% to ~72% viewport width. Corners gain border-radius (0 -> 16px). Forest green bg revealed behind. Overlay text fades out.
- **State 3 (after shrink):** Tagline "Intelligence. Engineered." fades in word-by-word below the card. Playfair Display, centered, dark forest bg.
- **Implementation:** GSAP ScrollTrigger, pin + scrub. CSS scale() transform.

### 2. About / Mission Statement

- Dark forest green bg
- Large centered Playfair Display text, word-by-word scroll animation
- Text: "We build intelligent systems that transform how businesses operate."
- Generous vertical padding (~100vh)

### 3. Image Carousel

- Horizontal auto-scrolling strip of nature-gallery images
- Mixed sizes (tall, wide, square)
- Images from: landscapes/, macro/, textures/
- Parallax offset, pause on hover, drag to scroll
- Below: large italic text "So that your business thrives at every stage."

### 4. Manifesto

- Sage mist bg (`#D4DFD0`)
- Left: staggered image collage (organic-forms/, light-atmosphere/)
- Right: mission/manifesto copy
- Second row with more images + supporting AI-nature philosophy copy
- Gold accent separator

### 5. Process Orbit ("Your path starts here")

- Dark forest green bg
- Interactive SVG orbit with 6 numbered points on curved arc
- Steps: Discovery, Strategy, Design, Build, Launch, Grow
- Click to reveal description. Active point: venom green glow.

### 6. Brand Statement

- Full-screen dark section
- Topographic/organic SVG line pattern bg (venom green at 5-10% opacity)
- Large text: "That's us -- Ophidian**AI**."
- Word-by-word fade on scroll
- Video play button (modal) + CTA

### 7. Portfolio

- Sage mist bg
- Heading: "Our work speaks for itself."
- Grid of project cards with thumbnails + tags (Website, AI Integration, SEO, Social)
- Hover: scale + shadow. "Show more" expands from 6 to all.

### 8. Services

- Sage mist bg
- Full-width top card: "AI-Powered Websites" with image
- 4 equal cards: SEO, Social Media, AI Integrations, Consulting
- Numbered (01-05), arrow icons, hover lift
- Below: text list rows for secondary services with borders

### 9. Testimonials (replaces Team)

- Dark forest green bg
- Heading: "What our clients say"
- StaggerTestimonials component (shadcn-style, lucide-react icons)
- Center card: venom green bg + dark text
- Side cards: forest green bg + sage borders
- Content: OphidianAI-specific testimonials

### 10. Pricing

- Sage mist bg
- Heading: "Invest in your growth"
- Tabs: Websites, SEO, Social Media, AI Services
- Each tab: pricing card with package name, starting price, bullet features
- Footer note: "Prices vary depending on scope and complexity."

### 11. FAQ

- Sage mist bg
- Heading: "Before you start, you might want to know more."
- Grouped nested accordions: Services & Pricing, Process & Timeline, About OphidianAI

### 12. Contact

- Dark forest green bg
- Heading: "We are right here."
- Left: map graphic (Columbus, IN)
- Right: address, phone, email, hours
- Below: full-width location/nature image

### 13. Footer

- Darkest bg (`#0F1F14`)
- Large OphidianAI logo with gold/antique metallic treatment
- Grid: Contacts, Address, Working Hours, Social Links
- Copyright: "2026 OphidianAI"

## Assets

**Video:**
- `engineering/references/inspiration/nature-gallery/landscapes/hero-card-video.mp4`

**Images (source from nature-gallery/):**
- landscapes/ -- forests, mist, mountains, ferns, fjords
- light-atmosphere/ -- bioluminescent, jellyfish, mushrooms, sky
- macro/ -- snake, leaves, water drops
- organic-forms/ -- marble, water, liquid
- textures/ -- moss, bark, stone, forest floor

**Logo:**
- `shared/ophidianai-brand-assets/logo_icon.png`
- `shared/ophidianai-brand-assets/logo-with-background.JPG`

## Technical Constraints

- Built in existing Next.js 16 + Tailwind 4 + TypeScript project
- GSAP + Framer Motion already installed for animations
- lucide-react already installed for icons
- cn() utility exists at src/lib/utils.ts
- Dashboard routes and components are NOT modified
- Remote image patterns configured for Unsplash, Supabase, randomuser.me
