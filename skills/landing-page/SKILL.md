---
name: landing-page
description: Build Hebrew RTL landing pages from a proven template. This skill should be used when the user asks to "create a landing page", "build a new landing page", "make a landing page for [product]", or "replicate the workshop website". Produces a single-file HTML landing page with inline CSS/JS, deployed via Vercel then WordPress.
---

# Landing Page Builder

Build Hebrew RTL landing pages from the Claude Code Workshop template - a high-conversion, battle-tested design. The template lives at `assets/template.html` inside this skill's directory.

## Reference Sites

- **Template source repo:** https://github.com/peleg-jpg/claudecodelandingpage
- **Local copy:** `/Users/peleg/website3d/website-example/`
- **Production:** https://website3d-ten.vercel.app
- **Original source:** `/Users/peleg/website3d/replica-1to1.html`

Open the template in a browser (`python3 -m http.server 8080` in the website-example folder) to see exactly how sections, animations, and responsive behavior look.

## When to Use

- User asks to create a new landing page for a product/service/event
- User asks to replicate or clone the workshop website
- User asks to build a sales page or event page

## Workflow

### Step 1: Gather Required Content

Before touching code, collect from the user:

1. **Product/Service name** - what the page is selling
2. **Color scheme** - primary + secondary accent (replaces orange #FF6D1F / #FF8F4F)
3. **Hero section:**
   - Scarcity badge text (e.g. "Cycle #3 - only 3 spots left!")
   - Main headline (h1) with accent-colored words
   - Subheading paragraph
   - Vimeo embed ID for hero video
   - Info pills (date, time, location)
   - Hero body paragraph + CTA text
4. **Marquee logos** - 5 tool/brand logos for scrolling strip
5. **Info section ("Why now"):**
   - Title, body text, 5-item checklist
   - Right-column image
6. **Video testimonials** - Vimeo IDs + participant names (horizontal scroll cards)
7. **Skills grid** - 5 cards with titles + Lottie animation URLs from lottiefiles.com
8. **Instructors** - 2 cards: cutout photo, name, bio paragraphs
9. **Curriculum** - 6 modules with time, title, and checklist items each
10. **Photo gallery** - 8 photos from past events
11. **For Whom** - "Perfect if..." (5 items) + "Not for you if..." (5 items)
12. **Pricing** - old price, new price, VAT calc, what's included, payment methods
13. **Countdown target date** - ISO format with timezone
14. **FAQ** - 5 question/answer pairs
15. **Footer** - closing text + name
16. **Form endpoint** - Google Apps Script URL or `#` for Cardcom redirect
17. **Payment URL** - Cardcom or other payment gateway link (optional)
18. **Facebook Pixel ID** (optional)

**Note:** WhatsApp number is always `+972507744921` (Peleg's number) - do not change across landing pages.

### Step 2: Copy Template

```bash
cp [SKILL_DIR]/assets/template.html [PROJECT_DIR]/landing-page.html
```

Also create an index.html redirect:
```html
<!DOCTYPE html>
<html>
<head><meta http-equiv="refresh" content="0;url=landing-page.html"></head>
<body></body>
</html>
```

### Step 3: Replace Color Slots

Find and replace CSS variable values in the `:root`/`.ws-wrapper` block:

| Variable | Default | Purpose |
|----------|---------|---------|
| `--purple` | `#FF6D1F` | Primary accent (buttons, borders, highlights) |
| `--yellow` | `#FF8F4F` | Secondary accent (prices, counter numbers, gradients) |
| `--purple-gradient` | `linear-gradient(90deg, #FF6D1F, #FF8F4F)` | Gradient accent |

Also update hardcoded color references throughout CSS:
- `rgba(224, 122, 58, ...)` - primary accent with alpha
- `rgba(244, 162, 97, ...)` - secondary accent with alpha
- `rgba(255, 109, 31, ...)` - primary in pulse animation
- Button hover backgrounds - adjust to match new scheme

### Step 4: Replace Content in Each Section

See Section Map below for exact content slots.

### Step 5: Replace Assets

- Copy and compress images with `sips -Z 1200 [image]` (macOS)
- Place in `images/` subdirectory
- Update all `src` attributes
- For CDN-hosted images, replace aiagentschool.co.il URLs with local paths

### Step 6: Deploy

1. Preview: `python3 -m http.server 8850` then test locally
2. Vercel: `vercel --prod --yes` (account: peleg-jpg)
3. Final: WordPress deployment

---

## Section Map (13 Sections + Header + Footer)

Every section is wrapped in `.ws-wrapper`. All text is Hebrew RTL.

### 1. Header (`.ws-header`)
- **Logo text**: Brand name ("CLAUDE CODE" in Press Start 2P font) + Hebrew subtitle
- **CTA button**: Short call-to-action linking to `#ws-register`
- **Scroll behavior**: Darkens background + adds shadow on scroll > 100px

### 2. Hero (`.ws-hero.ws-section-dark`)
- **Scarcity badge**: Top badge with urgency text (e.g. "מחזור #3 - נשארו 3 מקומות בלבד!")
- **h1**: Main headline (68px Discovery desktop, 40px tablet, 30px mobile)
  - `<span style="color: var(--purple)">` for accent words
  - `<br class="ws-mobile-break">` for mobile line breaks
- **Subheading paragraph**: 1-2 lines below headline
- **Vimeo iframe**: 16:9 aspect ratio hero video
- **Cohort badge**: Date/time/location pills with emoji icons
- **Body text**: Paragraph after pills
- **CTA button**: Links to `#ws-register`

### 3. Marquee (`.ws-marquee-section`)
- **Title**: Section heading (e.g. "חלק מהכלים שנלמד")
- **5 logo images**: Duplicated for seamless infinite scroll
  - Each: 200px wide, 120px tall, contain fit
  - Animation: `ws-marquee 25s linear infinite`

### 4. Info Section (`.ws-whatiscc.ws-section-cream`)
- **Zigzag SVG dividers**: Top and bottom (cream fill)
- **Title**: Section heading (e.g. "למה עכשיו זה הזמן הכי חשוב...")
- **Body text**: Description paragraph
- **Checklist**: 5 items with green checkmark SVG icons
- **CTA button**: Links to `#ws-register`
- **Image**: Right column image (hidden on mobile <1024px)

### 5. Early Registration Form (`.ws-registration.ws-section-dark`)
- **Heading**: Form title with `<br>` for line break
- **Form fields**: name (text), phone (tel), email (email) - all required
- **Submit button**: Discovery font, uppercase
- **Spots indicator bar**: Animated progress bar showing capacity (e.g. 5/8 filled)
  - `ws-spots-load` animation triggers on viewport entry
  - Count number blinks on entry
- **Note text**: Response time disclaimer

### 6. Video Testimonials (`.ws-video-rec.ws-section-white`)
- **Title**: Section heading (52px)
- **Subtitle**: Description text
- **Horizontal scroll grid**: Snap-scrolling video cards
  - Each card: Vimeo iframe (9:16 portrait) + person name below
  - 320px max-width per card (265px mobile)
- **Navigation arrows**: Left/right, mobile only (<768px)
  - Auto-hide at scroll edges (RTL-aware)
  - Scroll 200px per click

### 7. Skills Grid (`.ws-section-dark`)
- **Title**: What you'll know after (52px, Discovery uppercase yellow)
- **5 skill cards** in responsive grid (5/3/2/1 columns)
  - Each: Lottie animation (140x140px) + title text
  - `<dotlottie-wc src="[URL]" autoplay loop>`
  - Hover: border color change + translateY(-4px) lift

### 8. Instructors (`.ws-about.ws-section-dark`)
- **Title**: "מי מלמד?" (52px)
- **2 instructor cards** side by side (stack on mobile)
  - Cutout image (300px max-width)
  - Name in POLIN font (32px)
  - Bio paragraphs with `<strong>` emphasis
- **CTA button**: Below cards

### 9. Curriculum Accordion (`.ws-curriculum.ws-section-dark`)
- **Title**: Curriculum heading (52px)
- **6 module cards** (max-width 900px centered)
  - Number circle (36px, orange bg) + time stamp
  - Module title
  - Expandable body with checklist items
  - Toggle via `wsToggleModule(this)` onclick
  - First module open by default (`.ws-module-open`)

### 10. Photo Gallery (`.ws-testimonials.ws-section-cream`)
- **Zigzag dividers**: Top/bottom
- **Title**: Gallery heading (e.g. "קצת מהאוויר בסדנה")
- **4-column grid** (2 cols on mobile)
  - 8 images, 4:3 aspect ratio
  - Hover: scale(1.08) + brightness(1.1)
  - Staggered entrance animations

### 11. For Whom (`.ws-forwhom.ws-section-white`)
- **Title**: Suitability heading (52px)
- **2-column layout**:
  - Green column: "Perfect if..." - 5 checkmark items
  - Red column: "Not for you if..." - 5 X items
  - Stack on mobile, green first

### 12. Pricing (`.ws-pricing.ws-section-dark`)
- **Title**: Pricing heading (52px)
- **Price box** (max-width 600px centered):
  - Old price (strikethrough, 22px)
  - New price (80px yellow Discovery)
  - VAT calculation note
  - What's included list
  - Payment method note
  - CTA button

### 13. Countdown + Registration (`.ws-registration.ws-section-dark`, id="ws-register")
- **Countdown timer**: 4 units (days/hours/minutes/seconds)
  - `dir="ltr"` on container
  - Yellow numbers (48px), white labels
  - Orange border on each unit
- **Expired message**: Hidden by default, shown when countdown reaches 0
- **Registration form**: Same as early form (Step 5) - name, phone, email
- **Subtitle**: Limited capacity note

### 14. FAQ (`.ws-faq.ws-section-dark`)
- **Title**: FAQ heading (52px)
- **5 accordion items** (max-width 800px centered):
  - Question (clickable header, 20px)
  - Answer (expandable body, max-height 300px)
  - Toggle via `wsToggleFaq(this)` onclick
  - Orange border, purple when open

### 15. Footer (`.ws-footer`)
- **Closing text**: Short farewell message (20px)
- **Name**: Sender name (35px yellow Discovery)
- **WhatsApp link**: Icon + text, opens WhatsApp chat to `+972507744921` (FIXED)

---

## Conversion Patterns (What Makes This Template Work)

These psychological patterns are baked into the template - preserve them when creating new pages:

### Scarcity & Urgency
- Top badge with cycle number + remaining spots
- Spots indicator bar (animated progress showing capacity)
- Countdown timer on final registration form
- "Limited to X participants" messaging

### Dual Registration Points
- Early form after value prop (captures impulsive buyers)
- Final form with countdown (captures deliberate buyers)
- Both submit to same endpoint

### Credibility Stack
- Video testimonials (real people, not text)
- Photo gallery (social proof of past events)
- Instructor bios with relatable backstories
- Specific numbers ("2,000+ students", "hundreds of thousands of views")

### Price Anchoring
- Show old/full price crossed out
- Discounted price in large yellow text
- VAT breakdown (transparency builds trust)
- Value comparison framing ("one deal pays for itself")

### Objection Handling via FAQ
- Address top 5 objections directly
- Use social proof in answers ("students aged 27-55 from various fields")
- Reframe objections as benefits

---

## Fixed Infrastructure (Do NOT Change)

### Fonts
- **Discovery** (Light 300, Bold 700) - headlines, buttons, prices, counters
- **POLIN** (Light 300, Medium 500, Bold 700, Black 900) - instructor names
- **Press Start 2P** - header logo (pixel art style)
- **Noto Sans Hebrew** (400-800) - body text
- Font sources: aiagentschool.co.il CDN + Google Fonts

### External Dependencies
```html
<script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.3/dist/dotlottie-wc.js" type="module"></script>
```

### Dark Section Pattern
Radial gradient glows + repeating 50px grid lines overlay. Always use on `.ws-section-dark`.

### Cream Section Pattern
Cream (#F5F7F9) background + diagonal stripe overlay at 135deg. Always use on `.ws-section-cream`.

### Zigzag SVG Dividers
Custom SVG paths between cream and dark sections. `preserveAspectRatio="none"` for responsive width.

### Scroll Animations
- `.ws-animate` class for entrance animation
- IntersectionObserver adds `.ws-visible` at 0.1 threshold
- Transition: opacity 0.4s + translateY(15px to 0)
- Stagger with `.ws-animate-delay-1` through `.ws-animate-delay-4`

### CTA Button Style
- Discovery font, uppercase, italic
- Primary accent background, white text
- 2px black border + 5px hard shadow
- Floating animation (ws-float, 3s infinite)
- Hover: darker shade + lift
- Active: shadow press-down

### Spinning Conic-Gradient Border (REQUIRED on all CTA buttons)
ALWAYS wrap CTA buttons with `.ws-cta-border-anim` - this is the signature visual effect that dramatically improves appeal:
- Wrapper: `position: relative; border-radius: 14px; padding: 3px; overflow: hidden;`
- `::before` pseudo-element: `conic-gradient` using project accent colors + white flash at ~170deg
- Spins via `wsBorderSpin 2.5s linear infinite`
- Button inside gets `position: relative; z-index: 1; box-shadow: none; border: none; animation: none;`
- HTML: `<div class="ws-cta-border-anim"><a class="ws-cta-btn">CTA</a></div>`
- Adapt gradient colors per project (orange for workshop, teal for dark themes, etc.)
- Always add `prefers-reduced-motion: reduce` to disable the spin for accessibility

### Form Submission (JavaScript)
- Both forms submit via `fetch` POST or redirect to payment URL
- If `FORM_ACTION === '#'`: shows success, redirects to payment gateway
- Otherwise: fetches to endpoint with `no-cors` mode
- Success: green button "הפרטים נשלחו!" for 3s
- Error: red button "שגיאה, נסו שוב"

### Countdown Timer (JavaScript)
- Set `WORKSHOP_DATE` to ISO date string with timezone
- Updates every 1000ms
- Shows "הסדנה התחילה!" when expired

### Header Scroll Effect
- On scroll > 100px: darkens background, adds shadow
- Smooth transition back to transparent

### Responsive Breakpoints
- **1024px**: 2-col layouts, hide info section image
- **767px**: Mobile layout, single columns, show video arrows, 40px titles
- **480px**: Small mobile, 27-30px titles, tighter spacing

### RTL Handling
- `dir="rtl"` on `<html>`, `direction: rtl` on `.ws-wrapper`
- Countdown: `dir="ltr"` override
- Marquee: `direction: ltr` override
- All text alignment: right by default

---

## Sections That Can Be Added/Removed

The template is modular. These sections can be added from the older template version:

- **Bonuses section** (`.ws-bonuses`) - 3-column grid with Lottie icons + title + description
- **WhatsApp testimonials** - Single screenshot image of chat testimonials
- **Additional video testimonials** - More horizontal scroll cards

To remove a section, delete its entire `.ws-section-*` wrapper div. No JS dependencies between sections except:
- Forms share the same `FORM_ACTION` variable
- Countdown uses `WORKSHOP_DATE` variable

---

## Checklist Before Delivery

- [ ] All Hebrew copy replaced
- [ ] Colors updated (CSS vars + hardcoded rgba values)
- [ ] All images compressed and loading
- [ ] Vimeo embed working (hero video)
- [ ] Video testimonials loading (portrait Vimeo embeds)
- [ ] Lottie animations loading (5 skills cards)
- [ ] Form submission endpoint connected (or payment redirect set)
- [ ] Countdown date set correctly
- [ ] Spots indicator numbers match reality
- [ ] Scarcity badge text updated
- [ ] WhatsApp number is +972507744921 in footer
- [ ] Facebook Pixel ID updated (or removed)
- [ ] Payment gateway URL updated
- [ ] Mobile responsive (test at 390px, 768px, 1024px)
- [ ] Video arrows working on mobile (hide at edges)
- [ ] Accordion toggles working (curriculum + FAQ)
- [ ] Marquee scrolling with correct logos
- [ ] Header scroll effect working
- [ ] Served on localhost and visually verified
- [ ] Deployed to Vercel for preview
