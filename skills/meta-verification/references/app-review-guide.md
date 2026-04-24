# Meta App Review - Complete Guide

## Overview

App Review is required to get **Advanced Access** for WhatsApp permissions. Without it, you can only message test numbers (up to 5) in development mode.

## Permissions to Request

### whatsapp_business_messaging
- **What it does**: Send/receive WhatsApp messages, manage templates, handle webhooks
- **When needed**: Any WhatsApp messaging functionality

### whatsapp_business_management
- **What it does**: Manage WABAs, phone numbers, templates, Embedded Signup
- **When needed**: Multi-tenant platforms (Tech Providers), template management, Embedded Signup

## Pre-Submission Checklist

- [ ] App is set to **Live** mode
- [ ] **Privacy Policy URL** is set in App Settings > Basic
- [ ] **Terms of Service URL** is set in App Settings > Basic
- [ ] Privacy policy has a **dedicated WhatsApp data section**
- [ ] **App category** set to "Business and Pages" (not "Messenger Bots")
- [ ] **App icon** uploaded (1024x1024)
- [ ] All required API endpoints are deployed and working
- [ ] Business verification is submitted (not necessarily approved yet)

## Permission Descriptions

### whatsapp_business_messaging - Sample Description

```
Our platform, [APP_NAME], is a customer communication solution built for small
and medium businesses. We use the WhatsApp Business API to help our clients
manage their customer interactions in one place.

Here is how we use whatsapp_business_messaging:

- Receiving incoming messages: When a customer sends a WhatsApp message to one
  of our clients' business numbers, our webhook receives it and displays it in
  the client's dashboard. The client can then reply directly from our platform.

- Sending replies and notifications: Clients send text messages, images, and
  documents back to their customers through our interface. We use template
  messages for notifications like order confirmations and appointment reminders.

- Template messages: We allow clients to create, submit, and manage message
  templates. Once approved by Meta, these templates are used for outbound
  notifications and marketing broadcasts (only to opted-in contacts).

- Message status tracking: We track delivery and read receipts to show clients
  whether their messages were delivered and read.

- Opt-out handling: We automatically process opt-out keywords (like "STOP") and
  maintain a suppression list to respect user preferences.

All messaging complies with WhatsApp's Business Messaging Policy. We only send
messages to users who have opted in, and we provide clear opt-out mechanisms.
Our privacy policy details how WhatsApp data is collected, used, and stored.
```

### whatsapp_business_management - Sample Description

```
Our platform, [APP_NAME], operates as a WhatsApp Tech Provider - we help
businesses connect and manage their WhatsApp Business accounts through our
multi-tenant SaaS platform.

Here is how we use whatsapp_business_management:

- Embedded Signup: New clients connect their WhatsApp Business Account to our
  platform through Facebook's Embedded Signup flow. This lets them authorize
  our app to manage messaging on their behalf without manual API credential
  setup.

- Template management: We provide an interface for clients to create, edit,
  and monitor message templates. Clients can see template approval status,
  pause active templates, and delete unused ones - all from our dashboard.

- Phone number management: After a client completes Embedded Signup, we read
  their phone number details (display name, quality rating, messaging tier)
  to show account health in the dashboard.

- Business profile management: Clients can update their WhatsApp business
  profile (about text, address, email, website, profile photo) directly from
  our settings page.

- Account monitoring: We monitor account health events (quality rating changes,
  messaging limit updates, name approval status) and alert clients when action
  is needed.

This permission is essential for our Tech Provider functionality - it allows
businesses to onboard via Embedded Signup and manage their WhatsApp presence
through our platform. Our privacy policy and terms of service detail our data
handling practices.
```

## Screencast Video Guide

### General Requirements
- **Format**: MP4, under 50MB
- **No face required** - screen recording only
- **Show the actual feature working** - not mockups or slides
- **Use a test phone number** - don't show real customer data
- **Upload via Chrome** - Safari/Firefox may have upload issues
- **Alternative**: Upload to YouTube (unlisted) and paste the link

### Video Script: whatsapp_business_messaging (2-3 minutes)

1. **Open browser, log into your platform** (5s)
2. **Navigate to the chat/messaging section** (5s)
3. **Show sending a text message** to a test contact (15s)
   - Type a message, click send, show it in the chat
4. **Show the message being delivered** - show delivery/read receipts (10s)
5. **Show receiving an incoming message** - send from your phone to the business number (15s)
6. **Show sending a media message** - attach an image or document (15s)
7. **Navigate to Templates section** (5s)
8. **Show template creation** - create a simple template with variables (20s)
9. **Navigate to Broadcasts section** (5s)
10. **Show broadcast creation** - select audience, choose template, send (20s)
11. **Show broadcast delivery stats** - delivered/read/failed counts (10s)
12. **Show opt-out handling** - demonstrate keyword opt-out if possible (10s)

### Video Script: whatsapp_business_management (2-3 minutes)

1. **Show Embedded Signup flow** (30s)
   - Click "Connect WhatsApp" button
   - Show Facebook Login dialog
   - Show WABA selection
   - Show successful connection
2. **Show template management** (30s)
   - List existing templates with statuses
   - Create a new template
   - Show template approval status
3. **Show profile settings** (20s)
   - Edit business profile (about, address, etc.)
   - Upload profile photo
4. **Show account health monitoring** (20s)
   - Quality rating display
   - Messaging tier info
   - Phone number status

## Data Protection Assessment (DPA)

### Questions and Recommended Answers

**Q: Does this app use a data processor to process personal data?**
A: **Yes**

**Q: List your data processors:**
Add each processor separately:
1. **Supabase Inc.** - Database hosting and authentication
   - Address: 970 Toa Payoh North, #07-04, Singapore 318992 (or current HQ)
2. **Vercel Inc.** - Application hosting and serverless functions
   - Address: 440 N Barranca Ave #4133, Covina, CA 91723, USA
3. **Resend Inc.** - Email delivery service (if used for alerts/notifications)
   - Address: 2261 Market Street #5039, San Francisco, CA 94114, USA

**Note**: Do NOT add Meta as a processor - Meta is a joint controller, not your processor.

**Q: Name of the responsible entity for data protection:**
A: Your registered legal business name

**Q: Country:**
A: Country where your business is registered

**Q: Has your app been used to process data in connection with security requests?**
A: **No** (unless it actually has)

**Q: Link to data protection / privacy policies:**
A: `https://yourdomain.com/privacy`

## Common Rejection Reasons & Fixes

| Rejection Reason | Fix |
|---|---|
| Privacy policy doesn't mention WhatsApp | Add dedicated WhatsApp data handling section |
| Video doesn't show feature clearly | Re-record with clear feature demonstration |
| Description is too generic | Be specific about HOW you use each permission |
| App not in Live mode | Toggle to Live in app dashboard |
| Missing required app settings | Set privacy policy URL, ToS URL, app icon |
| Business not verified | Submit business verification (can be parallel) |
| Description sounds AI-generated | Rewrite in a natural, conversational tone |
| Missing opt-out mechanism | Implement keyword opt-out (STOP, etc.) |

## After Approval

Once permissions are approved:
1. You can message any phone number (not just test numbers)
2. Your messaging tier will start at the lowest level
3. Send quality messages to progress through tiers
4. Monitor quality rating in WhatsApp Manager
5. If you haven't already, complete Tech Provider enrollment
