# AI Chatbot Widget -- Design Spec

**Date:** 2026-03-18
**Status:** Draft
**Author:** Iris + Eric

---

## Overview

Embeddable AI chatbot widget that OphidianAI sells as a product to small business clients. Combines Claude/Gemini LLM reasoning with Pinecone RAG (client-specific knowledge base) to answer customer questions, capture leads, and drive conversions. Deployed as an iframe widget via a single script tag. Tiered pricing with configurable models, knowledge base sizes, and lead capture modes.

### Key Decisions

- **Hosting:** Hybrid -- API routes on ophidianai.com, widget JS served as standalone embed script. Clients can use the widget OR hit the API directly.
- **Isolation:** iframe (industry standard). Guaranteed style/JS isolation across any client site.
- **Knowledge base:** Shared Pinecone index with namespaces for Essentials/Growth. Dedicated index for Pro.
- **Model tiers:** Configurable per client (D). Essentials: Gemini 2.5 Flash. Growth: Claude Haiku 4.5. Pro: Claude Sonnet 4.5.
- **Lead capture:** Tiered (D). Message-count for Essentials. Intent-based for Growth/Pro.
- **Demo lifecycle:** Generic demo on product page -> outreach link -> branded demo on interest -> production handoff on close. Demo becomes the final product.

---

## Architecture

```
Client Website
  |-- <script src="https://ophidianai.com/chat/embed.js" data-client="slug">
        |-- Creates iframe -> ophidianai.com/chat/[slug]/widget
              |-- React chat UI (runs inside iframe)
                    |-- POST /api/chat/[slug]
                          |-- Load client config (Supabase)
                          |-- Query Pinecone (client namespace or dedicated index)
                          |-- Build prompt (system prompt + RAG context + conversation)
                          |-- Stream response (AI SDK -> model per tier config)
                          |-- Lead capture check (message-count or intent-based per tier)
                                |-- POST /api/chat/[slug]/leads -> Supabase
```

### Components

- **embed.js** -- Standalone JS file (~5KB). Creates floating button + iframe. Accepts `data-client` slug and optional theme overrides via `data-color` and `data-position` attributes. Served from ophidianai.com as a static asset.
- **Widget page** -- `/chat/[slug]/widget` Next.js page rendered inside the iframe. Full chat UI with streaming, lead capture form, and branding.
- **Chat API** -- `/api/chat/[slug]` route handler. Loads config, queries RAG, streams response. Stateless per request.
- **Lead API** -- `/api/chat/[slug]/leads` route handler. Stores captured lead info in Supabase, sends notification email to client.
- **Config store** -- Supabase table `chatbot_configs` keyed by client slug. Stores system prompt, tier, model, theme, lead capture settings, Pinecone namespace/index.
- **Knowledge store** -- Pinecone. Shared index with namespaces for Essentials/Growth. Dedicated index for Pro.

---

## Data Model

### New Supabase Tables

#### chatbot_configs

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| client_id | uuid, FK -> clients | |
| slug | text, unique | URL identifier |
| tier | enum: essentials, growth, pro | |
| model | text | e.g. "google/gemini-2.5-flash", "anthropic/claude-haiku-4.5" |
| system_prompt | text | |
| greeting | text | Initial message shown in widget |
| knowledge_source | jsonb | `{ type: "namespace" | "index", name: "chatbot-slug" }` |
| theme | jsonb | `{ primaryColor, position, logoUrl }` -- logoUrl must be Vercel Blob or ophidianai.com origin |
| allowed_origins | text[] | CORS whitelist for widget and API requests |
| conversation_count_month | int, default 0 | Atomic counter for monthly cap enforcement (reset by cron on 1st) |
| lead_capture | jsonb | `{ enabled, mode: "message_count" | "intent", trigger_after: 3, fields: [...] }` |
| fallback_contact | jsonb | `{ phone, email, address }` |
| page_limit | int | Enforced during indexing |
| api_key_hash | text, nullable | Hashed API key for direct REST access |
| is_demo | boolean, default false | |
| demo_expires_at | timestamptz, nullable | |
| active | boolean, default true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### chatbot_conversations

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> chatbot_configs | |
| session_id | text | Browser session identifier |
| message_count | int, default 0 | Denormalized count for cap enforcement |
| page_url | text | Which page the visitor was on |
| visitor_token | text, nullable | First-party localStorage token for cross-session tracking (consent-based, not fingerprinting) |
| lead_captured | boolean, default false | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### chatbot_messages

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| conversation_id | uuid, FK -> chatbot_conversations | |
| role | text | "user", "assistant", "system" |
| content | text | Message content |
| metadata | jsonb, nullable | Lead capture signals, intent flags |
| created_at | timestamptz | |

