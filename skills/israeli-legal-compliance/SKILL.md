---
name: israeli-legal-compliance
description: Use when building or updating legal pages (privacy policy, terms of service, accessibility statement, cookies policy, cancellation policy) for an Israeli SaaS product. Use when adding features that collect data, process payments, use third-party integrations, or affect user rights. Use when preparing for Israeli Privacy Protection Law Amendment 13, Consumer Protection Law, or Accessibility Standard 5568 compliance.
---

# Israeli SaaS Legal Compliance

Generate and maintain legally-compliant Hebrew legal pages for Israeli SaaS platforms. Covers Privacy Protection Law (Amendment 13), Consumer Protection Law, Accessibility Standard 5568/WCAG 2.1 AA, and cookies/data transparency.

## Reference Sites

Use these live Israeli sites as benchmarks when auditing or building legal pages:

- **BrainAI Privacy Policy:** https://brainai.co.il/%d7%9e%d7%93%d7%99%d7%a0%d7%99%d7%95%d7%aa-%d7%a4%d7%a8%d7%98%d7%99%d7%95%d7%aa/
- **BrainAI Accessibility Statement:** https://brainai.co.il/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa/

When creating or auditing legal pages, scrape these references (use Playwright - they require JS rendering) and compare section coverage against the checklists below.

## When to Use

- Creating legal pages for a new Israeli SaaS product
- Adding a feature that collects new data types or uses new third-party services
- Adding payment/subscription functionality
- Integrating third-party services (Zoom, WhatsApp, analytics, etc.)
- Auditing existing legal pages for completeness
- Preparing for Israeli Privacy Protection Authority review

## Israeli Law Quick Reference

| Law | Covers | Key Requirements |
|-----|--------|-----------------|
| Privacy Protection Law 5741-1981 + **Amendment 13** (Aug 2025) | Data collection, processing, breaches | Lawful basis, data subject rights, breach notification, DPO |
| Consumer Protection Law 5741-1981 | Purchases, cancellations, refunds | 14-day remote cancellation, 4-month for special populations, digital content exception |
| Consumer Protection Regulations (Cancellation) 5771-2010 | Cancellation fees, procedures | 5% or 100 NIS cap, ongoing subscription rules |
| Communications Law 30a (Broadcasting) 5742-1982 | Marketing emails/SMS | Explicit opt-in, "פרסומת" label, free unsubscribe |
| Equal Rights for Persons with Disabilities 5758-1998 | Accessibility | Standard 5568, WCAG 2.1 AA, accessibility coordinator |
| Copyright Law 5768-2007 | IP, DMCA-style takedowns | Notice and takedown procedure |
| Computer Law 5755-1995 | Digital content | Defines digital content as "information" (affects refund rights) |

## Required Legal Pages

Every Israeli SaaS needs these 5 pages (all in Hebrew):

1. **מדיניות פרטיות** (Privacy Policy) — `references/privacy-policy.md`
2. **תנאי שימוש** (Terms of Service) — `references/terms-of-service.md`
3. **הצהרת נגישות** (Accessibility Statement) — `references/accessibility-statement.md`
4. **מדיניות עוגיות** (Cookies Policy) — `references/cookies-policy.md`
5. **מדיניות ביטולים והחזרים** (Cancellation & Refunds) — `references/cancellation-policy.md`

## Feature-to-Legal Mapping

When you add a feature, update these legal sections:

| Feature Added | Privacy Policy | Terms | Accessibility | Cookies |
|--------------|---------------|-------|--------------|---------|
| User registration | Data collection (name, email, password) | Account section | Form accessibility | Auth cookies |
| User profiles | Public profile data, data retention | Profile features list | Profile page a11y | — |
| Community posts/comments | Usage data, content retention | Content section, permitted use | Rich text editor a11y | — |
| Direct messaging | DM data collection, DM retention | DM rules in permitted use, content privacy | Chat interface a11y | — |
| Likes/reactions | Usage data | — | — | — |
| Mentions (@) | Usage data (mentions) | — | — | — |
| Polls/surveys | Poll vote data | Feature in service description | Poll voting a11y (ARIA) | — |
| Courses/lessons | Progress data, completion data | Course content section | Video player a11y, progress tracking | — |
| Exams/quizzes | Exam results, answers | Feature in service description | Exam form a11y | — |
| Events/calendar | RSVP data | Events section | Event RSVP a11y | — |
| Gamification (points, levels, badges, streaks) | Gamification data, retention | Gamification rules section (non-redeemable) | Leaderboard a11y | — |
| Payments/subscriptions | Payment data, CardCom sharing | Subscriptions section, pricing | — | CardCom cookies |
| Coupons/discounts | — | Coupons in subscriptions section | — | — |
| Refund system | Refund request data | Cancellation section | — | — |
| Real-time notifications | — | Notifications in service description | ARIA live regions | WebSocket note |
| File uploads | Upload data, UploadThing sharing | — | File download a11y | — |
| Third-party integration (Zoom, Meet, WhatsApp) | Integration data sharing | Integration section with external ToS links | Third-party a11y note | Third-party cookies |
| Email/SMTP | Email service provider sharing | Marketing communications section | — | — |
| Accessibility widget | Accessibility preferences | — | Widget documentation | localStorage keys |
| Theme (dark/light) | — | — | — | localStorage key |
| Analytics | Analytics data collection | — | — | Analytics cookies |

