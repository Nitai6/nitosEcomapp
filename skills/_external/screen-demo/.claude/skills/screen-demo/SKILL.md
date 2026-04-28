---
name: screen-demo
description: Use when the user wants to browse a website in a cloud browser and record a polished demo video. Records browsing sessions with Steel.dev, then edits the recording with Remotion using a continuous virtual camera with spring-animated zooms, pans, and hard cuts for a Screen Studio-like result.
---

# Screen Demo - Browse, Record & Edit

Record polished product/website demo videos. Uses **Steel.dev** to browse in a cloud browser (with a large smooth cursor + click ring effect), then **Remotion** to render a continuous virtual camera over the recording - spring-animated zooms and pans, hard-cut dead time, gradient background.

---

## Assets

| File | Use |
|------|-----|
| `.claude/skills/screen-demo/assets/gradient-dark.jpg` | Dark blue gradient. Default for most demos. |
| `.claude/skills/screen-demo/assets/gradient-light.jpg` | Warm orange/teal gradient. Use for lighter/playful demos. |

Before rendering, copy the chosen gradient to `remotion/public/gradient.jpg`.

---

## Setup (run every time before doing anything else)

Before starting any demo work, run through this checklist silently. Fix anything that's missing, then move on to the process.

1. **`.env` file** - If `.env` does not exist, copy `.env.example` to `.env` and tell the user to add their `STEEL_API_KEY` from [app.steel.dev](https://app.steel.dev/settings/api-keys). Stop here until they've added it. If `.env` exists but `STEEL_API_KEY` is still `your_steel_api_key`, tell the user to fill it in and stop.

2. **Python venv** - If `.venv/` does not exist, create it: `python3 -m venv .venv`

3. **Python packages** - Check if `steel` and `playwright` are importable from the venv. If not: `.venv/bin/pip install -r requirements.txt && .venv/bin/playwright install chromium`

4. **ffmpeg** - Check if `ffmpeg` is available. If not, tell the user to install it (`brew install ffmpeg` on Mac).

5. **Remotion node_modules** - If `remotion/node_modules/` does not exist, run `cd remotion && npm install`.

Once everything passes, proceed to Step 1.

---

## Process

### Step 1: Gather the Browsing Plan

Ask the user what they want to demo. You need:

1. **URL(s)** - What website or product to show
2. **Interactions** - What to click, scroll to, hover over, type into
3. **Key moments** - What parts matter most (these become zoom targets)
4. **Label** (optional) - Short name for the demo (used for folder naming)

If the user gives a vague description like "show off Acme's landing page", translate that into specific actions:
- Navigate to the homepage
- Wait a moment for it to load
- Scroll down to the features section
- Hover over a feature card
- Click the CTA button
- etc.

### Step 2: Build the Browse Plan JSON

Create a folder at `workspace/screen-demos/{slug}/` and write the browsing plan:

```json
{
  "viewport": { "width": 1920, "height": 1080 },
  "actions": [
    { "action": "navigate", "url": "https://example.com", "wait": 2000, "label": "Homepage" },
    { "action": "scroll", "y": 600, "wait": 1500, "label": "Scroll to features" },
    { "action": "hover", "selector": ".feature-card:first-child", "wait": 1000, "label": "Hover feature 1" },
    { "action": "click", "selector": ".cta-button", "wait": 1500, "label": "Click CTA" },
    { "action": "type", "selector": "input[name=email]", "text": "demo@example.com", "wait": 800, "label": "Fill email" }
  ]
}
```

**Action types:**

| Action | Required Fields | Optional Fields | Description |
|--------|----------------|-----------------|-------------|
| `navigate` | `url` | | Go to a URL. Cursor overlay is auto-injected after each navigation. |
| `click` | `selector` | `force`, `nth` | Move cursor smoothly to element, then click. Cursor pulses + ring effect on click. |
| `scroll` | `y` | | Smooth scroll by Y pixels. Use negative for scrolling up. |
| `hover` | `selector` | | Move cursor smoothly to element and pause. |
| `type` | `selector`, `text` | `force`, `clear` | Click element, then type text character by character (80ms delay). |
| `press` | `key` | | Press a keyboard key (e.g. `"Enter"`, `"Escape"`, `"Tab"`). |
| `evaluate` | `script` | | Run arbitrary JavaScript on the page. Use for elements Playwright can't interact with. |
| `wait` | - | | Just pause. Only uses the `wait` field. |

**Optional fields:**
- `force: true` - Bypass Playwright's actionability checks. Required for sites with modal dialogs that intercept pointer events (Google Flights, etc.).
- `nth: 0` - Click the Nth matching element (0-indexed). Use when a selector matches multiple elements.
- `clear: true` - Select all text before typing (clears existing input).

Every action has an optional `wait` field (milliseconds to pause after the action, default 1000) and an optional `label` for the moments log.

**Tips:**
- Keep `wait` times tight - just enough for pages to load and content to render. Excess wait creates dead time.
- 1500-2000ms after navigations is usually sufficient
- 800-1000ms after clicks/hovers
- The cursor is a macOS-style arrow (40x56px) with a click ring effect - it's highly visible
- Use `force: true` on Google properties and other sites with modal overlays
- YouTube thumbnails (`#thumbnail`) are `aria-hidden` and invisible to Playwright - use `evaluate` with `document.querySelector('#thumbnail').click()` instead
- For YouTube channel pages, navigate to `/@handle/videos` to see the video grid
- Prefer `[data-iso='2026-02-25']` style selectors over `nth` for date pickers
- Use `press Escape` to close popups/modals before clicking other elements

### Step 3: Run the Recording

```bash
.venv/bin/python3 scripts/steel-browse.py workspace/screen-demos/{slug}/browse-plan.json workspace/screen-demos/{slug}
```

This will:
1. Create a Steel cloud browser session
2. Print the **viewer URL** (share with user so they can watch live)
3. Execute all actions with the large cursor + click ring
4. Release the session
5. Download the recording as `recording.mp4` (via HLS -> ffmpeg)
6. Save `moments.json` with timestamped action log

**Output files:**
```
workspace/screen-demos/{slug}/
├── browse-plan.json    # The input plan
├── recording.mp4       # Raw session recording
└── moments.json        # Timestamped action log
```

### Step 4: Present the Recording

Tell the user:
1. The **viewer URL** - they can replay the session in their browser
2. The **recording path** - the raw MP4 file
3. The **moments** - summarize the timestamped actions

Do NOT try to read the recording MP4 in chat (it's too large). Just tell the user the file path.

### Step 5: Build Segments (Trim Dead Time)

Read `moments.json` and identify which parts of the recording to keep. The goal is to eliminate dead time (long waits, loading screens) while preserving all the action.

**Rules for building segments:**
- Each segment is a `{ startMs, endMs }` range from the source recording
- Start each segment ~500ms before an action begins
- End each segment ~1000ms after the action completes
- If two moments are less than 2 seconds apart, merge them into one segment
- If there's a gap of 3+ seconds of dead time between moments, split into separate segments
- Always include at least 1 second after the final action

**Example:** Given moments at 0ms, 3000ms, 5000ms, 12000ms, 15000ms:
- Moments 0-5000 are close together -> Segment 1: { startMs: 0, endMs: 6000 }
- Gap of 6 seconds (5000 to 12000) -> cut this out
- Moments 12000-15000 are close -> Segment 2: { startMs: 11500, endMs: 16000 }

### Step 6: Build Camera Keyframes

Generate keyframes that define the virtual camera's position over the OUTPUT timeline. Keyframe times are relative to the assembled output (after segments are stitched and playbackRate applied), NOT the source recording.

**Computing output time from source time:**
For each moment, calculate its output time by:
1. Summing durations of previous segments (each divided by playbackRate)
2. Adding the offset within the current segment (also divided by playbackRate)

Example: moment at source 12000ms, segments [0-8000, 9000-30000], playbackRate 4:
- Segment 1 output duration: 8000/4 = 2000ms
- Offset in segment 2: (12000-9000)/4 = 750ms
- Output time: 2000 + 750 = 2750ms

**Keyframe patterns by moment type:**

**Navigate** (page load - show full viewport):
```
{ timeMs: T, zoom: 1.0, panX: 50, panY: 50 }
```

**Click** (zoom into the button/link area):
```
{ timeMs: T-800, zoom: 1.0, panX: 50, panY: 50 }     // start drift in
{ timeMs: T, zoom: 1.5, panX: clickX%, panY: clickY% } // zoomed at click
{ timeMs: T+2000, zoom: 1.0, panX: 50, panY: 50 }     // drift back out
```
Where `clickX% = (x / viewportWidth) * 100` and `clickY% = (y / viewportHeight) * 100`.

**Type** (zoom into the input field - highest zoom):
```
{ timeMs: T-500, zoom: 1.0, panX: 50, panY: 50 }       // start drift in
{ timeMs: T, zoom: 2.0, panX: fieldX%, panY: fieldY% }  // zoomed during typing
{ timeMs: T+typingDurationMs+500, zoom: 1.0, panX: 50, panY: 50 }  // drift back
```
Typing duration estimate: `len(text) * 80 + 500` ms.

**Hover** (zoom into the element):
```
{ timeMs: T-500, zoom: 1.0, panX: 50, panY: 50 }
{ timeMs: T, zoom: 1.5, panX: elemX%, panY: elemY% }
{ timeMs: T+1500, zoom: 1.0, panX: 50, panY: 50 }
```

**Scroll** (keep wide view):
```
{ timeMs: T, zoom: 1.0, panX: 50, panY: 50 }
```

**Critical smoothness rules:**
- **NEVER zoom out then right back in.** If two zoomed moments are close together (e.g. type into search bar then click a result), slide the camera directly from one zoomed spot to the next. Change pan and zoom simultaneously - don't bounce through 1.0x in between.
- **Hold zoom through searches.** When the user types + presses Enter, hold the zoom on the input until the page actually changes (the navigate/new content loads). Don't zoom out between typing and the search results.
- **Zoom out only on page transitions.** The natural time to return to wide view (1.0x) is when a new page loads - that's when the user needs to see the full viewport.
- **Slide between nearby zoomed points.** Going from 2.0x on a search bar to 1.5x on a result below it should be one smooth slide, not zoom out to 1.0x then back in to 1.5x.

**Other important rules:**
- First keyframe must be at `timeMs: 0`
- Last keyframe should match the total output duration
- If two keyframes would be within 300ms, keep only the more zoomed-in one
- The camera interpolates between keyframes with spring physics (damping: 28, stiffness: 60, mass: 0.8) - transitions are smooth and organic
- Pan values (panX, panY) are 0-100 percentages. 50/50 = center. They auto-clamp at render time to prevent showing empty space.

### Step 7: Present the Edit Plan

**Always present the camera plan to the user before rendering:**

```
Segments (source recording):
  Segment 1: 0s -> 6s (homepage + features)
  Segment 2: 11.5s -> 16s (CTA click + results)
  Playback: 4x speed
  Total output: 2.6s

Camera keyframes (output timeline):
  0.0s - Wide view (zoom 1.0x, center)
  1.1s - Zoom into CTA button (1.5x, 65% right, 35% down)
  1.5s - Hold on CTA
  2.0s - Zoom back out (1.0x, center)
  2.6s - Wide view (1.0x, center)
```

### Step 8: Set Up Gradient Background

**Always copy a gradient to Remotion before rendering.** Default to the dark gradient:

```bash
cp .claude/skills/screen-demo/assets/gradient-dark.jpg remotion/public/gradient.jpg
```

For a lighter/warmer look:
```bash
cp .claude/skills/screen-demo/assets/gradient-light.jpg remotion/public/gradient.jpg
```

### Step 9: Build the Camera Config JSON

Create `camera-config.json`:

```json
{
  "fps": 60,
  "width": 1920,
  "height": 1080,
  "source": "recording.mp4",
  "playbackRate": 4,
  "segments": [
    { "startMs": 0, "endMs": 6000 },
    { "startMs": 11500, "endMs": 16000 }
  ],
  "keyframes": [
    { "timeMs": 0, "zoom": 1.0, "panX": 50, "panY": 50 },
    { "timeMs": 1050, "zoom": 1.5, "panX": 65, "panY": 35 },
    { "timeMs": 1500, "zoom": 1.5, "panX": 65, "panY": 35 },
    { "timeMs": 2000, "zoom": 1.0, "panX": 50, "panY": 50 },
    { "timeMs": 2625, "zoom": 1.0, "panX": 50, "panY": 50 }
  ]
}
```

**Key properties:**
- `fps: 60` - Always use 60fps for smooth output
- `playbackRate: 4` - **Always use 4x speed.** These videos are for social media demos - every frame must be intentional, no downtime. Output duration = source duration / playbackRate.
- `outputGif: true` - (Optional) Also produce a GIF alongside the MP4. Uses ffmpeg two-pass palette conversion at 1280px wide, 15fps. Good for social media sharing.
- `segments` - Parts of source recording to include. Gaps are hard-cut (instant, no fade).
- `keyframes` - Camera positions over output time (after playbackRate is applied). Spring-interpolated between keyframes.
  - `zoom` - 1.0 = no zoom, 1.5 = standard action zoom, 2.0 = typing/detail zoom
  - `panX` - 0-100, horizontal focus point (50 = center)
  - `panY` - 0-100, vertical focus point (50 = center)

### Step 10: Render the Final Video

```bash
node remotion/render.mjs workspace/screen-demos/{slug}/camera-config.json workspace/screen-demos/{slug}/recording.mp4 workspace/screen-demos/{slug}/demo.mp4
```

This:
1. Copies the recording into Remotion's public/ directory
2. Bundles the Remotion project
3. Renders with continuous virtual camera - spring-animated zooms/pans, gradient background, hard-cut segments
4. Outputs the final video as `demo.mp4`
5. If `outputGif: true`, converts to `demo.gif` using ffmpeg (1280px wide, 15fps, two-pass palette)

Progress is printed to stderr. Rendering at 60fps takes 2-8 minutes depending on video length.

**Important:** If render fails with module errors, run `cd remotion && npm install` first.

### Step 11: Present the Output

Tell the user:
1. The **output path** - `workspace/screen-demos/{slug}/demo.mp4`
2. The **GIF path** (if `outputGif: true`) - `workspace/screen-demos/{slug}/demo.gif`
3. The **file sizes** for both outputs
4. Offer to adjust - change keyframes, zoom targets, segment boundaries, re-render

**Final output structure:**
```
workspace/screen-demos/{slug}/
├── browse-plan.json      # Input browsing plan
├── recording.mp4         # Raw recording
├── moments.json          # Action timestamps
├── camera-config.json    # Segments + keyframes
├── demo.mp4              # Final polished video
└── demo.gif              # GIF version (only when outputGif: true)
```

---

## Defaults (Always Apply)

1. **4x playback speed** - Always set `"playbackRate": 4`. These are social media demos - every frame must be intentional, zero downtime
2. **Gradient background** - Copy a gradient from `assets/` to `remotion/public/gradient.jpg` before every render
3. **Zooms on key moments** - Always add zoom keyframes for clicks, typing, and hover reveals
4. **Aggressive segment trimming** - Cut out ALL dead time between actions. If nothing meaningful is happening on screen, cut it
5. **Spring camera** - All camera movements use spring physics (damping: 28, stiffness: 60, mass: 0.8)
6. **60fps** - Always render at 60fps for smooth output
7. **Hard cuts** - Dead time is cut instantly between segments, no fade transitions

---

## Requirements

| Dependency | Install |
|-----------|---------|
| `STEEL_API_KEY` | Add to `.env` - get from [app.steel.dev](https://app.steel.dev/settings/api-keys) |
| `steel-sdk` | `pip install steel-sdk` |
| `playwright` | `pip install playwright && playwright install chromium` |
| `ffmpeg` | `brew install ffmpeg` |
| Node.js | Required for Remotion - install from [nodejs.org](https://nodejs.org/) |
| Remotion | `cd remotion && npm install` |

---

## Troubleshooting

**Steel session fails to connect:** Check your `STEEL_API_KEY` in `.env`. Free tier allows 5 concurrent sessions and 500 daily requests.

**Recording download fails (HLS not ready):** Steel recordings take 5-30 seconds to process after session release. The script retries automatically with backoff (up to 300s timeout). If all retries fail, the viewer URL still works - user can screen-record it manually.

**Remotion render fails with module errors:** Run `cd remotion && npm install` to install dependencies. All `@remotion/*` packages must be at the exact same version.

**Cursor not visible in recording:** The cursor is injected via JavaScript after each `navigate` action. If a page blocks JS injection (CSP), the native browser cursor will still be recorded but at default size.

**Video too long / too short:** Adjust the `wait` values in the browsing plan. More wait = longer recording = more to work with when building segments.

**Gradient not showing:** Make sure `remotion/public/gradient.jpg` exists before rendering. Copy from `.claude/skills/screen-demo/assets/`.

**Render takes very long at 60fps:** 60fps doubles the frame count. For very long demos (60s+), consider reducing to 30fps by setting `"fps": 30` in the camera config.

**Render fails with ENOSPC (no space left):** Remotion webpack bundles accumulate in temp directories. Clean them up: `rm -rf /private/var/folders/*/*/T/remotion-webpack-bundle-*`

**Playwright can't click an element (aria-hidden, modal intercept):** Use `force: true` for modal intercepts. For truly hidden elements (like YouTube `#thumbnail`), use the `evaluate` action to click via JavaScript instead.
