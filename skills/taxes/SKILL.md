---
name: taxes
description: Israeli e-com tax agent. Tracks net profit across all revenue/cost sources, classifies current מס הכנסה + ביטוח לאומי brackets, alerts on bracket transitions, calculates exact amounts owed, ingests expense invoices from email + Telegram, issues Hebrew invoices for Shopify orders, and (when authorized) initiates Bank Leumi deposits for tax + national-insurance obligations.
trigger:
  manual: "/taxes status"
  scheduled: "daily 08:00 Asia/Jerusalem  # profit + bracket check"
  event: "on order paid, on expense invoice received"
mcp_dependencies:
  required:
    - supabase  # state, profit views
  optional:
    - shopify        # orders + revenue
    - gmail          # expense-invoice search
    - telegram       # invoice image intake
    - bank-leumi     # deposit execution (see open-questions.md)
    - cheshbonit-digitalit  # IL e-invoice issuance
references:
  - references/my-il-tax-brackets.md
  - references/my-il-tax-brackets.md#מעברי-סוג-עוסק
self_heal: skills/_lib/self-heal.md
---

# Israeli Taxes Agent

One agent that handles every tax-related thing for the operator's e-com brand(s):

1. **Profit math** — pulls net profit from `v_daily_profit` / `v_monthly_profit` (Supabase). Refreshes every 24h or on demand.
2. **Bracket classification** — given annualized net profit + entity type, identifies current מס הכנסה bracket and ביטוח לאומי tier.
3. **Bracket alerts** — writes to `alerts` (category `taxes`) when a bracket transition happens (up or down) or when projected EOY income would cross the next sub-tier.
4. **Amount-owed calculation** — exact ₪ owed for next pay cycle, per `tax_entities.entity_type` + `vat_frequency`.
5. **Bank Leumi deposit** — drafts a payment instruction; **executes only if `auto_pay = true`** in `alert_preferences` AND the Bank Leumi MCP is authenticated. Otherwise, surfaces a "confirm and click Pay" alert. (See Open Questions.)
6. **Expense-invoice ingest** — searches Gmail for new vendor invoices (PDFs/HTML), normalizes, writes to `expenses`. Also accepts Telegram images → OCR → `expenses`.
7. **Revenue-invoice issuance** — for every paid Shopify order, generates a Hebrew `invoice_receipt` via Cheshbonit Digitalit MCP and stores in `invoices_issued`.

---

## Process

### Phase 1 — Profit refresh (every run)

1. **Precheck**:
   - Supabase MCP connected? If not → log `degraded`, halt phases 2-7.
   - `tax_entities` row exists for active brand? If not → write alert (`crit`, "Tax entity not configured") and halt phases 2-5.

2. **Pull current numbers** from Supabase:
   ```sql
   select * from v_monthly_profit where brand_id = $brand_id order by month desc limit 12;
   select * from v_daily_profit where brand_id = $brand_id and date >= current_date - 30;
   select * from subscriptions where is_active = true;  -- operator-level, deducted from operator income
   ```

3. **Annualize**:
   - `ytd_net_profit` = sum of `net_profit` from Jan 1 to today
   - `projected_annual_net` = `ytd_net_profit / months_elapsed * 12` (simple linear; flag as estimate)

### Phase 2 — Bracket classification

Read `references/my-il-tax-brackets.md`. Match `projected_annual_net` against:

- **מס הכנסה** brackets (10/14/20/31/35/47/50%) — per the table.
- **ביטוח לאומי** rate (7.7% reduced / 18% standard) — based on **monthly** profit (annual ÷ 12).
- **Entity transition flags**:
  - If `entity_type = 'osek_patur'` AND `ytd_revenue > 122,833 ₪` (annual mahzor, not net profit) → alert `crit`: "מעבר לעוסק מורשה נדרש".
  - If `entity_type = 'osek_murshe'` AND `projected_annual_net > 300,000 ₪` → alert `info`: "Strategic: consider Chevra Ba'am".

Write the resulting bracket + amounts to `alerts` (only if changed since last run) and to `routine_runs.artifacts`.

### Phase 3 — Amount-owed calculation

For the next pay cycle (depends on `entity_type` + `vat_frequency`):

```
income_tax_owed   = sum over filled brackets up to current(projected_monthly_net) × bracket_rate
bituach_leumi_owed = monthly_net × (7.7% on first 7,703 ₪ + 18% on the slice 7,703 → 51,910 ₪)
vat_owed (if relevant) = vat_reports view for current period
```

Round per ITA convention (no agorot). Write to `routine_runs.artifacts.tax_amounts_owed`.

### Phase 4 — Bank Leumi deposit

