---
name: cyber
description: This skill should be used when the user asks to "run a security audit", "harden the codebase", "check for vulnerabilities", "review security gaps", or mentions "MITRE ATT&CK", "security checklist", or "DevTools verification". Performs a multi-phase cybersecurity audit on the multi-tenant Israeli SaaS codebase covering checklist scanning, MITRE assessment, fix implementation, and browser verification.
version: 1.0.0
---

# Cybersecurity Audit & Fix

Audit the codebase against a comprehensive 68-section security checklist + MITRE ATT&CK techniques, report gaps by priority, implement fixes, and verify with DevTools.

## Re-running the Audit

On subsequent invocations, read the checklist first to identify current state. Focus on:
- Items still marked [ ] in the Priority Matrix
- New code since last audit (check git log for changes to key files)
- Previously deferred items (P2/P3) that may now be relevant

Skip Phase 2 MITRE checks for techniques already marked SECURE unless affected files changed.

## Workflow

### Phase 1: Checklist Audit

1. Read the checklist reference file at `references/checklist.md` (relative to this skill's directory). This is the master checklist with 68 sections covering all security domains.

2. Parse the checklist to identify all `[ ]` (unchecked) items. Group them by the Priority Matrix at the bottom of the checklist (P0 Critical, P1 High, P2 Medium, P3 Long-term).

3. For items that are code-verifiable, run `scripts/scan-codebase.sh` and scan the codebase to confirm whether they are actually implemented or truly missing. Key areas to check:

   **Auth & Access Control (Section 2)**
   - Grep for `auth()` / `verifiedAuth()` usage in API routes
   - Check rate limiting on auth endpoints (`src/lib/rate-limit.ts`)
   - Verify session invalidation on password change (`passwordChangedAt`)
   - Check for MFA/2FA implementation

   **API Security (Section 3)**
   - Verify all routes have auth checks
   - Check Zod validation on request bodies (`src/lib/validations/`)
   - Verify rate limiting on sensitive endpoints
   - Check CORS configuration

   **Socket.io Security (Section 24, 62)**
   - Check `server.ts` for JWT auth, room authorization, rate limiting
   - Verify connection limits, payload size limits
   - Check banned user disconnection

   **Payment Security (Section 28)**
   - Verify webhook signature verification is required (not optional)
   - Check idempotency (duplicate transaction detection)
   - Check webhook timestamp/replay protection (`verifyWebhookTimestamp`)
   - Verify receipt/invoice sending
   - Check refund authorization controls

   **Client-Side (Section 11)**
   - Check CSP in `next.config.ts` (no `unsafe-eval`, no `http:` in img-src)
   - Verify security headers (HSTS, X-Content-Type-Options, etc.)
   - Check for postMessage with wildcard `"*"` origins

   **Tenant Isolation (Section 6)**
   - Verify `groupId` in WHERE clauses on group-scoped queries
   - Check file upload scoping

   **Logging (Section 15)**
   - Check for audit logging (`src/lib/audit-log.ts`)
   - Verify admin actions are logged

   **Scalability & Resilience (Sections 5, 23, 46)**
   - Verify `statement_timeout` in pg.Pool config (`src/lib/prisma.ts`)
   - Check cron jobs have `take:` pagination + timeout guards (`src/app/api/cron/*/route.ts`)
   - Verify `cachedQuery` usage on expensive endpoints (leaderboard, analytics)
   - Check `invalidateCacheByPrefix` called when cached data changes (`src/lib/points.ts`)

   **Race Conditions & Idempotency (Section 19)**
   - Verify refund approval uses atomic `updateMany` with status condition (not separate check+update)
   - Verify duplicate refund request prevention (`findFirst` before create)
   - Verify points use `{ increment: N }` atomic update (not read-then-write)
   - Check points velocity rate limiting (20/hour, 50/day) in `src/lib/points.ts`

   **Input Validation Completeness (Section 1)**
   - Verify `levelNames` validated in group PATCH (max 9 items, max 50 chars each)
   - Verify WhatsApp send validates jid (max 100) and message (max 4096)
   - Verify announcement recipientIds capped (max 10,000) and content capped (max 10,000 chars)

   **Super Admin Security (Section 66)**
   - Check `isSuperAdmin()` accepts optional IP parameter in `src/lib/super-admin.ts`
   - Verify callers pass `getClientIp(req)` to `isSuperAdmin()`

   **Socket.io Monitoring (Section 24)**
   - Verify health endpoint returns connection stats (onlineUsers, activeGroups, totalSockets) in `server.ts`
   - Verify periodic stats logging interval in `server.ts`

### Phase 2: MITRE ATT&CK Assessment

Run these checks against the MITRE ATT&CK techniques relevant to our stack (GitHub + Vercel + Cloudflare). For each technique, report status and specific findings.

**T1190 - Exploit Public-Facing Application**
Scan for exploitable application-layer vulnerabilities:
- API routes without `auth()` calls: `grep -rL "auth()" src/app/api/ --include="route.ts"`
- SSRF vectors - fetch/axios calls using user-controlled URLs (especially webhook URL endpoints)
- Webhook URL validation - must block private IPs (localhost, 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x, ::1). Check `src/lib/validations/webhook.ts` for IP blocklist
- Unvalidated input - API routes missing Zod `.safeParse()` or `.parse()`
- Open redirects - redirects using `req.url` without validation
- Unauthenticated endpoints leaking data (e.g. `/api/stats`, `/api/presence`)

**T1078 - Valid Accounts (Account Takeover)**
Verify credential theft protections:
- Login rate limiting exists: grep for `checkRateLimit` / `isRateLimited` in auth routes
- Turnstile/CAPTCHA on login: check for Turnstile verification in `src/lib/auth.ts`
- Session invalidation after password change: `verifiedAuth()` checks `tokenIssuedAt` vs `passwordChangedAt`
- JWT session max age configured: check `maxAge` in `src/lib/auth.config.ts`
- MFA/TOTP support: check for TOTP verification in auth flow
- OAuth account linking: check `allowDangerousEmailAccountLinking` is `false`

**T1133 - External Remote Services (Exposed Panels)**
Check for exposed admin/debug surfaces:
- No unauthenticated admin endpoints
- Cron endpoints protected by `CRON_SECRET` bearer token
- No exposed Prisma Studio or debug panels in production
- Preview deployment access restrictions (flag for manual Vercel check)

**T1059 - Command/Scripting Interpreter (RCE)**
Scan for code execution vectors:
- `grep -rn "eval(\|exec(\|spawn(\|child_process\|new Function(" src/` - must return zero results
- No user-controlled template execution
- No dynamic `require()` with user input

**T1098 - Account Manipulation (Persistence)**
Verify privilege escalation protections:
- RBAC enforcement: OWNER role cannot be changed or removed
- Role changes restricted to allowlisted roles (OWNER excluded from assignment)
- Role changes audit-logged via `logAdminAction()`
- API keys hashed with SHA-256 before storage, timing-safe comparison
- Flag for manual platform check: GitHub collaborators, Vercel tokens, Cloudflare API tokens

**T1027 - Obfuscated Files (Malicious JS Injection)**
Check client-side script protections:
- CSP in `next.config.ts` must NOT contain `'unsafe-eval'` or `'wasm-unsafe-eval'`
- `'unsafe-inline'` in script-src is acceptable only if nonce support is not yet implemented (flag for future improvement)
- No `dangerouslySetInnerHTML` without `sanitizeHtml()` from `src/lib/sanitize.ts`
- `postMessage` calls must use specific origins, NOT wildcard `"*"`
- External links use `rel="noopener noreferrer"` on `target="_blank"`

**T1552 - Unsecured Credentials (Secret Leaks)**
Scan for exposed secrets:
- `.gitignore` includes `.env*` entries
- No hardcoded secrets in source: `grep -rn "password\|secret\|apiKey" src/ --include="*.ts" | grep "= ['\"]"`
- No server secrets in client components (only `NEXT_PUBLIC_*` vars in frontend code)
- No test credentials in committed docs or code files
- No `publicRuntimeConfig` in `next.config.ts`
- Env validation at startup: check `src/lib/env-check.ts` and `src/instrumentation.ts` exist

**T1562 - Impair Defenses**
Flag for manual platform monitoring (non-code):
- Cloudflare: audit log for WAF/firewall rule disables
- GitHub: branch protection rules active on `main`
- Vercel: deployment settings unchanged

**T1491/T1565 - Defacement & Data Manipulation**
Check for site tampering vectors:
- CSP blocks inline script injection (no `unsafe-eval`)
- Webhook URLs validated against private IP ranges
- HTML sanitization applied on all user-generated content
- Payment amounts sourced from DB, not webhook payload

**T1567 - Exfiltration Over Web Service**
Check for data exfiltration vectors:
- Webhook test endpoints could exfiltrate data to attacker URL (overlap with SSRF)
- No unbounded data export endpoints without auth

Present MITRE findings in this format:
```
## MITRE ATT&CK Assessment

| Technique | ID | Status | Key Finding |
|-----------|-----|--------|-------------|
| Exploit Public App | T1190 | SECURE / VULNERABLE | ... |
| Valid Accounts | T1078 | SECURE / VULNERABLE | ... |
| ... | ... | ... | ... |
```

### Phase 3: Fix

4. Present combined findings from Phase 1 (checklist) and Phase 2 (MITRE) as a unified prioritized report.

5. After presenting the audit report, prompt for which priority level to fix (P0/P1/P2) or specific items to address.

6. For each fix:
   - Read the relevant source files before modifying
   - Implement the minimal secure fix (no over-engineering)
   - Follow project conventions from CLAUDE.md (Hebrew UI text, RTL, named exports, fire-and-forget side effects)
   - Add rate limiting via `src/lib/rate-limit.ts` where needed
   - Add Zod validation via `src/lib/validations/` where needed
   - Use `logAdminAction()` from `src/lib/audit-log.ts` for admin operations

7. After implementing fixes, update the checklist file at `docs/plans/2026-03-02-cybersecurity-risk-checklist.md` in the project:
   - Change `[ ]` to `[x]` for fixed items
   - Add implementation notes in italics after each fixed item
   - Update the Implementation Summary table
   - Update the Priority Matrix section

8. Run `npm run build` to verify all changes compile cleanly. If a fix causes build failure or breaks existing tests, revert the change and flag the item as requiring manual review. Do not ship broken security fixes.

### Phase 4: DevTools Verification

After implementing fixes, verify security controls using browser DevTools via Playwright MCP tools.

**Step 1: Navigate to the production or dev site**
Use `browser_navigate` to open the site (https://moadon.io or http://localhost:3001).

**Step 2: Verify Security Headers**
Read and execute `scripts/verify-security-headers.js` via `browser_evaluate`.

Verify:
- `content-security-policy` does NOT contain `unsafe-eval` or `wasm-unsafe-eval`
- `strict-transport-security` contains `max-age=31536000` and `includeSubDomains`
- `x-content-type-options` is `nosniff`
- `x-frame-options` is `SAMEORIGIN`
- `referrer-policy` is `strict-origin-when-cross-origin`
- `permissions-policy` restricts camera, microphone, geolocation

**Step 3: Check for Console Errors / Warnings**
Use `browser_console_messages` with level `warning` to check for:
- CSP violation reports (blocked scripts/styles)
- Mixed content warnings (HTTP resources on HTTPS page)
- Deprecation warnings related to security

**Step 4: Check Network Requests**
Use `browser_network_requests` to verify:
- No requests to `http://` endpoints (all HTTPS)
- No requests to unexpected third-party domains
- No failed requests that indicate broken CSP

**Step 5: Test Unauthenticated API Endpoints**
Read and execute `scripts/test-unauth-endpoints.js` via `browser_evaluate`.

Verify:
- Protected endpoints return 401/403 or safe defaults (e.g., `{ onlineCount: 0 }`)
- No sensitive data leaked from unauthenticated requests

**Step 6: Test SSRF Protection**
Read and execute `scripts/test-ssrf-protection.js` via `browser_evaluate` (while logged in as admin on a group settings page). Replace `TEST_GROUP_ID` with the actual group ID before running.

Verify the response contains an error about internal URLs being blocked.

**Step 7: Verify Cookie Security**
Read and execute `scripts/check-cookie-security.js` via `browser_evaluate`.

Note: HttpOnly cookies will not appear (which is correct - auth cookies should be HttpOnly). If auth cookies DO appear in `document.cookie`, flag as a vulnerability.

**Step 8: Screenshot Evidence**
Use `browser_take_screenshot` to capture:
- Security headers in DevTools Network tab
- Console showing no CSP violations
- Any security-relevant UI (e.g., login page with CAPTCHA visible)

Present DevTools results in this format:
```
## DevTools Verification Results

| Check | Result | Notes |
|-------|--------|-------|
| CSP headers | PASS/FAIL | No unsafe-eval found |
| HSTS | PASS/FAIL | max-age=31536000 |
| Console errors | PASS/FAIL | No CSP violations |
| Network (HTTPS only) | PASS/FAIL | All requests over HTTPS |
| Unauth API protection | PASS/FAIL | Returns safe defaults |
| SSRF protection | PASS/FAIL | Internal URLs blocked |
| Cookie security | PASS/FAIL | Auth cookies HttpOnly |
```

### Phase 5: Report

9. Summarize:
   - What was fixed (with file paths)
   - MITRE ATT&CK coverage status per technique
   - DevTools verification results
   - What remains open
   - Non-code items needing manual action (legal, infrastructure, platform settings)

## Reference Material

For detailed reference during audit execution, consult:
- **`references/checklist.md`** - Master 68-section security checklist with Priority Matrix
- **`references/context.md`** - Key file paths, security patterns, and non-code items

## Navigating the Checklist

Search patterns for `references/checklist.md`:
- Specific section: grep "## {N}. " (e.g., "## 28. Payment")
- Unchecked items only: grep "\[ \]"
- Checked items: grep "\[x\]"
- Priority Matrix: grep "## Priority Matrix"
- Implementation Summary: grep "## Implementation Summary"

## Scripts

Deterministic scripts for repeatable audit tasks:
- **`scripts/scan-codebase.sh`** - Scan for auth gaps, RCE vectors, hardcoded secrets, missing validation
- **`scripts/verify-security-headers.js`** - Check security response headers via browser
- **`scripts/test-unauth-endpoints.js`** - Probe unauthenticated API endpoints
- **`scripts/test-ssrf-protection.js`** - Test SSRF blocklist enforcement
- **`scripts/check-cookie-security.js`** - Inspect cookie attributes for security flags
