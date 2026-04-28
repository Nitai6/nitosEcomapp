---
name: selectors
description: Selector strategies for reliable element targeting across different websites
metadata:
  tags: selectors, css, xpath, aria, reliability, fragile
---

# Selector Strategies

Choosing the right selector is critical for reliable browse plans. Selectors that work today may break tomorrow if a site changes its DOM.

## Reliability Hierarchy

From most to least reliable:

1. **Semantic attributes** - `[name='q']`, `[role='listbox']`, `[aria-label='Search']`
2. **Data attributes** - `[data-iso='2026-03-15']`, `[data-testid='submit']`
3. **Standard HTML** - `input[type='email']`, `textarea`, `h3`
4. **ID selectors** - `#rso`, `#search` (stable on established sites)
5. **Structural** - `ul li:first-child`, `:nth-child(2)`
6. **Custom attributes** - `[jsname='vLv7Lb']` (site-specific, semi-stable)
7. **Class names** - `.some-class` (frequently obfuscated, least reliable)

## Comma Selectors for Fallbacks

When a site uses different elements across versions or A/B tests, combine selectors:

```
textarea[name='q'], input[name='q']
```

Playwright tries each selector in order and uses the first match. This handles cases where Google switches between `<textarea>` and `<input>` for the search bar.

## The `nth` Parameter

Use `nth` when a selector matches multiple elements:

```json
{ "action": "click", "selector": "#rso h3", "force": true, "nth": 0 }
```

- `nth: 0` = first match
- `nth: 1` = second match

The `nth` parameter in the browse plan maps to Playwright's `.locator(selector).nth(n)`.

**When to use nth vs. more specific selectors:** Use `nth` for lists of similar items (search results, menu items). Use more specific selectors when individual elements have distinguishing attributes.

## Avoiding Fragile Selectors

**Don't use:**
- Generated class names (`.css-1a2b3c`, `.MuiButton-root`)
- Deep nesting (`.container > .wrapper > .inner > .content > span`)
- Text content matching via CSS (Playwright supports `:has-text()` but it's fragile)

**Do use:**
- Attribute selectors that reflect the element's purpose
- Short paths from a stable ancestor
- Combinations of tag + attribute

## Site-Specific Selector Patterns

### Google (Search, Flights, Maps)
```
textarea[name='q'], input[name='q']     # Search bar
#rso h3                                  # Organic result titles
ul[role='listbox'] li:first-child        # Autocomplete dropdown
[data-iso='2026-03-15']                  # Date picker
button[aria-label='Search']              # Search button
```

### YouTube
```
#thumbnail                               # Video thumbnails (aria-hidden - use evaluate)
#search-input, input#search              # Search bar
ytd-video-renderer                       # Video cards
```

### Generic SPA Patterns
```
button[type='submit']                    # Form submit
[placeholder]                            # Any input with placeholder
[contenteditable='true']                 # Rich text editors
a[href*='target-path']                   # Links containing a path
```

## Testing Selectors

Before committing to a selector in a browse plan, verify it in the browser DevTools console:

```javascript
document.querySelectorAll('#rso h3').length  // How many matches?
document.querySelector('#rso h3').textContent // What does it contain?
```

The `evaluate` action can be used to debug selectors during a Steel session:

```json
{ "action": "evaluate", "script": "JSON.stringify(Array.from(document.querySelectorAll('#rso h3')).map(el => el.textContent))", "wait": 1000, "label": "Debug: list result titles" }
```
