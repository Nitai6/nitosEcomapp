---
name: branding
description: 2-prompt branding bible. Prompt 1 = Brand Strategy Blueprint (8 deliverables — positioning, core idea, personality, messaging, tone, story, visual direction, trust system). Prompt 2 = 25 finalized copy assets across 7 phases (Core Brand Assets, Storefront, Conversion Engine, Checkout, Email/SMS, Top of Funnel, CX). Owner approves between prompts.
trigger:
  manual: "/branding setup {brand}"
mcp_dependencies:
  required:
    - supabase
inputs:
  - state/market-research/customer-avatar.json   # optional but strongly preferred
  - state/market-research/offer-brief.json       # optional but strongly preferred
outputs:
  - state/branding/brand-strategy-blueprint.json
  - state/branding/copy-assets.json              # 25 deliverables
references:
  - references/my-brand-strategy-prompt.md
  - references/my-25-deliverables-prompt.md
  - references/my-brand-guardrails.md
aviv_refs:
  - ../../skills/_aviv/marketing-psychology/SKILL.md
  - ../../skills/_aviv/marketing-ideas/SKILL.md
  - ../../skills/_aviv/storytelling/SKILL.md
  - ../../skills/_aviv/free-tool-strategy/SKILL.md
self_heal: skills/_lib/self-heal.md
---

# Branding Agent

Once-per-brand. Two-stage: blueprint → copy. Owner gate between stages.

## Process

### Phase 1 — Inputs check

Required (per owner's prompt):
1. Product category & price range
2. Target customer (age, gender, mindset)
3. Core pain or desire this product solves
4. Emotional triggers (fear, status, comfort, speed, confidence, etc.)
5. Competitors & similar products
6. Traffic source (TikTok / Meta / Google)
7. Desired brand vibe (premium, viral, clean, aggressive, minimal, etc.)

If any missing → stop and ask owner.

### Phase 2 — Run Prompt 1 (verbatim from `references/my-brand-strategy-prompt.md`)

Generates the **Brand Strategy Blueprint** — 8 deliverables:
1. Brand Positioning
2. Core Brand Idea
3. Brand Personality
4. Messaging Framework
5. Tone of Voice
6. Dropshipping Brand Story
7. Visual Direction (Conceptual)
8. Brand Trust System

Output: `state/branding/brand-strategy-blueprint.json`. Write to Supabase `brands.brand_strategy_blueprint` (jsonb).

### Phase 3 — Owner approval gate

Email digest of blueprint. Halt until owner replies "approved" (sets `brands.branding_approved_at`).

### Phase 4 — Run Prompt 2 (verbatim from `references/my-25-deliverables-prompt.md`)

Generates the 25 finalized copy assets across 7 phases:

**Phase 1: Core Brand Assets** — 1) Tagline, 2) Elevator Pitch, 3) Manifesto

**Phase 2: Storefront** — 4) Hero Headline, 5) Hero Sub, 6) Hero CTA, 7) Trust Bar, 8) Category Hooks, 9) Social Proof Header

**Phase 3: Conversion Engine** — 10) Product Description Hook, 11) Core Mechanism Explainer, 12) Shipping Accordion, 13) Objection-Killing FAQ

**Phase 4: Checkout & Retention** — 14) Cart Drawer, 15) Checkout Guarantee, 16) Thank-You Page

**Phase 5: Backend (Email/SMS)** — 17) Welcome #1, 18) Welcome #2, 19) Abandoned Cart #1, 20) Viral Loop Email

**Phase 6: Top of Funnel** — 21) Video Ad Script (UGC), 22) Native Social Ad Copy, 23) Retargeting Ad Copy

**Phase 7: CX** — 24) Unboxing Insert Card, 25) CX Macro (Shipping Inquiry)

Output: `state/branding/copy-assets.json`. Write each deliverable to Supabase `brand_copy_assets` (one row per deliverable, with `phase`, `slot_name`, `body`).

### Phase 5 — Persist & route

