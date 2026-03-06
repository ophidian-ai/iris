# Follow-Up Email

Generate follow-up emails for prospects who haven't replied to initial cold outreach.

## When to Use

When a prospect hasn't replied to a cold email and it's time for a follow-up. Supports a 3-touch sequence before moving on.

## Inputs

- **Prospect name** and **business name**
- **Original email subject line**
- **Key points from original email** (what was pitched, what assessment highlighted)
- **Days since original email**
- **Follow-up number** (1st, 2nd, or 3rd)
- **New angle or info** (optional -- a stat, insight, or observation to add value)

## Follow-Up Sequence

### Follow-Up 1 (Day 3-4)
Short and casual. "Wanted to make sure this didn't get buried." Reference one specific point from the original email. Under 75 words.

### Follow-Up 2 (Day 7-8)
Add new value. Share a quick insight, stat, or relevant observation. Don't repeat the original pitch. Under 100 words.

### Follow-Up 3 (Day 14)
Final touch. Acknowledge they're busy, leave the door open. "If timing isn't right, no worries -- just reply whenever it makes sense." Under 75 words.

## Output Format

Generate an HTML email using the OphidianAI branded template:

- Dark gradient header (#0D1B2A), teal accent (#0DB1B2), lime green (#39FF14)
- OphidianAI logo in header (base64-encoded from `references/brand-assets/logo_icon_40.png`)
- Signature block and footer matching cold email template
- Subject line: `Re: [original subject]` (keeps it in the same thread)
- Email body should be significantly shorter than the cold email

Save the HTML file to:
```
lead-generation/prospects/[business-name]/outreach/follow-up-[number].html
```

## Sending

1. Write a JSON file with `to`, `subject`, `html`, and `threadId` fields:
   ```
   lead-generation/prospects/[business-name]/outreach/follow-up-[number].json
   ```

2. Send a test email first:
   ```bash
   node .claude/skills/gmail/scripts/send_email.js follow-up-test.json
   ```
   Use `to: eric.lefler@ophidianai.com` for the test.

3. After Eric confirms, update the JSON with the prospect's email and send:
   ```bash
   node .claude/skills/gmail/scripts/send_email.js lead-generation/prospects/[business-name]/outreach/follow-up-[number].json
   ```

4. Update `lead-generation/prospect-tracker.md` -- set status to "Follow-Up [N] Sent" and log the date.

### Getting the threadId

The threadId comes from the original sent email. Check the prospect's outreach folder or Gmail for the thread ID of the initial cold email. Without it, the follow-up won't appear in the same thread.

## Rules

- Never resend or rehash the cold email. Each follow-up stands on its own.
- Each follow-up should be shorter than the previous.
- Reference the assessment/attachment that was sent, but don't re-explain it.
- Professional but human. Not salesy.
- No emojis.
- No fluff words or padding.
- No "just checking in" or "circling back" -- be direct about why you're writing.
- Sound like a real person. Every email should feel written for that specific business.
- If no new angle is provided for Follow-Up 2, find one (e.g., a relevant industry stat, a competitor observation, a seasonal opportunity).

## Examples

### Follow-Up 1

Hi Dana,

Wanted to make sure my email from earlier this week didn't get buried. I put together a quick assessment of the Columbus Massage Center website with some specific things that could help bring in more bookings online.

Happy to walk through it if you're interested -- no pressure either way.

Eric Lefler
OphidianAI

### Follow-Up 2

Hi Dana,

Quick thought -- I was looking at massage therapy search trends in Columbus and noticed a significant jump in "massage near me" searches over the last quarter. Businesses with modern, mobile-friendly sites are capturing most of that traffic.

The assessment I sent last week covers exactly what would need to change on your site to show up in those results. Worth a look if you have a few minutes.

Eric Lefler
OphidianAI

### Follow-Up 3

Hi Dana,

I know things get busy. If a website update isn't on your radar right now, no worries at all. The assessment I sent is yours to keep whenever the timing feels right.

If anything changes, I'm an email away.

Eric Lefler
OphidianAI
