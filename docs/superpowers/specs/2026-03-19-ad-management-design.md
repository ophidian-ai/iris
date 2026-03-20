# Ad Campaign Management -- Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

Managed ad campaign service for OphidianAI small business clients. Standard agency model: client owns their Google/Meta ad account and pays ad spend directly. OphidianAI gets manager access, creates/optimizes campaigns, and charges a management fee. Platform provides reporting dashboard, performance tracking, and AI-powered ad copy generation.

### Key Decisions

- **Standard agency model** -- Client owns ad account, pays spend directly. We manage. Zero financial risk.
- **Manager access** -- Client grants us access to their Google Ads / Meta Business accounts.
- **AI differentiator** -- AI generates ad copy, suggests audiences, and recommends bid adjustments.
- **Reporting-focused build** -- The dashboard tracks performance. Campaign creation/management happens in Google/Meta platforms directly (no API-based campaign management in v1).
- **API integration for data only** -- Pull stats from Google Ads API and Meta Marketing API for dashboard and reports.

---

## Architecture

```
Client grants manager access to Google Ads / Meta Business Manager
  |
OphidianAI manages campaigns in native platforms
  |
Reporting pipeline (cron daily):
  |-- Pull campaign stats from Google Ads API (impressions, clicks, spend, conversions)
  |-- Pull campaign stats from Meta Marketing API (same metrics)
  |-- Store in ad_metrics table
  |-- Update dashboard
  |-- Generate monthly PDF report
  |
AI Ad Tools:
  |-- Generate ad copy from business description + target audience
  |-- Suggest audience targeting based on industry + location
  |-- Recommend budget allocation across campaigns
```

---

## Data Model

### ad_configs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| client_id | uuid, FK -> clients | |
| tier | enum: essentials, growth, pro | |
| google_ads_customer_id | text, nullable | Google Ads customer ID (xxx-xxx-xxxx) |
| google_ads_connected | boolean, default false | |
| meta_ad_account_id | text, nullable | Meta ad account ID |
| meta_connected | boolean, default false | |
| monthly_management_fee | numeric | What we charge |
| monthly_ad_budget | numeric, nullable | Client's stated ad budget (for tracking) |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### ad_campaigns

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> ad_configs | |
| platform | text | google, meta |
| platform_campaign_id | text | Campaign ID from the platform |
| name | text | |
| status | text | active, paused, ended |
| objective | text | traffic, leads, conversions, awareness |
| daily_budget | numeric, nullable | |
| start_date | date, nullable | |
| end_date | date, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| UNIQUE | (config_id, platform, platform_campaign_id) | |

### ad_metrics

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| campaign_id | uuid, FK -> ad_campaigns | |
| date | date | |
| impressions | int, default 0 | |
| clicks | int, default 0 | |
| spend | numeric, default 0 | In dollars |
| conversions | int, default 0 | |
| cost_per_click | numeric, default 0 | |
| cost_per_conversion | numeric, default 0 | |
| click_through_rate | real, default 0 | |
| conversion_rate | real, default 0 | |
| created_at | timestamptz | |
| UNIQUE | (campaign_id, date) | |

### ad_copy_drafts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> ad_configs | |
| platform | text | google, meta |
| ad_type | text | search, display, social_image, social_video |
| headlines | text[] | Multiple headline variants |
| descriptions | text[] | Multiple description variants |
| call_to_action | text, nullable | |
| target_audience | text, nullable | AI-suggested audience description |
| status | text, default 'draft' | draft, approved, used |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## API Design

### Admin Endpoints

