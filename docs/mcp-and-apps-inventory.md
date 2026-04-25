# MCPs + Apps Inventory

**Last updated**: 2026-04-25
**Owner**: Nitai (nitalebusiness@gmail.com)
**Scope**: every external tool the skills + routines in this repo will eventually call. Maintained as a single source of truth so we know what's needed, what's built, what's blocking.

## Status legend

- ✅ **Connected** — installed + auth tested + ready
- 🟡 **Available, needs auth** — tool ready, waiting on user to plug in token/key
- 🟠 **Needs build** — community MCP exists but not yet in our environment
- 🔴 **No MCP yet** — would require custom build OR fall back to web scraping (Playwright)
- ❓ **Optional** — nice to have, not blocking

---

## Priority 0 — required for v1 (creative-refresh + first routines)

| Tool | Status | Used by |
|---|---|---|
| **meta-ads MCP** | 🟡 needs Meta Business token | `ads-meta`, `ads-master`, `ads-creative`, `ads-budget`, `viral-loop`, `creative-refresh` routine |
| **playwright MCP** | ✅ have | `theme-page` (scraping competitors), `ads-competitor`, `seo-master` (live audits), `cro` (LP audit), `social-funnel` (IG scraping fallback) |
| **supabase MCP** | 🟡 needs project key | All routines (state persistence, audit history, dashboard backend) |
| **gmail MCP** | ✅ have | `customer-service` (read+reply), `email-welcome/abandon/postpurchase/campaigns` (sending if not Klaviyo), routine alerts |

## Priority 1 — V2 (more ad platforms + email + commerce)

| Tool | Status | Used by |
|---|---|---|
| **google-ads MCP** | 🟠 needs build (community options exist) | `ads-google`, `ads-master`, `ads-budget` |
| **klaviyo MCP** | 🟠 not yet built — most likely path is custom | `email-welcome`, `email-abandon`, `email-postpurchase`, `email-campaigns`, `popup-form` |
| **shopify MCP** | 🟠 needs install (official MCP exists 2025) | `ecom-quiz`, `email-postpurchase` (order data), `taxes-israel` (revenue tracking), `viral-loop` (Judge.me bridge), `cro` (PDP/cart data) |
| **mailjet** OR alternative for transactional | ❓ optional | Routine notifications fallback if Gmail rate-limited |
| **GSC API (Google Search Console)** | 🟠 needs OAuth | `seo-master`, `seo-audit` |
| **Pagespeed Insights API** | 🟠 free, just needs key | `cro`, `seo-master`, `seo-technical` |
| **GA4 API** | 🟠 needs OAuth | `cro`, `seo-master`, attribution analysis |

## Priority 2 — V3 (more platforms)

| Tool | Status | Used by |
|---|---|---|
| **tiktok-ads MCP** | 🔴 no MCP — likely API + custom | `ads-tiktok` |
| **instagram MCP** (Graph API) | 🟠 needs Meta business token (same as ads) | `social-funnel`, `theme-page` (own-account analytics), `customer-service` (DM management) |
| **Judge.me API** | 🔴 no MCP, has REST API | `viral-loop` (5-star review trigger) |
| **ManyChat** | 🟠 webhook-based, has API | `social-funnel` (comment-trigger DM automation) |
| **Bing Webmaster API** | 🟠 needs key | `seo-master` (Bing-specific GSC equivalent) |

## Priority 3-4 — later (additional platforms)

| Tool | Status | Used by |
|---|---|---|
| **linkedin-ads MCP** | 🔴 not built | `ads-linkedin` |
| **microsoft-ads MCP** | 🔴 not built | `ads-microsoft` |
| **apple-search-ads MCP** | 🔴 not built (Apple has API) | `ads-apple` |
| **YouTube Data API** | 🟠 needs OAuth | `ads-youtube`, `theme-page` (YT analytics) |
| **Pinterest API** | 🟠 needs OAuth | `theme-page` (Pinterest stats), Pinterest ads if used |
| **Twitter/X API** | 🟠 paid tier required for write | `theme-page`, `social-funnel` |
| **Bluesky API** | 🟠 free, public | `theme-page` |
| **Reddit API** | 🟠 free with auth | `email-campaigns` (research scraping), `theme-page` (niche research) |

## Web apps / SaaS (not MCPs — accessed via browser or direct API)

These are tools the user/agent uses; not all need MCPs (some are configured via web UI, then their data lands in Supabase via routine pulls).

### Ad platforms
- Meta Ads Manager — web UI
- Google Ads — web UI + MCP
- TikTok Ads Manager — web UI
- LinkedIn Campaign Manager — web UI
- Microsoft Advertising — web UI
- Apple Search Ads — web UI
- YouTube Ads (via Google Ads)

### Ecom + commerce
- **Shopify** — store platform (MCP for product/order data)
- **Judge.me** — reviews → 5-star trigger feeds `viral-loop`
- **Stripe / PayPal / Tranzilla** (Israeli) — payment processors (taxes-israel pulls revenue data)
- **iCount / Hashavshevet / Rivhit** — Israeli accounting software (manual export, or API where available)

### Email + automation
- **Klaviyo** — primary email recommendation. Custom triggers required for `email-abandon` (Cart vs Checkout split).
- **ManyChat** — IG comment-trigger DM automation. (`social-funnel`)
- **ConvertKit / Beehiiv** — alternatives if not on Shopify ecom (newsletter-first model)

