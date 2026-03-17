# OphidianAI Website Rebuild Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the OphidianAI marketing website with a LAVA-dental-inspired layout, organic nature-AI theme, and scroll-driven video hero.

**Architecture:** Single-page marketing site rebuilt within the existing Next.js 16 + Tailwind 4 project. New section components replace existing ones on the homepage. Dashboard routes, API routes, auth, and admin are untouched. GSAP ScrollTrigger drives the hero shrink animation. All imagery sourced from the existing nature-gallery asset folder.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, GSAP + ScrollTrigger, Framer Motion, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-15-ophidianai-website-rebuild-design.md`

**Project Root:** `engineering/projects/ophidian-ai/`

---

## File Structure

### New Files to Create
| File | Purpose |
|------|---------|
| `src/components/sections/HeroVideo.tsx` | Scroll-shrink video hero (States 1-3) |
| `src/components/sections/MissionStatement.tsx` | Word-by-word scroll-animated tagline |
| `src/components/sections/ImageCarousel.tsx` | Horizontal auto-scrolling nature gallery |
| `src/components/sections/Manifesto.tsx` | Image collage + mission copy (sage bg) |
| `src/components/sections/ProcessOrbit.tsx` | Interactive SVG orbit diagram |
| `src/components/sections/BrandStatement.tsx` | Topographic bg + "That's us" text |
| `src/components/sections/PortfolioGrid.tsx` | Project showcase card grid |
| `src/components/sections/ServicesGrid.tsx` | LAVA-style services cards + list rows |
| `src/components/ui/stagger-testimonials.tsx` | StaggerTestimonials component |
| `src/components/sections/PricingTabs.tsx` | Tabbed pricing section |
| `src/components/sections/FAQNested.tsx` | Nested grouped accordion FAQ |
| `src/components/sections/ContactSection.tsx` | Map + contact info |
| `src/components/layout/NavLava.tsx` | New sticky nav with anchor links |
| `src/components/layout/FooterLava.tsx` | Large logo footer with gold treatment |

### Files to Modify
| File | Change |
|------|--------|
| `src/app/globals.css` | Replace color palette, add Playfair Display, update theme vars |
| `src/app/layout.tsx` | Add Playfair Display font import, remove VideoBackground |
| `src/app/page.tsx` | Complete rewrite with new section components |
| `public/video/hero-card-video.mp4` | Already exists (copy from nature-gallery if needed) |

### Files NOT Touched (Dashboard Scope)
- `src/app/dashboard/**` -- all dashboard routes
- `src/app/checkout/**` -- checkout flow
- `src/app/sign-in/**`, `src/app/sign-up/**` -- auth pages
- `src/app/api/**` -- all API routes
- `src/components/dashboard/**` -- dashboard components
- `src/lib/supabase/**`, `src/lib/stripe*`, `src/middleware.ts` -- backend

---

## Chunk 1: Foundation (Theme + Layout)

### Task 1: Update Color Palette & Typography

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update globals.css with new organic palette**

Replace the existing `:root` / `@theme` color variables with:

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

@theme inline {
  --color-forest: #1B2E21;
  --color-forest-deep: #0F1F14;
  --color-sage: #D4DFD0;
  --color-sage-light: #E8EDE5;
  --color-venom: #39FF14;
  --color-teal: #0DB1B2;
  --color-gold: #C4A265;
  --color-text-light: #F1F5F9;
  --color-text-muted: #94A3B8;
  --color-text-dark: #1B2E21;
  --color-border-subtle: rgba(255,255,255,0.08);

  --font-display: 'Playfair Display', serif;
}
```

Keep all existing animation keyframes and utility classes that dashboard components may depend on. Only replace color variables and add the new ones. Add new utility classes for the organic theme:

```css
.bg-forest { background-color: var(--color-forest); }
.bg-forest-deep { background-color: var(--color-forest-deep); }
.bg-sage { background-color: var(--color-sage); }
.bg-sage-light { background-color: var(--color-sage-light); }
.text-venom { color: var(--color-venom); }
.text-gold { color: var(--color-gold); }
.font-display { font-family: var(--font-display); }
```

- [ ] **Step 2: Update layout.tsx to add Playfair Display font**

Add the Playfair Display import alongside Inter and Space Mono:

```tsx
import { Inter, Space_Mono, Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});
```

Add `${playfair.variable}` to the body className. Remove the `<VideoBackground />` component from the layout (the new hero handles its own video).

- [ ] **Step 3: Verify build passes**

Run: `cd engineering/projects/ophidian-ai && npm run build`
Expected: Build succeeds. Dashboard pages unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: update color palette to organic forest theme, add Playfair Display"
```

---

### Task 2: Build New Navigation

**Files:**
- Create: `src/components/layout/NavLava.tsx`

- [ ] **Step 1: Create NavLava component**

Sticky top nav with transparent bg that gains a backdrop-blur on scroll. Logo left, anchor links center, CTA button right.

```tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function NavLava() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Find active section
      const sections = NAV_LINKS.map(l => l.href.slice(1));
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-forest-deep/80 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo_icon.png"
            alt="OphidianAI"
            width={40}
            height={40}
          />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={cn(
                  "text-sm tracking-wide transition-colors",
                  activeSection === href.slice(1)
                    ? "text-text-light border-b border-venom pb-1"
                    : "text-text-muted hover:text-text-light"
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="hidden md:inline-flex px-6 py-2.5 rounded-full text-sm font-medium bg-venom text-forest-deep hover:bg-venom/90 transition-colors"
        >
          Get Started
        </a>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/NavLava.tsx
git commit -m "feat: add LAVA-inspired sticky navigation with anchor links"
```

---

### Task 3: Build New Footer

**Files:**
- Create: `src/components/layout/FooterLava.tsx`

- [ ] **Step 1: Create FooterLava component**

Large logo with gold treatment, 4-column grid (Contacts, Address, Hours, Social), copyright.

```tsx
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export function FooterLava() {
  return (
    <footer id="contact-footer" className="bg-forest-deep">
      {/* Large logo */}
      <div className="flex items-center justify-center py-24 border-b border-white/5">
        <div className="text-center">
          <h2
            className="text-6xl md:text-8xl font-display tracking-[0.3em] uppercase"
            style={{ color: "var(--color-gold)" }}
          >
            OphidianAI
          </h2>
          <p
            className="mt-4 text-lg tracking-[0.2em] uppercase"
            style={{ color: "var(--color-gold)", opacity: 0.7 }}
          >
            Intelligence. Engineered.
          </p>
        </div>
      </div>

      {/* Info grid */}
      <div className="max-w-[1400px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-sm font-display tracking-wider uppercase text-text-light mb-4">
            Contacts
          </h3>
          <div className="space-y-3 text-text-muted text-sm">
            <a href="tel:+18125551234" className="flex items-center gap-2 hover:text-text-light transition-colors">
              <Phone className="w-4 h-4" /> (812) 555-1234
            </a>
            <a href="mailto:eric@ophidianai.com" className="flex items-center gap-2 hover:text-text-light transition-colors">
              <Mail className="w-4 h-4" /> eric@ophidianai.com
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-display tracking-wider uppercase text-text-light mb-4">
            Address
          </h3>
          <div className="text-text-muted text-sm space-y-1">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Columbus, Indiana
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-display tracking-wider uppercase text-text-light mb-4">
            Working Hours
          </h3>
          <div className="text-text-muted text-sm space-y-1">
            <p>Monday - Friday: 9:00 - 18:00</p>
            <p>Saturday - Sunday: Closed</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-display tracking-wider uppercase text-text-light mb-4">
            Connect
          </h3>
          <div className="text-text-muted text-sm space-y-2">
            <a href="https://facebook.com" className="block hover:text-text-light transition-colors">Facebook</a>
            <a href="https://instagram.com" className="block hover:text-text-light transition-colors">Instagram</a>
            <a href="https://linkedin.com" className="block hover:text-text-light transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 py-6 text-center text-text-muted text-xs">
        <p>2026 OphidianAI</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/FooterLava.tsx
