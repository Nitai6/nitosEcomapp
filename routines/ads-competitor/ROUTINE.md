---
name: ads-competitor
schedule: "0 4 * * 0 Asia/Jerusalem"
trigger_skill: ads-competitor
budgets: { max_minutes: 240, max_usd: 10, max_tokens: 3_500_000 }
state_dir: state/ads-competitor/
notify: { on_complete: email, on_fail: email+telegram }
---

# Routine: ads-competitor

Weekly Sun 04:00 IL. Apify scrape qualified competitors → matrix.json feeds meta-ads + social-instagram weekly calendar. Loads `skills/ads-competitor/SKILL.md`.
