# Email Marketing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build an internal email marketing product with campaigns, automated sequences, AI content generation, and tiered tracking for OphidianAI small business clients.

**Architecture:** Resend individual `emails.send()` for sending, Supabase for contacts/campaigns/sequences/analytics, AI SDK for content generation, shared email_contacts table with CRM.

**Tech Stack:** Next.js 16, Resend SDK, Supabase (Postgres + Auth + RLS), AI SDK v6, Upstash Redis, TypeScript

**Spec:** docs/superpowers/specs/2026-03-19-email-marketing-design.md

---

## File Structure

### New Files (Create)

**Database:**
- supabase/migrations/20260319100000_email_marketing_tables.sql

**Types:**
- src/lib/supabase/email-types.ts

**Library:**
- src/lib/email/tier-defaults.ts
- src/lib/email/config.ts
- src/lib/email/contacts.ts
- src/lib/email/campaigns.ts
- src/lib/email/sequences.ts
- src/lib/email/sending.ts
- src/lib/email/templates.ts
- src/lib/email/tracking.ts

**API Routes:**
- src/app/api/webhooks/resend/route.ts
- src/app/api/email/[slug]/contacts/route.ts
- src/app/api/email/[slug]/triggers/route.ts
- src/app/api/email/[slug]/unsubscribe/route.ts
- src/app/api/admin/email/configs/route.ts
- src/app/api/admin/email/configs/[id]/route.ts
- src/app/api/admin/email/campaigns/route.ts
- src/app/api/admin/email/campaigns/[id]/route.ts
- src/app/api/admin/email/campaigns/[id]/send/route.ts
- src/app/api/admin/email/campaigns/[id]/generate/route.ts
- src/app/api/admin/email/campaigns/[id]/stats/route.ts
- src/app/api/admin/email/sequences/route.ts
- src/app/api/admin/email/sequences/[id]/route.ts
- src/app/api/admin/email/analytics/[id]/route.ts
- src/app/api/cron/email-campaign-send/route.ts
- src/app/api/cron/email-sequence-process/route.ts
- src/app/api/cron/email-monthly-reset/route.ts

**Dashboard:**
- src/app/dashboard/admin/email/page.tsx
- src/app/dashboard/admin/email/campaigns/new/page.tsx
- src/app/dashboard/admin/email/sequences/new/page.tsx
- src/app/dashboard/admin/email/[id]/page.tsx
- src/app/dashboard/email/page.tsx

**API Docs:**
- src/app/docs/email-api/layout.tsx
- src/app/docs/email-api/page.mdx
- src/app/docs/email-api/contacts/page.mdx
- src/app/docs/email-api/triggers/page.mdx

### Modified Files

- src/lib/supabase/types.ts -- Re-export email types
- src/lib/modules.ts -- Add email module
- src/components/dashboard/sidebar.tsx -- Add email menu item
- src/middleware.ts -- Exclude /api/email/ and /api/webhooks/ from auth
- vercel.json -- Add cron jobs
- package.json -- No new deps needed (Resend already installed)

---

## Phase 1: Foundation

### Task 1: Database Migration

**Files:**
- Create: supabase/migrations/20260319100000_email_marketing_tables.sql

- [ ] **Step 1: Write the migration SQL**

Create all 8 tables: email_configs, email_contacts, email_templates, email_campaigns, email_campaign_recipients, email_sequences, email_sequence_enrollments, email_events.

Include:
- email_campaign_status enum (draft, scheduled, sending, sent, cancelled)
- email_enrollment_status enum (active, completed, paused, unsubscribed)
- email_recipient_status enum (pending, sent, delivered, opened, clicked, bounced, complained)
- increment_and_check_send_limit(p_config_id UUID, p_batch_size INT) function -- atomic increment of sends_this_month, returns false if limit exceeded
- Partial unique on email_sequence_enrollments (sequence_id, contact_id) WHERE status = 'active'
- Unique on email_contacts (client_id, email)
- All indexes from spec: email_contacts(client_id), email_campaign_recipients(resend_message_id), email_campaign_recipients(campaign_id, status), email_events(resend_message_id), email_sequence_enrollments(status, next_send_at), email_configs(client_id)
- RLS: admin full access, client read own (via client_id chain), anon insert for unsubscribe endpoint
- updated_at triggers on email_configs, email_contacts, email_campaigns, email_sequence_enrollments
- Base email templates insert (newsletter, promotion, announcement, sequence_step)

See spec data model section for full schema.

- [ ] **Step 2: Commit**

---

### Task 2: TypeScript Types

**Files:**
- Create: src/lib/supabase/email-types.ts
- Modify: src/lib/supabase/types.ts