git commit -m "feat: add LAVA-inspired footer with gold logo treatment"
```

---

## Chunk 2: Hero System

### Task 4: Build Scroll-Shrink Video Hero

**Files:**
- Create: `src/components/sections/HeroVideo.tsx`

This is the most complex component. Three states driven by GSAP ScrollTrigger:
1. Full viewport video with overlay text
2. Video shrinks to ~72% with border-radius
3. Tagline "Intelligence. Engineered." fades in word-by-word

- [ ] **Step 1: Create HeroVideo component**

```tsx
"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the container for the scroll animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          pin: true,
        },
      });

      // State 2: Shrink video from 100% to 72%
      tl.to(
        videoRef.current,
        {
          scale: 0.72,
          borderRadius: "16px",
          duration: 0.5,
        },
        0
      );

      // Fade out overlay text
      tl.to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.3,
        },
        0
      );

      // State 3: Fade in tagline words
      const words = taglineRef.current?.querySelectorAll(".tagline-word");
      if (words) {
        tl.fromTo(
          words,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.3,
          },
          0.4
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen bg-forest overflow-hidden">
      {/* Video container */}
      <div
        ref={videoRef}
        className="absolute inset-0 overflow-hidden origin-center"
        style={{ willChange: "transform, border-radius" }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/video/hero-card-video.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* Overlay content (State 1) */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-8"
      >
        <Image
          src="/images/logo_icon.png"
          alt="OphidianAI"
          width={80}
          height={80}
          className="mb-8"
        />
        <h1 className="text-4xl md:text-6xl font-display text-white mb-6">
          Ophidian<span className="text-venom">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-xl mb-10 font-light">
          Where the natural world meets innovation.
        </p>
        <a
          href="#contact"
          className="px-8 py-3 rounded-full text-sm font-medium bg-venom text-forest-deep hover:bg-venom/90 transition-colors"
        >
          Get Started
        </a>
      </div>

      {/* Tagline (State 3) */}
      <div
        ref={taglineRef}
        className="absolute bottom-[10%] left-0 right-0 z-10 text-center px-8"
      >
        <p className="text-3xl md:text-5xl font-display italic text-text-light">
          <span className="tagline-word inline-block opacity-0">Intelligence.</span>{" "}
          <span className="tagline-word inline-block opacity-0">Engineered.</span>
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify hero-card-video.mp4 is in public/video/**

Check if `/public/video/hero-card-video.mp4` exists (it should from the explore). If not, copy from nature-gallery:

```bash
cp "engineering/references/inspiration/nature-gallery/landscapes/hero-card-video.mp4" "engineering/projects/ophidian-ai/public/video/hero-card-video.mp4"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HeroVideo.tsx
git commit -m "feat: add scroll-shrink video hero with GSAP ScrollTrigger"
```

---

## Chunk 3: Content Sections (About through Brand Statement)

### Task 5: Mission Statement Section

**Files:**
- Create: `src/components/sections/MissionStatement.tsx`

- [ ] **Step 1: Create MissionStatement component**

Word-by-word scroll animation using GSAP. Dark forest bg, Playfair Display.

```tsx
"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const WORDS = "We build intelligent systems that transform how businesses operate.".split(" ");

export function MissionStatement() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = containerRef.current?.querySelectorAll(".mission-word");
      if (!words) return;

      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-forest px-8 py-32"
    >
      <p className="text-3xl md:text-5xl lg:text-6xl font-display text-center leading-relaxed max-w-5xl">
        {WORDS.map((word, i) => (
          <span key={i} className="mission-word inline-block text-text-light mr-[0.3em]">
            {word}
          </span>
        ))}
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/MissionStatement.tsx
git commit -m "feat: add word-by-word scroll-animated mission statement"
```

---

### Task 6: Image Carousel

**Files:**
- Create: `src/components/sections/ImageCarousel.tsx`

- [ ] **Step 1: Create ImageCarousel component**

Horizontal auto-scrolling strip using CSS animation. Mixed-size images from nature gallery. Pause on hover.

```tsx
"use client";

import Image from "next/image";

const IMAGES = [
  { src: "/images/gallery/forest-mist.jpg", width: 520, height: 416, alt: "Forest mist" },
  { src: "/images/gallery/ferns.jpg", width: 300, height: 474, alt: "Ferns" },
  { src: "/images/gallery/mountains.jpg", width: 520, height: 362, alt: "Mountains" },
  { src: "/images/gallery/moss.jpg", width: 300, height: 300, alt: "Moss texture" },
  { src: "/images/gallery/snake.jpg", width: 410, height: 628, alt: "Serpent" },
  { src: "/images/gallery/marble.jpg", width: 300, height: 416, alt: "Marble" },
  { src: "/images/gallery/fjord.jpg", width: 520, height: 362, alt: "Fjord" },
  { src: "/images/gallery/bark.jpg", width: 300, height: 350, alt: "Bark texture" },
  { src: "/images/gallery/leaves.jpg", width: 410, height: 588, alt: "Leaves" },
];

export function ImageCarousel() {
  const doubled = [...IMAGES, ...IMAGES]; // For seamless loop

  return (
    <section className="bg-forest py-16 overflow-hidden">
      <div className="group relative">
        <div className="flex gap-4 animate-scroll-x group-hover:[animation-play-state:paused]">
          {doubled.map((img, i) => (
            <div
              key={i}
              className="flex-shrink-0 overflow-hidden rounded-lg"
              style={{ width: img.width / 1.5, height: img.height / 1.5 }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Closing statement */}
      <div className="max-w-4xl mx-auto text-center mt-24 px-8">
        <p className="text-2xl md:text-4xl font-display italic text-text-muted">
          So that your business thrives at every stage.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add scroll animation keyframe to globals.css**

```css
@keyframes scroll-x {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-scroll-x {
  animation: scroll-x 60s linear infinite;
}
```

- [ ] **Step 3: Copy nature gallery images to public/images/gallery/**

```bash
mkdir -p public/images/gallery
cp "../../references/inspiration/nature-gallery/landscapes/mila-del-monte-forest-8355748_1920.jpg" public/images/gallery/forest-mist.jpg
cp "../../references/inspiration/nature-gallery/landscapes/netti_nu_nu-ferns-7391561_1920.jpg" public/images/gallery/ferns.jpg
cp "../../references/inspiration/nature-gallery/landscapes/danny51chen-mountains-8292685_1920.jpg" public/images/gallery/mountains.jpg
cp "../../references/inspiration/nature-gallery/textures/ioa8320-moss-483206_1920.jpg" public/images/gallery/moss.jpg
cp "../../references/inspiration/nature-gallery/macro/davidclode-snake-8928741_1920.jpg" public/images/gallery/snake.jpg
cp "../../references/inspiration/nature-gallery/organic-forms/placidplace-marble-7841012_1920.jpg" public/images/gallery/marble.jpg
cp "../../references/inspiration/nature-gallery/landscapes/levandreea-fjord-7009076_1920.jpg" public/images/gallery/fjord.jpg
cp "../../references/inspiration/nature-gallery/textures/wyxina-bark-8526227_1920.jpg" public/images/gallery/bark.jpg
cp "../../references/inspiration/nature-gallery/macro/ruslansikunov-leaves-7262727_1920.jpg" public/images/gallery/leaves.jpg
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/ImageCarousel.tsx src/app/globals.css public/images/gallery/
git commit -m "feat: add horizontal auto-scrolling nature image carousel"
```

---

### Task 7: Manifesto Section

**Files:**
- Create: `src/components/sections/Manifesto.tsx`

- [ ] **Step 1: Create Manifesto component**

Sage bg with staggered image collage left, mission copy right. Similar to LAVA's foil-bg section.

```tsx
import Image from "next/image";

export function Manifesto() {
  return (
    <section className="bg-sage py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Row 1: Images + Copy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image collage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden">
                <Image
                  src="/images/gallery/forest-mist.jpg"
                  alt="Forest atmosphere"
                  width={410}
                  height={628}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden">
                <Image
                  src="/images/gallery/moss.jpg"
                  alt="Natural texture"
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="rounded-lg overflow-hidden">
                <Image
                  src="/images/gallery/marble.jpg"
                  alt="Organic forms"
                  width={300}
                  height={416}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden">
                <Image
                  src="/images/gallery/leaves.jpg"
                  alt="Natural detail"
                  width={410}
                  height={588}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-8">
            <p className="text-xl md:text-2xl text-text-dark leading-relaxed font-light">
              We believe technology should feel as natural as the world it was inspired by.
              OphidianAI builds intelligent systems that work with the organic rhythms of your
              business — not against them.
            </p>
            <p className="text-lg text-text-dark/70 leading-relaxed">
              Our approach connects the precision of artificial intelligence with the adaptability
              of nature. Every website, every automation, every integration is crafted to grow
              with you — not just serve you today.
            </p>
            <div className="w-16 h-px bg-gold" />
            <p className="text-lg text-text-dark/70 leading-relaxed">
              We want your experience working with us to feel effortless — personal,
              transparent, and with no unnecessary complexity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/Manifesto.tsx
git commit -m "feat: add manifesto section with image collage and mission copy"
```

---

### Task 8: Process Orbit

**Files:**
- Create: `src/components/sections/ProcessOrbit.tsx`

- [ ] **Step 1: Create ProcessOrbit component**

Interactive SVG orbit with 6 numbered points. Click to select. Venom green glow on active.

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    num: 1,
    title: "Discovery",
    desc: "We learn your business inside and out. Goals, audience, constraints — everything that shapes the right solution.",
  },
  {
    num: 2,
    title: "Strategy",
    desc: "A clear plan emerges. Technology choices, content structure, timeline — mapped out before a single line of code.",
  },
  {
    num: 3,
    title: "Design",
    desc: "Visual direction tailored to your brand. You see the design before we build, and you shape it until it's right.",
  },
  {
    num: 4,
    title: "Build",
    desc: "Fast, clean, production-grade development. Every pixel matches the design. Every interaction feels intentional.",
  },
  {
    num: 5,
    title: "Launch",
    desc: "Go live with confidence. Performance tested, SEO configured, analytics connected. Your digital presence, fully operational.",
  },
  {
    num: 6,
    title: "Grow",
    desc: "Post-launch optimization, content updates, and strategic improvements. We grow with your business, not just deliver and disappear.",
  },
];

export function ProcessOrbit() {
  const [active, setActive] = useState(0);

  // Calculate positions along a semicircular arc
  const getPosition = (index: number, total: number) => {
    const angle = (Math.PI * index) / (total - 1) - Math.PI;
    const rx = 340;
    const ry = 160;
    const cx = 400;
    const cy = 200;
    return {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  };

  return (
    <section className="bg-forest py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-light mb-20">
          Your path starts here
        </h2>

        {/* Orbit SVG */}
        <div className="relative max-w-[800px] mx-auto mb-16">
          <svg viewBox="0 0 800 400" className="w-full">
            {/* Arc path */}
            <ellipse
              cx="400"
              cy="200"
              rx="340"
              ry="160"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />

            {/* Connection lines between dots */}
            {STEPS.map((_, i) => {
              if (i === STEPS.length - 1) return null;
              const p1 = getPosition(i, STEPS.length);
              const p2 = getPosition(i + 1, STEPS.length);
              return (
                <line
                  key={`line-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Step dots */}
            {STEPS.map((step, i) => {
              const pos = getPosition(i, STEPS.length);
              const isActive = i === active;
              return (
                <g
                  key={step.num}
                  onClick={() => setActive(i)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? 24 : 18}
                    fill={isActive ? "var(--color-venom)" : "var(--color-forest-deep)"}
                    stroke={isActive ? "var(--color-venom)" : "rgba(255,255,255,0.2)"}
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={32}
                      fill="none"
                      stroke="var(--color-venom)"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill={isActive ? "var(--color-forest-deep)" : "var(--color-text-light)"}
                    fontSize="14"
                    fontWeight="600"
                  >
                    {step.num}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Active step content */}
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-display italic text-text-light mb-4">
            {STEPS[active].title}
          </h3>
          <p className="text-text-muted text-lg leading-relaxed">
            {STEPS[active].desc}
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ProcessOrbit.tsx
git commit -m "feat: add interactive process orbit with 6 steps"
```

---

### Task 9: Brand Statement

**Files:**
- Create: `src/components/sections/BrandStatement.tsx`

- [ ] **Step 1: Create BrandStatement component**

Full-screen dark section with topographic SVG pattern bg. Large "That's us" text with word fade. CTA.

```tsx
"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function BrandStatement() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = sectionRef.current?.querySelectorAll(".brand-word");
      if (!words) return;

      gsap.fromTo(
        words,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            end: "center center",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center bg-forest overflow-hidden"
    >
      {/* Topographic pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 1440 900" className="w-full h-full" preserveAspectRatio="none">
          {[...Array(12)].map((_, i) => (
            <path
              key={i}
              d={`M${-100 + i * 40},${450 + Math.sin(i) * 100} Q${360 + i * 20},${200 + i * 30} ${720 + i * 10},${400 + Math.cos(i) * 80} T${1540 + i * 20},${350 + i * 25}`}
              fill="none"
              stroke="var(--color-venom)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      {/* Text */}
      <div className="relative z-10 text-center px-8">
        <p className="text-4xl md:text-6xl lg:text-7xl font-display text-text-light leading-tight">
          <span className="brand-word inline-block">That&apos;s</span>{" "}
          <span className="brand-word inline-block">us</span>{" "}
          <span className="brand-word inline-block">&mdash;</span>{" "}
          <span className="brand-word inline-block">Ophidian</span>
          <span className="brand-word inline-block text-venom">AI</span>
          <span className="brand-word inline-block">.</span>
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-16 text-center">
        <p className="text-text-muted text-lg mb-8">
          Ready to bring your vision to life?
        </p>
        <a
          href="#contact"
          className="inline-flex px-8 py-3 rounded-full text-sm font-medium bg-venom text-forest-deep hover:bg-venom/90 transition-colors"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/BrandStatement.tsx
git commit -m "feat: add brand statement section with topographic pattern"
```

---

## Chunk 4: Portfolio, Services, Testimonials

### Task 10: Portfolio Grid

**Files:**
- Create: `src/components/sections/PortfolioGrid.tsx`

- [ ] **Step 1: Create PortfolioGrid component**

Card grid with project thumbnails, tags, hover effects. "Show more" toggle.

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const PROJECTS = [
  {
    title: "Bloomin' Acres",
    tags: ["Website"],
    image: "/images/portfolio/bloomin-acres-homepage.png",
    href: "/portfolio/bloomin-acres",
  },
  {
    title: "Point of Hope Church",
    tags: ["Website"],
    image: "/images/portfolio/point-of-hope-church-homepage.png",
    href: "/portfolio/point-of-hope-church",
  },
  // Placeholder cards for future projects
  {
    title: "Coming Soon",
    tags: ["AI Integration"],
    image: "/images/gallery/marble.jpg",
    href: "#",
  },
  {
    title: "Coming Soon",
    tags: ["SEO"],
    image: "/images/gallery/mountains.jpg",
    href: "#",
  },
  {
    title: "Coming Soon",
    tags: ["Website", "AI Integration"],
    image: "/images/gallery/ferns.jpg",
    href: "#",
  },
  {
    title: "Coming Soon",
    tags: ["Social Media"],
    image: "/images/gallery/fjord.jpg",
    href: "#",
  },
];

export function PortfolioGrid() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? PROJECTS : PROJECTS.slice(0, 4);

  return (
    <section id="portfolio" className="bg-sage py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-dark mb-16">
          Our work speaks for itself.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((project, i) => (
            <a
              key={i}
              href={project.href}
              className="group relative overflow-hidden rounded-lg bg-sage-light transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={600}
                  height={450}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-dark">{project.title}</h3>
                  <div className="flex gap-2 mt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-forest/10 text-forest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-text-dark/40 group-hover:text-venom transition-colors" />
              </div>
            </a>
          ))}
        </div>

        {PROJECTS.length > 4 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 rounded-full text-sm font-medium border-2 border-forest text-forest hover:bg-forest hover:text-text-light transition-colors"
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/PortfolioGrid.tsx
git commit -m "feat: add portfolio grid with project cards and show more toggle"
```

---

### Task 11: Services Grid

**Files:**
- Create: `src/components/sections/ServicesGrid.tsx`

- [ ] **Step 1: Create ServicesGrid component**

LAVA-style: 1 wide top card + 4 equal cards + text list rows below.

```tsx
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const PRIMARY_SERVICES = [
  {
    num: "01",
    title: "AI-Powered Websites",
    image: "/images/gallery/forest-mist.jpg",
    wide: true,
  },
  {
    num: "02",
    title: "SEO Services",
    image: "/images/gallery/mountains.jpg",
  },
  {
    num: "03",
    title: "Social Media Management",
    image: "/images/gallery/ferns.jpg",
  },
  {
    num: "04",
    title: "AI Integrations",
    image: "/images/gallery/snake.jpg",
  },
  {
    num: "05",
    title: "Consulting",
    image: "/images/gallery/marble.jpg",
  },
];

const SECONDARY_SERVICES = [
  { num: "06", title: "Website Maintenance" },
  { num: "07", title: "Content Writing" },
  { num: "08", title: "Analytics & Reporting" },
  { num: "09", title: "Workflow Automation" },
  { num: "10", title: "Brand Strategy" },
];

export function ServicesGrid() {
  const wide = PRIMARY_SERVICES.filter((s) => s.wide);
  const cards = PRIMARY_SERVICES.filter((s) => !s.wide);

  return (
    <section id="services" className="bg-sage py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-dark mb-16">
          Services
        </h2>

        {/* Wide card */}
        {wide.map((service) => (
          <div
            key={service.num}
            className="relative overflow-hidden rounded-lg mb-6 cursor-pointer group"
          >
            <div className="aspect-[3/1] overflow-hidden">
              <Image
                src={service.image}
                alt={service.title}
                width={1290}
                height={300}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
            <div className="absolute top-6 left-6 text-sage text-lg font-display">
              {service.num}
            </div>
            <div className="absolute top-6 right-6">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-venom transition-colors">
                <ArrowUpRight className="w-5 h-5 text-white group-hover:text-forest-deep" />
              </div>
            </div>
            <h3 className="absolute bottom-6 left-6 text-2xl md:text-3xl font-display text-white">
              {service.title}
            </h3>
          </div>
        ))}

        {/* 4-card grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {cards.map((service) => (
            <div
              key={service.num}
              className="relative overflow-hidden rounded-lg cursor-pointer group aspect-[3/4]"
            >
              <Image
                src={service.image}
                alt={service.title}
                width={600}
                height={820}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="absolute top-4 left-4 text-sage text-sm font-display">
                {service.num}
              </div>
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-venom transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white group-hover:text-forest-deep" />
                </div>
              </div>
              <h3 className="absolute bottom-4 left-4 right-4 text-lg font-display text-white">
                {service.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Secondary list rows */}
        <div className="border-t border-forest/10">
          {SECONDARY_SERVICES.map((service) => (
            <div
              key={service.num}
              className="flex items-center justify-between py-5 border-b border-forest/10 cursor-pointer group"
            >
              <div className="flex items-center gap-8">
                <span className="text-sm text-text-dark/40 font-mono">{service.num}</span>
                <h3 className="text-lg md:text-xl font-display text-text-dark group-hover:text-venom transition-colors">
                  {service.title}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full border border-forest/20 flex items-center justify-center group-hover:bg-venom group-hover:border-venom transition-colors">
                <ArrowUpRight className="w-4 h-4 text-text-dark/40 group-hover:text-forest-deep" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ServicesGrid.tsx
git commit -m "feat: add LAVA-style services grid with cards and list rows"
```

---

### Task 12: Stagger Testimonials

**Files:**
- Create: `src/components/ui/stagger-testimonials.tsx`

- [ ] **Step 1: Create stagger-testimonials component**

Copy the provided StaggerTestimonials component, updating colors to match the organic palette and testimonial content to reference OphidianAI.

Key changes from the provided component:
- Replace `bg-primary` with forest/venom green palette colors
- Update testimonial content from generic "COMPANY" to OphidianAI-specific
- Use avatar images from randomuser.me (already allowed in next.config.ts remote patterns)

- [ ] **Step 2: Create testimonials section wrapper**

Create a section wrapper that places the component with heading and dark bg:

```tsx
// In src/components/sections/TestimonialsStagger.tsx
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";

export function TestimonialsStagger() {
  return (
    <section className="bg-forest py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8 mb-16">
        <h2 className="text-3xl md:text-5xl font-display text-text-light">
          What our clients say
        </h2>
      </div>
      <StaggerTestimonials />
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/stagger-testimonials.tsx src/components/sections/TestimonialsStagger.tsx
git commit -m "feat: add stagger testimonials component with OphidianAI content"
```

---

## Chunk 5: Pricing, FAQ, Contact + Page Assembly

### Task 13: Pricing Tabs

**Files:**
- Create: `src/components/sections/PricingTabs.tsx`

- [ ] **Step 1: Create PricingTabs component**

Tabbed pricing section matching LAVA's layout. Tabs: Websites, SEO, Social Media, AI Services.

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const TABS = [
  {
    label: "Websites",
    title: "AI-Powered Website",
    price: "From $2,500",
    features: [
      "Custom design tailored to your brand",
      "Mobile-first responsive development",
      "SEO foundation and analytics setup",
      "Content management system",
      "Performance optimization",
      "30 days post-launch support",
    ],
  },
  {
    label: "SEO",
    title: "SEO Services",
    price: "From $200/mo",
    features: [
      "Technical SEO audit and fixes",
      "On-page optimization",
      "Google Business Profile setup",
      "Monthly performance reports",
      "Keyword research and strategy",
      "Local SEO optimization",
    ],
  },
  {
    label: "Social Media",
    title: "Social Media Management",
    price: "From $250/mo",
    features: [
      "Content calendar and strategy",
      "AI-assisted post creation",
      "Multi-platform publishing",
      "Community management",
      "Monthly analytics reports",
      "Brand voice development",
    ],
  },
  {
    label: "AI Services",
    title: "AI Integrations",
    price: "Custom",
    features: [
      "Workflow automation design",
      "Chatbot and voice agent setup",
      "CRM integration",
      "Custom AI tool development",
      "Training and documentation",
      "Ongoing maintenance and updates",
    ],
  },
];

export function PricingTabs() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="pricing" className="bg-sage py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-dark mb-4">
          Invest in your growth
        </h2>
        <p className="text-lg text-text-dark/60 mb-16 max-w-2xl">
          Clear, transparent pricing. Every project starts with a discovery conversation
          to understand your needs and define the right scope.
        </p>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-12">
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-medium transition-colors",
                i === activeTab
                  ? "bg-forest text-text-light"
                  : "bg-forest/10 text-text-dark hover:bg-forest/20"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <div className="bg-sage-light rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <h3 className="text-2xl font-display text-text-dark mb-2">
                {TABS[activeTab].title}
              </h3>
              <p className="text-3xl font-semibold text-venom">
                {TABS[activeTab].price}
              </p>
            </div>
          </div>
          <ul className="mt-8 space-y-4">
            {TABS[activeTab].features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-text-dark/80">
                <Check className="w-5 h-5 text-venom flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-text-dark/50 mt-8 text-center">
          Prices vary depending on scope and complexity.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/PricingTabs.tsx
git commit -m "feat: add tabbed pricing section"
```

---

### Task 14: Nested FAQ

**Files:**
- Create: `src/components/sections/FAQNested.tsx`

- [ ] **Step 1: Create FAQNested component**

Grouped accordion with nested questions. Matches LAVA's FAQ pattern.

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

const FAQ_GROUPS = [
  {
    title: "Services & Pricing",
    questions: [
      {
        q: "What services does OphidianAI offer?",
        a: "We build AI-powered websites, provide SEO services, manage social media, and develop custom AI integrations and automations for small businesses.",
      },
      {
        q: "How much does a website cost?",
        a: "Website projects start at $2,500 and vary based on scope, features, and complexity. Every project begins with a free discovery conversation.",
      },
      {
        q: "Do you offer monthly plans?",
        a: "Yes. SEO starts at $200/mo and social media management starts at $250/mo. We also offer website maintenance retainers.",
      },
    ],
  },
  {
    title: "Process & Timeline",
    questions: [
      {
        q: "How long does a website project take?",
        a: "Most websites are delivered in 2-4 weeks. Complex projects with custom AI integrations may take longer.",
      },
      {
        q: "What does the process look like?",
        a: "We follow a 6-step process: Discovery, Strategy, Design, Build, Launch, and Grow. You're involved at every stage.",
      },
      {
        q: "Do I own my website when it's done?",
        a: "Yes. You own 100% of your code, content, domain, and assets. No lock-in, no proprietary systems.",
      },
    ],
  },
  {
    title: "About OphidianAI",
    questions: [
      {
        q: "Where is OphidianAI located?",
        a: "We're based in Columbus, Indiana. We work with clients locally and remotely.",
      },
      {
        q: "Who is behind OphidianAI?",
        a: "OphidianAI was founded by Eric Lefler. We use AI-assisted workflows to deliver enterprise-quality work at small business prices.",
      },
      {
        q: "What makes you different from other agencies?",
        a: "We combine human creativity with AI efficiency. This means faster delivery, lower costs, and results that compete with agencies charging 5x more.",
      },
    ],
  },
];

export function FAQNested() {
  const [openGroup, setOpenGroup] = useState<number | null>(0);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <section id="faq" className="bg-sage py-24 md:py-32">
      <div className="max-w-[1000px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-dark mb-16">
          Before you start, you might want to know more.
        </h2>

        <div className="space-y-2">
          {FAQ_GROUPS.map((group, gi) => (
            <div key={group.title} className="border-b border-forest/10">
              {/* Group header */}
              <button
                onClick={() => setOpenGroup(openGroup === gi ? null : gi)}
                className="w-full flex items-center justify-between py-6 text-left"
              >
                <h3 className="text-xl font-display text-text-dark">
                  {group.title}
                </h3>
                {openGroup === gi ? (
                  <Minus className="w-5 h-5 text-text-dark/40" />
                ) : (
                  <Plus className="w-5 h-5 text-text-dark/40" />
                )}
              </button>

              {/* Questions */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openGroup === gi ? "max-h-[2000px] pb-4" : "max-h-0"
                )}
              >
                {group.questions.map((item) => {
                  const key = `${gi}-${item.q}`;
                  const isOpen = openQuestion === key;
                  return (
                    <div key={key} className="border-t border-forest/5">
                      <button
                        onClick={() => setOpenQuestion(isOpen ? null : key)}
                        className="w-full flex items-center justify-between py-4 pl-6 text-left"
                      >
                        <span className="text-text-dark/80">{item.q}</span>
                        <Plus
                          className={cn(
                            "w-4 h-4 text-text-dark/30 transition-transform flex-shrink-0 ml-4",
                            isOpen && "rotate-45"
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-200",
                          isOpen ? "max-h-[500px] pb-4" : "max-h-0"
                        )}
                      >
                        <p className="pl-6 pr-12 text-text-dark/60 leading-relaxed">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/FAQNested.tsx
git commit -m "feat: add nested accordion FAQ section"
```

---

### Task 15: Contact Section

**Files:**
- Create: `src/components/sections/ContactSection.tsx`

- [ ] **Step 1: Create ContactSection component**

Dark forest bg. Heading, contact details, simple contact form or CTA.

```tsx
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="bg-forest py-24 md:py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        <h2 className="text-3xl md:text-5xl font-display text-text-light mb-16">
          We are right here.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact info */}
          <div className="space-y-8">
            <p className="text-text-muted text-lg leading-relaxed">
              Ready to get started? Reach out and we'll set up a free discovery
              conversation to understand your needs.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-venom/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-venom" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Phone</p>
                  <a href="tel:+18125551234" className="text-text-light hover:text-venom transition-colors">
                    (812) 555-1234
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-venom/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-venom" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <a href="mailto:eric@ophidianai.com" className="text-text-light hover:text-venom transition-colors">
                    eric@ophidianai.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-venom/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-venom" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Location</p>
                  <p className="text-text-light">Columbus, Indiana</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-venom/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-venom" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Hours</p>
                  <p className="text-text-light">Monday - Friday: 9:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-forest-deep rounded-2xl p-8 md:p-12 border border-white/5 flex flex-col justify-center">
            <h3 className="text-2xl font-display text-text-light mb-4">
              Let's talk about your project
            </h3>
            <p className="text-text-muted mb-8 leading-relaxed">
              Book a free 30-minute discovery call. We'll discuss your goals,
              explore what's possible, and outline next steps — no pressure, no commitment.
            </p>
            <a
              href="mailto:eric@ophidianai.com?subject=Project%20Inquiry"
              className="inline-flex self-start px-8 py-3 rounded-full text-sm font-medium bg-venom text-forest-deep hover:bg-venom/90 transition-colors"
            >
              Start a Conversation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sections/ContactSection.tsx
git commit -m "feat: add contact section with info and CTA card"
```

---

### Task 16: Assemble New Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx with all new sections**

Replace the entire file with the new section layout:

```tsx
import { NavLava } from "@/components/layout/NavLava";
import { FooterLava } from "@/components/layout/FooterLava";
import { HeroVideo } from "@/components/sections/HeroVideo";
import { MissionStatement } from "@/components/sections/MissionStatement";
import { ImageCarousel } from "@/components/sections/ImageCarousel";
import { Manifesto } from "@/components/sections/Manifesto";
import { ProcessOrbit } from "@/components/sections/ProcessOrbit";
import { BrandStatement } from "@/components/sections/BrandStatement";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { TestimonialsStagger } from "@/components/sections/TestimonialsStagger";
import { PricingTabs } from "@/components/sections/PricingTabs";
import { FAQNested } from "@/components/sections/FAQNested";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <NavLava />
      <main>
        <HeroVideo />
        <MissionStatement />
        <ImageCarousel />
        <Manifesto />
        <ProcessOrbit />
        <BrandStatement />
        <PortfolioGrid />
        <ServicesGrid />
        <TestimonialsStagger />
        <PricingTabs />
        <FAQNested />
        <ContactSection />
      </main>
      <FooterLava />
    </>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd engineering/projects/ophidian-ai && npm run build`
Expected: Build succeeds. All new sections render. Dashboard routes unaffected.

- [ ] **Step 3: Run dev server and visually verify**

Run: `cd engineering/projects/ophidian-ai && npm run dev`
Open: http://localhost:3000
Verify: Hero video plays, scroll shrink works, all sections visible, nav anchor links work.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble new LAVA-inspired homepage with all sections"
```

---

## Chunk 6: Polish & QA

### Task 17: Visual Polish Pass

- [ ] **Step 1: Test responsive behavior at mobile (375px), tablet (768px), and desktop (1440px)**
- [ ] **Step 2: Fix any Tailwind class issues with the new color variables**
- [ ] **Step 3: Verify GSAP animations fire correctly (hero shrink, word fades)**
- [ ] **Step 4: Verify dashboard routes still work at /dashboard**
- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: responsive and animation polish for new homepage"
```

### Task 18: Final Build Verification

- [ ] **Step 1: Run production build**

Run: `cd engineering/projects/ophidian-ai && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Commit all remaining changes**
