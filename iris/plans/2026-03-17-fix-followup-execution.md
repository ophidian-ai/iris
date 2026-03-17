# Implementation Plan: Fix Follow-Up Execution Gap

**Threat Level:** HIGH
**Date:** 2026-03-17
**Target:** 100% follow-up coverage within 48 hours

---

## Problem Statement

Only 2 of 15 outreach-sent prospects have received follow-ups (13% completion). The 3-touch follow-up system was built and automated but is not being consistently executed. 13 prospects are sitting with zero follow-ups, 7-11 days after initial contact.

---

## Phase 1: Immediate Catch-Up (Day 1)

### 1.1 Triage All 15 Prospects by Days Since Initial Contact

| Prospect | Outreach Date | Days Elapsed | Follow-Ups Sent | Next Action |
|---|---|---|---|---|
| Columbus Massage Center | 3/6 | 11 | FU2 (3/17) | FU3 graceful close on 3/20 |
| SAK Automotive | 3/6 | 11 | FU2 (3/17) | FU3 graceful close on 3/20 |
| Point of Hope Church | 3/11 | 6 | 0 | Phone call (warm lead, special handling) |
| Carriage on the Square | 3/16 | 1 | 0 | FU1 on 3/19-20 |
| Platinum Auto Repair | 3/16 | 1 | 0 | FU1 on 3/19-20 |
| Don's Tire & Auto | 3/16 | 1 | 0 | FU1 on 3/19-20 |
| Glow Aesthetics | 3/16 | 1 | 0 | FU1 on 3/19-20 |
| Nano's Car Detailing | 3/17 | 0 | 0 | FU1 on 3/20-21 |
| Expressions Ink Tattoo | 3/17 | 0 | 0 | FU1 on 3/20-21 |
| Total Fitness | 3/17 | 0 | 0 | FU1 on 3/20-21 |
| Voelz Body Shop | 3/17 | 0 | 0 | FU1 on 3/20-21 |
| Unwind Head Spa | 3/17 | 0 | 0 | FU1 on 3/20-21 |
| Wild Root Salon | 3/17 | 0 | 0 | FU1 on 3/20-21 |
| JoCo Fitness | 3/17 | 0 | 0 | FU1 on 3/20-21 |
| County Supply Hardware | 3/17 | 0 | 0 | FU1 on 3/20-21 |
| Perfect Style Salon | 3/17 | 0 | 0 | FU1 on 3/20-21 |

### 1.2 Batch FU1 Drafts
- Run `/follow-up-email` for the 3/16 batch (4 prospects): Carriage on the Square, Platinum Auto, Don's Tire, Glow Aesthetics
- Stage as Gmail drafts
- Send on 3/19 (Day 3 from initial contact)

### 1.3 Schedule FU1 for 3/17 Batch
- These were just sent today -- schedule FU1 for 3/20-21
- Add to calendar as reminders

---

## Phase 2: Systematize Follow-Up Tracking (Days 1-2)

### 2.1 Add Follow-Up Tracking to Morning Coffee
- Morning briefing should flag: "X prospects are overdue for follow-up"
- Define "overdue" as: Days since last contact > follow-up schedule threshold
  - FU1 overdue: 4+ days since initial, 0 follow-ups
  - FU2 overdue: 8+ days since initial, 1 follow-up
  - FU3 overdue: 14+ days since initial, 2 follow-ups

### 2.2 Update Prospect Tracker Automation
- Add "Last Follow-Up Date" and "Follow-Up Count" columns to Google Sheet tracker
- When morning coffee runs, calculate which prospects need follow-ups today
- Output as action items in the briefing

### 2.3 Batch Processing
- Process all follow-ups for a given day in a single batch
- Use the follow-up-email skill to draft all at once
- Stage all as drafts, review, send in one session
- Target: Follow-up processing takes < 30 minutes per batch

---

## Phase 3: Follow-Up Template Quality (Days 2-3)

### 3.1 Refresh FU Templates
Current follow-up templates may be too similar to initial outreach. Ensure each touch adds new value:

- **FU1 (Day 3-4):** Add new information they didn't get in the initial email
  - "I ran a quick check on your site and noticed [specific issue]..."
  - "A customer searching for [their service] in [their city] right now would see [competitor] first because..."

- **FU2 (Day 7-8):** Different angle entirely
  - If initial was about website, FU2 is about a specific business opportunity
  - "I noticed your [booking/menu/reviews] aren't showing up in Google -- here's what that costs you..."

- **FU3 (Day 14):** Graceful close with open door
  - "I know you're busy running [business]. Just wanted to let you know the offer stands whenever the timing is right."
  - No pressure, no urgency -- this is relationship preservation

### 3.2 Remove Generic Follow-Ups
- No "just checking in" or "wanted to follow up on my last email"
- Every follow-up must contain a NEW piece of value or information
- If you can't add value, don't send it

---

## Phase 4: Calendar Integration (Day 2)

### 4.1 Auto-Schedule Follow-Up Reminders
When an outreach email is sent, automatically create calendar events:
- FU1: +3 days
- FU2: +7 days
- FU3: +14 days

### 4.2 Implementation
- Modify the `stage_email.js` or cold-email-outreach skill to create calendar events alongside drafts
- Use gws calendar +insert for each follow-up date
- Include prospect name and follow-up number in event title

---

## Success Criteria

| Metric | Current | Day 2 Target | Day 7 Target |
|---|---|---|---|
| Follow-up coverage | 13% (2/15) | 30% (FU1 for 3/16 batch) | 100% (all on schedule) |
| Overdue follow-ups | 13 | 4 | 0 |
| Morning coffee flags | Not tracking | Tracking | Automated |
| Follow-up processing time | Ad hoc | < 30 min/batch | < 30 min/batch |