## Privacy Policy — Required Sections (Amendment 13)

1. Data types collected (user-provided, usage, payment, technical, preferences)
2. Lawful basis (consent, contract, legitimate interest, legal obligation)
3. How data is used
4. Third-party sharing (service providers, integrations, community managers)
5. International data transfers
6. Security measures
7. Breach notification procedures
8. Data retention periods (per data type)
9. User rights (access, correction, deletion, objection, portability)
10. Consequences of not providing data
11. Minors policy (16+ minimum, 16-18 parental consent)
12. Policy changes
13. Contact information + escalation to Privacy Protection Authority

## Terms of Service — Required Sections

1. Company details (name, ID number, address, email)
2. Service description (comprehensive feature list)
3. Account registration (age, accuracy, security)
4. Permitted use (prohibitions)
5. Gamification rules (if applicable — non-redeemable, modifiable)
6. User content (license, moderation, DM privacy)
7. IP and copyright (DMCA-style takedown)
8. Subscriptions and payments (CardCom, auto-renewal, platform fees, coupons)
9. Cancellation and refunds (14-day, digital content exception, special populations, link to cancellation policy)
10. Third-party integrations (with links to their ToS)
11. Liability limitations (AS-IS, consumer law override)
12. Marketing communications (Section 30a compliance)
13. Account termination
14. Governing law (Israeli law, Tel Aviv courts)
15. Changes to terms (14-day notice for material changes)
16. Contact

## Accessibility Statement — Required Sections

1. Declaration details (site name, URL, standard, coordinator)
2. Commitment (Equal Rights Law reference)
3. Actions taken (keyboard nav, screen readers, contrast, semantic HTML, RTL, font scaling, forms, widget, feature-specific a11y)
4. Accessibility widget documentation
5. Feature-specific accessibility (courses, messaging, etc.)
6. Supported browsers and screen readers
7. Event accessibility
8. Exemptions (state if none)
9. Known limitations (user content, PDFs, embedded videos, rich text)
10. Contact + 14 business day response commitment
11. Escalation to Commissioner for Equal Rights

## Cookies Policy — Required Sections

1. What cookies are
2. Cookie inventory table (name, purpose, duration per cookie)
3. localStorage inventory (key name, purpose)
4. WebSocket/real-time connections note (if applicable)
5. Third-party cookies (payment providers, etc.)
6. Cookie management (browser instructions)
7. Policy updates
8. Contact

## Cancellation Policy — Key Legal Requirements

- **Standard cancellation:** 14 days from purchase/confirmation (whichever later), min 7 days before service starts
- **Digital content exception:** No refund after access (viewing, downloading, using) per Section 14g(d)
- **Ongoing subscriptions:** Cancel anytime, effective in 3 business days (6 if registered mail)
- **Cancellation fee cap:** 5% of price OR 100 NIS, whichever is lower
- **Fee waivers:** Defect, mismatch, non-delivery, business breach
- **Special populations:** Seniors (65+), disabled, new immigrants (5 years) get 4-month window
- **Refund timeline:** 14 days from cancellation request
- **Cancellation channels:** Website button, email, phone, oral (all required by law)

## Implementation Checklist

When creating legal pages for a new project:

- [ ] Create `(legal)/` route group with shared layout
- [ ] Create all 5 legal pages in Hebrew
- [ ] Create `LegalFooter` component linking all pages + cookie settings button
- [ ] Create `CookieConsentBanner` component with essential/functional/analytics toggles
- [ ] Create `AccessibilityWidget` with font size, contrast, links, grayscale, reading guide
- [ ] Create `AccessibilityProvider` that applies CSS classes from settings
- [ ] Add `cookie-consent` event system for reopening consent banner
- [ ] Audit all cookies and localStorage keys — list in cookies policy
- [ ] Verify all Hebrew text, RTL layout, mobile responsiveness
- [ ] Set up contact emails (support@, privacy@, accessibility@)

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing digital content refund exception | Add Section 14g(d) Computer Law reference |
| No special population cancellation rights | Add 4-month window for 65+, disabled, immigrants |
| Missing breach notification procedure | Required by Amendment 13 — add section |
| localStorage key mismatch | Always verify actual key names in code vs. cookies page |
| Missing third-party integration disclosure | Every integration must appear in privacy policy |
| No escalation path | Privacy → Privacy Protection Authority; Accessibility → Commissioner |
| Marketing emails without Section 30a compliance | Must have opt-in, "פרסומת" label, unsubscribe link |
| No cancellation button requirement | Law requires online cancellation mechanism |
