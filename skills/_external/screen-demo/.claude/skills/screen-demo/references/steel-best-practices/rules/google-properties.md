---
name: google-properties
description: General patterns for interacting with all Google properties (Flights, Maps, Search, etc.)
metadata:
  tags: google, force, modal, flights, maps, selectors
---

# Google Properties - General Patterns

All Google web properties (Search, Flights, Maps, Docs, etc.) share common interaction challenges. These patterns apply across the board.

## Always Use `force: true`

Google uses modal overlay divs that intercept pointer events. Playwright's actionability checks will fail without `force: true` on clicks and type actions.

```json
{ "action": "click", "selector": "button[aria-label='Search']", "force": true, "wait": 1500 }
```

This applies to:
- Click actions
- Type actions
- Any action where Playwright checks element visibility/interactability

Hover and scroll actions don't need `force` since they don't use Playwright's actionability checks.

## Wait 3000ms After Navigation

Google pages load JavaScript progressively. Elements appear in the DOM before they're interactive. Always wait 3000ms after navigating to a Google property.

```json
{ "action": "navigate", "url": "https://www.google.com/travel/flights", "wait": 3000, "label": "Google Flights" }
```

Compare this to most other sites where 1500-2000ms is sufficient.

## Dropdown / Autocomplete Pattern

Google's autocomplete dropdowns (used in Search, Flights, Maps) follow a consistent pattern:

1. Type into the input field
2. Wait for suggestions to appear (1500ms)
3. Click the first suggestion using `ul[role='listbox'] li:first-child`

```json
{ "action": "type", "selector": "input[role='combobox']", "text": "Boston", "force": true, "clear": true, "wait": 1500 },
{ "action": "click", "selector": "ul[role='listbox'] li:first-child", "force": true, "wait": 1000 }
```

Use `clear: true` when replacing existing text in a pre-filled input.

## Date Pickers

Google date pickers use `data-iso` attributes. Always prefer these over positional selectors:

```json
{ "action": "click", "selector": "[data-iso='2026-03-15']", "force": true, "wait": 1200 }
```

Never use `nth` or `:nth-child()` for date selection - the grid layout changes based on the month and screen size.

## Closing Popups and Modals

Press Escape to dismiss any open popup, modal, or date picker before clicking other elements:

```json
{ "action": "press", "key": "Escape", "wait": 1000, "label": "Close popup" }
```

Google frequently traps focus inside modals. If Escape doesn't work, try clicking a neutral area of the page first.

## Dynamic `jsname` Attributes

Many Google elements use `jsname` attributes (e.g., `button[jsname='vLv7Lb']`). These are somewhat stable within a single product but can change across deployments. Prefer `aria-label` or structural selectors when available:

```
button[aria-label='Search']     (preferred - semantic)
button[jsname='vLv7Lb']         (OK - product-specific but less stable)
button.some-obfuscated-class    (avoid - changes frequently)
```

## Google Property-Specific Notes

| Property | URL | Key Challenges |
|----------|-----|----------------|
| Search | `google.com` | Bot detection, dynamic result DOM, cookie consent |
| Flights | `google.com/travel/flights` | Complex form, date picker, combobox inputs |
| Maps | `google.com/maps` | Canvas-based map, limited clickable selectors |
| YouTube | `youtube.com` | `aria-hidden` thumbnails, need `evaluate` for clicks |
| Docs | `docs.google.com` | Auth required, canvas-based editor |

For Google Search specifics, see [google-search-results.md](./google-search-results.md).
