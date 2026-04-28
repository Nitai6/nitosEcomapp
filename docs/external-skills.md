# External Skills — Status

Owner-curated skills now staged in `skills/_external/{name}/` (zips arrived 2026-04). Wrappers in `skills/{name}/` consume them via relative-path references.

Hierarchy: owner's `my-*.md` references > Aviv baseline > external skills (called as tools by wrappers).

## Shipped (staged in `skills/_external/`)

| External skill | Wrapper | Role |
|---|---|---|
| `accessibility-audit` | `seo-audit` (merged) | A11y/WCAG 2.1 AA scan adds Section E to audit |
| `ads-manager-template` | `ads-generate` Phase 9 | Naming convention + UTM params + briefing schema |
| `cartoon-ad-generator` | `ads-generate` Phase 2.5 | Cartoon/illustration ad path |
| `copy-website` | `copy-website` (NEW wrapper) | Cross-skill clone tool used by ads-competitor + website-builder |
| `ecom-ads/generate-ads` | `ads-generate` Phase 2.5 | Static e-com ad templates path |
| `graphics-carousel` | (reserved — future `social-instagram` carousel sub-path) | Designed carousels |
| `handdrawn-carousel` | (reserved — `social-instagram`) | Hand-drawn aesthetic carousels |
| `instagram-skills` (7 sub) | `social-instagram` | Audit, analysis, reel-script, thumbnail, carousel-preview, thread-carousel, sponsor-outreach |
| `screen-demo` | `screen-demo` (NEW wrapper) | Steel.dev + Remotion demo videos |
| `security-audit` | `security-audit` (NEW wrapper) | 14-day pen-test + Supabase advisors |
| `thread-to-carousel` | (reserved — `social-instagram`) | X/Threads → carousel converter |
| `youtube-assistant` (9 sub) | `social-youtube` | Init, audit, analysis, research, script, title, thumbnail, description, preview, presentation |

## Anthropic-published

| Skill | Purpose | URL |
|---|---|---|
| `frontend-design` | UI scaffolding patterns | https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md |
| `algorithmic-art` | Generative visuals | https://github.com/anthropics/skills/blob/main/skills/algorithmic-art/SKILL.md |
| `canvas-design` | Canvas-based design | https://github.com/anthropics/skills/blob/main/skills/canvas-design/SKILL.md |
| `theme-factory` | Theme/style systems | https://github.com/anthropics/skills/tree/main/skills/theme-factory |
| `web-artifacts-builder` | Web artifact generation | https://github.com/anthropics/skills/blob/main/skills/web-artifacts-builder/SKILL.md |

## Community

| Skill | Purpose | URL |
|---|---|---|
| `debug-skill` | Debugging patterns | https://github.com/AlmogBaku/debug-skill |
| `superpowers` | General-purpose meta-skills | https://github.com/obra/superpowers |
| `notebooklm-skill` | NotebookLM integration | https://github.com/PleasePrompto/notebooklm-skill |
| `file-search-skill` | File search patterns | https://github.com/netresearch/file-search-skill |
| `web-asset-generator` | Asset generation pipelines | https://github.com/alonw0/web-asset-generator |
| `frontend-slides` | Slide-deck generation | https://github.com/zarazhangrui/frontend-slides |
| `remotion-skills` | Programmatic video (Remotion) | https://github.com/remotion-dev/skills |
| `claude-seo` | SEO automation | https://github.com/AgriciDaniel/claude-seo |
| `marketingskills` | Marketing skill collection | https://github.com/coreyhaines31/marketingskills |

## When to clone one

Only when a paidads skill explicitly needs functionality not already covered by:
1. The owner's `my-*.md` references
2. The Aviv baseline (existing references in each skill dir)
3. The MCP servers wired to this repo

**Process to clone:**
1. Check the upstream LICENSE
2. Clone into `skills/_external/{name}/` (do not modify source)
3. Add a one-line wrapper in the consuming skill's references (e.g., `references/external-remotion-bridge.md`)
4. Document why it was needed in the consuming skill's SKILL.md

## Candidates worth pulling first

- `claude-seo` → likely overlaps `seo-audit` + `seo-blog`; review for tactics not yet captured
- `marketingskills` → likely overlaps `ads-meta` + `emails-sms`; mine for techniques
- `remotion-skills` → if `ads-generate` ever needs programmatic video over Higgsfield/Submagic
- `web-artifacts-builder` → if `website-builder` needs more granular Shopify section primitives
