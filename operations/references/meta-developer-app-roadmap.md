# Meta Developer App Setup & Verification Roadmap

**Purpose:** Enable OphidianAI to publish content (posts, reels, stories) to Facebook Pages and Instagram Professional accounts on behalf of clients via the Meta Graph API.

**Last updated:** 2026-03-16

---

## Overview

Since OphidianAI is a **Tech Provider** serving multiple businesses (not just your own accounts), you need:

1. A Meta Developer account
2. A Meta App (Business type)
3. A verified Meta Business Portfolio
4. Advanced Access permissions (requires App Review)
5. Page Publishing Authorization (PPA) per client Page

This is not a quick process. Expect 2-4 weeks end-to-end, primarily due to Business Verification and App Review timelines.

---

## Phase 1: Prerequisites (Before You Touch Meta)

### 1.1 Prepare Your Business Identity Documents

Meta Business Verification requires proving OphidianAI is a legitimate business. Have these ready:

- **Business registration documents** -- Articles of Organization, business license, or state registration (Indiana Secretary of State filing for OphidianAI)
- **EIN letter** from the IRS (if you have one), or your SSN-based sole proprietor filing
- **Utility bill or bank statement** showing the business name and address (for address verification)
- **Business phone number** -- Must be able to receive a verification code via call or SMS
- **Business email** -- `eric.lefler@ophidianai.com` (already set up)
- **Business website** -- Must be live and match the business name. `ophidianai.com` must be deployed.

### 1.2 Prepare Your App Infrastructure

You need a few things live before App Review:

- [ ] **Privacy Policy URL** -- A publicly accessible page (e.g., `ophidianai.com/privacy`) covering:
  - What data you collect from users
  - How you use Facebook/Instagram data
  - How users can request data deletion
  - GDPR/CCPA compliance language
- [ ] **Terms of Service URL** -- A publicly accessible page (e.g., `ophidianai.com/terms`)
- [ ] **Data Deletion Callback URL** -- An endpoint on your server that Meta calls when a user requests data deletion (e.g., `ophidianai.com/api/meta/data-deletion`)
- [ ] **Deauthorize Callback URL** -- An endpoint Meta calls when a user removes your app (e.g., `ophidianai.com/api/meta/deauthorize`)
- [ ] **OAuth Redirect URI** -- Where Meta sends users after login (e.g., `ophidianai.com/api/meta/callback`)

### 1.3 Set Up Client-Side Requirements

Each client who wants you to post on their behalf needs:

- An **Instagram Professional account** (Business or Creator) -- not a personal account
- Their Instagram account **linked to a Facebook Page**
- The client must grant your app permissions via the OAuth login flow

---

## Phase 2: Create Meta Developer Account & Business Portfolio

### 2.1 Register as a Meta Developer

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Log in with your personal Facebook account
3. Click **Get Started** and accept the Developer Agreement
4. Verify your account (phone number or email)
5. You now have a Meta Developer account

### 2.2 Create a Meta Business Portfolio (if you don't have one)

