---
name: email-marketing
schedules:
  A_setup: "event:brand-onboarding"               # one-time per brand — Mailjet 4-flow setup
  B_monthly_topics: "0 0 1 * * Asia/Jerusalem"    # 1st of month — micro-ideas + calendar
  C_weekly_campaigns: "0 7 * * 1 Asia/Jerusalem"  # weekly Mon 07:00 — Gruns/hybrid/text tier
  D_nightly: "0 2 * * * Asia/Jerusalem"           # nightly 02:00 — deliverability + segmentation
  E_quiz_popup: "0 3 1 * * Asia/Jerusalem"        # monthly — quiz/popup refresh
trigger_skill: email-marketing
budgets: { max_minutes: 120, max_usd: 4, max_tokens: 2_500_000 }
state_dir: state/email-marketing/
notify: { on_complete: email, on_fail: email+telegram }
---

# Routine: email-marketing (Mailjet, 5 sub-jobs)

Loads `skills/email-marketing/SKILL.md` Job {A|B|C|D|E} per cron.

## Dashboard contract
`state/email-marketing/latest.json` + `latest-status.json` after every run.
