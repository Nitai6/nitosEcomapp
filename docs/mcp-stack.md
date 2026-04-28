# MCP / API Stack — v3 FINAL (Owner-Locked)

Owner-confirmed 2026-04-27. **22 MCPs.** Anything previously listed (Klaviyo, ManyChat, Stripe, Cardcom, Gemini, NanoBanana, Metricool, Steel.dev, GA4, Microsoft Clarity, Notion) is **dropped**.

---

## Confirmed endpoints / docs (owner-supplied)

| MCP | Source |
|---|---|
| Bank Leumi | https://www.leumiopenbanking.co.il/apis |
| Shopify Storefront MCP | https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront |
| Meta Marketing | Pipeboard — https://pipeboard.co/ |
| DataForSEO MCP | https://dataforseo.com/help-center/setting-up-the-official-dataforseo-mcp-server-simple-guide |
| GSC MCP | https://github.com/AminForou/mcp-gsc |
| Mailjet MCP | https://github.com/mailgun/mailjet-mcp-server |
| Hyperframes (HeyGen) | https://github.com/heygen-com/hyperframes — role TBD, see open question |
| Submagic | (REST API, key in `state/secrets/.env`) |
| Superprofile | **OWNER IS BUILDING IN-HOUSE CLONE** — not third-party MCP. dm-funnel waits or uses interim path. |

## The 22 MCPs

| # | MCP / API | Used by | Role |
|---|---|---|---|
| 1 | **Bank Leumi API** | finance-il | Daily reconciliation · 1st-of-month tax + ביטוח לאומי deposits · Open Banking auth |
| 2 | **Shopify** | website-builder, seo (autofix), meta-ads (LP issues flag), customer-service (order-status), finance-il (orders + Hebrew invoice render) | Site push · blog publish · product CRUD · theme blocks · Shopify Payments only (no Stripe, no Cardcom) |
| 3 | **Meta Marketing API** | meta-ads | Full autonomy: insights · create campaign/adset/ad · update budget · pause · upload creative |
| 4 | **Higgsfield (via Playwright)** | meta-ads, social-tiktok, social-youtube, social-instagram (reels), social-pinterest (variants), avatar-builder, website-builder | TWO routes through one tool: **GPT-image 2.0 route** (image gen) + **Seedance 2.0 route** (video gen, image-to-video). Replaces NanoBanana + replaces separate video model. |
| 5 | **DataForSEO** | seo (audit + KW), ads-competitor, social-pinterest (long-tail) | KW research · SERP · crawl |
| 6 | **GSC** | seo, analytics | Impressions · clicks · queries · indexation |
| 7 | **Mailjet** | email-marketing, dm-funnel (email capture from Superprofile) | 4-flow setup · campaigns · lists/tags · transactional |
| 8 | **Gmail** | customer-service (inbox), finance-il (invoice pull), email-marketing (digest send) | Owner email + CX channel |
| 9 | **Instagram Graph API** | social-instagram, customer-service (DMs read/reply), dm-funnel (Superprofile complement) | Publish · DM · insights |
| 10 | **TikTok Marketing + Content API** | ads-multi-platform (ads side), social-tiktok (content side) | Autonomous TT content + ads |
| 11 | **Pinterest API** | social-pinterest | Bulk 30–50 pins/day |
| 12 | **Hyperframes (HeyGen)** | meta-ads (avatar video creative), social-youtube (founder-avatar UGC), social-tiktok (avatar talking-head) | Avatar video gen — REPLACES Remotion per owner. ⚠️ Hyperframes does NOT do arbitrary PDF rendering, so finance-il Hebrew חשבונית מס PDF falls back to Playwright HTML→PDF (uses the existing Playwright MCP — no new dep). |
| 13 | **Submagic** | meta-ads (creative regen captions/audio/SFX), social-youtube (Path 1 Shorts extraction), social-tiktok, social-instagram (UGC reels) | Captions · audio · SFX · auto Shorts extraction |
| 14 | **Apify** | ads-competitor, social-instagram (calendar competitor scrape), social-tiktok (niche scrape), social-youtube (Path 2), seo (Reddit/Quora/PubMed sourcing) | Competitor + niche scraping at scale |
| 15 | **PostHog** | analytics, advisory, customer-service (escalation context) | Product analytics · session replay · funnel · anomaly detection |
| 16 | **Sentry** | analytics, advisory, seo (storefront error correlation) | Storefront error tracking |
| 17 | **Supabase MCP** | every agent (state · `agent_kpi_history` · `agent_decisions` · `bank_reconciliation` · `cx_conversations` · `pinterest_asset_queue` · etc.) | DB read/write from Claude session — without this MCP, agents can't persist state or push KPI rows the IU dashboard graphs |
| 18 | **ElevenLabs** | meta-ads (creative regen — VO for video ads ONLY) | Voice gen for video ads |
| 19 | **Superprofile** | dm-funnel (DM automation 3-step + link-in-bio), social-instagram (link-in-bio handoff) | Replaces ManyChat fully — automates IG DMs + manages bio link |
| 20 | **Slack** | every agent (alerts mirror) | Critical-finding pings |
| 21 | **Google Docs** | _TBD per owner — see open question below_ | Currently no agent depends on it |
| 22 | **Hostinger** | infra (domain only) | Domain hosting for storefront. Not called by any agent at runtime. |
| + | **Telegram Bot API** | finance-il (15-min receipt + UGC poll), meta-ads (high-stakes approvals), every agent (alert mirror) | Owner-side ops channel · drop folder for receipts/UGC |

**Total: 22 MCPs (Hostinger is infra, not an agent dependency, but kept on the list).**

