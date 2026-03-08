# Web Builder

A conversational pipeline that builds client websites from discovery through deployment. Each phase adapts to the client's needs through targeted questions.

**Stack:** Next.js 15 + Tailwind CSS 4 + TypeScript + App Router + Vercel

## When to Use

Invoke this skill when:
- Building a new website for a client or for OphidianAI
- Starting a new web project from scratch
- Rebuilding or redesigning an existing site

## Architecture

Sites are built using **modular sections** -- reusable React components that accept props for content, variant, and styling. Pages are composed by selecting and arranging sections.

```
src/
  app/                 # App Router pages
  components/
    ui/                # Atoms: Button, Input, Badge, Icon, Container, Typography
    sections/          # Organisms: Hero, Features, Pricing, CTA, FAQ, etc.
    layout/            # Header, Footer, PageWrapper
  lib/                 # Utilities, config, types
  content/             # MDX blog posts (if blog selected)
  styles/              # Global CSS, custom properties
public/
  images/              # Optimized assets
  fonts/               # Self-hosted fonts (if applicable)
```

---

## Sub-Agent Dispatch Guide

Certain phases contain independent tasks that should be parallelized using `subagent-driven-development`. This section maps which phases benefit from sub-agents and how to split the work.

### Dispatch Points

| Phase | Parallelizable? | Sub-Agent Split |
|-------|----------------|-----------------|
| 1. Discovery | No | Conversational -- requires human input sequentially |
| 2. Scaffold | No | Sequential foundation -- everything else depends on this |
| 3. Design System | **Yes** | 3 agents: (1) Base UI components, (2) Layout components (Nav, Footer, PageWrapper), (3) Global styles + CSS custom properties |
| 4. Page Building | **Partial** | Home page first (sequential, defines patterns). Then remaining pages in parallel batches of 2-3 agents per batch |
| 5. Integration | **Yes** | Up to 4 agents: (1) Stripe checkout, (2) Contact form + email, (3) Blog/MDX setup, (4) SEO + Analytics |
| 6. QA & Deploy | **Partial** | Screenshots + Lighthouse can run in parallel. Deploy is sequential. |

### Rules for Sub-Agent Dispatch

- **Always build Home page before other pages** -- it establishes the section patterns and visual language
- **Each agent gets a clear file scope** -- no two agents should modify the same file
- **Shared dependencies first** -- Phase 3 must complete before Phase 4 starts
- **Integration agents are fully independent** -- Stripe, forms, blog, and SEO touch different files
- **Use worktree isolation** when agents might conflict on shared config files

---

## Phase 1: Discovery

**Goal:** Understand the client, their brand, and what the site needs to do.

**Sub-agents:** None. This phase is conversational and sequential.

Ask these questions one at a time. Use multiple choice where possible.

### Questions

1. **Client & Industry**
   - Client name, industry, target audience
   - What does the business do? Who are they trying to reach?

2. **Brand Identity**
   - Do they have existing brand assets (logo, colors, fonts)?
   - If yes: collect brand guide or extract from existing materials
   - If no: propose a brand direction based on industry and tone

3. **Business Goals**
   - What is the primary goal of the site? (lead gen, e-commerce, SaaS, portfolio, informational)
   - What is the conversion action? (book a call, subscribe, buy, contact form)

4. **Features Needed** (checklist, multi-select)
   - Blog / Content marketing
   - Pricing page with tiers
   - Stripe checkout (self-serve payments)
   - Contact form
   - Calendly / scheduling embed
   - Analytics
   - Authentication / user accounts
   - Admin dashboard
   - SEO optimization
   - Newsletter signup

5. **Pages Needed** (checklist, multi-select)
   - Home
   - Services / Products
   - Pricing
   - About
   - Portfolio / Case Studies
   - Blog
   - Contact
   - FAQ
   - Custom pages (specify)

6. **Content Source**
   - Client provides all content
   - AI-generated (use website-copywriting skill)
   - Hybrid (client provides key info, AI writes copy)

7. **Conversion Model**
   - Sales funnel (CTAs lead to contact form or booking)
   - Self-serve checkout (Stripe)
   - Hybrid (lower tiers self-serve, higher tiers sales call)

**Output:** Site brief saved to `docs/site-brief.md` in the project root.

---

## Phase 2: Project Scaffold

**Goal:** Create a working Next.js project configured with the client's brand.

**Sub-agents:** None. This is foundational -- run sequentially.

