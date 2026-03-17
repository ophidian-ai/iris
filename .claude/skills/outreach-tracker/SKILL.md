---
name: outreach-tracker
description: Manage prospect data across 3 Google Sheets (Pipeline, Failed Outreach, Successful Outreach). Use when any skill needs to read/write prospect status, move prospects between sheets, check follow-up schedules, or run optimization queries. All sheet operations go through this skill.
---

# Outreach Tracker

Single interface for all outreach data operations across 3 Google Sheets via the shared `outreach-sheets.js` module.

**Spreadsheet ID:** `1FJOPS3ABR2BQtFOn4cUAGLZzIYukKbPozK_t_m7Dwg0`

**Module path:** `operations/automation/scripts/outreach-sheets.js`

## Sheets

| Sheet | Purpose |
|---|---|
| Pipeline | Active prospects in outreach sequence |
| Failed Outreach | Completed sequences with no conversion |
| Successful Outreach | Closed deals |

## Commands

All commands use `node -e` with the shared module. Run from the repo root.

### 1. Read pipeline status

Get all active prospects:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); console.log(JSON.stringify(s.readAllRows('Pipeline'), null, 2));"
```

Filter by status:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const rows = s.getProspectsWhere('Pipeline', r => r['Status'] === 'Sent'); console.log(JSON.stringify(rows, null, 2));"
```

### 2. Update prospect fields

Update any column(s) for a prospect by business name:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.updateProspect('Pipeline', 'Business Name Here', {'Status': 'Replied', 'Reply Date': '2026-03-17', 'Reply Touch': 'FU2', 'Reply Type': 'Interested'});"
```

### 3. Move prospect to Failed Outreach

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.moveProspect('Pipeline', 'Failed Outreach', 'Business Name Here', {'Failure Reason': 'No Reply', 'Touches Sent': '6', 'First-Touch Date': '2026-02-20', 'Last Touch Date': '2026-03-17', 'Days in Sequence': '25'});"
```

### 4. Move prospect to Successful Outreach

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.moveProspect('Pipeline', 'Successful Outreach', 'Business Name Here', {'Deal Value': '1500', 'Service Type': 'Website', 'Reply Date': '2026-03-05', 'Meeting Date': '2026-03-10', 'Proposal Sent Date': '2026-03-12', 'Proposal Accepted Date': '2026-03-15', 'Days: First Touch to Reply': '5', 'Days: Reply to Accepted': '10', 'Days: First Touch to Accepted': '15', 'Template That Converted': 'W2'});"
```

### 5. Get follow-ups due today

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const today = new Date().toISOString().split('T')[0]; const due = s.getProspectsWhere('Pipeline', r => r['FU1 Date'] === today || r['FU2 Date'] === today || r['FU3 Date'] === today || r['FU4 Date'] === today || r['Breakup Date'] === today); console.log(JSON.stringify(due, null, 2)); console.log(due.length + ' follow-ups due today');"
```

### 6. Get follow-ups due this week

```bash
node -e "
const s = require('./operations/automation/scripts/outreach-sheets.js');
const now = new Date();
const day = now.getDay();
const monday = new Date(now); monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
const mon = monday.toISOString().split('T')[0];
const fri = friday.toISOString().split('T')[0];
const inRange = d => d >= mon && d <= fri;
const due = s.getProspectsWhere('Pipeline', r =>
  inRange(r['FU1 Date']) || inRange(r['FU2 Date']) || inRange(r['FU3 Date']) ||
  inRange(r['FU4 Date']) || inRange(r['Breakup Date'])
);
console.log(JSON.stringify(due, null, 2));
console.log(due.length + ' follow-ups due this week (' + mon + ' to ' + fri + ')');
"
```

### 7. Get re-engagement eligible

Query Failed Outreach where re-engagement date has passed:

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const today = new Date().toISOString().split('T')[0]; const eligible = s.getProspectsWhere('Failed Outreach', r => r['Re-engagement Eligible'] && r['Re-engagement Eligible'] <= today); console.log(JSON.stringify(eligible, null, 2)); console.log(eligible.length + ' prospects eligible for re-engagement');"
```

### 8. Recalculate follow-up dates

From a confirmed send date. Cadence: FU1 = Day 3, FU2 = Day 7, FU3 = Day 12, FU4 = Day 18, Breakup = Day 25. Weekend dates shift to Monday.

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); const dates = s.recalcFollowUpDates('Business Name Here', '2026-03-17'); console.log(JSON.stringify(dates, null, 2));"
```

