# nitosEcomapp

All-in-one control panel for **ads, SEO, CRO, socials, emails & SMS, customer service, Israeli taxes, ecom-builder projects, and app settings**. Backed by Supabase, built with Next.js 14.

**Open-source self-hosted template** — each operator/friend runs their own Supabase + Vercel deployment. No central server, no shared data.

## 9 categories

| # | Category | What it tracks |
|---|---|---|
| 1 | **Ads** | Campaigns, ad sets, creatives, daily insights, ROAS, MER, kill/scale log |
| 2 | **SEO** | Pages, keywords, rankings, audits, backlinks, GEO readiness |
| 3 | **CRO** | Pages, A/B tests, LP health scores, funnel leaks |
| 4 | **Socials** | Accounts across YT/IG/TT/X/Bluesky/FB/Pinterest, posts, content calendar, reverse-eng targets |
| 5 | **Emails & SMS** | Flows, campaigns, segments, opens, clicks, conversions, attributed revenue |
| 6 | **Customer Service** | Tickets across email/IG/FB/WhatsApp/chat, response SLAs, FAQ knowledge base |
| 7 | **Taxes (Israel)** | Osek Patur / Osek Murshe / Chevra Ba'am, VAT 18% reporting, reverse-charge for foreign ad spend, Bituach Leumi |
| 8 | **Ecom Builder** | Store-build projects, stages, tasks, assets, agent session links |
| 9 | **Settings** | Brands, MCP connections, manually tracked subscriptions, niches, benchmarks, alert preferences |

Plus an **invisible data-layer** (products, orders, refunds, ad_spend_daily, external_costs) that feeds profit math into every category.

## Stack (cheapest viable)

| Layer | Tool | Cost |
|---|---|---|
| Database + auth + storage | Supabase (free tier) | $0 |
| Frontend | Next.js 14 on Vercel (hobby) | $0 |
| UI | Tailwind + custom theme | $0 |
| Charts | Recharts | $0 |
| Auth | Supabase magic link | $0 |

**Total: $0/month** until you outgrow free tiers (~10k orders/month or 500MB historical data).

## Theme

Light blue + blonde. Primary `#0EA5E9` (sky), accent `#D4A574` (honey). Defined in `tailwind.config.ts`.

## Setup (self-host)

### 1. Create Supabase project
- Go to https://supabase.com → New project
- Pick your region (Frankfurt for Israel/EU, us-east-1 for US, etc.)
- Save the DB password
- Settings → API → copy **Project URL**, **anon key**, **service_role key**

### 2. Apply schema
The database schema lives in 7 migrations (49 tables + 8 profit views). Options:
- **Via Supabase MCP** (fastest): connect the Supabase MCP and run each migration file from `supabase/migrations/` in order
- **Via Supabase CLI**: `supabase link --project-ref YOUR_REF && supabase db push`
- **Manual**: open each file in `supabase/migrations/` and paste into Supabase SQL Editor, in numeric order

### 3. Clone + run locally
```bash
git clone https://github.com/Nitai6/nitosEcomapp
cd nitosEcomapp
cp .env.example .env.local
# edit .env.local with your Supabase URL + keys
npm install
npm run dev
```

### 4. Deploy to Vercel
```bash
npx vercel
```
Add the same env vars in Vercel project settings.

### 5. First login
- Go to your deployed URL → enter your email → click magic link
- Supabase creates an `auth.users` row on first login. Add a matching `app_users` row in SQL Editor:
```sql
insert into app_users (id, email, role)
values ('<your auth.users id>', 'you@example.com', 'owner');
```

## Data flow

```
External services (Meta Ads, Klaviyo, Shopify, GSC, Gmail, ...)
    ↓  via MCPs / APIs / webhooks
Supabase tables  (raw data, 1 row per event)
    ↓  Postgres views compute on the fly
v_daily_profit, v_campaign_performance, v_monthly_profit, ...
    ↓
Next.js dashboard pages
```

Profit math is pure SQL — `net_revenue - COGS - ad_spend - processor_fees - external_costs`. MER, ROAS, gross margin all live in views, not in application code.

## Privacy model (Path B: self-hosted)

- Each install is a **separate Supabase project** — no cross-operator data sharing by design.
- Subscriptions table tracks **your** operator costs, not per-brand. Friends who install the app add their own subscriptions in their own deployment.
- `user_brand_access` table scopes data per-user within one deployment (for when you manage multiple brands in one install — e.g., your own brands plus agency clients).
- RLS is currently permissive (`USING (true)` for authenticated). Tighten to per-user-per-brand before onboarding untrusted users.

## Roadmap

- [ ] Real CRUD forms on each category page (current pages are read-only shells)
- [ ] MCP integrations: Meta Ads, Klaviyo, Shopify, GSC, GA4, TikTok
- [ ] Routine runner (scheduled audits, creative-refresh, budget-pacing, competitor-watch)
- [ ] Recharts graphs on Overview + Ads pages
- [ ] Mobile-responsive polish
- [ ] Cheshbonit Digitalit integration for Israeli e-invoicing
- [ ] Shopify webhook ingestion for orders/products
- [ ] Ecom-builder agent handoff + session embed

## License

MIT
