---
name: meta-ads
schedule: "0 9 * * * Asia/Jerusalem"
trigger_skill: meta-ads
budgets: { max_minutes: 180, max_usd: 12, max_tokens: 4_000_000 }
state_dir: state/meta-ads/
notify: { on_complete: telegram, on_fail: telegram+email }
---

# Routine: meta-ads (autonomous mega-agent)

Daily 09:00 IL. Loads `skills/meta-ads/SKILL.md` and runs the 10-step adaptive loop:
insights → metrics → classify → decide → CBO/ABO campaign decisions → autonomous creative regen (Higgsfield image+video → Submagic captions → ElevenLabs VO → Claude self-quality-score ≥7 → Meta upload) → auto-action gate (agent decides per context, no fixed cap) → adaptive learning (Supabase `meta_ads_decisions`) → persist → Telegram digest.

## Dashboard contract
`state/meta-ads/latest.json` + `latest-status.json` + `agent_decisions` rows per scale/kill/regen action with reasoning.

## Failure policy
- Pipeboard/Meta-API auth lapsed → halt creative push, continue read-only metrics, alert warn
- Higgsfield rate-limit → exp backoff × 5
