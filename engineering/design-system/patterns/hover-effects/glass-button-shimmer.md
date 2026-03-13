---
name: Glass Button Shimmer
category: hover-effects
complexity: moderate
dependencies: css-only
best-for: tech, saas, agency, dark-themes, cta-buttons
performance: "Pure CSS transitions and pseudo-elements. backdrop-filter blur is the heaviest part -- fine for a few buttons per page."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Glass Button Shimmer

## What It Does
A liquid glass-style button with a translucent backdrop, inner highlight gradient, and a shimmer sweep that crosses the button on hover.

## When to Use
- Primary CTA buttons on dark backgrounds
- Hero section action buttons
- Any prominent interactive element that needs a premium glass aesthetic
- Pairs with glass card layouts

## Visual Effect
The button has a translucent green-tinted background with backdrop blur, creating a frosted glass look. A subtle diagonal highlight gradient sits on top. On hover, the border brightens, a soft outer glow appears, and a green shimmer band sweeps from left to right across the button. On click, the button scales down slightly (0.97) for tactile feedback. Text has a persistent green text-shadow glow.

## Code Reference
**Starter component:** `starters/hover-effects/glass-button.tsx`

## Key Implementation Details

- CSS custom properties for the glass theme:

```css
.glass-button-wrap {
  --glass-bg: rgba(57, 255, 20, 0.08);
  --glass-border: rgba(57, 255, 20, 0.25);
  --glass-highlight: rgba(57, 255, 20, 0.15);
  --glass-shadow: rgba(57, 255, 20, 0.3);
  --glass-text: #39FF14;
}
```

- The button base with backdrop blur:

```css
.glass-button {
  border: 1px solid var(--glass-border);
  background: linear-gradient(135deg,
    var(--glass-highlight) 0%,
    var(--glass-bg) 50%,
    rgba(57, 255, 20, 0.03) 100%
  );
  backdrop-filter: blur(12px);
  border-radius: 9999px;
  overflow: hidden;
}
```

- `::before` provides the inner highlight gradient:

```css
.glass-button::before {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.04) 40%,
    transparent 60%
  );
}
```

- `::after` creates the shimmer sweep effect:

```css
.glass-button::after {
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(57, 255, 20, 0.15) 50%,
    transparent 100%
  );
  transition: left 0.5s ease;
}

.glass-button:hover::after {
  left: 100%;
}
```

- Hover state intensifies the background and adds a glow:

```css
.glass-button:hover {
  border-color: rgba(57, 255, 20, 0.45);
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

- Active/press state: `transform: scale(0.97)`
- Text glow: `text-shadow: 0 0 20px rgba(57, 255, 20, 0.3)`
- Shadow element appears on wrap hover with `opacity: 0.6` and `filter: blur(16px)`

- The React component uses `class-variance-authority` for size variants:

```tsx
const glassButtonVariants = cva(
  "relative isolate all-unset cursor-pointer rounded-full transition-all",
  { variants: { size: { default: "text-base", sm: "text-sm", lg: "text-lg", icon: "h-10 w-10" } } }
);
```

## Customization
- Replace all `rgba(57, 255, 20, ...)` values with your brand color for a different hue
- Adjust `backdrop-filter: blur(12px)` -- higher blur = more frosted, lower = more transparent
- Change shimmer speed via the `transition: left 0.5s ease` duration
- Remove `::after` entirely for a glass button without the shimmer effect
- Add `::before` animation for a persistent shimmer loop instead of hover-only
- The `href` prop on the React component wraps in an `<a>` tag for link buttons

## Dependencies
- `class-variance-authority` (for the React component size variants -- optional)
- CSS is self-contained otherwise
