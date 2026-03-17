---
name: social-check
description: Verify scheduled social media posts have published successfully. Use when Eric says "check if posts went live", "verify social posts", "social check", or automatically during morning coffee for any batch in scheduled status.
---

# Social Post Verification

Check platform APIs to verify scheduled posts have published. Updates batch status from `scheduled` to `published`.

## When to Use

- After posts were scheduled and the publish time has passed
- Automatically called by morning coffee briefing for batches in `scheduled` status
- Manually when Eric wants to verify post status

## Process

1. Find the most recent deployment manifest in `marketing/social-media/scheduled/` with posts in `scheduled` status
2. For each post, for each platform, query the platform API for post status using the stored post ID
3. Update the manifest with:
   - `published` status and live post URL if confirmed
   - `failed` status and error message if the post was rejected or didn't publish
4. If all posts across all platforms are confirmed published, update the batch status to `published`
5. Report summary: how many published, how many failed, which need attention

## Output

Updates the deployment manifest and batch JSON. Reports results to Eric.

## Note

This skill depends on the dashboard's Meta OAuth integration for API access. LinkedIn and TikTok verification will be added when those platform integrations are live.
