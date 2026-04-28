---
name: cardcom-payment
description: Implement Cardcom iframe payment flows in Next.js projects. Use when integrating Cardcom payments, building payment modals with iframe checkout, handling Cardcom webhooks, managing recurring charges, or debugging Cardcom payment issues. Covers the full lifecycle - PendingPayment records, iframe-break patterns, webhook handling, claim flow, and recurring cancellation via Name-to-Value API.
---

# Cardcom Iframe Payment Integration

## Overview

This skill provides a battle-tested pattern for integrating Cardcom (Israeli payment processor) into Next.js applications using an iframe-based checkout flow. It covers the full payment lifecycle: creating payment intents, embedding the Cardcom iframe in a modal, handling webhooks and redirects, claiming payments, and managing recurring charges.

For detailed API reference, flow diagrams, and known gotchas, read `references/cardcom-iframe-flow.md`.

## When to Use

- Setting up Cardcom payments in a new Next.js project
- Adding subscription/recurring payment support with Cardcom
- Building a payment modal with iframe checkout
- Implementing webhook handlers for Cardcom
- Cancelling or managing Cardcom recurring charges
- Debugging Cardcom payment flow issues

## Architecture Overview

The payment flow uses a **PendingPayment record pattern** with dual success paths:

```
Subscribe API -> PendingPayment (PENDING) -> Cardcom iframe modal
                                                    |
                              +---------------------+---------------------+
                              |                                           |
                        Webhook (server-to-server)              Iframe-break redirect
                        marks PAID                              marks PAID
                              |                                           |
                              +---------------------+---------------------+
                                                    |
                                              Claim API
                                    (creates membership/subscription)
                                                    |
                                              CLAIMED status
```

## Implementation Steps

### Step 1: Database Model

Create a `PendingPayment` model with these essential fields:
- `claimToken` (unique UUID) - links the payment intent to the webhook/redirect
- `status` enum: PENDING -> PAID -> CLAIMED (+ EXPIRED)
- `transactionId` (unique, nullable) - Cardcom's transaction ID, set on payment
- `email`, `amount`, `currency` - payment details
- Group/product reference fields as needed

### Step 2: Subscribe API

Create an API route that:
1. Creates a PendingPayment record with a generated `claimToken`
2. Calls Cardcom LowProfile Create API to get a payment page URL
3. Passes `claimToken` as `Custom1` parameter (for webhook lookup)
4. Sets `SuccessRedirectUrl` to a join/success page
5. Sets `IndicatorUrl` to the webhook endpoint
6. Sets an httpOnly `claim_token` cookie
7. Returns `{ paymentUrl, claimToken }`

**Cardcom LowProfile Create endpoint:**
```
POST https://secure.cardcom.solutions/api/v11/LowProfile/Create
```

Key params: `TerminalNumber`, `ApiName`, `Amount`, `Currency` (1=ILS, 2=USD), `SuccessRedirectUrl`, `IndicatorUrl`, `Custom1`, `MaxNumberOfPayments`, `IsCreateRecurringPayment`, `RecurringPayments.ChargeEveryXDays`

### Step 3: Payment Modal Component

Build a modal that:
1. Opens the Cardcom URL in an iframe
2. Sets iframe `sandbox="allow-top-navigation"` for iframe-break support
3. Polls a status endpoint every 3 seconds using the `claimToken`
4. Closes and redirects on PAID status detection

### Step 4: Webhook Handler

Create a webhook endpoint that:
1. Receives POST from Cardcom (server-to-server, no auth headers)
2. Extracts `Custom1` (claimToken) from the payload
3. **Token flow**: Finds PendingPayment by claimToken, updates to PAID
4. **Fallback flow**: If no token match, creates a new PAID record (handles static Cardcom pages that don't pass Custom1)
5. Stores `transactionId` on the record

### Step 5: From-Redirect Handler

Create an API that handles the iframe-break redirect:
1. Receives `internaldealNumber` from Cardcom's redirect URL params
2. Finds PendingPayment by: transactionId -> cookie -> userId -> any for group
3. Updates PENDING to PAID with the transactionId
4. Returns status and sets the claim cookie

### Step 6: Join/Success Page

Build a page that:
1. Breaks out of iframe: `window.top.location.href = window.location.href`
2. If URL has `internaldealNumber`: calls from-redirect, then claim
3. If no params: polls status via cookie, claims when PAID
4. Use a `redirectHandled` ref to prevent duplicate calls (page loads twice due to iframe-break)

### Step 7: Claim API

Create an endpoint that:
1. Finds PAID PendingPayment by: claimToken -> userId -> email -> any for group
2. Creates the actual records (membership, subscription, payment)
3. Marks PendingPayment as CLAIMED
4. Handles the case where token finds PENDING but email finds a separate PAID record (static page gotcha)

## Recurring Charge Cancellation

Cardcom does NOT have a REST endpoint for cancelling recurring charges. Use the Name-to-Value interface:

```
POST https://secure.cardcom.solutions/interface/RecurringPayment.aspx
Content-Type: application/x-www-form-urlencoded

TerminalNumber={terminal}&UserName={apiName}&codepage=65001&Operation=Update&RecurringPayments.RecurringId={recurringId}&RecurringPayments.IsActive=false
```

Response is Name=Value pairs (NOT JSON). `ResponseCode=0` means success.

Store the recurring ID from the initial payment webhook on the Subscription record.

## Critical Gotchas

1. **Static Cardcom pages don't pass Custom1** - Always implement fallback lookup by email/userId in the claim API
2. **Iframe-break causes double page load** - Use a ref guard to prevent duplicate API calls
3. **Webhook vs redirect race condition** - Use unique constraint on `transactionId` + try-catch with re-fetch
4. **Currency codes are numeric** - 1=ILS, 2=USD, 3=EUR, 4=GBP
5. **Recurring cancel is NOT REST** - Must use Name-to-Value interface at `RecurringPayment.aspx`
6. **Webhook payloads vary** - Normalize payloads from different Cardcom page types into consistent fields
7. **Test credentials** - Terminal: `1000`, Username: `test2025`, Password: `test5000$`

## Environment Variables

```env
# Cardcom credentials
CARDCOM_TERMINAL_NUMBER=
CARDCOM_API_NAME=
CARDCOM_API_PASSWORD=

# For multi-tenant (credentials per group/merchant)
PAYMENT_CREDENTIALS_KEY=  # Encryption key for storing merchant credentials in DB
```

## Resources

- `references/cardcom-iframe-flow.md` - Full flow reference with diagrams, DB schema, API details, and all known gotchas
- Cardcom API docs: https://cardcomapinametovalue.zendesk.com/hc/he/articles/27008148287634
