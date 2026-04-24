# Privacy Policy Template (מדיניות פרטיות)

Israeli Privacy Protection Law 5741-1981 + Amendment 13 (August 2025) compliant.

## Page Metadata

```tsx
export const metadata: Metadata = {
  title: "מדיניות פרטיות | {BRAND}",
  description: "מדיניות הפרטיות של פלטפורמת {BRAND} - הגנה על המידע האישי שלך",
};
```

## Required Sections

### 1. מידע שאנו אוספים

Must list ALL data types collected. Common categories:

**מידע שאתה מספק (User-provided):**
- Name, email, password (encrypted), username, profile image, bio, phone (optional)

**מידע שימוש ופעילות (Usage data):**
- Posts, comments, likes, mentions, poll votes, exam results, event RSVPs
- Direct messages between users
- Course progress, lesson completions
- Gamification: points, levels, badges, streaks, activity heatmap, leaderboard rank

**מידע תשלומים (Payment data):**
- Transaction details, subscriptions, refund requests
- Processed via payment provider — NEVER store credit card numbers

**מידע טכני (Technical data):**
- IP address, browser type, OS, device identifiers

**העדפות ותצורה (Preferences):**
- Notification preferences, accessibility settings, cookie consent, theme preference

### 2. הבסיס החוקי לעיבוד המידע

**Amendment 13 requires explicit legal basis.** Must include all 4:

- **הסכמה (Consent):** Registration = consent. Can withdraw via privacy settings.
- **קיום חוזה (Contract):** Processing needed for service delivery (account, communities, courses, events, DMs).
- **אינטרס לגיטימי (Legitimate interest):** Service improvement, security, abuse prevention — proportionate.
- **חובה חוקית (Legal obligation):** Tax records, court orders.

### 3. כיצד אנו משתמשים במידע

Must cover:
- Service delivery (account, communities, courses, events, content)
- Direct messaging management
- User experience personalization
- Gamification system management (points, levels, badges, streaks, leaderboard)
- Real-time notifications (likes, comments, mentions, events, messages, course updates)
- Event management and reminders
- Payment processing, subscriptions, coupons, refund handling
- Security and abuse prevention
- Legal compliance

### 4. שיתוף מידע עם צדדים שלישיים

**Critical: state "we do NOT sell personal data"**

Must disclose:
- **Community managers:** See member info (name, image, activity, points, level)
- **Other users:** Public profile data (name, image, bio, badges, completed courses, activity heatmap)
- **Service providers:** List each one:
  - Payment provider (e.g., CardCom) — payment processing
  - Hosting (e.g., Vercel) — website hosting
  - File uploads (e.g., UploadThing) — file/image uploads
  - Email providers — system notifications
- **Third-party integrations (admin-configured):**
  - Zoom — online meeting creation for events
  - Google Meet — online meeting creation for events
  - WhatsApp Business API — community messages
- **Legal requirement:** Court orders, law enforcement

### 5. העברת מידע לחו״ל

- Some providers store data outside Israel (EU, USA)
- Safeguards: recognized protection level, contractual agreements, provider security audits

### 6. אבטחת מידע

- bcrypt password encryption
- HTTPS/TLS everywhere
- Secure WebSocket connections for real-time features
- Role-based access control
- Periodic security audits
- Disclaimer: no method is 100% secure

### 7. הודעה על אירוע אבטחה (Amendment 13 REQUIRED)

- Report to Privacy Protection Authority ASAP
- Notify affected users by email (description, data exposed, steps taken)
- Take all actions to minimize damage and prevent recurrence

### 8. שמירת מידע

Must specify retention per data type:
- **Account details:** While active + 30 days after deletion request
- **Published content:** While active. On deletion: removed or shown as "deleted user"
- **Direct messages:** While both accounts active. Deleted with account.
- **Gamification data:** While active. Deleted with account.
- **Payment data:** Up to 7 years (tax law). Refund requests included.
- **Technical logs:** Up to 12 months.

### 9. זכויות המשתמש (Amendment 13)

- **זכות עיון:** Access personal data held
- **זכות תיקון:** Correct inaccurate data
- **זכות מחיקה:** Delete data / close account
- **זכות התנגדות:** Object to specific uses, including direct marketing
- **זכות לניידות מידע:** Receive data copy in structured format (JSON)

Link to self-service: Settings > Privacy (data export, account deletion).
Response time: 30 days.

### 10. תוצאות אי-מסירת מידע

- Without name/email: can't create account
- Without payment info: can't access paid services
- Rejecting essential cookies: may break site functionality

### 11. קטינים

- Minimum age: 16
- Ages 16-18: parental/guardian consent required
- Under 13: never knowingly collect data (Section 11b)
- If discovered: delete immediately

### 12. שינויים במדיניות

- Material changes published on site and/or emailed
- Continued use = consent to updated policy

### 13. יצירת קשר

- Email: privacy@{domain}
- Escalation: link to Privacy Protection Authority (https://www.gov.il/he/departments/the_privacy_protection_authority)

## Contact Emails Required

- `privacy@{domain}` — Privacy inquiries and data rights
- `support@{domain}` — General support
