# SAK Automotive -- Technical Website Audit

**Date:** 2026-03-05
**URL:** https://sakautomotive.com
**Audited by:** Iris (OphidianAI)

---

## Summary

SAK Automotive's website is built on HostGator's Webzai (WZUK) website builder platform, last modified in November 2018. The site is functional but severely outdated, with multiple broken integrations, a dead tire ordering link, an empty testimonials page, and no active analytics. A complete rebuild is the only viable path -- there is nothing worth preserving from the current platform.

---

## Platform & Hosting

| Detail | Value |
|---|---|
| **CMS/Builder** | HostGator Webzai (WZUK) -- a proprietary drag-and-drop website builder |
| **Hosting Provider** | HostGator (Apache server) |
| **IP Address** | 198.57.243.41 |
| **Admin Backend** | admin.wzukltd.com |
| **Asset Storage** | Google Cloud Storage (storage.googleapis.com/wzukusers/user-31303381/) |
| **Last Modified** | November 23, 2018 (per sitemap and meta tag) |
| **Server** | Apache with HTTP/2 support |
| **Base Address (internal)** | Configured as `http://sakautomotive.com` (non-HTTPS internally) |

**Key note:** Webzai is HostGator's proprietary builder. It is not exportable, not portable, and has no modern equivalent. The entire site is rendered client-side via `viewer.js` with page data stored as JSON in Google Cloud Storage. This is a locked-in platform.

---

## Integrations & Services

| Service | Provider | Status | Notes |
|---|---|---|---|
| **Website Builder** | HostGator Webzai (WZUK) | Active (but outdated) | Proprietary, non-exportable. viewer.js + GCS-hosted page data. |
| **Tire Ordering** | TireMotion (tiremotion.com) | DEAD | Domain is parked on GoDaddy with "Launching Soon" placeholder. Link is completely broken. |
| **Contact Form** | Webzai built-in form | Active (likely) | Custom form elements (not standard HTML forms), no `<form>` tag. Fields: Name, Email, Phone, Message. Submit handled by viewer.js. |
| **Google reCAPTCHA** | Google | Active | reCAPTCHA v2, site key: `6LeCLkUUAAAAABEGEwlYoLyKNxIztJfM2okdeb2V`. Used on contact form. |
| **Google Maps** | Google Maps JS API | Active (with warnings) | API key: `AIzaSyDQtuw04WyGWiY3JULv0HDpHdTK16H4_nI`. Coordinates: 39.1938988, -85.8997904. Deprecation warnings active. |
| **Google AdSense** | Google | Active | Publisher ID: `ca-pub-8835639782862770`. Ads are loading on all pages. |
| **SureCritic Reviews** | SureCritic | Broken/Empty | Widget configured (business ID 25024, widget 50016) but testimonials page shows zero content. Widget loads jQuery 1.12.4 independently. |
| **Font Awesome** | Font Awesome (kit) | BROKEN | Kit `397d6e1e6a` returns 403 Forbidden. Icons are not loading. |
| **Facebook Page** | Facebook | Active (link only) | Links to https://www.facebook.com/sakautomotive/ -- icon link in footer. No embeds or pixel. |
| **PayPal** | PayPal | NOT CONFIGURED | PayPal account set to placeholder `"YourPayPalEmail@domain.com"`. Never set up. |
| **Insights/Analytics (Webzai)** | Webzai built-in | Active | Tracking ID: `d4509cdb-3da4-4969-a620-d1bb13941925`. This is Webzai's own analytics, not Google. |

---

## Analytics & Tracking

| Tracker | Status | Details |
|---|---|---|
| **Google Analytics (UA)** | Configured but likely non-functional | Tracking ID: `UA-72085936-1`. Universal Analytics was sunset by Google in July 2024. Data is no longer being collected. |
| **Google Analytics 4 (GA4)** | Not present | No GA4 property configured. |
| **Google Tag Manager** | Not present | No GTM container. |
| **Facebook Pixel** | Not present | No Meta/Facebook tracking pixel installed. |
| **Webzai Insights** | Active | Built-in Webzai analytics (proprietary, non-exportable). |
| **AdSense** | Active | Google AdSense ads are rendering on the site. This is the builder's monetization, likely benefiting HostGator, not SAK. |

