---
name: cold-email-outreach
description: Draft cold outreach emails to potential clients for OphidianAI. Use when Eric says "write a cold email", "reach out to this prospect", "draft outreach", "email this business", or when a prospect has been scored and it's time to make first contact. Generates plain text emails with niche-specific offers and sends via GWS CLI.
---

# Cold Email Outreach

Draft cold outreach emails to potential clients for OphidianAI.

## When to Use

When Eric wants to reach out to a potential client -- typically a small business that could benefit from a new or updated website, AI tools, or AI integrations.

## Inputs

Provide as much as you have. Not all fields are required.

- **Business name**
- **Contact name** (if known)
- **Their current website** (if they have one)
- **Industry/niche** (auto, health/wellness, food, general service)
- **What they need** (e.g., website redesign, new website, AI integration)
- **How Eric found them** (e.g., local search, referral, research)
- **Any specific pain points or opportunities noticed**

## Critical Rule: Plain Text Only

**Cold emails MUST be plain text.** No HTML, no images, no logos, no branded templates.

Why:
- Google and spam filters treat HTML-heavy emails as marketing/promotional
- Base64-embedded images are a major spam signal
- Branded templates with colors, gradients, and logos scream "mass email"
- Plain text emails look like a real person sat down and typed a message
- Plain text emails have the highest inbox placement rate for cold outreach

Save branded HTML for **deliverables** (proposals, reports, mockups) -- never for first-touch cold emails.

## Email Structure

Every cold email follows this structure:

1. **Subject line** -- Outcome-focused, under 50 characters. No jargon. No "SEO" or "web design." Lowercase style (not Title Case). No special characters, brackets, or punctuation tricks.
2. **Opening** -- One sentence about what you noticed about their business. Be specific enough that they know it's not a template. Use outcome language, not technical language.
3. **Offer** -- 1-2 sentences offering something tangible and niche-specific they can "touch and feel." Not a full assessment or audit. Something small, free, and useful.
4. **CTA** -- Low-friction reply ask. "Want me to send it over?" or "Reply yes and I'll get it to you." Never ask for a call on the first email.
5. **Sign-off** -- Eric Lefler, OphidianAI. No phone number, no website link, no social links. Keep it minimal.

## Subject Line Rules

Subject lines make or break deliverability. Follow these strictly:

- Under 50 characters
- Lowercase style (e.g., "getting more repair calls from Google" not "Getting More Repair Calls From Google")
- No ALL CAPS words
- No special characters: no brackets [], no pipes |, no exclamation marks !
- No spam trigger words: free, guarantee, limited time, act now, don't miss, exclusive, urgent
- No question marks (these test well in marketing but hurt cold email deliverability)
- Reference their business name or something specific to them when possible
- Should sound like something a colleague would write, not a marketer

## Language Rules

- **Outcome language, not technical language.** Write at a 7th-grade reading level.
  - Instead of "SEO optimization" -> "show up when people search"
  - Instead of "mobile-responsive design" -> "look great on phones"
  - Instead of "page load speed" -> "loads fast"
  - Instead of "conversion rate" -> "turn visitors into customers"
  - Instead of "Google Business Profile" -> "show up on Google Maps"
- **Under 80 words** for the email body. Shorter is always better.
- No fluff, no filler, no buzzwords.
- No emojis.
- Sound like a real person, not a template.
- Tailor every email to the specific business -- mention something only they would recognize.
- Tone: Professional, direct, helpful -- not pushy.
- **No links in the first email.** Links in cold emails are a spam trigger. Offer to send something; don't link to it.
- **No images or attachments.** Plain text only. Deliver assets in follow-up after they reply.

## Spam Avoidance Checklist

Before finalizing any cold email, verify:

- [ ] Plain text only (no HTML tags, no images, no logos)
- [ ] No links or URLs in the body
- [ ] No attachments
- [ ] Subject line follows rules above (lowercase, no special chars, no spam words)
- [ ] Under 80 words in body
- [ ] At least one specific detail about their business (not just their name)
- [ ] Sign-off is just name and company -- no phone, no links, no tagline
- [ ] No spam trigger phrases ("free consultation", "limited offer", "act now", "I guarantee")
- [ ] Reads like a message from a person, not a template

## Niche-Specific Offers

Use the offer that matches the prospect's industry. See `operations/references/niche-offer-templates.md` for the full list.

