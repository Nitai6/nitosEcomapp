# Cancellation & Refund Policy Template (מדיניות ביטולים והחזרים)

Israeli Consumer Protection Law 5741-1981 + Cancellation Regulations 5771-2010 compliant.

## Page Metadata

```tsx
export const metadata: Metadata = {
  title: "מדיניות ביטולים והחזרים | {BRAND}",
  description: "מדיניות ביטול עסקאות והחזרים כספיים בפלטפורמת {BRAND}",
};
```

## Required Sections

### 1. זכות ביטול עסקת מכר מרחוק (סעיף 14ג)

- Online purchase = **remote transaction** per Consumer Protection Law
- Cancel within **14 days** from purchase OR written confirmation (whichever is **later**)
- Must be at least **7 non-rest days** before service starts

### 2. תוכן דיגיטלי — חריג (Section 14g(d))

**This is the most legally important section.**

- Digital content (recorded courses, video lessons, downloadable materials) = "information" per Computer Law 5755-1995
- Per Section 14g(d)(2) + Regulation 6(a): **cancellation right does NOT apply** to accessed digital content
- Can cancel within 14 days **IF no access** yet
- **"Access" includes:** watching a lesson, playing a video, downloading material, any content use

Summary table:

| Situation | Refund Eligibility |
|-----------|-------------------|
| Within 14 days, **before** access | Eligible (minus cancellation fee) |
| Within 14 days, **after** access | Not eligible |
| After 14 days | Not eligible |

### 3. מנויים מתמשכים (עסקה מתמשכת)

- Monthly community subscription = ongoing transaction
- Cancel **anytime** via: website button (Settings > Subscriptions), email, phone, or oral notice
- Effective within **3 business days** (6 if registered mail)
- No refund for already-paid period with access
- Access continues until end of paid period
- Written confirmation (email) sent on cancellation

### 4. דמי ביטול

**Legal cap:**
> 5% ממחיר העסקה או 100 ₪ — **הנמוך** מביניהם

- Deducted from refund amount
- **Fee waived** when: defect, mismatch with description, non-delivery, business breach

### 5. אוכלוסיות מיוחדות — זכויות מורחבות

Eligible groups:
- **אזרחים ותיקים** (seniors, 65+)
- **אנשים עם מוגבלות** (persons with disabilities)
- **עולים חדשים** (new immigrants, within 5 years of aliyah)

Rights:
- **4-month** cancellation window from purchase
- Must still be 7 days before service starts
- Same 5%/100 NIS fee
- May be asked for supporting documentation

### 6. אופן הגשת בקשת ביטול

**All channels required by law:**
- **Website:** Settings > Subscriptions > "Request Refund" button
- **Email:** support@{domain}
- **Oral notice:** Allowed per law

### 7. החזר כספי — לוח זמנים

- Refund within **14 days** of cancellation notice
- Returns to **original payment method**
- Ongoing subscription: refund for **unused period only**, minus cancellation fee

### 8. חריגים — החזר מלא ללא דמי ביטול

Full refund (no fee) when:
- **Service defect:** Content not working, recurring technical errors
- **Mismatch:** Content materially different from description at purchase
- **Non-delivery:** Service not provided in reasonable time
- **Legal breach:** Business violated Consumer Protection Law

### 9. יצירת קשר

- Email: support@{domain}

**Footer note:**
> מדיניות זו כפופה לחוקי מדינת ישראל. במקרה של סתירה בין מדיניות זו לבין הוראות חוק קוגנטיות, הוראות החוק יגברו.

Link to Terms of Service.

## Refund System Implementation Notes

If implementing a refund request system:

### Eligibility Calculation Logic

```typescript
// Standard window: 14 days from purchase
const standardDeadline = addDays(purchaseDate, 14);

// Special populations: 4 months (120 days)
const specialDeadline = addDays(purchaseDate, 120);

// Cancellation fee: min(price * 0.05, 100) in NIS
const cancellationFee = Math.min(priceInNIS * 0.05, 100);

// Digital content: check if any course progress exists
const hasAccessedContent = courseProgress.length > 0;
// If accessed → no refund regardless of window
```

### Refund Request Data Model

```prisma
model RefundRequest {
  id              String   @id @default(cuid())
  subscriptionId  String
  userId          String
  reason          String
  status          RefundStatus @default(PENDING) // PENDING, APPROVED, REJECTED, PROCESSED
  amount          Int      // in agorot (divide by 100 for NIS display)
  createdAt       DateTime @default(now())
  processedAt     DateTime?
}
```

### Admin Workflow

1. User submits refund request (reason required)
2. System calculates eligibility (window, digital access, special population)
3. Admin reviews and approves/rejects
4. On approval: process refund via payment provider
5. Track status throughout
