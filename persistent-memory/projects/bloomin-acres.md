---
tags:
  - memory
  - project
triggers:
  - bloomin acres
  - client project
  - sourdough
  - produce
  - christina
created: 2026-03-10
updated: 2026-03-10
---

# Bloomin' Acres Project

- Submodule at `engineering/projects/bloomin-acres/` -- commit inside submodule first, then push
- Remote: `github-ophidian-ai:ophidian-ai/bloomin-acres.git`
- Deploys to Vercel automatically on push to main
- Dev server: `node serve.mjs` (port 3000)
- Screenshots: `node screenshot.mjs http://localhost:3000 [label]`
- Image optimization: `node scripts/optimize-images.mjs` (uses sharp)
- Shared JS: `js/shared.js` (nav toggle, pageshow), `js/tailwind-config.js` (unified colors/fonts)
- Puppeteer installed in project node_modules

## Related

- [[ophidianai-website]]
- [[report-generation]]
- [[web-builder-skill]]
- [[launch-and-maintenance]]
