---
name: dm-funnel
schedules:
  event: "campaign-launched"
  nightly_stats: "0 1 * * * Asia/Jerusalem"
trigger_skill: dm-funnel
budgets: { max_minutes: 30, max_usd: 1, max_tokens: 500_000 }
state_dir: state/dm-funnel/
notify: { on_complete: silent, on_fail: telegram }
status: degraded-until-superprofile-clone-ready
---

# Routine: dm-funnel

Currently degraded — owner is building Superprofile clone in-house. Until clone ships, dm-funnel runs nightly 01:00 IL only:
- Pulls last 24h IG DM stats via Instagram Graph
- Computes funnel rates (comment→DM open / DM→email / email→click / click→purchase)
- Flags any step <30% to advisory

When Superprofile clone is wired (env: `SUPERPROFILE_CLONE_BASE_URL`), event-fired comment→DM auto-trigger turns on.
