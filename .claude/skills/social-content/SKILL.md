---
name: social-content
description: Generate a full week of social media posts for Facebook, Instagram, and TikTok in a single batch. Use when Eric says "create social posts", "plan this week's content", "social media batch", "what should I post", or when it's time for weekly content planning. Covers carousels, reels, text posts, and stories with hashtags and visual direction.
---

# Social Content Batch Generator

Generate a full week of social media posts for Facebook, Instagram, and TikTok in a single batch.

## When to Use

When planning the upcoming week's social media content. Run once per week (ideally Friday or Sunday) to have all posts ready to schedule.

## Inputs

| Input | Required | Description |
|---|---|---|
| Week number or date range | Yes | The week to generate content for (e.g., "Week of 2026-03-10" or "March 10-14") |
| Recent wins/projects | No | Client results, completed projects, before/afters to highlight |
| Industry focus | No | Which niche to emphasize this week. If omitted, rotate through: auto services, health/wellness, restaurants, retail, professional services, general local service |
| Anchor content | No | Descriptions of any on-camera video Eric recorded that week, to reference or repurpose |

## Process

### 1. Determine Content Pillar Rotation

Each week produces 4-5 posts. Rotate through these four pillars, ensuring variety:

| Pillar | What It Covers | Frequency |
|---|---|---|
| Proof of Work | Before/afters, client wins, project showcases, results | 1-2x/week |
| Education | Tips, common mistakes, "did you know," how-tos | 1-2x/week |
| Local Relevance | Columbus/Southern Indiana angle, industry-specific insights | 1x/week |
| Behind the Scenes | Building process, tools, day-in-the-life, lessons learned | 1x/week |

One post per week must be an **engagement post** (question, poll, or local callout). This can overlap with any pillar.

### 2. Generate Each Post

For every post, produce all of the following:

- **Platform(s):** FB, IG, TikTok, or a combination. Cross-post where the format fits.
- **Content type:** One of: text post, carousel (3-5 slides), Reel/TikTok script, story.
- **Copy:** The full post text, ready to copy-paste. No placeholders.
- **Hashtags:** 5-8 hashtags. Mix of local (#ColumbusIndiana, #SouthernIndiana, #ColumbusIN, #SmallTownBusiness) and industry-relevant tags. No generic tags like #business or #marketing.
- **Visual direction:** 1-3 sentences describing what the graphic, photo, or video should look like. Specific enough to execute in Canva or on a phone.
- **Best posting time:** Suggested day and time (ET). Default windows: weekdays 7-8 AM, 12-1 PM, or 5-7 PM.

### 3. Format-Specific Rules

**Carousel posts (IG, FB):**
- Provide slide-by-slide copy (3-5 slides)
- Slide 1 is always the hook -- a bold statement or question
- Final slide is a soft CTA (follow, save, or visit)
- Each slide should stand alone if someone stops scrolling

**Reel / TikTok scripts:**
- Structure: Hook (first 2 seconds) > Body (15-45 seconds) > CTA
- Write the hook as a spoken line, not a caption
- Keep total script under 60 seconds
- Note whether it needs on-camera (anchor) or can be voiceover + B-roll

**Text posts (FB):**
- 50-150 words
- Lead with the most interesting line
- Break into short paragraphs (1-2 sentences each)

**Stories (IG, FB):**
- 1-3 frames
- Brief copy per frame (under 20 words)
- Include interaction element where possible (poll, question box, slider)

## Output

### File Location

Save to: `marketing/social-media/weekly/YYYY-MM-DD-content-batch.md`

Use the Monday date of the target week for the filename.

### Output Structure

```markdown
# Social Content Batch -- Week of [DATE RANGE]

## Week Summary

| # | Day | Pillar | Type | Platform(s) |
|---|---|---|---|---|
| 1 | Monday | Education | Carousel | IG, FB |
| 2 | Tuesday | Proof of Work | Text Post | FB |
| 3 | Wednesday | Local Relevance | Reel | IG, TikTok |
| 4 | Thursday | Behind the Scenes | Text Post | FB, IG |
| 5 | Friday | Education (Engagement) | Story Poll | IG, FB |

Industry focus: [INDUSTRY]
Engagement post: Post #[N]

---

## Post 1 -- [TITLE]

**Pillar:** [Pillar Name]
**Platform(s):** [FB / IG / TikTok]
**Content type:** [Type]
**Suggested posting:** [Day], [Time] ET

### Copy

[Full post text here]

### Hashtags

[hashtag list]

### Visual Direction

[Description of the graphic/image/video]

---

[Repeat for each post]
```

## Rules

1. **No emojis.** None in post copy, hashtags, or visual direction notes.
2. **Professional but approachable tone.** Informative, not salesy. Think "knowledgeable neighbor" not "used car salesman."
3. **No jargon.** Never use: SEO, conversion rate, responsive design, CTA, UX, UI, bounce rate, optimization, analytics, ROI. Use outcome language instead:
   - Instead of "SEO" -- "showing up when people search for you"
   - Instead of "responsive design" -- "looks great on any phone or computer"
   - Instead of "conversion rate" -- "turning visitors into customers"
4. **Local angle.** Every batch should include at least one post that references Columbus, Indiana or Southern Indiana specifically.
5. **No hard selling.** Posts demonstrate expertise through value. The CTA is never "buy our service." Soft CTAs only: "Save this for later," "What would you add?," "Follow for more," "Link in bio."
6. **Self-contained value.** Every post should teach, show, or spark something on its own. No "Part 1 of 5" series. No cliffhangers.
7. **Industry rotation.** If no industry focus is specified, rotate through the six niches in order: auto services, health/wellness, restaurants, retail, professional services, general local service. Check the most recent batch file to determine which industry was last used and pick the next one.
8. **Anchor content integration.** If Eric provides anchor video descriptions, reference or repurpose them (e.g., pull a quote for a text post, suggest a clip for a Reel). Do not generate anchor content -- that is Eric's job.
9. **Hashtag rules.** Always include at least 2 local hashtags. Never exceed 8 total. No hashtags with spaces or special characters.
10. **One engagement post per week.** Must include a direct question, poll, or callout that invites a response. Flag it clearly in the week summary.

## Reference

- Social media strategy design doc: `shared/docs/plans/2026-03-07-social-media-strategy-design.md`
- Brand voice and tone: `CLAUDE.md` (Communication Style section)
- Niche industries: auto services, health/wellness, restaurants, retail, professional services, general local service
- OphidianAI context: AI agency in Columbus, Indiana. Builds websites, handles online presence, and builds AI tools for small businesses. Founded by Eric Lefler, solo operator.
