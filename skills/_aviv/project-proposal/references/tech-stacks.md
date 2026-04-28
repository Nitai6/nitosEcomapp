# Tech Stack Reference - Hebrew Project Proposals

Common SaaS tech stacks with Hebrew descriptions for the proposal's tech stack section.

---

## Next.js + PostgreSQL + Prisma

**Hebrew description (for the proposal):**

```
הפרויקט ייבנה עם Next.js - פריימוורק מוביל לפיתוח אפליקציות React מודרניות עם Server Components. בצד השרת נשתמש ב-PostgreSQL כבסיס נתונים יציב ומוכח, עם Prisma כשכבת גישה לנתונים. העיצוב ייבנה עם Tailwind CSS, והפרויקט יעלה לאוויר על Vercel.

הבחירה בסטאק הזה מבטיחה ביצועים גבוהים, תחזוקתיות לטווח ארוך, וקהילה גדולה של מפתחים.
```

**When to recommend:** Most SaaS projects, complex data models, need for strong typing and migrations

**Pros:** Battle-tested, great developer ecosystem, excellent for SEO, type-safe database queries

**Cons:** Requires PostgreSQL hosting (Supabase/Neon/Railway)

---

## Next.js + Supabase

**Hebrew description (for the proposal):**

```
הפרויקט ייבנה עם Next.js ו-Supabase - פלטפורמה שמספקת בסיס נתונים, אותנטיקציה, אחסון קבצים, ו-API מוכן מהקופסה. השילוב הזה מאפשר פיתוח מהיר יותר כי הרבה מהתשתית מגיעה מוכנה.

Supabase מבוסס על PostgreSQL, כך שאתם מקבלים בסיס נתונים מקצועי עם ממשק ניהול נוח ויכולות Real-time מובנות.
```

**When to recommend:** Projects needing fast time-to-market, built-in auth, real-time features, file storage

**Pros:** Faster development, built-in auth/storage/realtime, generous free tier, PostgreSQL under the hood

**Cons:** Vendor lock-in on some features, less control over backend logic

---

## Next.js + Firebase

**Hebrew description (for the proposal):**

```
הפרויקט ייבנה עם Next.js ו-Firebase של Google. Firebase מספק אותנטיקציה, בסיס נתונים (Firestore), אחסון קבצים, והתראות - הכל באקוסיסטם אחד.

הבחירה ב-Firebase מתאימה כשצריך לצאת לאוויר מהר ולסמוך על תשתית של Google שגדלה עם הפרויקט.
```

**When to recommend:** Google ecosystem preference, need for push notifications, mobile companion app planned

**Pros:** Google infrastructure, great mobile SDKs, push notifications, scales automatically

**Cons:** NoSQL only (Firestore), vendor lock-in, pricing can spike with scale

---

## React + Node.js + MongoDB

**Hebrew description (for the proposal):**

```
הפרויקט ייבנה עם React בצד הלקוח ו-Node.js (Express) בצד השרת, עם MongoDB כבסיס נתונים. הפרדה ברורה בין Frontend ל-Backend מאפשרת גמישות מקסימלית.

MongoDB מתאים לפרויקטים שבהם מבנה הנתונים גמיש ומשתנה, והחיבור ל-Node.js טבעי ויעיל.
```

**When to recommend:** Need for separate frontend/backend deployment, flexible/evolving data schema, REST API for multiple clients

**Pros:** Full flexibility, separate deployment, great for APIs serving multiple frontends

**Cons:** More setup work, no built-in SSR (need separate config), MongoDB less suitable for relational data

---

## Selection Guide

Quick decision matrix for Claude:

- **Default recommendation:** Next.js + PostgreSQL + Prisma (most projects)
- **Fast MVP / startup:** Next.js + Supabase
- **Google ecosystem / mobile:** Next.js + Firebase
- **API-first / multiple clients:** React + Node.js + MongoDB
