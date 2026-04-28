---
name: social-instagram
schedules:
  A_weekly_calendar: "0 6 * * 0 Asia/Jerusalem"   # Sun 06:00
  B_daily_post: "0 8 * * * Asia/Jerusalem"        # daily 08:00
  C_stories: "0 14 * * * Asia/Jerusalem"          # daily 14:00
trigger_skill: social-instagram
budgets: { max_minutes: 180, max_usd: 8, max_tokens: 3_000_000 }
state_dir: state/social-instagram/
notify: { on_complete: email, on_fail: telegram }
---

# Routine: social-instagram

3 sub-jobs per `skills/social-instagram/SKILL.md`. 14-15 posts/week (60-70% carousels, ~20% reels, ~20% static) + 8 stories.
