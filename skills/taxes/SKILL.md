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
    - leumi-open-banking  # https://www.leumiopenbanking.co.il/apis — PSD2-style (deposit execution)
    - rashut-hamissim     # allocation numbers for invoices > ₪25k (post-Jan-2024 rule)
    - telegram       # invoice image intake (deferred, set up later)
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

4. **Wise FX fee deduction (0.7%)**:
   - At end of each month, compute foreign revenue: `select sum(total) from orders where customer_country != 'IL' and status in ('paid','fulfilled','partially_refunded') and date_trunc('month', placed_at) = $month`
   - Insert/upsert one `external_costs` row per month: `name = 'Wise FX fee', category = 'banking', amount = foreign_revenue * 0.007, currency = 'ILS', incurred_at = last_day_of_month, is_recurring = true`
   - This automatically subtracts from `v_daily_profit.external_costs` → flows into net profit math.

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

### Phase 4 — Leumi Open Banking deposit

Uses Bank Leumi's Open Banking API (https://www.leumiopenbanking.co.il/apis). PSD2-style: requires one-time consent flow → returns access + refresh tokens stored in `connections.vault_secret_id`.

**Gate**: only proceeds if all true:
- `alert_preferences.auto_pay = true` for category `taxes` for current user
- `leumi-open-banking` connection status = `connected`
- Computed amount > 0 and ≤ `max_auto_pay_ils` cap from `alert_preferences.threshold_json`

**Flow**:
1. Refresh OAuth token if expiring within 24h.
2. Call `POST /payment-initiation` (or equivalent endpoint per Leumi API spec) with:
   - debtor_account: operator's Leumi business account (configured per `tax_entities.brand_id` extension)
   - creditor: רשות המסים (for income tax / VAT) or ביטוח לאומי (for BL prepayment)
   - amount: from Phase 3
   - reference: tax period (e.g. `MAS-2026-Q2`)
3. On 2xx → insert `bituach_leumi_payments` or `vat_reports` row with `submitted_at = now()`, `paid_at = response.execution_date`.
4. On failure → keep gate-off behavior (alert, manual confirm).

If gated off → write `alerts` (`warn`, "₪X owed, click to pay"), include a deeplink to dashboard `/taxes` where user clicks Confirm to trigger the same call manually.

> Verify in 1b: exact endpoint names + scopes (`payment-initiation`, `accounts`) once the MCP is wired against the Leumi sandbox.

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

### Phase 6 — Revenue-invoice issuance (end of month, custom Hebrew design)

Runs once per month (last day, or first of next month). Generates Hebrew invoices in a custom design — **not** via SaaS like Greeninvoice.

For each `orders` row in the closing month with `status in ('paid','fulfilled','partially_refunded')` and no matching row in `invoices_issued`:

1. **Translate items**: use `products.title` if already Hebrew; else LLM-translate (cache result on the product row in a new `title_he` column or `metadata` jsonb to avoid re-translating).

2. **Build payload**:
   - `doc_type = 'invoice_receipt'`
   - `invoice_number` = next sequential per-brand (read max from `invoices_issued`, +1)
   - Customer: `customer_name` if present, else "לקוח אנונימי"
   - Currency: `ILS`. VAT: 18% if `customer_country = 'IL'`, else 0% + `is_export = true`
   - Subtotal / VAT / total per the order

3. **Allocation number gate** (post-Jan-2024 ITA rule):
   - If `total > 25000` AND `customer_country = 'IL'` → call `mcp__rashut-hamissim__request_allocation_number` (assumed; verify in 1b) → store on `invoices_issued.cheshbonit_digitalit_id`
   - Otherwise skip (allocation not required)

4. **Render PDF** with custom Hebrew design:
   - Template: `skills/taxes/templates/invoice-he.html` (Tailwind-styled, RTL, brand logo)
   - Use Playwright (already in stack) to render HTML → PDF
   - Store PDF in Supabase Storage bucket `invoices/`, write URL to `invoices_issued.notes` or new `pdf_url` column

5. **Insert** `invoices_issued` row.

6. **Optional**: email PDF to `customer_email` via Gmail MCP.

Run wraps with a digest: "✓ {N} חשבוניות הופקו לחודש {month}, סך הכול ₪{total}".

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

## Decisions locked in (2026-04-25)

1. **Bank Leumi** → Leumi Open Banking API (https://www.leumiopenbanking.co.il/apis). MCP to be built; payment initiation gated by `auto_pay` flag.
2. **Hebrew invoices** → custom design, end of month, no SaaS. Render via HTML template + Playwright PDF. Allocation-number call to rashut_hamissim only when `total > 25,000 ₪`.
3. **Telegram bot** → deferred. Phase 5 ingest = Gmail-only until Telegram bot token is provided.
4. **Wise FX fee** → 0.7% of monthly foreign revenue, auto-inserted as a recurring `external_costs` row at month-end.

## Open items for Phase 1b (build/test)

- Verify exact Leumi Open Banking endpoint names + OAuth scopes against their sandbox
- Verify rashut_hamissim allocation-number endpoint (likely needs PFX cert + מייצג auth)
- Build `skills/taxes/templates/invoice-he.html` (Hebrew RTL invoice template)
- Add `title_he` column or use `products.metadata` jsonb for cached Hebrew translations

---

## Self-heal

Standard contract per `skills/_lib/self-heal.md`:
- Transient MCP failure → exponential backoff, max 3 retries
- Schema-violating output (e.g., bad invoice JSON) → 1 self-correction retry
- Missing `tax_entities` row → halt, write `crit` alert, do not proceed
- Bank Leumi auth lapsed → halt phase 4 only, continue 5–6