**Bottom line:** SAK Automotive has zero functional analytics. They have no visibility into their website traffic or user behavior.

---

## SEO Status

| Element | Status | Details |
|---|---|---|
| **Page Titles** | Partially set | Homepage: "SAK Automotive". Services: no custom title. Contact: "Contact SAK Automotive". |
| **Meta Description** | Set (homepage only) | "SAK Automotive Service and Tire is a small shop located on the south side of Columbus, IN just off State St. That offers automotive services and repairs." |
| **Meta Keywords** | Set | "Automotive Repair Services" (single keyword, minimal value). |
| **Viewport** | Misconfigured | Set to `width=1024` (fixed width). Not responsive. |
| **Sitemap** | Present but stale | `/sitemap.xml` exists. Lists 5 pages. All URLs use `http://` (not HTTPS). Last modified: 2018-11-23. |
| **Robots.txt** | Present but correct | Allows all crawling. Sitemap URL uses non-standard `SITEMAP:` (uppercase) and missing protocol: `sakautomotive.com/sitemap.xml`. |
| **Schema Markup** | Not present | No structured data (LocalBusiness, AutoRepair, etc.). |
| **Open Graph Tags** | Not present | No OG tags for social sharing. |
| **H1 Tags** | Inconsistent | Homepage uses H3 for the main CTA. No clear heading hierarchy. |
| **Canonical URLs** | Not set | No canonical tags on any page. |

**Address discrepancy:** Footer says "Columbus, IN 47304" but the contact page says "Columbus, IN 47201". The correct ZIP for 330 Center St, Columbus, IN is 47201.

---

## Security Issues

| Issue | Severity | Details |
|---|---|---|
| **SSL Certificate** | OK | Let's Encrypt wildcard cert (*.sakautomotive.com). Valid Jan 24 - Apr 24, 2026. Auto-renewing. HTTP redirects to HTTPS. |
| **Mixed Content** | Low | Internal `baseAddress` configured as `http://` but site serves over HTTPS. Sitemap URLs are HTTP. |
| **Favicon** | Broken | Returns HTTP 500 on every page load. |
| **Google Maps API Key** | Medium | API key (`AIzaSyDQtuw04WyGWiY3JULv0HDpHdTK16H4_nI`) is exposed in client-side code with no domain restrictions visible. |
| **reCAPTCHA Key** | Low | Site key exposed (expected for client-side), but the secret key handling is inside the proprietary Webzai platform. |
| **No Security Headers** | Medium | No Content-Security-Policy, X-Frame-Options, or other security headers. |

---

## Broken/Non-functional Elements

| Element | Issue |
|---|---|
| **TireMotion link** | tiremotion.com is a parked GoDaddy domain. The "Order Tires Online" CTA (prominent on homepage and services page) leads nowhere. |
| **Testimonials page** | Completely empty. SureCritic widget either has no reviews or is failing silently. Page shows header/footer only. |
| **Font Awesome kit** | Returns 403 Forbidden. Any icons using Font Awesome are broken. |
| **HostGator builder script** | `static.mywebsitebuilder.com/t.js` fails with ERR_NAME_NOT_RESOLVED on every page. Domain no longer exists. |
| **Favicon** | Returns HTTP 500 error. No favicon displays in browser tabs. |
| **Google Analytics** | UA property `UA-72085936-1` is configured but Universal Analytics was deprecated in 2024. No data collection. |
| **PayPal integration** | Configured with placeholder email. Never functional. |
| **About page** | Intermittently loads content from columbusmassagecenter.com (a different business entirely). Possible DNS/hosting contamination on shared hosting. This is a serious issue. |
| **Viewport meta** | Fixed at 1024px width. Site is not mobile-responsive. |
| **Copyright date** | Shows 2017. |

