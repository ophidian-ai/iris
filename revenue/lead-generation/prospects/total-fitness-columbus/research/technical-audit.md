# Technical Audit: Total Fitness of Columbus

**URL:** <https://www.totalfitnessofcolumbus.net/>
**Audit Date:** 2026-03-06
**Auditor:** Iris (OphidianAI)

---

## Summary

Total Fitness of Columbus runs WordPress 6.9.1 with the Avada theme and Slider Revolution plugin -- a heavyweight stack that prioritizes visual flexibility over performance. The site is functional but has several notable issues: duplicated navigation markup, a broken shop page (404), zero analytics tracking, no contact forms, no social media links, no online booking, no member portal, dev environment URLs leaking to production, and content inconsistencies. For a facility of this size and reputation (27 years, 571 reviews across platforms), the website is a significant missed opportunity for lead conversion and member engagement.

---

## Platform & Hosting

| Item           | Detail                                            |
| -------------- | ------------------------------------------------- |
| CMS            | WordPress 6.9.1                                   |
| Theme          | Avada (ThemeFusion)                               |
| Key Plugin     | Slider Revolution v6.7.38                         |
| Builder        | Fusion Builder (Avada native)                     |
| SSL            | Active (HTTPS)                                    |
| CDN            | None detected -- assets served from origin domain |
| Site Published | 2025-09-24                                        |
| Last Modified  | 2025-11-26                                        |

**Note:** The site was published September 2025 and last modified November 2025. This is a relatively recent WordPress build -- likely a redesign that replaced an older site. The theme was last updated in late 2025 per the initial scrape.

---

## Navigation & Structure

| Page                 | URL                             | Status            |
| -------------------- | ------------------------------- | ----------------- |
| Home                 | /                               | Working           |
| About                | /about/                         | Working           |
| Classes              | /classes/                       | Working           |
| Our Facility         | /our-facility/                  | Working           |
| Personal Training    | /personal-training/             | Working           |
| Nutrition Counseling | /nutrition-counseling/          | Working           |
| Childcare            | (under Member Services submenu) | Working           |
| Contact              | /contact/                       | Working           |
| Membership           | /membership/                    | Working           |
| Mark Perry           | /mark-perry/                    | Working           |
| Shop                 | /shop/                          | **404 -- Broken** |

### Navigation Issues

- **Duplicate menu markup:** The navigation menu renders twice in the DOM (desktop + mobile). This is a common Avada theme behavior, but causes accessibility and SEO concerns (duplicate anchor signals, confusing for screen readers).
- **Dev environment URL leaks:** Links to `dev.totalfitnessofcolumbus.net` appear on the live site (Classes link, Waterpark images, facility images). This signals an incomplete migration from staging to production.

---

## Analytics & Tracking

| Tracker               | Status            |
| --------------------- | ----------------- |
| Google Analytics 4    | **Not installed** |
| Google Analytics (UA) | **Not installed** |
| Google Tag Manager    | **Not installed** |
| Facebook Pixel        | **Not installed** |
| Any tracking          | **None detected** |

The site has zero analytics. There is no way to measure traffic, conversions, or user behavior. This is a critical gap -- the business has no visibility into how their website performs.

---

## SEO Status

| Item             | Status      | Detail                                                                                    |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------- |
| Meta Title       | Present     | "Best Gym in Columbus Indiana - Full Gym and Fitness Classes - Total Fitness of Columbus" |
| Meta Description | Present     | "Total Fitness of Columbus is your number 1 Gym choice in Columbus Indiana..."            |
| Schema Markup    | Present     | WebPage, Organization, BreadcrumbList, ImageObject, WebSite                               |
| Canonical URLs   | Present     | Self-referencing canonicals on pages                                                      |
| Sitemap          | Likely      | WordPress default (not independently verified)                                            |
| Robots.txt       | Likely      | WordPress default (not independently verified)                                            |
| LocalBusiness    | **Missing** | No structured data with address, hours, geo coordinates                                   |
| Open Graph Tags  | Unknown     | Not confirmed in source extraction                                                        |

The SEO foundation is acceptable thanks to WordPress/Avada defaults, but there is no active SEO strategy. The missing LocalBusiness schema is a significant gap for a local business that depends on nearby search traffic.

