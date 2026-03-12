# Cloud-Hosted Persistent Iris -- Implementation Plan

**Status:** Deferred (2026-03-12)
**Reason:** Pre-revenue stage doesn't justify the implementation time investment. Revisit when pipeline activity increases or revenue exceeds burn rate.

---

## Context

Iris currently runs only when Eric opens a Claude Code session. All automation (morning coffee, outreach pipeline, expense tracking, follow-up reminders) requires Eric to be at his desk. This means missed follow-ups, delayed briefings, and manual triggering of routine tasks that should run on autopilot.

**Goal:** Move Iris's repeatable, non-creative workflows to a cloud runtime so they execute autonomously on schedules and event triggers. Eric focuses on project building and creativity; Iris handles the operational grind 24/7.

**Outcome:** Eric wakes up to a morning briefing in his inbox, prospect follow-ups draft themselves, expenses auto-log, and the pipeline stays warm -- all without opening a terminal.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Supabase Project                   │
│  (engineering/projects/ophidian-ai/supabase/)        │
│                                                      │
│  ┌──────────────┐  ┌─────────────────────────────┐  │
│  │  pg_cron     │──│  Edge Functions (Deno)       │  │
│  │  scheduler   │  │                              │  │
│  │              │  │  iris-morning-coffee          │  │
│  │  6:00 AM ET  │──│  iris-outreach-pipeline      │  │
│  │  8:00 AM ET  │──│  iris-expense-scan           │  │
│  │  9:00 AM ET  │──│  iris-follow-up-check        │  │
│  │  Mon 8:30 AM │──│  iris-weekly-review          │  │
│  └──────────────┘  │  iris-webhook-handler         │  │
│                     └──────────┬──────────────────┘  │
│                                │                      │
│  ┌─────────────────────────────┴──────────────────┐  │
│  │  Supabase Tables                               │  │
│  │  iris_task_runs, repo_files, staged_emails,    │  │
│  │  iris_notifications, agent_config              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────┬───────────────────┬───────────────────┘
               │                   │
    ┌──────────┴──────┐   ┌───────┴────────┐
    │  Google APIs    │   │  Anthropic API │
    │  (Service Acct) │   │  (Sonnet)      │
    │  Gmail, Cal,    │   │  ~$2/mo        │
    │  Sheets, Drive  │   └────────────────┘
    └─────────────────┘
```

**Runtime:** Supabase Edge Functions (Deno) -- already used for `check-overdue-payments`, free tier covers 500K invocations/mo

**Scheduler:** pg_cron (built into Supabase) -- triggers edge functions on schedule

**AI:** Anthropic API with Claude Sonnet -- pay-per-token (~$2/mo estimated), replaces Claude Code Max ($100/mo) for routine tasks

**Google Workspace:** Service Account with domain-wide delegation -- replaces OAuth-based GWS CLI for headless execution

**Notifications:** Resend (already integrated) + Gmail API for briefing delivery

**State:** Supabase Postgres tables for run logs, file cache, staged emails, notifications

---

## What Moves to Cloud vs. What Stays Local

### Category A: Cloud (No AI needed -- direct API calls)

| Function | Trigger | What It Does |
|----------|---------|--------------|
| Expense receipt scan | Daily 6:00 AM ET | Gmail search for receipts, extract data, log to Sheets |
| Follow-up check | Daily 9:00 AM ET | Read prospect tracker, flag overdue follow-ups, send notification |
| Calendar digest | Daily 6:30 AM ET | Pull today's events, include in morning briefing |
| Invoice overdue check | Daily 9:00 AM ET | Check Revenue sheet for unpaid invoices past terms |

### Category B: Cloud (AI needed -- Anthropic API)

| Function | Trigger | What It Does |
|----------|---------|--------------|
| Morning briefing | Daily 7:00 AM ET | Gather all data, generate briefing PDF, email to Eric |
| Outreach pipeline | Weekly Mon 8:00 AM ET | Research prospects, score, draft emails, stage for review |
| Email response drafts | On new prospect reply | Draft response, save to staged_emails for Eric's approval |
| Weekly review | Weekly Fri 4:00 PM ET | Summarize week's activity, pipeline changes, recommendations |

### Category C: Stays Local (Interactive / Creative)

| Function | Why It Stays |
|----------|-------------|
| Client project work | Creative, interactive, needs Eric's input |
| Brainstorming sessions | Collaborative, real-time dialogue |
| Design reviews | Visual, requires Eric's judgment |
| Complex debugging | Interactive, iterative |
| Skill/agent development | Meta-work on the system itself |
| SEO audits | Heavy Playwright usage, interactive report review |
| Proposal writing | Creative, needs Eric's voice and approval |

---

## Database Schema

### New Tables

```sql
-- Track every automated task execution
CREATE TABLE iris_task_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  result JSONB,
  tokens_used INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0
);

-- Cache critical repo files for cloud functions to read
CREATE TABLE repo_files (
  path TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'manual'
);

-- Emails drafted by AI, waiting for Eric's approval
CREATE TABLE staged_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  context TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

-- Notifications sent to Eric
CREATE TABLE iris_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Agent prompts and config
CREATE TABLE agent_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Files to Sync to `repo_files`

~20 files cloud functions need:

