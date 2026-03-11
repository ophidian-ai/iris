# Pinecone Knowledge Layer -- Design Spec

**Date:** 2026-03-11
**Status:** Draft
**Author:** Iris

## Summary

Unified vector knowledge layer for OphidianAI using Pinecone. Enables semantic search across prospect data, outreach history, operational knowledge, decision log, research cache, project documentation, and cross-session agent memory. Agents auto-index data as they produce it and auto-query at defined workflow touchpoints.

## Architecture

**Approach:** Single integrated Pinecone index with multiple namespaces.

- **Index:** `ophidianai-kb`
- **Embedding model:** Pinecone integrated (`multilingual-e5-large`) -- no external embedding service needed
- **Tier:** Free tier (2GB, ~100K vectors). Upgrade to Starter (~$8.25/mo) when revenue justifies it.
- **Interaction model:** Hybrid -- auto-index on creation, auto-query at defined workflow touchpoints, manual ad-hoc queries available.

### Namespace Map

| Namespace | Contents | Primary Producers |
|---|---|---|
| `prospects` | Prospect READMEs, technical audits, score cards, proposal summaries | business-research, prospect-scoring, proposal-generator |
| `outreach` | Cold emails, follow-ups, reply outcomes, offer delivery records | cold-email-outreach, follow-up-email, offer-delivery |
| `operations` | SOPs, pricing, templates, references, marketing strategy, lead sources | Manual / SOP updates |
| `decisions` | Individual decision log entries | morning-coffee, any session that logs decisions |
| `agent-memory` | Persistent memory vault notes, cross-session learnings, reusable patterns | Agents during workflows |
| `research` | Firecrawl cold lead research, prospect research, competitive intel, SEO audits | business-research, seo-audit |
| `projects` | Project READMEs, design specs, tech decisions, implementation plans | web-builder, engineering workflows |

### Record Schema

Consistent across all namespaces:

| Field | Type | Description |
|---|---|---|
| `id` | string | Deterministic ID from source path (e.g., `prospects/sak-automotive/research/technical-audit`) |
| `text` | string | Content to embed and retrieve |
| `source_file` | string | Relative file path for traceability |
| `department` | string | `revenue`, `operations`, `engineering`, `marketing` |
| `created_date` | string | ISO date |
| `updated_date` | string | ISO date |
| `tags` | string[] | Relevant tags (industry, service tier, status, etc.) |

For chunked documents, IDs use the format `{namespace}/{relative-path}#chunk-{n}` with an additional `chunk_index` metadata field.

## Indexing Pipeline

### Auto-Indexing Triggers

#### Revenue Skills

| Skill | Trigger | What Gets Indexed | Namespace |
|---|---|---|---|
| `business-research` | Research completes | Processed research markdown (not raw Firecrawl JSON) | `research` |
| `prospect-scoring` | Score card generated | Score card + README | `prospects` |
| `cold-email-outreach` | Email drafted | Email content + metadata (template, industry, tier) | `outreach` |
| `follow-up-email` | Follow-up drafted | Follow-up content + sequence number | `outreach` |
| `offer-delivery` | Offer delivered | Outcome record (accepted, what was delivered) | `outreach` |
| `proposal-generator` | Proposal generated | Proposal summary (scope, pricing, service type) | `prospects` |
| `seo-audit` | Audit completed | Audit findings summary | `research` |

#### Operations Skills

| Skill | Trigger | What Gets Indexed | Namespace |
|---|---|---|---|
| `morning-coffee` | Decision logged during session | Individual decision entry | `decisions` |
| Any skill that updates SOPs | SOP created/updated | Full SOP content | `operations` |
| `client-onboarding` (future) | Client onboarded | Onboarding outcome record | `projects` |

#### Engineering Skills

| Skill | Trigger | What Gets Indexed | Namespace |
|---|---|---|---|
| `web-builder` | Project phase completes | Project README updates, tech decisions | `projects` |
| Design specs written | Spec committed | Spec summary (not full spec) | `projects` |

#### Memory

| Trigger | What Gets Indexed | Namespace |
|---|---|---|
| Persistent memory note created/updated | Note content | `agent-memory` |
| Agent identifies a reusable pattern | Pattern summary | `agent-memory` |

### Shared Indexing Utility

Each skill calls a shared function at the end of its workflow:

```
indexToKnowledgeBase({
  text: <content>,
  namespace: <target>,
  sourceFile: <relative path>,
  metadata: { department, tags, created_date, updated_date }
})
```

The function:

1. Generates a deterministic ID from the source file path
2. Upserts to Pinecone (update if exists, create if new)
3. Logs the indexing action for debugging

Indexing is inline -- no batch jobs or cron. The one exception is the initial bulk load.

### What Does NOT Get Indexed

- Raw Firecrawl JSON search results (redundant with processed markdown)
- Screenshots and images (not embeddable as text)
- Staged email JSON metadata (staging data, not knowledge)
- Git history (use git log)
- Automation logs (transient)
- Archives (intentionally archived)
- CLAUDE.md files (already in system context)
- Node modules / build artifacts

## Query & Retrieval Layer

### Scoped Query (Most Common)

Search within a specific namespace for targeted retrieval.

| Workflow | Example Query | Namespace | When |
|---|---|---|---|
| Cold email drafting | "successful outreach to auto service businesses" | `outreach` | Before generating email |
| Prospect research | "businesses similar to [prospect name/industry]" | `prospects` | During scoring/research |
| "Have we seen this before?" | "[business name or URL]" | `research` | Before starting new research |
| SOP lookup | "how do we launch a client site" | `operations` | During project delivery |
| Decision context | "pricing decisions for religious organizations" | `decisions` | During proposal generation |
| Project context | "Bloomin' Acres deployment setup" | `projects` | During engineering work |
| Past learnings | "what worked for restaurant prospects" | `agent-memory` | During any workflow |