---

## Forms & Interactive Elements

| Element                   | Status                                                  |
| ------------------------- | ------------------------------------------------------- |
| Contact Form              | **None** -- Contact page shows phone/email/address only |
| Membership Inquiry Form   | **None** -- Must call or email                          |
| Class Booking             | **None** -- No online scheduling system                 |
| Personal Training Booking | **None** -- Must call to schedule                       |
| Newsletter Signup         | **None** -- No email capture anywhere                   |
| Search                    | Present -- WordPress default search form                |
| Ajax                      | Active -- admin-ajax.php endpoint configured            |

---

## Social Media Integration

| Platform        | Linked on Website? | Known Presence                                     |
| --------------- | ------------------ | -------------------------------------------------- |
| Facebook        | **No**             | ~209 reviews on Facebook page                      |
| Instagram       | **No**             | Location tag exists; no confirmed business account |
| LinkedIn        | **No**             | Company page exists                                |
| Yelp            | **No**             | 16 reviews                                         |
| Google Business | **No**             | 361 reviews, 4.3-4.4 stars                         |
| TikTok          | **No**             | Discover page only                                 |

No social media links exist anywhere on the website -- not in the header, footer, or any page content.

---

## E-Commerce / Shop

The site has a /shop/ URL indexed by Google (including a ?orderby=price-desc parameter variant), but the page returns a **404 error**. This suggests either:

- WooCommerce was installed and later removed/deactivated
- The shop page was deleted but the URL was not cleaned up from the database or sitemaps
- A permalink/settings misconfiguration

A broken page indexed by search engines is a negative SEO signal and a poor user experience if anyone clicks through from Google.

---

## Performance Concerns

| Issue                     | Impact                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Avada theme               | One of the heaviest WordPress themes available; loads large CSS/JS bundles on every page regardless of features |
| Slider Revolution v6.7.38 | Heavy JavaScript slider plugin; adds significant page weight even if only used on the homepage                  |
| No CDN                    | All assets served from origin server; no edge caching for static resources                                      |
| WordPress emoji script    | Loaded on every page (minor bloat, but unnecessary)                                                             |
| Large images              | Lap pool hero image referenced at 3000x1500px; unclear if responsive srcset is properly configured              |
| No visible lazy loading   | Images may load eagerly, slowing initial page render                                                            |

---

## Security Assessment

| Item              | Status            | Notes                                                                                   |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------- |
| WordPress Version | 6.9.1             | Current -- no concerns                                                                  |
| SSL               | Active            | HTTPS enforced properly                                                                 |
| Theme             | Avada (current)   | Receives regular updates from ThemeFusion                                               |
| Plugin            | Slider Rev 6.7.38 | Recent version -- acceptable                                                            |
| WP REST API       | Likely exposed    | WordPress default; potential information leakage                                        |
| Login Page        | /wp-admin/        | Standard WordPress login; no evidence of hardening (2FA, IP restrictions, etc.)         |
| Dev Environment   | Leaking           | dev.totalfitnessofcolumbus.net URLs visible on production -- potential security concern |

No critical security vulnerabilities detected, but the standard WordPress attack surface applies and the dev URL leak should be investigated.

---

## Content Assessment

| Page                 | Quality    | Notes                                                                                          |
| -------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| Homepage             | Adequate   | Slider-based hero, service highlights; generic Avada layout that doesn't convey facility scale |
| About                | Adequate   | History and facility overview; could use more storytelling and photos                          |
| Classes              | Good       | Full class list and weekly schedule; lacks online booking or registration                      |
| Our Facility         | Good       | Detailed amenity breakdown; needs a proper photo gallery                                       |
| Personal Training    | Thin       | Generic benefits listed; no trainer bios or photos, no pricing, no booking                     |
| Nutrition Counseling | Thin       | Generic meal plan advice with no counselor credentials; reads more like a blog post            |
| Childcare            | Minimal    | Hours listed but no details on ages, policies, or registration process                         |
| Contact              | Thin       | Address and phone only; no form, no Google Maps embed, no directions                           |
| Membership           | Thin       | Lists tier names (Student, Senior, Individual, etc.) but zero pricing; must call/email         |
| Mark Perry           | Good       | Competition history and bio are well-structured and detailed                                   |
| Shop                 | **Broken** | Returns 404 error                                                                              |