Append-only table. One row per message instead of rewriting a growing jsonb array on every turn. Index on `(conversation_id, created_at)` for ordered retrieval.

#### chatbot_leads

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> chatbot_configs | |
| conversation_id | uuid, FK -> chatbot_conversations | |
| name | text, nullable | |
| email | text, nullable | |
| phone | text, nullable | |
| custom_fields | jsonb, nullable | |
| source_page | text | URL where lead was captured |
| created_at | timestamptz | |

#### chatbot_analytics

| Column | Type | Notes |
|--------|------|-------|
| id | uuid, PK | |
| config_id | uuid, FK -> chatbot_configs | |
| date | date | |
| conversations_count | int | |
| messages_count | int | |
| leads_captured | int | |
| avg_messages_per_conversation | float | |
| top_questions | jsonb | Aggregated popular topics |
| created_at | timestamptz | |

### Tier Defaults

| Field | Essentials | Growth | Pro |
|-------|-----------|--------|-----|
| model | gemini-2.5-flash | claude-haiku-4.5 | claude-sonnet-4.5 |
| lead_capture.mode | message_count | intent | intent |
| page_limit | 50 | 200 | unlimited (null) |
| knowledge_source.type | namespace | namespace | index |
| monthly_conversation_cap | 500 | 2,000 | unlimited |

---

## API Design

### Chat Endpoint

