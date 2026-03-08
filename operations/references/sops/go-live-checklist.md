# Production Launch Checklist

Reusable checklist for launching client websites. Complete all items in order. Items marked (if applicable) can be skipped with a note explaining why.

Reference SOPs: `seo-basics.md`, `seo-full-setup.md`, `monitoring-setup.md`, `google-business-setup.md`

---

## Phase 1: Pre-Launch (Business)

- [ ] Client agreement signed (see `operations/templates/client-agreement.md`)
- [ ] Final payment received (or payment schedule current)
- [ ] Client has reviewed and approved all pages
- [ ] Content is finalized -- no placeholder text anywhere
- [ ] Contact info verified (phone, email, address)
- [ ] Legal pages in place -- privacy policy, terms of service (if applicable)
- [ ] OphidianAI attribution in footer ("Built by OphidianAI" with logo + link)

## Phase 2: Pre-Launch (Technical)

### Functionality

- [ ] All pages tested on mobile, tablet, desktop
- [ ] Cross-browser check (Chrome, Safari, Firefox, Edge)
- [ ] All internal links working -- no 404s
- [ ] All external links working and opening in new tab
- [ ] Forms submitting correctly (contact, signup, checkout)
- [ ] Payment processing tested (if e-commerce)
- [ ] Email notifications firing correctly (if applicable)
- [ ] Authentication flows working (if applicable)

### SEO (per `seo-basics.md`)

- [ ] Every page has a unique `<title>` tag (50-60 characters)
- [ ] Every page has a unique `<meta name="description">` (150-160 characters)
- [ ] Canonical URL set on every page (`<link rel="canonical">`)
- [ ] One `<h1>` per page, heading hierarchy logical (h1 > h2 > h3)
- [ ] Alt text on all images
- [ ] Images compressed (WebP preferred) and lazy-loaded below the fold
- [ ] `sitemap.xml` at site root with all public pages
- [ ] `robots.txt` at site root with `Sitemap:` directive
- [ ] No accidental `Disallow: /` or `noindex` on public pages
- [ ] Open Graph tags on all pages (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- [ ] Twitter card tags on all pages
- [ ] Schema markup: LocalBusiness on homepage, BreadcrumbList on subpages
- [ ] Product schema on product pages (if e-commerce)

### Performance

- [ ] Lighthouse mobile score 90+ (Performance, Accessibility, Best Practices, SEO)
- [ ] Page load time under 3 seconds
- [ ] CSS and JS minified
- [ ] No render-blocking resources in critical path
- [ ] Font loading optimized (`font-display: swap`)
- [ ] Favicon set (multiple sizes)

### Security

- [ ] No API keys or secrets in client-side code
- [ ] Environment variables properly configured
- [ ] Admin/dashboard pages blocked from indexing (`noindex`)
- [ ] HTTPS enforced (HTTP redirects to HTTPS)

## Phase 3: DNS & Deployment

- [ ] Vercel project configured and tested on preview URL
- [ ] Custom domain added in Vercel dashboard
- [ ] DNS records updated at registrar (A record or CNAME pointing to Vercel)
- [ ] DNS propagation verified (use `dig` or dnschecker.org)
- [ ] SSL auto-provisioned by Vercel -- verify HTTPS works
- [ ] 301 redirects configured from old domain (if replacing existing site)
- [ ] www vs non-www redirect configured (pick one, redirect the other)

## Phase 4: Post-Launch (Same Day)

- [ ] Verify site loads on custom domain (both www and non-www)
- [ ] Test all forms and checkout flows again on production URL
- [ ] Verify SSL certificate is active and valid
- [ ] Social preview test -- share URL on Facebook/Twitter, verify og:image renders correctly

### Google Search Console

- [ ] Add property for new domain (URL prefix method)
- [ ] Verify ownership (HTML meta tag method is fastest)
- [ ] Submit sitemap.xml
- [ ] Request indexing for homepage and top 2-3 pages
- [ ] Enable email alerts for indexing issues

### Google Analytics (GA4)

- [ ] Create GA4 property for client
- [ ] Install Measurement ID on site
- [ ] Verify real-time data flowing
- [ ] Set up conversion events (form submissions, phone clicks, email clicks)
- [ ] Share Viewer access with client (if applicable)

### Uptime Monitoring

- [ ] Create UptimeRobot monitor (HTTP check, 5-minute interval)
- [ ] Set alert contact to eric.lefler@ophidianai.com
- [ ] Verify first check passes

## Phase 5: Post-Launch (Within 1 Week)

### Google Business Profile (per `google-business-setup.md`)

- [ ] Create or claim GBP listing
- [ ] Update website URL to new domain (add UTM params: `?utm_source=google&utm_medium=gbp`)
- [ ] Verify NAP consistency (Name, Address, Phone) between site and GBP
- [ ] Upload logo and 5-10 photos
- [ ] Write business description (750 chars, include city + services)
- [ ] Set accurate hours
- [ ] Create launch announcement post
- [ ] Provide client with direct review link

### Domain Redirect (if replacing existing site)

- [ ] 301 redirect old domain to new domain (configured at old domain's DNS/hosting)
- [ ] Verify redirect works for all old URLs, not just homepage
- [ ] Old hosting canceled (only after redirect is confirmed working)

### Client Handoff

- [ ] Send client handoff documentation (see `operations/templates/client-handoff.md`)
- [ ] Provide login credentials for any accounts (GA4, GSC viewer access)
- [ ] Add project to monthly maintenance schedule
- [ ] Schedule 2-week check-in with client

## Phase 6: Post-Launch (2 Weeks)

- [ ] Check Google Search Console for indexing status
- [ ] Verify key pages are appearing in Google search results
- [ ] Review GA4 data -- confirm traffic is tracking
- [ ] Check UptimeRobot for any downtime incidents
- [ ] Run Lighthouse audit again -- confirm scores haven't degraded
- [ ] Client check-in -- any issues, feedback, or content changes needed?
- [ ] Archive project in `shared/archives/` if no ongoing work planned
