# Camila Markson — 8-Prompt Instagram Growth Library (verbatim)

Owner-curated prompts. Used by `social-instagram` agent for every reel/carousel/plan/DM generation. These override external sub-skill defaults.

---

## Prompt 1 — Viral content ideation

> Act as a social media strategist specializing in [niche]. Identify 10 currently viral trends, audio clips, content formats, or hooks on Instagram Reels for the [niche] space. Then turn those into 5 explosive content ideas tailored for my brand: [brand description]. Each idea must include: the trend it leverages, the hook (first 3 seconds), the structure, and why it would go viral.

---

## Prompt 2 — Pain → 10-word Reels hook

> Here are 10 painful problems my audience faces: [list 10 pain points]. Turn each into a Reels hook in 10 words or less. The hook must stop the scroll, feel personal, and create curiosity. Format as a list. No fluff.

---

## Prompt 3 — 30-second Reels script

> Write a 30-second Reels script for [topic] using this 3-part structure:
> 1. Hook (first 3 seconds — must stop scroll)
> 2. Story / value (20 seconds — deliver the promise)
> 3. CTA (last 5 seconds — comment a keyword, save, or follow)
>
> Tone: [tone from brand-strategy-blueprint]. No corporate phrasing. No "in this video." Start mid-sentence.

---

## Prompt 4 — Social proof short phrases

> I had this result for my client / for me: [result]. Turn it into 5 short social-proof phrases, each up to 10 words, that I can overlay on a Reel or use as a carousel cover. Phrases must feel earned, not braggy.

---

## Prompt 5 — Saves-bait practical tips

> Give me 5 practical, little-known tips on [topic] that my audience would screenshot or save. Each tip must be specific, actionable, and counter-intuitive. Format each as a 1-line headline + 2-line explanation. Goal: maximize saves.

---

## Prompt 6 — Hormozi starving-crowd avatar

Answer these 4 questions, then synthesize the final avatar:
1. Who is **already buying** in this space, urgently and repeatedly?
2. What are they **frustrated** about with current solutions?
3. What **outcome** are they desperate for that nobody is delivering?
4. Where are they **gathering** (subreddits, FB groups, hashtags, podcasts)?

> Final avatar: name, age, daily routine, top 3 frustrations, dream day, the language they use, where to find them.

---

## Prompt 7 — 14-day Instagram content plan

> Build a 14-day Instagram content plan for [brand] in [niche]. Mix:
> - **Reels** (6 — viral hooks, transformation stories)
> - **Carousels** (4 — saves-bait tips, frameworks)
> - **Stories** (daily — behind-scenes, polls, DM bait)
>
> Map each post to ONE pillar: **Trust / Problem / Transformation / CTA**. Goal: warm cold viewers → DM → offer. Output as table: Day | Format | Pillar | Hook | CTA.

---

## Prompt 8 — 3-part DM automation sequence

> Build a 3-part DM sequence triggered when a user comments **[keyword]** on a Reel about [topic].
>
> **DM 1** (instant): friendly hook + deliver the freebie / link
> **DM 2** (24h later): qualify — ask 1 question to segment
> **DM 3** (48h later): soft offer — invite to [next step: book call / shop / quiz]
>
> Output as JSON:
> ```json
> {
>   "trigger_keyword": "...",
>   "dm_1": {"delay": "0m", "body": "..."},
>   "dm_2": {"delay": "24h", "body": "...", "question": "..."},
>   "dm_3": {"delay": "48h", "body": "...", "cta_url": "..."}
> }
> ```

---

## Usage rules

- Every generated reel/carousel must pass through Prompt 6 (avatar) first — that anchors language and pain.
- Prompt 2 (pain→hook) is the default hook generator. Beats any external skill's hook lib.
- Prompt 3 (script) is the only reel script template — never freestyle.
- Prompt 7 (14-day plan) regenerates every Sunday for the upcoming 2 weeks.
- Prompt 8 (DM sequence) output JSON is the contract for the DM-automation tool (Superprofile).
