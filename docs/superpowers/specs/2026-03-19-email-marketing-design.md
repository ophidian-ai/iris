# Email Marketing -- Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

Internal email marketing product for OphidianAI small business clients. Built on Resend (sending) + Supabase (contacts, campaigns, sequences, analytics). Supports branded campaigns, automated sequences, AI content generation, and tiered tracking. Each client gets a dedicated sending domain for deliverability. Shares contact infrastructure with CRM Automation.

### Key Decisions

- **Built internally** -- No GoHighLevel dependency. Full ownership, 95%+ margins.
- **Resend-powered** -- Already integrated for transactional email. Extends to bulk campaigns and sequences.
- **Shared contacts** -- `email_contacts` table shared with CRM. One contact record across all products.
- **Dedicated sending domains** -- Each client sends from their own verified domain (SPF/DKIM/DMARC).
- **Tiered tracking** -- Essentials: campaign-level. Growth: contact-level. Pro: contact + link-level.
- **Tiered templates** -- Essentials: base set. Growth: AI generation + 1 custom. Pro: AI + A/B + 3 custom.
- **Tiered sequences** -- Essentials: product triggers, 2 active. Growth: + time-based, 5 active. Pro: + API triggers, unlimited.

---

## Architecture

```
Contact enters system (chatbot lead / form / API / CSV import)
  |-- Stored in email_contacts (Supabase)
  |-- Auto-enrolled in matching sequences (trigger evaluation)
  |
Campaign flow:
  |-- Admin creates campaign (dashboard or API)
  |     |-- Select template + audience segment
  |     |-- AI generates copy from blog/prompt (Growth/Pro)
  |     |-- AI generates subject line variants (Pro)
  |     |-- Schedule send time
  |-- Cron picks up scheduled campaigns
  |     |-- Render template with client branding
  |     |-- Send via Resend (client's verified domain)
  |     |-- Rate-paced: 10/sec to protect deliverability
  |-- Resend webhooks fire (delivered/opened/clicked/bounced/complained)
  |     |-- Update email_events table
  |     |-- Update contact-level engagement (Growth/Pro)
  |     |-- Update link-level clicks (Pro)
  |     |-- Evaluate sequence conditions (if opened -> next step)
  |
Sequence flow:
  |-- Trigger fires (product event / time-based / API)
  |-- Contact enrolled in sequence
  |-- Cron evaluates sequence steps (every 15 min)
  |     |-- Check delay (wait 2 days after step 1)
  |     |-- Check conditions (if opened step 1 -> send step 2a, else -> step 2b)
  |     |-- Send next step via same Resend pipeline
  |-- Sequence completes or contact unsubscribes
```

### Shared Infrastructure

- **email_contacts** -- Shared with CRM Automation
- **Content engine** -- Blog -> email copy generation (Growth/Pro)
- **Chatbot** -- Lead capture -> contact creation -> sequence enrollment
- **SEO** -- Audit completion -> sequence trigger
- **Resend** -- Already integrated for transactional, extends to bulk

---

## Data Model

### email_configs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| client_id | uuid, FK -> clients | |
| tier | enum: essentials, growth, pro | |
| sending_domain | text | e.g. `news.bloomin-acres.com` |
| sending_domain_verified | boolean, default false | Resend domain verification status |
| from_name | text | e.g. "Bloomin' Acres" |
| from_email | text | e.g. `hello@news.bloomin-acres.com` |
| brand_config | jsonb | `{ logoUrl, primaryColor, footerText, socialLinks, address }` |
| monthly_send_limit | int | Essentials: 1,000. Growth: 5,000. Pro: 25,000 |
| sends_this_month | int, default 0 | Atomic counter, reset by cron |
| max_active_sequences | int | 2 / 5 / null (unlimited) |
| api_key_hash | text, nullable | Hashed API key for contact/trigger endpoints |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### email_contacts (shared with CRM)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> email_configs | |
| email | text, NOT NULL | |
| name | text, nullable | |
| phone | text, nullable | |
| tags | text[] | For segmentation |
| source | text | chatbot, seo_audit, contact_form, api, csv_import |
| engagement_score | int, default 0 | Incremented on opens/clicks (Growth/Pro) |
| last_engaged_at | timestamptz, nullable | Last open or click |
| subscribed | boolean, default true | |
| unsubscribed_at | timestamptz, nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| UNIQUE | (config_id, email) | |

