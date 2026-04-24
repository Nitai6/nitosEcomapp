#!/bin/bash
# Security-focused codebase scan.
# Runs grep patterns to detect common vulnerability indicators.
# Execute from the project root directory.

set -euo pipefail

echo "=== Security Codebase Scan ==="
echo ""

echo "--- 1. API routes without auth() calls ---"
grep -rL "auth()" src/app/api/ --include="route.ts" 2>/dev/null || echo "(none found - all routes have auth)"
echo ""

echo "--- 2. RCE vectors (eval/exec/spawn/child_process/new Function) ---"
grep -rn "eval(\|exec(\|spawn(\|child_process\|new Function(" src/ 2>/dev/null || echo "(none found - clean)"
echo ""

echo "--- 3. Hardcoded secrets ---"
grep -rn "password\|secret\|apiKey" src/ --include="*.ts" 2>/dev/null | grep "= ['\"]" || echo "(none found - clean)"
echo ""

echo "--- 4. Missing Zod validation in API routes ---"
for route in $(find src/app/api -name "route.ts" 2>/dev/null); do
  if ! grep -q "safeParse\|\.parse(" "$route" 2>/dev/null; then
    if grep -q "POST\|PUT\|PATCH\|DELETE" "$route" 2>/dev/null; then
      echo "  Missing validation: $route"
    fi
  fi
done
echo ""

echo "--- 5. Rate limiting on sensitive endpoints ---"
for route in \
  "src/app/api/groups/*/announcements/route.ts" \
  "src/app/api/groups/*/whatsapp/send/route.ts" \
  "src/app/api/subscriptions/*/refund/route.ts" \
  "src/app/api/groups/*/admin/refunds/route.ts" \
  "src/app/api/groups/*/analytics/route.ts" \
  "src/app/api/groups/*/payments/route.ts" \
  "src/app/api/polls/*/vote/route.ts"; do
  for f in $route; do
    [ -f "$f" ] && ! grep -q "checkRateLimit" "$f" && echo "  Missing rate limit: $f"
  done
done
echo ""

echo "--- 6. Cron jobs with pagination ---"
for cron in src/app/api/cron/*/route.ts; do
  [ -f "$cron" ] && ! grep -q "take:" "$cron" && echo "  Missing pagination: $cron"
done
echo ""

echo "--- 7. Query timeout in Prisma config ---"
grep -q "statement_timeout" src/lib/prisma.ts 2>/dev/null && echo "(found - clean)" || echo "  WARNING: No statement_timeout in prisma.ts"
echo ""

echo "--- 8. Cache invalidation on points ---"
grep -q "invalidateCache" src/lib/points.ts 2>/dev/null && echo "(found - clean)" || echo "  WARNING: No cache invalidation in points.ts"
echo ""

echo "--- 9. Refund idempotency (atomic updateMany) ---"
found_refund=0
for f in src/app/api/groups/*/admin/refunds/route.ts; do
  [ -f "$f" ] && grep -q "updateMany" "$f" && found_refund=1
done
[ "$found_refund" -eq 1 ] && echo "(found - clean)" || echo "  WARNING: Refund not using atomic updateMany"
echo ""

echo "--- 10. Points velocity rate limiting ---"
grep -q "points-velocity" src/lib/points.ts 2>/dev/null && echo "(found - clean)" || echo "  WARNING: No points velocity rate limit in points.ts"
echo ""

echo "--- 11. Input validation caps ---"
found_level=0
for f in src/app/api/groups/*/route.ts; do
  [ -f "$f" ] && grep -q "levelNames" "$f" && found_level=1
done
[ "$found_level" -eq 1 ] && echo "(levelNames validation found)" || echo "  Check: levelNames validation in group PATCH"
echo ""

echo "=== Scan Complete ==="