---

## Third-Party Scripts & CDNs

| Script/Resource | Source | Purpose |
|---|---|---|
| `viewer.js` / `viewer.css` | sakautomotive.com/viewer/ | Webzai site renderer (core framework) |
| `adsbygoogle.js` | pagead2.googlesyndication.com | Google AdSense ad delivery |
| `t.js` (broken) | static.mywebsitebuilder.com | HostGator builder tracking (domain dead) |
| Page JS files (3 per page) | storage.googleapis.com/wzukusers/ | Page content/layout data |
| `recaptcha/api.js` | www.google.com | Google reCAPTCHA v2 |
| Google Maps API | maps.googleapis.com | Embedded map on contact page |
| SureCritic widget | www.surecritic.com | Review/testimonial display (broken) |
| Font Awesome kit | kit.fontawesome.com | Icon fonts (broken, 403) |

No jQuery is loaded by the main site (Webzai has its own rendering engine). SureCritic independently loads jQuery 1.12.4.

---

## Site Structure

| Page | URL | Status | Content |
|---|---|---|---|
| Home | / | Working | Hero banner, service cards (3), phone CTA, tire ordering CTA |
| Services | /services | Working | Service list (12 items), tire ordering link, warranty info |
| Testimonials | /testimonials | Empty | Header/footer only. SureCritic widget not rendering. |
| About | /about | Unstable | Team bios (5 people), company history. Intermittent redirect to wrong site. |
| Contact | /contact | Working | Contact form (Name/Email/Phone/Message), Google Maps embed, address/phone |

---

## Rebuild Implications

### What to keep (migrate)
- **Business information:** Address (330 Center St, Columbus, IN 47201), phone (812-372-8000), team bios, service list, warranty details
- **Facebook page link:** https://www.facebook.com/sakautomotive/
- **Google Maps location:** Coordinates 39.1938988, -85.8997904
- **Domain name:** sakautomotive.com (will need DNS changes)

### What needs replacing (everything else)
- **Platform:** Webzai is a dead-end. No export capability. Complete rebuild required.
- **Tire ordering:** TireMotion is defunct. Need to either find a new tire ordering partner, build custom functionality, or remove the feature.
- **Contact form:** Need a new form solution (built into whatever platform we use).
- **Google Analytics:** Set up GA4 from scratch. UA data is gone.
- **Reviews/Testimonials:** SureCritic widget is broken. Replace with Google Reviews integration or manual testimonials.
- **Google Maps:** New embed with proper API key and domain restrictions.
- **reCAPTCHA:** New keys tied to the new domain/platform.
- **Favicon:** Need to create one.
- **SEO:** Start fresh with proper meta tags, schema markup (AutoRepair/LocalBusiness), responsive viewport, OG tags.
- **Mobile responsiveness:** Current site is fixed-width (1024px). New site must be mobile-first.
- **SSL:** Will carry over if staying on same hosting, otherwise new cert needed.

### What to drop
- **Google AdSense:** These are builder-injected ads, likely not benefiting SAK. Remove.
- **HostGator builder scripts:** Dead resources.
- **Font Awesome kit:** Expired/revoked. Use a fresh install or alternative icon set.
- **PayPal (placeholder):** Was never configured. Discuss if payment processing is actually needed.
- **SureCritic:** Investigate if they still use this service. If not, drop it.

### Hosting recommendation
- Move off HostGator shared hosting entirely. The shared IP and intermittent cross-site contamination (Columbus Massage Center loading on /about) is a serious red flag.
- Vercel, Netlify, or similar modern hosting would be appropriate for a rebuilt site.

---

## Verdict

This is a complete teardown and rebuild. There are zero components from the current site that can be technically preserved or migrated. The only assets worth carrying forward are the content (text, service descriptions, team info) and the domain name. The current site has been untouched since November 2018 and is actively degrading as third-party services expire around it.
