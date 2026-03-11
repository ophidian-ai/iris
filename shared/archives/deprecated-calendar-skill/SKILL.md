---
name: google-calendar
description: View, create, update, and delete Google Calendar events for eric.lefler@ophidianai.com
---

# Google Calendar

Access Eric's Google Calendar. Scripts are in the `scripts/` folder relative to this skill.

Uses shared Google OAuth credentials from the Gmail skill. If auth fails, re-run:
```bash
node .claude/skills/gmail/scripts/setup_auth.js
```

## Scripts

All scripts require the `googleapis` package installed in `.claude/skills/gmail/scripts/node_modules/`.

### list_events.js

List calendar events for a day or date range. Returns JSON array.

```bash
# Today's events
node .claude/skills/google-calendar/scripts/list_events.js

# Specific date
node .claude/skills/google-calendar/scripts/list_events.js 2026-03-06

# Date range
node .claude/skills/google-calendar/scripts/list_events.js 2026-03-06 2026-03-10
```

Set `MAX_RESULTS` env var to control result count (default: 20).

### create_event.js

Create a new calendar event. Accepts JSON via stdin or file path.

```bash
# Timed event
echo '{"summary":"Client call","start":"2026-03-07T10:00:00","end":"2026-03-07T11:00:00"}' | node .claude/skills/google-calendar/scripts/create_event.js

# All-day event
echo '{"summary":"Project deadline","start":"2026-03-10","end":"2026-03-11","allDay":true}' | node .claude/skills/google-calendar/scripts/create_event.js

# With attendees and location
echo '{"summary":"Meeting","start":"2026-03-07T14:00:00","end":"2026-03-07T15:00:00","location":"Zoom","attendees":["client@example.com"],"sendInvites":true}' | node .claude/skills/google-calendar/scripts/create_event.js
```

**Required fields:** summary, start, end
**Optional fields:** description, location, attendees (array of emails), allDay, timeZone (default: America/New_York), recurrence (array of RRULE strings), sendInvites, reminders

### manage_event.js

Update or delete existing events.

```bash
# Update an event
echo '{"summary":"Updated title","start":"2026-03-07T11:00:00","end":"2026-03-07T12:00:00"}' | node .claude/skills/google-calendar/scripts/manage_event.js update <eventId>

# Delete an event
node .claude/skills/google-calendar/scripts/manage_event.js delete <eventId>
```

Use event IDs from list_events.js results.

## Workflow

1. **Daily rundown:** Run `list_events.js` with no args for today's schedule
2. **Weekly view:** Run with a date range for the week ahead
3. **Schedule meeting:** Use `create_event.js` with time, attendees, and location
4. **Reschedule:** Use `manage_event.js update` with new times
5. **Cancel:** Use `manage_event.js delete`

## Important

- Default timezone is America/New_York (Eastern)
- Always confirm with Eric before creating, updating, or deleting events
- Use ISO 8601 format for dates/times (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)
