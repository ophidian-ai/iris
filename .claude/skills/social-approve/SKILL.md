---
name: social-approve
description: Approve a reviewed social media batch for scheduling/posting. Use when Eric says "approve the batch", "looks good, schedule it", "approve social", or after reviewing a batch and wanting to move it to the posting queue.
---

# Social Batch Approve

Approve a reviewed social media batch, making it ready for posting via the dashboard content engine.

## When to Use

After Eric has reviewed a batch (status: `review`) and wants to approve it for posting.

## Process

1. Find the most recent batch JSON in `marketing/social-media/batches/` with status `review`
2. Display a summary: number of posts, date range, platforms, engagement post
3. Update batch status from `review` to `approved`
4. Notify: "Batch approved. Open the Content Engine dashboard to schedule and post."

## Output

Updates the batch JSON status field to `approved`. The dashboard content engine page reads approved batches and provides the posting interface.
