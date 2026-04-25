---
name: social-funnel
description: "Designs and operates the FUNNEL beneath your social content — comment-trigger DMs, bio-link sequencing, story-poll-to-DM, lead magnet delivery, IG-to-email handoff, and IG-to-Meta-retargeting bridge. Sits ON TOP of content skills (social, carousel-machine2). Use when user says social funnel, comment trigger, ManyChat, link in bio, lead magnet, DM automation, story poll funnel, IG to email."
user-invokable: true
---

# Social Funnel Engine

Aviv's content skills produce posts and Reels with CTAs like "כתבו 'מבנה' בתגובות ואשלח לכם". This skill builds and operates the INFRASTRUCTURE that catches those CTAs and turns engagement into email subscribers, customers, and retargeting audiences.

## What this skill does (vs Aviv's skills)

| Aviv | This skill |
|---|---|
| Writes the comment CTA | Sets up the bot that DMs them when they comment |
| Says "link in bio" | Designs the bio-link page + sequence behind it |
| Says "drive traffic to email" | Builds the actual handoff (lead magnet → email list → segment) |
| Posts content | Tracks conversion: comment → DM → click → email → ad retarget |

## The 5 Funnel Patterns

### 1. Comment-Trigger DM Funnel (the Aviv classic, automated)

**Trigger**: Reel CTA = "כתבו 'X' בתגובות ואשלח לכם [lead magnet]"

**Flow**:
1. Reel posted → users comment trigger word
2. Bot detects comment via IG webhook (Meta Graph API) or ManyChat
3. Bot replies to comment publicly: "‎שלחתי לך 🚀" (boosts post engagement)
4. Bot sends DM with lead magnet link
5. Lead magnet page captures email
6. Email enters Welcome Flow (`email-welcome` skill)
7. User added to "social-comment-leads" Meta Custom Audience for retargeting
8. Conversion tracked: which Reel → how many comments → how many DMs sent → how many emails captured → how many bought

**Tools needed**: ManyChat (easiest) OR Meta Graph API + webhook server. Klaviyo/email platform for capture.

### 2. Bio-Link Funnel

**Trigger**: User clicks bio link from any post/profile visit

**Flow**:
1. Bio link → branded landing (Stan / Beacons / Linktree / custom Shopify page)
2. Page presents 3-5 destinations max:
   - Latest product
   - Free guide / lead magnet
   - Best seller
   - Quiz (if `ecom-quiz` skill is active)
   - Contact / DM button
3. Track click-through per destination → identifies what bio-traffic actually wants
4. Quiz takers and lead-magnet downloaders enter email flows
5. All bio-link visitors retargetable via Meta Pixel on the page

**Best practice**: rotate the top destination weekly to test what your audience pulls toward.

### 3. Story Poll → DM Funnel

**Trigger**: Story poll question with intent signal (e.g. "Which of these problems do you have? A: X B: Y")

**Flow**:
1. User votes A or B
2. Manual or ManyChat DM follow-up: "saw you voted [A]. We have a guide on exactly that — want me to send?"
3. If yes → DM lead magnet → same as Pattern 1 from step 4

**Why it works**: votes are micro-commitments; DM follow-up has near-100% open rate.

### 4. Lead Magnet → Email Sequence Handoff

**Trigger**: Anyone who gives email anywhere on social (DM, bio, quiz, popup, comment trigger)

**Flow**:
1. Email captured → tagged with source (`source: ig_reel_<reel_id>`, `source: bio_link`, `source: story_poll`)
2. Auto-add to Welcome Flow (8 emails per `email-welcome` skill)
3. Tag-based segmentation downstream (e.g. "came from Reel about X" → next campaign on X resonates more)
4. After 14 days, move to general newsletter list

**Handoff schema** (data passed to email skill):
```json
{
  "email": "...",
  "source": "ig_reel_<reel_id>|bio_link|story_poll|comment_trigger|quiz",
  "first_touch_content": "<reel_title or bio_destination>",
  "language": "he|en",
  "captured_at": "ISO-8601"
}
```