### Content Inconsistency

- Homepage hero states "Open 365" while the footer correctly states "Open 363 days/year (Closed for Christmas and Easter)"
- This contradictory messaging undermines trust

---

## Broken/Non-functional Elements

| Element                | Issue                                   | Impact                                                                        |
| ---------------------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| Shop page (/shop/)     | 404 error                               | Broken page indexed by Google; negative SEO signal; confusing for users       |
| Navigation duplication | Menu rendered twice in DOM              | Accessibility concern; duplicate link signals for search engines              |
| Dev environment URLs   | Links to dev.totalfitnessofcolumbus.net | Unprofessional; potential security exposure; broken links if dev site is down |
| Social media links     | Completely absent                       | 571 reviews across platforms are invisible to site visitors                   |
| Contact form           | Missing entirely                        | Forces all inquiries to phone/email; loses leads who prefer web forms         |
| Analytics              | Zero tracking installed                 | No data on traffic, behavior, or conversions; flying blind                    |
| Content inconsistency  | "Open 365" vs "Open 363"                | Contradictory claims erode trust                                              |

---

## Rebuild Implications

### What We Keep

| Item                    | Action                                                            |
| ----------------------- | ----------------------------------------------------------------- |
| Domain                  | Keep totalfitnessofcolumbus.net                                   |
| Content                 | Migrate and significantly improve existing copy                   |
| Mark Perry page         | Preserve competition history and bio; integrate as trust signal   |
| Class schedule          | Rebuild with better formatting, filtering, and booking capability |
| Google Business Profile | Optimize -- 361 reviews is a strong foundation                    |
| Facebook page           | Link and integrate -- 209 reviews                                 |

### What We Replace

| Item                            | Replacement                                                                 |
| ------------------------------- | --------------------------------------------------------------------------- |
| Avada theme + Slider Revolution | Custom, lightweight design optimized for speed and conversion               |
| Generic page layouts            | Purpose-built layouts for each service (training, classes, childcare, etc.) |
| No forms                        | Contact form, membership inquiry, training request, and class booking forms |
| No analytics                    | GA4 with conversion tracking for all inquiry forms                          |
| No social links                 | Social icons in header/footer linked to all active profiles                 |
| Static membership page          | Interactive tier comparison with inquiry/sign-up functionality              |

### What We Add

| Item                           | Value                                                                       |
| ------------------------------ | --------------------------------------------------------------------------- |
| Online class booking           | Revenue enabler; reduces phone call burden on staff                         |
| Contact form                   | Lead capture for membership and service inquiries                           |
| Google Maps embed              | Help prospects find the facility; improve local SEO                         |
| Testimonial/review integration | 571 reviews being completely wasted as social proof                         |
| Email newsletter signup        | Build a marketing list for promotions and retention                         |
| Photo gallery                  | Showcase the impressive facility (pool, waterpark, basketball, weight room) |
| LocalBusiness schema           | Improve local search visibility with structured data                        |
| Membership pricing (optional)  | Reduce friction; stop losing prospects who won't call                       |

### Key Considerations

- **This is a large facility with premium amenities** (pool, waterpark, basketball, 10k+ sq ft gym). The current website does not convey the scale or quality of what they offer.
- **571 reviews across platforms** is a major trust asset that is completely invisible on the website.
- **Zero analytics** means they have no idea how the site performs, where visitors come from, or what they do.
- **The "call for pricing" model** loses prospects who expect online transparency. At minimum, a membership inquiry form would capture leads who won't pick up the phone.
- **Mark Perry's bodybuilding credentials** are a genuine differentiator that could be better leveraged in the site's overall trust messaging.
- **The shop page 404** suggests they attempted e-commerce (possibly merchandise or supplements) and either abandoned it or misconfigured it. Worth asking about during outreach.
- **The site was built in September 2025** -- this is a recent build, which means they recently invested in a website. Approach should acknowledge this and focus on what's missing/broken rather than a full teardown pitch.
- **Dev URL leaks** suggest whoever built the site did not properly clean up the staging-to-production migration. This could be a pain point to reference diplomatically.
