---
name: inbox-monitor
description: Check Gmail for prospect replies, classify them (Interest, Question, Negative), draft responses, and trigger appropriate workflows. Runs 3x daily -- at 7am via morning-coffee, noon and 4pm standalone. Use when checking for prospect replies, when morning coffee runs, or when Eric says "check for replies", "any prospects respond", "check inbox".
---

# Inbox Monitor

Checks Gmail for prospect replies 3x daily (7am via morning-coffee, noon and 4pm standalone). Classifies replies, drafts responses, triggers workflows.

## Two Operating Modes

### Orchestrated Mode (7am, called by morning-coffee)

- Returns structured data that morning-coffee incorporates into the daily briefing
- Output: reply count, classifications, action items, follow-ups due today
- Does NOT send notifications (morning-coffee handles that via the briefing)

### Standalone Mode (noon, 4pm, called by Task Scheduler or manually)

- Runs independently
- Logs results to `operations/automation/logs/inbox-monitor-YYYY-MM-DD-HHMM.log`
- Only notifies Eric (via ClickUp task or terminal output) if actionable replies found (Interest or Question)
- Silent if no new replies

## Process

### Step 1: Get Active Prospect Emails

Read Active Pipeline sheet via outreach-sheets.js:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const rows = s.getProspectsWhere('Pipeline', r => r['Status'] !== 'New Lead' && r['Status'] !== 'Scored'); console.log(JSON.stringify(rows.map(r => ({name: r['Business Name'], email: r['Email']}))));"
```

### Step 2: Check Gmail for Replies

For each prospect email, search Gmail:

```bash
gws gmail users messages list --params '{"userId":"me","q":"from:PROSPECT_EMAIL newer_than:1d","maxResults":5}'
```

### Step 3: Dedup Check

**Skip any prospect where Reply Date column is already populated in the Pipeline sheet.** This prevents double-processing the same reply across the 3 daily runs.

Check: `if (row['Reply Date'] && row['Reply Date'] !== '' && row['Reply Date'] !== '--') skip;`

### Step 4: Read and Classify Each New Reply

Read the message content:

```bash
gws gmail users messages get --params '{"userId":"me","id":"MESSAGE_ID","format":"full"}'
```

Classify based on content:

**Interest signals:** "yes", "sure", "send it", "interested", "let's talk", "sounds good", "tell me more", "I'd like to see", "when can we", "let's set up", positive tone about the offer

**Question signals:** "how much", "what's the cost", "how does it work", "can you explain", "what do you mean", "do you offer", question marks, seeking clarification

**Negative signals:** "not interested", "no thanks", "stop emailing", "unsubscribe", "remove me", "we're good", "already have", "not right now" (with finality), "don't contact"

If ambiguous, classify as Question (safer -- drafts a response for Eric to review rather than triggering auto-prep or closing).

### Step 5: Handle Each Classification

**Interest Reply:**

1. Write Reply Date to Pipeline sheet IMMEDIATELY (dedup for later runs)
2. Write Reply Touch (which email got the reply -- check FU dates to determine)
3. Write Reply Type = "Interest"
4. Calculate Time to Reply (hours from Send Date to now)
5. Set Status = "Interest Reply"
6. Draft acknowledgment email for Eric to review:
   ```
   Hi [name],

   Thanks for getting back to me. I'll put together a few things
   for you this week -- a quick demo showing what [business name]
   could look like online, and a proposal with pricing and timeline.

   I'll send everything over by [2 business days from now]. Sound good?

   Eric
   ```
7. Auto-prep in background: dispatch proposal-generator + prospect-mockup
8. Notify Eric: "Interest reply from [Business Name]. Acknowledgment drafted. Proposal + demo prep started."

**Question Reply:**

1. Write Reply Date, Reply Touch, Reply Type = "Question", Time to Reply
2. Set Status = "Question Pending" (cadence pauses)
3. Draft a response addressing their question (read the question, formulate answer)
4. Notify Eric: "Question from [Business Name]: '[first 100 chars]'. Response drafted for your review."
5. **Cadence pause rules:**
   - No follow-ups send while in Question Pending
   - Resume trigger: Eric changes status back, or second reply detected
   - On resume: cadence resets from date of last interaction
   - Timeout: if unresolved after 14 days, flag to Eric

**Negative Reply:**

1. Write Reply Date, Reply Touch, Reply Type = "Negative", Time to Reply
2. Draft graceful close for Eric to review:
   ```
   Hi [name],

   Totally understand. If things change down the road, don't
   hesitate to reach out.

   Best,
   Eric
   ```
3. After Eric sends close response: move prospect to Failed Outreach sheet via outreach-sheets.js moveProspect() with:
   - Failure Reason: "Not Interested"
   - Touches Sent: count of touches sent
   - Re-engagement Eligible: 90 days from today
4. Notify Eric: "Negative reply from [Business Name]. Graceful close drafted."

### Step 6: Log Results

Write to `operations/automation/logs/inbox-monitor-YYYY-MM-DD-HHMM.log`:

```
[timestamp] Inbox monitor run (mode: orchestrated|standalone)
[timestamp] Checked X prospects
[timestamp] New replies: Y (Interest: A, Question: B, Negative: C)
[timestamp] Skipped (already processed): Z
[timestamp] Details: [Business Name] - Interest reply, [Other Business] - No reply
```

## How to Determine Reply Touch

Check which follow-up was most recently sent by comparing dates:

1. If only Send Date exists (no FU dates) -> reply to "First Touch"
2. If FU1 Date exists and is before reply -> reply to "FU1"
3. Continue checking FU2, FU3, FU4, Breakup dates
4. The most recent touch before the reply date = the touch that got the reply

## Gmail Search Tips

- `from:email newer_than:1d` -- replies in last 24 hours
- `from:email newer_than:12h` -- for noon/4pm runs, narrow window
- Always use the prospect's email from the Pipeline sheet
- If the reply is in a thread, the `threadId` will match the original sent email

## Integration Notes

- All sheet operations via `outreach-sheets.js` module
- Draft responses are plain text, staged as Gmail drafts for Eric's review
- Auto-prep (proposal + demo) fires in background -- don't wait for it to complete
- ClickUp notifications go to the Sales & Outreach > Active Leads list (ID: 901711866803)
