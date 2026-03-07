# Offer Delivery Skill

Handles delivering the promised free item when a prospect replies "yes" to a cold email, then suggests a call.

## Turnaround

Deliver within 24 hours of the prospect's reply. Speed signals professionalism and keeps momentum.

## Conversion Flow

```
Offer Delivered > Suggest Call > Discovery Call > Proposal
```

This skill covers the "Offer Delivered" and "Suggest Call" steps in a single touchpoint.

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

1. The original outreach email in `revenue/lead-generation/prospects/[business-name]/outreach/`
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

Save the deliverable to `revenue/lead-generation/prospects/[business-name]/outreach/offer-deliverable.pdf`.

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
`revenue/lead-generation/prospects/[business-name]/outreach/offer-delivery.html`

### Step 4: Test Send

Send the email with attachment to `eric.lefler@ophidianai.com` first using:
`.claude/skills/gmail/scripts/send_email.js`

Verify:

- Email body renders correctly (HTML formatting, logo, colors)
- Attachment is included and opens properly
- Subject line is correct
- Body is under 80 words

Do not proceed to live send until Eric confirms the test looks good.

### Step 5: Send to Prospect

After Eric approves the test, send the live email to the prospect using the same Gmail send script.

### Step 6: Update Tracker

Update `revenue/lead-generation/prospect-tracker.md`:

- Set status to **Offer Delivered**
- Set the date to today
- Add notes on what was delivered

## Output

- Deliverable PDF saved to `revenue/lead-generation/prospects/[business-name]/outreach/offer-deliverable.pdf`
- Delivery email HTML saved to `revenue/lead-generation/prospects/[business-name]/outreach/offer-delivery.html`
- Email sent (test first, then live)
- Prospect tracker updated to "Offer Delivered"

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
