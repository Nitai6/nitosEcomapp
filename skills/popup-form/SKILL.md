---
name: popup-form
description: "Designs and builds an email signup popup that converts. Single input per step, 4-12s delay, covers 75% of screen, no X button. Generates A/B test plan. One-time setup, ongoing test loop. Triggers on: popup form, email signup popup, signup form, list builder popup, subscribe popup, klaviyo popup."
user-invokable: true
---

# Popup Form Builder + Optimizer

Builds the popup that turns first-time visitors into email subscribers. Most popup forms are bad. This skill enforces the rules that make them work.

## Common mistakes (avoid all of these)

- Offer isn't appealing
- Too many inputs from the user (asking name + email + phone in one shot)
- No time delay (immediate popup = bounce)
- Slow load (lag = close)
- Form too small / too tiny on mobile
- Too much copy
- Too much going on visually
- Offer is unclear
- Too easy to close ("X" button is fastest dismissal pattern)

## The Winning Checklist (every popup must pass)

- [ ] Asks for ONLY ONE input per step (multi-step popup beats single-step that asks for 3 things)
- [ ] Time delay 4-12 seconds before showing (gives user a chance to engage with the page first)
- [ ] Form loads instantly when triggered (no lag)
- [ ] Form covers at least 75% of the screen on mobile
- [ ] Under 10 words of copy
- [ ] Offer is the LARGEST visual element of the form
- [ ] No "X" close button. Use a "Close Form" text button placed UNDER the submit button (psychological friction to close)

## The 3 winning popup types

Use one of these patterns. Don't invent new ones.

### 1. Micro-Commit Quiz
- Step 1: "Quick question — what's your biggest [X]?" (3-5 options, button select)
- Step 2: "Where should we send your personalized [Y]?"
- Why it works: micro-commitment principle — once they answer the first question, completion rate jumps 3-5×

### 2. The Classic
- Step 1: "[Bold offer headline]. [Tiny subhead.]"
- Single email input + submit
- Why it works: simplicity, when offer is genuinely great

### 3. Uncover Your X
- Step 1: "Find your [X]" (curiosity-driven, often quiz-style preview)
- Step 2: Email capture for "results"
- Why it works: curiosity gap — they want to know

## Offer types that work

- **Curiosity angle**: "Find my [X]"
- **Free guide**: "Get [X] guide for free"
- **Giveaway entry**: "Enter giveaway for [X]"
- **Discount**: "% off your first order" (only works when discount is meaningful — 10% on a $20 product is weak)
- **Personalization**: "Get your custom [X]" (links to quiz)

Avoid: "Sign up for our newsletter" (zero value). "Get exclusive deals" (everyone says this, no one believes it).

## Process

### Step 1: Choose the pattern + offer
Read:
- `brand-profile.json`
- `social-funnel/references/my-lead-magnets.md` — your existing lead magnet library
- `references/my-popup-history.md` — what's been tested + winners

Pick: which of the 3 patterns + which offer (from your magnet library or a new one).

### Step 2: Write the copy

Hard cap: under 10 words on the headline. No body paragraph.

Example (Classic):
> "Get 10% off + your skin-type guide" (8 words)
> [email input]
> [SUBMIT]
> [Close Form]

Example (Micro-Commit Quiz):
> Step 1: "What's your biggest skin concern?" (8 words)
> [Acne] [Dryness] [Oil] [Aging] [Sensitive]
> Step 2: "Where should we send your routine?" (6 words)
> [email input]
> [SEND IT]
> [Close Form]

### Step 3: Design

- Form covers 75%+ of mobile screen
- Offer text is the largest element (bigger than the input field, way bigger than the submit button)
- Background dim/blur the page (focus on the popup)
- 1-2 visual elements max (one image OR one icon, not both)
- Branded colors from `brand-profile.json`
- High contrast on submit button

### Step 4: Trigger logic

Default trigger: 7-second time-delay (within the 4-12s window).

Other triggers (test these):
- **Exit intent**: cursor moves toward browser tab/close
- **Scroll depth**: 50% scrolled
- **Page count**: 2nd page in session

Skip rules:
- Don't show if user already subscribed (cookie check)
- Don't show on /cart or /checkout (kills conversions)
- Don't show twice in same session
- Show again after 30 days if dismissed (not 7 — too aggressive)

### Step 5: Set up A/B test plan

Test ONE variable at a time. Default test order:

1. **Offer** (e.g. 10% off vs. free guide vs. giveaway)
2. **Form type** (Classic vs. Micro-Commit Quiz vs. Uncover Your X)
3. **Close-form function** (button under submit vs. button beside submit vs. text link)
4. **Time delay** (5s vs. 8s vs. 12s vs. exit-intent)
5. **Photo / color content** (visual treatment)
6. **Text copy** (headline phrasing — only after offer is dialed in)

Run each test 14 days minimum. Need 1000+ visitors per variant to call winner. Ship winner. Test next variable.

### Step 6: Output

Write to `state/popup-form/<run_id>/`:
- `popup-spec.md` — pattern, offer, copy, design notes, trigger logic
- `popup-html.html` — ready-to-paste HTML (or platform-specific JSON: Klaviyo signup form, Privy form, etc.)
- `ab-test-plan.md` — first 6 tests in order with sample size + duration
- `tracking.md` — events to fire (popup_shown, popup_submitted, popup_dismissed)

## Tracking

Events:
- `popup_shown` (with variant ID)
- `popup_submitted` (with variant + email + offer claimed)
- `popup_dismissed` (with variant + dismiss method: close button, exit, ESC)

Compute weekly: show rate, submission rate (= conversion rate), dismissal rate, conversion-by-variant.

## Platform recommendations

| Platform | Best for |
|---|---|
| **Klaviyo Signup Forms** | If using Klaviyo for email — tightest integration |
| **Privy** | Standalone, multivariate testing baked in |
| **Justuno** | Advanced segmentation, more features |
| **Custom (your own React + Klaviyo API)** | Full control, no recurring fee |

Default: Klaviyo Signup Forms if your email platform is Klaviyo. Otherwise Privy.

## Quality gates

- [ ] All 7 winning checklist items pass
- [ ] Pattern is one of the 3 winning types (no Frankenstein hybrids)
- [ ] Offer is real and visible
- [ ] No "X" — close button only
- [ ] Mobile preview tested (75%+ screen coverage)
- [ ] Trigger is 4-12s delay (or exit-intent)
- [ ] A/B test plan defines winners' criteria

## Reference files

- `references/my-popup-history.md` — every variant tested + result
- `social-funnel/references/my-lead-magnets.md` — shared magnet library

## Cross-skill chain

```
[popup-form] → captures email
   ↓
[social-funnel] → tags source = "popup_<variant>"
   ↓
[email-welcome] → 8-email flow runs
```

## TODO

- [ ] Pick first offer from `my-lead-magnets.md`
- [ ] Confirm popup platform
- [ ] Wire to email platform for capture
