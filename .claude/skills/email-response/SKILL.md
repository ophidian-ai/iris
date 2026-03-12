---
name: email-response
description: Draft replies to incoming emails on behalf of Eric. Use when Eric receives an email and wants help writing a response, when he forwards an email asking "how should I reply", or when drafting client replies, scheduling responses, or any email communication that needs a professional touch.
---

# Email Response

Draft replies to incoming emails on behalf of Eric.

## When to Use

When Eric receives an email and wants help drafting a reply -- client inquiries, follow-ups, scheduling, questions, etc.

## Inputs

- **The original email** (paste it in, provide the message ID, or summarize it)
- **What Eric wants to say** (the key points or intent)
- **Tone override** (optional -- defaults to professional and direct)

## Process

### Step 1: Get the Email Context

If Eric provides a Gmail message ID or thread ID, read the full message:

```bash
gws gmail users messages get --params '{"userId":"me","id":"<messageId>","format":"full"}'
```

If it's part of a thread, read the full thread for context:

```bash
gws gmail users threads get --params '{"userId":"me","id":"<threadId>","format":"full"}'
```

### Step 2: Determine the Sender

Check who sent the previous messages in the thread to determine the correct "from" address:

- **Eric** (`eric.lefler@ophidianai.com`) -- Business relationship emails, proposals, deliverables, personal communication
- **Iris** (`iris@ophidianai.com`) -- Support questions, technical guidance, how-to walkthroughs

If replying to a thread, match the `from` field of the most recent sent message in that thread.

### Step 3: Check Prospect Context

If the sender might be a prospect, check for a matching folder in `sales/lead-generation/prospects/`. Also check `sales/lead-generation/prospect-tracker.md` for their name or email.

If found, read their research and outreach history to inform the reply -- reference past conversations, what was offered, and where they are in the pipeline.

### Step 4: Draft the Reply

Generate a reply that:

1. Addresses the sender's question or request directly
2. Includes Eric's key points
3. Ends with a clear next step or action item if applicable
4. Signs off with the correct sender identity

### Step 5: Send via GWS CLI

After Eric approves the draft, send the reply:

```bash
# Plain text reply
gws gmail +reply --message-id <messageId> --body 'Reply text here'

# Reply from Iris address (if applicable)
gws gmail +reply --message-id <messageId> --body 'Reply text here' --from iris@ophidianai.com
```

For HTML replies or replies with attachments, use the MIME builder:

```bash
echo '{"to":"recipient@example.com","subject":"Re: Topic","html":"<p>Reply</p>","threadId":"<threadId>","inReplyTo":"<messageId>"}' \
  | node .claude/skills/gws-cli/scripts/build_raw_email.js \
  | gws gmail users messages send --params '{"userId":"me"}' --json @-
```

## Rules

- Match the length to the situation. Short emails get short replies.
- No fluff. Get to the point.
- No emojis.
- Professional tone by default. Adjust if Eric specifies otherwise.
- If the email requires information Eric hasn't provided, flag what's missing before drafting.
- If multiple topics are covered in the original email, address each one clearly (use line breaks, not bullet points in the email body unless appropriate).
- Always suggest a next step when relevant (schedule a call, send a link, confirm a date, etc.).
- Always confirm with Eric before sending.
- If the sender is a prospect, update `sales/lead-generation/prospect-tracker.md` with the interaction.

## Example

**Original email:** "Hi, I saw your site and I'm interested in getting a new website for my bakery. What do you charge?"

**Eric's intent:** Quote a range, suggest a call to scope it out.

**Draft reply:**

Hi [Name],

Thanks for reaching out. Pricing depends on the scope -- number of pages, features, and any custom functionality -- but most small business websites I build fall in the $X-$Y range.

The best next step would be a quick call so I can understand what you need and give you an accurate quote. Are you available this week for 15 minutes?

Eric Lefler
OphidianAI
