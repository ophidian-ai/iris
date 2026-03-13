---
name: calendar-sync
description: Sync deadlines, milestones, follow-ups, and tasks to Google Calendar. Runs automatically during morning coffee and on-demand via /calendar-sync or "Commit this to my calendar".
---

# Calendar Sync

Pulls deadlines from all business data sources and creates/updates Google Calendar events. Prevents duplicates by checking for existing events before creating new ones.

## Invocation

- `/calendar-sync` -- full sync from all sources
- `Commit this to my calendar` -- user provides context for a single new event

## Event Prefix

All managed events use the prefix `[OAI]` in the summary so they can be identified and deduplicated:

- `[OAI] Milestone: Client review and feedback`
- `[OAI] Follow-up: Columbus Massage Center`
- `[OAI] Deadline: Deploy to production`
- `[OAI] Task: <task name>`

## Full Sync Process

### Step 1: Gather Data (parallel)

**Supabase -- Project milestones:**
```sql
SELECT p.name AS project_name, c.company_name AS client_name,
       pm.title AS milestone_title, pm.due_date, pm.completed_at
FROM projects p
JOIN clients c ON c.id = p.client_id
JOIN project_milestones pm ON pm.project_id = p.id
WHERE p.status IN ('active', 'launched')
  AND pm.completed_at IS NULL
  AND pm.due_date IS NOT NULL
ORDER BY pm.due_date ASC;
```

**Prospect pipeline -- Follow-up dates:**
```bash
gws sheets +read --spreadsheet '1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0' --range 'Pipeline' --format json
```
Extract follow-up dates (FU1, FU2, FU3) for prospects in active statuses (Outreach Sent, Follow-Up Sent, Replied, Offer Delivered, SEO Audit Delivered, Meeting Scheduled, Proposal Sent). Skip prospects in Closed Won, Closed Lost, Inactive, New Lead, or Researching.

**Google Calendar -- Existing [OAI] events:**
```bash
gws calendar events list --params '{"calendarId":"primary","timeMin":"<today>T00:00:00-05:00","timeMax":"<4-weeks-out>T23:59:59-05:00","singleEvents":true,"q":"[OAI]","maxResults":100}'
```

**ClickUp -- Tasks with due dates (if available):**
```bash
node .claude/skills/clickup/scripts/clickup.js tasks 901711710045
```
Extract tasks with due dates. If ClickUp token is missing, skip silently.

### Step 2: Deduplicate

For each potential calendar event, check if an `[OAI]` event with the same summary already exists in the date range from Step 1.

- **Match found, same date:** Skip (already synced).
- **Match found, different date:** Update the existing event with the new date.
- **No match:** Create a new event.

### Step 3: Create/Update Events

**Milestone events** (all-day events on the due date):
```bash
gws calendar events insert --params '{"calendarId":"primary"}' --json '{"summary":"[OAI] Milestone: <title>","description":"Project: <project_name> | Client: <client_name>","start":{"date":"<due_date>"},"end":{"date":"<due_date_plus_1>"},"reminders":{"useDefault":false,"overrides":[{"method":"popup","minutes":1440}]}}'
```

**Follow-up events** (9:00 AM - 9:30 AM on the follow-up date):
```bash
gws calendar events insert --params '{"calendarId":"primary"}' --json '{"summary":"[OAI] Follow-up: <business_name>","description":"Contact: <contact_name> | Email: <email> | Status: <status>","start":{"dateTime":"<date>T09:00:00-05:00","timeZone":"America/New_York"},"end":{"dateTime":"<date>T09:30:00-05:00","timeZone":"America/New_York"},"reminders":{"useDefault":false,"overrides":[{"method":"popup","minutes":60}]}}'
```

