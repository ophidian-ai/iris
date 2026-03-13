---
name: Gradient Text
category: typography
complexity: simple
dependencies: css-only
best-for: tech, saas, agency, dark-themes, headings, hero-text
performance: "Zero runtime cost. Pure CSS background-clip."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Gradient Text

## What It Does
Fills text with a gradient color instead of a solid fill, using the CSS background-clip technique.

## When to Use
- Section headings (h1, h2)
- Hero headlines
- Brand-colored titles
- Any heading that needs more visual weight than a solid color

## Visual Effect
Text displays a 135-degree diagonal gradient from venom green (#39FF14) to teal (#0DB1B2), creating a vibrant two-tone fill that adds depth and brand identity to headings.

## Code Reference
**Starter component:** None

## Key Implementation Details

- The `.gradient-text` utility class in `globals.css`:

```css
.gradient-text {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- The `Heading` component applies it via a `gradient` boolean prop:

```tsx
export function Heading({ level = 2, gradient = false, className = "", children, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  const gradientClass = gradient ? "gradient-text" : "text-foreground";
  return <Tag className={`${gradientClass} ${className}`} {...props}>{children}</Tag>;
}
```

- Usage: `<Heading level={1} gradient>Your Headline</Heading>`

## Customization
- Change gradient angle (135deg) for different sweep directions
- Use 3+ color stops for more complex gradients: `var(--color-primary) 0%, var(--color-accent) 50%, var(--color-primary-light) 100%`
- Animate the gradient position with `background-size: 200% 200%` and `@keyframes` for a shifting effect
- For light themes, use darker gradient colors to maintain readability
- Always use `-webkit-text-fill-color: transparent` alongside `background-clip: text` for cross-browser support
- Avoid on body text -- gradient text is best for headings at 1.25rem+ sizes

## Dependencies
- None -- CSS only
