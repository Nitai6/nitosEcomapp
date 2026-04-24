---
name: project-proposal
description: |
  Analyze Figma screenshots, estimate project scope and pricing, and generate
  professional Hebrew PDF proposals (הצעת מחיר). Use when the user says "proposal",
  "הצעת מחיר", "estimate", "quote", "price", "scope", "how much to charge",
  "תמחור", "pricing", or shares Figma screenshots for project scoping.
  Also trigger when user discusses client work pricing or freelance project estimates.
version: 1.0.0
metadata:
  author: Peleg
  category: business
  domain: freelance-development
---

## Overview

This skill helps Peleg generate professional Hebrew proposals for client projects. Given Figma screenshots of a planned app, it:
1. Analyzes each screen to identify components and complexity
2. Calculates pricing based on a component-hour estimation model
3. Generates professional Hebrew copy (using hebrew-copywriting + humanizer skills)
4. Outputs a PDF proposal ready to send to the client

## Workflow

Follow these 5 steps in order. Present results to the user after each step for approval before continuing.

### Step 1: Gather Project Info

Ask the user for:
- **Client name** (שם הלקוח)
- **Project name** (שם הפרויקט)
- **Figma screenshots** - ask user to paste/drop images of the app screens
- **Special requirements** - any specific tech requirements, integrations, or constraints
- **Deadline** (optional) - if there's a target launch date

If the user provides screenshots immediately, extract what you can and ask only for missing info.

### Step 2: Analyze Screenshots

For each screenshot provided:
1. Use Claude's vision to examine the screen
2. Identify the **screen type** (dashboard, form, settings, CRUD table, auth, landing, etc.)
3. List all **UI components** visible (charts, tables, forms, filters, file uploads, etc.)
4. Assess **complexity level**:
   - **פשוט (Simple)**: Standard UI, no custom logic, common patterns
   - **בינוני (Medium)**: Custom UI elements, business logic, integrations
   - **מורכב (Complex)**: Advanced interactions, complex data flows, real-time, custom algorithms
5. Map each component to a category from `references/pricing-table.md`

Present the analysis as a table:

| מסך | רכיבים שזוהו | רמת מורכבות | קטגוריות תמחור |
|-----|-------------|-------------|----------------|

Ask user to confirm or adjust before proceeding.

### Step 3: Build Estimate

Load `references/pricing-table.md` for hour estimates.

For each identified component:
1. Look up base hours from the pricing table based on complexity
2. If a screen contains multiple components, sum their hours
3. Avoid double-counting (e.g., if auth appears on multiple screens, count once)

Calculate totals:
```
component_hours = sum of all component hours
pm_overhead = component_hours * 0.15
qa_buffer = component_hours * 0.10
total_hours = component_hours + pm_overhead + qa_buffer
rate = 300 NIS/hr (default, user can override)
subtotal_price = component_hours * rate
pm_cost = pm_overhead * rate
qa_cost = qa_buffer * rate
total_before_vat = total_hours * rate
vat = total_before_vat * 0.18
grand_total = total_before_vat + vat
```

Payment milestones (based on grand_total):
```
payment_1 = grand_total * 0.30 (upfront)
payment_2 = grand_total * 0.40 (after MVP)
payment_3 = grand_total * 0.30 (final delivery)
```

Timeline estimation:
- Under 40 total hours: 3-4 weeks
- 40-80 total hours: 5-7 weeks
- Over 80 total hours: 8-12 weeks

Present the full pricing breakdown to the user. Ask for approval or adjustments.

**Pricing overrides**: If user says "use X/hr rate" or "add Y% discount", recalculate accordingly. Never go below 250 NIS/hr effective rate.

### Step 4: Generate Proposal Copy

Load `references/proposal-sections.md` for Hebrew section templates.
Load `references/tech-stacks.md` for tech stack description.

For each section:
1. Fill the template with project data
2. For the **פתיח** (intro) and **תיאור הפרויקט** (scope) sections:
   - Invoke the `hebrew-copywriting` skill to write natural, warm Hebrew copy
   - Follow all hebrew-copywriting guidelines (conversational Israeli style, no bullet stacking, flowing sentences)
3. Choose the appropriate tech stack from tech-stacks.md (default: Next.js + PostgreSQL + Prisma)

After writing all sections, invoke the `humanizer` skill on the complete proposal text to remove AI patterns.

Present the final copy to the user for review. Make adjustments as requested.

### Step 5: Generate PDF

Once the user approves the copy:

1. Construct a JSON object with all proposal data:
```json
{
  "client_name": "...",
  "project_name": "...",
  "date": "DD.MM.YYYY",
  "proposal_number": "P-YYYY-NNN",
  "intro_text": "...",
  "scope_text": "...",
  "screens": [{"name": "...", "components": "...", "complexity": "..."}],
  "tech_stack_text": "...",
  "milestones": [{"name": "...", "description": "...", "weeks": "..."}],
  "line_items": [{"component": "...", "hours": "N", "price": "N"}],
  "subtotal_hours": "N",
  "subtotal_price": "N",
  "pm_overhead": "N",
  "qa_buffer": "N",
  "total_before_vat": "N",
  "vat": "N",
  "grand_total": "N",
  "payment_terms": "...",
  "included": "...",
  "excluded": "...",
  "validity_date": "DD.MM.YYYY (14 days from today)"
}
```

2. Save to a temp file:
```bash
cat > /tmp/proposal-data.json << 'EOF'
{the json data}
EOF
```

3. Generate PDF:
```bash
DYLD_LIBRARY_PATH=/opt/homebrew/lib python3 /Users/peleg/.claude/skills/project-proposal/scripts/generate-pdf.py /tmp/proposal-data.json /tmp/proposal-{{client_name}}-{{date}}.pdf
```

4. Tell the user where the PDF is saved
5. Open it for review:
```bash
open /tmp/proposal-*.pdf
```

## Pricing Overrides

The user can customize pricing at any point:
- "use 350/hr rate" - changes hourly rate
- "add 10% discount" - applies discount to subtotal before VAT
- "add a line item for X" - adds custom component
- "remove the QA buffer" - removes 10% QA
- "change payment to 50/50" - adjusts payment split

Always recalculate all totals when any override is applied.

## Related Skills

- **hebrew-copywriting**: ALWAYS invoke for writing the intro and scope sections. Follow all its guidelines for natural Israeli Hebrew.
- **humanizer**: ALWAYS invoke after all proposal copy is written, before generating PDF. Remove AI-sounding patterns.
- **storytelling**: Optional - invoke if user wants a more narrative intro style.
