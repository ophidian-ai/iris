# Monitoring Setup for New Client Sites

**When:** After initial site deployment to Vercel
**Time required:** ~15 minutes per client

---

## 1. UptimeRobot

1. Log in at [uptimerobot.com](https://uptimerobot.com) (free tier is sufficient)
2. Click "Add New Monitor"
3. Configure:
   - **Monitor type:** HTTP(s)
   - **Friendly name:** `[Client Name] - Main Site`
   - **URL:** `https://clientdomain.com`
   - **Monitoring interval:** 5 minutes
4. Set alert contacts: `eric.lefler@ophidianai.com`
5. Save and verify the first check passes

## 2. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click "Add property"
3. Select **URL prefix** method
4. Enter: `https://clientdomain.com`
5. Verify ownership:
   - **Option A (preferred):** DNS TXT record -- add the provided TXT record to the domain's DNS settings
   - **Option B:** HTML file upload -- download the verification file and add to the site's `public/` directory
6. Once verified:
   - Submit `sitemap.xml` (navigate to Sitemaps, enter `sitemap.xml`, click Submit)
   - Confirm email alerts are enabled for indexing issues (Settings > Email preferences)

## 3. Google Analytics (GA4)

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property:
   - **Property name:** `[Client Name] - Website`
   - **Reporting time zone:** Match client's timezone
   - **Currency:** USD
3. Create a Web data stream:
   - Enter the client's domain URL
   - Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)
4. Add the Measurement ID to the site:
   - For Next.js: use `@next/third-parties` or add the gtag script to `layout.tsx`
   - Deploy the update to Vercel
5. Set up conversion events:
   - Form submissions (contact, booking, etc.)
   - Phone number clicks (`tel:` links)
   - Email clicks (`mailto:` links)
6. Share access with client:
   - Admin > Account Access Management > Add user
   - Enter client's email
   - Role: **Viewer**
