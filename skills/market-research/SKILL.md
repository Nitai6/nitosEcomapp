---
name: market-research
description: 9-prompt market research using Direct Response copywriter persona + Hormozi dream-outcome / obstacle-mapping / solution-mapping / silent-frustration frameworks. Produces customer avatar + offer brief that anchor branding, ads, website, emails.
trigger:
  manual: "/research start {product_url}"
mcp_dependencies:
  required:
    - supabase
  optional:
    - playwright   # competitor page scrape, Reddit/reviews ingest
inputs:
  - {product_url}                     # competitor product page URL
  - {target_audience}                 # who you're selling to
  - state/raw/reviews-and-reddit.txt  # 1000+ reviews / Reddit posts (Phase 9 input)
outputs:
  - state/market-research/copywriter-analysis.md         # Phase 1
  - state/market-research/research-doc.md                # Phase 3 (Deep Research output)
  - state/market-research/customer-avatar.json           # Phase 4
  - state/market-research/offer-brief.json               # Phase 5
  - state/market-research/dream-outcome.md               # Phase 6
  - state/market-research/obstacle-map.json              # Phase 7
  - state/market-research/solution-map.json              # Phase 8
  - state/market-research/silent-frustration.md          # Phase 9
references:
  - references/my-9-prompts.md
self_heal: skills/_lib/self-heal.md
---

# Market Research Agent

9 sequential prompts. Each builds on the prior. Owner approval gate after Phase 4 (avatar) and Phase 5 (offer brief).

## Process

### Phase 1 — Run Prompt #1 (copywriter analysis)

Send to Claude with persona = "expert copywriter, Direct Response specialist for e-commerce". Input = competitor product page URL. Get analysis + thoughts.

### Phase 2 — Run Prompt #2 (teach the research method)

Send the two Google Doc URLs (research method docs the owner provided). Have Claude analyze them and share thoughts. This grounds the model in the owner's research methodology.

### Phase 3 — Run Prompt #3 (Deep Research prompt builder)

Have Claude generate a comprehensive prompt for the Deep Research tool, specific to this product, this audience, asking Deep Research to consolidate findings into a single document **min 6 pages**.

Run Deep Research → save output to `research-doc.md`.

### Phase 4 — Run Prompt #4 (Customer Avatar Worksheet)

Fill the owner's Customer Avatar Worksheet template (Google Doc 1rYNvNd_2-r-1rpb3CST68RxdnOUXzXgX) using research output.

Output: `customer-avatar.json`.

**Owner approval gate.**

### Phase 5 — Run Prompt #5 (Offer Brief)

Fill the owner's Offer Brief template (Google Doc 1RF9lI60AtBRfaLkQF64oKG_7Q1XD6pf2) for this product.

Output: `offer-brief.json`.

**Owner approval gate.**

### Phase 6 — Run Prompt #6 (Hormozi Dream Outcome)

Using the avatar + Hormozi's dream outcome framework, produce:
1. Primary dream outcome in one sentence
2. How this outcome changes their status
3. The deeper emotional reason behind their desire
4. A foundational dream-outcome statement for the entire offer

Output: `dream-outcome.md`.

### Phase 7 — Run Prompt #7 (Hormozi Obstacle Mapping)

List **at least 15 obstacles** between customer and dream outcome. For each obstacle, score 4 dimensions:
- Likelihood of achievement
- Effort and sacrifice
- Time delay
- Perceived value

Output: `obstacle-map.json` — array of 15+ rows, each with the 4 dimension scores.

### Phase 8 — Run Prompt #8 (Solution Mapping)

Reverse every obstacle into a solution. Format: `PROBLEM → SOLUTION`. For each solution, name the **best delivery vehicle** (checklist, video, template, live call, community, done-for-you).

Goal: leave customer with zero reasons to say no.

Output: `solution-map.json`.

### Phase 9 — Run Prompt #9 (Silent Frustration)

Provide Claude with **1000+ Reddit posts and competitor reviews (1-star to 5-star)**. Ask: "Identify the silent frustration — the thing customers hate that no one is talking about."

