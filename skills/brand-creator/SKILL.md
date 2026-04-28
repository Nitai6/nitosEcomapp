---
name: brand-creator
description: Orchestrator for owner's "Doc 1" brand-creation workflow. Walks the full chain step-by-step (market-research → branding → avatar-builder → website-builder), automatically executing where Claude can take action (research, copy gen, deliverables, wireframe→site build) and gating only at the 4 owner-approval checkpoints (avatar review, blueprint approval, locked-avatar pick, wireframe sign-off). Produces the canonical brand outputs every other agent reads as input. **MUST run at least once before any cron routine fires** — without `state/branding/brand-strategy-blueprint.json` downstream agents have no tone, no forbidden words, no avatar.
trigger:
  manual: "/brand-creator {start|continue|status} {brand_slug}"
  event: "doc-1-uploaded"
mcp_dependencies:
  required:
    - shopify              # for website-builder phase
    - higgsfield           # avatar reference image gen
    - hyperframes          # avatar video for brand reels
    - apify                # market-research scraping
    - dataforseo           # SEO/KW for brand positioning
    - supabase             # state + brand registry
    - google-docs          # Doc 1 source
    - hostinger            # domain provisioning
    - slack                # owner alerts at gates
    - telegram             # owner alerts at gates
inputs:
  - google-docs://doc-1-master-prompt   # owner's brand-creator master prompt
  - state/brand-creator/{brand_slug}/intake.json  # owner-supplied product/niche
outputs:
  - state/market-research/customer-avatar.json
  - state/market-research/silent-frustration.md
  - state/branding/brand-strategy-blueprint.json
  - state/branding/copy-assets.json
  - state/branding/references/my-brand-guardrails.md
  - state/avatar-builder/avatars.json
  - state/website-builder/wireframe.json
  - state/website-builder/published-url.txt
  - state/brand-creator/{brand_slug}/run-log.json
  - state/brand-creator/latest.json
  - state/brand-creator/latest-status.json
references:
  - references/my-doc-1-checkpoints.md
aviv_refs: []
self_heal: skills/_lib/self-heal.md
---

# Brand-Creator Orchestrator

Owner: "All Doc 1 needs to be done step by step but Claude does take action at some places (e.g. building the website). **Automatic always better.**"

This skill walks Doc 1 end-to-end, auto-executing where possible, gating at 4 owner-approval points only.

## Phase 0 — Intake (owner action)

Owner triggers `/brand-creator start {brand_slug}` with:
- Product / niche
- Target market (e.g. IL women 25–45)
- Existing assets if any (logo, photos, founder UGC)
- Doc 1 location (Google Docs link)

Auto-action: read Doc 1 verbatim, write `state/brand-creator/{brand_slug}/intake.json`, kick Phase 1.

## Phase 1 — Market research (FULLY AUTO)

Calls `market-research` skill — runs all 9 prompts:
1. Niche + customer ID
2. Hormozi starving-crowd
3. Pain mining (Reddit/Quora via Apify)
4. Voice-of-customer extraction
5. Competitor catalog
6. Offer brief
7. Pricing intelligence (DataForSEO + Apify)
8. Channel hypothesis
9. Customer avatar v0

Writes `state/market-research/{customer-avatar.json, silent-frustration.md, competitor-catalog.json}`.

**Gate 1 — Owner reviews customer avatar + offer brief.**
- Slack/Telegram alert: "Brand-creator [{slug}] Phase 1 complete. Review avatar at /dashboard/brand-creator/{slug}. Approve to proceed."
- Wait for owner approval flag in `state/brand-creator/{brand_slug}/gates.json`.

## Phase 2 — Brand Strategy Blueprint (auto + gate)

Auto-run `branding` Prompt 1 (Brand Strategy Blueprint) — produces 25-deliverable spec.

**Gate 2 — Owner approves blueprint.**

