# Proposal Sections Reference

Hebrew template text for each section of a project proposal (הצעת מחיר).
Templates use Jinja2-style `{{placeholder}}` syntax.

---

## 1. פתיח (Introduction)

**Template:**

```
שלום {{client_name}},

שמחים להציג בפניכם את ההצעה שלנו לפיתוח {{project_name}}.

אנחנו מתמחים בפיתוח מערכות SaaS מקצה לקצה, עם דגש על חווית משתמש, ביצועים, ואיכות קוד. אנחנו עובדים עם כלים מתקדמים לפיתוח מואץ שמאפשרים לנו לספק תוצרים באיכות גבוהה בזמנים קצרים.

ההצעה הבאה מפרטת את היקף העבודה, לוח הזמנים, והתמחור עבור הפרויקט.
```

**Writing guidelines:**
- Warm but professional tone
- Reference development tools as "כלים מתקדמים לפיתוח מואץ" - NOT Claude Code by name
- Keep to 3-4 sentences
- Invoke hebrew-copywriting skill to refine this section

---

## 2. תיאור הפרויקט (Project Description)

**Template:**

```
{{project_name}} היא מערכת שנועדה ל{{project_goal}}.

המערכת תאפשר ל{{target_users}} ל{{key_capabilities}}.

{{additional_context}}
```

**Writing guidelines:**
- Fill from Figma analysis
- Describe goals, target users, core value proposition
- 2-3 paragraphs max
- Invoke hebrew-copywriting skill to refine

---

## 3. פירוט טכני (Technical Breakdown)

**Template:**

```
| מסך | רכיבים | רמת מורכבות |
|-----|--------|-------------|
{% for screen in screens %}
| {{screen.name}} | {{screen.components}} | {{screen.complexity}} |
{% endfor %}
```

**Writing guidelines:**
- One row per screen identified in Figma analysis
- Components listed as comma-separated Hebrew terms
- Complexity levels in Hebrew: פשוט / בינוני / מורכב

---

## 4. סטאק טכנולוגי (Tech Stack)

**Template:**

```
הפרויקט ייבנה עם הטכנולוגיות הבאות:

{{tech_stack_text}}

הבחירה בסטאק הזה מבוססת על {{tech_justification}}.
```

**Writing guidelines:**
- Load specific stack description from tech-stacks.md
- Justify the choice briefly (1-2 sentences)

---

## 5. לוח זמנים (Timeline)

**Template:**

```
| שלב | תיאור | זמן משוער |
|-----|-------|----------|
{% for milestone in milestones %}
| {{milestone.name}} | {{milestone.description}} | {{milestone.weeks}} |
{% endfor %}

סך הכל: {{total_weeks}} שבועות
```

**Writing guidelines:**
- Default 3 milestones: foundation, core features, polish+launch
- Adjust week counts based on total project hours
- Small projects (under 40 hrs): 3-4 weeks
- Medium projects (40-80 hrs): 5-7 weeks
- Large projects (80+ hrs): 8-12 weeks

---

## 6. תמחור (Pricing)

**Template:**

```
| רכיב | שעות | מחיר |
|------|------|------|
{% for item in line_items %}
| {{item.component}} | {{item.hours}} | {{item.price}} ש"ח |
{% endfor %}
|---|---|---|
| סה"כ שעות פיתוח | {{subtotal_hours}} | {{subtotal_price}} ש"ח |
| ניהול פרויקט (15%) | | {{pm_overhead}} ש"ח |
| בדיקות ו-QA (10%) | | {{qa_buffer}} ש"ח |
| **סה"כ לפני מע"מ** | | **{{total_before_vat}} ש"ח** |
| מע"מ (17%) | | {{vat}} ש"ח |
| **סה"כ כולל מע"מ** | | **{{grand_total}} ש"ח** |
```

**Writing guidelines:**
- All prices in NIS (ש"ח)
- Format numbers with comma separators for thousands
- Bold the totals

---

## 7. תנאי תשלום (Payment Terms)

**Template:**

```
התשלום יתבצע בשלושה שלבים:

1. 30% מקדמה בחתימה על ההסכם - {{payment_1}} ש"ח
2. 40% לאחר אספקת גרסת MVP - {{payment_2}} ש"ח
3. 30% באספקה הסופית ואישור הלקוח - {{payment_3}} ש"ח

התשלום באמצעות העברה בנקאית או צ'ק.
```

**Writing guidelines:**
- Default split is 30/40/30
- Calculate each payment amount from the grand total (including VAT)
- Keep payment method options simple

---

## 8. מה כלול (What's Included)

**Template:**

```
ההצעה כוללת:

- פיתוח מלא של כל המסכים והפיצ'רים המפורטים למעלה
- הקמת סביבת אחסון ודיפלוי
- צינור דיפלוי אוטומטי (CI/CD)
- 30 ימי תיקון באגים לאחר ההשקה
- מסירת קוד מקור מלא
- תיעוד טכני בסיסי
```

**Writing guidelines:**
- Keep as a standard list - rarely needs customization
- Add project-specific inclusions if the scope calls for it (e.g., integrations, data migration)
- "30 ימי תיקון באגים" is the default warranty period

---

## 9. מה לא כלול (What's NOT Included)

**Template:**

```
ההצעה אינה כוללת:

- כתיבת תוכן ותרגום
- תחזוקה שוטפת לאחר תקופת הבאגים
- שינויי עיצוב מעבר למה שמוגדר ב-Figma
- עלויות שירותי צד שלישי (ענן, API, שליחת מיילים)
- רכישת דומיין ואחסון
- אופטימיזציית SEO
```

**Writing guidelines:**
- Critical for managing expectations - do not remove items without good reason
- Add project-specific exclusions if needed (e.g., mobile app, admin panel)
- "שינויי עיצוב מעבר למה שמוגדר ב-Figma" sets a clear boundary on scope creep

---

## 10. תוקף ההצעה (Validity)

**Template:**

```
הצעה זו תקפה עד לתאריך {{validity_date}}.

לאחר תאריך זה, ייתכנו שינויים בתמחור ובלוח הזמנים.

לשאלות או הבהרות, אנחנו כאן.
בברכה,
פלג
```

**Writing guidelines:**
- Default validity: 30 days from proposal date
- Calculate `validity_date` automatically from generation date
- Keep the closing warm and short
