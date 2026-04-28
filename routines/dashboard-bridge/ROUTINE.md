---
name: dashboard-bridge
schedule: "*/5 * * * * Asia/Jerusalem"
trigger_skill: dashboard-bridge
budgets: { max_minutes: 5, max_usd: 0.5, max_tokens: 300_000 }
state_dir: state/dashboard/
notify: { on_complete: silent, on_fail: telegram }
---

# Routine: dashboard-bridge

Every 5 min. Loads `skills/dashboard-bridge/SKILL.md`:
1. Scan all `state/{agent}/latest-status.json`
2. Build `state/dashboard/{feed,timeline,alerts,health}.json`
3. Push KPI rows to Supabase `agent_kpi_history`
4. Push decision rows to Supabase `agent_decisions`
5. Health-check staleness (>1.5× cron interval → status:stale + crit alert)

The Next.js IU at `paidads/app/` reads these files + tables.
