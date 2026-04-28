# Owner's 3-2-2 Campaign Playbook (verbatim)

## Testing → Scaling lifecycle

**Testing campaign — ABO**
- Budget at ad-set level (forces equal spend across audiences)
- 3 ad sets × 3 creatives each = 9 creatives total
- Budget formula: **25 NIS × number of ads × 3 days**
- Goal: find winners. Not optimize. Find them.
- Review at day 3 (full results 4–5 days)

**Main campaign — CBO**
- Budget at campaign level (Meta distributes freely to best performer)
- One ad set initially (more added at scale)
- 3 creatives
- Daily budget at scale: **115 NIS/day**

## Post ID method (winner promotion)

When a creative wins in the ABO test → move to CBO via Post ID:
1. Edit testing campaign → preview the winning ad
2. Select "Facebook post with comments"
3. Copy the ID after `/posts/` in the URL
4. In CBO campaign → edit → "quick duplicate"
5. Delete older ads from duplicated content
6. In ad setup → "use existing post" → paste post ID

This preserves social proof (likes/comments) and accumulated learning.

## Hard rules

- **Max 3 ads per ad set.** Need a 4th? Open a new ad set.
- **Toggle off non-revenue-driven ads** to give budget to revenue-driven ones.
- **Do not delete the original test ad** as long as it's profitable.
- Always start campaigns for tomorrow 12AM midnight.
- Always include the date in the campaign + ad set name.

## Campaign config (Meta UI)

- Objective: **Sales**
- ADS catalog toggle: **off**
- Conversion location: always **website**
- Media setup: **manual upload**
- Format: **single image or video**
- CTA: **Shop Now** (only)
- Headline: **<40 chars** | Primary text: **<125 chars** + 4 benefits
- Enhancements: only `videos touch ups`, `text improvements`, `add video effects`
- Everything else inside creative setup: **off**

## Failure-diagnosis tree

| Symptom | Diagnosis |
|---|---|
| Low CTR | Creative problem |
| Good CTR, low ATC | Product / offer problem |
| Good ATC, low purchases | Website / checkout problem |
| Good everything but no profit | Offer problem |

## Non-profit case workflow

Look 4 days back. Use 3-day (short), 7-day (trend), 14-day windows.

From one winning ad: **3 new hooks + 2 new angles + 1 new CTA**. Tweak (hook voice or other parameters) to "relive" the video.

If 4 days after tweaking still not profitable → close campaign, redo with new creatives.
