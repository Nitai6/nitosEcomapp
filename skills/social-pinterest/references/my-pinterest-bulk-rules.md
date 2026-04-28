# Pinterest Bulk Rules

## Cadence
30–50 pins/day. More is better. Throttle only on API rate limit.

## Variant rule
Every queued asset → 5 variants. Never upload single.

## Variants
1. Original
2. 2:3 crop (Pinterest's preferred ratio is 2:3, e.g., 1000×1500)
3. Brand overlay text — 3 sub-variants of headline (test which copy converts)
4. Price/CTA badge corner
5. Seasonal frame (Christmas / summer / Black Friday — when applicable)

## SEO is real
Pinterest = visual search engine. Title + description fields are indexed.
- Title: ≤100 chars, lead with long-tail KW
- Description: 2–3 sentences with KW naturally + 5 hashtags
- Alt text: descriptive (accessibility + SEO)

## Boards
Every pin → ≥1 brand board. Set up at brand-onboarding via `board-map.json`:
- Boards by category (e.g., "Living Room", "Bedroom", "Office")
- Boards by lifestyle/aspiration (e.g., "Minimalist Living", "Cozy Mornings")
- Boards by season (e.g., "Holiday Hosting 2026")

## Asset queue producers
Every visual-producing skill writes to `pinterest_asset_queue`:
- `meta-ads` — every higgsfield-image ad generation
- `social-instagram` — carousel slides + static posts
- `seo` — blog hero images
- `ads-generate` — product photoshoots
- `screen-demo` — selected frame grabs

## Avoid
- Duplicate exact image to same board
- Hashtag stuffing (>10)
- Generic titles ("Cool product")
- Pinning same URL more than 5×/day (looks spammy)
