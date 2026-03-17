---
name: offer-delivery
description: Deliver the promised free item when a prospect replies "yes" to a cold email, then suggest a call. Use when a prospect responds positively to outreach, when Eric says "they replied yes", "deliver the offer", "send them what we promised", or when the morning briefing flags a prospect reply. Routes to the right deliverable (mockup, SEO plan, service descriptions) and sends via GWS CLI.
---

# Offer Delivery Skill

Handles delivering the promised free item when a prospect replies "yes" to a cold email, then suggests a call.

## Turnaround

Deliver within 24 hours of the prospect's reply. Speed signals professionalism and keeps momentum.

## Conversion Flow

```
Interest Reply -> Auto-Prep (proposal + demo) -> Eric Reviews -> Proposal Sent -> Meeting -> Accepted/Negotiation
```

This skill covers offer delivery, proposal preparation, and the transition into the proposal flow.

## Inputs

| Input | Required | Description |
|---|---|---|
| Prospect name | Yes | First name of the contact |
| Business name | Yes | Name of the business |
| What was offered | Yes (or auto-detect) | The free deliverable promised in the cold email (mockup, search plan, service descriptions, etc.) |
| Prospect's reply context | Yes | What they said in their reply -- used to personalize the delivery email |
| Niche/industry | No | Auto-detected from prospect folder if not provided. Used to look up offer type in `operations/references/niche-offer-templates.md` |

## Process

### Step 1: Identify the Deliverable

Determine which free item was promised in the original cold email. Check:

1. The original outreach email in `sales/lead-generation/prospects/[business-name]/outreach/`
2. The niche offer templates at `operations/references/niche-offer-templates.md`
3. The explicit input if provided

Common deliverable types by niche:

| Niche | Typical Offer |
|---|---|
| Auto services | Homepage mockup showing their reviews/services |
| Restaurants/food | Menu page mockup or online ordering concept |
| Fitness/gyms | Class schedule + membership page mockup |
| Health/wellness | Service descriptions written for their website |
| Home services | Google search plan (local SEO keywords + strategy) |
| Professional services | Homepage mockup or service page rewrite |

### Step 2: Create the Deliverable

Route to the appropriate skill or generate inline:

- **Website mockup** -- Use `.claude/skills/prospect-mockup/SKILL.md`. Generates a branded HTML mockup converted to PDF via Playwright.
- **SEO/search plan** -- Use `.claude/skills/seo-audit/SKILL.md`. Generates an audit PDF with keyword opportunities and local search strategy.
- **Service descriptions** -- Generate inline. Write 4-6 service descriptions tailored to their business. Format as a clean, branded HTML page and convert to PDF via Playwright.
- **Menu mockup** -- Generate inline. Build a sample menu/ordering page in branded HTML, convert to PDF via Playwright.
- **Other** -- Generate inline based on what was promised. Always produce a polished, branded PDF.

All inline-generated deliverables must use OphidianAI branding:

- Dark gradient background: `#0D1B2A`
- Teal accent: `#0DB1B2`
- Lime green highlight: `#39FF14`
- Logo: base64-encoded from `shared/brand-assets/logo_icon_40.png`
- Clean, modern layout. No clutter.

Save the deliverable to `sales/lead-generation/prospects/[business-name]/outreach/offer-deliverable.pdf`.

### Step 3: Write the Delivery Email

Build an HTML email that:

- Delivers the promised item as an attachment
- References something specific about their business (pulled from their reply or prospect research)
- Suggests a 15-minute call with zero pressure
- Stays under 80 words in the body
- Uses professional but approachable tone
- No emojis. Ever.

**Email structure:**

```
Subject: [Deliverable] for [Business Name]

Body (under 80 words):
- Opening: Acknowledge their reply briefly (1 sentence)
- Delivery: "Attached is [the thing] -- [one specific detail about their business that shows this was custom-made]."
- Value hint: One sentence on what they'll see or what stood out.
- CTA: "Happy to walk you through this on a quick 15-minute call if you'd like -- no pressure either way."
- Sign-off: Eric Lefler, OphidianAI
```

**Email format:** OphidianAI branded HTML.

- Match the cold email template styling for visual consistency
- Base64 logo in the signature from `shared/brand-assets/logo_icon_40.png`
- Brand colors in accents (teal links, dark background header/footer if applicable)

Save the delivery email HTML to:
`sales/lead-generation/prospects/[business-name]/outreach/offer-delivery.html`

### Step 4: Stage as Gmail Draft

**Always stage as a Gmail draft.** Eric will inspect and send on his own timeline.
Use `gws gmail users drafts create` to create the draft with the prospect's email as the recipient.

Verify before staging:

- Email body renders correctly (HTML formatting, logo, colors)
- Attachment is included
- Subject line is correct
- Body is under 80 words

### Step 5: Update Tracker

