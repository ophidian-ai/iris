---
name: gws-cli
description: Google Workspace CLI -- Gmail, Calendar, Sheets, Drive, Docs access for eric.lefler@ophidianai.com. Use when any skill or task needs to read/send email, check calendar, read/write spreadsheets, upload to Drive, or access Google Docs/Tasks. This is the foundational tool for all Google Workspace operations.
---

# GWS CLI

Access all Google Workspace APIs via the `gws` command-line tool. Authenticated as `eric.lefler@ophidianai.com`.

Credentials: `~/.config/gws/credentials.json` (plain OAuth2, no setup needed).

## Gmail

### Search / Triage

```bash
# Unread inbox summary (sender, subject, date, snippet)
gws gmail +triage --query "in:inbox is:unread" --format json

# Custom search
gws gmail +triage --query "<gmail-search-query>" --max 20 --format json

# Raw message list (returns IDs only, use for bulk operations)
gws gmail users messages list --params '{"userId":"me","q":"<query>","maxResults":20}'
```

Gmail search operators: `in:inbox`, `is:unread`, `from:`, `to:`, `subject:`, `newer_than:1d`, `has:attachment`, `after:YYYY/MM/DD`, `before:YYYY/MM/DD`.

### Read

```bash
# Single message (full content)
gws gmail users messages get --params '{"userId":"me","id":"<messageId>","format":"full"}'

# Metadata only (headers: From, To, Subject, Date)
gws gmail users messages get --params '{"userId":"me","id":"<messageId>","format":"metadata","metadataHeaders":["From","To","Subject","Date"]}'

# Full thread
gws gmail users threads get --params '{"userId":"me","id":"<threadId>","format":"full"}'
```

### Send (Plain Text)

```bash
gws gmail +send --to someone@example.com --subject 'Subject here' --body 'Message body'
```

### Reply

```bash
# Reply to sender only
gws gmail +reply --message-id <messageId> --body 'Reply text'

# Reply all
gws gmail +reply-all --message-id <messageId> --body 'Reply text'

# Reply with CC
gws gmail +reply --message-id <messageId> --body 'Reply text' --cc other@example.com

# Reply from Iris address
gws gmail +reply --message-id <messageId> --body 'Reply text' --from iris@ophidianai.com
```

### Forward

```bash
gws gmail +forward --message-id <messageId> --to recipient@example.com --body 'FYI see below'
```

### Send (HTML / Attachments)

For HTML emails or emails with attachments, use the MIME builder helper:

```bash
# HTML email (no attachments)
echo '{"to":"someone@example.com","subject":"Hello","html":"<h1>Hello</h1><p>World</p>"}' \
  | node .claude/skills/gws-cli/scripts/build_raw_email.js \
  | gws gmail users messages send --params '{"userId":"me"}' --json @-

# HTML email with attachment
echo '{"to":"someone@example.com","subject":"Proposal","html":"<p>See attached.</p>","attachments":[{"path":"path/to/file.pdf","filename":"proposal.pdf","mimeType":"application/pdf"}]}' \
  | node .claude/skills/gws-cli/scripts/build_raw_email.js \
  | gws gmail users messages send --params '{"userId":"me"}' --json @-

# Reply in thread (HTML)
echo '{"to":"someone@example.com","subject":"Re: Topic","html":"<p>Reply</p>","threadId":"abc123","inReplyTo":"<msgid@mail.gmail.com>"}' \
  | node .claude/skills/gws-cli/scripts/build_raw_email.js \
  | gws gmail users messages send --params '{"userId":"me"}' --json @-

# Send from Iris address
echo '{"to":"someone@example.com","from":"Iris <iris@ophidianai.com>","subject":"Hello","body":"Plain text"}' \
  | node .claude/skills/gws-cli/scripts/build_raw_email.js \
  | gws gmail users messages send --params '{"userId":"me"}' --json @-
```

**Input fields for build_raw_email.js:**

- `to` (required) -- recipient email
- `subject` (required) -- email subject
- `body` or `html` (required) -- plain text or HTML content
- `from` -- sender address (default: account default)
- `cc` -- CC recipients
- `attachments` -- array of `{path, filename, mimeType}`
- `threadId` -- Gmail thread ID (for replies)
- `inReplyTo` -- Message-ID header of the message being replied to
- `references` -- References header for threading

### Drafts

```bash
# List drafts
gws gmail users drafts list --params '{"userId":"me","maxResults":20}'

# Get a specific draft
gws gmail users drafts get --params '{"userId":"me","id":"<draftId>","format":"full"}'

# Create a draft (raw MIME)
echo '{"message":{"raw":"<base64url>"}}' | gws gmail users drafts create --params '{"userId":"me"}' --json @-

# Send an existing draft
gws gmail users drafts send --params '{"userId":"me"}' --json '{"id":"<draftId>"}'

# Delete a draft (permanent, not trash)
gws gmail users drafts delete --params '{"userId":"me","id":"<draftId>"}'
```

### Cold Email Staging

Helper scripts for batch cold email staging and sending:

```bash
# Stage an email as a Gmail draft (adds to manifest)
echo '{"to":"x@y.com","subject":"Hi","body":"Hello","prospect":"business-name","template":"W1"}' \
  | node .claude/skills/gws-cli/scripts/stage_email.js

# List all staged emails
node .claude/skills/gws-cli/scripts/send_staged.js --list

# Preview what would be sent (dry run)
node .claude/skills/gws-cli/scripts/send_staged.js --dry-run

# Send all staged emails (5min spacing between sends)
node .claude/skills/gws-cli/scripts/send_staged.js

# Send with custom spacing (in seconds)
node .claude/skills/gws-cli/scripts/send_staged.js --spacing 180
```

