# CRM Automation -- Design Spec

**Date:** 2026-03-19
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

Internal CRM product for OphidianAI small business clients. Central hub that connects all other products -- chatbot leads, email campaigns, SEO audits, and content publishing all flow into the CRM. Provides contact management, deal pipelines, activity timelines, task management, and cross-product automation. Shares contact infrastructure with Email Marketing. Built on Supabase.

### Key Decisions

- **Built internally** -- No GoHighLevel dependency. Full ownership, tight product integration.
- **Central hub** -- Every product feeds CRM (activities), CRM triggers every product (automations).
- **Shared contacts** -- `email_contacts` table shared with Email Marketing. One contact record.
- **Tiered pipelines** -- Essentials: 1 fixed. Growth: 3 custom. Pro: unlimited custom.
- **Tiered activity tracking** -- Essentials: manual notes. Growth: auto-logged from products. Pro: full + click-through to content.
- **Tiered automation** -- Pro only. Deal stage changes trigger email sequences, task creation, notifications.
- **Shared API key** -- Reuses email_configs API key. One key per client for all products.

---

## Architecture

```
All products feed the CRM:
  |-- Chatbot: lead captured -> contact created + deal created + activity logged
  |-- Email: campaign sent/opened/clicked -> activity logged
  |-- SEO: audit completed -> activity logged
  |-- Content: blog published -> activity logged
  |-- Contact form / API -> contact created + deal created
  |
CRM triggers other products:
  |-- Deal stage change -> enroll in email sequence
  |-- Deal won -> provision chatbot config, start onboarding sequence
  |-- Deal lost -> enroll in re-engagement sequence
  |-- Task due -> notification via Resend
  |
Core CRM:
  |-- Contacts (shared table: email_contacts)
  |-- Deals (pipeline stages, value, owner, expected close)
  |-- Activities (unified timeline per contact)
  |-- Tasks (manual or automated, with due dates and reminders)
  |-- Pipelines (fixed or custom stages per tier)
  |-- Automations (trigger -> action rules, Pro only)
```

### Shared Infrastructure

- **email_contacts** -- Shared with Email Marketing
- **email_configs.api_key_hash** -- Shared API key for client access
- **Resend** -- Task reminder notifications
- **Chatbot** -- Lead import, transcript linking
- **Email Marketing** -- Sequence enrollment from CRM automations
- **SEO / Content** -- Activity logging on events

### Cross-Product Lead Flow

When a chatbot captures a lead:
1. Chatbot writes to `chatbot_leads` (existing behavior)
2. Post-capture hook checks if client has CRM provisioned (join chatbot_configs.client_id -> crm_configs.client_id)
3. If CRM exists: upsert `email_contacts` (dedupe on client_id + email), create `crm_deals` with source='chatbot', log `crm_activities` with type='chatbot_conversation' and linked_content_id pointing to the conversation
4. If CRM does not exist: no CRM action (chatbot lead stored in chatbot_leads only)
5. Idempotency: duplicate emails for the same client skip contact creation, append activity only

Same pattern for SEO audit completion, contact form submissions, and content publishes -- each product checks for CRM config before logging activities.

---

## Data Model

### crm_configs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| client_id | uuid, FK -> clients | |
| tier | enum: essentials, growth, pro | |
| max_pipelines | int | 1 / 3 / null (unlimited) |
| max_custom_fields | int | 0 / 5 / null (unlimited) |
| custom_fields | jsonb | Array of `{ name, type, required }` |
| api_access | text | none / read / full |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Automation availability is derived from tier at runtime (Pro only). No separate flag needed.

### crm_pipelines

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> crm_configs | |
| name | text | e.g. "Sales Pipeline", "Onboarding" |
| stages | jsonb | Array of `{ name, order, probability, color }` |
| is_default | boolean, default false | One default per config |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Default stages for Essentials: `[{Lead, 10%}, {Contacted, 20%}, {Qualified, 40%}, {Proposal, 60%}, {Negotiation, 80%}, {Won, 100%}, {Lost, 0%}]`

