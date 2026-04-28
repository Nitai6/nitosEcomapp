# Owner's 9 Market-Research Prompts (verbatim)

The full text of each prompt lives in `../SKILL.md` under "Owner's playbook (verbatim)". This file is a quick index.

| # | Purpose | Input | Output file |
|---|---|---|---|
| 1 | Copywriter analysis of competitor product page | competitor product URL | `copywriter-analysis.md` |
| 2 | Teach Claude the research method | 2 Google Doc URLs | (in-context) |
| 3 | Build Deep Research prompt | audience [X], min 6-page output | `research-doc.md` |
| 4 | Fill Customer Avatar Worksheet | research-doc | `customer-avatar.json` |
| 5 | Fill Offer Brief | avatar + research-doc | `offer-brief.json` |
| 6 | Hormozi Dream Outcome | avatar | `dream-outcome.md` |
| 7 | Hormozi Obstacle Mapping (≥15, 4 dimensions) | avatar + dream | `obstacle-map.json` |
| 8 | Hormozi Solution Mapping + delivery vehicles | obstacles | `solution-map.json` |
| 9 | Silent Frustration | 1000+ Reddit + reviews | `silent-frustration.md` |

## Required inputs not in repo

- 2 Google Docs (Prompt #2): research method
- Customer Avatar Worksheet template (Prompt #4): Google Doc `1rYNvNd_2-r-1rpb3CST68RxdnOUXzXgX`
- Offer Brief template (Prompt #5): Google Doc `1RF9lI60AtBRfaLkQF64oKG_7Q1XD6pf2`
- 1000+ reviews/Reddit posts (Prompt #9): scrape into `state/raw/reviews-and-reddit.txt`

## Hormozi 4-dimension obstacle scoring

Each obstacle gets 4 sub-scores 1-10:
1. **Likelihood of achievement** — how probable customer succeeds without help
2. **Effort and sacrifice** — physical/mental cost
3. **Time delay** — how long until result
4. **Perceived value** — how much they think it's worth

## Hormozi delivery vehicles

When reversing obstacle → solution, name one:
- Checklist
- Video
- Template
- Live call
- Community
- Done-for-you asset

## Routing after completion

- Avatar + offer brief → branding skill (Phase 1 inputs)
- Dream outcome + silent frustration → ads-creative (hook source)
- Obstacles → website-builder (objection-killer FAQ + trust signals)
- Solutions + delivery vehicles → emails-sms (welcome flow + post-purchase)
