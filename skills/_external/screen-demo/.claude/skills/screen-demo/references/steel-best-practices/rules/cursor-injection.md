---
name: cursor-injection
description: Custom macOS-style cursor overlay with click ring effect for polished recordings
metadata:
  tags: cursor, click, ring, overlay, javascript, inject
---

# Cursor Injection

Steel recordings capture the native browser cursor, which is small and hard to see in demos. The `steel-browse.py` script injects a custom macOS-style arrow cursor with a click ring effect.

## How It Works

After each `navigate` action, a JavaScript snippet is evaluated on the page that:

1. Hides the native cursor (`* { cursor: none !important; }`)
2. Creates a large SVG arrow cursor (40x56px) positioned with `position: fixed`
3. Creates an expanding ring element for click feedback
4. Attaches `mousemove`, `mousedown`, and `mouseup` listeners

## Cursor Appearance

- **Arrow:** White macOS-style arrow with black outline, 40x56px
- **Shadow:** Drop shadow for depth (`drop-shadow(0 2px 4px rgba(0,0,0,0.3))`)
- **Movement:** CSS transition with 60ms ease-out for slight smoothing
- **Z-index:** `2147483647` (maximum) so it always appears on top

## Click Ring Effect

When the mouse button is pressed:
1. Cursor scales to 90% (press effect)
2. A 44px circle appears at the click point with 60% opacity
3. The ring expands to 2.5x scale while fading out over 400ms
4. On mouse up, cursor returns to 100% scale

This provides clear visual feedback in the recording that a click occurred.

## When Cursor Is Lost

The cursor overlay is injected via `page.evaluate()` after each `navigate` action. It will be lost when:

- A link click navigates to a new page (not a `navigate` action)
- An SPA performs a full page reload
- The page has strict Content Security Policy (CSP) that blocks inline scripts

### Re-injecting After Link Clicks

If you click a link that navigates away (like a Google search result), the cursor overlay is lost on the destination page. To re-inject:

**Option 1:** Add a `navigate` action to the destination URL after the click:
```json
{ "action": "click", "selector": "#rso h3", "force": true, "nth": 0, "wait": 3000, "label": "Click result" },
{ "action": "navigate", "url": "https://expected-destination.com", "wait": 2000, "label": "Re-inject cursor" }
```

**Option 2:** Add an `evaluate` action with the cursor injection script:
```json
{ "action": "click", "selector": "#rso h3", "force": true, "nth": 0, "wait": 3000, "label": "Click result" },
{ "action": "evaluate", "script": "/* cursor injection JS */", "wait": 500, "label": "Re-inject cursor" }
```

Option 1 is simpler but causes a page reload. Option 2 preserves the page state but requires duplicating the cursor JS.

### CSP Restrictions

If a page blocks the cursor injection (strict CSP), the native browser cursor will still be recorded - it's just smaller. There's no workaround for this, but it's rare in practice.

## Customization

The cursor is defined inline in `steel-browse.py` as the `CURSOR_JS` constant. To modify:

- **Size:** Change the SVG `width`/`height` attributes and `viewBox`
- **Color:** Change the `fill` and `stroke` on the path element
- **Click ring size:** Change the ring's `width`/`height` and the scale transform
- **Click ring color:** Change the `border` color on the ring element
- **Smoothness:** Change the CSS transition duration (currently 60ms)
