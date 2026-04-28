# Legal Pages - Privacy Policy & Terms of Service Templates

## Privacy Policy - WhatsApp Section

This section must be added to your privacy policy. It can be a dedicated section or integrated throughout.

### Template: WhatsApp Business Platform Data Section

```
## WhatsApp Business Platform Data

Our platform integrates with the WhatsApp Business API (Cloud API) provided by
Meta Platforms, Inc. to enable business messaging capabilities. This section
describes how we handle data in connection with WhatsApp services.

### Data We Collect Through WhatsApp

When you or your customers interact through WhatsApp via our platform, we
collect and process:

- **Message Content**: Text messages, images, videos, documents, voice messages,
  and other media exchanged between businesses and their customers
- **Contact Information**: Phone numbers, WhatsApp display names, and profile
  pictures of message participants
- **Message Metadata**: Delivery timestamps, read receipts, message status
  (sent, delivered, read, failed), and conversation categories
- **Business Profile Data**: Business name, description, address, email,
  website, profile photo, and industry category
- **Template Data**: Message templates, their approval status, and usage metrics
- **Account Data**: WhatsApp Business Account identifiers, phone number quality
  ratings, and messaging tier information

### How We Use WhatsApp Data

We use WhatsApp data exclusively for the following purposes:

- Delivering messages between businesses and their customers
- Displaying conversation history in the business dashboard
- Tracking message delivery status and read receipts
- Managing message templates and broadcast campaigns
- Monitoring account health (quality ratings, messaging limits)
- Providing customer support and troubleshooting
- Generating messaging analytics and reports for businesses
- Enforcing opt-out preferences and consent management

### Data Sharing and Transmission

WhatsApp messages are transmitted through Meta's WhatsApp Cloud API. When a
message is sent or received:

- Message content passes through Meta's infrastructure as required by the
  WhatsApp Cloud API
- We store message content and metadata in our encrypted database
- We do not sell, rent, or share WhatsApp message data with third parties
  for advertising or marketing purposes
- Our data processors (hosting and infrastructure providers) may process data
  as described in the Data Processors section

### Data Retention

- Active conversation data is retained for the duration of the business
  account's subscription
- Message content and metadata are retained for [X months/years] after the
  last interaction
- Upon account deletion or subscription cancellation, WhatsApp data is
  permanently deleted within [30] days
- Users can request immediate deletion of their data by contacting us at
  [email]

### Opt-Out and Consent

- Customers can opt out of receiving messages by sending keywords such as
  "STOP", "UNSUBSCRIBE", or "CANCEL"
- Opted-out contacts are added to a suppression list and will not receive
  further messages
- Businesses using our platform are required to obtain proper consent before
  sending marketing messages
- Customers can request their data be deleted by contacting the business
  directly or by reaching out to us

### Security Measures

- WhatsApp access tokens are encrypted at rest using AES-256-GCM encryption
- All communication with WhatsApp APIs occurs over HTTPS/TLS
- Webhook payloads are verified using HMAC SHA-256 signatures
- Access to WhatsApp data is restricted through role-based access controls
```

### Required Privacy Policy Elements (Non-WhatsApp)

In addition to the WhatsApp section, your privacy policy must include:

1. **Introduction** - Who you are, what the policy covers
2. **Information We Collect** - All data types (account, usage, etc.)
3. **How We Use Information** - All purposes
4. **Data Sharing** - Who you share with and why
5. **Data Processors** - List: Supabase, Vercel, Resend, etc.
6. **Data Security** - Encryption, access controls
7. **Data Retention** - How long you keep data
8. **User Rights** - Access, deletion, portability (GDPR if applicable)
9. **Cookies** - If you use them
10. **International Data Transfers** - If applicable
11. **Children's Privacy** - COPPA compliance
12. **Changes to Policy** - How you notify users
13. **Contact Information** - Email for privacy inquiries

### Contact Emails to Set Up
- `privacy@yourdomain.com` - For privacy inquiries
- `legal@yourdomain.com` - For legal/ToS inquiries
- `support@yourdomain.com` - For general support

---

## Terms of Service - WhatsApp Section

### Template: WhatsApp Business Platform Compliance Section

```
## WhatsApp Business Platform Compliance

By using our platform's WhatsApp integration, you agree to comply with the
following:

### WhatsApp Business Policy
You must comply with WhatsApp's Business Messaging Policy and Commerce Policy
at all times. This includes but is not limited to:

- Only sending messages to users who have opted in to receive communications
- Not sending spam, bulk unsolicited messages, or abusive content
- Respecting the 24-hour customer service window for non-template messages
- Using approved message templates for business-initiated conversations
- Not attempting to circumvent WhatsApp's policies or technical restrictions

### Message Templates
- All outbound business-initiated messages must use Meta-approved templates
- You are responsible for ensuring template content complies with WhatsApp
  policies
- We reserve the right to remove templates that violate policies
- Template approval is at Meta's sole discretion

### Opt-Out Compliance
- You must honor all opt-out requests immediately
- You must not send messages to contacts who have opted out
- Our platform automatically processes standard opt-out keywords
- You must not attempt to circumvent opt-out mechanisms

### Data Handling
- You are responsible for having a legal basis to contact each recipient
- You must comply with applicable data protection laws (GDPR, CCPA, etc.)
- You must not use WhatsApp data for purposes other than those described
  in your privacy policy
- Customer data processed through WhatsApp remains subject to our Privacy
  Policy and Data Processing Agreement

### Prohibited Uses
You must not use our WhatsApp integration to:
- Send messages promoting illegal activities
- Distribute malware, phishing, or deceptive content
- Impersonate other businesses or individuals
- Send messages in violation of any applicable law or regulation
- Exceed messaging limits or abuse the platform
- Share or sell WhatsApp user data to third parties

### Account Suspension
We may suspend or terminate your WhatsApp integration if:
- Meta restricts or bans your WhatsApp Business Account
- Your messaging quality rating drops to unacceptable levels
- You violate WhatsApp's policies or our Terms of Service
- We receive complaints about your messaging practices
```

### Required Terms of Service Elements (Non-WhatsApp)

1. **Acceptance of Terms** - Agreement by using the service
2. **Description of Service** - What your platform does
3. **Account Registration** - Requirements and responsibilities
4. **Acceptable Use** - General usage rules
5. **Payment and Billing** - If applicable
6. **Service Availability** - Uptime expectations, no guarantees
7. **Intellectual Property** - Ownership of platform and content
8. **Limitation of Liability** - Standard limitations
9. **Termination** - How either party can end the relationship
10. **Governing Law** - Jurisdiction
11. **Changes to Terms** - How you update terms
12. **Contact Information** - Legal contact

---

## Where to Register URLs in Meta Dashboard

| URL | Register Location |
|-----|-------------------|
| Privacy Policy | App Settings > Basic > Privacy Policy URL |
| Terms of Service | App Settings > Basic > Terms of Service URL |
| Data Deletion | App Settings > Basic > Data Deletion Instructions URL |
| Deauthorize Callback | Facebook Login for Business > Settings > Deauthorize Callback URL |

## Bilingual Support (Hebrew + English)

If your platform serves Hebrew-speaking users:
- Create both /privacy and /terms pages
- Include language toggle (EN/HE) on each page
- Both languages should contain identical information
- RTL layout for Hebrew version
- Meta reviewers will see the English version (set English as primary)
