# Review Management -- Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

Review monitoring and response management product for OphidianAI small business clients. Monitors Google Business Profile reviews via API, generates AI responses with configurable brand voice, auto-posts responses (Growth/Pro), and drives review volume through email campaigns (Pro). Integrates with the shared contact infrastructure (email_contacts) and email sending pipeline.

### Key Decisions

- **GBP API primary** -- Google Business Profile API for reliable review monitoring and response posting. OAuth per client.
- **Scraping supplementary** -- Firecrawl for Yelp/Facebook review data where APIs aren't available.
- **AI responses** -- AI SDK generates responses. Essentials: suggest only. Growth: auto-post positive, approval for negative. Pro: auto-post all with escalation rules.
- **Brand voice** -- Per-client response style (Growth/Pro). Stored in config.
- **Review generation** -- Pro tier. Email campaigns via existing sending pipeline asking client's customers to leave reviews.
- **Email-first** -- SMS review requests deferred. Uses existing email_contacts + Resend infrastructure.

---

## Architecture

```
Review Monitoring (cron every 4 hours):
  |-- Per client: poll GBP API for new reviews
  |-- Supplementary: scrape Yelp/Facebook for new reviews (daily)
  |-- Store in reviews table
  |-- Notify client (email via Resend)
  |-- Generate AI response draft
  |     |-- Essentials: save draft, client reviews in dashboard
  |     |-- Growth: auto-post if 4-5 stars, queue for approval if 1-3 stars
  |     |-- Pro: auto-post all, escalation alert for 1-2 stars
  |-- Log activity in CRM (if CRM provisioned)
  |
Response Flow:
  |-- AI generates response using brand voice config
  |-- Response saved as draft in review_responses
  |-- Auto-post: call GBP API to post response
  |-- Manual: client approves in dashboard, then post
  |
Review Request Campaigns (Pro):
  |-- Select contacts from email_contacts (tagged customers)
  |-- Send branded email with GBP review link
  |-- Track: sent, opened, clicked, reviewed (match by timing)
  |-- Uses existing email sending pipeline (Resend)
```

### Shared Infrastructure

- **email_contacts** -- Shared contact table for review request campaigns
- **Email sending pipeline** -- Resend for notifications and review request emails
- **CRM event bus** -- Log review activity to CRM timeline
- **AI SDK** -- Response generation with brand voice
- **Firecrawl** -- Supplementary scraping for non-API platforms

---

## Data Model

### review_configs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| client_id | uuid, FK -> clients | |
| tier | enum: essentials, growth, pro | |
| gbp_account_id | text, nullable | Google Business Profile account ID |
| gbp_location_id | text, nullable | GBP location ID |
| gbp_oauth_token | text, nullable | Encrypted OAuth refresh token |
| yelp_url | text, nullable | Yelp business page URL for scraping |
| facebook_page_id | text, nullable | Facebook page ID (Meta API) |
| brand_voice | jsonb | `{ tone: "friendly", guidelines: "...", signoff: "- The Team" }` |
| auto_respond_positive | boolean, default false | Auto-post for 4-5 star reviews (Growth/Pro) |
| auto_respond_negative | boolean, default false | Auto-post for 1-3 star reviews (Pro only) |
| escalation_email | text, nullable | Email for 1-2 star escalation alerts |
| competitor_gbp_ids | text[], default '{}' | Pro: up to 3 competitor GBP IDs for benchmarking |
| notification_email | text | Where to send new review alerts |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### reviews

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> review_configs | |
| platform | text | google, yelp, facebook |
| platform_review_id | text | Unique ID from the platform |
| author_name | text | |
| author_image_url | text, nullable | |
| rating | int | 1-5 |
| text | text, nullable | Review text (some reviews are rating-only) |
| review_date | timestamptz | When the review was posted |
| sentiment | text, nullable | positive, neutral, negative (Growth/Pro) |
| response_status | text, default 'pending' | pending, drafted, approved, posted, skipped |
| is_competitor | boolean, default false | True if from a competitor GBP (Pro benchmarking) |
| competitor_name | text, nullable | Competitor business name |
| created_at | timestamptz | |
| UNIQUE | (config_id, platform, platform_review_id) | Prevent duplicate imports |

