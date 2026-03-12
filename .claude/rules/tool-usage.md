# Tool Usage Rules

## Screenshots

**Always use Playwright MCP for website screenshots.** Never use `firecrawl browser screenshot -o` -- it saves the terminal status message text to the file instead of the actual image binary, producing a corrupt file that Claude cannot process.

Correct approach:
1. `mcp__plugin_playwright_playwright__browser_navigate` to open the URL
2. `mcp__plugin_playwright_playwright__browser_take_screenshot` to capture the image

For local HTML files, use the Playwright Node.js script pattern from the prospect-mockup skill.

## Firecrawl

Use Firecrawl for:
- Scraping page content (`firecrawl scrape`)
- Site mapping (`firecrawl map`)
- Web search (`firecrawl search`)

Do NOT use Firecrawl for:
- Taking screenshots (use Playwright instead)
- Scraping Facebook or other social media (blocked by Firecrawl)
