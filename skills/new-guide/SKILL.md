---
name: new-guide
description: Full lead magnet pipeline - PDF creation + landing page + email delivery + Airtable tracking + deploy. Use when Peleg says "new guide", "create a guide", or provides a topic for a new lead magnet.
version: 4
---

# New Guide - Full Lead Magnet Pipeline

End-to-end guide creation: PDF design + landing page + email delivery + Airtable tracking + deploy. One skill, everything automated.

## Required Skills (invoke at start)

1. **hebrew-copywriting** - all Hebrew text (landing page copy, email copy, PDF content)
2. **humanizer** - anti-AI pass on all copy before finalizing
3. **hebrew-pdf-guide** - PDF creation (Phase 2 only, skip if PDF already exists)

## Required Inputs

Ask for these if not provided:

1. **Topic** - what is the guide about?
2. **Target audience** - who is this for? (tech level, what they care about)
3. **Slug** - URL path (e.g. `n8n-guide` for `/guides/n8n-guide/`)
4. **PDF** - either:
   - "create it" → run Phase 2 (hebrew-pdf-guide workflow + auto-upload to Drive)

## File Locations

| What | Path |
|---|---|
| Site root | `/Users/peleg/Peleg/pelegdror-site/` |
| Guide pages | `/Users/peleg/Peleg/pelegdror-site/guides/{slug}/index.html` |
| Guide config | `/Users/peleg/Peleg/pelegdror-site/guides/config.json` |
| Guides hub | `/Users/peleg/Peleg/pelegdror-site/guides/index.html` |
| Landing page template | `/Users/peleg/Peleg/pelegdror-site/guides/stitch-guide/index.html` |
| Serverless function | `/Users/peleg/Peleg/pelegdror-site/api/subscribe.js` |
| Redirects | `/Users/peleg/Peleg/pelegdror-site/vercel.json` |
| Env vars (local) | `/Users/peleg/Peleg/pelegdror-site/.env.local` |

## Design System

- Dark theme: `--bg-primary: #181818`, `--orange: #FF6D1F`, `--orange-light: #FF8F4F`
- Discovery custom font (Bold 700 for headings/CTAs, loaded from `aiagentschool.co.il` CDN) + Heebo (body text)
- Orange gradient accents, hard-shadow CTA buttons (`box-shadow: 5px 5px 0px 0px #000`, italic uppercase Discovery)
- Dark section pattern: radial orange glows + repeating 50px grid lines overlay
- Magnetic card with gradient orange border for the form
- RTL throughout, shared components loaded via `/shared-components.js`

---

## Phase 1: Write All Copy

Invoke **hebrew-copywriting** skill, then **humanizer** skill.

### Landing page copy:
- **Headline** - provocation/hook style. Examples: "תפסיקו לבנות אפליקציות שנראות כמו AI slop", "עדיין מגדירים אוטומציות בממשק גרפי?"
- **Subtitle** - 2-3 sentences max. What the guide teaches + why it matters.
- **CTA button text** - invitation style: "שלחו לי את המדריך", "רוצה את המדריך"
- **Success message** - what happens next (check email, guide arrives in 1-2 min)

### Email copy (Yahav Rubin story style - MANDATORY):
Write the delivery email as a personal story, not a transactional "here's your guide" message.
Use the line-per-thought format from the hebrew-copywriting skill's "Killer Email Structure" section.

**Structure:**
1. Personal story opener - "בשבועות האחרונים..." specific, recent, shows effort
2. The pain/grind - what was wrong before, one thought per line, 3-8 words max
3. Turning point (bold, 20px font) - discovery moment
4. The reveal - what it does, specific names on separate lines
5. The gift - "כתבתי מדריך עם הכל בפנים"
6. CTA button
7. P.S. - bold "נ.ב", strong personal one-liner or warm tease

**Format rules:**
- Every line is ONE thought with `<br>` between lines
- `<p>` blocks with margin for breathing room between groups
- Bold turning points: `font-size:20px;font-weight:700;color:#222`
- Singular (אתה/לך), never plural
- No dense paragraphs, no bullet points, no "הנה המדריך שביקשת"

**Fields:**
- **Subject line** - personal hook: "{name}, [something that makes them curious]"
- **Body line** - full story in HTML (see structure above)
- **CTA text** - "להורדת המדריך", "למדריך המלא"
- **Footer line** - bold נ.ב + personal voice, ends with strong statement or "בקרוב..."

### Guide hub card copy:
- **Card title** - guide name
- **Card description** - one sentence explaining what the reader gets

Run **humanizer** on all copy before proceeding.

---

## Phase 2: Create PDF (skip if PDF already exists)