**Gate**: only proceeds if all true:
- `alert_preferences.auto_pay = true` for category `taxes` for current user
- `bank-leumi` MCP is `connected` in `connections`
- Computed amount > 0 and < user-configured `max_auto_pay_ils` cap

If gated off → write `alerts` (`warn`, "₪X owed, click to pay"), include a deeplink to the dashboard's Taxes page where user clicks Confirm.

If gated on → call `mcp__bank-leumi__create_payment` (assumed name; **see Open Questions**) with:
- recipient: רשות המסים / ביטוח לאומי
- amount: from Phase 3
- reference: tax period
On success → insert `bituach_leumi_payments` row or `vat_reports` row depending on payment type.

### Phase 5 — Expense-invoice ingest

Two sources, run in parallel:

**5a. Gmail search**
- Query: `subject:(invoice OR חשבונית OR receipt OR קבלה) newer_than:7d -from:me`
- For each match: download attachment (PDF) or extract HTML body
- LLM-parse: vendor, amount, currency, VAT, invoice_ref, date, is_export (foreign vendor → reverse-charge VAT in IL)
- Insert into `expenses` with `is_foreign_reverse_charge = (vendor_country != 'IL')`

**5b. Telegram bot**
- Listen on configured chat
- On image upload from authorized user: OCR (Gemini vision or Tesseract) → same parse → `expenses`
- Reply with confirmation: "✓ הוצאה נרשמה: ₪X מ-{vendor}"

Dedupe by `invoice_ref` per vendor.

### Phase 6 — Revenue-invoice issuance

For each Shopify order with `status = 'paid'` and no row in `invoices_issued`:
1. Build invoice payload (Hebrew):
   - Customer name (or "לקוח אנונימי" if empty)
   - Items in Hebrew (use `products.title` if Hebrew exists, else translate via LLM and cache)
   - VAT 18% if `customer_country = 'IL'`, else 0% with `is_export = true`
2. Call `mcp__cheshbonit-digitalit__issue_invoice` (assumed name) → get allocation number from rashut_hamissim
3. Insert into `invoices_issued` with `cheshbonit_digitalit_id` + `invoice_number`
4. Optionally: send PDF to customer email

---

## Output contract

Each run writes:
- `routine_runs` row with `routine_name = 'taxes'`, `status`, `artifacts = {ytd_net_profit, projected_annual_net, current_income_tax_bracket, current_bl_tier, amounts_owed, transitions, ingested_expenses_count, issued_invoices_count}`
- New `alerts` rows for: bracket changes, entity-type transitions, payment-pending warnings, parse failures
- New rows in `expenses`, `invoices_issued`, `vat_reports`, `bituach_leumi_payments` as applicable

Markdown summary for human / email digest:

```
🧾 Taxes — {date}
Net profit (YTD): ₪{x}  · Projected annual: ₪{y}
מס הכנסה bracket: {pct}%  · ביטוח לאומי tier: {pct}%
Owed next cycle: ₪{z}  · {auto_paid | needs_confirmation}
Expenses ingested: {count}  · Revenue invoices issued: {count}
{any_alerts}
```

---

## Open questions (must confirm before V1 ships)

1. **Bank Leumi "official API"** — Israeli retail banks do **not** offer public payment-execution APIs to individuals. Options:
   - (a) Open Banking read-only (PSD2-style) — read balances, can't execute payments
   - (b) Business banking API — requires specific contract, not standard
   - (c) "Pay" stays manual: agent prepares the מקדמה form pre-filled, user clicks once
   - **My default**: ship (c). Switch to (b) if/when you confirm Bank Leumi gave you API credentials.

2. **Cheshbonit Digitalit integration** — since Jan 2024, IL invoices > ₪25k need an "allocation number" from rashut_hamissim. Options:
   - (a) Direct integration with rashut_hamissim API (requires PFX cert + מייצג authorization)
   - (b) Use a SaaS provider that handles it (Greeninvoice, iCount, Cardcom) — has APIs
   - **My default**: (b) Greeninvoice (cheapest, widely used). Need your Greeninvoice account or you create one.

3. **Telegram bot** — needs a bot token (BotFather) + a designated chat. Tell me which Telegram account is "you" so I authorize it.

4. **Wise + Shopify fees** — currently the schema captures `processor_fee` per order (Shopify Payments) but **not Wise FX fees** as a separate stream. Add `external_costs` rows from Wise statements monthly, OR add a Wise MCP. Confirm preference.

---

## Self-heal

Standard contract per `skills/_lib/self-heal.md`:
- Transient MCP failure → exponential backoff, max 3 retries
- Schema-violating output (e.g., bad invoice JSON) → 1 self-correction retry
- Missing `tax_entities` row → halt, write `crit` alert, do not proceed
- Bank Leumi auth lapsed → halt phase 4 only, continue 5–6
