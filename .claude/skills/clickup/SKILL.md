---
name: clickup
description: Manage ClickUp tasks, lists, and projects for OphidianAI. Use when Eric says "check my tasks", "create a task", "what's on my plate in ClickUp", "update task status", or when any workflow needs task tracking. Also used by morning-coffee for daily task summaries.
---

# ClickUp

Access OphidianAI's ClickUp workspace. Single script handles all operations.

**Workspace:** OphidianAI (Team ID: 9017999352)
**Space:** Team Space (Space ID: 90174585319)

API token is stored in `.env` at project root.

## Script

All commands go through one script:

```bash
node .claude/skills/clickup/scripts/clickup.js <command> [args]
```

### Browse structure

```bash
# List all spaces
node .claude/skills/clickup/scripts/clickup.js spaces

# List folders and lists in a space
node .claude/skills/clickup/scripts/clickup.js lists 90174585319

# List folders only
node .claude/skills/clickup/scripts/clickup.js folders 90174585319
```

### Work with tasks

```bash
# List tasks in a list
node .claude/skills/clickup/scripts/clickup.js tasks <listId>

# Get a single task's details
node .claude/skills/clickup/scripts/clickup.js task <taskId>

# Create a task
echo '{"name":"Task name","description":"Details","priority":2,"dueDate":"2026-03-10","status":"to do"}' | node .claude/skills/clickup/scripts/clickup.js create <listId>

# Update a task
echo '{"status":"in progress","priority":1}' | node .claude/skills/clickup/scripts/clickup.js update <taskId>

# Delete a task
node .claude/skills/clickup/scripts/clickup.js delete <taskId>
```

### Priority levels

| Value | Label |
|-------|-------|
| 1 | Urgent |
| 2 | High |
| 3 | Normal |
| 4 | Low |

## Workflow

1. **Daily check:** List tasks from active lists to see what's on the plate
2. **Create tasks:** When Eric mentions something that needs tracking, create it
3. **Update status:** Move tasks through statuses as work progresses
4. **Always confirm with Eric before creating or modifying tasks**

## Discovery

When first working with a new list or folder, run `lists` to discover the structure, then `tasks` to see what's in each list. Cache the IDs mentally for the session.