### crm_deals

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> crm_configs | |
| pipeline_id | uuid, FK -> crm_pipelines | |
| contact_id | uuid, FK -> email_contacts | |
| title | text | e.g. "Website redesign - Bloomin' Acres" |
| value | numeric, nullable | Deal amount in dollars |
| stage | text | Current stage name. Validated on write against pipeline's stages array -- rejected if stage name not found in associated pipeline. |
| probability | int | Auto-set from pipeline stage probability |
| expected_close_at | date, nullable | |
| won_at | timestamptz, nullable | |
| lost_at | timestamptz, nullable | |
| lost_reason | text, nullable | |
| custom_field_values | jsonb, nullable | Values for client's custom fields |
| source | text | chatbot, contact_form, api, manual, seo_audit |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### crm_activities

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> crm_configs | |
| contact_id | uuid, FK -> email_contacts | |
| deal_id | uuid, nullable FK -> crm_deals | |
| type | text | note, email_sent, email_opened, chatbot_conversation, seo_audit, form_submission, deal_stage_change, task_completed, blog_published, api_event |
| description | text | Human-readable summary |
| linked_content_type | text, nullable | campaign, conversation, audit, sequence, task |
| linked_content_id | uuid, nullable | FK to the source record |
| auto_logged | boolean, default false | true if system-generated |
| linked_content_available | boolean, default true | Set to false when source record is deleted. UI shows "Content no longer available" instead of broken link. |
| created_at | timestamptz | |

### crm_tasks

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> crm_configs | |
| contact_id | uuid, nullable FK -> email_contacts | |
| deal_id | uuid, nullable FK -> crm_deals | |
| title | text | |
| description | text, nullable | |
| due_at | timestamptz | |
| completed_at | timestamptz, nullable | |
| status | enum: pending, completed | Overdue is computed at read time (due_at < now AND status = pending), not stored. |
| auto_generated | boolean, default false | Created by automation |
| automation_id | uuid, nullable FK -> crm_automations | Which rule created it |
| reminder_sent | boolean, default false | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### crm_automations

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> crm_configs | |
| name | text | e.g. "New lead -> welcome sequence" |
| trigger_type | text | deal_stage_change, deal_won, deal_lost, contact_created, task_overdue |
| trigger_config | jsonb | `{ stage: "Won" }` or `{ source: "chatbot" }` |
| action_type | text | enroll_sequence, create_task, send_notification, update_deal |
| action_config | jsonb | `{ sequence_id: "..." }` or `{ title: "Follow up", delay_hours: 72 }` |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## API Design

### Client API (API key auth, tiered access)

- `GET /api/crm/[slug]/contacts` -- List contacts with filters (Growth: read-only, Pro: full)
- `GET /api/crm/[slug]/deals` -- List deals with pipeline/stage filters
- `POST /api/crm/[slug]/contacts` -- Create contact + auto-create deal (Pro)
- `POST /api/crm/[slug]/deals` -- Create deal (Pro)
- `PATCH /api/crm/[slug]/deals/[id]` -- Update deal stage/value (Pro)
- `POST /api/crm/[slug]/activities` -- Log custom activity (Pro)

### Admin Endpoints

- `GET /api/admin/crm/configs` -- List all CRM client configs
- `POST /api/admin/crm/configs` -- Create config (provisions default pipeline)
- `PATCH /api/admin/crm/configs/[id]` -- Update config, custom fields
- `GET /api/admin/crm/pipelines/[config_id]` -- List pipelines for a config
- `POST /api/admin/crm/pipelines` -- Create pipeline (Growth/Pro). Validates against crm_configs.max_pipelines -- returns 422 if limit exceeded.
- `PATCH /api/admin/crm/pipelines/[id]` -- Update stages
- `GET /api/admin/crm/deals` -- List deals with filters
- `POST /api/admin/crm/deals` -- Create deal
- `PATCH /api/admin/crm/deals/[id]` -- Update deal (stage change triggers automations)
- `GET /api/admin/crm/contacts/[id]/timeline` -- Full activity timeline
- `GET /api/admin/crm/tasks` -- List tasks (filterable)
- `POST /api/admin/crm/tasks` -- Create task
- `PATCH /api/admin/crm/tasks/[id]` -- Update/complete task
- `GET /api/admin/crm/automations/[config_id]` -- List automations
- `POST /api/admin/crm/automations` -- Create automation rule
- `PATCH /api/admin/crm/automations/[id]` -- Update/toggle automation
- `GET /api/admin/crm/analytics/[id]` -- Pipeline analytics

Custom field creation validates against crm_configs.max_custom_fields. Returns 422 with upgrade prompt if limit exceeded.

### Internal Event Bus (server-side only)

- `logActivity(configId, contactId, type, description, linkedContent)` -- Called by chatbot, email, SEO, content engine
- `evaluateAutomations(configId, triggerType, triggerData)` -- Checks rules, executes matching actions

---

## Dashboard UI

### Admin Pipeline View (`/dashboard/admin/crm`)

- Kanban board: columns per stage, deal cards with title, contact, value, days in stage
- Drag and drop to change stage (triggers automations)
- Pipeline selector dropdown (Growth/Pro: multiple pipelines)
- Filters: date range, value range, source
- Summary bar: total deals, total value, weighted value (value x probability)