### 9. Update template rotation

After sending (increments Times Used):

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.updateTemplateRotation('W2', 'Business Name Here', 'Restaurant', 'Columbus');"
```

After receiving a reply (increments Replies):

```bash
node -e "const s = require('./operations/automation/scripts/outreach-sheets.js'); s.updateTemplateRotation('W2', 'Business Name Here', 'Restaurant', 'Columbus', true);"
```

### 10. Optimization queries

**Best template by reply rate:**

```bash
node -e "
const s = require('./operations/automation/scripts/outreach-sheets.js');
const all = s.readAllRows('Pipeline').concat(s.readAllRows('Failed Outreach')).concat(s.readAllRows('Successful Outreach'));
const stats = {};
for (const r of all) {
  const t = r['First-Touch Template']; if (!t) continue;
  if (!stats[t]) stats[t] = {sent: 0, replies: 0};
  stats[t].sent++;
  if (r['Reply Date'] || r['Which Touch Got Reply']) stats[t].replies++;
}
const ranked = Object.entries(stats).map(([t, s]) => ({template: t, sent: s.sent, replies: s.replies, rate: s.sent > 0 ? (s.replies/s.sent*100).toFixed(1)+'%' : '0%'})).sort((a,b) => parseFloat(b.rate)-parseFloat(a.rate));
console.table(ranked);
"
```

**Best follow-up touch for conversions:**

```bash
node -e "
const s = require('./operations/automation/scripts/outreach-sheets.js');
const success = s.readAllRows('Successful Outreach');
const touches = {};
for (const r of success) {
  const t = r['Which Touch Got Reply'] || 'Unknown';
  touches[t] = (touches[t] || 0) + 1;
}
console.table(touches);
"
```

**Best industry/niche:**

```bash
node -e "
const s = require('./operations/automation/scripts/outreach-sheets.js');
const all = s.readAllRows('Pipeline').concat(s.readAllRows('Failed Outreach')).concat(s.readAllRows('Successful Outreach'));
const stats = {};
for (const r of all) {
  const ind = r['Industry'] || r['Niche'] || 'Unknown'; if (!ind) continue;
  if (!stats[ind]) stats[ind] = {total: 0, replies: 0, deals: 0};
  stats[ind].total++;
}
for (const r of s.readAllRows('Pipeline')) { const ind = r['Industry'] || 'Unknown'; if (stats[ind] && r['Reply Date']) stats[ind].replies++; }
for (const r of s.readAllRows('Successful Outreach')) { const ind = r['Industry'] || 'Unknown'; if (stats[ind]) { stats[ind].replies++; stats[ind].deals++; } }
const ranked = Object.entries(stats).map(([i, s]) => ({industry: i, total: s.total, replies: s.replies, deals: s.deals, replyRate: s.total > 0 ? (s.replies/s.total*100).toFixed(1)+'%' : '0%'})).sort((a,b) => b.deals - a.deals || parseFloat(b.replyRate) - parseFloat(a.replyRate));
console.table(ranked);
"
```

**Best city:**

```bash
node -e "
const s = require('./operations/automation/scripts/outreach-sheets.js');
const all = s.readAllRows('Pipeline').concat(s.readAllRows('Failed Outreach')).concat(s.readAllRows('Successful Outreach'));
const stats = {};
for (const r of all) {
  const city = r['Location'] || r['City'] || 'Unknown';
  if (!stats[city]) stats[city] = {total: 0, deals: 0};
  stats[city].total++;
}
for (const r of s.readAllRows('Successful Outreach')) { const city = r['City'] || 'Unknown'; if (stats[city]) stats[city].deals++; }
const ranked = Object.entries(stats).map(([c, s]) => ({city: c, total: s.total, deals: s.deals, convRate: s.total > 0 ? (s.deals/s.total*100).toFixed(1)+'%' : '0%'})).sort((a,b) => b.deals - a.deals);
console.table(ranked);
"
```

**Average time-to-reply:**

```bash
node -e "
const s = require('./operations/automation/scripts/outreach-sheets.js');
const success = s.readAllRows('Successful Outreach');
const pipeline = s.getProspectsWhere('Pipeline', r => r['Time to Reply (hours)']);
const all = [...success, ...pipeline].filter(r => r['Time to Reply (hours)']);
if (all.length === 0) { console.log('No reply data yet'); process.exit(); }
const hours = all.map(r => parseFloat(r['Time to Reply (hours)'])).filter(h => !isNaN(h));
const avg = hours.reduce((a,b) => a+b, 0) / hours.length;
const median = hours.sort((a,b) => a-b)[Math.floor(hours.length/2)];
console.log('Average time to reply: ' + avg.toFixed(1) + ' hours (' + (avg/24).toFixed(1) + ' days)');
console.log('Median time to reply: ' + median.toFixed(1) + ' hours (' + (median/24).toFixed(1) + ' days)');
console.log('Sample size: ' + hours.length);
"
```

**Funnel conversion rates (sent -> reply -> meeting -> proposal -> accepted):**

```bash
node -e "
const s = require('./operations/automation/scripts/outreach-sheets.js');
const pipeline = s.readAllRows('Pipeline');
const failed = s.readAllRows('Failed Outreach');
const success = s.readAllRows('Successful Outreach');
const sent = pipeline.length + failed.length + success.length;
const replied = pipeline.filter(r => r['Reply Date']).length + failed.filter(r => r['Which Touch Got Reply']).length + success.length;
const meetings = success.filter(r => r['Meeting Date']).length;
const proposals = success.filter(r => r['Proposal Sent Date']).length;
const accepted = success.filter(r => r['Proposal Accepted Date']).length;
const pct = (n, d) => d > 0 ? (n/d*100).toFixed(1)+'%' : '0%';
console.log('Funnel Conversion Rates:');
console.log('  Sent:      ' + sent);
console.log('  Replied:   ' + replied + ' (' + pct(replied, sent) + ' of sent)');
console.log('  Meetings:  ' + meetings + ' (' + pct(meetings, replied) + ' of replied)');
console.log('  Proposals: ' + proposals + ' (' + pct(proposals, meetings) + ' of meetings)');
console.log('  Accepted:  ' + accepted + ' (' + pct(accepted, proposals) + ' of proposals)');
console.log('  Overall:   ' + pct(accepted, sent) + ' (sent to accepted)');
"
```

## Important Notes

- ALL sheet operations across all skills must go through this skill or the `outreach-sheets.js` module directly.
- Never hardcode column letters -- always use column names via the module's API (`updateProspect`, `addProspect`, etc.).
- The module handles GWS CLI calls internally; do not call `gws sheets` directly for outreach data.
- Column schemas are defined in the module as `PIPELINE_COLS`, `FAILED_COLS`, and `SUCCESSFUL_COLS`.
- Follow-up cadence: FU1 = Day 3, FU2 = Day 7, FU3 = Day 12, FU4 = Day 18, Breakup = Day 25.
- Weekend dates automatically shift to Monday.

## Module API Reference

| Function | Description |
|---|---|
| `readAllRows(sheetName)` | Read all rows as array of objects |
| `readSheet(sheetName, range?)` | Read raw cell values |
| `findRowByBusiness(sheetName, name)` | Find row by business name (case-insensitive) |
| `updateProspect(sheetName, name, updates)` | Update multiple columns by business name |
| `addProspect(sheetName, rowData)` | Append a new row |
| `moveProspect(from, to, name, extraData?)` | Move prospect between sheets |
| `recalcFollowUpDates(name, sendDate)` | Recalculate all FU dates from send date |
| `getProspectsWhere(sheetName, filterFn)` | Query rows matching a filter |
| `updateTemplateRotation(template, prospect, niche, city, replied?)` | Update template rotation tracker |
| `updateCell(sheetName, rowIndex, colName, value)` | Update a single cell |
