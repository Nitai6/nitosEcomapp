# Advanced Features

## Ice Breakers (Welcome Prompts)

### Overview
Ice Breakers are pre-set prompts shown to users when they open a new conversation with your business number. Meta calls this "Conversational Automation."

### Meta API Endpoint

```
POST https://graph.facebook.com/v24.0/{PHONE_NUMBER_ID}/conversational_automation
```

### Push Ice Breakers

```typescript
async function pushIceBreakers(phoneNumberId: string, accessToken: string, items: IceBreaker[]) {
  const prompts = items.map((item) => ({
    text: item.text,      // Display text (max 80 chars)
    payload: item.payload, // Payload sent when clicked
  }));

  const response = await fetch(
    `${GRAPH_API_BASE_URL}/${phoneNumberId}/conversational_automation`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enable_welcome_message: true,
        prompts,
      }),
    }
  );

  return response.json();
}
```

### Ice Breaker Item Interface

```typescript
interface IceBreaker {
  text: string;    // Display text shown to user
  payload: string; // Payload sent when user clicks
  clicks?: number; // Track clicks in settings JSONB
}
```

### Click Tracking

When a user clicks an ice breaker, it arrives as a `button` or `interactive` message in the webhook:

```typescript
// In webhook handler:
if (message.type === "interactive" && message.interactive?.type === "button_reply") {
  const clickedPayload = message.interactive.button_reply.payload;

  // Increment click count in settings
  const iceBreakers = account.settings?.ice_breakers?.items || [];
  const updatedItems = iceBreakers.map((item) =>
    item.payload === clickedPayload
      ? { ...item, clicks: (item.clicks || 0) + 1 }
      : item
  );

  // Save back to settings
  await supabase
    .from("whatsapp_accounts")
    .update({ settings: { ...settings, ice_breakers: { ...settings.ice_breakers, items: updatedItems } } })
    .eq("id", accountId);
}
```

### Storage in Settings JSONB

```json
{
  "ice_breakers": {
    "enabled": true,
    "items": [
      { "text": "How can I order?", "payload": "order_info", "clicks": 42 },
      { "text": "Business hours", "payload": "hours", "clicks": 18 },
      { "text": "Talk to support", "payload": "support", "clicks": 95 }
    ]
  }
}
```

## Automation Engine

### Architecture

The automation system processes messages in phases:
1. **Phase 1** (synchronous): Store message, create/update contact, return 200
2. **Phase 2** (inline after response): Run automations

### Processing Order

```typescript
async function runAutomations(message, contact, account) {
  const settings = account.settings;

  // 1. Check opt-out keywords ("STOP", "UNSUBSCRIBE", "CANCEL")
  if (settings.opt_out?.enabled && isOptOutKeyword(message.text, settings.opt_out.keywords)) {
    await handleOptOut(contact, account);
    return; // Stop processing
  }

  // 2. Check opt-in keywords ("START", "SUBSCRIBE")
  if (settings.opt_in?.keywords && isOptInKeyword(message.text, settings.opt_in.keywords)) {
    await handleOptIn(contact, account);
    return;
  }

  // 3. Check business hours
  if (settings.business_hours?.enabled && !isWithinBusinessHours(settings.business_hours)) {
    await sendOutOfHoursMessage(contact, account);
    return;
  }

  // 4. Check cooldown (30 min default) to prevent spam
  if (await isInCooldown(contact.id, account.id)) {
    return; // Don't reply again
  }

  // 5. Run custom flow engine (if active flows exist)
  const flowResult = await executeFlows(message, contact, account);
  if (flowResult.handled) return;

  // 6. Send default reply (if enabled)
  if (settings.default_reply?.enabled) {
    await sendDefaultReply(contact, account);
  }
}
```

### Consent Tracking

```typescript
function buildConsentMetadataUpdate(action: "opt_out" | "opt_in") {
  return {
    consent: {
      [action]: true,
      [`${action}_at`]: new Date().toISOString(),
      source: "keyword",
    },
  };
}

async function logConsentChange(tenantId, contactId, action, message) {
  await supabase.from("audit_logs").insert({
    tenant_id: tenantId,
    action: `contact_${action}`,
    details: {
      contact_id: contactId,
      keyword: message.text,
      source: "whatsapp_keyword",
    },
  });
}
```

### Business Hours Configuration

```json
{
  "business_hours": {
    "enabled": true,
    "timezone": "Asia/Jerusalem",
    "schedule": {
      "sunday": { "enabled": true, "start": "09:00", "end": "18:00" },
      "monday": { "enabled": true, "start": "09:00", "end": "18:00" },
      "tuesday": { "enabled": true, "start": "09:00", "end": "18:00" },
      "wednesday": { "enabled": true, "start": "09:00", "end": "18:00" },
      "thursday": { "enabled": true, "start": "09:00", "end": "17:00" },
      "friday": { "enabled": false },
      "saturday": { "enabled": false }
    },
    "out_of_hours_message": "We're currently closed. We'll get back to you during business hours."
  }
}
```

