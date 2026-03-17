# AI Chatbot Product Template

Reusable scaffold for deploying AI chatbot widgets to client websites.

## Architecture

```
Client Website
  └── Embedded chat widget (iframe or script tag)
        └── Next.js API route (hosted on Vercel)
              ├── Claude API (conversation + reasoning)
              └── Pinecone RAG (client-specific knowledge base)
```

## Per-Client Setup

### 1. Knowledge Base (Pinecone)

Create a namespace in the `ophidianai-kb` index for the client:

- Namespace: `client-<slug>`
- Content to index:
  - Website pages (scrape via Firecrawl)
  - Service descriptions and pricing
  - FAQ / common questions
  - Business hours, location, contact info
  - Policies (cancellation, refund, etc.)

### 2. Chatbot Configuration

Create a config file per client:

```json
{
  "client": "business-name",
  "namespace": "client-business-name",
  "systemPrompt": "You are a helpful assistant for [Business Name], a [industry] business in [city]. Answer questions about services, hours, pricing, and booking. Be friendly and professional. If you don't know something, say so and suggest they call [phone] or visit [address].",
  "greeting": "Hi! How can I help you today?",
  "theme": {
    "primaryColor": "#000000",
    "position": "bottom-right"
  },
  "leadCapture": {
    "enabled": true,
    "fields": ["name", "email", "phone"],
    "trigger": "after-3-messages"
  },
  "fallback": {
    "phone": "555-555-5555",
    "email": "contact@business.com"
  }
}
```

### 3. API Route

Deploy a Next.js API route on the OphidianAI Vercel project (or client's project):

- `POST /api/chat/[client-slug]`
- Accepts: `{ messages: [...], sessionId: string }`
- Returns: streaming text response
- Flow: query Pinecone for context -> build prompt with context -> stream Claude response

### 4. Widget Embed

Provide client with a single script tag:

```html
<script src="https://ophidianai.com/chat/widget.js" data-client="business-name"></script>
```

Widget features:
- Floating chat button (bottom-right)
- Expandable chat window
- Mobile-responsive
- Lead capture form (name/email after N messages)
- Powered by OphidianAI branding

### 5. Lead Capture Integration

When lead capture fires:
- Store in Supabase (OphidianAI dashboard)
- Webhook to GoHighLevel (when available) for email sequence
- Email notification to client

## Tier Differences

| Feature | Essentials ($149/mo) | Growth ($297/mo tier) | Pro ($497/mo tier) |
|---------|---------------------|----------------------|-------------------|
| Website chat | Yes | Yes | Yes |
| Knowledge base size | 50 pages | 200 pages | Unlimited |
| Lead capture | Basic (name/email) | + phone, custom fields | + CRM integration |
| Channels | Website only | + 1 channel (FB/IG) | Multi-channel |
| Monthly conversations | 500 | 2,000 | Unlimited |
| Response customization | Template | Brand voice tuning | Full custom |

## Demo Mode

For prospect demos (offer-delivery skill):
- Scrape their website with Firecrawl
- Index into temporary Pinecone namespace
- Deploy with generic OphidianAI branding
- Share a demo URL they can try immediately
- Namespace auto-expires after 30 days if not converted

## Build Status

- [ ] Widget component (React)
- [ ] API route with Claude + Pinecone RAG
- [ ] Per-client config system
- [ ] Lead capture + storage
- [ ] Demo mode for prospects
- [ ] Multi-channel support (Phase 2)

## Dependencies

- Claude API key (Anthropic)
- Pinecone index (`ophidianai-kb`)
- Vercel deployment
- Supabase (lead storage)
- GoHighLevel (email sequences, when available)