`POST /api/chat/[slug]`

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "What are your hours?" }],
  "sessionId": "browser-generated-uuid"
}
```

**Response:** SSE stream (AI SDK `toUIMessageStreamResponse`)

**Flow per request:**
1. Load `chatbot_configs` by slug (cache in Runtime Cache, 5min TTL)
2. Validate: config exists, is active, not expired demo
3. Session rate limit: check Upstash Redis sliding window (`rl:session:[sessionId]`, 30 msgs / 5 min)
4. Monthly cap enforcement: atomic increment via Postgres function -- `SELECT increment_and_check_cap(config_id, tier_limit)` returns boolean. If cap exceeded, return 429 with user-facing message and fallback contact.
5. Query Pinecone: embed latest user message, search client's namespace/index, top 5 chunks
6. Build system prompt: config system prompt + RAG context + lead capture instructions (if intent-based)
7. Stream response via AI SDK `streamText` with model from config
8. After stream completes: append message to `chatbot_messages`, update `chatbot_conversations.message_count`
9. If lead capture triggered: return a `lead_capture_request` part in the stream

### Lead Capture Endpoint

`POST /api/chat/[slug]/leads`

**Request:**
```json
{
  "conversationId": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-1234"
}
```

**Response:** `{ "success": true }`

**Flow:**
1. Insert into `chatbot_leads`
2. Update `chatbot_conversations.lead_captured = true`
3. Send notification email to client (Resend)
4. Increment `chatbot_analytics.leads_captured` for today

### Admin Endpoints (Auth-Protected)

- `GET /api/admin/chatbot/configs` -- List all client chatbot configs
- `POST /api/admin/chatbot/configs` -- Create new config (provisions Pinecone namespace/index). Validates `theme.logoUrl` against allowed origins (Vercel Blob, ophidianai.com).
- `PATCH /api/admin/chatbot/configs/[id]` -- Update config. Same logo URL validation on write.
- `DELETE /api/admin/chatbot/configs/[id]` -- Deactivate config + schedule namespace cleanup
- `GET /api/admin/chatbot/analytics/[id]` -- Get analytics for a config
- `POST /api/admin/chatbot/demo` -- Spin up demo (scrape site, index, create temp config)

---

## Widget Architecture

### embed.js (~5KB, static asset)

- Self-executing script, zero dependencies
- Reads `data-client` slug from the script tag
- Creates floating chat button (fixed position, configurable via `data-position`)
- On click: creates iframe pointed at `ophidianai.com/chat/[slug]/widget`
- Handles iframe resize messages (expand/collapse/mobile fullscreen)
- Exposes `window.OphidianChat.open()` / `.close()` / `.destroy()` for client JS control

### Widget Page (`/chat/[slug]/widget`)

- Standalone Next.js page rendered inside iframe
- Loads config on mount (theme, greeting, branding)
- Chat UI: message list, input field, send button, typing indicator
- Streams responses via AI SDK `useChat`
- Lead capture form: slides in as overlay when triggered
- "Powered by OphidianAI" footer link (removable on Pro tier)
- PostMessage API to communicate with parent frame (resize, state changes)

### Theming

- Client brand colors from config (`theme.primaryColor`)
- Light/dark mode auto-detection from parent page (or override in config)
- Logo display from `theme.logoUrl`
- Font: system font stack (no external font loads inside iframe)

### Mobile Behavior

- Below 768px: iframe expands to full screen on open
- Touch-friendly input, larger tap targets
- Virtual keyboard handling (scroll to input on focus)

---

## Lead Capture System

### Message-Count Mode (Essentials)

- After N messages (default 3, configurable in `lead_capture.trigger_after`), inject form overlay
- Form blocks further conversation until submitted or dismissed
- If dismissed: re-triggers after N more messages (max 2 attempts, then stops)
- Fields configurable per client: name (required), email (required), phone (optional)

### Intent-Based Mode (Growth + Pro)

- AI detects intent signals: pricing questions, booking requests, scheduling, contact requests
- When intent detected: AI naturally works the ask into its response
- Inline capture: form fields appear below the AI's message, not as a blocking overlay
- If visitor provides info in chat text: AI extracts it and confirms
- Fallback: if no intent detected after 8 messages, falls back to message-count trigger

### On Capture

1. POST to `/api/chat/[slug]/leads`
2. Store in `chatbot_leads` table
3. Send real-time email notification to client via Resend
4. Pro tier: webhook to GoHighLevel (when available) for CRM + email sequence
5. Growth + Pro: custom fields supported

### Analytics Tracked

- Capture rate (leads / total conversations)
- Average messages before capture
- Most common intent triggers
- Form dismiss rate (message-count mode)

---

## Demo Lifecycle

### Stage 1 -- Generic Demo (Passive)

- Live widget on `ophidianai.com/services/ai-chatbot` page
- Uses OphidianAI's own knowledge base
- Visitors can try it immediately
- "See what this looks like for your business" CTA

### Stage 2 -- Outreach Link (Cold Email)

- Same generic demo, linked in outreach emails
- UTM params for attribution tracking
- "Try our AI chatbot -- imagine this on your site"

### Stage 3 -- Branded Demo (Interest Signal)

Triggered when prospect replies or engages:

1. Scrape prospect's site via Firecrawl (pages, FAQs, services, hours, contact)
2. Index content into Pinecone namespace `demo-[slug]`
3. Create `chatbot_configs` entry: `is_demo: true`, `demo_expires_at: NOW + 30 days`
4. Auto-generate system prompt from scraped content
5. Apply prospect's brand colors (extracted from site or defaulted)
6. Deploy at `ophidianai.com/chat/[slug]/widget`
7. Share demo URL with prospect
8. Demo page includes "This is a preview -- [Get Started]" banner

### Stage 4 -- Production Handoff (Close)

Prospect converts to paying client. Migration sequence (order matters):

1. Assign tier (Essentials/Growth/Pro)
2. Copy all vectors from `demo-[slug]` namespace to `chatbot-[slug]` namespace (or dedicated index for Pro)
3. Verify vector count matches between source and destination
4. Update config: `is_demo = false`, `demo_expires_at = null`, `knowledge_source.name = chatbot-[slug]`
5. Delete `demo-[slug]` namespace
6. Remove preview banner
7. Provide embed script tag for their site

Config is not updated until the copy is verified -- ensures zero downtime. The demo namespace serves requests until step 4 completes. No rebuild, no data loss -- the demo becomes the product.

### Expiry

- Cron job runs daily, checks `demo_expires_at`
- Expired demos: set `active = false`, schedule Pinecone namespace deletion after 7-day grace
- Notification to Eric 3 days before expiry

---

## Analytics Dashboard

### Per-Client View

- Conversations today / this week / this month (trend arrows)
- Messages count and avg messages per conversation
- Leads captured (count + capture rate %)
- Top 5 most-asked questions (clustered from conversation data)
- Lead list with name, email, phone, source page, timestamp
- Conversation browser: click to read full transcript

### Aggregate View (Eric's Overview)

- All clients at a glance: table with client name, tier, conversations this month, leads, status
- Total conversations across all clients
- Total leads captured
- Revenue attribution: conversations x tier pricing
- Demo pipeline: active demos, days until expiry, conversion rate

### Aggregation

- Cron job runs nightly
- Aggregates from `chatbot_conversations` and `chatbot_leads` into `chatbot_analytics`
- Top questions: simple keyword/phrase frequency analysis on user messages (v1). Embedding-based clustering deferred to Phase 2 when volume justifies the cost.
- Retention: tracks returning visitors via `visitor_token` (first-party localStorage token, set with consent banner in widget)

### Client-Facing Analytics (Phase 2)

- Separate authenticated view for clients
- Scoped to their config only
- Exportable as CSV

---

## API Documentation

**Location:** `ophidianai.com/docs/chatbot-api` (MDX pages in Next.js app)

### Sections

1. **Getting Started** -- What the chatbot is, how embedding works, quick start with the script tag
2. **Embed Script Reference** -- All `data-*` attributes, JavaScript API (`window.OphidianChat.open()`, `.close()`, `.destroy()`, `.on(event, callback)`)
3. **REST API Reference** -- For clients who want direct API access:
   - `POST /api/chat/[slug]` -- Send messages, receive streaming responses
   - `POST /api/chat/[slug]/leads` -- Submit lead capture data
   - Authentication: API key per client (Bearer header)
   - Rate limits by tier
   - Request/response examples (cURL + JavaScript)
4. **Events & Webhooks** -- Webhook URL config for lead capture events (Pro tier), payload format, retry policy
5. **Theming** -- Colors, position, logo, light/dark mode customization
6. **FAQ / Troubleshooting** -- CSP headers for iframe, common integration issues

### Access

- Public (no auth) for embed docs and general reference
- API key section visible only to authenticated clients via dashboard
- Interactive "Try it" section that hits the generic demo endpoint

---

## Security & Rate Limiting

### HTTP Headers & iframe Security

The existing `vercel.json` sets `X-Frame-Options: DENY` globally. This must be scoped to exclude widget routes:

- **All non-widget routes:** Keep `X-Frame-Options: DENY` (existing behavior)
- **`/chat/[slug]/widget`:** Remove `X-Frame-Options`, replace with `Content-Security-Policy: frame-ancestors 'self' [allowed_origins from config]`. This allows only the client's domain and ophidianai.com to embed the iframe.
- **Widget page CSP:** Tight policy on the widget page itself:
  - `script-src 'self'` -- no inline scripts, no external scripts
  - `img-src 'self' https://*.vercel-storage.com https://ophidianai.com` -- logo URLs restricted to Vercel Blob and ophidianai.com
  - `connect-src 'self'` -- API calls only to ophidianai.com
  - `style-src 'self' 'unsafe-inline'` -- inline styles needed for dynamic theming

