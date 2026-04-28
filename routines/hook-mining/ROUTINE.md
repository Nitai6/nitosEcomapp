---
name: hook-mining
schedule: "0 11 * * * Asia/Jerusalem"   # daily 11:00 — feeds meta-ads creative regen
trigger_skill: hook-mining
budgets:
  max_minutes: 360        # 6h hard cap
  max_usd: 15             # API + storage
  max_tokens: 5_000_000
inputs:
  niches:                 # configured per active brand; override via /hooks mine {niche}
    - source: brand_niches  # joined from `niches` table at runtime
  per_niche_target: 5000
state_dir: state/hook-mining/
notify:
  on_complete: email      # nitalebusiness@gmail.com
  on_fail: email
---

# Routine: hook-mining

Weekly: for each active niche tied to a brand, scrape 5000 TikTok + IG videos, tag, score, and produce a pattern report.

## Steps

1. Load `niches` from Supabase joined to active `brands`.
2. For each niche, invoke `skills/hook-mining/SKILL.md` Phase 1 → 7.
3. Persist pattern reports to `hook_patterns`. Write a row in `routine_runs` with `routine_name='hook-mining'`, `artifacts={niche, samples, winners, top_patterns[]}`.
4. Email digest with top-10 patterns per niche + 3 example clips each.

## Failure policy

- Phase fails after 3 retries → checkpoint, continue to next niche, alert.
- Storage > 50GB used → halt, alert (clean up old raw videos first).
- Scraping blocked across both platforms → halt, alert (manual unblock needed).

## Manual override

`/hooks mine {niche}` invokes a one-off run for a single niche, bypassing schedule and per_niche_target (use `n=N` to override).
