---
name: social-regen
description: Regenerate the image or copy for a specific post in a social media batch. Use when Eric says "regen post 5", "new image for post 2", "regenerate that image", or when reviewing a batch and wanting to change a specific post's visual or text.
---

# Social Post Regenerate

Regenerate the image, copy, or both for a specific post in a batch.

## When to Use

During batch review, when Eric wants a different image or completely new copy for a post.

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| Post number | Yes | Which post to regenerate (1-7) |
| Target | No | `image`, `copy`, or `all`. Defaults to `image`. |
| New prompt | No | New image prompt or copy direction |

## Process

### Image Regeneration (default)

1. Find the most recent batch JSON with status `review`
2. Optionally update the `imageSource` or `imagePrompt` for the post
3. Invoke `social-image-gen` skill with the single post number
4. New images replace the old ones in `marketing/social-media/images/`

### Copy Regeneration

1. Same as `/social-edit` but regenerates from scratch rather than editing

### All (both)

1. Regenerate copy first, then images

## Output

Updates the specified post in both batch JSON and markdown. Status stays at `review`.
