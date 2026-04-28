---
name: hebrew-pdf-guide
description: This skill should be used when the user asks to "create a PDF guide", "make an A4 guide", "build a Hebrew guide", "generate a setup guide", "make a guide like the Stitch one", or "create a lead magnet PDF"
version: 0.1.0
---

# Hebrew PDF Guide

Create branded A4 PDF guides in Hebrew with a proven design system - warm cream background (#F5F0E8), orange accents (#FF6B00), RTL layout, professional typography, and author photo on the CTA.

## Required Skills

ALWAYS invoke these two skills before writing any guide content:

1. **hebrew-copywriting** - for all Hebrew text. Conversational Israeli style, active verbs, flowing paragraphs, no AI slop.
2. **humanizer** - anti-AI pass on every section. Remove AI patterns, inject personality, verify it sounds human.

Invoke both skills at the start of the workflow. Do not skip them.

## Workflow

### Phase 1: Gather Context

Before writing, establish:
- What is the guide about? (tool, workflow, concept)
- Who is reading? (tech level, what they care about)
- What should they do after reading? (install, try, sign up)

### Phase 2: Plan Content Structure

Every guide follows this fixed structure:

| Page | Content |
|---|---|
| Cover (page 1) | Badge + title + subtitle + "what you'll learn" box + Section 01 |
| Content (page 2) | Section 02 - usually setup/installation with steps |
| Content (page 3) | Section 03 + Section 04 (two shorter sections) |
| Last (page 4) | Section 05 as checklist + insight box + CTA with photo |

To add pages: duplicate a content page div and renumber sections/pages.
To reduce: merge sections 03+04 onto page 2 and move section 05 to page 3.

See [references/content-guidelines.md](references/content-guidelines.md) for section patterns and word budgets.

### Phase 3: Write Hebrew Content

Apply hebrew-copywriting skill rules:
- Flowing paragraphs, NEVER bullet points in body text
- Conversational Hebrew - like explaining to a friend at a coffee shop
- 30-80 words per section body paragraph
- Specific tool names and examples, not vague benefits
- Active present-tense verbs ("מתארים", "נכנסים", "מעתיקים")
- Open with shared experience: "אתם יודעים את הרגע ש..."
- No "מטורף", no "קסם", no "מהפכה"
- No em dashes - use regular dashes (-)

Then apply humanizer skill:
- Run anti-AI audit: "What makes this obviously AI generated?"
- List remaining tells
- Revise until it sounds like a real person wrote it
- Check for: equal-length sentences, neutral reporting, no opinions, no personality

Total word budget for all content: ~400-550 words. Keep it tight.

### Phase 4: Assemble HTML

1. Copy the template file to the output folder:
   ```
   cp /path/to/skill/templates/guide-template.html /output/folder/guide.html
   cp /path/to/skill/assets/peleg.png /output/folder/peleg.png
   ```

2. Replace all placeholder comments in the HTML with actual content. Placeholders use the format `<!-- PLACEHOLDER_NAME -->`.

Key placeholders:

| Placeholder | What to fill in |
|---|---|
| `BADGE_TEXT` | Short label: "מדריך התקנה", "מדריך שימוש", etc. |
| `COVER_TITLE` | Main title with `<br>` for line break |
| `COVER_SUBTITLE` | 2-3 sentences: hook + what this solves + "מדריך X מלא." |
| `LEARN_ITEM_1` to `LEARN_ITEM_4` | Action-verb items for "what you'll learn" |
| `SECTION_XX_TITLE` | Hebrew section heading |
| `SECTION_XX_BODY` | Body paragraphs (can use multiple `<p class="body-text">`) |
| `PAGE_HEADER_TEXT` | Continuation header: "מדריך X - Topic" |
| `CODE_BLOCK` | Terminal command with syntax highlighting spans |
| `TIP_TEXT` | Warning or pro tip (italic, gray) |
| `CHECKLIST_ITEM_1` to `CHECKLIST_ITEM_5` | Concrete use case scenarios |
| `INSIGHT_LABEL` | Insight box label: "השורה התחתונה" |
| `INSIGHT_TEXT` | One key takeaway sentence |
| `CTA_TITLE` | Default: "?רוצים את הערכה המלאה" |
| `CTA_TEXT` | What they'll find at the school |

3. Remove optional components that aren't needed:
   - No terminal commands? Remove the entire `<div class="code-block">` div
   - No tip? Remove the `<p class="tip">` element
   - No mid-guide CTA? Remove the callout-box on page 2
   - No info box? Remove the `<div class="info-box">` div

4. For code blocks, use syntax highlighting spans:
   ```html
   <span class="prompt">$</span> command
   <span class="flag">--flag-name</span>
   <span class="string">"string value"</span>
   ```

See [references/page-patterns.md](references/page-patterns.md) for full HTML structure of each page type.
See [references/design-system.md](references/design-system.md) for all CSS values and component styles.

### Phase 5: Content Distribution Check

Before rendering, verify content fits within pages:

- Cover page: Badge + title + subtitle + learn box (4 items) + one section with 2-3 paragraphs. The learn box is tall - keep section 01 body short.
- Content pages: Can fit 1-2 sections. A code block adds ~100px of height. Two sections with long paragraphs will overflow.
- Last page: Checklist (5 items) + insight box + CTA with photo. Fixed structure - do not add extra content here.

If content overflows: split into more pages or shorten paragraphs. Never let content bleed past the footer (positioned at bottom: 30px).

### Phase 6: Render PDF

To generate the A4 PDF via Playwright:

1. Start a local HTTP server in the output folder:
   ```
   cd /output/folder && python3 -m http.server 8765 --bind 127.0.0.1
   ```

2. Navigate Playwright browser to the HTML:
   ```
   browser_navigate: http://127.0.0.1:8765/guide.html
   ```

3. Generate PDF using Playwright's page.pdf():
   ```javascript
   await page.pdf({
     path: '/output/folder/guide.pdf',
     format: 'A4',
     printBackground: true,
     margin: { top: '0', right: '0', bottom: '0', left: '0' }
   });
   ```

4. Kill the HTTP server process

5. Open the PDF for the user to review:
   ```
   open /output/folder/guide.pdf
   ```

### Phase 7: Quality Checklist

Before delivering, verify every item:

- [ ] No page overflow - content stays within page boundaries on all pages
- [ ] All section headers RTL - orange numbers appear on the right side
- [ ] Hebrew reads naturally - sounds like a person, not a translation or AI
- [ ] Author photo visible on last page CTA - spawning from below the orange box
- [ ] No tool attribution - no "נבנה עם Claude Code", no watermarks, no logos
- [ ] CTA link is moadon.io/aiagentschool
- [ ] Cover has: badge + title + subtitle + learn box + section 01
- [ ] Continuation pages have: orange header bar (6px) + centered header text
- [ ] Page numbers in footer squares (01, 02, 03, 04)
- [ ] Code blocks (if used) have dark background with colored syntax
- [ ] Insight box appears before the final CTA on last page
- [ ] Body text is justified with proper line spacing
- [ ] No em dashes anywhere - only regular dashes

If any item fails, fix it and re-render the PDF.

## Design System Quick Reference

| Element | Value |
|---|---|
| Background | #F5F0E8 (warm cream) |
| Primary text | #2D2A26 (dark charcoal) |
| Body text | #3A3632 |
| Accent | #FF6B00 (orange) |
| Dark accent | #CC5500 (border) |
| Body font | Heebo 400/700/900 |
| Display font | Frank Ruhl Libre 900 |
| Code font | JetBrains Mono 400 |
| Page size | A4 (210mm x 297mm) |
| Page padding | 50px top, 55px sides, 60px bottom |
| Cover padding | 70px top (extra space) |
| Body text size | 15px, line-height 1.85, justified |

## Available Components

| Component | Class | Usage |
|---|---|---|
| Section header | `.section-header` | Orange number + line + Hebrew title (RTL) |
| Body paragraph | `.body-text` | Justified text, 1.85 line height |
| Step title | `.step-title` | Bold + orange underline (for numbered steps) |
| Sub-title | `.sub-title` | Bold + orange underline (for named sub-sections) |
| Code block | `.code-block` | Dark bg, monospace, colored syntax |
| Callout box | `.callout-box` | Orange bg, white text, optional photo layout |
| Info box | `.info-box` | Light orange bg, for supplementary info |
| Insight box | `.insight-box` | Very light orange, for key takeaways |
| Checklist | `.checklist` | Orange bullet squares, RTL items |
| Learn box | `.learn-box` | Dark bg, orange checkmarks (cover only) |
| Tip | `.tip` | Italic gray, right border |
| Spacer | `.spacer` | 20px vertical space between sections |

Full CSS values for each component: [references/design-system.md](references/design-system.md)
HTML patterns: [references/page-patterns.md](references/page-patterns.md)

## File Structure

```
hebrew-pdf-guide/
├── SKILL.md                         (this file - workflow and checklist)
├── references/
│   ├── design-system.md             (colors, fonts, spacing, all CSS values)
│   ├── page-patterns.md             (HTML structure for cover, content, last page)
│   └── content-guidelines.md        (how to write content, word budgets, patterns)
├── templates/
│   └── guide-template.html          (complete HTML/CSS template with placeholders)
└── assets/
    └── peleg.png                    (author photo, background removed)
```