### email_templates

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, nullable FK -> email_configs | null = base template |
| name | text | e.g. "Newsletter", "Promotion", "Welcome" |
| category | text | newsletter, promotion, announcement, sequence_step |
| subject_template | text | Supports `{{variables}}` |
| html_template | text | React Email-compatible HTML |
| is_base | boolean, default false | Base templates available to all clients |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### email_campaigns

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> email_configs | |
| template_id | uuid, FK -> email_templates | |
| name | text | |
| subject | text | Final subject line |
| subject_variants | text[], nullable | A/B variants (Pro) |
| content | text | Final HTML body |
| segment_filter | jsonb, nullable | `{ tags: [...], engagement_min: N, last_engaged_after: date }` |
| scheduled_at | timestamptz, nullable | |
| sent_at | timestamptz, nullable | |
| status | enum: draft, scheduled, sending, sent, cancelled | |
| stats | jsonb | `{ total, sent, delivered, opened, clicked, bounced, complained }` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### email_campaign_recipients

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| campaign_id | uuid, FK -> email_campaigns | |
| contact_id | uuid, FK -> email_contacts | |
| resend_message_id | text, nullable | For webhook matching |
| status | enum: pending, sent, delivered, opened, clicked, bounced, complained | |
| link_clicks | jsonb, nullable | `{ url: count }` (Pro) |
| sent_at | timestamptz, nullable | |
| opened_at | timestamptz, nullable | |
| clicked_at | timestamptz, nullable | |

### email_sequences

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> email_configs | |
| name | text | e.g. "Welcome Series", "Re-engagement" |
| trigger_type | text | product_event, time_based, api_trigger |
| trigger_config | jsonb | `{ event: "chatbot_lead" }` or `{ inactive_days: 30 }` or `{ api_event: "purchase" }` |
| steps | jsonb | Array of `{ order, template_id, delay_hours, condition }` |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### email_sequence_enrollments

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| sequence_id | uuid, FK -> email_sequences | |
| contact_id | uuid, FK -> email_contacts | |
| current_step | int, default 0 | |
| status | enum: active, completed, paused, unsubscribed | |
| next_send_at | timestamptz, nullable | When the next step fires |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| UNIQUE | (sequence_id, contact_id) | |

### email_events

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| resend_message_id | text | Links to campaign_recipients or sequence step |
| event_type | text | delivered, opened, clicked, bounced, complained |
| payload | jsonb | Raw Resend webhook payload |
| created_at | timestamptz | |

---

## API Design

### Webhook (public, Resend-verified)

- `POST /api/webhooks/resend` -- Receives all Resend events. Verifies webhook signature via svix headers. Updates email_events, campaign_recipients, contact engagement, and evaluates sequence conditions.

### Contact API (client-accessible via API key)

- `POST /api/email/[slug]/contacts` -- Add contact (single or batch, max 100). Auto-enroll in matching sequences.
- `DELETE /api/email/[slug]/contacts/[id]` -- Unsubscribe contact
- `POST /api/email/[slug]/triggers` -- Fire custom API trigger (Pro). Enrolls matching contacts in sequences.

### Admin Endpoints

- `GET /api/admin/email/configs` -- List all client email configs
- `POST /api/admin/email/configs` -- Create config (provisions sending domain in Resend)
- `PATCH /api/admin/email/configs/[id]` -- Update config
- `GET /api/admin/email/campaigns` -- List campaigns for a config
- `POST /api/admin/email/campaigns` -- Create campaign (draft)
- `POST /api/admin/email/campaigns/[id]/send` -- Schedule or send immediately
- `GET /api/admin/email/campaigns/[id]/stats` -- Campaign performance
- `GET /api/admin/email/sequences` -- List sequences for a config
- `POST /api/admin/email/sequences` -- Create sequence
- `PATCH /api/admin/email/sequences/[id]` -- Update sequence steps/triggers
- `POST /api/admin/email/campaigns/[id]/generate` -- AI generate email content (Growth/Pro)
- `GET /api/admin/email/analytics/[id]` -- Aggregate analytics

### Client Dashboard Endpoints

- `GET /api/email/dashboard` -- Client's campaign stats, contact count, sequence status
- `GET /api/email/reports` -- Monthly email performance reports

### Unsubscribe (public, HMAC-verified)

- `GET /api/email/[slug]/unsubscribe` -- HMAC-verified unsubscribe link. Sets contact.subscribed=false, halts sequence enrollments.

---

## Sending Pipeline

### Campaign Send Flow

1. Admin creates campaign, selects template + segment + schedule
2. At scheduled time, cron picks up campaign (status: `scheduled`)
3. Set status to `sending`
4. Query contacts matching segment filter
5. Check monthly send limit (atomic increment)
6. For each contact in batches of 50:
   - Render template with contact variables (name, unsubscribe link)
   - Apply client brand config (logo, colors, footer)
   - Call Resend API with client's verified sending domain
   - Store resend_message_id in campaign_recipients
   - Rate pace: 10 emails/second
7. A/B testing (Pro): split 50/50, after 20% sent wait 2 hours, pick winner, send rest
8. Set status to `sent`, populate initial stats

### Sequence Send Flow

