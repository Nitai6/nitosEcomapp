# MCP Connection Walkthrough

Step-by-step instructions for connecting all 22 MCPs. Estimated time: **~3 hours total** if you do it in one sitting.

## Before you start

1. **Rotate the 2 leaked keys NOW** — Submagic + Mailjet keys you pasted in chat are compromised:
   - Submagic: log in → Settings → API → Regenerate
   - Mailjet: log in → Account Settings → REST API → Master API Key → Regenerate (both apikey + secret)
2. Open `state/secrets/.env.template`, copy to `state/secrets/.env`, fill values as you go below.
3. After everything is filled, restart Claude Code in this directory — it auto-loads `.mcp.json`.

---

## Wave 1 — Foundation (Day 1, ~90 min)

### 1. Supabase ⏱ 5 min
1. Go to https://supabase.com → create project (or use existing) → name it `paidads-prod`
2. Settings → API → copy:
   - **Project URL** → `SUPABASE_PROJECT_URL`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon public** → `SUPABASE_ANON_KEY`
3. Done. The MCP auto-installs from npx on first use.

### 2. Shopify Storefront MCP ⏱ 15 min
1. Shopify admin → Apps → Develop apps → Create custom app → name `paidads-mcp`
2. Configure Admin API + Storefront API scopes (read_products, write_products, read_orders, write_inventory, etc — full list at https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront)
3. Install app → reveal tokens:
   - **Admin API access token** → `SHOPIFY_ADMIN_ACCESS_TOKEN`
   - **Storefront API access token** → `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
4. Your domain → `SHOPIFY_STORE_DOMAIN` (e.g. `mybrand.myshopify.com`)

### 3. Pipeboard (Meta Marketing) ⏱ 10 min
1. Sign up at https://pipeboard.co/
2. Connect your Meta Business account via OAuth in their dashboard
3. Settings → API Keys → create → copy → `PIPEBOARD_API_KEY`

### 4. DataForSEO ⏱ 5 min
1. https://dataforseo.com/ → sign in
2. Account → API Access → copy login + password
3. `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD`
4. Setup guide: https://dataforseo.com/help-center/setting-up-the-official-dataforseo-mcp-server-simple-guide

### 5. Mailjet ⏱ 5 min (after rotation)
1. Mailjet → Account Settings → REST API → Master API Key → copy NEW apikey + secret
2. `MAILJET_API_KEY` + `MAILJET_API_SECRET`
3. MCP repo: https://github.com/mailgun/mailjet-mcp-server

### 6. Telegram ⏱ 10 min
1. Open Telegram → search `@BotFather` → `/newbot` → follow prompts → save token → `TELEGRAM_BOT_TOKEN`
2. Send any message to your new bot, then visit `https://api.telegram.org/bot{TOKEN}/getUpdates` → find your chat id → `TELEGRAM_OWNER_CHAT_ID`
3. (For receipt routing): create a private channel, add bot as admin, set channel id as the drop folder

### 7. Slack ⏱ 10 min
1. https://api.slack.com/apps → Create New App → From scratch → name `paidads-alerts`
2. OAuth & Permissions → Bot Token Scopes: `chat:write`, `channels:read`, `groups:read`
3. Install to workspace → copy `xoxb-...` token → `SLACK_BOT_TOKEN`
4. Workspace settings → copy team ID → `SLACK_TEAM_ID`
5. Create channel `#paidads-alerts` → invite bot → channel ID → `SLACK_ALERT_CHANNEL`

### 8. Gmail ⏱ 15 min (OAuth flow)
1. https://console.cloud.google.com → New project `paidads`
2. Enable Gmail API
3. OAuth consent screen → External → fill app name + your email
4. Credentials → Create OAuth client ID → Desktop app → download JSON
5. Run once locally: `npx @gongrzhe/server-gmail-autoauth-mcp auth` — opens browser, you sign in, prints refresh token
6. `GMAIL_OAUTH_CLIENT_ID` + `GMAIL_OAUTH_CLIENT_SECRET` + `GMAIL_REFRESH_TOKEN`

### 9. Bank Leumi Open Banking ⏱ 30 min (you build this wrapper)
1. https://www.leumiopenbanking.co.il/apis → register as TPP (Trusted Third Party)
2. Get sandbox credentials first (production has KYC review)
3. `LEUMI_OPEN_BANKING_CLIENT_ID` + `LEUMI_OPEN_BANKING_CLIENT_SECRET`
4. Owner builds the thin MCP wrapper at `mcp-servers/leumi-open-banking/` — there is no public MCP for Leumi
5. Skills referenced: only `finance-il` calls Leumi. Stub the wrapper to return mocked data until production access lands — the rest of the system runs.

---

## Wave 2 — Creative pipeline (Day 2, ~60 min)

### 10. Higgsfield (via Playwright) ⏱ 20 min
1. Sign up at https://higgsfield.ai/
2. Note: there is no official Higgsfield MCP. We use the generic Puppeteer/Playwright MCP and our skill wrappers automate the UI (login → upload → wait → download).
3. `HIGGSFIELD_EMAIL` + `HIGGSFIELD_PASSWORD`
4. Two routes invoked by skills:
   - **GPT-image 2.0** (image gen) — used by meta-ads, social-pinterest, social-instagram (static), avatar-builder
   - **Seedance 2.0** (image-to-video) — used by meta-ads, social-tiktok, social-youtube

### 11. Submagic ⏱ 5 min (after rotation)
1. https://submagic.co/ → Settings → API → Regenerate → copy NEW key → `SUBMAGIC_API_KEY`
2. Submagic doesn't have an official MCP — we wrap their REST API with a thin server at `mcp-servers/submagic/`