### 5. IG → Meta Retargeting Bridge

**Trigger**: Anyone who engaged on IG/FB in last 30/60/90 days

**Flow**:
1. Build Meta Custom Audiences from:
   - Instagram engagers (anyone who liked/commented/DM'd in last 60d)
   - Page engagers (FB)
   - Video viewers (anyone who watched 50%+ of any Reel)
   - Lead Magnet email captures (uploaded as Customer File audience)
2. Run Meta ads targeting these audiences with bottom-of-funnel creative (product, offer, social proof)
3. Build 1% Lookalike Audience from "lead magnet captures" → cold prospecting
4. Connects to `viral-loop` skill (5-star reviewers → custom audience → 1% LAL → UGC ads)

**Refresh cadence**: weekly via `routines/social-funnel-sync` (to be created).

## Process (when invoked manually)

The user describes what funnel they want. You:

1. **Identify pattern** — which of the 5 above (or a hybrid)?
2. **List required tools** — ManyChat? Meta Graph API? Klaviyo? Stan? Shopify?
3. **Check what's installed** — read `~/.claude/mcp-status.md` (TODO file) to see current MCPs
4. **Design the flow** as a numbered step-by-step + diagram
5. **Generate setup checklist** — exact things the user must click/configure manually (bot setup, Meta app permissions, webhook URLs)
6. **Generate copy** — every text the user needs (DM auto-reply, comment public reply, lead magnet email subject + body, bio-link page copy)
7. **Define tracking** — what conversion event to fire at each step, what to measure weekly
8. **Output** to `state/social-funnel/<run_id>/funnel-plan.md` + `setup-checklist.md` + `copy-deck.md`

## Reference Files

- `references/my-funnel-tools.md` — which platforms you actually use (ManyChat vs custom, Klaviyo vs Mailchimp vs Beehiiv, Stan vs Linktree vs custom Shopify page)
- `references/my-lead-magnets.md` — your library of free guides/checklists/quizzes/resources, what each one offers, who it's for
- `references/my-trigger-words.md` — list of comment trigger words you've used (avoid duplicates) + which Reel each ties to
- `references/my-funnel-metrics.md` — current funnel benchmarks (e.g. Reel → comment rate, comment → DM open rate, DM → email rate, email → purchase)

## Required MCPs / Tools

| Tool | Purpose | Setup difficulty |
|---|---|---|
| ManyChat | Comment-trigger DM automation (easiest path) | Low — UI based |
| Meta Graph API + webhook | Custom comment-trigger automation | Medium — needs Meta App + server |
| Klaviyo (or Mailchimp/Beehiiv) | Email list + flows | Low — API exists |
| Stan / Beacons / Linktree | Bio-link page (or custom Shopify page) | Low |
| Meta Ads MCP | Custom Audience uploads, lookalike build | Already in plan |
| Supabase | Funnel tracking + handoff state | Have it |

## Cross-skill chain

```
[content skill] → posts Reel/carousel/story
   ↓
[social-funnel] → catches engagement, delivers lead magnet, captures email
   ↓
[email-welcome] → 8-email welcome flow
   ↓
[email-campaigns] → ongoing 3x/week sends
   ↓
[viral-loop] → 5-star buyers become UGC ad audience
   ↓
[ads-meta] → audit performance of all of the above
```

## TODO (user input needed)

- [ ] Confirm: ManyChat or custom Meta Graph API for DM automation?
- [ ] Email platform: Klaviyo, Mailchimp, Beehiiv, or other?
- [ ] Bio link platform: Stan, Beacons, Linktree, or custom Shopify page?
- [ ] List your existing lead magnets → `my-lead-magnets.md`
- [ ] Provide your current funnel metrics if known → `my-funnel-metrics.md`
- [ ] Confirm Meta Ad account access for Custom Audience uploads (already in `docs/meta-auth-setup.md` plan)
