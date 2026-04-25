---
name: email-postpurchase
description: "Builds the 3-email Post-Purchase Flow: heartfelt thank-you + community-building + product education. Reduces buyer's remorse, builds community, drives repeat purchase. One-time setup per brand. Triggers on: post purchase, thank you email, post-purchase flow, after purchase email, customer onboarding email."
user-invokable: true
---

# Post-Purchase Flow (3 emails)

Triggered when an order ships (or completes, depending on store setup). Goal: reduce buyer's remorse, build community, set up the second purchase.

## The 3 emails

| # | Trigger | Purpose |
|---|---|---|
| 1 | Order completed (immediate or +1 hr) | Heartfelt thank you from founder, brand mission reminder, option to add to order if pre-ship |
| 2 | +3 days | Community building — link to Instagram/community/Discord/WhatsApp group, encourage UGC |
| 3 | +7 days | Product education — how to get the most from their purchase, troubleshooting tips, suggested next products (soft cross-sell) |

## Why this flow matters

- Reduces refund requests (buyer's remorse killer)
- Generates UGC and reviews (email 2)
- Increases LTV by setting up repeat purchase (email 3)
- Highest-engagement email window — recent buyers open everything

## Process

### Step 1: Read context
- `brand-profile.json`
- `references/my-brand-story.md` (shared with welcome flow)
- `references/my-community.md` — IG handle, Discord/WhatsApp invite, hashtag for UGC
- `references/my-product-education.md` (shared with welcome flow)
- `customer-service/references/my-upsell-catalog.md` — what to cross-sell (shared with CS skill)

### Step 2: Generate emails

**Email 1 (Thank You)**:
- Subject: warm + personal ("‎תודה ענקית, {{ first_name }} 💛" / "Thank you so much, {{ first_name }}")
- Body: founder voice, brand mission in 2-3 sentences, what to expect (shipping ETA), option to add to order if pre-ship window
- CTA: track order / add to order
- Plain text + minimal design (reads as personal, not marketing)

**Email 2 (Community)**:
- Subject: invitational ("Welcome to the family, {{ first_name }}")
- Body: link to IG/community, hashtag for UGC, what the community is for, recent UGC highlight
- CTA: follow on IG / join community / tag us
- Mid-design — some imagery, mostly text

**Email 3 (Education + Cross-sell)**:
- Subject: helpful ("Getting the most out of your [product]")
- Body: 3-5 tips/tricks, common questions answered, soft cross-sell ("if you love this, customers also pair it with [Y]")
- CTA: read full guide / shop related products
- More designed (infographics, before/after, comparisons)

### Step 3: Conditional logic

If customer is a **repeat buyer** (2+ previous orders), modify email 1:
- Subject: "Thanks for coming back, {{ first_name }}"
- Body acknowledges they're not new — different framing

If customer ordered a **specific product category**, route to a category-specific Email 3 with relevant cross-sells.

### Step 4: Output

Write to `state/email-postpurchase/<run_id>/`:
- `flow-spec.md`
- `emails.json`
- `setup-checklist.md`
- `qa-checks.md`

## Quality gates

- [ ] Email 1 fires WITHIN 1 hour of order (longer = feels detached)
- [ ] Email 1 is founder-voiced, not corporate
- [ ] Email 2's community link works (test the actual URL)
- [ ] Email 3's cross-sell pulls from current `my-upsell-catalog.md` (no out-of-stock items)
- [ ] Skip filter: "in refund process" (don't email someone you're refunding)

## Reference files

- `references/my-community.md` — community channels + hashtag + UGC examples
- Shared with other skills: `my-brand-story.md`, `my-product-education.md`, `customer-service/references/my-upsell-catalog.md`

## Required MCPs / Tools

- Email platform with order-completed trigger (Klaviyo, Mailchimp, Beehiiv all support this)
- Store integration to pass order data + customer history (`order_count` for repeat-buyer logic)

## TODO

- [ ] Set up community channels → `my-community.md`
- [ ] Confirm email platform's order-completed trigger is wired
