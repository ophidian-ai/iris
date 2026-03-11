# Prospect-to-Client Onboarding Pipeline -- Design Spec

**Date:** 2026-03-11
**Status:** Draft
**Author:** Iris

## Summary

Automated pipeline that converts a signed proposal into a fully onboarded client -- account creation, signed PDF delivery, invoicing, and project kickoff -- with zero manual intervention on the client-facing side.

## Architecture

**Approach:** Hybrid (Portal webhook + Iris orchestration)

Two execution layers:

- **Server-side (Vercel)** -- instant, client-facing actions triggered by proposal approval
- **Iris-side (local)** -- deferred internal housekeeping, runs on next session

Server-side handles everything the client sees. Iris catches up on internal ops (ClickUp, folder scaffolding, tracker updates) when Eric's machine is on. Morning briefing flags pending Iris tasks so nothing falls through.

## End-to-End Flow

```text
[Proposal Creation & Delivery]
  1. Eric creates proposal (admin dashboard or proposal-generator skill)
  2. System creates prospect client record (status: prospect)
  3. System creates proposal row (status: draft)
  4. Eric reviews/edits, clicks "Send to Client"
  5. System generates signing token, sets status to "sent"
  6. System emails prospect the review link with token (no login required)
  |
  v
[Client Reviews & Signs Proposal]
  7. Prospect clicks link, lands on proposal page (token-based access)
  8. Prospect reviews, then: Sign & Submit / Request Changes / Decline
  |
  v
[On Signature -- Server-Side - Instant]
  9. Record signature (typed name, IP, timestamp, user agent, doc hash)
  10. Update proposals.status -> "approved", nullify signing_token
  11. Generate signed PDF (proposal + signature block) via pdf-lib
  12. Email signed PDF to both parties (Resend)
  13. Create Supabase auth user + profile (role: client)
  14. Update client record (prospect -> active) + create client_services
  15. Create project record (phase: discovery)
  16. Create project milestones (5 phases)
  17. Send welcome email with account setup link (24hr expiry)
  18. Create Stripe customer, generate invoice (deposit, apply coupons)
  19. Email invoice payment link to client
  20. Queue pending Iris tasks
  21. Notify admin: "New client onboarded"
  |
  v
[Client Receives]
  - Signed proposal PDF
  - Welcome email + account setup link
  - Invoice for deposit payment
  |
  v
[Stripe Webhook - On Payment]
  22. Update payments.status -> "paid"
  23. Unlock client dashboard (Discovery checklist visible)
  24. Notify admin: "Deposit received, project ready for discovery"
  |
  v
[Iris - Next Session]
  25. Create ClickUp project board with phase tasks
  26. Scaffold engineering/projects/<name>/ folder
  27. Update prospect-tracker (status: Closed Won)
  28. Log decision in operations/decisions/log.md
  29. Update morning briefing context
```

**Project stays at Discovery phase until Eric manually advances it after kickoff/content gathering is complete.**

## Component 0: Proposal Creation & Delivery

**This is the entry point of the pipeline.** Before a client can sign anything, Eric needs to create and send the proposal.

### Creation Flow

1. Eric creates a proposal from the admin dashboard (`/dashboard/admin/proposals/new`) or Iris generates one via the proposal-generator skill
2. Eric fills in: client name, email, company, phone, service type, scope, deliverables, timeline, pricing, discounts
3. System creates a **prospect client record** (`clients` table, status: `prospect`) with `contact_name`, `contact_email`, `company_name`, `phone`
4. System creates a **proposal row** (`proposals` table, status: `draft`) linked to the prospect client via `client_id`
5. Eric reviews and edits the proposal content in the admin view

### Delivery Flow

1. Eric clicks "Send to Client" on the admin proposal view
2. System generates a signing token (`crypto.randomBytes(32).toString('hex')`)
3. System stores SHA-256 hash of token in `signing_token_hash`, sets `signing_token_expires_at` to now + 7 days
4. System updates `proposals.status` -> `sent`, records `sent_at`
5. System emails the prospect via Resend:
   - From: `iris@ophidianai.com`
   - Subject: "Your proposal from OphidianAI is ready for review"
   - Body: branded email with proposal summary and "Review Proposal" button linking to `/dashboard/proposals/[id]?token=[signing_token]`
