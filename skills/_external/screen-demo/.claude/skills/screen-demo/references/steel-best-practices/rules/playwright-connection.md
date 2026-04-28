---
name: playwright-connection
description: Connecting Playwright to Steel sessions via CDP, viewport setup, and context management
metadata:
  tags: playwright, cdp, connection, viewport, context, browser
---

# Playwright Connection

Steel provides a Chrome DevTools Protocol (CDP) endpoint. Playwright connects to it using `connect_over_cdp`.

## Connection Setup

```python
from playwright.sync_api import sync_playwright

pw = sync_playwright().start()
cdp_url = f"{session.websocket_url}&apiKey={api_key}"
browser = pw.chromium.connect_over_cdp(cdp_url)
```

The CDP URL format: `{websocket_url}&apiKey={api_key}`

## Context Rule

**Always use the existing browser context.** Never create a new one.

```python
# CORRECT - use existing context
context = browser.contexts[0]
page = context.new_page()

# WRONG - breaks recording
context = browser.new_context()
page = context.new_page()
```

Steel records the default context. Creating a new context opens a separate, unrecorded session.

## Viewport

Set the viewport to match your desired recording resolution:

```python
page.set_viewport_size({"width": 1920, "height": 1080})
```

Common sizes:
- `1920x1080` - Standard HD (default, recommended for most demos)
- `1280x720` - Smaller file size, still looks good
- `2560x1440` - Higher quality, larger files

The viewport size in the browse plan JSON should match:

```json
{ "viewport": { "width": 1920, "height": 1080 } }
```

## Navigation

Use `wait_until="domcontentloaded"` for faster navigation. `networkidle` is unreliable on sites with persistent connections (analytics, WebSockets).

```python
page.goto(url, wait_until="domcontentloaded", timeout=30000)
```

## Timeouts

- Navigation timeout: 30000ms (30 seconds) handles slow page loads
- Element wait timeout: 10000ms (10 seconds) for selectors
- Action wait: varies by action type (see browse plan `wait` field)

## Cursor Movement

Playwright's `page.mouse.move()` with `steps` creates smooth cursor movement for the recording:

```python
box = element.bounding_box()
if box:
    page.mouse.move(
        box["x"] + box["width"] / 2,
        box["y"] + box["height"] / 2,
        steps=30,  # 30 intermediate points for smooth motion
    )
    page.wait_for_timeout(300)  # Pause before clicking
```

Step counts:
- `steps=30` - Standard smooth movement (clicks)
- `steps=35` - Slightly smoother (hovers)
- `steps=25` - Slightly faster (type actions, moving to input field)

## Error Handling

Actions should be wrapped in try/except to allow the demo to continue even if one action fails:

```python
try:
    element = page.wait_for_selector(selector, timeout=10000)
    element.click(force=force)
except Exception as e:
    print(f"SKIPPED ({label}): {e}")
```

This is already handled by the `execute_actions` function in `steel-browse.py`.

## Cleanup

Always close the browser and stop Playwright before releasing the session:

```python
page.wait_for_timeout(2000)  # Let final action be recorded
browser.close()
pw.stop()
# Then: client.sessions.release(session.id)
```
