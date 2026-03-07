# Prospect One-Pager Design

**Date:** 2026-03-05
**Status:** Approved

## Purpose

PDF-style HTML documents to email to prospective clients showing what's wrong with their current website and what a modern rebuild would look like. No pricing, no CTA -- just the problem, the impact, and visual proof.

## Prospects

1. **Columbus Massage Center & Salon** -- Dana Greathouse
2. **SAK Automotive Service & Tire** -- owner TBD

## Format

- Self-contained HTML file per prospect
- Opens in browser, saves/prints as PDF
- Screenshots embedded as base64 images

## Layout

| Section                 | Content                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| Header                  | OphidianAI dark background, logo, tagline, teal/green accents                                         |
| Title bar               | Client business name, "Website Assessment"                                                            |
| The Problem             | 3-4 bullet points with icons calling out broken/outdated issues                                       |
| The Impact              | 2-3 short statements tying issues to lost customers/revenue                                           |
| Side-by-side comparison | Left: "Your Website Today" (current screenshot). Right: "What It Could Look Like" (mockup screenshot) |
| What's Included         | 4-5 feature highlights with icons                                                                     |
| Footer                  | OphidianAI branded (matches header)                                                                   |

## Branding

**Header/Footer (OphidianAI):**

- Background: #0D1B2A
- Teal accent: #0DB1B2
- Green accent: #39FF14

**CMC Body:**

- Sage deep: #4a5d4a
- Sage: #6b7f6b
- Cream: #faf7f2
- Gold: #c4a265

**SAK Body:**

- Charcoal: #1a1d21
- Steel: #2a2d33
- Orange: #e8601c
- Off-white: #f0f1f3

## Content Per Prospect

### Columbus Massage Center

**The Problem:**

- Booking widget is broken -- customers can't schedule online
- Gift card purchasing page doesn't work
- WordPress theme last updated in 2021 -- outdated and unmaintained
- Mixed content warnings -- browser shows security issues

**The Impact:**

- Every failed booking attempt is a customer who goes somewhere else
- Broken gift card page is lost revenue, especially around holidays
- Security warnings erode trust from first-time visitors

**What's Included:**

- Working online booking integration
- Functional gift card purchasing
- Mobile-first responsive design
- Modern, professional aesthetic matching their brand
- SEO and Google Analytics 4 setup

### SAK Automotive

**The Problem:**

- Built on HostGator Webzai -- a dead platform with no future
- No SSL certificate -- browser shows "Not Secure" warning
- No online booking or appointment scheduling
- Not mobile-optimized -- invisible to 60%+ of searchers

**The Impact:**

- "Not Secure" warning drives away customers who Google them after a referral
- No online booking means lost after-hours leads
- Copyright still says 2017 -- signals a neglected business to new customers

**What's Included:**

- Modern responsive design with click-to-call
- Online appointment booking
- SSL certificate (HTTPS)
- Google Reviews integration
- SEO-optimized pages and local search visibility

## Screenshots

All captured and stored:

- `projects/columbus-massage-center/current-site/screenshot-hero.png`
- `projects/columbus-massage-center/mockup/screenshot-hero.png`
- `projects/sak-automotive/current-site/screenshot-hero.png`
- `projects/sak-automotive/mockup/screenshot-hero.png`

## Standard Practice

Going forward, when researching any new prospect:

1. Use Playwright to capture screenshots of their current website
2. Save to `projects/<prospect>/current-site/` folder
3. These screenshots feed into outreach materials and proposals