1. Go to [business.facebook.com](https://business.facebook.com/)
2. Click **Create Account**
3. Enter:
   - Business name: **OphidianAI**
   - Your name: **Eric Lefler**
   - Business email: **eric.lefler@ophidianai.com**
4. Complete the setup wizard

---

## Phase 3: Create the Meta App

### 3.1 Create the App

1. Go to the [App Dashboard](https://developers.facebook.com/apps)
2. Click **Create App**
3. Select use case: **Other**
4. Select app type: **Business**
5. Enter app details:
   - **App Name:** OphidianAI Social Manager (or similar -- this shows in the permissions dialog)
   - **Contact Email:** eric.lefler@ophidianai.com
6. Click **Create App**

**Note:** You can have a max of 15 apps without a verified business. Not a concern right now.

### 3.2 Connect the App to Your Business Portfolio

1. In the App Dashboard, go to **App Settings > Basic**
2. Under **Verification**, click **Start Verification** or **+ Business Verification**
3. Select your OphidianAI Business Portfolio (or create one if prompted)
4. Save

### 3.3 Add Required Products to the App

#### For Instagram:
1. In the App Dashboard left sidebar, click **Add Product**
2. Find **Instagram** and click **Set up**
3. This adds both "API setup with Instagram Login" and "API setup with Facebook Login"
4. Choose **API setup with Facebook Login** (better for managing client accounts as a tech provider)

#### For Facebook Pages:
1. In the App Dashboard left sidebar, click **Add Product**
2. Find **Facebook Login for Business** and click **Set up**
3. Configure your OAuth redirect URIs, deauthorize callback, and data deletion request URLs

### 3.4 Configure App Settings

In **App Settings > Basic**, fill in:

- **App Domains:** `ophidianai.com`
- **Privacy Policy URL:** `https://ophidianai.com/privacy`
- **Terms of Service URL:** `https://ophidianai.com/terms`
- **App Icon:** Upload the OphidianAI logo (1024x1024, PNG)
- **Category:** Business and Pages

---

## Phase 4: Business Verification

This is the gate. You cannot get Advanced Access without it.

### 4.1 Start Verification

1. Go to [Security Center in Meta Business Suite](https://business.facebook.com/latest/settings/security_center)
2. Click **Start Verification**
3. If it says "Ineligible for verification," your business portfolio may need more activity first

### 4.2 Provide Business Details

1. **Legal business name:** OphidianAI (as registered)
2. **Business address:** Your Columbus, IN address
3. **Business phone number:** Your business phone
4. **Business website:** `ophidianai.com`

### 4.3 Upload Verification Documents

Meta accepts (one or more):

- Business license or registration certificate
- Articles of Incorporation / Organization
- Tax filing (EIN confirmation letter)
- Utility bill with business name and address

### 4.4 Verify Your Connection to the Business

Meta will send a verification code to confirm you represent the business. Options:

- **Phone call** to your listed business number
- **SMS** to your listed business number
- **Email** to a publicly listed email for your domain
- **Domain verification** (add a DNS TXT record or meta tag to `ophidianai.com`)

**Domain verification is the most reliable option.** Add the meta tag or DNS record Meta provides.

### 4.5 Wait for Approval

- Typical timeline: **1-5 business days**
- Can take longer if documents need additional review
- Check status in Security Center

---

## Phase 5: Configure Permissions & Test in Development Mode

While waiting for Business Verification, you can build and test.

### 5.1 Permissions You Need

**For Facebook Page posting:**

| Permission | Purpose |
|---|---|
| `pages_manage_posts` | Create and publish posts on Pages |
| `pages_read_engagement` | Read Page data and engagement |
| `pages_show_list` | List Pages the user manages |
| `pages_manage_metadata` | Manage Page settings |
| `pages_read_user_content` | Read user-generated content on Pages |

**For Instagram posting:**

| Permission | Purpose |
|---|---|
| `instagram_basic` | Read Instagram profile and media |
| `instagram_content_publish` | Publish photos, videos, reels, stories |
| `instagram_manage_comments` | Read and respond to comments |
| `instagram_manage_insights` | Read engagement metrics |
| `pages_read_engagement` | Required alongside Instagram permissions |

**Alternative (Instagram API with Instagram Login):**

| Permission | Purpose |
|---|---|
| `instagram_business_basic` | Read profile and media |
| `instagram_business_content_publish` | Publish content |
| `instagram_business_manage_comments` | Manage comments |

### 5.2 Test in Development Mode

In Development Mode, you can test with accounts that have a role on your app (admin, developer, tester):

1. Add your own Facebook/Instagram accounts as test users
2. Go to **App Roles > Roles** in the App Dashboard
3. Add yourself as an Admin (already done) or add test accounts
4. Use the **Graph API Explorer** to test API calls:
   - Get Page access tokens: `GET /me/accounts`
   - Test posting: `POST /{page-id}/feed?message=Test post`
   - Test Instagram container creation: `POST /{ig-user-id}/media?image_url=...`
5. Make at least **1 successful API call** per permission (required for App Review)

### 5.3 Generate Long-Lived Tokens

For testing:

1. In Graph API Explorer, generate a User Access Token with needed permissions
2. Exchange it for a long-lived token (60-day expiry):
   ```
   GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}
   ```
3. Get Page Access Tokens (these never expire if derived from a long-lived user token):
   ```
   GET /me/accounts?access_token={long-lived-user-token}
   ```

---

## Phase 6: App Review Submission

### 6.1 Before You Submit

Confirm you have:

- [ ] Business Verification completed (green checkmark in Security Center)
- [ ] At least 1 successful API call per requested permission
- [ ] Privacy Policy URL live and accessible
- [ ] Terms of Service URL live and accessible
- [ ] Data Deletion Callback endpoint functional
- [ ] A working demo of your app/integration (can be a simple web UI or video)

### 6.2 Prepare Your Submission

For each permission you request, you need:

1. **Description** of how your app uses that permission (be specific)
2. **Screencast video** (screen recording) showing:
   - The login flow (user granting permissions)
   - How your app uses that specific permission
   - The end-to-end user experience
3. **Step-by-step instructions** for Meta reviewers to test your app

### 6.3 Submit for App Review

1. In the App Dashboard, go to **App Review > Requests**
2. Click **Request Permissions or Features**
3. Select each permission you need and click **Add** for each
4. For each permission:
   - Answer "How will your app use this permission?"
   - Upload your screencast video
   - Agree to the usage guidelines
5. Provide reviewer login credentials and step-by-step testing instructions
6. Click **Submit for Review**

### 6.4 Common Rejection Reasons (Avoid These)

- **Vague descriptions** -- "We use this to post content" is not enough. Be specific: "Our app allows small business owners to schedule and publish social media posts to their Facebook Page and Instagram account. When a user clicks 'Publish,' we use the pages_manage_posts permission to create the post via the Graph API."
- **Missing screencast** -- Every permission needs a video demo
- **Requesting permissions you don't use** -- Only request what you actually need
- **Privacy policy doesn't mention Facebook/Instagram data** -- Your policy must specifically address Meta platform data
- **App doesn't work** -- Reviewers will test your app. It must be functional.
- **No data deletion flow** -- You must have a working data deletion callback

### 6.5 Wait for Review

- Typical timeline: **5-10 business days**
- You may receive requests for additional information
- Check status in **App Review > Requests**
- If rejected, you can resubmit after addressing the feedback

---

## Phase 7: Go Live

### 7.1 Switch to Live Mode

Once App Review is approved:

1. In the App Dashboard, toggle the app from **Development** to **Live** mode
2. Your app can now request permissions from any Facebook/Instagram user (not just test accounts)

### 7.2 Client Onboarding Flow

For each new client:

1. Client visits your OAuth login URL
2. They log in with Facebook and grant the requested permissions
3. Your app receives an authorization code
4. Exchange the code for an access token
5. Store the token securely (encrypted at rest)
6. Use the token to post on their behalf

### 7.3 Page Publishing Authorization (PPA)

Some Facebook Pages require PPA before you can publish to them. There's no way to check programmatically -- advise all clients to complete PPA:

1. Client goes to their Facebook Page Settings
2. Navigate to the PPA section
3. Complete identity verification (usually ID upload)
4. This is a one-time per-Page requirement

### 7.4 Content Publishing Limits

- **Instagram:** 100 API-published posts per account per 24-hour rolling window (carousels count as 1)
- **Facebook Pages:** 200 posts per hour per Page (practical limit is much lower for organic content)
- **Rate limiting:** Monitor `x-app-usage` and `x-business-use-case-usage` headers in API responses

---

## Phase 8: Production Considerations

### 8.1 Token Management

- User access tokens expire after 60 days (long-lived)
- Page access tokens derived from long-lived user tokens **never expire**
- Build a token refresh flow: prompt users to re-authenticate before expiry
- Store tokens encrypted, never in plaintext

### 8.2 Supported Content Types

**Instagram:**
- Single image (JPEG only)
- Single video / Reel
- Carousel (up to 10 images/videos)
- Stories
- No filters, no shopping tags, no branded content tags via API

**Facebook Pages:**
- Text posts
- Link posts
- Photo posts
- Video posts
- No Stories via API (use separate Stories API)

### 8.3 Media Requirements

- Images must be hosted on a **publicly accessible URL** at time of publishing (Meta curls the URL)
- Videos must meet Instagram's format requirements (MP4, H.264, AAC audio)
- Instagram publishing is a **two-step process**: create container, then publish container
- Check container status before publishing (video processing can take time)

### 8.4 Webhooks (Optional but Recommended)

Subscribe to webhooks for:
- Comment notifications
- Message notifications
- Page post engagement
- This enables real-time monitoring of client accounts

---

## Quick Reference: Key URLs

| Resource | URL |
|---|---|
| App Dashboard | `https://developers.facebook.com/apps` |
| Graph API Explorer | `https://developers.facebook.com/tools/explorer` |
| Business Suite Security Center | `https://business.facebook.com/latest/settings/security_center` |
| Instagram Content Publishing Docs | `https://developers.facebook.com/docs/instagram-platform/content-publishing/` |
| Pages API Docs | `https://developers.facebook.com/docs/pages-api/getting-started` |
| App Review Best Practices | `https://developers.facebook.com/docs/app-review/submission-guide` |
| Permissions Reference | `https://developers.facebook.com/docs/permissions/reference` |
| Business Verification Docs | `https://developers.facebook.com/docs/development/release/business-verification/` |

---

## Estimated Timeline

| Phase | Duration | Depends On |
|---|---|---|
| Phase 1: Prerequisites | 1-3 days | Privacy policy, ToS, endpoints built |
| Phase 2: Developer Account & Business | 1 hour | -- |
| Phase 3: Create App | 1-2 hours | -- |
| Phase 4: Business Verification | 1-5 business days | Documents ready |
| Phase 5: Development & Testing | 2-5 days | App created |
| Phase 6: App Review | 5-10 business days | Business verified, app functional |
| Phase 7: Go Live | Same day | App Review approved |
| **Total** | **~2-4 weeks** | |

---

## Decision Points for OphidianAI

1. **Instagram Login vs. Facebook Login:** Facebook Login gives you access to both Facebook Pages API and Instagram API in one flow. Instagram Login is simpler but only covers Instagram. **Recommendation:** Use Facebook Login for Business -- it covers both platforms.

2. **Build vs. Use a Platform:** You could use a third-party platform (like Ayrshare, SocialBee API, or Buffer's API) that already has Meta approval, and white-label it. This skips the entire verification/review process. **Trade-off:** Monthly cost vs. weeks of setup and ongoing token management.

3. **Scope of Initial Submission:** Start with just publishing permissions. Add comments, insights, and messaging in a follow-up review once approved. Smaller scope = faster approval.
