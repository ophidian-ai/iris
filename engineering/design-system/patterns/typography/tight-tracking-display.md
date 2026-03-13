---
name: Tight Tracking Display
category: typography
complexity: simple
dependencies: css-only
best-for: organic, farm, food, wellness, rustic, luxury, editorial, landing-page, hero
performance: "No performance impact. Pure CSS text rendering."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Tight Tracking Display

## What It Does
Applies negative letter-spacing (-0.03em to -0.05em) to large display headings, pulling characters closer together for a tighter, more impactful look. This is the opposite of the default browser spacing and eliminates the "loose" feel of large text.

## When to Use
- Hero section headings at 2rem+ sizes
- Section titles and display text
- Any heading that feels too airy or spread out at large sizes
- Serif fonts especially benefit (their natural spacing tends to feel looser at large sizes)

## Visual Effect
At large sizes, default letter-spacing makes headings feel scattered -- each letter stands alone. Negative tracking pulls characters into a cohesive visual unit. The heading feels intentional, designed, and authoritative. The effect is most noticeable on serif fonts where the natural spacing between characters is wider. At -0.03em, the tracking is subtle enough to feel "correct" rather than artificially compressed.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Global heading rule (from `css/index.css`):**

```css
h1, h2, h3 {
  font-family: var(--font-display);
  letter-spacing: -0.03em;
  line-height: 1.15;
}
```

**Section heading examples (from `css/index.css`):**

```css
.visit-heading {
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--farm-cream);
  letter-spacing: -.03em;
}
```

**Card titles at smaller sizes use lighter tracking (from `css/index.css`):**

```css
.card-title {
  font-size: 1.3rem;
  letter-spacing: -.02em;
}
```

**Sidebar nav links use very light negative tracking (from `css/global.css`):**

```css
.nav-sidebar-link {
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: -.01em;
}
```

**Tracking scale by size:**

| Text Size | Tracking | Use Case |
|-----------|----------|----------|
| 3rem+ (display) | -0.03em to -0.05em | Hero headings, page titles |
| 2rem-3rem (section) | -0.03em | Section headings |
| 1.2rem-2rem (card/sub) | -0.02em | Card titles, sub-headings |
| 1rem-1.2rem (nav) | -0.01em | Navigation links, large labels |
| Below 1rem (body) | 0 (normal) | Body text -- never tighten |

**Important pairings:**

- Negative tracking on headings pairs with generous positive tracking on overlines/labels:

```css
.overline {
  font-size: .72rem;
  letter-spacing: .22em;   /* wide tracking on small caps */
  text-transform: uppercase;
}
```

This contrast (tight headings vs. wide labels) reinforces the typographic hierarchy.

- Line-height must be tight to match: `line-height: 1.15` for headings. Default 1.5 line-height with tight tracking creates an awkward mismatch.

## Customization
- -0.02em is safe for any font. -0.03em works well for Playfair Display, Cormorant, and similar high-contrast serifs. -0.05em is aggressive -- test carefully.
- Sans-serif fonts (Inter, DM Sans) generally need less negative tracking than serifs. Start at -0.02em for sans display headings.
- Never apply negative tracking to body text (below 1rem). It hurts readability at small sizes.
- For condensed fonts (like Oswald or Barlow Condensed), reduce or remove negative tracking -- they're already tight.

## Dependencies
- None -- CSS only
