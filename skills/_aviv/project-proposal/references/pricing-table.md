# Pricing Table Reference

Reference data for calculating project proposals. All hour estimates are based on a single developer working with Claude Code.

## Component Hour Estimates

| Component | Simple (hrs) | Medium (hrs) | Complex (hrs) |
|-----------|-------------|--------------|----------------|
| Auth (login/register/forgot) | 6 | 10 | 16 |
| Dashboard with charts | 10 | 18 | 28 |
| CRUD module (single entity) | 5 | 8 | 14 |
| User management / roles | 8 | 14 | 22 |
| Payment integration | 10 | 16 | 24 |
| File upload / media | 4 | 8 | 14 |
| Search & filtering | 4 | 8 | 14 |
| Notifications system | 6 | 10 | 16 |
| Settings / profile page | 3 | 6 | 10 |
| Landing / marketing page | 4 | 8 | 14 |
| Form (multi-step/complex) | 6 | 10 | 16 |
| API integrations (per service) | 4 | 8 | 14 |
| Email system (transactional) | 4 | 8 | 12 |
| Admin panel | 8 | 14 | 22 |
| Real-time features (chat/ws) | 10 | 18 | 28 |
| Data export (CSV/PDF) | 3 | 6 | 10 |
| Onboarding flow | 4 | 8 | 14 |
| Project setup & deployment | 6 | 6 | 8 |

## Complexity Definitions

- **Simple**: Standard UI, no custom logic, common patterns (e.g. basic login form, simple CRUD table)
- **Medium**: Custom UI elements, business logic, integrations (e.g. dashboard with custom charts, multi-step form with validation)
- **Complex**: Advanced interactions, complex data flows, real-time features, custom algorithms (e.g. real-time collaborative editing, complex permission system)

## Calculation Rules

- Default hourly rate: 300 NIS/hr (configurable per project)
- PM overhead: 15% of component hours
- QA/testing buffer: 10% of component hours
- VAT: 17% (Israeli standard)
- Formula: `grand_total = (component_hours * 1.25) * rate * 1.17`

## Discount Guidelines

- First project with new client: up to 15% discount
- Returning client: up to 10% discount
- Large project (100+ hours): up to 10% volume discount
- Discounts are applied to the subtotal before VAT
- Never discount below 250 NIS/hr effective rate

## How to Use

1. For each screen in the Figma design, identify which components it contains
2. A single screen may contain multiple components (e.g. dashboard = Dashboard with charts + Search & filtering)
3. Assess complexity based on the visual complexity and implied business logic
4. Sum all component hours
5. Apply overhead multipliers
6. Calculate final price