6. Prospect clicks the link -- no login required, token grants read + sign access

### Re-Delivery (after revision)

When Eric updates a proposal after a revision request:

1. Previous signing token is already nullified (nullified when `revision_requested` was set)
2. Eric edits the proposal, clicks "Resend to Client"
3. New signing token generated, new 7-day expiry
4. Status returns to `sent`
5. Prospect receives new email with updated link

## Component 1: Proposal Signing Experience

**Location:** `/dashboard/proposals/[id]`

### Pre-Account Access

When Eric sends a proposal, the system creates a lightweight client record (status: `prospect`) and a proposals row with a signing token. The client receives a URL: `/dashboard/proposals/[id]?token=[signing_token]`. This route is public when accessed with a valid token -- no login required.

**Signing token spec:**

- Generated via `crypto.randomBytes(32).toString('hex')` (64-char hex string, 256 bits of entropy)
- Stored as a SHA-256 hash in the `signing_token_hash` column (never stored plaintext)
- Token is included in the URL sent to the client; the hash is what's in the database
- Validated by hashing the URL token and comparing to stored hash
- Expires after 7 days (`signing_token_expires_at`), checked on access
- Rate limited: 5 attempts per IP per minute on token-based access
- Nullified on proposal status change (approved, declined, or revision_requested -> re-issued on resend)

**Prospect client record:** When Eric creates a proposal for a new prospect:

1. A client record is created with `status: 'prospect'`, `contact_email`, `contact_name`, `company_name`
2. The proposal is linked to this client record via `client_id`
3. On approval, the client record status updates from `prospect` to `active`

This resolves the `client_id` FK requirement -- every proposal has a client record, even pre-account prospects.

### Client View

1. Client clicks "Review Proposal" from email link (token-based) or dashboard (authenticated)
2. Page renders full proposal: scope, timeline, deliverables, payment schedule, terms
3. Below the proposal, three actions:
   - **Sign & Submit** (green) -- accepts proposal
   - **Request Changes** (neutral) -- opens revision request
   - **Decline** (muted) -- declines with optional reason

### Sign & Submit Flow

1. Electronic signature disclosure: "By signing below, you consent to conduct this transaction electronically under the ESIGN Act."
2. Checkbox: "I have read and agree to the terms above"
3. Text input: "Type your full legal name"
4. "Sign & Submit" button (disabled until checkbox + name filled)
5. On submit, the signing API route:
   - Records `typed_name`, `approved_at`, `approved_by_ip`, `user_agent`, `document_hash`
   - Updates `proposals.status` -> `approved`
   - Nullifies `signing_token_hash` (token is now dead)
   - Calls the shared onboarding service directly (not via database webhook)
6. Signed PDF generated with signature block:
   - "Electronically signed by [Typed Name]"
   - Date, IP address, document verification hash
7. Signed PDF emailed to client + Eric via Resend
8. Client redirected to confirmation: "Proposal signed. You'll receive your account setup email and invoice shortly."

### Request Changes Flow

1. Client clicks "Request Changes"
2. Text area opens: "Describe what you'd like changed"
3. Client submits
4. `proposals.status` -> `revision_requested`
5. `signing_token_hash` nullified (new token issued on resend)
6. Revision message stored in `proposal_revisions` table (with `requested_by` FK)
7. Eric notified (email + in-app): "Client requested changes: [message]"
8. Client sees: "Revision request submitted. We'll update the proposal and notify you."
9. Eric revises, status returns to `sent`, new signing token generated, client gets "Updated proposal ready for review" email with new link

### Decline Flow

1. Client clicks "Decline"
2. Optional reason text area
3. `proposals.status` -> `declined`
4. `signing_token_hash` nullified
5. Eric notified with reason

### Proposal Status Flow

```text
draft -> sent -> revision_requested -> sent (loop) -> approved
              -> declined
```

## Component 2: Admin Proposals Dashboard

**Location:** `/dashboard/admin/proposals`

### Table View

- Columns: Client, Service, Amount, Status, Sent Date, Last Updated
- Status filters: All, Draft, Sent, Revision Requested, Approved, Declined
- "Revision Requested" badge with count in sidebar nav

### Individual Proposal View: `/dashboard/admin/proposals/[id]`

