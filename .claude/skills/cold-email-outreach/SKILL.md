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

## Email Structure

Every cold email follows this structure:

1. **Subject line** -- Outcome-focused, under 50 characters. No jargon. No "SEO" or "web design."
2. **Opening** -- One sentence about what you noticed about their business. Use outcome language, not technical language.
3. **Offer** -- 1-2 sentences offering something tangible and niche-specific they can "touch and feel." Not a full assessment or audit. Something small, free, and useful.
4. **CTA** -- Low-friction reply ask. "Want me to send it over?" or "Reply yes and I'll get it to you." Never ask for a call on the first email.
5. **Sign-off** -- Eric Lefler, OphidianAI.

## Language Rules

- **Outcome language, not technical language.** Write at a 7th-grade reading level.
  - Instead of "SEO optimization" → "show up when people search"
  - Instead of "mobile-responsive design" → "look great on phones"
  - Instead of "page load speed" → "loads fast"
  - Instead of "conversion rate" → "turn visitors into customers"
  - Instead of "Google Business Profile" → "show up on Google Maps"
- **Under 80 words** for the email body. Shorter is always better.
- No fluff, no filler, no buzzwords.
- No emojis.
- Sound like a real person, not a template.
- Tailor every email to the specific business.
- Tone: Professional, direct, helpful -- not pushy.

## Niche-Specific Offers

Use the offer that matches the prospect's industry. See `operations/references/niche-offer-templates.md` for the full list.

**Key principle:** The offer should be something small, tangible, and specific to their business that they can "touch and feel." It should take you 10-15 minutes to deliver and demonstrate your value without overwhelming them.

The full website assessment becomes a **second-touch** resource after they engage, not the opening move.

## Conversion Flow

The cold email is step 1 of a defined path:

```
Cold Email (offer) → Reply ("yes") → Deliver the offer → 15-min call → Discovery/Proposal
```

- Cold email offers something free and specific
- They reply to claim it
- We deliver it quickly (within 24 hours)
- In the delivery email, suggest a quick call to walk through it
- The call is where we discuss their full needs and pitch the project

## Output Format

Generate an HTML email using the OphidianAI branded template:

- Dark gradient header (#0D1B2A), teal accent (#0DB1B2), lime green (#39FF14)
- OphidianAI logo in header (base64-encoded from `shared/brand-assets/logo_icon_40.png`)
- Signature block with Eric Lefler, OphidianAI, eric.lefler@ophidianai.com
- Branded footer matching header style

Save the HTML file to:
```
revenue/lead-generation/prospects/[business-name]/outreach/cold-email.html
```

## Sending

1. Write a JSON file with `to`, `subject`, and `html` fields:
   ```
   revenue/lead-generation/prospects/[business-name]/outreach/cold-email.json
   ```

2. Send a test email first:
   ```bash
   node .claude/skills/gmail/scripts/send_email.js cold-email-test.json
   ```
   Use `to: eric.lefler@ophidianai.com` for the test.

3. After Eric confirms, update the JSON with the prospect's real email and send:
   ```bash
   node .claude/skills/gmail/scripts/send_email.js revenue/lead-generation/prospects/[business-name]/outreach/cold-email.json
   ```

4. Update `revenue/lead-generation/prospect-tracker.md` -- set status to "Outreach Sent" and log the date.

## Deliverability

Before sending cold outreach, verify:

- [ ] Email warmup has been running 14+ days (see `operations/references/sops/email-warmup.md`)
- [ ] Inbox placement rate is 95%+
- [ ] DNS records (SPF, DKIM, DMARC) are verified
- [ ] Daily cold email volume stays under 50/inbox

## Example

**Subject:** Getting more repair calls from Google

Hi Scott,

SAK Automotive has solid reviews but your website makes it hard for new customers to find you when they search for a mechanic in Columbus.

I'll put together a quick plan showing exactly what needs to change so you show up in those searches and get more calls. Takes me about 10 minutes -- yours to keep either way.

Want me to send it over?

Eric Lefler
OphidianAI

---

**Subject:** Your menu deserves better than a PDF

Hi Maria,

Found your restaurant while searching for lunch spots in Columbus. The food looks incredible but your menu is buried in a PDF that doesn't work on phones.

I'll mock up what your menu page could look like on mobile -- clean, easy to scroll, loads fast. Takes me 10 minutes and it's yours to keep.

Want me to send it over?

Eric Lefler
OphidianAI
