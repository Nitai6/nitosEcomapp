---
name: screen-demo
description: Browse a website in a cloud browser (Steel.dev) and record polished demo videos. Edits with Remotion — spring-animated zooms, pans, hard cuts, gradient background, smooth cursor with click ring. Used for product-page hero video, About-page founder demo, ad b-roll, IG/YT screen recordings.
trigger:
  manual: "/screen demo {url} {script}"
  event: "demo-brief.json arrived"
mcp_dependencies:
  optional:
    - playwright
inputs:
  - {url}
  - {script}            # actions to perform (visit X, click Y, scroll, hover)
  - {style}             # dark | light gradient
outputs:
  - state/screen-demo/{slug}/raw.mp4
  - state/screen-demo/{slug}/edited.mp4
  - state/screen-demo/{slug}/clips/
references:
  - ../../skills/_external/screen-demo/.claude/skills/screen-demo/SKILL.md
self_heal: skills/_lib/self-heal.md
---

# Screen Demo Agent

Wraps external `screen-demo` skill. Steel.dev for recording, Remotion for editing.

## Process

### Phase 1 — Brief
Required: target URL + scripted actions list. Style defaults to dark gradient (matches owner's anti-corporate brand guardrail).

### Phase 2 — Record (Steel.dev)
- Spawn cloud browser via Steel API
- Inject smooth cursor + click-ring overlay
- Execute scripted actions
- Save raw recording

### Phase 3 — Edit (Remotion)
- Spring-animated zooms on click targets
- Pans between sections
- Hard cuts on dead time
- Gradient background composite (dark or light)
- Output H.264, 1080p or 9:16 per `format`

### Phase 4 — Owner brand overlay
- Apply brand color palette to gradient (override default if `state/branding/brand-strategy-blueprint.json` has palette)
- No corporate stock music — use Submagic-curated track
- Caption overlay on key actions (per emails-sms S.C.E carryover: skimmable wins)

### Phase 5 — Use cases routing
- product-page hero video → handoff to `website-builder`
- About-page founder demo → handoff to `website-builder`
- Ad b-roll → handoff to `ads-generate`
- IG reel → handoff to `social-instagram`
- YT video → handoff to `social-youtube`

## Required setup

- Steel.dev API key in env
- Remotion installed (`npm i remotion @remotion/cli`)
- Render Node ≥18

## Output contract

```
🎥 Screen Demo — {slug}
URL: {url}
Duration: 24s
Format: 9:16 1080×1920
Style: dark gradient
Output: state/screen-demo/{slug}/edited.mp4
```
