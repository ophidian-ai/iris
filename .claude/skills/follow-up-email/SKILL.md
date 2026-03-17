---
name: follow-up-email
description: Generate follow-up emails for prospects who haven't replied to initial cold outreach. 5-touch + breakup sequence (FU1-FU4 + Breakup) over 25 days. Each touch leads with NEW value from a different angle. Plain text only. Use when Eric says "follow up with them", "send a follow-up", "they haven't replied", or when the morning briefing flags overdue follow-ups.
---

# Follow-Up Email

Generate follow-up emails for prospects who haven't replied to initial cold outreach. 6-touch total sequence: First Contact (Day 0) + 4 follow-ups + 1 breakup, each with a different angle and new value.

## When to Use

When a prospect hasn't replied to a cold email and it's time for the next touch. Supports 5 follow-up touches (FU1-FU4 + Breakup) before closing the loop.

## Inputs

- **Prospect name** and **business name**
- **Original email subject line**
- **What was offered in the original email** (the specific free deliverable)
- **Days since original email**
- **Follow-up number** (1-5, where 5 = Breakup)
- **New angle or insight** (optional -- if not provided, generate one using angle guidance below)

## Cadence

| Touch | Day | Template | Word Count | Signature |
|-------|-----|----------|------------|-----------|
| First Contact | 0 | (cold-email-outreach skill) | 60-80 | Eric Lefler, OphidianAI |
| FU1 | 3 | Micro value drop + reference original | 40-60 | Eric |
| FU2 | 7 | Different angle entirely | 40-70 | Eric |
| FU3 | 12 | Social proof or broader pattern | 40-60 | Eric |
| FU4 | 18 | Last value drop, shortest | 30-50 | Eric |
| Breakup | 25 | Clean close, door open | 30-40 | Eric Lefler, OphidianAI |

Each follow-up MUST be shorter than or equal to the previous. Never go longer.

## Core Principles

1. **Every touch leads with value, not a reminder.** Never "just checking in" or "circling back."
2. **Each touch uses a DIFFERENT angle.** Never repeat the same pitch.
3. **Plain text only.** No HTML, no images, minimal links. Same rules as cold email.
4. **Progressive signature casualness:** FU1-FU4 = "Eric". Breakup = "Eric Lefler, OphidianAI" (formal close).
5. **PS in FU1 only.** Dropped after that.
6. **Subject: stay in the same thread.** Reply to the original email using `threadId`.

## Follow-Up Sequence

### FU1 (Day 3) -- Micro Value Drop + Reference Original Offer

**Goal:** Deliver a timely insight they can use immediately, then softly reference the original offer.

```
Hi [first name],

[Timely industry insight or Google/platform change they can capitalize on -- 1-2 sentences].

I still have those ideas for [business name] if you're interested. Happy to send them over.

Eric

P.S. [Actionable quick win related to the insight -- something they can do in 5 minutes]
```

40-60 words. PS is the only follow-up that gets one.

### FU2 (Day 7) -- Different Angle Entirely

**Goal:** Share something genuinely interesting about their industry or competitors. Not about their problems -- about an opportunity or pattern.

```
Hi [first name],

[Observation about their industry or competitors -- something they'd find genuinely interesting. Not about their problems, about an opportunity or pattern. 2-3 sentences.]

If you ever want to talk about getting more of that working for [business name], I've got some ideas.

Eric
```

40-70 words. No PS.

### FU3 (Day 12) -- Social Proof or Broader Pattern

**Goal:** Build credibility through pattern recognition or social proof. Show you know their world.

```
Hi [first name],

[Social proof or pattern observation -- "I've been helping local businesses..." or "The businesses that do best in [industry] all have one thing in common..." -- 2-3 sentences.]

Happy to show you what it would take to [specific outcome] for [business name].

Eric
```

40-60 words. No PS.

### FU4 (Day 18) -- Last Value Drop, Shortest

**Goal:** Give them one specific, actionable idea they can use for free. No pitch, just generosity.

```
Hi [first name],

[One specific, actionable idea they can use for free -- 1-2 sentences.]

If you ever want to chat about [business name]'s online presence, I'm here.

Eric
```

30-50 words. No PS. Shortest follow-up in the sequence.

### Breakup (Day 25) -- Clean Close, Door Open

**Goal:** End the sequence with dignity. No value drop, no pitch. Just close.

```
Hi [first name],

I've reached out a few times about helping [business name] get more visible online. I'll stop filling your inbox.

If it ever becomes a priority, the offer stands. You know where to find me.

Eric Lefler
OphidianAI
```

30-40 words. No PS. Formal signature (full name + company).

## Follow-Up Angle Guidance by Industry

Use these as starting points. Always tailor to the specific prospect.

### FU1 Angles (Micro Value Drops)

- Google Business Profile changes or new features
- Seasonal trends relevant to their business
- Platform updates (Google, Yelp, Facebook algorithm changes)
- Local search behavior shifts

### FU2 Angles (Different Perspective)

- Competitor observations ("I noticed [competitor] just updated their site...")
- Industry benchmarks ("The average [industry] website converts at X%...")
- Consumer behavior patterns ("70% of [service] customers search on mobile...")
- Local market observations

### FU3 Angles (Social Proof / Patterns)

- "Businesses I've helped..." (use real examples when available)
- "The top [industry] businesses in Indiana all..."
- "One thing I keep noticing about [city] businesses..."
- Industry-wide patterns that validate your expertise

### FU4 Angles (Free Quick Wins)

