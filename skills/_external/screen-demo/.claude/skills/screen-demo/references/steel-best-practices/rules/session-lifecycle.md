---
name: session-lifecycle
description: Creating, connecting, recording, and releasing Steel browser sessions
metadata:
  tags: session, create, release, record, lifecycle, api
---

# Steel Session Lifecycle

A Steel session goes through four phases: create, connect, browse, release. Recording happens automatically throughout.

## Create

```python
from steel import Steel

client = Steel(steel_api_key=api_key)
session = client.sessions.create(api_timeout=300000)
```

The session object contains:
- `session.id` - Unique session identifier (used for HLS download)
- `session.websocket_url` - CDP WebSocket URL for Playwright/Puppeteer connection
- `session.session_viewer_url` - URL to watch/replay the session in a browser

### Optional Parameters

```python
session = client.sessions.create(
    api_timeout=300000,       # Timeout in ms (5 minutes)
    use_proxy=True,           # Rotate residential IPs (helps with bot detection)
    solve_captcha=True,       # Auto-solve CAPTCHAs (useful for Google)
)
```

**Note:** The current `steel-browse.py` script does not pass `use_proxy` or `solve_captcha`. For Google Search demos, consider adding these parameters to reduce CAPTCHA risk.

## Connect (Playwright)

```python
from playwright.sync_api import sync_playwright

pw = sync_playwright().start()
cdp_url = f"{session.websocket_url}&apiKey={api_key}"
browser = pw.chromium.connect_over_cdp(cdp_url)
```

**Critical:** Use the existing browser context, don't create a new one:

```python
context = browser.contexts[0]  # Must use existing context for recording
page = context.new_page()
```

Creating a new context (`browser.new_context()`) will break recording because Steel records the default context.

## Connect (Puppeteer / Node.js)

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://connect.steel.dev?apiKey=${apiKey}&sessionId=${session.id}`,
});
```

The same context rule applies - use the existing page or create pages within the existing context.

## Browse

Set viewport and execute actions:

```python
page.set_viewport_size({"width": 1920, "height": 1080})
page.goto("https://example.com", wait_until="domcontentloaded", timeout=30000)
```

Steel sessions run real Chrome instances (not headless). This means:
- Full GPU rendering and compositing
- WebGL, WebRTC, and other APIs work normally
- The browser fingerprint is closer to a real user than local Playwright

## Recording

Recording is automatic for all Steel sessions. There is no `record: true` parameter needed.

- Captures at 25fps via WebRTC-based OS-level screen recording
- Records everything visible in the browser viewport
- The recording becomes available as HLS after the session is released
- Processing takes 5-30 seconds after release

## Release

Always release the session when done, even if errors occur:

```python
try:
    # ... browse ...
finally:
    client.sessions.release(session.id)
```

After release:
1. The session stops and resources are freed
2. Recording processing begins (5-30 second delay)
3. The HLS endpoint becomes available for download
4. The viewer URL switches from live to replay mode

### Pause Before Release

Add a 2-second wait before closing the browser to ensure the final actions are captured in the recording:

```python
page.wait_for_timeout(2000)
browser.close()
pw.stop()
# Then release
client.sessions.release(session.id)
```

## Limits

- Free tier: 5 concurrent sessions, 500 daily requests
- Sessions auto-timeout after 5 minutes (configurable via `api_timeout`)
- Max viewport: limited by the cloud instance's display (1920x1080 is safe)
