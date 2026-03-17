# Layout Variation Library

> **Purpose:** Prevent recycled layouts across prospect demos and client builds.
> Every new project must use a different structural combination than recent work.

## How to Use

1. Before starting any new site, check `## Recently Used` at the bottom
2. For each section, pick a variant that **was NOT used** in the last 3 projects
3. Log your choices in `## Recently Used` when the build is done
4. Aim for at least 3 sections using variants you haven't touched in 3+ builds

---

## Hero Variants

| ID | Name | Structure | Best For |
|----|------|-----------|----------|
| H1 | **Centered Overlay** | Full-bleed image/video, centered text, gradient vignette | Universal default |
| H2 | **Split Hero** | 50/50 or 60/40 two-column, text left + image/video right (or reversed) | Services, portfolios |
| H3 | **Editorial** | Large serif headline fills viewport, minimal imagery, text-forward with accent line | Luxury, spa, high-end |
| H4 | **Stacked Asymmetric** | Off-center text block + floating image element with overlap/offset | Creative, modern |
| H5 | **Scroll-Scrub Video** | 300vh container, sticky video with scroll-driven playback, dynamic overlay | Premium showcase |
| H6 | **Card Hero** | Minimal dark/light bg, large card container with image + text inside, no full-bleed | Clean, corporate |
| H7 | **Mosaic** | Grid of 3-4 images with text overlaid on one panel, asymmetric sizing | Visual-heavy (restaurants, salons) |

## Services Variants

| ID | Name | Structure | Best For |
|----|------|-----------|----------|
| S1 | **Grid Cards** | 2x2 or 3-col cards with image top + text bottom | Universal |
| S2 | **Alternating Rows** | Full-width rows alternating image-left/text-right, then reversed | Detailed services |
| S3 | **Icon Grid** | No images, icon + title + description in 3-col or 4-col grid | Many services, minimal imagery |
| S4 | **Bento Grid** | Mixed-size grid (1 large + 2 small, or asymmetric CSS grid) | Modern, editorial |
| S5 | **Horizontal Scroll** | Single row of cards with horizontal scroll/drag on mobile, full grid on desktop | Interactive feel |
| S6 | **Tabbed/Accordion** | Tab bar or accordion, one service visible at a time with image + details | Many services, limited space |
| S7 | **Overlapping Image Cards** | Cards with images that bleed outside their container, overlapping borders | Premium, creative |

## Stats / Social Proof Variants

| ID | Name | Structure | Best For |
|----|------|-----------|----------|
| T1 | **Gradient Strip** | Full-width colored bar, 3-col counters, badge pill | Universal |
| T2 | **Inline Cards** | Row of bordered cards, each with number + label, on neutral bg | Clean, light themes |
| T3 | **Split Stat + Quote** | Left: 2-3 stat numbers stacked. Right: pull quote from a review | Story-driven |
| T4 | **Background Image Stats** | Stats overlaid on a relevant image with dark overlay | Visual impact |
| T5 | **Marquee Ticker** | Scrolling horizontal ticker with stats, trust logos, and badges | Modern, dynamic |

## Reviews Variants

| ID | Name | Structure | Best For |
|----|------|-----------|----------|
| R1 | **3-Column Cards** | Equal-height cards in a row, stars + quote + author | Universal |
| R2 | **Single Featured** | One large review centered with decorative quotes, navigation dots to cycle | Minimal, high-impact |
| R3 | **Masonry** | Variable-height cards in 2-3 columns, staggered layout | Many reviews |
| R4 | **Carousel/Slider** | Horizontal swipeable cards, 1-2 visible at a time, dots or arrows | Mobile-friendly |
| R5 | **Quote Wall** | Full-width section with 1 large centered quote, small thumbnails/names below in a row | Editorial, premium |
| R6 | **Split Highlight** | Left: one large featured review. Right: 2-3 smaller stacked reviews | Balanced |

## CTA Variants

| ID | Name | Structure | Best For |
|----|------|-----------|----------|
| C1 | **Image Overlay** | Background image with dark overlay, centered text + button | Universal |
| C2 | **Card CTA** | Contained card on neutral bg, rounded, centered content | Elegant, spa |
| C3 | **Split CTA** | Two-column: left text/button, right image or illustration | Detailed messaging |
| C4 | **Minimal Strip** | Narrow band, single line of text + inline button, no image | Subtle, clean |
| C5 | **Full-Bleed Color** | Solid brand color bg (no image), large text, high-contrast button | Bold, confident |

## Contact Variants

| ID | Name | Structure | Best For |
|----|------|-----------|----------|
| N1 | **2-Column Split** | Left: info cards stacked. Right: CTA card or map | Universal |
| N2 | **3-Card Row** | Three equal cards (address, phone, hours) centered | Clean, symmetrical |
| N3 | **Map + Overlay** | Embedded map or large map image, glass card overlay with info | Location-focused |
| N4 | **Single Column Stacked** | Centered info blocks stacked vertically, clean and simple | Minimal |
| N5 | **Contact Form + Info** | Left: form fields. Right: address/phone/hours sidebar | Lead capture |

## About / Story Variants

| ID | Name | Structure | Best For |
|----|------|-----------|----------|
| A1 | **Split Image + Text** | Image left, text right (or reversed), optional accent image | Universal |
| A2 | **Full-Width Narrative** | No image, large text block with pull quotes and accent lines | Story-driven |
| A3 | **Timeline** | Horizontal or vertical timeline of business milestones | Established businesses |
| A4 | **Team Grid** | Photo grid of team members with names and roles | People-focused |
| A5 | **Parallax Story** | Background image with parallax scroll, text overlaid in sections | Premium, immersive |

## Navigation Variants

| ID | Name | Structure | Best For |
|----|------|-----------|----------|
| V1 | **Floating Pill** | Rounded container with blur bg, appears on scroll | Modern, dark themes |
| V2 | **Full-Width Bar** | Standard full-width header bar, no rounding | Corporate, traditional |
| V3 | **Side Navigation** | Vertical nav on left edge, always visible on desktop | Creative, portfolio |
| V4 | **Centered Logo** | Logo centered, nav links split left and right | Symmetrical, premium |
| V5 | **Minimal** | Logo + hamburger only (even on desktop), slide-out menu | Ultra-clean, editorial |

---

## Recently Used

Track the last 5 projects to enforce variety. Add new entries at the top.

| Project | Date | Hero | Services | Stats | Reviews | CTA | Contact | About | Nav |
|---------|------|------|----------|-------|---------|-----|---------|-------|-----|
| Columbus Massage Center | 2026-03-14 | H1 | S4 (bento: 3 image + 2 icon) | T1 | R1 | C2 | N2 | A1 | V1 |
| SAK Automotive | 2026-03-14 | H2 | S6 | T3 | R6 | C5 | N3 | -- | V2 |
| Classic Auto Body | 2026-03-14 | H5 | S1 | T1 | R1 | C1 | N1 | -- | V1 |

### Overused Patterns (avoid next 3 builds)

- **H1** (Centered Overlay) -- used 2/3 recent builds
- **S1** (Grid Cards) -- used 2/3 recent builds
- **T1** (Gradient Strip) -- used 3/3 recent builds
- **R1** (3-Column Cards) -- used 3/3 recent builds
- **N1** (2-Column Split) -- used 2/3 recent builds
- **V1** (Floating Pill) -- used 3/3 recent builds
