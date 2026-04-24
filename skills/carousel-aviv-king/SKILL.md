---
name: carousel-aviv-king
description: "Full Hebrew Instagram carousel pipeline for Aviv. Takes a topic, generates Hebrew copy for approval, creates slide images with Nano Banana Pro (Gemini) in Marketing Harry style, and saves to Desktop. This skill should be used when the user says 'carousel', 'קרוסלה', provides a topic for carousel creation, or says '/carousel-aviv-king'. Also triggers on 'make me a carousel about', 'create carousel for', or any Hebrew carousel request."
---

# Carousel Aviv King

End-to-end Hebrew Instagram carousel generator for @aviv_malka7. Input: a topic. Output: approved Hebrew copy + generated slide images saved to Desktop.

## Pipeline (5 steps, in order, never skip any)

### Step 1: Generate Hebrew carousel copy

Given the user's topic, generate 7 slides of Hebrew carousel copy following ALL rules in the Hebrew Copy Rules section below.

**Slide structure (always 7 slides):**

| Slide | Type | Content |
|---|---|---|
| 1 | hook | Scroll-stopper headline, max 3 lines, no body text |
| 2 | info | Set up the problem/context |
| 3 | info | Core insight or reframe |
| 4 | info | Practical steps or checklist (numbered tips work well) |
| 5 | info | The key question or money-saving insight |
| 6 | info | How it works today / the modern approach |
| 7 | cta | CTA with comment trigger "קורס" |

**Per slide, generate:**
- **כותרת (title):** Bold headline, short
- **body_opener:** Opening sentence
- **body_emphasis:** The core point (bold in the image)
- **body_payoff:** The result or punchline

Also generate: full Instagram caption, caption CTA, and hashtags.

### Step 2: Hebrew text approval (MANDATORY, never skip)

Present ALL Hebrew text to the user in a clean organized format:

1. Each slide: number, type, title, body_opener, body_emphasis, body_payoff
2. Full Instagram caption
3. Caption CTA line
4. Hashtags

Then explicitly ask: "Approve, request changes, or regenerate?"

**Do NOT proceed to image generation until the user explicitly approves.**

If the user requests changes, apply them and present updated text again for approval.

### Step 3: Build image prompts

After user approval, construct one Gemini image prompt per slide using the Marketing Harry Design System below. Each prompt must include the full design system preamble + slide-specific content + the approved Hebrew text embedded in the prompt.

### Step 4: Generate images with Nano Banana Pro

Use the Gemini API directly to generate images. The model is `gemini-3.1-flash-image-preview` (Nano Banana Pro). **Never use any other image model.**