Implementation: Scoped header rules in `vercel.json` with `/chat/:path*` pattern override.

### Authentication

- **Widget requests:** No auth token in browser. Validated by slug + allowed origin (`allowed_origins` in config, enforced via CORS + `frame-ancestors` CSP).
- **Direct API access:** Bearer token (API key generated per client, stored hashed in `chatbot_configs`).
- **Admin endpoints:** Supabase auth (existing dashboard flow).

### Rate Limiting

- **Per-session:** Max 30 messages per 5-minute window (Upstash Redis sliding window counter, key: `rl:session:[sessionId]`, TTL: 5min)
  - Message: "You're sending messages too quickly. Please wait a moment before trying again."
- **Per-config monthly caps:** Atomic Postgres counter (`conversation_count_month` on `chatbot_configs`, incremented via `SELECT increment_and_check_cap()` function). Cron resets all counters on the 1st of each month.
  - Essentials: 500 conversations/month
  - Growth: 2,000 conversations/month
  - Pro: Unlimited
  - Message: "This business's chat has reached its monthly message limit. Please contact them directly at [fallback phone/email]."

### Input Sanitization

- Strip HTML/script tags from user messages before passing to LLM
- Max message length: 2,000 characters
- Max conversation length: 50 messages (then prompt to start new conversation)

