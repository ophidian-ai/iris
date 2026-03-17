# Meta Developer App Setup -- Handoff Doc

**Date:** 2026-03-17
**Status:** Blocked on access verification approval (submitted, up to 5 business days)

---

## What Was Done

### Meta Developer Portal

- **App created:** "OphidianAI Social Manager" (App ID: `4412193162439676`)
- **App Secret:** `758a2cde7c14581aafd16f75a97c7199`
- **Business verification:** Complete (OphidianAI verified)
- **Access verification (Tech Provider):** Submitted, under review

### Use Cases Configured (5 total)

1. **Manage messaging & content on Instagram**
   - Permissions: `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments`, `instagram_business_content_publish`, `instagram_business_manage_insights`, `instagram_manage_messages`
   - Instagram Business Login configured with redirect URL
   - Instagram webhooks configured and verified
   - Test account connected: `ophidianai` (IG ID: `17841466559697941`)

2. **Manage everything on your Page**
   - Facebook Login for Business configured
   - Pages webhooks configured and verified
   - Test Page connected: OphidianAI (Page ID: `635587472960991`, tasks: ADVERTISE, ANALYZE, CREATE_CONTENT, MESSAGING, MODERATE, MANAGE)

3. **Create & manage ads with Marketing API**
   - Permission: `pages_manage_ads`
   - Ad account connected: `act_1027684662505174`

4. **Measure ad performance data with Marketing API**
   - Permissions: `ads_read`, `read_insights`

5. **Engage with customers on Messenger from Meta**
   - Configured with messaging permissions

### Additional Permissions Added

- `threads_business_basic` -- for future Threads integration

### Vercel Environment Variables Set

- `META_APP_ID` = `4412193162439676`
- `META_APP_SECRET` = `758a2cde7c14581aafd16f75a97c7199`
- `META_WEBHOOK_VERIFY_TOKEN` = `ophidianai_webhook_verify_2026`

### Files Created/Modified in `engineering/projects/ophidian-ai`

**API Endpoints (all deployed and verified working):**
- `src/app/api/meta/callback/route.ts` (126 lines) -- OAuth code exchange
- `src/app/api/meta/data-deletion/route.ts` (120 lines) -- GDPR data deletion requests
- `src/app/api/meta/deauthorize/route.ts` (89 lines) -- Deauthorize callback
- `src/app/api/meta/webhooks/instagram/route.ts` (58 lines) -- IG webhook verification + events
- `src/app/api/meta/webhooks/pages/route.ts` (55 lines) -- FB Pages webhook verification + events

**Dashboard:**
- `src/app/dashboard/social/page.tsx` (731 lines) -- Social media management dashboard with:
  - "Connect to Meta" button (Meta branding/colors)
  - Connected accounts display (FB Pages + IG accounts)
  - Post composer (text + media, publish to FB and/or IG)
  - Recent posts view with engagement metrics
  - Account stats (followers, posts, engagement)

**Legal Pages Updated:**
- `src/app/privacy/page.tsx` -- Added Meta platform data handling sections
- `src/app/terms/page.tsx` -- Added social media management service terms

**Other:**
- Fixed all references from `ophidian-ai.vercel.app` to `ophidianai.com` across codebase
- Meta API routes excluded from Supabase auth middleware

### Commits (oldest to newest)

```
abbc5a7 feat: add Meta platform compliance (privacy, terms, API endpoints)
0dbd5e6 fix: replace old vercel URL with ophidianai.com domain
951cfa4 feat: add Instagram webhooks endpoint for Meta verification
325c4b0 fix: exclude Meta API routes from Supabase middleware
08854e0 debug: return verbose error info for webhook troubleshooting
57d913b chore: trigger redeploy for env var change
1cd38ec feat: add Facebook Pages webhooks endpoint
bcbf297 chore: remove debug logging from Instagram webhook endpoint
b664efd feat: add Social Media dashboard page for Meta App Review screencasts
```

### Graph API Tests Completed

All run in Graph API Explorer with app token:
- `me` -- returned Eric's profile
- `me/accounts` -- returned OphidianAI Page with all 6 task permissions
- `me/adaccounts` -- returned ad account `act_1027684662505174`
- `me/accounts?fields=instagram_business_account{id,username}` -- returned `ophidianai` IG account
- `17841466559697941?fields=id,username,media_count,followers_count` -- returned IG account details (51 followers, 4 posts)

---

## What's Blocking

**Access verification approval** -- submitted as Tech Provider, takes up to 5 business days. This must be approved before App Review can be submitted.

---

## Next Steps (in order)

### 1. Check Access Verification Status
- Check the Meta Developer Dashboard for approval status during morning coffee
- Once approved, proceed to step 2

### 2. Record Screencasts for App Review
- The `/dashboard/social` page was built specifically for this purpose
- Need screencast videos demonstrating each permission in use:
  - **Instagram content publishing:** Connect IG account via OAuth, compose a post, publish to Instagram
  - **Instagram messaging:** Show message inbox, respond to a DM
  - **Instagram comments:** Show comments on posts, respond to a comment
  - **Instagram insights:** Show follower/engagement metrics
  - **Pages management:** Connect FB Page, publish a post, view insights
  - **Pages messaging (Messenger):** Show Messenger inbox, respond to a message
  - **Ads management:** Show ad account, create/view a campaign
  - **Ads insights:** Show ad performance metrics
- Each screencast: 30-90 seconds, showing the full user flow (login -> action -> result)
- Must show real UI, not just API Explorer calls

### 3. Submit App Review
- Go to Meta Developer Dashboard > App Review
- For each permission requiring Advanced Access, attach the screencast + written description
- Submit -- takes 5-10 business days

### 4. Go Live
- Once App Review is approved, toggle app from Development to Live mode
- This enables any business (not just testers) to connect their accounts

---

## Important Notes

- The social dashboard is a **demo/review UI** -- it uses mock data and simulated API calls right now. The OAuth flow is real (callback endpoint exchanges codes for tokens) but there's no database persistence for tokens yet. That comes after App Review approval.
- The Instagram tester invitation only shows up on the **desktop web** version of Instagram (`instagram.com/accounts/manage_access/`), not the mobile app.
- Use cases 1 and 2 (Instagram + Pages content management) cannot be combined with use case 3 (standalone Facebook Login) on the same app. That's why we'll create a second app ("OphidianAI Connect") later if standalone Facebook Login is needed.
- The webhook verify token is `ophidianai_webhook_verify_2026` -- hardcoded in the route files and set as a Vercel env var.

---

## OAuth Authorization URL (for reference)

```
https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=4412193162439676&redirect_uri=https://ophidianai.com/api/meta/callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights
```

## Key IDs

| Resource | ID |
|---|---|
| Meta App ID | `4412193162439676` |
| Facebook Page | `635587472960991` |
| Instagram Account | `17841466559697941` |
| Instagram Username | `ophidianai` |
| Ad Account | `act_1027684662505174` |
| Payment Card (last 4) | `7331` |
