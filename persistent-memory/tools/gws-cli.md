---
tags:
  - memory
  - tool
triggers:
  - gmail
  - calendar
  - google sheets
  - send email
  - gws
  - workspace
  - expense
created: 2026-03-10
updated: 2026-03-10
---

# GWS CLI

- **Tool:** `gws` command-line tool for Google Workspace APIs
- **Auth:** Plain OAuth2 credentials at `~/.config/gws/credentials.json` (OS Keyring is broken, bypassed with manual OAuth flow)
- **Skill:** `.claude/skills/gws-cli/SKILL.md` (consolidated, replaces old `gmail` and `google-calendar` skills)
- **MIME helper:** `.claude/skills/gws-cli/scripts/build_raw_email.js` (no googleapis dependency, just MIME construction)
- **Expense Sheet:** Google Sheets ID `1pnf3ZUbBdWlTit_u69_S82t5Fg9gshQ2ja1yLrzrhbo`
- **Enabled APIs:** Gmail, Calendar, Drive, Sheets, Docs, Slides, Tasks, Pub/Sub
- **GCP Project:** `graceful-mile-489811-u2`
- **Old skills archived:** `shared/archives/deprecated-gmail-skill/`, `shared/archives/deprecated-calendar-skill/`

## Related

- `operations/email-rules.md`
- `operations/prospect-pipeline.md`
- `operations/outreach-system.md`
