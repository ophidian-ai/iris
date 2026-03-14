---
name: knowledge-base
description: Index data into and query from the Pinecone knowledge layer. Use when Eric says "index", "search knowledge", "knowledge base", "query prospects", "reindex", or when any skill needs to store or retrieve semantic knowledge. Also provides bulk load and stats commands.
---

# Knowledge Base

Unified vector knowledge layer for OphidianAI. Indexes data as skills produce it and enables semantic search across all business knowledge.

## Invocation

- `/knowledge-base index [namespace]` -- Bulk load a specific namespace (or all if omitted)
- `/knowledge-base query <namespace> <query>` -- Manual ad-hoc semantic search
- `/knowledge-base stats` -- Show record counts per namespace
- `/knowledge-base reindex <namespace>` -- Delete all records in namespace and re-run bulk load

## Configuration

- **Index name:** `ophidianai-kb`
- **Embedding model:** `multilingual-e5-large` (integrated -- Pinecone embeds automatically)
- **Field map:** `text` field is embedded. All other fields are searchable metadata.
- **Design spec:** `docs/superpowers/specs/2026-03-11-pinecone-knowledge-layer-design.md`
- **API reference:** `operations/references/pinecone-reference.md` -- MCP tool signatures, filter operators, deletion patterns, doc links, context7 IDs
- **Latest docs:** Query context7 with library ID `/llmstxt/pinecone_io_llms-full_txt` before using unfamiliar Pinecone features
- **All tool docs:** `operations/references/tool-documentation-index.md` -- context7 library IDs for every tool we use

## Namespaces

| Namespace | Contents |
|---|---|
| `prospects` | Prospect READMEs, technical audits, score cards, proposal summaries |
| `outreach` | Cold emails, follow-ups, reply outcomes, offer delivery records |
| `operations` | SOPs, pricing, templates, references, lead sources |
| `decisions` | Individual decision log entries |
| `agent-memory` | Persistent memory vault notes, cross-session learnings |
| `research` | Firecrawl research, prospect research, SEO audits |
| `projects` | Project READMEs, design specs, tech decisions, demo site architectures |
| `design-patterns` | UI component patterns, animation techniques, 3D effects, layout recipes |

## Indexing Procedure

When a skill produces indexable content, follow this procedure:

### 1. Build the record

```json
{
  "_id": "<namespace>/<relative-path-without-extension>",
  "text": "<content to embed -- the actual text content of the document>",
  "source_file": "<relative file path from repo root>",
  "department": "<revenue|operations|engineering|marketing>",
  "created_date": "<YYYY-MM-DD>",
  "updated_date": "<YYYY-MM-DD>",
  "tags": ["<tag1>", "<tag2>"]
}
```

**ID convention:** Use the namespace prefix + relative path without file extension. Examples:
- `prospects/sak-automotive/research/technical-audit`
- `outreach/sak-automotive/cold-email-v1`
- `decisions/log/2026-03-07`
- `research/cold-leads/columbus-restaurants`

**Chunking:** If the document is over 2000 characters, split by H2/H3 headings. Each chunk gets its own record with ID `<base-id>#chunk-<n>` and an additional `chunk_index` field. For the decision log, use the date prefix as the chunk key (e.g., `decisions/log/2026-03-07`).

### 2. Upsert to Pinecone

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "<target namespace>"
  records: [<record object>]
```

### 3. Log the result

After upserting, note in your response: `Indexed to knowledge base: <namespace>/<id>`

### 4. Error handling

If Pinecone is unavailable or the upsert fails:
- Log the failure in your response: `Knowledge base indexing failed: <error>. Continuing without indexing.`
- **Do NOT block the parent skill's output.** The file system is the source of truth. Indexing can be retried later via `/knowledge-base index <namespace>`.

## Incremental Indexing Triggers

These triggers apply to ANY session or agent, not just specific skills:

### Decision Log

When appending a new entry to `operations/decisions/log.md`, index the new entry immediately after writing it:

- `_id`: `decisions/log#<date>` (e.g., `decisions/log#2026-03-11`)
- `text`: the new entry text (heading + body)
- `source_file`: `operations/decisions/log.md`
- `department`: `operations`
- `tags`: ["decision", "<relevant-department>"]
- Namespace: `decisions`

### SOP Updates

When creating or updating any file in `operations/references/sops/`, index it:

