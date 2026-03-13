---
name: client-social-content
description: Generate a full week of social media posts for a client's business across Facebook, Instagram, TikTok, Google Business Profile, LinkedIn, and Pinterest. Use when generating client social media batches, when the weekly social workflow runs, or when Eric says "generate posts for [client]", "client social batch", or "run social content for [client]".
---

# Client Social Content Batch Generator

Generate a full week of social media posts for a client's business, customized to their brand, industry, and platforms.

## When to Use

When generating the upcoming week's social media content for a client. Run once per week per active social media management client (ideally Monday as part of the batched weekly workflow).

## Inputs

| Input | Required | Description |
| --- | --- | --- |
| Client slug | Yes | The client's project folder name (e.g., "bloomin-acres") |
| Week number or date range | Yes | The week to generate content for (e.g., "Week of 2026-03-17" or "March 17-21") |
| Promotions/events | No | Any specials, sales, events, or seasonal angles to highlight this week |
| Client-provided photos | No | Descriptions of any new photos or assets the client provided |

## Process

### 1. Load Client Profile

Read the client profile from `engineering/projects/[client-slug]/social/client-profile.md`. This file contains:

- Business name, industry, location, services
- Brand voice and tone preferences
- Platform list (which platforms this client is on)
- Custom content pillars
- Approved hashtags (local + industry)
- CTA style preferences
- Preferred posting schedule (days, times, blackout periods)
- Approval workflow preference (review-first, trust-and-post, hybrid)

If the profile file does not exist, stop and ask Eric to complete onboarding first.

### 2. Determine Content Volume by Tier

Check the client profile for their service tier and generate accordingly:

| Tier | FB/IG Posts | TikTok | GBP Posts | Additional Platform | Total |
| --- | --- | --- | --- | --- | --- |
| Essentials ($250/mo) | 2/week | -- | 1/week | -- | ~12/mo |
| Growth ($450/mo) | 3-4/week | 1-2/week | 1/week | -- | ~20-28/mo |
| Pro ($700/mo) | 4-5/week | 2-3/week | 1/week | 1-2/week | ~32-44/mo |

### 3. Determine Content Pillar Rotation

Use the client's custom pillars from their profile. Default pillars if none specified:

| Pillar | What It Covers | Frequency |
| --- | --- | --- |
| Showcase | Products, services, results, before/afters | 1-2x/week |
| Education | Tips, common mistakes, "did you know," how-tos relevant to their industry | 1-2x/week |
| Local / Community | Local angle, community involvement, neighborhood relevance | 1x/week |
| Behind the Scenes | Team, process, day-in-the-life, business story | 1x/week |

For Growth and Pro tiers: one post per week must be an **engagement post** (question, poll, or local callout).

### 4. Generate Each Post

For every post, produce all of the following:

- **Platform(s):** FB, IG, TikTok, GBP, LinkedIn, Pinterest -- based on client's active platforms
- **Content type:** One of: text post, carousel (3-5 slides), Reel/TikTok script, story, GBP post, LinkedIn article post, Pinterest pin
- **Copy:** The full post text, ready to copy-paste. No placeholders.
- **Hashtags:** 5-8 hashtags. Mix of client's local hashtags and industry-relevant tags from their profile.
- **Visual direction:** 1-3 sentences describing what the graphic, photo, or video should look like. Reference client's brand colors and style.
- **Scheduled posting:** Day and time based on client's preferred schedule from their profile.

### 5. Platform-Specific Rules

**Facebook + Instagram (all tiers):**

Carousel posts:
- Provide slide-by-slide copy (3-5 slides)
- Slide 1 is always the hook -- a bold statement or question
- Final slide is the client's preferred CTA
- Each slide should stand alone if someone stops scrolling

Text posts:
- 50-150 words
- Lead with the most interesting line
- Break into short paragraphs (1-2 sentences each)

Stories:
- 1-3 frames
- Brief copy per frame (under 20 words)
- Include interaction element where possible (poll, question box, slider)

**TikTok / Reels (Growth and Pro tiers):**

- Structure: Hook (first 2 seconds) > Body (15-45 seconds) > CTA
- Write the hook as a spoken line, not a caption
- Keep total script under 60 seconds
- Note whether it needs on-camera or can be voiceover + B-roll
- Cross-post Reels to TikTok where format fits

**Google Business Profile (all tiers):**

