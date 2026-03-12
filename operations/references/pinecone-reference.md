# Pinecone Reference

Quick reference for agents using the Pinecone MCP server. For latest docs, query context7 with library ID `/llmstxt/pinecone_io_llms-full_txt`.

## Our Setup

- **Index:** `ophidianai-kb`
- **Model:** `multilingual-e5-large` (integrated -- Pinecone embeds automatically)
- **Dimension:** 1024
- **Field map:** `{ "text": "text" }` -- the `text` field is embedded
- **Metric:** cosine
- **Tier:** Free (100K vectors, 2GB, 5M embedding tokens/month)
- **API key:** `.env` as `PINECONE_API_KEY`
- **Full skill:** `.claude/skills/knowledge-base/SKILL.md`

## MCP Tools Available

### mcp__plugin_pinecone_pinecone__upsert-records

Upsert records into an integrated index. Pinecone embeds the `text` field automatically.

```
Parameters:
  name: "ophidianai-kb"          # index name
  namespace: "<namespace>"       # target namespace
  records: [                     # array of record objects
    {
      "_id": "<unique-id>",
      "text": "<content to embed>",
      "<field>": "<value>"       # additional metadata fields (flat, no nesting)
    }
  ]
```

**Rules:**
- `_id` is required and must be unique within the namespace
- `text` is the embedded field (must match field_map)
- All other fields are stored as searchable metadata
- No nested objects as field values
- Tags should be native JSON arrays: `["tag1", "tag2"]`
- Upserting with an existing `_id` overwrites the record

### mcp__plugin_pinecone_pinecone__search-records

Semantic search within a single namespace.

```
Parameters:
  name: "ophidianai-kb"
  namespace: "<namespace>"
  query:
    inputs:
      text: "<natural language query>"
    topK: 5                      # number of results (max 10000)
    filter:                      # optional metadata filter
      "<field>": { "<op>": "<value>" }
```

**Filter operators:**
- `$eq` -- equals
- `$ne` -- not equals
- `$gt`, `$gte`, `$lt`, `$lte` -- numeric comparisons
- `$in` -- value in array (e.g., `{ "tags": { "$in": ["restaurant"] } }`)
- `$nin` -- value not in array
- `$exists` -- field exists (true/false)
- `$and`, `$or` -- logical combinators

**Reranking** (optional, improves relevance):
```
  rerank:
    model: "bge-reranker-v2-m3"  # or "pinecone-rerank-v0" or "cohere-rerank-3.5"
    topN: 3                      # results after reranking (must be <= topK)
    rankFields: ["text"]         # fields to rerank on
```

**Score interpretation:**
- > 0.7: Strong match
- 0.5-0.7: Moderate match
- 0.3-0.5: Weak match
- < 0.3: Noise -- discard

### mcp__plugin_pinecone_pinecone__describe-index-stats

Get record counts per namespace and total index stats.

```
Parameters:
  name: "ophidianai-kb"
```

Returns: `totalRecordCount`, `dimension`, per-namespace `recordCount`.

### mcp__plugin_pinecone_pinecone__list-indexes

List all indexes in the Pinecone project. No parameters required.

### mcp__plugin_pinecone_pinecone__describe-index

Get detailed index configuration (model, metric, dimension, host, status).

```
Parameters:
  name: "ophidianai-kb"
```

### mcp__plugin_pinecone_pinecone__create-index-for-model

Create a new integrated index with an embedding model.

```
Parameters:
  name: "<index-name>"
  cloud: "aws"                   # or "gcp", "azure"
  region: "us-east-1"
  embed:
    model: "multilingual-e5-large"
    field_map:
      text: "<your-text-field>"
    metric: "cosine"             # optional, defaults per model
```

### mcp__plugin_pinecone_pinecone__rerank-documents

Rerank a list of documents against a query (standalone, outside of search).

```
Parameters:
  model: "bge-reranker-v2-m3"
  query: "<query text>"
  documents: ["<doc1>", "<doc2>", ...]
  topN: 3
```

### mcp__plugin_pinecone_pinecone__cascading-search

Cross-INDEX search (not cross-namespace). Searches multiple indexes in sequence.
**Not useful for our setup** -- we use one index with multiple namespaces. Use parallel `search-records` calls instead.

## Deletion (SDK/API Only -- No MCP Tool)

The MCP server does not expose delete operations. Use the SDK or REST API:

**Delete by ID:**
```python
index.delete(ids=["id-1", "id-2"], namespace="example-namespace")
```

