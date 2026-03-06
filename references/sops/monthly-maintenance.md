# Monthly Maintenance Checklist

**Service:** $100/mo per client site (hosted on Vercel)
**Frequency:** Once per month, per client

---

## 1. Security & Updates

- [ ] Run `npm audit` -- fix any critical/high vulnerabilities
- [ ] Check for framework/library patch updates (Next.js, React, etc.)
- [ ] Apply patch updates if available; skip major version bumps unless planned
- [ ] Verify SSL certificate is valid and not expiring within 30 days

## 2. Performance

- [ ] Run Lighthouse audit (target: 90+ on Performance, Accessibility, Best Practices, SEO)
- [ ] Check Core Web Vitals:
  - LCP (Largest Contentful Paint) -- target under 2.5s
  - FID (First Input Delay) -- target under 100ms
  - CLS (Cumulative Layout Shift) -- target under 0.1
- [ ] Review any new images -- compress and convert to WebP/AVIF if needed

## 3. Uptime & Availability

- [ ] Review UptimeRobot report for the past 30 days
- [ ] Note any downtime incidents (duration, cause if known)
- [ ] Verify DNS records are correct (A, CNAME, MX as applicable)

## 4. Content & Functionality

- [ ] Process any pending client change requests
- [ ] Test all forms (contact, booking, newsletter, etc.) -- submit test entries
- [ ] Verify external integrations still working (Stripe, Vagaro, booking systems, etc.)
- [ ] Run broken link check across the site

## 5. Analytics (if GA4 is set up)

- [ ] Review traffic trends vs. previous month
- [ ] Note any significant changes (spikes, drops, new traffic sources)
- [ ] Flag anything worth mentioning to the client

## 6. Backup

- [ ] Verify latest deployment is accessible in Vercel dashboard
- [ ] Confirm git repo has latest production code pushed
- [ ] Spot-check that production site matches latest deployment

## 7. Client Communication

- [ ] Send brief monthly summary email if there are notable items
  - Include: uptime %, any updates applied, change requests completed, performance scores
  - Skip if nothing noteworthy -- don't send for the sake of sending
