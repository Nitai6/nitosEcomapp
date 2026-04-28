# Superprofile Flow Templates

Per-campaign 3-step DM sequence (Camila Markson Prompt 8).

## Template structure

### DM 1 — Instant (within 1 minute of comment)

**Goal:** hook + freebie delivery + email request

Template (English):
> Hey! Saw your comment 🙌
>
> Here's the [freebie] I promised: [link]
>
> Quick Q — want me to send a few more like this straight to your inbox? Just drop your email below 👇

Template (Hebrew):
> היי! ראיתי את התגובה שלך 🙌
>
> הנה ה-[freebie] שהבטחתי: [link]
>
> שאלה זריזה — תרצה.י שאשלח עוד כאלה ישר למייל? תשאיר.י כאן את האימייל 👇

### DM 2 — 24h after email captured

**Goal:** qualifying question (segments lead for product fit)

Template:
> Quick one — what's the biggest [problem brand solves]?
>
> A) [common pain 1]
> B) [common pain 2]
> C) [common pain 3]
>
> (Just reply with the letter — I'll send something useful based on your answer.)

### DM 3 — 48h after DM 2 reply

**Goal:** product CTA tied to qualifying answer

Template (if A):
> Got it. For [pain 1], the move is [our product/category].
>
> We just dropped a [thing]: [product link] — first 50 get [bonus].
>
> Worth a peek?

(Repeat with variants for B and C — each maps to relevant product.)

## Per-campaign customization

Owner provides at `/dm-funnel setup {campaign}`:
- Trigger keyword(s) (e.g., "GUIDE", "YES", "INFO")
- Triggering post_id
- Freebie URL
- 3 pain options for DM 2
- 3 product CTAs for DM 3 (one per pain)
- Mailjet list tag (e.g., `from-ig-funnel-spring-guide`)

## Send-window rules

- DM 1 = instant (<1 min)
- DM 2 = 24h ± 2h randomization (human-like)
- DM 3 = 48h after DM 2 reply (not after DM 2 send — wait for engagement)

If user doesn't reply to DM 2 by 72h → drop them into Mailjet "Win-back" flow (3rd flow in email-marketing).

## Conversion gates (each step must hit)

| Step | Target |
|---|---|
| Comment → DM 1 open | >70% |
| DM 1 → email submit | >40% |
| Email → DM 2 reply | >30% |
| DM 2 → DM 3 click | >20% |
| Click → purchase | >10% |

Below gate → flag advisory for tweak.

## Brand voice anchor

All DMs filtered through `state/branding/brand-strategy-blueprint.json` (Tone of Voice + forbidden words). Mirror language of the original comment.