### Prompt Injection Defense

- System prompt guardrails: role boundaries, instruction-following restrictions
- RAG context clearly delimited to prevent injection via indexed content
- Model temperature: 0.3 (reduce hallucination and off-topic responses)

### CORS

- Widget iframe: same origin (ophidianai.com), no CORS issues for UI
- API endpoints: CORS whitelist per client config (their domain + ophidianai.com)
- Preflight caching: `Access-Control-Max-Age: 86400`

### Webhooks (Pro Tier)

- **Events:** `lead.captured`, `conversation.completed`
- **Delivery:** POST to client-configured webhook URL with JSON payload
- **Retry policy:** 3 attempts with exponential backoff (5s, 30s, 5min)
- **Timeout:** 10s per attempt
- **On total failure:** Log to `chatbot_webhook_failures` table, surface in admin dashboard. No dead-letter queue (overkill at current scale).
- **Signature:** HMAC-SHA256 of payload body using client's API key, sent in `X-OphidianAI-Signature` header

### Data Privacy

- RLS in Supabase (each client only accesses their own data)
- Lead data encrypted at rest (Supabase default)
- Conversation retention: 90 days default, configurable per client
- Visitor tracking uses first-party `visitor_token` stored in localStorage (set only after consent banner acceptance in widget). Not browser fingerprinting.
- GDPR: delete endpoint for removing visitor conversation data on request. Also clears `visitor_token` association.

---

## Tier Summary

| Feature | Essentials ($149/mo) | Growth ($297/mo) | Pro ($497/mo) |
|---------|---------------------|-------------------|---------------|
| Website chat widget | Yes | Yes | Yes |
| Direct API access | No | Yes | Yes |
| Model | Gemini 2.5 Flash | Claude Haiku 4.5 | Claude Sonnet 4.5 |
| Knowledge base | Shared index, 50 pages | Shared index, 200 pages | Dedicated index, unlimited |
| Lead capture | Message-count | Intent-based | Intent-based + CRM webhook |
| Monthly conversations | 500 | 2,000 | Unlimited |
| Custom fields | No | Yes | Yes |
| "Powered by" branding | Yes (visible) | Yes (visible) | Removable |
| Client analytics | No | No | Phase 2 |
| Webhooks | No | No | Yes |
| API documentation | Embed only | Full REST API | Full REST API |

---

### Embed Script Attributes

| Attribute | Required | Description |
| --- | --- | --- |
| `data-client` | Yes | Client slug (matches `chatbot_configs.slug`) |
| `data-position` | No | Widget position: `bottom-right` (default), `bottom-left` |
| `data-color` | No | Override primary color (hex, e.g. `#39ff14`). Takes precedence over config `theme.primaryColor`. |

Config-driven theming (from `chatbot_configs.theme`) is the default. `data-color` and `data-position` attributes on the script tag override the config values, allowing clients to customize without admin changes.

---

## Dependencies

- **AI SDK** (`ai`, `@ai-sdk/react`) -- Streaming chat, `useChat`, `streamText`
- **Vercel AI Gateway** -- Model routing via `"provider/model"` strings (e.g. `"google/gemini-2.5-flash"`, `"anthropic/claude-haiku-4.5"`). Uses OIDC auth via `vercel env pull`. No direct provider SDK keys needed. Env: `VERCEL_OIDC_TOKEN` (auto-provisioned).
- **Upstash Redis** -- Session rate limiting (sliding window counters). Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- **Pinecone** (`@pinecone-database/pinecone`) -- RAG knowledge base
- **Supabase** (existing) -- Config storage, conversations, messages, leads, analytics, auth
- **Resend** (existing) -- Lead notification emails to clients
- **Firecrawl** (existing) -- Site scraping for demo provisioning
- **Next.js 16** (existing) -- App router, API routes, MDX for docs
