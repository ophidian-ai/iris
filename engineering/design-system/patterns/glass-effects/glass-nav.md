---
name: Glass Nav
category: glass-effects
complexity: moderate
dependencies: css-only
best-for: organic, farm, food, wellness, rustic, luxury, dark-ui, sidebar, navigation
performance: "backdrop-filter causes a composite layer. On most devices this is GPU-accelerated. Avoid applying to many overlapping elements simultaneously. Single nav element is fine."
source-project: bloomin-acres
last-validated: 2026-03-13
---

# Glass Nav

## What It Does
Creates a navigation element with a glass morphism effect -- a semi-transparent background with backdrop blur that lets underlying content show through with a frosted-glass appearance. Used for sidebars, fixed nav buttons, and floating UI elements.

## When to Use
- Fixed/sticky navigation bars or sidebars over background images
- Floating action buttons (hamburger menus, cart icons)
- Any UI element that overlays rich visual content (hero images, gradient backgrounds)
- Dark-themed interfaces where you want depth without full opacity backgrounds

## Visual Effect
The navigation surface appears as frosted glass with a warm brown tint. Content behind it is visible but blurred and slightly saturated. The gradient background provides directionality (darker at edges, lighter in the middle). Subtle inner glow borders (1px inset shadows at low opacity) create the glass edge. The overall effect is premium and layered without obscuring the page content beneath.

## Code Reference
**Starter component:** None

## Key Implementation Details

**Sidebar drawer (from `css/global.css`):**

```css
.nav-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 250;
  width: min(280px, 80vw);

  /* Glass effect with brown undertone */
  background:
    linear-gradient(
      180deg,
      rgba(42,30,20,.86) 0%,
      rgba(61,42,26,.82) 40%,
      rgba(42,30,20,.88) 100%
    );
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  backdrop-filter: blur(24px) saturate(1.2);
  border-right: 1px solid rgba(237,163,57,.12);

  /* Glass inner glow + depth */
  box-shadow:
    inset 1px 0 0 rgba(250,240,230,.04),
    inset 0 1px 0 rgba(250,240,230,.06),
    inset -1px 0 0 rgba(0,0,0,.15),
    4px 0 32px rgba(0,0,0,.4);
}
```

**Hamburger toggle button (from `css/global.css`):**

```css
.nav-toggle {
  position: fixed;
  top: 0; left: 0;
  z-index: 300;
  background:
    linear-gradient(135deg, rgba(42,30,20,.82) 0%, rgba(61,42,26,.76) 100%);
  border: 1px solid rgba(237,163,57,.12);
  border-radius: 8px;
  -webkit-backdrop-filter: blur(16px) saturate(1.1);
  backdrop-filter: blur(16px) saturate(1.1);
  box-shadow:
    inset 0 1px 0 rgba(250,240,230,.04),
    0 2px 12px rgba(0,0,0,.3);
}
```

**Footer glass bar (from `css/global.css`):**

```css
.site-footer {
  background:
    linear-gradient(135deg, rgba(42,30,20,.82) 0%, rgba(58,42,30,.78) 50%, rgba(42,30,20,.85) 100%);
  -webkit-backdrop-filter: blur(18px) saturate(1.1);
  backdrop-filter: blur(18px) saturate(1.1);
  border-top: 1px solid rgba(250,240,230,.06);
  box-shadow:
    inset 0 1px 0 rgba(250,240,230,.04),
    0 -4px 24px rgba(0,0,0,.2);
}
```

**Shared glass CSS custom properties (from `css/global.css`):**

```css
:root {
  --glass-bg:
    linear-gradient(
      135deg,
      rgba(42,30,20,.82) 0%,
      rgba(61,42,26,.78) 50%,
      rgba(42,30,20,.85) 100%
    );
  --glass-border: 1px solid rgba(237,163,57,.1);
  --glass-shadow:
    inset 0 1px 0 rgba(250,240,230,.04),
    inset 0 -1px 0 rgba(250,240,230,.06),
    inset -1px 0 0 rgba(0,0,0,.15),
    0 4px 24px rgba(0,0,0,.25);
}
```

**Glass effect anatomy:**

1. **Semi-transparent gradient background** -- provides the tint color and directionality. Opacity 0.76-0.88 range.
2. **backdrop-filter: blur(16-24px) saturate(1.1-1.2)** -- the actual frosted glass effect. Blur softens what's behind; saturate keeps colors from looking washed out.
3. **Border** -- very low opacity brand color (gold at 0.10-0.14) creates a subtle edge line.
4. **Inset box-shadows** -- multiple inset shadows simulate light catching glass edges. Top/left insets are light (cream at 0.04-0.06), bottom/right insets are dark (black at 0.15).
5. **Outer box-shadow** -- dark drop shadow for depth separation from the page.

**Always include the -webkit- prefix:**

```css
-webkit-backdrop-filter: blur(24px) saturate(1.2);
backdrop-filter: blur(24px) saturate(1.2);
```

Safari requires the `-webkit-` prefix. Without it, the glass effect breaks on all Apple devices.

## Customization
- Swap the brown tones (rgba(42,30,20,...)) for any dark brand color to change the glass tint.
- Increase blur for stronger frosting (32px) or decrease for more transparency (8px).
- Change the border color to match a different accent (e.g., blue accent instead of gold).
- For light-themed glass, invert: use white/light backgrounds at ~0.7 opacity, dark inset shadows become light.
- The `saturate(1.1)` is subtle. Increase to 1.4 for more vivid backgrounds showing through, or remove for a more muted look.

## Dependencies
- None -- CSS only (backdrop-filter is supported in all modern browsers)
