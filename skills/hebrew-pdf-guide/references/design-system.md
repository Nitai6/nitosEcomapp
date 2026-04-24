# Design System Reference

Extracted from the proven Stitch + Claude Code guide. All values are production-tested.

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background | `#F5F0E8` | Page background, warm cream |
| Text primary | `#2D2A26` | Headings, body text, dark elements |
| Text body | `#3A3632` | Body paragraphs |
| Text secondary | `#5A5550` | Subtitle, secondary info |
| Text muted | `#9A958E` | Page header text, labels |
| Text light | `#7A756E` | Tips, footnotes |
| Accent | `#FF6B00` | Orange - titles, bars, bullets, boxes |
| Accent dark | `#CC5500` | Darker orange for borders |
| Accent bg light | `rgba(255,107,0,0.08)` | Info box background |
| Accent bg lighter | `rgba(255,107,0,0.06)` | Insight box background |
| Accent border light | `rgba(255,107,0,0.15)` | Info box border |
| Accent border lighter | `rgba(255,107,0,0.12)` | Insight box border |
| Dark surface | `#2D2A26` | Code blocks, learn box |
| Dark text | `#E8E4DE` | Text on dark surfaces |
| Footer bg | `#E8E2D8` | Page number square |
| Code green | `#98C379` | String values in code blocks |
| White | `#FFFFFF` | Text on orange/dark surfaces |

## Typography

### Fonts (Google Fonts)
```
Heebo: wght 300, 400, 500, 700, 900 (primary sans-serif, body)
Frank Ruhl Libre: wght 400, 500, 700, 900 (serif, display numbers)
JetBrains Mono: wght 400, 500, 700 (monospace, code blocks)
```

### Type Scale

| Element | Font | Size | Weight | Line-height | Color |
|---|---|---|---|---|---|
| Cover h1 | Frank Ruhl Libre | 54px | 900 | 1.1 | #2D2A26 |
| Section number | Frank Ruhl Libre | 36px | 900 | 1 | #FF6B00 |
| Section h2 | Heebo | 24px | 900 | - | #2D2A26 |
| Callout h3 | Heebo | 20px | 900 | 1.3 | #FFFFFF |
| Sub-title h3 | Heebo | 17px | 900 | - | #2D2A26 |
| Step-title h3 | Heebo | 16px | 900 | - | #2D2A26 |
| Cover subtitle | Heebo | 17px | 400 | 1.8 | #5A5550 |
| Body text | Heebo | 15px | 400 | 1.85 | #3A3632 |
| Callout body | Heebo | 14px | 400 | 1.75 | rgba(255,255,255,0.9) |
| Checklist item | Heebo | 14px | 400 | 1.6 | #3A3632 |
| Learn box item | Heebo | 14px | 400 | - | #E8E4DE |
| Code | JetBrains Mono | 12px | 400 | 1.8 | #E8E4DE |
| Badge/label | Heebo | 11-13px | 700 | - | varies |
| Page header | Heebo | 10px | 500 | - | #9A958E |

## Spacing

| Element | Value |
|---|---|
| Page padding (content pages) | 50px top, 55px sides, 60px bottom |
| Page padding (cover) | 70px top, 55px sides, 60px bottom |
| Section header gap | 14px between num/line/title |
| Section rule margin-bottom | 28px |
| Body text margin-bottom | 20px |
| Callout box padding | 28px 32px |
| Callout box margin | 28px 0 |
| Info/insight box padding | 24px 28px |
| Info/insight box margin | 24px 0 |
| Code block padding | 20px 24px |
| Learn box padding | 28px 32px |
| Spacer height | 20px |

## Component Styles

### Section Header
- Flex row, RTL direction, center-aligned, 14px gap
- Number: Frank Ruhl Libre 36px 900, #FF6B00
- Line: 28px wide, 2px tall, #FF6B00
- Title: Heebo 24px 900, #2D2A26
- Followed by section-rule: 100% width, 3px, #FF6B00, margin-bottom 28px

### Callout Box (Orange CTA)
- Background: #FF6B00, border-radius 8px
- Border-right: 5px #CC5500
- Padding: 28px 32px
- Position: relative, overflow: visible
- Link: white text, white 2px bottom border, direction: ltr

### CTA with Photo Layout
- Flex row, RTL direction, center-aligned, 20px gap
- Content: flex: 1
- Photo: 180px wide, align-self: flex-end, margin-bottom: -28px
- Photo img: 180px, drop-shadow(0 4px 12px rgba(0,0,0,0.15))

### Code Block
- Background: #2D2A26, border-radius 8px
- Padding: 20px 24px, direction: ltr
- Font: JetBrains Mono 12px, line-height 1.8
- Colors: prompt=#FF6B00, flag=#9A958E, string=#98C379

### Info Box (Light Orange)
- Background: rgba(255,107,0,0.08)
- Border: 1px rgba(255,107,0,0.15)
- Label: white on #FF6B00, 3px 10px padding, border-radius 3px

### Insight Box (Lighter Orange)
- Background: rgba(255,107,0,0.06)
- Border: 1px rgba(255,107,0,0.12)
- Label: white on #FF6B00, same style as info-box

### Learn Box (Dark, Cover Only)
- Background: #2D2A26, border-radius 8px
- Border-right: 5px #FF6B00
- Checkmark: 20x20px #FF6B00, border-radius 3px, white "✓"

### Checklist
- No list-style, RTL direction
- Bullet: 10x10px #FF6B00, border-radius 2px, margin-top 6px

### Tip
- Font: 13px italic, color #7A756E
- Border-right: 2px #DDD8D2, padding-right 16px

## Page Structure

### A4 Dimensions
- Width: 210mm
- Height: 297mm (min-height)
- Print: @page { size: A4; margin: 0; }

### Page Break
- .page and .cover: page-break-after: always
- .page:last-child: page-break-after: auto

### Print Colors
- -webkit-print-color-adjust: exact
- print-color-adjust: exact

### Header Bar (Continuation Pages)
- Position: absolute, top 0, left 0, right 0
- Height: 6px, background: #FF6B00

### Footer
- Position: absolute, bottom 30px, left 55px, right 55px
- Border-top: 2px solid #2D2A26, padding-top 10px
- Page number: 28x28px #E8E2D8 square, border-radius 4px