Staging manifest: `sales/lead-generation/staged-emails.json`

### Check Prospect Replies

No dedicated command. Use a search loop:

```bash
# Check if a specific prospect has replied
gws gmail users messages list --params '{"userId":"me","q":"from:prospect@example.com after:2026/03/01","maxResults":5}'

# Check multiple prospects (bash loop)
for email in "dana@example.com" "info@business.com"; do
  echo "--- $email ---"
  gws gmail users messages list --params "{\"userId\":\"me\",\"q\":\"from:$email newer_than:7d\",\"maxResults\":5}"
done
```

## Calendar

### View Events

```bash
# Today's agenda
gws calendar +agenda --today --format json

# Tomorrow
gws calendar +agenda --tomorrow --format json

# Next N days
gws calendar +agenda --days 3 --format json

# This week
gws calendar +agenda --week --format json

# Specific calendar only
gws calendar +agenda --today --calendar 'Work' --format json

# Raw API (custom date range)
gws calendar events list --params '{"calendarId":"primary","timeMin":"2026-03-10T00:00:00-05:00","timeMax":"2026-03-12T00:00:00-05:00","singleEvents":true,"orderBy":"startTime"}'
```

### Create Event

```bash
# Basic event
gws calendar +insert --summary 'Client call' --start '2026-03-10T10:00:00-05:00' --end '2026-03-10T11:00:00-05:00'

# With location and attendees
gws calendar +insert --summary 'Meeting' --start '2026-03-10T14:00:00-05:00' --end '2026-03-10T15:00:00-05:00' --location 'Zoom' --attendee client@example.com

# With description
gws calendar +insert --summary 'Review' --start '2026-03-10T09:00:00-05:00' --end '2026-03-10T09:30:00-05:00' --description 'Weekly project review'

# All-day event (raw API)
gws calendar events insert --params '{"calendarId":"primary"}' --json '{"summary":"Deadline","start":{"date":"2026-03-15"},"end":{"date":"2026-03-16"}}'
```

### Update Event

```bash
gws calendar events patch --params '{"calendarId":"primary","eventId":"<eventId>"}' --json '{"summary":"New title","start":{"dateTime":"2026-03-10T11:00:00-05:00","timeZone":"America/New_York"},"end":{"dateTime":"2026-03-10T12:00:00-05:00","timeZone":"America/New_York"}}'
```

### Delete Event

```bash
gws calendar events delete --params '{"calendarId":"primary","eventId":"<eventId>"}'
```

## Sheets

### Read

```bash
# Read a range
gws sheets +read --spreadsheet '<spreadsheetId>' --range 'Sheet1!A1:D10' --format json

# Read entire sheet
gws sheets +read --spreadsheet '<spreadsheetId>' --range 'Sheet1' --format json

# Table format (human-readable)
gws sheets +read --spreadsheet '<spreadsheetId>' --range 'Sheet1' --format table
```

### Append Row

```bash
# Simple values
gws sheets +append --spreadsheet '<spreadsheetId>' --values '2026-03-10,Vendor,Category,29.99,Credit Card,Notes'

# JSON values (single row)
gws sheets +append --spreadsheet '<spreadsheetId>' --json-values '[["2026-03-10","Vendor","Category","29.99","Credit Card","Notes"]]'

# Multiple rows
gws sheets +append --spreadsheet '<spreadsheetId>' --json-values '[["row1col1","row1col2"],["row2col1","row2col2"]]'
```

### Update Cell

```bash
gws sheets spreadsheets values update --params '{"spreadsheetId":"<id>","range":"Sheet1!A1","valueInputOption":"USER_ENTERED"}' --json '{"values":[["new value"]]}'
```

## Drive

### Upload

```bash
# Upload a file
gws drive +upload ./report.pdf

# Upload to a specific folder
gws drive +upload ./report.pdf --parent '<folderId>'

# Upload with custom name
gws drive +upload ./data.csv --name 'Sales Data.csv'
```

### List Files

```bash
# Recent files
gws drive files list --params '{"pageSize":10,"orderBy":"modifiedTime desc","fields":"files(id,name,mimeType,modifiedTime)"}'

# Search by name
gws drive files list --params '{"q":"name contains '\''report'\''","fields":"files(id,name,mimeType)"}'
```

## Docs (Reference)

```bash
# Get document content
gws docs documents get --params '{"documentId":"<docId>"}'
```

## Tasks (Reference)

```bash
# List task lists
gws tasks tasklists list

# List tasks in a list
gws tasks tasks list --params '{"tasklist":"<tasklistId>"}'

# Create task
gws tasks tasks insert --params '{"tasklist":"<tasklistId>"}' --json '{"title":"Task name","due":"2026-03-15T00:00:00Z"}'
```

## Important

- Always confirm with Eric before sending emails
- Default timezone: America/New_York (Eastern) -- use `-05:00` (EST) or `-04:00` (EDT)
- Eric's email: `eric.lefler@ophidianai.com`
- Iris email: `iris@ophidianai.com`
- Check the `from` field on previous sent messages in a thread to match the right sender