- "Your Saturday specials would make a great recurring Google post"
- "Adding 3 photos to your Google listing would..."
- "Responding to your newest reviews with a personal note would..."
- Specific, actionable, 5-minute tips they can implement today

### Breakup

No angle. No value drop. Just close.

## Language Rules

Same rules as cold email:

- **Outcome language, not technical language.** 7th-grade reading level.
  - "show up when people search" not "SEO optimization"
  - "look great on phones" not "mobile-responsive design"
  - "turn visitors into customers" not "conversion rate"
- No jargon, no buzzwords, no fluff, no filler.
- No emojis.
- Sound like a real person writing to that specific business.
- Reference the original offer but don't re-explain it.
- Never say "just checking in", "circling back", "touching base", or "following up on my last email."
- Be direct about the value you're providing in this specific email.

## Output Format

Generate a **plain text** email. No HTML.

Save the email content to:
```
sales/lead-generation/prospects/[slug]/outreach/follow-up-[N].txt
```

Save the send-ready JSON to:
```
sales/lead-generation/prospects/[slug]/outreach/follow-up-[N].json
```

Where `[N]` is the follow-up number (1-5, where 5 = breakup).

### JSON Schema

```json
{
  "to": "prospect@example.com",
  "subject": "Re: original subject line here",
  "body": "Full plain text email body here",
  "threadId": "thread_id_from_original_sent_email",
  "prospect": "business-slug",
  "template": "FU1",
  "scheduledDate": "2026-03-20"
}
```

Fields:

- `to` -- Prospect email address
- `subject` -- `Re: [original subject]` to keep it in the same thread
- `body` -- Plain text email body (NOT `html`)
- `threadId` -- Thread ID from the original sent email (required for threading)
- `prospect` -- Business slug matching the prospect folder name
- `template` -- One of: `FU1`, `FU2`, `FU3`, `FU4`, `Breakup`
- `scheduledDate` -- ISO date string for when the email should be sent (based on cadence)

## Threading

Follow-ups MUST stay in the same Gmail thread as the original cold email. This requires the `threadId` from the original sent email.

### Getting the threadId

1. Check the prospect's `outreach/cold-email.json` for a stored `threadId`
2. If not there, search Gmail for the original sent email:
   ```bash
   gws gmail users messages list --params '{"userId":"me","q":"to:prospect@email.com subject:original subject"}' | head -20
   ```
3. Without a `threadId`, the follow-up will appear as a new thread (bad -- avoid this)

## Staging

Follow-ups are **staged as Gmail drafts** with a `scheduledDate` for the send-scheduler. Eric reviews and sends on his timeline.

### Stage the Email

After writing the JSON file, stage it as a Gmail draft:
```bash
cat sales/lead-generation/prospects/[slug]/outreach/follow-up-[N].json | node .claude/skills/gws-cli/scripts/stage_email.js
```

This creates a draft in Eric's Gmail and adds it to the staging manifest at `sales/lead-generation/staged-emails.json`.

### Review Staged Emails

```bash
node .claude/skills/gws-cli/scripts/send_staged.js --list
```

### Send Staged Emails

When Eric says "send all staged emails" or "send the batch":
```bash
node .claude/skills/gws-cli/scripts/send_staged.js
```

## Sheet Updates

Use the `outreach-sheets.js` module for all Google Sheet updates. Never hardcode column letters.

```javascript
const sheets = require('./operations/automation/scripts/outreach-sheets');
```

### After Staging a Follow-Up

Update the Pipeline sheet:

| Follow-Up | Status Value | Date Column |
|-----------|-------------|-------------|
| FU1 | "FU1 Sent" | FU1 Date |
| FU2 | "FU2 Sent" | FU2 Date |
| FU3 | "FU3 Sent" | FU3 Date |
| FU4 | "FU4 Sent" | FU4 Date |
| Breakup | "Breakup Sent" | Breakup Date |

Also update `sales/lead-generation/prospect-tracker.md` as the local backup.

### Column Mappings (via outreach-sheets.js)

- `FU1 Date` -> Column O
- `FU2 Date` -> Column P
- `FU3 Date` -> Column Q
- `FU4 Date` -> Column AC
- `Breakup Date` -> Column AD
- `Status` -> Column I

## Breakup Handling

After the breakup email is sent:

1. Wait 3 days for a reply
2. If no reply after 3 days, move the prospect to the Failed Outreach sheet:
   ```javascript
   sheets.moveProspect('Pipeline', 'Failed Outreach', 'Business Name', {
     'Touches Sent': 6,
     'Failure Reason': 'No reply after full sequence',
     'Last Touch Date': '<breakup date>'
   });
   ```
3. Update `sales/lead-generation/prospect-tracker.md` to reflect the status change

## Knowledge Base

After drafting the follow-up email and saving, index it in Pinecone:

1. Upsert the follow-up:

```
Tool: mcp__plugin_pinecone_pinecone__upsert-records
Parameters:
  name: "ophidianai-kb"
  namespace: "outreach"
  records: [{
    "_id": "outreach/<prospect-slug>/follow-up-<N>",
    "text": "<follow-up email content>",
    "source_file": "sales/lead-generation/prospects/<slug>/outreach/follow-up-<N>.txt",
    "department": "revenue",
    "created_date": "<today>",
    "updated_date": "<today>",
    "tags": ["<industry>", "follow-up", "sequence-<N>", "<template>"]
  }]
```

2. Log: `Indexed to knowledge base: outreach/<prospect-slug>/follow-up-<N>`

If indexing fails, log the error and continue.
