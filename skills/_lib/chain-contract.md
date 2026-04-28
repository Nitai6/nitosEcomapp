# Chain contract

How skills pass data to each other in a routine.

## State location

`state/{skill_name}/{run_id}/{artifact}.json`

E.g. `state/ads-meta/2026-04-27/audit-report.json`

For long-lived single-document state (brand-profile, customer-avatar): `state/{skill_name}/latest.json` + `state/{skill_name}/history/{date}.json`.

## Frontmatter

Each skill declares:
- `inputs:` paths it reads
- `outputs:` paths + schemas it writes

The routine runner walks the chain by matching `outputs` of step N to `inputs` of step N+1.

## Output envelope

Every JSON output has this envelope:

```json
{
  "skill": "ads-meta",
  "run_id": "2026-04-27T09:00:00Z",
  "schema": "schemas/audit-report.schema.json",
  "status": "ok | degraded | failed",
  "missing_data": [],
  "data": { ... }
}
```

Downstream skills read `.data`. Routine runner reads `.status` for branching.

## Dashboard contract (REQUIRED for every agent)

Owner mandate: "everything to connect to our IU dashboard so I or the user will know anything about what the agents are doing."

Every agent MUST, on every run, write the following to `state/{skill_name}/`:

### 1. `latest.json` — full detailed output of last run
The complete artifact (audit report, post batch, decision log, etc.). Schema-validated per skill.

### 2. `latest-status.json` — dashboard summary
Strict shape consumed by `dashboard-bridge`:

```json
{
  "status": "ok | degraded | failed | stale",
  "headline": "Spend ₪842 · ROAS 2.74 · 3 scaled / 2 killed / 4 regen",
  "kpis": { "spend": 842, "revenue": 2310, "roas": 2.74 },
  "next_run": "2026-04-28T09:00:00Z",
  "alerts": [
    { "severity": "warn", "message": "1 scale awaiting approval", "deeplink": "/dashboard/meta-ads/pending" }
  ]
}
```

- `headline` — single-line human summary (≤120 chars)
- `kpis` — flat key/value, numeric only (pushed to Supabase `agent_kpi_history`)
- `alerts[].severity` ∈ `crit | warn | info`
- `next_run` — ISO8601, used by bridge for staleness detection

### 3. Supabase `agent_decisions` rows
For every action with reasoning (scaled, killed, regenerated, posted, scheduled, etc.) insert:

```sql
insert into agent_decisions (agent, ts, action, subject, delta, reasoning, run_id)
values (...);
```

Powers the adaptive-learning UI ("why did meta-ads kill ad X?") and feedback loops.

### Enforcement

`dashboard-bridge` checks per tick:
- If `latest-status.json` missing for 2 consecutive expected runs → `crit` alert
- If `last_run` ts stale > 1.5× cron interval → `status: stale` + alert

Skills that fail to comply break the IU dashboard. No exceptions.

## When a skill needs runtime context

`context.json` written by the routine runner, available to every step:

```json
{
  "brand_id": "uuid",
  "brand_slug": "skincare-co",
  "active_niche": "skincare",
  "date_range": { "from": "2026-04-20", "to": "2026-04-27" },
  "auto_pay": false,
  "tier_caps": { "max_usd": 15, "max_minutes": 360 }
}
```
