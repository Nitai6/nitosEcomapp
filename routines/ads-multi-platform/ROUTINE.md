---
name: ads-multi-platform
schedule: "0 9 * * * Asia/Jerusalem"
trigger_skill: ads-multi-platform
budgets: { max_minutes: 120, max_usd: 8, max_tokens: 3_000_000 }
state_dir: state/ads-multi-platform/
notify: { on_complete: email, on_fail: telegram }
---

# Routine: ads-multi-platform

Daily 09:00 IL. TikTok / Google / YouTube / LinkedIn / Microsoft / Apple ads (non-Meta). Loads `skills/ads-multi-platform/SKILL.md`.

## Dashboard contract
`latest.json` + `latest-status.json`.
