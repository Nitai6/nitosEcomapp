# Facebook Lead Ads Integration

## Overview

Facebook Lead Ads allow businesses to collect leads directly from Facebook/Instagram ads. The integration has 3 parts:
1. **OAuth flow** - Connect Facebook account and grant ads permissions
2. **Real-time webhook** - Receive leads instantly as they come in
3. **Field mapping** - Map Facebook form fields to CRM contact fields

## OAuth Flow

### Step 1: Generate Auth URL

```typescript
// GET /api/tenant/facebook-ads/auth-url

const scopes = [
  "ads_management",
  "ads_read",
  "leads_retrieval",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_ads",
  "pages_manage_metadata",
].join(",");

// Create signed state with HMAC + expiry for CSRF protection
const statePayload = {
  tenant_id: tenantId,
  user_id: userId,
  exp: Math.floor(Date.now() / 1000) + 600, // 10 min expiry
};
const state = signState(statePayload, process.env.FACEBOOK_APP_SECRET!);

const authUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes}&state=${state}&response_type=code`;
```

### Step 2: Handle Callback

```typescript
// GET /api/tenant/facebook-ads/callback

// 1. Verify state signature and expiry
const stateData = verifyState(state, process.env.FACEBOOK_APP_SECRET!);

// 2. Exchange code for short-lived token
const tokenRes = await fetch(
  `https://graph.facebook.com/v24.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&code=${code}&redirect_uri=${REDIRECT_URI}`
);

// 3. Exchange for long-lived token (60 days)
const longLivedRes = await fetch(
  `https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortToken}`
);

// 4. Get user's pages
const pagesRes = await fetch(
  `https://graph.facebook.com/v24.0/me/accounts?access_token=${longLivedToken}`
);

// 5. Subscribe page to leadgen webhook
for (const page of pages.data) {
  await fetch(
    `https://graph.facebook.com/v24.0/${page.id}/subscribed_apps?subscribed_fields=leadgen&access_token=${page.access_token}`,
    { method: "POST" }
  );
}

// 6. Store encrypted tokens in integration_tokens / facebook_ads_tokens table
```

### Step 3: Token Storage

Store in database (all tokens encrypted):
```typescript
{
  tenant_id,
  provider: "facebook",
  access_token: encryptToken(longLivedToken),   // User token (60 days)
  page_access_token: encryptToken(pageToken),    // Page token (never expires)
  page_id: selectedPage.id,
  ad_account_id: selectedAdAccount.id,
  facebook_user_id: userId,
  token_expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
  scopes: scopes.split(","),
}
```

## Real-Time Webhook

### Route: POST /api/webhooks/facebook-leads

```typescript
// GET - Verification (same pattern as WhatsApp)
if (mode === "subscribe" && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
  return new Response(challenge, { status: 200 });
}

// POST - Lead notification
const body = JSON.parse(rawBody);
// Verify X-Hub-Signature-256

for (const entry of body.entry || []) {
  for (const change of entry.changes || []) {
    if (change.field === "leadgen") {
      const leadgenId = change.value.leadgen_id;
      const pageId = change.value.page_id;
      const formId = change.value.form_id;

      // Find tenant by page_id
      const tenant = await findTenantByPageId(pageId);

      // Fetch full lead data
      const leadData = await fetch(
        `https://graph.facebook.com/v24.0/${leadgenId}?access_token=${decryptedToken}`
      );

      // Import to contacts
      await importLeadToContacts(tenant, leadData, formId);
    }
  }
}
```

### Webhook Registration
1. Go to App Dashboard > Webhooks
2. Add webhook for **Page** object
3. Subscribe to **leadgen** field
4. Set callback URL: `https://yourdomain.com/api/webhooks/facebook-leads`
5. Set verify token: FACEBOOK_WEBHOOK_VERIFY_TOKEN

## Field Mapping

### Form Configuration API

```typescript
// GET /api/tenant/facebook-ads/forms/[formId]/config
// Returns the field mapping for a specific lead form

{
  form_id: "123456",
  form_name: "Contact Us Form",
  mappings: {
    "email": "email",              // Facebook field → Contact field
    "phone_number": "phone_number",
    "full_name": "name",
    "company": "metadata.company",
    "city": "metadata.city",
  }
}

// POST /api/tenant/facebook-ads/forms/[formId]/config
// Save field mappings
```

### Lead Import Function

```typescript
async function importLeadToContacts(tenant, lead, formId) {
  const config = await getFormConfig(tenant.id, formId);

  // Map Facebook fields to contact fields using config
  const contactData = {};
  for (const [fbField, contactField] of Object.entries(config.mappings)) {
    const value = lead.field_data.find(f => f.name === fbField)?.values?.[0];
    if (value) {
      if (contactField.startsWith("metadata.")) {
        // Store in metadata JSONB
        contactData.metadata = contactData.metadata || {};
        contactData.metadata[contactField.replace("metadata.", "")] = value;
      } else {
        contactData[contactField] = value;
      }
    }
  }

  // Check for duplicates by phone/email
  // Create or update contact
  // Store raw lead in facebook_leads table
  // Update lead status to "imported"
}
```

## Database Tables

### facebook_ads_tokens (or integration_tokens)
```sql
CREATE TABLE integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  provider TEXT NOT NULL,  -- 'facebook', 'facebook_ads', 'gmail', etc.
  access_token TEXT NOT NULL,  -- Encrypted
  refresh_token TEXT,          -- Encrypted (if applicable)
  token_expiry TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',  -- page_id, ad_account_id, facebook_user_id, scopes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### facebook_leads
```sql
CREATE TABLE facebook_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  lead_id TEXT NOT NULL,       -- Facebook lead ID
  form_id TEXT NOT NULL,       -- Facebook form ID
  field_data JSONB NOT NULL,   -- Raw lead data from Facebook
  phone TEXT,                  -- Extracted phone
  email TEXT,                  -- Extracted email
  contact_id UUID REFERENCES contacts(id),  -- Linked CRM contact
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'imported', 'failed', 'duplicate')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables

```env
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/tenant/facebook-ads/callback
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your-random-fb-webhook-verify-token
```

## Middleware: Public Routes

These routes must bypass authentication in middleware:
```typescript
const publicRoutes = [
  "/api/webhooks",                         // All webhooks
  "/api/cron",                             // All cron jobs
  "/api/tenant/facebook-ads/callback",     // OAuth callback
];
```

## Important Notes

1. **Long-lived tokens expire in 60 days** - Implement token refresh or re-auth flow
2. **Page tokens never expire** - Store separately for webhook lead fetching
3. **Subscribe each page to leadgen** - Must call subscribed_apps endpoint per page
4. **Signed state** - Use HMAC with expiry to prevent CSRF on OAuth callback
5. **Rate limits** - Facebook Marketing API has separate rate limits from WhatsApp
