---
name: cold-email-outreach
description: Draft cold outreach emails for OphidianAI prospects. Invoke when Eric says "write a cold email", "draft outreach", "email this prospect", or when a scored prospect is ready for first contact. Generates plain text emails using the Hormozi-inspired value-first framework, stages them as Gmail drafts, and indexes to Pinecone.
---

# Cold Email Outreach

Draft cold outreach emails for OphidianAI prospects using a value-first framework inspired by Alex Hormozi's email marketing principles.

## Background

The old template system (W1-W4, S1-S4, H1-H4, A1-A4) produced 0 replies across 23 sends. Every template opened with criticism ("your site is broken", "you're losing customers"). The new system leads with value, not criticism.

## When to Use

- A prospect has been researched and scored, and it's time for first contact.
- Eric says "write a cold email", "draft outreach", "reach out to this business", or similar.
- Processing a batch of leads through the outreach pipeline.

## Inputs

Provide as much as available. Not all fields are required.

- **Business name** (required)
- **Contact first name** (required -- use "Hi there" only as last resort)
- **Contact email** (required for staging)
- **Industry/niche** (required -- drives first-line selection)
- **City** (required -- for JSON metadata)
- **Current website** (if they have one)
- **Pain points or opportunities noticed** (drives the 3 ideas or sharp observation)
- **How Eric found them** (for personalization)

## Critical Rule: Plain Text Only

**Cold emails MUST be plain text.** No HTML, no images, no logos, no branded templates.

Why:

- Google and spam filters treat HTML-heavy emails as marketing/promotional
- Base64-embedded images are a major spam signal
- Branded templates with colors, gradients, and logos scream "mass email"
- Plain text emails look like a real person typed a message
- Plain text emails have the highest inbox placement rate for cold outreach

Save branded HTML for **deliverables** (proposals, reports, mockups) -- never for first-touch cold emails.

## Email Structure (Hormozi Principles)

Every first-touch email follows these rules:

1. **First line = preview text reward.** An industry stat or insight that rewards the open. NOT about their problems.
2. **Never open with criticism.** No "your site is broken" or "you're losing customers."
3. **Lead with value.** Give them something useful before asking for anything.
4. **One concept per email.** Don't pitch websites, SEO, and AI in the same email.
5. **Plain text only.** No HTML, no images, no links in first-touch.
6. **PS in every first-touch.** A quick win they can act on today without hiring anyone.
7. **Sign-off:** "Eric Lefler" + "OphidianAI" on separate lines. No phone, no links, no tagline.

## Templates

Two templates only. The old W/S/H/A system is retired for first-touch emails (preserved below as follow-up material).

### CI1 -- 3 Creative Ideas (DEFAULT)

**Usage:** 67% of prospects. Use when you have enough research to offer 3 specific, actionable ideas.

**Word limit:** Under 160 words.

**Subject line:** `some ideas for [business name]` (lowercase, no punctuation)

**Skeleton:**

```
Subject: some ideas for [business name]

Hi [first name],

[Industry stat or insight -- 1 sentence, rewards the open].

I had some ideas about how [business name] could [specific outcome].

1. [Specific idea tied to their business -- problem they have + what to do about it]
2. [Different angle -- something they probably haven't considered]
3. [Third idea -- different use case or quick win]

Let me know if any of these resonate.

Eric Lefler
OphidianAI

P.S. [Quick win they can do today without hiring anyone -- demonstrates expertise and generosity]
```

**Example (auto services):**

```
Subject: some ideas for paswater automotive

Hi Mike,

73% of car owners search online before choosing a repair shop.

I had some ideas about how Paswater Automotive could turn more of those searches into calls.

1. Your Google Business Profile is missing service categories for your specialties -- adding them takes 5 minutes and puts you in front of people searching for exactly what you do.
2. A simple online appointment request form so customers can reach out at 11pm when their car breaks down instead of waiting until morning.
3. A "why choose us" section on your homepage with your years in business and review highlights -- builds trust before they ever call.

Let me know if any of these resonate.

Eric Lefler
OphidianAI

P.S. You can update your Google Business Profile categories yourself at business.google.com -- add every service you offer. Most shops only list 2-3 when Google allows 10.
```

