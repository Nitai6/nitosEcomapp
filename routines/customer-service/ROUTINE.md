---
name: customer-service
schedule: "*/30 9-22 * * * Asia/Jerusalem"
trigger_skill: customer-service
budgets: { max_minutes: 20, max_usd: 1, max_tokens: 800_000 }
state_dir: state/customer-service/
notify: { on_complete: silent, on_fail: telegram }
---

# Routine: customer-service

Every 30 min, 09:00–22:00 IL only (human-like, no nights). Loads `skills/customer-service/SKILL.md`.

Pull IG DMs + Gmail unread → Claude classifies (question/complaint/order-status/partnership/spam) → route per type → brand voice overlay → randomized 0–25 min reply delay → send → log to Supabase `cx_conversations`.

## Hard rules (from SKILL.md)
- Never use bot-tells ("As an AI", "I'm here 24/7", "How may I assist you today")
- Always sign as brand persona
- Mirror message language (HE/EN)
- NO REFUNDS — replacement/credit only per `references/my-cx-thresholds.md`. Refund demands → escalate to owner Telegram.
