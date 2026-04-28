# Accessibility Statement Template (הצהרת נגישות)

Israeli Standard 5568 + WCAG 2.1 Level AA compliant.

## Page Metadata

```tsx
export const metadata: Metadata = {
  title: "הצהרת נגישות | {BRAND}",
  description: "הצהרת הנגישות של פלטפורמת {BRAND} — תקן ישראלי 5568 ו-WCAG 2.1 AA",
};
```

## Required Sections

### פרטי ההצהרה

Grid display with:
- Site name, URL
- Standard: ת"י 5568, WCAG 2.1 Level AA
- Last audit date
- Accessibility coordinator: Name + email (accessibility@{domain})

### מחויבות שלנו

Reference:
- Equal Rights for Persons with Disabilities Law 5758-1998
- Equality of Rights for Persons with Disabilities (Accessibility Accommodations for Service) Regulations 5773-2013

### פעולות שנקטנו

**Core actions (always include):**
- Full keyboard navigation (Tab, Enter, Escape, arrows)
- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Color contrast AA level (4.5:1 text, 3:1 graphics)
- Alt text for images and media
- Semantic HTML (headings, landmarks, ARIA roles)
- Full RTL support for Hebrew
- Flexible font sizes — up to 200% scaling
- Accessible forms with labels, error messages, clear focus states

**Feature-specific actions (add per feature):**
- Built-in accessibility widget (see widget section)
- Video player controls keyboard accessible
- ARIA live regions for real-time notifications
- Polls and exams with proper ARIA labels and roles
- User profiles and leaderboard with semantic structure
- Chat/messaging interface keyboard and screen reader accessible
- Course progress indicators accessible with percentage and completion state

### כלי הנגישות

Document the accessibility widget features:
- Font size adjustment (with range, e.g., 87.5% to 125%)
- High contrast mode
- Link highlighting (underline all links)
- Grayscale mode (black and white)
- Reading guide (cursor-following highlight bar)
- Keyboard navigation info
- Reset all button
- Settings persist in browser between visits

### נגישות קורסים ותכנים (if courses exist)

- Course progress displayed accessibly
- Video player controls keyboard navigable
- Downloadable materials with accessible descriptions
- Encourage content creators to add captions and transcriptions

### נגישות הודעות ושיחות (if DMs exist)

- Messaging supports keyboard nav and screen readers
- New messages announced accessibly for assistive tech users

### דפדפנים וטכנולוגיות נתמכות

- Chrome, Firefox, Safari, Edge (latest versions)
- Screen readers: NVDA, JAWS, VoiceOver

### נגישות אירועים (if events exist)

- Online events accessible to screen readers, keyboard navigable
- RSVP mechanism accessible
- Zoom/Google Meet support their own accessibility features (captions, keyboard nav)
- Encourage captions on recorded content

### פטורים והקלות

State whether any exemptions were granted. If none:
> לא ניתנו לארגון פטורים או הקלות מדרישות הנגישות

### מגבלות ידועות

Common limitations to disclose:
- User-uploaded content (images without alt text, videos without captions)
- User-uploaded PDFs that aren't accessible
- Embedded third-party videos (YouTube, Vimeo, Loom) — accessibility depends on those services
- Rich text content written by users may not meet accessibility standards

### יצירת קשר בנושא נגישות

- Coordinator name + accessibility@{domain}
- **14 business day response commitment** (required by law)
- Escalation: Commissioner for Equal Rights of Persons with Disabilities
  (https://www.gov.il/he/departments/the_commission_for_equal_rights_of_persons_with_disabilities)

## Accessibility Widget Implementation

The widget should be a floating button (♿) positioned fixed at bottom-start.

### Required Features

1. **Font size control** — decrease/increase with visual slider and percentage display
2. **High contrast toggle** — enhances color contrast ratios
3. **Link highlight toggle** — underlines all links
4. **Grayscale toggle** — black and white display
5. **Reading guide toggle** — horizontal bar follows mouse cursor
6. **Keyboard navigation info** — Tab, Enter, Esc shortcuts
7. **Reset all button** — shown when any setting is active
8. **Link to full accessibility statement**
9. **Coordinator contact info**

### Technical Requirements

- Settings stored in localStorage (Zustand persist or similar)
- Apply via CSS classes/variables on `<html>` element
- Widget itself must be fully keyboard accessible
- Active settings indicator (green dot on button)
- Mobile: backdrop overlay when open
- Position: `fixed bottom-20 start-4 z-[60] md:bottom-4` (above mobile nav)

### CSS Classes Applied

```css
/* Font scaling */
html { --a11y-font-scale: 1; }
/* High contrast */
html.a11y-high-contrast { /* enhanced contrast styles */ }
/* Link highlighting */
html.a11y-link-highlight a { text-decoration: underline !important; }
/* Grayscale */
html.a11y-grayscale { filter: grayscale(1); }
```

## AccessibilityProvider Implementation

Wrap app children. Responsibilities:
- Read accessibility state from store
- Apply CSS classes and custom properties to `<html>`
- Implement reading guide mouse tracking (mousemove listener)
- Use `useAccessibility` hook for state

## Contact Email Required

- `accessibility@{domain}` — Accessibility coordinator