Required input file: `state/raw/reviews-and-reddit.txt` (≥1000 entries — scrape via playwright if not pre-supplied).

Output: `silent-frustration.md`.

### Phase 10 — Persist & route

- Insert Supabase `brands.market_research_jsonb` (jsonb consolidating avatar + offer brief + dream + obstacles + solutions + silent frustration)
- Email digest with the dream outcome statement + top 3 obstacles + silent frustration
- Routes to:
  - `branding` (avatar + offer brief + competitors)
  - `ads-creative` (dream outcome + silent frustration → hooks)
  - `website-builder` (avatar + offer brief)
  - `emails-sms` (avatar + objection killers)

## Output contract

```
🔬 Market Research — {product}
Customer avatar: ✅
Offer brief: ✅
Dream outcome: "{one-sentence}"
Obstacles mapped: 18 / 4 dimensions
Solutions mapped: 18 / delivery vehicles assigned
Silent frustration: "{one-line}"
Research doc: 11 pages
```

---

## Owner's playbook (verbatim)

### Prompt #1
> You are my expert copywriter, and you specialize in writing highly persuasive marketing copy in a Direct Response style for my e-commerce brand. We sell this product (this is a competitor's website, but I sell the exact same product): [Insert the competitor's product page URL]. I want you to analyze it and share your thoughts with me.

### Prompt #2
> Great job! I am going to send you two documents that teach how to conduct in-depth research on your product in order to write high-level, persuasive marketing copy. Please analyze them and share your thoughts with me:
>
> https://docs.google.com/document/d/17xBN1-gCTJCP3EMFPGIBS4x0r_mz-Jun/edit?usp=sharing&ouid=104595503267740297362&rtpof=true&sd=true
>
> https://docs.google.com/document/d/1tCuhEFYt_vDsu4wUfyR19bpDOdzYjQ4t/edit?usp=sharing&ouid=104595503267740297362&rtpof=true&sd=true

### Prompt 3
> Excellent, now that you fully understand how to perform research, I want you to create a comprehensive prompt for the Deep Research tool so it can actually conduct the research for this product. Please be as specific as possible to receive the highest quality research. I am going to sell this product to an [X] audience. Additionally, specify that you want Deep Research to consolidate all findings into one document, with a minimum length of 6 pages.

### Prompt 4
> Amazing work! Now that you have fully completed the research phase, I want you to fill out the following Customer Avatar Worksheet template: https://docs.google.com/document/d/1rYNvNd_2-r-1rpb3CST68RxdnOUXzXgX/edit?usp=sharing&ouid=104595503267740297362&rtpof=true&sd=true

### Prompt 5
> Excellent work! Now that you have finished this, I want you to fill out the Offer Brief document template for this product. https://docs.google.com/document/d/1RF9lI60AtBRfaLkQF64oKG_7Q1XD6pf2/edit?usp=sharing&ouid=104595503267740297362&rtpof=true&sd=true

### Prompt 6
> using my avatar template you filled lately and using Alex Hormozi's dream outcome framework, please help me find and define my customers primary targets when purchasing. Please provide me with: 1) their primary dream outcome in one sentence 2) how this outcome changes their status 3) the deeper emotional reason bheind theyre desire. Then write me a dream outcome steatment to use at the foundation of my entire offer

### Prompt 7
> "My avatar is [paste avatar]. Their dream outcome is [paste dream outcome]. Using Hormozi's obstacle mapping method, list every single thing standing between my customer and their result. For each obstacle break it down across 4 dimensions: likelihood of achievement, effort and sacrifice, time delay, and perceived value. Give me at least 15 obstacles mapped across all 4 dimensions."

### Prompt 8
> "Here is my obstacle list: [paste from previous prompt]. Using Hormozi's solution mapping method, reverse every obstacle into a solution. Format each as: PROBLEM → SOLUTION. Then for each solution, tell me the best delivery vehicle, checklist, video, template, live call, community, or done-for-you asset. The goal is to leave my customer with zero reasons left to say no."

### Prompt 9
> "identify the silent frustration - the thing customers hate no one is talking about" (provide claude 1000+ competitors\reddit 1 - 5 star reviews.)