```
sales/lead-generation/prospect-tracker.md
sales/lead-generation/template-rotation.md
sales/lead-generation/staged-emails.json
marketing/activity-log.md
operations/decisions/log.md
iris/context/current-priorities.md
iris/context/goals.md
persistent-memory/operations/pricing-and-services.md
persistent-memory/operations/outreach-system.md
persistent-memory/operations/prospect-management.md
.claude/skills/morning-coffee/templates/briefing-template.html
```

Sync mechanism: A local git post-commit hook that upserts changed files matching a whitelist.

---

## Google Service Account Setup

1. Create Service Account in Google Cloud Console (existing project)
2. Enable Domain-Wide Delegation in Google Workspace Admin
3. Grant scopes: gmail.readonly, gmail.send, gmail.compose, calendar.readonly, spreadsheets
4. Store credentials as Supabase Edge Function secrets
5. Impersonate `eric.lefler@ophidianai.com` in all API calls

### Shared Google API Helper

```typescript
// supabase/functions/_shared/google-auth.ts
import { create } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

export async function getGoogleAccessToken(scopes: string[]): Promise<string> {
  const serviceAccount = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")!);
  const now = Math.floor(Date.now() / 1000);

  const jwt = await create(
    { alg: "RS256", typ: "JWT" },
    {
      iss: serviceAccount.client_email,
      sub: "eric.lefler@ophidianai.com",
      scope: scopes.join(" "),
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    serviceAccount.private_key
  );

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant_type:jwt-bearer&assertion=${jwt}`,
  });

  const { access_token } = await resp.json();
  return access_token;
}
```

---

## Edge Function Pattern

Based on existing `check-overdue-payments/index.ts`:

```typescript
// supabase/functions/iris-<task-name>/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGoogleAccessToken } from "../_shared/google-auth.ts";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: run } = await supabase.from("iris_task_runs").insert({
    task_name: "<task-name>",
    status: "running",
  }).select().single();

  try {
    const token = await getGoogleAccessToken(["gmail.readonly", "spreadsheets"]);
    // Do the work...

    await supabase.from("iris_task_runs").update({
      status: "success",
      completed_at: new Date().toISOString(),
      result: { /* summary */ },
      tokens_used: totalTokens,
    }).eq("id", run.id);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    await supabase.from("iris_task_runs").update({
      status: "failed",
      completed_at: new Date().toISOString(),
      result: { error: error.message },
    }).eq("id", run.id);

    // Notify Eric via Resend
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "iris@ophidianai.com",
        to: "eric.lefler@ophidianai.com",
        subject: `[Iris] Task failed: <task-name>`,
        html: `<p>Error: ${error.message}</p>`,
      }),
    });

    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

---

## Schedule Configuration (pg_cron)

```sql
-- Morning briefing: 7:00 AM ET (11:00 UTC during EDT)
SELECT cron.schedule('iris-morning-coffee', '0 11 * * *', ...);

-- Expense scan: 6:00 AM ET
SELECT cron.schedule('iris-expense-scan', '0 10 * * *', ...);

-- Follow-up check: 9:00 AM ET
SELECT cron.schedule('iris-follow-up-check', '0 13 * * *', ...);

-- Outreach pipeline: Monday 8:00 AM ET
SELECT cron.schedule('iris-outreach-pipeline', '0 12 * * 1', ...);

-- Weekly review: Friday 4:00 PM ET
SELECT cron.schedule('iris-weekly-review', '0 20 * * 5', ...);
```

---

## Safety Guardrails

1. **No auto-send emails.** All outreach emails go to `staged_emails` with status `pending`. Eric approves before sending.
2. **No destructive writes.** Cloud functions append to Sheets, never delete rows.
3. **Cost ceiling.** Anthropic API key has a $10/mo spend limit.
4. **Failure notifications.** Every failed task triggers a Resend email to Eric.
5. **Run logging.** Every execution logged to `iris_task_runs` with tokens and cost.
6. **No repo writes.** Cloud functions read from `repo_files` but never push to git.

---

## Cost Estimate

| Item | Current | After Cloud Iris |
|------|---------|-----------------|
| Claude Code Max | $100/mo | $100/mo (keep for interactive) |
| Anthropic API (Sonnet) | $0 | ~$2/mo |
| Supabase (free tier) | $0 | $0 |
| Google Service Account | $0 | $0 |
| Resend (free tier) | $0 | $0 |
| **Net new cost** | | **~$2/mo** |

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

1. Google Service Account setup + domain-wide delegation
2. Create database tables (migration)
3. Build shared helpers: google-auth.ts, anthropic.ts, repo-files.ts, notify.ts
4. Build + deploy iris-expense-scan (simplest function)
5. Set up pg_cron schedule
6. Verify end-to-end

### Phase 2: Core Automation (Week 3-4)

7. Build + deploy iris-follow-up-check
8. Build + deploy iris-morning-coffee (simplified text email version)
9. Set up pg_cron schedules
10. Build repo file sync git hook

### Phase 3: Outreach Automation (Week 5-6)

11. Build + deploy iris-outreach-pipeline
12. Build email approval flow
13. Build + deploy iris-webhook-handler
14. Set up pg_cron for weekly outreach

### Phase 4: Polish (Week 7-8)

15. Build + deploy iris-weekly-review
16. Build monitoring view of iris_task_runs
17. Tune schedules based on run data
18. Document runbook

---

## When to Revisit

- 3+ active prospects in pipeline simultaneously
- Follow-ups slipping through cracks due to workload
- Monthly revenue exceeds burn rate
- Client work keeps Eric too busy for manual triggers