Invoke the **hebrew-pdf-guide** skill for the full PDF creation workflow:
1. Plan content structure (cover + content pages + CTA page)
2. Write content with hebrew-copywriting + humanizer
3. Assemble HTML from template
4. Render to A4 PDF via Playwright
5. Upload to Google Drive automatically:
   ```bash
   /Users/peleg/Peleg/scripts/upload-pdf-to-drive.sh /Users/peleg/Peleg/guides/{slug}.pdf
   ```
   This returns JSON with `viewLink` and `directLink`. Use the `viewLink` as the Google Drive link for Phase 3+4.

---

## Phase 3: Create Landing Page

The landing page uses the orange/black design system: #181818 dark bg, #FF6D1F orange accents, Discovery font (bold 700) for headings/CTAs, Heebo (light 300) for body, magnetic card with gradient orange border, hard-shadow CTA button, noise/grid background layers, glowing orange orbs.

1. Copy the template:
   ```bash
   mkdir -p /Users/peleg/Peleg/pelegdror-site/guides/{slug}
   cp /Users/peleg/Peleg/pelegdror-site/guides/stitch-guide/index.html /Users/peleg/Peleg/pelegdror-site/guides/{slug}/index.html
   ```

2. Edit `/Users/peleg/Peleg/pelegdror-site/guides/{slug}/index.html`:
   - Replace `<title>` and `<meta name="description">` with guide-specific text
   - Replace headline text (inside `<h1>`) - use `.highlight` span for the orange-accented word
   - Replace subtitle (inside `.form-subtitle`) with Phase 1 copy
   - Replace `source: 'stitch-guide'` → `source: '{slug}'` in the fetch body
   - Replace success state Google Drive link in the `guide-btn` href
   - Replace success message paragraph text
   - Update submit button text if different
   - Back link should point to `/guides/`

3. Do NOT change: CSS variables, font imports, background layers, card structure, form logic, or shared-components.js script tag

4. Verify the form submits to `/api/subscribe` with `source: '{slug}'`

---

## Phase 4: Add to Guide Config

Edit `/Users/peleg/Peleg/pelegdror-site/guides/config.json` - add new entry:

```json
"{slug}": {
  "name": "{guide name in Hebrew}",
  "pdf_url": "{google drive link}",
  "tag": "{slug}",
  "email": {
    "subject": "{email subject from Phase 1}",
    "body_line": "{email body from Phase 1}",
    "cta_text": "{email CTA from Phase 1}",
    "footer_line": "{email footer from Phase 1 or null}"
  }
}
```

The subscribe.js function reads this config dynamically to:
- Validate the source is a known guide
- Build the delivery email HTML
- Set the correct Airtable tag and per-guide column

No changes needed to subscribe.js - it reads all guide keys from config.json automatically.

---

## Phase 5: Create Airtable Column

Create a new number field in Airtable for this guide. The column name MUST match the slug exactly.

```bash
# Read env vars
AT_KEY=$(grep '^AIRTABLE_API_KEY' /Users/peleg/Peleg/pelegdror-site/.env.local | sed 's/.*="\(.*\)\\n"/\1/')
AT_BASE=$(grep '^AIRTABLE_BASE_ID' /Users/peleg/Peleg/pelegdror-site/.env.local | sed 's/.*="\(.*\)\\n"/\1/')
AT_TABLE=$(grep '^AIRTABLE_TABLE_ID' /Users/peleg/Peleg/pelegdror-site/.env.local | sed 's/.*="\(.*\)\\n"/\1/')

# Create the column
curl -s -X POST "https://api.airtable.com/v0/meta/bases/${AT_BASE}/tables/${AT_TABLE}/fields" \
  -H "Authorization: Bearer ${AT_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "{slug}", "type": "number", "options": {"precision": 0}}'
```

This column gets set to `1` when a user downloads this guide. The subscribe.js `countTotalGuides()` function automatically sums all guide columns for the Total Guides count.

The Guides multi-select field auto-creates new options when subscribe.js writes a new value - no manual step needed.

---

## Phase 6: Add Guide Card to Hub Page

Edit `/Users/peleg/Peleg/pelegdror-site/guides/index.html`.

### Step 1: Find a topic-relevant Lottie animation

Search the LottieFiles GraphQL API for a relevant animation:

```bash
curl -s -X POST "https://graphql.lottiefiles.com/" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ searchPublicAnimations(query: \"{topic search keywords}\", first: 5) { edges { node { lottieUrl name } } } }"}' | python3 -m json.tool
```

Pick the most relevant result. Verify the URL returns 200:

```bash
curl -s -o /dev/null -w "%{http_code}" "{chosen lottieUrl}"
```

### Step 2: Add the card

Add a new card inside the `.guides-grid` div, after the existing cards:

```html
<!-- {Guide Name} -->
<a href="/guides/{slug}/" class="guide-card ws-animate">
  <div class="card-lottie">
    <dotlottie-wc src="{chosen lottieUrl}" autoplay loop></dotlottie-wc>
  </div>
  <h3>{Guide Name}</h3>
  <p>{Card description from Phase 1}</p>
  <span class="card-arrow">למדריך &#8592;</span>
</a>
```

