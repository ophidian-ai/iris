# Go-Live Checklist

Standard checklist for launching client websites on Vercel. Complete all items before going live.

---

## Pre-Launch (Technical)

- [ ] All pages tested on mobile, tablet, desktop
- [ ] Cross-browser check (Chrome, Safari, Firefox, Edge)
- [ ] Page load time under 3 seconds (Lighthouse audit)
- [ ] All links working (no 404s)
- [ ] Forms submitting correctly
- [ ] SSL certificate active
- [ ] Favicon and Open Graph images set
- [ ] sitemap.xml and robots.txt in place
- [ ] Meta titles and descriptions on all pages
- [ ] Alt text on all images
- [ ] 301 redirects configured (if replacing existing site)
- [ ] Analytics (GA4) tracking code installed
- [ ] Cookie consent banner (if applicable)

## Pre-Launch (Client)

- [ ] Client has reviewed and approved all pages
- [ ] Content is finalized (no placeholder text)
- [ ] Contact info verified (phone, email, address)
- [ ] Legal pages in place (privacy policy, terms if needed)

## DNS & Deployment

- [ ] Vercel project configured
- [ ] Custom domain added in Vercel
- [ ] DNS records updated (A record or CNAME)
- [ ] DNS propagation verified
- [ ] SSL auto-provisioned by Vercel
- [ ] Old hosting canceled (after DNS propagation confirmed)

## Post-Launch

- [ ] Verify site loads on custom domain
- [ ] Test all forms again on production
- [ ] Submit sitemap to Google Search Console
- [ ] Set up uptime monitoring
- [ ] Send client handoff documentation
- [ ] Add to monthly maintenance schedule
