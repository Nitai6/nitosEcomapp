---
name: meta-verification
description: "Complete Meta/WhatsApp Tech Provider verification and setup skill. Use this skill when setting up a new project that integrates with WhatsApp Cloud API, Facebook Business, or needs Meta App Review approval. Covers: Facebook App creation, WhatsApp Cloud API configuration, webhook setup, Embedded Signup, App Review submissions (whatsapp_business_messaging, whatsapp_business_management), Tech Provider enrollment, Business Verification, data deletion/deauthorization callbacks, privacy policy & terms of service requirements, template management, broadcast setup, two-step verification, and all required environment variables. This skill should be used when starting a new WhatsApp SaaS project, adding WhatsApp integration to an existing app, or preparing for Meta App Review."
---

# Meta / WhatsApp Tech Provider - Complete Setup & Verification

This skill guides through the entire Meta WhatsApp integration - from Facebook App creation to Tech Provider approval. It is organized as a checklist-driven workflow with code templates and reference documentation.

## Quick Overview

Setting up a WhatsApp Cloud API integration as a Tech Provider requires:

1. **Facebook App** - Business type app with WhatsApp product
2. **WhatsApp Cloud API** - Phone number, access token, webhooks
3. **Required Code** - Webhook handler, data deletion, deauthorization callbacks
4. **Legal Pages** - Privacy Policy (with WhatsApp section), Terms of Service
5. **App Review** - Request advanced access for messaging & management permissions
6. **Tech Provider** - Business verification + access verification
7. **Embedded Signup** - Allow clients to connect their own WABAs

## Phase 1: Facebook App Setup

### Create the App
1. Go to https://developers.facebook.com/apps/
2. Click **Create App** > **Business** type
3. Set app name, contact email, Business Portfolio
4. App Settings > Basic:
   - Set **Privacy Policy URL** (required for App Review)
   - Set **Terms of Service URL**
   - Set **App Category**: "Business and Pages" (not "Messenger Bots")
   - Set **App Icon** (1024x1024)
5. Toggle **App Mode** to **Live** when ready

### Add Products
1. **WhatsApp** - Click "Set Up" to add
2. **Facebook Login for Business** - Needed for Embedded Signup
3. **Webhooks** - For Facebook Leads (if needed)

### Environment Variables
```env
# Facebook/Meta App
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
NEXT_PUBLIC_FACEBOOK_APP_ID=same-app-id-for-client

# WhatsApp Cloud API
WHATSAPP_BUSINESS_ACCOUNT_ID=your-waba-id
WHATSAPP_ACCESS_TOKEN=your-permanent-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=random-string-you-choose

# Embedded Signup
NEXT_PUBLIC_FB_LOGIN_CONFIG_ID=your-login-config-id

# Token Encryption (generate with: openssl rand -hex 32)
TOKEN_ENCRYPTION_KEY=64-char-hex-string

# Optional: Monitoring alerts
RESEND_API_KEY=for-sending-alert-emails
ALERT_EMAIL_TO=admin@yourdomain.com
```

## Phase 2: Required API Endpoints

### Webhook Handler (WhatsApp)

**Route**: `POST /api/webhooks/whatsapp` + `GET` for verification

**GET handler** (webhook verification):
- Read query params: `hub.mode`, `hub.verify_token`, `hub.challenge`
- If mode === "subscribe" && token matches WHATSAPP_WEBHOOK_VERIFY_TOKEN, return challenge as plain text
- Otherwise return 403

**POST handler** (event processing):
- Verify X-Hub-Signature-256 header using HMAC SHA256 with FACEBOOK_APP_SECRET
- Parse `entry[].changes[].value` for:
  - **messages** - Incoming messages (text, image, video, audio, document, location, button, interactive)
  - **statuses** - Delivery receipts (sent, delivered, read, failed) with conversation pricing
  - **message_template_status_update** - Template approval/rejection notifications
  - **account_update** - Ban/restriction events
  - **phone_number_quality_update** - Quality rating changes
  - **phone_number_name_update** - Display name approval/rejection
- Always return 200 quickly (process async if needed)

**Webhook fields to subscribe**: messages, message_template_status_update, account_update, phone_number_quality_update, phone_number_name_update

