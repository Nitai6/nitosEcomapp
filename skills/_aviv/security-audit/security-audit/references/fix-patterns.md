# Fix Patterns Reference

Proven remediation patterns for each vulnerability category. Each fix includes a before/after code example.

---

## Fix 1: PostgREST Filter Injection → Use Typed Methods

Replace `.or()` string interpolation with chained typed methods.

```typescript
// BEFORE (vulnerable)
query = query.or(`and(start_time.lte.${end},end_time.gte.${start})`);

// AFTER (safe)
query = query.lte("start_time", end).gte("end_time", start);
```

When `.or()` is truly needed (e.g., multi-column search), sanitize first:

```typescript
// Sanitize for PostgREST filter syntax
const sanitized = search.replace(/[%_,.*()]/g, "");
if (sanitized) {
  query = query.or(
    `name.ilike.%${sanitized}%,phone_number.ilike.%${sanitized}%,email.ilike.%${sanitized}%`
  );
}
```

---

## Fix 2: LIKE Wildcard Escaping

```typescript
function escapeLikeValue(v: string): string {
  return v.replace(/[%_\\]/g, "\\$&");
}

// Usage
query = query.ilike("name", `%${escapeLikeValue(search)}%`);
```

---

## Fix 3: Input Validation with Regex

```typescript
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

// Validate before using in queries
const userId = searchParams.get("user_id");
if (userId && !UUID_RE.test(userId)) {
  return apiError("VALIDATION_ERROR", "Invalid user_id format", 400);
}

const start = searchParams.get("start");
if (start && !ISO_DATE_RE.test(start)) {
  return apiError("VALIDATION_ERROR", "Invalid date format", 400);
}
```

---

## Fix 4: Column Allowlist Validation

```typescript
const ALLOWED_SORT_COLUMNS = ["name", "created_at", "updated_at", "email"];
const ALLOWED_FILTER_FIELDS = ["name", "email", "phone_number", "status"];

const sortBy = searchParams.get("sort_by") || "created_at";
if (!ALLOWED_SORT_COLUMNS.includes(sortBy)) {
  return apiError("VALIDATION_ERROR", "Invalid sort column", 400);
}
```

---

## Fix 5: Server-to-Client Secret Prevention

```typescript
// BEFORE (leaks access_token to browser)
const { data } = await supabase.from("whatsapp_configs").select("*");

// AFTER (explicit safe columns)
const { data } = await supabase.from("whatsapp_configs").select(`
  id,
  tenant_id,
  phone_number_id,
  business_account_id,
  display_name,
  webhook_verified,
  is_active,
  created_at,
  updated_at
`);
```

**Rule**: Never use `select("*")` in Server Components that pass data to Client Components.

---

## Fix 6: Safe Error Responses

```typescript
// BEFORE (leaks internals)
return NextResponse.json(
  { error: "Failed", details: String(error), code: error.code },
  { status: 500 }
);

// AFTER (generic message)
console.error("API route error:", error); // Log internally
return NextResponse.json(
  { error: "Internal server error" },
  { status: 500 }
);
```

---

## Fix 7: DOMPurify for User HTML

```bash
npm install dompurify @types/dompurify
```

```typescript
import DOMPurify from "dompurify";

// BEFORE
<div dangerouslySetInnerHTML={{ __html: field.html_content }} />

// AFTER
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(field.html_content) }} />
```

---

## Fix 8: Sandboxed Iframes for Email HTML

```typescript
// BEFORE (email HTML rendered in main DOM)
<div dangerouslySetInnerHTML={{ __html: emailHtml }} />

// AFTER (completely isolated in sandboxed iframe)
<iframe
  srcDoc={emailHtml}
  sandbox=""
  className="w-full h-64 border rounded"
  title="Email preview"
/>
```

The `sandbox=""` attribute (empty string) applies maximum restrictions: no scripts, no forms, no popups, no same-origin access.

---

## Fix 9: CSS Injection Prevention

```typescript
// BEFORE
<style>{customCss}</style>

// AFTER — strip closing style tags
const safeCss = (customCss || "").replace(/<\/style>/gi, "");
<style>{safeCss}</style>
```

