# Jeff's Lawn Care Service -- Technical Website Audit

**Date:** 2026-03-06
**URL:** https://jeffslawncareservices.com
**Audited by:** Iris (OphidianAI)

---

## Summary

Jeff's Lawn Care Service runs on a WordPress site built in 2015-2017 using "The Landscaper" theme. The site is technically functional but has a critical identity problem: the header, contact email, phone number, and Facebook link all belong to Morin Landscaping (a separate business in North Vernon, IN). The contact page content panels are completely empty. The gallery has one image. There is no analytics, no Google Business Profile, and no working lead capture form. The site still ranks for Columbus, IN lawn care searches, meaning it actively funnels potential Jeff's Lawn Care customers to Morin Landscaping.

---

## Platform & Hosting

| Detail | Value |
|---|---|
| **CMS** | WordPress 6.9.1 |
| **Theme** | The Landscaper v1.3.2 (ProteusThemes, circa 2015) |
| **Page Builder** | SiteOrigin Panels |
| **Hosting** | Apache, EIG-family shared hosting (X-Endurance-Cache headers) |
| **SSL** | Active (HTTPS, auto-redirects from HTTP) |
| **Caching** | X-nginx-cache: WordPress, Cache-Control: max-age=7200 |
| **Server** | Apache with HTTP/2 upgrade support |
| **PHP** | Not exposed in headers |

---

## WordPress Plugins Detected

| Plugin | Purpose | Status |
|---|---|---|
| **Yoast SEO** | SEO management, sitemap generation | Active -- generating sitemaps |
| **SiteOrigin Panels** | Page builder / layout | Active -- used on all pages |
| **Essential Grid** | Gallery/portfolio grid | Active -- used on gallery page |
| **Contact Form 7** | Contact forms | Installed -- but no forms visible on contact page |
| **FormGet Contact Form** | Alternative form plugin | Installed -- status unclear |
| **Easy FancyBox** | Lightbox for images | Active |

---

## Site Structure

| Page | URL | Last Modified | Status |
|---|---|---|---|
| Homepage | / | 2023-02-06 | Working -- slider, service cards, CTAs |
| About Us | /about-us/ | 2022-04-11 | Working -- Jeff Yarnell bio, hiring notice |
| Services | /services/ | 2017-02-21 | Working -- 6 service categories with images |
| Gallery | /gallery/ | 2017-02-21 | Nearly empty -- 1 image, "Galery" typo in subtitle |
| Lawn & Garden Care | /lawn-and-garden-care/ | 2017-02-22 | Working -- individual service page |
| Drainage | /irrigation-and-drainage/ | 2017-02-22 | Working -- individual service page |
| Snow & Ice Removal | /snow-and-ice-removal/ | 2017-02-22 | Working -- individual service page |
| Spring & Fall Cleanup | /spring-and-fall-cleanup/ | 2017-02-22 | Working -- individual service page |
| Debris Removal | /planting-and-removal/ | 2017-02-22 | Working -- individual service page |
| Mulch/Gravel Delivery | /mulch-gravel-delivery/ | 2017-02-22 | Working -- individual service page |
| Contact Us | /contact-us/ | 2024-01-09 | **Broken** -- page body is empty (no content panels) |

**Total indexed pages:** 11 (plus attachment and portfolio sitemaps from 2017)

---

## Header / Topbar Content (Global)

The topbar appears on every page and contains:

| Element | Value | Correct? |
|---|---|---|
| **Tagline** | "Free Quotes!" | Yes |
| **Address** | 1905 W County Road 350 N, North Vernon, IN 47265 | **NO** -- This is Morin Landscaping's address |
| **Phone** | 812-352-7587 | **NO** -- This is Morin Landscaping's phone |
| **Email** | office@morinlandscaping.com | **NO** -- This is Morin Landscaping's email |
| **Facebook** | facebook.com/MorinsLandscaping | **NO** -- This is Morin Landscaping's Facebook |

Every single piece of contact information in the site header belongs to a different business.

---

## SEO Status

| Element | Status | Details |
|---|---|---|
| **Yoast SEO** | Installed and active | Generating sitemaps, managing meta tags |
| **Page Titles** | Set | Homepage: "Lawn care service - Columbus Indiana - Jeff's Lawn Care" |
| **Meta Description** | Set (homepage) | "Jeff's Lawn Care offers full lawn care and lawn mowing services. In addition we offer debris removal, landscaping and mulch delivery to the Columbus area." |
| **OG Tags** | Present | og:title, og:description, og:site_name set on homepage |
| **Contact Page Meta** | **Lorem Ipsum** | OG description is placeholder Latin text: "Curabitur sodales ligula in libero..." |
| **Viewport** | Correct | width=device-width, initial-scale=1.0 |
| **Robots** | Correct | index, follow with Yoast directives |
| **Sitemap** | Present | Yoast-generated sitemap_index.xml with 5 sub-sitemaps |
| **Schema Markup** | Not present | No LocalBusiness, LawnCareService, or other structured data |
| **Canonical URLs** | Not verified | Yoast typically handles this |
| **Image Alt Tags** | Minimal | Slider images have alt text, service images vary |

