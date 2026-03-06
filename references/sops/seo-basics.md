# SEO Basics SOP (Starter Tier)

Included in every website OphidianAI delivers. Non-negotiable baseline.

---

## Pre-Launch Checklist

### Meta Tags

- [ ] Every page has a unique `<title>` tag (50-60 characters)
- [ ] Every page has a unique `<meta name="description">` (150-160 characters)
- [ ] Canonical URL set on every page (`<link rel="canonical">`)

### Semantic HTML

- [ ] One `<h1>` per page -- no more, no less
- [ ] Heading hierarchy follows logical order: h1 > h2 > h3 (no skipping levels)
- [ ] Use `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` where appropriate
- [ ] Lists use `<ul>` / `<ol>`, not styled `<div>` elements

### Images

- [ ] Every `<img>` has a descriptive `alt` attribute
- [ ] Images compressed (WebP preferred, fallback to optimized PNG/JPEG)
- [ ] Images sized to display dimensions (no 4000px images in 400px containers)
- [ ] Lazy loading enabled on below-the-fold images (`loading="lazy"`)

### Sitemap & Robots

- [ ] `sitemap.xml` generated and placed at site root
- [ ] Sitemap includes all public pages with correct `<lastmod>` dates
- [ ] `robots.txt` at site root with `Sitemap:` directive pointing to sitemap URL
- [ ] `robots.txt` allows crawling of all public pages
- [ ] No accidental `Disallow: /` blocking the entire site

### Open Graph Tags

Every page includes at minimum:

- [ ] `og:title` -- matches or closely mirrors the page title
- [ ] `og:description` -- matches or closely mirrors the meta description
- [ ] `og:image` -- 1200x630px recommended; absolute URL
- [ ] `og:url` -- canonical URL of the page
- [ ] `og:type` -- `website` for homepage, `article` for blog posts

### URL Structure

- [ ] All URLs lowercase
- [ ] Words separated by hyphens (not underscores)
- [ ] No query strings in public-facing page URLs
- [ ] No trailing slashes (or consistent trailing slashes -- pick one)
- [ ] Short and descriptive: `/services/web-design` not `/page?id=42&cat=3`

### Mobile & Performance

- [ ] Site is fully responsive across phone, tablet, desktop
- [ ] Lighthouse mobile score 90+ (Performance, Accessibility, Best Practices, SEO)
- [ ] CSS and JS minified in production
- [ ] No render-blocking resources in critical path (or properly deferred)
- [ ] Font loading optimized (`font-display: swap`)

### Internal Linking

- [ ] Every page is reachable within 3 clicks from the homepage
- [ ] Navigation includes links to all primary pages
- [ ] Footer includes links to key pages (services, contact, privacy)
- [ ] No orphan pages (pages with zero internal links pointing to them)

### Canonical URLs

- [ ] Every page has a self-referencing canonical tag
- [ ] No duplicate pages without canonical pointing to the preferred version
- [ ] Canonical URLs use the same protocol (https) and domain format consistently

---

## Verification

Run these checks before handoff:

1. **Lighthouse audit** -- All four categories 90+ on mobile
2. **Manual review** -- Spot-check 3-5 pages for meta tags, headings, alt text
3. **Sitemap validation** -- Open `sitemap.xml` in browser, confirm all pages listed
4. **Robots.txt check** -- Confirm sitemap directive and no unintended blocks
5. **Social preview** -- Test share preview on Facebook Sharing Debugger or similar tool
6. **Mobile spot-check** -- Load site on actual phone, verify layout and tap targets