- [ ] **Step 1: Create email types**

Export: EmailConfig, EmailContact, EmailTemplate, EmailCampaign, EmailCampaignRecipient, EmailSequence, EmailSequenceEnrollment, EmailEvent, EmailCampaignStatus, EmailEnrollmentStatus, EmailRecipientStatus.

Match database schema exactly. See spec data model.

- [ ] **Step 2: Re-export from main types file**

- [ ] **Step 3: Commit**

---

### Task 3: Tier Defaults

**Files:**
- Create: src/lib/email/tier-defaults.ts

- [ ] **Step 1: Create tier defaults**

Export EMAIL_TIER_DEFAULTS keyed by tier: monthlySendLimit, maxContacts, maxCampaignsPerMonth, maxActiveSequences, maxCustomTemplates, contactLevelTracking, linkLevelTracking, aiGeneration, abTesting, segmentation, conditionalBranching, timeTriggers, apiTriggers, contactApi.

Export constants: SEND_RATE_PER_SECOND (10), SEQUENCE_CRON_INTERVAL_MINUTES (15), AB_TEST_SAMPLE_PERCENT (0.2), AB_TEST_WAIT_HOURS (2).

- [ ] **Step 2: Commit**

---

## Phase 2: Core Library

### Task 4: Config Loader

**Files:**
- Create: src/lib/email/config.ts

- [ ] **Step 1: Create config loader**

loadEmailConfig(slug): Query email_configs by client slug (join clients table for slug). Cache in Upstash Redis (key: email:config:{slug}, TTL 5min). Return EmailConfig or null.
invalidateEmailConfigCache(slug): Delete Redis key.

Follow same pattern as src/lib/chatbot/config.ts.

- [ ] **Step 2: Commit**

---

### Task 5: Contact Management

**Files:**
- Create: src/lib/email/contacts.ts

- [ ] **Step 1: Create contact service**

createContact(clientId, data): Check max_contacts limit. Upsert into email_contacts (dedupe on client_id + email). Return contact.
createContactsBatch(clientId, contacts[]): Same but batch, max 100. Check limit against total.
unsubscribeContact(contactId): Set subscribed=false, unsubscribed_at=now(). Pause all active sequence enrollments for this contact.
getContactsBySegment(configId, filter): Query contacts matching segment_filter (tags, engagement_min, last_engaged_after). Return count and contacts.

- [ ] **Step 2: Commit**

---

### Task 6: Sending Pipeline

**Files:**
- Create: src/lib/email/sending.ts

- [ ] **Step 1: Create sending service**

sendEmail(config, contact, subject, html): Call Resend `emails.send()` with config's from_name, from_email, sending domain. Return resend_message_id.
sendCampaignBatch(campaign, recipients[]): Rate-paced loop at SEND_RATE_PER_SECOND. For each recipient: render template, send, store resend_message_id in email_campaign_recipients. Uses increment_and_check_send_limit RPC before starting.
sendCampaignWithAB(campaign): If subject_variants: split recipients, send sample (20%), wait (queue delayed check), pick winner, send rest.

Uses Resend SDK: `new Resend(process.env.RESEND_API_KEY)`.

- [ ] **Step 2: Commit**

---

### Task 7: Template Rendering

**Files:**
- Create: src/lib/email/templates.ts

- [ ] **Step 1: Create template service**

renderTemplate(template, contact, config): Replace {{variables}} in subject and HTML (contact.name, contact.email, unsubscribe_url). Apply brand_config (logo, primaryColor, footerText, socialLinks, address). Generate HMAC unsubscribe URL using config.unsubscribe_secret.
getTemplatesForConfig(configId): Return base templates + client's custom templates.

- [ ] **Step 2: Commit**

---

### Task 8: Tracking / Webhook Handler

**Files:**
- Create: src/lib/email/tracking.ts

- [ ] **Step 1: Create tracking service**

processResendEvent(payload): Parse Resend webhook event. Insert into email_events. Match resend_message_id to email_campaign_recipients. Update recipient status (delivered/opened/clicked/bounced/complained). Handle email.unsubscribed event (call unsubscribeContact). Update contact engagement_score and last_engaged_at (Growth/Pro). Track link clicks in recipient link_clicks jsonb (Pro). Evaluate sequence conditions on open/click events.

- [ ] **Step 2: Commit**

---

### Task 9: Sequence Engine

**Files:**
- Create: src/lib/email/sequences.ts

- [ ] **Step 1: Create sequence service**

