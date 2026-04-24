# paidads

Ads, campaigns, and creative skills for Claude Code — adapted from [avivmalka123/claude-skills](https://github.com/avivmalka123/claude-skills) as the starting point, being refactored into MCP-driven routine agents.

## Structure

```
skills/
├── ads/                    # master orchestrator (runs all platform audits)
├── ads-apple/              # Apple Search Ads audit
├── ads-budget/             # budget allocation + bidding strategy
├── ads-competitor/         # competitor intelligence across platforms
├── ads-create/             # campaign concept + copy brief generator
├── ads-creative/           # cross-platform creative quality audit
├── ads-dna/                # brand DNA extractor (URL → brand-profile.json)
├── ads-generate/           # AI ad image generator
├── ads-google/             # Google Ads deep audit (80 checks)
├── ads-landing/            # landing page quality for ad campaigns
├── ads-linkedin/           # LinkedIn Ads audit (27 checks)
├── ads-math/               # PPC financial calculators
├── ads-meta/               # Meta/Facebook/Instagram audit (50 checks)
├── ads-microsoft/          # Microsoft/Bing Ads audit (24 checks)
├── ads-photoshoot/         # AI product photography (5 styles)
├── ads-plan/               # strategic paid advertising plan
├── ads-test/               # A/B test design + experiment planning
├── ads-tiktok/             # TikTok Ads audit (28 checks)
├── ads-youtube/            # YouTube Ads analysis
├── carousel-machine2/      # Instagram carousel pipeline
├── copywriting/            # ad + landing page copy
├── heygen/                 # HeyGen AI video API
├── remotion/               # programmatic React-based video
└── video-creator/          # short-form 3D animated videos
```

## Editing a skill

Each skill lives in its own folder with a `SKILL.md` file. The key sections inside `SKILL.md`:

- **Frontmatter** (`name`, `description`, `user-invokable`) — metadata Claude uses to decide when to invoke the skill
- **Process** — the step-by-step logic the skill runs. **This is the main section being adapted** to call MCPs instead of asking the user to paste data
- **References** — other files in the folder the skill reads at runtime (benchmarks, scoring rules, check catalogs)

To edit a skill:

1. Open `skills/<skill-name>/SKILL.md` in any editor
2. Keep the frontmatter intact
3. Edit the Process / sections below; follow existing style
4. For deeper knowledge changes, edit the reference files in the same folder
5. Commit + push — scheduled routines pick up the new version on next run

## Layering your own knowledge

Rather than rewriting Aviv's baseline, create sibling files:

- `skills/<skill-name>/references/my-<topic>.md` — your overrides/additions
- Skills read these alongside the originals; your values win on conflict (documented in the skill)

This keeps Aviv's baseline intact for reference and makes it easy to track what's yours.

## Status

This is Phase 0 — raw import from Aviv. Adaptation to MCP-driven routines is in progress (see project plan).
