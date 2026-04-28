# Ecom Quiz (one-time setup)

## Principles

- **Customer-research-based** — reflect real problems, use cases, goals
- **Purpose-driven questions** — if a question doesn't influence the final recommendation, remove it
- **Seamless fast to perceived value** — user feels progress early; each step feels closer to "right product"
- **Smooth flow** — one question at a time, clear answer choices, mobile-optimized, fast loading, no overthinking

> A good quiz asks questions. A great quiz **builds belief that the recommendation is right** — and makes buying the obvious next step.

## Implementation

- Build via Shopify theme app block or custom Next.js component (`paidads/app/quiz/`)
- Persist answers → Mailjet contact custom fields (segmentation fuel)
- End: product recommendation card + "add to cart" CTA + email capture for follow-up