- `_id`: `operations/<relative-path-without-ext>` (e.g., `operations/references/sops/client-handoff`)
- `text`: full SOP content
- `source_file`: relative path
- `department`: `operations`
- `tags`: ["sop", "<topic>"]
- Namespace: `operations`

### Persistent Memory

When creating or updating any note in `persistent-memory/` (except `_index.md`), index it:

- `_id`: `agent-memory/<relative-path-without-ext>` (e.g., `agent-memory/projects/bloomin-acres`)
- `text`: note content (excluding frontmatter)
- `source_file`: relative path
- `department`: derive from folder
- `tags`: extract from frontmatter `tags` field if present
- Namespace: `agent-memory`

These are not enforced by hooks -- they rely on agent discipline. Any agent that writes to these locations should follow the indexing procedure above.

## Query Procedure

### Scoped query (single namespace)

```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "<namespace>"
  query.inputs.text: "<natural language query>"
  query.topK: 5
```

Filter by metadata when useful:

```
  query.filter: { "department": { "$eq": "revenue" } }
```

Or filter by tags:

```
  query.filter: { "tags": { "$in": ["restaurant", "food-service"] } }
```

### Cross-namespace query

Run parallel `search-records` calls against 2-3 namespaces. Merge results by relevance score, deduplicate by `source_file`, return top results.

Do NOT use `cascading-search` -- it is cross-index only and does not work across namespaces within one index.

### Result interpretation

- **Score > 0.7:** Strong match -- highly relevant context
- **Score 0.5-0.7:** Moderate match -- potentially useful
- **Score 0.3-0.5:** Weak match -- include only if nothing better
- **Score < 0.3:** Noise -- discard

Use results as context injected into your reasoning. Do not show raw results to Eric unless he asks.

## Bulk Load

### Source mapping

| Namespace | Source Glob |
|---|---|
| `prospects` | `sales/lead-generation/prospects/*/README.md`, `sales/lead-generation/prospects/*/research/technical-audit.md`, `sales/lead-generation/prospects/*/research/score-card.md` |
| `outreach` | `sales/lead-generation/prospects/*/outreach/*.txt` |
| `operations` | `operations/references/sops/*.md`, `operations/references/pricing-structure.md`, `operations/references/niche-offer-templates.md`, `operations/templates/*.md`, `sales/lead-generation/lead-sources.md` |
| `decisions` | `operations/decisions/log.md` (split by `###` entry, use date as chunk ID) |
| `agent-memory` | `persistent-memory/**/*.md` (exclude `_index.md`) |
| `research` | `.firecrawl/cold-leads/*.md`, `.firecrawl/prospect-research/*.md` (skip `.json` files) |
| `projects` | `engineering/projects/*/README.md`, `docs/superpowers/specs/*.md`, `sales/lead-generation/prospects/*/demo/src/data/business.ts`, `sales/lead-generation/prospects/*/demo/docs/creative-research.md` |
| `design-patterns` | `engineering/references/ui-component-patterns.md`, `engineering/references/3d-website-techniques.md`, `engineering/design-system/patterns/*.md` |

### Process

1. For the target namespace (or all), glob the source files from the mapping above
2. For each file:
   - Read the content
   - Skip if file is empty
   - If over 2000 chars, split by H2/H3 headings into chunks
   - Build record(s) following the Indexing Procedure
   - Upsert via MCP tool
3. Log each file: path, record ID, success/failure
4. After all files: run `describe-index-stats` and report counts per namespace

### Reindex

To reindex a namespace:
1. There is no MCP delete tool -- use the Pinecone dashboard to delete all records in the namespace, OR create a new namespace and update references
2. Re-run bulk load for that namespace
3. Report new counts

## Stats

```
Tool: mcp__plugin_pinecone_pinecone__describe-index-stats
Parameters:
  name: "ophidianai-kb"
```

Report: total records, records per namespace, index fullness (used vs. 100K limit).

## Stale Record Policy

When files are deleted or prospect folders are moved to `shared/archives/`, old records become orphans. This is expected. Reindex the affected namespace when stale records accumulate. Prospect folder names must remain stable once created.

## Rules

- Never block a skill's primary output because of an indexing failure
- Always use deterministic IDs -- same file always produces same record ID
- Do not index: raw Firecrawl JSON, screenshots, staged-emails.json, git history, automation logs, archives, CLAUDE.md files, node_modules
- The file system is always the source of truth, not Pinecone