---

## Fix 10: HTML Entity Encoding for Email

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Use on all user inputs before embedding in HTML emails
const safeHtml = `<p>From: ${escapeHtml(userName)}</p>`;
```

---

## Fix 11: tenant_id Guard on Admin Client

```typescript
// BEFORE (admin client bypasses RLS, no tenant guard)
await supabase.from("contacts").delete().eq("id", contactId);

// AFTER (defense-in-depth)
await supabase
  .from("contacts")
  .delete()
  .eq("id", contactId)
  .eq("tenant_id", tenantId);
```

**Rule**: Every `createAdminClient()` query that modifies data MUST include `.eq("tenant_id", tenantId)`.

---

## Fix 12: RLS DELETE Policies

```sql
-- Add DELETE policies to match existing SELECT/INSERT/UPDATE policies
CREATE POLICY "Tenant users can delete own contacts"
ON contacts FOR DELETE
USING (tenant_id IN (
  SELECT tenant_id FROM tenant_users
  WHERE user_id = auth.uid() AND status = 'active'
));
```

---

## Fix 13: Stale JWT Verification

```typescript
// In middleware — always verify tenant membership against DB
if (user && isTenantRoute) {
  const { data: tenantUsers } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("user_id", user.id)
    .eq("status", "active");

  const activeTenantIds = (tenantUsers || []).map((t) => t.tenant_id);

  if (!activeTenantIds.includes(urlTenantId)) {
    // Redirect — user no longer has access
  }
}
```

---

## Fix 14: Pagination Limit Capping

```typescript
// Always cap the limit parameter
const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50")), 100);
```

---

## Fix 15: CSP Hardening

```typescript
// Remove 'unsafe-eval' from Content-Security-Policy
response.headers.set(
  "Content-Security-Policy",
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; ..."
);
```

Note: `'unsafe-inline'` for scripts is still not ideal but may be required by Next.js. Prefer nonce-based CSP when possible.

---

## Fix 16: Resource Cleanup on Deletion

```typescript
// Before deleting a contact, migrate related records
await supabase
  .from("conversations")
  .update({ contact_id: targetContactId })
  .eq("contact_id", sourceContactId);

await supabase
  .from("calendar_events")
  .update({ contact_id: targetContactId })
  .eq("contact_id", sourceContactId);

// Now safe to delete
await supabase
  .from("contacts")
  .delete()
  .eq("id", sourceContactId)
  .eq("tenant_id", tenantId);
```

---

## Fix 17: Auth on Debug Endpoints

```typescript
// Even dev-only endpoints should require auth
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const tenantId = await getUserTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // ... endpoint logic
}
```

---

## Fix 18: Rate Limiting on API Endpoints

Create a reusable rate limiter utility if one doesn't exist:

```typescript
// lib/api/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, maxRequests: number, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxRequests) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}
```

Apply to each endpoint:

```typescript
// BEFORE (no rate limit)
export async function POST(request: Request) {
  // ... endpoint logic
}

// AFTER (rate limited)
import { rateLimit } from "@/lib/api/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`email-send:${ip}`, 10)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ... endpoint logic
}
```

**Recommended limits by endpoint type**:
- Email sending: 10/min
- File upload/import: 5-20/min
- Contact creation: 30/min
- Bulk operations: 10/min
- User invitations: 10/min
- Public endpoints: 30/min

---

## Fix 19: Block SVG Uploads

```typescript
// BEFORE (allows SVG — XSS risk in public buckets)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

// AFTER (SVG removed)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
```

---

## Fix 20: Block Dangerous File Extensions

```typescript
// Add a blocklist for public upload endpoints
const BLOCKED_EXTENSIONS = new Set([
  ".html", ".htm", ".svg", ".php", ".py", ".rb",
  ".jsp", ".asp", ".aspx", ".cgi", ".exe", ".bat",
  ".sh", ".cmd", ".ps1",
]);

const ext = "." + filename.split(".").pop()?.toLowerCase();
if (BLOCKED_EXTENSIONS.has(ext)) {
  return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
}
```

---

## Fix 21: AES-256-GCM Token Encryption

Create an encryption utility:

```typescript
// lib/crypto/tokens.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTED_PREFIX = "enc:";

