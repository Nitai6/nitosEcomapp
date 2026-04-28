# Submagic MCP Wrapper

Thin MCP server around the Submagic REST API. Exposes 6 tools used by `meta-ads`, `social-youtube` (Path 1 Shorts extraction), `social-tiktok`, and `social-instagram` (UGC reels).

## Setup

1. `cd mcp-servers/submagic && npm install`
2. Make sure `SUBMAGIC_API_KEY` is set in `state/secrets/.env`
3. Test directly: `SUBMAGIC_API_KEY=$(grep SUBMAGIC_API_KEY ../../state/secrets/.env | cut -d= -f2) node index.js`
4. The wrapper is referenced from project-level `.mcp.json` automatically — no separate registration needed.

## Tools

| Tool | Used by |
|---|---|
| `submagic_create_project` | meta-ads (creative regen captions), social-instagram, social-tiktok |
| `submagic_get_project` | all callers (poll) |
| `submagic_extract_shorts` | social-youtube Path 1 (most common path) |
| `submagic_apply_template` | meta-ads (brand template), social-* |
| `submagic_download_render` | all callers (final fetch) |

## Notes

- Endpoints assume `https://api.submagic.co/v1` — override via `SUBMAGIC_BASE_URL` env if Submagic publishes a different prefix.
- Submagic does not currently publish a formal OpenAPI spec. If 404s show up after launch, inspect Submagic dashboard's network tab for current paths.
- All errors bubble up as `isError: true` MCP responses so calling skills self-heal per `_lib/self-heal.md`.
