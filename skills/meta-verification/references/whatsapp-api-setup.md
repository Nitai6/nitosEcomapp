# WhatsApp Cloud API - Step-by-Step Setup

## 1. Create Facebook App

1. Navigate to https://developers.facebook.com/apps/
2. Click "Create App"
3. Select **Business** as app type
4. Fill in:
   - App name: Your platform name
   - Contact email: Your business email
   - Business Portfolio: Select your verified business
5. Click "Create App"

## 2. Add WhatsApp Product

1. From the app dashboard sidebar, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Select or create a **Meta Business Account** if prompted
4. Select your **WhatsApp Business Account** (or create new)

## 3. Get API Credentials

### From WhatsApp > API Setup:
- **Phone Number ID**: Displayed under "From" phone number
- **WhatsApp Business Account ID**: Shown at top of page
- **Temporary Access Token**: Click "Generate" (expires in 24h)

### From App Settings > Basic:
- **App ID**: Displayed at top
- **App Secret**: Click "Show" (keep secret!)

## 4. Create Permanent Access Token

### Option A: System User Token (Recommended for production)
1. Go to Meta Business Suite > Business Settings
2. Navigate to Users > System Users
3. Create a system user (Admin role)
4. Click "Generate New Token"
5. Select your app
6. Add permissions:
   - whatsapp_business_messaging
   - whatsapp_business_management
7. Set token expiration (never expire for production)
8. Copy and store securely (encrypted!)

### Option B: Page-Level Token
- Only for testing, expires in 60 days

## 5. Configure Webhooks

### In App Dashboard:
1. Go to WhatsApp > Configuration
2. Under Webhooks:
   - **Callback URL**: `https://yourdomain.com/api/webhooks/whatsapp`
   - **Verify Token**: Your chosen secret string (match with WHATSAPP_WEBHOOK_VERIFY_TOKEN env var)
3. Click "Verify and Save"
4. **Subscribe to webhook fields**:
   - messages (required)
   - message_template_status_update (for template approvals)
   - account_update (for ban/restriction alerts)
   - phone_number_quality_update (for quality monitoring)
   - phone_number_name_update (for name change notifications)

### Webhook URL Requirements:
- Must be HTTPS
- Must be publicly accessible
- Must respond to GET verification within 5 seconds
- Must respond to POST events with 200 status quickly

## 6. Register Phone Number

### Using Test Number (Development):
1. WhatsApp > API Setup shows a test phone number
2. Add up to 5 test recipient numbers
3. Can send/receive messages for testing

### Using Real Number (Production):
1. WhatsApp > API Setup > Add Phone Number
2. Enter a phone number you own
3. Verify via SMS or voice call
4. Set display name (requires Meta approval)

## 7. Add Facebook Login for Business

1. Click **Add Product** in sidebar
2. Find **Facebook Login for Business** and click **Set Up**
3. In Settings, configure:
   - **Deauthorize Callback URL**: `https://yourdomain.com/api/webhooks/meta/deauthorize`
4. Create a **Login Configuration**:
   - Go to Facebook Login for Business > Configuration
   - Click "Create"
   - Select permissions: whatsapp_business_management, whatsapp_business_messaging
   - Save and note the **Config ID** (for NEXT_PUBLIC_FB_LOGIN_CONFIG_ID)

## 8. Set App to Live Mode

Before going live:
- [ ] Privacy Policy URL is set and accessible
- [ ] Terms of Service URL is set and accessible
- [ ] Webhook endpoint is deployed and responding
- [ ] Data deletion callback is deployed
- [ ] Deauthorization callback is deployed

Toggle "App Mode" from Development to **Live** in the top bar.

## 9. Graph API Versions

- Always use a recent stable version (e.g., v24.0)
- Meta deprecates old versions ~2 years after release
- Monitor deprecation headers in API responses
- Update version in code before old version is removed
- Base URL: `https://graph.facebook.com/v24.0/`

## 10. Rate Limits

### WhatsApp Cloud API Limits:
- **Messaging**: Based on tier (250/day, 1K, 10K, 100K, unlimited)
- **Template Submission**: 100 templates/hour
- **API Calls**: 200 calls/minute per phone number
- **Media Upload**: 500 per phone number per 24 hours

### Tier Progression:
1. **Unverified**: 250 messages/day to unique users
2. **Tier 1**: 1,000/day (reach after 2 days of quality messaging)
3. **Tier 2**: 10,000/day
4. **Tier 3**: 100,000/day
5. **Unlimited**: No daily limit

### Quality Rating Impact:
- **Green**: High quality, no restrictions
- **Yellow**: Medium quality, messaging limit may decrease
- **Red**: Low quality, risk of messaging restrictions
- **Flagged**: Quality issues detected, needs improvement