function getKey(): Buffer | null {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) return null;
  return Buffer.from(hex, "hex");
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext; // graceful fallback

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(stored: string): string {
  if (!stored.startsWith(ENCRYPTED_PREFIX)) return stored; // legacy plaintext

  const key = getKey();
  if (!key) return stored;

  const parts = stored.slice(ENCRYPTED_PREFIX.length).split(":");
  if (parts.length !== 3) return stored;

  const [ivHex, tagHex, dataHex] = parts;
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return decipher.update(Buffer.from(dataHex, "hex")) + decipher.final("utf8");
}

// Convenience helpers for encrypting/decrypting multiple fields on an object
export function encryptTokenFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === "string" && result[field]) {
      (result as any)[field] = encryptToken(result[field] as string);
    }
  }
  return result;
}

export function decryptTokenFields<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === "string" && result[field]) {
      (result as any)[field] = decryptToken(result[field] as string);
    }
  }
  return result;
}
```

Then wrap all token write paths with `encryptToken()` and read paths with `decryptToken()`:

```typescript
// Write path — encrypt before saving
import { encryptToken } from "@/lib/crypto/tokens";

await supabase.from("whatsapp_configs").update({
  access_token: encryptToken(tokenResponse.access_token),
  refresh_token: encryptToken(tokenResponse.refresh_token),
}).eq("tenant_id", tenantId);

// Read path — decrypt after fetching
import { decryptToken } from "@/lib/crypto/tokens";

const { data } = await supabase.from("whatsapp_configs").select("access_token").eq("tenant_id", tenantId).single();
const token = decryptToken(data.access_token);
```

**Environment setup** — add to `.env.example`:
```bash
# AES-256-GCM key for encrypting OAuth tokens at rest
# Generate with: openssl rand -hex 32
# WARNING: Changing this after tokens are encrypted makes them unreadable!
TOKEN_ENCRYPTION_KEY=generate-with-openssl-rand-hex-32
```

---

## Fix 22: NODE_ENV Guard for Debug Logging

```typescript
// BEFORE (logs PII in production)
console.log("Processing contact:", contact.email);
console.log("Webhook payload:", JSON.stringify(body));

// AFTER (dev-only logging)
if (process.env.NODE_ENV !== "production") {
  console.log("Processing contact:", contact.email);
  console.log("Webhook payload:", JSON.stringify(body));
}
```

For files with many debug logs, wrap all logging statements in the same guard. Never log:
- Full tokens or API keys
- Email addresses or phone numbers
- Request bodies containing passwords
- Token metadata like `token_length` or `token_prefix`

---

## Fix 23: Generic Error Responses

```typescript
// BEFORE (leaks internals)
catch (error: any) {
  return NextResponse.json(
    { error: "Failed", message: error.message },
    { status: 500 }
  );
}

// AFTER (generic + server-side logging)
catch (error: any) {
  console.error("[endpoint-name] Error:", error);
  return NextResponse.json(
    { error: "Failed to process request" },
    { status: 500 }
  );
}
```

---

## Fix 24: Replace Vulnerable npm Packages

```bash
# xlsx → exceljs (fixes prototype pollution vulnerability)
npm uninstall xlsx
npm install exceljs

# Verify clean
npm audit
```

Update import code:

```typescript
// BEFORE (xlsx)
import * as XLSX from "xlsx";
const workbook = XLSX.read(buffer, { type: "buffer" });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

// AFTER (exceljs)
import ExcelJS from "exceljs";
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(buffer);
const sheet = workbook.worksheets[0];
// Iterate rows manually
const headers: string[] = [];
sheet.getRow(1).eachCell((cell, col) => {
  headers[col - 1] = String(cell.value ?? "");
});
```

---

## Fix 25: MIME + Extension Cross-Validation

```typescript
// Validate both MIME type AND file extension
const ALLOWED_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
};

const ext = "." + file.name.split(".").pop()?.toLowerCase();
const allowedExts = ALLOWED_TYPES[file.type];

