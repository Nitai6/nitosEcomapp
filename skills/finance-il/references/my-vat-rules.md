# מע"מ (VAT) — IL Rules

## Rate

- **17%** (standard, 2024–) — ⚠️ owner verify if changed for 2026
- **0%** for export sales (`is_export = true`, customer_country ≠ IL)

## Filing frequency

- `osek_patur`: not VAT-registered, no filing
- `osek_murshe`: monthly OR bi-monthly per `tax_entities.vat_frequency`
- `chevra ba'am`: monthly

## Reverse charge (foreign vendors)

When IL business buys services from non-IL vendor:
- Self-charge VAT (output) AND deduct same amount (input) → net zero, but must report
- Flag: `expenses.is_foreign_reverse_charge = true`

## Allocation number rule (post-Jan-2024)

For invoices issued to IL business customers with `total > 25,000 ₪`:
- Must call `rashut-hamissim` for allocation number BEFORE issuing
- Store on `invoices_issued.cheshbonit_digitalit_id`
- Without it → ITA may reject the invoice for input-VAT credit

## VAT report fields

- Output VAT: total VAT collected on IL sales
- Input VAT: total VAT paid on IL purchases (eligible expenses)
- Net owed: output − input
- Report via שע"מ portal or via רשות המסים MCP when available
