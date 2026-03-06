---
name: gmail
description: Read, search, and send email via Gmail for eric.lefler@ophidianai.com
---

# Gmail

Access Eric's Gmail account. Scripts are in the `scripts/` folder relative to this skill.

## Setup

If `scripts/token.json` does not exist, run the auth setup first:

```bash
cd .claude/skills/gmail/scripts && node setup_auth.js
```

This opens a browser for Google OAuth. Only needs to run once.

## Scripts

### search_gmail.js

Search for emails using Gmail search syntax. Returns JSON array of message metadata.

```bash
node .claude/skills/gmail/scripts/search_gmail.js <query>
```

**Examples:**
- `node .claude/skills/gmail/scripts/search_gmail.js "in:inbox"` -- Recent inbox messages
- `node .claude/skills/gmail/scripts/search_gmail.js "in:inbox is:unread"` -- Unread inbox
- `node .claude/skills/gmail/scripts/search_gmail.js "from:someone@example.com"` -- From a specific sender
- `node .claude/skills/gmail/scripts/search_gmail.js "subject:invoice"` -- By subject
- `node .claude/skills/gmail/scripts/search_gmail.js "newer_than:1d"` -- Last 24 hours
- `node .claude/skills/gmail/scripts/search_gmail.js "has:attachment"` -- With attachments

Set `MAX_RESULTS` env var to control result count (default: 20).

### read_email.js

Read the full content of a specific email or thread.

```bash
# Single message
node .claude/skills/gmail/scripts/read_email.js <messageId>

# Full thread
node .claude/skills/gmail/scripts/read_email.js --thread <threadId>
```

Use message/thread IDs from search_gmail.js results.

### send_email.js

Send an email or reply to a thread. Accepts JSON via stdin or a JSON file path.

```bash
# New email
echo '{"to":"someone@example.com","subject":"Hello","body":"Message here"}' | node .claude/skills/gmail/scripts/send_email.js

# Reply to thread (include threadId and In-Reply-To header)
echo '{"to":"someone@example.com","subject":"Re: Hello","body":"Reply here","threadId":"abc123","inReplyTo":"<msgid@mail.gmail.com>"}' | node .claude/skills/gmail/scripts/send_email.js
```

**Required fields:** to, subject, body
**Optional fields:** cc, inReplyTo, references, threadId

## Workflow

1. **Check inbox:** Search with `in:inbox` or `in:inbox is:unread`
2. **Read details:** Use `read_email.js` with the message ID from search results
3. **Reply:** Use `send_email.js` with the threadId and inReplyTo from the original message
4. **Always confirm with Eric before sending any email**

## Important

- Always ask Eric for confirmation before sending emails
- The `from` address is always `eric.lefler@ophidianai.com`
- Credentials and tokens are in `scripts/` -- never commit these to git
