---
name: social-tiktok
schedule: "0 10 * * * Asia/Jerusalem"
trigger_skill: social-tiktok
budgets: { max_minutes: 90, max_usd: 5, max_tokens: 1_500_000 }
state_dir: state/social-tiktok/
notify: { on_complete: email, on_fail: telegram }
---

# Routine: social-tiktok

Daily 10:00 IL. Apify niche scrape → Higgsfield remix (Seedance video route) OR screen-demo product-shot OR founder UGC → Submagic captions → brand-anchor check → schedule via TikTok Content API for IL prime 19:00-22:00. 1-2 posts/day.
