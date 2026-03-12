# Tool Documentation Index

Quick lookup for all tools used at OphidianAI. For tools with local documentation, read that first. For everything else, pull latest docs from context7 using the library IDs below.

## How to Use This Index

```
Tool: mcp__plugin_context7_context7__query-docs
Parameters:
  libraryId: "<library ID from table below>"
  query: "<your specific question>"
```

Call `resolve-library-id` first only if you need a version-specific ID or the one listed here fails.

---

## Tools With Local Documentation

These have dedicated reference docs in this repo. Read them first before querying context7.

| Tool | Local Reference | What It Does |
|---|---|---|
| **Pinecone** | `operations/references/pinecone-reference.md` | Vector database, semantic search, knowledge layer |
| **GWS CLI** | `.claude/skills/gws-cli/SKILL.md` | Google Workspace access (Gmail, Calendar, Sheets, Drive, Docs, Tasks) |
| **ClickUp** | `.claude/skills/clickup/SKILL.md` | Project/task management |
| **Web Builder** | `.claude/skills/web-builder/SKILL.md` | 6-phase client website pipeline |
| **Report Generator** | `persistent-memory/tools/report-generation.md` | PDF reports with brand styling |
| **Knowledge Base** | `.claude/skills/knowledge-base/SKILL.md` | Pinecone indexing and query procedures |

---

## Context7 Library IDs

### Core Infrastructure

| Tool | Best Library ID | Snippets | Score | Notes |
|---|---|---|---|---|
| **Pinecone** | `/llmstxt/pinecone_io_llms-full_txt` | 106K | 77.5 | Full docs; also see local reference |
| **Pinecone (website)** | `/websites/pinecone_io` | 2.9K | 61.4 | Shorter, more focused |
| **Supabase** | `/supabase/supabase` | 5.5K | 76.8 | Database, auth, edge functions |
| **Supabase (full docs)** | `/websites/supabase` | 31K | 74.3 | Comprehensive docs site |
| **Vercel** | `/websites/vercel` | 8.5K | 72.2 | Deployment, hosting, domains |
| **Vercel (full docs)** | `/llmstxt/vercel_llms_txt` | 52K | 64.5 | Exhaustive reference |
| **Stripe** | `/websites/stripe` | 49K | 75.7 | Payments, checkout, subscriptions |
| **Stripe Node SDK** | `/stripe/stripe-node` | 130 | 72.8 | Server-side JS integration |

### Frontend Stack

| Tool | Best Library ID | Snippets | Score | Notes |
|---|---|---|---|---|
| **Next.js 15** | `/vercel/next.js` | 3K | 84.4 | App Router, RSC, Server Actions |
| **Tailwind CSS 4** | `/websites/tailwindcss` | 2K | 80.9 | Utility-first CSS framework |
| **Tailwind CSS 3** | `/websites/v3_tailwindcss` | 1.8K | 76.0 | If working with v3 projects |

### Browser & Automation

| Tool | Best Library ID | Snippets | Score | Notes |
|---|---|---|---|---|
| **Playwright** | `/microsoft/playwright` | 3.6K | 89.9 | Screenshots, PDF gen, testing |
| **Playwright (docs site)** | `/microsoft/playwright.dev` | 6.9K | 84.5 | More comprehensive |
| **Firecrawl** | `/websites/firecrawl_dev` | 1.1K | 81.4 | Web scraping, site mapping |
| **Firecrawl (repo)** | `/firecrawl/firecrawl` | 228 | 82.8 | API reference, SDK usage |
| **Firecrawl CLI** | `/firecrawl/cli` | 172 | 80.3 | CLI-specific commands |

### SDKs (When Building Client Integrations)

| Tool | Best Library ID | Snippets | Score | Notes |
|---|---|---|---|---|
| **Pinecone Python** | `/pinecone-io/pinecone-python-client` | 259 | 85.3 | Python SDK |
| **Pinecone TypeScript** | `/pinecone-io/pinecone-ts-client` | 177 | 81.7 | Node/TS SDK |
| **Stripe.js (frontend)** | `/stripe/stripe-js` | 64 | 64.2 | Client-side payment elements |
| **Supabase (llmstxt)** | `/llmstxt/supabase_llms_txt` | 1.5K | 80.2 | Concise LLM-optimized docs |

---

## Tools Without Context7 (Use Plugin Skills or Built-in Docs)

| Tool | How to Access Docs | Notes |
|---|---|---|
| **GitHub CLI (`gh`)** | Built into system; `/code-review:code-review` skill | PR management, issues |
| **Google Workspace** | `gws --help`, `.claude/skills/gws-cli/SKILL.md` | Custom CLI, no context7 needed |
| **ClickUp** | `.claude/skills/clickup/SKILL.md` | Custom wrapper script |
| **Sharp** | npm docs / `sharp --help` | Image optimization (used in web-builder) |
| **Puppeteer** | Use Playwright docs instead (similar API) | Legacy; prefer Playwright |

---

## Version-Specific Lookups

For version-pinned docs, append the version to the library ID:

```
/vercel/next.js/v15.1.8         # Next.js 15.1.8
/microsoft/playwright/v1.51.0   # Playwright 1.51
/stripe/stripe-node/v19.1.0     # Stripe Node 19.1
```

---

## When to Pull Docs

- **Before using an unfamiliar feature** of any tool
- **When hitting an error** you don't recognize
- **When building a new integration** for a client site
- **When a tool has been updated** and behavior may have changed

Do NOT pull docs for routine operations you already know (basic upserts, simple searches, standard deployments). Only query when you need specifics.
