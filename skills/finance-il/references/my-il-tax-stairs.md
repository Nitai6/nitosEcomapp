# IL מס הכנסה — 2026 Stairs (OWNER-CONFIRMED)

## 2026 brackets

| Bracket | Annual ₪ slice | Rate |
|---|---|---|
| 1 | 0 – 84,120 | 10% |
| 2 | 84,121 – 120,720 | 14% |
| 3 | 120,721 – 193,800 | 20% |
| 4 | 193,801 – 269,280 | 31% |
| 5 | 269,281 – 560,280 | 35% |
| 6 | 560,281 – 721,560 | 47% |
| 7 | 721,561+ | 50% |

Owner-confirmed 2026-04-27. Agent IS authorized to execute deposits per these stairs.

## מעברי סוג עוסק (entity transitions)

- `osek_patur` ceiling: ytd revenue > 122,833 ₪ → must convert to `osek_murshe`
- Strategic threshold: projected annual net > 300,000 ₪ → consider `chevra ba'am`

## Computation rule

`income_tax_owed = sum over each bracket: min(profit, bracket_top) - bracket_bottom × bracket_rate`

Round per ITA convention (no agorot).
