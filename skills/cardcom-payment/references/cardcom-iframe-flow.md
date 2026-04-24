# Cardcom Iframe Payment Flow - Full Reference

## Overview

Users pay via a Cardcom iframe embedded in a modal on the group/product page. After payment, they're redirected to a join/success page where their purchase is activated.

## Flow Diagram

```
Page -> Subscribe API -> PendingPayment (PENDING) + Cardcom URL
                              |
                              v
                  Payment Modal (iframe)
                              |
                    User pays in iframe
                              |
                  +-----------+-----------+
                  |                       |
            Webhook fires           Iframe redirects
            (server-to-server)      to /join/[slug]
                  |                       |
                  v                       v
          Updates PendingPayment    Join page breaks
          to PAID (by claimToken    out of iframe
          OR creates new record)          |
                  |                       v
                  |             from-redirect API
                  |             (marks PENDING -> PAID)
                  |                       |
                  +-----------+-----------+
                              |
                              v
                      Claim API called
                      (creates membership +
                       subscription + payment)
                              |
                              v
                    Redirect to success page
```

## Components

### 1. Subscribe API (`/api/groups/[groupId]/subscribe`)

- Creates a `PendingPayment` record with `claimToken` (UUID)
- Builds Cardcom LowProfile URL with:
  - `Custom1=claimToken` (for webhook lookup)
  - `SuccessRedirectUrl` pointing to join/success page (for iframe-break)
  - `IndicatorUrl` pointing to webhook endpoint
- Sets `claim_token` httpOnly cookie (for join page lookup)
- Returns `{ paymentUrl, paymentToken, claimToken }`

### 2. Payment Modal Component

- Opens Cardcom iframe with the payment URL
- Polls status endpoint every 3 seconds using `claimToken`
- Detects both `"active"` and `"PAID"` statuses as success
- On success: closes modal, redirects to join/success page
- Iframe needs `sandbox="allow-top-navigation"` for iframe-break

### 3. Webhook Handler (`/api/webhooks/cardcom/external-payment`)

- Receives payment confirmation from Cardcom (server-to-server)
- Reads `Custom1` from payload as `claimToken`
- **Token flow**: Finds PendingPayment by claimToken, marks PAID
- **Direct flow**: If no token match, creates a new PAID record
- Static Cardcom pages may NOT pass Custom1 back to webhook

### 4. From-Redirect API (`/api/pending-payments/from-redirect`)

- Called by join page when URL has `internaldealNumber`
- Finds PendingPayment by: transactionId -> cookie -> userId -> any for group
- Updates PENDING record to PAID with transactionId
- Returns `{ status, claimToken }` and sets cookie

### 5. Join/Success Page

- Breaks out of iframe: `window.top.location.href = window.location.href`
- If `internaldealNumber` in URL: calls from-redirect, then inline claim
- If no params: checks status via cookie, polls if PENDING
- PENDING polling fallback: After ~6 seconds, tries claiming with email fallback
- Auto-claims when status is PAID and user is authenticated

### 6. Claim API (`/api/pending-payments/claim`)

- Finds PAID PendingPayment by: claimToken -> userId -> email -> any for group
- If claimToken finds PENDING, falls through to search PAID records via email
- Creates: membership + subscription + payment records
- Marks PendingPayment as CLAIMED

## Database: PendingPayment Model

### Schema

```prisma
model PendingPayment {
  id              String   @id @default(cuid())
  groupId         String
  userId          String?
  email           String
  planId          String?
  amount          Float
  currency        String   @default("ILS")
  status          PendingPaymentStatus @default(PENDING)
  claimToken      String   @unique @default(uuid())
  transactionId   String?  @unique
  cardcomDealId   String?
  providerData    Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum PendingPaymentStatus {
  PENDING
  PAID
  CLAIMED
  EXPIRED
}
```

### Lifecycle

```
PENDING  ->  PAID  ->  CLAIMED
   |           ^          ^
   |           |          |
   |     webhook or    claim API
   |     from-redirect
   v
EXPIRED (after 7 days)
```

## Cookie: `claim_token`

- Set by: subscribe API and from-redirect API
- HttpOnly, Secure (production), SameSite=Lax, Path=/
- Max age: 7 days
- Used by: status API, claim API, from-redirect API

## Cardcom API Reference

### LowProfile (Payment Page) Creation

```
POST https://secure.cardcom.solutions/api/v11/LowProfile/Create
Content-Type: application/json
```

Key fields:
- `TerminalNumber` - Cardcom terminal number
- `ApiName` - API username
- `Amount` - Payment amount
- `Currency` - 1 for ILS, 2 for USD
- `SuccessRedirectUrl` - Where iframe redirects after payment
- `IndicatorUrl` - Webhook URL for server-to-server notification
- `Custom1` - Custom field passed to webhook (use for claimToken)
- `MaxNumberOfPayments` - Max installment payments allowed
- `IsCreateRecurringPayment` - true for subscription payments
- `RecurringPayments.ChargeEveryXDays` - Recurring interval in days

### Recurring Charge Cancellation (Name-to-Value Interface)

Cardcom does NOT have a REST endpoint for cancelling recurring charges. Use the Name-to-Value interface:

```
POST https://secure.cardcom.solutions/interface/RecurringPayment.aspx
Content-Type: application/x-www-form-urlencoded
```

Parameters:

| Parameter | Value | Description |
|---|---|---|
| `TerminalNumber` | e.g. `179074` | Terminal number |
| `UserName` | API username | Same as `ApiName` |
| `codepage` | `65001` | Unicode encoding |
| `Operation` | `Update` | Update existing recurring |
| `RecurringPayments.RecurringId` | e.g. `20037` | Recurring charge ID |
| `RecurringPayments.IsActive` | `false` | Disables the charge |

Response is Name=Value pairs (NOT JSON):
```
ResponseCode=0&Description=OK&TotalRecurring=1&...
```
`ResponseCode=0` means success.

### Test Credentials

- Terminal: `1000`
- Username: `test2025`
- Password: `test5000$`

## Known Gotchas

### Static Cardcom pages don't pass Custom1 to webhook

Static pages configured in Cardcom's dashboard may ignore URL params like `Custom1`. The webhook then creates a separate PAID record with no claimToken link to the PENDING record.

**Solution**: The claim API searches for any PAID record for the group when the token-based lookup finds a PENDING record. The join page also tries claiming during PENDING polling.

### Iframe-break timing

When Cardcom redirects the iframe, the join page runs inside the iframe first, then breaks out. This causes the page to load twice. Use a `redirectHandled` ref to prevent duplicate from-redirect calls.

### Race condition: webhook vs from-redirect

Both the webhook and from-redirect can process the same payment. Handle via:
- Unique constraint on `transactionId`
- Try-catch with re-fetch on conflict
- Idempotent status transitions (PENDING -> PAID is safe to retry)

### Two success paths after payment

1. **Iframe-break**: Cardcom redirects iframe to join page with `internaldealNumber` param. Uses from-redirect flow.
2. **Modal polling**: Modal detects PAID status, redirects to join page without params. Uses cookie-based status check.

Both paths converge on the claim API.

### Currency codes

Cardcom uses numeric currency codes: 1 = ILS, 2 = USD, 3 = EUR, 4 = GBP.

### Webhook payload normalization

Cardcom webhook payloads vary between LowProfile and static page configurations. Always normalize the payload to extract consistent fields: `transactionId`, `dealId`, `amount`, `email`, `custom1`.
