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
