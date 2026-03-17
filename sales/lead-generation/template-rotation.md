# Cold Email Template Rotation

Track which templates are used to ensure even rotation and optimize for reply rates.

## Active Templates

### CI1 -- 3 Creative Ideas (Default, 67% of sends)

| Template | Variant | Last Used | Times Used | Replies | Reply Rate | Last Prospect | Niche | City |
|----------|---------|-----------|------------|---------|------------|---------------|-------|------|
| CI1      | Default | --        | 0          | 0       | 0%         | --            | --    | --   |

### ALT -- One Sharp Insight (A/B Test, 33% of sends)

| Template | Variant | Last Used | Times Used | Replies | Reply Rate | Last Prospect | Niche | City |
|----------|---------|-----------|------------|---------|------------|---------------|-------|------|
| ALT      | Test    | --        | 0          | 0       | 0%         | --            | --    | --   |

## A/B Testing Protocol

- CI1 is assigned to 2 out of every 3 prospects (67%)
- ALT is assigned to every 3rd prospect (33%)
- After 30 total sends (20 CI1 + 10 ALT), compare reply rates
- If one template significantly outperforms (2x+ reply rate), promote it to 100% and create a new challenger
- If performance is similar, continue the split for another 30 sends
- Track by niche and city to identify if a template works better for specific industries or locations

## Performance Summary

| Variant | Total Sent | Total Replies | Reply Rate | Best Niche | Best City |
|---------|------------|---------------|------------|------------|-----------|
| CI1     | 0          | 0             | 0%         | --         | --        |
| ALT     | 0          | 0             | 0%         | --         | --        |

## Rules

- Always pick the least-recently-used variant (CI1 or ALT based on the 67/33 rotation)
- Never send the same template to two prospects in the same batch
- Update this table every time a cold email is sent (automated via outreach-sheets.js `updateTemplateRotation()`)
- When a reply is received, increment the Replies column and recalculate Reply Rate
- Update the Performance Summary after any change
- If either template reaches 15+ sends with 0 replies, flag for review/replacement

---

## Legacy Templates (Retired from First-Touch)

These templates are retired from first-touch use. Their angles are preserved for use as follow-up material (FU2-FU4 angles).

### Website Templates (Retired)

| Template | Times Used | Replies | Reply Rate | Notes |
|----------|------------|---------|------------|-------|
| W1       | 3          | 0       | 0%         | "Your site is turning people away" |
| W2       | 3          | 0       | 0%         | "You're losing customers on mobile" |
| W3       | 3          | 0       | 0%         | "Your business deserves better than this" |
| W4       | 2          | 0       | 0%         | "Customers can't find what they need" |

### SEO Templates (Retired)

| Template | Times Used | Replies | Reply Rate | Notes |
|----------|------------|---------|------------|-------|
| S1       | 1          | 0       | 0%         | "You're invisible" |
| S2       | 1          | 0       | 0%         | "Your competitors are getting your calls" |
| S3       | 2          | 0       | 0%         | "Customers are searching but can't find you" |
| S4       | 2          | 0       | 0%         | "Great reputation but nobody can find you" |

### Hybrid Templates (Retired)

| Template | Times Used | Replies | Reply Rate | Notes |
|----------|------------|---------|------------|-------|
| H1       | 2          | 0       | 0%         | "Losing customers two ways" |
| H2       | 1          | 0       | 0%         | "Your competitors look better and show up first" |
| H3       | 1          | 0       | 0%         | "Great business, but nobody can tell online" |
| H4       | 1          | 0       | 0%         | "The customers are there but they can't get to you" |

### Creative Ideas (Migrated to CI1)

| Template | Times Used | Replies | Reply Rate | Notes |
|----------|------------|---------|------------|-------|
| CI1      | 1          | 0       | 0%         | Migrated to new CI1 default format |

### AI Service Templates (Never Used)

| Template | Times Used | Replies | Reply Rate | Notes |
|----------|------------|---------|------------|-------|
| A1-A4    | 0          | 0       | 0%         | Reserved for future AI service outreach |

### Legacy Performance Summary

| Category       | Total Sent | Total Replies | Overall Rate |
|----------------|------------|---------------|--------------|
| Website        | 11         | 0             | 0%           |
| SEO            | 6          | 0             | 0%           |
| Hybrid         | 5          | 0             | 0%           |
| Creative Ideas | 1          | 0             | 0%           |
| AI Services    | 0          | 0             | 0%           |
| **Total**      | **23**     | **0**         | **0%**       |
