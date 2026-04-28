# Hebrew Invoice Template

Custom design — NOT via Greeninvoice/EZcount. Render via Playwright + HTML template.

## Template location

`skills/finance-il/templates/invoice-he.html` (RTL, Tailwind-styled, brand logo placeholder).

## Required fields

| Field | Source |
|---|---|
| מספר חשבונית | sequential per-brand from `invoices_issued` |
| תאריך הנפקה | now |
| תאריך עסקה | order.placed_at |
| שם העוסק / ח.פ. | `tax_entities.legal_name` + `entity_number` |
| כתובת | `tax_entities.address` |
| לקוח | `orders.customer_name` or "לקוח אנונימי" |
| ת.ז. / ח.פ. לקוח | only required if total > 5,000 ₪ |
| פירוט פריטים | products.title_he, qty, unit_price, line_total |
| סכום לפני מע"מ | subtotal |
| מע"מ 17% | vat_amount (or 0% + "ייצוא" flag if export) |
| סה"כ | total |
| מספר הקצאה | from rashut-hamissim if total > 25,000 ₪ IL |
| תנאי תשלום | "שולם" (since this is invoice_receipt) |
| חתימה דיגיטלית | per ITA spec |

## Document type

`invoice_receipt` (חשבונית-קבלה) — combined invoice + receipt, used since payment is already collected via Shopify.

## Storage

- PDF → Supabase Storage `invoices/{brand_slug}/{year}/{invoice_number}.pdf`
- DB row → `invoices_issued` with `pdf_url` column
- Email → `customer_email` if present

## Dedup

By `(brand_id, order_id)` — never issue twice for same order.