**Example (salon/spa):**

```
Subject: some ideas for wild root salon

Hi Sarah,

60% of new salon clients find their stylist through Google, not word of mouth.

I had some ideas about how Wild Root could show up for more of those searches.

1. Your site doesn't mention the specific services you're known for -- adding dedicated pages for each service helps Google match you to what people are searching.
2. A before-and-after gallery with your best transformations. This is the number one thing new clients look at before booking.
3. An online booking link right on your homepage so people can schedule at 10pm instead of calling during business hours.

Let me know if any of these resonate.

Eric Lefler
OphidianAI

P.S. If you add 5-10 before-and-after photos to your Google Business Profile this week, you'll likely see more profile views within days. Google loves visual content.
```

### ALT -- One Sharp Insight (A/B TEST)

**Usage:** 33% of prospects. Use when you have one strong observation that's specific enough they know you looked.

**Word limit:** Under 80 words.

**Subject line:** `[business name]'s [specific observation]` (lowercase)

**Skeleton:**

```
Subject: [business name]'s [specific thing]

Hi [first name],

[Sharp observation about their business -- specific enough they know you looked]. [Why this matters in outcome language -- customers lost, money left on table, opportunity missed].

I put together a few ideas for how [business name] could [specific outcome]. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

P.S. [Different angle from the body -- bonus insight or quick win]
```

**Example (restaurant):**

```
Subject: las chalupas' google listing

Hi Maria,

Your Google listing says you close at 9pm but your website says 10pm. When those don't match, Google sometimes hides your business from "open now" searches -- which is when most people are looking for dinner.

I put together a few ideas for how Las Chalupas could get more evening traffic from Google. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

P.S. You can fix the hours mismatch yourself at business.google.com in about 2 minutes.
```

**Example (fitness):**

```
Subject: joco fitness's class schedule

Hi there,

I tried to find your class schedule on the JoCo Fitness website and couldn't -- had to check Facebook instead. Most people won't make that extra step. They'll just sign up at the gym that makes it easy.

I put together a few ideas for how JoCo Fitness could convert more website visitors into members. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

P.S. Even pinning your schedule post on Facebook would help -- right now it's buried under older posts.
```

## Industry-Specific First Lines (CI1 Only)

Use these as the opening line of CI1 emails. Pick the one matching the prospect's industry.

| Industry | First Line |
|---|---|
| Restaurant | 85% of restaurant customers check the menu online before deciding where to eat. |
| Auto services | 73% of car owners search online before choosing a repair shop. |
| Salon/spa | 60% of new salon clients find their stylist through Google, not word of mouth. |
| Fitness | January gym sign-ups that start online convert 2x better than walk-ins. |
| Retail | Local shops with a Google Business Profile get 70% more foot traffic than those without. |
| Health/wellness | 68% of people looking for wellness services check online reviews before booking. |
| Church/nonprofit | Churches with a basic website see 40% more first-time visitors than those without. |
| Home services | 82% of homeowners search online before calling a plumber, electrician, or contractor. |
| Pet services | Pet owners spend an average of 15 minutes researching groomers online before calling. |
| Professional services | 71% of people looking for professional services start with a Google search. |

If the prospect's industry isn't listed, find a relevant stat. The stat must be specific and plausible -- no vague claims.

## Template Rotation

### How It Works

1. Before drafting, read `sales/lead-generation/template-rotation.md`.
2. Determine which template to use:
   - **CI1** for ~67% of prospects in a batch (default).
   - **ALT** for ~33% of prospects in a batch (A/B test challenger).
3. Pick the least-recently-used template between CI1 and ALT.
4. Never send the same template to two prospects in the same batch.
5. After sending, update the rotation tracker with date, count, and prospect name.
6. Include `"template": "CI1"` or `"template": "ALT"` in the JSON output.

