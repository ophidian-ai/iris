# Prospect Mockup Generator

Generate a pitch website mockup for a prospect based on their business info and a design reference. Outputs a single-file HTML page ready to screenshot or demo.

## When to Use

When you have a prospect researched and want to quickly generate a visual mockup of what their website could look like. This replaces manually building mockups from scratch for each prospect.

## Inputs

- **Prospect name** -- Business name
- **Industry** -- What they do (auto shop, salon, restaurant, fitness, etc.)
- **Location** -- City, state
- **Services/products** -- What they offer (scraped from current site or research)
- **Brand colors** (optional) -- Extract from current site or logo. If unavailable, choose appropriate colors for the industry.
- **Current site URL** (optional) -- For scraping real content (services, hours, phone, address)
- **Design reference** (optional) -- URL from godly.website, dribbble, or similar. If not provided, use a clean modern design appropriate for the industry.

## Process

### Step 1: Gather Content

If a current site URL is provided:
1. Use Firecrawl to scrape the prospect's current site
2. Extract: business name, services, hours, phone, address, any about/mission text
3. Note their current brand colors and logo (if findable)

If no URL, use whatever info is available from the prospect's research folder at `revenue/lead-generation/prospects/<name>/research/`.

### Step 2: Get Design Inspiration

If a design reference URL is provided:
1. Use Firecrawl to scrape the reference site
2. Note the layout patterns, typography choices, color usage, and component structure

If no reference, use a clean, modern single-page design appropriate for the industry:
- **Auto/trades:** Bold, dark, strong typography
- **Health/wellness:** Soft colors, elegant serif + sans-serif pairing, calming
- **Restaurants:** Warm tones, appetizing imagery placeholders, menu focus
- **Professional services:** Clean, minimal, trust-focused
- **Retail:** Product-forward, grid layouts, browsable
- **General local business:** Clean, approachable, phone number prominent

### Step 3: Build the Mockup

Create a single-file HTML page (`index.html`) with:

- **All CSS inline** (single file, no external dependencies except Google Fonts)
- **Mobile-first responsive design**
- **Sections:** Hero with CTA, Services/What We Do, About/Why Us, Contact/Location
- **Real content** from the prospect's business (not lorem ipsum)
- **Placeholder images** using CSS gradients or solid color blocks (no external image URLs that will break)
- **Modern design patterns:** scroll animations (CSS-only), hover effects, clean typography
- **Prominent phone number and address** (local businesses care about calls)
- **Footer** with business info

### Step 4: Save and Screenshot

1. Save the mockup to `revenue/lead-generation/prospects/<name>/mockup/index.html`
2. Use Playwright to take a full-page screenshot: `revenue/lead-generation/prospects/<name>/mockup/screenshot.png`
3. Also take a hero-section-only screenshot (viewport height): `revenue/lead-generation/prospects/<name>/mockup/screenshot-hero.png`

## Output

Report to Eric:
- Path to the mockup HTML file
- Path to screenshots
- Brief notes on design decisions made
- Any content gaps (things that would need client input for a real build)

## Rules

- Use the prospect's **real business info** -- never use placeholder names or fake services
- If brand colors aren't available, choose industry-appropriate colors and note this
- Keep it to a single page with 4-5 sections max -- this is a pitch, not a full build
- Design quality matters -- this is the first thing a prospect sees from us
- Don't include OphidianAI branding on the mockup -- it should look like their future site
- The mockup should look noticeably better than their current site