---

## What changed from v2 → v3

**Removed entirely:**
- ❌ Klaviyo → Mailjet
- ❌ ManyChat / Manychat → Superprofile
- ❌ Stripe → Shopify Payments
- ❌ Cardcom → Shopify Payments
- ❌ Gemini → Claude itself (the cron-fired session does classification + AI quality scoring)
- ❌ NanoBanana → Higgsfield (GPT-image 2.0 route)
- ❌ Separate video model (Seedance, Kling, etc.) → Higgsfield (Seedance 2.0 route)
- ❌ Metricool → native APIs (IG Graph + TikTok Content + YouTube Data + Pinterest)
- ❌ Steel.dev (only used by `_external/screen-demo` which keeps it internal — not on owner stack list)
- ❌ Israeli digital invoice provider (Hashavshevet/EZcount/Greeninvoice) → Hebrew חשבונית מס rendered natively from Shopify order via Hyperframes
- ❌ Google Analytics 4 → PostHog covers product analytics; GSC covers search
- ❌ Microsoft Clarity → PostHog session replay covers it
- ❌ Notion → owner decision: not relevant, dropped from stack

**Added:**
- ✅ Superprofile (DM + link-in-bio)
- ✅ PostHog (replaces GA4 + Clarity)
- ✅ Sentry
- ✅ Supabase MCP (state + dashboard tables — every agent depends on it)
- ✅ ElevenLabs (meta-ads creative VO only)
- ✅ Google Docs (brand-creator doc source — see Brand-Creator gate below)
- ✅ Hostinger (domain infra)

---

## AI work without Gemini

Every "Gemini" call in v2 (classification, quality scoring 1–10, OCR) is now done by **the Claude session itself** when the cron fires the routine. No separate vision-model MCP needed — Claude reads images/text inline. Owner-confirmed.

## Image + Video without NanoBanana / Seedance / Kling

**One tool, two routes — Higgsfield via Playwright:**
- Image gen → **GPT-image 2.0 route** (used by meta-ads image creatives, Pinterest variants, IG static, avatar-builder reference images)
- Video gen → **Seedance 2.0 route** (used by meta-ads video creatives, image-to-video for ads, social-tiktok remix base)

Owner: "no separate image model, no separate video model — Higgsfield handles both."

## DM funnel without ManyChat

**Superprofile** does both legs:
1. **DM automation** — listens for keyword on IG comments → fires 3-step DM sequence (instant hook + 24h qualifier + 48h CTA per Camila Markson Prompt 8 templates) → captures email
2. **Link in bio** — bio link points to Superprofile landing → routes to current campaign/freebie/funnel

`dm-funnel` agent's job: configure Superprofile per campaign, monitor stats nightly, hand email captures to Mailjet via tag.

## Hebrew invoice without provider

`finance-il` Job C.1 generates חשבונית מס natively:
1. Read Shopify order data
2. Apply template at `references/my-hebrew-invoice-template.md`
3. Render PDF via Hyperframes (HTML→PDF)
4. Email to customer via Gmail
5. Persist to `state/finance-il/invoices/{period}/`

Owner may build a dedicated invoice app later. For now: native render is the path.

---

## Brand-Creator gate (manual, runs FIRST)

Owner: "Brand skill is created by Doc 1 we sent. First execute him, then we have the brand file."

Before any cron routine fires, the manual brand-creator chain must run once per brand:

1. Owner runs Doc 1 (brand-creator master prompt) → produces `state/branding/brand-strategy-blueprint.json` (the "25 deliverables" blueprint)
2. Owner approves
3. Downstream chain auto-fills: `market-research → branding → avatar-builder → website-builder` → `state/branding/copy-assets.json`, `state/market-research/customer-avatar.json`, `state/branding/references/my-brand-guardrails.md`

**Until the brand file exists, NO routine should be registered.** Every wrapper SKILL reads it as input — without it they have no tone-of-voice, no forbidden-words, no avatar anchor, nothing to apply on outputs.

Routine registration order:
1. Owner runs Doc 1 → brand file lands
2. Connect MCPs (Wave 1–4 below)
3. I register all 16 cron routines via `mcp__scheduled-tasks__create_scheduled_task`
4. Routines start firing on their schedules → IU dashboard sees activity within 5 min (dashboard-bridge tick)

## Auth / secrets

All keys live in `state/secrets/` encrypted via Supabase Vault. No keys in client bundles.

## Connection ordering (when ready to wire)

**Wave 1 — Foundation (Day 1):** Bank Leumi · Shopify · Meta · DataForSEO · Mailjet · Telegram · Slack · Gmail
**Wave 2 — Creative pipeline (Day 2):** Higgsfield (Playwright) · Submagic · Hyperframes · ElevenLabs · GSC
**Wave 3 — Social agents (Day 3):** Instagram Graph · TikTok Marketing+Content · Pinterest · Superprofile · Apify
**Wave 4 — Analytics + extras (Day 4):** PostHog · Sentry · Google Docs · Hostinger (DNS)

Once Waves 1–3 are connected AND the brand-creator gate has fired, I register the 16 cron routines via `mcp__scheduled-tasks__create_scheduled_task`. Wave 4 can come after.

---

## All open questions resolved

- ✅ Notion → dropped (owner decision)
- ✅ Google Docs → source storage for Doc 1 (brand-creator master prompt) + brand SOPs
- ✅ Supabase → added as MCP #17, mandatory infra
- ✅ 2026 IL tax brackets → confirmed 2026-04-27, deposits authorized
- ✅ Brand-creator gate → must run FIRST before routine registration
