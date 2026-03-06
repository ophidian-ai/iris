# Sales Analytics Proposal

> How to track outreach effectiveness, pipeline velocity, and time-to-close for OphidianAI.

## The Problem

OphidianAI is in early-stage outreach with no historical data. As volume increases, we need to answer:

1. **What's working?** -- Which outreach methods, industries, and lead sources convert?
2. **How fast?** -- How long from first contact to closed deal?
3. **Where's the bottleneck?** -- Are prospects dropping off at a specific stage?

## Recommended Metrics

### Core Pipeline Metrics

| Metric | Definition | How to Track |
|---|---|---|
| **Outreach Volume** | Total cold emails sent per week/month | Count of "Outreach Sent" status changes in prospect-tracker.md |
| **Response Rate** | % of outreach that gets any reply | (Replied + later stages) / Outreach Sent |
| **Meeting Rate** | % of outreach that converts to a meeting | Meeting Scheduled / Outreach Sent |
| **Close Rate** | % of meetings that close | Closed Won / Meeting Scheduled |
| **Pipeline Value** | Sum of Est. Value for all active prospects | Already tracked in morning coffee briefing |
| **Win Rate** | % of total prospects that become clients | Closed Won / (Closed Won + Closed Lost) |

### Velocity Metrics

| Metric | Definition | How to Track |
|---|---|---|
| **Days to First Reply** | Calendar days from outreach to first response | Replied date - Outreach Date |
| **Days to Close** | Calendar days from first outreach to Closed Won | Closed Won date - Outreach Date |
| **Stage Duration** | Average days spent in each pipeline stage | Track stage transition dates |
| **Follow-Up Cadence** | Days between outreach and first follow-up | Follow-Up Date - Outreach Date |

### Source Effectiveness

| Metric | Definition | How to Track |
|---|---|---|
| **Lead Source Conversion** | Which sources (Yelp, Chamber, Google) produce closes | Tag each prospect with source in tracker |
| **Industry Conversion** | Which industries respond and close | Tag each prospect with industry |
| **Outreach Method** | Cold email vs. phone vs. walk-in effectiveness | Tag each prospect with method |

## Implementation Plan

### Phase 1: Add Tracking Fields (Now)

Add these columns to `prospect-tracker.md`:

| New Column | Purpose |
|---|---|
| **Lead Source** | Where we found them (Yelp, Chamber, Google Maps, etc.) |
| **Industry** | Business category (auto services, fitness, food, etc.) |
| **Stage Dates** | Comma-separated dates for each stage transition |
| **Outcome Notes** | Why won/lost (price, timing, no response, competitor, etc.) |

This is lightweight -- just 4 new columns in the existing tracker.

### Phase 2: Monthly Snapshot (When Volume Justifies)

Once we have 10+ prospects in the pipeline, generate a monthly report:

```
Monthly Pipeline Report -- [Month Year]

New leads added: X
Outreach sent: X
Replies received: X (X% response rate)
Meetings scheduled: X
Proposals sent: X
Deals closed: X ($X,XXX total value)
Deals lost: X

Avg days to reply: X
Avg days to close: X

Top lead source: [Source] (X% of replies)
Top industry: [Industry] (X% response rate)
```

This can be automated as part of the morning coffee briefing on the 1st of each month.

### Phase 3: Dashboard (When Revenue Justifies)

Once OphidianAI has consistent revenue and 20+ historical prospects:

- Build a simple analytics dashboard (could be a Notion, Google Sheet, or custom page)
- Track trends over time (response rate improving? close rate stable?)
- Identify seasonality or patterns
- Forecast pipeline based on historical conversion rates

**Not needed now.** Phase 1 is sufficient for the current stage.

## What NOT to Build Yet

- CRM software -- overkill for a solo operation with <20 prospects
- Automated email sequences -- manual outreach with Iris is more personal and effective at this stage
- Complex dashboards -- the morning coffee briefing already covers daily pipeline health
- A/B testing infrastructure -- not enough volume to be statistically meaningful

## Immediate Action Items

1. Add `Lead Source` and `Industry` columns to prospect-tracker.md
2. Retroactively tag existing prospects with source and industry
3. Start logging stage transition dates when prospects move stages
4. After 10+ prospects, generate first monthly report
5. Revisit this proposal when first client closes to assess what data is actually useful

## Cost

Zero. This is all tracked in markdown files that already exist. No new tools, no subscriptions, no development needed.
