# Self-heal contract

Every skill wraps its main work in this contract.

## 1. Precheck
- Required MCP connected? → if no, write `degraded` status, run in reference-only mode, halt MCP-dependent phases.
- Required references present? → if no, fall back to baseline only.
- Prior checkpoint exists? → if yes, resume from last successful step.
- Required Supabase rows exist (e.g., `tax_entities`, `brands`)? → if no, write `crit` alert, halt.

## 2. Execute (per step)
- Try once.
- On transient failure (rate limit, timeout, 5xx): retry with exponential backoff (1s → 2s → 4s), max 3 retries.
- On data-shape failure: validate output against `schemas/*.schema.json`. If fail, run **one** self-correction retry with the validation error appended to the prompt.
- On hard failure: write checkpoint to `state/{skill}/checkpoint.json`, write failure record to Supabase `routine_runs`, continue with partial result if downstream steps don't depend on this one.

## 3. Postcheck
- Output validates against schema → if no, flag `needs-review` in `routine_runs.status`.
- Cost budget exceeded (per ROUTINE.md frontmatter) → halt, alert.
- All steps had data → if partial, mark report `incomplete` with `missing_data: []` list.

## Tiers of failure

| Tier | Examples | Behavior |
|---|---|---|
| Transient | rate limit, timeout, network blip | retry with backoff, max 3 |
| Degraded | one MCP down, one reference missing | continue with partial input, flag `degraded` |
| Hard | required entity missing, schema-violating output after 1 retry, budget exceeded | halt + crit alert |

Never silently swallow errors. Every failure → row in `routine_runs` + (if user-visible impact) row in `alerts`.
