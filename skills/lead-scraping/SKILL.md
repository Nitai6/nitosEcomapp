---
name: lead-scraping
description: B2B + influencer lead scraping. Wraps Aviv's scrape-leads-global + scrape-leads-israel + firecrawl + scrape-leads-* + cold-email. Outputs enriched lead list to Supabase, hands off to emails-sms cold sequence.
trigger:
  manual: "/leads {industry} {region}"
  event: "lead-brief.json arrived"
mcp_dependencies:
  required:
    - supabase
  optional:
    - playwright
    - firecrawl
    - apify
inputs:
  - {industry}
  - {region}             # IL | global
  - {ICP}                # ideal customer profile
outputs:
  - state/lead-scraping/{batch}/leads.csv
  - state/lead-scraping/{batch}/enrichment.json
references:
  - ../../skills/_aviv/scrape-leads-global/SKILL.md
  - ../../skills/_aviv/scrape-leads-israel/SKILL.md
  - ../../skills/_aviv/firecrawl/SKILL.md
  - ../../skills/_aviv/cold-email/SKILL.md
self_heal: skills/_lib/self-heal.md
---

# Lead Scraping Agent

Output is a clean CSV ready for `emails-sms` cold sequence. Respects robots.txt + rate limits.

## Process

### Phase 1 — Source
- IL → `_aviv/scrape-leads-israel` (uses dun-bradstreet-il, ifat, theMarker indices)
- Global → `_aviv/scrape-leads-global` (Apollo / Hunter / Crunchbase patterns via firecrawl)

### Phase 2 — Enrich
Per lead: company size, funding round, tech stack (Wappalyzer-style), LinkedIn profile, decision-maker email pattern.

### Phase 3 — Score
Apply ICP rubric → keep top 30%, reject rest.

### Phase 4 — Handoff
Write to Supabase `cold_leads`. `emails-sms` reads from here for cold sequence (`_aviv/cold-email` template).

## Output contract
```
🔎 Leads — {batch}
Source: scrape-leads-israel
Sourced: 1,240
Enriched: 1,178
ICP-qualified: 384
Handed to emails-sms: ✅
```
