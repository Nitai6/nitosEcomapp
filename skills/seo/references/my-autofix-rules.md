# Auto-fix Rules

What the agent is allowed to fix automatically vs flag-only.

## Auto-fix (no owner confirmation required)

| Issue | Action |
|---|---|
| Missing alt text on image | Generate alt from product/post title + image surrounding context (≤125 chars, descriptive, keyword-aware) |
| Missing meta description | Generate from first 150 chars of body, include primary keyword |
| Missing schema (Product, Article, FAQPage, BreadcrumbList) | Inject JSON-LD per Schema.org spec |
| Image >300KB | Compress (WebP if possible), preserve aspect, replace via Shopify MCP |
| Image filename has spaces or no keyword | Rename: `dash-separated-keyword.{ext}` |
| Missing `lang` attribute on `<html>` | Set per brand `country` (e.g., `he`, `en`) |
| Missing canonical link | Add self-canonical |
| Robots `noindex` on a money page (Product/Collection) | **Flag, don't fix** — too risky |

## Flag-only (write to alerts, don't act)

- Title tag changes
- H1 changes (renames)
- URL structure changes / redirects
- Canonical pointing to a different page (not self)
- Removing/adding pages
- Broken internal links (suggest replacement, queue for owner confirm)
- Thin content pages (<300 words on a money page)
- Duplicate content / cannibalization
- Performance fixes that need code (defer JS, critical CSS extraction)
- Anything affecting checkout, cart, or legal pages

## Logging

Every auto-fix → row in Supabase `seo_autofix_log`:
```
{ page_url, issue, fix_action, before, after, fixed_at }
```

If a fix breaks Core Web Vitals on the next audit → revert + flag.

## Rate limit

Max 30 auto-fixes per audit run (avoid mass-changes that look spammy to Google).