- Full proposal content (editable inline)
- Revision history panel (right side):
  - Each revision request with client message + timestamp
  - Eric's response/changes noted
- Action buttons by status:
  - **Draft:** "Send to Client"
  - **Sent:** waiting state
  - **Revision Requested:** edit proposal, then "Resend to Client"
  - **Approved:** read-only, signed PDF download
  - **Declined:** read-only with reason

### Notifications

- `revision_requested` triggers in-app notification + email to Eric
- Morning briefing flags proposals in `revision_requested` status

## Component 3: Shared Onboarding Service

**Location:** `src/lib/services/onboarding.ts`

A shared service module that both the proposal signing route and the existing admin client creation route (`/api/admin/clients`) delegate to. This prevents code duplication.

**Exported function:** `onboardClient(params: OnboardClientParams)`

### Parameters

```typescript
interface OnboardClientParams {
  // Client info (from prospect record or form)
  clientId: string;          // existing prospect client record ID
  email: string;
  fullName: string;
  company: string;
  phone?: string;
  websiteUrl?: string;

  // Service info (from proposal)
  serviceType: ServiceType;
  monthlyAmount?: number;

  // Proposal info (optional -- not present for admin-created clients)
  proposalId?: string;
  signedPdfBuffer?: Buffer;

  // Pricing (from proposal content)
  baseAmount: number;
  discountCodes?: string[];  // e.g., ['DISCOUNT_REFERRAL', 'DISCOUNT_RELIGION']
  depositAmount: number;     // calculated from payment schedule
}
```

### Steps (in order)

1. **Create Supabase auth user** -- `auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name, company } })`
2. **Create profile** -- `id` from auth user, role: `client`, full_name, company, phone, website_url
3. **Update client record** -- link `profile_id`, set status: `active`
4. **Create client_services** -- service_type, status: `active`, monthly_amount
5. **Create project** -- phase: `discovery`, linked to client_id + client_service_id
6. **Create project milestones** -- Discovery, Design, Development, Review, Live
7. **Generate account setup link** -- `auth.admin.generateLink({ type: 'recovery' })`, 24hr expiry
8. **Send welcome email** -- branded dark theme, account setup link, via Resend from `iris@ophidianai.com`
9. **Create Stripe customer** -- `stripe.customers.create({ email, name: company, metadata: { client_id } })`
10. **Store stripe_customer_id** on client record
11. **Create Stripe invoice:**
    - `stripe.invoiceItems.create({ customer, amount: baseAmount, description, currency: 'usd' })`
    - Apply coupons: `stripe.invoices.create({ customer, discounts: [{ coupon: 'DISCOUNT_REFERRAL' }, ...], auto_advance: true })`
    - Stripe auto-sends the invoice with hosted payment page link
12. **Create payments record** -- milestone_label: `deposit`, amount: depositAmount, status: `pending`, stripe link
13. **Queue pending_iris_tasks** -- insert records for ClickUp, scaffold, tracker, decision log
14. **Notify admin** -- in-app notification: "New client onboarded: [company_name]"

### Error Handling

- Steps are NOT transactional (each Supabase call is a separate HTTP request). Idempotency checks are the primary safety mechanism.
- Each step checks for existing records before creating (idempotent)
- If a step fails, log which step + error message, notify Eric, halt chain
- The `onboarding_step` column on the client record tracks progress for retry
- Already-completed steps are skipped on retry

### Stripe Discount Integration

Proposal `content` JSON includes a `discounts` array:

```typescript
interface ProposalContent {
  scope: string;
  timeline: string;
  deliverables: string[];
  discounts: Array<{
    code: string;       // 'DISCOUNT_REFERRAL' | 'DISCOUNT_RELIGION'
    label: string;      // 'Referral Discount' | 'Religious Institution Discount'
    amount: number;     // 500
  }>;
  basePrice: number;    // 2200
  finalPrice: number;   // 1200
}
```

The `payment_schedule` JSONB stays as-is (milestone, amount, percentage) and operates on the `finalPrice`. Discount details live in `content` where they're displayed to the client.

API maps discount codes to Stripe coupon IDs when creating the invoice.

## Component 4: Stripe Payment Webhook

**Location:** Extend existing `/api/stripe-webhook/route.ts`

Add a new handler branch for one-off invoice payments alongside the existing subscription handlers.

