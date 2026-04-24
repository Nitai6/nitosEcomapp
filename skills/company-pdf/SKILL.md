---
name: company-pdf
description: This skill should be used when the user asks to "make a workshop PDF for [company]", "create a Claude Code curriculum for [company]", or "generate a training proposal for [company]". Generates a branded 5-page A4 PDF curriculum for Claude Code workshops, customized per company.
---

# Company Workshop PDF Generator

Generate a branded 5-page Claude Code Mastery curriculum PDF for any company. Takes a company URL and team info, researches their tech stack, downloads their logo, fills the template, refines copy with the copywriting skill, and renders a print-ready A4 PDF.

## Required Skills

ALWAYS invoke these skills during the workflow:

1. **copywriting** - for the cover subtitle, all client-specific example text, and any rewritten sections. Apply copywriting principles: clarity over cleverness, benefits over features, specificity over vagueness.
2. **humanizer** - run anti-AI pass on all written sections before rendering. Remove AI patterns, inject personality.

## Trigger

Activate when the user provides a company name or URL and wants a Claude Code workshop PDF. Minimum input: company name. Everything else can be researched.

## Workflow

### Phase 1: Gather Info

Collect these variables. Research what the user doesn't provide.

| Variable | How to get it |
|---|---|
| `COMPANY_NAME` | User provides |
| `COMPANY_LOGO` | Download from company website (homepage, about, press kit). Save as SVG/PNG to output folder |
| `TEAM_TITLE` | User provides (e.g. "Analytics Team", "Data Engineering") |
| `PLATFORM_NAME` | Research - their main product/platform name |
| `DATABASE` | User provides or research (Snowflake, BigQuery, Postgres, Redshift, etc.) |
| `BI_TOOL` | User provides or research (Tableau, Looker, Power BI, Metabase, etc.) |
| `DOCS_TOOL` | Research - Confluence, SharePoint, Notion, or list options |
| `DATA_DOMAIN` | Infer from team role (people operations, financial reporting, marketing analytics, etc.) |
| `DATA_SENSITIVITY` | Infer from domain (employee PII, financial records, customer data, etc.) |
| `REGULATIONS_REF` | "[Company]'s latest regulations" or specific if known (SOC 2, GDPR, HIPAA) |

Research approach:
1. Fetch company homepage via web search or Playwright
2. Look for tech stack clues in job postings, engineering blog, press releases
3. Check page source or brand/press pages for logo
4. If database/BI tool can't be confirmed, ask the user

### Phase 2: Fill Template

1. Copy template and instructor photo to output folder:
   ```
   cp [skill-base]/assets/template.html /Users/peleg/Peleg/guides/[company-kebab]-claude-code-curriculum.html
   cp [skill-base]/assets/peleg.png /Users/peleg/Peleg/guides/peleg.png
   ```
   Note: `[skill-base]` is the base directory shown when this skill is invoked.

2. Replace ALL `{{PLACEHOLDER}}` markers in the HTML. Full placeholder list is in the template's config comment block at the top of the file.

3. For text-heavy placeholders, write original copy tailored to the client's domain - do not just swap words.

### Phase 3: Write Custom Copy

Invoke the **copywriting** skill. Apply its principles to these key sections:

- **Cover subtitle**: Rewrite to reference client's platform, database, BI tool, data domain
- **Business logic examples**: Domain-appropriate definitions (HR: "active employee", Finance: "revenue recognition", Marketing: "attributed conversion")
- **Layered context examples**: Domain-appropriate CLAUDE.md layering
- **Skill examples**: Domain-relevant slash command and task list
- **MCP question example**: Natural-language question someone on that team would ask their database
- **Practical example**: Realistic multi-step prompt with specific threshold/comparison
- **Business question scenario**: Realistic stakeholder question with hidden complexity

**Instructor bio** - default works for all clients:
"I build real-life business automation solutions with Claude Code - MCP integrations, custom Skills, and full production pipelines. When an existing MCP server isn't reliable enough, I build my own. I lecture, run hands-on workshops, and consult for companies that need AI tooling done right. Security and permissions come first in every engagement."

Only rewrite if user requests changes.

After writing, invoke **humanizer** on all custom copy sections.

### Phase 4: Verify Page Heights

All 5 pages must be exactly 1123px (A4 height). Check before rendering:

1. Start HTTP server: `cd /Users/peleg/Peleg/guides && python3 -m http.server 8765 --bind 127.0.0.1`
2. Navigate Playwright to the HTML
3. Evaluate:
   ```javascript
   () => {
     const all = document.querySelectorAll('body > div');
     return Array.from(all).map((d, i) => `Page ${i+1}: ${d.scrollHeight}px`);
   }
   ```
4. If any page exceeds 1123px, trim text until all pages fit

### Phase 5: Render PDF

```javascript
async (page) => {
  await page.pdf({
    path: '/Users/peleg/Peleg/guides/[company-kebab]-claude-code-curriculum.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
}
```

### Phase 6: Cleanup and Deliver

1. Kill HTTP server
2. Open PDF: `open /Users/peleg/Peleg/guides/[file].pdf`
3. Open folder: `open /Users/peleg/Peleg/guides/`

## Output

All files in `/Users/peleg/Peleg/guides/`:
- `[company-kebab]-claude-code-curriculum.html`
- `[company-kebab]-claude-code-curriculum.pdf`
- `[company-kebab]-logo.svg` (or .png)
- `peleg.png` (shared)

## Pricing Default

$8,000 + VAT with local currency equivalent in grey. Israeli VAT is 18%. Adjust per client request.

## Assets

- `assets/template.html` - full HTML template with `{{PLACEHOLDER}}` markers
- `assets/peleg.png` - instructor photo

## Quality Checklist

- [ ] All 5 pages at 1123px
- [ ] Company logo on cover
- [ ] Zero remaining `{{PLACEHOLDER}}` markers
- [ ] Examples natural for client's domain
- [ ] Instructor photo on page 5
- [ ] PDF renders 5 pages with backgrounds
- [ ] File in `/Users/peleg/Peleg/guides/`
- [ ] Folder opened in Finder
- [ ] No watermarks or attribution