### Steps

1. Create GitHub repo (or use existing)
2. Scaffold with `npx create-next-app@latest`:
   - TypeScript: yes
   - Tailwind CSS: yes
   - App Router: yes
   - ESLint: yes
   - `src/` directory: yes
3. Generate `tailwind.config.ts` from brand answers:
   - Colors (primary, accent, background, surface, text)
   - Fonts (display, body, mono)
   - Custom spacing or sizing if needed
4. Set up folder structure (see Architecture above)
5. Configure `vercel.json`:
   - Security headers (CSP, HSTS, X-Frame-Options, etc.)
   - Cache rules (images: 1 year, CSS/JS: 1 day + stale-while-revalidate)
6. Set up dev tooling:
   - Dev server: `npm run dev`
   - Screenshot script (adapted from Bloomin' Acres pattern: Puppeteer, 1440x900 @ 2x)
   - Image optimization script (Sharp: WebP conversion, max 1200px width)
7. Install dependencies:
   - Core: `next`, `react`, `react-dom`, `typescript`, `tailwindcss`
   - Dev tools: `puppeteer`, `sharp`
   - Integrations (as needed): `@stripe/stripe-js`, `stripe`, `@vercel/analytics`

**Output:** Working project that runs on `localhost:3000`

**Checkpoint:** Verify the dev server starts and shows the default page.

---

## Phase 3: Design System + Section Library

**Goal:** Build the component library that all pages will compose from.

**Sub-agents:** Yes -- dispatch 3 agents in parallel:
- **Agent 1 (UI Components):** Build all base components in `src/components/ui/` -- Button, Card, Input, Badge, Container, Heading, Text, Icon
- **Agent 2 (Layout Components):** Build NavMain, FooterMain, PageWrapper in `src/components/layout/`
- **Agent 3 (Global Styles):** Set up `src/styles/globals.css` with CSS custom properties, typography scale, animation utilities, and grain/texture overlays

Each agent gets a distinct directory scope. No file conflicts.

### Base Components (ui/)

| Component | Variants | Purpose |
|-----------|----------|---------|
| Button | primary, secondary, ghost, CTA | All interactive actions |
| Card | content, feature, testimonial | Content containers |
| Input | text, email, textarea, select | Form elements |
| Badge | default, accent | Labels and tags |
| Container | default, narrow, wide | Content width wrapper |
| Heading | h1-h6, display | Typography |
| Text | body, small, label | Typography |
| Icon | various | SVG icon wrapper |

### Layout Components (layout/)

| Component | Purpose |
|-----------|---------|
| NavMain | Responsive header navigation with mobile menu |
| FooterMain | Site footer with links, social, legal |
| PageWrapper | Consistent page structure (nav + content + footer) |

### Section Library (sections/)

Build sections as needed per page. Each section is a React component with typed props.

| Section | Description | Common On |
|---------|-------------|-----------|
| HeroMain | Full-width hero with headline, subtitle, CTA, optional background | Home |
| HeroSimple | Smaller page header with title and optional breadcrumb | Interior pages |
| FeaturesGrid | 3-4 column cards showcasing features or services | Home, Services |
| FeaturesAlternating | Left/right alternating image + text blocks | Services |
| PricingTable | Tiered comparison table with feature checklist | Pricing |
| PricingCards | Side-by-side plan cards with CTA buttons | Pricing |
| TestimonialCarousel | Client quotes with attribution | Home, About |
| CaseStudyCard | Portfolio project preview with image and metrics | Portfolio |
| CTABanner | Full-width call-to-action strip | Any page (bottom) |
| CTAInline | Inline CTA within content flow | Blog, Services |
| FAQAccordion | Expandable question/answer pairs | FAQ, Pricing |
| ContactForm | Multi-field form with validation and server action | Contact |
| CalendlyEmbed | Embedded scheduling widget (lazy loaded) | Contact, Pricing |
| BlogPostGrid | Post preview cards in responsive grid | Blog index |
| BlogPostContent | MDX-rendered article with typography styles | Blog post |
| StatsBar | Key metrics/numbers in a horizontal row | Home, About |
| TeamGrid | Team member cards with photo, name, role | About |
| LogoCloud | Client or partner logos in a row | Home |
| ProcessSteps | Numbered step-by-step flow visualization | Services, About |
| NewsletterSignup | Email capture with CTA | Any page |

**Build order:** Start with sections needed for the Home page, expand as other pages are built.

**Output:** Component library with all sections rendering correctly.

**Checkpoint:** Verify all components render without errors. Screenshot the preview.

---

## Phase 4: Page Building

**Goal:** Compose each page from the section library.

**Sub-agents:** Partial. Build the Home page first (sequential) -- it establishes the visual patterns and section usage. Then dispatch remaining pages in parallel batches:
- **Batch 1 (high priority):** Services, Pricing, Contact (3 agents)
- **Batch 2 (lower priority):** About, Portfolio, Blog, FAQ (up to 4 agents)

Each agent gets a single page. Content generation can be delegated to the `website-copywriting` skill within each agent.

### Process (per page)

1. **Select sections:** Ask which sections this page needs from the library
2. **Order sections:** Confirm the section arrangement
3. **Content:** Either:
   - Use client-provided content
   - Invoke `website-copywriting` skill to generate copy
   - Use placeholder content (mark for replacement)
4. **Build:** Compose the page by importing and configuring sections
5. **Screenshot:** Capture the page for review
6. **Review:** Checkpoint -- does this look right? Iterate if needed.

### Page Priority Order

Build in this order (highest conversion impact first):

1. **Home** -- first impression, primary conversion page
2. **Services** -- detail what the business offers
3. **Pricing** -- drive signups/purchases
4. **Contact** -- capture leads
5. **About** -- build trust and credibility
6. **Portfolio** -- showcase past work
7. **Blog** -- SEO and thought leadership
8. **FAQ** -- handle objections, reduce support load

**Output:** Complete, content-filled pages.

---

## Phase 5: Integration

**Goal:** Wire up the features selected in Discovery.

**Sub-agents:** Yes -- dispatch up to 4 agents in parallel. Each integration touches distinct files:
- **Agent 1 (Payments):** Stripe checkout -- `src/app/api/stripe/`, pricing page components
- **Agent 2 (Forms):** Contact form server action -- `src/app/api/contact/`, ContactForm section
- **Agent 3 (Blog):** MDX setup -- `src/content/`, `src/app/blog/`, BlogPostGrid, BlogPostContent
- **Agent 4 (SEO + Analytics):** Metadata API, `sitemap.ts`, `robots.ts`, JSON-LD, Vercel Analytics in root layout

### Integration Reference

| Feature | Package | Implementation |
|---------|---------|---------------|
| Stripe checkout | `@stripe/stripe-js`, `stripe` | API routes in `app/api/stripe/`, client-side Stripe.js |
| Contact form | (built-in) | Server action → email via Resend or Gmail API |
| Blog | `@next/mdx`, `gray-matter` | MDX files in `content/`, dynamic routes in `app/blog/` |
| Analytics | `@vercel/analytics` | Add `<Analytics />` to root layout |
| SEO | (built-in) | Next.js Metadata API, `sitemap.ts`, `robots.ts`, JSON-LD |
| Calendly | (embed script) | Lazy-loaded iframe component |
| Auth | `next-auth` or `@supabase/supabase-js` | Only if user accounts are needed |
| Newsletter | (varies) | Mailchimp, ConvertKit, or custom API route |

### SEO Checklist

Reference: `operations/references/sops/seo-full-setup.md`

- [ ] Metadata on every page (title, description, OG tags)
- [ ] `sitemap.ts` generating dynamic sitemap
- [ ] `robots.ts` with allow/disallow rules
- [ ] JSON-LD structured data (Organization, Service, Article for blog)
- [ ] Canonical URLs
- [ ] Image alt text on all images
- [ ] Heading hierarchy (single H1 per page)

**Output:** All selected features working end-to-end.

**Checkpoint:** Test each integration manually.

---

## Phase 6: QA & Deploy

**Goal:** Validate quality and ship to production.

**Sub-agents:** Partial. QA checks can run in parallel:
- **Agent 1:** Screenshot all pages (desktop + mobile viewports)
- **Agent 2:** Run Lighthouse audit and fix any flagged issues
- Deploy steps are sequential after QA passes.

### QA Steps

1. **Screenshots:** Capture all pages at desktop (1440px) and mobile (375px) viewports
2. **Lighthouse audit:** Target scores:
   - Performance: >90
   - Accessibility: >95
   - SEO: 100
   - Best Practices: >95
3. **Go-live checklist:** Run through `operations/references/sops/go-live-checklist.md`
4. **Cross-browser:** Verify in Chrome, Firefox, Safari (at minimum)
5. **Responsive:** Test all breakpoints (mobile, tablet, desktop)
6. **Forms:** Submit test contact form, verify delivery
7. **Payments:** Run Stripe test checkout (if applicable)
8. **Links:** Verify all internal and external links work
9. **Image optimization:** Run optimization script, verify next/image usage

### Deploy

1. Connect repo to Vercel (or verify existing connection)
2. Set environment variables (Stripe keys, email config, etc.)
3. Deploy to preview URL first
4. Verify preview deployment
5. Promote to production
6. Configure custom domain (if ready)
7. Set up post-launch monitoring (`operations/references/sops/monitoring-setup.md`)

**Output:** Live, production-ready website.

---

## Audit Checkpoints

Audits run at the end of each phase and at key transition points. Each audit produces a structured report and blocks progress until issues are resolved.

### When to Audit

| Trigger | Audit Type |
|---------|-----------|
| End of Phase 2 (Scaffold) | **Foundation Audit** -- dev server runs, folder structure correct, Tailwind config matches brand, vercel.json headers present |
| End of Phase 3 (Design System) | **Component Audit** -- all planned components render without errors, barrel exports work, no TypeScript errors, consistent prop patterns |
| After Home page (Phase 4) | **Pattern Audit** -- visual consistency, section composition works, responsive at all breakpoints, content is real (no lorem ipsum) |
| End of Phase 4 (All Pages) | **Content Audit** -- every page has real copy, no placeholder text, all internal links resolve, heading hierarchy correct (single H1), all images have alt text |
| End of Phase 5 (Integration) | **Integration Audit** -- every selected feature works end-to-end (forms send, payments process, blog renders, analytics fires, SEO metadata present on all pages) |
| End of Phase 6 (Pre-deploy) | **Production Audit** -- Lighthouse scores meet targets, go-live checklist complete, OG image exists, security headers verified, no console errors |

### Audit Report Format

Each audit produces a report saved to the project's reports folder:
- **OphidianAI site:** `docs/audits/YYYY-MM-DD-<phase>-audit.md`
- **Client projects:** `revenue/projects/active/<project>/reports/YYYY-MM-DD-<phase>-audit.md`

```markdown
# [Phase Name] Audit Report
**Date:** YYYY-MM-DD
**Phase:** [phase number and name]
**Status:** PASS / FAIL / PASS WITH WARNINGS

## Checks

| Check | Status | Notes |
|-------|--------|-------|
| [item] | PASS/FAIL/WARN | [details] |

## Issues Found
- [list of issues with severity: CRITICAL / WARNING / INFO]

## Actions Required
- [ ] [action items that must be resolved before proceeding]

## Score
[X/Y checks passed] -- [percentage]%
```

### Audit Follow-Up

Every audit is immediately followed by a **fix cycle**:

1. **Review the report** -- present findings to the user
2. **Triage issues** -- confirm which items to fix now vs defer vs intentionally remove
3. **Fix all CRITICAL items** -- these block progress unconditionally
4. **Fix or remove WARNING items** -- either resolve or make a deliberate decision to remove the feature/section
5. **Log INFO items** -- note for future improvement, no action required now
6. **Re-run affected checks** -- verify fixes resolved the issues
7. **Update the audit report** -- append a "Follow-Up" section with resolution status

Do not advance to the next phase until the follow-up is complete and all CRITICAL/WARNING items are resolved or intentionally deferred with user approval.

### Audit Rules

- **CRITICAL issues block progress** -- do not advance to the next phase until resolved
- **WARNING issues get logged** -- can proceed but must be resolved before Phase 6
- **INFO items are advisory** -- nice-to-have improvements
- **All audits are cumulative** -- later audits re-check items from earlier phases to catch regressions

---

## Related Skills & SOPs

| Resource | Path | Purpose |
|----------|------|---------|
| Website Copywriting | `.claude/skills/website-copywriting/SKILL.md` | Generate page content |
| SEO Audit | `.claude/skills/seo-audit/SKILL.md` | Validate SEO setup |
| Go-Live Checklist | `operations/references/sops/go-live-checklist.md` | Launch validation |
| SEO Setup | `operations/references/sops/seo-full-setup.md` | SEO implementation |
| Monitoring | `operations/references/sops/monitoring-setup.md` | Post-launch monitoring |
| Brand Assets | `shared/brand-assets/` | Logo, brand guide |
