# Page Patterns Reference

HTML structure for each page type. Copy and adapt these patterns when building guides.

## Cover Page (Page 1)

The cover has a unique structure - no header bar, different padding (70px top vs 50px).

```html
<div class="cover">
  <!-- Badge -->
  <div class="cover-badge">
    <div class="dot"></div>
    <span><!-- BADGE_TEXT --></span>
  </div>

  <!-- Title (RTL override required) -->
  <h1 style="direction: rtl; text-align: right;">
    <!-- COVER_TITLE - use <br> for line breaks -->
  </h1>

  <!-- Subtitle -->
  <p class="cover-subtitle">
    <!-- COVER_SUBTITLE - 2-3 sentences, hook + promise -->
  </p>

  <!-- Learn Box (dark, with checkmarks) -->
  <div class="learn-box">
    <div class="learn-box-header">
      <span class="num">01</span>
      <span class="line"></span>
      <span>מה תלמדו</span>
    </div>
    <ul>
      <li><span class="check">✓</span> <!-- LEARN_ITEM_1 --></li>
      <li><span class="check">✓</span> <!-- LEARN_ITEM_2 --></li>
      <li><span class="check">✓</span> <!-- LEARN_ITEM_3 --></li>
      <li><span class="check">✓</span> <!-- LEARN_ITEM_4 --></li>
    </ul>
  </div>

  <!-- First Section (appears on cover page) -->
  <div class="section-header">
    <span class="num">01</span>
    <span class="line"></span>
    <h2><!-- SECTION_01_TITLE --></h2>
  </div>
  <div class="section-rule"></div>

  <p class="body-text">
    <!-- SECTION_01_BODY -->
  </p>

  <!-- Footer -->
  <div class="page-footer">
    <div></div>
    <div class="page-num">01</div>
  </div>
</div>
```

## Content Page (Pages 2-3)

Standard content page with orange header bar. Can contain one or two sections.

```html
<div class="page">
  <!-- Orange header bar -->
  <div class="page-header-bar"></div>
  <div class="page-header-text"><!-- PAGE_HEADER_TEXT --></div>

  <!-- Section -->
  <div class="section-header">
    <span class="num">02</span>
    <span class="line"></span>
    <h2><!-- SECTION_TITLE --></h2>
  </div>
  <div class="section-rule"></div>

  <!-- Option A: Step-based content -->
  <h3 class="step-title"><!-- STEP_TITLE --></h3>
  <p class="body-text"><!-- STEP_BODY --></p>
  <div class="spacer"></div>
  <h3 class="step-title"><!-- STEP_TITLE --></h3>
  <p class="body-text"><!-- STEP_BODY --></p>

  <!-- Option B: Sub-section content -->
  <h3 class="sub-title"><!-- SUB_TITLE --></h3>
  <p class="body-text"><!-- SUB_BODY --></p>
  <div class="spacer"></div>
  <h3 class="sub-title"><!-- SUB_TITLE --></h3>
  <p class="body-text"><!-- SUB_BODY --></p>

  <!-- Optional: Code block -->
  <div class="code-block">
    <pre><span class="prompt">$</span> <!-- COMMAND -->
    <span class="flag">--flag</span> <span class="string">value</span></pre>
  </div>

  <!-- Optional: Tip -->
  <p class="tip"><!-- TIP_TEXT --></p>

  <!-- Optional: Mid-guide CTA (callout box without photo) -->
  <div class="callout-box">
    <h3><!-- CALLOUT_TITLE --></h3>
    <p><!-- CALLOUT_TEXT --></p>
    <div class="link">moadon.io/aiagentschool</div>
  </div>

  <!-- Optional: Info box -->
  <div class="info-box">
    <div class="info-box-label"><!-- INFO_LABEL --></div>
    <p><!-- INFO_TEXT --></p>
  </div>

  <!-- Optional: Second section on same page -->
  <div class="spacer"></div>
  <div class="section-header">
    <span class="num">03</span>
    <span class="line"></span>
    <h2><!-- SECTION_TITLE --></h2>
  </div>
  <div class="section-rule"></div>
  <p class="body-text"><!-- SECTION_BODY --></p>

  <!-- Footer -->
  <div class="page-footer">
    <div></div>
    <div class="page-num">02</div>
  </div>
</div>
```

## Last Page (with CTA + Photo)

The final page has a checklist section, insight box, and the CTA with Peleg's photo.

```html
<div class="page">
  <div class="page-header-bar"></div>
  <div class="page-header-text"><!-- PAGE_HEADER_TEXT --></div>

  <!-- Use Cases Section (checklist) -->
  <div class="section-header">
    <span class="num">05</span>
    <span class="line"></span>
    <h2><!-- SECTION_TITLE (e.g. "מתי להשתמש") --></h2>
  </div>
  <div class="section-rule"></div>

  <ul class="checklist">
    <li><span class="bullet"></span> <!-- CHECKLIST_ITEM --></li>
    <li><span class="bullet"></span> <!-- CHECKLIST_ITEM --></li>
    <li><span class="bullet"></span> <!-- CHECKLIST_ITEM --></li>
    <li><span class="bullet"></span> <!-- CHECKLIST_ITEM --></li>
    <li><span class="bullet"></span> <!-- CHECKLIST_ITEM --></li>
  </ul>

  <!-- Insight Box -->
  <div class="insight-box">
    <div class="insight-box-label"><!-- INSIGHT_LABEL (e.g. "השורה התחתונה") --></div>
    <p><!-- INSIGHT_TEXT --></p>
  </div>

  <!-- Final CTA with Photo -->
  <div class="callout-box">
    <div class="cta-layout">
      <div class="cta-content">
        <h3><!-- CTA_TITLE (default: "?רוצים את הערכה המלאה") --></h3>
        <p><!-- CTA_TEXT --></p>
        <div class="link">moadon.io/aiagentschool</div>
      </div>
      <div class="cta-photo">
        <img src="peleg.png" alt="פלג דרור">
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="page-footer">
    <div></div>
    <div class="page-num">04</div>
  </div>
</div>
```

## Page Distribution Rules

1. **Cover page**: Badge + title + subtitle + learn box + first section (01). The learn box takes significant space - keep section 01 body to 2-3 short paragraphs max.

2. **Content pages**: Can fit 1-2 sections depending on content length. A section with a code block takes more vertical space. Always check that content doesn't overflow past the footer.

3. **Last page**: Checklist (5 items) + insight box + CTA with photo. This is a fixed structure - don't add extra sections here.

4. **Adding pages**: Duplicate a `<div class="page">` block. Update the section numbers and page-num in footer. Always use `page-break-after: always` (inherited from .page class).

5. **Removing the code block**: If the guide doesn't need terminal commands, remove the entire `<div class="code-block">` div.

6. **Two sections on one page**: Use `<div class="spacer"></div>` between sections for breathing room. Monitor total height - two sections with long body text will overflow.