## Resumable Upload API

### Overview
Meta requires the Resumable Upload API for uploading media files (images, videos, documents) used in:
- Template headers (image/video/document templates)
- Profile photos

**Critical**: Uses `app_id` (not `phone_number_id` or `waba_id`) as the upload target.

### Upload Flow

```typescript
async function uploadMediaForTemplate(
  file: Buffer,
  mimeType: string,
  fileName: string,
  appId: string,
  accessToken: string
): Promise<string> {
  // Step 1: Create upload session
  const sessionRes = await fetch(
    `${GRAPH_API_BASE_URL}/${appId}/uploads`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_name: fileName,
        file_length: file.length,
        file_type: mimeType,
      }),
    }
  );
  const { id: uploadSessionId } = await sessionRes.json();

  // Step 2: Upload file data
  const uploadRes = await fetch(
    `${GRAPH_API_BASE_URL}/${uploadSessionId}`,
    {
      method: "POST",
      headers: {
        Authorization: `OAuth ${accessToken}`,
        "Content-Type": mimeType,
        file_offset: "0",
      },
      body: file,
    }
  );
  const { h: fileHandle } = await uploadRes.json();

  return fileHandle; // Use this handle in template creation
}
```

### Using Upload Handle in Template

```typescript
// When creating a template with a header image:
const components = [
  {
    type: "HEADER",
    format: "IMAGE",
    example: {
      header_handle: [fileHandle], // From Resumable Upload
    },
  },
  {
    type: "BODY",
    text: "Hello {{1}}, your order {{2}} is ready!",
    example: { body_text: [["John", "#12345"]] },
  },
];
```

## Template Management

### Template Lifecycle

```
Draft (local) → Submit to Meta → PENDING → APPROVED or REJECTED
APPROVED → can be PAUSED (manual or quality issues) → RESUMED
APPROVED → can be DISABLED (quality) → IN_APPEAL → APPROVED or DISABLED
Any → PENDING_DELETION → DELETED
```

### Template Validation

```typescript
function validateTemplateName(name: string): boolean {
  // Lowercase letters, numbers, underscores only. Max 512 chars.
  return /^[a-z0-9_]+$/.test(name) && name.length <= 512;
}

function validateTemplateBody(body: string): { valid: boolean; error?: string } {
  if (body.length > 1024) return { valid: false, error: "Body exceeds 1024 chars" };

  // Check sequential variable numbering: {{1}}, {{2}}, etc.
  const vars = body.match(/\{\{(\d+)\}\}/g) || [];
  const numbers = vars.map((v) => parseInt(v.replace(/[{}]/g, ""))).sort((a, b) => a - b);

  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] !== i + 1) {
      return { valid: false, error: `Variables must be sequential starting from {{1}}` };
    }
  }

  return { valid: true };
}
```

### Template Categories

| Category | Use Case | Requires Opt-in |
|----------|----------|-----------------|
| UTILITY | Order updates, receipts, account alerts | No (transactional) |
| MARKETING | Promotions, offers, newsletters | Yes |
| AUTHENTICATION | OTP, verification codes | No |

## Conversation Pricing Tracking

### Overview
Meta sends pricing data with the first status update of each conversation. Store this for cost analysis.

### Storage Strategy

Since messages table may not have a dedicated metadata column, store pricing in the `content` JSONB field under a `_pricing` key:

```typescript
// In webhook status handler:
if (status.conversation || status.pricing) {
  const existingContent = message.content || {};
  const updatedContent = {
    ...existingContent,
    _pricing: {
      conversation_id: status.conversation?.id,
      category: status.conversation?.origin?.type,
      billable: status.pricing?.billable,
      pricing_model: status.pricing?.pricing_model,
      expiration: status.conversation?.expiration_timestamp,
    },
  };

  await supabase
    .from("messages")
    .update({ content: updatedContent })
    .eq("whatsapp_message_id", status.id);
}
```

### Pricing Categories

| Category | Cost | Trigger |
|----------|------|---------|
| utility | Low | Business sends template (order updates, etc.) |
| marketing | Medium | Business sends template (promotions) |
| authentication | Low | Business sends OTP template |
| service | Free* | Customer initiates (24h window) |
| referral_conversion | Varies | From Click-to-WhatsApp ads |

*Service conversations are free for first 1,000/month per WABA.

## Required Middleware Configuration

Add these routes to your middleware's public routes:

```typescript
const publicRoutes = [
  "/api/webhooks",                         // WhatsApp + Facebook webhooks
  "/api/cron",                             // All scheduled cron jobs
  "/api/tenant/facebook-ads/callback",     // OAuth callback (redirect from Facebook)
  "/privacy",                              // Privacy policy page
  "/terms",                                // Terms of service page
];
```
