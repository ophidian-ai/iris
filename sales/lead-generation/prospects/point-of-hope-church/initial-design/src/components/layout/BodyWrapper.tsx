"use client";

import { type ReactNode } from "react";

interface BodyWrapperProps {
  children: ReactNode;
}

export default function BodyWrapper({ children }: BodyWrapperProps) {
  return (
    <div className="relative" style={{ backgroundColor: "#1a3a12" }}>
      {/* Fixed video background -- forest sunlight */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <source src="/forest-sunlight.mp4" type="video/mp4" />
      </video>

      {/* Subtle dark overlay for content readability */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1, backgroundColor: "rgba(26, 58, 18, 0.3)" }}
        aria-hidden="true"
      />

      {/* Page content rendered above the background */}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
