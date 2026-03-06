# Proposal Generator

Generate professional, branded client proposals when a prospect expresses interest. Outputs HTML and PDF documents ready to send.

## When to Use

When a prospect replies to outreach and wants to learn more, or when Eric says "generate a proposal for [prospect]."

## Inputs

- **Prospect name** -- Contact person
- **Business name** -- Their company
- **Business type/industry** -- What they do
- **Recommended tier** -- Starter, Professional, or E-Commerce
- **Pages needed** -- List of specific pages (e.g., Home, About, Services, Contact, Gallery)
- **Special features** -- Booking system, product catalog, email integration, etc.
- **Add-ons** -- Any extras beyond the base tier
- **Timeline preference** -- If the prospect mentioned urgency or flexibility
- **Notes** -- Pain points, what they care about, assessment findings, conversation context

Pull missing details from `lead-generation/prospects/[business-name]/` research files and assessment.

## Proposal Structure

The HTML document contains these sections in order:

1. **Header** -- OphidianAI branded header. Dark gradient (#0D1B2A to #1A2332), teal accent border (#0DB1B2), base64-embedded logo, brand name with lime green "AI" (#39FF14), tagline "Intelligence. Engineered." in courier mono.

2. **Introduction** -- 2-3 sentences. Personalized opening referencing their business and what was discussed. No fluff.

3. **What We Found** -- Bullet points summarizing issues from the assessment already sent. Reference specific problems (slow load, not mobile-friendly, outdated design, missing SEO, etc.).

4. **What We'll Build** -- Scope of work. List each page with a one-line description of what it does. List features and integrations included. Be specific to their business.

5. **How We Work** -- Five phases, one sentence each:
   - Discovery -- Gather content, assets, and goals
   - Design -- Homepage mockup for review
   - Build -- Full site development, mobile-responsive
   - Review -- Client feedback and revisions
   - Launch -- Go-live, SEO setup, handoff

6. **Timeline** -- Estimated delivery based on tier (Starter: 1-2 weeks, Professional: 2-3 weeks, E-Commerce: 3-4 weeks).

7. **Investment** -- Pricing table. Columns: Item, Details, Price. Rows: base tier, each add-on, monthly maintenance. Show a clear total for the one-time cost. Maintenance shown as separate recurring line.

8. **What's Included** -- Bullet list of everything in the tier. Pull from `references/pricing-structure.md`. Examples: responsive design, SEO setup, SSL certificate, hosting, performance optimization, browser testing.

9. **Next Steps** -- Clear CTA: "1) Reply to confirm you'd like to move forward. 2) We'll send a brief content questionnaire. 3) Work begins within [X] business days."

10. **Footer** -- Eric Lefler signature block + OphidianAI branded footer matching header style.

## Styling

- Body: white background, Inter font family, max-width 700px centered
- Section headers: dark text, clean spacing
- Pricing table: clean bordered table, teal header row, bold total row
- Dividers: teal/lime gradient lines between sections
- Footer: dark background matching header

## Rules

- **Use exact pricing from `references/pricing-structure.md`.** Never make up prices.
- Justify the tier recommendation based on the prospect's specific needs.
- Frame maintenance as standard (included), not optional.
- Professional but warm tone -- these are small business owners, not corporate buyers.
- Reference specific issues from their website assessment.
- No emojis. No fluff. No filler.
- Be concrete about what is and is not included.
- All client-facing documents go through Eric for approval before sending.

## Output

1. **HTML proposal** -- Save to `lead-generation/prospects/[business-name]/outreach/proposal.html`

2. **PDF conversion** -- Convert HTML to PDF using Playwright:
   ```javascript
   // Run inline with: node -e "..."
   const { chromium } = require('playwright');
   (async () => {
     const browser = await chromium.launch();
     const page = await browser.newPage();
     await page.goto('file:///absolute/path/to/proposal.html');
     await page.pdf({ path: 'proposal.pdf', format: 'Letter', printBackground: true });
     await browser.close();
   })();
   ```
   Save PDF to `lead-generation/prospects/[business-name]/outreach/proposal.pdf`

3. **Send via Gmail** -- Use `.claude/skills/gmail/scripts/send_email.js` with the PDF attached:
   ```bash
   echo '{"to":"prospect@email.com","subject":"OphidianAI Proposal for [Business Name]","html":"<p>Hi [Name],</p><p>Thanks for your interest. Attached is a proposal outlining what we can build for [Business Name].</p><p>Happy to answer any questions or hop on a quick call.</p><p>Eric Lefler<br>OphidianAI</p>","attachments":[{"filename":"OphidianAI-Proposal-[Business].pdf","path":"absolute/path/to/proposal.pdf"}]}' | node .claude/skills/gmail/scripts/send_email.js
   ```
   **Always test-send to eric.lefler@ophidianai.com first.**

4. **Update tracker** -- Set prospect status to "Proposal Sent" in `lead-generation/prospect-tracker.md`.

## Checklist Before Sending

- [ ] Pricing matches `references/pricing-structure.md`
- [ ] All pages and features listed match what was discussed
- [ ] Assessment findings are accurately referenced
- [ ] PDF renders correctly (check formatting, page breaks)
- [ ] Test email sent to Eric first
- [ ] Eric approved the proposal
