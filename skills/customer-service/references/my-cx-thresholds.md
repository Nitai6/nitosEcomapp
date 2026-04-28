# CX Thresholds — Auto-Action Caps

## No refunds — owner policy

> **Owner does not offer refunds.** Period. If a customer demands a refund, escalate to owner Telegram — do not promise one in any reply.

## Replacement / credit caps

> **Owner: confirm value (placeholder ₪200).** Above cap → escalate to owner Telegram.

| Action | Auto-cap | Above cap |
|---|---|---|
| Replacement (free) | ≤ ₪200 value | Escalate Telegram + queue `escalations.json` |
| Store credit | ≤ ₪200 | Escalate |
| Discount code (recovery) | ≤ 15% | Escalate above 15% |
| Free shipping waiver | always allowed | — |
| Refund | **never auto** | Always escalate Telegram |

## Escalation routing

Above-threshold complaints (or any refund demand) → Telegram bot message with:
- Conversation snippet
- Customer info (email, order, lifetime value)
- Quick-action buttons:
  - 🔁 Approve replacement
  - 💳 Approve store credit
  - 💬 Send custom reply
  - ❌ Decline (with reason template)

## Confidence gate

Self-scored reply-confidence <0.85 → don't auto-send. Queue in `latest-status.alerts` for owner review.

## Frequency cap

Per customer per day:
- Max 3 auto-replies (after that → flag conversation as "needs human")

## Partnership / influencer reach-outs

Never auto-reject. Always polite hold:
> "Thanks so much for reaching out! Got your note — let me chat with the team and we'll come back to you within the week. — Naty"

Then flag in `partnership-leads.json` for owner review.

## Spam classification

If this Claude session classifies a message as `spam` AND no engagement signals (no order, no prior thread):
- Mark read in IG/Gmail
- No reply
- Insert Supabase `cx_conversations` with `classification = 'spam'` for audit
