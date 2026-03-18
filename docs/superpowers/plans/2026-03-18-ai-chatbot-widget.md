# AI Chatbot Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build an embeddable AI chatbot widget product with RAG, tiered lead capture, and a demo-to-production lifecycle for OphidianAI small business clients.

**Architecture:** Hybrid hosting -- API routes and widget page on ophidianai.com (Next.js 16 app router), standalone embed.js script for client sites, iframe isolation for the widget. Pinecone RAG with shared namespaces (Essentials/Growth) and dedicated indexes (Pro). AI SDK v6 with Vercel AI Gateway for model routing.

**Tech Stack:** Next.js 16, AI SDK v6 (ai, @ai-sdk/react), Vercel AI Gateway (OIDC), Pinecone, Supabase (Postgres + Auth + RLS), Upstash Redis, Resend, TypeScript

**Spec:** docs/superpowers/specs/2026-03-18-ai-chatbot-widget-design.md

---

## File Structure

### New Files (Create)

**Database and Types:**
- supabase/migrations/20260318000000_chatbot_tables.sql -- SQL migration for all chatbot tables + RLS policies + increment_and_check_cap function
- src/lib/supabase/chatbot-types.ts -- TypeScript types for chatbot tables

**Chatbot Core Library:**
- src/lib/chatbot/tier-defaults.ts -- Tier constants (model, page limit, cap, lead mode)
- src/lib/chatbot/config.ts -- Load/cache chatbot config by slug
- src/lib/chatbot/rag.ts -- Pinecone RAG query (embed user message, search namespace/index, return top 5 chunks)
- src/lib/chatbot/rate-limit.ts -- Upstash Redis session rate limiter + Postgres monthly cap check
- src/lib/chatbot/prompt-builder.ts -- Build system prompt from config + RAG context + lead capture instructions
- src/lib/chatbot/lead-capture.ts -- Lead storage, email notification to client, analytics increment
- src/lib/chatbot/webhooks.ts -- Pro tier webhook delivery with retry logic
- src/lib/chatbot/demo.ts -- Demo provisioning (scrape, index, create config) and expiry cleanup

**API Routes:**
- src/app/api/chat/[slug]/route.ts -- Streaming chat endpoint (POST)
- src/app/api/chat/[slug]/leads/route.ts -- Lead capture endpoint (POST)
- src/app/api/admin/chatbot/configs/route.ts -- List/create configs (GET/POST)
- src/app/api/admin/chatbot/configs/[id]/route.ts -- Update/deactivate config (PATCH/DELETE)
- src/app/api/admin/chatbot/analytics/[id]/route.ts -- Get analytics (GET)
- src/app/api/admin/chatbot/demo/route.ts -- Spin up demo (POST)
- src/app/api/cron/chatbot-analytics/route.ts -- Nightly analytics aggregation
- src/app/api/cron/chatbot-demo-expiry/route.ts -- Daily demo expiry check
- src/app/api/cron/chatbot-monthly-reset/route.ts -- Monthly cap reset (1st of month)

**Widget:**
- src/app/chat/[slug]/widget/layout.tsx -- Minimal layout for widget (no nav/footer)
- src/app/chat/[slug]/widget/page.tsx -- Widget page (renders inside iframe)
- src/components/chatbot/chat-widget.tsx -- Chat UI client component (useChat, message list, input, typing indicator)
- src/components/chatbot/lead-capture-form.tsx -- Lead capture form component (overlay for Essentials, inline for Growth/Pro)
- public/chat/embed.js -- Standalone embed script (creates floating button + iframe, uses safe DOM methods)

**Dashboard Pages:**
- src/app/dashboard/admin/chatbot/page.tsx -- Admin chatbot overview (all configs, aggregate stats)
- src/app/dashboard/admin/chatbot/[id]/page.tsx -- Per-client chatbot detail (analytics, conversations, leads)
- src/app/dashboard/admin/chatbot/new/page.tsx -- Create new chatbot config form

**API Documentation:**
- src/app/docs/chatbot-api/layout.tsx -- Docs layout (minimal, sidebar nav)
- src/app/docs/chatbot-api/page.mdx -- Getting started + embed reference
- src/app/docs/chatbot-api/rest-api/page.mdx -- REST API reference
- src/app/docs/chatbot-api/webhooks/page.mdx -- Events and webhooks (Pro tier)
- src/app/docs/chatbot-api/theming/page.mdx -- Theming guide

