# Doc 1 Checkpoints — Owner Gates

> Owner: drop the verbatim Doc 1 text or Google Doc link here.
> Until then, this file lists the 4 gates the orchestrator pauses at.

## Doc 1 source

`google-docs://[OWNER-FILLS-DOC-ID]`

## The 4 gates

| # | After phase | What owner reviews | Approve via |
|---|---|---|---|
| 1 | Market research | customer-avatar.json + offer brief + competitor catalog | `/brand-creator approve {slug} 1` OR dashboard click |
| 2 | Brand Strategy Blueprint | full 25-deliverable plan before generation | `/brand-creator approve {slug} 2` |
| 3 | Avatar lock | top 8 avatars surfaced, owner picks final 4 | `/brand-creator approve {slug} 3 --picks=[id1,id2,id3,id4]` |
| 4 | Wireframe | homepage + product + collection + cart + about + FAQ + contact previews | `/brand-creator approve {slug} 4` |

## Auto-run between gates

- Phase 0 → 1: fully auto
- Gate 1 → Phase 2: fully auto (run blueprint Prompt 1 only — STOP at gate 2 before Prompt 2)
- Gate 2 → Phase 3: auto-runs all 25 deliverables + auto-runs avatar candidate gen
- Gate 3 → Phase 4: auto-runs full website-builder steps 1–4 (wireframe gen)
- Gate 4 → Phase 5: auto-publishes site, wires Hostinger DNS, smoke tests, emits `brand-ready` event

## Failure modes

- Gate timeout > 72h → soft alert, no auto-proceed (owner gate is mandatory by design)
- Owner rejects with comments → orchestrator reads comments, re-runs phase incorporating feedback, re-presents at same gate
- Doc 1 changes mid-run → orchestrator detects via Google Docs revision id, re-validates outputs of current phase

## Owner override

`/brand-creator skip-gate {slug} {N}` — owner can skip a gate (auto-approve) for speed runs. Logged to `gates.json` with `skipped_by_owner: true`.

## Brand-ready emission

When Phase 5 completes:
1. Insert Supabase `brands.{brand_slug}.status = 'live'`
2. Emit `brand-ready` event to `state/_events/`
3. dashboard-bridge picks up event → unlocks daily-routine registration for this brand
4. Owner can now safely register the 16 cron routines for this brand