if (!allowedExts || !allowedExts.includes(ext)) {
  return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
}
```

---

## Fix 26: Secure Cookie Flags

```typescript
// BEFORE (missing security flags)
response.headers.set("Set-Cookie", `session=${token}; Path=/`);

// AFTER (all security flags)
response.headers.set("Set-Cookie",
  `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`
);

// Using Next.js cookies API:
import { cookies } from "next/headers";
cookies().set("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 3600,
  path: "/",
});
```

**Flags explained**:
- `HttpOnly` — prevents JavaScript access (blocks XSS cookie theft)
- `Secure` — only sent over HTTPS
- `SameSite=Lax` — prevents CSRF (blocks cross-site form submissions)
- `Max-Age` — cookie expiration (don't use session cookies for auth)

---

## Fix 27: Prevent Account Enumeration

```typescript
// BEFORE (reveals user existence)
if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });
if (!validPassword) return NextResponse.json({ error: "Wrong password" }, { status: 401 });

// AFTER (identical response for both)
if (!user || !validPassword) {
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

// Also for password reset — same response whether email exists or not:
// "If an account with that email exists, a reset link has been sent."
```

---

## Fix 28: CORS Origin Validation

```typescript
// BEFORE (reflects any origin — allows CSRF)
const origin = request.headers.get("origin");
response.headers.set("Access-Control-Allow-Origin", origin!);
response.headers.set("Access-Control-Allow-Credentials", "true");

// AFTER (strict allowlist)
const ALLOWED_ORIGINS = new Set([
  "https://myapp.com",
  "https://www.myapp.com",
  process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "",
].filter(Boolean));

const origin = request.headers.get("origin");
if (origin && ALLOWED_ORIGINS.has(origin)) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
}
// If origin is not in the allowlist, don't set CORS headers at all
```

---

## Fix 29: Complete Security Headers

```typescript
// In middleware.ts — set ALL required security headers
response.headers.set("X-Content-Type-Options", "nosniff");
response.headers.set("X-Frame-Options", "DENY");
response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
response.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
response.headers.set("Content-Security-Policy",
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; font-src 'self' data:; " +
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'"
);

// Suppress technology disclosure
response.headers.delete("X-Powered-By");

// In next.config.js:
// poweredByHeader: false,
```

---

## Fix 30: SSRF Prevention

```typescript
// Validate URLs before server-side fetching
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Must be HTTPS
    if (parsed.protocol !== "https:") return false;

    // Block internal IPs
    const hostname = parsed.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("192.168.") ||
      hostname === "169.254.169.254" || // cloud metadata
      hostname.endsWith(".internal")
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

// Usage
const { url } = await request.json();
if (!isAllowedUrl(url)) {
  return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
}
const response = await fetch(url);
```

---

## Fix 31: Open Redirect Prevention

```typescript
// BEFORE (attacker can redirect to phishing site)
const returnUrl = searchParams.get("redirect") || "/dashboard";
return NextResponse.redirect(new URL(returnUrl, request.url));

// AFTER (only allow relative paths or whitelisted domains)
function getSafeRedirectUrl(input: string | null, request: Request): URL {
  const defaultUrl = new URL("/dashboard", request.url);

  if (!input) return defaultUrl;

  // Only allow relative paths (starts with /)
  if (input.startsWith("/") && !input.startsWith("//")) {
    return new URL(input, request.url);
  }

  // Or validate against domain allowlist
  try {
    const parsed = new URL(input);
    const ALLOWED_HOSTS = new Set(["myapp.com", "www.myapp.com"]);
    if (ALLOWED_HOSTS.has(parsed.hostname)) {
      return parsed;
    }
  } catch {}

  return defaultUrl;
}
```

---

## Fix 32: Mass Assignment Prevention

```typescript
// BEFORE (spreads entire body — mass assignment vulnerability)
const body = await request.json();
await supabase.from("profiles").update(body).eq("id", userId);

