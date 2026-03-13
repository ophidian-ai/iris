---
name: Tinted Shadows
category: color-treatments
complexity: simple
dependencies: css-custom-properties
best-for: organic, farm, food, wellness, rustic, luxury, corporate, portfolio, landing-page
performance: "No additional cost over standard box-shadows. Browser renders colored shadows identically to gray ones."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Tinted Shadows

## What It Does
Replaces generic gray/black box-shadows with brand-colored shadows at low opacity. Instead of `rgba(0,0,0,.1)`, shadows use actual palette colors like burnt-orange or earth-brown. Creates warmer, more intentional depth that matches the design rather than floating in a neutral void.

## When to Use
- Cards, buttons, and elevated surfaces in any branded design
- Hover states where shadows intensify (the color shift reinforces brand identity)
- Any component where standard gray shadows feel cold or disconnected from the palette
- Both light and dark backgrounds -- tinted shadows adapt to either

## Visual Effect
Elements appear to cast shadows that inherit the color warmth of the page. A card on a cream background casts earth-brown shadows, creating a natural "sitting on warm paper" look. A burnt-orange CTA button casts orange-tinted shadows, making it glow with its own color. On hover, shadow color and size both intensify, creating a "lifting toward you" effect that feels more alive than simply making a gray shadow bigger.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Card shadows using earth-brown (from `css/global.css`):**

```css
:root {
  --shadow-card:
    0 2px 4px rgba(74,51,34,.06),
    0 8px 24px rgba(74,51,34,.10),
    0 20px 40px rgba(74,51,34,.08);

  --shadow-card-hover:
    0 4px 8px rgba(74,51,34,.08),
    0 16px 40px rgba(200,90,58,.14),
    0 32px 64px rgba(74,51,34,.12);
}
```

Note the hover state introduces burnt-orange (`rgba(200,90,58,.14)`) in the middle layer -- the shadow shifts warmer as the card lifts.

**Button shadows using burnt-orange (from `css/global.css`):**

```css
:root {
  --shadow-btn:
    0 2px 8px rgba(200,90,58,.25),
    0 8px 24px rgba(200,90,58,.18);

  --shadow-btn-hover:
    0 4px 12px rgba(200,90,58,.35),
    0 12px 32px rgba(200,90,58,.22);
}
```

**Process step icon shadows using per-color tints (from `css/index.css`):**

```css
.step-icon-sage {
  background: var(--sage-green);
  box-shadow:
    0 4px 16px rgba(122,155,142,.3),
    0 8px 32px rgba(122,155,142,.15);
}
.step-icon-wheat {
  background: var(--wheat-gold);
  box-shadow:
    0 4px 16px rgba(237,163,57,.3),
    0 8px 32px rgba(237,163,57,.15);
}
.step-icon-rust {
  background: var(--burnt-orange);
  box-shadow:
    0 4px 16px rgba(200,90,58,.3),
    0 8px 32px rgba(200,90,58,.15);
}
.step-icon-berry {
  background: var(--berry-red);
  box-shadow:
    0 4px 16px rgba(139,58,58,.3),
    0 8px 32px rgba(139,58,58,.15);
}
```

**Three-layer shadow strategy:**

| Layer | Offset | Blur | Purpose |
|-------|--------|------|---------|
| Close shadow | 0 2-4px | 4-8px | Contact shadow, tightest, subtle |
| Mid shadow | 0 8-16px | 24-40px | Main depth, brand-colored |
| Ambient shadow | 0 20-32px | 40-64px | Atmospheric, softest, widest |

**Opacity guidelines:**

- Resting state: 0.06-0.10 per layer (subtle, professional)
- Hover state: 0.08-0.14 per layer (noticeable lift)
- Buttons/CTAs: 0.18-0.35 per layer (stronger glow, draws attention)
- The mid layer carries the most visual weight -- this is where brand color matters most

**Card usage (from `css/index.css`):**

```css
.product-card {
  box-shadow: var(--shadow-card);
  transition: transform 0.45s cubic-bezier(.22,1,.36,1),
              box-shadow 0.45s cubic-bezier(.22,1,.36,1);
}
.product-card:hover {
  transform: translateY(-7px);
  box-shadow: var(--shadow-card-hover);
}
```

**Map container with strong dark shadow (from `css/index.css`):**

```css
.visit-map-wrap {
  box-shadow:
    0 4px 24px rgba(0,0,0,.28),
    0 16px 48px rgba(0,0,0,.22);
}
```

Dark-on-dark sections can use black shadows since the "tint" would be invisible. Reserve brand-colored shadows for elements on light/medium backgrounds.

## Customization
- Match the shadow color to the element's own background or the section's accent color.
- For elements that change color on hover, shift the shadow color to match (like the card hover adding burnt-orange).
- On very light backgrounds, reduce opacity by ~30% to prevent shadows from looking too heavy.
- On dark backgrounds, brand-colored shadows create a subtle glow effect. Increase blur radius for a softer glow.
- Store shadow values as CSS custom properties for easy theme-wide changes.

## Dependencies
- None -- CSS only. Uses CSS custom properties for reuse across components.