### Data Deletion Callback

**Route**: `POST /api/webhooks/meta/data-deletion`

**Required by Meta** - Called when a user removes the app from their Facebook settings.

- Verify signed_request using FACEBOOK_APP_SECRET
- Delete all user data associated with the Facebook user ID
- Return JSON: `{ url: "https://yourdomain/api/webhooks/meta/data-deletion?id=<confirmation_code>", confirmation_code: "<code>" }`
- Implement GET handler for status checks

Register this URL in: App Settings > Basic > Data Deletion Instructions URL

### Deauthorization Callback

**Route**: `POST /api/webhooks/meta/deauthorize`

**Required by Meta** - Called when a user deauthorizes the app.

- Verify signed_request
- Revoke/delete all tokens for that Facebook user
- Log the deauthorization event
- Return 200 OK

Register this URL in: Facebook Login for Business > Settings > Deauthorize Callback URL

### Embedded Signup (Token Exchange)

**Route**: `POST /api/tenant/whatsapp/embedded-signup`

Flow:
1. Client sends authorization code from FB.login()
2. Exchange code for access token: `GET graph.facebook.com/oauth/access_token?client_id=APP_ID&client_secret=APP_SECRET&code=CODE`
3. Debug token to find WABA: `GET graph.facebook.com/debug_token?input_token=TOKEN&access_token=APP_ID|APP_SECRET`
4. Extract WABA ID from `granular_scopes` where scope = "whatsapp_business_management"
5. Fetch phone numbers: `GET graph.facebook.com/{WABA_ID}/phone_numbers?access_token=TOKEN`
6. Store encrypted token, phone number ID, WABA ID in database

## Phase 3: Client-Side Components

### Embedded Signup Button

Load Facebook SDK and call FB.login() with config_id:
- SDK URL: `https://connect.facebook.net/en_US/sdk.js`
- FB.init with appId, cookie: true, version: "v24.0"
- FB.login options: `{ config_id: FB_LOGIN_CONFIG_ID, response_type: "code", override_default_response_type: true }`
- On success, send code to backend for token exchange

To create a Login Configuration:
1. Go to Facebook Login for Business > Configuration
2. Create new config with permissions: whatsapp_business_management, whatsapp_business_messaging
3. Note the config ID for NEXT_PUBLIC_FB_LOGIN_CONFIG_ID

### Two-Step Verification UI
- PIN input: 6-digit numeric only
- Set PIN: POST to /api/tenant/whatsapp/two-step-verification with { pin }
- Remove PIN: DELETE to /api/tenant/whatsapp/two-step-verification

## Phase 4: Legal Pages

### Privacy Policy Requirements

**Must include a dedicated WhatsApp section** covering:
1. **Data Collection** - Message content, phone numbers, delivery status, business profile info
2. **Purpose** - Customer communication, support, marketing broadcasts (with consent)
3. **Data Sharing** - Transmitted via WhatsApp Cloud API (Meta), encrypted in transit
4. **Data Retention** - Specify retention period, deletion process
5. **User Rights** - Opt-out via keyword, data export, data deletion

### Terms of Service Requirements

**Must include a WhatsApp compliance section** covering:
1. WhatsApp Business Platform policies compliance
2. Anti-spam commitments - Opt-in messaging only
3. Template message approval process
4. Business hours messaging policy
5. User consent and opt-out mechanisms

### Required URLs
- Privacy Policy: `https://yourdomain.com/privacy`
- Terms of Service: `https://yourdomain.com/terms`
- Data Deletion: `https://yourdomain.com/api/webhooks/meta/data-deletion`
- Deauthorize: `https://yourdomain.com/api/webhooks/meta/deauthorize`

## Phase 5: App Review

### Permissions Needed

**whatsapp_business_messaging** (Primary - request first or together):
- Allows sending/receiving WhatsApp messages
- Required for: messaging API, webhooks, templates

**whatsapp_business_management** (Secondary):
- Allows managing WABA settings, phone numbers, templates
- Required for: Embedded Signup, template management, profile management

### Submission Requirements (Per Permission)

