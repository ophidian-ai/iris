# CRM Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build an internal CRM product as the central hub connecting all OphidianAI products. Contact management, deal pipelines, activity timelines, task management, and cross-product automation.

**Architecture:** Supabase for all data (deals, activities, tasks, pipelines, automations). Shares email_contacts table with Email Marketing. Internal event bus for cross-product integration. Resend for task reminders.

**Tech Stack:** Next.js 16, Supabase (Postgres + Auth + RLS), Resend, TypeScript

**Spec:** docs/superpowers/specs/2026-03-19-crm-automation-design.md

**Dependency:** Email Marketing must be built first (shared email_contacts table + email_configs API key).

---

## File Structure

### New Files (Create)

**Database:**
- supabase/migrations/20260319200000_crm_tables.sql

**Types:**
- src/lib/supabase/crm-types.ts

**Library:**
- src/lib/crm/tier-defaults.ts
- src/lib/crm/config.ts
- src/lib/crm/deals.ts
- src/lib/crm/activities.ts
- src/lib/crm/tasks.ts
- src/lib/crm/automations.ts
- src/lib/crm/event-bus.ts

**API Routes:**
- src/app/api/crm/[slug]/contacts/route.ts
- src/app/api/crm/[slug]/deals/route.ts
- src/app/api/crm/[slug]/activities/route.ts
- src/app/api/admin/crm/configs/route.ts
- src/app/api/admin/crm/configs/[id]/route.ts
- src/app/api/admin/crm/pipelines/route.ts
- src/app/api/admin/crm/pipelines/[id]/route.ts
- src/app/api/admin/crm/deals/route.ts
- src/app/api/admin/crm/deals/[id]/route.ts
- src/app/api/admin/crm/contacts/[id]/timeline/route.ts
- src/app/api/admin/crm/tasks/route.ts
- src/app/api/admin/crm/tasks/[id]/route.ts
- src/app/api/admin/crm/automations/route.ts
- src/app/api/admin/crm/automations/[id]/route.ts
- src/app/api/admin/crm/analytics/[id]/route.ts
- src/app/api/cron/crm-automation-process/route.ts
- src/app/api/cron/crm-task-reminders/route.ts
- src/app/api/cron/crm-task-archive/route.ts

**Dashboard:**
- src/app/dashboard/admin/crm/page.tsx
- src/app/dashboard/admin/crm/contacts/[id]/page.tsx
- src/app/dashboard/admin/crm/tasks/page.tsx
- src/app/dashboard/admin/crm/automations/new/page.tsx
- src/app/dashboard/admin/crm/[id]/page.tsx
- src/app/dashboard/crm/page.tsx

**API Docs:**
- src/app/docs/crm-api/layout.tsx
- src/app/docs/crm-api/page.mdx
- src/app/docs/crm-api/deals/page.mdx
- src/app/docs/crm-api/activities/page.mdx

### Modified Files

- src/lib/supabase/types.ts -- Re-export CRM types
- src/lib/modules.ts -- Add CRM module
- src/components/dashboard/sidebar.tsx -- Add CRM menu item
- src/middleware.ts -- Exclude /api/crm/ from auth
- src/lib/chatbot/lead-capture.ts -- Add CRM event bus call after lead capture
- vercel.json -- Add cron jobs

---

## Phase 1: Foundation

### Task 1: Database Migration

**Files:**
- Create: supabase/migrations/20260319200000_crm_tables.sql

- [ ] **Step 1: Write the migration SQL**

Create 5 tables: crm_configs, crm_pipelines, crm_deals, crm_activities, crm_tasks, crm_automations.

Include:
- crm_task_status enum (pending, completed)
- Indexes: crm_deals(config_id, pipeline_id), crm_deals(contact_id), crm_activities(contact_id, created_at DESC), crm_activities(config_id, deal_id), crm_tasks(config_id, status, due_at), crm_automations(config_id, trigger_type)
- RLS: admin full access, client read own (via client_id chain)
- updated_at triggers on crm_configs, crm_deals, crm_tasks
- Insert default pipeline for each new crm_configs (via trigger or application code)

See spec data model for full schema.

- [ ] **Step 2: Commit**

---

### Task 2: TypeScript Types

**Files:**
- Create: src/lib/supabase/crm-types.ts
- Modify: src/lib/supabase/types.ts

