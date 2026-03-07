# Business Research

Research businesses to find potential clients with outdated or missing websites, weak online presence, or other service opportunities for OphidianAI.

## When to Use

When Eric wants to find businesses that could benefit from OphidianAI's services -- web design, AI tools, or AI integrations.

## Inputs

- **Location** (optional -- defaults to Eric's area: Columbus, Indiana)
- **Industry/niche** (optional -- e.g., restaurants, salons, trades, retail, e-commerce)
- **Scope** (optional -- e.g., "within 30 miles", "downtown area", "all of Indiana", "nationwide")
- **Focus** (optional -- what to look for: outdated websites, no website, poor SEO, no online ordering, etc.)

## Tools

Use the **Firecrawl** plugin (`/firecrawl`) for all web research:

- Search for businesses using `firecrawl search`
- Scrape and evaluate business websites using `firecrawl scrape`
- Use `firecrawl map` to discover pages on a business site

## Process

1. Use Firecrawl to search for businesses matching the criteria
2. For each business found, scrape their website (if they have one) to evaluate quality
3. Assess: mobile-friendliness, modern design, load speed, SEO basics, content quality, functionality gaps
4. Identify specific opportunities (no website, outdated design, not mobile-friendly, poor SEO, missing features, etc.)

## Output Format

A table with the following columns:

| Business Name  | Location     | Industry | Website         | Issues Found              | Opportunity | Contact Info         |
| -------------- | ------------ | -------- | --------------- | ------------------------- | ----------- | -------------------- |
| Example Bakery | Columbus, IN | Bakery   | www.example.com | Not mobile-friendly, slow | Redesign    | (555) 123-4567       |
| Joe's Plumbing | Columbus, IN | Trades   | None            | No web presence           | New site    | Found on Google Maps |

After the table, include:

- **Top 3 prospects** -- The businesses with the clearest need and easiest pitch
- **Suggested outreach approach** for each (what to mention in the cold email)

## Rules

- Focus on businesses that are clearly operational but have a weak web presence.
- Prioritize businesses that appear to have revenue (established, reviews, active) but a website that doesn't match their quality.
- Don't include businesses with already-modern, well-built websites.
- Note the source of contact information (Google Maps, Yelp, Facebook, etc.).
- If Eric specifies an industry, focus there. If not, cast a wide net across common business types.
- Be honest about what you can and can't verify. Flag assumptions.
- When no location is specified, default to the Columbus, Indiana area.
