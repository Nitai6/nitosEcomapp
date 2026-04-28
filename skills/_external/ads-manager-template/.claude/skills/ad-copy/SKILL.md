---
name: ad-copy
description: Write Meta ad copy (primary text, headlines, descriptions) for static image creatives
---

# Ad Copy Writer

Write Meta ad copy for static image creatives. Each ad gets:
- **Primary Text** (above the image) — 1-3 short paragraphs, max 125 chars visible before "See more"
- **Headline** (below the image) — max 40 chars, punchy
- **Description** (below headline) — max 30 chars, supporting line
- **CTA Button** — always "Learn More" (Skool doesn't have a checkout page to "Sign Up" to)

## Process

1. Read `briefing.md` in the project root before writing any copy
2. Look at the creative image(s) provided — the copy must match the visual angle
3. Write 3 variations of primary text per creative (short, medium, long) so we can test
4. Group output by creative filename

## Brand Voice Rules (always follow)

- Casual, direct — "texting a smart friend"
- No guru energy, no Lamborghinis, no fake scarcity
- No corporate buzzwords (leverage, synergy, game-changer)
- Be specific about what members get — no overpromising
- Lead with the pain point or transformation, not the product
- Price is already on the image — don't repeat it in primary text unless the image doesn't show it
- Never start with "Introducing..." or "Are you ready to..."

## Copy Frameworks (rotate these)

- **Pain → Agitate → Solution**: Call out what they're doing wrong, twist the knife, offer the fix
- **Social Proof → Curiosity**: Lead with a result or testimonial, make them want to know how
- **Pattern Interrupt**: Say something unexpected that stops the scroll
- **Us vs Them**: Manual work vs [Your Product] members
- **Direct Challenge**: Call out the audience directly

## Output Format

For each creative, output:

```
### [filename]

**Primary Text (Short — under 125 chars):**
[copy]

**Primary Text (Medium — 2-3 sentences):**
[copy]

**Primary Text (Long — 3-4 sentences with line breaks):**
[copy]

**Headline:** [headline]
**Description:** [description]
**CTA:** Learn More
```

## Anti-Patterns (never do these)

- Don't use "unlock", "unleash", "supercharge", "skyrocket", "game-changer"
- Don't use emojis excessively (1-2 max per primary text, or none)
- Don't write like a landing page — write like a text message or tweet
- Don't start every variation the same way
- Don't make claims you can't back up
- Don't mention competitors by name
