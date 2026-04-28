# ביטוח לאומי + מס בריאות — 2026 Rates (OWNER-CONFIRMED)

Owner-confirmed 2026-04-27.

## Self-employed (עצמאי) — combined ביטוח לאומי + מס בריאות

| Monthly profit slice | Combined rate |
|---|---|
| 0 – 7,703 ₪ | 7.7% (reduced) |
| 7,703 – 51,910 ₪ | 18% (standard) |
| > 51,910 ₪ | 0% (capped) |

## Computation

```
bituach_leumi_owed = min(monthly_net, 7703) × 0.077
                   + max(0, min(monthly_net, 51910) - 7703) × 0.18
```

## Notes

- Annual profit / 12 = monthly_net for slice computation
- Self-employed not eligible for unemployment, but pay the same rate
- BL prepayment due 15th of each month (per ביטוח לאומי schedule) — agent triggers Phase C.3 deposit on 1st with sufficient lead
