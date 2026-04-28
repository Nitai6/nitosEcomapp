# Production Monitoring & Rate Limits

## Rate Limit Monitoring System

### Overview
Meta returns rate limit data in response headers. A monitoring system should:
1. Extract rate limits from every API call
2. Store snapshots for trend analysis
3. Alert when approaching limits (75% warning, 95% critical)
4. Auto-resolve alerts when usage drops

### Response Headers to Parse

**x-business-use-case-usage** (per WABA):
```json
{
  "WABA_ID": [{
    "type": "ads_management" | "pages" | "messaging",
    "call_count": 28,           // Percentage used (0-100)
    "total_cputime": 5,
    "total_time": 12,
    "estimated_time_to_regain_access": 0
  }]
}
```

**x-app-usage** (per app):
```json
{
  "call_count": 15,    // Percentage of calls used
  "total_cputime": 8,  // Percentage of CPU time used
  "total_time": 10     // Percentage of total time used
}
```

### Fetch Wrapper with Rate Limit Extraction

```typescript
import { GRAPH_API_BASE_URL } from "./constants";

export async function metaFetch(
  url: string,
  options: RequestInit,
  accountId?: string
): Promise<Response> {
  const response = await fetch(url, options);

  // Extract rate limits (fire and forget - never block response)
  extractAndStoreRateLimits(response.headers, accountId).catch(() => {});

  return response;
}

export async function metaFetchWithRetry(
  url: string,
  options: RequestInit,
  accountId?: string,
  maxRetries = 3
): Promise<Response> {
  let lastResponse: Response | null = null;
  let backoffMs = 2000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await metaFetch(url, options, accountId);
    lastResponse = response;

    if (response.ok || (response.status !== 429 && response.status !== 503)) {
      return response;
    }

    // Rate limited or service unavailable - retry with backoff
    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, backoffMs));
      backoffMs *= 2; // Exponential backoff
    }
  }

  return lastResponse!;
}
```

### Rate Limit Thresholds

```typescript
const RATE_LIMIT_THRESHOLDS = {
  WARNING: 75,   // Percentage - create warning alert
  CRITICAL: 95,  // Percentage - create critical alert + send email
};
```

### Storage: JSONB in whatsapp_accounts.settings

```json
{
  "meta_rate_limits": {
    "app_usage": { "call_count": 15, "total_cputime": 8, "total_time": 10 },
    "business_usage": { "call_count": 28, "total_cputime": 5, "total_time": 12 },
    "highest_percentage": 28,
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
```

### Alert Table: meta_platform_monitoring

```sql
CREATE TABLE meta_platform_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL CHECK (check_type IN (
    'rate_limit_alert', 'version_check', 'deprecation_warning', 'platform_status'
  )),
  tenant_id UUID REFERENCES tenants(id),
  data JSONB NOT NULL DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meta_monitoring_type ON meta_platform_monitoring(check_type);
CREATE INDEX idx_meta_monitoring_tenant ON meta_platform_monitoring(tenant_id);
CREATE INDEX idx_meta_monitoring_unresolved ON meta_platform_monitoring(resolved) WHERE resolved = false;
```

## Email Alerts

Send HTML email alerts via Resend when rate limits exceed thresholds:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMetaAlert(alerts: MetaAlert[]) {
  if (!process.env.ALERT_EMAIL_TO) return;

  await resend.emails.send({
    from: "Meta Monitor <alerts@yourdomain.com>",
    to: process.env.ALERT_EMAIL_TO,
    subject: `Meta Platform Alert - ${alerts[0].severity.toUpperCase()}`,
    html: buildAlertEmailHtml(alerts),
  });
}
```

## Daily Monitoring Cron

**Route**: `/api/cron/meta-monitor`
**Schedule**: Daily at 8:00 AM (in vercel.json)

What it checks:
1. **Graph API version** - Is current version still available?
2. **Version deprecation** - Any upcoming deprecation dates?
3. **Rate limit snapshots** - Review all tenant accounts for warnings
4. **Stale alerts** - Auto-resolve alerts older than 1 hour if usage recovered

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/meta-monitor", "schedule": "0 8 * * *" }
  ]
}
```

### Cron Authentication
- Vercel automatically adds `CRON_SECRET` header for cron routes
- Non-Vercel environments: verify `Authorization: Bearer CRON_SECRET`
- Add `/api/cron` to middleware public routes list

## Messaging Quota System

### Tier Mapping

```typescript
const TIER_LIMITS: Record<string, number | null> = {
  "TIER_NOT_SET": 250,
  "TIER_250": 250,
  "TIER_1K": 1000,
  "TIER_10K": 10000,
  "TIER_100K": 100000,
  "TIER_UNLIMITED": null, // No limit
};
```

### Quota Calculation

Count unique contacts messaged in last 24 hours from:
- `broadcast_messages` table (status != 'pending')
- `messages` table (direction = 'outbound', type = 'template')

```typescript
export async function getMessagingQuota(tenantId: string) {
  const tier = account.settings?.messaging_limit_tier || "TIER_NOT_SET";
  const dailyLimit = TIER_LIMITS[tier];
  const sentLast24h = await countUniqueContactsLast24h(tenantId);

  return {
    tier,
    daily_limit: dailyLimit || "unlimited",
    sent_last_24h: sentLast24h,
    remaining: dailyLimit ? dailyLimit - sentLast24h : "unlimited",
    is_unlimited: !dailyLimit,
  };
}
```

### Pre-Broadcast Quota Check

Before sending any broadcast, verify:
1. Total recipients <= remaining quota
2. Account status is "active"
3. Quality rating is not "RED"

## Graph API Version Management

- Store current version as constant: `WHATSAPP_API_VERSION = "v24.0"`
- Check version availability during daily cron
- Monitor for deprecation headers in API responses
- Update version before deprecated version is removed (Meta gives ~2 year window)
- Base URL format: `https://graph.facebook.com/${WHATSAPP_API_VERSION}/`