### On `invoice.paid` Event

1. Check if invoice has `metadata.client_id` (set during invoice creation in onboarding service)
2. If present, this is a project deposit/milestone payment:
   - Look up client by `client_id` from metadata
   - Find matching `payments` record by `stripe_payment_intent_id` or by `client_id` + `milestone_label` + `status: 'pending'`
   - Update `payments.status` -> `paid`, record `paid_at`
   - Unlock client dashboard -- Discovery checklist becomes visible
   - Notify admin: "Deposit received from [company_name] -- project ready for discovery"
3. If not present, fall through to existing subscription payment handling

**Project phase stays at Discovery.** Eric manually advances to Design after kickoff and content gathering.

## Component 5: Iris Deferred Tasks

**Skill:** `.claude/skills/client-onboarding/SKILL.md`

Runs when Iris picks up pending tasks (morning briefing or manual invocation).

### Task Types

| Task | Action |
| ------ | -------- |
| `clickup_board` | Create ClickUp folder + phase lists under Sales & Outreach or new Projects folder |
| `engineering_scaffold` | Create `engineering/projects/<name>/` with standard folder structure from template |
| `tracker_update` | Update `prospect-tracker.md` status to "Closed Won" + Google Sheet |
| `decision_log` | Append to `operations/decisions/log.md` |
| `briefing_update` | Update `iris/context/current-priorities.md` with new active project |

### Pending Tasks Table: `pending_iris_tasks`

| Column | Type | Description |
| -------- | ------ | ------------- |
| id | uuid | PK, gen_random_uuid() |
| task_type | text | Task identifier |
| payload | jsonb | client_id, project_id, company_name, service_type |
| status | text | `pending`, `completed`, `failed` |
| error_message | text | Why the task failed (nullable) |
| retry_count | int | Number of retry attempts, default 0 |
| created_at | timestamptz | When queued |
| completed_at | timestamptz | When Iris processed |

### Morning Briefing Integration

Morning coffee skill checks `pending_iris_tasks` for `pending` or `failed` status:

```sql
SELECT task_type, payload->>'company_name' as company, retry_count
FROM pending_iris_tasks
WHERE status IN ('pending', 'failed')
ORDER BY created_at ASC;
```

Flags in briefing: "New client onboarded -- pending tasks: [list with retry counts]". Iris processes them during the session.

## Database Changes

### Migration: `XXXXXX_proposal_signing_and_onboarding.sql`

#### New Enum Value

```sql
ALTER TYPE proposal_status ADD VALUE 'revision_requested';
```

#### Modified Table: `proposals`

```sql
ALTER TABLE proposals
  ADD COLUMN signing_token_hash text UNIQUE,
  ADD COLUMN signing_token_expires_at timestamptz,
  ADD COLUMN typed_name text,
  ADD COLUMN user_agent text,
  ADD COLUMN document_hash text;
```

#### Updated RLS Policy: `proposals_update_client`

The existing policy only allows clients to set status to `approved` or `declined`. Update to include `revision_requested`:

```sql
DROP POLICY proposals_update_client ON proposals;
CREATE POLICY proposals_update_client ON proposals
  FOR UPDATE USING (client_id IN (SELECT my_client_ids()))
  WITH CHECK (status IN ('approved', 'declined', 'revision_requested'));
```

#### New RLS Policy: Token-Based Proposal Access

```sql
-- Allow public read access to proposals via valid signing token
-- (token validation happens in the API route, not RLS -- service role used for token-based reads)
```

Token-based access uses the service role client to bypass RLS. The API route validates the token hash before returning proposal data.

#### New Table: `proposal_revisions`

```sql
CREATE TABLE proposal_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES auth.users(id),
  message text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE proposal_revisions ENABLE ROW LEVEL SECURITY;

-- Clients can view revisions on their own proposals
CREATE POLICY proposal_revisions_select_client ON proposal_revisions
  FOR SELECT USING (
    proposal_id IN (SELECT id FROM proposals WHERE client_id IN (SELECT my_client_ids()))
  );

-- Clients can insert revision requests on their own sent proposals
CREATE POLICY proposal_revisions_insert_client ON proposal_revisions
  FOR INSERT WITH CHECK (
    proposal_id IN (SELECT id FROM proposals WHERE client_id IN (SELECT my_client_ids()) AND status = 'sent')
  );

-- Admins see all
CREATE POLICY proposal_revisions_admin ON proposal_revisions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### New Table: `pending_iris_tasks`

```sql
CREATE TABLE pending_iris_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message text,
  retry_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE pending_iris_tasks ENABLE ROW LEVEL SECURITY;