### A/B Testing Protocol

- Run both templates until 30 total sends are reached (20 CI1 + 10 ALT, approximately).
- After 30 sends, compare reply rates.
- Promote the winner as the new default.
- Create a new challenger template to test against the winner.
- Never stop testing. Always have a default and a challenger.

## Language Rules

- **Outcome language, not technical language.** Write at a 7th-grade reading level.
  - "SEO optimization" -> "show up when people search"
  - "mobile-responsive design" -> "look great on phones"
  - "page load speed" -> "loads fast"
  - "conversion rate" -> "turn visitors into customers"
  - "Google Business Profile" -> "show up on Google Maps" (or spell it out if referencing the tool directly)
- No jargon. No buzzwords. No filler.
- No emojis.
- Sound like a real person, not a template.
- Tailor every email to the specific business -- mention something only they would recognize.
- Tone: Professional, direct, helpful. Not pushy.
- **No links in the first email.** Links in cold emails are a spam trigger.
- **No images or attachments.** Plain text only.

## Spam Avoidance Checklist

Before finalizing any cold email, verify:

- [ ] Plain text only (no HTML tags, no images, no logos)
- [ ] No links or URLs in the body
- [ ] No attachments
- [ ] Subject line is lowercase, under 50 characters, no special characters or spam words
- [ ] CI1 is under 160 words / ALT is under 80 words
- [ ] At least one specific detail about their business (not just their name)
- [ ] Sign-off is just "Eric Lefler" + "OphidianAI" -- no phone, no links, no tagline
- [ ] No spam trigger phrases ("free consultation", "limited offer", "act now", "I guarantee")
- [ ] Reads like a message from a person, not a template
- [ ] Opens with value/insight, NOT criticism
- [ ] Has a P.S. with a quick win they can do without hiring anyone

## Output Format

Generate a **plain text** email. No HTML.

Save the email content to:
```
sales/lead-generation/prospects/[slug]/outreach/cold-email.txt
```

Save the send-ready JSON to:
```
sales/lead-generation/prospects/[slug]/outreach/cold-email.json
```

### JSON Schema

```json
{
  "to": "prospect@example.com",
  "subject": "some ideas for business name",
  "body": "Full plain text email body here",
  "prospect": "business-name",
  "template": "CI1",
  "scheduledDate": "2026-03-19",
  "niche": "restaurant",
  "city": "Greensburg, IN"
}
```

Field notes:

- `body` (not `html`) ensures plain text sending.
- `template` is either `"CI1"` or `"ALT"`.
- `scheduledDate` is always a Wednesday (see Send Timing below).
- `niche` and `city` are for tracking and analytics.

## Staging

Cold emails are **staged as Gmail drafts**, not sent immediately. Eric reviews them in his Drafts folder and sends when ready.

### Step 1: Stage the Email

After writing the JSON file, stage it as a Gmail draft:

```bash
cat sales/lead-generation/prospects/[slug]/outreach/cold-email.json | node .claude/skills/gws-cli/scripts/stage_email.js
```

This creates a draft in Eric's Gmail and adds it to the staging manifest at `sales/lead-generation/staged-emails.json`.

### Step 2: Repeat for All Prospects

When processing a batch, stage all emails in one session. Each `stage_email.js` call adds to the manifest.

### Step 3: Review Staged Emails

To see what's queued:

```bash
node .claude/skills/gws-cli/scripts/send_staged.js --list
```

### Step 4: Send All Staged Emails

When Eric says "send all staged emails" or "send the batch":

```bash
node .claude/skills/gws-cli/scripts/send_staged.js
```

Sends each draft with 5-minute spacing between sends (configurable with `--spacing <seconds>`). Failed sends stay in the manifest for retry.

To preview without sending:

```bash
node .claude/skills/gws-cli/scripts/send_staged.js --dry-run
```

## Send Timing

