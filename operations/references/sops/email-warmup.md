# Email Warmup SOP

## Why Warmup Matters

Cold emails from a new or low-reputation domain land in spam. Email warmup builds sender reputation by gradually increasing send volume with automated positive interactions (opens, replies, moves to inbox) from a network of real accounts.

## Recommended Tool

**Warmbox Solo** -- $15/mo for 1 inbox

- Cheapest standalone warmup tool that works
- Good network size for the price
- Simple setup, no outreach platform lock-in

**Alternative:** If we decide to move to a dedicated cold email platform later, **Instantly** ($30/mo) bundles warmup + outreach + unlimited warmup accounts. Better value if sending at scale.

## Setup Checklist

1. Sign up for Warmbox (or chosen tool)
2. Connect `eric.lefler@ophidianai.com` (or dedicated outreach address)
3. Configure warmup settings:
   - Start with 5-10 warmup emails/day
   - Ramp up to 30-40/day over 2-3 weeks
   - Set reply rate to 30-40%
4. Let warmup run for **minimum 14 days** before sending any cold outreach
5. Keep warmup running continuously -- don't pause it when sending campaigns

## Dedicated Outreach Domain (Recommended)

To protect the primary domain's reputation:

1. Register a secondary domain (e.g., `getophidian.com` or `ophidianai.co`)
2. Set up Google Workspace on the secondary domain ($6/mo)
3. Configure DNS: SPF, DKIM, DMARC records
4. Warm up the secondary domain inbox
5. Use primary domain (`ophidianai.com`) only for replies and ongoing client communication

**Total cost:** ~$21/mo (Warmbox $15 + Workspace $6) or ~$36/mo with Instantly

## DNS Authentication (Required Either Way)

Verify these records exist for whichever domain sends cold emails:

- **SPF** -- Authorizes sending servers
- **DKIM** -- Cryptographic signature proving email authenticity
- **DMARC** -- Policy for handling failed authentication

Check current status: [Google Admin Toolbox](https://toolbox.googleapps.com/apps/checkmx/)

## Monitoring

- Check warmup dashboard weekly for inbox placement rate
- Target: 95%+ inbox placement before starting cold outreach
- If placement drops below 90%, pause cold outreach and investigate

## When to Start Cold Outreach

All of these must be true:
- [ ] Warmup has been running for 14+ days
- [ ] Inbox placement rate is 95%+
- [ ] DNS records (SPF, DKIM, DMARC) are verified
- [ ] Start with 5-10 cold emails/day, ramp up gradually
- [ ] Never exceed 50 cold emails/day from a single inbox
