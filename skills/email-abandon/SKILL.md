---
name: email-abandon
description: "Builds two SEPARATE flows: Cart Abandon (8 emails) and Checkout Abandon (8 emails). 70-85% of carts are abandoned. Cart trigger = Added to Cart (custom Klaviyo setup, NOT default). Checkout trigger = Checkout Started. One-time setup per brand. Triggers on: cart abandon, checkout abandon, abandoned cart, recovery flow, cart recovery, abandoned cart email."
user-invokable: true
---

# Cart + Checkout Abandon Flows (2 separate flows × 8 emails each)

**Critical**: Cart Abandon ≠ Checkout Abandon. They are TWO separate flows with different triggers and different copy. Most stores conflate them and lose recovery revenue.

## The two triggers

| Flow | Trigger event | Funnel position |
|---|---|---|
| Cart Abandon | `Added to Cart` event (no checkout started) | Earlier — they're still browsing |
| Checkout Abandon | `Checkout Started` event (entered checkout, didn't complete) | Later — they had buying intent |

**Klaviyo specifics**: Klaviyo's default Abandoned Cart flow uses Started Checkout — that's the SECOND flow only. To capture true cart abandonment you must set up a custom flow triggered by `Added to Cart` with a wait + filter "checkout not started". The user's email doc explicitly calls this out.

## The 8 emails (same structure, different framing per flow)

| # | Trigger | Purpose |
|---|---|---|
| 1 | +1 hour | Brief reminder — show exactly what they left |
| 2 | +4 hours | Nudge from founder, personal text-based |
| 3 | +1 day | Social proof — reviews of THE specific abandoned product |
| 4 | +2 days | FAQ / objection handling |
| 5 | +3 days | Discount introduction (only if needed — many won't) |
| 6 | +5 days | More social proof + discount reminder |
| 7 | +7 days | Last-chance urgency on discount |
| 8 | +10 days | "What happened?" personal founder check-in |

**Cart Abandon** framing is softer ("noticed you were looking at..."). **Checkout Abandon** framing is more direct ("almost there — your order's still waiting").

## Process (when invoked)

### Step 1: Read context
- `brand-profile.json` (voice)
- `references/my-abandon-offer.md` — discount terms (often -10% or free shipping for cart, more aggressive for checkout)
- `references/my-product-objections.md` — common objections (price, shipping time, fit, quality, returns) — for FAQ emails
- `references/my-social-proof.md` (shared with welcome flow)
- Email platform from `social-funnel/references/my-funnel-tools.md`

### Step 2: Determine if BOTH flows or one

If user is just starting → set up Checkout Abandon first (Klaviyo default works, fastest setup, captures highest-intent traffic). Add Cart Abandon flow as Phase 2 once first is running.

### Step 3: Generate flows with dynamic content

Both flows MUST use dynamic content — the email shows what was actually in the cart:
- `{{ event.extra.line_items }}` — Klaviyo dynamic block to render product name + image + price
- `{{ event.extra.checkout_url }}` — direct return-to-cart link
- `{{ person.first_name }}` — personalized greeting

For each email: subject + preview + body copy + CTA + dynamic blocks + send delay + filters.

### Step 4: Filter logic (critical)

Each email must have:
- Trigger filter: matching event in last X minutes/hours
- Skip filter: "purchased since trigger" — exits flow
- Skip filter: "in another flow" if conflicting (don't spam)
- Skip filter: unsubscribed
- Filter: not already received this specific email

### Step 5: Output

Write to `state/email-abandon/<run_id>/`:
- `cart-abandon-flow.json` — 8 emails for cart flow
- `checkout-abandon-flow.json` — 8 emails for checkout flow
- `klaviyo-setup-checklist.md` — step-by-step for the custom Cart Abandon trigger
- `qa-checks.md`

## Cart vs Checkout copy nuance

**Cart Abandon Email 1** (softer):
> "Hey {{ first_name }}, saw you were checking out [product]. Just leaving this here in case you want to come back to it. No pressure."

**Checkout Abandon Email 1** (direct):
> "Hey {{ first_name }}, your [product] is still in your cart — looks like you got pulled away mid-checkout. One click and it's yours: [link]"

## Copywriting rules
Same as `email-welcome` — see `references/my-copywriting-rules.md`.

## Discount strategy

- Don't lead with discount. Try email 1-4 without one.
- Email 5 introduces discount only if customer hasn't returned.
- Use a unique code per flow so you can attribute recovery revenue accurately (e.g. `CART10` vs `CHECKOUT10`).
- Cap discount usage to 1 per customer.

## Deliverability rules
Same as `email-welcome`. See `references/my-deliverability.md`.

## Quality gates

- [ ] Cart and Checkout flows are SEPARATE (not one combined flow)
- [ ] Cart Abandon trigger is `Added to Cart`, not `Checkout Started` (verify in Klaviyo)
- [ ] Each email has skip filter "purchased since trigger" — never email someone after they bought
- [ ] Dynamic line_items renders correctly (test with a real abandoned cart)
- [ ] Email 2 in each flow is plain-text founder voice
- [ ] Cap discount logic in place

## Reference files

- `references/my-abandon-offer.md` — discount codes + terms for both flows
- `references/my-product-objections.md` — top 5-10 objections to address in email 4
- `references/my-recovery-metrics.md` — track: open rate, click rate, recovery rate per email per flow

## Required MCPs / Tools

- Email platform with custom event triggers (Klaviyo strongly preferred — supports custom Cart Abandon)
- Shopify (or store) sending `Added to Cart` and `Checkout Started` events into the email platform

## TODO before first run

- [ ] Confirm email platform supports custom triggers (Klaviyo: yes; Mailchimp: limited; Beehiiv: no — use Klaviyo)
- [ ] Wire `Added to Cart` event from store → email platform
- [ ] Set abandon offer + codes → `my-abandon-offer.md`
- [ ] List top objections → `my-product-objections.md`
