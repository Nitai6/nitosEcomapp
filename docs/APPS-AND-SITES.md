# Apps & Sites — Canonical Account Inventory

Every external service the system uses. **No Klaviyo. No Cardcom. No Stripe. No ManyChat. No NanoBanana. No Gemini. No Metricool.** This is the locked v3 list.

---

## ✅ Already Connected (15)

You confirmed these are wired up in your current laptop's `state/secrets/.env`. Tomorrow you'll copy that file to the new laptop.

| # | Service | Used by | Login URL |
|---|---|---|---|
| 1 | **Supabase** | every agent (state + KPI history + decisions tables) | https://supabase.com |
| 2 | **Telegram** (Bot API) | finance-il (receipt/UGC poll), meta-ads (high-stakes approvals), all agents (alerts) | https://t.me/BotFather |
| 3 | **Slack** | all agents (alert mirror) | https://api.slack.com/apps |
| 4 | **Gmail** | customer-service (inbox), finance-il (invoice pull), email-marketing (digest) | https://gmail.com |
| 5 | **Higgsfield** (Playwright) | meta-ads, social-tiktok, social-youtube, social-instagram, social-pinterest, avatar-builder. Two routes: GPT-image 2.0 (images) + Seedance 2.0 (videos) | https://higgsfield.ai |
| 6 | **ElevenLabs** | meta-ads creative VO only | https://elevenlabs.io |
| 7 | **Google Search Console** | seo, analytics | https://search.google.com/search-console |
| 8 | **Instagram Graph API** (Meta Developers) | social-instagram, customer-service (DMs), dm-funnel | https://developers.facebook.com |
| 9 | **TikTok Marketing + Content API** | ads-multi-platform (ads), social-tiktok (content) | https://developers.tiktok.com |
| 10 | **YouTube Data API** | social-youtube | https://console.cloud.google.com (same project as Gmail) |
| 11 | **Apify** | ads-competitor, social-instagram (calendar scrape), social-tiktok, social-youtube Path 2, seo (Reddit/Quora) | https://apify.com |
| 12 | **PostHog** | analytics, advisory, customer-service | https://posthog.com |
| 13 | **Sentry** | analytics, advisory, seo (storefront errors) | https://sentry.io |
| 14 | **Google Docs** (Drive API) | brand-creator (Doc 1 source), brand SOP storage | https://console.cloud.google.com |
| 15 | **Hostinger** | domain hosting only (no agent runtime calls) | https://hpanel.hostinger.com |

---

## ⏳ Pending — You Still Need These (8)

I'm waiting on the 8-block I asked for in my prior message. Get accounts on these tomorrow:

| # | Service | Used by | Login / signup |
|---|---|---|---|
| 16 | **Shopify** (Storefront MCP + Admin API) | website-builder, seo (autofix), meta-ads (LP issues), customer-service (order-status), finance-il (orders + Hebrew invoice) | https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront |
| 17 | **DataForSEO** | seo (audit + KW), ads-competitor, social-pinterest (long-tail) | https://dataforseo.com |
| 18 | **Mailjet** (rotated keys after leak) | email-marketing, dm-funnel (email capture) | https://app.mailjet.com |
| 19 | **Pipeboard** OR custom Meta Graph wrapper | meta-ads (full autonomy) | https://pipeboard.co/ — or say "build meta wrapper" and I'll author one like the Leumi/Submagic ones |
| 20 | **Pinterest** (Developer API) | social-pinterest | https://developers.pinterest.com |
| 21 | **HeyGen Hyperframes** | meta-ads (avatar video creative), social-youtube/tiktok (founder talking-head). REPLACES Remotion in your stack. | https://heygen.com |
| 22 | **Submagic** (rotated key after leak) | meta-ads (regen captions), social-youtube Path 1 (Shorts extraction), social-tiktok, social-instagram UGC | https://submagic.co |
| 23 | **Bank Leumi Open Banking** | finance-il (reconciliation + tax/BL deposits) — TPP registration takes 1–2 weeks for prod, sandbox is instant | https://www.leumiopenbanking.co.il/apis |

---

## 🛠 Owner-Built / Custom (3 — already coded)

| Service | Status | Path |
|---|---|---|
| `mcp-servers/leumi-open-banking/` | ✅ built (REST wrapper around Bank Leumi Open Banking) | C:\Users\Admin\projects\paidads\mcp-servers\leumi-open-banking |
| `mcp-servers/submagic/` | ✅ built (REST wrapper around Submagic API) | C:\Users\Admin\projects\paidads\mcp-servers\submagic |
| Superprofile clone | 🚧 you build later — ManyChat-replacement (DM automation + link-in-bio). dm-funnel runs in degraded mode (IG Graph DM only) until clone ships. | tbd |

---

## ❌ Explicitly Dropped (do not sign up — agents don't use these)

Klaviyo · Cardcom · Stripe · ManyChat / Manychat · Gemini API · NanoBanana · Metricool · Steel.dev · Google Analytics 4 · Microsoft Clarity · Notion · Hashavshevet / EZcount / Greeninvoice · Remotion (replaced by Hyperframes) · Heygen avatars (covered by Hyperframes API) · Reddit API · Quora scraper (Apify covers both)

---

## What each agent uses (cross-check)

```
finance-il          → Bank Leumi · Shopify · Gmail · Telegram · Supabase · Playwright (PDF)
seo                 → Shopify · DataForSEO · GSC · Apify · Supabase
email-marketing     → Mailjet · Gmail · Supabase
meta-ads            → Pipeboard (or custom Meta wrapper) · Higgsfield · Submagic · ElevenLabs · Supabase
ads-multi-platform  → TikTok · YouTube · LinkedIn · Microsoft · Apple · Supabase
ads-competitor      → Apify · Supabase
analytics           → GSC · PostHog · Sentry · Shopify · Meta · Supabase
advisory            → reads every other agent's state · Supabase
social-instagram    → Instagram Graph · Higgsfield · Submagic · Apify · Supabase
social-tiktok       → TikTok Content · Higgsfield · Submagic · Apify · Supabase
social-youtube      → YouTube Data · Submagic · Higgsfield · Apify · Supabase
social-pinterest    → Pinterest · Higgsfield · DataForSEO · Supabase
customer-service    → Instagram Graph · Gmail · Shopify · Telegram · Supabase
dm-funnel           → Instagram Graph · Mailjet · Supabase (+ Superprofile-clone when ready)
hook-mining         → Apify · Supabase
dashboard-bridge    → Supabase · file system (state/dashboard/)
brand-creator       → Google Docs · Apify · DataForSEO · Higgsfield · Hyperframes · Shopify · Hostinger · Telegram
```
