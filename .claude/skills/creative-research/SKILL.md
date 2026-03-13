---
name: creative-research
description: Research current web design trends and award-winning sites for a specific industry/client. Use when starting a new website build (called by web-builder Phase 1.5) or when Eric says "research design trends for [industry]".
---

# Creative Research

Research current web design trends, award-winning sites, and fresh techniques for a specific client or industry. Produces a research document that feeds into the Creative Brief.

## Trigger

- Automatically invoked by web-builder Phase 1.5 after Discovery
- Standalone: "research design trends for [industry]"

## Inputs

- `docs/site-brief.md` (from Discovery) -- client industry, brand, mood, goals
- `engineering/design-system/_catalog.md` -- existing pattern library catalog

If `docs/site-brief.md` does not exist, abort and prompt to run Discovery first.

## Process

### 1. Extract Context from Site Brief

Read `docs/site-brief.md` and extract:
- **Industry** (e.g., bakery, church, tech agency, restaurant, law firm)
- **Mood keywords** (e.g., warm, organic, modern, bold, minimal)
- **Target audience** (demographics, expectations)
- **Brand personality** (professional, playful, rustic, sleek)

### 2. Firecrawl Research (3-5 searches, target 7-12 minutes)

Run these searches using `/firecrawl`:

```
firecrawl search "best [industry] website designs [current year]"
firecrawl search "web design trends [current year] animation interaction"
firecrawl search "[industry] website color palette typography"
```

Optionally scrape 2-3 top results for specific technique details:
```
firecrawl scrape [url]
```

**Adaptive time management:**
- If searches return rich results, skip scrapes
- If Firecrawl is slow, limit to 2 searches
- If Firecrawl is unavailable, skip to Step 3

### 3. Match Against Pattern Library

Read `engineering/design-system/_catalog.md` and score each pattern for relevance:

- **Industry match:** Does the `best-for` field include this client's industry?
- **Mood match:** Does the pattern's visual effect match the client's mood?
- **Complexity budget:** Is the pattern appropriate for the project scope?

Select 5-8 recommended patterns. If the catalog is empty (first build), skip this step and note it.

### 4. Identify New Techniques

From the research results, identify techniques that:
- Are NOT already in the pattern library
- Would enhance the client's site
- Are feasible within the project scope

For each, note: technique name, what it does visually, estimated complexity, and implementation approach.

### 5. Typography and Color Recommendations

Based on research:
- Recommend display + body font pairings with rationale
- Note color treatments beyond the brand palette (overlays, gradients, accent strategies)

## Output

Write `docs/creative-research.md` in the current project root:

```markdown
# Creative Research -- [Client Name]

**Date:** [today's date]
**Industry:** [industry]
**Mood:** [3-5 mood keywords]

## Trend Pulse
- [2-3 sentence summary of current relevant trends]

## Industry Benchmarks
- [Site URL] -- [what makes it good, specific techniques noted]
- [Site URL] -- [what makes it good]
- [Site URL] -- [what makes it good]

## Recommended Patterns from Library
| Pattern | Why | Reference |
| --- | --- | --- |
| [name] | [matches because...] | `engineering/design-system/patterns/[category]/[file].md` |

## New Techniques Discovered
| Technique | Description | Implementation Notes |
| --- | --- | --- |
| [name] | [visual effect] | [how to build, estimated complexity] |

## Typography Recommendations
- Display: [font + rationale]
- Body: [font + rationale]

## Color Treatment Notes
- [Beyond brand palette: overlays, gradients, accents, dark/light approach]
```

## Failure Modes

| Scenario | Handling |
| --- | --- |
| Firecrawl fully unavailable | Skip research, generate output from pattern library only. Note "research unavailable". |
| site-brief.md missing | Abort Phase 1.5, prompt to run Discovery first. |
| Empty catalog (first build) | Skip pattern matching, rely on Firecrawl. Note "library empty". |
| Zero industry matches | Use mood/energy matches instead. Flag in output. |
| Poor Firecrawl results | Use what's usable, fall back to catalog. Note "research limited". |

## Notes

- This skill produces research input, NOT the creative brief itself. The brief is generated as a separate step in the web-builder pipeline.
- Time budget is adaptive. Prioritize actionable findings over exhaustive research.
- Always include at least the pattern library matching, even if Firecrawl research fails.