1. **Description** - Professional explanation of how the permission is used (see reference/app-review-guide.md)
2. **Screencast Video** - Screen recording showing the feature in action
   - No face required, screen recording only
   - Show the actual API integration working
   - MP4 format, under 50MB
   - Upload via Chrome (Safari/Firefox may have issues)
3. **Data Protection Assessment** - Required questions:
   - Do you use data processors? Yes (list: Supabase Inc., Vercel Inc., Resend Inc.)
   - Responsible entity: Your legal business name
   - Country: Your business country
   - Has your app ever been used to process data for security requests? No
   - Link to data protection policies: Privacy policy URL

### Video Content Guide

**For whatsapp_business_messaging:**
1. Show tenant logging into your platform
2. Navigate to messaging/chat section
3. Show sending a message to a test number
4. Show receiving a reply
5. Show broadcast creation and sending
6. Show template message usage

**For whatsapp_business_management:**
1. Show Embedded Signup flow (client onboarding)
2. Show template creation/management
3. Show profile/settings management
4. Show phone number selection

### Common Rejection Reasons
- Missing privacy policy URL in app settings
- Privacy policy doesn't mention WhatsApp data handling
- Video doesn't clearly show the feature working
- Description is too generic or AI-sounding
- App is not in Live mode

## Phase 6: Business & Tech Provider Verification

### Business Verification
1. Go to Business Settings > Security Center
2. Click "Start Verification"
3. Required documents:
   - Business registration certificate
   - Utility bill or bank statement (for address)
   - Phone number verification
4. Takes 1-5 business days

### Tech Provider Access Verification
1. Go to App Settings > Basic > Access Verification
2. Click "View Details"
3. Fill in business information
4. Verify that your business is authorized to access other businesses' assets
5. Takes up to 5 business days

### Requirements for Tech Provider
- Verified business
- Live app with approved permissions
- Working Embedded Signup integration
- Data deletion and deauthorization callbacks
- Privacy policy and ToS

## Phase 7: Production Hardening

### Token Security
- **Never store tokens in plaintext** - Use AES-256-GCM encryption
- Store encrypted tokens in database, decrypt only when calling API
- Rotate tokens when compromised
- Use System User tokens for permanent access (not temporary user tokens)

### Webhook Security
- **Always verify X-Hub-Signature-256** using HMAC SHA256
- Use timing-safe comparison to prevent timing attacks
- Rate limit webhook endpoints (500/min recommended)
- Set maxDuration for serverless functions (60s recommended)

### Monitoring
- Track Meta rate limits from response headers (x-business-use-case-usage)
- Monitor Graph API version deprecation
- Set up alerts for rate limit warnings (75%) and critical (95%)
- Log all account events (bans, restrictions, quality changes)

### Error Handling
- Map Meta error codes to actionable messages (30+ codes)
- Implement retry logic for retryable errors (rate limits, server errors)
- Exponential backoff: initial 2s, max 3 retries
- Track error patterns for proactive resolution

## Phase 8: Advanced Features (Post-Approval)

### Ice Breakers (Welcome Prompts)
- Push prompts to Meta's Conversational Automation API
- Track clicks per ice breaker in settings JSONB
- See `references/advanced-features.md`

### Automation Engine
- Opt-out/opt-in keyword detection (STOP, UNSUBSCRIBE, START)
- Business hours enforcement with timezone support
- Cooldown mechanism (30 min) to prevent reply spam
- Custom flow engine with triggers and waiting states
- Consent tracking with audit logging

### Messaging Quota System
- Tier-based limits: 250/1K/10K/100K/unlimited per 24 hours
- Pre-broadcast quota validation
- Real-time quota check API endpoint
- See `references/production-monitoring.md`

### Facebook Lead Ads (Optional)
- OAuth flow with signed state for CSRF protection
- Real-time webhook for instant lead notifications
- Field mapping UI for form-to-contact mapping
- Long-lived tokens (60 days) + never-expiring page tokens
- See `references/facebook-leads.md`

### Resumable Upload API
- Required for template media headers (image/video/document)
- Required for profile photo uploads
- **Critical**: Uses `app_id` as upload target, NOT phone_number_id
- See `references/advanced-features.md`

### Conversation Pricing Tracking
- Store pricing category from webhook status events
- Categories: utility, marketing, authentication, service
- Track billable vs free conversations
- See `references/advanced-features.md`

