---
tags:
  - memory
  - operations
triggers:
  - launch
  - go live
  - deploy client
  - checklist
  - maintenance
  - lighthouse
  - SEO setup
  - post-launch
  - handoff
created: 2026-03-10
updated: 2026-03-10
---

# Launch & Maintenance

Full go-live checklist: `operations/references/sops/go-live-checklist.md`
Monthly maintenance SOP: `operations/references/sops/monthly-maintenance.md`
SEO basics SOP: `operations/references/sops/seo-basics.md`
GBP setup SOP: `operations/references/sops/google-business-setup.md`

## Launch Phases

1. **Pre-Launch (Business):** Agreement signed, payment verified, content finalized, legal pages, attribution added
2. **Pre-Launch (Technical):** Mobile/tablet/desktop tested, cross-browser verified, all links working, forms submitting, SEO basics, Lighthouse 90+, security headers, accessibility
3. **DNS & Deployment:** Vercel configured, custom domain, SSL verified, redirects
4. **Post-Launch (Same Day):** Verify production, test forms/checkout, GSC setup, GA4 installed, UptimeRobot monitor
5. **Post-Launch (1 Week):** GBP setup (UTM: `?utm_source=google&utm_medium=gbp`), client handoff docs, add to maintenance schedule
6. **Post-Launch (2 Weeks):** Check GSC indexing, verify search results, review GA4, run Lighthouse again, client check-in

## Key Technical Requirements

- **Performance:** Lighthouse mobile 90+ (all 4 categories), page load <3s
- **SEO:** Unique title/meta per page, canonical URLs, one h1/page, alt text, sitemap.xml, robots.txt, Open Graph, schema markup (LocalBusiness on homepage, BreadcrumbList on subpages)
- **Security headers:** CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Caching:** Images 31536000s (immutable), CSS/JS 86400s with stale-while-revalidate
- **Accessibility:** 44px min touch targets, skip-to-content link, proper heading hierarchy, focus-visible

## Monthly Maintenance Checklist

1. npm audit + patch updates (skip major bumps), SSL expiry check
2. Lighthouse audit (90+ target), Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)
3. UptimeRobot report review, DNS verification
4. Process change requests, test forms, verify integrations, broken link check
5. Review analytics trends (if GA4)
6. Verify Vercel deployment + git repo up to date
7. Send client summary if noteworthy items

## Related

- [[client-agreements]]
- [[pricing-and-services]]
- [[ophidianai-website]]
- [[bloomin-acres]]
- [[web-builder-skill]]