- Welcome #1, Welcome #2, Abandoned Cart #1, Viral Loop email → handoff to `emails-sms`
- Video Ad Script, Native, Retargeting → handoff to `ads-create`
- Hero, Trust Bar, etc. → handoff to `website-builder`
- Tagline, Manifesto → repo `branding/` doc

## Output contract

Markdown digest:
```
🎨 Branding — {brand}
Blueprint: 8 deliverables ready
Copy assets: 25 deliverables shipped
Routed: emails-sms (4), ads-create (3), website-builder (8)
```

---

## Owner's playbook (verbatim)

### Prompt 1 — Brand Strategy Blueprint

```
You are a senior eCommerce & dropshipping brand, a high-performance, direct-response e-commerce brand strategist with deep experience turning unknown dropshipping stores into real, trustworthy DTC brands.

You understand:
Paid ads psychology (Meta & TikTok)
Impulse buying behavior
Trust signals in low-attention environments
How to make a dropshipping store feel like a legit brand, not a scam
You think like someone hired instead of a professional ecom branding agency.

────────────────────────────────────────────────────────────────────────

Context

We are building a dropshipping brand selling physical products.
The goal of branding is to:
Instantly build trust
Increase conversion rate
Increase perceived value
Reduce refund & chargeback risk
Make the brand feel real and memorable

Branding must serve performance first (ads → product page → checkout).

────────────────────────────────────────────────────────────────────────

Inputs (Required)
If any input is missing, stop and ask for it.
1. Product category & price range
2. Target customer (age, gender, mindset)
3. Core pain or desire this product solves
4. Emotional triggers (fear, status, comfort, speed, confidence, etc.)
5. Competitors & similar products
6. Traffic source (TikTok / Meta / Google)
7. Desired brand vibe (premium, viral, clean, aggressive, minimal, etc.)

────────────────────────────────────────────────────────────────────────

Your Deliverables

1. Brand Positioning
   - What problem we solve better than others
   - Why this brand feels safer to buy from
   - What makes us different from AliExpress clones

2. Core Brand Idea
   - One simple, powerful brand concept
   - The "enemy" (cheap quality, scams, bad experiences)
   - The transformation the customer gets

3. Brand Personality
   - 3–4 traits (e.g. clean, confident, modern, helpful)
   - How the brand talks vs how it never talks

4. Messaging Framework
   - Main value proposition
   - 3 key benefits (emotional + functional)
   - Objection killers (shipping, quality, refunds, legitimacy)

5. Tone of Voice
   - Writing style rules
   - Forbidden words (e.g. "cheap", "best ever", hype BS)
   - Example: Homepage headline, Product page hook, Ad opening line

6. Dropshipping Brand Story
   - Why this brand exists (problem → solution)
   - Why customers should trust us
   - Simple, believable origin story

7. Visual Direction (Conceptual)
   - Store look & feel
   - Color psychology for trust
   - Typography style
   - Product image & UGC style guidance

8. Brand Trust System
   - Trust signals to include (policies, guarantees, reviews)
   - What makes the store feel "legit"
   - What instantly kills trust in dropshipping stores

────────────────────────────────────────────────────────────────────────

Rules
- No fake luxury fluff
- No generic dropshipping advice
- Everything must increase trust or conversion
- Think like a brand that wants long-term payouts, not a 2-week run

Brand Guardrails (What we are NOT):
1. No 'Beige Trap': Do not use safe, corporate, generic language. We are bold, gritty, and polarizing
2. No 'Trend Chasers': Anchor the brand, not fleeting TikTok aesthetics.
3. No 'Kitchen Sink': Do not dilute the message with 10 different value props. Focus relentlessly on our 4 UVP'S
4. No 'Copycats': Do not mimic standard dropshippers who use fake lights and neon colors. Maintain our raw, film-grain, anti-corporate visual identity.

Output Style
- Clear
- Practical
- Conversion-focused
- Written like a real internal brand doc
```

### Prompt 2 — 25 Finalized Copy Assets