-- Admin only
CREATE POLICY pending_iris_tasks_admin ON pending_iris_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### Add `prospect` to Client Status

```sql
-- Already exists: 'active', 'inactive'. Add 'prospect'.
-- Existing check constraint on clients.status:
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check
  CHECK (status IN ('active', 'inactive', 'prospect'));
```

#### Add Missing Columns to `clients`

```sql
ALTER TABLE clients ADD COLUMN contact_name text;
ALTER TABLE clients ADD COLUMN phone text;
ALTER TABLE clients ADD COLUMN onboarding_step text;
```

`contact_name` and `phone` store the primary contact info on the client record (separate from the `profiles` table, which is tied to the auth user). `onboarding_step` tracks progress for retry/resume of the onboarding service.

### TypeScript Type Updates

**File:** `src/lib/supabase/types.ts`

- Add `'revision_requested'` to `ProposalStatus` union type
- Add `'prospect'` to client status type
- Add `signing_token_hash`, `signing_token_expires_at`, `typed_name`, `user_agent`, `document_hash` to Proposal interface
- Add `contact_name`, `phone` to Client interface
- Add `onboarding_step` to Client interface
- Add `ProposalContent` interface with `discounts` array
- Add `PendingIrisTask` interface
- Add `ProposalRevision` interface

## File Changes Summary

### New Files

- `src/lib/services/onboarding.ts` -- shared onboarding service (extracted from existing + new logic)
- `src/app/dashboard/proposals/[id]/page.tsx` -- client proposal review/signing page
- `src/app/dashboard/admin/proposals/page.tsx` -- admin proposals table
- `src/app/dashboard/admin/proposals/[id]/page.tsx` -- admin single proposal view (edit + send)
- `src/app/dashboard/admin/proposals/new/page.tsx` -- admin proposal creation form
- `src/app/api/proposals/[id]/sign/route.ts` -- signing API (validates token, calls onboarding service)
- `src/app/api/proposals/[id]/revise/route.ts` -- revision request API
- `supabase/migrations/XXXXXX_proposal_signing_and_onboarding.sql` -- schema changes
- `.claude/skills/client-onboarding/SKILL.md` -- Iris deferred task skill

### Modified Files

- `src/app/api/admin/clients/route.ts` -- refactor to delegate to shared onboarding service
- `src/app/api/stripe-webhook/route.ts` -- add invoice.paid handler for one-off deposits
- `src/app/dashboard/layout.tsx` -- add "Proposals" to sidebar nav + revision badge
- `src/lib/supabase/types.ts` -- add new types and update existing unions
- `.claude/skills/morning-coffee/SKILL.md` -- add pending_iris_tasks check
- `operations/automation/inbox-monitor.ps1` -- add pending tasks awareness

## Security Considerations

- **Signing tokens:** SHA-256 hashed in database, 256-bit entropy, 7-day expiry, rate-limited (5/min/IP), nullified on any status change
- **ESIGN compliance:** typed name, consent checkbox, IP, timestamp, user agent, SHA-256 document hash
- **Signed PDF:** includes verification hash for tamper detection
- **Stripe webhooks:** signature verification via `stripe.webhooks.constructEvent()` on all payment events
- **Onboarding trigger:** signing API route calls onboarding service directly (no unauthenticated webhook endpoint)
- **RLS policies:** clients see only their own proposals and revisions, admins see all
- **Service role:** used for token-based reads and onboarding chain (bypasses RLS for admin operations)
- **PDF generation:** `pdf-lib` (pure JavaScript, no browser dependency, Vercel-compatible)

## Out of Scope (Future)

- Multi-contact support (`client_contacts` table) -- discussed, deferred
- Portfolio page auto-population from client records -- discussed, deferred
- Cloud runtime for Iris (removes PC dependency) -- discussed, deferred
- BoldSign or third-party e-sign integration -- decided against, portal-based is legally sufficient