- [ ] **Step 1: Create CRM types**

Export: CrmConfig, CrmPipeline, CrmDeal, CrmActivity, CrmTask, CrmAutomation, CrmTaskStatus.

Note: crm_activities.linked_content_available boolean for tombstone pattern. crm_tasks.status is only pending/completed -- overdue computed at read time.

- [ ] **Step 2: Re-export from main types file**

- [ ] **Step 3: Commit**

---

### Task 3: Tier Defaults

**Files:**
- Create: src/lib/crm/tier-defaults.ts

- [ ] **Step 1: Create tier defaults**

Export CRM_TIER_DEFAULTS keyed by tier: maxContacts, maxDeals, maxPipelines, maxCustomFields, customStages, activityAutoLog, activityClickThrough, manualTasks, automatedTasks, automationEnabled, apiAccess (none/read/full), emailIntegration (view/send/full).

Export: DEFAULT_PIPELINE_STAGES array with { name, order, probability, color }.

- [ ] **Step 2: Commit**

---

## Phase 2: Core Library

### Task 4: Config Loader

**Files:**
- Create: src/lib/crm/config.ts

- [ ] **Step 1: Create config loader**

loadCrmConfig(slug): Query crm_configs by client slug (join clients table). Cache in Redis. Return CrmConfig or null.

Same pattern as email/config.ts.

- [ ] **Step 2: Commit**

---

### Task 5: Deal Management

**Files:**
- Create: src/lib/crm/deals.ts

- [ ] **Step 1: Create deal service**

createDeal(configId, data): Validate stage against pipeline's stages array. Check max deals limit. Auto-set probability from pipeline stage. Insert deal. Log activity (deal_stage_change). Evaluate automations (contact_created trigger if new deal from new contact).
updateDealStage(dealId, newStage): Validate stage. Update deal. Auto-set probability. Log activity. Evaluate automations (deal_stage_change, deal_won, deal_lost).
getDealsForPipeline(pipelineId, filters): Query deals grouped by stage for Kanban view.

- [ ] **Step 2: Commit**

---

### Task 6: Activity Service

**Files:**
- Create: src/lib/crm/activities.ts

- [ ] **Step 1: Create activity service**

logActivity(configId, contactId, type, description, linkedContent?): Insert into crm_activities. Set auto_logged=true if called from another product. Set linked_content_available=true.
getTimeline(contactId, limit?, offset?): Query activities for contact ordered by created_at DESC. Include linked content type for Pro click-through.
markLinkedContentDeleted(contentType, contentId): Set linked_content_available=false for matching activities.

- [ ] **Step 2: Commit**

---

### Task 7: Task Management

**Files:**
- Create: src/lib/crm/tasks.ts

- [ ] **Step 1: Create task service**

createTask(configId, data): Insert task with status=pending. If auto_generated, link automation_id.
completeTask(taskId): Set status=completed, completed_at=now(). Log activity.
getTasksDue(configId): Query tasks where status=pending, ordered by due_at. Compute overdue flag in application (due_at < now).
sendTaskReminders(configId): Query pending tasks where due_at is within 24 hours and reminder_sent=false. Send email via Resend. Set reminder_sent=true.

- [ ] **Step 2: Commit**

---

### Task 8: Automation Engine

**Files:**
- Create: src/lib/crm/automations.ts

- [ ] **Step 1: Create automation engine**

evaluateAutomations(configId, triggerType, triggerData): Query active automations matching trigger_type and trigger_config. For each match: generate idempotency key (hash of automation_id + deal_id + floor(timestamp/60s)). Check if action already queued. If not: insert into automation action queue (crm_activities with type='automation_queued').
processAutomationActions(): Called by cron. Query queued actions. Execute: enroll_sequence (call email sequence enrollment), create_task, send_notification (Resend), update_deal. Log result to crm_activities. Max 10 actions per trigger event.

Loop prevention: skip if the triggering event was itself from the same automation_id.

- [ ] **Step 2: Commit**

---

### Task 9: Event Bus

**Files:**
- Create: src/lib/crm/event-bus.ts

- [ ] **Step 1: Create cross-product event bus**

