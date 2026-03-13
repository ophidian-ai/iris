---
name: Word-by-Word Reveal
category: animations
complexity: moderate
dependencies: css-custom-properties, vanilla-js
best-for: tech, saas, agency, dark-themes, landing-pages
performance: "Lightweight -- CSS keyframes with JS-triggered delays. No layout thrash. Each word is a separate inline-block element."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Word-by-Word Reveal

## What It Does
Each word in a text block fades in individually with a combined translateY, scale, and blur animation, creating a cascading reveal effect from blurred/offset to crisp/aligned.

## When to Use
- Hero headlines and taglines
- Landing page opening statements
- Any text that benefits from dramatic entrance timing
- Pairs well with dark backgrounds and glowing text

## Visual Effect
Words start invisible, scaled down to 0.8, shifted 30px below their final position, and blurred at 10px. They animate through a midpoint (0.8 opacity, 10px offset, slight blur) before landing at their final crisp, full-size position. Each word triggers after a staggered delay, creating a wave-like reading cadence.

## Code Reference
**Starter component:** None

## Key Implementation Details

- The `@keyframes word-appear` animation in `globals.css`:

```css
@keyframes word-appear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
    filter: blur(10px);
  }
  50% {
    opacity: 0.8;
    transform: translateY(10px) scale(0.95);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
```

- Each word is wrapped in a `<span class="word" data-delay="N">` where N is the millisecond delay
- Words start with `opacity: 0` and `display: inline-block` via the `.word` class
- JavaScript reads `data-delay` and applies the animation after a `setTimeout`:

```js
const words = container.querySelectorAll<HTMLElement>(".word");
words.forEach((word) => {
  const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
  setTimeout(() => {
    word.style.animation = "word-appear 0.5s ease-out forwards";
  }, delay);
});
```

- The `renderWords` helper calculates delays from a `baseDelay` and `delayStep` per word:

```tsx
const renderWords = (words: string[], baseDelay: number, delayStep: number) =>
  words.map((word, i) => (
    <span key={i} className="word" data-delay={baseDelay + i * delayStep}>
      {word}{" "}
    </span>
  ));
```

- In the OphidianAI hero, stagger values are: tagline (0ms base, 80ms step), headline (600ms base, 60ms step), subline (1300ms base, 50ms step), bottom (2000ms base, 70ms step)

## Customization
- Adjust `baseDelay` and `delayStep` to control pacing (lower step = faster cascade)
- Change the blur amount in keyframes for subtler or more dramatic reveals
- Swap `translateY(30px)` for `translateX` for horizontal reveals
- Scale values can be removed for a simpler fade-up variant
- Works with any font size -- the pixel offsets are absolute, so larger text may need larger translateY values

## Dependencies
- None -- CSS keyframes + vanilla JS only
