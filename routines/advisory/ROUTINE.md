---
name: advisory
schedule: "0 8 * * 0 Asia/Jerusalem"
trigger_skill: advisory
budgets: { max_minutes: 60, max_usd: 3, max_tokens: 2_000_000 }
state_dir: state/advisory/
notify: { on_complete: email+telegram, on_fail: telegram }
---

# Routine: advisory

Weekly Sun 08:00 IL. Reads every other agent's latest.json, produces strategic review + 3 prioritized actions for the week.
