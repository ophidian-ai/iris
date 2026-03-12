---
name: business-research
description: Research businesses to find potential clients with outdated or missing websites, weak online presence, or other service opportunities for OphidianAI. Use when Eric says "find prospects", "research businesses", "look for leads", "find companies that need websites", or any lead generation research task. Also use when scouting a specific industry or location for opportunities.
---

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

## Pipeline Integration

After research is complete:

1. **Create prospect folders** -- For each viable prospect (top 3 minimum), create:
   ```
   revenue/lead-generation/prospects/[business-name-slug]/
   revenue/lead-generation/prospects/[business-name-slug]/research/
   revenue/lead-generation/prospects/[business-name-slug]/outreach/
   ```

2. **Save research summary** -- Write findings to:
   ```
   revenue/lead-generation/prospects/[business-name-slug]/research/initial-research.md
   ```
   Include: business name, URL, location, industry, issues found, opportunity type, contact info, and source.

3. **Update prospect tracker** -- Append each new prospect to the **Google Sheet pipeline** (Sheet ID: `1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0`) with status "New Lead" and basic info. Also update `revenue/lead-generation/prospect-tracker.md` as backup.

4. **Suggest next step** -- For hot prospects, recommend running `prospect-scoring` to qualify them before outreach.

## Rules

- Focus on businesses that are clearly operational but have a weak web presence.
- Prioritize businesses that appear to have revenue (established, reviews, active) but a website that doesn't match their quality.
- Don't include businesses with already-modern, well-built websites.
- Note the source of contact information (Google Maps, Yelp, Facebook, etc.).
- If Eric specifies an industry, focus there. If not, cast a wide net across common business types.
- Be honest about what you can and can't verify. Flag assumptions.
- When no location is specified, default to the Columbus, Indiana area.

## Knowledge Base

After saving research to `revenue/lead-generation/prospects/[slug]/research/initial-research.md`, index it:

1. Read the saved research file content
2. Upsert to Pinecone:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "research"
  records: [{
    "_id": "research/<prospect-slug>/initial-research",
    "text": "<research file content>",
    "source_file": "revenue/lead-generation/prospects/<slug>/research/initial-research.md",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "<location>", "prospect-research"]
  }]
```

3. Log: `Indexed to knowledge base: research/<prospect-slug>/initial-research`

If indexing fails, log the error and continue. Do not block research output.
