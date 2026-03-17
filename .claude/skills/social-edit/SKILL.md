---
name: social-edit
description: Edit the copy for a specific post in a social media batch. Use when Eric says "edit post 3", "change the copy on post 1", "rewrite that LinkedIn post", or when reviewing a batch and wanting to adjust specific post text.
---

# Social Post Edit

Edit the copy for a specific post in a social media batch without regenerating images.

## When to Use

During batch review, when Eric wants to adjust the copy for one or more posts.

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| Post number | Yes | Which post to edit (1-7) |
| Instructions | No | What to change. If omitted, present the current copy and ask for direction. |

## Process

1. Find the most recent batch JSON in `marketing/social-media/batches/` with status `review`
2. Extract the specified post
3. Present the current copy for all 4 platforms
4. Accept editing instructions from Eric (e.g., "make the LinkedIn version more data-driven" or "change the hook to focus on mobile")
5. Regenerate the platform variants for that post only
6. Update the batch JSON and batch markdown
7. Do NOT regenerate images -- use `/social-regen` for that

## Output

Updates the specified post's copy in both the batch JSON and markdown files. Status stays at `review`.