Update the prospect pipeline via the shared outreach-sheets module:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.updateProspect('Pipeline', 'Business Name', {'Status': 'Offer Delivered', 'Last Contact': new Date().toISOString().split('T')[0], 'Notes': 'Delivered [deliverable type]'});"
```

Also update `sales/lead-generation/prospect-tracker.md`:

- Set status to **Offer Delivered**
- Set the date to today
- Add notes on what was delivered

### Step 6: Proposal Flow Transition

After delivering the free offer, immediately begin preparing the proposal and demo in the background:

1. **Fire parallel background tasks:**
   - `.claude/skills/proposal-generator/SKILL.md` -- Generates the proposal document
   - `.claude/skills/prospect-mockup/SKILL.md` -- Builds the interactive demo site

2. **Save outputs:**
   - Proposal: `sales/lead-generation/prospects/[slug]/proposal/`
   - Demo: `sales/lead-generation/prospects/[slug]/demo/`

3. **Notify Eric when complete:**
   - "Proposal and demo ready for [Business]. Review at sales/lead-generation/prospects/[slug]/proposal/ and sales/lead-generation/prospects/[slug]/demo/."

Do not wait for these tasks to complete before finishing the offer delivery. They run in the background.

### Step 7: Proposal Follow-Up Reminder

After Eric sends the proposal, create a Google Calendar follow-up event 3-5 business days out:

```bash
gws calendar +insert --summary 'Follow up with [Business] on proposal' --start 'YYYY-MM-DDT10:00:00-04:00' --end 'YYYY-MM-DDT10:30:00-04:00' --description 'Proposal sent [date]. Follow up if no response.'
```

Update the prospect status via the shared module:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.updateProspect('Pipeline', 'Business Name', {'Status': 'Proposal Sent', 'Last Contact': new Date().toISOString().split('T')[0]});"
```

## Auto-Prep Mode

When triggered by inbox-monitor detecting an interest reply:

1. **Draft acknowledgment email** for Eric to review -- quick, personalized response thanking the prospect for their interest. Stage as Gmail draft.
2. **Fire proposal-generator + prospect-mockup in background** -- do not block on completion.
3. **Notify Eric when ready** -- "Proposal and demo ready for [Business]. Review at sales/lead-generation/prospects/[slug]/proposal/ and sales/lead-generation/prospects/[slug]/demo/."

Auto-prep mode skips the manual trigger step. The inbox-monitor provides the prospect name, business name, and reply context automatically. Iris identifies the deliverable type and kicks off the full pipeline.

## Output

- Deliverable PDF saved to `sales/lead-generation/prospects/[business-name]/outreach/offer-deliverable.pdf`
- Delivery email HTML saved to `sales/lead-generation/prospects/[business-name]/outreach/offer-delivery.html`
- Email staged as Gmail draft for Eric's review
- Prospect tracker and Google Sheet updated to "Offer Delivered"
- Proposal and demo generation kicked off in background (saved to `[slug]/proposal/` and `[slug]/demo/`)
- Eric notified when proposal and demo are ready for review
- Follow-up calendar event created after proposal is sent

## Example

**Input:**

- Prospect: Dana Greathouse
- Business: Columbus Massage Center
- Offered: Service descriptions for their website
- Reply: "Yes, I'd love to see what you come up with!"

**Output:**

- 5 custom service descriptions (Deep Tissue, Swedish, Hot Stone, Couples, Prenatal) formatted as a branded PDF
- Delivery email:

> Subject: Service Descriptions for Columbus Massage Center
>
> Dana,
>
> Thanks for getting back to me. Attached are custom service descriptions written for Columbus Massage Center -- I focused on the five core services listed on your current site and wrote them to highlight what sets your practice apart.
>
> You'll notice they're structured to help new clients understand exactly what to expect from each session.
>
> Happy to walk you through this on a quick 15-minute call if you'd like -- no pressure either way.
>
> Eric Lefler
> OphidianAI

## Notes

- If the prospect asks a question in their reply instead of a clear "yes," answer their question first and redeliver the offer. Do not skip straight to the deliverable.
- If the prospect replies with interest but asks for something different than what was offered, adapt. Deliver what they actually want.
- Log the interaction in the prospect's folder for future reference.

## Knowledge Base

After delivering the offer and logging the outcome, index it:

1. Upsert the outcome record:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  records: [{
    "_id": "outreach/<prospect-slug>/offer-delivery",
    "text": "<outcome summary -- what was offered, whether accepted, what was delivered>",
    "source_file": "sales/lead-generation/prospects/<slug>/outreach/offer-delivery.md",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "offer-delivery", "<outcome: accepted|declined>"]
  }]
```

2. Log: `Indexed to knowledge base: outreach/<prospect-slug>/offer-delivery`

If indexing fails, log the error and continue.
