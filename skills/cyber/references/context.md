# Cyber Skill Reference Context

## Key Files

| What | Path |
|------|------|
| Security checklist | `docs/plans/2026-03-02-cybersecurity-risk-checklist.md` |
| Auth config | `src/lib/auth.ts`, `src/lib/auth.config.ts` |
| Rate limiting | `src/lib/rate-limit.ts` |
| Audit logging | `src/lib/audit-log.ts` |
| Env validation | `src/lib/env-check.ts` |
| Startup hook | `src/instrumentation.ts` |
| Subscription check | `src/lib/subscription-check.ts` |
| Payment token | `src/lib/payment-token.ts` |
| Webhook handlers | `src/lib/payments/webhook-handlers.ts` |
| Webhook verify | `src/lib/payments/webhook-verify.ts` |
| Receipt email | `src/lib/payments/receipt-email.ts` |
| Socket.io server | `server.ts` |
| CSP / headers | `next.config.ts` |
| Validations | `src/lib/validations/*.ts` |
| Webhook URL validation | `src/lib/validations/webhook.ts` |
| HTML sanitization | `src/lib/sanitize.ts` |
| Prisma schema | `prisma/schema.prisma` |
| Response caching | `src/lib/cache.ts` |
| Points system | `src/lib/points.ts` |
| Prisma client (pool config) | `src/lib/prisma.ts` |
| Super admin | `src/lib/super-admin.ts` |
| Cron: digest | `src/app/api/cron/digest/route.ts` |
| Cron: subscription expiry | `src/app/api/cron/subscription-expiry/route.ts` |

## Security Patterns in This Codebase

- **Rate limiting**: `checkRateLimit(key, { limit, windowSeconds })` from `src/lib/rate-limit.ts`. Use `isRateLimited()` for check-only (no increment).
- **Auth check**: `auth()` for standard, `verifiedAuth()` for password-change-aware validation.
- **Audit logging**: `logAdminAction({ userId, groupId, action, targetId, metadata, ip })` - fire-and-forget.
- **Subscription enforcement**: `checkActiveSubscription(userId, groupId)` - returns boolean. Free groups always return true.
- **Webhook verification**: `verifyWebhookSignature(body, signature, secret)` + `verifyWebhookTimestamp(header, toleranceSeconds)` from `src/lib/payments/webhook-verify.ts`.
- **Input validation**: Zod schemas in `src/lib/validations/`. Always `.safeParse()` and return 400 on failure.
- **SSRF protection**: Webhook URLs validated against private IP blocklist in `src/lib/validations/webhook.ts`.
- **Socket.io auth**: JWT via `/api/auth/socket-token`, verified in middleware. Internal APIs protected by `SOCKET_EMIT_SECRET`.
- **File serving**: Authenticated via `/api/uploads/[filename]` with path traversal protection (regex allowlist).
- **Env validation**: Critical env vars checked at startup via `src/lib/env-check.ts` imported in `src/instrumentation.ts`.
- **Response caching**: `cachedQuery(key, ttlSeconds, fetcher)` from `src/lib/cache.ts`. Uses Upstash Redis with graceful fallback. `invalidateCache(key)` and `invalidateCacheByPrefix(prefix)` for invalidation.
- **Query timeout**: `statement_timeout=30000` in pg.Pool options (`src/lib/prisma.ts`). Kills queries running longer than 30s.
- **Super admin IP restriction**: `isSuperAdmin(email, ip?)` from `src/lib/super-admin.ts`. Optional `SUPER_ADMIN_ALLOWED_IPS` env var check.
- **Points velocity**: Rate-limited to 20/hour + 50/day per user per group in `src/lib/points.ts`. OWNER/ADMIN exempt.
- **Refund idempotency**: Atomic `updateMany` with status condition in admin refund route. Duplicate PENDING check in user refund route.
- **Cron safety**: Pagination (`take` limits) + timeout guards (`Date.now() - start > 50_000`) prevent Vercel 60s timeout.
- **Leaderboard caching**: `cachedQuery` with 5min TTL (all-time) / 60s TTL (weekly/monthly). Invalidated via `invalidateCacheByPrefix` when points awarded.

## Non-Code Items

Some checklist items require action outside the codebase. Flag these separately:
- **Legal**: PPA registration, DPA agreements, PSP license opinion
- **Infrastructure**: Redis, database firewall, VPC, secret rotation
- **Organizational**: Security training, incident response plan, access reviews
- **Third-party**: SPF/DKIM/DMARC, dependency scanning, penetration testing
- **Platform monitoring**: GitHub audit log, Vercel deployment history, Cloudflare WAF/DNS change alerts