### Admin Contact Detail (`/dashboard/admin/crm/contacts/[id]`)

- Contact info card: name, email, phone, tags, engagement score, custom fields
- Activity timeline: chronological feed
  - Essentials: manual notes only
  - Growth: auto-logged entries with icons per type
  - Pro: clickable entries that open linked content
- Associated deals: list with stage badges
- Tasks: upcoming and completed
- Action buttons: "Add Note" / "Create Task" / "Create Deal"

### Admin Tasks View (`/dashboard/admin/crm/tasks`)

- Task list: grouped by overdue / today / upcoming
- Filter by client, contact, deal
- Quick complete checkbox
- Auto-generated tasks marked with automation badge

### Admin Automation Builder (`/dashboard/admin/crm/automations/new`)

- Trigger picker: select event type + configure conditions
- Action picker: select action type + configure details
- Preview: human-readable rule description
- Active/inactive toggle

### Client View (`/dashboard/crm`)

- Pipeline Kanban (own deals only)
- Contact list with search
- Essentials: basic contact cards, manual notes
- Growth: activity timeline, task list
- Pro: full timeline with linked content, automation status

---

## API Documentation

**Location:** `ophidianai.com/docs/crm-api` (MDX pages)

### Sections

1. **Getting Started** -- Overview, authentication, quick start
2. **Contacts API** -- List/create contacts (Growth: read, Pro: full CRUD)
3. **Deals API** -- List/create/update deals, stage management
4. **Activities API** -- Log custom activities (Pro)
5. **Tier Access Matrix** -- What each tier can access

---

## Security & Constraints

### Auth

- Admin endpoints: Supabase auth, `profile.role = 'admin'`
- Client dashboard: Supabase auth, RLS scoped to own crm_configs
- Client API: API key auth (reuses email_configs API key)
- Internal event bus: server-side only
- API key identifies the client, not the product tier. Each product endpoint independently checks the client's tier for that product. A Growth CRM client with a Pro Email key still gets read-only CRM API access.

### Rate Limits

- Client API: 60 requests/minute (Growth read-only), 120 requests/minute (Pro full)
- Automation execution: max 10 actions per trigger event
- Loop prevention: automation actions cannot trigger the same automation

### Data Constraints

- Deals per config: Essentials 100, Growth 500, Pro unlimited
- Activities retained indefinitely
- Tasks pending with due_at > 30 days past auto-archived by monthly cron (status set to completed with note).
- Custom fields validated on write against config field definitions

### Cross-Product Event Flow

- All product events flow one direction into crm_activities (append-only)
- Automation triggers evaluated synchronously on deal/contact changes
- Automation actions executed asynchronously (queued via cron, 1-min interval)
- Failed automation actions logged to crm_activities with error type
- Automation actions are deduped via idempotency key: `hash(automation_id + deal_id + floor(trigger_timestamp / 60s))`. Prevents duplicate actions from rapid stage changes within the same minute.

### Data Privacy

- RLS on all tables
- Contact deletion cascades: removes deals, activities, tasks, enrollments, campaign recipients
- GDPR delete endpoint handles full cross-product purge

---

## Tier Summary

| Feature | Essentials ($99/mo) | Growth ($249/mo) | Pro ($449/mo) |
|---------|---------------------|-------------------|---------------|
| Contacts | 250 | 1,000 | Unlimited |
| Deals | 100 | 500 | Unlimited |
| Pipelines | 1 (fixed stages) | 3 (custom stages) | Unlimited (custom) |
| Activity timeline | Manual notes | Auto-logged from products | Full + click-through to content |
| Tasks | No | Manual | Automated + reminders |
| Custom fields | No | 5 | Unlimited |
| Automations | No | No | Yes |
| Email integration | View campaigns sent | Send from CRM + log | Full two-way sync |
| Chatbot lead import | Yes | Yes | Yes |
| Reporting | Contact count + pipeline value | Win rate, avg deal time | Full sales analytics |
| API access | No | Read-only | Full CRUD |
| Dashboard | Yes | Yes | Yes |

---

## Dependencies

- **email_contacts** (Email Marketing) -- Shared contact table
- **email_configs.api_key_hash** (Email Marketing) -- Shared API key
- **Supabase** (existing) -- Deals, activities, tasks, pipelines, automations, auth, RLS
- **Resend** (existing) -- Task reminder notifications
- **Chatbot** (existing) -- Lead import, transcript linking
- **Email Marketing** -- Sequence enrollment from automations
- **SEO Automation** -- Audit activity logging
- **Content Generation** -- Publish activity logging
- **Next.js 16** (existing) -- App router, API routes, MDX for docs
