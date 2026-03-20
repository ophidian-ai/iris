# Analytics Dashboard -- Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

Free unified analytics dashboard that aggregates data from all subscribed OphidianAI products into a single view. No separate pricing -- included with any product subscription. Reads from existing product tables (chatbot, SEO, email, CRM, reviews). Provides both admin (Eric) and client views.

### Key Decisions

- **Free product** -- Included with any subscription. Makes the platform sticky.
- **Read-only aggregation** -- No new data tables. Reads from existing product analytics tables.
- **Widget-based layout** -- Each product gets a widget card. Only shows widgets for products the client has subscribed to.
- **Admin view** -- Cross-client overview of all products. Revenue attribution, client health scores.
- **Client view** -- Their own product metrics in one place.

---

## Architecture

```
Analytics Dashboard
  |-- Detect which products client has (chatbot_configs, email_configs, seo_configs, crm_configs, review_configs)
  |-- For each active product:
  |     |-- Query that product's analytics/stats tables
  |     |-- Render widget card with key metrics
  |-- Aggregate: total leads, total revenue attributed, overall health score
  |
Admin Overview
  |-- All clients at a glance
  |-- Per-client: which products active, key metrics per product, health score
  |-- Aggregate: total MRR, total leads across all clients, churn risk flags
```

### Data Sources (all existing)

| Product | Table | Key Metrics |
|---------|-------|-------------|
| AI Chatbot | chatbot_analytics, chatbot_conversations, chatbot_leads | Conversations, leads captured, popular questions |
| SEO Automation | seo_audits, seo_rankings | Overall score, ranking changes, issues found |
| Content Generation | content_batches, content_posts | Posts published, blogs generated, engagement |
| Email Marketing | email_campaigns, email_campaign_recipients, email_contacts | Open rate, click rate, contacts, campaigns sent |
| CRM | crm_deals, crm_activities, crm_tasks | Pipeline value, deals won, win rate, tasks overdue |
| Review Management | reviews, review_analytics | Avg rating, new reviews, response rate, sentiment |

---

## API Design

### Client Endpoints

- `GET /api/analytics/overview` -- Returns aggregated stats for all products the authenticated client has active. One response with sections per product.
- `GET /api/analytics/health-score` -- Computed health score based on product engagement (are they using what they're paying for?)

### Admin Endpoints

- `GET /api/admin/analytics/overview` -- All clients, all products. Summary table.
- `GET /api/admin/analytics/client/[id]` -- Deep dive into one client's analytics across all products.
- `GET /api/admin/analytics/revenue` -- MRR breakdown by product, client, trend over time.

### Health Score Calculation

Per-client score (0-100) based on:
- Chatbot: conversations this month vs cap (usage %)
- SEO: audit score trend (improving/declining)
- Email: open rate vs industry average, sequence completion rate
- CRM: deal pipeline movement (stale deals = bad)
- Reviews: response rate, rating trend

Low health score = churn risk. Flag in admin dashboard.

---

## Dashboard UI

### Client View (`/dashboard/analytics`)

Widget grid layout. Each widget is a card showing key metrics for one product. Only shows products the client has active.

**Chatbot Widget:**
- Conversations this month (with trend arrow)
- Leads captured
- Top question

**SEO Widget:**
- Overall health score (color-coded)
- Keywords tracked / ranking up / ranking down
- Last audit date

**Email Widget:**
- Contacts total
- Last campaign open rate
- Active sequences

**CRM Widget:**
- Pipeline total value
- Deals won this month
- Tasks overdue

**Review Widget:**
- Average rating (stars)
- New reviews this month
- Response rate %

**Aggregate Row (top of page):**
- Total leads this month (chatbot + email + CRM combined)
- Overall health score
- Products active count

### Admin View (`/dashboard/admin/analytics`)

**Client table:** All clients with columns per product showing a quick health indicator (green/yellow/red dot). Click to expand.

**Aggregate cards:**
- Total MRR
- Total clients
- Total leads this month (all clients)
- Avg health score
- Churn risk count (health score < 40)

**Revenue chart:** MRR over time by product (Recharts stacked area chart).

---

## Security

- Client view: Supabase auth, RLS-scoped to own data across all product tables
- Admin view: Supabase auth, `profile.role = 'admin'`
- No new RLS policies needed -- reuses existing product table policies
- No new data written -- strictly read-only

---

## Dependencies

- All existing product tables (chatbot, SEO, email, CRM, review analytics)
- Supabase (existing) -- Cross-table queries, auth, RLS
- Recharts (existing) -- Charts and visualizations
- Next.js 16 (existing) -- App router, server components
