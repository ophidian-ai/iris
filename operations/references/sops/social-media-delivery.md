# Social Media Delivery SOP

Standard operating procedure for delivering social media management services to clients.

## Weekly Workflow

All social media clients are batched into a single weekly cycle to minimize context-switching.

### Monday -- Content Generation

1. Run the `client-social-content` skill for each active social media client
2. Each run reads the client's profile from `engineering/projects/[client-slug]/social/client-profile.md`
3. Output saved to `engineering/projects/[client-slug]/social/batches/YYYY-MM-DD-batch.md`
4. Review each batch for accuracy, tone, and brand alignment
5. Edit copy as needed -- AI generates, Eric quality-checks

### Monday-Tuesday -- Client Review (if applicable)

For clients on **review-first** or **hybrid** approval workflow:

1. Share the batch with the client (email or shared doc)
2. Client has 24 hours to review and request changes
3. Incorporate feedback and finalize

For clients on **trust-and-post** workflow:

1. Send the client a weekly preview email showing what's scheduled
2. Proceed directly to visuals

### Tuesday-Wednesday -- Visual Creation

1. Open Canva and use each client's brand template
2. Create graphics for text posts, carousels, and stories
3. For Pro tier: create simple video content in CapCut if Reel/TikTok scripts require it
4. Save visuals to `engineering/projects/[client-slug]/social/assets/weekly/`

### Wednesday -- Scheduling

Schedule all posts according to each client's preferred days and times:

| Platform | Scheduling Tool |
| --- | --- |
| Facebook | Meta Business Suite |
| Instagram | Meta Business Suite |
| TikTok | TikTok native scheduler |
| Google Business Profile | GBP dashboard |
| LinkedIn | LinkedIn native scheduler |
| Pinterest | Pinterest native scheduler |

- Double-check posting times match client preferences
- Respect blackout periods
- Verify all visuals are attached correctly

### Thursday-Friday -- Community Management

For Growth tier clients (1x/week):
- Check FB/IG comments and DMs
- Respond professionally in the client's brand voice
- Flag anything requiring the client's direct attention

For Pro tier clients (2-3x/week):
- Same as Growth, plus TikTok comments and LinkedIn/Pinterest engagement
- Note notable interactions for the monthly report

### End of Month -- Reporting

1. Pull metrics from each platform's analytics dashboard
2. Fill in the monthly report template (`operations/templates/social-monthly-report.md`)
3. Add observations and recommendations
4. Send report to client by the 5th of the following month

## Client Communication

- **Weekly:** Batch preview (trust-and-post clients) or batch for review (review-first clients)
- **Monthly:** Performance report with recommendations
- **As needed:** Client can request ad-hoc posts or schedule changes at any time
- **Pro tier:** Optional 15-minute monthly strategy call

## Platform Linking

Clients link their social accounts through the OphidianAI portal:

1. Client navigates to the portal
2. Each platform is shown as a card with the platform's logo and a "Link Account" button
3. Client clicks the card and goes through the platform's OAuth authentication flow
4. Once authenticated, the account is linked -- one-time setup
5. This grants OphidianAI the permissions needed to schedule and publish posts

No manual credential sharing required. If a client needs to unlink, they can do so from the portal or from the platform's connected apps settings.

## File Structure Per Client

```
engineering/projects/[client-slug]/
  social/
    client-profile.md          -- Brand profile and preferences
    batches/
      YYYY-MM-DD-batch.md      -- Weekly content batches
    assets/
      [client photos]          -- Photo library
      weekly/                  -- Generated visuals
    reports/
      YYYY-MM-report.md        -- Monthly performance reports
```

## Pricing Reference

| Tier | Monthly | Platforms | Posts/Month | Community Mgmt |
| --- | --- | --- | --- | --- |
| Essentials | $250 | FB + IG + GBP | ~12 | Not included |
| Growth | $450 | FB + IG + TikTok + GBP | ~20-28 | Weekly |
| Pro | $700 | FB + IG + TikTok + GBP + 1 more | ~32-44 | 2-3x/week |

## Quality Checklist (per batch)

Before scheduling, verify:

- [ ] All posts match client's brand voice and tone
- [ ] Posting times match client's preferred schedule
- [ ] No posts during blackout periods
- [ ] Hashtags include client's local tags
- [ ] No jargon or marketing-speak
- [ ] Visuals use client's brand colors and logo
- [ ] GBP posts have appropriate CTA button type
- [ ] Engagement post included (Growth/Pro)
- [ ] Platform-specific formatting is correct (carousel slides, Reel scripts, pin descriptions)
