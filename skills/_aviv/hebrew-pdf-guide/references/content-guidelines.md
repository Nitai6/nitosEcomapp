# Content Guidelines

How to write content for the A4 PDF guide format. These rules work together with the hebrew-copywriting and humanizer skills.

## Content Structure

Every guide follows this structure:

### Cover Page
- **Badge**: 1-2 word label (e.g. "מדריך התקנה", "מדריך שימוש", "מדריך מהיר")
- **Title**: Product/tool name + context. Use `<br>` for line break. Keep to 2 lines max.
- **Subtitle**: 2-3 sentences. First sentence = hook/pain point. Second = what this solves. Third = "מדריך [type] מלא."
- **Learn box**: 3-4 items starting with action verbs. What they'll know/be able to do after reading.
- **Section 01**: Always "?מה זה [topic]" - the explainer section. Lives on the cover page, so keep it short (2-3 paragraphs, ~80 words total).

### Content Pages (2-3 pages)
- **Section 02**: Usually the setup/installation/how-to-start section
- **Section 03**: How to use / workflows / advanced usage
- **Section 04**: A supporting concept (like design.md, config files, best practices)
- Each section: 1-3 paragraphs, 30-80 words each

### Last Page
- **Section 05**: "מתי להשתמש" - use cases as a checklist (4-6 items)
- **Insight box**: One "bottom line" takeaway (1-2 sentences)
- **CTA**: Links to moadon.io/aiagentschool. Always present.

## Writing Rules

### Tone
- Write like explaining to a smart friend over coffee
- Use "אתם" (plural) for the audience
- First person "אני" when speaking as Peleg
- Assume the reader is tech-curious but not a developer

### Paragraphs
- Flowing sentences connected with commas and dashes
- NEVER bullet points in body text (bullets only in learn-box and checklist)
- NEVER stack short fragments: "יותר מהר. יותר מדויק. בלי סיבובים."
- 30-80 words per paragraph
- Each paragraph = one idea

### Hebrew-Specific
- Conversational connectors: "אתם יודעים", "נכון", "בקיצור"
- Specific tool names in English: "Claude Code", "Stitch", "MCP"
- Describe what tools DO, not what they ARE
- End technical sections with practical outcome
- No Wikipedia-style definitions

### What NOT to Write
- "מטורף" or "מהפכה" (burned words)
- "קסם" or "magic" (AI slop)
- "נבנה עם Claude Code" or any tool attribution
- Em dashes - use regular dashes (-)
- Generic benefits without specifics

## Section-Specific Patterns

### "?מה זה [topic]" (Section 01)
Open with shared experience: "אתם יודעים את הרגע ש..."
Then explain what the tool does in plain terms.
Close with the connection to Claude Code / the user's workflow.

### Setup/Installation (Section 02)
Use step-title h3 elements: "שלב 1:", "שלב 2:"
Keep steps concrete: "נכנסים ל-X, לוחצים על Y, מעתיקים Z"
Include a code block if there's a terminal command.
Add a tip for important warnings.

### How to Use (Section 03)
Use sub-title h3 elements for different use cases.
Each use case: what you do + what happens + how long it takes.
Include a relatable quote or reaction: 'מ-"X" ל-"Y" - בפרומפט אחד.'

### Supporting Concept (Section 04)
Explain why this matters, not just what it is.
Connect it back to the main tool/workflow.
Keep it shorter than sections 02-03.

### Use Cases (Section 05, checklist)
Each item: concrete scenario, not vague benefit.
Good: "שדרוג אפליקציה שנראית גנרית למשהו שנראה כמו מוצר"
Bad: "שיפור חוויית המשתמש"

### Insight Box
One sentence that captures the guide's core message.
Pattern: "[Tool] doesn't just [obvious thing]. It [surprising thing]."

### CTA
Default title: "?רוצים את הערכה המלאה"
Body: What they'll find at the school (specific outcomes).
Always ends with the link to moadon.io/aiagentschool.

## Word Budget

| Section | Words |
|---|---|
| Cover subtitle | 20-30 |
| Learn box items | 5-10 per item |
| Section 01 (cover) | 60-80 |
| Section 02 (setup) | 80-120 |
| Section 03 (usage) | 60-100 |
| Section 04 (concept) | 40-70 |
| Section 05 (checklist) | 8-15 per item |
| Insight | 15-25 |
| CTA text | 20-30 |
| **Total** | **~400-550 words** |

Keep it tight. Every word must earn its place. After writing, cut 30-40% of filler.
