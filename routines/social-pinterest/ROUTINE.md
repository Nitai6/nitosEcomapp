---
name: social-pinterest
schedule: "0 12 * * * Asia/Jerusalem"
trigger_skill: social-pinterest
budgets: { max_minutes: 90, max_usd: 4, max_tokens: 1_500_000 }
state_dir: state/social-pinterest/
notify: { on_complete: email, on_fail: telegram }
---

# Routine: social-pinterest

Daily 12:00 IL. Pull `pinterest_asset_queue` from Supabase → 5 variants per asset (original / 2:3 crop / brand text overlay × 3 / CTA badge / seasonal) via Higgsfield image route → DataForSEO long-tail KW for title+description → bulk upload 30-50 pins/day to brand boards.