1. Cron runs every 15 minutes
2. Query enrollments where `status = active` AND `next_send_at <= now()`
3. For each enrollment:
   - Get current step from sequence.steps array
   - Evaluate condition (check if previous step was opened/clicked)
   - If condition met: send via same Resend pipeline
   - Advance current_step, calculate next_send_at from delay_hours
   - If last step: set status to `completed`

### Unsubscribe Handling

- Every email includes unsubscribe link: `/api/email/[slug]/unsubscribe?contact=[id]&token=[hmac]`
- HMAC token signed with config's API key hash
- Sets contact.subscribed = false, halts all active sequence enrollments
- Resend handles List-Unsubscribe header automatically

---

## Dashboard UI

### Admin View (`/dashboard/admin/email`)

- All email clients: table with client name, sending domain status, contacts count, campaigns this month, active sequences
- "New Email Config" button

### Campaign Builder (`/dashboard/admin/email/campaigns/new`)

- Select client config
- Choose template from library
- Write or AI-generate content (Growth/Pro: "Generate from blog post" button)
- Subject line input (Pro: "Generate A/B variants" button)
- Segment picker: filter by tags, engagement score, last engaged date
- Preview: rendered email with client branding
- Schedule: send now or pick date/time
- Estimated recipients count shown live

### Sequence Builder (`/dashboard/admin/email/sequences/new`)

- Select client config
- Set trigger type + config
- Step builder: ordered list with template, delay, optional condition
- Visual flow display
- Activate/pause toggle

### Client View (`/dashboard/email`)

- Stats overview: total contacts, subscribed rate, avg open rate, avg click rate
- Recent campaigns: name, date sent, open rate, click rate
- Active sequences: name, enrolled count, completion rate
- Contact growth chart (Recharts)
- Monthly report download

---

## Security & Constraints

### Auth

- Admin endpoints: Supabase auth, `profile.role = 'admin'`
- Client dashboard: Supabase auth, RLS scoped to own email_configs
- Contact API: API key auth (Bearer token, hashed in email_configs)
- Resend webhook: signature verification via svix headers
- Unsubscribe endpoint: HMAC token verification, no auth required

### Rate Limits

- Monthly send limits: Essentials 1,000 / Growth 5,000 / Pro 25,000
- Contact API: 100 contacts per batch, 10 requests per minute
- AI generation: 10 requests per day per config
- Campaign sending: 10 emails/second via Resend

### Deliverability

- Dedicated sending domain per client (verified via Resend DNS records)
- SPF, DKIM, DMARC configured during domain setup
- Bounce/complaint handling: auto-unsubscribe on hard bounce or complaint
- Engagement scoring: contacts with 0 opens in 90 days flagged for cleanup

### Data Privacy

- RLS on all tables (client sees own data only)
- Unsubscribe honored immediately, no re-enrollment
- Contact data retained 90 days after unsubscribe, then purged
- GDPR: delete endpoint for full contact data removal

---

## API Documentation

**Location:** `ophidianai.com/docs/email-api` (MDX pages)

### Sections

1. **Getting Started** -- Overview, authentication, quick start
2. **Contacts API** -- Add/remove contacts, batch import, tag management
3. **Triggers API** -- Fire custom events for sequence enrollment (Pro)
4. **Webhooks** -- Resend event handling, payload format
5. **Unsubscribe** -- How unsubscribe links work, HMAC verification

---

## Tier Summary

| Feature | Essentials ($149/mo) | Growth ($297/mo) | Pro ($497/mo) |
|---------|---------------------|-------------------|---------------|
| Monthly sends | 1,000 | 5,000 | 25,000 |
| Contacts | 500 | 2,500 | Unlimited |
| Campaigns/month | 2 | 8 | Unlimited |
| Base templates | Yes | Yes | Yes |
| Custom templates | No | 1 | 3 |
| AI email generation | No | Yes | Yes |
| AI subject line A/B testing | No | No | Yes |
| Tracking | Campaign-level | Contact-level | Contact + link-level |
| Segmentation | No | Yes | Yes |
| Active sequences | 2 | 5 | Unlimited |
| Product triggers | Yes | Yes | Yes |
| Time-based triggers | No | Yes | Yes |
| API triggers | No | No | Yes |
| Conditional branching | No | Yes | Yes |
| Dedicated sending domain | Yes | Yes | Yes |
| Dashboard | Yes | Yes | Yes |
| PDF reports | Yes | Yes | Yes |
| Contact API | No | Yes | Yes |

---

## Dependencies

- **Resend** (existing) -- Bulk email sending, webhook events, domain management API
- **Supabase** (existing) -- Contacts, campaigns, sequences, analytics, auth, RLS
- **AI SDK** (existing) -- Email copy generation from blog content (Growth/Pro)
- **Content engine** (existing) -- Blog -> email pipeline
- **Chatbot** (existing) -- Lead capture -> contact creation
- **Next.js 16** (existing) -- App router, API routes, MDX for docs