**Sitemap issue:** Image URLs in the sitemap use http:// while page URLs use https://. This is a mixed-content reference that could confuse crawlers.

---

## Analytics & Tracking

| Tracker | Status |
|---|---|
| **Google Analytics (GA4)** | Not present |
| **Google Analytics (UA)** | Not present |
| **Google Tag Manager** | Not present |
| **Facebook Pixel** | Not present |

**Bottom line:** Zero analytics. No visibility into traffic, user behavior, or conversions.

---

## Security

| Item | Status | Details |
|---|---|---|
| **SSL Certificate** | Active | HTTPS working, HTTP redirects properly |
| **Mixed Content** | Minor | Sitemap image URLs reference http:// |
| **Security Headers** | Missing | No Content-Security-Policy, X-Frame-Options, or HSTS |
| **WordPress Version Exposed** | Yes | Generator meta tag reveals WordPress 6.9.1 |
| **WP-JSON Exposed** | Yes | Link header exposes /wp-json/ API endpoint |
| **Login Page** | Likely default | /wp-admin/ and /wp-login.php presumably accessible |

---

## Performance Notes

| Item | Observation |
|---|---|
| **HTML Size** | ~60KB (homepage) -- reasonable |
| **Caching** | Server-side nginx cache with 2-hour TTL |
| **Images** | 2015-era images, some likely stock. Sizes in sitemap suggest they are served at fixed dimensions (360x240). |
| **Slider** | Homepage uses a JavaScript slider with 3 slides. Could impact LCP. |
| **Font Awesome** | Loaded via theme (not a broken external kit like SAK) |
| **jQuery** | Loaded (standard WordPress dependency) |
| **External Resources** | Minimal -- no ads, no third-party widgets, no chat tools |

---

## Broken / Non-Functional Elements

| Element | Issue |
|---|---|
| **Contact page body** | SiteOrigin Panels layout has zero widgets. The page shows only the header image and subtitle -- no form, no map, no contact details in the body. |
| **Contact Form 7** | Plugin installed but no form rendered on any page |
| **Gallery** | Only 1 image despite Essential Grid plugin. "Galery" typo in subtitle. |
| **Header contact info** | All 4 items (address, phone, email, Facebook) point to Morin Landscaping |
| **Contact page OG description** | Lorem Ipsum placeholder text |
| **Portfolio sitemaps** | portfolio-sitemap.xml and portfolio_category-sitemap.xml reference content from 2017-02-21 -- likely unused/empty |

---

## What Happened: The Morin Transition

Based on the evidence:

1. **Jeff Yarnell** built this site in 2015-2017 using "The Landscaper" WordPress theme
2. **Most service pages** were last modified 2017-02-22 -- the site has been largely static since then
3. **About page** was updated 2022-04-11 (minor edit)
4. **Homepage** was updated 2023-02-06 (possibly the "joined forces with Morin" notice)
5. **Contact page** was updated 2024-01-09 -- this is when the Morin transition notice was added and the header info was changed to Morin's details
6. The contact page content was likely removed during this transition, leaving an empty page

The site now exists in a limbo state: branded as Jeff's Lawn Care but routing all leads to Morin Landscaping.

---

## Rebuild Implications

### If Jeff is still operating independently
- Complete teardown and rebuild on modern stack
- New branding, correct contact info, proper portfolio
- Google Business Profile creation from scratch
- SEO value in the domain can be preserved with proper redirects

### If Jeff is fully absorbed into Morin
- Site should be redirected (301) to morinlandscaping.com
- Or taken down entirely
- Google Business Profile (if any) should be merged/redirected
- Domain could be sold or parked

### What to keep (either scenario)
- Domain name (jeffslawncareservices.com) -- has existing SEO authority
- Service descriptions and about page text (Jeff's bio)
- Any real project photos (most appear to be stock)

### What needs replacing (everything else)
- Theme and design -- dated 2015 aesthetic
- Contact info -- currently all wrong
- Gallery -- essentially empty
- Contact form -- non-functional
- Analytics -- non-existent
- Hosting -- EIG shared hosting is acceptable but not ideal

---

## Verdict

This is a straightforward rebuild opportunity if Jeff Yarnell is still in business independently. The site has a critical identity crisis that is actively costing him leads. The domain has SEO value for Columbus, IN lawn care searches. The technical foundation (WordPress on shared hosting) is functional but the content layer is broken -- wrong contact info, empty pages, no portfolio, no analytics, no lead capture. A modern 5-7 page site would be a massive upgrade.

**Risk factor:** Need to confirm Jeff's current business status before investing in outreach materials. The Morin merger complicates the pitch -- if Jeff is no longer operating, this is a dead lead for website services (though Morin could be a separate prospect).
