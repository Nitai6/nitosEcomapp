# Owner's Meta Metric Thresholds (verbatim)

Every metric, every band, every action. The cron agent labels each ad against this and emits the action when a band fires.

| Metric | bad | weak | ok | good | strong | Action when low |
|---|---|---|---|---|---|---|
| **ATC rate** | <3% | — | — | 5–6% solid | 8%+ strong | fix product page / offer / price |
| **uCTR** | — | — | — | 1.5%–2.5% | 2.5%+ | use as main CTR signal |
| **Hook Rate (3s hold)** | <20% | 20–30% | — | 30–40% | 40%+ | change first 3 sec — hook sucks |
| **Thumb Stop Rate** | <20% | — | 20–30% | — | 30%+ | make visual more aggressive / pattern break |
| **CTR (link)** | <1% | 1–1.5% | — | 1.5–2.5% | 2.5%+ | change angle/message (not just hook) |
| **Outbound CTR** | — | <1% | 1–2% | — | 2%+ | weak intent / mismatch |
| **3s View Rate** | — | — | — | 25–40% | — | hook weak |
| **25% View Rate** | <20% | — | 20–30% | — | 30%+ | pacing/content boring |
| **50% View Rate** | <10% | — | — | 10–20% | 20%+ | video loses interest |
| **75–100% View** | low normal | — | — | — | — | weak storytelling |
| **Landing Page View Rate** | <60% | — | 60–80% | 80%+ good | — | slow site / tracking issue |
| **Initiate Checkout Rate** | — | — | — | ~50–70% of ATC | — | friction before checkout |
| **CVR** | <1% | — | 1–2% | 2–4% | 4%+ | trust / pricing / UX issue |
| **ROAS** | <1 loss | 1–1.5 BE | — | 1.5–2 | 2+ | check funnel metrics |
| **Frequency** | — | — | — | 1–2 fresh, 2–3 ok | — | 3+ fatigue → new creatives |

## Action-only metrics (varies/relative — flag direction not band)

- **CPM:** high + low CTR → creative sucks (not audience)
- **CPC:** high → fix CTR (creative issue)
- **Avg Watch Time:** higher = better; low → fix pacing/content
- **CPA:** high → check CTR + ATC to find issue
- **Cost per ATC:** high → product/offer weak
- **Cost per IC:** high → checkout friction

## Excellence flag

3%+ on the relevant rate metric = excellent.

## Owner's "always check" panel (six FB account metrics)

1. Add to cart
2. Checkout rate
3. Conversion rate
4. Hold rate
5. AOV
6. Hook rate