**Key principle:** The offer should be something small, tangible, and specific to their business that they can "touch and feel." It should take you 10-15 minutes to deliver and demonstrate your value without overwhelming them.

The full website assessment becomes a **second-touch** resource after they engage, not the opening move.

## Conversion Flow

The cold email is step 1 of a defined path:

```
Cold Email (plain text offer) -> Reply ("yes") -> Deliver the offer (can be HTML/branded) -> 15-min call -> Discovery/Proposal
```

- Cold email offers something free and specific (plain text, no links)
- They reply to claim it
- We deliver it quickly (within 24 hours) -- deliverables CAN be branded HTML/PDF
- In the delivery email, suggest a quick call to walk through it
- The call is where we discuss their full needs and pitch the project

## Output Format

Generate a **plain text** email. No HTML.

Save the email content to:
```
sales/lead-generation/prospects/[business-name]/outreach/cold-email.txt
```

Also save the send-ready JSON to:
```
sales/lead-generation/prospects/[business-name]/outreach/cold-email.json
```

The JSON uses `body` (not `html`) to ensure plain text sending. Include `prospect` and `template` for tracking:
```json
{
  "to": "prospect@example.com",
  "subject": "subject line here",
  "body": "Full plain text email body here",
  "prospect": "business-name",
  "template": "W1"
}
```

## Staging (Default Flow)

Cold emails are **staged as Gmail drafts**, not sent immediately. Eric reviews them in his Drafts folder and sends when ready.

### Step 1: Stage the Email

After writing the JSON file, stage it as a Gmail draft:
```bash
cat sales/lead-generation/prospects/[business-name]/outreach/cold-email.json | node .claude/skills/gws-cli/scripts/stage_email.js
```

This creates a draft in Eric's Gmail and adds it to the staging manifest at `sales/lead-generation/staged-emails.json`.

### Step 2: Repeat for All Prospects

When processing a batch of leads, stage all emails in one session. Each `stage_email.js` call adds to the manifest. Eric can review them in Gmail Drafts at any time.

### Step 3: Review Staged Emails

To see what's queued:
```bash
node .claude/skills/gws-cli/scripts/send_staged.js --list
```

### Step 4: Send All Staged Emails

When Eric says **"send all staged emails"** or **"send the batch"**:
```bash
node .claude/skills/gws-cli/scripts/send_staged.js
```

This sends each draft with 5-minute spacing between sends (configurable with `--spacing <seconds>`). Failed sends stay in the manifest for retry.

To preview without sending:
```bash
node .claude/skills/gws-cli/scripts/send_staged.js --dry-run
```

### Step 5: Post-Send Updates

After sending, update:
- **Template rotation tracker** (`sales/lead-generation/template-rotation.md`) -- date, count, prospect
- **Google Sheet pipeline** (Sheet ID: `1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0`) -- set Status to "Outreach Sent", write Outreach Date
- **Prospect tracker backup** (`sales/lead-generation/prospect-tracker.md`)

## Direct Send (Override)

If Eric wants to skip staging and send immediately:
```bash
cat sales/lead-generation/prospects/[business-name]/outreach/cold-email.json | node .claude/skills/gws-cli/scripts/build_raw_email.js | gws gmail users messages send --params '{"userId":"me"}' --json @-
```

Only use direct send when Eric explicitly asks for it.

## Send Timing

