---
name: Serif-Sans Pairing
category: typography
complexity: simple
dependencies: css-custom-properties, google-fonts
best-for: organic, farm, food, wellness, rustic, luxury, editorial, artisan
performance: "Three Google Fonts loaded. Use font-display: swap to prevent FOIT. Subset to latin if international support isn't needed."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Serif-Sans Pairing

## What It Does
Pairs Playfair Display (serif) for display headings with DM Sans (sans-serif) for body text and UI elements, plus Lora (serif, italic) for accent text like quotes, ingredients, and captions. Creates a warm, editorial feel with clear hierarchy.

## When to Use
- Organic, farm, food, or wellness brands
- Any design where headings should feel classic/editorial and body text should feel modern/clean
- When you need three levels of typographic voice: display, body, and accent
- Brands that value warmth and approachability over tech-forward minimalism

## Visual Effect
Headings in Playfair Display feel authoritative and classic with their high-contrast strokes and elegant serifs. The tight letter-spacing (-0.03em) on headings gives them a polished, intentional look rather than the loose default. DM Sans body text is clean and highly readable at small sizes with generous line-height (1.7). Lora italic provides a handwritten, personal quality for quotes and annotations that bridges the formality gap between the two primary fonts.

## Code Reference
**Starter component:** None

## Key Implementation Details

**CSS custom properties (from `css/global.css`):**

```css
:root {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
}
```

**Heading styles (from `css/index.css`):**

```css
h1, h2, h3 {
  font-family: var(--font-display);
  letter-spacing: -0.03em;
  line-height: 1.15;
}
```

**Body base (from `css/index.css`):**

```css
body {
  font-family: var(--font-body);
  line-height: 1.7;
}
```

**Accent font usage (from `css/menu.css`):**

```css
.item-name {
  font-family: 'Lora', Georgia, serif;
  font-size: .88rem;
}
```

```css
.product-ingredients {
  font-family: 'Lora', Georgia, serif;
  font-style: italic;
  font-size: .82rem;
  line-height: 1.6;
}
```

**Overline labels (from `css/global.css`):**

```css
.overline {
  display: block;
  font-family: var(--font-body);
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .22em;
  text-transform: uppercase;
  margin-bottom: .875rem;
}
```

**Tailwind config equivalent (from `js/tailwind-config.js`):**

```js
fontFamily: {
  display: ['"Playfair Display"', 'Georgia', 'serif'],
  playfair: ['"Playfair Display"', 'Georgia', 'serif'],
  sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
  lora: ['"Lora"', 'Georgia', 'serif'],
},
```

**Font role assignments:**

| Role | Font | Weight | Tracking | Line Height |
|------|------|--------|----------|-------------|
| Display headings (h1-h3) | Playfair Display | 600-700 | -0.03em | 1.15 |
| Body text | DM Sans | 400 | normal | 1.7 |
| UI labels/overlines | DM Sans | 600 | 0.22em | normal |
| Buttons/CTAs | DM Sans | 600 | 0.05em | normal |
| Quotes/accents | Lora italic | 400 | normal | 1.6 |
| Nav links | Playfair Display | 600 | -0.01em | normal |
| Small annotations | DM Sans | 400-500 | 0.04-0.08em | normal |

**Responsive heading sizing (from `css/index.css`):**

```css
.welcome-heading {
  font-size: clamp(2rem, 4vw, 3.1rem);
}
```

All major headings use `clamp()` for fluid sizing between mobile and desktop.

## Customization
- Replace Playfair Display with other high-contrast serifs: Cormorant Garamond, Libre Baskerville, or Merriweather.
- Replace DM Sans with other geometric sans: Inter, Nunito Sans, or Source Sans 3.
- Replace Lora with other italic-friendly serifs: Crimson Text, EB Garamond, or Libre Baskerville.
- The -0.03em heading tracking is tuned for Playfair Display. Adjust per font -- some serifs look better at -0.02em or -0.04em.
- The 1.7 body line-height is generous for readability. Tighten to 1.6 for denser layouts, loosen to 1.8 for extra-readable long-form.

## Dependencies
- Google Fonts: Playfair Display, DM Sans, Lora
- Load via `<link>` tag or `@import` in CSS:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Lora:ital@1&display=swap" rel="stylesheet">
```
