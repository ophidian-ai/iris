# Pinecone Knowledge Layer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a unified Pinecone vector knowledge layer that auto-indexes data across all OphidianAI skills and enables semantic search for agents and Eric.

**Architecture:** Single Pinecone integrated index (`ophidianai-kb`) with 7 namespaces, using `multilingual-e5-large` for embeddings. A new `knowledge-base` skill provides the indexing utility, query interface, and bulk load. Existing skills get a "Knowledge Base" section appended that calls the indexing procedure after producing data.

**Tech Stack:** Pinecone MCP tools (`upsert-records`, `search-records`, `create-index-for-model`, `describe-index-stats`), existing SKILL.md convention.

**Spec:** `docs/superpowers/specs/2026-03-11-pinecone-knowledge-layer-design.md`

---

## Chunk 1: Index Creation & Knowledge Base Skill

### Task 1: Create the Pinecone Index

**Files:**
- None (MCP tool operation)

- [ ] **Step 1: Create the integrated index**

Use the Pinecone MCP tool to create the index:

```
Tool: mcp__plugin_pinecone_pinecone__create-index-for-model
Parameters:
  name: "ophidianai-kb"
  cloud: "aws"
  region: "us-east-1"
  embed.model: "multilingual-e5-large"
  embed.fieldMap.text: "text"
```

- [ ] **Step 2: Verify the index was created**

```
Tool: mcp__plugin_pinecone_pinecone__describe-index
Parameters:
  name: "ophidianai-kb"
```

Expected: Index exists with model `multilingual-e5-large`, field map `text: "text"`, status `Ready`.

- [ ] **Step 3: Test upsert and search with a sample record**

Upsert a test record:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "agent-memory"
  records: [
    {
      "_id": "test/smoke-test",
      "text": "This is a smoke test record to verify the knowledge layer is working correctly.",
      "source_file": "test/smoke-test.md",
      "department": "operations",
      "created_date": "2026-03-11",
      "updated_date": "2026-03-11",
      "tags": ["test", "smoke-test"]
    }
  ]
```

Then search for it:

```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "agent-memory"
  query.inputs.text: "smoke test verification"
  query.topK: 1
```

Expected: Returns the smoke test record with a high relevance score (> 0.7).

- [ ] **Step 4: Delete the smoke test record**

Note: Pinecone MCP does not have a delete tool. The smoke test record is harmless (one record in agent-memory namespace). It will be overwritten during bulk load or can be cleaned up via Pinecone dashboard. Leave it for now.

- [ ] **Step 5: Commit -- no file changes for this task (index is remote)**

No commit needed. The index exists in Pinecone, not in the repo.

---

### Task 2: Create the Knowledge Base Skill

**Files:**
- Create: `.claude/skills/knowledge-base/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ".claude/skills/knowledge-base"
```

- [ ] **Step 2: Write the SKILL.md**

Create `.claude/skills/knowledge-base/SKILL.md` with the following content:

```markdown
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

## Namespaces

| Namespace | Contents |
|---|---|
| `prospects` | Prospect READMEs, technical audits, score cards, proposal summaries |
| `outreach` | Cold emails, follow-ups, reply outcomes, offer delivery records |
| `operations` | SOPs, pricing, templates, references, lead sources |
| `decisions` | Individual decision log entries |
| `agent-memory` | Persistent memory vault notes, cross-session learnings |
| `research` | Firecrawl research, prospect research, SEO audits |
| `projects` | Project READMEs, design specs, tech decisions |

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
| `agent-memory` | `persistent-memory/**/*.md` (exclude `_index.md` and `.obsidian/`) |
| `research` | `.firecrawl/cold-leads/*.md`, `.firecrawl/prospect-research/*.md` (skip `.json` files) |
| `projects` | `engineering/projects/*/README.md`, `docs/superpowers/specs/*.md` |

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
```

- [ ] **Step 3: Verify skill is discoverable**

```bash
ls ".claude/skills/knowledge-base/SKILL.md"
```

Expected: File exists.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/knowledge-base/SKILL.md
git commit -m "feat: add knowledge-base skill for Pinecone knowledge layer

Provides indexing procedure, query interface, bulk load, stats,
and reindex commands for the ophidianai-kb Pinecone index.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Update CLAUDE.md and work.md

**Files:**
- Modify: `CLAUDE.md` (Tool Integrations section)
- Modify: `iris/context/work.md` (MCP Servers and Tools sections)

- [ ] **Step 1: Add Pinecone to CLAUDE.md Tool Integrations**

In `CLAUDE.md`, find the `## Tool Integrations` section. Add after the GWS CLI entry:

