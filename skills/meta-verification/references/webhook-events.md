# WhatsApp Webhook Events - Complete Reference

## Webhook Subscription Fields

These are the fields to subscribe to in WhatsApp > Configuration > Webhook fields:

| Field | Description | Required |
|-------|-------------|----------|
| messages | Incoming messages + status updates | Yes |
| message_template_status_update | Template approval/rejection | Yes |
| account_update | Account ban/restriction | Recommended |
| phone_number_quality_update | Quality rating changes | Recommended |
| phone_number_name_update | Display name changes | Recommended |

## Event: messages (field = "messages")

### Incoming Messages

Located in `entry[].changes[].value.messages[]`

```typescript
interface IncomingMessage {
  from: string;          // Sender's phone number (e.g., "972501234567")
  id: string;            // Message ID (e.g., "wamid.xxx")
  timestamp: string;     // Unix timestamp
  type: "text" | "image" | "video" | "audio" | "document" | "location" | "button" | "interactive" | "sticker" | "contacts" | "reaction";

  // Type-specific fields:
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  video?: { id: string; mime_type: string; sha256: string; caption?: string };
  audio?: { id: string; mime_type: string; sha256: string };
  document?: { id: string; mime_type: string; sha256: string; filename: string; caption?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  button?: { text: string; payload: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  sticker?: { id: string; mime_type: string; sha256: string; animated: boolean };
  reaction?: { message_id: string; emoji: string };

  // Context (if reply to another message)
  context?: { from: string; id: string };

  // Referral (if from Click-to-WhatsApp ad)
  referral?: { source_url: string; source_type: string; source_id: string; headline: string; body: string; media_type: string; media_url: string };
}
```

### Contact Info

Located in `entry[].changes[].value.contacts[]`

```typescript
interface WebhookContact {
  profile: { name: string };
  wa_id: string;  // WhatsApp ID (phone number)
}
```

### Metadata

Located in `entry[].changes[].value.metadata`

```typescript
interface WebhookMetadata {
  display_phone_number: string;  // Your business phone number
  phone_number_id: string;       // Your phone number ID
}
```

### Status Updates

Located in `entry[].changes[].value.statuses[]`

```typescript
interface StatusUpdate {
  id: string;              // Message ID
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;    // Recipient phone number

  // Conversation info (first status of each conversation)
  conversation?: {
    id: string;
    origin: {
      type: string;  // "utility" | "marketing" | "authentication" | "service" | "referral_conversion"
    };
    expiration_timestamp?: string;
  };

  // Pricing info
  pricing?: {
    billable: boolean;
    pricing_model: string;  // "CBP" (conversation-based pricing)
    category: string;       // Same as conversation.origin.type
  };

  // Error info (when status = "failed")
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data?: { details: string };
  }>;
}
```

## Event: message_template_status_update

Located in `entry[].changes[].value`

```typescript
interface TemplateStatusUpdate {
  event: string;  // "APPROVED" | "REJECTED" | "PENDING_DELETION" | "DELETED" | "DISABLED" | "PAUSED" | "IN_APPEAL" | "PENDING"
  message_template_id: number;
  message_template_name: string;
  message_template_language: string;
  reason?: string;  // Rejection/disabling reason
}
```

### Template Status Lifecycle

```
PENDING  ──→  APPROVED  ──→  PAUSED (manual or quality)
                │                  │
                │                  └──→  APPROVED (resume)
                │
                └──→  DISABLED (quality issues)
                         │
                         └──→  IN_APPEAL
                                  │
                                  ├──→  APPROVED
                                  └──→  DISABLED

PENDING  ──→  REJECTED

Any state ──→  PENDING_DELETION ──→  DELETED
```

## Event: account_update

Located in `entry[].changes[].value`

```typescript
interface AccountUpdate {
  phone_number?: string;
  event: string;
  // Events: "VERIFIED_ACCOUNT", "PHONE_NUMBER_NAME_UPDATE"

  ban_info?: {
    waba_ban_state: string;  // "DISABLE" | "REINSTATE" | "SCHEDULE_FOR_DISABLE"
    waba_ban_date?: string;
  };

  restriction_info?: Array<{
    restriction_type: string;  // "RESTRICTED_ADD_PHONE_NUMBER" | "RESTRICTED_BIZ_INITIATED_MESSAGING" | "RESTRICTED_CUSTOMER_INITIATED_MESSAGING"
    expiration?: string;
  }>;
}
```

### Account Update Actions

| Event | Action |
|-------|--------|
| ban_info.waba_ban_state = "DISABLE" | Account banned - stop all messaging, alert admin |
| ban_info.waba_ban_state = "SCHEDULE_FOR_DISABLE" | Ban scheduled - alert admin, appeal window |
| ban_info.waba_ban_state = "REINSTATE" | Ban lifted - resume messaging |
| restriction_info present | Temporary restrictions - respect until expiration |

## Event: phone_number_quality_update

Located in `entry[].changes[].value`

```typescript
interface QualityUpdate {
  display_phone_number: string;
  current_limit: string;  // "TIER_1K" | "TIER_10K" | "TIER_100K" | "TIER_UNLIMITED"
  event: string;          // "FLAGGED" | "UNFLAGGED"
}
```

### Quality Update Actions

| Event | Action |
|-------|--------|
| FLAGGED | Quality issues detected - review recent messages, reduce volume |
| UNFLAGGED | Quality recovered - resume normal operations |

## Event: phone_number_name_update

Located in `entry[].changes[].value`

```typescript
interface NameUpdate {
  display_phone_number: string;
  decision: string;  // "APPROVED" | "REJECTED"
  requested_verified_name: string;
  rejection_reason?: string;
}
```

## Webhook Payload Structure

Full payload:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WABA_ID",
      "changes": [
        {
          "value": { /* event-specific data */ },
          "field": "messages | message_template_status_update | account_update | ..."
        }
      ]
    }
  ]
}
```

## Important Notes

1. **Always return 200** - Even if processing fails, return 200 to avoid webhook retries
2. **Process async** - Don't block the response; use background processing for heavy work
3. **Idempotency** - Messages may be delivered more than once; use message ID for dedup
4. **Order** - Events may arrive out of order; use timestamps for ordering
5. **Rate limit** webhook endpoint at ~500 req/min to prevent abuse
6. **Set maxDuration** for serverless functions (60s on Vercel Pro)
