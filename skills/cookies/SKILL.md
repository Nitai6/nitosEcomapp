---
name: cookies
description: Use when adding cookie consent, cookie banner, cookie popup, GDPR/privacy cookie compliance, or cookie preference management to a website. Also use when the user says "cookies", "cookie consent", "cookie banner", or "עוגיות".
---

# Cookie Consent System

GDPR/privacy-compliant cookie consent with a two-layer UI: a centered consent modal + a detailed preferences side panel (Sheet).

## Architecture

```
┌─────────────────────────────┐
│     Consent Modal (Dialog)  │  ← First visit / reopen
│  ┌───────────────────────┐  │
│  │  Icon + Title + Desc  │  │
│  │  + Privacy link       │  │
│  ├───────────────────────┤  │
│  │  [Accept]             │  │
│  │  [Reject Non-Essential│  │
│  │  [Manage Preferences] │──│──→ Opens Sheet
│  └───────────────────────┘  │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Preferences Sheet (Right)  │  ← Slides from right
│  ┌───────────────────────┐  │
│  │  Title + Description  │  │
│  │  + Privacy link       │  │
│  ├───────────────────────┤  │
│  │  [Toggle] Essential   │  │  ← Always on, disabled
│  │    Description text   │  │
│  │    ▸ Show disclosures │  │  ← Expandable cookie table
│  ├───────────────────────┤  │
│  │  [Toggle] Functional  │  │  ← Toggleable
│  │    Description text   │  │
│  │    ▸ Show disclosures │  │
│  ├───────────────────────┤  │
│  │  [Toggle] Analytics   │  │  ← Toggleable
│  │    Description text   │  │
│  │    ▸ Show disclosures │  │
│  ├───────────────────────┤  │
│  │  [Save Preferences]   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## Required Components (shadcn/ui)

- `Dialog` - consent modal
- `Sheet` - preferences side panel
- `Button` - action buttons
- `Switch` - category toggles

Install missing ones: `npx shadcn@latest add dialog sheet button switch`

## Cookie Categories

Adapt these to the project. Each category needs: `id`, `label`, `description`, `alwaysOn` flag, and `disclosures` array.

| Category | Default | Can Disable? | Examples |
|----------|---------|-------------|----------|
| Essential | On | No | Auth tokens, CSRF, session |
| Functional | On | Yes | Theme, language, preferences |
| Analytics | On | Yes | Page views, usage stats |
| Advertising | Off | Yes | Targeted ads, retargeting (add only if used) |

## Storage

```typescript
// localStorage key
const STORAGE_KEY = "cookie-consent";

// Stored shape
type CookiePreferences = {
  essential: boolean;   // always true
  functional: boolean;
  analytics: boolean;
  timestamp: string;    // ISO 8601
};
```

## Event System

Two custom events for cross-component communication:

| Event | Purpose | Dispatched by |
|-------|---------|---------------|
| `cookie-consent-updated` | Preferences saved | `savePreferences()` |
| `reopen-cookie-consent` | Reopen modal from footer/settings | Footer button |

## Behavior Rules

1. **First visit**: Modal is blocking - no close button, no overlay dismiss, no escape key
2. **Reopen** (from footer): Modal allows close button, overlay dismiss, escape key
3. **Reopen** loads stored preferences into toggles so user can adjust
4. **"Manage Preferences"** hides the modal and opens the Sheet side panel
5. **Essential toggle** is always checked and disabled
6. **Disclosures** are expandable per category - show cookie name, purpose, duration
7. **Save** closes everything and stores to localStorage

## Integration

### 1. Root Layout
Render `<CookieConsentBanner />` globally in root layout.

### 2. Footer "Cookie Settings" Button
Dispatch the reopen event:
```tsx
<button onClick={() => window.dispatchEvent(new Event("reopen-cookie-consent"))}>
  Cookie Settings
</button>
```

### 3. Reading Preferences Elsewhere
```typescript
import { getStoredPreferences } from "@/components/compliance/cookie-consent-banner";

const prefs = getStoredPreferences();
if (prefs?.analytics) {
  // load analytics scripts
}
```

## Customization Checklist

When implementing for a new project:

- [ ] Update cookie categories to match actual cookies used
- [ ] Fill in disclosures with real cookie names, purposes, durations
- [ ] Update privacy policy link (`/privacy` or project-specific path)
- [ ] Translate all UI text to project language (reference has Hebrew)
- [ ] Add/remove categories (e.g., advertising) as needed
- [ ] Match button styling to project design system
- [ ] Add the footer reopen button to site footer
- [ ] Render component in root layout

## RTL Notes (Hebrew/Arabic)

- Use logical CSS properties (`ms-`/`me-`, `ps-`/`pe-`, `start`/`end`)
- Sheet slides from `side="right"` (physically right in RTL = start side)
- All text alignment via `text-start`/`text-end`

## Reference Implementation

See `reference-implementation.tsx` for complete working code (Next.js + shadcn/ui + Tailwind + lucide-react).
