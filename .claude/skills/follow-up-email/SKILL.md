# Follow-Up Email

Generate follow-up emails for prospects who haven't replied to initial cold outreach.

## When to Use

When a prospect hasn't replied to a cold email and it's time for a follow-up. Supports a 3-touch sequence before moving on.

## Inputs

- **Prospect name** and **business name**
- **Original email subject line**
- **What was offered in the original email** (the specific free deliverable)
- **Days since original email**
- **Follow-up number** (1st, 2nd, or 3rd)
- **New angle or info** (optional -- a stat, insight, or observation to add value)

## Follow-Up Sequence

### Follow-Up 1 (Day 3-4)

Short and casual. Reference the specific offer from the original email. Restate what they'd get. Under 60 words.

**Goal:** Remind them of the tangible thing you offered to give them for free.

### Follow-Up 2 (Day 7-8)

Add new value. Share a quick insight, stat, or relevant observation specific to their industry. Don't repeat the original offer -- give them a new reason to engage. Under 80 words.

**Goal:** Demonstrate expertise with a specific, relevant insight they haven't heard before.

### Follow-Up 3 (Day 14)

Final touch. Acknowledge they're busy, leave the door open. Keep the offer standing. Under 60 words.

**Goal:** Close the loop gracefully. No pressure.

## Language Rules

- Same rules as cold email: outcome language, not technical language.
- 7th-grade reading level. No jargon.
- Each follow-up should be shorter than the previous.
- Reference the original offer but don't re-explain it.
- No "just checking in" or "circling back" -- be direct about why you're writing.
- No emojis. No fluff. No filler.
- Sound like a real person writing to that specific business.
- If no new angle is provided for Follow-Up 2, find one (e.g., a relevant industry stat, a competitor observation, a seasonal opportunity).

## Output Format

Generate an HTML email using the OphidianAI branded template:

- Dark gradient header (#0D1B2A), teal accent (#0DB1B2), lime green (#39FF14)
- OphidianAI logo in header (base64-encoded from `shared/brand-assets/logo_icon_40.png`)
- Signature block and footer matching cold email template
- Subject line: `Re: [original subject]` (keeps it in the same thread)
- Email body should be significantly shorter than the cold email

Save the HTML file to:
```
revenue/lead-generation/prospects/[business-name]/outreach/follow-up-[number].html
```

## Sending

1. Write a JSON file with `to`, `subject`, `html`, and `threadId` fields:
   ```
   revenue/lead-generation/prospects/[business-name]/outreach/follow-up-[number].json
   ```

2. Send a test email first:
   ```bash
   node .claude/skills/gmail/scripts/send_email.js follow-up-test.json
   ```
   Use `to: eric.lefler@ophidianai.com` for the test.

3. After Eric confirms, update the JSON with the prospect's email and send:
   ```bash
   node .claude/skills/gmail/scripts/send_email.js revenue/lead-generation/prospects/[business-name]/outreach/follow-up-[number].json
   ```

4. Update `revenue/lead-generation/prospect-tracker.md` -- set status to "Follow-Up [N] Sent" and log the date.

### Getting the threadId

The threadId comes from the original sent email. Check the prospect's outreach folder or Gmail for the thread ID of the initial cold email. Without it, the follow-up won't appear in the same thread.

## Examples

### Follow-Up 1

Hi Scott,

Wanted to make sure my email didn't get buried. I offered to put together a quick plan showing what needs to change on your site so more people find SAK Automotive when they search for a mechanic in Columbus.

Still happy to do it -- takes me about 10 minutes. Want me to send it over?

Eric Lefler
OphidianAI

### Follow-Up 2

Hi Scott,

Quick thought -- I noticed "auto repair Columbus IN" searches have jumped this quarter. Most of those searchers pick from the first 3 results on Google, and right now SAK isn't showing up there.

A few small changes to your site could fix that. Happy to show you what I mean if you're interested.

Eric Lefler
OphidianAI

### Follow-Up 3

Hi Scott,

I know things get busy. If a website update isn't on your radar right now, no worries at all. The offer to put together that search visibility plan still stands whenever the timing feels right.

Eric Lefler
OphidianAI
