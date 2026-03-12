---
tags:
  - memory
  - tool
triggers:
  - generate report
  - status report
  - PDF
  - client report
  - puppeteer
  - brand style
created: 2026-03-10
updated: 2026-03-11
---

# Report Generation

## Shared PDF Generator

- **Tool:** `engineering/tools/generate-report-pdf.mjs` (Puppeteer, uses `--logo` flag for base64 embedding)
- **Usage:** `node engineering/tools/generate-report-pdf.mjs <html-template> <output-pdf> [--logo <logo-path>]`
- **Requires:** `puppeteer` (installed at repo root via `package.json`)
- **Key rules:**
  - Always include the version number in the output PDF filename (e.g., `Report-v3.pdf`)
  - All generation tools go in `engineering/tools/`, not inside project folders
  - HTML templates use `LOGO_PLACEHOLDER` token, replaced with base64 logo at generation time
- **OphidianAI logo:** `shared/ophidianai-brand-assets/logo_icon.png`

## Bloomin' Acres Reports

### Files

- **HTML template:** `revenue/projects/active/bloomin-acres/reports/status-report-v2.html`
- **Latest PDF:** `revenue/projects/active/bloomin-acres/reports/Bloomin-Acres-Status-Report-v6.pdf`
- **Features Roadmap PDF:** `revenue/projects/active/bloomin-acres/reports/Bloomin-Acres-Features-Roadmap-v6.pdf`
- **Features Roadmap HTML:** `revenue/projects/active/bloomin-acres/reports/features-roadmap-v6.html`

### How to Generate

```bash
node engineering/tools/generate-report-pdf.mjs \
  revenue/projects/active/bloomin-acres/reports/status-report-v2.html \
  revenue/projects/active/bloomin-acres/reports/Bloomin-Acres-Status-Report-v4.pdf \
  --logo shared/ophidianai-brand-assets/logo_icon.png
```

### How to Update for a New Version

1. Edit `reports/status-report-v2.html` -- update version number, date, and content
2. Run the shared generator with a new version number in the output filename
3. Delete the previous version's PDF (only keep the latest)

## Brand Style

- **Cover:** Dark navy (#0F1729), OphidianAI snake logo centered, project name in white, subtitle in teal (#2DD4A8)
- **Content pages:** White bg, snake icon top-left, spaced-caps header top-right
- **Section headings:** Bold black + teal second word (e.g., "Executive **Summary**")
- **Teal accent underlines** beneath subheadings
- **Tables:** Dark header (#1E293B), alternating rows
- **Status badges:** Green (LIVE/GOOD/DONE), red (BUG/CRITICAL), orange (NEEDS FIX/MISSING), teal (RESOLVED)
- **Feature cards:** Light gray bg, teal left border
- **Impact labels:** Colored monospace caps (RED=high, ORANGE=medium, YELLOW=low, GREEN=done)
- **Footer:** "OPHIDIANAI -- CONFIDENTIAL" left, "PAGE X" right
- **Font:** System sans-serif. 14px body, 1.6 line-height
- **Page size:** US Letter with print backgrounds enabled
- **PDF margins:** Use Puppeteer margin options (not CSS) for consistent page margins:
  - `top: '1in'`, `bottom: '1in'`, `left: '0.5in'`, `right: '0.5in'`
  - Use `displayHeaderFooter: true` with teal line templates for header/footer rules
  - Adjust HTML padding to complement (reduce content padding since margins handle spacing)
- **Page breaks:** ALWAYS include page break controls in HTML templates:
  - Add `.page-break { page-break-before: always; padding-top: 0.5in; }` CSS class
  - Apply `break-inside: avoid` to cards, tables, payment boxes, footers
  - Place explicit `page-break` class on major section boundaries
  - After generating PDF, verify each page visually -- no content should bleed across page boundaries
  - Remove section dividers that precede a page break (redundant)
- **Footer flush to page bottom (last page):**
  - Do NOT use dynamic JS spacer calculations -- viewport positions don't account for CSS page breaks, so the math is always wrong
  - Do NOT use `min-height` + flexbox on wrappers that span multiple pages -- Puppeteer breaks the container across pages, creating blank pages
  - DO use a flex container scoped to only the last page's content:
    ```css
    .last-page {
      page-break-before: always;
      padding-top: 0.5in;
      min-height: 11in;       /* exactly one Letter page */
      display: flex;
      flex-direction: column;
    }
    .last-page-content { flex: 0 0 auto; padding: 0 40px; }
    .last-page .footer { margin-top: auto; }
    ```
  - The key: `min-height: 11in` works because the last page content is short enough to fit on one page. The flex layout pushes the footer to the bottom naturally.
  - Move the footer OUT of `.content` and INTO `.last-page` so it participates in the flex layout
- **Zero-margin PDF for full-bleed headers/footers:**
  - Set Puppeteer margins to `{ top: 0, bottom: 0, left: 0, right: 0 }`
  - Handle all spacing in CSS (padding on `.content`, `padding-top: 0.5in` on `.page-break`)
  - Header and footer divs extend edge-to-edge with no clipping

## Report Sections (in order)

1. Cover page
2. Executive Summary (score circle, scorecard, tech stack pills, project status table)
3. What Changed (fixes shipped, before/after comparison, files created)
4. Current Features (customer-facing, account dashboard, admin dashboard cards)
5. Backend & Integrations (Supabase tables, Stripe endpoints, storage buckets)
6. Priority Issues (numbered, color-coded severity badges)
7. Optimization Suggestions (performance, architecture, UX -- with impact labels)
8. Suggested Features (e-commerce, engagement, SEO, admin, content)
9. Code Quality Assessment (strengths, areas for improvement, security posture table)

## For New Client Projects

1. Copy `status-report-v2.html` as a starting template
2. Replace project-specific references with the new project name
3. Update all section content
4. Run the shared generator with the appropriate paths

## Related

- `projects/bloomin-acres.md`
- `projects/ophidianai-website.md`
- `operations/pricing-and-services.md`
