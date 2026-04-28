# Cookies Policy Template (מדיניות עוגיות)

Israeli Privacy Protection Authority recommendations compliant.

## Page Metadata

```tsx
export const metadata: Metadata = {
  title: "מדיניות עוגיות | {BRAND}",
  description: "מדיניות העוגיות (Cookies) של פלטפורמת {BRAND}",
};
```

## Required Sections

### 1. מהן עוגיות?

Brief explanation: small text files stored on device, remember preferences, improve experience.

### 2. סוגי עוגיות שאנו משתמשים בהן

**CRITICAL: Audit actual code to find all cookies and localStorage keys.**

#### עוגיות חיוניות (Essential) — No consent needed

Common NextAuth.js cookies:

| Cookie Name | Purpose | Duration |
|-------------|---------|----------|
| `next-auth.session-token` | User auth and login state | Session / 30 days |
| `next-auth.csrf-token` | CSRF protection | Session |
| `next-auth.callback-url` | Post-login redirect | Session |

#### עוגיות פונקציונליות (Functional) — No consent needed

| Cookie Name | Purpose | Duration |
|-------------|---------|----------|
| `cookie-consent` | Cookie consent preferences | 12 months |

#### אחסון מקומי (localStorage) — No consent needed, client-only

**Always verify key names against actual code.** Common keys:

| Key Name | Purpose |
|----------|---------|
| `accessibility-prefs` | Accessibility settings (font size, contrast, links, grayscale, reading guide) |
| `theme` | Color scheme preference (light/dark) |
| `cookie-consent` | Cookie consent preferences (duplicate for client-side access) |

**Zustand persist stores** use localStorage — check `{ name: "..." }` in persist config for actual key names.

### 3. חיבורי זמן אמת (WebSocket) — If applicable

If using Socket.io or WebSocket:
- Explain purpose (real-time notifications, messages)
- State: no cookies used, no data stored on device
- Active only while browser is open

### 4. עוגיות צד שלישי

List each third-party that sets cookies:
- **Payment provider** (e.g., CardCom) — auth/security cookies on payment page. Link to their privacy policy.

**Important statement:**
> איננו משתמשים בעוגיות פרסום, עוגיות מעקב, או שירותי אנליטיקה של צד שלישי.

(Remove if you DO use analytics/advertising cookies.)

### 5. ניהול עוגיות

- Can manage/delete via browser settings
- Warning: blocking essential cookies breaks login
- Browser-specific instructions for: Chrome, Firefox, Safari, Edge

### 6. עדכונים למדיניות

- Updates published on site when cookies change

### 7. יצירת קשר

- Email: privacy@{domain}

## Cookie Consent Banner Implementation

### Required UI

- Compact view: "Accept All", "Reject", "Manage Preferences" buttons
- Expanded view: toggles for each cookie category
- Essential cookies always ON (no toggle, labeled "תמיד פעיל")
- Categories: Essential (locked), Functional, Analytics

### Technical Implementation

```typescript
type CookiePreferences = {
  essential: boolean;  // always true
  functional: boolean;
  analytics: boolean;
  timestamp: string;   // ISO date
};

const STORAGE_KEY = "cookie-consent";
```

- Store in localStorage
- Show banner if no stored preferences
- Emit `cookie-consent-updated` event on save
- Support `reopen-cookie-consent` event (triggered by footer "Cookie Settings" button)
- Position: fixed bottom, above mobile nav (`bottom-16 z-[55] md:bottom-0`)

### Legal Footer Integration

Footer should include links to all 5 legal pages plus a "הגדרות עוגיות" button that dispatches `reopen-cookie-consent` event.

## Verification Checklist

- [ ] All actual cookie names match what's listed in the policy
- [ ] All localStorage keys match actual code (check Zustand persist `name` fields)
- [ ] Third-party cookies disclosed
- [ ] Consent banner works (accept, reject, manage, reopen)
- [ ] Essential cookies can't be disabled in the banner
