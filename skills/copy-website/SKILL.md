---
name: copy-website
description: Cross-skill utility — clones a target website's structure, copy, layout, and assets for analysis. Wraps external copy-website skill. Used by ads-competitor (study competitor LPs), website-builder (reference inspirations), seo-audit (compare own vs competitors).
trigger:
  manual: "/copy {url}"
  event: "copy-request.json arrived"
mcp_dependencies:
  required:
    - supabase
  optional:
    - playwright
inputs:
  - {url}
  - {scope}    # full-site | single-page | hero-only
outputs:
  - state/copy-website/{slug}/clone.html
  - state/copy-website/{slug}/copy.md          # all body copy extracted
  - state/copy-website/{slug}/structure.json   # section anatomy
  - state/copy-website/{slug}/assets/
references:
  - ../../skills/_external/copy-website/SKILL.md
self_heal: skills/_lib/self-heal.md
---

# Copy Website Tool

Thin wrapper. Used as a building block — not a routine on its own.

## Used by

- **ads-competitor** → after recon Prompt 1 identifies a competitor, clone their LP to extract their hooks, section order, social-proof placement
- **website-builder** → before building, clone 2-3 inspiration sites and extract structure into `state/website-builder/inspirations/`
- **seo-audit** → diff own homepage structure vs top-3 SERP competitors

## Process

Delegate to `_external/copy-website/SKILL.md`. It:
1. Crawls the URL with Playwright (respects robots.txt)
2. Extracts HTML, CSS-derived layout grid, all body copy, all images/videos
3. Maps each section to a semantic name (hero, banner, problem, solution, product grid, social proof, footer)
4. Outputs a `structure.json` with the section list + a `copy.md` with all body copy

## Owner-rule overlay

- Strip any tracking pixels / analytics from cloned HTML before saving
- Never re-publish cloned content as-is — clones are reference material only
- Mark `copy-website/{slug}/USAGE.md` with the consuming skill name + reason (audit trail)

## Output contract

```
📋 Copy Website — {slug}
URL: {url}
Pages cloned: 1
Sections detected: 9 (hero, banner, problem, mechanism, product-grid, social-proof, FAQ, footer, popup)
Copy extracted: 2,847 words
Assets: 23 (18 img, 4 video, 1 svg)
Output: state/copy-website/{slug}/
```
