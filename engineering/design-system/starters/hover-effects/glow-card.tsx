/**
 * ============================================================
 * Starter: Glow Card
 * ============================================================
 * Pattern:  Mouse-tracking glow border card
 * Source:   OphidianAI spotlight-card.tsx
 *
 * Customize:
 *   - CSS custom properties in glow-card.css (--glow-base, --glow-spread, etc.)
 *   - --border-size, --spotlight-size, --radius on the .glow-card class
 *
 * Reference: engineering/design-system/starters/hover-effects/glow-card.css
 *
 * Usage: Copy both glow-card.tsx and glow-card.css into your project.
 *        Import the CSS in your global stylesheet or layout.
 * ============================================================
 */

"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export type GlowCardProps = React.HTMLAttributes<HTMLDivElement>;

const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ children, className = "", ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => internalRef.current!);

    useEffect(() => {
      const syncPointer = (e: PointerEvent) => {
        const el = internalRef.current;

        if (el) {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          el.style.setProperty("--x", x.toFixed(2));
          el.style.setProperty(
            "--xp",
            (e.clientX / window.innerWidth).toFixed(2)
          );
          el.style.setProperty("--y", y.toFixed(2));
          el.style.setProperty(
            "--yp",
            (e.clientY / window.innerHeight).toFixed(2)
          );
        }
      };

      document.addEventListener("pointermove", syncPointer);
      return () => document.removeEventListener("pointermove", syncPointer);
    }, []);

    return (
      <div
        ref={internalRef}
        data-glow
        className={`glow-card ${className}`}
        {...props}
      >
        <div data-glow aria-hidden="true" />
        {children}
      </div>
    );
  }
);

GlowCard.displayName = "GlowCard";

export { GlowCard };
