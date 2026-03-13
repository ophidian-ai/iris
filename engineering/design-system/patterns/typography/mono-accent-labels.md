---
name: Mono Accent Labels
category: typography
complexity: simple
dependencies: css-custom-properties
best-for: tech, saas, agency, dark-themes, section-headers
performance: "Zero runtime cost. Font loading is the only consideration -- preload the mono font."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Mono Accent Labels

## What It Does
Uses a monospace font (Space Mono) for small overline labels, section tags, and accent text, creating a technical/code-like visual contrast against the primary sans-serif body font.

## When to Use
- Section overlines ("Our Process", "Features", "About Us")
- Taglines above or below hero headlines
- Badge-like labels
- Navigation accent text
- Any small text that benefits from a technical aesthetic

## Visual Effect
Small, uppercase, widely-tracked monospace text at reduced size creates a sharp visual distinction from body text. Often paired with reduced opacity (80%) in the primary or accent color, giving it a subtle, label-like appearance.

## Code Reference
**Starter component:** None

## Key Implementation Details

- Font definition in the theme:

```css
@theme inline {
  --font-mono: var(--font-space-mono), ui-monospace, monospace;
}
```

- Typical usage in the hero component (Tailwind classes):

```tsx
<h2 className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] text-primary/80">
  {renderWords(taglineWords, 0, 80)}
</h2>
```

- Bottom tagline with accent color:

```tsx
<h2 className="text-xs md:text-sm font-mono font-light uppercase tracking-[0.2em] text-accent/80">
  {renderWords(bottomWords, 2000, 70)}
</h2>
```

- Key styling properties:
  - `font-mono` (Space Mono via CSS variable)
  - `text-xs` or `text-sm` (small size)
  - `font-light` (300 weight)
  - `uppercase` (all caps)
  - `tracking-[0.2em]` (wide letter spacing)
  - `/80` opacity modifier for subtlety

## Customization
- Swap `Space Mono` for `JetBrains Mono`, `Fira Code`, or `IBM Plex Mono`
- Increase tracking to `0.3em` or `0.4em` for more spread-out labels
- Use `font-bold` instead of `font-light` for stronger emphasis
- Add a bottom border or underline for tab-like labels
- Combine with gradient text for a more decorative label
- Use `text-foreground-muted` (#94A3B8) for neutral labels instead of brand colors

## Dependencies
- Space Mono font (loaded via Next.js `--font-space-mono` variable, or any monospace font)