### Content / creative
- **CapCut** — video editing (theme-page production)
- **Canva** — carousels, Pinterest pins, thumbnails
- **Midjourney / Flux / DALL-E** — AI image (creative-refresh + theme-page)
- **ElevenLabs** — AI voiceover for faceless content
- **Pictory / Invideo** — AI video from text
- **Epidemic Sound / Artlist** — music license (mandatory for monetized YT video)
- **Pexels / Storyblocks** — stock B-roll
- **HeyGen / Synthesia** — AI avatar (only if niche allows non-faceless)

### Scheduling + posting
- **Metricool** — multi-platform scheduler (recommended primary)
- **Tailwind** — Pinterest-specialized scheduler
- **Buffer / Publer** — alternatives
- **Hypefury / Typefully** — Twitter/X-specialized

### Analytics + research
- **Google Search Console** — organic SEO
- **Bing Webmaster Tools** — secondary search
- **GA4** — site analytics
- **Microsoft Clarity** — free heatmaps + recordings
- **Hotjar / Mouseflow** — paid heatmaps + recordings
- **VidIQ / TubeBuddy** — YouTube SEO + ideation
- **Ahrefs / Semrush** — backlink + keyword research (expensive but high-leverage)
- **ViralFindr / Pentos** — TikTok competitor tracking
- **Tweet Hunter / Twemex** — X scraping + ideation
- **Pin Inspector** — Pinterest analytics
- **Apify** — flexible web scraping (LinkedIn, IG, etc.)
- **Phantom Buster** — automation + scraping

### A/B testing + CRO
- **VWO / Optimizely / Convert** — full A/B platforms
- **Intelligems** — Shopify-native A/B
- **Hotjar / Clarity** — qualitative
- (Google Optimize is dead — sunset Sept 2023)

### Supporting infrastructure
- **GitHub** — code + skills source of truth (this repo)
- **Supabase** — state + history + dashboard backend
- **Cloudflare** — DNS, CDN, security (recommended for any owned domain)
- **Vercel / Netlify** — landing page hosting
- **Notion / Airtable** — review queue for `creative-refresh` (until dashboard built)

### Israeli-specific
- **Mas Hachnasa portal** (taxes.gov.il) — tax authority
- **Bituach Leumi portal** (btl.gov.il) — national insurance
- **Rasham HaChavarot** (companies.justice.gov.il) — corporate registration
- **iCount / Hashavshevet / Rivhit / Sumit** — accounting software
- **Bank Hapoalim / Mizrahi-Tefahot / Leumi business accounts** — primary banking
- **Tranzilla / iCredit / Yaad / Cardcom** — Israeli payment processors

---

## Authentication / setup TODO

The bottleneck list — tools that are ready, just waiting on user action.

### Critical (blocks v1)
- [ ] **Meta Business Manager app** — generate long-lived token with `ads_read`, `ads_management`, `business_management` scopes, plug into `meta-ads` MCP
- [ ] **Supabase** — create project, get URL + anon key + service-role key, configure MCP
- [ ] **Note ad account ID** (`act_XXXXX`)

### High priority (unblocks v2)
- [ ] **Klaviyo** — generate private API key (read + write campaigns + flows)
- [ ] **Shopify** — install official Shopify MCP, generate Admin API token
- [ ] **Google Search Console** — verify domain, generate OAuth token
- [ ] **GA4** — measurement ID + service-account key
- [ ] **Pagespeed Insights** — generate API key

### Medium (unblocks v3)
- [ ] **TikTok Marketing API** — register dev app, get token (sandbox first)
- [ ] **YouTube Data API** — generate OAuth
- [ ] **Pinterest API** — register app, OAuth
- [ ] **Judge.me** — generate API key
- [ ] **ManyChat** — generate API key + connect IG webhook

### Optional / specialty
- [ ] **Apple Search Ads API** — only if Apple ads are actually a budget line
- [ ] **LinkedIn Marketing API** — only if LinkedIn ads run

---

## Per-skill MCP requirements (cross-reference)

| Skill | Required MCPs (P0/P1) | Optional MCPs |
|---|---|---|
| `customer-service` | gmail | instagram, shopify |
| `social-funnel` | playwright | instagram, manychat |
| `email-welcome` | klaviyo | shopify |
| `email-abandon` | klaviyo, shopify | — |
| `email-postpurchase` | klaviyo, shopify | judge.me |
| `email-campaigns` | klaviyo | playwright (research scraping) |
| `ecom-quiz` | shopify | klaviyo, octane-ai if used |
| `popup-form` | klaviyo OR privy | — |
| `theme-page` | playwright | youtube-api, pinterest-api, ig-graph, capcut (no MCP — manual) |
| `ads-master` | meta-ads, supabase | google-ads, tiktok-ads, etc. (per platform) |
| `seo-master` | playwright, gsc, pagespeed | ga4, ahrefs, bing-webmaster |
| `cro` | playwright, pagespeed, ga4 | clarity, vwo |
| `taxes-israel` | none (mostly manual + accountant) | shopify (revenue), stripe (transactions) |
| `viral-loop` | meta-ads, klaviyo | judge.me, shopify |

---

## Open questions to resolve

- **Klaviyo MCP**: no official MCP. Build custom (small wrapper around their REST API) or use n8n workflow.
- **Apple Search Ads**: official API exists but no MCP. Build custom only if budget actually justifies.
- **Israeli payment processors**: Tranzilla / iCredit have APIs but no MCPs. For taxes-israel revenue tracking, manual import or build a small Israeli-payment-aggregator MCP.
- **Multi-account ops**: each platform may need separate auth per page (theme-page operating 5+ pages). Token management strategy required (Supabase encrypted-vault approach recommended).