**Product Page Integration:**
- src/app/services/ai-chatbot/demo-widget.tsx -- Client component for generic demo on product page

### Modified Files

- vercel.json -- Scoped headers for /chat/:path* (CSP, remove X-Frame-Options from global rule) + cron jobs
- next.config.ts -- Add headers() function to apply X-Frame-Options: DENY to non-widget routes
- src/middleware.ts -- Exclude /chat/ and /api/chat/ from auth middleware
- src/lib/supabase/types.ts -- Import and re-export chatbot types
- src/lib/modules.ts -- Add chatbot module to dashboard module map
- src/components/dashboard/sidebar.tsx -- Add chatbot admin menu item
- src/app/services/ai-chatbot/page.tsx -- Add live demo widget to the product page
- package.json -- Add dependencies: ai, @ai-sdk/react, @pinecone-database/pinecone, @upstash/redis

---

## Phase 1: Foundation (Database + Dependencies + Config)

### Task 1: Install Dependencies

**Files:**
- Modify: package.json

- [ ] **Step 1: Install AI SDK, Pinecone, and Upstash Redis**

Run in engineering/projects/ophidian-ai:
npm install ai @ai-sdk/react @pinecone-database/pinecone @upstash/redis

- [ ] **Step 2: Verify installation**

Run: npm ls ai @ai-sdk/react @pinecone-database/pinecone @upstash/redis
Expected: All packages listed, no errors

- [ ] **Step 3: Pull OIDC env vars from Vercel**

Run: vercel link and vercel env pull
Verify .env.local contains VERCEL_OIDC_TOKEN or gateway credentials.
Also add UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, PINECONE_API_KEY if not present.

- [ ] **Step 4: Commit**

git add package.json package-lock.json
git commit -m "chore: add AI SDK, Pinecone, and Upstash Redis dependencies"

---

### Task 2: Database Migration -- Chatbot Tables

**Files:**
- Create: supabase/migrations/20260318000000_chatbot_tables.sql

- [ ] **Step 0: Initialize Supabase CLI in the project (if not already done)**

Run: supabase init (creates supabase/ directory)
Run: supabase link --project-ref {ref} (link to existing Supabase project)

- [ ] **Step 1: Write the migration SQL**

Create all 6 tables: chatbot_configs, chatbot_conversations, chatbot_messages, chatbot_leads, chatbot_analytics, chatbot_webhook_failures.

chatbot_webhook_failures schema: id (uuid PK), config_id (uuid FK to chatbot_configs), event_type (text), payload (jsonb), attempts (int default 0), last_error (text nullable), created_at (timestamptz).

Include: chatbot_tier enum, indexes, increment_and_check_cap() function, reset_monthly_conversation_counts() function, increment_daily_leads() function, updated_at triggers, RLS policies (admin full access, client read own, anon insert for widget visitors).
Add unique constraint on chatbot_conversations(config_id, session_id) for upsert support.
See spec data model section for full schema.

- [ ] **Step 2: Run migration against Supabase**

Run: supabase db push (or run SQL directly via Supabase Dashboard SQL Editor).
Verify: All 6 tables created, RLS policies active, functions exist.

- [ ] **Step 3: Commit**

git add supabase/migrations/20260318000000_chatbot_tables.sql
git commit -m "feat: add chatbot database tables, RLS policies, and cap enforcement function"

---

### Task 3: TypeScript Types for Chatbot

**Files:**
- Create: src/lib/supabase/chatbot-types.ts
- Modify: src/lib/supabase/types.ts

- [ ] **Step 1: Create chatbot types**

Export types: ChatbotTier, LeadCaptureMode, ChatbotConfig, ChatbotConversation, ChatbotMessage, ChatbotLead, ChatbotAnalytics, ChatbotWebhookFailure.
Match the database schema exactly. See spec data model section.

- [ ] **Step 2: Re-export from main types file**

Add to bottom of src/lib/supabase/types.ts:
export type { ChatbotTier, LeadCaptureMode, ChatbotConfig, ... } from "./chatbot-types";

- [ ] **Step 3: Commit**