**Delete by metadata filter:**
```python
index.delete(
    filter={"genre": {"$eq": "documentary"}},
    namespace="example-namespace"
)
```

**Delete all records in a namespace:**
```javascript
await index.namespace('foo-namespace').deleteAll();
```

**Delete entire namespace (including all data):**
```javascript
await index.deleteNamespace('ns1');
```

**List namespaces:**
```javascript
const namespaces = await index.listNamespaces();
```

For reindexing without SDK access: use Pinecone dashboard to delete namespace contents, then re-run bulk load.

## Full Documentation Map

Latest API version: **2025-04**. The docs site has several major sections. Query context7 for details on any topic below.

### Getting Started

| Topic | URL | Notes |
|---|---|---|
| Quickstart | https://docs.pinecone.io/guides/get-started/quickstart | End-to-end setup tutorial |
| Architecture | https://docs.pinecone.io/guides/get-started/database-architecture | Serverless architecture, how indexes work |
| Glossary | https://docs.pinecone.io/guides/get-started/glossary | Key terms and definitions |

### Indexes

| Topic | URL | Notes |
|---|---|---|
| Create an Index | https://docs.pinecone.io/guides/index-data/create-an-index | Index types, embedding models, configuration |
| Embedding Models | https://docs.pinecone.io/guides/index-data/create-an-index#embedding-models | Available models for integrated indexes |
| multilingual-e5-large | https://docs.pinecone.io/models/multilingual-e5-large | Our model -- 1024 dim, cosine metric |
| Manage Indexes | https://docs.pinecone.io/guides/index-data/manage-indexes | List, describe, configure, delete indexes |
| Namespaces | https://docs.pinecone.io/guides/index-data/use-namespaces | Partition data within an index |
| Deletion Protection | https://docs.pinecone.io/guides/index-data/manage-indexes#deletion-protection | Prevent accidental index deletion |

### Data Operations

| Topic | URL | Notes |
|---|---|---|
| Upsert Data | https://docs.pinecone.io/guides/index-data/upsert-data | Insert or update records |
| Update Data | https://docs.pinecone.io/guides/manage-data/update-data | Update metadata without re-embedding |
| Delete Data | https://docs.pinecone.io/guides/manage-data/delete-data | By ID, by filter, by namespace, delete all |
| Fetch Data | https://docs.pinecone.io/guides/manage-data/fetch-data | Retrieve records by ID (no search) |
| List Record IDs | https://docs.pinecone.io/guides/manage-data/list-record-ids | Paginate through all record IDs |
| Import Data | https://docs.pinecone.io/guides/index-data/import-data | Bulk import from cloud storage (Parquet) |
| Backups | https://docs.pinecone.io/guides/manage-data/backups | Create, list, restore index backups |
| Collections (Legacy) | https://docs.pinecone.io/guides/manage-data/back-up-an-index | Legacy backup method via collections |

### Search & Query

| Topic | URL | Notes |
|---|---|---|
| Search Data | https://docs.pinecone.io/guides/search/search-data | Semantic search with integrated embedding |
| Query Data | https://docs.pinecone.io/guides/search/query-data | Query with raw vectors (non-integrated) |
| Filter Results | https://docs.pinecone.io/guides/search/filter-search-results | Metadata filtering ($eq, $in, $and, etc.) |
| Sparse Vectors | https://docs.pinecone.io/guides/index-data/indexing-sparse-vectors | Keyword/BM25-style search |
| Hybrid Search | https://docs.pinecone.io/guides/search/search-with-sparse-vectors | Combine dense + sparse for best results |
| Sample Datasets | https://docs.pinecone.io/guides/data/use-sample-datasets | Pre-built datasets for testing |

### Inference

| Topic | URL | Notes |
|---|---|---|
| Understanding Inference | https://docs.pinecone.io/guides/inference/understanding-inference | Embedding and reranking overview |
| Generate Embeddings | https://docs.pinecone.io/guides/inference/generate-embeddings | Standalone embedding API |
| Reranking | https://docs.pinecone.io/guides/inference/understanding-inference#reranking-models | Models: bge-reranker-v2-m3, pinecone-rerank-v0, cohere-rerank-3.5 |

### Assistants