After approval, auto-run `branding` Prompt 2 — generates all 25 deliverables:
- Brand name + manifesto
- Tone-of-voice
- Forbidden words
- Visual identity guidelines
- Tagline + positioning
- Hashtag strategy
- Founder bio
- About-us page copy
- FAQ
- CX macros
- Email tone profile
- 3 ad-angle libraries
- Hook bank seed
- ... (full list per branding skill)

Writes `state/branding/{brand-strategy-blueprint.json, copy-assets.json, references/my-brand-guardrails.md}`.

## Phase 3 — Avatar lock (auto + gate)

Auto-run `avatar-builder`:
1. Generate 16 candidate avatars via Higgsfield (GPT-image route) per market-research avatar profile
2. Generate matching 4-second avatar reels via Hyperframes (HeyGen) for top 8
3. Score realism + brand-fit (Claude self-scores)
4. Surface top 8 to owner

**Gate 3 — Owner picks final 4 locked avatars.**

After lock, persist `state/avatar-builder/avatars.json` with `locked: true` flag on the 4.

## Phase 4 — Website wireframe + build (auto + gate)

Auto-run `website-builder` step 1–4:
1. Read brand-strategy-blueprint + customer-avatar + locked avatars
2. Generate Shopify-compatible wireframe (homepage, product, collection, cart, checkout, about, FAQ, contact)
3. Auto-pick layout from owner's anti-corporate raw style (per "No Copycats")
4. Render preview screenshots

**Gate 4 — Owner reviews wireframe.**

After approval, auto-run `website-builder` step 5–6:
5. Push to Shopify (via Storefront MCP)
6. Wire Hostinger DNS to Shopify domain
7. Run smoke test (lighthouse + a11y)

Writes `state/website-builder/{wireframe.json, published-url.txt}`.

## Phase 5 — Activation (FULLY AUTO)

After Phase 4 lands, the brand file ecosystem is complete:
- `state/branding/brand-strategy-blueprint.json` ✅
- `state/branding/copy-assets.json` ✅
- `state/branding/references/my-brand-guardrails.md` ✅
- `state/market-research/customer-avatar.json` ✅
- `state/avatar-builder/avatars.json` ✅
- `state/website-builder/published-url.txt` ✅

Brand-creator emits `brand-ready` event → daily routines (meta-ads, social-instagram, etc.) can now safely fire because every input file they declare exists.

Brand-creator writes final `state/brand-creator/latest-status.json`:
```json
{
  "status": "ok",
  "headline": "Brand [{slug}] live · 25 deliverables · 4 avatars locked · site published",
  "kpis": { "deliverables": 25, "avatars_locked": 4, "site_lighthouse": 92 },
  "next_run": null,
  "alerts": []
}
```

## Resumption

If owner pauses at a gate, `/brand-creator continue {brand_slug}` resumes from the last written gate.

`/brand-creator status {brand_slug}` shows current phase + which gate is pending owner action.

## Gate alert format (Telegram + Slack)

```
🎨 Brand-Creator: {slug}
Phase {N}/4 complete · Gate awaiting your review
→ {what to review}
→ Approve: tap "Approve" in dashboard or reply "approve {slug} {phase}"
→ Reject + comments: reply "reject {slug} {phase} {reasons}"
```

## Owner-brand overlay

Doc 1 IS the canonical reference. Every output checked against Doc 1 verbatim before writing. If Doc 1 is updated mid-run, brand-creator re-validates current phase outputs.

## Daily digest

Brand-creator is one-shot per brand (not daily) — but appears in dashboard until completion:

```
🎨 Brand-Creator [{slug}]
Status: Phase 2/4 — Gate awaiting owner approval (blueprint review)
Time-in-phase: 14h
Next: owner approval in dashboard
```

## Self-heal

- Doc 1 unreachable → halt, alert `crit`
- Higgsfield/Hyperframes rate limit → exp backoff × 5
- Owner gate timeout (>72h) → soft alert `warn`, do NOT auto-proceed
- Mid-phase failure → write partial output to `state/brand-creator/{brand_slug}/partial/`, allow `/continue` to resume from sub-step
