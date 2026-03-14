# AI Website Building Workflow

> Extracted from 5 Claude Code and AI website building transcripts. Updated March 2026.
> **Purpose:** Reference for OphidianAI's website build process using Claude Code, Figma MCP, and AI asset generation.

---

## Prompt Engineering for Website Builds

### Three-Part Structure
1. **Overall purpose** + stylistic guidelines + reference images
2. **Design elements and effects** to replicate (e.g., "in the style of Vercel")
3. **Design-specific changes** and design system rules

### One-Shot Design Philosophy
- Aim for 90-95% correct on first generation
- Continuous reconstitution wastes time (gets stuck in loops)
- Use best practices markdown file as context for Claude Code
- Ask Claude Code for optimized prompt, then paste that optimized prompt back in

### Context Amplification
- Upload entire website HTML structure as reference
- Provide design inspiration (screenshots, mood boards)
- Include best practices documents as context
- Reference existing client websites for style matching
- Specify target audience state (cold traffic, warm, outbound)

---

## Figma MCP Bidirectional Workflow

### Mode-Based Approach
- **Code mode** (Claude Code): Quick iteration, experimentation, testing interactions
- **Design mode** (Figma): Exploring layouts, tweaking visuals, annotating, collaborative refinement
- Mode shifts (minutes/hours in one mode), not constant back-and-forth

### Setup
1. Install Figma plugin in Claude Code (`/plugin` command)
2. Authenticate with Figma OAuth
3. Share dev mode link for plugin access
4. MCP server enables remote connection

### Code Connect
- Connect Figma design components to code components
- Eliminates manual slicing/guessing styles
- Creates bidirectional design-to-code sync
- Custom design rules for codebase

---

## Visual Asset Generation

### 3-Clip Video Pattern
1. Identify transition points in scroll animation
2. Create start frame and end frame for each clip (6 frames for 3 clips)
3. Generate images with Nano Banana 2 (superior quality)
4. Generate animation in Claude 3.0 / Kling at 1080p, 5-second segments
5. Compose clips in CapCut (free video editor)
6. Export at 1080p, 60fps

### Quality Requirements
- Image quality: minimum 2K (1K = "AI slop")
- Format: 16:9 (horizontal for web)
- Background: clean white (nothing touches edges)
- Video iterations: 4+ variations, pick the best
- Always reference previous images for style consistency

### Prompt Generation Strategy
- Use LLM to generate all start/end frame prompts
- Generate animation prompts separately
- Include specific brand identity (logo, colors)

---

## Website Structure for High Conversion

1. **Hook** -- Grab attention (frustration hook or offer hook)
2. **Promise of Value** -- Value proposition clearly stated
3. **Value Details** -- 2-3 sections expanding on the promise
4. **Proof/Credibility** -- Logos, testimonials, success stories, videos
5. **Detailed Explanation** -- How it works (process flow)
6. **CTA** -- Clear next step
7. **Follow-up Sequences** -- Email/SMS automation (minimum 5 emails)
8. **Chatbot/Agent Integration** -- AI conversational interface

---

## AI Integration Patterns

### ElevenLabs Chatbot Integration
1. Create agent in ElevenLabs (choose industry, goal)
2. Configure personality and voice
3. Add knowledge base (documents, policies)
4. Set up tools (transfer to agent, capture emails, book calls)
5. Copy embed code (HTML widget)
6. Ask Claude to embed widget in website
7. Connect webhook to GoHighLevel for automation

### Form-to-CRM Workflow (GoHighLevel)
1. Create questionnaire (4-5 questions max: name, email, industry metrics)
2. Generate webhook address in GoHighLevel
3. Embed webhook URL in website form
4. Configure automation: add fields, set up 5+ email sequences, enable SMS
5. Contacts automatically created and triggered

### Questionnaire Design
- Minimal questions (4-5 max)
- Include email and name
- Ask for industry-specific metrics
- Calculate loss revenue / savings estimate
- Top-to-bottom layout (not left-to-right)
- White background for visibility

---

## Deployment Workflow

1. Initialize git repo
2. Push to GitHub
3. Connect GitHub to Vercel, click import
4. Deploy (Vercel auto-detects framework)
5. Add custom domain in Vercel settings
6. Enable analytics
7. Future updates: edit in Claude Code → push to GitHub → auto-updates Vercel

### Vercel Best Practices
- Name projects after client company
- Hobby plan is generous for free tier
- Use "comprehensive" security cleanup before deployment
- Enable Speed Insights for performance monitoring

---

## SEO Workflow

1. Analyze entire page + discovery pages
2. Fetch robots.txt and sitemap
3. Perform cross-page analysis
4. Score all SEO categories
5. Generate HTML report with executive summary, page breakdown, technical checklist, keyword recommendations, action plan

### Required On-Page Elements
- Unique titles and meta descriptions per page
- OG tags (Open Graph) for social sharing
- Twitter cards
- JSON-LD structured data (LocalBusiness schema)
- Canonical URLs
- Responsive design
- Cross-linked navigation

---

## Tools Ecosystem

| Tool | Purpose |
|------|---------|
| Claude Code | Primary development environment |
| Figma MCP | Bidirectional design-code sync |
| Nano Banana 2 | Best image generation |
| Kling 3.0 / Claude 3.0 | Video/animation generation |
| Firecrawl | Web scraping, brand extraction |
| Pexels API | Stock photos/videos |
| ElevenLabs | AI voice agents and chatbots |
| GoHighLevel | CRM, webhooks, email sequences |
| CapCut | Free video composition |
| Google Stitch | AI UI design + code export |
| Pencil | Free infinite canvas design tool |
| Vercel | Deployment and hosting |

---

## Common Mistakes to Avoid

- Using 1K image quality (looks cheap)
- Skipping best practices markdown file (slows Claude Code)
- One-shot designs that reconstitute constantly (gets stuck)
- Not testing mobile responsiveness
- Skipping analytics setup
- Not implementing 5+ email sequences
- Missing structured data and SEO basics
- Using HTTP instead of HTTPS for chatbot embeds