The hub page already includes the dotlottie-wc script and CSS for `.card-lottie` containers. No badge or label needed - all guides are free.

The grid is already set to `repeat(3, 1fr)` for desktop - no CSS changes needed unless layout requires adjustment.

---

## Phase 7: Add Redirect to vercel.json

Edit `/Users/peleg/Peleg/pelegdror-site/vercel.json` - add a redirect from the bare slug to the guides path:

```json
{ "source": "/{slug}/:path*", "destination": "/guides/{slug}/:path*", "statusCode": 301 }
```

---

## Phase 8: Test Locally

1. Start a local server:
   ```bash
   cd /Users/peleg/Peleg/pelegdror-site && python3 -m http.server 3333 --bind 127.0.0.1
   ```

2. Open with Playwright at `http://127.0.0.1:3333/guides/{slug}/`
3. Verify RTL layout, form fields, checkbox, submit button render correctly
4. Fill form with test data - verify success state appears
5. Verify the form source value matches the slug in config.json

---

## Phase 9: Deploy

```bash
cd /Users/peleg/Peleg/pelegdror-site
git add guides/{slug}/ guides/config.json guides/index.html vercel.json
git commit -m "Add {slug} guide - landing page, email delivery, Airtable tracking"
git push
```

Git push triggers auto-deploy via Vercel GitHub integration.

If the GitHub auto-deploy fails (check with `npx vercel ls | head -5`), use redeploy from the last successful deployment:
```bash
npx vercel redeploy <last-successful-deployment-url>
```

---

## Phase 10: Verify Production

After deploy completes:

1. **Test the live API**:
   ```bash
   curl -s -X POST https://pelegdror.com/api/subscribe \
     -H "Content-Type: application/json" \
     -H "Origin: https://pelegdror.com" \
     -d '{"email":"test-{slug}@example.com","name":"Test Guide","source":"{slug}"}'
   ```

2. **Check Airtable** - verify the record has `{slug}: 1` and `Total Guides` is correct:
   ```bash
   AT_KEY=$(grep '^AIRTABLE_API_KEY' /Users/peleg/Peleg/pelegdror-site/.env.local | sed 's/.*="\(.*\)\\n"/\1/')
   AT_BASE=$(grep '^AIRTABLE_BASE_ID' /Users/peleg/Peleg/pelegdror-site/.env.local | sed 's/.*="\(.*\)\\n"/\1/')
   AT_TABLE=$(grep '^AIRTABLE_TABLE_ID' /Users/peleg/Peleg/pelegdror-site/.env.local | sed 's/.*="\(.*\)\\n"/\1/')
   curl -s "https://api.airtable.com/v0/${AT_BASE}/${AT_TABLE}?filterByFormula=$(python3 -c 'import urllib.parse; print(urllib.parse.quote("{Email}=\"test-{slug}@example.com\""))')" \
     -H "Authorization: Bearer ${AT_KEY}" | python3 -m json.tool
   ```

3. **Check redirect** - `https://pelegdror.com/{slug}/` should 301 to `/guides/{slug}/`

4. **Check guides hub** - new card appears at `https://pelegdror.com/guides/`

5. **Check email delivery** - verify the Resend email was sent (check Resend dashboard or use a real email)

6. **Clean up test record** from Airtable:
   ```bash
   # Delete the test record using the record ID from step 2
   curl -s -X DELETE "https://api.airtable.com/v0/${AT_BASE}/${AT_TABLE}/{record_id}" \
     -H "Authorization: Bearer ${AT_KEY}"
   ```

---

## Phase 11: DM Messages

After everything is deployed and verified, write DM messages for Peleg to use when promoting the guide.

### DM 1 - Cold opener
- Open with "ראיתי ש..." - personalized, shows you checked their profile
- 3-4 lines: what the guide covers, one specific benefit
- "חינם, אגב" near the end - afterthought framing
- Link: pelegdror.com/{slug}
- Sign off: פלג

### DM 2 - Follow-up (2-3 days later)
- "רק רציתי לוודא שראית" - soft, not pushy
- 2 lines max: reminder + one value point
- Same link
- Sign off: פלג

Rules:
- Singular (אתה), not plural
- No "מה קורה" opener - signals mass DM
- No marketing adjectives
- Straight to the point, like a text from a friend

Present both DMs ready to copy-paste.

---

## Quick Reference: What Gets Created/Modified

| Action | File |
|---|---|
| New file | `guides/{slug}/index.html` (landing page) |
| Modified | `guides/config.json` (add guide entry) |
| Modified | `guides/index.html` (add card to hub) |
| Modified | `vercel.json` (add redirect) |
| Airtable | New number column named `{slug}` |
| No changes needed | `api/subscribe.js` (reads config dynamically) |
