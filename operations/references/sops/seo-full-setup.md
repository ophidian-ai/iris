# SEO Full Setup SOP (Professional Tier)

Comprehensive SEO for clients who need search visibility. Includes everything in `seo-basics.md` plus the items below.

**Prerequisite:** Complete the entire SEO Basics checklist first.

---

## Keyword Research

### Process

1. Identify the client's core services and target location
2. Use Firecrawl to scrape 3-5 competitor sites in the same market
3. Extract keyword patterns from competitor titles, headings, meta descriptions, and body content
4. Compile a list of 5-10 target keywords per page
5. Build a keyword-to-page matrix mapping each keyword to exactly one page (no cannibalization)

### Keyword-to-Page Matrix Format

| Keyword | Search Intent | Assigned Page | Priority |
|---------|--------------|---------------|----------|
| columbus plumber | transactional | /services/plumbing | high |
| how to fix leaky faucet | informational | /blog/fix-leaky-faucet | medium |

### Rules

- [ ] Every page has a primary keyword and 2-4 secondary keywords
- [ ] No two pages target the same primary keyword
- [ ] Keywords reflect actual search intent (informational, transactional, navigational)
- [ ] Local keywords include city/region where applicable

---

## Schema Markup

### LocalBusiness Schema (for local businesses)

- [ ] Added to homepage or contact page as JSON-LD
- [ ] Includes: name, address, phone, hours, URL, geo coordinates, image
- [ ] `@type` is specific (e.g., `Dentist`, `Restaurant`, `AutoRepair`) not generic `LocalBusiness` when a more specific type exists

### Organization Schema

- [ ] Added to homepage
- [ ] Includes: name, URL, logo, social media links, contact info

### BreadcrumbList Schema

- [ ] Added to all pages with breadcrumb navigation
- [ ] Matches visible breadcrumb trail exactly

### FAQ Schema

- [ ] Added to any page with a dedicated FAQ section
- [ ] Each question/answer pair properly structured
- [ ] Content matches what is visible on the page (no hidden FAQ schema)

### Validation

- [ ] All schema passes Google Rich Results Test with no errors
- [ ] Test each schema type individually

---

## Google Search Console Setup

1. [ ] Create or access client's Google Search Console account
2. [ ] Verify domain ownership (DNS TXT record preferred)
3. [ ] Submit `sitemap.xml` URL
4. [ ] Set target country under International Targeting (if applicable)
5. [ ] Confirm pages are being indexed (Coverage report)
6. [ ] Check for any crawl errors and resolve
7. [ ] Document login credentials and share with client

### Ongoing (hand off to client or include in maintenance plan)

- Monitor indexing status weekly for first month
- Check for manual actions
- Review Core Web Vitals report

---

## Internal Linking Strategy

- [ ] Every page links to at least 2-3 other internal pages
- [ ] Service pages link to the contact page or primary CTA
- [ ] Blog posts link to relevant service pages
- [ ] Blog posts link to other related blog posts
- [ ] Anchor text is descriptive (not "click here")
- [ ] No broken internal links

### Link Flow Pattern

```
Homepage -> Service Pages -> Contact/CTA
Homepage -> Blog -> Related Service Pages
Blog Post -> Related Blog Posts
All Pages -> Contact (via nav + contextual links)
```

---

## Content Optimization

### Per-Page Checklist

- [ ] H1 contains the primary keyword (naturally, not stuffed)
- [ ] Primary keyword appears in the first 100 words
- [ ] Secondary keywords appear in H2s and body content where natural
- [ ] Minimum 300 words per page (excluding nav/footer)
- [ ] Image file names are descriptive (`columbus-office-exterior.webp` not `IMG_4392.jpg`)
- [ ] Image alt text includes keywords where relevant and natural
- [ ] Content answers the search intent behind the target keyword

### Content Rules

- No keyword stuffing -- write for humans first
- Every page should have a clear purpose and CTA
- Avoid thin pages (under 300 words with no media)
- Avoid duplicate or near-duplicate content across pages

---

## Technical SEO

### Structured Data

- [ ] All schema validated with Google Rich Results Test (zero errors)
- [ ] No warnings in structured data reports

### Core Web Vitals

- [ ] Largest Contentful Paint (LCP): under 2.5 seconds
- [ ] Cumulative Layout Shift (CLS): under 0.1
- [ ] Interaction to Next Paint (INP): under 200ms
- [ ] Test on both mobile and desktop via PageSpeed Insights

### Duplicate Content

- [ ] No two pages serve the same or substantially similar content
- [ ] www and non-www resolve to one version (301 redirect)
- [ ] http redirects to https (301 redirect)
- [ ] Trailing slash behavior is consistent

### Redirects

- [ ] 301 redirects in place from all old URLs to new equivalents (if rebuilding an existing site)
- [ ] No redirect chains (A -> B -> C; should be A -> C)
- [ ] No redirect loops
- [ ] Old sitemap URLs all resolve (either directly or via redirect)

### Final Technical Checks

- [ ] No 404 errors on internal links (crawl with Screaming Frog or similar)
- [ ] No mixed content warnings (http resources on https pages)
- [ ] HTML validates without critical errors
- [ ] No `noindex` tags on pages that should be indexed

---

## Delivery Checklist

Before marking SEO complete:

1. [ ] SEO Basics checklist -- all items passing
2. [ ] Keyword-to-page matrix documented and saved in project folder
3. [ ] All schema markup validated
4. [ ] Google Search Console set up and sitemap submitted
5. [ ] Internal links reviewed and verified
6. [ ] Content optimization checklist passed on every page
7. [ ] Core Web Vitals passing on mobile
8. [ ] 301 redirects in place (if applicable)
9. [ ] Full site crawl -- zero errors
10. [ ] Hand off Search Console access and keyword matrix to client