- **First-touch emails:** Schedule for **Wednesday 10:00 AM - 12:00 PM ET**.
- Set `scheduledDate` in the JSON to the next Wednesday.
- **Spacing:** Wait at least 5 minutes between individual sends.
- **Daily limit:** Stay under 20/day when starting out, ramp to max 50/day over weeks.
- **Avoid:** Monday mornings, Friday afternoons, weekends.

## Post-Send Updates

After sending, update tracking via the outreach-sheets module:

```bash
node operations/automation/scripts/outreach-sheets.js
```

**Never hardcode column letters.** The outreach-sheets module handles column mapping dynamically.

Also update:

- **Template rotation tracker** (`sales/lead-generation/template-rotation.md`) -- date, count, prospect.
- **Prospect tracker** (`sales/lead-generation/prospect-tracker.md`) -- set status to "Outreach Sent", write outreach date.

## Direct Send (Override)

If Eric wants to skip staging and send immediately:

```bash
cat sales/lead-generation/prospects/[slug]/outreach/cold-email.json | node .claude/skills/gws-cli/scripts/build_raw_email.js | gws gmail users messages send --params '{"userId":"me"}' --json @-
```

Only use direct send when Eric explicitly asks for it.

## Conversion Flow

```
Cold Email (plain text, value-first) -> Reply -> Deliver offer (can be branded HTML/PDF) -> 15-min call -> Discovery/Proposal
```

- Cold email gives them something useful and offers more.
- They reply to engage.
- Deliver within 24 hours -- deliverables CAN be branded.
- In the delivery email, suggest a quick call.
- The call is where the project gets discussed and pitched.

## Follow-Up Strategy: Two-Touch Maximum

- **1st follow-up:** +49% reply boost (always send this).
- **2nd follow-up:** Marginal benefit -- only if the angle is completely different.
- **3rd+ follow-ups:** Actively hurt response rate and deliverability.

**The rule:** Initial email + one follow-up bump. If no response after that, recycle the prospect into a different campaign with a different angle. Never send 3+ emails to the same prospect on the same thread.

See `follow-up-email` skill for follow-up drafting.

## Deliverability

Before sending cold outreach, verify:

- [ ] Email warmup has been running 14+ days
- [ ] Inbox placement rate is 95%+
- [ ] DNS records (SPF, DKIM, DMARC) are verified
- [ ] Daily cold email volume stays under limits
- [ ] Warmup is still running alongside cold sends

## Domain Strategy

**Ideal setup** (when budget allows):

- Cold outreach from a secondary domain (e.g., `getophidian.com`)
- Replies and client communication from `ophidianai.com`

**Current setup** (using primary domain):

- Keep volume very low (under 20/day)
- Monitor inbox placement closely
- If placement drops below 90%, stop cold sends immediately

## Legacy Templates Reference

The old W1-W4, S1-S4, H1-H4, and A1-A4 templates are **retired for first-touch emails**. They are preserved here as follow-up material and angle inspiration. Do NOT use these for cold outreach.

**Follow-up angles from the old system:**

- **Website angles (W):** Site turning people away, losing customers on mobile, business deserves better, customers can't find basics.
- **SEO angles (S):** Invisible in search, competitors getting their calls, customers searching but can't find them, great reputation but invisible.
- **Hybrid angles (H):** Losing customers two ways, competitors look better and rank higher, great business but invisible, demand exists but blocked.
- **AI angles (A):** Answering same questions repeatedly, competitors staying in touch, missing after-hours customers, reviews could work harder.

These angles can be repurposed for:

- Follow-up emails (after first-touch gets no reply)
- Offer delivery emails (after they reply "yes")
- Discovery call prep notes
- Second-campaign retargeting with a completely different angle

## Knowledge Base Indexing

After drafting and saving the cold email, index it to Pinecone:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  records: [{
    "_id": "outreach/<prospect-slug>/cold-email",
    "text": "<email content>",
    "source_file": "sales/lead-generation/prospects/<slug>/outreach/cold-email.txt",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<niche>", "<template>", "cold-email"]
  }]
```

If indexing fails, log the error and continue. Don't block the pipeline on a failed index.
