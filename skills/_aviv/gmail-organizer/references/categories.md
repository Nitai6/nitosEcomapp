# Gmail Organizer - Category Definitions

This file defines the categories used for email classification. Read during classification to determine how to label each email.

## Categories

### Invoices
Bills, payment requests, invoice attachments, subscription charges, utility bills.
- Keywords: invoice, bill, payment due, amount due, charge
- Senders: utilities, SaaS providers, service providers, ISPs
- Priority: if an email is both a receipt AND an invoice, classify as Invoices

### Receipts
Purchase confirmations, order confirmations, payment confirmations, donation receipts.
- Keywords: receipt, order confirmed, payment received, thank you for your purchase
- Senders: stores, e-commerce, payment processors

### Work
Professional communication, client emails, project updates, freelance inquiries, job-related.
- Keywords: meeting, project, deadline, proposal, contract
- Context: anything related to professional/business communication

### Personal
Friends, family, personal conversations, personal appointments.
- Context: non-commercial, non-automated emails from individuals

### Newsletters
Subscribed newsletters, content digests, blog updates, weekly roundups, curated content.
- Keywords: newsletter, digest, weekly, roundup, unsubscribe
- Pattern: usually has "unsubscribe" link, sent from known content platforms

### Finance
Bank statements, credit card alerts, investment updates, tax documents, financial summaries.
- Keywords: statement, balance, transaction, transfer, tax
- Senders: banks, credit card companies, investment platforms

### Travel
Flight confirmations, hotel bookings, travel itineraries, car rentals, visa info.
- Keywords: booking, itinerary, flight, hotel, reservation, check-in
- Senders: airlines, booking platforms, hotels

### Shopping
Shipping updates, delivery notifications, tracking info, product recommendations from stores the user bought from.
- Keywords: shipped, delivered, tracking, out for delivery
- Senders: Amazon, eBay, AliExpress, retail stores

### Notifications
App notifications, social media alerts, system notifications, security alerts, two-factor codes, password resets, account alerts.
- Keywords: notification, alert, verify, security code, sign-in
- Senders: social platforms, apps, services

### Promotions/Junk
Marketing emails, unsolicited promotions, sales campaigns, discount offers, spam-adjacent content.
- Keywords: sale, discount, offer, limited time, exclusive deal
- NEVER auto-process these - always present to user for review

### Unsorted
Anything ambiguous or not clearly fitting one category. When in doubt, use Unsorted rather than guessing.

## Priority Rules

When an email could fit multiple categories, use these rules:

1. Invoice from a shopping site (e.g. Amazon invoice) = **Invoices**, not Shopping
2. Receipt from a bank = **Receipts**, not Finance
3. Shipping notification for an order = **Shopping**, not Notifications
4. Newsletter from a financial service = **Newsletters**, not Finance
5. Security alert from a bank = **Notifications**, not Finance
6. When genuinely ambiguous, use **Unsorted**
