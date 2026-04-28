# Expense Categories

For Phase C.2 ingest. Maps parsed vendor invoices to categories for VAT input + P&L.

## Categories

| Category | Examples | VAT-deductible? |
|---|---|---|
| `ads-meta` | Meta Ads invoice | ✅ |
| `ads-google` | Google Ads | ✅ |
| `ads-tiktok` | TikTok Ads | ✅ |
| `saas-tools` | Mailjet, Shopify, Apify, Submagic, Higgsfield, ChatGPT, Claude | ✅ |
| `cogs` | Supplier invoices, AliExpress, CJ, Spocket | ⚠️ usually 0% (import VAT) |
| `shipping` | DHL, Israel Post, fulfillment | ✅ if IL vendor |
| `banking` | Wise FX, Shopify Payments fees, bank charges | ✅ if IL |
| `professional` | רואה חשבון, עורך דין, יועץ | ✅ |
| `office` | Equipment, software licenses | ✅ |
| `travel` | Flights, lodging — only if business-purpose justified | partial |
| `other` | Catch-all — flag for owner review | review |

## Foreign reverse-charge flag

Set `is_foreign_reverse_charge = true` when `vendor_country ≠ IL`. The agent self-charges + deducts (net zero VAT but must report).

## Auto-classify rules

LLM parser + heuristics:
- vendor matches Meta/Facebook → `ads-meta`
- vendor matches Google/Alphabet → `ads-google`
- vendor matches Shopify → `saas-tools`
- vendor in `{Shopify Payments, Leumi, Wise, ISRACARD}` → `banking`
- vendor in `{AliExpress, CJDropshipping, Spocket}` → `cogs`
- otherwise: classify by description keywords; fallback `other` + owner review flag

## P&L impact

Each `expenses` row hits `v_daily_profit.expenses` automatically.
