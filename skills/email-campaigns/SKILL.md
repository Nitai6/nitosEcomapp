---
name: email-campaigns
description: "Weekly email campaign engine. Builds the campaign calendar (3 sends/week, 2:1 educational:promotional), generates ideas via macrotopic/microtopic ChatGPT framework, writes campaigns from 30-type library, and applies segmentation + deliverability rules. Run weekly. Triggers on: email campaign, newsletter, weekly email, klaviyo campaign, campaign calendar, content calendar email."
user-invokable: true
---

# Email Campaign Engine (weekly)

Builds and writes the recurring email campaigns that go out 3× per week to engaged segments. NOT one-time flows (those are `email-welcome`, `email-abandon`, `email-postpurchase`). This is the ongoing newsletter machine.

## Cadence rules (non-negotiable)

- **Frequency**: 3 campaigns per week (optimal — more risks fatigue, less risks list decay)
- **Educational:Promotional ratio**: 2:1 (2 educational + 1 promotional per week)
- **Send only to engaged segments** — never blast the full list (kills sender reputation)

## The Macrotopic / Microtopic Framework

Run once a quarter (or when you need new ideas):

```
Prompt to AI:
"I have a [niche] brand that sells [products and their purpose].
Our brand is meant to [2-3 sentences of brand info and mission / benefits].
Our average customer [5-6 sentences about demographics, daily life, desires, wants, needs].
I want you to give me 3 overarching topics that my brand can create content about.
The topics should be very general and tie into product benefits and the customer's life.
Then with those 3 topics, give 4 subtopics under each.
Subtopics should be specific and educate the customer, potentially positioning our products as a solution."
```

Result: 3 macrotopics × 4 microtopics = **12 microtopics**. Each microtopic = 1 email campaign. With 2 educational sends/week = ~6 weeks of educational content from one framework run.

## Pre-campaign research

Before writing each campaign, scrape relevant sources for fresh data:
- PubMed / scientific abstracts (if niche is health/beauty)
- Reddit (genuine customer language + problems)
- Industry blogs / news
- Competitor email archives (via tools like MailCharts)

Goal: ground the email in a real, current insight or data point — not generic advice.

## The 30 Campaign Types (rotate)

For each microtopic, pick ONE of these 30 angles. Don't repeat the same angle within 30 days for the same audience.

1. One Benefit Feature
2. One Feature
3. FAQ
4. What's Inside
5. How It's Made
6. How To Use
7. Back In Stock
8. Trending
9. Testimonials
10. Us vs Them
11. Myths vs Facts
12. Blog Promo
13. Research Study Highlight
14. Holiday Email
15. Progress Update
16. Customer Transformation
17. Before vs After
18. Puzzles / Riddles
19. Note From The Founder
20. Gift Guide
21. Treat Yourself
22. Media Publications
23. Behind The Scenes
24. Tips and Tricks
25. UGC Content
26. Sneak Peek
27. Flashback Friday / Throwback Thursday
28. Staff Picks
29. Brand Values
30. Text-only (ELITE tier — drives the highest engagement on key info)

## Process

### Step 1: Build the calendar (run once per month)

Read:
- `references/my-calendar-anchors.md` — key dates: holidays (Israeli + Jewish), product launches, sales windows, brand-specific dates
- `references/my-microtopics.md` — current quarter's 12 microtopics
- `references/my-recent-campaigns.md` — log of last 60 days of sent campaigns (avoid type repetition)

Build a calendar:
- Insert anchor dates first (sales, holidays, launches)
- Fill in supplementary emails (teasers before sales, reminders, follow-ups)
- Distribute 3 campaigns/week with 2:1 ratio

### Step 2: Write each campaign

For the campaign you're producing:
1. Pick a microtopic
2. Pick a campaign type from the 30 (avoid recent repeats)
3. Pick a target segment (default: 30/60/90-day engaged)
4. Research: scrape 1-2 fresh sources for grounding
5. Write: subject (2 options) + preview + body + CTA + image briefs

