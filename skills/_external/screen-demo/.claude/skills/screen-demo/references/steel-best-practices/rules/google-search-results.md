---
name: google-search-results
description: Recording a Google Search and clicking on an organic result with Steel + Playwright
metadata:
  tags: google, search, click, results, selectors, force
---

# Google Search - Clicking Organic Results

Recording a Google Search and clicking on a result is one of the trickiest Steel demos because Google has aggressive bot detection and a constantly-changing DOM. This rule covers the reliable patterns.

## The Browse Plan Pattern

```json
{
  "viewport": { "width": 1920, "height": 1080 },
  "actions": [
    { "action": "navigate", "url": "https://www.google.com", "wait": 3000, "label": "Google homepage" },
    { "action": "click", "selector": "textarea[name='q'], input[name='q']", "force": true, "wait": 500, "label": "Focus search bar" },
    { "action": "type", "selector": "textarea[name='q'], input[name='q']", "text": "your search query", "force": true, "wait": 1500, "label": "Type search query" },
    { "action": "press", "key": "Enter", "wait": 5000, "label": "Submit search" },
    { "action": "click", "selector": "#rso h3", "force": true, "nth": 0, "wait": 3000, "label": "Click first result" }
  ]
}
```

## Key Techniques

### Search Bar Selector

Google has switched between `<input>` and `<textarea>` for the search bar. Use a comma selector to handle both:

```
textarea[name='q'], input[name='q']
```

Always use `force: true` when interacting with Google's search bar - modal overlays intercept pointer events.

### Submitting the Search

Press Enter rather than clicking the search button. The search button selector changes frequently and is sometimes hidden behind autocomplete overlays.

```json
{ "action": "press", "key": "Enter", "wait": 5000, "label": "Submit search" }
```

Use a long wait (5000ms) after submitting - Google results take time to fully render, especially with JavaScript-heavy features like Knowledge Panels and People Also Ask.

### Clicking a Result by Position

Use `#rso h3` with the `nth` parameter to click by position. Every organic result has an `<h3>` title inside the `#rso` container.

```json
{ "action": "click", "selector": "#rso h3", "force": true, "nth": 0, "wait": 3000, "label": "Click first result" }
```

- `nth: 0` = first result
- `nth: 1` = second result
- `nth: 2` = third result

**Warning:** Featured snippets, "People Also Ask" boxes, and other rich features can shift which `nth` index maps to which actual organic result. If precision matters, use domain-based selection instead.

### Clicking a Result by Domain

When you know which domain you want to click, use an href selector:

```json
{ "action": "click", "selector": "#search a[href*='stackoverflow.com'] h3", "force": true, "wait": 3000, "label": "Click Stack Overflow result" }
```

This is more reliable than position-based selection because it works regardless of featured snippets or ad placements.

### Clicking a Result by JavaScript (Fallback)

If Playwright's click fails (aria-hidden elements, overlay interference), use `evaluate`:

```json
{
  "action": "evaluate",
  "script": "document.querySelector('#rso h3').closest('a').click()",
  "wait": 3000,
  "label": "Click first result via JS"
}
```

For domain-based JS fallback:

```json
{
  "action": "evaluate",
  "script": "document.querySelector('#search a[href*=\"example.com\"]').click()",
  "wait": 3000,
  "label": "Click example.com result via JS"
}
```

## Wait After Navigation

After clicking a search result, the browser navigates to the target page. Wait 3000ms minimum for the destination page to load, then the cursor overlay will be re-injected on the next `navigate` action.

**Important:** Clicking a search result does NOT trigger a `navigate` action - it's a regular page navigation via link click. The cursor overlay from the Google page will be lost. If you need the cursor on the destination page, add a separate `navigate` action to the same URL, or add an `evaluate` action to re-inject the cursor script.

## Handling Autocomplete

Google shows autocomplete suggestions as you type. For demo purposes, you may want to:

1. **Dismiss autocomplete before pressing Enter** - press Escape first:
   ```json
   { "action": "press", "key": "Escape", "wait": 500, "label": "Dismiss autocomplete" },
   { "action": "press", "key": "Enter", "wait": 5000, "label": "Submit search" }
   ```

2. **Click an autocomplete suggestion** instead of pressing Enter:
   ```json
   { "action": "click", "selector": "ul[role='listbox'] li:first-child", "force": true, "wait": 5000, "label": "Select first suggestion" }
   ```

## Cookie Consent Dialog

Steel sessions may spawn in regions where Google shows a cookie consent dialog. If this blocks interaction:

```json
{ "action": "evaluate", "script": "document.querySelector('button[id*=\"agree\"], button[id*=\"accept\"], form[action*=\"consent\"] button')?.click()", "wait": 2000, "label": "Dismiss consent dialog" }
```

Place this right after the initial `navigate` to Google, before any other interactions.

## Bot Detection

Google has strong bot detection. To reduce detection risk:

- Use `solveCaptcha: true` when creating the Steel session (requires modifying `steel-browse.py`)
- Use `useProxy: true` for residential IP rotation
- Keep typing delays natural (the default 80ms per character in `steel-browse.py` is good)
- Avoid navigating directly to `google.com/search?q=...` - type the query instead, as direct search URL navigation is a stronger bot signal
- Don't run too many sessions in rapid succession

## Complete Example: Search and Click

See the full example browse plan at [assets/google-search-click-result.json](../assets/google-search-click-result.json).
