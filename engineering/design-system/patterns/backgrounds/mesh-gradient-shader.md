---
name: Mesh Gradient Shader
category: backgrounds
complexity: advanced
dependencies: "@paper-design/shaders-react"
best-for: tech, saas, agency, dark-themes, landing-pages, hero-sections
performance: "WebGL canvas shader -- runs on GPU. Resize listener updates dimensions. Veil overlay softens intensity. Avoid stacking multiple instances."
source-project: ophidian-ai
last-validated: 2026-03-13
---

# Mesh Gradient Shader

## What It Does
A fullscreen animated mesh gradient rendered via WebGL shader, creating a slowly morphing, organic color field as a page backdrop.

## When to Use
- Full-page background behind all content
- Hero section backdrops
- Dark-themed sites that need ambient color movement
- Landing pages where visual richness matters

## Visual Effect
Multiple colors blend and distort in a mesh pattern, slowly swirling and shifting. The effect resembles aurora borealis or liquid color mixing. A semi-transparent veil overlay (default 70% background color) sits on top to maintain text readability while the gradient provides depth and movement underneath.

## Code Reference
**Starter component:** None

## Key Implementation Details

- Uses the `MeshGradient` component from `@paper-design/shaders-react`:

```tsx
import { MeshGradient } from "@paper-design/shaders-react";
```

- The wrapper component with configurable props:

```tsx
export function MeshGradientBg({
  colors = ["#39FF14", "#2BCC10", "#0D1B2A", "#162032", "#0DB1B2", "#098F90"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  veilOpacity = "bg-background/70",
}: MeshGradientBgProps) {
```

- Positioned as a fixed fullscreen layer at z-0:

```tsx
<div className="fixed inset-0 w-screen h-screen z-0">
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
  <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
</div>
```

- Dimensions track `window.innerWidth` and `window.innerHeight` via resize listener
- Component is client-only (`"use client"`) and uses `mounted` state to avoid SSR hydration mismatch
- Grain is disabled (`grainMixer: 0`, `grainOverlay: 0`) for clean rendering

## Customization
- `colors` array: 6 colors recommended. Use brand palette. More contrast between colors = more visible swirling.
- `distortion` (0-1): Higher values create more warped mesh shapes
- `swirl` (0-1): Controls rotational movement intensity
- `speed` (0-1): Lower = calmer ambient movement. 0.42 is a good default for subtle motion.
- `veilOpacity`: Tailwind opacity class. Increase to `bg-background/85` for better readability, decrease to `bg-background/50` for more visible gradient.
- `offsetX`: Shifts the gradient center horizontally

## Dependencies
- `@paper-design/shaders-react` -- WebGL shader library for React
