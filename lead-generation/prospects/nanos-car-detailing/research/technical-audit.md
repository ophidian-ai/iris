# Technical Audit -- nanoscardetailingandcleaning.com

**Date:** 2026-03-06
**Auditor:** Iris (OphidianAI)

---

## Platform

- **Builder:** Hibu (hibuwebsites.com)
- **CDN:** le-cdn.hibuwebsites.com
- **Domain:** nanoscardetailingandcleaning.com
- **SSL:** Yes (HTTPS)

## Critical Issues

### 1. Visible Placeholder Text
- **"Business Tagline Lorem Ipsum Dolor"** is displayed prominently on the page
- This is default template text that was never replaced with actual business copy
- Visible to all visitors -- immediately undermines credibility

### 2. Exposed Template Tags in Footer
The following raw template variables are rendered in the page footer, visible to users:
```
{{placeholder_retargeting_pixel}}
{{placeholder_dpni}}
{{placeholder_footer_reserve1}}
{{placeholder_footer_reserve2}}
{{placeholder_footer_reserve3}}
{{placeholder_footer_reserve4}}
```
- These are Hibu platform template variables that should be hidden or populated
- Suggests the site was set up hastily and never properly reviewed

### 3. Incorrect Google Maps Link
- The "Get Directions" link points to:
  `https://maps.google.com/maps?q=2161+State+Street%2C+Columbus%2C+IN+47201%2C+US(Eric%27s+Auto+Shops)`
- The business is labeled as **"Eric's Auto Shops"** instead of Nano's Car Detailing & Cleaning
- This is either a leftover from a previous Maps listing or a Hibu setup error

### 4. Capitalization Typo in Heading
- Main heading reads: "Car Cleaning and Detailing **SErvices**"
- The "E" in "Services" is incorrectly capitalized

## Content Issues

### 5. No Service Pricing
- None of the four service pages display pricing
- Visitors have no way to estimate cost without calling
- Missed opportunity for transparency and conversion

### 6. Generic/Repetitive Alt Text
- Multiple images use generic alt text like "Auto Detailing" repeated across different sections
- Service section images all share similar generic labels
- Poor for accessibility and SEO

### 7. Inconsistent Business Hours
- Footer shows: Mon-Sat 8:00 AM - 5:00 PM
- Other references on the site mention 8:00 AM - 7:00 PM
- Creates confusion for potential customers

### 8. Unprofessional Email Address
- Contact form sends to: `lorena29medina@hotmail.com`
- A personal Hotmail address, not a branded business email
- Visible in the page source (mailto link)

## SEO Issues

### 9. No Schema Markup
- No LocalBusiness, AutoRepair, or Service structured data
- Missing schema means reduced visibility in Google rich results
- No FAQ schema on the FAQs page

### 10. Overly Long Domain Name
- `nanoscardetailingandcleaning.com` is 33 characters
- Difficult to remember, spell, and type
- Not a rebuild issue, but worth noting for a potential domain upgrade

### 11. Missing Meta Description (Likely)
- Hibu templates often auto-generate or omit custom meta descriptions
- Page title structure is generic: "Vehicle Care | Nano's Car Detailing & Cleaning Columbus"

## Design/UX Issues

### 12. Template-Based Design
- Site uses a standard Hibu template with limited visual differentiation
- Stock-style imagery and generic layout
- Does not reflect the personality or quality of a 12+ year local business

### 13. Duplicate Navigation
- Navigation menu appears to be duplicated (desktop and mobile versions both rendered)
- Phone number displayed multiple times in different formats

### 14. Promotional Content Management
- Valentine's Day "$10 off full detailing" promotion may be outdated/seasonal
- No easy way for the business to update time-sensitive promotions

## Performance Concerns

### 15. Hibu Platform Lock-In
- All assets hosted on Hibu CDN (le-cdn.hibuwebsites.com)
- Business likely pays monthly to Hibu for hosting and the website
- No ownership of the codebase or design
- Migration would require a full rebuild (which is the opportunity)

---

## Summary

| Category | Issues Found |
|---|---|
| Critical (visible to customers) | 4 |
| Content | 4 |
| SEO | 3 |
| Design/UX | 3 |
| Performance/Platform | 1 |
| **Total** | **15** |

The site has fundamental credibility problems (lorem ipsum text, exposed template tags, wrong business name in Maps link) that are actively harming a well-established business with strong reviews and 12+ years of operation. This is a clear case where the quality of the business far exceeds the quality of its online presence.