```markdown
- **Pinecone** -- Vector knowledge layer (semantic search across prospects, outreach, decisions, operations). See `.claude/skills/knowledge-base/SKILL.md`.
```

- [ ] **Step 2: Update iris/context/work.md**

In `iris/context/work.md`, update the `## MCP Servers` section from:

```markdown
## MCP Servers
- None connected currently.
```

To:

```markdown
## MCP Servers
- **Pinecone** -- Vector knowledge layer (`ophidianai-kb` index). Provides semantic search across all business data. See `.claude/skills/knowledge-base/SKILL.md`.
```

Also add Pinecone to the `## Tools` section:

```markdown
- **Pinecone** -- Vector database for semantic search (knowledge layer)
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md iris/context/work.md
git commit -m "docs: add Pinecone to tool integrations and work context

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: Bulk Load

### Task 4: Bulk Load -- prospects namespace

**Files:**
- None (MCP tool operations on existing data)

- [ ] **Step 1: Glob all prospect source files**

```bash
# Find all README.md, technical-audit.md, and score-card.md files
find sales/lead-generation/prospects -name "README.md" -o -name "technical-audit.md" -o -name "score-card.md" 2>/dev/null
```

- [ ] **Step 2: For each file, read content, build record, upsert**

For each file found:
1. Read the file content
2. If empty, skip
3. Build the record:
   - `_id`: `prospects/<prospect-slug>/<filename-without-ext>` (e.g., `prospects/sak-automotive/README`)
   - `text`: file content (chunk if over 2000 chars)
   - `source_file`: relative path
   - `department`: `revenue`
   - `created_date`: today's date (or parse from file if available)
   - `updated_date`: today's date
   - `tags`: extract industry, location, status from content if possible
4. Upsert via `upsert-records` with namespace `prospects`

- [ ] **Step 3: Verify with stats**

```
Tool: mcp__plugin_pinecone_pinecone__describe-index-stats
Parameters:
  name: "ophidianai-kb"
