# Aviv Malka Skills — Baseline Library

115 skills imported 2026-04-27 from `~/.claude/skills/`. **Untouched copies** — never edited. The owner's `my-*.md` references and the `Owner's playbook (verbatim)` sections in each `skills/{name}/SKILL.md` always win.

## How they're used

Wrappers in `skills/{name}/` reference these via the `aviv_refs:` frontmatter array. The wrapper agent reads its own owner-bible first, then consults Aviv's skill as **tactical baseline** — never as override.

## Override hierarchy (canonical)

1. Owner's `my-*.md` (in each wrapper's `references/`)
2. `Owner's playbook (verbatim)` section inside each `SKILL.md`
3. Wrapper's own Process phases
4. **`_aviv/{name}/SKILL.md`** — this directory (tactical baseline)
5. `_external/{name}/SKILL.md` — third-party staged skills (last word)

## Mapping — Aviv skill → wrapper

### Paid ads
| Aviv skill | Consumed by |
|---|---|
| ads-meta, paid-ads, ads-audit, ads-math, ads-dna, ads-test, ads-plan, meta-verification | `ads-meta` |
| ads-budget | `ads-budget` |
| ad-creative, ads-creative, ads-photoshoot, copywriting, copy-editing, storytelling, humanizer | `ads-creative` |
| ads-create, ads-generate, ads-landing, heygen, remotion, video-creator | `ads-generate` |
| ads-competitor, competitor-alternatives | `ads-competitor` |
| ads-google, ads-tiktok, ads-youtube, ads-microsoft, ads-apple, ads-linkedin | `ads-multi-platform` |

### SEO
| Aviv skill | Consumed by |
|---|---|
| seo-audit, seo-technical, seo-schema, seo-sitemap, seo-images, seo-hreflang, site-architecture, schema-markup | `seo-audit` |
| seo, seo-content, seo-page, seo-plan, seo-programmatic, seo-competitor-pages, seo-geo, programmatic-seo, ai-seo | `seo-blog` |

### Email/SMS
| email-sequence, cold-email, gmail-organizer | `emails-sms` |

### Site / CRO
| landing-page, landing-page-builder-html, ui-ux-pro-max, spline-3d-integration | `website-builder` |
| form-cro, popup-cro, page-cro, signup-flow-cro, onboarding-cro, paywall-upgrade-cro, ab-test-setup, auto-product-test | `cro` |

### Social
| carousel-aviv-king, carousel-machine2, carousel-machine-english, social, social-content | `social-instagram` |
| youtube-ideas, video-creator | `social-youtube` |

### Brand / advisory
| marketing-psychology, marketing-ideas, storytelling, free-tool-strategy | `branding` |
| ceo-advisor, brainstorming, pricing-strategy, launch-strategy, product-marketing-context, sales-enablement, revops, churn-prevention, referral-program | `advisory` |

### Ops
| security-audit, cyber | `security-audit` |
| israeli-legal-compliance, cookies | `legal-compliance` |
| analytics-tracking, last30days | `analytics` |
| cardcom-payment | `payments` |
| scrape-leads-global, scrape-leads-israel, firecrawl | `lead-scraping` |

### Dev / Claude meta (NOT routine — engineering helpers)

These are reference-only inside `_aviv/`. They are NOT wired into any routine wrapper. Available for the human dev's own Claude Code workflow:

claude-cli, claude-creators, dispatching-parallel-agents, executing-plans, finishing-a-development-branch, mcp-builder, receiving-code-review, requesting-code-review, skill-creator, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills, readme-writer, project-proposal

### Misc / utility (callable on demand, no scheduled wrapper)

caveman, hebrew-pdf-guide, company-pdf, new-guide, content-strategy, israeli-legal-compliance (also wrapped above)

## Adding a new Aviv-derived skill later

1. Decide if it fits an existing wrapper → just add to that wrapper's `aviv_refs:`
2. If it's genuinely new domain → write a new wrapper SKILL.md, add `aviv_refs:` pointing here, register in `MANIFEST.md`
