---
name: security-audit
description: "Full 360-degree security audit for web applications, covering OWASP Top 10 and beyond. Specializes in Next.js + Supabase/PostgREST stacks but applicable to any web app. Covers 14 attack surfaces: injection, secrets, authorization, rate limiting, uploads, token encryption, logging, dependencies, authentication, CORS/headers, SSRF/redirects, IDOR, webhooks, and cryptography. Use when the user asks to check for vulnerabilities, security issues, or any security-related code review."
---

# Security Audit Skill

Perform a comprehensive 360-degree security audit of a web application codebase. The audit covers 14 attack surfaces organized into 4 parallel agent groups. After identifying vulnerabilities, produce a severity-ranked report and apply fixes.

## When to Use

- User asks to check for vulnerabilities, hacking risks, or SQL injection
- User asks for a security review or security code review
- User wants to know if secrets or API keys are exposed
- User asks about authorization bypasses, IDOR, or tenant isolation
- User asks about rate limiting, file upload security, or token encryption
- User asks about CORS, SSRF, open redirects, or webhook security
- User asks about authentication, session management, or cookie security
- User asks to run npm audit or check dependencies
- User shows a security checklist and asks to verify the codebase

## Audit Workflow

The audit runs in 4 parallel agent groups (14 phases total), then consolidates findings into a ranked report.

### Phase 1: Input Validation & Injection Audit

Scan for injection vectors and missing input validation.

**Step 1 — PostgREST filter injection**: Search for `.or()`, `.filter()`, `.rpc()` calls using template literals with `${}` interpolation. These allow attackers to inject arbitrary PostgREST filter syntax.

