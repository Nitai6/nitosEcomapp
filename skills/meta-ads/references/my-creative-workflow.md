# Owner's Video Creative Workflow (verbatim)

The pipeline from "Meta says we need a new creative" → uploaded ad.

## Pipeline

1. **Read Meta data** — what's working, what's fatiguing, where the weakness is. Use the labels from `my-meta-thresholds.md` to drive the brief.

2. **Image gen** (text-to-image OR image+text-to-image) in **Higgsfield** via Playwright MCP.

3. **Video gen** — add reference image + video prompt in Higgsfield. See `skills/avatar-builder/references/my-realism-prompt-taxonomy.md` and `my-video-prompt-template.md` for prompt structure.

4. **Brand model rule:** highly use our brand-locked models. **Don't switch models all the time** if it's UGC. Consistency builds recognition.

5. **Submagic pass** — add audio, sound effects, captions, and other variables.

6. **Upload** to Meta.

## Models / tools

- Image: **higgsfield-image** (GPT-image 2.0 route, via Playwright wrapper)
- Video: **higgsfield-image** (Seedance 2.0 route, same Playwright wrapper)
- Editing/captions: **Submagic**
- Avatars: **higgsfield-image** (see `skills/avatar-builder`)
- Background/scene gen: **higgsfield-image**

## Guardrails (from 2500+ ads scraped)

When creating a creative (videos), choose between:
- Formulas
- Subformulas
- Angles
- Hooks
- Copywriting formulas
- Editing variables
- CTAs

Inside those guardrails, be as creative as possible.

> As we get more data from our own Meta account, we will analyze our own data to optimize next creatives — i.e. the `hook-mining` agent feeds back here.