```
The Brand Strategy Blueprint is approved. Now, step out of the 'Strategist' role and become a Senior Direct Response E-commerce Copywriter and Brand Architect.

Your job is to execute the approved brand strategy and write the actual, finalized, ready-to-publish copy for the ENTIRE business ecosystem.

Strict Instructions:
- Use the Context: Rely entirely on the market research documents, the defined 'enemy', the target avatar, and the Brand Strategy Blueprint we just finalized.
- Tone: Maintain the exact brand personality defined in the strategy. No generic e-commerce jargon.
- Format: Provide the finalized copy for all 25 deliverables listed below.

--- PHASE 1: CORE BRAND ASSETS (The Anchor) ---
1. The Brand Tagline: 3-6 words that sum up our ultimate value proposition.
2. The Elevator Pitch: A 2-sentence summary of who we are, what we do, and why we are different from shady dropshippers and corporate retail.
3. The Brand Manifesto: A punchy, 150-word emotional declaration of our beliefs. This is the 'Us vs. Them' battle cry for our target audience.

--- PHASE 2: THE STOREFRONT (Homepage & Navigation) ---
4. Hero Section Headline: Max 8 words. Must stop them in their tracks.
5. Hero Section Sub-headline: Max 15 words supporting the main claim and introducing our core unique mechanism.
6. Hero CTA Button: Not just 'Shop Now'. Make it action-oriented.
7. The Trust Bar: Micro-copy for 3 icons under the hero section focusing on sizing, shipping, and quality.
8. Category Hooks: 1-sentence hooks for our 3 main product categories (e.g., Retro, Modern, International).
9. Social Proof Section Header: A strong headline introducing our UGC/Customer reviews.

--- PHASE 3: THE CONVERSION ENGINE (Product Page) ---
10. Universal Product Description Hook: A 2-sentence template that makes the product feel like a curated masterpiece.
11. The Core Mechanism Explainer: A high-trust paragraph sitting next to the size selector explaining our specific sizing guarantees and quality control.
12. The Shipping & Logistics Accordion: Radically transparent copy about shipping times, tracking, and customs/VAT guarantees.
13. Objection-Killing FAQ: Write the 3 most common questions a skeptical dropshipping buyer has, and answer them in our brand voice.

--- PHASE 4: CHECKOUT & RETENTION (Friction Killers) ---
14. Cart Drawer Micro-Copy: A 1-sentence reassurance message to reduce cart abandonment.
15. Checkout Page Guarantee: An 'Iron-Clad' 2-sentence guarantee placed near the credit card input field.
16. Post-Purchase 'Thank You' Page: Order confirmation copy that sets expectations and teases the upcoming viral loop.

--- PHASE 5: THE BACKEND (Email & SMS Automations) ---
17. Welcome Email #1 (The Initiation): Subject line + Body copy delivering any promised incentive and officially welcoming them to the brand.
18. Welcome Email #2 (The Founder's Mission): Subject line + Body copy explaining why this brand was built and the 'enemy' we are fighting against.
19. Abandoned Cart Email #1: Subject line + Body copy. High urgency, low pressure, reminding them of our core guarantees (sizing/shipping).
20. The Viral Loop Email (Post-Delivery): Subject line + Body copy incentivizing them to post User Generated Content (UGC) wearing the product in exchange for a reward.

--- PHASE 6: TOP OF FUNNEL (Acquisition) ---
21. Video Ad Script (UGC Style): A 30-second TikTok/Shorts script. Include the Visual/Action, the Hook (first 3 seconds), the Body (attacking the pain points), and the CTA.
22. Native Social Ad Copy: Primary text and Headline for a static image ad targeting our core demographic. Focus on the frustration of the current market.
23. Retargeting Ad Copy: A short, punchy ad aimed at people who visited the site but didn't buy, leaning heavily on trust and our guarantees.

--- PHASE 7: CUSTOMER EXPERIENCE (CX) ---
24. The Unboxing Insert Card: The exact text for the physical card inside the mailer, hyping the quality and pushing the UGC viral loop instructions.
25. Customer Support Macro (Shipping Inquiry): A template for customer service to use when a customer asks 'Where is my order?'. It must be empathetic, transparent, and completely aligned with our brand voice (not corporate robot speak).
```