- **Best days:** Tuesday, Wednesday, Thursday
- **Best times:** 8:00-10:00 AM or 1:00-3:00 PM in the prospect's timezone
- **Avoid:** Monday mornings, Friday afternoons, weekends
- **Spacing:** Wait at least 5 minutes between individual sends (don't blast a batch)
- **Daily limit:** Stay under 20/day when starting out, ramp to max 50/day over weeks

## Deliverability

Before sending cold outreach, verify:

- [ ] Email warmup has been running 14+ days (see `operations/references/sops/email-warmup.md`)
- [ ] Inbox placement rate is 95%+
- [ ] DNS records (SPF, DKIM, DMARC) are verified
- [ ] Daily cold email volume stays under limits (20/day starting, 50/day max)
- [ ] Using a dedicated outreach domain if available (protect primary domain reputation)
- [ ] Warmup is still running alongside cold sends (don't pause it)

## Domain Strategy

**Ideal setup** (when budget allows):
- Cold outreach from a secondary domain (e.g., `getophidian.com`)
- Replies and client communication from `ophidianai.com`
- This protects the primary domain's sender reputation

**Current setup** (if using primary domain):
- Keep volume very low (under 20/day)
- Monitor inbox placement closely
- If placement drops below 90%, stop cold sends immediately

See `operations/references/sops/email-warmup.md` for full setup details.

## Follow-Up Strategy: Two-Touch Maximum

Data from 2026 cold email research shows diminishing returns after the second touch:

- **1st follow-up:** +49% reply boost (always send this)
- **2nd follow-up:** Marginal benefit -- only if content angle is different
- **3rd follow-up:** -20% response rate (hurts more than helps)
- **4th follow-up:** -55% response rate (actively damages deliverability)

**The rule:** Initial email + one follow-up bump. If no response, recycle the prospect into a different campaign with a completely different angle (different template category). Never send 4+ emails to the same prospect.

See `follow-up-email` skill for follow-up drafting.

## Microtargeting Over Volume

Campaigns targeting under 50 recipients get **5.8% reply rate** vs 2.1% for 1,000+ recipient campaigns. Build campaigns around 25-50 people per micro-niche.

- Use narrow filters: job title, location, employee count, industry
- Create one campaign that feels personalized for everyone on the list
- Quality > quantity: 50 well-targeted emails outperform 500 generic ones
- See `operations/references/cold-email-playbook.md` for full strategy

## Creative Ideas Template (CI1)

The "3 creative ideas" format is the best-performing cold email format at **85 contacts per opportunity** (2x better than standard templates). Use when you have enough knowledge about the prospect's business to offer specific, actionable ideas.

**When to use:** After research reveals 3+ specific improvements or opportunities for the prospect. Works across all prospect types.

**Structure:**

```
Subject: some ideas for [business name]

Hi [first name],

I had some ideas about how we could [specific outcome] for [business name].

1. [Specific problem + your solution, tied to their business]
2. [Different angle they might care about]
3. [Third creative idea with different use case]

Let me know if any of these resonate.

Eric Lefler
OphidianAI

P.S. If [alternative] isn't the focus right now, maybe we could [totally different idea].
```

**Example:**

Subject: some ideas for tailwaggers

Hi Sarah,

I had some ideas about how we could get more pet parents booking with Tailwaggers.

1. Your site doesn't show up when people search "dog grooming Columbus" -- a few quick fixes and you'd be competing with PetSmart for those searches.
2. An online booking system so people can schedule at 10pm when they're thinking about it instead of having to call during business hours.
3. A "before and after" gallery showing your best grooms -- this builds trust instantly and gives people a reason to pick you over cheaper options.

Let me know if any of these resonate.

Eric Lefler
OphidianAI

P.S. If the website isn't the priority right now, I noticed your Google Business Profile could use some love too -- happy to show you what I mean.

---

## Template Rotation

Templates are organized by prospect type: Website (W1-W4), SEO (S1-S4), Hybrid (H1-H4), and Creative Ideas (CI1). All templates focus on money left on the table or bringing more customers. All are written at a 7th-grade reading level. Under 80 words (CI1 can be slightly longer due to the 3-idea format).

### How Rotation Works

1. Before drafting, read `sales/lead-generation/template-rotation.md`
2. Identify the prospect type: **Website**, **SEO**, or **Hybrid**
3. Pick the template with the oldest "Last Used" date within that category
4. Draft the email using that template's pattern
5. After sending, update the rotation tracker with the date, count, and prospect name
6. Add `"template": "W1"` (or W2, S3, H1, etc.) to the cold-email.json file

Never send the same template to two prospects in the same batch.

### Choosing the Prospect Type

- **Website** -- Their site is broken, outdated, missing, or not on mobile. They need a new or rebuilt site.
- **SEO** -- Their site is decent but they don't show up in search results. They need visibility, not a rebuild.
- **Hybrid** -- Their site is bad AND they're invisible in search. They need both.
- **AI** -- They could benefit from AI services (chatbot, content, reviews, email, CRM). May or may not need a website too. Use AI templates (A1-A4) for the opening, or pair with a Website/Hybrid template and pitch AI in the follow-up.

---

## Website Templates (W1-W4)

Use when the prospect needs a new or rebuilt website.

### W1 -- "Your site is turning people away"

**Angle:** Something specific on their site is costing them customers right now.

**Subject pattern:** `your site might be costing you customers`

**Example:**

Subject: your site might be costing you customers

Hi Dana,

I pulled up Columbus Massage Center on my phone and the text is hard to read, the menu doesn't work right, and there's no easy way to book. Most people searching on their phone will just go to the next option.

I can show you exactly what needs to change so people stick around and book instead of leaving. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

### W2 -- "You're losing customers on mobile"

**Angle:** Their site doesn't work on phones, and most of their customers are searching on phones.

**Subject pattern:** `[business name] on mobile`

**Example:**

Subject: nano's car detailing on mobile

Hi Lorena,

Most people looking for detailing in Columbus are searching on their phone. I pulled up Nano's site on mine and it's tough to use -- small text, hard to navigate, no quick way to get a quote. People will leave before they call.

I can mock up what your site could look like on mobile -- clean, fast, easy to use. Takes me 10 minutes and it's yours to keep.

Want me to send it over?

Eric Lefler
OphidianAI

---

### W3 -- "Your business deserves better than this"

**Angle:** Their product or reviews are great but their website doesn't match the quality of their actual business.

**Subject pattern:** `[business name] deserves a better first impression`

**Example:**

Subject: total fitness deserves a better first impression

Hi Mark,

Total Fitness has been in Columbus for over 25 years and people clearly love the gym. But your website doesn't show that -- it looks outdated and it's hard to find what you offer or how to sign up.

I can put together a quick mockup showing what a site that matches your reputation could look like. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

### W4 -- "Customers can't find what they need"

**Angle:** Their site exists but key information is buried, missing, or hard to find. Customers give up.

**Subject pattern:** `[business name] -- hard to find the basics`

**Example:**

Subject: columbus massage center -- hard to find the basics

Hi Dana,

I tried to book a massage at Columbus Massage Center from your website and couldn't figure out your hours, pricing, or how to schedule. If I'm having trouble, your customers are too -- and they'll just pick someone easier to book with.

I can show you exactly what to fix so people find what they need and book. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

## SEO Templates (S1-S4)

Use when the prospect has a decent site but poor search visibility. **Required:** Run a competitive search before writing the email (see SEO Prospect Flow below).

### S1 -- "You're invisible"

**Angle:** Customers are searching for their service but the business doesn't show up. Competitors are getting those customers.

**Subject pattern:** `[competitor] is showing up before [business name]`

**Example:**

Subject: smith's plumbing is showing up before you

Hi Mike,

I searched for plumbers in Columbus and your business doesn't come up. Smith's Plumbing and two other shops show up first -- they're getting the calls that could be yours.

I put together a short breakdown showing exactly why they're showing up and you're not, and what it would take to change that.

Want me to send it over?

Eric Lefler
OphidianAI

---

### S2 -- "Your competitors are getting your calls"

**Angle:** Name specific competitors who are outranking them. Make the cost of doing nothing concrete.

**Subject pattern:** `[city] [service] search results -- where you stand`

**Example:**

Subject: columbus auto repair search results -- where you stand

Hi Scott,

I searched for auto repair in Columbus and found 6 shops before SAK Automotive. Midas and Firestone are at the top -- they're getting the calls from people who would've come to you.

I put together a quick report showing where you rank vs your competitors and what's keeping you buried. Yours to keep either way.

Want me to send it over?

Eric Lefler
OphidianAI

---

### S3 -- "Customers are searching but can't find you"

**Angle:** People are actively looking for exactly what they sell, but the business doesn't show up in results.

**Subject pattern:** `people in [city] are searching for [service]`

**Example:**

Subject: people in columbus are searching for personal training

Hi Mark,

Hundreds of people in Columbus search for personal trainers and gyms every month. Right now, Total Fitness doesn't come up in those results -- which means those people are signing up somewhere else.

I can show you exactly what's keeping you out of those results and what it would take to start showing up. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

### S4 -- "Great reputation but nobody can find you"

**Angle:** Their reviews or reputation are strong but they're invisible online. Their happy customers aren't helping them get new ones.

**Subject pattern:** `great reviews but hard to find online`

**Example:**

Subject: great reviews but hard to find online

Hi Lorena,

Nano's Car Detailing has over 100 five-star reviews -- that's better than most shops in Columbus. But when people search for detailing near them, Nano's doesn't come up. All those happy customers aren't helping you get new ones.

I can show you exactly what needs to change so your reviews start working for you. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

## Hybrid Templates (H1-H4)

Use when the prospect needs both a new website AND better search visibility. **Required:** Run a competitive search before writing the email (see SEO Prospect Flow below).

### H1 -- "Losing customers two ways"

**Angle:** Their website is broken AND they don't show up in search. Both problems are costing them. Frame it as one connected problem.

**Subject pattern:** `[business name] is losing customers two ways`

**Example:**

Subject: sak automotive is losing customers two ways

Hi Scott,

I searched for auto repair in Columbus and SAK doesn't show up -- Midas and Firestone are getting those calls instead. Then I pulled up your site and it's tough to use on a phone, which means even people who do find you might leave before they call.

I can put together a short plan covering both -- what to fix on your site and how to start showing up in search. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

### H2 -- "Your competitors look better and show up first"

**Angle:** Compare their site side by side with a competitor who ranks above them. The competitor has a better site AND better visibility. Make them feel the gap.

**Subject pattern:** `[competitor] vs [business name] online`

**Example:**

Subject: midas vs sak automotive online

Hi Scott,

I searched for auto repair in Columbus and Midas comes up first with a clean site, online booking, and easy-to-find hours. SAK Automotive doesn't show up in the results, and when I found your site it was hard to use on my phone.

I can show you exactly what Midas is doing that you're not -- and what it would take to close that gap. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

### H3 -- "Great business, but nobody can tell online"

**Angle:** Their reputation or reviews are strong but their online presence doesn't reflect it. Both the site and search visibility are letting them down.

**Subject pattern:** `[business name] is better than it looks online`

**Example:**

Subject: columbus massage center is better than it looks online

Hi Dana,

Columbus Massage Center has great reviews and clearly does good work. But your website doesn't show that -- it's hard to navigate and doesn't work well on phones. On top of that, you're not showing up when people search for massage in Columbus.

I can put together a quick plan to fix both -- a site that matches your reputation and gets found by new customers. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

### H4 -- "The customers are there but they can't get to you"

**Angle:** There's demand in their area but two things are blocking customers from reaching them: they can't find the business in search, and if they do find it the site doesn't convert.

**Subject pattern:** `people in [city] want [service] but can't find you`

**Example:**

Subject: people in columbus want car detailing but can't find you

Hi Lorena,

Hundreds of people in Columbus search for car detailing every month. Right now Nano's doesn't come up in those results -- and when someone does find your site, it's hard to use on a phone and there's no easy way to get a quote.

I can show you what's keeping you out of search results and what to fix on your site so those customers actually reach you. Takes me about 10 minutes.

Want me to send it over?

Eric Lefler
OphidianAI

---

## AI Service Templates (A1-A4)

Use when the prospect could benefit from AI-powered services (chatbot, content, reviews, email marketing, CRM). Works for businesses with or without website needs -- the AI pitch is the recurring revenue play.

**Key principle:** Lead with outcomes, not technology. "AI" scares some small business owners. Frame everything as saving time, getting more customers, or making money while they sleep.

### Choosing the Prospect Type

- **AI-primary** -- Their website is fine (or they don't want a rebuild), but they're missing automation, customer engagement, or marketing.
- **Website + AI** -- Use a Website or Hybrid template for the opening, then pitch AI services in the follow-up or delivery call. Don't try to sell both in one cold email.

### A1 -- "You're answering the same questions over and over"

**Angle:** Business owners spend hours answering the same customer questions. An AI chatbot handles that 24/7 so they can focus on the work.

**Subject pattern:** `saving [business name] a few hours a week`

**Example:**

Subject: saving columbus massage center a few hours a week

Hi Dana,

I noticed Columbus Massage Center gets a lot of the same questions -- hours, pricing, how to book. Right now someone has to answer every call and message.

I built a tool that answers those questions automatically on your website, 24/7 -- so customers get what they need and you get your time back. I can show you what it would look like for your business.

Want me to send a quick demo?

Eric Lefler
OphidianAI

---

### A2 -- "Your competitors are staying in touch with customers"

**Angle:** Other businesses in their industry are using automated email and review campaigns to stay top-of-mind. This prospect isn't, and they're losing repeat business.

**Subject pattern:** `how [competitor] keeps customers coming back`

**Example:**

Subject: how studio 27 keeps customers coming back

Hi Sarah,

I noticed Studio 27 sends follow-up emails after every appointment, asks for reviews automatically, and runs monthly specials to past clients. That's how they stay booked solid.

I can set up the same system for Wild Root -- automated follow-ups, review requests, and promotions that run on their own. Takes me about 15 minutes to map it out for your business.

Want me to show you what it would look like?

Eric Lefler
OphidianAI

---

### A3 -- "You're missing customers after hours"

**Angle:** Most customer searches happen outside business hours. Without an instant way to engage, those customers go somewhere else.

**Subject pattern:** `the customers reaching out at 10pm`

**Example:**

Subject: the customers reaching out at 10pm

Hi Scott,

Most people searching for auto repair are doing it at night or on weekends -- after something breaks. If they land on SAK Automotive's site and there's no one to help, they'll just call the first shop that answers.

I built a tool that talks to customers on your website any time of day -- answers questions, gives estimates, and books appointments while you sleep.

Want me to show you what it would look like for SAK?

Eric Lefler
OphidianAI

---

### A4 -- "Your reviews could be working harder for you"

**Angle:** They have good reviews but no system to consistently generate new ones. Or their review count has stagnated. Automated review requests after every job/visit solve this.

**Subject pattern:** `getting more reviews for [business name]`

**Example:**

Subject: getting more reviews for paswater automotive

Hi there,

Paswater Automotive has solid reviews but the last few are months old. Google rewards businesses that get fresh reviews consistently -- it's one of the biggest factors in who shows up first in local search.

I can set up an automated system that texts customers after every visit and asks them to leave a review. Most shops see 3-5x more reviews within the first month.

Want me to show you how it works?

Eric Lefler
OphidianAI

---

## AI Prospect Flow

AI templates work best when you can reference something specific about how the prospect currently handles (or doesn't handle) customer engagement.

### Step 1: Quick Recon

- Check if they have a chatbot or live chat (most don't)
- Check their review recency and frequency
- Look for email signup forms or marketing
- Check social media activity and posting frequency

### Step 2: Pick the Right Template

| Signal | Template |
|--------|----------|
| High call/message volume, FAQ-heavy business | A1 (answering questions) |
| Competitor is doing email/review automation | A2 (competitors staying in touch) |
| Service business with after-hours demand | A3 (missing customers after hours) |
| Good reviews but stale/infrequent | A4 (reviews working harder) |

### Step 3: Frame the Offer

The offer for AI prospects is always a quick demo or mockup:

- "I can show you what it would look like for your business"
- The deliverable is a chatbot demo page or a mapped-out automation flow
- Deliver via the `offer-delivery` skill after they reply

---

## SEO Prospect Flow

All SEO templates (S1-S4) and the hybrid template (H1) require a competitive search before writing the email.

### Step 1: Competitive Search

Search for "[their service] in [their city]" using Firecrawl. Record:

- Which competitors show up in the top 5-10 results
- Where the prospect ranks (or if they don't show up at all)
- Any Google Maps/Local Pack results

### Step 2: Use the Data in the Email

Reference specific competitors by name. Examples:

- "I searched for [service] in [city] and found 8 other shops before yours."
- "[Competitor A] and [Competitor B] are showing up first and getting those calls."
- "Your business doesn't come up at all when people search for [service] in [city]."

This makes the email undeniable -- they can verify it in 10 seconds by searching themselves.

### Step 3: Frame the Offer

The offer for SEO prospects is always a competitive positioning report:

- "I put together a short report showing where you stand vs your competitors and what's keeping you buried."
- The deliverable is the SEO audit PDF (from the seo-audit skill)

## Knowledge Base

After drafting the cold email and saving to `sales/lead-generation/prospects/[slug]/outreach/`, index it:

1. Upsert the email:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  records: [{
    "_id": "outreach/<prospect-slug>/<email-filename-without-ext>",
    "text": "<email content>",
    "source_file": "sales/lead-generation/prospects/<slug>/outreach/<filename>",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "<template-name>", "cold-email"]
  }]
```

2. Log: `Indexed to knowledge base: outreach/<prospect-slug>/<filename>`

If indexing fails, log the error and continue.
