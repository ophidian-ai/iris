---
name: website-copywriting
description: Generate complete website copy for client sites. Use when building a client website and need page content, when Eric says "write the copy", "generate content for the site", or when the web-builder skill needs content for pages. Covers homepage, about, services, contact, and any custom pages.
---

# Website Copywriting

Generate complete website copy for client sites. Takes business info and produces ready-to-use text for every page.

## When to Use

When building a Professional or E-Commerce tier site where copywriting is included. Also available as an add-on ($100-$200/page) for Starter tier clients.

## Inputs

- Business name and type
- Services/products offered
- Target audience
- Tone preference (default: professional, approachable)
- Unique selling points / differentiators
- Location (for local SEO keywords)
- Any existing content the client wants to keep
- Number of pages and page names

## Process

1. Review client's business research and technical audit (if available in project folder)
2. Identify primary keywords for each page based on services + location
3. Generate copy page by page

## Output Format

For each page, generate:

### [Page Name]

**Meta Title:** (50-60 characters, includes primary keyword + business name)
**Meta Description:** (150-160 characters, includes CTA)

**H1:** (one per page, contains primary keyword)

**Body Copy:**
[2-4 paragraphs of natural, keyword-aware copy]

**CTA:** [call-to-action text for that page]

## Page Templates

### Homepage
- H1: Clear value proposition (what they do + who they serve)
- Hero subtext: 1-2 sentences expanding on the H1
- Services overview: brief descriptions linking to service pages
- Social proof: testimonials or trust signals
- CTA: primary action (call, book, contact)

### About Page
- H1: Something more engaging than "About Us"
- Story: how the business started, what drives them
- Team: brief bios if applicable
- Values or approach
- CTA: contact or services

### Services Page(s)
- H1: service name with location keyword
- What the service is and who it's for
- What's included / how it works
- Benefits (not just features)
- CTA: book/contact for this service

### Contact Page
- H1: inviting, not just "Contact Us"
- Phone, email, address, hours
- Brief encouraging text ("We'd love to hear from you")
- Form fields: name, email, phone (optional), message

## Output Location

Save generated copy based on context:

- **Client project (web-builder):** `engineering/projects/[project-name]/docs/copy/[page-name].md`
- **Prospect (pre-sale mockup):** `revenue/lead-generation/prospects/[business-name]/research/website-copy.md`
- **Standalone request:** Output directly in conversation unless Eric specifies a file path.

When called from the web-builder skill, the copy should be formatted ready to drop into React component props (plain text strings, not markdown).

## Related Skills

- **Web Builder** (`.claude/skills/web-builder/SKILL.md`) -- Calls this skill during Phase 4 page building
- **Pricing Structure** (`operations/references/pricing-structure.md`) -- Copywriting add-on pricing for Starter tier

## Rules

- Write for humans first, search engines second
- No keyword stuffing -- keywords should appear naturally
- No fluff, filler, or corporate jargon
- No emojis
- Active voice, present tense
- Short paragraphs (2-3 sentences max)
- Every page must have a clear CTA
- Include location name naturally for local SEO
- Match the client's industry tone (a law firm sounds different from a bakery)
- Don't invent facts about the business -- work with what's provided, flag gaps
