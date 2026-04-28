# Owner's Competitor Attribute Matrix (verbatim schema)

Every competitor (direct, indirect, aspirational) gets one row with these fields. From owner's Prompts 1 + 2.

## Schema

```json
{
  "id": "uuid",
  "brand_name": "...",
  "category": "direct | indirect | aspirational",
  "url": "...",

  "target_audience": "...",          // assumption
  "main_promise": "...",
  "brand_angle": "...",
  "main_offer": "...",
  "upsells_crosssells": ["...", "..."],
  "guarantees": "...",
  "scarcity": "...",
  "emotion_targeted": "...",

  "landing_page": {
    "style": "...",
    "cta": "..."
  },

  "creatives_and_ads": {
    "hooks": ["...", "..."],
    "angles": ["...", "..."],
    "formats": ["UGC", "static", "founder-talk"],
    "repeated_creatives": ["..."],   // VERY IMPORTANT per owner
    "active_ad_count": 14,
    "first_seen": "YYYY-MM-DD"
  },

  "product_price": 0.00,
  "estimated_aov": 0.00,
  "estimated_revenue": "Revenue ≈ Ad Spend × (AOV × CVR ÷ CPC)",

  "validation": {
    "page_transparency_age_days": 0,
    "active_ads_count": 0,
    "qualified": true
  },

  "source_prompt": "1 | 2"
}
```

## Field-by-field notes

- **target_audience** — assumption is fine; do not over-research
- **repeated_creatives** — owner emphasized this is VERY IMPORTANT. If a creative has been running 30+ days unchanged, that's a winner. Flag it.
- **scarcity** — count timers, "only X left", limited-edition language
- **emotion_targeted** — fear / status / comfort / speed / confidence / belonging
- **page_transparency_age_days** — older = more credible. < 90 days = de-prioritize unless ads are massive.

## Pattern extraction (Prompt 3 output)

Patterns object aggregates across all competitor rows:

```json
{
  "hook_patterns": [
    {"pattern": "...", "frequency": 7, "competitor_ids": ["..."]}
  ],
  "offer_patterns": [...],
  "guarantee_patterns": [...],
  "scarcity_patterns": [...],
  "lp_structure_patterns": [...],
  "format_patterns": [...],
  "price_clusters": [...]
}
```