onChatbotLeadCaptured(clientId, lead): Check if CRM config exists. If yes: upsert email_contacts, create deal with source=chatbot, log activity with linked chatbot conversation.
onEmailEvent(clientId, contactId, eventType, campaignId): Log activity (email_sent, email_opened, email_clicked).
onSeoAuditCompleted(clientId, contactId, auditId): Log activity with linked audit.
onContentPublished(clientId, blogPostId): Log activity.
onContactFormSubmitted(clientId, formData): Upsert contact, create deal with source=contact_form, log activity.

Each function: check if crm_configs exists for client_id. If not, no-op. Idempotent on duplicate calls.

- [ ] **Step 2: Modify src/lib/chatbot/lead-capture.ts**

After the existing lead storage + email notification, add:
```
import { onChatbotLeadCaptured } from "@/lib/crm/event-bus";
// After successful lead capture:
await onChatbotLeadCaptured(config.client_id, { name, email, phone, conversationId });
```

Only call if client has CRM provisioned (the event bus function handles the check).

- [ ] **Step 3: Commit**

---

## Phase 3: API Routes

### Task 10: Client CRM API

**Files:**
- Create: src/app/api/crm/[slug]/contacts/route.ts
- Create: src/app/api/crm/[slug]/deals/route.ts
- Create: src/app/api/crm/[slug]/activities/route.ts

- [ ] **Step 1: Contacts endpoint**

GET: API key auth. Growth: read-only list with filters. Pro: full list.
POST: API key auth. Pro only. Create contact + optional deal.

- [ ] **Step 2: Deals endpoint**

GET: API key auth. Growth: read-only. Pro: full. Filter by pipeline, stage.
POST: Pro only. Create deal.
PATCH: Pro only. Update deal stage/value.

- [ ] **Step 3: Activities endpoint**

POST: API key auth. Pro only. Log custom activity.

- [ ] **Step 4: Commit**

---

### Task 11: Admin CRM Config + Pipeline CRUD

**Files:**
- Create: src/app/api/admin/crm/configs/route.ts
- Create: src/app/api/admin/crm/configs/[id]/route.ts
- Create: src/app/api/admin/crm/pipelines/route.ts
- Create: src/app/api/admin/crm/pipelines/[id]/route.ts

- [ ] **Step 1: Config CRUD**

GET: requireAdmin. List all CRM configs with client join.
POST: requireAdmin. Create config. Provision default pipeline with DEFAULT_PIPELINE_STAGES. Set tier defaults.
PATCH: requireAdmin. Update config, custom fields.

- [ ] **Step 2: Pipeline CRUD**

GET: requireAdmin. List pipelines for config.
POST: requireAdmin. Growth/Pro only. Validate against max_pipelines (422 if exceeded).
PATCH: requireAdmin. Update stages. Validate no active deals in removed stages.

- [ ] **Step 3: Commit**

---

### Task 12: Admin Deal + Timeline + Task + Automation CRUD

**Files:**
- Create: src/app/api/admin/crm/deals/route.ts
- Create: src/app/api/admin/crm/deals/[id]/route.ts
- Create: src/app/api/admin/crm/contacts/[id]/timeline/route.ts
- Create: src/app/api/admin/crm/tasks/route.ts
- Create: src/app/api/admin/crm/tasks/[id]/route.ts
- Create: src/app/api/admin/crm/automations/route.ts
- Create: src/app/api/admin/crm/automations/[id]/route.ts
- Create: src/app/api/admin/crm/analytics/[id]/route.ts

- [ ] **Step 1: Deals**

GET: requireAdmin. List deals with filters (pipeline, stage, date, value).
POST: requireAdmin. Create deal via deal service.
PATCH: requireAdmin. Update deal via updateDealStage (triggers automations).

- [ ] **Step 2: Timeline**

GET: requireAdmin. Return activities for contact, ordered by created_at DESC. Include linked_content_available flag.

- [ ] **Step 3: Tasks**

GET: requireAdmin. List tasks filtered by status, due date, config. Compute overdue in query (due_at < now AND status=pending).
POST: requireAdmin. Create manual task.
PATCH: requireAdmin. Complete task or update.

- [ ] **Step 4: Automations**

GET: requireAdmin. List automations for config.
POST: requireAdmin. Pro only. Create automation rule.
PATCH: requireAdmin. Update/toggle active.

- [ ] **Step 5: Analytics**

GET: requireAdmin. Pipeline stats: deal count by stage, total value, weighted value, win rate, avg days to close.