**Deadline events** (all-day, for project estimated_completion):
```bash
gws calendar events insert --params '{"calendarId":"primary"}' --json '{"summary":"[OAI] Deadline: <project_name> delivery","description":"Client: <client_name>","start":{"date":"<date>"},"end":{"date":"<date_plus_1>"},"reminders":{"useDefault":false,"overrides":[{"method":"popup","minutes":4320}]}}'
```

**Task events** (all-day on due date):
```bash
gws calendar events insert --params '{"calendarId":"primary"}' --json '{"summary":"[OAI] Task: <task_name>","description":"From ClickUp","start":{"date":"<due_date>"},"end":{"date":"<due_date_plus_1>"}}'
```

**Updating existing events:**
```bash
gws calendar events patch --params '{"calendarId":"primary","eventId":"<eventId>"}' --json '{"start":{"date":"<new_date>"},"end":{"date":"<new_date_plus_1>"}}'
```

### Step 4: Cleanup

Remove `[OAI]` events whose source data no longer exists:
- Milestones that have been completed (completed_at is set)
- Prospects that moved to Closed Lost or Inactive
- Tasks that were completed

```bash
gws calendar events delete --params '{"calendarId":"primary","eventId":"<eventId>"}'
```

### Step 5: Summary

Print what was synced:

```
Calendar Sync Complete
  Created: X events
  Updated: X events
  Removed: X events (completed/closed)
  Skipped: X events (already current)
```

## Ad-Hoc Entry ("Commit this to my calendar")

When Eric says "Commit this to my calendar" followed by context:

1. Parse the context for: date/time, title, description, duration
2. If date/time is missing, ask
3. If it's a business item (milestone, follow-up, deadline), use the `[OAI]` prefix
4. If it's a personal item, create without the prefix
5. Create the event:
```bash
gws calendar +insert --summary '<title>' --start '<datetime>' --end '<end_datetime>' --description '<description>'
```
6. Confirm: "Added to your calendar: <title> on <date> at <time>"

## Sunday Weekly Planning

On Sundays (detected by date during morning coffee), run the full sync AND review the upcoming week for items Eric may have forgotten or excluded:

1. **Inbox scan for calendar-worthy emails:**
   ```bash
   gws gmail +triage --query "in:inbox newer_than:7d (meeting OR call OR appointment OR deadline OR event OR schedule OR conference OR webinar OR demo OR RSVP OR invite)" --format json
   ```
   Read each matching email. Extract any dates, times, and event details. Flag emails that contain information about events not yet on the calendar.

2. Cross-reference all data sources (milestones, follow-ups, ClickUp tasks, inbox events) against the calendar for the next 7 days
3. Flag any items that SHOULD be on the calendar but aren't -- things like:
   - Upcoming milestones or deadlines with no corresponding event
   - Overdue follow-ups that were never scheduled
   - Prospect meetings or proposals that imply a next step
   - Events mentioned in emails (meetings, calls, webinars, deadlines)
4. Only suggest adding items that are clearly relevant and actionable -- don't pad the calendar
5. Present suggestions to Eric for approval before adding:
```
Sunday calendar review -- 2 items not on your calendar:
  1. [OAI] Follow-up: Point of Hope Church (due 3/19, no event found)
  2. [OAI] Milestone: Client review and feedback (due 3/25)
Add these? (y/n or pick specific items)
```

## Integration with Morning Coffee

Morning coffee calls this skill after Step 1 data gathering. The calendar sync uses the same Supabase and pipeline data already fetched -- no duplicate queries needed.

Add to morning coffee terminal summary:
```
Calendar: X events synced | X upcoming this week
```

## Important

- Always use Eastern timezone (`America/New_York`, `-05:00` EST or `-04:00` EDT)
- Follow-up events default to 9:00 AM unless specified otherwise
- Milestone/deadline events are all-day
- The `[OAI]` prefix is sacred -- never create managed events without it, never add it to personal events
- If GWS auth fails, skip calendar sync silently and note it in the terminal summary
- Past-due items: still create/keep the event (it shows as overdue in the calendar)
