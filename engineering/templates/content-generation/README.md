# Content Generation Product Template

Reusable scaffold for delivering AI-powered content generation to clients.

## Architecture

```
Client Onboarding
  └── Brand Voice Profile (questionnaire + website scrape)
        └── Content Calendar (monthly plan)
              └── AI-Generated Drafts (Claude API)
                    └── Client Review (dashboard or email)
                          └── Publish (social platforms + blog)
```

## Per-Client Setup

### 1. Brand Voice Profile

Create during onboarding. Stored as a config file per client.

```json
{
  "client": "business-name",
  "industry": "auto repair",
  "tone": "friendly, knowledgeable, down-to-earth",
  "audience": "car owners in Columbus, IN area",
  "avoidWords": ["cheap", "discount"],
  "preferredWords": ["reliable", "trusted", "quality"],
  "keyServices": ["oil changes", "brake repair", "diagnostics"],
  "uniqueSellingPoints": ["family-owned since 1995", "ASE certified", "same-day service"],
  "competitors": ["Midas", "Firestone"],
  "socialPlatforms": ["facebook", "instagram", "google-business"],
  "contentGoals": "drive local awareness, get more reviews, build trust"
}
```

### 2. Content Calendar

Monthly calendar generated from the brand voice profile:

| Week | Blog Topic | Social Posts (3/wk) | Theme |
|------|-----------|-------------------|-------|
| 1 | "5 Signs Your Brakes Need Attention" | Tips, behind-the-scenes, testimonial | Education |
| 2 | "Why Regular Oil Changes Save You Money" | Seasonal tip, team spotlight, promo | Value |
| 3 | (no blog) | FAQ answer, before/after, community | Trust |
| 4 | "Preparing Your Car for Summer" | Checklist, customer story, CTA | Seasonal |

### 3. Content Generation Flow

1. Generate monthly calendar from profile + seasonal context
2. Draft all content using Claude API with brand voice system prompt
3. Generate images (Nano Banana 2 for custom, Pexels for stock)
4. Package for review (markdown + images)
5. Client approves or requests edits
6. Publish to platforms

### 4. System Prompt Template

```
You are a content writer for [Business Name], a [industry] business in [city].

Brand voice: [tone description]
Audience: [target audience]
Key services: [services list]
Unique selling points: [USPs]

Rules:
- Write at a 7th-grade reading level
- Keep social posts under 150 words
- Include a clear call-to-action in every post
- Never mention competitors by name
- Use [preferred words], avoid [avoided words]
- Sound like a real person, not a marketing agency
```

## Tier Differences

| Feature | Essentials (in $297 tier) | Growth (in $497 tier) | Pro (in $797 tier) |
|---------|--------------------------|----------------------|-------------------|
| Blog posts/mo | 4 | 8 | 12 |
| Social posts/mo | 12 | 20 | 30 |
| Platforms | 2 | 3 | All |
| Images | Stock only | Stock + some AI | Full AI custom |
| Video scripts | No | No | Yes |
| Brand voice profile | Basic | Detailed | Advanced + quarterly refresh |

## Delivery

- Content delivered as batch (weekly or bi-weekly)
- Client reviews via email or dashboard (when built)
- Approved content published by OphidianAI or client self-publishes
- Monthly performance report

## Build Status

- [x] Social content engine (internal -- `.claude/skills/social-content/`)
- [x] AI image generation pipeline (Nano Banana 2, Pexels)
- [ ] Brand voice profile questionnaire
- [ ] Client content calendar generator
- [ ] Client review/approval flow
- [ ] Multi-client batch processing
- [ ] Client dashboard (Phase 2)

## Dependencies

- Claude API (content generation)
- Nano Banana 2 / Pexels (images)
- Social platform API access (Meta pending verification)
- Client brand assets (logo, colors, photos)