// AFTER (explicit field picking)
const body = await request.json();
const safeFields = {
  display_name: body.display_name,
  avatar_url: body.avatar_url,
  // Only include fields the user is allowed to modify
  // NEVER include: role, is_admin, tenant_id, etc.
};
await supabase.from("profiles").update(safeFields).eq("id", userId);
```

**Rule**: Never spread `request.json()` directly into `.insert()` or `.update()`. Always destructure only the fields the user is allowed to set.

---

## Fix 33: Webhook Signature Verification

```typescript
import crypto from "crypto";

// Generic HMAC-SHA256 webhook verification
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const computed = crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");

  // CRITICAL: use constant-time comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false; // Different lengths = not equal
  }
}

// In webhook handler:
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("X-Hub-Signature-256")?.replace("sha256=", "") || "";

  if (!verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Also check timestamp freshness (replay protection)
  const timestamp = request.headers.get("X-Webhook-Timestamp");
  if (timestamp) {
    const age = Date.now() - parseInt(timestamp) * 1000;
    if (age > 5 * 60 * 1000) { // 5 minutes
      return NextResponse.json({ error: "Stale webhook" }, { status: 401 });
    }
  }

  const body = JSON.parse(rawBody);
  // Safe to process...
}
```

---

## Fix 34: Replace Math.random() with crypto.randomBytes()

```typescript
// BEFORE (predictable, insecure)
const token = Math.random().toString(36).substring(2);
const resetCode = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

// AFTER (cryptographically secure)
import crypto from "crypto";

const token = crypto.randomBytes(32).toString("hex"); // 64-char hex string
const resetCode = (crypto.randomInt(1000000)).toString().padStart(6, "0"); // 6-digit code
const uuid = crypto.randomUUID(); // UUID v4
```

---

## Fix 35: Constant-Time Secret Comparison

```typescript
import crypto from "crypto";

// BEFORE (timing attack vulnerability)
if (computedHmac === receivedHmac) { ... }

// AFTER (constant-time comparison)
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

if (safeCompare(computedHmac, receivedHmac)) { ... }
```

---

## Fix 36: IDOR Prevention with Ownership Check

```typescript
// BEFORE (any authenticated user can access any resource)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { data } = await supabase.from("contacts").select("*").eq("id", params.id).single();
  return NextResponse.json(data);
}

// AFTER (verify tenant ownership)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tenantId = await getUserTenantId(); // from auth
  if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", params.id)
    .eq("tenant_id", tenantId) // ownership check!
    .single();

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
```

**Rule**: Every resource-fetching route MUST verify the authenticated user has permission to access that specific resource. Use tenant_id, user_id, or a permission check — never trust the URL parameter alone.

---

## Fix 37: OAuth State Parameter (CSRF Protection)

```typescript
import crypto from "crypto";

// When initiating OAuth — generate and store state
const state = crypto.randomBytes(32).toString("hex");
// Store in a signed cookie or server-side session
cookies().set("oauth_state", state, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 600, // 10 minutes
});

const authUrl = `https://provider.com/oauth/authorize?` +
  `client_id=${CLIENT_ID}&` +
  `redirect_uri=${REDIRECT_URI}&` +
  `state=${state}&` +
  `response_type=code`;

// On OAuth callback — verify state matches
export async function GET(request: Request) {
  const state = searchParams.get("state");
  const storedState = cookies().get("oauth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 403 });
  }

  cookies().delete("oauth_state");
  // Proceed with token exchange...
}
```

---

## Priority Matrix

| Severity | Fix Time | Impact |
|----------|----------|--------|
| CRITICAL | Minutes | Data breach, full DB access, token theft, XSS via uploads, SSRF, IDOR, forged webhooks |
| HIGH | Minutes–Hours | Cross-tenant data, secret exposure, missing rate limits, mass assignment, weak crypto |
| MEDIUM | Hours | XSS, info leakage, missing headers, account enumeration, open redirects, PII in logs |
| LOW | Minutes | Defense-in-depth, stack disclosure, dependency hygiene, sequential IDs |

Always fix CRITICAL and HIGH first. MEDIUM and LOW should follow in the same session.

For bulk fixes (e.g., rate limiting 10+ endpoints, token encryption across 5 integrations, security headers), use parallel agents to maximize speed.