```
Search patterns:
  \.or\(`[^`]*\$\{
  \.filter\(`[^`]*\$\{
```

**Step 2 — LIKE wildcard injection**: Search for `.ilike()` and `.like()` where user input is not escaped for `%`, `_`, `\` wildcards.

**Step 3 — Missing input validation**: Find `searchParams.get()` values used directly in DB queries without format validation (UUID regex, date regex, enum allowlists).

**Step 4 — Search sanitization**: Check search implementations for proper character stripping of PostgREST special characters: `%`, `_`, `,`, `.`, `*`, `(`, `)`.

**Step 5 — XSS via dangerouslySetInnerHTML**: Search for `dangerouslySetInnerHTML` usage. Flag any instance where the HTML source is user-controlled or comes from the database without sanitization (DOMPurify or equivalent).

**Step 6 — CSS injection**: Search for `<style>` tags that include user-provided CSS without stripping `</style>` tags.

**Step 7 — Email injection**: Check email-sending code for user inputs embedded in HTML without entity encoding.

**Step 8 — Pagination limits**: Verify that `limit` parameters have an upper bound (e.g., `Math.min(..., 100)`).

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 1).

### Phase 2: Secret & Configuration Exposure Audit

Scan for leaked secrets and sensitive information exposure.

**Step 1 — Server-to-Client secret leakage**: Find Server Components that use `select("*")` and pass the result as props to Client Components. Secrets stored in DB columns (access tokens, API keys) get serialized to the browser.

```
Search patterns:
  select\("\*"\)
  # Then trace data flow to JSX props
```

**Step 2 — Environment variable exposure**: Check `.env*` files for secrets. Verify that `NEXT_PUBLIC_` prefixed variables do not contain actual secrets. Verify `.env.example` documents all required secrets with generation instructions.

**Step 3 — Error information leakage**: Search for `String(error)`, `error.message`, `error.code`, `error.stack` in API response bodies. Internal error details must never reach the client.

**Step 4 — Missing security secrets**: Verify that OAuth flows use signed state parameters (CSRF protection). Check for `OAUTH_STATE_SECRET` or equivalent.

**Step 5 — Debug/test endpoints**: Find test or debug API routes. Verify they require authentication even in development mode and are disabled in production.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 2).

### Phase 3: Authorization & Access Control Audit

Scan for access control gaps and tenant isolation failures.

**Step 1 — RLS policy completeness**: Review Supabase migration files for tables with Row Level Security enabled. Verify that policies cover ALL four operations: SELECT, INSERT, UPDATE, DELETE. Missing DELETE policies are a common oversight.

**Step 2 — Admin client tenant guards**: Find all uses of `createAdminClient()` (service role key, bypasses RLS). Verify every `.delete()`, `.update()`, and `.insert()` call includes `.eq("tenant_id", tenantId)` as defense-in-depth.

**Step 3 — Stale JWT verification**: Check middleware for how tenant access is verified. If the middleware trusts `user.user_metadata.tenant_id` from the JWT without re-checking the `tenant_users` table, flag it — removed users retain access until JWT expires.

**Step 4 — Admin route protection**: Verify middleware guards both page routes (`/admin/*`) AND API routes (`/api/admin/*`).

**Step 5 — Content Security Policy**: Check middleware or headers config for CSP. Flag `'unsafe-eval'` in `script-src`. Note if `'unsafe-inline'` is present (acceptable if required by the framework, but document it).

**Step 6 — Resource cleanup on deletion**: Check entity deletion flows (merge, bulk delete) to verify related records are migrated or cleaned up before the parent is deleted.

**Step 7 — Public route bypass**: Review the middleware's public route allowlist. Verify that no authenticated endpoints are accidentally listed as public.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 3).

### Phase 4: Rate Limiting Audit

Scan for endpoints missing rate limiting, especially those that are expensive, public, or abuse-prone.

**Step 1 — Identify rate limit utility**: Look for an existing rate-limiting module (e.g., `lib/api/rate-limit.ts` or a middleware-based rate limiter). Understand the API: function name, parameters (requests per window, window size), and how it identifies clients (IP, user ID).

**Step 2 — Find all API routes**: Glob for all `route.ts` files under `app/api/`.

**Step 3 — Check high-risk endpoints**: For each of the following endpoint categories, verify that rate limiting is applied:

| Category | Example Endpoints | Recommended Limit |
|----------|------------------|-------------------|
| Authentication | login, signup, password reset | 5-10/min |
| Email sending | send email, broadcast trigger | 10/min |
| File upload | upload, import CSV/Excel | 5-20/min |
| Bulk operations | bulk delete, bulk update | 10/min |
| Contact creation | single + batch create | 30/min |
| User invitations | invite team members | 10/min |
| Public endpoints | booking pages, public forms | 30/min |
| Webhook receivers | WhatsApp, Facebook webhooks | 60/min |

**Step 4 — Flag unprotected endpoints**: Any endpoint that modifies data, sends external requests, or processes uploads without rate limiting is a finding.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 4).

### Phase 5: File Upload Security Audit

Scan for file upload endpoints with insufficient validation.

**Step 1 — Find upload endpoints**: Search for `formData`, `file.arrayBuffer()`, `file.type`, multipart handling in API routes.

```
Search patterns:
  formData
  file\.arrayBuffer
  file\.type
  multer|busboy|formidable
```

**Step 2 — SVG XSS**: Check if SVG files are accepted as uploads. SVGs can contain embedded JavaScript via `<script>` tags or event handlers (`onload`, `onerror`). If SVGs are stored in a public bucket (e.g., Supabase Storage), they execute when a user navigates to the URL.

**Step 3 — Dangerous extension blocking**: Verify upload endpoints block executable/dangerous file extensions: `.html`, `.htm`, `.svg`, `.php`, `.py`, `.rb`, `.jsp`, `.asp`, `.aspx`, `.cgi`, `.exe`, `.bat`, `.sh`.

**Step 4 — MIME type validation**: Verify uploads validate both the `Content-Type` header AND the file extension. MIME types alone can be spoofed.

**Step 5 — File size limits**: Verify all upload endpoints enforce maximum file sizes.

**Step 6 — Storage bucket permissions**: If using Supabase Storage, check that public buckets do not contain user-uploaded content that could be executable (SVG, HTML). Private buckets should use signed URLs with expiration.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 5).

### Phase 6: Token & Secret Storage Audit

Scan for OAuth tokens and API keys stored in plaintext in the database.

**Step 1 — Find token storage**: Search for DB tables/columns that store OAuth access tokens, refresh tokens, or API keys. Common table names: `*_configs`, `*_tokens`, `oauth_*`, `integrations`.

```
Search patterns:
  access_token|refresh_token|api_key|client_secret
  # In migration files and API routes
```

**Step 2 — Check encryption at rest**: Verify that all tokens written to the DB are encrypted before storage and decrypted on read. Look for an encryption utility (e.g., `lib/crypto/tokens.ts`) using AES-256-GCM or equivalent.

**Step 3 — Verify all write paths encrypt**: Trace every code path that saves tokens to the database. Each one must call the encryption function before the Supabase `.insert()` or `.update()`.

**Step 4 — Verify all read paths decrypt**: Trace every code path that reads tokens from the database. Each one must call the decryption function after the Supabase `.select()`.

**Step 5 — Token refresh paths**: Check OAuth token refresh logic — after refreshing, the new token must also be encrypted before being saved back to the DB.

**Step 6 — Encryption key management**: Verify the encryption key is stored in environment variables (e.g., `TOKEN_ENCRYPTION_KEY`), documented in `.env.example` with generation instructions, and NOT hardcoded in source code.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 6).

### Phase 7: Production Logging & PII Audit

Scan for sensitive data exposure through logs and debug output.

**Step 1 — Debug logging in production**: Search for `console.log`, `console.debug`, `console.info` in API routes. Flag any that log request bodies, tokens, passwords, or user data without a `NODE_ENV !== "production"` guard.

```
Search patterns:
  console\.log|console\.debug|console\.info
  # In app/api/ routes
```

**Step 2 — PII in logs**: Check logged data for personally identifiable information: email addresses, phone numbers, names, IP addresses, user agents. These should never be logged in production.

**Step 3 — Token/secret logging**: Search for log statements that include access tokens, API keys, or encryption keys — even partial ones (e.g., `token_length`, `token.substring(0,10)`).

**Step 4 — Error response details**: Verify API catch blocks return generic error messages to clients, not the raw error object. Log the full error server-side only.

**Step 5 — Request body logging**: Check if any middleware or API routes log the full request body. This can leak passwords, tokens, and sensitive form data.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 7).

### Phase 8: Dependency Vulnerability Audit

Scan for known vulnerabilities in npm dependencies.

**Step 1 — Run npm audit**: Execute `npm audit` and review results. Any HIGH or CRITICAL finding is a security issue.

**Step 2 — Check for known-vulnerable packages**: Look for these commonly vulnerable packages in `package.json`:

| Package | Issue | Replacement |
|---------|-------|-------------|
| `xlsx` / `sheetjs` | Prototype pollution, no active security patches | `exceljs` |
| `node-fetch` < 3.x | Various CVEs | Built-in `fetch` or `undici` |
| `jsonwebtoken` < 9.x | Algorithm confusion attacks | `jose` |
| `lodash` < 4.17.21 | Prototype pollution | Native methods or `lodash-es` |
| `marked` < 4.x | XSS via markdown | `marked` 4+ with DOMPurify |
| `moment` | Unmaintained, ReDoS | `date-fns` or `dayjs` |

**Step 3 — Lock file integrity**: Verify `package-lock.json` exists and is committed to git. Warn if `npm install --legacy-peer-deps` or `--force` is documented, as these skip security checks.

**Step 4 — License compliance (optional)**: Flag dependencies with GPL or other restrictive licenses if the project is commercial.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 8).

### Phase 9: Authentication & Session Security Audit

Scan for authentication weaknesses and session management flaws.

**Step 1 — Session/JWT configuration**: Check JWT expiration time. Tokens valid for longer than 1 hour without refresh are risky. Verify refresh token rotation is implemented (old refresh tokens invalidated after use).

**Step 2 — Account enumeration**: Check login and password reset endpoints. If the response differs between "user not found" and "wrong password", attackers can enumerate valid accounts. Responses should be identical for both cases.

**Step 3 — Password reset flow**: If the app has password reset, verify: (a) reset tokens expire (< 1 hour), (b) tokens are single-use, (c) the link uses HTTPS, (d) the token has sufficient entropy (>= 32 bytes).

**Step 4 — OAuth callback validation**: Check all OAuth callback routes for: (a) state parameter verification (CSRF), (b) authorization code exchange happens server-side (not client), (c) redirect URI is validated against an allowlist.

**Step 5 — Session fixation**: Verify that a new session is created after authentication (not reusing a pre-auth session ID).

**Step 6 — Cookie security flags**: Check all `Set-Cookie` headers or cookie-setting code for:
- `HttpOnly` flag (prevents JS access — critical for session cookies)
- `Secure` flag (HTTPS only)
- `SameSite=Lax` or `Strict` (CSRF protection)
- Reasonable `Max-Age` or `Expires`

```
Search patterns:
  Set-Cookie|setCookie|cookie\(|cookies\.set
  httpOnly|HttpOnly|secure|SameSite
```

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 9).

### Phase 10: CORS & HTTP Security Headers Audit

Scan for Cross-Origin Resource Sharing misconfigurations and missing security headers.

**Step 1 — CORS origin validation**: Search for `Access-Control-Allow-Origin` headers. Flag:
- Wildcard `*` with credentials (`Access-Control-Allow-Credentials: true`) — this is ALWAYS a vulnerability
- Origin reflected from request without validation (dynamic CORS that trusts any origin)
- Overly broad regex patterns for origin matching (e.g., `*.example.com` matching `evil-example.com`)

```
Search patterns:
  Access-Control|cors|allowedOrigins|origin
  # In middleware, API routes, and next.config
```

**Step 2 — Preflight configuration**: Check that OPTIONS handlers don't expose sensitive methods. Verify `Access-Control-Allow-Methods` is restricted to needed methods.

**Step 3 — Security headers completeness**: Verify ALL of the following headers are set (typically in middleware):

| Header | Required Value | Purpose |
|--------|---------------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Prevents clickjacking |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forces HTTPS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | Restrict camera, mic, geolocation | Limits browser APIs |
| `Content-Security-Policy` | See Phase 3 Step 5 | Prevents XSS |

**Step 4 — X-Powered-By suppression**: Verify the framework doesn't expose `X-Powered-By: Next.js` or similar headers that reveal technology stack.

**Step 5 — Cache-Control on sensitive responses**: Verify API responses containing user data include `Cache-Control: no-store` or `private` to prevent proxy/CDN caching of sensitive data.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 10).

### Phase 11: SSRF & Open Redirect Audit

Scan for Server-Side Request Forgery and unvalidated redirect vulnerabilities.

**Step 1 — Server-side URL fetching**: Search for `fetch()`, `axios`, `http.get`, `https.get` in API routes where the URL comes from user input (query params, request body, DB values).

```
Search patterns:
  fetch\(|axios\.|http\.get|https\.get|got\(|request\(
  # In app/api/ routes — check if URL is user-controlled
```

**Step 2 — SSRF to internal services**: If the app fetches URLs server-side (e.g., webhook URL validation, image proxy, link preview), check if an attacker can provide internal URLs like `http://localhost:3000/api/admin/`, `http://169.254.169.254/` (cloud metadata), or `http://[::1]/`.

**Step 3 — Open redirect**: Search for redirect logic where the destination URL comes from user input (e.g., `?redirect=/dashboard`, `?next=`). Verify:
- The redirect URL is validated against an allowlist of domains
- Relative paths are preferred over absolute URLs
- Protocol-relative URLs (`//evil.com`) are blocked

```
Search patterns:
  redirect|returnTo|next=|callback=|return_url
  NextResponse\.redirect|router\.push|window\.location
```

**Step 4 — URL validation bypass**: If URL validation exists, check for common bypasses: `http://evil.com@trusted.com`, `http://trusted.com.evil.com`, `http://127.0.0.1` in decimal/hex formats.

**Step 5 — Webhook URL validation**: If the app allows users to configure webhook URLs, verify the URL is validated (HTTPS only, no internal IPs, domain allowlist if possible).

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 11).

### Phase 12: IDOR & Mass Assignment Audit

Scan for Insecure Direct Object Reference (OWASP #1) and mass assignment vulnerabilities.

**Step 1 — IDOR on resource access**: Check API routes that take a resource ID (contact, conversation, user, file) and verify the route confirms the authenticated user has permission to access that specific resource — not just that they're authenticated.

```
Search patterns:
  params\.id|params\.contactId|params\.userId
  searchParams\.get\("id"\)
  # Then verify ownership/permission check exists
```

**Step 2 — Horizontal privilege escalation**: Check if user A can access user B's resources by changing an ID in the URL. For multi-tenant apps, verify every data-fetching route includes tenant_id in the query, not just authentication.

**Step 3 — Vertical privilege escalation**: Check if regular users can access admin-only API endpoints by directly calling the URL. Verify role checks exist on admin operations.

**Step 4 — Mass assignment / over-posting**: Check API routes that accept JSON bodies and spread them into DB operations. If a user sends extra fields (e.g., `is_admin: true`, `role: "admin"`, `tenant_id: "other-tenant"`), can they modify fields they shouldn't?

```typescript
// VULNERABLE — spreads entire body into update
const body = await request.json();
await supabase.from("users").update(body).eq("id", userId);
```

**Step 5 — Enumeration via sequential IDs**: If the app uses sequential integer IDs (auto-increment), attackers can enumerate all resources. Prefer UUIDs for externally-visible identifiers.

**Step 6 — File access IDOR**: If the app serves user-uploaded files, verify that file access checks ownership. A signed URL with expiration is preferred over a predictable path.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 12).

### Phase 13: Webhook & Callback Security Audit

Scan for webhook receiver vulnerabilities and insecure callback handling.

**Step 1 — Webhook signature verification**: For each incoming webhook endpoint (WhatsApp, Stripe, Facebook, GitHub, etc.), verify the request signature is validated using the provider's signing secret. Unsigned webhooks can be forged.

```
Search patterns:
  webhook|callback
  # In app/api/ — check for signature/HMAC verification
  crypto\.createHmac|verify.*signature|X-Hub-Signature
```

**Step 2 — Replay attack prevention**: Check if webhook handlers validate timestamp freshness (e.g., reject payloads older than 5 minutes). Without this, captured webhook payloads can be replayed.

**Step 3 — Webhook verify token exposure**: Check if webhook verification tokens are hardcoded in source code rather than environment variables.

**Step 4 — Idempotency**: Check if webhook handlers are idempotent (safe to process the same event twice). Duplicate webhook deliveries are common. Flag handlers that create records without checking for duplicates.

**Step 5 — Callback URL validation**: For OAuth and external service callbacks, verify the callback URL is validated against a configured allowlist, not taken from user input or the referer header.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 13).

### Phase 14: Cryptography & Randomness Audit

Scan for weak cryptographic practices and insecure random number generation.

**Step 1 — Weak hashing for passwords**: Search for `MD5`, `SHA1`, `SHA256` used for password hashing. These are fast hashes unsuitable for passwords. Only `bcrypt`, `scrypt`, `argon2`, or `PBKDF2` with sufficient iterations are acceptable.

```
Search patterns:
  createHash|md5|sha1|sha256
  # In auth-related code — check if used for passwords
  bcrypt|scrypt|argon2|pbkdf2
```

**Step 2 — Insecure random number generation**: Search for `Math.random()` used for security-sensitive purposes: tokens, session IDs, CSRF tokens, encryption IVs, or nonces. `Math.random()` is NOT cryptographically secure.

```
Search patterns:
  Math\.random
  # Check context — is it used for tokens, IDs, or secrets?
  crypto\.randomBytes|crypto\.randomUUID|crypto\.getRandomValues
```

**Step 3 — Hardcoded secrets in source code**: Search for strings that look like API keys, tokens, or passwords hardcoded in source files (not env vars).

```
Search patterns:
  (password|secret|apikey|api_key|token).*=.*['"][A-Za-z0-9+/=]{20,}
  # Exclude .env files and test fixtures
```

**Step 4 — Weak JWT configuration**: If the app signs its own JWTs, verify: (a) algorithm is `RS256` or `ES256` (not `HS256` with a weak secret, never `none`), (b) expiration is set, (c) audience and issuer are validated.

**Step 5 — TLS/HTTPS enforcement**: Verify all external API calls use HTTPS, not HTTP. Check for `http://` in fetch calls, redirect URIs, and webhook configurations.

```
Search patterns:
  http://
  # Excluding localhost and 127.0.0.1 for development
```

**Step 6 — Timing attacks on string comparison**: Check if secret comparison (HMAC signatures, tokens, passwords) uses constant-time comparison (`crypto.timingSafeEqual`) instead of `===` or `==`.

For detailed patterns, consult `references/vulnerability-patterns.md` (Category 14).

## Running the Audit

For optimal speed, run all 14 phases using 4 parallel agents via the Task tool:

1. **Agent 1 — Injection & Input**: Input Validation (Phase 1) + File Upload Security (Phase 5) + SSRF & Redirects (Phase 11)
2. **Agent 2 — Secrets & Data**: Secret Exposure (Phase 2) + Token Storage (Phase 6) + Logging/PII (Phase 7) + Cryptography (Phase 14)
3. **Agent 3 — Access Control**: Authorization (Phase 3) + Rate Limiting (Phase 4) + IDOR & Mass Assignment (Phase 12) + Webhooks (Phase 13)
4. **Agent 4 — Infrastructure**: Dependencies (Phase 8) + Authentication & Sessions (Phase 9) + CORS & Headers (Phase 10)

Each agent should search the entire codebase using Grep and Read tools, documenting every finding with:
- File path and line number
- Severity (CRITICAL / HIGH / MEDIUM / LOW)
- Vulnerable code snippet
- Explanation of the attack vector

## Report Format

After all agents complete, consolidate findings into a single report:

```
## Security Audit Report

### Summary
- Total findings: N
- Critical: N | High: N | Medium: N | Low: N

### Findings

#### [CRITICAL] #1 — Title
- **File**: path/to/file.ts:42
- **Category**: Input Validation / Secret Exposure / Authorization / Rate Limiting / Upload / Token / Logging / Dependency / AuthN / CORS / SSRF / IDOR / Webhook / Crypto
- **Description**: What's wrong and how it can be exploited
- **Code**: Vulnerable snippet
- **Fix**: Remediation approach

#### [HIGH] #2 — Title
...
```

Order findings by severity (CRITICAL first, then HIGH, MEDIUM, LOW), then by category.

## Applying Fixes

After presenting the report and receiving user approval to fix:

1. Fix all CRITICAL findings first, then HIGH, MEDIUM, LOW
2. For each fix, consult `references/fix-patterns.md` for proven remediation code
3. Use parallel agents for bulk fixes (e.g., rate limiting across many endpoints, token encryption across integrations)
4. After all fixes, run `npx tsc --noEmit` to verify TypeScript compilation
5. Run `npm audit` to verify 0 vulnerabilities
6. If the project has tests, run them to verify no regressions
7. For SQL/RLS changes, create a migration file (user must apply via DB dashboard if no CLI access)

## Technology-Specific Notes

### Next.js
- Server Component props are JSON-serialized to the browser — never pass secrets
- API routes under `app/api/` have no automatic auth — every route needs explicit checks
- Middleware is the centralized auth and security header gateway
- `next.config.js` headers config is an alternative to middleware for security headers
- Source maps should be disabled in production (`productionBrowserSourceMaps: false`)

### Supabase / PostgREST
- `.or()` with template literals is the #1 injection vector — prefer typed `.eq()`, `.lte()`, `.gte()` methods
- `createAdminClient()` bypasses ALL RLS — always add tenant_id guards as defense-in-depth
- `select("*")` can expose sensitive columns — always use explicit column lists
- Public Storage buckets serve content directly — never allow SVG/HTML uploads there
- Supabase Auth handles JWT signing — verify token expiration settings in dashboard

### Multi-Tenant
- Every admin-client query MUST include tenant_id
- JWT claims can go stale — always verify against DB for authorization decisions
- Tenant isolation is the most critical security property — test cross-tenant access paths
- IDOR is especially dangerous — changing a UUID in the URL should never leak data across tenants

### OAuth Integrations
- All OAuth tokens (access + refresh) must be encrypted at rest using AES-256-GCM
- Token refresh flows must re-encrypt the new token before saving
- Encryption key must be in environment variables, never in source code
- Design encryption with backward compatibility for migrating plaintext → encrypted
- Verify state parameter on all OAuth callbacks (CSRF protection)
- Callback URLs must be validated against a configured allowlist

### Webhooks
- Always verify signatures using the provider's signing secret (HMAC-SHA256)
- Implement timestamp-based replay protection (reject payloads > 5 min old)
- Design idempotent handlers (safe to process the same event twice)
- Never trust webhook payload data for authorization — always re-verify

### Cryptography
- Never use MD5/SHA1/SHA256 for password hashing — use bcrypt/scrypt/argon2
- Never use `Math.random()` for security tokens — use `crypto.randomBytes()`
- Use constant-time comparison for secrets (`crypto.timingSafeEqual`)
- All external API calls should use HTTPS, never HTTP