- `GET /api/admin/ads/configs` -- List all ad management clients
- `POST /api/admin/ads/configs` -- Create config (record client's ad account IDs)
- `PATCH /api/admin/ads/configs/[id]` -- Update config
- `GET /api/admin/ads/campaigns` -- List campaigns for a config with latest metrics
- `POST /api/admin/ads/campaigns` -- Record a campaign (synced from platform after manual creation)
- `GET /api/admin/ads/metrics/[id]` -- Get daily metrics for a campaign
- `GET /api/admin/ads/analytics/[id]` -- Aggregate analytics for a config (total spend, ROAS, conversions)
- `POST /api/admin/ads/generate-copy` -- AI generate ad copy (headlines, descriptions, CTA)
- `GET /api/admin/ads/copy-drafts` -- List AI-generated ad copy drafts

### Client Dashboard Endpoints

- `GET /api/ads/dashboard` -- Client's own ad performance summary
- `GET /api/ads/reports` -- Monthly performance reports

---

## AI Ad Copy Generation

### Prompt Structure

```
Generate {ad_type} ad copy for {business_name}, a {industry} business in {location}.

Target audience: {target_audience}
Objective: {objective}
Platform: {platform}

Requirements:
- Google Search: 3 headlines (max 30 chars each), 2 descriptions (max 90 chars each)
- Google Display: 5 headlines (max 30 chars), 1 long headline (max 90 chars), 5 descriptions (max 90 chars)
- Meta: primary text (max 125 chars), headline (max 40 chars), description (max 30 chars)

Generate 3 variants with different angles (benefit, urgency, social proof).
```

### AI Budget Recommendations

Based on industry benchmarks and campaign performance data:
- Suggest daily budget range for the objective
- Recommend budget reallocation from underperforming to high-performing campaigns
- Flag campaigns with CPC above industry average

---

## Dashboard UI

### Admin View (`/dashboard/admin/ads`)

- All ad clients: table with client name, platforms connected, total spend this month, total conversions, ROAS
- "New Config" button

### Admin Client Detail (`/dashboard/admin/ads/[id]`)

- Config info card (ad account IDs, management fee, budget)
- Campaign list with status, spend, clicks, conversions
- Performance chart: spend vs conversions over time (Recharts)
- AI copy drafts section: generate new copy, view drafts
- Budget recommendation panel

### Client View (`/dashboard/ads`)

- Summary cards: total spend, clicks, conversions, ROAS this month
- Campaign breakdown table
- Performance trend chart
- Monthly report download

---

## Cron Jobs

- **Metrics sync:** Daily at 6am ET. Pull yesterday's metrics from Google Ads API and Meta Marketing API for all active configs. Upsert into ad_metrics.
- **Monthly report generation:** 1st of month. Generate PDF performance report per config.

---

## Security & Constraints

### Auth

- Admin endpoints: Supabase auth, `profile.role = 'admin'`
- Client dashboard: Supabase auth, RLS scoped to own ad_configs
- Google Ads API: OAuth 2.0 via Google Ads API developer token (requires approval)
- Meta Marketing API: System user token via Meta Business Manager

### API Access Requirements

- **Google Ads API:** Requires developer token (apply at ads.google.com/aw/apicenter). Standard access takes 1-2 weeks approval. Start with test account.
- **Meta Marketing API:** Requires app review for `ads_read` permission. Use system user token for server-side access.

### Data Privacy

- RLS on all tables
- Ad account credentials stored as IDs only (no passwords/tokens stored -- we use platform manager access)
- Client ad spend data is confidential -- never shared between clients
- Google/Meta OAuth tokens for API access stored encrypted

---

## Tier Summary

| Feature | Essentials ($199/mo) | Growth ($399/mo) | Pro ($699/mo) |
|---------|---------------------|-------------------|---------------|
| Platforms managed | 1 (Google or Meta) | Both | Both |
| Campaign setup | 1 campaign | 3 campaigns | Unlimited |
| AI ad copy generation | 3 drafts/mo | 10 drafts/mo | Unlimited |
| Budget recommendations | No | Yes | Yes |
| Weekly optimization | No | Yes | Yes (2x/week) |
| Audience suggestions | No | Yes | Yes + lookalike |
| Dashboard | Yes | Yes | Yes |
| Monthly PDF report | Yes | Yes | Yes + weekly summary |
| Dedicated strategy call | No | No | Monthly |

---

## Dependencies

- **Google Ads API** -- Campaign metrics pull (requires developer token approval)
- **Meta Marketing API** -- Campaign metrics pull (requires app review)
- **AI SDK** (existing) -- Ad copy generation, budget recommendations
- **Supabase** (existing) -- Data storage, auth, RLS
- **Resend** (existing) -- Report delivery, alerts
- **Recharts** (existing) -- Performance charts
- **Next.js 16** (existing) -- App router, API routes

---

## Implementation Notes

- **v1 (build now):** Config tracking, manual campaign sync, AI copy generation, dashboard UI, monthly reports. No live API integration with Google/Meta (requires approval process).
- **v2 (after API approval):** Automated metrics sync via Google Ads API + Meta Marketing API. Real-time dashboard data.
- Campaign creation and management stays in native Google/Meta platforms. We don't build campaign creation UI -- that's unnecessary complexity.
