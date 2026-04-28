---
name: seo
schedules:
  A_audit: "0 2 */5 * * Asia/Jerusalem"           # every 5 days 02:00 — full audit + autofix
  B_blog: "0 6 * * 1,3,5,0 Asia/Jerusalem"        # Mon/Wed/Fri/Sun 06:00 — blog mode (18 posts/mo)
trigger_skill: seo
budgets: { max_minutes: 240, max_usd: 8, max_tokens: 4_000_000 }
state_dir: state/seo/
notify: { on_complete: email, on_fail: email+telegram }
---

# Routine: seo

## Phase routing
- 02:00 every 5d → Mode A: full audit + aggressive Shopify autofix (alt text, meta, schema, images, broken links, H1, sitemap, hreflang, canonicals) + KW gap discovery
- 06:00 Mon/Wed/Fri/Sun → Mode B: deep blog post (Reddit/Quora/PubMed sourcing → outline → 2-6.5k word EEAT draft → schema → publish via Shopify)

## Dashboard contract
`state/seo/latest.json` + `latest-status.json` per run.
