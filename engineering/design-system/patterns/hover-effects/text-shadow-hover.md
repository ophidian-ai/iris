---
name: Text Shadow Hover
category: hover-effects
complexity: simple
dependencies: vanilla-js
best-for: tech, saas, agency, dark-themes, hero-text, headings
performance: "Single text-shadow property change. Virtually zero cost."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Text Shadow Hover

## What It Does
Text gains a colored glow shadow on hover, creating a neon-like highlight effect on individual words or text elements.

## When to Use
- Hero headline words (especially with word-by-word reveal)
- Navigation links
- CTAs and interactive text elements
- Any text on a dark background that benefits from a glow highlight

## Visual Effect
When the cursor hovers over a word, a green glow shadow (20px blur radius, 50% opacity) appears behind the text, creating a neon backlight effect. The glow fades on mouse leave. Combined with the `.word` class transition, the effect is smooth at 0.3 seconds.

## Code Reference
**Starter component:** None

## Key Implementation Details

- The `.word` class includes a transition for text-shadow:

```css
.word {
  display: inline-block;
  opacity: 0;
  margin-right: 0.3em;
  transition: text-shadow 0.3s ease;
  cursor: default;
}
```

- JavaScript applies the glow on hover via event listeners:

```js
words.forEach((word) => {
  word.addEventListener("mouseenter", () => {
    word.style.textShadow = "0 0 20px rgba(57, 255, 20, 0.5)";
  });
  word.addEventListener("mouseleave", () => {
    word.style.textShadow = "none";
  });
});
```

- The glass button text also uses a persistent (non-hover) text-shadow glow:

```css
.glass-button-text {
  text-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
}
```

## Customization
- Increase blur radius (20px) for a softer, wider glow
- Increase opacity (0.5) for a brighter glow
- Use CSS-only approach with `:hover` pseudo-class instead of JS for simpler cases:

```css
.glow-text:hover {
  text-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
}
```

- Layer multiple shadows for a more intense effect: `0 0 10px ..., 0 0 30px ..., 0 0 60px ...`
- Use `var(--color-accent)` for a teal glow variant
- Add to links with `cursor: pointer` for interactive text

## Dependencies
- Vanilla JS for the event-listener approach (or CSS-only with `:hover`)