### Cross-Namespace Query

Fan out across multiple namespaces when broader context is needed (e.g., morning briefing pulling from decisions + prospects + projects).

Implementation: run parallel queries against 2-3 namespaces, merge results by relevance score, deduplicate, return top-K.

### Query Parameters

| Parameter | Default | Description |
|---|---|---|
| `query` | required | Natural language search text |
| `namespace` | required | Target namespace (or array for cross-namespace) |
| `top_k` | 5 | Number of results to return |
| `filter` | optional | Metadata filters (department, tags, date range) |
| `min_score` | 0.3 | Minimum relevance threshold to filter noise |

### Result Format

Each result returns:

- `text` -- matched content
- `score` -- relevance score (0-1)
- `source_file` -- path to original file for traceability
- `metadata` -- all stored metadata (department, tags, dates)

Agents use results as context injected into their prompts -- not shown to Eric unless he asks.

## Initial Bulk Load

One-time script to index all existing data.

### Records by Namespace

| Namespace | Source | Estimated Records |
|---|---|---|
| `prospects` | `revenue/lead-generation/prospects/*/README.md`, `*/research/technical-audit.md`, `*/research/score-card.md` | ~60 |
| `outreach` | `revenue/lead-generation/prospects/*/outreach/*.txt` | ~40 |
| `operations` | `operations/references/sops/*.md`, `operations/references/pricing-structure.md`, `operations/references/niche-offer-templates.md`, `operations/templates/*.md`, `revenue/lead-generation/lead-sources.md` | ~20 |
| `decisions` | `operations/decisions/log.md` (split by entry) | ~10 |
| `agent-memory` | `persistent-memory/**/*.md` (excluding _index.md and .obsidian/) | ~14 |
| `research` | `.firecrawl/cold-leads/*.md`, `.firecrawl/prospect-research/*.md` (skip JSON) | ~50 |
| `projects` | `engineering/projects/*/README.md`, `docs/superpowers/specs/*.md` | ~5 |

**Total: ~200 records.** Well within free tier (100K vectors).

### Chunking Strategy

- **Short documents** (under 2000 chars): index as a single record
- **Long documents** (over 2000 chars): split by heading (H2/H3 sections), each section becomes its own record with shared `source_file` and `chunk_index` metadata
- **Decision log**: split by individual decision entry (each `###` block = one record)

### Execution

1. Run via Pinecone MCP tools (upsert-records)
2. Process one namespace at a time
3. Log results: files indexed, records created, errors
4. Verify with `describe-index-stats` to confirm record counts per namespace

### Re-indexing

Changed files get re-upserted with the same deterministic ID on next skill run. For manual re-indexing, re-run bulk load for that namespace -- deterministic IDs prevent duplicates.

## System Boundaries

| Layer | Purpose | Technology |
|---|---|---|
| **Pinecone** | Semantic search, pattern matching, similarity | Pinecone integrated index (free tier) |
| **File system** | Source of truth, version controlled | Git repo (markdown, JSON) |
| **Google Sheets** | Pipeline tracking, structured data | GWS CLI |
| **Supabase** | Client portal, auth, transactional data | PostgreSQL + Auth |
| **Persistent memory** | Cross-session knowledge (also indexed in Pinecone) | Obsidian vault |

## Key Principles

- **Files remain source of truth.** Pinecone is a search layer, not a data store. If Pinecone is wiped, re-run bulk load from files.
- **Deterministic IDs** prevent duplicates. Same file always maps to same record.
- **No external embedding service.** Pinecone's integrated model handles vectorization.
- **Free tier first.** ~200 records today, 100K limit. Upgrade when revenue justifies it.
- **Indexing is inline, not batched.** Skills index as they produce data.

## Cost Profile

| Item | Cost |
|---|---|
| Pinecone (free tier, current) | $0/mo |
| Pinecone (Starter, when scaling) | ~$8.25/mo |
| Embedding | $0 (integrated model) |
| Added burn rate impact | None until upgrade |

## Implementation Scope

### New Files

- `.claude/skills/knowledge-base/SKILL.md` -- Knowledge base skill with indexing and query utilities
- Bulk load script (run once via skill)

### Modified Files

- `.claude/skills/business-research/SKILL.md` -- Add indexing hook
- `.claude/skills/prospect-scoring/SKILL.md` -- Add indexing hook
- `.claude/skills/cold-email-outreach/SKILL.md` -- Add indexing hook
- `.claude/skills/follow-up-email/SKILL.md` -- Add indexing hook
- `.claude/skills/offer-delivery/SKILL.md` -- Add indexing hook
- `.claude/skills/proposal-generator/SKILL.md` -- Add indexing hook
- `.claude/skills/seo-audit/SKILL.md` -- Add indexing hook
- `.claude/skills/web-builder/SKILL.md` -- Add indexing hook
- `.claude/skills/morning-coffee/SKILL.md` -- Add query hooks for context enrichment
- `CLAUDE.md` -- Add Pinecone to tool integrations section
- `iris/context/work.md` -- Update MCP servers section
- `.env` -- Pinecone API key (already saved, gitignored)

## Out of Scope (Future)

- Pinecone Assistant for document Q&A (evaluate after knowledge layer proves value)
- Embedding client portal data from Supabase (wait for onboarding pipeline to be live)
- Multi-index architecture (wait for data volume to justify)
- Custom embedding models (integrated model is sufficient for current needs)