git add src/lib/supabase/chatbot-types.ts src/lib/supabase/types.ts
git commit -m "feat: add TypeScript types for chatbot tables"

---

### Task 4: Tier Defaults Constants

**Files:**
- Create: src/lib/chatbot/tier-defaults.ts

- [ ] **Step 1: Create tier defaults**

Export TIER_DEFAULTS record keyed by ChatbotTier with: model, leadCaptureMode, pageLimit, knowledgeSourceType, monthlyConversationCap, customFields, removeBranding, directApiAccess, webhooks.

Tier values:
- essentials: google/gemini-2.5-flash, message_count, 50 pages, namespace, 500/mo cap
- growth: anthropic/claude-haiku-4.5, intent, 200 pages, namespace, 2000/mo cap
- pro: anthropic/claude-sonnet-4.5, intent, unlimited, index, unlimited cap

Export constants: SESSION_RATE_LIMIT (30 msgs / 300s), MAX_MESSAGE_LENGTH (2000), MAX_CONVERSATION_MESSAGES (50), RAG_TOP_K (5), MODEL_TEMPERATURE (0.3).

- [ ] **Step 2: Commit**

git add src/lib/chatbot/tier-defaults.ts
git commit -m "feat: add chatbot tier defaults and constants"

---

## Phase 2: Core Chat Pipeline (Config + RAG + Streaming)

### Task 5: Config Loader with Caching

**Files:**
- Create: src/lib/chatbot/config.ts

- [ ] **Step 1: Create config loader**

loadConfig(slug): Check Upstash Redis cache first (key: chatbot:config:{slug}, TTL 5min). On miss: query chatbot_configs by slug where active=true from Supabase, check demo expiry, cache in Redis, return ChatbotConfig or null. Uses the same Redis instance as rate limiting.
invalidateConfigCache(slug): Delete Redis key chatbot:config:{slug}.

Note: In-memory Map caches do not work reliably on Vercel serverless (cold starts clear them). Use Upstash Redis for consistent caching across instances.

- [ ] **Step 2: Commit**

git add src/lib/chatbot/config.ts
git commit -m "feat: add chatbot config loader with in-memory cache"

---

### Task 6: RAG Pipeline (Pinecone Query)

**Files:**
- Create: src/lib/chatbot/rag.ts

- [ ] **Step 1: Create RAG query function**

queryKnowledgeBase(userMessage, config): Initialize Pinecone client (singleton). Determine index name and namespace from config.knowledge_source. Use searchRecords with topK=5. Return array of RagChunk { text, score, source }.

- [ ] **Step 2: Commit**

git add src/lib/chatbot/rag.ts
git commit -m "feat: add Pinecone RAG query for chatbot knowledge base"

---

### Task 7: Rate Limiting (Redis + Postgres)

**Files:**
- Create: src/lib/chatbot/rate-limit.ts

- [ ] **Step 1: Create rate limiter**

checkSessionRateLimit(sessionId): Upstash Redis INCR on key rl:session:{sessionId} with 5min TTL. Return { allowed, message }.
checkMonthlyCap(config): Call Postgres RPC increment_and_check_cap. Return { allowed, message } with fallback contact info if cap exceeded.

- [ ] **Step 2: Commit**

git add src/lib/chatbot/rate-limit.ts
git commit -m "feat: add session and monthly rate limiting for chatbot"

---

### Task 8: Prompt Builder

**Files:**
- Create: src/lib/chatbot/prompt-builder.ts

- [ ] **Step 1: Create prompt builder**

buildSystemPrompt(config, ragChunks): Concatenate:
1. config.system_prompt (base)
2. Guardrails (role boundaries, instruction-following restrictions, stay on topic)
3. RAG context (delimited with markers, source attribution)
4. Intent-based lead capture instructions (if mode=intent): instruct AI to naturally request contact info when pricing/booking intent detected, include [LEAD_CAPTURE_SIGNAL] marker at end when successful
5. Fallback contact info (phone, email, address from config)

- [ ] **Step 2: Commit**

git add src/lib/chatbot/prompt-builder.ts
git commit -m "feat: add system prompt builder with RAG context and lead capture instructions"

---

### Task 9: Lead Capture Service

**Files:**
- Create: src/lib/chatbot/lead-capture.ts

- [ ] **Step 1: Create lead capture service**

