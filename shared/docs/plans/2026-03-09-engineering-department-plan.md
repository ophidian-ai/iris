# Engineering Department Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give the Engineering department real substance by creating its folder structure, moving relevant assets, and updating all references.

**Architecture:** Create `engineering/{projects,tools,references,templates,specs}`, move submodules and files, update all docs and agent definitions that reference old paths.

**Tech Stack:** Git (submodule moves), Markdown updates

---

### Task 1: Create Engineering folder structure

**Files:**
- Create: `engineering/projects/.gitkeep`
- Create: `engineering/tools/.gitkeep`
- Create: `engineering/references/.gitkeep`
- Create: `engineering/templates/.gitkeep`
- Create: `engineering/specs/.gitkeep`

**Step 1: Create directories with .gitkeep files**

```bash
mkdir -p engineering/projects engineering/tools engineering/references engineering/templates engineering/specs
touch engineering/tools/.gitkeep engineering/references/.gitkeep engineering/templates/.gitkeep engineering/specs/.gitkeep
```

Note: `engineering/projects/` will not need a .gitkeep since submodules will populate it.

**Step 2: Commit**

```bash
git add engineering/
git commit -m "Create Engineering department folder structure"
```

---

### Task 2: Move submodules to engineering/projects/

Both projects are git submodules. Bloomin' Acres has a broken .gitmodules entry (tracked as submodule but missing from .gitmodules). OphidianAI site is properly configured.

**Files:**
- Modify: `.gitmodules`

**Step 1: Move OphidianAI site submodule**

```bash
git mv revenue/projects/active/ophidian-ai engineering/projects/ophidian-ai
```

This automatically updates `.gitmodules`.

**Step 2: Move Bloomin' Acres submodule**

Bloomin' Acres is tracked as a submodule (gitlink in index) but has no .gitmodules entry. Handle carefully:

```bash
git mv revenue/projects/active/bloomin-acres engineering/projects/bloomin-acres
```

If `git mv` fails because of the missing .gitmodules entry, manually:
1. Add the .gitmodules entry for bloomin-acres at the new path
2. `git rm revenue/projects/active/bloomin-acres`
3. `git submodule add <url> engineering/projects/bloomin-acres`

**Step 3: Verify submodules**

```bash
git submodule status
cat .gitmodules
```

Both should show `engineering/projects/` paths.

**Step 4: Commit**

```bash
git add .gitmodules engineering/projects/ revenue/projects/
git commit -m "Move project submodules to engineering/projects/"
```

---

### Task 3: Move tools and references

**Files:**
- Move: `operations/tools/generate-report-pdf.mjs` -> `engineering/tools/generate-report-pdf.mjs`
- Move: `operations/references/design/animation-patterns.md` -> `engineering/references/animation-patterns.md`
- Move: `operations/references/design/ecommerce-patterns.md` -> `engineering/references/ecommerce-patterns.md`

**Step 1: Move files**

```bash
git mv operations/tools/generate-report-pdf.mjs engineering/tools/generate-report-pdf.mjs
git mv operations/references/design/animation-patterns.md engineering/references/animation-patterns.md
git mv operations/references/design/ecommerce-patterns.md engineering/references/ecommerce-patterns.md
```

**Step 2: Clean up empty directories**

```bash
rmdir operations/tools
rmdir operations/references/design
```

If other files remain in those directories, leave them.

**Step 3: Commit**

```bash
git add operations/ engineering/
git commit -m "Move dev tools and design references to Engineering"
```

---

### Task 4: Update Dev Agent AGENT.md

**Files:**
- Modify: `.claude/agents/engineering/dev/AGENT.md`

**Step 1: Update references**

Add Engineering department paths to the agent definition:

- Add section "## Department Resources" pointing to:
  - `engineering/projects/` -- active client builds
  - `engineering/tools/` -- build scripts and generators
  - `engineering/references/` -- design patterns and code standards
  - `engineering/templates/` -- project scaffolds and boilerplate
  - `engineering/specs/` -- technical specs and architecture docs
- Keep existing references to `operations/references/sops/` (shared ownership)

**Step 2: Commit**

```bash
git add .claude/agents/engineering/dev/AGENT.md
git commit -m "Update Dev Agent with Engineering department resources"
```

---

### Task 5: Update Onboarding Agent AGENT.md

**Files:**
- Modify: `.claude/agents/revenue/onboarding/AGENT.md`

**Step 1: Update project path references**

Change `revenue/projects/active/<name>/` references to `engineering/projects/<name>/`. The Onboarding Agent hands off to Engineering for builds, so it should point to the correct location.

**Step 2: Commit**

```bash
git add .claude/agents/revenue/onboarding/AGENT.md
git commit -m "Update Onboarding Agent project paths to engineering/projects/"
```

---

### Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update project structure section**

Change `engineering/` from "(reserved for future technical work)" to its actual description:
- `engineering/` -- Client delivery build shop: projects, tools, references, templates, specs

**Step 2: Update Projects section**

Change project paths from `revenue/projects/active/` to `engineering/projects/`. Update the description to say projects live in `engineering/projects/`.

**Step 3: Remove or update revenue/projects references**

Revenue no longer holds projects. Remove references to `revenue/projects/active/`.

**Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md with Engineering department structure"
```

---

### Task 7: Update memory file

**Files:**
- Modify: `C:\Users\Eric\.claude\projects\c--Claude-Code-OphidianAI\memory\MEMORY.md`

**Step 1: Update submodule paths**

- OphidianAI website submodule: `revenue/projects/active/ophidian-ai/` -> `engineering/projects/ophidian-ai/`
- Bloomin' Acres submodule: `revenue/projects/active/bloomin-acres/` -> `engineering/projects/bloomin-acres/`
- Reports path: update to `engineering/projects/bloomin-acres/reports/`
- PDF generator path: update to `engineering/tools/generate-report-pdf.mjs`

**Step 2: Commit** (memory file is outside repo, no commit needed)

---

### Task 8: Clean up revenue/projects/

**Files:**
- Remove: `revenue/projects/active/` (should be empty after submodule moves)
- Remove: `revenue/projects/` (if empty)

**Step 1: Remove empty directories**

```bash
rm -rf revenue/projects/
```

**Step 2: Verify**

```bash
ls revenue/
```

Should show `lead-generation/` and nothing else under revenue.

**Step 3: Commit**

```bash
git add revenue/
git commit -m "Remove empty revenue/projects/ after move to Engineering"
```

---

### Task 9: Final verification

**Step 1: Verify structure**

```bash
ls -R engineering/
git submodule status
cat .gitmodules
```

**Step 2: Verify no broken references**

```bash
grep -rn "revenue/projects/active" . --include="*.md" 2>/dev/null
```

Should return zero results.

**Step 3: Verify git status is clean**

```bash
git status
```
