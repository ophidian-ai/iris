# Implementation Plan: Fix Cold Email Conversion

**Threat Level:** CRITICAL
**Date:** 2026-03-17
**Target:** Move from 0% reply rate to 5%+ within 2 weeks

---

## Problem Statement

23 cold emails sent across 4 template categories over 11 days with zero replies. This is a systemic failure requiring root cause analysis before any further outreach volume.

---

## Phase 1: Deliverability Audit (Day 1)

### 1.1 Test Inbox Placement
- Send test emails from eric.lefler@ophidianai.com to:
  - Personal Gmail account
  - Personal Outlook/Hotmail account
  - Yahoo account (if available)
- Check inbox, spam, and promotions tabs for each
- Record which folder each lands in

### 1.2 Score Email Health
- Submit eric.lefler@ophidianai.com to mail-tester.com (free, 3 tests/day)
- Check SPF, DKIM, DMARC records pass
- Check spam score and identify specific flags
- Review Warmbox dashboard for recent deliverability metrics

### 1.3 Check Domain Reputation
- Run ophidianai.com through Google Postmaster Tools (if configured)
- Check Sender Score (senderscore.org)
- Verify domain age is sufficient (registered when?)

### 1.4 Decision Gate
- If deliverability score < 7/10: Fix DNS/reputation issues before any further sends
- If deliverability score >= 7/10: Problem is in messaging, proceed to Phase 2

---

## Phase 2: Template Overhaul (Days 2-3)

### 2.1 Audit Current Templates
- Pull all 4 template categories (W1-W4, S1-S4, H1-H4, CI1)
- Evaluate each for:
  - Subject line (is it compelling or generic?)
  - Opening line (personalized or template-feeling?)
  - Value proposition clarity (what's in it for them?)
  - Call-to-action (too aggressive? too vague?)
  - Length (too long for a cold email?)
  - Spam trigger words (free, discount, limited time, etc.)

### 2.2 Rewrite Strategy
- **Subject lines:** Test curiosity-based vs. direct-benefit vs. question-based
  - Bad: "Website Redesign for [Business]"
  - Better: "Quick question about [Business]'s online bookings"
  - Best: "[First name], noticed something about [Business]"
- **Opening:** Reference something specific about their business (not generic)
- **Body:** Max 3-4 sentences. One clear value prop. No attachments or links in first email.
- **CTA:** Soft ask only ("Would it be worth a quick chat?" not "Schedule a call now")
- **Remove unsolicited mockup links from initial outreach** -- save for follow-ups or upon request

### 2.3 Create 2 New Template Variants
- Template A: Ultra-short (2-3 sentences), question-based, no link
- Template B: Specific pain point + social proof (even if it's "I recently helped a local business...")
- A/B test these against the best existing template

---

## Phase 3: Follow-Up Blitz (Days 2-5)

### 3.1 Catch Up on Overdue Follow-Ups
All 15 outreach-sent prospects need follow-ups. Prioritize by:
1. **Immediate (Day 0-1):** Prospects sent 7+ days ago with 0 follow-ups
   - Nano's Car Detailing (3/17)
   - Expressions Ink Tattoo (3/17)
   - Total Fitness (3/17)
   - Voelz Body Shop (3/17)
   - Carriage on the Square (3/16)
   - Platinum Auto Repair (3/16)
   - Don's Tire & Auto (3/16)
   - Glow Aesthetics (3/16)
   - Unwind Head Spa (3/17)
   - Wild Root Salon (3/17)
   - JoCo Fitness (3/17)
   - County Supply Hardware (3/17)
   - Perfect Style Salon (3/17)

2. **Already in sequence:** Columbus Massage Center (FU2 sent), SAK Auto (FU2 sent) -- send FU3 (graceful close) on Day 14

3. **Special handling:** Point of Hope Church -- phone call, not email

### 3.2 Follow-Up Template Refresh
- FU1 (Day 3-4): Short, add new value (e.g., "I ran a quick SEO check on your site...")
- FU2 (Day 7-8): Different angle, social proof or case reference
- FU3 (Day 14): Graceful close ("Totally understand if now isn't the right time...")

---

## Phase 4: Channel Diversification (Week 2+)

### 4.1 In-Person / Network
- Research Columbus Area Chamber of Commerce membership (cost, next events)
- Find local BNI chapters in Columbus/Greensburg area
- Identify local Facebook business groups for Columbus, IN area

### 4.2 Warm Referral Pipeline
- Ask Steve Stock (Point of Hope referrer) if he knows other businesses that need help
- After delivering Bloomin' Acres, ask Christina for referrals
- Create a simple referral incentive ($200 off for both parties)

### 4.3 Social Proof Building
- Post before/after comparisons of mockups vs. current sites on personal LinkedIn
- Share (anonymized) stats about local businesses with broken websites
- Create 1 short-form video walking through a mockup transformation

---

## Success Criteria

| Metric | Current | Week 1 Target | Week 2 Target |
|---|---|---|---|
| Reply rate | 0% | 3%+ | 5%+ |
| Follow-ups executed | 2/15 | 15/15 | All on schedule |
| Deliverability score | Unknown | 8+/10 | 9+/10 |
| Meetings booked | 0 | 1 | 2 |
| Channels active | 1 (cold email) | 2 (+ phone) | 3 (+ networking) |
