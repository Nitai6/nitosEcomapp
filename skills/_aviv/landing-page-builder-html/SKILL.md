---
name: landing-page-builder-html
description: Build high-conversion Hebrew RTL landing pages by scraping and replicating the exact design of any reference website. Produces a single-file HTML+CSS+JS ready for WordPress. This skill should be used when the user says "build landing page", "replicate this site", "copy this design", "דף נחיתה", "תעתיק את הדף", "תבנה לי דף", or provides a URL to replicate as a landing page.
---

# Landing Page Builder HTML

Build high-conversion landing pages by scraping a reference website's exact design tokens (colors, fonts, gradients, spacing, border-radius) and producing a single-file HTML+CSS+JS page ready for WordPress upload.

## When to Use

- User provides a URL and asks to replicate its design
- User asks to build a landing page for a product, course, free guide, or service
- User says "דף נחיתה", "תבנה לי דף", "copy this website", "replicate this design"
- User wants a WordPress-ready HTML page

## Workflow

### Phase 1: Scrape the Reference Site

1. Download the raw HTML with `curl -sL <URL> -o /tmp/reference.html`
2. Find the page-specific CSS file (look for `post-XXXX.css` in Elementor sites, or inline styles)
3. Download the CSS file: `curl -sL <CSS_URL> -o /tmp/reference.css`
4. Extract design tokens using Python:
   - All hex colors and their frequency
   - All gradient definitions
   - Font families and sizes
   - Border-radius values
   - Section background colors (match element IDs to backgrounds)
   - Button styles (background, border, padding, font-size)
   - Countdown timer styles
   - Accordion/FAQ styles
   - Container max-width and section padding
5. Extract content structure: all headings in order, button texts, section flow

### Phase 2: Gather User Content

Ask the user for:
- The topic/product for the landing page
- Their website URL (to scrape copy, pain points, testimonials)
- Form embed code or CTA destination
- Whether to include: countdown timer, scarcity, FAQ, testimonials
- Any specific text changes

Use WebFetch to scrape the user's existing site for copy, testimonials, value props, and pain points.

### Phase 3: Build the Page

Read the template from `assets/template-horizon-style.html` for structural reference.

Produce a single HTML file with these requirements:
- **Single file**: ALL CSS in `<style>` tag, ALL JS inline at bottom
- **RTL Hebrew**: `<html lang="he" dir="rtl">` with `direction: rtl` on html
- **Google Fonts**: Heebo (300,400,500,700,900) for Hebrew pages
- **Font Awesome 6 CDN** for icons
- **No em-dashes**: Replace with commas or restructure sentences
- **No AI writing markers**: Avoid listicle-style dashes, overly structured bullet patterns
- **WordPress-ready**: Paste directly into WordPress Code Editor

### Phase 4: Design Token Application

Apply the exact scraped design tokens:

#### Colors (from reference CSS)
- Extract primary, accent, text, and background colors
- Use exact hex values, not approximations
- Apply gradients with exact angle and color stops

#### Typography
- Match heading sizes (h1: 43-52px, h2: 36-42px, h3: 23-28px)
- Match body text size (17-18px)
- Match font weights (300, 400, 500, 700, 900)

#### Buttons (CTA)
- Apply exact gradient, border, border-radius, padding, font-size
- Include hover animation (white circle expanding effect):
```css
.cta-btn::before {
    content: '';
    background-color: white;
    width: 360px; height: 360px;
    position: absolute;
    border-radius: 100%;
    top: 50%; right: 50%;
    transform: translate(50%, -50%) scale(0);
    transition: 0.3s ease all;
    opacity: 0.15;
}
.cta-btn:hover::before {
    transform: translate(50%, -50%) scale(1);
}
```

#### Sections
- Match exact padding values per section
- Match border-radius on section containers
- Alternate dark/light backgrounds as in reference

### Phase 5: Required Components

Every landing page MUST include:

1. **Announcement bar** at top (colored bar with countdown or urgency)
2. **Hero section** with dark gradient, large headline, sub-text, CTA button
3. **Pain section** with large bold emotional text (52px headlines)
4. **Old vs New comparison** in two-column cards on dark background
5. **Qualification section** (checkmark items: who this is for)
6. **Personal story section** (why the creator built this)
7. **Social proof / about section** with stats
8. **Content reveal section** (what you'll discover/learn, numbered cards)
9. **AI/Technology section** (feature cards with icons)
10. **FAQ accordion** with smooth height transitions
11. **Final CTA + Form** with embedded form, scarcity text, countdown
12. **Footer** with copyright

Optional (add if user requests):
- Testimonials section with amount + stars + quote cards
- Guarantee section
- Image gallery of student results

### Phase 6: JavaScript Features

Include these JS features:
- **Countdown timer**: 48-hour evergreen, persisted in localStorage
- **FAQ accordion**: Click to toggle with smooth max-height transition
- **Scroll animations**: IntersectionObserver fade-in on `.reveal` elements
- **Smooth scroll**: For anchor links to CTA section

### Phase 7: Responsive Design

Include breakpoints at:
- `768px`: Stack grids to single column, reduce font sizes
- `480px`: Further reduce padding, font sizes for mobile

### Phase 8: Delivery

- Save the file to the current working directory
- Open in browser with `open <filename>.html`
- Provide WordPress upload instructions:
  1. Create new page in WordPress
  2. Switch to Code Editor (Custom HTML block)
  3. Paste entire file content
  4. Publish

## Design System Reference

The template in `assets/template-horizon-style.html` uses these proven tokens:

| Token | Value |
|-------|-------|
| Dark gradient | `linear-gradient(90deg, #0A0D16, #1B0600)` |
| Section dark | `linear-gradient(50deg, #0b0e16, #414551)` |
| Light bg | `#FDFDFD` |
| CTA gradient | `linear-gradient(50deg, #E6A210, #FFFB84, #E6A210)` |
| CTA border | `1px solid #a55d07` |
| Accent coral | `#FC8A68` |
| Accent gold | `#E6A210` |
| Accent teal | `#32ACC1` |
| Card bg light | `#E6E6E64D` |
| Card bg dark | `#FFFFFF14` |
| FAQ title | `#FDC5A4` |
| FAQ open | `#936C4D` |
| Text dark | `#040404` |
| Text light | `#FFFFFF` |
| Border radius | `15px` (cards), `9px` (buttons), `30px` (large) |
| Container | `max-width: 1140px` |
| Font | Heebo, sans-serif |

## Critical Rules

- NEVER use em-dashes in Hebrew copy
- NEVER include placeholder images (use only real URLs or remove the section)
- ALWAYS produce a single self-contained HTML file
- ALWAYS use RTL direction for Hebrew pages
- ALWAYS include localStorage-persisted countdown timer
- ALWAYS make the page mobile-responsive
- Fix user's name spelling exactly as they specify
- Embed form scripts inside a `<div>` container