### review_responses

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| review_id | uuid, FK -> reviews | |
| config_id | uuid, FK -> review_configs | |
| generated_text | text | AI-generated response |
| final_text | text, nullable | Edited text (if client modified before posting) |
| status | text, default 'draft' | draft, approved, posted, rejected |
| auto_posted | boolean, default false | True if system auto-posted |
| posted_at | timestamptz, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### review_campaigns

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> review_configs | |
| name | text | e.g. "March Review Request" |
| review_link | text | Direct GBP review link |
| contacts_targeted | int, default 0 | |
| emails_sent | int, default 0 | |
| emails_opened | int, default 0 | |
| link_clicked | int, default 0 | |
| reviews_attributed | int, default 0 | Reviews posted within 48h of click |
| status | text, default 'draft' | draft, scheduled, sent, completed |
| scheduled_at | timestamptz, nullable | |
| sent_at | timestamptz, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### review_analytics

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> review_configs | |
| date | date | |
| platform | text | google, yelp, facebook, all |
| total_reviews | int, default 0 | |
| average_rating | real, default 0 | |
| new_reviews | int, default 0 | |
| responses_posted | int, default 0 | |
| response_rate | real, default 0 | % of reviews that got a response |
| sentiment_positive | int, default 0 | |
| sentiment_neutral | int, default 0 | |
| sentiment_negative | int, default 0 | |
| created_at | timestamptz | |
| UNIQUE | (config_id, date, platform) | |

---

## API Design

### Admin Endpoints

- `GET /api/admin/review/configs` -- List all review configs with client join
- `POST /api/admin/review/configs` -- Create config (initiate GBP OAuth flow)
- `PATCH /api/admin/review/configs/[id]` -- Update config (brand voice, auto-respond settings)
- `GET /api/admin/review/reviews` -- List reviews with filters (?config_id, ?platform, ?rating, ?status)
- `GET /api/admin/review/reviews/[id]` -- Get review with response history
- `POST /api/admin/review/reviews/[id]/respond` -- Approve/edit and post response
- `POST /api/admin/review/reviews/[id]/generate` -- Regenerate AI response
- `GET /api/admin/review/campaigns` -- List review request campaigns
- `POST /api/admin/review/campaigns` -- Create review request campaign (Pro)
- `POST /api/admin/review/campaigns/[id]/send` -- Schedule/send campaign
- `GET /api/admin/review/analytics/[id]` -- Analytics for a config

### Client Dashboard Endpoints

- `GET /api/review/dashboard` -- Client's own review stats, recent reviews, pending responses
- `POST /api/review/responses/[id]/approve` -- Client approves a draft response
- `POST /api/review/responses/[id]/edit` -- Client edits response text before posting

### Webhook (optional, for clients who want real-time alerts)

- Pro tier: webhook on new review event (same pattern as chatbot webhooks)

---

## GBP Integration

### OAuth Flow

1. Admin creates review config in dashboard
2. "Connect Google Business Profile" button initiates OAuth 2.0 flow
3. Client grants access to their GBP account
4. Store refresh token in review_configs.gbp_oauth_token (encrypted)
5. Use refresh token to get access tokens for API calls

### API Calls

- **List reviews:** `GET /v1/accounts/{account}/locations/{location}/reviews`
- **Post response:** `POST /v1/accounts/{account}/locations/{location}/reviews/{review}/reply`
- **Get location info:** `GET /v1/accounts/{account}/locations/{location}` (for review link generation)

### Rate Limits

- GBP API: 60 requests per minute per project
- Polling: every 4 hours per client (6 calls/day/client)
- At 50 clients: 300 calls/day, well within limits

---

## AI Response Generation

### Prompt Structure

```
System: You are a review response writer for {business_name}, a {industry} business.
Tone: {brand_voice.tone}
Guidelines: {brand_voice.guidelines}
Sign-off: {brand_voice.signoff}

For positive reviews (4-5 stars): Thank the customer, mention specific details from their review, invite them back.
For neutral reviews (3 stars): Thank them, acknowledge any concerns, offer to make it right.
For negative reviews (1-2 stars): Apologize sincerely, address specific issues, provide contact info for resolution. Never be defensive.

Review:
Rating: {rating}/5
Text: "{review_text}"
Author: {author_name}

Write a response (2-4 sentences, natural, not generic).
```

### Sentiment Analysis

Growth/Pro: classify review text as positive/neutral/negative using AI SDK. Store in reviews.sentiment. Used for analytics and conditional auto-respond logic.

---

## Dashboard UI

### Admin View (`/dashboard/admin/review`)