enrollContact(sequenceId, contactId): Check partial unique constraint. Create enrollment with status=active, calculate next_send_at from first step delay.
processSequenceStep(enrollment): Get current step. If condition is null or condition met: send email via sending pipeline. Advance current_step. Calculate next_send_at. If last step: status=completed.
evaluateTriggers(clientId, eventType, eventData): Query active sequences for this client matching trigger_type and trigger_config. Enroll matching contacts.

Essentials: condition always null (unconditional steps).

- [ ] **Step 2: Commit**

---

## Phase 3: API Routes

### Task 10: Resend Webhook Endpoint

**Files:**
- Create: src/app/api/webhooks/resend/route.ts

- [ ] **Step 1: Create webhook handler**

POST: Verify Resend webhook signature via svix headers. Parse event. Call processResendEvent(). Return 200.
Exclude from auth middleware.

- [ ] **Step 2: Commit**

---

### Task 11: Contact API (Client-Facing)

**Files:**
- Create: src/app/api/email/[slug]/contacts/route.ts

- [ ] **Step 1: Create contact endpoint**

POST: API key auth (Growth/Pro only). Parse body (single contact or batch array, max 100). Call createContact or createContactsBatch. Auto-evaluate sequence triggers for new contacts. Return created contacts.
DELETE (with contact id in body): API key auth. Call unsubscribeContact. Return success.

CORS: same pattern as chatbot API routes.

- [ ] **Step 2: Commit**

---

### Task 12: Trigger API + Unsubscribe

**Files:**
- Create: src/app/api/email/[slug]/triggers/route.ts
- Create: src/app/api/email/[slug]/unsubscribe/route.ts

- [ ] **Step 1: Create trigger endpoint**

POST: API key auth (Pro only). Parse body { event: string, contactEmail: string, data: {} }. Call evaluateTriggers. Return success.

- [ ] **Step 2: Create unsubscribe endpoint**

GET: Parse query params (contact id + HMAC token). Verify HMAC against config's unsubscribe_secret. Call unsubscribeContact. Return simple "You have been unsubscribed" HTML page.

- [ ] **Step 3: Commit**

---

### Task 13: Admin Campaign CRUD + Send

**Files:**
- Create: src/app/api/admin/email/campaigns/route.ts
- Create: src/app/api/admin/email/campaigns/[id]/route.ts
- Create: src/app/api/admin/email/campaigns/[id]/send/route.ts
- Create: src/app/api/admin/email/campaigns/[id]/generate/route.ts
- Create: src/app/api/admin/email/campaigns/[id]/stats/route.ts

- [ ] **Step 1: Create campaign list/create**

GET: requireAdmin. List campaigns for ?config_id with stats.
POST: requireAdmin. Validate config_id, template_id, subject, content. Check campaigns_this_month limit. Insert as draft.

- [ ] **Step 2: Create campaign update/get**

GET: requireAdmin. Return campaign with full stats.
PATCH: requireAdmin. Update draft campaigns only (reject if status != draft).

- [ ] **Step 3: Create send endpoint**

POST: requireAdmin. Validate campaign is draft or scheduled. Set scheduled_at (or send immediately). Update status to scheduled. Campaign cron will pick it up.

- [ ] **Step 4: Create AI generate endpoint**

POST: requireAdmin. Growth/Pro only. Accept { blogPostId } or { prompt }. Use AI SDK streamText to generate email content + subject. Return generated content.

- [ ] **Step 5: Create stats endpoint**

GET: requireAdmin. Return campaign stats with per-recipient breakdown (Growth/Pro) and per-variant stats (Pro).

- [ ] **Step 6: Commit**

---

### Task 14: Admin Config + Sequence CRUD

**Files:**
- Create: src/app/api/admin/email/configs/route.ts
- Create: src/app/api/admin/email/configs/[id]/route.ts
- Create: src/app/api/admin/email/sequences/route.ts
- Create: src/app/api/admin/email/sequences/[id]/route.ts
- Create: src/app/api/admin/email/analytics/[id]/route.ts

- [ ] **Step 1: Config list/create**

GET: requireAdmin. List all email configs with client join.
POST: requireAdmin. Create config. Provision sending domain in Resend via API. Generate unsubscribe_secret (crypto.randomBytes(32).toString('hex')). Generate API key if Growth/Pro.

- [ ] **Step 2: Config update**

PATCH: requireAdmin. Update config fields. Invalidate cache.

- [ ] **Step 3: Sequence CRUD**

GET: requireAdmin. List sequences for config.
POST: requireAdmin. Validate max_active_sequences limit. Create sequence.
PATCH: requireAdmin. Update steps/triggers. Toggle active.

- [ ] **Step 4: Analytics**

