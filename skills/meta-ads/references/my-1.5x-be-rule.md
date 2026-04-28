# Owner's 1.5× Break-Even Rule (verbatim)

> The minimum to go on scale is **1.5x of our break even**.
>
> E.g.: if our BE is 1.5 we then want our ROAS to be 1.5x of the 1.5 to be able to scale (1.5 × 1.5 = X minimum).

## In code

```
break_even_roas = brands.break_even_roas       -- per-brand, set in Settings
scale_min_roas  = 1.5 * break_even_roas

if campaign.roas_7d >= scale_min_roas:
    eligible_to_scale = true
else:
    hold
```

## Examples

| Break-even ROAS | Minimum scale ROAS |
|---|---|
| 1.5 | 2.25 |
| 2.0 | 3.0 |
| 2.5 | 3.75 |
| 3.0 | 4.5 |

## Window

Use the **7-day** ROAS as the primary signal. Check the **3-day** ROAS as confirmation (no recent crash). Check **14-day** for trend.

## When ROAS just barely meets the gate

If `roas_7d` is within 5% of `scale_min_roas`: **hold** rather than scale (false-positive risk). Re-check in 24h.
