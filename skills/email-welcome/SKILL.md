---
name: email-welcome
description: "Builds the 8-email Welcome Flow for new subscribers (7-14 days). Converts curious visitors into customers by overcoming the 4 core objections (legitimacy, product works, worth the price, trust). One-time setup per brand. Triggers on: welcome flow, welcome series, welcome email, new subscriber flow, first-time subscriber, klaviyo welcome."
user-invokable: true
---

# Email Welcome Flow (8 emails, 7-14 days)

One-time setup. Triggered when someone subscribes via popup/quiz/lead magnet. Goal: turn the curious visitor into the first-time buyer by overcoming objections.

## The 4 objections every welcome flow must overcome

1. Who is this brand?
2. Are they legit?
3. Does the product actually work?
4. Is it worth the price?

Each email targets one or more of these.

## The 8 emails

| # | Trigger | Purpose | Hits objection |
|---|---|---|---|
| 1 | Immediate (0 min) | Discount/offer delivery | Worth the price |
| 2 | +1 day | Founder story, brand mission, personal touch | Who is this brand |
| 3 | +2 days | Brand USPs — why we stand out | Are they legit / product works |
| 4 | +3 days | Discount reminder + urgency | Worth the price |
| 5 | +5 days | Social proof — reviews, testimonials, UGC | Are they legit / product works |
| 6 | +7 days | Educational content about the product | Product works |
| 7 | +10 days | Last-chance discount, heavy urgency | Worth the price |
| 8 | +14 days | Personal "everything okay?" text-based from founder, offer support | Trust, re-engagement |

## Process (when invoked)

### Step 1: Read context
- `brand-profile.json` (from `brand-dna` skill) — voice, colors, tone descriptors
- `references/my-brand-story.md` — founder story, mission, USPs
- `references/my-welcome-offer.md` — what discount, what code, expiry rule
- `references/my-social-proof.md` — your best reviews, UGC links, testimonial library
- `references/my-product-education.md` — how-to-use content, ingredient/material breakdowns
- Email platform from `social-funnel/references/my-funnel-tools.md` (Klaviyo / Mailchimp / Beehiiv)

### Step 2: Generate the 8 emails

For each email produce:
- **Subject line** (2 options for A/B testing)
- **Preview text** (40-90 chars)
- **Body copy** (skimmable, short sentences, scannable hierarchy — see `references/my-copywriting-rules.md`)
- **CTA primary** + **CTA secondary** (if applicable)
- **Image briefs** for any infographics needed (checklist, icon graphics, comparison chart)
- **Send delay** (per table above)
- **Trigger filter** (e.g. "subscribed AND 0 orders AND not in another flow")

Email 8 (the founder check-in) MUST be plain text only — no design, no images, looks like a personal email from the founder. This is the highest-converting email in the flow.

### Step 3: Generate platform-specific export

If user is on **Klaviyo**:
- Output as Klaviyo flow JSON or HTML-per-email + flow setup checklist
- Include trigger setup: List subscribed → flow filter → email blocks with delays
- Include profile property updates per email (e.g. set `welcome_flow_email_<n>_received: true`)

If on **Mailchimp / Beehiiv / other**:
- Output as 8 HTML emails + setup steps for that platform's Customer Journey / automation builder

### Step 4: Quality gates

Before output, verify:
- [ ] Each email has ONE clear CTA goal (not multiple competing asks)
- [ ] Email 1 delivers the actual code/offer (don't make them hunt)
- [ ] Email 4 and 7 reference the actual expiry from `my-welcome-offer.md`
- [ ] Email 5 uses real reviews from `my-social-proof.md` (no fabricated quotes)
- [ ] Email 8 has zero design (plain text only)
- [ ] Subject lines avoid words that trigger spam filters: FREE!!!, $$$, ALL CAPS, urgent words
- [ ] Total flow follows 2:1 educational:promotional from copywriting rules

### Step 5: Output

Write to `state/email-welcome/<run_id>/`:
- `flow-spec.md` — human-readable plan
- `emails.json` — all 8 emails structured for upload
- `setup-checklist.md` — exact platform clicks to wire it up
- `qa-checks.md` — what to verify before activating

## Copywriting rules (apply to every email)

- Skimmable: short sentences, bullet points, easy to scan
- Clear & concise: every sentence pushes the customer closer to the sale; cut all fluff
- Engaging: hook in the first line, no "Hi everyone, hope this finds you well"
- Avoid: telling subscribers they'll get "exclusive access, insights, sneak peeks" (they already know this is marketing)
- Banned phrases: see `references/my-copywriting-rules.md`

## Design rules

- Style reference: GRUNS (clean, modern ecommerce — see screenshots in your email doc)
- CTAs obvious and tappable
- Visual hierarchy
- Branding consistent with `brand-profile.json`
- Use infographics: checklists, icon graphics, feature diagrams, timelines, numbered lists, comparison charts, tables, flowcharts, graphs

## Deliverability rules (apply automatically)

- Footer trick: include invisible HTML text in footer to maintain image-to-text ratio (see `references/my-deliverability.md`)
- Don't email anyone unsubscribed in last 14 days
- Don't email role addresses (info@, support@) — they tank sender reputation

## Reference files

- `references/my-brand-story.md` — founder + mission + USPs (used by emails 2-3)
- `references/my-welcome-offer.md` — current offer + code + expiry
- `references/my-social-proof.md` — reviews, testimonials, UGC library (used by email 5)
- `references/my-product-education.md` — how-to-use, ingredients, materials (used by email 6)
- `references/my-copywriting-rules.md` — banned words, voice, sentence-length rule
- `references/my-deliverability.md` — sender reputation, footer trick HTML, metric goals

## Cross-skill chain

```
[social-funnel] → email captured → adds to list with source tag
   ↓
[email-welcome] → 14-day flow runs
   ↓
[email-campaigns] → after day 14, moves to general campaign list
   ↓
[email-postpurchase] → fires if/when they buy during welcome flow
```

## Required MCPs / Tools

| Tool | Status |
|---|---|
| Klaviyo (or chosen email platform) MCP/API | TBD — need API key per `my-funnel-tools.md` |
| `brand-dna` skill output | Should run before this skill |

## TODO before first run

- [ ] Confirm email platform → fill `social-funnel/references/my-funnel-tools.md`
- [ ] Write founder story → `my-brand-story.md`
- [ ] Set the welcome offer (code + expiry rule) → `my-welcome-offer.md`
- [ ] Compile 5-10 best reviews → `my-social-proof.md`
- [ ] Write product education content → `my-product-education.md`