For each slide, call:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key={GEMINI_API_KEY}
```

With payload:
```json
{
  "contents": [{"parts": [{"text": "<slide prompt>"}]}],
  "generationConfig": {"responseModalities": ["IMAGE"]}
}
```

The response contains base64-encoded PNG in `candidates[0].content.parts[N].inlineData.data`.

The GEMINI_API_KEY is in: `~/projects/carousel-machine2/.env`

Add a 4-second delay between API calls for rate limiting.

Alternatively, run `scripts/generate_slides.py` with a JSON file of slide prompts:
```bash
python3 scripts/generate_slides.py --slides /tmp/slides.json --output /path/to/output/
```

### Step 5: Save to Desktop and open

1. Create folder: `~/Desktop/קרוסלות אביב/<hook title in Hebrew>/`
2. Copy all generated PNG files there
3. Open the folder in Finder: `open "<folder path>"`
4. Show all images to the user using the Read tool so they can review

---

## Hebrew Copy Rules (non-negotiable, apply to ALL generated text)

1. Write native Hebrew. Not translated from English. Think in Hebrew first.
2. Flowing paragraphs with commas. NEVER stacked fragments or bullet points on slides.
   - "יותר מהר. יותר מדויק. בלי סיבובים." = AI slop. FORBIDDEN.
   - "בלי X. בלי Y. בלי Z." = triple negative. FORBIDDEN.
   - "חינם. קוד פתוח. בטרמינל." = stacked fragments. FORBIDDEN.
3. Use conversational connectors: תכלס, אשכרה, נחש מה, רגע, ואגב, יאללה
4. Frame as "איך אני..." not "איך ל..."
5. BANNED words (never use): מטורף, קסם, מהפכה, פורץ דרך, שינוי משחק, מדהים, ייחודי, חדשני
6. Active verbs, specific numbers: "1,847 שקל" not "אלפים"
7. Hebrew idioms as metaphors: "משחק ילדים", "מטפל בהכל"
8. Plural for IG audience: "תכפילו/שלכם" not "אתה/שלך"
9. Show experience, not definitions.
10. Tools and concepts have personality: "הוא מסתדר עם השאר"
11. Every variation must take a genuinely different direction
12. Open with conversational connectors: "נכון" or "אתם יודעים את ה..."
13. CTA = invitation, not command. "בוא נתחיל" not "הירשם עכשיו"
14. Never use dashes (-) in the text
15. Remove all signs of AI-generated text: no perfect parallel structures, no overly polished phrasing, add casual imperfections like a real person writing
16. Always answer "so how do I make money from this?" even as a hint. Israelis buy income, not knowledge.
17. "כן." alone on a line after a bold statement works well. Stops. Resets.
18. Say each idea once. Repetition = insecurity.
19. Write for BEGINNERS who want to learn, not experts who already know
20. Target audience mindset: "I want to start but I don't know how. Teach me exactly how to do it."

## CTA Rules (always follow)

- The CTA slide always asks the audience to comment **"קורס"**
- Promise: "ואני אלמד אתכם" + adapt to topic (e.g., "איך למצוא מוצר מנצח ולפתוח חנות עם AI")
- Caption CTA repeats: תכתבו "קורס" בתגובות + the adapted promise
- Handle: @aviv_malka7

## Caption Structure

- 6-12 lines, one thought per line
- Conversational, personal tone (first person)
- End with: "שמרו את הפוסט הזה" + reason
- Caption CTA: תכתבו "קורס" בתגובות + promise
- 8-10 hashtags, mix of Hebrew and English

---

## Marketing Harry Design System (for all image prompts)

Every slide image prompt MUST begin with this design system preamble:

```
DESIGN SYSTEM — @marketingharry style adapted for Hebrew RTL:
- Format: 4:5 portrait (1080x1350px)
- Background: pure white (#FFFFFF) or very light off-white (#F8F8F8)
- Headlines: Ultra-bold condensed sans-serif, near-black (#1A1A1A), fills 50-70% of slide width
- Hebrew text is RIGHT-TO-LEFT — align all text from the right side
- Gradient accent: hot pink (#FF1493) to orange (#FF6B35) — used on badges, highlights, underlines
- 3D photorealistic renders with shadows and reflections, NOT flat icons
- Body text: #666666 grey, clean sans-serif, readable
- Progress bar: thin line at bottom of every content slide, pink-to-orange gradient
- Brand badge: small pill "@aviv_malka7" bottom-left in grey
- Save badge: "שמרו" + bookmark icon bottom-right
- NO busy backgrounds, NO dark backgrounds, NO neon, NO gradients on background
- Clean, generous white space, editorial feel
- Visual element takes 35-45% of the slide, text the other 55-65%
- Every slide must feel like it could stand alone as a screenshot
```

### Slide-type prompt templates:

**Hook (slide 0):**
- SLIDE TYPE: HOOK / COVER — scroll-stopper, no body text, visual impact only.
- Top 55%: massive ultra-bold Hebrew headline, right-aligned, #1A1A1A
- "swipe" badge in pink-orange gradient, top-left
- Bottom 45%: 3D photorealistic render with contrast visual (good vs bad, old vs new)
- Pink-to-orange gradient underline on key word
- Bottom bar with brand + bookmark
- Mood: bold, confrontational, scroll-stopper

**Info slides (1-5):**
- SLIDE TYPE: INFO SLIDE N/5
- "N/5" progress badge in pink-to-orange gradient pill, top-right
- Bold Hebrew headline right-aligned, ultra-bold #1A1A1A
- Thin gradient accent line below headline
- Hebrew body text right-aligned, #666666, clean readable
- 3D visual element (30-40% of slide) relevant to slide concept
- Bottom bar: gradient progress line, @aviv_malka7 left, bookmark right

**CTA (slide 6):**
- SLIDE TYPE: CTA / FINAL SLIDE
- Large ultra-bold Hebrew headline right-aligned
- Pink-to-orange gradient underline on key phrase
- Prominent "קורס" comment trigger: the word inside a large gradient pill/badge, white text
- 3D render: speech bubble with "קורס" + rocket or graduation cap icon
- @aviv_malka7 brand bar centered, slightly larger
- Bookmark + "שמרו לאחר כך"
- Mood: exciting, warm, inviting — not pushy

## File paths

- Skill location: `~/.claude/skills/carousel-aviv-king/`
- Image generation script: `~/.claude/skills/carousel-aviv-king/scripts/generate_slides.py`
- Gemini API key: `~/projects/carousel-machine2/.env` (GEMINI_API_KEY)
- Output destination: `~/Desktop/קרוסלות אביב/<carousel hook title>/`
