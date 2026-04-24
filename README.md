# paidads

All skills from [avivmalka123/claude-skills](https://github.com/avivmalka123/claude-skills), imported as the starting point. Being refactored into MCP-driven routine agents with my own knowledge layered on top.

**114 skills total** — full catalog in `skills/`. Covers:

- **Paid advertising** — `ads`, `paid-ads`, `ads-google`, `ads-meta`, `ads-tiktok`, `ads-linkedin`, `ads-youtube`, `ads-microsoft`, `ads-apple`, `ads-plan`, `ads-budget`, `ads-math`, `ads-competitor`, `ads-test`, `ads-landing`, `ads-creative`, `ads-create`, `ads-dna`, `ads-generate`, `ads-photoshoot`, `ads-audit`, `ad-creative`
- **SEO** — `seo`, `seo-audit`, `seo-content`, `seo-page`, `seo-plan`, `seo-technical`, `seo-schema`, `seo-sitemap`, `seo-hreflang`, `seo-images`, `seo-geo`, `seo-programmatic`, `seo-competitor-pages`, `ai-seo`, `programmatic-seo`, `schema-markup`, `site-architecture`
- **CRO** — `page-cro`, `form-cro`, `onboarding-cro`, `signup-flow-cro`, `popup-cro`, `paywall-upgrade-cro`, `ab-test-setup`
- **Content / Creative** — `copywriting`, `copy-editing`, `storytelling`, `social-content`, `social`, `content-strategy`, `email-sequence`, `cold-email`, `youtube-ideas`, `humanizer`, `readme-writer`
- **Video / Carousel** — `video-creator`, `heygen`, `remotion`, `carousel-machine2`, `carousel-machine-english`, `carousel-aviv-king`, `spline-3d-integration`
- **Landing pages / Lead magnets** — `landing-page`, `landing-page-builder-html`, `new-guide`, `hebrew-pdf-guide`, `company-pdf`, `free-tool-strategy`, `referral-program`
- **Strategy / Ops** — `marketing-ideas`, `marketing-psychology`, `launch-strategy`, `pricing-strategy`, `churn-prevention`, `competitor-alternatives`, `sales-enablement`, `project-proposal`, `ceo-advisor`, `last30days`, `product-marketing-context`, `revops`, `auto-product-test`
- **Lead gen / Scraping** — `scrape-leads-israel`, `scrape-leads-global`, `firecrawl`
- **Analytics / Tracking** — `analytics-tracking`, `meta-verification`, `cookies`
- **Compliance** — `israeli-legal-compliance`, `cyber`, `security-audit`
- **Dev utilities** — `claude-cli`, `claude-creators`, `mcp-builder`, `skill-creator`, `brainstorming`, `writing-plans`, `writing-skills`, `dispatching-parallel-agents`, `executing-plans`, `finishing-a-development-branch`, `requesting-code-review`, `receiving-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`
- **Integrations** — `gmail-organizer`, `cardcom-payment`

## Editing a skill

Each skill is a folder under `skills/` with a `SKILL.md` inside. That file has:

- **Frontmatter** (top `---` block) — metadata; don't break
- **Process / body** — the skill's logic; **this is where you add your knowledge, tweak rules, adjust steps**
- **Reference files** (other `.md` or `.json` files in the folder) — benchmarks, check lists, specs; tune numbers here

### Edit locally (recommended for big changes)

```
cd C:\Users\Admin\projects\paidads
# edit with VS Code / Cursor / Notepad
git add .
git commit -m "tune ads-meta thresholds"
git push
```

### Edit on GitHub (fastest for small tweaks)

- Click any file in https://github.com/Nitai6/paidads → pencil icon → edit → commit from the browser
- Or press `.` on any repo page to open the full browser-based VS Code (github.dev)
- After editing on GitHub, run `git pull` locally before editing locally again

## Layering your own knowledge

Don't overwrite Aviv's baseline — layer on top. Inside any skill folder, create files named `references/my-*.md`. These are gitignored by default (see `.gitignore`), so they stay private until you decide otherwise.

When the skills get adapted for routines, each skill will read both Aviv's references and your `my-*.md` overrides, with your values winning on conflict.

## Status

- **Phase 0** (current): raw import, editing baseline
- **Phase 1** (next): adapt core ad skills to use MCPs, wire first routine chain
- **Phase 2+**: platform-by-platform expansion, self-healing, scheduled triggers

## Notes

- `carousel-machine` (v1) was dropped; `carousel-machine2` is the current version. English and Aviv-personal variants kept because they serve different purposes.