## Middleware Configuration

These routes must bypass authentication:
```
/api/webhooks              # All webhook endpoints
/api/cron                  # All cron jobs
/api/tenant/facebook-ads/callback  # OAuth callback
/privacy                   # Privacy policy page
/terms                     # Terms of service page
```

## Vercel Cron Jobs

```json
{
  "crons": [
    { "path": "/api/cron/meta-monitor", "schedule": "0 8 * * *" },
    { "path": "/api/cron/broadcasts", "schedule": "0 8 * * *" },
    { "path": "/api/cron/cleanup-data", "schedule": "0 3 * * *" }
  ]
}
```

## Reference Files

For detailed code templates and implementation patterns, load these references:

### Core Setup
- `references/whatsapp-api-setup.md` - Step-by-step API configuration, tokens, rate limits
- `references/app-review-guide.md` - Descriptions, video scripts, DPA answers, rejection fixes
- `references/code-templates.md` - Copy-paste code for all 9 core endpoints
- `references/webhook-events.md` - Complete webhook event type reference with TypeScript interfaces
- `references/legal-pages.md` - Privacy policy and ToS templates with WhatsApp sections

### Production & Advanced
- `references/production-monitoring.md` - Rate limit monitoring, alerts, quota system, cron jobs
- `references/facebook-leads.md` - Facebook Lead Ads OAuth, webhooks, field mapping
- `references/advanced-features.md` - Ice breakers, automation engine, Resumable Upload API, pricing tracking

## Checklist

Use this master checklist to track progress:

### App Setup
- [ ] Facebook App created (Business type)
- [ ] WhatsApp product added
- [ ] Facebook Login for Business added
- [ ] Privacy Policy URL set in app settings
- [ ] Terms of Service URL set in app settings
- [ ] App category set to "Business and Pages"
- [ ] App icon uploaded
- [ ] Data Deletion URL set in app settings
- [ ] Deauthorize Callback URL set in Facebook Login settings
- [ ] Environment variables configured (all from Phase 1)

### Core Implementation
- [ ] Webhook handler implemented (GET verification + POST events)
- [ ] Webhook signature verification (HMAC SHA256 + timing-safe)
- [ ] Data deletion callback implemented and registered
- [ ] Deauthorization callback implemented and registered
- [ ] WhatsApp Cloud API client implemented
- [ ] Token encryption implemented (AES-256-GCM)
- [ ] Embedded Signup (client + server) implemented
- [ ] Two-step verification implemented
- [ ] Template management implemented (CRUD + Resumable Upload)
- [ ] Broadcast system implemented
- [ ] Meta error codes mapped (30+ codes)

### Monitoring & Security
- [ ] Rate limit monitoring (header extraction + alerts)
- [ ] Meta monitoring cron job configured
- [ ] Email alerts for rate limit warnings
- [ ] Messaging quota system implemented
- [ ] Webhook rate limiting (500/min)
- [ ] maxDuration set for webhook functions (60s)

### Legal & Compliance
- [ ] Privacy Policy page with dedicated WhatsApp section
- [ ] Terms of Service page with WhatsApp compliance section
- [ ] Opt-out keyword handling (STOP, UNSUBSCRIBE, CANCEL)
- [ ] Consent tracking with audit logging

### Advanced Features
- [ ] Ice Breakers (Conversational Automation API)
- [ ] Business hours automation with timezone support
- [ ] Default reply automation
- [ ] Conversation pricing tracking
- [ ] Middleware public routes configured

### App Review & Verification
- [ ] Screencast videos recorded (one per permission)
- [ ] whatsapp_business_messaging advanced access requested
- [ ] whatsapp_business_management advanced access requested
- [ ] Data Protection Assessment completed
- [ ] Business verification submitted
- [ ] Tech Provider access verification submitted
- [ ] App switched to Live mode
- [ ] Webhook subscriptions verified (all 5 event types)

### Optional: Facebook Lead Ads
- [ ] Facebook Lead Ads OAuth flow implemented
- [ ] Leadgen webhook handler implemented
- [ ] Field mapping configuration UI
- [ ] Lead import to CRM contacts
- [ ] Token refresh/re-auth flow