captureLead(config, data): Insert into chatbot_leads. Update chatbot_conversations.lead_captured=true. Call increment_daily_leads RPC (upsert chatbot_analytics). Send notification email to client via Resend API (from notifications@ophidianai.com, HTML email with lead details and dashboard link).

- [ ] **Step 2: Commit**

git add src/lib/chatbot/lead-capture.ts
git commit -m "feat: add lead capture service with email notification"

---

### Task 10: Chat API Route (Streaming)

**Files:**
- Create: src/app/api/chat/[slug]/route.ts

- [ ] **Step 1: Create the streaming chat endpoint**

POST handler flow:
1. Load config by slug (404 if not found)
2. Parse and validate body (messages array + sessionId required)
3. Sanitize user messages (strip HTML tags via regex)
4. Validate message length (2000 char max) and conversation length (50 msg max)
5. Check session rate limit via Redis (429 if exceeded)
6. Check monthly cap on first message only via Postgres RPC (429 if exceeded)
7. Query Pinecone RAG with latest user message
8. Build system prompt from config + RAG chunks + lead capture instructions
9. Stream response via AI SDK streamText with model string from config, temperature 0.3
10. onFinish callback: upsert conversation record, append user and assistant messages to chatbot_messages
11. Return result.toUIMessageStreamResponse()

Also implement:
- CORS handling: Check Origin header against config.allowed_origins. Return Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Max-Age: 86400. Export OPTIONS handler for preflight requests.
- API key auth (Growth/Pro direct API access): If request has Authorization: Bearer header, hash the token and compare against config.api_key_hash. If no Bearer header and request is NOT from the widget iframe origin, return 401.

Follow existing API route pattern from src/app/api/admin/clients/route.ts for the admin auth pattern.

- [ ] **Step 2: Commit**

git add src/app/api/chat/[slug]/route.ts
git commit -m "feat: add streaming chat API endpoint with RAG and rate limiting"

---

### Task 11: Lead Capture API Route

**Files:**
- Create: src/app/api/chat/[slug]/leads/route.ts

- [ ] **Step 1: Create lead capture endpoint**

POST handler: Load config by slug (404 if not found). Validate body (conversationId required, at least one of name/email/phone required). Call captureLead service. Return { success: true }.

- [ ] **Step 2: Commit**

git add src/app/api/chat/[slug]/leads/route.ts
git commit -m "feat: add lead capture API endpoint"

---

### Task 12: Update Middleware and Headers

**Files:**
- Modify: src/middleware.ts
- Modify: vercel.json

- [ ] **Step 1: Exclude chat routes from auth middleware**

