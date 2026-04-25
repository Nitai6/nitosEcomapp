---
name: ecom-quiz
description: "Designs and builds an ecommerce quiz funnel. Customer-research-based, purpose-driven questions, mobile-first, fast-perceived-value. Output: quiz spec ready to build in Typeform / Octane AI / Shopify Shop Quiz / custom. One-time setup. Triggers on: ecom quiz, product quiz, recommendation quiz, find your X, quiz funnel, shop quiz."
user-invokable: true
---

# Ecom Quiz Builder

Builds a personalized product-recommendation quiz that doubles as a lead magnet (email capture) and a conversion engine (recommends product → makes buying obvious).

## Core principle (the difference between good and great)

> A good quiz asks questions.
> A great quiz **builds belief that the recommendation is right** — and makes buying the obvious next step.

Every question must serve the recommendation. Every result page must feel personalized.

## Hard rules

1. **Customer-research-based** — questions reflect real problems, real use cases, real goals from your customer base. Not made up.
2. **Purpose-driven** — if a question doesn't directly influence the recommendation, **delete it**. No filler.
3. **Seamless perceived value** — user feels progress early. Each step feels like it's getting them closer to "the right product".
4. **Simple flow** — one question at a time, clear answer choices, mobile-optimized, fast loading, no overthinking required.
5. **No more than 7 questions** — quiz length kills completion rate. Aim for 4-6.

## The quiz architecture

```
[INTRO] — promise + time estimate ("Find your perfect [X] in 60 seconds")
   ↓
[Q1: BIGGEST PROBLEM / GOAL] — sets the recommendation track
   ↓
[Q2: USE CASE / CONTEXT] — narrows the track
   ↓
[Q3: PREFERENCE / CONSTRAINT] — refines further
   ↓
[Q4: COMMITMENT / EXPERIENCE LEVEL] — qualifies depth
   ↓
[Q5 (optional): TIMING / URGENCY]
   ↓
[Q6 (optional): BUDGET (only if catalog spans wide range)]
   ↓
[EMAIL CAPTURE] — "Where should we send your results?"
   ↓
[RESULT PAGE] — recommendation + why + social proof + CTA
   ↓
[FOLLOW-UP EMAIL FLOW] — email 1: result + offer; email 2: more proof; email 3: urgency
```

## Process (when invoked)

### Step 1: Research customer base
Before designing, gather:
- 10-20 real CS tickets / reviews / DMs (the customer's actual language)
- Top 3 problems / questions / objections from CS data
- Product catalog with: clear differentiators between products, target use case per product, price tier per product
- Read `references/my-customer-research.md` and `references/my-product-catalog.md`

### Step 2: Design the recommendation logic FIRST

Before writing questions, build the decision tree:
- How many products to recommend? (typically 3-5 — too many overwhelms)
- What inputs determine which? (e.g. "skin type" → A/B/C track; "concern" → variant within track)
- Map each combination to a specific product (or bundle)
- For each result, define WHY ("You're getting [X] because you said [Y] — it's specifically built for [Z]")

### Step 3: Reverse-engineer questions from the logic

For each input the logic needs, write a question that captures it. If a question doesn't feed the logic, **delete it**.

Question writing rules:
- Use customer language (from research, not corporate-speak)
- Single-select usually (not multi-select — slower)
- 3-5 answer options per question
- Each option visible without scrolling on mobile
- No "Other (please specify)" — kills speed

### Step 4: Build the result page (often more important than the quiz)

Each result includes:
- Headline: "Your match: [product name]"
- Why it's the match: cite the user's own answers ("Because you said you want to [X] and you're [Y]...")
- Product image
- Top 3 benefits (matched to the user's stated concerns)
- Social proof: 1-3 reviews from customers with similar profiles
- Price + CTA (Add to Cart, often with first-time discount)
- Secondary recommendation if budget is a constraint

### Step 5: Build the follow-up email flow

If user completes quiz but doesn't buy:
- **Email 1** (immediate): "Here's your personalized result + [discount]"
- **Email 2** (+2 days): More social proof from customers who matched the same result
- **Email 3** (+5 days): Urgency on discount + light alternative product if first one didn't click
- Then: subscribe to general newsletter (`email-campaigns` flow)

### Step 6: Output

Write to `state/ecom-quiz/<run_id>/`:
- `quiz-spec.md` — questions, logic tree, result pages, copy
- `result-pages.md` — every result with headline + why + product
- `follow-up-flow.json` — 3-email follow-up
- `setup-checklist.md` — exact platform clicks (Typeform / Octane / Shop Quiz)
- `quiz-tracking.md` — what events to fire (quiz_started, question_answered, quiz_completed, email_captured, result_clicked, purchase_attributed)

## Platform recommendations

| Platform | Best for | Cost |
|---|---|---|
| **Octane AI** | Shopify-native, deep integration, AI-powered logic | $50-500/mo |
| **Shopify Shop Quiz** (Shop app) | Free, Shopify-only, basic | Free |
| **Typeform** | Beautiful UI, broad integrations, harder Shopify hookup | $25+/mo |
| **Custom (Next.js + Klaviyo)** | Full control, no recurring fee, dev time | Dev cost |

Default recommendation: Octane AI if you'll iterate often. Shop Quiz if just starting and budget-tight.

## Tracking

Fire these events at each step (Klaviyo / GA4 / Pixel):
- `quiz_started`
- `question_<n>_answered` with the answer value
- `quiz_completed` with full answer set
- `email_captured` with email + answer set (also adds to email list with `source: quiz`)
- `result_viewed` with which product was recommended
- `result_clicked` (clicked CTA from result)
- `purchase_attributed` (bought within X days, attribute to quiz)

Use these to measure: completion rate, drop-off per question, email-to-purchase conversion per result product.

## Quality gates

- [ ] Total quiz: 4-7 questions, no more
- [ ] Every question feeds the recommendation logic (no filler)
- [ ] Every result has: headline + why + product + 3 benefits + social proof + CTA
- [ ] Email capture is BEFORE result (so you keep the email even if they don't buy)
- [ ] Follow-up email flow is wired
- [ ] Mobile-tested (most quiz traffic is mobile)
- [ ] Loads in <2 seconds
- [ ] Single input per step
- [ ] Tracks all events listed above

## Reference files

- `references/my-customer-research.md` — top problems, language, real-world quotes
- `references/my-product-catalog.md` — differentiators, target use, price per product
- `references/my-quiz-results.md` — current decision tree → result mapping (update as catalog changes)

## Cross-skill chain

```
[brand-dna] → quiz visual styling
[ecom-quiz] → captures email + recommendation context
   ↓
[email-welcome] OR [quiz-specific follow-up] → nurture
   ↓
[email-campaigns] → long-term newsletter
```

## TODO before first run

- [ ] Pull 10-20 real CS tickets/reviews → `my-customer-research.md`
- [ ] Document product catalog differentiators → `my-product-catalog.md`
- [ ] Choose platform (Octane AI / Shop Quiz / Typeform / custom)
- [ ] Confirm email platform integration for capture