GET: requireAdmin. Return aggregate stats (campaigns sent, open rate, click rate, contacts, sequences active).

- [ ] **Step 5: Commit**

---

### Task 15: Cron Jobs

**Files:**
- Create: src/app/api/cron/email-campaign-send/route.ts
- Create: src/app/api/cron/email-sequence-process/route.ts
- Create: src/app/api/cron/email-monthly-reset/route.ts
- Modify: vercel.json

- [ ] **Step 1: Campaign send cron**

GET: Verify CRON_SECRET. Query campaigns where status=scheduled AND scheduled_at <= now(). For each: call sendCampaignBatch (or sendCampaignWithAB for Pro). Serialize across clients. Runs every 5 minutes.

- [ ] **Step 2: Sequence process cron**

GET: Verify CRON_SECRET. Query active enrollments where next_send_at <= now(). For each: call processSequenceStep. Runs every 15 minutes.

- [ ] **Step 3: Monthly reset cron**

GET: Verify CRON_SECRET. Reset sends_this_month and campaigns_this_month to 0 for all configs. Runs 1st of month at midnight.

- [ ] **Step 4: Add cron schedules to vercel.json**

- /api/cron/email-campaign-send: "*/5 * * * *"
- /api/cron/email-sequence-process: "*/15 * * * *"
- /api/cron/email-monthly-reset: "0 0 1 * *"

- [ ] **Step 5: Commit**

---

### Task 16: Update Middleware

**Files:**
- Modify: src/middleware.ts

- [ ] **Step 1: Exclude email routes from auth**

Add api/email/ and api/webhooks/ to the middleware exclusion list (same pattern used for api/chat/).

- [ ] **Step 2: Commit**

---

## Phase 4: Dashboard

### Task 17: Admin Dashboard Overview

**Files:**
- Create: src/app/dashboard/admin/email/page.tsx
- Modify: src/lib/modules.ts
- Modify: src/components/dashboard/sidebar.tsx

- [ ] **Step 1: Add email module**

Add to modules.ts: email: { label: "Email Marketing", path: "/dashboard/admin/email", adminOnly: true }

- [ ] **Step 2: Add sidebar item**

Add "Email Marketing" with Mail icon from lucide-react to admin section.

- [ ] **Step 3: Create overview page**

Server component. requireAdmin. Fetch all email_configs with client join. Table: Client, Domain (verified/pending), Contacts, Campaigns This Month, Sequences Active, View link. "New Config" button.

- [ ] **Step 4: Commit**

---

### Task 18: Campaign Builder + Sequence Builder + Detail Pages

**Files:**
- Create: src/app/dashboard/admin/email/campaigns/new/page.tsx
- Create: src/app/dashboard/admin/email/sequences/new/page.tsx
- Create: src/app/dashboard/admin/email/[id]/page.tsx
- Create: src/app/dashboard/email/page.tsx

- [ ] **Step 1: Campaign builder**

Client-side form. Select config, template, write/generate content, segment picker, schedule. Preview panel. Submit to /api/admin/email/campaigns.

- [ ] **Step 2: Sequence builder**

Client-side form. Select config, trigger type + config, step builder (add steps with template, delay, condition). Submit to /api/admin/email/sequences.

- [ ] **Step 3: Config detail page**

Server component. Fetch config + analytics + recent campaigns + active sequences. Stats cards, campaign list, sequence list.

- [ ] **Step 4: Client dashboard**

Server component. Client's own stats: contacts, open rate, click rate. Recent campaigns list. Active sequences. Contact growth chart (Recharts).

- [ ] **Step 5: Commit**

---

## Phase 5: API Documentation

### Task 19: Create API Docs

**Files:**
- Create: src/app/docs/email-api/layout.tsx
- Create: src/app/docs/email-api/page.mdx
- Create: src/app/docs/email-api/contacts/page.mdx
- Create: src/app/docs/email-api/triggers/page.mdx

- [ ] **Step 1: Docs layout** -- Sidebar nav (Getting Started, Contacts, Triggers)
- [ ] **Step 2: Getting started page** -- Overview, auth, quick start
- [ ] **Step 3: Contacts API page** -- POST/DELETE endpoints, batch import, examples
- [ ] **Step 4: Triggers API page** -- POST trigger, event types, Pro tier
- [ ] **Step 5: Commit**

---

## Phase 6: Build + Deploy

### Task 20: Integration + Smoke Test

- [ ] **Step 1: Run npm run build** -- Fix any TypeScript or build errors
- [ ] **Step 2: Commit all fixes**
- [ ] **Step 3: Push submodule + update Iris repo**