- All review clients: table with client name, GBP connected status, total reviews, avg rating, pending responses
- "New Config" button

### Admin Review Feed (`/dashboard/admin/review/[id]`)

- Config info card (GBP account, brand voice, auto-respond settings)
- Review feed: chronological list of reviews with rating stars, text, response status
- Each review card: rating, author, text, AI-suggested response, "Approve", "Edit", "Skip" buttons
- Filters: platform, rating, status (pending/posted/skipped)
- Analytics section: rating trend chart (Recharts), sentiment breakdown, response rate, review velocity
- Pro: competitor comparison table (avg rating, review count, velocity)

### Admin Campaign Builder (`/dashboard/admin/review/campaigns/new`)

- Pro only. Select config. Name campaign.
- Set contact filter (tags, recent customers)
- Preview review request email
- Schedule or send now

### Client View (`/dashboard/review`)

- Stats: total reviews, avg rating, this month's reviews, response rate
- Recent reviews with status (responded/pending)
- Pending responses: approve/edit/skip
- Rating trend chart
- Growth/Pro: sentiment breakdown
- Pro: competitor benchmarks

---

## Cron Jobs

- **Review polling:** Every 4 hours. Per active config: call GBP API, scrape Yelp/Facebook. Insert new reviews. Generate AI responses. Auto-post per tier rules. Send notifications.
- **Analytics aggregation:** Nightly. Aggregate daily stats per config per platform.
- **Review campaign attribution:** Daily. Check if any review request email recipients posted reviews within 48h of clicking.

---

## Security & Constraints

### Auth

- Admin endpoints: Supabase auth, `profile.role = 'admin'`
- Client dashboard: Supabase auth, RLS scoped to own review_configs
- GBP OAuth tokens: encrypted at rest in Supabase. Refresh tokens only (access tokens are ephemeral).

### Rate Limits

- GBP API: 60 req/min per project. Polling serialized across clients.
- AI response generation: max 50 per cron run (cost control)
- Review request campaigns: max 500 emails per campaign (uses email sending pipeline limits)

### Data Privacy

- RLS on all tables
- GBP OAuth tokens stored encrypted
- Review author info is public data (already on Google Maps)
- Review request emails include unsubscribe link (reuses email unsubscribe infrastructure)

### Indexes

- reviews(config_id, platform, created_at DESC)
- reviews(config_id, response_status)
- review_responses(review_id)
- review_analytics(config_id, date)
- review_campaigns(config_id)

---

## API Documentation

**Location:** `ophidianai.com/docs/review-api` (MDX pages)

### Sections

1. **Getting Started** -- Overview, GBP connection, dashboard walkthrough
2. **Webhooks** -- New review event notifications (Pro tier)
3. **Review Request Campaigns** -- How to create and track campaigns

---

## Tier Summary

| Feature | Essentials ($99/mo) | Growth ($249/mo) | Pro ($449/mo) |
|---------|---------------------|-------------------|---------------|
| GBP review monitoring | Yes | Yes | Yes |
| Yelp/Facebook monitoring | No | Yes | Yes |
| New review notifications | Yes | Yes | Yes |
| AI response suggestions | Yes (fixed tone) | Yes (brand voice) | Yes (brand voice) |
| Auto-post positive (4-5 stars) | No | Yes | Yes |
| Auto-post negative (1-3 stars) | No | No | Yes (with escalation) |
| Escalation alerts (1-2 stars) | Email only | Email | Email + webhook |
| Review request campaigns | No | No | Yes |
| Sentiment analysis | No | Yes | Yes |
| Rating trend tracking | No | Yes | Yes |
| Competitor benchmarking | No | No | Yes (3 competitors) |
| Dashboard | Yes | Yes | Yes |
| Monthly PDF report | Yes | Yes | Yes |

---

## Dependencies

- **Google Business Profile API** -- Review monitoring + response posting (OAuth 2.0)
- **AI SDK** (existing) -- Response generation, sentiment analysis
- **Resend** (existing) -- Review notifications + review request emails
- **Firecrawl** (existing) -- Yelp/Facebook review scraping
- **email_contacts** (Email Marketing) -- Shared contacts for review request campaigns
- **CRM event bus** (CRM) -- Log review activities to CRM timeline
- **Supabase** (existing) -- All data storage, auth, RLS
- **Next.js 16** (existing) -- App router, API routes, MDX docs