Update middleware matcher regex to exclude: api/chat/, chat/, and .js file extensions.
Current matcher: /((?!_next/static|_next/image|favicon.ico|api/meta/|...
Add: api/chat/|chat/ to the exclusion list, add js to file extension list.

- [ ] **Step 2: Update vercel.json with scoped headers**

Vercel header config does NOT support regex negative lookaheads. Strategy: Remove X-Frame-Options from the global /(.*) rule entirely. Add it back via next.config.ts headers() function with a has/missing matcher that excludes /chat/ routes. Add a /chat/:path* rule with widget-specific CSP (script-src self, img-src self + vercel-storage + ophidianai.com, connect-src self, style-src self unsafe-inline, frame-ancestors *).

Implementation:
1. In vercel.json: remove X-Frame-Options from the global /(.*) headers array. Add /chat/:path* rule with CSP headers. Keep /images/* cache rule.
2. In next.config.ts: add headers() async function that returns X-Frame-Options: DENY for all routes NOT matching /chat/. This is where the exclusion logic lives (Next.js headers support regex source patterns).

Note: frame-ancestors * is the baseline. Per-client origin restriction happens at the application layer via CORS validation in the API route.

- [ ] **Step 3: Commit**

git add src/middleware.ts vercel.json
git commit -m "feat: scope X-Frame-Options and CSP headers for chatbot widget iframe"

---

## Phase 3: Widget UI

### Task 13: Widget Layout and Page

**Files:**
- Create: src/app/chat/[slug]/widget/layout.tsx
- Create: src/app/chat/[slug]/widget/page.tsx

- [ ] **Step 1: Create minimal widget layout**

Standalone HTML layout with no nav/footer. Set metadata robots: noindex nofollow. Body: margin 0, padding 0, overflow hidden.

- [ ] **Step 2: Create widget page**

Server component: load config by slug via loadConfig (notFound if missing). Render ChatWidget client component passing: slug, greeting, theme, leadCapture, tier, showBranding (tier !== pro).

- [ ] **Step 3: Commit**

git add src/app/chat/[slug]/widget/
git commit -m "feat: add widget page and minimal layout for iframe rendering"

---

### Task 14: Chat Widget Client Component

**Files:**
- Create: src/components/chatbot/chat-widget.tsx

- [ ] **Step 1: Create the chat widget component**

"use client" component using useChat from @ai-sdk/react with DefaultChatTransport from ai.

Features:
- Generate sessionId with crypto.randomUUID (useState initializer)
- Configure useChat with transport pointing to /api/chat/{slug} with sessionId in body
- Initial greeting message in initialMessages
- Auto-scroll to bottom on new messages (useRef + useEffect)
- Message-count lead capture trigger: after N user messages, show overlay form. Max 2 dismiss attempts.
- Intent-based lead capture detection: scan last assistant message for [LEAD_CAPTURE_SIGNAL], show inline form
- Strip [LEAD_CAPTURE_SIGNAL] from displayed message text
- Styled message bubbles: user messages in primaryColor with white text, assistant in #f0f0f0
- Typing indicator when status is streaming/submitted and last message is from user
- Error display for failed requests
- Input form with text input and send button
- Powered by OphidianAI footer (hidden on Pro tier)

Use inline styles (not Tailwind) since this renders in an isolated iframe.

PostMessage API: On message list changes and form open/close, send window.parent.postMessage({ type: "ophidian-resize", height: document.body.scrollHeight }, "*") so embed.js can resize the iframe container dynamically.

- [ ] **Step 2: Commit**

git add src/components/chatbot/chat-widget.tsx
git commit -m "feat: add chat widget client component with useChat and streaming"

---

### Task 15: Lead Capture Form Component

**Files:**
- Create: src/components/chatbot/lead-capture-form.tsx

- [ ] **Step 1: Create the lead capture form**

"use client" component with two presentation modes:
- message_count mode: Full-screen overlay with semi-transparent backdrop, centered form card, "No thanks" dismiss button
- intent mode: Inline form section below chat messages, non-blocking, no dismiss button needed

Configurable fields based on leadCapture.fields array (name, email, phone). Each field is an input with appropriate type. Submit button styled with primaryColor. Uses inline styles.

- [ ] **Step 2: Commit**

git add src/components/chatbot/lead-capture-form.tsx
git commit -m "feat: add lead capture form component (overlay and inline modes)"

---

### Task 16: Embed Script

**Files:**
- Create: public/chat/embed.js

- [ ] **Step 1: Create the embed script**

Self-executing IIFE, zero dependencies, target ~5KB.

Features:
- Read data-client (required), data-position (default bottom-right), data-color (default #39ff14) from script tag
- Inject CSS styles via createElement("style") for button, container, iframe, and mobile media query
- Create floating circular chat button with chat icon SVG (use document.createElementNS for SVG, NOT textContent with markup)
- On click: toggle iframe container visibility, swap between chat and close SVG icons using DOM replacement (removeChild + appendChild, NOT element.textContent with markup)
- Create container div with iframe pointing to {host}/chat/{slug}/widget
- Lazy load iframe (loading=lazy attribute)
- Mobile: full-screen container at breakpoint 768px via CSS media query
- Expose window.OphidianChat API: open(), close(), destroy()
- Initialize on DOMContentLoaded or immediately if document already loaded

SECURITY: All icon rendering must use document.createElementNS + setAttribute for SVG elements. No innerHTML, no textContent with markup, no string-based DOM construction.

PostMessage listener: Listen for "ophidian-resize" messages from the iframe. On receive, adjust iframe container height dynamically. Validate message origin before acting.

- [ ] **Step 2: Commit**

git add public/chat/embed.js
git commit -m "feat: add embeddable chat widget script (embed.js)"

---

## Phase 4: Admin Dashboard

### Task 17: Admin Chatbot Config CRUD API

**Files:**
- Create: src/app/api/admin/chatbot/configs/route.ts
- Create: src/app/api/admin/chatbot/configs/[id]/route.ts

- [ ] **Step 1: Create list/create endpoint**

GET: requireAdmin helper (check auth + profile.role=admin), list all configs with client company_name join, order by created_at desc.
POST: requireAdmin, validate slug + system_prompt required, validate theme.logoUrl against allowed hosts (ophidianai.com, www.ophidianai.com, *.vercel-storage.com), apply TIER_DEFAULTS for the selected tier, insert config, return 201.

Follow existing pattern from src/app/api/content-engine/batches/route.ts.

- [ ] **Step 2: Create update/deactivate endpoint**

PATCH: requireAdmin, validate logoUrl if present in body, update config fields, invalidateConfigCache for the slug.
DELETE: requireAdmin, soft delete (set active=false), invalidateConfigCache.

- [ ] **Step 3: Commit**

git add src/app/api/admin/chatbot/
git commit -m "feat: add admin chatbot config CRUD API endpoints"

---

### Task 18: Admin Chatbot Analytics API

**Files:**
- Create: src/app/api/admin/chatbot/analytics/[id]/route.ts

- [ ] **Step 1: Create analytics endpoint**

GET: requireAdmin, accept ?days=30 query param for date range. Return JSON with:
- analytics: daily rows from chatbot_analytics for the config within date range
- leads: last 50 leads from chatbot_leads for the config
- conversations: last 20 conversations from chatbot_conversations for the config

- [ ] **Step 2: Commit**

git add src/app/api/admin/chatbot/analytics/
git commit -m "feat: add admin chatbot analytics API endpoint"

---

### Task 19: Admin Dashboard Pages

**Files:**
- Create: src/app/dashboard/admin/chatbot/page.tsx
- Modify: src/components/dashboard/sidebar.tsx
- Modify: src/lib/modules.ts

- [ ] **Step 1: Add chatbot to dashboard module map**

Add to src/lib/modules.ts:
chatbot: { label: "AI Chatbot", path: "/dashboard/admin/chatbot", adminOnly: true }

- [ ] **Step 2: Add chatbot menu item to admin sidebar**

Add "AI Chatbot" with MessageSquare icon (from lucide-react) to admin section of sidebar.tsx.

- [ ] **Step 3: Create admin chatbot overview page**

Server component: requireAdmin redirect pattern, fetch all configs with client join. Render table with columns: Client, Slug, Tier, Conversations (this month), Status (Active/Demo/Inactive), View link. "New Config" button linking to /dashboard/admin/chatbot/new.

- [ ] **Step 4: Commit**

git add src/app/dashboard/admin/chatbot/ src/components/dashboard/sidebar.tsx src/lib/modules.ts
git commit -m "feat: add admin chatbot dashboard overview page"

---

### Task 19b: Admin Chatbot Config Form and Detail Pages

**Files:**

- Create: src/app/dashboard/admin/chatbot/new/page.tsx
- Create: src/app/dashboard/admin/chatbot/[id]/page.tsx

- [ ] **Step 1: Create new config form page**

Server component with client form. Fields: slug, client (dropdown from clients table), tier (select), system_prompt (textarea), greeting, allowed_origins (comma-separated text), fallback_contact (phone, email, address), theme primaryColor (color picker or hex input). On submit: POST to /api/admin/chatbot/configs. Redirect to overview on success. Include "Generate API Key" button for Growth/Pro tiers that generates a random key, displays it once, and stores the hash via the API.

- [ ] **Step 2: Create per-client detail page**

Server component: fetch config by id, fetch analytics (last 30 days), fetch recent leads and conversations. Display: config summary card, analytics chart (conversations over time using Recharts), leads table, conversation list with click-to-expand transcript viewer. Link to edit config (reuses form from /new with pre-populated values).

- [ ] **Step 3: Commit**

git add src/app/dashboard/admin/chatbot/new/ src/app/dashboard/admin/chatbot/[id]/
git commit -m "feat: add admin chatbot config form and detail pages"

---

## Phase 5: Generic Demo + Product Page Integration

### Task 20: Add Live Demo to Product Page

**Files:**
- Create: src/app/services/ai-chatbot/demo-widget.tsx
- Modify: src/app/services/ai-chatbot/page.tsx

- [ ] **Step 1: Create demo widget client component**

"use client" component. On mount: dynamically create script element with src=/chat/embed.js, data-client=ophidianai-demo, data-color=#39ff14, append to body. On unmount: call window.OphidianChat.destroy() and remove script.

- [ ] **Step 2: Add demo widget to product page**

Import DemoWidget. Add a "Try it now" section near the bottom of the page with heading and description. Render DemoWidget component.

- [ ] **Step 3: Create ophidianai-demo config in Supabase**

Manual step. Insert chatbot_configs row via SQL:
slug=ophidianai-demo, tier=pro, system_prompt about OphidianAI services/pricing/capabilities, greeting introducing OphidianAI assistant, knowledge_source pointing to ophidianai-kb namespace, theme with #39ff14 primaryColor.

- [ ] **Step 4: Index OphidianAI content into Pinecone**

Use existing knowledge-base skill to index ophidianai.com website content into the ophidianai-kb namespace. This gives the demo real answers.

- [ ] **Step 5: Commit**

git add src/app/services/ai-chatbot/demo-widget.tsx src/app/services/ai-chatbot/page.tsx
git commit -m "feat: add live AI chatbot demo to product page"

---

## Phase 6: API Documentation

### Task 21: Create API Documentation Pages

**Files:**
- Create: src/app/docs/chatbot-api/layout.tsx
- Create: src/app/docs/chatbot-api/page.mdx
- Create: src/app/docs/chatbot-api/rest-api/page.mdx
- Create: src/app/docs/chatbot-api/theming/page.mdx

- [ ] **Step 1: Create docs layout**

Minimal layout with left sidebar nav (Getting Started, REST API, Events/Webhooks, Theming). Max-width 1200px centered container.

- [ ] **Step 2: Create Getting Started page (MDX)**

Quick start with embed script tag example. data-* attributes table (data-client required, data-position optional, data-color optional). JavaScript API reference (OphidianChat.open/close/destroy/on). CSP requirements note for client sites.

- [ ] **Step 3: Create REST API reference page (MDX)**

Authentication section (Bearer API key header). Endpoints:
- POST /api/chat/[slug] -- request format (messages + sessionId), SSE streaming response, cURL example, JavaScript fetch example
- POST /api/chat/[slug]/leads -- request format, response
Rate limits table by tier. Error responses (400, 401, 404, 429, 500).

- [ ] **Step 4: Create Events and Webhooks page (MDX)**

Events: lead.captured, conversation.completed. Webhook configuration (Pro tier). Payload format examples. HMAC-SHA256 signature verification. Retry policy (3 attempts, exponential backoff). OphidianChat.on(event, callback) JavaScript API for client-side events (open, close, lead_captured).

- [ ] **Step 5: Create Theming guide (MDX)**

Config-driven theming (primaryColor, logoUrl, position from admin dashboard). Script tag overrides (data-color, data-position take precedence). Light/dark mode behavior.

- [ ] **Step 6: Commit**

git add src/app/docs/
git commit -m "feat: add API documentation pages for chatbot widget"

---

## Phase 7: Webhooks + Cron Jobs

### Task 22: Pro Tier Webhook Delivery

**Files:**
- Create: src/lib/chatbot/webhooks.ts

- [ ] **Step 1: Create webhook delivery service**

deliverWebhook(config, payload): Placeholder for Pro tier webhooks.
signPayload(body, secret): HMAC-SHA256 signature using client API key.
attemptDelivery(url, body, signature, attempt): Fetch with 10s timeout, return boolean.
logFailure(configId, eventType, payload, attempts, lastError): Insert into chatbot_webhook_failures.

Retry logic: 3 attempts with exponential backoff delays [5s, 30s, 5min].
Note: Full webhook URL configuration deferred until GoHighLevel account is set up (Apr 1). Service is ready to go, just needs a webhook_url field added to config.

- [ ] **Step 2: Commit**

git add src/lib/chatbot/webhooks.ts
git commit -m "feat: add webhook delivery service skeleton for Pro tier"

---

### Task 23: Add Cron Jobs

**Files:**
- Modify: vercel.json
- Create: src/app/api/cron/chatbot-analytics/route.ts
- Create: src/app/api/cron/chatbot-demo-expiry/route.ts
- Create: src/app/api/cron/chatbot-monthly-reset/route.ts

- [ ] **Step 1: Create analytics aggregation cron**

GET handler: Verify CRON_SECRET via Authorization Bearer header. For each active config: count yesterday conversations, count messages, compute avg messages/conversation, upsert into chatbot_analytics. Runs daily at 2am ET.

- [ ] **Step 2: Create demo expiry cron**

GET handler: Verify CRON_SECRET. Deactivate configs where is_demo=true AND demo_expires_at is past. Query configs expiring within 3 days for notification. Runs daily at 6am ET.

- [ ] **Step 3: Create monthly reset cron**

GET handler: Verify CRON_SECRET. Call reset_monthly_conversation_counts RPC. Runs 1st of each month at midnight.

- [ ] **Step 4: Add cron schedules to vercel.json**

Add top-level "crons" array:
- /api/cron/chatbot-analytics: "0 2 * * *"
- /api/cron/chatbot-demo-expiry: "0 6 * * *"
- /api/cron/chatbot-monthly-reset: "0 0 1 * *"

- [ ] **Step 5: Add CRON_SECRET to Vercel env**

Run: vercel env add CRON_SECRET (generate secure random string for value).

- [ ] **Step 6: Commit**

git add src/app/api/cron/ vercel.json
git commit -m "feat: add cron jobs for analytics aggregation, demo expiry, and monthly cap reset"

---

## Phase 8: Demo Provisioning

### Task 24: Demo Provisioning Service

**Files:**
- Create: src/lib/chatbot/demo.ts
- Create: src/app/api/admin/chatbot/demo/route.ts

- [ ] **Step 1: Create demo provisioning service**

provisionDemo(req): Accept businessName, slug, websiteUrl, scrapedContent, primaryColor, systemPrompt. Index scraped content into Pinecone namespace demo-{slug} via upsertRecords. Auto-generate system prompt if not provided. Create chatbot_configs entry with is_demo=true, demo_expires_at=NOW+30 days, lead_capture disabled. Return { config, demoUrl, embedCode, expiresAt }.

convertDemoToProduction(configId, tier, clientId): Get current config. Copy vectors from demo-{slug} to chatbot-{slug} namespace (or dedicated index for Pro). For Pro tier: create dedicated Pinecone index first, wait for ready. Update config: is_demo=false, assign tier/client/knowledge_source. Clean up old namespace.

- [ ] **Step 2: Create demo API endpoint**

POST: requireAdmin, validate businessName/slug/websiteUrl required, call provisionDemo, return 201 with result.

- [ ] **Step 3: Commit**

git add src/lib/chatbot/demo.ts src/app/api/admin/chatbot/demo/
git commit -m "feat: add demo provisioning service and API endpoint"

---

## Phase 9: Integration + Deploy

### Task 25: Final Integration + Smoke Test

- [ ] **Step 1: Run npm run build**

Run in engineering/projects/ophidian-ai. Fix any TypeScript or build errors.

- [ ] **Step 2: Run local dev server and test**

Run npm run dev. Test manually:
1. Visit /services/ai-chatbot -- verify demo widget floating button appears
2. Visit /chat/ophidianai-demo/widget -- verify widget page renders in isolation
3. Send a test message -- verify streaming response works
4. Check /dashboard/admin/chatbot -- verify admin page loads with config list
5. Check /docs/chatbot-api -- verify docs render with sidebar nav

- [ ] **Step 3: Deploy to Vercel (preview)**

Run: vercel deploy
Test all above on preview URL.

- [ ] **Step 4: Promote to production**

Run: vercel --prod

- [ ] **Step 5: Commit submodule update in Iris repo**

In ophidian-ai submodule: git add -A, git commit, git push.
In Iris repo root: git add engineering/projects/ophidian-ai, git commit -m "feat: update ophidian-ai submodule with AI chatbot widget".

---

## Post-Launch Tasks (Future)

These are deferred and not part of the initial implementation:

- [ ] Client-facing analytics dashboard (Phase 2)
- [ ] GoHighLevel CRM webhook integration (pending account setup Apr 1)
- [ ] Embedding-based question clustering for top_questions analytics
- [ ] Per-client frame-ancestors CSP (currently wildcard, tighten per config)
- [ ] Multi-channel support (Facebook Messenger, Instagram DM)
- [ ] Brand voice tuning for Growth/Pro tiers
- [ ] Conversation export for clients
