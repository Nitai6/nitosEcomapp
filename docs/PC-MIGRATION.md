# PC Migration Guide

Moving paidads + IU dashboard to a new laptop. Estimated time: **30–45 min** total.

---

## What needs to move

```
1. The repo                    →  C:\Users\Admin\projects\paidads\          (everything: skills, routines, app, mcp-servers, docs, state)
2. Secrets                     →  state/secrets/.env + state/secrets/.leumi-tokens.json
3. Claude Code itself          →  reinstall on new PC + log in
4. Node.js                     →  reinstall on new PC (v20+)
5. Supabase data               →  already in cloud — nothing to migrate
6. The IU dashboard            →  next.js app inside the repo, runs locally with `npm run dev`
```

Everything else (skills, routines, .mcp.json, the 2 custom MCP wrappers) is just files in the repo. Move the repo, you've moved the system.

---

## Step-by-step

### 1. On OLD laptop — package everything (10 min)

Open PowerShell in `C:\Users\Admin\projects\paidads\`:

```powershell
# A. Make sure secrets are in the right place (gitignored, won't be in any GitHub copy)
ls state\secrets\.env
ls state\secrets\.leumi-tokens.json    # may not exist yet — that's fine

# B. Push the public part of the repo to GitHub (skills, routines, app code)
git add -A
git status                              # verify state/secrets/ is NOT listed (gitignored)
git commit -m "v3 final pre-migration snapshot"
git push origin main

# C. Manually copy the secrets folder to a USB stick or password-manager attachment
#    (NEVER commit state/secrets/ to git)
explorer state\secrets\
# Drag .env + .leumi-tokens.json (if exists) to USB / Bitwarden / 1Password / iCloud
```

⚠️ **Do not email yourself the .env file.** Put it on a USB stick or in a password manager attachment. It contains all 22 service tokens.

### 2. On NEW laptop — install prerequisites (15 min)

```powershell
# A. Install Node.js 20+ from https://nodejs.org (LTS)
node --version    # confirm v20+

# B. Install Git from https://git-scm.com
git --version

# C. Install Claude Code
# Either download desktop app from https://claude.ai/download
# Or via npm if you use the CLI flavor

# D. Sign into Claude Code with the same account as the old laptop
```

### 3. Clone the repo (5 min)

```powershell
mkdir C:\Users\Admin\projects
cd C:\Users\Admin\projects
git clone {your-github-repo-url} paidads
cd paidads

# Install Node deps for the IU dashboard
npm install

# Install deps for the 2 custom MCP wrappers
cd mcp-servers\submagic && npm install && cd ..\..
cd mcp-servers\leumi-open-banking && npm install && cd ..\..
```

### 4. Restore secrets (2 min)

```powershell
# A. Make sure the secrets folder exists
mkdir state\secrets -ErrorAction SilentlyContinue

# B. Copy from USB / password manager into state/secrets/
#    Files needed:
#      state\secrets\.env
#      state\secrets\.leumi-tokens.json   (if Leumi was authorized — optional)

# C. Verify
type state\secrets\.env | Select-String "SUPABASE_PROJECT_URL"   # should show your URL
```

### 5. Open Claude Code in the repo (3 min)

```powershell
# Launch Claude Code
# File > Open Folder > C:\Users\Admin\projects\paidads
# Claude Code auto-loads .mcp.json from the project root

# In Claude Code's chat, run:
/mcp list
```

You should see all 22 MCP servers. If any show "failed", the env var path is off — check `state/secrets/.env` and restart Claude Code.

### 6. Boot the IU dashboard (3 min)

```powershell
cd C:\Users\Admin\projects\paidads
npm run dev
# → http://localhost:3000

# The dashboard reads state/dashboard/{feed,timeline,alerts,health}.json
# Plus Supabase tables agent_kpi_history + agent_decisions
```

### 7. Re-register cron routines (5 min)

The cron registry is **per-machine** — Claude Code's scheduled-tasks MCP runs locally. You need to re-register on the new laptop.

In Claude Code chat on the new laptop, just say:

> Register all 16 cron routines listed in skills/MANIFEST.md via mcp__scheduled-tasks__create_scheduled_task. Use the cron schedules and prompts from each routines/{name}/ROUTINE.md file. Timezone Asia/Jerusalem for all.

I (or any Claude session) will register them. Verify with `/mcp` and check Task Scheduler in Windows.

---

## Verification checklist (after migration)

- [ ] `node --version` ≥ v20
- [ ] `git status` clean (no uncommitted changes from migration)
- [ ] `state/secrets/.env` exists with all 22 keys
- [ ] `claude mcp list` shows 22 servers connected
- [ ] `npm run dev` boots IU at `localhost:3000`
- [ ] IU shows agent tiles (might be empty until first cron tick)
- [ ] All 16 routines registered (check Windows Task Scheduler or `mcp__scheduled-tasks__list_scheduled_tasks`)
- [ ] Wait 5 min → first dashboard-bridge tick fires → IU populates with live data

---

## What does NOT need to move (it's all cloud)

- Supabase data (state, KPI history, decisions) — same DB serves both laptops
- All 22 service accounts (Shopify, Meta, Mailjet, etc.) — same accounts, same tokens
- GitHub repo (the source of truth)
- Hostinger (domain DNS)

---

## Troubleshooting

**`claude mcp list` shows server "failed"** → check env var name matches exactly in `state/secrets/.env` (no trailing whitespace, no quotes). Restart Claude Code.

**Bank Leumi MCP says "no tokens cached"** → re-run `leumi_oauth_url` + `leumi_exchange_code` once on new laptop. The token cache is per-machine.

**IU dashboard at localhost:3000 is blank** → check `state/dashboard/feed.json` exists. Either run `dashboard-bridge` once manually, or wait 5 min for the cron to fire.

**`npm run dev` fails** → delete `node_modules` and `package-lock.json`, run `npm install` again. Node 20+ required.

**OAuth refresh tokens expired** → some MCPs (especially Meta/Pipeboard) need 60-day refresh. Re-run their auth command.

---

## What to do TONIGHT before bed (recommended)

1. `git push origin main` — final snapshot
2. Copy `state/secrets/.env` to USB stick + verify it's readable
3. Note your Supabase project URL + service role key separately (in case the .env file gets corrupted)
4. Note your Bank Leumi OAuth client ID + secret separately

That way even if the USB fails you can reconstruct the .env from the password manager.