| Topic | URL | Notes |
|---|---|---|
| Understanding Assistants | https://docs.pinecone.io/guides/assistant/understanding-assistants | Document Q&A with citations |
| Manage Assistants | https://docs.pinecone.io/guides/assistant/manage-assistants | Create, configure, delete assistants |
| Upload Files | https://docs.pinecone.io/guides/assistant/upload-files | Feed documents to assistants |
| Chat with Assistant | https://docs.pinecone.io/guides/assistant/chat-with-assistant | Query assistant for answers |
| Context Retrieval | https://docs.pinecone.io/guides/assistant/retrieve-context | Get relevant context without chat |

### Operations & Admin

| Topic | URL | Notes |
|---|---|---|
| MCP Server | https://docs.pinecone.io/guides/operations/mcp-server | Our primary interface |
| Local Development | https://docs.pinecone.io/guides/operations/local-development | Local testing with Pinecone |
| Monitoring | https://docs.pinecone.io/guides/operations/monitoring | Usage metrics and dashboards |
| Manage API Keys | https://docs.pinecone.io/guides/projects/manage-api-keys | Create, rotate, scope keys |
| Projects | https://docs.pinecone.io/guides/projects/understanding-projects | Project organization |
| Organizations | https://docs.pinecone.io/guides/projects/understanding-organizations | Multi-project management |
| Security Overview | https://docs.pinecone.io/guides/security/overview | Security architecture |
| RBAC | https://docs.pinecone.io/guides/security/rbac | Role-based access control |

### API Reference (2025-04)

| Group | Endpoints |
|---|---|
| **Indexes** | list, create_for_model, describe, delete, configure, describe_index_stats |
| **Namespaces** | list_namespaces, describe_namespace, delete_namespace |
| **Vectors** | upsert, upsert_records, fetch, update, delete, list |
| **Search** | query (raw vectors), search_records (integrated) |
| **Imports** | start_import, list_imports, describe_import, cancel_import |
| **Backups** | create, list (project/index), describe, delete, create_index_from_backup, restore jobs |
| **Inference** | generate_embeddings, rerank, list_models, describe_model |
| **Admin** | API keys (CRUD), projects (CRUD), service accounts (get_token) |

### Limits & Constraints

| Topic | URL |
|---|---|
| Database Limits | https://docs.pinecone.io/reference/api/database-limits |
| Known Limitations | https://docs.pinecone.io/reference/api/known-limitations |
| Authentication | https://docs.pinecone.io/reference/api/authentication |
| API Versioning | https://docs.pinecone.io/reference/api/versioning |
| Error Codes | https://docs.pinecone.io/reference/api/errors |

### SDKs

| Language | Reference |
|---|---|
| Python | https://docs.pinecone.io/reference/python-sdk |
| Node.js/TypeScript | https://docs.pinecone.io/reference/node-sdk |
| Java | https://docs.pinecone.io/reference/java-sdk |
| Go | https://docs.pinecone.io/reference/go-sdk |
| .NET | https://docs.pinecone.io/reference/dotnet-sdk |
| Rust | https://docs.pinecone.io/reference/rust-sdk |

### Tools & Integrations

| Tool | URL | Notes |
|---|---|---|
| Pinecone CLI | https://docs.pinecone.io/guides/operations/pinecone-cli | Terminal management of indexes |
| Text Client | https://docs.pinecone.io/reference/tools/pinecone-text-client | Text-to-sparse-vector conversion |
| Spark Connector | https://docs.pinecone.io/reference/tools/pinecone-spark-connector | Bulk data pipeline from Spark |

## Context7 Quick Reference

To pull latest Pinecone docs in any session:

```
Tool: mcp__plugin_context7_context7__query-docs
Parameters:
  libraryId: "/llmstxt/pinecone_io_llms-full_txt"
  query: "<your specific question>"
```

Alternative library IDs:
- `/websites/pinecone_io` -- website docs (2861 snippets)
- `/pinecone-io/pinecone-python-client` -- Python SDK (259 snippets)
- `/pinecone-io/pinecone-ts-client` -- TypeScript SDK (177 snippets)

## Common Patterns

### Cross-namespace search
Run parallel `search-records` calls against 2-3 namespaces. Merge by score, deduplicate by `source_file`.

### Idempotent upserts
Same `_id` always overwrites. Use deterministic IDs based on file paths to prevent duplicates.

### Chunking large documents
Split by H2/H3 headings when over 2000 chars. Each chunk gets ID `<base-id>#chunk-<n>` with a `chunk_index` field.

### Graceful degradation
Never block a skill's primary output because of a Pinecone failure. Log it, move on, reindex later.