### Step 3: Apply copywriting rules
- Skimmable: short sentences, scannable
- Concise: every sentence pushes toward a goal (click, reply, save)
- Engaging hook: first line must earn the second
- Avoid filler: never say "exclusive access, sneak peek, insights" — let the content prove it
- See `references/my-copywriting-rules.md`

### Step 4: Apply design rules
- GRUNS-style ecommerce design
- Use infographic types: checklists, icons, feature diagrams, timelines, numbered lists, comparisons, tables, flowcharts, graphs
- Branding consistent with `brand-profile.json`
- Mobile-first preview check

### Step 5: Apply deliverability protections
- Footer trick: invisible text to balance image:text ratio
- Sending segment: 30/60/90-day engaged only (start narrow, expand as open rate proves out)
- Skip: anyone unsubscribed, anyone in another active flow, anyone who didn't open last 4 sends

### Step 6: Output

Write per campaign to `state/email-campaigns/<run_id>/<campaign_id>/`:
- `campaign-spec.md`
- `email.json` (subject, preview, body HTML, blocks, CTA)
- `image-briefs.md` (for `ads-generate` to produce visuals)
- `target-segment.json`
- `qa-checks.md`

Write monthly to `state/email-campaigns/<run_id>/calendar.md` — the full month plan.

## Segmentation (which list gets which campaign)

| Segment | Definition | Cadence |
|---|---|---|
| 30-day Engaged | Subscribed + opened/clicked in 30d + 0 bounces | 3×/week (base) |
| 60-day Engaged | Same, 60d | 3×/week if 30d open rate >40% |
| 90-day Engaged | Same, 90d | 3×/week if 60d open rate >40% |
| 120-day Engaged | Same, 120d | Add only if 90d open rate >40% |
| Unengaged | Hasn't opened in 90d+ | 1×/month re-engagement only |
| Collection Interest | Viewed/carted/purchased a category | +1-2 extra/month with category-specific content |
| Cross-sell | Bought X → eligible for Y campaign | When Y campaign runs |
| "Received X but didn't open" | Non-openers from a specific past send | Re-send with new subject line |

Sender Reputation Rebuild Protocol (use if open rates drop below 35%):
- **Weeks 1-3**: pause non-essential automations, send only to last-14-day engaged
- Hit a target: wait until that group's open rate is consistently 50%+
- **Weeks 3-6+**: gradually expand to 30/60/90/120-day groups
- Maintain: only expand a tier when current tier holds 40-50% open rate
- Never send regular campaigns to people unengaged for 90+ days

## Deliverability metric goals

| Metric | Goal |
|---|---|
| Open rate | >45% |
| Click rate | >1% |
| Bounce rate | <1% |
| Spam complaint rate | <0.01% |
| Unsubscribe rate | <0.5% |

If any metric breaches: stop sending to that segment, investigate before next campaign.

## Reference files

- `references/my-microtopics.md` — current 12 microtopics from the framework run
- `references/my-calendar-anchors.md` — holidays, sales, launches
- `references/my-recent-campaigns.md` — log of last 60 days (auto-updated)
- `references/my-copywriting-rules.md` — banned words, voice (shared)
- `references/my-deliverability.md` — sender rep, footer trick HTML, metric thresholds (shared)
- `references/my-segments.md` — segment definitions specific to your platform

## Cross-skill chain

```
[brand-dna] → brand voice
[email-welcome / email-abandon / email-postpurchase] → flow subscribers
   ↓
[email-campaigns] → ongoing newsletter to engaged subscribers
   ↓ (sends drive)
[ads-meta] → Meta retargeting on engaged readers
[social-funnel] → cross-promotes lead magnets to grow list
```

## Required MCPs / Tools

- Email platform (Klaviyo strongly preferred for segment depth)
- Web scraping (Playwright + Firecrawl) for pre-campaign research
- `brand-dna` skill output

## TODO before first run

- [ ] Run macrotopic/microtopic prompt → fill `my-microtopics.md`
- [ ] Build calendar anchor list → `my-calendar-anchors.md`
- [ ] Define your platform's segment IDs → `my-segments.md`
- [ ] Confirm email platform connected
