---
name: analytics
schedule: "0 7 * * * Asia/Jerusalem"
trigger_skill: analytics
budgets: { max_minutes: 60, max_usd: 3, max_tokens: 1_500_000 }
state_dir: state/analytics/
notify: { on_complete: email, on_fail: email }
---

# Routine: analytics

Daily 07:00 IL. Pulls GSC + PostHog + Sentry + Shopify + Meta/TikTok/etc. Computes blended ROAS, anomaly flags. Loads `skills/analytics/SKILL.md`.