- [ ] **Step 6: Commit**

---

### Task 13: Cron Jobs

**Files:**
- Create: src/app/api/cron/crm-automation-process/route.ts
- Create: src/app/api/cron/crm-task-reminders/route.ts
- Create: src/app/api/cron/crm-task-archive/route.ts
- Modify: vercel.json

- [ ] **Step 1: Automation processing cron**

GET: Verify CRON_SECRET. Call processAutomationActions(). Runs every minute.

- [ ] **Step 2: Task reminders cron**

GET: Verify CRON_SECRET. Query pending tasks due within 24 hours with reminder_sent=false. Send reminder via Resend. Runs daily at 8am ET.

- [ ] **Step 3: Task archive cron**

GET: Verify CRON_SECRET. Archive tasks pending with due_at > 30 days past (set completed with note). Runs monthly.

- [ ] **Step 4: Add cron schedules to vercel.json**

- /api/cron/crm-automation-process: "* * * * *"
- /api/cron/crm-task-reminders: "0 8 * * *"
- /api/cron/crm-task-archive: "0 0 1 * *"

- [ ] **Step 5: Commit**

---

### Task 14: Update Middleware

**Files:**
- Modify: src/middleware.ts

- [ ] **Step 1: Exclude CRM routes from auth**

Add api/crm/ to the middleware exclusion list.

- [ ] **Step 2: Commit**

---

## Phase 4: Dashboard

### Task 15: Admin Dashboard

**Files:**
- Create: src/app/dashboard/admin/crm/page.tsx
- Create: src/app/dashboard/admin/crm/contacts/[id]/page.tsx
- Create: src/app/dashboard/admin/crm/tasks/page.tsx
- Create: src/app/dashboard/admin/crm/automations/new/page.tsx
- Create: src/app/dashboard/admin/crm/[id]/page.tsx
- Modify: src/lib/modules.ts
- Modify: src/components/dashboard/sidebar.tsx

- [ ] **Step 1: Add CRM module + sidebar item**

modules.ts: crm: { label: "CRM", path: "/dashboard/admin/crm", adminOnly: true }
sidebar.tsx: "CRM" with Users icon from lucide-react.

- [ ] **Step 2: Pipeline Kanban page**

Server component. requireAdmin. Fetch configs + deals. Kanban board with stage columns. Deal cards: title, contact, value, days in stage. Pipeline selector. Summary bar.

- [ ] **Step 3: Contact detail page**

Server component. Fetch contact + activities + deals + tasks. Info card, activity timeline, deals list, tasks list. Action buttons.

- [ ] **Step 4: Tasks page**

Server component. Tasks grouped by overdue/today/upcoming. Quick complete. Filter by client.

- [ ] **Step 5: Automation builder**

Client-side form. Trigger picker + action picker. Preview. Submit to /api/admin/crm/automations.

- [ ] **Step 6: Config detail page**

Server component. CRM config info + pipeline stats + recent activities + automation list.

- [ ] **Step 7: Commit**

---

### Task 16: Client Dashboard

**Files:**
- Create: src/app/dashboard/crm/page.tsx

- [ ] **Step 1: Client CRM view**

Server component. Client auth. Pipeline Kanban (own deals). Contact list with search. Essentials: basic cards, manual notes. Growth: timeline, tasks. Pro: full timeline, automation status.

- [ ] **Step 2: Commit**

---

## Phase 5: API Documentation

### Task 17: Create API Docs

**Files:**
- Create: src/app/docs/crm-api/layout.tsx
- Create: src/app/docs/crm-api/page.mdx
- Create: src/app/docs/crm-api/deals/page.mdx
- Create: src/app/docs/crm-api/activities/page.mdx

- [ ] **Step 1: Docs layout** -- Sidebar nav
- [ ] **Step 2: Getting started page** -- Overview, auth, tier access matrix
- [ ] **Step 3: Deals API page** -- CRUD endpoints, stage management
- [ ] **Step 4: Activities API page** -- Log custom activities (Pro)
- [ ] **Step 5: Commit**

---

## Phase 6: Build + Deploy

### Task 18: Integration + Smoke Test

- [ ] **Step 1: Run npm run build** -- Fix TypeScript/build errors
- [ ] **Step 2: Commit all fixes**
- [ ] **Step 3: Push submodule + update Iris repo**
