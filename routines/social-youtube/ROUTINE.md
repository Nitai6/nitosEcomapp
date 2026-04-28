---
name: social-youtube
schedule: "0 11 * * * Asia/Jerusalem"
trigger_skill: social-youtube
budgets: { max_minutes: 120, max_usd: 6, max_tokens: 1_500_000 }
state_dir: state/social-youtube/
notify: { on_complete: email, on_fail: telegram }
---

# Routine: social-youtube

Daily 11:00 IL. 3 paths per `skills/social-youtube/SKILL.md`:
- Path 1 (most common): Submagic Shorts extraction from owner long-form
- Path 2: niche scrape + Higgsfield remix
- Path 3: UGC product video (regular YT, not Short) from Telegram drop

Plus daily channel check (subs/views/CTR deltas).
