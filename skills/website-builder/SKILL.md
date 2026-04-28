---
name: website-builder
description: 6-step Shopify site build using Claude Design + Higgsfield (background video) + Motion.ai (animations) + Shopify MCP (push). Owner's homepage + product-page anatomy enforced as ≥75% rule. Outputs a deployed Shopify storefront aligned with the brand strategy blueprint.
trigger:
  manual: "/build site {brand}"
mcp_dependencies:
  required:
    - shopify
    - playwright   # Higgsfield, Motion.ai, Claude Design control
    - supabase
inputs:
  - state/branding/brand-strategy-blueprint.json
  - state/branding/copy-assets.json
  - state/market-research/customer-avatar.json
  - state/ads-competitor/patterns.json
outputs:
  - state/website-builder/site-spec.json
  - state/website-builder/hero-bg-video.mp4   # in Supabase Storage
references:
  - references/my-homepage-anatomy.md
  - references/my-product-page-anatomy.md
  - references/my-banner-formulas.md
  - references/my-website-build-prompts.md
  - ../copy-website/SKILL.md   # clone 2-3 inspiration sites before building
aviv_refs:
  - ../../skills/_aviv/landing-page/SKILL.md
  - ../../skills/_aviv/landing-page-builder-html/SKILL.md
  - ../../skills/_aviv/ui-ux-pro-max/SKILL.md
  - ../../skills/_aviv/spline-3d-integration/SKILL.md
self_heal: skills/_lib/self-heal.md
---

# Website Builder Agent

Six-step build. Claude Design does the design; Playwright drives Higgsfield/Motion/Shopify.

## Process

### Phase 1 — Inputs check

Required upstream JSONs: brand-strategy-blueprint, copy-assets, customer-avatar, competitor-patterns. If any missing → halt with `crit` alert.

### Phase 2 — Step 1: Site spec via Claude Design (Prompt 1)

Run **Prompt 1** (verbatim from `references/my-website-build-prompts.md`). Output is a site spec: hero copy, vibe, structure following the homepage + product-page anatomy at ≥75%.

Owner approval gate.

### Phase 3 — Step 2: Background video for hero

Run **Prompt 2** (verbatim) to produce:
1. An **image prompt** for hero background still
2. A **video prompt** that animates the still — start frame = end frame (endless loop), no camera movement, no text overlay

Execute via Playwright:
- Higgsfield text-to-image (image prompt) → save to `state/website-builder/hero-bg-frame.png`
- Higgsfield image-to-video (image + video prompt) → save to `state/website-builder/hero-bg-video.mp4`

### Phase 4 — Step 3: Hi-fi prototype in Claude Design

Open Claude Design via Playwright. Start a hi-fi prototype prefilled with the brand name, palette, and the hero video.

### Phase 5 — Step 4: Sketch + motion library

- Build a sketch of the full website honoring ≥75% of the building rules
- Add the mp4 hero video
- Visit motions.ai → pick 2 motions
- Find other websites the owner liked → extract the parts to mimic (with adaptation to our business)

### Phase 6 — Step 5: Final assembly via Claude Design (Prompt 3)

Run **Prompt 3** (verbatim) with the sketch, hero video, motion picks, other-site references, and all upstream inputs. Result: a complete site spec.

Owner plays with it. **Optimize for phone.**

### Phase 7 — Step 6: Push to Shopify

Use Shopify full-access MCP (frontend + backend). Push:
- Theme files
- Sections per the homepage anatomy
- Product templates per the product page anatomy
- Pages: About, Contact, FAQ, Shipping, Returns
- All copy from `copy-assets.json`
- Background video uploaded to theme assets

### Phase 8 — Persist
- Write `site-spec.json` (final)
- Insert Supabase `routine_runs` row
- Email digest with the live URL

## Output contract

```
🌐 Website — {brand}
Hero copy: "{headline}"
Hero video: ✅ generated + embedded
Anatomy compliance: 87% (above 75% gate)
Motion picks: 2
Pages built: 7
Live URL: https://{brand}.myshopify.com
```

---

## Owner's playbook (verbatim)

### 4. Building websites

When we are want to build website we will want to use the 4 steps to generate the final output.

The first move is to prompt to claude the following:

**Prompt 1:**
> "I want to build a website using cloud design, and I'm looking for some inspiration on the type of website I should build. the product i sell is[X], the brand rules are[X], the marketing research we did and the potential avatar of a customer are [X] & [X], our competitors we found from the competitors research are [X]. What should the hero section and the actual copy be like? What should the vibe be like? Help me build an example brand website and give me a spec for this website. Every website should follow at least 75% of this following building rules [X]."

*If agreed by user - follow to next*

**Prompt 2:**
> "Awesome, I want to create a video that will play in the background of the hero section and it will just be on an endless loop. I need a video idea that will fit the vibe and will have a wow factor for people that go to our website. We should also be thinking about the text that will be displayed on the hero section. The background video will not include any text, but it has to have room where we could insert a block for the hero text and subtext.
> What I need is for you to give me an image prompt for this background and then give me a video prompt in order to animate that background in a way that, like I said, isn't distracting but has a wow factor and fits the vibe of what we're trying to sell here, the brand we're trying to sell. The video prompt should not have any camera movement because we want the start frame and the end frame for this video to be the same so it feels more like an endless loop."

*Copy the image prompt if agreed and paste in higgsfield then use image and paste in image to video and add the video prompt.*

**Step 3:** Now we need to go to claude design and start with a "high fidelity" prototype. We will name it based on our brand name.

**Step 4:** We will build a sketch of our full website based on the "At least 75%" of the website building rules (see later in doc). After this we will add the mp4 video we created in prompt 2.
- User/claude needs to go to motions.ai and choose two motions & choose other websites liked parts.

**Step 5:** We will want to add this prompt to claude design:

**Prompt 3:**
> "Hey Claude Design, I've given you a couple things. I've got a sketch which is just my basically idea for the website. There's going to be a lot going on, which you will be on your own to figure out what that should look like (play kinda with the rules). I've given you the video. This is a video that I want you to be playing on an endless loop in the background and you should see that the hero text will be on the left side compared to that. I also added animation from motions Ai that i liked + other websites part i loved (make them relevant to my business). And then I added the following: product i sell is[X], the brand rules are[X], the marketing research we did and the potential avatar of a customer are [X] & [X], our competitors we found from the competitors research are [X]. What should the hero section and the actual copy be like? What should the vibe be like? Help me build an example brand website and give me a spec for this website. Every website should follow at least 75% of this following building rules [X]."

*Now user needs to play around with it based on his preferences & to tell claude to optimize it for the phone.*

**Step 6:** Claude needs to push to shopify using shopify full access frontend + backend mcp.

### Ideal Home page

```
[Scarcity / benefit + trust announcement bar]
[reviews indicator]
[banner] - [banner image formula] = [Person] + [Outcome] + [Emotion]. Must be positive, exciting.
[banner] - [banner text formula]: [BENEFIT] = [DESIRED RESULT] + [LOWER EFFORT / LOWER COST / LOWER RISK OF PAIN POINT]
   Thumb rules for banner text: 6-12 words max | focuses on outcome, not process | Sounds good when read fast | Emotional, not technical | No commas if possible.
[banner] - [primary cta] = more precise & specific.
[banner] - [secondary cta] = broader
[banner] - [Subheadline text formula]: [Simple Mechanism] + [Key Benefit]
[benefits moving text…..]
[Clear Pathways Forward]
[shop e.g bestsellers]
[Trust badges]
[Problem - solution] flow + CTA
[product grid]
[social proof section of UGC Carousel with photos or videos of customers wearing your kits]
[Two rare collections square grid]
[Urgency]
[Skimable Benefits]
[Products]
[Quiz as Lead magnet]
[FAQ]
[Our story text]
[Footer]
```

### Ideal Product page

> TO CREATE OUR PRODUCT PAGE AND ADS WE CAN USE THIS PROMPT: PROMPT.

```
[minimum 5 images + one style or branded image]
[title with keyword]
[ready to ship green]
[price + compare at price]
[review rating text]
[3 benefits bullet points or review carousel]
[variants etc…]
[bundle of 3]
[shopping button]
[credit card images trust]
[3 trust badges and text e.g: 30 days returns]
[details in shelfs points]
[description at least 200 words and bold key features points + Video if possible]
[benefits moving text…..]
[three gifs with touching one each one: pain point, pleasure point, solidarity point.]
[reviews section]
[1-3 benefits points squares]
[FAQ]
[You may also like…]
```

### Creating models

> Using everything from this doc - go to pinterest and find 2 womans and 2 man "models", then go to higgsfield and change them a bit (pose, clothes, colors a bit).
>
> Thats your models, you will use them on ads section.
