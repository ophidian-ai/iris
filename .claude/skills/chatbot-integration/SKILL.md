---
name: chatbot-integration
description: Add an AI chatbot or voice agent to a client website with CRM automation. Use when Eric says "add a chatbot", "integrate ElevenLabs", "add AI agent to the site", "connect to GoHighLevel", "add a contact form with automation", "set up lead capture", or when building a client website that would benefit from conversational AI. Also use when discussing upsell services or recurring revenue add-ons for client sites.
---

# AI Chatbot & Lead Capture Integration

Add conversational AI agents and automated lead capture to client websites. This skill covers the full pipeline: chatbot creation, website embedding, CRM webhook connection, and follow-up automation.

## When to Use

- Building a new client website (offer as premium add-on)
- Client requests AI chat, contact automation, or lead capture
- Upselling existing clients on AI integration services
- Adding form-to-CRM automation to any website

## Service Tiers

| Tier | What's Included | Suggested Price |
|------|----------------|-----------------|
| Basic | Contact form + GoHighLevel webhook + 3-email sequence | $200 one-time |
| Standard | ElevenLabs text chatbot + CRM + 5-email sequence | $500 one-time + $50/mo |
| Premium | ElevenLabs voice agent + CRM + SMS + full automation | $1,000 one-time + $100/mo |

## Integration Options

### Option A: ElevenLabs AI Agent (Recommended)

Best for: businesses that want conversational lead capture, appointment booking, or customer support.

#### Setup Steps

1. **Create agent** at elevenlabs.io
   - Select industry vertical and goal (lead capture, support, booking)
   - Choose voice (if voice agent) or text-only mode
   - Configure personality and tone to match client brand

2. **Add knowledge base**
   - Upload client's service descriptions, pricing, FAQ, policies
   - Add business hours, location, contact info
   - Include any scripts or common Q&A

3. **Set up agent tools**
   - Transfer to human agent (phone number or email)
   - Capture email/name (required fields)
   - Book calls (if calendar integration available)
   - Custom actions based on client needs

4. **Get embed code**
   - Copy the HTML widget snippet from ElevenLabs dashboard
   - Widget is a small floating button (bottom-right by default)

5. **Embed in website**
   - For Astro sites: add snippet to `BaseLayout.astro` before closing body tag
   - For Next.js: add to `layout.tsx` or a client component
   - Ensure HTTPS (required for voice features)
   - Test on both desktop and mobile

6. **Connect to CRM** (see Option C below)

### Option B: Simple Contact Form + Webhook

Best for: businesses that want lead capture without conversational AI.

#### Questionnaire Design Rules

- 4-5 questions maximum (more = lower completion rate)
- Always capture: name, email, phone (optional)
- Add 1-2 industry-specific qualifying questions
- Top-to-bottom layout (not side-by-side on mobile)
- White or light background for form visibility
- Clear submit button with action-oriented text ("Get Your Free Quote")

#### Form Implementation

Build a standard HTML form with method POST pointing to the webhook URL. Use JavaScript fetch() to submit as JSON. On success, replace the form content with a thank-you message using safe DOM manipulation (textContent or createElement, not innerHTML). On error, fall back to prompting the user to call directly.

### Option C: GoHighLevel CRM Automation

Connects any lead source (chatbot, form, or both) to automated follow-up sequences.

#### Setup Steps

1. **Create webhook** in GoHighLevel
   - Go to Automations > Create Workflow
   - Add trigger: "Inbound Webhook"
   - Copy the webhook URL

2. **Map fields** from form/chatbot to CRM contact fields
   - Name, email, phone (standard)
   - Custom fields for qualifying data (service interest, budget, timeline)

3. **Build email sequence** (minimum 5 emails recommended)
   - Email 1 (immediate): Confirmation + value delivery
   - Email 2 (day 1): Introduction to services
   - Email 3 (day 3): Case study or testimonial
   - Email 4 (day 5): Specific offer or promotion
   - Email 5 (day 7): Final follow-up + direct CTA

4. **Optional: Enable SMS/WhatsApp**
   - SMS confirmation on form submit
   - WhatsApp follow-up for higher engagement markets

5. **Test the full pipeline**
   - Submit test lead through website
   - Verify contact created in GoHighLevel
   - Confirm email sequence triggered
   - Check SMS delivery (if enabled)

## Implementation Checklist

- [ ] Determine integration tier (Basic/Standard/Premium)
- [ ] Set up ElevenLabs agent OR contact form
- [ ] Create GoHighLevel webhook
- [ ] Map form/chatbot fields to CRM
- [ ] Build 5+ email follow-up sequence
- [ ] Embed widget/form in website
- [ ] Test full pipeline (submit > CRM > email)
- [ ] Verify mobile responsiveness
- [ ] Confirm HTTPS for voice features
- [ ] Document webhook URL and credentials for client handoff

## Pricing Justification

When proposing this as an add-on:
- "Every visitor who leaves without contacting you is lost revenue"
- "AI chatbot captures leads 24/7, even outside business hours"
- "Automated follow-up converts 3-5x more leads than manual outreach"
- "Most competitors don't have this -- it's a significant differentiator"

## Dependencies

- ElevenLabs account (for chatbot/voice agent)
- GoHighLevel account (for CRM automation)
- Client website must use HTTPS
- Client must provide: service descriptions, FAQ, business hours, branding preferences
