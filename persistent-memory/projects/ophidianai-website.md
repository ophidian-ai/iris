---
tags:
  - memory
  - project
triggers:
  - ophidianai site
  - website
  - vercel
  - brand colors
  - deploy
  - iris repo
  - submodule
created: 2026-03-10
updated: 2026-03-10
---

# OphidianAI Website

- **Submodule** at `engineering/projects/ophidian-ai/` -- commit inside submodule first, then push
- **Repo:** `github-ophidian-ai:ophidian-ai/ophidian-ai.git`
- **Stack:** Next.js 15 + Tailwind CSS 4 + TypeScript + App Router
- **Deployed to:** Vercel at `ophidian-ai.vercel.app`
- **Dev server:** `cd engineering/projects/ophidian-ai && npm run dev`
- **Pages:** Home, Services, Pricing, Contact, About, Portfolio, Blog, FAQ
- **Brand:** Dark theme, teal #0DB1B2 primary, lime #39FF14 accent, navy #0D1B2A background
- **Reports:** `reports/` folder inside submodule (status report, roadmap, audits)
- **Contact form:** Resend wired, needs RESEND_API_KEY env var in Vercel
- **Pending:** Resend API key, custom domain, Stripe checkout, Calendly, blog content

## Iris Repo

- **Remote:** `github-ophidian-ai:ophidian-ai/iris.git`
- **Contains:** Agents, skills, prospects, marketing, operations, context -- NOT the website
- **Submodules:** Bloomin' Acres + OphidianAI website (both in `engineering/projects/`)

## Related

- [[bloomin-acres]]
- [[report-generation]]
- [[web-builder-skill]]
- [[launch-and-maintenance]]
