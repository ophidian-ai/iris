/**
 * ============================================================
 * Starter: Intersection Observer Utility
 * ============================================================
 * Pattern:  Reveal-on-scroll using IntersectionObserver
 * Source:   Bloomin' Acres index.js
 *
 * Customize:
 *   selector     CSS selector for elements to observe. Default ".animate-on-scroll".
 *   visibleClass Class added when element enters the viewport. Default "visible".
 *   threshold    Visibility threshold (0-1). Default 0.1.
 *   once         If true, stop observing after first reveal. Default true.
 *   root         Scroll container (null = viewport). Default null.
 *   rootMargin   Margin around root. Default "0px".
 *
 * Framework-agnostic -- works with plain HTML, React, Vue, etc.
 *
 * Usage (vanilla):
 *   import { initScrollReveal } from "./intersection-observer";
 *   document.addEventListener("DOMContentLoaded", () => {
 *     initScrollReveal({ selector: ".fade-up", visibleClass: "visible" });
 *   });
 *
 * Pair with CSS like:
 *   .fade-up { opacity: 0; transform: translateY(20px); transition: all 0.6s ease; }
 *   .fade-up.visible { opacity: 1; transform: translateY(0); }
 * ============================================================
 */

export interface ScrollRevealOptions {
  /** CSS selector for elements to observe */
  selector?: string;
  /** Class name added when the element enters the viewport */
  visibleClass?: string;
  /** Visibility ratio required to trigger (0-1) */
  threshold?: number;
  /** Stop observing after first reveal */
  once?: boolean;
  /** Scroll container element (null = viewport) */
  root?: Element | null;
  /** Margin around the root */
  rootMargin?: string;
}

/**
 * Initialize scroll-reveal observation on all elements matching `selector`.
 * Returns a cleanup function that disconnects the observer.
 */
export function initScrollReveal(options: ScrollRevealOptions = {}): () => void {
  const {
    selector = ".animate-on-scroll",
    visibleClass = "visible",
    threshold = 0.1,
    once = true,
    root = null,
    rootMargin = "0px",
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(visibleClass);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          entry.target.classList.remove(visibleClass);
        }
      });
    },
    { threshold, root, rootMargin }
  );

  document.querySelectorAll(selector).forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}

/**
 * Vanilla JS version -- call directly from a <script> tag.
 * Automatically runs on DOMContentLoaded.
 *
 * Usage:
 *   <script type="module">
 *     import { autoReveal } from "./intersection-observer.js";
 *     autoReveal(".fade-up", "visible", 0.1);
 *   </script>
 */
export function autoReveal(
  selector = ".animate-on-scroll",
  visibleClass = "visible",
  threshold = 0.1
): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initScrollReveal({ selector, visibleClass, threshold });
    });
  } else {
    initScrollReveal({ selector, visibleClass, threshold });
  }
}
