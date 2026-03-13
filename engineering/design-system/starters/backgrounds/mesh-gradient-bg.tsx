/**
 * ============================================================
 * Starter: Mesh Gradient Background
 * ============================================================
 * Pattern:  Full-viewport animated mesh gradient using WebGL shaders
 * Source:   OphidianAI mesh-gradient-bg.tsx
 *
 * Customize:
 *   colors       Array of 6 hex color strings for the gradient mesh.
 *   distortion   Mesh distortion amount (0-1). Default 0.8.
 *   swirl        Swirl intensity (0-1). Default 0.6.
 *   speed        Animation speed. Default 0.42.
 *   offsetX      Horizontal offset. Default 0.08.
 *   veilClass    CSS class applied to the overlay div on top of the
 *                shader (e.g. a semi-transparent background). Pass any
 *                valid class string. Default "".
 *   className    Additional classes on the outer container.
 *
 * Dependencies:
 *   - @paper-design/shaders-react (npm install @paper-design/shaders-react)
 *
 * Reference: https://github.com/nicoptere/paper-design-shaders
 * ============================================================
 */

"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

interface MeshGradientBgProps {
  className?: string;
  /** Six hex color strings for the mesh gradient */
  colors?: string[];
  /** Distortion amount (0-1) */
  distortion?: number;
  /** Swirl intensity (0-1) */
  swirl?: number;
  /** Animation speed */
  speed?: number;
  /** Horizontal offset */
  offsetX?: number;
  /**
   * CSS class for the veil overlay on top of the shader.
   * Use this to tint or dim the gradient (e.g. "bg-black/70").
   */
  veilClass?: string;
}

export function MeshGradientBg({
  className = "",
  colors = [
    "#6366f1",
    "#4f46e5",
    "#1e1b4b",
    "#312e81",
    "#06b6d4",
    "#0891b2",
  ],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  veilClass = "",
}: MeshGradientBgProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      className={`fixed inset-0 w-screen h-screen z-0 ${className}`}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 0 }}
    >
      {mounted && (
        <>
          <MeshGradient
            width={dimensions.width}
            height={dimensions.height}
            colors={colors}
            distortion={distortion}
            swirl={swirl}
            grainMixer={0}
            grainOverlay={0}
            speed={speed}
            offsetX={offsetX}
          />
          {veilClass && (
            <div
              className={`absolute inset-0 pointer-events-none ${veilClass}`}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            />
          )}
        </>
      )}
    </div>
  );
}