- 100-300 words per post
- Include a CTA button type: Book, Order, Learn More, Call, or Visit
- Focus on offers, updates, events, or what's new
- No hashtags (GBP doesn't use them)
- Include relevant category/service keywords naturally

**LinkedIn (Pro tier add-on):**

- Professional tone, even if client's general tone is casual
- 100-300 words
- No hashtags in body text; 3-5 hashtags at the end
- Focus on business milestones, industry insights, hiring, community involvement

**Pinterest (Pro tier add-on):**

- Pin title: 40-100 characters, keyword-rich
- Pin description: 100-250 words with relevant keywords
- Visual direction is critical -- pins must be vertical (2:3 ratio)
- Focus on evergreen, searchable content (how-tos, inspiration, product showcases)

### 6. Adapt to Client Brand Voice

Read the brand voice section of the client profile carefully. Key adaptations:

- **Tone:** Match their specified tone (professional, friendly, bold, casual)
- **Vocabulary:** Use their preferred terms and avoid their blacklisted words
- **CTA style:** Use their preferred call-to-action format (book now, visit us, call today, learn more, etc.)
- **Emoji policy:** Follow client preference. Default is professional/minimal emoji use unless client requests otherwise.
- **Language:** Use outcome language, not jargon. Never use: SEO, conversion rate, responsive design, CTA, UX, UI, bounce rate, optimization, analytics, ROI.

## Output

### File Location

Save to: `engineering/projects/[client-slug]/social/batches/YYYY-MM-DD-batch.md`

Use the Monday date of the target week for the filename.

### Output Structure

```markdown
# [Business Name] -- Social Content Batch -- Week of [DATE RANGE]

## Week Summary

| # | Day | Time | Pillar | Type | Platform(s) |
| --- | --- | --- | --- | --- | --- |
| 1 | Monday | 8:00 AM | Education | Carousel | IG, FB |
| 2 | Monday | 10:00 AM | Update | GBP Post | GBP |
| 3 | Tuesday | 12:00 PM | Showcase | Text Post | FB |
| 4 | Wednesday | 5:00 PM | Local | Reel | IG, TikTok |
| 5 | Thursday | 8:00 AM | Behind the Scenes | Text Post | FB, IG |
| 6 | Friday | 12:00 PM | Education (Engagement) | Story Poll | IG, FB |

Tier: [Essentials / Growth / Pro]
Industry: [CLIENT INDUSTRY]
Engagement post: Post #[N]
Approval workflow: [Review first / Trust and post / Hybrid]

---

## Post 1 -- [TITLE]

**Pillar:** [Pillar Name]
**Platform(s):** [FB / IG / TikTok / GBP / LinkedIn / Pinterest]
**Content type:** [Type]
**Scheduled:** [Day], [Time] [Timezone]

### Copy

[Full post text here]

### Hashtags

[hashtag list -- omit for GBP posts]

### Visual Direction

[Description of the graphic/image/video using client's brand colors and style]

---

[Repeat for each post]
```

## Rules

1. **Match client brand voice exactly.** Every post should sound like it came from the client's business, not from OphidianAI.
2. **No jargon.** Use outcome language instead of marketing/tech terms.
3. **Self-contained value.** Every post should teach, show, or spark something on its own. No multi-part series.
4. **Follow client's posting schedule.** Use the days and times specified in their profile.
5. **Hashtag rules.** Always include at least 2 of the client's local hashtags. Never exceed 8 total. No hashtags on GBP posts.
6. **One engagement post per week** (Growth and Pro tiers). Must include a direct question, poll, or callout that invites a response. Flag it in the week summary.
7. **Cross-post efficiently.** Reuse content across platforms where the format fits (e.g., Reels to TikTok, text posts to FB and IG). Adapt copy length and hashtags per platform.
8. **GBP posts are separate.** Don't cross-post social content to GBP. GBP posts should focus on offers, updates, and what's new -- optimized for local search.
9. **Respect blackout periods.** Never schedule posts during the client's specified blackout days/times.
10. **Photo library awareness.** Reference available photos from the client's asset folder when writing visual direction. Note when new photos are needed.

## Reference

- OphidianAI social content skill (internal use): `.claude/skills/social-content/SKILL.md`
- Client profile template: `operations/templates/social-client-profile.md`
- Onboarding checklist: `operations/templates/social-onboarding-checklist.md`
- Delivery SOP: `operations/references/sops/social-media-delivery.md`
- Pricing: `operations/references/pricing-structure.md` (Social Media Management section)
