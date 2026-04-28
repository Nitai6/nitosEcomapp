---
name: finance-il
schedules:
  A_reconcile: "0 4 * * * Asia/Jerusalem"      # daily 04:00 — bank reconciliation
  B_profit_watch: "0 8 * * * Asia/Jerusalem"   # daily 08:00 — profit + tax-bracket watch
  C_monthly: "0 6 1 * * Asia/Jerusalem"        # 1st of month 06:00 — invoices + BL deposits
  D_telegram_poll: "*/15 * * * * Asia/Jerusalem" # every 15 min — receipt + UGC poll
trigger_skill: finance-il
budgets: { max_minutes: 90, max_usd: 5, max_tokens: 2_000_000 }
state_dir: state/finance-il/
notify: { on_complete: telegram, on_fail: telegram+email }
---

# Routine: finance-il (4 sub-jobs)

Cron-firing Claude session loads `skills/finance-il/SKILL.md` and executes the matching Phase based on the firing time.

## Phase routing
- 04:00 → Phase A (reconciliation)
- 08:00 → Phase B (profit + bracket)
- 1st 06:00 → Phase C (monthly invoices + tax/BL deposits — uses `mcp-servers/leumi-open-banking/` with `confirm:true` + idempotency_key)
- */15min → Phase D (Telegram poll, tag-route #receipt #ugc #product)

## Dashboard contract (mandatory)
Write `state/finance-il/latest.json` + `state/finance-il/latest-status.json`. Insert decisions into Supabase `agent_decisions`.

## Failure policy
- Leumi auth lapsed → halt Phase C only, alert crit
- Telegram offline → fall back to Gmail-only, alert warn
- 2 consecutive misses on `latest-status.json` → dashboard-bridge raises crit