```

Expected: `prospects` namespace shows record count matching files indexed.

---

### Task 5: Bulk Load -- outreach namespace

- [ ] **Step 1: Glob outreach files**

```bash
find sales/lead-generation/prospects -path "*/outreach/*.txt" 2>/dev/null
```

- [ ] **Step 2: For each file, read, build record, upsert**

For each outreach file:
- `_id`: `outreach/<prospect-slug>/<filename-without-ext>` (e.g., `outreach/sak-automotive/cold-email-v1`)
- `text`: file content
- `source_file`: relative path
- `department`: `revenue`
- `tags`: extract template name, industry if identifiable from content
- Namespace: `outreach`

- [ ] **Step 3: Verify counts**

Check `describe-index-stats` for `outreach` namespace.

---

### Task 6: Bulk Load -- operations namespace

- [ ] **Step 1: Glob operations source files**

```bash
ls operations/references/sops/*.md operations/references/pricing-structure.md operations/references/niche-offer-templates.md operations/templates/*.md sales/lead-generation/lead-sources.md 2>/dev/null
```

- [ ] **Step 2: For each file, read, build record, upsert**

- `_id`: `operations/<relative-path-without-ext>` (e.g., `operations/references/sops/client-handoff`)
- `department`: `operations`
- `tags`: derive from content (e.g., `["sop", "client-handoff"]` or `["pricing"]`)
- Namespace: `operations`

Apply chunking for files over 2000 chars.

- [ ] **Step 3: Verify counts**

---

### Task 7: Bulk Load -- decisions namespace

- [ ] **Step 1: Read the decision log**

Read `operations/decisions/log.md`.

- [ ] **Step 2: Split by entry and upsert each**

Split the file by `###` headings. Each `###` block is one decision entry. For each entry:
- `_id`: `decisions/log#<date>` (extract the date from the entry, e.g., `decisions/log#2026-03-07`)
- `text`: the full entry text (heading + body)
- `source_file`: `operations/decisions/log.md`
- `department`: `operations`
- `tags`: `["decision"]` + any department tags derivable from content
- Namespace: `decisions`

- [ ] **Step 3: Verify counts**

---

### Task 8: Bulk Load -- agent-memory namespace

- [ ] **Step 1: Glob persistent memory files**

```bash
find persistent-memory -name "*.md" ! -name "_index.md" ! -path "*/.obsidian/*" 2>/dev/null
```

- [ ] **Step 2: For each file, read, build record, upsert**

- `_id`: `agent-memory/<relative-path-without-ext>` (e.g., `agent-memory/projects/bloomin-acres`)
- `department`: derive from folder (`projects` -> `engineering`, `tools` -> `operations`, `operations` -> `operations`, `preferences` -> `operations`)
- `tags`: extract from frontmatter `tags` field if present
- Namespace: `agent-memory`

- [ ] **Step 3: Verify counts**

---

### Task 9: Bulk Load -- research namespace

- [ ] **Step 1: Glob research files**

```bash
find .firecrawl/cold-leads -name "*.md" 2>/dev/null
find .firecrawl/prospect-research -name "*.md" 2>/dev/null
```

Skip any `.json` files.

- [ ] **Step 2: For each file, read, build record, upsert**

- `_id`: `research/<relative-path-without-ext>` (e.g., `research/cold-leads/columbus-restaurants`)
- `department`: `revenue`
- `tags`: extract industry/location from content
- Namespace: `research`

Apply chunking for long research documents.

- [ ] **Step 3: Verify counts**

---

### Task 10: Bulk Load -- projects namespace

- [ ] **Step 1: Glob project files**

```bash
ls engineering/projects/*/README.md docs/superpowers/specs/*.md 2>/dev/null
```

- [ ] **Step 2: For each file, read, build record, upsert**

- `_id`: `projects/<relative-path-without-ext>` (e.g., `projects/bloomin-acres/README`)
- `department`: `engineering`
- `tags`: extract project name, tech stack from content
- Namespace: `projects`

Apply chunking for long spec documents.

- [ ] **Step 3: Verify counts**

- [ ] **Step 4: Final verification -- full index stats**

```
Tool: mcp__plugin_pinecone_pinecone__describe-index-stats
Parameters:
  name: "ophidianai-kb"
```

Expected: All 7 namespaces populated, total records ~200. Report the exact counts.

- [ ] **Step 5: Test a cross-namespace query**

Run a search to verify the knowledge layer is working end-to-end:

```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "prospects"
  query.inputs.text: "auto service business website"
  query.topK: 3
```

Expected: Returns relevant prospect records with scores > 0.5.

---

## Chunk 3: Skill Indexing Hooks

For each skill below, append a `## Knowledge Base` section at the end of the SKILL.md. The section tells the skill to index its output after completing its primary workflow.

### Task 11: Add indexing hook to business-research

**Files:**
- Modify: `.claude/skills/business-research/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `.claude/skills/business-research/SKILL.md` to find the end of the file.

- [ ] **Step 2: Append the Knowledge Base section**

Add at the end of `.claude/skills/business-research/SKILL.md`:

```markdown

## Knowledge Base

After saving research to `sales/lead-generation/prospects/[slug]/research/initial-research.md`, index it:

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
    "source_file": "sales/lead-generation/prospects/<slug>/research/initial-research.md",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "<location>", "prospect-research"]
  }]
```

3. Log: `Indexed to knowledge base: research/<prospect-slug>/initial-research`

If indexing fails, log the error and continue. Do not block research output.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/business-research/SKILL.md
git commit -m "feat: add knowledge base indexing hook to business-research skill

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 12: Add indexing hook to prospect-scoring

**Files:**
- Modify: `.claude/skills/prospect-scoring/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

- [ ] **Step 2: Append the Knowledge Base section**

Add at the end of `.claude/skills/prospect-scoring/SKILL.md`:

```markdown

## Knowledge Base

After generating the score card, index it (and the README if it exists):

1. Upsert the score card:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "prospects"
  records: [{
    "_id": "prospects/<prospect-slug>/research/score-card",
    "text": "<score card content>",
    "source_file": "sales/lead-generation/prospects/<slug>/research/score-card.md",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "<tier>", "score-card"]
  }]
```

2. If `sales/lead-generation/prospects/<slug>/README.md` exists, also upsert it:

```
  records: [{
    "_id": "prospects/<prospect-slug>/README",
    "text": "<README content>",
    "source_file": "sales/lead-generation/prospects/<slug>/README.md",
    ...same metadata pattern...
  }]
```

3. Log: `Indexed to knowledge base: prospects/<prospect-slug>/research/score-card`

If indexing fails, log the error and continue.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/prospect-scoring/SKILL.md
git commit -m "feat: add knowledge base indexing hook to prospect-scoring skill

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 13: Add indexing hook to cold-email-outreach

**Files:**
- Modify: `.claude/skills/cold-email-outreach/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

- [ ] **Step 2: Append the Knowledge Base section**

```markdown

## Knowledge Base

After drafting the cold email and saving to `sales/lead-generation/prospects/[slug]/outreach/`, index it:

1. Upsert the email:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  records: [{
    "_id": "outreach/<prospect-slug>/<email-filename-without-ext>",
    "text": "<email content>",
    "source_file": "sales/lead-generation/prospects/<slug>/outreach/<filename>",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "<template-name>", "cold-email"]
  }]
```

2. Log: `Indexed to knowledge base: outreach/<prospect-slug>/<filename>`

If indexing fails, log the error and continue.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/cold-email-outreach/SKILL.md
git commit -m "feat: add knowledge base indexing hook to cold-email-outreach skill

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 14: Add indexing hook to follow-up-email

**Files:**
- Modify: `.claude/skills/follow-up-email/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

- [ ] **Step 2: Append the Knowledge Base section**

```markdown

## Knowledge Base

After drafting the follow-up email and saving, index it:

1. Upsert the follow-up:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  records: [{
    "_id": "outreach/<prospect-slug>/<followup-filename-without-ext>",
    "text": "<follow-up email content>",
    "source_file": "sales/lead-generation/prospects/<slug>/outreach/<filename>",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "follow-up", "sequence-<N>"]
  }]
```

2. Log: `Indexed to knowledge base: outreach/<prospect-slug>/<filename>`

If indexing fails, log the error and continue.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/follow-up-email/SKILL.md
git commit -m "feat: add knowledge base indexing hook to follow-up-email skill

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 15: Add indexing hook to offer-delivery

**Files:**
- Modify: `.claude/skills/offer-delivery/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

- [ ] **Step 2: Append the Knowledge Base section**

```markdown

## Knowledge Base

After delivering the offer and logging the outcome, index it:

1. Upsert the outcome record:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  records: [{
    "_id": "outreach/<prospect-slug>/offer-delivery",
    "text": "<outcome summary -- what was offered, whether accepted, what was delivered>",
    "source_file": "sales/lead-generation/prospects/<slug>/outreach/offer-delivery.md",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "offer-delivery", "<outcome: accepted|declined>"]
  }]
```

2. Log: `Indexed to knowledge base: outreach/<prospect-slug>/offer-delivery`

If indexing fails, log the error and continue.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/offer-delivery/SKILL.md
git commit -m "feat: add knowledge base indexing hook to offer-delivery skill

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 16: Add indexing hook to proposal-generator

**Files:**
- Modify: `.claude/skills/proposal-generator/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

- [ ] **Step 2: Append the Knowledge Base section**

```markdown

## Knowledge Base

After generating the proposal, index a summary:

1. Upsert the proposal summary:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "prospects"
  records: [{
    "_id": "prospects/<prospect-slug>/proposal",
    "text": "<proposal summary -- scope, pricing tier, services included, timeline>",
    "source_file": "sales/lead-generation/prospects/<slug>/proposal.md",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "<service-tier>", "proposal"]
  }]
```

2. Log: `Indexed to knowledge base: prospects/<prospect-slug>/proposal`

If indexing fails, log the error and continue.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/proposal-generator/SKILL.md
git commit -m "feat: add knowledge base indexing hook to proposal-generator skill

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 17: Add indexing hook to seo-audit

**Files:**
- Modify: `.claude/skills/seo-audit/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

- [ ] **Step 2: Append the Knowledge Base section**

```markdown

## Knowledge Base

After completing the SEO audit, index the findings summary:

1. Upsert the audit summary:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "research"
  records: [{
    "_id": "research/<prospect-slug>/seo-audit",
    "text": "<audit findings summary -- scores, key issues, recommendations>",
    "source_file": "<path to audit output file>",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "seo-audit", "<overall-score-tier>"]
  }]
```

2. Log: `Indexed to knowledge base: research/<prospect-slug>/seo-audit`

If indexing fails, log the error and continue.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/seo-audit/SKILL.md
git commit -m "feat: add knowledge base indexing hook to seo-audit skill

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 18: Add indexing hook to web-builder

**Files:**
- Modify: `.claude/skills/web-builder/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

- [ ] **Step 2: Append the Knowledge Base section**

```markdown

## Knowledge Base

After completing a project phase, index the project README updates:

1. Upsert the project README:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "projects"
  records: [{
    "_id": "projects/<project-slug>/README",
    "text": "<README content>",
    "source_file": "engineering/projects/<project-slug>/README.md",
    "department": "engineering",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<project-name>", "<tech-stack>", "project"]
  }]
```

2. Log: `Indexed to knowledge base: projects/<project-slug>/README`

If indexing fails, log the error and continue.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/web-builder/SKILL.md
git commit -m "feat: add knowledge base indexing hook to web-builder skill

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

### Task 19: Add incremental indexing guidance to knowledge-base skill for decisions and SOPs

The spec requires that decisions and SOPs are indexed when created/updated, but there is no individual skill that "owns" these writes -- any session can append to the decision log or update an SOP. Rather than modifying every possible entry point, add explicit guidance to the knowledge-base SKILL.md so that any agent writing decisions or SOPs knows to index.

**Files:**
- Modify: `.claude/skills/knowledge-base/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

- [ ] **Step 2: Add an "Incremental Indexing Triggers" section**

Add after the "Indexing Procedure" section in `.claude/skills/knowledge-base/SKILL.md`:

```markdown

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

When creating or updating any note in `persistent-memory/` (except `_index.md` and `.obsidian/`), index it:

- `_id`: `agent-memory/<relative-path-without-ext>` (e.g., `agent-memory/projects/bloomin-acres`)
- `text`: note content (excluding frontmatter)
- `source_file`: relative path
- `department`: derive from folder
- `tags`: extract from frontmatter `tags` field if present
- Namespace: `agent-memory`

These are not enforced by hooks -- they rely on agent discipline. Any agent that writes to these locations should follow the indexing procedure above.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/knowledge-base/SKILL.md
git commit -m "feat: add incremental indexing triggers for decisions, SOPs, and memory

Ensures decisions, SOP updates, and persistent memory notes
are indexed as they are created, not just during bulk loads.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 4: Query Hooks & Verification

### Task 20: Add query hooks to morning-coffee

**Files:**
- Modify: `.claude/skills/morning-coffee/SKILL.md`

- [ ] **Step 1: Read the current SKILL.md**

Read `.claude/skills/morning-coffee/SKILL.md` to find where to add the query hook.

- [ ] **Step 2: Add a Knowledge Base query step**

Add after Step 1 (Gather Data) in the morning-coffee process, as a new parallel data-gathering sub-step:

```markdown
**Knowledge Base -- Context Enrichment:**

Query Pinecone for context relevant to today's briefing. Run these in parallel with other Step 1 data gathering:

1. Recent decisions:
```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "decisions"
  query.inputs.text: "recent business decisions priorities"
  query.topK: 3
```

2. Hot prospects (if any prospects have status "Replied" or "Follow-Up Due"):
```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  query.inputs.text: "<prospect name> outreach history"
  query.topK: 3
```

3. Use retrieved context to enrich the Recommendations section (Step 4). For example:
   - If a decision about pricing was made recently, factor it into proposal recommendations
   - If outreach history shows a pattern (e.g., certain industries respond better), mention it
   - If a prospect's full history is available, provide richer follow-up recommendations

If Pinecone is unavailable, skip silently. The briefing must never fail because of a knowledge base query.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/morning-coffee/SKILL.md
git commit -m "feat: add knowledge base query hooks to morning-coffee skill

Enriches daily briefing recommendations with semantic context
from decisions, outreach history, and prospect data.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 21: End-to-End Verification

- [ ] **Step 1: Run full index stats**

```
Tool: mcp__plugin_pinecone_pinecone__describe-index-stats
Parameters:
  name: "ophidianai-kb"
```

Report total records and per-namespace breakdown.

- [ ] **Step 2: Test scoped query -- prospects**

```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "prospects"
  query.inputs.text: "businesses that need website redesign"
  query.topK: 3
```

Expected: Returns prospect records with relevant scores.

- [ ] **Step 3: Test scoped query -- outreach**

```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  query.inputs.text: "cold email auto service"
  query.topK: 3
```

Expected: Returns outreach email records.

- [ ] **Step 4: Test scoped query -- decisions**

```
Tool: mcp__plugin_pinecone_pinecone__search-records
Parameters:
  name: "ophidianai-kb"
  namespace: "decisions"
  query.inputs.text: "pricing strategy"
  query.topK: 3
```

Expected: Returns relevant decision log entries.

- [ ] **Step 5: Test cross-namespace query**

Run parallel queries against `prospects` and `outreach` namespaces for the same query, then compare results:

Query: "restaurant businesses in Columbus"
- Search `prospects` namespace, topK 3
- Search `outreach` namespace, topK 3

Expected: Results from both namespaces with relevance scores. Verify deduplication by `source_file` works (same prospect shouldn't appear twice from different namespaces).

- [ ] **Step 6: Report results to Eric**

Summarize:
- Total records indexed per namespace
- Sample query results and relevance scores
- Any namespaces that came back empty (investigate)
- Knowledge layer status: operational / issues found

---

### Task 22: Update Persistent Memory

**Files:**
- Create or update: `persistent-memory/tools/pinecone-knowledge-layer.md`
- Modify: `persistent-memory/_index.md`

- [ ] **Step 1: Create the persistent memory note**

Create `persistent-memory/tools/pinecone-knowledge-layer.md`:

```markdown
---
tags: [tools, pinecone, knowledge-layer]
created: 2026-03-11
updated: 2026-03-11
---

# Pinecone Knowledge Layer

- **Index:** `ophidianai-kb` on Pinecone (integrated, `multilingual-e5-large`)
- **Namespaces:** prospects, outreach, operations, decisions, agent-memory, research, projects
- **Skill:** `.claude/skills/knowledge-base/SKILL.md`
- **Spec:** `docs/superpowers/specs/2026-03-11-pinecone-knowledge-layer-design.md`
- **Tier:** Free tier (100K vectors, 2GB). Upgrade when revenue justifies.
- **API key:** In `.env` as `PINECONE_API_KEY`
- **Auto-indexing:** Skills index data after producing it. See each skill's "Knowledge Base" section.
- **Stale records:** Reindex namespace when files are deleted/moved. Prospect folders must not be renamed after indexing.

## Related

- [[web-builder-skill]] -- indexes project READMEs
- [[prospect-pipeline]] -- prospects and outreach namespaces
```

- [ ] **Step 2: Update the memory index**

Add to `persistent-memory/_index.md` under the Tools section:

```markdown
- `tools/pinecone-knowledge-layer.md` -- Pinecone index config, namespaces, API key location, stale record policy
```

- [ ] **Step 3: Update the MEMORY.md index**

Add to `C:\Users\Eric\.claude\projects\c--Claude-Code-OphidianAI\memory\MEMORY.md` under the Tools section:

```markdown
- `persistent-memory/tools/pinecone-knowledge-layer.md` -- Pinecone index config, namespaces, skill location, stale record policy
```

- [ ] **Step 4: Commit**

```bash
git add persistent-memory/tools/pinecone-knowledge-layer.md persistent-memory/_index.md
git commit -m "docs: add Pinecone knowledge layer to persistent memory

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```