### 12. Hyperframes (HeyGen) ⏱ 10 min
1. https://heygen.com/ → API → create key → `HEYGEN_API_KEY`
2. MCP: https://github.com/heygen-com/hyperframes
3. Used for: avatar video creative (replaces Remotion in your stack)

### 13. ElevenLabs ⏱ 5 min
1. https://elevenlabs.io → Profile → API Keys → create → `ELEVENLABS_API_KEY`
2. Voices: pre-clone owner's preferred VO voice in ElevenLabs UI, save voice_id to `state/secrets/.env` as `ELEVENLABS_VOICE_ID`

### 14. GSC ⏱ 15 min (OAuth)
1. Same Google Cloud project as Gmail
2. Enable Search Console API
3. Reuse OAuth client → run `npx mcp-gsc auth` → refresh token
4. `GSC_OAUTH_CLIENT_ID` + `GSC_OAUTH_CLIENT_SECRET` + `GSC_REFRESH_TOKEN`
5. MCP: https://github.com/AminForou/mcp-gsc

---

## Wave 3 — Social agents (Day 3, ~70 min)

### 15. Instagram Graph ⏱ 15 min
1. https://developers.facebook.com → Create app → Business → name `paidads`
2. Add Instagram Graph API product
3. Connect IG account (must be Business or Creator tier, linked to a Facebook Page)
4. Generate long-lived access token via Graph API Explorer (60-day token, then auto-refresh)
5. `INSTAGRAM_GRAPH_ACCESS_TOKEN` + `INSTAGRAM_BUSINESS_ACCOUNT_ID`

### 16. TikTok Marketing + Content ⏱ 20 min
1. https://developers.tiktok.com → Apps → create
2. Request access to **Marketing API** (ads) AND **Content Posting API** (organic posts) — both need approval, can take 1–2 days
3. After approval: OAuth → tokens
4. `TIKTOK_MARKETING_ACCESS_TOKEN` + `TIKTOK_CONTENT_ACCESS_TOKEN` + `TIKTOK_ADVERTISER_ID`

### 17. Pinterest ⏱ 10 min
1. https://developers.pinterest.com → Apps → create
2. Request `boards:write`, `pins:write`, `user_accounts:read`
3. OAuth → access token → `PINTEREST_ACCESS_TOKEN`
4. `PINTEREST_AD_ACCOUNT_ID` from your business account

### 18. YouTube Data ⏱ 10 min
1. Same Google Cloud project as Gmail/GSC
2. Enable YouTube Data API v3
3. OAuth → refresh token
4. `YOUTUBE_OAUTH_CLIENT_ID` + `YOUTUBE_OAUTH_CLIENT_SECRET` + `YOUTUBE_REFRESH_TOKEN`

### 19. Apify ⏱ 5 min
1. https://apify.com → Settings → Integrations → API → copy token → `APIFY_API_TOKEN`

### 20. Superprofile clone ⏱ later
**Skip for now** — owner is building the clone in-house. dm-funnel agent runs in degraded mode (IG Graph DM only, no auto-trigger from comments) until clone ships. When ready, fill `SUPERPROFILE_CLONE_BASE_URL` + `SUPERPROFILE_CLONE_API_KEY` and update `.mcp.json` to point at the clone's MCP wrapper.

---

## Wave 4 — Analytics + extras (Day 4, ~30 min)

### 21. PostHog ⏱ 10 min
1. https://posthog.com → create project → Project Settings → Project API Key → `POSTHOG_PROJECT_API_KEY`
2. Region: US or EU → `POSTHOG_HOST` (e.g. `https://us.i.posthog.com`)

### 22. Sentry ⏱ 10 min
1. https://sentry.io → create project for the storefront → Settings → Auth Tokens → create
2. `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT`

### 23. Google Docs ⏱ 5 min
1. Same Google Cloud project. Enable Google Docs API
2. Reuse OAuth client. Refresh token via `npx @modelcontextprotocol/server-google-docs auth`
3. `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET` + `GOOGLE_OAUTH_REFRESH_TOKEN`
4. (Brand-creator agent reads Doc 1 from here once you re-enable it)

### 24. Hostinger ⏱ 5 min
1. https://hpanel.hostinger.com → Account → API → generate token → `HOSTINGER_API_TOKEN`
2. No official Hostinger MCP — we ship a thin wrapper at `mcp-servers/hostinger/` (DNS ops only)

---

## After all waves are filled

1. Verify in terminal:
   ```
   cd C:\Users\Admin\projects\paidads
   claude mcp list
   ```
   You should see all 22 servers listed. Any with errors → check the corresponding env var in `state/secrets/.env`.

2. Restart Claude Code in this directory.

3. Tell me "MCPs are live" — I'll register the 16 cron routines via `mcp__scheduled-tasks__create_scheduled_task`.

---

## What I'm building for you (custom MCP wrappers — no off-the-shelf available)

I'll author these 3 stub servers next session if you want autonomy:
- `mcp-servers/leumi-open-banking/` — Bank Leumi Open Banking REST wrapper
- `mcp-servers/submagic/` — Submagic REST wrapper
- `mcp-servers/hostinger/` — Hostinger DNS REST wrapper

Until those are written, you can also use n8n as the bridge (HTTP request nodes in n8n called from skills) — slower but no code to maintain.

---

## Troubleshooting

**`claude mcp list` shows server "failed to connect"** → check the env var name matches `.env` exactly (no quotes, no trailing spaces). Restart Claude Code.

**OAuth refresh token expired** → re-run the auth command for that MCP. Most last 6 months but some (Meta especially) need refresh every 60 days — Pipeboard handles this for you on Meta side.

**npx command not found in MCP startup** → install Node.js 20+ system-wide.

**Conflict between project-level `.mcp.json` and user-level config** → project-level wins. To verify: `claude mcp list --scope project`.
